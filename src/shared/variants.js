// ============================================================
// Vocabulario de variantes, compartido por FRONTEND y BACKEND.
//
// IMPORTANTE: este archivo se empaqueta al navegador.
//   NO importar mysql2, ni database.js, ni builtins de Node,
//   ni import.meta.env, ni assets, ni React, ni i18next.
//   Lo único permitido es ./pack.js.
//
// Igual que pack.js: que el selector del navegador y la validación del
// servidor usen las MISMAS funciones es lo que evita que se desincronicen.
// ============================================================

// Se RE-EXPORTAN, no se redefinen: el vocabulario ya existe en pack.js.
export { GRINDS, ROASTS } from './pack.js';
import { GRINDS, ROASTS } from './pack.js';

// Orden de presentación de los tamaños. No es una lista blanca: el admin
// puede cargar cualquier gramaje, esto solo decide en qué orden se muestran.
export const SIZES = [350, 500];

// OJO: duplicado del ENUM coffees.category en database/db.sql.
export const CATEGORIES = ['nacional', 'premium', 'variedades'];

// Orden de RESTRICCIÓN, no solo de presentación: cada dimensión está
// condicionada por las de arriba.
//
// El tueste va ARRIBA de la molienda a propósito. Línea Premium tiene
// oscuro+molido pero no oscuro+grano: si la molienda mandara, un usuario
// parado en Grano vería Oscuro deshabilitado y no tendría forma de llegar.
// Con este orden, elegir Oscuro repara la molienda hacia Molido.
export const VARIANT_DIMENSIONS = ['size_g', 'roast', 'grind'];

export const VARIANT_ERRORS = {
  INVALID_VARIANT_SHAPE: 'INVALID_VARIANT_SHAPE',
  VARIANT_NOT_FOUND: 'VARIANT_NOT_FOUND',
  VARIANT_ALREADY_EXISTS: 'VARIANT_ALREADY_EXISTS',
  COFFEE_NOT_FOUND: 'COFFEE_NOT_FOUND',
  INVALID_CATEGORY: 'INVALID_CATEGORY',
};

// Orden canónico por dimensión, para que el selector no dependa del orden
// en que la BD devolvió las filas.
const ORDEN = {
  size_g: SIZES,
  grind: GRINDS,
  roast: ROASTS,
};

