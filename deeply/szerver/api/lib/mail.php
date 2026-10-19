<?php
/* Deeply – e-mail küldés (SMTP a tárhely postafiókjával, tartaléknak a PHP mail()) és a levélsablonok.
   Három levél: 1) új foglalás – nektek, rangsorolva · 2) elakadt érdeklődő – nektek · 3) visszaigazolás – a vevőnek. */

/* ═══════════ KÜLDÉS ═══════════ */
function mail_send(array $to, string $subject, string $text, string $html, ?string $replyTo = null): void {
  $to = array_values(array_filter(array_map('trim', $to), fn($a) => filter_var($a, FILTER_VALIDATE_EMAIL)));
  if (!$to) throw new RuntimeException('Nincs érvényes címzett.');
  $from = (string) cfg('mail_from');
  if (!filter_var($from, FILTER_VALIDATE_EMAIL)) throw new RuntimeException('Hibás feladó (mail_from) a config.php-ban.');
  $msg = mime_message($from, (string) cfg('mail_from_name', 'Deeply'), $to, $subject, $text, $html, $replyTo);
  $smtp = (array) cfg('smtp', []);
  if (!empty($smtp['host'])) smtp_send($smtp, $from, $to, $msg['headers'] . "\r\n\r\n" . $msg['body']);
  else {
    $hdr = preg_replace('/^(To|Subject): .*\r\n/m', '', $msg['headers']);
    if (!mail(implode(', ', $to), enc_header($subject), $msg['body'], $hdr, '-f' . $from)) throw new RuntimeException('A PHP mail() nem tudta elküldeni a levelet.');
  }
}

function enc_header(string $s): string {
  return preg_match('/[^\x20-\x7E]/', $s) ? '=?UTF-8?B?' . base64_encode($s) . '?=' : $s;
}
function enc_addr(string $name, string $addr): string {
  return $name === '' ? $addr : enc_header($name) . ' <' . $addr . '>';
}

function mime_message(string $from, string $fromName, array $to, string $subject, string $text, string $html, ?string $replyTo): array {
  $b = 'dply_' . bin2hex(random_bytes(8));
  $domain = substr(strrchr($from, '@') ?: '@deeply.local', 1);
  $h = [];
  $h[] = 'Date: ' . date('r');
  $h[] = 'From: ' . enc_addr($fromName, $from);
  $h[] = 'To: ' . implode(', ', $to);
  if ($replyTo && filter_var($replyTo, FILTER_VALIDATE_EMAIL)) $h[] = 'Reply-To: ' . $replyTo;
  $h[] = 'Subject: ' . enc_header($subject);
  $h[] = 'Message-ID: <' . bin2hex(random_bytes(12)) . '@' . $domain . '>';
  $h[] = 'MIME-Version: 1.0';
  $h[] = 'Content-Type: multipart/alternative; boundary="' . $b . '"';
  $body = "--$b\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
    . rtrim(chunk_split(base64_encode($text), 76, "\r\n")) . "\r\n"
    . "--$b\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
    . rtrim(chunk_split(base64_encode($html), 76, "\r\n")) . "\r\n--$b--\r\n";
  return ['headers' => implode("\r\n", $h), 'body' => $body];
}

