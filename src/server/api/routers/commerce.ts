import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  CommercePolicyError,
  checkoutPlatforms,
  developerTypes,
  paymentProviders,
  productTypes,
  resolveCheckoutQuote,
} from "@/server/commerce/contracts/registry";
import { previewEntitlement } from "@/server/commerce/entitlements/policy";
import { buildPurchaseLedgerPreview } from "@/server/commerce/ledger/postings";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

const checkoutQuoteInputSchema = z.object({
  countryCode: z.string().trim().length(2),
  currencyCode: z.string().trim().min(3).max(3),
  platform: z.enum(checkoutPlatforms),
  productType: z.enum(productTypes),
  developerType: z.enum(developerTypes),
  preferMerchantOfRecord: z.boolean().optional(),
  preferredProvider: z.enum(paymentProviders).optional(),
});

const ledgerPreviewInputSchema = z.object({
  orderId: z.string().trim().min(1),
  eventId: z.string().trim().min(1),
  currencyCode: z.string().trim().min(3).max(3),
  grossAmount: z.number().positive(),
  taxAmount: z.number().min(0).optional(),
  developerAmount: z.number().min(0).optional(),
  reserveAmount: z.number().min(0).optional(),
  processorFeeAmount: z.number().min(0).optional(),
  occurredAt: z.string().datetime().optional(),
});

const entitlementPreviewInputSchema = z.object({
  productType: z.enum(productTypes),
  orderStatus: z.enum([
    "DRAFT",
    "PROCESSING",
    "SUCCEEDED",
    "FAILED",
    "REFUNDED",
    "CHARGEBACK",
  ]),
  purchasedAt: z.string().datetime(),
  evaluatedAt: z.string().datetime().optional(),
  revokedAt: z.string().datetime().optional(),
  subscriptionStatus: z
    .enum(["DRAFT", "ACTIVE", "PAST_DUE", "PAUSED", "CANCELED", "EXPIRED"])
    .optional(),
  currentPeriodEnd: z.string().datetime().optional(),
  gracePeriodEndsAt: z.string().datetime().optional(),
});

function toTRPCError(error: unknown): TRPCError {
  if (error instanceof CommercePolicyError) {
    return new TRPCError({
      code: "BAD_REQUEST",
      message: error.message,
      cause: {
        code: error.code,
        details: error.details,
      },
    });
  }

  if (error instanceof Error) {
    return new TRPCError({
      code: "BAD_REQUEST",
      message: error.message,
    });
  }

  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Unknown commerce error",
  });
}

export const commerceRouter = createTRPCRouter({
  policy: createTRPCRouter({
    quoteCheckout: publicProcedure
      .input(checkoutQuoteInputSchema)
      .query(({ input }) => {
        try {
          return resolveCheckoutQuote(input);
        } catch (error) {
          throw toTRPCError(error);
        }
      }),
  }),
  ledger: createTRPCRouter({
    previewPurchase: publicProcedure
      .input(ledgerPreviewInputSchema)
      .query(({ input }) => {
        try {
          return buildPurchaseLedgerPreview(input);
        } catch (error) {
          throw toTRPCError(error);
        }
      }),
  }),
  entitlements: createTRPCRouter({
    preview: publicProcedure
      .input(entitlementPreviewInputSchema)
      .query(({ input }) => previewEntitlement(input)),
  }),
});
