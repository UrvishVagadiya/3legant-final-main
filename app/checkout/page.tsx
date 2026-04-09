"use client";
import React, { useState, useEffect } from "react";
import CheckoutStepper from "@/components/sections/CheckoutStepper";
import ContactInfo from "@/components/checkout/ContactInfo";
import ShippingSection from "@/components/checkout/ShippingSection";
import BillingSection from "@/components/checkout/BillingSection";
import PaymentSection from "@/components/checkout/PaymentSection";
import OrderSummary from "@/components/checkout/OrderSummary";
import { SavedAddress } from "@/components/checkout/SavedAddressSelector";
import { useAppDispatch, useAppSelector, RootState } from "@/store";
import { updateQuantity, setShippingMethod } from "@/store/slices/cartSlice";
import { useIsMounted } from "@/hooks/useIsMounted";
import { getShippingCost } from "@/utils/getShippingCost";
import { createClient } from "@/utils/supabase/client";
import {
  Coupon,
  calculateCouponDiscount,
  validateCoupon,
} from "@/utils/coupon";
import {
  InfoData,
  billingKeys,
  initialForm,
  applyAddress,
  validateCheckoutForm,
} from "@/utils/checkoutForm";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { typography } from "@/constants/typography";
import { useSaveAddressMutation } from "@/store/api/addressApi";
import {
  getEffectiveCartLineTotal,
  getEffectiveCartPrice,
} from "@/utils/getEffectiveCartPrice";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

