#!/usr/bin/env bash
# Smoke-test a built nodens image on loopback: health, routes, 404 page and headers.
# Usage: scripts/container-smoke.sh <image> [host-port]
set -euo pipefail

image="${1:?usage: container-smoke.sh <image> [host-port]}"
port="${2:-8082}"
name="nodens-smoke-$$"
base="http://127.0.0.1:${port}"
page="$(mktemp)"
trap 'docker rm --force "$name" >/dev/null 2>&1 || true; rm -f "$page"' EXIT

docker run --detach --name "$name" --publish "127.0.0.1:${port}:80" "$image" >/dev/null
for _ in {1..30}; do
  curl --fail --silent --show-error "$base/healthz" && break
  sleep 1
done
curl --fail --silent --show-error "$base/" >/dev/null
test "$(curl --silent --output "$page" --write-out '%{http_code}' "$base/unlisted-room")" = 404
grep --quiet 'Nothing is exhibited here.' "$page"
curl --fail --silent --show-error --head "$base/" | grep --ignore-case --quiet '^content-security-policy:'
curl --fail --silent --show-error --head "$base/healthz" | grep --ignore-case --quiet '^cache-control: no-store'
echo "container smoke ok: $image"
