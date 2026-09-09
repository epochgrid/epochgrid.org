# Initial website validation

Local verification on 2026-09-08 used Node 24.20.0, npm 11.19.0 and Chromium 153 via Playwright 1.63.0. The source target is epochgrid/epochgrid.org; the canonical domain is epochgrid.org.

## Commands and results

- `npm ci` — clean lockfile installation; zero reported dependency vulnerabilities at the time of inspection.
- `npm run format:check` — pass.
- `npm run lint` — pass.
- `npm run check` — pass, zero errors, warnings or hints.
- `npm run build` — seven static routes; no server runtime output.
- `npm test` — nine tests pass, including metadata, distinct page descriptions, CNAME and sitemap checks.
- `npm run test:links` — 127 internal page, fragment and asset references pass.
- `npx playwright install chromium` — Chromium installed; CI uses `--with-deps` on Ubuntu.
- `npm run test:browser` — 17 tests pass. All seven routes visited in both themes at 320, 375, 768, 1024, 1440 and 1920 pixels. No overflow or page errors observed. Axe WCAG A/AA checks at mobile and desktop found zero violations across all routes and both themes.
- `npm run validate` — complete combined gate passes after clean installation.

Screenshots for every page at 375 and 1440 pixels in both themes were inspected. Browser checks exposed a breakpoint focus-loss issue; the navigation now restores focus to the mobile menu control when a focused desktop link becomes hidden. Production route checks also corrected Astro's default 404 canonical to `/404.html`.

## Lighthouse

Production preview: `npm run preview -- --host 127.0.0.1 --port 4321 --background`.

```bash
CHROME_PATH=/home/evan/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome npm exec --yes --package=lighthouse@13.0.1 -- lighthouse http://127.0.0.1:4321/ --chrome-flags='--headless --no-sandbox' --output=json --output-path=/tmp/epochgrid-tools/lighthouse-home.json --quiet
CHROME_PATH=/home/evan/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome npm exec --yes --package=lighthouse@13.0.1 -- lighthouse http://127.0.0.1:4321/architecture/ --chrome-flags='--headless --no-sandbox' --output=json --output-path=/tmp/epochgrid-tools/lighthouse-architecture.json --quiet
```

Both mobile audits: performance 100, accessibility 100, best practices 100, SEO 100. These are local synthetic results, not field measurements or a substitute for assistive-technology review. Reports live in /tmp; browser screenshots are ignored artifacts under test-results/screenshots.

## Asset measurements

Approximately 156 KB for all uncompressed dist files combined. Shared CSS: 11.3 KB. Executable JavaScript per page: approximately 2.1 KB inline, approximately 0.82 KB gzip when measured separately. No external JavaScript chunks or client framework. Home HTML is approximately 13.7 KB including scripts; social PNG is 42.5 KB and is not loaded as a page image. No external fonts or runtime service calls.

DNS and hosted HTTPS verification are separate from local validation. Before deployment, epochgrid.org did not resolve and Pages was not enabled. Follow the deployment runbook for administrator prerequisites and final propagation checks.
