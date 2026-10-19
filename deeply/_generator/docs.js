// CLAUDE.md + Alapok/ (7 fájl, design.md formátum) + incoming/README – workshop 1.2, 1.5, 1.6, 2.1–2.3, 2.5.
const C = require('./content');
const { PAL, TYPO } = require('./themes');
const FAM = { head: 'Libertinus Sans', body: 'Inter', accent: 'Architects Daughter' };

const hang = {
  lenyeg: 'Szakmai, de érthető; nyugodt és magabiztos; személyes és őszinte. Két ember beszél, aki ért az anyagokhoz, és előre megmondja, mi fog kijönni – csodát nem ígér.',
  idezetek: ['Ezt a foltot megpróbáljuk, de előre szólunk: a színe változhat.', 'Előtte mindig szálpróbát csinálunk, hogy tudjuk, mit bír az anyag.', 'Küldj egy fotót a foltról, és 24 órán belül mondunk rá árat.'],
  igen: ['„Előtte mindig szálpróbát csinálunk.”', '„Ezt megpróbáljuk, de előre szólunk.”', '„Kárpitot és szőnyeget tisztítunk – ahhoz értünk igazán.”'],
  nem: ['„Mindent kiszedünk, garantáltan!”', '„Ez egy pikk-pakk munka lesz, hölgyem!”', '„Olyan lesz, mint új.”'],
};

const claude = T => `# CLAUDE.md – Deeply · ${T.name}

> Ez a projekt memóriája: minden beszélgetés elején automatikusan elolvasod. (Workshop 1.2)
> Logórendszer: **${T.name}** – a másik változat a \`../${T.id === 'A_kefe' ? 'B_D-jel' : 'A_kefe'}/\` mappában él, ugyanezzel a szerkezettel.

## Kötelező olvasmány – Alapok/
1. \`brand-alapok.md\` – ügy, vízió, küldetés, értékek, személyiség, pozicionálás.
2. \`celkozonseg.md\` – céges és magán célcsoport, mit akarnak, mitől félnek.
3. \`persona.md\` – három persona (étteremvezető, kétgyerekes család, rendelő/iroda/Airbnb).
4. \`hangnem.md\` – a hang (az egyetlen kézzel írt fájl – Tomi és Norbi beszélgetéseiből).
5. \`design-alapok.md\` – színek (Pantone), betűk, térközök, lekerekítés, motívum, logó.
6. \`komponensek.md\` – gomb, kártya, címke, banner – CSS + HTML-példa.
7. \`termekek.md\` – szolgáltatások, ajánlatkérés (árkalkulátor), ígéretek határai.

## Design szabályok
- Mindig a brand színeivel dolgozz – **a Pantone-paletta a mérvadó** (2026-10-16 döntés).
- A komponens-stílusok az \`Alapok/komponensek.md\`-ből jönnek; statikus HTML-ben inline \`<style>\`-ként újrahasználva.
- A logót soha ne rajzold újra: a vektoros fájlok az \`assets/\` mappában vannak (${T.files}).

## Formátum-szabályok
Minden Alapok/ fájl design.md formátumot követ: érzet-mondat, Tokens-táblák, Components, Do's and Don'ts, Agent Prompt Guide (+ a design-alapok végén CSS Quick Start). Ezt minden generálásnál magadtól kövesd.

## Output szabályok
- Minden kimenet egyetlen HTML-fájl, inline \`<style>\`-lal, a brand arculatában. Ide: \`out/\`.
- Minden szöveg magyarul. Weboldal, Facebook, magánügyfél: **tegez**. Céges levél és ajánlat: **magáz**. Nyilvános tábla: semleges.
- Ár soha nem kerül a weboldal szövegébe – a kalkulátorra mutatunk: ${C.KALK}
- Garancia megfogalmazása mindig: „lehetőleg 48 órán, legkésőbb 1 héten belül”. A 48 óra soha nem vállalt határidő.
- Elérhetőség (telefon, e-mail, domain) még nincs: mintaként jelöld.

## Visszacsatolás
Ha a kimenet rossz, ne a promptot javítsd, hanem az Alapok/ szabályát – és írd be a brandbook változásnaplójába.
`;

