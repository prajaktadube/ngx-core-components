import { OrgChartComponent } from './org-chart.component';

const meta = {
  title: 'Components/OrgChart',
  component: OrgChartComponent,
  tags: ['autodocs'],
  argTypes: {
    root: {
      control: 'select',
      options: ["OrgChartNode","null"],
    },
  },
};

export default meta;

export const Default = {
  args: {
    root: null,
    compact: false,
  },
};
