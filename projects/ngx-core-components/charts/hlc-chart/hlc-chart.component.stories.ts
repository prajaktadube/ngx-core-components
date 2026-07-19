import { HLCChartComponent } from './hlc-chart.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/HLCChart',
  component: HLCChartComponent,
  tags: ['autodocs'],
};

export default meta;

const mockData = [
  { date: '2026-07-01', high: 155.5, low: 148.2, close: 153.2 },
  { date: '2026-07-02', high: 158.0, low: 152.0, close: 156.8 },
  { date: '2026-07-03', high: 157.2, low: 151.5, close: 152.3 },
  { date: '2026-07-06', high: 154.5, low: 149.8, close: 150.5 },
  { date: '2026-07-07', high: 156.0, low: 150.5, close: 155.1 },
  { date: '2026-07-08', high: 160.2, low: 154.3, close: 158.9 },
  { date: '2026-07-09', high: 161.5, low: 157.0, close: 157.8 },
  { date: '2026-07-10', high: 162.0, low: 156.5, close: 161.2 },
  { date: '2026-07-13', high: 165.0, low: 160.8, close: 164.5 },
  { date: '2026-07-14', high: 164.8, low: 158.5, close: 159.2 },
  { date: '2026-07-15', high: 163.0, low: 159.0, close: 162.1 },
  { date: '2026-07-16', high: 166.5, low: 161.5, close: 165.8 },
  { date: '2026-07-17', high: 168.0, low: 164.2, close: 167.3 },
];

export const Default = {
  args: {
    data: mockData,
    height: 300,
    showGrid: true,
    showLabels: true,
    showExport: true,
    bullishColor: '#10b981',
    bearishColor: '#ef4444',
  },
};
