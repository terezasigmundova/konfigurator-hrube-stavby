# 03 — Routy, stavy a interakce

## Routy

| Routa | Účel | Primární CTA |
| --- | --- | --- |
| `/` | landing page a vysvětlení hodnoty | Spočítat cenu z výkresů |
| `/konfigurator` | krok 1 — termín, místo, počet podlaží | Pokračovat k výkresům |
| `/konfigurator/vykresy` | krok 2 — vnější stěny 1. NP | Uložit vnější stěny 1. NP |

V produkční aplikaci lze použít jednu dynamickou routu, např. `/konfigurator/[step]`. Vizuální komponenty však musí zachovat přesný layout jednotlivých referencí.

## Landing page

- CTA vede do kroku 1.
- Navigace posouvá na sekce „Jak to funguje“, „Co cena zahrnuje“ a „Co si připravit“.
- Podpora Tereza je rozbalovací panel.
- Mobilní navigace používá dodané ikony menu/close.

## Krok 1 — Váš cíl

### Kalendář

- minimální volitelný termín je dnešní datum + 60 dní,
- nedostupné dny jsou disabled,
- výběr nového dne okamžitě přepočítá harmonogram,
- navigace po měsících nesmí umožnit vrátit se před první dostupný měsíc.

### Harmonogram

Referenční offsety vůči cílovému termínu:

- nezávazné zadání: −60 dní,
- upřesnění zadání a ceny: −53 dní,
- výrobní dokumentace: −30 dní,
- montáž a předání: cílové datum.

Produkční aplikace má offsety načítat z administrace nebo konfiguračních dat, ne natvrdo z komponenty.

### Parametry

- obec nebo PSČ,
- počet podlaží 1–3,
- uložení kroku před přechodem dále,
- stav se musí po návratu do kroku obnovit.

## Krok 2 — Výkresy a vnější stěny

### Fáze 1 — Nahrát

- podporované formáty PDF, PNG, JPG,
- drag & drop i běžný file picker,
- validace typu a velikosti souboru,
- po výběru zobrazit název souboru a možnost výměny,
- vzorový výkres je zkušební režim, nesmí se uložit jako klientský podklad.

### Fáze 2 — Měřítko

- uživatel zvolí dva body na známém rozměru,
- zadá skutečnou délku v milimetrech,
- aplikace vypočte převod pixelů na milimetry,
- měřítko uložit k danému výkresu a podlaží.

### Fáze 3 — Obkreslit

- kliknutím se přidávají body obrysu,
- snapping k rohům/hranám je doporučený,
- musí fungovat „Zpět bod“ a „Vymazat“,
- poslední bod může uzavřít polygon přichycením k prvnímu bodu,
- po uzavření vypočítat délky stěn a čistou plochu panelů.

### Fáze 4 — Zkontrolovat

- zobrazit uzavřený polygon, počet bodů a souhrn výměr,
- zobrazit zvolenou konstrukci a položkovou cenu,
- případné chyby nebo otevřený polygon zvýraznit v pracovním prostoru,
- až po validní kontrole povolit uložení kroku.

### Výběr konstrukce

- změna varianty okamžitě aktualizuje cenu panelů a celkovou cenu kroku,
- detail konstrukce se načítá z katalogu panelů,
- ceny, U-hodnota a kód konstrukce nesmí být natvrdo v prezentační komponentě.

## Chybové a systémové stavy

Povinné stavy pro všechny formulářové kroky:

- načítání,
- prázdný stav,
- validace vstupu,
- chyba nahrání,
- rozpracováno / neuloženo,
- automaticky uloženo,
- úspěšně dokončeno,
- konflikt změn nebo vypršená relace.

Chyby zobrazovat u konkrétního pole nebo v horním kontextovém pásu. Nepoužívat obecné alerty bez vazby na prvek.
