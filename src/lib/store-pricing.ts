type BillingModel = "FREE" | "ONE_TIME" | "SUBSCRIPTION";

type AppPricingCatalogEntry = {
  billingModel: BillingModel;
  baseAmount?: number;
  billingInterval?: "month";
  introOffer?: string;
};

export type ResolvedAppPricing = {
  appSlug: string;
  billingModel: Exclude<BillingModel, "FREE">;
  currencyCode: string;
  amountValue: number;
  amountLabel: string;
  billingInterval?: "month";
  introOffer?: string;
};

const prototypeCurrencyMultipliers: Record<string, number> = {
  USD: 1,
  CAD: 1.36,
  GBP: 0.79,
  AUD: 1.52,
  NZD: 1.64,
  ISK: 138,
  EUR: 0.92,
  JPY: 149,
  KRW: 1335,
  CNY: 7.18,
  INR: 83.1,
  AED: 3.67,
  SAR: 3.75,
  VND: 24500,
  THB: 35.8,
  IDR: 15700,
  PHP: 56.2,
  RUB: 90.5,
};

const appPricingCatalog: Record<string, AppPricingCatalogEntry> = {
  "northstar-notes": {
    billingModel: "FREE",
  },
  patchboard: {
    billingModel: "ONE_TIME",
    baseAmount: 6.99,
  },
  "beam-music": {
    billingModel: "SUBSCRIPTION",
    baseAmount: 9.99,
    billingInterval: "month",
  },
  "harbor-mail": {
    billingModel: "FREE",
  },
  "lantern-sleep": {
    billingModel: "SUBSCRIPTION",
    baseAmount: 7.99,
    billingInterval: "month",
  },
  "drift-browser": {
    billingModel: "FREE",
  },
  relayfit: {
    billingModel: "SUBSCRIPTION",
    baseAmount: 11.99,
    billingInterval: "month",
  },
  "glyph-ai": {
    billingModel: "SUBSCRIPTION",
    baseAmount: 14.99,
    billingInterval: "month",
    introOffer: "7-day free trial",
  },
  "arcade-lane": {
    billingModel: "ONE_TIME",
    baseAmount: 3.99,
  },
  "pocket-cloud": {
    billingModel: "SUBSCRIPTION",
    baseAmount: 4.99,
    billingInterval: "month",
  },
  "focus-frame": {
    billingModel: "FREE",
  },
  "studio-cast": {
    billingModel: "ONE_TIME",
    baseAmount: 8.99,
  },
};

function getCurrencyFractionDigits(currencyCode: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).resolvedOptions().maximumFractionDigits;
}

function normalizeCurrencyAmount(currencyCode: string, amount: number) {
  const fractionDigits = getCurrencyFractionDigits(currencyCode);

  if (fractionDigits === 0) {
    return Math.round(amount);
  }

  return Number(amount.toFixed(fractionDigits));
}

export function formatCurrencyAmount(currencyCode: string, amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: getCurrencyFractionDigits(currencyCode),
  }).format(amount);
}

export function getBillingModelForApp(appSlug: string): BillingModel {
  return appPricingCatalog[appSlug]?.billingModel ?? "FREE";
}

export function resolveAppPricing(
  appSlug: string,
  currencyCode: string,
): ResolvedAppPricing | null {
  const entry = appPricingCatalog[appSlug];

  if (!entry || entry.billingModel === "FREE" || typeof entry.baseAmount !== "number") {
    return null;
  }

  const multiplier = prototypeCurrencyMultipliers[currencyCode] ?? prototypeCurrencyMultipliers.USD;
  const amountValue = normalizeCurrencyAmount(currencyCode, entry.baseAmount * multiplier);
  const formattedAmount = formatCurrencyAmount(currencyCode, amountValue);
  const recurringLabel = entry.billingInterval
    ? `${formattedAmount} / ${entry.billingInterval}`
    : formattedAmount;

  return {
    appSlug,
    billingModel: entry.billingModel,
    currencyCode,
    amountValue,
    amountLabel: entry.introOffer
      ? `${entry.introOffer}, then ${recurringLabel}`
      : recurringLabel,
    billingInterval: entry.billingInterval,
    introOffer: entry.introOffer,
  };
}

export function resolveStoredOrderAmount(input: {
  appSlug: string;
  currencyCode: string;
  amountValue?: number | null;
}) {
  if (typeof input.amountValue === "number" && Number.isFinite(input.amountValue)) {
    return input.amountValue;
  }

  return resolveAppPricing(input.appSlug, input.currencyCode)?.amountValue ?? 0;
}
