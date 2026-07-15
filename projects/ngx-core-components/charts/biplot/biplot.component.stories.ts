import { BiplotComponent } from './biplot.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/Biplot',
  component: BiplotComponent,
  tags: ['autodocs'],

};

export default meta;

export const Default = {
  args: {
    points: null,
    vectors: null,
    height: 400,
    showLabels: true,
    vectorScale: 1.0,
    colors: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'],
  },
};
