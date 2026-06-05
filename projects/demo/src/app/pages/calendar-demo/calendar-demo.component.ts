import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarComponent, CalendarEvent } from 'ngx-core-components';

interface ApiRow { name: string; type: string; default: string; description: string; }

@Component({
  selector: 'app-calendar-demo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, CalendarComponent],
  template: `
    <div class="demo-page">
      <!-- Page Header -->
      <div class="page-header">
        <div class="page-header-text">
          <h1>📅 Interactive Calendar</h1>
          <p>A premium grid-based monthly calendar component. Supports event tags, day cell content projection, dark mode styling, and accessible arrow-keys keyboard navigation.</p>
        </div>
        <div class="header-badges">
          <span class="badge badge-teal">Signals-based</span>
          <span class="badge badge-teal">Day Template</span>
          <span class="badge badge-teal">A11y Grid</span>
        </div>
      </div>

      <!-- TAB NAV -->
      <div class="tab-nav">
        @for (tab of tabs; track tab) {
          <button class="tab-btn" [class.active]="activeTab() === tab" (click)="activeTab.set(tab)">{{ tab }}</button>
        }
      </div>

      <!-- ===== DEMO ===== -->
      @if (activeTab() === 'Demo') {
        <div class="tab-content">
          <!-- Interactive Calendar Section -->
          <section class="demo-section">
            <h2>Interactive Calendar View</h2>
            <p class="section-desc">Click day cells to select a date. Use Arrow Keys to navigate, and Enter or Space to select.</p>
            
            <div class="interactive-box">
              <!-- Controls Panel -->
              <div class="controls-panel">
                <div class="control-group check-group">
                  <label>
                    <input type="checkbox" [(ngModel)]="readonlyMode" /> Readonly Mode
                  </label>
                </div>

                <div class="control-group">
                  <button class="action-btn secondary" (click)="clearSelection()">Clear Selection</button>
                  <button class="action-btn" (click)="addRandomEvent()">Add Random Event</button>
                </div>

                <div class="selection-display">
                  Selected Date:<br>
                  <strong>{{ selectedDate() ? (selectedDate() | date:'fullDate') : 'No Date Selected' }}</strong>
                </div>

                <!-- Event Log Stream -->
                <div class="event-logs">
                  <h4>Event Stream</h4>
                  <div class="log-lines">
                    @for (log of eventLogs(); track $index) {
                      <div class="log-line">{{ log }}</div>
                    }
                  </div>
                </div>
              </div>

              <!-- Calendar Container -->
              <div class="calendar-display-panel">
                <ngx-calendar
                  [value]="selectedDate()"
                  [events]="eventsList()"
                  [readonly]="readonlyMode"
                  (dateSelect)="onDateSelect($event)"
                  (monthChange)="onMonthChange($event)"
                ></ngx-calendar>
              </div>
            </div>
          </section>

          <!-- Custom Cell Template Showcase -->
          <section class="demo-section">
            <h2>Custom Cell Content Projection</h2>
            <p class="section-desc">Project a custom day cell template with icons, badges, or custom event indicator shapes.</p>
            
            <div class="template-showcase-box">
              <ngx-calendar
                [events]="eventsList()"
                [readonly]="true"
              >
                <!-- Project template using custom template syntax -->
                <ng-template #dayTemplate let-date let-events="events">
                  <div class="custom-cell-content">
                    <span class="custom-day-num">{{ date.getDate() }}</span>
                    @if (events.length > 0) {
                      <div class="custom-dots">
                        @for (event of events.slice(0, 4); track event.title) {
                          <span 
                            class="custom-dot" 
                            [style.background]="event.color || '#4f46e5'"
                            [attr.title]="event.title"
                          ></span>
                        }
                      </div>
                    }
                  </div>
                </ng-template>
              </ngx-calendar>
            </div>
          </section>

          <div class="section-label">How to Use</div>
          <pre class="code-block">{{ howToCode }}</pre>
        </div>
      }

      <!-- ===== API REFERENCE ===== -->
      @if (activeTab() === 'API Reference') {
        <div class="tab-content">
          <div class="section-label">Calendar Component (ngx-calendar)</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input / Output / Model</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of calendarApi; track row.name) {
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
    .demo-page { padding: 32px 40px; max-width: 1200px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: 28px; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; padding-bottom: 24px; border-bottom: 2px solid rgba(230, 230, 245, 0.6); }
    .page-header-text h1 { margin: 0 0 8px; font-size: 28px; font-weight: 900; color: #1a1a2e; letter-spacing: -0.5px; }
    .page-header-text p { margin: 0; font-size: 14px; color: #6c757d; line-height: 1.7; max-width: 600px; }
    .header-badges { display: flex; gap: 10px; flex-shrink: 0; flex-wrap: wrap; }
    .badge { font-size: 11px; font-weight: 700; padding: 6px 12px; border-radius: 16px; transition: all 0.2s ease; }
    .badge-teal { background: #e0f2fe; color: #0369a1; border: 1px solid rgba(3, 105, 161, 0.1); }
    
    .tab-nav { display: flex; gap: 0; border-bottom: 2px solid #e9ecef; overflow-x: auto; padding-bottom: 0; }
    .tab-btn { padding: 12px 20px; background: none; border: none; font-size: 13px; font-weight: 500; color: #6c757d; cursor: pointer; border-bottom: 3px solid transparent; margin-bottom: -2px; font-family: inherit; transition: all 0.2s ease; white-space: nowrap; }
    .tab-btn:hover { color: #495057; background: rgba(26, 115, 232, 0.05); }
    .tab-btn.active { color: #1a73e8; border-bottom-color: #1a73e8; font-weight: 600; background: rgba(26, 115, 232, 0.04); }
    
    .tab-content { display: flex; flex-direction: column; gap: 20px; }
    .demo-section { margin-bottom: 20px; }
    .demo-section h2 { font-size: 17px; font-weight: 700; color: #0f172a; margin: 0 0 8px; }
    .section-desc { font-size: 13px; color: #64748b; margin: 0 0 16px; }
    
    /* ── Interactive demo ── */
    .interactive-box {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 24px;
      background: #f8fafc;
      padding: 24px;
      border-radius: 16px;
      border: 1px solid rgba(0, 0, 0, 0.04);
    }
    
    :host-context(body.dark) .interactive-box,
    :host-context(.dark) .interactive-box,
    :host-context(.dark-theme) .interactive-box {
      background: #111827;
      border-color: rgba(255, 255, 255, 0.04);
    }

    .controls-panel {
      display: flex;
      flex-direction: column;
      gap: 16px;
      background: #ffffff;
      padding: 16px;
      border-radius: 12px;
      border: 1px solid rgba(0, 0, 0, 0.05);
    }

    :host-context(body.dark) .controls-panel,
    :host-context(.dark) .controls-panel,
    :host-context(.dark-theme) .controls-panel {
      background: #1f2937;
      border-color: rgba(255, 255, 255, 0.05);
    }

    .control-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .check-group label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
    }

    .action-btn {
      background: #4f46e5;
      color: white;
      border: none;
      padding: 8px 12px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      transition: opacity 0.2s;
      margin-bottom: 6px;
    }

    .action-btn:hover {
      opacity: 0.9;
    }

    .action-btn.secondary {
      background: transparent;
      border: 1px solid #cbd5e1;
      color: #334155;
    }
    
    :host-context(body.dark) .action-btn.secondary,
    :host-context(.dark) .action-btn.secondary,
    :host-context(.dark-theme) .action-btn.secondary {
      border-color: #475569;
      color: #e2e8f0;
    }

    .action-btn.secondary:hover {
      background: rgba(0,0,0,0.02);
    }

    .selection-display {
      font-size: 13px;
      padding: 12px;
      background: #f1f5f9;
      border-radius: 8px;
      border-left: 3px solid #4f46e5;
    }

    :host-context(body.dark) .selection-display,
    :host-context(.dark) .selection-display,
    :host-context(.dark-theme) .selection-display {
      background: #374151;
      border-left-color: #818cf8;
    }

    .calendar-display-panel {
      display: flex;
      flex-direction: column;
    }

    .event-logs {
      width: 100%;
      background: #0f172a;
      border-radius: 12px;
      padding: 14px;
      color: #38bdf8;
      font-family: monospace;
      font-size: 11px;
    }

    .event-logs h4 {
      margin: 0 0 8px 0;
      font-size: 12px;
      color: #94a3b8;
      border-bottom: 1px solid #334155;
      padding-bottom: 4px;
    }

    .log-lines {
      height: 110px;
      overflow-y: auto;
      display: flex;
      flex-direction: column-reverse;
      gap: 4px;
    }

    .log-line {
      white-space: pre-wrap;
    }

    /* ── Custom Template showcase ── */
    .template-showcase-box {
      background: #f8fafc;
      padding: 24px;
      border-radius: 16px;
      border: 1px solid rgba(0, 0, 0, 0.04);
    }

    :host-context(body.dark) .template-showcase-box,
    :host-context(.dark) .template-showcase-box,
    :host-context(.dark-theme) .template-showcase-box {
      background: #111827;
      border-color: rgba(255, 255, 255, 0.04);
    }

    .custom-cell-content {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 6px;
    }

    .custom-day-num {
      font-size: 13px;
      font-weight: 700;
      color: var(--ngx-calendar-text);
    }

    .custom-dots {
      display: flex;
      align-items: center;
      gap: 3px;
      justify-content: flex-end;
    }

    .custom-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      box-shadow: 0 1px 3px rgba(0,0,0,0.15);
    }
    
    .section-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; color: #8892a0; border-bottom: 2px solid #e9ecef; padding-bottom: 12px; margin-top: 16px; }
    .code-block { background: #1e1e1e; color: #d4d4d4; padding: 16px; border-radius: 8px; font-size: 12px; font-family: 'Cascadia Code', Consolas, monospace; overflow-x: auto; white-space: pre; margin: 0; }
    
    .api-table-wrap { overflow-x: auto; border: 1px solid #e9ecef; border-radius: 10px; margin-bottom: 24px; }
    .api-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .api-table thead tr { background: linear-gradient(135deg, #f8f9fa 0%, #f3f5f9 100%); }
    .api-table th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.7px; color: #495057; border-bottom: 2px solid #e9ecef; white-space: nowrap; }
    .api-table td { padding: 12px 16px; border-bottom: 1px solid #f1f3f5; color: #495057; vertical-align: top; }
    .api-table tbody tr { transition: background 0.2s ease; }
    .api-table tbody tr:hover td { background: #f8f9fa; }
    .api-table tbody tr:last-child td { border-bottom: none; }
    .api-name { color: #1a73e8 !important; font-family: monospace; font-weight: 700; white-space: nowrap; }
    .api-type { color: #8e44ad !important; font-family: monospace; white-space: nowrap; }
    .api-default { font-family: monospace; white-space: nowrap; color: #ff6b6b; font-weight: 500; }
  `]
})
export class CalendarDemoComponent {
  activeTab = signal('Demo');
  tabs = ['Demo', 'API Reference'];
  readonlyMode = false;

