import { ScatterPlotComponent } from './scatter-plot.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/ScatterPlot',
  component: ScatterPlotComponent,
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
    xTitle: 'X Axis',
    yTitle: 'Y Axis',
    height: 300,
    showGrid: true,
    showLegend: true,
    theme: 'light',
    colors: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'],
  },
};