const ordenar = (dim, valores) => {
  const canonico = ORDEN[dim] || [];
  return [...valores].sort((a, b) => {
    const ia = canonico.indexOf(a);
    const ib = canonico.indexOf(b);
    // Lo que no esté en el orden canónico (un gramaje nuevo) va al final.
    if (ia === -1 && ib === -1) return a > b ? 1 : -1;
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
};

const valorDe = (variant, dim) =>
  dim === 'size_g' ? Number(variant[dim]) : variant[dim];

/**
 * Valores distintos que ofrece este café en cada dimensión.
 * @returns {{size_g: number[], roast: string[], grind: string[]}}
 */
export const availableOptions = (variants = []) => {
  const out = {};
  for (const dim of VARIANT_DIMENSIONS) {
    const vistos = [...new Set(variants.map((v) => valorDe(v, dim)))];
    out[dim] = ordenar(dim, vistos);
  }
  return out;
};

/**
 * ¿El café varía en esta dimensión?
 * Con un solo valor no se muestra la fila: el Café Nacional solo existe
 * molido, así que no tiene sentido dibujar un "Grano" muerto para siempre.
 */
export const hasDimension = (variants, dim) =>
  availableOptions(variants)[dim].length > 1;

/**
 * La variante que coincide exactamente con la selección.
 * Devuelve undefined cuando la combinación no existe: ESE undefined es la
 * señal de "deshabilitado" que usa la UI.
 */
export const findVariant = (variants = [], selection = {}) =>
  variants.find((v) =>
    VARIANT_DIMENSIONS.every((dim) => valorDe(v, dim) === selection[dim]),
  );

export const isCombinationAvailable = (variants, selection) =>
  Boolean(findVariant(variants, selection));

/** La variante más barata (a igual precio, la de menor id). */
export const defaultSelection = (variants = []) => {
  if (variants.length === 0) return null;

  const barata = [...variants].sort(
    (a, b) => Number(a.price) - Number(b.price) || Number(a.id) - Number(b.id),
  )[0];

  return Object.fromEntries(VARIANT_DIMENSIONS.map((d) => [d, valorDe(barata, d)]));
};

/**
 * Fija una dimensión al valor elegido y repara las de ABAJO hasta que
 * exista una variante real. Las de arriba se mantienen.
 *
 * Es lo que hace que "elegir Oscuro estando en Grano" caiga en Oscuro+Molido
 * en vez de quedar en un callejón sin salida.
 */
export const resolveSelection = (variants, selection, changedDim, value) => {
  const idx = VARIANT_DIMENSIONS.indexOf(changedDim);
  const propuesta = { ...selection, [changedDim]: value };

  // Las dimensiones por encima de la que cambió quedan fijas.
  const fijas = VARIANT_DIMENSIONS.slice(0, idx + 1);

  const candidatos = variants.filter((v) =>
    fijas.every((dim) => valorDe(v, dim) === propuesta[dim]),
  );

  if (candidatos.length === 0) return propuesta; // no debería pasar

  // Entre los que respetan lo fijo, se prefiere el que más se parezca a la
  // selección actual en las dimensiones de abajo.
  const abajo = VARIANT_DIMENSIONS.slice(idx + 1);
  const mejor = candidatos.sort((a, b) => {
    const puntos = (v) => abajo.filter((d) => valorDe(v, d) === selection[d]).length;
    return puntos(b) - puntos(a) || Number(a.price) - Number(b.price);
  })[0];

  return Object.fromEntries(VARIANT_DIMENSIONS.map((d) => [d, valorDe(mejor, d)]));
};

/**
 * ¿Se puede elegir este valor en esta dimensión, respetando las de arriba?
 * Lo que está por debajo puede repararse, así que no cuenta.
 */
export const isOptionEnabled = (variants, selection, dim, value) => {
  const idx = VARIANT_DIMENSIONS.indexOf(dim);
  const arriba = VARIANT_DIMENSIONS.slice(0, idx);

  return variants.some(
    (v) =>
      valorDe(v, dim) === value &&
      arriba.every((d) => valorDe(v, d) === selection[d]),
  );
};

/** { min, max, varies } — alimenta el "desde ₡X" de la tienda. */
export const priceRange = (variants = []) => {
  if (variants.length === 0) return { min: 0, max: 0, varies: false };

  const precios = variants.map((v) => Number(v.price));
  const min = Math.min(...precios);
  const max = Math.max(...precios);

  return { min, max, varies: min !== max };
};

/**
 * Etiqueta legible de una variante: "500 g · Molido · Tueste Medio".
 *
 * Recibe `t` como ARGUMENTO porque este módulo no puede importar i18next,
 * y poner "500g Molido" acá hardcodearía el español.
 *
 * @param {object} variant
 * @param {(key: string, params?: object) => string} t
 * @param {string[]} dims dimensiones a incluir (por defecto, todas)
 */
export const variantLabel = (variant, t, dims = VARIANT_DIMENSIONS) => {
  if (!variant) return '';

  const partes = [];
  if (dims.includes('size_g') && variant.size_g != null) {
    partes.push(t('variant.size', { grams: variant.size_g }));
  }
  if (dims.includes('grind') && variant.grind) {
    partes.push(t(`grind.${variant.grind}`));
  }
  if (dims.includes('roast') && variant.roast) {
    partes.push(t(`roast.${variant.roast}`));
  }

  return partes.join(' · ');
};

/**
 * Regla todo-o-nada: una variante tiene coffee_id + size_g + grind + roast,
 * un producto suelto no tiene ninguno. Es la misma condición que expresa
 * chk_products_variant_shape en la BD.
 *
 * La usan el formulario del admin y la ruta del backend.
 */
export const validateVariantShape = ({ coffee_id, size_g, grind, roast } = {}) => {
  const tieneCafe = coffee_id !== null && coffee_id !== undefined && coffee_id !== '';
  const dimensiones = [size_g, grind, roast];
  const conValor = dimensiones.filter(
    (d) => d !== null && d !== undefined && d !== '',
  ).length;

  if (!tieneCafe) {
    // Producto suelto: no puede traer dimensiones sueltas.
    return conValor === 0
      ? { ok: true }
      : { ok: false, code: VARIANT_ERRORS.INVALID_VARIANT_SHAPE };
  }

  if (conValor !== 3) {
    return { ok: false, code: VARIANT_ERRORS.INVALID_VARIANT_SHAPE };
  }

  const tamano = Number(size_g);
  if (!Number.isInteger(tamano) || tamano < 1 || tamano > 65535) {
    return { ok: false, code: VARIANT_ERRORS.INVALID_VARIANT_SHAPE };
  }

  if (!GRINDS.includes(grind) || !ROASTS.includes(roast)) {
    return { ok: false, code: VARIANT_ERRORS.INVALID_VARIANT_SHAPE };
  }

  return { ok: true };
};

/**
 * Normaliza texto para buscar: sin tildes, minúsculas, solo alfanumérico
 * y espacios. Mismo truco que normalizeCountry en pack.js.
 *
 * Es lo que hace que buscar "cafe" encuentre "Café", cosa que hoy no pasa.
 */
export const normalizeText = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .toLowerCase()
    // Los diacríticos se BORRAN, no se reemplazan por espacio: "Línea" en NFD
    // es "l" + "i" + tilde + "nea", y sustituirla partiría la palabra en "li nea".
    .split('')
    .filter((ch) => {
      const cp = ch.codePointAt(0);
      return cp < 0x0300 || cp > 0x036f;
    })
    .join('')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
