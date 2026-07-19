import { StreamgraphComponent } from './streamgraph.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/Streamgraph',
  component: StreamgraphComponent,
  tags: ['autodocs'],
};

export default meta;

export const Default = {
  args: {
    series: [
      { name: 'Organic Search', data: [45, 60, 75, 50, 40, 65, 80, 95, 70, 55, 60, 80] },
      { name: 'Social Media', data: [20, 35, 40, 60, 80, 55, 45, 30, 50, 65, 75, 90] },
      { name: 'Direct Traffic', data: [30, 25, 35, 40, 30, 45, 50, 55, 40, 35, 45, 50] },
      { name: 'Email Campaigns', data: [10, 15, 30, 25, 15, 20, 35, 40, 25, 20, 30, 35] }
    ],
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    height: 350,
    showGrid: true,
    showLegend: true,
    showExport: true,
    colors: ['#4f46e5', '#ec4899', '#10b981', '#f59e0b']
  }
};
