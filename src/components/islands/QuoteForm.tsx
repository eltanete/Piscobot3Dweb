// Cotizador en 3 pasos, alineado con el cotizador interno:
// 1) ¿Qué necesitás? + ¿ya sabés qué querés?  2) Proyecto y adjuntos  3) Contacto.
import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  ALIAS_TIPOS,
  ARCHIVOS,
  ATRIBUCION,
  CLARIDAD,
  PRESUPUESTOS,
  ROLES,
  TIPOS_CONSULTA,
  cotizacionSchema,
  erroresPorCampo,
  validarArchivo,
  type TipoConsulta,
} from '../../server/schemas';
import { Campo, Honeypot, emitirEvento } from './campos';
import Turnstile from './Turnstile';

const PASOS = ['Qué necesitás', 'Tu proyecto', 'Contacto'] as const;
const CAMPOS_POR_PASO: string[][] = [
  ['tipo', 'claridad'],
  ['destinatarios', 'cantidad', 'fechaEntrega', 'presupuesto', 'descripcion', 'linkArchivos'],
  ['nombre', 'empresa', 'rol', 'email', 'telefono'],
];
const CLAVE_BORRADOR = 'piscobot-cotizacion';
const TIPOS = Object.keys(TIPOS_CONSULTA) as TipoConsulta[];

type Datos = Record<string, string>;

const leerSesion = (clave: string) => {
  try {
    return sessionStorage.getItem(clave);
  } catch {
    return null;
  }
};

