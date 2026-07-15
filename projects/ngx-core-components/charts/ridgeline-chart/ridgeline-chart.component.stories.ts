import { RidgelineChartComponent } from './ridgeline-chart.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/RidgelineChart',
  component: RidgelineChartComponent,
  tags: ['autodocs'],

};

export default meta;

export const Default = {
  args: {
    data: [{ id: '1', label: 'Item 1' }, { id: '2', label: 'Item 2' }],
    height: 400,
    showGrid: true,
    showLabels: true,
    useGradient: false,
    colors: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'],
    overlap: 1.6,
  },
};
