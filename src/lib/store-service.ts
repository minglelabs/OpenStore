import { randomUUID } from "node:crypto";

import type {
  EnrichedApp,
  EnrichedCollection,
  ReviewRecord,
} from "@/lib/store-data";
import {
  getAccountSnapshot,
  getAllApps,
  getAllCategories,
  getAllCollections,
  getAllDevelopers,
  getAppBySlug,
  getCategoryBySlug,
  getCharts,
  getCollectionBySlug,
  getDeveloperBySlug,
  getDiscoverFeed,
  getTodayFeed,
  searchStore,
  type ChartView,
} from "@/lib/store-data";
import {
  formatCurrencyAmount,
  getBillingModelForApp,
  resolveAppPricing,
  resolveStoredOrderAmount,
} from "@/lib/store-pricing";
import {
  createInitialStoreState,
  readStoreState,
  resetPersistentStoreState,
  updateStoreState,
  type AppReport,
  type CheckoutOrder,
  type DeveloperReport,
  type HiddenPurchaseEntry,
  type PurchaseHistoryEntry,
  type QueueRuntimeItem,
  type StoreSessionState,
} from "@/lib/store-state";
import { averageProgress } from "@/lib/utils";
import {
  buildCheckoutSessionBlueprint,
  type CheckoutSessionBlueprint,
} from "@/server/commerce/checkout/session";
import {
  defaultContractRegistry,
  resolveCheckoutQuote,
  type CheckoutPlatform,
  type PaymentMethodType,
  type ProductType,
} from "@/server/commerce/contracts/registry";

export type AppStatus = EnrichedApp["status"];
export type PricingFilter = "any" | "free" | "paid" | "subscription";
export type AppSort = "featured" | "rating" | "downloads" | "recent";
export type SearchSort = "relevance" | "rating" | "downloads" | "recent";

const baseAccountSnapshot = getAccountSnapshot();
const baseReviewsByApp = Object.fromEntries(
  getAllApps().map((app) => [app.slug, structuredClone(app.reviews)]),
) as Record<string, ReviewRecord[]>;
const initialSessionState = createInitialStoreState(baseReviewsByApp);
type CheckoutOrderWithApp = CheckoutOrder & { amountValue: number; app: EnrichedApp };

function getSessionState() {
  return readStoreState(initialSessionState);
}

function mutateSessionState<T>(updater: (state: StoreSessionState) => T) {
  return updateStoreState(initialSessionState, updater);
}

function getReviewListFromState(state: StoreSessionState, appSlug: string) {
  return structuredClone(state.reviewsByApp[appSlug] ?? []);
}

function resolveAppStatusFromState(state: StoreSessionState, appSlug: string): AppStatus {
  if (state.updates.some((item) => item.slug === appSlug)) {
    return "update";
  }

  if (state.queue.some((item) => item.slug === appSlug)) {
    return "queued";
  }

  if (state.installed.includes(appSlug)) {
    return "installed";
  }

  if (state.wishlist.includes(appSlug)) {
    return "wishlist";
  }

  return "available";
}

function hydrateAppFromState(state: StoreSessionState, app: EnrichedApp): EnrichedApp {
  return {
    ...app,
    status: resolveAppStatusFromState(state, app.slug),
    reviews: getReviewListFromState(state, app.slug),
  };
}

function hydrateCollectionFromState(
  state: StoreSessionState,
  collection: EnrichedCollection,
): EnrichedCollection {
  return {
    ...collection,
    apps: collection.apps.map((app) => hydrateAppFromState(state, app)),
  };
}

function getHydratedAppOrNull(state: StoreSessionState, slug: string) {
  const app = getAppBySlug(slug);
  return app ? hydrateAppFromState(state, app) : null;
}

function getHydratedApps(state: StoreSessionState) {
  return getAllApps().map((app) => hydrateAppFromState(state, app));
}

