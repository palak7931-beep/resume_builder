import { expect, test } from "@playwright/test";

test("landing page loads and links to input", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /resume shapeshifter/i }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /get started/i })).toHaveAttribute(
    "href",
    "/input",
  );
});
