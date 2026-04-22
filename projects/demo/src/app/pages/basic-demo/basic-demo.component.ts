import { Component } from '@angular/core';
import {
  GanttChartComponent,
  GanttTask,
  GanttDependency,
  GanttConfig,
  ZoomLevel,
  GanttTaskChangeEvent,
  GanttTaskClickEvent,
} from 'ngx-core-components';
import { getSampleTasks, getSampleDependencies } from '../../data/sample-tasks';

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

@Component({
  selector: 'app-basic-demo',
  standalone: true,
  imports: [GanttChartComponent],
  template: `
    <div class="demo-page">
      <div class="demo-header">
        <h2 class="demo-title">Basic Gantt Chart</h2>
        <p class="demo-desc">A standard Gantt chart with tasks, dependencies, milestones, and zoom controls.</p>
        <ul class="demo-features">
          <li><strong>Multiple tasks per row:</strong> tasks with the same <code>rowId</code> (e.g. Backend API &amp; Database Schema) share a row — colored chips appear in the sidebar. Hover the name cell to see all tasks.</li>
          <li><strong>Rich hover tooltip:</strong> hover any task bar to see its start/end, progress, and custom fields like assignee and priority.</li>
        </ul>
        <div class="demo-toolbar">
          <div class="btn-group">
            <button
              class="k-btn"
              [class.k-btn-active]="currentZoom === ZoomLevel.Day"
              (click)="setZoom(ZoomLevel.Day)"
            >Day</button>
            <button
              class="k-btn"
              [class.k-btn-active]="currentZoom === ZoomLevel.Week"
              (click)="setZoom(ZoomLevel.Week)"
            >Week</button>
            <button
              class="k-btn"
              [class.k-btn-active]="currentZoom === ZoomLevel.Month"
              (click)="setZoom(ZoomLevel.Month)"
            >Month</button>
          </div>
        </div>
      </div>
      <div class="demo-chart">
        <ngx-gantt-chart
          [tasks]="tasks"
          [dependencies]="dependencies"
          [config]="config"
          (taskChange)="onTaskChange($event)"
          (taskClick)="onTaskClick($event)"
        />
      </div>
      @if (selectedTask) {
        <div class="demo-info-panel">
          <strong>Selected:</strong> {{ selectedTask.name }}
           | Progress: {{ selectedTask.progress }}%
           | {{ formatDate(selectedTask.start) }} - {{ formatDate(selectedTask.end) }}
        </div>
      }

      <div style="flex-shrink:0;display:flex;flex-direction:column;gap:8px;">
        <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#868e96;">How to Use</div>
        <pre style="margin:0;background:#1e1e1e;color:#d4d4d4;padding:14px;border-radius:8px;font-size:12px;line-height:1.5;overflow:auto">{{ howToCode }}</pre>
      </div>

      <div class="api-section">
        <div class="section-label">API Reference</div>
        <div class="api-table-wrap">
          <table class="api-table">
            <thead><tr><th>Input / Output</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
            <tbody>
              @for (row of ganttApi; track row.name) {
                <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
              }
            </tbody>
          </table>
        </div>
        <div class="section-label">Config Options Used In This Demo</div>
        <div class="api-table-wrap">
          <table class="api-table">
            <thead><tr><th>Config Field</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
            <tbody>
              @for (row of ganttConfigApi; track row.name) {
                <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; height: 100%; }
    .demo-page { display: flex; flex-direction: column; height: 100%; padding: 16px; gap: 12px; }
    .demo-header { flex-shrink: 0; }
    .demo-title { margin: 0; font-size: 18px; font-weight: 700; color: #212529; }
    .demo-desc { margin: 4px 0 8px; font-size: 13px; color: #6c757d; }
    .demo-features { margin: 0 0 12px; padding-left: 20px; font-size: 13px; color: #6c757d; line-height: 1.6; }
    .demo-features li { margin-bottom: 2px; }
    .demo-toolbar { display: flex; gap: 8px; align-items: center; }
    .btn-group { display: inline-flex; border-radius: 4px; overflow: hidden; border: 1px solid #ced4da; }
    .k-btn {
      padding: 6px 16px; font-size: 13px; background: #fff; border: none;
      border-right: 1px solid #ced4da; cursor: pointer; color: #495057;
      transition: all 0.12s ease; font-family: inherit;
    }
    .k-btn:last-child { border-right: none; }
    .k-btn:hover { background: #f1f3f5; }
    .k-btn-active { background: #ff6358 !important; color: #fff !important; }
    .demo-chart { flex: 1; min-height: 0; }
    .demo-chart ngx-gantt-chart { height: 100%; }
    .demo-info-panel {
      flex-shrink: 0; padding: 8px 16px; background: #e8f0fe;
      border-radius: 4px; font-size: 13px; color: #1a73e8;
    }
    .api-section { display: flex; flex-direction: column; gap: 12px; flex-shrink: 0; }
    .section-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #868e96; }
    .api-table-wrap { overflow-x: auto; border: 1px solid #e9ecef; border-radius: 8px; background: #fff; }
    .api-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .api-table thead tr { background: #f8f9fa; }
    .api-table th { padding: 12px 14px; text-align: left; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; color: #495057; border-bottom: 1px solid #e9ecef; }
    .api-table td { padding: 12px 14px; border-bottom: 1px solid #f1f3f5; color: #495057; vertical-align: top; }
    .api-table tbody tr:last-child td { border-bottom: none; }
    .api-name { color: #1a73e8; font-family: monospace; font-weight: 700; white-space: nowrap; }
    .api-type { color: #8e44ad; font-family: monospace; white-space: nowrap; }
    .api-default { color: #ff6358; font-family: monospace; white-space: nowrap; }
  `]
})
export class BasicDemoComponent {
  howToCode = `import { Component } from '@angular/core';
import { GanttChartComponent } from 'ngx-core-components';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [GanttChartComponent],
  template: '<ngx-gantt-chart [tasks]="tasks" [dependencies]="dependencies" [config]="config" />'
})
export class ExampleComponent {}`;

