PROTOKOL CHYB K OPRAVĚ

PREFA ŠOP — finální vizuální sjednocení

Kontrola landing page, prvního kroku a konfigurátoru po zapracování předchozího UX auditu

ROZSAH

13 screenshotů · desktopové stavy landing page a kroků 1–6

ÚČEL

Pouze oprava vizuálních odchylek; bez změny výpočtů a funkční logiky.

MIMO AUDIT

Kruhové značky „N“ jsou součást vývojářského serveru a nepovažují se za chybu.

Jak protokol číst

P0  systémová odchylka, kterou je nutné odstranit před dalším vizuálním schvalováním.  P1  komponentová odchylka; opravit ve stejné implementační vlně.

Způsob opravy: Každou položku řešit v kořenové sdílené komponentě nebo tokenu. Neopravovat jednotlivý screenshot lokálním CSS přepisem.

Index kontrolovaných obrazovek

ID

Čas

Stav

S01

15_04_40

Landing page

S02

15_05_46

Krok 1 — cíl, kalendář, místo a podlaží

S03

15_06_03

Vnější stěny — prázdné nahrání

S04

15_09_37

Vnější stěny — připravený výkres

S05

15_11_13

Vnější stěny — kalibrace měřítka

S06

15_12_23

Vnější stěny — kontrola obrysu

S07

15_12_47

Vnější stěny — otevřená podpora

S08

15_17_11

Vnitřní stěny — kontrola + podpora

S09

15_18_47

Strop — výběr konstrukce + podpora

S10

15_20_42

Střecha — prázdné nahrání

S11

15_21_54

Střecha — připravený výkres

S12

15_23_40

Střecha — kontrola ploch

S13

15_24_26

Rozpočet a předobjednávka

P0 · SYSTÉMOVÉ CHYBY

Globální sjednocení

ID

P

Výskyt

Chyba → požadovaná oprava

Akceptace

VIS-001

P0

S01–S13

CHYBA  Stejná textová role má mezi komponentami rozdílný font, řez, velikost i prostrkání; nejvíce v řadách tlačítek, pravém panelu a souhrnu.

OPRAVA  Vynutit jedinou typografickou mapu: Gotham pouze nadpisy/ceny, Flama veškeré UI a text, Justus pouze poznámky. Odstranit lokální font-family/font-size/letter-spacing z komponent.

Computed styles stejné role jsou shodné na všech 13 stavech; žádný fallback mimo trojici toolkit fontů.

VIS-002

P0

S02–S13

CHYBA  Tlačítka v jedné řadě nemají shodnou výšku, velikost popisku, vnitřní odsazení ani polohu ikony.

OPRAVA  Použít tokeny: Primary 56 px; Secondary/Mode/Stepper 44 px; Icon-only 44×44 px. Popisek všude Flama 600, 14/18 px, letter-spacing 0; ikona 18 px; mezera ikona–text 8 px.

Každá homogenní řada je na pixel stejné výšky; baseline textů i ikon sedí; žádný popisek není opticky větší či menší.

VIS-003

P0

S02–S13

CHYBA  Mísí se schválené technické ikony s generickými upload/lock/trash/check/hand/home/rotate ikonami, nativními prvky a různými šipkami.

OPRAVA  Všechny ikony načítat výhradně z jednoho schváleného PREFA SVG registru. UI ikona 18 px, obsahová 24 px, stejný stroke a zakončení; zákaz emoji, Unicode symbolů, icon-fontů a nativních glyphů.

Automatický scan nenajde jiné SVG zdroje; vizuální kontrola potvrzuje jednotný stroke ve všech komponentech.

VIS-004

P0

S03–S13

CHYBA  V pracovních plochách zůstává starý modrošedý systém: dashed rámečky, modré texty, nativní checkbox, červené malé tlačítko a zelený success symbol.

OPRAVA  Přemapovat na paletu Paper/White/Linen/Line/Ink/Aqua/Amber. Červenou použít pouze pro skutečnou chybu; reverzibilní varování Amber. Success = Aqua; checkbox = vlastní PREFA komponenta.

Na obrazovkách není legacy modrá ani nativní checkbox; všechny stavy používají pouze definované tokeny.

VIS-005

P0

S03–S13

