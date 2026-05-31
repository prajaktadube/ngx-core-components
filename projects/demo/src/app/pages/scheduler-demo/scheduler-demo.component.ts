import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SchedulerComponent, SchedulerEvent, SchedulerSlotClickEvent } from 'ngx-core-components/views';

interface ApiRow { name: string; type: string; default: string; description: string; }

@Component({
  selector: 'app-scheduler-demo',
  standalone: true,
  imports: [CommonModule, FormsModule, SchedulerComponent],
  template: `
    <div class="demo-page">
      
      <!-- Page Header -->
      <div class="page-header">
        <div class="page-header-text">
          <h1>Scheduler &amp; Planner</h1>
          <p>
            An interactive, signal-driven appointment scheduler for managing task slots, team meetings, and milestones across Day, Week, and Month views.
          </p>
        </div>
        <div class="header-badges">
          <span class="badge badge-purple">Day/Week/Month</span>
          <span class="badge badge-blue">Signal-based</span>
          <span class="badge badge-green">Interactive</span>
        </div>
      </div>

      <!-- TAB NAV -->
      <div class="tab-nav">
        @for (tab of tabs; track tab) {
          <button class="tab-btn" [class.active]="activeTab() === tab" (click)="activeTab.set(tab)">{{ tab }}</button>
        }
      </div>

      <!-- ===== DEMO TAB ===== -->
      @if (activeTab() === 'Demo') {
        <div class="tab-content">
          <div class="scheduler-grid-layout">
            
            <!-- Left panel: Controls and logs -->
            <div class="control-panel-card">
              <h3>Planner Options</h3>
              <p class="panel-desc">Quickly configure parameters and schedule mock events.</p>

              <div class="options-group">
                <button class="action-btn primary" (click)="addMockMeeting()">
                  ➕ Schedule Team Sync
                </button>
                <button class="action-btn success" (click)="addMockMilestone()">
                  ⭐ Add Milestone Deadline
                </button>
                <button class="action-btn danger" (click)="clearAllEvents()">
                  🗑️ Clear All Events
                </button>
              </div>

              <div class="section-divider"></div>

              <h3>Activity Log</h3>
              <div class="logs-box">
                @if (logs().length === 0) {
                  <span class="empty-logs">No recent interactions. Click empty cells or existing events.</span>
                } @else {
                  @for (log of logs(); track $index) {
                    <div class="log-item">
                      <span class="log-time">[{{ log.time | date:'HH:mm:ss' }}]</span>
                      <span class="log-text">{{ log.text }}</span>
                    </div>
                  }
                }
              </div>
            </div>

            <!-- Right panel: Live interactive scheduler -->
            <div class="scheduler-view-card">
              <ngx-scheduler
                [events]="events()"
                [currentDate]="today"
                [viewMode]="'week'"
                [theme]="theme()"
                (eventClick)="onEventClick($event)"
                (slotClick)="onSlotClick($event)"
              />
            </div>

          </div>

          <div class="section-label">How to Use</div>
          <pre class="code-block">{{ codeSnippet }}</pre>
        </div>
      }

      <!-- ===== API REFERENCE TAB ===== -->
      @if (activeTab() === 'API Reference') {
        <div class="tab-content">
          <div class="section-label">Scheduler Properties (ngx-scheduler)</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input / Output</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of apiRows; track row.name) {
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

    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 20px;
      padding-bottom: 24px;
      border-bottom: 2px solid var(--border-color, #e2e8f0);
    }
    .page-header-text h1 {
      margin: 0 0 8px;
      font-size: 28px;
      font-weight: 900;
      color: var(--text-primary, #0f172a);
      letter-spacing: -0.5px;
    }
    .page-header-text p {
      margin: 0;
      font-size: 14px;
      color: var(--text-secondary, #64748b);
      line-height: 1.7;
      max-width: 720px;
    }

    .header-badges {
      display: flex;
      gap: 10px;
      flex-shrink: 0;
      flex-wrap: wrap;
    }
    .badge {
      font-size: 11px;
      font-weight: 700;
      padding: 6px 12px;
      border-radius: 16px;
      transition: all 0.2s ease;
    }
    .badge-purple { background: rgba(139, 92, 246, 0.15); color: #8b5cf6; border: 1px solid rgba(139, 92, 246, 0.1); }
    .badge-blue { background: rgba(59, 130, 246, 0.15); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.1); }
    .badge-green { background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.1); }

    .tab-nav {
      display: flex;
      border-bottom: 2px solid var(--border-color, #e2e8f0);
      overflow-x: auto;
    }
    .tab-btn {
      padding: 12px 20px;
      background: none;
      border: none;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary, #64748b);
      cursor: pointer;
      border-bottom: 3px solid transparent;
      margin-bottom: -2px;
      font-family: inherit;
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    .tab-btn:hover {
      color: var(--text-primary, #0f172a);
      background: rgba(79, 70, 229, 0.05);
    }
    .tab-btn.active {
      color: var(--primary-color, #4f46e5);
      border-bottom-color: var(--primary-color, #4f46e5);
      font-weight: 600;
      background: rgba(79, 70, 229, 0.04);
    }

    .tab-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    /* Grid dashboard layout */
    .scheduler-grid-layout {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 24px;
      align-items: stretch;
    }
    @media (max-width: 960px) {
      .scheduler-grid-layout {
        grid-template-columns: 1fr;
      }
    }

    .control-panel-card {
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #cbd5e1);
      border-radius: 12px;
      padding: 24px;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .control-panel-card h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-primary, #0f172a);
    }
    .panel-desc {
      font-size: 12px;
      color: var(--text-secondary, #64748b);
      margin: 0 0 6px;
      line-height: 1.4;
    }

    .options-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .action-btn {
      width: 100%;
      border: 1px solid var(--border-color, #cbd5e1);
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.25s;
      font-family: inherit;
      text-align: left;
      background: var(--bg-secondary, #ffffff);
      color: var(--text-primary, #0f172a);
    }
    .action-btn:hover {
      transform: translateY(-1px);
    }
    .action-btn.primary { border-color: #3b82f6; color: #3b82f6; }
    .action-btn.primary:hover { background: rgba(59, 130, 246, 0.05); }
    .action-btn.success { border-color: #10b981; color: #10b981; }
    .action-btn.success:hover { background: rgba(16, 185, 129, 0.05); }
    .action-btn.danger { border-color: #ef4444; color: #ef4444; }
    .action-btn.danger:hover { background: rgba(239, 68, 68, 0.05); }

    .section-divider {
      height: 1px;
      background: var(--border-color, #cbd5e1);
      margin: 8px 0;
    }

    /* Logs console styles */
    .logs-box {
      border: 1px solid var(--border-color, #cbd5e1);
      border-radius: 8px;
      padding: 12px 14px;
      background: var(--bg-primary, #f8fafc);
      min-height: 200px;
      max-height: 320px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .empty-logs {
      font-size: 12px;
      color: var(--text-secondary, #64748b);
      font-style: italic;
    }
    .log-item {
      font-size: 11px;
      font-family: 'Courier New', monospace;
      color: var(--text-primary, #0f172a);
      line-height: 1.4;
      border-bottom: 1px dashed var(--border-light, #e2e8f0);
      padding-bottom: 4px;
    }
    .log-item:last-child {
      border-bottom: none;
    }
    .log-time {
      color: var(--primary-color, #4f46e5);
      margin-right: 6px;
      font-weight: 700;
    }

    .scheduler-view-card {
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #cbd5e1);
      border-radius: 12px;
      padding: 16px;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
    }

    /* Markdown Code Blocks */
    .section-label {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: #8892a0;
      border-bottom: 2px solid var(--border-color, #cbd5e1);
      padding-bottom: 12px;
    }

    .code-block {
      background: #0f172a;
      color: #f8fafc;
      padding: 20px;
      border-radius: 12px;
      font-size: 12px;
      font-family: 'Cascadia Code', Consolas, monospace;
      overflow-x: auto;
      white-space: pre;
      margin: 0;
    }

    /* API Table */
    .api-table-wrap {
      overflow-x: auto;
      border: 1px solid var(--border-color, #cbd5e1);
      border-radius: 12px;
      background: var(--bg-secondary, #ffffff);
    }
    .api-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    .api-table thead tr {
      background: var(--border-light, #f8fafc);
      border-bottom: 1.5px solid var(--border-color, #cbd5e1);
    }
    .api-table th {
      padding: 12px 16px;
      text-align: left;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.7px;
      color: var(--text-secondary, #475569);
    }
    .api-table td {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-light, #e2e8f0);
      color: var(--text-primary, #0f172a);
      vertical-align: top;
    }
    .api-table tbody tr:hover td {
      background: var(--border-light, #f8fafc);
    }
    .api-table tbody tr:last-child td {
      border-bottom: none;
    }

    .api-name { color: var(--primary-color, #4f46e5) !important; font-family: monospace; font-weight: 700; }
    .api-type { color: #a855f7 !important; font-family: monospace; }
    .api-default { font-family: monospace; color: #f43f5e; font-weight: 500; }
  `]
})
export class SchedulerDemoComponent {
  activeTab = signal('Demo');
  tabs = ['Demo', 'API Reference'];

