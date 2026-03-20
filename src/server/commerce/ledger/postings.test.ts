import { describe, expect, it } from "vitest";

import { buildPurchaseLedgerPreview } from "@/server/commerce/ledger/postings";

describe("buildPurchaseLedgerPreview", () => {
  it("builds a balanced purchase preview", () => {
    const preview = buildPurchaseLedgerPreview({
      orderId: "order_123",
      eventId: "evt_123",
      currencyCode: "USD",
      grossAmount: 19.99,
      taxAmount: 1.99,
      developerAmount: 10,
      reserveAmount: 1.5,
      processorFeeAmount: 0.99,
      occurredAt: "2026-03-20T10:00:00.000Z",
    });

    expect(preview.platformGrossRevenue).toBe(8);
    expect(preview.developerNetPayable).toBe(8.5);
    expect(preview.debits).toBe(preview.credits);
    expect(preview.entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          accountCode: "processor_clearing",
          direction: "DEBIT",
          amount: 19.99,
        }),
        expect.objectContaining({
          accountCode: "developer_reserve_payable",
          direction: "CREDIT",
          amount: 1.5,
        }),
      ]),
    );
  });

  it("rejects impossible reserve amounts", () => {
    expect(() =>
      buildPurchaseLedgerPreview({
        orderId: "order_123",
        eventId: "evt_123",
        currencyCode: "USD",
        grossAmount: 10,
        developerAmount: 2,
        reserveAmount: 3,
      }),
    ).toThrow("Reserve amount cannot exceed the developer share.");
  });
});
