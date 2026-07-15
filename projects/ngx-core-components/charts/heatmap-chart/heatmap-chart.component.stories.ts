import type { Meta, StoryObj } from '@storybook/angular';
import { HeatmapChartComponent } from './heatmap-chart.component';

// Mock datasets
const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const hourLabels = ['12am', '4am', '8am', '12pm', '4pm', '8pm'];

const hourlyServerLoad = [
  [12, 10, 15, 20, 32, 45], // Mon
  [8,  11, 14, 25, 40, 52], // Tue
  [10, 9,  18, 30, 48, 55], // Wed
  [15, 14, 22, 28, 42, 60], // Thu
  [11, 12, 19, 35, 50, 68], // Fri
  [22, 18, 12, 15, 25, 30], // Sat
  [30, 25, 10, 8,  15, 18], // Sun
];

const gitContributionLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];
const gitContributions = [
  [0, 2, 4, 1, 8], // Mon
  [1, 0, 5, 2, 0], // Tue
  [8, 3, 2, 1, 4], // Wed
  [0, 1, 0, 8, 3], // Thu
  [2, 4, 6, 2, 5], // Fri
  [0, 0, 1, 0, 1], // Sat
  [0, 0, 0, 2, 0], // Sun
];

const meta: Meta<HeatmapChartComponent> = {
  title: 'Visualizations/Charts & Graphs/HeatmapChart',
  component: HeatmapChartComponent,
  tags: ['autodocs'],
  argTypes: {
    data: { control: 'object', description: '2D array of grid cell intensity values' },
    xAxisLabels: { control: 'object', description: 'Labels displayed along the X-axis' },
    yAxisLabels: { control: 'object', description: 'Labels displayed along the Y-axis' },
    colorRange: { control: 'object', description: 'Interpolation start and end hex colors [minColor, maxColor]' },
  },
};

export default meta;
type Story = StoryObj<HeatmapChartComponent>;

export const ServerLoad: Story = {
  args: {
    data: hourlyServerLoad,
    xAxisLabels: hourLabels,
    yAxisLabels: weekdayLabels,
    colorRange: ['#e2e8f0', '#3b82f6'], // light grey to bright info blue
  },
};

export const GitContributions: Story = {
  args: {
    data: gitContributions,
    xAxisLabels: gitContributionLabels,
    yAxisLabels: weekdayLabels,
    colorRange: ['#ebedf0', '#216e39'], // GitHub green contribution colors
  },
};

export const HotSalesIntensity: Story = {
  args: {
    data: [
      [120, 240, 450],
      [80,  190, 310],
      [310, 500, 720],
      [450, 680, 990],
    ],
    xAxisLabels: ['North', 'East', 'West'],
    yAxisLabels: ['Q1', 'Q2', 'Q3', 'Q4'],
    colorRange: ['#fee2e2', '#dc2626'], // red warning scale representing high sales
  },
};
