# Nodens Production Readiness, Linking, and Launch Content

## Summary

Finish the existing uncommitted hardening work on a dedicated `codex/prod-readiness-links` branch, preserving current changes. Launch `https://nodens.dev` through Cloudflare Tunnel to an immutable container on Oreo Cloud.

Key current blockers:

- `nodens.dev` has no web DNS route and Nodens is not running.
- Port `8081` is occupied by `project-discovery`; Nodens will use loopback-only `8082`.
- Four npm advisories remain, including three high severity.
- Metadata lacks canonical, Open Graph, Twitter, and structured-data support.
- Project relationships and featured content are hardcoded or unused.
- `main` is unprotected and deployment still builds from a server-side Git checkout.

## Content and Linking

### Launch project inventory

| Project | Placement and stage | Launch description | Verified outbound links |
|---|---|---|---|
| LociGraph | Featured #1 · Active / Phase IV | Concept-centric memory architecture for evidence-bound claims, contradictions, revisions, and spatial retrieval. | Source: `https://github.com/pxm-0/LociGraph-Rebuild` |
| Argus | Featured #2 · Active / P0 | Private, Git-tracked control plane for workload inventory, trust boundaries, guarded operations, and health across Oreo Cloud. | Portfolio: `https://pxm-0.github.io/argus/`; Source: `https://github.com/pxm-0/argus` |
| Haruspex | Featured #3 · Active / v0 | Agent-neutral software-delivery diligence built around explicit gates, approvals, and durable evidence. | Source: `https://github.com/pxm-0/haruspex` |
| Eli | Featured #4 · Live | Voice journaling companion with adaptive turn-taking and layered memory across sessions. | Live: `https://www.eli-journal.com/`; Source: `https://github.com/pxm-0/voice-companion` |
| Brighella | Archive · Prototype | Graph-guided app shipper that decomposes requests into bounded, validated artifacts for smaller coding models. | Source: `https://github.com/pxm-0/brighella` |
| Seshat | Archive · P0 planning | AI-native long-form writing environment with durable editing, staged AI assistance, version history, and cost controls. | Source: `https://github.com/pxm-0/seshat` |
| Oreo Cloud | Archive · Infrastructure umbrella | Owned infrastructure for turning project designs into repeatable, observable deployments. | No outbound link |
| Hastur | Archive · Private early build | Private watcher for recurring work, system events, and conditions that deserve attention. | No outbound link |

- The exhibition engineering frame shows only LociGraph and Argus; Engineering and the full Index list all eight, featured first.
- All internal `/engineering/projects/<id>/` routes remain maintenance pages for this launch, including projects with working external destinations.
- Maintenance pages use `noindex,follow`, remain reachable from project cards, and are excluded from the sitemap.
- Maintenance copy becomes project-specific:

  - Eyebrow: `Project record / {title}`
  - Heading: `Server migration in progress.`
  - Body: `The public Nodens record for {title} is temporarily unavailable while the site’s project surfaces move to the new server. Its current public stage is {stage}. Verified destinations remain available below.`
  - Actions: verified `Live`, `Portfolio`, or `Source` links where available, followed by `Return to engineering` and `Open index`.

- External links stay in the same tab, use a visible `↗`, and include assistive “external link” text. No placeholder, private, or unchecked destinations are rendered.
- Relate `locigraph-phase-four` to LociGraph and `from-vision-to-project` to Oreo Cloud. Render reciprocal “Related project/entry” links.
- Drive exhibition and index routes from content data instead of duplicated hardcoded slugs.
- Refresh `/now/` to “Revised August 2026,” grouping LociGraph/Argus under Building, Haruspex/Eli under Shipping, Brighella/Seshat/Hastur under Incubating, and Oreo Cloud under Infrastructure. Preserve the existing writing, brewing, and listening material.
- Update About to identify Dustin as an AI/software engineer, systems builder, and writer. Keep Contact limited to the verified domain email and GitHub profile.

### Content interfaces

- Extend project frontmatter with:

  - `stageLabel`
  - `featureRank?: number`
  - `recordState: 'maintenance' | 'published'`
  - `links: { kind: 'live' | 'portfolio' | 'source'; href: valid URL }[]`

- Extend entries with `relatedProjects`, using Astro content references to project IDs.
- Remove redundant manual `slug` fields; the content file ID remains the canonical route identifier.
- Extend `BaseLayout` with canonical URL, social image, Open Graph type, robots policy, and optional article dates.

## Production and Release Path

