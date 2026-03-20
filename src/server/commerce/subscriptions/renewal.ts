export type SubscriptionRenewalPreviewInput = {
  subscriptionId: string;
  billingCurrencyCode: string;
  amount: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  retryCount?: number;
};

export type SubscriptionRenewalPreview = {
  subscriptionId: string;
  invoiceNumber: string;
  amount: number;
  billingCurrencyCode: string;
  nextRetryAt?: string;
};

export function previewSubscriptionRenewal(
  input: SubscriptionRenewalPreviewInput,
): SubscriptionRenewalPreview {
  const retryCount = input.retryCount ?? 0;
  const nextRetryAt =
    retryCount > 0
      ? new Date(
          new Date(input.currentPeriodEnd).getTime() + retryCount * 24 * 60 * 60 * 1000,
        ).toISOString()
      : undefined;

  return {
    subscriptionId: input.subscriptionId,
    invoiceNumber: `renewal-${input.subscriptionId}-${input.currentPeriodEnd.slice(0, 10)}`,
    amount: Number(input.amount.toFixed(2)),
    billingCurrencyCode: input.billingCurrencyCode,
    nextRetryAt,
  };
}
