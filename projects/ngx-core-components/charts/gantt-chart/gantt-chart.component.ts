import {
  Component,
  ChangeDetectionStrategy,
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
  GanttDependency,
  GanttConfig,
  DEFAULT_GANTT_CONFIG,
  ZoomLevel,
  GanttTaskChangeEvent,
  GanttTaskClickEvent,
  GanttDependencyClickEvent,
  GanttScrollEvent,
} from './models';
import { GanttScaleService } from './services/gantt-scale.service';
import { GanttLayoutService, FlatRow } from './services/gantt-layout.service';
import { GanttKeyboardService } from './services/gantt-keyboard.service';
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
  providers: [
    GanttScaleService,
    GanttLayoutService,
    GanttKeyboardService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="k-gantt" [class.k-gantt-dark]="false" (keydown)="onKeyDown($event)">

      <!-- ===== TREELIST (Left Panel) ===== -->
      <div class="k-gantt-treelist" [style.width.px]="mergedConfig().sidebarWidth">
        <!-- Treelist Header -->
        <div class="k-treelist-header" [style.height.px]="mergedConfig().headerHeight">
          <table class="k-treelist-header-table">
            <colgroup>
              <col [style.width.px]="mergedConfig().sidebarWidth - 220"/>
              <col style="width: 80px"/>
              <col style="width: 80px"/>
              <col style="width: 60px"/>
            </colgroup>
            <thead>
              <tr>
                <th class="k-header-cell">Task Name</th>
                <th class="k-header-cell">Start</th>
                <th class="k-header-cell">End</th>
                <th class="k-header-cell">%</th>
              </tr>
            </thead>
          </table>
        </div>

        <!-- Treelist Body -->
        <div class="k-treelist-content" #treelistContent>
          <table class="k-treelist-table">
            <colgroup>
              <col [style.width.px]="mergedConfig().sidebarWidth - 220"/>
              <col style="width: 80px"/>
              <col style="width: 80px"/>
              <col style="width: 60px"/>
            </colgroup>
            <tbody>
              @for (row of visibleRows(); track row.task.id; let i = $index) {
                <tr
                  class="k-treelist-row"
                  [style.height.px]="mergedConfig().rowHeight"
                  [class.k-alt]="i % 2 === 1"
                  [class.k-selected]="selectedTaskId() === row.task.id"
                  [class.k-hover]="hoveredTaskId() === row.task.id"
                  (mouseenter)="hoveredTaskId.set(row.task.id)"
                  (mouseleave)="hoveredTaskId.set(null)"
                  (click)="onRowClick(row.task, $event)"
                >
                  <td class="k-treelist-cell k-name-cell"
                    (mouseenter)="row.extraTasks.length > 0 ? showRowTooltip(row, $event) : null"
                    (mousemove)="row.extraTasks.length > 0 ? updateRowTooltip($event) : null"
                    (mouseleave)="row.extraTasks.length > 0 ? hideRowTooltip() : null"
                  >
                    <span class="k-indent" [style.width.px]="row.depth * 20"></span>
                    @if (row.hasChildren && mergedConfig().collapsible) {
                      <button
                        class="k-collapse-btn"
                        (click)="onToggleCollapse(row.task.id); $event.stopPropagation()"
                        [attr.aria-expanded]="!row.task.collapsed"
                      >
                        <span class="k-icon" [class.k-collapsed]="row.task.collapsed">&#9660;</span>
                      </button>
                    } @else {
                      <span class="k-collapse-spacer"></span>
                    }
                    @if (row.task.isMilestone) {
                      <span class="k-milestone-icon">&#9670;</span>
                    }
                    <div class="k-name-wrapper">
                      <span class="k-task-name" [class.k-summary-name]="row.hasChildren" [title]="row.task.name">
                        {{ row.task.name }}
                      </span>
                      @if (row.extraTasks.length > 0) {
                        <div class="k-extra-tasks-chips">
                          @for (extra of row.extraTasks; track extra.id) {
                            <span
                              class="k-extra-task-chip"
                              [style.background]="extra.color || '#6c757d'"
                              [title]="extra.name"
                            >{{ extra.name.length > 14 ? extra.name.slice(0, 14) + '…' : extra.name }}</span>
                          }
                        </div>
                      }
                    </div>
                  </td>
                  <td class="k-treelist-cell k-date-cell">{{ formatDateShort(getRowStart(row)) }}</td>
                  <td class="k-treelist-cell k-date-cell">{{ formatDateShort(getRowEnd(row)) }}</td>
                  <td class="k-treelist-cell k-pct-cell">
                    @if (row.extraTasks.length > 0) {
                      <span class="k-multi-pct" [title]="getRowProgressTitle(row)">~{{ getRowAvgProgress(row) }}%</span>
                    } @else {
                      {{ row.task.progress }}%
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- ===== SPLITBAR ===== -->
      <div class="k-splitbar" (pointerdown)="onSplitBarDown($event)">
        <span class="k-splitbar-icon">&#8942;</span>
      </div>

      <!-- ===== TIMELINE (Right Panel) ===== -->
      <div class="k-gantt-timeline">
        <!-- Timeline Header -->
        <div class="k-timeline-header" [style.height.px]="mergedConfig().headerHeight">
          <div class="k-timeline-header-wrap" [style.width.px]="totalWidth()" [style.margin-left.px]="-(scrollLeft())">
            <!-- Primary header row (months/years) -->
            <div class="k-header-row k-header-primary">
              @for (group of primaryHeaderGroups(); track group.label + group.x) {
                <div
                  class="k-header-group-cell"
                  [style.left.px]="group.x"
                  [style.width.px]="group.width"
                >
                  {{ group.label }}
                </div>
              }
            </div>
            <!-- Secondary header row (days/weeks/months) -->
            <div class="k-header-row k-header-secondary">
              @for (col of headerColumns(); track col.x) {
                <div
                  class="k-header-tick-cell"
                  [style.left.px]="col.x"
                  [style.width.px]="col.width"
                  [class.k-weekend]="col.isWeekend"
                  [class.k-today-header]="col.isToday"
                >
                  {{ col.label }}
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Timeline Content (Scrollable) -->
        <div class="k-timeline-content" #timelineContent (scroll)="onTimelineScroll()">
          <div class="k-timeline-canvas" [style.width.px]="totalWidth()" [style.height.px]="totalHeight()">

            <!-- Background rows (alternating + hover) -->
            <div class="k-gantt-rows">
              @for (row of visibleRows(); track row.task.id; let i = $index) {
                <div
                  class="k-gantt-row"
                  [style.top.px]="i * mergedConfig().rowHeight"
                  [style.height.px]="mergedConfig().rowHeight"
                  [class.k-alt]="i % 2 === 1"
                  [class.k-hover]="hoveredTaskId() === row.task.id"
                  [class.k-selected]="selectedTaskId() === row.task.id"
                  (mouseenter)="hoveredTaskId.set(row.task.id)"
                  (mouseleave)="hoveredTaskId.set(null)"
                >
                </div>
              }
            </div>

            <!-- Vertical column lines -->
            <div class="k-gantt-columns">
              @for (col of headerColumns(); track col.x) {
                <div
                  class="k-gantt-column"
                  [style.left.px]="col.x"
                  [style.width.px]="col.width"
                  [style.height.px]="totalHeight()"
                  [class.k-weekend-col]="col.isWeekend"
                >
                </div>
              }
            </div>

            <!-- Today marker -->
            @if (mergedConfig().showTodayMarker && todayX() !== null) {
              <div
                class="k-today-marker"
                [style.left.px]="todayX()"
                [style.height.px]="totalHeight()"
              >
                <div class="k-today-indicator"></div>
              </div>
            }

            <!-- Task bars layer -->
            <div class="k-gantt-tasks">
              @for (bar of taskBars(); track bar.task.id) {
                <div
                  class="k-task-wrap"
                  [style.top.px]="bar.top"
                  [style.height.px]="mergedConfig().rowHeight"
                >
                  @if (bar.task.isMilestone) {
                    <!-- Milestone diamond -->
                    <div
                      class="k-milestone"
                      [style.left.px]="bar.left - 8"
                      [class.k-focused]="keyboardService.focusedTaskId() === bar.task.id"
                      [class.k-selected]="selectedTaskId() === bar.task.id"
                      (mouseenter)="hoveredTaskId.set(bar.primaryTaskId); showTooltip(bar.task, $event)"
                      (mouseleave)="hoveredTaskId.set(null); hideTooltip()"
                      (click)="onTaskBarClick(bar.task, $event)"
                      (dblclick)="onTaskBarDblClick(bar.task, $event)"
                      tabindex="0"
                      [attr.aria-label]="'Milestone: ' + bar.task.name"
                    >
                      <div class="k-milestone-diamond" [style.background]="bar.task.color || null"></div>
                    </div>
                  } @else if (bar.isSummary) {
                    <!-- Summary bar (parent task) -->
                    <div
                      class="k-task-summary"
                      [style.left.px]="bar.left"
                      [style.width.px]="bar.width"
                      [class.k-focused]="keyboardService.focusedTaskId() === bar.task.id"
                      [class.k-selected]="selectedTaskId() === bar.task.id"
                      (mouseenter)="hoveredTaskId.set(bar.primaryTaskId); showTooltip(bar.task, $event)"
                      (mouseleave)="hoveredTaskId.set(null); hideTooltip()"
                      (click)="onTaskBarClick(bar.task, $event)"
                      (dblclick)="onTaskBarDblClick(bar.task, $event)"
                      tabindex="0"
                      [attr.aria-label]="bar.task.name + ' - ' + bar.task.progress + '% complete'"
                    >
                      <div class="k-summary-bar">
                        <div class="k-summary-progress" [style.width.%]="bar.task.progress"></div>
                      </div>
                      <div class="k-summary-left-cap"></div>
                      <div class="k-summary-right-cap"></div>
                    </div>
                  } @else {
                    <!-- Regular task bar -->
                    <div
                      class="k-task"
                      [style.left.px]="bar.left"
                      [style.width.px]="bar.width"
                      [style.background]="bar.task.color || null"
                      [class.k-focused]="keyboardService.focusedTaskId() === bar.task.id"
                      [class.k-selected]="selectedTaskId() === bar.task.id"
                      (mouseenter)="hoveredTaskId.set(bar.primaryTaskId); showTooltip(bar.task, $event)"
                      (mouseleave)="hoveredTaskId.set(null); hideTooltip()"
                      (pointerdown)="onBarPointerDown($event, bar.task, 'move')"
                      (click)="onTaskBarClick(bar.task, $event)"
                      (dblclick)="onTaskBarDblClick(bar.task, $event)"
                      tabindex="0"
                      role="img"
                      [attr.aria-label]="bar.task.name + ' - ' + bar.task.progress + '% complete'"
                    >
                      <!-- Progress fill -->
                      <div class="k-task-progress" [style.width.%]="bar.task.progress">
                        <div class="k-task-progress-inner"></div>
                      </div>
                      <!-- Task text -->
                      <span class="k-task-text">{{ bar.task.name }}</span>
                      <!-- Resize handles -->
                      @if (bar.task.draggable !== false) {
                        <div class="k-resize-handle k-resize-w" (pointerdown)="onBarPointerDown($event, bar.task, 'resize-left')"></div>
                        <div class="k-resize-handle k-resize-e" (pointerdown)="onBarPointerDown($event, bar.task, 'resize-right')"></div>
                      }
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Dependency arrows (SVG overlay) -->
            <svg class="k-gantt-dependencies" [attr.width]="totalWidth()" [attr.height]="totalHeight()">
              <defs>
                <marker id="k-arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="var(--ngx-gantt-arrow-color, #ff6358)"/>
                </marker>
              </defs>
              @for (dep of dependencyPaths(); track dep.key) {
                <path
                  class="k-dep-line"
                  [attr.d]="dep.path"
                  [attr.stroke]="dep.dependency.color || null"
                  marker-end="url(#k-arrowhead)"
                  (click)="onDependencyClick(dep.dependency, $event)"
                />
              }
            </svg>

          </div>
        </div>
      </div>
    </div>

    <!-- ===== TASK TOOLTIP ===== -->
    @if (tooltipTask()) {
      <div
        class="k-bar-tooltip"
        [style.left.px]="tooltipX()"
        [style.top.px]="tooltipY()"
      >
        <div class="k-bar-tooltip-title">{{ tooltipTask()!.name }}</div>
        <div class="k-bar-tooltip-row">
          <span class="k-bar-tooltip-label">Start</span>
          <span class="k-bar-tooltip-value">{{ formatDateFull(tooltipTask()!.start) }}</span>
        </div>
        <div class="k-bar-tooltip-row">
          <span class="k-bar-tooltip-label">End</span>
          <span class="k-bar-tooltip-value">{{ formatDateFull(tooltipTask()!.end) }}</span>
        </div>
        <div class="k-bar-tooltip-row">
          <span class="k-bar-tooltip-label">Progress</span>
          <span class="k-bar-tooltip-value">{{ tooltipTask()!.progress }}%</span>
        </div>
        @for (entry of getMetaEntries(tooltipTask()!.meta); track entry.key) {
          <div class="k-bar-tooltip-row">
            <span class="k-bar-tooltip-label">{{ entry.key }}</span>
            <span class="k-bar-tooltip-value">{{ entry.value }}</span>
          </div>
        }
      </div>
    }

    <!-- ===== ROW TOOLTIP (multi-task rows) ===== -->
    @if (rowTooltipData()) {
      <div
        class="k-bar-tooltip k-row-tooltip"
        [style.left.px]="rowTooltipX()"
        [style.top.px]="rowTooltipY()"
      >
        <div class="k-bar-tooltip-title">Tasks in this row</div>
        @for (t of rowTooltipData()!.allTasks; track t.id) {
          <div class="k-row-tooltip-task">
            <span class="k-row-tooltip-dot" [style.background]="t.color || '#4a90d9'"></span>
            <span class="k-row-tooltip-name">{{ t.name }}</span>
            <span class="k-bar-tooltip-label">{{ formatDateShort(t.start) }}–{{ formatDateShort(t.end) }}</span>
            <span class="k-bar-tooltip-value">{{ t.progress }}%</span>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    /* ===== ROOT ===== */
    :host {
      display: block;
    }

    .k-gantt {
      display: flex;
      height: 100%;
      width: 100%;
      background: var(--ngx-gantt-bg, #ffffff);
      border: 1px solid var(--ngx-gantt-border, #dee2e6);
      border-radius: 4px;
      font-family: var(--ngx-gantt-font, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif);
      font-size: var(--ngx-gantt-font-size, 13px);
      color: var(--ngx-gantt-text, #212529);
      overflow: hidden;
      position: relative;
    }

    /* ===== TREELIST ===== */
    .k-gantt-treelist {
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      border-right: 1px solid var(--ngx-gantt-border, #dee2e6);
      overflow: hidden;
      background: var(--ngx-gantt-bg, #ffffff);
    }

    .k-treelist-header {
      flex-shrink: 0;
      background: var(--ngx-gantt-header-bg, #f1f3f5);
      border-bottom: 1px solid var(--ngx-gantt-border, #dee2e6);
      overflow: hidden;
      display: flex;
      align-items: flex-end;
    }

    .k-treelist-header-table,
    .k-treelist-table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }

    .k-header-cell {
      padding: 8px 8px;
      text-align: left;
      font-size: var(--ngx-gantt-header-font-size, 12px);
      font-weight: 600;
      color: var(--ngx-gantt-header-text, #495057);
      border-right: 1px solid var(--ngx-gantt-border, #dee2e6);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .k-header-cell:last-child {
      border-right: none;
      text-align: center;
    }

    .k-treelist-content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .k-treelist-row {
      cursor: default;
      border-bottom: 1px solid var(--ngx-gantt-grid-line, #ebedf0);
    }
    .k-treelist-row.k-alt {
      background: var(--ngx-gantt-alt-bg, #f8f9fa);
    }
    .k-treelist-row.k-hover {
      background: var(--ngx-gantt-hover-bg, #e8f0fe) !important;
    }
    .k-treelist-row.k-selected {
      background: var(--ngx-gantt-selected-bg, #d0e1f9) !important;
    }

    .k-treelist-cell {
      padding: 0 8px;
      height: 100%;
      vertical-align: middle;
      border-right: 1px solid var(--ngx-gantt-grid-line, #ebedf0);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .k-treelist-cell:last-child {
      border-right: none;
    }

    .k-name-cell {
      display: flex;
      align-items: center;
      gap: 0;
    }
    .k-indent {
      display: inline-block;
      flex-shrink: 0;
    }

    .k-name-wrapper {
      display: flex;
      flex-direction: column;
      min-width: 0;
      justify-content: center;
      gap: 2px;
      overflow: hidden;
    }

    .k-extra-tasks-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 3px;
    }

    .k-extra-task-chip {
      display: inline-flex;
      align-items: center;
      padding: 0 5px;
      height: 14px;
      border-radius: 7px;
      font-size: 10px;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 110px;
      opacity: 0.9;
      font-weight: 500;
      letter-spacing: 0.01em;
    }

    .k-multi-pct {
      cursor: help;
    }
    .k-collapse-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      color: var(--ngx-gantt-text-secondary, #6c757d);
      border-radius: 3px;
    }
    .k-collapse-btn:hover {
      background: var(--ngx-gantt-border, #dee2e6);
    }
    .k-icon {
      font-size: 8px;
      transition: transform 0.15s ease;
      display: inline-block;
    }
    .k-icon.k-collapsed {
      transform: rotate(-90deg);
    }
    .k-collapse-spacer {
      display: inline-block;
      width: 20px;
      flex-shrink: 0;
    }
    .k-milestone-icon {
      color: var(--ngx-gantt-milestone-color, #e74c3c);
      margin-right: 4px;
      font-size: 10px;
      flex-shrink: 0;
    }
    .k-task-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .k-summary-name {
      font-weight: 600;
    }
    .k-date-cell {
      font-size: 11px;
      color: var(--ngx-gantt-text-secondary, #6c757d);
      text-align: center;
    }
    .k-pct-cell {
      font-size: 11px;
      text-align: center;
      font-weight: 500;
    }

    /* ===== SPLITBAR ===== */
    .k-splitbar {
      width: 7px;
      flex-shrink: 0;
      background: var(--ngx-gantt-header-bg, #f1f3f5);
      border-left: 1px solid var(--ngx-gantt-border, #dee2e6);
      border-right: 1px solid var(--ngx-gantt-border, #dee2e6);
      cursor: col-resize;
      display: flex;
      align-items: center;
      justify-content: center;
      user-select: none;
      z-index: 2;
    }
    .k-splitbar:hover {
      background: var(--ngx-gantt-border, #dee2e6);
    }
    .k-splitbar-icon {
      color: var(--ngx-gantt-text-secondary, #6c757d);
      font-size: 14px;
      line-height: 1;
    }

    /* ===== TIMELINE ===== */
    .k-gantt-timeline {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .k-timeline-header {
      flex-shrink: 0;
      overflow: hidden;
      background: var(--ngx-gantt-header-bg, #f1f3f5);
      border-bottom: 1px solid var(--ngx-gantt-border, #dee2e6);
    }
    .k-timeline-header-wrap {
      position: relative;
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .k-header-row {
      position: relative;
      flex: 1;
    }
    .k-header-primary {
      border-bottom: 1px solid var(--ngx-gantt-border, #dee2e6);
    }
    .k-header-group-cell {
      position: absolute;
      top: 0;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--ngx-gantt-header-font-size, 12px);
      font-weight: 600;
      color: var(--ngx-gantt-header-text, #495057);
      border-right: 1px solid var(--ngx-gantt-border, #dee2e6);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      padding: 0 4px;
      box-sizing: border-box;
    }
    .k-header-tick-cell {
      position: absolute;
      top: 0;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      color: var(--ngx-gantt-text-secondary, #6c757d);
      border-right: 1px solid var(--ngx-gantt-grid-line, #ebedf0);
      white-space: nowrap;
      box-sizing: border-box;
    }
    .k-header-tick-cell.k-weekend {
      background: var(--ngx-gantt-weekend-bg, rgba(0,0,0,0.02));
      color: #adb5bd;
    }
    .k-header-tick-cell.k-today-header {
      color: var(--ngx-gantt-today-color, #ff6358);
      font-weight: 700;
    }

    /* ===== TIMELINE CONTENT ===== */
    .k-timeline-content {
      flex: 1;
      overflow: auto;
    }
    .k-timeline-canvas {
      position: relative;
    }

    /* Background rows */
    .k-gantt-rows {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
    }
    .k-gantt-row {
      position: absolute;
      left: 0;
      right: 0;
      border-bottom: 1px solid var(--ngx-gantt-grid-line, #ebedf0);
    }
    .k-gantt-row.k-alt {
      background: var(--ngx-gantt-alt-bg, #f8f9fa);
    }
    .k-gantt-row.k-hover {
      background: var(--ngx-gantt-hover-bg, #e8f0fe) !important;
    }
    .k-gantt-row.k-selected {
      background: var(--ngx-gantt-selected-bg, #d0e1f9) !important;
    }

    /* Vertical columns */
    .k-gantt-columns {
      position: absolute;
      top: 0;
      left: 0;
    }
    .k-gantt-column {
      position: absolute;
      top: 0;
      border-right: 1px solid var(--ngx-gantt-grid-line, #ebedf0);
      box-sizing: border-box;
    }
    .k-gantt-column.k-weekend-col {
      background: var(--ngx-gantt-weekend-bg, rgba(0,0,0,0.02));
    }

    /* Today marker */
    .k-today-marker {
      position: absolute;
      top: 0;
      width: 2px;
      background: var(--ngx-gantt-today-color, #ff6358);
      z-index: 3;
      pointer-events: none;
    }
    .k-today-indicator {
      position: absolute;
      top: -1px;
      left: -5px;
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 8px solid var(--ngx-gantt-today-color, #ff6358);
    }

    /* ===== TASK BARS ===== */
    .k-gantt-tasks {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 2;
    }
    .k-task-wrap {
      position: absolute;
      left: 0;
      right: 0;
      display: flex;
      align-items: center;
      pointer-events: none;
    }

    /* Regular task */
    .k-task {
      position: absolute;
      height: var(--ngx-gantt-bar-height, 24px);
      background: var(--ngx-gantt-bar-bg, #4a90d9);
      border-radius: 4px;
      cursor: grab;
      pointer-events: all;
      display: flex;
      align-items: center;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.06);
      transition: box-shadow 0.15s ease;
      user-select: none;
    }
    .k-task:hover {
      box-shadow: 0 3px 8px rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.1);
    }
    .k-task:active {
      cursor: grabbing;
    }
    .k-task.k-focused {
      outline: 2px solid var(--ngx-gantt-focus-ring, #4a90d9);
      outline-offset: 2px;
    }
    .k-task.k-selected {
      outline: 2px solid var(--ngx-gantt-focus-ring, #4a90d9);
      outline-offset: 1px;
    }

    .k-task-progress {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      overflow: hidden;
      border-radius: 4px 0 0 4px;
    }
    .k-task-progress-inner {
      width: 10000px;
      height: 100%;
      background: var(--ngx-gantt-bar-progress-bg, #2d6cb4);
    }

    .k-task-text {
      position: relative;
      z-index: 1;
      padding: 0 8px;
      color: var(--ngx-gantt-bar-text, #ffffff);
      font-size: 12px;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-shadow: 0 1px 1px rgba(0,0,0,0.15);
    }

    .k-resize-handle {
      position: absolute;
      top: 0;
      width: 6px;
      height: 100%;
      cursor: col-resize;
      pointer-events: all;
      z-index: 2;
    }
    .k-resize-w { left: 0; }
    .k-resize-e { right: 0; }
    .k-resize-handle:hover {
      background: rgba(255,255,255,0.25);
    }

    /* Summary bar (with caps) */
    .k-task-summary {
      position: absolute;
      height: 10px;
      pointer-events: all;
      cursor: pointer;
      display: flex;
      align-items: flex-end;
    }
    .k-task-summary.k-focused,
    .k-task-summary.k-selected {
      outline: 2px solid var(--ngx-gantt-focus-ring, #4a90d9);
      outline-offset: 3px;
      border-radius: 2px;
    }
    .k-summary-bar {
      position: relative;
      width: 100%;
      height: 6px;
      background: var(--ngx-gantt-summary-color, #495057);
      border-radius: 0;
    }
    .k-summary-progress {
      height: 100%;
      background: #343a40;
    }
    .k-summary-left-cap,
    .k-summary-right-cap {
      position: absolute;
      bottom: 0;
      width: 0;
      height: 0;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-top: 6px solid var(--ngx-gantt-summary-color, #495057);
    }
    .k-summary-left-cap {
      left: -1px;
    }
    .k-summary-right-cap {
      right: -1px;
    }

    /* Milestone (diamond) */
    .k-milestone {
      position: absolute;
      pointer-events: all;
      cursor: pointer;
    }
    .k-milestone.k-focused,
    .k-milestone.k-selected {
      outline: 2px solid var(--ngx-gantt-focus-ring, #4a90d9);
      outline-offset: 4px;
      border-radius: 2px;
    }
    .k-milestone-diamond {
      width: 16px;
      height: 16px;
      background: var(--ngx-gantt-milestone-color, #e74c3c);
      transform: rotate(45deg);
      border-radius: 2px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.15);
    }

    /* ===== DEPENDENCY ARROWS ===== */
    .k-gantt-dependencies {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
      pointer-events: none;
    }
    .k-dep-line {
      fill: none;
      stroke: var(--ngx-gantt-arrow-color, #ff6358);
      stroke-width: 1.5;
      pointer-events: stroke;
      cursor: pointer;
    }
    .k-dep-line:hover {
      stroke-width: 3;
    }

    /* ===== TASK TOOLTIP ===== */
    @keyframes k-tooltip-fadein {
      from { opacity: 0; transform: translateY(4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .k-bar-tooltip {
      position: fixed;
      z-index: 9999;
      background: var(--ngx-gantt-tooltip-bg, #2d3748);
      color: var(--ngx-gantt-tooltip-text, #ffffff);
      border-radius: 6px;
      padding: 10px 14px;
      min-width: 180px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.22);
      pointer-events: none;
      font-size: 12px;
      line-height: 1.5;
      animation: k-tooltip-fadein 0.15s ease;
    }
    .k-bar-tooltip-title {
      font-weight: 700;
      font-size: 13px;
      margin-bottom: 6px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 220px;
    }
    .k-bar-tooltip-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      margin-top: 3px;
    }
    .k-bar-tooltip-label {
      color: var(--ngx-gantt-tooltip-label, rgba(255,255,255,0.65));
      white-space: nowrap;
    }
    .k-bar-tooltip-value {
      font-weight: 500;
      white-space: nowrap;
    }

    /* Row tooltip (multi-task) */
    .k-row-tooltip {
      min-width: 240px;
    }
    .k-row-tooltip-task {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 5px;
      padding-top: 5px;
      border-top: 1px solid rgba(255,255,255,0.12);
    }
    .k-row-tooltip-task:first-of-type {
      border-top: none;
    }
    .k-row-tooltip-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .k-row-tooltip-name {
      flex: 1;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `]
})
export class GanttChartComponent {
  // Inputs
  tasks = input.required<GanttTask[]>();
  dependencies = input<GanttDependency[]>([]);
  config = input<Partial<GanttConfig>>({});

  // Outputs
  taskChange = output<GanttTaskChangeEvent>();
  taskClick = output<GanttTaskClickEvent>();
  taskDblClick = output<GanttTaskClickEvent>();
  dependencyClick = output<GanttDependencyClickEvent>();
  scroll = output<GanttScrollEvent>();
  zoomChange = output<ZoomLevel>();

  // Services
  private scaleService = inject(GanttScaleService);
  private layoutService = inject(GanttLayoutService);
  keyboardService = inject(GanttKeyboardService);

  // View children
  private timelineContent = viewChild<ElementRef<HTMLDivElement>>('timelineContent');
  private treelistContent = viewChild<ElementRef<HTMLDivElement>>('treelistContent');

  // Internal state
  private internalCollapsed = signal<Map<string, boolean>>(new Map());
  hoveredTaskId = signal<string | null>(null);
  selectedTaskId = signal<string | null>(null);
  scrollLeft = signal(0);
  private scrollTop_ = signal(0);
  private sidebarWidthOverride = signal<number | null>(null);

  // Tooltip state
  tooltipTask = signal<GanttTask | null>(null);
  tooltipX = signal(0);
  tooltipY = signal(0);

  // Row tooltip state (for sidebar multi-task rows)
  rowTooltipData = signal<{ allTasks: GanttTask[] } | null>(null);
  rowTooltipX = signal(0);
  rowTooltipY = signal(0);

  // Merged config
  mergedConfig = computed<GanttConfig>(() => {
    const base = { ...DEFAULT_GANTT_CONFIG, ...this.config() };
    const sbOverride = this.sidebarWidthOverride();
    if (sbOverride !== null) {
      base.sidebarWidth = sbOverride;
    }
    return base;
  });

  // Tasks with collapse applied
  private effectiveTasks = computed<GanttTask[]>(() => {
    const collapsed = this.internalCollapsed();
    return this.tasks().map(t => ({
      ...t,
      collapsed: collapsed.has(t.id) ? collapsed.get(t.id)! : t.collapsed,
    }));
  });

  // Flat row list
  private flatRows = computed<FlatRow[]>(() =>
    this.layoutService.flattenTasks(this.effectiveTasks())
  );

  visibleRows = computed<FlatRow[]>(() =>
    this.flatRows().filter(r => r.isVisible)
  );

  // Date range
  private dateRange = computed(() => getDateRange(this.tasks()));

  private columnDates = computed(() =>
    getColumnDates(this.dateRange().start, this.dateRange().end, this.mergedConfig().zoomLevel)
  );

  // Dimensions
  totalWidth = computed(() =>
    this.columnDates().length * this.mergedConfig().columnWidth
  );

  totalHeight = computed(() =>
    this.visibleRows().length * this.mergedConfig().rowHeight
  );

  // Header columns with labels
  headerColumns = computed(() => {
    const cfg = this.mergedConfig();
    const today = startOfDay(new Date());
    return this.columnDates().map((date, i) => {
      const isWknd = isWeekend(date);
      const isToday = date.getTime() === today.getTime();
      return {
        x: i * cfg.columnWidth,
        width: cfg.columnWidth,
        date,
        label: this.getSecondaryLabel(date, cfg.zoomLevel, cfg.locale),
        isWeekend: isWknd,
        isToday,
      };
    });
  });

  // Primary header groups
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
        groups.push({
          x: startIdx * cfg.columnWidth,
          width: (i - startIdx) * cfg.columnWidth,
          label: currentLabel,
        });
        currentLabel = label;
        startIdx = i;
      }
    }
    return groups;
  });

  // Today X
  todayX = computed<number | null>(() => {
    const today = startOfDay(new Date());
    const range = this.dateRange();
    if (today < range.start || today > range.end) return null;
    const cfg = this.mergedConfig();
    return this.scaleService.dateToX(today, range.start, cfg.columnWidth, cfg.zoomLevel);
  });

  // Task bar geometries (div positioning)
  taskBars = computed(() => {
    const cfg = this.mergedConfig();
    const range = this.dateRange();
    const barHeight = 24; // default

    const makeBar = (
      task: GanttTask,
      top: number,
      rowIndex: number,
      isSummary: boolean,
      primaryTaskId: string,
    ) => ({
      task,
      left: this.scaleService.dateToX(task.start, range.start, cfg.columnWidth, cfg.zoomLevel),
      width: task.isMilestone
        ? 0
        : this.scaleService.getBarWidth(task.start, task.end, range.start, cfg.columnWidth, cfg.zoomLevel),
      top,
      isSummary,
      barHeight,
      rowIndex,
      primaryTaskId,
    });

    const bars: ReturnType<typeof makeBar>[] = [];

    this.visibleRows().forEach((row, idx) => {
      const top = idx * cfg.rowHeight;
      const isSummary = row.hasChildren && !row.task.isMilestone;
      bars.push(makeBar(row.task, top, idx, isSummary, row.task.id));
      for (const extra of row.extraTasks) {
        bars.push(makeBar(extra, top, idx, false, row.task.id));
      }
    });

    return bars;
  });

  // Dependency paths
  dependencyPaths = computed(() => {
    const bars = this.taskBars();
    const cfg = this.mergedConfig();
    const barMap = new Map(bars.map(b => [b.task.id, b]));

    return this.dependencies()
      .filter(dep => barMap.has(dep.fromId) && barMap.has(dep.toId))
      .map(dep => {
        const from = barMap.get(dep.fromId)!;
        const to = barMap.get(dep.toId)!;

        const barH = from.isSummary ? 10 : 24;
        const fromCenterY = from.top + cfg.rowHeight / 2;
        const toCenterY = to.top + cfg.rowHeight / 2;

        const fromRect: Rect = { x: from.left, y: fromCenterY - barH / 2, width: from.width || 16, height: barH };
        const toRect: Rect = { x: to.left, y: toCenterY - (to.isSummary ? 5 : 12), width: to.width || 16, height: to.isSummary ? 10 : 24 };

        return {
          dependency: dep,
          path: computeDependencyPath(fromRect, toRect, dep.type),
          key: dep.fromId + '-' + dep.toId,
        };
      });
  });

  // Timeline scroll handler — syncs treelist scroll & header position
  onTimelineScroll(): void {
    const el = this.timelineContent()?.nativeElement;
    if (!el) return;
    this.scrollLeft.set(el.scrollLeft);
    this.scrollTop_.set(el.scrollTop);

    // Sync treelist vertical scroll
    const treeEl = this.treelistContent()?.nativeElement;
    if (treeEl) treeEl.scrollTop = el.scrollTop;
  }

  // Splitbar resize
  onSplitBarDown(event: PointerEvent): void {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = this.mergedConfig().sidebarWidth;

    const onMove = (e: PointerEvent) => {
      const delta = e.clientX - startX;
      const newWidth = Math.max(150, Math.min(600, startWidth + delta));
      this.sidebarWidthOverride.set(newWidth);
    };

    const onUp = () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }

  // Task bar drag (move/resize)
  onBarPointerDown(event: PointerEvent, task: GanttTask, mode: 'move' | 'resize-left' | 'resize-right'): void {
    if (task.draggable === false) return;
    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const cfg = this.mergedConfig();
    const range = this.dateRange();

    const barEl = (event.target as HTMLElement).closest('.k-task') as HTMLElement;
    if (!barEl) return;

    const origLeft = parseFloat(barEl.style.left) || 0;
    const origWidth = parseFloat(barEl.style.width) || barEl.offsetWidth;

    barEl.style.cursor = mode === 'move' ? 'grabbing' : 'col-resize';
    barEl.style.zIndex = '10';
    barEl.style.opacity = '0.85';

    const onMove = (e: PointerEvent) => {
      const deltaX = e.clientX - startX;
      if (mode === 'move') {
        barEl.style.left = (origLeft + deltaX) + 'px';
      } else if (mode === 'resize-right') {
        barEl.style.width = Math.max(10, origWidth + deltaX) + 'px';
      } else {
        const newLeft = origLeft + deltaX;
        const newWidth = origWidth - deltaX;
        if (newWidth > 10) {
          barEl.style.left = newLeft + 'px';
          barEl.style.width = newWidth + 'px';
        }
      }
    };

    const onUp = (e: PointerEvent) => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);

      barEl.style.cursor = '';
      barEl.style.zIndex = '';
      barEl.style.opacity = '';

      const deltaX = e.clientX - startX;
      if (Math.abs(deltaX) < 2) return; // ignore tiny movements

      const pxPerMs = cfg.columnWidth / this.getMsPerUnit(cfg.zoomLevel);
      const deltaMs = deltaX / pxPerMs;

      const previousStart = task.start;
      const previousEnd = task.end;
      let newStart: Date;
      let newEnd: Date;

      if (mode === 'move') {
        newStart = new Date(previousStart.getTime() + deltaMs);
        newEnd = new Date(previousEnd.getTime() + deltaMs);
      } else if (mode === 'resize-right') {
        newStart = previousStart;
        newEnd = new Date(previousEnd.getTime() + deltaMs);
      } else {
        newStart = new Date(previousStart.getTime() + deltaMs);
        newEnd = previousEnd;
      }

      if (cfg.snapTo === 'day') {
        newStart = this.scaleService.snapDate(newStart, 'day');
        newEnd = this.scaleService.snapDate(newEnd, 'day');
      }
      if (newEnd <= newStart) {
        newEnd = addDays(newStart, 1);
      }

      this.taskChange.emit({
        task: { ...task, start: newStart, end: newEnd },
        previousStart,
        previousEnd,
      });
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }

  // Row click
  onRowClick(task: GanttTask, event: MouseEvent): void {
    this.selectedTaskId.set(task.id);
    this.keyboardService.focusTask(task.id);
    this.taskClick.emit({ task, originalEvent: event });
  }

  // Task bar click
  onTaskBarClick(task: GanttTask, event: MouseEvent): void {
    event.stopPropagation();
    this.selectedTaskId.set(task.id);
    this.keyboardService.focusTask(task.id);
    this.taskClick.emit({ task, originalEvent: event });
  }

  onTaskBarDblClick(task: GanttTask, event: MouseEvent): void {
    event.stopPropagation();
    this.taskDblClick.emit({ task, originalEvent: event });
  }

  onDependencyClick(dep: GanttDependency, event: MouseEvent): void {
    this.dependencyClick.emit({ dependency: dep, originalEvent: event });
  }

  onToggleCollapse(taskId: string): void {
    const current = new Map(this.internalCollapsed());
    const task = this.tasks().find(t => t.id === taskId);
    if (!task) return;
    const isCollapsed = current.has(taskId) ? current.get(taskId)! : task.collapsed;
    current.set(taskId, !isCollapsed);
    this.internalCollapsed.set(current);
  }

  onKeyDown(event: KeyboardEvent): void {
    const ids = this.visibleRows().map(r => r.task.id);
    this.keyboardService.handleKeyDown(event, ids, {
      onSelect: (taskId) => {
        const task = this.tasks().find(t => t.id === taskId);
        if (task) {
          this.selectedTaskId.set(taskId);
          this.taskClick.emit({ task, originalEvent: event as unknown as MouseEvent });
        }
      },
      onEscape: () => {
        this.selectedTaskId.set(null);
      },
    });
  }

  // Public API
  scrollToDate(date: Date): void {
    const cfg = this.mergedConfig();
    const range = this.dateRange();
    const x = this.scaleService.dateToX(date, range.start, cfg.columnWidth, cfg.zoomLevel);
    const el = this.timelineContent()?.nativeElement;
    if (el) el.scrollLeft = x;
  }

  scrollToTask(taskId: string): void {
    const row = this.visibleRows().find(r => r.task.id === taskId);
    if (!row) return;
    const y = row.rowIndex * this.mergedConfig().rowHeight;
    const el = this.timelineContent()?.nativeElement;
    if (el) el.scrollTop = y;
  }

  expandAll(): void {
    const map = new Map<string, boolean>();
    this.tasks().forEach(t => map.set(t.id, false));
    this.internalCollapsed.set(map);
  }

  collapseAll(): void {
    const rows = this.flatRows();
    const map = new Map<string, boolean>();
    rows.filter(r => r.hasChildren).forEach(r => map.set(r.task.id, true));
    this.internalCollapsed.set(map);
  }

  // Helpers
  formatDateShort(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  formatDateFull(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  showTooltip(task: GanttTask, event: MouseEvent): void {
    this.tooltipTask.set(task);
    const OFFSET = 14;
    const TOOLTIP_W = 220;
    const TOOLTIP_H = 100;
    const flipCoord = (cursor: number, size: number, viewport: number): number =>
      cursor + OFFSET + size > viewport ? cursor - size - OFFSET : cursor + OFFSET;
    this.tooltipX.set(flipCoord(event.clientX, TOOLTIP_W, window.innerWidth));
    this.tooltipY.set(flipCoord(event.clientY, TOOLTIP_H, window.innerHeight));
  }

  hideTooltip(): void {
    this.tooltipTask.set(null);
  }

  // Multi-task row helpers
  getRowStart(row: FlatRow): Date {
    if (row.extraTasks.length === 0) return row.task.start;
    const times = [row.task.start, ...row.extraTasks.map(t => t.start)].map(d => d.getTime());
    return new Date(Math.min(...times));
  }

  getRowEnd(row: FlatRow): Date {
    if (row.extraTasks.length === 0) return row.task.end;
    const times = [row.task.end, ...row.extraTasks.map(t => t.end)].map(d => d.getTime());
    return new Date(Math.max(...times));
  }

  getRowAvgProgress(row: FlatRow): number {
    const all = [row.task, ...row.extraTasks];
    return Math.round(all.reduce((sum, t) => sum + t.progress, 0) / all.length);
  }

  getRowProgressTitle(row: FlatRow): string {
    const all = [row.task, ...row.extraTasks];
    return all.map(t => `${t.name}: ${t.progress}%`).join(', ');
  }

  getMetaEntries(meta: Record<string, unknown> | undefined): { key: string; value: string }[] {
    if (!meta) return [];
    return Object.entries(meta).map(([key, value]) => ({
      // Convert camelCase keys like "assignee" → "Assignee", "apiURL" → "Api URL"
      key: key
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/^./, c => c.toUpperCase()),
      value: String(value),
    }));
  }

  showRowTooltip(row: FlatRow, event: MouseEvent): void {
    const allTasks = [row.task, ...row.extraTasks];
    this.rowTooltipData.set({ allTasks });
    this.positionRowTooltip(event);
  }

  updateRowTooltip(event: MouseEvent): void {
    if (this.rowTooltipData()) {
      this.positionRowTooltip(event);
    }
  }

  hideRowTooltip(): void {
    this.rowTooltipData.set(null);
  }

  private positionRowTooltip(event: MouseEvent): void {
    const OFFSET = 14;
    const TOOLTIP_W = 260;
    const TOOLTIP_H = 120;
    const flipCoord = (cursor: number, size: number, viewport: number): number =>
      cursor + OFFSET + size > viewport ? cursor - size - OFFSET : cursor + OFFSET;
    this.rowTooltipX.set(flipCoord(event.clientX, TOOLTIP_W, window.innerWidth));
    this.rowTooltipY.set(flipCoord(event.clientY, TOOLTIP_H, window.innerHeight));
  }

  private getPrimaryLabel(date: Date, zoom: ZoomLevel, locale: string): string {
    switch (zoom) {
      case ZoomLevel.Day:
      case ZoomLevel.Week:
        return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
      case ZoomLevel.Month:
        return date.getFullYear().toString();
    }
  }

  private getSecondaryLabel(date: Date, zoom: ZoomLevel, locale: string): string {
    switch (zoom) {
      case ZoomLevel.Day: {
        const day = date.getDate();
        const weekday = date.toLocaleDateString(locale, { weekday: 'narrow' });
        return `${weekday} ${day}`;
      }
      case ZoomLevel.Week: {
        const oneJan = new Date(date.getFullYear(), 0, 1);
        const weekNum = Math.ceil(((date.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) / 7);
        return `W${weekNum}`;
      }
      case ZoomLevel.Month:
        return date.toLocaleDateString(locale, { month: 'short' });
    }
  }

  private getMsPerUnit(zoom: ZoomLevel): number {
    switch (zoom) {
      case ZoomLevel.Day: return 86400000;
      case ZoomLevel.Week: return 604800000;
      case ZoomLevel.Month: return 2592000000;
    }
  }
}