- Create a production Compose definition using the immutable GHCR image and bind only `127.0.0.1:8082` to nginx. Leave `project-discovery` and port `8081` untouched.
- Build once in GitHub Actions, publish `ghcr.io/pxm-0/nodens` tagged by commit SHA, record its digest, and deploy that exact digest. Make the static-site image public so the server needs no long-lived registry credential.
- Protect `main` with pull requests, required CI checks, no force pushes/deletion, and zero required peer approvals for the solo-owner workflow.
- Gate deployment with a GitHub `production` environment requiring owner approval. Join the existing private network using a pinned Tailscale GitHub Action, then SSH using a restricted deploy credential.
- The remote deployment script must:

  1. Validate the requested image belongs to the Nodens GHCR repository.
  2. Record the currently running digest.
  3. Pull and start the new digest.
  4. Require container health plus `200` responses from `/healthz` and `/`.
  5. Restore the previous digest automatically if any health or public smoke check fails.
  6. Report previous/new digests and HTTP results.

- Run `cloudflared` as a host service independent of the Nodens container. Route `nodens.dev` to `http://127.0.0.1:8082`, return 404 for unmatched tunnel ingress, and create a proxied `www` record with a permanent Cloudflare redirect to the apex.
- Enable HTTPS-only behavior, TLS 1.2+, and HSTS without `includeSubDomains` or preload until all planned subdomains are inventoried.
- Update the existing Oreo deployment skill after cutover so manual fallback deploys immutable digests on port 8082; it must no longer run the conflicting port-8081 server-side build.

## Application and Infrastructure Hardening

- Upgrade Astro to `7.2.9`, refresh the lockfile, resolve all current high/moderate advisories, and add Astro type checking. Block high/critical audit findings in CI.
- Pin Node, npm, nginx, and GitHub Action versions/digests; use the same exact npm version in CI and Docker.
- Exclude `.env*` from Docker build context except `.env.example`; pass only explicitly public build arguments.
- Add strict static-site headers: CSP, `X-Content-Type-Options`, `Referrer-Policy`, frame denial, and restrictive `Permissions-Policy`. Move the exhibition JavaScript into an external bundled asset so CSP does not require unsafe inline scripts.
- Cache hashed `/_astro/` assets for one year with `immutable`; serve HTML with revalidation, public unhashed assets without `immutable`, and `/healthz` with `no-store`.
- Add canonical URLs, WebSite/Person JSON-LD, Open Graph/Twitter metadata, article dates, and a 1200×630 branded social image reading “Nodens — Evidence of an ongoing life.”
- Generate `robots.txt` from the configured canonical origin and filter maintenance routes plus `/404` from the sitemap.
- Preserve the existing Google verification and MX records. Assuming Google Workspace is the sole sender, add SPF, provider-generated 2048-bit DKIM, and DMARC initially at `p=none`; verify SPF/DKIM alignment and then move DMARC to quarantine after clean validation.

## Verification and Rollout

- CI gates:

  - Astro type check and production build
  - generated internal links, assets, fragments, canonical metadata, robots, and sitemap
  - maintenance-page `noindex` and sitemap exclusion
  - no orphaned public routes
  - dependency audit with no high/critical findings
  - Docker build, image scan, health check, homepage smoke, and custom 404
  - Playwright desktop/mobile keyboard, dialog, reduced-motion, and navigation tests
  - Lighthouse minimums: Performance 90, Accessibility 95, Best Practices 95, SEO 95

- Check verified external destinations during release and through a scheduled non-deploying link workflow; temporary third-party outages must alert without blocking unrelated content builds.
- Rollout order:

  1. Land content, metadata, test, image, and Compose changes.
  2. Provision the production environment, deployment credentials, tunnel, and port 8082 origin.
  3. Deploy the first image and verify it locally before enabling public DNS.
  4. Enable Cloudflare apex/www routing and verify HTTPS, redirects, headers, 404 behavior, sitemap, and all featured links.
  5. Submit the sitemap through the already-verified search property and complete email send/receive plus SPF/DKIM/DMARC checks.
  6. Perform one controlled rollback drill and update the deployment skill/manual runbook.

## Assumptions

- Existing uncommitted hardening changes are retained and refined, not discarded.
- Every internal project record starts in `maintenance` state and requires an explicit future content change to become indexable.
- Cloudflare remains authoritative for `nodens.dev`, and Google remains the domain’s only outbound mail provider.
- RSS, search, personal analytics, comments, and public authentication remain outside this launch.
- No obsolete Docker networks, server checkouts, or unrelated containers are removed during the cutover.
