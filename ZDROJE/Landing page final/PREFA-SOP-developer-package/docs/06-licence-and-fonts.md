# 06 — Licence, fonty a fotografie

## Důležité: fonty z PDF toolkitu nejsou webfonty

Fonty vložené v PDF VESPER toolkitu jsou pouze znakové podmnožiny použité pro konkrétní stránky dokumentu. Nesmí se extrahovat a použít jako produkční webfonty: část českých znaků v nich chybí a v prohlížeči vznikají prázdná místa v textu.

Referenční implementace proto používá kompletní české kompatibilní alternativy:

- `Gotham UI` — soubor `gotham-web-book.otf` a `gotham-web-bold.otf`,
- `Flama UI` — soubor `flama-web-light.otf` a `flama-web-medium.otf`,
- `Justus UI` — soubor `justus-web-light.otf` a `justus-web-bold.otf`.

## Produkční varianta

Před veřejným spuštěním:

1. zajistit webovou licenci pro kompletní Gotham, Flama a Justus,
2. dodat řezy WOFF2 s plnou sadou Latin Extended / Czech,
3. zachovat aliasy font-family nebo aktualizovat pouze soubor `stable-fonts.css`,
4. otestovat všechny české znaky: `ěščřžýáíéůúďťň` a jejich verzálky,
5. ponechat bezpečný systémový fallback.

Nahradí se pouze zdroje fontů; typografická hierarchie a rozložení se nemění.

## Logo a ikony

Logo PREFA ŠOP a technické ikony jsou projektové podklady dodané pro tento konfigurátor. Zachovat původní SVG, neměnit geometrii, tloušťku linek ani pořadí elementů.

## Fotografie

- `vesper-realizace.jpg` je fotografie realizace VESPER HOMES,
- `tereza.png` je portrét technické podpory,
- ověřit interní souhlas a rozsah použití při veřejném nasazení,
- fotografie neposílat do externích generativních nástrojů bez souhlasu držitele práv a fotografované osoby.
