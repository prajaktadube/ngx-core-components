import { Component, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  GanttChartComponent,
  GanttTask,
  GanttDependency,
  GanttConfig,
  ZoomLevel,
  GanttTaskChangeEvent,
  GanttTaskClickEvent,
  GanttDependencyClickEvent,
  DependencyType,
  GanttBaselineItem,
  GanttLinkDragEvent,
  GanttBarClickEvent
} from 'ngx-core-components';
import {
  getSampleTasks,
  getSampleDependencies,
  getTransportTasks,
  getTransportDependencies
} from '../../data/sample-tasks';

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

@Component({
  selector: 'app-gantt-demo',
  standalone: true,
  imports: [CommonModule, GanttChartComponent],
  template: `
    <div class="demo-page">
      <!-- Page Header -->
      <div class="page-header">
        <div class="page-header-text">
          <h1>Gantt Chart System</h1>
          <p>
            An enterprise-grade, high-performance SVG Gantt chart featuring drag-and-drop rescheduling,
            resize bounds, predecessor dependency linking, area-drag zoom-in, custom baseline tracking,
            and row virtualization.
          </p>
        </div>
        <div class="header-badges">
          <span class="badge badge-purple">SVG-Based</span>
          <span class="badge badge-blue">Virtualization</span>
          <span class="badge badge-green">Zero External Deps</span>
          <span class="badge badge-orange">Drag-to-Zoom</span>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="tab-nav">
        @for (tab of tabs; track tab) {
          <button
            class="tab-btn"
            [class.active]="activeTab() === tab"
            (click)="onTabChange(tab)"
          >
            {{ tab }}
          </button>
        }
      </div>

      <div class="tab-content">
        <!-- ===== BASIC GANTT VIEW ===== -->
        @if (activeTab() === 'Basic View') {
          <div class="scenario-panel">
            <div class="panel-desc-row">
              <div class="panel-desc-text">
                <h3>Standard Project Schedule</h3>
                <p>A basic timeline showing project stages, task groups, and visual connections. Features collapsible task rows and alternate grid line coloring options.</p>
              </div>
              <div class="panel-controls">
                <label class="toggle-control">
                  <input type="checkbox" [checked]="basicAlternateRows()" (change)="basicAlternateRows.set($any($event.target).checked)" />
                  Alternate Rows
                </label>
                <label class="toggle-control">
                  <input type="checkbox" [checked]="basicAlternateColumns()" (change)="basicAlternateColumns.set($any($event.target).checked)" />
                  Alternate Columns
                </label>
                <label class="toggle-control">
                  <input type="checkbox" [checked]="basicGantt?.showCriticalPath()" (change)="basicGantt?.toggleCriticalPath()" />
                  📌 Critical Path
                </label>
              </div>
            </div>

            <div class="demo-chart-container">
              <ngx-gantt-chart
                #basicGantt
                [tasks]="basicTasks()"
                [dependencies]="basicDependencies"
                [config]="basicConfig()"
                (taskChange)="onBasicTaskChange($event)"
                (taskClick)="onBasicTaskClick($event)"
              />
            </div>

            @if (selectedBasicTask()) {
              <div class="status-indicator">
                <strong>Selected:</strong> {{ selectedBasicTask()?.name }}
                <span class="separator">|</span>
                <strong>Progress:</strong> {{ selectedBasicTask()?.progress }}%
                <span class="separator">|</span>
                <strong>Date Range:</strong> {{ formatDate(selectedBasicTask()?.start) }} - {{ formatDate(selectedBasicTask()?.end) }}
              </div>
            }
          </div>
        }

        <!-- ===== INTERACTIVE PLAYGROUND ===== -->
        @if (activeTab() === 'Interactive Playground') {
          <div class="scenario-panel">
            <div class="panel-desc-row">
              <div class="panel-desc-text">
                <h3>Interactive Playground &amp; Logging</h3>
                <p>Reschedule tasks by dragging, resize durations from bar edges, double-click to drill-in, or draw dependency links. Use Shift + Drag or enable "Area Zoom" to drag a glassmorphic window to zoom directly into a timeline range.</p>
              </div>
              <div class="playground-toolbar">
                <div class="btn-group">
                  <button class="mini-btn" [class.active]="playZoom() === ZoomLevel.Day" (click)="setPlayZoom(ZoomLevel.Day)">Day</button>
                  <button class="mini-btn" [class.active]="playZoom() === ZoomLevel.Week" (click)="setPlayZoom(ZoomLevel.Week)">Week</button>
                  <button class="mini-btn" [class.active]="playZoom() === ZoomLevel.Month" (click)="setPlayZoom(ZoomLevel.Month)">Month</button>
                </div>

                <button class="action-btn" [class.active]="playgroundGantt?.isAreaZoomMode()" (click)="playgroundGantt?.toggleAreaZoomMode()">
                  🔍 Area Zoom Mode
                </button>
                @if (playgroundGantt?.isZoomed()) {
                  <button class="action-btn accent-action" (click)="playgroundGantt?.resetZoom()">
                    Reset Zoom
                  </button>
                }

                <div class="btn-divider"></div>

                <button class="action-btn" (click)="playgroundGantt.expandAll()">Expand All</button>
                <button class="action-btn" (click)="playgroundGantt.collapseAll()">Collapse All</button>
                <button class="action-btn" (click)="playgroundGantt.scrollToDate(today)">Go to Today</button>
                <button class="action-btn" (click)="clearPlayLog()">Clear Logs</button>
                <button class="action-btn primary-action" (click)="openAddTaskModal()">➕ Add Task</button>
              </div>
            </div>

            <div class="playground-config-row">
              <label class="select-control">
                Snap To
                <select [value]="playSnap()" (change)="playSnap.set($any($event.target).value)">
                  <option value="none">None (Smooth)</option>
                  <option value="day">Day</option>
                  <option value="hour">Hour</option>
                </select>
              </label>
              <label class="toggle-control">
                <input type="checkbox" [checked]="playShowGrid()" (change)="playShowGrid.set($any($event.target).checked)" />
                Grid Lines
              </label>
              <label class="toggle-control">
                <input type="checkbox" [checked]="playLinkable()" (change)="playLinkable.set($any($event.target).checked)" />
                Linkable
              </label>
              <label class="toggle-control">
                <input type="checkbox" [checked]="playSelectable()" (change)="playSelectable.set($any($event.target).checked)" />
                Selectable
              </label>
              <label class="toggle-control">
                <input type="checkbox" [checked]="playShowBaseline()" (change)="playShowBaseline.set($any($event.target).checked)" />
                Baselines
              </label>
              <label class="toggle-control">
                <input type="checkbox" [checked]="playDragToZoom()" (change)="playDragToZoom.set($any($event.target).checked)" />
                Drag to Zoom
              </label>
              <label class="toggle-control">
                <input type="checkbox" [checked]="playgroundGantt?.showCriticalPath()" (change)="playgroundGantt?.toggleCriticalPath()" />
                📌 Critical Path
              </label>
            </div>

            <div class="demo-chart-container">
              <ngx-gantt-chart
                #playgroundGantt
                [tasks]="playTasks()"
                [dependencies]="playDependencies()"
                [config]="playConfig()"
                [baselineItems]="playBaselineItems"
                (taskChange)="onPlayTaskChange($event)"
                (taskClick)="onPlayTaskClick($event)"
                (taskDblClick)="onPlayTaskDblClick($event)"
                (dependencyClick)="onPlayDependencyClick($event)"
                (linkDragEnded)="onPlayLinkDragEnded($event)"
              />
            </div>

            <!-- Event Log Feed -->
            <div class="log-panel">
              <div class="log-header">
                <span>Timeline Emitted Events Stream</span>
                <span class="log-count">{{ playLog.length }} Log Entries</span>
              </div>
              <div class="log-entries">
                @if (playLog.length === 0) {
                  <div class="log-empty">No interaction logs yet. Try dragging, resizing, or linking tasks...</div>
                }
                @for (log of playLog; track $index) {
                  <div class="log-line">{{ log }}</div>
                }
              </div>
            </div>
          </div>
        }

        <!-- ===== ENTERPRISE PERFORMANCE ===== -->
        @if (activeTab() === 'Enterprise Performance') {
          <div class="scenario-panel">
            <div class="panel-desc-row">
              <div class="panel-desc-text">
                <h3>Virtualized Row Rendering</h3>
                <p>Stress test the scheduler component. Only rows visible within the container viewport are rendered in the DOM, allowing thousands of tasks to render seamlessly at 60fps.</p>
              </div>
              <div class="panel-controls">
                <div class="btn-group">
                  <button class="mini-btn" [class.active]="perfCount() === 100" (click)="generatePerfTasks(100)">100 Rows</button>
                  <button class="mini-btn" [class.active]="perfCount() === 500" (click)="generatePerfTasks(500)">500 Rows</button>
                  <button class="mini-btn" [class.active]="perfCount() === 1000" (click)="generatePerfTasks(1000)">1000 Rows</button>
                </div>
                <span class="perf-stats">Render Count: <strong>{{ perfCount() }} tasks</strong></span>
              </div>
            </div>

            <div class="demo-chart-container">
              <ngx-gantt-chart
                [tasks]="perfTasks()"
                [config]="perfConfig"
              />
            </div>
          </div>
        }

        <!-- ===== TRANSPORT GANTT ===== -->
        @if (activeTab() === 'Transport Gantt') {
          <div class="scenario-panel">
            <div class="panel-desc-row">
              <div class="panel-desc-text">
                <h3>🚚 Transport Gantt</h3>
                <p>Real-time vehicle logistics tracking. Shows multiple independent task blocks sharing a single row (rowId representation) representing voyages, depart station indicators, transit periods, and hub layovers.</p>
              </div>
              <div class="playground-toolbar">
                <div class="btn-group">
                  <button class="mini-btn" [class.active]="transportZoom() === ZoomLevel.Hour" (click)="setTransportZoom(ZoomLevel.Hour)">🕒 Hour</button>
                  <button class="mini-btn" [class.active]="transportZoom() === ZoomLevel.Day" (click)="setTransportZoom(ZoomLevel.Day)">📅 Day</button>
                  <button class="mini-btn" [class.active]="transportZoom() === ZoomLevel.Week" (click)="setTransportZoom(ZoomLevel.Week)">📆 Week</button>
                </div>

                <div class="btn-divider"></div>

                <button class="action-btn" [class.active]="transportGantt?.isAreaZoomMode()" (click)="transportGantt?.toggleAreaZoomMode()">
                  🔍 Area Zoom Mode
                </button>
                @if (transportGantt?.isZoomed()) {
                  <button class="action-btn accent-action" (click)="transportGantt?.resetZoom()">
                    Reset Zoom
                  </button>
                }
              </div>
            </div>

            <div class="playground-config-row">
              <label class="toggle-control">
                <input type="checkbox" [checked]="transportAlternateRows()" (change)="transportAlternateRows.set($any($event.target).checked)" />
                Alternate Rows
              </label>
              <label class="toggle-control">
                <input type="checkbox" [checked]="transportAlternateColumns()" (change)="transportAlternateColumns.set($any($event.target).checked)" />
                Alternate Columns
              </label>

              <!-- Custom Legend -->
              <div class="logistics-legend">
                <span class="leg-item"><span class="leg-dot color-station"></span>Station Stop</span>
                <span class="leg-item"><span class="leg-dot color-transit"></span>Transit Leg</span>
                <span class="leg-item"><span class="leg-dot color-hub"></span>Hub Layover</span>
              </div>
            </div>

            <div class="demo-chart-container transport-container transport-card">
              <ngx-gantt-chart
                #transportGantt
                [tasks]="transportTasks"
                [dependencies]="[]"
                [config]="transportConfig()"
                [tooltipTemplate]="transportTooltip"
                (barClick)="onTransportBarClick($event)"
              />
            </div>

            <ng-template #transportTooltip let-ctx>
              @if (ctx.subtask) {
                <div class="tt-phase" [class.tt-station]="ctx.subtask.cssClass === 'station-pill'" [class.tt-hub]="ctx.subtask.cssClass === 'hub-badge'" [class.tt-transit]="ctx.subtask.cssClass === 'transit-arrow'">
                  <div class="tt-phase-icon">{{ ctx.subtask.cssClass === 'station-pill' ? '🟢' : ctx.subtask.cssClass === 'hub-badge' ? '🟡' : '➡️' }}</div>
                  <div class="tt-phase-body">
                    <div class="tt-phase-name">{{ ctx.subtask.name }}</div>
                    <div class="tt-phase-desc">{{ ctx.subtask.description }}</div>
                    <div class="tt-phase-times">
                      <span>{{ formatTime(ctx.subtask.start) }}</span>
                      <span class="tt-arrow">→</span>
                      <span>{{ formatTime(ctx.subtask.end) }}</span>
                    </div>
                    @if (ctx.subtask.progress != null) {
                      <div class="tt-progress-bar" style="margin-bottom: 6px;"><div class="tt-progress-fill" [style.width.%]="ctx.subtask.progress"></div></div>
                    }
                    <div class="tt-phase-meta" style="font-size: 10px; opacity: 0.75; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 5px; margin-top: 5px; display: flex; flex-direction: column; gap: 2px;">
                      <div style="display: flex; justify-content: space-between;"><span>Voyage ID:</span><span>{{ ctx.task.meta?.['voyageId'] }}</span></div>
                      <div style="display: flex; justify-content: space-between;"><span>Vehicle No:</span><span>{{ ctx.task.meta?.['vehicleNo'] }}</span></div>
                    </div>
                  </div>
                </div>
              } @else {
                <div class="tt-voyage">
                  <div class="tt-voyage-title">🚚 {{ ctx.task.meta?.['vehicle'] }}</div>
                  <div class="tt-voyage-route">{{ ctx.task.meta?.['origin'] }} → {{ ctx.task.meta?.['destination'] }}</div>
                  <div class="tt-voyage-row"><span>Voyage ID</span><span>{{ ctx.task.meta?.['voyageId'] }}</span></div>
                  <div class="tt-voyage-row"><span>Vehicle No</span><span>{{ ctx.task.meta?.['vehicleNo'] }}</span></div>
                  <div class="tt-voyage-row"><span>Voyage</span><span>#{{ ctx.task.meta?.['voyageNo'] }}</span></div>
                  <div class="tt-voyage-row"><span>Departs</span><span>{{ formatTime(ctx.task.start) }}</span></div>
                  <div class="tt-voyage-row"><span>Arrives</span><span>{{ formatTime(ctx.task.end) }}</span></div>
                  <div class="tt-voyage-row"><span>Progress</span><span>{{ ctx.task.progress }}%</span></div>
                </div>
              }
            </ng-template>
          </div>
        }

        <!-- ===== HOW TO USE ===== -->
        @if (activeTab() === 'How to Use') {
          <div class="doc-panel">
            <div class="doc-section">
              <h3>1. Import Subpackage Library</h3>
              <p>Import the Gantt components and interfaces from the core package library. It compiles as a standalone Angular component:</p>
              <div class="code-wrapper">
                <pre><code>{{ importCode }}</code></pre>
                <button class="copy-code-btn" (click)="copyCode(importCode, $event)">Copy Snippet</button>
              </div>
            </div>

            <div class="doc-section">
              <h3>2. Add Template Markup</h3>
              <p>Declare the directive component selector in your HTML markup, specifying input and output bindings:</p>
              <div class="code-wrapper">
                <pre><code>{{ templateCode }}</code></pre>
                <button class="copy-code-btn" (click)="copyCode(templateCode, $event)">Copy Snippet</button>
              </div>
            </div>

            <div class="doc-section">
              <h3>3. Bind Component Properties</h3>
              <p>Configure task arrays and setup basic configuration variables in your Typescript controller:</p>
              <div class="code-wrapper">
                <pre><code>{{ bindCode }}</code></pre>
                <button class="copy-code-btn" (click)="copyCode(bindCode, $event)">Copy Snippet</button>
              </div>
            </div>
          </div>
        }

        <!-- ===== API REFERENCE ===== -->
        @if (activeTab() === 'API Reference') {
          <div class="doc-panel">
            <h3>API Reference Documentation</h3>
            
            <div class="section-label">ngx-gantt-chart Inputs</div>
            <div class="api-table-wrapper">
              <table class="api-table">
                <thead>
                  <tr><th>Property</th><th>Type</th><th>Default</th><th>Description</th></tr>
                </thead>
                <tbody>
                  @for (row of ganttInputs; track row.name) {
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

            <div class="section-label">ngx-gantt-chart Outputs</div>
            <div class="api-table-wrapper">
              <table class="api-table">
                <thead>
                  <tr><th>Output Event</th><th>Payload Type</th><th>Description</th></tr>
                </thead>
                <tbody>
                  @for (row of ganttOutputs; track row.name) {
                    <tr>
                      <td class="api-name">{{ row.name }}</td>
                      <td class="api-type">{{ row.type }}</td>
                      <td>{{ row.description }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <div class="section-label">GanttConfig Properties</div>
            <div class="api-table-wrapper">
              <table class="api-table">
                <thead>
                  <tr><th>Field Name</th><th>Type</th><th>Default</th><th>Description</th></tr>
                </thead>
                <tbody>
                  @for (row of configFields; track row.name) {
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

            <div class="section-label">CSS Theme Customization (Variables)</div>
            <div class="api-table-wrapper">
              <table class="api-table">
                <thead>
                  <tr><th>Variable Name</th><th>Default fallback value</th><th>Description</th></tr>
                </thead>
                <tbody>
                  @for (row of cssVars; track row.name) {
                    <tr>
                      <td class="api-name">{{ row.name }}</td>
                      <td class="api-default">{{ row.default }}</td>
                      <td>{{ row.description }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      </div>

      <!-- Edit/Create Task Modal Overlay -->
      @if (editingTask()) {
        <div class="modal-overlay" (click)="closeEditModal()">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>{{ isAddingTask() ? 'Add New Task' : 'Edit Task Details' }}</h3>
              <button class="modal-close-btn" (click)="closeEditModal()">&times;</button>
            </div>
            
            <div class="modal-body">
              <div class="form-group">
                <label>Task Name</label>
                <input
                  type="text"
                  class="form-control"
                  [value]="editName()"
                  (input)="editName.set($any($event.target).value)"
                  placeholder="e.g. Design Database"
                />
              </div>

              <div class="form-group">
                <label>Progress (%)</label>
                <div class="slider-row">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    [value]="editProgress()"
                    (input)="editProgress.set(+$any($event.target).value)"
                  />
                  <span class="slider-value">{{ editProgress() }}%</span>
                </div>
              </div>

              <div class="form-group">
                <label>Assignee</label>
                <input
                  type="text"
                  class="form-control"
                  [value]="editAssignee()"
                  (input)="editAssignee.set($any($event.target).value)"
                  placeholder="e.g. Alice Smith"
                />
              </div>

              <div class="form-group">
                <label>Priority</label>
                <select
                  class="form-control"
                  [value]="editPriority()"
                  (change)="editPriority.set($any($event.target).value)"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div class="form-group">
                <label>Bar Color</label>
                <div class="color-picker-row">
                  <input
                    type="color"
                    class="color-picker-input"
                    [value]="editColor()"
                    (input)="editColor.set($any($event.target).value)"
                  />
                  <input
                    type="text"
                    class="form-control"
                    style="flex: 1;"
                    [value]="editColor()"
                    (input)="editColor.set($any($event.target).value)"
                  />
                </div>
              </div>
            </div>

            <div class="modal-footer">
              @if (!isAddingTask()) {
                <button class="modal-btn modal-btn-danger" (click)="deleteTask()">Delete Task</button>
              }
              <button class="modal-btn modal-btn-secondary" (click)="closeEditModal()">Cancel</button>
              <button class="modal-btn modal-btn-primary" (click)="saveTask()">Save Changes</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow-y: auto;
    }

    .demo-page {
      padding: 32px 40px;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    /* Page Header */
    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 20px;
      padding-bottom: 24px;
      border-bottom: 2px solid rgba(226, 232, 240, 0.8);
      flex-shrink: 0;
    }
    .page-header-text h1 {
      margin: 0 0 8px;
      font-size: 28px;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.5px;
    }
    .page-header-text p {
      margin: 0;
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.6;
      max-width: 750px;
    }
    .header-badges {
      display: flex;
      gap: 10px;
      flex-shrink: 0;
      flex-wrap: wrap;
    }

    /* Tabs Nav */
    .tab-nav {
      display: flex;
      gap: 0;
      border-bottom: 2px solid var(--border-color);
      overflow-x: auto;
      padding-bottom: 0;
      flex-shrink: 0;
    }
    .tab-btn {
      padding: 12px 20px;
      background: none;
      border: none;
      font-size: 14px;
      font-weight: 500;
      color: var(--text-secondary);
      cursor: pointer;
      border-bottom: 3px solid transparent;
      margin-bottom: -2px;
      font-family: inherit;
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    .tab-btn:hover {
      color: var(--text-primary);
      background: rgba(79, 70, 229, 0.05);
    }
    .tab-btn.active {
      color: var(--primary-color);
      border-bottom-color: var(--primary-color);
      font-weight: 600;
      background: rgba(79, 70, 229, 0.04);
    }

    /* Tab Contents */
    .tab-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .scenario-panel, .doc-panel {
      display: flex;
      flex-direction: column;
      gap: 20px;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 24px;
      box-shadow: var(--shadow-sm);
    }

    .panel-desc-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 20px;
      flex-wrap: wrap;
    }
    .panel-desc-text h3 {
      margin: 0 0 6px;
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary);
    }
    .panel-desc-text p {
      margin: 0;
      font-size: 13px;
      color: var(--text-secondary);
      max-width: 700px;
      line-height: 1.5;
    }

    /* Toolbars & Controls */
    .panel-controls {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }
    .playground-toolbar {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
    }
    .playground-config-row {
      display: flex;
      gap: 20px;
      align-items: center;
      padding: 14px 16px;
      background: var(--border-light);
      border-radius: 8px;
      flex-wrap: wrap;
    }

    .btn-group {
      display: inline-flex;
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid var(--border-color);
    }
    .mini-btn {
      padding: 7px 16px;
      font-size: 12px;
      font-weight: 600;
      background: var(--bg-secondary);
      border: none;
      border-right: 1px solid var(--border-color);
      cursor: pointer;
      color: var(--text-secondary);
      transition: all 0.15s ease;
      font-family: inherit;
    }
    .mini-btn:last-child {
      border-right: none;
    }
    .mini-btn:hover {
      background: var(--border-light);
      color: var(--text-primary);
    }
    .mini-btn.active {
      background: var(--primary-color) !important;
      color: #ffffff !important;
    }

    .btn-divider {
      width: 1px;
      height: 24px;
      background: var(--border-color);
      margin: 0 4px;
    }

    .action-btn {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 7px 12px;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-secondary);
      cursor: pointer;
      font-family: inherit;
      transition: all 0.15s ease;
    }
    .action-btn:hover, .action-btn.active {
      border-color: var(--primary-color);
      color: var(--primary-color);
      background: var(--primary-glow);
    }
    .action-btn.accent-action {
      background: #ef4444;
      border-color: #ef4444;
      color: #ffffff;
    }
    .action-btn.accent-action:hover {
      background: #dc2626;
      border-color: #dc2626;
      color: #ffffff;
    }

    .toggle-control {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-primary);
      cursor: pointer;
    }
    .toggle-control input[type="checkbox"] {
      width: 16px;
      height: 16px;
      accent-color: var(--primary-color);
      cursor: pointer;
    }

    .select-control {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary);
    }
    .select-control select {
      padding: 6px 12px;
      border-radius: 6px;
      border: 1px solid var(--border-color);
      background: var(--bg-secondary);
      color: var(--text-primary);
      font-family: inherit;
      font-size: 12px;
      outline: none;
      cursor: pointer;
    }
    .select-control select:focus {
      border-color: var(--primary-color);
    }

    /* Logistics Legend */
    .logistics-legend {
      display: flex;
      gap: 16px;
      margin-left: auto;
    }
    .leg-item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 500;
      color: var(--text-secondary);
    }
    .leg-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .color-station { background: #10b981; }
    .color-transit { background: #3b82f6; }
    .color-hub { background: #f59e0b; }

    /* Performance Stats */
    .perf-stats {
      font-size: 13px;
      color: var(--text-secondary);
    }

    /* Gantt Chart Container Box */
    .demo-chart-container {
      height: 480px;
      border: 1px solid var(--border-color);
      border-radius: 10px;
      overflow: hidden;
      background: var(--bg-secondary);
    }
    .demo-chart-container ngx-gantt-chart {
      width: 100%;
      height: 100%;
    }
    .transport-container {
      height: 400px;
    }

    /* Selected Details Panel */
    .status-indicator {
      padding: 12px 18px;
      background: linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%);
      border: 1px solid rgba(79, 70, 229, 0.15);
      border-radius: 8px;
      font-size: 13px;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 8px;
      width: max-content;
    }
    .separator {
      color: var(--border-color);
      margin: 0 4px;
    }

    /* Event Logs */
    .log-panel {
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;
      background: var(--bg-secondary);
      display: flex;
      flex-direction: column;
      height: 150px;
    }
    .log-header {
      background: var(--border-light);
      padding: 10px 16px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-secondary);
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid var(--border-color);
      flex-shrink: 0;
    }
    .log-count {
      color: var(--primary-color);
    }
    .log-entries {
      flex: 1;
      overflow-y: auto;
      padding: 8px 16px;
      font-family: 'SF Mono', Consolas, Monaco, monospace;
      font-size: 12px;
      line-height: 1.6;
    }
    .log-line {
      padding: 3px 0;
      color: var(--text-secondary);
      border-bottom: 1px solid var(--border-light);
    }
    .log-line:last-child {
      border-bottom: none;
    }
    .log-empty {
      font-style: italic;
      color: var(--text-secondary);
      text-align: center;
      margin-top: 16px;
    }

    /* How to Use Section */
    .doc-section {
      margin-bottom: 32px;
    }
    .doc-section:last-child {
      margin-bottom: 0;
    }
    .doc-section h3 {
      font-size: 16px;
      font-weight: 700;
      margin: 0 0 8px;
      color: var(--text-primary);
    }
    .doc-section p {
      font-size: 13px;
      color: var(--text-secondary);
      margin: 0 0 12px;
    }
    
    .code-wrapper {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #2d3748;
    }
    .code-wrapper pre {
      margin: 0;
      background: #1e293b;
      color: #f8fafc;
      padding: 18px 24px;
      font-family: 'Fira Code', Consolas, Monaco, monospace;
      font-size: 13px;
      line-height: 1.6;
      overflow-x: auto;
    }
    .copy-code-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 4px;
      color: #f8fafc;
      padding: 4px 8px;
      font-size: 11px;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s;
    }
    .copy-code-btn:hover {
      background: rgba(255, 255, 255, 0.18);
    }

    /* API Documentation Tables */
    .section-label {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--text-secondary);
      border-bottom: 2px solid var(--border-color);
      padding-bottom: 6px;
      margin: 28px 0 12px;
    }
    .section-label:first-of-type {
      margin-top: 0;
    }
    
    .api-table-wrapper {
      overflow-x: auto;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      box-shadow: var(--shadow-sm);
      margin-bottom: 20px;
    }
    .api-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    .api-table thead tr {
      background: var(--border-light);
    }
    .api-table th {
      padding: 12px 16px;
      text-align: left;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: var(--text-secondary);
      border-bottom: 1px solid var(--border-color);
      white-space: nowrap;
    }
    .api-table td {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-light);
      color: var(--text-primary);
      vertical-align: top;
      line-height: 1.5;
    }
    .api-table tbody tr:last-child td {
      border-bottom: none;
    }
    .api-table tbody tr:hover td {
      background: rgba(79, 70, 229, 0.02);
    }
    .api-name {
      color: var(--primary-color) !important;
      font-family: monospace;
      font-weight: 700;
      white-space: nowrap;
    }
    .api-type {
      color: #8e44ad !important;
      font-family: monospace;
      white-space: nowrap;
    }
    .api-default {
      color: #ef4444;
      font-family: monospace;
      white-space: nowrap;
      font-weight: 500;
    }

    /* Transport custom tooltip */
    .tt-voyage { min-width: 200px; }
    .tt-voyage-title { font-size: 13px; font-weight: 700; margin-bottom: 4px; color: #ffffff; }
    .tt-voyage-route { font-size: 11px; color: rgba(255,255,255,0.7); margin-bottom: 8px; }
    .tt-voyage-row { display: flex; justify-content: space-between; gap: 16px; font-size: 12px; margin-top: 3px; color: #ffffff; }
    .tt-voyage-row span:first-child { color: rgba(255,255,255,0.6); }
    .tt-voyage-row span:last-child { font-weight: 600; }
    .tt-phase { display: flex; gap: 10px; align-items: flex-start; min-width: 200px; color: #ffffff; }
    .tt-phase-icon { font-size: 18px; line-height: 1; padding-top: 2px; }
    .tt-phase-body { flex: 1; }
    .tt-phase-name { font-size: 13px; font-weight: 700; margin-bottom: 2px; }
    .tt-phase-desc { font-size: 11px; color: rgba(255,255,255,0.65); margin-bottom: 6px; }
    .tt-phase-times { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; margin-bottom: 6px; }
    .tt-arrow { color: rgba(255,255,255,0.4); }
    .tt-progress-bar { height: 4px; background: rgba(255,255,255,0.15); border-radius: 2px; overflow: hidden; }
    .tt-progress-fill { height: 100%; border-radius: 2px; background: #34d399; }
    .tt-station .tt-progress-fill { background: #34d399; }
    .tt-hub .tt-progress-fill { background: #fbbf24; }
    .tt-transit .tt-progress-fill { background: #60a5fa; }

    /* Transit arrow shape */
    :host ::ng-deep .transport-card .k-task-with-subtasks {
      overflow: visible;
      background: transparent !important;
    }
    :host ::ng-deep .k-subtask-segment.transit-arrow {
      clip-path: polygon(
        0% 20%,
        4px 0%,
        calc(100% - 10px) 0%,
        100% 50%,
        calc(100% - 10px) 100%,
        4px 100%,
        0% 80%
      );
      border-radius: 0;
      box-shadow: none;
      background: linear-gradient(90deg, #60a5fa 0%, #3b82f6 40%, #2563eb 100%) !important;
      transition: filter 0.2s ease, clip-path 0.2s ease;
    }
    :host ::ng-deep .k-subtask-segment.transit-arrow .k-subtask-text {
      padding: 0 14px 0 10px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    :host ::ng-deep .k-subtask-segment.transit-arrow:hover {
      clip-path: polygon(
        0% 12%,
        4px 0%,
        calc(100% - 12px) 0%,
        100% 50%,
        calc(100% - 12px) 100%,
        4px 100%,
        0% 88%
      );
      filter: brightness(1.18) drop-shadow(0 2px 4px rgba(37,99,235,0.35));
      transform: none;
      z-index: 2;
    }
    /* Station rounded pills */
    :host ::ng-deep .k-subtask-segment.station-pill {
      background: linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%) !important;
      box-shadow: 0 2px 6px rgba(16,185,129,0.35);
      transition: box-shadow 0.2s ease, transform 0.15s ease;
    }
    :host ::ng-deep .k-subtask-segment.station-pill .k-subtask-text {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.3px;
    }
    :host ::ng-deep .k-subtask-segment.station-pill:hover {
      box-shadow: 0 4px 14px rgba(16,185,129,0.45);
      transform: scale(1.06);
      z-index: 2;
    }
    /* Hub diamond badges */
    :host ::ng-deep .k-subtask-segment.hub-badge {
      border-radius: 0;
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%) !important;
      box-shadow: none;
      transition: filter 0.2s ease, transform 0.15s ease;
    }
    :host ::ng-deep .k-subtask-segment.hub-badge .k-subtask-text {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.3px;
      padding: 0 10px;
    }
    :host ::ng-deep .k-subtask-segment.hub-badge:hover {
      filter: brightness(1.12) drop-shadow(0 2px 4px rgba(245,158,11,0.4));
      transform: scaleY(1.1);
      z-index: 2;
    }

    /* Modal overlay and glassmorphism styling */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.4);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      opacity: 0;
      animation: fadeIn 0.25s forwards cubic-bezier(0.16, 1, 0.3, 1);
    }

    .modal-card {
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.05);
      border-radius: 16px;
      width: 480px;
      max-width: 90%;
      display: flex;
      flex-direction: column;
      transform: translateY(20px);
      animation: slideUp 0.3s forwards cubic-bezier(0.16, 1, 0.3, 1);
      overflow: hidden;
    }

    .modal-header {
      padding: 20px 24px;
      border-bottom: 1px solid var(--border-color, #e2e8f0);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .modal-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary, #0f172a);
    }
    .modal-close-btn {
      background: none;
      border: none;
      color: var(--text-secondary, #64748b);
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      transition: all 0.2s;
    }
    .modal-close-btn:hover {
      background: var(--border-light, #f1f5f9);
      color: var(--text-primary, #0f172a);
    }

    .modal-body {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 18px;
      overflow-y: auto;
      max-height: 60vh;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-group label {
      font-size: 11px;
      font-weight: 700;
      color: var(--text-secondary, #64748b);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .form-control {
      padding: 10px 14px;
      border-radius: 8px;
      border: 1px solid var(--border-color, #e2e8f0);
      background: var(--bg-secondary, #ffffff);
      color: var(--text-primary, #0f172a);
      font-family: inherit;
      font-size: 14px;
      outline: none;
      transition: all 0.2s;
    }
    .form-control:focus {
      border-color: var(--primary-color, #4f46e5);
      box-shadow: 0 0 0 3px var(--primary-glow, rgba(79, 70, 229, 0.15));
    }

    .color-picker-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .color-picker-input {
      width: 44px;
      height: 44px;
      padding: 0;
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 8px;
      cursor: pointer;
      background: none;
    }
    
    .slider-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .slider-row input[type="range"] {
      flex: 1;
      accent-color: var(--primary-color, #4f46e5);
    }
    .slider-value {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary, #0f172a);
      width: 36px;
      text-align: right;
    }

    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--border-color, #e2e8f0);
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      background: var(--border-light, #f8fafc);
    }
    
    .modal-btn {
      padding: 10px 18px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s;
      border: 1px solid transparent;
    }
    .modal-btn-secondary {
      background: var(--bg-secondary, #ffffff);
      border-color: var(--border-color, #e2e8f0);
      color: var(--text-primary, #0f172a);
    }
    .modal-btn-secondary:hover {
      background: var(--border-light, #f1f5f9);
    }
    .modal-btn-primary {
      background: var(--primary-color, #4f46e5);
      color: #ffffff;
    }
    .modal-btn-primary:hover {
      filter: brightness(1.05);
    }
    .modal-btn-danger {
      background: #ef4444;
      color: #ffffff;
      margin-right: auto;
    }
    .modal-btn-danger:hover {
      background: #dc2626;
    }

    .action-btn.primary-action {
      background: var(--primary-color, #4f46e5);
      border-color: var(--primary-color, #4f46e5);
      color: #ffffff;
    }
    .action-btn.primary-action:hover {
      filter: brightness(1.05);
      color: #ffffff;
    }

    @keyframes fadeIn {
      to { opacity: 1; }
    }
    @keyframes slideUp {
      to { transform: translateY(0); }
    }
  `]
})
export class GanttDemoComponent {
  @ViewChild('basicGantt') basicGantt!: GanttChartComponent;
  @ViewChild('playgroundGantt') playgroundGantt!: GanttChartComponent;
  @ViewChild('transportGantt') transportGantt!: GanttChartComponent;

