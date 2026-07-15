import { RenkoChartComponent } from './renko-chart.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/RenkoChart',
  component: RenkoChartComponent,
  tags: ['autodocs'],

};

export default meta;

export const Default = {
  args: {
    data: [{ id: '1', label: 'Item 1' }, { id: '2', label: 'Item 2' }],
    boxSize: 5,
    height: 350,
    showGrid: true,
    bullishColor: '#10b981',
    bearishColor: '#ef4444',
    showExport: false,
    labelFormatter: 'Sample labelFormatter',
    tooltipTemplate: null,
  },
};
