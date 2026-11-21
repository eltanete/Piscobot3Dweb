<?php
// Copiar como config.php (en el servidor, carpeta /api) o dejar que lo genere el deploy de GitHub.
// config.php NO se versiona: puede contener la clave secreta de Turnstile.
return [
    'mail_from' => 'info@piscobot3d.com',   // debe ser una casilla del dominio creada en Hostinger
    'mail_from_name' => 'PISCOBOT 3D',
    'mail_to' => 'info@piscobot3d.com',     // quién recibe las cotizaciones
    'turnstile_secret' => '',               // clave secreta de Cloudflare Turnstile (vacío = desactivado)
    'dir_adjuntos' => '',                   // vacío = carpeta piscobot-adjuntos al lado de public_html (fuera de la web)
    'limite_envios' => 5,                   // envíos por IP...
    'limite_ventana_seg' => 600,            // ...cada 10 minutos
];
