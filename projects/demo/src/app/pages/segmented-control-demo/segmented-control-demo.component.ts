import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SegmentedControlComponent, SegmentedOption } from 'ngx-core-components/inputs';

@Component({
  selector: 'app-segmented-control-demo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, SegmentedControlComponent],
  template: `
    <div class="demo-page">
      <header class="demo-header">
        <h1>🎛️ Segmented Control</h1>
        <p>A sleek, iOS-like sliding segmented selection control. Animates a glowing background indicator between selections. Perfect for toggling layouts, views, or filters.</p>
      </header>

      <!-- Basic selection and event monitor -->
      <section class="demo-section">
        <h2>Basic Selection & Slide Transition</h2>
        <p class="section-desc">Observe the smooth highlight slide. Toggles views in real-time.</p>
        
        <div class="basic-showcase">
          <div class="selection-row">
            <ngx-segmented-control
              [options]="viewOptions"
              [(value)]="activeView"
              (valueChange)="onValueChange($event, 'View Switcher')"
            ></ngx-segmented-control>
          </div>

          <div class="active-content-panel">
            @if (activeView() === 'grid') {
              <div class="content-box">
                <h4>📐 Grid Layout Active</h4>
                <p>Rendering responsive cards containing dashboard metrics and widgets.</p>
              </div>
            } @else if (activeView() === 'list') {
              <div class="content-box">
                <h4>📑 List Layout Active</h4>
                <p>Rendering detailed tabular rows optimized for bulk management.</p>
              </div>
            } @else {
              <div class="content-box">
                <h4>🗺️ Board Layout Active</h4>
                <p>Rendering Kanban workflow columns for tracking drag-and-drop operations.</p>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Badge Indicators & Accent Variants -->
      <section class="demo-section">
        <h2>Variants & Notification Badges</h2>
        <p class="section-desc">Different indicator color accents. Items can contain text labels and notification count badges.</p>
        
        <div class="variants-stack">
          <div class="variant-item">
            <span>Primary Blue (Badge)</span>
            <ngx-segmented-control
              [options]="statusOptions"
              [(value)]="activeStatus"
              variant="primary"
            ></ngx-segmented-control>
          </div>

          <div class="variant-item">
            <span>Success Green</span>
            <ngx-segmented-control
              [options]="severityOptions"
              [(value)]="activeSeverity"
              variant="success"
            ></ngx-segmented-control>
          </div>

          <div class="variant-item">
            <span>Danger Red</span>
            <ngx-segmented-control
              [options]="priorityOptions"
              [(value)]="activePriority"
              variant="danger"
            ></ngx-segmented-control>
          </div>

          <div class="variant-item">
            <span>Warning Yellow</span>
            <ngx-segmented-control
              [options]="warningOptions"
              [(value)]="activeWarning"
              variant="warning"
            ></ngx-segmented-control>
          </div>
        </div>
      </section>

      <!-- Disabled State -->
      <section class="demo-section">
        <h2>Disabled State Toggle</h2>
        <p class="section-desc">Lock selection controls during remote calls or permissions restrictions.</p>
        <div class="disabled-row">
          <button class="toggle-btn" (click)="isDisabled.set(!isDisabled())">
            {{ isDisabled() ? '🔓 Enable Controls' : '🔒 Disable Controls' }}
          </button>
          
          <ngx-segmented-control
            [options]="viewOptions"
            [value]="'grid'"
            [disabled]="isDisabled()"
          ></ngx-segmented-control>
        </div>
      </section>

      <!-- Dark Theme Showcase -->
      <section class="demo-section">
        <h2>Dark Theme Styling</h2>
        <div class="dark-box-bg">
          <ngx-segmented-control
            [options]="viewOptions"
            [(value)]="activeView"
            theme="dark"
            variant="info"
          ></ngx-segmented-control>
        </div>
      </section>

      <!-- Action logs -->
      <section class="demo-section">
        <h2>Change Event Log</h2>
        <div class="event-logs">
          <h4>Event Log Stream</h4>
          <div class="log-lines">
            @for (log of eventLogs(); track $index) {
              <div class="log-line">{{ log }}</div>
            }
          </div>
        </div>
      </section>

      <!-- How to Use -->
      <section class="demo-section">
        <h2>How to Use</h2>
        <p class="section-desc">Import the standalone segmented control component, provide options, and bind the selected value with two-way binding.</p>
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
      margin-bottom: 40px;
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

    /* Basic display box */
    .basic-showcase {
      display: flex;
      flex-direction: column;
      gap: 16px;
      background: white;
      padding: 24px;
      border-radius: 12px;
      border: 1px solid rgba(0, 0, 0, 0.05);
    }

    .active-content-panel {
      padding: 16px 20px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid rgba(0, 0, 0, 0.03);
    }

    .content-box h4 {
      margin: 0 0 6px 0;
      font-size: 14px;
      color: #0f172a;
    }

    .content-box p {
      margin: 0;
      font-size: 13px;
      color: #475569;
    }

    /* Variants stack */
    .variants-stack {
      display: flex;
      flex-direction: column;
      gap: 20px;
      background: white;
      padding: 24px;
      border-radius: 12px;
      border: 1px solid rgba(0, 0, 0, 0.05);
    }

    .variant-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .variant-item span {
      font-size: 12px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
    }

    /* Disabled rows */
    .disabled-row {
      display: flex;
      align-items: center;
      gap: 24px;
      background: white;
      padding: 24px;
      border-radius: 12px;
      border: 1px solid rgba(0, 0, 0, 0.05);
    }

    .toggle-btn {
      background: #475569;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }

    /* Dark Mode bg */
    .dark-box-bg {
      background: linear-gradient(135deg, #0f111a 0%, #17192a 100%);
      padding: 32px;
      border-radius: 12px;
      display: flex;
      justify-content: center;
    }

    /* Event logs */
    .event-logs {
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
  `]
})
export class SegmentedControlDemoComponent {
  howToCode = `import { Component, signal } from '@angular/core';
import { SegmentedControlComponent, SegmentedOption } from 'ngx-core-components/inputs';

@Component({
  selector: 'app-my-tabs',
  standalone: true,
  imports: [SegmentedControlComponent],
  template: \`
    <ngx-segmented-control
      [options]="tabs"
      [(value)]="selectedTab"
      variant="primary"
    ></ngx-segmented-control>
  \`
})
export class MyTabsComponent {
  selectedTab = signal('home');

  tabs: SegmentedOption[] = [
    { label: 'Home View', value: 'home' },
    { label: 'Messages', value: 'messages', badge: '5' },
    { label: 'System Settings', value: 'settings' }
  ];
}`;

