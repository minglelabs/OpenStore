import { cache } from "react";

import { prisma } from "@/lib/prisma";
import { getBillingModelForApp, resolveAppPricing } from "@/lib/store-pricing";
import {
  createInitialStoreState,
  readStoreState,
  type StoreSessionState,
} from "@/lib/store-state";
import type {
  AppRecord,
  CategoryRecord,
  ChartEntrySeed,
  ChartMovementDirection,
  ChartTimeframe,
  ChartView,
  CollectionRecord,
  DeveloperRecord,
  EnrichedApp,
  EnrichedCollection,
  Gradient,
  ReviewRecord,
  ScreenshotRecord,
} from "@/lib/store-data";
import {
  getAllApps as getStaticAllApps,
  getAllCategories as getStaticAllCategories,
  getAllCollections as getStaticAllCollections,
  getAllDevelopers as getStaticAllDevelopers,
  getChartEntries,
  getChartFeatureChecklist,
  getChartPreviousOrder,
  getChartViewDefinition,
  getDiscoverFeed,
  getTodayFeed,
} from "@/lib/store-data";

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

type DeveloperMetadata = {
  founded?: string;
  focus?: string[];
};

type CategoryMetadata = {
  buyingGuide?: string[];
};

type AppMetadata = {
  gradient?: Gradient;
  updatedAtLabel?: string;
  highlights?: string[];
  features?: string[];
  whatsNew?: string[];
  permissions?: string[];
  inAppPurchases?: string[];
  screenshots?: ScreenshotRecord[];
  editorialQuote?: string;
  searchTags?: string[];
  rank?: AppRecord["rank"];
};

type CollectionMetadata = {
  theme?: Gradient;
};

type CatalogSnapshot = {
  apps: EnrichedApp[];
  appMap: Map<string, EnrichedApp>;
  developers: DeveloperRecord[];
  developerMap: Map<string, DeveloperRecord>;
  categories: CategoryRecord[];
  categoryMap: Map<string, CategoryRecord>;
  collections: EnrichedCollection[];
  collectionMap: Map<string, EnrichedCollection>;
};

const staticApps = getStaticAllApps();
const baseReviewsByApp = Object.fromEntries(
  staticApps.map((app) => [app.slug, structuredClone(app.reviews)]),
) as Record<string, ReviewRecord[]>;
const initialSessionState = createInitialStoreState(baseReviewsByApp);
const todayFeedSeed = getTodayFeed();
const discoverFeedSeed = getDiscoverFeed();

