import { Router } from "express";
import pool from "../database.js";
import { verifyToken } from "../lib/jwt.js";
import fetch from "node-fetch";
import { sendOrderEmails } from "../services/emailService.js";

const router = Router();

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token requerido" });
    }

    const decoded = verifyToken(token);
    req.userId = decoded.id;
    next();
  } catch (error) {
    console.error("Error verificando token:", error);
    return res.status(401).json({ message: "Token inválido" });
  }
};

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

router.post("/process", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { cartItems, amount, phone, address, city, postal_code, country } =
      req.body;

    if (!cartItems || !amount || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Carrito vacío o datos incompletos",
      });
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

    const webhookUrl =
      process.env.WEBHOOK_URL || "http://localhost:3000/api/payment/webhook";
    const callbackUrl =
      process.env.CALLBACK_URL || "http://localhost:5173/checkout/success";

   
    const processPaymentPayload = {
      key: process.env.TILOPAY_API_KEY,
      amount: amount.toFixed(2),
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

    const [orderResult] = await pool.query(
      `INSERT INTO orders (user_id, total, status, tilopay_reference, tilopay_order_number, phone, address, city, postal_code, country) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        amount,
        "pending",
        orderReference,
        tilopayData.id || tilopayData.orderNumber,
        phone,
        address || null,
        city || null,
        postal_code || null,
        country || null,
      ],
    );

    for (const item of cartItems) {
      await pool.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price) 
         VALUES (?, ?, ?, ?)`,
        [orderResult.insertId, item.product_id, item.quantity, item.price],
      );
    }

    res.json({
      success: true,
      paymentUrl: tilopayData.url,
      orderId: orderResult.insertId,
      orderReference,
      tilopayLinkId: tilopayData.id,
    });
  } catch (error) {
    console.error("Error procesando pago:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Error procesando pago",
    });
  }
});

// Confirmar pago exitoso y enviar emails
router.post("/confirm", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { orderNumber, code } = req.body;

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

    // Buscar la orden en la BD
    const [orders] = await pool.query(
      `SELECT o.id, o.total, o.status, o.tilopay_reference, o.phone, o.address, o.city, o.postal_code, o.country
       FROM orders o WHERE o.tilopay_reference = ? AND o.user_id = ?`,
      [orderNumber, userId],
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Orden no encontrada",
      });
    }

    const order = orders[0];

    // Evitar enviar emails duplicados si ya fue confirmada
    if (order.status === 'paid') {
      return res.json({
        success: true,
        message: "La orden ya fue confirmada previamente",
        alreadyConfirmed: true,
      });
    }

    // Actualizar estado de la orden a 'paid'
    await pool.query(
      "UPDATE orders SET status = 'paid' WHERE id = ?",
      [order.id],
    );

    // Obtener datos del usuario
    const [users] = await pool.query(
      "SELECT name, email FROM users WHERE id = ?",
      [userId],
    );

    // Obtener items de la orden
    const [orderItems] = await pool.query(
      `SELECT oi.product_id, oi.quantity, oi.price, p.name 
       FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = ?`,
      [order.id],
    );

    if (users.length > 0) {
      const user = users[0];
      const orderData = {
        orderId: order.tilopay_reference,
        products: orderItems,
        total: parseFloat(order.total),
        clientName: user.name,
        clientEmail: user.email,
        clientPhone: order.phone,
        address: order.address,
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
      message: error.message || "Error confirmando pago",
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
