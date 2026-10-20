<?php
/* Mintaadatok a levélsablonok előnézetéhez és a próbalevélhez (az Ügyek oldal „Beállítások” fülén). */

function sample_booking(): array {
  $d1 = date('Y-m-d', strtotime('+1 day')); $d2 = date('Y-m-d', strtotime('+3 day'));
  return [
    'created' => now_ms(), 'src' => 'web', 'leadId' => 'minta',
    'customer' => ['name' => 'Minta Anna', 'email' => 'anna@example.com', 'phone' => '+36 30 123 4567', 'zip' => '1114',
      'address' => 'Budapest, Minta utca 1. 2/5', 'note' => 'A kanapén kávéfolt van.', 'timepref' => 'délelőtt'],
    'dates' => [$d1, $d2], 'property' => ['type' => 'lakás', 'floor' => '2', 'lift' => true],
    'items' => [
      ['label' => 'Kanapé (3 személyes) · szövet', 'total' => 18900, 'serviceId' => 'kanape', 'qty' => 3],
      ['label' => 'Szőnyeg 6 m² · gyapjú', 'total' => 12600, 'serviceId' => 'szonyeg', 'qty' => 6],
    ],
    'sub' => 31500, 'travelFee' => 0, 'total' => 31500, 'deposit' => 0, 'onsite' => 31500,
    'noPhoto' => false, 'photoVia' => 'whatsapp', 'interest' => 'Kárpittisztítás (főoldal)',
  ];
}

function sample_row(array $b): array {
  [$level, $why] = priority_of($b, false);
  return ['id' => 'FOG-MINTA', 'received' => now_ms(), 'priority' => $level, 'prio_reasons' => json_encode($why, JSON_UNESCAPED_UNICODE),
    'photos' => '[]', 'updated' => now_ms() - 40 * 60000, 'stage' => 'adatok'];
}

function mail_previews(): array {
  $b = sample_booking(); $row = sample_row($b);
  $lead = $b; $lead['stage'] = 'adatok';
  $lead['items'] = array_map(fn($i) => $i['label'], $b['items']);
  [$lv, $lw] = priority_of($lead, true);
  $lrow = $row; $lrow['priority'] = $lv; $lrow['prio_reasons'] = json_encode($lw, JSON_UNESCAPED_UNICODE);
  $out = [];
  foreach (['booking' => mail_booking_notice($row, $b), 'lead' => mail_lead_alert($lrow, $lead), 'confirm' => mail_customer_confirmation($row, $b)] as $k => [$s, $t, $h])
    $out[$k] = ['subject' => $s, 'text' => $t, 'html' => $h];
  return $out;
}
