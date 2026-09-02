# VESPER / ŠOPÍK UI Kit — ikony a tlačítka

Verze 1.0 — návrh jednoduchého ovládacího systému inspirovaného klidnou hierarchií produktových plánovačů. Neobsahuje ani nekopíruje proprietární grafické podklady IKEA.

## Obsah balíčku

- `icons/*.svg` — samostatné SVG ikony vhodné pro web, Figma a dokumentaci.
- `vesper-icons.svg` — SVG sprite pro efektivní použití ve webové aplikaci.
- `icon-manifest.json` — seznam ikon, českých názvů a kategorií.
- `tokens.css` — barevné, rozměrové a stavové proměnné.
- `buttons.css` — tlačítka, ovládací pilulky, nástroje a stavové štítky.
- `VesperIcon.tsx`, `VesperButton.tsx`, `VesperPill.tsx` — volitelné React/TypeScript komponenty.
- `preview.html` — kompletní interaktivní náhled.
- `ui-kit-preview.svg` a `ui-kit-preview.png` — rychlý obrazový přehled.

## Základní pravidla ikon

1. Formát 24 × 24 px, linkový styl, tloušťka linky 2 px.
2. Kulaté konce a spoje linek.
3. Ikona používá `currentColor`; barvu řídí nadřazené tlačítko.
4. V běžném tlačítku zobrazovat ikonu velikosti 20 px, v toolbaru 20–22 px.
5. Samostatnou ikonu bez textu používat jen pro obecně známé akce: zavřít, zoom, zpět/znovu.
6. Stav nikdy nesdělovat pouze barvou — vždy doplnit text nebo přístupný popis.
7. Interní názvy ikon jsou anglické a stabilní, uživatelské texty zůstávají české.

## HTML použití sprite

Zkopírujte `vesper-icons.svg` do veřejné složky aplikace:

```html
<button class="v-btn v-btn--primary">
  <span>Uložit a pokračovat</span>
  <svg class="v-icon" aria-hidden="true">
    <use href="/vesper-icons.svg#icon-next"></use>
  </svg>
</button>
```

## Tlačítkové varianty

- `v-btn--primary` — jediná hlavní akce obrazovky.
- `v-btn--teal` — výrazná pomocná akce, například uložit projekt.
- `v-btn--secondary` — návrat nebo alternativní cesta.
- `v-btn--soft` — běžná úprava bez vysoké priority.
- `v-btn--danger` — odstranění nebo vyčištění.
- `v-pill` — volba části domu nebo kategorie; stav volby přes `aria-pressed`.
- `v-tool` — nástroj kreslicího plátna; aktivní nástroj přes `aria-pressed=true`.
- `v-icon-btn` — samostatná obecně známá ikonová akce s povinným `aria-label`.

## Doporučená hierarchie

- Na obrazovce smí být pouze jedno primární tlačítko.
- Hlavní CTA má výšku 44–52 px a text popisující výsledek: „Uložit vnější stěny a pokračovat“.
- Výběrové pilulky mají výšku 52 px a při volbě používají 2px obrys, nikoli změnu barvy bez dalšího rozlišení.
- Zelená značí pouze skutečně dokončený stav.
- Oranžová značí upozornění nebo odborné posouzení, nikoli běžnou volbu.
- Electric Teal je akcent; Basalt Navy zůstává hlavní barvou textu a primárního CTA.

## Přístupnost

- Minimální aktivní plocha ovládání 44 × 44 px.
- Viditelný focus ring pro klávesnici.
- Dekorativní ikony v tlačítkách mají `aria-hidden=true`; význam sděluje text tlačítka.
- Ikonová tlačítka mají vždy `aria-label` nebo viditelný tooltip.
- Nepoužívat barvu jako jediný nositel stavu.

## Licence

Část obecných symbolů vychází z otevřené knihovny Lucide Icons (MIT). Doménové ikony konstrukcí byly vytvořeny pro tento balíček.
