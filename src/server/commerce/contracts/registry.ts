export const commerceLanes = ["MARKETPLACE", "MERCHANT_OF_RECORD"] as const;
export const paymentProviders = ["STRIPE", "ADYEN", "PADDLE"] as const;
export const paymentMethodTypes = [
  "STORE_BALANCE",
  "CARD",
  "APPLE_PAY",
  "GOOGLE_PAY",
  "PAYPAL",
  "CARRIER_BILLING",
  "ACH_DEBIT",
  "SEPA_DEBIT",
  "IDEAL",
  "BANCONTACT",
  "SOFORT",
  "ALIPAY",
  "WECHAT_PAY",
  "DOUYIN_PAY",
  "UPI",
  "EPS_TOPUP",
  "NET_BANKING_TOPUP",
  "MERPAY",
  "PAYPAY",
  "KAKAOPAY",
  "NAVER_PAY",
  "PAYCO",
  "TOSS_PAY",
  "MOMO",
  "SHOPEEPAY",
  "VNPAY",
  "ZALOPAY",
  "DANA",
  "GOPAY",
  "GCASH",
  "TRUEMONEY",
] as const;
export const productTypes = [
  "PAID_APP",
  "CONSUMABLE_IAP",
  "NON_CONSUMABLE_IAP",
  "AUTO_RENEWING_SUBSCRIPTION",
] as const;
export const checkoutPlatforms = ["WEB", "IOS", "ANDROID"] as const;
export const developerTypes = ["FIRST_PARTY", "THIRD_PARTY"] as const;
export const taxModes = ["PSP_NATIVE", "DEDICATED_ENGINE", "MANUAL"] as const;

export type CommerceLane = (typeof commerceLanes)[number];
export type PaymentProvider = (typeof paymentProviders)[number];
export type PaymentMethodType = (typeof paymentMethodTypes)[number];
export type ProductType = (typeof productTypes)[number];
export type CheckoutPlatform = (typeof checkoutPlatforms)[number];
export type DeveloperType = (typeof developerTypes)[number];
export type TaxMode = (typeof taxModes)[number];

export type CheckoutQuoteInput = {
  countryCode: string;
  currencyCode: string;
  platform: CheckoutPlatform;
  productType: ProductType;
  developerType: DeveloperType;
  preferMerchantOfRecord?: boolean;
  preferredProvider?: PaymentProvider;
};

export type StorefrontRegionPolicy = {
  countryCode: string;
  currencyCode: string;
  languageCode: string;
  taxMode: TaxMode;
  consumerContractVersions: Record<CommerceLane, string>;
  appleParityPaymentMethods: PaymentMethodType[];
  topUpOnlyPaymentMethods?: PaymentMethodType[];
};

export type MerchantEntity = {
  code: string;
  legalName: string;
  homeCountryCode: string;
  defaultCurrencyCode: string;
};

export type MerchantAccount = {
  key: string;
  entityCode: string;
  provider: PaymentProvider;
  lane: CommerceLane;
  displayName: string;
  settlementCurrencyCode: string;
  settlementCountryCode: string;
  allowsRecurring: boolean;
};

export type PspRoute = {
  key: string;
  entityCode: string;
  merchantAccountKey: string;
  provider: PaymentProvider;
  lane: CommerceLane;
  supportedCountries: string[];
  supportedCurrencies: string[];
  priority: number;
  paymentMethods: PaymentMethodType[];
  recurringPaymentMethods: PaymentMethodType[];
  supportedProductTypes: ProductType[];
};

export type ContractRegistry = {
  merchantEntities: MerchantEntity[];
  storefrontRegions: StorefrontRegionPolicy[];
  merchantAccounts: MerchantAccount[];
  routes: PspRoute[];
  defaultDeveloperContractVersion: string;
};

export type CheckoutQuote = {
  lane: CommerceLane;
  merchantEntityCode: string;
  merchantAccountKey: string;
  pspRouteKey: string;
  provider: PaymentProvider;
  taxMode: TaxMode;
  consumerContractVersion: string;
  developerContractVersion: string;
  paymentMethods: PaymentMethodType[];
  parityTargetPaymentMethods: PaymentMethodType[];
  parityGapPaymentMethods: PaymentMethodType[];
  suppressedPaymentMethods: PaymentMethodType[];
  warnings: string[];
};

