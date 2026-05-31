import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DrawerComponent } from 'ngx-core-components/layout';

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

      <!-- How to Use -->
      <section class="demo-section">
        <h2>How to Use</h2>
        <p class="section-desc">Import the standalone drawer component and control its state with a two-way signal binding: <code>[(isOpen)]</code>.</p>
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
  `]
})
export class DrawerDemoComponent {
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
