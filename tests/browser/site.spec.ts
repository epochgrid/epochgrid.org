import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const routes = [
  "/",
  "/project/",
  "/architecture/",
  "/technology/",
  "/inspirations/",
  "/developers/",
  "/404.html",
];
for (const theme of ["light", "dark"] as const)
  for (const width of [320, 375, 768, 1024, 1440, 1920]) {
    test(`${theme} at ${width}px: every route, overflow and accessibility`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 960 });
      await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      for (const route of routes) {
        await page.goto(route);
        await expect(page.locator("h1")).toBeVisible();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          route,
        ).toBe(true);
        if (width === 375 || width === 1440) {
          const results = await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
            .analyze();
          expect(results.violations, `${route} ${theme}`).toEqual([]);
          await page.screenshot({
            path: `test-results/screenshots/${theme}-${width}-${route.replaceAll("/", "") || "home"}.png`,
            fullPage: true,
          });
        }
      }
      expect(errors).toEqual([]);
    });
  }
test("theme persists across navigation and reload, before paint", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await page.getByRole("button", { name: "Use dark theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(
    page.getByRole("button", { name: "Use light theme" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.goto("/architecture/");
  await page.reload();
  expect(
    await page.evaluate(() => localStorage.getItem("epochgrid-theme")),
  ).toBe("dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const html = await page.content();
  expect(html.indexOf("localStorage.getItem('epochgrid-theme')")).toBeLessThan(
    html.indexOf("<body"),
  );
  await page.getByRole("button", { name: "Use light theme" }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});
test("mobile navigation uses keyboard, Escape, focus and breakpoint recovery", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  const button = page.getByRole("button", { name: "Menu" });
  const nav = page.getByRole("navigation", { name: "Primary", exact: true });
  await expect(nav).toBeHidden();
  await button.focus();
  await page.keyboard.press("Enter");
  await expect(button).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Tab");
  await expect(
    nav.getByRole("link", { name: "Project", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(button).toBeFocused();
  await expect(nav).toBeHidden();
  await button.press("Space");
  await nav.getByRole("link", { name: "Developers", exact: true }).click();
  await expect(page).toHaveURL(/developers/);
  await expect(nav).toBeHidden();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(nav).toBeVisible();
  await nav.getByRole("link", { name: "Project", exact: true }).focus();
  await page.setViewportSize({ width: 375, height: 812 });
  await expect(button).toBeFocused();
});
test("no JavaScript retains navigation and system theme", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    colorScheme: "dark",
    viewport: { width: 320, height: 812 },
  });
  const page = await context.newPage();
  await page.goto("/");
  await expect(
    page.getByRole("navigation", { name: "Primary", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /theme/i })).toHaveCount(0);
  await page
    .getByRole("navigation", { name: "Primary", exact: true })
    .getByRole("link", { name: "Architecture", exact: true })
    .click();
  await expect(page.locator("h1")).toHaveText("Architecture and security");
  expect(
    await page
      .locator("html")
      .evaluate((el) => getComputedStyle(el).colorScheme),
  ).toBe("dark");
  await context.close();
});
test("unavailable local storage does not break controls", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("Storage denied");
      },
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: /Use .* theme/ }).click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-theme",
    /light|dark/,
  );
});
test("primary links and skip link navigate correctly", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  for (const route of routes.slice(1, -1)) {
    await page.locator(`#primary-navigation a[href="${route}"]`).click();
    await expect(page).toHaveURL(new RegExp(route + "$"));
  }
});
