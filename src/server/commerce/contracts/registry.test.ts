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
    expect(quote.provider).toBe("ADYEN");
    expect(quote.paymentMethods).toEqual(["CARD"]);
    expect(quote.parityGapPaymentMethods).toContain("KAKAOPAY");
    expect(quote.consumerContractVersion).toBe("kr-marketplace-v1");
  });

  it("keeps first-party products on the marketplace lane when mor is not requested", () => {
    const quote = resolveCheckoutQuote({
      countryCode: "KR",
      currencyCode: "KRW",
      platform: "WEB",
      productType: "AUTO_RENEWING_SUBSCRIPTION",
      developerType: "FIRST_PARTY",
      preferMerchantOfRecord: false,
    });

    expect(quote.lane).toBe("MARKETPLACE");
    expect(quote.provider).toBe("ADYEN");
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
      countryCode: "BE",
      currencyCode: "EUR",
      platform: "WEB",
      productType: "AUTO_RENEWING_SUBSCRIPTION",
      developerType: "THIRD_PARTY",
      preferredProvider: "STRIPE",
    });

    expect(quote.paymentMethods).toEqual(["STORE_BALANCE", "APPLE_PAY", "CARD"]);
    expect(quote.suppressedPaymentMethods).toContain("BANCONTACT");
    expect(quote.warnings).toContain(
      "Recurring billing suppressed one-time methods: IDEAL, BANCONTACT, SOFORT.",
    );
  });

  it("removes platform-incompatible wallets from the checkout quote", () => {
    const iosQuote = resolveCheckoutQuote({
      countryCode: "US",
      currencyCode: "USD",
      platform: "IOS",
      productType: "PAID_APP",
      developerType: "THIRD_PARTY",
    });
    const androidQuote = resolveCheckoutQuote({
      countryCode: "US",
      currencyCode: "USD",
      platform: "ANDROID",
      productType: "PAID_APP",
      developerType: "THIRD_PARTY",
    });

    expect(iosQuote.paymentMethods).not.toContain("GOOGLE_PAY");
    expect(androidQuote.paymentMethods).not.toContain("APPLE_PAY");
  });

  it("excludes add-funds-only methods from purchase parity targets", () => {
    const quote = resolveCheckoutQuote({
      countryCode: "IN",
      currencyCode: "INR",
      platform: "WEB",
      productType: "PAID_APP",
      developerType: "THIRD_PARTY",
    });

    expect(quote.parityTargetPaymentMethods).toEqual(["STORE_BALANCE", "UPI"]);
    expect(quote.paymentMethods).toEqual(["STORE_BALANCE", "UPI"]);
  });

  it("tracks Apple parity gaps for local methods that are not yet wired on a route", () => {
    const quote = resolveCheckoutQuote({
      countryCode: "CN",
      currencyCode: "CNY",
      platform: "WEB",
      productType: "PAID_APP",
      developerType: "THIRD_PARTY",
    });

    expect(quote.paymentMethods).toEqual([
      "ALIPAY",
      "STORE_BALANCE",
      "CARD",
      "WECHAT_PAY",
    ]);
    expect(quote.parityGapPaymentMethods).toEqual(["DOUYIN_PAY"]);
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

    expect(methods).toEqual(["STORE_BALANCE", "APPLE_PAY", "CARD", "PAYPAL"]);
  });
});
