# EpochGrid website

The public orientation site for the [EpochGrid open-source project](https://github.com/epochgrid/epochgrid), published at **https://epochgrid.org**. Website source belongs to **[epochgrid/epochgrid.org](https://github.com/epochgrid/epochgrid.org)**. Core GitHub documentation remains authoritative for implementation, status and contribution workflows.

Astro, strict TypeScript and plain CSS generate seven static routes. Substantive content lives in validated Markdown collections. No client framework, server runtime, analytics, authentication or runtime GitHub API is used.

## Local setup

Use Node `24.20.0` (Node 24 LTS), pinned in `.nvmrc`, and its bundled npm. [Node release policy](https://nodejs.org/en/about/previous-releases) identifies supported release lines.

```bash
nvm install
nvm use
npm ci
npm run dev
```

Visit the local URL printed by Astro. To serve exactly the generated production output:

```bash
npm run build
npm run preview -- --host 127.0.0.1
```

Astro may automatically background the server in agent environments. Use `npx astro preview status`, `npx astro preview logs` and `npx astro preview stop` to manage it.

## Commands and validation

```bash
npm run format          # apply formatting
npm run format:check    # verify formatting
npm run lint            # ESLint including Astro and TypeScript
npm run check           # strict TypeScript and Astro diagnostics
npm run build           # portable dist/ output
npm test                # static routes, metadata, CNAME and discovery
npm run test:links      # local pages, fragments and referenced assets
npx playwright install --with-deps chromium
npm run test:browser    # keyboard, themes, overflow and axe accessibility
npm run validate       # all checks above except browser installation
```

Browser coverage visits every route in light/dark at 320, 375, 768, 1024, 1440 and 1920 pixels. It includes system theme fallback without JavaScript, inaccessible storage, selection persistence, mobile disclosure focus and Escape, navigation, page errors and horizontal overflow. Axe checks and full-page screenshots run at 375 and 1440 pixels in both themes. Generated screenshots and failure traces are in ignored `test-results/`.

The initial social PNG is committed. Its editable vector source is `public/social.svg`; regenerate after edits with `node scripts/generate-social.mjs` (requires installed Chromium). System font rendering can vary across operating systems.

## Content editing

Edit `src/content/guide/*.md` using the existing frontmatter schema. Each page must include a unique title/description, an eyebrow and at least one source reference. Use `##` for sections; the shared template supplies the only `h1` and builds the page contents navigation.

Update `src/site.ts` for shared repository URLs, source commit, metadata and navigation. Update `astro.config.mjs` if the canonical domain changes. Long-form external links are visually marked; shared link components include an accessible external label. External links open in the same tab.

Read [the evidence ledger](docs/content-evidence.md) before changing claims. Keep implemented, experimental and planned work distinct. Update the pinned core revision and review date alongside content; inspect source changes before doing so. Do not turn a new dependency into a claim of protocol interoperability. Contributor changes should follow [CONTRIBUTING.md](CONTRIBUTING.md).

## Deployment

Pull requests and pushes to main run `.github/workflows/ci.yml`. The Pages workflow runs on main or manual dispatch, validates a clean build, uploads only `dist/`, and deploys using the official Pages actions. Action versions are pinned to immutable SHAs; Dependabot checks npm and Actions weekly. Pull requests receive no publishing credentials.

The repository must use **GitHub Actions** as the Pages source. `public/CNAME` contains `epochgrid.org`; the same custom domain must also be configured in Pages settings. No `/epochgrid.org/` repository base path is used. See [DNS and deployment](docs/deployment.md) for administrator setup and [hosting portability](docs/hosting.md) for migration.

## Directory map

```text
src/components/       Header, footer, controls, badges and message-flow diagram
src/content/guide/    Project, architecture, technology, related work, developers
src/layouts/         Shared semantic document and metadata
src/pages/           Home, content routing and static 404
src/styles/          Complete light/dark color systems and responsive layout
src/site.ts          Central metadata, navigation, URLs and source revision
public/              CNAME, icons, social assets, manifest and robots.txt
scripts/             Internal-link validation and social-image rendering
tests/              Static and production-browser tests
.github/             CI, Pages deployment and Dependabot
docs/               Content evidence, hosting, DNS and validation notes
```

`dist/`, `.astro/`, `node_modules/` and browser output are generated and ignored. License: MIT, using the core project's established EpochGrid contributors notice.
