# ngx-core-components

> Angular 19+ component library — production-ready UI components built with signals, OnPush change detection, and zero runtime dependencies.

[![npm version](https://img.shields.io/npm/v/ngx-core-components.svg)](https://www.npmjs.com/package/ngx-core-components)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 🚀 Live Demo

**[https://prajaktadube.github.io/ngx-core-components/](https://prajaktadube.github.io/ngx-core-components/)**

Browse every component interactively — no install required.

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
    { id: '1', name: 'Design',      start: new Date('2026-04-01'), end: new Date('2026-04-05'), progress: 100, parentId: null, collapsed: false, isMilestone: false },
    { id: '2', name: 'Development', start: new Date('2026-04-06'), end: new Date('2026-04-15'), progress: 40,  parentId: null, collapsed: false, isMilestone: false },
  ];
}
```

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

## Theming

All components expose CSS custom properties. Example for the Gantt chart:

```css
ngx-gantt-chart {
  --ngx-gantt-bar-bg: #27ae60;
  --ngx-gantt-today-color: #e74c3c;
  --ngx-gantt-header-bg: #2c3e50;
}
```

## Local Development

```bash
# Install dependencies
npm install

# Build the library
npx ng build ngx-core-components

# Serve the demo app (hot-reload)
npx ng serve demo

# Build the demo for production
npx ng build demo --base-href /ngx-core-components/
```

## Contributing

Issues and pull requests are welcome at [github.com/prajaktadube/ngx-core-components](https://github.com/prajaktadube/ngx-core-components).

## License

MIT
