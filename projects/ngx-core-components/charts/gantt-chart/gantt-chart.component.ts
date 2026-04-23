import {
  Component,
  ChangeDetectionStrategy,
  effect,
  input,
  output,
  computed,
  signal,
  viewChild,
  inject,
  ElementRef,
} from '@angular/core';
import {
  GanttTask,
  GanttSubtask,
  GanttDependency,
  DependencyType,
  GanttConfig,
  GanttColumnDef,
  GanttLinkLineType,
  DEFAULT_GANTT_CONFIG,
  ZoomLevel,
  GanttGroup,
  GanttBaselineItem,
  GanttTaskChangeEvent,
  GanttTaskClickEvent,
  GanttDependencyClickEvent,
  GanttScrollEvent,
  GanttDragEvent,
  GanttLinkDragEvent,
  GanttLineClickEvent,
  GanttBarClickEvent,
  GanttSelectedEvent,
  GanttTableDragStartedEvent,
  GanttTableDragEndedEvent,
  GanttTableDragDroppedEvent,
  GanttLoadOnScrollEvent,
  GanttVirtualScrolledIndexChangeEvent,
  GanttViewChangeEvent,
  GanttExpandChangeEvent,
} from './models';
import { GanttScaleService } from './services/gantt-scale.service';
import { GanttLayoutService, FlatRow } from './services/gantt-layout.service';
import { GanttKeyboardService } from './services/gantt-keyboard.service';
import { GanttPrintService } from './services/gantt-print.service';
import {
  getDateRange,
  getColumnDates,
  isWeekend,
  startOfDay,
  addDays,
} from './utils/date-utils';
import { Rect, computeDependencyPath } from './utils/svg-utils';

