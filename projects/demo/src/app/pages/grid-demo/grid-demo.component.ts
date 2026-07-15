import { Component, ViewChild, computed, signal, effect, untracked } from '@angular/core';
import {
  DataGridComponent,
  NgxGridCellTemplateDirective,
  NgxGridEditCellTemplateDirective,
  NgxGridFooterTemplateDirective,
  GridColumnDef,
  GridDataStateChangeEvent,
  GridDetailTemplateContext,
  GridGroupResult,
  GridGroupState,
  GridRowClickEvent,
  GridRowTemplateContext,
  GridRowUpdateEvent,
  GridSortState,
  AvatarComponent,
} from 'ngx-core-components';

interface EmployeeProject {
  code: string;
  name: string;
  hours: number;
  status: 'Planned' | 'In Progress' | 'Completed';
}

interface Employee {
  id: number;
  name: string;
  title: string;
  department: string;
  email: string;
  salary: number;
  status: 'Active' | 'On Leave' | 'Inactive';
  startDate: string;
  city: string;
  projects: EmployeeProject[];
}

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

@Component({
  selector: 'app-grid-demo',
  standalone: true,
  imports: [
    DataGridComponent,
    AvatarComponent,
    NgxGridCellTemplateDirective,
    NgxGridEditCellTemplateDirective,
    NgxGridFooterTemplateDirective
  ],
  template: `
    <div class="demo-page">
      <div class="page-header">
        <div class="page-header-text">
          <h1>Data Grid Enterprise</h1>
          <p>
            Enterprise-ready grid featuring interactive column resizing, Excel-style column popover filters,
            automatic totals/aggregations footer, client/server sorting/grouping, inline editing, and detail templates.
          </p>
        </div>
        <div class="header-panel">
          <div class="header-actions">
            <button class="header-action-btn primary" type="button" (click)="onExportExcel()">Export Excel</button>
            <button class="header-action-btn" type="button" (click)="autoSizeCoreColumns()">Auto-size key columns</button>
            <button class="header-action-btn" type="button" (click)="resetDemoView()">Reset view</button>
          </div>
          <div class="header-badges">
            <span class="badge badge-orange">Column Auto-Sizing</span>
            <span class="badge badge-orange">Checklist Filters Search</span>
            <span class="badge badge-orange">Excel Spreadsheet Export</span>
            <span class="badge badge-orange">Summary Footers</span>
            <span class="badge badge-orange">Grouping & Details</span>
            <span class="badge badge-orange">Column Reordering</span>
            <span class="badge badge-orange">Multi-Column Sort</span>
          </div>
        </div>
      </div>

      <div class="metric-grid">
        @for (stat of summaryStats(); track stat.label) {
          <article class="metric-card" [class]="'metric-' + stat.accent">
            <span class="metric-label">{{ stat.label }}</span>
            <strong class="metric-value">{{ stat.value }}</strong>
          </article>
        }
      </div>

      <div class="tab-nav">
        @for (tab of tabs; track tab) {
          <button class="tab-btn" [class.active]="activeTab() === tab" (click)="activeTab.set(tab)">{{ tab }}</button>
        }
      </div>

      @if (activeTab() === 'Demo') {
        <div class="tab-content">
          <div class="section-label">Live Demo</div>

          <div class="controls-panel">
            <label class="ctrl-item">
              Processing
              <select [value]="processingMode()" (change)="onProcessingModeChange($any($event.target).value)">
                <option value="client">Client</option>
                <option value="server">Server (simulated)</option>
              </select>
            </label>

            <label class="ctrl-item">
              Group By
              <select [value]="groupField()" (change)="onGroupFieldChange($any($event.target).value)">
                <option value="">None</option>
                <option value="department">Department</option>
                <option value="status">Status</option>
                <option value="city">City</option>
              </select>
            </label>

            <label class="ctrl-item toggle-item">
              <input type="checkbox" [checked]="useRowTemplate()" (change)="useRowTemplate.set($any($event.target).checked)" />
              Row template mode
            </label>

            <label class="ctrl-item toggle-item">
              <input type="checkbox" [checked]="useCustomTemplates()" (change)="onCustomTemplatesChange($any($event.target).checked)" />
              Custom cell templates
            </label>

            <label class="ctrl-item toggle-item">
              <input type="checkbox" [checked]="editable()" (change)="editable.set($any($event.target).checked)" />
              Inline editing
            </label>

            <label class="ctrl-item toggle-item">
              <input type="checkbox" [checked]="showSearch()" (change)="showSearch.set($any($event.target).checked)" />
              Global Search
            </label>

            <label class="ctrl-item toggle-item">
              <input type="checkbox" [checked]="rowReorderable()" (change)="rowReorderable.set($any($event.target).checked)" />
              Row Drag & Drop
            </label>

            <label class="ctrl-item toggle-item">
              <input type="checkbox" [checked]="showColumnChooser()" (change)="showColumnChooser.set($any($event.target).checked)" />
              Column Chooser
            </label>

            <label class="ctrl-item toggle-item">
              <input type="checkbox" [checked]="cellSelection()" (change)="cellSelection.set($any($event.target).checked)" />
              Cell Selection
            </label>

            <label class="ctrl-item toggle-item">
              <input type="checkbox" [checked]="enableContextMenu()" (change)="enableContextMenu.set($any($event.target).checked)" />
              Context Menu
            </label>

            <label class="ctrl-item toggle-item">
              <input type="checkbox" [checked]="keyboardNavigation()" (change)="keyboardNavigation.set($any($event.target).checked)" />
              Keyboard Nav
            </label>

            <label class="ctrl-item toggle-item">
              <input type="checkbox" [checked]="groupAggregations()" (change)="groupAggregations.set($any($event.target).checked)" />
              Group Aggregations
            </label>

            <label class="ctrl-item toggle-item">
              <input type="checkbox" [checked]="virtualScroll()" (change)="virtualScroll.set($any($event.target).checked)" />
              Virtual Scroll
            </label>

            <label class="ctrl-item">
              Page Size
              <select [value]="gridPageSize()" (change)="onPageSizeChange(+$any($event.target).value)">
                <option [value]="5">5</option>
                <option [value]="8">8</option>
                <option [value]="10">10</option>
                <option [value]="20">20</option>
                <option [value]="50">50</option>
                <option [value]="100">100</option>
              </select>
            </label>

            <div class="ctrl-item ctrl-summary">Selected rows: {{ selectedCount() }}</div>

            <button class="grid-action-btn detail-ctrl-btn" style="padding: 6px 12px; font-size: 12px; border-radius: 8px; font-family: inherit; font-weight: 600; cursor: pointer; transition: all 0.2s; background: rgba(79, 70, 229, 0.08); border: 1px solid rgba(79, 70, 229, 0.15); color: var(--primary-color, #4f46e5);" (click)="grid.expandAllDetails()">
              Expand All Details
            </button>
            <button class="grid-action-btn detail-ctrl-btn" style="padding: 6px 12px; font-size: 12px; border-radius: 8px; font-family: inherit; font-weight: 500; cursor: pointer; transition: all 0.2s; background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary);" (click)="grid.collapseAllDetails()">
              Collapse All Details
            </button>
          </div>

          <ngx-data-grid
            #grid
            [data]="displayRows()"
            [columns]="columns()"
            [page]="gridPage()"
            [pageSize]="gridPageSize()"
            [total]="processingMode() === 'server' ? serverTotal() : 0"
            [virtualScroll]="virtualScroll()"
            [selectable]="true"
            [striped]="true"
            [loading]="loading()"
            [editable]="editable()"
            [sortMode]="processingMode()"
            [filterMode]="processingMode()"
            [groupMode]="processingMode()"
            [pagingMode]="processingMode()"
            [groupBy]="gridGroup()"
            [groupedData]="processingMode() === 'server' ? serverGroups() : []"
            [rowTemplate]="useRowTemplate() ? rowTpl : null"
            [detailRowTemplate]="detailTpl"
            [stateKey]="'demo-grid'"
            [reorderable]="true"
            [multiSort]="true"
            [showGlobalSearch]="showSearch()"
            [rowReorderable]="rowReorderable()"
            [showColumnChooser]="showColumnChooser()"
            [cellSelection]="cellSelection()"
            [enableContextMenu]="enableContextMenu()"
            [keyboardNavigation]="keyboardNavigation()"
            [groupAggregations]="groupAggregations()"
            (rowClick)="onRowClick($event)"
            (selectionChange)="onSelectionChange($event)"
            (dataStateChange)="onDataStateChange($event)"
            (rowUpdate)="onRowUpdate($event)"
            (columnReorder)="onColumnReorder($event)"
            (rowReorder)="onRowReorder($event)"
            (cellSelectionChange)="onCellSelectionChange($event)"
          >
            <!-- Custom Cell Template for Name (includes Avatar) -->
            <ng-template ngxGridCellTemplate="name" let-value let-row="row">
              @if (useCustomTemplates()) {
                <div class="name-cell-wrap" style="display: flex; align-items: center; gap: 10px;">
                  <ngx-avatar [name]="value" size="sm"></ngx-avatar>
                  <span class="name-cell" style="display: inline-flex; flex-direction: column; gap: 2px;">
                    {{ value }}
                    <small style="color: var(--text-secondary); font-size: 11px; font-weight: 500;">{{ row.title }}</small>
                  </span>
                </div>
              } @else {
                {{ value }}
              }
            </ng-template>

            <!-- Custom Cell Template for Salary -->
            <ng-template ngxGridCellTemplate="salary" let-value>
              @if (useCustomTemplates()) {
                <span class="salary-cell">{{ formatCurrency($any(value)) }}</span>
              } @else {
                {{ value }}
              }
            </ng-template>

            <!-- Custom Cell Template for Status -->
            <ng-template ngxGridCellTemplate="status" let-value>
              @if (useCustomTemplates()) {
                <span class="status-pill" [class.active]="value === 'Active'" [class.leave]="value === 'On Leave'" [class.inactive]="value === 'Inactive'">
                  {{ value }}
                </span>
              } @else {
                {{ value }}
              }
            </ng-template>

            <!-- Custom Edit Cell Template for Status -->
            <ng-template ngxGridEditCellTemplate="status" let-value let-update="updateDraft" let-draft="draftValue">
              @if (useCustomTemplates()) {
                <select [value]="draft" (change)="update($any($event.target).value)" (click)="$event.stopPropagation()" style="padding: 6px 10px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-primary); color: var(--text-primary); font-family: inherit; font-size: 12px; outline: none;">
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Inactive">Inactive</option>
                </select>
              } @else {
                <input
                  class="grid-edit-input"
                  [value]="draft"
                  (input)="update($any($event.target).value)"
                  (click)="$event.stopPropagation()"
                />
              }
            </ng-template>

            <!-- Custom Footer Cell Template for Salary -->
            <ng-template ngxGridFooterTemplate="salary" let-val="aggregationValue">
              @if (useCustomTemplates()) {
                <div style="display: flex; flex-direction: column; align-items: flex-end;">
                  <span style="font-size: 10px; color: var(--text-secondary); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">Payroll</span>
                  <strong style="color: #10b981; font-size: 14px;">{{ val }}</strong>
                </div>
              } @else {
                {{ val }}
              }
            </ng-template>
          </ngx-data-grid>

          <ng-template #rowTpl let-row="row" let-editing="editing">
            <div class="row-template-wrap" [class.editing]="editing">
              <div class="row-template-main">
                <strong>{{ row.name }}</strong>
                <span>{{ row.title }} · {{ row.department }}</span>
              </div>
              <div class="row-template-meta">
                <span>{{ row.city }}</span>
                <span>{{ formatCurrency(row.salary) }}</span>
                <span>{{ row.status }}</span>
              </div>
            </div>
          </ng-template>

          <ng-template #detailTpl let-row="row">
            <div class="detail-card">
              <div class="detail-header">
                <div class="detail-header-left">
                  <span class="detail-icon">📁</span>
                  <div class="detail-title-wrap">
                    <div class="detail-title">Project Allocation</div>
                    <div class="detail-subtitle">Current assignments for {{ row.name }} · {{ row.department }}</div>
                  </div>
                </div>
                <div class="detail-header-right">
                  <span class="detail-stat"><strong>{{ row.projects?.length || 0 }}</strong> active projects</span>
                </div>
              </div>
              <table class="detail-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Project</th>
                    <th style="text-align: right;">Hours</th>
                    <th style="text-align: center;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  @for (project of row.projects; track project.code) {
                    <tr>
                      <td style="font-family: monospace; font-weight: 700; color: var(--primary-color, #4f46e5);">{{ project.code }}</td>
                      <td style="font-weight: 500;">{{ project.name }}</td>
                      <td style="text-align: right; font-weight: 600; color: var(--text-primary);">{{ project.hours }} hrs</td>
                      <td style="text-align: center;">
                        <span class="status-badge" [class]="project.status.toLowerCase().replace(' ', '-')">
                          {{ project.status }}
                        </span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </ng-template>

          @if (lastEvent()) {
            <div class="event-info">{{ lastEvent() }}</div>
          }
        </div>
      }

      @if (activeTab() === 'How to Use') {
        <div class="tab-content">
          <div class="section-label">Client Mode With Grouping, Templates, Inline Edit, Nested Row</div>
          <pre class="code-block">{{ clientCode }}</pre>

          <div class="section-label">Server Mode (Simulated)</div>
          <pre class="code-block">{{ serverCode }}</pre>

          <div class="section-label">Enterprise Capabilities (Excel Export & Auto-Sizing)</div>
          <pre class="code-block">{{ enterpriseCode }}</pre>

          <div class="section-label">Declarative Custom Cell Templates</div>
          <pre class="code-block">{{ cellTemplateCode }}</pre>
        </div>
      }

      @if (activeTab() === 'API Reference') {
        <div class="tab-content">
          <div class="section-label">Inputs</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of gridInputs; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>

          <div class="section-label">Outputs</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Output</th><th>Type</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of gridOutputs; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>

          <div class="section-label">Public Methods</div>
          <div class="api-table-wrap" style="margin-bottom: 24px;">
            <table class="api-table">
              <thead><tr><th>Method</th><th>Signature</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of gridMethods; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>

          <div class="section-label">Column Definition</div>
          <pre class="code-block">{{ colDefCode }}</pre>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .demo-page { padding: 32px 40px; max-width: 1200px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: 28px; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; padding-bottom: 24px; border-bottom: 2px solid var(--border-color); }
    .page-header-text h1 { margin: 0 0 8px; font-size: 28px; font-weight: 900; color: var(--text-primary); letter-spacing: -0.5px; font-family: var(--ngx-heading-font-family, 'Outfit', sans-serif); }
    .page-header-text p { margin: 0; font-size: 14px; color: var(--text-secondary); line-height: 1.7; max-width: 720px; }
    .header-panel { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
    .header-actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }
    .header-action-btn { border: 1px solid var(--border-color); border-radius: 999px; background: var(--bg-primary); color: var(--text-primary); padding: 8px 12px; font-size: 12px; font-weight: 700; font-family: inherit; cursor: pointer; transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease; }
    .header-action-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08); }
    .header-action-btn.primary { background: linear-gradient(135deg, var(--primary-color, #4f46e5), #7c3aed); color: #fff; border-color: transparent; }
    .header-badges { display: flex; gap: 10px; flex-shrink: 0; flex-wrap: wrap; justify-content: flex-end; }
    .metric-grid { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
    .metric-card { border: 1px solid var(--border-color); border-radius: 16px; padding: 14px 16px; background: linear-gradient(145deg, var(--bg-secondary), var(--bg-primary)); box-shadow: var(--shadow-sm); display: flex; flex-direction: column; gap: 4px; }
    .metric-card.metric-indigo { border-color: rgba(79, 70, 229, 0.18); }
    .metric-card.metric-emerald { border-color: rgba(16, 185, 129, 0.18); }
    .metric-card.metric-amber { border-color: rgba(245, 158, 11, 0.18); }
    .metric-card.metric-violet { border-color: rgba(139, 92, 246, 0.18); }
    .metric-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.18em; color: var(--text-secondary); font-weight: 800; }
    .metric-value { font-size: 22px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.02em; }
    .badge { font-size: 11px; font-weight: 700; padding: 6px 12px; border-radius: 16px; transition: all 0.2s ease; }
    .badge-orange { background: linear-gradient(135deg, #fff3cd 0%, #ffeeba 100%); color: #b45309; border: 1px solid rgba(180, 83, 9, 0.1); }
    .tab-nav { display: flex; gap: 0; border-bottom: 2px solid var(--border-color); overflow-x: auto; padding-bottom: 0; }
    .tab-btn { padding: 12px 20px; background: none; border: none; font-size: 13px; font-weight: 500; color: var(--text-secondary); cursor: pointer; border-bottom: 3px solid transparent; margin-bottom: -2px; font-family: inherit; transition: all 0.2s ease; white-space: nowrap; }
    .tab-btn:hover { color: var(--text-primary); background: rgba(79, 70, 229, 0.05); }
    .tab-btn.active { color: var(--primary-color, #4f46e5); border-bottom-color: var(--primary-color, #4f46e5); font-weight: 600; background: rgba(79, 70, 229, 0.04); }
    .tab-content { display: flex; flex-direction: column; gap: 20px; }
    .section-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; color: #8892a0; border-bottom: 2px solid var(--border-color); padding-bottom: 12px; }
    .controls-panel { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; padding: 16px; border: 1px solid var(--border-color); border-radius: 12px; background: var(--bg-secondary); box-shadow: var(--shadow-sm); }
    .ctrl-item { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-primary); font-weight: 500; }
    .ctrl-item select { padding: 6px 12px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 13px; background: var(--bg-primary); color: var(--text-primary); outline: none; transition: all 0.2s; }
    .ctrl-item select:focus { border-color: var(--primary-color); box-shadow: var(--shadow-glow); }
    .toggle-item { gap: 8px; cursor: pointer; user-select: none; }
    .toggle-item input { cursor: pointer; }
    .ctrl-summary { padding: 6px 14px; background: var(--primary-glow, rgba(79, 70, 229, 0.1)); border: 1px solid rgba(79, 70, 229, 0.15); border-radius: 99px; color: var(--primary-color, #4f46e5); font-weight: 700; font-size: 12px; }
    .header-tpl { display: inline-flex; align-items: center; gap: 6px; }
    .header-sort { font-size: 10px; color: var(--primary-color); }
    .salary-cell { font-weight: 700; color: #10b981; }
    .status-pill { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; letter-spacing: 0.02em; }
    .status-pill.active { background: rgba(16, 185, 129, 0.15); color: #10b981; }
    .status-pill.leave { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
    .status-pill.inactive { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
    .name-cell { display: inline-flex; flex-direction: column; gap: 2px; }
    .name-cell small { color: var(--text-secondary); font-size: 11px; font-weight: 500; }
    .row-template-wrap { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 10px 16px; border-radius: 8px; border: 1px dashed var(--border-color); background: var(--bg-primary); }
    .row-template-wrap.editing { background: rgba(245, 158, 11, 0.05); border-color: rgba(245, 158, 11, 0.3); }
    .row-template-main { display: flex; flex-direction: column; gap: 4px; }
    .row-template-main strong { color: var(--text-primary); font-size: 14px; }
    .row-template-main span { font-size: 12px; color: var(--text-secondary); }
    .row-template-meta { display: flex; gap: 20px; font-size: 13px; color: var(--text-primary); font-weight: 500; }
    .detail-card {
      padding: 24px;
      background: var(--bg-secondary, rgba(255, 255, 255, 0.45));
      backdrop-filter: blur(8px);
      border-radius: 12px;
      border: 1px solid var(--border-color);
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02), 0 4px 12px rgba(0, 0, 0, 0.03);
    }
    .detail-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 18px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border-color);
      flex-wrap: wrap;
      gap: 12px;
    }
    .detail-header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .detail-icon {
      font-size: 20px;
    }
    .detail-title-wrap {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .detail-title {
      font-size: 14px;
      font-weight: 750;
      color: var(--text-primary);
      margin: 0;
      font-family: var(--ngx-heading-font-family, 'Outfit', sans-serif);
    }
    .detail-subtitle {
      font-size: 11px;
      color: var(--text-secondary);
      font-weight: 500;
    }
    .detail-header-right {
      font-size: 12px;
      color: var(--text-secondary);
    }
    .detail-stat strong {
      color: var(--primary-color, #4f46e5);
      font-size: 14px;
    }
    .detail-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    .detail-table th, .detail-table td {
      text-align: left;
      padding: 10px 14px;
      border-bottom: 1px solid var(--border-color);
      color: var(--text-primary);
    }
    .detail-table th {
      color: var(--text-secondary);
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      background: rgba(0, 0, 0, 0.015);
    }
    .detail-table tbody tr {
      transition: background-color 0.15s ease;
    }
    .detail-table tbody tr:hover td {
      background: var(--ngx-grid-hover-bg, rgba(0, 0, 0, 0.015));
    }
    .detail-table tbody tr:last-child td {
      border-bottom: none;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      padding: 3px 8px;
      border-radius: 99px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.02em;
    }
    .status-badge.planned {
      background: rgba(148, 163, 184, 0.15);
      color: #64748b;
    }
    .status-badge.in-progress {
      background: rgba(79, 70, 229, 0.12);
      color: #4f46e5;
    }
    .status-badge.completed {
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
    }
    .detail-ctrl-btn:hover {
      transform: translateY(-0.5px);
      box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.05);
    }
    .detail-ctrl-btn:active {
      transform: scale(0.97);
    }
    .event-info { padding: 12px 16px; background: var(--primary-glow); border-radius: 8px; font-size: 12px; font-family: monospace; color: var(--primary-color); border-left: 4px solid var(--primary-color); }
    .code-block { background: #0f172a; color: #f8fafc; padding: 20px; border-radius: 12px; font-size: 12px; font-family: 'Cascadia Code', Consolas, monospace; overflow-x: auto; white-space: pre; margin: 0; box-shadow: var(--shadow-md); border: 1px solid rgba(255,255,255,0.05); }
    .api-table-wrap { overflow-x: auto; border: 1px solid var(--border-color); border-radius: 12px; background: var(--bg-secondary); }
    .api-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .api-table thead tr { background: var(--ngx-grid-header-bg, #f8fafc); border-bottom: 1.5px solid var(--border-color); }
    .api-table th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.7px; color: var(--text-secondary); white-space: nowrap; font-family: var(--ngx-heading-font-family, 'Outfit', sans-serif); }
    .api-table td { padding: 12px 16px; border-bottom: 1px solid var(--border-light); color: var(--text-primary); vertical-align: top; }
    .api-table tbody tr { transition: background 0.2s ease; }
    .api-table tbody tr:hover td { background: var(--ngx-grid-hover-bg); }
    .api-table tbody tr:last-child td { border-bottom: none; }
    .api-name { color: var(--primary-color) !important; font-family: monospace; font-weight: 700; white-space: nowrap; }
    .api-type { color: #a855f7 !important; font-family: monospace; white-space: nowrap; }
    .api-default { font-family: monospace; white-space: nowrap; color: #f43f5e; font-weight: 500; }
  `],
})
export class GridDemoComponent {
  @ViewChild('grid') grid!: DataGridComponent;

