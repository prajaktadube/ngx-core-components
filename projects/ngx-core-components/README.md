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

## Component API Reference & Guides

This section provides complete documentation, detailed API reference tables (Inputs, Outputs, and Public Methods), and "How to Use" guidelines for all components in the library. All component inputs and outputs are signal-based.

---

### Charts

#### How to Use Charts
```typescript
import { Component } from '@angular/core';
import { BarChartComponent, LineChartComponent, PieChartComponent, SparklineComponent, GanttChartComponent } from 'ngx-core-components/charts';

@Component({
  standalone: true,
  imports: [BarChartComponent, LineChartComponent, PieChartComponent, SparklineComponent, GanttChartComponent],
  template: `
    <!-- Bar Chart -->
    <ngx-bar-chart [series]="barSeries" [categories]="categories" title="Monthly Sales" />

    <!-- Line Chart -->
    <ngx-line-chart [series]="lineSeries" [categories]="categories" [showArea]="true" />

    <!-- Pie Chart -->
    <ngx-pie-chart [data]="pieData" mode="donut" centerTitle="Visits" />

    <!-- Sparkline -->
    <ngx-sparkline [data]="[10, 15, 8, 22, 14, 25]" type="area" color="#2ecc71" />
  `
})
export class ChartsExampleComponent {
  categories = ['Q1', 'Q2', 'Q3', 'Q4'];
  barSeries = [{ name: 'Online', data: [120, 180, 240, 300] }];
  lineSeries = [{ name: 'Active Users', data: [450, 620, 810, 950] }];
  pieData = [
    { label: 'Search', value: 55 },
    { label: 'Direct', value: 30 },
    { label: 'Social', value: 15 }
  ];
}
```

#### GanttChartComponent (`ngx-gantt-chart`)
##### Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `tasks` | `GanttTask[]` | **required** | Array of tasks to display |
| `dependencies` | `GanttDependency[]` | `[]` | Predecessor/successor dependencies |
| `config` | `Partial<GanttConfig>` | `{}` | Config settings (zoom level, column/row sizes) |
| `groups` | `GanttGroup[]` | `[]` | Group tasks by category or assignee |
| `baselineItems` | `GanttBaselineItem[]` | `[]` | Baseline bars for progress comparisons |
| `tooltipTemplate` | `TemplateRef<...>` | `null` | Custom tooltip template reference |
| `enableDragToZoom` | `boolean` | `false` | Enable drag-to-zoom timeline selection |

##### Outputs
| Output | Type | Description |
|---|---|---|
| `taskChange` | `GanttTaskChangeEvent` | Emitted when task dates or progress are changed via dragging/resizing |
| `taskClick` | `GanttTaskClickEvent` | Emitted when a task bar is clicked |
| `taskDblClick` | `GanttTaskClickEvent` | Emitted when a task bar is double clicked |
| `dependencyClick` | `GanttDependencyClickEvent` | Emitted when a dependency connector line is clicked |
| `zoomChange` | `ZoomLevel` | Emitted when the active zoom level shifts |
| `zoomRangeChange` | `{ start: Date; end: Date }` | Emitted when a drag-zoom range is selected |
| `selectedChange` | `GanttSelectedEvent` | Emitted when selected tasks change |
| `expandChange` | `GanttExpandChangeEvent` | Emitted when a task or group node collapses/expands |
| `loadOnScroll` | `GanttLoadOnScrollEvent` | Emitted when horizontal scroll reaches close to ends (lazy loading) |

##### Public Methods
| Method | Signature | Description |
|---|---|---|
| `scrollToToday` | `(): void` | Scroll view to current date |
| `scrollToDate` | `(date: Date): void` | Scroll view to a specific date |
| `scrollToTask` | `(taskId: string): void` | Scroll vertically to focus a specific task row |
| `expandAll` | `(): void` | Expand all collapsed rows |
| `collapseAll` | `(): void` | Collapse all expandable rows |
| `toggleCriticalPath` | `(): void` | Toggle visibility of critical path tasks |
| `toggleAreaZoomMode` | `(): void` | Toggle crosshair area-zoom selector |
| `resetZoom` | `(): void` | Reset zoom to standard scale |
| `exportAsImage` | `(filename?: string): Promise<void>` | Export Gantt view to PNG download |

##### GanttConfig Interface
```typescript
interface GanttConfig {
  zoomLevel: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
  rowHeight: number;
  columnWidth: number;
  sidebarWidth: number;
  headerHeight: number;
  showTodayMarker: boolean;
  showGrid: boolean;
  collapsible: boolean;
  snapTo: 'hour' | 'day' | 'week' | 'month';
  locale: string;
}
```

##### GanttTask Interface
```typescript
interface GanttTask {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress: number;
  parentId: string | null;
  collapsed?: boolean;
  isMilestone?: boolean;
  color?: string;
  draggable?: boolean;
  cssClass?: string;
  meta?: Record<string, unknown>;
}
```

