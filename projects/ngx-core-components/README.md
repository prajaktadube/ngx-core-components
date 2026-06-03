# ngx-core-components

Angular 19 / 20 / 21 standalone component library with enterprise-ready UI building blocks including a full-featured **SVG Gantt Chart**, inputs, data grid, dialogs, charts, navigation, layout, feedback, and barcode components.

[![npm version](https://img.shields.io/npm/v/ngx-core-components.svg)](https://www.npmjs.com/package/ngx-core-components)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Features

- **Gantt chart** with task bars, dependencies, milestones, drag/resize, zoom, and hierarchy
- **Input controls** including text, dropdown, multi-select, autocomplete, date/time, slider, switch, rating, and color picker
- **Charts** including bar, line, pie, donut, and sparkline
- **Data presentation** with grid, tree view, and list view
- **Dialogs, tooltips, and popovers** for overlays and contextual UI
- **Buttons, chips, menus, breadcrumbs, tabs, cards, accordions, steppers, and splitters**
- **Feedback components** including badge, progress bar, skeleton, and notifications
- **Barcode and QR code generation** with no external runtime dependency
- **Fully themeable** via CSS custom properties
- **Zero runtime dependencies** — only Angular peer dependencies
- **OnPush change detection** + Angular Signals
- **Standalone components** (no NgModules)

## Installation

```bash
npm install ngx-core-components
```

## Entry Points

You can import from the primary package for convenience:

```typescript
import { GanttChartComponent, TextBoxComponent, DataGridComponent } from 'ngx-core-components';
```

Or use secondary entry points for more focused imports:

```typescript
import { TextBoxComponent, DropdownComponent } from 'ngx-core-components/inputs';
import { BarChartComponent, GanttChartComponent } from 'ngx-core-components/charts';
import { DataGridComponent } from 'ngx-core-components/grid';
import { DialogService } from 'ngx-core-components/dialog';
import { ButtonComponent } from 'ngx-core-components/buttons';
import { CardComponent } from 'ngx-core-components/layout';
import { BadgeComponent } from 'ngx-core-components/feedback';
import { BreadcrumbComponent } from 'ngx-core-components/navigation';
import { TreeViewComponent, ListViewComponent } from 'ngx-core-components/views';
import { QrCodeComponent, BarcodeComponent } from 'ngx-core-components/barcodes';
```

## Included Components

### Charts

- `GanttChartComponent`
- `BarChartComponent`
- `LineChartComponent`
- `PieChartComponent`
- `SparklineComponent`

### Inputs

- `TextBoxComponent`
- `CheckboxComponent`
- `RadioGroupComponent`
- `DropdownComponent`
- `MultiSelectComponent`
- `AutocompleteComponent`
- `DatePickerComponent`
- `SliderComponent`
- `SwitchComponent`
- `RatingComponent`
- `NumericTextBoxComponent`
- `TextareaComponent`
- `ColorPickerComponent`
- `TimePickerComponent`
- `DateRangePickerComponent`

### Data Views

- `DataGridComponent`
- `TreeViewComponent`
- `ListViewComponent`

### Dialog and Overlay

- `DialogService`
- `DialogContainerComponent`
- `TooltipDirective`
- `PopoverComponent`

### Buttons and Actions

- `ButtonComponent`
- `ButtonGroupComponent`
- `ChipComponent`
- `ChipListComponent`
- `SplitButtonComponent`
- `DropDownButtonComponent`

### Layout

- `CardComponent`
- `TabStripComponent`
- `TabComponent`
- `AccordionComponent`
- `StepperComponent`
- `SplitterComponent`

### Feedback

- `BadgeComponent`
- `ProgressBarComponent`
- `SkeletonComponent`
- `NotificationService`
- `NotificationContainerComponent`

### Navigation

- `BreadcrumbComponent`
- `MenuComponent`

### Barcodes

- `QrCodeComponent`
- `BarcodeComponent`

## Quick Start

### Gantt Chart

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

### Form Controls

```typescript
import { Component, signal } from '@angular/core';
import { TextBoxComponent, DropdownComponent, type DropdownOption } from 'ngx-core-components';

@Component({
  standalone: true,
  imports: [TextBoxComponent, DropdownComponent],
  template: `
    <ngx-textbox
      [value]="name()"
      label="Full Name"
      placeholder="Enter your name"
      (valueChange)="name.set($event)"
    />

    <ngx-dropdown
      [options]="countries"
      [value]="country()"
      label="Country"
      placeholder="Select country"
      (valueChange)="country.set($event)"
    />
  `,
})
export class MyFormComponent {
  name = signal('');
  country = signal<unknown>(null);

  countries: DropdownOption[] = [
    { label: 'United States', value: 'us' },
    { label: 'Germany', value: 'de' },
    { label: 'Japan', value: 'jp' },
  ];
}
```

### Structured Inputs

```typescript
import { Component, signal } from '@angular/core';
import { NumericTextBoxComponent, TimePickerComponent } from 'ngx-core-components/inputs';

@Component({
  standalone: true,
  imports: [NumericTextBoxComponent, TimePickerComponent],
  template: `
    <ngx-numeric-textbox
      [value]="quantity()"
      label="Quantity"
      [min]="0"
      [max]="25"
      [step]="1"
      (valueChange)="quantity.set($event)"
    />

    <ngx-time-picker
      [value]="meetingTime()"
      label="Meeting Time"
      [use12h]="true"
      (timeChange)="meetingTime.set($event)"
    />
  `,
})
export class MyStructuredInputsComponent {
  quantity = signal(3);
  meetingTime = signal('14:30');
}
```

`NumericTextBoxComponent` supports controlled values and keyboard stepping with the up and down arrow keys. `TimePickerComponent` accepts typed input such as `14:30` or `2:30 PM` and normalizes emitted values to `HH:mm`.

### List View

```typescript
import { Component, computed, signal } from '@angular/core';
import { ListViewComponent, type ListViewPageChangeEvent } from 'ngx-core-components/views';

@Component({
  standalone: true,
  imports: [ListViewComponent],
  template: `
    <ngx-list-view
      [items]="filteredPeople()"
      [pageSize]="5"
      [selectable]="true"
      (pageChange)="onPageChange($event)"
      (selectionChange)="selected.set($event.selectedItems)"
    />
  `,
})
export class MyListComponent {
  search = signal('');
  selected = signal<unknown[]>([]);
  people = [
    { name: 'Alice', dept: 'Engineering' },
    { name: 'Bob', dept: 'Product' },
  ];

  filteredPeople = computed(() => this.people);

  onPageChange(event: ListViewPageChangeEvent): void {
    console.log(event.page, event.totalPages);
  }
}
```

### Splitter

```typescript
import { Component, signal } from '@angular/core';
import { SplitterComponent } from 'ngx-core-components/layout';

@Component({
  standalone: true,
  imports: [SplitterComponent],
  template: `
    <div style="height: 320px; border: 1px solid #e9ecef; overflow: hidden;">
      <ngx-splitter [size]="paneSize()" [min]="180" (sizeChange)="paneSize.set($event)">
        <div pane1>Navigation</div>
        <div pane2>Content</div>
      </ngx-splitter>
    </div>
  `,
})
export class MyLayoutComponent {
  paneSize = signal('35%');
}
```

### Data Grid

```typescript
import { Component } from '@angular/core';
import { DataGridComponent, type GridColumnDef } from 'ngx-core-components';

@Component({
  standalone: true,
  imports: [DataGridComponent],
  template: `<ngx-data-grid [data]="rows" [columns]="columns" [pageSize]="5" />`,
})
export class MyGridComponent {
  columns: GridColumnDef[] = [
    { field: 'id', title: 'ID', width: 80 },
    { field: 'name', title: 'Name', sortable: true },
    { field: 'status', title: 'Status' },
  ];

  rows = [
    { id: 1, name: 'Alpha', status: 'Active' },
    { id: 2, name: 'Beta', status: 'Paused' },
  ];
}
```

## API

This README focuses on the primary Gantt API because it is the largest surface in the package. The demo application under `projects/demo` shows usage and API reference coverage for the other components.

### Notable Secondary APIs

#### ListView Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `items` | `T[]` | `[]` | Items rendered in the list. |
| `labelField` | `string` | `'label'` | Field used by the default item renderer. |
| `selectable` | `boolean` | `true` | Enables row selection. |
| `multiselect` | `boolean` | `false` | Allows multi-selection. |
| `loading` | `boolean` | `false` | Shows the loading state. |
| `pageSize` | `number` | `0` | Enables built-in pagination when greater than `0`. |

#### ListView Outputs

| Output | Type | Description |
|--------|------|-------------|
| `itemClick` | `ListViewItemClickEvent<T>` | Fired when an item is clicked. |
| `selectionChange` | `ListViewSelectionEvent<T>` | Fired when selected items change. |
| `pageChange` | `ListViewPageChangeEvent` | Fired when the built-in pager changes pages. |

#### NumericTextBox Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `value` | `number` | `0` | Controlled numeric value displayed in the input. |
| `min` | `number` | `-Infinity` | Lower bound for allowed values. |
| `max` | `number` | `Infinity` | Upper bound for allowed values. |
| `step` | `number` | `1` | Increment and decrement amount. |

#### TimePicker Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `value` | `string` | `'09:00'` | Controlled time value. Accepts `HH:mm` or `h:mm AM/PM`. |
| `use12h` | `boolean` | `false` | Shows AM/PM controls while still emitting `HH:mm`. |

#### Splitter Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `size` | `string \| number` | `null` | Controlled size of the first pane in pixels or percent. |
| `initialSize` | `string \| number` | `'50%'` | Initial pane size when uncontrolled. |
| `min` | `number` | `60` | Minimum size of the first pane in pixels. |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Split direction. |

#### Splitter Outputs

| Output | Type | Description |
|--------|------|-------------|
| `sizeChange` | `string` | Fired while the divider is dragged. |

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
| `snapTo` | `'day' \| 'week' \| 'month'` | `'day'` | Snap granularity for drag and resize |
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

## Advanced Features

### Draggable Zoom & Area Selection
The Gantt Chart component supports zooming directly into a specific time range by selecting a window on the timeline.
- **Enable Feature**: Add `enableDragToZoom: true` in the `config` object or pass `[enableDragToZoom]="true"`.
- **Keyboard Shortcut**: Hold **Shift** and click-and-drag across the timeline background to draw a glassmorphic zoom selection window.
- **Area Zoom Mode**: Click the **Area Zoom Mode** button (or call `toggleAreaZoomMode()` programmatically) to change the cursor to a crosshair and drag-select without holding Shift.
- **Outputs**:
  - `(zoomRangeChange)`: Emitted when a drag-zoom selection completes. Emits `{ start: Date, end: Date }`.
  - `(zoomChange)`: Emitted with the new active `ZoomLevel` (e.g., `ZoomLevel.Hour`, `ZoomLevel.Day`, `ZoomLevel.Week`, `ZoomLevel.Month`, `ZoomLevel.Quarter`, `ZoomLevel.Year`).
- **Resetting**: Call the public `resetZoom()` method (or trigger via a button) to reset the timeline back to full scale.

### Keyboard Rescheduling & Resizing
Tasks can be adjusted using only the keyboard:
- **Rescheduling**: Focus a task bar and use the `ArrowLeft` or `ArrowRight` keys to shift the task start and end dates by 1 unit (1 hour in Hour view, otherwise 1 day).
- **Resizing**: Focus a task bar and hold `Alt` or `Shift` alongside `ArrowLeft` or `ArrowRight` to extend or shrink the task's duration from the right boundary.

## Theming

Override CSS custom properties on the `ngx-gantt-chart` element:

```css
ngx-gantt-chart {
  --ngx-gantt-bar-bg: #27ae60;
  --ngx-gantt-bar-progress-bg: #1e8449;
  --ngx-gantt-today-color: #e74c3c;
  --ngx-gantt-header-bg: #2c3e50;
  --ngx-gantt-text: #ecf0f1;
}
```

Common Gantt custom properties include `--ngx-gantt-bg`, `--ngx-gantt-border`, `--ngx-gantt-grid-line`, `--ngx-gantt-header-bg`, `--ngx-gantt-text`, `--ngx-gantt-bar-bg`, `--ngx-gantt-bar-progress-bg`, and `--ngx-gantt-today-color`.

Other component groups expose their own CSS variable namespaces as well:

- Inputs: `--ngx-input-*`
- Charts: `--ngx-chart-*`
- Grid: `--ngx-grid-*`
- Tree/List: `--ngx-tree-*`, `--ngx-list-*`
- Tooltip/Popover: `--ngx-tooltip-*`, `--ngx-popover-*`
- Buttons and chips: `--ngx-btn-*`, `--ngx-chip-*`

## Public Methods

Access via `ViewChild`:

```typescript
@ViewChild(GanttChartComponent) gantt!: GanttChartComponent;

this.gantt.scrollToDate(new Date('2026-04-15'));
this.gantt.scrollToTask('task-42');
this.gantt.expandAll();
this.gantt.collapseAll();
```

## Demo Application

The repository includes a demo app under `projects/demo` covering live examples, how-to snippets, and API reference tables for the library components.

## License

MIT
