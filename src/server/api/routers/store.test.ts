import { TRPCError } from "@trpc/server";
import { describe, expect, it } from "vitest";

import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

describe("storeRouter", () => {
  it("returns today, library, and account snapshots", async () => {
    const caller = appRouter.createCaller(createTRPCContext());
    const [today, library, account] = await Promise.all([
      caller.store.today(),
      caller.store.library(),
      caller.store.account(),
    ]);

    expect(today.hero?.slug).toBe("harbor-mail");
    expect(library.queueAverage).toBe(58);
    expect(account.plan).toBe("OpenStore Plus");
  });

  it("returns discover feed and detailed entities for valid slugs", async () => {
    const caller = appRouter.createCaller(createTRPCContext());
    const [discover, developer, collection, category] = await Promise.all([
      caller.store.discover(),
      caller.store.developerBySlug({ slug: "northstar-labs" }),
      caller.store.collectionBySlug({ slug: "remote-work-kit" }),
      caller.store.categoryBySlug({ slug: "productivity" }),
    ]);

    expect(discover.categories.length).toBeGreaterThan(0);
    expect(developer.apps.map((app) => app.slug)).toContain("northstar-notes");
    expect(collection.apps.map((app) => app.slug)).toContain("patchboard");
    expect(category.apps.map((app) => app.slug)).toContain("northstar-notes");
  });

  it("returns chart data for a valid chart view", async () => {
    const caller = appRouter.createCaller(createTRPCContext());
    const charts = await caller.store.charts({ view: "free" });

    expect(charts[0]?.slug).toBe("northstar-notes");
    expect(charts[0]?.rank.free).toBe(2);
  });

  it("returns search results through the API caller", async () => {
    const caller = appRouter.createCaller(createTRPCContext());
    const results = await caller.store.search({ query: "sleep" });

    expect(results.apps.map((app) => app.slug)).toContain("lantern-sleep");
    expect(results.developers.map((developer) => developer.slug)).toContain(
      "lantern-health",
    );
  });

  it("throws a not-found error for missing app slugs", async () => {
    const caller = appRouter.createCaller(createTRPCContext());

    await expect(caller.store.appBySlug({ slug: "missing-app" })).rejects.toEqual(
      expect.objectContaining<Partial<TRPCError>>({
        code: "NOT_FOUND",
        message: "App not found for slug missing-app",
      }),
    );
  });

  it.each([
    ["developerBySlug", { slug: "missing-developer" }, "Developer not found for slug missing-developer"],
    ["collectionBySlug", { slug: "missing-collection" }, "Collection not found for slug missing-collection"],
    ["categoryBySlug", { slug: "missing-category" }, "Category not found for slug missing-category"],
  ] as const)(
    "throws a not-found error for %s with unknown slugs",
    async (procedure, input, message) => {
      const caller = appRouter.createCaller(createTRPCContext());

      await expect(caller.store[procedure](input)).rejects.toEqual(
        expect.objectContaining<Partial<TRPCError>>({
          code: "NOT_FOUND",
          message,
        }),
      );
    },
  );
});
