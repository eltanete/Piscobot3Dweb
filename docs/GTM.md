# Google Tag Manager, GA4 y Google Ads

Todo se carga desde **Google Tag Manager**: en el código no hay etiquetas sueltas de GA4, Ads ni Clarity.
El sitio ya envía los eventos al `dataLayer`; en GTM sólo hay que crear las etiquetas y los disparadores de esta guía.

## 1. Instalación

1. Pasame el ID del contenedor (`GTM-XXXXXXX`) o cargalo vos como variable **`PUBLIC_GTM_ID`**:
   - Deploy automático: GitHub → Settings → Secrets and variables → Actions → _Variables_ → `PUBLIC_GTM_ID`.
   - Build manual: `$env:PUBLIC_GTM_ID="GTM-XXXXXXX"` antes de `npm run build`.
2. Volver a publicar. Sin el ID, GTM no se carga y no aparece el aviso de cookies (no se usan cookies de medición).
3. GTM se carga de forma **asíncrona** (no bloquea el render). La CSP del `.htaccess` ya permite los dominios de Google, Clarity y Turnstile.

## 2. Consent Mode v2 (ya implementado)

- Al cargar la página: `ad_storage`, `ad_user_data`, `ad_personalization` y `analytics_storage` en **denied** (`wait_for_update: 500`).
- Banner de cookies: **Aceptar** → todo `granted`; **Rechazar** → queda `denied`. La elección se guarda en el navegador (`piscobot-consent`).
- En GTM: Admin → Configuración del contenedor → activar **"Habilitar la vista general del consentimiento"**. Las etiquetas de Google (GA4, Ads) respetan el consentimiento automáticamente (consentimiento integrado). Para Clarity u otras de terceros, en _Configuración de consentimiento_ de la etiqueta exigir `analytics_storage`.

## 3. Variables a crear en GTM

| Variable         | Tipo                      | Nombre de la clave                                         |
| ---------------- | ------------------------- | ---------------------------------------------------------- |
| `DL - vertical`  | Variable de capa de datos | `vertical` (`industria`, `marcas` o `general`)             |
| `DL - linea`     | Variable de capa de datos | `linea` (p. ej. `regalos-corporativos`)                    |
| `DL - pagina`    | Variable de capa de datos | `pagina` (ruta, sin datos personales)                      |
| `DL - tipo`      | Variable de capa de datos | `tipo` (qué necesita, en `envio_formulario`)               |
| `DL - rol`       | Variable de capa de datos | `rol` (`decide`, `recomienda`, `agencia`)                  |
| `DL - cta`       | Variable de capa de datos | `cta` (sólo en `clic_cta`)                                 |
| `DL - user_data` | Variable de capa de datos | `user_data` (email y teléfono para conversiones mejoradas) |

## 4. Etiquetas y disparadores por evento

Crear un **disparador de evento personalizado** por cada evento (Nombre del evento = el de la tabla) y las etiquetas indicadas. A todas las etiquetas de evento GA4 agregar los parámetros `vertical`, `linea` y `pagina` con las variables del punto 3.

| Evento (`event`)                                  | Cuándo se dispara                                               | Parámetros extra     | Etiquetas a crear                                                                                                                        |
| ------------------------------------------------- | --------------------------------------------------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `envio_formulario`                                | Cotización enviada con éxito (**conversión principal**)         | `tipo`, `rol`, `kit` | GA4 Evento `generate_lead` (marcar como evento clave) · **Google Ads Conversión** "Cotización" (con conversiones mejoradas, ver punto 5) |
| `inicio_formulario`                               | Primer dato cargado en el cotizador o clic en un CTA de cotizar | `tipo`               | GA4 Evento `inicio_formulario`                                                                                                           |
| `clic_whatsapp`                                   | Clic en cualquier link a `wa.me` (botones, chat, barra mobile)  | —                    | GA4 Evento `clic_whatsapp` (evento clave) · Google Ads Conversión secundaria "WhatsApp"                                                  |
| `clic_telefono`                                   | Clic en un link `tel:`                                          | —                    | GA4 Evento `clic_telefono` · Google Ads Conversión secundaria "Llamada"                                                                  |
| `clic_mail`                                       | Clic en un link `mailto:`                                       | —                    | GA4 Evento `clic_mail`                                                                                                                   |
| `armar_kit`                                       | Se suma un objeto al kit o se pide la cotización del kit        | `objeto`             | GA4 Evento `armar_kit`                                                                                                                   |
| `clic_caso`                                       | Clic en una tarjeta de caso                                     | `texto`              | GA4 Evento `clic_caso`                                                                                                                   |
| `cierre_banner_campana`                           | El visitante cierra el banner de fin de año                     | —                    | GA4 Evento `cierre_banner_campana`                                                                                                       |
| `clic_cta`                                        | Otros CTAs con nombre (`cta`), p. ej. `cta_header_cotizar`      | `cta`, `texto`       | (Opcional) GA4 Evento `clic_cta`                                                                                                         |
| `whatsapp_chat_abierto` / `whatsapp_chat_enviado` | Widget de chat de WhatsApp                                      | `tipo`               | (Opcional) GA4 Evento                                                                                                                    |

Etiquetas base:

- **Google Tag (GA4)** con el ID de medición `G-XXXXXXX`, disparador _Initialization - All Pages_.
- **Vinculador de conversiones de Google Ads**, disparador _All Pages_.
- **Remarketing de Google Ads** (etiqueta "Google Ads Remarketing"), disparador _All Pages_. Opcional: parámetro personalizado `vertical` para armar audiencias por vertical.
- **Microsoft Clarity** (opcional): plantilla de la galería de GTM, con consentimiento `analytics_storage`.

## 5. Conversiones mejoradas de Google Ads (preparado)

Al enviar la cotización, el sitio hace:

```js
dataLayer.push({ user_data: { email: '…', phone_number: '…' } });
```

En la etiqueta de conversión "Cotización": _Incluir datos proporcionados por el usuario_ → nueva variable **"Datos proporcionados por el usuario"** → _Manual_ → email = `{{DL - user_data}}.email`, teléfono = `{{DL - user_data}}.phone_number`. Google **aplica el hash SHA-256 automáticamente** antes de enviarlos. Activar también "Conversiones mejoradas" en la cuenta de Google Ads.

## 6. Cómo probar

1. GTM → **Vista previa** con la URL del sitio.
2. Aceptar cookies, hacer clic en WhatsApp, abrir un caso, sumar un objeto al kit y enviar una cotización de prueba.
3. Verificar en Tag Assistant que cada evento llega con `vertical`, `linea` y `pagina`, y que las etiquetas se disparan sólo después de aceptar cookies.
4. GA4 → Informes → Tiempo real / DebugView.
