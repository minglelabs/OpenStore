export type LedgerDirection = "DEBIT" | "CREDIT";
export type LedgerEntryType =
  | "SALE"
  | "TAX"
  | "PROCESSOR_FEE"
  | "DEVELOPER_SHARE"
  | "RESERVE_HOLD";

export type PurchaseLedgerPreviewInput = {
  orderId: string;
  eventId: string;
  currencyCode: string;
  grossAmount: number;
  taxAmount?: number;
  developerAmount?: number;
  reserveAmount?: number;
  processorFeeAmount?: number;
  occurredAt?: string;
};

export type PreviewLedgerEntry = {
  eventKey: string;
  orderId: string;
  entryType: LedgerEntryType;
  accountCode: string;
  direction: LedgerDirection;
  amount: number;
  currencyCode: string;
  occurredAt: string;
};

export type PurchaseLedgerPreview = {
  entries: PreviewLedgerEntry[];
  platformGrossRevenue: number;
  developerNetPayable: number;
  debits: number;
  credits: number;
};

function roundCurrency(amount: number) {
  return Number(amount.toFixed(2));
}

function makeEntry(
  input: PurchaseLedgerPreviewInput,
  entryType: LedgerEntryType,
  accountCode: string,
  direction: LedgerDirection,
  amount: number,
) {
  return {
    eventKey: `${input.eventId}:${entryType}:${accountCode}:${direction}`,
    orderId: input.orderId,
    entryType,
    accountCode,
    direction,
    amount: roundCurrency(amount),
    currencyCode: input.currencyCode,
    occurredAt: input.occurredAt ?? new Date().toISOString(),
  } satisfies PreviewLedgerEntry;
}

export function buildPurchaseLedgerPreview(
  input: PurchaseLedgerPreviewInput,
): PurchaseLedgerPreview {
  const taxAmount = roundCurrency(input.taxAmount ?? 0);
  const developerAmount = roundCurrency(input.developerAmount ?? 0);
  const reserveAmount = roundCurrency(input.reserveAmount ?? 0);
  const processorFeeAmount = roundCurrency(input.processorFeeAmount ?? 0);
  const grossAmount = roundCurrency(input.grossAmount);

  if (grossAmount <= 0) {
    throw new Error("Gross amount must be positive.");
  }

  if (reserveAmount > developerAmount) {
    throw new Error("Reserve amount cannot exceed the developer share.");
  }

  const platformGrossRevenue = roundCurrency(grossAmount - taxAmount - developerAmount);

  if (platformGrossRevenue < 0) {
    throw new Error("Gross amount cannot be less than tax plus developer share.");
  }

  const developerNetPayable = roundCurrency(developerAmount - reserveAmount);
  const entries: PreviewLedgerEntry[] = [
    makeEntry(input, "SALE", "processor_clearing", "DEBIT", grossAmount),
  ];

  if (taxAmount > 0) {
    entries.push(makeEntry(input, "TAX", "tax_payable", "CREDIT", taxAmount));
  }

  if (developerNetPayable > 0) {
    entries.push(
      makeEntry(
        input,
        "DEVELOPER_SHARE",
        "developer_payable",
        "CREDIT",
        developerNetPayable,
      ),
    );
  }

  if (reserveAmount > 0) {
    entries.push(
      makeEntry(
        input,
        "RESERVE_HOLD",
        "developer_reserve_payable",
        "CREDIT",
        reserveAmount,
      ),
    );
  }

  if (platformGrossRevenue > 0) {
    entries.push(
      makeEntry(
        input,
        "SALE",
        "platform_gross_revenue",
        "CREDIT",
        platformGrossRevenue,
      ),
    );
  }

  if (processorFeeAmount > 0) {
    entries.push(
      makeEntry(
        input,
        "PROCESSOR_FEE",
        "processor_fee_expense",
        "DEBIT",
        processorFeeAmount,
      ),
    );
    entries.push(
      makeEntry(
        input,
        "PROCESSOR_FEE",
        "processor_clearing",
        "CREDIT",
        processorFeeAmount,
      ),
    );
  }

  const totals = entries.reduce(
    (summary, entry) => {
      if (entry.direction === "DEBIT") {
        summary.debits += entry.amount;
      } else {
        summary.credits += entry.amount;
      }

      return summary;
    },
    { debits: 0, credits: 0 },
  );

  return {
    entries,
    platformGrossRevenue,
    developerNetPayable,
    debits: roundCurrency(totals.debits),
    credits: roundCurrency(totals.credits),
  };
}
