export type ProductCategory = 'WALL_OUTER' | 'WALL_INNER' | 'CEILING' | 'ROOF';

export type LayerGeometryType = 'solid' | 'frame' | 'hosted_infill' | 'clt_panel';

export interface CltLamella {
  id: string;
  name: string;
  thicknessMm: number;
  grainDirection: 'vertical_z' | 'horizontal_x';
  surfaceQuality: 'VI' | 'NVI';
  materialId: string;
}

export interface ProductLayer {
  id: string;
  order: number;
  name: string;
  materialId: string;
  geometry: LayerGeometryType;
  thicknessMm: number;
  additiveToTotal: boolean;
  hostLayerId?: string;
  explodedGroup?: number;
  massKgM2?: number | null;
  lambdaWMk?: number | null;
  fireClass?: string | null;
  function: string;
  lamellae?: CltLamella[];
}

export interface DeliveryScope {
  included: string[];
  excluded: string[];
  clientSupplied: string[];
  deliveryNote: string;
}

export interface ElectricalPreparation {
  included: boolean;
  heading: string;
  description: string;
  includedItems: string[];
  excludedItems: string[];
  responsibility: 'supplier' | 'client';
}

export interface TechnicalParameters {
  uValue?: number; // W/m²K
  rwDb?: number; // dB
  fireResistance?: string; // e.g. REI 60, DP1
  massKgM2?: number; // kg/m²
}

export interface ProductImages {
  assembledCutawayWebp: string;
  explodedWebp: string;
  fullWebp: string;
  thumbnailWebp?: string;
  assembledCutawayPng?: string;
  explodedPng?: string;
  reviewPng?: string;
}

export interface ProductSurcharges {
  acousticsSurchargePct: number; // e.g. 8%
  fireResistanceSurchargePct: number; // e.g. 10%
  oversizedOpeningsSurchargePct: number; // e.g. 12%
  largeSpanSurchargePct?: number; // e.g. 15% (for ceilings/roofs)
}

export interface Product {
  id: string;
  code: string; // e.g. '1.1', '1.2', '1.3', '1.4'
  legacyCode?: string; // e.g. 'OS_VF_01'
  name: string;
  subtitle: string;
  category: ProductCategory;
  declaredThicknessMm: number;
  layers: ProductLayer[];
  deliveryScope: DeliveryScope;
  electricalPreparation: ElectricalPreparation;
  technicalParameters: TechnicalParameters;
  images: ProductImages;
  unitPriceExVat: number; // CZK / m² gross area
  isRecommended?: boolean;
  surcharges?: ProductSurcharges;
}
