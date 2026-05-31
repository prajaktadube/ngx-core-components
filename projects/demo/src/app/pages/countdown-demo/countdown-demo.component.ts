import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CountdownComponent, CountdownVariant } from 'ngx-core-components/feedback';

@Component({
  selector: 'app-countdown-demo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, CountdownComponent],
  template: `
    <div class="demo-page">
      <header class="demo-header">
        <h1>⏱️ Countdown Timer</h1>
        <p>Premium circular SVG and grid card countdown timers. Perfect for tracking events, deadlines, limits, or task progress.</p>
      </header>

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

      <!-- How to Use -->
      <section class="demo-section">
        <h2>How to Use</h2>
        <p class="section-desc">Import the standalone countdown component and configure either a duration (in seconds) or a target date.</p>
        <pre style="margin: 0; background: #0f172a; color: #38bdf8; padding: 18px 24px; border-radius: 12px; font-size: 13px; line-height: 1.6; overflow: auto; border: 1px solid rgba(255,255,255,0.06); font-family: monospace;">{{ howToCode }}</pre>
      </section>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .demo-page {
      max-width: 960px;
      margin: 0 auto;
      padding: 32px 24px 80px;
    }

    .demo-header {
      margin-bottom: 40px;
    }

    .demo-header h1 {
      font-size: 28px;
      font-weight: 800;
      color: var(--text-primary, #0f172a);
      margin: 0 0 8px;
    }

    .demo-header p {
      font-size: 15px;
      color: var(--text-secondary, #64748b);
      margin: 0;
    }

    .demo-section {
      margin-bottom: 48px;
    }

    .demo-section h2 {
      font-size: 17px;
      font-weight: 700;
      color: var(--text-primary, #0f172a);
      margin: 0 0 8px;
    }

    .section-desc {
      font-size: 13px;
      color: var(--text-secondary, #64748b);
      margin: 0 0 20px;
    }

    /* ── Interactive demo ── */
    .interactive-box {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 24px;
      background: var(--bg-secondary, #f8fafc);
      padding: 24px;
      border-radius: 16px;
      border: 1px solid rgba(0, 0, 0, 0.04);
    }

    .controls-panel {
      display: flex;
      flex-direction: column;
      gap: 16px;
      background: var(--bg-primary, #ffffff);
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
      background: var(--primary-color, #3b82f6);
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
  `]
})
export class CountdownDemoComponent {
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
}
