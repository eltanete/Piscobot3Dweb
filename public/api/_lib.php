<?php
// Lógica compartida de los formularios para hosting PHP (Hostinger Premium).
// Equivale a src/server/* (versión Node). Mantener las reglas sincronizadas con src/server/schemas.ts.
declare(strict_types=1);

if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === '_lib.php') {
    http_response_code(404);
    exit;
}

const TIPOS = [
    'regalos' => ['Regalos para clientes', 'marcas', 'regalos-corporativos'],
    'trofeos' => ['Trofeos', 'marcas', 'regalos-corporativos'],
    'fiesta' => ['Fiesta', 'marcas', 'activaciones'],
    'evento' => ['Evento o stand', 'marcas', 'esculturas-de-marca'],
    'pieza-de-autor' => ['Pieza de autor', 'marcas', 'piezas-de-autor'],
    'merchandising' => ['Merchandising', 'marcas', 'merchandising'],
    'servicio-tecnico' => ['Servicio técnico', 'industria', 'servicio-tecnico'],
    'capacitaciones' => ['Capacitación', 'industria', 'capacitaciones'],
    'impresion' => ['Impresión o desarrollo', 'industria', 'impresion-y-desarrollo'],
    'no-se' => ['Todavía no sé', 'general', ''],
];
const ALIAS_TIPOS = ['proyectos' => 'pieza-de-autor', 'otro' => 'no-se'];
const CLARIDAD = ['si' => 'Sí, sé qué quiero', 'idea' => 'Tengo una idea', 'no' => 'No, necesito ideas'];
const ROLES = ['decide' => 'Decido la compra', 'recomienda' => 'Recomiendo / evalúo', 'agencia' => 'Soy de una agencia'];
const PRESUPUESTOS = [
    'hasta-500k' => 'Hasta $ 500.000',
    '500k-1500k' => '$ 500.000 a $ 1.500.000',
    '1500k-5m' => '$ 1.500.000 a $ 5.000.000',
    'mas-5m' => 'Más de $ 5.000.000',
    'no-se' => 'Prefiero no decir',
];
const ATRIBUCION = ['gclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
const MENSAJE_CONFIRMACION = 'Listo. En menos de 48 horas hábiles te mandamos ideas o presupuesto. Si es urgente, escribinos por WhatsApp.';
// Adjuntos: lista blanca + tipo real por contenido. SVG no se acepta.
const EXTENSIONES = ['stl', 'step', 'stp', '3mf', 'pdf', 'jpg', 'jpeg', 'png'];
const MAX_TOTAL = 50 * 1024 * 1024;
const MAX_ARCHIVOS = 8;
// Los adjuntos van pegados al mail sólo si suman hasta este tamaño; si no, se listan con su ubicación.
const MAX_ADJUNTAR_MAIL = 15 * 1024 * 1024;

function config(): array
{
    static $cfg = null;
    if ($cfg === null) {
        $defaults = [
            'mail_from' => 'info@piscobot3d.com',
            'mail_from_name' => 'PISCOBOT 3D',
            'mail_to' => 'info@piscobot3d.com',
            'turnstile_secret' => '',
            'dir_adjuntos' => '',
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
    if (!is_string($v)) {
        return '';
    }
    // Sanitización: sin caracteres de control (salvo saltos de línea y tab) ni bytes UTF-8 inválidos.
    $v = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $v) ?? '';
    return trim($v);
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

/** Verifica el tipo real del archivo por su firma. Devuelve la extensión normalizada o null. */
function tipo_real(string $nombre, string $ruta): ?string
{
    $ext = strtolower(pathinfo($nombre, PATHINFO_EXTENSION));
    $fh = @fopen($ruta, 'rb');
    if (!$fh) {
        return null;
    }
    $inicio = (string) fread($fh, 512);
    fclose($fh);
    $tam = (int) filesize($ruta);
    switch ($ext) {
        case 'pdf':
            return str_starts_with($inicio, '%PDF') ? 'pdf' : null;
        case 'png':
            return str_starts_with($inicio, "\x89PNG") ? 'png' : null;
        case 'jpg':
        case 'jpeg':
            return str_starts_with($inicio, "\xFF\xD8\xFF") ? 'jpg' : null;
        case '3mf':
            return str_starts_with($inicio, "PK\x03\x04") ? '3mf' : null;
        case 'step':
        case 'stp':
            return str_contains($inicio, 'ISO-10303-21') ? 'step' : null;
        case 'stl':
            if (preg_match('/^\s*solid\s/i', $inicio)) {
                return 'stl';
            }
            if ($tam >= 84) {
                $n = unpack('V', substr($inicio, 80, 4))[1] ?? -1;
                if (84 + $n * 50 === $tam) {
                    return 'stl';
                }
            }
            return null;
    }
    return null;
}

/** Carpeta de adjuntos FUERA de la carpeta pública (por defecto, al lado de public_html). */
function dir_adjuntos(): string
{
    $base = config()['dir_adjuntos'] ?: dirname((string) ($_SERVER['DOCUMENT_ROOT'] ?? __DIR__ . '/..')) . '/piscobot-adjuntos';
    $base = rtrim($base, '/');
    $dir = $base . '/' . date('Y-m');
    if (!is_dir($dir)) {
        @mkdir($dir, 0750, true);
        @file_put_contents($base . '/.htaccess', "Require all denied\n");
    }
    return $dir;
}

/**
 * Lee, valida (extensión + contenido) y guarda los adjuntos renombrados fuera de la carpeta pública,
 * sin permisos de ejecución. Devuelve una lista con nombre original, ruta guardada, extensión y tamaño.
 */
function leer_adjuntos(): array
{
    $f = $_FILES['archivos'] ?? null;
    if (!$f || !is_array($f['name'])) {
        return [];
    }
    $validos = [];
    $total = 0;
    foreach ($f['name'] as $i => $nombre) {
        if (($f['error'][$i] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE || (int) $f['size'][$i] === 0) {
            continue;
        }
        $nombre = basename((string) $nombre);
        if ($f['error'][$i] !== UPLOAD_ERR_OK) {
            responder(422, false, 'Revisá los archivos.', ['archivos' => "\"$nombre\" no se pudo subir. Usá un link de descarga."]);
        }
        $ext = strtolower(pathinfo($nombre, PATHINFO_EXTENSION));
        if (!in_array($ext, EXTENSIONES, true)) {
            responder(422, false, 'Revisá los archivos.', ['archivos' => "\"$nombre\": formato no permitido (STL, STEP, 3MF, PDF, JPG o PNG)"]);
        }
        $total += (int) $f['size'][$i];
        if ($total > MAX_TOTAL) {
            responder(422, false, 'Revisá los archivos.', ['archivos' => 'Los archivos superan 50 MB en total. Usá un link de descarga.']);
        }
        $real = tipo_real($nombre, $f['tmp_name'][$i]);
        if ($real === null) {
            responder(422, false, 'Revisá los archivos.', ['archivos' => "\"$nombre\" no parece ser un archivo válido de ese tipo."]);
        }
        $validos[] = ['nombre' => $nombre, 'tmp' => $f['tmp_name'][$i], 'ext' => $real, 'tam' => (int) $f['size'][$i]];
    }
    if (count($validos) > MAX_ARCHIVOS) {
        responder(422, false, 'Revisá los archivos.', ['archivos' => 'Máximo ' . MAX_ARCHIVOS . ' archivos']);
    }
    $dir = $validos ? dir_adjuntos() : '';
    foreach ($validos as $k => $a) {
        $destino = $dir . '/' . date('Ymd-His') . '-' . bin2hex(random_bytes(6)) . '.' . $a['ext'];
        if (!@move_uploaded_file($a['tmp'], $destino)) {
            responder(502, false, 'No pudimos guardar los archivos. Probá de nuevo o usá un link de descarga.');
        }
        @chmod($destino, 0640);
        $validos[$k]['guardado'] = $destino;
    }
    return $validos;
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
