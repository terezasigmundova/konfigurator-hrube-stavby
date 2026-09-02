# 05 — QA checklist

## Vizuální konzistence

- [ ] Logo má správný poměr stran a není deformované.
- [ ] Používají se pouze dodané technické ikony.
- [ ] Texty mají kompletní české znaky a nejsou „rozsypané“.
- [ ] Nadpisy, UI text a poznámky používají správné typografické role.
- [ ] Všechny běžné karty mají ostré rohy a jednobodový rámeček.
- [ ] Aqua je použita pro aktivní stav a podporu, nikoli plošně.
- [ ] Tereza je zobrazena z dodané fotografie, nikoli jako ilustrace.
- [ ] Rozhraní nepoužívá generované fotografie domů nebo panelů.

## Landing page

- [ ] Hlavní CTA vede do kroku 1.
- [ ] Navigační odkazy vedou na správné sekce.
- [ ] Výsledková karta nepřekrývá důležitou část fotografie.
- [ ] Čtyři kroky mají shodnou výšku a rytmus.
- [ ] „Počet podlaží“ je první položka v sekci Co si připravit.
- [ ] Text používá označení „technická podpora“.

## Krok 1

- [ ] Nelze vybrat datum dříve než +60 dní.
- [ ] Změna data přepočítá všechny čtyři milníky.
- [ ] Místo stavby neukazuje cenu dopravy ani vzdálenost.
- [ ] Počet podlaží umožňuje právě hodnoty 1–3.
- [ ] Obnovení stránky zachová uložená data.
- [ ] CTA vede do kroku 2.

## Krok 2

- [ ] Funguje file picker i drag & drop.
- [ ] Nepodporovaný formát zobrazí konkrétní chybu.
- [ ] Velký soubor je odmítnut před odesláním.
- [ ] Zvolený soubor lze nahradit nebo odstranit.
- [ ] Kalibrace vyžaduje dva body a kladný rozměr.
- [ ] Přidání, vrácení a vymazání bodu funguje bez ztráty ostatních dat.
- [ ] Otevřený polygon nelze potvrdit.
- [ ] Změna panelu okamžitě přepočítá cenu.
- [ ] Cena ve spodní liště odpovídá pravému panelu.
- [ ] Uložení kroku poskytne jasný potvrzovací stav.

## Přístupnost

- [ ] Všechny interaktivní prvky jsou dostupné z klávesnice.
- [ ] Focus je viditelný a používá aqua obrys.
- [ ] Ikony mají buď popis, nebo `aria-hidden`.
- [ ] Tlačítka mají srozumitelný accessible name.
- [ ] Barvy nejsou jediným nositelem stavu.
- [ ] Formulářová chyba je propojena s konkrétním polem.
- [ ] Kontrast textů splňuje alespoň WCAG AA.

## Responzivita

- [ ] 1920 × 1080: pracovní plocha využívá šířku bez přehnaných prázdných okrajů.
- [ ] 1440 × 900: katalog a navigace zůstávají čitelné.
- [ ] 1024 × 768: katalog se přesune pod pracovní plochu bez horizontálního overflow.
- [ ] 390 × 844: všechny hlavní akce jsou dosažitelné jednou rukou a žádný text se nepřekrývá.
- [ ] Zoom 200 % nezpůsobí ztrátu ovládání.

## Výkon a stabilita

- [ ] SVG ikony se načítají z cache.
- [ ] Fotografie mají správné rozměry a moderní formát, pokud je to možné.
- [ ] PDF náhled se nenačítá v hlavním UI vlákně.
- [ ] Zpracování geometrie nesmí blokovat ovládání.
- [ ] Neuložené změny jsou chráněny při opuštění kroku.