type RouteCandidate = {
  route: PspRoute;
  recurringEligibleMethods: PaymentMethodType[];
  platformEligibleMethods: PaymentMethodType[];
  eligibleMethods: PaymentMethodType[];
};

type CommercePolicyErrorCode =
  | "UNSUPPORTED_REGION"
  | "UNSUPPORTED_ROUTE"
  | "UNSUPPORTED_PRODUCT_TYPE";

export class CommercePolicyError extends Error {
  constructor(
    readonly code: CommercePolicyErrorCode,
    message: string,
    readonly details: string[] = [],
  ) {
    super(message);
    this.name = "CommercePolicyError";
  }
}

export const defaultContractRegistry: ContractRegistry = {
  merchantEntities: [
    {
      code: "OPENSTORE_US",
      legalName: "OpenStore US, Inc.",
      homeCountryCode: "US",
      defaultCurrencyCode: "USD",
    },
    {
      code: "OPENSTORE_EU",
      legalName: "OpenStore Europe GmbH",
      homeCountryCode: "DE",
      defaultCurrencyCode: "EUR",
    },
  ],
  storefrontRegions: [
    {
      countryCode: "US",
      currencyCode: "USD",
      languageCode: "en-US",
      taxMode: "PSP_NATIVE",
      consumerContractVersions: {
        MARKETPLACE: "us-marketplace-v1",
        MERCHANT_OF_RECORD: "us-mor-v1",
      },
      appleParityPaymentMethods: ["STORE_BALANCE", "APPLE_PAY", "CARD", "PAYPAL"],
    },
    {
      countryCode: "CA",
      currencyCode: "CAD",
      languageCode: "en-CA",
      taxMode: "PSP_NATIVE",
      consumerContractVersions: {
        MARKETPLACE: "ca-marketplace-v1",
        MERCHANT_OF_RECORD: "ca-mor-v1",
      },
      appleParityPaymentMethods: ["STORE_BALANCE", "APPLE_PAY", "CARD", "PAYPAL"],
    },
    {
      countryCode: "GB",
      currencyCode: "GBP",
      languageCode: "en-GB",
      taxMode: "PSP_NATIVE",
      consumerContractVersions: {
        MARKETPLACE: "gb-marketplace-v1",
        MERCHANT_OF_RECORD: "gb-mor-v1",
      },
      appleParityPaymentMethods: [
        "STORE_BALANCE",
        "APPLE_PAY",
        "CARRIER_BILLING",
        "CARD",
        "PAYPAL",
      ],
    },
    {
      countryCode: "AU",
      currencyCode: "AUD",
      languageCode: "en-AU",
      taxMode: "PSP_NATIVE",
      consumerContractVersions: {
        MARKETPLACE: "au-marketplace-v1",
        MERCHANT_OF_RECORD: "au-mor-v1",
      },
      appleParityPaymentMethods: ["STORE_BALANCE", "APPLE_PAY", "CARD", "PAYPAL"],
    },
    {
      countryCode: "NZ",
      currencyCode: "NZD",
      languageCode: "en-NZ",
      taxMode: "PSP_NATIVE",
      consumerContractVersions: {
        MARKETPLACE: "nz-marketplace-v1",
        MERCHANT_OF_RECORD: "nz-mor-v1",
      },
      appleParityPaymentMethods: ["STORE_BALANCE", "CARD"],
    },
    {
      countryCode: "IS",
      currencyCode: "ISK",
      languageCode: "is-IS",
      taxMode: "PSP_NATIVE",
      consumerContractVersions: {
        MARKETPLACE: "is-marketplace-v1",
        MERCHANT_OF_RECORD: "is-mor-v1",
      },
      appleParityPaymentMethods: ["APPLE_PAY", "CARD"],
    },
    {
      countryCode: "DE",
      currencyCode: "EUR",
      languageCode: "de-DE",
      taxMode: "PSP_NATIVE",
      consumerContractVersions: {
        MARKETPLACE: "de-marketplace-v1",
        MERCHANT_OF_RECORD: "de-mor-v1",
      },
      appleParityPaymentMethods: [
        "STORE_BALANCE",
        "APPLE_PAY",
        "CARRIER_BILLING",
        "CARD",
        "PAYPAL",
      ],
    },
    {
      countryCode: "FR",
      currencyCode: "EUR",
      languageCode: "fr-FR",
      taxMode: "PSP_NATIVE",
      consumerContractVersions: {
        MARKETPLACE: "fr-marketplace-v1",
        MERCHANT_OF_RECORD: "fr-mor-v1",
      },
      appleParityPaymentMethods: [
        "STORE_BALANCE",
        "APPLE_PAY",
        "CARRIER_BILLING",
        "CARD",
        "PAYPAL",
      ],
    },
    {
      countryCode: "AT",
      currencyCode: "EUR",
      languageCode: "de-AT",
      taxMode: "PSP_NATIVE",
      consumerContractVersions: {
        MARKETPLACE: "at-marketplace-v1",
        MERCHANT_OF_RECORD: "at-mor-v1",
      },
      appleParityPaymentMethods: [
        "STORE_BALANCE",
        "APPLE_PAY",
        "EPS_TOPUP",
        "CARRIER_BILLING",
        "CARD",
        "PAYPAL",
      ],
      topUpOnlyPaymentMethods: ["EPS_TOPUP"],
    },
    {
      countryCode: "BE",
      currencyCode: "EUR",
      languageCode: "nl-BE",
      taxMode: "PSP_NATIVE",
      consumerContractVersions: {
        MARKETPLACE: "be-marketplace-v1",
        MERCHANT_OF_RECORD: "be-mor-v1",
      },
      appleParityPaymentMethods: [
        "STORE_BALANCE",
        "APPLE_PAY",
        "BANCONTACT",
        "CARRIER_BILLING",
        "CARD",
        "PAYPAL",
      ],
    },
    {
      countryCode: "JP",
      currencyCode: "JPY",
      languageCode: "ja-JP",
      taxMode: "PSP_NATIVE",
      consumerContractVersions: {
        MARKETPLACE: "jp-marketplace-v1",
        MERCHANT_OF_RECORD: "jp-mor-v1",
      },
      appleParityPaymentMethods: [
        "STORE_BALANCE",
        "APPLE_PAY",
        "MERPAY",
        "CARRIER_BILLING",
        "CARD",
        "PAYPAY",
      ],
    },
    {
      countryCode: "KR",
      currencyCode: "KRW",
      languageCode: "ko-KR",
      taxMode: "PSP_NATIVE",
      consumerContractVersions: {
        MARKETPLACE: "kr-marketplace-v1",
        MERCHANT_OF_RECORD: "kr-mor-v1",
      },
      appleParityPaymentMethods: [
        "KAKAOPAY",
        "CARRIER_BILLING",
        "CARD",
        "NAVER_PAY",
        "PAYCO",
        "TOSS_PAY",
      ],
    },
    {
      countryCode: "CN",
      currencyCode: "CNY",
      languageCode: "zh-CN",
      taxMode: "PSP_NATIVE",
      consumerContractVersions: {
        MARKETPLACE: "cn-marketplace-v1",
        MERCHANT_OF_RECORD: "cn-mor-v1",
      },
      appleParityPaymentMethods: [
        "ALIPAY",
        "STORE_BALANCE",
        "DOUYIN_PAY",
        "CARD",
        "WECHAT_PAY",
      ],
    },
    {
      countryCode: "IN",
      currencyCode: "INR",
      languageCode: "en-IN",
      taxMode: "PSP_NATIVE",
      consumerContractVersions: {
        MARKETPLACE: "in-marketplace-v1",
        MERCHANT_OF_RECORD: "in-mor-v1",
      },
      appleParityPaymentMethods: [
        "STORE_BALANCE",
        "NET_BANKING_TOPUP",
        "UPI",
      ],
      topUpOnlyPaymentMethods: ["NET_BANKING_TOPUP"],
    },
    {
      countryCode: "AE",
      currencyCode: "AED",
      languageCode: "en-AE",
      taxMode: "PSP_NATIVE",
      consumerContractVersions: {
        MARKETPLACE: "ae-marketplace-v1",
        MERCHANT_OF_RECORD: "ae-mor-v1",
      },
      appleParityPaymentMethods: [
        "STORE_BALANCE",
        "APPLE_PAY",
        "CARRIER_BILLING",
        "CARD",
      ],
    },
    {
      countryCode: "SA",
      currencyCode: "SAR",
      languageCode: "ar-SA",
      taxMode: "PSP_NATIVE",
      consumerContractVersions: {
        MARKETPLACE: "sa-marketplace-v1",
        MERCHANT_OF_RECORD: "sa-mor-v1",
      },
      appleParityPaymentMethods: ["STORE_BALANCE", "CARRIER_BILLING", "CARD"],
    },
    {
      countryCode: "VN",
      currencyCode: "VND",
      languageCode: "vi-VN",
      taxMode: "PSP_NATIVE",
      consumerContractVersions: {
        MARKETPLACE: "vn-marketplace-v1",
        MERCHANT_OF_RECORD: "vn-mor-v1",
      },
      appleParityPaymentMethods: [
        "STORE_BALANCE",
        "MOMO",
        "CARD",
        "SHOPEEPAY",
        "VNPAY",
        "ZALOPAY",
      ],
    },
    {
      countryCode: "TH",
      currencyCode: "THB",
      languageCode: "th-TH",
      taxMode: "PSP_NATIVE",
      consumerContractVersions: {
        MARKETPLACE: "th-marketplace-v1",
        MERCHANT_OF_RECORD: "th-mor-v1",
      },
      appleParityPaymentMethods: [
        "CARRIER_BILLING",
        "CARD",
        "SHOPEEPAY",
        "TRUEMONEY",
      ],
    },
    {
      countryCode: "ID",
      currencyCode: "IDR",
      languageCode: "id-ID",
      taxMode: "PSP_NATIVE",
      consumerContractVersions: {
        MARKETPLACE: "id-marketplace-v1",
        MERCHANT_OF_RECORD: "id-mor-v1",
      },
      appleParityPaymentMethods: [
        "STORE_BALANCE",
        "DANA",
        "GOPAY",
        "CARD",
        "SHOPEEPAY",
      ],
    },
    {
      countryCode: "PH",
      currencyCode: "PHP",
      languageCode: "en-PH",
      taxMode: "PSP_NATIVE",
      consumerContractVersions: {
        MARKETPLACE: "ph-marketplace-v1",
        MERCHANT_OF_RECORD: "ph-mor-v1",
      },
      appleParityPaymentMethods: [
        "GCASH",
        "CARRIER_BILLING",
        "CARD",
        "SHOPEEPAY",
      ],
    },
    {
      countryCode: "RU",
      currencyCode: "RUB",
      languageCode: "ru-RU",
      taxMode: "MANUAL",
      consumerContractVersions: {
        MARKETPLACE: "ru-marketplace-v1",
        MERCHANT_OF_RECORD: "ru-mor-v1",
      },
      appleParityPaymentMethods: ["STORE_BALANCE", "CARRIER_BILLING"],
    },
  ],
  merchantAccounts: [
    {
      key: "stripe-us-marketplace",
      entityCode: "OPENSTORE_US",
      provider: "STRIPE",
      lane: "MARKETPLACE",
      displayName: "OpenStore Marketplace US",
      settlementCurrencyCode: "USD",
      settlementCountryCode: "US",
      allowsRecurring: true,
    },
    {
      key: "stripe-eu-marketplace",
      entityCode: "OPENSTORE_EU",
      provider: "STRIPE",
      lane: "MARKETPLACE",
      displayName: "OpenStore Marketplace EU",
      settlementCurrencyCode: "EUR",
      settlementCountryCode: "DE",
      allowsRecurring: true,
    },
    {
      key: "adyen-apac-marketplace",
      entityCode: "OPENSTORE_US",
      provider: "ADYEN",
      lane: "MARKETPLACE",
      displayName: "OpenStore Marketplace Global",
      settlementCurrencyCode: "USD",
      settlementCountryCode: "US",
      allowsRecurring: true,
    },
    {
      key: "paddle-global-mor",
      entityCode: "OPENSTORE_US",
      provider: "PADDLE",
      lane: "MERCHANT_OF_RECORD",
      displayName: "OpenStore First-Party MoR",
      settlementCurrencyCode: "USD",
      settlementCountryCode: "US",
      allowsRecurring: true,
    },
  ],
  routes: [
    {
      key: "stripe-us-marketplace-primary",
      entityCode: "OPENSTORE_US",
      merchantAccountKey: "stripe-us-marketplace",
      provider: "STRIPE",
      lane: "MARKETPLACE",
      supportedCountries: ["US", "CA", "AU"],
      supportedCurrencies: ["USD", "CAD", "AUD"],
      priority: 10,
      paymentMethods: ["STORE_BALANCE", "CARD", "APPLE_PAY", "GOOGLE_PAY"],
      recurringPaymentMethods: [
        "STORE_BALANCE",
        "CARD",
        "APPLE_PAY",
        "GOOGLE_PAY",
      ],
      supportedProductTypes: [
        "PAID_APP",
        "CONSUMABLE_IAP",
        "NON_CONSUMABLE_IAP",
        "AUTO_RENEWING_SUBSCRIPTION",
      ],
    },
    {
      key: "stripe-eu-marketplace-primary",
      entityCode: "OPENSTORE_EU",
      merchantAccountKey: "stripe-eu-marketplace",
      provider: "STRIPE",
      lane: "MARKETPLACE",
      supportedCountries: ["DE", "FR", "AT", "BE", "IS"],
      supportedCurrencies: ["EUR", "ISK"],
      priority: 10,
      paymentMethods: [
        "STORE_BALANCE",
        "CARD",
        "APPLE_PAY",
        "GOOGLE_PAY",
        "SEPA_DEBIT",
        "IDEAL",
        "BANCONTACT",
        "SOFORT",
      ],
      recurringPaymentMethods: [
        "STORE_BALANCE",
        "CARD",
        "APPLE_PAY",
        "GOOGLE_PAY",
        "SEPA_DEBIT",
      ],
      supportedProductTypes: [
        "PAID_APP",
        "CONSUMABLE_IAP",
        "NON_CONSUMABLE_IAP",
        "AUTO_RENEWING_SUBSCRIPTION",
      ],
    },
    {
      key: "adyen-apac-marketplace-secondary",
      entityCode: "OPENSTORE_US",
      merchantAccountKey: "adyen-apac-marketplace",
      provider: "ADYEN",
      lane: "MARKETPLACE",
      supportedCountries: [
        "US",
        "CA",
        "GB",
        "AU",
        "NZ",
        "IS",
        "DE",
        "FR",
        "AT",
        "BE",
        "JP",
        "KR",
        "CN",
        "IN",
        "AE",
        "SA",
        "VN",
        "TH",
        "ID",
        "PH",
        "RU",
      ],
      supportedCurrencies: [
        "USD",
        "CAD",
        "GBP",
        "AUD",
        "NZD",
        "ISK",
        "EUR",
        "JPY",
        "KRW",
        "CNY",
        "INR",
        "AED",
        "SAR",
        "VND",
        "THB",
        "IDR",
        "PHP",
        "RUB",
      ],
      priority: 20,
      paymentMethods: [
        "STORE_BALANCE",
        "CARD",
        "APPLE_PAY",
        "GOOGLE_PAY",
        "PAYPAL",
        "ALIPAY",
        "WECHAT_PAY",
        "UPI",
        "BANCONTACT",
      ],
      recurringPaymentMethods: [
        "STORE_BALANCE",
        "CARD",
        "APPLE_PAY",
        "GOOGLE_PAY",
        "PAYPAL",
      ],
      supportedProductTypes: [
        "PAID_APP",
        "CONSUMABLE_IAP",
        "NON_CONSUMABLE_IAP",
        "AUTO_RENEWING_SUBSCRIPTION",
      ],
    },
    {
      key: "paddle-global-mor-primary",
      entityCode: "OPENSTORE_US",
      merchantAccountKey: "paddle-global-mor",
      provider: "PADDLE",
      lane: "MERCHANT_OF_RECORD",
      supportedCountries: [
        "US",
        "CA",
        "GB",
        "AU",
        "NZ",
        "IS",
        "DE",
        "FR",
        "AT",
        "BE",
        "JP",
        "KR",
        "IN",
        "AE",
        "SA",
      ],
      supportedCurrencies: [
        "USD",
        "CAD",
        "GBP",
        "AUD",
        "NZD",
        "ISK",
        "EUR",
        "JPY",
        "KRW",
        "INR",
        "AED",
        "SAR",
      ],
      priority: 10,
      paymentMethods: [
        "STORE_BALANCE",
        "CARD",
        "APPLE_PAY",
        "GOOGLE_PAY",
        "PAYPAL",
      ],
      recurringPaymentMethods: [
        "STORE_BALANCE",
        "CARD",
        "APPLE_PAY",
        "GOOGLE_PAY",
        "PAYPAL",
      ],
      supportedProductTypes: [
        "PAID_APP",
        "CONSUMABLE_IAP",
        "NON_CONSUMABLE_IAP",
        "AUTO_RENEWING_SUBSCRIPTION",
      ],
    },
  ],
  defaultDeveloperContractVersion: "global-third-party-v1",
};

