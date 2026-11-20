// Formulario de cotización por pasos: ¿qué necesitás? → proyecto → archivos → contacto.
import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  ARCHIVOS,
  TIPOS_CONSULTA,
  cotizacionSchema,
  erroresPorCampo,
  validarArchivo,
  type TipoConsulta,
} from '../../server/schemas';
import { Campo, Honeypot, emitirEvento } from './campos';
import Turnstile from './Turnstile';

const PASOS = ['Qué necesitás', 'Tu proyecto', 'Archivos', 'Contacto'] as const;
const CAMPOS_POR_PASO: string[][] = [
  ['tipo'],
  ['descripcion', 'cantidad', 'plazo', 'material', 'equipo'],
  ['linkArchivos'],
  ['nombre', 'email', 'telefono', 'empresa'],
];
const CLAVE_BORRADOR = 'piscobot-cotizacion';

const AYUDA_DESCRIPCION: Record<TipoConsulta, string> = {
  'servicio-tecnico': 'Marca y modelo de la impresora, qué falla notás y desde cuándo.',
  capacitaciones: 'Cuántas personas, qué equipos usan y qué les gustaría aprender.',
  impresion: 'Qué pieza necesitás, para qué se usa, medidas aproximadas y si tenés el archivo.',
  merchandising: 'Qué objeto te interesa, para qué acción o evento y con qué identidad de marca.',
  proyectos: 'Contanos la idea, el evento o lanzamiento y la fecha clave.',
  otro: 'Contanos en qué te podemos ayudar.',
};

type Datos = Record<string, string>;

