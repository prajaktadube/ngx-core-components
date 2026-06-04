import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CountdownComponent, CountdownVariant } from 'ngx-core-components/feedback';

interface ApiRow { name: string; type: string; default: string; description: string; }

@Component({
  selector: 'app-countdown-demo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, CountdownComponent],
  template: `
    <div class="demo-page">
      <!-- Page Header -->
      <div class="page-header">
        <div class="page-header-text">
          <h1>⏱️ Countdown Timer</h1>
          <p>Premium circular SVG and grid card countdown timers. Perfect for tracking events, deadlines, limits, or task progress.</p>
        </div>
        <div class="header-badges">
          <span class="badge badge-purple">Circular Progress</span>
          <span class="badge badge-purple">Milestones</span>
          <span class="badge badge-purple">Standalone SVG</span>
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
          <!-- Interactive Timer Configuration -->
          <section class="demo-section">
            <h2>Interactive Demo</h2>
            <p class="section-desc">Test custom durations, variants, layouts, and trace outputs in real-time.</p>
            <div class="interactive-box">
              <div class="controls-panel">
                <div class="control-group">
                  <label>Duration (Seconds)</label>
                  <input type="number" [(ngModel)]="customDuration" (change)="reloadTimer()" min="5" max="3600" />
                </div>

                <div class="control-group">
                  <label>Accent Variant</label>
                  <select [(ngModel)]="selectedVariant" (change)="reloadTimer()">
                    <option value="default">Default (Blue)</option>
                    <option value="success">Success (Green)</option>
                    <option value="danger">Danger (Red)</option>
                    <option value="warning">Warning (Yellow)</option>
                    <option value="info">Info (Cyan)</option>
                  </select>
                </div>

                <div class="control-group check-group">
                  <label>
                    <input type="checkbox" [(ngModel)]="showRing" /> Show Progress Ring
                  </label>
                </div>

                <div class="control-group check-group">
                  <label>
                    <input type="checkbox" [(ngModel)]="compactMode" /> Compact Only (Inside Ring)
                  </label>
                </div>

                <div class="control-group check-group">
                  <label>
                    <input type="checkbox" [(ngModel)]="showControls" /> Show Action Controls
                  </label>
                </div>

                <div class="control-group">
                  <button class="action-btn" (click)="reloadTimer()">🔄 Restart Timer</button>
                </div>
              </div>

              <div class="timer-display-panel">
                @if (timerKey()) {
                  <ngx-countdown
                    [duration]="customDuration"
                    [variant]="selectedVariant"
                    [showRing]="showRing"
                    [compactOnly]="compactMode"
                    [showControls]="showControls"
                    (finished)="onTimerFinished()"
                    (tick)="onTimerTick($event)"
                  ></ngx-countdown>
                }

                <div class="event-logs">
                  <h4>Event Stream</h4>
                  <div class="log-lines">
                    @for (log of eventLogs(); track $index) {
                      <div class="log-line">{{ log }}</div>
                    }
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Target Date Countdown -->
          <section class="demo-section">
            <h2>Count down to Target Date</h2>
            <p class="section-desc">Calculates time remaining to a specific calendar milestone (e.g. New Year 2027 or a set milestone).</p>
            <div class="target-date-wrap">
              <ngx-countdown
                [targetDate]="milestoneDate"
                [showControls]="false"
                [forceShowDays]="true"
                variant="info"
              ></ngx-countdown>
              <div class="target-info">
                <h3>🚀 Next Core Component Release</h3>
                <p>Target Date: <strong>{{ milestoneDate.toLocaleDateString() }} {{ milestoneDate.toLocaleTimeString() }}</strong></p>
                <p class="desc">A standalone countdown mapping calendar schedules dynamically without manual intervals.</p>
              </div>
            </div>
          </section>

          <!-- Variants Showcase -->
          <section class="demo-section">
            <h2>Variants</h2>
            <div class="variants-row">
              <div class="variant-item">
                <span>Success</span>
                <ngx-countdown [duration]="120" variant="success" [showControls]="false" [showRing]="true" [compactOnly]="true"></ngx-countdown>
              </div>
              <div class="variant-item">
                <span>Danger</span>
                <ngx-countdown [duration]="60" variant="danger" [showControls]="false" [showRing]="true" [compactOnly]="true"></ngx-countdown>
              </div>
              <div class="variant-item">
                <span>Warning</span>
                <ngx-countdown [duration]="180" variant="warning" [showControls]="false" [showRing]="true" [compactOnly]="true"></ngx-countdown>
              </div>
              <div class="variant-item">
                <span>Info</span>
                <ngx-countdown [duration]="300" variant="info" [showControls]="false" [showRing]="true" [compactOnly]="true"></ngx-countdown>
              </div>
            </div>
          </section>

          <!-- Dark Theme -->
          <section class="demo-section">
            <h2>Dark Mode Style</h2>
            <div class="dark-box-bg">
              <ngx-countdown
                [duration]="1500"
                theme="dark"
                variant="warning"
                [showRing]="true"
              ></ngx-countdown>
            </div>
          </section>

          <div class="section-label">How to Use</div>
          <pre class="code-block">{{ howToCode }}</pre>
        </div>
      }

      <!-- ===== API REFERENCE ===== -->
      @if (activeTab() === 'API Reference') {
        <div class="tab-content">
          <div class="section-label">Countdown (ngx-countdown)</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input / Output</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of countdownApi; track row.name) {
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
    .badge-purple { background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%); color: #6b21a8; border: 1px solid rgba(107, 33, 168, 0.1); }
    
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

    .controls-panel {
      display: flex;
      flex-direction: column;
      gap: 16px;
      background: #ffffff;
      padding: 16px;
      border-radius: 12px;
      border: 1px solid rgba(0, 0, 0, 0.05);
    }

    .control-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .control-group label {
      font-size: 12px;
      font-weight: 600;
      color: #475569;
    }

    .control-group input[type="number"],
    .control-group select {
      padding: 8px 12px;
      font-size: 13px;
      border-radius: 6px;
      border: 1px solid #cbd5e1;
      outline: none;
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
      background: #3b82f6;
      color: white;
      border: none;
      padding: 8px 12px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      transition: opacity 0.2s;
    }

    .action-btn:hover {
      opacity: 0.9;
    }

    .timer-display-panel {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 20px;
    }

    .event-logs {
      width: 100%;
      background: #0f172a;
      border-radius: 12px;
      padding: 14px;
      color: #38bdf8;
      font-family: monospace;
      font-size: 12px;
    }

    .event-logs h4 {
      margin: 0 0 8px 0;
      font-size: 12px;
      color: #94a3b8;
      border-bottom: 1px solid #334155;
      padding-bottom: 4px;
    }

    .log-lines {
      height: 90px;
      overflow-y: auto;
      display: flex;
      flex-direction: column-reverse;
      gap: 4px;
    }

    .log-line {
      white-space: pre-wrap;
    }

    /* ── Target milestone Release ── */
    .target-date-wrap {
      display: flex;
      align-items: center;
      gap: 24px;
      background: white;
      padding: 24px;
      border-radius: 16px;
      border: 1.5px solid rgba(0, 0, 0, 0.05);
    }

    .target-info h3 {
      margin: 0 0 6px 0;
      font-size: 16px;
      color: #0f172a;
    }

    .target-info p {
      margin: 0 0 4px 0;
      font-size: 13px;
      color: #475569;
    }

    .target-info .desc {
      color: #64748b;
      font-size: 12px;
      margin: 0;
    }

    /* ── Variants Row ── */
    .variants-row {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .variant-item {
      flex: 1;
      min-width: 120px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 16px;
      background: #f8fafc;
      border-radius: 12px;
    }

    .variant-item span {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
    }

    /* ── Dark mode bg ── */
    .dark-box-bg {
      background: linear-gradient(135deg, #0f111a 0%, #17192a 100%);
      padding: 40px;
      border-radius: 16px;
      display: flex;
      justify-content: center;
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
export class CountdownDemoComponent {
  activeTab = signal('Demo');
  tabs = ['Demo', 'API Reference'];

  customDuration = 120;
  selectedVariant: CountdownVariant = 'default';
  showRing = true;
  compactMode = false;
  showControls = true;

  timerKey = signal<number>(1);
  eventLogs = signal<string[]>([]);
  milestoneDate: Date;

  howToCode = `import { Component } from '@angular/core';
import { CountdownComponent } from 'ngx-core-components/feedback';

@Component({
  selector: 'app-my-timer',
  standalone: true,
  imports: [CountdownComponent],
  template: \`
    <!-- Circular countdown with custom duration -->
    <ngx-countdown [duration]="120" variant="success"></ngx-countdown>

    <!-- Milestone countdown to a calendar target date -->
    <ngx-countdown [targetDate]="milestoneDate" variant="info" [showControls]="false"></ngx-countdown>
  \`
})
export class MyTimerComponent {
  milestoneDate = new Date('2027-01-01T00:00:00');
}`;

  constructor() {
    // Set milestone date to 10 days in the future
    const d = new Date();
    d.setDate(d.getDate() + 10);
    d.setHours(d.getHours() + 4);
    d.setMinutes(d.getMinutes() + 12);
    this.milestoneDate = d;
  }

  reloadTimer() {
    this.timerKey.update(k => k + 1);
    this.eventLogs.set(['[System] Timer reset & reloaded']);
  }

  onTimerFinished() {
    this.eventLogs.update(logs => [...logs, '🚨 Event: finished() - Timer hit 0!']);
  }

  onTimerTick(event: { days: number; hours: number; minutes: number; seconds: number; totalSeconds: number }) {
    this.eventLogs.update(logs => [
      ...logs,
      `⏱️ Event: tick() - ${event.totalSeconds}s remaining (${event.hours}h:${event.minutes}m:${event.seconds}s)`
    ].slice(-10)); // Keep only latest 10 logs
  }

  countdownApi: ApiRow[] = [
    { name: 'targetDate', type: 'string | Date | null', default: 'null', description: 'Milestone target date. Overrides duration if set.' },
    { name: 'duration', type: 'number | null', default: 'null', description: 'Timer duration in seconds.' },
    { name: 'showRing', type: 'boolean', default: 'true', description: 'Renders the circular progress outline.' },
    { name: 'ringColor', type: 'string', default: "''", description: 'Override background fill color on the circular ring.' },
    { name: 'theme', type: "'light' | 'dark'", default: "'light'", description: 'Styling theme mode.' },
    { name: 'variant', type: "'default' | 'success' | 'danger' | 'warning' | 'info'", default: "'default'", description: 'Accent visual theme variation.' },
    { name: 'autoStart', type: 'boolean', default: 'true', description: 'Starts countdown instantly upon initialization.' },
    { name: 'showControls', type: 'boolean', default: 'true', description: 'Displays interactive play/pause/reset controls.' },
    { name: 'compactOnly', type: 'boolean', default: 'false', description: 'Hides grid cards, showing only value in central circle.' },
    { name: 'forceShowDays', type: 'boolean', default: 'false', description: 'Forces days rendering panel even when duration is under 24 hours.' },
    { name: 'id', type: 'string', default: 'auto-generated', description: 'Unique element identifier for target mapping.' },
    { name: 'finished', type: 'Output<void>', default: 'n/a', description: 'Emitted when the timer reaches 0.' },
    { name: 'tick', type: 'Output<CountdownTick>', default: 'n/a', description: 'Emitted every second containing the tick object details.' }
  ];
}

