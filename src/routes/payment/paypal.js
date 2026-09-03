import { Router } from "express";
import pool from "../../database.js";
import { protectRoute } from "../../middleware/auth.js";
import fetch from "node-fetch";
import { sendOrderEmails } from "../../services/emailService.js";
import { getCartTotals } from "../../services/orderTotals.js";
import { insertOrderItems, getOrderItemsWithSelections } from "../../services/orderItems.js";
import { checkPackShipping } from "../../services/packGuards.js";

const router = Router();

// ============================================
// Helpers PayPal
// ============================================

const PAYPAL_BASE_URL =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

/**
 * Obtener access token de PayPal usando Client ID + Secret
 */
const getPayPalAccessToken = async () => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Error obteniendo token PayPal:", error);
    throw new Error("No se pudo autenticar con PayPal");
  }

  const data = await response.json();
  return data.access_token;
};

/**
 * Obtener tipo de cambio CRC → USD desde API del BCCR (Banco Central de Costa Rica)
 * Fallback: usar tipo de cambio fijo si la API falla
 */
// Banda de cordura: si la API devuelve algo fuera de este rango, no es un
// tipo de cambio CRC/USD creible y no se usa para cobrar.
const RATE_MIN = 400;
const RATE_MAX = 700;
const RATE_FALLBACK = 525;

// El tipo de cambio se cachea 1h: antes se pedia una vez por orden.
const RATE_TTL_MS = 60 * 60 * 1000;
let rateCache = null;
let rateCacheExpiresAt = 0;

/**
 * Devuelve { rate, isFallback }.
 *
 * El flag importa: con el fallback de 525 el pack de ₡83.007,54 se cobraria
 * a $158 en vez de $183, unos $25 menos, en silencio. Quien cobre un pack
 * debe negarse a usar una tasa de fallback.
 */
const getExchangeRate = async () => {
  if (rateCache && Date.now() < rateCacheExpiresAt) {
    return rateCache;
  }

  try {
    // Intentar con exchangerate-api (gratis, no requiere key)
    const response = await fetch(
      "https://open.er-api.com/v6/latest/USD"
    );

    if (response.ok) {
      const data = await response.json();
      const rate = Number(data?.rates?.CRC); // Cuántos CRC por 1 USD

      if (Number.isFinite(rate) && rate >= RATE_MIN && rate <= RATE_MAX) {
        console.log(`Tipo de cambio obtenido: 1 USD = ${rate} CRC`);
        rateCache = { rate, isFallback: false };
        rateCacheExpiresAt = Date.now() + RATE_TTL_MS;
        return rateCache;
      }

      throw new Error(`tipo de cambio fuera de rango: ${data?.rates?.CRC}`);
    }

    throw new Error("No se pudo obtener tipo de cambio");
  } catch (error) {
    // No se cachea el fallo: se reintenta en la próxima orden.
    console.warn("⚠ Error obteniendo tipo de cambio, usando fallback:", error.message);
    return { rate: RATE_FALLBACK, isFallback: true };
  }
};

// ============================================
// Rutas
// ============================================

/**
 * POST /api/paypal/create-order
 * Crea una orden en PayPal y devuelve la URL de aprobación
 */
