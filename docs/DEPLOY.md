# Deploy en Hostinger

El proyecto compila para dos destinos (variable `DEPLOY_TARGET`):

| Destino                | Plan de Hostinger                              | Qué genera                                                   |
| ---------------------- | ---------------------------------------------- | ------------------------------------------------------------ |
| `static` (por defecto) | **Premium** — "Sitio web PHP/HTML" (el actual) | HTML estático + formularios PHP (`/api/*.php`) + `.htaccess` |
| `node`                 | Business / Cloud — "App web de Node.js"        | Servidor Node con endpoints `/api`, Keystatic en producción  |

Requisitos del hosting PHP: **PHP 8.1 o superior** (hPanel → Avanzado → Configuración de PHP) y la casilla **info@piscobot3d.com** creada en Hostinger (los formularios envían desde ahí con `mail()`).

---

## A. Deploy manual (copiar la carpeta)

1. Compilar para el subdominio de prueba (PowerShell, en la carpeta del proyecto):
   ```powershell
   $env:SITE_URL="https://dev.piscobot3d.com"; $env:PUBLIC_NOINDEX="true"; npm run build
   ```
   Para el dominio definitivo: `$env:SITE_URL="https://piscobot3d.com"; $env:PUBLIC_NOINDEX="false"; npm run build`
2. Subir **todo el contenido de la carpeta `dist/`** (no la carpeta en sí) a la carpeta raíz del subdominio en Hostinger
   (Administrador de archivos → la carpeta de `dev.piscobot3d.com`, normalmente `public_html` del subdominio).
   - Incluir el archivo oculto **`.htaccess`** y la carpeta **`api/`**. Si usás el Administrador de archivos, lo más seguro es comprimir el contenido de `dist/` en un zip, subirlo y extraerlo allí.
   - Antes, borrar lo que haya en esa carpeta (p. ej. el `index` por defecto de Hostinger).
3. (Opcional) Crear `api/config.php` en el servidor copiando `api/config.example.php`, si querés cambiar el email destino o activar Turnstile.

## B. Deploy automático (cada push a `main`)

Ya está armado en `.github/workflows/deploy.yml`. Para activarlo, en GitHub → repo → **Settings → Secrets and variables → Actions**:

**Secrets** (pestaña _Secrets_):

| Nombre                 | Valor                                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------------------- |
| `FTP_SERVER`           | Servidor FTP de Hostinger (hPanel → Archivos → Cuentas FTP), p. ej. `ftp.piscobot3d.com` o una IP |
| `FTP_USERNAME`         | Usuario FTP (conviene crear una cuenta FTP limitada a la carpeta del subdominio)                  |
| `FTP_PASSWORD`         | Contraseña de esa cuenta                                                                          |
| `TURNSTILE_SECRET_KEY` | (opcional) clave secreta de Cloudflare Turnstile                                                  |

**Variables** (pestaña _Variables_):

| Nombre                                      | Valor para dev                                                                                                            |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `DEPLOY_ENABLED`                            | `true`                                                                                                                    |
| `SITE_URL`                                  | `https://dev.piscobot3d.com`                                                                                              |
| `PUBLIC_NOINDEX`                            | `true`                                                                                                                    |
| `FTP_SERVER_DIR`                            | carpeta destino relativa a la cuenta FTP, terminada en `/` (si la cuenta FTP ya apunta a la carpeta del subdominio: `./`) |
| `FTP_PROTOCOL`                              | `ftps` (si falla, probar `ftp`)                                                                                           |
| `MAIL_TO`                                   | (opcional) email que recibe las cotizaciones; por defecto `info@piscobot3d.com`                                           |
| `PUBLIC_TURNSTILE_SITE_KEY`, `PUBLIC_GA_ID` | (opcional)                                                                                                                |

Después de cargarlas: **Actions → Deploy Hostinger → Run workflow** (o cualquier push a `main`). El workflow corre los tests, compila y sube sólo los archivos que cambiaron.

> Las variables `PUBLIC_*` y `SITE_URL` se incrustan al compilar: si las cambiás, volvé a correr el deploy.

---

## Verificar después de cada deploy

1. Navegar el sitio, probar el formulario de **Cotizar** (llega un email a info@piscobot3d.com y otro de confirmación).
2. Redirecciones y 404:
   ```bash
   npm run check:redirects -- https://dev.piscobot3d.com
   ```
3. `https://dev.piscobot3d.com/robots.txt` debe decir `Disallow: /` mientras sea de prueba.

## Pasar a producción (piscobot3d.com)

1. Compilar/deployar con `SITE_URL=https://piscobot3d.com` y `PUBLIC_NOINDEX=false`.
2. Subir el contenido de `dist/` a la carpeta del dominio principal (reemplaza al WordPress: **hacer backup completo antes**), o apuntar el dominio a la carpeta nueva.
3. Search Console: enviar `https://piscobot3d.com/sitemap-index.xml` y revisar errores 404 la primera semana.

## Opción Node (si más adelante se contrata Business)

- hPanel → Crear sitio → App web de Node.js → conectar GitHub (`eltanete/Piscobot3Dweb`, rama `main`).
- Build: `npm ci && npm run build` con la variable `DEPLOY_TARGET=node`. Start: `npm start`.
- Variables: las de `.env.example` (SMTP, Turnstile, Keystatic).
- Ventaja: panel `/keystatic` editable desde la web (requiere GitHub App, ver `guia-editor.md`).
