// ═══ DEEPLY – MINDEN SZÖVEG EGY HELYEN ═══
// Forrás: Brandbook_HTML_s/deeply_brandbook_vaz_2026-10-15_kozos.html.
// Hivatkozási kód = a kulcs útvonala nagybetűvel, kötőjellel, 1-től számozva:
//   hero.h1 → HERO-H1 · hero.pillars[2] → HERO-PILLARS-3 · proof.quotes[0] → PROOF-QUOTES-1
// Változtatás: írd át az értéket idézőjelen belül, majd futtasd a projekt gyökeréből:
//   node _DeeplyLogo_Brand/08_Brand_OS/_generator/gen.js
// A szöveg mindkét logórendszerben (A · Kefe, B · D-jel) egyszerre változik.
module.exports = {
  KALK: 'https://skillsharemot-cpu.github.io/Deeply/arkalkulator_foglalas.html',
  PHONE: '+36 30 000 0000', // MINTA – valódi szám még nincs (CFG.phone üres)
  WHATSAPP: '', // a WhatsApp Business száma, pl. '+36 30 123 4567' – üresen a PHONE-t használja
  MAIL: 'hello@deeply.hu', // MINTA – a domain még nincs eldöntve
  WEB: 'deeply.hu', // MINTA
  GARANCIA: 'lehetőleg 48 órán, legkésőbb 1 héten belül',

  hero: {
    eyebrow: 'Kárpit- és szőnyegtisztítás · Budapest és környéke',
    h1: 'Mélyreható tisztaság.',
    sub: 'Előre megmondjuk, mi fog kijönni.',
    lead: 'Kanapé, fotel, éttermi szék, szőnyeg, matrac és autókárpit – anyagonként külön protokollal, előtte–utána fotóval. Előre megmondjuk, mi fog kijönni, és mi nem.',
    pillars: [
      ['Ár fotó alapján', 'Küldj egy képet a foltról – 24 órán belül válaszolunk.'],
      ['Anyagismeret', 'Szálpróba és színtartósság-teszt minden munkán.'],
      ['Átlátható', 'Írásos ajánlat, előtte–utána fotó, nincs meglepetés.'],
      ['Javító garancia', 'Ha visszajön a folt, ingyen visszamegyünk – lehetőleg 48 órán, legkésőbb 1 héten belül.'],
    ],
    card: {
      title: 'Kérj ajánlatot',
      text: 'Pár kérdés és egy fotó. A kalkulátor rögtön mutat egy irányárat, a pontos ajánlatot mi küldjük – írásban.',
      steps: ['Válaszd ki, mit tisztítsunk', 'Tölts fel 1–3 fotót', 'Válassz időpontot'],
      cta: 'Árkalkulátor megnyitása',
      alt: 'vagy hívj minket',
    },
  },
  services: [
    ['Kárpit', 'Kanapé, fotel, étkezőszék, bársony és szövet – anyag szerinti protokollal.'],
    ['Szőnyeg', 'Gépi és kézi csomózású szőnyegek, szálpróba után.'],
    ['Matrac', 'Foltok, izzadság, szag – mélyextrakcióval, gyors száradással.'],
    ['Autókárpit', 'Ülések és csomagtartó – a kocsi a ház előtt marad.'],
  ],
  b2b: 'Éttermeknek, irodáknak, Airbnb-nek: sok ülőhely egyszerre, rendezvény előtt is – és szinten tartó tisztítás negyedévente.',
  proof: {
    h2: 'Bizonyítva.',
    lead: 'Nem ígérünk csodát – megmutatjuk, mi történt. Minden munkáról előtte–utána fotó készül.',
    stats: [['60+', 'éttermi ülőhely egyetlen hét alatt'], ['12', 'féle szer mindig nálunk – nincs „épp elfogyott”'], ['24 óra', 'és megvan az ajánlatod']],
    quotes: [
      ['Kedden rendezvényünk volt, hétfőn még foltos volt mind a 28 szék. Időben jöttek, és előre megmondták, melyik folt marad.', 'étteremvezető, Budapest'],
      ['A sütőtökös folt kijött a fehér kanapéból. Azt is elmondták, mit tegyek legközelebb az első percekben.', 'kétgyerekes család'],
      ['Két vendég között egy napom volt. Reggel jöttek, estére száraz volt a kanapé.', 'Airbnb-üzemeltető'],
    ],
    note: 'Mintavélemények – a valódi ügyfélvéleményekre cseréljük.',
  },
  mail: {
    h2: 'Így írunk neked.',
    lead: 'Ajánlat, időpont, tipp – emberi hangon, érthetően. Ilyen egy levelünk, amikor megkaptuk a fotódat.',
    from: 'Tomi – Deeply', subject: 'A kanapéd ajánlata + egy gyors tipp', date: 'csütörtök, 9:12',
    intro: 'Szia Anna! Köszönjük a fotókat. A kanapéd szövete jól bírja a nedves tisztítást, a folt friss – jó eséllyel teljesen kijön. Az ajánlatot csatoltuk, az időpontot te választod.',
    tipTitle: 'Amíg odaérünk: ne dörzsöld!',
    tip: 'Itasd fel a foltot egy tiszta, fehér törlőkendővel, kívülről befelé haladva. Ne dörzsöld, és ne próbáld mosószerrel – a dörzsölés a szálak mélyére viszi a foltot, ahonnan sokkal nehezebb kiszedni. Ha már próbáltad, az sem baj: szólj, amikor érkezünk, és ahhoz igazítjuk a szert.',
    more: 'Olvasd el a többi folttippet →',
    sign: 'Tomi és Norbi, Deeply',
  },
  close: {
    h2: 'Írj nekünk.',
    lead: 'Küldj egy fotót a foltról – 24 órán belül mondunk rá árat. Az időpontot te választod.',
  },

  hooks: [
    ['Storytelling', 'Kedden rendezvény, hétfő este még 28 foltos szék. Így lett belőle tiszta terem egyetlen nap alatt.'],
    ['Direkt érték', 'Küldj egy fotót a foltról, és 24 órán belül megmondjuk az árát – meg azt is, ki fog-e jönni.'],
    ['Kérdés', 'Tudtad, hogy a foltot nem a víz, hanem a dörzsölés viszi a szálak mélyére? Mit tegyél az első öt percben?'],
  ],
  winner: 'Storytelling',
  carousel: [
    'Kedden rendezvény. Hétfő este még 28 foltos szék.',
    'Bor, gyertyaviasz, zsír – egy jó hétvége nyoma minden ülésen.',
    'Először szálpróba: megnézzük, mit bír a bársony. Csak utána jön a szer.',
    'Minden széket lefotózunk előtte és utána. Amit nem lehet kiszedni, azt előre megmondjuk.',
    'Kedd délre száraz, tiszta terem – a vendégek semmit nem vettek észre.',
    'Rendezvény előtt állsz? Küldj fotót, 24 órán belül mondunk árat. → link a profilban',
  ],
  fb: 'Kedden rendezvény, hétfő este még 28 foltos szék.\n\nEgy budapesti étterem hívott minket: bor, gyertyaviasz, zsír – egy jó hétvége nyoma minden ülésen. Szálpróbával kezdtünk, minden széket lefotóztunk előtte és utána, és előre megmondtuk, melyik folt marad. Kedd délre száraz, tiszta terem lett.\n\nRendezvény előtt állsz? Küldj egy fotót, 24 órán belül mondunk rá árat.',
  gbp: 'Rendezvény előtti kárpittisztítás, egy nap alatt\n\nEgy budapesti étterem 28 bársony székét tisztítottuk ki egy rendezvény előtti napon. A munka szálpróbával indult, minden ülésről előtte–utána fotó készült, és a végén írásban átadtuk, mi történt.\n\nÉtteremként, irodaként vagy Airbnb-üzemeltetőként kérhetsz negyedéves szinten tartó tisztítást is – így a foltok nem gyűlnek össze egy-egy nagy esemény előtt.\n\nÁrajánlat fotó alapján, 24 órán belül.',

  banner: {
    storySub: '24 órán belül megmondjuk az árát – és azt is, ki fog-e jönni a folt.',
    storyCta: 'Ajánlat fotó alapján →',
    fbSub: 'Kárpittisztítás egy nap alatt, előtte–utána fotóval. Ajánlat 24 órán belül.',
  },
  card: { name: 'Tomi', role: 'Deeply · társtulajdonos' },
  // Architects Daughter – rövid kézírásos megjegyzés, takarékosan (felületenként legfeljebb egy)
  accent: { web: 'Előre szólunk, ha valami nem jön ki.', social: 'előtte–utána fotóval' },

  // ═══ FŐOLDAL a Fixter szerkezete szerint (Weblap_Design_Upgrade/referencia_oldalak/fixter_Design.md) ═══
  // Sorrend = a Fixter <main> sorrendje: fejléc → akciósáv → hero → Miért → Így dolgozunk → szolgáltatások →
  // vélemények → segítség-kártya → GYIK → partnerek → linkblokk → lábléc. Ár sehol – minden választás a kalkulátorra visz.
  fooldal: {
    promo: 'Ajánlat fotó alapján, 24 órán belül – Budapesten és környékén',
    nav: ['Így dolgozunk', 'Szolgáltatások', 'Ahol dolgozunk', 'GYIK'],
    navCta: 'Árkalkulátor',
    navCall: 'Hívj',
    heroBadge: ['Kiszállunk hozzád', 'Budapesten és környékén'], // a ferde címke (Fixter: „Collection & Delivery available”)
    heroQ: 'Mit tisztítsunk?',
    pick: [ // a hero 4 választó-kártyája – a kalkulátorra visz (a Fixternél itt ár áll – nálunk soha)
      ['sofa', 'Kárpit', 'kanapé, fotel, szék'],
      ['rug', 'Szőnyeg', 'szálpróbával'],
      ['bed', 'Matrac', 'folt és szag'],
      ['car', 'Autókárpit', 'ülések, csomagtartó'],
    ],
    trust: [ // a hero alsó sora (Fixter: értékelés | „Part of Renault”) – valós vállalások, nem pontszám
      ['shield', 'Javító garancia', 'lehetőleg 48 órán, legkésőbb 1 héten belül'],
      ['cam', 'Előtte–utána fotó', 'minden munkáról'],
    ],
    whyTag: 'Miért a Deeply?',
    uspTitle: ['Csak küldj egy ', 'fotót', ', a többit mi intézzük.'], // a középső rész kézzel aláhúzva
    usp: [
      ['eye', 'Átlátható ajánlat', 'Online kalkulátor, írásos ajánlat, előtte–utána fotó. Tudod, mire számíts – mielőtt igent mondasz.'],
      ['lens', 'Anyagismeret', 'Szálpróba és színtartósság-teszt minden munkán. Minden anyag a saját protokollját kapja.'],
      ['shield', 'Javító garancia', 'Ha visszajön a folt, ingyen visszamegyünk – lehetőleg 48 órán, legkésőbb 1 héten belül.'],
      ['chat', 'Őszinte válasz', 'Ami nem fog kijönni, azt előre megmondjuk. Csodát nem ígérünk.'],
    ],
    howTitle: 'Így dolgozunk',
    howSub: ['Kárpittisztítás, ', '4 lépésben', '.'],
    how: [ // [cím, szöveg, a telefon-képernyő címe]
      ['Fotó és kalkulátor', 'Válaszd ki, mit tisztítsunk, és tölts fel egy-két fotót. A kalkulátor rögtön mutat egy irányárat.', 'Mit tisztítsunk?'],
      ['Írásos ajánlat 24 órán belül', 'Megnézzük a fotókat, és írásban küldjük a pontos ajánlatot. Az időpontot te választod.', 'Válassz időpontot'],
      ['Szálpróba, aztán tisztítás', 'A helyszínen először megnézzük, mit bír az anyag – csak utána jön a szer és a gép.', 'Szálpróba'],
      ['Előtte–utána fotó, ápolási kártya', 'Minden darabot lefotózunk előtte és utána. Ápolási kártyát hagyunk, a kárpitnak 4–6 óra a száradás.', 'Kész!'],
    ],
    svcTitle: 'Legnépszerűbb szolgáltatásaink',
    svc: [ // [ikon, név, alsor] – a Fixternél az alsor az ár; nálunk rövid leírás
      ['sofa', 'Kárpit', 'kanapé, fotel, étkezőszék'],
      ['rug', 'Szőnyeg', 'gépi és kézi csomózású'],
      ['bed', 'Matrac', 'folt, izzadság, szag'],
      ['car', 'Autókárpit', 'a kocsi a ház előtt marad'],
    ],
    svcCta: 'Ajánlatkérés',
    revTitle: 'Ezt mondják rólunk',
    revNote: 'Mintavélemények – a valódi Google-értékelésekre cseréljük, névvel és kerülettel.',
    rev: [
      ['Időben jöttek, előre szóltak', 'Kedden rendezvényünk volt, hétfőn még foltos volt mind a 28 szék. Időben jöttek, és előre megmondták, melyik folt marad.', 'étteremvezető, Budapest'],
      ['Kijött a sütőtök', 'A sütőtökös folt kijött a fehér kanapéból. Azt is elmondták, mit tegyek legközelebb az első percekben.', 'kétgyerekes család'],
      ['Estére száraz volt', 'Két vendég között egy napom volt. Reggel jöttek, estére száraz volt a kanapé.', 'Airbnb-üzemeltető'],
      ['Mindent lefotóztak', 'Minden ülésről volt előtte és utána kép – így a tulajdonosnak is meg tudtam mutatni.', 'irodavezető'],
      ['Megmondták, mi nem jön ki', 'A régi kávéfoltról előre szóltak, hogy csak halványodni fog. Így is lett – nem ért meglepetés.', 'bérlő, XI. kerület'],
      ['Fotóból pontos ár', 'Két képet küldtem a szőnyegről, másnap reggel ott volt az írásos ajánlat. Pont annyi lett.', 'családi ház, Budaörs'],
    ],
    helpTitle: 'Nem tudod, kijön-e a folt?',
    helpText: 'Küldj egy fotót vagy hívj minket – megmondjuk, mire számíthatsz, mielőtt bármit vállalnánk.',
    helpMail: 'Írj e-mailt',
    faqTitle: 'Gyakori kérdések a foglalásról',
    faq: [
      ['Kijön minden folt?', 'A legtöbb igen – de nem mindegy, mióta van benne, és próbáltad-e már kiszedni. A friss, érintetlen folt szinte mindig kijön; a régi vagy bedörzsölt foltnál rosszabb az esély. Ezt előre megmondjuk, és csak akkor kezdünk bele, ha vállalod.'],
      ['Mennyi idő a száradás?', 'A kárpitnak a munka után általában 4–6 óra kell a teljes száradáshoz. Ha vendégeket vársz, ezt az időpontnál számoljuk.'],
      ['Mit nem vállaltok?', 'Selymet, kézi csomózású perzsát és tollal töltött párnát nem tisztítunk. Viszkózt csak írásos kockázatvállalással, a munka előtt.'],
      ['Mikor és hogyan fizetek?', 'A munka elvégzése után, a helyszínen – készpénzzel vagy utalással. Előleget nem kérünk.'],
      ['Hogyan működik a javító garancia?', 'Ha a munka után visszajön a folt, vagy megmarad a szag, díjmentesen visszamegyünk – lehetőleg 48 órán, legkésőbb 1 héten belül.'],
      ['Honnan tudom előre az árat?', 'Az árkalkulátor rögtön mutat egy irányárat, a pontos ajánlatot pedig a fotók alapján írásban küldjük, 24 órán belül.'],
    ],
    faqMore: ['Nem találod a választ?', 'Írj nekünk'],
    featTitle: 'Akiknek már dolgoztunk', // Fixter: „As featured in” – partnerlogó csak engedéllyel kerülhet ide
    featNote: 'logó helye – engedéllyel',
    linksTitle: 'Népszerű szolgáltatások',
    links: ['Kanapétisztítás', 'Fotel tisztítása', 'Sarokkanapé tisztítása', 'Étkezőszékek tisztítása', 'Szőnyegtisztítás', 'Matractisztítás', 'Autókárpit-tisztítás', 'Folteltávolítás kárpitból',
      'Bársony kárpit tisztítása', 'Éttermi székek tisztítása', 'Irodai székek tisztítása', 'Airbnb-lakás kárpitja', 'Rendezvény előtti tisztítás', 'Negyedéves szinten tartás', 'Gépi szőnyeg tisztítása', 'Kézi csomózású szőnyeg'],
    linksMore: ['Összes szolgáltatás', 'Kevesebb'],
    areaTitle: 'Budapest és agglomeráció',
    // az első 8 látszik, a többi az „Összes helyszín” gomb alatt; a menüben az areaNav 4 eleme
    areas: ['Budapest – mind a 23 kerület', 'Budaörs', 'Érd', 'Dunakeszi', 'Szentendre', 'Gödöllő', 'Szigetszentmiklós', 'Vecsés',
      'Biatorbágy', 'Budakalász', 'Budakeszi', 'Csömör', 'Diósd', 'Dunaharaszti', 'Fót', 'Göd', 'Gyál', 'Gyömrő', 'Halásztelek',
      'Kerepes', 'Kistarcsa', 'Mogyoród', 'Pécel', 'Pilisborosjenő', 'Pomáz', 'Solymár', 'Százhalombatta', 'Tárnok', 'Törökbálint',
      'Üllő', 'Üröm', 'Pest megye többi része – egyeztetéssel'],
    areaNav: ['Budapest – mind a 23 kerület', 'Budaörs', 'Érd', 'Szentendre'],
    areaMore: ['Összes helyszín', 'Kevesebb'],
    mobileCta: 'Árkalkulátor megnyitása',
    footCols: [
      ['Deeply', ['Így dolgozunk', 'Vélemények', 'GYIK', 'Tomi és Norbi', 'Kapcsolat']],
      ['Szolgáltatások', ['Kárpittisztítás', 'Szőnyegtisztítás', 'Matractisztítás', 'Autókárpit', 'Éttermeknek, irodáknak', 'Árkalkulátor']],
      ['Jogi', ['Általános szerződési feltételek', 'Adatkezelési tájékoztató']],
    ],
    footPay: ['Fizetés a munka után', ['Készpénz', 'Átutalás']],
  },

  welcome: {
    subject: 'Megkaptuk a foglalásod – erre számíts',
    body: [
      'Szia Anna!',
      'Köszönjük, hogy minket választottál. Megkaptuk a foglalásodat és a fotókat – 24 órán belül küldjük az írásos ajánlatot.',
      'Mi történik ezután? Visszaigazoljuk az időpontot, a helyszínen először szálpróbát csinálunk, és megmondjuk, mi fog kijönni. Minden darabról előtte–utána fotó készül. A kárpitnak a munka után 4–6 óra kell a teljes száradáshoz.',
      'Egy tipp már most: ha új folt kerül a kanapéra, ne dörzsöld – itasd fel egy fehér törlőkendővel, kívülről befelé.',
      'Ha bármi kérdésed van, válaszolj erre a levélre, vagy hívj minket.',
    ],
    sign: 'Tomi és Norbi',
  },
};
