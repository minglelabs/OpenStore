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
  amountValue?: number;
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
const backupStateFile = `${defaultStateFile}.bak`;
const stateLockFile = `${defaultStateFile}.lock`;
const lockSleepState = new Int32Array(new SharedArrayBuffer(4));
const lockWaitMs = 25;
const lockTimeoutMs = 5_000;
const staleLockMs = 15_000;

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

  if (!fs.existsSync(defaultStateFile) && !fs.existsSync(backupStateFile)) {
    persistStateSnapshot(initialState);
  }
}

function isStateSnapshot(value: unknown): value is StoreSessionState {
  return Boolean(
    value &&
      typeof value === "object" &&
      "version" in value &&
      (value as StoreSessionState).version === 1,
  );
}

function loadStateSnapshot(filePath: string) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;

    if (!isStateSnapshot(parsed)) {
      throw new Error("Unsupported store state version.");
    }

    return parsed;
  } catch {
    return null;
  }
}

function atomicWriteFile(targetFile: string, contents: string) {
  const tempFile = `${targetFile}.${process.pid}.${Date.now()}.tmp`;
  let fileHandle: number | null = null;

  try {
    fileHandle = fs.openSync(tempFile, "w");
    fs.writeFileSync(fileHandle, contents, "utf8");
    fs.fsyncSync(fileHandle);
    fs.closeSync(fileHandle);
    fileHandle = null;
    fs.renameSync(tempFile, targetFile);
  } catch (error) {
    if (fileHandle !== null) {
      fs.closeSync(fileHandle);
    }

    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }

    throw error;
  }
}

function persistStateSnapshot(state: StoreSessionState) {
  const payload = JSON.stringify(state, null, 2);
  atomicWriteFile(defaultStateFile, payload);
  atomicWriteFile(backupStateFile, payload);
}

function waitForLock() {
  Atomics.wait(lockSleepState, 0, 0, lockWaitMs);
}

function releaseStateLock(lockHandle: number) {
  fs.closeSync(lockHandle);

  try {
    fs.unlinkSync(stateLockFile);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}

function acquireStateLock() {
  const deadline = Date.now() + lockTimeoutMs;
  fs.mkdirSync(path.dirname(defaultStateFile), { recursive: true });

  while (Date.now() < deadline) {
    try {
      const lockHandle = fs.openSync(stateLockFile, "wx");
      fs.writeFileSync(lockHandle, String(process.pid));
      return lockHandle;
    } catch (error) {
      const lockError = error as NodeJS.ErrnoException;

      if (lockError.code !== "EEXIST") {
        throw error;
      }

      try {
        const stats = fs.statSync(stateLockFile);

        if (Date.now() - stats.mtimeMs > staleLockMs) {
          fs.unlinkSync(stateLockFile);
          continue;
        }
      } catch (statError) {
        if ((statError as NodeJS.ErrnoException).code !== "ENOENT") {
          throw statError;
        }
      }

      waitForLock();
    }
  }

  throw new Error("Timed out while waiting for the persistent store state lock.");
}

function withStateLock<T>(callback: () => T) {
  const lockHandle = acquireStateLock();

  try {
    return callback();
  } finally {
    releaseStateLock(lockHandle);
  }
}

function readStoreStateSnapshot(initialState: StoreSessionState) {
  ensureStateFile(initialState);

  const primaryState = loadStateSnapshot(defaultStateFile);

  if (primaryState) {
    return primaryState;
  }

  const backupState = loadStateSnapshot(backupStateFile);

  if (backupState) {
    persistStateSnapshot(backupState);
    return backupState;
  }

  const fallbackState = structuredClone(initialState);
  persistStateSnapshot(fallbackState);
  return fallbackState;
}

export function readStoreState(initialState: StoreSessionState) {
  return readStoreStateSnapshot(initialState);
}

export function updateStoreState<T>(
  initialState: StoreSessionState,
  updater: (state: StoreSessionState) => T,
) {
  return withStateLock(() => {
    const state = readStoreStateSnapshot(initialState);
    const result = updater(state);
    persistStateSnapshot(state);
    return result;
  });
}

export function resetPersistentStoreState(initialState: StoreSessionState) {
  withStateLock(() => {
    const stateDir = path.dirname(defaultStateFile);
    fs.mkdirSync(stateDir, { recursive: true });
    persistStateSnapshot(initialState);
  });
}

export function getPersistentStoreStateFilePath() {
  return defaultStateFile;
}
