import { ParetoChartComponent } from './pareto-chart.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/ParetoChart',
  component: ParetoChartComponent,
  tags: ['autodocs'],

};

export default meta;

export const Default = {
  args: {
    data: [{ id: '1', label: 'Item 1' }, { id: '2', label: 'Item 2' }],
    height: 350,
    showGrid: true,
    showLabels: true,
    showCumPercentLabels: true,
    barColor: '#4a90d9',
    lineColor: '#ff6358',
  },
};
