import React from "react";
import { useTranslation } from 'react-i18next';
import { useProductDetail } from "../../hooks/products/useProductDetail";
import cafeNacional from "../../assets/webp/cafeNacional.webp";
import cafePremium from "../../assets/webp/cafePremium.webp";

function CartItem({
  cartItemId,
  productId,
  cantidad,
  onRemove,
  onQuantityChange,
}) {
  const { t } = useTranslation('cart');
  const { producto, loading } = useProductDetail(productId);

  if (loading) {
    return <p className="text-gray-500 py-4">{t('item.loading')}</p>;
  }

  if (!producto) {
    return <p className="text-red-500 py-4">{t('item.notFound')}</p>;
  }

  const imagenProducto =
    producto.line === "Premium" ? cafePremium : cafeNacional;
  const subtotal = producto.price * cantidad;

  return (
    <div className="flex gap-4 border-b py-4 items-start">
      {/* Imagen */}
      <img
        src={imagenProducto}
        alt={producto.name}
        loading="lazy"
        decoding="async"
        className="w-20 h-20 object-cover rounded"
      />

      {/* Info del producto */}
      <div className="flex-1">
        <p className="font-semibold text-gray-800">{producto.name}</p>
        <p className="text-sm text-gray-600">{t('item.line')}: {producto.line}</p>
      </div>

      {/* Cantidad y controles */}
      <div className="flex flex-col items-end gap-2">
        {/* Selector de cantidad */}
        <div className="flex items-center gap-2 border rounded px-2 py-1">
          <button
            onClick={() => onQuantityChange(cartItemId, cantidad - 1)}
            className="text-gray-600 hover:text-coffee font-bold"
            aria-label={t('item.decreaseQty')}
          >
            −
          </button>
          <span className="w-6 text-center">{cantidad}</span>
          <button
            onClick={() => onQuantityChange(cartItemId, cantidad + 1)}
            className="text-gray-600 hover:text-coffee font-bold"
            aria-label={t('item.increaseQty')}
          >
            +
          </button>
        </div>

        {/* Subtotal */}
        <p className="font-bold text-gray-800">
          ₡{subtotal.toLocaleString("es-CR")}
        </p>

        {/* Botón remover */}
        <button
          onClick={() => onRemove(cartItemId)}
          className="text-red-500 hover:text-red-700 text-sm font-semibold transition-colors"
        >
          {t('item.remove')}
        </button>
      </div>
    </div>
  );
}

export default CartItem;
