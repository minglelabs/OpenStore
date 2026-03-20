import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  addToWishlist,
  cancelCheckoutOrder,
  confirmCheckoutOrder,
  createCheckoutOrder,
  getCheckoutOrderById,
  getCheckoutQuoteForApp,
  getCheckoutMarkets,
  getAccountSnapshotService,
  getAppBySlugService,
  getAppDetailSections,
  getCatalogSummary,
  getCategoryBySlugService,
  getChartsSnapshot,
  getCollectionBySlugService,
  getDeveloperConsoleSnapshot,
  getDeveloperBySlugService,
  getDeveloperCatalog,
  getDeviceList,
  getDiscoverFeedSnapshot,
  getHiddenPurchases,
  getLibrarySnapshotService,
  getNotificationSettings,
  getOperationsDashboard,
  getPurchaseHistory,
  getRecentSearches,
  getSearchSnapshot,
  getSearchSuggestions,
  getSecurityControls,
  getSubscriptionApps,
  getTodayFeedSnapshot,
  getTrendingSearches,
  hidePurchase,
  listCheckoutOrders,
  listApps,
  listCategories,
  listCollections,
  listDevelopers,
  pauseDownload,
  queueInstall,
  recordRecentSearch,
  removeFromWishlist,
  reportApp,
  reportDeveloper,
  restorePurchases,
  resolveAppReport,
  resolveDeveloperReport,
  resumeDownload,
  retryDownload,
  signOutDevice,
  submitReview,
  toggleNotification,
  unhidePurchase,
  updateReview,
  getBillingDetails,
} from "@/lib/store-service";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { checkoutPlatforms, paymentMethodTypes } from "@/server/commerce/contracts/registry";

const appSlugSchema = z.object({ slug: z.string() });
const developerSlugSchema = z.object({ slug: z.string() });
const collectionSlugSchema = z.object({ slug: z.string() });
const categorySlugSchema = z.object({ slug: z.string() });
const pricingSchema = z.enum(["any", "free", "paid", "subscription"]);
const appSortSchema = z.enum(["featured", "rating", "downloads", "recent"]);
const searchSortSchema = z.enum(["relevance", "rating", "downloads", "recent"]);

function notFoundError(entity: string, slug: string): never {
  throw new TRPCError({
    code: "NOT_FOUND",
    message: `${entity} not found for slug ${slug}`,
  });
}

function requireApp(slug: string) {
  const app = getAppBySlugService(slug);

  if (!app) {
    notFoundError("App", slug);
  }

  return app;
}

function requireDeveloper(slug: string) {
  const developer = getDeveloperBySlugService(slug);

  if (!developer) {
    notFoundError("Developer", slug);
  }

  return developer;
}

function requireCollection(slug: string) {
  const collection = getCollectionBySlugService(slug);

  if (!collection) {
    notFoundError("Collection", slug);
  }

  return collection;
}

function requireCategory(slug: string) {
  const category = getCategoryBySlugService(slug);

  if (!category) {
    notFoundError("Category", slug);
  }

  return category;
}

function requireAppDetailSections(
  slug: string,
): NonNullable<ReturnType<typeof getAppDetailSections>> {
  const sections = getAppDetailSections(slug);

  if (!sections) {
    notFoundError("App", slug);
  }

  return sections;
}

