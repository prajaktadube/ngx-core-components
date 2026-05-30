import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TimelineComponent, TimelineItem } from 'ngx-core-components';

interface ApiRow { name: string; type: string; default: string; description: string; }

@Component({
  selector: 'app-timeline-demo',
  standalone: true,
  imports: [CommonModule, FormsModule, TimelineComponent],
  template: `
    <div class="demo-page">
      <!-- Page Header -->
      <div class="page-header">
        <div class="page-header-text">
          <h1>Timeline Events View</h1>
          <p>Displays chronological streams of audits, user operational histories, and project releases in vertical, horizontal, or alternating layouts.</p>
        </div>
        <div class="header-badges">
          <span class="badge badge-purple">Chronological</span>
          <span class="badge badge-blue">Interactive</span>
          <span class="badge badge-green">New</span>
        </div>
      </div>

      <!-- TAB NAV -->
      <div class="tab-nav">
        @for (tab of tabs; track tab) {
          <button class="tab-btn" [class.active]="activeTab() === tab" (click)="activeTab.set(tab)">{{ tab }}</button>
        }
      </div>

      <!-- ===== DEMO TAB ===== -->
      @if (activeTab() === 'Demo') {
        <div class="tab-content">
          <div class="playground-layout">
            <!-- Controls Sidebar -->
            <div class="demo-card control-panel">
              <h3>Playground Controls</h3>
              <p>Customize the timeline rendering layout and options dynamically.</p>
              
              <div class="control-group">
                <label class="control-label">Orientation</label>
                <select [ngModel]="selectedOrientation()" (ngModelChange)="selectedOrientation.set($event)" class="control-select">
                  <option value="vertical">Vertical Timeline</option>
                  <option value="horizontal">Horizontal Timeline</option>
                </select>
              </div>

              <div class="control-group check-group">
                <label class="control-label checkbox-label">
                  <input type="checkbox" [ngModel]="isAlternating()" (ngModelChange)="isAlternating.set($event)" [disabled]="selectedOrientation() === 'horizontal'" />
                  <span>Alternating Nodes (Vertical only)</span>
                </label>
              </div>

              <div class="add-event-form">
                <h4>Add Dynamic Event</h4>
                <div class="form-field">
                  <input type="text" [(ngModel)]="newEventTitle" placeholder="Event Title..." class="form-input" />
                </div>
                <div class="form-field">
                  <input type="text" [(ngModel)]="newEventSubtitle" placeholder="Subtitle / Tag (e.g. v1.2)..." class="form-input" />
                </div>
                <div class="form-field">
                  <select [(ngModel)]="newEventStatus" class="form-select">
                    <option value="default">Status: Default</option>
                    <option value="success">Status: Success (Green)</option>
                    <option value="warning">Status: Warning (Orange)</option>
                    <option value="error">Status: Error (Red)</option>
                    <option value="info">Status: Info (Blue)</option>
                  </select>
                </div>
                <button type="button" (click)="addEvent()" class="add-btn">⚡ Append Event Node</button>
              </div>
            </div>

            <!-- Timeline Live Output -->
            <div class="demo-card timeline-output">
              <h3>Live Timeline Render</h3>
              <div class="timeline-viewport" [class.scrollable-x]="selectedOrientation() === 'horizontal'">
                <ngx-timeline
                  [items]="timelineEvents()"
                  [orientation]="selectedOrientation()"
                  [alternating]="isAlternating()"
                />
              </div>
            </div>
          </div>

          <div class="section-label">How to Use</div>
          <pre class="code-block">{{ codeSnippet }}</pre>
        </div>
      }

      <!-- ===== API REFERENCE ===== -->
      @if (activeTab() === 'API Reference') {
        <div class="tab-content">
          <div class="section-label">Timeline Component Inputs</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of timelineInputs; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>

          <div class="section-label">TimelineItem Interface Model</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Property</th><th>Type</th><th>Optional</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of itemProperties; track row.name) {
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
    :host { display: block; height: 100%; overflow-y: auto; }
    .demo-page { padding: 24px 28px; max-width: 1100px; display: flex; flex-direction: column; gap: 20px; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding-bottom: 16px; border-bottom: 1px solid #e9ecef; }
    .page-header-text h1 { margin: 0 0 6px; font-size: 24px; font-weight: 800; color: #1a1a2e; }
    .page-header-text p { margin: 0; font-size: 13px; color: #6c757d; line-height: 1.6; max-width: 600px; }
    .header-badges { display: flex; gap: 8px; flex-shrink: 0; }
    .badge { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 12px; }
    .badge-purple { background: #f3e8ff; color: #7c3aed; }
    .badge-blue { background: #e8f0fe; color: #1a73e8; }
    .badge-green { background: #dcfce7; color: #166534; }

    .tab-nav { display: flex; gap: 2px; border-bottom: 2px solid #e9ecef; }
    .tab-btn { padding: 8px 18px; background: none; border: none; font-size: 13px; font-weight: 500; color: #6c757d; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; font-family: inherit; transition: all 0.12s; }
    .tab-btn:hover { color: #1a1a2e; }
    .tab-btn.active { color: #1a73e8; border-bottom-color: #1a73e8; font-weight: 600; }

    .tab-content { display: flex; flex-direction: column; gap: 16px; }
    .section-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #adb5bd; border-bottom: 1px solid #f1f3f5; padding-bottom: 6px; }

    /* Playground Layout grid */
    .playground-layout {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 24px;
      align-items: start;
    }
    @media (max-width: 820px) {
      .playground-layout {
        grid-template-columns: 1fr;
      }
    }

    .demo-card {
      background: #ffffff;
      border: 1px solid #e9ecef;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }
    .demo-card h3 {
      margin: 0 0 4px;
      font-size: 15px;
      font-weight: 800;
      color: #1a1a2e;
    }
    .demo-card p {
      margin: 0 0 16px;
      font-size: 12px;
      color: #6c757d;
      line-height: 1.5;
    }

    /* Controls Sidebar styles */
    .control-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 14px;
    }
    .control-label {
      font-size: 11px;
      font-weight: 750;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
    }
    .checkbox-label {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      text-transform: none;
      font-weight: 500;
      font-size: 13px;
      color: #0f172a;
    }
    .check-group {
      margin-bottom: 20px;
    }
    .control-select {
      padding: 8px 12px;
      font-size: 13px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      background: #fff;
      outline: none;
      font-family: inherit;
    }

    /* Add Event Form styles */
    .add-event-form {
      border-top: 1px dashed #e2e8f0;
      padding-top: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .add-event-form h4 {
      margin: 0 0 4px;
      font-size: 12px;
      font-weight: 800;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .form-field {
      width: 100%;
    }
    .form-input, .form-select {
      width: 100%;
      padding: 8px 12px;
      font-size: 12px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      background: #f8fafc;
      outline: none;
      font-family: inherit;
    }
    .form-input:focus, .form-select:focus {
      border-color: #1a73e8;
    }
    .add-btn {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: #fff;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(79,70,229,0.2);
      transition: all 0.2s;
    }
    .add-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(79,70,229,0.3);
    }

    /* Live Output Window styles */
    .timeline-viewport {
      width: 100%;
      min-height: 400px;
      padding: 12px;
      box-sizing: border-box;
    }
    .scrollable-x {
      overflow-x: auto;
    }

    /* Code block */
    .code-block { background: #1e1e2e; color: #a6e3a1; border-radius: 8px; padding: 16px 20px; font-size: 12px; line-height: 1.6; overflow-x: auto; white-space: pre; font-family: 'SF Mono', Consolas, monospace; }

    /* API table */
    .api-table-wrap { overflow-x: auto; margin-bottom: 24px; }
    .api-table { width: 100%; border-collapse: collapse; font-size: 12px; }
    .api-table thead th { background: #f8f9fa; font-weight: 700; color: #495057; text-align: left; padding: 10px 12px; border-bottom: 2px solid #e9ecef; text-transform: uppercase; letter-spacing: 0.3px; font-size: 11px; }
    .api-table tbody td { padding: 10px 12px; border-bottom: 1px solid #f1f3f5; color: #495057; vertical-align: top; line-height: 1.5; }
    .api-table tbody tr:last-child td { border-bottom: none; }
    .api-table tbody tr:hover td { background: #f8f9fa; }
    .api-name { color: #1a73e8 !important; font-family: monospace; font-weight: 600; white-space: nowrap; }
    .api-type { color: #8e44ad !important; font-family: monospace; white-space: nowrap; }
    .api-default { font-family: monospace; white-space: nowrap; }
  `]
})
export class TimelineDemoComponent {
  activeTab = signal('Demo');
  tabs = ['Demo', 'API Reference'];

