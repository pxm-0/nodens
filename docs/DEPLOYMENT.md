# Deployment

## Production path

Nodens is built once in GitHub Actions and published to GHCR by commit SHA. This
repository does not deploy: staging and production run as the Argus managed-zone
workloads nodens-staging and nodens-production, each pinned to an immutable
ghcr.io/pxm-0/nodens@sha256:... image ID and changed only through Argus PRs.

## Local container

~~~bash
docker compose up --build -d
~~~

This is loopback-only on port 8082. It does not use or modify port 8081.

## Publishing

The Publish image workflow runs only after a successful CI run on main. It publishes
ghcr.io/pxm-0/nodens:<commit-sha> and writes the immutable
ghcr.io/pxm-0/nodens@sha256:... reference, commit SHA, and tags to the run summary.
Pin that reference in the Argus workload to deploy it.

The full administrator-owned setup and release verification are in
[PRODUCTION_RUNBOOK.md](PRODUCTION_RUNBOOK.md).

A curated copy of this repository and its own image are published one way to
`pxm-0/nodens-public`; see [PUBLIC_MIRROR.md](PUBLIC_MIRROR.md).
