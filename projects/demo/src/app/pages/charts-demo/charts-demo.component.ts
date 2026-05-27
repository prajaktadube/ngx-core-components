import { Component, signal } from '@angular/core';
import {
  BarChartComponent, LineChartComponent, PieChartComponent, SparklineComponent,
  ChartSeries, ChartDataPoint, CHART_COLORS
} from 'ngx-core-components';

interface ApiRow { name: string; type: string; default: string; description: string; }

@Component({
  selector: 'app-charts-demo',
  standalone: true,
  imports: [BarChartComponent, LineChartComponent, PieChartComponent, SparklineComponent],
  template: `
    <div class="demo-page">

      <!-- Page Header -->
      <div class="page-header">
        <div class="page-header-text">
          <h1>Standard Charts</h1>
          <p>SVG-based chart components with tooltips, legends, and smooth animations. No external dependencies.
             All charts use CSS custom properties for full theming control.</p>
        </div>
        <div class="header-badges">
          <span class="badge badge-purple">SVG</span>
          <span class="badge badge-blue">Standalone</span>
          <span class="badge badge-green">Zero deps</span>
        </div>
      </div>

      <!-- TAB NAV -->
      <div class="tab-nav">
        @for (tab of tabs; track tab) {
          <button class="tab-btn" [class.active]="activeTab() === tab" (click)="activeTab.set(tab)">{{ tab }}</button>
        }
      </div>

      <!-- ===== BAR CHART ===== -->
      @if (activeTab() === 'Bar Chart') {
        <div class="tab-content">
          <div class="section-label">Live Demo</div>
          <div class="charts-grid">
            <div class="chart-card">
              <div class="chart-card-title">Multi-series grouped</div>
              <ngx-bar-chart [series]="barSeries" [categories]="months" [showLegend]="true" [showGrid]="true" [height]="240" />
            </div>
            <div class="chart-card">
              <div class="chart-card-title">Single series with value labels</div>
              <ngx-bar-chart [series]="[barSeries[0]]" [categories]="months" [showLabels]="true" [showGrid]="true" [height]="240" />
            </div>
            <div class="chart-card">
              <div class="chart-card-title">Comparison — no grid</div>
              <ngx-bar-chart [series]="barSeries" [categories]="months" [showGrid]="false" [showLegend]="true" [height]="240" />
            </div>
            <div class="chart-card">
              <div class="chart-card-title">No legend — labels on bars</div>
              <ngx-bar-chart [series]="barSeries" [categories]="months" [showLabels]="true" [showLegend]="false" [height]="240" />
            </div>
          </div>

          <div class="section-label">How to Use</div>
          <pre class="code-block">{{ barChartCode }}</pre>

          <div class="section-label">API Reference — Inputs</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of barInputs; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>

          <div class="section-label">CSS Custom Properties</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Variable</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of chartCssVars; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- ===== LINE CHART ===== -->
      @if (activeTab() === 'Line Chart') {
        <div class="tab-content">
          <div class="section-label">Live Demo</div>
          <div class="charts-grid">
            <div class="chart-card">
              <div class="chart-card-title">Multi-series with area fill</div>
              <ngx-line-chart [series]="lineSeries" [categories]="months" [showArea]="true" [showMarkers]="true" [showLegend]="true" [height]="240" />
            </div>
            <div class="chart-card">
              <div class="chart-card-title">Lines only (no area)</div>
              <ngx-line-chart [series]="lineSeries" [categories]="months" [showArea]="false" [showMarkers]="true" [showLegend]="true" [height]="240" />
            </div>
          </div>

          <div class="section-label">How to Use</div>
          <pre class="code-block">{{ lineChartCode }}</pre>

          <div class="section-label">API Reference — Inputs</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of lineInputs; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- ===== PIE CHART ===== -->
      @if (activeTab() === 'Pie / Donut') {
        <div class="tab-content">
          <div class="section-label">Live Demo</div>
          <div class="charts-grid">
            <div class="chart-card">
              <div class="chart-card-title">Pie Chart</div>
              <ngx-pie-chart [data]="pieData" [mode]="'pie'" [showLegend]="true" [showLabels]="true" [height]="260" />
            </div>
            <div class="chart-card">
              <div class="chart-card-title">Donut Chart with center label</div>
              <ngx-pie-chart [data]="pieData" [mode]="'donut'" [centerTitle]="'Revenue'" [showLegend]="true" [showLabels]="false" [height]="260" />
            </div>
          </div>

          <div class="section-label">How to Use</div>
          <pre class="code-block">{{ pieChartCode }}</pre>

          <div class="section-label">API Reference — Inputs</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of pieInputs; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- ===== SPARKLINE ===== -->
      @if (activeTab() === 'Sparkline') {
        <div class="tab-content">
          <div class="section-label">Live Demo</div>
          <div class="chart-card chart-card-full">
            <div class="chart-card-title">Inline mini charts — line, area, bar</div>
            <div class="sparkline-table">
              @for (row of sparklineRows; track row.name) {
                <div class="sl-row">
                  <span class="sl-name">{{ row.name }}</span>
                  <ngx-sparkline [data]="row.data" [type]="row.type" [color]="row.color" [width]="140" [height]="36"/>
                  <span class="sl-value">{{ row.data[row.data.length - 1] }}</span>
                  <span class="sl-trend" [class.up]="row.up" [class.down]="!row.up">{{ row.up ? '▲' : '▼' }} {{ row.change }}%</span>
                </div>
              }
            </div>
          </div>

          <div class="section-label">How to Use</div>
          <pre class="code-block">{{ sparklineCode }}</pre>

          <div class="section-label">API Reference — Inputs</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of sparklineInputs; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; height: 100%; overflow-y: auto; }
    .demo-page { padding: 24px 28px; max-width: 1100px; display: flex; flex-direction: column; gap: 20px; }

    /* Header */
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding-bottom: 16px; border-bottom: 1px solid #e9ecef; }
    .page-header-text h1 { margin: 0 0 6px; font-size: 24px; font-weight: 800; color: #1a1a2e; }
    .page-header-text p { margin: 0; font-size: 13px; color: #6c757d; line-height: 1.6; max-width: 600px; }
    .header-badges { display: flex; gap: 8px; flex-shrink: 0; }
    .badge { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 12px; }
    .badge-purple { background: #f3e8ff; color: #7c3aed; }
    .badge-blue { background: #e8f0fe; color: #1a73e8; }
    .badge-green { background: #dcfce7; color: #166534; }

    /* Tabs */
    .tab-nav { display: flex; gap: 2px; border-bottom: 2px solid #e9ecef; }
    .tab-btn { padding: 8px 18px; background: none; border: none; font-size: 13px; font-weight: 500; color: #6c757d; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; font-family: inherit; transition: all 0.12s; }
    .tab-btn:hover { color: #1a1a2e; }
    .tab-btn.active { color: #1a73e8; border-bottom-color: #1a73e8; font-weight: 600; }

    /* Tab content */
    .tab-content { display: flex; flex-direction: column; gap: 16px; }
    .section-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #adb5bd; border-bottom: 1px solid #f1f3f5; padding-bottom: 6px; }

    /* Charts */
    .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .chart-card { background: #fff; border: 1px solid #e9ecef; border-radius: 8px; padding: 16px; }
    .chart-card-full { grid-column: 1 / -1; }
    .chart-card-title { font-size: 12px; font-weight: 600; color: #6c757d; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.4px; }

    /* Sparkline table */
    .sparkline-table { display: flex; flex-direction: column; gap: 8px; }
    .sl-row { display: flex; align-items: center; gap: 16px; padding: 8px 12px; border-radius: 6px; background: #f8f9fa; }
    .sl-name { width: 120px; font-size: 13px; font-weight: 500; color: #343a40; }
    .sl-value { font-size: 14px; font-weight: 700; color: #1a1a2e; min-width: 50px; text-align: right; }
    .sl-trend { font-size: 11px; font-weight: 700; min-width: 60px; text-align: right; }
    .sl-trend.up { color: #27ae60; }
    .sl-trend.down { color: #e74c3c; }

    /* Code block */
    .code-block { background: #1e1e2e; color: #a6e3a1; border-radius: 8px; padding: 16px 20px; font-size: 12px; line-height: 1.6; overflow-x: auto; white-space: pre; font-family: 'SF Mono', Consolas, 'Liberation Mono', monospace; }

    /* API table */
    .api-table-wrap { overflow-x: auto; }
    .api-table { width: 100%; border-collapse: collapse; font-size: 12px; }
    .api-table thead th { background: #f8f9fa; font-weight: 700; color: #495057; text-align: left; padding: 10px 12px; border-bottom: 2px solid #e9ecef; text-transform: uppercase; letter-spacing: 0.3px; font-size: 11px; }
    .api-table tbody td { padding: 10px 12px; border-bottom: 1px solid #f1f3f5; color: #495057; vertical-align: top; line-height: 1.5; }
    .api-table tbody tr:last-child td { border-bottom: none; }
    .api-table tbody tr:hover td { background: #f8f9fa; }
    .api-name { color: #1a73e8 !important; font-family: monospace; font-weight: 600; white-space: nowrap; }
    .api-type { color: #8e44ad !important; font-family: monospace; white-space: nowrap; }
    .api-default { font-family: monospace; white-space: nowrap; }
  `]
})
export class ChartsDemoComponent {
  activeTab = signal('Bar Chart');
  tabs = ['Bar Chart', 'Line Chart', 'Pie / Donut', 'Sparkline'];

