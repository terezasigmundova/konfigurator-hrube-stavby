/**
 * Oficiální ceník přepravy – Ferdinand Šopík (STAVEBNÍ STROJE A DOPRAVA)
 * Sídlo / výchozí bod: Bartákova 11, 795 01 Rýmařov / Bruntál (výrobní závod PREFA ŠOP)
 * Zdroj: ZDROJE/Ceník_doprava.pdf
 */

export interface TransportBandRate {
  kmFrom: number;
  kmTo: number;
  pricePlachtaExVat: number;
  pricePlatoExVat: number;
}

export const TRANSPORT_PRICE_MATRIX: TransportBandRate[] = [
  { kmFrom: 1, kmTo: 25, pricePlachtaExVat: 8000, pricePlatoExVat: 8000 },
  { kmFrom: 26, kmTo: 50, pricePlachtaExVat: 9000, pricePlatoExVat: 9000 },
  { kmFrom: 51, kmTo: 75, pricePlachtaExVat: 10000, pricePlatoExVat: 10000 },
  { kmFrom: 76, kmTo: 100, pricePlachtaExVat: 11000, pricePlatoExVat: 11000 },
  { kmFrom: 101, kmTo: 125, pricePlachtaExVat: 11500, pricePlatoExVat: 12000 },
  { kmFrom: 126, kmTo: 150, pricePlachtaExVat: 12000, pricePlatoExVat: 13000 },
  { kmFrom: 151, kmTo: 175, pricePlachtaExVat: 12500, pricePlatoExVat: 14000 },
  { kmFrom: 176, kmTo: 200, pricePlachtaExVat: 13000, pricePlatoExVat: 15000 },
  { kmFrom: 201, kmTo: 225, pricePlachtaExVat: 13500, pricePlatoExVat: 16000 },
  { kmFrom: 226, kmTo: 250, pricePlachtaExVat: 14000, pricePlatoExVat: 17000 },
  { kmFrom: 251, kmTo: 275, pricePlachtaExVat: 14500, pricePlatoExVat: 18000 },
  { kmFrom: 276, kmTo: 300, pricePlachtaExVat: 15000, pricePlatoExVat: 19000 },
  { kmFrom: 301, kmTo: 325, pricePlachtaExVat: 16000, pricePlatoExVat: 20000 },
  { kmFrom: 326, kmTo: 350, pricePlachtaExVat: 17000, pricePlatoExVat: 21000 },
  { kmFrom: 351, kmTo: 375, pricePlachtaExVat: 18000, pricePlatoExVat: 22000 },
  { kmFrom: 376, kmTo: 400, pricePlachtaExVat: 19000, pricePlatoExVat: 23000 },
  { kmFrom: 401, kmTo: 425, pricePlachtaExVat: 20000, pricePlatoExVat: 24000 },
  { kmFrom: 426, kmTo: 450, pricePlachtaExVat: 21000, pricePlatoExVat: 25000 },
  { kmFrom: 451, kmTo: 475, pricePlachtaExVat: 22000, pricePlatoExVat: 26000 },
  { kmFrom: 476, kmTo: 500, pricePlachtaExVat: 23000, pricePlatoExVat: 27000 },
  { kmFrom: 501, kmTo: 525, pricePlachtaExVat: 24000, pricePlatoExVat: 28000 },
];

/**
 * Příplatek za prostoje: V případě nesložení vozidla do 18:00 hod.
 * daného dne vykládky se účtuje 250 Kč za každou hodinu čekání.
 */
export const DEMURRAGE_HOURLY_RATE_CZK = 250;

/**
 * Vypočte cenu za 1 kamion dle ujeté vzdálenosti v kilometrech
 */
