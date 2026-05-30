import { Component, inject, signal } from '@angular/core';
import { BadgeComponent, ProgressBarComponent, SkeletonComponent, NotificationService, AlertComponent } from 'ngx-core-components/feedback';

interface ApiRow { name: string; type: string; default: string; description: string; }

@Component({
  selector: 'app-feedback-demo',
  standalone: true,
  imports: [BadgeComponent, ProgressBarComponent, SkeletonComponent, AlertComponent],
  template: `
    <div class="demo-page">
      <!-- Page Header -->
      <div class="page-header">
        <div class="page-header-text">
          <h1>Feedback Components</h1>
          <p>Badges, Progress Bars, Skeletons, and Notifications for communicating application state.</p>
        </div>
        <div class="header-badges">
          <span class="badge badge-purple">Badges</span>
          <span class="badge badge-purple">Progress</span>
          <span class="badge badge-purple">Skeleton</span>
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
          <div class="section-label">Badges — Inline</div>
          <div class="demo-row wrap">
            <ngx-badge content="Primary" variant="primary" />
            <ngx-badge content="Secondary" variant="secondary" />
            <ngx-badge content="Success ✓" variant="success" />
            <ngx-badge content="Danger ✕" variant="danger" />
            <ngx-badge content="Warning !" variant="warning" />
            <ngx-badge content="Info" variant="info" />
          </div>

          <div class="section-label">Positioned Badges</div>
          <div class="demo-row wrap">
            <ngx-badge content="5" variant="danger" [positioned]="true" position="top-right">
              <div class="badge-host">🔔 Notifications</div>
            </ngx-badge>
            <ngx-badge content="12" variant="primary" [positioned]="true" position="top-right">
              <div class="badge-host">📧 Messages</div>
            </ngx-badge>
            <ngx-badge [dot]="true" variant="success" [positioned]="true" position="top-right">
              <div class="badge-host">👤 Profile</div>
            </ngx-badge>
          </div>

          <div class="section-label">Progress Bars</div>
          <div class="progress-stack">
            <ngx-progress-bar [value]="75" label="Upload Progress" [showValue]="true" variant="primary" />
            <ngx-progress-bar [value]="90" label="Storage Used" [showValue]="true" variant="danger" />
            <ngx-progress-bar [value]="45" label="Tasks Complete" [showValue]="true" variant="success" />
            <ngx-progress-bar [value]="0" label="Loading..." [indeterminate]="true" variant="info" />
          </div>

          <div class="section-label">Skeleton Loaders</div>
          <div class="skeleton-grid">
            <div>
              <p class="demo-label">Text Lines</p>
              <ngx-skeleton shape="text" [lines]="['100%', '80%', '65%']" />
            </div>
            <div>
              <p class="demo-label">Avatar + Text</p>
              <div style="display:flex;gap:12px;align-items:flex-start">
                <ngx-skeleton shape="circle" [size]="48" />
                <div style="flex:1">
                  <ngx-skeleton shape="text" [lines]="['60%', '40%']" />
                </div>
              </div>
            </div>
            <div>
              <p class="demo-label">Card Skeleton</p>
              <ngx-skeleton shape="card" />
            </div>
          </div>

          <div class="section-label">Notifications / Toast</div>
          <div class="demo-row wrap">
            <button class="notif-btn success" (click)="showNotif('success')">✅ Success Toast</button>
            <button class="notif-btn error" (click)="showNotif('error')">❌ Error Toast</button>
            <button class="notif-btn info" (click)="showNotif('info')">ℹ️ Info Toast</button>
            <button class="notif-btn warning" (click)="showNotif('warning')">⚠️ Warning Toast</button>
          </div>

          <div class="section-label">Callout Alerts (ngx-alert)</div>
          <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
            <ngx-alert variant="info" title="Information Update" message="A new software update is available. Please review the changelog for details." actionLabel="Changelog" (actionClick)="logAlertAction('Changelog button clicked')" />
            <ngx-alert variant="success" title="Changes Saved" message="Your profile information has been successfully updated on our servers." [dismissible]="true" (dismissed)="logAlertAction('Success alert dismissed')" />
            <ngx-alert variant="warning" title="API Rate Limit Warning" message="You have used 85% of your API quota for this billing period." actionLabel="Upgrade Plan" (actionClick)="logAlertAction('Upgrade Plan clicked')" />
            <ngx-alert variant="error" title="Critical Server Issue" message="Failed to connect to the database. Retrying in 10 seconds." [dismissible]="false" />
          </div>
          <div class="value-display">
            Last Alert Event: {{ alertLog() || 'none' }}
          </div>

          <div class="section-label">How to Use</div>
          <pre style="margin:0;background:#1e1e1e;color:#d4d4d4;padding:16px;border-radius:8px;font-size:12px;line-height:1.5;overflow:auto">{{ howToCode }}</pre>
        </div>
      }

      <!-- ===== API REFERENCE ===== -->
      @if (activeTab() === 'API Reference') {
        <div class="tab-content">
          <div class="section-label">Badge</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input / Output</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of badgeApi; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>

          <div class="section-label">Progress Bar</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input / Output</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of progressApi; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>

          <div class="section-label">Skeleton</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input / Output</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of skeletonApi; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>

          <div class="section-label">NotificationService</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Method</th><th>Parameters</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of notificationApi; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>

          <div class="section-label">Alert</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input / Output</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of alertApi; track row.name) {
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
    .badge-purple { background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%); color: #7c3aed; border: 1px solid rgba(124, 58, 237, 0.1); }
    .tab-nav { display: flex; gap: 0; border-bottom: 2px solid #e9ecef; overflow-x: auto; padding-bottom: 0; }
    .tab-btn { padding: 12px 20px; background: none; border: none; font-size: 13px; font-weight: 500; color: #6c757d; cursor: pointer; border-bottom: 3px solid transparent; margin-bottom: -2px; font-family: inherit; transition: all 0.2s ease; white-space: nowrap; }
    .tab-btn:hover { color: #495057; background: rgba(26, 115, 232, 0.05); }
    .tab-btn.active { color: #1a73e8; border-bottom-color: #1a73e8; font-weight: 600; background: rgba(26, 115, 232, 0.04); }
    .tab-content { display: flex; flex-direction: column; gap: 20px; }
    .section-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; color: #8892a0; border-bottom: 2px solid #e9ecef; padding-bottom: 12px; }
    .demo-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
    .demo-row.wrap { flex-wrap: wrap; }
    .demo-label { font-size: 12px; font-weight: 600; color: #6c757d; margin: 0 0 8px; }
    .badge-host { padding: 8px 14px; background: #f1f3f5; border-radius: 6px; font-size: 13px; font-weight: 500; }
    .progress-stack { display: flex; flex-direction: column; gap: 14px; }
    .skeleton-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; }
    .api-table-wrap { overflow-x: auto; border: 1px solid #e9ecef; border-radius: 10px; }
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
    .notif-btn { padding: 8px 16px; font-size: 13px; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; background: #f1f3f5; color: #495057; transition: background 0.15s; }
    .notif-btn:hover { background: #e2e6ea; }
    .notif-btn.success { background: #d4edda; color: #155724; }
    .notif-btn.error { background: #f8d7da; color: #721c24; }
    .notif-btn.info { background: #d1ecf1; color: #0c5460; }
    .notif-btn.warning { background: #fff3cd; color: #856404; }
    .value-display { margin-top: 14px; padding: 12px 14px; background: var(--bg-primary, #f8fafc); border-radius: 8px; font-size: 12px; font-family: 'Courier New', monospace; color: var(--text-primary, #0f172a); border-left: 3px solid var(--primary-color, #1a73e8); transition: all 0.2s ease; margin-bottom: 24px; }
  `]
})
export class FeedbackDemoComponent {
  private notif = inject(NotificationService);
  activeTab = signal('Demo');
  tabs = ['Demo', 'API Reference'];
  alertLog = signal<string>('');