function smtp_send(array $c, string $from, array $to, string $data): void {
  $secure = $c['secure'] ?? 'ssl';
  $verify = $c['verify'] ?? true;
  $ctx = stream_context_create(['ssl' => ['verify_peer' => $verify, 'verify_peer_name' => $verify, 'allow_self_signed' => !$verify, 'SNI_enabled' => true]]);
  $remote = ($secure === 'ssl' ? 'ssl://' : 'tcp://') . $c['host'] . ':' . (int) ($c['port'] ?? 465);
  $fp = @stream_socket_client($remote, $errno, $errstr, 20, STREAM_CLIENT_CONNECT, $ctx);
  if (!$fp) throw new RuntimeException("SMTP kapcsolódás sikertelen ($remote): $errstr");
  stream_set_timeout($fp, 20);
  $read = function () use ($fp): array {
    $lines = '';
    while (($l = fgets($fp, 1024)) !== false) { $lines .= $l; if (strlen($l) < 4 || $l[3] !== '-') break; }
    return [(int) substr($lines, 0, 3), trim($lines)];
  };
  // $label: ami a hibaüzenetbe kerül – a belépési adatok soha nem kerülnek naplóba
  $cmd = function (string $s, array $ok, ?string $label = null) use ($fp, $read): string {
    if ($s !== '') fwrite($fp, $s . "\r\n");
    [$code, $msg] = $read();
    if (!in_array($code, $ok, true)) throw new RuntimeException('SMTP hiba: ' . ($label ?? ($s === '' ? '(kapcsolódás)' : explode(' ', $s)[0])) . ' → ' . $msg);
    return $msg;
  };
  try {
    $cmd('', [220]);
    $ehloHost = preg_replace('/[^a-z0-9.-]/i', '', (string) parse_url((string) cfg('site_url', 'http://localhost'), PHP_URL_HOST)) ?: 'localhost';
    $cmd('EHLO ' . $ehloHost, [250]);
    if ($secure === 'tls') {
      $cmd('STARTTLS', [220]);
      if (!stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT | (defined('STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT') ? STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT : 0)))
        throw new RuntimeException('STARTTLS sikertelen.');
      $cmd('EHLO ' . $ehloHost, [250]);
    }
    if (!empty($c['user'])) {
      $cmd('AUTH LOGIN', [334]);
      $cmd(base64_encode((string) $c['user']), [334], 'AUTH (felhasználónév)');
      $cmd(base64_encode((string) ($c['pass'] ?? '')), [235], 'AUTH (jelszó) – hibás felhasználónév vagy jelszó?');
    }
    $cmd('MAIL FROM:<' . $from . '>', [250]);
    foreach ($to as $r) $cmd('RCPT TO:<' . $r . '>', [250, 251]);
    $cmd('DATA', [354]);
    $data = preg_replace('/^\./m', '..', str_replace(["\r\n", "\r"], "\n", $data));   // pont-duplázás
    $data = str_replace("\n", "\r\n", $data);
    fwrite($fp, $data . "\r\n.\r\n");
    $cmd('', [250]);
    @fwrite($fp, "QUIT\r\n");
  } finally {
    fclose($fp);
  }
}

/* ═══════════ SEGÉDEK A SABLONOKHOZ ═══════════ */
const HU_MON = ['jan.', 'febr.', 'márc.', 'ápr.', 'máj.', 'jún.', 'júl.', 'aug.', 'szept.', 'okt.', 'nov.', 'dec.'];
const HU_DAY = ['vasárnap', 'hétfő', 'kedd', 'szerda', 'csütörtök', 'péntek', 'szombat'];
function hu_day(string $iso): string {
  $d = DateTimeImmutable::createFromFormat('!Y-m-d', $iso);
  if (!$d) return $iso;
  return HU_MON[(int) $d->format('n') - 1] . ' ' . (int) $d->format('j') . '., ' . HU_DAY[(int) $d->format('w')];
}
function prop_text($p): string {
  if (!is_array($p) || empty($p['type'])) return '–';
  $names = ['csaladi' => 'Családi ház', 'tarsashaz' => 'Társasház – földszint', 'emeletes' => 'Emeletes lakás'];
  $s = $names[$p['type']] ?? (string) $p['type'];
  if ($p['type'] === 'emeletes') $s .= ' – ' . (s($p['floor'] ?? '?') ?: '?') . '. emelet, ' . (($p['lift'] ?? null) === true ? 'van lift' : ((($p['lift'] ?? null) === false) ? 'NINCS lift' : 'lift?'));
  return $s;
}
function wa_link(string $phone, string $text = ''): string {
  $num = preg_replace('/\D/', '', $phone);
  if (strlen($num) === 11 && str_starts_with($num, '06')) $num = '36' . substr($num, 2);   // 06 30… → 36 30…
  return 'https://wa.me/' . $num . ($text !== '' ? '?text=' . rawurlencode($text) : '');
}
function tel_link(string $phone): string { return 'tel:' . preg_replace('/[^\d+]/', '', $phone); }

