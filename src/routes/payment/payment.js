import { Router } from "express";
import pool from "../../database.js";
import { protectRoute } from "../../middleware/auth.js";
import fetch from "node-fetch";
import { sendOrderEmails } from "../../services/emailService.js";
import { getCartTotals } from "../../services/orderTotals.js";
import { insertOrderItems, getOrderItemsWithSelections, decrementStockForOrder } from "../../services/orderItems.js";
import { rejectPackOnTilopay } from "../../services/packGuards.js";
import { verifyTilopayReturn } from "../../services/tilopayVerify.js";

const router = Router();

const loginTilopay = async () => {
  try {
    const loginPayload = {
      apiuser: process.env.TILOPAY_API_USER,
      password: process.env.TILOPAY_API_PASSWORD,
    };

    const response = await fetch("https://app.tilopay.com/api/v1/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginPayload),
    });

    if (!response.ok) {
      throw new Error(`Error en login Tilopay: ${response.status}`);
    }

    const data = await response.json();
    return data.token || data.access_token || data.auth_token || data;
  } catch (error) {
    console.error("Error en login Tilopay:", error.message);
    throw error;
  }
};

router.post("/process", protectRoute, async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount: clientAmount, phone, address, city, postal_code, country } =
      req.body;

    // El monto se calcula en el servidor desde el carrito en BD.
    // Lo que manda el navegador NO se usa para cobrar.
    const totals = await getCartTotals(userId);

    if (totals.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Carrito vacío o datos incompletos",
      });
    }

    // El pack va solo por PayPal. Se rechaza ACÁ, antes de loginTilopay(),
    // para no crear un pago remoto que después haya que abandonar.
    const packRechazo = rejectPackOnTilopay(totals.hasPack);
    if (packRechazo) {
      return res.status(packRechazo.status).json({
        success: false,
        code: packRechazo.code,
        message: packRechazo.message,
      });
    }

    // Solo avisamos si el total mostrado al cliente no coincide con el real
    // (bundle viejo cacheado, o manipulación). No cortamos el cobro: un 400 acá
    // rompería a cualquier usuario con una pestaña vieja abierta.
    if (clientAmount != null && Math.abs(Number(clientAmount) - totals.total) > 1) {
      console.warn(
        `⚠ Monto del cliente (${clientAmount}) != monto calculado (${totals.total}) para el usuario ${userId}`,
      );
    }

    const [users] = await pool.query(
      "SELECT email, name FROM users WHERE id = ?",
      [userId],
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    const user = users[0];
    const orderReference = `ORDER_${userId}_${Date.now()}`;

    const tilopayToken = await loginTilopay();

    const callbackUrl =
      process.env.CALLBACK_URL || `${process.env.PUBLIC_URL || "http://localhost:3000"}/checkout/success`;

   
    const processPaymentPayload = {
      key: process.env.TILOPAY_API_KEY,
      amount: totals.total.toFixed(2),
      currency: "CRC",
      orderNumber: orderReference,
      redirect: callbackUrl,

      // Datos de facturación (requeridos)
      billToFirstName: user.name.split(" ")[0] || "Cliente",
      billToLastName: user.name.split(" ").slice(1).join(" ") || "Comprador",
      billToAddress: address || "No especificada",
      billToAddress2: "Apartado",
      billToCity: city || "San José",
      billToState: "CR-SJ",
      billToZipPostCode: postal_code || "00000",
      billToCountry: "CR",
      billToTelephone: phone || "00000000",
      billToEmail: user.email,

      // Datos de envío (opcionales pero recomendados)
      shipToFirstName: user.name.split(" ")[0] || "Cliente",
      shipToLastName: user.name.split(" ").slice(1).join(" ") || "Comprador",
      shipToAddress: address || "No especificada",
      shipToCity: city || "San José",
      shipToState: "CR-SJ",
      shipToZipPostCode: postal_code || "00000",
      shipToCountry: "CR",
      shipToTelephone: phone || "00000000",

      // Otros parámetros requeridos
      capture: 1,
      subscription: 0,
      platform: "SIRCOF Cafe",
      returnData: orderReference,
    };

    const tilopayResponse = await fetch(
      "https://app.tilopay.com/api/v1/processPayment",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tilopayToken}`,
        },
        body: JSON.stringify(processPaymentPayload),
      },
    );

    if (!tilopayResponse.ok) {
      const error = await tilopayResponse.text();
      console.error("Error de Tilopay:", error);
      throw new Error(error || "Error en Tilopay");
    }

    const tilopayData = await tilopayResponse.json();

    // Transacción: una orden sin sus items es una venta cobrada que no se
    // puede despachar. Antes esto eran dos queries sueltas.
    const conn = await pool.getConnection();
    let orderId;

    try {
      await conn.beginTransaction();

      const [orderResult] = await conn.query(
        `INSERT INTO orders (user_id, total, subtotal, shipping_cost, status, tilopay_reference, tilopay_order_number, payment_method, phone, address, city, postal_code, country)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          totals.total, // incluye el envío
          totals.subtotal,
          totals.shippingCost,
          "pending",
          orderReference,
          tilopayData.id || tilopayData.orderNumber,
          "tilopay",
          phone,
          address || null,
          city || null,
          postal_code || null,
          country || null,
        ],
      );

      orderId = orderResult.insertId;

      // Precios de la BD, no los del body del cliente.
      await insertOrderItems(conn, orderId, totals.items);

      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }

    res.json({
      success: true,
      paymentUrl: tilopayData.url,
      orderId,
      orderReference,
      tilopayLinkId: tilopayData.id,
    });
  } catch (error) {
    if (error.code === 'SIN_STOCK') {
      return res.status(400).json({ success: false, code: 'SIN_STOCK', message: 'Uno o más productos no tienen stock suficiente', items: error.items });
    }
    console.error("Error procesando pago:", error.message);
    res.status(500).json({
      success: false,
      message: "Error procesando el pago",
    });
  }
});

