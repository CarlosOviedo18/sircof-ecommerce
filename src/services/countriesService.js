import { normalizeCountry } from '../shared/pack.js';

const API_URL = 'https://api.restcountries.com/countries/v5';

// El plan gratuito permite maximo 100 por request y hay ~249 paises,
// asi que hay que paginar. El tope de paginas evita un bucle infinito
// si la API deja de mandar el flag `more`.
const PAGE_SIZE = 100;
const MAX_PAGES = 10;

// Los paises no cambian: cacheamos 24h.
// Asi el checkout no gasta 3 requests a la API externa en cada carga.
const TTL_MS = 24 * 60 * 60 * 1000;
let cache = null;
let cacheExpiresAt = 0;

// Si no hay key configurada o la API falla, al menos el formulario sigue usable.
const FALLBACK = [{ name: 'Costa Rica', code: 'CR' }];

const fetchPage = async (offset, apiKey) => {
  // OJO: el campo del codigo ISO-2 se llama `codes.alpha_2`, NO `cca2`
  // (la documentacion de migracion dice cca2, pero la API lo ignora).
  const url = `${API_URL}?response_fields=names.common,codes.alpha_2,classification.iso_status&limit=${PAGE_SIZE}&offset=${offset}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!response.ok) {
    throw new Error(`restcountries respondió HTTP ${response.status}`);
  }

  const body = await response.json();

  // Formato v5 (JSON:API): { data: { objects: [...], meta: { more } } }
  const objects = body?.data?.objects ?? [];
  const more = body?.data?.meta?.more === true;

  return { objects, more };
};

/**
 * Lista de paises como [{ name, code }], ordenada alfabeticamente.
 * El code es ISO-2 y es lo que PayPal necesita en shipping.address.country_code.
 * Cachea 24h y nunca lanza: si algo falla devuelve el fallback.
 */
export const getCountries = async () => {
  if (cache && Date.now() < cacheExpiresAt) {
    return cache;
  }

  const apiKey = process.env.RESTCOUNTRIES_API_KEY;

  if (!apiKey) {
    console.warn(
      '⚠ RESTCOUNTRIES_API_KEY no está configurada en el .env; usando lista de respaldo',
    );
    return FALLBACK;
  }

  try {
    const paises = [];

    for (let page = 0; page < MAX_PAGES; page++) {
      const { objects, more } = await fetchPage(page * PAGE_SIZE, apiKey);

      for (const item of objects) {
        const name = item?.names?.common;
        const code = item?.codes?.alpha_2;
        const isoStatus = item?.classification?.iso_status;

        // Se descartan los que no traen codigo y los que no son paises ISO
        // oficiales (territorios en disputa tipo Abkhazia): no son destinos
        // de envio validos y PayPal los rechazaria igual.
        if (!name || !code || isoStatus !== 'official') continue;

        paises.push({ name, code: String(code).toUpperCase() });
      }

      if (!more || objects.length === 0) break;
    }

    if (paises.length === 0) {
      throw new Error('la API no devolvió ningún país');
    }

    const sorted = paises.sort((a, b) => a.name.localeCompare(b.name, 'es'));

    cache = sorted;
    cacheExpiresAt = Date.now() + TTL_MS;

    console.log(`✓ ${sorted.length} países cargados desde restcountries`);
    return sorted;
  } catch (error) {
    // No cacheamos el fallo: reintenta en la proxima llamada.
    console.warn('⚠ No se pudieron obtener los países:', error.message);
    return FALLBACK;
  }
};

/**
 * Codigo ISO-2 a partir del nombre del pais. Devuelve '' si no lo reconoce.
 *
 * Se usa cuando el cliente manda solo el nombre (bundle viejo cacheado):
 * el servidor deriva el codigo en vez de confiar en lo que llegue.
 */
export const getCountryCode = async (name) => {
  const buscado = normalizeCountry(name);
  if (!buscado) return '';

  const paises = await getCountries();
  const encontrado = paises.find((p) => normalizeCountry(p.name) === buscado);

  return encontrado ? encontrado.code : '';
};
