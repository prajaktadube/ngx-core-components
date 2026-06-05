# ngx-core-components

> Angular 19+ component library — production-ready UI components built with signals, OnPush change detection, and zero runtime dependencies.

[![npm version](https://img.shields.io/npm/v/ngx-core-components.svg)](https://www.npmjs.com/package/ngx-core-components)
[![CI](https://github.com/prajaktadube/ngx-core-components/actions/workflows/ci.yml/badge.svg)](https://github.com/prajaktadube/ngx-core-components/actions/workflows/ci.yml)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/ngx-core-components)](https://bundlephobia.com/package/ngx-core-components)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![StackBlitz](https://img.shields.io/badge/StackBlitz-Try_It_Live-blue?logo=stackblitz)](https://stackblitz.com/github/prajaktadube/ngx-core-components?file=projects%2Fdemo%2Fsrc%2Fapp%2Fapp.component.ts)

## 🚀 Live Demo

**[https://prajaktadube.github.io/ngx-core-components/](https://prajaktadube.github.io/ngx-core-components/)**

Browse every component interactively — no install required.

---

## 📖 Documentation

The complete, detailed API Reference tables (Inputs, Outputs, Methods, Interfaces) and "How to Use" guides for all 30+ components are available in the **[ngx-core-components Library README](projects/ngx-core-components/README.md)**.

---

## Installation

```bash
npm install ngx-core-components
```

## Components

| Entry point | Components |
|---|---|
| `ngx-core-components` | Re-exports everything below |
| `ngx-core-components/inputs` | Textbox, Dropdown, Multi-select, Autocomplete, Checkbox, Radio, Date Picker |
| `ngx-core-components/charts` | Gantt Chart, Bar Chart, Line Chart, Pie Chart, Sparkline |
| `ngx-core-components/dialog` | Dialog service + container |
| `ngx-core-components/grid` | Data Grid |

All components are **standalone** (no NgModules), use **Angular Signals**, and have **OnPush** change detection.

## Quick Start

### Gantt Chart

```typescript
import { GanttChartComponent, GanttTask } from 'ngx-core-components/charts';

@Component({
  standalone: true,
  imports: [GanttChartComponent],
  template: `
    <ngx-gantt-chart [tasks]="tasks" style="height: 400px" />
  `,
})
export class MyComponent {
  tasks: GanttTask[] = [
    { id: '1', name: 'Design', start: new Date('2026-04-01'), end: new Date('2026-04-05'), progress: 100, parentId: null, collapsed: false, isMilestone: false },
    { id: '2', name: 'Development', start: new Date('2026-04-06'), end: new Date('2026-04-15'), progress: 40,  parentId: null, collapsed: false, isMilestone: false },
  ];
}
```

*Supports advanced features like draggable glassmorphic zoom (Shift + drag), predecessor dependency linking, row virtualization, critical path calculations, and keyboard rescheduling/resizing. Refer to the [library README](projects/ngx-core-components/README.md) for full documentation.*

### Dialog

```typescript
import { DialogService } from 'ngx-core-components/dialog';

@Component({ /* ... */ })
export class MyComponent {
  constructor(private dialog: DialogService) {}

  open() {
    this.dialog.open({ title: 'Confirm', message: 'Are you sure?' });
  }
}
```

### Textbox (Reactive Forms)

```typescript
import { TextboxComponent } from 'ngx-core-components/inputs';

@Component({
  standalone: true,
  imports: [TextboxComponent, ReactiveFormsModule],
  template: `<ngx-textbox [formControl]="ctrl" label="Name" />`,
})
export class MyComponent {
  ctrl = new FormControl('');
}
```

### Structured Inputs And Layout

```typescript
import { Component, signal } from '@angular/core';
import { NumericTextBoxComponent, TimePickerComponent } from 'ngx-core-components/inputs';
import { SplitterComponent } from 'ngx-core-components/layout';

@Component({
  standalone: true,
  imports: [NumericTextBoxComponent, TimePickerComponent, SplitterComponent],
  template: `
    <ngx-numeric-textbox [value]="quantity()" [min]="0" [max]="10" (valueChange)="quantity.set($event)" />
    <ngx-time-picker [value]="meetingTime()" [use12h]="true" (timeChange)="meetingTime.set($event)" />

    <div style="height: 240px; border: 1px solid #e9ecef; overflow: hidden;">
      <ngx-splitter [size]="paneSize()" [min]="160" (sizeChange)="paneSize.set($event)">
        <div pane1>Navigation</div>
        <div pane2>Content</div>
      </ngx-splitter>
    </div>
  `,
})
export class MyComponent {
  quantity = signal(2);
  meetingTime = signal('14:30');
  paneSize = signal('35%');
}
```

`NumericTextBoxComponent` supports controlled values and keyboard stepping. `TimePickerComponent` accepts typed values like `14:30` or `2:30 PM` and emits normalized `HH:mm` output.

### List View Pagination

```typescript
import { Component, signal } from '@angular/core';
import { ListViewComponent } from 'ngx-core-components/views';

@Component({
  standalone: true,
  imports: [ListViewComponent],
  template: `
    <ngx-list-view
      [items]="people"
      [pageSize]="5"
      (pageChange)="page.set($event.page)"
    />
  `,
})
export class MyListComponent {
  page = signal(1);
  people = Array.from({ length: 20 }, (_, index) => ({ name: `Person ${index + 1}` }));
}
```

## Theming & Customization

All components expose CSS custom properties for simple Light, Dark, or custom brand integrations. Refer to **[THEMING.md](THEMING.md)** for a full list of customization tokens and theme templates.

Example:
```css
ngx-gantt-chart {
  --ngx-gantt-bar-bg: #27ae60;
  --ngx-gantt-today-color: #e74c3c;
  --ngx-gantt-header-bg: #2c3e50;
}
```

## Contributing

We welcome contributions of all kinds! Please review our **[CONTRIBUTING.md](CONTRIBUTING.md)** for complete details on setting up the workspace locally, compiling libraries, and running Karma unit tests.

Issues and pull requests are welcome at [github.com/prajaktadube/ngx-core-components](https://github.com/prajaktadube/ngx-core-components).

## License

MIT
