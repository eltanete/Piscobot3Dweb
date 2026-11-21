// @ts-check
import { defineConfig } from 'astro/config';
import { writeFile } from 'node:fs/promises';

import node from '@astrojs/node';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import keystatic from '@keystatic/astro';
import { REDIRECCIONES, PREFIJOS } from './src/lib/redirects.mjs';
import { CABECERAS } from './src/lib/seguridad.mjs';

/**
 * Destino de despliegue (variable DEPLOY_TARGET):
 * - "static" (por defecto en build): HTML estático + formularios PHP (public/api/*.php) + .htaccess.
 *   Para hosting compartido PHP/HTML (Hostinger Premium).
 * - "node": servidor Node con endpoints /api, Keystatic en producción y redirecciones en Node.
 *   Para Hostinger Business/Cloud (app Node.js).
 * En `astro dev` se usa "node" para tener Keystatic y los endpoints locales.
 */
const esDev = process.argv.includes('dev');
const TARGET = process.env.DEPLOY_TARGET ?? (esDev ? 'node' : 'static');
const esNode = TARGET === 'node';

/**
 * Rutas que sólo existen con servidor Node.
 * @returns {import('astro').AstroIntegration}
 */
function rutasNode() {
  return {
    name: 'piscobot:rutas-node',
    hooks: {
      'astro:config:setup': ({ injectRoute }) => {
        injectRoute({ pattern: '/api/health', entrypoint: './src/rutas-node/health.ts' });
        injectRoute({ pattern: '/api/cotizacion', entrypoint: './src/rutas-node/cotizacion.ts' });
        injectRoute({ pattern: '/api/contacto', entrypoint: './src/rutas-node/contacto.ts' });
        injectRoute({ pattern: '/[...ruta]', entrypoint: './src/rutas-node/comodin.ts' });
      },
    },
  };
}

/**
 * Genera dist/.htaccess (URLs limpias, 301 del WordPress, 404, caché) para hosting Apache/LiteSpeed.
 * @returns {import('astro').AstroIntegration}
 */
function htaccess() {
  return {
    name: 'piscobot:htaccess',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const reglas301 = Object.entries(REDIRECCIONES)
          .map(
            ([viejo, nuevo]) =>
              `RewriteRule ^${viejo.slice(1)}/?$ ${nuevo.replace('#', '\\#')} [R=301,L,NE]`,
          )
          .join('\n');
        const reglasPrefijo = Object.entries(PREFIJOS)
          .map(
            ([viejo, nuevo]) => `RewriteRule ^${viejo.slice(1)}(/.*)?/?$ ${nuevo}$1 [R=301,L,NE]`,
          )
          .join('\n');
        const cabeceras = Object.entries(CABECERAS)
          .map(([k, v]) => `  Header always set ${k} "${v}"`)
          .join('\n');
        const contenido = `# Generado automáticamente en el build (astro.config.mjs). No editar a mano.
Options -MultiViews -Indexes
DirectorySlash Off
DirectoryIndex index.html
ErrorDocument 404 /404.html

<IfModule mod_rewrite.c>
RewriteEngine On

# Forzar HTTPS
RewriteCond %{HTTPS} !=on
RewriteCond %{HTTP:X-Forwarded-Proto} !https
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]

# Redirecciones 301 desde el sitio WordPress (src/lib/redirects.mjs)
${reglas301}
${reglasPrefijo}

# Quitar la barra final (/empresas/ -> /empresas)
RewriteRule ^(.+)/$ /$1 [R=301,L]

# URLs limpias: /empresas -> empresas.html
RewriteCond %{DOCUMENT_ROOT}/$1.html -f
RewriteRule ^(.+)$ /$1.html [L]
</IfModule>

<IfModule mod_headers.c>
  <FilesMatch "\\.(js|css|woff2?|avif|webp|png|jpe?g|svg|ico|glb)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  <FilesMatch "\\.html$">
    Header set Cache-Control "public, max-age=0, must-revalidate"
  </FilesMatch>
${cabeceras}
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json image/svg+xml
</IfModule>
`;
        await writeFile(new URL('.htaccess', dir), contenido);
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://piscobot3d.com',
  output: 'static',
  ...(esNode ? { adapter: node({ mode: 'standalone' }) } : {}),
  trailingSlash: 'never',
  // En estático, /empresas se genera como empresas.html (Apache lo sirve con la regla del .htaccess).
  build: { format: esNode ? 'directory' : 'file', inlineStylesheets: 'always' },
  integrations: [
    react(),
    sitemap({
      filter: (page) => !/\/(404|keystatic)/.test(page),
      changefreq: 'monthly',
    }),
    mdx(),
    ...(esNode ? [keystatic(), rutasNode()] : [htaccess()]),
  ],
  vite: {
    plugins: [tailwindcss()],
    define: {
      // Los formularios llaman a /api/cotizacion (Node) o /api/cotizacion.php (estático).
      'import.meta.env.PUBLIC_API_EXT': JSON.stringify(esNode ? '' : '.php'),
    },
  },
});
