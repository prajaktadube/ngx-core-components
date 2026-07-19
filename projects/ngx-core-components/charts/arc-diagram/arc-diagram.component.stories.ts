import { ArcDiagramComponent } from './arc-diagram.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/ArcDiagram',
  component: ArcDiagramComponent,
  tags: ['autodocs'],
};

export default meta;

export const Default = {
  args: {
    nodes: [
      { id: '1', label: 'Node A', value: 30 },
      { id: '2', label: 'Node B', value: 20 },
      { id: '3', label: 'Node C', value: 45 },
      { id: '4', label: 'Node D', value: 15 },
      { id: '5', label: 'Node E', value: 25 },
      { id: '6', label: 'Node F', value: 50 },
    ],
    links: [
      { source: '1', target: '3', value: 3 },
      { source: '1', target: '2', value: 1 },
      { source: '2', target: '4', value: 2 },
      { source: '3', target: '5', value: 4 },
      { source: '3', target: '6', value: 5 },
      { source: '5', target: '6', value: 2 },
    ],
    height: 300,
    width: 550,
    showLabels: true,
    showExport: true,
  },
};

export const LinearProcess = {
  args: {
    nodes: [
      { id: 'start', label: 'Initialization', value: 30, color: '#10b981' },
      { id: 'auth', label: 'Authentication', value: 30 },
      { id: 'fetch', label: 'Data Fetching', value: 45 },
      { id: 'process', label: 'Processing', value: 55 },
      { id: 'render', label: 'Rendering', value: 40 },
      { id: 'end', label: 'Success Feedback', value: 30, color: '#8b5cf6' },
    ],
    links: [
      { source: 'start', target: 'auth', value: 2 },
      { source: 'auth', target: 'fetch', value: 3 },
      { source: 'fetch', target: 'process', value: 5 },
      { source: 'process', target: 'render', value: 4 },
      { source: 'render', target: 'end', value: 2 },
      // Feedback loops
      { source: 'process', target: 'fetch', value: 1 },
      { source: 'render', target: 'auth', value: 1 },
    ],
    height: 320,
    width: 600,
    showLabels: true,
    showExport: true,
  },
};
