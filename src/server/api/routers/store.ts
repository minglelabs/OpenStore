import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  getAccountSnapshot,
  getAppBySlug,
  getCategoryBySlug,
  getCharts,
  getCollectionBySlug,
  getDeveloperBySlug,
  getDiscoverFeed,
  getLibrarySnapshot,
  getTodayFeed,
  searchStore,
} from "@/lib/store-data";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const storeRouter = createTRPCRouter({
  today: publicProcedure.query(() => getTodayFeed()),
  discover: publicProcedure.query(() => getDiscoverFeed()),
  charts: publicProcedure
    .input(z.object({ view: z.enum(["free", "grossing", "trending"]) }))
    .query(({ input }) => getCharts(input.view)),
  search: publicProcedure
    .input(z.object({ query: z.string().default("") }))
    .query(({ input }) => searchStore(input.query)),
  library: publicProcedure.query(() => getLibrarySnapshot()),
  account: publicProcedure.query(() => getAccountSnapshot()),
  appBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ input }) => {
      const app = getAppBySlug(input.slug);

      if (!app) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `App not found for slug ${input.slug}`,
        });
      }

      return app;
    }),
  developerBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ input }) => {
      const developer = getDeveloperBySlug(input.slug);

      if (!developer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Developer not found for slug ${input.slug}`,
        });
      }

      return developer;
    }),
  collectionBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ input }) => {
      const collection = getCollectionBySlug(input.slug);

      if (!collection) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Collection not found for slug ${input.slug}`,
        });
      }

      return collection;
    }),
  categoryBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ input }) => {
      const category = getCategoryBySlug(input.slug);

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Category not found for slug ${input.slug}`,
        });
      }

      return category;
    }),
});
