import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DashboardLayoutComponent,
  DashboardItem,
  DashboardLayoutChangeEvent,
  DashboardPanelActionEvent,
  LineChartComponent,
  PieChartComponent,
  SparklineComponent,
  ProgressBarComponent,
  ChartSeries,
  CHART_COLORS
} from 'ngx-core-components';

@Component({
  selector: 'app-dashboard-layout-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DashboardLayoutComponent,
    LineChartComponent,
    PieChartComponent,
    SparklineComponent,
    ProgressBarComponent
  ],
  template: `
    <div class="demo-page" [class.dark-theme]="theme() === 'dark'">
      
      <!-- Header Section -->
      <div class="page-header">
        <div class="page-header-text">
          <h1>Dashboard Grid Layout</h1>
          <p>
            An enterprise-grade layout manager featuring dynamic 12-column snapping CSS grids, draggable headers, 
            interactive resizing, and customizable dashboard widgets.
          </p>
        </div>
        <div class="header-actions-panel">
          <button class="action-btn theme-toggle-btn" (click)="toggleTheme()" [title]="'Toggle Light/Dark Theme'">
            {{ theme() === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode' }}
          </button>
          <span class="badge badge-purple">Grid Snapping</span>
          <span class="badge badge-blue">Interactive</span>
        </div>
      </div>

      <!-- Control Toolbar Playground -->
      <div class="playground-toolbar">
        <div class="toolbar-section">
          <h3>Board Configurations</h3>
          <div class="controls-row">
            <button class="btn btn-primary" (click)="addNewPanel()">➕ Add Widget Card</button>
            <button class="btn btn-secondary" (click)="resetLayout()">🔄 Reset Grid Layout</button>
            
            <label class="toggle-checkbox">
              <input type="checkbox" [(ngModel)]="allowDragging" />
              <span>Allow Draggable Dragging</span>
            </label>
            
            <label class="toggle-checkbox">
              <input type="checkbox" [(ngModel)]="allowResizing" />
              <span>Allow Corner Resizing</span>
            </label>

            <label class="select-label">
              <span>Grid Columns:</span>
              <select [(ngModel)]="gridColumns" class="toolbar-select">
                <option [ngValue]="12">12 Columns</option>
                <option [ngValue]="8">8 Columns</option>
                <option [ngValue]="6">6 Columns</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      <!-- Main Dashboard Playground Layout -->
      <div class="dashboard-playground-row">
        <!-- Interactive Layout Grid -->
        <div class="dashboard-container">
          <ngx-dashboard-layout
            [items]="dashboardItems()"
            [columns]="gridColumns"
            [rowHeight]="'140px'"
            [theme]="theme()"
            [allowDragging]="allowDragging"
            [allowResizing]="allowResizing"
            (layoutChange)="onLayoutChange($event)"
            (panelAction)="onPanelAction($event)"
          >
            <!-- Projected template content slots mapped to panel-id -->
            
            <!-- Revenue Line Chart -->
            <div panel-id="revenue-velocity" class="widget-content chart-container">
              <div class="chart-wrapper">
                <ngx-line-chart 
                  [series]="revenueSeries" 
                  [categories]="chartMonths" 
                  [showArea]="true" 
                  [showMarkers]="true"
                  [height]="200" 
                />
              </div>
            </div>

            <!-- Customer Funnel Pie/Donut Chart -->
            <div panel-id="acquisition-funnel" class="widget-content pie-container">
              <div class="pie-wrapper">
                <ngx-pie-chart 
                  [data]="pieChannels" 
                  [mode]="'donut'" 
                  [centerTitle]="'Leads'" 
                  [showLegend]="true" 
                  [showLabels]="false" 
                  [height]="190" 
                />
              </div>
            </div>

            <!-- Active task workflow log list -->
            <div panel-id="task-tracker" class="widget-content task-list-container">
              <div class="tasks-list">
                @for (task of tasks(); track task.id) {
                  <div class="task-row">
                    <label class="task-checkbox-wrap">
                      <input type="checkbox" [checked]="task.done" (change)="toggleTask(task.id)" />
                      <span class="task-text" [class.done]="task.done">{{ task.text }}</span>
                    </label>
                    <span class="task-prio" [class]="task.priority">{{ task.priority | uppercase }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- Health Status Progress Metrics -->
            <div panel-id="health-gauge" class="widget-content metric-container">
              <div class="metric-card-inner">
                <div class="metric-score">
                  <h2>94.2%</h2>
                  <span class="status-indicator online"></span>
                </div>
                <div class="metric-gauge-bar">
                  <ngx-progress-bar [value]="94.2" [variant]="'success'" />
                </div>
                <p class="metric-subtitle">API cluster load is nominal. Latency is 12ms.</p>
              </div>
            </div>

            <!-- Visitor count sparkline -->
            <div panel-id="visitors-count" class="widget-content metric-container">
              <div class="metric-card-inner">
                <div class="metric-score">
                  <h2>14,820</h2>
                  <span class="trend-indicator upward">▲ +12%</span>
                </div>
                <div class="sparkline-wrapper">
                  <ngx-sparkline [data]="visitorSparkline" [height]="30" [color]="'#10b981'" />
                </div>
                <p class="metric-subtitle">Real-time daily active users (DAU).</p>
              </div>
            </div>

            <!-- System Warnings Alerts -->
            <div panel-id="alert-console" class="widget-content alert-console-body">
              <div class="console-alerts">
                <div class="console-alert-row warn">
                  <span class="alert-icon">⚠️</span>
                  <div class="alert-message">
                    <strong>Cluster-3 Warning:</strong> Memory usage is high (84% threshold exceeded).
                  </div>
                  <span class="alert-time">2m ago</span>
                </div>
                <div class="console-alert-row error">
                  <span class="alert-icon">🚨</span>
                  <div class="alert-message">
                    <strong>Database Failure:</strong> Latency spike detected on read replica shard-2.
                  </div>
                  <span class="alert-time">5m ago</span>
                </div>
              </div>
            </div>

          </ngx-dashboard-layout>
        </div>

        <!-- Sidebar Activity Event Logger -->
        <div class="activity-logger-panel">
          <div class="logger-header">
            <h3>Grid Orchestration Activity Logs</h3>
            <button class="clear-btn" (click)="clearLogs()">Clear</button>
          </div>
          <div class="logs-container">
            @if (logs().length === 0) {
              <div class="empty-logs">No activity events yet. Drag, resize, or control panels to trigger.</div>
            } @else {
              @for (log of logs(); track $index) {
                <div class="log-entry">
                  <span class="log-time">[{{ log.time | date:'HH:mm:ss' }}]</span>
                  <span class="log-msg" [class]="log.type">{{ log.msg }}</span>
                </div>
              }
            }
          </div>
        </div>
      </div>

      <!-- Documentation & Guidelines section -->
      <div class="docs-section">
        <h2>Developer Guidelines & API Reference</h2>
        
        <div class="section-label">ngx-dashboard-layout Usage Example</div>
        <pre class="code-block">{{ codeSnippet }}</pre>

        <div class="section-label">API Table Reference — Inputs</div>
        <div class="api-table-wrap">
          <table class="api-table">
            <thead>
              <tr><th>Input</th><th>Type</th><th>Default</th><th>Description</th></tr>
            </thead>
            <tbody>
              @for (row of apiInputs; track row.name) {
                <tr>
                  <td class="api-name">{{ row.name }}</td>
                  <td class="api-type">{{ row.type }}</td>
                  <td class="api-default">{{ row.default }}</td>
                  <td>{{ row.description }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="section-label">API Table Reference — Outputs</div>
        <div class="api-table-wrap">
          <table class="api-table">
            <thead>
              <tr><th>Output</th><th>Type</th><th>Description</th></tr>
            </thead>
            <tbody>
              @for (row of apiOutputs; track row.name) {
                <tr>
                  <td class="api-name">{{ row.name }}</td>
                  <td class="api-type">{{ row.type }}</td>
                  <td>{{ row.description }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .demo-page {
      padding: 24px 28px;
      max-width: 1300px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      box-sizing: border-box;
      font-family: var(--ngx-font-family, sans-serif);
      background: #f8fafc;
      color: #0f172a;
      transition: background 0.3s ease, color 0.3s ease;
      min-height: 100%;
    }

    .demo-page.dark-theme {
      background: #0f172a;
      color: #f8fafc;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 16px;
      gap: 16px;
      flex-wrap: wrap;
    }
    .dark-theme .page-header {
      border-bottom-color: #334155;
    }

    .page-header-text h1 {
      margin: 0 0 6px;
      font-size: 24px;
      font-weight: 800;
    }

    .page-header-text p {
      margin: 0;
      font-size: 13px;
      color: #64748b;
      line-height: 1.6;
      max-width: 750px;
    }
    .dark-theme .page-header-text p {
      color: #94a3b8;
    }

    .header-actions-panel {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .theme-toggle-btn {
      padding: 6px 12px;
      font-size: 12px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      cursor: pointer;
      color: #0f172a;
      font-weight: 600;
      transition: all 0.2s;
    }
    .dark-theme .theme-toggle-btn {
      background: #1e293b;
      border-color: #334155;
      color: #ffffff;
    }
    .theme-toggle-btn:hover {
      background: #f1f5f9;
    }
    .dark-theme .theme-toggle-btn:hover {
      background: #334155;
    }

    .badge {
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 12px;
    }
    .badge-purple { background: #f3e8ff; color: #7c3aed; }
    .badge-blue { background: #e8f0fe; color: #1a73e8; }

    /* Configurations toolbar */
    .playground-toolbar {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }
    .dark-theme .playground-toolbar {
      background: #1e293b;
      border-color: #334155;
    }

    .playground-toolbar h3 {
      margin: 0 0 12px;
      font-size: 13px;
      font-weight: 750;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
    }
    .dark-theme .playground-toolbar h3 {
      color: #94a3b8;
    }

    .controls-row {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .btn {
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.15s;
    }

    .btn-primary {
      background: var(--primary-gradient, linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%));
      color: #ffffff;
    }
    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(79, 70, 229, 0.2);
    }

    .btn-secondary {
      background: #f1f5f9;
      color: #0f172a;
      border: 1px solid #cbd5e1;
    }
    .btn-secondary:hover {
      background: #e2e8f0;
    }
    .dark-theme .btn-secondary {
      background: #334155;
      color: #ffffff;
      border-color: #475569;
    }
    .dark-theme .btn-secondary:hover {
      background: #475569;
    }

    .toggle-checkbox {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      font-weight: 550;
      cursor: pointer;
    }

    .select-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 550;
    }

    .toolbar-select {
      padding: 6px 10px;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      border-radius: 6px;
      font-size: 12px;
      color: #0f172a;
      outline: none;
    }
    .dark-theme .toolbar-select {
      background: #0f172a;
      border-color: #334155;
      color: #ffffff;
    }

    /* Core layout grid row */
    .dashboard-playground-row {
      display: grid;
      grid-template-columns: 1fr 300px;
      gap: 20px;
      align-items: start;
    }

    @media (max-width: 1024px) {
      .dashboard-playground-row {
        grid-template-columns: 1fr;
      }
    }

    .dashboard-container {
      border: 1px solid #cbd5e1;
      border-radius: 14px;
      background: #ffffff;
      overflow: hidden;
      min-height: 600px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
    }
    .dark-theme .dashboard-container {
      border-color: #334155;
      background: #1e293b;
    }

    /* Widget projections content */
    .widget-content {
      width: 100%;
      height: 100%;
      padding: 12px 16px;
      box-sizing: border-box;
      overflow: auto;
    }

    .chart-container, .pie-container {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .chart-wrapper, .pie-wrapper {
      width: 100%;
      height: 100%;
    }

    /* Task lists */
    .tasks-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .task-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      transition: background 0.15s;
    }
    .dark-theme .task-row {
      background: #0f172a;
      border-color: #334155;
    }
    .task-checkbox-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      cursor: pointer;
    }
    .task-text.done {
      text-decoration: line-through;
      opacity: 0.5;
    }
    .task-prio {
      font-size: 9px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .task-prio.high { background: #fee2e2; color: #991b1b; }
    .task-prio.medium { background: #fef3c7; color: #92400e; }
    .task-prio.low { background: #dcfce7; color: #166534; }

    /* Metric visual card style */
    .metric-card-inner {
      display: flex;
      flex-direction: column;
      height: 100%;
      justify-content: space-between;
      gap: 8px;
    }
    .metric-score {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
    }
    .metric-score h2 {
      margin: 0;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .status-indicator.online {
      background: #10b981;
      box-shadow: 0 0 8px #10b981;
    }
    .trend-indicator {
      font-size: 11px;
      font-weight: 600;
    }
    .trend-indicator.upward {
      color: #10b981;
    }
    .metric-gauge-bar {
      margin-top: 4px;
    }
    .metric-subtitle {
      margin: 0;
      font-size: 11px;
      color: #64748b;
      line-height: 1.4;
    }
    .dark-theme .metric-subtitle {
      color: #94a3b8;
    }
    .sparkline-wrapper {
      margin-top: 6px;
    }

    /* System alert console */
    .alert-console-body {
      display: flex;
      flex-direction: column;
    }
    .console-alerts {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .console-alert-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 11px;
    }
    .console-alert-row.warn {
      background: #fef3c7;
      border: 1px solid #fde68a;
      color: #92400e;
    }
    .console-alert-row.error {
      background: #fee2e2;
      border: 1px solid #fecaca;
      color: #991b1b;
    }
    .dark-theme .console-alert-row.warn {
      background: rgba(245, 158, 11, 0.05);
      border-color: rgba(245, 158, 11, 0.15);
      color: #f59e0b;
    }
    .dark-theme .console-alert-row.error {
      background: rgba(239, 68, 68, 0.05);
      border-color: rgba(239, 68, 68, 0.15);
      color: #ef4444;
    }
    .alert-icon {
      font-size: 13px;
    }
    .alert-message {
      flex: 1;
      line-height: 1.4;
    }
    .alert-time {
      opacity: 0.7;
    }

    /* Activity logs sidebar panel */
    .activity-logger-panel {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 14px;
      padding: 16px 20px;
      height: 600px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
    }
    .dark-theme .activity-logger-panel {
      background: #1e293b;
      border-color: #334155;
    }

    .logger-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 10px;
      margin-bottom: 12px;
    }
    .dark-theme .logger-header {
      border-bottom-color: #334155;
    }

    .logger-header h3 {
      margin: 0;
      font-size: 13px;
      font-weight: 750;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
    }
    .dark-theme .logger-header h3 {
      color: #94a3b8;
    }

    .clear-btn {
      background: none;
      border: 1px solid #cbd5e1;
      padding: 3px 8px;
      font-size: 11px;
      font-weight: 600;
      border-radius: 4px;
      cursor: pointer;
      color: #64748b;
      transition: all 0.2s;
    }
    .clear-btn:hover {
      background: #f1f5f9;
      color: #0f172a;
    }
    .dark-theme .clear-btn {
      border-color: #334155;
      color: #94a3b8;
    }
    .dark-theme .clear-btn:hover {
      background: #334155;
      color: #ffffff;
    }

    .logs-container {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 8px;
      font-family: monospace;
      font-size: 11px;
    }
    .empty-logs {
      color: #94a3b8;
      font-style: italic;
      text-align: center;
      margin-top: 40px;
    }

    .log-entry {
      line-height: 1.4;
      display: flex;
      gap: 6px;
    }
    .log-time {
      color: #94a3b8;
      flex-shrink: 0;
    }
    .log-msg {
      word-break: break-all;
    }
    .log-msg.action { color: #8b5cf6; }
    .log-msg.change { color: #3b82f6; }
    .log-msg.system { color: #10b981; }

    /* Developer docs section */
    .docs-section {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 14px;
      padding: 24px;
      margin-top: 10px;
    }
    .dark-theme .docs-section {
      background: #1e293b;
      border-color: #334155;
    }

    .docs-section h2 {
      margin: 0 0 16px;
      font-size: 18px;
      font-weight: 800;
    }

    .section-label {
      font-size: 11px;
      font-weight: 750;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      margin: 20px 0 8px;
    }
    .dark-theme .section-label {
      color: #94a3b8;
    }

    .code-block {
      background: #1e293b;
      color: #f8fafc;
      padding: 16px;
      border-radius: 8px;
      font-size: 11px;
      font-family: monospace;
      overflow-x: auto;
      margin: 0;
    }
    .dark-theme .code-block {
      background: #0f172a;
    }

    /* API Tables */
    .api-table-wrap {
      overflow-x: auto;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      margin-bottom: 12px;
    }
    .dark-theme .api-table-wrap {
      border-color: #334155;
    }

    .api-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 12px;
    }

    .api-table th, .api-table td {
      padding: 10px 14px;
      border-bottom: 1px solid #e2e8f0;
    }
    .dark-theme .api-table th, .dark-theme .api-table td {
      border-bottom-color: #334155;
    }

    .api-table th {
      background: #f8fafc;
      font-weight: 700;
      color: #475569;
    }
    .dark-theme .api-table th {
      background: #0f172a;
      color: #94a3b8;
    }

    .api-name {
      font-family: monospace;
      font-weight: 700;
      color: #4f46e5;
    }
    .dark-theme .api-name {
      color: #818cf8;
    }

    .api-type {
      font-family: monospace;
      color: #0f766e;
    }
    .dark-theme .api-type {
      color: #2dd4bf;
    }

    .api-default {
      font-family: monospace;
      color: #b45309;
    }
    .dark-theme .api-default {
      color: #fbbf24;
    }
  `]
})
export class DashboardLayoutDemoComponent {
  theme = signal<'light' | 'dark'>('light');
  gridColumns = 12;
  allowDragging = true;
  allowResizing = true;

