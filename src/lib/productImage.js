// SOLO FRONTEND: importa assets .webp, que solo resuelve Vite.
// No importar este archivo desde el backend (src/lib/ también tiene jwt.js y crypto.js).
import cafeNacional from '../assets/webp/cafeNacional.webp'
import cafePremium from '../assets/webp/cafePremium.webp'
import packPremium from '../assets/webp/Pack9-Paquetes.webp'

// Antes este ternario estaba duplicado en 5 archivos (tienda, detalle, carrito,
// resumen del pedido y destacados), así que un producto nuevo aparecía con la
// imagen equivocada hasta tocarlos todos.
export const getProductImage = (producto) => {
  if (!producto) return cafeNacional

  // La imagen cargada desde el admin manda. La columna image_url existía en el
  // esquema y el admin la escribía, pero nadie la leía: acá se usa por fin.
  // Acepta las dos formas porque la API de catálogo devuelve imageUrl.
  const propia = producto.imageUrl || producto.image_url
  if (propia) return propia

  // El pack tiene su propia imagen.
  if (producto.is_pack || producto.isPack || producto.line === 'Pack') return packPremium

  return producto.line === 'Premium' ? cafePremium : cafeNacional
}
