import type { ImageMetadata } from 'astro';
import type { CollectionEntry } from 'astro:content';
import { rutaServicio } from './constants';

type Caso = CollectionEntry<'casos'>;

/** Nombre visible del cliente respetando el permiso (mostrarNombreCliente). */
export function nombreCliente(caso: Caso): string | null {
  const d = caso.data;
  if (d.mostrarNombreCliente && d.cliente) return d.cliente;
  return d.descripcionGenerica ?? null;
}

/** Casos publicables (sin borradores). */
export const publicable = (caso: Caso) => !caso.data.borrador;

/**
 * URL del caso: los insignia tienen página propia; las fichas se abren en un modal de /casos
 * (con hash para compartir); la galería no tiene detalle.
 */
export function urlCaso(caso: Caso): string {
  return caso.data.nivel === 'insignia' ? `/casos/${caso.id}` : `/casos#${caso.id}`;
}

/** Todas las fotos del caso con texto alternativo (portada, galería y fotos nuevas). */
export function fotosDe(caso: Caso): { src: ImageMetadata; alt: string }[] {
  const d = caso.data;
  const lista: { src: ImageMetadata; alt: string }[] = [];
  if (d.imagen) lista.push({ src: d.imagen, alt: d.imagenAlt ?? d.titulo });
  d.galeria.forEach((src, i) => lista.push({ src, alt: `${d.titulo} — foto ${i + 2}` }));
  d.fotos.forEach((f) => lista.push(f));
  return lista;
}

/** CTA del caso: el propio o el de su línea. */
export function ctaCaso(caso: Caso): { label: string; href: string } {
  const d = caso.data;
  if (d.cta) return d.cta;
  return { label: 'Ver la línea de servicio', href: rutaServicio(d.vertical, d.servicio) };
}

/** Orden del portfolio: insignia por orden; fichas por fecha (más nuevas primero) y luego orden. */
export function ordenarFichas(a: Caso, b: Caso): number {
  const fa = a.data.fecha?.valueOf() ?? 0;
  const fb = b.data.fecha?.valueOf() ?? 0;
  return fb - fa || a.data.orden - b.data.orden;
}
