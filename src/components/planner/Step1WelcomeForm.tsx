'use client';

import React, { FormEvent, useMemo, useState, useRef, useEffect } from 'react';
import { VesperIcon } from '@/components/ui/VesperIcon';
import { searchRuianAddress, RuianAddressItem } from '@/lib/ruian';
import { estimateDistanceKmFromFactory } from '@/lib/transport';

const iconPath = (name: string) => `/icons/${name}.svg`;

function Icon({ name, className = "" }: { name: string; className?: string }) {
  return <img className={`icon ${className}`} src={iconPath(name)} alt="" aria-hidden="true" />;
}

const getToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

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

export interface Step1Data {
  targetDeliveryDate: string;
  municipalityName: string;
  distanceKmFromFactory: number;
  storeysCount: number;
  truckAccess: 'YES' | 'NO' | 'UNKNOWN';
  craneAccess: 'YES' | 'NO' | 'UNKNOWN';
}

interface Step1WelcomeFormProps {
  initialData: Step1Data;
  maxSteps?: number;
  onChange?: (data: Partial<Step1Data>) => void;
  onSubmit: (data: Step1Data) => void;
}

export function Step1WelcomeForm({ initialData, maxSteps = 8, onChange, onSubmit }: Step1WelcomeFormProps) {
  const today = useMemo(() => getToday(), []);
  const minDate = useMemo(() => addDays(today, 60), [today]);
  const maxDate = useMemo(() => addDays(today, 365), [today]);

  const initDateVal = useMemo(() => {
    if (initialData.targetDeliveryDate) {
      const d = new Date(initialData.targetDeliveryDate);
      if (!isNaN(d.getTime())) return d;
    }
    return addDays(today, 60); // Default to earliest available delivery window (~29. 10. 2026)
  }, [initialData.targetDeliveryDate, today]);

  const [selectedDate, setSelectedDate] = useState<Date>(initDateVal);
  const [visibleMonth, setVisibleMonth] = useState<Date>(startOfMonth(initDateVal));
  const [location, setLocation] = useState<string>(initialData.municipalityName || "Bruntál, 792 01");
  const [distanceKm, setDistanceKm] = useState<number>(
    initialData.distanceKmFromFactory || estimateDistanceKmFromFactory(initialData.municipalityName || "Bruntál")
  );
  const [storeys, setStoreys] = useState<number>(initialData.storeysCount || 2);
  const [confirmed, setConfirmed] = useState<boolean>(false);

  // Address suggestions autocomplete state
  const [suggestions, setSuggestions] = useState<RuianAddressItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const locationWrapperRef = useRef<HTMLDivElement | null>(null);

  // Sync state if initialData changes externally
  useEffect(() => {
    if (initialData.municipalityName && initialData.municipalityName !== location) {
      setLocation(initialData.municipalityName);
      setDistanceKm(initialData.distanceKmFromFactory || estimateDistanceKmFromFactory(initialData.municipalityName));
    }
    if (initialData.storeysCount && initialData.storeysCount !== storeys) {
      setStoreys(initialData.storeysCount);
    }
    if (initialData.targetDeliveryDate) {
      const d = new Date(initialData.targetDeliveryDate);
      if (!isNaN(d.getTime()) && !sameDay(d, selectedDate)) {
        setSelectedDate(d);
        setVisibleMonth(startOfMonth(d));
      }
    }
  }, [initialData]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (locationWrapperRef.current && !locationWrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const minMonth = startOfMonth(minDate);
  const maxMonth = startOfMonth(maxDate);

  const isPreviousMonthDisabled = visibleMonth.getTime() <= minMonth.getTime();
  const isNextMonthDisabled = visibleMonth.getTime() >= maxMonth.getTime();

  function changeMonth(delta: number) {
    setVisibleMonth((current) => {
      const nextMonth = new Date(current.getFullYear(), current.getMonth() + delta, 1, 12);
      if (delta < 0 && nextMonth.getTime() < minMonth.getTime()) return current;
      if (delta > 0 && nextMonth.getTime() > maxMonth.getTime()) return current;
      return nextMonth;
    });
  }

  function isDateDisabled(date: Date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() < minDate.getTime() || d.getTime() > maxDate.getTime();
  }

  function selectDate(date: Date) {
    if (isDateDisabled(date)) return;
    setSelectedDate(date);
    setConfirmed(false);
    onChange?.({
      targetDeliveryDate: date.toISOString(),
    });
  }

  function handleLocationInputChange(newLocation: string) {
    setLocation(newLocation);
    setConfirmed(false);

    const dist = estimateDistanceKmFromFactory(newLocation);
    setDistanceKm(dist);

    const matched = searchRuianAddress(newLocation);
    setSuggestions(matched);
    setShowSuggestions(matched.length > 0);

    onChange?.({
      municipalityName: newLocation,
      distanceKmFromFactory: dist,
    });
  }

  function handleSelectSuggestion(item: RuianAddressItem) {
    const formatted = `${item.municipalityName}, ${item.postalCode}`;
    setLocation(formatted);
    setDistanceKm(item.distanceKm);
    setShowSuggestions(false);
    setConfirmed(false);

    onChange?.({
      municipalityName: formatted,
      distanceKmFromFactory: item.distanceKm,
    });
  }

  function handleStoreysChange(newStoreys: number) {
    setStoreys(newStoreys);
    setConfirmed(false);
    onChange?.({
      storeysCount: newStoreys,
    });
  }

  function handleProceed() {
    setConfirmed(true);
    onSubmit({
      targetDeliveryDate: selectedDate.toISOString(),
      municipalityName: location,
      distanceKmFromFactory: distanceKm,
      storeysCount: storeys,
      truckAccess: 'YES',
      craneAccess: 'YES',
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    handleProceed();
  }

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
        <div className="configurator-progress">
          <div>
            <p className="eyebrow">Nastavení projektu</p>
            <h1>Váš cíl</h1>
          </div>
          <p>Nejprve společně nastavíme termín, místo a rozsah domu.</p>
        </div>

        <section className="support-intro" aria-labelledby="support-title">
          <img src="/images/tereza.png" alt="Tereza, technická podpora PREFA ŠOP" />
          <div>
            <p className="eyebrow">Technická podpora Tereza</p>
            <h2 id="support-title">Dobrý den, provedu vás cenovou kalkulací vaší stavby.</h2>
            <p>
              Zvolte datum, ke kterému bychom Vám měli dokončenou hrubou stavbu předat. 
              Ještě v tomto kroku tak uvidíte, kdy dům půjde do výroby, abychom Váš termín dodrželi.
            </p>
          </div>
          <span className="support-status"><i /> K dispozici během kalkulace</span>
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
                  onClick={(e) => {
                    e.preventDefault();
                    changeMonth(-1);
                  }}
                  disabled={isPreviousMonthDisabled}
                  className={isPreviousMonthDisabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
                  aria-label="Předchozí měsíc"
                >
                  <Icon name="psv-arrow-right" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    changeMonth(1);
                  }}
                  disabled={isNextMonthDisabled}
                  className={isNextMonthDisabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
                  aria-label="Další měsíc"
                >
                  <Icon name="psv-arrow-right" />
                </button>
              </div>
            </div>

            <div className="calendar-grid" role="grid" aria-label="Kalendář cílového termínu">
              {weekdays.map((day) => (
                <span className="weekday" role="columnheader" key={day}>{day}</span>
              ))}
              {calendarDays.map((date) => {
                const outsideMonth = date.getMonth() !== visibleMonth.getMonth();
                const disabled = isDateDisabled(date);
                const selected = sameDay(date, selectedDate);
                return (
                  <button
                    type="button"
                    role="gridcell"
                    key={dateKey(date)}
                    className={`${outsideMonth ? "outside" : ""} ${selected ? "selected" : ""} cursor-pointer`}
                    disabled={disabled}
                    aria-selected={selected}
                    aria-label={formatDate(date)}
                    onClick={(e) => {
                      e.preventDefault();
                      selectDate(date);
                    }}
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

            <div ref={locationWrapperRef} className="relative">
              <label className="field-label" htmlFor="site-location">
                <span className="field-number">1</span>
                <span>Místo stavby</span>
              </label>
              <div className="location-field">
                <Icon name="psv-location" />
                <input
                  id="site-location"
                  name="site-location"
                  type="text"
                  value={location}
                  onChange={(event) => handleLocationInputChange(event.target.value)}
                  onFocus={() => {
                    const matched = searchRuianAddress(location);
                    if (matched.length > 0) {
                      setSuggestions(matched);
                      setShowSuggestions(true);
                    }
                  }}
                  placeholder="Zadejte obec nebo PSČ"
                  autoComplete="off"
                  required
                />
              </div>

              {/* Našeptávač obcí a PSČ */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 left-0 right-0 top-[82px] bg-white border border-[var(--prefa-line)] shadow-lg rounded-sm overflow-hidden divide-y divide-[var(--prefa-line-soft)] max-h-60 overflow-y-auto">
                  {suggestions.map((item) => (
                    <button
                      key={`${item.municipalityName}-${item.postalCode}`}
                      type="button"
                      onClick={() => handleSelectSuggestion(item)}
                      className="w-full px-4 py-2.5 text-left flex items-center justify-between hover:bg-[var(--prefa-paper)] transition cursor-pointer text-xs"
                    >
                      <div>
                        <strong className="text-[var(--prefa-ink)] text-sm font-bold font-sans">
                          {item.municipalityName}
                        </strong>
                        <span className="text-[var(--prefa-stone)] ml-1.5 font-medium">({item.postalCode})</span>
                        <div className="text-[11px] text-[var(--prefa-cedar)]">
                          {item.district ? `${item.district} · ` : ''}{item.region}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[var(--prefa-aqua)] font-bold text-xs block">
                          {item.distanceKm} km
                        </span>
                        <span className="text-[10px] text-[var(--prefa-stone)] block">
                          {item.zoneName}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <p className="field-help">Doplňte pouze obec nebo poštovní směrovací číslo.</p>

            <fieldset className="storeys-fieldset">
              <legend className="field-label">
                <span className="field-number">2</span>
                <span>Počet podlaží</span>
              </legend>
              <div className="segmented-control">
                {[1, 2, 3].map((value) => (
                  <button
                    type="button"
                    className={`cursor-pointer ${storeys === value ? "active" : ""}`}
                    aria-pressed={storeys === value}
                    onClick={(e) => {
                      e.preventDefault();
                      handleStoreysChange(value);
                    }}
                    key={value}
                  >
                    {value === 1 ? "1 podlaží" : value === 2 ? "2 podlaží" : "3 podlaží"}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="selection-summary" aria-live="polite">
              <Icon name="psv-budget" />
              <p>
                <span>Zvolený cíl</span>
                <strong>
                  {storeys === 1 ? 'Přízemní stavba' : storeys === 2 ? 'Stavba se dvěma podlažími' : 'Stavba se třemi podlažími'}, vzdálená {distanceKm} km z výrobního závodu a požadovaným termínem předání {formatDate(selectedDate)}.
                </strong>
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
            <button className="primary-button cursor-pointer" type="button" onClick={handleProceed}>
              <span>Pokračovat ke kalkulaci</span>
              <Icon name="psv-arrow-right" />
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
