import { PointFigureChartComponent } from './point-figure-chart.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/PointFigureChart',
  component: PointFigureChartComponent,
  tags: ['autodocs'],

};

export default meta;

export const Default = {
  args: {
    data: [{ id: '1', label: 'Item 1' }, { id: '2', label: 'Item 2' }],
    boxSize: 4,
    reversal: 3,
    height: 350,
    showGrid: true,
    xColor: '#10b981',
    oColor: '#ef4444',
    showExport: false,
    labelFormatter: 'Sample labelFormatter',
    tooltipTemplate: null,
  },
};