  today = new Date();
  theme = signal<'light' | 'dark'>('light');

  // Activity events logging
  logs = signal<{ time: Date; text: string }[]>([]);

  // Base sample events
  events = signal<SchedulerEvent[]>([
    {
      id: '1',
      title: 'Daily Standup Meeting',
      description: 'Discuss today sprint items and blockages.',
      start: (() => {
        const d = new Date();
        d.setHours(9, 30, 0, 0);
        return d;
      })(),
      end: (() => {
        const d = new Date();
        d.setHours(10, 0, 0, 0);
        return d;
      })(),
      category: 'meeting'
    },
    {
      id: '2',
      title: 'UI Design Review',
      description: 'Review the glassmorphism layout changes.',
      start: (() => {
        const d = new Date();
        d.setHours(13, 0, 0, 0);
        return d;
      })(),
      end: (() => {
        const d = new Date();
        d.setHours(14, 30, 0, 0);
        return d;
      })(),
      category: 'task'
    },
    {
      id: '3',
      title: 'Global System Sync',
      description: 'Important code freeze check-in.',
      start: (() => {
        const d = new Date();
        d.setHours(16, 0, 0, 0);
        return d;
      })(),
      end: (() => {
        const d = new Date();
        d.setHours(17, 0, 0, 0);
        return d;
      })(),
      category: 'important'
    }
  ]);

