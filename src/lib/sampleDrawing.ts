/**
 * Generates a clean Data URL of a sample architectural floor plan blueprint (SVG/PNG) for 1-click testing.
 */
export function getSampleFloorPlanDataUrl(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="700" viewBox="0 0 1000 700" style="background:#ffffff;">
    <style>
      .wall { stroke: #0f172a; stroke-width: 6; fill: none; }
      .inner-wall { stroke: #334155; stroke-width: 4; fill: none; }
      .dim { stroke: #f59e0b; stroke-width: 1.5; stroke-dasharray: 4,4; }
      .text { font-family: sans-serif; font-size: 14px; fill: #1e293b; font-weight: bold; }
      .dim-text { font-family: sans-serif; font-size: 13px; fill: #d97706; font-weight: bold; }
      .door { stroke: #0284c7; stroke-width: 2; fill: none; }
    </style>

    <!-- Title Block -->
    <rect x="700" y="580" width="260" height="90" fill="#f8fafc" stroke="#64748b" stroke-width="2"/>
    <text x="715" y="605" class="text" font-size="16">RODINNÝ DŮM 4+KK</text>
    <text x="715" y="630" font-family="sans-serif" font-size="12" fill="#64748b">PŮDORYS 1.NP — VESPER FRAMES</text>
    <text x="715" y="655" font-family="sans-serif" font-size="12" fill="#64748b">MĚŘÍTKO 1:50 | CERTIFIKOVÁNO DNK</text>

    <!-- Outer Walls (12.0m x 8.0m) -->
    <rect x="150" y="120" width="600" height="400" class="wall" />

    <!-- Room Divisions -->
    <line x1="450" y1="120" x2="450" y2="520" class="inner-wall" />
    <line x1="450" y1="300" x2="750" y2="300" class="inner-wall" />

    <!-- Room Labels -->
    <text x="250" y="300" class="text">OBÝVACÍ POKOJ + KK (38 m²)</text>
    <text x="520" y="210" class="text">LOŽNICE (18 m²)</text>
    <text x="520" y="420" class="text">KOUPELNA + TZB (16 m²)</text>

    <!-- Dimension Line A-B (12.00 m) -->
    <line x1="150" y1="80" x2="750" y2="80" class="dim" />
    <circle cx="150" cy="80" r="5" fill="#f59e0b"/>
    <circle cx="750" cy="80" r="5" fill="#f59e0b"/>
    <text x="410" y="70" class="dim-text">KÓTA A-B = 12.00 m</text>

    <!-- Openings (Windows & Doors) -->
    <!-- Front Window -->
    <rect x="250" y="115" width="100" height="10" fill="#bae6fd" stroke="#0284c7"/>
    <!-- Patio Door -->
    <rect x="145" y="220" width="10" height="80" fill="#bae6fd" stroke="#0284c7"/>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
