import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KeyValueListComponent, KeyValueItem } from 'ngx-core-components/views';

interface ApiRow { name: string; type: string; default: string; description: string; }

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

      <!-- TAB NAV -->
      <div class="tab-nav">
        @for (tab of tabs; track tab) {
          <button class="tab-btn" [class.active]="activeTab() === tab" (click)="activeTab.set(tab)">{{ tab }}</button>
        }
      </div>

      <!-- ===== DEMO ===== -->
      @if (activeTab() === 'Demo') {
        <div class="tab-content">
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

          <div class="section-label">How to Use</div>
          <pre class="code-block">{{ howToCode }}</pre>
        </div>
      }

      <!-- ===== API REFERENCE ===== -->
      @if (activeTab() === 'API Reference') {
        <div class="tab-content">
          <div class="section-label">Key-Value List Component (ngx-key-value-list)</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Property</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of apiRef; track row.name) {
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
    :host { display: block; }

    .demo-page {
      max-width: 960px;
      margin: 0 auto;
      padding: 32px 24px 80px;
    }

    .demo-header {
      margin-bottom: 24px;
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

    .tab-nav { display: flex; gap: 0; border-bottom: 2px solid #e9ecef; overflow-x: auto; padding-bottom: 0; margin-bottom: 24px; }
    .tab-btn { padding: 12px 20px; background: none; border: none; font-size: 13px; font-weight: 500; color: #6c757d; cursor: pointer; border-bottom: 3px solid transparent; margin-bottom: -2px; font-family: inherit; transition: all 0.2s ease; white-space: nowrap; }
    .tab-btn:hover { color: #495057; background: rgba(26, 115, 232, 0.05); }
    .tab-btn.active { color: #1a73e8; border-bottom-color: #1a73e8; font-weight: 600; background: rgba(26, 115, 232, 0.04); }
    .tab-content { display: flex; flex-direction: column; gap: 20px; }

    .demo-section {
      margin-bottom: 20px;
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
export class KeyValueListDemoComponent {
  activeTab = signal('Demo');
  tabs = ['Demo', 'API Reference'];

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

  apiRef: ApiRow[] = [
    { name: 'items', type: 'InputSignal<KeyValueItem[]>', default: '[]', description: 'List of items to render. Each KeyValueItem supports groups, labels, badge layouts, code styles, and text-copy actions.' },
    { name: 'layout', type: "InputSignal<'horizontal' | 'vertical'>", default: "'horizontal'", description: 'Sets standard left-to-right columns or vertical layout blocks.' },
    { name: 'striped', type: 'InputSignal<boolean>', default: 'false', description: 'Displays zebra-striping colors on alternating rows.' },
    { name: 'searchable', type: 'InputSignal<boolean>', default: 'false', description: 'Renders an interactive search input to filter items by label/value details.' },
    { name: 'theme', type: "InputSignal<'light' | 'dark'>", default: "'light'", description: 'Styling appearance theme.' },
    { name: 'id', type: 'InputSignal<string>', default: "'ngx-kv-list-[random]'", description: 'Unique element identifier.' },
    { name: 'valueClick', type: 'OutputEmitterRef<{ key: string; value: any }>', default: 'output()', description: 'Emits key and value details when any property list item is clicked.' }
  ];

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

