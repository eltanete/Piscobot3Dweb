# Seguridad

## Cabeceras HTTP activas

Las escribe el `.htaccess` que se genera en cada build (fuente: `src/lib/seguridad.mjs`). Requieren `mod_headers`, disponible en Hostinger.

| Cabecera                     | Valor                                                                                                                                                                                                                                                                      |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HTTPS forzado                | Redirección 301 de `http://` a `https://` (en el `.htaccess`)                                                                                                                                                                                                              |
| `Strict-Transport-Security`  | `max-age=31536000; includeSubDomains`                                                                                                                                                                                                                                      |
| `Content-Security-Policy`    | `default-src 'self'`; scripts, imágenes y conexiones sólo propios + GTM, GA4, Google Ads, Clarity y Turnstile; `frame-src` Turnstile y GTM; `object-src 'none'`; `base-uri 'self'`; `form-action 'self'` + WhatsApp; `frame-ancestors 'none'`; `upgrade-insecure-requests` |
| `X-Frame-Options`            | `DENY`                                                                                                                                                                                                                                                                     |
| `X-Content-Type-Options`     | `nosniff`                                                                                                                                                                                                                                                                  |
| `Referrer-Policy`            | `strict-origin-when-cross-origin`                                                                                                                                                                                                                                          |
| `Permissions-Policy`         | cámara, micrófono, geolocalización, pagos, USB y sensores desactivados                                                                                                                                                                                                     |
| `Cross-Origin-Opener-Policy` | `same-origin`                                                                                                                                                                                                                                                              |

> La CSP incluye `'unsafe-inline'` en scripts porque GTM y los scripts mínimos en línea (consentimiento, atribución, banner) lo necesitan. Si se suman herramientas nuevas en GTM (p. ej. Meta Pixel), hay que agregar su dominio en `src/lib/seguridad.mjs` y volver a publicar.

Verificar después de publicar: <https://securityheaders.com> con la URL del sitio.

## Formularios

- Validación del lado del servidor (PHP en producción, `public/api/_lib.php`; Node en desarrollo, `src/server/`), con las mismas reglas que el navegador.
- Cloudflare Turnstile (se activa con `PUBLIC_TURNSTILE_SITE_KEY` + `turnstile_secret` en `api/config.php`), campo trampa (honeypot) y límite de 5 envíos cada 10 minutos por IP.
- Sanitización: se eliminan caracteres de control; todo lo que va al mail se escapa (`htmlspecialchars`).

## Adjuntos

- Lista blanca: STL, STEP/STP, 3MF, PDF, JPG, PNG. **SVG no** (puede contener scripts).
- Se verifica el **tipo real** por el contenido del archivo (firma), no sólo la extensión.
- Máximo **50 MB** en total (`public/api/.user.ini` sube los límites de PHP).
- Se **renombran** (fecha + aleatorio) y se guardan **fuera de `public_html`**, en `piscobot-adjuntos/AAAA-MM/`, con permisos `0640` (sin ejecución) y un `.htaccess` que niega el acceso.
- Al mail se adjuntan sólo si suman hasta 15 MB; si no, el mail lista los archivos y dónde quedaron. Para descargarlos: hPanel → Administrador de archivos → carpeta `piscobot-adjuntos` (al lado de `public_html`).

## Claves y paneles

- Claves y contraseñas sólo en variables de entorno (GitHub Secrets) o en `public/api/config.php` en el servidor (excluido del repositorio por `.gitignore`).
- **Keystatic**: en la versión estática (Hostinger Premium) el panel **no se publica**; se usa sólo en la computadora del editor y los cambios se suben con Git. Si se pasa a Node, el panel en producción exige login con GitHub (GitHub App), ver `guia-editor.md`.

## Dependencias

- `npm audit --audit-level=high` corre en la CI de GitHub en cada push (hoy: 0 vulnerabilidades).
- **Dependabot** (`.github/dependabot.yml`) abre PRs semanales contra `develop`. Activar en GitHub → Settings → Code security → _Dependabot alerts_ y _security updates_.

## Mail: SPF, DKIM y DMARC (configurar en Hostinger)

Para que los avisos del formulario no caigan en spam, en hPanel → Dominios → `piscobot3d.com` → **DNS / Nameservers**:

1. **SPF** (registro TXT en `@`): `v=spf1 include:_spf.mail.hostinger.com ~all` (si ya existe un SPF, sumar el `include` al existente; debe haber uno solo).
2. **DKIM**: hPanel → Emails → `piscobot3d.com` → _Configuración DNS / Autenticación_ → activar DKIM (Hostinger crea el registro).
3. **DMARC** (TXT en `_dmarc`): empezar con `v=DMARC1; p=none; rua=mailto:info@piscobot3d.com` y, tras unas semanas sin problemas, pasar a `p=quarantine`.
4. Probar con <https://www.mail-tester.com> enviando una cotización de prueba.

## Privacidad

- Política de privacidad en `/privacidad` (Ley 25.326), enlazada en el footer y en el aviso de cookies. **Revisarla con asesoramiento legal** antes de publicar en el dominio principal.
- Aviso de cookies con opción de **rechazar**, conectado a Consent Mode v2 (ver `GTM.md`).
- No se ponen datos personales en las URLs: el formulario envía por POST; `utm_*`/`gclid` son parámetros de campaña, no personales.

## Respaldos

- Código y contenido (textos, casos, catálogo): en GitHub (`main`, `develop` y ramas). Cada cambio de Keystatic queda como commit.
- Hostinger hace backups semanales del hosting (hPanel → Backups). Descargar uno mensual con la carpeta `piscobot-adjuntos`.
- El backup del WordPress está en `C:\CLAUDE\piscobot3d-backup-2026-11-20` (fuera del repositorio).
