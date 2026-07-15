import { SankeyChartComponent } from './sankey-chart.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/SankeyChart',
  component: SankeyChartComponent,
  tags: ['autodocs'],

};

export default meta;

export const Default = {
  args: {
    nodes: null,
    links: null,
    height: 400,
    showLabels: true,
    showValues: true,
    colors: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'],
    nodePadding: 16,
    nodeWidth: 20,
  },
};