  tabs = [
    'Basic View',
    'Interactive Playground',
    'Enterprise Performance',
    'Transport Gantt',
    'How to Use',
    'API Reference'
  ];

  activeTab = signal('Basic View');

  protected readonly ZoomLevel = ZoomLevel;
  today = new Date();

  // Basic Gantt Signals/Properties
  basicAlternateRows = signal(false);
  basicAlternateColumns = signal(false);
  basicTasks = signal<GanttTask[]>([]);
  basicDependencies: GanttDependency[] = getSampleDependencies();
  selectedBasicTask = signal<GanttTask | null>(null);

  basicConfig = computed<Partial<GanttConfig>>(() => ({
    zoomLevel: ZoomLevel.Day,
    rowHeight: 44,
    columnWidth: 36,
    headerHeight: 56,
    sidebarWidth: 320,
    showTodayMarker: true,
    showGrid: true,
    snapTo: 'day',
    collapsible: true,
    enableAlternateRowColor: this.basicAlternateRows(),
    enableAlternateColumnColor: this.basicAlternateColumns(),
  }));

  // Interactive Playground Signals/Properties
  playTasks = signal<GanttTask[]>([]);
  playDependencies = signal<GanttDependency[]>([]);
  playZoom = signal<ZoomLevel>(ZoomLevel.Day);
  playSnap = signal<'none' | 'day' | 'hour'>('day');
  playShowGrid = signal(true);
  playLinkable = signal(true);
  playSelectable = signal(true);
  playShowBaseline = signal(false);
  playDragToZoom = signal(true);
  playLog: string[] = [];

