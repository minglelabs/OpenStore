import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it } from "vitest";

import { resetStoreServiceState } from "@/lib/store-service";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

function createCaller() {
  return appRouter.createCaller(createTRPCContext());
}

describe("storeRouter", () => {
  beforeEach(() => {
    resetStoreServiceState();
  });

  it("returns today, discover, library, and account snapshots", async () => {
    const caller = createCaller();
    const [today, discover, library, account] = await Promise.all([
      caller.store.today(),
      caller.store.discover(),
      caller.store.library(),
      caller.store.account(),
    ]);

    expect(today.hero?.slug).toBe("harbor-mail");
    expect(discover.featuredDevelopers.length).toBeGreaterThan(0);
    expect(library.queueAverage).toBe(58);
    expect(account.plan).toBe("OpenStore Plus");
  });

  it("returns catalog lists and summary data", async () => {
    const caller = createCaller();
    const [summary, apps, developers, categories, collections] = await Promise.all([
      caller.store.catalog.summary(),
      caller.store.catalog.apps({
        categorySlug: "productivity",
        sort: "rating",
      }),
      caller.store.catalog.developers({ verifiedOnly: true }),
      caller.store.catalog.categories(),
      caller.store.catalog.collections({ categorySlug: "productivity" }),
    ]);

    expect(summary.appCount).toBeGreaterThan(5);
    expect(apps[0]?.slug).toBe("northstar-notes");
    expect(developers.every((developer) => developer.verified)).toBe(true);
    expect(categories.map((category) => category.slug)).toContain("utilities");
    expect(collections.map((collection) => collection.slug)).toContain("remote-work-kit");
  });

  it("returns app detail sections and developer catalog information", async () => {
    const caller = createCaller();
    const [sections, developerCatalog] = await Promise.all([
      caller.store.appDetail.sections({ slug: "northstar-notes" }),
      caller.store.developerCatalog({ slug: "northstar-labs" }),
    ]);

    if (!sections || !developerCatalog) {
      throw new Error("Expected API detail payloads to be present");
    }

    expect(sections.screenshots).toHaveLength(3);
    expect(sections.relatedApps.length).toBeGreaterThan(0);
    expect(sections.privacy.permissions).toContain("Notifications");
    expect(developerCatalog.relatedCategories).toContain("Productivity");
  });

  it("returns chart data for a valid chart view and category filter", async () => {
    const caller = createCaller();
    const charts = await caller.store.charts({
      view: "free",
      timeframe: "weekly",
      categorySlug: "productivity",
    });

    expect(charts.label).toBe("Top Free");
    expect(charts.entries[0]?.app.slug).toBe("northstar-notes");
    expect(charts.entries[0]?.rank).toBe(1);
    expect(charts.entries.every((entry) => entry.app.category.slug === "productivity")).toBe(
      true,
    );
    expect(charts.featureChecklist).toContain("Editorial override labels with visible reasons");
  });

  it("uses the previous category chart baseline when computing movement", async () => {
    const caller = createCaller();
    const charts = await caller.store.charts({
      view: "trending",
      timeframe: "weekly",
      categorySlug: "music",
    });

    expect(charts.entries).toHaveLength(1);
    expect(charts.entries[0]?.app.slug).toBe("beam-music");
    expect(charts.entries[0]?.rank).toBe(1);
    expect(charts.entries[0]?.previousRank).toBe(2);
    expect(charts.entries[0]?.movement).toBe(1);
    expect(charts.entries[0]?.movementDirection).toBe("up");
  });

  it("keeps leaderboard stats stable when the caller limits entry count", async () => {
    const caller = createCaller();
    const [fullChart, limitedChart] = await Promise.all([
      caller.store.charts({
        view: "trending",
        timeframe: "weekly",
      }),
      caller.store.charts({
        view: "trending",
        timeframe: "weekly",
        limit: 3,
      }),
    ]);

    expect(limitedChart.entries).toHaveLength(3);
    expect(limitedChart.stats.totalApps).toBe(fullChart.stats.totalApps);
    expect(limitedChart.stats.editorialOverrides).toBe(
      fullChart.stats.editorialOverrides,
    );
    expect(limitedChart.stats.biggestMover).toEqual(fullChart.stats.biggestMover);
  });

  it("returns search results, suggestions, trending queries, and recent queries", async () => {
    const caller = createCaller();
    const [results, suggestions, trending, recordedRecent] = await Promise.all([
      caller.store.search({
        query: "sleep",
        pricing: "any",
        sort: "relevance",
      }),
      caller.store.searchTools.suggestions({ query: "pro" }),
      caller.store.searchTools.trending(),
      caller.store.searchTools.recordRecent({ query: "security" }),
    ]);

    expect(results.apps.map((app) => app.slug)).toContain("lantern-sleep");
    expect(results.developers.map((developer) => developer.slug)).toContain(
      "lantern-health",
    );
    expect(suggestions).toContain("Productivity");
    expect(trending).toContain("privacy");
    expect(recordedRecent[0]).toBe("security");
  });

  it("supports wishlist and queue mutations through library APIs", async () => {
    const caller = createCaller();

    const afterAdd = await caller.store.libraryTools.addToWishlist({
      slug: "patchboard",
    });
    expect(afterAdd.wishlist.map((app) => app.slug)).toContain("patchboard");

    const afterQueue = await caller.store.libraryTools.queueInstall({
      slug: "studio-cast",
    });
    expect(afterQueue.queue.map((item) => item.app.slug)).toContain("studio-cast");

    const afterPause = await caller.store.libraryTools.pauseDownload({
      slug: "studio-cast",
    });
    expect(afterPause.queue.find((item) => item.app.slug === "studio-cast")?.eta).toBe(
      "Paused",
    );

    const afterResume = await caller.store.libraryTools.resumeDownload({
      slug: "studio-cast",
    });
    expect(
      afterResume.queue.find((item) => item.app.slug === "studio-cast")?.eta,
    ).not.toBe("Paused");

    const afterRemove = await caller.store.libraryTools.removeFromWishlist({
      slug: "patchboard",
    });
    expect(afterRemove.wishlist.map((app) => app.slug)).not.toContain("patchboard");
  });

  it("supports purchase-history and account mutations", async () => {
    const caller = createCaller();

    const [hidden, notifications, devices, restoreReceipt] = await Promise.all([
      caller.store.libraryTools.hidePurchase({ slug: "patchboard" }),
      caller.store.accountTools.toggleNotification({
        label: "Price drops",
        enabled: true,
      }),
      caller.store.accountTools.signOutDevice({ name: "Web Preview" }),
      caller.store.libraryTools.restorePurchases(),
    ]);

    expect(hidden.map((entry) => entry.app.slug)).toContain("patchboard");
    expect(
      notifications.find((item) => item.label === "Price drops")?.enabled,
    ).toBe(true);
    expect(devices.map((device) => device.name)).not.toContain("Web Preview");
    expect(restoreReceipt.restoredCount).toBeGreaterThan(0);
  });

  it("supports submitting reviews and reports", async () => {
    const caller = createCaller();

    const reviews = await caller.store.reviews.submit({
      appSlug: "patchboard",
      author: "Taylor Park",
      title: "Clear mobile ops surface",
      body: "Useful for fast release checks on a phone.",
      rating: 5,
    });
    const appReport = await caller.store.reports.app({
      appSlug: "patchboard",
      reason: "Misleading metadata",
      detail: "This is only a mock report for API verification.",
    });
    const developerReport = await caller.store.reports.developer({
      developerSlug: "orbit-works",
      reason: "Support concern",
      detail: "This is only a mock report for API verification.",
    });

    expect(reviews[0]?.author).toBe("Taylor Park");
    expect(appReport.id).toMatch(/^app-report-/);
    expect(developerReport.id).toMatch(/^developer-report-/);
  });

  it("throws a not-found error for missing app slugs", async () => {
    const caller = createCaller();

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
      const caller = createCaller();

      await expect(caller.store[procedure](input)).rejects.toEqual(
        expect.objectContaining<Partial<TRPCError>>({
          code: "NOT_FOUND",
          message,
        }),
      );
    },
  );
});
