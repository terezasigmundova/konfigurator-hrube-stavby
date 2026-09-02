export interface MaterialDefinition {
  id: string;
  name: string;
  category: 'timber' | 'board' | 'insulation' | 'membrane' | 'coating' | 'clt';
  color: string;
  opacity: number;
  lambdaWMk?: number;
  fireClass?: string;
  densityKgM3?: number;
}

export const MATERIAL_REGISTRY: Record<string, MaterialDefinition> = {
  fermacell_raw: {
    id: 'fermacell_raw',
    name: 'Sádrovláknitá deska Fermacell (surový povrch)',
    category: 'board',
    color: '#d7d9d7',
    opacity: 1.0,
    lambdaWMk: 0.32,
    fireClass: 'A2-s1, d0',
    densityKgM3: 1150,
  },
  kvh_spruce: {
    id: 'kvh_spruce',
    name: 'Konstrukční masivní dřevo KVH smrk (C24)',
    category: 'timber',
    color: '#d7a96f',
    opacity: 1.0,
    lambdaWMk: 0.18,
    fireClass: 'D-s2, d0',
    densityKgM3: 450,
  },
  mineral_wool_soft: {
    id: 'mineral_wool_soft',
    name: 'Minerální tepelná a akustická izolace do rámů',
    category: 'insulation',
    color: '#dccb7b',
    opacity: 0.95,
    lambdaWMk: 0.035,
    fireClass: 'A1',
    densityKgM3: 35,
  },
  mineral_wool_facade: {
    id: 'mineral_wool_facade',
    name: 'Minerální fasádní izolace s podélnou orientací vláken',
    category: 'insulation',
    color: '#c6b35e',
    opacity: 0.98,
    lambdaWMk: 0.035,
    fireClass: 'A1',
    densityKgM3: 90,
  },
  vapour_membrane: {
    id: 'vapour_membrane',
    name: 'Parotěsná fólie / parobrzda s proměnlivým difuzním odporem',
    category: 'membrane',
    color: '#3aa9b8',
    opacity: 0.72,
    fireClass: 'E',
  },
  diffusion_membrane: {
    id: 'diffusion_membrane',
    name: 'Difuzně otevřená fasádní větrotěsná membrána',
    category: 'membrane',
    color: '#3d444b',
    opacity: 0.9,
    fireClass: 'E',
  },
  reinforced_basecoat: {
    id: 'reinforced_basecoat',
    name: 'Základní armovací stěrka s výztužnou sklotextilní mřížkou',
    category: 'coating',
    color: '#8b918e',
    opacity: 1.0,
    fireClass: 'A2-s1, d0',
  },
  clt_spruce_visual: {
    id: 'clt_spruce_visual',
    name: 'Křížem lepené masivní dřevo CLT smrk – pohledová kvalita (VI)',
    category: 'clt',
    color: '#e7bd76',
    opacity: 1.0,
    lambdaWMk: 0.12,
    fireClass: 'D-s2, d0',
    densityKgM3: 490,
  },
  clt_spruce_transverse: {
    id: 'clt_spruce_transverse',
    name: 'CLT střední příčná lamela',
    category: 'clt',
    color: '#d4aa65',
    opacity: 1.0,
    lambdaWMk: 0.12,
    fireClass: 'D-s2, d0',
    densityKgM3: 490,
  },
  clt_spruce_nonvisual: {
    id: 'clt_spruce_nonvisual',
    name: 'CLT vnější krycí lamela – nepohledová kvalita (NVI)',
    category: 'clt',
    color: '#caa05a',
    opacity: 1.0,
    lambdaWMk: 0.12,
    fireClass: 'D-s2, d0',
    densityKgM3: 490,
  },
};