const chartInputSchema = z.object({
  view: z.enum(["free", "paid", "grossing", "trending"]),
  timeframe: z.enum(["daily", "weekly", "monthly"]).default("weekly"),
  categorySlug: z.string().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

const searchInputSchema = z.object({
  query: z.string().default(""),
  categorySlug: z.string().optional(),
  pricing: pricingSchema.default("any"),
  minRating: z.number().min(0).max(5).optional(),
  sort: searchSortSchema.default("relevance"),
});

const catalogAppsInputSchema = z.object({
  categorySlug: z.string().optional(),
  developerSlug: z.string().optional(),
  status: z.enum(["installed", "update", "queued", "wishlist", "available"]).optional(),
  pricing: pricingSchema.default("any"),
  limit: z.number().int().positive().max(100).optional(),
  sort: appSortSchema.default("featured"),
  ids: z.array(z.string()).optional(),
});

const listDevelopersInputSchema = z.object({
  verifiedOnly: z.boolean().default(false),
  limit: z.number().int().positive().max(100).optional(),
});

const listCollectionsInputSchema = z.object({
  categorySlug: z.string().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

const recentSearchInputSchema = z.object({
  query: z.string().trim().min(1),
});

const appMutationInputSchema = z.object({
  slug: z.string(),
});

const notificationMutationInputSchema = z.object({
  label: z.string(),
  enabled: z.boolean().optional(),
});

const deviceMutationInputSchema = z.object({
  name: z.string(),
});

const reviewMutationInputSchema = z.object({
  appSlug: z.string(),
  author: z.string().trim().min(1),
  title: z.string().trim().min(1),
  body: z.string().trim().min(1),
  rating: z.number().int().min(1).max(5),
});

const appReportInputSchema = z.object({
  appSlug: z.string(),
  reason: z.string().trim().min(1),
  detail: z.string().trim().optional(),
});

const developerReportInputSchema = z.object({
  developerSlug: z.string(),
  reason: z.string().trim().min(1),
  detail: z.string().trim().optional(),
});

const checkoutQuoteInputSchema = z.object({
  appSlug: z.string(),
  countryCode: z.string().trim().length(2),
  currencyCode: z.string().trim().length(3),
  platform: z.enum(checkoutPlatforms),
  preferMerchantOfRecord: z.boolean().optional(),
});

const checkoutOrderIdSchema = z.object({
  id: z.string().trim().min(1),
});

const confirmCheckoutInputSchema = checkoutOrderIdSchema.extend({
  paymentMethod: z.enum(paymentMethodTypes).optional(),
});

const resolveReportInputSchema = z.object({
  id: z.string().trim().min(1),
  resolutionNote: z.string().trim().optional(),
});

const catalogRouter = createTRPCRouter({
  summary: publicProcedure.query(() => getCatalogSummary()),
  apps: publicProcedure
    .input(catalogAppsInputSchema.optional())
    .query(({ input }) => listApps(input)),
  developers: publicProcedure
    .input(listDevelopersInputSchema.optional())
    .query(({ input }) => listDevelopers(input)),
  categories: publicProcedure.query(() => listCategories()),
  collections: publicProcedure
    .input(listCollectionsInputSchema.optional())
    .query(({ input }) => listCollections(input)),
});

const todayFeedRouter = createTRPCRouter({
  hero: publicProcedure.query(() => getTodayFeedSnapshot().hero),
  spotlightApps: publicProcedure.query(() => getTodayFeedSnapshot().spotlightApps),
  collections: publicProcedure.query(() => getTodayFeedSnapshot().collections),
  releaseRadar: publicProcedure.query(() => getTodayFeedSnapshot().releaseRadar),
  safetyNotes: publicProcedure.query(() => getTodayFeedSnapshot().safetyNotes),
});

const discoverFeedRouter = createTRPCRouter({
  categories: publicProcedure.query(() => getDiscoverFeedSnapshot().categories),
  collections: publicProcedure.query(() => getDiscoverFeedSnapshot().collections),
  featuredDevelopers: publicProcedure.query(
    () => getDiscoverFeedSnapshot().featuredDevelopers,
  ),
  hiddenGems: publicProcedure.query(() => getDiscoverFeedSnapshot().hiddenGems),
  principles: publicProcedure.query(() => getDiscoverFeedSnapshot().principles),
});

const appDetailRouter = createTRPCRouter({
  sections: publicProcedure
    .input(appSlugSchema)
    .query(({ input }) => requireAppDetailSections(input.slug)),
  screenshots: publicProcedure.input(appSlugSchema).query(({ input }) => {
    return requireAppDetailSections(input.slug).screenshots;
  }),
  highlights: publicProcedure.input(appSlugSchema).query(({ input }) => {
    return requireAppDetailSections(input.slug).highlights;
  }),
  whatsNew: publicProcedure.input(appSlugSchema).query(({ input }) => {
    return requireAppDetailSections(input.slug).whatsNew;
  }),
  features: publicProcedure.input(appSlugSchema).query(({ input }) => {
    return requireAppDetailSections(input.slug).features;
  }),
  privacy: publicProcedure.input(appSlugSchema).query(({ input }) => {
    return requireAppDetailSections(input.slug).privacy;
  }),
  reviews: publicProcedure.input(appSlugSchema).query(({ input }) => {
    return requireAppDetailSections(input.slug).reviews;
  }),
  related: publicProcedure.input(appSlugSchema).query(({ input }) => {
    const sections = requireAppDetailSections(input.slug);

    return {
      relatedApps: sections.relatedApps,
      relatedCollections: sections.relatedCollections,
    };
  }),
});

const searchToolsRouter = createTRPCRouter({
  suggestions: publicProcedure
    .input(z.object({ query: z.string().default("") }))
    .query(({ input }) => getSearchSuggestions(input.query)),
  trending: publicProcedure.query(() => getTrendingSearches()),
  recent: publicProcedure.query(() => getRecentSearches()),
  recordRecent: publicProcedure
    .input(recentSearchInputSchema)
    .mutation(({ input }) => recordRecentSearch(input.query)),
});

const libraryRouter = createTRPCRouter({
  installed: publicProcedure.query(() => getLibrarySnapshotService().installed),
  updates: publicProcedure.query(() => getLibrarySnapshotService().updates),
  queue: publicProcedure.query(() => getLibrarySnapshotService().queue),
  wishlist: publicProcedure.query(() => getLibrarySnapshotService().wishlist),
  activity: publicProcedure.query(() => getLibrarySnapshotService().activity),
  purchaseHistory: publicProcedure.query(() => getPurchaseHistory()),
  hiddenPurchases: publicProcedure.query(() => getHiddenPurchases()),
  addToWishlist: publicProcedure
    .input(appMutationInputSchema)
    .mutation(({ input }) => {
      requireApp(input.slug);
      return addToWishlist(input.slug);
    }),
  removeFromWishlist: publicProcedure
    .input(appMutationInputSchema)
    .mutation(({ input }) => removeFromWishlist(input.slug)),
  queueInstall: publicProcedure
    .input(appMutationInputSchema)
    .mutation(({ input }) => {
      requireApp(input.slug);
      return queueInstall(input.slug);
    }),
  pauseDownload: publicProcedure
    .input(appMutationInputSchema)
    .mutation(({ input }) => pauseDownload(input.slug)),
  resumeDownload: publicProcedure
    .input(appMutationInputSchema)
    .mutation(({ input }) => resumeDownload(input.slug)),
  retryDownload: publicProcedure
    .input(appMutationInputSchema)
    .mutation(({ input }) => {
      requireApp(input.slug);
      return retryDownload(input.slug);
    }),
  hidePurchase: publicProcedure
    .input(appMutationInputSchema)
    .mutation(({ input }) => hidePurchase(input.slug)),
  unhidePurchase: publicProcedure
    .input(appMutationInputSchema)
    .mutation(({ input }) => unhidePurchase(input.slug)),
  restorePurchases: publicProcedure.mutation(() => restorePurchases()),
});

const accountRouter = createTRPCRouter({
  notifications: publicProcedure.query(() => getNotificationSettings()),
  devices: publicProcedure.query(() => getDeviceList()),
  billing: publicProcedure.query(() => getBillingDetails()),
  subscriptions: publicProcedure.query(() => getSubscriptionApps()),
  controls: publicProcedure.query(() => getSecurityControls()),
  toggleNotification: publicProcedure
    .input(notificationMutationInputSchema)
    .mutation(({ input }) => toggleNotification(input)),
  signOutDevice: publicProcedure
    .input(deviceMutationInputSchema)
    .mutation(({ input }) => signOutDevice(input.name)),
});

const reviewsRouter = createTRPCRouter({
  submit: publicProcedure
    .input(reviewMutationInputSchema)
    .mutation(({ input }) => {
      requireApp(input.appSlug);
      return submitReview(input);
    }),
  update: publicProcedure
    .input(reviewMutationInputSchema)
    .mutation(({ input }) => {
      requireApp(input.appSlug);
      return updateReview(input);
    }),
});

const reportsRouter = createTRPCRouter({
  app: publicProcedure
    .input(appReportInputSchema)
    .mutation(({ input }) => {
      requireApp(input.appSlug);
      return reportApp(input);
    }),
  developer: publicProcedure
    .input(developerReportInputSchema)
    .mutation(({ input }) => {
      requireDeveloper(input.developerSlug);
      return reportDeveloper(input);
    }),
});

const checkoutRouter = createTRPCRouter({
  markets: publicProcedure.query(() => getCheckoutMarkets()),
  quote: publicProcedure
    .input(checkoutQuoteInputSchema)
    .query(({ input }) => getCheckoutQuoteForApp(input)),
  orders: publicProcedure.query(() => listCheckoutOrders()),
  orderById: publicProcedure
    .input(checkoutOrderIdSchema)
    .query(({ input }) => getCheckoutOrderById(input.id)),
  create: publicProcedure
    .input(checkoutQuoteInputSchema)
    .mutation(({ input }) => createCheckoutOrder(input)),
  confirm: publicProcedure
    .input(confirmCheckoutInputSchema)
    .mutation(({ input }) =>
      confirmCheckoutOrder({
        id: input.id,
        paymentMethod: input.paymentMethod,
      }),
    ),
  cancel: publicProcedure
    .input(checkoutOrderIdSchema)
    .mutation(({ input }) => cancelCheckoutOrder(input.id)),
});

const opsRouter = createTRPCRouter({
  dashboard: publicProcedure.query(() => getOperationsDashboard()),
  resolveAppReport: publicProcedure
    .input(resolveReportInputSchema)
    .mutation(({ input }) => resolveAppReport(input.id, input.resolutionNote)),
  resolveDeveloperReport: publicProcedure
    .input(resolveReportInputSchema)
    .mutation(({ input }) => resolveDeveloperReport(input.id, input.resolutionNote)),
});

const developerConsoleRouter = createTRPCRouter({
  summary: publicProcedure.query(() => getDeveloperConsoleSnapshot()),
});

export const storeRouter = createTRPCRouter({
  today: publicProcedure.query(() => getTodayFeedSnapshot()),
  discover: publicProcedure.query(() => getDiscoverFeedSnapshot()),
  charts: publicProcedure
    .input(chartInputSchema)
    .query(({ input }) => getChartsSnapshot(input)),
  search: publicProcedure
    .input(searchInputSchema)
    .query(({ input }) => getSearchSnapshot(input)),
  library: publicProcedure.query(() => getLibrarySnapshotService()),
  account: publicProcedure.query(() => getAccountSnapshotService()),
  appBySlug: publicProcedure.input(appSlugSchema).query(({ input }) => {
    return requireApp(input.slug);
  }),
  developerBySlug: publicProcedure.input(developerSlugSchema).query(({ input }) => {
    return requireDeveloper(input.slug);
  }),
  collectionBySlug: publicProcedure
    .input(collectionSlugSchema)
    .query(({ input }) => requireCollection(input.slug)),
  categoryBySlug: publicProcedure.input(categorySlugSchema).query(({ input }) => {
    return requireCategory(input.slug);
  }),
  developerCatalog: publicProcedure
    .input(developerSlugSchema)
    .query(({ input }) => {
      const developer = getDeveloperCatalog(input.slug);

      if (!developer) {
        notFoundError("Developer", input.slug);
      }

      return developer;
    }),
  catalog: catalogRouter,
  todayFeed: todayFeedRouter,
  discoverFeed: discoverFeedRouter,
  appDetail: appDetailRouter,
  searchTools: searchToolsRouter,
  libraryTools: libraryRouter,
  accountTools: accountRouter,
  reviews: reviewsRouter,
  reports: reportsRouter,
  checkout: checkoutRouter,
  ops: opsRouter,
  developerConsole: developerConsoleRouter,
});
