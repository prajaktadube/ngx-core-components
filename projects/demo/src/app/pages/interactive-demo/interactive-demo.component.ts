import { Component, ViewChild } from '@angular/core';
import {
  GanttChartComponent,
  GanttTask,
  GanttDependency,
  GanttConfig,
  ZoomLevel,
  GanttTaskChangeEvent,
  GanttTaskClickEvent,
  GanttDependencyClickEvent,
} from 'ngx-core-components';
import { getSampleTasks, getSampleDependencies } from '../../data/sample-tasks';

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

@Component({
  selector: 'app-interactive-demo',
  standalone: true,
  imports: [GanttChartComponent],
  template: `
    <div class="demo-page">
      <div class="demo-header">
        <h2 class="demo-title">Interactive Demo</h2>
        <p class="demo-desc">Drag to move tasks, resize from edges, click to select. All events are logged below.</p>
        <div class="demo-toolbar">
          <div class="btn-group">
            <button class="k-btn" [class.k-btn-active]="currentZoom === ZoomLevel.Day" (click)="setZoom(ZoomLevel.Day)">Day</button>
            <button class="k-btn" [class.k-btn-active]="currentZoom === ZoomLevel.Week" (click)="setZoom(ZoomLevel.Week)">Week</button>
            <button class="k-btn" [class.k-btn-active]="currentZoom === ZoomLevel.Month" (click)="setZoom(ZoomLevel.Month)">Month</button>
          </div>
          <button class="k-btn-flat" (click)="gantt.expandAll()">Expand All</button>
          <button class="k-btn-flat" (click)="gantt.collapseAll()">Collapse All</button>
          <button class="k-btn-flat" (click)="gantt.scrollToDate(today)">Go to Today</button>
          <button class="k-btn-flat" (click)="clearLog()">Clear Log</button>
        </div>
      </div>

      <div class="demo-chart">
        <ngx-gantt-chart
          #gantt
          [tasks]="tasks"
          [dependencies]="dependencies"
          [config]="config"
          (taskChange)="onTaskChange($event)"
          (taskClick)="onTaskClick($event)"
          (taskDblClick)="onTaskDblClick($event)"
          (dependencyClick)="onDependencyClick($event)"
        />
      </div>

      <div class="event-log">
        <div class="log-header">
          <span class="log-title">Event Log</span>
          <span class="log-count">{{ eventLog.length }} events</span>
        </div>
        <div class="log-entries">
          @if (eventLog.length === 0) {
            <p class="log-empty">Interact with the Gantt chart to see events here...</p>
          }
          @for (entry of eventLog; track $index) {
            <div class="log-entry">{{ entry }}</div>
          }
        </div>
      </div>

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
    .demo-title { margin: 0; font-size: 18px; font-weight: 700; }
    .demo-desc { margin: 4px 0 12px; font-size: 13px; color: #6c757d; }
    .demo-toolbar { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .btn-group { display: inline-flex; border-radius: 4px; overflow: hidden; border: 1px solid #ced4da; }
    .k-btn {
      padding: 6px 16px; font-size: 13px; background: #fff; border: none;
      border-right: 1px solid #ced4da; cursor: pointer; color: #495057; font-family: inherit;
    }
    .k-btn:last-child { border-right: none; }
    .k-btn:hover { background: #f1f3f5; }
    .k-btn-active { background: #ff6358 !important; color: #fff !important; }
    .k-btn-flat {
      background: transparent; border: 1px solid #ced4da; border-radius: 4px;
      padding: 6px 12px; font-size: 13px; cursor: pointer; color: #495057; font-family: inherit;
    }
    .k-btn-flat:hover { background: #f1f3f5; }
    .demo-chart { flex: 1; min-height: 0; }
    .demo-chart ngx-gantt-chart { height: 100%; }
    .event-log {
      flex-shrink: 0; height: 140px; border: 1px solid #dee2e6;
      background: #fff; border-radius: 4px; overflow: hidden;
      display: flex; flex-direction: column;
    }
    .log-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 6px 16px; border-bottom: 1px solid #f1f3f5; flex-shrink: 0;
    }
    .log-title { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #868e96; }
    .log-count { font-size: 11px; color: #adb5bd; }
    .log-entries { overflow-y: auto; flex: 1; padding: 4px 16px; }
    .log-entry {
      font-size: 12px; font-family: 'SF Mono', Monaco, Consolas, monospace;
      padding: 3px 0; color: #495057; border-bottom: 1px solid #f8f9fa;
    }
    .log-empty { font-size: 12px; color: #adb5bd; font-style: italic; }
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
export class InteractiveDemoComponent {
  @ViewChild('gantt') gantt!: GanttChartComponent;

  howToCode = `import { Component } from '@angular/core';
import { GanttChartComponent } from 'ngx-core-components';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [GanttChartComponent],
  template: '<ngx-gantt-chart [tasks]="tasks" [dependencies]="dependencies" [config]="config" (taskChange)="onTaskChange($event)" />'
})
export class ExampleComponent {}`;

  ganttApi: ApiRow[] = [
    { name: 'tasks', type: 'GanttTask[]', default: 'required', description: 'Task collection rendered in the chart and sidebar.' },
    { name: 'dependencies', type: 'GanttDependency[]', default: '[]', description: 'Links that connect predecessor and successor tasks.' },
    { name: 'config', type: 'Partial<GanttConfig>', default: '{}', description: 'Optional chart configuration such as zoom level, sizing, and behavior flags.' },
    { name: '(taskChange)', type: 'GanttTaskChangeEvent', default: '—', description: 'Emitted when a task is dragged or resized.' },
    { name: '(taskClick)', type: 'GanttTaskClickEvent', default: '—', description: 'Emitted when the user clicks a task.' },
    { name: '(taskDblClick)', type: 'GanttTaskClickEvent', default: '—', description: 'Emitted when the user double-clicks a task.' },
    { name: '(dependencyClick)', type: 'GanttDependencyClickEvent', default: '—', description: 'Emitted when a dependency line is selected.' },
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
  eventLog: string[] = [];
  currentZoom = ZoomLevel.Day;
  today = new Date();

  config: Partial<GanttConfig> = {
    zoomLevel: ZoomLevel.Day,
    rowHeight: 36,
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
    this.log(`Zoom changed to: ${level}`);
  }

  onTaskChange(event: GanttTaskChangeEvent): void {
    this.tasks = this.tasks.map(t =>
      t.id === event.task.id ? { ...t, start: event.task.start, end: event.task.end, subtasks: event.task.subtasks } : t
    );
    this.log(`Task moved: "${event.task.name}" ${this.fmt(event.previousStart)} -> ${this.fmt(event.task.start)}`);
  }

  onTaskClick(event: GanttTaskClickEvent): void {
    this.log(`Clicked: "${event.task.name}" (${event.task.progress}% complete)`);
  }

  onTaskDblClick(event: GanttTaskClickEvent): void {
    this.log(`Double-clicked: "${event.task.name}"`);
  }

  onDependencyClick(event: GanttDependencyClickEvent): void {
    this.log(`Dependency: ${event.dependency.fromId} -> ${event.dependency.toId} (${event.dependency.type})`);
  }

  clearLog(): void {
    this.eventLog = [];
  }

  private log(msg: string): void {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    this.eventLog = [`[${time}] ${msg}`, ...this.eventLog.slice(0, 49)];
  }

  private fmt(d: Date): string {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