function getLibrarySnapshotFromState(state: StoreSessionState) {
  const installed = state.installed
    .map((slug) => getHydratedAppOrNull(state, slug))
    .filter((app): app is EnrichedApp => Boolean(app));
  const updates = state.updates
    .map((item) => ({
      ...item,
      app: getHydratedAppOrNull(state, item.slug),
    }))
    .filter((item): item is QueueRuntimeItem & { app: EnrichedApp } => Boolean(item.app));
  const queue = state.queue
    .map((item) => ({
      ...item,
      app: getHydratedAppOrNull(state, item.slug),
    }))
    .filter((item): item is QueueRuntimeItem & { app: EnrichedApp } => Boolean(item.app));
  const wishlist = state.wishlist
    .map((slug) => getHydratedAppOrNull(state, slug))
    .filter((app): app is EnrichedApp => Boolean(app));

  return {
    installed,
    updates,
    queue,
    wishlist,
    activity: structuredClone(state.activity),
    queueAverage: averageProgress(queue.map((item) => item.progress)),
  };
}

function getPurchaseHistoryFromState(state: StoreSessionState) {
  return state.purchaseHistory
    .map((entry) => ({
      ...entry,
      app: getHydratedAppOrNull(state, entry.slug),
      hidden: state.hiddenPurchases.some((item) => item.slug === entry.slug),
    }))
    .filter((entry): entry is PurchaseHistoryEntry & { app: EnrichedApp; hidden: boolean } =>
      Boolean(entry.app),
    );
}

function getHiddenPurchasesFromState(state: StoreSessionState) {
  return state.hiddenPurchases
    .map((entry) => ({
      ...entry,
      app: getHydratedAppOrNull(state, entry.slug),
    }))
    .filter((entry): entry is HiddenPurchaseEntry & { app: EnrichedApp } => Boolean(entry.app));
}

function getAccountSnapshotFromState(state: StoreSessionState) {
  return {
    ...baseAccountSnapshot,
    notifications: structuredClone(state.notifications),
    devices: structuredClone(state.devices),
    activeSubscriptions: state.activeSubscriptionSlugs
      .map((slug) => getHydratedAppOrNull(state, slug))
      .filter((app): app is EnrichedApp => Boolean(app)),
  };
}

function sortApps(apps: EnrichedApp[], sort: AppSort) {
  const items = [...apps];

  switch (sort) {
    case "rating":
      return items.sort((left, right) => right.rating - left.rating);
    case "downloads":
      return items.sort((left, right) => right.downloadCount - left.downloadCount);
    case "recent":
      return items.sort(
        (left, right) =>
          new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
      );
    default:
      return items;
  }
}

function matchesPricingFilter(appSlug: string, pricing: PricingFilter) {
  const billingModel = getBillingModelForApp(appSlug);

  switch (pricing) {
    case "free":
      return billingModel === "FREE";
    case "paid":
      return billingModel === "ONE_TIME";
    case "subscription":
      return billingModel === "SUBSCRIPTION";
    default:
      return true;
  }
}

function pushActivity(
  state: StoreSessionState,
  title: string,
  detail: string,
  timestamp = "Just now",
) {
  state.activity.unshift({ title, detail, timestamp });
  state.activity = state.activity.slice(0, 12);
}

function getQueuedItem(state: StoreSessionState, slug: string) {
  return state.queue.find((item) => item.slug === slug);
}

function getUpdateItem(state: StoreSessionState, slug: string) {
  return state.updates.find((item) => item.slug === slug);
}

function inferProductType(app: EnrichedApp): ProductType {
  return getBillingModelForApp(app.slug) === "SUBSCRIPTION"
    ? "AUTO_RENEWING_SUBSCRIPTION"
    : "PAID_APP";
}

function requirePaidApp(app: EnrichedApp) {
  if (getBillingModelForApp(app.slug) === "FREE") {
    throw new Error(`App ${app.slug} does not require checkout.`);
  }
}

function attachAppReport(state: StoreSessionState, report: AppReport) {
  return {
    ...report,
    app: getHydratedAppOrNull(state, report.appSlug),
  };
}

function attachDeveloperReport(state: StoreSessionState, report: DeveloperReport) {
  return {
    ...report,
    developer: getDeveloperBySlugService(report.developerSlug),
  };
}

function getOrderPricingSnapshot(order: CheckoutOrder) {
  const resolvedAmount = resolveStoredOrderAmount(order);

  if (typeof order.amountValue === "number" && Number.isFinite(order.amountValue)) {
    return {
      amountValue: order.amountValue,
      amountLabel: order.amountLabel,
    };
  }

  const canonicalPricing = resolveAppPricing(order.appSlug, order.currencyCode);

  return {
    amountValue: resolvedAmount,
    amountLabel: canonicalPricing?.amountLabel ?? order.amountLabel,
  };
}

