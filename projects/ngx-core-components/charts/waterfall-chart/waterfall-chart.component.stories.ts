import { WaterfallChartComponent } from './waterfall-chart.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/WaterfallChart',
  component: WaterfallChartComponent,
  tags: ['autodocs'],

};

export default meta;

export const Default = {
  args: {
    data: [{ id: '1', label: 'Item 1' }, { id: '2', label: 'Item 2' }],
    height: 300,
    showGrid: true,
    showLabels: true,
    positiveColor: '#10b981',
    negativeColor: '#ef4444',
    totalColor: '#64748b',
  },
};
