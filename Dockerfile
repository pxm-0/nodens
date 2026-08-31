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

FROM nginx:1.29.1-alpine3.22@sha256:42a516af16b852e33b7682d5ef8acbd5d13fe08fecadc7ed98605ba5e3b26ab8
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz || exit 1
