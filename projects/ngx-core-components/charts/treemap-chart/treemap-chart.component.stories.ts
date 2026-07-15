import { TreemapChartComponent } from './treemap-chart.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/TreemapChart',
  component: TreemapChartComponent,
  tags: ['autodocs'],

};

export default meta;

export const Default = {
  args: {
    data: [{ id: '1', label: 'Documents', children: [{ id: '1-1', label: 'Report.docx' }] }],
    colors: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'],
  },
};