const brandAlapok = () => `# Brand alapok – Deeply

> Érzet: két szakember, aki megtartja azt, ami még jó – és előre megmondja, mi nem fog kijönni.

## Ügy
Megtartjuk, megvédjük és felfrissítjük azt, ami még jó – hogy ne kelljen újat venni. A tisztítással és a szakmai hozzáértésünkkel levesszük az ügyfélről a stresszt, hogy újat kell vennie.

**Kézenfekvő ok vs. igazi ok:** nem azért csináljuk, hogy tiszta legyen a kanapé, hanem hogy a vendéglátásban szerzett vendégközpontúságot és maximalizmust átültessük a szolgáltatásba.

## Vízió
Tisztább, higiénikus közeg: igényes otthonok és vendéglátóhelyek, ahová az emberek jó érzéssel érkeznek.

## Küldetés
Kárpitot, szőnyeget és matracot tisztítunk Budapesten és környékén – anyagonként külön protokollal, előtte–utána fotóval, és előre megmondjuk, mi nem fog kijönni. Alaposan felmérünk, ápolási kártyát hagyunk ott, garanciát vállalunk.

**Mérhető ambíció (1–2 év):** az a cég, akit egy budapesti étteremvezető elsőként hív, ha gond van a kárpittal. Első év ~15, két éven belül ~20 állandó éttermi ügyfél.

## Értékek (döntési szűrők)
| Érték | Mit jelent | Döntésben |
|---|---|---|
| Átláthatóság | kalkulátor, írásos ajánlat, előtte–utána fotó | amit nem tudunk biztosan, azt is kimondjuk |
| Anyagismeret | szálpróba, színtartósság-teszt, anyag szerinti protokoll | ha sérülne az anyag, azt a részt nem tisztítjuk |
| Felelősségvállalás | felmérés, fotóprotokoll, javító garancia | ${C.GARANCIA} |
| Őszinteség | ami nem jön ki, előre megmondjuk | ha csak túlígéréssel vállalható, nemet mondunk |

## Személyiség
Archetípus: **Bölcs / Szakértő** (elsődleges) + **Gondoskodó**. Ha ember lenne: 30-as, igényes, smart casual, sportos, megbízható; szakmai és profi. Kommunikációban laza, de tisztelettudó; terepen előzékeny, de határozott.

## Pozicionálás
Kárpit- és szőnyegtisztító szakemberek, nem takarítócég. A versenytársak többségének nincs valódi arculata és tartalma; mi bizonyítunk (fotó), átláthatók vagyunk (kalkulátor) és felelősséget vállalunk (garancia).

## Do's and Don'ts
- ✓ „tisztít” · ✕ „takarít” (kivéve, amikor azt soroljuk, mit nem vállalunk)
- ✓ előre szólunk · ✕ „garantáltan minden kijön”

## Agent Prompt Guide
Minden szöveg ebből a négy értékből induljon. Ha egy állítás nem bizonyítható (fotó, mérés), ne írd le.

## Hiányzik / kérdés
- 5. érték kell-e (precizitás / empátia)? · „Felelősségvállalás” vagy „Garancia” a név? · valódi elérhetőségek, domain.
`;

const celkozonseg = () => `# Célközönség – Deeply

> Érzet: aki ránk talál, annak most baja van – egy folttal, egy határidővel, egy rossz tapasztalattal.

## Elsődleges célcsoportok
- **Céges (erősebb piac):** étterem, kávézó, rendelő, iroda, Airbnb-üzemeltető, autókárpit (szerviz-együttműködés). Sok ülőhely, visszatérő munka, referencia.
- **Magán:** igényes, tehetősebb háztartás, 30–60 év. Gyakran ők a kapu a céges munkához.
- **Első találkozás:** Facebook, Instagram, személyes ajánlás.

## Mitől félnek
Tönkremegy a drága kanapé · nem jön ki a folt · vizes marad a vendégek érkezéséig · nem jönnek el időben · a vendégek látják a foltot · megmarad az állatszag · rossz tapasztalat egy korábbi céggel.

## Mit akarnak
Ne romoljon az anyag; jöjjön ki a folt és a szag; gyorsan érkezzünk, gyorsan végezzünk – és előre tudják, mire számíthatnak.

## Deeply nélkül / Deeply-vel
| Nélkülünk | Velünk |
|---|---|
| napokig tartó várakozás, bizonytalanság | gyors válasz, ajánlat 24 órán belül |
| drága, kókler munka, szakzsargon | anyagismeret, érthető magyarázat |
| tartalom nélküli weboldal | kalkulátor, fotók, írásos ajánlat |

## Agent Prompt Guide
Céges szövegben a határidő és a vendégek megítélése a fájdalom; magán szövegben a drága kanapé és a gyerek / állat okozta folt.
`;

