import pool from '../database.js';
import { getPackProductId } from './settingsService.js';

/**
 * Arma un objeto "cafe" a partir de sus filas de variantes.
 *
 * mysql2 devuelve DECIMAL como string ("3600.00"), y String.toLocaleString()
 * no formatea nada: por eso la tienda venia mostrando "₡3600.00" en vez de
 * "₡3 600". El Number() vive ACA, en un solo lugar, igual que en getShippingCost.
 */
const armarCafe = (coffee, filas) => {
  const variants = filas.map((r) => ({
    id: r.id,
    name: r.name,
    sizeG: r.size_g === null ? null : Number(r.size_g),
    grind: r.grind,
    roast: r.roast,
    price: Number(r.price),
    stock: Number(r.stock),
    // size_g en snake_case tambien, porque las funciones de shared/variants.js
    // trabajan con los nombres de las columnas.
    size_g: r.size_g === null ? null : Number(r.size_g),
  }));

  const precios = variants.map((v) => v.price);

  return {
    id: coffee.id,
    slug: coffee.slug,
    name: coffee.name,
    description: coffee.description,
    descriptionEn: coffee.description_en,
    category: coffee.category,
    imageUrl: coffee.image_url,
    line: filas[0]?.line ?? null, // para getProductImage mientras no haya image_url
    isPack: false,
    priceMin: Math.min(...precios),
    priceMax: Math.max(...precios),
    variants,
  };
};

/**
 * Catalogo completo: cafes con sus variantes anidadas.
 *
 * El Pack entra como un cafe SINTETICO de una sola variante (slug null,
 * isPack true), asi la tienda renderiza todo con la misma card y no hace
 * falta un segundo camino de codigo.
 *
 * Dos consultas, sin N+1.
 */
export const getCatalog = async () => {
  const [coffees] = await pool.query(
    `SELECT id, slug, name, description, description_en, category, image_url, sort_order
     FROM coffees WHERE active = 1 ORDER BY sort_order, id`,
  );

  const [products] = await pool.query(
    `SELECT id, coffee_id, name, description, price, size_g, grind, roast, stock, line, image_url
     FROM products WHERE active = 1
     ORDER BY coffee_id, size_g DESC, roast, grind`,
  );

  const packProductId = await getPackProductId();

  const porCafe = new Map();
  const sueltos = [];

  for (const p of products) {
    if (p.coffee_id === null) {
      sueltos.push(p);
      continue;
    }
    if (!porCafe.has(p.coffee_id)) porCafe.set(p.coffee_id, []);
    porCafe.get(p.coffee_id).push(p);
  }

  const salida = [];

  for (const cf of coffees) {
    const filas = porCafe.get(cf.id) || [];
    // Un cafe sin variantes no es comprable: no se muestra.
    if (filas.length === 0) continue;
    salida.push(armarCafe(cf, filas));
  }

  for (const p of sueltos) {
    if (p.id !== packProductId) {
      // Un producto sin cafe padre que tampoco es el pack es un bug de datos.
      // Mostrarlo sin categoria seria peor que omitirlo; el admin lo marca.
      console.warn(`⚠ Producto ${p.id} ("${p.name}") no tiene café padre y no es el pack; se omite del catálogo.`);
      continue;
    }

    salida.push({
      id: null,
      slug: null,
      name: p.name,
      description: p.description,
      descriptionEn: null,
      category: 'premium', // el pack es de Línea Premium
      imageUrl: p.image_url,
      line: p.line,
      isPack: true,
      priceMin: Number(p.price),
      priceMax: Number(p.price),
      variants: [{
        id: p.id,
        name: p.name,
        sizeG: null,
        size_g: null,
        grind: null,
        roast: null,
        price: Number(p.price),
        stock: Number(p.stock),
      }],
    });
  }

  return salida;
};

/** Un cafe por slug, con la misma forma que en getCatalog(). */
export const getCoffeeBySlug = async (slug) => {
  const [coffees] = await pool.query(
    `SELECT id, slug, name, description, description_en, category, image_url, sort_order
     FROM coffees WHERE slug = ? AND active = 1`,
    [slug],
  );

  if (coffees.length === 0) return null;

  const [products] = await pool.query(
    `SELECT id, coffee_id, name, description, price, size_g, grind, roast, stock, line, image_url
     FROM products WHERE coffee_id = ? AND active = 1
     ORDER BY size_g DESC, roast, grind`,
    [coffees[0].id],
  );

  if (products.length === 0) return null;

  return armarCafe(coffees[0], products);
};

/**
 * Un producto (variante) con su cafe, si lo tiene.
 * Es el resolver de las URLs viejas /producto/:id.
 */
export const getProductWithCoffee = async (id) => {
  const [rows] = await pool.query(
    `SELECT p.id, p.coffee_id, p.name, p.description, p.price, p.size_g, p.grind, p.roast,
            p.stock, p.line, p.image_url,
            c.slug AS coffee_slug, c.name AS coffee_name, c.category AS coffee_category
     FROM products p LEFT JOIN coffees c ON p.coffee_id = c.id
     WHERE p.id = ?`,
    [id],
  );

  if (rows.length === 0) return null;

  const r = rows[0];

  return {
    product: {
      id: r.id,
      name: r.name,
      description: r.description,
      price: Number(r.price),
      sizeG: r.size_g === null ? null : Number(r.size_g),
      grind: r.grind,
      roast: r.roast,
      stock: Number(r.stock),
      line: r.line,
      imageUrl: r.image_url,
    },
    coffee: r.coffee_slug
      ? { slug: r.coffee_slug, name: r.coffee_name, category: r.coffee_category }
      : null,
  };
};
