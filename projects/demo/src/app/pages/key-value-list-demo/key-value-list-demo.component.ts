import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KeyValueListComponent, KeyValueItem } from 'ngx-core-components/views';

@Component({
  selector: 'app-key-value-list-demo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, KeyValueListComponent],
  template: `
    <div class="demo-page">
      <header class="demo-header">
        <h1>📋 Key-Value Property List</h1>
        <p>A details grids optimized for showing metadata, configurations, or inspection lists. Supports group sections, text copy triggers, search bars, and styling.</p>
      </header>

      <!-- Interactive Playground Configurations -->
      <section class="demo-section">
        <h2>Interactive Playground</h2>
        <p class="section-desc">Observe search filtering, copy events, list striping, and column alignments.</p>

        <div class="playground-layout">
          <div class="settings-sidebar">
            <div class="setting-group">
              <label>Alignment Layout</label>
              <div class="btn-group">
                <button
                  class="layout-btn"
                  [class.active]="selectedLayout === 'horizontal'"
                  (click)="selectedLayout = 'horizontal'"
                >
                  Horizontal (Left-Right)
                </button>
                <button
                  class="layout-btn"
                  [class.active]="selectedLayout === 'vertical'"
                  (click)="selectedLayout = 'vertical'"
                >
                  Vertical (Stacked)
                </button>
              </div>
            </div>

            <div class="setting-group check-group">
              <label>
                <input type="checkbox" [(ngModel)]="stripedRows" /> Striped Table Rows
              </label>
            </div>

            <div class="setting-group check-group">
              <label>
                <input type="checkbox" [(ngModel)]="searchable" /> Show Search Filter Bar
              </label>
            </div>
          </div>

          <div class="display-board">
            <ngx-key-value-list
              [items]="metaItems"
              [layout]="selectedLayout"
              [striped]="stripedRows"
              [searchable]="searchable"
              (valueClick)="onPropertyClicked($event)"
            ></ngx-key-value-list>

            <div class="event-logs">
              <h4>Action Logs</h4>
              <div class="log-lines">
                @for (log of actionLogs(); track $index) {
                  <div class="log-line">{{ log }}</div>
                }
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Dark mode Showcase -->
      <section class="demo-section">
        <h2>Dark Theme Panel</h2>
        <div class="dark-box-bg">
          <ngx-key-value-list
            [items]="serverSpecs"
            layout="horizontal"
            [striped]="true"
            [searchable]="true"
            theme="dark"
          ></ngx-key-value-list>
        </div>
      </section>

      <!-- How to Use -->
      <section class="demo-section">
        <h2>How to Use</h2>
        <p class="section-desc">Import the standalone key-value property list component. Build a list of items of type <code>KeyValueItem[]</code> and customize layout/styling inputs.</p>
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

    /* Playground layout */
    .playground-layout {
      display: grid;
      grid-template-columns: 260px 1fr;
      gap: 24px;
      background: var(--bg-secondary, #f8fafc);
      padding: 24px;
      border-radius: 16px;
      border: 1px solid rgba(0, 0, 0, 0.04);
    }

    .settings-sidebar {
      background: white;
      padding: 16px;
      border-radius: 12px;
      border: 1px solid rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      gap: 20px;
      align-self: start;
    }

    .setting-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .setting-group label {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: 0.5px;
    }

    .btn-group {
      display: flex;
      flex-direction: column;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      overflow: hidden;
      gap: 1px;
      background: #e2e8f0;
    }

    .layout-btn {
      border: none;
      background: #f8fafc;
      padding: 10px;
      font-size: 12px;
      font-weight: 600;
      color: #475569;
      cursor: pointer;
      text-align: left;
      transition: all 0.2s ease;
    }

    .layout-btn.active {
      background: var(--primary-color, #3b82f6);
      color: white;
    }

    .check-group label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
    }

    /* Display Board */
    .display-board {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

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

    /* Dark Mode box */
    .dark-box-bg {
      background: linear-gradient(135deg, #0f111a 0%, #17192a 100%);
      padding: 32px;
      border-radius: 16px;
    }
  `]
})
export class KeyValueListDemoComponent {
  howToCode = `import { Component } from '@angular/core';
import { KeyValueListComponent, KeyValueItem } from 'ngx-core-components/views';

@Component({
  selector: 'app-my-specs',
  standalone: true,
  imports: [KeyValueListComponent],
  template: \`
    <ngx-key-value-list
      [items]="specs"
      layout="horizontal"
      [striped]="true"
      [searchable]="true"
    ></ngx-key-value-list>
  \`
})
export class MySpecsComponent {
  specs: KeyValueItem[] = [
    { key: 'version', value: 'v1.4.2', label: 'App Version', group: 'System Info', type: 'code' },
    { key: 'env', value: 'Production', label: 'Running Environment', group: 'System Info', type: 'badge', badgeVariant: 'success' },
    { key: 'db_url', value: 'postgres://localhost:5432/main', label: 'Database URL', group: 'Database Connections', copyable: true }
  ];
}`;

  selectedLayout: 'horizontal' | 'vertical' = 'horizontal';
  stripedRows = true;
  searchable = true;

  actionLogs = signal<string[]>([]);

  // Metadata properties list (grouped)
  metaItems: KeyValueItem[] = [
    { key: 'org_name', value: 'Google DeepMind Inc.', label: 'Organization Name', group: 'Profile Details', copyable: true },
    { key: 'tax_id', value: 'US-99881234', label: 'Federal Tax ID', group: 'Profile Details', type: 'code', copyable: true },
    { key: 'status', value: 'Active', label: 'Subscription Status', group: 'Account Status', type: 'badge', badgeVariant: 'success' },
    { key: 'tier', value: 'Enterprise Elite Plus', label: 'Access Tier', group: 'Account Status', copyable: false },
    { key: 'billing_period', value: 'Monthly Recurring', label: 'Billing Period', group: 'Account Status' },
    { key: 'support_email', value: 'vip-support@deepmind.com', label: 'Support Email', group: 'Contact Points', copyable: true },
    { key: 'emergency_hotline', value: '+1 (800) 555-0199', label: 'Hotline Contact', group: 'Contact Points', copyable: true }
  ];

  // Server specs details list (grouped)
  serverSpecs: KeyValueItem[] = [
    { key: 'host', value: 'prd-k8s-node-03.deepmind.internal', label: 'Server Hostname', group: 'Node Identity', copyable: true },
    { key: 'ip_addr', value: '10.240.14.88', label: 'Private IP', group: 'Node Identity', type: 'code', copyable: true },
    { key: 'cpu_cores', value: '64 vCPUs (AMD EPYC)', label: 'Total Compute Capacity', group: 'Resources Specs' },
    { key: 'ram', value: '256 GB ECC DDR5', label: 'Physical Memory RAM', group: 'Resources Specs' },
    { key: 'node_state', value: 'Online', label: 'Cluster State', group: 'Cluster Status', type: 'badge', badgeVariant: 'success' },
    { key: 'health_percent', value: '99.98% Healthy', label: 'Self Health Status', group: 'Cluster Status', type: 'badge', badgeVariant: 'info' }
  ];

  onPropertyClicked(event: { key: string; value: any }) {
    this.logEvent(`Row Click: Clicked property "${event.key}" with value "${event.value}"`);
  }

  logEvent(msg: string) {
    this.actionLogs.update(logs => [
      ...logs,
      `[${new Date().toLocaleTimeString()}] ${msg}`
    ].slice(-10));
  }
}
