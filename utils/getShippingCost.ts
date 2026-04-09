export function getShippingCost(method: string, subtotal = 0): number {
    if (method === "express") return 15;
    if (method === "pickup") return subtotal * 0.21;
    return 0;
}
