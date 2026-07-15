import { RadarChartComponent } from './radar-chart.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/RadarChart',
  component: RadarChartComponent,
  tags: ['autodocs'],

};

export default meta;

export const Default = {
  args: {
    seriesData: null,
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    max: 100,
    colors: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'],
  },
};
