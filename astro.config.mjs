// @ts-check
import { defineConfig } from 'astro/config';

import node from '@astrojs/node';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import keystatic from '@keystatic/astro';

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://piscobot3d.com',
  // Páginas pre-renderizadas por defecto; los endpoints de /api usan `prerender = false`.
  output: 'static',
  adapter: node({
    mode: 'standalone',
  }),
  trailingSlash: 'never',
  integrations: [
    react(),
    sitemap({
      filter: (page) => !/\/(404|keystatic)/.test(page),
      changefreq: 'monthly',
    }),
    mdx(),
    keystatic(),
  ],
  // Las redirecciones 301 del WordPress viven en src/lib/redirects.mjs y las aplica src/middleware.ts.
  vite: {
    plugins: [tailwindcss()],
  },
});
