import { FlowmapComponent } from './flowmap.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/Flowmap',
  component: FlowmapComponent,
  tags: ['autodocs'],
};

export default meta;

export const Default = {
  args: {
    title: 'Global Supply Chain & Material Flows',
    nodes: [
      { id: 'US', lat: 40.71, lng: -74.00, label: 'New York (Logistics HQ)', color: '#3b82f6', size: 10 },
      { id: 'EU', lat: 51.50, lng: -0.12, label: 'London (European Hub)', color: '#10b981', size: 10 },
      { id: 'CN', lat: 39.90, lng: 116.40, label: 'Beijing (Primary Production)', color: '#ef4444', size: 12 },
      { id: 'SA', lat: -23.55, lng: -46.63, label: 'São Paulo (South American HQ)', color: '#f59e0b', size: 8 },
      { id: 'AU', lat: -33.86, lng: 151.20, label: 'Sydney (Pacific Distribution)', color: '#8b5cf6', size: 8 }
    ],
    flows: [
      { from: 'CN', to: 'US', value: 950, label: 'Electronics Shipments', color: '#ef4444' },
      { from: 'CN', to: 'EU', value: 800, label: 'Consumer Goods Shipments', color: '#10b981' },
      { from: 'EU', to: 'US', value: 500, label: 'Pharmaceutical Shipments', color: '#3b82f6' },
      { from: 'US', to: 'SA', value: 350, label: 'Automotive Components', color: '#f59e0b' },
      { from: 'CN', to: 'AU', value: 420, label: 'Industrial Machinery', color: '#8b5cf6' },
      { from: 'EU', to: 'AU', value: 200, label: 'Luxury Goods', color: '#ec4899' }
    ],
    height: 400,
    theme: 'light',
    showExport: true,
    colors: ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444']
  },
};

export const DarkMode = {
  args: {
    ...Default.args,
    theme: 'dark'
  }
};