export function getTransportPriceForDistance(distanceKm: number, vehicleType: 'PLATO' | 'PLACHTA' = 'PLATO'): {
  km: number;
  bandLabel: string;
  pricePerTruckExVat: number;
} {
  const km = Math.max(1, Math.round(distanceKm));

  const matched = TRANSPORT_PRICE_MATRIX.find(
    (band) => km >= band.kmFrom && km <= band.kmTo
  );

  if (matched) {
    return {
      km,
      bandLabel: `${matched.kmFrom}–${matched.kmTo} km`,
      pricePerTruckExVat: vehicleType === 'PLATO' ? matched.pricePlatoExVat : matched.pricePlachtaExVat,
    };
  }

  // Extrapolace nad 525 km (+1 000 Kč za každých započatých 25 km)
  const extraKm = km - 525;
  const extraBands = Math.ceil(extraKm / 25);
  const baseRate = vehicleType === 'PLATO' ? 28000 : 24000;
  const price = baseRate + extraBands * 1000;

  return {
    km,
    bandLabel: `nad 525 km (${km} km)`,
    pricePerTruckExVat: price,
  };
}

/**
 * Databáze orientačních silničních vzdáleností z výrobního závodu Bruntál / Rýmařov do měst a regionů ČR
 */
export const MUNICIPALITY_DISTANCES_FROM_FACTORY: Record<string, number> = {
  // Moravskoslezský & Olomoucký kraj
  'bruntál': 15,
  'rýmařov': 10,
  'krnov': 35,
  'opava': 45,
  'šumperk': 45,
  'jeseník': 55,
  'olomouc': 65,
  'ostrava': 85,
  'havířov': 95,
  'karviná': 100,
  'frýdek-místek': 90,
  'nový jičín': 75,
  'přerov': 85,
  'prostějov': 80,
  'hranice': 65,

  // Zlínský & Jihomoravský kraj
  'kroměříž': 105,
  'zlín': 125,
  'uherské hradiště': 140,
  'vsetín': 110,
  'valasske mezirici': 85,
  'valaské meziříčí': 85,
  'brno': 135,
  'blansko': 120,
  'vyškov': 105,
  'břeclav': 185,
  'hodonín': 175,
  'znojmo': 195,
  'hustopeče': 165,

  // Pardubický & Královéhradecký kraj
  'svitavy': 95,
  'ústeckoorlicko': 120,
  'ústí nad orlicí': 120,
  'pardubice': 155,
  'chrudim': 150,
  'hradec králové': 160,
  'rychnov nad kněžnou': 135,
  'náchod': 170,
  'trutnov': 185,
  'j مرورic': 195,
  'jičín': 195,

  // Vysočina
  'žďár nad sázavou': 165,
  'havlíčkův brod': 185,
  'jihlava': 195,
  'třebíč': 180,
  'pelhřimov': 225,

  // Praha & Středočeský kraj
  'praha': 265,
  'kolín': 210,
  'kutná hora': 210,
  'nimburg': 235,
  'nymburk': 235,
  'poděbrady': 225,
  'mladá boleslav': 240,
  'kladno': 295,
  'beroun': 295,
  'benešov': 270,
  'příbram': 310,
  'mělník': 280,
  'rakovník': 320,

  // Liberecký & Ústecký kraj
  'semily': 215,
  'liberec': 265,
  'jablonec nad nisou': 255,
  'česká lípa': 290,
  'litoměřice': 315,
  'ústí nad labem': 345,
  'děčín': 340,
  'teplice': 355,
  'most': 365,
  'chomutov': 385,
  'žatec': 345,
  'louny': 325,

  // Jihočeský kraj
  'tábor': 285,
  'písek': 315,
  'strakonice': 340,
  'jindřichův hradec': 255,
  'české budějovice': 325,
  'český krumlov': 350,
  'prachatice': 365,

  // Plzeňský & Karlovarský kraj
  'plzeň': 360,
  'rokycany': 340,
  'klatovy': 390,
  'domažlice': 415,
  'tachov': 420,
  'karlovy vary': 400,
  'sokolov': 420,
  'cheb': 445,
};

/**
 * Odhadne silniční vzdálenost v km z výrobního závodu (Rýmařov / Bruntál)
 * podle zadaného názvu obce nebo PSČ.
 */
