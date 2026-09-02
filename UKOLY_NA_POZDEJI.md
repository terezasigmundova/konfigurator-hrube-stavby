# Úkoly na později / Backlog budoucích vylepšení

Tento dokument slouží pro evidenci nápadů, požadavků a úkolů na budoucí rozšíření a vylepšení Konfigurátoru hrubé stavby PREFA ŠOP.

---

## 📋 Seznam úkolů a vylepšení

### 1. Možnost načtení dat ze vzorových domů
* **Popis:** Pro uživatele a investory, kteří zatím nemají zpracovaný vlastní projekt ani výkresy, umožnit v konfigurátoru výběr z našich typových/vzorových rodinných domů.
* **Chování:**
  * Výběr typového domu (např. bungalov, patrový dům, kompaktní RD).
  * Automatické předvyplnění a načtení odpovídající geometrie, ploch stěn, stropů a střechy do konfigurace.
  * Uživatel získá okamžitou orientační cenovou kalkulaci i bez nahrávání vlastního PDF/výkresu.
* **Stav:** Připraveno k návrhu / budoucí fáze.

### 2. Detailní vícesložková cenotvorba produktů
* **Popis:** Zavedení dynamického rozpadu cenotvorby pro jednotlivé produkty (panely, stropy, střechy) na dílčí nákladové složky: přímé materiály, výrobní proces, CNC příprava a frézování elektro-tras, manipulace a režie.
* **Chování v přechodné fázi:** V konfigurátoru se zatím zástupně používá celková pevně zadaná jednotková cena za m² (zahrnuje kompletní výrobní proces, nezahrnuje přepravu a staveništní montáž, které mají v rozpočtu samostatné pozice).
* **Cílový stav:** Možnost parametricky měnit ceny materiálů v centrální databázi a automaticky přepočítávat jednotkovou cenu i rozpad pro kalkulaci nákupního košíku.
* **Stav:** Naplánováno pro budoucí fázi.

### 3. Zabezpečení administračního rozhraní `/konfigurator-admin`
* **Popis:** Zabezpečení administračního rozhraní pro správu katalogu, cenotvorby a textů konfigurátoru (autentizace, přihlašovací heslo / magic link, správa rolí a oprávnění administrátora).
* **Chování v přechodné fázi:** V aktuální vývojové fázi je rozhraní dostupné přímo na speciální URL `/konfigurator-admin` bez nutnosti přihlašování, aby bylo možné snadno testovat a ladit strategie výpočtů a produktová data.
* **Cílový stav:** Přihlašování přes bezpečný token / heslo s automatickým odhlášením a ochranou API endpointů.
* **Stav:** Naplánováno pro budoucí fázi.

---

*(Zde budeme postupně doplňovat další budoucí vylepšení)*

