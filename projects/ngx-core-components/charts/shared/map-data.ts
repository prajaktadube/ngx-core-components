// Shared Map Datasets and Projections for ngx-core-components

export interface MapRegion {
  id: string;
  name: string;
  polygons: [number, number][][]; // longitude, latitude
}

/**
 * Standard World Map outline with coordinates (longitude, latitude)
 */
export const WORLD_MAP_DATA: MapRegion[] = [
  {
    id: 'GL',
    name: 'Greenland',
    polygons: [[[-70, 60], [-60, 83], [-20, 83], [-10, 75], [-40, 60], [-70, 60]]]
  },
  {
    id: 'CA',
    name: 'Canada',
    polygons: [[[-168, 65], [-140, 70], [-120, 75], [-80, 75], [-60, 75], [-50, 60], [-60, 50], [-115, 50], [-140, 60], [-168, 65]]]
  },
  {
    id: 'US',
    name: 'United States',
    polygons: [[[-125, 49], [-65, 49], [-80, 25], [-115, 25], [-125, 49]]]
  },
  {
    id: 'MX',
    name: 'Mexico',
    polygons: [[[-115, 25], [-90, 20], [-80, 8], [-77, 8], [-95, 15], [-115, 25]]]
  },
  {
    id: 'SA',
    name: 'South America',
    polygons: [[[-80, 8], [-45, 10], [-35, -5], [-40, -25], [-65, -55], [-75, -50], [-75, -20], [-80, 8]]]
  },
  {
    id: 'EU',
    name: 'Europe',
    polygons: [[[-10, 60], [30, 70], [45, 60], [30, 35], [-5, 35], [-10, 45], [-10, 60]]]
  },
  {
    id: 'AF',
    name: 'Africa',
    polygons: [[[-17, 35], [30, 32], [50, 12], [40, -20], [20, -35], [10, 5], [-17, 15], [-17, 35]]]
  },
  {
    id: 'RU',
    name: 'Russia',
    polygons: [[[30, 60], [60, 75], [120, 75], [180, 70], [170, 45], [130, 45], [80, 50], [30, 60]]]
  },
  {
    id: 'CN',
    name: 'China',
    polygons: [[[75, 45], [130, 45], [125, 20], [105, 20], [75, 30], [75, 45]]]
  },
  {
    id: 'IN',
    name: 'India',
    polygons: [[[68, 25], [78, 30], [90, 25], [80, 8], [68, 25]]]
  },
  {
    id: 'ME',
    name: 'Middle East',
    polygons: [[[30, 32], [60, 32], [60, 25], [50, 12], [35, 12], [30, 32]]]
  },
  {
    id: 'AU',
    name: 'Australia',
    polygons: [[[113, -11], [153, -11], [150, -39], [115, -35], [113, -11]]]
  }
];

/**
 * Projects a longitude and latitude coordinate into a 2D viewport using Equirectangular projection
 */
export function project(
  lng: number,
  lat: number,
  width: number,
  height: number,
  padding = { top: 10, right: 10, bottom: 10, left: 10 }
): { x: number; y: number } {
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Scale longitude to X
  const x = padding.left + ((lng + 180) / 360) * innerWidth;
  
  // Scale latitude to Y (note latitude 90 is top, -90 is bottom)
  const y = padding.top + ((90 - lat) / 180) * innerHeight;

  return { x, y };
}

/**
 * Helper to generate an SVG path from a set of polygons
 */
export function getSvgPath(
  polygons: [number, number][][],
  width: number,
  height: number,
  padding = { top: 10, right: 10, bottom: 10, left: 10 }
): string {
  let path = '';
  for (const poly of polygons) {
    if (poly.length === 0) continue;
    const start = project(poly[0][0], poly[0][1], width, height, padding);
    path += `M ${start.x.toFixed(1)} ${start.y.toFixed(1)}`;
    for (let i = 1; i < poly.length; i++) {
      const pt = project(poly[i][0], poly[i][1], width, height, padding);
      path += ` L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
    }
    path += ' Z ';
  }
  return path;
}
