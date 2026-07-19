import { MapLinePointComponent } from './map-line-point.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/MapLinePoint',
  component: MapLinePointComponent,
  tags: ['autodocs'],
};

export default meta;

export const Default = {
  args: {
    title: 'Global Data Center Uplinks & Routes',
    points: [
      { lat: 51.50, lng: -0.12, label: 'London Central Data Center', color: '#10b981', size: 8 },
      { lat: 40.71, lng: -74.00, label: 'New York Hub', color: '#3b82f6', size: 9 },
      { lat: 35.67, lng: 139.65, label: 'Tokyo HQ', color: '#8b5cf6', size: 10 },
      { lat: -33.86, lng: 151.20, label: 'Sydney Branch Office', color: '#ef4444', size: 7 },
      { lat: 19.07, lng: 72.87, label: 'Mumbai Support Terminal', color: '#f59e0b', size: 7 }
    ],
    lines: [
      { fromIndex: 0, toIndex: 1, label: 'Transatlantic Primary (Fiber)', color: '#4f46e5', strokeWidth: 3, dashed: false },
      { fromIndex: 1, toIndex: 2, label: 'Transpacific Secondary', color: '#3b82f6', strokeWidth: 2, dashed: true },
      { fromIndex: 2, toIndex: 3, label: 'APAC Gateway Route', color: '#10b981', strokeWidth: 2, dashed: false },
      { fromIndex: 0, toIndex: 4, label: 'Eurasia Backup Line', color: '#f59e0b', strokeWidth: 1.5, dashed: true },
      { fromIndex: 4, toIndex: 2, label: 'Indian Ocean Uplink', color: '#ef4444', strokeWidth: 2.5, dashed: false }
    ],
    height: 400,
    theme: 'light',
    showExport: true
  },
};

export const DarkMode = {
  args: {
    ...Default.args,
    theme: 'dark'
  }
};
