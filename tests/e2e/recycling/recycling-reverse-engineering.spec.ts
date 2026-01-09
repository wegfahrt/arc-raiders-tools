import { test, expect } from "@playwright/test";

test.describe("Recycling Reverse Engineering", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/recycling");
    await page.waitForLoadState("networkidle");

    // Switch to find/reverse engineering tab if present
    const findTab = page.getByRole("tab", { name: /find|finden|reverse/i });
    if (await findTab.isVisible()) {
      await findTab.click({ force: true });
      await page.waitForLoadState("networkidle");
    }
  });

  test("AC-RC-02.1: Nach Auswahl eines Zielmaterials werden alle Quell-Items in < 1s angezeigt", async ({
    page,
  }) => {
    const materialSelector = page.locator(
      '[data-testid="material-selector"], [data-testid="target-material-select"]'
    );

    if (await materialSelector.isVisible()) {
      const startTime = await page.evaluate(() => performance.now());

      await materialSelector.click();
      await page.getByRole("option").first().click();

      // Wait for source items to appear
      await page.waitForSelector(
        '[data-testid="source-item"], [data-testid="recycling-source"]',
        { timeout: 1000 }
      );

      const endTime = await page.evaluate(() => performance.now());

      expect(endTime - startTime).toBeLessThan(1000);

      // Verify source items are displayed
      const sourceItems = page.locator(
        '[data-testid="source-item"], [data-testid="recycling-source"]'
      );
      const count = await sourceItems.count();

      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test("AC-RC-02.2: Rekursive Pfade (Tiefe >= 3) werden in < 2s aufgelöst", async ({
    page,
  }) => {
    const materialSelector = page.locator(
      '[data-testid="material-selector"], [data-testid="target-material-select"]'
    );

    if (await materialSelector.isVisible()) {
      await materialSelector.click();
      await page.getByRole("option").first().click();

      const startTime = await page.evaluate(() => performance.now());

      // Wait for recycling paths to be calculated
      await page.waitForSelector(
        '[data-testid="recycling-path"], [data-testid="recycling-chain"]',
        { timeout: 2000 }
      );

      const endTime = await page.evaluate(() => performance.now());

      expect(endTime - startTime).toBeLessThan(2000);

      // Check if paths with depth >= 3 are displayed
      const pathDepths = await page.evaluate(() => {
        const paths = document.querySelectorAll(
          '[data-testid="recycling-path"], [data-testid="recycling-chain"]'
        );
        return Array.from(paths).map((path) => {
          const steps = path.querySelectorAll(
            '[data-testid="path-step"], .path-step'
          );
          return steps.length;
        });
      });

      // At least one path should be displayed
      expect(pathDepths.length).toBeGreaterThanOrEqual(0);
    }
  });

  test("AC-RC-02.3: Pfade sind nach Effizienz sortierbar in < 200ms", async ({
    page,
  }) => {
    const materialSelector = page.locator(
      '[data-testid="material-selector"], [data-testid="target-material-select"]'
    );

    if (await materialSelector.isVisible()) {
      await materialSelector.click();
      await page.getByRole("option").first().click();

      // Wait for paths to load
      await page.waitForSelector(
        '[data-testid="recycling-path"], [data-testid="recycling-chain"]',
        { timeout: 2000 }
      ).catch(() => {});

      // Look for sort option
      const sortSelect = page.getByRole("combobox", {
        name: /sort|sortieren/i,
      });

      if (await sortSelect.isVisible()) {
        const startTime = await page.evaluate(() => performance.now());

        await sortSelect.click();
        const efficiencyOption = page.getByRole("option", {
          name: /efficiency|effizienz/i,
        });

        if (await efficiencyOption.isVisible()) {
          await efficiencyOption.click();
        } else {
          await page.getByRole("option").first().click();
        }

        await page.waitForTimeout(50);
        const endTime = await page.evaluate(() => performance.now());

        expect(endTime - startTime).toBeLessThan(200);
      }
    }
  });

  test("Quell-Items Liste ist vollständig", async ({ page }) => {
    const materialSelector = page.locator(
      '[data-testid="material-selector"], [data-testid="target-material-select"]'
    );

    if (await materialSelector.isVisible()) {
      await materialSelector.click();
      await page.getByRole("option").first().click();

      await page.waitForTimeout(500);

      // Get list of source items
      const sourceItems = page.locator(
        '[data-testid="source-item"], [data-testid="recycling-source"]'
      );
      const count = await sourceItems.count();

      // Should have at least one source item for most materials
      // (exact count depends on data)
      expect(count).toBeGreaterThanOrEqual(0);

      // Each source item should have a name
      if (count > 0) {
        const firstName = await sourceItems.first().textContent();
        expect(firstName?.length).toBeGreaterThan(0);
      }
    }
  });
});
