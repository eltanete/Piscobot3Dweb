/**
 * Ruta pública limpia de la página actual. En el build estático (formato "file") Astro
 * expone /empresas.html o /index.html; acá se normaliza a /empresas o /.
 */
export function rutaLimpia(url: URL): string {
  const p = url.pathname
    .replace(/\.html$/, '')
    .replace(/\/index$/, '/')
    .replace(/(.)\/$/, '$1');
  return p || '/';
}
