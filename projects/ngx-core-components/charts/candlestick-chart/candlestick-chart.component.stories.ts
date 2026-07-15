import { CandlestickChartComponent } from './candlestick-chart.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/CandlestickChart',
  component: CandlestickChartComponent,
  tags: ['autodocs'],

};

export default meta;

export const Default = {
  args: {
    data: [{ id: '1', label: 'Item 1' }, { id: '2', label: 'Item 2' }],
    height: 300,
    showGrid: true,
    showLabels: true,
    bullishColor: '#10b981',
    bearishColor: '#ef4444',
  },
};
