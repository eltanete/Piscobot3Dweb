import { defineCollection, type SchemaContext } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

const vertical = z.enum(['industria', 'marcas']);

const ICONOS = [
  'wrench',
  'graduation-cap',
  'layers',
  'box',
  'gift',
  'sparkles',
  'scan',
  'shield-check',
  'users',
  'calendar',
  'book',
  'cpu',
  'thermometer',
  'settings',
  'target',
  'alert',
  'clock',
  'check',
  'file',
  'upload',
] as const;
const icono = z.enum(ICONOS);

type ImageFn = SchemaContext['image'];

const item = z.object({
  titulo: z.string(),
  texto: z.string(),
  icono: icono.optional(),
  meta: z.string().optional(),
});
const crearItem = (image: ImageFn) =>
  item.extend({
    imagen: image().optional(),
    enlace: z.string().optional(),
  });

const crearBloque = (image: ImageFn) =>
  z.object({
    id: z.string().optional(),
    eyebrow: z.string().optional(),
    titulo: z.string(),
    bajada: z.string().optional(),
    items: z.array(crearItem(image)).default([]),
    fondo: z.enum(['blanco', 'gris', 'oscuro']).default('blanco'),
    /** Lista de viñetas opcional (p. ej. "qué incluye"). */
    lista: z.array(z.string()).default([]),
    /** Ilustración decorativa junto al título del bloque. */
    ilustracion: image().nullish(),
    /** Proporción de las imágenes de los ítems. */
    formatoImagen: z.enum(['horizontal', 'vertical']).default('horizontal'),
  });

const seo = z
  .object({
    titulo: z.string().optional(),
    descripcion: z.string().optional(),
  })
  .default({});

/** Servicios: una entrada por página de servicio (5 en total, ver sitemap). */
const servicios = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/servicios' }),
  schema: ({ image }) =>
    z.object({
      titulo: z.string(),
      vertical,
      orden: z.number().default(0),
      icono,
      resumen: z.string(),
      imagen: image().optional(),
      imagenAlt: z.string().optional(),
      hero: z.object({
        eyebrow: z.string(),
        titulo: z.string(),
        bajada: z.string(),
      }),
      cta: z.object({
        label: z.string(),
        tipo: z.string(),
      }),
      whatsapp: z.string(),
      pruebas: z.array(z.object({ valor: z.coerce.string(), etiqueta: z.string() })).default([]),
      beneficios: z.array(item).default([]),
      bloques: z.array(crearBloque(image)).default([]),
      faq: z.array(z.string()).default([]),
      /** Caso insignia de esta línea (id de la colección casos). */
      casoInsignia: z.string().nullish(),
      seo,
    }),
});

const casos = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/casos' }),
  schema: ({ image }) =>
    z.object({
      titulo: z.string(),
      vertical,
      servicio: z.string(),
      cliente: z.string().nullish(),
      /** Si es false, se muestra descripcionGenerica en lugar del nombre del cliente. */
      mostrarNombreCliente: z.boolean().default(false),
      descripcionGenerica: z.string().nullish(),
      /** Línea de negocio (id de la colección servicios). Por compatibilidad, igual a "servicio". */
      nivel: z.enum(['insignia', 'ficha', 'galeria']).default('ficha'),
      fecha: z.coerce.date().nullish(),
      bajada: z.string().nullish(),
      material: z.string().nullish(),
      aplicacion: z.string().nullish(),
      resumen: z.string(),
      desafio: z.string().nullish(),
      solucion: z.string().nullish(),
      resultado: z.string().nullish(),
      /** Datos destacados (cifra + etiqueta), en tipografía monoespaciada. */
      datos: z.array(z.object({ valor: z.coerce.string(), etiqueta: z.string() })).default([]),
      metricas: z.array(z.object({ valor: z.string(), etiqueta: z.string() })).default([]),
      borrador: z.boolean().default(false),
      /** Texto todavía provisorio (se reemplaza cuando llegue el definitivo). */
      provisorio: z.boolean().default(false),
      imagen: image().nullish(),
      imagenAlt: z.string().nullish(),
      /** Fotos adicionales que se muestran en el detalle del caso. */
      galeria: z.array(image()).default([]),
      modelo3d: z.string().nullish(),
      destacado: z.boolean().default(false),
      orden: z.number().default(0),
      ejemplo: z.boolean().default(false),
    }),
});

const merch = defineCollection({
  loader: glob({ pattern: '**/*.{md,yaml,yml}', base: './src/content/merch' }),
  schema: ({ image }) =>
    z.object({
      nombre: z.string(),
      categoria: z.enum(['escritorio', 'tecnologia', 'hogar', 'eventos', 'premios']),
      descripcion: z.string(),
      materiales: z.array(z.string()).default([]),
      personalizacion: z.array(z.string()).default([]),
      minimo: z.number().nullish(),
      plazo: z.string().optional(),
      imagen: image().nullish(),
      orden: z.number().default(0),
    }),
});

const recursos = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/recursos' }),
  schema: ({ image }) =>
    z.object({
      titulo: z.string(),
      descripcion: z.string(),
      vertical: vertical.default('industria'),
      categoria: z.string(),
      icono: icono.default('book'),
      imagen: image().nullish(),
      fecha: z.coerce.date(),
      actualizado: z.coerce.date().nullish(),
      /** Slug en el WordPress actual, para redirecciones 301. */
      wpSlug: z.string().nullish(),
      provisorio: z.boolean().default(false),
    }),
});

const testimonios = defineCollection({
  loader: file('./src/content/testimonios.json'),
  schema: z.object({
    autor: z.string(),
    cargo: z.string().optional(),
    empresa: z.string().optional(),
    texto: z.string(),
    vertical,
    ejemplo: z.boolean().default(false),
  }),
});

const faq = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/faq' }),
  schema: z.object({
    titulo: z.string(),
    preguntas: z.array(z.object({ pregunta: z.string(), respuesta: z.string() })),
  }),
});

const clientes = defineCollection({
  loader: file('./src/content/clientes.json'),
  schema: ({ image }) =>
    z.object({
      nombre: z.string(),
      logo: image().optional(),
      vertical: vertical.optional(),
    }),
});

const paginas = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/paginas' }),
  schema: z.object({
    titulo: z.string(),
    eyebrow: z.string().optional(),
    bajada: z.string().optional(),
    seo,
  }),
});

export const collections = {
  servicios,
  casos,
  merch,
  recursos,
  testimonios,
  faq,
  clientes,
  paginas,
};
