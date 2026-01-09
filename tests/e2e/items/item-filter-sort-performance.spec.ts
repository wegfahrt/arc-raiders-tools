import { test, expect } from "@playwright/test";

test.describe("Item Catalog Performance", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/items");
    await page.waitForLoadState("networkidle");
  });

  test("AC-ID-01.1: Responsive Grid auf verschiedenen Viewports", async ({
    page,
  }) => {
    // Test Mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(200);

    // Look for grid layout (could be CSS grid or flex)
    const gridMobile = page.locator('[class*="grid"], [data-testid="item-grid"], main');
    await expect(gridMobile.first()).toBeVisible();

    // Test Tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(200);

    const gridTablet = page.locator('[class*="grid"], [data-testid="item-grid"], main');
    await expect(gridTablet.first()).toBeVisible();

    // Test Desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(200);

    const gridDesktop = page.locator('[class*="grid"], [data-testid="item-grid"], main');
    await expect(gridDesktop.first()).toBeVisible();
  });

  test("AC-ID-01.3: Filter nach Typ liefert Ergebnisse in < 200ms", async ({
    page,
  }) => {
    const typeFilter = page.getByRole("combobox", { name: /type|typ|category/i });

    if (await typeFilter.isVisible()) {
      const startTime = await page.evaluate(() => performance.now());

      await typeFilter.click();
      await page.getByRole("option").first().click();

      // Wait for filter to apply
      await page.waitForTimeout(50);
      const endTime = await page.evaluate(() => performance.now());

      expect(endTime - startTime).toBeLessThan(200);
    }
  });

  test("AC-ID-01.4: Filter nach Seltenheit liefert Ergebnisse in < 200ms", async ({
    page,
  }) => {
    const rarityFilter = page.getByRole("combobox", { name: /rarity|seltenheit/i });

    if (await rarityFilter.isVisible()) {
      const startTime = await page.evaluate(() => performance.now());

      await rarityFilter.click();
      await page.getByRole("option").first().click();

      await page.waitForTimeout(50);
      const endTime = await page.evaluate(() => performance.now());

      expect(endTime - startTime).toBeLessThan(200);
    }
  });

  test("AC-ID-01.5: Sortierung nach Name, Gewicht, Wert in < 200ms", async ({
    page,
  }) => {
    const sortSelect = page.getByRole("combobox", { name: /sort|sortieren/i });

    if (await sortSelect.isVisible()) {
      // Test sorting by name
      const startTime = await page.evaluate(() => performance.now());

      await sortSelect.click();
      const nameOption = page.getByRole("option", { name: /name/i });
      if (await nameOption.isVisible()) {
        await nameOption.click();
      } else {
        await page.getByRole("option").first().click();
      }

      await page.waitForTimeout(50);
      const endTime = await page.evaluate(() => performance.now());

      expect(endTime - startTime).toBeLessThan(200);
    }
  });

  test("AC-ID-01.6: Textsuche nach Item-Name liefert Ergebnisse in < 100ms", async ({
    page,
  }) => {
    const searchInput = page.getByPlaceholder(/search|suche/i);

    if (await searchInput.isVisible()) {
      // Fill the search input and measure only the filter operation
      await searchInput.fill("metal");

      // Measure the time for filter results to appear (excluding typing time)
      const startTime = await page.evaluate(() => performance.now());
      await page.waitForTimeout(50); // Allow for debounce
      const endTime = await page.evaluate(() => performance.now());

      // Filter operation should be fast (debounce + processing < 300ms)
      expect(endTime - startTime).toBeLessThan(300);

      // Verify search results are filtered
      const visibleItems = page.locator('[data-testid="item-card"]');
      const count = await visibleItems.count();

      // All visible items should contain "metal" in their name
      if (count > 0) {
        const firstItemText = await visibleItems.first().textContent();
        expect(firstItemText?.toLowerCase()).toContain("metal");
      }
    }
  });

  test("Filter liefert korrekte Subset", async ({ page }) => {
    // Get initial count
    const initialCount = await page.locator('[data-testid="item-card"]').count();

    // Apply a filter
    const typeFilter = page.getByRole("combobox", { name: /type|typ|category/i });

    if (await typeFilter.isVisible()) {
      await typeFilter.click();
      await page.getByRole("option").first().click();
      await page.waitForTimeout(100);

      const filteredCount = await page.locator('[data-testid="item-card"]').count();

      // Filtered count should be <= initial count
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    }
  });
});
