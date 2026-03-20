import { describe, expect, it } from "vitest";

import { buildSettlementPreview } from "@/server/commerce/settlements/preview";

describe("buildSettlementPreview", () => {
  it("aggregates developer payouts and reserves", () => {
    const preview = buildSettlementPreview([
      {
        developerId: "dev_1",
        currencyCode: "USD",
        developerAmount: 20,
        reserveAmount: 5,
      },
      {
        developerId: "dev_1",
        currencyCode: "USD",
        developerAmount: 10,
        reserveAmount: 1,
      },
    ]);

    expect(preview.totalsByDeveloper).toEqual([
      {
        developerId: "dev_1",
        currencyCode: "USD",
        grossDeveloperAmount: 30,
        reserveHeldAmount: 6,
        netPayoutAmount: 24,
      },
    ]);
  });
});
