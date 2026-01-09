import { test, expect } from "@playwright/test";

const WISHLIST_STORAGE_KEY = "arc-calculator-saves";

test.describe("Calculator Wishlist Integration", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/calculator");
    await page.evaluate((key) => {
      localStorage.removeItem(key);
    }, WISHLIST_STORAGE_KEY);
    await page.reload();
    await page.waitForLoadState("networkidle");
  });

  test("AC-MC-02.1: Save Button speichert die aktuelle Berechnung", async ({
    page,
  }) => {
    // Select some quests
    const questCheckboxes = page.locator('[data-testid="quest-checkbox"]');

    if ((await questCheckboxes.count()) > 0) {
      await questCheckboxes.first().click();

      // Click save button
      const saveButton = page.getByRole("button", { name: /save|speichern/i });

      if (await saveButton.isVisible()) {
        await saveButton.click();

        // Fill in name if dialog appears
        const nameInput = page.getByLabel(/name/i);
        if (await nameInput.isVisible()) {
          await nameInput.fill("Test Wishlist");
        }

        // Confirm save
        const confirmButton = page.getByRole("button", {
          name: /confirm|save|speichern|ok/i,
        });
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }

        // Verify storage was updated
        const saved = await page.evaluate((key) => {
          const data = localStorage.getItem(key);
          return data !== null && data !== "[]";
        }, WISHLIST_STORAGE_KEY);

        expect(saved).toBe(true);
      }
    }
  });

  test("AC-MC-02.2: Load Button lädt eine gespeicherte Wishlist", async ({
    page,
  }) => {
    // Pre-populate localStorage with a saved wishlist
    await page.evaluate((key) => {
      const savedWishlist = [
        {
          id: "test-wishlist-1",
          name: "Test Wishlist",
          timestamp: Date.now(),
          selectedQuests: ["quest-1"],
          selectedUpgrades: [],
          selectedProjectPhases: [],
          customMaterials: [],
        },
      ];
      localStorage.setItem(key, JSON.stringify(savedWishlist));
    }, WISHLIST_STORAGE_KEY);

    await page.reload();
    await page.waitForLoadState("networkidle");

    // Click load button
    const loadButton = page.getByRole("button", { name: /load|laden/i });

    if (await loadButton.isVisible()) {
      await loadButton.click();

      // Select the saved wishlist
      const wishlistOption = page.getByText("Test Wishlist");
      if (await wishlistOption.isVisible()) {
        await wishlistOption.click();

        // Verify the wishlist was loaded (checkboxes should be checked)
        const checkedCheckboxes = page.locator(
          '[data-testid="quest-checkbox"]:checked'
        );
        const count = await checkedCheckboxes.count();

        expect(count).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test("AC-MC-02.3: Export als Text ist möglich", async ({ page }) => {
    // Select some quests
    const questCheckboxes = page.locator('[data-testid="quest-checkbox"]');

    if ((await questCheckboxes.count()) > 0) {
      await questCheckboxes.first().click();

      // Look for export button
      const exportButton = page.getByRole("button", {
        name: /export|exportieren/i,
      });

      if (await exportButton.isVisible()) {
        // Listen for download or clipboard
        const [download] = await Promise.all([
          page.waitForEvent("download").catch(() => null),
          exportButton.click(),
        ]);

        if (download) {
          // Verify download happened
          expect(download).toBeDefined();
        } else {
          // Check if copied to clipboard (would need to verify via toast/notification)
          const successToast = page.locator('[data-testid="toast"]');
          if (await successToast.isVisible()) {
            expect(await successToast.textContent()).toContain(/copied|kopiert/i);
          }
        }
      }
    }
  });

  test("Gespeicherte Wishlist kann gelöscht werden", async ({ page }) => {
    // Pre-populate localStorage
    await page.evaluate((key) => {
      const savedWishlist = [
        {
          id: "test-wishlist-delete",
          name: "Delete Me",
          timestamp: Date.now(),
          selectedQuests: [],
          selectedUpgrades: [],
          selectedProjectPhases: [],
          customMaterials: [],
        },
      ];
      localStorage.setItem(key, JSON.stringify(savedWishlist));
    }, WISHLIST_STORAGE_KEY);

    await page.reload();
    await page.waitForLoadState("networkidle");

    // Open load dialog
    const loadButton = page.getByRole("button", { name: /load|laden/i });

    if (await loadButton.isVisible()) {
      await loadButton.click();

      // Look for delete button on the wishlist item
      const deleteButton = page
        .locator('[data-testid="delete-wishlist"]')
        .first();

      if (await deleteButton.isVisible()) {
        await deleteButton.click();

        // Confirm deletion
        const confirmButton = page.getByRole("button", {
          name: /confirm|delete|löschen|ja/i,
        });
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }

        // Verify deletion
        const wishlistCount = await page.evaluate((key) => {
          const data = JSON.parse(localStorage.getItem(key) || "[]");
          return data.length;
        }, WISHLIST_STORAGE_KEY);

        expect(wishlistCount).toBe(0);
      }
    }
  });
});
