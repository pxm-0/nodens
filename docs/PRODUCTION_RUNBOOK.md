# Production runbook

## 1. Configure GitHub once

- Protect main: require pull requests and the validate and container checks, require
  branches to be up to date, enforce for administrators, disable force pushes and
  deletion, and set required approvals to zero for the solo-owner workflow.
- Create the production environment with Dustin Aceveda as the required reviewer and
  self-review enabled.
- Make the ghcr.io/pxm-0/nodens package public after its first publish. The static
  image contains no registry credential.
- Add only these environment secrets: TAILSCALE_OAUTH_CLIENT_ID,
  TAILSCALE_OAUTH_SECRET, NODENS_DEPLOY_TARGET, NODENS_DEPLOY_KEY, and
  NODENS_DEPLOY_KNOWN_HOSTS. The target must be a restricted deploy account on the
  private network.
- Set the NODENS_PUBLIC_URL repository variable only after public DNS is live. Before
  then, the deploy script deliberately validates the local origin only.

## 2. Configure the host

Install Docker and place the deployment files at /opt/nodens/; no repository clone is
needed. Run Cloudflare Tunnel as an independent host service, not as a Nodens
container. Its ingress ends with the catch-all 404 rule:

~~~yaml
ingress:
  - hostname: nodens.dev
    service: http://127.0.0.1:8082
  - service: http_status:404
~~~

Use the provider-generated tunnel credentials outside this repository. The service
must be enabled independently so container restarts cannot take down the tunnel.

## 3. Configure Cloudflare and mail

- Route the apex through the tunnel. Create a proxied www record and a permanent
  Cloudflare redirect from www.nodens.dev to https://nodens.dev.
- Enforce HTTPS, TLS 1.2+, and HSTS with max-age=31536000; do not enable
  includeSubDomains or preload yet.
- Preserve the existing Google verification and MX records. If Google Workspace is
  the sole sender, add v=spf1 include:_spf.google.com ~all, generate a
  provider-supplied 2048-bit DKIM record, and start DMARC with
  v=DMARC1; p=none.

## 4. Release and verify

1. Merge a green PR. The production workflow builds, publishes, and records one
   immutable image digest.
2. Approve the protected deployment. The script deploys that digest only to
   127.0.0.1:8082, then rolls back automatically if health, local HTTP, or the
   configured public URL fails.
3. Verify https://nodens.dev, the permanent www redirect, /healthz, security headers,
   custom 404, sitemap, robots, and the four featured destinations.
4. Submit the sitemap using the existing verified search property. Confirm Google
   Workspace send/receive and SPF/DKIM alignment before advancing DMARC to
   p=quarantine.
5. Run one controlled rollback drill. Update the Oreo deployment skill only after the
   cutover is evidenced; its fallback must use an immutable digest on port 8082,
   never a server-side source build.

## Evidence boundary

Repository checks prove source, container, and workflow behavior. DNS, Cloudflare,
mail authentication, package visibility, and live public behavior are separate
production evidence and must be recorded at cutover.
