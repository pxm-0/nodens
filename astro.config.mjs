import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://nodens.dev',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
});
