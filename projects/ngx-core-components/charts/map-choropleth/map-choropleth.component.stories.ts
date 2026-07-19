import { MapChoroplethComponent } from './map-choropleth.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/MapChoropleth',
  component: MapChoroplethComponent,
  tags: ['autodocs'],
};

export default meta;

export const Default = {
  args: {
    title: 'Global Sales Distribution (Millions)',
    data: [
      { regionId: 'US', value: 85, label: 'North America Hub' },
      { regionId: 'CA', value: 45, label: 'Canada Office' },
      { regionId: 'MX', value: 20, label: 'Mexico Plant' },
      { regionId: 'SA', value: 55, label: 'LATAM Division' },
      { regionId: 'EU', value: 95, label: 'EMEA Headquarters' },
      { regionId: 'AF', value: 30, label: 'Africa Region' },
      { regionId: 'RU', value: 40, label: 'Russia & CIS' },
      { regionId: 'CN', value: 110, label: 'APAC Hub' },
      { regionId: 'IN', value: 80, label: 'India Office' },
      { regionId: 'ME', value: 50, label: 'Middle East Tech' },
      { regionId: 'AU', value: 65, label: 'Oceania Branch' },
      { regionId: 'GL', value: 5, label: 'Northern Logistics' }
    ],
    height: 400,
    colors: ['#e0f2fe', '#0284c7'],
    noDataColor: '#f1f5f9',
    showLegend: true,
    showExport: true,
    theme: 'light'
  },
};

export const DarkMode = {
  args: {
    ...Default.args,
    theme: 'dark',
    colors: ['#1e293b', '#38bdf8']
  }
};
