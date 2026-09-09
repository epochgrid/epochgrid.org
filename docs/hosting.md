# Static hosting and migration

The application contract is simple: `npm ci && npm run build` produces `dist/`. Serve those files with directory indexes and use `404.html` for missing routes. There is no SSR, adapter, database, API, worker, runtime GitHub request or host-specific application code.

## Initial host: GitHub Pages

Website repository: https://github.com/epochgrid/epochgrid.org. Canonical domain: https://epochgrid.org. The deployment workflow uploads only `dist/` to Pages; no deployment branch is generated. Absolute links and the sitemap use the apex domain, without a repository-name prefix.

The provider's default project URL may contain `/epochgrid.org/`; this build intentionally targets the custom apex and should be reviewed there. DNS still points at the provider hostname `epochgrid.github.io`, not at a GitHub repository URL.

## Example: Cloudflare Pages

Connect `epochgrid/epochgrid.org`, select main as the production branch, and configure:

| Setting                | Value                     |
| ---------------------- | ------------------------- |
| Framework              | Astro (static)            |
| Root directory         | repository root           |
| Build command          | `npm ci && npm run build` |
| Build output directory | `dist`                    |
| Node version           | `24.20.0`                 |

Pin the build environment to the same Node version as `.nvmrc`. The npm lockfile remains authoritative. Do not install the Astro Cloudflare adapter or introduce Workers. Follow the [official static Astro Pages guide](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/) and use the provider's custom-domain setup for the apex and www redirect.

## Migration procedure

1. Build the unchanged source and publish `dist/` to a staging host. Verify all routes, assets and the 404 response.
2. If the public domain stays `epochgrid.org`, keep the canonical configuration. If it changes, update `astro.config.mjs`, `src/site.ts`, `public/CNAME`, `public/robots.txt`, the static tests, social source and relevant docs, then rebuild.
3. Configure the replacement host's custom domain, TLS certificate and www-to-apex redirect. Publish the same static files; set long caching for hashed `_astro/` assets and a shorter cache for HTML.
4. After review, point DNS to the replacement provider. Verify HTTPS, redirects, sitemap and deep links after propagation. Retain the previous deployment for rollback.
5. Disable the old Pages deployment workflow and remove the old Pages domain binding once traffic has moved. Keep GitHub organization domain verification where applicable.

For NGINX or object storage/CDN, upload the same files, configure directory index resolution and return `404.html` with a 404 status for missing objects. No application rewrite is needed.
