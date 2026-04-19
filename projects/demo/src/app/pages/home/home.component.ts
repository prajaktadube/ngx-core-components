import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface ComponentCard {
  icon: string;
  title: string;
  description: string;
  route: string;
  tag: string;
  tagColor: string;
  features: string[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="home-page">

      <!-- Hero -->
      <div class="hero">
        <div class="hero-badge">Angular 19 · 20 · 21 · Standalone · Zero Dependencies</div>
        <h1 class="hero-title">ngx-core-components</h1>
        <p class="hero-subtitle">
          A production-ready UI component library for Angular 19, 20, and 21.
          Built with signals, OnPush change detection, and CSS custom properties for full theming control.
        </p>
        <div class="hero-actions">
          <a class="btn-primary" routerLink="/getting-started">Get Started</a>
          <a class="btn-secondary" routerLink="/charts">View Components</a>
        </div>
        <div class="hero-stats">
          <div class="stat"><span class="stat-num">14+</span><span class="stat-label">Components</span></div>
          <div class="stat-div"></div>
          <div class="stat"><span class="stat-num">0</span><span class="stat-label">Dependencies</span></div>
          <div class="stat-div"></div>
          <div class="stat"><span class="stat-num">100%</span><span class="stat-label">Standalone</span></div>
          <div class="stat-div"></div>
          <div class="stat"><span class="stat-num">CSS</span><span class="stat-label">Themeable</span></div>
        </div>
      </div>

      <!-- Install -->
      <div class="install-section">
        <div class="install-card">
          <div class="install-label">Install</div>
          <pre class="install-code">npm install ngx-core-components</pre>
        </div>
        <div class="install-card">
          <div class="install-label">Import (standalone)</div>
          <pre class="install-code">import &#123; BarChartComponent &#125; from 'ngx-core-components';

&#64;Component(&#123;
  imports: [BarChartComponent],
  template: &#96;&lt;ngx-bar-chart [series]="data" /&gt;&#96;
&#125;)</pre>
        </div>
      </div>

      <!-- Component Cards -->
      <div class="section-title">All Components</div>
      <div class="cards-grid">
        @for (card of componentCards; track card.title) {
          <a class="component-card" [routerLink]="card.route">
            <div class="card-icon">{{ card.icon }}</div>
            <div class="card-body">
              <div class="card-header-row">
                <span class="card-title">{{ card.title }}</span>
                <span class="card-tag" [style.background]="card.tagColor + '22'" [style.color]="card.tagColor">{{ card.tag }}</span>
              </div>
              <p class="card-desc">{{ card.description }}</p>
              <div class="card-features">
                @for (f of card.features; track f) {
                  <span class="feature-chip">{{ f }}</span>
                }
              </div>
            </div>
          </a>
        }
      </div>

      <!-- Features Section -->
      <div class="section-title">Why ngx-core-components?</div>
      <div class="features-grid">
        @for (feat of features; track feat.title) {
          <div class="feature-card">
            <div class="feature-icon">{{ feat.icon }}</div>
            <div class="feature-title">{{ feat.title }}</div>
            <div class="feature-desc">{{ feat.desc }}</div>
          </div>
        }
      </div>

      <!-- Quick Start Code -->
      <div class="section-title">Quick Start Example</div>
      <div class="quickstart-grid">
        @for (ex of quickStartExamples; track ex.title) {
          <div class="qs-card">
            <div class="qs-title">{{ ex.title }}</div>
            <pre class="code-block">{{ ex.code }}</pre>
          </div>
        }
      </div>

      <!-- Footer -->
      <div class="home-footer">
        <span>ngx-core-components · MIT License · Angular 19 · 20 · 21 · Built with ❤️</span>
      </div>

    </div>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; height: 100%; overflow-y: auto; }
    .home-page { padding: 32px 40px; max-width: 1200px; margin: 0 auto; width: 100%; box-sizing: border-box; }

    /* Hero */
    .hero { text-align: center; padding: 48px 0 40px; }
    .hero-badge {
      display: inline-block; background: #e8f0fe; color: #1a73e8;
      font-size: 11px; font-weight: 700; letter-spacing: 0.5px;
      padding: 5px 14px; border-radius: 20px; margin-bottom: 20px; text-transform: uppercase;
    }
    .hero-title { margin: 0 0 16px; font-size: 42px; font-weight: 800; color: #1a1a2e; letter-spacing: -1px; }
    .hero-subtitle { margin: 0 auto 28px; max-width: 640px; font-size: 16px; color: #6c757d; line-height: 1.6; }
    .hero-actions { display: flex; gap: 12px; justify-content: center; margin-bottom: 36px; }
    .btn-primary {
      padding: 11px 28px; background: #1a73e8; color: #fff; border-radius: 6px;
      text-decoration: none; font-size: 14px; font-weight: 600; transition: background 0.15s;
    }
    .btn-primary:hover { background: #1558b0; }
    .btn-secondary {
      padding: 11px 28px; background: #fff; color: #1a73e8; border: 1px solid #ced4da;
      border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600;
    }
    .btn-secondary:hover { background: #f1f3f5; }
    .hero-stats { display: flex; gap: 0; justify-content: center; align-items: center; }
    .stat { text-align: center; padding: 0 24px; }
    .stat-num { display: block; font-size: 24px; font-weight: 800; color: #1a1a2e; }
    .stat-label { font-size: 12px; color: #6c757d; }
    .stat-div { width: 1px; height: 40px; background: #dee2e6; }

    /* Install */
    .install-section { display: grid; grid-template-columns: auto 1fr; gap: 16px; margin-bottom: 40px; }
    .install-card { background: #1e1e1e; border-radius: 8px; padding: 16px 20px; }
    .install-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 8px; font-weight: 700; }
    .install-code { margin: 0; color: #d4d4d4; font-family: 'Cascadia Code', Consolas, monospace; font-size: 13px; white-space: pre; }

    /* Cards */
    .section-title { font-size: 20px; font-weight: 700; color: #1a1a2e; margin: 0 0 20px; padding-top: 8px; border-top: 1px solid #e9ecef; }
    .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; margin-bottom: 40px; }
    .component-card {
      background: #fff; border: 1px solid #e9ecef; border-radius: 10px; padding: 20px;
      text-decoration: none; display: flex; gap: 16px; transition: all 0.15s;
    }
    .component-card:hover { border-color: #1a73e8; box-shadow: 0 4px 16px rgba(26,115,232,0.12); transform: translateY(-1px); }
    .card-icon { font-size: 28px; flex-shrink: 0; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background: #f8f9fa; border-radius: 8px; }
    .card-body { flex: 1; min-width: 0; }
    .card-header-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
    .card-title { font-size: 15px; font-weight: 700; color: #1a1a2e; }
    .card-tag { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 10px; text-transform: uppercase; letter-spacing: 0.4px; }
    .card-desc { margin: 0 0 10px; font-size: 13px; color: #6c757d; line-height: 1.5; }
    .card-features { display: flex; flex-wrap: wrap; gap: 6px; }
    .feature-chip { background: #f1f3f5; color: #495057; font-size: 11px; padding: 2px 8px; border-radius: 10px; }

    /* Features */
    .features-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; margin-bottom: 40px; }
    .feature-card { background: #fff; border: 1px solid #e9ecef; border-radius: 10px; padding: 20px; }
    .feature-icon { font-size: 24px; margin-bottom: 10px; }
    .feature-title { font-size: 14px; font-weight: 700; color: #1a1a2e; margin-bottom: 6px; }
    .feature-desc { font-size: 13px; color: #6c757d; line-height: 1.5; }

    /* Quick Start */
    .quickstart-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 16px; margin-bottom: 40px; }
    .qs-card { background: #1e1e1e; border-radius: 8px; padding: 20px; }
    .qs-title { font-size: 12px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 12px; }
    .code-block { margin: 0; color: #d4d4d4; font-family: 'Cascadia Code', Consolas, monospace; font-size: 12px; white-space: pre; overflow-x: auto; }

    /* Footer */
    .home-footer { text-align: center; padding: 32px 0 16px; color: #adb5bd; font-size: 12px; border-top: 1px solid #e9ecef; margin-top: 8px; }
  `]
})
export class HomeComponent {

  componentCards: ComponentCard[] = [
    {
      icon: '📊',
      title: 'Bar Chart',
      description: 'SVG-based vertical/horizontal bar chart. Supports grouped and stacked modes with tooltips.',
      route: '/charts',
      tag: 'Charts',
      tagColor: '#8e44ad',
      features: ['Grouped', 'Stacked', 'Tooltip', 'Legend', 'Grid lines'],
    },
    {
      icon: '📈',
      title: 'Line Chart',
      description: 'Multi-series smooth bezier line chart with optional area fill and crosshair tooltip.',
      route: '/charts',
      tag: 'Charts',
      tagColor: '#8e44ad',
      features: ['Multi-series', 'Area fill', 'Markers', 'Crosshair'],
    },
    {
      icon: '🥧',
      title: 'Pie / Donut Chart',
      description: 'SVG arc-based pie chart with donut mode, center text, hover highlights and legend.',
      route: '/charts',
      tag: 'Charts',
      tagColor: '#8e44ad',
      features: ['Pie + Donut', 'Center label', 'Hover highlight', 'Labels'],
    },
    {
      icon: '⚡',
      title: 'Sparkline',
      description: 'Inline mini chart for dashboards. Supports line, area, and bar types with no axes.',
      route: '/charts',
      tag: 'Charts',
      tagColor: '#8e44ad',
      features: ['Line', 'Area', 'Bar', 'No axes', 'Inline'],
    },
    {
      icon: '✏️',
      title: 'TextBox',
      description: 'Styled text input with label, hint, error, disabled and readonly states.',
      route: '/inputs',
      tag: 'Inputs',
      tagColor: '#27ae60',
      features: ['Label', 'Hint', 'Error state', 'Readonly', 'Disabled'],
    },
    {
      icon: '🔽',
      title: 'Dropdown',
      description: 'Custom-rendered dropdown with filtering, keyboard navigation, and accessibility.',
      route: '/inputs',
      tag: 'Inputs',
      tagColor: '#27ae60',
      features: ['Filterable', 'Keyboard nav', 'Disabled', 'Custom options'],
    },
    {
      icon: '📅',
      title: 'DatePicker',
      description: 'Date input with calendar popup, prev/next navigation, min/max constraints.',
      route: '/inputs',
      tag: 'Inputs',
      tagColor: '#27ae60',
      features: ['Calendar popup', 'Min/Max', 'Today highlight', 'Format'],
    },
    {
      icon: '☑️',
      title: 'MultiSelect',
      description: 'Dropdown with checkboxes, removable tag chips, Select All, and built-in filtering.',
      route: '/inputs',
      tag: 'Inputs',
      tagColor: '#27ae60',
      features: ['Tag chips', 'Select All', 'Filterable', 'Max tags'],
    },
    {
      icon: '🗂️',
      title: 'Data Grid',
      description: 'Full-featured HTML table with client-side sorting, column filtering, pagination and row selection.',
      route: '/grid',
      tag: 'Data',
      tagColor: '#e67e22',
      features: ['Sort', 'Filter', 'Paginate', 'Selection', 'Striped', 'Loading'],
    },
    {
      icon: '🌳',
      title: 'Tree View',
      description: 'Collapsible tree with indent guides, chevron toggles, checkboxes, and selection support.',
      route: '/tree-list',
      tag: 'Data',
      tagColor: '#e67e22',
      features: ['Expand/Collapse', 'Checkboxes', 'Icons', 'Selectable'],
    },
    {
      icon: '📋',
      title: 'List View',
      description: 'Scrollable list with single/multi selection and custom item templates via ng-template.',
      route: '/tree-list',
      tag: 'Data',
      tagColor: '#e67e22',
      features: ['Custom template', 'Multi-select', 'Loading', 'Header/Footer'],
    },
    {
      icon: '💬',
      title: 'Tooltip & Popover',
      description: 'Tooltip directive for hover hints (4 positions) and Popover component for rich click overlays.',
      route: '/tooltip',
      tag: 'Overlay',
      tagColor: '#c0392b',
      features: ['4 positions', 'Auto-flip', 'Rich content', 'Click trigger'],
    },
    {
      icon: '📅',
      title: 'Gantt Chart',
      description: 'Full-featured project timeline with drag-and-drop, dependencies, milestones and zoom.',
      route: '/basic',
      tag: 'Charts',
      tagColor: '#8e44ad',
      features: ['Drag & Drop', 'Dependencies', 'Milestones', 'Zoom', 'Keyboard'],
    },
  ];

  features = [
    {
      icon: '⚡',
      title: 'Angular Signals',
      desc: 'All inputs use the new signal-based input() / output() API. Full OnPush compatibility.',
    },
    {
      icon: '🎨',
      title: 'CSS Custom Properties',
      desc: 'Every component exposes --ngx-* CSS variables for complete theme control without overrides.',
    },
    {
      icon: '📦',
      title: 'Zero Runtime Dependencies',
      desc: 'No third-party chart libs, no CDK. Pure Angular with native DOM APIs only.',
    },
    {
      icon: '🧩',
      title: 'Standalone Components',
      desc: 'Import exactly what you need. No NgModule required. Tree-shaking friendly.',
    },
    {
      icon: '♿',
      title: 'Accessible',
      desc: 'ARIA attributes, keyboard navigation, and focus management built in.',
    },
    {
      icon: '🔄',
      title: 'Unidirectional Data Flow',
      desc: 'All inputs emit events — the parent owns state. No two-way binding side effects.',
    },
  ];

  quickStartExamples = [
    {
      title: 'Bar Chart',
      code: `import { BarChartComponent, ChartSeries } from 'ngx-core-components';

@Component({
  imports: [BarChartComponent],
  template: \`
    <ngx-bar-chart
      [series]="data"
      [categories]="months"
      [showLegend]="true"
      [height]="300"
    />
  \`
})
export class MyComponent {
  months = ['Jan', 'Feb', 'Mar', 'Apr'];
  data: ChartSeries[] = [
    { name: 'Revenue', data: [42, 58, 51, 73] },
    { name: 'Expenses', data: [31, 44, 38, 52] },
  ];
}`,
    },
    {
      title: 'Data Grid',
      code: `import { DataGridComponent, GridColumnDef } from 'ngx-core-components';

@Component({
  imports: [DataGridComponent],
  template: \`
    <ngx-data-grid
      [data]="rows"
      [columns]="columns"
      [pageSize]="10"
      [selectable]="true"
      (rowClick)="onRowClick($event)"
    />
  \`
})
export class MyComponent {
  columns: GridColumnDef[] = [
    { field: 'name', title: 'Name', sortable: true, filterable: true },
    { field: 'email', title: 'Email', filterable: true },
    { field: 'status', title: 'Status', sortable: true },
  ];
  rows = [...]; // your data
}`,
    },
    {
      title: 'Dropdown',
      code: `import { DropdownComponent, DropdownOption } from 'ngx-core-components';

@Component({
  imports: [DropdownComponent],
  template: \`
    <ngx-dropdown
      [options]="options"
      [value]="selected()"
      label="Country"
      placeholder="Select..."
      [filterable]="true"
      (valueChange)="selected.set($event)"
    />
    <p>Selected: {{ selected() }}</p>
  \`
})
export class MyComponent {
  selected = signal<unknown>(null);
  options: DropdownOption[] = [
    { label: 'United States', value: 'us' },
    { label: 'Germany', value: 'de' },
  ];
}`,
    },
    {
      title: 'Tooltip & Popover',
      code: `import { TooltipDirective, PopoverComponent } from 'ngx-core-components';

@Component({
  imports: [TooltipDirective, PopoverComponent],
  template: \`
    <!-- Tooltip (hover) -->
    <button [ngxTooltip]="'Save document'"
            tooltipPosition="top">
      Save
    </button>

    <!-- Popover (click) -->
    <ngx-popover title="User Info" position="bottom">
      <button popoverTrigger>View Details</button>
      <div popoverBody>
        <p>Rich content here.</p>
      </div>
    </ngx-popover>
  \`
})
export class MyComponent {}`,
    },
  ];
}
