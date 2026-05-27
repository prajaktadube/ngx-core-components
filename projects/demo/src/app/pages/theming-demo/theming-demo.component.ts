import { Component, signal, computed } from '@angular/core';
import {
  BarChartComponent, LineChartComponent, PieChartComponent, ChartSeries, ChartDataPoint,
  TextBoxComponent, DropdownComponent, DropdownOption,
  DataGridComponent, GridColumnDef,
  TreeViewComponent, TreeNode,
  TooltipDirective, PopoverComponent,
  GanttChartComponent, GanttTask, GanttDependency, GanttConfig, ZoomLevel, GanttTaskChangeEvent,
} from 'ngx-core-components';
import { getSampleTasks, getSampleDependencies } from '../../data/sample-tasks';

interface CssVar { name: string; value: string; type: 'color' | 'text'; label: string; }
interface ThemePreset { name: string; accent: string; vars: Record<string, string>; }
interface ApiRow { name: string; type: string; default: string; description: string; }

@Component({
  selector: 'app-theming-demo',
  standalone: true,
  imports: [
    BarChartComponent, LineChartComponent, PieChartComponent,
    TextBoxComponent, DropdownComponent,
    DataGridComponent,
    TreeViewComponent,
    TooltipDirective, PopoverComponent,
    GanttChartComponent,
  ],
  template: `
    <div class="theming-page">

      <!-- Page Header -->
      <div class="page-header">
        <div class="page-header-text">
          <h1>Theming</h1>
          <p>Every component exposes CSS custom properties (<code>--ngx-*</code>) for full visual control.
             Select a global preset below, or switch tabs to customise each component individually.</p>
        </div>
        <div class="header-badges">
          <span class="badge badge-purple">CSS Variables</span>
          <span class="badge badge-blue">No overrides</span>
        </div>
      </div>

      <!-- Global presets -->
      <div class="preset-bar">
        <span class="preset-label">Global theme preset:</span>
        @for (p of presets; track p.name) {
          <button class="preset-btn"
            [class.active]="activePreset() === p.name"
            [style.border-color]="activePreset() === p.name ? p.accent : ''"
            [style.color]="activePreset() === p.name ? p.accent : ''"
            (click)="applyPreset(p)">
            <span class="preset-dot" [style.background]="p.accent"></span>
            {{ p.name }}
          </button>
        }
      </div>

      <!-- Tab nav -->
      <div class="tab-nav">
        @for (tab of tabs; track tab.id) {
          <button class="tab-btn" [class.active]="activeTab() === tab.id" (click)="activeTab.set(tab.id)">
            {{ tab.icon }} {{ tab.label }}
          </button>
        }
      </div>

      <!-- ===== CHARTS ===== -->
      @if (activeTab() === 'charts') {
        <div class="tab-content">
          <div class="preview-panel">
            <div class="preview-title">Live Preview</div>
            <div class="preview-area" #chartPreview>
              <div class="preview-grid-2">
                <div class="preview-card">
                  <div class="preview-card-label">Bar Chart</div>
                  <ngx-bar-chart [series]="barSeries" [categories]="months" [showLegend]="true" [showGrid]="true" [height]="180" />
                </div>
                <div class="preview-card">
                  <div class="preview-card-label">Line Chart</div>
                  <ngx-line-chart [series]="lineSeries" [categories]="months" [showArea]="true" [showLegend]="true" [height]="180" />
                </div>
                <div class="preview-card">
                  <div class="preview-card-label">Pie Chart</div>
                  <ngx-pie-chart [data]="pieData" mode="pie" [showLegend]="true" [height]="180" />
                </div>
                <div class="preview-card">
                  <div class="preview-card-label">Donut Chart</div>
                  <ngx-pie-chart [data]="pieData" mode="donut" centerTitle="Revenue" [showLegend]="true" [height]="180" />
                </div>
              </div>
            </div>
          </div>
          <div class="vars-panel">
            <div class="vars-title">CSS Custom Properties</div>
            @for (v of chartVars(); track v.name) {
              <div class="var-row">
                <label class="var-name" [title]="v.name">{{ v.name }}</label>
                @if (v.type === 'color') {
                  <input type="color" class="color-swatch" [value]="v.value"
                    (input)="updateVar('charts', v.name, $any($event.target).value)" />
                } @else {
                  <input type="text" class="text-swatch" [value]="v.value"
                    (change)="updateVar('charts', v.name, $any($event.target).value)" />
                }
                <span class="var-val">{{ v.value }}</span>
              </div>
            }
            <div class="vars-usage">
              <div class="usage-title">Usage</div>
              <pre class="mini-code">ngx-bar-chart, ngx-line-chart,
ngx-pie-chart, ngx-sparkline &#123;
  --ngx-chart-bg: #ffffff;
  --ngx-chart-axis: #ced4da;
  --ngx-chart-axis-text: #6c757d;
  --ngx-chart-grid: #e9ecef;
  --ngx-chart-tooltip-bg: #1e1e1e;
&#125;</pre>
            </div>
          </div>
        </div>
      }

      <!-- ===== INPUTS ===== -->
      @if (activeTab() === 'inputs') {
        <div class="tab-content">
          <div class="preview-panel">
            <div class="preview-title">Live Preview</div>
            <div class="preview-area">
              <div class="preview-inputs">
                <ngx-textbox value="" label="Full Name" placeholder="Enter your name" hint="Required field" />
                <ngx-textbox value="" label="Email" type="email" placeholder="user@example.com" error="Invalid email format" />
                <ngx-textbox value="Read only value" label="Read Only" [readonly]="true" />
                <ngx-textbox value="" label="Disabled" [disabled]="true" placeholder="Disabled" />
                <ngx-dropdown [options]="dropdownOptions" [value]="null" label="Country" placeholder="Select a country..." />
                <ngx-dropdown [options]="dropdownOptions" [value]="null" label="Filterable" [filterable]="true" placeholder="Search..." />
              </div>
            </div>
          </div>
          <div class="vars-panel">
            <div class="vars-title">CSS Custom Properties</div>
            @for (v of inputVars(); track v.name) {
              <div class="var-row">
                <label class="var-name" [title]="v.name">{{ v.name }}</label>
                @if (v.type === 'color') {
                  <input type="color" class="color-swatch" [value]="v.value"
                    (input)="updateVar('inputs', v.name, $any($event.target).value)" />
                } @else {
                  <input type="text" class="text-swatch" [value]="v.value"
                    (change)="updateVar('inputs', v.name, $any($event.target).value)" />
                }
                <span class="var-val">{{ v.value }}</span>
              </div>
            }
            <div class="vars-usage">
              <div class="usage-title">Usage</div>
              <pre class="mini-code">ngx-textbox, ngx-dropdown,
ngx-date-picker, ngx-multi-select,
ngx-checkbox, ngx-radio-group,
ngx-autocomplete &#123;
  --ngx-input-bg: #ffffff;
  --ngx-input-border: #ced4da;
  --ngx-input-text: #212529;
  --ngx-input-label: #495057;
  --ngx-input-focus: #1a73e8;
  --ngx-input-error: #e74c3c;
  --ngx-input-radius: 4px;
&#125;</pre>
            </div>
          </div>
        </div>
      }

      <!-- ===== GRID ===== -->
      @if (activeTab() === 'grid') {
        <div class="tab-content">
          <div class="preview-panel">
            <div class="preview-title">Live Preview</div>
            <div class="preview-area">
              <ngx-data-grid [data]="gridRows" [columns]="gridCols" [pageSize]="5" [striped]="true" [selectable]="true" />
            </div>
          </div>
          <div class="vars-panel">
            <div class="vars-title">CSS Custom Properties</div>
            @for (v of gridVars(); track v.name) {
              <div class="var-row">
                <label class="var-name" [title]="v.name">{{ v.name }}</label>
                <input type="color" class="color-swatch" [value]="v.value"
                  (input)="updateVar('grid', v.name, $any($event.target).value)" />
                <span class="var-val">{{ v.value }}</span>
              </div>
            }
            <div class="vars-usage">
              <div class="usage-title">Usage</div>
              <pre class="mini-code">ngx-data-grid &#123;
  --ngx-grid-header-bg: #f8f9fa;
  --ngx-grid-border: #dee2e6;
  --ngx-grid-hover-bg: #f1f3f5;
  --ngx-grid-selected-bg: #e8f0fe;
  --ngx-grid-stripe-bg: #f8f9fa;
&#125;</pre>
            </div>
          </div>
        </div>
      }

      <!-- ===== TREE & LIST ===== -->
      @if (activeTab() === 'tree') {
        <div class="tab-content">
          <div class="preview-panel">
            <div class="preview-title">Live Preview</div>
            <div class="preview-area">
              <div style="max-height:320px; border:1px solid var(--ngx-tree-border,#e9ecef); border-radius:6px; overflow:hidden;">
                <ngx-tree-view [nodes]="treeNodes" [selectable]="true" />
              </div>
            </div>
          </div>
          <div class="vars-panel">
            <div class="vars-title">CSS Custom Properties</div>
            @for (v of treeVars(); track v.name) {
              <div class="var-row">
                <label class="var-name" [title]="v.name">{{ v.name }}</label>
                <input type="color" class="color-swatch" [value]="v.value"
                  (input)="updateVar('tree', v.name, $any($event.target).value)" />
                <span class="var-val">{{ v.value }}</span>
              </div>
            }
            <div class="vars-usage">
              <div class="usage-title">Usage</div>
              <pre class="mini-code">ngx-tree-view &#123;
  --ngx-tree-hover-bg: #f1f3f5;
  --ngx-tree-selected-bg: #e8f0fe;
  --ngx-tree-selected-color: #1a73e8;
  --ngx-tree-border: #e9ecef;
&#125;

ngx-list-view &#123;
  --ngx-list-hover-bg: #f1f3f5;
  --ngx-list-selected-bg: #e8f0fe;
  --ngx-list-border: #e9ecef;
&#125;</pre>
            </div>
          </div>
        </div>
      }

      <!-- ===== TOOLTIP ===== -->
      @if (activeTab() === 'tooltip') {
        <div class="tab-content">
          <div class="preview-panel">
            <div class="preview-title">Live Preview</div>
            <div class="preview-area">
              <div class="tooltip-preview-row">
                <button class="demo-btn" [ngxTooltip]="'Tooltip on top'" tooltipPosition="top">Top</button>
                <button class="demo-btn" [ngxTooltip]="'Tooltip on bottom'" tooltipPosition="bottom">Bottom</button>
                <button class="demo-btn" [ngxTooltip]="'Tooltip on left'" tooltipPosition="left">Left</button>
                <button class="demo-btn" [ngxTooltip]="'Tooltip on right'" tooltipPosition="right">Right</button>
              </div>
              <div style="margin-top:20px;">
                <ngx-popover title="Popover Demo" position="bottom">
                  <button class="demo-btn" popoverTrigger>Open Popover ▾</button>
                  <div popoverBody>
                    <p style="margin:0;font-size:13px;">Popover body content here.</p>
                  </div>
                </ngx-popover>
              </div>
            </div>
          </div>
          <div class="vars-panel">
            <div class="vars-title">CSS Custom Properties</div>
            @for (v of tooltipVars(); track v.name) {
              <div class="var-row">
                <label class="var-name" [title]="v.name">{{ v.name }}</label>
                <input type="color" class="color-swatch" [value]="v.value"
                  (input)="updateVar('tooltip', v.name, $any($event.target).value)" />
                <span class="var-val">{{ v.value }}</span>
              </div>
            }
            <div class="vars-usage">
              <div class="usage-title">Usage</div>
              <pre class="mini-code">/* Global or per-host */
:root &#123;
  --ngx-tooltip-bg: #1e1e1e;
  --ngx-tooltip-color: #ffffff;
  --ngx-popover-bg: #ffffff;
  --ngx-popover-border: #dee2e6;
  --ngx-popover-header-bg: #f8f9fa;
  --ngx-popover-shadow:
    0 4px 24px rgba(0,0,0,0.12);
&#125;</pre>
            </div>
          </div>
        </div>
      }

      <!-- ===== GANTT ===== -->
      @if (activeTab() === 'gantt') {
        <div class="tab-content gantt-tab">
          <div class="preview-panel gantt-preview">
            <div class="preview-title">Live Preview</div>
            <div class="gantt-area">
              <ngx-gantt-chart
                [tasks]="ganttTasks"
                [dependencies]="ganttDeps"
                [config]="ganttConfig"
                (taskChange)="onTaskChange($event)"
              />
            </div>
          </div>
          <div class="vars-panel">
            <div class="vars-title">CSS Custom Properties</div>
            @for (v of ganttVars(); track v.name) {
              <div class="var-row">
                <label class="var-name" [title]="v.name">{{ v.name }}</label>
                <input type="color" class="color-swatch" [value]="v.value"
                  (input)="updateVar('gantt', v.name, $any($event.target).value)" />
                <span class="var-val">{{ v.value }}</span>
              </div>
            }
          </div>
        </div>
      }

      <!-- ===== GENERATED CSS OUTPUT ===== -->
      <div class="css-output-panel">
        <div class="css-output-header">
          <div>
            <div class="css-output-title">How to Use</div>
            <div class="css-output-subtitle">1) Pick a preset or tweak variables in tabs, 2) copy the generated CSS, 3) paste it into <code>styles.scss</code> (global) or a scoped host selector.</div>
          </div>
        </div>
      </div>

      <div class="css-output-panel">
        <div class="css-output-header">
          <div>
            <div class="css-output-title">API Reference</div>
            <div class="css-output-subtitle">Theme groups map CSS variable prefixes to the component selectors shown in each tab.</div>
          </div>
        </div>
        <div class="api-table-wrap">
          <table class="api-table">
            <thead><tr><th>Theme Group</th><th>Selectors</th><th>Primary Variables</th><th>Description</th></tr></thead>
            <tbody>
              @for (row of themeGroupApi; track row.name) {
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
      </div>

      <!-- ===== GENERATED CSS OUTPUT ===== -->
      <div class="css-output-panel">
        <div class="css-output-header">
          <div>
            <div class="css-output-title">Generated CSS</div>
            <div class="css-output-subtitle">Copy this into your <code>styles.scss</code> or a theme file.</div>
          </div>
          <button class="copy-btn" [class.copied]="copied()" (click)="copyGeneratedCss()">
            @if (copied()) { ✅ Copied! } @else { 📋 Copy CSS }
          </button>
        </div>
        <pre class="css-output-code">{{ generatedCss() }}</pre>
      </div>

    </div>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; height: 100%; overflow-y: auto; }
    .theming-page { padding: 24px 28px; max-width: 1200px; display: flex; flex-direction: column; gap: 20px; }

    /* Header */
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding-bottom: 16px; border-bottom: 1px solid #e9ecef; }
    .page-header-text h1 { margin: 0 0 6px; font-size: 24px; font-weight: 800; color: #1a1a2e; }
    .page-header-text p { margin: 0; font-size: 13px; color: #6c757d; line-height: 1.6; max-width: 600px; }
    .page-header-text code { background: #f1f3f5; padding: 1px 6px; border-radius: 3px; font-size: 12px; font-family: monospace; color: #e74c3c; }
    .header-badges { display: flex; gap: 8px; flex-shrink: 0; }
    .badge { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 12px; }
    .badge-purple { background: #f3e8ff; color: #7c3aed; }
    .badge-blue { background: #e8f0fe; color: #1a73e8; }

    /* Preset bar */
    .preset-bar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; padding: 12px 16px; background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; }
    .preset-label { font-size: 12px; font-weight: 600; color: #6c757d; flex-shrink: 0; }
    .preset-btn {
      display: flex; align-items: center; gap: 6px; padding: 6px 14px;
      background: #fff; border: 1px solid #dee2e6; border-radius: 20px;
      font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; color: #495057;
      transition: all 0.12s;
    }
    .preset-btn:hover { border-color: #adb5bd; }
    .preset-btn.active { background: #fff; font-weight: 700; }
    .preset-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

    /* Tabs */
    .tab-nav { display: flex; gap: 2px; border-bottom: 2px solid #e9ecef; }
    .tab-btn { padding: 8px 16px; background: none; border: none; font-size: 13px; font-weight: 500; color: #6c757d; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; font-family: inherit; transition: all 0.12s; }
    .tab-btn:hover { color: #1a1a2e; }
    .tab-btn.active { color: #1a73e8; border-bottom-color: #1a73e8; font-weight: 600; }

    /* Tab content layout */
    .tab-content { display: grid; grid-template-columns: 1fr 280px; gap: 16px; align-items: start; }
    .tab-content.gantt-tab { grid-template-columns: 1fr 280px; }

    /* Preview panel */
    .preview-panel { background: #fff; border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden; }
    .preview-title, .vars-title { padding: 10px 16px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #adb5bd; border-bottom: 1px solid #f1f3f5; background: #fafbfc; }
    .preview-area { padding: 20px; }
    .preview-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .preview-card { background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 6px; padding: 12px; }
    .preview-card-label { font-size: 11px; font-weight: 600; color: #6c757d; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 8px; }
    .preview-inputs { display: flex; flex-direction: column; gap: 12px; }

    /* Tooltip preview */
    .tooltip-preview-row { display: flex; gap: 12px; flex-wrap: wrap; }
    .demo-btn { padding: 8px 16px; background: #fff; border: 1px solid #ced4da; border-radius: 4px; font-size: 13px; cursor: pointer; font-family: inherit; }
    .demo-btn:hover { background: #f1f3f5; }

    /* Gantt */
    .gantt-preview { height: 480px; display: flex; flex-direction: column; }
    .gantt-area { flex: 1; min-height: 0; overflow: hidden; }
    .gantt-area ngx-gantt-chart { height: 100%; }

    /* Vars panel */
    .vars-panel { background: #fff; border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden; }
    .var-row { display: flex; align-items: center; gap: 8px; padding: 7px 16px; border-bottom: 1px solid #f8f9fa; }
    .var-row:last-of-type { border-bottom: none; }
    .var-name { font-size: 10px; font-family: monospace; color: #6c757d; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; cursor: help; }
    .color-swatch { width: 26px; height: 20px; border: 1px solid #dee2e6; border-radius: 3px; padding: 0; cursor: pointer; background: none; flex-shrink: 0; }
    .text-swatch { width: 60px; height: 20px; border: 1px solid #dee2e6; border-radius: 3px; padding: 0 4px; font-size: 10px; font-family: monospace; flex-shrink: 0; background: #f8f9fa; color: #212529; }
    .var-val { font-size: 11px; font-family: monospace; color: #212529; flex-shrink: 0; width: 60px; text-align: right; }
    .vars-usage { padding: 12px 16px; border-top: 1px solid #f1f3f5; background: #fafbfc; }
    .usage-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #adb5bd; margin-bottom: 8px; }
    .mini-code { margin: 0; background: #1e1e1e; color: #d4d4d4; padding: 12px; border-radius: 6px; font-size: 11px; font-family: monospace; white-space: pre; overflow-x: auto; }

    /* Generated CSS output panel */
    .css-output-panel { background: #fff; border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden; }
    .css-output-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid #f1f3f5; background: #fafbfc; gap: 12px; }
    .css-output-title { font-size: 13px; font-weight: 700; color: #212529; }
    .css-output-subtitle { font-size: 11px; color: #6c757d; margin-top: 2px; }
    .css-output-subtitle code { background: #f1f3f5; padding: 1px 5px; border-radius: 3px; font-size: 11px; color: #e74c3c; }
    .api-table-wrap { overflow-x: auto; }
    .api-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .api-table thead tr { background: #f8f9fa; }
    .api-table th { padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #6c757d; border-bottom: 1px solid #e9ecef; }
    .api-table td { padding: 10px 14px; border-bottom: 1px solid #f1f3f5; color: #495057; vertical-align: top; }
    .api-table tbody tr:last-child td { border-bottom: none; }
    .api-name { color: #1a73e8; font-family: monospace; font-weight: 700; white-space: nowrap; }
    .api-type { color: #8e44ad; font-family: monospace; }
    .api-default { color: #ff6358; font-family: monospace; }
    .copy-btn { display: flex; align-items: center; gap: 6px; padding: 7px 14px; background: #1a73e8; color: #fff; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; transition: background 0.15s; white-space: nowrap; flex-shrink: 0; }
    .copy-btn:hover { background: #1557b0; }
    .copy-btn.copied { background: #27ae60; }
    .css-output-code { margin: 0; background: #1e2330; color: #a8d8a8; padding: 20px; font-size: 11px; font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace; white-space: pre; overflow-x: auto; max-height: 320px; overflow-y: auto; line-height: 1.7; }
  `]
})
export class ThemingDemoComponent {
  activeTab = signal('charts');
  activePreset = signal('Light');
  copied = signal(false);

