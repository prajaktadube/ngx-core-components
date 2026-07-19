import { HistogramComponent } from './histogram.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/Histogram',
  component: HistogramComponent,
  tags: ['autodocs'],
};

export default meta;

export const Default = {
  args: {
    data: [
      12, 15, 18, 22, 23, 24, 25, 28, 30, 31, 32, 33, 34, 35, 38, 40,
      41, 42, 43, 44, 45, 45, 46, 47, 48, 50, 52, 53, 54, 55, 56, 58,
      60, 62, 63, 64, 65, 68, 70, 72, 75, 78, 80, 82, 85, 90, 92, 95
    ],
    binsCount: 10,
    height: 320,
    showGrid: true,
    showLabels: true,
    showExport: true
  },
};

export const FewBins = {
  args: {
    ...Default.args,
    binsCount: 5,
  },
};

export const CustomColors = {
  args: {
    ...Default.args,
    colors: ['#8e44ad', '#8e44ad', '#8e44ad'],
  },
};
