#!/usr/bin/env python3
"""Leltár-összesítő (Kiosk Ital leltár-nyomtatvány + pult/sátor jegyzetek).

Használat:
    python3 -I osszesit.py bemenet.json            # Markdown jelentés
    python3 -I osszesit.py bemenet.json --json     # gépi (JSON) kimenet

A bemenet formátumát a SKILL.md és az examples/pelda.json írja le.
Csak a Python standard könyvtárat használja.
"""
import argparse
import json
import re
import sys
import unicodedata

# Ezekben a csoportokban a kézzel írt szám PALACKSZÁM (a nyomtatvány
# mértékegysége Liter), ezért szorozni kell az üveg űrtartalmával.
BOTTLE_CATEGORIES = {
    "desszert borok", "fehér borok", "pezsgők", "rosé borok", "vörös borok",
}
DEFAULT_BOTTLE_L = 0.75


def norm(text):
    """Kisbetű + ékezetmentes, összehasonlításhoz."""
    text = unicodedata.normalize("NFKD", str(text).lower())
    return "".join(c for c in text if not unicodedata.combining(c))


def fmt(x, unit=None):
    """Magyar számformátum (tizedesvessző)."""
    if unit and norm(unit) == "darab":
        return str(int(round(x))) if abs(x - round(x)) < 1e-9 else f"{x:.2f}".replace(".", ",")
    return f"{x:.2f}".replace(".", ",")


def num(x):
    """Rövid szám: 0,75 / 1,5 / 3 (felesleges nullák nélkül)."""
    return f"{x:g}".replace(".", ",")


def parse_size(name):
    """Üveg űrtartalma literben a terméknévből. Visszaad: (liter, becsült?)."""
    n = str(name)
    # 'Sauska Extra Dry 075L' -> 0,75 L (elírt tizedes nélkül)
    m = re.search(r"(?<![\d,.])0(\d{2})\s*[lL]\b", n)
    if m:
        return float("0." + m.group(1)), False
    # '0,75L', '0,5L', '1,5l', '3L', '0,75I' (a nagy I az l elírása)
    m = re.search(r"(?<![\d,.])(\d+(?:[.,]\d+)?)\s*[lLI]\b", n)
    if m:
        return float(m.group(1).replace(",", ".")), False
    up = n.upper()
    if "JEROBOAM" in up:
        return 3.0, False
    if "MAGNUM" in up:
        return 1.5, False
    return DEFAULT_BOTTLE_L, True


class Line:
    def __init__(self, it):
        self.name = it["name"]
        self.category = it.get("category", "Egyéb")
        self.unit = it.get("unit", "Liter")
        self.source = it.get("source", "")
        self.counts = [float(c) for c in it.get("counts", [])]
        self.open_l = [float(c) for c in it.get("open_l", [])]
        self.grams = [float(c) for c in it.get("grams", [])]
        self.note = it.get("note", "")
        self.product = it.get("product")  # azonos termék összevonásához több forrásból
        self.separate = bool(it.get("separate", False))
        mode = it.get("mode")
        if not mode:
            mode = "bottle" if norm(self.category) in {norm(c) for c in BOTTLE_CATEGORIES} else "direct"
        self.mode = mode
        self.assumed = False
        self.size = None
        if self.mode == "bottle":
            if "size_l" in it:
                self.size = float(it["size_l"])
            else:
                self.size, self.assumed = parse_size(self.name)
        self.adjust = []  # (leírás, érték)

    # -- számítás ---------------------------------------------------------
    def bottles(self):
        return sum(self.counts)

    def total(self):
        if self.mode == "bottle":
            return self.bottles() * self.size + sum(self.open_l)
        total = sum(self.counts) + sum(self.open_l)
        if self.grams:
            total += sum(self.grams) / 1000.0  # g -> kg
        return total

    def is_empty(self):
        return not (self.counts or self.open_l or self.grams)

    def formula(self):
        parts = []
        if self.mode == "bottle":
            if self.counts:
                c = "+".join(fmt(x, "darab") for x in self.counts)
                c = f"({c}) = {fmt(self.bottles(), 'darab')}" if len(self.counts) > 1 else fmt(self.bottles(), "darab")
                parts.append(f"{c} × {num(self.size)}")
            if self.open_l:
                parts.append(" + ".join(num(x) for x in self.open_l)
                             + (" (bontott)" if self.counts else " (csak bontott)"))
            return " + ".join(parts) if parts else "–"
        vals = [fmt(x, self.unit) for x in self.counts + self.open_l]
        if self.grams:
            vals += [f"{fmt(g, 'darab')} g" for g in self.grams]
        return " + ".join(vals) if vals else "–"


def apply_adjustments(lines, adjustments):
    """'Plusz N termék' kiegészítések. Egyértelmű találatnál a sorhoz adja,
    különben külön, jelölt sorként kerül a jelentésbe."""
    extras = []
    for adj in adjustments or []:
        key = norm(adj["match"])
        plus = float(adj["plus"])
        hits = [ln for ln in lines if key in norm(ln.name)]
        if len(hits) == 1:
            ln = hits[0]
            ln.counts.append(plus)
            ln.adjust.append((f"+{fmt(plus, 'darab')} (kézi kiegészítés)", plus))
        else:
            size = float(adj.get("size_l", DEFAULT_BOTTLE_L))
            cand = ", ".join(ln.name for ln in hits) if hits else "nincs találat"
            ex = Line({
                "name": f"{adj['match']} (nem azonosított, kézi kiegészítés)",
                "category": adj.get("category", "Kézi kiegészítések"),
                "unit": "Liter", "mode": "bottle", "size_l": size,
                "counts": [plus], "source": "kézi",
                "note": "Több/nulla találat, ezért külön sor. Jelölt tételek: " + cand,
            })
            extras.append(ex)
    return extras


