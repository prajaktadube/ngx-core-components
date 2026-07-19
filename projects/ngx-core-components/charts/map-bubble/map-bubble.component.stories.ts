import { MapBubbleComponent } from './map-bubble.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/MapBubble',
  component: MapBubbleComponent,
  tags: ['autodocs'],
};

export default meta;

export const Default = {
  args: {
    title: 'Global Active Users and Server Load',
    data: [
      { lat: 40.71, lng: -74.00, value: 85000, group: 'North America', label: 'New York Data Center' },
      { lat: 45.42, lng: -75.69, value: 25000, group: 'North America', label: 'Ottawa Logistics' },
      { lat: 19.43, lng: -99.13, value: 40000, group: 'North America', label: 'Mexico City Support' },
      { lat: -23.55, lng: -46.63, value: 62000, group: 'South America', label: 'São Paulo Branch' },
      { lat: -34.60, lng: -58.38, value: 30000, group: 'South America', label: 'Buenos Aires Node' },
      { lat: 51.50, lng: -0.12, value: 98000, group: 'Europe', label: 'London Edge Server' },
      { lat: 48.85, lng: 2.35, value: 72000, group: 'Europe', label: 'Paris Node' },
      { lat: 30.04, lng: 31.23, value: 34000, group: 'Africa', label: 'Cairo Office' },
      { lat: -26.20, lng: 28.04, value: 45000, group: 'Africa', label: 'Johannesburg Server' },
      { lat: 55.75, lng: 37.61, value: 50000, group: 'Europe', label: 'Moscow Hub' },
      { lat: 39.90, lng: 116.40, value: 120000, group: 'Asia', label: 'Beijing Hub' },
      { lat: 19.07, lng: 72.87, value: 88000, group: 'Asia', label: 'Mumbai Data Office' },
      { lat: 24.71, lng: 46.67, value: 55000, group: 'Middle East', label: 'Riyadh Hub' },
      { lat: -33.86, lng: 151.20, value: 68000, group: 'Oceania', label: 'Sydney Regional Site' }
    ],
    height: 400,
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
    minBubbleSize: 6,
    maxBubbleSize: 28,
    showLegend: true,
    showExport: true,
    theme: 'light'
  },
};

export const DarkMode = {
  args: {
    ...Default.args,
    theme: 'dark',
  }
};
