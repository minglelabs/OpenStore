import { averageProgress } from "@/lib/utils";

export type Gradient = {
  from: string;
  to: string;
  accent: string;
};

export type DeveloperRecord = {
  slug: string;
  name: string;
  headline: string;
  description: string;
  verified: boolean;
  region: string;
  founded: string;
  focus: string[];
};

export type CategoryRecord = {
  slug: string;
  name: string;
  summary: string;
  buyingGuide: string[];
};

export type ReviewRecord = {
  appSlug: string;
  author: string;
  title: string;
  body: string;
  rating: number;
  submittedAt: string;
};

export type ScreenshotRecord = {
  title: string;
  caption: string;
};

export type AppRecord = {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  description: string;
  priceLabel: string;
  rating: number;
  ratingCount: number;
  downloadCount: number;
  ageRating: string;
  size: string;
  version: string;
  updatedAt: string;
  developerSlug: string;
  categorySlug: string;
  gradient: Gradient;
  status: "installed" | "update" | "queued" | "wishlist" | "available";
  highlights: string[];
  features: string[];
  whatsNew: string[];
  permissions: string[];
  inAppPurchases: string[];
  screenshots: ScreenshotRecord[];
  editorialQuote: string;
  searchTags: string[];
  rank: {
    free?: number;
    paid?: number;
    grossing?: number;
    trending?: number;
  };
};

export type CollectionRecord = {
  slug: string;
  name: string;
  description: string;
  curator: string;
  appSlugs: string[];
  categorySlug?: string;
  theme: Gradient;
};

export type QueueItem = {
  slug: string;
  progress: number;
  eta: string;
};

export type ActivityItem = {
  title: string;
  detail: string;
  timestamp: string;
};

export type NotificationPreference = {
  label: string;
  description: string;
  enabled: boolean;
};

export type DeviceRecord = {
  name: string;
  platform: string;
  trusted: boolean;
  lastSeen: string;
};

export type BillingRecord = {
  label: string;
  detail: string;
};

export type AccountRecord = {
  name: string;
  email: string;
  region: string;
  plan: string;
  walletCredit: string;
  notifications: NotificationPreference[];
  devices: DeviceRecord[];
  billing: BillingRecord[];
  controls: string[];
};

export type EnrichedApp = AppRecord & {
  developer: DeveloperRecord;
  category: CategoryRecord;
  reviews: ReviewRecord[];
};

export type EnrichedCollection = CollectionRecord & {
  apps: EnrichedApp[];
  category?: CategoryRecord;
};

export type ChartView = "free" | "paid" | "grossing" | "trending";
export type ChartTimeframe = "daily" | "weekly" | "monthly";
export type ChartMovementDirection = "up" | "down" | "flat" | "new";

export type ChartEntrySeed = {
  slug: string;
  rank: number;
  previousRank: number | null;
  highlight: string;
  editorialBadge?: string;
  editorialReason?: string;
};

export type ChartViewDefinition = {
  label: string;
  title: string;
  description: string;
  rankingHealth: string;
  methodology: string[];
  updatedAt: Record<ChartTimeframe, string>;
  entries: Record<ChartTimeframe, ChartEntrySeed[]>;
};

type PreviousChartOrderExtra = {
  slug: string;
  rank: number;
};

const developers: DeveloperRecord[] = [
  {
    slug: "northstar-labs",
    name: "Northstar Labs",
    headline: "Tools for calm, focused work.",
    description:
      "Northstar Labs builds quietly opinionated productivity software with thoughtful defaults and strong offline support.",
    verified: true,
    region: "Seoul, South Korea",
    founded: "2019",
    focus: ["Productivity", "Writing", "Team workflows"],
  },
  {
    slug: "orbit-works",
    name: "Orbit Works",
    headline: "Infrastructure products for modern indie teams.",
    description:
      "Orbit Works focuses on developer utilities, cloud tools, and collaboration software designed for small but fast-moving teams.",
    verified: true,
    region: "Singapore",
    founded: "2018",
    focus: ["Developer tools", "Collaboration", "Cloud storage"],
  },
  {
    slug: "ember-studio",
    name: "Ember Studio",
    headline: "Media apps with a premium editorial feel.",
    description:
      "Ember Studio creates audio and culture products that blend curation, community, and elegant interface design.",
    verified: true,
    region: "Tokyo, Japan",
    founded: "2020",
    focus: ["Music", "Culture", "Creator tools"],
  },
  {
    slug: "lantern-health",
    name: "Lantern Health",
    headline: "Wellness products that respect your pace.",
    description:
      "Lantern Health builds sleep, movement, and breathing apps with minimal notifications and clear habit design.",
    verified: true,
    region: "Melbourne, Australia",
    founded: "2021",
    focus: ["Wellness", "Fitness", "Sleep"],
  },
  {
    slug: "straybyte",
    name: "Straybyte",
    headline: "Privacy-first utilities for daily computing.",
    description:
      "Straybyte ships privacy-conscious communication and browsing tools that avoid noisy growth patterns.",
    verified: true,
    region: "Berlin, Germany",
    founded: "2017",
    focus: ["Utilities", "Privacy", "Communication"],
  },
  {
    slug: "velocity-play",
    name: "Velocity Play",
    headline: "Games with bright ideas and no dark patterns.",
    description:
      "Velocity Play publishes premium and fair-play games designed for short sessions and long-term loyalty.",
    verified: false,
    region: "Vancouver, Canada",
    founded: "2022",
    focus: ["Games", "Arcade", "Premium experiences"],
  },
];

const categories: CategoryRecord[] = [
  {
    slug: "productivity",
    name: "Productivity",
    summary:
      "Apps that help people plan, write, collaborate, and keep momentum.",
    buyingGuide: [
      "Prioritize offline support and sync quality.",
      "Look for products with low-friction sharing flows.",
      "Choose tools that make version history easy to recover.",
    ],
  },
  {
    slug: "developer-tools",
    name: "Developer Tools",
    summary: "Products for shipping code, managing infra, and debugging faster.",
    buyingGuide: [
      "Evaluate observability before aesthetics.",
      "Look for predictable pricing as usage scales.",
      "Make API and export support a default requirement.",
    ],
  },
  {
    slug: "music",
    name: "Music",
    summary: "Listening, curation, and creator tools with strong taste.",
    buyingGuide: [
      "Check device sync and offline playback support.",
      "Compare catalog quality, not just raw size.",
      "Pay attention to recommendation explainability.",
    ],
  },
  {
    slug: "wellness",
    name: "Wellness",
    summary:
      "Calm, movement, and sleep apps designed to fit around real life.",
    buyingGuide: [
      "Prefer products that support streak recovery.",
      "Avoid interfaces that rely on guilt-driven reminders.",
      "Pick apps with flexible plans, not rigid routines.",
    ],
  },
  {
    slug: "utilities",
    name: "Utilities",
    summary: "Everyday tools for browsing, storage, and communication.",
    buyingGuide: [
      "Understand data retention and privacy posture.",
      "Check how the app behaves with poor connectivity.",
      "Prefer products with clear export options.",
    ],
  },
  {
    slug: "games",
    name: "Games",
    summary: "Fair-play games for quick sessions and strong replay loops.",
    buyingGuide: [
      "Watch out for manipulative progression systems.",
      "Prefer transparent monetization.",
      "Look for games that teach mechanics quickly.",
    ],
  },
];

