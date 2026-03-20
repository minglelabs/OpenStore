import { initTRPC } from "@trpc/server";
import superjson from "superjson";

export function createTRPCContext() {
  return {};
}

const t = initTRPC.context<ReturnType<typeof createTRPCContext>>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
