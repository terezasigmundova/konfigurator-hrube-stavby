const iconPath = (name: string) => `/icons/${name}.svg`;

function Icon({ name, className = "" }: { name: string; className?: string }) {
  return <img className={`icon ${className}`} src={iconPath(name)} alt="" aria-hidden="true" />;
}

const benefits = [
  ["psv-no-registration", "Bez registrace"],
  ["psv-no-commitment", "Nezávazně"],
  ["psv-itemized-price", "Průběžná cena po položkách"],
];

const steps = [
  ["01", "Výkresy", "Půdorysy podlaží, stropů a střechy", "psv-drawings"],
  ["02", "Obrysy stěn", "Vnější a vnitřní stěny", "psv-wall-outlines"],
  ["03", "Obrysy ploch", "Stropy a střešní roviny", "psv-surface-outlines"],
  ["04", "Rozpočet", "Položková cena a termín montáže", "psv-budget"],
];

const included = [
  ["psv-prefabrication", "Výrobu prefabrikovaných částí stavby."],
  ["psv-slab-survey", "Zaměření základové desky."],
  ["psv-site-setup", "Zařízení staveniště."],
  ["psv-crane-transport", "Dopravu a manipulaci jeřábem."],
  ["psv-assembly", "Odbornou montáž hrubé stavby."],
  ["psv-roof-envelope", "Kompletní střešní plášť."],
  ["psv-contingency", "Technickou rezervu na vícepráce."],
];

const prepare = [
  ["psv-storeys", "Počet podlaží"],
  ["psv-floor-plans", "Půdorysy všech podlaží"],
  ["psv-slab-roof-plans", "Půdorysy stropů a střechy"],
  ["psv-scale-dimension", "Čitelný rozměr pro nastavení měřítka"],
  ["psv-location", "Místo nebo PSČ stavby"],
];

