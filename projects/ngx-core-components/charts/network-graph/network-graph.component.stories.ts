import { NetworkGraphComponent } from './network-graph.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/NetworkGraph',
  component: NetworkGraphComponent,
  tags: ['autodocs'],
};

export default meta;

export const Default = {
  args: {
    nodes: [
      { id: 'A', label: 'Router Alpha', value: 80, group: 'Network' },
      { id: 'B', label: 'Server 1', value: 45, group: 'Hardware' },
      { id: 'C', label: 'Server 2', value: 40, group: 'Hardware' },
      { id: 'D', label: 'Database Master', value: 65, group: 'Storage' },
      { id: 'E', label: 'Replica A', value: 30, group: 'Storage' },
      { id: 'F', label: 'Replica B', value: 30, group: 'Storage' },
      { id: 'G', label: 'Load Balancer', value: 50, group: 'Network' },
      { id: 'H', label: 'Client Gateway', value: 35, group: 'Network' },
    ],
    links: [
      { source: 'A', target: 'B', value: 2 },
      { source: 'A', target: 'C', value: 2 },
      { source: 'B', target: 'D', value: 4 },
      { source: 'C', target: 'D', value: 4 },
      { source: 'D', target: 'E', value: 1 },
      { source: 'D', target: 'F', value: 1 },
      { source: 'G', target: 'A', value: 3 },
      { source: 'H', target: 'G', value: 2 },
    ],
    height: 350,
    width: 500,
    showLegend: true,
    showLabels: true,
    showExport: true,
    linkLength: 70,
  },
};

export const SimpleSocial = {
  args: {
    nodes: [
      { id: 'Alice', label: 'Alice', value: 40, group: 'Admin' },
      { id: 'Bob', label: 'Bob', value: 30, group: 'User' },
      { id: 'Charlie', label: 'Charlie', value: 30, group: 'User' },
      { id: 'Dave', label: 'Dave', value: 25, group: 'User' },
      { id: 'Eve', label: 'Eve', value: 35, group: 'Moderator' },
    ],
    links: [
      { source: 'Alice', target: 'Bob', value: 1 },
      { source: 'Alice', target: 'Charlie', value: 1 },
      { source: 'Bob', target: 'Charlie', value: 2 },
      { source: 'Charlie', target: 'Dave', value: 1 },
      { source: 'Eve', target: 'Alice', value: 3 },
      { source: 'Eve', target: 'Dave', value: 2 },
    ],
    height: 300,
    width: 450,
    showLegend: true,
    showLabels: true,
    showExport: true,
    linkLength: 60,
  },
};
