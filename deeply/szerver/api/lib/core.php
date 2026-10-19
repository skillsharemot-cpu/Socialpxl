<?php
/* Deeply API – alapok: beállítások, adatbázis (SQLite), válasz, kulcsok, korlátok. */

const DEEPLY_API_VERSION = 2;

function cfg(?string $k = null, $def = null) {
  static $c = null;
  if ($c === null) {
    $f = __DIR__ . '/../config.php';
    if (!is_file($f)) throw new RuntimeException('Hiányzik a config.php (másold le a config.sample.php-t config.php néven).');
    $c = require $f;
    if (!is_array($c)) throw new RuntimeException('Hibás config.php.');
    date_default_timezone_set($c['timezone'] ?? 'Europe/Budapest');
  }
  if ($k === null) return $c;
  return array_key_exists($k, $c) ? $c[$k] : $def;
}

function now_ms(): int { return (int) floor(microtime(true) * 1000); }

/* Adatkönyvtár: az adatbázis, a fotók és a mentések helye. */
function data_dir(string $sub = ''): string {
  $d = rtrim((string) cfg('data_dir', __DIR__ . '/../adat'), '/');
  $p = $sub === '' ? $d : $d . '/' . $sub;
  if (!is_dir($p)) {
    @mkdir($p, 0750, true);
    if (!is_dir($p)) throw new RuntimeException('Nem sikerült létrehozni az adatmappát: ' . $p);
  }
  // második védővonal, ha az adatmappa a webes gyökérben van
  if ($sub === '' && !is_file($p . '/.htaccess')) {
    @file_put_contents($p . '/.htaccess', "<IfModule mod_authz_core.c>\n  Require all denied\n</IfModule>\n<IfModule !mod_authz_core.c>\n  Order allow,deny\n  Deny from all\n</IfModule>\n");
    @file_put_contents($p . '/index.php', "<?php http_response_code(403);\n");
  }
  return $p;
}

/* Kitalálhatatlan fájlnév-darab: ha az adatmappa mégis elérhető lenne a webről, a fájlok neve akkor se tippelhető. */
function secret_tag(int $len = 12): string {
  return substr(hash('sha256', 'deeply|' . cfg('admin_key')), 0, $len);
}

function db_path(): string { return data_dir() . '/deeply_' . secret_tag() . '.sqlite'; }

function db(): PDO {
  static $pdo = null;
  if ($pdo) return $pdo;
  $pdo = new PDO('sqlite:' . db_path(), null, null, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  ]);
  $pdo->exec('PRAGMA journal_mode=WAL');
  $pdo->exec('PRAGMA busy_timeout=8000');
  $pdo->exec('PRAGMA foreign_keys=ON');
  db_migrate($pdo);
  return $pdo;
}

