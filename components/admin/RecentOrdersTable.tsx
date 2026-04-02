import Link from "next/link";

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

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  shipped: "bg-blue-100 text-blue-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const RecentOrdersTable = ({ orders }: { orders: RecentOrder[] }) => (
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
      <h2 className="text-lg font-semibold text-[#141718]">Recent Orders</h2>
      <Link
        href="/admin/orders"
        className="text-sm text-blue-600 hover:underline"
      >
        View all
      </Link>
    </div>
    {orders.length === 0 ? (
      <p className="px-6 py-8 text-center text-[#6C7275]">No orders yet</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-[#6C7275]">
            <tr>
              {["Order", "Customer", "Status", "Total", "Date"].map((h) => (
                <th key={h} className="text-left px-6 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-t border-gray-100 hover:bg-gray-50"
              >
                <td className="px-6 py-4 font-medium text-[#141718]">
                  {order.order_code}
                </td>
                <td className="px-6 py-4 text-[#141718]">
                  {order.shipping_first_name} {order.shipping_last_name}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[order.status] || "bg-gray-100 text-gray-700"}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-[#141718]">
                  ${(Number(order.total) || (Number(order.subtotal || 0) + Number(order.shipping_cost || 0) - Number(order.discount || 0))).toFixed(2)}
                </td>
                <td className="px-6 py-4 text-[#6C7275]">
                  {new Date(order.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

export default RecentOrdersTable;