function email_shell(string $title, string $inner, string $preheader = ''): string {
  $logo = (string) cfg('logo_url', '');
  $brand = $logo ? '<img src="' . h($logo) . '" alt="' . h(cfg('business', 'Deeply')) . '" width="150" style="display:block;border:0;width:150px;height:auto">'
    : '<span style="font:700 22px/1 Georgia,serif;letter-spacing:.18em;color:#F0EDE5">' . h(mb_strtoupper((string) cfg('business', 'Deeply'))) . '</span>'
      . '<br><span style="font:300 10px/1.6 Arial,sans-serif;letter-spacing:.22em;color:#D9D4C7">KÁRPIT ÉS SZŐNYEGTISZTÍTÁS</span>';
  return '<!doctype html><html lang="hu"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>' . h($title) . '</title></head>'
    . '<body style="margin:0;padding:0;background:#F0EDE5;color:#2D3C29">'
    . '<span style="display:none;max-height:0;overflow:hidden;opacity:0">' . h($preheader) . '</span>'
    . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F0EDE5"><tr><td align="center" style="padding:20px 10px">'
    . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;border-radius:14px;overflow:hidden">'
    . '<tr><td style="background:#2D3C29;padding:22px 26px">' . $brand . '</td></tr>'
    . '<tr><td style="padding:26px;font:400 15px/1.6 Arial,Helvetica,sans-serif;color:#2D3C29">' . $inner . '</td></tr>'
    . '</table></td></tr></table></body></html>';
}
function email_btn(string $href, string $label, bool $gold = true): string {
  $bg = $gold ? '#D8AE47' : '#F0EDE5';
  return '<a href="' . h($href) . '" style="display:inline-block;margin:4px 6px 4px 0;background:' . $bg . ';color:#2D3C29;text-decoration:none;font:700 14px/1 Arial,sans-serif;padding:12px 18px;border-radius:999px">' . h($label) . '</a>';
}
function email_badge(int $level, array $why): string {
  $col = [1 => '#A33A1C', 2 => '#C99D36', 3 => '#7E8772'][$level] ?? '#7E8772';
  $t = '<div style="background:' . $col . ';color:#fff;border-radius:10px;padding:10px 14px;margin:0 0 16px;font:700 14px/1.4 Arial,sans-serif">'
    . PRIO_DOT[$level] . ' ' . PRIO_LABEL[$level];
  if ($why) $t .= '<div style="font-weight:400;font-size:13px;margin-top:2px">' . h(implode(' · ', $why)) . '</div>';
  return $t . '</div>';
}
function email_rows(array $rows): string {
  $t = '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:8px 0 14px">';
  foreach ($rows as [$k, $v]) $t .= '<tr><td style="padding:6px 10px 6px 0;color:#4E5948;font-size:13px;vertical-align:top;white-space:nowrap">' . h($k) . '</td><td style="padding:6px 0;font-size:14px;vertical-align:top">' . $v . '</td></tr>';
  return $t . '</table>';
}
function items_html(array $items): string {
  if (!$items) return '–';
  $t = '';
  foreach ($items as $it) {
    $label = is_array($it) ? (string) ($it['label'] ?? '') : (string) $it;
    $tot = is_array($it) && isset($it['total']) ? ' — <b>' . h(huf($it['total'])) . '</b>' : '';
    $t .= '• ' . h($label) . $tot . '<br>';
  }
  return $t;
}
function items_text(array $items): string {
  return implode("\n", array_map(fn($it) => '• ' . (is_array($it) ? ($it['label'] ?? '') . (isset($it['total']) ? ' — ' . huf($it['total']) : '') : (string) $it), $items));
}