CHYBA  Stavy completed/current/available/locked/attention nejsou stejné v levém menu a horním stepperu; u Stropu se objevuje nepojmenovaný oranžový čtverec.

OPRAVA  Implementovat jednu stavovou mapu: completed Aqua+check, current Ink, available White+Aqua outline, locked Linen+Stone+lock, attention Amber+jasný textový důvod. Bez prázdných barevných čtverců.

Stejný stav má vždy stejný symbol, barvu a typografii; pozornost je vždy vysvětlena textem nebo tooltipem.

VIS-006

P0

S01–S13

CHYBA  Řada sekundárních textů je pod bezpečnou čitelností a disabled prvky téměř mizí; problém je výrazný v kalendáři, tabulkách, katalogu a S13.

OPRAVA  Dodržet minima: UI/technická data 13–14/18 px, body 16/23 px, poznámka 14/21 px. Disabled opacity nesmí snížit text pod čitelný kontrast; neměnit velikost oproti enabled.

Žádný informativní text pod 13 px; všechny enabled/disabled popisky jsou čitelné při 100% zoomu.

VIS-007

P0

S03–S12

CHYBA  Sdílené šablony stejného kroku se vizuálně rozcházejí podle fáze (upload, preview, kalibrace, obkreslení, kontrola).

OPRAVA  Sjednotit do jedné sady komponent UploadCard, StageStepper, SupportBanner, ActionToolbar, Canvas, MeasureList, CatalogCard a StickyFooter bez page-specific variant rozměrů.

Stejná komponenta má shodné DOM pořadí, tokeny a rozměry v kroku stěn, stropu i střechy.

VIS-008

P0

S03–S13

CHYBA  Sticky footer mění poměry textů a tlačítek, některé stránky nemají dostatečný spodní offset a obsah působí zakrytě.

OPRAVA  Jedna sdílená patička: výška 88 px, cena kroku vlevo, stav uprostřed, celková cena + Back + jediná Primary CTA vpravo. Přidat content padding-bottom ≥ výška patičky + 24 px.

Footer je identický ve všech krocích, obsah za ním nekončí a CTA má vždy 56 px a stejný textový styl.

P1 · NAVIGACE A POSTUP

Shell, levé menu a horní stepper

ID

P

Výskyt

Chyba → požadovaná oprava

Akceptace

VIS-009

P1

S01–S13

CHYBA  Logo má mezi landing page, krokem 1 a konfigurátorem odlišnou optickou velikost a odsazení.

OPRAVA  Použít jediný SVG asset a jedinou HeaderLogo komponentu; měnit pouze layoutový kontext, nikoli vnitřní rozměry, řez nebo rasterizaci.

Logo je ostré a opticky stejně vysoké na všech stránkách; ochranná zóna je shodná.

VIS-010

P1

S03–S13

CHYBA  Číslo/check/lock v levém menu mají rozdílný rozměr, stroke i zarovnání; víceřádkové položky mění rytmus seznamu.

OPRAVA  Řádek 52 px min., stavový box 32×32 px, text Flama 600 14/18, mezera 12 px. Víceřádkový popisek vertikálně centrovat; stavová ikona vždy z PREFA registru.

Všechny řádky drží stejnou osu; boxy tvoří jednu svislou linii a dlouhý název nerozbíjí mezery.

VIS-011

P1

S03–S13

CHYBA  „Smazat konfiguraci“ je příliš světlé, používá cizí koš a nemá jednoznačný stav destructive action.

OPRAVA  Použít standardní tertiary/destructive text button 44 px s ikonou z registru; default Ink/Cedar, hover/error potvrzení dle stejné komponenty. Nesmí působit jako disabled.

Ovladač je čitelný a od locked položek se liší významem i interakcí.

VIS-012

P1

S03–S12

CHYBA  Horní StageStepper používá různé kruhy, checky a zvláštní zápis „4“ v uvozovkách; disabled položky mění velikost textu.

OPRAVA  Čtyři segmenty 44 px se stejnou šířkou/paddingem; čísla 1–4 bez uvozovek, completed = schválený check, current = Ink, upcoming = čitelný Stone. Text vždy 14/18 px.

Nahrát/Měřítko/Obkreslit/Zkontrolovat mají identickou geometrii ve všech stavech a žádný symbol „4“ v uvozovkách.

