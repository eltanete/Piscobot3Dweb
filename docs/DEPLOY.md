# Deploy en Hostinger

## Opción A — App Node.js (planes Business / Cloud) · recomendada

1. En hPanel → **Websites → Add website → Node.js app** y conectar el repo de GitHub `eltanete/Piscobot3Dweb`, rama `main`.
2. Configuración:
   - Node: 22 o superior
   - Build: `npm ci && npm run build`
   - Start: `npm start` (ejecuta `node ./dist/server/entry.mjs`)
   - Puerto: el que asigne Hostinger (el servidor lee `PORT`; usar `HOST=0.0.0.0` si lo pide).
3. **Variables de entorno** (copiar de `.env.example`):
   - `SITE_URL=https://piscobot3d.com`
   - `SMTP_HOST=smtp.hostinger.com`, `SMTP_PORT=465`, `SMTP_SECURE=true`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, `MAIL_TO_LEADS`
   - `PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` (crear el sitio en Cloudflare Turnstile, gratis)
   - `PUBLIC_GA_ID` (y opcional `PUBLIC_CLARITY_ID`)
   - Keystatic en producción: `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`, `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`
   - **Staging**: `PUBLIC_NOINDEX=true` (bloquea indexación y robots).

> Las variables `PUBLIC_*` se incrustan en el build: después de cambiarlas hay que **volver a construir**.

## Opción B — Hosting sin Node (plan Premium o inferior)

Pendiente de implementar si hace falta:

1. Cambiar el adaptador por salida estática pura (quitar `@astrojs/node`, `/api/*`, Keystatic en producción y la ruta comodín).
2. Crear `public/api/cotizacion.php` y `public/api/contacto.php` con la misma interfaz (multipart → JSON `{ ok, mensaje, errores }`) usando PHPMailer.
3. Redirecciones 301 en `public/.htaccess` (lista en `src/lib/redirects.mjs`).
4. Subir el contenido de `dist/` por FTP o Git.

## Lanzamiento

1. Publicar primero en un subdominio (p. ej. `nuevo.piscobot3d.com`) con `PUBLIC_NOINDEX=true`.
2. Probar: formularios con SMTP real, `npm run check:redirects -- https://nuevo.piscobot3d.com`, Lighthouse, celulares reales.
3. Apuntar el dominio principal, quitar `PUBLIC_NOINDEX`, rebuild.
4. Search Console: verificar el dominio y enviar `https://piscobot3d.com/sitemap-index.xml`.
5. Dejar el WordPress como respaldo 30 días.
