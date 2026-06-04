import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DrawerComponent } from 'ngx-core-components/layout';

interface ApiRow { name: string; type: string; default: string; description: string; }

@Component({
  selector: 'app-drawer-demo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, DrawerComponent],
  template: `
    <div class="demo-page">
      <header class="demo-header">
        <h1>🚪 Side Drawer Panel</h1>
        <p>A slide-out container panel sliding from any edge. Excellent for side navigations, details forms, settings menus, and filters sheets.</p>
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
          <!-- Layout controls and placement options -->
          <section class="demo-section">
            <h2>Placements & Triggers</h2>
            <p class="section-desc">Try drawers sliding from left, right, top, or bottom. Click a trigger to open.</p>
            
            <div class="triggers-grid">
              <button class="trigger-btn position-btn" (click)="openDrawer('left')">⬅️ Slide from Left</button>
              <button class="trigger-btn position-btn" (click)="openDrawer('right')">➡️ Slide from Right</button>
              <button class="trigger-btn position-btn" (click)="openDrawer('top')">⬆️ Slide from Top</button>
              <button class="trigger-btn position-btn" (click)="openDrawer('bottom')">⬇️ Slide from Bottom</button>
            </div>
          </section>

          <!-- Custom Sizing and Form details drawer -->
          <section class="demo-section">
            <h2>Interactive Form Sheet Integration</h2>
            <p class="section-desc">Open a mock detail form inside a custom-sized drawer panel.</p>
            
            <div class="form-showcase-box">
              <button class="trigger-btn primary-btn" (click)="isFormDrawerOpen.set(true)">
                📋 Open Create User Form Sheet (450px)
              </button>
            </div>
          </section>

          <!-- Dark Theme Showcase -->
          <section class="demo-section">
            <h2>Dark Theme Drawer</h2>
            <p class="section-desc">Open a dark themed settings panel.</p>
            <div class="dark-showcase-box">
              <button class="trigger-btn dark-btn" (click)="isDarkDrawerOpen.set(true)">
                🌙 Open Dark Mode System Panel
              </button>
            </div>
          </section>

          <!-- Event Monitor -->
          <section class="demo-section">
            <h2>Event monitor</h2>
            <div class="event-logs">
              <h4>Event Log Stream</h4>
              <div class="log-lines">
                @for (log of eventLogs(); track $index) {
                  <div class="log-line">{{ log }}</div>
                }
              </div>
            </div>
          </section>

          <div class="section-label">How to Use</div>
          <pre class="code-block">{{ howToCode }}</pre>
        </div>
      }

      <!-- ===== API REFERENCE ===== -->
      @if (activeTab() === 'API Reference') {
        <div class="tab-content">
          <div class="section-label">Drawer Component (ngx-drawer)</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Property</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of drawerApi; track row.name) {
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

      <!-- Drawers containers -->

      <!-- Placement Drawer -->
      <ngx-drawer
        [(isOpen)]="isPlacementDrawerOpen"
        [position]="drawerPosition()"
        title="Placement Showcase"
        [size]="'320px'"
        (close)="logEvent('Placement Drawer Closed')"
      >
        <div class="demo-drawer-content">
          <h3>Hello!</h3>
          <p>This drawer is sliding from the <strong>{{ drawerPosition().toUpperCase() }}</strong> edge.</p>
          <p class="helper-text">You can click the backdrop blur or press <code>Esc</code> key to dismiss me automatically.</p>
          <button class="dismiss-btn" (click)="isPlacementDrawerOpen.set(false)">Understood, Close</button>
        </div>
      </ngx-drawer>

      <!-- Form Sheet Drawer -->
      <ngx-drawer
        [(isOpen)]="isFormDrawerOpen"
        position="right"
        size="450px"
        title="Create New Account"
        (close)="logEvent('Form Sheet Drawer Closed')"
      >
        <div class="form-drawer-body">
          <div class="form-field">
            <label>Full Name</label>
            <input type="text" placeholder="John Doe" class="demo-input" />
          </div>
          <div class="form-field">
            <label>Email Address</label>
            <input type="email" placeholder="john.doe@enterprise.com" class="demo-input" />
          </div>
          <div class="form-field">
            <label>Account Role</label>
            <select class="demo-input">
              <option>Administrator</option>
              <option>Developer</option>
              <option>Project Manager</option>
              <option>Guest Analyst</option>
            </select>
          </div>
          <div class="form-field checkbox-field">
            <label>
              <input type="checkbox" /> Enable security multi-factor auth (MFA)
            </label>
          </div>
        </div>

        <div drawer-footer class="form-drawer-footer-actions">
          <button class="footer-btn cancel-btn" (click)="isFormDrawerOpen.set(false)">Cancel</button>
          <button class="footer-btn save-btn" (click)="saveForm()">Save Changes</button>
        </div>
      </ngx-drawer>

      <!-- Dark Mode Drawer -->
      <ngx-drawer
        [(isOpen)]="isDarkDrawerOpen"
        position="left"
        size="380px"
        title="System Controls"
        theme="dark"
        (close)="logEvent('Dark Theme Drawer Closed')"
      >
        <div class="dark-drawer-content">
          <h4>Status Monitor</h4>
          <div class="status-indicator-list">
            <div class="status-item">
              <span>Database Cluster</span>
              <span class="badge badge-success">Online</span>
            </div>
            <div class="status-item">
              <span>CDN Proxy Cache</span>
              <span class="badge badge-success">Active</span>
            </div>
            <div class="status-item">
              <span>Kafka Message Broker</span>
              <span class="badge badge-warning">Degraded</span>
            </div>
          </div>

          <h4 style="margin-top: 24px;">Quick Actions</h4>
          <button class="quick-action-button" (click)="triggerTaskSim('Sync S3 Files')">🔄 Force S3 Assets Sync</button>
          <button class="quick-action-button" (click)="triggerTaskSim('Flush Redis Cache')">🔄 Flush Memory Cache</button>
        </div>
      </ngx-drawer>
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

    /* Grid layout */
    .triggers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
    }

    .trigger-btn {
      padding: 12px 20px;
      font-size: 14px;
      font-weight: 600;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      background: white;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: center;
    }

    .trigger-btn:hover {
      background: #f8fafc;
      transform: translateY(-1px);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }

    .trigger-btn.primary-btn {
      background: var(--primary-color, #3b82f6);
      color: white;
      border-color: var(--primary-color, #3b82f6);
    }

    .trigger-btn.primary-btn:hover {
      opacity: 0.9;
    }

    .trigger-btn.dark-btn {
      background: #0f172a;
      color: white;
      border-color: #0f172a;
    }

    .trigger-btn.dark-btn:hover {
      background: #1e293b;
    }

    /* Showcase boxes */
    .form-showcase-box,
    .dark-showcase-box {
      background: white;
      padding: 24px;
      border-radius: 12px;
      border: 1px solid rgba(0, 0, 0, 0.05);
      display: flex;
    }

    .dark-showcase-box {
      background: #0f111a;
      border-color: rgba(255, 255, 255, 0.05);
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

    /* Drawer contents */
    .demo-drawer-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .helper-text {
      font-size: 12px;
      color: #64748b;
      line-height: 1.4;
    }

    .dismiss-btn {
      border: none;
      background: #e2e8f0;
      color: #334155;
      padding: 10px;
      font-weight: 600;
      font-size: 13px;
      border-radius: 6px;
      cursor: pointer;
      margin-top: 12px;
    }

    .dismiss-btn:hover {
      background: #cbd5e1;
    }

    /* Forms */
    .form-drawer-body {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-field label {
      font-size: 12px;
      font-weight: 600;
      color: #475569;
    }

    .demo-input {
      padding: 10px 12px;
      border-radius: 6px;
      border: 1px solid #cbd5e1;
      font-size: 13px;
      outline: none;
    }

    .demo-input:focus {
      border-color: var(--primary-color, #3b82f6);
    }

    .checkbox-field label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      cursor: pointer;
    }

    .form-drawer-footer-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      width: 100%;
    }

    .footer-btn {
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      border: none;
    }

    .footer-btn.cancel-btn {
      background: #f1f5f9;
      color: #475569;
    }

    .footer-btn.save-btn {
      background: var(--primary-color, #3b82f6);
      color: white;
    }

    /* Dark Mode drawer content */
    .dark-drawer-content h4 {
      margin: 0 0 12px 0;
      font-size: 13px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-indicator-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .status-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
    }

    .badge {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .badge-success {
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
    }

    .badge-warning {
      background: rgba(245, 158, 11, 0.15);
      color: #f59e0b;
    }

    .quick-action-button {
      width: 100%;
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(255, 255, 255, 0.04);
      color: #e2e8f0;
      text-align: left;
      padding: 10px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      margin-bottom: 8px;
      transition: all 0.2s ease;
    }

    .quick-action-button:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.15);
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
export class DrawerDemoComponent {
  activeTab = signal('Demo');
  tabs = ['Demo', 'API Reference'];

  isPlacementDrawerOpen = signal(false);
  isFormDrawerOpen = signal(false);
  isDarkDrawerOpen = signal(false);

  howToCode = `import { Component, signal } from '@angular/core';
import { DrawerComponent } from 'ngx-core-components/layout';

@Component({
  selector: 'app-my-drawer',
  standalone: true,
  imports: [DrawerComponent],
  template: \`
    <button (click)="isDrawerOpen.set(true)">Open Drawer</button>

    <ngx-drawer
      [(isOpen)]="isDrawerOpen"
      position="right"
      size="380px"
      title="User Profile"
    >
      <div class="profile-details">
        <p>Email: user@example.com</p>
      </div>

      <!-- Optional footer projection -->
      <div drawer-footer>
        <button (click)="isDrawerOpen.set(false)">Close</button>
      </div>
    </ngx-drawer>
  \`
})
export class MyDrawerComponent {
  isDrawerOpen = signal(false);
}`;

  drawerPosition = signal<'left' | 'right' | 'top' | 'bottom'>('right');
  eventLogs = signal<string[]>([]);

  drawerApi: ApiRow[] = [
    { name: 'isOpen', type: 'ModelSignal<boolean>', default: 'false', description: 'Supports two-way binding [(isOpen)]. Controls drawer visibility state.' },
    { name: 'position', type: "'left' | 'right' | 'top' | 'bottom'", default: "'right'", description: 'The edge of screen from which the drawer slides out.' },
    { name: 'size', type: 'string', default: "'380px'", description: 'Width for horizontal layouts, or height for vertical layouts. Can be px, %, etc.' },
    { name: 'closeOnBackdrop', type: 'boolean', default: 'true', description: 'Whether clicking the blurred backdrop will trigger close event and hide the drawer.' },
    { name: 'closeOnEscape', type: 'boolean', default: 'true', description: 'Whether pressing the escape (Esc) key will trigger close event and hide the drawer.' },
    { name: 'theme', type: "'light' | 'dark'", default: "'light'", description: 'Visual color theme for panel contents and backdrop.' },
    { name: 'title', type: 'string', default: "''", description: 'Header title text. Ignored if a custom header is projected via [drawer-header].' },
    { name: 'close', type: 'OutputEmitterRef<void>', default: 'output()', description: 'Event fired when drawer is closed via close button, backdrop click, or ESC key.' }
  ];

  openDrawer(pos: 'left' | 'right' | 'top' | 'bottom') {
    this.drawerPosition.set(pos);
    this.isPlacementDrawerOpen.set(true);
    this.logEvent(`Opened Placement Showcase Drawer at [${pos}]`);
  }

  saveForm() {
    this.isFormDrawerOpen.set(false);
    this.logEvent('Simulated: Created account and closed form sheet');
  }

  triggerTaskSim(taskName: string) {
    this.logEvent(`Triggered Remote Process: "${taskName}"`);
  }

  logEvent(msg: string) {
    this.eventLogs.update(logs => [
      ...logs,
      `[${new Date().toLocaleTimeString()}] ${msg}`
    ].slice(-10));
  }
}

