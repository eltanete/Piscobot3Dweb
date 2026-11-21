// Esquemas de validación compartidos entre los formularios (front) y los endpoints (back).
// Mantener sincronizado con public/api/_lib.php (versión PHP para Hostinger Premium).
import { z } from 'astro/zod';

export const TIPOS_CONSULTA = {
  regalos: { label: 'Regalos para clientes', vertical: 'marcas', linea: 'regalos-corporativos' },
  trofeos: { label: 'Trofeos', vertical: 'marcas', linea: 'regalos-corporativos' },
  fiesta: { label: 'Fiesta', vertical: 'marcas', linea: 'activaciones' },
  evento: { label: 'Evento o stand', vertical: 'marcas', linea: 'esculturas-de-marca' },
  'pieza-de-autor': { label: 'Pieza de autor', vertical: 'marcas', linea: 'piezas-de-autor' },
  merchandising: { label: 'Merchandising', vertical: 'marcas', linea: 'merchandising' },
  'servicio-tecnico': {
    label: 'Servicio técnico',
    vertical: 'industria',
    linea: 'servicio-tecnico',
  },
  capacitaciones: { label: 'Capacitación', vertical: 'industria', linea: 'capacitaciones' },
  impresion: {
    label: 'Impresión o desarrollo',
    vertical: 'industria',
    linea: 'impresion-y-desarrollo',
  },
  'no-se': { label: 'Todavía no sé', vertical: 'general', linea: '' },
} as const;

export type TipoConsulta = keyof typeof TIPOS_CONSULTA;
const tipos = Object.keys(TIPOS_CONSULTA) as [TipoConsulta, ...TipoConsulta[]];

/** Alias de tipos viejos (links ya publicados). */
export const ALIAS_TIPOS: Record<string, TipoConsulta> = {
  proyectos: 'pieza-de-autor',
  otro: 'no-se',
};

export const CLARIDAD = {
  si: 'Sí, sé qué quiero',
  idea: 'Tengo una idea',
  no: 'No, necesito ideas',
} as const;
export const ROLES = {
  decide: 'Decido la compra',
  recomienda: 'Recomiendo / evalúo',
  agencia: 'Soy de una agencia',
} as const;
/** Rangos de presupuesto de referencia (provisorios; ajustar en ambos backends). */
export const PRESUPUESTOS = {
  'hasta-500k': 'Hasta $ 500.000',
  '500k-1500k': '$ 500.000 a $ 1.500.000',
  '1500k-5m': '$ 1.500.000 a $ 5.000.000',
  'mas-5m': 'Más de $ 5.000.000',
  'no-se': 'Prefiero no decir',
} as const;

export const ARCHIVOS = {
  extensiones: ['stl', 'step', 'stp', '3mf', 'pdf', 'jpg', 'jpeg', 'png'],
  maxTotal: 50 * 1024 * 1024,
  maxCantidad: 8,
} as const;

const texto = (min: number, max: number, msg: string) =>
  z.string().trim().min(min, msg).max(max, `Máximo ${max} caracteres`);
const opcional = (max: number) => z.string().trim().max(max).optional().or(z.literal(''));
const enumOpcional = <T extends Record<string, string>>(obj: T) =>
  z
    .enum(Object.keys(obj) as [string, ...string[]])
    .optional()
    .or(z.literal(''));

const contacto = {
  nombre: texto(2, 120, 'Ingresá tu nombre'),
  email: z.string().trim().email('Ingresá un email válido').max(200),
  telefono: z
    .string()
    .trim()
    .max(40)
    .regex(/^[\d\s()+-]*$/, 'Ingresá sólo números')
    .optional()
    .or(z.literal('')),
  empresa: opcional(160),
};

/** Campos ocultos de atribución, guardados en la sesión de la visita. */
export const ATRIBUCION = [
  'gclid',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
] as const;
const atribucion = Object.fromEntries(ATRIBUCION.map((k) => [k, opcional(200)])) as Record<
  (typeof ATRIBUCION)[number],
  ReturnType<typeof opcional>
>;

export const cotizacionSchema = z.object({
  // Paso 1
  tipo: z.enum(tipos, { message: 'Elegí qué necesitás' }),
  claridad: z.enum(Object.keys(CLARIDAD) as [keyof typeof CLARIDAD], {
    message: 'Contanos si ya sabés qué querés',
  }),
  // Paso 2
  destinatarios: opcional(200),
  cantidad: opcional(60),
  fechaEntrega: opcional(40),
  presupuesto: enumOpcional(PRESUPUESTOS),
  descripcion: opcional(4000),
  linkArchivos: z.string().trim().url('Ingresá un link válido').optional().or(z.literal('')),
  // Paso 3
  ...contacto,
  rol: z.enum(Object.keys(ROLES) as [keyof typeof ROLES], { message: 'Elegí tu rol' }),
  // Ocultos
  linea: opcional(80),
  origen: opcional(200),
  kit: opcional(1000),
  ...atribucion,
});

export const contactoSchema = z.object({
  ...contacto,
  asunto: z.enum(tipos).default('no-se'),
  mensaje: texto(10, 4000, 'Escribí tu mensaje (mínimo 10 caracteres)'),
});

export type Cotizacion = z.infer<typeof cotizacionSchema>;
export type Contacto = z.infer<typeof contactoSchema>;

/** Valida nombre y tamaño (front y back). */
export function validarArchivo(nombre: string, _tam: number): string | null {
  const ext = nombre.split('.').pop()?.toLowerCase() ?? '';
  if (!(ARCHIVOS.extensiones as readonly string[]).includes(ext)) {
    return `"${nombre}": formato no permitido (STL, STEP, 3MF, PDF, JPG o PNG)`;
  }
  return null;
}

/**
 * Verifica el tipo REAL del archivo por su contenido (firma), no sólo por la extensión.
 * Devuelve la extensión normalizada o null si el contenido no coincide.
 */
export function tipoReal(nombre: string, bytes: Uint8Array): string | null {
  const ext = nombre.split('.').pop()?.toLowerCase() ?? '';
  const empieza = (...firma: number[]) => firma.every((b, i) => bytes[i] === b);
  const texto = new TextDecoder('latin1').decode(bytes.subarray(0, 512));
  switch (ext) {
    case 'pdf':
      return texto.startsWith('%PDF') ? 'pdf' : null;
    case 'png':
      return empieza(0x89, 0x50, 0x4e, 0x47) ? 'png' : null;
    case 'jpg':
    case 'jpeg':
      return empieza(0xff, 0xd8, 0xff) ? 'jpg' : null;
    case '3mf':
      return empieza(0x50, 0x4b, 0x03, 0x04) ? '3mf' : null;
    case 'step':
    case 'stp':
      return texto.includes('ISO-10303-21') ? 'step' : null;
    case 'stl': {
      if (/^\s*solid[\s\S]*facet/i.test(texto) || /^\s*solid\s/i.test(texto)) return 'stl';
      if (bytes.length >= 84) {
        const n = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(
          80,
          true,
        );
        if (84 + n * 50 === bytes.length) return 'stl';
      }
      return null;
    }
    default:
      return null;
  }
}

/** Convierte errores de zod en { campo: mensaje }. */
export function erroresPorCampo(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const campo = String(issue.path[0] ?? 'form');
    out[campo] ??= issue.message;
  }
  return out;
}

export const MENSAJE_CONFIRMACION =
  'Listo. En menos de 48 horas hábiles te mandamos ideas o presupuesto. Si es urgente, escribinos por WhatsApp.';