const apps: AppRecord[] = [
  {
    slug: "northstar-notes",
    name: "Northstar Notes",
    tagline: "Write, sort, and connect your thinking.",
    summary: "An offline-first notebook with beautiful structure.",
    description:
      "Northstar Notes gives writers and teams a fast way to capture ideas, organize them into systems, and publish polished documents without losing local control.",
    priceLabel: "Free",
    rating: 4.9,
    ratingCount: 18234,
    downloadCount: 1250000,
    ageRating: "4+",
    size: "118 MB",
    version: "2.4.1",
    updatedAt: "March 12, 2026",
    developerSlug: "northstar-labs",
    categorySlug: "productivity",
    gradient: {
      from: "#2047ff",
      to: "#67b4ff",
      accent: "#dce9ff",
    },
    status: "installed",
    highlights: [
      "Offline notebooks with automatic conflict recovery",
      "Shared spaces for product, design, and research",
      "One-tap export to Markdown and PDF",
    ],
    features: [
      "Nested collections and saved views",
      "Command palette for navigation",
      "AI summaries that stay opt-in",
    ],
    whatsNew: [
      "Faster sync for large notebooks",
      "Better widget previews",
      "Pinned templates for recurring workflows",
    ],
    permissions: ["Notifications", "Files and folders"],
    inAppPurchases: ["Northstar Pro Monthly", "Northstar Teams"],
    screenshots: [
      {
        title: "Calm editor",
        caption: "Focus mode keeps writing friction low.",
      },
      {
        title: "Project spaces",
        caption: "Shared workspaces for active teams and side projects.",
      },
      {
        title: "Templates",
        caption: "Start docs with reusable structure instead of blank pages.",
      },
    ],
    editorialQuote:
      "The rare notes app that makes structure feel lighter, not heavier.",
    searchTags: ["writing", "notes", "documents", "workspace"],
    rank: {
      free: 2,
      grossing: 6,
      trending: 3,
    },
  },
  {
    slug: "patchboard",
    name: "Patchboard",
    tagline: "Observe releases before they become incidents.",
    summary: "A release dashboard for small engineering teams.",
    description:
      "Patchboard centralizes deploy health, alerts, feature rollouts, and error trends into a single control surface built for teams that do not have time for enterprise ceremony.",
    priceLabel: "$6.99",
    rating: 4.8,
    ratingCount: 6482,
    downloadCount: 320000,
    ageRating: "4+",
    size: "96 MB",
    version: "1.9.0",
    updatedAt: "March 17, 2026",
    developerSlug: "orbit-works",
    categorySlug: "developer-tools",
    gradient: {
      from: "#0c172b",
      to: "#ff7d6d",
      accent: "#ffe5df",
    },
    status: "available",
    highlights: [
      "Unified deploy timeline across environments",
      "Incident drill-down built for mobile review",
      "Rollout gates that surface risk early",
    ],
    features: [
      "Alert routing rules",
      "Release annotations",
      "SLO snapshots and incident reports",
    ],
    whatsNew: [
      "Sentry digest cards",
      "Faster timeline filters",
      "Webhook retry inspector",
    ],
    permissions: ["Notifications"],
    inAppPurchases: ["Patchboard Team", "Patchboard Unlimited Projects"],
    screenshots: [
      {
        title: "Release health",
        caption: "Spot regressions by deploy, service, and environment.",
      },
      {
        title: "Incident response",
        caption: "Open the exact rollout context from the alert thread.",
      },
      {
        title: "Project matrix",
        caption: "See all services without needing a desktop dashboard.",
      },
    ],
    editorialQuote:
      "Patchboard respects the reality that most teams need clarity, not ceremony.",
    searchTags: ["deploy", "sentry", "infra", "errors", "observability"],
    rank: {
      paid: 1,
      grossing: 4,
      trending: 4,
    },
  },
  {
    slug: "beam-music",
    name: "Beam Music",
    tagline: "Tasteful playlists without algorithm fatigue.",
    summary: "Editorial listening for focused mornings and late nights.",
    description:
      "Beam Music balances human curation and lightweight personalization to create a calmer listening product for people who want recommendations with texture instead of noise.",
    priceLabel: "Free with Premium",
    rating: 4.7,
    ratingCount: 10342,
    downloadCount: 890000,
    ageRating: "12+",
    size: "132 MB",
    version: "3.2.5",
    updatedAt: "March 9, 2026",
    developerSlug: "ember-studio",
    categorySlug: "music",
    gradient: {
      from: "#6825ff",
      to: "#ff7f50",
      accent: "#f2e9ff",
    },
    status: "wishlist",
    highlights: [
      "Editorial stations by mood and scene",
      "Thoughtful queue shaping instead of endless autoplay",
      "Deep credits and liner notes",
    ],
    features: [
      "Offline listening",
      "Shared listening rooms",
      "Creator-led playlist notes",
    ],
    whatsNew: [
      "Improved CarPlay queue handoff",
      "New ambient channels",
      "Smarter duplicate track cleanup",
    ],
    permissions: ["Media library", "Bluetooth"],
    inAppPurchases: ["Beam Premium Monthly", "Family Listening Plan"],
    screenshots: [
      {
        title: "Quiet home",
        caption: "Start from scenes, not endless artist walls.",
      },
      {
        title: "Rich credits",
        caption: "See who made the track and why it landed in a playlist.",
      },
      {
        title: "Shared sessions",
        caption: "Listen live with friends without chat clutter.",
      },
    ],
    editorialQuote:
      "Beam feels like someone with excellent taste is quietly programming your day.",
    searchTags: ["audio", "playlists", "radio", "songs", "curation"],
    rank: {
      free: 5,
      grossing: 5,
      trending: 10,
    },
  },
  {
    slug: "harbor-mail",
    name: "Harbor Mail",
    tagline: "An email client that leaves room to think.",
    summary: "Private, focused inbox management for personal and team mail.",
    description:
      "Harbor Mail filters noise, groups intent, and keeps key conversations visible without turning your inbox into a productivity game.",
    priceLabel: "Free",
    rating: 4.8,
    ratingCount: 15408,
    downloadCount: 1340000,
    ageRating: "4+",
    size: "141 MB",
    version: "4.0.2",
    updatedAt: "March 18, 2026",
    developerSlug: "straybyte",
    categorySlug: "utilities",
    gradient: {
      from: "#0d2a4a",
      to: "#39b89b",
      accent: "#d7f7ef",
    },
    status: "update",
    highlights: [
      "Private aliases and focus modes",
      "AI triage summaries that stay local-first",
      "Shared team queues without heavy CRM behavior",
    ],
    features: [
      "Multi-account inbox",
      "Send later and follow-up tracking",
      "Permissioned shared inboxes",
    ],
    whatsNew: [
      "Delivery issue summaries",
      "Better newsletter cleanup actions",
      "Faster mailbox switching",
    ],
    permissions: ["Contacts", "Notifications"],
    inAppPurchases: ["Harbor Mail Plus", "Shared Inbox Pack"],
    screenshots: [
      {
        title: "Intent-based inbox",
        caption: "Messages grouped by urgency, not sender status.",
      },
      {
        title: "Team queue",
        caption: "Route conversations clearly without losing ownership.",
      },
      {
        title: "Focus review",
        caption: "Batch low-signal mail instead of living in your inbox.",
      },
    ],
    editorialQuote:
      "Harbor turns email from a stream into a set of deliberate choices.",
    searchTags: ["email", "inbox", "team", "privacy", "communication"],
    rank: {
      free: 1,
      grossing: 1,
      trending: 2,
    },
  },
  {
    slug: "lantern-sleep",
    name: "Lantern Sleep",
    tagline: "Rest routines that adapt instead of punish.",
    summary: "Sleep stories, wind-down plans, and recovery tracking.",
    description:
      "Lantern Sleep helps users build consistent evening routines with audio sessions, low-pressure reminders, and insights that focus on recovery instead of perfection.",
    priceLabel: "Free with Premium",
    rating: 4.9,
    ratingCount: 23990,
    downloadCount: 2100000,
    ageRating: "4+",
    size: "165 MB",
    version: "5.1.0",
    updatedAt: "March 6, 2026",
    developerSlug: "lantern-health",
    categorySlug: "wellness",
    gradient: {
      from: "#102247",
      to: "#ffb26b",
      accent: "#ffe8cf",
    },
    status: "installed",
    highlights: [
      "Flexible wind-down plans for travel and late work",
      "Sleep stories that do not feel overly gamified",
      "Morning recovery score with practical context",
    ],
    features: [
      "Breathing sessions",
      "Bedtime scene builder",
      "Shared household quiet modes",
    ],
    whatsNew: [
      "Recovery trends for shift work",
      "New ocean sleep scenes",
      "Improved wearable sync",
    ],
    permissions: ["Health data", "Notifications", "Bluetooth"],
    inAppPurchases: ["Lantern Premium Monthly", "Lantern Family"],
    screenshots: [
      {
        title: "Calm sessions",
        caption: "Guided routines designed for people with irregular evenings.",
      },
      {
        title: "Recovery trends",
        caption: "See patterns without needing to obsess over scores.",
      },
      {
        title: "Scene builder",
        caption: "Blend sound, light, and timer presets in seconds.",
      },
    ],
    editorialQuote:
      "Lantern succeeds because it feels more like support than discipline.",
    searchTags: ["sleep", "stories", "wellness", "recovery", "breathing"],
    rank: {
      free: 3,
      grossing: 2,
      trending: 7,
    },
  },
  {
    slug: "drift-browser",
    name: "Drift Browser",
    tagline: "A cleaner browser for privacy-minded people.",
    summary: "Fast browsing with visible privacy tradeoffs and clear defaults.",
    description:
      "Drift Browser removes ad-tech clutter, makes tracker blocking understandable, and keeps browsing performance strong without turning privacy into a maze of jargon.",
    priceLabel: "Free",
    rating: 4.6,
    ratingCount: 7920,
    downloadCount: 760000,
    ageRating: "17+",
    size: "154 MB",
    version: "2.8.4",
    updatedAt: "March 14, 2026",
    developerSlug: "straybyte",
    categorySlug: "utilities",
    gradient: {
      from: "#062034",
      to: "#2de1c2",
      accent: "#d8fff6",
    },
    status: "queued",
    highlights: [
      "Privacy summaries that explain actual impact",
      "Split profiles for work, personal, and guest use",
      "Instant reading mode cleanup",
    ],
    features: [
      "Cross-device tab handoff",
      "Built-in tracker blocking",
      "Secure download sandbox",
    ],
    whatsNew: [
      "Battery improvements on long sessions",
      "Granular website permissions",
      "Reader mode typography refresh",
    ],
    permissions: ["Downloads", "Camera", "Microphone"],
    inAppPurchases: ["Drift Plus Vault"],
    screenshots: [
      {
        title: "Clean landing",
        caption: "Start pages that surface what matters without sponsored clutter.",
      },
      {
        title: "Tracker summary",
        caption: "Understand what was blocked and why it matters.",
      },
      {
        title: "Reading mode",
        caption: "Strip noise from long articles in a single step.",
      },
    ],
    editorialQuote:
      "Drift explains privacy choices in plain language, which is still surprisingly rare.",
    searchTags: ["browser", "privacy", "web", "tabs", "reader"],
    rank: {
      free: 7,
      trending: 5,
    },
  },
  {
    slug: "relayfit",
    name: "RelayFit",
    tagline: "Short movement plans for busy schedules.",
    summary: "Coachable routines for workdays, travel, and recovery days.",
    description:
      "RelayFit turns fragmented time into useful movement sessions with adaptive plans, form clips, and energy-aware recommendations.",
    priceLabel: "Free with Premium",
    rating: 4.7,
    ratingCount: 11842,
    downloadCount: 940000,
    ageRating: "4+",
    size: "176 MB",
    version: "3.5.2",
    updatedAt: "March 10, 2026",
    developerSlug: "lantern-health",
    categorySlug: "wellness",
    gradient: {
      from: "#14322f",
      to: "#ffc65a",
      accent: "#fff0d0",
    },
    status: "available",
    highlights: [
      "Adaptive plans for limited time windows",
      "Travel and no-equipment routines",
      "Recovery-aware coaching without streak guilt",
    ],
    features: [
      "Video form cues",
      "Shared partner plans",
      "Calendar-aware workout suggestions",
    ],
    whatsNew: [
      "Better hotel room workouts",
      "Expanded mobility plans",
      "Improved Apple Health sync",
    ],
    permissions: ["Health data", "Motion activity", "Notifications"],
    inAppPurchases: ["RelayFit Premium", "Coach Bundle"],
    screenshots: [
      {
        title: "Short plans",
        caption: "Use fifteen quiet minutes instead of waiting for perfect conditions.",
      },
      {
        title: "Recovery view",
        caption: "Adjust the next plan based on real fatigue, not guilt.",
      },
      {
        title: "Coach cards",
        caption: "Get form and pacing advice inside the session.",
      },
    ],
    editorialQuote:
      "RelayFit is disciplined about staying useful even on your worst calendar days.",
    searchTags: ["fitness", "health", "workout", "mobility", "travel"],
    rank: {
      free: 8,
      grossing: 7,
    },
  },
  {
    slug: "glyph-ai",
    name: "Glyph AI",
    tagline: "A sharp research companion for busy teams.",
    summary: "Synthesize docs, meetings, and briefs into usable decisions.",
    description:
      "Glyph AI connects documents, transcripts, and notes into a practical research layer that keeps reasoning traceable and editing collaborative.",
    priceLabel: "Free Trial",
    rating: 4.6,
    ratingCount: 5430,
    downloadCount: 410000,
    ageRating: "12+",
    size: "124 MB",
    version: "1.8.3",
    updatedAt: "March 19, 2026",
    developerSlug: "orbit-works",
    categorySlug: "productivity",
    gradient: {
      from: "#201147",
      to: "#fd6ec8",
      accent: "#ffe0f1",
    },
    status: "queued",
    highlights: [
      "Source-grounded summaries with citations",
      "Project spaces for product and research teams",
      "Brief builders for sharing decisions clearly",
    ],
    features: [
      "Meeting recap generation",
      "Document clustering",
      "Structured follow-up prompts",
    ],
    whatsNew: [
      "Faster transcript ingestion",
      "Source cards for answer auditing",
      "Brief export templates",
    ],
    permissions: ["Files and folders", "Microphone", "Notifications"],
    inAppPurchases: ["Glyph Team", "Glyph Extra Storage"],
    screenshots: [
      {
        title: "Source grounding",
        caption: "Every summary points back to the evidence that shaped it.",
      },
      {
        title: "Project briefs",
        caption: "Turn messy findings into decisions that can actually ship.",
      },
      {
        title: "Meeting recap",
        caption: "Capture owners, risks, and next moves in one pass.",
      },
    ],
    editorialQuote:
      "Glyph stands out because its best feature is restraint rather than hype.",
    searchTags: ["ai", "research", "documents", "meeting", "briefs"],
    rank: {
      free: 6,
      grossing: 9,
      trending: 1,
    },
  },
  {
    slug: "arcade-lane",
    name: "Arcade Lane",
    tagline: "Quick runs, bright ideas, fair monetization.",
    summary: "A polished arcade game built for short sessions and strong replay.",
    description:
      "Arcade Lane combines responsive controls, gentle onboarding, and layered challenge design without leaning on manipulative progression tactics.",
    priceLabel: "$3.99",
    rating: 4.8,
    ratingCount: 8972,
    downloadCount: 560000,
    ageRating: "9+",
    size: "214 MB",
    version: "2.0.0",
    updatedAt: "March 1, 2026",
    developerSlug: "velocity-play",
    categorySlug: "games",
    gradient: {
      from: "#29006f",
      to: "#ff5d3d",
      accent: "#ffe4dc",
    },
    status: "available",
    highlights: [
      "Tight runs that teach themselves quickly",
      "No loot boxes or stamina timers",
      "Weekly challenge tracks with fair scoring",
    ],
    features: [
      "Controller support",
      "Daily leaderboard snapshots",
      "Accessibility modes for color and motion",
    ],
    whatsNew: [
      "New glass city track",
      "Ghost replay improvements",
      "Expanded controller remapping",
    ],
    permissions: ["Game controller"],
    inAppPurchases: ["Supporter cosmetic pack"],
    screenshots: [
      {
        title: "Fast runs",
        caption: "Short sessions still feel complete and rewarding.",
      },
      {
        title: "Challenge modes",
        caption: "Compete without running into manipulative cooldowns.",
      },
      {
        title: "Accessible controls",
        caption: "Tweak motion and readability without losing the pace.",
      },
    ],
    editorialQuote:
      "Arcade Lane proves premium mobile games can still feel generous.",
    searchTags: ["game", "arcade", "premium", "controller", "leaderboard"],
    rank: {
      paid: 2,
      grossing: 10,
      trending: 8,
    },
  },
  {
    slug: "pocket-cloud",
    name: "Pocket Cloud",
    tagline: "File sync that does not hide the important bits.",
    summary: "A transparent storage app for teams and personal archives.",
    description:
      "Pocket Cloud keeps sync predictable with visible file history, share controls, and storage analytics that make it easy to understand where space goes.",
    priceLabel: "Free with Pro",
    rating: 4.7,
    ratingCount: 12874,
    downloadCount: 980000,
    ageRating: "4+",
    size: "148 MB",
    version: "4.6.4",
    updatedAt: "March 16, 2026",
    developerSlug: "orbit-works",
    categorySlug: "utilities",
    gradient: {
      from: "#102c67",
      to: "#6bdcff",
      accent: "#ddf8ff",
    },
    status: "installed",
    highlights: [
      "Visible sync history and file health",
      "Granular share controls built for teams",
      "Storage analytics that help cleanup feel manageable",
    ],
    features: [
      "Large file transfer mode",
      "Shared client folders",
      "Version restore snapshots",
    ],
    whatsNew: [
      "Faster media uploads",
      "Cleaner shared-link dashboard",
      "Pinned offline folders",
    ],
    permissions: ["Files and folders", "Camera", "Notifications"],
    inAppPurchases: ["Pocket Cloud Pro", "10 TB Team Storage"],
    screenshots: [
      {
        title: "Storage clarity",
        caption: "Understand exactly where space is going.",
      },
      {
        title: "Version restore",
        caption: "Recover prior versions without guesswork.",
      },
      {
        title: "Offline folders",
        caption: "Pin important work and keep it reliable on the move.",
      },
    ],
    editorialQuote:
      "Pocket Cloud wins because it makes sync behavior visible instead of magical.",
    searchTags: ["files", "cloud", "storage", "sync", "backup"],
    rank: {
      free: 4,
      grossing: 3,
      trending: 9,
    },
  },
  {
    slug: "focus-frame",
    name: "Focus Frame",
    tagline: "Ambient timing for deep work sessions.",
    summary: "A minimalist timer with rhythm presets and reflection prompts.",
    description:
      "Focus Frame helps people structure deep work sessions with subtle visuals, session reflections, and team check-ins that do not become performative.",
    priceLabel: "Free",
    rating: 4.7,
    ratingCount: 4560,
    downloadCount: 270000,
    ageRating: "4+",
    size: "82 MB",
    version: "1.7.1",
    updatedAt: "March 11, 2026",
    developerSlug: "northstar-labs",
    categorySlug: "productivity",
    gradient: {
      from: "#421235",
      to: "#ffb38a",
      accent: "#ffeadf",
    },
    status: "wishlist",
    highlights: [
      "Rhythm presets for different kinds of focus",
      "Private session reflections",
      "Shared start windows for distributed teams",
    ],
    features: [
      "Subtle ambient scenes",
      "Break suggestions",
      "Session trend snapshots",
    ],
    whatsNew: [
      "Morning planning cards",
      "New ambient visuals",
      "Shared focus circles",
    ],
    permissions: ["Notifications"],
    inAppPurchases: ["Ambient Pack", "Team Rooms"],
    screenshots: [
      {
        title: "Quiet timer",
        caption: "Track time without turning work into a scoreboard.",
      },
      {
        title: "Reflection cards",
        caption: "Capture what moved the work forward while it is still fresh.",
      },
      {
        title: "Team circles",
        caption: "Start together without becoming a social feed.",
      },
    ],
    editorialQuote:
      "Focus Frame has the restraint that most focus products talk about but never ship.",
    searchTags: ["timer", "focus", "pomodoro", "ambient", "work"],
    rank: {
      free: 9,
      trending: 6,
    },
  },
  {
    slug: "studio-cast",
    name: "Studio Cast",
    tagline: "Podcast workflows with room for real editing.",
    summary: "Planning, publishing, and audience notes for small studios.",
    description:
      "Studio Cast helps podcast teams manage episode pipelines, review cuts, and coordinate publishing without needing a giant media back office.",
    priceLabel: "$8.99",
    rating: 4.5,
    ratingCount: 3042,
    downloadCount: 180000,
    ageRating: "4+",
    size: "110 MB",
    version: "1.4.0",
    updatedAt: "March 7, 2026",
    developerSlug: "ember-studio",
    categorySlug: "music",
    gradient: {
      from: "#1e1538",
      to: "#ffa06a",
      accent: "#ffe8da",
    },
    status: "wishlist",
    highlights: [
      "Episode pipeline from planning through publish",
      "Review notes tied to exact timestamps",
      "Audience insight snapshots for small teams",
    ],
    features: [
      "Clip approvals",
      "Guest prep templates",
      "Publishing checklist automation",
    ],
    whatsNew: [
      "Multi-host review rooms",
      "RSS health check cards",
      "Faster clip export",
    ],
    permissions: ["Microphone", "Files and folders", "Notifications"],
    inAppPurchases: ["Studio Cast Team", "Additional Storage"],
    screenshots: [
      {
        title: "Episode flow",
        caption: "See the whole production pipeline at a glance.",
      },
      {
        title: "Review notes",
        caption: "Comment on a precise moment without long feedback threads.",
      },
      {
        title: "Publish check",
        caption: "Ship with fewer missed assets and metadata errors.",
      },
    ],
    editorialQuote:
      "Studio Cast is small-team software that actually understands small teams.",
    searchTags: ["podcast", "audio", "editing", "publishing", "creator"],
    rank: {
      paid: 3,
      grossing: 8,
    },
  },
];