  // Event Logs model
  logs = signal<{ time: Date; msg: string; type: 'action' | 'change' | 'system' }[]>([]);

  // Projected metrics & items
  tasks = signal([
    { id: '1', text: 'Analyze Q2 user feedback logs', done: true, priority: 'high' },
    { id: '2', text: 'Optimize CSS bundle build output', done: false, priority: 'medium' },
    { id: '3', text: 'Write Dashboard unit testing files', done: false, priority: 'low' }
  ]);

  visitorSparkline = [12000, 12500, 11900, 13100, 14200, 13800, 14820];

  // Pie chart data structure
  pieChannels = [
    { label: 'Direct Sales', value: 450, color: CHART_COLORS[0] },
    { label: 'Social Media Referral', value: 290, color: CHART_COLORS[1] },
    { label: 'Search Query Index', value: 180, color: CHART_COLORS[2] },
    { label: 'Affiliate Links', value: 120, color: CHART_COLORS[3] }
  ];

  // Revenue Series line chart structure
  chartMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  revenueSeries: ChartSeries[] = [
    {
      name: 'Recurring Revenue',
      data: [35000, 42000, 48000, 56000, 61000, 68000],
      color: '#4f46e5'
    },
    {
      name: 'Consulting Streams',
      data: [12000, 14000, 11000, 18000, 15000, 19000],
      color: '#10b981'
    }
  ];

