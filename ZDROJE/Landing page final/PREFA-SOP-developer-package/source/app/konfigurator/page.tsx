"use client";

import { FormEvent, useMemo, useState } from "react";

const iconPath = (name: string) => `/icons/${name}.svg`;

function Icon({ name, className = "" }: { name: string; className?: string }) {
  return <img className={`icon ${className}`} src={iconPath(name)} alt="" aria-hidden="true" />;
}

const TODAY = new Date(2026, 7, 25, 12);

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 12);
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

const minDate = addDays(TODAY, 60);
const initialDate = addDays(TODAY, 66);
const monthNames = [
  "Leden",
  "Únor",
  "Březen",
  "Duben",
  "Květen",
  "Červen",
  "Červenec",
  "Srpen",
  "Září",
  "Říjen",
  "Listopad",
  "Prosinec",
];
const weekdays = ["PO", "ÚT", "ST", "ČT", "PÁ", "SO", "NE"];

const scheduleItems = [
  { offset: -60, icon: "psv-drawings", label: "Nezávazné zadání" },
  { offset: -53, icon: "psv-budget", label: "Upřesnění zadání a ceny" },
  { offset: -30, icon: "psv-prefabrication", label: "Výrobní dokumentace" },
  { offset: 0, icon: "psv-assembly", label: "Montáž a předání" },
];

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).format(date);
}