  selectedDate = signal<Date | null>(new Date());
  eventLogs = signal<string[]>(['[System] Calendar Initialized']);

  eventsList = signal<CalendarEvent[]>([]);

  howToCode = `import { Component, signal } from '@angular/core';
import { CalendarComponent, CalendarEvent } from 'ngx-core-components';

@Component({
  selector: 'app-calendar-example',
  imports: [CalendarComponent],
  template: \`
    <!-- Standard Month Calendar -->
    <ngx-calendar
      [value]="selected()"
      [events]="myEvents"
      (dateSelect)="selected.set($event)"
      (monthChange)="onMonth($event)"
    ></ngx-calendar>

    <!-- Calendar with custom projected day cells -->
    <ngx-calendar [events]="myEvents">
      <ng-template #dayTemplate let-date let-events="events">
        <div class="my-cell">
          <span>{{ date.getDate() }}</span>
          <span class="badge" *ngIf="events.length > 0">{{ events.length }}</span>
        </div>
      </ng-template>
    </ngx-calendar>
  \`
})
export class CalendarExampleComponent {
  selected = signal<Date | null>(new Date());

  myEvents: CalendarEvent[] = [
    { title: 'Project Kickoff', date: new Date(), color: '#10b981' },
    { title: 'Sprint Planning', date: new Date(new Date().setDate(new Date().getDate() + 2)), color: '#3b82f6' }
  ];

  onMonth(ev: { year: number; month: number }) {
    console.log('Month changed:', ev);
  }
}
  `;

