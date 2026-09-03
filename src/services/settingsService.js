import pool from '../database.js';
import { PACK_LINE } from '../shared/pack.js';


const DEFAULTS = {
  shipping_cost: 3700,
};

// Cache a nivel de modulo con TTL corto.
// Cachear para siempre romperia el objetivo de "editable con un UPDATE";
// no cachear castigaria cada carga del checkout con un query extra.
const TTL_MS = 60 * 1000;
let cache = null;
let cacheExpiresAt = 0;

// Lee todas las settings de la BD como objeto plano { clave: valor }.
// Los valores vienen como string (mysql2 devuelve VARCHAR tal cual).
export const getSettings = async () => {
  if (cache && Date.now() < cacheExpiresAt) {
    return cache;
  }

  try {
    const [rows] = await pool.query('SELECT setting_key, setting_value FROM settings');

    const settings = {};
    for (const row of rows) {
      settings[row.setting_key] = row.setting_value;
    }

    cache = settings;
    cacheExpiresAt = Date.now() + TTL_MS;
    return settings;
  } catch (error) {
    // No cacheamos el fallo: asi reintenta en la proxima llamada.
    console.warn('⚠ No se pudo leer la tabla settings, usando valores por defecto:', error.message);
    return {};
  }
};

// Costo de envio en CRC, siempre como Number.
// mysql2 devuelve el valor como string ("3700.00"), y "3700.00" + 3300
// da "3700.003300" en vez de 7000. Por eso el Number() vive aca y no en cada llamador.
export const getShippingCost = async () => {
  const settings = await getSettings();
  const parsed = Number(settings.shipping_cost);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return DEFAULTS.shipping_cost;
  }

  return parsed;
};

// ID del producto Pack, como Number.
//
// Se guarda en settings en vez de comparar `line === 'Pack'` por todo el código:
// si un admin escribiera "pack" en minúscula, TODAS las reglas del pack
// fallarían abiertas, incluido el bloqueo de envíos a Costa Rica.
//
// Si la fila de settings falta (migración a medias), cae a buscar por línea
// y avisa. Con más de una fila Pack toma la menor: una segunda no está soportada.
export const getPackProductId = async () => {
  const settings = await getSettings();
  const parsed = Number(settings.pack_product_id);

  if (Number.isInteger(parsed) && parsed > 0) {
    return parsed;
  }

  try {
    const [rows] = await pool.query(
      'SELECT id FROM products WHERE line = ? ORDER BY id',
      [PACK_LINE],
    );

    if (rows.length === 0) return null;

    if (rows.length > 1) {
      console.warn(
        `⚠ Hay ${rows.length} productos con line='${PACK_LINE}'. Se usa el id ${rows[0].id}; una segunda fila Pack no está soportada.`,
      );
    } else {
      console.warn(
        `⚠ Falta settings.pack_product_id; se dedujo el id ${rows[0].id} por línea. Corré el seed de database/db.sql.`,
      );
    }

    return Number(rows[0].id);
  } catch (error) {
    console.warn('⚠ No se pudo determinar el id del pack:', error.message);
    return null;
  }
};

// Invalida el cache. Para cuando exista un endpoint de admin que edite settings.
export const clearSettingsCache = () => {
  cache = null;
  cacheExpiresAt = 0;
};
