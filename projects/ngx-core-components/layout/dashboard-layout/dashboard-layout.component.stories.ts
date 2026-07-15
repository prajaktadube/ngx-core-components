import { DashboardLayoutComponent } from './dashboard-layout.component';

const meta = {
  title: 'Layout & Overlays/Dashboard Layout/DashboardLayout',
  component: DashboardLayoutComponent,
  tags: ['autodocs'],
};

export default meta;

const defaultItems = [
  { id: '1', title: 'Sales Performance', col: 0, row: 0, colSpan: 4, rowSpan: 2, category: 'chart', description: 'Visualized revenue trends' },
  { id: '2', title: 'API Gateway Metrics', col: 4, row: 0, colSpan: 8, rowSpan: 2, category: 'metric', description: 'Response latency & load logs' },
  { id: '3', title: 'Active Deployments', col: 0, row: 2, colSpan: 6, rowSpan: 2, category: 'feed', description: 'Continuous integration status updates' },
  { id: '4', title: 'System Database Health', col: 6, row: 2, colSpan: 6, rowSpan: 2, category: 'alert', description: 'Cluster replica set status checks' }
];

export const Default = {
  render: (args: any) => ({
    props: args,
    template: `
      <div style="height: 600px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <ngx-dashboard-layout 
          [items]="items" 
          [columns]="columns" 
          [rowHeight]="rowHeight" 
          [theme]="theme"
          [allowDragging]="allowDragging"
          [allowResizing]="allowResizing"
        >
          <!-- Custom Projected Panel for Panel ID 1 -->
          <div panel-id="1" style="padding: 16px; background: rgba(59, 130, 246, 0.05); height: 100%; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; align-items: center;">
            <div style="font-size: 32px; font-weight: 800; color: #3b82f6;">$48,250</div>
            <div style="font-size: 12px; color: #10b981; margin-top: 4px; font-weight: 600;">📈 +14.2% from last week</div>
          </div>
          
          <!-- Custom Projected Panel for Panel ID 3 -->
          <div panel-id="3" style="padding: 16px; height: 100%; box-sizing: border-box; font-family: monospace; font-size: 11px; color: #475569;">
            <div style="color: #10b981; font-weight: bold;">✔ prod-app deployed successfully (10m ago)</div>
            <div style="color: #f59e0b; margin-top: 6px;">⚠ staging-api warning: memory usage > 85%</div>
            <div style="color: #3b82f6; margin-top: 6px;">ℹ dev-runner cleanup complete</div>
          </div>
        </ngx-dashboard-layout>
      </div>
    `
  }),
  args: {
    items: defaultItems,
    columns: 12,
    rowHeight: '130px',
    theme: 'light',
    allowDragging: true,
    allowResizing: true,
  },
};

export const DarkModeTheme = {
  ...Default,
  args: {
    ...Default.args,
    theme: 'dark',
  },
};
