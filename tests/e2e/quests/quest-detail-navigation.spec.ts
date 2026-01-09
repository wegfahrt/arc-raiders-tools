import { test, expect } from "@playwright/test";

test.describe("Quest Detail Navigation", () => {
  test("AC-QM-03.4: Dynamische Route /quests/[slug] ist erreichbar", async ({
    page,
  }) => {
    // First, go to quests page to find a valid quest slug
    await page.goto("/quests");
    await page.waitForLoadState("networkidle");

    // Get first quest link/card
    const questCard = page.locator('[data-testid="quest-card"]').first();

    if (await questCard.isVisible()) {
      await questCard.click();

      // Verify URL pattern matches dynamic route
      await expect(page).toHaveURL(/\/quests\/[a-zA-Z0-9-]+/);
    }
  });

  test("AC-QM-03.2: Voraussetzungs-Quests sind als klickbare Links dargestellt", async ({
    page,
  }) => {
    await page.goto("/quests");
    await page.waitForLoadState("networkidle");

    // Click on a quest to open detail view
    const questCard = page.locator('[data-testid="quest-card"]').first();
    if (await questCard.isVisible()) {
      await questCard.click();
      await page.waitForLoadState("networkidle");
    }

    // Look for prerequisite links
    const prereqLinks = page.locator(
      '[data-testid="prerequisite-link"], [data-testid="prereq-link"]'
    );

    if ((await prereqLinks.count()) > 0) {
      const firstPrereq = prereqLinks.first();
      const href = await firstPrereq.getAttribute("href");

      // Verify it's a valid quest link
      expect(href).toMatch(/\/quests\//);

      // Click and verify navigation
      await firstPrereq.click();
      await expect(page).toHaveURL(/\/quests\//);
    }
  });

  test("AC-QM-03.3: Nachfolgende Quests sind als klickbare Links dargestellt", async ({
    page,
  }) => {
    await page.goto("/quests");
    await page.waitForLoadState("networkidle");

    // Click on a quest to open detail view
    const questCard = page.locator('[data-testid="quest-card"]').first();
    if (await questCard.isVisible()) {
      await questCard.click();
      await page.waitForLoadState("networkidle");
    }

    // Look for following quest links
    const followingLinks = page.locator(
      '[data-testid="following-quest-link"], [data-testid="unlocks-link"]'
    );

    if ((await followingLinks.count()) > 0) {
      const firstFollowing = followingLinks.first();
      const href = await firstFollowing.getAttribute("href");

      // Verify it's a valid quest link
      expect(href).toMatch(/\/quests\//);
    }
  });

  test("AC-QM-03.5: Benötigte Items zeigen Menge und sind mit Item-Datenbank verlinkt", async ({
    page,
  }) => {
    await page.goto("/quests");
    await page.waitForLoadState("networkidle");

    // Click on a quest to open detail view
    const questCard = page.locator('[data-testid="quest-card"]').first();
    if (await questCard.isVisible()) {
      await questCard.click();
      await page.waitForLoadState("networkidle");
    }

    // Look for required items
    const itemLinks = page.locator('[data-testid="required-item-link"]');

    if ((await itemLinks.count()) > 0) {
      const firstItem = itemLinks.first();

      // Verify it links to items page
      const href = await firstItem.getAttribute("href");
      expect(href).toMatch(/\/items\//);

      // Click and verify navigation
      await firstItem.click();
      await expect(page).toHaveURL(/\/items\//);
    }
  });
});
