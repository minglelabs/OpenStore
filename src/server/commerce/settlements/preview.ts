export type SettlementLineItem = {
  developerId: string;
  currencyCode: string;
  developerAmount: number;
  reserveAmount?: number;
};

export type SettlementPreview = {
  totalsByDeveloper: Array<{
    developerId: string;
    currencyCode: string;
    grossDeveloperAmount: number;
    reserveHeldAmount: number;
    netPayoutAmount: number;
  }>;
};

export function buildSettlementPreview(
  items: SettlementLineItem[],
): SettlementPreview {
  const summary = new Map<
    string,
    {
      developerId: string;
      currencyCode: string;
      grossDeveloperAmount: number;
      reserveHeldAmount: number;
      netPayoutAmount: number;
    }
  >();

  for (const item of items) {
    const key = `${item.developerId}:${item.currencyCode}`;
    const reserveAmount = item.reserveAmount ?? 0;
    const current = summary.get(key) ?? {
      developerId: item.developerId,
      currencyCode: item.currencyCode,
      grossDeveloperAmount: 0,
      reserveHeldAmount: 0,
      netPayoutAmount: 0,
    };

    current.grossDeveloperAmount += item.developerAmount;
    current.reserveHeldAmount += reserveAmount;
    current.netPayoutAmount += item.developerAmount - reserveAmount;
    summary.set(key, current);
  }

  return {
    totalsByDeveloper: [...summary.values()].map((item) => ({
      ...item,
      grossDeveloperAmount: Number(item.grossDeveloperAmount.toFixed(2)),
      reserveHeldAmount: Number(item.reserveHeldAmount.toFixed(2)),
      netPayoutAmount: Number(item.netPayoutAmount.toFixed(2)),
    })),
  };
}