export function estimateDistanceKmFromFactory(locationQuery: string): number {
  if (!locationQuery) return 60;
  const q = locationQuery.toLowerCase().trim();

  // Vyhledání podle PSČ (první 2-3 číslice)
  const pscMatch = q.match(/\b(\d{3})\s*(\d{2})?\b/);
  if (pscMatch) {
    const pscPrefix = parseInt(pscMatch[1], 10);
    // 790-798: Bruntál / Jeseník / Rýmařov / Prostějov
    if (pscPrefix >= 790 && pscPrefix <= 798) return 25;
    // 740-749: Opava
    if (pscPrefix >= 740 && pscPrefix <= 749) return 45;
    // 700-739: Ostrava, Karviná, Frýdek
    if (pscPrefix >= 700 && pscPrefix <= 739) return 85;
    // 770-789: Olomouc, Šumperk
    if (pscPrefix >= 770 && pscPrefix <= 789) return 60;
    // 750-769: Zlín, Kroměříž, Vsetín
    if (pscPrefix >= 750 && pscPrefix <= 769) return 110;
    // 600-699: Brno a Jihomoravský kraj
    if (pscPrefix >= 600 && pscPrefix <= 699) return 145;
    // 500-599: Pardubice, Hradec Králové, Vysočina
    if (pscPrefix >= 500 && pscPrefix <= 599) return 155;
    // 100-299: Praha a Středočeský kraj
    if (pscPrefix >= 100 && pscPrefix <= 299) return 275;
    // 460-473: Liberecko
    if (pscPrefix >= 460 && pscPrefix <= 473) return 260;
    // 400-459: Ústecký kraj
    if (pscPrefix >= 400 && pscPrefix <= 459) return 345;
    // 370-399: Jihočeský kraj
    if (pscPrefix >= 370 && pscPrefix <= 399) return 315;
    // 300-349: Plzeňský kraj
    if (pscPrefix >= 300 && pscPrefix <= 349) return 365;
    // 350-369: Karlovarský kraj
    if (pscPrefix >= 350 && pscPrefix <= 369) return 415;
  }

  // Vyhledání podle známých měst v indexu
  for (const [name, dist] of Object.entries(MUNICIPALITY_DISTANCES_FROM_FACTORY)) {
    if (q.includes(name)) {
      return dist;
    }
  }

  // Defaultní rozdělení dle klíčových slov
  if (q.includes('praha') || q.includes('prague')) return 265;
  if (q.includes('brno')) return 135;
  if (q.includes('ostrava')) return 85;
  if (q.includes('olomouc')) return 65;
  if (q.includes('plzeň') || q.includes('plzen')) return 360;
  if (q.includes('liberec')) return 265;
  if (q.includes('budějovice') || q.includes('budejovice')) return 325;
  if (q.includes('vary')) return 400;
  if (q.includes('ústí') || q.includes('usti')) return 345;
  if (q.includes('moravskoslez') || q.includes('olomouc')) return 50;

  return 120;
}

/**
 * Kompletní kalkulace dopravy pro zadané místo a počet kamionů
 */
export function calculateProjectTransport({
  locationQuery,
  trucksCount = 4,
  vehicleType = 'PLATO',
}: {
  locationQuery: string;
  trucksCount?: number;
  vehicleType?: 'PLATO' | 'PLACHTA';
}): {
  distanceKm: number;
  bandLabel: string;
  pricePerTruckExVat: number;
  totalTransportExVat: number;
  totalTransportIncVat: number;
  carrierName: string;
  vehicleType: 'PLATO' | 'PLACHTA';
} {
  const distanceKm = estimateDistanceKmFromFactory(locationQuery);
  const { bandLabel, pricePerTruckExVat } = getTransportPriceForDistance(distanceKm, vehicleType);
  const totalTransportExVat = pricePerTruckExVat * trucksCount;
  const totalTransportIncVat = totalTransportExVat * 1.21;

  return {
    distanceKm,
    bandLabel,
    pricePerTruckExVat,
    totalTransportExVat,
    totalTransportIncVat,
    carrierName: 'Ferdinand Šopík – STAVEBNÍ STROJE A DOPRAVA',
    vehicleType,
  };
}
