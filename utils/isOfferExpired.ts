export function isOfferExpired(validUntil: string | number | null | undefined): boolean {
    if (!validUntil) return false;
    const now = Date.now();
    if (typeof validUntil === "number") {
        const ms = validUntil < 10000000000 ? validUntil * 1000 : validUntil;
        return ms < now;
    }
    const target = new Date(validUntil).getTime();
    return !isNaN(target) && target < now;
}