  constructor() {
    this.initDemoEvents();
  }

  initDemoEvents() {
    const today = new Date();
    
    // Set standard recurring events around today
    const list: CalendarEvent[] = [
      {
        title: 'Team Standup',
        date: new Date(today),
        color: '#3b82f6',
        description: 'Morning sync meeting'
      },
      {
        title: 'Design Review',
        date: new Date(today),
        color: '#f59e0b',
        description: 'Review buttons and inputs layouts'
      },
      {
        title: 'Release Core Library',
        date: new Date(new Date(today).setDate(today.getDate() + 1)),
        color: '#10b981',
        description: 'Deploy version 0.3.17 to NPM'
      },
      {
        title: 'Gantt Milestone V2',
        date: new Date(new Date(today).setDate(today.getDate() + 5)),
        color: '#8b5cf6',
        description: 'Completed drag-zoom performance features'
      },
      {
        title: 'Sprint Retrospective',
        date: new Date(new Date(today).setDate(today.getDate() - 4)),
        color: '#ef4444',
        description: 'Review previous items sprint velocity'
      },
      {
        title: 'UI Feedback Session',
        date: new Date(new Date(today).setDate(today.getDate() - 4)),
        color: '#6b7280',
        description: 'Gather user comments on theme colors'
      }
    ];

    this.eventsList.set(list);
  }

