import { X } from "lucide-react";
import TintedProductImage from "../product/TintedProductImage";
import { CartItem as CartItemType } from "@/store/slices/cartSlice";
import { colorMap } from "../product/ColorSelector";

interface CartItemProps {
  item: CartItemType;
  onRemove: (id: string, color: string) => void;
  onUpdateQuantity: (id: string, color: string, quantity: number) => void;
}

const CartItem = ({ item, onRemove, onUpdateQuantity }: CartItemProps) => {
  const colorHex = item.color ? colorMap[item.color] : null;
  const shouldTint = item.color && item.color.toLowerCase() !== 'white';

  return (
    <div className="flex flex-col md:grid md:grid-cols-12 items-start md:items-center py-6 border-b border-gray-300 gap-4 md:gap-0">
      <div className="col-span-6 flex gap-4 w-full">
        <div 
          className="relative w-20 h-24 md:w-24 md:h-28 bg-[#F3F5F7] rounded flex items-center justify-center shrink-0"
        >
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
            className="flex items-center gap-1 text-sm text-gray-500 mt-2 hover:text-black transition-colors"
          >
            <X size={16} /> Remove
          </button>
        </div>
      </div>

      <div className="col-span-6 md:col-span-2 flex justify-between md:justify-center items-center w-full md:w-auto">
        <div className="md:hidden font-semibold">
          ${Number(item.price).toFixed(2)}
        </div>
        <div className="flex items-center border border-gray-400 rounded px-2 py-1 gap-4 w-25 justify-between">
          <button
            onClick={() =>
              onUpdateQuantity(item.id, item.color, item.quantity - 1)
            }
            className="text-lg text-gray-500"
          >
            -
          </button>
          <span className="font-semibold">{item.quantity}</span>
          <button
            onClick={() =>
              onUpdateQuantity(item.id, item.color, item.quantity + 1)
            }
            disabled={item.quantity >= item.stock}
            className={`text-lg transition-colors ${item.quantity >= item.stock ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:text-black"}`}
          >
            +
          </button>
        </div>
      </div>

      <div className="hidden md:block col-span-2 text-center font-medium">
        ${Number(item.price).toFixed(2)}
      </div>
      <div className="hidden md:block col-span-2 text-right font-semibold">
        ${(Number(item.price) * item.quantity).toFixed(2)}
      </div>
    </div>
  );
};

export default CartItem;
