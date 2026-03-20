export type ReservePolicyInput = {
  developerAgeDays: number;
  refundRate: number;
  disputeRate: number;
  chargebackCount: number;
};

export type ReservePolicyDecision = {
  tier: "STANDARD" | "ELEVATED" | "HIGH";
  reserveBps: number;
  reviewRequired: boolean;
};

export function classifyReservePolicy(
  input: ReservePolicyInput,
): ReservePolicyDecision {
  if (
    input.chargebackCount >= 3 ||
    input.disputeRate >= 0.015 ||
    input.refundRate >= 0.12
  ) {
    return {
      tier: "HIGH",
      reserveBps: 2500,
      reviewRequired: true,
    };
  }

  if (
    input.developerAgeDays < 90 ||
    input.disputeRate >= 0.0075 ||
    input.refundRate >= 0.06
  ) {
    return {
      tier: "ELEVATED",
      reserveBps: 1000,
      reviewRequired: false,
    };
  }

  return {
    tier: "STANDARD",
    reserveBps: 0,
    reviewRequired: false,
  };
}
