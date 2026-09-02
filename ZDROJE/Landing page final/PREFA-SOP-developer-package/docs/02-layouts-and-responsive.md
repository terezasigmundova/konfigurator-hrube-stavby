# 02 — Layouty a responzivita

## A. Landing page `/`

Desktop:

- sticky header 92 px,
- hero ve dvou sloupcích přibližně 42/58 %, maximální šířka 1840 px,
- vlevo claim, CTA a tři výhody,
- vpravo reálná fotografie s kartou ukázkového rozpočtu,
- pod hero čtyři procesní karty,
- následně dvě obsahové karty „Co cena zahrnuje“ a „Co si připravit“,
- závěrečné CTA a plovoucí podpora Tereza.

Breakpointy:

- 1380 px — menší mezery a typografie,
- 1080 px — hero, kroky a obsah se skládají do dvou/jednoho sloupce; aktivuje se mobilní menu,
- 680 px — jeden sloupec, CTA přes celou šířku, výsledek pod fotografií.

## B. Krok 1 `/konfigurator`

Desktop:

- horní hlavička 92 px,
- úvod kroku s osmidílným progress trackem,
- celoplošná karta technické podpory Tereza,
- grid 1,28/0,72: kalendář vlevo, základní parametry vpravo,
- harmonogram přes celou šířku,
- tmavá akční lišta na konci obsahu.

Breakpointy:

- 1120 px — kalendář a parametry pod sebou,
- 720 px — jednosloupcový layout, segmentované volby podlaží pod sebou, harmonogram 2 × 2.

## C. Krok 2 `/konfigurator/vykresy`

Desktop pracovní plocha:

```text
┌──────────────────── hlavička 76 px ────────────────────┐
│ levá navigace │ hlavní pracovní plocha │ pravý katalog │
│     236 px    │         fluid           │    352 px     │
└───────────────┴──────────────────────────┴───────────────┘
┌──────────────── spodní souhrnná lišta 88 px ────────────┐
```

Levá navigace:

- všech osm kroků je vždy viditelných,
- aktivní krok tmavý,
- dokončený krok aqua,
- budoucí blokovaný krok tlumený,
- Tereza je pod navigací v malé kartě.

Hlavní pracovní plocha:

- titulek kroku + čtyřfázová navigace,
- tmavý kontextový pokyn od Terezy,
- pracovní karta minimálně 530 px vysoká,
- poznámka ke kroku pod kartou.

Pravý katalog:

- šířka 320–352 px,
- karta vybrané konstrukce,
- volba varianty,
- položkový výpočet kroku.

Spodní lišta:

- cena aktuálního kroku vlevo,
- stav započtených konstrukcí,
- průběžná celková cena,
- tlačítko Zpět,
- jedno dominantní pokračovací tlačítko.

Breakpointy:

- 1440 px — sidebar 210 px, katalog 320 px, workflow se přesune pod titulek,
- 1120 px — katalog se přesune pod pracovní plochu do tří sloupců; footer už není fixed,
- 760 px — levá navigace je vodorovný scroll, všechny panely jsou pod sebou a akční lišta je svislá.

## Pravidla pro další kroky 3–8

Každý další krok zachovává stejné čtyři zóny:

1. navigace konfigurátoru,
2. kontextový header kroku,
3. hlavní pracovní plocha,
4. pravý kontextový panel + spodní cenová lišta.

Měnit se smí pouze obsah pracovní plochy a pravého panelu. Šířky, barvy, CTA hierarchie a přítomnost Terezy zůstávají konzistentní.
