# OpenStore Global Payments Implementation Checklist

## Goal

This checklist turns the global payments architecture into an execution backlog for OpenStore.

Related status:

- [Repository execution status](./EXECUTION-STATUS.md)

## 1. Business and Legal Foundations

- Define the initial launch countries and supported currencies.
- Decide which OpenStore legal entity will contract with customers in each launch country.
- Decide whether any first-party products need a separate merchant-of-record lane.
- Draft consumer terms for each launch region.
- Draft the developer distribution agreement and revenue share schedules.
- Define refund, dispute, and chargeback policies.
- Define reserve policies for high-risk developers, categories, and geographies.
- Define tax ownership rules by lane, country, and product type.
- Define payout timing rules, payout minimums, and negative-balance handling.
- Define KYB/KYC requirements for developer onboarding.

## 2. Provider and Account Setup

- Select the primary marketplace PSP for launch.
- Create sandbox and production PSP accounts for each required entity.
- Create merchant accounts, payout accounts, and reporting access.
- Enable the initial payment methods for one-time purchases.
- Enable only recurring-capable methods for subscriptions.
- Configure webhook endpoints, signing secrets, and alerting.
- Define provider object-mapping conventions and ID storage rules.
- Document failover criteria for adding a secondary PSP later.

## 3. Core Domain Modeling

- Define the `merchant_entity` model.
- Define the `merchant_account` model.
- Define the `psp_route` model.
- Define the `storefront_region` model.
- Define the `consumer_contract_version` model.
- Define the `developer_contract_version` model.
- Define the `developer_account` model.
- Define the `developer_tax_profile` model.
- Define the `payout_profile` model.
- Define the `product`, `price_book`, and offer models.
- Define the `order`, `invoice`, and `payment_attempt` models.
- Define the `payment_instrument_ref` and `mandate_ref` models.
- Define the `subscription` and `subscription_schedule` models.
- Define the `ledger_entry` model.
- Define the `entitlement` model.
- Define the `settlement_batch`, `payout`, `refund_case`, `dispute_case`, and `reserve_hold` models.

## 4. Contract and Merchant Registry

- Build a registry for legal entities, merchant accounts, PSP routes, and region policies.
- Store historical contract versions and make them queryable.
- Build decision rules for lane selection.
- Build decision rules for entity and merchant-account selection.
- Build decision rules for payment-method eligibility.
- Build decision rules for recurring-payment eligibility.
- Build decision rules for tax mode selection.
- Build decision rules for revenue-share and reserve schedules.
- Snapshot resolved contract and policy data onto every order draft.

## 5. Catalog, Pricing, and Offer Management

- Add support for paid apps.
- Add support for consumable IAP products.
- Add support for non-consumable IAP products.
- Add support for auto-renewing subscription plans.
- Add support for country-specific price books.
- Add support for currency-specific prices.
- Add support for introductory offers and trials.
- Prevent non-recurring payment methods from appearing on subscription offers.
- Version pricing and offer rules for auditability.

## 6. Checkout and Payment Orchestration

- Build a checkout session API used by all clients.
- Add idempotency for create, confirm, cancel, and refund flows.
- Return only the payment methods allowed by the resolved route.
- Integrate the first PSP for authorization, capture, cancel, and refund.
- Persist PSP object references on orders and payment attempts.
- Normalize PSP payment states into OpenStore payment states.
- Add retry and timeout handling.
- Add webhook ingestion with signature verification.
- Add webhook deduplication and replay protection.
- Ensure clients never depend directly on raw PSP response formats.

## 7. Payment Method Vault and Mandates

- Store reusable payment method references safely.
- Track mandate and consent scope for recurring billing.
- Track whether a stored method is valid for one-time use, recurring use, or both.
- Add customer flows to update the payment method for subscriptions.
- Add customer flows to remove stored payment methods where policy allows.
- Track provider-specific token portability limits.

## 8. Internal Ledger

- Build an append-only double-entry ledger.
- Define ledger account categories for cash-in-transit, tax payable, developer payable, platform revenue, processor fees, refunds, disputes, and reserves.
- Post ledger entries only from normalized internal commerce events.
- Make every financial workflow idempotent.
- Add event replay support without double-posting.
- Record source references to the order, invoice, payment attempt, refund, dispute, and payout records.
- Add daily reconciliation views for finance operations.

## 9. Subscriptions

- Build the internal subscription state machine.
- Build billing-cycle scheduling.
- Build renewal invoice generation.
- Build proration rules for upgrades and downgrades.
- Build grace-period handling.
- Build dunning and retry flows.
- Build cancellation flows for immediate and end-of-period cancellation.
- Build pause and resume behavior if OpenStore wants it.
- Mirror PSP subscription data into OpenStore-owned subscription records.

