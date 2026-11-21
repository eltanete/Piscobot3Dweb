import type { Vertical } from './constants';

export interface NavItem {
  label: string;
  href: string;
  descripcion?: string;
}

export interface NavGroup {
  label: string;
  href: string;
  vertical: Vertical;
  items: NavItem[];
}

export const NAV_VERTICALES: NavGroup[] = [
  {
    label: 'Empresas e Industrias',
    href: '/empresas',
    vertical: 'industria',
    items: [
      {
        label: 'Servicio técnico',
        href: '/empresas/servicio-tecnico',
        descripcion: 'Diagnóstico, reparación y mantenimiento de impresoras 3D',
      },
      {
        label: 'Capacitaciones',
        href: '/empresas/capacitaciones',
        descripcion: 'Formación técnica para equipos y particulares',
      },
      {
        label: 'Impresión y desarrollo',
        href: '/empresas/impresion-y-desarrollo',
        descripcion: 'Piezas funcionales, diseño, ingeniería inversa y escaneo',
      },
    ],
  },
  {
    label: 'Marcas y Agencias',
    href: '/marcas',
    vertical: 'marcas',
    items: [
      {
        label: 'Regalos corporativos',
        href: '/marcas/regalos-corporativos',
        descripcion: 'Regalos a medida para clientes y equipos',
      },
      {
        label: 'Esculturas de marca',
        href: '/marcas/esculturas-de-marca',
        descripcion: 'Piezas de presencia para stands y espacios',
      },
      {
        label: 'Activaciones',
        href: '/marcas/activaciones',
        descripcion: 'Objetos para eventos y puntos de venta',
      },
      {
        label: 'Piezas de autor',
        href: '/marcas/piezas-de-autor',
        descripcion: 'Props funcionales para cine y contenido',
      },
      {
        label: 'Merchandising curado',
        href: '/marcas/merchandising',
        descripcion: 'Catálogo de objetos personalizables',
      },
    ],
  },
];

export const NAV_COMUNES: NavItem[] = [
  { label: 'Casos', href: '/casos' },
  { label: 'Recursos', href: '/recursos' },
  { label: 'Nosotros', href: '/nosotros' },
  { label: 'Contacto', href: '/contacto' },
];

export const NAV_FOOTER_EXTRA: NavItem[] = [
  { label: 'Condiciones', href: '/condiciones' },
  { label: 'Cotizar', href: '/cotizar' },
];
