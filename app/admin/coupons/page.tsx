"use client";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import toast from "react-hot-toast";
import CouponFormModal, { CouponForm, emptyCouponForm } from "@/components/admin/CouponFormModal";

interface Coupon {
  id: string; code: string; discount_type: "percentage" | "fixed"; discount_value: number;
  min_order_amount: number | null; max_discount_amount: number | null;
  usage_limit: number | null; used_count: number; valid_from: string; valid_until: string;
  is_active: boolean; created_at: string;
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [form, setForm] = useState<CouponForm>(emptyCouponForm);
  const [saving, setSaving] = useState(false);

  const fetchCoupons = async () => { const res = await fetch("/api/admin/coupons"); if (res.ok) setCoupons(await res.json()); setLoading(false); };
  useEffect(() => { fetchCoupons(); }, []);

  const openEdit = (c: Coupon) => {
    setEditingCoupon(c);
    setForm({ code: c.code, discount_type: c.discount_type, discount_value: c.discount_value, min_order_amount: c.min_order_amount, max_discount_amount: c.max_discount_amount, usage_limit: c.usage_limit, valid_from: c.valid_from ? c.valid_from.slice(0, 16) : "", valid_until: c.valid_until ? c.valid_until.slice(0, 16) : "", is_active: c.is_active });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.code.trim()) { toast.error("Coupon code is required"); return; }
    if (form.discount_value <= 0) { toast.error("Discount value must be positive"); return; }
    if (!form.valid_from || !form.valid_until) { toast.error("Validity dates are required"); return; }
    setSaving(true);
    const payload = { code: form.code.toUpperCase().trim(), discount_type: form.discount_type, discount_value: form.discount_value, min_order_amount: form.min_order_amount || null, max_discount_amount: form.max_discount_amount || null, usage_limit: form.usage_limit || null, valid_from: new Date(form.valid_from).toISOString(), valid_until: new Date(form.valid_until).toISOString(), is_active: form.is_active };
    if (editingCoupon) {
      const res = await fetch("/api/admin/coupons", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editingCoupon.id, ...payload }) });
      if (!res.ok) { toast.error("Failed to update coupon"); setSaving(false); return; }
      toast.success("Coupon updated");
    } else {
      const res = await fetch("/api/admin/coupons", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) { let msg = "Failed to create coupon"; try { const err = await res.json(); if (err.error?.includes("duplicate")) msg = "Coupon code already exists"; else if (err.error) msg = err.error; } catch { } toast.error(msg); setSaving(false); return; }
      toast.success("Coupon created");
    }
    setSaving(false); setShowModal(false); fetchCoupons();
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    const res = await fetch(`/api/admin/coupons?id=${id}`, { method: "DELETE" });
    if (!res.ok) { toast.error("Failed to delete"); return; }
    toast.success("Coupon deleted"); setCoupons((p) => p.filter((c) => c.id !== id));
  };

  const toggleActive = async (c: Coupon) => {
    const ns = !c.is_active;
    const res = await fetch("/api/admin/coupons", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: c.id, is_active: ns }) });
    if (!res.ok) { toast.error("Failed to toggle status"); return; }
    setCoupons((p) => p.map((x) => x.id === c.id ? { ...x, is_active: ns } : x));
    toast.success(ns ? "Coupon activated" : "Coupon deactivated");
  };

  const filtered = coupons.filter((c) => c.code.toLowerCase().includes(searchQuery.toLowerCase()));
  const isExpired = (c: Coupon) => new Date(c.valid_until) < new Date();

  if (loading) return <div className="text-[#6C7275]">Loading coupons...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search coupons..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#141718]" />
        </div>
        <button onClick={() => { setEditingCoupon(null); setForm(emptyCouponForm); setShowModal(true); }} className="flex items-center gap-2 bg-[#141718] text-white px-5 py-2.5 rounded-lg text-sm hover:bg-black transition-colors"><Plus size={16} /> Add Coupon</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-[#6C7275]">
              <tr>{["Code", "Discount", "Min Order", "Usage", "Validity", "Status", "Actions"].map((h) => <th key={h} className="text-left px-6 py-3 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono font-semibold text-[#141718]">{c.code}</td>
                  <td className="px-6 py-4 text-[#141718]">
                    {c.discount_type === "percentage" ? `${c.discount_value}%` : `$${Number(c.discount_value).toFixed(2)}`}
                    {c.max_discount_amount && c.discount_type === "percentage" && <span className="block text-xs text-[#6C7275]">Max: ${Number(c.max_discount_amount).toFixed(2)}</span>}
                  </td>
                  <td className="px-6 py-4 text-[#6C7275]">{c.min_order_amount ? `$${Number(c.min_order_amount).toFixed(2)}` : "—"}</td>
                  <td className="px-6 py-4 text-[#6C7275]">{c.used_count}{c.usage_limit ? ` / ${c.usage_limit}` : ""}</td>
                  <td className="px-6 py-4 text-xs text-[#6C7275]"><p>{new Date(c.valid_from).toLocaleDateString()}</p><p>{new Date(c.valid_until).toLocaleDateString()}</p></td>
                  <td className="px-6 py-4">
                    {isExpired(c) ? <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Expired</span> : (
                      <button onClick={() => toggleActive(c)} className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${c.is_active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-700 hover:bg-red-200"}`}>{c.is_active ? "Active" : "Inactive"}</button>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(c)} className="p-2 hover:bg-gray-100 rounded-lg text-[#6C7275] hover:text-[#141718]"><Pencil size={16} /></button>
                      <button onClick={() => deleteCoupon(c.id)} className="p-2 hover:bg-red-50 rounded-lg text-[#6C7275] hover:text-red-600"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} className="px-6 py-12 text-center text-[#6C7275]">No coupons found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <CouponFormModal form={form} setForm={setForm} editing={!!editingCoupon} saving={saving} onSave={handleSave} onClose={() => setShowModal(false)} />}
    </div>
  );
}
