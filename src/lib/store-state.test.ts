import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("persistent store state", () => {
  let stateFilePath = "";

  beforeEach(() => {
    stateFilePath = path.join(
      os.tmpdir(),
      `openstore-state-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}.json`,
    );
    process.env.OPENSTORE_STATE_FILE = stateFilePath;
    vi.resetModules();
  });

  afterEach(() => {
    delete process.env.OPENSTORE_STATE_FILE;
    fs.rmSync(stateFilePath, { force: true });
    fs.rmSync(`${stateFilePath}.bak`, { force: true });
    fs.rmSync(`${stateFilePath}.lock`, { force: true });
    vi.resetModules();
  });

  it("restores the backup snapshot when the primary state file is corrupted", async () => {
    const storeService = await import("@/lib/store-service");
    const storeState = await import("@/lib/store-state");

    storeService.resetStoreServiceState();
    storeService.reportApp({
      appSlug: "patchboard",
      reason: "Backup recovery",
      detail: "Ensure invalid primary JSON does not wipe accumulated reports.",
    });

    expect(storeService.getOperationsDashboard().summary.openReports).toBe(1);

    fs.writeFileSync(storeState.getPersistentStoreStateFilePath(), "{ invalid json");

    expect(storeService.getOperationsDashboard().summary.openReports).toBe(1);
  });
});