const result = [
  ["psv-prefabrication", "Výroba prefabrikovaných částí"],
  ["psv-survey-site-setup", "Zaměření a zařízení staveniště"],
  ["psv-crane-transport", "Doprava a manipulace jeřábem"],
  ["psv-assembly", "Odborná montáž hrubé stavby"],
  ["psv-roof-envelope", "Kompletní střešní plášť"],
  ["psv-contingency", "Technická rezerva"],
];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="PREFA ŠOP – úvodní stránka">
          <img src="/brand/prefa-sop.svg" alt="PREFA ŠOP" />
        </a>

        <nav className="desktop-nav" aria-label="Hlavní navigace">
          <a href="#jak-to-funguje">Jak to funguje</a>
          <a href="#cena-zahrnuje">Co cena zahrnuje</a>
          <a href="#co-si-pripravit">Jaké podklady potřebuji</a>
        </nav>

        <details className="mobile-nav">
          <summary aria-label="Otevřít navigaci">
            <Icon name="psv-menu" className="menu-open" />
            <Icon name="psv-close" className="menu-close" />
          </summary>
          <nav aria-label="Mobilní navigace">
            <a href="#jak-to-funguje">Jak to funguje</a>
            <a href="#cena-zahrnuje">Co cena zahrnuje</a>
            <a href="#co-si-pripravit">Jaké podklady potřebuji</a>
          </nav>
        </details>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Online kalkulace hrubé stavby</p>
          <h1>Spočítejte si stavbu na korunu a den přesně</h1>
          <p className="lead">
            Nahrajte výkresy a během několika minut budete znát kompletní cenu za
            materiál, dopravu i práci.
          </p>

          <a className="primary-button" href="/konfigurator">
            <span>Spočítat cenu stavby</span>
            <Icon name="psv-arrow-right" />
          </a>

          <div className="benefits" aria-label="Výhody kalkulace">
            {benefits.map(([icon, label]) => (
              <div className="benefit" key={label}>
                <Icon name={icon} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-visual">
          <img
            className="house-photo"
            src="/images/vesper-realizace.jpg"
            alt="Dokončená dřevostavba VESPER HOMES"
          />
          <span className="photo-label">Realizace VESPER HOMES</span>

          <article className="result-card" aria-label="Ukázka výsledku kalkulace">
            <header>
              <p className="result-kicker">Ukázka výsledku</p>
              <p>Rozpočet hrubé stavby</p>
            </header>
            <div className="result-items">
              {result.map(([icon, label]) => (
                <div className="result-row" key={label}>
                  <Icon name={icon} />
                  <span>{label}</span>
                  <strong>v ceně</strong>
                </div>
              ))}
            </div>
            <div className="result-total">
              <span>Celkem bez DPH</span>
              <strong>2 968 936 Kč</strong>
            </div>
            <p className="result-note">
              Kompletní cena vaší stavby bude transparentně rozepsána mezi jednotlivé položky.
            </p>
          </article>
        </div>
      </section>

      <section className="process" id="jak-to-funguje">
        <div className="section-heading centered">
          <p className="eyebrow">Jak to funguje</p>
          <h2>Čtyři kroky k úplné ceně</h2>
        </div>

        <div className="steps">
          {steps.map(([number, title, description, icon], index) => (
            <div className="step-wrap" key={number}>
              <article className="step-card">
                <div className="step-topline">
                  <span className="step-number">{number}</span>
                  <h3>{title}</h3>
                </div>
                <Icon name={icon} />
                <p>{description}</p>
              </article>
              {index < steps.length - 1 && (
                <Icon name="psv-chevron-right" className="step-arrow" />
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="information">
        <article className="info-card" id="cena-zahrnuje">
          <div className="section-heading">
            <p className="eyebrow">Transparentní rozpočet</p>
            <h2>Co cena zahrnuje</h2>
          </div>
          <div className="info-list">
            {included.map(([icon, label]) => (
              <div className="info-row" key={label}>
                <Icon name={icon} />
                <span>{label}</span>
              </div>
            ))}
          </div>
          <p className="technical-note">
            Rozpočet položky rozepisuje podrobně včetně termínů a záručních podmínek.
          </p>
        </article>

        <article className="info-card" id="co-si-pripravit">
          <div className="section-heading">
            <p className="eyebrow">Stačí základní podklady</p>
            <h2>Co si připravit</h2>
          </div>
          <div className="info-list prepare-list">
            {prepare.map(([icon, label]) => (
              <div className="info-row" key={label}>
                <Icon name={icon} />
                <span>{label}</span>
              </div>
            ))}
          </div>
          <p className="technical-note">
            Podklady mohou vycházet z typizovaného projektu nebo studie. Není potřeba
            realizační dokumentace stavby.
          </p>
        </article>
      </section>

      <section className="final-cta" aria-label="Zahájení kalkulace">
        <div>
          <p className="eyebrow">Bez registrace a nezávazně</p>
          <h2>Máte půdorysy? Zjistěte cenu své hrubé stavby.</h2>
        </div>
        <a className="primary-button light-button" href="/konfigurator">
          <span>Spočítat cenu z výkresů</span>
          <Icon name="psv-arrow-right" />
        </a>
      </section>

      <footer>
        <img src="/brand/prefa-sop.svg" alt="PREFA ŠOP" />
        <span>www.prefashop.cz</span>
      </footer>

      <details className="support">
        <summary>
          <img src="/images/tereza.png" alt="Tereza" />
          <span><strong>Tereza</strong><i>·</i> technická podpora</span>
          <Icon name="psv-help-open" className="support-open" />
          <Icon name="psv-help-close" className="support-close" />
        </summary>
        <div className="support-panel">
          <p className="eyebrow">Technická podpora</p>
          <h2>Ráda vám pomohu s podklady.</h2>
          <p>
            Pro kalkulaci stačí čitelné půdorysy podlaží, stropů a střechy. Realizační
            dokumentaci nepotřebujete.
          </p>
          <a href="#co-si-pripravit">Zobrazit potřebné podklady</a>
        </div>
      </details>
    </main>
  );
}
