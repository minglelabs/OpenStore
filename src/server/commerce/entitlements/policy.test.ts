import { describe, expect, it, vi } from "vitest";

import { previewEntitlement } from "@/server/commerce/entitlements/policy";

describe("previewEntitlement", () => {
  it("activates one-time purchases after settlement", () => {
    const preview = previewEntitlement({
      productType: "NON_CONSUMABLE_IAP",
      orderStatus: "SUCCEEDED",
      purchasedAt: "2026-03-20T00:00:00.000Z",
    });

    expect(preview.status).toBe("ACTIVE");
  });

  it("keeps past-due subscriptions active during grace periods", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-20T00:00:00.000Z"));

    const preview = previewEntitlement({
      productType: "AUTO_RENEWING_SUBSCRIPTION",
      orderStatus: "SUCCEEDED",
      purchasedAt: "2026-03-01T00:00:00.000Z",
      subscriptionStatus: "PAST_DUE",
      currentPeriodEnd: "2026-03-20T00:00:00.000Z",
      gracePeriodEndsAt: "2026-03-25T00:00:00.000Z",
    });

    expect(preview.status).toBe("ACTIVE");
    expect(preview.endsAt).toBe("2026-03-25T00:00:00.000Z");

    vi.useRealTimers();
  });

  it("revokes access after refunds", () => {
    const preview = previewEntitlement({
      productType: "PAID_APP",
      orderStatus: "REFUNDED",
      purchasedAt: "2026-03-20T00:00:00.000Z",
    });

    expect(preview.status).toBe("REVOKED");
  });
});
