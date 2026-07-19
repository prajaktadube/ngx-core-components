import { WordCloudComponent } from './word-cloud.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/WordCloud',
  component: WordCloudComponent,
  tags: ['autodocs'],
};

export default meta;

export const DefaultCloud = {
  args: {
    data: [
      { text: 'Angular', value: 105 },
      { text: 'TypeScript', value: 95 },
      { text: 'Signals', value: 88 },
      { text: 'RxJS', value: 78 },
      { text: 'Component', value: 72 },
      { text: 'Service', value: 65 },
      { text: 'State', value: 58 },
      { text: 'Directives', value: 45 },
      { text: 'Pipes', value: 38 },
      { text: 'Hydration', value: 52 },
      { text: 'SSR', value: 55 },
      { text: 'Router', value: 48 },
      { text: 'Forms', value: 46 },
      { text: 'HTTP Client', value: 42 },
      { text: 'Jasmine', value: 32 },
      { text: 'Karma', value: 28 },
      { text: 'Cypress', value: 36 },
      { text: 'Webpack', value: 25 },
      { text: 'ESBuild', value: 35 },
      { text: 'CLI', value: 40 },
      { text: 'Schematics', value: 22 },
      { text: 'Performance', value: 60 }
    ],
    height: 350,
    showExport: true
  },
};

export const CustomColors = {
  args: {
    ...DefaultCloud.args,
    colors: ['#8e44ad', '#2c3e50', '#27ae60', '#e67e22', '#2980b9'],
  },
};
