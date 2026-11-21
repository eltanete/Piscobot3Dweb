<?php
// POST /api/cotizacion.php — misma interfaz que el endpoint Node (src/server/handlers.ts).
declare(strict_types=1);
require __DIR__ . '/_lib.php';

controles_comunes();

$tipo = campo('tipo');
$tipo = ALIAS_TIPOS[$tipo] ?? $tipo;

$e = validar_contacto();
if (!isset(TIPOS[$tipo])) {
    $e['tipo'] = 'Elegí qué necesitás';
}
if (!isset(CLARIDAD[campo('claridad')])) {
    $e['claridad'] = 'Contanos si ya sabés qué querés';
}
if (!isset(ROLES[campo('rol')])) {
    $e['rol'] = 'Elegí tu rol';
}
$presupuesto = campo('presupuesto');
if ($presupuesto !== '' && !isset(PRESUPUESTOS[$presupuesto])) {
    $e['presupuesto'] = 'Elegí un rango de la lista';
}
foreach (['destinatarios' => 200, 'cantidad' => 60, 'fechaEntrega' => 40, 'descripcion' => 4000, 'linea' => 80, 'origen' => 200, 'kit' => 1000] as $k => $max) {
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
[$label, $vertical, $lineaTipo] = TIPOS[$tipo];
$linea = campo('linea') !== '' ? campo('linea') : $lineaTipo;
$nombre = campo('nombre');
$empresa = campo('empresa');
$email = campo('email');
$rol = campo('rol');
$esAgencia = $rol === 'agencia';

// Adjuntar al mail sólo si el total es razonable; los archivos quedan siempre guardados en el servidor.
$totalAdj = array_sum(array_column($adjuntos, 'tam'));
$paraMail = [];
$listaAdj = [];
foreach ($adjuntos as $i => $a) {
    $nombreSeguro = 'adjunto-' . ($i + 1) . '.' . $a['ext'];
    $listaAdj[] = $nombreSeguro . ' (original: ' . $a['nombre'] . ') → ' . basename(dirname($a['guardado'])) . '/' . basename($a['guardado']);
    if ($totalAdj <= MAX_ADJUNTAR_MAIL) {
        $paraMail[] = ['nombre' => $nombreSeguro, 'ruta' => $a['guardado']];
    }
}

$filas = [
    'Qué necesita' => $label,
    '¿Sabe qué quiere?' => CLARIDAD[campo('claridad')],
    'Vertical' => $vertical,
    'Línea' => $linea,
    'Destinatarios' => campo('destinatarios'),
    'Cantidad' => campo('cantidad'),
    'Fecha de entrega' => campo('fechaEntrega'),
    'Presupuesto de referencia' => $presupuesto !== '' ? PRESUPUESTOS[$presupuesto] : '',
    'Kit armado' => campo('kit'),
    'Detalles' => campo('descripcion'),
    'Link de archivos' => $link,
    'Nombre' => $nombre,
    'Empresa' => $empresa,
    'Rol' => ROLES[$rol] . ($esAgencia ? ' — PRECIO DE REVENTA' : ''),
    'Email' => $email,
    'WhatsApp' => campo('telefono'),
    'Página de origen' => campo('origen'),
];
foreach (ATRIBUCION as $k) {
    $filas[$k] = campo($k);
}
$filas['Adjuntos'] = implode("\n", $listaAdj)
    . ($listaAdj && !$paraMail ? "\n(Superan 15 MB: quedaron guardados en la carpeta piscobot-adjuntos del hosting, fuera de public_html.)" : '');
[$texto, $html] = tabla($filas);

$okEquipo = enviar_email(
    config()['mail_to'],
    '[Cotización' . ($esAgencia ? ' · AGENCIA' : '') . " · $label] $nombre" . ($empresa !== '' ? " — $empresa" : ''),
    $texto,
    '<h2 style="font-family:Arial,sans-serif">Nueva solicitud de cotización</h2>' . $html,
    $email,
    $paraMail
);
if (!$okEquipo) {
    responder(502, false, 'No pudimos enviar tu consulta. Escribinos por WhatsApp y te respondemos enseguida.');
}

$n = htmlspecialchars($nombre);
enviar_email(
    $email,
    'Recibimos tu consulta — PISCOBOT 3D',
    "Hola $nombre. " . MENSAJE_CONFIRMACION . "\n\n$texto\nPISCOBOT 3D",
    "<p style=\"font-family:Arial,sans-serif\">Hola $n. " . htmlspecialchars(MENSAJE_CONFIRMACION) . "</p>$html<p style=\"font-family:Arial,sans-serif\">PISCOBOT 3D</p>"
);

responder(200, true, MENSAJE_CONFIRMACION);
