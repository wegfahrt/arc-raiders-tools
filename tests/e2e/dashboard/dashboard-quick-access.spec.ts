import { test, expect } from "@playwright/test";

test.describe("Dashboard Quick Access", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("AC-DB-02.1: Maximal 6 aktive Quest-Cards werden angezeigt", async ({
    page,
  }) => {
    const activeQuestCards = page.locator(
      '[data-testid="active-quest-card"], [data-testid="active-mission-card"]'
    );

    const count = await activeQuestCards.count();

    // Should show at most 6 active quests
    expect(count).toBeLessThanOrEqual(6);
  });

  test("AC-DB-02.2: Klick auf Quest-Card navigiert zur Detail-Seite", async ({
    page,
  }) => {
    const questCard = page
      .locator(
        '[data-testid="active-quest-card"], [data-testid="active-mission-card"]'
      )
      .first();

    if (await questCard.isVisible()) {
      await questCard.click();

      // Should navigate to quests page or quest detail
      await expect(page).toHaveURL(/\/quests/);
    }
  });

  test("AC-DB-02.3: Aktuelle Workstation-Upgrades zeigen nächstes Level + Requirements", async ({
    page,
  }) => {
    const workstationSection = page.locator(
      '[data-testid="workstation-upgrades"], [data-testid="current-upgrades"]'
    );

    if (await workstationSection.isVisible()) {
      // Should show level information
      const levelInfo = workstationSection.locator(
        '[data-testid="next-level"], [data-testid="upgrade-level"]'
      );

      if ((await levelInfo.count()) > 0) {
        const text = await levelInfo.first().textContent();
        // Should have level number
        expect(text).toMatch(/\d+/);
      }

      // Should show requirements
      const requirements = workstationSection.locator(
        '[data-testid="requirements"], [data-testid="upgrade-requirements"]'
      );

      if ((await requirements.count()) > 0) {
        await expect(requirements.first()).toBeVisible();
      }
    }
  });

  test("AC-DB-02.4: Wishlist-Items werden mit fehlender Menge angezeigt", async ({
    page,
  }) => {
    const wishlistSection = page.locator(
      '[data-testid="wishlist-section"], [data-testid="material-shortages"]'
    );

    if (await wishlistSection.isVisible()) {
      // Should show items with quantities
      const wishlistItems = wishlistSection.locator(
        '[data-testid="wishlist-item"], [data-testid="shortage-item"]'
      );

      if ((await wishlistItems.count()) > 0) {
        const firstItem = wishlistItems.first();

        // Should have quantity display (owned vs required)
        const quantityDisplay = firstItem.locator(
          '[data-testid="quantity"], [data-testid="amount"]'
        );

        if (await quantityDisplay.isVisible()) {
          const text = await quantityDisplay.textContent();
          // Should have number
          expect(text).toMatch(/\d+/);
        }
      }
    }
  });

  test("Quick Stats werden korrekt angezeigt", async ({ page }) => {
    const quickStats = page.locator(
      '[data-testid="quick-stats"], .quick-stats'
    );

    if (await quickStats.isVisible()) {
      // Should have stat cards
      const statCards = quickStats.locator('[data-testid="stat-card"]');
      const count = await statCards.count();

      expect(count).toBeGreaterThan(0);

      // Each stat should have a value
      if (count > 0) {
        const firstStatValue = await statCards.first().textContent();
        expect(firstStatValue?.length).toBeGreaterThan(0);
      }
    }
  });

  test("Dashboard Navigation zu anderen Bereichen funktioniert", async ({
    page,
  }) => {
    // Test navigation links from dashboard
    const navLinks = [
      { testId: "nav-quests", url: /\/quests/ },
      { testId: "nav-items", url: /\/items/ },
      { testId: "nav-calculator", url: /\/calculator/ },
    ];

    for (const { testId, url } of navLinks) {
      const link = page.locator(`[data-testid="${testId}"], a[href*="${testId.replace('nav-', '')}"]`);

      if (await link.first().isVisible()) {
        await link.first().click();
        await expect(page).toHaveURL(url);

        // Go back to dashboard
        await page.goto("/");
        await page.waitForLoadState("networkidle");
      }
    }
  });
});