function buildDeveloperSalesSnapshot(
  orders: CheckoutOrder[],
  developerSlug: string,
  status: CheckoutOrder["status"] = "SUCCEEDED",
) {
  const filtered = orders.filter(
    (order) => order.developerSlug === developerSlug && order.status === status,
  );

  const totals = new Map<string, number>();

  for (const order of filtered) {
    const { amountValue } = getOrderPricingSnapshot(order);
    totals.set(
      order.currencyCode,
      (totals.get(order.currencyCode) ?? 0) + amountValue,
    );
  }

  return {
    count: filtered.length,
    totalsByCurrency: [...totals.entries()].map(([currencyCode, amount]) => ({
      currencyCode,
      amount: Number(amount.toFixed(2)),
      label: formatCurrencyAmount(currencyCode, amount),
    })),
    orders: filtered.sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    ),
  };
}

export function resetStoreServiceState() {
  resetPersistentStoreState(initialSessionState);
}

export function getCatalogSummary() {
  return {
    appCount: getAllApps().length,
    developerCount: getAllDevelopers().length,
    categoryCount: getAllCategories().length,
    collectionCount: getAllCollections().length,
  };
}

export function listApps(input?: {
  categorySlug?: string;
  developerSlug?: string;
  status?: AppStatus;
  pricing?: PricingFilter;
  limit?: number;
  sort?: AppSort;
  ids?: string[];
}) {
  const state = getSessionState();
  const filtered = sortApps(
    getHydratedApps(state).filter((app) => {
      if (input?.ids && !input.ids.includes(app.slug)) {
        return false;
      }

      if (input?.categorySlug && app.category.slug !== input.categorySlug) {
        return false;
      }

      if (input?.developerSlug && app.developer.slug !== input.developerSlug) {
        return false;
      }

      if (input?.status && app.status !== input.status) {
        return false;
      }

      if (!matchesPricingFilter(app.slug, input?.pricing ?? "any")) {
        return false;
      }

      return true;
    }),
    input?.sort ?? "featured",
  );

  return typeof input?.limit === "number" ? filtered.slice(0, input.limit) : filtered;
}

export function listDevelopers(input?: { verifiedOnly?: boolean; limit?: number }) {
  const developers = getAllDevelopers().filter(
    (developer) => !input?.verifiedOnly || developer.verified,
  );

  return typeof input?.limit === "number"
    ? developers.slice(0, input.limit)
    : developers;
}

export function listCategories() {
  return getAllCategories();
}

export function listCollections(input?: { categorySlug?: string; limit?: number }) {
  const state = getSessionState();
  const collections = getAllCollections()
    .map((collection) => hydrateCollectionFromState(state, collection))
    .filter(
      (collection) =>
        !input?.categorySlug || collection.category?.slug === input.categorySlug,
    );

  return typeof input?.limit === "number"
    ? collections.slice(0, input.limit)
    : collections;
}

export function getTodayFeedSnapshot() {
  const state = getSessionState();
  const feed = getTodayFeed();

  return {
    ...feed,
    hero: feed.hero ? hydrateAppFromState(state, feed.hero) : null,
    spotlightApps: feed.spotlightApps.map((app) => hydrateAppFromState(state, app)),
    collections: feed.collections.map((collection) =>
      hydrateCollectionFromState(state, collection),
    ),
    releaseRadar: feed.releaseRadar.map((app) => hydrateAppFromState(state, app)),
  };
}

export function getDiscoverFeedSnapshot() {
  const state = getSessionState();
  const feed = getDiscoverFeed();

  return {
    ...feed,
    collections: feed.collections.map((collection) =>
      hydrateCollectionFromState(state, collection),
    ),
    hiddenGems: feed.hiddenGems.map((app) => hydrateAppFromState(state, app)),
  };
}

export function getChartsSnapshot(input: {
  view: ChartView;
  categorySlug?: string;
  limit?: number;
}) {
  const state = getSessionState();
  const ranked = getCharts(input.view)
    .map((app) => hydrateAppFromState(state, app))
    .filter((app) => !input.categorySlug || app.category.slug === input.categorySlug);

  return typeof input.limit === "number" ? ranked.slice(0, input.limit) : ranked;
}

