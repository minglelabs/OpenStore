import { randomUUID } from "node:crypto";

import type {
  ActivityItem,
  DeviceRecord,
  EnrichedApp,
  EnrichedCollection,
  NotificationPreference,
  ReviewRecord,
} from "@/lib/store-data";
import {
  getAccountSnapshot,
  getAllApps,
  getAllCategories,
  getChartEntries,
  getChartFeatureChecklist,
  getChartViewDefinition,
  getAllCollections,
  getAllDevelopers,
  getAppBySlug,
  getCategoryBySlug,
  getCollectionBySlug,
  getDeveloperBySlug,
  getDiscoverFeed,
  getLibrarySnapshot,
  getTodayFeed,
  searchStore,
  type ChartMovementDirection,
  type ChartEntrySeed,
  type ChartTimeframe,
  type ChartView,
} from "@/lib/store-data";
import { averageProgress } from "@/lib/utils";

export type AppStatus = EnrichedApp["status"];
export type PricingFilter = "any" | "free" | "paid" | "subscription";
export type AppSort = "featured" | "rating" | "downloads" | "recent";
export type SearchSort = "relevance" | "rating" | "downloads" | "recent";
export type ChartEntry = {
  app: EnrichedApp;
  rank: number;
  previousRank: number | null;
  movement: number;
  movementDirection: ChartMovementDirection;
  highlight: string;
  editorialBadge?: string;
  editorialReason?: string;
};

export type ChartsSnapshot = {
  view: ChartView;
  timeframe: ChartTimeframe;
  label: string;
  title: string;
  description: string;
  updatedAt: string;
  rankingHealth: string;
  methodology: string[];
  featureChecklist: string[];
  stats: {
    totalApps: number;
    editorialOverrides: number;
    categoryLabel: string | null;
    biggestMover:
      | {
          slug: string;
          name: string;
          movement: number;
          direction: ChartMovementDirection;
        }
      | null;
  };
  entries: ChartEntry[];
};

export type QueueRuntimeItem = {
  slug: string;
  progress: number;
  eta: string;
  paused?: boolean;
};

export type PurchaseHistoryEntry = {
  slug: string;
  purchasedAt: string;
  pricePaid: string;
};

export type HiddenPurchaseEntry = {
  slug: string;
  hiddenAt: string;
};

export type AppReport = {
  id: string;
  appSlug: string;
  reason: string;
  detail?: string;
  submittedAt: string;
};

export type DeveloperReport = {
  id: string;
  developerSlug: string;
  reason: string;
  detail?: string;
  submittedAt: string;
};

type SessionState = {
  installed: string[];
  updates: QueueRuntimeItem[];
  queue: QueueRuntimeItem[];
  wishlist: string[];
  activity: ActivityItem[];
  notifications: NotificationPreference[];
  devices: DeviceRecord[];
  purchaseHistory: PurchaseHistoryEntry[];
  hiddenPurchases: HiddenPurchaseEntry[];
  recentSearches: string[];
  reviewsByApp: Record<string, ReviewRecord[]>;
  appReports: AppReport[];
  developerReports: DeveloperReport[];
};

const baseLibrarySnapshot = getLibrarySnapshot();
const baseAccountSnapshot = getAccountSnapshot();
const baseRecentSearches = ["privacy", "sleep", "remote work", "music", "ai"];
const basePurchaseHistory: PurchaseHistoryEntry[] = [
  {
    slug: "arcade-lane",
    purchasedAt: "February 4, 2026",
    pricePaid: "$3.99",
  },
  {
    slug: "patchboard",
    purchasedAt: "January 28, 2026",
    pricePaid: "$6.99",
  },
  {
    slug: "studio-cast",
    purchasedAt: "January 12, 2026",
    pricePaid: "$8.99",
  },
];
const baseHiddenPurchases: HiddenPurchaseEntry[] = [
  {
    slug: "studio-cast",
    hiddenAt: "February 20, 2026",
  },
];
const baseReviewsByApp = Object.fromEntries(
  getAllApps().map((app) => [app.slug, structuredClone(app.reviews)]),
) as Record<string, ReviewRecord[]>;

