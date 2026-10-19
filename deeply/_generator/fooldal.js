// Deeply főoldal – a Fixter (fixter.co.uk) főoldalának elemről elemre követett szerkezete.
// Forrás: a Fixter <main> DOM-ja (Tomi F12-kimásolása, 2026-10-17) + mért méretek; leírás: Weblap_Design_Upgrade/referencia_oldalak/fixter_Design.md.
// Szövegek: content.js → fooldal.* (hivatkozás: FOOLDAL-…); arculat: themes.js (Pantone). Ár nincs az oldalon – minden választás a kalkulátorra visz.
// 2026-10-19: mobilon az „Így dolgozunk” lapozó jobban mutatja, hogy oldalra húzható (kilógó következő lap, nyilak, „1 / 4 · Húzd oldalra” sor,
// egyszeri rámutató mozdulat); a kalkulátor-linkek magukkal viszik, mire kattintott a látogató (?pick=…&int=…&faq=…&how=…&from=…).
// 2026-10-19 (2): süti-ablak a főoldalon (a döntést a kalkulátor-link ?ck=… viszi át); a fő gomb (CTA) elütő arany #D8AE47 –
// a felhasználó kérése, a brandbook Alapok/komponensek.md szabályát („✕ palettán kívüli gomb”) ehhez frissíteni kell.
// Fixter → Deeply színek: lila hero/fejléc → Mountain View · sárga CTA → Coconut Milk (sötéten) / Mountain View (világoson) ·
// piros akciósáv → Fog · levendula szakasz-háttér → Coconut Milk · a 4 szolgáltatás-szín → MV / Matte Green / Weathered Teak / Fog.
const C = require('./content');
const P = require('./pages');
const F = C.fooldal, esc = P.esc;
const r = p => ` data-ref="${P.idOf(p)}"`;
const KALK = C.KALK + '?src=web';
const TEL = 'tel:' + C.PHONE.replace(/\s/g, '');
// WhatsApp: a content.js WHATSAPP mezője (nemzetközi formában, pl. '+36 30 123 4567'); ha nincs megadva, a PHONE
const WA_NUM = String(C.WHATSAPP || C.PHONE).replace(/\D/g, '').replace(/^06/, '36');
const WA_TXT = F.waText || 'Szia! Küldök egy fotót a foltról – mennyibe kerülne a tisztítás?';
const WA = 'https://wa.me/' + WA_NUM + '?text=' + encodeURIComponent(WA_TXT);
const WA_A = `href="${WA}" data-wa target="_blank" rel="noopener"`;

const ICON = {
  sofa: '<path d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3"/><path d="M2 13a2 2 0 0 1 4 0v2h12v-2a2 2 0 0 1 4 0v5H2z"/><path d="M5 18v2M19 18v2"/>',
  rug: '<rect x="5" y="4" width="14" height="16" rx="1"/><rect x="8" y="7" width="8" height="10"/><path d="M7 2v2M10 2v2M14 2v2M17 2v2M7 20v2M10 20v2M14 20v2M17 20v2"/>',
  bed: '<path d="M3 9h18v8H3z"/><path d="M3 13h18M6 9V7h5v2M3 17v2M21 17v2"/>',
  car: '<path d="M5 16h14v-4l-2-5H7l-2 5z"/><path d="M5 12h14M5 16v2M19 16v2"/><circle cx="8" cy="14" r=".6"/><circle cx="16" cy="14" r=".6"/>',
  eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  lens: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5.5 5.5M8 10.5h5M10.5 8v5"/>',
  shield: '<path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/>',
  phone: '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  cam: '<path d="M4 7h3l2-2h6l2 2h3v12H4z"/><circle cx="12" cy="13" r="3.5"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  arrowc: '<circle cx="12" cy="12" r="10"/><path d="M7.5 12h9M12.5 8l4 4-4 4"/>',
  chev: '<path d="M6 9l6 6 6-6"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.3"/>',
  wa: '<path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z"/><path d="M9.2 7.8c-.4 0-.9.4-.9 1.2 0 2.9 3.4 6.4 6.6 6.6.8 0 1.2-.5 1.2-.9v-.9l-1.9-.9-.9.9c-1-.4-2.4-1.8-2.8-2.8l.9-.9-.9-1.9z"/>',
  ext: '<path d="M8 16L16 8M9 8h7v7"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  pdf: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5"/>',
};
const ic = (k, s = 22, cls = 'i') => `<svg class="${cls}" viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k]}</svg>`;
const STAR = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M12 3.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.8l6.1-.7z"/></svg>';
// A 4 szolgáltatás saját színe (Fixter: lila / sötétkék / zöld / világoskék) + az ikon színe rajta (kontraszt ≥3:1)
const SC = [['var(--mv)', 'var(--cm)'], ['var(--mg)', '#fff'], ['var(--wt)', 'var(--mv)'], ['var(--fog)', 'var(--mv)']];
// Az „Így dolgozunk” lapok panelszíne (Fixter: #5ebeea / #6b4aff / #140054 / #1fd37e)
const HOW_COL = ['var(--mg)', 'var(--wt)', 'var(--mv)', 'var(--fog)'];
// Mobilon a lapozó fölötti súgó („1 / 4 · Húzd oldalra →”). Ha a content.js-be bekerül a fooldal.howHint, az az irányadó.
const HOW_HINT = F.howHint || 'Húzd oldalra';
// Süti-ablak szövegei – ugyanaz, mint a kalkulátorban. A content.js-be tett fooldal.cookie felülírja.
const CK = F.cookie || {
  title: 'Sütiket használunk',
  text: 'A weboldal sütiket és hasonló technológiákat használ, hogy megjegyezze a választásaidat, és az árkalkulátorban ne vesszen el, amit beírsz. Az „Elfogadom” gombbal hozzájárulsz ezekhez és az adataid kezeléséhez.',
  more: 'Részletek',
  list: ['Szükséges: a süti-döntésed megjegyzése – ez mindig működik.',
    'Kényelmi: a választásaid és a kalkulátorba beírt adatok mentése (már gépelés közben), hogy ott folytathasd, ahol abbahagytad, és vissza tudjunk hívni.',
    'Beépülő modulok: Google Fonts (betűtípusok)' + (/github\.io/.test(C.KALK) ? ', Google Apps Script (az ajánlatkérések fogadása)' : '') + '. A WhatsApp csak akkor nyílik meg, ha a WhatsApp-gombra koppintasz.',
    'Az adataidat csak az ajánlatodhoz és a foglalásodhoz használjuk, nem adjuk tovább. A döntésed az oldal alján, a „Süti-beállítások” linkkel bármikor módosíthatod.'],
  yes: 'Elfogadom', no: 'Csak a szükségesek', settings: 'Süti-beállítások',
};

/* CSERE: rajzolt helyőrző – élesítéskor valódi fotó (kivágott, háttér nélküli PNG/WebP) jön a helyére */
const CHAIR = `<svg class="ill" viewBox="0 0 260 240" aria-hidden="true"><ellipse cx="130" cy="228" rx="110" ry="9" fill="#2D3C29" opacity=".18"/>
<rect x="48" y="20" width="164" height="140" rx="44" fill="#7E8772"/><rect x="70" y="40" width="120" height="96" rx="28" fill="#96A089"/>
<rect x="20" y="96" width="56" height="104" rx="26" fill="#6A735F"/><rect x="184" y="96" width="56" height="104" rx="26" fill="#6A735F"/>
<rect x="56" y="134" width="148" height="64" rx="20" fill="#8A9480"/><rect x="58" y="198" width="12" height="26" rx="4" fill="#4E5948"/><rect x="190" y="198" width="12" height="26" rx="4" fill="#4E5948"/></svg>`;

