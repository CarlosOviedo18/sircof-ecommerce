import fetch from "node-fetch";

// ============================================================
// Verificación del pago consultando la API de Tilopay (server-to-server).
//
// En vez de confiar en el code=1 que manda el navegador (falsificable) o de
// recalcular el OrderHash (cuya fórmula Tilopay NO publica), le preguntamos
// directamente a la base de datos de Tilopay por el estado real de la orden:
//
//   POST https://app.tilopay.com/api/v1/consult
//   Authorization: Bearer <token de /login>
//   { key, orderNumber, merchantId }
//
// Respuesta (éxito): { type:"200", response:[{ orderNumber, amount, currency,
//                       code, response, auth, ... }] }
//   code === "1"  => transacción aprobada.
//
// Un atacante NO puede falsificar esta respuesta: sale del servidor de Tilopay,
// no del navegador. Aunque ponga code=1 en la URL, si la orden no se pagó de
// verdad, consult devuelve un code distinto (o no la encuentra) y se rechaza.
// ============================================================

const TILOPAY_BASE = "https://app.tilopay.com/api/v1";

// Obtiene el Bearer token del endpoint de login (mismas credenciales que el
// resto de la integración).
const loginTilopay = async () => {
  const response = await fetch(`${TILOPAY_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apiuser: process.env.TILOPAY_API_USER,
      password: process.env.TILOPAY_API_PASSWORD,
    }),
  });

  if (!response.ok) {
    throw new Error(`login Tilopay falló: ${response.status}`);
  }

  const data = await response.json();
  return data.token || data.access_token || data.auth_token || data;
};

/**
 * Consulta el estado real de una orden en Tilopay y valida que esté pagada
 * por el monto correcto.
 *
 * @param {object} p
 * @param {string} p.orderNumber   nuestro orderReference (el que se envió como orderNumber a Tilopay)
 * @param {number} p.expectedAmount  total GUARDADO en la BD (no el del cliente)
 * @param {string} [p.expectedCurrency]  moneda esperada (por defecto CRC)
 * @returns {Promise<{ok: boolean, reason?: string, tx?: object}>}
 */
export const consultTilopayPayment = async ({
  orderNumber,
  expectedAmount,
  expectedCurrency = "CRC",
}) => {
  const apiKey = process.env.TILOPAY_API_KEY;
  const apiUser = process.env.TILOPAY_API_USER;
  const apiPassword = process.env.TILOPAY_API_PASSWORD;

  if (!apiKey || !apiUser || !apiPassword) {
    return { ok: false, reason: "CREDENCIALES_TILOPAY_FALTANTES" };
  }
  if (!orderNumber) {
    return { ok: false, reason: "ORDER_NUMBER_FALTANTE" };
  }

  let token;
  try {
    token = await loginTilopay();
  } catch (e) {
    console.error("Error en login Tilopay (consult):", e.message);
    return { ok: false, reason: "LOGIN_FALLIDO" };
  }

  let data;
  try {
    const response = await fetch(`${TILOPAY_BASE}/consult`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ key: apiKey, orderNumber, merchantId: "" }),
    });

    data = await response.json();

    if (!response.ok) {
      console.warn(
        `consult Tilopay HTTP ${response.status} para ${orderNumber}:`,
        JSON.stringify(data),
      );
      return { ok: false, reason: `CONSULT_HTTP_${response.status}` };
    }
  } catch (e) {
    console.error("Error consultando Tilopay:", e.message);
    return { ok: false, reason: "CONSULT_ERROR_RED" };
  }

  // type "200" = ok; response es un array de transacciones para esa orden.
  if (String(data.type) !== "200" || !Array.isArray(data.response)) {
    return { ok: false, reason: "CONSULT_SIN_RESULTADO" };
  }

  // Puede haber más de un intento para la misma orden (ej: un rechazo y luego
  // un éxito). Buscamos una transacción aprobada de esa orden.
  //
  // OJO: Tilopay antepone un prefijo de comercio al orderNumber, así que en la
  // respuesta llega como "PFC024851-ORDER_1_...". Por eso se compara con
  // endsWith contra NUESTRO orderNumber (que es único), no con igualdad exacta.
  const ref = String(orderNumber);
  const tx = data.response.find(
    (t) => String(t.orderNumber).endsWith(ref) && String(t.code) === "1",
  );

  if (!tx) {
    return { ok: false, reason: "NO_APROBADA" };
  }

  // El monto que Tilopay tiene registrado debe coincidir con el total guardado.
  const montoTilopay = parseFloat(tx.amount);
  if (!Number.isFinite(montoTilopay) || Math.abs(montoTilopay - Number(expectedAmount)) > 0.01) {
    console.warn(
      `⚠ Monto no coincide en ${orderNumber}: Tilopay=${tx.amount} vs BD=${expectedAmount}`,
    );
    return { ok: false, reason: "MONTO_NO_COINCIDE" };
  }

  // La moneda también (defensa extra).
  if (tx.currency && String(tx.currency).toUpperCase() !== String(expectedCurrency).toUpperCase()) {
    console.warn(
      `⚠ Moneda no coincide en ${orderNumber}: Tilopay=${tx.currency} vs esperada=${expectedCurrency}`,
    );
    return { ok: false, reason: "MONEDA_NO_COINCIDE" };
  }

  return { ok: true, tx };
};
