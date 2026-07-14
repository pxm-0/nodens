# Deployment

## Intended first path

Nodens is statically built and served from the user's own server.

```text
GitHub
  ↓ pull or CI artifact
Docker build
  ↓
nginx container :80
  ↓
reverse proxy / TLS
  ↓
nodens.dev
```

## First deployment

```bash
git clone <repository-url>
cd nodens
cp .env.example .env
# Override the public contact values if needed.
docker compose up --build -d
```

Route the domain through the server's existing reverse proxy to port `8081`.

## Updates

```bash
git pull --ff-only
docker compose up --build -d
```

## Production checklist

- add real media under `public/media/`
- confirm DNS and TLS
- set security headers at the edge or reverse proxy
- verify the health endpoint
- test keyboard, touch, and reduced-motion navigation
- run a Lighthouse pass
- confirm that private drafts and personal records are not committed