function getSessionState() {
  return readStoreState(initialSessionState);
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

function getReviewListFromState(state: StoreSessionState, appSlug: string) {
  return structuredClone(state.reviewsByApp[appSlug] ?? []);
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

function getHydratedAppOrNull(
  state: StoreSessionState,
  snapshot: CatalogSnapshot,
  slug: string,
) {
  const app = snapshot.appMap.get(slug);
  return app ? hydrateAppFromState(state, app) : null;
}

function getHydratedCollectionOrNull(
  state: StoreSessionState,
  snapshot: CatalogSnapshot,
  slug: string,
) {
  const collection = snapshot.collectionMap.get(slug);
  return collection ? hydrateCollectionFromState(state, collection) : null;
}

function getHydratedApps(state: StoreSessionState, snapshot: CatalogSnapshot) {
  return snapshot.apps.map((app) => hydrateAppFromState(state, app));
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

function listAppsFromSnapshot(
  state: StoreSessionState,
  snapshot: CatalogSnapshot,
  input?: {
    categorySlug?: string;
    developerSlug?: string;
    status?: AppStatus;
    pricing?: PricingFilter;
    limit?: number;
    sort?: AppSort;
    ids?: string[];
  },
) {
  const filtered = sortApps(
    getHydratedApps(state, snapshot).filter((app) => {
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

function listCollectionsFromSnapshot(
  state: StoreSessionState,
  snapshot: CatalogSnapshot,
  input?: { categorySlug?: string; limit?: number },
) {
  const collections = snapshot.collections
    .map((collection) => hydrateCollectionFromState(state, collection))
    .filter(
      (collection) =>
        !input?.categorySlug || collection.category?.slug === input.categorySlug,
    );

  return typeof input?.limit === "number"
    ? collections.slice(0, input.limit)
    : collections;
}

function buildChartEntries(
  state: StoreSessionState,
  snapshot: CatalogSnapshot,
  seeds: ChartEntrySeed[],
  previousOrder: string[],
  categorySlug?: string,
): ChartEntry[] {
  const hydrated = seeds
    .map((seed) => {
      const app = getHydratedAppOrNull(state, snapshot, seed.slug);

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

  const previousCategoryRankBySlug = categorySlug
    ? new Map(
        previousOrder
          .map((slug) => getHydratedAppOrNull(state, snapshot, slug))
          .filter((app): app is EnrichedApp => Boolean(app))
          .filter((app) => app.category.slug === categorySlug)
          .map((app, index) => [app.slug, index + 1]),
      )
    : null;

  return hydrated.map(({ app, seed }, index) => {
    const rank = categorySlug ? index + 1 : seed.rank;
    const previousRank = categorySlug
      ? (previousCategoryRankBySlug?.get(app.slug) ?? null)
      : seed.previousRank;
    const movement = previousRank === null ? 0 : Math.abs(previousRank - rank);

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

function searchSnapshot(snapshot: CatalogSnapshot, query: string) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return {
      apps: [],
      developers: [],
      categories: [],
    };
  }

  return {
    apps: snapshot.apps.filter((app) => {
      const haystack = [
        app.name,
        app.tagline,
        app.summary,
        app.developer.name,
        app.category.name,
        ...app.searchTags,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalized);
    }),
    developers: snapshot.developers.filter((developer) =>
      [developer.name, developer.headline, developer.description, ...developer.focus]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    ),
    categories: snapshot.categories.filter((category) =>
      [category.name, category.summary, ...category.buyingGuide]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    ),
  };
}

function buildStaticCatalogSnapshot(): CatalogSnapshot {
  const apps = getStaticAllApps();
  const developers = getStaticAllDevelopers();
  const categories = getStaticAllCategories();
  const collections = getStaticAllCollections();

  return {
    apps,
    appMap: new Map(apps.map((app) => [app.slug, app])),
    developers,
    developerMap: new Map(developers.map((developer) => [developer.slug, developer])),
    categories,
    categoryMap: new Map(categories.map((category) => [category.slug, category])),
    collections,
    collectionMap: new Map(collections.map((collection) => [collection.slug, collection])),
  };
}

function formatRelativeDateLabel(value: Date) {
  const now = Date.now();
  const diff = now - value.getTime();
  const minute = 60 * 1000;
  const day = 24 * 60 * 60 * 1000;
  const week = 7 * day;

  if (diff < minute) {
    return "Just now";
  }

  if (diff < day) {
    const minutes = Math.max(1, Math.round(diff / minute));
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  if (diff < week) {
    const days = Math.max(1, Math.round(diff / day));
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  const weeks = Math.max(1, Math.round(diff / week));
  return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
}

function getFallbackGradient(): Gradient {
  return {
    from: "#0f1f46",
    to: "#68c6ff",
    accent: "#dff5ff",
  };
}

const loadDatabaseCatalogSnapshot = cache(async (): Promise<CatalogSnapshot | null> => {
  const [developersRaw, categoriesRaw, appsRaw, collectionsRaw] = await Promise.all([
    prisma.developer.findMany({
      orderBy: { createdAt: "asc" },
    }),
    prisma.category.findMany({
      orderBy: { createdAt: "asc" },
    }),
    prisma.app.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        versions: {
          orderBy: { releasedAt: "desc" },
        },
        reviews: {
          orderBy: { submittedAt: "desc" },
          include: {
            user: true,
          },
        },
      },
    }),
    prisma.collection.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        items: {
          orderBy: { position: "asc" },
        },
      },
    }),
  ]);

  if (
    developersRaw.length === 0 ||
    categoriesRaw.length === 0 ||
    appsRaw.length === 0
  ) {
    return null;
  }

  const developers = developersRaw.map((developer) => {
    const metadata = (developer.metadata ?? {}) as DeveloperMetadata;

    return {
      slug: developer.slug,
      name: developer.name,
      headline: developer.headline,
      description: developer.description,
      verified: developer.verified,
      region: developer.region,
      founded: metadata.founded ?? "Unknown",
      focus: metadata.focus ?? [],
    } satisfies DeveloperRecord;
  });
  const categories = categoriesRaw.map((category) => {
    const metadata = (category.metadata ?? {}) as CategoryMetadata;

    return {
      slug: category.slug,
      name: category.name,
      summary: category.summary,
      buyingGuide: metadata.buyingGuide ?? [],
    } satisfies CategoryRecord;
  });
  const developerMap = new Map(developers.map((developer) => [developer.slug, developer]));
  const developerById = new Map(developersRaw.map((developer) => [developer.id, developer.slug]));
  const categoryMap = new Map(categories.map((category) => [category.slug, category]));
  const categoryById = new Map(categoriesRaw.map((category) => [category.id, category.slug]));

  const apps = appsRaw
    .map((app) => {
      const metadata = (app.metadata ?? {}) as AppMetadata;
      const developerSlug = developerById.get(app.developerId);
      const categorySlug = categoryById.get(app.categoryId);

      if (!developerSlug || !categorySlug) {
        return null;
      }

      const developer = developerMap.get(developerSlug);
      const category = categoryMap.get(categorySlug);

      if (!developer || !category) {
        return null;
      }

      const latestVersion = app.versions[0];
      const reviews = app.reviews.map((review) => ({
        appSlug: app.slug,
        author: review.user.name,
        title: review.title,
        body: review.body,
        rating: review.rating,
        submittedAt: formatRelativeDateLabel(review.submittedAt),
      })) satisfies ReviewRecord[];
      const record: AppRecord = {
        slug: app.slug,
        name: app.name,
        tagline: app.tagline,
        summary: app.summary,
        description: app.description,
        priceLabel: app.priceLabel,
        rating: app.ratingAverage,
        ratingCount: app.ratingCount,
        downloadCount: app.downloadCount,
        ageRating: app.ageRating,
        size: app.sizeLabel,
        version: latestVersion?.version ?? "1.0.0",
        updatedAt:
          metadata.updatedAtLabel ??
          (latestVersion
            ? latestVersion.releasedAt.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })
            : "Unknown"),
        developerSlug,
        categorySlug,
        gradient: metadata.gradient ?? getFallbackGradient(),
        status: "available",
        highlights: metadata.highlights ?? [],
        features: metadata.features ?? [],
        whatsNew:
          metadata.whatsNew ??
          latestVersion?.releaseNotes.split("\n").filter(Boolean) ??
          [],
        permissions: metadata.permissions ?? [],
        inAppPurchases: metadata.inAppPurchases ?? [],
        screenshots: metadata.screenshots ?? [],
        editorialQuote: metadata.editorialQuote ?? "",
        searchTags: metadata.searchTags ?? [],
        rank: metadata.rank ?? {},
      };

      return {
        ...record,
        developer,
        category,
        reviews,
      } satisfies EnrichedApp;
    })
    .filter((app): app is EnrichedApp => Boolean(app));

  const appMap = new Map(apps.map((app) => [app.slug, app]));
  const appById = new Map(appsRaw.map((app) => [app.id, app.slug]));
  const collections = collectionsRaw.map((collection) => {
    const metadata = (collection.metadata ?? {}) as CollectionMetadata;
    const categorySlug = collection.categoryId ? categoryById.get(collection.categoryId) : null;
    const collectionCategory = categorySlug ? categoryMap.get(categorySlug) : undefined;
    const collectionApps = collection.items
      .map((item) => appById.get(item.appId))
      .filter((slug): slug is string => Boolean(slug))
      .map((slug) => appMap.get(slug))
      .filter((app): app is EnrichedApp => Boolean(app));
    const record: CollectionRecord = {
      slug: collection.slug,
      name: collection.name,
      description: collection.description,
      curator: collection.curator,
      appSlugs: collectionApps.map((app) => app.slug),
      categorySlug: collectionCategory?.slug,
      theme: metadata.theme ?? getFallbackGradient(),
    };

    return {
      ...record,
      apps: collectionApps,
      category: collectionCategory,
    } satisfies EnrichedCollection;
  });

  return {
    apps,
    appMap,
    developers,
    developerMap,
    categories,
    categoryMap,
    collections,
    collectionMap: new Map(collections.map((collection) => [collection.slug, collection])),
  };
});

const staticCatalogSnapshot = buildStaticCatalogSnapshot();

async function getCatalogSnapshot() {
  return (await loadDatabaseCatalogSnapshot()) ?? staticCatalogSnapshot;
}

export async function getCatalogSummary() {
  const snapshot = await getCatalogSnapshot();

  return {
    appCount: snapshot.apps.length,
    developerCount: snapshot.developers.length,
    categoryCount: snapshot.categories.length,
    collectionCount: snapshot.collections.length,
  };
}

export async function listApps(input?: {
  categorySlug?: string;
  developerSlug?: string;
  status?: AppStatus;
  pricing?: PricingFilter;
  limit?: number;
  sort?: AppSort;
  ids?: string[];
}) {
  const snapshot = await getCatalogSnapshot();
  return listAppsFromSnapshot(getSessionState(), snapshot, input);
}

export async function listDevelopers(input?: {
  verifiedOnly?: boolean;
  limit?: number;
}) {
  const snapshot = await getCatalogSnapshot();
  const developers = snapshot.developers.filter(
    (developer) => !input?.verifiedOnly || developer.verified,
  );

  return typeof input?.limit === "number"
    ? developers.slice(0, input.limit)
    : developers;
}

export async function listCategories() {
  return (await getCatalogSnapshot()).categories;
}

export async function listCollections(input?: {
  categorySlug?: string;
  limit?: number;
}) {
  const snapshot = await getCatalogSnapshot();
  return listCollectionsFromSnapshot(getSessionState(), snapshot, input);
}

export async function getTodayFeedSnapshot() {
  const snapshot = await getCatalogSnapshot();
  const state = getSessionState();

  return {
    hero: todayFeedSeed.hero
      ? getHydratedAppOrNull(state, snapshot, todayFeedSeed.hero.slug)
      : null,
    spotlightApps: todayFeedSeed.spotlightApps
      .map((app) => getHydratedAppOrNull(state, snapshot, app.slug))
      .filter((app): app is EnrichedApp => Boolean(app)),
    collections: todayFeedSeed.collections
      .map((collection) => getHydratedCollectionOrNull(state, snapshot, collection.slug))
      .filter((collection): collection is EnrichedCollection => Boolean(collection)),
    releaseRadar: todayFeedSeed.releaseRadar
      .map((app) => getHydratedAppOrNull(state, snapshot, app.slug))
      .filter((app): app is EnrichedApp => Boolean(app)),
    safetyNotes: structuredClone(todayFeedSeed.safetyNotes),
  };
}

export async function getDiscoverFeedSnapshot() {
  const snapshot = await getCatalogSnapshot();
  const state = getSessionState();

  return {
    categories: snapshot.categories,
    collections: snapshot.collections.map((collection) =>
      hydrateCollectionFromState(state, collection),
    ),
    featuredDevelopers: snapshot.developers.filter((developer) => developer.verified).slice(0, 4),
    hiddenGems: discoverFeedSeed.hiddenGems
      .map((app) => getHydratedAppOrNull(state, snapshot, app.slug))
      .filter((app): app is EnrichedApp => Boolean(app)),
    principles: structuredClone(discoverFeedSeed.principles),
  };
}

export async function getChartsSnapshot(input: {
  view: ChartView;
  timeframe: ChartTimeframe;
  categorySlug?: string;
  limit?: number;
}): Promise<ChartsSnapshot> {
  const snapshot = await getCatalogSnapshot();
  const state = getSessionState();
  const definition = getChartViewDefinition(input.view);
  const category = input.categorySlug
    ? snapshot.categoryMap.get(input.categorySlug) ?? null
    : null;
  const entries = buildChartEntries(
    state,
    snapshot,
    getChartEntries(input.view, input.timeframe),
    getChartPreviousOrder(input.view, input.timeframe),
    input.categorySlug,
  );
  const limitedEntries =
    typeof input.limit === "number" ? entries.slice(0, input.limit) : entries;
  const biggestMover =
    entries
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
      editorialOverrides: entries.filter((entry) => entry.editorialBadge).length,
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

export async function getSearchSnapshot(input: {
  query: string;
  categorySlug?: string;
  pricing?: PricingFilter;
  minRating?: number;
  sort?: SearchSort;
}) {
  const snapshot = await getCatalogSnapshot();
  const state = getSessionState();
  const result = searchSnapshot(snapshot, input.query);
  let apps = result.apps
    .map((app) => getHydratedAppOrNull(state, snapshot, app.slug))
    .filter((app): app is EnrichedApp => Boolean(app))
    .filter((app) => {
      if (input.categorySlug && app.category.slug !== input.categorySlug) {
        return false;
      }

      if (!matchesPricingFilter(app.slug, input.pricing ?? "any")) {
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

export async function getSearchSuggestions(query: string) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return [];
  }

  const snapshot = await getCatalogSnapshot();
  const state = getSessionState();
  const suggestions = [
    ...getHydratedApps(state, snapshot).map((app) => app.name),
    ...snapshot.developers.map((developer) => developer.name),
    ...snapshot.categories.map((category) => category.name),
  ].filter((value) => value.toLowerCase().includes(normalized));

  return [...new Set(suggestions)].slice(0, 8);
}

export async function getAppBySlugService(slug: string) {
  const snapshot = await getCatalogSnapshot();
  const app = snapshot.appMap.get(slug);
  return app ? hydrateAppFromState(getSessionState(), app) : null;
}

export async function getDeveloperBySlugService(slug: string) {
  const snapshot = await getCatalogSnapshot();
  const developer = snapshot.developerMap.get(slug);

  if (!developer) {
    return null;
  }

  const state = getSessionState();

  return {
    ...developer,
    apps: snapshot.apps
      .filter((app) => app.developer.slug === slug)
      .map((app) => hydrateAppFromState(state, app)),
  };
}

export async function getCollectionBySlugService(slug: string) {
  const snapshot = await getCatalogSnapshot();
  const collection = snapshot.collectionMap.get(slug);
  return collection ? hydrateCollectionFromState(getSessionState(), collection) : null;
}

export async function getCategoryBySlugService(slug: string) {
  const snapshot = await getCatalogSnapshot();
  const category = snapshot.categoryMap.get(slug);

  if (!category) {
    return null;
  }

  const state = getSessionState();

  return {
    ...category,
    apps: snapshot.apps
      .filter((app) => app.category.slug === slug)
      .map((app) => hydrateAppFromState(state, app)),
  };
}

export async function getDeveloperCatalog(slug: string) {
  const developer = await getDeveloperBySlugService(slug);

  if (!developer) {
    return null;
  }

  return {
    ...developer,
    relatedCategories: [...new Set(developer.apps.map((app) => app.category.name))],
  };
}

export async function getAppDetailSections(appSlug: string) {
  const snapshot = await getCatalogSnapshot();
  const state = getSessionState();
  const app = getHydratedAppOrNull(state, snapshot, appSlug);

  if (!app) {
    return null;
  }

  const relatedApps = listAppsFromSnapshot(state, snapshot, {
    categorySlug: app.category.slug,
    sort: "rating",
  })
    .filter((item) => item.slug !== app.slug)
    .slice(0, 4);
  const relatedCollections = listCollectionsFromSnapshot(state, snapshot).filter((collection) =>
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

export async function getCheckoutQuoteForApp(input: {
  appSlug: string;
  countryCode: string;
  currencyCode: string;
  platform: "WEB" | "IOS" | "ANDROID";
  preferMerchantOfRecord?: boolean;
}) {
  const app = await getAppBySlugService(input.appSlug);

  if (!app) {
    throw new Error(`App not found for slug ${input.appSlug}`);
  }

  if (getBillingModelForApp(app.slug) === "FREE") {
    throw new Error(`App ${app.slug} does not require checkout.`);
  }

  const pricing = resolveAppPricing(app.slug, input.currencyCode);

  if (!pricing) {
    throw new Error(`Canonical pricing is missing for app ${app.slug}`);
  }

  return {
    app,
    amountValue: pricing.amountValue,
    amountLabel: pricing.amountLabel,
  };
}
