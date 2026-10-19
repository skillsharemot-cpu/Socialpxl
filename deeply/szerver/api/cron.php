<?php
/* Időzített feladatok külön futtatása (nem kötelező – az API minden hívás után magától is lefuttatja őket).
   Parancssorból (a tárhely „Cron jobs” menüjében, pl. 10 percenként):
     php /home/FELHASZNALO/public_html/api/cron.php
   Vagy URL-ről, ha a tárhely csak ezt engedi:
     https://deeply.hu/api/cron.php?secret=A_CONFIG_PHP_CRON_SECRET_ERTEKE */
declare(strict_types=1);
require __DIR__ . '/lib/core.php';
require __DIR__ . '/lib/priority.php';
require __DIR__ . '/lib/mail.php';
require __DIR__ . '/lib/store.php';
require __DIR__ . '/lib/tasks.php';

$cli = PHP_SAPI === 'cli';
try {
  if (!$cli) {
    $secret = (string) cfg('cron_secret', '');
    if (strlen($secret) < 16 || str_starts_with($secret, 'IDE_') || !hash_equals($secret, (string) ($_GET['secret'] ?? ''))) {
      http_response_code(403); header('Content-Type: text/plain; charset=utf-8'); echo "Tiltott.\n"; exit;
    }
    header('Content-Type: application/json; charset=utf-8'); header('Cache-Control: no-store');
  }
  echo json_encode(['ok' => true, 'tasks' => run_due_tasks(true)], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), "\n";
} catch (Throwable $e) {
  if (!$cli) http_response_code(500);
  echo json_encode(['ok' => false, 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE), "\n";
  exit(1);
}
