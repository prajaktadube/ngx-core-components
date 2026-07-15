import { ViolinPlotComponent } from './violin-plot.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/ViolinPlot',
  component: ViolinPlotComponent,
  tags: ['autodocs'],

};

export default meta;

export const Default = {
  args: {
    data: [{ id: '1', label: 'Item 1' }, { id: '2', label: 'Item 2' }],
    height: 350,
    showGrid: true,
    showLabels: true,
    showPoints: false,
    colors: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'],
  },
};
