# ngx-core-components

Angular 19 / 20 / 21 component library featuring a full-featured **SVG Gantt Chart**.

[![npm version](https://img.shields.io/npm/v/ngx-core-components.svg)](https://www.npmjs.com/package/ngx-core-components)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Features

- **Task bars** with progress indicators
- **Dependency arrows** (FS, SS, FF, SF)
- **Drag-to-move** and **drag-to-resize** tasks
- **Zoom levels** — Day / Week / Month
- **Today marker** — dashed vertical line
- **Milestones** — diamond-shaped markers
- **Tree hierarchy** — collapsible task groups in a sidebar
- **Keyboard accessible** — Arrow keys, Enter, Escape
- **Fully themeable** via CSS custom properties
- **Zero runtime dependencies** — only Angular peer deps
- **OnPush change detection** + Angular Signals
- **Standalone components** (no NgModules)

## Installation

```bash
npm install ngx-core-components
```

## Quick Start

```typescript
import { Component } from '@angular/core';
import { GanttChartComponent, GanttTask, GanttDependency, DependencyType } from 'ngx-core-components';

@Component({
  standalone: true,
  imports: [GanttChartComponent],
  template: `
    <ngx-gantt-chart
      [tasks]="tasks"
      [dependencies]="dependencies"
      [config]="{ zoomLevel: 'day', rowHeight: 40 }"
      (taskChange)="onTaskChange($event)"
      (taskClick)="onTaskClick($event)"
    />
  `,
  styles: [`
    ngx-gantt-chart { height: 500px; }
  `]
})
export class MyComponent {
  tasks: GanttTask[] = [
    {
      id: '1', name: 'Design', progress: 100,
      start: new Date('2026-04-01'), end: new Date('2026-04-05'),
      parentId: null, collapsed: false, isMilestone: false,
    },
    {
      id: '2', name: 'Development', progress: 40,
      start: new Date('2026-04-06'), end: new Date('2026-04-15'),
      parentId: null, collapsed: false, isMilestone: false,
    },
  ];

  dependencies: GanttDependency[] = [
    { fromId: '1', toId: '2', type: DependencyType.FinishToStart },
  ];

  onTaskChange(event: any) { /* handle drag/resize */ }
  onTaskClick(event: any) { /* handle click */ }
}
```

## API

### Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `tasks` | `GanttTask[]` | **required** | Array of tasks to display |
| `dependencies` | `GanttDependency[]` | `[]` | Dependency links between tasks |
| `config` | `Partial<GanttConfig>` | `{}` | Configuration options (merged with defaults) |

### Outputs

| Output | Type | Description |
|--------|------|-------------|
| `taskChange` | `GanttTaskChangeEvent` | Emitted after drag/resize completes |
| `taskClick` | `GanttTaskClickEvent` | Task bar clicked |
| `taskDblClick` | `GanttTaskClickEvent` | Task bar double-clicked |
| `dependencyClick` | `GanttDependencyClickEvent` | Dependency arrow clicked |
| `scroll` | `GanttScrollEvent` | Chart scrolled |
| `zoomChange` | `ZoomLevel` | Zoom level changed |

### GanttConfig

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `zoomLevel` | `'day' \| 'week' \| 'month'` | `'day'` | Timeline granularity |
| `rowHeight` | `number` | `40` | Height of each row in pixels |
| `columnWidth` | `number` | `40` | Width of each time-unit column |
| `sidebarWidth` | `number` | `280` | Width of the tree sidebar |
| `headerHeight` | `number` | `60` | Height of the timeline header |
| `showTodayMarker` | `boolean` | `true` | Show today indicator line |
| `showGrid` | `boolean` | `true` | Show grid lines |
| `collapsible` | `boolean` | `true` | Allow tree collapse/expand |
| `snapTo` | `'none' \| 'day' \| 'hour'` | `'day'` | Snap granularity for drag |
| `locale` | `string` | `'en-US'` | Locale for date formatting |

### GanttTask

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique identifier |
| `name` | `string` | Display name |
| `start` | `Date` | Start date |
| `end` | `Date` | End date |
| `progress` | `number` | 0–100 completion percentage |
| `parentId` | `string \| null` | Parent task ID for hierarchy |
| `collapsed` | `boolean` | Whether children are collapsed |
| `isMilestone` | `boolean` | Render as diamond marker |
| `color?` | `string` | Bar color override |
| `draggable?` | `boolean` | Enable drag/resize (default: true) |
| `cssClass?` | `string` | Custom CSS class |
| `meta?` | `Record<string, unknown>` | Arbitrary data |

## Theming

Override CSS custom properties on the `ngx-gantt-chart` element:

```css
ngx-gantt-chart {
  --ngx-gantt-bar-bg: #27ae60;
  --ngx-gantt-bar-progress-bg: #1e8449;
  --ngx-gantt-today-color: #e74c3c;
  --ngx-gantt-header-bg: #2c3e50;
  --ngx-gantt-header-text-color: #ecf0f1;
}
```

All available CSS custom properties: `--ngx-gantt-bg`, `--ngx-gantt-border-color`, `--ngx-gantt-grid-line-color`, `--ngx-gantt-weekend-bg`, `--ngx-gantt-header-bg`, `--ngx-gantt-header-text-color`, `--ngx-gantt-bar-bg`, `--ngx-gantt-bar-progress-bg`, `--ngx-gantt-bar-text-color`, `--ngx-gantt-milestone-color`, `--ngx-gantt-arrow-color`, `--ngx-gantt-today-color`, `--ngx-gantt-sidebar-bg`, `--ngx-gantt-sidebar-hover-bg`, `--ngx-gantt-focus-ring-color`, `--ngx-gantt-font-family`, `--ngx-gantt-font-size`, `--ngx-gantt-header-font-size`.

## Public Methods

Access via `ViewChild`:

```typescript
@ViewChild(GanttChartComponent) gantt!: GanttChartComponent;

this.gantt.scrollToDate(new Date('2026-04-15'));
this.gantt.scrollToTask('task-42');
this.gantt.expandAll();
this.gantt.collapseAll();
```

## License

MIT
