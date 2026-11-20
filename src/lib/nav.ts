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
    label: 'Industria y Técnica',
    href: '/industria',
    vertical: 'industria',
    items: [
      {
        label: 'Servicio técnico',
        href: '/industria/servicio-tecnico',
        descripcion: 'Diagnóstico, reparación y mantenimiento de impresoras 3D',
      },
      {
        label: 'Capacitaciones',
        href: '/industria/capacitaciones',
        descripcion: 'Formación técnica para equipos y particulares',
      },
      {
        label: 'Impresión y desarrollo',
        href: '/industria/impresion-y-desarrollo',
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
        label: 'Merchandising',
        href: '/marcas/merchandising',
        descripcion: 'Objetos curados y personalizables con tu marca',
      },
      {
        label: 'Proyectos especiales',
        href: '/marcas/proyectos-especiales',
        descripcion: 'Activaciones, displays y piezas únicas',
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