P1 · TECHNICKÁ PODPORA

Tereza — banner, launcher a drawer

ID

P

Výskyt

Chyba → požadovaná oprava

Akceptace

VIS-013

P1

S03–S12

CHYBA  Tlačítka „Poradit se“ a „Skrýt“ v tmavém banneru mají nízký kontrast, jiné písmo a vypadají jako disabled.

OPRAVA  Použít jednotnou inverse Secondary komponentu 44 px; aktivní text a border v White/Aqua dle schváleného stavu. „Skrýt“ může být tertiary inverse, ale se stejnou výškou a typografií.

Obě akce jsou na první pohled aktivní, čitelné a baseline sedí s textem banneru.

VIS-014

P1

S07–S09

CHYBA  Otevřený drawer překrývá stepper a pravý katalog nekontrolovaně; pod drawerem zůstává viditelný kus cenové karty a chybí zřetelný Close.

OPRAVA  Drawer 420 px, od headeru po horní hranu footeru, vlastní z-index; buď zcela nahradí pravý panel, nebo použije scrim — ne kombinaci. Přidat 44×44 Close z UI setu.

Při otevření není vidět fragment katalogu, žádný ovladač není napůl zakrytý a drawer lze zavřít myší i klávesnicí.

VIS-015

P1

S07–S09

CHYBA  Drawer míchá velikosti FAQ, kontaktu a metadat; kontaktní karta má jinou typografii i rámeček než ostatní PREFA karty.

OPRAVA  Nadpis 20/25 Gotham; mezititulek 12/15 uppercase Flama; body 14–16/21–23 Flama; kontaktní karta White/Paper + Line, radius 0–2 px. Telefon/e-mail stejné UI role.

V draweru nejsou jednorázové font-size a všechny bloky odpovídají shodným textovým rolím.

VIS-016

P1

S01 vs. S03–S12

CHYBA  Landing launcher, banner a drawer používají odlišné portrétní rámečky, ikony podpory a barvy okrajů.

OPRAVA  Sdílet SupportAvatar a SupportAction ikony. Fotografie stejný kruhový crop, stejný Aqua/Line ring; text vždy „Tereza · technická podpora“.

Avatar, označení a ikona podpory jsou shodné na landing page i v konfigurátoru.

P1 · UPLOAD A PRACOVNÍ NÁSTROJE

UploadCard, toolbar a kalibrace

ID

P

Výskyt

Chyba → požadovaná oprava

Akceptace

VIS-017

P1

S03, S10

CHYBA  Prázdný dropzone používá legacy modrou dashed linku a generickou upload ikonu; textové úrovně jsou příliš drobné.

OPRAVA  Border 1 px Line (dashed jen pokud je součástí schválené komponenty), approved upload ikona 24 px, nadpis 16/22 Flama 600, pomocný text min. 14/20. Hover/focus Aqua.

Upload stěn a střechy je pixelově stejná komponenta a používá tutéž ikonu i typografii.

VIS-018

P1

S04, S11

CHYBA  Preview stav má směs pillu, textových linků, generické rotate ikony a CTA s jinou výškou/písmem než ostatní primary actions.

OPRAVA  Success badge, Rotate, Replace a Insert mapovat na badge/text-button/Primary z knihovny; jednotné ikony 18 px. Primary „Vložit…“ 56 px, Flama 600 14/18.

Obě preview karty mají stejné rozměry, akce a typografii; žádný jednorázový symbol nebo výška.

VIS-019

P1

S05–S06, S08, S12

CHYBA  ActionToolbar míchá velké a malé popisky, různé ikony a nested prvky; aktivní nástroj nemá stejnou výšku jako okolní tlačítka.

OPRAVA  Každá samostatná akce = 44 px control. Skupiny oddělit 8 px, ne vnořenými mini-tlačítky bez mřížky. Active Mode = Ink; Secondary = White/Line; popisek 14/18.

Všechny ovladače toolbaru mají společnou osu, stejné paddingy a ikony z UI setu.

VIS-020

P1

S05–S06, S08, S12

CHYBA  „Měřítko aktivní / Upravit / Zrušit měřítko“ kombinuje tři rozdílné velikosti a červenou mimo paletu.

