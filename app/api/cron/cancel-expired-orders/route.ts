import { NextRequest, NextResponse } from "next/server";
import { cancelExpiredStripeOrders } from "@/utils/stripe/cancelExpiredOrders";

export async function GET(request: NextRequest) {
    if (request.headers.get("x-vercel-cron") !== "1") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await cancelExpiredStripeOrders();

    if (result.errors.length > 0) {
        return NextResponse.json(
            { error: "Failed to clean up expired orders", result },
            { status: 500 }
        );
    }

    return NextResponse.json({
        success: true,
        cancelledOrderIds: result.cancelledOrderIds,
        skippedOrderIds: result.skippedOrderIds,
    });
}