  activeTab = signal('Demo');
  tabs = ['Demo', 'How to Use', 'API Reference'];

  processingMode = signal<'client' | 'server'>('client');
  groupField = signal('');
  useRowTemplate = signal(false);
  useCustomTemplates = signal(true);
  editable = signal(true);
  showSearch = signal(true);
  rowReorderable = signal(true);
  showColumnChooser = signal(true);
  cellSelection = signal(true);
  enableContextMenu = signal(true);
  keyboardNavigation = signal(true);
  groupAggregations = signal(true);
  loading = signal(false);
  virtualScroll = signal(false);
  gridPage = signal(1);
  gridPageSize = signal(8);
  selectedCount = signal(0);
  lastEvent = signal('');

  employees = signal<Employee[]>(this.seedEmployees());
  serverRows = signal<Employee[]>([]);
  serverGroups = signal<GridGroupResult<Employee>[]>([]);
  serverTotal = signal(0);

  serverSort = signal<GridSortState | null>(null);
  serverFilters = signal<{ field: string; value: string }[]>([]);

  columns = signal<GridColumnDef<Employee>[]>([
    { field: 'id', title: '#', width: 156, sortable: true, align: 'right', aggregation: 'count', pinned: 'left' },
    { field: 'name', title: 'Name', sortable: true, filterable: true, groupable: true, editable: true, width: 190, pinned: 'left' },
    { field: 'title', title: 'Title', sortable: true, filterable: true, groupable: true, editable: true, width: 170, category: 'Employee Details' },
    { field: 'department', title: 'Department', sortable: true, filterable: true, groupable: true, editable: true, width: 140, category: 'Employee Details' },
    { field: 'city', title: 'City', sortable: true, filterable: true, groupable: true, editable: true, width: 120, category: 'Contact & Location', mergeRows: true },
    { field: 'email', title: 'Email', filterable: true, editable: true, width: 220, category: 'Contact & Location' },
    { field: 'salary', title: 'Salary', sortable: true, align: 'right', editable: true, width: 120, aggregation: 'sum', category: 'Employment', pinned: 'right' },
    { field: 'status', title: 'Status', sortable: true, filterable: true, groupable: true, editable: true, width: 110, category: 'Employment' },
    { field: 'startDate', title: 'Start Date', sortable: true, width: 120, hidden: true, category: 'Employment' },
  ]);

