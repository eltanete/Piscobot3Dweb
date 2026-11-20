# PISCOBOT 3D — Plan de implementación por fases

> Basado en `C:\CLAUDE\docs\PISCOBOT 3D — Plan de acción nuevo sitio web.md` (20/11/2026).
> Root del proyecto: `C:\CLAUDE\WEBPISCOBOT3D2026` — un único repositorio con front y back, listo para subir a GitHub.
> Estado: **BORRADOR PARA APROBACIÓN** — no se escribió código todavía.

---

## 0. Hallazgos al revisar el entorno (20/11/2026)

| Item | Estado | Impacto |
| --- | --- | --- |
| Carpeta `WEBPISCOBOT3D2026` | Vacía | Arrancamos de cero |
| **Node.js / npm** | **No instalado** | Bloquea la Fase 1. Hay que instalar Node LTS |
| **Git** | **No instalado** | Bloquea el versionado y la subida a GitHub |
| Backup `piscobot3d-backup-2026-11-20.zip` | No está en `C:\CLAUDE` | Bloquea la Fase 3 (migración de contenido) |
| Plan de Hostinger | Sin confirmar | Define el modo de deploy (Node vs. estático + PHP) |

---

## 1. Arquitectura propuesta

### 1.1 Un solo proyecto Astro = front + back

En lugar de dos apps separadas (front y API), usamos **un único proyecto Astro** con el adaptador `@astrojs/node`:

- **Front:** todas las páginas se **pre-renderizan a HTML estático** en el build (rápido, SEO óptimo).
- **Back:** sólo las rutas que lo necesitan corren en el servidor Node (`export const prerender = false`):
  - `/api/contacto` — formulario de contacto
  - `/api/cotizacion` — cotización por pasos con adjuntos STL/STEP
  - `/keystatic` y `/api/keystatic/*` — panel de edición de contenido
- **Ventaja clave:** si Hostinger resulta ser plan Premium (sin Node), el mismo código se publica como estático y los dos endpoints se reemplazan por `public/api/*.php` (ya previstos en la Fase 5). No hay que reescribir nada.

### 1.2 Decisiones técnicas que tomo (salvo que indiques lo contrario)

| Tema | Decisión | Motivo |
| --- | --- | --- |
| Gestor de paquetes | **npm** | Viene con Node, es lo que Hostinger usa por defecto en su build |
| Islas interactivas | **React** (no Preact) | Keystatic exige React; evitamos tener dos frameworks |
| Tailwind | v4 vía `@tailwindcss/vite`, tokens en CSS (`@theme`) | Config mínima, tokens en un solo lugar |
| Validación | `zod` compartido entre front y back | Mismas reglas en el formulario y en el endpoint |
| Email | `nodemailer` + SMTP de Hostinger (Resend como alternativa) | Sin costo extra |
| Adjuntos | Hasta 20 MB por archivo, adjuntos al email; para más, campo "link de descarga" (Drive/WeTransfer) | Evita guardar archivos de clientes en el servidor |
| Tipografías | Self-hosted con `@fontsource` (Inter + JetBrains Mono, a validar en Fase 2) | Sin dependencia de Google Fonts, mejor LCP |
| Calidad de código | ESLint + Prettier + `astro check` + Vitest (back) + Playwright (E2E formularios) | Red de seguridad antes de cada deploy |
| CI | GitHub Actions: lint + typecheck + test + build en cada PR | Nada roto llega a `main` |

### 1.3 Estructura de carpetas objetivo

