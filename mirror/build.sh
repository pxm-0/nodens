#!/usr/bin/env bash
# Usage: mirror/build.sh OUT_DIR
# Copies the allowlisted tracked files plus mirror/overlay/ into a new, empty OUT_DIR.
# Only tracked files are read, so untracked secrets (.env, local config) can never be copied.
set -euo pipefail
root=$(git rev-parse --show-toplevel)
out=$1
if [ -e "$out" ] && [ -n "$(ls -A "$out")" ]; then
  echo "mirror/build.sh: $out is not empty" >&2
  exit 1
fi
mkdir -p "$out"
paths=()
while IFS= read -r line; do
  case "$line" in ''|'#'*) continue ;; esac
  if [ -z "$(git -C "$root" ls-files -- "$line")" ]; then
    echo "mirror/build.sh: allowlist entry '$line' matches no tracked file" >&2
    exit 1
  fi
  paths+=("$line")
done < "$root/mirror/allowlist.txt"
git -C "$root" ls-files -z -- "${paths[@]}" | tar -C "$root" --null -T - -cf - | tar -C "$out" -xf -
cp -R "$root/mirror/overlay/." "$out/"
# A symlink could point a later build step at private files outside the mirror.
links=$(find "$out" -type l)
if [ -n "$links" ]; then
  echo "mirror/build.sh: symlinks are not allowed in the mirror:" >&2
  echo "$links" >&2
  exit 1
fi
echo "mirror/build.sh: $(find "$out" -type f | wc -l | tr -d ' ') files in $out"
