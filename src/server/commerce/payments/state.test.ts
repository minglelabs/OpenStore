import { describe, expect, it } from "vitest";

import { normalizePaymentStatus } from "@/server/commerce/payments/state";

describe("normalizePaymentStatus", () => {
  it("maps provider statuses to internal statuses", () => {
    expect(normalizePaymentStatus("STRIPE", "succeeded")).toBe("SUCCEEDED");
    expect(normalizePaymentStatus("ADYEN", "Authorised")).toBe("AUTHORIZED");
    expect(normalizePaymentStatus("PADDLE", "past_due")).toBe("REQUIRES_ACTION");
  });
});
