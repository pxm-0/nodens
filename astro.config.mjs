import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const site = process.env.PUBLIC_SITE_URL ?? 'https://nodens.dev';

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      filter: (page) => new URL(page).pathname !== '/404/',
    }),
  ],
  build: {
    format: 'directory',
  },
  vite: {
    build: {
      assetsInlineLimit: 0,
    },
  },
});