const persona = () => `# Persona – Deeply

> Érzet: egy ember, akinek holnapra tiszta kell legyen.

## Fő persona: István, étteremvezető (35–45)
- **Helyzet:** 40+ ülőhelyes étterem, kedden rendezvény, hétfő este még foltos minden szék (valós minta: 28 bársony bárszék).
- **Mi fáj neki:** a rendezvényszervező elmarasztalja, romlik a hely megítélése.
- **Egy mondata:** „Mindenképpen meg kell oldanom ezt a problémát – tiszta közegben akarom fogadni a vendégeket.”
- **Amit tőlünk akar:** időpont még ma, egy nap alatt kész munka, előre tudni, mi marad.

## Mellék-personák
- **Anna, kétgyerekes anya (35–60):** a sütőtökös bébipapi a fehér szövetkanapén. „Rettegek, hogy ez a folt nem fog kijönni. Most mégis kihez forduljak?”
- **Betti, rendelő / iroda / Airbnb (35–50):** csapatépítő utáni csokitorta a tárgyaló szőnyegén. „Elegem van már ezekből a helyzetekből!” – átlátható árat és gyors munkát akar.

## Agent Prompt Guide
Ha nem tudod, kinek írsz, Istvánnak írj: rövid, konkrét, határidő-központú. Magánügyfélnek több megnyugtatás, kevesebb szakszó.
`;

const hangnemMd = () => `# Hangnem – Deeply

> Érzet: ${hang.lenyeg}

*Ez az egyetlen kézzel írt Alapok-fájl: Tomi és Norbi 2026. okt. 2-i és 4-i közös beszélgetéseiből (hangfelvétel-átirat) és a brandbook 7. fejezetéből.*

## 1. A lényeg
Szakmai, de érthető – megmondjuk, mit miért csinálunk. Nyugodt és magabiztos – nem kiabálunk, nem ígérünk csodát. Személyes – ember beszél, nem cég. Őszinte – ami kockázatos, azt előre kimondjuk.

## 2. Dimenziók
| Tengely | Hol állunk |
|---|---|
| formális ↔ informális | ●●●○○ – tegező, de tisztelettudó (céges levélben magázunk) |
| szakértő ↔ baráti | ●●○○○ – szakértő, aki barátságosan magyaráz |
| komoly ↔ játékos | ●●○○○ – komoly munka, mosolygós hang |
| visszafogott ↔ energikus | ●●○○○ – nyugodt, nincs felkiáltójel-áradat |

## 3. Szóhasználat
**Használjuk:** tisztít, anyag, szálpróba, előtte–utána, megpróbáljuk, előre szólunk, fotó, ajánlat, időpont, száradás.
**Kerüljük:** takarít, garantáltan, mint az új, pikk-pakk, „hölgyem / uram”, több felkiáltójel, ár a szövegben, hangos töprengés („mivel szedjük ki?”).

## 4. Példamondatok
**Headline:** Mélyreható tisztaság. · Rendezvény előtt? Egy nap alatt kész. · A folt nem vár – mi sem. · Fotó ma, ajánlat holnap. · Megtartjuk, ami még jó.
**Magyarázó bekezdés:**
1. Minden munkát szálpróbával kezdünk: megnézzük, mit bír az anyag, és csak utána választunk szert.
2. A munkáról előtte–utána fotó készül – így te is látod, mi történt.
3. Ha egy folt régi vagy már próbáltad kiszedni, előre szólunk: megpróbáljuk, de nem ígérjük.
4. A kárpitnak a munka után 4–6 óra kell a teljes száradáshoz – ezt az időpontnál számoljuk.
5. Ha visszajön a folt, ingyen visszamegyünk – ${C.GARANCIA}.
**CTA:** Küldj egy fotót · Nyisd meg a kalkulátort · Kérj ajánlatot · Válassz időpontot · Írj nekünk

## 5. Ellenpéldák
- „Mindent kiszedünk, garantáltan!” – túlígérés, az őszinteség értékünkbe ütközik.
- „Ez egy pikk-pakk munka lesz, hölgyem, egy szempillantás alatt megvagyunk!” – lekezelő, félmagázó.
- „Professzionális takarítási megoldások minden igényre!” – arctalan, és nem takarítunk.

## 6. Csatornák
- **Facebook / Instagram:** tegező, rövid, bizonyító (fotó + egy mondat). Nincs hashtag-áradat, nincs emoji a szöveg közepén.
- **Google Cégprofil:** tárgyilagos, kulcsszavas (kárpittisztítás, Budapest), harmadik személyű leírás.
- **E-mail, magánügyfél:** tegező, személyes, aláírás névvel.
- **Céges levél, ajánlat:** magázó, konkrét, számokkal és határidőkkel.
- **Helyszíni tábla:** semleges („Elnézést a zajért! Kárpittisztítás folyik.”).
- **Terepen:** mosollyal érkezünk, röviden és pozitívan tájékoztatunk, nem magyarázunk túl.

## Agent Prompt Guide
Írj úgy, mintha Tomi vagy Norbi mondaná a helyszínen: rövid mondatok, egy konkrétum mondatonként, a végén egy világos következő lépés.
`;