  themeGroupApi: ApiRow[] = [
    { name: 'Charts', type: 'ngx-bar-chart, ngx-line-chart, ngx-pie-chart, ngx-sparkline', default: '--ngx-chart-*', description: 'Controls chart background, axes, grid lines, and tooltip colors.' },
    { name: 'Inputs', type: 'ngx-textbox, ngx-dropdown, ngx-date-picker, ngx-multi-select, ngx-checkbox, ngx-radio-group, ngx-autocomplete', default: '--ngx-input-*', description: 'Controls field surfaces, labels, focus states, hints, and validation colors.' },
    { name: 'Data Grid', type: 'ngx-data-grid', default: '--ngx-grid-*', description: 'Controls header, borders, hover rows, selected rows, and stripe backgrounds.' },
    { name: 'Tree & List', type: 'ngx-tree-view, ngx-list-view', default: '--ngx-tree-* / --ngx-list-*', description: 'Controls item hover, selected state, border, and text colors for hierarchical views.' },
    { name: 'Tooltip & Popover', type: '[ngxTooltip], ngx-popover', default: '--ngx-tooltip-* / --ngx-popover-*', description: 'Controls overlay surfaces, borders, header backgrounds, and text colors.' },
    { name: 'Gantt Chart', type: 'ngx-gantt-chart', default: '--ngx-gantt-*', description: 'Controls timeline background, bars, progress fill, grid lines, text, and today marker.' },
  ];