@Component({
  selector: 'ngx-gantt-chart',
  standalone: true,
  imports: [],
  providers: [GanttScaleService, GanttLayoutService, GanttKeyboardService, GanttPrintService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="k-gantt" [class.k-gantt-dark]="false" [class.k-no-grid]="!mergedConfig().showGrid" [style]="themeVars()" (keydown)="onKeyDown($event)">

      @if (mergedConfig().showToolbar) {
        <div class="k-gantt-toolbar">
          <div class="k-toolbar-group k-toolbar-views">
            @for (vt of mergedConfig().toolbarOptions.viewTypes; track vt) {
              <button class="k-toolbar-btn" [class.k-active]="mergedConfig().zoomLevel === vt" (click)="onToolbarViewChange(vt)">{{ getViewLabel(vt) }}</button>
            }
          </div>
          <div class="k-toolbar-group">
            <button class="k-toolbar-btn" (click)="scrollToToday()" title="Go to Today">Today</button>
            @if (mergedConfig().collapsible) {
              <button class="k-toolbar-btn" (click)="expandAll()">Expand</button>
              <button class="k-toolbar-btn" (click)="collapseAll()">Collapse</button>
            }
          </div>
        </div>
      }

      <div class="k-gantt-body">
        <div class="k-gantt-treelist" [style.width.px]="mergedConfig().sidebarWidth">
          <div class="k-treelist-header" [style.height.px]="mergedConfig().headerHeight">
            <table class="k-treelist-header-table">
              <colgroup>
                @for (col of sidebarColumns(); track col.header + '-' + $index) { <col [style.width.px]="col.width"/> }
              </colgroup>
              <thead><tr>
                @for (col of sidebarColumns(); track col.header + '-' + $index) { <th class="k-header-cell">{{ col.header }}</th> }
              </tr></thead>
            </table>
          </div>
          <div class="k-treelist-content" #treelistContent>
            <table class="k-treelist-table">
              <colgroup>
                @for (col of sidebarColumns(); track col.header + '-' + $index) { <col [style.width.px]="col.width"/> }
              </colgroup>
              <tbody>
                @for (row of renderedRows(); track row.task.id; let i = $index) {
                  <tr class="k-treelist-row" [class.k-group-header-row]="row.isGroupHeader" [style.height.px]="mergedConfig().rowHeight"
                    [class.k-alt]="i % 2 === 1 && !row.isGroupHeader" [class.k-selected]="isTaskSelected(row.task.id)" [class.k-hover]="hoveredTaskId() === row.task.id"
                    (mouseenter)="hoveredTaskId.set(row.task.id)" (mouseleave)="hoveredTaskId.set(null)" (click)="onRowClick(row.task, $event)">
                    @if (row.isGroupHeader) {
                      <td class="k-treelist-cell k-group-cell" [attr.colspan]="sidebarColumns().length">
                        @if (mergedConfig().collapsible) {
                          <button class="k-collapse-btn" (click)="onToggleGroupCollapse(row.group!); $event.stopPropagation()" [attr.aria-expanded]="row.group!.expanded !== false">
                            <span class="k-icon" [class.k-collapsed]="row.group!.expanded === false">&#9660;</span>
                          </button>
                        }
                        <span class="k-group-title">{{ row.task.name }}</span>
                      </td>
                    } @else {
                      @for (col of sidebarColumns(); track col.header + '-' + $index; let colIndex = $index) {
                        <td class="k-treelist-cell" [class.k-name-cell]="isNameColumn(col, colIndex)" [class.k-date-cell]="isDateColumn(col)" [class.k-pct-cell]="isProgressColumn(col)">
                          @if (isNameColumn(col, colIndex)) {
                            @if (mergedConfig().tableDraggable && row.task.itemDraggable !== false) {
                              <span class="k-drag-handle" draggable="true" (dragstart)="onTableDragStart($event, row)" (dragend)="onTableDragEnd($event, row)" title="Drag to reorder">&#8942;&#8942;</span>
                            }
                            <span class="k-indent" [style.width.px]="row.depth * 20"></span>
                            @if (row.hasChildren && mergedConfig().collapsible) {
                              <button class="k-collapse-btn" (click)="onToggleCollapse(row.task.id); $event.stopPropagation()" [attr.aria-expanded]="!row.task.collapsed">
                                <span class="k-icon" [class.k-collapsed]="row.task.collapsed">&#9660;</span>
                              </button>
                            } @else { <span class="k-collapse-spacer"></span> }
                            @if (row.task.isMilestone) { <span class="k-milestone-icon">&#9670;</span> }
                            <div class="k-name-wrapper">
                              <span class="k-task-name" [class.k-summary-name]="row.hasChildren" [title]="row.task.name">{{ row.task.name }}</span>
                              @if (row.extraTasks.length > 0) {
                                <div class="k-extra-tasks-chips">
                                  @for (extra of row.extraTasks; track extra.id) {
                                    <span class="k-extra-task-chip" [style.background]="extra.color || '#6c757d'" [title]="extra.name">{{ extra.name.length > 14 ? extra.name.slice(0, 14) + '\u2026' : extra.name }}</span>
                                  }
                                </div>
                              }
                            </div>
                          } @else if (isProgressColumn(col) && row.extraTasks.length > 0) {
                            <span class="k-multi-pct" [title]="getRowProgressTitle(row)">~{{ getRowAvgProgress(row) }}%</span>
                          } @else { {{ getSidebarCellValue(row, col) }} }
                        </td>
                      }
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <div class="k-splitbar" (pointerdown)="onSplitBarDown($event)"><span class="k-splitbar-icon">&#8942;</span></div>

        <div class="k-gantt-timeline">
          <div class="k-timeline-header" [style.height.px]="mergedConfig().headerHeight">
            <div class="k-timeline-header-wrap" [style.width.px]="totalWidth()" [style.margin-left.px]="-(scrollLeft())">
              <div class="k-header-row k-header-primary">
                @for (group of primaryHeaderGroups(); track group.label + group.x) {
                  <div class="k-header-group-cell" [style.left.px]="group.x" [style.width.px]="group.width">{{ group.label }}</div>
                }
              </div>
              <div class="k-header-row k-header-secondary">
                @for (col of headerColumns(); track col.x) {
                  <div class="k-header-tick-cell" [style.left.px]="col.x" [style.width.px]="col.width" [class.k-weekend]="col.isWeekend" [class.k-today-header]="col.isToday">{{ col.label }}</div>
                }
              </div>
            </div>
          </div>

          <div class="k-timeline-content" #timelineContent (scroll)="onTimelineScroll()">
            <div class="k-timeline-canvas" [style.width.px]="totalWidth()" [style.height.px]="totalHeight()">
              <div class="k-gantt-rows">
                @for (row of renderedRows(); track row.task.id; let i = $index) {
                  <div class="k-gantt-row" [class.k-group-row]="row.isGroupHeader" [style.top.px]="i * mergedConfig().rowHeight" [style.height.px]="mergedConfig().rowHeight"
                    [class.k-alt]="i % 2 === 1 && !row.isGroupHeader" [class.k-hover]="hoveredTaskId() === row.task.id" [class.k-selected]="isTaskSelected(row.task.id)"
                    (mouseenter)="hoveredTaskId.set(row.task.id)" (mouseleave)="hoveredTaskId.set(null)"
                    (dragover)="mergedConfig().tableDraggable ? onTableDragOver($event, row) : null" (drop)="mergedConfig().tableDraggable ? onTableDrop($event, row) : null">
                  </div>
                }
              </div>

              @if (mergedConfig().showGrid) {
                <div class="k-gantt-columns">
                  @for (col of headerColumns(); track col.x) {
                    <div class="k-gantt-column" [style.left.px]="col.x" [style.width.px]="col.width" [style.height.px]="totalHeight()" [class.k-weekend-col]="col.isWeekend"></div>
                  }
                </div>
              }

              @if (mergedConfig().showTodayMarker && todayX() !== null) {
                <div class="k-today-marker" [style.left.px]="todayX()" [style.height.px]="totalHeight()"><div class="k-today-indicator"></div></div>
              }

              @if (mergedConfig().showBaseline && baselineItems().length > 0) {
                <div class="k-gantt-baselines">
                  @for (bl of baselineBars(); track bl.id) {
                    <div class="k-baseline-bar" [style.top.px]="bl.top" [style.left.px]="bl.left" [style.width.px]="bl.width" [style.height.px]="mergedConfig().barHeight"></div>
                  }
                </div>
              }

              <div class="k-gantt-tasks">
                @for (bar of taskBars(); track bar.task.id) {
                  <div class="k-task-wrap" [style.top.px]="bar.top" [style.height.px]="mergedConfig().rowHeight" [class]="bar.task.cssClass || ''">
                    @if (bar.isGroupHeader) {
                    } @else if (bar.task.isMilestone) {
                      <div class="k-milestone" [style.left.px]="bar.left - 8" [class.k-focused]="keyboardService.focusedTaskId() === bar.task.id" [class.k-selected]="isTaskSelected(bar.task.id)"
                        (mouseenter)="hoveredTaskId.set(bar.primaryTaskId); showTooltip(bar.task, $event)" (mouseleave)="hoveredTaskId.set(null); hideTooltip()"
                        (click)="onTaskBarClick(bar.task, $event)" (dblclick)="onTaskBarDblClick(bar.task, $event)" tabindex="0" [attr.aria-label]="'Milestone: ' + bar.task.name">
                        <div class="k-milestone-diamond" [style.background]="bar.task.color || '#e74c3c'"></div>
                      </div>
                    } @else if (bar.task.type === 'range') {
                      <div class="k-task k-task-range" [style.left.px]="bar.left" [style.width.px]="bar.width" [style.background]="bar.task.color || '#ff9f73'"
                        [class.k-selected]="isTaskSelected(bar.task.id)"
                        (mouseenter)="hoveredTaskId.set(bar.primaryTaskId); showTooltip(bar.task, $event)" (mouseleave)="hoveredTaskId.set(null); hideTooltip()"
                        (click)="onTaskBarClick(bar.task, $event)" tabindex="0" [attr.aria-label]="bar.task.name">
                        <span class="k-task-text">{{ bar.task.name }}</span>
                        @if (mergedConfig().linkable && bar.task.linkable !== false) {
                          <div class="k-link-connector k-link-start" (pointerdown)="onLinkDragStart($event, bar.task, 'start')"></div>
                          <div class="k-link-connector k-link-end" (pointerdown)="onLinkDragStart($event, bar.task, 'end')"></div>
                        }
                      </div>
                    } @else if (bar.isSummary) {
                      <div class="k-task-summary" [style.left.px]="bar.left" [style.width.px]="bar.width" [class.k-selected]="isTaskSelected(bar.task.id)"
                        (mouseenter)="hoveredTaskId.set(bar.primaryTaskId); showTooltip(bar.task, $event)" (mouseleave)="hoveredTaskId.set(null); hideTooltip()"
                        (click)="onTaskBarClick(bar.task, $event)" tabindex="0">
                        <div class="k-summary-bar"><div class="k-summary-progress" [style.width.%]="bar.task.progress"></div></div>
                        <div class="k-summary-left-cap"></div><div class="k-summary-right-cap"></div>
                      </div>
                    } @else if (bar.task.subtasks && bar.task.subtasks.length > 0) {
                      <div class="k-task k-task-with-subtasks" [style.left.px]="bar.left" [style.width.px]="bar.width" [style.background]="bar.task.color || '#e9ecef'"
                        [class.k-selected]="isTaskSelected(bar.task.id)"
                        (mouseenter)="hoveredTaskId.set(bar.primaryTaskId)" (mouseleave)="hoveredTaskId.set(null); hideTooltip()"
                        (pointerdown)="onBarPointerDown($event, bar.task, 'move')" (click)="onTaskBarClick(bar.task, $event)"
                        tabindex="0" role="img" [attr.aria-label]="bar.task.name + ' with ' + bar.task.subtasks.length + ' subtasks'">
                        @for (sub of getSubtaskBars(bar); track sub.subtask.id) {
                          <div class="k-subtask-segment" [class]="sub.subtask.cssClass || ''" [style.left.px]="sub.left" [style.width.px]="sub.width" [style.background]="sub.subtask.color"
                            [title]="sub.subtask.name"
                            (mouseenter)="showSubtaskTooltip(bar.task, sub.subtask, $event); $event.stopPropagation()" (mouseleave)="hideTooltip()">
                            @if (sub.width > 40) { <span class="k-subtask-text">{{ sub.subtask.name }}</span> }
                            @if (sub.subtask.progress != null) { <div class="k-subtask-progress" [style.width.%]="sub.subtask.progress"></div> }
                          </div>
                        }
                        @if (bar.task.draggable !== false) {
                          <div class="k-resize-handle k-resize-w" (pointerdown)="onBarPointerDown($event, bar.task, 'resize-left')"></div>
                          <div class="k-resize-handle k-resize-e" (pointerdown)="onBarPointerDown($event, bar.task, 'resize-right')"></div>
                        }
                        @if (mergedConfig().linkable && bar.task.linkable !== false) {
                          <div class="k-link-connector k-link-start" (pointerdown)="onLinkDragStart($event, bar.task, 'start')"></div>
                          <div class="k-link-connector k-link-end" (pointerdown)="onLinkDragStart($event, bar.task, 'end')"></div>
                        }
                      </div>
                    } @else {
                      <div class="k-task" [style.left.px]="bar.left" [style.width.px]="bar.width" [style.background]="bar.task.color || 'var(--k-primary, #4a90d9)'"
                        [class.k-focused]="keyboardService.focusedTaskId() === bar.task.id" [class.k-selected]="isTaskSelected(bar.task.id)"
                        (mouseenter)="hoveredTaskId.set(bar.primaryTaskId); showTooltip(bar.task, $event)" (mouseleave)="hoveredTaskId.set(null); hideTooltip()"
                        (pointerdown)="onBarPointerDown($event, bar.task, 'move')" (click)="onTaskBarClick(bar.task, $event)" (dblclick)="onTaskBarDblClick(bar.task, $event)"
                        tabindex="0" role="img" [attr.aria-label]="bar.task.name + ' - ' + bar.task.progress + '% complete'">
                        <div class="k-task-progress" [style.width.%]="bar.task.progress"><div class="k-task-progress-inner"></div></div>
                        <span class="k-task-text">{{ bar.task.name }}</span>
                        @if (bar.task.draggable !== false) {
                          <div class="k-resize-handle k-resize-w" (pointerdown)="onBarPointerDown($event, bar.task, 'resize-left')"></div>
                          <div class="k-resize-handle k-resize-e" (pointerdown)="onBarPointerDown($event, bar.task, 'resize-right')"></div>
                        }
                        @if (mergedConfig().linkable && bar.task.linkable !== false) {
                          <div class="k-link-connector k-link-start" (pointerdown)="onLinkDragStart($event, bar.task, 'start')"></div>
                          <div class="k-link-connector k-link-end" (pointerdown)="onLinkDragStart($event, bar.task, 'end')"></div>
                        }
                      </div>
                    }
                  </div>
                }
              </div>

              <svg class="k-gantt-dependencies" [attr.width]="totalWidth()" [attr.height]="totalHeight()">
                <defs>
                  @if (mergedConfig().linkOptions.showArrow !== false) {
                    <marker id="k-arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="var(--k-danger, #ff6358)"/>
                    </marker>
                  }
                </defs>
                @for (dep of dependencyPaths(); track dep.key) {
                  <path class="k-dep-line" [attr.d]="dep.path" [attr.stroke]="dep.color"
                    [attr.marker-end]="mergedConfig().linkOptions.showArrow !== false ? 'url(#k-arrowhead)' : null"
                    [class]="dep.dependency.cssClass || ''" (click)="onDependencyClick(dep.dependency, $event)"/>
                }
                @if (linkDragLine()) {
                  <line class="k-link-drag-line" [attr.x1]="linkDragLine()!.x1" [attr.y1]="linkDragLine()!.y1" [attr.x2]="linkDragLine()!.x2" [attr.y2]="linkDragLine()!.y2"
                    stroke="#ff6358" stroke-width="2" stroke-dasharray="4 3"/>
                }
              </svg>
            </div>
          </div>
        </div>
      </div>

      @if (showLoading()) {
        <div class="k-loading-overlay"><div class="k-loading-spinner"><div class="k-spinner-circle"></div><span class="k-loading-text">Loading\u2026</span></div></div>
      }
    </div>

    @if (tooltipTask()) {
      <div class="k-bar-tooltip" [style.left.px]="tooltipX()" [style.top.px]="tooltipY()">
        <div class="k-bar-tooltip-title">{{ tooltipTask()!.name }}</div>
        @if (tooltipSubtask()) {
          <div class="k-bar-tooltip-row"><span class="k-bar-tooltip-label">Subtask</span><span class="k-bar-tooltip-value">{{ tooltipSubtask()!.name }}</span></div>
          <div class="k-bar-tooltip-row"><span class="k-bar-tooltip-label">Start</span><span class="k-bar-tooltip-value">{{ formatDateFull(tooltipSubtask()!.start) }}</span></div>
          <div class="k-bar-tooltip-row"><span class="k-bar-tooltip-label">End</span><span class="k-bar-tooltip-value">{{ formatDateFull(tooltipSubtask()!.end) }}</span></div>
          @if (tooltipSubtask()!.progress != null) { <div class="k-bar-tooltip-row"><span class="k-bar-tooltip-label">Progress</span><span class="k-bar-tooltip-value">{{ tooltipSubtask()!.progress }}%</span></div> }
        } @else {
          <div class="k-bar-tooltip-row"><span class="k-bar-tooltip-label">Start</span><span class="k-bar-tooltip-value">{{ formatDateFull(tooltipTask()!.start) }}</span></div>
          <div class="k-bar-tooltip-row"><span class="k-bar-tooltip-label">End</span><span class="k-bar-tooltip-value">{{ formatDateFull(tooltipTask()!.end) }}</span></div>
          <div class="k-bar-tooltip-row"><span class="k-bar-tooltip-label">Progress</span><span class="k-bar-tooltip-value">{{ tooltipTask()!.progress }}%</span></div>
        }
      </div>
    }

    @if (rowTooltipData()) {
      <div class="k-bar-tooltip k-row-tooltip" [style.left.px]="rowTooltipX()" [style.top.px]="rowTooltipY()">
        <div class="k-bar-tooltip-title">Tasks in this row</div>
        @for (t of rowTooltipData()!.allTasks; track t.id) {
          <div class="k-row-tooltip-task">
            <span class="k-row-tooltip-dot" [style.background]="t.color || '#4a90d9'"></span>
            <span class="k-row-tooltip-name">{{ t.name }}</span>
            <span class="k-bar-tooltip-value">{{ t.progress }}%</span>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    :host { display: block; height: 100%; min-height: var(--ngx-gantt-min-height, 420px); }
    .k-gantt { display: flex; flex-direction: column; height: 100%; min-height: inherit; width: 100%; background: var(--ngx-gantt-bg, #ffffff); border: 1px solid var(--ngx-gantt-border, #dee2e6); border-radius: 4px; font-family: var(--ngx-gantt-font, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif); font-size: var(--ngx-gantt-font-size, 13px); color: var(--ngx-gantt-text, #212529); overflow: hidden; position: relative; }
    .k-gantt-body { display: flex; flex: 1; min-height: 0; overflow: hidden; }
    .k-gantt-toolbar { display: flex; align-items: center; gap: 12px; padding: 8px 12px; border-bottom: 1px solid var(--ngx-gantt-border, #dee2e6); background: var(--ngx-gantt-header-bg, #f1f3f5); flex-shrink: 0; }
    .k-toolbar-group { display: flex; gap: 4px; }
    .k-toolbar-btn { padding: 4px 12px; border: 1px solid var(--ngx-gantt-border, #dee2e6); border-radius: 4px; background: var(--ngx-gantt-bg, #fff); color: var(--ngx-gantt-text, #212529); font-size: 12px; cursor: pointer; font-family: inherit; transition: all 0.12s; }
    .k-toolbar-btn:hover { background: var(--ngx-gantt-hover-bg, #e8f0fe); }
    .k-toolbar-btn.k-active { background: var(--k-primary, #4a90d9); color: #fff; border-color: var(--k-primary, #4a90d9); }
    .k-gantt-treelist { display: flex; flex-direction: column; flex-shrink: 0; border-right: 1px solid var(--ngx-gantt-border, #dee2e6); overflow: hidden; background: var(--ngx-gantt-bg, #ffffff); }
    .k-treelist-header { flex-shrink: 0; background: var(--ngx-gantt-header-bg, #f1f3f5); border-bottom: 1px solid var(--ngx-gantt-border, #dee2e6); overflow: hidden; display: flex; align-items: flex-end; }
    .k-treelist-header-table, .k-treelist-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    .k-header-cell { padding: 8px; text-align: left; font-size: 12px; font-weight: 600; color: var(--ngx-gantt-header-text, #495057); border-right: 1px solid var(--ngx-gantt-border, #dee2e6); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .k-header-cell:last-child { border-right: none; text-align: center; }
    .k-treelist-content { flex: 1; overflow-y: auto; overflow-x: hidden; }
    .k-treelist-row { cursor: default; border-bottom: 1px solid var(--ngx-gantt-grid-line, #ebedf0); }
    .k-treelist-row.k-alt { background: var(--ngx-gantt-alt-bg, #f8f9fa); }
    .k-treelist-row.k-hover { background: var(--ngx-gantt-hover-bg, #e8f0fe) !important; }
    .k-treelist-row.k-selected { background: var(--ngx-gantt-selected-bg, #d0e1f9) !important; }
    .k-treelist-cell { padding: 0 8px; height: 100%; vertical-align: middle; border-right: 1px solid var(--ngx-gantt-grid-line, #ebedf0); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .k-treelist-cell:last-child { border-right: none; }
    .k-group-header-row { background: var(--ngx-gantt-header-bg, #f1f3f5) !important; font-weight: 600; }
    .k-group-cell { display: flex; align-items: center; gap: 4px; }
    .k-group-title { font-size: 13px; font-weight: 700; }
    .k-group-row { background: var(--ngx-gantt-header-bg, #f1f3f5) !important; }
    .k-name-cell { display: flex; align-items: center; gap: 0; }
    .k-indent { display: inline-block; flex-shrink: 0; }
    .k-name-wrapper { display: flex; flex-direction: column; min-width: 0; justify-content: center; gap: 2px; overflow: hidden; }
    .k-extra-tasks-chips { display: flex; flex-wrap: wrap; gap: 3px; }
    .k-extra-task-chip { display: inline-flex; align-items: center; padding: 0 5px; height: 14px; border-radius: 7px; font-size: 10px; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 110px; opacity: 0.9; font-weight: 500; }
    .k-multi-pct { cursor: help; }
    .k-drag-handle { cursor: grab; color: var(--ngx-gantt-text-secondary, #6c757d); font-size: 12px; padding: 0 4px; flex-shrink: 0; opacity: 0.5; user-select: none; }
    .k-drag-handle:hover { opacity: 1; }
    .k-collapse-btn { display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; flex-shrink: 0; background: none; border: none; cursor: pointer; padding: 0; color: var(--ngx-gantt-text-secondary, #6c757d); border-radius: 3px; }
    .k-collapse-btn:hover { background: var(--ngx-gantt-border, #dee2e6); }
    .k-icon { font-size: 8px; transition: transform 0.15s ease; display: inline-block; }
    .k-icon.k-collapsed { transform: rotate(-90deg); }
    .k-collapse-spacer { display: inline-block; width: 20px; flex-shrink: 0; }
    .k-milestone-icon { color: var(--ngx-gantt-milestone-color, #e74c3c); margin-right: 4px; font-size: 10px; flex-shrink: 0; }
    .k-task-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .k-summary-name { font-weight: 600; }
    .k-date-cell { font-size: 11px; color: var(--ngx-gantt-text-secondary, #6c757d); text-align: center; }
    .k-pct-cell { font-size: 11px; text-align: center; font-weight: 500; }
    .k-splitbar { width: 7px; flex-shrink: 0; background: var(--ngx-gantt-header-bg, #f1f3f5); border-left: 1px solid var(--ngx-gantt-border, #dee2e6); border-right: 1px solid var(--ngx-gantt-border, #dee2e6); cursor: col-resize; display: flex; align-items: center; justify-content: center; user-select: none; z-index: 2; }
    .k-splitbar:hover { background: var(--ngx-gantt-border, #dee2e6); }
    .k-splitbar-icon { color: var(--ngx-gantt-text-secondary, #6c757d); font-size: 14px; line-height: 1; }
    .k-gantt-timeline { flex: 1; min-width: 0; display: flex; flex-direction: column; overflow: hidden; }
    .k-timeline-header { flex-shrink: 0; overflow: hidden; background: var(--ngx-gantt-header-bg, #f1f3f5); border-bottom: 1px solid var(--ngx-gantt-border, #dee2e6); }
    .k-timeline-header-wrap { position: relative; display: flex; flex-direction: column; height: 100%; }
    .k-header-row { position: relative; flex: 1; }
    .k-header-primary { border-bottom: 1px solid var(--ngx-gantt-border, #dee2e6); }
    .k-header-group-cell { position: absolute; top: 0; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; color: var(--ngx-gantt-header-text, #495057); border-right: 1px solid var(--ngx-gantt-border, #dee2e6); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 4px; box-sizing: border-box; }
    .k-header-tick-cell { position: absolute; top: 0; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 11px; color: var(--ngx-gantt-text-secondary, #6c757d); border-right: 1px solid var(--ngx-gantt-grid-line, #ebedf0); white-space: nowrap; box-sizing: border-box; }
    .k-header-tick-cell.k-weekend { background: var(--ngx-gantt-weekend-bg, rgba(0,0,0,0.02)); color: #adb5bd; }
    .k-header-tick-cell.k-today-header { color: var(--k-danger, #ff6358); font-weight: 700; }
    .k-timeline-content { flex: 1; overflow: auto; }
    .k-timeline-canvas { position: relative; }
    .k-gantt-rows { position: absolute; top: 0; left: 0; right: 0; }
    .k-gantt-row { position: absolute; left: 0; right: 0; border-bottom: 1px solid var(--ngx-gantt-grid-line, #ebedf0); }
    .k-gantt-row.k-alt { background: var(--ngx-gantt-alt-bg, #f8f9fa); }
    .k-gantt-row.k-hover { background: var(--ngx-gantt-hover-bg, #e8f0fe) !important; }
    .k-gantt-row.k-selected { background: var(--ngx-gantt-selected-bg, #d0e1f9) !important; }
    .k-gantt-columns { position: absolute; top: 0; left: 0; }
    .k-gantt-column { position: absolute; top: 0; border-right: 1px solid var(--ngx-gantt-grid-line, #ebedf0); box-sizing: border-box; }
    .k-gantt-column.k-weekend-col { background: var(--ngx-gantt-weekend-bg, rgba(0,0,0,0.02)); }
    .k-today-marker { position: absolute; top: 0; width: 2px; background: var(--k-danger, #ff6358); z-index: 3; pointer-events: none; }
    .k-today-indicator { position: absolute; top: -1px; left: -5px; width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid var(--k-danger, #ff6358); }
    .k-gantt-baselines { position: absolute; top: 0; left: 0; z-index: 1; }
    .k-baseline-bar { position: absolute; background: rgba(0,0,0,0.08); border: 1px dashed rgba(0,0,0,0.15); border-radius: 3px; pointer-events: none; }
    .k-gantt-tasks { position: absolute; top: 0; left: 0; z-index: 2; }
    .k-task-wrap { position: absolute; left: 0; right: 0; display: flex; align-items: center; pointer-events: none; }
    .k-task { position: absolute; height: var(--ngx-gantt-bar-height, 24px); border-radius: 4px; cursor: grab; pointer-events: all; display: flex; align-items: center; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.06); transition: box-shadow 0.15s ease; user-select: none; }
    .k-task:hover { box-shadow: 0 3px 8px rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.1); }
    .k-task:active { cursor: grabbing; }
    .k-task.k-focused { outline: 2px solid var(--k-primary, #4a90d9); outline-offset: 2px; }
    .k-task.k-selected { outline: 2px solid var(--k-primary, #4a90d9); outline-offset: 1px; }
    .k-task-range { height: 8px !important; border-radius: 4px; cursor: pointer; opacity: 0.8; }
    .k-task-range .k-task-text { font-size: 10px; }
    .k-task-progress { position: absolute; top: 0; left: 0; height: 100%; overflow: hidden; border-radius: 4px 0 0 4px; }
    .k-task-progress-inner { width: 10000px; height: 100%; background: var(--ngx-gantt-bar-progress-bg, rgba(0,0,0,0.15)); }
    .k-task-text { position: relative; z-index: 1; padding: 0 8px; color: var(--ngx-gantt-bar-text, #ffffff); font-size: 12px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-shadow: 0 1px 1px rgba(0,0,0,0.15); }
    .k-resize-handle { position: absolute; top: 0; width: 6px; height: 100%; cursor: col-resize; pointer-events: all; z-index: 2; }
    .k-resize-w { left: 0; }
    .k-resize-e { right: 0; }
    .k-resize-handle:hover { background: rgba(255,255,255,0.25); }
    .k-link-connector { position: absolute; top: 50%; width: 10px; height: 10px; border-radius: 50%; background: var(--k-danger, #ff6358); transform: translateY(-50%); cursor: crosshair; pointer-events: all; opacity: 0; transition: opacity 0.15s ease; z-index: 5; }
    .k-task:hover .k-link-connector { opacity: 1; }
    .k-link-start { left: -5px; }
    .k-link-end { right: -5px; }
    .k-link-drag-line { pointer-events: none; }
    .k-task-with-subtasks { overflow: hidden; box-shadow: none; }
    .k-task-with-subtasks:hover { box-shadow: none; }
    .k-task-with-subtasks.k-dragging { background: rgba(0,0,0,0.06) !important; border: 1px dashed rgba(0,0,0,0.2); border-radius: 4px; }
    .k-subtask-segment { position: absolute; top: 0; height: 100%; border-radius: 4px; display: flex; align-items: center; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.12); transition: box-shadow 0.15s ease, transform 0.1s ease; cursor: pointer; pointer-events: all; min-width: 4px; }
    .k-subtask-segment:hover { box-shadow: 0 3px 8px rgba(0,0,0,0.22); transform: scaleY(1.08); z-index: 1; }
    .k-subtask-text { position: relative; z-index: 1; padding: 0 6px; color: #fff; font-size: 11px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-shadow: 0 1px 1px rgba(0,0,0,0.2); }
    .k-subtask-progress { position: absolute; top: 0; left: 0; height: 100%; background: rgba(0,0,0,0.15); border-radius: 4px 0 0 4px; pointer-events: none; }
    .k-task-summary { position: absolute; height: 10px; pointer-events: all; cursor: pointer; display: flex; align-items: flex-end; }
    .k-task-summary.k-selected { outline: 2px solid var(--k-primary, #4a90d9); outline-offset: 3px; border-radius: 2px; }
    .k-summary-bar { position: relative; width: 100%; height: 6px; background: var(--ngx-gantt-summary-color, #495057); }
    .k-summary-progress { height: 100%; background: #343a40; }
    .k-summary-left-cap, .k-summary-right-cap { position: absolute; bottom: 0; width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid var(--ngx-gantt-summary-color, #495057); }
    .k-summary-left-cap { left: -1px; }
    .k-summary-right-cap { right: -1px; }
    .k-milestone { position: absolute; pointer-events: all; cursor: pointer; }
    .k-milestone.k-selected { outline: 2px solid var(--k-primary, #4a90d9); outline-offset: 4px; border-radius: 2px; }
    .k-milestone-diamond { width: 16px; height: 16px; background: var(--ngx-gantt-milestone-color, #e74c3c); transform: rotate(45deg); border-radius: 2px; box-shadow: 0 1px 3px rgba(0,0,0,0.15); }
    .k-gantt-dependencies { position: absolute; top: 0; left: 0; z-index: 1; pointer-events: none; }
    .k-dep-line { fill: none; stroke: var(--k-danger, #ff6358); stroke-width: 1.5; pointer-events: stroke; cursor: pointer; }
    .k-dep-line:hover { stroke-width: 3; }
    .k-loading-overlay { position: absolute; inset: 0; background: rgba(255,255,255,0.7); z-index: 100; display: flex; align-items: center; justify-content: center; }
    .k-loading-spinner { display: flex; flex-direction: column; align-items: center; gap: 12px; }
    @keyframes k-spin { to { transform: rotate(360deg); } }
    .k-spinner-circle { width: 32px; height: 32px; border: 3px solid var(--ngx-gantt-border, #dee2e6); border-top-color: var(--k-primary, #4a90d9); border-radius: 50%; animation: k-spin 0.8s linear infinite; }
    .k-loading-text { font-size: 12px; color: var(--ngx-gantt-text-secondary, #6c757d); }
    @keyframes k-tooltip-fadein { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
    .k-bar-tooltip { position: fixed; z-index: 9999; background: var(--ngx-gantt-tooltip-bg, #2d3748); color: var(--ngx-gantt-tooltip-text, #ffffff); border-radius: 6px; padding: 10px 14px; min-width: 180px; box-shadow: 0 4px 16px rgba(0,0,0,0.22); pointer-events: none; font-size: 12px; line-height: 1.5; animation: k-tooltip-fadein 0.15s ease; }
    .k-bar-tooltip-title { font-weight: 700; font-size: 13px; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 220px; }
    .k-bar-tooltip-row { display: flex; justify-content: space-between; gap: 12px; margin-top: 3px; }
    .k-bar-tooltip-label { color: var(--ngx-gantt-tooltip-label, rgba(255,255,255,0.65)); white-space: nowrap; }
    .k-bar-tooltip-value { font-weight: 500; white-space: nowrap; }
    .k-row-tooltip { min-width: 240px; }
    .k-row-tooltip-task { display: flex; align-items: center; gap: 6px; margin-top: 5px; padding-top: 5px; border-top: 1px solid rgba(255,255,255,0.12); }
    .k-row-tooltip-task:first-of-type { border-top: none; }
    .k-row-tooltip-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .k-row-tooltip-name { flex: 1; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .k-gantt.k-no-grid .k-header-cell, .k-gantt.k-no-grid .k-treelist-cell, .k-gantt.k-no-grid .k-treelist-row, .k-gantt.k-no-grid .k-header-group-cell, .k-gantt.k-no-grid .k-header-tick-cell, .k-gantt.k-no-grid .k-gantt-row, .k-gantt.k-no-grid .k-gantt-column { border: none !important; }
  `]
})
export class GanttChartComponent {
  tasks = input.required<GanttTask[]>();
  dependencies = input<GanttDependency[]>([]);
  config = input<Partial<GanttConfig>>({});
  groups = input<GanttGroup[]>([]);
  baselineItems = input<GanttBaselineItem[]>([]);

  taskChange = output<GanttTaskChangeEvent>();
  taskClick = output<GanttTaskClickEvent>();
  taskDblClick = output<GanttTaskClickEvent>();
  dependencyClick = output<GanttDependencyClickEvent>();
  scroll = output<GanttScrollEvent>();
  zoomChange = output<ZoomLevel>();
  dragStarted = output<GanttDragEvent>();
  dragMoved = output<GanttDragEvent>();
  dragEnded = output<GanttDragEvent>();
  linkDragStarted = output<GanttLinkDragEvent>();
  linkDragEnded = output<GanttLinkDragEvent>();
  lineClick = output<GanttLineClickEvent>();
  barClick = output<GanttBarClickEvent>();
  selectedChange = output<GanttSelectedEvent>();
  viewChange = output<GanttViewChangeEvent>();
  expandChange = output<GanttExpandChangeEvent>();
  loadOnScroll = output<GanttLoadOnScrollEvent>();
  virtualScrolledIndexChange = output<GanttVirtualScrolledIndexChangeEvent>();
  tableDragStarted = output<GanttTableDragStartedEvent>();
  tableDragEnded = output<GanttTableDragEndedEvent>();
  tableDragDropped = output<GanttTableDragDroppedEvent>();

  private scaleService = inject(GanttScaleService);
  private layoutService = inject(GanttLayoutService);
  keyboardService = inject(GanttKeyboardService);
  private printService = inject(GanttPrintService);
  private elementRef = inject(ElementRef);
  private timelineContent = viewChild<ElementRef<HTMLDivElement>>('timelineContent');
  private treelistContent = viewChild<ElementRef<HTMLDivElement>>('treelistContent');

  private internalCollapsed = signal<Map<string, boolean>>(new Map());
  private internalGroupExpanded = signal<Map<string, boolean>>(new Map());
  hoveredTaskId = signal<string | null>(null);
  private selectedTaskIds = signal<Set<string>>(new Set());
  scrollLeft = signal(0);
  private sidebarWidthOverride = signal<number | null>(null);
  private lastEmittedZoom = signal<ZoomLevel | null>(null);
  showLoading = signal(false);
  private loadingTimer: ReturnType<typeof setTimeout> | null = null;
  tooltipTask = signal<GanttTask | null>(null);
  tooltipSubtask = signal<GanttSubtask | null>(null);
  tooltipX = signal(0);
  tooltipY = signal(0);
  rowTooltipData = signal<{ allTasks: GanttTask[] } | null>(null);
  rowTooltipX = signal(0);
  rowTooltipY = signal(0);
  linkDragLine = signal<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  private linkDragSource: GanttTask | null = null;
  private tableDragSourceRow: FlatRow | null = null;
  private virtualRange = signal<{ start: number; end: number }>({ start: 0, end: Infinity });

  mergedConfig = computed<GanttConfig>(() => {
    const base = { ...DEFAULT_GANTT_CONFIG, ...this.config() };
    const sbOverride = this.sidebarWidthOverride();
    if (sbOverride !== null) base.sidebarWidth = sbOverride;
    if (this.config().linkOptions) base.linkOptions = { ...DEFAULT_GANTT_CONFIG.linkOptions, ...this.config().linkOptions };
    if (this.config().toolbarOptions) base.toolbarOptions = { ...DEFAULT_GANTT_CONFIG.toolbarOptions, ...this.config().toolbarOptions };
    if (this.config().styleOptions) base.styleOptions = { ...DEFAULT_GANTT_CONFIG.styleOptions, ...this.config().styleOptions };
    return base;
  });

  themeVars = computed<string>(() => {
    const theme = this.mergedConfig().styleOptions.themes?.[this.mergedConfig().styleOptions.defaultTheme || 'default'];
    if (!theme) return '';
    const v: string[] = [];
    if (theme.primary) v.push('--k-primary:' + theme.primary);
    if (theme.danger) v.push('--k-danger:' + theme.danger);
    if (theme.background) v.push('--ngx-gantt-bg:' + theme.background);
    return v.join(';');
  });

  sidebarColumns = computed<GanttColumnDef[]>(() => {
    const columns = this.mergedConfig().sidebarColumns ?? [];
    if (columns.length === 0) return DEFAULT_GANTT_CONFIG.sidebarColumns;
    return columns.map(c => ({ ...c, width: Math.max(60, c.width || 120) }));
  });

  private effectiveTasks = computed<GanttTask[]>(() => {
    const collapsed = this.internalCollapsed();
    return this.tasks().map(t => ({ ...t, collapsed: collapsed.has(t.id) ? collapsed.get(t.id)! : t.collapsed }));
  });

  private effectiveGroups = computed<GanttGroup[]>(() => {
    const m = this.internalGroupExpanded();
    return this.groups().map(g => ({ ...g, expanded: m.has(g.id) ? m.get(g.id)! : (g.expanded !== false) }));
  });

  private flatRows = computed<FlatRow[]>(() =>
    this.layoutService.flattenTasks(this.effectiveTasks(), this.effectiveGroups().length > 0 ? this.effectiveGroups() : undefined)
  );

  visibleRows = computed<FlatRow[]>(() => this.flatRows().filter(r => r.isVisible));

  renderedRows = computed<FlatRow[]>(() => {
    const rows = this.visibleRows();
    if (!this.mergedConfig().virtualScrollEnabled) return rows;
    const range = this.virtualRange();
    return rows.slice(range.start, Math.min(range.end, rows.length));
  });

  private dateRange = computed(() => getDateRange(this.tasks()));
  private columnDates = computed(() => getColumnDates(this.dateRange().start, this.dateRange().end, this.mergedConfig().zoomLevel));
  totalWidth = computed(() => this.columnDates().length * this.mergedConfig().columnWidth);
  totalHeight = computed(() => this.visibleRows().length * this.mergedConfig().rowHeight);

  headerColumns = computed(() => {
    const cfg = this.mergedConfig();
    const today = startOfDay(new Date());
    return this.columnDates().map((date, i) => ({
      x: i * cfg.columnWidth, width: cfg.columnWidth, date,
      label: this.getSecondaryLabel(date, cfg.zoomLevel, cfg.locale),
      isWeekend: isWeekend(date), isToday: date.getTime() === today.getTime(),
    }));
  });

  primaryHeaderGroups = computed(() => {
    const cfg = this.mergedConfig();
    const dates = this.columnDates();
    if (dates.length === 0) return [];
    const groups: { x: number; width: number; label: string }[] = [];
    let currentLabel = this.getPrimaryLabel(dates[0], cfg.zoomLevel, cfg.locale);
    let startIdx = 0;
    for (let i = 1; i <= dates.length; i++) {
      const label = i < dates.length ? this.getPrimaryLabel(dates[i], cfg.zoomLevel, cfg.locale) : '';
      if (label !== currentLabel || i === dates.length) {
        groups.push({ x: startIdx * cfg.columnWidth, width: (i - startIdx) * cfg.columnWidth, label: currentLabel });
        currentLabel = label; startIdx = i;
      }
    }
    return groups;
  });

  todayX = computed<number | null>(() => {
    const today = startOfDay(new Date());
    const range = this.dateRange();
    if (today < range.start || today > range.end) return null;
    const cfg = this.mergedConfig();
    return this.scaleService.dateToX(today, range.start, cfg.columnWidth, cfg.zoomLevel);
  });

  taskBars = computed(() => {
    const cfg = this.mergedConfig();
    const range = this.dateRange();
    const makeBar = (task: GanttTask, top: number, rowIndex: number, isSummary: boolean, primaryTaskId: string, isGroupHeader: boolean) => ({
      task, left: isGroupHeader ? 0 : this.scaleService.dateToX(task.start, range.start, cfg.columnWidth, cfg.zoomLevel),
      width: isGroupHeader || task.isMilestone ? 0 : this.scaleService.getBarWidth(task.start, task.end, range.start, cfg.columnWidth, cfg.zoomLevel),
      top, isSummary, barHeight: cfg.barHeight, rowIndex, primaryTaskId, isGroupHeader,
    });
    const bars: ReturnType<typeof makeBar>[] = [];
    this.renderedRows().forEach((row, idx) => {
      const top = idx * cfg.rowHeight;
      const isSummary = row.hasChildren && !row.task.isMilestone && !row.isGroupHeader;
      bars.push(makeBar(row.task, top, idx, isSummary, row.task.id, row.isGroupHeader));
      if (!row.isGroupHeader) {
        for (const extra of row.extraTasks) bars.push(makeBar(extra, top, idx, false, row.task.id, false));
      }
    });
    return bars;
  });

  baselineBars = computed(() => {
    if (!this.mergedConfig().showBaseline) return [];
    const cfg = this.mergedConfig();
    const range = this.dateRange();
    const rows = this.renderedRows();
    const rowMap = new Map(rows.map((r, idx) => [r.task.id, idx]));
    return this.baselineItems().filter(bl => bl.start && bl.end && rowMap.has(bl.id)).map(bl => {
      const rowIdx = rowMap.get(bl.id)!;
      return {
        id: bl.id, start: bl.start!, end: bl.end!,
        left: this.scaleService.dateToX(bl.start!, range.start, cfg.columnWidth, cfg.zoomLevel),
        width: this.scaleService.getBarWidth(bl.start!, bl.end!, range.start, cfg.columnWidth, cfg.zoomLevel),
        top: rowIdx * cfg.rowHeight + (cfg.rowHeight - cfg.barHeight) / 2 + cfg.barHeight - 4,
      };
    });
  });

  dependencyPaths = computed(() => {
    const bars = this.taskBars();
    const cfg = this.mergedConfig();
    const lineType = cfg.linkOptions.lineType || GanttLinkLineType.Straight;
    const barMap = new Map(bars.map(b => [b.task.id, b]));
    return this.dependencies().filter(dep => barMap.has(dep.fromId) && barMap.has(dep.toId)).map(dep => {
      const from = barMap.get(dep.fromId)!;
      const to = barMap.get(dep.toId)!;
      const barH = from.isSummary ? 10 : cfg.barHeight;
      const fromCY = from.top + cfg.rowHeight / 2;
      const toCY = to.top + cfg.rowHeight / 2;
      const fromRect: Rect = { x: from.left, y: fromCY - barH / 2, width: from.width || 16, height: barH };
      const toRect: Rect = { x: to.left, y: toCY - (to.isSummary ? 5 : cfg.barHeight / 2), width: to.width || 16, height: to.isSummary ? 10 : cfg.barHeight };
      const depColor = typeof dep.color === 'string' ? dep.color : (typeof dep.color === 'object' ? dep.color.default : '#ff6358');
      return { dependency: dep, path: computeDependencyPath(fromRect, toRect, dep.type, 12, lineType), key: dep.fromId + '-' + dep.toId, color: depColor };
    });
  });

  constructor() {
    effect(() => {
      const zoom = this.mergedConfig().zoomLevel;
      if (this.lastEmittedZoom() !== zoom) { this.lastEmittedZoom.set(zoom); this.zoomChange.emit(zoom); }
    });
    effect(() => {
      const loading = this.mergedConfig().loading;
      const delay = this.mergedConfig().loadingDelay;
      if (this.loadingTimer) { clearTimeout(this.loadingTimer); this.loadingTimer = null; }
      if (loading) {
        if (delay > 0) { this.loadingTimer = setTimeout(() => this.showLoading.set(true), delay); }
        else { this.showLoading.set(true); }
      } else { this.showLoading.set(false); }
    });
    effect(() => { this.printService.register(this.elementRef); });
  }

  isTaskSelected(taskId: string): boolean { return this.selectedTaskIds().has(taskId); }

  private toggleSelection(task: GanttTask, event: Event): void {
    const cfg = this.mergedConfig();
    const current = new Set(this.selectedTaskIds());
    if (cfg.selectable && cfg.multiple) {
      if (current.has(task.id)) current.delete(task.id); else current.add(task.id);
    } else { current.clear(); current.add(task.id); }
    this.selectedTaskIds.set(current);
    if (cfg.selectable) {
      const selectedTasks = this.tasks().filter(t => current.has(t.id));
      this.selectedChange.emit({ event, current: task, selectedValue: cfg.multiple ? selectedTasks : task });
    }
  }

  onTimelineScroll(): void {
    const el = this.timelineContent()?.nativeElement;
    if (!el) return;
    this.scrollLeft.set(el.scrollLeft);
    const treeEl = this.treelistContent()?.nativeElement;
    if (treeEl) treeEl.scrollTop = el.scrollTop;
    if (this.mergedConfig().virtualScrollEnabled) {
      const rh = this.mergedConfig().rowHeight;
      const startIdx = Math.floor(el.scrollTop / rh);
      const count = Math.ceil(el.clientHeight / rh);
      this.virtualRange.set({ start: Math.max(0, startIdx - 5), end: startIdx + count + 5 });
      this.virtualScrolledIndexChange.emit({ index: startIdx, renderedRange: this.virtualRange(), count: this.visibleRows().length });
    }
    const cfg = this.mergedConfig();
    const range = this.dateRange();
    const visStart = this.scaleService.xToDate(el.scrollLeft, range.start, cfg.columnWidth, cfg.zoomLevel);
    const visEnd = this.scaleService.xToDate(el.scrollLeft + el.clientWidth, range.start, cfg.columnWidth, cfg.zoomLevel);
    this.scroll.emit({ scrollLeft: el.scrollLeft, scrollTop: el.scrollTop, visibleStartDate: visStart, visibleEndDate: visEnd });
    if (cfg.loadOnScroll && (el.scrollLeft < 100 || el.scrollLeft + el.clientWidth > el.scrollWidth - 100)) {
      this.loadOnScroll.emit({ start: visStart, end: visEnd });
    }
  }

  onSplitBarDown(event: PointerEvent): void {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = this.mergedConfig().sidebarWidth;
    const onMove = (e: PointerEvent) => { this.sidebarWidthOverride.set(Math.max(150, Math.min(600, startWidth + e.clientX - startX))); };
    const onUp = () => { document.removeEventListener('pointermove', onMove); document.removeEventListener('pointerup', onUp); };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }

  onBarPointerDown(event: PointerEvent, task: GanttTask, mode: 'move' | 'resize-left' | 'resize-right'): void {
    if (task.draggable === false) return;
    event.preventDefault(); event.stopPropagation();
    const startX = event.clientX;
    const cfg = this.mergedConfig();
    const barEl = (event.target as HTMLElement).closest('.k-task') as HTMLElement;
    if (!barEl) return;
    const origLeft = parseFloat(barEl.style.left) || 0;
    const origWidth = parseFloat(barEl.style.width) || barEl.offsetWidth;
    barEl.style.cursor = mode === 'move' ? 'grabbing' : 'col-resize';
    barEl.style.zIndex = '10'; barEl.style.opacity = '0.85'; barEl.classList.add('k-dragging');
    this.dragStarted.emit({ task });
    const onMove = (e: PointerEvent) => {
      const dx = e.clientX - startX;
      if (mode === 'move') barEl.style.left = (origLeft + dx) + 'px';
      else if (mode === 'resize-right') barEl.style.width = Math.max(10, origWidth + dx) + 'px';
      else { const nw = origWidth - dx; if (nw > 10) { barEl.style.left = (origLeft + dx) + 'px'; barEl.style.width = nw + 'px'; } }
      this.dragMoved.emit({ task });
    };
    const onUp = (e: PointerEvent) => {
      document.removeEventListener('pointermove', onMove); document.removeEventListener('pointerup', onUp);
      barEl.style.cursor = ''; barEl.style.zIndex = ''; barEl.style.opacity = ''; barEl.classList.remove('k-dragging');
      this.dragEnded.emit({ task });
      const deltaX = e.clientX - startX;
      if (Math.abs(deltaX) < 2) return;
      const pxPerMs = cfg.columnWidth / this.getMsPerUnit(cfg.zoomLevel);
      const deltaMs = deltaX / pxPerMs;
      const ps = task.start, pe = task.end;
      let ns: Date, ne: Date;
      if (mode === 'move') { ns = new Date(ps.getTime() + deltaMs); ne = new Date(pe.getTime() + deltaMs); }
      else if (mode === 'resize-right') { ns = ps; ne = new Date(pe.getTime() + deltaMs); }
      else { ns = new Date(ps.getTime() + deltaMs); ne = pe; }
      if (cfg.snapTo !== 'none') { ns = this.scaleService.snapDate(ns, cfg.snapTo); ne = this.scaleService.snapDate(ne, cfg.snapTo); }
      if (ne <= ns) ne = addDays(ns, 1);
      let subs = task.subtasks;
      if (subs && subs.length > 0) {
        const od = pe.getTime() - ps.getTime(), nd = ne.getTime() - ns.getTime();
        if (mode === 'move') { const sh = ns.getTime() - ps.getTime(); subs = subs.map(s => ({ ...s, start: new Date(s.start.getTime() + sh), end: new Date(s.end.getTime() + sh) })); }
        else if (od > 0) { subs = subs.map(s => { const sr = (s.start.getTime() - ps.getTime()) / od, er = (s.end.getTime() - ps.getTime()) / od; return { ...s, start: new Date(ns.getTime() + sr * nd), end: new Date(ns.getTime() + er * nd) }; }); }
      }
      this.taskChange.emit({ task: { ...task, start: ns, end: ne, subtasks: subs }, previousStart: ps, previousEnd: pe });
    };
    document.addEventListener('pointermove', onMove); document.addEventListener('pointerup', onUp);
  }

  onLinkDragStart(event: PointerEvent, task: GanttTask, side: 'start' | 'end'): void {
    event.preventDefault(); event.stopPropagation();
    this.linkDragSource = task;
    const timelineEl = this.timelineContent()?.nativeElement;
    if (!timelineEl) return;
    const cfg = this.mergedConfig();
    const taskBar = this.taskBars().find(b => b.task.id === task.id);
    if (!taskBar) return;
    const x1 = side === 'end' ? taskBar.left + taskBar.width : taskBar.left;
    const y1 = taskBar.top + cfg.rowHeight / 2;
    this.linkDragStarted.emit({ source: task });
    const onMove = (e: PointerEvent) => {
      const rect = timelineEl.getBoundingClientRect();
      this.linkDragLine.set({ x1, y1, x2: e.clientX - rect.left + timelineEl.scrollLeft, y2: e.clientY - rect.top + timelineEl.scrollTop });
    };
    const onUp = (e: PointerEvent) => {
      document.removeEventListener('pointermove', onMove); document.removeEventListener('pointerup', onUp);
      this.linkDragLine.set(null);
      const rect = timelineEl.getBoundingClientRect();
      const dropY = e.clientY - rect.top + timelineEl.scrollTop;
      const dropX = e.clientX - rect.left + timelineEl.scrollLeft;
      const targetRow = this.renderedRows().find((_row, idx) => { const rt = idx * cfg.rowHeight; return dropY >= rt && dropY < rt + cfg.rowHeight; });
      if (targetRow && targetRow.task.id !== task.id) {
        const tb = this.taskBars().find(b => b.task.id === targetRow.task.id);
        if (tb) {
          const ts = dropX < tb.left + tb.width / 2 ? 'start' : 'end';
          let lt: DependencyType;
          if (side === 'end' && ts === 'start') lt = DependencyType.FinishToStart; else if (side === 'start' && ts === 'start') lt = DependencyType.StartToStart;
          else if (side === 'end' && ts === 'end') lt = DependencyType.FinishToFinish; else lt = DependencyType.StartToFinish;
          this.linkDragEnded.emit({ source: task, target: targetRow.task, type: lt });
        }
      } else { this.linkDragEnded.emit({ source: task }); }
      this.linkDragSource = null;
    };
    document.addEventListener('pointermove', onMove); document.addEventListener('pointerup', onUp);
  }

  onTableDragStart(event: DragEvent, row: FlatRow): void {
    this.tableDragSourceRow = row;
    event.dataTransfer?.setData('text/plain', row.task.id);
    this.tableDragStarted.emit({ source: row.task, sourceParent: this.tasks().find(t => t.id === row.task.parentId) || null });
  }
  onTableDragEnd(_event: DragEvent, row: FlatRow): void {
    this.tableDragEnded.emit({ source: row.task, sourceParent: this.tasks().find(t => t.id === row.task.parentId) || null });
    this.tableDragSourceRow = null;
  }
  onTableDragOver(event: DragEvent, row: FlatRow): void {
    if (this.tableDragSourceRow && this.tableDragSourceRow.task.id !== row.task.id) { event.preventDefault(); }
  }
  onTableDrop(event: DragEvent, targetRow: FlatRow): void {
    event.preventDefault();
    if (!this.tableDragSourceRow || this.tableDragSourceRow.task.id === targetRow.task.id) return;
    const src = this.tableDragSourceRow.task;
    const rect = (event.target as HTMLElement).closest('.k-gantt-row')?.getBoundingClientRect();
    let pos: 'before' | 'inside' | 'after' = 'after';
    if (rect) { const ry = event.clientY - rect.top, th = rect.height / 3; if (ry < th) pos = 'before'; else if (ry < th * 2) pos = 'inside'; }
    this.tableDragDropped.emit({ source: src, sourceParent: this.tasks().find(t => t.id === src.parentId) || null, target: targetRow.task, targetParent: this.tasks().find(t => t.id === targetRow.task.parentId) || null, dropPosition: pos });
    this.tableDragSourceRow = null;
  }

  onRowClick(task: GanttTask, event: MouseEvent): void {
    this.toggleSelection(task, event); this.keyboardService.focusTask(task.id);
    this.taskClick.emit({ task, originalEvent: event }); this.barClick.emit({ event, task });
  }
  onTaskBarClick(task: GanttTask, event: MouseEvent): void {
    event.stopPropagation(); this.toggleSelection(task, event); this.keyboardService.focusTask(task.id);
    this.taskClick.emit({ task, originalEvent: event }); this.barClick.emit({ event, task });
  }
  onTaskBarDblClick(task: GanttTask, event: MouseEvent): void { event.stopPropagation(); this.taskDblClick.emit({ task, originalEvent: event }); }
  onDependencyClick(dep: GanttDependency, event: MouseEvent): void {
    this.dependencyClick.emit({ dependency: dep, originalEvent: event });
    const source = this.tasks().find(t => t.id === dep.fromId);
    const target = this.tasks().find(t => t.id === dep.toId);
    if (source && target) this.lineClick.emit({ event, source, target });
  }
  onToggleCollapse(taskId: string): void {
    const current = new Map(this.internalCollapsed());
    const task = this.tasks().find(t => t.id === taskId);
    if (!task) return;
    const isCollapsed = current.has(taskId) ? current.get(taskId)! : task.collapsed;
    current.set(taskId, !isCollapsed);
    this.internalCollapsed.set(current);
    this.expandChange.emit({ item: task, expanded: isCollapsed });
  }
  onToggleGroupCollapse(group: GanttGroup): void {
    const current = new Map(this.internalGroupExpanded());
    const isExpanded = current.has(group.id) ? current.get(group.id)! : (group.expanded !== false);
    current.set(group.id, !isExpanded);
    this.internalGroupExpanded.set(current);
    this.expandChange.emit({ group, expanded: !isExpanded });
  }
  onToolbarViewChange(vt: ZoomLevel): void { this.viewChange.emit({ viewType: vt }); this.zoomChange.emit(vt); }
  getViewLabel(vt: ZoomLevel): string {
    const m: Record<string, string> = { hour: 'Hour', day: 'Day', week: 'Week', month: 'Month', quarter: 'Quarter', year: 'Year' };
    return m[vt] || vt;
  }
  onKeyDown(event: KeyboardEvent): void {
    const ids = this.renderedRows().map(r => r.task.id);
    this.keyboardService.handleKeyDown(event, ids, {
      onSelect: (taskId) => { const task = this.tasks().find(t => t.id === taskId); if (task) { this.toggleSelection(task, event as unknown as Event); this.taskClick.emit({ task, originalEvent: event as unknown as MouseEvent }); } },
      onEscape: () => { this.selectedTaskIds.set(new Set()); },
    });
  }

  scrollToToday(): void { this.scrollToDate(new Date()); }
  scrollToDate(date: Date): void {
    const cfg = this.mergedConfig(), range = this.dateRange();
    const x = this.scaleService.dateToX(date, range.start, cfg.columnWidth, cfg.zoomLevel);
    const el = this.timelineContent()?.nativeElement;
    if (el) el.scrollLeft = Math.max(0, x - el.clientWidth / 2);
  }
  scrollToTask(taskId: string): void {
    const idx = this.visibleRows().findIndex(r => r.task.id === taskId);
    if (idx === -1) return;
    const el = this.timelineContent()?.nativeElement;
    if (el) el.scrollTop = idx * this.mergedConfig().rowHeight;
  }
  expandAll(): void {
    const map = new Map<string, boolean>();
    this.tasks().forEach(t => map.set(t.id, false));
    this.internalCollapsed.set(map);
    const gm = new Map<string, boolean>();
    this.groups().forEach(g => gm.set(g.id, true));
    this.internalGroupExpanded.set(gm);
  }
  collapseAll(): void {
    const map = new Map<string, boolean>();
    this.flatRows().filter(r => r.hasChildren).forEach(r => map.set(r.task.id, true));
    this.internalCollapsed.set(map);
    const gm = new Map<string, boolean>();
    this.groups().forEach(g => gm.set(g.id, false));
    this.internalGroupExpanded.set(gm);
  }
  async exportAsImage(filename?: string): Promise<void> { await this.printService.print(filename); }
  async getImageDataUrl(): Promise<string | null> { return this.printService.exportAsImage(); }
  isSelected(taskId: string): boolean { return this.selectedTaskIds().has(taskId); }
  getSelectedIds(): string[] { return Array.from(this.selectedTaskIds()); }
  rerenderView(): void { this.internalCollapsed.set(new Map(this.internalCollapsed())); }

  formatDateShort(date: Date): string { return date.toLocaleDateString(this.mergedConfig().locale, { month: 'short', day: 'numeric' }); }
  formatDateFull(date: Date): string { return date.toLocaleDateString(this.mergedConfig().locale, { month: 'short', day: 'numeric', year: 'numeric' }); }
  isNameColumn(col: GanttColumnDef, index: number): boolean { return typeof col.field === 'function' ? index === 0 : col.field === 'name' || index === 0; }
  isDateColumn(col: GanttColumnDef): boolean { return typeof col.field === 'string' && (col.field === 'start' || col.field === 'end'); }
  isProgressColumn(col: GanttColumnDef): boolean { return typeof col.field === 'string' && col.field === 'progress'; }
  getSidebarCellValue(row: FlatRow, col: GanttColumnDef): string {
    if (typeof col.field === 'function') return String(col.field(row.task) ?? '');
    switch (col.field) {
      case 'start': return this.formatDateShort(getRowStart(row));
      case 'end': return this.formatDateShort(getRowEnd(row));
      case 'progress': return row.extraTasks.length > 0 ? '~' + this.getRowAvgProgress(row) + '%' : row.task.progress + '%';
      default: { const v = ((row.task as unknown) as Record<string, unknown>)[col.field]; if (v instanceof Date) return this.formatDateShort(v); return v == null ? '' : String(v); }
    }
  }
  showTooltip(task: GanttTask, event: MouseEvent): void {
    this.tooltipTask.set(task); this.tooltipSubtask.set(null);
    this.tooltipX.set(flipCoord(event.clientX, 220, window.innerWidth));
    this.tooltipY.set(flipCoord(event.clientY, 100, window.innerHeight));
  }
  showSubtaskTooltip(task: GanttTask, subtask: GanttSubtask, event: MouseEvent): void {
    this.tooltipTask.set(task); this.tooltipSubtask.set(subtask);
    this.tooltipX.set(flipCoord(event.clientX, 240, window.innerWidth));
    this.tooltipY.set(flipCoord(event.clientY, 120, window.innerHeight));
  }
  hideTooltip(): void { this.tooltipTask.set(null); this.tooltipSubtask.set(null); }
  getRowAvgProgress(row: FlatRow): number { const all = [row.task, ...row.extraTasks]; return Math.round(all.reduce((s, t) => s + t.progress, 0) / all.length); }
  getRowProgressTitle(row: FlatRow): string { return [row.task, ...row.extraTasks].map(t => t.name + ': ' + t.progress + '%').join(', '); }
  getMetaEntries(meta: Record<string, unknown> | undefined): { key: string; value: string }[] {
    if (!meta) return [];
    return Object.entries(meta).map(([k, v]) => ({ key: k.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()), value: String(v) }));
  }
  getSubtaskBars(bar: { task: GanttTask; left: number; width: number }): { subtask: GanttSubtask; left: number; width: number }[] {
    const subs = bar.task.subtasks; if (!subs || subs.length === 0) return [];
    const cfg = this.mergedConfig(), range = this.dateRange();
    return subs.map(sub => {
      const sl = this.scaleService.dateToX(sub.start, range.start, cfg.columnWidth, cfg.zoomLevel) - bar.left;
      const sw = this.scaleService.getBarWidth(sub.start, sub.end, range.start, cfg.columnWidth, cfg.zoomLevel);
      const cl = Math.max(0, Math.min(sl, bar.width));
      return { subtask: sub, left: cl, width: Math.max(4, Math.min(sw, bar.width - cl)) };
    });
  }
  showRowTooltip(row: FlatRow, event: MouseEvent): void { this.rowTooltipData.set({ allTasks: [row.task, ...row.extraTasks] }); this.positionRowTooltip(event); }
  updateRowTooltip(event: MouseEvent): void { if (this.rowTooltipData()) this.positionRowTooltip(event); }
  hideRowTooltip(): void { this.rowTooltipData.set(null); }
  toStyleStr(style: Partial<CSSStyleDeclaration>): string { return Object.entries(style).filter(([, v]) => v != null).map(([k, v]) => k.replace(/([A-Z])/g, '-$1').toLowerCase() + ':' + v).join(';'); }
  private positionRowTooltip(event: MouseEvent): void {
    this.rowTooltipX.set(flipCoord(event.clientX, 260, window.innerWidth));
    this.rowTooltipY.set(flipCoord(event.clientY, 120, window.innerHeight));
  }
  private getPrimaryLabel(date: Date, zoom: ZoomLevel, locale: string): string {
    switch (zoom) {
      case ZoomLevel.Hour: return date.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
      case ZoomLevel.Day: case ZoomLevel.Week: return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
      case ZoomLevel.Month: case ZoomLevel.Quarter: return date.getFullYear().toString();
      case ZoomLevel.Year: return '';
    }
  }
  private getSecondaryLabel(date: Date, zoom: ZoomLevel, locale: string): string {
    switch (zoom) {
      case ZoomLevel.Hour: return date.getHours().toString().padStart(2, '0') + ':00';
      case ZoomLevel.Day: return date.toLocaleDateString(locale, { weekday: 'narrow' }) + ' ' + date.getDate();
      case ZoomLevel.Week: { const oj = new Date(date.getFullYear(), 0, 1); return 'W' + Math.ceil(((date.getTime() - oj.getTime()) / 86400000 + oj.getDay() + 1) / 7); }
      case ZoomLevel.Month: return date.toLocaleDateString(locale, { month: 'short' });
      case ZoomLevel.Quarter: return 'Q' + (Math.floor(date.getMonth() / 3) + 1);
      case ZoomLevel.Year: return date.getFullYear().toString();
    }
  }
  private getMsPerUnit(zoom: ZoomLevel): number {
    const m: Record<string, number> = { hour: 3600000, day: 86400000, week: 604800000, month: 2592000000, quarter: 7776000000, year: 31536000000 };
    return m[zoom] || 86400000;
  }
}

function flipCoord(cursor: number, size: number, viewport: number): number { const O = 14; return cursor + O + size > viewport ? cursor - size - O : cursor + O; }
function getRowStart(row: FlatRow): Date { if (row.extraTasks.length === 0) return row.task.start; return new Date(Math.min(row.task.start.getTime(), ...row.extraTasks.map(t => t.start.getTime()))); }
function getRowEnd(row: FlatRow): Date { if (row.extraTasks.length === 0) return row.task.end; return new Date(Math.max(row.task.end.getTime(), ...row.extraTasks.map(t => t.end.getTime()))); }
