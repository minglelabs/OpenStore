import type { PaymentProvider } from "@/server/commerce/contracts/registry";

export type InternalPaymentStatus =
  | "CREATED"
  | "REQUIRES_ACTION"
  | "PROCESSING"
  | "AUTHORIZED"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELED"
  | "REFUNDED"
  | "DISPUTED";

const providerStatusMap: Record<
  PaymentProvider,
  Record<string, InternalPaymentStatus>
> = {
  STRIPE: {
    requires_payment_method: "FAILED",
    requires_action: "REQUIRES_ACTION",
    processing: "PROCESSING",
    requires_capture: "AUTHORIZED",
    succeeded: "SUCCEEDED",
    canceled: "CANCELED",
  },
  ADYEN: {
    received: "PROCESSING",
    authorised: "AUTHORIZED",
    authorisationfailed: "FAILED",
    cancelled: "CANCELED",
    refunded: "REFUNDED",
  },
  PADDLE: {
    ready: "CREATED",
    billed: "SUCCEEDED",
    past_due: "REQUIRES_ACTION",
    canceled: "CANCELED",
    refunded: "REFUNDED",
  },
};

export function normalizePaymentStatus(
  provider: PaymentProvider,
  externalStatus: string,
): InternalPaymentStatus {
  const normalizedStatus = externalStatus.trim().toLowerCase();
  const status = providerStatusMap[provider][normalizedStatus];

  if (!status) {
    return "PROCESSING";
  }

  return status;
}
