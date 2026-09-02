# Parametrický zdroj panelu 1.4

Panel 1.4 je projektově definovaný masivní CLT panel pro obvodovou stěnu. Dodávaná tloušťka je 84 mm. Panel je jednostranně pohledový, bez tepelné izolace, membrán, roštu a fasády.

## Závazné parametry

- referenční výřez 625 × 900 mm;
- třívrstvé CLT 28 / 28 / 28 mm;
- krycí lamely ve směru výšky, střední lamela příčně;
- interiérová strana v pohledové kvalitě VI;
- exteriérová strana v nepohledové kvalitě NVI;
- pohledová plocha se vizualizuje jako souvislá celistvá plocha masivního dřeva bez viditelných spár, drážek nebo rastru prken;
- přirozeně se zobrazuje pouze kresba vláken a suků;
- křížové vrstvení se zobrazuje pouze na řezu, hranách a v rozloženém stavu;
- panel neobsahuje montážní ani instalační předstěnu;
- součástí dodávky jsou projektově určené vývrty přímo v CLT, osazené chráničkami pro vedení elektroinstalace;
- součástí dodávky jsou také vývrty pro následnou montáž elektroinstalačních krabic;
- elektroinstalační krabice, kabeláž, koncové přístroje, zapojení ani revize nejsou součástí dodávky;
- náhled konfigurátoru obsahuje dvě reprezentativní svislé trasy s chráničkami Ø 20 mm ve střední lamele;
- obecný výřez nezobrazuje vývrty pro krabice, protože jejich počet a poloha se řídí konkrétním elektroprojektem;
- konečný počet, průměr a poloha všech vývrtů se řídí elektroprojektem, statickým posouzením a CNC výrobními daty.

Tloušťka 84 mm je projektová varianta PREFA ŠOPÍK. Není prezentována jako aktuální standardní tloušťka výrobku Stora Enso; technické podklady slouží jako základ pro princip CLT, typ stěnového panelu, povrchové kvality a fyzikální hodnoty.

## Zdroj pravdy

- `data/panel_1_4.json` – geometrie, vlastnosti, rozsah dodávky a pravidlo pohledové plochy;
- `data/render_standard.json` – jednotná kamera, měřítko a pozice;
- `data/material_library.json` – uzamčená materiálová knihovna `PREFA_SOPIK_MATERIALS_03`;
- `data/sources.json` – dohledatelné technické zdroje.

## Výstupy

- `output/models/panel_1_4.obj` – rozměrový model v mm se třemi lamelami a skutečnými otvory ve střední lamele;
- `output/validation/panel_1_4_geometry_control.png` – kontrolní list proporcí;
- `output/photoreal/panel_1_4_photoreal_full.png` – plný pohled se souvislou pohledovou plochou;
- `output/photoreal/panel_1_4_photoreal_assembled_cutaway.png` – stupňovitý řez;
- `output/photoreal/panel_1_4_photoreal_exploded.png` – rozložené lamely;
- `output/photoreal/layers/` a `output/photoreal/masks/` – transparentní interaktivní assety;
- `output/panel_1_4_vrstvy_a_vlastnosti.png` – samostatný přehled vlastností a rozsahu dodávky.

## Reprodukce

```bash
python scripts/prepare_clt_materials.py
python scripts/generate_panel_assets.py
python scripts/generate_layer_table.py
python scripts/render_photoreal_assets.py
```

## Technický základ

- Stora Enso: https://www.storaenso.com/en/products/mass-timber-construction/building-products/clt
- Stora Enso CLT Technical Brochure: https://www.storaenso.com/-/media/documents/download-center/documents/product-brochures/wood-products/clt-by-stora-enso-technical-brochure-en.pdf
