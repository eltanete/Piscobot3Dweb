<?php
// POST /api/cotizacion.php — misma interfaz que el endpoint Node (src/server/handlers.ts).
declare(strict_types=1);
require __DIR__ . '/_lib.php';

controles_comunes();

$e = validar_contacto();
$tipo = campo('tipo');
if (!isset(TIPOS[$tipo])) {
    $e['tipo'] = 'Elegí qué necesitás';
}
texto_largo('descripcion', 10, 4000, 'Contanos un poco más (mínimo 10 caracteres)', $e);
foreach (['cantidad' => 60, 'plazo' => 120, 'material' => 120, 'equipo' => 160] as $k => $max) {
    if (largo(campo($k)) > $max) {
        $e[$k] = "Máximo $max caracteres";
    }
}
$link = campo('linkArchivos');
if ($link !== '' && !filter_var($link, FILTER_VALIDATE_URL)) {
    $e['linkArchivos'] = 'Ingresá un link válido';
}
if ($e) {
    responder(422, false, 'Revisá los campos marcados.', $e);
}

$adjuntos = leer_adjuntos();
[$label, $vertical] = TIPOS[$tipo];
$nombre = campo('nombre');
$empresa = campo('empresa');
$email = campo('email');

[$texto, $html] = tabla([
    'Tipo' => $label,
    'Vertical' => $vertical,
    'Descripción' => campo('descripcion'),
    'Cantidad' => campo('cantidad'),
    'Plazo' => campo('plazo'),
    'Material' => campo('material'),
    'Equipo' => campo('equipo'),
    'Link de archivos' => $link,
    'Nombre' => $nombre,
    'Empresa' => $empresa,
    'Email' => $email,
    'Teléfono' => campo('telefono'),
    'Adjuntos' => implode(', ', array_column($adjuntos, 'nombre')),
]);

$okEquipo = enviar_email(
    config()['mail_to'],
    "[Cotización · $label] $nombre" . ($empresa !== '' ? " — $empresa" : ''),
    $texto,
    '<h2 style="font-family:Arial,sans-serif">Nueva solicitud de cotización</h2>' . $html,
    $email,
    $adjuntos
);
if (!$okEquipo) {
    responder(502, false, 'No pudimos enviar tu consulta. Escribinos por WhatsApp y te respondemos enseguida.');
}

$n = htmlspecialchars($nombre);
$l = htmlspecialchars($label);
enviar_email(
    $email,
    'Recibimos tu consulta — PISCOBOT 3D',
    "Hola $nombre, recibimos tu consulta sobre \"$label\". Te respondemos con un presupuesto en menos de 24 horas hábiles.\n\n$texto\nPISCOBOT 3D",
    "<p style=\"font-family:Arial,sans-serif\">Hola $n, recibimos tu consulta sobre <b>$l</b>. Te respondemos con un presupuesto en menos de 24 horas hábiles.</p>$html<p style=\"font-family:Arial,sans-serif\">PISCOBOT 3D</p>"
);

responder(200, true, '¡Listo! Recibimos tu consulta y te respondemos en menos de 24 horas hábiles.');
