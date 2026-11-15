# Public mirror

This private repository is the source of truth. A curated copy is published
one way to the public repository `pxm-0/nodens-public`, which builds its own
image, `ghcr.io/pxm-0/nodens-public`, from exactly those files.

- `mirror/allowlist.txt` lists the tracked paths that become public. Anything
  not listed stays private. A new file under an allowlisted directory (for
  example `src/`) is public on the next publish.
- `mirror/overlay/` is added on top: the public README and the public repo's
  image workflow.
- `mirror/gitleaks.toml` is the leak scan: gitleaks default secret rules plus
  the Argus #319 disclosure rules (internal hostnames, tailnet and private
  addresses, host paths, internal ports, Argus workload names, `.env` files),
  checked raw and base64/hex/percent-decoded. `mirror/scan.sh` also rejects
  lockfile URLs outside registry.npmjs.org.
- `.github/workflows/public-mirror.yml` copies, scans the source, proves the
  scan still blocks planted fake leaks (`mirror/selftest.sh`), builds the site
  from the mirror alone and scans `dist/`. On a green CI run of `main` (or a
  manual run on `main`) it replaces the public repository with one fresh
  commit. Pull requests run every step except the push.

Any scan finding stops the publish. Fix it by removing the content or the
allowlist entry; widen a rule's allowlist in `mirror/gitleaks.toml` only for a
value that is public on purpose.

## Run it locally

Needs Docker (the scanner runs in a pinned gitleaks container).

```bash
mirror/build.sh /tmp/nodens-mirror
```

```bash
mirror/scan.sh /tmp/nodens-mirror
```

```bash
mirror/selftest.sh /tmp/nodens-mirror
```

## One-time setup (owner only)

1. Create the public repository `pxm-0/nodens-public` with a README so it is
   not empty. In its settings turn off Issues, Projects and Wiki; optionally
   limit interactions to collaborators.
2. In `pxm-0/nodens`, create the Actions environment `public-mirror` with
   deployment branches limited to `main`. Create an SSH deploy key with write
   access on `pxm-0/nodens-public` and save its private half as the
   environment secret `PUBLIC_MIRROR_DEPLOY_KEY` there (not a repository
   secret, so only the publish job on `main` can read it).
3. Run the Public mirror workflow on `main` (or merge to `main`). Then check
   the public repository's Publish image run, and make the
   `ghcr.io/pxm-0/nodens-public` package public if GitHub created it private.
4. Only after Argus's GHCR read token (`docs/RUNBOOKS/ghcr-token-rotation.md`
   in Argus) is live on the server and `argus doctor` passes: make the
   `ghcr.io/pxm-0/nodens` package private and prove the server still pulls the
   pinned digest; then make `pxm-0/nodens` private.

History already published from `pxm-0/nodens`, and its existing public image
layers, stay public; the mirror protects only what is committed from now on.
