# PREFA ŠOP — implementační balíček pro vývojáře

Tento balíček obsahuje schválenou vizuální podobu a zdrojové komponenty pro:

1. landing page PREFA ŠOP,
2. krok 1 konfigurátoru — Váš cíl,
3. krok 2 konfigurátoru — Výkresy / vnější stěny 1. NP.

Aktuální funkční referenci lze otevřít na:

https://prefa-sop-final.terezasigmundova.chatgpt.site

## Co je závazné

- Logo PREFA ŠOP a dodané SVG ikony používat beze změny proporcí a kresby.
- Dodržet barevné tokeny, typografické role, technickou mřížku, ostré rohy a jemné jednobodové rámečky.
- Tereza je jedinou osobou technické podpory. Nepoužívat ilustraci ani karikaturu.
- Všechny další kroky konfigurátoru musí navazovat na pracovní plochu kroku 2: levá navigace, hlavní pracovní plocha, pravý kontextový panel a spodní souhrnná lišta.
- Obsah, výpočty a stavy konfigurátoru oddělit od prezentačních komponent. Vizuální komponenty mají přijímat data a callbacky přes props.

## Struktura balíčku

- `docs/01-design-system.md` — barvy, typografie, ikony a pravidla stylu.
- `docs/02-layouts-and-responsive.md` — rozložení tří hotových obrazovek a breakpointy.
- `docs/03-routes-and-interactions.md` — routy, stavy a očekávané interakce.
- `docs/04-component-contracts.md` — doporučené komponenty a jejich datová rozhraní.
- `docs/05-qa-checklist.md` — kontrolní seznam před předáním.
- `docs/06-licence-and-fonts.md` — důležitá poznámka k produkčním fontům a fotografiím.
- `design-tokens.css` a `design-tokens.json` — strojově čitelné tokeny.
- `source/` — referenční React/Next komponenty, styly a všechny použité assety.

## Doporučený postup integrace

1. Přenést assety z `source/public/` do veřejné složky cílové aplikace.
2. Přenést tokeny a `stable-fonts.css` do globálních stylů.
3. Rozdělit referenční stránky na sdílené komponenty podle `docs/04-component-contracts.md`.
4. Napojit komponenty na stávající datový model konfigurátoru.
5. Zachovat výpočty, ukládání projektu a nahrávání souborů v současném backendu; referenční kód slouží jako UX a vizuální vrstva.
6. Projít `docs/05-qa-checklist.md` na desktopu, tabletu i mobilu.

## Technologický základ reference

- React 19 / Next.js kompatibilní komponenty
- TypeScript
- globální CSS bez závislosti na komponentové knihovně
- SVG ikony jako samostatné soubory
- responzivní layouty založené na CSS Grid a Flexboxu

Referenční zdroj je záměrně čitelný a neobsahuje produkční backend, autentizaci ani trvalé ukládání nahraných výkresů.
