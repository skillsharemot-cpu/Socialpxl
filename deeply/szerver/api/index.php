<?php
/* ════════════════════════════════════════════════════════════════════════
   DEEPLY – saját szerver (API). Helye a tárhelyen: public_html/api/index.php
   A kalkulátor és az Ügyek oldal ide küld mindent: érdeklődők, foglalások,
   fotók, árlista, mentések. A protokoll ugyanaz, mint a régi Apps Scripté
   (POST, text/plain JSON: {action, key, …}), így a régi admin is használhatja.
   ════════════════════════════════════════════════════════════════════════ */
declare(strict_types=1);

require __DIR__ . '/lib/core.php';
require __DIR__ . '/lib/priority.php';
require __DIR__ . '/lib/mail.php';
require __DIR__ . '/lib/store.php';
require __DIR__ . '/lib/tasks.php';
require __DIR__ . '/lib/minta.php';

const MAX_BODY = 15 * 1024 * 1024;

ignore_user_abort(true);
@set_time_limit(120);
ob_start();
$after = [];       // a válasz után futó feladatok (pl. levelek)
$public = true;    // nyilvános hívásnál nem mutatjuk a belső hibák részleteit
$action = '';

try {
  cors();
  $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
  if ($method === 'OPTIONS') { http_response_code(204); ob_end_flush(); exit; }

  if ($method === 'GET') {
    $action = (string) ($_GET['action'] ?? '');
    if ($action === 'pricing') { out(pricing_public()); header('Cache-Control: public, max-age=60'); }
    else out(['ok' => true, 'service' => 'deeply-backend', 'info' => 'Működik. Az adatok csak POST-tal, kulccsal érhetők el.']);
  } elseif ($method !== 'POST') {
    fail('Nem támogatott kérés.', 405);
  } else {
    if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > MAX_BODY) fail('Túl nagy adat.', 413);
    $raw = file_get_contents('php://input', false, null, 0, MAX_BODY + 1);
    if ($raw === false || strlen($raw) > MAX_BODY) fail('Túl nagy adat.', 413);
    $req = json_decode($raw ?: '{}', true);
    if (!is_array($req)) fail('Hibás kérés (nem JSON).');
    $action = (string) ($req['action'] ?? '');
    $admin = !in_array($action, ['ping', 'pricing', 'lead', 'booking'], true);
    if ($admin) { need_admin_key($req); $public = false; }

    switch ($action) {
      /* ── nyilvános ── */
      case 'ping':    db(); out(['ok' => true, 'service' => 'deeply-backend', 'version' => DEEPLY_API_VERSION, 'server' => 'php']); break;
      case 'pricing': out(pricing_public()); break;
      case 'lead':    need_write_key($req); out(save_lead((array) ($req['data'] ?? []))); break;
      case 'booking': need_write_key($req); out(save_booking((array) ($req['data'] ?? []), $after)); break;

      /* ── a régi admin (Apps Script-kompatibilis) ── */
      case 'list':    out(list_bookings($req['since'] ?? 0)); break;
      case 'backup':  out(backup_save($req['data'] ?? null)); break;
      case 'restore': out(backup_latest()); break;

      /* ── Ügyek oldal ── */
      case 'inbox':        out(inbox($req)); break;
      case 'status':       out(set_status($req)); break;
      case 'delete':       out(delete_item($req)); break;
      case 'pricing_save': out(pricing_save($req['pricing'] ?? null)); break;
      case 'export':       out(['ok' => true, 'file' => 'deeply_mentes_' . date('Y-m-d_Hi') . '.json', 'backup' => export_all()]); break;
      case 'import':       out(import_all($req['data'] ?? null)); break;
      case 'snapshot':     out(snapshot_create() + ['snapshots' => snapshot_list()]); break;
      case 'snapshot_download':
        send_file(snapshot_path((string) ($req['name'] ?? '')), 'application/vnd.sqlite3', (string) $req['name'], false); break;
      case 'photos_archive':
        [$path, $type, $name] = photos_archive(); send_file($path, $type, $name, true); break;
      case 'tasks':        out(['ok' => true, 'tasks' => run_due_tasks(true)]); break;
      case 'mailpreview':  out(['ok' => true, 'mails' => mail_previews()]); break;
      case 'mailtest':
        $to = (array) cfg('notify_to', []);
        $m = mail_previews()['booking'];
        mail_send($to, '[PRÓBA] ' . $m['subject'], "Ez egy próbalevél a Deeply szerverről.\n\n" . $m['text'], $m['html']);
        log_event('mail', 'Próbalevél elküldve: ' . implode(', ', $to));
        out(['ok' => true, 'sentTo' => $to]); break;
      case 'log':
        out(['ok' => true, 'log' => db()->query('SELECT t, kind, msg FROM log ORDER BY id DESC LIMIT 100')->fetchAll()]); break;
      default:
        fail('Ismeretlen művelet: ' . s($action, 40));
    }
  }
} catch (ApiError $e) {
  out(['ok' => false, 'error' => $e->getMessage()], $e->http);
} catch (Throwable $e) {
  error_log('Deeply API (' . $action . '): ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine());
  try { log_event('error', $action . ': ' . $e->getMessage()); } catch (Throwable $e2) {}
  $setup = $e instanceof RuntimeException && str_contains($e->getMessage(), 'config.php');
  out(['ok' => false, 'error' => ($public && !$setup) ? 'Szerverhiba – kérlek, próbáld újra később.' : $e->getMessage()], 500);
}

/* ── A válasz elküldése, utána a háttérmunka (levelek, időzített feladatok) ── */
finish_response();
try {
  foreach ($after as $fn) $fn();
  if (is_file(__DIR__ . '/config.php')) run_due_tasks();
} catch (Throwable $e) {
  error_log('Deeply háttérfeladat: ' . $e->getMessage());
  try { log_event('error', 'háttér: ' . $e->getMessage()); } catch (Throwable $e2) {}
}

function finish_response(): void {
  if (!headers_sent()) { header('Content-Length: ' . (int) ob_get_length()); header('Connection: close'); }
  while (ob_get_level() > 0) ob_end_flush();
  flush();
  if (function_exists('fastcgi_finish_request')) fastcgi_finish_request();
  elseif (function_exists('litespeed_finish_request')) litespeed_finish_request();
}

/* Fájl letöltése (mentés, fotók). A válasz után nem fut háttérmunka a fájl mellett. */
function send_file(string $path, string $type, string $name, bool $deleteAfter): void {
  while (ob_get_level() > 0) ob_end_clean();
  header('Content-Type: ' . $type);
  header('Content-Disposition: attachment; filename="' . preg_replace('/[^A-Za-z0-9._-]/', '_', $name) . '"');
  header('Content-Length: ' . filesize($path));
  header('Cache-Control: no-store');
  header('X-Content-Type-Options: nosniff');
  readfile($path);
  if ($deleteAfter) @unlink($path);
  exit;
}
