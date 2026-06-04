import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmptyStateComponent } from 'ngx-core-components/feedback';

interface ApiRow { name: string; type: string; default: string; description: string; }

@Component({
  selector: 'app-empty-state-demo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, EmptyStateComponent],
  template: `
    <div class="demo-page">
      <header class="demo-header">
        <h1>📭 Empty State Placeholders</h1>
        <p>A beautiful visual fallback placeholder. Used for empty tables, search queries with no results, messaging channels, and system alerts.</p>
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
          <!-- Search Preset Showcase -->
          <section class="demo-section">
            <h2>No Search Results Preset</h2>
            <p class="section-desc">Visual placeholder shown when custom filters yield 0 records.</p>
            <div class="state-card-wrapper">
              <ngx-empty-state
                title="No Results Found"
                description="We couldn't find any documents matching your filters. Try checking the spelling or resetting query words."
                illustration="search"
                primaryActionText="Reset Search Filters"
                secondaryActionText="Read Search Docs"
                (primaryAction)="onAction('Reset Filters Clicked')"
                (secondaryAction)="onAction('Read Docs Clicked')"
              ></ngx-empty-state>
            </div>
          </section>

          <!-- Database Preset Showcase -->
          <section class="demo-section">
            <h2>Empty Database/Repository Preset</h2>
            <p class="section-desc">Placeholder used when workspaces contain no records or files.</p>
            <div class="state-card-wrapper">
              <ngx-empty-state
                title="Database is Empty"
                description="Get started by uploading your first relational schema or JSON data dump file."
                illustration="data"
                primaryActionText="Import Data Schema"
                (primaryAction)="onAction('Import Schema Clicked')"
              ></ngx-empty-state>
            </div>
          </section>

          <!-- Chat and Connection Errors Preset Showcase -->
          <section class="demo-section">
            <h2>Chat Channels & Error Alerts Presets</h2>
            <div class="state-grid-two">
              <div class="grid-card">
                <span>Conversations Placeholder</span>
                <ngx-empty-state
                  title="No Messages Yet"
                  description="Start a chat conversation by choosing a developer node on the left dashboard."
                  illustration="chat"
                  primaryActionText="Start Chat"
                  (primaryAction)="onAction('Start Chat Clicked')"
                ></ngx-empty-state>
              </div>
              <div class="grid-card">
                <span>Security Warning Preset</span>
                <ngx-empty-state
                  title="Network Link Interrupted"
                  description="A critical handshake exception blocked proxy routing. Try flushing cache nodes."
                  illustration="error"
                  primaryActionText="Retry Connection"
                  (primaryAction)="onAction('Retry Clicked')"
                ></ngx-empty-state>
              </div>
            </div>
          </section>

          <!-- Custom illustration projection -->
          <section class="demo-section">
            <h2>Custom illustration media projection</h2>
            <p class="section-desc">Project arbitrary illustrations (e.g. custom visual templates or emojis) using the <code>[empty-media]</code> attribute selector slot.</p>
            <div class="state-card-wrapper">
              <ngx-empty-state
                title="Inbox Zero Accomplished"
                description="Fantastic job! You've cleaned all backlog tickets for the current active sprint cycle."
                illustration="none"
                primaryActionText="Archive Sprint Logs"
                (primaryAction)="onAction('Archive Clicked')"
              >
                <!-- Custom illustration projected -->
                <div empty-media class="emoji-media">🎉</div>
              </ngx-empty-state>
            </div>
          </section>

          <!-- Dark Theme Showcase -->
          <section class="demo-section">
            <h2>Dark Theme Showcase</h2>
            <div class="dark-box-bg">
              <ngx-empty-state
                title="No Nodes Configured"
                description="Choose clusters and microservices to attach endpoints to the gateway proxy configuration dashboard."
                illustration="data"
                primaryActionText="Configure Node Cluster"
                theme="dark"
                (primaryAction)="onAction('Dark Mode Action Clicked')"
              ></ngx-empty-state>
            </div>
          </section>

          <!-- Action logs -->
          <section class="demo-section">
            <h2>Action Event Tracker</h2>
            <div class="event-logs">
              <h4>Event Log Stream</h4>
              <div class="log-lines">
                @for (log of actionLogs(); track $index) {
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
          <div class="section-label">Empty State Component (ngx-empty-state)</div>
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

    .state-card-wrapper {
      width: 100%;
      background: white;
      padding: 24px;
      border-radius: 16px;
      border: 1px solid rgba(0, 0, 0, 0.04);
      box-sizing: border-box;
    }

    /* Grid layout */
    .state-grid-two {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
      gap: 20px;
    }

    .grid-card {
      display: flex;
      flex-direction: column;
      gap: 8px;
      background: white;
      padding: 20px;
      border-radius: 16px;
      border: 1px solid rgba(0, 0, 0, 0.04);
    }

    .grid-card span {
      font-size: 12px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
    }

    /* Emoji illustration */
    .emoji-media {
      font-size: 54px;
      line-height: 1;
      animation: emojiPulse 2s infinite ease-in-out;
    }

    @keyframes emojiPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.08); }
    }

    /* Dark Mode box */
    .dark-box-bg {
      background: linear-gradient(135deg, #0f111a 0%, #17192a 100%);
      padding: 40px;
      border-radius: 16px;
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
export class EmptyStateDemoComponent {
  activeTab = signal('Demo');
  tabs = ['Demo', 'API Reference'];

  howToCode = `import { Component } from '@angular/core';
import { EmptyStateComponent } from 'ngx-core-components/feedback';

@Component({
  selector: 'app-my-empty-view',
  standalone: true,
  imports: [EmptyStateComponent],
  template: \`
    <!-- Preset Illustration -->
    <ngx-empty-state
      title="No Orders Available"
      description="You haven't placed any orders yet."
      illustration="data"
      primaryActionText="Create Order"
      (primaryAction)="navigateToCreate()"
    ></ngx-empty-state>

    <!-- Custom projected media -->
    <ngx-empty-state title="Inbox Clear" description="All caught up!" illustration="none">
      <div empty-media style="font-size: 48px;">📬</div>
    </ngx-empty-state>
  \`
})
export class MyEmptyViewComponent {
  navigateToCreate() {
    // Action details...
  }
}`;

  actionLogs = signal<string[]>([]);

  apiRef: ApiRow[] = [
    { name: 'title', type: 'InputSignal<string> (Required)', default: 'N/A', description: 'Header title text to display in bold.' },
    { name: 'description', type: 'InputSignal<string>', default: "''", description: 'Detailed visual explanation text.' },
    { name: 'illustration', type: "InputSignal<'search' | 'data' | 'chat' | 'error' | 'none'>", default: "'data'", description: 'Preset SVG outline template illustration to display.' },
    { name: 'primaryActionText', type: 'InputSignal<string>', default: "''", description: 'Button text for the main CTA action. Button is not rendered if omitted.' },
    { name: 'secondaryActionText', type: 'InputSignal<string>', default: "''", description: 'Button text for the secondary actions. Button is not rendered if omitted.' },
    { name: 'theme', type: "InputSignal<'light' | 'dark'>", default: "'light'", description: 'Styling appearance theme.' },
    { name: 'id', type: 'InputSignal<string>', default: "'ngx-empty-state-[random]'", description: 'Unique element identifier.' },
    { name: 'primaryAction', type: 'OutputEmitterRef<void>', default: 'output()', description: 'Event emitted when the primary CTA action button is clicked.' },
    { name: 'secondaryAction', type: 'OutputEmitterRef<void>', default: 'output()', description: 'Event emitted when the secondary action button is clicked.' }
  ];

  onAction(msg: string) {
    this.actionLogs.update(logs => [
      ...logs,
      `[${new Date().toLocaleTimeString()}] Clicked: ${msg}`
    ].slice(-10));
  }
}