/* ═══════════ 1) ÚJ FOGLALÁS – NEKTEK, RANGSOROLVA ═══════════ */
function mail_booking_notice(array $row, array $b): array {
  [$level, $why] = [(int) $row['priority'], json_decode((string) $row['prio_reasons'], true) ?: []];
  $c = $b['customer'] ?? [];
  $name = s($c['name'] ?? 'Névtelen', 120);
  $dates = array_values(array_filter((array) ($b['dates'] ?? []), 'is_string')); sort($dates);
  $first = $dates ? hu_day($dates[0]) : '–';
  $subject = PRIO_DOT[$level] . ' ' . PRIO_LABEL[$level] . ' · Új foglalás · ' . $name . ' · ' . huf($b['total'] ?? 0) . ($dates ? ' · legkorábban ' . $first : '');
  $phone = s($c['phone'] ?? '', 40); $email = s($c['email'] ?? '', 160);
  $addr = trim(s($c['zip'] ?? '', 10) . ' ' . s($c['address'] ?? '', 200));
  $photos = json_decode((string) $row['photos'], true) ?: [];
  $photoInfo = !empty($b['noPhoto']) ? '<b style="color:#A33A1C">NINCS – telefonon kell egyeztetni</b>'
    : ((($b['photoVia'] ?? '') === 'whatsapp') ? '<b>WhatsAppon küldi</b>' : count($photos) . ' db');
  $btns = ($phone ? email_btn(tel_link($phone), 'Hívás: ' . $phone) . email_btn(wa_link($phone, 'Szia ' . $name . '! A Deeplytől írunk a foglalásod miatt.'), 'WhatsApp', false) : '')
    . ($email ? email_btn('mailto:' . $email . '?subject=' . rawurlencode('Ajánlat – ' . cfg('business', 'Deeply')), 'E-mail', false) : '');
  $html = email_badge($level, $why)
    . '<h1 style="font:400 24px/1.25 Georgia,serif;margin:0 0 4px">Új foglalás: ' . h($name) . '</h1>'
    . '<p style="margin:0 0 12px;color:#4E5948">' . h(date('Y.m.d. H:i', (int) ($row['received'] / 1000))) . ' · azonosító: ' . h($row['id']) . '</p>'
    . '<div>' . $btns . '</div>'
    . email_rows([
      ['Telefon', h($phone ?: '–')], ['E-mail', h($email ?: '–')],
      ['Cím', $addr ? h($addr) . ' · <a href="https://www.google.com/maps/search/?api=1&query=' . rawurlencode($addr) . '" style="color:#2D3C29">térkép</a>' : '–'],
      ['Ingatlan', h(prop_text($b['property'] ?? null))],
      ['Napok', h($dates ? implode(', ', array_map('hu_day', $dates)) : '–') . ' · ' . h(s($c['timepref'] ?? '', 30))],
      ['Fotó', $photoInfo], ['Megjegyzés', nl2br(h(s($c['note'] ?? '', 1000) ?: '–'))],
    ])
    . '<h2 style="font:400 19px/1.3 Georgia,serif;margin:6px 0">Tételek</h2><p style="margin:0 0 10px">' . items_html((array) ($b['items'] ?? [])) . '</p>'
    . email_rows([
      ['Részösszeg', h(huf($b['sub'] ?? 0))], ['Kiszállás', h(huf($b['travelFee'] ?? 0))],
      ['Becsült végösszeg', '<b style="font-size:17px">' . h(huf($b['total'] ?? 0)) . '</b>'],
      ['Forrás', h(s($b['src'] ?? '', 40) ?: '–')], ['Érdeklődés', h(s($b['interest'] ?? '', 600) ?: '–')],
    ]);
  if ($photos) {
    $html .= '<p style="margin:6px 0">';
    foreach ($photos as $f) $html .= '<a href="' . h(photo_url($f)) . '"><img src="' . h(photo_url($f)) . '" width="120" height="120" alt="fotó" style="width:120px;height:120px;object-fit:cover;border-radius:10px;margin:0 6px 6px 0;border:0"></a>';
    $html .= '</p>';
  }
  $html .= '<p style="margin:16px 0 0">' . email_btn(admin_url(), 'Megnyitás az Ügyek oldalon', false) . '</p>';
  $text = PRIO_LABEL[$level] . ($why ? ' – ' . implode('; ', $why) : '') . "\n\n"
    . "Új foglalás: $name\nTelefon: " . ($phone ?: '-') . "\nE-mail: " . ($email ?: '-') . "\nCím: " . ($addr ?: '-')
    . "\nIngatlan: " . prop_text($b['property'] ?? null) . "\nNapok: " . ($dates ? implode(', ', array_map('hu_day', $dates)) : '-')
    . "\nFotó: " . strip_tags($photoInfo) . "\nMegjegyzés: " . (s($c['note'] ?? '', 1000) ?: '-')
    . "\n\nTételek:\n" . items_text((array) ($b['items'] ?? [])) . "\n\nBecsült végösszeg: " . huf($b['total'] ?? 0)
    . "\nÉrdeklődés: " . (s($b['interest'] ?? '', 600) ?: '-') . "\n\nÜgyek oldal: " . admin_url() . "\n";
  return [$subject, $text, email_shell($subject, $html, implode(' · ', $why))];
}

