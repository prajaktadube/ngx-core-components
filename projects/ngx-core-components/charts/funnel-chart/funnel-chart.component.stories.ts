import { FunnelChartComponent } from './funnel-chart.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/FunnelChart',
  component: FunnelChartComponent,
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: 'select',
      options: ["funnel","pyramid"],
    },
  },
};

export default meta;

export const Default = {
  args: {
    data: [{ id: '1', label: 'Item 1' }, { id: '2', label: 'Item 2' }],
    height: 300,
    colors: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'],
    mode: 'funnel',
  },
};
