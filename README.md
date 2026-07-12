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

- Astro 7
- TypeScript
- Markdown content collections
- vanilla CSS and browser JavaScript
- static output served by nginx

## Local development

Requirements:

- Node.js 22.12 or newer
- npm 9.6.5 or newer

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:4321`.

## Production build

```bash
npm run build
npm run preview
```

The generated static site is written to `dist/`.

## Docker

```bash
docker compose up --build -d
```

The site will be available on `http://localhost:8080`.

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

Nodens is designed to build into static files and run cheaply on owned infrastructure. The included container builds the Astro site and serves it through nginx. A reverse proxy on Oreo Cloud can route `nodens.dev` to the container.

See `docs/DEPLOYMENT.md` for the intended first production path.

## Rights

The application source code is MIT licensed. Personal writing, photographs, artwork, and authored content remain all rights reserved unless explicitly marked otherwise. See `CONTENT_LICENSE.md`.
