// Redirecciones 301. Fuente única: la usan astro.config.mjs (.htaccess), src/rutas-node/comodin.ts
// y scripts/check-redirects.mjs.
const guias = [
  'problemas-de-extrusion',
  'fallas-mecanicas',
  'problemas-de-adhesion',
  'fallas-recurrentes',
  'problemas-electronicos',
  'fallas-termicas',
];

/** Rutas exactas (sin barra final; la variante con barra también redirige). */
/** @type {Record<string, string>} */
export const REDIRECCIONES = {
  // Sitio WordPress anterior
  '/servicio-tecnico-impresora-3d': '/empresas/servicio-tecnico',
  '/capacitacion-tecnica-en-impresion-3d': '/empresas/capacitaciones',
  '/impresion-3d': '/empresas/impresion-y-desarrollo',
  '/diseno-3d-y-desarrollos': '/empresas/impresion-y-desarrollo#diseno',
  '/merchandising': '/marcas/merchandising',
  '/garantias': '/condiciones',
  '/blog': '/recursos',
  ...Object.fromEntries(guias.map((g) => [`/${g}`, `/recursos/${g}`])),
  // Cambios de estructura del sitio nuevo
  '/marcas/proyectos-especiales': '/marcas/piezas-de-autor',
};

/** Prefijos: /industria/servicio-tecnico -> /empresas/servicio-tecnico. */
/** @type {Record<string, string>} */
export const PREFIJOS = {
  '/industria': '/empresas',
};

/** Resuelve el destino 301 de una ruta (sin barra final), o null. */
export function destinoRedireccion(ruta) {
  if (REDIRECCIONES[ruta]) return REDIRECCIONES[ruta];
  for (const [viejo, nuevo] of Object.entries(PREFIJOS)) {
    if (ruta === viejo || ruta.startsWith(`${viejo}/`)) {
      const resto = ruta.slice(viejo.length);
      return REDIRECCIONES[`${nuevo}${resto}`] ?? `${nuevo}${resto}`;
    }
  }
  return null;
}