const collections: CollectionRecord[] = [
  {
    slug: "remote-work-kit",
    name: "Remote Work Kit",
    description:
      "A clean bundle of apps for communication, notes, shipping, and secure files.",
    curator: "OpenStore Editorial",
    appSlugs: ["northstar-notes", "harbor-mail", "patchboard", "pocket-cloud"],
    categorySlug: "productivity",
    theme: {
      from: "#0f1f46",
      to: "#68c6ff",
      accent: "#dff5ff",
    },
  },
  {
    slug: "calm-evening",
    name: "Calm Evening",
    description:
      "A softer bundle for winding down, reading long-form content, and better sleep.",
    curator: "OpenStore Editorial",
    appSlugs: ["lantern-sleep", "beam-music", "drift-browser"],
    categorySlug: "wellness",
    theme: {
      from: "#29124a",
      to: "#ffa667",
      accent: "#ffe7d7",
    },
  },
  {
    slug: "indie-weekend",
    name: "Indie Weekend",
    description:
      "Personal tools and fair-play entertainment for a quiet weekend reset.",
    curator: "OpenStore Editorial",
    appSlugs: ["focus-frame", "arcade-lane", "studio-cast"],
    categorySlug: "games",
    theme: {
      from: "#330c36",
      to: "#ff6f61",
      accent: "#ffe2de",
    },
  },
];

