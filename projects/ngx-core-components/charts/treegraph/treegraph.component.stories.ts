import { TreeGraphComponent } from './treegraph.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/TreeGraph',
  component: TreeGraphComponent,
  tags: ['autodocs'],
};

export default meta;

export const Default = {
  args: {
    data: [
      { id: '1', label: 'CEO (Root)', value: 100 },
      { id: '2', label: 'VP engineering', parentId: '1', value: 80 },
      { id: '3', label: 'VP marketing', parentId: '1', value: 70 },
      { id: '4', label: 'Engineering Manager', parentId: '2', value: 60 },
      { id: '5', label: 'Tech Lead A', parentId: '4', value: 40 },
      { id: '6', label: 'Tech Lead B', parentId: '4', value: 40 },
      { id: '7', label: 'HR Lead', parentId: '3', value: 30 },
      { id: '8', label: 'Sales Director', parentId: '3', value: 50 },
    ],
    height: 300,
    width: 550,
    showLabels: true,
    showExport: true,
  },
};

export const DeepHierarchy = {
  args: {
    data: [
      { id: 'root', label: 'App' },
      { id: 'core', label: 'CoreModule', parentId: 'root' },
      { id: 'shared', label: 'SharedModule', parentId: 'root' },
      { id: 'auth', label: 'AuthService', parentId: 'core' },
      { id: 'http', label: 'HttpInterceptor', parentId: 'core' },
      { id: 'button', label: 'ButtonComponent', parentId: 'shared' },
      { id: 'card', label: 'CardComponent', parentId: 'shared' },
      { id: 'icon', label: 'IconComponent', parentId: 'shared' },
    ],
    height: 350,
    width: 600,
    showLabels: true,
    showExport: true,
  },
};
