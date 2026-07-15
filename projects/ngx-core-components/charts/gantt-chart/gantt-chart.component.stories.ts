import type { Meta, StoryObj } from '@storybook/angular';
import { GanttChartComponent } from './gantt-chart.component';

// Base Mock Tasks (typed as any[] to prevent acorn typescript import/cast issues)
const mockTasks: any[] = [
  {
    id: '1',
    name: 'Project Roadmap',
    start: new Date(2026, 6, 1),
    end: new Date(2026, 6, 25),
    progress: 45,
    parentId: null,
    collapsed: false,
    isMilestone: false,
    color: '#4f46e5',
  },
  {
    id: '2',
    name: 'UX Design Wireframes',
    start: new Date(2026, 6, 2),
    end: new Date(2026, 6, 8),
    progress: 90,
    parentId: '1',
    collapsed: false,
    isMilestone: false,
    color: '#818cf8',
  },
  {
    id: '3',
    name: 'API Development',
    start: new Date(2026, 6, 9),
    end: new Date(2026, 6, 18),
    progress: 30,
    parentId: '1',
    collapsed: false,
    isMilestone: false,
    color: '#10b981',
  },
  {
    id: '4',
    name: 'Testing & QA Review',
    start: new Date(2026, 6, 19),
    end: new Date(2026, 6, 24),
    progress: 0,
    parentId: '1',
    collapsed: false,
    isMilestone: false,
    color: '#f59e0b',
  },
  {
    id: '5',
    name: 'Production Release',
    start: new Date(2026, 6, 25),
    end: new Date(2026, 6, 25),
    progress: 0,
    parentId: null,
    collapsed: false,
    isMilestone: true,
    color: '#ef4444',
  }
];

const mockDependencies: any[] = [
  { fromId: '2', toId: '3', type: 'FS' },
  { fromId: '3', toId: '4', type: 'FS' },
  { fromId: '4', toId: '5', type: 'FS' }
];

const mockBaselineItems: any[] = [
  { id: '1', start: new Date(2026, 6, 1), end: new Date(2026, 6, 22) },
  { id: '2', start: new Date(2026, 6, 2), end: new Date(2026, 6, 7) },
  { id: '3', start: new Date(2026, 6, 8), end: new Date(2026, 6, 16) },
  { id: '4', start: new Date(2026, 6, 17), end: new Date(2026, 6, 22) }
];

const meta: Meta<GanttChartComponent> = {
  title: 'Visualizations/Gantt Chart System/GanttChart',
  component: GanttChartComponent,
  tags: ['autodocs'],
  argTypes: {
    tasks: { control: 'object', description: 'Array of hierarchical GanttTask items' },
    dependencies: { control: 'object', description: 'Array of dependency links between tasks' },
    config: { control: 'object', description: 'Gantt chart configurations (sidebar, header, zoom levels)' },
    groups: { control: 'object', description: 'Array of grouping parameters for task grouping' },
    baselineItems: { control: 'object', description: 'Baseline comparison bars to check actual vs planned schedule' },
    enableDragToZoom: { control: 'boolean', description: 'Enables area-select drag to zoom' }
  },
};

export default meta;
type Story = StoryObj<GanttChartComponent>;

export const Default: Story = {
  args: {
    tasks: mockTasks,
    dependencies: mockDependencies,
    config: {
      zoomLevel: 'day' as any,
      showGrid: true,
      showTodayMarker: true,
      showToolbar: true,
      linkable: true,
      selectable: true,
      rowHeight: 45,
      barHeight: 24,
      sidebarWidth: 280,
      sidebarColumns: [
        { field: 'name', header: 'Task Name', width: 180 },
        { field: 'progress', header: 'Progress', width: 80 }
      ]
    },
    enableDragToZoom: true
  },
};

export const WithBaselineComparison: Story = {
  args: {
    tasks: mockTasks,
    dependencies: mockDependencies,
    baselineItems: mockBaselineItems,
    config: {
      zoomLevel: 'day' as any,
      showGrid: true,
      showTodayMarker: true,
      showToolbar: true,
      showBaseline: true,
      rowHeight: 50,
      barHeight: 20,
      sidebarWidth: 240,
      sidebarColumns: [
        { field: 'name', header: 'Task Name', width: 180 }
      ]
    }
  }
};

export const MonthViewScale: Story = {
  args: {
    tasks: mockTasks,
    dependencies: mockDependencies,
    config: {
      zoomLevel: 'month' as any,
      showGrid: true,
      showTodayMarker: true,
      showToolbar: true,
      columnWidth: 60,
      rowHeight: 45,
      sidebarWidth: 240,
      sidebarColumns: [
        { field: 'name', header: 'Task Name', width: 180 }
      ]
    }
  }
};
