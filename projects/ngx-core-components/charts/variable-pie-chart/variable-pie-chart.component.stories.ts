import { VariablePieChartComponent } from './variable-pie-chart.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/VariablePieChart',
  component: VariablePieChartComponent,
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: 'select',
      options: ['pie', 'donut'],
    },
  },
};

export default meta;

export const Default = {
  args: {
    data: [
      { label: 'Chrome', value: 45, radiusValue: 90, color: '#4f46e5' },
      { label: 'Safari', value: 25, radiusValue: 70, color: '#10b981' },
      { label: 'Firefox', value: 15, radiusValue: 85, color: '#f59e0b' },
      { label: 'Edge', value: 10, radiusValue: 60, color: '#ef4444' },
      { label: 'Opera', value: 5, radiusValue: 50, color: '#8b5cf6' },
    ],
    mode: 'pie',
    donutHoleSize: 0.35,
    height: 300,
    showLegend: true,
    showLabels: true,
    showExport: true,
  },
};

export const Donut = {
  args: {
    ...Default.args,
    mode: 'donut',
  },
};
