import { Product, ProductCategory } from './types';
import masterConfig from './data/master_config.json';
import { WALL_PANELS } from './products/wallPanels';

export * from './types';
export * from './materials/materialRegistry';
export * from './products/wallPanels';

export const ALL_PRODUCTS: Product[] = (masterConfig.products as unknown as Product[]) || [
  ...WALL_PANELS,
];

/**
 * Získá produkt podle jeho obchodního kódu (např. '1.1', '1.2', '1.3', '1.4' nebo legacy 'OS_VF_01')
 */
export function getProductByCode(code: string): Product | undefined {
  if (!code) return ALL_PRODUCTS[0];
  const normalized = code.trim();
  return (
    ALL_PRODUCTS.find((p) => p.code === normalized) ||
    ALL_PRODUCTS.find((p) => p.id === normalized) ||
    ALL_PRODUCTS.find((p) => p.legacyCode === normalized) ||
    ALL_PRODUCTS[0]
  );
}

/**
 * Získá produkty pro danou kategorii (např. 'WALL_OUTER')
 */
export function getProductsByCategory(category: ProductCategory): Product[] {
  return ALL_PRODUCTS.filter((p) => p.category === category);
}

/**
 * Získá jednotkovou cenu za m² bez DPH
 */
export function getProductUnitPrice(code: string): number {
  const prod = getProductByCode(code);
  return prod ? prod.unitPriceExVat : 8500.0;
}

/**
 * Získá kompletní konfiguraci z master JSONu
 */
export function getMasterConfig() {
  return masterConfig;
}