```
WEBPISCOBOT3D2026/
├─ .github/workflows/ci.yml        # lint, typecheck, test, build
├─ docs/                           # este plan, decisiones, guía del editor
├─ public/
│  ├─ fonts/  models/  favicon.svg  robots.txt
│  └─ api/                         # (solo si no hay Node) contacto.php, cotizacion.php
├─ scripts/                        # migración del backup WP → Markdown, optimización de imágenes
├─ src/
│  ├─ assets/images/               # imágenes optimizadas por astro:assets
│  ├─ components/
│  │  ├─ ui/                       # Button, Card, Accordion, Badge, Container…
│  │  ├─ sections/                 # Hero, Bifurcacion, Contadores, LogoWall, Testimonios, CtaFinal…
│  │  ├─ layout/                   # Header, MobileMenu, Footer, MobileCtaBar
│  │  └─ islands/                  # React: QuoteForm, MerchGallery, ModelViewer
│  ├─ content/                     # Markdown/YAML editables desde Keystatic
│  │  ├─ servicios/ casos/ merch/ recursos/ testimonios/ faq/ paginas/
│  ├─ content.config.ts            # schemas zod de las colecciones
│  ├─ layouts/BaseLayout.astro     # <head>, SEO, JSON-LD, analítica
│  ├─ lib/                         # seo.ts, whatsapp.ts, constants.ts
│  ├─ server/                      # mailer.ts, turnstile.ts, rateLimit.ts, schemas.ts
│  ├─ pages/
│  │  ├─ index.astro
│  │  ├─ industria/  index, servicio-tecnico, capacitaciones, impresion-y-desarrollo
│  │  ├─ marcas/     index, merchandising, proyectos-especiales
│  │  ├─ casos/      index, [slug]
│  │  ├─ recursos/   index, [slug]
│  │  ├─ nosotros, condiciones, contacto, cotizar, 404
│  │  └─ api/        contacto.ts, cotizacion.ts
│  └─ styles/global.css            # Tailwind + tokens de diseño
├─ tests/                          # unit (server) + e2e (Playwright)
├─ astro.config.mjs  keystatic.config.ts  tsconfig.json
├─ .env.example  .gitignore  .editorconfig  .nvmrc
├─ CLAUDE.md  README.md  package.json
```

### 1.4 Mapa de URLs (sitemap del plan)

| Grupo | Rutas |
| --- | --- |
| Home | `/` |
| Industria y Técnica | `/industria`, `/industria/servicio-tecnico`, `/industria/capacitaciones`, `/industria/impresion-y-desarrollo` (incluye `#diseno`) |
| Marcas y Agencias | `/marcas`, `/marcas/merchandising`, `/marcas/proyectos-especiales` |
| Comunes | `/casos` (+ detalle), `/recursos` (+ 6 guías), `/nosotros`, `/condiciones`, `/contacto`, `/cotizar` |
| Sistema | `/404`, `/sitemap-index.xml`, `/robots.txt`, `/keystatic` (protegido) |

---

## 2. Fases de implementación

Cada fase termina con **entregable revisable + commit/PR** y tiene un criterio de "terminado". No se pasa a la siguiente sin tu OK.

---

### Fase 0 — Preparación del entorno *(½ día · la hacés vos con mi guía)*

**Objetivo:** que la máquina y las cuentas estén listas.

