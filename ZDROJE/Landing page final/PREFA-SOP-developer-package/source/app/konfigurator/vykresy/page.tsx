"use client";

import {
  ChangeEvent,
  MouseEvent as ReactMouseEvent,
  useMemo,
  useRef,
  useState,
} from "react";

const iconPath = (name: string) => `/icons/${name}.svg`;

function Icon({ name, className = "" }: { name: string; className?: string }) {
  return <img className={`icon ${className}`} src={iconPath(name)} alt="" aria-hidden="true" />;
}

const navigation = [
  ["01", "Parametry a místo", "done"],
  ["02", "Vnější stěny 1. NP", "active"],
  ["03", "Vnitřní stěny 1. NP", "ready"],
  ["04", "Strop mezi 1. NP a 2. NP", "locked"],
  ["05", "Vnější stěny 2. NP", "ready"],
  ["06", "Vnitřní stěny 2. NP", "locked"],
  ["07", "Střešní roviny a sklon", "locked"],
  ["08", "Rozpočet a předobjednávka", "locked"],
];

const workflow = [
  ["Nahrát", "psv-drawings"],
  ["Měřítko", "psv-scale-dimension"],
  ["Obkreslit", "psv-wall-outlines"],
  ["Zkontrolovat", "psv-no-commitment"],
];

const panelVariants = [
  {
    name: "Obvodová stěna kontaktní",
    code: "OS_VF_01",
    description: "Certifikovaný panel s kontaktním fasádním zateplením EPS/minerál.",
    price: 8500,
    uValue: "0,14 W/m²K",
  },
  {
    name: "Obvodová stěna omítková",
    code: "OS_VF_02",
    description: "Difuzně otevřený panel připravený pro tenkovrstvou omítku.",
    price: 8950,
    uValue: "0,13 W/m²K",
  },
  {
    name: "Obvodová stěna odvětrávaná",
    code: "OS_VF_03",
    description: "Panel s instalační rovinou pro technicky čistou odvětrávanou fasádu.",
    price: 9400,
    uValue: "0,12 W/m²K",
  },
];

type Point = { x: number; y: number };

function formatPrice(value: number) {
  return new Intl.NumberFormat("cs-CZ").format(value);
}