  gridGroup = computed<GridGroupState | null>(() => {
    const field = this.groupField();
    return field ? { field, dir: 'asc' } : null;
  });

  summaryStats = computed(() => {
    const rows = this.employees();
    const departments = new Set(rows.map(row => row.department));
    return [
      { label: 'Employees', value: rows.length.toLocaleString(), accent: 'indigo' },
      { label: 'Departments', value: departments.size.toString(), accent: 'emerald' },
      { label: 'Selected rows', value: this.selectedCount().toString(), accent: 'amber' },
      { label: 'Mode', value: this.processingMode() === 'server' ? 'Simulated server' : 'Client mode', accent: 'violet' },
    ];
  });

  displayRows = computed(() =>
    this.processingMode() === 'server' ? this.serverRows() : this.employees()
  );

  constructor() {
    this.refreshServerData({
      page: 1,
      pageSize: this.gridPageSize(),
      sort: null,
      filters: [],
      group: null,
    });
  }

  onCustomTemplatesChange(checked: boolean): void {
    this.useCustomTemplates.set(checked);
  }

  onExportExcel(): void {
    this.grid?.exportToExcel();
    this.lastEvent.set('Excel export started from the enterprise toolbar');
  }

  autoSizeCoreColumns(): void {
    const coreFields = ['name', 'department', 'salary', 'status'];
    for (const column of this.columns().filter(col => coreFields.includes(col.field))) {
      this.grid?.autoSizeColumn(column as never);
    }
    this.lastEvent.set('Key columns auto-sized for improved readability');
  }

