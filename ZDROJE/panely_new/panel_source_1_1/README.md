# Parametrický zdroj panelu 1.1

Tato složka je první kontrolní balík pro jednotný zobrazovací systém typizovaných skladeb konfigurátoru PREFA ŠOPÍK.

## Zásadní pravidla

- Veškerá geometrie je zadána v milimetrech.
- Desky Fermacell jsou modelovány ve skutečné tloušťce 12,5 mm.
- Celková dodávaná tloušťka panelu 1.1 je 341,0 mm.
- Izolace L03 a L07 vyplňují své rámy a do celkové tloušťky se samostatně nepřičítají.
- Složený a rozložený render vznikají ze stejných objektů. Rozložený stav pouze přidává jednotný prezentační posun mezi konstrukčními skupinami.
- OBJ používá měřítko 1 jednotka = 1 mm.
- Referenční výřez používá jeden středový hranol a řez je na obou stranách veden izolací. Tím povrchové desky zůstávají ve složeném náhledu souvislé a hranol se nezobrazuje jako prvek prostupující jejich boční hranou.

## Příprava pro elektroinstalaci

Panel obsahuje 40mm instalační předstěnu před parotěsnou rovinou. V rozsahu schválené výrobní dokumentace jsou součástí dodávky pouze:

- elektroinstalační chráničky (husí krky),
- vývrty pro následné osazení elektroinstalačních krabic.

Elektroinstalační krabice, kabeláž, zásuvky, vypínače a další koncové přístroje, zapojení ani revize elektroinstalace nejsou součástí dodávky panelu.

## Obsah

- `data/render_standard.json` - uzamčená kamera, referenční rozměry a pravidla zobrazení.
- `data/panel_1_1.json` - jediný zdroj pravdy pro vrstvy a jejich parametry.
- `scripts/generate_panel_assets.py` - generátor geometrie, renderů a validačního protokolu.
- `output/models/panel_1_1.obj` - přesný rozměrový model s pojmenovanými vrstvami.
- `output/renders/` - složený a rozložený kontrolní render.
- `output/validation/` - kontrolní list a strojově čitelný výsledek validace.

## Opakované vygenerování

```bash
python3 scripts/generate_panel_assets.py
```

## Fotorealistické výstupy

Po schválení geometrie byla doplněna uzamčená knihovna materiálů a deterministický fotorealistický renderer:

- `data/material_library.json` - společné měřítko a parametry materiálových textur.
- `assets/material_atlas_v1.png` - zdrojový atlas materiálů.
- `scripts/render_photoreal_assets.py` - renderer zachovávající schválenou geometrii a kameru.
- `scripts/generate_layer_table.py` - generátor samostatného přehledu vrstev, rozsahu dodávky a elektro-přípravy.
- `output/photoreal/` - plný, stupňovitě odříznutý a rozložený render.
- `output/photoreal/layers/` - samostatné transparentní interaktivní vrstvy.
- `output/photoreal/masks/` - masky pro zvýraznění vrstev v konfigurátoru.
- `output/photoreal/panel_1_1_asset_manifest.json` - mapování všech souborů na ID vrstev.

Fotorealistické výstupy se znovu vytvoří příkazem:

```bash
python3 scripts/render_photoreal_assets.py
python3 scripts/generate_layer_table.py
```
