<?php
// POST /api/contacto.php — misma interfaz que el endpoint Node (src/server/handlers.ts).
declare(strict_types=1);
require __DIR__ . '/_lib.php';

controles_comunes();

$e = validar_contacto();
$asunto = campo('asunto') ?: 'no-se';
if (!isset(TIPOS[$asunto])) {
    $e['asunto'] = 'Elegí un asunto';
}
texto_largo('mensaje', 10, 4000, 'Escribí tu mensaje (mínimo 10 caracteres)', $e);
if ($e) {
    responder(422, false, 'Revisá los campos marcados.', $e);
}

$label = TIPOS[$asunto][0];
[$texto, $html] = tabla([
    'Asunto' => $label,
    'Mensaje' => campo('mensaje'),
    'Nombre' => campo('nombre'),
    'Empresa' => campo('empresa'),
    'Email' => campo('email'),
    'Teléfono' => campo('telefono'),
]);

$ok = enviar_email(
    config()['mail_to'],
    "[Contacto · $label] " . campo('nombre'),
    $texto,
    '<h2 style="font-family:Arial,sans-serif">Nuevo mensaje de contacto</h2>' . $html,
    campo('email')
);
if (!$ok) {
    responder(502, false, 'No pudimos enviar tu mensaje. Escribinos por WhatsApp.');
}
responder(200, true, '¡Gracias! Recibimos tu mensaje y te respondemos a la brevedad.');
