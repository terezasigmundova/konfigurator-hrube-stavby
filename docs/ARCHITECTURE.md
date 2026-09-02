# Architecture & Implementation Log: VESPER Guided Trace Studio V5.1

## Overview
**VESPER Guided Trace Studio V5.1** is a 100% greenfield web configurator and pre-order pricing engine for prefabricated timber panel construction (ŠOPÍK / Vesper Frames).

## Tech Stack
* **Framework:** Next.js 15 (App Router, TypeScript)
* **Canvas Rendering:** Konva / react-konva (Separated layers for drawings, geometry, dimensions, snapping)
* **PDF Engine:** pdfjs-dist
* **Database & ORM:** PostgreSQL + Prisma ORM 6.4.0 (SQLite for local dev)
* **RÚIAN Autocomplete:** Built-in Czech municipality and postal code index module

## Completed Stages

### Etapa 0 — Greenfield Baseline (COMPLETED)
- [x] Initialized clean repository structure & App Router shell.
- [x] Implemented Prisma DB schema (`prisma/schema.prisma`) matching section 17 of `VESPER_V5_1_GREENFIELD_CODER_BRIEF.md`.
- [x] Implemented idempotent catalog & price book seed script (`prisma/seed.ts`) populating all 10 certified DNK panel compositions and service rates (18% assembly, 4% handling, 35,000 CZK site prep, 45 CZK/km transport).
- [x] Implemented domain geometry library (`src/lib/geometry`) for $S \rightarrow N \rightarrow M \rightarrow V$ coordinate transformations, distance, polygon area, and sloped roof area calculations.
- [x] Implemented deterministic pricing engine (`src/lib/pricing`).
- [x] Implemented RÚIAN address index search (`src/lib/ruian`).
- [x] Implemented Stage 0 unit tests (`tests/stage0_baseline.test.ts`).

### Etapa 1 — One-Page Shell & Step 1 (COMPLETED)
- [x] Sticky Header Stepper (`src/components/layout/HeaderStepper.tsx`) with autosave indicator & step status tracking.
- [x] Live Bottom Price Bar (`src/components/layout/BottomPriceBar.tsx`) displaying real-time subtotal, VAT, active element price, and surcharges.
- [x] Interactive Step 1 Form (`src/components/steps/Step1Inputs.tsx`) with RÚIAN municipality & postal code autocomplete, truck & crane logistics flags, storeys selector, and target date.

## Verification Protocol
* All unit tests passed (`vitest run`).
* Database seed executed cleanly without duplicates.