  // Dashboard grid panels definition
  dashboardItems = signal<DashboardItem[]>([
    {
      id: 'revenue-velocity',
      title: 'Monthly Revenue Velocity',
      category: 'chart',
      row: 0,
      col: 0,
      rowSpan: 2,
      colSpan: 8,
      description: 'Historical subscription recurring vs consulting performance revenue graphs.'
    },
    {
      id: 'acquisition-funnel',
      title: 'Customer Acquisition Funnel',
      category: 'chart',
      row: 0,
      col: 8,
      rowSpan: 2,
      colSpan: 4,
      description: 'Breakdown metrics across inbound direct marketing sales channels.'
    },
    {
      id: 'task-tracker',
      title: 'Action Item Task List',
      category: 'data',
      row: 2,
      col: 0,
      rowSpan: 2,
      colSpan: 5,
      description: 'Pending code optimization checklists and priorities overview.'
    },
    {
      id: 'health-gauge',
      title: 'API Infrastructure Load',
      category: 'metric',
      row: 2,
      col: 5,
      rowSpan: 1,
      colSpan: 4,
      description: 'Aggregated real-time metrics highlighting server cluster performance.'
    },
    {
      id: 'visitors-count',
      title: 'DAU Traffic Count',
      category: 'metric',
      row: 2,
      col: 9,
      rowSpan: 1,
      colSpan: 3,
      description: 'Daily Active Users traffic logs chart.'
    },
    {
      id: 'alert-console',
      title: 'Cluster Warnings & Exceptions',
      category: 'alert',
      row: 3,
      col: 5,
      rowSpan: 1,
      colSpan: 7,
      description: 'Critical system warnings stream overlay.'
    }
  ]);

