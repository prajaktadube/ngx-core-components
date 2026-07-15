import { SlopeChartComponent } from './slope-chart.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/SlopeChart',
  component: SlopeChartComponent,
  tags: ['autodocs'],

};

export default meta;

export const Default = {
  args: {
    data: [{ id: '1', label: 'Item 1' }, { id: '2', label: 'Item 2' }],
    startLabel: 'Before',
    endLabel: 'After',
    height: 350,
    showLabels: true,
    showValues: true,
    colors: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'],
  },
};