  months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  barSeries: ChartSeries[] = [
    { name: 'Revenue', data: [42, 58, 51, 73, 82, 76] },
    { name: 'Expenses', data: [31, 44, 38, 52, 61, 55] },
  ];

  lineSeries: ChartSeries[] = [
    { name: 'Users', data: [120, 180, 155, 220, 310, 280] },
    { name: 'Sessions', data: [200, 260, 230, 340, 420, 390] },
    { name: 'Conversions', data: [30, 52, 44, 61, 88, 74] },
  ];

  pieData: ChartDataPoint[] = [
    { label: 'Product A', value: 38 },
    { label: 'Product B', value: 27 },
    { label: 'Product C', value: 19 },
    { label: 'Product D', value: 11 },
    { label: 'Other', value: 5 },
  ];

  sparklineRows = [
    { name: 'Page Views', data: [120,145,130,168,190,176,210], type: 'line' as const, color: '#4a90d9', up: true, change: 14 },
    { name: 'Revenue ($)', data: [3200,2900,3400,3100,3800,4100,3950], type: 'area' as const, color: '#27ae60', up: true, change: 8 },
    { name: 'Bounce Rate', data: [48,51,44,47,43,46,42], type: 'bar' as const, color: '#ff6358', up: false, change: 2 },
    { name: 'Avg. Session', data: [2.1,1.9,2.3,2.0,2.4,2.6,2.5], type: 'line' as const, color: '#8e44ad', up: true, change: 5 },
  ];