function normalizeCode(value: string) {
  return value.trim().toUpperCase();
}

function routeSupports(route: PspRoute, input: CheckoutQuoteInput) {
  const countryCode = normalizeCode(input.countryCode);
  const currencyCode = normalizeCode(input.currencyCode);

  return (
    route.supportedCountries.includes(countryCode) &&
    route.supportedCurrencies.includes(currencyCode) &&
    route.supportedProductTypes.includes(input.productType)
  );
}

function resolveDesiredLane(input: CheckoutQuoteInput): CommerceLane {
  if (input.developerType === "THIRD_PARTY") {
    return "MARKETPLACE";
  }

  return input.preferMerchantOfRecord ? "MERCHANT_OF_RECORD" : "MARKETPLACE";
}

function getRegionPolicy(countryCode: string, registry: ContractRegistry) {
  return registry.storefrontRegions.find(
    (region) => region.countryCode === normalizeCode(countryCode),
  );
}

function getAccount(accountKey: string, registry: ContractRegistry) {
  return registry.merchantAccounts.find((account) => account.key === accountKey);
}

function sortRoutes(
  candidates: RouteCandidate[],
  preferredProvider?: PaymentProvider,
): RouteCandidate[] {
  return [...candidates].sort((left, right) => {
    const leftPreferred = left.route.provider === preferredProvider ? -1 : 0;
    const rightPreferred = right.route.provider === preferredProvider ? -1 : 0;

    if (leftPreferred !== rightPreferred) {
      return leftPreferred - rightPreferred;
    }

    if (left.eligibleMethods.length !== right.eligibleMethods.length) {
      return right.eligibleMethods.length - left.eligibleMethods.length;
    }

    return left.route.priority - right.route.priority;
  });
}

