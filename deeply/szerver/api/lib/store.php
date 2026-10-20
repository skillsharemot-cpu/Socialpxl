<?php
/* Deeply – adatok: érdeklődők, foglalások, fotók, árlista, mentés/visszatöltés, adatbázis-pillanatképek. */

const STATUSES = ['uj' => 'Új', 'hivva' => 'Hívva', 'ajanlat' => 'Ajánlat elküldve', 'idopont' => 'Időpont egyeztetve',
  'kesz' => 'Kész', 'elutasitva' => 'Nem lett belőle munka'];

/* ═══════════ ÉRDEKLŐDŐ (gépelés közbeni mentés) ═══════════ */
function save_lead(array $d): array {
  if (empty($d['leadId']) || !is_array($d['customer'] ?? null)) fail('Hiányzó adat.');
  if (empty($d['consent']['at'])) fail('Nincs hozzájárulás – nem mentünk.');
  $id = safe_id((string) $d['leadId']);
  if ($id === '') fail('Hibás azonosító.');
  if (!rate_ok('lead', 1500) || !rate_ok('lead:' . ip_tag(), 300)) fail('Túl sok mentés – próbáld később.', 429);

  $c = $d['customer'];
  $clean = [
    'leadId' => $id, 'created' => (int) n($d['created'] ?? 0) ?: now_ms(), 'updated' => now_ms(),
    'src' => s($d['src'] ?? '', 40), 'stage' => s($d['stage'] ?? '', 30),
    'consent' => ['at' => (int) n($d['consent']['at']), 'v' => s($d['consent']['v'] ?? '', 20)],
    'customer' => ['name' => s($c['name'] ?? '', 120), 'email' => s($c['email'] ?? '', 160), 'phone' => s($c['phone'] ?? '', 40),
      'zip' => s($c['zip'] ?? '', 10), 'address' => s($c['address'] ?? '', 200), 'note' => s($c['note'] ?? '', 1000), 'timepref' => s($c['timepref'] ?? '', 30)],
    'property' => s($d['property'] ?? '', 120),
    'items' => array_slice(array_map(fn($x) => s($x, 300), array_filter((array) ($d['items'] ?? []), 'is_scalar')), 0, 30),
    'total' => (int) n($d['total'] ?? 0),
    'dates' => array_slice(array_values(array_filter((array) ($d['dates'] ?? []), fn($x) => is_string($x) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $x))), 0, 31),
    'photos' => (int) n($d['photos'] ?? 0), 'noPhoto' => !empty($d['noPhoto']), 'photoVia' => s($d['photoVia'] ?? '', 20),
    'interest' => s($d['interest'] ?? '', 800),
  ];
  [$level, $why] = priority_of($clean, true);
  $booked = $clean['stage'] === 'foglalt' ? 1 : 0;
  $db = db();
  $ex = $db->prepare('SELECT created, booked FROM leads WHERE lead_id=?'); $ex->execute([$id]); $old = $ex->fetch();
  $vals = [$clean['updated'], $clean['stage'], $clean['customer']['name'], $clean['customer']['email'], $clean['customer']['phone'],
    $clean['customer']['zip'], $clean['customer']['address'], $clean['total'], $clean['src'], $level, json_encode($why, JSON_UNESCAPED_UNICODE),
    json_encode($clean, JSON_UNESCAPED_UNICODE)];
  if ($old) {
    $db->prepare('UPDATE leads SET updated=?,stage=?,name=?,email=?,phone=?,zip=?,address=?,total=?,src=?,priority=?,prio_reasons=?,data=?,booked=MAX(booked,?) WHERE lead_id=?')
      ->execute(array_merge($vals, [$booked, $id]));
  } else {
    $db->prepare('INSERT INTO leads(updated,stage,name,email,phone,zip,address,total,src,priority,prio_reasons,data,booked,lead_id,created) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
      ->execute(array_merge($vals, [$booked, $id, $clean['created']]));
  }
  return ['ok' => true, 'id' => $id];
}