  resetDemoView(): void {
    this.processingMode.set('client');
    this.groupField.set('');
    this.useRowTemplate.set(false);
    this.useCustomTemplates.set(true);
    this.editable.set(true);
    this.showSearch.set(true);
    this.rowReorderable.set(true);
    this.showColumnChooser.set(true);
    this.cellSelection.set(true);
    this.enableContextMenu.set(true);
    this.keyboardNavigation.set(true);
    this.groupAggregations.set(true);
    this.gridPage.set(1);
    this.gridPageSize.set(8);
    this.selectedCount.set(0);

    this.grid?.goPage(1);
    this.grid?.collapseAllDetails();
    this.lastEvent.set('Demo view reset to the default enterprise layout');
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value || 0);
  }

  onProcessingModeChange(value: 'client' | 'server'): void {
    this.processingMode.set(value);
    this.gridPage.set(1);
    if (value === 'server') {
      this.refreshServerData({
        page: 1,
        pageSize: this.gridPageSize(),
        sort: this.serverSort(),
        filters: this.serverFilters().map(filter => ({ ...filter, operator: 'contains' })),
        group: this.gridGroup(),
      });
      this.lastEvent.set('Server mode enabled (simulated requests)');
    } else {
      this.lastEvent.set('Client mode enabled');
    }
  }

  onGroupFieldChange(field: string): void {
    this.groupField.set(field);
    this.gridPage.set(1);
    if (this.processingMode() === 'server') {
      this.refreshServerData({
        page: 1,
        pageSize: this.gridPageSize(),
        sort: this.serverSort(),
        filters: this.serverFilters().map(filter => ({ ...filter, operator: 'contains' })),
        group: field ? { field, dir: 'asc' } : null,
      });
    }
  }

  onPageSizeChange(size: number): void {
    this.gridPageSize.set(size);
    this.gridPage.set(1);

    if (this.processingMode() === 'server') {
      this.refreshServerData({
        page: 1,
        pageSize: size,
        sort: this.serverSort(),
        filters: this.serverFilters().map(filter => ({ ...filter, operator: 'contains' })),
        group: this.gridGroup(),
      });
    }

    this.lastEvent.set(`Page size changed to ${size}`);
  }

  onRowClick(event: GridRowClickEvent<Employee>): void {
    this.lastEvent.set(`Row clicked: ${event.row.name} (${event.row.department})`);
  }

  onSelectionChange(rows: Employee[]): void {
    this.selectedCount.set(rows.length);
    this.lastEvent.set(`${rows.length} row(s) selected`);
  }

  onDataStateChange(state: GridDataStateChangeEvent): void {
    this.gridPage.set(state.page);
    this.gridPageSize.set(state.pageSize);
    if (state.group) {
      this.groupField.set(state.group.field);
    } else {
      this.groupField.set('');
    }

    if (this.processingMode() === 'server') {
      this.refreshServerData(state);
      const filterInfo = state.filters.length ? `${state.filters.length} filter(s)` : 'no filters';
      const sortInfo = state.sort ? `${state.sort.field} ${state.sort.dir}` : 'no sort';
      const groupInfo = state.group ? `grouped by ${state.group.field}` : 'no grouping';
      this.lastEvent.set(`Server request: page ${state.page}, ${sortInfo}, ${filterInfo}, ${groupInfo}`);
    } else {
      const sortInfo = state.sort ? `${state.sort.field} ${state.sort.dir}` : 'none';
      const groupInfo = state.group ? `, grouped by ${state.group.field}` : '';
      this.lastEvent.set(`Client state changed: page ${state.page}, size ${state.pageSize}${groupInfo}, sort ${sortInfo}`);
    }
  }

  onRowUpdate(event: GridRowUpdateEvent<Employee>): void {
    const update = (rows: Employee[]): Employee[] =>
      rows.map(row => row.id === event.previous.id ? { ...row, ...event.updated } : row);

    this.employees.set(update(this.employees()));
    this.serverRows.set(update(this.serverRows()));
    this.lastEvent.set(`Inline edit saved for ${event.updated.name}`);
  }

  onColumnReorder(event: { columns: GridColumnDef<Employee>[] }): void {
    this.lastEvent.set(`Columns reordered: ${event.columns.map(c => c.title).join(', ')}`);
  }

  onRowReorder(event: { previousIndex: number; currentIndex: number; data: Employee[] }): void {
    this.employees.set(event.data);
    this.lastEvent.set(`Row moved from index ${event.previousIndex} to ${event.currentIndex}`);
  }

  onCellSelectionChange(event: { start: { row: Employee; colField: string }; end: { row: Employee; colField: string } } | null): void {
    if (event) {
      this.lastEvent.set(`Cell selected from [${event.start.row.name}, ${event.start.colField}] to [${event.end.row.name}, ${event.end.colField}] (Press Ctrl+C to copy selected cells)`);
    } else {
      this.lastEvent.set(`Cell selection cleared`);
    }
  }

  private refreshServerData(state: GridDataStateChangeEvent): void {
    let rows = [...this.employees()];

    for (const filter of state.filters) {
      if (!filter.value) {
        continue;
      }
      const query = filter.value.toLowerCase();
      rows = rows.filter(row => String(((row as unknown) as Record<string, unknown>)[filter.field] ?? '').toLowerCase().includes(query));
    }

    if (state.sort) {
      rows.sort((left, right) => {
        const l = ((left as unknown) as Record<string, unknown>)[state.sort!.field];
        const r = ((right as unknown) as Record<string, unknown>)[state.sort!.field];
        const compared = String(l ?? '').localeCompare(String(r ?? ''), undefined, { numeric: true, sensitivity: 'base' });
        return state.sort!.dir === 'asc' ? compared : -compared;
      });
    }

    this.serverFilters.set(
      state.filters.map((filter: { field: string; value: string }) => ({
        field: filter.field,
        value: filter.value,
      }))
    );
    this.serverSort.set(state.sort);

    this.serverTotal.set(rows.length);

    if (state.group) {
      const grouped = new Map<string, Employee[]>();
      for (const row of rows) {
        const key = String(((row as unknown) as Record<string, unknown>)[state.group.field] ?? '(empty)');
        if (!grouped.has(key)) {
          grouped.set(key, []);
        }
        grouped.get(key)!.push(row);
      }

      const pageSize = Math.max(1, state.pageSize);
      const groupedResults = Array.from(grouped.entries()).map(([key, items]) => ({
        key,
        value: key,
        field: state.group!.field,
        count: items.length,
        items: items.slice((state.page - 1) * pageSize, state.page * pageSize),
      }));

      this.serverGroups.set(groupedResults);
      this.serverRows.set([]);
      return;
    }

    this.serverGroups.set([]);
    const pageSize = Math.max(1, state.pageSize);
    const start = (state.page - 1) * pageSize;
    this.serverRows.set(rows.slice(start, start + pageSize));
  }

  private seedEmployees(): Employee[] {
    const departments = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'Analytics'];
    const cities = ['New York', 'Berlin', 'Bangalore', 'London', 'Toronto'];
    const statuses: Array<Employee['status']> = ['Active', 'On Leave', 'Inactive'];
    const titles = ['Software Engineer', 'Senior Engineer', 'Tech Lead', 'Product Manager', 'UX Designer', 'Data Analyst'];

    return Array.from({ length: 10000 }, (_, i) => {
      const id = i + 1;
      const department = departments[i % departments.length];
      const city = cities[i % cities.length];
      const status = statuses[i % statuses.length];
      const title = titles[i % titles.length];
      return {
        id,
        name: `Employee ${id}`,
        title,
        department,
        email: `employee${id}@corp.com`,
        salary: 68000 + (i % 12) * 6200,
        status,
        startDate: `202${i % 5}-0${(i % 9) + 1}-1${i % 9}`,
        city,
        projects: [
          { code: `P-${id}-A`, name: `Platform Revamp ${id}`, hours: 20 + (i % 10), status: 'In Progress' },
          { code: `P-${id}-B`, name: `Quality Sprint ${id}`, hours: 12 + (i % 7), status: i % 2 === 0 ? 'Planned' : 'Completed' },
        ],
      };
    });
  }

  clientCode = `import { DataGridComponent, type GridColumnDef } from 'ngx-core-components';

@Component({
  standalone: true,
  imports: [DataGridComponent],
  template: \
    \
    <ngx-data-grid
      [data]="rows"
      [columns]="columns"
      [pageSize]="10"
      [groupBy]="{ field: 'department', dir: 'asc' }"
      [editable]="true"
      [rowTemplate]="cardMode ? rowTpl : null"
      [detailRowTemplate]="detailTpl"
      (rowUpdate)="onRowUpdate($event)"
    />
})
export class MyComponent {
  columns: GridColumnDef[] = [
    { field: 'name', title: 'Name', sortable: true, filterable: true, editable: true, headerTemplate: headerTpl, cellTemplate: cellTpl },
    { field: 'department', title: 'Department', sortable: true, filterable: true, groupable: true, headerTemplate: headerTpl },
  ];

  rows = [...];
}`;

  serverCode = `import { DataGridComponent, type GridDataStateChangeEvent } from 'ngx-core-components';

@Component({
  standalone: true,
  imports: [DataGridComponent],
  template: \
    \
    <ngx-data-grid
      [data]="pageRows"
      [columns]="columns"
      [page]="page"
      [pageSize]="20"
      [total]="total"
      [sortMode]="'server'"
      [filterMode]="'server'"
      [groupMode]="'server'"
      [pagingMode]="'server'"
      [groupBy]="group"
      [groupedData]="serverGroups"
      (dataStateChange)="onDataStateChange($event)"
    />
})
export class MyServerGridComponent {
  pageRows = [];
  total = 0;
  group: { field: string; dir?: 'asc' | 'desc' } | null = null;
  serverGroups = [];

  onDataStateChange(state: GridDataStateChangeEvent): void {
    // call your API with page, pageSize, filters, sort, group
  }
}`;

  colDefCode = `interface GridColumnDef {
  field: string;
  title: string;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  groupable?: boolean;
  editable?: boolean;
  align?: 'left' | 'center' | 'right';
  headerTemplate?: TemplateRef<GridHeaderTemplateContext<T>>;
  cellTemplate?: TemplateRef<GridCellTemplateContext<T>>;
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  pinned?: 'left' | 'right' | null;
  mergeRows?: boolean;
}`;

  enterpriseCode = `import { Component, ViewChild } from '@angular/core';
import { DataGridComponent } from 'ngx-core-components';

@Component({
  standalone: true,
  imports: [DataGridComponent],
  template: \`
    <div class="toolbar">
      <button (click)="grid.exportToExcel()">Export to Excel</button>
      <button (click)="grid.autoSizeColumn(columns[1])">Auto-size Name Column</button>
    </div>

    <ngx-data-grid
      #grid
      [data]="rows"
      [columns]="columns"
    />
  \`
})
export class MyEnterpriseGridComponent {
  @ViewChild('grid') grid!: DataGridComponent;
  // ... data and columns defined
}`;

  cellTemplateCode = `import { Component } from '@angular/core';
import { 
  DataGridComponent, 
  NgxGridCellTemplateDirective, 
  NgxGridEditCellTemplateDirective, 
  NgxGridFooterTemplateDirective,
  type GridColumnDef 
} from 'ngx-core-components';

@Component({
  standalone: true,
  imports: [
    DataGridComponent, 
    NgxGridCellTemplateDirective, 
    NgxGridEditCellTemplateDirective, 
    NgxGridFooterTemplateDirective
  ],
  template: \`
    <ngx-data-grid [data]="rows" [columns]="columns">
      <!-- 1. Custom Cell Template (e.g. rendering custom layout or Avatars) -->
      <ng-template ngxGridCellTemplate="name" let-value let-row="row">
        <div class="user-cell">
          <ngx-avatar [name]="value" size="sm"></ngx-avatar>
          <span class="user-name">{{ value }}</span>
        </div>
      </ng-template>

      <!-- 2. Custom Edit Cell Template -->
      <ng-template ngxGridEditCellTemplate="status" let-value let-update="updateDraft" let-draft="draftValue">
        <select [value]="draft" (change)="update($any($event.target).value)">
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </ng-template>

      <!-- 3. Custom Footer / Summary Cell Template -->
      <ng-template ngxGridFooterTemplate="salary" let-val="aggregationValue">
        <strong>Total Payroll: {{ val }}</strong>
      </ng-template>
    </ngx-data-grid>
  \`
})
export class MyCellTemplateComponent {
  columns: GridColumnDef[] = [
    { field: 'name', title: 'Name' },
    { field: 'status', title: 'Status', editable: true },
    { field: 'salary', title: 'Salary', aggregation: 'sum' }
  ];

  rows = [
    { id: 1, name: 'Alice', status: 'Active', salary: 120000 },
    { id: 2, name: 'Bob', status: 'Inactive', salary: 95000 }
  ];
}`;

  gridInputs: ApiRow[] = [
    { name: 'data', type: 'T[]', default: '[]', description: 'Rows to render. In server paging mode, pass current page rows.' },
    { name: 'columns', type: 'GridColumnDef[]', default: '[]', description: 'Column metadata including sorting/filter/edit flags.' },
    { name: 'page', type: 'number', default: '1', description: 'Controlled current page.' },
    { name: 'pageSize', type: 'number', default: '10', description: 'Rows per page.' },
    { name: 'total', type: 'number', default: '0', description: 'Total row count used in server paging mode.' },
    { name: 'sortMode', type: "'client' | 'server'", default: "'client'", description: 'Sort on the client or delegate to server.' },
    { name: 'filterMode', type: "'client' | 'server'", default: "'client'", description: 'Filter on the client or delegate to server.' },
    { name: 'groupMode', type: "'client' | 'server'", default: "'client'", description: 'Group on the client or use server groupedData.' },
    { name: 'pagingMode', type: "'client' | 'server'", default: "'client'", description: 'Page on the client or delegate to server.' },
    { name: 'groupBy', type: 'GridGroupState | null', default: 'null', description: 'Grouping descriptor (single-level grouping).' },
    { name: 'groupedData', type: 'GridGroupResult<T>[]', default: '[]', description: 'Server-provided grouped payload when groupMode is server.' },
    { name: 'headerTemplate', type: 'TemplateRef<GridHeaderTemplateContext<T>> | null', default: 'null', description: 'Custom header template.' },
    { name: 'cellTemplate', type: 'TemplateRef<GridCellTemplateContext<T>> | null', default: 'null', description: 'Custom cell template.' },
    { name: 'rowTemplate', type: 'TemplateRef<GridRowTemplateContext<T>> | null', default: 'null', description: 'Custom row template.' },
    { name: 'detailRowTemplate', type: 'TemplateRef<GridDetailTemplateContext<T>> | null', default: 'null', description: 'Nested/detail row template.' },
    { name: 'editable', type: 'boolean', default: 'false', description: 'Enables inline row editing controls.' },
    { name: 'stateKey', type: 'string', default: "''", description: 'Unique key to enable grid layout, sort, page, and filter persistence in localStorage.' },
    { name: 'reorderable', type: 'boolean', default: 'false', description: 'Allows users to drag and drop column headers to reorder columns.' },
    { name: 'multiSort', type: 'boolean', default: 'false', description: 'Enables sorting by multiple columns sequentially by holding Ctrl or Shift.' },
    { name: 'rowReorderable', type: 'boolean', default: 'false', description: 'Enables interactive drag-and-drop handles on rows to reorder them.' },
    { name: 'showGlobalSearch', type: 'boolean', default: 'false', description: 'Renders a global search input in the toolbar to filter rows.' },
    { name: 'globalSearchPlaceholder', type: 'string', default: "'Search...'", description: 'Placeholder for the global search input.' },
    { name: 'showColumnChooser', type: 'boolean', default: 'false', description: 'Enables Column Chooser dropdown button in the toolbar to toggle column visibility.' },
    { name: 'cellSelection', type: 'boolean', default: 'false', description: 'Enables Excel-like click-and-drag cell range selection.' },
    { name: 'enableContextMenu', type: 'boolean', default: 'false', description: 'Enables custom glassmorphism context menu with context-aware actions.' },
    { name: 'keyboardNavigation', type: 'boolean', default: 'false', description: 'Enables Excel-style keyboard navigation and cell editing.' },
    { name: 'groupAggregations', type: 'boolean', default: 'false', description: 'Enables aggregation subtotals directly inside the grouped header row cells.' },
  ];

  gridOutputs: ApiRow[] = [
    { name: '(dataStateChange)', type: 'GridDataStateChangeEvent', default: '—', description: 'Unified event for server operations: page, sort, filters, group.' },
    { name: '(sortChange)', type: 'GridSortChangeEvent', default: '—', description: 'Sort state changed.' },
    { name: '(filterChange)', type: 'GridFilterChangeEvent', default: '—', description: 'Filter descriptors changed.' },
    { name: '(groupChange)', type: 'GridGroupChangeEvent', default: '—', description: 'Grouping descriptor changed.' },
    { name: '(pageChange)', type: 'GridPageChangeEvent', default: '—', description: 'Page changed.' },
    { name: '(rowClick)', type: 'GridRowClickEvent<T>', default: '—', description: 'Row clicked.' },
    { name: '(selectionChange)', type: 'T[]', default: '—', description: 'Selected rows changed.' },
    { name: '(rowUpdate)', type: 'GridRowUpdateEvent<T>', default: '—', description: 'Inline edit saved with previous and updated rows.' },
    { name: '(columnReorder)', type: '{ columns: GridColumnDef<T>[] }', default: '—', description: 'Emitted when a column is dragged and reordered.' },
    { name: '(rowReorder)', type: '{ previousIndex: number, currentIndex: number, data: T[] }', default: '—', description: 'Emitted when a row is dragged and reordered.' },
    { name: '(cellSelectionChange)', type: '{ start: { row: T, colField: string }, end: { row: T, colField: string } } | null', default: '—', description: 'Emitted when cell selection range coordinates change.' },
  ];

  gridMethods: ApiRow[] = [
    { name: 'exportToJson', type: '(): void', default: '—', description: 'Triggers a client-side JSON format data download of all grid records.' },
    { name: 'exportToCsv', type: '(): void', default: '—', description: 'Triggers a client-side CSV format data download of all grid records.' },
    { name: 'exportToExcel', type: '(): void', default: '—', description: 'Triggers a client-side styled Excel Spreadsheet (.xls) format data download.' },
    { name: 'autoSizeColumn', type: '(col: GridColumnDef): void', default: '—', description: 'Automatically calculates and sets the column width based on its longest data value.' },
    { name: 'goPage', type: '(page: number): void', default: '—', description: 'Programmatically navigates the grid to a specific page index.' },
    { name: 'beginEdit', type: '(row: T, index: number): void', default: '—', description: 'Places the specified row in inline editing mode.' },
    { name: 'saveEdit', type: '(): void', default: '—', description: 'Commits inline row editing changes and saves data state.' },
    { name: 'cancelEdit', type: '(): void', default: '—', description: 'Cancels active inline row edit session, restoring previous cell values.' },
    { name: 'expandAllDetails', type: '(): void', default: '—', description: 'Expands all nested detail rows programmatically.' },
    { name: 'collapseAllDetails', type: '(): void', default: '—', description: 'Collapses all nested detail rows programmatically.' }
  ];
}