  tabs = [
    { id: 'charts', label: 'Charts', icon: '📊' },
    { id: 'inputs', label: 'Inputs', icon: '✏️' },
    { id: 'grid', label: 'Data Grid', icon: '🗂️' },
    { id: 'tree', label: 'Tree & List', icon: '🌳' },
    { id: 'tooltip', label: 'Tooltip', icon: '💬' },
    { id: 'gantt', label: 'Gantt Chart', icon: '📅' },
  ];

  // ===== PRESETS =====
  presets: ThemePreset[] = [
    {
      name: 'Light',
      accent: '#1a73e8',
      vars: {
        '--ngx-chart-bg': '#ffffff', '--ngx-chart-grid': '#e9ecef', '--ngx-chart-axis-text': '#6c757d', '--ngx-chart-tooltip-bg': '#1e1e1e',
        '--ngx-input-border': '#ced4da', '--ngx-input-focus': '#1a73e8', '--ngx-input-error': '#e74c3c', '--ngx-input-bg': '#ffffff', '--ngx-input-label': '#495057', '--ngx-input-hint': '#6c757d',
        '--ngx-grid-header-bg': '#f8f9fa', '--ngx-grid-border': '#dee2e6', '--ngx-grid-hover-bg': '#f1f3f5', '--ngx-grid-selected-bg': '#e8f0fe', '--ngx-grid-stripe-bg': '#f8f9fa',
        '--ngx-tree-hover-bg': '#f1f3f5', '--ngx-tree-selected-bg': '#e8f0fe', '--ngx-tree-selected-color': '#1a73e8', '--ngx-tree-border': '#e9ecef',
        '--ngx-tooltip-bg': '#1e1e1e', '--ngx-tooltip-color': '#ffffff', '--ngx-popover-bg': '#ffffff', '--ngx-popover-border': '#dee2e6', '--ngx-popover-header-bg': '#f8f9fa',
        '--ngx-gantt-bg': '#ffffff', '--ngx-gantt-border': '#dee2e6', '--ngx-gantt-bar-bg': '#4a90d9', '--ngx-gantt-bar-progress-bg': '#2d6cb4', '--ngx-gantt-header-bg': '#f1f3f5', '--ngx-gantt-today-color': '#ff6358', '--ngx-gantt-text': '#212529',
      }
    },
    {
      name: 'Crimson Coral',
      accent: '#ff6358',
      vars: {
        '--ngx-chart-bg': '#ffffff', '--ngx-chart-grid': '#e4e7eb', '--ngx-chart-axis-text': '#656565', '--ngx-chart-tooltip-bg': '#2b2b2b',
        '--ngx-input-border': '#e4e7eb', '--ngx-input-focus': '#ff6358', '--ngx-input-error': '#f3122e', '--ngx-input-bg': '#ffffff', '--ngx-input-label': '#424242', '--ngx-input-hint': '#656565',
        '--ngx-grid-header-bg': '#f4f5f7', '--ngx-grid-border': '#e4e7eb', '--ngx-grid-hover-bg': '#ebebeb', '--ngx-grid-selected-bg': '#ff63581a', '--ngx-grid-stripe-bg': '#fafafa',
        '--ngx-tree-hover-bg': '#ebebeb', '--ngx-tree-selected-bg': '#ff63581a', '--ngx-tree-selected-color': '#ff6358', '--ngx-tree-border': '#e4e7eb',
        '--ngx-tooltip-bg': '#2b2b2b', '--ngx-tooltip-color': '#ffffff', '--ngx-popover-bg': '#ffffff', '--ngx-popover-border': '#e4e7eb', '--ngx-popover-header-bg': '#f4f5f7',
        '--ngx-gantt-bg': '#ffffff', '--ngx-gantt-border': '#e4e7eb', '--ngx-gantt-bar-bg': '#ff6358', '--ngx-gantt-bar-progress-bg': '#d83a30', '--ngx-gantt-header-bg': '#f4f5f7', '--ngx-gantt-today-color': '#ff6358', '--ngx-gantt-text': '#424242',
      }
    },
    {
      name: 'Bootstrap Blue',
      accent: '#0275d8',
      vars: {
        '--ngx-chart-bg': '#ffffff', '--ngx-chart-grid': '#eceeef', '--ngx-chart-axis-text': '#55595c', '--ngx-chart-tooltip-bg': '#373a3c',
        '--ngx-input-border': '#ccc', '--ngx-input-focus': '#0275d8', '--ngx-input-error': '#d9534f', '--ngx-input-bg': '#ffffff', '--ngx-input-label': '#373a3c', '--ngx-input-hint': '#55595c',
        '--ngx-grid-header-bg': '#eceeef', '--ngx-grid-border': '#eceeef', '--ngx-grid-hover-bg': '#f7f7f9', '--ngx-grid-selected-bg': '#0275d81a', '--ngx-grid-stripe-bg': '#f7f7f9',
        '--ngx-tree-hover-bg': '#f7f7f9', '--ngx-tree-selected-bg': '#0275d81a', '--ngx-tree-selected-color': '#0275d8', '--ngx-tree-border': '#ccc',
        '--ngx-tooltip-bg': '#373a3c', '--ngx-tooltip-color': '#ffffff', '--ngx-popover-bg': '#ffffff', '--ngx-popover-border': '#eceeef', '--ngx-popover-header-bg': '#eceeef',
        '--ngx-gantt-bg': '#ffffff', '--ngx-gantt-border': '#eceeef', '--ngx-gantt-bar-bg': '#0275d8', '--ngx-gantt-bar-progress-bg': '#014c8c', '--ngx-gantt-header-bg': '#eceeef', '--ngx-gantt-today-color': '#0275d8', '--ngx-gantt-text': '#373a3c',
      }
    },
    {
      name: 'Material Indigo',
      accent: '#3f51b5',
      vars: {
        '--ngx-chart-bg': '#ffffff', '--ngx-chart-grid': '#e0e0e0', '--ngx-chart-axis-text': '#757575', '--ngx-chart-tooltip-bg': '#212121',
        '--ngx-input-border': '#e0e0e0', '--ngx-input-focus': '#3f51b5', '--ngx-input-error': '#f44336', '--ngx-input-bg': '#ffffff', '--ngx-input-label': '#212121', '--ngx-input-hint': '#757575',
        '--ngx-grid-header-bg': '#fafafa', '--ngx-grid-border': '#e0e0e0', '--ngx-grid-hover-bg': '#f5f5f5', '--ngx-grid-selected-bg': '#3f51b51a', '--ngx-grid-stripe-bg': '#fafafa',
        '--ngx-tree-hover-bg': '#f5f5f5', '--ngx-tree-selected-bg': '#3f51b51a', '--ngx-tree-selected-color': '#3f51b5', '--ngx-tree-border': '#e0e0e0',
        '--ngx-tooltip-bg': '#212121', '--ngx-tooltip-color': '#ffffff', '--ngx-popover-bg': '#ffffff', '--ngx-popover-border': '#e0e0e0', '--ngx-popover-header-bg': '#fafafa',
        '--ngx-gantt-bg': '#ffffff', '--ngx-gantt-border': '#e0e0e0', '--ngx-gantt-bar-bg': '#3f51b5', '--ngx-gantt-bar-progress-bg': '#283593', '--ngx-gantt-header-bg': '#fafafa', '--ngx-gantt-today-color': '#3f51b5', '--ngx-gantt-text': '#212121',
      }
    },
    {
      name: 'Dark',
      accent: '#5a9fd4',
      vars: {
        '--ngx-chart-bg': '#1e2330', '--ngx-chart-grid': '#2a3547', '--ngx-chart-axis-text': '#8899aa', '--ngx-chart-tooltip-bg': '#0f1520',
        '--ngx-input-border': '#2a3a5c', '--ngx-input-focus': '#5a9fd4', '--ngx-input-error': '#e94560', '--ngx-input-bg': '#16213e', '--ngx-input-label': '#a0b0c4', '--ngx-input-hint': '#6c7a8e',
        '--ngx-grid-header-bg': '#0f3460', '--ngx-grid-border': '#2a3a5c', '--ngx-grid-hover-bg': '#1f3460', '--ngx-grid-selected-bg': '#253d6e', '--ngx-grid-stripe-bg': '#1a2744',
        '--ngx-tree-hover-bg': '#1f3460', '--ngx-tree-selected-bg': '#253d6e', '--ngx-tree-selected-color': '#5a9fd4', '--ngx-tree-border': '#2a3a5c',
        '--ngx-tooltip-bg': '#0f1520', '--ngx-tooltip-color': '#e0e0e0', '--ngx-popover-bg': '#16213e', '--ngx-popover-border': '#2a3a5c', '--ngx-popover-header-bg': '#0f3460',
        '--ngx-gantt-bg': '#16213e', '--ngx-gantt-border': '#2a3a5c', '--ngx-gantt-bar-bg': '#5a9fd4', '--ngx-gantt-bar-progress-bg': '#3a7fc4', '--ngx-gantt-header-bg': '#0f3460', '--ngx-gantt-today-color': '#e94560', '--ngx-gantt-text': '#e0e0e0',
      }
    },
    {
      name: 'Ocean',
      accent: '#0077cc',
      vars: {
        '--ngx-chart-bg': '#f0f7ff', '--ngx-chart-grid': '#b3d4f0', '--ngx-chart-axis-text': '#1a3a5c', '--ngx-chart-tooltip-bg': '#003d7a',
        '--ngx-input-border': '#b3d4f0', '--ngx-input-focus': '#0077cc', '--ngx-input-error': '#cc4400', '--ngx-input-bg': '#f0f7ff', '--ngx-input-label': '#1a3a5c', '--ngx-input-hint': '#4a7a9b',
        '--ngx-grid-header-bg': '#d6eaf8', '--ngx-grid-border': '#b3d4f0', '--ngx-grid-hover-bg': '#e6f0fa', '--ngx-grid-selected-bg': '#cce5ff', '--ngx-grid-stripe-bg': '#e6f0fa',
        '--ngx-tree-hover-bg': '#e6f0fa', '--ngx-tree-selected-bg': '#cce5ff', '--ngx-tree-selected-color': '#0077cc', '--ngx-tree-border': '#b3d4f0',
        '--ngx-tooltip-bg': '#003d7a', '--ngx-tooltip-color': '#ffffff', '--ngx-popover-bg': '#f0f7ff', '--ngx-popover-border': '#b3d4f0', '--ngx-popover-header-bg': '#d6eaf8',
        '--ngx-gantt-bg': '#f0f7ff', '--ngx-gantt-border': '#b3d4f0', '--ngx-gantt-bar-bg': '#0077cc', '--ngx-gantt-bar-progress-bg': '#005fa3', '--ngx-gantt-header-bg': '#d6eaf8', '--ngx-gantt-today-color': '#0077cc', '--ngx-gantt-text': '#1a3a5c',
      }
    },
    {
      name: 'Forest',
      accent: '#27ae60',
      vars: {
        '--ngx-chart-bg': '#f0f7f0', '--ngx-chart-grid': '#b3d4b3', '--ngx-chart-axis-text': '#1a3c2a', '--ngx-chart-tooltip-bg': '#1a3c2a',
        '--ngx-input-border': '#b3d4b3', '--ngx-input-focus': '#27ae60', '--ngx-input-error': '#c0392b', '--ngx-input-bg': '#f0f7f0', '--ngx-input-label': '#1a3c2a', '--ngx-input-hint': '#4a7a5a',
        '--ngx-grid-header-bg': '#d4efdf', '--ngx-grid-border': '#b3d4b3', '--ngx-grid-hover-bg': '#e6f0e6', '--ngx-grid-selected-bg': '#c3e6cb', '--ngx-grid-stripe-bg': '#e6f0e6',
        '--ngx-tree-hover-bg': '#e6f0e6', '--ngx-tree-selected-bg': '#c3e6cb', '--ngx-tree-selected-color': '#27ae60', '--ngx-tree-border': '#b3d4b3',
        '--ngx-tooltip-bg': '#1a3c2a', '--ngx-tooltip-color': '#ffffff', '--ngx-popover-bg': '#f0f7f0', '--ngx-popover-border': '#b3d4b3', '--ngx-popover-header-bg': '#d4efdf',
        '--ngx-gantt-bg': '#f0f7f0', '--ngx-gantt-border': '#b3d4b3', '--ngx-gantt-bar-bg': '#27ae60', '--ngx-gantt-bar-progress-bg': '#1e8449', '--ngx-gantt-header-bg': '#d4efdf', '--ngx-gantt-today-color': '#27ae60', '--ngx-gantt-text': '#1a3c2a',
      }
    },
    {
      name: 'Coral',
      accent: '#e74c3c',
      vars: {
        '--ngx-chart-bg': '#fff5f5', '--ngx-chart-grid': '#f5c6cb', '--ngx-chart-axis-text': '#6c1020', '--ngx-chart-tooltip-bg': '#6c1020',
        '--ngx-input-border': '#f5c6cb', '--ngx-input-focus': '#e74c3c', '--ngx-input-error': '#c0392b', '--ngx-input-bg': '#fff5f5', '--ngx-input-label': '#6c1020', '--ngx-input-hint': '#9a3040',
        '--ngx-grid-header-bg': '#fde8e8', '--ngx-grid-border': '#f5c6cb', '--ngx-grid-hover-bg': '#fff0f0', '--ngx-grid-selected-bg': '#ffd5d5', '--ngx-grid-stripe-bg': '#fff5f5',
        '--ngx-tree-hover-bg': '#fff0f0', '--ngx-tree-selected-bg': '#ffd5d5', '--ngx-tree-selected-color': '#e74c3c', '--ngx-tree-border': '#f5c6cb',
        '--ngx-tooltip-bg': '#6c1020', '--ngx-tooltip-color': '#ffffff', '--ngx-popover-bg': '#fff5f5', '--ngx-popover-border': '#f5c6cb', '--ngx-popover-header-bg': '#fde8e8',
        '--ngx-gantt-bg': '#fff5f5', '--ngx-gantt-border': '#f5c6cb', '--ngx-gantt-bar-bg': '#e74c3c', '--ngx-gantt-bar-progress-bg': '#c0392b', '--ngx-gantt-header-bg': '#fde8e8', '--ngx-gantt-today-color': '#e74c3c', '--ngx-gantt-text': '#6c1020',
      }
    },
    {
      name: 'Violet',
      accent: '#7c3aed',
      vars: {
        '--ngx-chart-bg': '#faf5ff', '--ngx-chart-grid': '#ddd6fe', '--ngx-chart-axis-text': '#4c1d95', '--ngx-chart-tooltip-bg': '#4c1d95',
        '--ngx-input-border': '#ddd6fe', '--ngx-input-focus': '#7c3aed', '--ngx-input-error': '#dc2626', '--ngx-input-bg': '#faf5ff', '--ngx-input-label': '#4c1d95', '--ngx-input-hint': '#7e22ce',
        '--ngx-grid-header-bg': '#ede9fe', '--ngx-grid-border': '#ddd6fe', '--ngx-grid-hover-bg': '#f5f3ff', '--ngx-grid-selected-bg': '#ede9fe', '--ngx-grid-stripe-bg': '#faf5ff',
        '--ngx-tree-hover-bg': '#f5f3ff', '--ngx-tree-selected-bg': '#ede9fe', '--ngx-tree-selected-color': '#7c3aed', '--ngx-tree-border': '#ddd6fe',
        '--ngx-tooltip-bg': '#4c1d95', '--ngx-tooltip-color': '#ffffff', '--ngx-popover-bg': '#faf5ff', '--ngx-popover-border': '#ddd6fe', '--ngx-popover-header-bg': '#ede9fe',
        '--ngx-gantt-bg': '#faf5ff', '--ngx-gantt-border': '#ddd6fe', '--ngx-gantt-bar-bg': '#7c3aed', '--ngx-gantt-bar-progress-bg': '#5b21b6', '--ngx-gantt-header-bg': '#ede9fe', '--ngx-gantt-today-color': '#7c3aed', '--ngx-gantt-text': '#4c1d95',
      }
    },
    {
      name: 'Slate',
      accent: '#475569',
      vars: {
        '--ngx-chart-bg': '#f8fafc', '--ngx-chart-grid': '#cbd5e1', '--ngx-chart-axis-text': '#475569', '--ngx-chart-tooltip-bg': '#1e293b',
        '--ngx-input-border': '#cbd5e1', '--ngx-input-focus': '#475569', '--ngx-input-error': '#ef4444', '--ngx-input-bg': '#f8fafc', '--ngx-input-label': '#334155', '--ngx-input-hint': '#64748b',
        '--ngx-grid-header-bg': '#e2e8f0', '--ngx-grid-border': '#cbd5e1', '--ngx-grid-hover-bg': '#f1f5f9', '--ngx-grid-selected-bg': '#dbeafe', '--ngx-grid-stripe-bg': '#f8fafc',
        '--ngx-tree-hover-bg': '#f1f5f9', '--ngx-tree-selected-bg': '#dbeafe', '--ngx-tree-selected-color': '#3b82f6', '--ngx-tree-border': '#cbd5e1',
        '--ngx-tooltip-bg': '#1e293b', '--ngx-tooltip-color': '#f8fafc', '--ngx-popover-bg': '#f8fafc', '--ngx-popover-border': '#cbd5e1', '--ngx-popover-header-bg': '#e2e8f0',
        '--ngx-gantt-bg': '#f8fafc', '--ngx-gantt-border': '#cbd5e1', '--ngx-gantt-bar-bg': '#475569', '--ngx-gantt-bar-progress-bg': '#334155', '--ngx-gantt-header-bg': '#e2e8f0', '--ngx-gantt-today-color': '#3b82f6', '--ngx-gantt-text': '#1e293b',
      }
    },
  ];

