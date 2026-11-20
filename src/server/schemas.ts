// Esquemas de validación compartidos entre los formularios (front) y los endpoints (back).
import { z } from 'astro/zod';

export const TIPOS_CONSULTA = {
  'servicio-tecnico': { label: 'Servicio técnico', vertical: 'industria' },
  capacitaciones: { label: 'Capacitaciones', vertical: 'industria' },
  impresion: { label: 'Impresión 3D / diseño', vertical: 'industria' },
  merchandising: { label: 'Merchandising', vertical: 'marcas' },
  proyectos: { label: 'Proyecto especial / activación', vertical: 'marcas' },
  otro: { label: 'Otra consulta', vertical: 'general' },
} as const;

export type TipoConsulta = keyof typeof TIPOS_CONSULTA;
const tipos = Object.keys(TIPOS_CONSULTA) as [TipoConsulta, ...TipoConsulta[]];

export const ARCHIVOS = {
  extensiones: ['stl', 'step', 'stp', 'obj', '3mf', 'pdf', 'jpg', 'jpeg', 'png', 'webp', 'zip'],
  maxPorArchivo: 20 * 1024 * 1024,
  maxTotal: 25 * 1024 * 1024,
  maxCantidad: 5,
} as const;

const texto = (min: number, max: number, msg: string) =>
  z.string().trim().min(min, msg).max(max, `Máximo ${max} caracteres`);

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
  empresa: z.string().trim().max(160).optional().or(z.literal('')),
};

export const cotizacionSchema = z.object({
  tipo: z.enum(tipos, { message: 'Elegí qué necesitás' }),
  descripcion: texto(10, 4000, 'Contanos un poco más (mínimo 10 caracteres)'),
  cantidad: z.string().trim().max(60).optional().or(z.literal('')),
  plazo: z.string().trim().max(120).optional().or(z.literal('')),
  material: z.string().trim().max(120).optional().or(z.literal('')),
  equipo: z.string().trim().max(160).optional().or(z.literal('')),
  linkArchivos: z.string().trim().url('Ingresá un link válido').optional().or(z.literal('')),
  ...contacto,
});

export const contactoSchema = z.object({
  ...contacto,
  asunto: z.enum(tipos).default('otro'),
  mensaje: texto(10, 4000, 'Escribí tu mensaje (mínimo 10 caracteres)'),
});

export type Cotizacion = z.infer<typeof cotizacionSchema>;
export type Contacto = z.infer<typeof contactoSchema>;

export function validarArchivo(nombre: string, tam: number): string | null {
  const ext = nombre.split('.').pop()?.toLowerCase() ?? '';
  if (!(ARCHIVOS.extensiones as readonly string[]).includes(ext)) {
    return `"${nombre}": formato no permitido (${ARCHIVOS.extensiones.join(', ')})`;
  }
  if (tam > ARCHIVOS.maxPorArchivo) return `"${nombre}" supera los 20 MB. Usá un link de descarga.`;
  return null;
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