const reviews: ReviewRecord[] = [
  {
    appSlug: "northstar-notes",
    author: "S. Kim",
    title: "Finally calm at scale",
    body: "The team spaces are strong, but the app still feels private and personal on my phone.",
    rating: 5,
    submittedAt: "2 days ago",
  },
  {
    appSlug: "northstar-notes",
    author: "L. Chen",
    title: "Best offline notebook I have used",
    body: "Conflict recovery and export quality are both excellent. That combination is still rare.",
    rating: 5,
    submittedAt: "1 week ago",
  },
  {
    appSlug: "harbor-mail",
    author: "R. Patel",
    title: "Makes triage much clearer",
    body: "The intent grouping is actually useful, especially on mobile where most email clients become overwhelming.",
    rating: 5,
    submittedAt: "3 days ago",
  },
  {
    appSlug: "lantern-sleep",
    author: "M. Rivera",
    title: "Supportive instead of judgmental",
    body: "I missed a week of routines and the product still made it easy to restart without guilt.",
    rating: 5,
    submittedAt: "5 days ago",
  },
  {
    appSlug: "patchboard",
    author: "J. Park",
    title: "Useful on the train",
    body: "I can actually review deploy health on mobile without pinching around a desktop dashboard.",
    rating: 4,
    submittedAt: "6 days ago",
  },
  {
    appSlug: "glyph-ai",
    author: "A. Smith",
    title: "The citation flow matters",
    body: "A lot of AI tools summarize quickly, but this one helps me verify what shaped the answer.",
    rating: 5,
    submittedAt: "1 day ago",
  },
];

