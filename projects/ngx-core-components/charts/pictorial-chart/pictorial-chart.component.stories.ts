import { PictorialChartComponent } from './pictorial-chart.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/PictorialChart',
  component: PictorialChartComponent,
  tags: ['autodocs'],
};

export default meta;

export const DefaultUserProgress = {
  args: {
    value: 6.5,
    max: 10,
    icon: 'user',
    iconCount: 10,
    height: 180,
    showExport: true
  },
};

export const StarRatings = {
  args: {
    value: 4.8,
    max: 5,
    icon: 'star',
    iconCount: 5,
    colors: ['#f1c40f'],
    height: 150,
    showExport: true
  },
};

export const HeartHealth = {
  args: {
    value: 7.2,
    max: 10,
    icon: 'heart',
    iconCount: 10,
    colors: ['#e74c3c'],
    height: 160,
    showExport: true
  },
};

export const GridBulbs = {
  args: {
    value: 36.5,
    max: 50,
    icon: 'lightbulb',
    iconCount: 50,
    colors: ['#2ecc71'],
    height: 250,
    showExport: true
  },
};
