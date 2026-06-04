import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagInputComponent } from 'ngx-core-components/inputs';

interface ApiRow { name: string; type: string; default: string; description: string; }

@Component({
  selector: 'app-tag-input-demo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TagInputComponent],
  template: `
    <div class="demo-page">
      <header class="demo-header">
        <h1>🏷️ Tag Input</h1>
        <p>
          Chip-based tag/label input. Press <kbd>Enter</kbd> or <kbd>,</kbd> to add a tag.
          Press <kbd>Backspace</kbd> on an empty input to remove the last tag.
        </p>
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
          <!-- Basic -->
          <section class="demo-section">
            <h2>Basic Tag Input</h2>
            <p class="section-desc">Free-form tag entry. Type a value and press Enter or comma.</p>
            <div class="demo-card">
              <label class="field-label">Technologies</label>
              <ngx-tag-input
                placeholder="Add technology..."
                (tagsChange)="basicTags.set($event)"
              ></ngx-tag-input>
              <div class="preview">
                <strong>Tags:</strong>
                <span class="tag-list">{{ basicTags().join(', ') || '(none)' }}</span>
              </div>
            </div>
          </section>

          <!-- Pre-populated -->
          <section class="demo-section">
            <h2>Pre-populated Tags</h2>
            <p class="section-desc">Pass initial tags via the <code>tags</code> input. The component manages internal state independently.</p>
            <div class="demo-card">
              <label class="field-label">Project Labels</label>
              <ngx-tag-input
                [tags]="initialTags"
                placeholder="Add label..."
                (tagsChange)="projectTags.set($event)"
              ></ngx-tag-input>
              <div class="preview">
                <strong>Selected:</strong>
                <span class="tag-list">{{ projectTags().join(', ') }}</span>
              </div>
            </div>
          </section>

          <!-- Max tags -->
          <section class="demo-section">
            <h2>Max Tag Limit</h2>
            <p class="section-desc">Once the limit is reached, the input is hidden and a hint is shown.</p>
            <div class="demo-card">
              <label class="field-label">Priority Skills (max 3)</label>
              <ngx-tag-input
                [maxTags]="3"
                placeholder="Add skill..."
                (tagsChange)="limitedTags.set($event)"
              ></ngx-tag-input>
              <div class="preview">
                <strong>Count:</strong>
                <span class="tag-badge">{{ limitedTags().length }}/3</span>
              </div>
            </div>
          </section>

          <!-- No duplicates -->
          <section class="demo-section">
            <h2>Duplicate Prevention</h2>
            <div class="side-by-side">
              <div class="demo-card">
                <label class="field-label">Unique Only (default)</label>
                <ngx-tag-input
                  placeholder="Try typing 'react' twice..."
                  (tagsChange)="uniqueTags.set($event)"
                ></ngx-tag-input>
              </div>
              <div class="demo-card">
                <label class="field-label">Allow Duplicates</label>
                <ngx-tag-input
                  [allowDuplicates]="true"
                  placeholder="Duplicates allowed here..."
                  (tagsChange)="dupeTags.set($event)"
                ></ngx-tag-input>
              </div>
            </div>
          </section>

          <!-- Disabled -->
          <section class="demo-section">
            <h2>Disabled State</h2>
            <div class="demo-card">
              <label class="field-label">Read-only Tags</label>
              <ngx-tag-input
                [tags]="readonlyTags"
                [disabled]="true"
                placeholder="Cannot add more..."
              ></ngx-tag-input>
            </div>
          </section>

          <!-- Event log -->
          <section class="demo-section">
            <h2>Event Log</h2>
            <p class="section-desc">tagAdded and tagRemoved events fire on every mutation.</p>
            <div class="demo-card">
              <label class="field-label">Event Source</label>
              <ngx-tag-input
                placeholder="Add or remove tags to see events..."
                (tagAdded)="logEvent('tagAdded', $event)"
                (tagRemoved)="logEvent('tagRemoved', $event)"
              ></ngx-tag-input>

              <div class="event-log">
                @if (eventLog().length === 0) {
                  <p class="log-empty">No events yet — add or remove a tag above.</p>
                }
                @for (entry of eventLog(); track $index) {
                  <div class="log-entry" [class.added]="entry.type === 'tagAdded'" [class.removed]="entry.type === 'tagRemoved'">
                    <span class="log-icon">{{ entry.type === 'tagAdded' ? '➕' : '➖' }}</span>
                    <span class="log-type">{{ entry.type }}</span>
                    <span class="log-value">{{ entry.value }}</span>
                    <span class="log-time">{{ entry.time }}</span>
                  </div>
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
          <div class="section-label">Tag Input Component (ngx-tag-input)</div>
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
      max-width: 820px;
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

    kbd {
      background: var(--bg-secondary, #f1f5f9);
      border: 1px solid var(--border-color, #cbd5e1);
      border-radius: 4px;
      padding: 1px 5px;
      font-size: 12px;
      font-family: monospace;
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
      margin: 0 0 16px;
    }

    .section-desc code {
      background: var(--bg-secondary, #f1f5f9);
      padding: 1px 5px;
      border-radius: 4px;
      font-size: 12px;
      font-family: monospace;
    }

    .demo-card {
      background: var(--bg-secondary, #f8fafc);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 12px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .field-label {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-secondary, #64748b);
    }

    .preview {
      font-size: 13px;
      color: var(--text-secondary, #64748b);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .tag-list {
      color: var(--text-primary, #0f172a);
      font-weight: 500;
    }

    .tag-badge {
      background: var(--primary-color, #4f46e5);
      color: #fff;
      padding: 2px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
    }

    .side-by-side {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .event-log {
      display: flex;
      flex-direction: column;
      gap: 6px;
      max-height: 200px;
      overflow-y: auto;
    }

    .log-empty {
      font-size: 13px;
      color: var(--text-secondary, #94a3b8);
      font-style: italic;
      margin: 0;
      padding: 8px 0;
    }

    .log-entry {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 12px;
      animation: log-in 0.15s ease;
    }

    @keyframes log-in {
      from { opacity: 0; transform: translateX(-6px); }
      to   { opacity: 1; transform: translateX(0); }
    }

    .log-entry.added   { background: #f0fdf4; border: 1px solid #bbf7d0; }
    .log-entry.removed { background: #fef2f2; border: 1px solid #fecaca; }

    .log-icon { font-size: 14px; }

    .log-type {
      font-weight: 700;
      color: var(--text-primary, #0f172a);
    }

    .log-value {
      flex: 1;
      color: var(--text-secondary, #64748b);
      font-family: monospace;
    }

    .log-time {
      color: var(--text-secondary, #94a3b8);
      font-size: 11px;
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

    @media (max-width: 600px) {
      .side-by-side { grid-template-columns: 1fr; }
    }
  `]
})
export class TagInputDemoComponent {
  activeTab = signal('Demo');
  tabs = ['Demo', 'API Reference'];