const libraryState = {
  installed: ["northstar-notes", "harbor-mail", "lantern-sleep", "pocket-cloud"],
  updates: [
    {
      slug: "harbor-mail",
      progress: 63,
      eta: "3 min left",
    },
    {
      slug: "pocket-cloud",
      progress: 91,
      eta: "About 1 min left",
    },
  ] satisfies QueueItem[],
  queue: [
    {
      slug: "glyph-ai",
      progress: 74,
      eta: "4 min left",
    },
    {
      slug: "drift-browser",
      progress: 42,
      eta: "7 min left",
    },
  ] satisfies QueueItem[],
  wishlist: ["beam-music", "focus-frame", "studio-cast"],
  activity: [
    {
      title: "Harbor Mail update started",
      detail: "Background update scheduled over Wi-Fi.",
      timestamp: "Just now",
    },
    {
      title: "Glyph AI queued",
      detail: "Added from Trending after editorial review.",
      timestamp: "14 minutes ago",
    },
    {
      title: "Northstar Notes opened",
      detail: "Last used from the productivity bundle.",
      timestamp: "Today",
    },
  ] satisfies ActivityItem[],
};

const accountState: AccountRecord = {
  name: "Taylor Park",
  email: "taylor@openstore.dev",
  region: "South Korea",
  plan: "OpenStore Plus",
  walletCredit: "$24.50",
  notifications: [
    {
      label: "Release watch",
      description: "Editorial alerts for important launches and noteworthy updates.",
      enabled: true,
    },
    {
      label: "Download status",
      description: "Queue completion, retry, and update health.",
      enabled: true,
    },
    {
      label: "Price drops",
      description: "Wishlist pricing changes and limited-time discounts.",
      enabled: false,
    },
  ],
  devices: [
    {
      name: "iPhone 16 Pro",
      platform: "iOS",
      trusted: true,
      lastSeen: "3 minutes ago",
    },
    {
      name: "MacBook Air",
      platform: "macOS",
      trusted: true,
      lastSeen: "Today",
    },
    {
      name: "Web Preview",
      platform: "Web",
      trusted: false,
      lastSeen: "Yesterday",
    },
  ],
  billing: [
    {
      label: "Current plan",
      detail: "Plus annual plan renews on October 8, 2026.",
    },
    {
      label: "Family sharing",
      detail: "Two seats active, four seats available.",
    },
    {
      label: "Wallet credit",
      detail: "Available for paid apps and in-app subscriptions.",
    },
  ],
  controls: [
    "Require Face ID before purchases",
    "Limit mature content in family devices",
    "Block downloads over cellular for apps above 500 MB",
  ],
};

function getDeveloper(slug: string) {
  return developers.find((developer) => developer.slug === slug);
}

function getCategory(slug: string) {
  return categories.find((category) => category.slug === slug);
}

function enrichApp(app: AppRecord): EnrichedApp {
  const developer = getDeveloper(app.developerSlug);
  const category = getCategory(app.categorySlug);

  if (!developer || !category) {
    throw new Error(`Missing developer or category for app ${app.slug}`);
  }

  return {
    ...app,
    developer,
    category,
    reviews: reviews.filter((review) => review.appSlug === app.slug),
  };
}

function enrichCollection(collection: CollectionRecord): EnrichedCollection {
  return {
    ...collection,
    apps: collection.appSlugs
      .map((slug) => getAppBySlug(slug))
      .filter((app): app is EnrichedApp => Boolean(app)),
    category: collection.categorySlug ? getCategory(collection.categorySlug) : undefined,
  };
}

export function getAllApps() {
  return apps.map(enrichApp);
}

export function getAllDevelopers() {
  return developers;
}

export function getAllCategories() {
  return categories;
}

export function getAllCollections() {
  return collections.map(enrichCollection);
}

export function getAppBySlug(slug: string) {
  const app = apps.find((item) => item.slug === slug);
  return app ? enrichApp(app) : null;
}

export function getDeveloperBySlug(slug: string) {
  const developer = getDeveloper(slug);

  if (!developer) {
    return null;
  }

  return {
    ...developer,
    apps: getAllApps().filter((app) => app.developer.slug === slug),
  };
}

export function getCollectionBySlug(slug: string) {
  const collection = collections.find((item) => item.slug === slug);
  return collection ? enrichCollection(collection) : null;
}

export function getCategoryBySlug(slug: string) {
  const category = getCategory(slug);

  if (!category) {
    return null;
  }

  return {
    ...category,
    apps: getAllApps().filter((app) => app.category.slug === slug),
  };
}

export function getTodayFeed() {
  return {
    hero: getAppBySlug("harbor-mail"),
    spotlightApps: ["northstar-notes", "glyph-ai", "lantern-sleep"]
      .map((slug) => getAppBySlug(slug))
      .filter((app): app is EnrichedApp => Boolean(app)),
    collections: ["remote-work-kit", "calm-evening"]
      .map((slug) => getCollectionBySlug(slug))
      .filter((collection): collection is EnrichedCollection => Boolean(collection)),
    releaseRadar: ["harbor-mail", "glyph-ai", "pocket-cloud"]
      .map((slug) => getAppBySlug(slug))
      .filter((app): app is EnrichedApp => Boolean(app)),
    safetyNotes: [
      "Every app card shows developer identity and pricing model up front.",
      "Editorial stories highlight why an app is trustworthy, not only why it is popular.",
      "The future native shell will focus on downloads, notifications, and device-level safety.",
    ],
  };
}

export function getDiscoverFeed() {
  return {
    categories,
    collections: getAllCollections(),
    featuredDevelopers: developers.filter((developer) => developer.verified).slice(0, 4),
    hiddenGems: ["focus-frame", "studio-cast", "drift-browser"]
      .map((slug) => getAppBySlug(slug))
      .filter((app): app is EnrichedApp => Boolean(app)),
    principles: [
      "Human curation should explain why something matters.",
      "Store safety should be visible before download time.",
      "The interface should feel premium without copying Apple directly.",
    ],
  };
}

const chartFeatureChecklist = [
  "Top Free, Top Paid, Top Grossing, and Trending chart types",
  "Daily, weekly, and monthly leaderboard windows",
  "Category-specific chart filtering",
  "Rank movement indicators with previous placement context",
  "Editorial override labels with visible reasons",
  "Exact refresh timestamps and ranking health summaries",
  "Methodology disclosure for each chart model",
  "Deep links from charts and category pages into app details",
];