  logAlertAction(msg: string): void {
    this.alertLog.set(msg);
  }

  howToCode = `import { Component, inject } from '@angular/core';
import { BadgeComponent, ProgressBarComponent, AlertComponent, NotificationService } from 'ngx-core-components/feedback';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [BadgeComponent, ProgressBarComponent, AlertComponent],
  template: \`
    <ngx-badge content="5" variant="danger" />
    <ngx-progress-bar [value]="75" label="Upload" [showValue]="true" />
    <ngx-alert variant="success" title="Success" message="Done successfully!" />
  \`
})
export class ExampleComponent {
  private notifications = inject(NotificationService);
}`;

  badgeApi: ApiRow[] = [
    { name: 'content', type: 'string', default: 'undefined', description: 'Badge text or number content.' },
    { name: 'variant', type: "'primary'|'secondary'|'success'|'danger'|'warning'|'info'|'light'|'dark'", default: "'primary'", description: 'Badge color variant.' },
    { name: 'positioned', type: 'boolean', default: 'false', description: 'Position badge on top of child element.' },
    { name: 'position', type: "'top-left'|'top-right'|'bottom-left'|'bottom-right'", default: "'top-right'", description: 'Position when positioned=true.' },
    { name: 'dot', type: 'boolean', default: 'false', description: 'Show as dot indicator instead of with content.' },
  ];

