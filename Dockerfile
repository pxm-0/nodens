FROM node:22.19.0-alpine3.22@sha256:d2166de198f26e17e5a442f537754dd616ab069c47cc57b889310a717e0abbf9 AS build
WORKDIR /app
RUN npm install --global npm@11.12.1
COPY package*.json ./
RUN npm ci
ARG PUBLIC_SITE_URL=https://nodens.dev
ARG PUBLIC_CONTACT_EMAIL=dustin@nodens.dev
ARG PUBLIC_GITHUB_URL=https://github.com/pxm-0
ENV PUBLIC_SITE_URL=$PUBLIC_SITE_URL \
    PUBLIC_CONTACT_EMAIL=$PUBLIC_CONTACT_EMAIL \
    PUBLIC_GITHUB_URL=$PUBLIC_GITHUB_URL
COPY . .
RUN npm run build

FROM nginx:1.31.4-alpine3.24@sha256:db35bfc6b2951e7f8a72db5db120288c127ffaeeb4a6d4b95a26fead017d5913
RUN apk upgrade --no-cache
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz || exit 1
