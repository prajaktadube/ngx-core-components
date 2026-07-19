import { VariwideChartComponent } from './variwide-chart.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/VariwideChart',
  component: VariwideChartComponent,
  tags: ['autodocs'],
};

export default meta;

export const CarbonIntensityVsVolume = {
  args: {
    data: [
      { label: 'Coal', y: 820, w: 150, color: '#ef4444' },
      { label: 'Natural Gas', y: 490, w: 250, color: '#f59e0b' },
      { label: 'Biomass', y: 230, w: 80, color: '#10b981' },
      { label: 'Solar PV', y: 48, w: 180, color: '#0ea5e9' },
      { label: 'Wind', y: 12, w: 220, color: '#3b82f6' },
      { label: 'Nuclear', y: 12, w: 110, color: '#8b5cf6' }
    ],
    height: 320,
    showGrid: true,
    showLegend: true,
    showExport: true,
    colors: ['#ef4444', '#f59e0b', '#10b981', '#0ea5e9', '#3b82f6', '#8b5cf6']
  }
};

export const MarketShareVsMargin = {
  args: {
    data: [
      { label: 'Company A', y: 35, w: 400 },
      { label: 'Company B', y: 28, w: 300 },
      { label: 'Company C', y: 22, w: 180 },
      { label: 'Company D', y: 15, w: 120 },
      { label: 'Company E', y: 10, w: 80 }
    ],
    height: 320,
    showGrid: true,
    showLegend: false,
    showExport: true,
    colors: ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe']
  }
};
