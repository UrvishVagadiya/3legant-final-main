"use client";

import { DisplayProduct } from "@/components/product/DisplayProduct";
import { initialCartItems } from "@/constants/products";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import type { Product } from "@/store/slices/productSlice";

function toProduct(item: (typeof initialCartItems)[number]): Product {
  return {
    id: item.id,
    title: item.name,
    name: item.name,
    description: item.description,
    color: item.color,
    price: item.price,
    img: "",
    status: "active",
    oldprice: item.oldprice,
    sku: item.sku,
    category: item.category,
    validUntil: String(item.validUntil),
  };
}

function ProductContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get("id");
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(!!productId);

  useEffect(() => {
    if (productId) {
      router.replace(`/product/${productId}`);
      return;
    }

    setProduct(toProduct(initialCartItems[0]));
  }, [productId, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-[#141718] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) return null;

  return <DisplayProduct p={product} />;
}

export default function ProductPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="w-8 h-8 border-2 border-[#141718] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ProductContent />
    </Suspense>
  );
}
