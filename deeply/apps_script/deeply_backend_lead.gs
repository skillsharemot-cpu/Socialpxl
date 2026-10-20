/**
 * ════════════════════════════════════════════════════════════════════════
 *  DEEPLY – ÉRDEKLŐDŐK: gépelés közbeni mentés a kalkulátorból (2026-10-19)
 *
 *  A kalkulátor (arkalkulator_foglalas.html) a hozzájárulás után már gépelés
 *  közben elküldi a látogató adatait 'lead' műveletként. Ez a részlet a
 *  foglalások táblázatában egy új lapra írja őket: „Érdeklődők”.
 *  Egy látogató = egy sor: gépelés közben ugyanaz a sor frissül (az azonosító
 *  alapján), a foglalás után az Állapot „foglalt” lesz.
 *
 *  TELEPÍTÉS (kb. 3 perc):
 *   1) Nyisd meg az Apps Script projektet (deeply_backend.gs).
 *   2) A doPost függvényben a 'booking' sor ALÁ szúrd be ezt az egy sort:
 *
 *        if (action === 'lead')    return needKey(req, WRITE_KEY) || saveLead(req.data);
 *
 *   3) Ezt az egész fájlt (innen lefelé mindent) másold a deeply_backend.gs VÉGÉRE.
 *   4) Mentés, majd: Telepítés → Telepítések kezelése → ceruza ikon →
 *      Verzió: „Új verzió” → Telepítés. Az URL nem változik, a kalkulátorban
 *      nem kell semmit átírni.
 *   5) (Ajánlott) Időzített futtatás a régi, foglalás nélküli sorok törlésére:
 *      Eseményindítók (óra ikon) → Eseményindító hozzáadása →
 *      regiErdeklodokTorlese · Időalapú · Napi időzítő.
 *
 *  Amíg ez nincs telepítve, a kalkulátor csak a látogató böngészőjébe ment –
 *  a foglalások ugyanúgy beérkeznek, semmi nem törik el.
 *  Kulcs ebben a fájlban NINCS: a meglévő WRITE_KEY-t és a segédfüggvényeket
 *  (out, needKey, sheet, txt, num) használja a deeply_backend.gs-ből.
 * ════════════════════════════════════════════════════════════════════════
 */

var LEAD_SHEET = 'Érdeklődők';
var MAX_LEAD_WRITES_HOUR = 600;   // gépelés közbeni mentés óránként, összesen (spam ellen)
var LEAD_KEEP_DAYS = 60;          // ennyi nap után törlődik a foglalás nélküli érdeklődő (regiErdeklodokTorlese)
var LEAD_COLS = ['Első mentés', 'Utolsó mentés', 'Azonosító', 'Állapot', 'Név', 'E-mail', 'Telefon', 'Irsz.', 'Cím',
                 'Ingatlan', 'Tételek', 'Irányár', 'Kért napok', 'Fotó', 'Érdeklődés (mire kattintott)', 'Forrás',
                 'Hozzájárulás', 'Megjegyzés'];

/** Az „Érdeklődők” lap a foglalások táblázatában – ha nincs, létrehozza a végén. */
function leadSheet() {
  var ss = sheet().getParent();
  var sh = ss.getSheetByName(LEAD_SHEET);
  if (!sh) {
    sh = ss.insertSheet(LEAD_SHEET, ss.getSheets().length);   // a végére, így a Foglalások marad az első lap
    sh.appendRow(LEAD_COLS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, LEAD_COLS.length).setFontWeight('bold').setBackground('#2D3C29').setFontColor('#F0EDE5');
    sh.getRange('E:I').setNumberFormat('@');   // név, e-mail, telefon, irsz., cím = szöveg
    sh.setColumnWidth(1, 140); sh.setColumnWidth(2, 140); sh.setColumnWidth(11, 320); sh.setColumnWidth(15, 320);
  }
  return sh;
}

