"use client";

import { useEffect, useState } from "react";
import {
  Package,
  ShoppingCart,
  CreditCard,
  Ticket,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import RecentOrdersTable from "@/components/admin/RecentOrdersTable";

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalPayments: number;
  activeCoupons: number;
  pendingOrders: number;
}

interface RecentOrder {
  id: string;
  order_code: string;
  status: string;
  total: number;
  subtotal: number;
  shipping_cost: number;
  discount: number;
  created_at: string;
  shipping_first_name: string;
  shipping_last_name: string;
  payment_status: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalPayments: 0,
    activeCoupons: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setRecentOrders(data.recentOrders);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading)
    return <div className="text-[#6C7275]">Loading dashboard...</div>;

  const statCards = [
    {
      label: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "bg-blue-50 text-blue-600",
      href: "/admin/products",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "bg-green-50 text-green-600",
      href: "/admin/orders",
    },
    {
      label: "Revenue",
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "bg-emerald-50 text-emerald-600",
      href: "/admin/orders",
    },
    {
      label: "Pending Orders",
      value: stats.pendingOrders,
      icon: ShoppingCart,
      color: "bg-yellow-50 text-yellow-600",
      href: "/admin/orders",
    },
    {
      label: "Total Payments",
      value: stats.totalPayments,
      icon: CreditCard,
      color: "bg-purple-50 text-purple-600",
      href: "/admin/payments",
    },
    {
      label: "Active Coupons",
      value: stats.activeCoupons,
      icon: Ticket,
      color: "bg-pink-50 text-pink-600",
      href: "/admin/coupons",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.color}`}
              >
                <card.icon size={22} />
              </div>
              <div>
                <p className="text-sm text-[#6C7275]">{card.label}</p>
                <p className="text-2xl font-semibold text-[#141718]">
                  {card.value}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <RecentOrdersTable orders={recentOrders} />
    </div>
  );
}
