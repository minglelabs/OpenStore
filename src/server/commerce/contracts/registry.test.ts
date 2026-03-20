import { describe, expect, it } from "vitest";

import {
  CommercePolicyError,
  listEligiblePaymentMethods,
  resolveCheckoutQuote,
} from "@/server/commerce/contracts/registry";

describe("resolveCheckoutQuote", () => {
  it("routes third-party subscriptions through the marketplace lane", () => {
    const quote = resolveCheckoutQuote({
      countryCode: "KR",
      currencyCode: "KRW",
      platform: "ANDROID",
      productType: "AUTO_RENEWING_SUBSCRIPTION",
      developerType: "THIRD_PARTY",
    });

    expect(quote.lane).toBe("MARKETPLACE");
    expect(quote.provider).toBe("STRIPE");
    expect(quote.paymentMethods).toEqual(["CARD", "APPLE_PAY", "GOOGLE_PAY"]);
    expect(quote.consumerContractVersion).toBe("kr-marketplace-v1");
  });

  it("falls back from merchant-of-record to marketplace when no mor route exists", () => {
    const quote = resolveCheckoutQuote({
      countryCode: "KR",
      currencyCode: "KRW",
      platform: "IOS",
      productType: "AUTO_RENEWING_SUBSCRIPTION",
      developerType: "FIRST_PARTY",
      preferMerchantOfRecord: false,
    });

    expect(quote.lane).toBe("MARKETPLACE");
    expect(quote.warnings).toHaveLength(0);
  });

  it("keeps first-party subscriptions on the merchant-of-record lane when requested", () => {
    const quote = resolveCheckoutQuote({
      countryCode: "DE",
      currencyCode: "EUR",
      platform: "WEB",
      productType: "AUTO_RENEWING_SUBSCRIPTION",
      developerType: "FIRST_PARTY",
      preferMerchantOfRecord: true,
    });

    expect(quote.lane).toBe("MERCHANT_OF_RECORD");
    expect(quote.provider).toBe("PADDLE");
    expect(quote.paymentMethods).toContain("PAYPAL");
    expect(quote.consumerContractVersion).toBe("de-mor-v1");
  });

  it("suppresses one-time-only local methods for subscriptions", () => {
    const quote = resolveCheckoutQuote({
      countryCode: "DE",
      currencyCode: "EUR",
      platform: "WEB",
      productType: "AUTO_RENEWING_SUBSCRIPTION",
      developerType: "THIRD_PARTY",
      preferredProvider: "STRIPE",
    });

    expect(quote.paymentMethods).toEqual([
      "CARD",
      "APPLE_PAY",
      "GOOGLE_PAY",
      "SEPA_DEBIT",
    ]);
    expect(quote.suppressedPaymentMethods).toEqual([
      "IDEAL",
      "BANCONTACT",
      "SOFORT",
    ]);
  });

  it("throws a policy error for unsupported storefront regions", () => {
    expect(() =>
      resolveCheckoutQuote({
        countryCode: "BR",
        currencyCode: "BRL",
        platform: "WEB",
        productType: "PAID_APP",
        developerType: "THIRD_PARTY",
      }),
    ).toThrowError(CommercePolicyError);
  });
});

describe("listEligiblePaymentMethods", () => {
  it("returns recurring-capable methods only for subscriptions", () => {
    const methods = listEligiblePaymentMethods({
      countryCode: "DE",
      currencyCode: "EUR",
      platform: "WEB",
      productType: "AUTO_RENEWING_SUBSCRIPTION",
      developerType: "THIRD_PARTY",
    });

    expect(methods).toEqual(["CARD", "APPLE_PAY", "GOOGLE_PAY", "SEPA_DEBIT"]);
  });
});
