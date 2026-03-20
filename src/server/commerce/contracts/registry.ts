export const commerceLanes = ["MARKETPLACE", "MERCHANT_OF_RECORD"] as const;
export const paymentProviders = ["STRIPE", "ADYEN", "PADDLE"] as const;
export const paymentMethodTypes = [
  "CARD",
  "APPLE_PAY",
  "GOOGLE_PAY",
  "PAYPAL",
  "ACH_DEBIT",
  "SEPA_DEBIT",
  "IDEAL",
  "BANCONTACT",
  "SOFORT",
  "ALIPAY",
  "WECHAT_PAY",
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
  suppressedPaymentMethods: PaymentMethodType[];
  warnings: string[];
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
      displayName: "OpenStore Marketplace APAC",
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
      supportedCountries: ["US", "CA", "AU", "JP", "KR"],
      supportedCurrencies: ["USD", "CAD", "AUD", "JPY", "KRW"],
      priority: 10,
      paymentMethods: ["CARD", "APPLE_PAY", "GOOGLE_PAY"],
      recurringPaymentMethods: ["CARD", "APPLE_PAY", "GOOGLE_PAY"],
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
      supportedCountries: ["DE", "FR"],
      supportedCurrencies: ["EUR"],
      priority: 10,
      paymentMethods: [
        "CARD",
        "APPLE_PAY",
        "GOOGLE_PAY",
        "SEPA_DEBIT",
        "IDEAL",
        "BANCONTACT",
        "SOFORT",
      ],
      recurringPaymentMethods: ["CARD", "APPLE_PAY", "GOOGLE_PAY", "SEPA_DEBIT"],
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
      supportedCountries: ["JP", "KR"],
      supportedCurrencies: ["JPY", "KRW", "USD"],
      priority: 20,
      paymentMethods: [
        "CARD",
        "APPLE_PAY",
        "GOOGLE_PAY",
        "PAYPAL",
        "ALIPAY",
        "WECHAT_PAY",
      ],
      recurringPaymentMethods: ["CARD", "APPLE_PAY", "GOOGLE_PAY"],
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
      supportedCountries: ["US", "CA", "AU", "DE", "FR", "JP", "KR"],
      supportedCurrencies: ["USD", "CAD", "AUD", "EUR", "JPY", "KRW"],
      priority: 10,
      paymentMethods: ["CARD", "APPLE_PAY", "GOOGLE_PAY", "PAYPAL"],
      recurringPaymentMethods: ["CARD", "APPLE_PAY", "GOOGLE_PAY", "PAYPAL"],
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
  routes: PspRoute[],
  preferredProvider?: PaymentProvider,
): PspRoute[] {
  return [...routes].sort((left, right) => {
    const leftPreferred = left.provider === preferredProvider ? -1 : 0;
    const rightPreferred = right.provider === preferredProvider ? -1 : 0;

    if (leftPreferred !== rightPreferred) {
      return leftPreferred - rightPreferred;
    }

    return left.priority - right.priority;
  });
}

function getEligiblePaymentMethods(route: PspRoute, productType: ProductType) {
  if (productType !== "AUTO_RENEWING_SUBSCRIPTION") {
    return route.paymentMethods;
  }

  return route.recurringPaymentMethods;
}

function selectRouteForLane(
  lane: CommerceLane,
  input: CheckoutQuoteInput,
  registry: ContractRegistry,
) {
  const candidates = registry.routes.filter(
    (route) => route.lane === lane && routeSupports(route, input),
  );

  for (const route of sortRoutes(candidates, input.preferredProvider)) {
    const account = getAccount(route.merchantAccountKey, registry);
    const eligibleMethods = getEligiblePaymentMethods(route, input.productType);

    if (!account || eligibleMethods.length === 0) {
      continue;
    }

    return { route, account, eligibleMethods };
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
  let selection = selectRouteForLane(desiredLane, input, registry);
  let lane = desiredLane;

  if (!selection && desiredLane === "MERCHANT_OF_RECORD") {
    lane = "MARKETPLACE";
    selection = selectRouteForLane(lane, input, registry);
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

  const { route, account, eligibleMethods } = selection;
  const suppressedPaymentMethods = route.paymentMethods.filter(
    (method) => !eligibleMethods.includes(method),
  );

  if (input.productType === "AUTO_RENEWING_SUBSCRIPTION" && suppressedPaymentMethods.length) {
    warnings.push(
      `Recurring billing suppressed one-time methods: ${suppressedPaymentMethods.join(", ")}.`,
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