OPRAVA  Vytvořit jeden ScaleStatus compound control: status + dvě 40/44 px akce; success Aqua, edit neutral, cancel Amber outline. Červená pouze při validaci chyby.

Compound control je stejný ve stěnách i střeše; žádná část není menší než 40 px.

VIS-021

P1

S05

CHYBA  Kalibrační panel má plnou sytou oranžovou plochu, velmi malé instrukce a nesourodé input/button/Back.

OPRAVA  Použít Pale Amber background + 1 px Amber border, text Ink min. 13/18. Input 44 px; „Potvrdit kalibraci“ Secondary/Primary 44 px; „Zpět“ tertiary 44 px.

Instrukce jsou čitelné bez zoomu; všechny tři ovladače mají shodnou výšku a jasnou hierarchii.

P1 · CANVAS A DATA

Pracovní plocha, stavy a měřené položky

ID

P

Výskyt

Chyba → požadovaná oprava

Akceptace

VIS-022

P1

S05–S06, S08, S12

CHYBA  Zoom používá starý modrý rámeček a jiný styl +/− než zbytek UI.

OPRAVA  Použít společný ZoomControl: dvě IconButton 44×44, hodnota 14/18 Flama 600, White/Line, focus Aqua; bez legacy blue.

Zoom je ve všech canvasech vizuálně i rozměrově identický.

VIS-023

P1

S05–S06

CHYBA  Success, checkbox a warning používají zelený kruh, nativní modrý checkbox a žlutý blok z různých systémů.

OPRAVA  Success = approved Aqua status icon; Checkbox = vlastní 20/44 PREFA input; Warning = Pale Amber + Amber border + approved warning icon. Zachovat sémantické focus/error stavy.

Na pracovních obrazovkách nejsou nativní checkboxy ani zelené legacy symboly.

VIS-024

P1

S06, S08, S12

CHYBA  MeasureList a technické řádky mají příliš malé/monospace působící texty, rozdílné výšky selectů a starou modrošedou výplň.

OPRAVA  Technická data Flama 13–14/18 s tabular numerals; řádek min. 48 px; select/input 40 px; hlavička Paper/Linen, border Line. Kód může být 600, nikoli jiný font.

Všechny řádky jsou čitelné při 100 %, hodnoty se nelepí k okrajům a selecty mají shodnou výšku.

VIS-025

P1

S05–S12

CHYBA  Sekce pod canvasem (odpočet otvorů, plocha, upozornění) používají jinou typografii, spacing a barvy než okolní karty.

OPRAVA  Převést na standard SectionCard: heading 16/22, supporting 14/20, 24 px padding, 1 px Line, vertikální rytmus 8/16/24. Badge s plochou = jednotný InfoBadge.

Všechny podsekce drží stejnou šířku, padding, border a textové role.

VIS-026

P1

S05–S12

CHYBA  Tenké texty na technickém podkladu a v placeholderu poznámky jsou místy téměř nečitelné.

OPRAVA  Sekundární text minimálně Cedar/Stone se schváleným kontrastem; placeholder nesmí být světlejší než Stone. Nepoužívat opacity na rodičích textu.

Text je čitelný na Paper/White i při běžném 100% zoomu; disabled se liší stavem, ne velikostí.

P1 · PRAVÝ PANEL

Katalog konstrukcí a průběžný výpočet

ID

P

Výskyt

Chyba → požadovaná oprava

Akceptace

VIS-027

P1

S03–S12

CHYBA  Karta konstrukce používá velký obecný motiv „VESPER FRAME“, nikoli finální technickou ikonu konkrétního typu konstrukce.

OPRAVA  Nahradit schválenými ikonami: obvodová stěna, vnitřní stěna, strop, střešní plášť. Bez sekundárního VESPER FRAME wordmarku uvnitř karty.

Každý krok ukazuje správnou ikonu z finální galerie; stroke odpovídá ostatním PREFA ikonám.

VIS-028

P1

S03–S12

CHYBA  Varianta 1/2/3 je velmi drobná, má jiné rozměry než ostatní segmented controls a label „Varianta:“ plave mimo osu.

OPRAVA  Použít SegmentControl 44 px, minimální šířka segmentu 44 px, text 14/18; label nad ovladačem nebo vlevo v jedné přesné baseline. Active Ink.

