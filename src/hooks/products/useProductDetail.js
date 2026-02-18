import { useEffect, useState } from 'react'
import { useProductos } from './useProductos'

export function useProductDetail(productId) {
  const { productos, loading, error } = useProductos()
  const [producto, setProducto] = useState(null)

  useEffect(() => {
    if (productos.length > 0) {
      const productoEncontrado = productos.find(p => p.id === parseInt(productId))
      if (productoEncontrado) {
        setProducto(productoEncontrado)
      }
    }
  }, [productos, productId])

  return { producto, loading, error }
}
