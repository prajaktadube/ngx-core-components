import { AreaSplineRangeChartComponent } from './area-spline-range-chart.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/AreaSplineRangeChart',
  component: AreaSplineRangeChartComponent,
  tags: ['autodocs'],
};

export default meta;

export const Default = {
  args: {
    series: [
      {
        name: 'Projected Server Load (CPU %)',
        data: [
          { category: '00:00', low: 20, high: 45 },
          { category: '02:00', low: 15, high: 38 },
          { category: '04:00', low: 10, high: 30 },
          { category: '06:00', low: 12, high: 35 },
          { category: '08:00', low: 25, high: 55 },
          { category: '10:00', low: 45, high: 80 },
          { category: '12:00', low: 50, high: 85 },
          { category: '14:00', low: 48, high: 88 },
          { category: '16:00', low: 40, high: 78 },
          { category: '18:00', low: 35, high: 70 },
          { category: '20:00', low: 30, high: 60 },
          { category: '22:00', low: 22, high: 50 }
        ]
      }
    ],
    height: 300,
    showGrid: true,
    showMarkers: true,
    showLegend: true,
    showExport: true,
    colors: ['#8b5cf6', '#3b82f6']
  }
};