/* ═══════════ 2) ELAKADT ÉRDEKLŐDŐ – NEKTEK (5C) ═══════════ */
const STAGE_TXT = ['tételek' => 'a tételek kiválasztásánál', 'ingatlan' => 'az ingatlan kérdésénél', 'időpont' => 'az időpontnál',
  'fotó' => 'a fotónál', 'adatok' => 'az adatai megadásánál', 'cím, fotó' => 'a címnél / fotónál'];
function mail_lead_alert(array $row, array $d): array {
  [$level, $why] = [(int) $row['priority'], json_decode((string) $row['prio_reasons'], true) ?: []];
  $c = $d['customer'] ?? [];
  $name = s($c['name'] ?? '', 120) ?: 'Névtelen érdeklődő';
  $phone = s($c['phone'] ?? '', 40); $email = s($c['email'] ?? '', 160);
  $stage = (string) ($row['stage'] ?? '');
  $mins = max(1, (int) round((now_ms() - (int) $row['updated']) / 60000));
  $subject = PRIO_DOT[$level] . ' ' . PRIO_LABEL[$level] . ' · Hívd vissza · ' . $name . ($phone ? ' · ' . $phone : '') . ' · ' . ($d['total'] ? huf($d['total']) : 'még nincs ár');
  $btns = ($phone ? email_btn(tel_link($phone), 'Hívás: ' . $phone) . email_btn(wa_link($phone, 'Szia ' . $name . '! A Deeplytől írunk – láttuk, hogy árat számoltál nálunk. Segíthetünk?'), 'WhatsApp', false) : '')
    . ($email ? email_btn('mailto:' . $email, 'E-mail', false) : '');
  $items = (array) ($d['items'] ?? []);
  $html = email_badge($level, $why)
    . '<h1 style="font:400 24px/1.25 Georgia,serif;margin:0 0 4px">Elakadt érdeklődő: ' . h($name) . '</h1>'
    . '<p style="margin:0 0 12px;color:#4E5948">' . h($mins) . ' perce nem lépett tovább ' . h(STAGE_TXT[$stage] ?? ('(' . $stage . ')')) . '. Megadta az elérhetőségét, de még nem foglalt.</p>'
    . '<div>' . $btns . '</div>'
    . email_rows([
      ['Telefon', h($phone ?: '–')], ['E-mail', h($email ?: '–')],
      ['Tételek', $items ? implode('<br>', array_map(fn($i) => h(is_array($i) ? ($i['label'] ?? '') : $i), $items)) : '–'],
      ['Irányár', h($d['total'] ? huf($d['total']) : '–')], ['Ingatlan', h(s($d['property'] ?? '', 120) ?: '–')],
      ['Napok', h(($d['dates'] ?? []) ? implode(', ', array_map('hu_day', (array) $d['dates'])) : '–')],
      ['Érdeklődés', h(s($d['interest'] ?? '', 600) ?: '–')],
    ])
    . '<p style="margin:16px 0 0">' . email_btn(admin_url(), 'Megnyitás az Ügyek oldalon', false) . '</p>'
    . '<p style="font-size:12px;color:#4E5948;margin:14px 0 0">Ezt a jelzést egyszer kapod meg. Az érdeklődő hozzájárult az adatai mentéséhez (süti-elfogadás).</p>';
  $text = PRIO_LABEL[$level] . ($why ? ' – ' . implode('; ', $why) : '') . "\n\nElakadt érdeklődő: $name\nTelefon: " . ($phone ?: '-') . "\nE-mail: " . ($email ?: '-')
    . "\nElakadt: " . (STAGE_TXT[$stage] ?? $stage) . " ($mins perce)\nTételek:\n" . items_text($items) . "\nIrányár: " . ($d['total'] ? huf($d['total']) : '-') . "\n\nÜgyek oldal: " . admin_url() . "\n";
  return [$subject, $text, email_shell($subject, $html, implode(' · ', $why))];
}

