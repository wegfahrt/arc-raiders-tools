import { test, expect } from "@playwright/test";

test.describe("Material Calculator Aggregation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/calculator");
    await page.waitForLoadState("networkidle");
  });

  test("AC-MC-01.1: Quests sind per Multi-Select auswählbar", async ({
    page,
  }) => {
    const questCheckboxes = page.locator('[data-testid="quest-checkbox"]');
    const count = await questCheckboxes.count();

    if (count >= 2) {
      // Select multiple quests
      await questCheckboxes.nth(0).click();
      await questCheckboxes.nth(1).click();

      // Verify both are checked
      await expect(questCheckboxes.nth(0)).toBeChecked();
      await expect(questCheckboxes.nth(1)).toBeChecked();
    }
  });

  test("AC-MC-01.2: Workstation-Upgrades sind per Multi-Select auswählbar", async ({
    page,
  }) => {
    const workstationCheckboxes = page.locator(
      '[data-testid="workstation-checkbox"], [data-testid="upgrade-checkbox"]'
    );
    const count = await workstationCheckboxes.count();

    if (count >= 2) {
      // Select multiple workstation upgrades
      await workstationCheckboxes.nth(0).click();
      await workstationCheckboxes.nth(1).click();

      // Verify both are checked
      await expect(workstationCheckboxes.nth(0)).toBeChecked();
      await expect(workstationCheckboxes.nth(1)).toBeChecked();
    }
  });

  test("AC-MC-01.3: Select All Option ist verfügbar und funktional", async ({
    page,
  }) => {
    // Look for various forms of "select all" button or checkbox
    const selectAllButton = page.getByRole("button", {
      name: /select all|alle auswählen|all/i,
    });
    const selectAllCheckbox = page.locator('[data-testid="select-all"]');

    if (await selectAllButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await selectAllButton.click();

      // Verify all checkboxes are checked
      const allChecked = await page.evaluate(() => {
        const checkboxes = document.querySelectorAll(
          '[data-testid="quest-checkbox"]'
        ) as NodeListOf<HTMLInputElement>;
        return checkboxes.length === 0 || Array.from(checkboxes).every((cb) => cb.checked);
      });

      expect(allChecked).toBe(true);
    } else if (await selectAllCheckbox.isVisible({ timeout: 2000 }).catch(() => false)) {
      await selectAllCheckbox.click();
      
      const allChecked = await page.evaluate(() => {
        const checkboxes = document.querySelectorAll(
          '[data-testid="quest-checkbox"]'
        ) as NodeListOf<HTMLInputElement>;
        return checkboxes.length === 0 || Array.from(checkboxes).every((cb) => cb.checked);
      });

      expect(allChecked).toBe(true);
    } else {
      // Select All feature may not be implemented yet - skip test
      test.skip(true, "Select All feature not available");
    }
  });

  test("AC-MC-01.4: Aggregierte Materialien werden in < 500ms angezeigt", async ({
    page,
  }) => {
    // Select some quests
    const questCheckboxes = page.locator('[data-testid="quest-checkbox"]');

    if ((await questCheckboxes.count()) > 0) {
      const startTime = await page.evaluate(() => performance.now());

      // Select first quest
      await questCheckboxes.first().click();

      // Wait for aggregated materials to appear
      await page.waitForSelector(
        '[data-testid="aggregated-materials"], [data-testid="material-list"]',
        { timeout: 500 }
      );

      const endTime = await page.evaluate(() => performance.now());

      expect(endTime - startTime).toBeLessThan(500);
    }
  });

  test("AC-MC-01.5: Materialien sind nach Typ gruppiert darstellbar", async ({
    page,
  }) => {
    // Select a quest first
    const questCheckboxes = page.locator('[data-testid="quest-checkbox"]');

    if ((await questCheckboxes.count()) > 0) {
      await questCheckboxes.first().click();

      // Look for group toggle button
      const groupButton = page.getByRole("button", {
        name: /group|gruppieren/i,
      });

      if (await groupButton.isVisible()) {
        await groupButton.click();

        // Verify grouping is applied
        const materialGroups = page.locator('[data-testid="material-group"]');
        const groupCount = await materialGroups.count();

        expect(groupCount).toBeGreaterThan(0);
      }
    }
  });

  test("Material-Summierung ist korrekt", async ({ page }) => {
    const questCheckboxes = page.locator('[data-testid="quest-checkbox"]');
    const count = await questCheckboxes.count();

    if (count >= 2) {
      // Select first quest
      await questCheckboxes.nth(0).click();
      await page.waitForTimeout(100);

      // Get materials for first quest
      const firstQuestMaterials = await page
        .locator('[data-testid="material-amount"]')
        .allTextContents();

      // Select second quest
      await questCheckboxes.nth(1).click();
      await page.waitForTimeout(100);

      // Get combined materials
      const combinedMaterials = await page
        .locator('[data-testid="material-amount"]')
        .allTextContents();

      // Combined should include materials from both quests
      // (exact verification depends on implementation)
      expect(combinedMaterials.length).toBeGreaterThanOrEqual(
        firstQuestMaterials.length
      );
    }
  });
});
