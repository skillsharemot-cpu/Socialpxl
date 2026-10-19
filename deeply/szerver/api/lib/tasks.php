<?php
/* Deeply – időzített feladatok. Minden API-hívás után (a válasz elküldése után) lefut, legfeljebb percenként egyszer;
   a cron.php-val külön is futtatható. Feladatok:
     1) elakadt érdeklődők jelzése (5C) – csak akinek van telefonszáma, és csak az alert_hours idősávban
     2) a sikertelen értesítő / visszaigazoló levelek újrapróbálása
     3) napi adatbázis-mentés (pillanatkép)
     4) takarítás: régi, foglalás nélküli érdeklődők, lejárt számlálók, ideiglenes archívumok */

function in_alert_hours(?int $t = null): bool {
  [$from, $to] = array_map('intval', array_pad((array) cfg('alert_hours', [7, 21]), 2, 21));
  $h = (int) date('G', $t ?? time());
  return $from <= $to ? ($h >= $from && $h < $to) : ($h >= $from || $h < $to);
}

function run_due_tasks(bool $force = false): array {
  $done = ['ran' => false];
  if (!$force && (now_ms() - (int) kv_get('tasks:last', 0)) < 60000) return $done;
  $lock = @fopen(data_dir() . '/tasks.lock', 'c');
  if (!$lock || !flock($lock, LOCK_EX | LOCK_NB)) return $done;   // épp fut egy másik példány
  try {
    kv_set('tasks:last', now_ms());
    $done['ran'] = true;
    foreach (['leads' => 'task_lead_alerts', 'retries' => 'task_mail_retries', 'snapshot' => 'task_daily_snapshot', 'cleanup' => 'task_cleanup'] as $k => $fn) {
      try { $done[$k] = $fn(); }
      catch (Throwable $e) { $done[$k] = 'hiba: ' . $e->getMessage(); log_event('error', "Időzített feladat ($k): " . $e->getMessage()); }
    }
  } finally {
    flock($lock, LOCK_UN); fclose($lock);
  }
  return $done;
}

/* 1) Elakadt érdeklődő: megadta a telefonszámát, abandon_minutes óta csend, nem foglalt → egy levél nektek. */
function task_lead_alerts(): int {
  if (!in_alert_hours()) return 0;
  $now = now_ms();
  $quiet = max(5, (int) cfg('abandon_minutes', 30)) * 60000;
  $q = db()->prepare('SELECT * FROM leads WHERE booked=0 AND alerted=0 AND updated < ? AND updated > ? ORDER BY priority, updated LIMIT 10');
  $q->execute([$now - $quiet, $now - 3 * 86400000]);   // 3 napnál régebbiről már nem jelzünk
  $sent = 0;
  foreach ($q->fetchAll() as $row) {
    $d = json_decode($row['data'], true) ?: [];
    $digits = preg_replace('/\D/', '', (string) $row['phone']);
    if (strlen($digits) < 9) {   // telefonszám nélkül nem jelzünk (az Ügyek oldalon így is látszik)
      db()->prepare('UPDATE leads SET alerted=3 WHERE lead_id=?')->execute([$row['lead_id']]);
      continue;
    }
    // közben más eszközről / újrakezdve foglalt? (ugyanaz a telefonszám vagy e-mail az elmúlt 3 napban)
    $b = db()->prepare("SELECT 1 FROM bookings WHERE received > ? AND (REPLACE(REPLACE(REPLACE(phone,' ',''),'-',''),'+','') LIKE ? OR (email <> '' AND LOWER(email)=LOWER(?))) LIMIT 1");
    $b->execute([$now - 3 * 86400000, '%' . substr($digits, -9), (string) $row['email']]);
    if ($b->fetch()) { db()->prepare('UPDATE leads SET alerted=2, booked=1 WHERE lead_id=?')->execute([$row['lead_id']]); continue; }
    // a rangsort újraszámoljuk (a napok közeledtével sürgősebb lehet)
    [$level, $why] = priority_of($d, true);
    $row['priority'] = $level; $row['prio_reasons'] = json_encode($why, JSON_UNESCAPED_UNICODE);
    db()->prepare('UPDATE leads SET priority=?, prio_reasons=? WHERE lead_id=?')->execute([$level, $row['prio_reasons'], $row['lead_id']]);
    try {
      [$sub, $txt, $html] = mail_lead_alert($row, $d);
      mail_send((array) cfg('notify_to', []), $sub, $txt, $html, filter_var($row['email'], FILTER_VALIDATE_EMAIL) ? $row['email'] : null);
      db()->prepare('UPDATE leads SET alerted=1 WHERE lead_id=?')->execute([$row['lead_id']]);
      log_event('mail', 'Elakadt érdeklődő jelezve: ' . $row['lead_id']);
      $sent++;
    } catch (Throwable $e) {
      $k = 'fail:alert:' . $row['lead_id']; $n = (int) kv_get($k, 0) + 1; kv_set($k, $n);
      log_event('mailerror', "Érdeklődő-jelzés {$row['lead_id']} ($n. próba): " . $e->getMessage());
      if ($n >= 3) db()->prepare('UPDATE leads SET alerted=-1 WHERE lead_id=?')->execute([$row['lead_id']]);
      break;   // ha a levelezés áll, nem próbálkozunk tovább ebben a körben
    }
  }
  return $sent;
}

/* 2) Ha egy értesítő vagy visszaigazolás nem ment ki, újrapróbáljuk (a notify_booking maga számolja a próbákat). */
function task_mail_retries(): int {
  $q = db()->prepare('SELECT id FROM bookings WHERE (notified=0 OR confirmed=0) AND received < ? AND received > ? ORDER BY received LIMIT 5');
  $q->execute([now_ms() - 120000, now_ms() - 7 * 86400000]);
  $n = 0;
  foreach ($q->fetchAll(PDO::FETCH_COLUMN) as $id) { notify_booking($id); $n++; }
  return $n;
}

/* 3) Napi pillanatkép az adatbázisról (a mentesek mappába, a legutóbbi snapshot_keep darab marad). */
function task_daily_snapshot(): string {
  $list = snapshot_list();
  if ($list && (time() * 1000 - $list[0]['time']) < 23 * 3600 * 1000) return '';
  $has = (int) db()->query('SELECT (SELECT COUNT(*) FROM bookings) + (SELECT COUNT(*) FROM leads)')->fetchColumn();
  if (!$has && !$list) return '';   // üres adatbázisról nem készítünk mentést
  return snapshot_create()['file'];
}

/* 4) Takarítás (adatminimalizálás – GDPR). */
function task_cleanup(): array {
  $now = now_ms(); $db = db();
  $keep = max(7, (int) cfg('lead_keep_days', 60)) * 86400000;
  $q = $db->prepare('DELETE FROM leads WHERE booked=0 AND updated < ?'); $q->execute([$now - $keep]);
  $leads = $q->rowCount();
  $db->prepare("DELETE FROM kv WHERE k LIKE 'rl:%' AND updated < ?")->execute([$now - 2 * 86400000]);
  $db->prepare("DELETE FROM kv WHERE k LIKE 'fail:%' AND updated < ?")->execute([$now - 30 * 86400000]);
  foreach (glob(data_dir('mentesek') . '/fotok_*.{zip,tar}', GLOB_BRACE) ?: [] as $f) if (filemtime($f) < time() - 3600) @unlink($f);
  return ['leadsDeleted' => $leads];
}