export default function DrawingsStep() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState(0);
  const [fileName, setFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [selectedPanel, setSelectedPanel] = useState(0);
  const [scaleValue, setScaleValue] = useState("5000");
  const [points, setPoints] = useState<Point[]>([]);
  const [helpOpen, setHelpOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const calculation = useMemo(() => {
    const area = 73.1;
    const panels = Math.round(area * panelVariants[selectedPanel].price);
    const assembly = 111852;
    const crane = 24856;
    const transport = 21500;
    const reserve = Math.round((panels + assembly + crane + transport) * 0.03);
    return {
      area,
      panels,
      assembly,
      crane,
      transport,
      reserve,
      total: panels + assembly + crane + transport + reserve,
    };
  }, [selectedPanel]);

  function acceptFile(file?: File) {
    if (!file) return;
    setFileName(file.name);
    setPoints([]);
    setSaved(false);
    if (file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl("");
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    acceptFile(event.target.files?.[0]);
  }

  function useSample() {
    setFileName("Vzorový_půdorys_1NP.pdf");
    setPreviewUrl("");
    setPoints([]);
    setSaved(false);
  }

  function addOutlinePoint(event: ReactMouseEvent<HTMLDivElement>) {
    if (stage !== 2) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const point = {
      x: ((event.clientX - bounds.left) / bounds.width) * 100,
      y: ((event.clientY - bounds.top) / bounds.height) * 100,
    };
    setPoints((current) => [...current, point]);
    setSaved(false);
  }

  function handlePrimaryAction() {
    if (!fileName) {
      fileInput.current?.click();
      return;
    }
    if (stage < 3) {
      setStage((current) => current + 1);
      return;
    }
    setSaved(true);
  }

  const actionLabels = [
    "Pokračovat k nastavení měřítka",
    "Potvrdit měřítko a obkreslit",
    "Zkontrolovat obrys stěn",
    "Uložit vnější stěny 1. NP",
  ];

  return (
    <main className="drawing-shell">
      <header className="drawing-header">
        <a href="/" className="brand" aria-label="PREFA ŠOP – úvodní stránka">
          <img src="/brand/prefa-sop.svg" alt="PREFA ŠOP" />
        </a>
        <div className="drawing-header-context">
          <span>Konfigurátor hrubé stavby</span>
          <i />
          <strong>Automaticky uloženo</strong>
        </div>
      </header>

      <div className="drawing-layout">
        <aside className="drawing-sidebar" aria-label="Postup konfigurace">
          <p className="sidebar-kicker">Konfigurace domu</p>
          <ol>
            {navigation.map(([number, label, state]) => (
              <li className={state} key={number}>
                <span>{number}</span>
                <p>{label}</p>
                {state === "done" && <Icon name="psv-no-commitment" />}
              </li>
            ))}
          </ol>

          <div className="sidebar-support">
            <img src="/images/tereza.png" alt="Tereza, technická podpora" />
            <div>
              <p>Technická podpora</p>
              <strong>Tereza je vám k dispozici</strong>
            </div>
            <button type="button" onClick={() => setHelpOpen((value) => !value)}>
              <Icon name={helpOpen ? "psv-help-close" : "psv-help-open"} />
              <span>{helpOpen ? "Zavřít" : "Poradit"}</span>
            </button>
            {helpOpen && (
              <p className="sidebar-help">
                Nahrajte půdorys 1. NP. Pro obrys stačí čitelná vnější hrana stěn a jeden
                známý rozměr pro nastavení měřítka.
              </p>
            )}
          </div>
        </aside>

        <section className="drawing-main">
          <div className="drawing-step-heading">
            <div>
              <p className="eyebrow">Krok 2 z 8 · Konstrukce podlaží</p>
              <h1>Vnější stěny 1. NP</h1>
              <p>Nahrajte půdorys, nastavte měřítko a postupně označte vnější obrys domu.</p>
            </div>
            <div className="drawing-workflow" aria-label="Pracovní postup">
              {workflow.map(([label, icon], index) => (
                <button
                  type="button"
                  className={`${index === stage ? "active" : ""} ${index < stage ? "complete" : ""}`}
                  disabled={!fileName && index > 0}
                  onClick={() => fileName && setStage(index)}
                  key={label}
                >
                  <Icon name={icon} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <section className="drawing-guide" aria-label="Pokyn technické podpory">
            <img src="/images/tereza.png" alt="" aria-hidden="true" />
            <div>
              <p className="eyebrow">Tereza · technická podpora</p>
              <strong>
                {stage === 0 && "Začněte nahráním půdorysu prvního podlaží."}
                {stage === 1 && "Označte na výkresu známý rozměr a zadejte jeho skutečnou délku."}
                {stage === 2 && "Klikáním postupně vyznačte rohy vytápěné části domu."}
                {stage === 3 && "Zkontrolujte uzavřený obrys a vybraný typ konstrukce."}
              </strong>
            </div>
            <span>{stage + 1} / 4</span>
          </section>

          <div className="drawing-stage-card">
            {stage === 0 && (
              <div className="upload-state">
                <div className="upload-title">
                  <p className="eyebrow">Vlastní projektová dokumentace</p>
                  <h2>Nahrajte půdorys 1. NP</h2>
                  <p>Podporované formáty: PDF, PNG a JPG. Maximální velikost souboru 25 MB.</p>
                </div>

                <button
                  type="button"
                  className={`upload-zone ${fileName ? "has-file" : ""}`}
                  onClick={() => fileInput.current?.click()}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    acceptFile(event.dataTransfer.files?.[0]);
                  }}
                >
                  <span className="upload-icon"><Icon name="psv-drawings" /></span>
                  {fileName ? (
                    <>
                      <strong>{fileName}</strong>
                      <span>Soubor je připravený. Kliknutím jej můžete nahradit.</span>
                    </>
                  ) : (
                    <>
                      <strong>Klikněte pro výběr výkresu</strong>
                      <span>nebo soubor přetáhněte do tohoto pole</span>
                    </>
                  )}
                </button>
                <input
                  ref={fileInput}
                  className="visually-hidden"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                  onChange={handleFileChange}
                />

                <div className="sample-drawing">
                  <span>Nemáte nyní výkres po ruce?</span>
                  <button type="button" onClick={useSample}>Použít vzorový půdorys</button>
                </div>
              </div>
            )}

            {stage > 0 && (
              <div className="blueprint-workspace">
                <div className="blueprint-toolbar">
                  <div>
                    <Icon name="psv-drawings" />
                    <p><span>Výkres</span><strong>{fileName}</strong></p>
                  </div>
                  <div className="zoom-controls" aria-label="Přiblížení výkresu">
                    <button type="button" aria-label="Oddálit">−</button>
                    <span>100 %</span>
                    <button type="button" aria-label="Přiblížit">+</button>
                  </div>
                  {stage === 2 && (
                    <div className="outline-controls">
                      <button type="button" onClick={() => setPoints((current) => current.slice(0, -1))} disabled={!points.length}>Zpět bod</button>
                      <button type="button" onClick={() => setPoints([])} disabled={!points.length}>Vymazat</button>
                    </div>
                  )}
                </div>

                <div className={`blueprint-canvas stage-${stage}`} onClick={addOutlinePoint}>
                  {previewUrl ? (
                    <img src={previewUrl} alt="Nahraný půdorys" />
                  ) : (
                    <div className="blueprint-placeholder">
                      <Icon name="psv-floor-plans" />
                      <div className="plan-lines" aria-hidden="true">
                        <span /><span /><span /><span /><span />
                      </div>
                      <p>Vzorový půdorys 1. NP</p>
                    </div>
                  )}

                  {stage === 1 && (
                    <div className="scale-overlay">
                      <p className="eyebrow">Referenční rozměr</p>
                      <strong>Zadejte délku označené stěny</strong>
                      <label>
                        <input value={scaleValue} onChange={(event) => setScaleValue(event.target.value)} inputMode="numeric" />
                        <span>mm</span>
                      </label>
                      <div className="scale-line"><i /><b>{scaleValue || "—"} mm</b><i /></div>
                    </div>
                  )}

                  {points.length > 0 && (
                    <svg className="outline-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label={`Obrys obsahuje ${points.length} bodů`}>
                      <polyline points={points.map((point) => `${point.x},${point.y}`).join(" ")} />
                      {points.map((point, index) => (
                        <circle cx={point.x} cy={point.y} r="0.8" key={`${point.x}-${point.y}-${index}`} />
                      ))}
                    </svg>
                  )}

                  {stage === 2 && points.length === 0 && (
                    <div className="canvas-hint">Klikněte na první roh vnějšího obvodu.</div>
                  )}

                  {stage === 3 && (
                    <div className="review-overlay">
                      <Icon name="psv-no-commitment" />
                      <p><strong>Obrys připraven ke kontrole</strong><span>{Math.max(points.length, 6)} bodů · měřítko 1 : 100</span></p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <label className="drawing-note">
            <span>Poznámka ke kroku</span>
            <input placeholder="Např. fasáda bude kombinovat omítku a dřevěný obklad…" />
          </label>
        </section>

        <aside className="drawing-catalog" aria-label="Výběr panelu a cena">
          <div className="catalog-heading">
            <p className="eyebrow">Katalog konstrukcí</p>
            <h2>Panel pro aktuální krok</h2>
            <p>Vyberte certifikovanou konstrukci pro obvodové stěny 1. NP.</p>
          </div>

          <article className="panel-card">
            <div className="panel-visual"><Icon name="psv-prefabrication" /><span>VESPER FRAME</span></div>
            <div className="panel-card-copy">
              <h3>{panelVariants[selectedPanel].name}</h3>
              <p>{panelVariants[selectedPanel].description}</p>
              <dl>
                <div><dt>Kód</dt><dd>{panelVariants[selectedPanel].code}</dd></div>
                <div><dt>Součinitel prostupu</dt><dd>U = {panelVariants[selectedPanel].uValue}</dd></div>
                <div><dt>Cena panelu</dt><dd>{formatPrice(panelVariants[selectedPanel].price)} Kč/m²</dd></div>
              </dl>
            </div>
            <div className="panel-switcher" aria-label="Typ konstrukce">
              {panelVariants.map((panel, index) => (
                <button
                  type="button"
                  className={index === selectedPanel ? "active" : ""}
                  onClick={() => setSelectedPanel(index)}
                  aria-label={panel.name}
                  key={panel.code}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </article>

          <article className="price-card">
            <div className="price-card-title">
              <Icon name="psv-budget" />
              <div><p>Průběžný výpočet</p><strong>Vnější stěny 1. NP</strong></div>
            </div>
            <dl>
              <div><dt>Plocha konstrukcí</dt><dd>{calculation.area.toFixed(1).replace(".", ",")} m²</dd></div>
              <div><dt>Výroba panelů</dt><dd>{formatPrice(calculation.panels)} Kč</dd></div>
              <div><dt>Odborná montáž</dt><dd>{formatPrice(calculation.assembly)} Kč</dd></div>
              <div><dt>Jeřáb a manipulace</dt><dd>{formatPrice(calculation.crane)} Kč</dd></div>
              <div><dt>Doprava</dt><dd>{formatPrice(calculation.transport)} Kč</dd></div>
              <div><dt>Technická rezerva</dt><dd>{formatPrice(calculation.reserve)} Kč</dd></div>
            </dl>
            <div className="price-total"><span>Cena kroku bez DPH</span><strong>{formatPrice(calculation.total)} Kč</strong></div>
            <p>Každá položka bude v závěrečném rozpočtu rozepsána samostatně.</p>
          </article>
        </aside>
      </div>

      <footer className="drawing-footer">
        <div className="footer-price">
          <span>Cena tohoto kroku</span>
          <strong>{formatPrice(calculation.total)} Kč <i>bez DPH</i></strong>
        </div>
        <div className="footer-status">
          <span>Do ceny započteno 0 ze 6 konstrukčních částí</span>
        </div>
        <div className="footer-overall">
          <span>Průběžná cena celkem</span>
          <strong>{formatPrice(calculation.total + 35000)} Kč</strong>
        </div>
        <a className="footer-back" href="/konfigurator">Zpět</a>
        <button className="footer-primary" type="button" onClick={handlePrimaryAction}>
          <span>{saved ? "Vnější stěny uloženy" : actionLabels[stage]}</span>
          <Icon name={saved ? "psv-no-commitment" : "psv-arrow-right"} />
        </button>
      </footer>
    </main>
  );
}
