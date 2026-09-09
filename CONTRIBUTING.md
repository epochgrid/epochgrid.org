# Contributing to the website

Use a focused pull request in [epochgrid/epochgrid.org](https://github.com/epochgrid/epochgrid.org). Core implementation changes belong in [epochgrid/epochgrid](https://github.com/epochgrid/epochgrid).

1. Read the README and `docs/content-evidence.md`. Inspect the relevant core source, documentation or issue before changing a project claim.
2. Edit long-form content in `src/content/guide/`; maintain frontmatter and pinned source references. Describe planned work as planned and experimental code as experimental. Record material uncertainty in the evidence ledger.
3. Use semantic HTML, plain CSS and small progressive enhancements. Preserve system-theme and no-JavaScript fallbacks. Keep external links visibly identifiable. Do not add analytics, third-party fonts or a client framework.
4. Run `npm ci`, install Chromium with `npx playwright install --with-deps chromium`, and run `npm run validate`.
5. Inspect affected pages in both themes on mobile and desktop. The browser suite writes screenshots at 375 and 1440 pixels; check keyboard focus and reduced-motion behavior too.
6. Explain the user-visible change, evidence for revised claims and validation in the pull request. Do not commit `dist/`, `node_modules/`, credentials or test output.

Keep the website an orientation layer. Link to core docs instead of copying large implementation guides. Coordinate security-sensitive wording with core maintainers; tests do not establish a security audit.