  playBaselineItems: GanttBaselineItem[] = [];

  // Edit Task modal state
  editingTask = signal<GanttTask | null>(null);
  isAddingTask = signal(false);
  editName = signal('');
  editProgress = signal(0);
  editColor = signal('#4f46e5');
  editAssignee = signal('');
  editPriority = signal<string>('Medium');

  playConfig = computed<Partial<GanttConfig>>(() => {
    const widthMap: Record<string, number> = {
      [ZoomLevel.Day]: 36,
      [ZoomLevel.Week]: 120,
      [ZoomLevel.Month]: 180,
    };

    return {
      zoomLevel: this.playZoom(),
      rowHeight: 38,
      columnWidth: widthMap[this.playZoom()],
      headerHeight: 56,
      sidebarWidth: 320,
      showTodayMarker: true,
      showGrid: this.playShowGrid(),
      snapTo: this.playSnap(),
      linkable: this.playLinkable(),
      selectable: this.playSelectable(),
      enableAlternateRowColor: true,
      enableDragToZoom: this.playDragToZoom()
    };
  });

  // Enterprise Performance Signals
  perfCount = signal(100);
  perfTasks = signal<GanttTask[]>([]);
  perfConfig: Partial<GanttConfig> = {
    zoomLevel: ZoomLevel.Day,
    rowHeight: 32,
    columnWidth: 30,
    headerHeight: 56,
    sidebarWidth: 300,
    showTodayMarker: true,
    showGrid: true,
    snapTo: 'day',
    collapsible: true,
  };