## 10. Entitlements and Receipts

- Define the receipt format for paid apps, IAP, and subscriptions.
- Build entitlement grant rules after ledger-confirmed success.
- Build entitlement revocation and downgrade rules for refund, expiration, and chargeback events.
- Add receipt verification APIs for app clients and backend services.
- Add entitlement history and audit trails.
- Ensure entitlements depend on internal state, not raw webhook timing.

## 11. Developer Onboarding and Settlements

- Build developer onboarding for identity, business, tax, and payout setup.
- Add KYC/KYB status tracking.
- Add payout-profile validation and currency rules.
- Build revenue-share calculation by developer contract version.
- Build reserve calculation rules.
- Build payout-eligibility rules based on settlement timing and risk policy.
- Generate developer settlement statements.
- Build payout batch creation.
- Build payout reconciliation and failed-payout recovery.

## 12. Tax and Compliance Operations

- Decide whether launch tax calculation will use PSP-native tax tooling or a dedicated tax engine.
- Build tax classification rules for products and services.
- Calculate tax at checkout time, not after payment.
- Store tax determination details on each order and invoice.
- Track VAT/GST registrations by entity and country.
- Track withholding-tax requirements for developers where applicable.
- Add tax reporting exports by country, entity, and period.
- Add audit access to historical tax logic and contract versions.

## 13. Refunds, Disputes, Risk, and Reserves

- Build operator flows for customer refunds.
- Build policy checks for refund eligibility.
- Build dispute intake and evidence workflows.
- Track dispute deadlines and evidence submissions.
- Build developer-level risk scoring and reserve tiers.
- Build anomaly monitoring for refund spikes, dispute spikes, and abuse patterns.
- Define negative-balance handling for developers.
- Decide when entitlements are revoked for chargebacks and fraud events.

## 14. Reconciliation and Reporting

- Reconcile payment events against PSP reports.
- Reconcile PSP balances against bank settlements.
- Reconcile payouts against developer statements and payout provider reports.
- Build finance-close reports by entity, country, currency, and period.
- Build product reporting for gross sales, refunds, churn, MRR, and top-grossing apps.
- Build operational reporting for failed renewals, dispute rates, reserve balances, and payout holds.

## 15. Operator Tooling

- Build internal tooling to manage entities, merchant accounts, and routes.
- Build internal tooling to manage contract versions and policy rollouts.
- Build internal tooling to inspect orders, invoices, payments, entitlements, refunds, disputes, and payouts.
- Build internal tooling to rerun safe reconciliation and repair jobs.
- Build internal tooling to place or release manual reserves.
- Build internal tooling to override payout holds with audit logging.

## 16. Security and Reliability

- Define the boundary for PCI-sensitive data and avoid storing raw card data in OpenStore systems.
- Restrict production payment operations behind strong admin authorization.
- Encrypt sensitive payout and tax data at rest.
- Add audit logs for all operator actions.
- Add rate limiting and abuse protection to checkout and receipt-verification APIs.
- Add alerting for webhook failures, reconciliation gaps, payout failures, and dispute spikes.
- Add disaster-recovery and replay procedures for payment events.

## 17. Testing and Rollout

- Add unit tests for contract routing logic.
- Add unit tests for tax and payment-method eligibility rules.
- Add integration tests for checkout, webhook, refund, and payout flows.
- Add replay tests for ledger idempotency.
- Add subscription renewal and dunning test scenarios.
- Add dispute and refund regression scenarios.
- Run country-by-country launch readiness reviews.
- Launch one-time purchases first if subscription scope delays the release.

## Recommended Delivery Order

### Phase 0

- Contract and Merchant Registry
- Core order and payment models
- Internal ledger
- One-time purchase flow with one marketplace PSP
- Entitlement grant and refund reversal

### Phase 1

- Developer onboarding
- Settlement statements
- Payout batch generation
- Refund operations
- Reconciliation dashboards

### Phase 2

- Subscription lifecycle
- Stored payment methods and mandate handling
- Dunning and payment-method updates
- Subscription reporting

### Phase 3

- Second PSP integration
- Local payment methods
- More entities and more countries
- Advanced reserves and risk segmentation

## Immediate Next Tasks For This Repository

- Create the initial `src/server/commerce` module structure.
- Design the first-pass schema for orders, payments, subscriptions, ledger entries, and entitlements.
- Decide the first launch lane: marketplace only, or marketplace plus a limited first-party merchant-of-record lane.
- Pick the first PSP and document the exact launch countries and payment methods.
- Implement the contract and merchant registry before any provider-specific checkout code spreads through the app.
