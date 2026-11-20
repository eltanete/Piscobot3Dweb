import { sitio } from './constants';

/**
 * Link `wa.me` (abre la app en mobile, WhatsApp Web en desktop) con mensaje pre-cargado.
 */
export function whatsappUrl(mensaje?: string, numero: string = sitio.whatsapp): string {
  const limpio = numero.replace(/\D/g, '');
  const base = `https://wa.me/${limpio}`;
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base;
}

export const MENSAJES_WHATSAPP = {
  general: 'Hola PISCOBOT 3D, quiero hacer una consulta.',
  servicioTecnico: 'Hola, quiero coordinar un diagnóstico para mi impresora 3D.',
  capacitaciones: 'Hola, quiero información sobre las capacitaciones técnicas en impresión 3D.',
  impresion: 'Hola, quiero cotizar una impresión / desarrollo de pieza en 3D.',
  merchandising: 'Hola, quiero recibir el catálogo de merchandising impreso en 3D.',
  proyectos: 'Hola, quiero contarles sobre un proyecto especial / activación de marca.',
} as const;
