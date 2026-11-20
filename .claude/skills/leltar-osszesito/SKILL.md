---
name: leltar-osszesito
description: Kiosk Ital leltár-nyomtatványok (kézzel kitöltött fotók) és pult / sátor / stand jegyzetek mennyiségeinek automatikus összesítése a nyomtatvány "Mértékegység" oszlopa szerint. Boroknál a palackszámot szorozza az üveg űrtartalmával és hozzáadja a bontott literet, a többi tételnél összead. Kezeli a "plusz N termék" kiegészítéseket is. Használd, ha leltárfotót kapsz, "add össze", "összesítsd", "leltár", "bor liter", "pult", "sátor" vagy "plusz N <termék>" kérés érkezik.
---

# Leltár összesítő (Kiosk Ital)

A cél: a kézzel kitöltött leltárívekből és a pult/sátor jegyzetekből **egyetlen, ellenőrizhető összesítés**, minden tétel a nyomtatvány **Mértékegység** oszlopában szereplő egységben.

## Bemenet

1. **"Leltár nyomtatvány" fotók**: nyomtatott lista, kézzel kitöltött oszlopokkal:
   - **Aktuális készlet** (a fotókon gyakran átírva "Palackok száma (db)"-ra)
   - **Megjegyzés** (néha átírva "Bontott (literben)"-re)
2. **Pult / sátor / stand jegyzetek** (pl. Kis Boros Pult, Nagy Pult, Welcome Pult, Sátor): szabad szöveges, saját egységekkel (`p`, `db`, `liter`, `üveges`, `zsák`).
3. **Telefonos listák** (képernyőkép, zárójelben a darabszám). A felhasználó megerősítette: a zárójeles szám a **bontatlan üvegek darabszáma**.
4. **Szöveges kiegészítés**, pl. "Plusz 5 prosecco".

## Munkafolyamat

1. **Olvasd be az összes képet.** A kézírást nagyítsd ki: másold a képet a scratchpadre, és vágd ki a területet `python3 -I` + PIL-lel 2× nagyítva. Nehezen olvasható számnál ne tippelj, nagyíts.
2. **Rendeld a bejegyzéseket a sorokhoz** (lásd "Kézírás olvasási szabályok").
3. **Írd a bejegyzéseket JSON-ba** (formátum lent, példa: `examples/pelda.json`) a scratchpad mappába. Ne a repóba.
4. **Futtasd a szkriptet:**
   ```bash
   python3 -I .claude/skills/leltar-osszesito/scripts/osszesit.py /abszolut/ut/bemenet.json
   ```
   (`--json` kapcsolóval gépi kimenet.) A számítást mindig a szkript végezze, kézzel ne adj össze.
5. **Add vissza a jelentést**: kategória-összesítő, tételenkénti számítás, majd a feltételezések listája. Hasonlítsd össze a korábbi leltárral, ha van.

## Számítási szabályok

