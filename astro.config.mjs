import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://jamesjrmurray.co.uk',
  build: { format: 'directory' },
  integrations: [sitemap()],
  // Never inline scripts: the CSP allows scripts from this site and Google Tag Manager only.
  vite: { plugins: [tailwindcss()], build: { assetsInlineLimit: 0 } },
});