export function getSearchSnapshot(input: {
  query: string;
  categorySlug?: string;
  pricing?: PricingFilter;
  minRating?: number;
  sort?: SearchSort;
}) {
  const state = getSessionState();
  const result = searchStore(input.query);
  let apps = result.apps
    .map((app) => getHydratedAppOrNull(state, app.slug))
    .filter((app): app is EnrichedApp => Boolean(app))
    .filter((app) => {
      if (input.categorySlug && app.category.slug !== input.categorySlug) {
        return false;
      }

      if (!matchesPricingFilter(app.priceLabel, input.pricing ?? "any")) {
        return false;
      }

      if (typeof input.minRating === "number" && app.rating < input.minRating) {
        return false;
      }

      return true;
    });

  if (input.sort === "rating") {
    apps = apps.sort((left, right) => right.rating - left.rating);
  } else if (input.sort === "downloads") {
    apps = apps.sort((left, right) => right.downloadCount - left.downloadCount);
  } else if (input.sort === "recent") {
    apps = apps.sort(
      (left, right) =>
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
    );
  }

  return {
    apps,
    developers: result.developers,
    categories: result.categories,
  };
}

export function getSearchSuggestions(query: string) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return [];
  }

  const state = getSessionState();
  const suggestions = [
    ...getHydratedApps(state).map((app) => app.name),
    ...getAllDevelopers().map((developer) => developer.name),
    ...getAllCategories().map((category) => category.name),
  ].filter((value) => value.toLowerCase().includes(normalized));

  return [...new Set(suggestions)].slice(0, 8);
}

export function getTrendingSearches() {
  return structuredClone(initialSessionState.recentSearches);
}

export function getRecentSearches() {
  return structuredClone(getSessionState().recentSearches);
}

export function recordRecentSearch(query: string) {
  const normalized = query.trim();

  return mutateSessionState((state) => {
    if (!normalized) {
      return structuredClone(state.recentSearches);
    }

    state.recentSearches = [
      normalized,
      ...state.recentSearches.filter((item) => item !== normalized),
    ].slice(0, 8);

    return structuredClone(state.recentSearches);
  });
}

export function getLibrarySnapshotService() {
  const state = getSessionState();
  return getLibrarySnapshotFromState(state);
}

export function getPurchaseHistory() {
  return getPurchaseHistoryFromState(getSessionState());
}

export function getHiddenPurchases() {
  return getHiddenPurchasesFromState(getSessionState());
}

export function addToWishlist(appSlug: string) {
  return mutateSessionState((state) => {
    if (!state.wishlist.includes(appSlug)) {
      state.wishlist.unshift(appSlug);
      pushActivity(state, "App saved to wishlist", `Saved ${appSlug} for later review.`);
    }

    return getLibrarySnapshotFromState(state);
  });
}

export function removeFromWishlist(appSlug: string) {
  return mutateSessionState((state) => {
    state.wishlist = state.wishlist.filter((slug) => slug !== appSlug);
    pushActivity(state, "Wishlist updated", `Removed ${appSlug} from the wishlist.`);

    return getLibrarySnapshotFromState(state);
  });
}

export function queueInstall(appSlug: string) {
  return mutateSessionState((state) => {
    if (!getQueuedItem(state, appSlug) && !getUpdateItem(state, appSlug)) {
      state.queue.unshift({
        slug: appSlug,
        progress: 0,
        eta: "Waiting for download slot",
      });
      state.wishlist = state.wishlist.filter((slug) => slug !== appSlug);
      pushActivity(state, "Download queued", `Queued ${appSlug} for installation.`);
    }

    return getLibrarySnapshotFromState(state);
  });
}

export function pauseDownload(appSlug: string) {
  return mutateSessionState((state) => {
    const item = getQueuedItem(state, appSlug) ?? getUpdateItem(state, appSlug);

    if (item) {
      item.paused = true;
      item.eta = "Paused";
      pushActivity(state, "Download paused", `Paused ${appSlug} in the transfer queue.`);
    }

    return getLibrarySnapshotFromState(state);
  });
}

export function resumeDownload(appSlug: string) {
  return mutateSessionState((state) => {
    const item = getQueuedItem(state, appSlug) ?? getUpdateItem(state, appSlug);

    if (item) {
      item.paused = false;
      item.eta =
        item.progress > 0
          ? `${Math.max(1, 10 - Math.floor(item.progress / 10))} min left`
          : "Preparing download";
      pushActivity(state, "Download resumed", `Resumed ${appSlug} in the transfer queue.`);
    }

    return getLibrarySnapshotFromState(state);
  });
}

