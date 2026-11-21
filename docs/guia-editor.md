# Guía para editar el contenido

## Panel Keystatic

Entrá a **`/keystatic`** (en local: http://localhost:4321/keystatic).

Desde el panel podés editar:

| Sección                   | Qué contiene                                                                                                      |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Casos de éxito            | Trabajos con foto, material, aplicación y descripción. "Destacar en la Home" lo muestra en la portada.            |
| Guías técnicas            | Los artículos de Recursos. **No cambies el slug** de las guías existentes: son las URLs que posicionan en Google. |
| Catálogo de merchandising | Objetos base con materiales, personalización y cantidad mínima.                                                   |
| Páginas de texto          | Nosotros y Condiciones.                                                                                           |
| Datos de contacto         | Teléfono, WhatsApp, email, dirección, horario y redes. Se actualizan en todo el sitio.                            |

**En local**, los cambios se guardan directo en los archivos del proyecto: después hay que hacer commit y push.
**En producción** (modo GitHub), cada "Guardar" crea un commit y Hostinger vuelve a publicar el sitio en unos minutos.

### Imágenes

Subilas desde el panel. Antes, conviene que no pesen más de 2–3 MB; si agregás imágenes a mano en `src/assets/images/`, corré `npm run images:optimize`.

## Lo que se edita en código (por ahora)

Estos archivos tienen estructuras más complejas y se editan directamente (cualquier editor de texto):

- Textos de la Home → `src/content/home.json`
- Servicios → `src/content/servicios/*.md`
- Preguntas frecuentes → `src/content/faq/*.json`
- Testimonios → `src/content/testimonios.json`
- Logos de clientes → `src/content/clientes.json` + imagen en `src/assets/images/clientes/`

## Activar Keystatic en producción (una sola vez)

1. Crear una **GitHub App** (GitHub → Settings → Developer settings → GitHub Apps → New) con:
   - Callback URL: `https://piscobot3d.com/api/keystatic/github/oauth/callback`
   - Permisos: Contents (read & write), Metadata (read), Pull requests (read & write)
   - Instalarla en el repo `eltanete/Piscobot3Dweb`
2. Cargar en Hostinger: `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET` (cadena aleatoria larga) y `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`.
3. Rebuild. Quien edite necesita una cuenta de GitHub con acceso al repo.
