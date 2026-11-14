# Dev toolchain for the compose `dev` service and the devcontainer: the pinned
# Node and npm, plus Playwright's Chromium for test:e2e and test:lighthouse (as CI does).
FROM node:22.19.0-bookworm@sha256:afff6d8c97964a438d2e6a9c96509367e45d8bf93f790ad561a1eaea926303d9
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright \
    CHROME_PATH=/usr/local/bin/chromium
RUN npm install --global npm@11.12.1 \
 && npx --yes playwright@1.62.1 install --with-deps chromium \
 && ln -s "$(find /ms-playwright -path '*chrome-linux*/chrome' -type f | head -n 1)" /usr/local/bin/chromium \
 && chromium --version
WORKDIR /app