export function retryDownload(appSlug: string) {
  return mutateSessionState((state) => {
    const item = getQueuedItem(state, appSlug) ?? getUpdateItem(state, appSlug);

    if (item) {
      item.paused = false;
      item.progress = Math.min(item.progress, 5);
      item.eta = "Retrying download";
    } else {
      state.queue.unshift({
        slug: appSlug,
        progress: 5,
        eta: "Retrying download",
      });
    }

    pushActivity(state, "Download retry started", `Retry requested for ${appSlug}.`);

    return getLibrarySnapshotFromState(state);
  });
}

export function hidePurchase(appSlug: string) {
  return mutateSessionState((state) => {
    if (!state.hiddenPurchases.some((item) => item.slug === appSlug)) {
      state.hiddenPurchases.unshift({
        slug: appSlug,
        hiddenAt: "Just now",
      });
      pushActivity(state, "Purchase hidden", `Hid ${appSlug} from the visible history.`);
    }

    return getHiddenPurchasesFromState(state);
  });
}

export function unhidePurchase(appSlug: string) {
  return mutateSessionState((state) => {
    state.hiddenPurchases = state.hiddenPurchases.filter((item) => item.slug !== appSlug);
    pushActivity(state, "Purchase restored", `Restored ${appSlug} to the purchase history.`);

    return getHiddenPurchasesFromState(state);
  });
}

export function restorePurchases() {
  return mutateSessionState((state) => {
    const restored = getPurchaseHistoryFromState(state).filter((entry) => !entry.hidden);
    pushActivity(
      state,
      "Purchases restored",
      `Restored ${restored.length} purchase records to the current session.`,
    );

    return {
      restored,
      restoredCount: restored.length,
    };
  });
}

export function getAccountSnapshotService() {
  return getAccountSnapshotFromState(getSessionState());
}

export function getNotificationSettings() {
  return structuredClone(getSessionState().notifications);
}

export function getDeviceList() {
  return structuredClone(getSessionState().devices);
}

export function getBillingDetails() {
  return structuredClone(baseAccountSnapshot.billing);
}

export function getSubscriptionApps() {
  const state = getSessionState();

  return state.activeSubscriptionSlugs
    .map((slug) => getHydratedAppOrNull(state, slug))
    .filter((app): app is EnrichedApp => Boolean(app));
}

export function getSecurityControls() {
  return structuredClone(baseAccountSnapshot.controls);
}

export function toggleNotification(input: {
  label: string;
  enabled?: boolean;
}) {
  return mutateSessionState((state) => {
    state.notifications = state.notifications.map((notification) => {
      if (notification.label !== input.label) {
        return notification;
      }

      return {
        ...notification,
        enabled:
          typeof input.enabled === "boolean"
            ? input.enabled
            : !notification.enabled,
      };
    });

    return structuredClone(state.notifications);
  });
}

export function signOutDevice(name: string) {
  return mutateSessionState((state) => {
    state.devices = state.devices.filter((device) => device.name !== name);
    pushActivity(state, "Device signed out", `Removed ${name} from the trusted device list.`);

    return structuredClone(state.devices);
  });
}

export function getAppDetailSections(appSlug: string) {
  const state = getSessionState();
  const app = getHydratedAppOrNull(state, appSlug);

  if (!app) {
    return null;
  }

  const relatedApps = listApps({
    categorySlug: app.category.slug,
    sort: "rating",
  })
    .filter((item) => item.slug !== app.slug)
    .slice(0, 4);
  const relatedCollections = listCollections().filter((collection) =>
    collection.apps.some((item) => item.slug === app.slug),
  );

  return {
    app,
    screenshots: structuredClone(app.screenshots),
    highlights: structuredClone(app.highlights),
    whatsNew: structuredClone(app.whatsNew),
    features: structuredClone(app.features),
    privacy: {
      permissions: structuredClone(app.permissions),
      inAppPurchases: structuredClone(app.inAppPurchases),
      ageRating: app.ageRating,
      size: app.size,
      version: app.version,
    },
    reviews: getReviewListFromState(state, app.slug),
    relatedApps,
    relatedCollections,
  };
}

