import { SunburstChartComponent } from './sunburst-chart.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/SunburstChart',
  component: SunburstChartComponent,
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
    data: [{ id: '1', label: 'Item 1' }, { id: '2', label: 'Item 2' }],
    height: 300,
    showLegend: true,
    showLabels: true,
    theme: 'light',
    colors: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'],
    showExport: false,
  },
};