#### BarChartComponent (`ngx-bar-chart`)
##### Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `series` | `ChartSeries[]` | `[]` | Array of series data objects |
| `categories` | `string[]` | `[]` | X-axis labels |
| `height` | `number` | `260` | SVG height in pixels |
| `showGrid` | `boolean` | `true` | Show horizontal grid lines |
| `showLabels` | `boolean` | `false` | Show value label above bars |
| `showLegend` | `boolean` | `true` | Show color legend indicators |
| `colors` | `string[]` | _theme_ | Custom color palette overrides |

#### LineChartComponent (`ngx-line-chart`)
##### Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `series` | `ChartSeries[]` | `[]` | Array of line series data |
| `categories` | `string[]` | `[]` | X-axis labels |
| `height` | `number` | `260` | SVG height |
| `showGrid` | `boolean` | `true` | Show horizontal grid lines |
| `showArea` | `boolean` | `false` | Show area fill gradients below lines |
| `showMarkers` | `boolean` | `true` | Show circles on data points |
| `showLegend` | `boolean` | `true` | Show color legends |
| `colors` | `string[]` | _theme_ | Custom color palette |

#### PieChartComponent (`ngx-pie-chart`)
##### Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `data` | `ChartDataPoint[]` | `[]` | Array of slice data objects |
| `mode` | `'pie' \| 'donut'` | `'pie'` | Chart layout variant |
| `donutHoleSize` | `number` | `0.55` | Inner circle size ratio for donut charts |
| `height` | `number` | `240` | SVG size (width & height) |
| `showLegend` | `boolean` | `true` | Show Legend beside chart |
| `showLabels` | `boolean` | `true` | Show percentage label on slices |
| `centerTitle` | `string` | `'Total'` | Donut center placeholder text |
| `colors` | `string[]` | _theme_ | Color palette overrides |

#### SparklineComponent (`ngx-sparkline`)
##### Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `data` | `number[]` | `[]` | Numeric trend values |
| `type` | `'line' \| 'bar' \| 'area'` | `'line'` | Display style |
| `color` | `string` | `'#4a90d9'` | Stroke or fill color |
| `width` | `number` | `120` | SVG width |
| `height` | `number` | `36` | SVG height |

---

### Inputs

#### How to Use Inputs (with Reactive Forms)
```typescript
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TextBoxComponent, DropdownComponent, DatePickerComponent, NumericTextBoxComponent } from 'ngx-core-components/inputs';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, TextBoxComponent, DropdownComponent, DatePickerComponent, NumericTextBoxComponent],
  template: `
    <form [formGroup]="form">
      <ngx-textbox formControlName="username" label="Username" placeholder="Enter username" [clearable]="true" />
      <ngx-dropdown formControlName="role" label="Role" [options]="roles" />
      <ngx-date-picker formControlName="birthDate" label="Birth Date" />
      <ngx-numeric-textbox formControlName="age" label="Age" [min]="18" [max]="99" />
    </form>
  `
})
export class FormComponent {
  roles = [{ label: 'Admin', value: 'admin' }, { label: 'User', value: 'user' }];
  form = new FormGroup({
    username: new FormControl(''),
    role: new FormControl('user'),
    birthDate: new FormControl<Date | null>(null),
    age: new FormControl(18)
  });
}
```

#### TextBoxComponent (`ngx-textbox`)
##### Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | `''` | Current string value |
| `label` | `string` | `''` | Floating/static label |
| `placeholder` | `string` | `''` | Placeholder text |
| `type` | `string` | `'text'` | HTML input type attribute |
| `disabled` | `boolean` | `false` | Disabled state |
| `readonly` | `boolean` | `false` | Read-only mode |
| `error` | `string` | `''` | Error message displayed below input |
| `hint` | `string` | `''` | Hint text displayed below input |
| `maxlength` | `number` | `0` | Max characters allowed |
| `clearable` | `boolean` | `false` | Show clear button |
| `showCharCount` | `boolean` | `false` | Display character counter |
| `prefixIcon` | `string` | `''` | Text/icon shown before text |
| `suffixIcon` | `string` | `''` | Text/icon shown after text |
| `passwordToggle` | `boolean` | `false` | Show password visibility eye icon |

##### Outputs
| Output | Type | Description |
|---|---|---|
| `valueChange` | `string` | Emitted when value is changed |
| `focusChange` | `boolean` | Emitted on focus (`true`) and blur (`false`) |

#### CheckboxComponent (`ngx-checkbox`)
##### Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | `''` | Label next to checkbox |
| `checked` | `boolean` | `false` | Checked state |
| `disabled` | `boolean` | `false` | Disabled state |
| `indeterminate` | `boolean` | `false` | Indeterminate line state |

##### Outputs
| Output | Type | Description |
|---|---|---|
| `checkedChange` | `boolean` | Checked state changed |

#### RadioGroupComponent (`ngx-radio-group`)
##### Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `options` | `RadioOption[]` | `[]` | Array of radio options |
| `label` | `string` | `''` | Radio group header label |
| `value` | `unknown` | `null` | Selected option value |
| `disabled` | `boolean` | `false` | Disable all controls |
| `inline` | `boolean` | `false` | Render horizontally |

##### Outputs
| Output | Type | Description |
|---|---|---|
| `valueChange` | `unknown` | Value changed |

