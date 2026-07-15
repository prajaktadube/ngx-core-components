import { BoxPlotChartComponent } from './box-plot-chart.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/BoxPlotChart',
  component: BoxPlotChartComponent,
  tags: ['autodocs'],

};

export default meta;

export const Default = {
  args: {
    data: [{ id: '1', label: 'Item 1' }, { id: '2', label: 'Item 2' }],
    height: 300,
    showGrid: true,
    showLabels: true,
    color: '#4f46e5',
    fillColor: 'rgba(79, 70, 229, 0.12)',
    outlierColor: '#ef4444',
  },
};
