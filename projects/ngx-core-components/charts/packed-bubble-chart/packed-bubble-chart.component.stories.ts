import { PackedBubbleChartComponent } from './packed-bubble-chart.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/PackedBubbleChart',
  component: PackedBubbleChartComponent,
  tags: ['autodocs'],
};

export default meta;

export const Default = {
  args: {
    data: [
      { id: '1', label: 'Angular', value: 95, group: 'Frontend' },
      { id: '2', label: 'React', value: 90, group: 'Frontend' },
      { id: '3', label: 'Vue', value: 55, group: 'Frontend' },
      { id: '4', label: 'Svelte', value: 30, group: 'Frontend' },
      { id: '5', label: 'Node.js', value: 85, group: 'Backend' },
      { id: '6', label: 'Python', value: 75, group: 'Backend' },
      { id: '7', label: 'Go', value: 65, group: 'Backend' },
      { id: '8', label: 'Rust', value: 50, group: 'Backend' },
      { id: '9', label: 'MongoDB', value: 40, group: 'Database' },
      { id: '10', label: 'Postgres', value: 70, group: 'Database' },
      { id: '11', label: 'Redis', value: 60, group: 'Database' },
    ],
    height: 350,
    width: 500,
    showLegend: true,
    showLabels: true,
    showGroupLabels: true,
    showExport: true,
  },
};

export const Ungrouped = {
  args: {
    ...Default.args,
    showGroupLabels: false,
    data: [
      { id: '1', label: 'Apple', value: 100 },
      { id: '2', label: 'Banana', value: 80 },
      { id: '3', label: 'Orange', value: 60 },
      { id: '4', label: 'Grapes', value: 40 },
      { id: '5', label: 'Peach', value: 20 },
      { id: '6', label: 'Melon', value: 90 },
      { id: '7', label: 'Berry', value: 35 },
    ],
  },
};
