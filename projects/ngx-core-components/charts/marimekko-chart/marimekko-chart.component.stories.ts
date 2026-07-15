import { MarimekkoChartComponent } from './marimekko-chart.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/MarimekkoChart',
  component: MarimekkoChartComponent,
  tags: ['autodocs'],

};

export default meta;

export const Default = {
  args: {
    data: [{ id: '1', label: 'Item 1' }, { id: '2', label: 'Item 2' }],
    height: 400,
    showGrid: true,
    showLabels: true,
    showSegmentLabels: true,
    colors: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'],
  },
};
