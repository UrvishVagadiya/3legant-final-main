"use client";

import { CircleUserRound, Handbag, Menu, Search, LogOut } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector, RootState } from "@/store";
import { toggleCart } from "@/store/slices/cartSlice";

import { useIsMounted } from "@/hooks/useIsMounted";
import SearchOverlay from "./SearchOverlay";
import MobileMenu from "./MobileMenu";
import toast from "react-hot-toast";
import { typography } from "@/constants/typography";

const Navbar = () => {
  const dispatch = useAppDispatch();
  const { user, role } = useAppSelector((state: RootState) => state.auth);
  const { items } = useAppSelector((state: RootState) => state.cart);
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);
  const isMounted = useIsMounted();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getInitial = () => {
    const name =
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.user_metadata?.display_name ||
      user?.email;
    return name?.charAt(0).toUpperCase() || "U";
  };

  return (
    <>
      <div className="relative left-1/2 w-screen -translate-x-1/2 border-b text-gray-100 bg-white">
        <div className="navbar-container py-4 md:py-5 flex items-center justify-between w-full gap-3 lg:gap-4">
          <div className="flex items-center gap-3">
            <Menu
              onClick={() => setIsMobileMenuOpen(true)}
              className="block md:hidden cursor-pointer w-6 h-6 text-[#141718] transition-all duration-300 ease-in-out"
            />
            <Link href="/">
              <h3
                className={`${typography.h6} cursor-pointer text-[#141718] leading-none transition-all duration-300 ease-in-out`}
              >
                3legant.
              </h3>
            </Link>
          </div>
          <div className="hidden md:flex items-center whitespace-nowrap gap-4 lg:gap-7 text-sm font-medium text-[#6C7275]">
            <Link
              href={"/"}
              className={`whitespace-nowrap ${
                pathname === "/"
                  ? "text-[#141718] font-bold"
                  : "text-[#6C7275] hover:text-[#141718]"
              } transition-colors duration-300 ease-in-out`}
            >
              Home
            </Link>
            <Link
              href={"/shop"}
              className={`whitespace-nowrap ${
                pathname.startsWith("/shop")
                  ? "text-[#141718] font-bold"
                  : "text-[#6C7275] hover:text-[#141718]"
              } transition-colors duration-300 ease-in-out`}
            >
              Shop
            </Link>
            <Link
              href={"/blogs"}
              className={`whitespace-nowrap ${
                pathname.startsWith("/blogs")
                  ? "text-[#141718] font-bold"
                  : "text-[#6C7275] hover:text-[#141718]"
              } transition-colors duration-300 ease-in-out`}
            >
              Blog
            </Link>
            <Link
              href={"/contact"}
              className={`whitespace-nowrap ${
                pathname.startsWith("/contact")
                  ? "text-[#141718] font-bold"
                  : "text-[#6C7275] hover:text-[#141718]"
              } transition-colors duration-300 ease-in-out`}
            >
              Contact Us
            </Link>
            {role === "admin" && (
              <Link
                href={"/admin"}
                className={`whitespace-nowrap ${
                  pathname.startsWith("/admin")
                    ? "text-[#141718] font-bold"
                    : "text-[#6C7275] hover:text-[#141718]"
                } transition-colors duration-300 ease-in-out`}
              >
                Admin
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3 md:gap-4 text-[#141718]">
            <Search
              onClick={() => setIsSearchOpen(true)}
              className="hidden md:block cursor-pointer w-5 h-5 lg:w-6 lg:h-6 hover:text-gray-500 transition-colors duration-300 ease-in-out"
            />
            <div className="relative">
              {user ? (
                <Link
                  href={"/account"}
                  className="hidden md:flex cursor-pointer w-7 h-7 lg:w-8 lg:h-8 rounded-full items-center justify-center transition-opacity hover:opacity-80 overflow-hidden"
                >
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt={user.user_metadata?.full_name || "User"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#141718] text-white flex items-center justify-center text-sm font-semibold">
                      {getInitial()}
                    </div>
                  )}
                </Link>
              ) : (
                <Link href={"/signin"}>
                  <CircleUserRound className="hidden md:block cursor-pointer w-5 h-5 lg:w-6 lg:h-6 hover:text-gray-500 transition-colors duration-300 ease-in-out" />
                </Link>
              )}
            </div>
            <div
              onClick={() => {
                if (cartItemCount === 0) {
                  toast.error("Your cart is empty!");
                  return;
                }
                dispatch(toggleCart());
              }}
              className="flex items-center gap-1.5 cursor-pointer group transition-all duration-300 ease-in-out"
            >
              <Handbag className="w-5 h-5 lg:w-6 lg:h-6 group-hover:text-gray-500 transition-colors duration-300 ease-in-out" />
              {isMounted && cartItemCount > 0 && (
                <div className="bg-[#141718] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </div>
              )}
            </div>
          </div>

          <MobileMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          />
        </div>
      </div>

      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
};

export default Navbar;