export default function QuoteForm() {
  const [paso, setPaso] = useState(0);
  const [datos, setDatos] = useState<Datos>({ tipo: '' });
  const [archivos, setArchivos] = useState<File[]>([]);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [estado, setEstado] = useState<'editando' | 'enviando' | 'ok' | 'error'>('editando');
  const [mensaje, setMensaje] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const tituloRef = useRef<HTMLHeadingElement>(null);

  // Prellenado desde la URL (?tipo=...&objeto=...) y borrador guardado.
  useEffect(() => {
    let inicial: Datos = { tipo: '' };
    try {
      inicial = { ...inicial, ...JSON.parse(sessionStorage.getItem(CLAVE_BORRADOR) ?? '{}') };
    } catch {
      /* sin borrador */
    }
    const q = new URLSearchParams(location.search);
    const tipo = q.get('tipo');
    if (tipo && tipo in TIPOS_CONSULTA) inicial.tipo = tipo;
    const objeto = q.get('objeto');
    if (objeto && !inicial.descripcion) inicial.descripcion = `Me interesa: ${objeto}. `;
    setDatos(inicial);
    if (inicial.tipo && tipo) setPaso(1);
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(CLAVE_BORRADOR, JSON.stringify(datos));
    } catch {
      /* almacenamiento no disponible */
    }
  }, [datos]);

  useEffect(() => {
    tituloRef.current?.focus();
  }, [paso]);

  const set = (k: string) => (e: { target: { value: string } }) => {
    setDatos((d) => ({ ...d, [k]: e.target.value }));
    setErrores((er) => ({ ...er, [k]: '' }));
  };

  const validarPaso = (n: number): boolean => {
    const r = cotizacionSchema.safeParse(datos);
    const todos = r.success ? {} : erroresPorCampo(r.error);
    const delPaso = Object.fromEntries(
      Object.entries(todos).filter(([k]) => CAMPOS_POR_PASO[n].includes(k)),
    );
    if (n === 2) {
      for (const f of archivos) {
        const err = validarArchivo(f.name, f.size);
        if (err) delPaso.archivos = err;
      }
      if (archivos.length > ARCHIVOS.maxCantidad)
        delPaso.archivos = `Máximo ${ARCHIVOS.maxCantidad} archivos`;
    }
    setErrores(delPaso);
    return Object.keys(delPaso).length === 0;
  };

  const siguiente = () => {
    if (!validarPaso(paso)) return;
    if (paso === 0) emitirEvento('cotizacion_inicio', { tipo: datos.tipo });
    setPaso((p) => Math.min(p + 1, PASOS.length - 1));
  };

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (paso < PASOS.length - 1) return siguiente();
    for (let i = 0; i < PASOS.length; i++) {
      if (!validarPaso(i)) return setPaso(i);
    }
    setEstado('enviando');
    const fd = new FormData(formRef.current!);
    Object.entries(datos).forEach(([k, v]) => fd.set(k, v));
    fd.delete('archivos');
    archivos.forEach((f) => fd.append('archivos', f));
    try {
      const res = await fetch('/api/cotizacion', { method: 'POST', body: fd });
      const body = (await res.json()) as {
        ok: boolean;
        mensaje: string;
        errores?: Record<string, string>;
      };
      if (body.ok) {
        setEstado('ok');
        setMensaje(body.mensaje);
        emitirEvento('cotizacion_enviada', {
          tipo: datos.tipo,
          vertical: TIPOS_CONSULTA[datos.tipo as TipoConsulta]?.vertical,
        });
        sessionStorage.removeItem(CLAVE_BORRADOR);
      } else {
        setEstado('error');
        setMensaje(body.mensaje);
        if (body.errores) {
          setErrores(body.errores);
          const pasoConError = CAMPOS_POR_PASO.findIndex((c) => c.some((k) => body.errores![k]));
          if (body.errores.archivos) setPaso(2);
          else if (pasoConError >= 0) setPaso(pasoConError);
        }
      }
    } catch {
      setEstado('error');
      setMensaje(
        'No pudimos conectar con el servidor. Revisá tu conexión o escribinos por WhatsApp.',
      );
    }
  };

  if (estado === 'ok') {
    return (
      <div
        className="rounded-xl border border-exito/30 bg-white p-8 text-center shadow-tarjeta"
        role="status"
      >
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-exito/10 text-2xl text-exito">
          ✓
        </div>
        <h2 className="text-2xl">¡Consulta enviada!</h2>
        <p className="mx-auto mt-3 max-w-md text-grafito-600">{mensaje}</p>
        <a
          href="/"
          className="mt-6 inline-flex h-11 items-center rounded-md bg-grafito-950 px-5 font-semibold text-white"
        >
          Volver al inicio
        </a>
      </div>
    );
  }

  const tipo = (datos.tipo || 'otro') as TipoConsulta;

  return (
    <form
      ref={formRef}
      onSubmit={enviar}
      noValidate
      className="relative rounded-xl border border-grafito-200 bg-white p-6 shadow-tarjeta md:p-8"
    >
      <ol className="mb-8 grid grid-cols-4 gap-2" aria-label="Pasos">
        {PASOS.map((p, i) => (
          <li key={p} aria-current={i === paso ? 'step' : undefined}>
            <span
              className={`block h-1.5 rounded-full ${i <= paso ? 'bg-azul-600' : 'bg-grafito-200'}`}
            />
            <span
              className={`mt-2 hidden text-xs font-medium sm:block ${i === paso ? 'text-grafito-950' : 'text-grafito-500'}`}
            >
              {i + 1}. {p}
            </span>
          </li>
        ))}
      </ol>

      <h2 ref={tituloRef} tabIndex={-1} className="mb-6 text-2xl outline-none">
        <span className="sr-only">
          Paso {paso + 1} de {PASOS.length}:{' '}
        </span>
        {paso === 0 && '¿Qué necesitás?'}
        {paso === 1 && 'Contanos sobre tu proyecto'}
        {paso === 2 && '¿Tenés archivos, planos o fotos?'}
        {paso === 3 && '¿Cómo te contactamos?'}
      </h2>

      {paso === 0 && (
        <fieldset>
          <legend className="sr-only">Tipo de consulta</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {(Object.keys(TIPOS_CONSULTA) as TipoConsulta[]).map((t) => (
              <label
                key={t}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-colors ${
                  datos.tipo === t
                    ? 'border-azul-600 bg-azul-50'
                    : 'border-grafito-200 hover:border-grafito-400'
                }`}
              >
                <input
                  type="radio"
                  name="tipo"
                  value={t}
                  checked={datos.tipo === t}
                  onChange={set('tipo')}
                  className="size-4 accent-azul-600"
                />
                <span>
                  <span className="block font-medium text-grafito-950">
                    {TIPOS_CONSULTA[t].label}
                  </span>
                  <span className="block font-mono text-[0.6875rem] tracking-wide text-grafito-500 uppercase">
                    {TIPOS_CONSULTA[t].vertical === 'general'
                      ? 'General'
                      : TIPOS_CONSULTA[t].vertical === 'industria'
                        ? 'Industria'
                        : 'Marcas'}
                  </span>
                </span>
              </label>
            ))}
          </div>
          {errores.tipo && (
            <p className="mt-3 text-sm text-error" role="alert">
              {errores.tipo}
            </p>
          )}
        </fieldset>
      )}

      {paso === 1 && (
        <div className="grid gap-5">
          <Campo
            id="descripcion"
            label="Descripción"
            error={errores.descripcion}
            ayuda={AYUDA_DESCRIPCION[tipo]}
          >
            {(p) => (
              <textarea
                {...p}
                rows={5}
                value={datos.descripcion ?? ''}
                onChange={set('descripcion')}
              />
            )}
          </Campo>
          <div className="grid gap-5 sm:grid-cols-2">
            {tipo === 'servicio-tecnico' ? (
              <Campo id="equipo" label="Marca y modelo del equipo" opcional error={errores.equipo}>
                {(p) => (
                  <input
                    {...p}
                    value={datos.equipo ?? ''}
                    onChange={set('equipo')}
                    placeholder="Ej.: Prusa MK4, Ender 3 V2"
                  />
                )}
              </Campo>
            ) : (
              <Campo
                id="cantidad"
                label={tipo === 'capacitaciones' ? 'Cantidad de personas' : 'Cantidad'}
                opcional
                error={errores.cantidad}
              >
                {(p) => (
                  <input
                    {...p}
                    value={datos.cantidad ?? ''}
                    onChange={set('cantidad')}
                    placeholder="Ej.: 50 unidades"
                  />
                )}
              </Campo>
            )}
            <Campo id="plazo" label="¿Para cuándo lo necesitás?" opcional error={errores.plazo}>
              {(p) => (
                <input
                  {...p}
                  value={datos.plazo ?? ''}
                  onChange={set('plazo')}
                  placeholder="Ej.: fin de mes"
                />
              )}
            </Campo>
          </div>
          {(tipo === 'impresion' || tipo === 'merchandising' || tipo === 'proyectos') && (
            <Campo
              id="material"
              label="Material o terminación preferida"
              opcional
              error={errores.material}
            >
              {(p) => (
                <input
                  {...p}
                  value={datos.material ?? ''}
                  onChange={set('material')}
                  placeholder="Ej.: PETG negro, no sé / asesoramiento"
                />
              )}
            </Campo>
          )}
        </div>
      )}

      {paso === 2 && (
        <div className="grid gap-5">
          <div>
            <label
              htmlFor="archivos"
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-grafito-300 bg-grafito-50 px-6 py-10 text-center hover:border-azul-600"
            >
              <span className="font-medium text-grafito-950">Elegí archivos o arrastralos acá</span>
              <span className="mt-1 text-sm text-grafito-500">
                STL, STEP, OBJ, 3MF, PDF, imágenes o ZIP · hasta {ARCHIVOS.maxCantidad} archivos de
                20 MB
              </span>
              <input
                id="archivos"
                name="archivos"
                type="file"
                multiple
                accept={ARCHIVOS.extensiones.map((e) => `.${e}`).join(',')}
                className="sr-only"
                aria-describedby={errores.archivos ? 'archivos-error' : undefined}
                onChange={(e) => {
                  setArchivos(Array.from(e.target.files ?? []));
                  setErrores((er) => ({ ...er, archivos: '' }));
                }}
              />
            </label>
            {archivos.length > 0 && (
              <ul className="mt-3 space-y-1 text-sm">
                {archivos.map((f) => (
                  <li
                    key={f.name}
                    className="flex justify-between rounded bg-grafito-50 px-3 py-2 font-mono text-xs"
                  >
                    <span className="truncate">{f.name}</span>
                    <span className="text-grafito-500">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                  </li>
                ))}
              </ul>
            )}
            {errores.archivos && (
              <p id="archivos-error" className="mt-2 text-sm text-error" role="alert">
                {errores.archivos}
              </p>
            )}
          </div>
          <Campo
            id="linkArchivos"
            label="¿Archivos más pesados? Pegá un link de descarga"
            opcional
            error={errores.linkArchivos}
            ayuda="Google Drive, WeTransfer, Dropbox, etc."
          >
            {(p) => (
              <input
                {...p}
                type="url"
                value={datos.linkArchivos ?? ''}
                onChange={set('linkArchivos')}
                placeholder="https://"
              />
            )}
          </Campo>
          <p className="text-sm text-grafito-500">
            Si no tenés archivos, no hay problema: podés seguir y te asesoramos.
          </p>
        </div>
      )}

      {paso === 3 && (
        <div className="grid gap-5 sm:grid-cols-2">
          <Campo id="nombre" label="Nombre" error={errores.nombre}>
            {(p) => (
              <input
                {...p}
                autoComplete="name"
                value={datos.nombre ?? ''}
                onChange={set('nombre')}
              />
            )}
          </Campo>
          <Campo id="empresa" label="Empresa" opcional error={errores.empresa}>
            {(p) => (
              <input
                {...p}
                autoComplete="organization"
                value={datos.empresa ?? ''}
                onChange={set('empresa')}
              />
            )}
          </Campo>
          <Campo id="email" label="Email" error={errores.email}>
            {(p) => (
              <input
                {...p}
                type="email"
                autoComplete="email"
                value={datos.email ?? ''}
                onChange={set('email')}
              />
            )}
          </Campo>
          <Campo id="telefono" label="WhatsApp / teléfono" opcional error={errores.telefono}>
            {(p) => (
              <input
                {...p}
                type="tel"
                autoComplete="tel"
                value={datos.telefono ?? ''}
                onChange={set('telefono')}
              />
            )}
          </Campo>
          <div className="sm:col-span-2">
            <Turnstile />
          </div>
        </div>
      )}

      <Honeypot />

      {estado === 'error' && mensaje && (
        <p className="mt-6 rounded-md bg-error/10 p-3 text-sm text-error" role="alert">
          {mensaje}
        </p>
      )}

      <div className="mt-8 flex items-center justify-between gap-3 border-t border-grafito-200 pt-6">
        {paso > 0 ? (
          <button
            type="button"
            onClick={() => setPaso((p) => p - 1)}
            className="h-11 rounded-md px-4 font-semibold text-grafito-700 hover:bg-grafito-100"
          >
            ← Atrás
          </button>
        ) : (
          <span />
        )}
        <button
          type="submit"
          disabled={estado === 'enviando'}
          className="inline-flex h-11 items-center gap-2 rounded-md bg-azul-600 px-6 font-semibold text-white hover:bg-azul-700 disabled:opacity-60"
        >
          {paso < PASOS.length - 1
            ? 'Siguiente →'
            : estado === 'enviando'
              ? 'Enviando…'
              : 'Enviar consulta'}
        </button>
      </div>
    </form>
  );
}
