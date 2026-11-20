# PISCOBOT 3D — sitio web

Sitio nuevo de PISCOBOT 3D que reemplaza WordPress + Divi. Plan completo: `docs/PLAN-IMPLEMENTACION.md`.

## Stack

- Astro + TypeScript (strict), Tailwind CSS v4 (tokens en `src/styles/global.css` vía `@theme`).
- Adaptador `@astrojs/node` (standalone). Páginas pre-renderizadas; sólo `src/pages/api/*` y Keystatic usan `export const prerender = false`.
- Islas interactivas en React (`src/components/islands/`). Keystatic como CMS.
- Validación con zod compartida entre front y back (`src/server/schemas.ts`).

## Convenciones

- Contenido en `src/content/` (colecciones tipadas en `src/content.config.ts`), nunca hardcodeado en componentes.
- Dos verticales: `industria` y `marcas`. El acento de color cambia con `data-vertical`.
- Mobile first: diseñar en 375 px, luego 768 / 1280 / 1440.
- Textos de UI en español rioplatense (vos).
- WhatsApp siempre con `wa.me` + mensaje pre-cargado (`src/lib/whatsapp.ts`).
- Secretos sólo en `.env` (ver `.env.example`). El backup del WordPress vive fuera del repo.

## Comandos

- `npm run dev` — servidor local (http://localhost:4321)
- `npm run build` — build a `dist/` (server: `node ./dist/server/entry.mjs`)
- `npm run lint` / `npm run format` / `npm run check`