#### DropdownComponent (`ngx-dropdown`)
##### Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `options` | `DropdownOption[]` | `[]` | Selectable options list |
| `value` | `unknown` | `null` | Selected item value |
| `label` | `string` | `''` | Header label |
| `placeholder` | `string` | `'Select...'` | Empty selection placeholder |
| `disabled` | `boolean` | `false` | Disabled state |
| `filterable` | `boolean` | `false` | Add filter search box |
| `required` | `boolean` | `false` | Show required red asterisk |
| `error` | `string` | `''` | Error message |
| `hint` | `string` | `''` | Hint text |

##### Outputs
| Output | Type | Description |
|---|---|---|
| `valueChange` | `unknown` | Emitted when selection changes |

#### MultiSelectComponent (`ngx-multi-select`)
##### Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `options` | `DropdownOption[]` | `[]` | Selectable options |
| `values` | `unknown[]` | `[]` | Array of selected values |
| `label` | `string` | `''` | Header label |
| `placeholder` | `string` | `'Select...'` | Input placeholder |
| `disabled` | `boolean` | `false` | Disable component |
| `filterable` | `boolean` | `false` | Show input filter search |
| `maxTags` | `number` | `Infinity` | Max tag chips visible before overflow indicator |

##### Outputs
| Output | Type | Description |
|---|---|---|
| `valuesChange` | `unknown[]` | Selected items changed |

#### AutocompleteComponent (`ngx-autocomplete`)
##### Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `options` | `DropdownOption[]` | `[]` | Search recommendation list |
| `label` | `string` | `''` | Header label |
| `placeholder` | `string` | `'Type to search...'` | Input placeholder |
| `disabled` | `boolean` | `false` | Disable autocomplete |
| `error` | `string` | `''` | Error text |
| `minLength` | `number` | `1` | Min characters typed before suggesting options |

##### Outputs
| Output | Type | Description |
|---|---|---|
| `valueChange` | `unknown` | Suggestion selected or cleared |

#### DatePickerComponent (`ngx-date-picker`)
##### Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `value` | `Date \| null` | `null` | Selected Date |
| `label` | `string` | `''` | Input label |
| `placeholder` | `string` | `'Select date...'` | Input placeholder |
| `disabled` | `boolean` | `false` | Disable datepicker |
| `min` | `Date \| null` | `null` | Earliest selection limit |
| `max` | `Date \| null` | `null` | Latest selection limit |
| `format` | `string` | `'MM/dd/yyyy'` | Format layout |

##### Outputs
| Output | Type | Description |
|---|---|---|
| `valueChange` | `Date \| null` | Date selection changed |

#### DateRangePickerComponent (`ngx-date-range-picker`)
##### Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | `''` | Input label |
| `start` | `Date \| string \| null` | `null` | Selection start date |
| `end` | `Date \| string \| null` | `null` | Selection end date |
| `min` | `Date \| string \| null` | `null` | Min limits |
| `max` | `Date \| string \| null` | `null` | Max limits |
| `disabledDates` | `(Date \| string)[]` | `[]` | Disabled date values |
| `presets` | `DateRangePreset[]` | _defaults_ | Fast presets (Today, Last 7 days, This Month) |
| `weekStartsOn` | `0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6` | `0` | First day of week (0=Sunday) |
| `disabled` | `boolean` | `false` | Disabled state |

##### Outputs
| Output | Type | Description |
|---|---|---|
| `rangeChange` | `{ start: string; end: string }` | Date range selection completed (YYYY-MM-DD format) |
| `openChange` | `boolean` | Emitted when calendar overlay is opened/closed |

#### SliderComponent (`ngx-slider`)
##### Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | `''` | Slider label |
| `min` | `number` | `0` | Min slider limit |
| `max` | `number` | `100` | Max slider limit |
| `step` | `number` | `1` | Drag interval size |
| `range` | `boolean` | `false` | Enable double-handle range mode |
| `disabled` | `boolean` | `false` | Disable component |
| `showValue` | `boolean` | `true` | Display active values |
| `showTicks` | `boolean` | `false` | Show min/max value indicators |
| `initialValue` | `number` | `0` | Initial single value |
| `initialLow` | `number` | `20` | Initial low value in range mode |
| `initialHigh` | `number` | `80` | Initial high value in range mode |

##### Outputs
| Output | Type | Description |
|---|---|---|
| `valueChange` | `number` | Value changed (single handle) |
| `rangeChange` | `[number, number]` | Emitted when range bounds change |

#### SwitchComponent (`ngx-switch`)
##### Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `onLabel` | `string` | `'On'` | Label when active |
| `offLabel` | `string` | `'Off'` | Label when inactive |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Toggle size |
| `disabled` | `boolean` | `false` | Disabled state |

##### Outputs
| Output | Type | Description |
|---|---|---|
| `checkedChange` | `boolean` | State toggled |

#### RatingComponent (`ngx-rating`)
##### Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `max` | `number` | `5` | Total stars to display |
| `label` | `string` | `''` | Header label |
| `readonly` | `boolean` | `false` | Disabled interactive selection |
| `showValue` | `boolean` | `false` | Show text scale (e.g. "4/5") |

##### Outputs
| Output | Type | Description |
|---|---|---|
| `ratingChange` | `number` | Star selection changed |

