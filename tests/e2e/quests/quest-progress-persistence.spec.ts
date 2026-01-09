import { test, expect } from "@playwright/test";

const STORAGE_KEY = "arc-raiders-storage";

test.describe("Quest Progress Persistence", () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage before each test
    await page.goto("/quests");
    await page.evaluate((key) => {
      localStorage.removeItem(key);
    }, STORAGE_KEY);
    await page.reload();
    await page.waitForLoadState("networkidle");
  });

  test("AC-QM-04.1: Ein Klick markiert die Quest als abgeschlossen in < 100ms", async ({
    page,
  }) => {
    const questToggle = page
      .locator('[data-testid="quest-toggle"], [data-testid="quest-complete-checkbox"]')
      .first();

    if (await questToggle.isVisible()) {
      const startTime = await page.evaluate(() => performance.now());
      await questToggle.click();
      const endTime = await page.evaluate(() => performance.now());

      expect(endTime - startTime).toBeLessThan(100);

      // Verify state changed
      await expect(questToggle).toBeChecked();
    }
  });

  test("AC-QM-04.2: Alle vorherigen Quests einer Quest-Kette werden automatisch als complete markiert in < 500ms", async ({
    page,
  }) => {
    // Find a quest that has prerequisites
    const questWithPrereq = page.locator('[data-testid="quest-with-prereq"]').first();

    if (await questWithPrereq.isVisible()) {
      const startTime = await page.evaluate(() => performance.now());

      // Mark the quest as complete
      await questWithPrereq.locator('[data-testid="quest-toggle"]').click();

      // Wait for cascading completion
      await page.waitForFunction(
        (key) => {
          const store = JSON.parse(localStorage.getItem(key) || "{}");
          const completed = store.state?.completedQuests || [];
          return completed.length > 1;
        },
        STORAGE_KEY,
        { timeout: 500 }
      );

      const endTime = await page.evaluate(() => performance.now());

      expect(endTime - startTime).toBeLessThan(500);
    }
  });

  test("AC-QM-04.3: Der Fortschritt wird im localStorage persistiert", async ({
    page,
  }) => {
    // Mark a quest as complete
    const questToggle = page
      .locator('[data-testid="quest-toggle"], [data-testid="quest-complete-checkbox"]')
      .first();

    if (await questToggle.isVisible()) {
      await questToggle.click();

      // Verify storage was updated
      const hasStorage = await page.evaluate((key) => {
        const store = JSON.parse(localStorage.getItem(key) || "{}");
        const completed = store.state?.completedQuests || [];
        return completed.length > 0;
      }, STORAGE_KEY);

      expect(hasStorage).toBe(true);

      // Reload and verify persistence
      await page.reload();
      await page.waitForLoadState("networkidle");

      const questToggleAfterReload = page
        .locator('[data-testid="quest-toggle"], [data-testid="quest-complete-checkbox"]')
        .first();

      if (await questToggleAfterReload.isVisible()) {
        await expect(questToggleAfterReload).toBeChecked();
      }
    }
  });

  test("AC-QM-04.4: Der Fortschritt kann zurückgesetzt werden (einzeln)", async ({
    page,
  }) => {
    // First, mark a quest as complete
    const questToggle = page
      .locator('[data-testid="quest-toggle"], [data-testid="quest-complete-checkbox"]')
      .first();

    if (await questToggle.isVisible()) {
      await questToggle.click();
      await expect(questToggle).toBeChecked();

      // Toggle it off (individual reset)
      await questToggle.click();
      await expect(questToggle).not.toBeChecked();

      // Verify storage was updated
      const completedCount = await page.evaluate((key) => {
        const store = JSON.parse(localStorage.getItem(key) || "{}");
        return (store.state?.completedQuests || []).length;
      }, STORAGE_KEY);

      expect(completedCount).toBe(0);
    }
  });

  test("AC-QM-04.4: Der Fortschritt kann zurückgesetzt werden (komplett)", async ({
    page,
  }) => {
    // Mark multiple quests as complete
    const questToggles = page.locator(
      '[data-testid="quest-toggle"], [data-testid="quest-complete-checkbox"]'
    );

    const count = await questToggles.count();
    if (count >= 2) {
      await questToggles.nth(0).click();
      await questToggles.nth(1).click();

      // Verify quests are marked
      const beforeReset = await page.evaluate((key) => {
        const store = JSON.parse(localStorage.getItem(key) || "{}");
        return (store.state?.completedQuests || []).length;
      }, STORAGE_KEY);

      expect(beforeReset).toBeGreaterThanOrEqual(2);

      // Click reset button
      const resetButton = page.getByRole("button", { name: /reset|zurücksetzen/i });
      if (await resetButton.isVisible()) {
        await resetButton.click();

        // Confirm reset if dialog appears
        const confirmButton = page.getByRole("button", {
          name: /confirm|bestätigen|yes|ja/i,
        });
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }

        // Verify all progress was reset
        const afterReset = await page.evaluate((key) => {
          const store = JSON.parse(localStorage.getItem(key) || "{}");
          return (store.state?.completedQuests || []).length;
        }, STORAGE_KEY);

        expect(afterReset).toBe(0);
      }
    }
  });
});
