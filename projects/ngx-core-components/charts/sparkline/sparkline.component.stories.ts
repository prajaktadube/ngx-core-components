import { SparklineComponent } from './sparkline.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/Sparkline',
  component: SparklineComponent,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ["line","bar","area"],
    },
  },
};

export default meta;

export const Default = {
  args: {
    data: [{ id: '1', label: 'Item 1' }, { id: '2', label: 'Item 2' }],
    type: 'line',
    color: '#4f46e5',
    width: 120,
    height: 36,
  },
};