const designAlapok = T => `# Design alapok – Deeply · ${T.name}

> Érzet: ${T.feel}

## Tokens – Colors (Pantone a mérvadó)
| Név | Pantone | HEX | Szerep |
|---|---|---|---|
${PAL.map(([n, p, h, , r]) => `| ${n} | ${p} | \`${h}\` | ${r} |`).join('\n')}
| Paper | – | \`#FAF8F3\` | kártya a Coconut Milk alapon |
| Muted | – | \`#4E5948\` | másodlagos szöveg (a Mountain View tompítása) |
| Arany (CTA) | – | \`#D8AE47\` | csak a fő CTA gomb háttere (kalkulátor / ajánlatkérés), Mountain View felirattal; hover \`#C99D36\` (2026-10-19 döntés) |

Arány: 60% Coconut Milk · 25% Fog / Weathered Teak · 15% Mountain View + Matte Green.
Kontraszt: Mountain View / Coconut Milk 10 : 1 · Mountain View / Fog 7,3 : 1 · Matte Green csak nagy szövegre (3,2 : 1) · Weathered Teak szövegre soha (2,6 : 1) · Mountain View az arany CTA-n 5,6 : 1 (hoveren 4,7 : 1) · arany szöveg krém alapon soha (1,8 : 1).

## Tokens – Typography
Forrás: a logó-csomag tipográfiai útmutatói (\`07_Brandbook/deeply-k-rpit-s-sz-nyegtiszt-t-s-logo-typography-guides/\` – website + social media typography rules). Mindkét logórendszerre ugyanez. A Super Whales csak a logóban él (görbére alakítva), szövegben nem.
Google Fonts: Libertinus Sans, Inter, Architects Daughter (mindhárom latin-ext, az ő/ű megvan).

**Weboldal** (asztali / mobil px; a váltás ${TYPO.breakpoint} = 768 px alatt; asztali elrendezés ${TYPO.container} px)
| Szerep | Betű | Méret | Sormagasság | Betűköz | Mire |
|---|---|---|---|---|---|
${Object.entries(TYPO.web).map(([k, v]) => `| ${k} | ${FAM[v.font]} ${v.w} | ${v.d} / ${v.m} px | ${v.lh}× | ${v.ls} em | ${v.use} |`).join('\n')}

**Social** (${TYPO.socialCanvas.join(' × ')} px vászon, ${TYPO.safe} px biztonsági margó; a méretek a teljes vászonra értendők)
| Szerep | Betű | Méret | Sormagasság | Betűköz |
|---|---|---|---|---|
${Object.entries(TYPO.social).map(([k, v]) => `| ${k} | ${FAM[v.font]} ${v.w} | ${v.s} px | ${v.lh}× | ${v.ls} em |`).join('\n')}

Szabályok: headline az oldal fő címe, subheading tagolja a szekciókat; képaláírás, szerző és oldalszám Inter 500 – a carousel minden slide-ján ugyanott. Architects Daughter csak rövid megjegyzésre, felületenként legfeljebb egyszer. Story (1080 × 1920) ugyanezzel a skálával; Facebook-link (1200 × 630) a skála 75%-ával, 60 px margóval.

## Tokens – Spacing & Shapes
Fibonacci-térközök: 5 · 8 · 13 · 21 · 34 · 55 · 89 px. Lekerekítés: nagy elem ${T.rLg}, kis elem ${T.rSm}, címke 999px. Töréspontok: 900 px (két hasáb), 760 px (rácsok), 640 px.

## Logó
${T.logoDesc}. Mindig egyszínű; védőzóna a „D” magasságának fele. Fájlok: ${T.files}.

## Imagery / motívum
Motívum: ${T.motifName}. Fotó: valódi előtte–utána pár, ugyanabból a szögből; természetes, meleg fehéregyensúly; stockfotó soha.

## Layout
Váltakozó sávok: Coconut Milk (hero) → Fog (szolgáltatások) → Mountain View (bizonyíték) → Coconut Milk (levél) → Mountain View (záró). Hero 61,8 / 38,2. Teljes szélességű sávban min. 21 px oldalsó eltartás.

## Do's and Don'ts
- ✓ Szöveg Mountain View világoson, vagy Coconut Milk a Mountain View-n · ✕ Weathered Teak szöveg
- ✓ Egyszínű logó · ✕ kétszínű, árnyékolt, torzított logó
- ✓ Címek Libertinus Sans, minden más Inter · ✕ Super Whales szövegben (csak a logóban él)
- ✓ Architects Daughter egyszer, röviden · ✕ kézírás képaláírásban, apró betűben
${T.id === 'A_kefe' ? '' : '- ✓ A D-jel sávjai jobbra fel · ✕ tükrözött, elforgatott D'}
- ✕ csepp, szívófej, porszívó motívum; rózsaszín
- ✓ Arany (#D8AE47) csak a fő CTA gombon, sötétzöld felirattal · ✕ arany szöveg, arany sáv vagy háttér, arany ikon

## Agent Prompt Guide
Minden új felület: Coconut Milk alap, Mountain View szöveg, egy sötét sáv a ritmushoz, a logó a fejlécben, a CTA a kalkulátorra – arany gombként.

## CSS Quick Start
\`\`\`css
:root{--mv:#2D3C29;--cm:#F0EDE5;--mg:#7E8772;--fog:#D6CBB9;--wt:#A0907F;--paper:#FAF8F3;--muted:#4E5948;--gold:#D8AE47;--gold-d:#C99D36;
 --r-lg:${T.rLg};--r-sm:${T.rSm};--display:${T.display};--sans:"Inter",system-ui,sans-serif}
body{background:var(--cm);color:var(--mv);font:400 18px/1.65 var(--sans)}
h1{font:400 64px/1.06 var(--display);letter-spacing:-.025em}
h2{font:400 32px/1.18 var(--display);letter-spacing:-.015em}
.btn{font:600 14px/1.2 var(--sans);letter-spacing:.015em}
.caption{font:500 12px/1.4 var(--sans);letter-spacing:.04em}
.accent{font:400 18px/1.2 "Architects Daughter",cursive}
@media(max-width:48rem){h1{font-size:40px}h2{font-size:26px}body{font-size:16px}}
\`\`\`

## Változásnapló
- 2026-10-19 – **Arany CTA** (\`#D8AE47\`, hover \`#C99D36\`): a weboldal és a kalkulátor fő gombja arany lett, Mountain View felirattal, mert a zöld gomb beleolvadt a zöld–krém környezetbe (Tomi és Norbi döntése). Csak a fő CTA-n használjuk; a palettán kívüli színek tilalma minden másra érvényes.
`;

