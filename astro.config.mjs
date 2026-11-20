// @ts-check
import { defineConfig } from 'astro/config';

import node from '@astrojs/node';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://piscobot3d.com',
  // Páginas pre-renderizadas por defecto; los endpoints de /api usan `prerender = false`.
  output: 'static',
  adapter: node({
    mode: 'standalone',
  }),
  trailingSlash: 'never',
  integrations: [react(), sitemap(), mdx()],
  // Redirecciones 301 desde el WordPress actual (se completan en la Fase 7).
  redirects: {},
  vite: {
    plugins: [tailwindcss()],
  },
});
