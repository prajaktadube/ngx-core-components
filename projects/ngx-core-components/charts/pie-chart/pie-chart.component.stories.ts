import { PieChartComponent } from './pie-chart.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/PieChart',
  component: PieChartComponent,
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: 'select',
      options: ["pie","donut"],
    },
    centerValueOverride: {
      control: 'select',
      options: ["string","null"],
    },
  },
};

export default meta;

export const Default = {
  args: {
    data: [{ id: '1', label: 'Item 1' }, { id: '2', label: 'Item 2' }],
    mode: 'pie',
    donutHoleSize: 0.55,
    height: 240,
    showLegend: true,
    showLabels: true,
    colors: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'],
    centerTitle: 'Total',
    centerValueOverride: null,
    showExport: false,
  },
};
