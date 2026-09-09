# GitHub Pages and DNS runbook

Target repository: **epochgrid/epochgrid.org**. Canonical site and Pages custom domain: **epochgrid.org**. Repository settings belong to https://github.com/epochgrid/epochgrid.org/settings/pages. All steps below target that repository, not `epochgrid.github.io` as a repository name.

DNS administration is a separate task. Do not make external DNS changes without authorization for that domain.

## Organization and repository setup

1. An organization owner verifies `epochgrid.org` under organization Settings → Pages. Add GitHub's exact generated TXT record and complete verification before attaching the domain. Keep that record.
2. In the website repository, enable Actions and set Settings → Pages → Source to **GitHub Actions**. Use the `github-pages` environment; restrict deployments to main and apply any required reviewer policy.
3. After organization verification, set the Pages custom domain to `epochgrid.org`. `public/CNAME` is an artifact check; Actions deployments still need the domain configured in Settings.
4. Push validated changes to main or manually dispatch **Deploy GitHub Pages**. The workflow runs the full validation gate, uploads only `dist/`, deploys with `pages: write` and `id-token: write`, and reports the URL in its environment and summary.
5. Configure DNS below, wait for certificate issuance, then enable **Enforce HTTPS**. Do not disable certificate validation to make a test pass.

These setup requirements and DNS values follow [GitHub's custom-domain documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site). Recheck that source before later migrations.

## DNS records

Use these four apex A records (or a provider-supported apex ALIAS/ANAME to `epochgrid.github.io`):

```text
@  A  185.199.108.153
@  A  185.199.109.153
@  A  185.199.110.153
@  A  185.199.111.153
```

If enabling IPv6, add all four current Pages AAAA records alongside IPv4:

```text
@  AAAA  2606:50c0:8000::153
@  AAAA  2606:50c0:8001::153
@  AAAA  2606:50c0:8002::153
@  AAAA  2606:50c0:8003::153
```

For www:

```text
www  CNAME  epochgrid.github.io.
```

The DNS hostname excludes the repository name. The repository is `epochgrid/epochgrid.org`; a DNS CNAME cannot point to `github.com/epochgrid/epochgrid.org` or include a URL path. With apex configured as the Pages custom domain, GitHub redirects www to apex when both records are correct. A replacement provider must implement that redirect explicitly if necessary.

Avoid wildcard records. Review conflicting default A/AAAA/CNAME records before replacing them; preserve unrelated mail and verification records.

## Post-deployment checks

```bash
dig +short epochgrid.org A
dig +short epochgrid.org AAAA
dig +short www.epochgrid.org CNAME
curl -I https://epochgrid.org/
curl -I http://epochgrid.org/
curl -I https://www.epochgrid.org/
curl -I https://epochgrid.org/architecture/
curl -I https://epochgrid.org/missing-page-check
curl -fsS https://epochgrid.org/CNAME
curl -fsS https://epochgrid.org/sitemap-index.xml
```

Expect valid HTTPS; HTTP and www redirect to the canonical HTTPS apex. Confirm a real missing path returns HTTP 404 with the branded page, deep links return 200, CNAME is `epochgrid.org`, and canonical/sitemap URLs contain no repository prefix. DNS and certificate propagation may take time; review Pages' domain check and certificate status if HTTPS is not yet ready.

## Rollback and maintenance

Revert the problematic source commit through normal review and redeploy main; do not force-push or commit generated output. Keep a known-good build during a provider migration. Dependency PRs must pass both static and browser checks. Workflow actions are SHA-pinned and updated through Dependabot.

If deployment is blocked, inspect the workflow logs, Pages source, environment protection, Actions permissions, organization domain verification and DNS in that order. Domain verification and DNS cannot be supplied by a repository build artifact.
