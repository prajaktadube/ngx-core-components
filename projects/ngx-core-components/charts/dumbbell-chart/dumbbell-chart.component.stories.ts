import { DumbbellChartComponent } from './dumbbell-chart.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/DumbbellChart',
  component: DumbbellChartComponent,
  tags: ['autodocs'],

};

export default meta;

export const Default = {
  args: {
    data: [{ id: '1', label: 'Item 1' }, { id: '2', label: 'Item 2' }],
    height: 350,
    showGrid: true,
    showLabels: true,
    startColor: '#ef4444',
    endColor: '#10b981',
    startLabel: 'Start',
    endLabel: 'End',
    colors: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'],
    showLegend: true,
  },
};