  // Transport Gantt Signals
  transportTasks: GanttTask[] = getTransportTasks();
  transportDependencies: GanttDependency[] = getTransportDependencies();
  transportZoom = signal<ZoomLevel>(ZoomLevel.Hour);
  transportAlternateRows = signal(true);
  transportAlternateColumns = signal(false);

  transportConfig = computed<Partial<GanttConfig>>(() => {
    const widthMap: Record<string, number> = {
      [ZoomLevel.Hour]: 48,
      [ZoomLevel.Day]: 120,
      [ZoomLevel.Week]: 240,
    };
    return {
      zoomLevel: this.transportZoom(),
      rowHeight: 64,
      columnWidth: widthMap[this.transportZoom()],
      headerHeight: 56,
      sidebarWidth: 260,
      showTodayMarker: false,
      showGrid: true,
      collapsible: false,
      snapTo: 'hour',
      linkable: false,
      selectable: false,
      enableAlternateRowColor: this.transportAlternateRows(),
      enableAlternateColumnColor: this.transportAlternateColumns(),
      enableDragToZoom: true,
      sidebarColumns: [
        { field: 'name', header: 'Vehicle', width: 260 },
      ],
    };
  });

  constructor(private route: ActivatedRoute) {
    this.resetBasicTasks();
    this.resetPlayTasks();
    this.generatePerfTasks(100);

    this.route.queryParams.subscribe(params => {
      const tab = params['tab'];
      if (tab) {
        const tabMap: Record<string, string> = {
          'basic': 'Basic View',
          'interactive': 'Interactive Playground',
          'performance': 'Enterprise Performance',
          'fleet': 'Transport Gantt',
          'how-to-use': 'How to Use',
          'api': 'API Reference'
        };
        if (tabMap[tab]) {
          this.activeTab.set(tabMap[tab]);
        }
      }
    });
  }