export default function QuoteForm() {
  const [paso, setPaso] = useState(0);
  const [datos, setDatos] = useState<Datos>({ tipo: '' });
  const [soloMarcas, setSoloMarcas] = useState(false);
  const [archivos, setArchivos] = useState<File[]>([]);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [estado, setEstado] = useState<'editando' | 'enviando' | 'ok' | 'error'>('editando');
  const [mensaje, setMensaje] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const iniciado = useRef(false);

  // Prellenado: borrador, parámetros de la URL (tipo, vertical, kit, rol, origen) y atribución.
  useEffect(() => {
    let inicial: Datos = { tipo: '' };
    try {
      inicial = { ...inicial, ...JSON.parse(leerSesion(CLAVE_BORRADOR) ?? '{}') };
    } catch {
      /* sin borrador */
    }
    const q = new URLSearchParams(location.search);
    const tipo = q.get('tipo') ?? '';
    const tipoValido = (ALIAS_TIPOS[tipo] ?? tipo) as TipoConsulta;
    if (tipoValido in TIPOS_CONSULTA) inicial.tipo = tipoValido;
    if (q.get('vertical') === 'marcas') setSoloMarcas(true);
    const kit = q.get('kit');
    if (kit) {
      inicial.kit = kit.slice(0, 1000);
      inicial.tipo ||= 'merchandising';
    }
    if (q.get('rol') && q.get('rol')! in ROLES) inicial.rol = q.get('rol')!;
    inicial.origen = (
      q.get('origen') ??
      leerSesion('piscobot-origen') ??
      document.referrer ??
      ''
    ).slice(0, 200);
    try {
      Object.assign(inicial, JSON.parse(leerSesion('piscobot-atribucion') ?? '{}'));
    } catch {
      /* sin atribución */
    }
    setDatos(inicial);
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(CLAVE_BORRADOR, JSON.stringify(datos));
    } catch {
      /* almacenamiento no disponible */
    }
  }, [datos]);

  useEffect(() => {
    if (iniciado.current) tituloRef.current?.focus();
  }, [paso]);

  const set = (k: string) => (e: { target: { value: string } }) => {
    if (!iniciado.current) {
      iniciado.current = true;
      emitirEvento('inicio_formulario', { tipo: datos.tipo });
    }
    setDatos((d) => ({ ...d, [k]: e.target.value }));
    setErrores((er) => ({ ...er, [k]: '' }));
  };

  const validarPaso = (n: number): boolean => {
    const r = cotizacionSchema.safeParse(datos);
    const todos = r.success ? {} : erroresPorCampo(r.error);
    const delPaso = Object.fromEntries(
      Object.entries(todos).filter(([k]) => CAMPOS_POR_PASO[n].includes(k)),
    );
    if (n === 1) {
      let total = 0;
      for (const f of archivos) {
        const err = validarArchivo(f.name, f.size);
        if (err) delPaso.archivos = err;
        total += f.size;
      }
      if (total > ARCHIVOS.maxTotal)
        delPaso.archivos = 'Los archivos superan 50 MB en total. Usá un link de descarga.';
      if (archivos.length > ARCHIVOS.maxCantidad)
        delPaso.archivos = `Máximo ${ARCHIVOS.maxCantidad} archivos`;
    }
    setErrores(delPaso);
    return Object.keys(delPaso).length === 0;
  };

  const siguiente = () => {
    if (!validarPaso(paso)) return;
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
    Object.entries(datos).forEach(([k, v]) => fd.set(k, v ?? ''));
    fd.delete('archivos');
    archivos.forEach((f) => fd.append('archivos', f));
    try {
      const res = await fetch(`/api/cotizacion${import.meta.env.PUBLIC_API_EXT ?? ''}`, {
        method: 'POST',
        body: fd,
      });
      const body = (await res.json()) as {
        ok: boolean;
        mensaje: string;
        errores?: Record<string, string>;
      };
      if (body.ok) {
        setEstado('ok');
        setMensaje(body.mensaje);
        const t = TIPOS_CONSULTA[datos.tipo as TipoConsulta];
        emitirEvento('envio_formulario', {
          tipo: datos.tipo,
          vertical: t?.vertical,
          linea: datos.linea || t?.linea,
          rol: datos.rol,
          kit: Boolean(datos.kit),
        });
        // Conversiones mejoradas de Google Ads: GTM toma estos datos (GTM los hashea antes de enviarlos).
        (window as unknown as { dataLayer?: unknown[] }).dataLayer?.push({
          user_data: { email: datos.email, phone_number: datos.telefono },
        });
        sessionStorage.removeItem(CLAVE_BORRADOR);
      } else {
        setEstado('error');
        setMensaje(body.mensaje);
        if (body.errores) {
          setErrores(body.errores);
          if (body.errores.archivos) setPaso(1);
          else {
            const p = CAMPOS_POR_PASO.findIndex((c) => c.some((k) => body.errores![k]));
            if (p >= 0) setPaso(p);
          }
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

  const tiposVisibles = soloMarcas
    ? TIPOS.filter((t) => TIPOS_CONSULTA[t].vertical !== 'industria')
    : TIPOS;
  const chip = (activo: boolean) =>
    `flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-colors ${
      activo ? 'border-azul-600 bg-azul-50' : 'border-grafito-200 hover:border-grafito-400'
    }`;

  return (
    <form
      ref={formRef}
      onSubmit={enviar}
      noValidate
      className="relative rounded-xl border border-grafito-200 bg-white p-6 shadow-tarjeta md:p-8"
    >
      <ol className="mb-8 grid grid-cols-3 gap-2" aria-label="Pasos">
        {PASOS.map((p, i) => (
          <li key={p} aria-current={i === paso ? 'step' : undefined}>
            <span
              className={`block h-1.5 rounded-full ${i <= paso ? 'bg-azul-600' : 'bg-grafito-200'}`}
            />
            <span
              className={`mt-2 block text-xs font-medium ${i === paso ? 'text-grafito-950' : 'text-grafito-500'}`}
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
        {paso === 2 && '¿Cómo te contactamos?'}
      </h2>

      {datos.kit && (
        <p className="mb-6 rounded-md bg-naranja-50 px-4 py-3 text-sm text-grafito-800">
          <b>Tu kit:</b> {datos.kit}
        </p>
      )}

      {paso === 0 && (
        <div className="space-y-8">
          <fieldset>
            <legend className="sr-only">Qué necesitás</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {tiposVisibles.map((t) => (
                <label key={t} className={chip(datos.tipo === t)}>
                  <input
                    type="radio"
                    name="tipo"
                    value={t}
                    checked={datos.tipo === t}
                    onChange={set('tipo')}
                    className="size-4 accent-azul-600"
                  />
                  <span className="font-medium text-grafito-950">{TIPOS_CONSULTA[t].label}</span>
                </label>
              ))}
            </div>
            {soloMarcas && (
              <button
                type="button"
                onClick={() => setSoloMarcas(false)}
                className="mt-3 text-sm font-semibold text-azul-600 hover:underline"
              >
                Ver opciones para empresas (servicio técnico, capacitación, impresión)
              </button>
            )}
            {errores.tipo && (
              <p className="mt-3 text-sm text-error" role="alert">
                {errores.tipo}
              </p>
            )}
          </fieldset>
          <fieldset>
            <legend className="mb-3 font-medium text-grafito-900">¿Ya sabés qué querés?</legend>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(CLARIDAD) as (keyof typeof CLARIDAD)[]).map((c) => (
                <label
                  key={c}
                  className={`cursor-pointer rounded-full border-2 px-4 py-2 text-sm font-medium ${datos.claridad === c ? 'border-azul-600 bg-azul-50' : 'border-grafito-200 hover:border-grafito-400'}`}
                >
                  <input
                    type="radio"
                    name="claridad"
                    value={c}
                    checked={datos.claridad === c}
                    onChange={set('claridad')}
                    className="sr-only"
                  />
                  {CLARIDAD[c]}
                </label>
              ))}
            </div>
            {errores.claridad && (
              <p className="mt-3 text-sm text-error" role="alert">
                {errores.claridad}
              </p>
            )}
          </fieldset>
        </div>
      )}

      {paso === 1 && (
        <div className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Campo
              id="destinatarios"
              label="¿Para quién es?"
              opcional
              error={errores.destinatarios}
              ayuda="Clientes, equipo, asistentes a un evento…"
            >
              {(p) => (
                <input {...p} value={datos.destinatarios ?? ''} onChange={set('destinatarios')} />
              )}
            </Campo>
            <Campo id="cantidad" label="Cantidad" opcional error={errores.cantidad}>
              {(p) => (
                <input
                  {...p}
                  inputMode="numeric"
                  value={datos.cantidad ?? ''}
                  onChange={set('cantidad')}
                  placeholder="Ej.: 150"
                />
              )}
            </Campo>
            <Campo id="fechaEntrega" label="Fecha de entrega" opcional error={errores.fechaEntrega}>
              {(p) => (
                <input
                  {...p}
                  type="date"
                  value={datos.fechaEntrega ?? ''}
                  onChange={set('fechaEntrega')}
                />
              )}
            </Campo>
            <Campo
              id="presupuesto"
              label="Presupuesto de referencia"
              opcional
              error={errores.presupuesto}
            >
              {(p) => (
                <select {...p} value={datos.presupuesto ?? ''} onChange={set('presupuesto')}>
                  <option value="">Elegí un rango</option>
                  {Object.entries(PRESUPUESTOS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              )}
            </Campo>
          </div>
          <Campo
            id="descripcion"
            label="Detalles"
            opcional
            error={errores.descripcion}
            ayuda="Todo lo que nos ayude: idea, colores, medidas, equipo a reparar…"
          >
            {(p) => (
              <textarea
                {...p}
                rows={4}
                value={datos.descripcion ?? ''}
                onChange={set('descripcion')}
              />
            )}
          </Campo>
          <div>
            <label
              htmlFor="archivos"
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-grafito-300 bg-grafito-50 px-6 py-8 text-center hover:border-azul-600"
            >
              <span className="font-medium text-grafito-950">
                Adjuntá logo, fotos o archivos 3D
              </span>
              <span className="mt-1 text-sm text-grafito-500">
                STL, STEP, 3MF, PDF, JPG o PNG · hasta 50 MB en total
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
            label="¿Archivos más pesados? Pegá un link"
            opcional
            error={errores.linkArchivos}
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
        </div>
      )}

      {paso === 2 && (
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
          <fieldset className="sm:col-span-2">
            <legend className="text-sm font-medium text-grafito-900">Tu rol</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {(Object.keys(ROLES) as (keyof typeof ROLES)[]).map((r) => (
                <label
                  key={r}
                  className={`cursor-pointer rounded-full border-2 px-4 py-2 text-sm font-medium ${datos.rol === r ? 'border-azul-600 bg-azul-50' : 'border-grafito-200 hover:border-grafito-400'}`}
                >
                  <input
                    type="radio"
                    name="rol"
                    value={r}
                    checked={datos.rol === r}
                    onChange={set('rol')}
                    className="sr-only"
                  />
                  {ROLES[r]}
                </label>
              ))}
            </div>
            {errores.rol && (
              <p className="mt-2 text-sm text-error" role="alert">
                {errores.rol}
              </p>
            )}
          </fieldset>
          <Campo id="email" label="Mail" error={errores.email}>
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
          <Campo id="telefono" label="WhatsApp" opcional error={errores.telefono}>
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

      {/* Campos ocultos: vertical/línea se derivan del tipo; origen, kit y atribución vienen de la sesión. */}
      {['linea', 'origen', 'kit', ...ATRIBUCION].map((k) => (
        <input key={k} type="hidden" name={k} value={datos[k] ?? ''} />
      ))}
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