/* ═══════════ FOGLALÁS ═══════════ */
function save_photo_dataurl(string $dataUrl, string $base): ?string {
  if (!preg_match('#^data:image/(jpeg|jpg|png|webp);base64,([A-Za-z0-9+/=\r\n]+)$#', $dataUrl, $m)) return null;
  $bin = base64_decode($m[2], true);
  if ($bin === false || strlen($bin) > 6 * 1024 * 1024 || strlen($bin) < 100) return null;
  $info = @getimagesizefromstring($bin);
  if (!$info || !in_array($info[2], [IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_WEBP], true)) return null;
  $ext = [IMAGETYPE_JPEG => 'jpg', IMAGETYPE_PNG => 'png', IMAGETYPE_WEBP => 'webp'][$info[2]];
  $file = $base . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
  if (file_put_contents(data_dir('fotok') . '/' . $file, $bin, LOCK_EX) === false) return null;
  return $file;
}

function save_booking(array $b, array &$after): array {
  $c = is_array($b['customer'] ?? null) ? $b['customer'] : fail('Hiányzó foglalási adat.');
  $name = s($c['name'] ?? '', 120);
  if ($name === '' || (s($c['phone'] ?? '') === '' && s($c['email'] ?? '') === '')) fail('Hiányzik a név vagy az elérhetőség.');
  if (!rate_ok('booking', 40) || !rate_ok('booking:' . ip_tag(), 12)) fail('Túl sok beküldés – próbáld később.', 429);
  $created = (int) n($b['created'] ?? 0) ?: now_ms();
  $db = db();
  // ugyanaz a foglalás kétszer (pl. újraküldés) → a meglévőt adjuk vissza
  $dup = $db->prepare('SELECT id, photos FROM bookings WHERE created=? AND name=?'); $dup->execute([$created, $name]);
  if ($row = $dup->fetch()) return ['ok' => true, 'id' => $row['id'], 'photos' => count(json_decode($row['photos'], true) ?: []), 'duplicate' => true];

  $id = 'FOG-' . date('Ymd-His', (int) floor($created / 1000)) . '-' . bin2hex(random_bytes(2));
  $files = [];
  foreach (array_slice((array) ($b['photos'] ?? []), 0, 10) as $i => $p) {
    if (is_string($p) && ($f = save_photo_dataurl($p, $id . '_foto' . ($i + 1)))) $files[] = $f;
  }
  $slim = $b; $slim['photos'] = $files; $slim['id'] = $id;
  $slim['customer'] = ['name' => $name, 'email' => s($c['email'] ?? '', 160), 'phone' => s($c['phone'] ?? '', 40), 'zip' => s($c['zip'] ?? '', 10),
    'address' => s($c['address'] ?? '', 200), 'note' => s($c['note'] ?? '', 1000), 'timepref' => s($c['timepref'] ?? '', 30)];
  $json = json_encode($slim, JSON_UNESCAPED_UNICODE);
  if ($json === false || strlen($json) > 400000) fail('Túl nagy foglalási adat.');
  [$level, $why] = priority_of($slim, false);
  $dates = array_values(array_filter((array) ($b['dates'] ?? []), 'is_string')); sort($dates);
  $db->prepare('INSERT INTO bookings(id,created,received,lead_id,name,email,phone,zip,address,total,first_date,src,priority,prio_reasons,photos,data) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
    ->execute([$id, $created, now_ms(), safe_id((string) ($b['leadId'] ?? '')) ?: null, $name, $slim['customer']['email'], $slim['customer']['phone'],
      $slim['customer']['zip'], $slim['customer']['address'], (int) n($b['total'] ?? 0), $dates[0] ?? null, s($b['src'] ?? '', 40),
      $level, json_encode($why, JSON_UNESCAPED_UNICODE), json_encode($files), $json]);
  if (!empty($b['leadId'])) $db->prepare("UPDATE leads SET booked=1, stage='foglalt', updated=? WHERE lead_id=?")->execute([now_ms(), safe_id((string) $b['leadId'])]);

  $after[] = fn() => notify_booking($id);   // a levelek a válasz után mennek ki
  return ['ok' => true, 'id' => $id, 'photos' => count($files)];
}

function booking_row(string $id): ?array {
  $s = db()->prepare('SELECT * FROM bookings WHERE id=?'); $s->execute([$id]);
  return $s->fetch() ?: null;
}

/* Az értesítő (nektek) és a visszaigazolás (a vevőnek). Ha nem sikerül, a cron újrapróbálja (max. 3×). */
function notify_booking(string $id): void {
  $row = booking_row($id); if (!$row) return;
  $b = json_decode($row['data'], true) ?: [];
  if ((int) $row['notified'] === 0) {
    try {
      [$sub, $txt, $html] = mail_booking_notice($row, $b);
      mail_send((array) cfg('notify_to', []), $sub, $txt, $html, s($b['customer']['email'] ?? '', 160) ?: null);
      db()->prepare('UPDATE bookings SET notified=1 WHERE id=?')->execute([$id]);
      log_event('mail', 'Értesítő elküldve: ' . $id);
    } catch (Throwable $e) { retry_or_give_up('notified', $id, $e); }
  }
  $email = s($b['customer']['email'] ?? '', 160);
  if ((int) $row['confirmed'] === 0) {
    if (!cfg('customer_confirmation', true) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
      db()->prepare('UPDATE bookings SET confirmed=-2 WHERE id=?')->execute([$id]);   // nincs mit küldeni
    } else {
      try {
        [$sub, $txt, $html] = mail_customer_confirmation($row, $b);
        mail_send([$email], $sub, $txt, $html, (string) cfg('reply_to', cfg('mail_from')));
        db()->prepare('UPDATE bookings SET confirmed=1 WHERE id=?')->execute([$id]);
        log_event('mail', 'Visszaigazolás elküldve: ' . $id);
      } catch (Throwable $e) { retry_or_give_up('confirmed', $id, $e); }
    }
  }
}
function retry_or_give_up(string $col, string $id, Throwable $e): void {
  $k = 'fail:' . $col . ':' . $id; $n = (int) kv_get($k, 0) + 1; kv_set($k, $n);
  log_event('mailerror', "$col $id ($n. próba): " . $e->getMessage());
  if ($n >= 3) db()->prepare("UPDATE bookings SET $col=-1 WHERE id=?")->execute([$id]);
}

function booking_public(array $row): array {   // a régi admin „Foglalások letöltése” formátuma
  $b = json_decode($row['data'], true) ?: [];
  $b['id'] = $row['id'];
  $b['photos'] = array_map('photo_url', json_decode($row['photos'], true) ?: []);
  $b['status'] = $row['status']; $b['priority'] = (int) $row['priority'];
  return $b;
}
function list_bookings($since): array {
  $s = db()->prepare('SELECT * FROM bookings WHERE created > ? ORDER BY created');
  $s->execute([(int) n($since)]);
  return ['ok' => true, 'bookings' => array_map('booking_public', $s->fetchAll())];
}

/* ═══════════ ÜGYEK OLDAL ═══════════ */
function inbox(array $req): array {
  $days = max(1, min(3650, (int) n($req['days'] ?? 120)));
  $from = now_ms() - $days * 86400000;
  $bs = db()->prepare('SELECT * FROM bookings WHERE received >= ? ORDER BY received DESC'); $bs->execute([$from]);
  $bookings = array_map(function ($r) {
    $d = json_decode($r['data'], true) ?: [];
    return ['type' => 'booking', 'id' => $r['id'], 'created' => (int) $r['created'], 'received' => (int) $r['received'],
      'name' => $r['name'], 'email' => $r['email'], 'phone' => $r['phone'], 'zip' => $r['zip'], 'address' => $r['address'],
      'total' => (int) $r['total'], 'firstDate' => $r['first_date'], 'src' => $r['src'], 'priority' => (int) $r['priority'],
      'reasons' => json_decode((string) $r['prio_reasons'], true) ?: [], 'status' => $r['status'], 'note' => $r['staff_note'],
      'notified' => (int) $r['notified'], 'confirmed' => (int) $r['confirmed'],
      'photos' => array_map('photo_url', json_decode($r['photos'], true) ?: []), 'data' => $d];
  }, $bs->fetchAll());
  $ls = db()->prepare('SELECT * FROM leads WHERE updated >= ? AND booked=0 ORDER BY updated DESC'); $ls->execute([$from]);
  $leads = array_map(function ($r) {
    return ['type' => 'lead', 'id' => $r['lead_id'], 'created' => (int) $r['created'], 'updated' => (int) $r['updated'],
      'stage' => $r['stage'], 'name' => $r['name'], 'email' => $r['email'], 'phone' => $r['phone'], 'total' => (int) $r['total'],
      'priority' => (int) $r['priority'], 'reasons' => json_decode((string) $r['prio_reasons'], true) ?: [], 'status' => $r['status'],
      'note' => $r['staff_note'], 'alerted' => (int) $r['alerted'], 'data' => json_decode($r['data'], true) ?: []];
  }, $ls->fetchAll());
  $errors = db()->query("SELECT t, kind, msg FROM log WHERE kind IN ('mailerror','error') ORDER BY id DESC LIMIT 10")->fetchAll();
  return ['ok' => true, 'bookings' => $bookings, 'leads' => $leads, 'statuses' => STATUSES, 'errors' => $errors,
    'pricingUpdated' => kv_updated('pricing'), 'snapshots' => snapshot_list(), 'now' => now_ms(),
    'mailReady' => !empty(cfg('smtp')['host']) || function_exists('mail'), 'notifyTo' => (array) cfg('notify_to', [])];
}

function set_status(array $req): array {
  $type = $req['type'] ?? ''; $id = s($req['id'] ?? '', 60);
  $st = (string) ($req['status'] ?? '');
  if (!isset(STATUSES[$st])) fail('Ismeretlen állapot.');
  $note = s($req['note'] ?? '', 2000);
  if ($type === 'booking') $q = db()->prepare('UPDATE bookings SET status=?, staff_note=? WHERE id=?');
  elseif ($type === 'lead') $q = db()->prepare('UPDATE leads SET status=?, staff_note=? WHERE lead_id=?');
  else fail('Ismeretlen típus.');
  $q->execute([$st, $note, $id]);
  return ['ok' => true, 'changed' => $q->rowCount()];
}

function delete_item(array $req): array {   // végleges törlés (pl. az ügyfél kérésére – GDPR)
  $type = $req['type'] ?? ''; $id = s($req['id'] ?? '', 60);
  if ($type === 'booking') {
    $row = booking_row($id);
    if ($row) foreach (json_decode($row['photos'], true) ?: [] as $f) @unlink(data_dir('fotok') . '/' . basename($f));
    db()->prepare('DELETE FROM bookings WHERE id=?')->execute([$id]);
    if ($row && $row['lead_id']) db()->prepare('DELETE FROM leads WHERE lead_id=?')->execute([$row['lead_id']]);
  } elseif ($type === 'lead') db()->prepare('DELETE FROM leads WHERE lead_id=?')->execute([$id]);
  else fail('Ismeretlen típus.');
  log_event('delete', "$type $id törölve");
  return ['ok' => true];
}

/* ═══════════ ÁRLISTA (a kalkulátor innen tölti, az Ügyek oldalról tehető közzé) ═══════════ */
function pricing_public(): array {
  return ['ok' => true, 'pricing' => kv_get('pricing'), 'updated' => kv_updated('pricing'),
    'contact' => ['business' => (string) cfg('business', 'Deeply'), 'phone' => (string) cfg('phone', ''), 'whatsapp' => (string) cfg('whatsapp', ''),
      'email' => (string) cfg('public_email', '')]];
}
function pricing_save($p): array {
  if (!is_array($p) || !is_array($p['services'] ?? null) || !$p['services']) fail('Hibás árlista (hiányoznak a szolgáltatások).');
  $num = fn($v) => is_numeric($v) ? 0 + $v : 0;
  $clean = ['cfgVersion' => (int) n($p['cfgVersion'] ?? 2), 'settings' => [], 'services' => [], 'materials' => [], 'stains' => [], 'addons' => []];
  $st = (array) ($p['settings'] ?? []);
  foreach (['businessName' => 60, 'currency' => 8, 'notifyEmail' => 160] as $k => $max) if (isset($st[$k])) $clean['settings'][$k] = s($st[$k], $max);
  foreach (['minFee', 'travelFee', 'deposit'] as $k) if (isset($st[$k])) $clean['settings'][$k] = $num($st[$k]);
  foreach (array_slice($p['services'], 0, 80) as $x) if (is_array($x) && s($x['id'] ?? '') !== '')
    $clean['services'][] = ['id' => safe_id(s($x['id']), 40), 'name' => s($x['name'] ?? '', 120), 'unit' => s($x['unit'] ?? 'db', 20), 'price' => $num($x['price'] ?? 0), 'material' => !empty($x['material'])];
  foreach (array_slice((array) ($p['materials'] ?? []), 0, 40) as $x) if (is_array($x))
    $clean['materials'][] = ['id' => safe_id(s($x['id'] ?? ''), 40), 'name' => s($x['name'] ?? '', 120), 'mult' => $num($x['mult'] ?? 1) ?: 1, 'risk' => s($x['risk'] ?? '', 200)];
  foreach (array_slice((array) ($p['stains'] ?? []), 0, 40) as $x) if (is_array($x))
    $clean['stains'][] = ['id' => safe_id(s($x['id'] ?? ''), 40), 'name' => s($x['name'] ?? '', 160), 'price' => $num($x['price'] ?? 0)];
  foreach (array_slice((array) ($p['addons'] ?? []), 0, 40) as $x) if (is_array($x))
    $clean['addons'][] = ['id' => safe_id(s($x['id'] ?? ''), 40), 'name' => s($x['name'] ?? '', 120), 'type' => ($x['type'] ?? '') === 'pct' ? 'pct' : 'fix', 'value' => $num($x['value'] ?? 0)];
  // a vegyszerek és gépek (beszerzési adatok) szándékosan NEM kerülnek a nyilvános árlistába
  kv_set('pricing', $clean);
  log_event('pricing', 'Árlista közzétéve (' . count($clean['services']) . ' szolgáltatás)');
  return ['ok' => true, 'updated' => kv_updated('pricing')];
}

/* ═══════════ RÉGI ADMIN: TELJES MENTÉS A SZERVERRE / VISSZA ═══════════ */
function backup_save($data): array {
  if (!is_array($data)) fail('Üres mentés.');
  $json = json_encode($data, JSON_UNESCAPED_UNICODE);
  if (strlen($json) > 12 * 1024 * 1024) fail('Túl nagy mentés.');
  $name = 'deeply_adatok_' . date('Y-m-d_Hi') . '.json';
  db()->prepare('INSERT INTO backups(created,name,data) VALUES(?,?,?)')->execute([now_ms(), $name, $json]);
  $keep = max(3, (int) cfg('backup_keep', 30));
  db()->exec("DELETE FROM backups WHERE id NOT IN (SELECT id FROM backups ORDER BY id DESC LIMIT $keep)");
  return ['ok' => true, 'file' => $name];
}
function backup_latest(): array {
  $r = db()->query('SELECT * FROM backups ORDER BY id DESC LIMIT 1')->fetch();
  if (!$r) fail('Még nincs mentés a szerveren.');
  return ['ok' => true, 'file' => $r['name'], 'created' => (int) $r['created'], 'data' => json_decode($r['data'], true)];
}

/* ═══════════ TELJES EXPORT / IMPORT (az Ügyek oldal „Mentés” fülén) ═══════════ */
function export_all(): array {
  $b = array_map(function ($r) { $r['data'] = json_decode($r['data'], true); $r['photos'] = json_decode($r['photos'], true); return $r; },
    db()->query('SELECT * FROM bookings ORDER BY created')->fetchAll());
  $l = array_map(function ($r) { $r['data'] = json_decode($r['data'], true); return $r; }, db()->query('SELECT * FROM leads ORDER BY created')->fetchAll());
  return ['format' => 'deeply-server-backup', 'version' => 1, 'exportedAt' => date('c'),
    'note' => 'A fotók nincsenek benne – azokat a „Fotók letöltése” gomb menti külön.',
    'data' => ['bookings' => $b, 'leads' => $l, 'pricing' => kv_get('pricing')]];
}

function import_all($p): array {
  if (!is_array($p) || !is_array($p['data'] ?? null)) fail('Ez nem Deeply-mentés.');
  $d = $p['data']; $db = db(); $add = ['bookings' => 0, 'leads' => 0, 'pricing' => false];
  $db->beginTransaction();
  try {
    if (($p['format'] ?? '') === 'deeply-server-backup') {
      $cols = ['id', 'created', 'received', 'lead_id', 'name', 'email', 'phone', 'zip', 'address', 'total', 'first_date', 'src', 'priority', 'prio_reasons', 'status', 'staff_note', 'photos', 'data', 'notified', 'confirmed'];
      foreach ((array) ($d['bookings'] ?? []) as $r) {
        if (!is_array($r) || empty($r['id'])) continue;
        $e = $db->prepare('SELECT 1 FROM bookings WHERE id=? OR (created=? AND name=?)'); $e->execute([$r['id'], $r['created'] ?? 0, $r['name'] ?? '']);
        if ($e->fetch()) continue;
        $r['data'] = json_encode($r['data'] ?? [], JSON_UNESCAPED_UNICODE); $r['photos'] = json_encode($r['photos'] ?? []);
        $r['notified'] = 1; $r['confirmed'] = max(1, (int) ($r['confirmed'] ?? 1));   // visszatöltéskor nem küldünk újra levelet
        $db->prepare('INSERT INTO bookings(' . implode(',', $cols) . ') VALUES(' . implode(',', array_fill(0, count($cols), '?')) . ')')
          ->execute(array_map(fn($c) => $r[$c] ?? ($c === 'status' ? 'uj' : ($c === 'staff_note' ? '' : null)), $cols));
        $add['bookings']++;
      }
      foreach ((array) ($d['leads'] ?? []) as $r) {
        if (!is_array($r) || empty($r['lead_id'])) continue;
        $e = $db->prepare('SELECT updated FROM leads WHERE lead_id=?'); $e->execute([$r['lead_id']]); $old = $e->fetchColumn();
        if ($old !== false && (int) $old >= (int) ($r['updated'] ?? 0)) continue;
        if ($old !== false) $db->prepare('DELETE FROM leads WHERE lead_id=?')->execute([$r['lead_id']]);
        $lc = ['lead_id', 'created', 'updated', 'stage', 'name', 'email', 'phone', 'zip', 'address', 'total', 'src', 'priority', 'prio_reasons', 'status', 'staff_note', 'booked', 'alerted', 'data'];
        $r['data'] = json_encode($r['data'] ?? [], JSON_UNESCAPED_UNICODE); $r['alerted'] = 1;
        $db->prepare('INSERT INTO leads(' . implode(',', $lc) . ') VALUES(' . implode(',', array_fill(0, count($lc), '?')) . ')')
          ->execute(array_map(fn($c) => $r[$c] ?? ($c === 'status' ? 'uj' : ($c === 'staff_note' ? '' : 0)), $lc));
        $add['leads']++;
      }
    } elseif (($p['format'] ?? '') === 'deeply-backup') {   // a régi admin „Teljes mentés” fájlja
      foreach ((array) ($d['bookings'] ?? []) as $b) {
        if (!is_array($b) || !is_array($b['customer'] ?? null)) continue;
        $created = (int) n($b['created'] ?? 0); $name = s($b['customer']['name'] ?? '', 120);
        $e = $db->prepare('SELECT 1 FROM bookings WHERE created=? AND name=?'); $e->execute([$created, $name]);
        if ($e->fetch() || !$created) continue;
        $id = s($b['id'] ?? '', 40) ?: 'FOG-' . date('Ymd-His', (int) floor($created / 1000)) . '-' . bin2hex(random_bytes(2));
        $b['photos'] = array_values(array_filter((array) ($b['photos'] ?? []), fn($x) => is_string($x) && str_starts_with($x, 'http')));
        $b['id'] = $id;
        [$level, $why] = priority_of($b, false);
        $dates = array_values(array_filter((array) ($b['dates'] ?? []), 'is_string')); sort($dates);
        $db->prepare('INSERT INTO bookings(id,created,received,name,email,phone,zip,address,total,first_date,src,priority,prio_reasons,photos,data,notified,confirmed) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,1)')
          ->execute([$id, $created, $created, $name, s($b['customer']['email'] ?? '', 160), s($b['customer']['phone'] ?? '', 40), s($b['customer']['zip'] ?? '', 10),
            s($b['customer']['address'] ?? '', 200), (int) n($b['total'] ?? 0), $dates[0] ?? null, s($b['src'] ?? '', 40), $level,
            json_encode($why, JSON_UNESCAPED_UNICODE), '[]', json_encode($b, JSON_UNESCAPED_UNICODE)]);
        $add['bookings']++;
      }
    } else fail('Ismeretlen mentésformátum.');
    $db->commit();
  } catch (Throwable $e) { $db->rollBack(); throw $e; }
  if (is_array($d['pricing'] ?? null) && !kv_get('pricing') && !empty($d['pricing']['services'])) { pricing_save($d['pricing']); $add['pricing'] = true; }
  log_event('import', json_encode($add));
  return ['ok' => true, 'added' => $add];
}

/* ═══════════ ADATBÁZIS-PILLANATKÉPEK (napi automatikus + kézi) ═══════════ */
function snapshot_create(): array {
  $name = 'deeply_' . date('Y-m-d_Hi') . '_' . secret_tag(8) . '.sqlite';
  $path = data_dir('mentesek') . '/' . $name;
  if (is_file($path)) @unlink($path);
  db()->exec("VACUUM INTO " . db()->quote($path));
  $keep = max(3, (int) cfg('snapshot_keep', 30));
  $all = snapshot_list();
  foreach (array_slice($all, $keep) as $s) @unlink(data_dir('mentesek') . '/' . $s['name']);
  log_event('snapshot', $name);
  return ['ok' => true, 'file' => $name];
}
function snapshot_list(): array {
  $out = [];
  foreach (glob(data_dir('mentesek') . '/deeply_*.sqlite') ?: [] as $f) $out[] = ['name' => basename($f), 'size' => filesize($f), 'time' => filemtime($f) * 1000];
  usort($out, fn($a, $b) => $b['time'] <=> $a['time'] ?: strcmp($b['name'], $a['name']));
  return $out;
}
function snapshot_path(string $name): string {
  if (!preg_match('/^deeply_[0-9_-]+_[0-9a-f]{8}\.sqlite$/', $name)) fail('Hibás fájlnév.');
  $p = data_dir('mentesek') . '/' . $name;
  if (!is_file($p)) fail('Nincs ilyen mentés.', 404);
  return $p;
}

/* A fotók egy archívumban (zip, ha a tárhelyen elérhető; különben tar). */
function photos_archive(): array {
  $dir = data_dir('fotok'); $files = glob($dir . '/*.{jpg,png,webp}', GLOB_BRACE) ?: [];
  $tmp = data_dir('mentesek') . '/fotok_' . date('Y-m-d_Hi') . '_' . secret_tag(8);
  if (class_exists('ZipArchive')) {
    $z = new ZipArchive(); $path = $tmp . '.zip';
    if ($z->open($path, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) fail('Nem sikerült a zip-fájl.', 500);
    foreach ($files as $f) $z->addFile($f, basename($f));
    if (!$files) $z->addFromString('ures.txt', 'Még nincs feltöltött fotó.');
    $z->close();
    return [$path, 'application/zip', 'deeply_fotok_' . date('Y-m-d') . '.zip'];
  }
  $path = $tmp . '.tar'; @unlink($path);
  $t = new PharData($path);
  foreach ($files as $f) $t->addFile($f, basename($f));
  if (!$files) $t->addFromString('ures.txt', 'Még nincs feltöltött fotó.');
  return [$path, 'application/x-tar', 'deeply_fotok_' . date('Y-m-d') . '.tar'];
}
