import { CommonModule } from '@angular/common';
import { Component, HostListener, computed, effect, input, output, signal, OnInit, OnDestroy, Directive, TemplateRef, inject, contentChild } from '@angular/core';
import { SchedulerEvent, SchedulerEventChangeEvent, SchedulerSlotClickEvent, SchedulerResource, SchedulerSlotRangeSelectEvent } from './models';
import { NGX_CORE_I18N } from 'ngx-core-components/i18n';

@Directive({
  selector: '[ngxSchedulerEventTemplate]',
  standalone: true
})
export class NgxSchedulerEventTemplateDirective {
  templateRef = inject(TemplateRef);
}

interface TimeSlot {
  hour: number;
  minute: number;
  key: string;
}

interface ResolvedSchedulerEvent {
  id: string;
  event: SchedulerEvent;
  start: Date;
  end: Date;
}

interface SchedulerEventLayout extends ResolvedSchedulerEvent {
  top: number;
  height: number;
  left: number;
  width: number;
}

interface ResizeState {
  event: SchedulerEvent;
  edge: 'start' | 'end';
  start: Date;
  end: Date;
  originY: number;
}

@Component({
  selector: 'ngx-scheduler',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ngx-scheduler-wrapper" [class.dark]="theme() === 'dark'">
      
      <!-- Scheduler Toolbar -->
      <div class="scheduler-toolbar">
        <div class="nav-controls">
          <div class="nav-buttons-group">
            <button class="tool-btn nav-arrow" type="button" (click)="navigate(-1)" aria-label="Previous period">
              <svg class="icon-svg" viewBox="0 0 24 24"><path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
            </button>
            <button class="tool-btn today-btn" type="button" (click)="goToToday()">{{ i18n.scheduler.today }}</button>
            <button class="tool-btn nav-arrow" type="button" (click)="navigate(1)" aria-label="Next period">
              <svg class="icon-svg" viewBox="0 0 24 24"><path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
            </button>
          </div>
          <h2 class="current-period-label">{{ periodLabel() }}</h2>
        </div>

        <div class="toolbar-actions">
          <!-- Keyword Search -->
          @if (showSearch()) {
            <div class="search-box-container">
              <svg class="search-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
              <input type="text" 
                     class="search-input" 
                     [placeholder]="i18n.common.search" 
                     [value]="searchQuery()" 
                     (input)="onSearchInput($event)" />
            </div>
          }

          <!-- Resource Select Filter (Week/Month View) -->
          @if (resources().length > 0 && activeMode() !== 'day') {
            <div class="resource-filter-container">
              <select class="resource-select" [value]="selectedResourceId() || ''" (change)="onResourceFilterChange($event)">
                <option value="">All Resources</option>
                @for (res of resources(); track res.id) {
                  <option [value]="res.id">{{ res.name }}</option>
                }
              </select>
            </div>
          }

          <!-- Export Dropdown -->
          <div class="export-dropdown-wrapper">
            <button class="tool-btn export-toggle-btn" type="button" (click)="showExportDropdown.set(!showExportDropdown())">
              <span>Export</span>
              <svg class="dropdown-arrow-svg" viewBox="0 0 24 24"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>
            </button>
            
            @if (showExportDropdown()) {
              <div class="export-menu-dropdown">
                <button class="export-item" (click)="exportToICS(); showExportDropdown.set(false)">
                  <svg class="export-icon-svg" viewBox="0 0 24 24"><path fill="currentColor" d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>
                  <span>iCalendar (.ics)</span>
                </button>
                <button class="export-item" (click)="exportToJSON(); showExportDropdown.set(false)">
                  <svg class="export-icon-svg" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                  <span>JSON format</span>
                </button>
                <button class="export-item" (click)="exportToCSV(); showExportDropdown.set(false)">
                  <svg class="export-icon-svg" viewBox="0 0 24 24"><path fill="currentColor" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                  <span>CSV document</span>
                </button>
              </div>
            }
          </div>

          <!-- View Switches -->
          <div class="view-switch-controls">
            @for (mode of viewModes; track mode) {
              <button
                type="button"
                class="view-btn"
                [class.active]="activeMode() === mode"
                (click)="activeMode.set(mode)"
              >
                {{ getViewModeLabel(mode) }}
              </button>
            }
          </div>
        </div>
      </div>

      <!-- Scheduler Body -->
      <div class="scheduler-body" (click)="showExportDropdown.set(false); activeMonthPopoverDate.set(null)">
        @if (activeMode() === 'day' || activeMode() === 'week') {
          <div class="time-grid-container">
            
            <!-- Grid Header -->
            <div class="time-grid-header">
              <div class="time-axis-header"></div>
              <div class="columns-headers-wrap">
                @for (col of activeColumns(); track col.resource ? col.resource.id : dateKey(col.date)) {
                  <div class="column-header-cell" [class.today]="isToday(col.date)">
                    @if (col.resource) {
                      <div class="resource-header-card">
                        @if (col.resource.avatarUrl) {
                          <img [src]="col.resource.avatarUrl" [alt]="col.resource.name" class="resource-avatar" />
                        } @else {
                          <div class="resource-initials" [style.background-color]="col.resource.color || 'var(--primary-color)'">
                            {{ getInitials(col.resource.name) }}
                          </div>
                        }
                        <div class="resource-info">
                          <span class="resource-name">{{ col.resource.name }}</span>
                          <span class="resource-desc">{{ col.resource.description || 'Team Member' }}</span>
                        </div>
                      </div>
                    } @else {
                      <span class="day-name">{{ formatDate(col.date, { weekday: 'short' }) }}</span>
                      <span class="day-num">{{ formatDate(col.date, { day: 'numeric' }) }}</span>
                    }
                  </div>
                }
              </div>
            </div>

            <!-- All-Day Events row -->
            @if (hasAllDayEvents()) {
              <div class="all-day-row-container">
                <div class="all-day-label-cell">{{ i18n.scheduler.allDay }}</div>
                <div class="all-day-columns-wrap">
                  @for (col of activeColumns(); track col.resource ? col.resource.id : dateKey(col.date)) {
                    <div class="all-day-column-cell">
                      @for (evt of getAllDayEventsForColumn(col); track evt.id) {
                        <div class="all-day-event-block"
                             [class.meeting]="evt.event.category === 'meeting'"
                             [class.task]="evt.event.category === 'task'"
                             [class.important]="evt.event.category === 'important'"
                             [class.warning]="evt.event.category === 'warning'"
                             [class.milestone]="evt.event.category === 'milestone'"
                             [class.personal]="evt.event.category === 'personal'"
                             [class.completed]="evt.event.completed"
                             [ngStyle]="getEventStyles(evt.event)"
                             (click)="clickEvent(evt.event); $event.stopPropagation()"
                             [title]="evt.event.title"
                        >
                          <div class="all-day-event-indicator"></div>
                          
                          @if (evt.event.category === 'task') {
                            <input type="checkbox"
                                   class="task-completion-checkbox all-day-task-checkbox"
                                   [checked]="evt.event.completed || false"
                                   (click)="$event.stopPropagation()"
                                   (change)="toggleTaskCompletion(evt.event, $event)" />
                          }

                          <span class="all-day-event-title">{{ evt.event.title }}</span>
                          <button class="event-delete-btn all-day-del" 
                                  type="button" 
                                  aria-label="Delete event"
                                  (click)="deleteEvent(evt.event, $event)">
                            <svg class="delete-icon-svg" viewBox="0 0 24 24"><path fill="currentColor" d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14V4zM6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z"/></svg>
                          </button>
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Grid Body -->
            <div class="time-grid-body">
              <div class="time-axis-labels">
                @for (h of hours(); track h) {
                  <div class="time-label">{{ formatHour(h) }}</div>
                }
              </div>

              <div class="columns-body-wrap" [style.min-height.px]="hours().length * hourHeight">
                <div class="hourly-grid-lines">
                  @for (h of hours(); track h) {
                    <div class="grid-line"></div>
                  }
                </div>

                @for (col of activeColumns(); track col.resource ? col.resource.id : dateKey(col.date)) {
                  <div class="column-body-cell">
                    
                    <!-- Interactive Slot Overlay -->
                    <div class="interactive-slots-overlay">
                      @for (slot of timeSlots(); track slot.key) {
                        <div
                          class="slot-trigger"
                          [class.non-business-slot]="isNonBusinessHour(slot.hour)"
                          [style.height.px]="slotHeight()"
                          (click)="clickSlot(col.date, slot.hour, slot.minute, col.resource?.id)"
                          (pointerdown)="onSlotPointerDown($event, col.date, slot.hour, slot.minute, col.resource?.id)"
                          (pointerenter)="onSlotPointerEnter($event, col.date, slot.hour, slot.minute, col.resource?.id)"
                          (dragover)="onSlotDragOver($event)"
                          (drop)="onSlotDrop($event, col.date, slot.hour, slot.minute, col.resource?.id)"
                        ></div>
                      }
                    </div>

                    <!-- Live Current Time Indicator Line -->
                    @if (isToday(col.date) && currentTimeTop(); as lineTop) {
                      <div class="current-time-line" [style.top.%]="lineTop">
                        <div class="line-dot"></div>
                      </div>
                    }

                    <!-- Drag Select Preview Block -->
                    @if (getDragSelectionLayout(col); as previewLayout) {
                      <div class="drag-select-preview"
                           [style.top.%]="previewLayout.top"
                           [style.height.%]="previewLayout.height">
                        <div class="preview-inner">
                          <svg class="plus-icon-svg" viewBox="0 0 24 24"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                          <span>Create Event</span>
                        </div>
                      </div>
                    }

                    <!-- Event Cards -->
                    @for (layout of getEventLayoutsForColumn(col); track layout.id) {
                      <div
                        class="scheduler-event-card"
                        [class.meeting]="layout.event.category === 'meeting'"
                        [class.task]="layout.event.category === 'task'"
                        [class.important]="layout.event.category === 'important'"
                        [class.warning]="layout.event.category === 'warning'"
                        [class.milestone]="layout.event.category === 'milestone'"
                        [class.personal]="layout.event.category === 'personal'"
                        [class.completed]="layout.event.completed"
                        [style.top.%]="layout.top"
                        [style.height.%]="layout.height"
                        [style.left.%]="layout.left"
                        [style.width.%]="layout.width"
                        [ngStyle]="getEventStyles(layout.event)"
                        draggable="true"
                        (dragstart)="onEventDragStart($event, layout)"
                        (dragend)="onEventDragEnd()"
                        (click)="clickEvent(layout.event)"
                        (keydown.enter)="clickEvent(layout.event)"
                        [title]="eventTitle(layout)"
                        tabindex="0"
                      >
                        <button
                          class="resize-handle resize-start"
                          type="button"
                          aria-label="Resize event start"
                          (click)="$event.stopPropagation()"
                          (pointerdown)="startResize($event, layout, 'start')"
                        ></button>
                        
                        @if (eventTemplate()) {
                          <ng-container *ngTemplateOutlet="eventTemplate()!.templateRef; context: { $implicit: layout.event, event: layout.event, layout: layout }" />
                        } @else {
                          <div class="event-color-indicator"></div>
                          
                          <!-- Task Completion Checkbox -->
                          @if (layout.event.category === 'task') {
                            <input type="checkbox"
                                   class="task-completion-checkbox"
                                   [checked]="layout.event.completed || false"
                                   (click)="$event.stopPropagation()"
                                   (change)="toggleTaskCompletion(layout.event, $event)" />
                          }

                          <div class="event-details">
                            <div class="event-header-row">
                              <span class="event-title">{{ layout.event.title }}</span>
                              @if (layout.event.recurrence) {
                                <svg class="recurrence-icon-svg" viewBox="0 0 24 24" title="Recurring series"><path fill="currentColor" d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L4.7 18.7c-1.07-1.63-1.7-3.6-1.7-5.7 0-5.52 4.48-10 10-10zm7.76 5.74L18.3 10.3c1.07 1.63 1.7 3.6 1.7 5.7 0 5.52-4.48 10-10 10v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/></svg>
                              }
                            </div>
                            
                            <span class="event-time">
                              {{ formatEventTime(layout.start, layout.end) }}
                              @if (layout.event.resourceId; as resId) {
                                • {{ getResourceName(resId) }}
                              }
                            </span>
                          </div>

                          <!-- Card Delete Quick Action -->
                          <button class="event-delete-btn" 
                                  type="button" 
                                  aria-label="Delete event"
                                  (click)="deleteEvent(layout.event, $event)">
                            <svg class="delete-icon-svg" viewBox="0 0 24 24"><path fill="currentColor" d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14V4zM6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z"/></svg>
                          </button>
                        }

                        <button
                          class="resize-handle resize-end"
                          type="button"
                          aria-label="Resize event end"
                          (click)="$event.stopPropagation()"
                          (pointerdown)="startResize($event, layout, 'end')"
                        ></button>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          </div>
        }

        @if (activeMode() === 'month') {
          <div class="month-grid-container">
            <div class="month-grid-header">
              @for (dayName of weekDayLabels(); track dayName) {
                <div class="month-header-cell">{{ dayName }}</div>
              }
            </div>

            <div class="month-grid-body">
              @for (cell of activeColumns(); track dateKey(cell.date)) {
                <div
                  class="month-day-cell"
                  [class.today]="isToday(cell.date)"
                  [class.other-month]="isOtherMonth(cell.date)"
                  (click)="clickSlot(cell.date, 9, 0)"
                >
                  <span class="month-day-number">{{ formatDate(cell.date, { day: 'numeric' }) }}</span>

                  <div class="month-day-events-list">
                    @for (evt of getEventsForDate(cell.date).slice(0, 2); track evt.id) {
                      <div
                        class="month-event-item"
                        [class.meeting]="evt.event.category === 'meeting'"
                        [class.task]="evt.event.category === 'task'"
                        [class.important]="evt.event.category === 'important'"
                        [class.warning]="evt.event.category === 'warning'"
                        [class.milestone]="evt.event.category === 'milestone'"
                        [class.personal]="evt.event.category === 'personal'"
                        [class.completed]="evt.event.completed"
                        [ngStyle]="getEventStyles(evt.event)"
                        (click)="clickEvent(evt.event); $event.stopPropagation()"
                        (keydown.enter)="clickEvent(evt.event); $event.stopPropagation()"
                        [title]="evt.event.title"
                        tabindex="0"
                      >
                        @if (evt.event.recurrence) {
                          <svg class="month-recurrence-icon-svg" viewBox="0 0 24 24"><path fill="currentColor" d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L4.7 18.7c-1.07-1.63-1.7-3.6-1.7-5.7 0-5.52 4.48-10 10-10zm7.76 5.74L18.3 10.3c1.07 1.63 1.7 3.6 1.7 5.7 0 5.52-4.48 10-10 10v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/></svg>
                        }
                        @if (eventTemplate()) {
                          <ng-container *ngTemplateOutlet="eventTemplate()!.templateRef; context: { $implicit: evt.event, event: evt.event, layout: evt }" />
                        } @else {
                          {{ evt.event.title }}
                        }
                      </div>
                    }
                    @if (getEventsForDate(cell.date).length > 2) {
                      <button 
                        class="month-more-indicator" 
                        type="button" 
                        (click)="openMonthPopover($event, cell.date)"
                      >
                        +{{ getEventsForDate(cell.date).length - 2 }} more
                      </button>
                    }
                  </div>

                  <!-- Month Events Popover -->
                  @if (activeMonthPopoverDate() && isSameDate(activeMonthPopoverDate()!, cell.date)) {
                    <div class="month-events-popover" (click)="$event.stopPropagation()">
                      <div class="popover-header">
                        <span class="popover-date">{{ formatDate(cell.date, { weekday: 'short', month: 'short', day: 'numeric' }) }}</span>
                        <button class="popover-close" type="button" (click)="closeMonthPopover($event)">×</button>
                      </div>
                      <div class="popover-body">
                        @for (evt of getEventsForDate(cell.date); track evt.id) {
                          <div
                            class="month-event-item popover-event-item"
                            [class.meeting]="evt.event.category === 'meeting'"
                            [class.task]="evt.event.category === 'task'"
                            [class.important]="evt.event.category === 'important'"
                            [class.warning]="evt.event.category === 'warning'"
                            [class.milestone]="evt.event.category === 'milestone'"
                            [class.personal]="evt.event.category === 'personal'"
                            [class.completed]="evt.event.completed"
                            [ngStyle]="getEventStyles(evt.event)"
                            (click)="clickEvent(evt.event); activeMonthPopoverDate.set(null); $event.stopPropagation()"
                            (keydown.enter)="clickEvent(evt.event); activeMonthPopoverDate.set(null); $event.stopPropagation()"
                            [title]="evt.event.title"
                            tabindex="0"
                          >
                            @if (evt.event.recurrence) {
                              <svg class="month-recurrence-icon-svg" viewBox="0 0 24 24"><path fill="currentColor" d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L4.7 18.7c-1.07-1.63-1.7-3.6-1.7-5.7 0-5.52 4.48-10 10-10zm7.76 5.74L18.3 10.3c1.07 1.63 1.7 3.6 1.7 5.7 0 5.52-4.48 10-10 10v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/></svg>
                            }
                            @if (eventTemplate()) {
                              <ng-container *ngTemplateOutlet="eventTemplate()!.templateRef; context: { $implicit: evt.event, event: evt.event, layout: evt }" />
                            } @else {
                              {{ evt.event.title }}
                            }
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; height: 100%; }
    .ngx-scheduler-wrapper { display: flex; flex-direction: column; height: 100%; min-height: 500px; border: 1px solid var(--border-color, #cbd5e1); border-radius: var(--radius-md, 12px); background: var(--bg-secondary, #ffffff); color: var(--text-primary, #0f172a); box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.08)); font-family: var(--ngx-font-family, sans-serif); overflow: hidden; transition: all 0.25s; }
    .scheduler-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; background: var(--border-light, #f1f5f9); border-bottom: 1px solid var(--border-color, #cbd5e1); gap: 16px; flex-wrap: wrap; }
    .nav-controls { display: flex; align-items: center; gap: 14px; }
    .nav-buttons-group { display: flex; align-items: center; border: 1px solid var(--border-color, #cbd5e1); border-radius: 8px; overflow: hidden; background: var(--bg-secondary, #ffffff); box-shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.05)); }
    .tool-btn { background: var(--bg-secondary, #ffffff); border: none; border-right: 1px solid var(--border-color, #cbd5e1); padding: 6px 12px; font-size: 12px; font-weight: 650; cursor: pointer; color: var(--text-primary, #0f172a); transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
    .tool-btn:last-child { border-right: none; }
    .tool-btn:hover, .tool-btn:focus-visible { background: var(--border-light, #f1f5f9); color: var(--primary-color, #4f46e5); outline: none; }
    .tool-btn.nav-arrow { padding: 8px 10px; }
    .today-btn { font-weight: 750; }
    .icon-svg, .dropdown-arrow-svg, .export-icon-svg, .recurrence-icon-svg, .month-recurrence-icon-svg, .delete-icon-svg, .plus-icon-svg { width: 16px; height: 16px; display: inline-block; vertical-align: middle; }
    .current-period-label { margin: 0; font-size: 16px; font-weight: 800; min-width: 180px; }
    .toolbar-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    
    /* Search Box styling */
    .search-box-container { display: flex; align-items: center; background: var(--bg-secondary, #ffffff); border: 1px solid var(--border-color, #cbd5e1); border-radius: 8px; padding: 5px 12px; min-width: 200px; gap: 8px; box-shadow: var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05)); }
    .search-icon { width: 15px; height: 15px; color: var(--text-secondary, #64748b); }
    .search-input { border: none; background: transparent; font-size: 12px; color: var(--text-primary, #0f172a); outline: none; width: 100%; font-family: inherit; }
    .search-input::placeholder { color: var(--text-secondary, #94a3b8); }
    
    /* Resource Select styling */
    .resource-filter-container { display: flex; align-items: center; background: var(--bg-secondary, #ffffff); border: 1px solid var(--border-color, #cbd5e1); border-radius: 8px; padding: 5px 10px; box-shadow: var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05)); }
    .resource-select { border: none; background: transparent; font-size: 12px; font-weight: 650; color: var(--text-primary, #0f172a); outline: none; cursor: pointer; font-family: inherit; }
    
    /* Export Dropdown styling */
    .export-dropdown-wrapper { position: relative; }
    .export-toggle-btn { display: flex; align-items: center; gap: 6px; font-weight: 650; border: 1px solid var(--border-color, #cbd5e1); border-radius: 8px; box-shadow: var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05)); }
    .dropdown-arrow-svg { width: 14px; height: 14px; opacity: 0.7; }
    .export-menu-dropdown { position: absolute; top: calc(100% + 4px); right: 0; background: var(--bg-secondary, #ffffff); border: 1px solid var(--border-color, #cbd5e1); border-radius: 8px; box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)); z-index: 100; min-width: 170px; display: flex; flex-direction: column; padding: 4px; overflow: hidden; animation: slideDown 0.15s ease-out; }
    .export-item { display: flex; align-items: center; gap: 10px; border: none; background: none; padding: 8px 12px; font-size: 12px; text-align: left; cursor: pointer; color: var(--text-primary, #334155); border-radius: 6px; font-family: inherit; font-weight: 600; transition: background 0.15s; }
    .export-item:hover { background: var(--border-light, #f1f5f9); color: var(--primary-color, #4f46e5); }
    .export-icon-svg { width: 14px; height: 14px; color: var(--text-secondary, #64748b); }

    /* View Switch Controls */
    .view-switch-controls { display: flex; border: 1px solid var(--border-color, #cbd5e1); border-radius: 8px; overflow: hidden; box-shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.05)); }
    .view-btn { background: var(--bg-secondary, #ffffff); border: none; border-right: 1px solid var(--border-color, #cbd5e1); padding: 6px 14px; font-size: 12px; font-weight: 650; color: var(--text-secondary, #475569); cursor: pointer; transition: all 0.2s; font-family: inherit; }
    .view-btn:last-child { border-right: none; }
    .view-btn.active { background: var(--primary-color, #4f46e5); color: #ffffff; }
    
    .scheduler-body { flex: 1; overflow: auto; background: var(--bg-secondary, #ffffff); display: flex; flex-direction: column; }
    .time-grid-container { display: flex; flex-direction: column; flex: 1; min-width: 600px; }
    .time-grid-header { display: flex; background: var(--border-light, #f8fafc); border-bottom: 1px solid var(--border-color, #cbd5e1); position: sticky; top: 0; z-index: 10; }
    .time-axis-header { width: 70px; flex-shrink: 0; border-right: 1px solid var(--border-color, #cbd5e1); }
    .columns-headers-wrap { flex: 1; display: flex; }
    .column-header-cell { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 10px 0; border-right: 1px solid var(--border-color, #e2e8f0); min-width: 120px; }
    .column-header-cell:last-child { border-right: none; }
    .column-header-cell.today { background: var(--primary-glow, rgba(79, 70, 229, 0.03)); }
    .column-header-cell.today .day-num { background: var(--primary-color, #4f46e5); color: #ffffff; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; margin-top: 2px; }
    .day-name { font-size: 11px; font-weight: 650; color: var(--text-secondary, #64748b); text-transform: uppercase; letter-spacing: 0.5px; }
    .day-num { font-size: 14px; margin-top: 4px; color: var(--text-primary, #0f172a); }

    /* Resource Header Styling */
    .resource-header-card { display: flex; align-items: center; gap: 10px; padding: 4px 12px; width: 100%; text-align: left; }
    .resource-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 2px solid var(--border-light, #e2e8f0); }
    .resource-initials { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 750; color: #ffffff; text-shadow: 0 1px 2px rgba(0,0,0,0.2); }
    .resource-info { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
    .resource-name { font-size: 13px; font-weight: 750; color: var(--text-primary, #0f172a); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .resource-desc { font-size: 10px; color: var(--text-secondary, #64748b); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    /* All-Day Events row styling */
    .all-day-row-container { display: flex; background: var(--border-light, #f8fafc); border-bottom: 1px solid var(--border-color, #cbd5e1); z-index: 8; position: relative; }
    .all-day-label-cell { width: 70px; flex-shrink: 0; border-right: 1px solid var(--border-color, #cbd5e1); font-size: 10px; font-weight: 750; color: var(--text-secondary, #64748b); display: flex; align-items: center; justify-content: flex-end; padding-right: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
    .all-day-columns-wrap { flex: 1; display: flex; min-height: 38px; padding: 4px 0; }
    .all-day-column-cell { flex: 1; display: flex; flex-direction: column; gap: 4px; padding: 0 4px; border-right: 1px solid var(--border-light, #e2e8f0); min-width: 120px; box-sizing: border-box; justify-content: center; }
    .all-day-column-cell:last-child { border-right: none; }
    .all-day-event-block { display: flex; align-items: center; gap: 6px; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer; border: 1px solid transparent; box-shadow: var(--shadow-sm); position: relative; overflow: hidden; min-height: 22px; transition: transform 0.15s; }
    .all-day-event-block:hover { transform: translateY(-1px); }
    .all-day-event-block.completed .all-day-event-title { text-decoration: line-through; opacity: 0.65; }
    .all-day-event-indicator { width: 4px; height: 12px; border-radius: 2px; background: currentColor; flex-shrink: 0; }
    .all-day-event-title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; min-width: 0; }
    .event-delete-btn.all-day-del { opacity: 0; position: absolute; right: 4px; top: 2px; width: 18px; height: 18px; }
    .all-day-event-block:hover .event-delete-btn.all-day-del { opacity: 1; }

    .time-grid-body { display: flex; flex: 1; position: relative; }
    .time-axis-labels { width: 70px; flex-shrink: 0; border-right: 1px solid var(--border-color, #cbd5e1); background: var(--border-light, #f8fafc); user-select: none; }
    .time-label { height: 60px; font-size: 11px; font-weight: 650; color: var(--text-secondary, #64748b); text-align: right; padding-right: 10px; margin-top: -6px; }
    .columns-body-wrap { flex: 1; display: flex; position: relative; }
    .hourly-grid-lines { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; }
    .grid-line { height: 60px; border-bottom: 1px solid var(--border-light, #e2e8f0); }
    
    .column-body-cell { flex: 1; border-right: 1px solid var(--border-light, #e2e8f0); position: relative; z-index: 2; min-width: 120px; }
    .column-body-cell:last-child { border-right: none; }
    .interactive-slots-overlay { position: absolute; inset: 0; display: flex; flex-direction: column; z-index: 1; }
    .slot-trigger { flex: 0 0 auto; cursor: cell; transition: background 0.15s; }
    .slot-trigger:hover { background: var(--primary-glow, rgba(79, 70, 229, 0.02)); }
    .slot-trigger.non-business-slot { background: var(--border-light, #f8fafc); opacity: 0.85; background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(148, 163, 184, 0.04) 10px, rgba(148, 163, 184, 0.04) 20px); }

    /* Task completion checkbox styling */
    .task-completion-checkbox {
      width: 14px;
      height: 14px;
      margin: 0;
      cursor: pointer;
      flex-shrink: 0;
      accent-color: var(--primary-color, #4f46e5);
      border-radius: 4px;
      border: 1px solid var(--border-color, #cbd5e1);
      outline: none;
      align-self: center;
      transition: accent-color 0.15s;
      z-index: 5;
    }
    .all-day-task-checkbox {
      width: 12px;
      height: 12px;
    }

    /* Live Current Time Indicator styling */
    .current-time-line { position: absolute; left: 0; right: 0; height: 2px; background: #ef4444; z-index: 10; pointer-events: none; }
    .line-dot { position: absolute; left: -4px; top: -3px; width: 8px; height: 8px; border-radius: 50%; background: #ef4444; box-shadow: 0 0 6px rgba(239, 68, 68, 0.8); animation: pulse-glow 2s infinite; }

    @keyframes pulse-glow {
      0% { transform: scale(1); box-shadow: 0 0 4px 0px rgba(239, 68, 68, 0.8); }
      50% { transform: scale(1.35); box-shadow: 0 0 12px 4px rgba(239, 68, 68, 0.45); }
      100% { transform: scale(1); box-shadow: 0 0 4px 0px rgba(239, 68, 68, 0.8); }
    }

    /* Drag Selection Preview styling */
    .drag-select-preview { position: absolute; left: 4px; right: 4px; border: 2px dashed var(--primary-color, #4f46e5); border-radius: 8px; background: rgba(79, 70, 229, 0.08); z-index: 5; pointer-events: none; display: flex; align-items: center; justify-content: center; box-sizing: border-box; }
    .preview-inner { display: flex; align-items: center; gap: 6px; color: var(--primary-color, #4f46e5); font-size: 11px; font-weight: 750; background: #ffffff; padding: 4px 10px; border-radius: 20px; box-shadow: var(--shadow-sm); border: 1px solid rgba(79, 70, 229, 0.2); }
    .plus-icon-svg { color: var(--primary-color, #4f46e5); width: 14px; height: 14px; }

    /* Event Cards styling */
    .scheduler-event-card { position: absolute; right: auto; border-radius: 8px; padding: 8px 10px; font-size: 12px; line-height: 1.4; cursor: grab; display: flex; gap: 8px; z-index: 3; box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.05)); transition: transform 0.2s, box-shadow 0.2s; overflow: hidden; border: 1px solid transparent; min-height: 28px; outline: none; }
    .scheduler-event-card:hover { transform: translateY(-1px); box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1)); z-index: 4; }
    .scheduler-event-card:focus-visible { border-color: var(--primary-color, #4f46e5); box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.25); }
    .scheduler-event-card.completed .event-title { text-decoration: line-through; opacity: 0.65; }
    .event-color-indicator { width: 3px; height: 100%; border-radius: 2px; flex-shrink: 0; background: currentColor; }
    .event-details { display: flex; flex-direction: column; gap: 2px; overflow: hidden; min-width: 0; flex: 1; }
    .event-header-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 4px; width: 100%; }
    .event-title { font-weight: 750; color: inherit; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .event-time { font-size: 10px; opacity: 0.82; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .recurrence-icon-svg { color: currentColor; opacity: 0.65; width: 13px; height: 13px; flex-shrink: 0; margin-top: 1px; }

    /* Card Delete Button */
    .event-delete-btn { position: absolute; top: 6px; right: 6px; border: none; background: rgba(255,255,255,0.75); border-radius: 4px; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--ngx-schedule-important-text, #ef4444); opacity: 0; transition: opacity 0.15s, background 0.15s; }
    .event-delete-btn:hover { background: #ffffff; color: #dc2626; transform: scale(1.05); }
    .scheduler-event-card:hover .event-delete-btn { opacity: 1; }
    .delete-icon-svg { width: 12px; height: 12px; }

    /* Resize Handles */
    .resize-handle { position: absolute; left: 0; right: 0; height: 8px; border: 0; background: transparent; cursor: ns-resize; display: flex; align-items: center; justify-content: center; z-index: 10; transition: background 0.15s; }
    .resize-handle::after { content: ''; width: 24px; height: 2px; background: rgba(0,0,0,0.15); border-radius: 1px; opacity: 0; transition: opacity 0.15s; }
    .ngx-scheduler-wrapper.dark .resize-handle::after { background: rgba(255,255,255,0.25); }
    .scheduler-event-card:hover .resize-handle::after { opacity: 1; }
    .resize-handle:hover { background: rgba(0, 0, 0, 0.05); }
    .ngx-scheduler-wrapper.dark .resize-handle:hover { background: rgba(255, 255, 255, 0.05); }
    .resize-start { top: 0; }
    .resize-end { bottom: 0; }

    /* Month Grid layout */
    .month-grid-container { display: flex; flex-direction: column; flex: 1; min-height: 500px; }
    .month-grid-header { display: flex; background: var(--border-light, #f8fafc); border-bottom: 1px solid var(--border-color, #cbd5e1); position: sticky; top: 0; z-index: 10; }
    .month-header-cell { flex: 1; text-align: center; padding: 10px 0; font-size: 11px; font-weight: 750; color: var(--text-secondary, #64748b); text-transform: uppercase; letter-spacing: 0.5px; border-right: 1px solid var(--border-color, #cbd5e1); }
    .month-header-cell:last-child { border-right: none; }
    .month-grid-body { display: grid; grid-template-columns: repeat(7, minmax(110px, 1fr)); grid-auto-rows: minmax(100px, 1fr); flex: 1; }
    .month-day-cell { border-right: 1px solid var(--border-light, #e2e8f0); border-bottom: 1px solid var(--border-light, #e2e8f0); padding: 6px; display: flex; flex-direction: column; gap: 6px; cursor: pointer; position: relative; transition: background 0.15s; }
    .month-day-cell:nth-child(7n) { border-right: none; }
    .month-day-cell:hover { background: var(--primary-glow, rgba(79, 70, 229, 0.01)); }
    .month-day-cell.today { background: var(--primary-glow, rgba(79, 70, 229, 0.02)); }
    .month-day-cell.today .month-day-number { background: var(--primary-color, #4f46e5); color: #ffffff; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; }
    .month-day-cell.other-month { opacity: 0.45; }
    .month-day-number { font-size: 11px; font-weight: 650; color: var(--text-secondary, #475569); width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; }
    
    .month-day-events-list { display: flex; flex-direction: column; gap: 4px; overflow-y: auto; max-height: 90px; }
    .month-event-item { font-size: 10px; font-weight: 650; padding: 2px 6px; border-radius: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; transition: transform 0.1s; display: flex; align-items: center; outline: none; }
    .month-event-item:hover { transform: scale(1.02); }
    .month-event-item:focus-visible { box-shadow: 0 0 0 2px var(--primary-color, #4f46e5); }
    .month-event-item.completed { text-decoration: line-through; opacity: 0.65; }
    .month-recurrence-icon-svg { color: currentColor; opacity: 0.8; width: 11px; height: 11px; margin-right: 3px; display: inline-block; flex-shrink: 0; }

    /* Month popover styles */
    .month-more-indicator { background: var(--primary-glow, rgba(79, 70, 229, 0.08)); color: var(--primary-color, #4f46e5); border: none; border-radius: 4px; font-size: 10px; font-weight: 700; padding: 3px 6px; cursor: pointer; text-align: left; transition: background 0.15s; width: 100%; outline: none; }
    .month-more-indicator:hover { background: rgba(79, 70, 229, 0.15); }
    .month-more-indicator:focus-visible { box-shadow: 0 0 0 2px var(--primary-color, #4f46e5); }
    .month-events-popover { position: absolute; top: 4px; left: 4px; right: 4px; background: var(--bg-secondary, #ffffff); border: 1px solid var(--border-color, #cbd5e1); border-radius: 8px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); z-index: 100; display: flex; flex-direction: column; padding: 8px; min-width: 180px; animation: popoverFadeIn 0.15s ease-out; }
    .popover-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; border-bottom: 1px solid var(--border-light, #e2e8f0); padding-bottom: 4px; }
    .popover-date { font-size: 11px; font-weight: 750; color: var(--text-secondary, #475569); }
    .popover-close { background: none; border: none; font-size: 16px; font-weight: 700; color: #94a3b8; cursor: pointer; line-height: 1; padding: 0 2px; }
    .popover-close:hover { color: #475569; }
    .popover-body { display: flex; flex-direction: column; gap: 4px; max-height: 200px; overflow-y: auto; }
    .popover-event-item { margin-bottom: 2px; }

    @keyframes popoverFadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }

    /* Theme Categories */
    .meeting { background-color: var(--ngx-schedule-meeting-bg, rgba(59, 130, 246, 0.07)); border-color: var(--ngx-schedule-meeting-border, rgba(59, 130, 246, 0.15)); color: var(--ngx-schedule-meeting-text, #2563eb); border-left: 4px solid #3b82f6 !important; }
    .task { background-color: var(--ngx-schedule-task-bg, rgba(16, 185, 129, 0.07)); border-color: var(--ngx-schedule-task-border, rgba(16, 185, 129, 0.15)); color: var(--ngx-schedule-task-text, #059669); border-left: 4px solid #10b981 !important; }
    .important { background-color: var(--ngx-schedule-important-bg, rgba(239, 68, 68, 0.07)); border-color: var(--ngx-schedule-important-border, rgba(239, 68, 68, 0.15)); color: var(--ngx-schedule-important-text, #dc2626); border-left: 4px solid #ef4444 !important; }
    .warning { background-color: var(--ngx-schedule-warning-bg, rgba(245, 158, 11, 0.07)); border-color: var(--ngx-schedule-warning-border, rgba(245, 158, 11, 0.15)); color: var(--ngx-schedule-warning-text, #d97706); border-left: 4px solid #f59e0b !important; }
    .milestone { background-color: var(--ngx-schedule-milestone-bg, rgba(139, 92, 246, 0.07)); border-color: var(--ngx-schedule-milestone-border, rgba(139, 92, 246, 0.15)); color: var(--ngx-schedule-milestone-text, #7c3aed); border-left: 4px solid #8b5cf6 !important; }
    .personal { background-color: var(--ngx-schedule-personal-bg, rgba(20, 184, 166, 0.07)); border-color: var(--ngx-schedule-personal-border, rgba(20, 184, 166, 0.15)); color: var(--ngx-schedule-personal-text, #0d9488); border-left: 4px solid #14b8a6 !important; }
    
    /* Dark Theme Support */
    .ngx-scheduler-wrapper.dark { border-color: #1f2937; background: #0f172a; color: #f8fafc; }
    .ngx-scheduler-wrapper.dark .scheduler-toolbar, .ngx-scheduler-wrapper.dark .time-grid-header, .ngx-scheduler-wrapper.dark .time-axis-labels, .ngx-scheduler-wrapper.dark .month-grid-header { background: #1e293b; border-color: #1f2937; }
    
    .ngx-scheduler-wrapper.dark .nav-buttons-group,
    .ngx-scheduler-wrapper.dark .search-box-container,
    .ngx-scheduler-wrapper.dark .resource-filter-container,
    .ngx-scheduler-wrapper.dark .export-menu-dropdown { background: #0f172a; border-color: #1f2937; }
    
    .ngx-scheduler-wrapper.dark .tool-btn, .ngx-scheduler-wrapper.dark .view-btn { background: #0f172a; border-color: #1f2937; color: #94a3b8; }
    .ngx-scheduler-wrapper.dark .view-btn.active { background: var(--primary-color, #6366f1); color: #ffffff; }
    .ngx-scheduler-wrapper.dark .grid-line, .ngx-scheduler-wrapper.dark .column-body-cell, .ngx-scheduler-wrapper.dark .month-day-cell { border-color: #1f2937; }
    
    .ngx-scheduler-wrapper.dark .search-input,
    .ngx-scheduler-wrapper.dark .resource-select { color: #f8fafc; }
    .ngx-scheduler-wrapper.dark .export-item { color: #cbd5e1; }
    .ngx-scheduler-wrapper.dark .export-item:hover { background: #1e293b; color: #6366f1; }
    .ngx-scheduler-wrapper.dark .resource-name { color: #f8fafc; }
    .ngx-scheduler-wrapper.dark .resource-desc { color: #94a3b8; }

    .ngx-scheduler-wrapper.dark .all-day-row-container { background: #1e293b; border-color: #1f2937; }
    .ngx-scheduler-wrapper.dark .all-day-column-cell { border-color: #1f2937; }
    .ngx-scheduler-wrapper.dark .all-day-event-block { border-color: transparent; }
    .ngx-scheduler-wrapper.dark .slot-trigger.non-business-slot { background: #0f172a; background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(31, 41, 55, 0.25) 10px, rgba(31, 41, 55, 0.25) 20px); }

    .ngx-scheduler-wrapper.dark .preview-inner { background: #0f172a; border-color: rgba(99, 102, 241, 0.4); color: #818cf8; }
    .ngx-scheduler-wrapper.dark .plus-icon-svg { color: #818cf8; }
    .ngx-scheduler-wrapper.dark .event-delete-btn { background: rgba(15, 23, 42, 0.6); color: #f87171; }
    .ngx-scheduler-wrapper.dark .event-delete-btn:hover { background: #1e293b; }
    .ngx-scheduler-wrapper.dark .task-completion-checkbox { border-color: #374151; background: #1f2937; }
    .ngx-scheduler-wrapper.dark .month-events-popover { background: #1e293b; border-color: #374151; }
    .ngx-scheduler-wrapper.dark .popover-date { color: #94a3b8; }
    .ngx-scheduler-wrapper.dark .popover-header { border-color: #374151; }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class SchedulerComponent implements OnInit, OnDestroy {
  i18n = inject(NGX_CORE_I18N);

  getViewModeLabel(mode: string): string {
    if (mode === 'day') return this.i18n.scheduler.day;
    if (mode === 'week') return this.i18n.scheduler.week;
    if (mode === 'month') return this.i18n.scheduler.month;
    return mode;
  }

  readonly hourHeight = 60;
  viewModes: ('day' | 'week' | 'month')[] = ['day', 'week', 'month'];

  // Component inputs
  events = input<SchedulerEvent[]>([]);
  currentDate = input<Date>(new Date());
  viewMode = input<'day' | 'week' | 'month'>('week');
  theme = input<'light' | 'dark'>('light');
  businessHoursStart = input<number>(8);
  businessHoursEnd = input<number>(20);
  weekStartsOn = input<0 | 1 | 2 | 3 | 4 | 5 | 6>(0);
  timeZone = input<string | undefined>(undefined);
  slotMinutes = input<number>(60);

  // New Enterprise feature inputs
  resources = input<SchedulerResource[]>([]);
  enableDragToCreate = input<boolean>(true);
  showSearch = input<boolean>(true);
  showWorkHoursOnly = input<boolean>(true);

  // Component outputs
  eventClick = output<SchedulerEvent>();
  slotClick = output<SchedulerSlotClickEvent>();
  eventTimeChange = output<SchedulerEventChangeEvent>();
  slotRangeSelect = output<SchedulerSlotRangeSelectEvent>();
  eventDelete = output<SchedulerEvent>();
  currentDateChange = output<Date>();

  // State Management
  activeDate = signal<Date>(new Date());
  activeMode = signal<'day' | 'week' | 'month'>('week');
  selectedResourceId = signal<string | null>(null);
  searchQuery = signal<string>('');
  dragSelectStart = signal<{ date: Date; hour: number; minute: number; resourceId?: string } | null>(null);
  dragSelectCurrent = signal<{ date: Date; hour: number; minute: number; resourceId?: string } | null>(null);
  showExportDropdown = signal<boolean>(false);
  activeMonthPopoverDate = signal<Date | null>(null);

  eventTemplate = contentChild(NgxSchedulerEventTemplateDirective);

  openMonthPopover(event: MouseEvent, date: Date): void {
    event.stopPropagation();
    this.activeMonthPopoverDate.set(date);
  }

  closeMonthPopover(event: MouseEvent): void {
    event.stopPropagation();
    this.activeMonthPopoverDate.set(null);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    const activeEl = document.activeElement;
    if (activeEl) {
      const tagName = activeEl.tagName.toLowerCase();
      if (tagName === 'input' || tagName === 'textarea' || tagName === 'select' || activeEl.getAttribute('contenteditable') === 'true') {
        return;
      }
    }

    switch (event.key.toLowerCase()) {
      case 't':
        this.goToToday();
        event.preventDefault();
        break;
      case 'd':
        this.activeMode.set('day');
        event.preventDefault();
        break;
      case 'w':
        this.activeMode.set('week');
        event.preventDefault();
        break;
      case 'm':
        this.activeMode.set('month');
        event.preventDefault();
        break;
      case 'arrowleft':
        this.navigate(-1);
        event.preventDefault();
        break;
      case 'arrowright':
        this.navigate(1);
        event.preventDefault();
        break;
    }
  }

  // Live Current-Time Indicator State
  now = signal<Date>(new Date());
  private timeIntervalId?: any;

  private activeDragEvent = signal<ResolvedSchedulerEvent | null>(null);
  private resizeState: ResizeState | null = null;

  constructor() {
    effect(() => {
      this.activeDate.set(this.currentDate());
    }, { allowSignalWrites: true });

    effect(() => {
      this.activeMode.set(this.viewMode());
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.timeIntervalId = setInterval(() => {
        this.now.set(new Date());
      }, 30000);
    }
  }

  ngOnDestroy() {
    if (this.timeIntervalId) {
      clearInterval(this.timeIntervalId);
    }
  }

  // Filter events based on keyword and resource selector
  filteredEvents = computed(() => {
    let list = this.events();
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      list = list.filter(evt =>
        evt.title.toLowerCase().includes(query) ||
        (evt.description && evt.description.toLowerCase().includes(query)) ||
        (evt.category && evt.category.toLowerCase().includes(query))
      );
    }

    const selectedRes = this.selectedResourceId();
    const mode = this.activeMode();
    if (selectedRes && mode !== 'day') {
      list = list.filter(evt => evt.resourceId === selectedRes);
    }

    return list;
  });

  hasAllDayEvents = computed(() => {
    return this.filteredEvents().some(evt => evt.isAllDay === true);
  });

  currentTimeTop = computed(() => {
    const currentTime = this.now();
    const startHour = this.showWorkHoursOnly() ? this.normalizedStartHour() : 0;
    const endHour = this.showWorkHoursOnly() ? this.normalizedEndHour() : 24;
    const hour = currentTime.getHours() + currentTime.getMinutes() / 60;
    
    if (hour < startHour || hour > endHour) return null;
    const pct = ((hour - startHour) / (endHour - startHour)) * 100;
    return pct;
  });

  hours = computed(() => {
    const start = this.showWorkHoursOnly() ? this.normalizedStartHour() : 0;
    const end = this.showWorkHoursOnly() ? this.normalizedEndHour() : 24;
    const list: number[] = [];
    for (let i = start; i < end; i++) list.push(i);
    return list;
  });

  timeSlots = computed<TimeSlot[]>(() => {
    const slots: TimeSlot[] = [];
    const minutes = this.normalizedSlotMinutes();
    for (const hour of this.hours()) {
      for (let minute = 0; minute < 60; minute += minutes) {
        slots.push({ hour, minute, key: `${hour}:${minute}` });
      }
    }
    return slots;
  });

  activeColumns = computed<{ date: Date; resource?: SchedulerResource }[]>(() => {
    const mode = this.activeMode();
    const date = this.activeDate();
    const resList = this.resources();

    if (mode === 'day') {
      if (resList.length > 0) {
        return resList.map(res => ({ date, resource: res }));
      }
      return [{ date }];
    }
    if (mode === 'week') {
      const days = this.getWeekDays(this.getStartOfWeek(date));
      return days.map(d => ({ date: d }));
    }
    const monthDays = this.getMonthDays(date);
    return monthDays.map(d => ({ date: d }));
  });

  weekDayLabels = computed(() => {
    const base = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const start = this.weekStartsOn();
    return [...base.slice(start), ...base.slice(0, start)];
  });

  periodLabel = computed(() => {
    const mode = this.activeMode();
    const date = this.activeDate();

    if (mode === 'day') {
      return this.formatDate(date, { month: 'long', day: 'numeric', year: 'numeric' });
    }

    if (mode === 'week') {
      const cols = this.activeColumns();
      const start = cols[0].date;
      const end = cols[6].date;
      if (start.getMonth() === end.getMonth()) {
        return `${this.formatDate(start, { month: 'long' })} ${this.formatDate(start, { year: 'numeric' })}`;
      }
      return `${this.formatDate(start, { month: 'short' })} - ${this.formatDate(end, { month: 'short', year: 'numeric' })}`;
    }

    return this.formatDate(date, { month: 'long', year: 'numeric' });
  });

  slotHeight(): number {
    return this.hourHeight * (this.normalizedSlotMinutes() / 60);
  }

  navigate(direction: number): void {
    const mode = this.activeMode();
    const current = new Date(this.activeDate());
    if (mode === 'day') current.setDate(current.getDate() + direction);
    else if (mode === 'week') current.setDate(current.getDate() + direction * 7);
    else current.setMonth(current.getMonth() + direction);
    this.activeDate.set(current);
    this.currentDateChange.emit(current);
  }

  goToToday(): void {
    const today = new Date();
    this.activeDate.set(today);
    this.currentDateChange.emit(today);
  }

  getEventsForDate(date: Date): ResolvedSchedulerEvent[] {
    return this.filteredEvents()
      .flatMap(event => this.resolveEventForDate(event, date))
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }

  getEventsForColumn(col: { date: Date; resource?: SchedulerResource }): ResolvedSchedulerEvent[] {
    return this.filteredEvents()
      .filter(evt => !evt.isAllDay)
      .flatMap(event => this.resolveEventForDate(event, col.date))
      .filter(resolved => {
        if (col.resource) {
          return resolved.event.resourceId === col.resource.id;
        }
        return true;
      })
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }

  getAllDayEventsForColumn(col: { date: Date; resource?: SchedulerResource }): ResolvedSchedulerEvent[] {
    return this.filteredEvents()
      .filter(evt => evt.isAllDay === true)
      .flatMap(event => this.resolveEventForDate(event, col.date))
      .filter(resolved => {
        if (col.resource) {
          return resolved.event.resourceId === col.resource.id;
        }
        return true;
      })
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }

  getEventLayoutsForColumn(col: { date: Date; resource?: SchedulerResource }): SchedulerEventLayout[] {
    const events = this.getEventsForColumn(col);
    const groups: ResolvedSchedulerEvent[][] = [];
    let group: ResolvedSchedulerEvent[] = [];
    let groupEnd = 0;

    for (const event of events) {
      if (!group.length || event.start.getTime() < groupEnd) {
        group.push(event);
        groupEnd = Math.max(groupEnd, event.end.getTime());
      } else {
        groups.push(group);
        group = [event];
        groupEnd = event.end.getTime();
      }
    }
    if (group.length) groups.push(group);

    return groups.flatMap(eventsGroup => this.layoutOverlapGroup(eventsGroup));
  }

  clickEvent(event: SchedulerEvent): void {
    this.eventClick.emit(event);
  }

  clickSlot(date: Date, hour: number, minute = 0, resourceId?: string): void {
    const targetDate = new Date(date);
    targetDate.setHours(hour, minute, 0, 0);
    this.slotClick.emit({ date: targetDate, hour, minute, resourceId });
  }

  deleteEvent(event: SchedulerEvent, clickEvent: MouseEvent): void {
    clickEvent.stopPropagation();
    this.eventDelete.emit(event);
  }

  toggleTaskCompletion(event: SchedulerEvent, clickEvent: Event): void {
    const isChecked = (clickEvent.target as HTMLInputElement).checked;
    this.eventTimeChange.emit({
      event: { ...event, completed: isChecked },
      start: event.start,
      end: event.end
    });
  }

  getEventStyles(event: SchedulerEvent): { [key: string]: string } {
    const styles: { [key: string]: string } = {};
    if (event.color) {
      const color = event.color;
      if (color.startsWith('#')) {
        styles['background-color'] = `${color}12`;
        styles['border-color'] = `${color}33`;
        styles['color'] = color;
        styles['border-left'] = `4px solid ${color}`;
      } else {
        styles['background-color'] = color;
        styles['color'] = '#ffffff';
      }
    }
    return styles;
  }

  onSearchInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.searchQuery.set(val);
  }

  onResourceFilterChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedResourceId.set(val || null);
  }

  isNonBusinessHour(hour: number): boolean {
    return hour < this.normalizedStartHour() || hour >= this.normalizedEndHour();
  }

  // Pointer drag-to-create handlers
  onSlotPointerDown(event: PointerEvent, date: Date, hour: number, minute: number, resourceId?: string): void {
    if (!this.enableDragToCreate() || event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest('.scheduler-event-card')) return;

    event.preventDefault();
    (event.target as HTMLElement).setPointerCapture(event.pointerId);

    this.dragSelectStart.set({ date, hour, minute, resourceId });
    this.dragSelectCurrent.set({ date, hour, minute, resourceId });
  }

  onSlotPointerEnter(event: PointerEvent, date: Date, hour: number, minute: number, resourceId?: string): void {
    const start = this.dragSelectStart();
    if (!start) return;

    if (this.dateKey(start.date) === this.dateKey(date) && start.resourceId === resourceId) {
      this.dragSelectCurrent.set({ date, hour, minute, resourceId });
    }
  }

  @HostListener('window:pointerup', ['$event'])
  onWindowPointerUp(event: PointerEvent): void {
    const start = this.dragSelectStart();
    const current = this.dragSelectCurrent();
    if (start && current) {
      try {
        const capturedEl = document.querySelector(':focus') || event.target as HTMLElement;
        if (capturedEl && 'releasePointerCapture' in capturedEl) {
          (capturedEl as any).releasePointerCapture(event.pointerId);
        }
      } catch (e) {}

      const colDate = new Date(start.date);
      const startMinutes = start.hour * 60 + start.minute;
      const currentMinutes = current.hour * 60 + current.minute;
      
      const minMinutes = Math.min(startMinutes, currentMinutes);
      const maxMinutes = Math.max(startMinutes, currentMinutes) + this.normalizedSlotMinutes();

      const startDate = new Date(colDate);
      startDate.setHours(Math.floor(minMinutes / 60), minMinutes % 60, 0, 0);

      const endDate = new Date(colDate);
      endDate.setHours(Math.floor(maxMinutes / 60), maxMinutes % 60, 0, 0);

      this.slotRangeSelect.emit({
        start: startDate,
        end: endDate,
        resourceId: start.resourceId
      });

      this.dragSelectStart.set(null);
      this.dragSelectCurrent.set(null);
    }
  }

  getDragSelectionLayout(col: { date: Date; resource?: SchedulerResource }): { top: number; height: number } | null {
    const start = this.dragSelectStart();
    const current = this.dragSelectCurrent();
    if (!start || !current) return null;

    if (this.dateKey(start.date) !== this.dateKey(col.date) || start.resourceId !== col.resource?.id) {
      return null;
    }

    const startMinutes = start.hour * 60 + start.minute;
    const currentMinutes = current.hour * 60 + current.minute;

    const minMinutes = Math.min(startMinutes, currentMinutes);
    const maxMinutes = Math.max(startMinutes, currentMinutes) + this.normalizedSlotMinutes();

    const startRange = this.showWorkHoursOnly() ? this.normalizedStartHour() : 0;
    const endRange = this.showWorkHoursOnly() ? this.normalizedEndHour() : 24;
    const totalHours = endRange - startRange;

    const startHourFraction = minMinutes / 60;
    const endHourFraction = maxMinutes / 60;

    const top = ((startHourFraction - startRange) / totalHours) * 100;
    const height = ((endHourFraction - startHourFraction) / totalHours) * 100;

    return {
      top: Math.max(0, Math.min(100, top)),
      height: Math.max(2, Math.min(100 - top, height))
    };
  }

  onSlotDragOver(event: DragEvent): void {
    if (this.activeDragEvent()) event.preventDefault();
  }

  onEventDragStart(event: DragEvent, layout: SchedulerEventLayout): void {
    this.activeDragEvent.set(layout);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', layout.event.id);
    }
  }

  onEventDragEnd(): void {
    this.activeDragEvent.set(null);
  }

  onSlotDrop(event: DragEvent, date: Date, hour: number, minute = 0, resourceId?: string): void {
    event.preventDefault();
    const dragged = this.activeDragEvent();
    if (!dragged) return;

    const duration = dragged.end.getTime() - dragged.start.getTime();
    const start = new Date(date);
    start.setHours(hour, minute, 0, 0);
    const end = new Date(start.getTime() + duration);

    const updatedEvent = { ...dragged.event };
    if (resourceId !== undefined) {
      updatedEvent.resourceId = resourceId;
    }

    this.eventTimeChange.emit({
      event: updatedEvent,
      start,
      end,
      occurrenceStart: dragged.start,
      occurrenceEnd: dragged.end,
    });
    this.activeDragEvent.set(null);
  }

  startResize(event: PointerEvent, layout: SchedulerEventLayout, edge: 'start' | 'end'): void {
    event.preventDefault();
    event.stopPropagation();
    this.resizeState = {
      event: layout.event,
      edge,
      start: layout.start,
      end: layout.end,
      originY: event.clientY,
    };
  }

  @HostListener('window:pointerup', ['$event'])
  finishResize(event: PointerEvent): void {
    if (!this.resizeState) return;
    const state = this.resizeState;
    const deltaSlots = Math.round((event.clientY - state.originY) / this.slotHeight());
    const deltaMs = deltaSlots * this.normalizedSlotMinutes() * 60 * 1000;
    const minDuration = this.normalizedSlotMinutes() * 60 * 1000;
    let start = new Date(state.start);
    let end = new Date(state.end);

    if (state.edge === 'start') {
      start = new Date(Math.min(state.start.getTime() + deltaMs, state.end.getTime() - minDuration));
    } else {
      end = new Date(Math.max(state.end.getTime() + deltaMs, state.start.getTime() + minDuration));
    }

    this.eventTimeChange.emit({
      event: state.event,
      start,
      end,
      occurrenceStart: state.start,
      occurrenceEnd: state.end,
    });
    this.resizeState = null;
  }

  @HostListener('window:pointercancel')
  cancelResize(): void {
    this.resizeState = null;
  }

  isToday(date: Date): boolean {
    return this.isSameDate(date, new Date());
  }

  isOtherMonth(date: Date): boolean {
    return date.getMonth() !== this.activeDate().getMonth();
  }

  formatHour(hour: number): string {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hr = hour % 12 === 0 ? 12 : hour % 12;
    return `${hr} ${ampm}`;
  }

  formatDate(date: Date, options: Intl.DateTimeFormatOptions): string {
    try {
      return new Intl.DateTimeFormat('en-US', { ...options, timeZone: this.timeZone() }).format(date);
    } catch {
      return new Intl.DateTimeFormat('en-US', options).format(date);
    }
  }

  formatEventTime(start: Date, end: Date): string {
    return `${this.formatDate(start, { hour: 'numeric', minute: '2-digit' })} - ${this.formatDate(end, { hour: 'numeric', minute: '2-digit' })}`;
  }

  eventTitle(layout: SchedulerEventLayout): string {
    const description = layout.event.description ? ` (${layout.event.description})` : '';
    return `${layout.event.title}${description}`;
  }

  dateKey(date: Date): string {
    if (!this.timeZone()) {
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    }

    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: this.timeZone(),
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).formatToParts(date);
      const get = (type: string) => parts.find(part => part.type === type)?.value ?? '';
      return `${get('year')}-${get('month')}-${get('day')}`;
    } catch {
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    }
  }

  getInitials(name: string): string {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getResourceName(resourceId: string): string {
    const res = this.resources().find(r => r.id === resourceId);
    return res ? res.name : '';
  }

  // Export methods
  exportToICS(): void {
    const evts = this.filteredEvents();
    let ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Antigravity//NGX Core Components Scheduler//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];

    for (const e of evts) {
      const pad = (num: number) => String(num).padStart(2, '0');
      const formatICSDate = (d: Date) => {
        return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
      };

      ics.push('BEGIN:VEVENT');
      ics.push(`UID:${e.id}`);
      ics.push(`DTSTAMP:${formatICSDate(new Date())}`);
      ics.push(`DTSTART:${formatICSDate(e.start)}`);
      ics.push(`DTEND:${formatICSDate(e.end)}`);
      ics.push(`SUMMARY:${e.title.replace(/[,;]/g, '\\$&')}`);
      if (e.description) {
        ics.push(`DESCRIPTION:${e.description.replace(/[,;]/g, '\\$&')}`);
      }
      if (e.category) {
        ics.push(`CATEGORIES:${e.category.toUpperCase()}`);
      }
      ics.push('END:VEVENT');
    }

    ics.push('END:VCALENDAR');
    this.downloadFile(ics.join('\r\n'), 'calendar.ics', 'text/calendar');
  }

  exportToJSON(): void {
    const evts = this.filteredEvents();
    const data = JSON.stringify(evts, null, 2);
    this.downloadFile(data, 'calendar_events.json', 'application/json');
  }

  exportToCSV(): void {
    const evts = this.filteredEvents();
    const headers = ['ID', 'Title', 'Description', 'Start', 'End', 'Category', 'Resource ID', 'All Day'];
    const rows = evts.map(e => [
      e.id,
      `"${e.title.replace(/"/g, '""')}"`,
      `"${(e.description || '').replace(/"/g, '""')}"`,
      e.start.toISOString(),
      e.end.toISOString(),
      e.category || '',
      e.resourceId || '',
      e.isAllDay ? 'TRUE' : 'FALSE'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    this.downloadFile(csvContent, 'calendar_events.csv', 'text/csv');
  }

  private downloadFile(content: string, filename: string, contentType: string): void {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private layoutOverlapGroup(events: ResolvedSchedulerEvent[]): SchedulerEventLayout[] {
    const columnEnds: Date[] = [];
    const placements = events.map(event => {
      let column = columnEnds.findIndex(end => event.start >= end);
      if (column === -1) {
        column = columnEnds.length;
        columnEnds.push(event.end);
      } else {
        columnEnds[column] = event.end;
      }
      return { event, column };
    });

    const columnCount = Math.max(1, columnEnds.length);
    return placements.map(({ event, column }) => ({
      ...event,
      top: this.getEventTop(event.start),
      height: this.getEventHeight(event.start, event.end),
      left: column * (100 / columnCount) + 1,
      width: Math.max(8, 100 / columnCount - 2),
    }));
  }

  private resolveEventForDate(event: SchedulerEvent, date: Date): ResolvedSchedulerEvent[] {
    if (event.recurrence) {
      const occurrence = this.resolveRecurringOccurrence(event, date);
      return occurrence ? [occurrence] : [];
    }

    const dayStart = this.startOfDay(date);
    const dayEnd = this.endOfDay(date);
    if (!this.rangesOverlap(event.start, event.end, dayStart, dayEnd)) return [];

    return [{
      id: `${event.id}-${this.dateKey(date)}`,
      event,
      start: new Date(Math.max(event.start.getTime(), dayStart.getTime())),
      end: new Date(Math.min(event.end.getTime(), dayEnd.getTime())),
    }];
  }

  private resolveRecurringOccurrence(event: SchedulerEvent, date: Date): ResolvedSchedulerEvent | null {
    const recurrence = event.recurrence;
    if (!recurrence) return null;

    const startDay = this.startOfDay(event.start);
    const targetDay = this.startOfDay(date);
    if (targetDay < startDay) return null;
    if (recurrence.until && targetDay > this.startOfDay(recurrence.until)) return null;

    const interval = Math.max(1, recurrence.interval ?? 1);
    const diffDays = Math.floor((targetDay.getTime() - startDay.getTime()) / 86400000);
    let occurrenceIndex = 0;
    let occurs = false;

    if (recurrence.frequency === 'daily') {
      occurs = diffDays % interval === 0;
      occurrenceIndex = Math.floor(diffDays / interval);
    } else if (recurrence.frequency === 'weekly') {
      const days = recurrence.daysOfWeek?.length ? recurrence.daysOfWeek : [event.start.getDay()];
      const diffWeeks = Math.floor(diffDays / 7);
      occurs = diffWeeks % interval === 0 && days.includes(targetDay.getDay());
      occurrenceIndex = diffWeeks;
    } else {
      const diffMonths = (targetDay.getFullYear() - startDay.getFullYear()) * 12 + targetDay.getMonth() - startDay.getMonth();
      occurs = diffMonths % interval === 0 && targetDay.getDate() === startDay.getDate();
      occurrenceIndex = diffMonths;
    }

    if (!occurs || (recurrence.count && occurrenceIndex >= recurrence.count)) return null;

    const duration = event.end.getTime() - event.start.getTime();
    const start = new Date(targetDay);
    start.setHours(event.start.getHours(), event.start.getMinutes(), event.start.getSeconds(), event.start.getMilliseconds());
    const end = new Date(start.getTime() + duration);

    return {
      id: `${event.id}-r-${this.dateKey(targetDay)}`,
      event,
      start,
      end,
    };
  }

  private getEventTop(start: Date): number {
    const startHour = start.getHours() + start.getMinutes() / 60;
    const startRange = this.showWorkHoursOnly() ? this.normalizedStartHour() : 0;
    const endRange = this.showWorkHoursOnly() ? this.normalizedEndHour() : 24;
    const totalHours = endRange - startRange;
    const pct = ((startHour - startRange) / totalHours) * 100;
    return Math.max(0, Math.min(100, pct));
  }

  private getEventHeight(start: Date, end: Date): number {
    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;
    const startRange = this.showWorkHoursOnly() ? this.normalizedStartHour() : 0;
    const endRange = this.showWorkHoursOnly() ? this.normalizedEndHour() : 24;
    const totalHours = endRange - startRange;
    const pct = ((endHour - startHour) / totalHours) * 100;
    return Math.max(8, Math.min(100 - this.getEventTop(start), pct));
  }

  private getStartOfWeek(date: Date): Date {
    const res = new Date(date);
    const day = res.getDay();
    const diff = (day - this.weekStartsOn() + 7) % 7;
    res.setDate(res.getDate() - diff);
    res.setHours(0, 0, 0, 0);
    return res;
  }

  private getWeekDays(start: Date): Date[] {
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      return day;
    });
  }

  private getMonthDays(date: Date): Date[] {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const startOfWeek = this.getStartOfWeek(firstDay);
    return Array.from({ length: 42 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });
  }

  protected isSameDate(d1: Date, d2: Date): boolean {
    return this.dateKey(d1) === this.dateKey(d2);
  }

  private startOfDay(date: Date): Date {
    const next = new Date(date);
    next.setHours(0, 0, 0, 0);
    return next;
  }

  private endOfDay(date: Date): Date {
    const next = new Date(date);
    next.setHours(23, 59, 59, 999);
    return next;
  }

  private rangesOverlap(start: Date, end: Date, rangeStart: Date, rangeEnd: Date): boolean {
    return start <= rangeEnd && end >= rangeStart;
  }

  private normalizedStartHour(): number {
    return Math.max(0, Math.min(23, Math.floor(this.businessHoursStart())));
  }

  private normalizedEndHour(): number {
    return Math.max(this.normalizedStartHour() + 1, Math.min(24, Math.ceil(this.businessHoursEnd())));
  }

  private normalizedSlotMinutes(): number {
    const minutes = Math.floor(this.slotMinutes());
    return [5, 10, 15, 20, 30, 60].includes(minutes) ? minutes : 60;
  }
}
