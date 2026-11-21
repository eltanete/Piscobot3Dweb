# PISCOBOT 3D — sitio web

Sitio de PISCOBOT 3D construido con **Astro + Tailwind CSS**, con backend Node integrado (formularios y cotizaciones) y CMS **Keystatic**. Reemplaza el sitio WordPress + Divi.

Plan de implementación: [`docs/PLAN-IMPLEMENTACION.md`](docs/PLAN-IMPLEMENTACION.md).

## Requisitos

- Node.js ≥ 22 (ver `.nvmrc`)
- npm

## Primeros pasos

```bash
npm install
cp .env.example .env   # completar variables
npm run dev            # http://localhost:4321
```

## Scripts

| Comando           | Qué hace                                        |
| ----------------- | ----------------------------------------------- |
| `npm run dev`     | Servidor de desarrollo                          |
| `npm run build`   | Build de producción en `dist/`                  |
| `npm start`       | Corre el build (`node ./dist/server/entry.mjs`) |
| `npm run preview` | Vista previa del build                          |
| `npm run check`   | Chequeo de tipos de Astro/TypeScript            |
| `npm run lint`    | ESLint                                          |
| `npm run format`  | Prettier                                        |
| `npm test`        | Tests unitarios (Vitest)                        |

## Arquitectura

- **Front:** páginas pre-renderizadas a HTML estático (`src/pages`).
- **Back:** endpoints en `src/pages/api/*` con `export const prerender = false`, servidos por `@astrojs/node`.
  - `GET /api/health` — chequeo de estado.
- **Contenido:** `src/content/` (editable desde Keystatic, a partir de la Fase 6).

## Deploy (Hostinger, app Node.js)

- Build: `npm run build`
- Start: `npm start`
- Variables de entorno: las de `.env.example`, cargadas en el panel de Hostinger.

## Flujo de ramas

`main` = producción · `develop` = integración · una rama `feature/*` por tarea, creada desde `develop` y mergeada a `develop` al terminar. Detalle obligatorio en [CLAUDE.md](CLAUDE.md). Los commits directos en `main`/`develop` están bloqueados por `.githooks/pre-commit`.
