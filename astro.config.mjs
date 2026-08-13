// @ts-check
import { defineConfig } from 'astro/config';
import { copyFileSync, existsSync } from 'node:fs';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

// https://astro.build/config

/** Meta files living at the project root, emitted to the site root on build. */
/** @type {() => import('astro').AstroIntegration} */
const metaFiles = () => ({
  name: 'meta-files',
  hooks: {
    'astro:build:done': ({ dir }) => {
      for (const file of ['robots.txt', 'site.webmanifest']) {
        const src = new URL(`./${file}`, import.meta.url);
        if (existsSync(src)) copyFileSync(src, new URL(file, dir));
      }
    },
  },
});

export default defineConfig({
  site: 'https://vortex.agency',
  output: 'static',
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  integrations: [
    metaFiles(),
    react(),
    sitemap({
      changefreq: 'monthly',
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
      },
    },
    build: {
      cssMinify: 'lightningcss',
      // Mantén assetsInlineLimit a 0: Astro 7 inlinea en el HTML todo
      // chunk de script sin imports (p. ej. el del Header o los bootstrap
      // de las islas). Con la CSP estricta de Layout.astro (script-src
      // 'self') esos scripts inline quedarían bloqueados y ninguna isla
      // React se hidrataría. Forzando la externalización, la CSP funciona.
      assetsInlineLimit: 0,
    },
  },
});
