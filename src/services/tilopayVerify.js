import crypto from 'crypto';

// ============================================================
// Verificación de la firma de retorno de Tilopay (OrderHash).
//
// Tilopay firma la URL de retorno con un HMAC-SHA256 cuya clave incluye
// TILOPAY_API_KEY y TILOPAY_API_PASSWORD (secretos que solo tiene el servidor).
// Recalculando ese hash y comparándolo, un atacante NO puede falsificar un
// pago: aunque ponga code=1 en la URL, no puede generar un OrderHash válido
// sin los secretos.
//
// La fórmula está tomada del plugin oficial de WooCommerce de Tilopay v3.1.2
// (computed_customer_hash en WCTilopay.php). Debe replicarse al byte, por eso
// se reimplementan number_format y http_build_query de PHP.
// ============================================================

// PHP number_format($n, 2): coma como separador de miles, punto decimal.
// Ej: 7300 -> "7,300.00" ; 500 -> "500.00"
const phpNumberFormat = (n) => {
  const [entero, decimal] = Number(n).toFixed(2).split('.');
  return entero.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + decimal;
};

// PHP urlencode (RFC1738, el que usa http_build_query por defecto):
// espacio -> '+', y todo lo que no sea [A-Za-z0-9_.-] -> %XX en mayúsculas.
const phpUrlEncode = (s) =>
  String(s).replace(/[^A-Za-z0-9_.-]/g, (ch) =>
    ch === ' '
      ? '+'
      : '%' + ch.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0'),
  );

// PHP http_build_query: pares clave=valor unidos por '&', respetando el
// orden de inserción, con clave y valor url-encodeados.
const phpHttpBuildQuery = (pares) =>
  pares.map(([k, v]) => `${phpUrlEncode(k)}=${phpUrlEncode(v)}`).join('&');

/**
 * Recalcula el OrderHash de Tilopay y lo compara con el recibido.
 *
 * @param {object} p
 * @param {string} p.orderHash    OrderHash recibido en la URL de retorno
 * @param {string} p.tpt          tilopay-transaction / tpt (id de transacción de Tilopay)
 * @param {string} p.orderNumber  nuestro orderReference (external_orden_id)
 * @param {number} p.amount       total de la orden GUARDADO en la BD (no el del cliente)
 * @param {string} p.code         responseCode de la URL ("1" = aprobado)
 * @param {string} p.auth         código de autorización de la URL
 * @param {string} p.email        email del usuario dueño de la orden
 * @param {string} [p.currency]   moneda enviada a Tilopay (por defecto CRC)
 * @returns {{ok: boolean, reason?: string}}
 */
export const verifyTilopayReturn = ({
  orderHash,
  tpt,
  orderNumber,
  amount,
  code,
  auth,
  email,
  currency = 'CRC',
}) => {
  const apiKey = process.env.TILOPAY_API_KEY;
  const apiUser = process.env.TILOPAY_API_USER;
  const apiPassword = process.env.TILOPAY_API_PASSWORD;

  if (!apiKey || !apiUser || !apiPassword) {
    return { ok: false, reason: 'CREDENCIALES_TILOPAY_FALTANTES' };
  }

  // El plugin exige un auth presente de al menos 6 caracteres.
  if (!auth || String(auth).length < 6) {
    return { ok: false, reason: 'AUTH_INVALIDO' };
  }

  if (!orderHash || String(orderHash).length !== 64) {
    return { ok: false, reason: 'HASH_AUSENTE' };
  }

  // Mismo orden de campos que computed_customer_hash del plugin.
  const params = [
    ['api_Key', apiKey],
    ['api_user', apiUser],
    ['orderId', tpt],
    ['external_orden_id', orderNumber],
    ['amount', phpNumberFormat(amount)],
    ['currency', currency],
    ['responseCode', code],
    ['auth', auth],
    ['email', email],
  ];

  const hashKey = `${tpt}|${apiKey}|${apiPassword}`;
  const esperado = crypto
    .createHmac('sha256', hashKey)
    .update(phpHttpBuildQuery(params), 'utf8')
    .digest('hex');

  // Comparación en tiempo constante (equivalente a hash_equals de PHP).
  const a = Buffer.from(esperado, 'utf8');
  const b = Buffer.from(String(orderHash), 'utf8');
  const coincide = a.length === b.length && crypto.timingSafeEqual(a, b);

  return coincide ? { ok: true } : { ok: false, reason: 'HASH_NO_COINCIDE' };
};

// Exportadas para poder testear la réplica de las funciones de PHP.
export const _internals = { phpNumberFormat, phpUrlEncode, phpHttpBuildQuery };
