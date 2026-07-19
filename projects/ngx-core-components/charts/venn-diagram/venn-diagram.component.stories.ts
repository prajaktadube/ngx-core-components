import { VennDiagramComponent } from './venn-diagram.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/VennDiagram',
  component: VennDiagramComponent,
  tags: ['autodocs'],
};

export default meta;

export const TwoSetsOverlap = {
  args: {
    sets: ['Marketing', 'Sales'],
    sizes: {
      A: 85,
      B: 60,
      'A&B': 25
    },
    height: 350,
    showExport: true
  },
};

export const ThreeSetsOverlap = {
  args: {
    sets: ['Engineering', 'Design', 'Product'],
    sizes: {
      A: 150,
      B: 80,
      C: 60,
      'A&B': 35,
      'B&C': 20,
      'A&C': 15,
      'A&B&C': 10
    },
    height: 380,
    showExport: true
  },
};

export const CustomColors = {
  args: {
    ...TwoSetsOverlap.args,
    colors: ['#e74c3c', '#3498db', '#f1c40f'],
  },
};
