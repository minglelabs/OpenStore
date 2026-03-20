import { describe, expect, it } from "vitest";

import { classifyReservePolicy } from "@/server/commerce/risk/reserve-policy";

describe("classifyReservePolicy", () => {
  it("raises reserves for risky developers", () => {
    const decision = classifyReservePolicy({
      developerAgeDays: 20,
      refundRate: 0.13,
      disputeRate: 0.02,
      chargebackCount: 4,
    });

    expect(decision).toEqual({
      tier: "HIGH",
      reserveBps: 2500,
      reviewRequired: true,
    });
  });
});