const komponensek = T => `# Komponensek – Deeply · ${T.name}

> Érzet: kevés elem, mindig ugyanúgy – a gomb mindig gomb, a kártya mindig kártya.

## Button
Mikor: minden cselekvésre hívás. Elsődleges cél mindig az ajánlatkérés / kalkulátor.
| Változat | Mire |
|---|---|
| cta (arany) | a fő CTA a weboldalon és a kalkulátorban: kalkulátor / ajánlatkérés (2026-10-19 óta) |
| primary | egyéb fő gomb világos alapon (pl. e-mail, nyomtatott anyag) |
| secondary | második lehetőség (e-mail, részletek) |
| inverse | fő CTA sötét (Mountain View) sávon |
| ghost | szöveges link-gomb |
\`\`\`css
.btn{display:inline-flex;align-items:center;gap:10px;font:600 14px/1.2 Inter,sans-serif;letter-spacing:.015em;padding:14px 24px;border-radius:${T.rSm};min-height:48px;text-decoration:none;border:2px solid transparent}
.btn-cta{background:#D8AE47;color:#2D3C29;border-radius:999px;box-shadow:0 6px 18px rgba(216,174,71,.45)}
.btn-cta:hover{background:#C99D36}
.btn-primary{background:#2D3C29;color:#F0EDE5}
.btn-secondary{background:transparent;color:#2D3C29;border-color:#2D3C29}
.btn-inverse{background:#F0EDE5;color:#2D3C29}
.btn-ghost{background:transparent;color:#2D3C29;padding-inline:0;text-decoration:underline}
\`\`\`
\`<a class="btn btn-cta" href="${C.KALK}">Árkalkulátor →</a>\`

## Card
Mikor: szolgáltatás, érték, ajánlat-doboz. Változatok: alap (Paper), fog (második sík), dark (kiemelés).
\`\`\`css
.card{background:#FAF8F3;border:1px solid #DDD5C6;border-radius:${T.rLg};padding:21px}
.card-fog{background:#D6CBB9;border-color:transparent}
.card-dark{background:#2D3C29;color:#F0EDE5;border-color:transparent}
\`\`\`
\`<div class="card"><h3>Szőnyeg</h3><p>Szálpróba után, anyag szerint.</p></div>\`

## Badge
Mikor: rövid tulajdonság („Szálpróba”, „Cégeknek”). Változatok: fog, dark, outline. Matte Green háttérre kis szöveg nem kerül (3,2 : 1).
\`\`\`css
.badge{display:inline-flex;font:500 12px/1.4 Inter,sans-serif;letter-spacing:.04em;padding:7px 12px;border-radius:999px;background:#D6CBB9;color:#2D3C29}
.badge-dark{background:#2D3C29;color:#F0EDE5}
.badge-outline{background:transparent;border:1.5px solid #2D3C29}
\`\`\`

## Banner komponensek (workshop 2.5)
| Banner | Méret | Layout |
|---|---|---|
| Instagram carousel (6 slide) | 1080×1350 | 80 px margó; felül címke + logó vonallal, alul szerző + oldalszám (caption 24 px); 1. és utolsó slide Mountain View, köztük Fog / Coconut Milk; 1. slide: headline 106 px + motívum jobbra, kifutó |
| Instagram story | 1080×1920 | Coconut Milk alap; logó bal felül, normál méretben; headline 106 px; body 38 px; motívum középen; CTA-pill (button 32 px) + accent alul |
| Facebook link / borító | 1200×630 | Fog alap; a social skála 75%-a, 60 px margó; motívum jobb felül, kifutó; headline balra; logó bal alul |
Tipográfiai hierarchia: a design-alapok.md social-táblája szerint (headline Libertinus Sans 106 px · subheading 66 · body Inter 38 · button 32 · caption 24 · accent Architects Daughter 36). Fájlok: \`banner-*.html\` a projekt gyökerében, PNG-k az \`out/\`-ban.

## Do's and Don'ts
- ✓ egy oldalon egy fő (arany) CTA szekciónként · ✕ narancs vagy egyéb palettán kívüli gomb – az egyetlen kivétel az arany CTA (#D8AE47)
- ✓ kártyák között 13–21 px · ✕ árnyék-túltolás, színátmenet

## Agent Prompt Guide
Új felületnél ezekből építkezz; új komponens csak akkor, ha egyik sem fedi le – és akkor írd ide.
`;

