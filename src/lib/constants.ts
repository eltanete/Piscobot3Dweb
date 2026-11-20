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
    nombre: 'Industria y Técnica',
    corto: 'Industria',
    href: '/industria',
    bajada: 'Servicio técnico, capacitaciones, impresión y desarrollo de productos.',
  },
  marcas: {
    nombre: 'Marcas y Agencias',
    corto: 'Marcas',
    href: '/marcas',
    bajada: 'Merchandising curado y personalizable, proyectos especiales y activaciones.',
  },
};
