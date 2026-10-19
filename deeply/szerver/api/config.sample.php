<?php
/* ════════════════════════════════════════════════════════════════════════
   DEEPLY – szerver-beállítások
   Másold le ezt a fájlt config.php néven (ugyanebbe a mappába), és írd át
   a „IDE_…” részeket. A config.php-t SOHA ne töltsd fel GitHubra.
   ════════════════════════════════════════════════════════════════════════ */
return [
  // ── Kulcsok ──────────────────────────────────────────────────────────
  // A kalkulátorban látható, nyilvános kulcs – csak foglalás és érdeklődő beküldésére jó.
  // Ha ugyanaz marad, mint az Apps Scriptben, a kalkulátorban nem kell átírni.
  'write_key'   => 'F9YcCX1EyZ0Mqzpz',
  // Titkos admin-kulcs (legalább 24 karakter). Ezzel lépsz be az Ügyek oldalra.
  // Javaslat: egy jelszókezelővel generált, hosszú véletlen szöveg.
  'admin_key'   => 'IDE_JON_EGY_HOSSZU_TITKOS_ADMIN_KULCS',
  // A cron.php URL-es futtatásához (ha a tárhelyen nincs parancssori időzítő).
  'cron_secret' => 'IDE_JON_EGY_MASIK_TITKOS_SZOVEG',

  // ── Adatok helye ─────────────────────────────────────────────────────
  // Legjobb a public_html-en KÍVÜL, pl. '/home/felhasznalonev/deeply_adat'.
  // Ha a tárhely ezt nem engedi, maradhat az api/adat mappa (azt .htaccess védi).
  'data_dir'    => __DIR__ . '/adat',

  // ── Cég és elérhetőség (a kalkulátor és az e-mailek is innen veszik) ──
  'business'    => 'Deeply',
  'site_url'    => 'https://deeply.hu',              // a domain, https-sel, perjel nélkül
  'admin_path'  => '/admin/ugyek.html',              // az Ügyek oldal útvonala
  'phone'       => '',                               // pl. '+36 30 123 4567' (üres = nem jelenik meg)
  'whatsapp'    => '',                               // a WhatsApp Business száma, pl. '+36 30 123 4567'
  'public_email'=> '',                               // a vevőknek mutatott cím, pl. 'hello@deeply.hu'

  // ── E-mail ───────────────────────────────────────────────────────────
  'notify_to'      => ['IDE_A_SAJAT_CIMETEK@deeply.hu'],  // ide jönnek az értesítések (több cím is lehet)
  'mail_from'      => 'ajanlat@deeply.hu',               // a domain egyik postafiókja
  'mail_from_name' => 'Deeply – Tomi és Norbi',
  'reply_to'       => 'ajanlat@deeply.hu',               // a vevő ide válaszol
  // SMTP: a tárhely saját levelezőszervere. Üres 'host' esetén a PHP mail() függvényét használja.
  'smtp' => [
    'host'   => '',            // pl. 'mail.deeply.hu' – a tárhely levelezési beállításainál találod
    'port'   => 465,           // 465 = SSL, 587 = STARTTLS
    'secure' => 'ssl',         // 'ssl' | 'tls' | 'none'
    'user'   => 'ajanlat@deeply.hu',
    'pass'   => '',
    'verify' => true,          // tanúsítvány-ellenőrzés (csak tesztnél kapcsold ki)
  ],
  'customer_confirmation' => true,   // automatikus visszaigazoló levél a vevőnek (5B)
  'logo_url' => '',                  // ha van PNG logó a levelek tetejére, pl. 'https://deeply.hu/kepek/logo-email.png'

  // ── Értesítések rangsora és az elakadt érdeklődők (5A, 5C) ──────────
  'abandon_minutes' => 30,        // ennyi perc csend után jelez, ha valaki megadta a számát, de nem foglalt
  'alert_hours'     => [7, 21],   // ezen az idősávon kívül a jelzés reggelig vár (7:00–21:00)
  'urgent_total'    => 50000,     // e fölött a foglalás „nagy megrendelés” (Ft)
  'big_total'       => 25000,

  // ── Adatmegőrzés és mentés ───────────────────────────────────────────
  'lead_keep_days'  => 60,        // foglalás nélküli érdeklődők törlése ennyi nap után
  'snapshot_keep'   => 30,        // napi adatbázis-mentésekből ennyi marad meg
  'backup_keep'     => 30,        // az admin feltöltött teljes mentéseiből ennyi marad

  // ── Egyéb ────────────────────────────────────────────────────────────
  // Honnan hívható az API. '*' = bárhonnan (a kulcsok védik). Élesben megadható pl. ['https://deeply.hu'].
  'allowed_origins' => ['*'],
  'timezone'        => 'Europe/Budapest',
];