| Eset | Szabály |
|---|---|
| **Borok** (Desszert, Fehér, Pezsgők, Rosé, Vörös borok csoport) | A kézzel írt szám = **palackszám**. Liter = (palackok összege) × űrtartalom + bontott liter. |
| **Bontott liter** (Megjegyzés oszlop) | Már liter. Hozzáadódik, és lehet 0,75-nél több (több bontott üveg). |
| **Űrtartalom** | A terméknévből: `0,75L`, `0,5L`, `0,66L`, `1,5l`/**MAGNUM** = 1,5, **JEROBOAM** = 3, `075L` = 0,75. Ha nincs a névben: **0,75 L**, és ⚠️-vel jelölve. A nagy `I` a `l` elírása (`0,75I` = 0,75 L). |
| **Nem bor tételek** (sör, üdítő, szesz, kávé stb.) | A kézzel írt szám **már a nyomtatvány mértékegységében** van (Liter / darab / Kg). Csak összeadni kell. |
| **Csapolt** (sör, **Frizzante csapolt**) | Már liter, nem palack. A Frizzante csapolt a Pezsgők csoportban van, ezért `separate: true`: külön sorban szerepel, a jelentés "avval együtt / nélküle" összeget is ad. |
| **Gramm** (kávé) | A `grams` lista g → kg. |
| **Plusz N termék** | Az `adjustments` lista. Ha pontosan **egy** tétel nevében szerepel a kulcsszó, ahhoz adja hozzá. Ha több vagy nulla találat van (pl. "prosecco" több tételnél), **külön sor** lesz "nem azonosított" jelöléssel és a jelölt tételek listájával. Ilyenkor kérdezd meg a felhasználót, melyikhez tartozik. |
| **Telefonos lista** | Bontatlan üvegek darabszáma. Külön `source` (pl. `Telefonos lista (bontatlan)`), a `product` mező ugyanaz, mint a pult/sátor lapon, így összevonódik. Váltsd az egységre: ha a nyomtatvány egysége Liter, akkor darab × üvegméret (`mode: bottle`, `size_l`); ha darab, akkor marad darab. Az üvegméretet a képről / terméknévből vedd, és jelöld becsültként. **Átfedés-ellenőrzés:** ha a telefonos lista literértéke pontosan egyezik a sátor lap literértékével (pl. Aperol 5 ↔ 5 liter), valószínűleg ugyanazok az üvegek, ilyenkor írd ki a két lehetséges összeget. |
| **Pult / sátor jegyzet** | A jegyzet saját egységét váltsd a nyomtatvány egységére: `p` (palack) × űrtartalom → liter; `db` → darab; `liter` → liter. Pl. "Hung Grand C: 17,25 liter" = 23 palack. Külön `source` mezővel add meg a pultot, és add meg az azonos termékeknél a `product` mezőt is, így a jelentés összevonja a pultokat és a sátrat. Egy kategórián belül ne keverd a `bottle` és `direct` tételeket (a Sátor literben írt tételei külön kategóriába kerüljenek). A jelentésben mutasd a forrásonkénti és az összes mennyiséget. Ha nem világos, hogy a pult/sátor készlete a raktárkészlettől **független** vagy abban már benne van, **kérdezz rá** (alapértelmezett: független, ezt írd ki a feltételezések közé). |

## Kézírás-olvasási szabályok

- **⊕** (bekarikázott plusz) = **összeadás** (különböző tárolóhelyek). `6 ⊕ 1 ⊕ 6` = 13.
- `p` a szám után = palack, `db` = darab. Pl. `3p⊕` = 3 palack.
- **Áthúzott / összefirkált** érték: nem számít, 0-nak vedd, és jelezd a feltételezések között.
- `–` vagy üres cella = 0.
- **A fotó dőlt**: a jobb oldali oszlopok (Megjegyzés) a sor nyomtatott nevéhez képest lejjebb csúsznak. Először a palackszám-oszlop bejegyzéseit rendeld a sorokhoz (közel van a mértékegység oszlophoz), utána a bontott értékeket **a hozzájuk tartozó palackszám bejegyzés alá, kb. 15–25 px-es eltolással** párosítsd. Ha egy bejegyzés két sor közé esik, a környező sorok mintázatából döntsd el.
- Egy oldal tetején a **bevezető sor** (pl. "Kpult", "Figula Kékfrankós: 1,5 Lit") lábjegyzet: külön tétel, olvasd el és írd ki.
- Ha a nyomtatvány új tételt tartalmaz, amely az előző leltáron nem volt, vedd fel, ne hagyd ki.

## Bemeneti JSON

```json
{
  "date": "2026-11-10",
  "location": "Kiosk Ital",
  "items": [
    {"name": "Pannonhalmi Tricollis vörös 0,75L", "category": "Vörös borok",
     "unit": "Liter", "counts": [5, 6, 54], "open_l": [], "source": "Leltár 3. oldal"},
    {"name": "Frizzante csapolt", "category": "Pezsgők", "unit": "Liter",
     "mode": "direct", "counts": [20, 18, 8], "separate": true},
    {"name": "Kinley tonik 0,25L", "category": "Üdítők", "unit": "darab",
     "mode": "direct", "counts": [264]},
    {"name": "Kávé", "category": "Kávé, tea", "unit": "Kg",
     "mode": "direct", "grams": [753, 20, 9000]}
  ],
  "adjustments": [{"match": "prosecco", "plus": 5}],
  "assumptions": ["Heimann Barbarossa áthúzva, 0-nak véve."]
}
```

Mezők: `name`, `category`, `unit` (a nyomtatvány Mértékegység oszlopa), `counts` (a ⊕ tagok), `open_l`, `grams`, `size_l` (felülírja a névből olvasott űrtartalmat), `product` (azonos termék neve; ha több különböző `source`-ból érkezik, a jelentés "Azonos termék összevonva forrásonként" táblát ad), `mode` (`bottle` vagy `direct`; a bor csoportoknál alapból `bottle`, máshol `direct`), `separate`, `source`, `note`.

## Kimeneti szabályok

- Magyar számformátum (tizedesvessző), liter 2 tizedesre.
- Mindig adj **kategória-összesítőt** (palack db, bontott L, összesen L) és **tételenkénti** táblázatot a számítással, pl. `(5+6+54) = 65 × 0,75`.
- A végén sorold fel a **feltételezéseket és a bizonytalan olvasatokat** (áthúzott értékek, becsült űrtartalom, nem azonosított "plusz" tételek), hogy a felhasználó ki tudja javítani.
- Ha a felhasználó javít egy értéket, módosítsd a JSON-t és futtasd újra a szkriptet, ne számolj kézzel.