/** Új vagy frissített érdeklődő (a kalkulátor 'lead' művelete). */
function saveLead(d) {
  if (!d || !d.leadId || !d.customer) return out({ ok: false, error: 'Hiányzó adat.' });
  if (!d.consent || !d.consent.at) return out({ ok: false, error: 'Nincs hozzájárulás – nem mentünk.' });
  var id = String(d.leadId).replace(/[^a-z0-9-]/gi, '').slice(0, 40);
  if (!id) return out({ ok: false, error: 'Hibás azonosító.' });
  if (!underLeadLimit()) return out({ ok: false, error: 'Túl sok mentés – próbáld később.' });

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sh = leadSheet();
    var c = d.customer || {};
    var photos = d.noPhoto ? 'nincs – telefonon egyeztetünk' : (num(d.photos) ? num(d.photos) + ' db' : '');
    var row = [
      new Date(num(d.created) || Date.now()),
      new Date(),
      id,
      txt(cut(d.stage, 30)),
      txt(cut(c.name, 120)),
      txt(cut(c.email, 160)),
      txt(cut(c.phone, 40)),
      txt(cut(c.zip, 10)),
      txt(cut(c.address, 200)),
      txt(cut(d.property, 120)),
      txt(cut((d.items || []).join('\n'), 2000)),
      num(d.total),
      txt(cut((d.dates || []).join(', '), 300)),
      txt(photos),
      txt(cut(d.interest, 600)),
      txt(cut(d.src, 40)),
      txt(Utilities.formatDate(new Date(num(d.consent.at) || Date.now()), 'Europe/Budapest', 'yyyy-MM-dd HH:mm') + ' · ' + cut(d.consent.v, 20)),
      txt(cut(c.note, 1000))
    ];
    var last = sh.getLastRow();
    var hit = last > 1 ? sh.getRange(2, 3, last - 1, 1).createTextFinder(id).matchEntireCell(true).findNext() : null;
    if (hit) {
      sh.getRange(hit.getRow(), 2, 1, row.length - 1).setValues([row.slice(1)]);   // az „Első mentés” marad
    } else {
      sh.appendRow(row);
    }
    bumpLeadCounter();
    return out({ ok: true, id: id });
  } finally {
    lock.releaseLock();
  }
}

/** Adattakarékosság: a LEAD_KEEP_DAYS napnál régebbi, foglalás nélküli érdeklődők törlése. Napi időzítővel futtasd. */
function regiErdeklodokTorlese() {
  var sh = leadSheet();
  var last = sh.getLastRow();
  if (last < 2) return 'Nincs mit törölni.';
  var limit = Date.now() - LEAD_KEEP_DAYS * 24 * 3600 * 1000;
  var vals = sh.getRange(2, 1, last - 1, 4).getValues();
  var n = 0;
  for (var i = vals.length - 1; i >= 0; i--) {   // alulról, hogy a sorszámok ne csússzanak el
    var updated = vals[i][1] instanceof Date ? vals[i][1].getTime() : 0;
    if (String(vals[i][3]) !== 'foglalt' && updated && updated < limit) { sh.deleteRow(i + 2); n++; }
  }
  Logger.log('Törölve: ' + n + ' érdeklődő.');
  return 'Törölve: ' + n;
}

function cut(v, n) { return String(v == null ? '' : v).slice(0, n); }

function underLeadLimit() {
  var p = PropertiesService.getScriptProperties();
  var hour = Math.floor(Date.now() / 3600000);
  if (Number(p.getProperty('leadHour')) !== hour) return true;
  return Number(p.getProperty('leadCount') || 0) < MAX_LEAD_WRITES_HOUR;
}

function bumpLeadCounter() {
  var p = PropertiesService.getScriptProperties();
  var hour = Math.floor(Date.now() / 3600000);
  if (Number(p.getProperty('leadHour')) !== hour) { p.setProperty('leadHour', String(hour)); p.setProperty('leadCount', '1'); }
  else p.setProperty('leadCount', String(Number(p.getProperty('leadCount') || 0) + 1));
}
