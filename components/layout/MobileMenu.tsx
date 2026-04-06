"use client";

import { X, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import MobileSearch from "./MobileSearch";
import MobileMenuFooter from "./MobileMenuFooter";
import { useAppSelector, RootState } from "@/store";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const { user, role } = useAppSelector((state: RootState) => state.auth);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname() || "";

  const navItems = [
    { label: "Home", href: "/" },
    {
      label: "Shop",
      children: [
        { label: "All Products", href: "/shop" },
        { label: "Living Room", href: "/shop?category=Living+Room" },
        { label: "Bedroom", href: "/shop?category=Bedroom" },
        { label: "Kitchen", href: "/shop?category=Kitchen" },
      ],
    },
    { label: "Blogs", href: "/blogs" },
    { label: "Contact Us", href: "/contact" },
  ];

  if (role === "admin") {
    navItems.push({ label: "Admin", href: "/admin" });
  }

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = `-${window.scrollY}px`;
    } else {
      const scrollY = document.body.style.top;
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
      setOpenDropdown(null);
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
    };
  }, [isOpen]);

  const menuContent = (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-99998 transition-opacity duration-300 md:hidden ${
          isOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        }`}
        style={{ touchAction: "none" }}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 left-0 bottom-0 w-70 sm:w-80 bg-white z-99999 flex flex-col transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={
          {
            height: "100dvh",
            touchAction: "none",
            overscrollBehavior: "none",
          } as React.CSSProperties
        }
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <Link href="/" onClick={onClose}>
            <h3 className="font-medium text-xl text-[#141718]">3legant.</h3>
          </Link>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-[#141718]" />
          </button>
        </div>

        <MobileSearch onResultClick={onClose} />

        <nav className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5">
          {navItems.map((item) => (
            <div key={item.label} className="border-b border-gray-100">
              {item.children ? (
                <>
                  <button
                    onClick={() =>
                      setOpenDropdown(
                        openDropdown === item.label ? null : item.label,
                      )
                    }
                    className={`flex items-center justify-between w-full py-3.5 text-sm ${
                      item.children.some((c) =>
                        pathname.startsWith(c.href.split("?")[0]),
                      )
                        ? "text-[#141718] font-bold"
                        : "text-[#141718] font-medium"
                    }`}
                  >
                    {item.label}
                    <ChevronDown
                      className={`w-4 h-4 text-[#6C7275] transition-transform duration-200 ${
                        openDropdown === item.label ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openDropdown === item.label && (
                    <div className="pb-3 pl-4 flex flex-col gap-2">
                      {item.children.map((child) => {
                        const baseHref = child.href.split("?")[0];
                        const isActive =
                          baseHref === "/"
                            ? pathname === "/"
                            : pathname.startsWith(baseHref);
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={onClose}
                            className={`text-sm py-1 transition-colors ${
                              isActive
                                ? "text-[#141718] font-bold"
                                : "text-[#6C7275] hover:text-[#141718]"
                            }`}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href!}
                  onClick={onClose}
                  className={`block py-3.5 text-sm ${
                    (
                      item.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(item.href!)
                    )
                      ? "text-[#141718] font-bold"
                      : "text-[#141718] font-medium"
                  }`}
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
        </nav>

        <MobileMenuFooter user={user} onClose={onClose} />
      </div>
    </>
  );

  if (!isMounted) return null;

  return createPortal(menuContent, document.body);
};

export default MobileMenu;
