<?php
/* Deeply – rangsor (5A). Minden foglalás és érdeklődő kap egy szintet és indoklást:
     1 = SÜRGŐS  – még ma hívd (közeli időpont, nagy vagy céges munka, elakadt érdeklődő telefonszámmal…)
     2 = FONTOS  – aznap intézd
     3 = NORMÁL  – ráér a szokásos sorrendben
   Pontozás: minden ok ad néhány pontot; 4+ pont = sürgős, 2–3 = fontos, 0–1 = normál.
   (A 2 napon belüli időpont egymagában sürgős – azt még aznap vissza kell igazolni.)
   A küszöbök a config.php-ban (urgent_total, big_total) állíthatók. */

const PRIO_LABEL = [1 => 'SÜRGŐS', 2 => 'FONTOS', 3 => 'NORMÁL'];
const PRIO_DOT   = [1 => '🔴', 2 => '🟠', 3 => '🟢'];

function days_until(string $isoDate): ?int {
  if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $isoDate)) return null;
  $today = new DateTimeImmutable('today');
  $d = DateTimeImmutable::createFromFormat('!Y-m-d', $isoDate);
  if (!$d) return null;
  return (int) $today->diff($d)->format('%r%a');
}

function day_words(int $d): string {
  if ($d <= 0) return 'ma';
  if ($d === 1) return 'holnap';
  if ($d === 2) return 'holnapután';
  return $d . ' nap múlva';
}

/* $x: a foglalás vagy az érdeklődő adatai (a kalkulátor formátumában). */
function priority_of(array $x, bool $isLead = false): array {
  $pts = 0; $why = [];
  $dates = array_values(array_filter((array) ($x['dates'] ?? []), 'is_string'));
  sort($dates);
  if ($dates) {
    $d = days_until($dates[0]);
    if ($d !== null && $d <= 2) { $pts += 4; $why[] = 'legkorábbi nap: ' . day_words($d); }
    elseif ($d !== null && $d <= 7) { $pts += 1; $why[] = 'legkorábbi nap: ' . day_words($d); }
  }
  $total = (int) n($x['total'] ?? 0);
  if ($total >= (int) cfg('urgent_total', 50000)) { $pts += 2; $why[] = 'nagy megrendelés (' . huf($total) . ')'; }
  elseif ($total >= (int) cfg('big_total', 25000)) { $pts += 1; $why[] = 'közepes megrendelés (' . huf($total) . ')'; }

  $items = $x['items'] ?? [];
  $itemText = is_array($items) ? implode(' ', array_map(fn($i) => is_array($i) ? (string) ($i['label'] ?? '') : (string) $i, $items)) : '';
  $seats = 0;
  if (is_array($items)) foreach ($items as $i) {
    if (is_array($i) && in_array($i['serviceId'] ?? '', ['kanape', 'fotel', 'puff', 'auto'], true)) $seats += (int) n($i['qty'] ?? 0);
  }
  $interest = (string) ($x['interest'] ?? '');
  if (stripos($itemText, 'padlószőnyeg') !== false || stripos($interest, 'Éttermeknek') !== false || $seats >= 8) {
    $pts += 2; $why[] = 'céges / sok ülőhely';
  }
  if (!empty($x['noPhoto'])) { $pts += 1; $why[] = 'nincs fotó – telefonon kell egyeztetni'; }
  if (($x['photoVia'] ?? '') === 'whatsapp') { $pts += 1; $why[] = 'a fotót WhatsAppon küldi – figyeld'; }
  if (preg_match('/Gyapjú|Bársony|viszkóz/iu', $itemText)) { $pts += 1; $why[] = 'kényes anyag – írásos hozzájárulás kell'; }
  if (stripos($interest, 'Korábban foglalt') !== false) { $pts += 1; $why[] = 'visszatérő ügyfél'; }

  if ($isLead) {
    $phone = preg_replace('/\D/', '', (string) ($x['customer']['phone'] ?? $x['phone'] ?? ''));
    if (strlen($phone) >= 9) { $pts += 2; $why[] = 'megadta a telefonszámát, de nem foglalt'; }
    $stage = (string) ($x['stage'] ?? '');
    if (in_array($stage, ['adatok', 'cím, fotó', 'fotó'], true)) { $pts += 1; $why[] = 'majdnem végigért (' . $stage . ')'; }
  }
  $level = $pts >= 4 ? 1 : ($pts >= 2 ? 2 : 3);
  return [$level, $why];
}