- [ ] Instalar **Node.js LTS** (22.x o superior) y **Git for Windows**.
- [ ] Configurar Git (`user.name`, `user.email`).
- [ ] Crear repo vacío en GitHub (privado), p. ej. `piscobot3d-web`.
- [ ] Copiar el backup `piscobot3d-backup-2026-11-20.zip` a una carpeta **fuera del repo** (p. ej. `C:\CLAUDE\backup-wp\`) — pesa 111 MB y no debe subirse.
- [ ] Confirmar plan de Hostinger (Premium / Business / Cloud).

**Terminado cuando:** `node -v`, `npm -v` y `git --version` responden; el backup está accesible.

---

### Fase 1 — Scaffold del proyecto *(1 día)*

**Objetivo:** esqueleto funcionando en `localhost` con todo el tooling.

- [ ] `npm create astro@latest` en el root (TypeScript strict).
- [ ] Integraciones: `@astrojs/node` (modo standalone), `@astrojs/react`, `@astrojs/sitemap`, Tailwind v4, `@astrojs/mdx`.
- [ ] ESLint + Prettier (con plugin Astro y Tailwind), `.editorconfig`, `.nvmrc`.
- [ ] Estructura de carpetas de §1.3 con archivos placeholder.
- [ ] `.env.example` (SMTP_*, TURNSTILE_*, WHATSAPP_NUMBER, SITE_URL, GA_ID, KEYSTATIC_*), `.gitignore` (incluye `.env`, `dist/`, `node_modules/`, backups).
- [ ] `README.md` (cómo correr, variables, deploy) y `CLAUDE.md` (convenciones para futuras sesiones).
- [ ] GitHub Actions `ci.yml`: install → lint → `astro check` → test → build.
- [ ] `git init`, primer commit, push a GitHub.

**Terminado cuando:** `npm run dev` muestra una página, `npm run build` genera `dist/server/entry.mjs` y CI pasa en verde.

---

### Fase 2 — Sistema de diseño *(3–4 días)*

**Objetivo:** tokens y componentes base, visibles en una página `/styleguide` (sólo en desarrollo).

- [ ] **Tokens** en `global.css` (`@theme`): grafito `#1A1C21`, blanco, azul marca `#0033FF`, naranja `#FF6600` (acento Marcas, *a validar*), neutros, estados; escala de espaciado 8 px; radios; sombras; breakpoints 375 / 768 / 1280 / 1440.
- [ ] Tipografía: 1 sans de interfaz + 1 mono para datos técnicos; escala tipográfica fluida (`clamp`).
- [ ] Tema por vertical: atributo `data-vertical="industria|marcas"` que cambia el color de acento.
- [ ] Componentes `ui/`: Button (primario/secundario/WhatsApp), Link, Container, Section, Grid, Card, Badge, Accordion (accesible, `<details>`), Tabs, Input/Select/Textarea/FileInput, Stat (contador), Icon.
- [ ] Componentes `layout/`: Header con navegación por vertical, MobileMenu (isla mínima), Footer, **MobileCtaBar** fija (Cotizar + WhatsApp).
- [ ] Utilidad `whatsapp.ts`: links `wa.me` con mensaje pre-cargado por página.
- [ ] Movimiento: transiciones CSS + `prefers-reduced-motion`.

**Terminado cuando:** `/styleguide` muestra todos los componentes en 375 px y 1440 px, contraste AA verificado.
**Depende de:** decisión sobre el naranja y la tipografía (se puede arrancar con la propuesta y ajustar).

---

### Fase 3 — Modelo de contenido y migración *(3–4 días, en paralelo con Fase 2)*

**Objetivo:** todo el contenido como datos tipados, fuera de los componentes.

- [ ] Schemas zod en `content.config.ts` para las colecciones:
  - `servicios` (vertical, título, resumen, beneficios, módulos, CTA, SEO)
  - `casos` (vertical, cliente, material, aplicación, métricas, imágenes, modelo GLB opcional)
  - `merch` (objeto base, materiales, personalización, mínimo, precio por volumen opcional)
  - `recursos` (guías técnicas; las 6 del blog actual)
  - `testimonios`, `faq` (por servicio/tema), `clientes` (logos), `paginas` (textos de Home, Nosotros, Condiciones)
  - `config` (teléfono, WhatsApp, email, dirección, horario, redes)
- [ ] Script `scripts/migrate-wp.ts`: lee el backup (Markdown + export de la API WP) y genera los archivos iniciales en `src/content/`. Corrige los textos cruzados detectados (p. ej. "Mantenimiento Preventivo").
- [ ] Script `scripts/optimize-images.ts`: selecciona las imágenes usadas, renombra con nombres descriptivos y las pasa a `src/assets/images/` (Astro genera AVIF/WebP responsive). Meta: de 111 MB a < 10 MB servidos.
- [ ] Inventario de textos faltantes (merch, proyectos especiales, Condiciones) en `docs/contenido-pendiente.md`.

**Terminado cuando:** `astro check` valida todas las colecciones y las 6 guías renderizan en `/recursos/[slug]` con estilo básico.
**Nota:** los **textos finales** reescritos (fase "Contenido" del plan original) los provee el equipo; acá migramos los actuales como base y los reemplazamos a medida que lleguen.

---

### Fase 4 — Páginas *(7–10 días)*

**Objetivo:** todas las rutas del sitemap construidas con componentes y contenido real.

Orden de construcción (de mayor a menor impacto):

1. [ ] **Home** — 13 bloques del wireframe: Hero de autoridad → prueba rápida → **bifurcación** (2 tarjetas de igual peso, una por vertical) → contadores → logos → bloques por vertical (6 y 7) → casos destacados → recursos → testimonios → nosotros breve → **"¿Qué necesitás?"** (CTA final por intención) → footer.
2. [ ] **Landings de vertical**: `/industria` y `/marcas`.
3. [ ] **Servicios Industria**: servicio técnico (con sección makers), capacitaciones (módulos, workshops, sección particulares), impresión y desarrollo (con ancla `#diseno`, ingeniería inversa, escaneo).
4. [ ] **Servicios Marcas**: merchandising (isla `MerchGallery` con filtros) y proyectos especiales.
5. [ ] **Casos** (listado filtrable por vertical + detalle) y **Recursos** (listado + guía con índice).
6. [ ] **Nosotros, Condiciones** (garantías, ingreso/egreso, formas de pago), **Contacto**, **404**.
7. [ ] **Visor 3D**: isla `ModelViewer` con `<model-viewer>`, carga diferida (sólo al entrar en pantalla), fallback a imagen.

Reglas aplicadas en cada página: qué / para quién / próximo paso en el primer pantallazo; un CTA principal; prueba social cerca del CTA; FAQ en acordeón.

**Terminado cuando:** todas las rutas existen, navegación completa sin links rotos, se ven bien en 375 / 768 / 1280 / 1440.

---

### Fase 5 — Backend: formularios y cotización *(4–5 días)*

**Objetivo:** convertir visitas en leads clasificados.

- [ ] `src/server/schemas.ts`: schemas zod de contacto y cotización (compartidos con el front).
- [ ] **Isla `QuoteForm`** en `/cotizar` (y embebible): 4 pasos — ¿qué necesitás? (pre-clasifica vertical/servicio) → datos del proyecto → adjuntar STL/STEP/OBJ/3MF/PDF/imagen → contacto. Guarda borrador en `sessionStorage`, accesible por teclado, mensajes de error claros.
- [ ] **`POST /api/cotizacion`** (multipart): validación zod, límite de tamaño y extensiones permitidas, verificación **Cloudflare Turnstile**, honeypot, rate limit por IP, envío con `nodemailer`:
  - email al equipo con asunto `[Cotización · Industria · Impresión] Nombre — Empresa` y adjuntos;
  - email de confirmación al cliente.
- [ ] **`POST /api/contacto`**: versión simple del anterior.
- [ ] Respuestas JSON tipadas + página de "gracias" (para medir conversión).
- [ ] Tests: Vitest para validación/handlers (mock SMTP) y Playwright para el flujo E2E.
- [ ] **Plan B (si Hostinger no tiene Node):** `public/api/cotizacion.php` y `contacto.php` con la misma interfaz (mismos campos y respuestas), usando PHPMailer + SMTP.

**Terminado cuando:** un envío desde localhost llega al buzón de prueba con adjunto, el spam simulado es rechazado y los tests pasan.

---

### Fase 6 — CMS Keystatic *(2–3 días)*

**Objetivo:** que el equipo edite textos, casos, merch y guías sin tocar código.

- [ ] `keystatic.config.ts` con las mismas colecciones de la Fase 3 (campos, imágenes, selects de vertical).
- [ ] Modo **local** para desarrollo (edita los archivos del repo directamente).
- [ ] Modo **GitHub** para producción: el panel en `/keystatic` hace commits al repo → Hostinger redeploya solo. Requiere crear una GitHub App (te guío) y variables `KEYSTATIC_*`.
- [ ] `docs/guia-editor.md`: cómo entrar, editar, subir imágenes y publicar.
- [ ] *Si no hay Node en producción:* el panel queda sólo en modo local (edita quien corra el proyecto) — se documenta la limitación.

**Terminado cuando:** un cambio hecho desde el panel aparece en el sitio tras el redeploy.

---

### Fase 7 — SEO, analítica y redirecciones *(2–3 días)*

- [ ] `BaseLayout`: title/description por página (conservando las keywords que hoy posicionan), canonical, Open Graph y Twitter cards.
- [ ] **Imágenes OG** por página (generadas en build con plantilla de marca).
- [ ] JSON-LD: Organization, LocalBusiness, Service, FAQPage, Article, BreadcrumbList.
- [ ] `@astrojs/sitemap` + `robots.txt`.
- [ ] **Redirecciones 301** de la tabla del plan original, en `astro.config.mjs` (`redirects`) **y** como `.htaccess`/config de Hostinger por si el servidor las atiende antes que Node. Incluye las 6 guías del blog.
- [ ] GA4 con eventos de conversión (`cotizacion_enviada`, `whatsapp_click`, `vertical_elegida`) segmentados por vertical; Microsoft Clarity opcional. Banner de consentimiento mínimo.
- [ ] Search Console (alta en Fase 9).

**Terminado cuando:** validadores de datos estructurados y de OG sin errores; script de prueba confirma que cada URL vieja devuelve 301 a la nueva.

---

### Fase 8 — QA *(3–4 días)*

- [ ] Lighthouse mobile ≥ 95 en Home, una página por vertical y una guía; LCP < 2,0 s.
- [ ] Accesibilidad AA: axe sin errores, navegación por teclado, foco visible, alt en imágenes, contraste.
- [ ] Dispositivos reales: iPhone (Safari), Android (Chrome), tablet, desktop (Chrome/Firefox/Edge).
- [ ] Formularios de punta a punta (con adjuntos grandes, errores de red, spam).
- [ ] Links rotos, ortografía, revisión final de textos con el equipo.
- [ ] Checklist en `docs/qa-checklist.md` con resultados.

**Terminado cuando:** checklist completo y aprobado por vos.

---

### Fase 9 — Deploy y lanzamiento *(2–3 días)*

- [ ] **Hostinger (Node, Business/Cloud):** crear app Node.js conectada al repo de GitHub, build `npm run build`, start `node ./dist/server/entry.mjs`, variables de entorno cargadas en el panel.
  *(Plan B Premium: build estático + subida de `dist/` y los PHP.)*
- [ ] Publicar en **subdominio de prueba** (p. ej. `nuevo.piscobot3d.com`) con `noindex`.
- [ ] Pruebas finales en el subdominio (formularios con SMTP real, redirecciones).
- [ ] **Cambio de dominio**: apuntar DNS, verificar HTTPS, quitar `noindex`.
- [ ] Alta del sitemap en Search Console, monitorear errores 404 la primera semana.
- [ ] WordPress queda como respaldo 30 días y luego se da de baja.

**Terminado cuando:** el dominio principal sirve el sitio nuevo, sin 404 de URLs viejas en Search Console.

---

### Fase 10 — Post-lanzamiento *(semanas 9–12)*

- [ ] Revisar conversiones por vertical en GA4 y ajustar CTAs.
- [ ] Publicar nuevas guías y casos desde Keystatic.
- [ ] Evaluar Payload CMS sólo si aparecen necesidades de usuarios/pedidos/área de clientes.

---

## 3. Cronograma resumido

| Semana | Fases |
| --- | --- |
| 1 | F0 Entorno · F1 Scaffold |
| 2–3 | F2 Diseño · F3 Contenido (en paralelo) |
| 4–5 | F4 Páginas |
| 6 | F5 Backend · F6 Keystatic |
| 7 | F7 SEO/analítica · ajustes de contenido final |
| 8 | F8 QA |
| 9 | F9 Deploy y lanzamiento |
| 10–12 | F10 Post-lanzamiento |

Coincide con las 8–10 semanas del plan original. El cuello de botella real es el **contenido nuevo** (textos finales, fotos, catálogo de merch, modelos GLB), que no depende del desarrollo.

---

## 4. Qué necesito de vos antes de arrancar

**Para la Fase 0–1 (bloqueante):**
1. Instalar Node.js LTS y Git (o autorizarme a guiarte paso a paso).
2. Nombre del repo en GitHub y si será privado.
3. Ubicación del backup `.zip`.

**Para Fases 2–9 (se puede avanzar con supuestos):**
4. Plan de Hostinger → define Node vs. estático + PHP.
5. ¿Naranja como acento de Marcas? (asumo **sí**).
6. ¿Se muestra la venta de insumos? (asumo **no** en el menú, mención en Nosotros).
7. ¿Precios de referencia de capacitaciones? (asumo **sí**, como hoy).
8. Listado de 6–12 objetos base de merch y modelo de precio.
9. Quién edita el contenido y cuenta de email para recibir cotizaciones.
10. Fotos propias y logos de clientes con permiso.

---

## 5. Riesgos y mitigaciones

| Riesgo | Mitigación |
| --- | --- |
| Hostinger sin Node | Arquitectura estática-primero + endpoints PHP equivalentes (Plan B listo desde Fase 5) |
| Contenido final se demora | Migramos los textos actuales como base; el sitio puede lanzarse con ellos y mejorarse desde Keystatic |
| Pérdida de SEO al migrar | Redirecciones 301 completas, mismos keywords en títulos, monitoreo en Search Console |
| Adjuntos muy pesados por email | Límite de 20 MB + campo de link externo |
| Spam en formularios | Turnstile + honeypot + rate limit |
| Keystatic en GitHub mode requiere configuración | Se documenta paso a paso; fallback a modo local |