  onTabChange(tab: string): void {
    this.activeTab.set(tab);
    if (tab === 'Basic View') {
      this.resetBasicTasks();
    } else if (tab === 'Interactive Playground') {
      this.resetPlayTasks();
    }
  }

  // Basic handlers
  resetBasicTasks(): void {
    this.basicTasks.set(getSampleTasks());
    this.selectedBasicTask.set(null);
  }

  onBasicTaskChange(event: GanttTaskChangeEvent): void {
    this.basicTasks.update(tasks =>
      tasks.map(t =>
        t.id === event.task.id
          ? { ...t, start: event.task.start, end: event.task.end, subtasks: event.task.subtasks }
          : t
      )
    );
  }

  onBasicTaskClick(event: GanttTaskClickEvent): void {
    this.selectedBasicTask.set(event.task);
  }

  // Interactive handlers
  resetPlayTasks(): void {
    const tasks = getSampleTasks();
    this.playTasks.set(tasks);
    this.playDependencies.set(getSampleDependencies());

    // Generate matching baseline items (scheduled offset by -1 to -2 days to show deviations)
    this.playBaselineItems = tasks
      .filter(t => !t.parentId && !t.isMilestone)
      .map(t => {
        const start = new Date(t.start);
        start.setDate(start.getDate() - 2);
        const end = new Date(t.end);
        end.setDate(end.getDate() - 1);
        return { id: t.id, start, end };
      });
  }