#### NumericTextBoxComponent (`ngx-numeric-textbox`)
##### Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | `''` | Label text |
| `value` | `number` | `0` | Current value |
| `min` | `number` | `-Infinity` | Lower bound |
| `max` | `number` | `Infinity` | Upper bound |
| `step` | `number` | `1` | Increment value on step up/down |
| `disabled` | `boolean` | `false` | Disabled state |
| `placeholder` | `string` | `''` | Input placeholder |
| `prefix` | `string` | `''` | Prepend character (e.g., "$") |
| `suffix` | `string` | `''` | Append character (e.g., "kg") |

##### Outputs
| Output | Type | Description |
|---|---|---|
| `valueChange` | `number` | Value changed |

##### Public Methods
| Method | Signature | Description |
|---|---|---|
| `spin` | `(dir: 1 \| -1): void` | Step value up or down |
| `setValue` | `(v: number): void` | Set clamped numeric value |

#### TextareaComponent (`ngx-textarea`)
##### Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | `''` | Label text |
| `placeholder` | `string` | `''` | Textarea placeholder |
| `rows` | `number` | `4` | Rows high |
| `maxlength` | `number` | `0` | Max character length limits |
| `disabled` | `boolean` | `false` | Disabled state |
| `autoResize` | `boolean` | `false` | Automatically adjust size with lines |
| `hint` | `string` | `''` | Instruction note below input |
| `error` | `string` | `''` | Error alert below input |

##### Outputs
| Output | Type | Description |
|---|---|---|
| `valueChange` | `string` | Character value changed |

#### ColorPickerComponent (`ngx-color-picker`)
##### Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | `''` | Input label |

##### Outputs
| Output | Type | Description |
|---|---|---|
| `colorChange` | `string` | Emitted with hex color code when picked |

#### TimePickerComponent (`ngx-time-picker`)
##### Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | `''` | Label text |
| `use12h` | `boolean` | `false` | Enable 12h clock mode |
| `value` | `string` | `'09:00'` | Selected time (HH:mm format) |

##### Outputs
| Output | Type | Description |
|---|---|---|
| `timeChange` | `string` | Emitted when time changes (HH:mm format) |

---

### Data Grid & Views

#### How to Use Grid & Views
```typescript
import { Component } from '@angular/core';
import { DataGridComponent, GridColumnDef } from 'ngx-core-components/grid';
import { TreeViewComponent, ListViewComponent, TreeNode } from 'ngx-core-components/views';

@Component({
  standalone: true,
  imports: [DataGridComponent, TreeViewComponent, ListViewComponent],
  template: `
    <!-- Data Grid -->
    <ngx-data-grid [data]="gridData" [columns]="columns" [pageSize]="5" />

    <!-- Tree View -->
    <ngx-tree-view [nodes]="treeNodes" [checkable]="true" />
  `
})
export class GridViewsExampleComponent {
  columns: GridColumnDef<any>[] = [
    { field: 'id', title: 'ID', width: 80 },
    { field: 'name', title: 'Name', sortable: true },
    { field: 'role', title: 'Role' }
  ];
  gridData = [
    { id: 1, name: 'Alice Smith', role: 'Developer' },
    { id: 2, name: 'Bob Jones', role: 'Designer' }
  ];

  treeNodes: TreeNode[] = [
    {
      id: 'root',
      label: 'My Project',
      children: [
        { id: 'src', label: 'src' },
        { id: 'tests', label: 'tests' }
      ]
    }
  ];
}
```

#### DataGridComponent (`ngx-data-grid`)
##### Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `data` | `T[]` | `[]` | Table row data |
| `columns` | `GridColumnDef<T>[]` | `[]` | Columns configuration |
| `stateKey` | `string` | `''` | LocalStorage key to save grid column preferences |
| `reorderable` | `boolean` | `false` | Enable column drag reordering |
| `rowReorderable`| `boolean` | `false` | Enable row drag reordering |
| `multiSort` | `boolean` | `false` | Support multi-column sorting (Ctrl+Click) |
| `showGlobalSearch` | `boolean` | `false` | Show global search input |
| `pageSize` | `number` | `10` | Rows per page |
| `page` | `number` | `1` | Active page index |
| `total` | `number` | `0` | Total records (server paging) |
| `selectable` | `boolean` | `false` | Render checkbox column for selections |
| `striped` | `boolean` | `true` | Alternating row backgrounds |
| `loading` | `boolean` | `false` | Show loading blur spinner |
| `editable` | `boolean` | `false` | Enable double-click inline editor |
| `sortMode` | `'client' \| 'server'` | `'client'` | Sorting location |
| `filterMode` | `'client' \| 'server'` | `'client'` | Filtering location |
| `groupMode` | `'client' \| 'server'` | `'client'` | Grouping location |
| `pagingMode` | `'client' \| 'server'` | `'client'` | Pagination calculations |
| `groupBy` | `GridGroupState \| null` | `null` | Column to group by |
| `groupedData` | `GridGroupResult<T>[]` | `[]` | Grouped items (server mode) |
| `showColumnChooser` | `boolean` | `false` | Show column hiding menu |
| `cellSelection` | `boolean` | `false` | Enable grid cell click selection ranges |
| `enableContextMenu` | `boolean` | `false` | Right-click context menus |
| `keyboardNavigation` | `boolean` | `false` | Arrow key cell navigation |
| `groupAggregations` | `boolean` | `false` | Calculate aggregate footers on groups |