  onDateSelect(date: Date) {
    this.selectedDate.set(date);
    this.eventLogs.update(logs => [
      ...logs,
      `🎯 Event: dateSelect() - Clicked ${date.toLocaleDateString()}`
    ].slice(-8));
  }

  onMonthChange(event: { year: number; month: number }) {
    const monthName = new Date(event.year, event.month, 1).toLocaleDateString('en-US', { month: 'long' });
    this.eventLogs.update(logs => [
      ...logs,
      `📅 Event: monthChange() - Navigated to ${monthName} ${event.year}`
    ].slice(-8));
  }

  clearSelection() {
    this.selectedDate.set(null);
    this.eventLogs.update(logs => [...logs, '🔄 Cleared Date Selection'].slice(-8));
  }

  addRandomEvent() {
    const current = this.selectedDate() || new Date();
    const titles = ['Coffee Sync', 'Client Call', 'Code Review', 'Bug Bash', 'Planning Session'];
    const colors = ['#ec4899', '#f97316', '#06b6d4', '#84cc16', '#a855f7'];

    const randomIdx = Math.floor(Math.random() * titles.length);
    const newEvent: CalendarEvent = {
      title: `${titles[randomIdx]} ⚡`,
      date: new Date(current),
      color: colors[randomIdx],
      description: 'Dynamically added demo event'
    };

    this.eventsList.update(list => [...list, newEvent]);
    this.eventLogs.update(logs => [
      ...logs,
      `➕ Added event "${newEvent.title}" on ${current.toLocaleDateString()}`
    ].slice(-8));
  }

  calendarApi: ApiRow[] = [
    { name: 'value', type: 'model<Date | null>', default: 'null', description: 'Two-way binding property for the selected date.' },
    { name: 'events', type: 'input<CalendarEvent[]>', default: '[]', description: 'Array of event markers to display inside calendar cells.' },
    { name: 'readonly', type: 'input<boolean>', default: 'false', description: 'When true, disables selecting dates.' },
    { name: 'dayTemplate', type: 'ContentChild<TemplateRef>', default: 'n/a', description: 'Projected template to customize the day cell rendering.' },
    { name: 'dateSelect', type: 'output<Date>', default: 'n/a', description: 'Fires when a day cell is clicked.' },
    { name: 'monthChange', type: 'output<{ year: number, month: number }>', default: 'n/a', description: 'Fires when the active calendar month changes.' }
  ];
}