  setPlayZoom(level: ZoomLevel): void {
    this.playZoom.set(level);
    this.logPlayEvent(`Zoom level changed to "${level}"`);
  }

  onPlayTaskChange(event: GanttTaskChangeEvent): void {
    this.playTasks.update(tasks =>
      tasks.map(t =>
        t.id === event.task.id
          ? { ...t, start: event.task.start, end: event.task.end, subtasks: event.task.subtasks }
          : t
      )
    );
    this.logPlayEvent(
      `Task Rescheduled: "${event.task.name}" from ${this.fmtDate(event.previousStart)} to ${this.fmtDate(event.task.start)}`
    );
  }

  onPlayTaskClick(event: GanttTaskClickEvent): void {
    this.logPlayEvent(`Task Clicked: "${event.task.name}" (${event.task.progress}% done)`);
  }

  onPlayTaskDblClick(event: GanttTaskClickEvent): void {
    this.logPlayEvent(`Task Double-Clicked: "${event.task.name}"`);
    this.isAddingTask.set(false);
    this.editingTask.set(event.task);
    this.editName.set(event.task.name);
    this.editProgress.set(event.task.progress);
    this.editColor.set(event.task.color || '#4f46e5');
    this.editAssignee.set((event.task.meta?.['assignee'] as string) || '');
    this.editPriority.set((event.task.meta?.['priority'] as string) || 'Medium');
  }

