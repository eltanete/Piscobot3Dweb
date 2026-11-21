# Estado del proyecto — dónde quedamos

> Última actualización: 20/11/2026. Leer esto primero para retomar el trabajo.
> Plan completo: [`PLAN-IMPLEMENTACION.md`](PLAN-IMPLEMENTACION.md).

## Resumen

El sitio está **funcional de punta a punta en local**: todas las páginas del sitemap con contenido real migrado del WordPress, formularios con backend, CMS y redirecciones. Falta configurar los servicios externos (SMTP, Turnstile, GA4, GitHub App), el QA en dispositivos reales y el deploy en Hostinger.

| Fase                  | Estado     | Notas                                                                                                                                                                                                                                            |
| --------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0 · Entorno           | ✅         | Node 26, Git 2.56. **Falta hacer el primer `git push` con login de GitHub** (ver abajo).                                                                                                                                                         |
| 1 · Scaffold          | ✅         | Astro 7 + Tailwind 4 + React + `@astrojs/node`, ESLint, Prettier, Vitest, CI.                                                                                                                                                                    |
| 2 · Sistema de diseño | ✅         | Tokens en `src/styles/global.css`, acento por vertical (`data-vertical`), componentes en `src/components/`. Sin página `/styleguide` (se omitió para ganar tiempo).                                                                              |
| 3 · Contenido         | ✅         | Migrado del backup: textos, FAQs, 6 casos con fotos, 6 guías (mismas URLs), testimonios, logos, contadores, datos de contacto. Imágenes optimizadas (19,3 MB → 1,7 MB).                                                                          |
| 4 · Páginas           | ✅         | Home (13 bloques), 2 landings de vertical, 5 servicios, casos (+detalle), recursos (+guía), nosotros, condiciones, contacto, cotizar, 404. Visor 3D listo (falta cargar modelos `.glb`).                                                         |
| 5 · Backend           | ✅         | `/api/cotizacion` (4 pasos, adjuntos STL/STEP hasta 20 MB) y `/api/contacto`. Turnstile + honeypot + límite por IP. 9 tests. **Sin SMTP configurado los emails se simulan en consola.** Plan B PHP: pendiente (sólo si Hostinger no tiene Node). |
| 6 · CMS Keystatic     | ✅ local   | `/keystatic`: casos, guías, merch, páginas, datos de contacto. **Modo GitHub en producción pendiente** (crear GitHub App). Servicios, FAQs, Home y testimonios se editan en código (JSON/MD).                                                    |
| 7 · SEO               | ✅         | Meta, OG (imagen por defecto), JSON-LD (Organization/LocalBusiness, Service, FAQPage, Article, Breadcrumbs), sitemap, robots, 13 redirecciones 301 verificadas. GA4/Clarity con consentimiento (se activan al cargar los IDs).                   |
| 8 · QA                | 🟡 parcial | Verificado: build, tipos, lint, tests, redirecciones, formulario de punta a punta, mobile 375 px sin scroll horizontal. **Falta:** Lighthouse, axe, dispositivos reales, revisión de textos con el equipo.                                       |
| 9 · Deploy            | ⬜         | Ver [`DEPLOY.md`](DEPLOY.md).                                                                                                                                                                                                                    |
| 10 · Post-lanzamiento | ⬜         | —                                                                                                                                                                                                                                                |

## Próximos pasos (en orden)

1. **Subir a GitHub** — en una terminal, dentro de la carpeta del proyecto:
   ```bash
   git push origin main
   git push -u origin feature/fases-2-a-7
   ```
   La primera vez se abre el navegador para iniciar sesión. Después abrir un Pull Request de `feature/fases-2-a-7` → `main`.
2. **Revisar el sitio en local** (`npm run dev`) y anotar ajustes de textos y diseño.
3. **Completar el contenido pendiente** → [`contenido-pendiente.md`](contenido-pendiente.md).
4. **Confirmar el plan de Hostinger** (Business/Cloud = Node; Premium = estático + PHP).
5. **Configurar servicios**: SMTP de Hostinger, Cloudflare Turnstile, GA4 → variables en `.env` / panel de Hostinger.
6. **QA** (Fase 8) y **deploy en subdominio de prueba** con `PUBLIC_NOINDEX=true` (Fase 9).
7. **Keystatic en producción**: crear la GitHub App (ver [`guia-editor.md`](guia-editor.md)).

## Decisiones tomadas en el camino

- **Naranja #FF6600 como acento de Marcas.** No alcanza contraste AA con texto blanco: los botones naranjas usan texto grafito y el texto naranja sobre blanco usa `#B84A00`.
- **React** para las islas (lo exige Keystatic). Sin `eslint-plugin-jsx-a11y` (no soporta ESLint 10 todavía).
- **Precios de referencia de capacitaciones publicados** en las FAQ, como en el sitio actual.
- **Venta de insumos**: sólo mencionada en Nosotros, no en el menú.
- **Merchandising**: el catálogo de 6 objetos base es una **propuesta** (la página de merch del WordPress estaba vacía).
- **Redirecciones**: se resuelven con la ruta comodín `src/pages/[...ruta].ts` (los middlewares de Astro no corren para rutas inexistentes). Las URLs con barra final hacen 2 saltos 301 (Astro primero quita la barra).
- **Emails**: si `SMTP_HOST` no está definido, se registran en consola (útil en desarrollo).

## Mapa rápido del código

| Qué                          | Dónde                                                                    |
| ---------------------------- | ------------------------------------------------------------------------ |
| Datos de contacto            | `src/content/sitio.json` (o Keystatic → Datos de contacto)               |
| Textos de la Home            | `src/content/home.json`                                                  |
| Servicios (5 páginas)        | `src/content/servicios/*.md` (frontmatter)                               |
| FAQs                         | `src/content/faq/*.json`                                                 |
| Casos, guías, merch, páginas | `src/content/{casos,recursos,merch,paginas}/` (o Keystatic)              |
| Testimonios / logos          | `src/content/testimonios.json`, `src/content/clientes.json`              |
| Menú                         | `src/lib/nav.ts`                                                         |
| Redirecciones 301            | `src/lib/redirects.mjs`                                                  |
| Formularios (front)          | `src/components/islands/QuoteForm.tsx`, `ContactForm.tsx`                |
| Formularios (back)           | `src/server/*`, `src/pages/api/*`                                        |
| Esquemas de contenido        | `src/content.config.ts` + `keystatic.config.ts` (mantener sincronizados) |

## Comandos útiles

```bash
npm run dev               # desarrollo en http://localhost:4321
npm run build && npm start  # producción local
npm run lint && npm run check && npm test
npm run check:redirects -- http://localhost:4321   # con el servidor corriendo
npm run images:optimize   # después de agregar imágenes en src/assets/images
npm run brand:generate    # regenera favicons e imagen OG
```

El backup del WordPress está extraído en `C:\CLAUDE\backup-wp\` (fuera del repo).
