<?php
/* A foglalásokhoz feltöltött fotók megjelenítése. Belépés nem kell, de minden linkben
   egy titkos aláírás van (az admin-kulcsból képezve), így a fájlnevek nem tippelhetők. */
declare(strict_types=1);
require __DIR__ . '/lib/core.php';

$f = (string) ($_GET['f'] ?? '');
$t = (string) ($_GET['t'] ?? '');
try {
  if (!preg_match('/^FOG-[A-Za-z0-9_-]{1,80}\.(jpg|png|webp)$/', $f, $m) || !admin_key_ready() || !hash_equals(photo_token($f), $t)) throw new Exception('');
  $path = data_dir('fotok') . '/' . $f;
  if (!is_file($path)) throw new Exception('');
} catch (Throwable $e) {
  http_response_code(404); header('Content-Type: text/plain; charset=utf-8'); echo "Nincs ilyen fotó.\n"; exit;
}
$type = ['jpg' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp'][$m[1]];
header('Content-Type: ' . $type);
header('Content-Length: ' . filesize($path));
header('Cache-Control: private, max-age=86400');
header('X-Content-Type-Options: nosniff');
header('Content-Disposition: inline; filename="' . $f . '"');
header("Content-Security-Policy: default-src 'none'");
readfile($path);
