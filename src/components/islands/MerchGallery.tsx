import { useEffect, useMemo, useState } from 'react';

export interface MerchItem {
  id: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  niveles: number[];
  quePersonaliza?: string | null;
  minimo?: number | null;
  plazo?: string | null;
  precio?: string | null;
  foto?: { src: string; width: number; height: number } | null;
  imagenIlustrativa: boolean;
  piezaDeMesa: boolean;
}

const CATEGORIAS: Record<string, string> = {
  todos: 'Todos',
  escritorio: 'Escritorio',
  regalo: 'Regalo',
  premio: 'Premio',
  'presencia-de-marca': 'Presencia de marca',
  branding: 'Branding',
};
const NIVELES: Record<number, string> = { 1: 'Marca', 2: 'Persona', 3: 'Forma' };
const CLAVE_KIT = 'piscobot-kit';

const evento = (nombre: string, params: Record<string, unknown> = {}) =>
  window.dispatchEvent(new CustomEvent('piscobot:evento', { detail: { nombre, params } }));

interface Props {
  items: MerchItem[];
}

export default function MerchGallery({ items }: Props) {
  const [categoria, setCategoria] = useState('todos');
  const [porPersona, setPorPersona] = useState(false);
  const [kit, setKit] = useState<string[]>([]);

  useEffect(() => {
    try {
      const guardado = JSON.parse(sessionStorage.getItem(CLAVE_KIT) ?? '[]') as string[];
      setKit(guardado.filter((n) => items.some((i) => i.nombre === n)));
    } catch {
      /* sin almacenamiento */
    }
  }, [items]);

  useEffect(() => {
    try {
      sessionStorage.setItem(CLAVE_KIT, JSON.stringify(kit));
    } catch {
      /* sin almacenamiento */
    }
  }, [kit]);

  const categorias = useMemo(
    () => ['todos', ...Object.keys(CATEGORIAS).filter((c) => items.some((i) => i.categoria === c))],
    [items],
  );
  const visibles = items.filter(
    (i) =>
      (categoria === 'todos' || i.categoria === categoria) &&
      (!porPersona || i.niveles.includes(2)),
  );

  const alternar = (nombre: string) => {
    setKit((k) => {
      const sumar = !k.includes(nombre);
      if (sumar) evento('armar_kit', { objeto: nombre });
      return sumar ? [...k, nombre] : k.filter((n) => n !== nombre);
    });
  };

  const urlKit = `/cotizar?vertical=marcas&tipo=merchandising&kit=${encodeURIComponent(kit.join(' | '))}`;

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div role="group" aria-label="Filtrar por categoría" className="flex flex-wrap gap-2">
          {categorias.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategoria(c)}
              aria-pressed={categoria === c}
              className={
                'rounded-full border px-4 py-2 text-sm font-medium transition-colors ' +
                (categoria === c
                  ? 'border-grafito-950 bg-grafito-950 text-white'
                  : 'border-grafito-300 bg-white text-grafito-700 hover:border-grafito-900')
              }
            >
              {CATEGORIAS[c] ?? c}
            </button>
          ))}
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-grafito-800">
          <input
            type="checkbox"
            checked={porPersona}
            onChange={(e) => setPorPersona(e.target.checked)}
            className="size-4 accent-naranja-500"
          />
          Personalizable por persona
        </label>
      </div>

      <p className="sr-only" aria-live="polite">
        {visibles.length} objetos
      </p>

      <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {visibles.map((item) => {
          const enKit = kit.includes(item.nombre);
          return (
            <li
              key={item.id}
              id={item.id}
              className="flex flex-col overflow-hidden rounded-lg border-2 border-grafito-200 bg-white"
            >
              <figure className="relative">
                {item.foto ? (
                  <img
                    src={item.foto.src}
                    width={item.foto.width}
                    height={item.foto.height}
                    alt={item.nombre}
                    loading="lazy"
                    decoding="async"
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-square items-center justify-center bg-[#eceef1] fondo-grilla-clara text-center font-mono text-[0.6875rem] tracking-wide text-grafito-400 uppercase">
                    <span>
                      Foto pendiente · 1:1
                      <span className="mt-1 block normal-case">{item.id}-01-1x1.jpg</span>
                    </span>
                  </div>
                )}
                {item.imagenIlustrativa && (
                  <figcaption className="absolute right-2 bottom-2 rounded bg-white/90 px-2 py-0.5 text-[0.6875rem] text-grafito-600">
                    Imagen ilustrativa
                  </figcaption>
                )}
              </figure>
              <div className="flex flex-1 flex-col p-6">
                <p className="font-mono text-[0.6875rem] font-semibold tracking-wide text-naranja-700 uppercase">
                  {CATEGORIAS[item.categoria]}
                </p>
                <h3 className="mt-1 text-lg">{item.nombre}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-grafito-600">
                  {item.descripcion}
                </p>
                <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Niveles de personalización">
                  {[1, 2, 3].map((n) => (
                    <li
                      key={n}
                      className={
                        'rounded-full border px-2.5 py-0.5 text-xs font-medium ' +
                        (item.niveles.includes(n)
                          ? 'border-naranja-500 bg-naranja-50 text-naranja-700'
                          : 'border-grafito-200 text-grafito-400 line-through')
                      }
                    >
                      {n} {NIVELES[n]}
                    </li>
                  ))}
                </ul>
                <dl className="mt-4 grid grid-cols-2 gap-2 border-t border-grafito-200 pt-4 text-sm">
                  {item.minimo ? (
                    <div>
                      <dt className="font-mono text-[0.6875rem] text-grafito-500 uppercase">
                        Mínimo
                      </dt>
                      <dd>{item.minimo} u.</dd>
                    </div>
                  ) : null}
                  {item.plazo ? (
                    <div>
                      <dt className="font-mono text-[0.6875rem] text-grafito-500 uppercase">
                        Plazo
                      </dt>
                      <dd>{item.plazo}</dd>
                    </div>
                  ) : null}
                  {item.precio ? (
                    <div className="col-span-2">
                      <dt className="font-mono text-[0.6875rem] text-grafito-500 uppercase">
                        Precio
                      </dt>
                      <dd>Desde {item.precio}</dd>
                    </div>
                  ) : null}
                </dl>
                {item.piezaDeMesa && (
                  <p className="mt-3 rounded-md bg-grafito-50 px-3 py-2 text-xs text-grafito-600">
                    Pieza decorativa: no apta para contacto con alimentos.
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => alternar(item.nombre)}
                  aria-pressed={enKit}
                  className={
                    'mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-md text-sm font-semibold transition-colors ' +
                    (enKit
                      ? 'bg-naranja-500 text-grafito-950 hover:bg-naranja-400'
                      : 'border border-grafito-300 hover:border-grafito-900 hover:bg-grafito-50')
                  }
                >
                  {enKit ? '✓ En tu kit' : '+ Sumar a mi kit'}
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {kit.length > 0 && (
        <div className="sticky bottom-24 z-30 mt-8 md:bottom-6">
          <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-3 rounded-xl bg-grafito-950 p-4 text-white shadow-elevada">
            <p className="text-sm">
              <span className="font-semibold">Tu kit:</span> {kit.length}{' '}
              {kit.length === 1 ? 'objeto' : 'objetos'}
              <span className="hidden text-grafito-400 md:inline"> · {kit.join(', ')}</span>
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setKit([])}
                className="h-10 rounded-md px-3 text-sm text-grafito-300 hover:text-white"
              >
                Vaciar
              </button>
              <a
                href={urlKit}
                className="inline-flex h-10 items-center rounded-md bg-naranja-500 px-4 text-sm font-semibold text-grafito-950 hover:bg-naranja-400"
                data-evento="armar_kit"
              >
                Armar mi kit →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
