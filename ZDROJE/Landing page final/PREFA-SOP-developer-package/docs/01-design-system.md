# 01 — Design systém PREFA ŠOP

## Charakter značky

PREFA ŠOP je technická, důvěryhodná a klidná značka propojená s VESPER HOMES. Rozhraní má působit jako přesný projekční nástroj, nikoli jako dětský konfigurátor nebo běžný e-shopový template.

Základní principy:

- čistá pravoúhlá geometrie,
- velmi jemná konstrukční mřížka v pozadí,
- velkorysá typografie a volný prostor,
- téměř žádné kulaté karty,
- jedna akcentní barva aqua,
- technické lineární ikony,
- fotografie pouze reálné a firemní,
- Tereza jako lidský prvek a technická podpora.

## Barvy

| Token | Hodnota | Použití |
| --- | --- | --- |
| `--prefa-paper` | `#f7f5f1` | základní pozadí |
| `--prefa-white` | `#ffffff` | karty a aktivní plochy |
| `--prefa-linen` | `#e7e0d5` | sekundární výplně, aktivní neutrální stav |
| `--prefa-line` | `#ded8cf` | rámečky a oddělovače |
| `--prefa-line-soft` | `#e9e4dc` | jemné oddělovače v kartách |
| `--prefa-stone` | `#9e998e` | pomocné texty a neaktivní stavy |
| `--prefa-cedar` | `#5e5c55` | sekundární text |
| `--prefa-ink` | `#292527` | primární text, tmavá tlačítka |
| `--prefa-aqua` | `#759192` | aktivní krok, focus, technická podpora |
| `--prefa-amber` | `#d39a52` | pouze upozornění nebo výjimečný akcent |

Nepřidávat další výrazné značkové barvy bez schválení. Zelenou používat jen pro skutečný úspěšný stav, nikoli jako obecnou konverzní barvu.

## Typografie

Role fontů vychází z VESPER toolkitu:

- `Gotham` — nadpisy, ceny a důležité hodnoty,
- `Flama` — navigace, formuláře, běžný UI text,
- `Justus` — poznámky a redakční doprovodný text.

Referenční balíček používá webově stabilní české alternativy pod názvy `Gotham UI`, `Flama UI` a `Justus UI`. Pro ostré nasazení je nutné dosadit licencované kompletní WOFF2 soubory; podrobnosti jsou v `06-licence-and-fonts.md`.

Typografická hierarchie:

| Prvek | Velikost desktop | Řez | Poznámka |
| --- | ---: | --- | --- |
| Landing H1 | 50–66 px | display 700 | řádkování 1,04 |
| Konfigurátor H1 | 38–48 px | display 700 | řádkování 1–1,08 |
| H2 | 28–42 px | display 700 | záporný tracking |
| H3 | 17–23 px | display 700 | bez verzálek |
| Běžný text | 16–19 px | UI 400 | řádkování 1,4–1,55 |
| Eyebrow | 11–16 px | UI 700 | verzálky, tracking 0,08–0,13 em |
| Technická poznámka | 11–16 px | note 300/400 | tlumená barva |

## Mřížka a rozestupy

Základní rytmus je 8 px. Doporučené hodnoty: 8, 12, 16, 20, 24, 32, 40, 48, 64 px.

Konstrukční mřížka v pozadí:

```css
background:
  linear-gradient(rgba(231, 224, 213, .34) 1px, transparent 1px),
  linear-gradient(90deg, rgba(231, 224, 213, .34) 1px, transparent 1px),
  var(--prefa-paper);
background-size: 64px 64px;
```

## Rámečky, stíny a rohy

- standardní rámeček: `1px solid var(--prefa-line)`,
- rohy: 0–2 px; oblý tvar patří pouze avataru Terezy a malým stavovým tečkám,
- hlavní stín: `0 18px 60px rgba(44, 39, 36, .14)`,
- pracovní karty používají jemnější stín `0 12px 36px rgba(44, 39, 36, .06)`.

## Ikony

- používat pouze soubory z `source/public/icons`,
- zachovat poměr stran a žádné ikony nepřekreslovat přes CSS,
- standardní UI ikona: 24–32 px,
- obsahová technická ikona: 42–56 px,
- procesní ikona: 88–112 px,
- bílé ikony na tmavém pozadí lze vytvořit filtrem `brightness(0) invert(1)`.

## Tlačítka

Primární tlačítko:

- tmavé `--prefa-ink` nebo světlé `--prefa-linen` na tmavé liště,
- výška 52–68 px,
- žádné velké zaoblení,
- text 600–700,
- ikona šipky vpravo,
- hover mění výplň a může použít posun `translateY(-2px)`.

Sekundární ovládání:

- bílé nebo `--prefa-paper`,
- rámeček `--prefa-line`,
- aktivní stav je tmavý nebo jemně aqua.

## Fotografie

- používat pouze skutečné realizace VESPER HOMES,
- fotografie neořezávat tak, aby dům ztratil čitelnost,
- nepoužívat generované stavby,
- na pracovních obrazovkách mají fotografie ustoupit funkční ploše.
