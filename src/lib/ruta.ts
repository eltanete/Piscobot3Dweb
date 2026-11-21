/**
 * Ruta pública limpia de la página actual. En el build estático (formato "file") Astro
 * expone /industria.html o /index.html; acá se normaliza a /industria o /.
 */
export function rutaLimpia(url: URL): string {
  const p = url.pathname
    .replace(/\.html$/, '')
    .replace(/\/index$/, '/')
    .replace(/(.)\/$/, '$1');
  return p || '/';
}
