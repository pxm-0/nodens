#!/usr/bin/env bash
set -euo pipefail

service=nodens
script_dir=$(cd -- "$(dirname -- "$0")" && pwd)
compose_file="$script_dir/../docker-compose.production.yml"
local_origin=http://127.0.0.1:8082

if [[ -n "${NODENS_LOCAL_ORIGIN-}" ]]; then
  local_origin=$NODENS_LOCAL_ORIGIN
fi

die() {
  printf 'error: %s\n' "$*" >&2
  exit 1
}

if (( $# != 1 )); then
  die 'usage: deploy-image.sh ghcr.io/pxm-0/nodens@sha256:<64-hex-digest>'
fi

image=$1
if [[ ! "$image" =~ ^ghcr\.io/pxm-0/nodens@sha256:[0-9a-f]{64}$ ]]; then
  die 'image must be an immutable digest from ghcr.io/pxm-0/nodens'
fi
if [[ -n "${NODENS_PUBLIC_URL-}" && ! "$NODENS_PUBLIC_URL" =~ ^https://[A-Za-z0-9.-]+/?$ ]]; then
  die 'NODENS_PUBLIC_URL must be an HTTPS origin without a path'
fi

command -v curl >/dev/null || die 'curl is required'
command -v docker >/dev/null || die 'docker is required'
[[ -f "$compose_file" ]] || die "missing Compose file: $compose_file"

previous_image=''
if docker container inspect "$service" >/dev/null 2>&1; then
  previous_image=$(docker inspect --format '{{.Config.Image}}' "$service")
fi

check_http() {
  local name=$1
  local url=$2
  local status

  if ! status=$(curl --silent --show-error --max-time 10 --output /dev/null --write-out '%{http_code}' "$url"); then
    printf '%s_http=connection_failed\n' "$name" >&2
    return 1
  fi
  if [[ "$status" != 200 ]]; then
    printf '%s_http=%s\n' "$name" "$status" >&2
    return 1
  fi
  printf '%s_http=%s\n' "$name" "$status"
}

wait_for_health() {
  local attempt health

  for ((attempt = 1; attempt <= 30; attempt++)); do
    health=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$service" 2>/dev/null || true)
    if [[ "$health" == healthy ]]; then
      printf 'container_health=%s\n' "$health"
      return 0
    fi
    sleep 2
  done

  printf 'container_health=%s\n' "$health" >&2
  return 1
}

rollback() {
  if [[ -n "$previous_image" ]]; then
    printf 'rollback_digest=%s\n' "$previous_image"
    NODENS_IMAGE="$previous_image" docker compose -f "$compose_file" up --detach --no-build --force-recreate "$service"
    return
  fi

  printf 'rollback_digest=none\n'
  docker rm --force "$service" >/dev/null 2>&1 || true
}

failed_deploy() {
  printf 'deploy_result=failed\n' >&2
  rollback
  exit 1
}

if [[ -n "$previous_image" ]]; then
  printf 'previous_digest=%s\n' "$previous_image"
else
  printf 'previous_digest=none\n'
fi
printf 'requested_digest=%s\n' "$image"

if ! NODENS_IMAGE="$image" docker compose -f "$compose_file" pull "$service"; then
  die 'could not pull requested image; current service was not changed'
fi
if ! NODENS_IMAGE="$image" docker compose -f "$compose_file" up --detach --no-build --force-recreate "$service"; then
  failed_deploy
fi
if ! wait_for_health; then
  failed_deploy
fi
if ! check_http local_health "$local_origin/healthz"; then
  failed_deploy
fi
if ! check_http local_home "$local_origin/"; then
  failed_deploy
fi

# ponytail: public DNS is absent during first local deployment; set NODENS_PUBLIC_URL after cutover to require the external smoke check.
if [[ -n "${NODENS_PUBLIC_URL-}" ]]; then
  if ! check_http public_home "$NODENS_PUBLIC_URL"; then
    failed_deploy
  fi
else
  printf 'public_home=skipped\n'
fi

printf 'new_digest=%s\n' "$image"
printf 'deploy_result=success\n'
