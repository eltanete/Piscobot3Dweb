# PISCOBOT 3D — sitio web

Sitio nuevo de PISCOBOT 3D que reemplaza WordPress + Divi. Plan completo: `docs/PLAN-IMPLEMENTACION.md`.
**Para retomar el trabajo, leer primero `docs/ESTADO.md`** (qué está hecho, qué falta, decisiones).
Backup del WordPress (fuente de contenido): `C:\CLAUDE\backup-wp\` (fuera del repo).

## Stack

- Astro + TypeScript (strict), Tailwind CSS v4 (tokens en `src/styles/global.css` vía `@theme`).
- Adaptador `@astrojs/node` (standalone). Páginas pre-renderizadas; sólo `src/pages/api/*` y Keystatic usan `export const prerender = false`.
- Islas interactivas en React (`src/components/islands/`). Keystatic como CMS.
- Validación con zod compartida entre front y back (`src/server/schemas.ts`).
- Redirecciones 301 del WordPress: `src/lib/redirects.mjs`, aplicadas por la ruta comodín `src/pages/[...ruta].ts` (no usar middleware: no corre en rutas inexistentes).
- `src/content.config.ts` y `keystatic.config.ts` describen el mismo contenido: mantenerlos sincronizados.

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