  openAddTaskModal(): void {
    this.isAddingTask.set(true);
    const newTask: GanttTask = {
      id: `task-${Date.now()}`,
      name: 'New Task',
      start: new Date(this.today),
      end: new Date(this.today.getTime() + 5 * 24 * 60 * 60 * 1000), // + 5 days
      progress: 0,
      parentId: null,
      collapsed: false,
      isMilestone: false,
      color: '#4f46e5',
      meta: { assignee: '', priority: 'Medium' }
    };
    this.editingTask.set(newTask);
    this.editName.set(newTask.name);
    this.editProgress.set(newTask.progress);
    this.editColor.set(newTask.color || '#4f46e5');
    this.editAssignee.set('');
    this.editPriority.set('Medium');
  }

  closeEditModal(): void {
    this.editingTask.set(null);
    this.isAddingTask.set(false);
  }

  saveTask(): void {
    const taskToSave = this.editingTask();
    if (!taskToSave) return;

    const updatedTask: GanttTask = {
      ...taskToSave,
      name: this.editName(),
      progress: Number(this.editProgress()),
      color: this.editColor(),
      meta: {
        ...(taskToSave.meta || {}),
        assignee: this.editAssignee(),
        priority: this.editPriority()
      }
    };

    if (this.isAddingTask()) {
      this.playTasks.update(tasks => [...tasks, updatedTask]);
      this.logPlayEvent(`Task Added: "${updatedTask.name}"`);
    } else {
      this.playTasks.update(tasks =>
        tasks.map(t => (t.id === updatedTask.id ? updatedTask : t))
      );
      this.logPlayEvent(`Task Updated: "${updatedTask.name}"`);
    }
    this.closeEditModal();
  }

  deleteTask(): void {
    const taskToDelete = this.editingTask();
    if (!taskToDelete) return;

    this.playTasks.update(tasks => tasks.filter(t => t.id !== taskToDelete.id));
    this.playDependencies.update(deps =>
      deps.filter(d => d.fromId !== taskToDelete.id && d.toId !== taskToDelete.id)
    );

    this.logPlayEvent(`Task Deleted: "${taskToDelete.name}"`);
    this.closeEditModal();
  }

  onPlayDependencyClick(event: GanttDependencyClickEvent): void {
    this.logPlayEvent(`Dependency Clicked: "${event.dependency.fromId}" ➔ "${event.dependency.toId}"`);
  }

  wouldCreateCycle(fromId: string, toId: string, dependencies: GanttDependency[]): boolean {
    if (fromId === toId) return true;
    const visited = new Set<string>();
    const adj = new Map<string, string[]>();
    for (const d of dependencies) {
      if (!adj.has(d.fromId)) adj.set(d.fromId, []);
      adj.get(d.fromId)!.push(d.toId);
    }
    const dfs = (node: string): boolean => {
      if (node === fromId) return true;
      if (visited.has(node)) return false;
      visited.add(node);
      const neighbors = adj.get(node) || [];
      for (const n of neighbors) {
        if (dfs(n)) return true;
      }
      return false;
    };
    return dfs(toId);
  }

  onPlayLinkDragEnded(event: GanttLinkDragEvent): void {
    if (event.source?.id && event.target?.id) {
      const fromId = event.source.id;
      const toId = event.target.id;

      if (this.wouldCreateCycle(fromId, toId, this.playDependencies())) {
        this.logPlayEvent(`⚠️ Cyclic Warning: Link "${fromId}" ➔ "${toId}" is rejected to prevent deadlock.`);
        return;
      }

      const exists = this.playDependencies().some(d => d.fromId === fromId && d.toId === toId);
      if (!exists) {
        const newDep: GanttDependency = {
          fromId: fromId,
          toId: toId,
          type: event.type ?? DependencyType.FinishToStart
        };
        this.playDependencies.update(d => [...d, newDep]);
        this.logPlayEvent(`Predecessor Link Created: "${fromId}" ➔ "${toId}"`);
      }
    }
  }

  clearPlayLog(): void {
    this.playLog = [];
  }

  private logPlayEvent(msg: string): void {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    this.playLog = [`[${time}] ${msg}`, ...this.playLog.slice(0, 24)];
  }

  // Performance generator
  generatePerfTasks(count: number): void {
    this.perfCount.set(count);
    const startBase = new Date();
    startBase.setHours(0, 0, 0, 0);

    const colors = ['#4a90d9', '#27ae60', '#8e44ad', '#e67e22', '#e74c3c', '#1abc9c', '#34495e'];
    const tasks: GanttTask[] = [];
    const phases = Math.ceil(count / 8);

    for (let p = 0; p < phases; p++) {
      const phaseStartOffset = p * 10;
      const phaseId = `perf-phase-${p}`;

      const pStart = new Date(startBase);
      pStart.setDate(pStart.getDate() + phaseStartOffset);
      const pEnd = new Date(pStart);
      pEnd.setDate(pEnd.getDate() + 12);

      tasks.push({
        id: phaseId,
        name: `Group Phase ${p + 1}`,
        start: pStart,
        end: pEnd,
        progress: Math.floor(Math.random() * 80) + 10,
        parentId: null,
        collapsed: p > 3,
        isMilestone: false,
      });

      const children = Math.min(8, count - tasks.length);
      for (let c = 0; c < children; c++) {
        const cStart = new Date(startBase);
        cStart.setDate(cStart.getDate() + phaseStartOffset + c);
        const cEnd = new Date(cStart);
        cEnd.setDate(cEnd.getDate() + Math.floor(Math.random() * 6) + 3);

        tasks.push({
          id: `perf-task-${p}-${c}`,
          name: `Task Item ${p + 1}.${c + 1}`,
          start: cStart,
          end: cEnd,
          progress: Math.floor(Math.random() * 100),
          parentId: phaseId,
          collapsed: false,
          isMilestone: false,
          color: colors[(p + c) % colors.length]
        });
      }

      if (tasks.length >= count) break;
    }
    this.perfTasks.set(tasks.slice(0, count));
  }