  // Per-section reactive CSS var state
  private varsState = signal<Record<string, Record<string, string>>>(
    this.buildInitialVars(this.presets[0].vars)
  );

  chartVars = computed(() => this.getVarGroup(['--ngx-chart-bg', '--ngx-chart-grid', '--ngx-chart-axis', '--ngx-chart-axis-text', '--ngx-chart-tooltip-bg']));
  inputVars = computed(() => this.getVarGroup(['--ngx-input-bg', '--ngx-input-border', '--ngx-input-text', '--ngx-input-label', '--ngx-input-hint', '--ngx-input-focus', '--ngx-input-error', '--ngx-input-radius']));
  gridVars  = computed(() => this.getVarGroup(['--ngx-grid-bg', '--ngx-grid-header-bg', '--ngx-grid-border', '--ngx-grid-hover-bg', '--ngx-grid-selected-bg', '--ngx-grid-stripe-bg']));
  treeVars  = computed(() => this.getVarGroup(['--ngx-tree-bg', '--ngx-tree-hover-bg', '--ngx-tree-selected-bg', '--ngx-tree-selected-color', '--ngx-tree-border', '--ngx-tree-text']));
  tooltipVars = computed(() => this.getVarGroup(['--ngx-tooltip-bg', '--ngx-tooltip-color', '--ngx-popover-bg', '--ngx-popover-border', '--ngx-popover-header-bg', '--ngx-popover-radius']));
  ganttVars = computed(() => this.getVarGroup(['--ngx-gantt-bg', '--ngx-gantt-border', '--ngx-gantt-text', '--ngx-gantt-bar-bg', '--ngx-gantt-bar-progress-bg', '--ngx-gantt-header-bg', '--ngx-gantt-grid-line', '--ngx-gantt-today-color']));

