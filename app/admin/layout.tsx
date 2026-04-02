"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  CreditCard,
  Ticket,
  LogOut,
  Menu,
  X,
  Mail,
  FileText,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/messages", label: "Messages", icon: Mail },
  { href: "/admin/blogs", label: "Blogs", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

import { useAppDispatch, useAppSelector, RootState } from "@/store";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    user,
    role,
    loading: authLoading,
  } = useAppSelector((state: RootState) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/signin");
      return;
    }

    // Wait for the role to be fetched if it's not yet available
    if (role === null) return;

    if (role !== "admin") {
      router.push("/");
      return;
    }

    setAuthorized(true);
    setLoading(false);
  }, [user, role, authLoading, router]);

  if (loading || authLoading || (user && role === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="text-[#6C7275] text-lg">Loading...</div>
      </div>
    );
  }

  if (!authorized) return null;

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/signin");
  };

  return (
    <div className="min-h-screen flex bg-[#F9FAFB] font-inter">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#141718] text-white flex flex-col transform transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-6 border-b border-white/10">
          <Link href="/admin" className="text-xl font-semibold tracking-tight">
            3legant{" "}
            <span className="text-[#38CB89] text-sm font-normal">Admin</span>
          </Link>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-[#9CA3AF] hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-6 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#9CA3AF] hover:text-white hover:bg-white/5 transition-colors w-full"
          >
            <LogOut size={18} />
            Log Out
          </button>
          <Link
            href="/"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#9CA3AF] hover:text-white hover:bg-white/5 transition-colors w-full mt-1"
          >
            ← Back to Store
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-30">
          <button
            className="lg:hidden text-[#141718]"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-semibold text-[#141718] capitalize">
            {navItems.find((i) => i.href === pathname)?.label || "Admin"}
          </h1>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
