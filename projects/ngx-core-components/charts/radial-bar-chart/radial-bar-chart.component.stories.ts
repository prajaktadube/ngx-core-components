import { RadialBarChartComponent } from './radial-bar-chart.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/RadialBarChart',
  component: RadialBarChartComponent,
  tags: ['autodocs'],

};

export default meta;

export const Default = {
  args: {
    data: [{ name: 'Activity', value: 80, color: '#4f46e5' }, { name: 'Rest', value: 20, color: '#e2e8f0' }],
    height: 300,
    showLegend: true,
    strokeWidth: 10,
    ringGap: 4,
    colors: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'],
  },
};
