import { cache } from "react";

import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

export const getCaller = cache(() => {
  return appRouter.createCaller(createTRPCContext());
});