router.post("/create-order", protectRoute, async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount: clientAmount, phone, address, city, state, postal_code, country, country_code } =
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

    if (clientAmount != null && Math.abs(Number(clientAmount) - totals.total) > 1) {
      console.warn(
        `⚠ Monto del cliente (${clientAmount}) != monto calculado (${totals.total}) para el usuario ${userId}`,
      );
    }

    // El pack solo se envía fuera de Costa Rica. Se valida ACÁ, antes de
    // getPayPalAccessToken(), para no crear una orden en PayPal y abandonarla.
    // El código ISO se deriva en el servidor, no se confía en el del cliente.
    let countryCode = String(country_code ?? "").trim().toUpperCase();

    if (totals.hasPack) {
      const guard = await checkPackShipping({ country, countryCode });

      if (!guard.ok) {
        return res.status(guard.status).json({
          success: false,
          code: guard.code,
          message: guard.message,
        });
      }

      countryCode = guard.countryCode;
    }

    // Obtener datos del usuario
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
    const orderReference = `PAYPAL_${userId}_${Date.now()}`;

    // Convertir CRC a USD
    const { rate: exchangeRate, isFallback } = await getExchangeRate();

    // Con el fallback el pack se cobraría ~$25 de menos. Preferimos fallar
    // y que el cliente reintente antes que subcobrar en silencio.
    if (totals.hasPack && isFallback) {
      return res.status(503).json({
        success: false,
        code: "EXCHANGE_RATE_UNAVAILABLE",
        message: "No se pudo obtener el tipo de cambio. Intentá de nuevo en unos minutos.",
      });
    }

    const amountUSD = (totals.total / exchangeRate).toFixed(2);

    console.log(
      `Conversión: ₡${totals.total} CRC (₡${totals.subtotal} productos + ₡${totals.shippingCost} envío) / ${exchangeRate} = $${amountUSD} USD`,
    );

    // Obtener access token de PayPal
    const accessToken = await getPayPalAccessToken();

    // Crear la orden en PayPal
    const orderPayload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: orderReference,
          description: `Pedido SIRCOF Café - ${totals.items.length} producto(s)`,
          amount: {
            currency_code: "USD",
            value: amountUSD,
          },
          shipping: {
            name: {
              full_name: user.name,
            },
            address: {
              address_line_1: address || "No especificada",
              // admin_area_1 = estado/provincia. PayPal lo EXIGE para
              // direcciones de EE.UU. (código de 2 letras, ej "FL").
              ...(state ? { admin_area_1: state } : {}),
              admin_area_2: city || "San José",
              postal_code: postal_code || "00000",
              // Antes estaba hardcodeado en "CR", así que con
              // SET_PROVIDED_ADDRESS todo envío salía como Costa Rica.
              country_code: countryCode || "CR",
            },
          },
        },
      ],
      application_context: {
        brand_name: "SIRCOF Café",
        landing_page: "LOGIN",
        user_action: "PAY_NOW",
        shipping_preference: "SET_PROVIDED_ADDRESS",
        payment_method: {
          payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED",
        },
        return_url: `${process.env.CALLBACK_URL || process.env.PUBLIC_URL}/checkout/success?method=paypal`,
        cancel_url: `${process.env.PUBLIC_URL || "http://localhost:3000"}/checkout?cancelled=true`,
      },
    };

    const paypalResponse = await fetch(
      `${PAYPAL_BASE_URL}/v2/checkout/orders`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(orderPayload),
      },
    );

    if (!paypalResponse.ok) {
      const error = await paypalResponse.text();
      console.error("Error creando orden PayPal:", error);
      throw new Error("Error al crear orden en PayPal");
    }

    const paypalData = await paypalResponse.json();
    

    // Encontrar la URL de aprobación
    const approveLink = paypalData.links.find(
      (link) => link.rel === "approve",
    );

    if (!approveLink) {
      throw new Error("No se encontró URL de aprobación de PayPal");
    }

    // Guardar la orden en la BD con estado pending, dentro de una transacción:
    // una orden sin sus items es una venta cobrada que no se puede despachar.
    const conn = await pool.getConnection();
    let orderId;

    try {
      await conn.beginTransaction();

      const [orderResult] = await conn.query(
        `INSERT INTO orders (user_id, total, subtotal, shipping_cost, status, tilopay_reference, tilopay_order_number, payment_method, phone, address, city, state, postal_code, country, country_code)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          totals.total, // Guardamos en CRC (moneda local), incluye el envío
          totals.subtotal,
          totals.shippingCost,
          "pending",
          orderReference,
          paypalData.id, // PayPal order ID
          "paypal",
          phone,
          address || null,
          city || null,
          state || null,
          postal_code || null,
          country || null,
          countryCode || null,
        ],
      );

      orderId = orderResult.insertId;

      // Items con los precios de la BD, más el desglose del pack si lo hay
      await insertOrderItems(conn, orderId, totals.items);

      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }

    console.log(`✓ Orden PayPal creada: ${orderReference} | PayPal ID: ${paypalData.id} | $${amountUSD} USD`);

    res.json({
      success: true,
      paymentUrl: approveLink.href,
      paypalOrderId: paypalData.id,
      orderId,
      orderReference,
      amountUSD,
      exchangeRate,
    });
  } catch (error) {
    console.error("Error creando orden PayPal:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Error al procesar pago con PayPal",
    });
  }
});

/**
 * POST /api/paypal/capture-order
 * Captura (cobra) una orden aprobada por el usuario en PayPal
 */
router.post("/capture-order", protectRoute, async (req, res) => {
  try {
    const userId = req.user.id;
    const { paypalOrderId } = req.body;

    if (!paypalOrderId) {
      return res.status(400).json({
        success: false,
        message: "PayPal Order ID requerido",
      });
    }

    // Obtener access token
    const accessToken = await getPayPalAccessToken();

    // Capturar el pago
    const captureResponse = await fetch(
      `${PAYPAL_BASE_URL}/v2/checkout/orders/${paypalOrderId}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const captureData = await captureResponse.json();

    // Manejar INSTRUMENT_DECLINED (tarjeta rechazada por PayPal)
    if (!captureResponse.ok || captureData.details) {
      const errorDetail = captureData.details?.[0];
      
      if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
        console.warn(`⚠ Tarjeta rechazada en PayPal para orden: ${paypalOrderId}`);
        return res.status(422).json({
          success: false,
          code: "INSTRUMENT_DECLINED",
          message: "La tarjeta fue rechazada por PayPal. Intente con otro método de pago o con saldo PayPal.",
        });
      }

      if (errorDetail?.issue === "ORDER_NOT_APPROVED") {
        console.warn(`⚠ Orden no aprobada: ${paypalOrderId}`);
        return res.status(422).json({
          success: false,
          code: "ORDER_NOT_APPROVED",
          message: "La orden no fue aprobada. Intente nuevamente.",
        });
      }

      console.error("Error capturando pago PayPal:", JSON.stringify(captureData));
      throw new Error(captureData.message || "Error al capturar pago en PayPal");
    }

    const isCompleted = captureData.status === "COMPLETED";

    if (!isCompleted) {
      return res.status(400).json({
        success: false,
        message: `Estado del pago: ${captureData.status}. Intente con PayPal balance o contacte soporte.`,
      });
    }

    // Buscar la orden en la BD por el paypal order ID
    const [orders] = await pool.query(
      `SELECT o.id, o.total, o.subtotal, o.shipping_cost, o.status, o.tilopay_reference, o.phone, o.address, o.city, o.state, o.postal_code, o.country, o.country_code
       FROM orders o WHERE o.tilopay_order_number = ? AND o.user_id = ?`,
      [paypalOrderId, userId],
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Orden no encontrada",
      });
    }

    const order = orders[0];

    // Evitar duplicados
    if (order.status === "paid") {
      return res.json({
        success: true,
        message: "La orden ya fue confirmada previamente",
        alreadyConfirmed: true,
      });
    }

    // Actualizar estado a paid
    await pool.query("UPDATE orders SET status = 'paid' WHERE id = ?", [
      order.id,
    ]);

    // Obtener datos del usuario para email
    const [users] = await pool.query(
      "SELECT name, email FROM users WHERE id = ?",
      [userId],
    );

    // Obtener items de la orden para email, con el desglose del pack si lo hay
    const orderItems = await getOrderItemsWithSelections(order.id);

    // Enviar emails
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
        console.log("✓ Emails enviados después de pago PayPal confirmado");
      } catch (emailError) {
        console.error("⚠ Error al enviar emails:", emailError.message);
      }
    }

    // Info de captura para el frontend
    const capture =
      captureData.purchase_units?.[0]?.payments?.captures?.[0] || {};

    console.log(`✓ Pago PayPal capturado: ${paypalOrderId} | Status: COMPLETED`);

    res.json({
      success: true,
      message: "Pago PayPal confirmado y emails enviados",
      captureId: capture.id,
      status: captureData.status,
    });
  } catch (error) {
    console.error("Error capturando pago PayPal:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Error al capturar pago PayPal",
    });
  }
});

export default router;