  // Transport handlers
  setTransportZoom(level: ZoomLevel): void {
    this.transportZoom.set(level);
  }

  onTransportBarClick(event: GanttBarClickEvent): void {
    const m = event.task.meta;
    if (m) {
      console.log(`[Transport] ${m['vehicle']} — Voyage ${m['voyageNo']}: ${m['route']}`);
    }
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Shared date utilities
  formatDate(date: Date | undefined): string {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  private fmtDate(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  copyCode(text: string, event: MouseEvent): void {
    navigator.clipboard.writeText(text).then(() => {
      const btn = event.target as HTMLButtonElement;
      const original = btn.innerText;
      btn.innerText = 'Copied!';
      btn.style.background = '#27ae60';
      btn.style.borderColor = '#27ae60';
      setTimeout(() => {
        btn.innerText = original;
        btn.style.background = '';
        btn.style.borderColor = '';
      }, 1500);
    });
  }

  // Code snippets for docs
  importCode = `import { Component } from '@angular/core';
import { GanttChartComponent } from 'ngx-core-components';

@Component({
  selector: 'app-my-schedule',
  standalone: true,
  imports: [GanttChartComponent],
  templateUrl: './my-schedule.component.html',
})
export class MyScheduleComponent {}`;

  templateCode = `<ngx-gantt-chart
  [tasks]="tasks"
  [dependencies]="dependencies"
  [config]="config"
  [baselineItems]="baselines"
  (taskChange)="onTaskChange($event)"
  (taskClick)="onTaskClick($event)"
  (linkDragEnded)="onLinkDragEnded($event)"
/>`;

  bindCode = `import { Component, signal } from '@angular/core';
import { GanttTask, GanttDependency, GanttConfig, ZoomLevel } from 'ngx-core-components';

@Component({ ... })
export class MyScheduleComponent {
  tasks: GanttTask[] = [
    {
      id: '1',
      name: 'Planning Stage',
      start: new Date(2026, 4, 1),
      end: new Date(2026, 4, 10),
      progress: 60,
      parentId: null,
      collapsed: false,
      isMilestone: false,
    }
  ];

  dependencies: GanttDependency[] = [];
  baselines = [
    { taskId: '1', start: new Date(2026, 4, 1), end: new Date(2026, 4, 9) }
  ];

  config: Partial<GanttConfig> = {
    zoomLevel: ZoomLevel.Day,
    rowHeight: 40,
    sidebarWidth: 320,
    enableDragToZoom: true
  };

  onTaskChange(event: GanttTaskChangeEvent): void {
    console.log('Task rescheduled', event.task);
  }
}`;

  // API Reference Data
  ganttInputs: ApiRow[] = [
    { name: 'tasks', type: 'GanttTask[]', default: 'required', description: 'Collection of tasks to render in the grid hierarchy and timeline.' },
    { name: 'dependencies', type: 'GanttDependency[]', default: '[]', description: 'Connection links depicting task predecessor/successor relationships.' },
    { name: 'config', type: 'Partial<GanttConfig>', default: '{}', description: 'Configuration object to control row height, snapping, linking permissions, and drag zoom.' },
    { name: 'baselineItems', type: 'GanttBaselineItem[]', default: '[]', description: 'Reference schedule baselines shown as lower-bar tracks on task rows.' }
  ];

  ganttOutputs: ApiRow[] = [
    { name: '(taskChange)', type: 'GanttTaskChangeEvent', default: '', description: 'Fired when a task is moved or resized horizontally in the timeline. Contains previousStart.' },
    { name: '(taskClick)', type: 'GanttTaskClickEvent', default: '', description: 'Fired when the user clicks a task row or Gantt bar.' },
    { name: '(taskDblClick)', type: 'GanttTaskClickEvent', default: '', description: 'Fired when a Gantt bar is double-clicked.' },
    { name: '(dependencyClick)', type: 'GanttDependencyClickEvent', default: '', description: 'Fired when a predecessor dependency connection line is clicked.' },
    { name: '(linkDragEnded)', type: 'GanttLinkDragEvent', default: '', description: 'Fired when a user drags a link handle and releases it onto another task.' }
  ];

  configFields: ApiRow[] = [
    { name: 'zoomLevel', type: 'ZoomLevel', default: "'day'", description: 'Active zoom magnification: "hour" | "day" | "week" | "month" | "quarter" | "year"' },
    { name: 'rowHeight', type: 'number', default: '40', description: 'Height of each row in pixels.' },
    { name: 'columnWidth', type: 'number', default: '40', description: 'Width of a single unit of time column at the active zoom.' },
    { name: 'sidebarWidth', type: 'number', default: '300', description: 'Width of the left sidebar grid.' },
    { name: 'showTodayMarker', type: 'boolean', default: 'true', description: 'Draws a red vertical line over the current date.' },
    { name: 'showGrid', type: 'boolean', default: 'true', description: 'Shows column and row grid lines in the timeline view.' },
    { name: 'snapTo', type: "'day' | 'hour' | 'none'", default: "'day'", description: 'Grid snaps rescheduling movements to exact days or hours.' },
    { name: 'linkable', type: 'boolean', default: 'true', description: 'Allows users to draw connections between task bars.' },
    { name: 'selectable', type: 'boolean', default: 'true', description: 'Allows rows to be highlighted and selected.' },
    { name: 'enableAlternateRowColor', type: 'boolean', default: 'false', description: 'Alternates row colors for enhanced visual scanning.' },
    { name: 'enableAlternateColumnColor', type: 'boolean', default: 'false', description: 'Alternates column colors for enhanced visual scanning.' },
    { name: 'enableDragToZoom', type: 'boolean', default: 'true', description: 'Enables Shift + drag and Area Selection Zoom timeline modes.' }
  ];

  cssVars = [
    { name: '--ngx-gantt-bg', default: '#ffffff', description: 'Background of the Gantt container.' },
    { name: '--ngx-gantt-border', default: '#e2e8f0', description: 'Border of the Gantt components.' },
    { name: '--ngx-gantt-header-bg', default: '#f8fafc', description: 'Background color of the timeline headers.' },
    { name: '--ngx-gantt-bar-bg', default: '#4f46e5', description: 'Background fill color of the task bars.' },
    { name: '--ngx-gantt-bar-progress-bg', default: '#3730a3', description: 'Background fill color of task progress completion.' },
    { name: '--ngx-gantt-today-color', default: '#ef4444', description: 'Color of today indicator line.' },
    { name: '--ngx-gantt-weekend-bg', default: 'transparent', description: 'Overlay background tint for Saturday & Sunday columns.' }
  ];
}
