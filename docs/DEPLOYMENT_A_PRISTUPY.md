# Přehled účtů, přístupů a deployment architektury

Tento dokument slouží jako centrální přehled pro správu GitHub repozitářů, Vercel hostingů a týmového workflow projektu **Konfigurátor hrubé stavby (PREFA ŠOP)**.

---

## 1. GitHub účty a repozitáře

### Hlavní produkční GitHub účet (Osobní / Týmový)
* **GitHub Username:** `terezasigmundova`
* **Hlavní repozitář projektu:** [https://github.com/terezasigmundova/konfigurator-hrube-stavby](https://github.com/terezasigmundova/konfigurator-hrube-stavby)
* **Status viditelnosti:** `Public` (dostupný pro spolupráci, klonování a nasazení)
* **Výchozí větev:** `main`
* **Lokální git konfigurace:** Připojeno přes HTTPS s Personal Access Tokenem.

### Sekundární pracovní / Vercel-propojený GitHub účet
* **GitHub Username:** `bdybynr4q7-creator`
* **Repozitář pro automatické Vercel sestavení:** `bdybynr4q7-creator/konfigurator-prefa-sop`
* **Role:** Slouží k automatické synchronizaci a spouštění buildů na Vercelu.
* **Přístupová práva:** Nastaven jako přizvaný spolupracovník (Collaborator) s právy zápisu v hlavním repozitáři `terezasigmundova`.

---

## 2. Vercel Hosting & Produkční prostředí

### Vercel Team / Účet
* **Vercel Účet:** `bdybynr4q7-creator's projects` (Pro plán)
* **Projekt na Vercelu:** `konfigurator-prefa-sop` (nebo `konfigurator-hrube-stavby`)
* **Framework:** Next.js (App Router, React 19, Tailwind v4)
* **Provozované živé URL adresy:**
  * **Hlavní konfigurátor:** `https://[projekt].vercel.app/konfigurator`
  * **Administrační rozhraní:** `https://[projekt].vercel.app/konfigurator-admin`
  * **Úvodní stránka:** `https://[projekt].vercel.app/`

---

## 3. Vývojové a sestavovací standardy (Build & CI/CD)

1. **Build příkaz:**
   ```bash
   prisma generate && next build
   ```
2. **Serverless bezpečnost:**
   * Všechny API routy v `/src/app/api/...` mají nastaveno `export const dynamic = 'force-dynamic';` pro bezproblémové sestavení bez blokování statickou analýzou.
   * `src/lib/prisma.ts` obsahuje automatický mock fallback pro serverless běh bez nutnosti aktivního SQLite souboru.
3. **Zdroj pravdy dat:**
   * `src/lib/catalog/data/master_config.json` obsahuje kompletní katalog produktů (panely 1.1–1.4, stropy, střechy) i všech 8 pravidel cenotvorby (doprava z Bruntálu, autojeřáb, dny montáže, lešení, marže a rezervy).

---

## 4. Týmové workflow a přidávání spolupracovníků

### A. Přidání nového programátora / projektanta
1. Na GitHubu: [https://github.com/terezasigmundova/konfigurator-hrube-stavby/settings/access](https://github.com/terezasigmundova/konfigurator-hrube-stavby/settings/access)
2. Kliknout na **„Add people“** -> zadat GitHub jméno / e-mail kolegy.
3. Kolega si projekt stáhne přes `git clone https://github.com/terezasigmundova/konfigurator-hrube-stavby.git`.

### B. Odeslání změn a automatický update živého webu
* Kdykoliv kdokoliv z týmu provede `git push` do větve `main`, Vercel automaticky během 30 sekund zaktualizuje živou webovou aplikaci.
