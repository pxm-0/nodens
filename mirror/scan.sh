#!/usr/bin/env bash
# Usage: mirror/scan.sh DIR
# Fails if DIR holds anything that must not be public: secrets, secret files, internal hosts,
# tailnet or private addresses, host paths, internal ports or workload names (raw or encoded).
set -euo pipefail
dir=$(cd "$1" && pwd)
here=$(cd "$(dirname "$0")" && pwd)
gitleaks_image=zricethezav/gitleaks:v8.28.0@sha256:cdbb7c955abce02001a9f6c9f602fb195b7fadc1e812065883f695d1eeaba854
status=0
# gitleaks skips lockfiles, images, fonts, PDFs, node_modules/ and some filenames. Scan a
# printable-strings copy of every file as <path>.txt too, so nothing is skipped.
shadow=$(mktemp -d)
trap 'rm -rf "$shadow"' EXIT
(cd "$dir" && find . -type f) | while IFS= read -r file; do
  mkdir -p "$shadow/$(dirname "$file")"
  strings -n 4 "$dir/$file" >"$shadow/$file.txt"
done
if [ -f "$dir/package-lock.json" ] &&
  grep -E '"resolved": "' "$dir/package-lock.json" | grep -vE '"resolved": "https://registry\.npmjs\.org/' >/dev/null; then
  echo "mirror/scan.sh: package-lock.json resolves packages outside registry.npmjs.org" >&2
  status=1
fi
for target in "$dir" "$shadow"; do
  docker run --rm --network none \
    -v "$target:/scan:ro" -v "$here/gitleaks.toml:/rules.toml:ro" \
    "$gitleaks_image" dir /scan --config /rules.toml --max-decode-depth 3 \
    --redact --verbose --no-color --no-banner --exit-code 1 || status=1
done
exit "$status"
