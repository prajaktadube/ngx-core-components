import { AreaChartComponent } from './area-chart.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/AreaChart',
  component: AreaChartComponent,
  tags: ['autodocs'],

};

export default meta;

export const Default = {
  args: {
    series: [{ name: 'Sales', data: [31, 40, 28, 51, 42, 109, 100] }],
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    height: 260,
    showGrid: true,
    showMarkers: true,
    showLegend: true,
    colors: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'],
  },
};
