import { ColumnRangeChartComponent } from './column-range-chart.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/ColumnRangeChart',
  component: ColumnRangeChartComponent,
  tags: ['autodocs'],
};

export default meta;

export const Default = {
  args: {
    series: [
      {
        name: 'Salary Range (k USD)',
        data: [
          { category: 'Engineering', low: 75, high: 160 },
          { category: 'Design', low: 65, high: 130 },
          { category: 'Marketing', low: 55, high: 110 },
          { category: 'Sales', low: 50, high: 145 },
          { category: 'Product', low: 80, high: 155 },
          { category: 'HR', low: 50, high: 95 }
        ]
      }
    ],
    height: 300,
    showGrid: true,
    showLegend: true,
    showExport: true,
    colors: ['#0ea5e9']
  }
};

export const MultiSeries = {
  args: {
    series: [
      {
        name: 'Q1 Budget (k USD)',
        data: [
          { category: 'Engineering', low: 80, high: 120 },
          { category: 'Design', low: 60, high: 90 },
          { category: 'Marketing', low: 40, high: 80 },
          { category: 'Sales', low: 70, high: 130 }
        ]
      },
      {
        name: 'Q2 Budget (k USD)',
        data: [
          { category: 'Engineering', low: 90, high: 140 },
          { category: 'Design', low: 70, high: 110 },
          { category: 'Marketing', low: 50, high: 95 },
          { category: 'Sales', low: 80, high: 150 }
        ]
      }
    ],
    height: 300,
    showGrid: true,
    showLegend: true,
    showExport: true,
    colors: ['#3b82f6', '#10b981']
  }
};
