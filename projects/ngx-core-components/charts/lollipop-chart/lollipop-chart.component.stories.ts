import { LollipopChartComponent } from './lollipop-chart.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/LollipopChart',
  component: LollipopChartComponent,
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ["horizontal","vertical"],
    },
  },
};

export default meta;

export const Default = {
  args: {
    data: [{ id: '1', label: 'Item 1' }, { id: '2', label: 'Item 2' }],
    height: 350,
    showGrid: true,
    showLabels: true,
    orientation: 'horizontal',
    colors: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'],
    dotRadius: 8,
  },
};