const termekek = () => `# Termékek / szolgáltatások – Deeply

> Érzet: kevés, jól csinált szolgáltatás – amihez igazán értünk.

## Szolgáltatások
| Mit | Kinek | Megjegyzés |
|---|---|---|
| Kárpittisztítás (kanapé, fotel, szék, bársony) | magán + céges | anyag szerinti protokoll, szálpróba |
| Szőnyegtisztítás | magán + céges | selyem és kézi csomózású perzsa nem |
| Matractisztítás | magán, Airbnb | vizelet ma nem vállalható |
| Autókárpit | magán, szerviz-partner | ötlet: csomagtartó ajándékba |
| Szinten tartó tisztítás | étterem, iroda, Airbnb | negyedévente – ez a visszatérő bevétel |

## A „lead magnet”: ajánlat fotó alapján
A workshop hírlevelének megfelelője nálunk az **árkalkulátor + fotós ajánlatkérés**: ${C.KALK} – irányár azonnal, írásos ajánlat 24 órán belül.

## Ígéreteink határai
- **Mindig:** előtte–utána fotó · ajánlat 24 órán belül · javító garancia ${C.GARANCIA} · szálpróba és színtartósság-teszt · ápolási kártya.
- **Csak írásban, előre:** viszkóz, címke nélküli darab (kockázatvállalással) · makacs folt („megpróbáljuk”).
- **Nem vállaljuk:** selyem, kézi csomózású perzsa, tollal töltött párna · vizelet · generál-, ablak-, iroda-, Airbnb-takarítás.

## Agent Prompt Guide
Árat soha ne írj szövegbe – a kalkulátorra mutass. Ígéretet csak a fenti „Mindig” listából tegyél.
`;