export default function Checkout() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const { items: cartItems, shippingMethod } = useAppSelector(
    (state: RootState) => state.cart,
  );
  const searchParams = useSearchParams();
  const isMounted = useIsMounted();

  const [useDifferentBilling, setUseDifferentBilling] = useState(false);
  const [savedShipping, setSavedShipping] = useState<SavedAddress[]>([]);
  const [savedBilling, setSavedBilling] = useState<SavedAddress[]>([]);
  const [selShippingId, setSelShippingId] = useState("new");
  const [selBillingId, setSelBillingId] = useState("new");
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveAddress] = useSaveAddressMutation();

  const [placing, setPlacing] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = cartItems.reduce(
    (a, i) => a + getEffectiveCartLineTotal(i),
    0,
  );
  const shippingCost = getShippingCost(shippingMethod);
  const total = subtotal + shippingCost - couponDiscount;

  useEffect(() => {
    if (!appliedCoupon) {
      if (couponDiscount !== 0) {
        setCouponDiscount(0);
      }
      return;
    }

    if (subtotal < appliedCoupon.min_order_amount) {
      setAppliedCoupon(null);
      setCouponDiscount(0);
      toast.error(
        `Coupon removed. Minimum order amount is $${appliedCoupon.min_order_amount.toFixed(2)}`,
      );
      return;
    }

    const nextDiscount = calculateCouponDiscount(appliedCoupon, subtotal);
    if (nextDiscount !== couponDiscount) {
      setCouponDiscount(nextDiscount);
    }
  }, [appliedCoupon, subtotal, couponDiscount]);

  // ── Coupon ──────────────────────────────────────────────────────────────
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    const result = await validateCoupon(couponCode.trim(), subtotal, user?.id);
    if (result.valid && result.coupon) {
      setAppliedCoupon(result.coupon);
      setCouponDiscount(result.discount);
      setCouponCode("");
      toast.success(`Coupon applied! You saved $${result.discount.toFixed(2)}`);
    } else {
      toast.error(result.error || "Invalid coupon");
    }
    setCouponLoading(false);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
  };

  // ── Cart ─────────────────────────────────────────────────────────────────
  const handleUpdateQuantity = (
    id: string,
    color: string,
    quantity: number,
  ) => {
    const item = cartItems.find((i) => i.id === id && i.color === color);
    if (!item) return;
    if (quantity < 0) return;
    if (quantity === 0) {
      dispatch(updateQuantity({ id, color, quantity }));
      return;
    }
    if (item.stock <= 0 || quantity > item.stock) return;
    dispatch(updateQuantity({ id, color, quantity }));
  };

  const handleSetShippingMethod = (method: string) => {
    dispatch(setShippingMethod(method));
  };

  useEffect(() => {
    if (!isMounted) return;
    if (cartItems.length === 0) {
      router.replace("/cart");
    }
  }, [cartItems.length, isMounted, router]);

  // ── Load user data & saved addresses ────────────────────────────────────
  useEffect(() => {
    const cancelled = searchParams.get("cancelled");
    if (cancelled) {
      toast.error("Payment not completed yet. You can continue checkout.");
    }

    if (!user) return;
    (async () => {
      const supabase = createClient();
      const meta = user.user_metadata || {};

      let fName = meta.first_name || "";
      let lName = meta.last_name || "";

      const nameFromMeta = meta.name || meta.full_name || "";
      if (nameFromMeta) {
        const parts = nameFromMeta.split(" ");
        if (!fName) fName = parts[0] || "";
        if (!lName) lName = parts.slice(1).join(" ") || "";
      }

      if (!fName || !lName) {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle();

        if (profile?.full_name) {
          const parts = profile.full_name.split(" ");
          if (!fName) fName = parts[0] || "";
          if (!lName) lName = parts.slice(1).join(" ") || "";
        }
      }

      setFormData((p) => ({
        ...p,
        email: user.email || p.email,
        firstName: fName || p.firstName,
        lastName: lName || p.lastName,
        billingFirstName: fName || p.billingFirstName,
        billingLastName: lName || p.billingLastName,
      }));

      const { data } = await supabase
        .from("user_addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (!data?.length) return;
      const ship = data.filter((a: SavedAddress) => a.type === "shipping");
      const bill = data.filter((a: SavedAddress) => a.type === "billing");
      setSavedShipping(ship);
      setSavedBilling(bill);

      const ds = ship.find((a: SavedAddress) => a.is_default) || ship[0];
      if (ds) {
        setSelShippingId(ds.id);
        const addressData = applyAddress(ds, false);
        setFormData((p) => ({
          ...p,
          ...addressData,
          firstName: addressData.firstName || p.firstName,
          lastName: addressData.lastName || p.lastName,
          email: addressData.email || p.email,
        }));
      }
      const db = bill.find((a: SavedAddress) => a.is_default) || bill[0];
      if (db) {
        setSelBillingId(db.id);
        const billData = applyAddress(db, true);
        setFormData((p) => ({
          ...p,
          ...billData,
          billingFirstName: billData.billingFirstName || p.billingFirstName,
          billingLastName: billData.billingLastName || p.billingLastName,
        }));
      }
    })();
  }, [user, searchParams]);

  // ── Address selector ─────────────────────────────────────────────────────
  const handleSelect = (id: string, type: "shipping" | "billing") => {
    const b = type === "billing";
    (b ? setSelBillingId : setSelShippingId)(id);
    if (id === "new") {
      setFormData((p) => {
        const u = { ...p };
        (b ? billingKeys : [...InfoData]).forEach((k) => (u[k] = ""));
        return u;
      });
    } else {
      const a = (b ? savedBilling : savedShipping).find((x) => x.id === id);
      if (a) setFormData((p) => ({ ...p, ...applyAddress(a, b) }));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name])
      setErrors((p) => {
        const n = { ...p };
        delete n[name];
        return n;
      });
  };

  // ── Save address helper ──────────────────────────────────────────────────
  const saveCheckoutAddress = async (type: "shipping" | "billing") => {
    if (!user?.id) return;
    const selectedId = type === "shipping" ? selShippingId : selBillingId;
    if (selectedId !== "new") return;

    const isBilling = type === "billing";
    const name = isBilling
      ? `${formData.billingFirstName} ${formData.billingLastName}`.trim()
      : `${formData.firstName} ${formData.lastName}`.trim();

    await saveAddress({
      userId: user.id,
      modalFixedType: type,
      data: {
        type,
        name,
        phone: isBilling ? formData.billingPhone : formData.phone,
        email: isBilling ? undefined : formData.email,
        address: isBilling
          ? formData.billingStreetAddress
          : formData.streetAddress,
        street_address: isBilling
          ? formData.billingStreetAddress
          : formData.streetAddress,
        city: isBilling ? formData.billingCity : formData.city,
        state: isBilling ? formData.billingState : formData.state,
        zip_code: isBilling ? formData.billingZipCode : formData.zipCode,
        country: isBilling ? formData.billingCountry : formData.country,
      },
    }).unwrap();
  };

  // ── Place order → calls Supabase edge function directly ─────────────────
  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    const newErrors = validateCheckoutForm(formData, useDifferentBilling);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      document
        .querySelector(".border-red-500")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (!user) {
      toast.error("Please sign in to place an order");
      return;
    }

    setPlacing(true);
    try {
      const supabaseClient = createClient();
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();

      if (!session?.access_token) {
        toast.error("Your session has expired. Please sign in again.");
        return;
      }

      // Save new addresses
      try {
        await saveCheckoutAddress("shipping");
        if (useDifferentBilling) await saveCheckoutAddress("billing");
      } catch (saveError: unknown) {
        console.error("Save address error:", saveError);
        const msg =
          typeof saveError === "object" &&
          saveError !== null &&
          "data" in saveError &&
          typeof (saveError as { data?: unknown }).data === "string"
            ? (saveError as { data: string }).data
            : "Please complete all required address fields before payment.";
        toast.error(msg);
        return;
      }

      const finalTotal = subtotal + shippingCost - couponDiscount;

      // Call Supabase edge function directly (no Next.js API route needed)
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Pass the user's JWT so the edge function can verify auth
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            cart_items: cartItems.map((i) => ({
              product_id: i.id,
              title: i.name,
              img: i.image,
              quantity: i.quantity,
              unit_price: getEffectiveCartPrice(i),
              color: i.color ?? null,
            })),
            shipping_data: {
              first_name: formData.firstName,
              last_name: formData.lastName,
              email: formData.email,
              phone: formData.phone,
              street_address: formData.streetAddress,
              city: formData.city,
              state: formData.state,
              zip_code: formData.zipCode,
              country: formData.country,
            },
            billing_data: useDifferentBilling
              ? {
                  first_name: formData.billingFirstName,
                  last_name: formData.billingLastName,
                  phone: formData.billingPhone,
                  street_address: formData.billingStreetAddress,
                  city: formData.billingCity,
                  state: formData.billingState,
                  zip_code: formData.billingZipCode,
                  country: formData.billingCountry,
                }
              : null,
            has_different_billing: useDifferentBilling,
            shipping_method: shippingMethod,
            shipping_cost: shippingCost,
            coupon_code: appliedCoupon?.code ?? null,
            coupon_id: appliedCoupon?.id ?? null,
            discount: couponDiscount,
            subtotal,
            total: finalTotal,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        toast.error(data.error || "Failed to create checkout session");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Unable to redirect to payment page");
      }
    } catch (err) {
      console.error("Place order error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (!isMounted) return null;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-300 mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-20 font-inter text-[#141718]">
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-[#6C7275]">
          Redirecting to cart...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-300 mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-20 font-inter text-[#141718]">
      <div className="flex flex-col items-center justify-center mb-8">
        <h1 className={`${typography.h3} mb-4`}>Check Out</h1>
        <CheckoutStepper step={2} />
      </div>
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 w-full">
        <div className="w-full lg:w-[65%] space-y-8">
          <ContactInfo
            formData={formData}
            errors={errors}
            onChange={handleInputChange}
          />
          <ShippingSection
            savedAddresses={savedShipping}
            selectedId={selShippingId}
            onSelect={(id) => handleSelect(id, "shipping")}
            formData={formData}
            errors={errors}
            onChange={handleInputChange}
            useDifferentBilling={useDifferentBilling}
            onBillingToggle={setUseDifferentBilling}
          />
          {useDifferentBilling && (
            <BillingSection
              savedAddresses={savedBilling}
              selectedId={selBillingId}
              onSelect={(id) => handleSelect(id, "billing")}
              formData={formData}
              errors={errors}
              onChange={handleInputChange}
            />
          )}
          <PaymentSection
            placing={placing}
            hasItems={cartItems.length > 0}
            onPlaceOrder={handlePlaceOrder}
          />
        </div>
        <div className="w-full lg:w-[35%]">
          <OrderSummary
            cartItems={cartItems.map((item) => ({
              ...item,
              price: getEffectiveCartPrice(item),
            }))}
            updateQuantity={handleUpdateQuantity}
            subtotal={subtotal}
            shippingCost={shippingCost}
            shippingMethod={shippingMethod}
            discount={couponDiscount}
            total={total}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            onApplyCoupon={handleApplyCoupon}
            couponLoading={couponLoading}
            appliedCoupon={appliedCoupon}
            onRemoveCoupon={removeCoupon}
            setShippingMethod={handleSetShippingMethod}
            placing={placing}
            onPlaceOrder={handlePlaceOrder}
          />
        </div>
      </div>
    </div>
  );
}
