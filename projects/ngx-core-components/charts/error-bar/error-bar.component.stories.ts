import { ErrorBarComponent } from './error-bar.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/ErrorBar',
  component: ErrorBarComponent,
  tags: ['autodocs'],
};

export default meta;

export const DefaultLine = {
  args: {
    data: [
      { label: 'Control', value: 45, errorPlus: 5, errorMinus: 4 },
      { label: 'Group A', value: 58, errorPlus: 8, errorMinus: 6 },
      { label: 'Group B', value: 72, errorPlus: 6, errorMinus: 7 },
      { label: 'Group C', value: 65, errorPlus: 4, errorMinus: 4 },
      { label: 'Placebo', value: 48, errorPlus: 5, errorMinus: 5 }
    ],
    chartType: 'line',
    height: 320,
    showGrid: true,
    showExport: true
  },
};

export const BarChartFormat = {
  args: {
    ...DefaultLine.args,
    chartType: 'bar',
  },
};

export const CustomColors = {
  args: {
    ...DefaultLine.args,
    colors: ['#27ae60'],
  },
};