  generatedCss = computed(() => {
    const vars = this.flatVars();
    const lines = [':root {', ...Object.entries(vars).filter(([,v]) => v).map(([k, v]) => `  ${k}: ${v};`), '}'];
    return lines.join('\n');
  });

  // ===== DEMO DATA =====
  months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  barSeries: ChartSeries[] = [
    { name: 'Revenue', data: [42, 58, 51, 73, 82, 76] },
    { name: 'Expenses', data: [31, 44, 38, 52, 61, 55] },
  ];
  lineSeries: ChartSeries[] = [
    { name: 'Users', data: [120, 180, 155, 220, 310, 280] },
    { name: 'Sessions', data: [200, 260, 230, 340, 420, 390] },
  ];
  pieData: ChartDataPoint[] = [
    { label: 'Product A', value: 38 }, { label: 'Product B', value: 27 },
    { label: 'Product C', value: 19 }, { label: 'Other', value: 16 },
  ];

  dropdownOptions: DropdownOption[] = [
    { label: 'United States', value: 'us' }, { label: 'Germany', value: 'de' },
    { label: 'Japan', value: 'jp' }, { label: 'France', value: 'fr' },
  ];

  gridCols: GridColumnDef[] = [
    { field: 'id', title: '#', width: 50 },
    { field: 'name', title: 'Name', sortable: true, filterable: true },
    { field: 'dept', title: 'Department', sortable: true },
    { field: 'status', title: 'Status', sortable: true },
  ];
  gridRows = [
    { id: 1, name: 'Alice Johnson', dept: 'Engineering', status: 'Active' },
    { id: 2, name: 'Bob Martinez', dept: 'Product', status: 'Active' },
    { id: 3, name: 'Carol Williams', dept: 'Design', status: 'Active' },
    { id: 4, name: 'David Kim', dept: 'Engineering', status: 'On Leave' },
    { id: 5, name: 'Emma Davis', dept: 'Analytics', status: 'Active' },
    { id: 6, name: 'Frank Brown', dept: 'Engineering', status: 'Inactive' },
    { id: 7, name: 'Grace Lee', dept: 'QA', status: 'Active' },
  ];

