"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Navbar from "@/components/layout/Navbar";
import NewsLetter from "@/components/sections/NewsLetter";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import { useAppSelector, RootState } from "@/store";

const GlobalLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAppSelector(
    (state: RootState) => state.auth,
  );

  const isAuthPage = pathname === "/signin" || pathname === "/signup";
  const isForgotPassword = pathname === "/forgot-password";
  const isContactPage = pathname === "/contact";
  const isCartPage = pathname === "/cart";
  const isAccountPage = pathname === "/account";
  const isResetPassword = pathname === "/reset-password";
  const isAdminPage = pathname.startsWith("/admin");

  const showHeaderNavbar = !isAuthPage && !isResetPassword && !isForgotPassword;
  const showNewsLetter =
    !isAuthPage &&
    !isContactPage &&
    !isCartPage &&
    !isAccountPage &&
    !isResetPassword &&
    !isForgotPassword;
  const showFooter = !isAuthPage && !isResetPassword && !isForgotPassword;

  const layout = (
    <>
      {showHeaderNavbar && (
        <>
          <Header />
          <div className="sticky top-0 z-50">
            <Navbar />
          </div>
        </>
      )}
      {children}
      {showNewsLetter && <NewsLetter />}
      {showFooter && <Footer />}
      <CartDrawer />
    </>
  );

  if (isAdminPage) {
    return <>{children}</>;
  }

  return <>{layout}</>;
};

export default GlobalLayout;
