import { estimateDistanceKmFromFactory, getTransportPriceForDistance } from '@/lib/transport';

export interface RuianAddressItem {
  municipalityName: string;
  municipalityCode?: string;
  postalCode: string;
  district?: string;
  region: string;
  distanceKm: number;
  transportZone: 1 | 2 | 3 | 4;
  zoneName: string;
  flatPricePerTruckExVat: number;
}

/**
 * Regional Transport Zone Mapping from Factory Location: BRUNTÁL / RÝMAŘOV (Moravskoslezský kraj)
 */
export function getTransportZoneForRegionFromBruntal(region: string): { zone: 1 | 2 | 3 | 4; zoneName: string; pricePerTruck: number; price4Trucks: number } {
  if (region.includes('Moravskoslezský') || region.includes('Olomoucký')) {
    return {
      zone: 1,
      zoneName: 'Zóna 1 — Severní Morava (Bruntál & okolí)',
      pricePerTruck: 8000,
      price4Trucks: 32000,
    };
  }

  if (
    region.includes('Zlínský') ||
    region.includes('Jihomoravský') ||
    region.includes('Pardubický') ||
    region.includes('Královéhradecký')
  ) {
    return {
      zone: 2,
      zoneName: 'Zóna 2 — Sousední kraje (Morava & Východní Čechy)',
      pricePerTruck: 13000,
      price4Trucks: 52000,
    };
  }

  if (
    region.includes('Praha') ||
    region.includes('Středočeský') ||
    region.includes('Vysočina') ||
    region.includes('Liberecký')
  ) {
    return {
      zone: 3,
      zoneName: 'Zóna 3 — Praha, Střední Čechy & Vysočina',
      pricePerTruck: 19000,
      price4Trucks: 76000,
    };
  }

  return {
    zone: 4,
    zoneName: 'Zóna 4 — Jižní & Západní Čechy',
    pricePerTruck: 25000,
    price4Trucks: 100000,
  };
}

