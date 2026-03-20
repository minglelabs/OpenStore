import {
  resolveCheckoutQuote,
  type CheckoutQuoteInput,
} from "@/server/commerce/contracts/registry";

export type CheckoutSessionBlueprintInput = CheckoutQuoteInput & {
  orderReference: string;
};

export type CheckoutSessionBlueprint = {
  idempotencyKey: string;
  quote: ReturnType<typeof resolveCheckoutQuote>;
  checkoutSessionRef: string;
};

export function buildCheckoutSessionBlueprint(
  input: CheckoutSessionBlueprintInput,
): CheckoutSessionBlueprint {
  const quote = resolveCheckoutQuote(input);
  const normalizedOrderReference = input.orderReference.trim().toLowerCase();

  return {
    idempotencyKey: `checkout:${normalizedOrderReference}:${quote.lane}:${quote.provider}`,
    checkoutSessionRef: `chk_${normalizedOrderReference}_${quote.pspRouteKey}`,
    quote,
  };
}
