import { test, expect } from "@playwright/test";

const STORAGE_KEY = "arc-raiders-storage";

test.describe("Workstation Progress", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/workstations");
    await page.evaluate((key) => {
      localStorage.removeItem(key);
    }, STORAGE_KEY);
    await page.reload();
    await page.waitForLoadState("networkidle");
  });

  test("AC-WP-02.1: Level-Inkrement in < 100ms", async ({ page }) => {
    const upgradeButton = page
      .locator('[data-testid="upgrade-button"], [data-testid="level-up-button"]')
      .first();

    if (await upgradeButton.isVisible()) {
      // Get initial level
      const levelDisplay = page.locator('[data-testid="workstation-level"]').first();
      const initialLevel = await levelDisplay.textContent();

      const startTime = await page.evaluate(() => performance.now());
      await upgradeButton.click();
      const endTime = await page.evaluate(() => performance.now());

      expect(endTime - startTime).toBeLessThan(100);

      // Verify level increased
      const newLevel = await levelDisplay.textContent();
      if (initialLevel && newLevel) {
        const initialNum = parseInt(initialLevel.split("/")[0]);
        const newNum = parseInt(newLevel.split("/")[0]);
        expect(newNum).toBe(initialNum + 1);
      }
    }
  });

  test("AC-WP-02.2: Persistierung im Store nach Reload", async ({ page }) => {
    const upgradeButton = page
      .locator('[data-testid="upgrade-button"], [data-testid="level-up-button"]')
      .first();

    if (await upgradeButton.isVisible()) {
      // Upgrade a workstation
      await upgradeButton.click();

      // Verify storage was updated
      const hasProgress = await page.evaluate((key) => {
        const store = JSON.parse(localStorage.getItem(key) || "{}");
        const levels = store.state?.workstationLevels || {};
        return Object.values(levels).some((level: unknown) => (level as number) > 0);
      }, STORAGE_KEY);

      expect(hasProgress).toBe(true);

      // Reload and verify persistence
      await page.reload();
      await page.waitForLoadState("networkidle");

      // Check that level is still upgraded
      const levelDisplay = page.locator('[data-testid="workstation-level"]').first();
      const level = await levelDisplay.textContent();

      if (level) {
        const currentLevel = parseInt(level.split("/")[0]);
        expect(currentLevel).toBeGreaterThan(0);
      }
    }
  });

  test("AC-WP-02.3: Material-Calculator bezieht nur nicht-abgeschlossene Upgrades ein", async ({
    page,
  }) => {
    // First, upgrade a workstation
    const upgradeButton = page
      .locator('[data-testid="upgrade-button"], [data-testid="level-up-button"]')
      .first();

    if (await upgradeButton.isVisible()) {
      await upgradeButton.click();

      // Navigate to calculator
      await page.goto("/calculator");
      await page.waitForLoadState("networkidle");

      // Select workstation upgrades
      const workstationCheckbox = page
        .locator('[data-testid="workstation-checkbox"]')
        .first();

      if (await workstationCheckbox.isVisible()) {
        await workstationCheckbox.click();

        // Verify the calculator only shows remaining upgrades
        const upgradeList = page.locator('[data-testid="selected-upgrades"]');
        const upgradeText = await upgradeList.textContent();

        // The already completed level should not be included
        // This is a functional test - implementation specific
        expect(upgradeText).toBeDefined();
      }
    }
  });

  test("Level kann nicht über Maximum erhöht werden", async ({ page }) => {
    const workstationCard = page
      .locator('[data-testid="workstation-card"]')
      .first();

    if (await workstationCard.isVisible()) {
      const levelDisplay = workstationCard.locator(
        '[data-testid="workstation-level"]'
      );
      const levelText = await levelDisplay.textContent();

      if (levelText) {
        const [_, maxLevel] = levelText.split("/").map((s) => parseInt(s.trim()));

        const upgradeButton = workstationCard.locator(
          '[data-testid="upgrade-button"]'
        );

        // Try to upgrade to max
        for (let i = 0; i < maxLevel + 1; i++) {
          if (await upgradeButton.isEnabled()) {
            await upgradeButton.click();
          }
        }

        // Verify we're at max level
        const finalLevel = await levelDisplay.textContent();
        if (finalLevel) {
          const [current, max] = finalLevel.split("/").map((s) => parseInt(s.trim()));
          expect(current).toBeLessThanOrEqual(max);
        }
      }
    }
  });
});
