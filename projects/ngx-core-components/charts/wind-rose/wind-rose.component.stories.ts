import { WindRoseChartComponent } from './wind-rose.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/WindRoseChart',
  component: WindRoseChartComponent,
  tags: ['autodocs'],

};

export default meta;

export const Default = {
  args: {
    data: [{ id: '1', label: 'Item 1' }, { id: '2', label: 'Item 2' }],
    height: 400,
    colors: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'],
    showExport: false,
    labelFormatter: 'Sample labelFormatter',
    tooltipTemplate: null,
  },
};
