import { FlagsComponent } from './flags.component';

const meta = {
  title: 'Visualizations/Charts & Graphs/Flags',
  component: FlagsComponent,
  tags: ['autodocs'],
};

export default meta;

const categories = [
  '2026-07-01', '2026-07-02', '2026-07-03', '2026-07-06', '2026-07-07',
  '2026-07-08', '2026-07-09', '2026-07-10', '2026-07-13', '2026-07-14',
  '2026-07-15', '2026-07-16', '2026-07-17'
];

const mockFlags = [
  { x: '2026-07-02', title: 'FDA', text: 'FDA approval for treatment candidate.', color: '#10b981', shape: 'flag' },
  { x: '2026-07-06', title: 'DIV', text: 'Ex-dividend date $0.45 per share.', color: '#3b82f6', shape: 'pin' },
  { x: '2026-07-10', title: 'ER', text: 'Q2 Earnings Release. EPS beat by 12%.', color: '#8b5cf6', shape: 'square' },
  { x: '2026-07-15', title: 'CEO', text: 'CEO announces strategic expansion plans.', color: '#ef4444', shape: 'circle' }
];

const mockDataset = {
  name: 'Stock Index',
  color: '#6366f1',
  data: [150.0, 153.5, 156.8, 152.0, 151.2, 155.0, 159.0, 158.2, 161.5, 164.0, 159.5, 162.0, 165.5]
};

export const Default = {
  args: {
    categories,
    data: mockFlags,
    height: 300,
    showGrid: true,
    showLabels: true,
    showExport: true,
  },
};

export const WithDataset = {
  args: {
    categories,
    data: mockFlags,
    dataset: mockDataset,
    height: 300,
    showGrid: true,
    showLabels: true,
    showExport: true,
  },
};
