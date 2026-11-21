<?php
// Lógica compartida de los formularios para hosting PHP (Hostinger Premium).
// Equivale a src/server/* (versión Node). Mantener las reglas sincronizadas con src/server/schemas.ts.
declare(strict_types=1);

if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === '_lib.php') {
    http_response_code(404);
    exit;
}

const TIPOS = [
    'servicio-tecnico' => ['Servicio técnico', 'industria'],
    'capacitaciones' => ['Capacitaciones', 'industria'],
    'impresion' => ['Impresión 3D / diseño', 'industria'],
    'merchandising' => ['Merchandising', 'marcas'],
    'proyectos' => ['Pieza de autor', 'marcas'],
    'otro' => ['Otra consulta', 'general'],
];
const EXTENSIONES = ['stl', 'step', 'stp', 'obj', '3mf', 'pdf', 'jpg', 'jpeg', 'png', 'webp', 'zip'];
const MAX_POR_ARCHIVO = 20 * 1024 * 1024;
const MAX_TOTAL = 25 * 1024 * 1024;
const MAX_ARCHIVOS = 5;

function config(): array
{
    static $cfg = null;
    if ($cfg === null) {
        $defaults = [
            'mail_from' => 'info@piscobot3d.com',
            'mail_from_name' => 'PISCOBOT 3D',
            'mail_to' => 'info@piscobot3d.com',
            'turnstile_secret' => '',
            'limite_envios' => 5,
            'limite_ventana_seg' => 600,
        ];
        $archivo = __DIR__ . '/config.php';
        $cfg = array_merge($defaults, is_file($archivo) ? (require $archivo) : []);
    }
    return $cfg;
}

function responder(int $status, bool $ok, string $mensaje, array $errores = []): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    $body = ['ok' => $ok, 'mensaje' => $mensaje];
    if ($errores) {
        $body['errores'] = $errores;
    }
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

function campo(string $k): string
{
    $v = $_POST[$k] ?? '';
    return is_string($v) ? trim($v) : '';
}

function ip_cliente(): string
{
    $xff = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '';
    if ($xff !== '') {
        return trim(explode(',', $xff)[0]);
    }
    return $_SERVER['REMOTE_ADDR'] ?? 'desconocida';
}

/** Límite de envíos por IP usando archivos temporales. */
function permitir(string $ip): bool
{
    $cfg = config();
    $dir = sys_get_temp_dir() . '/piscobot-limite';
    if (!is_dir($dir)) {
        @mkdir($dir, 0700, true);
    }
    $archivo = $dir . '/' . hash('sha256', $ip);
    $ahora = time();
    $marcas = is_file($archivo) ? (json_decode((string) file_get_contents($archivo), true) ?: []) : [];
    $marcas = array_values(array_filter($marcas, fn($t) => $ahora - (int) $t < $cfg['limite_ventana_seg']));
    if (count($marcas) >= $cfg['limite_envios']) {
        return false;
    }
    $marcas[] = $ahora;
    @file_put_contents($archivo, json_encode($marcas), LOCK_EX);
    return true;
}

function verificar_turnstile(string $token, string $ip): bool
{
    $secret = config()['turnstile_secret'];
    if ($secret === '') {
        return true; // Turnstile no configurado
    }
    if ($token === '') {
        return false;
    }
    $ctx = stream_context_create(['http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
        'content' => http_build_query(['secret' => $secret, 'response' => $token, 'remoteip' => $ip]),
        'timeout' => 8,
    ]]);
    $res = @file_get_contents('https://challenges.cloudflare.com/turnstile/v0/siteverify', false, $ctx);
    $data = $res ? json_decode($res, true) : null;
    return is_array($data) && !empty($data['success']);
}

/** Controles comunes: método, honeypot, límite por IP y Turnstile. */
function controles_comunes(): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        responder(405, false, 'Método no permitido.');
    }
    if (campo('website') !== '') {
        responder(200, true, 'Recibido'); // bot: respondemos OK sin enviar nada
    }
    $ip = ip_cliente();
    if (!permitir($ip)) {
        responder(429, false, 'Recibimos varios envíos seguidos. Probá de nuevo en unos minutos o escribinos por WhatsApp.');
    }
    if (!verificar_turnstile(campo('cf-turnstile-response'), $ip)) {
        responder(400, false, 'No pudimos verificar que no seas un robot. Recargá la página e intentá de nuevo.');
    }
}

function largo(string $s): int
{
    return function_exists('mb_strlen') ? mb_strlen($s) : strlen($s);
}

/** Valida los campos de contacto comunes. Devuelve errores por campo. */
function validar_contacto(): array
{
    $e = [];
    $nombre = campo('nombre');
    if (largo($nombre) < 2 || largo($nombre) > 120) {
        $e['nombre'] = 'Ingresá tu nombre';
    }
    if (!filter_var(campo('email'), FILTER_VALIDATE_EMAIL) || largo(campo('email')) > 200) {
        $e['email'] = 'Ingresá un email válido';
    }
    $tel = campo('telefono');
    if ($tel !== '' && (largo($tel) > 40 || !preg_match('/^[\d\s()+-]*$/', $tel))) {
        $e['telefono'] = 'Ingresá sólo números';
    }
    if (largo(campo('empresa')) > 160) {
        $e['empresa'] = 'Máximo 160 caracteres';
    }
    return $e;
}