export function submitReview(input: {
  appSlug: string;
  author: string;
  title: string;
  body: string;
  rating: number;
}) {
  return mutateSessionState((state) => {
    const nextReview: ReviewRecord = {
      appSlug: input.appSlug,
      author: input.author,
      title: input.title,
      body: input.body,
      rating: input.rating,
      submittedAt: "Just now",
    };

    const reviews = state.reviewsByApp[input.appSlug] ?? [];
    const existingIndex = reviews.findIndex((review) => review.author === input.author);

    if (existingIndex >= 0) {
      reviews.splice(existingIndex, 1, nextReview);
    } else {
      reviews.unshift(nextReview);
    }

    state.reviewsByApp[input.appSlug] = reviews;
    pushActivity(state, "Review submitted", `Stored a review for ${input.appSlug}.`);

    return getReviewListFromState(state, input.appSlug);
  });
}

export function updateReview(input: {
  appSlug: string;
  author: string;
  title: string;
  body: string;
  rating: number;
}) {
  return submitReview(input);
}

export function reportApp(input: {
  appSlug: string;
  reason: string;
  detail?: string;
}) {
  return mutateSessionState((state) => {
    const report: AppReport = {
      id: `app-report-${randomUUID()}`,
      appSlug: input.appSlug,
      reason: input.reason,
      detail: input.detail,
      submittedAt: new Date().toISOString(),
      status: "OPEN",
    };

    state.appReports.unshift(report);
    pushActivity(state, "App reported", `Created an operator report for ${input.appSlug}.`);

    return report;
  });
}

export function reportDeveloper(input: {
  developerSlug: string;
  reason: string;
  detail?: string;
}) {
  return mutateSessionState((state) => {
    const report: DeveloperReport = {
      id: `developer-report-${randomUUID()}`,
      developerSlug: input.developerSlug,
      reason: input.reason,
      detail: input.detail,
      submittedAt: new Date().toISOString(),
      status: "OPEN",
    };

    state.developerReports.unshift(report);
    pushActivity(
      state,
      "Developer reported",
      `Created an operator report for ${input.developerSlug}.`,
    );

    return report;
  });
}

export function resolveAppReport(id: string, resolutionNote?: string) {
  return mutateSessionState((state) => {
    const report = state.appReports.find((item) => item.id === id);

    if (!report) {
      throw new Error(`App report not found for id ${id}`);
    }

    report.status = "RESOLVED";
    report.resolvedAt = new Date().toISOString();
    report.resolutionNote = resolutionNote?.trim() || "Resolved in operator console.";
    pushActivity(state, "App report resolved", `Closed ${report.id}.`);

    return report;
  });
}

export function resolveDeveloperReport(id: string, resolutionNote?: string) {
  return mutateSessionState((state) => {
    const report = state.developerReports.find((item) => item.id === id);

    if (!report) {
      throw new Error(`Developer report not found for id ${id}`);
    }

    report.status = "RESOLVED";
    report.resolvedAt = new Date().toISOString();
    report.resolutionNote = resolutionNote?.trim() || "Resolved in operator console.";
    pushActivity(state, "Developer report resolved", `Closed ${report.id}.`);

    return report;
  });
}

export function getAppBySlugService(slug: string) {
  const state = getSessionState();
  const app = getAppBySlug(slug);
  return app ? hydrateAppFromState(state, app) : null;
}

export function getDeveloperBySlugService(slug: string) {
  const state = getSessionState();
  const developer = getDeveloperBySlug(slug);

  if (!developer) {
    return null;
  }

  return {
    ...developer,
    apps: developer.apps.map((app) => hydrateAppFromState(state, app)),
  };
}

export function getCollectionBySlugService(slug: string) {
  const state = getSessionState();
  const collection = getCollectionBySlug(slug);
  return collection ? hydrateCollectionFromState(state, collection) : null;
}

export function getCategoryBySlugService(slug: string) {
  const state = getSessionState();
  const category = getCategoryBySlug(slug);

  if (!category) {
    return null;
  }

  return {
    ...category,
    apps: category.apps.map((app) => hydrateAppFromState(state, app)),
  };
}

export function getDeveloperCatalog(slug: string) {
  const developer = getDeveloperBySlugService(slug);

  if (!developer) {
    return null;
  }

  return {
    ...developer,
    relatedCategories: [...new Set(developer.apps.map((app) => app.category.name))],
  };
}