// Confirmar pago exitoso y enviar emails
router.post("/confirm", protectRoute, async (req, res) => {
  try {
    const userId = req.user.id;
    // orderHash/auth/tpt vienen de la URL de retorno de Tilopay; son la PRUEBA
    // del pago. Sin ellos, code="1" no significa nada.
    const { orderNumber, code, auth, tpt, orderHash } = req.body;

    // Solo procesar si el pago fue exitoso (code === '1' en Tilopay)
    if (code !== '1') {
      return res.status(400).json({
        success: false,
        message: "El pago no fue aprobado",
      });
    }

    if (!orderNumber) {
      return res.status(400).json({
        success: false,
        message: "Número de orden requerido",
      });
    }

    // Buscar la orden en la BD (incluye el email del dueño para el hash)
    const [orders] = await pool.query(
      `SELECT o.id, o.total, o.subtotal, o.shipping_cost, o.status, o.tilopay_reference, o.phone, o.address, o.city, o.state, o.postal_code, o.country, o.country_code, u.name AS user_name, u.email AS user_email
       FROM orders o JOIN users u ON o.user_id = u.id
       WHERE o.tilopay_reference = ? AND o.user_id = ?`,
      [orderNumber, userId],
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Orden no encontrada",
      });
    }

    const order = orders[0];

    // Evitar reprocesar si ya fue confirmada
    if (order.status === 'paid') {
      return res.json({
        success: true,
        message: "La orden ya fue confirmada previamente",
        alreadyConfirmed: true,
      });
    }

    // === VERIFICACIÓN DE LA FIRMA DE TILOPAY ===
    // Recalcula el OrderHash con los secretos del servidor y el total GUARDADO
    // (no el que manda el cliente). Si no coincide, el "pago" es falso.
    const verificacion = verifyTilopayReturn({
      orderHash,
      tpt,
      orderNumber,
      amount: parseFloat(order.total),
      code,
      auth,
      email: order.user_email,
    });

    if (!verificacion.ok) {
      console.warn(
        `⚠ Confirmación de Tilopay rechazada (${verificacion.reason}) para la orden ${orderNumber}, usuario ${userId}`,
      );
      return res.status(400).json({
        success: false,
        message: "No se pudo verificar el pago con Tilopay",
      });
    }

    // Actualización atómica: solo pasa a 'paid' si sigue 'pending'.
    // Dos confirmaciones en paralelo -> solo una gana -> un solo email.
    const [upd] = await pool.query(
      "UPDATE orders SET status = 'paid', tilopay_order_number = ? WHERE id = ? AND status = 'pending'",
      [tpt || order.tilopay_order_number || null, order.id],
    );

    if (upd.affectedRows === 0) {
      // Otra petición concurrente ya la confirmó.
      return res.json({
        success: true,
        message: "La orden ya fue confirmada previamente",
        alreadyConfirmed: true,
      });
    }

    // Descontar stock ahora que el pago está confirmado. El pago ya se cobró,
    // así que si algo quedó sin stock (sobreventa) no se rechaza: se loguea
    // para resolverlo a mano.
    const sobreventa = await decrementStockForOrder(pool, order.id);
    if (sobreventa.length > 0) {
      console.error(`⚠ SOBREVENTA en la orden ${order.id}:`, JSON.stringify(sobreventa));
    }

    // Datos del usuario (ya cargados en el JOIN de arriba)
    const users = [{ name: order.user_name, email: order.user_email }];

    // Obtener items de la orden, con el desglose del pack si lo hay
    const orderItems = await getOrderItemsWithSelections(order.id);

    if (users.length > 0) {
      const user = users[0];
      const orderData = {
        orderId: order.tilopay_reference,
        products: orderItems,
        total: parseFloat(order.total),
        subtotal: parseFloat(order.subtotal),
        shippingCost: parseFloat(order.shipping_cost),
        clientName: user.name,
        clientEmail: user.email,
        clientPhone: order.phone,
        address: order.address,
        city: order.city,
        state: order.state,
        postalCode: order.postal_code,
        country: order.country,
      };

      try {
        await sendOrderEmails(orderData);
        console.log("✓ Emails enviados después de pago confirmado");
      } catch (emailError) {
        console.error("⚠ Error al enviar emails:", emailError.message);
      }
    }

    res.json({
      success: true,
      message: "Pago confirmado y emails enviados",
    });
  } catch (error) {
    console.error("Error confirmando pago:", error.message);
    res.status(500).json({
      success: false,
      message: "Error confirmando el pago",
    });
  }
});

router.post("/webhook", async (req, res) => {
  try {
    // Por ahora simplemente respondemos con éxito
    // Tilopay envía datos encriptados en gc-tpay-call
    // Pendiente: Contactar a Tilopay para obtener la clave de desencriptación

    res.json({
      success: true,
      message: "Webhook recibido correctamente",
    });
  } catch (error) {
    console.error("❌ Error en webhook:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
