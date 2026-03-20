import { createTRPCRouter } from "@/server/api/trpc";
import { storeRouter } from "@/server/api/routers/store";

export const appRouter = createTRPCRouter({
  store: storeRouter,
});

export type AppRouter = typeof appRouter;
