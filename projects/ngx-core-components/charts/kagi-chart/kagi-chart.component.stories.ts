import { KagiChartComponent } from './kagi-chart.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/KagiChart',
  component: KagiChartComponent,
  tags: ['autodocs'],

};

export default meta;

export const Default = {
  args: {
    data: [{ id: '1', label: 'Item 1' }, { id: '2', label: 'Item 2' }],
    reversalAmount: 15,
    height: 350,
    showGrid: true,
    bullishColor: '#10b981',
    bearishColor: '#ef4444',
    showExport: false,
    labelFormatter: 'Sample labelFormatter',
    tooltipTemplate: null,
  },
};