  toggleTheme(): void {
    this.theme.update(t => t === 'light' ? 'dark' : 'light');
    this.addLog('Theme updated to ' + this.theme().toUpperCase(), 'system');
  }

  toggleTask(taskId: string): void {
    this.tasks.update(ts => ts.map(t => t.id === taskId ? { ...t, done: !t.done } : t));
    const task = this.tasks().find(t => t.id === taskId);
    if (task) {
      this.addLog(`Task "${task.text}" toggled to ${task.done ? 'DONE' : 'PENDING'}`, 'system');
    }
  }

  // Event handlers
  onLayoutChange(event: DashboardLayoutChangeEvent): void {
    this.addLog('Grid layout resized or items positions updated', 'change');
  }

  onPanelAction(event: DashboardPanelActionEvent): void {
    const actionName = event.action.toUpperCase();
    this.addLog(`Panel "${event.item.title}" action triggered: ${actionName}`, 'action');
  }

  addNewPanel(): void {
    const current = this.dashboardItems();
    // Locate a nice vacant slot
    const newId = 'dynamic-card-' + Date.now();
    const newPanel: DashboardItem = {
      id: newId,
      title: 'Dynamic Telemetry Panel',
      category: 'metric',
      row: 4,
      col: 0,
      rowSpan: 1,
      colSpan: 4,
      description: 'Dynamic telemetry cards added to the layout manager.'
    };

    this.dashboardItems.set([...current, newPanel]);
    this.addLog('Added new widget to the grid', 'system');
  }