const incoming = T => `# incoming/ – a nyers anyag forrásai (workshop 1.4)

Nem másoltam ide duplikátumot – az eredetik helye:
- Brandbook (Tomi + Norbi, legfrissebb): \`_DeeplyLogo_Brand/07_Brandbook/Brandbook_HTML_s/deeply_brandbook_vaz_2026-10-15_kozos.html\`
- Hangfelvétel-átirat (hangnem forrása): \`_DeeplyLogo_Brand/07_Brandbook/brandbook_hangfelvetelek_atirat.md\`
- Palettakép (Pantone, mérvadó): \`_DeeplyLogo_Brand/07_Brandbook/Color_palette_Deeply.jpg\` (ha átkerült: a Brandbook_HTML_s mellett)
${T.id === 'A_kefe'
    ? '- Logó-export: `07_Brandbook/deeply-kefe-logo-export/` · mockupok: `07_Brandbook/deeply-kefe-logo-mockups/` · forrás: `05_Vazlatok/kefe_logo_ready.ai`'
    : '- Logó-export: `07_Brandbook/deeply-logo-logo-export (1)/` · mockupok: `07_Brandbook/deeply-D_logo-logo-mockups/` (figyelem: a régi terrakotta palettával készültek – a mérvadó a Pantone)'}
- Logórendszer-oldal: \`07_Brandbook/Brandbook_HTML_s/logo_rendszer_${T.id === 'A_kefe' ? '02_kefe' : '01_D-jel'}.html\`
`;

module.exports = { hang, claude, brandAlapok, celkozonseg, persona, hangnemMd, designAlapok, komponensek, termekek, incoming };