export const RUIAN_INDEX: RuianAddressItem[] = [
  // Moravskoslezský kraj
  { municipalityName: 'Bruntál', postalCode: '792 01', district: 'okres Bruntál', region: 'Moravskoslezský kraj', distanceKm: 0, transportZone: 1, zoneName: '1–25 km', flatPricePerTruckExVat: 8000 },
  { municipalityName: 'Rýmařov', postalCode: '795 01', district: 'okres Bruntál', region: 'Moravskoslezský kraj', distanceKm: 10, transportZone: 1, zoneName: '1–25 km', flatPricePerTruckExVat: 8000 },
  { municipalityName: 'Krnov', postalCode: '794 01', district: 'okres Bruntál', region: 'Moravskoslezský kraj', distanceKm: 35, transportZone: 1, zoneName: '26–50 km', flatPricePerTruckExVat: 9000 },
  { municipalityName: 'Opava', postalCode: '746 01', district: 'okres Opava', region: 'Moravskoslezský kraj', distanceKm: 45, transportZone: 1, zoneName: '26–50 km', flatPricePerTruckExVat: 9000 },
  { municipalityName: 'Kravaře', postalCode: '747 21', district: 'okres Opava', region: 'Moravskoslezský kraj', distanceKm: 55, transportZone: 1, zoneName: '51–75 km', flatPricePerTruckExVat: 10000 },
  { municipalityName: 'Hlučín', postalCode: '748 01', district: 'okres Opava', region: 'Moravskoslezský kraj', distanceKm: 65, transportZone: 1, zoneName: '51–75 km', flatPricePerTruckExVat: 10000 },
  { municipalityName: 'Ostrava', postalCode: '702 00', district: 'okres Ostrava-město', region: 'Moravskoslezský kraj', distanceKm: 85, transportZone: 1, zoneName: '76–100 km', flatPricePerTruckExVat: 11000 },
  { municipalityName: 'Havířov', postalCode: '736 01', district: 'okres Karviná', region: 'Moravskoslezský kraj', distanceKm: 95, transportZone: 1, zoneName: '76–100 km', flatPricePerTruckExVat: 11000 },
  { municipalityName: 'Karviná', postalCode: '733 01', district: 'okres Karviná', region: 'Moravskoslezský kraj', distanceKm: 105, transportZone: 1, zoneName: '101–125 km', flatPricePerTruckExVat: 12000 },
  { municipalityName: 'Třinec', postalCode: '739 61', district: 'okres Frýdek-Místek', region: 'Moravskoslezský kraj', distanceKm: 115, transportZone: 1, zoneName: '101–125 km', flatPricePerTruckExVat: 12000 },
  { municipalityName: 'Frýdek-Místek', postalCode: '738 01', district: 'okres Frýdek-Místek', region: 'Moravskoslezský kraj', distanceKm: 90, transportZone: 1, zoneName: '76–100 km', flatPricePerTruckExVat: 11000 },
  { municipalityName: 'Nový Jičín', postalCode: '741 01', district: 'okres Nový Jičín', region: 'Moravskoslezský kraj', distanceKm: 75, transportZone: 1, zoneName: '51–75 km', flatPricePerTruckExVat: 10000 },
  { municipalityName: 'Kopřivnice', postalCode: '742 21', district: 'okres Nový Jičín', region: 'Moravskoslezský kraj', distanceKm: 80, transportZone: 1, zoneName: '76–100 km', flatPricePerTruckExVat: 11000 },
  { municipalityName: 'Frenštát pod Radhoštěm', postalCode: '744 01', district: 'okres Nový Jičín', region: 'Moravskoslezský kraj', distanceKm: 85, transportZone: 1, zoneName: '76–100 km', flatPricePerTruckExVat: 11000 },

  // Olomoucký kraj
  { municipalityName: 'Šumperk', postalCode: '787 01', district: 'okres Šumperk', region: 'Olomoucký kraj', distanceKm: 45, transportZone: 1, zoneName: '26–50 km', flatPricePerTruckExVat: 9000 },
  { municipalityName: 'Jeseník', postalCode: '790 01', district: 'okres Jeseník', region: 'Olomoucký kraj', distanceKm: 55, transportZone: 1, zoneName: '51–75 km', flatPricePerTruckExVat: 10000 },
  { municipalityName: 'Uničov', postalCode: '783 91', district: 'okres Olomouc', region: 'Olomoucký kraj', distanceKm: 35, transportZone: 1, zoneName: '26–50 km', flatPricePerTruckExVat: 9000 },
  { municipalityName: 'Šternberk', postalCode: '785 01', district: 'okres Olomouc', region: 'Olomoucký kraj', distanceKm: 40, transportZone: 1, zoneName: '26–50 km', flatPricePerTruckExVat: 9000 },
  { municipalityName: 'Litovel', postalCode: '784 01', district: 'okres Olomouc', region: 'Olomoucký kraj', distanceKm: 50, transportZone: 1, zoneName: '26–50 km', flatPricePerTruckExVat: 9000 },
  { municipalityName: 'Olomouc', postalCode: '779 00', district: 'okres Olomouc', region: 'Olomoucký kraj', distanceKm: 65, transportZone: 1, zoneName: '51–75 km', flatPricePerTruckExVat: 10000 },
  { municipalityName: 'Prostějov', postalCode: '796 01', district: 'okres Prostějov', region: 'Olomoucký kraj', distanceKm: 80, transportZone: 1, zoneName: '76–100 km', flatPricePerTruckExVat: 11000 },
  { municipalityName: 'Přerov', postalCode: '750 02', district: 'okres Přerov', region: 'Olomoucký kraj', distanceKm: 85, transportZone: 1, zoneName: '76–100 km', flatPricePerTruckExVat: 11000 },
  { municipalityName: 'Hranice', postalCode: '753 01', district: 'okres Přerov', region: 'Olomoucký kraj', distanceKm: 65, transportZone: 1, zoneName: '51–75 km', flatPricePerTruckExVat: 10000 },
  { municipalityName: 'Zábřeh', postalCode: '789 01', district: 'okres Šumperk', region: 'Olomoucký kraj', distanceKm: 60, transportZone: 1, zoneName: '51–75 km', flatPricePerTruckExVat: 10000 },
  { municipalityName: 'Mohelnice', postalCode: '789 85', district: 'okres Šumperk', region: 'Olomoucký kraj', distanceKm: 55, transportZone: 1, zoneName: '51–75 km', flatPricePerTruckExVat: 10000 },

  // Jihomoravský kraj
  { municipalityName: 'Brno', postalCode: '602 00', district: 'okres Brno-město', region: 'Jihomoravský kraj', distanceKm: 135, transportZone: 2, zoneName: '126–150 km', flatPricePerTruckExVat: 13000 },
  { municipalityName: 'Blansko', postalCode: '678 01', district: 'okres Blansko', region: 'Jihomoravský kraj', distanceKm: 120, transportZone: 2, zoneName: '101–125 km', flatPricePerTruckExVat: 12000 },
  { municipalityName: 'Boskovice', postalCode: '680 01', district: 'okres Blansko', region: 'Jihomoravský kraj', distanceKm: 105, transportZone: 2, zoneName: '101–125 km', flatPricePerTruckExVat: 12000 },
  { municipalityName: 'Vyškov', postalCode: '682 01', district: 'okres Vyškov', region: 'Jihomoravský kraj', distanceKm: 105, transportZone: 2, zoneName: '101–125 km', flatPricePerTruckExVat: 12000 },
  { municipalityName: 'Slavkov u Brna', postalCode: '684 01', district: 'okres Vyškov', region: 'Jihomoravský kraj', distanceKm: 125, transportZone: 2, zoneName: '101–125 km', flatPricePerTruckExVat: 12000 },
  { municipalityName: 'Hustopeče', postalCode: '693 01', district: 'okres Břeclav', region: 'Jihomoravský kraj', distanceKm: 165, transportZone: 2, zoneName: '151–175 km', flatPricePerTruckExVat: 14000 },
  { municipalityName: 'Břeclav', postalCode: '690 02', district: 'okres Břeclav', region: 'Jihomoravský kraj', distanceKm: 185, transportZone: 2, zoneName: '176–200 km', flatPricePerTruckExVat: 15000 },
  { municipalityName: 'Hodonín', postalCode: '695 01', district: 'okres Hodonín', region: 'Jihomoravský kraj', distanceKm: 175, transportZone: 2, zoneName: '151–175 km', flatPricePerTruckExVat: 14000 },
  { municipalityName: 'Kyjov', postalCode: '697 01', district: 'okres Hodonín', region: 'Jihomoravský kraj', distanceKm: 155, transportZone: 2, zoneName: '151–175 km', flatPricePerTruckExVat: 14000 },
  { municipalityName: 'Znojmo', postalCode: '669 02', district: 'okres Znojmo', region: 'Jihomoravský kraj', distanceKm: 195, transportZone: 2, zoneName: '176–200 km', flatPricePerTruckExVat: 15000 },
  { municipalityName: 'Tišnov', postalCode: '666 01', district: 'okres Brno-venkov', region: 'Jihomoravský kraj', distanceKm: 145, transportZone: 2, zoneName: '126–150 km', flatPricePerTruckExVat: 13000 },
  { municipalityName: 'Kuřim', postalCode: '664 34', district: 'okres Brno-venkov', region: 'Jihomoravský kraj', distanceKm: 140, transportZone: 2, zoneName: '126–150 km', flatPricePerTruckExVat: 13000 },

  // Zlínský kraj
  { municipalityName: 'Zlín', postalCode: '760 01', district: 'okres Zlín', region: 'Zlínský kraj', distanceKm: 125, transportZone: 2, zoneName: '101–125 km', flatPricePerTruckExVat: 12000 },
  { municipalityName: 'Kroměříž', postalCode: '767 01', district: 'okres Kroměříž', region: 'Zlínský kraj', distanceKm: 105, transportZone: 2, zoneName: '101–125 km', flatPricePerTruckExVat: 12000 },
  { municipalityName: 'Uherské Hradiště', postalCode: '686 01', district: 'okres Uherské Hradiště', region: 'Zlínský kraj', distanceKm: 140, transportZone: 2, zoneName: '126–150 km', flatPricePerTruckExVat: 13000 },
  { municipalityName: 'Uherský Brod', postalCode: '688 01', district: 'okres Uherské Hradiště', region: 'Zlínský kraj', distanceKm: 145, transportZone: 2, zoneName: '126–150 km', flatPricePerTruckExVat: 13000 },
  { municipalityName: 'Vsetín', postalCode: '755 01', district: 'okres Vsetín', region: 'Zlínský kraj', distanceKm: 110, transportZone: 2, zoneName: '101–125 km', flatPricePerTruckExVat: 12000 },
  { municipalityName: 'Valašské Meziříčí', postalCode: '757 01', district: 'okres Vsetín', region: 'Zlínský kraj', distanceKm: 85, transportZone: 1, zoneName: '76–100 km', flatPricePerTruckExVat: 11000 },
  { municipalityName: 'Rožnov pod Radhoštěm', postalCode: '756 61', district: 'okres Vsetín', region: 'Zlínský kraj', distanceKm: 95, transportZone: 1, zoneName: '76–100 km', flatPricePerTruckExVat: 11000 },
  { municipalityName: 'Otrokovice', postalCode: '765 02', district: 'okres Zlín', region: 'Zlínský kraj', distanceKm: 115, transportZone: 2, zoneName: '101–125 km', flatPricePerTruckExVat: 12000 },

  // Pardubický & Královéhradecký kraj
  { municipalityName: 'Svitavy', postalCode: '568 02', district: 'okres Svitavy', region: 'Pardubický kraj', distanceKm: 95, transportZone: 1, zoneName: '76–100 km', flatPricePerTruckExVat: 11000 },
  { municipalityName: 'Moravská Třebová', postalCode: '571 01', district: 'okres Svitavy', region: 'Pardubický kraj', distanceKm: 80, transportZone: 1, zoneName: '76–100 km', flatPricePerTruckExVat: 11000 },
  { municipalityName: 'Litomyšl', postalCode: '570 01', district: 'okres Svitavy', region: 'Pardubický kraj', distanceKm: 110, transportZone: 2, zoneName: '101–125 km', flatPricePerTruckExVat: 12000 },
  { municipalityName: 'Ústí nad Orlicí', postalCode: '562 01', district: 'okres Ústí nad Orlicí', region: 'Pardubický kraj', distanceKm: 120, transportZone: 2, zoneName: '101–125 km', flatPricePerTruckExVat: 12000 },
  { municipalityName: 'Česká Třebová', postalCode: '560 02', district: 'okres Ústí nad Orlicí', region: 'Pardubický kraj', distanceKm: 115, transportZone: 2, zoneName: '101–125 km', flatPricePerTruckExVat: 12000 },
  { municipalityName: 'Pardubice', postalCode: '530 02', district: 'okres Pardubice', region: 'Pardubický kraj', distanceKm: 155, transportZone: 2, zoneName: '151–175 km', flatPricePerTruckExVat: 14000 },
  { municipalityName: 'Chrudim', postalCode: '537 01', district: 'okres Chrudim', region: 'Pardubický kraj', distanceKm: 150, transportZone: 2, zoneName: '126–150 km', flatPricePerTruckExVat: 13000 },
  { municipalityName: 'Hradec Králové', postalCode: '500 02', district: 'okres Hradec Králové', region: 'Královéhradecký kraj', distanceKm: 160, transportZone: 2, zoneName: '151–175 km', flatPricePerTruckExVat: 14000 },
  { municipalityName: 'Rychnov nad Kněžnou', postalCode: '516 01', district: 'okres Rychnov nad Kněžnou', region: 'Královéhradecký kraj', distanceKm: 135, transportZone: 2, zoneName: '126–150 km', flatPricePerTruckExVat: 13000 },
  { municipalityName: 'Náchod', postalCode: '547 01', district: 'okres Náchod', region: 'Královéhradecký kraj', distanceKm: 170, transportZone: 2, zoneName: '151–175 km', flatPricePerTruckExVat: 14000 },
  { municipalityName: 'Trutnov', postalCode: '541 01', district: 'okres Trutnov', region: 'Královéhradecký kraj', distanceKm: 185, transportZone: 2, zoneName: '176–200 km', flatPricePerTruckExVat: 15000 },
  { municipalityName: 'Jičín', postalCode: '506 01', district: 'okres Jičín', region: 'Královéhradecký kraj', distanceKm: 195, transportZone: 2, zoneName: '176–200 km', flatPricePerTruckExVat: 15000 },

  // Kraj Vysočina
  { municipalityName: 'Jihlava', postalCode: '586 01', district: 'okres Jihlava', region: 'Kraj Vysočina', distanceKm: 195, transportZone: 3, zoneName: '176–200 km', flatPricePerTruckExVat: 15000 },
  { municipalityName: 'Žďár nad Sázavou', postalCode: '591 01', district: 'okres Žďár nad Sázavou', region: 'Kraj Vysočina', distanceKm: 165, transportZone: 2, zoneName: '151–175 km', flatPricePerTruckExVat: 14000 },
  { municipalityName: 'Třebíč', postalCode: '674 01', district: 'okres Třebíč', region: 'Kraj Vysočina', distanceKm: 180, transportZone: 2, zoneName: '176–200 km', flatPricePerTruckExVat: 15000 },
  { municipalityName: 'Havlíčkův Brod', postalCode: '580 01', district: 'okres Havlíčkův Brod', region: 'Kraj Vysočina', distanceKm: 185, transportZone: 2, zoneName: '176–200 km', flatPricePerTruckExVat: 15000 },
  { municipalityName: 'Pelhřimov', postalCode: '393 01', district: 'okres Pelhřimov', region: 'Kraj Vysočina', distanceKm: 225, transportZone: 3, zoneName: '201–225 km', flatPricePerTruckExVat: 16000 },

  // Praha & Středočeský kraj
  { municipalityName: 'Praha', postalCode: '110 00', district: 'Hlavní město Praha', region: 'Hlavní město Praha', distanceKm: 265, transportZone: 3, zoneName: '251–275 km', flatPricePerTruckExVat: 18000 },
  { municipalityName: 'Kladno', postalCode: '272 01', district: 'okres Kladno', region: 'Středočeský kraj', distanceKm: 295, transportZone: 3, zoneName: '276–300 km', flatPricePerTruckExVat: 19000 },
  { municipalityName: 'Mladá Boleslav', postalCode: '293 01', district: 'okres Mladá Boleslav', region: 'Středočeský kraj', distanceKm: 240, transportZone: 3, zoneName: '226–250 km', flatPricePerTruckExVat: 17000 },
  { municipalityName: 'Kolín', postalCode: '280 02', district: 'okres Kolín', region: 'Středočeský kraj', distanceKm: 210, transportZone: 3, zoneName: '201–225 km', flatPricePerTruckExVat: 16000 },
  { municipalityName: 'Kutná Hora', postalCode: '284 01', district: 'okres Kutná Hora', region: 'Středočeský kraj', distanceKm: 210, transportZone: 3, zoneName: '201–225 km', flatPricePerTruckExVat: 16000 },
  { municipalityName: 'Nymburk', postalCode: '288 02', district: 'okres Nymburk', region: 'Středočeský kraj', distanceKm: 235, transportZone: 3, zoneName: '226–250 km', flatPricePerTruckExVat: 17000 },
  { municipalityName: 'Poděbrady', postalCode: '290 01', district: 'okres Nymburk', region: 'Středočeský kraj', distanceKm: 225, transportZone: 3, zoneName: '201–225 km', flatPricePerTruckExVat: 16000 },
  { municipalityName: 'Benešov', postalCode: '256 01', district: 'okres Benešov', region: 'Středočeský kraj', distanceKm: 270, transportZone: 3, zoneName: '251–275 km', flatPricePerTruckExVat: 18000 },
  { municipalityName: 'Beroun', postalCode: '266 01', district: 'okres Beroun', region: 'Středočeský kraj', distanceKm: 295, transportZone: 3, zoneName: '276–300 km', flatPricePerTruckExVat: 19000 },
  { municipalityName: 'Příbram', postalCode: '261 01', district: 'okres Příbram', region: 'Středočeský kraj', distanceKm: 310, transportZone: 3, zoneName: '301–325 km', flatPricePerTruckExVat: 20000 },
  { municipalityName: 'Mělník', postalCode: '276 01', district: 'okres Mělník', region: 'Středočeský kraj', distanceKm: 280, transportZone: 3, zoneName: '276–300 km', flatPricePerTruckExVat: 19000 },
  { municipalityName: 'Rakovník', postalCode: '269 01', district: 'okres Rakovník', region: 'Středočeský kraj', distanceKm: 320, transportZone: 3, zoneName: '301–325 km', flatPricePerTruckExVat: 20000 },
  { municipalityName: 'Říčany', postalCode: '251 01', district: 'okres Praha-východ', region: 'Středočeský kraj', distanceKm: 260, transportZone: 3, zoneName: '251–275 km', flatPricePerTruckExVat: 18000 },
  { municipalityName: 'Černošice', postalCode: '252 28', district: 'okres Praha-západ', region: 'Středočeský kraj', distanceKm: 275, transportZone: 3, zoneName: '251–275 km', flatPricePerTruckExVat: 18000 },

  // Liberecký & Ústecký kraj
  { municipalityName: 'Liberec', postalCode: '460 01', district: 'okres Liberec', region: 'Liberecký kraj', distanceKm: 265, transportZone: 3, zoneName: '251–275 km', flatPricePerTruckExVat: 18000 },
  { municipalityName: 'Jablonec nad Nisou', postalCode: '466 01', district: 'okres Jablonec nad Nisou', region: 'Liberecký kraj', distanceKm: 255, transportZone: 3, zoneName: '251–275 km', flatPricePerTruckExVat: 18000 },
  { municipalityName: 'Česká Lípa', postalCode: '470 01', district: 'okres Česká Lípa', region: 'Liberecký kraj', distanceKm: 290, transportZone: 3, zoneName: '276–300 km', flatPricePerTruckExVat: 19000 },
  { municipalityName: 'Semily', postalCode: '513 01', district: 'okres Semily', region: 'Liberecký kraj', distanceKm: 215, transportZone: 3, zoneName: '201–225 km', flatPricePerTruckExVat: 16000 },
  { municipalityName: 'Turnov', postalCode: '511 01', district: 'okres Semily', region: 'Liberecký kraj', distanceKm: 230, transportZone: 3, zoneName: '226–250 km', flatPricePerTruckExVat: 17000 },
  { municipalityName: 'Ústí nad Labem', postalCode: '400 01', district: 'okres Ústí nad Labem', region: 'Ústecký kraj', distanceKm: 345, transportZone: 4, zoneName: '326–350 km', flatPricePerTruckExVat: 21000 },
  { municipalityName: 'Děčín', postalCode: '405 02', district: 'okres Děčín', region: 'Ústecký kraj', distanceKm: 340, transportZone: 4, zoneName: '326–350 km', flatPricePerTruckExVat: 21000 },
  { municipalityName: 'Teplice', postalCode: '415 01', district: 'okres Teplice', region: 'Ústecký kraj', distanceKm: 355, transportZone: 4, zoneName: '351–375 km', flatPricePerTruckExVat: 22000 },
  { municipalityName: 'Most', postalCode: '434 01', district: 'okres Most', region: 'Ústecký kraj', distanceKm: 365, transportZone: 4, zoneName: '351–375 km', flatPricePerTruckExVat: 22000 },
  { municipalityName: 'Chomutov', postalCode: '430 01', district: 'okres Chomutov', region: 'Ústecký kraj', distanceKm: 385, transportZone: 4, zoneName: '376–400 km', flatPricePerTruckExVat: 23000 },
  { municipalityName: 'Litoměřice', postalCode: '412 01', district: 'okres Litoměřice', region: 'Ústecký kraj', distanceKm: 315, transportZone: 4, zoneName: '301–325 km', flatPricePerTruckExVat: 20000 },
  { municipalityName: 'Louny', postalCode: '440 01', district: 'okres Louny', region: 'Ústecký kraj', distanceKm: 325, transportZone: 4, zoneName: '326–350 km', flatPricePerTruckExVat: 21000 },
  { municipalityName: 'Žatec', postalCode: '438 01', district: 'okres Louny', region: 'Ústecký kraj', distanceKm: 345, transportZone: 4, zoneName: '326–350 km', flatPricePerTruckExVat: 21000 },

  // Jihočeský kraj
  { municipalityName: 'České Budějovice', postalCode: '370 01', district: 'okres České Budějovice', region: 'Jihočeský kraj', distanceKm: 325, transportZone: 4, zoneName: '326–350 km', flatPricePerTruckExVat: 21000 },
  { municipalityName: 'Tábor', postalCode: '390 02', district: 'okres Tábor', region: 'Jihočeský kraj', distanceKm: 285, transportZone: 4, zoneName: '276–300 km', flatPricePerTruckExVat: 19000 },
  { municipalityName: 'Písek', postalCode: '397 01', district: 'okres Písek', region: 'Jihočeský kraj', distanceKm: 315, transportZone: 4, zoneName: '301–325 km', flatPricePerTruckExVat: 20000 },
  { municipalityName: 'Strakonice', postalCode: '386 01', district: 'okres Strakonice', region: 'Jihočeský kraj', distanceKm: 340, transportZone: 4, zoneName: '326–350 km', flatPricePerTruckExVat: 21000 },
  { municipalityName: 'Jindřichův Hradec', postalCode: '377 01', district: 'okres Jindřichův Hradec', region: 'Jihočeský kraj', distanceKm: 255, transportZone: 3, zoneName: '251–275 km', flatPricePerTruckExVat: 18000 },
  { municipalityName: 'Český Krumlov', postalCode: '381 01', district: 'okres Český Krumlov', region: 'Jihočeský kraj', distanceKm: 350, transportZone: 4, zoneName: '326–350 km', flatPricePerTruckExVat: 21000 },
  { municipalityName: 'Prachatice', postalCode: '383 01', district: 'okres Prachatice', region: 'Jihočeský kraj', distanceKm: 365, transportZone: 4, zoneName: '351–375 km', flatPricePerTruckExVat: 22000 },

  // Plzeňský & Karlovarský kraj
  { municipalityName: 'Plzeň', postalCode: '301 00', district: 'okres Plzeň-město', region: 'Plzeňský kraj', distanceKm: 360, transportZone: 4, zoneName: '351–375 km', flatPricePerTruckExVat: 22000 },
  { municipalityName: 'Rokycany', postalCode: '337 01', district: 'okres Rokycany', region: 'Plzeňský kraj', distanceKm: 340, transportZone: 4, zoneName: '326–350 km', flatPricePerTruckExVat: 21000 },
  { municipalityName: 'Klatovy', postalCode: '339 01', district: 'okres Klatovy', region: 'Plzeňský kraj', distanceKm: 390, transportZone: 4, zoneName: '376–400 km', flatPricePerTruckExVat: 23000 },
  { municipalityName: 'Domažlice', postalCode: '344 01', district: 'okres Domažlice', region: 'Plzeňský kraj', distanceKm: 415, transportZone: 4, zoneName: '401–425 km', flatPricePerTruckExVat: 24000 },
  { municipalityName: 'Tachov', postalCode: '347 01', district: 'okres Tachov', region: 'Plzeňský kraj', distanceKm: 420, transportZone: 4, zoneName: '401–425 km', flatPricePerTruckExVat: 24000 },
  { municipalityName: 'Karlovy Vary', postalCode: '360 01', district: 'okres Karlovy Vary', region: 'Karlovarský kraj', distanceKm: 400, transportZone: 4, zoneName: '376–400 km', flatPricePerTruckExVat: 23000 },
  { municipalityName: 'Sokolov', postalCode: '356 01', district: 'okres Sokolov', region: 'Karlovarský kraj', distanceKm: 420, transportZone: 4, zoneName: '401–425 km', flatPricePerTruckExVat: 24000 },
  { municipalityName: 'Cheb', postalCode: '350 02', district: 'okres Cheb', region: 'Karlovarský kraj', distanceKm: 445, transportZone: 4, zoneName: '426–450 km', flatPricePerTruckExVat: 25000 },
];

/**
 * Searches the RÚIAN index by query string (municipality name or postal code).
 */
export function searchRuianAddress(query: string): RuianAddressItem[] {
  const cleanQuery = query.trim().toLowerCase().replace(/\s+/g, '');
  if (cleanQuery.length < 1) return [];

  const matched = RUIAN_INDEX.filter((item) => {
    const nameMatch = item.municipalityName.toLowerCase().replace(/\s+/g, '').includes(cleanQuery);
    const pscMatch = item.postalCode.replace(/\s+/g, '').includes(cleanQuery);
    const districtMatch = item.district ? item.district.toLowerCase().replace(/\s+/g, '').includes(cleanQuery) : false;
    return nameMatch || pscMatch || districtMatch;
  });

  return matched.slice(0, 8);
}
