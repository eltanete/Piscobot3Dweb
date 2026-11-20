// Redirecciones 301 desde las URLs del sitio WordPress actual.
// Fuente única: la usan astro.config.mjs y el script de verificación (scripts/check-redirects.mjs).
const guias = [
  'problemas-de-extrusion',
  'fallas-mecanicas',
  'problemas-de-adhesion',
  'fallas-recurrentes',
  'problemas-electronicos',
  'fallas-termicas',
];

/** @type {Record<string, string>} */
export const REDIRECCIONES = {
  '/servicio-tecnico-impresora-3d': '/industria/servicio-tecnico',
  '/capacitacion-tecnica-en-impresion-3d': '/industria/capacitaciones',
  '/impresion-3d': '/industria/impresion-y-desarrollo',
  '/diseno-3d-y-desarrollos': '/industria/impresion-y-desarrollo#diseno',
  '/merchandising': '/marcas/merchandising',
  '/garantias': '/condiciones',
  '/blog': '/recursos',
  ...Object.fromEntries(guias.map((g) => [`/${g}`, `/recursos/${g}`])),
};
