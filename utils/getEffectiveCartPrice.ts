import { isOfferExpired } from "@/utils/isOfferExpired";

type PriceLike = string | number | null | undefined;

type EffectivePriceItem = {
    price: PriceLike;
    mrp?: PriceLike;
    oldprice?: PriceLike;
    old_price?: PriceLike;
    MRP?: PriceLike;
    validUntil?: string | number | null;
    valid_until?: string | number | null;
};

const parsePrice = (value: PriceLike): number => {
    if (typeof value === "number") {
        return Number.isFinite(value) ? value : 0;
    }

    if (typeof value === "string") {
        const parsed = Number(value.replace(/[^0-9.-]/g, ""));
        return Number.isFinite(parsed) ? parsed : 0;
    }

    return 0;
};

export const getEffectiveCartPrice = (item: EffectivePriceItem): number => {
    const salePrice = parsePrice(item.price);
    const mrp =
        parsePrice(item.mrp) ||
        parsePrice(item.oldprice) ||
        parsePrice(item.old_price) ||
        parsePrice(item.MRP);

    const isExpired = isOfferExpired(item.validUntil ?? item.valid_until);

    if (isExpired && mrp > 0) {
        return mrp;
    }

    if (salePrice > 0) {
        return salePrice;
    }

    return mrp;
};

export const getEffectiveCartLineTotal = (item: EffectivePriceItem & { quantity: number }) => {
    return getEffectiveCartPrice(item) * Math.max(0, Number(item.quantity) || 0);
};
