import { ChordDiagramComponent } from './chord-diagram.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/ChordDiagram',
  component: ChordDiagramComponent,
  tags: ['autodocs'],

};

export default meta;

export const Default = {
  args: {
    matrix: null,
    labels: 'Sample labels',
    height: 400,
    showLabels: true,
    nodePadding: 0.04,
    colors: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'],
  },
};
