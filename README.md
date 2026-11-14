# Nodens

**A curated self-portrait in systems, texts, rituals, objects, and ongoing work.**

Nodens is a public personal site designed as an exhibition first and a conventional portfolio second. The landing experience moves through different forms of attention: engineering, writing, coffee, audio, and the person implied by their arrangement.

Behind the exhibition, every facet has a proper public section with projects, essays, notes, logs, formal About and Contact pages, and a direct index for visitors who do not want the ceremonial route.

## Initial state

- full-screen exhibition landing with keyboard, wheel, swipe, and direct index navigation
- engineering preview with honest project statuses
- writing, coffee, and audio previews
- section pages with content archives
- Astro content collections for projects and entries
- static production build
- Docker and nginx deployment for a self-hosted server
- GitHub Actions build check
- accessible reduced-motion behavior and direct navigation

## Stack

- Astro 7.2.9
- TypeScript
- Markdown content collections
- vanilla CSS and browser JavaScript
- static output served by nginx

## Develop

Only Docker (OrbStack on macOS) is needed on the host. Node 22.19.0, npm 11.12.1 and
Playwright's Chromium live in the dev image (`.devcontainer/Dockerfile`).

```bash
docker compose up -d          # astro dev with hot reload at http://127.0.0.1:4321
docker compose logs -f dev
docker compose down           # stop; add -v to drop the dependency and build volumes
```

The source is bind-mounted, so edits reload the page. `node_modules`, `.astro` and
`dist` live in named volumes and never reach the macOS host. The first start runs
`npm ci`; later starts reinstall only when `package-lock.json` changes. No `.env` is
needed: the `PUBLIC_*` variables in `.env.example` have built-in fallbacks.

Run checks and tests in a one-off container beside the dev server:

```bash
docker compose run --rm --no-deps dev npm run check
docker compose run --rm --no-deps dev npm test
docker compose run --rm --no-deps dev npm run test:e2e
docker compose run --rm --no-deps dev npm run test:lighthouse
```

Editors with Dev Containers support can instead open the repository in the `dev`
container (`.devcontainer/devcontainer.json`), which is the same compose service.

## Production build

```bash
npm run build
npm run preview
```

The generated static site is written to `dist/`.

## Docker

```bash
docker compose --profile image up --build -d nodens
curl http://127.0.0.1:8083/healthz
docker compose --profile image rm -sf nodens
```

This builds the production nginx image and serves it loopback-only on port 8083, so it
never collides with the production workload's port 8082 (or 8081).

The production rehearsal for issue #6 runs on the `oreochiserver-sim` OrbStack machine
from the Argus repository, not from this repository. It uses the production compose
and pulls the published `ghcr.io/pxm-0/nodens@sha256:...` image, so on the sim you log
in yourself with a read-only GHCR token (`docker login ghcr.io`). No token is stored
in either repository.

Production never builds from a server checkout. GitHub Actions publishes an immutable
`ghcr.io/pxm-0/nodens@sha256:...` image; Argus deploys that exact digest.
See [the deployment guide](docs/DEPLOYMENT.md) and
[the production runbook](docs/PRODUCTION_RUNBOOK.md).

## Content model

Entries live in:

```text
src/content/entries/<section>/<slug>.md
```

Projects live in:

```text
src/content/projects/<slug>.md
```

Schemas are defined in `src/content.config.ts`. Draft entries are excluded from production lists and routes.

## Site structure

```text
/
├── engineering/
│   └── projects/
├── writing/
├── coffee/
├── audio/
├── about/
├── now/
├── contact/
└── index/
```

## Deployment intent

Nodens is designed to build into static files and run cheaply on owned infrastructure. The included container serves an immutable build through nginx. A host-managed Cloudflare Tunnel routes `nodens.dev` to the loopback-only container.

See `docs/DEPLOYMENT.md` for the production path.

## Rights

The application source code is MIT licensed. Personal writing, photographs, artwork, and authored content remain all rights reserved unless explicitly marked otherwise. See `CONTENT_LICENSE.md`.