/* Telefon-képernyők az „Így dolgozunk” lapokra (Fixter: app-képernyőképek). Ár nincs rajtuk. */
const screen = i => {
  const head = `<div class="ps-top"><span class="ps-logo"></span><span>Deeply</span><i></i></div><b class="ps-h">${esc(F.how[i][2])}</b>`;
  return [
    `${head}${F.pick.map(([k, n], j) => `<div class="ps-row${j ? '' : ' on'}"><span class="ps-ic" style="background:${SC[j][0]};color:${SC[j][1]}">${ic(k, 12)}</span>${esc(n)}</div>`).join('')}<div class="ps-up">${ic('cam', 14)} Fotó feltöltése</div><div class="ps-btn">Tovább</div>`,
    `<div class="ps-note">${ic('pdf', 13)} Megérkezett az ajánlatod</div>${head}<div class="ps-days">${['H', 'K', 'Sze', 'Cs', 'P'].map((d, j) => `<span class="${j === 2 ? 'on' : ''}">${d}<b>${21 + j}</b></span>`).join('')}</div>${['8:00', '10:30', '13:00', '15:30'].map((t, j) => `<div class="ps-slot"><span>${t}</span><em class="${j === 1 ? 'on' : ''}">${j === 1 ? 'Kiválasztva' : 'Kiválaszt'}</em></div>`).join('')}`,
    `${head}<div class="ps-fab"></div>${['Szálpróba', 'Színtartósság-teszt', 'Protokoll: bársony'].map(t => `<div class="ps-chk">${ic('check', 12)}${t}</div>`).join('')}<div class="ps-btn">Mehet a tisztítás</div>`,
    `${head}<div class="ps-ba"><span>előtte</span><span>utána</span></div><div class="ps-chk">${ic('check', 12)}Ápolási kártya átadva</div><div class="ps-pill">Száradás: 4–6 óra</div>`,
  ][i];
};