const chartDefinitions: Record<ChartView, ChartViewDefinition> = {
  free: {
    label: "Top Free",
    title: "Free charts that reward durable intent",
    description:
      "Free rankings balance install velocity with review quality, retention, and how quickly a launch settles into repeat use.",
    rankingHealth: "Stable, with editorial lifts constrained to short windows.",
    methodology: [
      "Install velocity carries the most weight in the first 24 hours.",
      "Retention and review quality prevent low-signal spikes from dominating the chart.",
      "Editorial overrides are temporary and clearly labeled when they exist.",
    ],
    updatedAt: {
      daily: "March 21, 2026 at 09:00 KST",
      weekly: "March 21, 2026 at 07:30 KST",
      monthly: "March 20, 2026 at 18:00 KST",
    },
    entries: {
      daily: [
        {
          slug: "glyph-ai",
          rank: 1,
          previousRank: 6,
          highlight: "Free trial conversion accelerated after transcript ingestion shipped.",
        },
        {
          slug: "harbor-mail",
          rank: 2,
          previousRank: 1,
          highlight: "Mailbox cleanup rollout kept installs steady while reducing churn.",
        },
        {
          slug: "northstar-notes",
          rank: 3,
          previousRank: 2,
          highlight: "Template pins turned editorial traffic into durable installs.",
        },
        {
          slug: "pocket-cloud",
          rank: 4,
          previousRank: 5,
          highlight: "Pinned offline folders improved search-to-install conversion.",
        },
        {
          slug: "lantern-sleep",
          rank: 5,
          previousRank: 3,
          highlight: "Recovery trend cards lifted weekend retention.",
        },
        {
          slug: "beam-music",
          rank: 6,
          previousRank: 8,
          editorialBadge: "Editor's Lift",
          editorialReason: "A late-night listening feature landed in Today's audio story.",
          highlight: "Ambient channels and curation are pushing Beam back into the mix.",
        },
        {
          slug: "drift-browser",
          rank: 7,
          previousRank: 7,
          highlight: "Permission summaries continue to convert privacy searches.",
        },
        {
          slug: "focus-frame",
          rank: 8,
          previousRank: null,
          editorialBadge: "New & Notable",
          editorialReason: "Morning planning cards earned a temporary editorial boost.",
          highlight: "A disciplined timer design is finding a new audience.",
        },
        {
          slug: "relayfit",
          rank: 9,
          previousRank: 4,
          highlight: "Travel-season demand cooled after an earlier spike.",
        },
      ],
      weekly: [
        {
          slug: "harbor-mail",
          rank: 1,
          previousRank: 2,
          highlight: "Reliable updates and low uninstall rates keep Harbor ahead.",
        },
        {
          slug: "northstar-notes",
          rank: 2,
          previousRank: 1,
          highlight: "Download depth and review quality still hold up.",
        },
        {
          slug: "lantern-sleep",
          rank: 3,
          previousRank: 5,
          highlight: "Family plan retention is giving Lantern a steady climb.",
        },
        {
          slug: "pocket-cloud",
          rank: 4,
          previousRank: 3,
          highlight: "Share controls and sync clarity are translating into word of mouth.",
        },
        {
          slug: "beam-music",
          rank: 5,
          previousRank: 7,
          highlight: "Playlist programming is keeping Beam sticky without heavy promotion.",
        },
        {
          slug: "glyph-ai",
          rank: 6,
          previousRank: 8,
          editorialBadge: "Breakout Update",
          editorialReason: "Teams adopted the new brief export templates faster than expected.",
          highlight: "Fast update adoption pushed Glyph into the top tier.",
        },
        {
          slug: "drift-browser",
          rank: 7,
          previousRank: 6,
          highlight: "Privacy explainers continue to convert utility traffic.",
        },
        {
          slug: "relayfit",
          rank: 8,
          previousRank: 9,
          highlight: "Short-session routines are traveling well into spring.",
        },
        {
          slug: "focus-frame",
          rank: 9,
          previousRank: 4,
          highlight: "Focus traffic remains healthy but less explosive than last month.",
        },
      ],
      monthly: [
        {
          slug: "northstar-notes",
          rank: 1,
          previousRank: 1,
          highlight: "Northstar still owns the long-view free charts.",
        },
        {
          slug: "harbor-mail",
          rank: 2,
          previousRank: 3,
          highlight: "Harbor's sustained installs keep it close behind.",
        },
        {
          slug: "lantern-sleep",
          rank: 3,
          previousRank: 2,
          highlight: "Lantern stays durable beyond short-term feature bursts.",
        },
        {
          slug: "pocket-cloud",
          rank: 4,
          previousRank: 5,
          highlight: "Storage clarity keeps Pocket Cloud growing month over month.",
        },
        {
          slug: "beam-music",
          rank: 5,
          previousRank: 6,
          highlight: "Beam turns editorial listening into steady free installs.",
        },
        {
          slug: "drift-browser",
          rank: 6,
          previousRank: 4,
          highlight: "Privacy demand cooled slightly, but Drift remains durable.",
        },
        {
          slug: "relayfit",
          rank: 7,
          previousRank: 8,
          highlight: "RelayFit keeps a stable long-tail audience in wellness.",
        },
        {
          slug: "glyph-ai",
          rank: 8,
          previousRank: null,
          highlight: "Glyph entered the monthly free chart after sustained team adoption.",
        },
        {
          slug: "focus-frame",
          rank: 9,
          previousRank: 7,
          highlight: "Focus Frame is sticking, but at a calmer pace than last cycle.",
        },
      ],
    },
  },
  paid: {
    label: "Top Paid",
    title: "Premium apps that still convert on merit",
    description:
      "Paid charts prioritize completed purchases, refund stability, and session depth after purchase instead of raw page views.",
    rankingHealth: "Healthy, with refunds low and premium conversion concentrated in a few niches.",
    methodology: [
      "Completed purchase conversion matters more than install interest.",
      "Refund and chargeback stability protect the chart from short-lived spikes.",
      "Premium depth favors apps that are actively used after the sale, not just impulse buys.",
    ],
    updatedAt: {
      daily: "March 21, 2026 at 09:00 KST",
      weekly: "March 21, 2026 at 07:30 KST",
      monthly: "March 20, 2026 at 18:00 KST",
    },
    entries: {
      daily: [
        {
          slug: "arcade-lane",
          rank: 1,
          previousRank: 2,
          editorialBadge: "Editor's Lift",
          editorialReason:
            "The new Glass City track and controller remapping were featured in gaming coverage.",
          highlight: "Arcade Lane jumped after its season update landed.",
        },
        {
          slug: "patchboard",
          rank: 2,
          previousRank: 1,
          highlight: "Patchboard still converts well with engineering teams.",
        },
        {
          slug: "studio-cast",
          rank: 3,
          previousRank: 3,
          highlight: "Studio Cast remains steady with creator teams.",
        },
      ],
      weekly: [
        {
          slug: "patchboard",
          rank: 1,
          previousRank: 1,
          highlight: "Strong paid conversion and low refunds keep Patchboard on top.",
        },
        {
          slug: "arcade-lane",
          rank: 2,
          previousRank: 3,
          highlight: "Fair-play premium design keeps Arcade Lane climbing.",
        },
        {
          slug: "studio-cast",
          rank: 3,
          previousRank: 2,
          highlight: "Studio Cast holds a loyal but smaller paid audience.",
        },
      ],
      monthly: [
        {
          slug: "patchboard",
          rank: 1,
          previousRank: 2,
          highlight: "Patchboard wins the long view on purchase intent.",
        },
        {
          slug: "arcade-lane",
          rank: 2,
          previousRank: 1,
          highlight: "Arcade Lane's surge cooled into a durable second place.",
        },
        {
          slug: "studio-cast",
          rank: 3,
          previousRank: 3,
          highlight: "Creator-team upgrades keep Studio Cast in the chart.",
        },
      ],
    },
  },
  grossing: {
    label: "Top Grossing",
    title: "Revenue leaders with healthier retention",
    description:
      "Grossing charts measure net payer momentum, renewal durability, and monetization quality instead of raw list price.",
    rankingHealth: "Concentrated at the top, but the middle of the chart is increasingly competitive.",
    methodology: [
      "Renewal durability and net payer growth matter more than short-term checkout spikes.",
      "Revenue quality discounts heavy refund behavior and unstable promotional bursts.",
      "Editorial overrides are rare and limited to contextual visibility, not permanent rank locks.",
    ],
    updatedAt: {
      daily: "March 21, 2026 at 09:00 KST",
      weekly: "March 21, 2026 at 07:30 KST",
      monthly: "March 20, 2026 at 18:00 KST",
    },
    entries: {
      daily: [
        {
          slug: "harbor-mail",
          rank: 1,
          previousRank: 2,
          highlight: "Shared inbox upgrades are converting at a high clip.",
        },
        {
          slug: "lantern-sleep",
          rank: 2,
          previousRank: 1,
          highlight: "Lantern's subscriber base is stable even after the promo window.",
        },
        {
          slug: "pocket-cloud",
          rank: 3,
          previousRank: 4,
          highlight: "Team storage expansions boosted same-day grossing.",
        },
        {
          slug: "patchboard",
          rank: 4,
          previousRank: 5,
          highlight: "Engineering subscriptions remain resilient after the release push.",
        },
        {
          slug: "beam-music",
          rank: 5,
          previousRank: 3,
          highlight: "Premium audio stays strong, but growth cooled slightly.",
        },
        {
          slug: "northstar-notes",
          rank: 6,
          previousRank: 7,
          highlight: "Pinned templates nudged more users into paid plans.",
        },
        {
          slug: "studio-cast",
          rank: 7,
          previousRank: 8,
          editorialBadge: "Pro Workflow Spotlight",
          editorialReason:
            "A creator workflow story increased team-plan interest.",
          highlight: "Studio Cast monetization is improving without a huge install spike.",
        },
        {
          slug: "relayfit",
          rank: 8,
          previousRank: 6,
          highlight: "RelayFit renewals remain healthy across partner plans.",
        },
        {
          slug: "glyph-ai",
          rank: 9,
          previousRank: 10,
          editorialBadge: "Revenue Watch",
          editorialReason:
            "The new audit-friendly exports are attracting higher-value team accounts.",
          highlight: "Glyph is still early, but team seats are climbing.",
        },
        {
          slug: "arcade-lane",
          rank: 10,
          previousRank: 9,
          highlight: "Supporter cosmetics add modest but durable grossing.",
        },
      ],
      weekly: [
        {
          slug: "harbor-mail",
          rank: 1,
          previousRank: 2,
          highlight: "Harbor's paid tiers monetize broad, daily use.",
        },
        {
          slug: "lantern-sleep",
          rank: 2,
          previousRank: 1,
          highlight: "Lantern stays close on renewal quality.",
        },
        {
          slug: "pocket-cloud",
          rank: 3,
          previousRank: 4,
          highlight: "Storage expansion and file history remain strong revenue drivers.",
        },
        {
          slug: "patchboard",
          rank: 4,
          previousRank: 5,
          highlight: "Patchboard's team plan sticks after the release wave.",
        },
        {
          slug: "beam-music",
          rank: 5,
          previousRank: 3,
          highlight: "Beam balances premium audio with a wide free top-of-funnel.",
        },
        {
          slug: "northstar-notes",
          rank: 6,
          previousRank: 6,
          highlight: "Northstar's pro conversion remains dependable.",
        },
        {
          slug: "relayfit",
          rank: 7,
          previousRank: 8,
          highlight: "Partner plans keep RelayFit in the upper half.",
        },
        {
          slug: "studio-cast",
          rank: 8,
          previousRank: 7,
          highlight: "Studio Cast monetizes well inside a narrow creator niche.",
        },
        {
          slug: "glyph-ai",
          rank: 9,
          previousRank: 10,
          highlight: "Glyph's early team adoption is starting to show in revenue.",
        },
        {
          slug: "arcade-lane",
          rank: 10,
          previousRank: 9,
          highlight: "Arcade Lane keeps a respectable paid tail.",
        },
      ],
      monthly: [
        {
          slug: "lantern-sleep",
          rank: 1,
          previousRank: 1,
          highlight: "Lantern owns the long-run subscription chart.",
        },
        {
          slug: "harbor-mail",
          rank: 2,
          previousRank: 2,
          highlight: "Harbor remains close thanks to professional inbox teams.",
        },
        {
          slug: "pocket-cloud",
          rank: 3,
          previousRank: 4,
          highlight: "Pocket Cloud converts durable storage needs into durable revenue.",
        },
        {
          slug: "patchboard",
          rank: 4,
          previousRank: 3,
          highlight: "Release teams spend, but not quite at Harbor or Lantern scale.",
        },
        {
          slug: "beam-music",
          rank: 5,
          previousRank: 6,
          highlight: "Beam's premium listeners are compounding month over month.",
        },
        {
          slug: "northstar-notes",
          rank: 6,
          previousRank: 5,
          highlight: "Northstar's paid collaboration seats remain solid.",
        },
        {
          slug: "relayfit",
          rank: 7,
          previousRank: 8,
          highlight: "RelayFit's household plans lift monthly durability.",
        },
        {
          slug: "studio-cast",
          rank: 8,
          previousRank: 9,
          highlight: "Studio Cast monetizes small studios better than most media tools.",
        },
        {
          slug: "glyph-ai",
          rank: 9,
          previousRank: null,
          editorialBadge: "New Revenue Entrant",
          editorialReason:
            "Team account expansion pulled Glyph into the monthly grossing chart for the first time.",
          highlight: "Glyph just entered the long-view revenue ranks.",
        },
        {
          slug: "arcade-lane",
          rank: 10,
          previousRank: 7,
          highlight: "Arcade Lane is still monetizing, but less than earlier bursts.",
        },
      ],
    },
  },
  trending: {
    label: "Trending",
    title: "Momentum charts for what is accelerating now",
    description:
      "Trending ranks react to search momentum, update adoption, editorial attention, and how fast interest is spreading across the catalog.",
    rankingHealth: "Volatile by design, with clear labels when editorial coverage is part of the story.",
    methodology: [
      "Search momentum and update adoption move faster here than in other charts.",
      "Editorial coverage can amplify discovery, but every lift is labeled.",
      "Sustained momentum eventually matters more than a single large spike.",
    ],
    updatedAt: {
      daily: "March 21, 2026 at 09:00 KST",
      weekly: "March 21, 2026 at 07:30 KST",
      monthly: "March 20, 2026 at 18:00 KST",
    },
    entries: {
      daily: [
        {
          slug: "glyph-ai",
          rank: 1,
          previousRank: 3,
          highlight: "Transcript ingestion and export templates created a fresh demand spike.",
        },
        {
          slug: "harbor-mail",
          rank: 2,
          previousRank: 1,
          highlight: "Harbor remains sticky after its newsletter cleanup release.",
        },
        {
          slug: "arcade-lane",
          rank: 3,
          previousRank: 6,
          editorialBadge: "Seasonal Pick",
          editorialReason:
            "The gaming team featured Glass City in this week's arcade roundup.",
          highlight: "Arcade Lane is moving fast after its seasonal content drop.",
        },
        {
          slug: "patchboard",
          rank: 4,
          previousRank: 2,
          highlight: "Engineering teams are actively trialing the latest release inspector.",
        },
        {
          slug: "focus-frame",
          rank: 5,
          previousRank: null,
          editorialBadge: "Editor's Lift",
          editorialReason: "A Today story on calm planning sent new users into the app.",
          highlight: "Focus Frame is new to the daily trending chart.",
        },
        {
          slug: "drift-browser",
          rank: 6,
          previousRank: 4,
          highlight: "Website permission controls are driving renewed privacy interest.",
        },
        {
          slug: "northstar-notes",
          rank: 7,
          previousRank: 5,
          highlight: "Northstar still trends when structured work tools heat up.",
        },
        {
          slug: "pocket-cloud",
          rank: 8,
          previousRank: 7,
          highlight: "Pinned folders and upload speed upgrades are generating fresh searches.",
        },
        {
          slug: "studio-cast",
          rank: 9,
          previousRank: 8,
          highlight: "Studio Cast is benefiting from creator workflow chatter.",
        },
        {
          slug: "lantern-sleep",
          rank: 10,
          previousRank: 9,
          highlight: "Lantern trends steadily, even without a dramatic spike.",
        },
      ],
      weekly: [
        {
          slug: "glyph-ai",
          rank: 1,
          previousRank: 1,
          highlight: "Glyph still leads the conversation across work apps.",
        },
        {
          slug: "harbor-mail",
          rank: 2,
          previousRank: 3,
          highlight: "Harbor turned its update into lasting momentum.",
        },
        {
          slug: "northstar-notes",
          rank: 3,
          previousRank: 2,
          highlight: "Northstar remains one of the steadiest discovery winners.",
        },
        {
          slug: "patchboard",
          rank: 4,
          previousRank: 6,
          highlight: "Patchboard is rising with every small-team ops release.",
        },
        {
          slug: "drift-browser",
          rank: 5,
          previousRank: 4,
          highlight: "Privacy interest keeps Drift in the top half.",
        },
        {
          slug: "focus-frame",
          rank: 6,
          previousRank: 9,
          editorialBadge: "Editor's Lift",
          editorialReason:
            "Editorial coverage turned a quiet timer app into a breakout productivity story.",
          highlight: "Focus Frame is this week's biggest mover.",
        },
        {
          slug: "lantern-sleep",
          rank: 7,
          previousRank: 5,
          highlight: "Lantern stays relevant thanks to routine and recovery demand.",
        },
        {
          slug: "arcade-lane",
          rank: 8,
          previousRank: 7,
          highlight: "Arcade Lane keeps gaming momentum without heavy monetization tricks.",
        },
        {
          slug: "pocket-cloud",
          rank: 9,
          previousRank: 8,
          highlight: "Pocket Cloud is gaining from file-cleanup season.",
        },
        {
          slug: "beam-music",
          rank: 10,
          previousRank: 10,
          highlight: "Beam remains on-chart through editorial listening lists.",
        },
      ],
      monthly: [
        {
          slug: "harbor-mail",
          rank: 1,
          previousRank: 2,
          highlight: "Harbor owned the month through product quality, not just launch noise.",
        },
        {
          slug: "northstar-notes",
          rank: 2,
          previousRank: 1,
          highlight: "Northstar remains a dependable long-horizon discovery engine.",
        },
        {
          slug: "lantern-sleep",
          rank: 3,
          previousRank: 4,
          highlight: "Lantern sustains interest far beyond its initial feature burst.",
        },
        {
          slug: "glyph-ai",
          rank: 4,
          previousRank: null,
          editorialBadge: "Breakout Month",
          editorialReason:
            "Glyph crossed from launch hype into durable team adoption.",
          highlight: "Glyph entered the monthly trending top tier.",
        },
        {
          slug: "pocket-cloud",
          rank: 5,
          previousRank: 6,
          highlight: "Pocket Cloud built steady momentum across both consumer and team storage use.",
        },
        {
          slug: "patchboard",
          rank: 6,
          previousRank: 5,
          highlight: "Patchboard keeps compounding among small engineering teams.",
        },
        {
          slug: "drift-browser",
          rank: 7,
          previousRank: 3,
          highlight: "Privacy spikes cooled, but Drift still has durable momentum.",
        },
        {
          slug: "beam-music",
          rank: 8,
          previousRank: 9,
          highlight: "Editorial audio coverage kept Beam visible for the month.",
        },
        {
          slug: "arcade-lane",
          rank: 9,
          previousRank: 7,
          highlight: "Arcade Lane held onto momentum after the seasonal spike.",
        },
        {
          slug: "focus-frame",
          rank: 10,
          previousRank: 8,
          highlight: "Focus Frame kept enough lift to stay in the top ten.",
        },
      ],
    },
  },
};