  progressApi: ApiRow[] = [
    { name: 'value', type: 'number', default: '0', description: 'Progress percentage (0-100).' },
    { name: 'label', type: 'string', default: 'undefined', description: 'Label text above progress bar.' },
    { name: 'showValue', type: 'boolean', default: 'false', description: 'Display percentage on the bar.' },
    { name: 'variant', type: "'primary'|'success'|'danger'|'warning'|'info'", default: "'primary'", description: 'Color variant.' },
    { name: 'height', type: 'number', default: '8', description: 'Bar height in pixels.' },
    { name: 'indeterminate', type: 'boolean', default: 'false', description: 'Show animated indeterminate state.' },
  ];

  skeletonApi: ApiRow[] = [
    { name: 'shape', type: "'text'|'circle'|'rect'|'card'", default: "'text'", description: 'Type of skeleton placeholder.' },
    { name: 'lines', type: 'string[]', default: 'undefined', description: 'Line widths for text shape (% or px).' },
    { name: 'size', type: 'number', default: '40', description: 'Size for circle shape (diameter).' },
    { name: 'height', type: 'string', default: "'100%'", description: 'Height for rect shape.' },
    { name: 'count', type: 'number', default: '1', description: 'Number of skeleton items to display.' },
  ];

  notificationApi: ApiRow[] = [
    { name: 'show(config)', type: 'NotifyConfig', default: 'n/a', description: 'Display a notification toast with title, message, type, position, and duration.' },
    { name: 'success(msg, title?)', type: 'string', default: 'n/a', description: 'Show success notification.' },
    { name: 'error(msg, title?)', type: 'string', default: 'n/a', description: 'Show error notification.' },
    { name: 'info(msg, title?)', type: 'string', default: 'n/a', description: 'Show info notification.' },
    { name: 'warning(msg, title?)', type: 'string', default: 'n/a', description: 'Show warning notification.' },
    { name: 'dismissAll()', type: 'void', default: 'n/a', description: 'Close all active notifications.' },
  ];

  alertApi: ApiRow[] = [
    { name: 'variant', type: "'info' | 'success' | 'warning' | 'error'", default: "'info'", description: 'Alert styling variant.' },
    { name: 'title', type: 'string', default: "''", description: 'Bold header text displayed above the message.' },
    { name: 'message', type: 'string', default: "''", description: 'Body text content.' },
    { name: 'dismissible', type: 'boolean', default: 'true', description: 'Shows close button for dismissing.' },
    { name: 'actionLabel', type: 'string', default: "''", description: 'Text label for secondary action button.' },
    { name: 'theme', type: "'light' | 'dark'", default: "'light'", description: 'Alert theme styling variant.' },
    { name: '(dismissed)', type: 'void', default: '—', description: 'Emitted after alert dismissal animation completes.' },
    { name: '(actionClick)', type: 'void', default: '—', description: 'Emitted when action button is clicked.' },
  ];

  showNotif(type: 'success' | 'error' | 'info' | 'warning'): void {
    const msgs: Record<string, string> = {
      success: 'Operation completed successfully!',
      error: 'An error occurred. Please try again.',
      info: 'Here is some helpful information.',
      warning: 'Proceed with caution — this action is irreversible.'
    };
    const titles: Record<string, string> = { success: 'Success', error: 'Error', info: 'Info', warning: 'Warning' };
    this.notif.show({ message: msgs[type], title: titles[type], type, position: 'top-right' });
  }
}