export function getCheckoutMarkets() {
  return defaultContractRegistry.storefrontRegions.map((region) => ({
    countryCode: region.countryCode,
    currencyCode: region.currencyCode,
    languageCode: region.languageCode,
    taxMode: region.taxMode,
  }));
}

export function getCheckoutQuoteForApp(input: {
  appSlug: string;
  countryCode: string;
  currencyCode: string;
  platform: CheckoutPlatform;
  preferMerchantOfRecord?: boolean;
}) {
  const app = getAppBySlugService(input.appSlug);

  if (!app) {
    throw new Error(`App not found for slug ${input.appSlug}`);
  }

  requirePaidApp(app);

  const productType = inferProductType(app);
  const pricing = resolveAppPricing(app.slug, input.currencyCode);

  if (!pricing) {
    throw new Error(`Canonical pricing is missing for app ${app.slug}`);
  }

  const quote = resolveCheckoutQuote({
    countryCode: input.countryCode,
    currencyCode: input.currencyCode,
    platform: input.platform,
    productType,
    developerType: "THIRD_PARTY",
    preferMerchantOfRecord: input.preferMerchantOfRecord,
  });

  return {
    app,
    productType,
    quote,
    amountValue: pricing.amountValue,
    amountLabel: pricing.amountLabel,
  };
}

export function createCheckoutOrder(input: {
  appSlug: string;
  countryCode: string;
  currencyCode: string;
  platform: CheckoutPlatform;
  preferMerchantOfRecord?: boolean;
}) {
  const preview = getCheckoutQuoteForApp(input);

  return mutateSessionState((state) => {
    const orderId = `order_${randomUUID()}`;
    const blueprint: CheckoutSessionBlueprint = buildCheckoutSessionBlueprint({
      orderReference: orderId,
      countryCode: input.countryCode,
      currencyCode: input.currencyCode,
      platform: input.platform,
      productType: preview.productType,
      developerType: "THIRD_PARTY",
      preferMerchantOfRecord: input.preferMerchantOfRecord,
    });

    const order: CheckoutOrder = {
      id: orderId,
      appSlug: preview.app.slug,
      developerSlug: preview.app.developer.slug,
      productType: preview.productType,
      countryCode: input.countryCode,
      currencyCode: input.currencyCode,
      platform: input.platform,
      lane: blueprint.quote.lane,
      provider: blueprint.quote.provider,
      merchantEntityCode: blueprint.quote.merchantEntityCode,
      merchantAccountKey: blueprint.quote.merchantAccountKey,
      pspRouteKey: blueprint.quote.pspRouteKey,
      consumerContractVersion: blueprint.quote.consumerContractVersion,
      developerContractVersion: blueprint.quote.developerContractVersion,
      paymentMethods: blueprint.quote.paymentMethods,
      selectedPaymentMethod: blueprint.quote.paymentMethods[0],
      amountValue: preview.amountValue,
      amountLabel: preview.amountLabel,
      warnings: blueprint.quote.warnings,
      status: "PENDING_CONFIRMATION",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    state.checkoutOrders.unshift(order);
    pushActivity(
      state,
      "Checkout session created",
      `Prepared checkout for ${preview.app.slug} via ${order.provider}.`,
    );

    return order;
  });
}

export function getCheckoutOrderById(id: string) {
  const state = getSessionState();
  const order = state.checkoutOrders.find((item) => item.id === id);

  if (!order) {
    return null;
  }

  const pricing = getOrderPricingSnapshot(order);

  return {
    ...order,
    ...pricing,
    app: getHydratedAppOrNull(state, order.appSlug),
  };
}

export function listCheckoutOrders() {
  const state = getSessionState();

  return state.checkoutOrders
    .map((order) => {
      const pricing = getOrderPricingSnapshot(order);

      return {
        ...order,
        ...pricing,
        app: getHydratedAppOrNull(state, order.appSlug),
      };
    })
    .filter((order): order is CheckoutOrderWithApp => Boolean(order.app))
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    );
}

