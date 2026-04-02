export function getShippingCost(method: string): number {
    if (method === "express") return 15;
    if (method === "pickup") return 21;
    return 0;
}
