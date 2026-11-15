#!/usr/bin/env bash
# Usage: mirror/selftest.sh CLEAN_MIRROR_DIR
# Proves the leak scan blocks a publish: plants one fake leak at a time in a copy
# of a clean mirror and fails unless mirror/scan.sh rejects each by the expected rule.
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
clean=$(cd "$1" && pwd)
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
# Built at runtime so no secret-shaped literal is ever committed.
fake_pat="ghp_$(head -c 1024 /dev/urandom | LC_ALL=C tr -dc 'A-Za-z0-9' | cut -c1-36)"
host="oreochi""server"
# name|expected rule|file|content appended to that file
plants=(
  "github-token|github-pat|src/lib/leak.ts|export const token = '$fake_pat';"
  "env-file|secret-file|.env.production|PUBLIC_SITE_URL=https://nodens.dev"
  "server-hostname|internal-host|docs/leak.md|ssh $host"
  "tailnet-hostname|internal-host|docs/leak.md|https://box.tail1234.ts.net/"
  "base64-hostname|internal-host|docs/leak.md|cfg: $(printf '%s.example.org' "$host" | base64)"
  "tailnet-ip|tailnet-ip|docs/leak.md|100.101.102.103"
  "private-ip|private-ip|docs/leak.md|192.168.1.20"
  "host-path|host-path|docs/leak.md|/Users/someone/notes"
  "internal-port|internal-port|docs/leak.md|http://127.0.0.1:8082/healthz"
  "dev-port-wrong-file|port-url|src/lib/leak.ts|const dev = 'http://localhost:4321/';"
  "workload-name|argus-internal-name|docs/leak.md|deploy nodens-""production"
  "lockfile-registry|lockfile-registry|package-lock.json|"
  "lockfile-hostname|internal-host|package-lock.json|$host"
  "svg-host-path|host-path|public/favicon.svg|<!-- /Users/someone/art.svg -->"
  "png-text-chunk|internal-host|public/social-card.png|tEXtComment $host.local"
  "pem-file|secret-file|deploy/server.pem|placeholder"
  "compose-port|internal-port|docs/leak.md|ports: [\"8081:80\"]"
)
failed=0
for plant in "${plants[@]}"; do
  IFS='|' read -r name rule file content <<<"$plant"
  copy="$work/$name"
  cp -R "$clean" "$copy"
  mkdir -p "$(dirname "$copy/$file")"
  if [ "$rule" = lockfile-registry ]; then
    perl -0pi -e 's#"resolved": "https://registry\.npmjs\.org/#"resolved": "https://npm.example.org/#' "$copy/$file"
  else
    printf '%s\n' "$content" >>"$copy/$file"
  fi
  if "$here/scan.sh" "$copy" >"$work/$name.log" 2>&1; then
    echo "FAIL  $name: scan passed with a planted leak in $file"
    failed=1
    continue
  fi
  rules=$(sed -n 's/^RuleID:[[:space:]]*//p' "$work/$name.log" | sort -u | tr '\n' ' ')
  grep -q 'outside registry.npmjs.org' "$work/$name.log" && rules+="lockfile-registry "
  case " $rules" in
    *" $rule "*) echo "ok    $name: blocked in $file by $rules" ;;
    *) echo "FAIL  $name: blocked by '$rules', expected $rule"; failed=1 ;;
  esac
done
exit "$failed"
