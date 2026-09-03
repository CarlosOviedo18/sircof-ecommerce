// ============================================================
// Vocabulario del Pack, compartido por FRONTEND y BACKEND.
//
// IMPORTANTE: este archivo se empaqueta al navegador.
//   NO importar mysql2, ni builtins de Node, ni import.meta.env,
//   ni assets (.webp/.css). Solo JavaScript puro.
//
// El objetivo es que el modal del navegador y la ruta del servidor
// validen con EXACTAMENTE la misma función, para que no se desincronicen.
// ============================================================

export const PACK_LINE = 'Pack';
export const PACK_SIZE = 9;

// OJO: estos valores están duplicados en los ENUM de
// cart_item_selections y order_item_selections en database/db.sql.
// Si cambian acá, cambiarlos allá.
export const ROASTS = ['medio', 'oscuro'];
export const GRINDS = ['grano', 'molido'];

// Las 4 combinaciones, en el orden en que se muestran en el modal.
export const PACK_COMBINATIONS = ROASTS.flatMap((roast) =>
  GRINDS.map((grind) => ({ roast, grind })),
);

export const comboKey = (roast, grind) => `${roast}-${grind}`;

export const parseComboKey = (key) => {
  const [roast, grind] = String(key).split('-');
  return { roast, grind };
};

// Códigos de error, usados por el servidor en la respuesta y por el
// frontend para elegir el texto traducido. Nunca se muestra el mensaje
// del servidor: está en español y el público del pack es angloparlante.
export const PACK_ERRORS = {
  INVALID_PACK_SELECTION: 'INVALID_PACK_SELECTION',
  MIXED_CART_PACK: 'MIXED_CART_PACK',
  MIXED_CART_PRODUCTS: 'MIXED_CART_PRODUCTS',
  PACK_ALREADY_IN_CART: 'PACK_ALREADY_IN_CART',
  PACK_QTY_FIXED: 'PACK_QTY_FIXED',
  PACK_REQUIRES_PAYPAL: 'PACK_REQUIRES_PAYPAL',
  PACK_NOT_FOR_CR: 'PACK_NOT_FOR_CR',
  COUNTRY_REQUIRED: 'COUNTRY_REQUIRED',
  COUNTRY_INVALID: 'COUNTRY_INVALID',
};

/**
 * Valida un desglose del pack. Es la ÚNICA implementación:
 * la usa la ruta del carrito (autoritativa) y el modal (feedback inmediato).
 *
 * @param {Array<{roast:string, grind:string, quantity:number}>} input
 * @returns {{ok: boolean, code?: string, selections?: Array}}
 */
export const validatePackSelections = (input) => {
  if (!Array.isArray(input) || input.length === 0) {
    return { ok: false, code: PACK_ERRORS.INVALID_PACK_SELECTION };
  }

  if (input.length > PACK_COMBINATIONS.length) {
    return { ok: false, code: PACK_ERRORS.INVALID_PACK_SELECTION };
  }

  const vistas = new Set();
  const selections = [];
  let total = 0;

  for (const item of input) {
    const roast = String(item?.roast ?? '');
    const grind = String(item?.grind ?? '');
    const quantity = Number(item?.quantity);

    if (!ROASTS.includes(roast) || !GRINDS.includes(grind)) {
      return { ok: false, code: PACK_ERRORS.INVALID_PACK_SELECTION };
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > PACK_SIZE) {
      return { ok: false, code: PACK_ERRORS.INVALID_PACK_SELECTION };
    }

    const key = comboKey(roast, grind);
    if (vistas.has(key)) {
      return { ok: false, code: PACK_ERRORS.INVALID_PACK_SELECTION };
    }
    vistas.add(key);

    total += quantity;
    selections.push({ roast, grind, quantity });
  }

  if (total !== PACK_SIZE) {
    return { ok: false, code: PACK_ERRORS.INVALID_PACK_SELECTION };
  }

  return { ok: true, selections };
};

/**
 * Normaliza el nombre de un país para poder compararlo:
 * quita tildes, pasa a minúsculas y deja solo letras.
 * "Costa Rica" / "costa rica " / "COSTA-RICA" -> "costarica"
 */
export const normalizeCountry = (name) =>
  String(name ?? '')
    .normalize('NFD')
    .toLowerCase()
    .replace(/[^a-z]/g, '');

const CR_NAMES = ['costarica', 'republicadecostarica'];

/**
 * ¿La dirección es de Costa Rica?
 * Devuelve null cuando no se puede determinar, para que el llamador
 * decida (el guard del pack rechaza ante la duda: falla cerrado).
 *
 * @returns {boolean|null}
 */
export const isCostaRica = ({ country, countryCode } = {}) => {
  const code = String(countryCode ?? '').trim().toUpperCase();
  if (code.length === 2) {
    return code === 'CR';
  }

  const normalizado = normalizeCountry(country);
  if (!normalizado) return null;

  return CR_NAMES.includes(normalizado);
};