Segmenty jsou snadno kliknutelné, stejné ve stěně i střeše a mají jasný focus/selected stav.

VIS-029

P1

S03–S12

CHYBA  PriceSummary používá legacy světle modrošedý panel, dashed empty state a příliš malé položky.

OPRAVA  Panel White/Paper + Line; heading 16/22, řádky 13–14/18, celková cena Gotham 28–32/34. Empty state bez dashed blue, s approved info icon a Stone textem.

Prázdný i vypočtený stav mají tutéž geometrii; cena je nejsilnější prvek a všechny položky jsou čitelné.

VIS-030

P1

S07–S09

CHYBA  Po otevření podpory není jasné, zda katalog zmizel, nebo je pouze překryt; pod drawerem zůstává torzo ceny.

OPRAVA  Support drawer musí nahradit celý pravý sloupec včetně CatalogCard a PriceSummary, případně je kompletně překrýt; po zavření obnovit beze změny scrollu.

V jednom okamžiku je vidět buď katalog, nebo podpora — nikdy jejich fragmenty současně.

P1 · LANDING A KROK 1

Vstupní stránky

ID

P

Výskyt

Chyba → požadovaná oprava

Akceptace

VIS-031

P1

S01

CHYBA  Na landing page mají header navigace, hero CTA, benefit texty a spodní CTA různou velikost/řez pro obdobnou UI roli.

OPRAVA  Nav a textové odkazy Flama 14/18; Primary CTA 56 px, Flama 600 14/18; sekundární benefit text 14–16/20–23. Sdílet Button/Link tokeny s konfigurátorem.

Shodná role má stejný computed font a výšku na landing page i v konfigurátoru.

VIS-032

P1

S01

CHYBA  Support launcher vpravo dole má vlastní zlatý rámeček, miniaturní text a odlišný support glyph.

OPRAVA  Použít SupportLauncher z téhož systému jako drawer: White/Paper, Line/Aqua focus, text min. 14/18, avatar a support ikona z registru; žádný jednorázový glyph.

Launcher vizuálně navazuje na banner a drawer a splňuje 44 px hit area.

VIS-033

P1

S02

CHYBA  Kalendářní disabled dny a pomocné texty jsou příliš světlé; šipky, floor segmenty a footer CTA nemají shodnou button metriku.

OPRAVA  Disabled data ponechat čitelná v Stone; šipky 44×44; floor SegmentControl 44 px; footer Back/Primary dle globálního systému. Všechny labely min. 13–14 px.

Kalendář je čitelný, aktivní datum je jednoznačné a všechny interaktivní prvky splňují 44 px.

VIS-034

P1

S02

CHYBA  Číselné badge 1/2 u základních parametrů, status „K dispozici…“ a zvolený cíl používají rozdílné ikony, padding i výšky.

OPRAVA  Badge 24/28 px dle stejného StepBadge; status = standard StatusPill; zvolený cíl = InfoCard s 24 px paddingem a approved cílovou ikonou.

Badge, status a info karta odpovídají stejným komponentám v dalších krocích.

P1 · ZÁVĚREČNÝ ROZPOČET

Krok 6 — souhrn a odeslání

ID

P

Výskyt

Chyba → požadovaná oprava

Akceptace

VIS-035

P1

S13

CHYBA  Hlavní obsah je na širokém desktopu příliš úzký a veškerá typografie je opticky zmenšená; vzniká velká nevyužitá plocha.

OPRAVA  Uvnitř dostupného main sloupce použít max-width 1100–1180 px a standardní typografické role; nezmenšovat komponenty kvůli délce stránky. Zachovat 24/32 px mezery.

Při 1920 px je souhrn čitelný na 100 % a využívá hlavní sloupec bez nepřiměřené prázdné plochy.

VIS-036

P1

S13

CHYBA  Benefit karty, checklist, služby a formulář používají několik cizích ikon a různou velikost icon containerů.

OPRAVA  Všechny ikony nahradit finální technickou/UI sadou; obsahová ikona 24 px v 44 px containeru, stejný stroke. Žádné hardhat/tag/shield glyphy mimo registr.

Každá ikona je dohledatelná v approved registry a všechny containery mají shodnou geometrii.

VIS-037

P1

