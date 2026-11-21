import sitio from '../content/sitio.json';

export const SITE = {
  name: sitio.nombre,
  description: sitio.descripcion,
  locale: 'es-AR',
} as const;

export { sitio };

export type Vertical = 'industria' | 'marcas';

export const VERTICALES: Record<
  Vertical,
  { nombre: string; corto: string; href: string; bajada: string }
> = {
  industria: {
    nombre: 'Empresas e Industrias',
    corto: 'Empresas',
    href: '/empresas',
    bajada: 'Servicio técnico, capacitaciones, impresión y desarrollo de productos.',
  },
  marcas: {
    nombre: 'Marcas y Agencias',
    corto: 'Marcas',
    href: '/marcas',
    bajada:
      'Regalos corporativos, esculturas, activaciones, piezas de autor y merchandising curado.',
  },
};

/** URL pública de un servicio según su vertical (p. ej. /empresas/servicio-tecnico). */
export const rutaServicio = (vertical: Vertical, id: string) =>
  `${VERTICALES[vertical].href}/${id}`;
