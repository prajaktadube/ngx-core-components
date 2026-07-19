import { ColumnPyramidChartComponent } from './column-pyramid-chart.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/ColumnPyramidChart',
  component: ColumnPyramidChartComponent,
  tags: ['autodocs'],
};

export default meta;

export const InvertedPyramid = {
  args: {
    series: [
      {
        name: 'Funnel Lead Drop-off',
        data: [100, 75, 48, 24, 12, 5]
      }
    ],
    categories: ['Impressions', 'Visits', 'Downloads', 'Sign-ups', 'Trial Users', 'Purchases'],
    height: 320,
    showGrid: true,
    showLegend: true,
    showExport: true,
    inverted: true,
    colors: ['#ef4444']
  }
};

export const UprightPyramid = {
  args: {
    series: [
      {
        name: 'Sales Targets Accomplished',
        data: [25, 45, 68, 85, 95]
      }
    ],
    categories: ['Q1', 'Q2', 'Q3', 'Q4', 'Bonus Target'],
    height: 320,
    showGrid: true,
    showLegend: true,
    showExport: true,
    inverted: false,
    colors: ['#10b981']
  }
};

export const MultiSeriesPyramid = {
  args: {
    series: [
      {
        name: 'Product A Sales (k units)',
        data: [40, 60, 80, 50]
      },
      {
        name: 'Product B Sales (k units)',
        data: [30, 50, 90, 75]
      }
    ],
    categories: ['North', 'East', 'South', 'West'],
    height: 320,
    showGrid: true,
    showLegend: true,
    showExport: true,
    inverted: true,
    colors: ['#3b82f6', '#f59e0b']
  }
};
