import { AdjacencyMatrixComponent } from './adjacency-matrix.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/AdjacencyMatrix',
  component: AdjacencyMatrixComponent,
  tags: ['autodocs'],

};

export default meta;

export const Default = {
  args: {
    matrix: null,
    labels: 'Sample labels',
    height: 400,
    showLabels: true,
    color: '#4f46e5',
    gridColor: 'var(--ngx-chart-bg, #ffffff)',
  },
};