  addLog(text: string) {
    this.logs.update(list => [{ time: new Date(), text }, ...list].slice(0, 30));
  }

  onEventClick(evt: SchedulerEvent) {
    this.addLog(`Clicked event: "${evt.title}" (${evt.description || 'no description'})`);
  }

  onSlotClick(event: SchedulerSlotClickEvent) {
    const timeLabel = event.date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const dayLabel = event.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    this.addLog(`Clicked empty slot: ${dayLabel} at ${timeLabel}`);

    // Simulate scheduling a quick event
    const newEvent: SchedulerEvent = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Quick Event',
      description: 'Automatically added to slot.',
      start: new Date(event.date),
      end: (() => {
        const d = new Date(event.date);
        d.setHours(d.getHours() + 1);
        return d;
      })(),
      category: 'personal'
    };

    this.events.update(list => [...list, newEvent]);
    this.addLog(`✓ Scheduled: "New Quick Event" for ${timeLabel}`);
  }

  addMockMeeting() {
    const start = new Date();
    start.setHours(11, 0, 0, 0);
    const end = new Date();
    end.setHours(12, 0, 0, 0);

    const newMeeting: SchedulerEvent = {
      id: 'mock-' + Math.random().toString(36).substr(2, 9),
      title: 'Team Retrospective Sync',
      description: 'Bi-weekly sprint demo and reflection.',
      start,
      end,
      category: 'meeting'
    };

    this.events.update(list => [...list, newMeeting]);
    this.addLog(`✓ Scheduled: "Team Retrospective Sync" at 11:00 AM`);
  }

  addMockMilestone() {
    const start = new Date();
    start.setHours(15, 0, 0, 0);
    const end = new Date();
    end.setHours(16, 0, 0, 0);

    const newMilestone: SchedulerEvent = {
      id: 'mock-' + Math.random().toString(36).substr(2, 9),
      title: 'Milestone Beta Release',
      description: 'Core assets uploaded to npm registry.',
      start,
      end,
      category: 'milestone'
    };

    this.events.update(list => [...list, newMilestone]);
    this.addLog(`✓ Scheduled Milestone: "Milestone Beta Release" at 3:00 PM`);
  }

  clearAllEvents() {
    this.events.set([]);
    this.addLog('🗑️ Cleared all events from scheduler.');
  }

  // Code instructions variables
  codeSnippet = `import { SchedulerComponent, SchedulerEvent } from 'ngx-core-components/views';

@Component({
  imports: [SchedulerComponent],
  template: \`
    <ngx-scheduler
      [events]="myEvents"
      [viewMode]="'week'"
      (eventClick)="onEventClick($event)"
      (slotClick)="onSlotClick($event)"
    />
  \`
})
export class MyPlannerComponent {
  myEvents: SchedulerEvent[] = [
    {
      id: '1',
      title: 'Sprint Review',
      start: new Date(2026, 4, 15, 10, 0),
      end: new Date(2026, 4, 15, 11, 30),
      category: 'meeting'
    }
  ];

  onEventClick(event: SchedulerEvent) {
    console.log('Event details clicked:', event);
  }

  onSlotClick(slot: { date: Date; hour: number }) {
    console.log('Clicked empty slot:', slot.date);
  }
}`;

  apiRows: ApiRow[] = [
    { name: 'events', type: 'SchedulerEvent[]', default: '[]', description: 'Array of scheduled calendar appointments and event markers.' },
    { name: 'currentDate', type: 'Date', default: 'new Date()', description: 'Selected baseline date. Day, Week, and Month views will translate relative to this date.' },
    { name: 'viewMode', type: "'day' | 'week' | 'month'", default: "'week'", description: 'Granularity of grid planner columns.' },
    { name: 'theme', type: "'light' | 'dark'", default: "'light'", description: 'Sets light or dark high-contrast style configuration.' },
    { name: 'businessHoursStart', type: 'number', default: '8', description: 'Starting hour limit for the Day/Week vertical timeline axis (0-23).' },
    { name: 'businessHoursEnd', type: 'number', default: '20', description: 'Ending hour limit for the Day/Week vertical timeline axis (0-23).' },
    { name: '(eventClick)', type: 'SchedulerEvent', default: '—', description: 'Emitted when an event card is clicked.' },
    { name: '(slotClick)', type: 'SchedulerSlotClickEvent', default: '—', description: 'Emitted when an empty grid cell/hour slot is clicked.' },
    { name: '(eventTimeChange)', type: 'SchedulerEventChangeEvent', default: '—', description: 'Emitted when an event start/end hour is modified.' },
  ];
}