function texto_largo(string $k, int $min, int $max, string $msg, array &$e): void
{
    $v = campo($k);
    if (largo($v) < $min) {
        $e[$k] = $msg;
    } elseif (largo($v) > $max) {
        $e[$k] = "Máximo $max caracteres";
    }
}

/** Lee los archivos subidos en el campo archivos[] y los valida. */
function leer_adjuntos(): array
{
    $f = $_FILES['archivos'] ?? null;
    if (!$f || !is_array($f['name'])) {
        return [];
    }
    $adjuntos = [];
    $total = 0;
    foreach ($f['name'] as $i => $nombre) {
        if (($f['error'][$i] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE || (int) $f['size'][$i] === 0) {
            continue;
        }
        if ($f['error'][$i] !== UPLOAD_ERR_OK) {
            responder(422, false, 'Revisá los archivos.', ['archivos' => "\"$nombre\" no se pudo subir. Usá un link de descarga."]);
        }
        $nombre = basename((string) $nombre);
        $ext = strtolower(pathinfo($nombre, PATHINFO_EXTENSION));
        if (!in_array($ext, EXTENSIONES, true)) {
            responder(422, false, 'Revisá los archivos.', ['archivos' => "\"$nombre\": formato no permitido (" . implode(', ', EXTENSIONES) . ')']);
        }
        if ($f['size'][$i] > MAX_POR_ARCHIVO) {
            responder(422, false, 'Revisá los archivos.', ['archivos' => "\"$nombre\" supera los 20 MB. Usá un link de descarga."]);
        }
        $total += (int) $f['size'][$i];
        $adjuntos[] = ['nombre' => $nombre, 'ruta' => $f['tmp_name'][$i]];
    }
    if (count($adjuntos) > MAX_ARCHIVOS) {
        responder(422, false, 'Revisá los archivos.', ['archivos' => 'Máximo ' . MAX_ARCHIVOS . ' archivos']);
    }
    if ($total > MAX_TOTAL) {
        responder(422, false, 'Revisá los archivos.', ['archivos' => 'Los archivos superan 25 MB en total. Usá un link de descarga.']);
    }
    return $adjuntos;
}

function tabla(array $filas): array
{
    $filas = array_filter($filas, fn($v) => trim((string) $v) !== '');
    $texto = '';
    $html = '<table cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">';
    foreach ($filas as $k => $v) {
        $texto .= "$k: $v\n";
        $html .= '<tr><td style="color:#555a64;vertical-align:top"><b>' . htmlspecialchars($k) . '</b></td><td style="white-space:pre-wrap">' . htmlspecialchars((string) $v) . '</td></tr>';
    }
    return [$texto, $html . '</table>'];
}

function encabezado_mime(string $s): string
{
    return '=?UTF-8?B?' . base64_encode($s) . '?=';
}

/** Envía un email HTML (con texto alternativo y adjuntos opcionales) usando mail() de Hostinger. */
function enviar_email(string $para, string $asunto, string $texto, string $html, ?string $responderA = null, array $adjuntos = []): bool
{
    $cfg = config();
    $limite = 'b' . bin2hex(random_bytes(12));
    $alt = 'a' . bin2hex(random_bytes(12));
    $de = $cfg['mail_from'];

    $headers = [
        'MIME-Version: 1.0',
        'From: ' . encabezado_mime($cfg['mail_from_name']) . " <$de>",
        'Content-Type: multipart/mixed; boundary="' . $limite . '"',
    ];
    if ($responderA && filter_var($responderA, FILTER_VALIDATE_EMAIL)) {
        $headers[] = "Reply-To: $responderA";
    }

    $cuerpo = "--$limite\r\nContent-Type: multipart/alternative; boundary=\"$alt\"\r\n\r\n";
    $cuerpo .= "--$alt\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($texto)) . "\r\n";
    $cuerpo .= "--$alt\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($html)) . "\r\n";
    $cuerpo .= "--$alt--\r\n";
    foreach ($adjuntos as $a) {
        $datos = file_get_contents($a['ruta']);
        if ($datos === false) {
            continue;
        }
        $nombre = str_replace('"', '', $a['nombre']);
        $cuerpo .= "--$limite\r\nContent-Type: application/octet-stream; name=\"$nombre\"\r\n";
        $cuerpo .= "Content-Transfer-Encoding: base64\r\nContent-Disposition: attachment; filename=\"$nombre\"\r\n\r\n";
        $cuerpo .= chunk_split(base64_encode($datos)) . "\r\n";
    }
    $cuerpo .= "--$limite--";

    return mail($para, encabezado_mime($asunto), $cuerpo, implode("\r\n", $headers), '-f' . $de);
}
