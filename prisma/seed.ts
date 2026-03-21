import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import {
  getAccountSnapshot,
  getAllApps,
  getAllCategories,
  getAllCollections,
  getAllDevelopers,
  getLibrarySnapshot,
} from "../src/lib/store-data";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to run prisma/seed.ts.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toCalendarDate(label: string) {
  return new Date(`${label} 12:00:00 GMT+0900`);
}

function relativeLabelToDate(label: string) {
  const now = new Date();
  const trimmed = label.trim();

  if (trimmed === "Just now") {
    return now;
  }

  if (trimmed === "Today") {
    return new Date(now.getTime() - 2 * 60 * 60 * 1000);
  }

  if (trimmed === "Yesterday") {
    return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }

  const minuteMatch = trimmed.match(/^(\d+)\s+minutes?\s+ago$/i);

  if (minuteMatch) {
    return new Date(now.getTime() - Number(minuteMatch[1]) * 60 * 1000);
  }

  const dayMatch = trimmed.match(/^(\d+)\s+days?\s+ago$/i);

  if (dayMatch) {
    return new Date(now.getTime() - Number(dayMatch[1]) * 24 * 60 * 60 * 1000);
  }

  const weekMatch = trimmed.match(/^(\d+)\s+weeks?\s+ago$/i);

  if (weekMatch) {
    return new Date(now.getTime() - Number(weekMatch[1]) * 7 * 24 * 60 * 60 * 1000);
  }

  return now;
}

async function main() {
  const developers = getAllDevelopers();
  const categories = getAllCategories();
  const apps = getAllApps();
  const collections = getAllCollections();
  const account = getAccountSnapshot();
  const library = getLibrarySnapshot();

  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "CollectionItem",
      "Collection",
      "Review",
      "AppVersion",
      "Device",
      "App",
      "Category",
      "User",
      "Developer"
    CASCADE
  `);

  const categoryIdBySlug = new Map<string, string>();

  for (const category of categories) {
    const record = await prisma.category.create({
      data: {
        slug: category.slug,
        name: category.name,
        summary: category.summary,
        metadata: {
          buyingGuide: category.buyingGuide,
        },
      },
    });

    categoryIdBySlug.set(category.slug, record.id);
  }

  const developerIdBySlug = new Map<string, string>();

  for (const developer of developers) {
    const record = await prisma.developer.create({
      data: {
        slug: developer.slug,
        name: developer.name,
        headline: developer.headline,
        description: developer.description,
        verified: developer.verified,
        region: developer.region,
        metadata: {
          founded: developer.founded,
          focus: developer.focus,
        },
      },
    });

    developerIdBySlug.set(developer.slug, record.id);
  }

  const appIdBySlug = new Map<string, string>();

  for (const app of apps) {
    const record = await prisma.app.create({
      data: {
        slug: app.slug,
        name: app.name,
        tagline: app.tagline,
        summary: app.summary,
        description: app.description,
        priceLabel: app.priceLabel,
        ratingAverage: app.rating,
        ratingCount: app.ratingCount,
        downloadCount: app.downloadCount,
        ageRating: app.ageRating,
        sizeLabel: app.size,
        developerId: developerIdBySlug.get(app.developer.slug) ?? "",
        categoryId: categoryIdBySlug.get(app.category.slug) ?? "",
        metadata: {
          gradient: app.gradient,
          updatedAtLabel: app.updatedAt,
          highlights: app.highlights,
          features: app.features,
          whatsNew: app.whatsNew,
          permissions: app.permissions,
          inAppPurchases: app.inAppPurchases,
          screenshots: app.screenshots,
          editorialQuote: app.editorialQuote,
          searchTags: app.searchTags,
          rank: app.rank,
        },
        versions: {
          create: {
            version: app.version,
            releaseNotes: app.whatsNew.join("\n"),
            releasedAt: toCalendarDate(app.updatedAt),
          },
        },
      },
    });

    appIdBySlug.set(app.slug, record.id);
  }

  for (const collection of collections) {
    const record = await prisma.collection.create({
      data: {
        slug: collection.slug,
        name: collection.name,
        description: collection.description,
        curator: collection.curator,
        categoryId: collection.category?.slug
          ? (categoryIdBySlug.get(collection.category.slug) ?? null)
          : null,
        metadata: {
          theme: collection.theme,
        },
      },
    });

    await prisma.collectionItem.createMany({
      data: collection.apps.map((app, index) => ({
        collectionId: record.id,
        appId: appIdBySlug.get(app.slug) ?? "",
        position: index + 1,
      })),
    });
  }

  const seededUser = await prisma.user.create({
    data: {
      email: account.email,
      name: account.name,
      region: account.region,
      metadata: {
        plan: account.plan,
        walletCredit: account.walletCredit,
        notifications: account.notifications,
        billing: account.billing,
        controls: account.controls,
        activeSubscriptionSlugs: account.activeSubscriptions.map((app) => app.slug),
        library: {
          installedSlugs: library.installed.map((app) => app.slug),
          updates: library.updates.map((item) => ({
            slug: item.slug,
            progress: item.progress,
            eta: item.eta,
          })),
          queue: library.queue.map((item) => ({
            slug: item.slug,
            progress: item.progress,
            eta: item.eta,
          })),
          wishlistSlugs: library.wishlist.map((app) => app.slug),
          activity: library.activity,
        },
      },
    },
  });

  await prisma.device.createMany({
    data: account.devices.map((device) => ({
      userId: seededUser.id,
      name: device.name,
      platform: device.platform,
      trusted: device.trusted,
      lastSeenAt: relativeLabelToDate(device.lastSeen),
    })),
  });

  const reviewUserIdByAuthor = new Map<string, string>([[account.name, seededUser.id]]);

  for (const app of apps) {
    for (const review of app.reviews) {
      if (!reviewUserIdByAuthor.has(review.author)) {
        const reviewer = await prisma.user.create({
          data: {
            email: `${slugify(review.author)}@seed.openstore.dev`,
            name: review.author,
            region: app.developer.region,
          },
        });

        reviewUserIdByAuthor.set(review.author, reviewer.id);
      }

      await prisma.review.create({
        data: {
          appId: appIdBySlug.get(app.slug) ?? "",
          userId: reviewUserIdByAuthor.get(review.author) ?? "",
          title: review.title,
          body: review.body,
          rating: review.rating,
          submittedAt: relativeLabelToDate(review.submittedAt),
        },
      });
    }
  }

  console.log(
    `Seeded ${developers.length} developers, ${categories.length} categories, ${apps.length} apps, ${collections.length} collections.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