export function confirmCheckoutOrder(input: {
  id: string;
  paymentMethod?: PaymentMethodType;
}) {
  return mutateSessionState((state) => {
    const order = state.checkoutOrders.find((item) => item.id === input.id);

    if (!order) {
      throw new Error(`Checkout order not found for id ${input.id}`);
    }

    if (order.status !== "PENDING_CONFIRMATION") {
      throw new Error(
        `Cannot confirm checkout order ${order.id} because it is already ${order.status}.`,
      );
    }

    if (input.paymentMethod && !order.paymentMethods.includes(input.paymentMethod)) {
      throw new Error(
        `Payment method ${input.paymentMethod} is not available for checkout order ${order.id}.`,
      );
    }

    if (input.paymentMethod) {
      order.selectedPaymentMethod = input.paymentMethod;
    }

    order.status = "SUCCEEDED";
    order.updatedAt = new Date().toISOString();

    if (!state.purchaseHistory.some((entry) => entry.slug === order.appSlug)) {
      state.purchaseHistory.unshift({
        slug: order.appSlug,
        purchasedAt: "Just now",
        pricePaid: order.amountLabel,
      });
    }

    if (
      order.productType === "AUTO_RENEWING_SUBSCRIPTION" &&
      !state.activeSubscriptionSlugs.includes(order.appSlug)
    ) {
      state.activeSubscriptionSlugs.unshift(order.appSlug);
    }

    if (!state.installed.includes(order.appSlug) && !getQueuedItem(state, order.appSlug)) {
      state.queue.unshift({
        slug: order.appSlug,
        progress: 0,
        eta: "Preparing download",
      });
    }

    pushActivity(
      state,
      "Checkout completed",
      `Confirmed ${order.appSlug} with ${order.selectedPaymentMethod}.`,
    );

    return order;
  });
}

export function cancelCheckoutOrder(id: string) {
  return mutateSessionState((state) => {
    const order = state.checkoutOrders.find((item) => item.id === id);

    if (!order) {
      throw new Error(`Checkout order not found for id ${id}`);
    }

    if (order.status !== "PENDING_CONFIRMATION") {
      throw new Error(
        `Cannot cancel checkout order ${order.id} because it is already ${order.status}.`,
      );
    }

    order.status = "CANCELED";
    order.updatedAt = new Date().toISOString();
    pushActivity(state, "Checkout canceled", `Canceled checkout for ${order.appSlug}.`);

    return order;
  });
}

export function getOperationsDashboard() {
  const state = getSessionState();
  const checkoutOrders = listCheckoutOrders();
  const openAppReports = state.appReports
    .filter((report) => report.status === "OPEN")
    .map((report) => attachAppReport(state, report))
    .filter((report): report is AppReport & { app: EnrichedApp } => Boolean(report.app));
  const openDeveloperReports = state.developerReports
    .filter((report) => report.status === "OPEN")
    .map((report) => attachDeveloperReport(state, report))
    .filter(
      (report): report is DeveloperReport & { developer: NonNullable<ReturnType<typeof getDeveloperBySlugService>> } =>
        Boolean(report.developer),
    );

  return {
    summary: {
      openReports: openAppReports.length + openDeveloperReports.length,
      pendingOrders: checkoutOrders.filter((order) => order.status === "PENDING_CONFIRMATION")
        .length,
      succeededOrders: checkoutOrders.filter((order) => order.status === "SUCCEEDED")
        .length,
      activeSubscriptions: state.activeSubscriptionSlugs.length,
    },
    openAppReports,
    openDeveloperReports,
    recentOrders: checkoutOrders.slice(0, 8),
    recentActivity: structuredClone(state.activity).slice(0, 8),
  };
}

export function getDeveloperConsoleSnapshot() {
  const state = getSessionState();
  const allApps = getHydratedApps(state);
  const checkoutOrders = state.checkoutOrders;

  return getAllDevelopers().map((developer) => {
    const apps = allApps.filter((app) => app.developer.slug === developer.slug);
    const openAppReports = state.appReports.filter(
      (report) =>
        report.status === "OPEN" &&
        apps.some((app) => app.slug === report.appSlug),
    ).length;
    const openDeveloperReports = state.developerReports.filter(
      (report) => report.status === "OPEN" && report.developerSlug === developer.slug,
    ).length;
    const sales = buildDeveloperSalesSnapshot(checkoutOrders, developer.slug);

    return {
      developer,
      apps,
      monetization: {
        paidApps: apps.filter((app) => getBillingModelForApp(app.slug) === "ONE_TIME").length,
        subscriptionApps: apps.filter((app) => getBillingModelForApp(app.slug) === "SUBSCRIPTION")
          .length,
      },
      inbox: {
        openAppReports,
        openDeveloperReports,
      },
      sales,
    };
  });
}
