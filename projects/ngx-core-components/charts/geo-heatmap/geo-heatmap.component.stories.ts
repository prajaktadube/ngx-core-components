import { GeoHeatmapComponent } from './geo-heatmap.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/GeoHeatmap',
  component: GeoHeatmapComponent,
  tags: ['autodocs'],
};

export default meta;

export const Default = {
  args: {
    title: 'Global Event Density & Traffic Heatmap',
    data: [
      // North America East Coast Cluster
      { lat: 40.71, lng: -74.00, weight: 80 },
      { lat: 42.36, lng: -71.05, weight: 60 },
      { lat: 38.90, lng: -77.03, weight: 70 },
      { lat: 43.65, lng: -79.38, weight: 45 },
      { lat: 45.50, lng: -73.56, weight: 35 },
      
      // North America Mid-West/West
      { lat: 41.87, lng: -87.62, weight: 50 },
      { lat: 34.05, lng: -118.24, weight: 65 },
      { lat: 37.77, lng: -122.41, weight: 75 },

      // Western Europe Cluster
      { lat: 51.50, lng: -0.12, weight: 95 },
      { lat: 48.85, lng: 2.35, weight: 90 },
      { lat: 52.52, lng: 13.40, weight: 75 },
      { lat: 52.36, lng: 4.90, weight: 65 },
      { lat: 40.41, lng: -3.70, weight: 55 },
      { lat: 41.90, lng: 12.49, weight: 45 },

      // East Asia Cluster
      { lat: 35.67, lng: 139.65, weight: 120 },
      { lat: 39.90, lng: 116.40, weight: 100 },
      { lat: 31.23, lng: 121.47, weight: 85 },
      { lat: 37.56, lng: 126.97, weight: 70 },
      { lat: 22.31, lng: 114.16, weight: 60 },

      // South Asia & Middle East
      { lat: 19.07, lng: 72.87, weight: 75 },
      { lat: 28.61, lng: 77.20, weight: 60 },
      { lat: 24.71, lng: 46.67, weight: 50 },

      // Southern Hemisphere
      { lat: -23.55, lng: -46.63, weight: 65 },
      { lat: -33.86, lng: 151.20, weight: 55 }
    ],
    height: 400,
    gridSize: 8, // 8-degree cells for binned grouping
    colors: ['#10b981', '#fbbf24', '#ef4444'],
    blur: true,
    showLegend: true,
    showExport: true,
    theme: 'light'
  },
};

export const GridWithoutBlur = {
  args: {
    ...Default.args,
    blur: false,
    gridSize: 12
  }
};

export const DarkMode = {
  args: {
    ...Default.args,
    theme: 'dark',
    colors: ['#047857', '#d97706', '#b91c1c']
  }
};
