import { describe, expect, it, vi } from 'vitest';
import { procesarContacto, procesarCotizacion, type Deps } from '../../src/server/handlers';
import { crearLimitador } from '../../src/server/seguridad';

const deps = (over: Partial<Deps> = {}): Deps => ({
  enviar: vi.fn(async () => ({ simulado: true })),
  verificar: vi.fn(async () => true),
  permitir: () => true,
  destino: () => 'leads@test.local',
  ...over,
});

const cotizacionValida = () => {
  const fd = new FormData();
  fd.set('tipo', 'impresion');
  fd.set('claridad', 'si');
  fd.set('rol', 'decide');
  fd.set('descripcion', 'Necesito 100 tapas en PETG negro');
  fd.set('nombre', 'Ana');
  fd.set('email', 'ana@example.com');
  return fd;
};

describe('procesarCotizacion', () => {
  it('envía email al equipo (con adjunto) y confirmación al cliente', async () => {
    const d = deps();
    const fd = cotizacionValida();
    fd.append('archivos', new File(['solid test'], 'pieza.stl'));
    const r = await procesarCotizacion(fd, '1.1.1.1', d);
    expect(r.status).toBe(200);
    expect(d.enviar).toHaveBeenCalledTimes(2);
    const [equipo] = (d.enviar as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(equipo.to).toBe('leads@test.local');
    expect(equipo.subject).toContain('Impresión o desarrollo');
    expect(equipo.attachments[0].filename).toBe('adjunto-1.stl');
  });

  it('rechaza campos inválidos con errores por campo', async () => {
    const fd = cotizacionValida();
    fd.set('email', 'no-es-email');
    fd.delete('claridad');
    const r = await procesarCotizacion(fd, '1.1.1.1', deps());
    expect(r.status).toBe(422);
    expect(r.body.errores).toHaveProperty('email');
    expect(r.body.errores).toHaveProperty('claridad');
  });

  it('rechaza extensiones no permitidas', async () => {
    const fd = cotizacionValida();
    fd.append('archivos', new File(['x'], 'virus.exe'));
    const r = await procesarCotizacion(fd, '1.1.1.1', deps());
    expect(r.status).toBe(422);
    expect(r.body.errores?.archivos).toContain('formato no permitido');
  });

  it('ignora en silencio a los bots (honeypot)', async () => {
    const d = deps();
    const fd = cotizacionValida();
    fd.set('website', 'http://spam');
    const r = await procesarCotizacion(fd, '1.1.1.1', d);
    expect(r.status).toBe(200);
    expect(d.enviar).not.toHaveBeenCalled();
  });

  it('rechaza si Turnstile falla', async () => {
    const r = await procesarCotizacion(
      cotizacionValida(),
      '1.1.1.1',
      deps({ verificar: async () => false }),
    );
    expect(r.status).toBe(400);
  });

  it('responde 502 si el email falla', async () => {
    const r = await procesarCotizacion(
      cotizacionValida(),
      '1.1.1.1',
      deps({ enviar: async () => Promise.reject(new Error('smtp')) }),
    );
    expect(r.status).toBe(502);
  });

  it('rechaza archivos cuyo contenido no coincide con la extensión', async () => {
    const fd = cotizacionValida();
    fd.append('archivos', new File(['no soy un pdf'], 'plano.pdf'));
    const r = await procesarCotizacion(fd, '1.1.1.1', deps());
    expect(r.status).toBe(422);
    expect(r.body.errores?.archivos).toContain('no parece');
  });

  it('etiqueta a las agencias y acepta tipos viejos por alias', async () => {
    const d = deps();
    const fd = cotizacionValida();
    fd.set('rol', 'agencia');
    fd.set('tipo', 'proyectos');
    const r = await procesarCotizacion(fd, '1.1.1.1', d);
    expect(r.status).toBe(200);
    const [equipo] = (d.enviar as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(equipo.subject).toContain('AGENCIA');
    expect(equipo.subject).toContain('Pieza de autor');
    expect(r.body.mensaje).toContain('48 horas hábiles');
  });
});

describe('procesarContacto', () => {
  it('acepta un mensaje válido', async () => {
    const fd = new FormData();
    fd.set('nombre', 'Juan');
    fd.set('email', 'juan@example.com');
    fd.set('mensaje', 'Quisiera más información');
    const d = deps();
    const r = await procesarContacto(fd, '1.1.1.1', d);
    expect(r.status).toBe(200);
    expect(d.enviar).toHaveBeenCalledTimes(1);
  });
});

describe('crearLimitador', () => {
  it('bloquea después de N envíos en la ventana', () => {
    const permitir = crearLimitador(2, 1000);
    expect(permitir('ip', 0)).toBe(true);
    expect(permitir('ip', 10)).toBe(true);
    expect(permitir('ip', 20)).toBe(false);
    expect(permitir('ip', 2000)).toBe(true);
  });
});
