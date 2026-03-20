# OpenStore Global Payments Execution Status

## Repository Work Completed

The following checklist areas now have repository-side foundations:

- Prisma models for merchant entities, merchant accounts, PSP routes, contracts, products, pricing, orders, invoices, payment attempts, subscriptions, ledger entries, entitlements, settlements, payouts, refunds, disputes, and reserves.
- Prisma 7 configuration via `prisma.config.ts`.
- A contract and merchant registry with route selection, lane selection, tax mode resolution, and payment-method eligibility rules.
- A checkout-session blueprint helper for deterministic idempotency and route-backed session creation.
- Payment status normalization for multiple providers.
- Ledger preview generation for purchase postings.
- Entitlement preview logic for one-time purchases and subscriptions.
- Subscription renewal preview logic.
- Settlement aggregation previews.
- Reserve-policy classification helpers.
- tRPC commerce endpoints for checkout quotes, ledger previews, and entitlement previews.
- Automated tests covering the new commerce modules and router.

## Validation Completed

- `pnpm typecheck`
- `pnpm test`
- `DATABASE_URL='postgresql://postgres:postgres@localhost:5432/openstore' pnpm exec prisma validate`

## Work Still Requiring External Execution

The following checklist items cannot be completed purely inside this repository and still need operator execution:

- Finalize the initial launch countries and supported currencies.
- Create or confirm the legal entities that will contract with customers.
- Draft and approve consumer terms and developer agreements.
- Open and configure live PSP accounts, merchant accounts, and payout destinations.
- Complete KYB/KYC onboarding operations and compliance workflows.
- Register and operationalize tax filing responsibilities.
- Set real refund, reserve, and chargeback policies with finance and legal owners.
- Choose the first live PSP, launch countries, and payment methods.

## Recommended Next Non-Code Decision

- Confirm whether OpenStore launch should be marketplace-only or marketplace plus a first-party merchant-of-record lane.