export default function ConfiguratorStart() {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [visibleMonth, setVisibleMonth] = useState(startOfMonth(initialDate));
  const [location, setLocation] = useState("Bruntál, 792 01");
  const [storeys, setStoreys] = useState(2);
  const [confirmed, setConfirmed] = useState(false);

  const calendarDays = useMemo(() => {
    const first = startOfMonth(visibleMonth);
    const mondayOffset = (first.getDay() + 6) % 7;
    const gridStart = addDays(first, -mondayOffset);
    return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
  }, [visibleMonth]);

  const schedule = useMemo(
    () =>
      scheduleItems.map((item) => ({
        ...item,
        date: addDays(selectedDate, item.offset),
      })),
    [selectedDate],
  );

  function changeMonth(delta: number) {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + delta, 1, 12),
    );
  }

  function selectDate(date: Date) {
    if (date < minDate) return;
    setSelectedDate(date);
    setVisibleMonth(startOfMonth(date));
    setConfirmed(false);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setConfirmed(true);
    window.sessionStorage.setItem(
      "prefashop-step-1",
      JSON.stringify({
        targetDate: selectedDate.toISOString(),
        location,
        storeys,
      }),
    );
    window.location.assign("/konfigurator/vykresy");
  }

  const previousMonthDisabled =
    visibleMonth.getFullYear() === minDate.getFullYear() &&
    visibleMonth.getMonth() <= minDate.getMonth();

  return (
    <main className="configurator-shell">
      <header className="configurator-header">
        <a className="brand" href="/" aria-label="PREFA ŠOP – zpět na úvodní stránku">
          <img src="/brand/prefa-sop.svg" alt="PREFA ŠOP" />
        </a>
        <a className="back-link" href="/">
          <Icon name="psv-arrow-right" />
          <span>Zpět na úvod</span>
        </a>
      </header>

      <form className="configurator" onSubmit={submit}>
        <div className="configurator-progress" aria-label="Krok 1 z 8">
          <div>
            <p className="eyebrow">Krok 1 z 8</p>
            <h1>Váš cíl</h1>
          </div>
          <div className="progress-track" aria-hidden="true">
            {Array.from({ length: 8 }, (_, index) => (
              <span className={index === 0 ? "active" : ""} key={index} />
            ))}
          </div>
          <p>Nejprve společně nastavíme termín, místo a rozsah domu.</p>
        </div>

        <section className="support-intro" aria-labelledby="support-title">
          <img src="/images/tereza.png" alt="Tereza, technická podpora PREFA ŠOP" />
          <div>
            <p className="eyebrow">Technická podpora Tereza</p>
            <h2 id="support-title">Dobrý den, provedu vás konfigurací.</h2>
            <p>
              Zvolte cílový termín montáže. Harmonogram přípravy vám dopočítáme
              automaticky a v dalších krocích společně převedeme výkresy do konstrukcí.
            </p>
          </div>
          <span className="support-status"><i /> K dispozici během konfigurace</span>
        </section>

        <div className="configurator-grid">
          <section className="config-card calendar-card" aria-labelledby="calendar-title">
            <div className="config-card-heading">
              <div className="heading-icon"><Icon name="psv-budget" /></div>
              <div>
                <p className="eyebrow">Cílový termín</p>
                <h2 id="calendar-title">
                  {monthNames[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
                </h2>
              </div>
              <div className="month-controls">
                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  disabled={previousMonthDisabled}
                  aria-label="Předchozí měsíc"
                >
                  <Icon name="psv-chevron-right" />
                </button>
                <button type="button" onClick={() => changeMonth(1)} aria-label="Další měsíc">
                  <Icon name="psv-chevron-right" />
                </button>
              </div>
            </div>

            <div className="calendar-note">
              Nejbližší volný termín lze vybrat nejdříve za 60 dní.
            </div>
            <div className="calendar-grid" role="grid" aria-label="Kalendář cílového termínu">
              {weekdays.map((day) => (
                <span className="weekday" role="columnheader" key={day}>{day}</span>
              ))}
              {calendarDays.map((date) => {
                const outsideMonth = date.getMonth() !== visibleMonth.getMonth();
                const disabled = date < minDate;
                const selected = sameDay(date, selectedDate);
                return (
                  <button
                    type="button"
                    role="gridcell"
                    key={dateKey(date)}
                    className={`${outsideMonth ? "outside" : ""} ${selected ? "selected" : ""}`}
                    disabled={disabled}
                    aria-selected={selected}
                    aria-label={formatDate(date)}
                    onClick={() => selectDate(date)}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="config-card project-card" aria-labelledby="project-title">
            <div className="config-card-heading">
              <div>
                <p className="eyebrow">Základní parametry</p>
                <h2 id="project-title">Kde a kolik podlaží?</h2>
              </div>
            </div>

            <label className="field-label" htmlFor="site-location">
              <span className="field-number">1</span>
              <span>Místo stavby</span>
            </label>
            <div className="location-field">
              <Icon name="psv-location" />
              <input
                id="site-location"
                name="site-location"
                value={location}
                onChange={(event) => {
                  setLocation(event.target.value);
                  setConfirmed(false);
                }}
                placeholder="Obec nebo PSČ"
                autoComplete="postal-code"
                required
              />
            </div>
            <p className="field-help">Stačí obec nebo poštovní směrovací číslo.</p>

            <fieldset className="storeys-fieldset">
              <legend className="field-label">
                <span className="field-number">2</span>
                <span>Počet podlaží</span>
              </legend>
              <div className="segmented-control">
                {[1, 2, 3].map((value) => (
                  <button
                    type="button"
                    className={storeys === value ? "active" : ""}
                    aria-pressed={storeys === value}
                    onClick={() => {
                      setStoreys(value);
                      setConfirmed(false);
                    }}
                    key={value}
                  >
                    {value} {value === 1 ? "podlaží" : "podlaží"}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="selection-summary" aria-live="polite">
              <Icon name="psv-no-commitment" />
              <p>
                <span>Zvolený cíl</span>
                <strong>{formatDate(selectedDate)} · {storeys} {storeys === 1 ? "podlaží" : "podlaží"}</strong>
              </p>
            </div>
          </section>
        </div>

        <section className="schedule-section" aria-labelledby="schedule-title">
          <div className="section-heading">
            <p className="eyebrow">Automaticky dopočítáno</p>
            <h2 id="schedule-title">Harmonogram k vašemu cíli</h2>
            <p>Termíny se přepočítají při každé změně cílového data.</p>
          </div>
          <div className="schedule-track">
            {schedule.map((item, index) => (
              <article className={index === schedule.length - 1 ? "final" : ""} key={item.label}>
                <div className="schedule-icon"><Icon name={item.icon} /></div>
                <p>{formatDate(item.date)}</p>
                <h3>{item.label}</h3>
              </article>
            ))}
          </div>
        </section>

        <div className="configurator-actions">
          <a href="/">Zrušit a vrátit se</a>
          <div>
            {confirmed && <p className="confirmation" role="status">Cíl je uložen. Další krok je připraven.</p>}
            <button className="primary-button" type="submit">
              <span>Pokračovat k výkresům</span>
              <Icon name="psv-arrow-right" />
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
