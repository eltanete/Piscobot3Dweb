import type { CollectionEntry } from 'astro:content';

type Caso = CollectionEntry<'casos'>;

/** Nombre visible del cliente respetando el permiso (mostrarNombreCliente). */
export function nombreCliente(caso: Caso): string | null {
  const d = caso.data;
  if (d.mostrarNombreCliente && d.cliente) return d.cliente;
  return d.descripcionGenerica ?? null;
}

/** Casos publicables (sin borradores). */
export const publicable = (caso: Caso) => !caso.data.borrador;
