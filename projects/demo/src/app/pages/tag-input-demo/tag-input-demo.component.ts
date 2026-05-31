import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagInputComponent } from 'ngx-core-components/inputs';

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

      <!-- How to Use -->
      <section class="demo-section">
        <h2>How to Use</h2>
        <p class="section-desc">Import the standalone tag-input chip entry component. Configure parameters like duplicate prevention, max tag limits, and track output updates.</p>
        <pre style="margin: 0; background: #0f172a; color: #38bdf8; padding: 18px 24px; border-radius: 12px; font-size: 13px; line-height: 1.6; overflow: auto; border: 1px solid rgba(255,255,255,0.06); font-family: monospace;">{{ howToCode }}</pre>
      </section>
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

    kbd {
      background: var(--bg-secondary, #f1f5f9);
      border: 1px solid var(--border-color, #cbd5e1);
      border-radius: 4px;
      padding: 1px 5px;
      font-size: 12px;
      font-family: monospace;
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

    @media (max-width: 600px) {
      .side-by-side { grid-template-columns: 1fr; }
    }
  `]
})
export class TagInputDemoComponent {
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

  logEvent(type: string, value: string): void {
    const now = new Date().toLocaleTimeString();
    this.eventLog.update(log => [{ type, value, time: now }, ...log].slice(0, 20));
  }
}
