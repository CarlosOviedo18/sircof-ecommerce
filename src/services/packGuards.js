import { isCostaRica, PACK_ERRORS } from '../shared/pack.js';
import { getCountryCode } from './countriesService.js';

/**
 * Valida que un carrito con pack se pueda cobrar por PayPal a una direccion
 * fuera de Costa Rica.
 *
 * Se llama en AMBAS rutas de pago DESPUES de getCartTotals y ANTES de cualquier
 * llamada HTTP externa (loginTilopay / getPayPalAccessToken), para no crear un
 * pago remoto que despues hay que abandonar.
 *
 * Falla CERRADO: si no se puede determinar el pais, rechaza. Hoy `country`
 * se guarda pero nunca se valida, asi que un cliente que mande {} pasaria de largo.
 *
 * @returns {Promise<{ok: true, countryCode: string} | {ok: false, status: number, code: string, message: string}>}
 */
export const checkPackShipping = async ({ country, countryCode }) => {
  const nombre = String(country ?? '').trim();
  const codigoCliente = String(countryCode ?? '').trim().toUpperCase();

  if (!nombre && !codigoCliente) {
    return {
      ok: false,
      status: 400,
      code: PACK_ERRORS.COUNTRY_REQUIRED,
      message: 'Falta el país de envío',
    };
  }

  // El codigo se deriva en el servidor: no se confia en el del cliente para decidir.
  const codigoDerivado = nombre ? await getCountryCode(nombre) : '';
  const codigoFinal = codigoDerivado || codigoCliente;

  if (!codigoFinal) {
    return {
      ok: false,
      status: 400,
      code: PACK_ERRORS.COUNTRY_INVALID,
      message: 'No se reconoce el país de envío',
    };
  }

  // Se evalua por nombre Y por codigo. Si cualquiera de los dos dice
  // Costa Rica, se rechaza: ante la duda, no se despacha.
  const porCodigo = isCostaRica({ countryCode: codigoFinal });
  const porNombre = nombre ? isCostaRica({ country: nombre }) : null;

  if (porCodigo === true || porNombre === true) {
    return {
      ok: false,
      status: 409,
      code: PACK_ERRORS.PACK_NOT_FOR_CR,
      message:
        'Este pack está disponible únicamente para envíos internacionales. Para pedidos dentro del país, revisá nuestros paquetes individuales.',
    };
  }

  return { ok: true, countryCode: codigoFinal };
};

/**
 * Valida que un carrito SIN pack (cafés individuales) se envíe dentro de
 * Costa Rica. Es la regla simétrica de checkPackShipping.
 *
 * Al exterior solo se despacha el pack (envío incluido); cobrar el envío de
 * una sola bolsa a otro país no tiene sentido logístico.
 *
 * Falla ABIERTO (al revés que el pack): si el país es Costa Rica O no se puede
 * determinar, permite. Así ningún pedido nacional legítimo se rompe. Solo
 * rechaza cuando el país es EXPLÍCITAMENTE distinto de CR.
 *
 * @returns {Promise<{ok: true, countryCode: string} | {ok: false, status: number, code: string, message: string}>}
 */
export const checkCoffeeShipping = async ({ country, countryCode }) => {
  const nombre = String(country ?? '').trim();
  const codigoCliente = String(countryCode ?? '').trim().toUpperCase();

  // El código se deriva en el servidor: no se confía en el del cliente.
  const codigoDerivado = nombre ? await getCountryCode(nombre) : '';
  const codigoFinal = codigoDerivado || codigoCliente;

  const porCodigo = codigoFinal ? isCostaRica({ countryCode: codigoFinal }) : null;
  const porNombre = nombre ? isCostaRica({ country: nombre }) : null;

  // Solo se rechaza si hay certeza de que NO es Costa Rica.
  const esExtranjeroSeguro = porCodigo === false || porNombre === false;

  if (esExtranjeroSeguro) {
    return {
      ok: false,
      status: 409,
      code: PACK_ERRORS.CAFE_ONLY_CR,
      message:
        'Los cafés individuales se envían únicamente dentro de Costa Rica. Para pedidos internacionales, revisá nuestro Pack de 9.',
    };
  }

  // CR o indeterminado: se permite. Por defecto CR.
  return { ok: true, countryCode: codigoFinal || 'CR' };
};

/**
 * Guard de Tilopay: el pack nunca puede pasar por ahi.
 *
 * La ruta tiene currency "CRC", billToCountry "CR", shipToCountry "CR" y
 * billToState "CR-SJ" hardcodeados; no hay forma correcta de mandarle
 * una direccion internacional.
 */
export const rejectPackOnTilopay = (hasPack) => {
  if (!hasPack) return null;

  return {
    status: 409,
    code: PACK_ERRORS.PACK_REQUIRES_PAYPAL,
    message: 'El pack solo se puede pagar con PayPal',
  };
};