##### Outputs
| Output | Type | Description |
|---|---|---|
| `columnReorder` | `{ columns: GridColumnDef<T>[] }` | Emitted when column positions change |
| `rowReorder` | `{ previousIndex: number; currentIndex: number; data: T[] }` | Emitted when rows are dragged and dropped |
| `rowClick` | `GridRowClickEvent<T>` | Emitted when a row is clicked |
| `selectionChange` | `T[]` | Emitted with list of selected row items |
| `sortChange` | `GridSortChangeEvent` | Emitted on sort changes |
| `filterChange` | `GridFilterChangeEvent` | Emitted on filter changes |
| `groupChange` | `GridGroupChangeEvent` | Emitted on grouping changes |
| `pageChange` | `GridPageChangeEvent` | Emitted on page navigations |
| `rowUpdate` | `GridRowUpdateEvent<T>` | Emitted when inline row changes are saved |
| `cellSelectionChange`| `{ start, end }` | Emitted when range selection changes |

##### Public Methods
| Method | Signature | Description |
|---|---|---|
| `goPage` | `(page: number): void` | Navigate to specific page |
| `exportToJson` | `(): void` | Trigger JSON data export download |
| `exportToCsv` | `(): void` | Trigger CSV format export download |
| `beginEdit` | `(row: T, index: number): void` | Open inline row editor |
| `saveEdit` | `(row: T, index: number): void` | Commit inline row editing changes |
| `cancelEdit` | `(): void` | Discard inline editing draft changes |

#### TreeViewComponent (`ngx-tree-view`)
##### Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `nodes` | `TreeNode[]` | `[]` | Hierarchical nodes list |
| `selectable` | `boolean` | `true` | Click selection active |
| `checkable` | `boolean` | `false` | Show checkbox selectors next to titles |
| `selectedId` | `string \| null` | `null` | Highlighted node ID |
| `expandedIds` | `string[]` | `[]` | Initially expanded node IDs |

##### Outputs
| Output | Type | Description |
|---|---|---|
| `nodeSelect` | `TreeNodeEvent` | Emitted on node click |
| `nodeExpand` | `TreeNodeEvent` | Emitted on node expansion |
| `nodeCollapse` | `TreeNodeEvent` | Emitted on node collapse |
| `checkChange` | `{ node, checked }` | Emitted when check state changes |

##### Public Methods
| Method | Signature | Description |
|---|---|---|
| `expandAll` | `(): void` | Expand all expandable tree branches |
| `collapseAll` | `(): void` | Collapse all open tree branches |

#### ListViewComponent (`ngx-list-view`)
##### Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `items` | `T[]` | `[]` | Items array |
| `selectable` | `boolean` | `true` | Row selection active |
| `multiselect` | `boolean` | `false` | Support multi-item selections |
| `loading` | `boolean` | `false` | Show loading overlay |
| `labelField` | `string` | `'label'` | Object key property for item labels |
| `pageSize` | `number` | `0` | Enable pagination when > 0 |

##### Outputs
| Output | Type | Description |
|---|---|---|
| `itemClick` | `ListViewItemClickEvent<T>` | Emitted when item clicked |
| `selectionChange` | `ListViewSelectionEvent<T>` | Emitted on selection toggles |
| `pageChange` | `ListViewPageChangeEvent` | Emitted on page navigations |

---

### Dialog and Overlay

#### How to Use Dialog and Overlay
```typescript
import { Component } from '@angular/core';
import { DialogService } from 'ngx-core-components/dialog';
import { TooltipDirective, PopoverComponent } from 'ngx-core-components/dialog';

@Component({
  standalone: true,
  imports: [TooltipDirective, PopoverComponent],
  template: `
    <!-- Tooltip -->
    <button ngxTooltip="Save Changes" tooltipPosition="bottom">Hover</button>

    <!-- Popover -->
    <button #btn>Click Me</button>
    <ngx-popover [anchor]="btn" title="Information">
      <p>This is a popover overlay.</p>
    </ngx-popover>
  `
})
export class OverlayExampleComponent {
  constructor(private dialogService: DialogService) {}

  openModal() {
    const ref = this.dialogService.open(MyDialogContent, {
      data: { name: 'Admin' }
    });
    ref.closed.subscribe(result => console.log('Closed:', result));
  }
}

@Component({
  standalone: true,
  template: `<h3>Hello {{ dialogData.name }}</h3>`
})
export class MyDialogContent {
  // Inject properties inside standalone dialog components using standard inputs
  dialogData: any; 
  dialogRef: any;
}
```

#### DialogService (Injectable)
##### Methods
| Method | Signature | Description |
|---|---|---|
| `open` | `open<C, D, R>(component: Type<C>, config?: DialogConfig<D>): DialogRef<R>` | Open floating overlay window |

##### DialogConfig Interface
| Property | Type | Default | Description |
|---|---|---|---|
| `data` | `D` | `undefined` | Custom data inputs passed to dialog component |
| `closeOnBackdrop` | `boolean` | `true` | Close modal on background mouse click |
| `panelClass` | `string \| string[]` | `[]` | Dialog container class customizations |
| `maxWidth` | `string` | `'560px'` | Max CSS size limits |
| `ariaLabel` | `string` | `'Dialog'` | Screen reader description |