const css = T => `
html{scroll-behavior:smooth}
body{background:var(--paper)}
:root{--gold:#D8AE47;--gold-d:#C99D36;--grad:linear-gradient(90deg,#34462F,#25321F);--sh1:0 1px 4px rgba(45,60,41,.08),0 0 1px rgba(45,60,41,.25);--sh2:0 4px 11px rgba(45,60,41,.16),0 5px 24px rgba(45,60,41,.12);--r-xl:calc(var(--r-lg) + 10px)}
.h-m{font:var(--w-head-headline,400) 40px/1.1 var(--f-head);letter-spacing:-.02em;margin:0}
@media(max-width:48rem){.h-m{font-size:32px}}
.ctr{text-align:center}
.ul{position:relative;white-space:nowrap}
.ul::after{content:"";position:absolute;left:-3%;right:-3%;bottom:-.2em;height:.36em;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 14' preserveAspectRatio='none'%3E%3Cpath d='M2 9C30 3 75 2 118 6M14 12C45 8 80 8 104 10' fill='none' stroke='%237E8772' stroke-width='3' stroke-linecap='round'/%3E%3C/svg%3E") center/100% 100% no-repeat}
.ill{display:block;width:100%;height:auto}
/* ── 1 · Fejléc (Fixter: lila, sticky, menü lenyílóval, telefon, sárga CTA) */
header.fx{position:sticky;top:0;z-index:40;background:var(--grad);color:var(--cm)}
header.fx .wrap{display:flex;align-items:center;gap:28px;height:80px}
header.fx .logo,header.fx .lockup{color:var(--cm)}
.mn{display:flex;gap:26px;font:600 15px/1 var(--sans)}
.mn>a,.mn>.dd>a{display:inline-flex;align-items:center;gap:4px;text-decoration:none;padding:8px 0}
.mn a:hover{text-decoration:underline;text-underline-offset:6px}
.dd{position:relative}
.dd-m{display:none;position:absolute;top:100%;left:-18px;min-width:250px;background:#fff;color:var(--mv);border-radius:12px;box-shadow:var(--sh2);padding:8px}
.dd-m a{display:block;padding:10px 12px;border-radius:8px;text-decoration:none;font:500 15px/1.3 var(--sans)}
.dd-m a:hover{background:var(--cm);text-decoration:none}
.dd:hover .dd-m,.dd:focus-within .dd-m{display:block}
.nr{margin-left:auto;display:flex;align-items:center;gap:24px}
.tl{display:flex;align-items:center;gap:8px;text-decoration:none;font:600 15px/1 var(--sans)}
.cta{display:inline-flex;align-items:center;gap:12px;background:var(--cm);color:var(--mv);border-radius:999px;padding:5px 5px 5px 20px;text-decoration:none;font:600 14px/1 var(--sans);box-shadow:var(--sh2)}
.cta .cc{width:34px;height:34px;border-radius:50%;background:var(--mv);color:var(--cm);display:grid;place-items:center}
.cta.dk{background:var(--mv);color:var(--cm)}.cta.dk .cc{background:var(--cm);color:var(--mv)}
/* Fő gomb (CTA): elütő arany, hogy ne olvadjon bele a zöld–krém környezetbe (2026-10-19) */
.cta,.cta.dk{background:var(--gold);color:var(--mv)}.cta .cc,.cta.dk .cc{background:var(--mv);color:var(--gold)}.cta:hover{background:var(--gold-d)}
/* Süti-ablak (ugyanaz, mint a kalkulátorban): kicsi, nem takarja el az oldalt */
.ckb{position:fixed;z-index:60;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));max-width:420px;background:#fff;color:var(--mv);border-radius:18px;box-shadow:0 10px 40px rgba(29,38,26,.28),0 0 0 1px rgba(45,60,41,.08);padding:18px 18px 16px;font:400 14px/1.55 var(--sans);animation:ckIn .35s ease}
.ckb[hidden]{display:none}
.ckb-t{font:400 22px/1.2 var(--f-head);letter-spacing:-.015em;margin:0 0 6px}
.ckb p{margin:0}.ckb details{margin-top:8px;color:var(--muted);font-size:13px}
.ckb summary{cursor:pointer;font-weight:600;color:var(--mv);text-decoration:underline;text-underline-offset:3px;list-style:none;display:inline}.ckb summary::-webkit-details-marker{display:none}
.ckb ul{margin:8px 0 0;padding-left:1.1em}.ckb li+li{margin-top:4px}
.ckb-a{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}
.ckb-a button{flex:1 1 140px;min-height:44px;border-radius:999px;font:600 14px/1.2 var(--sans);cursor:pointer;padding:10px 16px}
.ckb .y{background:var(--gold);color:var(--mv);border:0;box-shadow:0 6px 18px rgba(216,174,71,.45)}.ckb .n{background:transparent;color:var(--mv);border:1.5px solid var(--mv)}
@keyframes ckIn{from{transform:translateY(16px);opacity:0}}
@media(min-width:961px){.ckb{left:24px;right:auto;bottom:24px}}
@media(max-width:960px){.ckb{bottom:calc(92px + env(safe-area-inset-bottom,0px))}}
@media(prefers-reduced-motion:reduce){.ckb{animation:none}}
.ckset{background:none;border:0;padding:0;color:inherit;font:inherit;text-decoration:underline;text-underline-offset:3px;cursor:pointer}
/* WhatsApp (2026-10-19): halk link a hero-ban; a segítség-kártyán és a mobil sávban gomb */
.hwa{margin:20px 0 0;text-align:center}.hwa a{display:inline-flex;align-items:center;gap:10px;color:var(--cm);font:600 15px/1.35 var(--sans);text-decoration:none;padding:10px 18px;border-radius:999px;border:1.5px solid rgba(240,237,229,.5);transition:background .2s}.hwa a:hover{background:rgba(240,237,229,.12)}
#mt{display:none}.bg{display:none;cursor:pointer;color:var(--cm)}
.callc{display:none}
@media(max-width:960px){.mn,.tl,.nr .cta{display:none}.bg{display:grid}
 .callc{display:inline-flex;align-items:center;gap:8px;font:600 14px/1 var(--sans);text-decoration:none}
 .callc span{width:34px;height:34px;border-radius:50%;background:var(--cm);color:var(--mv);display:grid;place-items:center}
 header.fx .wrap{height:64px}
 #mt:checked~.mn{display:flex;position:absolute;left:0;right:0;top:64px;flex-direction:column;gap:6px;background:#25321F;padding:12px 21px 24px}
 #mt:checked~.mn .dd-m{display:block;position:static;background:transparent;color:var(--cm);box-shadow:none;padding:0 0 0 12px;min-width:0}}
/* ── 2 · Akciósáv (Fixter: piros sáv a fejléc alatt) */
.promo{background:var(--fog);color:var(--mv);display:flex;justify-content:center;align-items:center;gap:10px;min-height:64px;padding:10px 21px;text-align:center;font:600 19px/1.3 var(--sans)}
@media(max-width:48rem){.promo{font-size:14px;min-height:48px}}
/* ── 3 · Hero + szolgáltatásválasztó (Fixter: ServiceCards) */
/* Hero-kép (Tomi, 2026-10-17): forrás A_kefe/out/1_v_tak_muv.png → 08_Brand_OS/kepek/ (webre kicsinyítve) */
.hero{position:relative;overflow:hidden;color:var(--cm);padding:96px 0 60px;min-height:620px;background:#2F3B2A url(../kepek/hero_asztali.jpg) center/cover no-repeat;background-image:image-set(url(../kepek/hero_asztali.webp) type("image/webp"),url(../kepek/hero_asztali.jpg) type("image/jpeg"))}
/* Telefonon Tomi 4 sarokeleme (A_kefe/out/szoveg nelkul_mobil_kep.png-ből kivágva, átlátszó háttér) – egyenként a hero sarkaihoz rögzítve,
   így bármilyen magas telefonon a helyükön maradnak; szorzó keveréssel olvadnak a zöldbe. Méret a 382 px-es minta arányában (vw), felülről korlátozva. */
.mc{display:none}
@media(max-width:960px){.hero{min-height:0;background:var(--grad)}
 .mc{display:block;position:absolute;inset:0;z-index:0;pointer-events:none;mix-blend-mode:multiply;opacity:.8}
 .mc picture{position:absolute;display:block}.mc img{display:block;width:100%;height:auto}
 .mc .k{left:0;top:0;width:min(34vw,190px)}
 .mc .g{right:0;top:min(12vw,66px);width:min(23vw,130px)}
 .mc .s{left:0;bottom:0;width:min(34vw,190px)}
 .mc .a{right:min(11vw,60px);bottom:0;width:min(25vw,140px)}}
.hero-c{position:relative;z-index:2;max-width:620px;margin:0 auto;text-align:center}
.hero h1{color:var(--cm);margin:0 auto 44px;max-width:600px}
.hq{font:600 18px/1.35 var(--sans);margin:0 0 14px}
.pk{display:grid;grid-template-columns:1fr 1fr;gap:16px 20px;text-align:left}
.pk a{display:flex;align-items:center;gap:12px;background:#fff;color:var(--mv);border-radius:56px;padding:12px 16px 12px 12px;min-height:72px;text-decoration:none;box-shadow:var(--sh1);transition:transform .15s,box-shadow .15s}
.pk a:hover{transform:translateY(-2px);box-shadow:var(--sh2)}
.pk .ci{flex:none;width:48px;height:48px;border-radius:50%;display:grid;place-items:center}
.pk b{display:block;font:600 18px/1.3 var(--sans)}
.pk small{display:block;font:400 14px/1.4 var(--sans);color:var(--muted)}
.pk .go{margin-left:auto;flex:none}
.tr{display:flex;justify-content:center;align-items:stretch;margin-top:30px;text-align:left}
.tr>div{display:flex;align-items:center;gap:10px;padding:14px 28px}
.tr>div+div{border-left:1px solid rgba(240,237,229,.35)}
.tr b{display:block;font:600 15px/1.3 var(--sans)}.tr small{display:block;font:400 13px/1.4 var(--sans);color:#D9D4C7}
.gl{position:absolute;z-index:3;right:40px;top:262px;transform:rotate(6deg);background:var(--cm);color:var(--mv);border-radius:8px;padding:12px 16px 12px 12px;box-shadow:var(--sh2);display:flex;align-items:center;gap:10px;text-align:left}
.gl .ck{width:30px;height:30px;border-radius:50%;background:var(--mv);color:var(--cm);display:grid;place-items:center;flex:none}
.gl b{display:block;font:600 16px/1.2 var(--sans)}.gl span{display:block;font:400 18px/1.2 var(--f-accent)}
@media(max-width:1180px){.gl{right:12px}}
@media(max-width:960px){.gl{position:relative;top:auto;right:auto;width:max-content;max-width:calc(100% - 42px);margin:0 auto 22px;transform:rotate(-3deg)}.hero{padding-top:32px}}
@media(max-width:640px){.pk{grid-template-columns:1fr;gap:12px}.tr{flex-direction:column;align-items:center}.tr>div{padding:10px 0}.tr>div+div{border-left:0;border-top:1px solid rgba(240,237,229,.35)}}
/* ── 4 · Miért a Deeply? (Fixter: WhyFixter) */
.why{position:relative;padding:40px 0 96px;background:var(--paper)}
.why .h-m{max-width:760px;margin:0 auto}
.wtag{display:none;align-items:center;gap:8px;margin:0 auto 14px;background:var(--mv);color:var(--cm);border-radius:8px;padding:4px 12px 4px 4px;font:700 13px/1 var(--sans);letter-spacing:.06em;text-transform:uppercase;width:max-content}
.wtag .m{width:26px;height:26px;border-radius:6px;background:var(--cm);color:var(--mv);display:grid;place-items:center}
.usp{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;margin-top:48px}
.usp>div{background:var(--cm);border-radius:var(--r-xl);padding:28px 24px 30px;text-align:center}
.cic{width:48px;height:48px;border-radius:50%;margin:0 auto 16px;display:grid;place-items:center;color:var(--cm);background:linear-gradient(143deg,#4A5E44 22%,#1F2A1C 116%);box-shadow:var(--sh1)}
.usp h3{font:600 16px/1.35 var(--sans);margin:0 0 8px}
.usp p{font:400 15px/1.6 var(--sans);color:var(--muted);margin:0}
.w-ill{position:absolute;right:max(16px,calc(50% - 640px));bottom:-56px;width:200px;z-index:2}
@media(max-width:1100px){.usp{grid-template-columns:1fr 1fr}.w-ill{display:none}}
@media(max-width:640px){.wtag{display:flex}.usp{grid-template-columns:1fr;gap:0;background:var(--cm);border-radius:var(--r-xl);padding:12px 0}.usp>div{background:transparent;padding:22px 20px}}
/* ── 5 · Így dolgozunk – egylapos lapozó (Fixter: HowItWorks carousel) */
.how{padding:56px 0 40px;background:var(--paper)}
.how .tg{font:400 18px/1.5 var(--sans);margin:12px 0 0}
.hw{position:relative;margin-top:24px}
.hw-t{position:relative;display:flex;gap:56px;overflow-x:auto;scroll-snap-type:x mandatory;padding:56px max(21px,calc(50% - 379px)) 28px;scrollbar-width:none}
.hw-t::-webkit-scrollbar{display:none}
.st{flex:0 0 min(758px,calc(100vw - 42px));scroll-snap-align:center;display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:center;transition:opacity .3s}
.st:not(.on){opacity:.35}
.no{width:48px;height:46px;border-radius:15px;box-shadow:inset 0 0 0 3px var(--mv);display:grid;place-items:center;font:600 28px/1 var(--sans);margin-bottom:20px}
.st h3{margin:0 0 14px}
.st p{font:400 17px/1.6 var(--sans);color:var(--muted);margin:0}
.pn{position:relative;height:300px;border-radius:var(--r-xl);background:var(--c);clip-path:inset(-80px 0 0 0 round var(--r-xl))}
.ph{position:absolute;left:50%;top:-44px;transform:translateX(-50%);width:200px;height:400px;background:#fff;border:7px solid #1E281B;border-radius:32px;padding:14px 12px;box-shadow:0 18px 40px -16px rgba(0,0,0,.45);font:500 10px/1.3 var(--sans);color:var(--mv);display:flex;flex-direction:column;gap:7px;overflow:hidden}
.ph::before{content:"";position:absolute;top:5px;left:50%;transform:translateX(-50%);width:54px;height:12px;border-radius:8px;background:#1E281B}
.ps-top{display:flex;align-items:center;gap:6px;font:700 10px/1 var(--sans);margin-top:8px}.ps-top i{margin-left:auto;width:14px;height:2px;background:var(--mv);box-shadow:0 4px 0 var(--mv),0 -4px 0 var(--mv)}
.ps-logo{width:16px;height:16px;border-radius:4px;background:var(--mv)}
.ps-h{font:400 17px/1.15 var(--f-head);text-align:center;margin:6px 0 4px}
.ps-row{display:flex;align-items:center;gap:8px;padding:6px 8px;border:1.5px solid var(--line);border-radius:10px;font-weight:600}
.ps-row.on{border-color:var(--mv)}
.ps-ic{width:22px;height:22px;border-radius:50%;display:grid;place-items:center}
.ps-up{display:flex;align-items:center;justify-content:center;gap:6px;border:1.5px dashed var(--wt);border-radius:10px;padding:10px;color:var(--muted)}
.ps-btn{margin-top:auto;background:var(--mv);color:var(--cm);border-radius:999px;text-align:center;padding:9px;font-weight:600}
.ps-note{display:flex;align-items:center;gap:6px;background:var(--cm);border-radius:10px;padding:7px 8px;font-weight:600;margin-top:10px;box-shadow:var(--sh1)}
.ps-days{display:flex;justify-content:space-between;text-align:center;color:var(--muted)}
.ps-days span{display:grid;gap:3px;font-size:9px}.ps-days b{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;color:var(--mv)}
.ps-days .on b{background:var(--mv);color:var(--cm)}
.ps-slot{display:flex;justify-content:space-between;align-items:center;padding:6px 2px;border-bottom:1px solid var(--line)}
.ps-slot em{font-style:normal;font-weight:600;background:var(--cm);border-radius:999px;padding:4px 9px}.ps-slot em.on{background:var(--mv);color:var(--cm)}
.ps-fab{height:96px;border-radius:12px;background:repeating-linear-gradient(45deg,#7E8772 0 6px,#8C957F 6px 12px);position:relative}
.ps-fab::after{content:"";position:absolute;right:14px;bottom:14px;width:34px;height:34px;border-radius:50%;background:rgba(240,237,229,.85);box-shadow:0 0 0 3px #fff}
.ps-chk{display:flex;align-items:center;gap:6px;font-weight:600}.ps-chk svg{background:var(--mg);color:#fff;border-radius:50%;padding:2px}
.ps-ba{display:grid;grid-template-columns:1fr 1fr;height:150px;border-radius:12px;overflow:hidden}
.ps-ba span{display:grid;place-items:end start;padding:6px;font-weight:600;color:#fff;background:#8A7F6D}.ps-ba span+span{background:#D9D1C1;color:var(--mv)}
.ps-pill{align-self:center;background:var(--cm);border-radius:999px;padding:6px 12px;font-weight:600}
.cf{position:absolute;inset:0;pointer-events:none}
.cf i{position:absolute;width:10px;height:10px;border-radius:2px}
.hw-a{position:absolute;top:calc(50% + 14px);transform:translateY(-50%);z-index:3;width:56px;height:56px;border-radius:50%;border:0;background:#fff;color:var(--mv);box-shadow:var(--sh2);display:grid;place-items:center;cursor:pointer}
.hw-a.nx{right:max(12px,calc(50% - 470px))}.hw-a.pv{left:max(12px,calc(50% - 470px))}.hw-a.pv svg{transform:scaleX(-1)}
.hw-a[hidden]{display:none}
.dt{display:flex;justify-content:center;gap:6px}
.dt i{width:8px;height:6px;border-radius:3px;background:var(--line);transition:width .2s}.dt i.on{width:32px;background:var(--mg)}
/* Súgósor a lapozó fölött – csak mobilon látszik (asztalin ott vannak a nagy nyilak) */
.hw-hint{display:none;align-items:center;justify-content:center;gap:10px;margin:18px auto 0;font:500 14px/1 var(--sans);color:var(--muted)}
.hw-hint b{background:var(--mv);color:var(--cm);border-radius:999px;padding:6px 11px;font:600 12px/1 var(--sans);letter-spacing:.04em;font-variant-numeric:tabular-nums}
.hw-hint i{display:inline-grid;color:var(--mv);animation:hwSw 1.6s ease-in-out infinite}
.hw-hint span,.hw-hint i{transition:opacity .4s}.hw-hint.done span,.hw-hint.done i{opacity:0}
@keyframes hwSw{0%,100%{transform:translateX(0)}50%{transform:translateX(7px)}}
/* Egyszeri rámutatás: a lapok egy pillanatra balra csúsznak, hogy látsszon a következő */
.hw-t.nudge .st{animation:hwNg 1.5s cubic-bezier(.45,0,.2,1)}
@keyframes hwNg{0%,100%{transform:none}38%{transform:translateX(-64px)}72%{transform:translateX(5px)}}
@media(prefers-reduced-motion:reduce){.hw-hint i,.hw-t.nudge .st{animation:none}}
/* Mobil: a lap keskenyebb a képernyőnél, így jobb oldalt kilóg a következő; a nyilak a kép közepén maradnak */
@media(max-width:760px){.hw-t{gap:14px;padding:64px 21px 24px}.st{flex-basis:calc(100vw - 72px);grid-template-columns:1fr;gap:24px}.pn{order:-1;height:250px}.ph{width:170px;height:340px;top:-48px}
 .hw-a{width:44px;height:44px;top:189px}.hw-a.nx{right:8px}.hw-a.pv{left:8px}.st:not(.on){opacity:.55}.hw-hint{display:flex}}
/* ── 6 · Legnépszerűbb szolgáltatásaink (Fixter: OurServices) */
.svs{padding:40px 0 64px;background:var(--paper)}
.ld{display:flex;align-items:center;gap:0;margin-bottom:24px}
.ld::before,.ld::after{content:"";flex:1;height:1px;background:var(--line)}
.ld span{width:56px;height:56px;border-radius:12px;background:var(--mv);color:var(--cm);display:grid;place-items:center}
.svs h2{text-align:center}
.sg{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;margin-top:40px}
.sv{background:#fff;border-radius:var(--r-lg);box-shadow:var(--sh1);overflow:hidden;text-align:center;padding:0 16px 24px;display:flex;flex-direction:column;align-items:center;text-decoration:none;color:var(--mv);transition:transform .15s,box-shadow .15s}
.sv:hover{transform:translateY(-3px);box-shadow:var(--sh2)}
.sv::before{content:"";align-self:stretch;height:8px;margin:0 -16px 24px;background:var(--c)}
.sv .ci{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;margin-bottom:14px}
.sv h3{font:var(--w-head-subheading,400) 26px/1.18 var(--f-head);letter-spacing:-.015em;margin:0 0 4px}
.sv small{font:400 14px/1.4 var(--sans);color:var(--muted);margin-bottom:18px}
.sv .gb{display:inline-flex;align-items:center;gap:8px;font:600 16px/1 var(--sans);margin-top:auto}
@media(max-width:900px){.sg{grid-template-columns:1fr 1fr;gap:16px}}
@media(max-width:640px){.sv .gb span{display:none}.sv small{margin-bottom:12px}.sv h3{font-size:22px}}
/* ── 7 · Vélemények – középre igazított csúszka (Fixter: ReviewsCarousel) */
.tint{background:var(--cm)}
.rvs{padding:64px 0 48px}
.rvs h2{font:600 22px/1.3 var(--sans);text-align:center;margin:0}
.rvn{display:flex;justify-content:center;align-items:center;gap:8px;margin-top:10px;font:400 14px/1.4 var(--sans);color:var(--muted);text-align:center}
.rv-t{display:flex;gap:24px;overflow-x:auto;scroll-snap-type:x mandatory;padding:36px 56px 8px;scrollbar-width:none}
.rv-t::-webkit-scrollbar{display:none}
.rv{flex:0 0 310px;scroll-snap-align:center;background:#fff;border-radius:var(--r-lg);padding:24px 22px;min-height:330px;display:flex;flex-direction:column;margin:0;box-shadow:var(--sh1)}
.stars{display:flex;gap:2px;margin-bottom:14px}.stars span{width:22px;height:22px;display:grid;place-items:center;background:var(--mg);color:#fff}
.rv .mt{align-self:flex-start;font:600 11px/1 var(--sans);letter-spacing:.06em;text-transform:uppercase;border:1.5px solid var(--wt);color:var(--muted);border-radius:999px;padding:4px 8px;margin-left:auto;margin-top:-34px;margin-bottom:16px}
.rv h3{font:600 20px/1.3 var(--sans);margin:0 0 12px}
.rv p{font:400 15px/1.6 var(--sans);margin:0;flex:1}
.rv figcaption{font:700 14px/1.3 var(--sans);text-transform:none;letter-spacing:0;margin-top:18px}
.rv-c{display:flex;justify-content:flex-end;gap:12px;padding:12px 56px 0}
.rv-c button{width:44px;height:44px;border-radius:50%;border:0;background:#fff;color:var(--mv);box-shadow:var(--sh1);display:grid;place-items:center;cursor:pointer}
.rv-c button:first-child svg{transform:scaleX(-1)}
@media(max-width:640px){.rv-t{padding:28px 21px 8px;gap:14px}.rv{flex-basis:258px;min-height:300px}.rv-c{padding:12px 21px 0}}
/* ── 8 · Segítség-kártya (Fixter: CalloutCard „Need a hand…”) */
.hlp{padding:24px 0 64px}
.hc{position:relative;overflow:hidden;background:linear-gradient(135deg,#3A4E35,#2D3C29 60%);color:var(--cm);border-radius:var(--r-xl);padding:64px 48px 56px}
.hc h2{color:var(--cm);text-align:center;max-width:560px;margin:0 auto 48px;position:relative;z-index:2}
.hc-r{position:relative;z-index:2;display:flex;justify-content:space-between;align-items:center;gap:32px;padding:0 0 0 2%}
.hc-r p{font:600 16px/1.5 var(--sans);max-width:340px;margin:0}
.hc-b{display:flex;flex-direction:column;align-items:center;gap:20px}
.big{display:inline-flex;align-items:center;gap:48px;background:var(--cm);color:var(--mv);border-radius:999px;padding:8px 8px 8px 28px;text-decoration:none;font:600 20px/1 var(--sans);box-shadow:0 0 0 6px rgba(240,237,229,.14),0 10px 30px rgba(0,0,0,.25)}
.big span{width:56px;height:56px;border-radius:50%;background:#1E281B;color:var(--cm);display:grid;place-items:center}
.big small{font:500 12px/1 var(--sans);opacity:.7;margin-left:-40px}
.sm{display:inline-flex;align-items:center;gap:10px;font:600 16px/1 var(--sans);text-decoration:none;color:var(--cm)}
.sm span{width:34px;height:34px;border-radius:50%;background:var(--cm);color:var(--mv);display:grid;place-items:center}
.road{position:absolute;left:0;right:0;top:118px;width:100%;height:260px;z-index:1}
@media(max-width:760px){.hc{padding:48px 22px 40px}.hc h2{margin-bottom:28px}.hc-r{flex-direction:column;text-align:center;padding:0}.big{gap:18px;font-size:18px;padding-left:22px}.big small{display:none}}
/* ── 9 · GYIK – oldalt cím, jobbra lenyíló kártyák (Fixter: SideBySideMediaAccordion) */
.fq{padding:16px 0 64px}
.fq-g{display:grid;grid-template-columns:5fr 1fr 6fr;align-items:start}
.fq-g h2{grid-column:1}.fq-g .ac{grid-column:3}
.ac details{background:#fff;border-radius:12px;border-top:1px solid var(--line);margin-bottom:16px}
.ac summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:16px;padding:18px 20px;font:600 18px/1.35 var(--sans)}
.ac summary::-webkit-details-marker{display:none}
.ac summary svg{flex:none;transition:transform .2s}.ac details[open] summary svg{transform:rotate(180deg)}
.ac details p{margin:0;padding:0 20px 20px;font:400 16px/1.6 var(--sans);color:var(--muted)}
.fm{background:#fff;border-radius:12px;padding:22px 20px;font:var(--w-head-subheading,400) 24px/1.25 var(--f-head)}
.fm a{text-decoration:underline;text-underline-offset:5px;text-decoration-thickness:2px;white-space:nowrap}
.fm svg{vertical-align:2px}
@media(max-width:900px){.fq-g{grid-template-columns:1fr;gap:28px}.fq-g h2,.fq-g .ac{grid-column:1}}
/* ── 10 · Akiknek dolgoztunk (Fixter: „As featured in”) */
.ft-in{padding:28px 0 36px;border-top:1px solid var(--line)}
.ft-in .wrap{display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap}
.ft-in b{font:var(--w-head-subheading,400) 26px/1.2 var(--f-head)}
.lg{width:170px;height:52px;border:1.5px dashed var(--wt);border-radius:8px;display:grid;place-items:center;padding:4px 8px;text-align:center;font:500 12px/1.25 var(--sans);letter-spacing:.02em;color:var(--muted)}
@media(max-width:760px){.ft-in .wrap{justify-content:center;text-align:center}.ft-in b{flex-basis:100%}.lg{width:44%}}
/* ── 11 · Linkblokk (Fixter: page_bottom – „Popular services” + „Garages near you”, CSS-es „Mutasd mind”) */
.pl{padding:40px 0 48px;background:var(--paper)}
.pl h2{font:600 22px/1.3 var(--sans);text-align:center;margin:0 0 22px}
.pl input{display:none}
.lk{display:grid;grid-template-columns:repeat(4,1fr);gap:14px 28px;padding:0 16px 22px;border-bottom:1px solid var(--line)}
.lk a{font:400 15px/1.45 var(--sans);color:var(--muted);text-decoration:none}.lk a:hover{color:var(--mv);text-decoration:underline}
.lk.cn a{text-align:center}
.lk .x{display:none}
.pl input:checked+.lk .x{display:block}
.more{display:block;width:max-content;margin:14px auto 0;font:600 16px/1.3 var(--sans);text-decoration:underline;text-underline-offset:4px;cursor:pointer}
.more .b{display:none}.pl input:checked~.more .a{display:none}.pl input:checked~.more .b{display:inline}
.pl .grp+.grp{margin-top:44px}
@media(max-width:760px){.lk{grid-template-columns:1fr 1fr;padding:0 4px 18px}}
/* ── 12 · Lábléc (Fixter: sötét, 4 oszlop, fizetési módok) */
footer.fo{background:linear-gradient(#34452F,#1C2619);color:var(--cm);padding:44px 0 28px}
.fo-g{display:grid;grid-template-columns:repeat(4,1fr);gap:32px}
.fo h3{font:600 16px/1.3 var(--sans);margin:0 0 12px}
.fo ul{list-style:none;margin:0;padding:0;display:grid;gap:9px}
.fo a{font:400 13px/1.4 var(--sans);color:#D9D4C7;text-decoration:none}.fo a:hover{color:var(--cm);text-decoration:underline}
.fo .logo,.fo .lockup{color:var(--cm);margin-bottom:24px}
.pay{display:flex;gap:8px;margin-top:10px}.pay span{background:var(--cm);color:var(--mv);border-radius:4px;padding:5px 9px;font:700 11px/1 var(--sans);letter-spacing:.03em}
.fo .bt{margin-top:36px;padding-top:18px;border-top:1px solid rgba(240,237,229,.18);display:flex;flex-wrap:wrap;gap:8px 24px;justify-content:space-between;font:400 12px/1.5 var(--sans);color:#C9C3B4}
@media(max-width:900px){.fo-g{grid-template-columns:1fr 1fr}}
/* Telefonon alul ragadó CTA (Fixter: „See Our Services” sáv) */
.mb{display:none}
@media(max-width:960px){.mb{display:block;position:fixed;left:0;right:0;bottom:0;z-index:45;background:#fff;padding:12px 16px;box-shadow:0 -2px 14px rgba(45,60,41,.12)}
 .mb .cta{display:flex;justify-content:space-between;width:100%;padding:6px 6px 6px 22px;font-size:16px}.mb .cta .cc{width:44px;height:44px}
 .mb{display:flex;gap:10px;align-items:center}.mb .cta{flex:1;min-width:0}
 .mb .wa{flex:none;width:56px;height:56px;border-radius:50%;background:var(--mv);color:var(--cm);display:grid;place-items:center;box-shadow:var(--sh1)}
 body{padding-bottom:80px}body .reftog{bottom:88px}}
`;

