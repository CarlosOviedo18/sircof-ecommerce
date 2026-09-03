import React from "react";
import { useTranslation } from 'react-i18next';
import { getProductImage } from "../../lib/productImage";
import QuantityStepper from "../ui/QuantityStepper";
import PackBreakdownList from "../pack/PackBreakdownList";
import { PACK_SIZE } from "../../shared/pack";

// El item ya viene completo desde GET /api/cart (name, price, line, is_pack,
// packSelections). Antes esto llamaba a useProductDetail, que se bajaba la lista
// entera de productos POR CADA fila del carrito para obtener datos que ya tenía.
function CartItem({ item, onRemove, onQuantityChange }) {
  const { t } = useTranslation('cart');

  if (!item) return null;

  const cantidad = Number(item.quantity);
  const precio = Number(item.price);
  const subtotal = precio * cantidad;

  return (
    <div className="flex gap-4 border-b py-4 items-start">
      {/* Imagen */}
      <img
        src={getProductImage(item)}
        alt={item.name}
        loading="lazy"
        decoding="async"
        className="w-20 h-20 object-cover rounded"
      />

      {/* Info del producto */}
      <div className="flex-1">
        <p className="font-semibold text-gray-800">{item.name}</p>
        <p className="text-sm text-gray-600">{t('item.line')}: {item.line}</p>

        {item.is_pack && (
          <div className="mt-1.5">
            <p className="text-xs font-semibold text-gray-600">{t('item.packBreakdown')}</p>
            <PackBreakdownList selections={item.packSelections} className="mt-0.5" />
          </div>
        )}
      </div>

      {/* Cantidad y controles */}
      <div className="flex flex-col items-end gap-2">
        {/* El pack va siempre de a 1: su desglose describe UN pack de 9 */}
        {item.is_pack ? (
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {t('item.packFixedQty', { size: PACK_SIZE })}
          </span>
        ) : (
          <QuantityStepper
            value={cantidad}
            onChange={(nueva) => onQuantityChange(item.id, nueva)}
            min={1}
            size="sm"
            decreaseLabel={t('item.decreaseQty')}
            increaseLabel={t('item.increaseQty')}
          />
        )}

        {/* Subtotal */}
        <p className="font-bold text-gray-800">
          ₡{subtotal.toLocaleString("es-CR")}
        </p>

        {/* Botón remover */}
        <button
          onClick={() => onRemove(item.id)}
          className="text-red-500 hover:text-red-700 text-sm font-semibold transition-colors"
        >
          {t('item.remove')}
        </button>
      </div>
    </div>
  );
}

export default CartItem;