#### TooltipDirective (`ngxTooltip`)
##### Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `ngxTooltip` | `string` | `''` | Text contents of the popup tooltip box |
| `tooltipPosition` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | Placement side |
| `tooltipDelay` | `number` | `300` | Delay in milliseconds before showing tooltip |
| `tooltipDisabled` | `boolean` | `false` | Disable hover behavior |

#### PopoverComponent (`ngx-popover`)
##### Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `anchor` | `ElementRef \| HTMLElement` | **required** | Relative positioning anchor element |
| `title` | `string` | `''` | Popover header header text |
| `position` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom'` | Alignment layout |
| `width` | `string` | `'250px'` | CSS popup width limits |
| `closable` | `boolean` | `true` | Show close X button |
| `showOn` | `'click' \| 'hover'` | `'click'` | Trigger event action |

##### Outputs
| Output | Type | Description |
|---|---|---|
| `open` | `void` | Emitted when popup opens |
| `close` | `void` | Emitted when popup closes |

---

### Buttons and Actions

#### How to Use Buttons & Actions
```typescript
import { Component, signal } from '@angular/core';
import { ButtonComponent, ChipComponent, ChipListComponent, DropDownButtonComponent, SpeedDialComponent } from 'ngx-core-components/buttons';

@Component({
  standalone: true,
  imports: [ButtonComponent, ChipComponent, ChipListComponent, DropDownButtonComponent, SpeedDialComponent],
  template: `
    <!-- Button -->
    <button ngx-button variant="primary" size="lg" [loading]="loading()">Click</button>

    <!-- Speed Dial FAB -->
    <ngx-speed-dial [items]="actions" direction="top" (itemClick)="onFabClick($event)" />
  `
})
export class ButtonExampleComponent {
  loading = signal(false);
  actions = [
    { id: 'pdf', icon: '📄', label: 'Export PDF' },
    { id: 'email', icon: '✉️', label: 'Send Email' }
  ];
  onFabClick(ev: any) { console.log('FAB Clicked:', ev.id); }
}
```

#### ButtonComponent (`ngx-button` / Attribute selector)
##### Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `variant` | `ButtonVariant` | `'primary'` | Visual style variant (primary, danger, ghost, link, success) |
| `size` | `ButtonSize` | `'md'` | Button height size (sm, md, lg) |
| `shape` | `ButtonShape` | `'rectangle'` | Button curves (rectangle, rounded, pill, square) |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Button type |
| `disabled` | `boolean` | `false` | Disabled status |
| `loading` | `boolean` | `false` | Loading status (replaces text/icon with spinner) |
| `prefixIcon` | `string` | `''` | Icon identifier displayed before label |
| `suffixIcon` | `string` | `''` | Icon identifier displayed after label |
| `ariaLabel` | `string` | `''` | Accessibility label description |

##### Outputs
| Output | Type | Description |
|---|---|---|
| `clicked` | `MouseEvent` | Native click event emissions |

#### ButtonGroupComponent (`ngx-button-group`)
##### Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `vertical` | `boolean` | `false` | Stack buttons vertically |
| `ariaLabel` | `string` | `'Button group'` | Group accessibility labels |

#### ChipComponent (`ngx-chip`)
##### Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `variant` | `ChipVariant` | `'default'` | Visual style variant (success, error, warning, outlined) |
| `icon` | `string` | `''` | Lead icon |
| `selected` | `boolean` | `false` | Highlighted selection state |
| `removable` | `boolean` | `false` | Render ✕ icon on right |
| `disabled` | `boolean` | `false` | Disable interactions |
| `selectable` | `boolean` | `false` | Enable selection click behaviors |
| `label` | `string` | `''` | Chip display text |

##### Outputs
| Output | Type | Description |
|---|---|---|
| `removed` | `void` | Emitted when ✕ is clicked |
| `selectedChange` | `boolean` | Toggled selection state change |

#### SpeedDialComponent (`ngx-speed-dial`)
##### Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `items` | `SpeedDialItem[]` | **required** | Float actions list |
| `icon` | `string` | `'+'` | FAB closed icon |
| `activeIcon` | `string` | `'✕'` | FAB opened icon |
| `direction` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | Direction of menu flyouts |
| `theme` | `'primary' \| 'secondary' \| 'accent' \| 'dark'` | `'primary'` | Main FAB color theme |
| `showLabels` | `boolean` | `true` | Show button labels |
| `closeOnSelect` | `boolean` | `true` | Auto collapse after clicking a subaction item |
| `collapseOnLeaveMouse`| `boolean` | `true` | Auto collapse when mouse pointer leaves scope |

##### Outputs
| Output | Type | Description |
|---|---|---|
| `itemClick` | `SpeedDialItem` | Action item selected |

---

### Layout