  treeNodes: TreeNode[] = [
    { id: '1', label: 'Engineering', icon: '🖥', children: [
      { id: '1.1', label: 'Frontend', icon: '🎨', children: [
        { id: '1.1.1', label: 'Angular Team', icon: '🔺' },
        { id: '1.1.2', label: 'React Team', icon: '⚛' },
      ]},
      { id: '1.2', label: 'Backend', icon: '⚙', children: [
        { id: '1.2.1', label: 'API Team', icon: '🔌' },
      ]},
    ]},
    { id: '2', label: 'Product', icon: '📦', children: [
      { id: '2.1', label: 'Design', icon: '✏' },
      { id: '2.2', label: 'Research', icon: '🔬' },
    ]},
    { id: '3', label: 'Marketing', icon: '📣' },
  ];

  ganttTasks: GanttTask[] = getSampleTasks().slice(0, 8);
  ganttDeps: GanttDependency[] = getSampleDependencies().slice(0, 4);
  ganttConfig: Partial<GanttConfig> = {
    zoomLevel: ZoomLevel.Day, rowHeight: 36, columnWidth: 36,
    headerHeight: 56, sidebarWidth: 260, showTodayMarker: true,
    showGrid: true, snapTo: 'day', collapsible: true,
  };

  onTaskChange(e: GanttTaskChangeEvent): void {
    this.ganttTasks = this.ganttTasks.map(t =>
      t.id === e.task.id ? { ...t, start: e.task.start, end: e.task.end } : t
    );
  }