  howToCode = `import { Component, signal } from '@angular/core';
import { TagInputComponent } from 'ngx-core-components/inputs';

@Component({
  selector: 'app-my-tags',
  standalone: true,
  imports: [TagInputComponent],
  template: \`
    <ngx-tag-input
      [tags]="initialTags"
      placeholder="Press Enter to add tag..."
      [maxTags]="10"
      [allowDuplicates]="false"
      (tagsChange)="onTagsChanged($event)"
    ></ngx-tag-input>
  \`
})
export class MyTagsComponent {
  initialTags = ['angular', 'signals'];

  onTagsChanged(tags: string[]) {
    console.log('Current tags:', tags);
  }
}`;

  basicTags   = signal<string[]>([]);
  projectTags = signal<string[]>(['frontend', 'angular', 'ux']);
  limitedTags = signal<string[]>([]);
  uniqueTags  = signal<string[]>([]);
  dupeTags    = signal<string[]>([]);

  initialTags = ['frontend', 'angular', 'ux'];
  readonlyTags = ['design-system', 'accessibility', 'i18n', 'rtl'];

  eventLog = signal<Array<{ type: string; value: string; time: string }>>([]);

  apiRef: ApiRow[] = [
    { name: 'tags', type: 'InputSignal<string[]>', default: '[]', description: 'Pre-populated initial list of tag strings.' },
    { name: 'placeholder', type: 'InputSignal<string>', default: "'Add tag...'", description: 'Placeholder label when input box is empty.' },
    { name: 'maxTags', type: 'InputSignal<number>', default: '20', description: 'Upper boundary count limit. Restricts input box when reached.' },
    { name: 'allowDuplicates', type: 'InputSignal<boolean>', default: 'false', description: 'Enables or restricts typing identical tags.' },
    { name: 'disabled', type: 'InputSignal<boolean>', default: 'false', description: 'Read-only state blocking all edits, chip removals, and input entry.' },
    { name: 'theme', type: "InputSignal<'light' | 'dark'>", default: "'light'", description: 'Styling appearance theme.' },
    { name: 'tagsChange', type: 'OutputEmitterRef<string[]>', default: 'output()', description: 'Emits the updated collection of tag strings on any change.' },
    { name: 'tagAdded', type: 'OutputEmitterRef<string>', default: 'output()', description: 'Emits the individual tag string when it gets successfully added.' },
    { name: 'tagRemoved', type: 'OutputEmitterRef<string>', default: 'output()', description: 'Emits the individual tag string when it gets successfully deleted.' }
  ];

  logEvent(type: string, value: string): void {
    const now = new Date().toLocaleTimeString();
    this.eventLog.update(log => [{ type, value, time: now }, ...log].slice(0, 20));
  }
}

