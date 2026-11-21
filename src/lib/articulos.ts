import type { CollectionEntry } from 'astro:content';

type Articulo = CollectionEntry<'articulos'>;

/** Artículos publicables (sin borradores). */
export const publicado = (a: Articulo) => !a.data.borrador;

/** Minutos de lectura: el valor cargado o ~200 palabras por minuto. */
export function minutosLectura(a: Articulo): number {
  if (a.data.tiempoLectura) return a.data.tiempoLectura;
  const palabras = (a.body ?? '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(palabras / 200));
}

/** Más nuevos primero. */
export const porFecha = (a: Articulo, b: Articulo) =>
  b.data.fecha.valueOf() - a.data.fecha.valueOf();
