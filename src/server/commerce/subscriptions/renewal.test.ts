import { describe, expect, it } from "vitest";

import { previewSubscriptionRenewal } from "@/server/commerce/subscriptions/renewal";

describe("previewSubscriptionRenewal", () => {
  it("creates a renewal invoice preview and retry date", () => {
    const preview = previewSubscriptionRenewal({
      subscriptionId: "sub_123",
      billingCurrencyCode: "USD",
      amount: 9.99,
      currentPeriodStart: "2026-03-01T00:00:00.000Z",
      currentPeriodEnd: "2026-04-01T00:00:00.000Z",
      retryCount: 2,
    });

    expect(preview.invoiceNumber).toBe("renewal-sub_123-2026-04-01");
    expect(preview.nextRetryAt).toBe("2026-04-03T00:00:00.000Z");
  });
});
