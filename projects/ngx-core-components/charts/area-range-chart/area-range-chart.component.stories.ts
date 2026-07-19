import { AreaRangeChartComponent } from './area-range-chart.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/AreaRangeChart',
  component: AreaRangeChartComponent,
  tags: ['autodocs'],
};

export default meta;

export const Default = {
  args: {
    series: [
      {
        name: 'Temperature Range',
        data: [
          { category: 'Jan', low: -5, high: 5 },
          { category: 'Feb', low: -3, high: 7 },
          { category: 'Mar', low: 1, high: 12 },
          { category: 'Apr', low: 5, high: 18 },
          { category: 'May', low: 10, high: 23 },
          { category: 'Jun', low: 14, high: 28 },
          { category: 'Jul', low: 17, high: 31 },
          { category: 'Aug', low: 16, high: 30 },
          { category: 'Sep', low: 12, high: 25 },
          { category: 'Oct', low: 7, high: 19 },
          { category: 'Nov', low: 2, high: 11 },
          { category: 'Dec', low: -2, high: 6 }
        ]
      }
    ],
    height: 300,
    showGrid: true,
    showMarkers: true,
    showLegend: true,
    showExport: true,
    colors: ['#3b82f6', '#10b981']
  }
};
