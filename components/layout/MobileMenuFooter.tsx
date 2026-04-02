"use client";

import Link from "next/link";
import { Handbag, Heart } from "lucide-react";
import { IoLogoInstagram } from "react-icons/io";
import { FiFacebook } from "react-icons/fi";
import { GoVideo } from "react-icons/go";
import { useIsMounted } from "@/hooks/useIsMounted";
import { useAppSelector, RootState } from "@/store";

interface MobileMenuFooterProps {
  user: any;
  onClose: () => void;
}

const MobileMenuFooter = ({ user, onClose }: MobileMenuFooterProps) => {
  const { items: cartItems } = useAppSelector((state: RootState) => state.cart);
  const { items: wishlistItems } = useAppSelector((state: RootState) => state.wishlist);
  const isMounted = useIsMounted();

  const cartCount = cartItems.reduce((acc: number, item: any) => acc + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  return (
    <div className="mt-auto border-t border-gray-100 shrink-0">
      <div className="px-5">
        <Link
          href="/cart"
          onClick={onClose}
          className="flex items-center justify-between py-3.5 border-b border-gray-100"
        >
          <span className="text-sm font-medium text-[#141718]">Cart</span>
          <div className="flex items-center gap-2">
            <Handbag className="w-5 h-5 text-[#141718]" />
            {isMounted && cartCount > 0 && (
              <div className="bg-[#141718] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </div>
            )}
          </div>
        </Link>

        <Link
          href="/account"
          onClick={onClose}
          className="flex items-center justify-between py-3.5 border-b border-gray-100"
        >
          <span className="text-sm font-medium text-[#141718]">Wishlist</span>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#141718]" />
            {isMounted && wishlistCount > 0 && (
              <div className="bg-[#141718] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {wishlistCount}
              </div>
            )}
          </div>
        </Link>
      </div>

      <div className="px-5 py-4">
        {user ? (
          <Link
            href="/account"
            onClick={onClose}
            className="flex items-center justify-center gap-3 w-full py-3 bg-[#141718] text-white text-sm font-semibold rounded-lg hover:bg-black transition-colors"
          >
            {user.user_metadata?.avatar_url && (
              <img
                src={user.user_metadata.avatar_url}
                alt="Avatar"
                className="w-6 h-6 rounded-full object-cover border border-white/20"
              />
            )}
            My Account
          </Link>
        ) : (
          <Link
            href="/signin"
            onClick={onClose}
            className="block w-full py-3 bg-[#141718] text-white text-center text-sm font-semibold rounded-lg hover:bg-black transition-colors"
          >
            Sign In
          </Link>
        )}
      </div>

      <div className="flex gap-5 px-5 pb-4 text-xl text-[#141718]">
        <IoLogoInstagram className="cursor-pointer hover:text-[#6C7275] transition-colors" />
        <FiFacebook className="cursor-pointer hover:text-[#6C7275] transition-colors" />
        <GoVideo className="cursor-pointer hover:text-[#6C7275] transition-colors" />
      </div>
    </div>
  );
};

export default MobileMenuFooter;
