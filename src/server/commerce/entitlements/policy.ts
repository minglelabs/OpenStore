import type { ProductType } from "@/server/commerce/contracts/registry";

export type EntitlementStatus = "PENDING" | "ACTIVE" | "REVOKED" | "EXPIRED";
export type OrderStatus =
  | "DRAFT"
  | "PROCESSING"
  | "SUCCEEDED"
  | "FAILED"
  | "REFUNDED"
  | "CHARGEBACK";
export type SubscriptionStatus =
  | "DRAFT"
  | "ACTIVE"
  | "PAST_DUE"
  | "PAUSED"
  | "CANCELED"
  | "EXPIRED";

export type EntitlementPreviewInput = {
  productType: ProductType;
  orderStatus: OrderStatus;
  purchasedAt: string;
  evaluatedAt?: string;
  revokedAt?: string;
  subscriptionStatus?: SubscriptionStatus;
  currentPeriodEnd?: string;
  gracePeriodEndsAt?: string;
};

export type EntitlementPreview = {
  status: EntitlementStatus;
  startsAt?: string;
  endsAt?: string;
  revokedAt?: string;
  reason: string;
};

function isRecurringProduct(productType: ProductType) {
  return productType === "AUTO_RENEWING_SUBSCRIPTION";
}

export function previewEntitlement(
  input: EntitlementPreviewInput,
): EntitlementPreview {
  const evaluatedAt = input.evaluatedAt ?? input.purchasedAt;

  if (input.orderStatus === "REFUNDED" || input.orderStatus === "CHARGEBACK") {
    return {
      status: "REVOKED",
      revokedAt: input.revokedAt ?? evaluatedAt,
      reason: "The purchase was refunded or charged back.",
    };
  }

  if (input.orderStatus !== "SUCCEEDED") {
    return {
      status: "PENDING",
      reason: "The purchase has not been finalized yet.",
    };
  }

  if (!isRecurringProduct(input.productType)) {
    return {
      status: "ACTIVE",
      startsAt: input.purchasedAt,
      reason: "One-time purchases remain active until they are revoked.",
    };
  }

  if (input.subscriptionStatus === "ACTIVE") {
    return {
      status: "ACTIVE",
      startsAt: input.purchasedAt,
      endsAt: input.currentPeriodEnd,
      reason: "The subscription is active.",
    };
  }

  if (
    input.subscriptionStatus === "PAST_DUE" &&
    input.gracePeriodEndsAt &&
    new Date(input.gracePeriodEndsAt).getTime() > new Date(evaluatedAt).getTime()
  ) {
    return {
      status: "ACTIVE",
      startsAt: input.purchasedAt,
      endsAt: input.gracePeriodEndsAt,
      reason: "The subscription is in its grace period.",
    };
  }

  if (
    input.subscriptionStatus === "CANCELED" ||
    input.subscriptionStatus === "EXPIRED" ||
    input.subscriptionStatus === "PAUSED"
  ) {
    return {
      status: "EXPIRED",
      startsAt: input.purchasedAt,
      endsAt: input.currentPeriodEnd ?? input.purchasedAt,
      reason: "The subscription no longer grants access.",
    };
  }

  return {
    status: "PENDING",
    reason: "The subscription state is not active yet.",
  };
}
