"use client";
import { X } from "lucide-react";

export type CouponForm = {
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number | null;
  max_discount_amount: number | null;
  usage_limit: number | null;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
};

export const emptyCouponForm: CouponForm = {
  code: "",
  discount_type: "percentage",
  discount_value: 0,
  min_order_amount: null,
  max_discount_amount: null,
  usage_limit: null,
  valid_from: "",
  valid_until: "",
  is_active: true,
};

interface Props {
  form: CouponForm;
  setForm: React.Dispatch<React.SetStateAction<CouponForm>>;
  editing: boolean;
  saving: boolean;
  onSave: () => void;
  onClose: () => void;
}

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div>
    <label className="block text-sm font-medium text-[#141718] mb-1">
      {label}
    </label>
    {children}
  </div>
);

const inputCls =
  "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#141718]";

export default function CouponFormModal({
  form,
  setForm,
  editing,
  saving,
  onSave,
  onClose,
}: Props) {
  const upd = (key: keyof CouponForm, val: CouponForm[keyof CouponForm]) =>
    setForm((p) => ({ ...p, [key]: val }));
  const numOrNull = (v: string) => (v ? Number(v) : null);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-[#141718]">
            {editing ? "Edit Coupon" : "Add Coupon"}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <Field label="Coupon Code *">
            <input
              type="text"
              value={form.code}
              onChange={(e) => upd("code", e.target.value)}
              placeholder="e.g. SAVE20"
              className={`${inputCls} uppercase`}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Discount Type *">
              <select
                value={form.discount_type}
                onChange={(e) => upd("discount_type", e.target.value)}
                className={inputCls}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed ($)</option>
              </select>
            </Field>
            <Field label="Discount Value *">
              <input
                type="number"
                value={form.discount_value || ""}
                onChange={(e) => upd("discount_value", Number(e.target.value))}
                min={0}
                className={inputCls}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Min Order Amount">
              <input
                type="number"
                value={form.min_order_amount ?? ""}
                onChange={(e) =>
                  upd("min_order_amount", numOrNull(e.target.value))
                }
                min={0}
                className={inputCls}
              />
            </Field>
            <Field label="Max Discount">
              <input
                type="number"
                value={form.max_discount_amount ?? ""}
                onChange={(e) =>
                  upd("max_discount_amount", numOrNull(e.target.value))
                }
                min={0}
                className={inputCls}
              />
            </Field>
          </div>
          <Field label="Usage Limit">
            <input
              type="number"
              value={form.usage_limit ?? ""}
              onChange={(e) => upd("usage_limit", numOrNull(e.target.value))}
              min={0}
              placeholder="Leave empty for unlimited"
              className={inputCls}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Valid From *">
              <input
                type="datetime-local"
                value={form.valid_from}
                onChange={(e) => upd("valid_from", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Valid Until *">
              <input
                type="datetime-local"
                value={form.valid_until}
                onChange={(e) => upd("valid_until", e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={form.is_active}
              onChange={(e) => upd("is_active", e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <label htmlFor="is_active" className="text-sm text-[#141718]">
              Active
            </label>
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-[#141718] py-2.5 rounded-lg text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex-1 bg-[#141718] text-white py-2.5 rounded-lg text-sm hover:bg-black disabled:opacity-50"
          >
            {saving ? "Saving..." : editing ? "Update Coupon" : "Create Coupon"}
          </button>
        </div>
      </div>
    </div>
  );
}
