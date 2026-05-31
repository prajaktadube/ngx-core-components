import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmptyStateComponent } from 'ngx-core-components/feedback';

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

      <!-- How to Use -->
      <section class="demo-section">
        <h2>How to Use</h2>
        <p class="section-desc">Import the standalone empty state component. Customize title, description, illustration presets (search, data, chat, error) or project your own media.</p>
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
  `]
})
export class EmptyStateDemoComponent {
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

  onAction(msg: string) {
    this.actionLogs.update(logs => [
      ...logs,
      `[${new Date().toLocaleTimeString()}] Clicked: ${msg}`
    ].slice(-10));
  }
}