  copyGeneratedCss(): void {
    navigator.clipboard.writeText(this.generatedCss()).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  applyPreset(preset: ThemePreset): void {
    this.activePreset.set(preset.name);
    this.varsState.set(this.buildInitialVars(preset.vars));
    this.applyAllVars(preset.vars);
  }

  updateVar(_section: string, name: string, value: string): void {
    const current = this.varsState();
    const flat: Record<string, string> = {};
    for (const group of Object.values(current)) {
      Object.assign(flat, group);
    }
    flat[name] = value;
    this.varsState.set(this.buildInitialVars(flat));
    document.documentElement.style.setProperty(name, value);
  }

  private getVarGroup(names: string[]): CssVar[] {
    const flat = this.flatVars();
    return names.map(name => ({
      name,
      value: flat[name] ?? '#ffffff',
      type: this.isColor(flat[name] ?? '') ? 'color' : 'text',
      label: this.prettyLabel(name),
    }));
  }

  private flatVars = computed(() => {
    const result: Record<string, string> = {};
    for (const group of Object.values(this.varsState())) {
      Object.assign(result, group);
    }
    return result;
  });

  private buildInitialVars(vars: Record<string, string>): Record<string, Record<string, string>> {
    const chartKeys = ['--ngx-chart-bg', '--ngx-chart-grid', '--ngx-chart-axis-text', '--ngx-chart-tooltip-bg'];
    const inputKeys = ['--ngx-input-border', '--ngx-input-focus', '--ngx-input-error', '--ngx-input-bg', '--ngx-input-label', '--ngx-input-hint'];
    const gridKeys  = ['--ngx-grid-header-bg', '--ngx-grid-border', '--ngx-grid-hover-bg', '--ngx-grid-selected-bg', '--ngx-grid-stripe-bg'];
    const treeKeys  = ['--ngx-tree-hover-bg', '--ngx-tree-selected-bg', '--ngx-tree-selected-color', '--ngx-tree-border'];
    const ttKeys    = ['--ngx-tooltip-bg', '--ngx-tooltip-color', '--ngx-popover-bg', '--ngx-popover-border', '--ngx-popover-header-bg'];
    const ganttKeys = ['--ngx-gantt-bg', '--ngx-gantt-border', '--ngx-gantt-bar-bg', '--ngx-gantt-bar-progress-bg', '--ngx-gantt-header-bg', '--ngx-gantt-today-color', '--ngx-gantt-text'];
    const defaults: Record<string, string> = {
      '--ngx-chart-axis': vars['--ngx-chart-axis'] ?? '#ced4da',
      '--ngx-input-text': vars['--ngx-input-text'] ?? '#212529',
      '--ngx-input-radius': vars['--ngx-input-radius'] ?? '4px',
      '--ngx-grid-bg': vars['--ngx-grid-bg'] ?? (vars['--ngx-chart-bg'] ?? '#ffffff'),
      '--ngx-tree-bg': vars['--ngx-tree-bg'] ?? (vars['--ngx-chart-bg'] ?? '#ffffff'),
      '--ngx-tree-text': vars['--ngx-tree-text'] ?? '#212529',
      '--ngx-popover-radius': vars['--ngx-popover-radius'] ?? '6px',
      '--ngx-gantt-grid-line': vars['--ngx-gantt-grid-line'] ?? '#ebedf0',
    };
    const merged = { ...defaults, ...vars };
    const pick = (keys: string[]) => Object.fromEntries(keys.map(k => [k, merged[k] ?? '']));
    return { charts: pick([...chartKeys, '--ngx-chart-axis']), inputs: pick([...inputKeys, '--ngx-input-text', '--ngx-input-radius']), grid: pick([...gridKeys, '--ngx-grid-bg']), tree: pick([...treeKeys, '--ngx-tree-bg', '--ngx-tree-text']), tooltip: pick([...ttKeys, '--ngx-popover-radius']), gantt: pick([...ganttKeys, '--ngx-gantt-grid-line']) };
  }

  private applyAllVars(vars: Record<string, string>): void {
    for (const [k, v] of Object.entries(vars)) {
      if (v) document.documentElement.style.setProperty(k, v);
    }
  }

  private isColor(val: string): boolean {
    return val.startsWith('#') || val.startsWith('rgb');
  }

  private prettyLabel(name: string): string {
    return name.replace(/^--ngx-[a-z]+-/, '').replace(/-/g, ' ');
  }
}