  selectedOrientation = signal<'vertical' | 'horizontal'>('vertical');
  isAlternating = signal<boolean>(true);

  // Initial mockup events
  timelineEvents = signal<TimelineItem[]>([
    {
      title: 'Branch Created',
      subtitle: 'git branch',
      description: 'Feature branch checkout initiated from trunk for layout upgrades.',
      timestamp: '10 mins ago',
      icon: '🌿',
      status: 'info'
    },
    {
      title: 'Lint Checker Run',
      subtitle: 'eslint',
      description: 'Static analysis executed. 0 errors, 4 warnings identified.',
      timestamp: '8 mins ago',
      icon: '⚙️',
      status: 'default'
    },
    {
      title: 'Unit Testing Complete',
      subtitle: 'karma + jasmine',
      description: 'Successfully verified 14 modules. Code coverage index meets 94%.',
      timestamp: '5 mins ago',
      icon: '✓',
      status: 'success'
    },
    {
      title: 'Compiler Failure',
      subtitle: 'angular-compiler',
      description: 'esbuild terminated with error TS2538 on component indexing.',
      timestamp: '3 mins ago',
      icon: '✕',
      status: 'error'
    },
    {
      title: 'Production Build Output Generated',
      subtitle: 'ng build --prod',
      description: 'Bundle size verified. Asset compression ratios complete in 24 seconds.',
      timestamp: 'Just now',
      icon: '⚡',
      status: 'success'
    }
  ]);

