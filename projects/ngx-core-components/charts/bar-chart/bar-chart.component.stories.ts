import { BarChartComponent } from './bar-chart.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/BarChart',
  component: BarChartComponent,
  tags: ['autodocs'],

};

export default meta;

export const Default = {
  args: {
    series: [{ name: 'Sales', data: [31, 40, 28, 51, 42, 109, 100] }],
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    height: 260,
    showGrid: true,
    showLabels: false,
    showLegend: true,
    colors: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'],
    showExport: false,
    referenceLines: null,
    labelFormatter: 'Sample labelFormatter',
    tooltipTemplate: null,
  },
};
