# 04 — Doporučené komponenty a datová rozhraní

Referenční stránky jsou záměrně uloženy jako samostatné soubory. Při produkční integraci je rozdělte na následující sdílené komponenty.

## Společné komponenty

### `PrefaLogo`

Props:

```ts
type PrefaLogoProps = {
  href?: string;
  variant?: "default" | "compact";
};
```

### `TechnicalIcon`

```ts
type TechnicalIconProps = {
  name: string;
  size?: "ui" | "content" | "process";
  inverted?: boolean;
  decorative?: boolean;
};
```

### `TerezaSupport`

```ts
type TerezaSupportProps = {
  mode: "floating" | "banner" | "sidebar";
  title: string;
  message: string;
  expanded?: boolean;
  onToggle?: () => void;
};
```

### `PrimaryAction`

```ts
type PrimaryActionProps = {
  label: string;
  href?: string;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
};
```

## Komponenty konfigurátoru

### `ConfiguratorNavigation`

```ts
type ConfiguratorStep = {
  id: string;
  order: number;
  label: string;
  state: "done" | "active" | "ready" | "locked" | "error";
  href?: string;
};

type ConfiguratorNavigationProps = {
  steps: ConfiguratorStep[];
  activeStepId: string;
};
```

### `StepHeader`

```ts
type StepHeaderProps = {
  step: number;
  totalSteps: number;
  eyebrow: string;
  title: string;
  description: string;
  phases?: Array<{
    id: string;
    label: string;
    icon: string;
    state: "complete" | "active" | "pending";
  }>;
};
```

### `PriceSummary`

```ts
type PriceLine = {
  id: string;
  label: string;
  amount: number;
  unit?: string;
  explanation?: string;
};

type PriceSummaryProps = {
  title: string;
  lines: PriceLine[];
  totalWithoutVat: number;
  currency: "CZK";
};
```

### `ConfiguratorFooter`

```ts
type ConfiguratorFooterProps = {
  stepPrice: number;
  totalPrice: number;
  progressLabel: string;
  backHref: string;
  actionLabel: string;
  actionDisabled?: boolean;
  actionLoading?: boolean;
  onAction: () => void;
};
```

## Komponenty práce s výkresem

### `DrawingUploader`

```ts
type DrawingUploaderProps = {
  acceptedTypes: string[];
  maxSizeBytes: number;
  file?: FileReference;
  error?: string;
  onSelect: (file: File) => Promise<void>;
  onRemove: () => Promise<void>;
  onUseSample?: () => void;
};
```

### `DrawingCanvas`

```ts
type DrawingPoint = { id: string; x: number; y: number };

type DrawingCanvasProps = {
  sourceUrl: string;
  page: number;
  scaleMmPerPixel?: number;
  points: DrawingPoint[];
  mode: "scale" | "outline" | "review";
  snapEnabled: boolean;
  onAddPoint: (point: Omit<DrawingPoint, "id">) => void;
  onMovePoint: (id: string, point: Omit<DrawingPoint, "id">) => void;
  onRemoveLastPoint: () => void;
  onClear: () => void;
};
```

### `PanelSelector`

```ts
type PanelVariant = {
  id: string;
  code: string;
  name: string;
  description: string;
  imageUrl?: string;
  pricePerSquareMeter: number;
  uValue: number;
  layerSummary: string[];
};

type PanelSelectorProps = {
  variants: PanelVariant[];
  selectedId: string;
  onChange: (id: string) => void;
  onShowDetail: (id: string) => void;
};
```

## Stavová architektura

- Každý krok má vlastní serializovatelný stav.
- Stav kroku se ukládá při každé významné změně a před navigací.
- Prezentační komponenty nesmí přímo volat cenové API.
- Výpočet ceny probíhá v doménové vrstvě a komponenty dostávají již vypočtené řádky.
- Upload, analýza PDF, kalibrace, geometrie a cenotvorba mají oddělené služby.
