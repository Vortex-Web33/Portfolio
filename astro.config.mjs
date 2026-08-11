// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import prefetch from '@astrojs/prefetch';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://vortex.agency',
  output: 'static',
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
  integrations: [
    sitemap({
      changefreq: 'monthly',
      priority: 0.7,
      lastmod: new Date(),
    }),
    prefetch({
      selector: 'a[href^="/"]:not([href^="/_astro"]):not([rel~="external"])',
      throttle: 2,
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
    },
  },
});