  resetLayout(): void {
    this.dashboardItems.set([
      {
        id: 'revenue-velocity',
        title: 'Monthly Revenue Velocity',
        category: 'chart',
        row: 0,
        col: 0,
        rowSpan: 2,
        colSpan: 8,
        description: 'Historical subscription recurring vs consulting performance revenue graphs.'
      },
      {
        id: 'acquisition-funnel',
        title: 'Customer Acquisition Funnel',
        category: 'chart',
        row: 0,
        col: 8,
        rowSpan: 2,
        colSpan: 4,
        description: 'Breakdown metrics across inbound direct marketing sales channels.'
      },
      {
        id: 'task-tracker',
        title: 'Action Item Task List',
        category: 'data',
        row: 2,
        col: 0,
        rowSpan: 2,
        colSpan: 5,
        description: 'Pending code optimization checklists and priorities overview.'
      },
      {
        id: 'health-gauge',
        title: 'API Infrastructure Load',
        category: 'metric',
        row: 2,
        col: 5,
        rowSpan: 1,
        colSpan: 4,
        description: 'Aggregated real-time metrics highlighting server cluster performance.'
      },
      {
        id: 'visitors-count',
        title: 'DAU Traffic Count',
        category: 'metric',
        row: 2,
        col: 9,
        rowSpan: 1,
        colSpan: 3,
        description: 'Daily Active Users traffic logs chart.'
      },
      {
        id: 'alert-console',
        title: 'Cluster Warnings & Exceptions',
        category: 'alert',
        row: 3,
        col: 5,
        rowSpan: 1,
        colSpan: 7,
        description: 'Critical system warnings stream overlay.'
      }
    ]);
    this.addLog('Reset layout config back to defaults', 'system');
  }

