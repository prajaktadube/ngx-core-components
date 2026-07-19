import { BellCurveChartComponent } from './bell-curve-chart.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/BellCurveChart',
  component: BellCurveChartComponent,
  tags: ['autodocs'],
};

export default meta;

export const DefaultFromData = {
  args: {
    data: [
      68, 70, 71, 72, 73, 74, 75, 75, 76, 76, 77, 77, 78, 78, 78, 79,
      79, 79, 80, 80, 80, 80, 81, 81, 81, 82, 82, 82, 83, 83, 83, 84,
      84, 84, 85, 85, 85, 86, 86, 87, 87, 88, 88, 89, 90, 91, 92, 94
    ],
    height: 320,
    showGrid: true,
    fillArea: true,
    showExport: true
  },
};

export const ExplicitParams = {
  args: {
    mean: 100,
    standardDeviation: 15,
    height: 320,
    showGrid: true,
    fillArea: true,
    showExport: true
  },
};

export const CustomColors = {
  args: {
    mean: 0,
    standardDeviation: 1,
    colors: ['#e74c3c'],
    height: 320,
    showGrid: true,
    fillArea: true,
    showExport: true
  },
};