const chartPreviousOrderExtras: Partial<
  Record<ChartView, Partial<Record<ChartTimeframe, PreviousChartOrderExtra[]>>>
> = {
  trending: {
    weekly: [
      {
        slug: "studio-cast",
        rank: 5,
      },
    ],
  },
};

export function getChartFeatureChecklist() {
  return [...chartFeatureChecklist];
}

export function getChartViewDefinition(view: ChartView) {
  return structuredClone(chartDefinitions[view]);
}

export function getChartEntries(
  view: ChartView,
  timeframe: ChartTimeframe = "weekly",
) {
  return structuredClone(chartDefinitions[view].entries[timeframe]).sort(
    (left, right) => left.rank - right.rank,
  );
}

export function getCharts(
  view: ChartView,
  timeframe: ChartTimeframe = "weekly",
) {
  return getChartEntries(view, timeframe)
    .map((entry) => getAppBySlug(entry.slug))
    .filter((app): app is EnrichedApp => Boolean(app));
}

export function getChartPreviousOrder(
  view: ChartView,
  timeframe: ChartTimeframe = "weekly",
) {
  const seeds = chartDefinitions[view].entries[timeframe];
  const extras = chartPreviousOrderExtras[view]?.[timeframe] ?? [];
  const order = [
    ...seeds
      .filter((entry) => entry.previousRank !== null)
      .map((entry) => ({
        slug: entry.slug,
        rank: entry.previousRank ?? Number.POSITIVE_INFINITY,
      })),
    ...extras,
  ]
    .sort((left, right) => left.rank - right.rank)
    .filter(
      (entry, index, list) =>
        list.findIndex((candidate) => candidate.slug === entry.slug) === index,
    )
    .map((entry) => entry.slug);

  return structuredClone(order);
}

