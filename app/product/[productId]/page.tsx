"use client";

import { DisplayProduct } from "@/components/product/DisplayProduct";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ProductDetailsSkeleton } from "@/components/ui/ProductDetailsSkeleton";
import { useGetProductByIdQuery } from "@/store/api/productApi";

export default function ProductPage() {
  const { productId } = useParams<{ productId: string }>();
  const { data: productData, isLoading } = useGetProductByIdQuery(productId);

  if (isLoading) {
    return <ProductDetailsSkeleton />;
  }

  if (!productData) {
    // If not loading and no data, show error or redirect
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h2 className="text-2xl font-medium">Product not found</h2>
        <button 
          onClick={() => window.location.href = '/shop'}
          className="bg-black text-white px-6 py-2 rounded-lg"
        >
          Back to Shop
        </button>
      </div>
    );
  }

  // Format product for DisplayProduct
  const formattedProduct = {
    ...productData,
    name: productData.title || productData.name,
    oldprice: productData.mrp || productData.oldprice || 0,
    validUntil: productData.validUntil || productData.valid_until,
    image_url: productData.img,
  };

  return <DisplayProduct p={formattedProduct} />;
}