/* ═══════════ 3) VISSZAIGAZOLÁS A VEVŐNEK (5B) ═══════════ */
function mail_customer_confirmation(array $row, array $b): array {
  $c = $b['customer'] ?? [];
  $name = s($c['name'] ?? '', 120);
  $biz = (string) cfg('business', 'Deeply');
  $subject = 'Megkaptuk a foglalásod – erre számíts';
  $dates = array_values(array_filter((array) ($b['dates'] ?? []), 'is_string')); sort($dates);
  $photos = json_decode((string) $row['photos'], true) ?: [];
  $phone = (string) cfg('phone', ''); $wa = (string) cfg('whatsapp', '');
  $upholstery = false;
  foreach ((array) ($b['items'] ?? []) as $it) if (is_array($it) && in_array($it['serviceId'] ?? '', ['kanape', 'fotel', 'puff', 'auto', 'matrac'], true)) $upholstery = true;
  $needPhoto = !empty($b['noPhoto']) || (($b['photoVia'] ?? '') === 'whatsapp');
  $addr = trim(s($c['zip'] ?? '', 10) . ' ' . s($c['address'] ?? '', 200));

  $html = '<h1 style="font:400 26px/1.25 Georgia,serif;margin:0 0 12px">Kedves ' . h($name) . '!</h1>'
    . '<p style="margin:0 0 12px">Köszönjük, hogy minket választottál. Megkaptuk a foglalási igényedet' . ($photos ? ' és a fotókat' : '') . ' – <b>24 órán belül</b> küldjük az írásos ajánlatot, és egyeztetjük veled a pontos időpontot.</p>'
    . '<div style="background:#F0EDE5;border-radius:12px;padding:14px 16px;margin:16px 0">'
    . '<p style="margin:0 0 6px;font:700 13px/1.4 Arial,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#4E5948">A foglalásod</p>'
    . '<p style="margin:0 0 10px">' . items_html((array) ($b['items'] ?? [])) . '</p>'
    . email_rows([
      ['Becsült végösszeg', '<b style="font-size:17px">' . h(huf($b['total'] ?? 0)) . '</b>'],
      ['Napok, amikor otthon vagy', h($dates ? implode(', ', array_map('hu_day', $dates)) : '–')],
      ['Cím', h($addr ?: '–')],
    ])
    . '<p style="margin:0;font-size:12px;color:#4E5948">Az árak tájékoztató jellegűek; a pontos ajánlatot a fotók alapján, írásban küldjük. Fizetés a munka után, a helyszínen – előleget nem kérünk.</p></div>'
    . '<h2 style="font:400 19px/1.3 Georgia,serif;margin:18px 0 6px">Mi történik ezután?</h2>'
    . '<p style="margin:0 0 12px">Visszaigazoljuk az időpontot, a helyszínen először szálpróbát csinálunk, és megmondjuk, mi fog kijönni. Minden darabról előtte–utána fotó készül.'
    . ($upholstery ? ' A kárpitnak a munka után 4–6 óra kell a teljes száradáshoz.' : '') . '</p>'
    . '<p style="margin:0 0 12px"><b>Egy tipp már most:</b> ha új folt kerül a kárpitra, ne dörzsöld – itasd fel egy fehér törlőkendővel, kívülről befelé.</p>'
    . ($needPhoto && $wa ? '<p style="margin:0 0 12px">A fotót WhatsAppon is elküldheted – így pontosabb ajánlatot tudunk adni:</p><p>' . email_btn(wa_link($wa, 'Szia! ' . $name . ' vagyok, küldöm a fotót a foglalásomhoz.'), 'Fotó küldése WhatsAppon') . '</p>' : '')
    . '<p style="margin:12px 0">Ha bármi kérdésed van, válaszolj erre a levélre' . ($phone ? ', vagy hívj minket: <a href="' . h(tel_link($phone)) . '" style="color:#2D3C29;font-weight:700">' . h($phone) . '</a>' : '') . '.</p>'
    . '<p style="margin:18px 0 0">Üdv,<br><b>Tomi és Norbi</b><br>' . h($biz) . ' – kárpit- és szőnyegtisztítás</p>'
    . '<hr style="border:0;border-top:1px solid #DDD5C6;margin:22px 0 12px">'
    . '<p style="margin:0;font-size:12px;color:#4E5948">Javító garancia: ha visszajön a folt, ingyen visszamegyünk – lehetőleg 48 órán, legkésőbb 1 héten belül. '
    . 'Ezt a levelet azért kaptad, mert foglalást adtál le a ' . h(preg_replace('#^https?://#', '', (string) cfg('site_url', ''))) . ' oldalon. Azonosító: ' . h($row['id']) . '</p>';
  $text = "Kedves $name!\n\nKöszönjük, hogy minket választottál. Megkaptuk a foglalási igényedet – 24 órán belül küldjük az írásos ajánlatot, és egyeztetjük veled a pontos időpontot.\n\n"
    . "A foglalásod:\n" . items_text((array) ($b['items'] ?? [])) . "\nBecsült végösszeg: " . huf($b['total'] ?? 0)
    . "\nNapok: " . ($dates ? implode(', ', array_map('hu_day', $dates)) : '-') . "\nCím: " . ($addr ?: '-')
    . "\n(Az árak tájékoztató jellegűek; a pontos ajánlatot írásban küldjük. Fizetés a munka után, a helyszínen – előleget nem kérünk.)\n\n"
    . "Mi történik ezután? Visszaigazoljuk az időpontot, a helyszínen először szálpróbát csinálunk, és megmondjuk, mi fog kijönni. Minden darabról előtte–utána fotó készül."
    . ($upholstery ? " A kárpitnak a munka után 4–6 óra kell a teljes száradáshoz." : '') . "\n\n"
    . "Egy tipp: ha új folt kerül a kárpitra, ne dörzsöld – itasd fel egy fehér törlőkendővel, kívülről befelé.\n\n"
    . ($needPhoto && $wa ? "A fotót WhatsAppon is elküldheted: " . wa_link($wa) . "\n\n" : '')
    . "Ha bármi kérdésed van, válaszolj erre a levélre" . ($phone ? ", vagy hívj minket: $phone" : '') . ".\n\nÜdv,\nTomi és Norbi\n$biz\n";
  return [$subject, $text, email_shell($subject, $html, 'Megkaptuk – 24 órán belül jelentkezünk az írásos ajánlattal.')];
}