function db_migrate(PDO $pdo): void {
  $v = (int) $pdo->query('PRAGMA user_version')->fetchColumn();
  if ($v < 1) {
    $pdo->exec("
      CREATE TABLE IF NOT EXISTS bookings(
        id TEXT PRIMARY KEY,
        created INTEGER NOT NULL,          -- a foglalás ideje (a kalkulátor küldi, ms)
        received INTEGER NOT NULL,         -- a szerverre érkezés ideje (ms)
        lead_id TEXT,
        name TEXT, email TEXT, phone TEXT, zip TEXT, address TEXT,
        total INTEGER, first_date TEXT, src TEXT,
        priority INTEGER NOT NULL DEFAULT 3, prio_reasons TEXT,
        status TEXT NOT NULL DEFAULT 'uj', staff_note TEXT NOT NULL DEFAULT '',
        photos TEXT NOT NULL DEFAULT '[]', -- a fotók fájlnevei (JSON)
        data TEXT NOT NULL,                -- a teljes foglalás (JSON)
        notified INTEGER NOT NULL DEFAULT 0, confirmed INTEGER NOT NULL DEFAULT 0
      );
      CREATE UNIQUE INDEX IF NOT EXISTS bookings_created ON bookings(created, name);
      CREATE TABLE IF NOT EXISTS leads(
        lead_id TEXT PRIMARY KEY,
        created INTEGER NOT NULL, updated INTEGER NOT NULL,
        stage TEXT, name TEXT, email TEXT, phone TEXT, zip TEXT, address TEXT,
        total INTEGER, src TEXT,
        priority INTEGER NOT NULL DEFAULT 3, prio_reasons TEXT,
        status TEXT NOT NULL DEFAULT 'uj', staff_note TEXT NOT NULL DEFAULT '',
        booked INTEGER NOT NULL DEFAULT 0, alerted INTEGER NOT NULL DEFAULT 0,
        data TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS leads_updated ON leads(updated);
      CREATE TABLE IF NOT EXISTS kv(k TEXT PRIMARY KEY, v TEXT, updated INTEGER);
      CREATE TABLE IF NOT EXISTS backups(id INTEGER PRIMARY KEY AUTOINCREMENT, created INTEGER, name TEXT, data TEXT);
      CREATE TABLE IF NOT EXISTS log(id INTEGER PRIMARY KEY AUTOINCREMENT, t INTEGER, kind TEXT, msg TEXT);
      PRAGMA user_version = 1;
    ");
  }
}

function kv_get(string $k, $def = null) {
  $s = db()->prepare('SELECT v FROM kv WHERE k=?'); $s->execute([$k]);
  $v = $s->fetchColumn();
  return $v === false ? $def : json_decode($v, true);
}
function kv_set(string $k, $v): void {
  db()->prepare('INSERT INTO kv(k,v,updated) VALUES(?,?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v, updated=excluded.updated')
    ->execute([$k, json_encode($v, JSON_UNESCAPED_UNICODE), now_ms()]);
}
function kv_updated(string $k): ?int {
  $s = db()->prepare('SELECT updated FROM kv WHERE k=?'); $s->execute([$k]);
  $v = $s->fetchColumn(); return $v === false ? null : (int) $v;
}

function log_event(string $kind, string $msg): void {
  try {
    db()->prepare('INSERT INTO log(t,kind,msg) VALUES(?,?,?)')->execute([now_ms(), $kind, mb_substr($msg, 0, 2000)]);
    db()->exec('DELETE FROM log WHERE id < (SELECT MAX(id) - 500 FROM log)');
  } catch (Throwable $e) { /* naplózás nem állíthatja meg a kérést */ }
}

/* ── Válasz ─────────────────────────────────────────────────────────── */
function cors(): void {
  $allowed = (array) cfg('allowed_origins', ['*']);
  $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
  if (in_array('*', $allowed, true)) header('Access-Control-Allow-Origin: *');
  elseif ($origin && in_array($origin, $allowed, true)) { header('Access-Control-Allow-Origin: ' . $origin); header('Vary: Origin'); }
  header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
  header('Access-Control-Allow-Headers: Content-Type');
  header('Access-Control-Max-Age: 86400');
}

function out(array $o, int $code = 200): void {
  if (!headers_sent()) {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
  }
  echo json_encode($o, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}

final class ApiError extends Exception {
  public int $http;
  public function __construct(string $msg, int $http = 400) { parent::__construct($msg); $this->http = $http; }
}
function fail(string $msg, int $http = 400): void { throw new ApiError($msg, $http); }

/* ── Kulcsok és korlátok ────────────────────────────────────────────── */
function client_ip(): string { return (string) ($_SERVER['REMOTE_ADDR'] ?? '0'); }
function ip_tag(): string { return substr(hash('sha256', client_ip() . '|' . secret_tag()), 0, 16); }

/* Óránkénti számláló a kv-táblában. true = még belefér. */
function rate_ok(string $bucket, int $limit, bool $bump = true): bool {
  $hour = (int) floor(time() / 3600);
  $k = 'rl:' . $bucket . ':' . $hour;
  $n = (int) kv_get($k, 0);
  if ($n >= $limit) return false;
  if ($bump) kv_set($k, $n + 1);
  return true;
}

function need_write_key(array $req): void {
  if (!hash_equals((string) cfg('write_key'), (string) ($req['key'] ?? ''))) fail('Hibás kulcs.', 403);
}

function admin_key_ready(): bool {
  $k = (string) cfg('admin_key');
  return strlen($k) >= 24 && strpos($k, 'IDE_') !== 0;
}

function need_admin_key(array $req): void {
  if (!admin_key_ready()) fail('A szerveren még nincs beállítva az admin-kulcs (config.php).', 500);
  if (!rate_ok('adminfail:' . ip_tag(), 10, false)) fail('Túl sok hibás próbálkozás – próbáld újra egy óra múlva.', 429);
  if (!hash_equals((string) cfg('admin_key'), (string) ($req['key'] ?? ''))) {
    rate_ok('adminfail:' . ip_tag(), 10, true);
    fail('Hibás kulcs.', 403);
  }
}

/* ── Segédek ────────────────────────────────────────────────────────── */
function s($v, int $max = 500): string {   // biztonságos, rövidített szöveg
  $t = is_scalar($v) ? (string) $v : '';
  $t = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $t) ?? '';
  return mb_substr(trim($t), 0, $max);
}
function n($v): float { return is_numeric($v) ? (float) $v : 0.0; }
function huf($v): string { return number_format((float) $v, 0, ',', ' ') . ' Ft'; }
function h($v): string { return htmlspecialchars((string) $v, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }

function safe_id(string $v, int $max = 40): string { return substr(preg_replace('/[^A-Za-z0-9-]/', '', $v) ?? '', 0, $max); }

/* A fotók linkje: nem kell hozzá belépés, de a token nélkül nem tippelhető. */
function photo_token(string $file): string { return substr(hash_hmac('sha256', $file, (string) cfg('admin_key')), 0, 24); }
function photo_url(string $file): string {
  $base = rtrim((string) cfg('site_url', ''), '/');
  return $base . '/api/foto.php?f=' . rawurlencode($file) . '&t=' . photo_token($file);
}

function admin_url(): string { return rtrim((string) cfg('site_url', ''), '/') . (string) cfg('admin_path', '/admin/ugyek.html'); }
