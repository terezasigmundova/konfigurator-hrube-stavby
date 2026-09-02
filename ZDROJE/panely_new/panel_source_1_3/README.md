# Parametrický zdroj panelu 1.3

Tato složka navazuje na uzamčený zobrazovací systém typizovaných skladeb konfigurátoru PREFA ŠOPÍK.

## Zásadní pravidla

- Veškerá geometrie je zadána v milimetrech.
- Desky Fermacell jsou modelovány ve skutečné tloušťce 12,5 mm.
- Panel 1.3 vychází z konstrukčního jádra panelu 1.1.
- Celková dodávaná tloušťka panelu 1.3 je 225,5 mm.
- Na straně interiéru je součástí dodávky pouze otevřený 40mm rošt instalační předstěny L01.
- Minerální izolace instalační předstěny a její vnitřní zaklopení deskou Fermacell nejsou součástí dodávky.
- Izolace L05 vyplňuje nosný rám L04 a do celkové tloušťky se samostatně nepřičítá.
- Dodávka končí na straně exteriéru surovou deskou Fermacell L06.
- Kontaktní tepelná izolace, armovací vrstva, fasádní systém ani finální pohledové úpravy nejsou součástí dodávky.
- Složený a rozložený render vznikají ze stejných objektů. Rozložený stav pouze přidává jednotný prezentační posun mezi konstrukčními skupinami.
- OBJ používá měřítko 1 jednotka = 1 mm.
- Referenční výřez používá jeden středový hranol. Díky tomu povrchové desky zůstávají ve složeném náhledu souvislé a hranol se nezobrazuje jako prvek prostupující jejich boční hranou.

## Rozsah dokončení klientem

Klient u ekonomické varianty panelu 1.3 zcela zajišťuje:

- přípravu pro elektroinstalaci v instalační předstěně, včetně chrániček a vývrtů pro krabice,
- vložení minerální izolace do 40mm instalační předstěny,
- vnitřní zaklopení instalační předstěny deskou Fermacell 12,5 mm,
- finální povrchovou úpravu interiéru.

Platná skladba je pro uživatelský výstup přečíslována souvisle L01–L06. Pole `derived_from_layer_id` v datovém souboru zachovává vazbu na původní vrstvy panelu 1.1.

## Obsah

- `data/render_standard.json` – uzamčená kamera, referenční rozměry a pravidla zobrazení.
- `data/panel_1_3.json` – jediný zdroj pravdy pro vrstvy, vlastnosti a poznámku k rozsahu dodávky.
- `data/material_library.json` – verze 02 společné knihovny; zachovává původní materiály beze změny a doplňuje difuzní membránu.
- `scripts/generate_panel_assets.py` – generátor geometrie, kontrolních renderů a validačního protokolu.
- `scripts/render_photoreal_assets.py` – deterministický fotorealistický renderer se z-bufferem.
- `scripts/generate_layer_table.py` – generátor samostatného přehledu vrstev a jejich vlastností.
- `output/models/panel_1_3.obj` – přesný rozměrový model s pojmenovanými vrstvami.
- `output/photoreal/layers/` – samostatné transparentní interaktivní vrstvy.
- `output/photoreal/masks/` – masky pro zvýraznění vrstev v konfigurátoru.
- `output/photoreal/panel_1_3_asset_manifest.json` – mapování souborů na ID vrstev.
- `output/panel_1_3_vrstvy_a_vlastnosti.png` – samostatný prezentační list tabulky a rozsahu dodávky.

## Opakované vygenerování

```bash
python3 scripts/generate_panel_assets.py
python3 scripts/render_photoreal_assets.py
python3 scripts/generate_layer_table.py
```