function getEligiblePaymentMethods(route: PspRoute, productType: ProductType) {
  if (productType !== "AUTO_RENEWING_SUBSCRIPTION") {
    return route.paymentMethods;
  }

  return route.recurringPaymentMethods;
}

function filterMethodsForPlatform(
  paymentMethods: PaymentMethodType[],
  platform: CheckoutPlatform,
) {
  switch (platform) {
    case "IOS":
      return paymentMethods.filter((method) => method !== "GOOGLE_PAY");
    case "ANDROID":
      return paymentMethods.filter((method) => method !== "APPLE_PAY");
    default:
      return paymentMethods;
  }
}

function getAppleParityTargetMethods(
  region: StorefrontRegionPolicy,
  platform: CheckoutPlatform,
) {
  const parityMethods = region.appleParityPaymentMethods.filter(
    (method) => !region.topUpOnlyPaymentMethods?.includes(method),
  );

  return filterMethodsForPlatform(parityMethods, platform);
}

function orderPaymentMethods(
  methods: PaymentMethodType[],
  orderedBy: PaymentMethodType[],
) {
  return orderedBy.filter((method) => methods.includes(method));
}

function selectRouteForLane(
  lane: CommerceLane,
  input: CheckoutQuoteInput,
  registry: ContractRegistry,
  region: StorefrontRegionPolicy,
) {
  const targetPaymentMethods = getAppleParityTargetMethods(region, input.platform);
  const candidates = registry.routes
    .filter((route) => route.lane === lane && routeSupports(route, input))
    .map((route) => {
      const recurringEligibleMethods = getEligiblePaymentMethods(
        route,
        input.productType,
      );
      const platformEligibleMethods = filterMethodsForPlatform(
        recurringEligibleMethods,
        input.platform,
      );
      const eligibleMethods = orderPaymentMethods(
        platformEligibleMethods.filter((method) =>
          targetPaymentMethods.includes(method),
        ),
        targetPaymentMethods,
      );

      return {
        route,
        recurringEligibleMethods,
        platformEligibleMethods,
        eligibleMethods,
      };
    });

  for (const candidate of sortRoutes(candidates, input.preferredProvider)) {
    const {
      route,
      recurringEligibleMethods,
      platformEligibleMethods,
      eligibleMethods,
    } = candidate;
    const account = getAccount(route.merchantAccountKey, registry);

    if (!account || eligibleMethods.length === 0) {
      continue;
    }

    return {
      route,
      account,
      eligibleMethods,
      parityTargetPaymentMethods: targetPaymentMethods,
      parityGapPaymentMethods: targetPaymentMethods.filter(
        (method) => !platformEligibleMethods.includes(method),
      ),
      recurringSuppressedMethods: route.paymentMethods.filter(
        (method) => !recurringEligibleMethods.includes(method),
      ),
      platformSuppressedMethods: recurringEligibleMethods.filter(
        (method) => !platformEligibleMethods.includes(method),
      ),
      countrySuppressedMethods: platformEligibleMethods.filter(
        (method) => !targetPaymentMethods.includes(method),
      ),
    };
  }

  return null;
}

