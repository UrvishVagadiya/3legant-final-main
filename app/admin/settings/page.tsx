"use client";

import React, { useState, useEffect } from "react";
import { Save, RefreshCw, Clock, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminSettings() {
  const [refundPeriod, setRefundPeriod] = useState<number>(7);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (res.ok) {
        if (data.refund_period) {
          setRefundPeriod(data.refund_period.days || 7);
        }
      } else {
        toast.error(data.error || "Failed to fetch settings");
      }
    } catch (err) {
      toast.error("An error occurred while fetching settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: "refund_period",
          value: { days: refundPeriod },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Settings updated successfully");
      } else {
        toast.error(data.error || "Failed to update settings");
      }
    } catch (err) {
      toast.error("An error occurred while saving settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#6C7275]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-[#141718]">Store Settings</h2>
        <p className="text-[#6C7275]">Manage your global store configurations and policies.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <h3 className="text-lg font-semibold text-[#141718] mb-2 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#38CB89]" />
            Refund Policy
          </h3>
          <p className="text-sm text-[#6C7275]">
            Configure the time window during which customers can request refunds after their order has been delivered.
          </p>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#141718] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#6C7275]" />
                  Refund Period (Days)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={refundPeriod}
                    onChange={(e) => setRefundPeriod(parseInt(e.target.value) || 1)}
                    className="w-32 px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#141718] transition-all"
                  />
                  <span className="text-sm text-[#6C7275]">days after delivery</span>
                </div>
                <p className="text-xs text-[#9CA3AF] mt-1">
                  Customers will not be able to request a refund once this period has elapsed.
                </p>
              </div>
            </div>

            <div className="bg-gray-50/50 px-6 py-4 flex justify-end border-t border-gray-100">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#141718] text-white rounded-full text-sm font-medium hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
