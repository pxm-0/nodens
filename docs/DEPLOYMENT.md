# Deployment

## Production path

Nodens is built once in GitHub Actions, published to GHCR by commit SHA, and deployed
to Oreo Cloud by immutable digest. The server does not clone this repository or build
source.

~~~text
GitHub CI
  ↓ immutable ghcr.io/pxm-0/nodens@sha256:...
GitHub production environment approval
  ↓
restricted deploy credential over Tailscale
  ↓
nginx container 127.0.0.1:8082
  ↓
host-managed cloudflared service
  ↓
nodens.dev
~~~

## Local container

~~~bash
docker compose up --build -d
~~~

This is loopback-only on port 8082. It does not use or modify port 8081.

## Production deployment

The Publish and deploy workflow runs only after a successful CI run on main. It
publishes ghcr.io/pxm-0/nodens:<commit-sha>, captures the resulting digest, waits for
the protected production environment approval, then copies only
docker-compose.production.yml and scripts/deploy-image.sh to /opt/nodens/.

The remote script validates the GHCR repository, records the prior digest, checks
container health and local HTTP responses, and restores the prior digest on failure.

For a manual, immutable fallback:

~~~bash
NODENS_PUBLIC_URL=https://nodens.dev /opt/nodens/scripts/deploy-image.sh ghcr.io/pxm-0/nodens@sha256:<64-hex-digest>
~~~

The full administrator-owned setup and release verification are in
[PRODUCTION_RUNBOOK.md](PRODUCTION_RUNBOOK.md).