export function resolveCheckoutQuote(
  input: CheckoutQuoteInput,
  registry = defaultContractRegistry,
): CheckoutQuote {
  const countryCode = normalizeCode(input.countryCode);
  const region = getRegionPolicy(countryCode, registry);

  if (!region) {
    throw new CommercePolicyError(
      "UNSUPPORTED_REGION",
      `OpenStore does not have a storefront policy for ${countryCode}.`,
      ["Add a storefront region, consumer contracts, and tax mode before launch."],
    );
  }

  const warnings: string[] = [];
  const desiredLane = resolveDesiredLane(input);
  let selection = selectRouteForLane(desiredLane, input, registry, region);
  let lane = desiredLane;

  if (!selection && desiredLane === "MERCHANT_OF_RECORD") {
    lane = "MARKETPLACE";
    selection = selectRouteForLane(lane, input, registry, region);
    warnings.push(
      "Merchant-of-record routing was requested but no eligible route was configured, so OpenStore fell back to the marketplace lane.",
    );
  }

  if (!selection) {
    throw new CommercePolicyError(
      "UNSUPPORTED_ROUTE",
      `No configured ${lane.toLowerCase()} route can process ${input.productType} in ${countryCode}/${normalizeCode(input.currencyCode)}.`,
      [
        "Check country and currency coverage.",
        "Check recurring support for the requested product type.",
      ],
    );
  }

  const {
    route,
    account,
    eligibleMethods,
    parityTargetPaymentMethods,
    parityGapPaymentMethods,
    recurringSuppressedMethods,
    platformSuppressedMethods,
    countrySuppressedMethods,
  } = selection;
  const suppressedPaymentMethods = route.paymentMethods.filter(
    (method) => !eligibleMethods.includes(method),
  );

  if (
    input.productType === "AUTO_RENEWING_SUBSCRIPTION" &&
    recurringSuppressedMethods.length
  ) {
    warnings.push(
      `Recurring billing suppressed one-time methods: ${recurringSuppressedMethods.join(", ")}.`,
    );
  }

  if (platformSuppressedMethods.length) {
    warnings.push(
      `Platform filtering removed unsupported payment methods for ${input.platform}: ${platformSuppressedMethods.join(", ")}.`,
    );
  }

  if (countrySuppressedMethods.length) {
    warnings.push(
      `Apple parity policy suppressed methods not listed for ${countryCode}: ${countrySuppressedMethods.join(", ")}.`,
    );
  }

  if (parityGapPaymentMethods.length) {
    warnings.push(
      `Current routing does not yet cover Apple parity methods for ${countryCode}: ${parityGapPaymentMethods.join(", ")}.`,
    );
  }

  const merchantEntity = registry.merchantEntities.find(
    (entity) => entity.code === route.entityCode,
  );

  if (!merchantEntity) {
    throw new CommercePolicyError(
      "UNSUPPORTED_ROUTE",
      `Route ${route.key} points to a missing merchant entity.`,
    );
  }

  return {
    lane,
    merchantEntityCode: merchantEntity.code,
    merchantAccountKey: account.key,
    pspRouteKey: route.key,
    provider: route.provider,
    taxMode: region.taxMode,
    consumerContractVersion: region.consumerContractVersions[lane],
    developerContractVersion:
      input.developerType === "THIRD_PARTY"
        ? registry.defaultDeveloperContractVersion
        : "openstore-first-party-v1",
    paymentMethods: eligibleMethods,
    parityTargetPaymentMethods,
    parityGapPaymentMethods,
    suppressedPaymentMethods,
    warnings,
  };
}

export function listEligiblePaymentMethods(
  input: CheckoutQuoteInput,
  registry = defaultContractRegistry,
) {
  return resolveCheckoutQuote(input, registry).paymentMethods;
}
