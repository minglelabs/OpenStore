import { describe, expect, it } from "vitest";

import { isProductEligibleForPaymentMethod } from "@/server/commerce/catalog/eligibility";

describe("isProductEligibleForPaymentMethod", () => {
  it("rejects one-time-only methods for subscriptions", () => {
    const eligible = isProductEligibleForPaymentMethod(
      {
        countryCode: "DE",
        currencyCode: "EUR",
        platform: "WEB",
        productType: "AUTO_RENEWING_SUBSCRIPTION",
        developerType: "THIRD_PARTY",
      },
      "IDEAL",
    );

    expect(eligible).toBe(false);
  });
});