S13

CHYBA  Statusy „Doplněno / Vyžaduje posouzení“, termínové slevy a volby přístupnosti používají různé zelené/oranžové odstíny a velikosti badge.

OPRAVA  StatusPill 28–32 px: completed Aqua, attention Amber, neutral Linen. Jednotná ikona 16/18 px, Flama 600 13/18. Segmentované volby 44 px.

Stejný význam má stejnou barvu, ikonu a badge ve všech sekcích souhrnu.

VIS-038

P1

S13

CHYBA  Tabulka rozpočtu má velmi drobný text; řádky součtu, slevy a DPH mají odlišnou typografii bez jasné, opakovatelné hierarchie.

OPRAVA  Body tabulky 13–14/18, hlavička 12/15 uppercase, částky tabular. Sleva = Pale Amber/Amber; mezisoučet = Ink/White; finální cena Gotham 28–32/34. Řádky min. 40 px.

Tabulka je čitelná při 100 % a hierarchie slevy → mezisoučet → DPH → finální cena je okamžitě zřejmá.

VIS-039

P1

S13

CHYBA  Tmavý formulář používá jiné buttony, vstupy a nativní checkbox; popisky a vysvětlující text jsou pod minimální velikostí.

OPRAVA  Inverse Form systém: label 13/18, input 44 px, textarea min. 88 px, inverse Secondary 44 px, vlastní checkbox 20/44, body min. 14/20. CTA pouze jedna Primary v patičce.

Formulář používá stejné radius/border/font tokeny jako zbytek produktu a nemá nativní checkbox.

VIS-040

P1

S13

CHYBA  Sticky footer a souhrn obsahují rozdílné CTA styly; text „Odeslat nezávaznou poptávku“ má jiné prostrkání a ikonu než předchozí kroky.

OPRAVA  Použít stejnou Primary-on-dark komponentu jako v krocích: 56 px, Flama 600 14/18, letter-spacing 0, approved arrow/send ikona 18 px, spacing 8 px.

CTA má shodnou výšku, font, ikonu a hover/focus jako ostatní hlavní akce.

PŘEDÁVACÍ KONTROLA

Definition of done pro kodéra

Ve zdrojovém kódu existuje jediná mapa fontů a velikostí; nejsou page-specific font-size, font-family ani letter-spacing pro sdílené komponenty.

Všechny SVG ikony pocházejí z jednoho approved PREFA registry; nejsou použity emoji, Unicode symboly, icon-fonty ani nativní browser glyphy.

Každá homogenní řada tlačítek má shodnou výšku, padding, velikost popisku, baseline a rozměr ikony.

Sidebar i StageStepper používají stejných pět stavů: completed, current, available, locked, attention.

UploadCard, preview, kalibrace, toolbar, canvas, MeasureList, katalog, Tereza a footer jsou sdílené komponenty ve stěnách, stropu i střeše.

Na žádné kontrolované obrazovce nezůstává legacy blue, nativní checkbox nebo generická ikona mimo sadu.

Všechny informativní texty mají minimálně 13 px; disabled stav zůstává čitelný a nemění geometrii komponenty.

Tereza drawer nezakrývá napůl stepper ani katalog, má Close 44×44 a po zavření zachová scroll a stav konfigurace.

Sticky footer má na každém kroku stejnou geometrii a pod hlavním obsahem je dostatečný spodní offset.

Regresní screenshoty jsou porovnány minimálně při šířkách 1920, 1440 a 1280 px; rozdíly jsou pouze obsahové, nikoli ve sdílených komponentách.

Doporučené pořadí opravy

#

Rozsah

Výsledek

1

VIS-001 až VIS-008

Nejprve tokeny a kořenové komponenty; jinak se budou chyby vracet.

2

VIS-009 až VIS-030

Shell, navigace, podpora, upload, toolbar, canvas a pravý panel.

3

VIS-031 až VIS-040

Landing page, krok 1 a závěrečný souhrn.

4

Regresní kontrola

Znovu vyfotit stejné stavy S01–S13 a projít Definition of done.

Schvalovací brána: Neprovádět další lokální vizuální úpravy, dokud nejsou uzavřeny všechny P0 položky a stejné sdílené komponenty nevypadají shodně ve všech 13 stavech.