  // ===== CODE SNIPPETS =====
  barChartCode = `import { BarChartComponent, ChartSeries } from 'ngx-core-components';

@Component({
  imports: [BarChartComponent],
  template: \`
    <ngx-bar-chart
      [series]="data"
      [categories]="months"
      [showLegend]="true"
      [showGrid]="true"
      [height]="300"
    />
  \`
})
export class MyComponent {
  months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  data: ChartSeries[] = [
    { name: 'Revenue', data: [42, 58, 51, 73, 82, 76] },
    { name: 'Expenses', data: [31, 44, 38, 52, 61, 55] },
  ];
}`;

  lineChartCode = `import { LineChartComponent, ChartSeries } from 'ngx-core-components';

@Component({
  imports: [LineChartComponent],
  template: \`
    <ngx-line-chart
      [series]="series"
      [categories]="months"
      [showArea]="true"
      [showMarkers]="true"
      [showLegend]="true"
      [height]="300"
    />
  \`
})
export class MyComponent {
  months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  series: ChartSeries[] = [
    { name: 'Users', data: [120, 180, 155, 220, 310, 280] },
    { name: 'Sessions', data: [200, 260, 230, 340, 420, 390] },
  ];
}`;

  pieChartCode = `import { PieChartComponent, ChartDataPoint } from 'ngx-core-components';

@Component({
  imports: [PieChartComponent],
  template: \`
    <!-- Pie mode -->
    <ngx-pie-chart [data]="data" mode="pie" [showLegend]="true" [showLabels]="true" />

    <!-- Donut mode -->
    <ngx-pie-chart [data]="data" mode="donut" centerTitle="Revenue" [showLegend]="true" />
  \`
})
export class MyComponent {
  data: ChartDataPoint[] = [
    { label: 'Product A', value: 38 },
    { label: 'Product B', value: 27 },
    { label: 'Product C', value: 19 },
    { label: 'Other', value: 16 },
  ];
}`;