  // Option configurations
  viewOptions: SegmentedOption[] = [
    { label: 'Grid Cards', value: 'grid' },
    { label: 'Tabular List', value: 'list' },
    { label: 'Workflow Board', value: 'board' }
  ];

  statusOptions: SegmentedOption[] = [
    { label: 'All Jobs', value: 'all', badge: '24' },
    { label: 'Running', value: 'running', badge: '3' },
    { label: 'Completed', value: 'completed', badge: '21' }
  ];

  severityOptions: SegmentedOption[] = [
    { label: 'Low Alert', value: 'low' },
    { label: 'Medium Alert', value: 'medium' },
    { label: 'Critical Alert', value: 'critical' }
  ];

  priorityOptions: SegmentedOption[] = [
    { label: 'P1 Blockers', value: 'p1', badge: '1' },
    { label: 'P2 High', value: 'p2', badge: '4' },
    { label: 'P3 Normal', value: 'p3' }
  ];

  warningOptions: SegmentedOption[] = [
    { label: 'Standard Filter', value: 'std' },
    { label: 'Extended Search', value: 'ext' }
  ];

  // Selected values
  activeView = signal('grid');
  activeStatus = signal('all');
  activeSeverity = signal('medium');
  activePriority = signal('p2');
  activeWarning = signal('std');

  isDisabled = signal(false);
  eventLogs = signal<string[]>([]);

  onValueChange(val: any, context: string) {
    this.logEvent(`[${context}] selected value changed to "${val}"`);
  }

  logEvent(msg: string) {
    this.eventLogs.update(logs => [
      ...logs,
      `[${new Date().toLocaleTimeString()}] ${msg}`
    ].slice(-10));
  }
}