  addLog(msg: string, type: 'action' | 'change' | 'system'): void {
    const list = this.logs();
    this.logs.set([{ time: new Date(), msg, type }, ...list.slice(0, 49)]);
  }

  clearLogs(): void {
    this.logs.set([]);
  }

  // Static API variables
  apiInputs = [
    { name: 'items', type: 'DashboardItem[]', default: '[]', description: 'Array of items/panels configured in the layout.' },
    { name: 'columns', type: 'number', default: '12', description: 'Grid columns count (e.g., 12, 8, 6).' },
    { name: 'rowHeight', type: 'string', default: "'150px'", description: 'Custom CSS height for grid row slots.' },
    { name: 'theme', type: "'light' | 'dark'", default: "'light'", description: 'Active color scheme alignment.' },
    { name: 'allowDragging', type: 'boolean', default: 'true', description: 'Configures global card dragging state.' },
    { name: 'allowResizing', type: 'boolean', default: 'true', description: 'Configures global card resize snaps.' }
  ];

  apiOutputs = [
    { name: 'layoutChange', type: 'DashboardLayoutChangeEvent', description: 'Emitted when grid coordinates or spans change.' },
    { name: 'panelAction', type: 'DashboardPanelActionEvent', description: 'Emitted on settings clicks, minimizes, closures, or maximizes.' }
  ];

  codeSnippet = `
// Template Usage
<ngx-dashboard-layout
  [items]="myItems"
  [columns]="12"
  [rowHeight]="'150px'"
  [theme]="'light'"
  (layoutChange)="onLayoutChange($event)"
  (panelAction)="onPanelAction($event)"
>
  <!-- Content projection items aligned via panel-id -->
  <div panel-id="revenue-chart">
    <ngx-line-chart [series]="revenueSeries" />
  </div>
  
  <div panel-id="metrics-card">
    <h3>KPI Performance</h3>
  </div>
</ngx-dashboard-layout>
  `;
}