const parts = a => `${esc(a[0])}<span class="ul">${esc(a[1])}</span>${esc(a[2])}`;
const ci = (k, j, s = 24) => `<span class="ci" style="background:${SC[j][0]};color:${SC[j][1]}">${ic(k, s)}</span>`;
const CONF = Array.from({ length: 14 }, (_, i) => `<i style="left:${(i * 37) % 96}%;top:${(i * 53) % 88}%;background:${['#F0EDE5', '#7E8772', '#2D3C29', '#A0907F'][i % 4]};transform:rotate(${i * 29}deg)"></i>`).join('');
const toggle = (id, title, ref, items, more, refMore, center) => `<div class="grp"><h2${r(ref)}>${esc(title)}</h2>
  <input type="checkbox" id="${id}"><div class="lk${center ? ' cn' : ''}">${items.map((x, i) => `<a href="#"${i >= 8 ? ' class="x"' : ''}>${esc(x)}</a>`).join('')}</div>
  <label class="more" for="${id}"${r(refMore)}><span class="a">${esc(more[0])}</span><span class="b">${esc(more[1])}</span></label></div>`;

const body = T => `
<header class="fx"><div class="wrap">
  <a href="#" aria-label="Deeply főoldal">${T.logo(T.id === 'A_kefe' ? 150 : 170)}</a>
  <input type="checkbox" id="mt">
  <nav class="mn">
    <a href="#igy-dolgozunk"${r('fooldal.nav.0')}>${esc(F.nav[0])}</a>
    <div class="dd"><a href="#szolgaltatasok"${r('fooldal.nav.1')}>${esc(F.nav[1])} ${ic('chev', 16)}</a><div class="dd-m">${F.svc.map(([k, n]) => `<a href="${KALK}" data-pick="${k}">${esc(n)}</a>`).join('')}<a href="#szolgaltatasok" data-pick="b2b">Éttermeknek, irodáknak</a></div></div>
    <div class="dd"><a href="#ahol"${r('fooldal.nav.2')}>${esc(F.nav[2])} ${ic('chev', 16)}</a><div class="dd-m">${(F.areaNav || F.areas.slice(4, 8)).map(a => `<a href="#ahol">${esc(a)}</a>`).join('')}<a href="#ahol">${esc(F.areaMore[0])} →</a></div></div>
    <a href="#gyik"${r('fooldal.nav.3')}>${esc(F.nav[3])}</a>
  </nav>
  <div class="nr">
    <a class="tl" href="${TEL}">${ic('phone', 20)} ${C.PHONE}</a>
    <a class="cta" href="${KALK}"><span${r('fooldal.navCta')}>${esc(F.navCta)}</span><span class="cc">${ic('arrow', 18)}</span></a>
    <a class="callc" href="${TEL}"><b${r('fooldal.navCall')}>${esc(F.navCall)}</b><span>${ic('phone', 16)}</span></a>
    <label class="bg" for="mt" aria-label="Menü">${ic('menu', 28)}</label>
  </div>
</div></header>
<div class="promo"${r('fooldal.promo')}>${ic('tag', 22)}<span>${esc(F.promo)}</span></div>

<section class="hero">
  <div class="mc" aria-hidden="true"><picture class="k"><source srcset="../kepek/m_kanape.webp" type="image/webp"><img src="../kepek/m_kanape.png" alt=""></picture><picture class="g"><source srcset="../kepek/m_gep.webp" type="image/webp"><img src="../kepek/m_gep.png" alt=""></picture><picture class="s"><source srcset="../kepek/m_szonyeg.webp" type="image/webp"><img src="../kepek/m_szonyeg.png" alt=""></picture><picture class="a"><source srcset="../kepek/m_alak.webp" type="image/webp"><img src="../kepek/m_alak.png" alt=""></picture></div>
  <div class="gl"${r('fooldal.heroBadge')}><span class="ck">${ic('check', 18)}</span><span><b>${esc(F.heroBadge[0])}</b><span>${esc(F.heroBadge[1])}</span></span></div>
  <div class="wrap"><div class="hero-c">
    <h1${r('hero.h1')}>${esc(C.hero.h1)}</h1>
    <p class="hq"${r('fooldal.heroQ')}>${esc(F.heroQ)}</p>
    <div class="pk">${F.pick.map(([k, n, s], i) => `<a href="${KALK}" data-pick="${k}"${r('fooldal.pick.' + i)}>${ci(k, i)}<span><b>${esc(n)}</b><small>${esc(s)}</small></span><span class="go">${ic('arrowc', 28)}</span></a>`).join('')}</div>
    <p class="hwa"><a ${WA_A}>${ic('wa', 18)}<span${r('fooldal.waHero')}>${esc(F.waHero || 'Inkább fotót küldenél? Írj WhatsAppon')}</span></a></p>
    <div class="tr">${F.trust.map(([k, b, s], i) => `<div${r('fooldal.trust.' + i)}>${ic(k, 26)}<span><b>${esc(b)}</b><small>${esc(s)}</small></span></div>`).join('')}</div>
  </div></div>
</section>

<section class="why"><div class="wrap ctr">
  <div class="wtag"><span class="m">${T.mark(18)}</span><span${r('fooldal.whyTag')}>${esc(F.whyTag)}</span></div>
  <h2 class="h-m"${r('fooldal.uspTitle')}>${parts(F.uspTitle)}</h2>
  <div class="usp">${F.usp.map(([k, h, p], i) => `<div${r('fooldal.usp.' + i)}><div class="cic">${ic(k, 22)}</div><h3>${esc(h)}</h3><p>${esc(p)}</p></div>`).join('')}</div>
</div><div class="w-ill">${CHAIR}</div></section>

<section class="how" id="igy-dolgozunk">
  <div class="wrap ctr"><h2 class="h-m"${r('fooldal.howTitle')}>${esc(F.howTitle)}</h2><p class="tg"${r('fooldal.howSub')}>${parts(F.howSub)}</p></div>
  <div class="hw-hint" id="hwh" aria-hidden="true"><b id="hwc">1 / ${F.how.length}</b><span${r('fooldal.howHint')}>${esc(HOW_HINT)}</span><i>${ic('arrow', 18)}</i></div>
  <div class="hw">
    <div class="hw-t" id="hw">${F.how.map(([h, p], i) => `<article class="st${i ? '' : ' on'}"${r('fooldal.how.' + i)}><div><div class="no">${i + 1}</div><h3 class="t-sub">${esc(h)}</h3><p>${esc(p)}</p></div><div class="pn" style="--c:${HOW_COL[i]}">${i === 3 ? `<div class="cf">${CONF}</div>` : ''}<div class="ph">${screen(i)}</div></div></article>`).join('')}</div>
    <button class="hw-a pv" type="button" data-d="-1" aria-label="Előző lépés" hidden>${ic('arrow', 22)}</button><button class="hw-a nx" type="button" data-d="1" aria-label="Következő lépés">${ic('arrow', 22)}</button>
  </div>
  <div class="dt" id="hwd">${F.how.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div>
</section>

<section class="svs" id="szolgaltatasok"><div class="wrap">
  <div class="ld"><span>${T.mark(30)}</span></div>
  <h2 class="t-headline"${r('fooldal.svcTitle')}>${esc(F.svcTitle)}</h2>
  <div class="sg">${F.svc.map(([k, h, s], i) => `<a class="sv" href="${KALK}" data-pick="${k}" style="--c:${SC[i][0]}"${r('fooldal.svc.' + i)}>${ci(k, i)}<h3>${esc(h)}</h3><small>${esc(s)}</small><span class="gb"><span${i ? '' : r('fooldal.svcCta')}>${esc(F.svcCta)}</span>${ic('arrowc', 24)}</span></a>`).join('')}</div>
</div></section>

<div class="tint">
<section class="rvs" id="velemenyek">
  <div class="wrap"><h2${r('fooldal.revTitle')}>${esc(F.revTitle)}</h2><p class="rvn"${r('fooldal.revNote')}>${esc(F.revNote)}</p></div>
  <div class="wrap" style="padding:0"><div class="rv-t" id="rv">${F.rev.map(([h, p, w], i) => `<figure class="rv"${r('fooldal.rev.' + i)}><div class="stars">${STAR.repeat(5).replace(/<svg/g, '<span><svg').replace(/<\/svg>/g, '</svg></span>')}</div><span class="mt">Minta</span><h3>${esc(h)}</h3><p>${esc(p)}</p><figcaption>${esc(w)}</figcaption></figure>`).join('')}</div>
  <div class="rv-c"><button type="button" data-d="-1" aria-label="Előző vélemény">${ic('arrow', 18)}</button><button type="button" data-d="1" aria-label="Következő vélemény">${ic('arrow', 18)}</button></div></div>
</section>

<section class="hlp"><div class="wrap"><div class="hc">
  <svg class="road" viewBox="0 0 1100 260" preserveAspectRatio="none" aria-hidden="true"><g fill="none" stroke="rgba(240,237,229,.13)" stroke-width="16"><path d="M-10 30H760q60 0 90 50l90 190"/><path d="M-10 70H735q40 0 62 36l84 164"/></g></svg>
  <h2 class="h-m"${r('fooldal.helpTitle')}>${esc(F.helpTitle)}</h2>
  <div class="hc-r"><p${r('fooldal.helpText')}>${esc(F.helpText)}</p>
    <div class="hc-b"><a class="big" href="${TEL}">${C.PHONE} <small>minta</small><span>${ic('phone', 24)}</span></a><a class="sm" ${WA_A}><b${r('fooldal.helpWa')}>${esc(F.helpWa || 'Fotó küldése WhatsAppon')}</b><span>${ic('wa', 18)}</span></a><a class="sm" href="mailto:${C.MAIL}"><b${r('fooldal.helpMail')}>${esc(F.helpMail)}</b><span>${ic('mail', 18)}</span></a></div>
  </div>
</div></div></section>

<section class="fq" id="gyik"><div class="wrap fq-g">
  <h2 class="t-headline"${r('fooldal.faqTitle')}>${esc(F.faqTitle)}</h2>
  <div class="ac">${F.faq.map(([q, a], i) => `<details${r('fooldal.faq.' + i)}><summary>${esc(q)}${ic('chev', 22)}</summary><p>${esc(a)}</p></details>`).join('')}
    <div class="fm"${r('fooldal.faqMore')}>${esc(F.faqMore[0])} <a href="mailto:${C.MAIL}">${esc(F.faqMore[1])}${ic('ext', 18)}</a></div></div>
</div></section>

<section class="ft-in"><div class="wrap"><b${r('fooldal.featTitle')}>${esc(F.featTitle)}</b>${[0, 1, 2].map(i => `<span class="lg"${i ? '' : r('fooldal.featNote')}>${esc(F.featNote)}</span>`).join('')}</div></section>
</div>

<section class="pl" id="ahol"><div class="wrap">
  ${toggle('m1', F.linksTitle, 'fooldal.linksTitle', F.links, F.linksMore, 'fooldal.linksMore', false)}
  ${toggle('m2', F.areaTitle, 'fooldal.areaTitle', F.areas, F.areaMore, 'fooldal.areaMore', true)}
</div></section>

<footer class="fo"><div class="wrap">
  <div class="fo-g">
    ${F.footCols.map(([h, l], i) => `<div${r('fooldal.footCols.' + i)}><h3>${esc(h)}</h3><ul>${l.map(x => `<li><a href="${x === 'Árkalkulátor' ? KALK : '#'}">${esc(x)}</a></li>`).join('')}</ul></div>`).join('')}
    <div>${T.logo(T.id === 'A_kefe' ? 170 : 190)}<h3${r('fooldal.footPay')}>${esc(F.footPay[0])}</h3><div class="pay">${F.footPay[1].map(x => `<span>${esc(x)}</span>`).join('')}</div></div>
  </div>
  <div class="bt"><span>© 2026 Deeply – Kárpit és szőnyegtisztítás · Budapest és környéke</span><span>Javító garancia: ${C.GARANCIA}</span><span>${C.PHONE} · ${C.MAIL} (minta)</span><button type="button" class="ckset" id="ckS">${esc(CK.settings)}</button></div>
</div></footer>
<div class="mb"><a class="cta dk" href="${KALK}"><span${r('fooldal.mobileCta')}>${esc(F.mobileCta)}</span><span class="cc">${ic('arrow', 20)}</span></a><a class="wa" ${WA_A} aria-label="Írj nekünk WhatsAppon">${ic('wa', 26)}</a></div>
<div class="ckb" id="ckb" role="dialog" aria-labelledby="ckbT" hidden>
  <p class="ckb-t" id="ckbT"${r('fooldal.cookie.title')}>${esc(CK.title)}</p>
  <p${r('fooldal.cookie.text')}>${esc(CK.text)}</p>
  <details><summary>${esc(CK.more)}</summary><ul>${CK.list.map(x => `<li>${esc(x)}</li>`).join('')}</ul></details>
  <div class="ckb-a"><button type="button" class="y" id="ckY">${esc(CK.yes)}</button><button type="button" class="n" id="ckN">${esc(CK.no)}</button></div>
</div>
<script>
(function(){
var t=document.getElementById('hw'),st=t.querySelectorAll('.st'),d=document.querySelectorAll('#hwd i'),pv=document.querySelector('.hw-a.pv'),nx=document.querySelector('.hw-a.nx'),cur=0;
var hh=document.getElementById('hwh'),hc=document.getElementById('hwc'),moved=false;
/* Mire kattintott a látogató? Csak ebben a megnyitásban, tárolás (süti) nélkül – a kalkulátor-link viszi tovább az URL-ben,
   a kalkulátor pedig csak a hozzájárulás után jegyzi meg. pick: az utolsó választott szolgáltatás · int: minden, ami érdekelte ·
   faq: a kinyitott GYIK-kérdések sorszáma · how: hány lépést nézett meg az „Így dolgozunk”-ból · from: melyik gombbal indult */
var V={pick:'',int:[],faq:[],how:0};
function add(a,x){if(a.indexOf(x)<0)a.push(x)}
function seen(){if(moved)return;moved=true;if(hh)hh.classList.add('done')}
function set(i){cur=i;st.forEach(function(s,j){s.classList.toggle('on',j===i)});d.forEach(function(x,j){x.classList.toggle('on',j===i)});pv.hidden=i===0;nx.hidden=i===st.length-1;
 if(hc)hc.textContent=(i+1)+' / '+st.length;if(i>V.how)V.how=i;if(i)seen()}
function go(i){i=Math.max(0,Math.min(st.length-1,i));set(i);t.scrollTo({left:st[i].offsetLeft-(t.clientWidth-st[i].offsetWidth)/2,behavior:'smooth'})}
pv.onclick=function(){seen();go(cur-1)};nx.onclick=function(){seen();go(cur+1)};
/* Mobilon egyszer, amikor a lapozó először bejön a képbe (és még senki nem lapozott), a lapok egy pillanatra oldalra csúsznak. */
if('IntersectionObserver' in window&&window.matchMedia&&matchMedia('(max-width:760px)').matches&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
 var io=new IntersectionObserver(function(e){if(!e[0].isIntersecting)return;io.disconnect();
  setTimeout(function(){if(moved||cur)return;t.classList.add('nudge');setTimeout(function(){t.classList.remove('nudge')},1600)},450)},{threshold:.5});
 io.observe(t)}
d.forEach(function(x,j){x.onclick=function(){go(j)}});
t.addEventListener('scroll',function(){if(t.scrollLeft>24)seen();var c=t.scrollLeft+t.clientWidth/2,b=0,m=1e9;st.forEach(function(s,j){var k=Math.abs(s.offsetLeft+s.offsetWidth/2-c);if(k<m){m=k;b=j}});if(b!==cur)set(b)},{passive:true});
var rv=document.getElementById('rv'),rc=rv.querySelector('.rv');
rv.scrollLeft=rc.offsetWidth*.55;
document.querySelectorAll('.rv-c button').forEach(function(b){b.onclick=function(){rv.scrollBy({left:(+b.dataset.d)*(rc.offsetWidth+24),behavior:'smooth'})}});
document.querySelectorAll('.mn a').forEach(function(a){a.addEventListener('click',function(){document.getElementById('mt').checked=false})});
/* Süti-ablak – ugyanaz, mint a kalkulátorban (deeply_ck_v1, verzió 2026-10-19). Elfogadás után a kattintás-emlékezet a böngészőben
   marad (deeply_web_v1); a kalkulátor-link ?ck=<elfogadás ideje>-<kattintás ideje> paraméterrel viszi át a döntést, mert a kalkulátor
   másik domainen fut. „Csak a szükségesek” → ck=0, és semmit nem jegyzünk meg. */
var CKV='2026-10-19',CKK='deeply_ck_v1',WK='deeply_web_v1',ck=null,cb=document.getElementById('ckb');
try{ck=JSON.parse(localStorage.getItem(CKK)||'null');if(ck&&ck.v!==CKV)ck=null}catch(e){}
function saveV(){if(ck&&ck.ok)try{localStorage.setItem(WK,JSON.stringify(V))}catch(e){}}
function ckSave(ok){ck={ok:ok,at:Date.now(),v:CKV};try{localStorage.setItem(CKK,JSON.stringify(ck));if(ok)saveV();else localStorage.removeItem(WK)}catch(e){}cb.hidden=true}
if(ck&&ck.ok){try{var o=JSON.parse(localStorage.getItem(WK)||'null');if(o){V.pick=o.pick||'';V.int=o.int||[];V.faq=o.faq||[];V.how=Math.max(V.how,o.how||0)}}catch(e){}}
if(!ck)setTimeout(function(){cb.hidden=false},700);
document.getElementById('ckY').onclick=function(){ckSave(true)};document.getElementById('ckN').onclick=function(){ckSave(false)};
document.getElementById('ckS').onclick=function(){cb.hidden=false};
document.querySelectorAll('.ac details').forEach(function(x,j){x.addEventListener('toggle',function(){if(x.open){add(V.faq,j);saveV()}})});
var K='${C.KALK}';
var WAN=${JSON.stringify(Object.fromEntries(F.pick.map(([k, n]) => [k, n])))};
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a');if(!a)return;
 var p=a.getAttribute('data-pick');if(p){V.pick=p;add(V.int,p);saveV()}
 if(a.hasAttribute('data-wa')){var n=WAN[V.pick];a.href='https://wa.me/${WA_NUM}?text='+encodeURIComponent('Szia! '+(n?n+'tisztításról érdeklődnék. ':'')+'Küldök egy fotót a foltról – mennyibe kerülne?');return}
 if(a.href.indexOf(K)!==0)return;
 try{var u=new URL(a.href),q=u.searchParams;
  if(V.pick)q.set('pick',V.pick);if(V.int.length)q.set('int',V.int.join('.'));if(V.faq.length)q.set('faq',V.faq.join('.'));if(V.how)q.set('how',V.how);
  if(ck)q.set('ck',ck.ok?ck.at.toString(36)+'-'+Date.now().toString(36):'0');
  q.set('from',a.closest('.pk')?'hero':a.closest('.sg')?'svc':a.closest('.mb')?'mobil':a.closest('header')?'menu':a.closest('footer')?'lablec':'egyeb');
  a.href=u.toString()}catch(err){}},true);
})();
</script>`;

module.exports = T => P.page(T, '', 'Deeply – Kárpit és szőnyegtisztítás Budapesten', body(T), css(T));