def build(data):
    lines = [Line(it) for it in data.get("items", [])]
    extras = apply_adjustments(lines, data.get("adjustments"))
    return lines + extras


def merge_by_product(lines):
    """Azonos `product` + egység több forrásból -> (forrás, mennyiség) lista.
    Csak az olyan termék kerül be, amelynek legalább 2 különböző forrása van."""
    acc = {}
    for ln in lines:
        if ln.product and not ln.separate:
            acc.setdefault((ln.product, ln.unit), []).append(ln)
    res = {}
    for key, lns in acc.items():
        if len({l.source for l in lns}) > 1:
            res[key] = [(l.source, l.total()) for l in lns]
    return res


def group(lines):
    groups = {}
    for ln in lines:
        groups.setdefault(ln.category, []).append(ln)
    return groups


def report_markdown(data, lines):
    out = []
    title = "Leltár összesítés"
    if data.get("date"):
        title += f" ({data['date']})"
    if data.get("location"):
        title += f" – {data['location']}"
    out.append(f"# {title}\n")

    groups = group(lines)
    summary = []
    for cat, items in groups.items():
        counted = [i for i in items if not i.separate]
        unit = items[0].unit
        sub = sum(i.total() for i in counted)
        bott = sum(i.bottles() for i in counted if i.mode == "bottle") if items[0].mode == "bottle" else None
        opened = sum(sum(i.open_l) for i in counted) if items[0].mode == "bottle" else None
        summary.append((cat, unit, sub, bott, opened, items[0].mode))

    out.append("## Összesítő\n")
    out.append("| Kategória | Palack (db) | Bontott (L) | Összesen |")
    out.append("|---|---|---|---|")
    wine_total = 0.0
    other = {}
    for cat, unit, sub, bott, opened, mode in summary:
        if mode == "bottle":
            wine_total += sub
            out.append(f"| {cat} | {fmt(bott, 'darab')} | {fmt(opened)} | **{fmt(sub)} L** |")
        else:
            other[unit] = other.get(unit, 0.0) + sub
            out.append(f"| {cat} | – | – | **{fmt(sub, unit)} {unit}** |")
    out.append("")
    out.append(f"**Palack-alapú tételek (borok stb.) összesen: {fmt(wine_total)} L**")
    for unit, v in other.items():
        out.append(f"- Közvetlenül összeadott tételek ({unit}): {fmt(v, unit)} {unit}")
    sep = [i for i in lines if i.separate]
    for i in sep:
        out.append(f"- Külön tétel (nem számolva a kategória-összegbe): {i.name} = {fmt(i.total(), i.unit)} {i.unit}")
        if i.mode == "bottle" or i.unit.lower() == "liter":
            out.append(f"  - Ezzel együtt a palack-alapú összeg: {fmt(wine_total + i.total())} L")
    out.append("")

    merged = merge_by_product(lines)
    if merged:
        out.append("## Azonos termék összevonva forrásonként\n")
        out.append("| Termék | Forrásonként | Összesen |")
        out.append("|---|---|---|")
        for (prod, unit), parts in merged.items():
            per = " + ".join(f"{src or '?'} {fmt(v, unit)}" for src, v in parts)
            tot = sum(v for _, v in parts)
            out.append(f"| {prod} | {per} | **{fmt(tot, unit)} {unit}** |")
        out.append("")

    out.append("## Tételenként\n")
    for cat, items in groups.items():
        unit = items[0].unit
        out.append(f"### {cat}\n")
        out.append(f"| Tétel | Számítás | {unit} |")
        out.append("|---|---|---|")
        for i in items:
            if i.is_empty():
                continue
            flag = " ⚠️" if i.assumed else ""
            adj = (" " + " ".join(a for a, _ in i.adjust)) if i.adjust else ""
            src = f" _[{i.source}]_" if i.source else ""
            out.append(f"| {i.name}{src}{flag} | {i.formula()}{adj} | {fmt(i.total(), i.unit)} |")
        empty = [i.name for i in items if i.is_empty()]
        out.append("")
        if empty:
            out.append(f"_Üres sor (0): {len(empty)} tétel_\n")

    notes = []
    for i in lines:
        if i.assumed:
            notes.append(f"- ⚠️ {i.name}: a névben nincs űrtartalom, {fmt(i.size)} L-nek vettem.")
        if i.note:
            notes.append(f"- {i.name}: {i.note}")
    for n in data.get("assumptions", []):
        notes.append(f"- {n}")
    if notes:
        out.append("## Feltételezések / ellenőrizendő\n")
        out.extend(notes)
        out.append("")
    return "\n".join(out)


def report_json(data, lines):
    res = {"items": [], "groups": {}}
    for i in lines:
        res["items"].append({
            "name": i.name, "category": i.category, "unit": i.unit,
            "bottles": i.bottles() if i.mode == "bottle" else None,
            "size_l": i.size, "open_l": sum(i.open_l), "total": i.total(),
            "assumed_size": i.assumed, "separate": i.separate,
        })
    for cat, items in group(lines).items():
        res["groups"][cat] = sum(i.total() for i in items if not i.separate)
    res["merged"] = {f"{p} [{u}]": sum(v for _, v in parts)
                     for (p, u), parts in merge_by_product(lines).items()}
    return res


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("input", help="bemeneti JSON fájl")
    ap.add_argument("--json", action="store_true", help="JSON kimenet Markdown helyett")
    args = ap.parse_args()
    with open(args.input, encoding="utf-8") as f:
        data = json.load(f)
    lines = build(data)
    if args.json:
        json.dump(report_json(data, lines), sys.stdout, ensure_ascii=False, indent=2)
        print()
    else:
        print(report_markdown(data, lines))


if __name__ == "__main__":
    main()
