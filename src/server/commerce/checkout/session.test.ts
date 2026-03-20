import { describe, expect, it } from "vitest";

import { buildCheckoutSessionBlueprint } from "@/server/commerce/checkout/session";

describe("buildCheckoutSessionBlueprint", () => {
  it("builds a deterministic checkout session blueprint", () => {
    const blueprint = buildCheckoutSessionBlueprint({
      orderReference: "ORDER_123",
      countryCode: "US",
      currencyCode: "USD",
      platform: "WEB",
      productType: "PAID_APP",
      developerType: "THIRD_PARTY",
    });

    expect(blueprint.idempotencyKey).toBe(
      "checkout:order_123:MARKETPLACE:ADYEN",
    );
    expect(blueprint.checkoutSessionRef).toBe(
      "chk_order_123_adyen-apac-marketplace-secondary",
    );
  });
});
