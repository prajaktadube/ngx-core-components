import { GaugeChartComponent } from './gauge-chart.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/GaugeChart',
  component: GaugeChartComponent,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ["full","semi"],
    },
  },
};

export default meta;

export const Default = {
  args: {
    value: 0,
    min: 0,
    max: 100,
    label: '',
    type: 'semi',
    showNeedle: true,
    color: 'var(--primary-color, #4f46e5)',
    thresholds: null,
  },
};