#### How to Use Layout Components
```typescript
import { Component } from '@angular/core';
import { CardComponent, TabStripComponent, TabComponent, AccordionComponent, SplitterComponent } from 'ngx-core-components/layout';

@Component({
  standalone: true,
  imports: [CardComponent, TabStripComponent, TabComponent, AccordionComponent, SplitterComponent],
  template: `
    <!-- Splitter -->
    <div style="height: 300px; border: 1px solid #ddd;">
      <ngx-splitter initialSize="30%" [min]="100">
        <div pane1>Sidebar Navigator</div>
        <div pane2>
          <!-- TabStrip -->
          <ngx-tab-strip>
            <ngx-tab title="Project Info">
              <!-- Card Component -->
              <ngx-card title="Dashboard Details" variant="outlined">
                Welcome to layout dashboard.
              </ngx-card>
            </ngx-tab>
            <ngx-tab title="Settings">Settings Area</ngx-tab>
          </ngx-tab-strip>
        </div>
      </ngx-splitter>
    </div>
  `
})
export class LayoutExampleComponent {}
```

#### CardComponent (`ngx-card`)
##### Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | `''` | Header title |
| `subtitle` | `string` | `''` | Header subtitle |
| `headerIcon` | `string` | `''` | Header title icon |
| `imageUrl` | `string` | `''` | Large hero image URL |
| `imageAlt` | `string` | `''` | Alt tag description |
| `variant` | `CardVariant` | `'default'` | Visual outline style (elevated, outlined, filled) |
| `hoverable` | `boolean` | `false` | Shadow hover/lift interactive behaviors |
| `selectable` | `boolean` | `false` | Card selection active click behaviors |
| `selected` | `boolean` | `false` | Highlighted selection state |

##### Outputs
| Output | Type | Description |
|---|---|---|
| `cardClick` | `MouseEvent` | Click events (only if hoverable or selectable is active) |

#### TabStripComponent (`ngx-tab-strip`)
##### Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `position` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | Side position alignment of strip labels |

##### Outputs
| Output | Type | Description |
|---|---|---|
| `tabChange` | `number` | Active tab index changed |

#### TabComponent (`ngx-tab`)
##### Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | **required** | Tab selection title text |
| `icon` | `string` | `''` | Title prefix icon |
| `disabled` | `boolean` | `false` | Disables selecting tab |
| `badge` | `string \| number` | `''` | Text/counter badge after label |

#### AccordionComponent (`ngx-accordion`)
##### Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `items` | `AccordionItem[]` | `[]` | Content details |
| `multi` | `boolean` | `false` | Expand multiple panels simultaneously |

#### StepperComponent (`ngx-stepper`)
##### Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `steps` | `StepperStep[]` | `[]` | Workflow stage labels |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Stepper header alignment layout |
| `showContent` | `boolean` | `true` | Render inner projected content block |
| `showActions` | `boolean` | `true` | Show default Back/Next buttons |

##### Outputs
| Output | Type | Description |
|---|---|---|
| `stepChange` | `number` | Emitted when active step changes |

#### SplitterComponent (`ngx-splitter`)
##### Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Resizing splitter direction |
| `size` | `string \| number \| null` | `null` | Hardcoded programmatic size width/height of pane1 |
| `initialSize` | `string \| number` | `'50%'` | First load default split percentage |
| `min` | `number` | `60` | Min bounds constraint in pixels |

##### Outputs
| Output | Type | Description |
|---|---|---|
| `sizeChange` | `string` | Emitted during partition drag movements |

---

### Feedback

#### How to Use Feedback Components
```typescript
import { Component } from '@angular/core';
import { BadgeComponent, ProgressBarComponent, SkeletonComponent, AlertComponent, StatCardComponent } from 'ngx-core-components/feedback';
import { NotificationService } from 'ngx-core-components/feedback';

@Component({
  standalone: true,
  imports: [BadgeComponent, ProgressBarComponent, SkeletonComponent, AlertComponent, StatCardComponent],
  template: `
    <!-- Stat Card -->
    <ngx-stat-card label="Users Active" value="12,450" trend="up" trendValue="+14%" icon="👥" />

    <!-- Progress Bar -->
    <ngx-progress-bar [value]="progress" [showValue]="true" variant="success" />

    <!-- Alert -->
    <ngx-alert variant="warning" title="Warning Action" message="Process takes longer than expected." />
  `
})
export class FeedbackExampleComponent {
  progress = 75;
  constructor(private toast: NotificationService) {}

  showToast() {
    this.toast.success('Project was saved successfully!', 'Saved');
  }
}
```

#### BadgeComponent (`ngx-badge`)
##### Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `content` | `string \| number` | `''` | Label contents |
| `variant` | `BadgeVariant` | `'primary'` | Color state variants (success, danger, info, warning, dark) |
| `dot` | `boolean` | `false` | Small indicator dot mode (hides content labels) |
| `positioned` | `boolean` | `false` | Absolute corner positioning relative to parent context |
| `position` | `BadgePosition` | `'top-right'` | Corner alignments |

#### ProgressBarComponent (`ngx-progress-bar`)
##### Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `value` | `number` | `0` | Current scale |
| `min` | `number` | `0` | Min bounds |
| `max` | `number` | `100` | Max bounds |
| `label` | `string` | `''` | Descriptive header text |
| `variant` | `ProgressVariant` | `'primary'` | Theme color |
| `height` | `number` | `8` | Height height in pixels |
| `showValue` | `boolean` | `false` | Display percentage layout text |
| `indeterminate` | `boolean` | `false` | Continuous sliding animations mode (ignores values) |

