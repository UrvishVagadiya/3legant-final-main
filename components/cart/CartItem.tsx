import { X } from "lucide-react";
import TintedProductImage from "../product/TintedProductImage";
import { CartItem as CartItemType } from "@/store/slices/cartSlice";
import { colorMap } from "../product/ColorSelector";
import {
  getEffectiveCartLineTotal,
  getEffectiveCartPrice,
} from "@/utils/getEffectiveCartPrice";

interface CartItemProps {
  item: CartItemType;
  onRemove: (id: string, color: string) => void;
  onUpdateQuantity: (id: string, color: string, quantity: number) => void;
}

const CartItem = ({ item, onRemove, onUpdateQuantity }: CartItemProps) => {
  const unitPrice = getEffectiveCartPrice(item);
  const lineTotal = getEffectiveCartLineTotal(item);
  const colorHex = item.color ? colorMap[item.color] : null;
  const shouldTint = item.color && item.color.toLowerCase() !== "white";

  const handleDecrease = () => {
    if (item.quantity <= 0) return;
    onUpdateQuantity(item.id, item.color, item.quantity - 1);
  };

  const handleIncrease = () => {
    if (item.stock <= 0 || item.quantity >= item.stock) return;
    onUpdateQuantity(item.id, item.color, item.quantity + 1);
  };

  return (
    <div className="flex flex-col md:grid md:grid-cols-12 items-start md:items-center py-6 border-b border-gray-300 gap-4 md:gap-0">
      <div className="col-span-6 flex gap-4 w-full">
        <div className="relative w-20 h-24 md:w-24 md:h-28 bg-[#F3F5F7] rounded flex items-center justify-center shrink-0">
          <TintedProductImage
            src={item.image}
            alt={item.name}
            fill
            unoptimized
            className="object-contain p-2 transition-all duration-300"
            colorHex={shouldTint ? colorHex : null}
          />
        </div>
        <div className="flex flex-col justify-center">
          <h3 className="font-semibold text-base">{item.name}</h3>
          <p className="text-sm text-gray-500 mt-1">Color: {item.color}</p>
          <button
            onClick={() => onRemove(item.id, item.color)}
            className="flex cursor-pointer items-center gap-1 text-sm text-gray-500 mt-2 hover:text-black transition-colors"
          >
            <X size={16} /> Remove
          </button>
        </div>
      </div>

      <div className="col-span-6 md:col-span-2 flex justify-between md:justify-center items-center w-full md:w-auto">
        <div className="md:hidden font-semibold">${unitPrice.toFixed(2)}</div>
        <div className="flex items-center border border-gray-400 rounded px-2 py-1 gap-4 w-25 justify-between">
          <button
            type="button"
            onClick={handleDecrease}
            disabled={item.quantity <= 0}
            className={`text-lg cursor-pointer transition-colors ${item.quantity <= 0 ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:text-black"}`}
          >
            -
          </button>
          <span className="font-semibold">{item.quantity}</span>
          <button
            type="button"
            onClick={handleIncrease}
            disabled={item.stock <= 0 || item.quantity >= item.stock}
            className={`text-lg cursor-pointer transition-colors ${item.stock <= 0 || item.quantity >= item.stock ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:text-black"}`}
          >
            +
          </button>
        </div>
      </div>

      <div className="hidden md:block col-span-2 text-center font-medium">
        ${unitPrice.toFixed(2)}
      </div>
      <div className="hidden md:block col-span-2 text-right font-semibold">
        ${lineTotal.toFixed(2)}
      </div>
    </div>
  );
};

export default CartItem;
