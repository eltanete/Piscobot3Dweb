// Panel de edición de contenido: /keystatic
// - Desarrollo: modo local (edita los archivos del repo directamente).
// - Producción: modo GitHub (cada cambio es un commit → Hostinger redeploya). Requiere la GitHub App
//   y las variables KEYSTATIC_* (ver docs/guia-editor.md).
import { collection, config, fields, singleton } from '@keystatic/core';

const enProduccion = import.meta.env.PROD && import.meta.env.PUBLIC_KEYSTATIC_GITHUB_APP_SLUG;

const vertical = fields.select({
  label: 'Vertical',
  options: [
    { label: 'Empresas e Industrias', value: 'industria' },
    { label: 'Marcas y Agencias', value: 'marcas' },
  ],
  defaultValue: 'industria',
});

const seo = fields.object(
  {
    titulo: fields.text({ label: 'Título SEO (opcional)' }),
    descripcion: fields.text({ label: 'Meta descripción (opcional)', multiline: true }),
  },
  { label: 'SEO' },
);

export default config({
  storage: enProduccion
    ? { kind: 'github', repo: { owner: 'eltanete', name: 'Piscobot3Dweb' } }
    : { kind: 'local' },
  ui: {
    brand: { name: 'PISCOBOT 3D' },
    navigation: {
      Contenido: ['casos', 'recursos', 'merch'],
      Páginas: ['paginas', 'sitio', 'campana'],
    },
  },
  singletons: {
    campana: singleton({
      label: 'Campaña de fin de año',
      path: 'src/content/campana',
      format: { data: 'json' },
      schema: {
        nombre: fields.text({ label: 'Nombre interno' }),
        fechaCierre: fields.text({
          label: 'Fecha y hora de cierre (FECHA_CIERRE_CAMPANA)',
          description:
            'Formato 2026-12-05T23:59:00-03:00. Después de esta fecha se apagan banner, menú y cuenta regresiva.',
        }),
        fechaEntrega: fields.text({ label: 'Fecha de entrega (AAAA-MM-DD)' }),
        textoBanner: fields.text({ label: 'Texto del banner' }),
        mostrarPrecio: fields.checkbox({
          label: 'Mostrar precio orientativo',
          defaultValue: false,
        }),
        precioOrientativo: fields.text({ label: 'Precio orientativo' }),
      },
    }),
    sitio: singleton({
      label: 'Datos de contacto',
      path: 'src/content/sitio',
      format: { data: 'json' },
      schema: {
        nombre: fields.text({ label: 'Nombre' }),
        eslogan: fields.text({ label: 'Eslogan' }),
        descripcion: fields.text({ label: 'Descripción', multiline: true }),
        telefono: fields.text({ label: 'Teléfono (visible)' }),
        whatsapp: fields.text({ label: 'WhatsApp (sólo números, con 549)' }),
        email: fields.text({ label: 'Email' }),
        direccion: fields.text({ label: 'Dirección' }),
        ciudad: fields.text({ label: 'Ciudad' }),
        region: fields.text({ label: 'Región' }),
        pais: fields.text({ label: 'País (código)' }),
        horario: fields.text({ label: 'Horario' }),
        notaVisitas: fields.text({ label: 'Nota sobre visitas' }),
        mapaUrl: fields.url({ label: 'Link a Google Maps' }),
        redes: fields.object(
          {
            instagram: fields.text({ label: 'Instagram (URL)' }),
            linkedin: fields.text({ label: 'LinkedIn (URL)' }),
            youtube: fields.text({ label: 'YouTube (URL)' }),
            facebook: fields.text({ label: 'Facebook (URL)' }),
          },
          { label: 'Redes sociales' },
        ),
      },
    }),
  },
  collections: {
    casos: collection({
      label: 'Casos de éxito',
      path: 'src/content/casos/*',
      slugField: 'titulo',
      format: { contentField: 'contenido' },
      entryLayout: 'content',
      columns: ['titulo', 'vertical'],
      schema: {
        titulo: fields.slug({ name: { label: 'Título' } }),
        vertical,
        servicio: fields.select({
          label: 'Servicio',
          options: [
            { label: 'Servicio técnico', value: 'servicio-tecnico' },
            { label: 'Capacitaciones', value: 'capacitaciones' },
            { label: 'Impresión y desarrollo', value: 'impresion-y-desarrollo' },
            { label: 'Merchandising', value: 'merchandising' },
            { label: 'Piezas de autor', value: 'piezas-de-autor' },
          ],
          defaultValue: 'impresion-y-desarrollo',
        }),
        nivel: fields.select({
          label: 'Nivel',
          options: [
            { label: '1 · Insignia (página propia)', value: 'insignia' },
            { label: '2 · Ficha (modal en /casos)', value: 'ficha' },
            { label: '3 · Galería (sólo foto)', value: 'galeria' },
          ],
          defaultValue: 'ficha',
        }),
        cliente: fields.text({ label: 'Cliente (opcional)' }),
        mostrarNombreCliente: fields.checkbox({
          label: 'Mostrar el nombre del cliente (sólo con permiso confirmado)',
          defaultValue: false,
        }),
        descripcionGenerica: fields.text({
          label: 'Descripción genérica (p. ej. "una ortopedia")',
        }),
        fecha: fields.date({ label: 'Fecha' }),
        bajada: fields.text({ label: 'Bajada', multiline: true }),
        desafio: fields.text({ label: 'Desafío / Qué', multiline: true }),
        solucion: fields.text({ label: 'Solución / Cómo', multiline: true }),
        resultado: fields.text({ label: 'Resultado', multiline: true }),
        datos: fields.array(
          fields.object({
            valor: fields.text({ label: 'Cifra' }),
            etiqueta: fields.text({ label: 'Etiqueta' }),
          }),
          {
            label: 'Datos destacados (3-4)',
            itemLabel: (p) => `${p.fields.valor.value} ${p.fields.etiqueta.value}`,
          },
        ),
        fotos: fields.array(
          fields.object({
            src: fields.image({
              label: 'Foto',
              directory: 'src/assets/images/casos',
              publicPath: '../../assets/images/casos/',
              validation: { isRequired: true },
            }),
            alt: fields.text({
              label: 'Texto alternativo (obligatorio)',
              validation: { length: { min: 1 } },
            }),
          }),
          { label: 'Fotos', itemLabel: (p) => p.fields.alt.value },
        ),
        borrador: fields.checkbox({ label: 'Borrador (no se publica)', defaultValue: false }),
        material: fields.text({ label: 'Material (opcional)' }),
        aplicacion: fields.text({ label: 'Aplicación' }),
        resumen: fields.text({ label: 'Resumen', multiline: true }),
        imagen: fields.image({
          label: 'Imagen',
          directory: 'src/assets/images/casos',
          publicPath: '../../assets/images/casos/',
        }),
        imagenAlt: fields.text({ label: 'Texto alternativo de la imagen' }),
        galeria: fields.array(
          fields.image({
            label: 'Foto',
            directory: 'src/assets/images/casos',
            publicPath: '../../assets/images/casos/',
          }),
          { label: 'Galería (fotos adicionales)' },
        ),
        modelo3d: fields.text({ label: 'Modelo 3D (ruta .glb en /models, opcional)' }),
        destacado: fields.checkbox({ label: 'Destacar en la Home' }),
        orden: fields.integer({ label: 'Orden', defaultValue: 10 }),
        contenido: fields.markdoc({ label: 'Descripción del caso', extension: 'md' }),
      },
    }),
    recursos: collection({
      label: 'Guías técnicas',
      path: 'src/content/recursos/*',
      slugField: 'titulo',
      format: { contentField: 'contenido' },
      entryLayout: 'content',
      columns: ['titulo', 'categoria'],
      schema: {
        titulo: fields.slug({ name: { label: 'Título' } }),
        descripcion: fields.text({ label: 'Descripción (meta)', multiline: true }),
        categoria: fields.text({ label: 'Categoría' }),
        icono: fields.select({
          label: 'Ícono',
          options: [
            'book',
            'layers',
            'settings',
            'target',
            'alert',
            'cpu',
            'thermometer',
            'wrench',
          ].map((v) => ({ label: v, value: v })),
          defaultValue: 'book',
        }),
        imagen: fields.image({
          label: 'Imagen de la guía',
          directory: 'src/assets/images/recursos',
          publicPath: '../../assets/images/recursos/',
        }),
        fecha: fields.date({ label: 'Fecha de publicación', validation: { isRequired: true } }),
        actualizado: fields.date({ label: 'Última actualización' }),
        wpSlug: fields.text({ label: 'Slug en el WordPress viejo (no tocar)' }),
        contenido: fields.markdoc({ label: 'Contenido', extension: 'md' }),
      },
    }),
    merch: collection({
      label: 'Catálogo de merchandising',
      path: 'src/content/merch/*',
      slugField: 'nombre',
      format: { data: 'yaml' },
      columns: ['nombre', 'categoria'],
      schema: {
        nombre: fields.slug({ name: { label: 'Nombre del objeto' } }),
        categoria: fields.select({
          label: 'Categoría',
          options: [
            { label: 'Escritorio', value: 'escritorio' },
            { label: 'Regalo', value: 'regalo' },
            { label: 'Premio', value: 'premio' },
            { label: 'Presencia de marca', value: 'presencia-de-marca' },
            { label: 'Branding', value: 'branding' },
          ],
          defaultValue: 'escritorio',
        }),
        descripcion: fields.text({ label: 'Descripción', multiline: true }),
        niveles: fields.multiselect({
          label: 'Niveles de personalización',
          options: [
            { label: '1 · Marca', value: '1' },
            { label: '2 · Persona', value: '2' },
            { label: '3 · Forma', value: '3' },
          ],
          defaultValue: ['1'],
        }),
        quePersonaliza: fields.text({ label: 'Qué se personaliza' }),
        materiales: fields.array(fields.text({ label: 'Material' }), {
          label: 'Materiales',
          itemLabel: (p) => p.value,
        }),
        minimo: fields.integer({ label: 'Mínimo de unidades' }),
        plazo: fields.text({ label: 'Plazo' }),
        precioDesde: fields.text({ label: 'Precio desde (opcional)' }),
        mostrarPrecio: fields.checkbox({ label: 'Publicar el precio', defaultValue: false }),
        fotos: fields.array(
          fields.image({
            label: 'Foto',
            directory: 'src/assets/images/merch',
            publicPath: '../../assets/images/merch/',
          }),
          { label: 'Fotos (1:1)' },
        ),
        imagenIlustrativa: fields.checkbox({
          label: 'Imagen generada con IA (muestra "Imagen ilustrativa")',
          defaultValue: false,
        }),
        estacional: fields.checkbox({ label: 'Estacional (sólo en campaña)', defaultValue: false }),
        piezaDeMesa: fields.checkbox({
          label: 'Pieza de mesa (advertencia alimentos)',
          defaultValue: false,
        }),
        orden: fields.integer({ label: 'Orden', defaultValue: 10 }),
      },
    }),
    paginas: collection({
      label: 'Páginas de texto',
      path: 'src/content/paginas/*',
      slugField: 'titulo',
      format: { contentField: 'contenido' },
      entryLayout: 'content',
      schema: {
        titulo: fields.slug({ name: { label: 'Título' } }),
        eyebrow: fields.text({ label: 'Antetítulo' }),
        bajada: fields.text({ label: 'Bajada', multiline: true }),
        seo,
        contenido: fields.markdoc({ label: 'Contenido', extension: 'md' }),
      },
    }),
  },
});
