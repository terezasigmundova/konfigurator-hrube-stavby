# Parametrický zdroj panelu 1.2

Tato složka navazuje na uzamčený zobrazovací systém typizovaných skladeb konfigurátoru PREFA ŠOPÍK.

## Zásadní pravidla

- Veškerá geometrie je zadána v milimetrech.
- Desky Fermacell jsou modelovány ve skutečné tloušťce 12,5 mm.
- Celková dodávaná tloušťka panelu 1.2 je 398,5 mm.
- Izolace L03 a L07 vyplňují své rámy a do celkové tloušťky se samostatně nepřičítají.
- Svislý rošt L10 a vodorovný rošt L11 jsou samostatné konstrukční roviny 60/40 mm.
- Fasádní prkna ani finální pohledová úprava interiéru nejsou součástí dodávky.
- Složený a rozložený render vznikají ze stejných objektů. Rozložený stav pouze přidává jednotný prezentační posun mezi konstrukčními skupinami.
- OBJ používá měřítko 1 jednotka = 1 mm.
- Referenční výřez používá jeden středový hranol. Díky tomu povrchové desky zůstávají ve složeném náhledu souvislé a hranol se nezobrazuje jako prvek prostupující jejich boční hranou.

## Příprava pro elektroinstalaci

Panel obsahuje 40mm instalační předstěnu před parotěsnou rovinou. V rozsahu schválené výrobní dokumentace jsou součástí dodávky pouze:

- elektroinstalační chráničky (husí krky),
- vývrty pro následné osazení elektroinstalačních krabic.

Elektroinstalační krabice, kabeláž, zásuvky, vypínače a další koncové přístroje, zapojení ani revize elektroinstalace nejsou součástí dodávky panelu.

## Obsah

- `data/render_standard.json` – uzamčená kamera, referenční rozměry a pravidla zobrazení.
- `data/panel_1_2.json` – jediný zdroj pravdy pro vrstvy, vlastnosti a poznámku k rozsahu dodávky.
- `data/material_library.json` – verze 02 společné knihovny; zachovává původní materiály beze změny a doplňuje difuzní membránu.
- `scripts/generate_panel_assets.py` – generátor geometrie, kontrolních renderů a validačního protokolu.
- `scripts/render_photoreal_assets.py` – deterministický fotorealistický renderer se z-bufferem.
- `scripts/generate_layer_table.py` – generátor samostatného přehledu vrstev a jejich vlastností.
- `output/models/panel_1_2.obj` – přesný rozměrový model s pojmenovanými vrstvami.
- `output/photoreal/layers/` – samostatné transparentní interaktivní vrstvy.
- `output/photoreal/masks/` – masky pro zvýraznění vrstev v konfigurátoru.
- `output/photoreal/panel_1_2_asset_manifest.json` – mapování souborů na ID vrstev.
- `output/panel_1_2_vrstvy_a_vlastnosti.png` – samostatný prezentační list tabulky a rozsahu dodávky.

## Opakované vygenerování

```bash
python3 scripts/generate_panel_assets.py
python3 scripts/render_photoreal_assets.py
python3 scripts/generate_layer_table.py
```
