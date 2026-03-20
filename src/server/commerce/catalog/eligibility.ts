import type {
  CheckoutQuoteInput,
  PaymentMethodType,
} from "@/server/commerce/contracts/registry";
import { resolveCheckoutQuote } from "@/server/commerce/contracts/registry";

export function isProductEligibleForPaymentMethod(
  input: CheckoutQuoteInput,
  paymentMethod: PaymentMethodType,
) {
  const quote = resolveCheckoutQuote(input);

  return quote.paymentMethods.includes(paymentMethod);
}