  sparklineCode = `import { SparklineComponent } from 'ngx-core-components';

@Component({
  imports: [SparklineComponent],
  template: \`
    <!-- Line sparkline -->
    <ngx-sparkline [data]="trend" type="line" color="#4a90d9" [width]="120" [height]="32" />

    <!-- Area sparkline -->
    <ngx-sparkline [data]="trend" type="area" color="#27ae60" [width]="120" [height]="32" />

    <!-- Bar sparkline -->
    <ngx-sparkline [data]="trend" type="bar" color="#ff6358" [width]="120" [height]="32" />
  \`
})
export class MyComponent {
  trend = [42, 38, 55, 61, 48, 70, 66];
}`;

  // ===== API TABLES =====
  barInputs: ApiRow[] = [
    { name: 'series', type: 'ChartSeries[]', default: '[]', description: 'Array of data series. Each series has a name and an array of numeric values.' },
    { name: 'categories', type: 'string[]', default: '[]', description: 'Category labels for the X axis.' },
    { name: 'showLabels', type: 'boolean', default: 'false', description: 'Show value label on top of each bar.' },
    { name: 'showGrid', type: 'boolean', default: 'true', description: 'Show horizontal grid lines in the chart area.' },
    { name: 'showLegend', type: 'boolean', default: 'true', description: 'Show a color-coded legend below the chart.' },
    { name: 'colors', type: 'string[]', default: 'CHART_COLORS', description: 'Custom color palette. Uses the built-in 8-color palette by default.' },
    { name: 'height', type: 'number', default: '260', description: 'Chart height in pixels.' },
  ];

  lineInputs: ApiRow[] = [
    { name: 'series', type: 'ChartSeries[]', default: '[]', description: 'Array of data series. Each has a name and numeric data[] array.' },
    { name: 'categories', type: 'string[]', default: '[]', description: 'X-axis category labels.' },
    { name: 'showArea', type: 'boolean', default: 'false', description: 'Fill the area under each line with a translucent color.' },
    { name: 'showMarkers', type: 'boolean', default: 'true', description: 'Show circular data point markers on the lines.' },
    { name: 'showGrid', type: 'boolean', default: 'true', description: 'Show horizontal grid lines.' },
    { name: 'showLegend', type: 'boolean', default: 'true', description: 'Show series legend below the chart.' },
    { name: 'colors', type: 'string[]', default: 'CHART_COLORS', description: 'Custom color palette.' },
    { name: 'height', type: 'number', default: '300', description: 'Chart height in pixels.' },
  ];

  pieInputs: ApiRow[] = [
    { name: 'data', type: 'ChartDataPoint[]', default: '[]', description: 'Array of { label, value } data points for each slice.' },
    { name: 'mode', type: "'pie' | 'donut'", default: "'pie'", description: "Rendering mode. 'donut' cuts a hole in the center." },
    { name: 'donutHoleSize', type: 'number', default: '0.55', description: 'Fraction (0–1) of the radius that is cut out in donut mode.' },
    { name: 'centerTitle', type: 'string', default: "''", description: 'Text displayed in the center hole (donut mode only).' },
    { name: 'showLabels', type: 'boolean', default: 'true', description: 'Show percentage labels on each slice.' },
    { name: 'showLegend', type: 'boolean', default: 'true', description: 'Show the color-coded legend.' },
    { name: 'colors', type: 'string[]', default: 'CHART_COLORS', description: 'Custom color palette. One color per slice.' },
    { name: 'height', type: 'number', default: '300', description: 'Chart height in pixels.' },
  ];

  sparklineInputs: ApiRow[] = [
    { name: 'data', type: 'number[]', default: '[]', description: 'Array of numeric values to plot.' },
    { name: 'type', type: "'line' | 'area' | 'bar'", default: "'line'", description: 'Sparkline rendering type.' },
    { name: 'color', type: 'string', default: "'#4a90d9'", description: 'Primary color for the sparkline.' },
    { name: 'width', type: 'number', default: '100', description: 'Width in pixels.' },
    { name: 'height', type: 'number', default: '32', description: 'Height in pixels.' },
  ];

  chartCssVars: { name: string; default: string; description: string }[] = [
    { name: '--ngx-chart-bg', default: '#ffffff', description: 'Chart background color.' },
    { name: '--ngx-chart-grid', default: '#e9ecef', description: 'Grid line color.' },
    { name: '--ngx-chart-axis-text', default: '#6c757d', description: 'Axis label text color.' },
    { name: '--ngx-chart-tooltip-bg', default: '#1e1e1e', description: 'Tooltip background.' },
    { name: '--ngx-chart-tooltip-color', default: '#fff', description: 'Tooltip text color.' },
  ];
}
