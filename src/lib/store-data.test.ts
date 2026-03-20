import { describe, expect, it } from "vitest";

import {
  getChartFeatureChecklist,
  getAppBySlug,
  getCharts,
  getLibrarySnapshot,
  getTodayFeed,
  searchStore,
} from "@/lib/store-data";

describe("store-data", () => {
  it("enriches app detail records with developer, category, and reviews", () => {
    const app = getAppBySlug("northstar-notes");

    expect(app).not.toBeNull();
    expect(app?.developer.slug).toBe("northstar-labs");
    expect(app?.category.slug).toBe("productivity");
    expect(app?.reviews).toHaveLength(2);
  });

  it("returns charts sorted by rank and filters apps without that ranking", () => {
    const trending = getCharts("trending");
    const ranks = trending.map((app) => app.rank.trending);

    expect(trending[0]?.slug).toBe("glyph-ai");
    expect(ranks).toEqual([...ranks].sort((left, right) => (left ?? 0) - (right ?? 0)));
    expect(trending.every((app) => typeof app.rank.trending === "number")).toBe(true);
  });

  it("exposes paid charts and the leaderboard feature checklist", () => {
    const paid = getCharts("paid");
    const features = getChartFeatureChecklist();

    expect(paid[0]?.slug).toBe("patchboard");
    expect(paid.every((app) => typeof app.rank.paid === "number")).toBe(true);
    expect(features).toContain("Category-specific chart filtering");
  });

  it("searches apps, developers, and categories case-insensitively", () => {
    const results = searchStore("  privacy  ");

    expect(results.apps.map((app) => app.slug)).toContain("drift-browser");
    expect(results.developers.map((developer) => developer.slug)).toContain("straybyte");
    expect(results.categories.map((category) => category.slug)).toContain("utilities");
  });

  it("returns an empty search result for blank queries", () => {
    const results = searchStore("   ");

    expect(results).toEqual({
      apps: [],
      developers: [],
      categories: [],
    });
  });

  it("builds a stable library snapshot for installed apps and the queue", () => {
    const library = getLibrarySnapshot();

    expect(library.installed).toHaveLength(4);
    expect(library.queueAverage).toBe(58);
    expect(library.queue.map((item) => item.app.slug)).toEqual([
      "glyph-ai",
      "drift-browser",
    ]);
  });

  it("builds the today feed with a hero and curated collections", () => {
    const today = getTodayFeed();

    expect(today.hero?.slug).toBe("harbor-mail");
    expect(today.collections).toHaveLength(2);
    expect(today.releaseRadar).toHaveLength(3);
  });
});