function createInitialSessionState(): SessionState {
  return structuredClone({
    installed: baseLibrarySnapshot.installed.map((app) => app.slug),
    updates: baseLibrarySnapshot.updates.map((item) => ({
      slug: item.slug,
      progress: item.progress,
      eta: item.eta,
    })),
    queue: baseLibrarySnapshot.queue.map((item) => ({
      slug: item.slug,
      progress: item.progress,
      eta: item.eta,
    })),
    wishlist: baseLibrarySnapshot.wishlist.map((app) => app.slug),
    activity: baseLibrarySnapshot.activity,
    notifications: baseAccountSnapshot.notifications,
    devices: baseAccountSnapshot.devices,
    purchaseHistory: basePurchaseHistory,
    hiddenPurchases: baseHiddenPurchases,
    recentSearches: baseRecentSearches,
    reviewsByApp: baseReviewsByApp,
    appReports: [],
    developerReports: [],
  });
}

let sessionState = createInitialSessionState();

function getReviewList(appSlug: string) {
  return structuredClone(sessionState.reviewsByApp[appSlug] ?? []);
}

function resolveAppStatus(appSlug: string): AppStatus {
  if (sessionState.updates.some((item) => item.slug === appSlug)) {
    return "update";
  }

  if (sessionState.queue.some((item) => item.slug === appSlug)) {
    return "queued";
  }

  if (sessionState.installed.includes(appSlug)) {
    return "installed";
  }

  if (sessionState.wishlist.includes(appSlug)) {
    return "wishlist";
  }

  return "available";
}

function hydrateApp(app: EnrichedApp): EnrichedApp {
  return {
    ...app,
    status: resolveAppStatus(app.slug),
    reviews: getReviewList(app.slug),
  };
}