  // Form bindings
  newEventTitle = '';
  newEventSubtitle = '';
  newEventStatus: TimelineItem['status'] = 'default';

  addEvent(): void {
    if (!this.newEventTitle.trim()) return;
    const item: TimelineItem = {
      title: this.newEventTitle.trim(),
      subtitle: this.newEventSubtitle.trim() || undefined,
      timestamp: 'Just now',
      status: this.newEventStatus,
      icon: this.newEventStatus === 'success' ? '✓' : this.newEventStatus === 'error' ? '✕' : 'ℹ'
    };
    this.timelineEvents.update(items => [...items, item]);
    this.newEventTitle = '';
    this.newEventSubtitle = '';
    this.newEventStatus = 'default';
  }

  codeSnippet = `import { Component, signal } from '@angular/core';
import { TimelineComponent, TimelineItem } from 'ngx-core-components';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [TimelineComponent],
  template: \`
    <ngx-timeline
      [items]="events()"
      [orientation]="'vertical'"
      [alternating]="true"
    />
  \`
})
export class ExampleComponent {
  events = signal<TimelineItem[]>([
    {
      title: 'Branch Created',
      subtitle: 'v1.2.0',
      description: 'Feature checkout initiated from trunk.',
      timestamp: new Date(),
      status: 'success',
      icon: '🌿'
    }
  ]);
}`;

  timelineInputs: ApiRow[] = [
    { name: 'items', type: 'TimelineItem[]', default: '[]', description: 'Chronological list of event data nodes to render.' },
    { name: 'orientation', type: "'vertical' | 'horizontal'", default: "'vertical'", description: 'Arrangement direction of the timeline track.' },
    { name: 'alternating', type: 'boolean', default: 'false', description: 'Position elements left/right of the vertical track alternately.' }
  ];

  itemProperties: ApiRow[] = [
    { name: 'title', type: 'string', default: 'required', description: 'Primary header text for the event node.' },
    { name: 'subtitle', type: 'string', default: 'optional', description: 'Secondary tag or release descriptor pill.' },
    { name: 'description', type: 'string', default: 'optional', description: 'Paragraph body block details.' },
    { name: 'timestamp', type: 'string | Date', default: 'required', description: 'Time or calendar date tag displayed on top.' },
    { name: 'icon', type: 'string', default: 'optional', description: 'Emoji symbol or letter rendered inside the marker circle.' },
    { name: 'color', type: 'string', default: 'optional', description: 'Custom CSS hex override for the marker outline track.' },
    { name: 'status', type: "'success' | 'warning' | 'error' | 'info' | 'default'", default: "'default'", description: 'Theme coloring presets for the dot track.' }
  ];
}
