import { ComboChartComponent } from './combo-chart.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/ComboChart',
  component: ComboChartComponent,
  tags: ['autodocs'],
  argTypes: {
    theme: {
      control: 'select',
      options: ["light","dark"],
    },
  },
};

export default meta;

export const Default = {
  args: {
    barSeries: null,
    lineSeries: null,
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    height: 300,
    showGrid: true,
    showLegend: true,
    theme: 'light',
    colors: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'],
    barYTitle: 'Volume',
    lineYTitle: 'Percentage',
  },
};