  ganttApi: ApiRow[] = [
    { name: 'tasks', type: 'GanttTask[]', default: 'required', description: 'Task collection rendered in the chart and sidebar.' },
    { name: 'dependencies', type: 'GanttDependency[]', default: '[]', description: 'Links that connect predecessor and successor tasks.' },
    { name: 'config', type: 'Partial<GanttConfig>', default: '{}', description: 'Optional chart configuration such as zoom level, sizing, and behavior flags.' },
    { name: '(taskChange)', type: 'GanttTaskChangeEvent', default: '—', description: 'Emitted when a task is dragged or resized.' },
    { name: '(taskClick)', type: 'GanttTaskClickEvent', default: '—', description: 'Emitted when the user selects a task bar.' },
    { name: '(taskDblClick)', type: 'GanttTaskClickEvent', default: '—', description: 'Emitted on double-click for custom drill-in behavior.' },
    { name: '(dependencyClick)', type: 'GanttDependencyClickEvent', default: '—', description: 'Emitted when a dependency line is clicked.' },
    { name: '(scroll)', type: 'GanttScrollEvent', default: '—', description: 'Emitted while the chart scroll position changes.' },
    { name: '(zoomChange)', type: 'ZoomLevel', default: '—', description: 'Emitted when zoom changes through built-in interactions.' },
  ];

  ganttConfigApi: ApiRow[] = [
    { name: 'zoomLevel', type: 'ZoomLevel', default: "'day'", description: 'Controls the timeline granularity shown in the header.' },
    { name: 'rowHeight', type: 'number', default: '40', description: 'Height of each rendered task row.' },
    { name: 'columnWidth', type: 'number', default: '40', description: 'Width of a single timeline column at the current zoom.' },
    { name: 'headerHeight', type: 'number', default: '56', description: 'Height of the timeline header area.' },
    { name: 'sidebarWidth', type: 'number', default: '320', description: 'Width of the tree/sidebar pane.' },
    { name: 'showTodayMarker', type: 'boolean', default: 'true', description: 'Displays a vertical marker for today.' },
    { name: 'showGrid', type: 'boolean', default: 'true', description: 'Shows row and column grid lines.' },
    { name: 'snapTo', type: "'day'|'week'|'month'", default: "'day'", description: 'Snaps drag and resize actions to the chosen unit.' },
    { name: 'collapsible', type: 'boolean', default: 'true', description: 'Allows parent rows to collapse and expand.' },
  ];

  tasks: GanttTask[] = getSampleTasks();
  dependencies: GanttDependency[] = getSampleDependencies();
  currentZoom = ZoomLevel.Day;
  selectedTask: GanttTask | null = null;

  config: Partial<GanttConfig> = {
    zoomLevel: ZoomLevel.Day,
    rowHeight: 44,
    columnWidth: 36,
    headerHeight: 56,
    sidebarWidth: 350,
    showTodayMarker: true,
    showGrid: true,
    snapTo: 'day',
    collapsible: true,
  };

  protected readonly ZoomLevel = ZoomLevel;

  setZoom(level: ZoomLevel): void {
    this.currentZoom = level;
    const widthMap: Record<string, number> = {
      [ZoomLevel.Day]: 36,
      [ZoomLevel.Week]: 120,
      [ZoomLevel.Month]: 180,
    };
    this.config = { ...this.config, zoomLevel: level, columnWidth: widthMap[level] };
  }

  onTaskChange(event: GanttTaskChangeEvent): void {
    this.tasks = this.tasks.map(t =>
      t.id === event.task.id ? { ...t, start: event.task.start, end: event.task.end, subtasks: event.task.subtasks } : t
    );
  }

  onTaskClick(event: GanttTaskClickEvent): void {
    this.selectedTask = event.task;
  }

  formatDate(d: Date): string {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