export function searchStore(query: string) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return {
      apps: [],
      developers: [],
      categories: [],
    };
  }

  return {
    apps: getAllApps().filter((app) => {
      const haystack = [
        app.name,
        app.tagline,
        app.summary,
        app.developer.name,
        app.category.name,
        ...app.searchTags,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalized);
    }),
    developers: developers.filter((developer) =>
      [developer.name, developer.headline, developer.description, ...developer.focus]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    ),
    categories: categories.filter((category) =>
      [category.name, category.summary, ...category.buyingGuide]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    ),
  };
}

export function getLibrarySnapshot() {
  const installed = libraryState.installed
    .map((slug) => getAppBySlug(slug))
    .filter((app): app is EnrichedApp => Boolean(app));
  const updates = libraryState.updates
    .map((item) => ({
      ...item,
      app: getAppBySlug(item.slug),
    }))
    .filter((item): item is QueueItem & { app: EnrichedApp } => Boolean(item.app));
  const queue = libraryState.queue
    .map((item) => ({
      ...item,
      app: getAppBySlug(item.slug),
    }))
    .filter((item): item is QueueItem & { app: EnrichedApp } => Boolean(item.app));
  const wishlist = libraryState.wishlist
    .map((slug) => getAppBySlug(slug))
    .filter((app): app is EnrichedApp => Boolean(app));

  return {
    installed,
    updates,
    queue,
    wishlist,
    activity: libraryState.activity,
    queueAverage: averageProgress(queue.map((item) => item.progress)),
  };
}

export function getAccountSnapshot() {
  return {
    ...accountState,
    activeSubscriptions: [
      getAppBySlug("lantern-sleep"),
      getAppBySlug("beam-music"),
      getAppBySlug("pocket-cloud"),
    ].filter((app): app is EnrichedApp => Boolean(app)),
  };
}
