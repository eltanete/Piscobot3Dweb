# PISCOBOT 3D — sitio web

Sitio nuevo de PISCOBOT 3D que reemplaza WordPress + Divi. Plan completo: `docs/PLAN-IMPLEMENTACION.md`.
**Para retomar el trabajo, leer primero `docs/ESTADO.md`** (qué está hecho, qué falta, decisiones).
Backup del WordPress (fuente de contenido e imágenes): `C:\CLAUDE\piscobot3d-backup-2026-11-20\` (fuera del repo).

## ⚠️ REGLA OBLIGATORIA — Manejo de ramas (aplica a TODAS las sesiones y tareas)

| Rama                                                   | Rol                                                                                                                                                 |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `main`                                                 | **Producción.** Sólo recibe merges desde `develop` cuando el usuario pide publicar/liberar. Nunca se trabaja ni se commitea directo.                |
| `develop`                                              | **Integración.** Contiene todo el trabajo terminado. Toda tarea nueva sale de acá. Nunca se commitea directo: sólo recibe merges de ramas de tarea. |
| `feature/<nombre>` · `fix/<nombre>` · `chore/<nombre>` | **Una rama por tarea**, siempre creada desde `develop` actualizado.                                                                                 |

**Flujo que hay que seguir siempre, sin excepción:**

1. **Antes de empezar cualquier tarea:** verificar con `git status` y `git branch` que no haya una rama de tarea terminada sin mergear. Si la hay, **mergearla primero a `develop`** (paso 4).
2. **Crear la rama de la tarea desde `develop`:**
   ```bash
   git switch develop && git pull origin develop
   git switch -c feature/<nombre-corto>
   ```
3. Trabajar y commitear en esa rama. Antes de darla por terminada: `npm run lint`, `npm run check`, `npm test` y `npm run build` sin errores.
4. **Al terminar la tarea, mergear a `develop` automáticamente (sin esperar a que lo pidan) y subirla:**
   ```bash
   git switch develop && git pull origin develop
   git merge --no-ff feature/<nombre-corto> -m "Merge feature/<nombre-corto> en develop"
   git push origin develop
   git push origin feature/<nombre-corto>
   ```
5. **La próxima tarea vuelve a salir de `develop`** (paso 2). Nunca encadenar una rama de tarea sobre otra.
6. **`develop` → `main` sólo cuando el usuario lo pide** (publicar a producción):
   ```bash
   git switch main && git pull origin main
   git merge --no-ff develop -m "Release: <descripción>"
   git push origin main
   ```

Notas:

- Un hook de Git (`.githooks/pre-commit`, activado por `npm install` vía el script `prepare`) **bloquea los commits directos en `main` y `develop`**. No saltearlo con `--no-verify`.
- Si hay conflictos al mergear, resolverlos en la rama de tarea (mergeando `develop` en ella) y volver al paso 4.
- Nunca reescribir historia ya publicada (`push --force`) en `main` ni `develop`.

## Stack

- Astro + TypeScript (strict), Tailwind CSS v4 (tokens en `src/styles/global.css` vía `@theme`).
- Dos destinos de build (`DEPLOY_TARGET`): `static` (por defecto; Hostinger Premium: HTML + `public/api/*.php` + `.htaccess` generado) y `node` (adaptador `@astrojs/node`; rutas en `src/rutas-node/` inyectadas desde `astro.config.mjs`). En `astro dev` se usa `node`.
- Islas interactivas en React (`src/components/islands/`). Keystatic como CMS (sólo en `node`/dev).
- Validación con zod compartida entre front y back (`src/server/schemas.ts`). Las reglas de `public/api/_lib.php` deben coincidir.
- Redirecciones 301 del WordPress: `src/lib/redirects.mjs` (Node: `src/rutas-node/comodin.ts`; estático: `.htaccess`). No usar middleware: no corre en rutas inexistentes.
- `src/content.config.ts` y `keystatic.config.ts` describen el mismo contenido: mantenerlos sincronizados.

## Convenciones

- Contenido en `src/content/` (colecciones tipadas en `src/content.config.ts`), nunca hardcodeado en componentes.
- Dos verticales: `industria` y `marcas`. El acento de color cambia con `data-vertical`.
- Mobile first: diseñar en 375 px, luego 768 / 1280 / 1440.
- Textos de UI en español rioplatense (vos).
- WhatsApp siempre con `wa.me` + mensaje pre-cargado (`src/lib/whatsapp.ts`).
- Imágenes: originales en `src/assets/images/<sección>/`, luego `npm run images:optimize`. Guía: `docs/IMAGENES.md`.
- Secretos sólo en `.env` (ver `.env.example`). El backup del WordPress vive fuera del repo.

## Comandos

- `npm run dev` — servidor local (http://localhost:4321)
- `npm run build` — build estático a `dist/` (para Node: `DEPLOY_TARGET=node`)
- `npm run lint` / `npm run format` / `npm run check` / `npm test`
- Deploy: ver `docs/DEPLOY.md`
