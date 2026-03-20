import Link from "next/link";
import { notFound } from "next/navigation";

import {
  cancelCheckoutOrderAction,
  confirmCheckoutOrderAction,
  createCheckoutOrderAction,
} from "@/app/_actions/store-actions";
import { SubmitButton } from "@/components/store/submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/store/section-heading";
import { getCaller } from "@/server/api/server";

const selectClassName =
  "h-12 w-full rounded-2xl border border-white/40 bg-white/80 px-4 text-sm text-[var(--ink-strong)] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] outline-none ring-0 backdrop-blur";

type CheckoutPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    countryCode?: string | string[];
    currencyCode?: string | string[];
    order?: string | string[];
    platform?: string | string[];
  }>;
};

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CheckoutPage({
  params,
  searchParams,
}: CheckoutPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const caller = getCaller();
  const [app, markets] = await Promise.all([
    caller.store.appBySlug({ slug }).catch(() => null),
    caller.store.checkout.markets(),
  ]);

  if (!app) {
    notFound();
  }

  const defaultMarket = markets.find((market) => market.countryCode === "US") ?? markets[0];
  const countryCode = (firstValue(query.countryCode) ?? defaultMarket.countryCode).toUpperCase();
  const currencyCode = (
    firstValue(query.currencyCode) ?? defaultMarket.currencyCode
  ).toUpperCase();
  const platform = firstValue(query.platform);
  const requestedPlatform =
    platform === "IOS" || platform === "ANDROID" || platform === "WEB"
      ? platform
      : "WEB";
  const orderId = firstValue(query.order);

  const quote =
    app.priceLabel === "Free"
      ? null
      : await caller.store.checkout
          .quote({
            appSlug: slug,
            countryCode,
            currencyCode,
            platform: requestedPlatform,
          })
          .catch((error) => ({
            error: error instanceof Error ? error.message : "Checkout quote failed.",
          }));

  const order = orderId
    ? await caller.store.checkout.orderById({ id: orderId }).catch(() => null)
    : null;
  const activeOrder =
    order && order.id === orderId && order.app?.slug === slug ? order : null;
  const pendingOrder =
    activeOrder?.status === "PENDING_CONFIRMATION" ? activeOrder : null;
  const quoteError = quote && "error" in quote ? quote.error : null;
  const resolvedQuote = quote && !("error" in quote) ? quote : null;

  return (
    <>
      <section className="rounded-[36px] border border-white/45 bg-white/72 p-6 shadow-[0_16px_40px_rgba(17,28,55,0.08)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge>Checkout</Badge>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em]">
              {app.name}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ink-soft)]">
              Validate the lane, provider, payment methods, and contract version before
              creating the order.
            </p>
          </div>
          <div className="rounded-[26px] bg-[var(--accent-soft)]/55 p-4 text-right">
            <p className="text-sm text-[var(--ink-soft)]">Catalog price</p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
              {app.priceLabel}
            </p>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">{app.developer.name}</p>
          </div>
        </div>
      </section>

      {app.priceLabel === "Free" ? (
        <section className="rounded-[30px] border border-white/40 bg-white/75 p-6 shadow-[0_16px_40px_rgba(17,28,55,0.08)]">
          <p className="text-sm leading-7 text-[var(--ink-soft)]">
            Free apps do not need checkout. Go back to the app page and queue the install
            directly.
          </p>
          <Button asChild className="mt-4">
            <Link href={`/apps/${app.slug}`}>Back to app</Link>
          </Button>
        </section>
      ) : (
        <>
          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <form
              action={`/checkout/${app.slug}`}
              className="rounded-[32px] border border-white/40 bg-white/75 p-6 shadow-[0_16px_40px_rgba(17,28,55,0.08)]"
            >
              <SectionHeading
                eyebrow="Quote inputs"
                title="Region and platform"
                description="Preview the exact checkout routing before opening the session."
              />
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <label className="space-y-2 text-sm text-[var(--ink-soft)]">
                  <span>Country</span>
                  <select
                    className={selectClassName}
                    defaultValue={countryCode}
                    name="countryCode"
                  >
                    {markets.map((market) => (
                      <option key={market.countryCode} value={market.countryCode}>
                        {market.countryCode}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm text-[var(--ink-soft)]">
                  <span>Currency</span>
                  <select
                    className={selectClassName}
                    defaultValue={currencyCode}
                    name="currencyCode"
                  >
                    {[...new Set(markets.map((market) => market.currencyCode))].map(
                      (currency) => (
                        <option key={currency} value={currency}>
                          {currency}
                        </option>
                      ),
                    )}
                  </select>
                </label>
                <label className="space-y-2 text-sm text-[var(--ink-soft)]">
                  <span>Platform</span>
                  <select
                    className={selectClassName}
                    defaultValue={requestedPlatform}
                    name="platform"
                  >
                    <option value="WEB">WEB</option>
                    <option value="IOS">IOS</option>
                    <option value="ANDROID">ANDROID</option>
                  </select>
                </label>
              </div>
              <Button className="mt-6" type="submit" variant="secondary">
                Refresh quote
              </Button>
            </form>

            <div className="rounded-[32px] border border-white/40 bg-[var(--ink-strong)] p-6 text-white shadow-[0_16px_40px_rgba(17,28,55,0.14)]">
              {quoteError ? (
                <>
                  <SectionHeading title="Quote error" />
                  <p className="mt-4 text-sm leading-7 text-white/78">{quoteError}</p>
                </>
              ) : resolvedQuote ? (
                <>
                  <SectionHeading title="Resolved route" />
                  <div className="mt-5 grid gap-3 text-sm text-white/82">
                    <div className="rounded-[22px] bg-white/10 p-4">
                      <p className="text-white/60">Lane</p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {resolvedQuote.quote.lane}
                      </p>
                    </div>
                    <div className="rounded-[22px] bg-white/10 p-4">
                      <p className="text-white/60">Provider</p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {resolvedQuote.quote.provider}
                      </p>
                    </div>
                    <div className="rounded-[22px] bg-white/10 p-4">
                      <p className="text-white/60">Amount</p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {resolvedQuote.amountLabel}
                      </p>
                    </div>
                    <div className="rounded-[22px] bg-white/10 p-4">
                      <p className="text-white/60">Methods</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {resolvedQuote.quote.paymentMethods.map((method) => (
                          <Badge
                            key={method}
                            className="bg-white/12 text-white"
                            variant="muted"
                          >
                            {method}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </section>

          {resolvedQuote && pendingOrder ? (
            <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-[32px] border border-white/40 bg-white/75 p-6 shadow-[0_16px_40px_rgba(17,28,55,0.08)]">
                <SectionHeading
                  eyebrow="Order review"
                  title="Confirm this checkout order"
                  description="This is the handoff point before payment confirmation."
                />
                <dl className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[22px] bg-[var(--accent-soft)]/55 p-4">
                    <dt className="text-sm text-[var(--ink-soft)]">Order ID</dt>
                    <dd className="mt-2 text-sm font-semibold text-[var(--ink-strong)]">
                      {pendingOrder.id}
                    </dd>
                  </div>
                  <div className="rounded-[22px] bg-[var(--accent-soft)]/55 p-4">
                    <dt className="text-sm text-[var(--ink-soft)]">Status</dt>
                    <dd className="mt-2 text-sm font-semibold text-[var(--ink-strong)]">
                      {pendingOrder.status}
                    </dd>
                  </div>
                  <div className="rounded-[22px] bg-[var(--accent-soft)]/55 p-4">
                    <dt className="text-sm text-[var(--ink-soft)]">Contract</dt>
                    <dd className="mt-2 text-sm font-semibold text-[var(--ink-strong)]">
                      {pendingOrder.consumerContractVersion}
                    </dd>
                  </div>
                  <div className="rounded-[22px] bg-[var(--accent-soft)]/55 p-4">
                    <dt className="text-sm text-[var(--ink-soft)]">Merchant account</dt>
                    <dd className="mt-2 text-sm font-semibold text-[var(--ink-strong)]">
                      {pendingOrder.merchantAccountKey}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="space-y-4">
                <form
                  action={confirmCheckoutOrderAction}
                  className="rounded-[32px] border border-white/40 bg-white/75 p-6 shadow-[0_16px_40px_rgba(17,28,55,0.08)]"
                >
                  <SectionHeading title="Confirm payment" />
                  <input name="id" type="hidden" value={pendingOrder.id} />
                  <input name="appSlug" type="hidden" value={app.slug} />
                  <input name="returnPath" type="hidden" value="/library" />
                  <label className="mt-5 block space-y-2 text-sm text-[var(--ink-soft)]">
                    <span>Payment method</span>
                    <select
                      className={selectClassName}
                      defaultValue={pendingOrder.selectedPaymentMethod}
                      name="paymentMethod"
                    >
                      {pendingOrder.paymentMethods.map((method) => (
                        <option key={method} value={method}>
                          {method}
                        </option>
                      ))}
                    </select>
                  </label>
                  <SubmitButton className="mt-6" pendingLabel="Confirming...">
                    Confirm checkout
                  </SubmitButton>
                </form>

                <form
                  action={cancelCheckoutOrderAction}
                  className="rounded-[32px] border border-white/40 bg-white/75 p-6 shadow-[0_16px_40px_rgba(17,28,55,0.08)]"
                >
                  <input name="id" type="hidden" value={pendingOrder.id} />
                  <input name="appSlug" type="hidden" value={app.slug} />
                  <input name="returnPath" type="hidden" value={`/checkout/${app.slug}`} />
                  <SubmitButton pendingLabel="Canceling..." variant="outline">
                    Cancel order
                  </SubmitButton>
                </form>
              </div>
            </section>
          ) : activeOrder ? (
            <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-[32px] border border-white/40 bg-white/75 p-6 shadow-[0_16px_40px_rgba(17,28,55,0.08)]">
                <SectionHeading
                  eyebrow="Order status"
                  title="This checkout order is finalized"
                  description="Terminal orders stay visible for audit, but they cannot be confirmed or canceled again."
                />
                <dl className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[22px] bg-[var(--accent-soft)]/55 p-4">
                    <dt className="text-sm text-[var(--ink-soft)]">Order ID</dt>
                    <dd className="mt-2 text-sm font-semibold text-[var(--ink-strong)]">
                      {activeOrder.id}
                    </dd>
                  </div>
                  <div className="rounded-[22px] bg-[var(--accent-soft)]/55 p-4">
                    <dt className="text-sm text-[var(--ink-soft)]">Status</dt>
                    <dd className="mt-2 text-sm font-semibold text-[var(--ink-strong)]">
                      {activeOrder.status}
                    </dd>
                  </div>
                  <div className="rounded-[22px] bg-[var(--accent-soft)]/55 p-4">
                    <dt className="text-sm text-[var(--ink-soft)]">Amount</dt>
                    <dd className="mt-2 text-sm font-semibold text-[var(--ink-strong)]">
                      {activeOrder.amountLabel}
                    </dd>
                  </div>
                  <div className="rounded-[22px] bg-[var(--accent-soft)]/55 p-4">
                    <dt className="text-sm text-[var(--ink-soft)]">Updated</dt>
                    <dd className="mt-2 text-sm font-semibold text-[var(--ink-strong)]">
                      {new Date(activeOrder.updatedAt).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </dd>
                  </div>
                </dl>
              </div>

              {resolvedQuote ? (
                <form
                  action={createCheckoutOrderAction}
                  className="rounded-[32px] border border-white/40 bg-white/75 p-6 shadow-[0_16px_40px_rgba(17,28,55,0.08)]"
                >
                  <SectionHeading
                    eyebrow="Create another order"
                    title="Open a fresh checkout session"
                    description="Use a new order if you need to retry a canceled checkout or test another payment route."
                  />
                  <input name="appSlug" type="hidden" value={app.slug} />
                  <input name="countryCode" type="hidden" value={countryCode} />
                  <input name="currencyCode" type="hidden" value={currencyCode} />
                  <input name="platform" type="hidden" value={requestedPlatform} />
                  <SubmitButton className="mt-6" pendingLabel="Creating order...">
                    Create new checkout order
                  </SubmitButton>
                </form>
              ) : null}
            </section>
          ) : resolvedQuote ? (
            <form
              action={createCheckoutOrderAction}
              className="rounded-[32px] border border-white/40 bg-white/75 p-6 shadow-[0_16px_40px_rgba(17,28,55,0.08)]"
            >
              <SectionHeading
                eyebrow="Create order"
                title="Open the checkout session"
                description="This will persist an order draft and expose it to the operator and developer consoles."
              />
              <input name="appSlug" type="hidden" value={app.slug} />
              <input name="countryCode" type="hidden" value={countryCode} />
              <input name="currencyCode" type="hidden" value={currencyCode} />
              <input name="platform" type="hidden" value={requestedPlatform} />
              <SubmitButton className="mt-6" pendingLabel="Creating order...">
                Create checkout order
              </SubmitButton>
            </form>
          ) : null}
        </>
      )}
    </>
  );
}
