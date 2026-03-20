import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import type {
  ActivityItem,
  DeviceRecord,
  NotificationPreference,
  ReviewRecord,
} from "@/lib/store-data";
import { getAccountSnapshot, getLibrarySnapshot } from "@/lib/store-data";
import type {
  CheckoutPlatform,
  CommerceLane,
  PaymentMethodType,
  PaymentProvider,
  ProductType,
} from "@/server/commerce/contracts/registry";

export type QueueRuntimeItem = {
  slug: string;
  progress: number;
  eta: string;
  paused?: boolean;
};

export type PurchaseHistoryEntry = {
  slug: string;
  purchasedAt: string;
  pricePaid: string;
};

export type HiddenPurchaseEntry = {
  slug: string;
  hiddenAt: string;
};

type ReportStatus = "OPEN" | "RESOLVED";

export type AppReport = {
  id: string;
  appSlug: string;
  reason: string;
  detail?: string;
  submittedAt: string;
  status: ReportStatus;
  resolvedAt?: string;
  resolutionNote?: string;
};

export type DeveloperReport = {
  id: string;
  developerSlug: string;
  reason: string;
  detail?: string;
  submittedAt: string;
  status: ReportStatus;
  resolvedAt?: string;
  resolutionNote?: string;
};

export type CheckoutOrderStatus =
  | "PENDING_CONFIRMATION"
  | "SUCCEEDED"
  | "CANCELED";

export type CheckoutOrder = {
  id: string;
  appSlug: string;
  developerSlug: string;
  productType: ProductType;
  countryCode: string;
  currencyCode: string;
  platform: CheckoutPlatform;
  lane: CommerceLane;
  provider: PaymentProvider;
  merchantEntityCode: string;
  merchantAccountKey: string;
  pspRouteKey: string;
  consumerContractVersion: string;
  developerContractVersion: string;
  paymentMethods: PaymentMethodType[];
  selectedPaymentMethod: PaymentMethodType;
  amountLabel: string;
  warnings: string[];
  status: CheckoutOrderStatus;
  createdAt: string;
  updatedAt: string;
};

export type StoreSessionState = {
  version: 1;
  installed: string[];
  updates: QueueRuntimeItem[];
  queue: QueueRuntimeItem[];
  wishlist: string[];
  activity: ActivityItem[];
  notifications: NotificationPreference[];
  devices: DeviceRecord[];
  purchaseHistory: PurchaseHistoryEntry[];
  hiddenPurchases: HiddenPurchaseEntry[];
  recentSearches: string[];
  reviewsByApp: Record<string, ReviewRecord[]>;
  appReports: AppReport[];
  developerReports: DeveloperReport[];
  activeSubscriptionSlugs: string[];
  checkoutOrders: CheckoutOrder[];
};

const defaultStateFile =
  process.env.OPENSTORE_STATE_FILE ??
  (process.env.NODE_ENV === "test"
    ? path.join(os.tmpdir(), "openstore-state.json")
    : path.join(/* turbopackIgnore: true */ process.cwd(), ".openstore", "state.json"));

export function createInitialStoreState(
  reviewsByApp: Record<string, ReviewRecord[]>,
): StoreSessionState {
  const library = getLibrarySnapshot();
  const account = getAccountSnapshot();

  return structuredClone({
    version: 1,
    installed: library.installed.map((app) => app.slug),
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
    wishlist: library.wishlist.map((app) => app.slug),
    activity: library.activity,
    notifications: account.notifications,
    devices: account.devices,
    purchaseHistory: [
      {
        slug: "arcade-lane",
        purchasedAt: "February 4, 2026",
        pricePaid: "$3.99",
      },
      {
        slug: "patchboard",
        purchasedAt: "January 28, 2026",
        pricePaid: "$6.99",
      },
      {
        slug: "studio-cast",
        purchasedAt: "January 12, 2026",
        pricePaid: "$8.99",
      },
    ],
    hiddenPurchases: [
      {
        slug: "studio-cast",
        hiddenAt: "February 20, 2026",
      },
    ],
    recentSearches: ["privacy", "sleep", "remote work", "music", "ai"],
    reviewsByApp,
    appReports: [],
    developerReports: [],
    activeSubscriptionSlugs: account.activeSubscriptions.map((app) => app.slug),
    checkoutOrders: [],
  });
}

function ensureStateFile(initialState: StoreSessionState) {
  const stateDir = path.dirname(defaultStateFile);
  fs.mkdirSync(stateDir, { recursive: true });

  if (!fs.existsSync(defaultStateFile)) {
    fs.writeFileSync(defaultStateFile, JSON.stringify(initialState, null, 2));
  }
}

export function readStoreState(initialState: StoreSessionState) {
  ensureStateFile(initialState);

  try {
    const raw = fs.readFileSync(defaultStateFile, "utf8");
    const parsed = JSON.parse(raw) as StoreSessionState;

    if (parsed.version !== 1) {
      throw new Error("Unsupported store state version.");
    }

    return parsed;
  } catch {
    fs.writeFileSync(defaultStateFile, JSON.stringify(initialState, null, 2));
    return structuredClone(initialState);
  }
}

export function updateStoreState<T>(
  initialState: StoreSessionState,
  updater: (state: StoreSessionState) => T,
) {
  const state = readStoreState(initialState);
  const result = updater(state);
  fs.writeFileSync(defaultStateFile, JSON.stringify(state, null, 2));
  return result;
}

export function resetPersistentStoreState(initialState: StoreSessionState) {
  const stateDir = path.dirname(defaultStateFile);
  fs.mkdirSync(stateDir, { recursive: true });
  fs.writeFileSync(defaultStateFile, JSON.stringify(initialState, null, 2));
}
