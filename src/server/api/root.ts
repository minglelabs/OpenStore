import { commerceRouter } from "@/server/api/routers/commerce";
import { createTRPCRouter } from "@/server/api/trpc";
import { storeRouter } from "@/server/api/routers/store";

export const appRouter = createTRPCRouter({
  commerce: commerceRouter,
  store: storeRouter,
});

export type AppRouter = typeof appRouter;