function hydrateCollection(collection: EnrichedCollection): EnrichedCollection {
  return {
    ...collection,
    apps: collection.apps.map(hydrateApp),
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

function matchesPricingFilter(priceLabel: string, pricing: PricingFilter) {
  switch (pricing) {
    case "free":
      return priceLabel === "Free";
    case "paid":
      return priceLabel.startsWith("$");
    case "subscription":
      return !priceLabel.startsWith("$") && priceLabel !== "Free";
    default:
      return true;
  }
}

function pushActivity(title: string, detail: string, timestamp = "Just now") {
  sessionState.activity.unshift({ title, detail, timestamp });
  sessionState.activity = sessionState.activity.slice(0, 12);
}

function getQueuedItem(slug: string) {
  return sessionState.queue.find((item) => item.slug === slug);
}

function getUpdateItem(slug: string) {
  return sessionState.updates.find((item) => item.slug === slug);
}

function getHydratedAppOrNull(slug: string) {
  const app = getAppBySlug(slug);
  return app ? hydrateApp(app) : null;
}

function getHydratedApps() {
  return getAllApps().map(hydrateApp);
}

function getChartMovementDirection(
  currentRank: number,
  previousRank: number | null,
): ChartMovementDirection {
  if (previousRank === null) {
    return "new";
  }

  if (previousRank > currentRank) {
    return "up";
  }

  if (previousRank < currentRank) {
    return "down";
  }

  return "flat";
}

function buildChartEntries(
  seeds: ChartEntrySeed[],
  categorySlug?: string,
): ChartEntry[] {
  const hydrated = seeds
    .map((seed) => {
      const app = getHydratedAppOrNull(seed.slug);

      if (!app) {
        return null;
      }

      return {
        app,
        seed,
      };
    })
    .filter(
      (
        entry,
      ): entry is {
        app: EnrichedApp;
        seed: ChartEntrySeed;
      } => Boolean(entry),
    )
    .filter((entry) => !categorySlug || entry.app.category.slug === categorySlug)
    .sort((left, right) => left.seed.rank - right.seed.rank);

  const previousRankBySlug = new Map(
    hydrated
      .filter((entry) => entry.seed.previousRank !== null)
      .sort(
        (left, right) =>
          (left.seed.previousRank ?? Number.POSITIVE_INFINITY) -
          (right.seed.previousRank ?? Number.POSITIVE_INFINITY),
      )
      .map((entry, index) => [entry.app.slug, index + 1]),
  );

  return hydrated.map(({ app, seed }, index) => {
    const rank = categorySlug ? index + 1 : seed.rank;
    const previousRank = categorySlug
      ? (previousRankBySlug.get(app.slug) ?? null)
      : seed.previousRank;
    const movement =
      previousRank === null ? 0 : Math.abs(previousRank - rank);

    return {
      app,
      rank,
      previousRank,
      movement,
      movementDirection: getChartMovementDirection(rank, previousRank),
      highlight: seed.highlight,
      editorialBadge: seed.editorialBadge,
      editorialReason: seed.editorialReason,
    };
  });
}

export function resetStoreServiceState() {
  sessionState = createInitialSessionState();
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
  const filtered = sortApps(
    getHydratedApps().filter((app) => {
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

      if (!matchesPricingFilter(app.priceLabel, input?.pricing ?? "any")) {
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
  const collections = getAllCollections()
    .map(hydrateCollection)
    .filter(
      (collection) =>
        !input?.categorySlug || collection.category?.slug === input.categorySlug,
    );

  return typeof input?.limit === "number"
    ? collections.slice(0, input.limit)
    : collections;
}

export function getTodayFeedSnapshot() {
  const feed = getTodayFeed();

  return {
    ...feed,
    hero: feed.hero ? hydrateApp(feed.hero) : null,
    spotlightApps: feed.spotlightApps.map(hydrateApp),
    collections: feed.collections.map(hydrateCollection),
    releaseRadar: feed.releaseRadar.map(hydrateApp),
  };
}

export function getDiscoverFeedSnapshot() {
  const feed = getDiscoverFeed();

  return {
    ...feed,
    collections: feed.collections.map(hydrateCollection),
    hiddenGems: feed.hiddenGems.map(hydrateApp),
  };
}

export function getChartsSnapshot(input: {
  view: ChartView;
  timeframe: ChartTimeframe;
  categorySlug?: string;
  limit?: number;
}): ChartsSnapshot {
  const definition = getChartViewDefinition(input.view);
  const category = input.categorySlug
    ? getCategoryBySlug(input.categorySlug)
    : null;
  const entries = buildChartEntries(
    getChartEntries(input.view, input.timeframe),
    input.categorySlug,
  );
  const limitedEntries =
    typeof input.limit === "number" ? entries.slice(0, input.limit) : entries;
  const biggestMover =
    limitedEntries
      .filter((entry) => entry.movementDirection === "up" && entry.movement > 0)
      .sort((left, right) => right.movement - left.movement)[0] ?? null;

  return {
    view: input.view,
    timeframe: input.timeframe,
    label: definition.label,
    title: definition.title,
    description: definition.description,
    updatedAt: definition.updatedAt[input.timeframe],
    rankingHealth: definition.rankingHealth,
    methodology: definition.methodology,
    featureChecklist: getChartFeatureChecklist(),
    stats: {
      totalApps: entries.length,
      editorialOverrides: limitedEntries.filter((entry) => entry.editorialBadge).length,
      categoryLabel: category?.name ?? null,
      biggestMover: biggestMover
        ? {
            slug: biggestMover.app.slug,
            name: biggestMover.app.name,
            movement: biggestMover.movement,
            direction: biggestMover.movementDirection,
          }
        : null,
    },
    entries: limitedEntries,
  };
}

export function getSearchSnapshot(input: {
  query: string;
  categorySlug?: string;
  pricing?: PricingFilter;
  minRating?: number;
  sort?: SearchSort;
}) {
  const result = searchStore(input.query);
  let apps = result.apps
    .map((app) => getHydratedAppOrNull(app.slug))
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

  const suggestions = [
    ...getHydratedApps().map((app) => app.name),
    ...getAllDevelopers().map((developer) => developer.name),
    ...getAllCategories().map((category) => category.name),
  ].filter((value) => value.toLowerCase().includes(normalized));

  return [...new Set(suggestions)].slice(0, 8);
}

export function getTrendingSearches() {
  return baseRecentSearches;
}

export function getRecentSearches() {
  return structuredClone(sessionState.recentSearches);
}

export function recordRecentSearch(query: string) {
  const normalized = query.trim();

  if (!normalized) {
    return getRecentSearches();
  }

  sessionState.recentSearches = [
    normalized,
    ...sessionState.recentSearches.filter((item) => item !== normalized),
  ].slice(0, 8);

  return getRecentSearches();
}

export function getLibrarySnapshotService() {
  const installed = sessionState.installed
    .map((slug) => getHydratedAppOrNull(slug))
    .filter((app): app is EnrichedApp => Boolean(app));
  const updates = sessionState.updates
    .map((item) => ({
      ...item,
      app: getHydratedAppOrNull(item.slug),
    }))
    .filter((item): item is QueueRuntimeItem & { app: EnrichedApp } => Boolean(item.app));
  const queue = sessionState.queue
    .map((item) => ({
      ...item,
      app: getHydratedAppOrNull(item.slug),
    }))
    .filter((item): item is QueueRuntimeItem & { app: EnrichedApp } => Boolean(item.app));
  const wishlist = sessionState.wishlist
    .map((slug) => getHydratedAppOrNull(slug))
    .filter((app): app is EnrichedApp => Boolean(app));

  return {
    installed,
    updates,
    queue,
    wishlist,
    activity: structuredClone(sessionState.activity),
    queueAverage: averageProgress(queue.map((item) => item.progress)),
  };
}

export function getPurchaseHistory() {
  return sessionState.purchaseHistory
    .map((entry) => ({
      ...entry,
      app: getHydratedAppOrNull(entry.slug),
      hidden: sessionState.hiddenPurchases.some((item) => item.slug === entry.slug),
    }))
    .filter((entry): entry is PurchaseHistoryEntry & { app: EnrichedApp; hidden: boolean } =>
      Boolean(entry.app),
    );
}

export function getHiddenPurchases() {
  return sessionState.hiddenPurchases
    .map((entry) => ({
      ...entry,
      app: getHydratedAppOrNull(entry.slug),
    }))
    .filter((entry): entry is HiddenPurchaseEntry & { app: EnrichedApp } => Boolean(entry.app));
}

export function addToWishlist(appSlug: string) {
  if (!sessionState.wishlist.includes(appSlug)) {
    sessionState.wishlist.unshift(appSlug);
    pushActivity("App saved to wishlist", `Saved ${appSlug} for later review.`);
  }

  return getLibrarySnapshotService();
}

export function removeFromWishlist(appSlug: string) {
  sessionState.wishlist = sessionState.wishlist.filter((slug) => slug !== appSlug);
  pushActivity("Wishlist updated", `Removed ${appSlug} from the wishlist.`);

  return getLibrarySnapshotService();
}

export function queueInstall(appSlug: string) {
  if (!getQueuedItem(appSlug) && !getUpdateItem(appSlug)) {
    sessionState.queue.unshift({
      slug: appSlug,
      progress: 0,
      eta: "Waiting for download slot",
    });
    sessionState.wishlist = sessionState.wishlist.filter((slug) => slug !== appSlug);
    pushActivity("Download queued", `Queued ${appSlug} for installation.`);
  }

  return getLibrarySnapshotService();
}

export function pauseDownload(appSlug: string) {
  const item = getQueuedItem(appSlug) ?? getUpdateItem(appSlug);

  if (item) {
    item.paused = true;
    item.eta = "Paused";
    pushActivity("Download paused", `Paused ${appSlug} in the transfer queue.`);
  }

  return getLibrarySnapshotService();
}

export function resumeDownload(appSlug: string) {
  const item = getQueuedItem(appSlug) ?? getUpdateItem(appSlug);

  if (item) {
    item.paused = false;
    item.eta = item.progress > 0 ? `${Math.max(1, 10 - Math.floor(item.progress / 10))} min left` : "Preparing download";
    pushActivity("Download resumed", `Resumed ${appSlug} in the transfer queue.`);
  }

  return getLibrarySnapshotService();
}

export function retryDownload(appSlug: string) {
  const item = getQueuedItem(appSlug) ?? getUpdateItem(appSlug);

  if (item) {
    item.paused = false;
    item.progress = Math.min(item.progress, 5);
    item.eta = "Retrying download";
  } else {
    sessionState.queue.unshift({
      slug: appSlug,
      progress: 5,
      eta: "Retrying download",
    });
  }

  pushActivity("Download retry started", `Retry requested for ${appSlug}.`);

  return getLibrarySnapshotService();
}

export function hidePurchase(appSlug: string) {
  if (!sessionState.hiddenPurchases.some((item) => item.slug === appSlug)) {
    sessionState.hiddenPurchases.unshift({
      slug: appSlug,
      hiddenAt: "Just now",
    });
  }

  return getHiddenPurchases();
}

export function unhidePurchase(appSlug: string) {
  sessionState.hiddenPurchases = sessionState.hiddenPurchases.filter(
    (item) => item.slug !== appSlug,
  );

  return getHiddenPurchases();
}

export function restorePurchases() {
  const restored = getPurchaseHistory().filter((entry) => !entry.hidden);
  pushActivity(
    "Purchases restored",
    `Restored ${restored.length} purchase records to the current session.`,
  );

  return {
    restored,
    restoredCount: restored.length,
  };
}

export function getAccountSnapshotService() {
  return {
    ...baseAccountSnapshot,
    notifications: structuredClone(sessionState.notifications),
    devices: structuredClone(sessionState.devices),
    activeSubscriptions: baseAccountSnapshot.activeSubscriptions.map(hydrateApp),
  };
}

export function getNotificationSettings() {
  return structuredClone(sessionState.notifications);
}

export function getDeviceList() {
  return structuredClone(sessionState.devices);
}

export function getBillingDetails() {
  return structuredClone(baseAccountSnapshot.billing);
}

export function getSubscriptionApps() {
  return baseAccountSnapshot.activeSubscriptions.map(hydrateApp);
}

export function getSecurityControls() {
  return structuredClone(baseAccountSnapshot.controls);
}

export function toggleNotification(input: {
  label: string;
  enabled?: boolean;
}) {
  sessionState.notifications = sessionState.notifications.map((notification) => {
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

  return getNotificationSettings();
}

export function signOutDevice(name: string) {
  sessionState.devices = sessionState.devices.filter((device) => device.name !== name);
  pushActivity("Device signed out", `Removed ${name} from the trusted device list.`);

  return getDeviceList();
}

export function getAppDetailSections(appSlug: string) {
  const app = getHydratedAppOrNull(appSlug);

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
    reviews: getReviewList(app.slug),
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
  const nextReview: ReviewRecord = {
    appSlug: input.appSlug,
    author: input.author,
    title: input.title,
    body: input.body,
    rating: input.rating,
    submittedAt: "Just now",
  };

  const reviews = sessionState.reviewsByApp[input.appSlug] ?? [];
  const existingIndex = reviews.findIndex((review) => review.author === input.author);

  if (existingIndex >= 0) {
    reviews.splice(existingIndex, 1, nextReview);
  } else {
    reviews.unshift(nextReview);
  }

  sessionState.reviewsByApp[input.appSlug] = reviews;

  return getReviewList(input.appSlug);
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
  const report: AppReport = {
    id: `app-report-${randomUUID()}`,
    appSlug: input.appSlug,
    reason: input.reason,
    detail: input.detail,
    submittedAt: new Date().toISOString(),
  };

  sessionState.appReports.unshift(report);

  return report;
}

export function reportDeveloper(input: {
  developerSlug: string;
  reason: string;
  detail?: string;
}) {
  const report: DeveloperReport = {
    id: `developer-report-${randomUUID()}`,
    developerSlug: input.developerSlug,
    reason: input.reason,
    detail: input.detail,
    submittedAt: new Date().toISOString(),
  };

  sessionState.developerReports.unshift(report);

  return report;
}

export function getAppBySlugService(slug: string) {
  const app = getAppBySlug(slug);
  return app ? hydrateApp(app) : null;
}

export function getDeveloperBySlugService(slug: string) {
  const developer = getDeveloperBySlug(slug);

  if (!developer) {
    return null;
  }

  return {
    ...developer,
    apps: developer.apps.map(hydrateApp),
  };
}

export function getCollectionBySlugService(slug: string) {
  const collection = getCollectionBySlug(slug);
  return collection ? hydrateCollection(collection) : null;
}

export function getCategoryBySlugService(slug: string) {
  const category = getCategoryBySlug(slug);

  if (!category) {
    return null;
  }

  return {
    ...category,
    apps: category.apps.map(hydrateApp),
  };
}

export function getDeveloperCatalog(slug: string) {
  const developer = getDeveloperBySlugService(slug);

  if (!developer) {
    return null;
  }

  return {
    ...developer,
    relatedCategories: [
      ...new Set(developer.apps.map((app) => app.category.name)),
    ],
  };
}
