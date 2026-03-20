import { TRPCError } from "@trpc/server";
import { describe, expect, it } from "vitest";

import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

function createCaller() {
  return appRouter.createCaller(createTRPCContext());
}

describe("commerceRouter", () => {
  it("returns a checkout quote for marketplace subscriptions", async () => {
    const caller = createCaller();
    const quote = await caller.commerce.policy.quoteCheckout({
      countryCode: "DE",
      currencyCode: "EUR",
      platform: "WEB",
      productType: "AUTO_RENEWING_SUBSCRIPTION",
      developerType: "THIRD_PARTY",
    });

    expect(quote.lane).toBe("MARKETPLACE");
    expect(quote.paymentMethods).toEqual([
      "STORE_BALANCE",
      "APPLE_PAY",
      "CARD",
      "PAYPAL",
    ]);
    expect(quote.parityGapPaymentMethods).toEqual(["CARRIER_BILLING"]);
  });

  it("returns a balanced ledger preview", async () => {
    const caller = createCaller();
    const preview = await caller.commerce.ledger.previewPurchase({
      orderId: "order_123",
      eventId: "evt_123",
      currencyCode: "USD",
      grossAmount: 29.99,
      taxAmount: 2.99,
      developerAmount: 15,
      reserveAmount: 3,
      processorFeeAmount: 0.99,
      occurredAt: "2026-03-20T10:00:00.000Z",
    });

    expect(preview.debits).toBe(preview.credits);
    expect(preview.platformGrossRevenue).toBe(12);
  });

  it("returns entitlement previews for active subscriptions", async () => {
    const caller = createCaller();
    const preview = await caller.commerce.entitlements.preview({
      productType: "AUTO_RENEWING_SUBSCRIPTION",
      orderStatus: "SUCCEEDED",
      purchasedAt: "2026-03-01T00:00:00.000Z",
      subscriptionStatus: "ACTIVE",
      currentPeriodEnd: "2026-04-01T00:00:00.000Z",
    });

    expect(preview.status).toBe("ACTIVE");
    expect(preview.endsAt).toBe("2026-04-01T00:00:00.000Z");
  });

  it("raises a bad request when a region is not configured", async () => {
    const caller = createCaller();

    await expect(
      caller.commerce.policy.quoteCheckout({
        countryCode: "BR",
        currencyCode: "BRL",
        platform: "WEB",
        productType: "PAID_APP",
        developerType: "THIRD_PARTY",
      }),
    ).rejects.toEqual(
      expect.objectContaining<Partial<TRPCError>>({
        code: "BAD_REQUEST",
        message: "OpenStore does not have a storefront policy for BR.",
      }),
    );
  });
});