#### AlertComponent (`ngx-alert`)
##### Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `variant` | `AlertVariant` | `'info'` | Theme variations (info, success, warning, error) |
| `title` | `string` | `''` | Large bold header text |
| `message` | `string` | `''` | Paragraph text |
| `dismissible` | `boolean` | `true` | Render closing ✕ button |
| `actionLabel` | `string` | `''` | CTA button label |
| `theme` | `'light' \| 'dark'` | `'light'` | Dark mode options |

##### Outputs
| Output | Type | Description |
|---|---|---|
| `dismissed` | `void` | Alert closed after transition completed |
| `actionClick` | `void` | Action button clicked |

#### NotificationService (Injectable)
##### Methods
| Method | Signature | Description |
|---|---|---|
| `success` | `(msg: string, title?: string, opts?: options): number` | Success toast |
| `error` | `(msg: string, title?: string, opts?: options): number` | Error toast |
| `info` | `(msg: string, title?: string, opts?: options): number` | Informational toast |
| `warning` | `(msg: string, title?: string, opts?: options): number` | Warning toast |

---

### Navigation

#### How to Use Navigation Components
```typescript
import { Component } from '@angular/core';
import { BreadcrumbComponent, MenuComponent, CommandPaletteComponent, ContextMenuComponent } from 'ngx-core-components/navigation';

@Component({
  standalone: true,
  imports: [BreadcrumbComponent, MenuComponent, CommandPaletteComponent, ContextMenuComponent],
  template: `
    <!-- Breadcrumb -->
    <ngx-breadcrumb [items]="breadcrumbItems" />

    <!-- Menu -->
    <ngx-menu [items]="menuItems" activeItem="Profile" />
  `
})
export class NavExampleComponent {
  breadcrumbItems = [
    { label: 'Home', url: '/' },
    { label: 'Admin', url: '/admin' },
    { label: 'System Settings' }
  ];

  menuItems = [
    { label: 'Dashboard', icon: '📊', url: '/dashboard' },
    { label: 'Settings', icon: '⚙️', children: [
        { label: 'Profile', url: '/profile' },
        { label: 'Security', url: '/security' }
      ]
    }
  ];
}
```

#### BreadcrumbComponent (`ngx-breadcrumb`)
##### Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `items` | `BreadcrumbItem[]` | `[]` | Navigation steps |
| `separator` | `string` | `'/'` | Character division indicator |

##### Outputs
| Output | Type | Description |
|---|---|---|
| `itemClick` | `BreadcrumbItem` | Emitted when link clicks are selected |

#### MenuComponent (`ngx-menu`)
##### Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `items` | `MenuItem[]` | `[]` | Multilevel navigation links |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Alignment layout |
| `activeItem` | `string` | `''` | Matching labels to highlight active link |

##### Outputs
| Output | Type | Description |
|---|---|---|
| `itemClick` | `MenuItem` | Emitted when leaf link item is clicked |

#### CommandPaletteComponent (`ngx-command-palette`)
##### Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `commands` | `CommandItem[]` | **required** | Selectable actions list |
| `placeholder` | `string` | `'Type a command or search...'` | Search input placeholder |

##### Outputs
| Output | Type | Description |
|---|---|---|
| `commandSelected` | `CommandItem` | Emitted when command action is chosen |

##### Public Methods
| Method | Signature | Description |
|---|---|---|
| `openPalette` | `(): void` | Trigger modal popup display |
| `closePalette` | `(): void` | Dismiss modal popup display |

---

### Barcodes

#### How to Use Barcodes
```typescript
import { Component } from '@angular/core';
import { BarcodeComponent, QrCodeComponent } from 'ngx-core-components/barcodes';

@Component({
  standalone: true,
  imports: [BarcodeComponent, QrCodeComponent],
  template: `
    <!-- Barcode EAN-13 -->
    <ngx-barcode value="9780201379624" label="Book Barcode" [height]="80" />

    <!-- QR Code -->
    <ngx-qrcode value="https://example.com" [size]="150" label="Scan to Visit Site" />
  `
})
export class BarcodesExampleComponent {}
```

#### BarcodeComponent (`ngx-barcode`)
##### Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | `''` | Numeric/String value encoding |
| `label` | `string` | `''` | Text displayed above |
| `height` | `number` | `60` | Height dimensions in pixels |
| `barWidth` | `number` | `2` | Single bar width in pixels |
| `foreground` | `string` | `'#000000'` | Stroke fill colors |
| `background` | `string` | `'#ffffff'` | Canvas background |

#### QrCodeComponent (`ngx-qr-code`)
##### Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | `''` | Text URL/String encoding |
| `size` | `number` | `160` | Width & height sizes in pixels |
| `label` | `string` | `''` | Header description text |
| `foreground` | `string` | `'#000000'` | Code grid point color |
| `background` | `string` | `'#ffffff'` | Grid canvas background |

---

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

---

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

---

## Demo Application

The repository includes a demo app under `projects/demo` covering live examples, how-to snippets, and API reference tables for the library components.

---

## License

MIT
