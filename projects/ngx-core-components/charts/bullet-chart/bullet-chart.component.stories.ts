import { BulletChartComponent } from './bullet-chart.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/BulletChart',
  component: BulletChartComponent,
  tags: ['autodocs'],

};

export default meta;

export const Default = {
  args: {
    value: 0,
    target: 0,
    max: 100,
    ranges: null,
    rangeColors: null,
    valueColor: '#4f46e5',
    targetColor: '#ef4444',
    height: 50,
    showLabels: true,
  },
};
