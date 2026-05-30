import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KanbanComponent, KanbanCard, KanbanColumn } from 'ngx-core-components';

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

@Component({
  selector: 'app-kanban-demo',
  standalone: true,
  imports: [CommonModule, KanbanComponent],
  template: `
    <div class="demo-page">
      <!-- Page Header -->
      <div class="page-header">
        <div class="page-header-text">
          <h1>Kanban Board</h1>
          <p>
            An enterprise workflow tracker featuring HTML5 native drag-and-drop, inline card addition,
            priority tags, overdue alerts, custom header status indicators, and detailed assignee tags.
          </p>
        </div>
        <div class="header-badges">
          <span class="badge badge-purple">HTML5 Drag &amp; Drop</span>
          <span class="badge badge-blue">Reactive Signals</span>
          <span class="badge badge-green">Zero Ext Deps</span>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="tab-nav">
        @for (tab of tabs; track tab) {
          <button
            class="tab-btn"
            [class.active]="activeTab() === tab"
            (click)="activeTab.set(tab)"
          >
            {{ tab }}
          </button>
        }
      </div>

      <div class="tab-content">
        <!-- ===== BOARD VIEW ===== -->
        @if (activeTab() === 'Interactive Board') {
          <div class="scenario-panel">
            <div class="panel-desc-row">
              <div class="panel-desc-text">
                <h3>Agile Project Board Playground</h3>
                <p>Drag and drop cards across columns to change task status. Click "Add Card" on columns to create new tasks instantly, or double-click to view logs. Click card trashcans to delete tasks.</p>
              </div>
              <div class="panel-controls">
                <button class="action-btn" (click)="resetBoard()">Reset Board</button>
                <button class="action-btn" (click)="clearLogs()">Clear Logs</button>
              </div>
            </div>

            <!-- Kanban Component Container -->
            <div class="demo-kanban-container">
              <ngx-kanban
                [columns]="columns"
                [cards]="cards()"
                (cardMoved)="onCardMoved($event)"
                (cardClicked)="onCardClicked($event)"
                (cardAdded)="onCardAdded($event)"
                (cardDeleted)="onCardDeleted($event)"
              />
            </div>

            <!-- Event Log Feed -->
            <div class="log-panel">
              <div class="log-header">
                <span>Drag &amp; Drop Event Logger stream</span>
                <span class="log-count">{{ logs().length }} entries</span>
              </div>
              <div class="log-entries">
                @if (logs().length === 0) {
                  <div class="log-empty">No board events captured yet. Drag a card or add a new task...</div>
                }
                @for (log of logs(); track $index) {
                  <div class="log-line">{{ log }}</div>
                }
              </div>
            </div>
          </div>
        }

        <!-- ===== HOW TO USE ===== -->
        @if (activeTab() === 'How to Use') {
          <div class="doc-panel">
            <div class="doc-section">
              <h3>1. Import Secondary Entry Point</h3>
              <p>Import the Kanban component and interfaces from the views entry point:</p>
              <div class="code-wrapper">
                <pre><code>{{ importCode }}</code></pre>
                <button class="copy-code-btn" (click)="copyCode(importCode, $event)">Copy Snippet</button>
              </div>
            </div>

            <div class="doc-section">
              <h3>2. Add Component Markup</h3>
              <p>Bind the columns config and cards array in your template:</p>
              <div class="code-wrapper">
                <pre><code>{{ templateCode }}</code></pre>
                <button class="copy-code-btn" (click)="copyCode(templateCode, $event)">Copy Snippet</button>
              </div>
            </div>

            <div class="doc-section">
              <h3>3. Bind Properties and Listen to Events</h3>
              <p>Manage cards using signals and handle drag/drop event triggers:</p>
              <div class="code-wrapper">
                <pre><code>{{ bindCode }}</code></pre>
                <button class="copy-code-btn" (click)="copyCode(bindCode, $event)">Copy Snippet</button>
              </div>
            </div>
          </div>
        }

        <!-- ===== API REFERENCE ===== -->
        @if (activeTab() === 'API Reference') {
          <div class="doc-panel">
            <h3>API Reference Documentation</h3>
            
            <div class="section-label">ngx-kanban Inputs</div>
            <div class="api-table-wrapper">
              <table class="api-table">
                <thead>
                  <tr><th>Property</th><th>Type</th><th>Default</th><th>Description</th></tr>
                </thead>
                <tbody>
                  @for (row of inputs; track row.name) {
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

            <div class="section-label">ngx-kanban Outputs</div>
            <div class="api-table-wrapper">
              <table class="api-table">
                <thead>
                  <tr><th>Output Event</th><th>Payload Type</th><th>Description</th></tr>
                </thead>
                <tbody>
                  @for (row of outputs; track row.name) {
                    <tr>
                      <td class="api-name">{{ row.name }}</td>
                      <td class="api-type">{{ row.type }}</td>
                      <td>{{ row.description }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <div class="section-label">KanbanCard Model Fields</div>
            <div class="api-table-wrapper">
              <table class="api-table">
                <thead>
                  <tr><th>Field Name</th><th>Type</th><th>Default</th><th>Description</th></tr>
                </thead>
                <tbody>
                  @for (row of modelFields; track row.name) {
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
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow-y: auto;
    }

    .demo-page {
      padding: 32px 40px;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    /* Page Header */
    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 20px;
      padding-bottom: 24px;
      border-bottom: 2px solid rgba(226, 232, 240, 0.8);
    }
    .page-header-text h1 {
      margin: 0 0 8px;
      font-size: 28px;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.5px;
    }
    .page-header-text p {
      margin: 0;
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.6;
      max-width: 750px;
    }
    .header-badges {
      display: flex;
      gap: 10px;
      flex-shrink: 0;
      flex-wrap: wrap;
    }

    /* Tabs Nav */
    .tab-nav {
      display: flex;
      gap: 0;
      border-bottom: 2px solid var(--border-color);
      overflow-x: auto;
      padding-bottom: 0;
    }
    .tab-btn {
      padding: 12px 20px;
      background: none;
      border: none;
      font-size: 14px;
      font-weight: 500;
      color: var(--text-secondary);
      cursor: pointer;
      border-bottom: 3px solid transparent;
      margin-bottom: -2px;
      font-family: inherit;
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    .tab-btn:hover {
      color: var(--text-primary);
      background: rgba(79, 70, 229, 0.05);
    }
    .tab-btn.active {
      color: var(--primary-color);
      border-bottom-color: var(--primary-color);
      font-weight: 600;
      background: rgba(79, 70, 229, 0.04);
    }

    /* Tab Contents */
    .tab-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .scenario-panel, .doc-panel {
      display: flex;
      flex-direction: column;
      gap: 20px;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 24px;
      box-shadow: var(--shadow-sm);
    }

    .panel-desc-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 20px;
      flex-wrap: wrap;
    }
    .panel-desc-text h3 {
      margin: 0 0 6px;
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary);
    }
    .panel-desc-text p {
      margin: 0;
      font-size: 13px;
      color: var(--text-secondary);
      max-width: 700px;
      line-height: 1.5;
    }

    .panel-controls {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
    }

    .action-btn {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 7px 14px;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-secondary);
      cursor: pointer;
      font-family: inherit;
      transition: all 0.15s ease;
    }
    .action-btn:hover {
      border-color: var(--primary-color);
      color: var(--primary-color);
      background: var(--primary-glow);
    }

    /* Demo Kanban Container height */
    .demo-kanban-container {
      height: 520px;
      border: 1px solid var(--border-color);
      border-radius: 12px;
      background: var(--border-light);
      padding: 12px;
    }

    /* Event Logs */
    .log-panel {
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;
      background: var(--bg-secondary);
      display: flex;
      flex-direction: column;
      height: 160px;
    }
    .log-header {
      background: var(--border-light);
      padding: 10px 16px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-secondary);
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid var(--border-color);
      flex-shrink: 0;
    }
    .log-count {
      color: var(--primary-color);
    }
    .log-entries {
      flex: 1;
      overflow-y: auto;
      padding: 8px 16px;
      font-family: 'SF Mono', Consolas, Monaco, monospace;
      font-size: 12px;
      line-height: 1.6;
    }
    .log-line {
      padding: 3px 0;
      color: var(--text-secondary);
      border-bottom: 1px solid var(--border-light);
    }
    .log-line:last-child {
      border-bottom: none;
    }
    .log-empty {
      font-style: italic;
      color: var(--text-secondary);
      text-align: center;
      margin-top: 16px;
    }

    /* How to Use Section */
    .doc-section {
      margin-bottom: 32px;
    }
    .doc-section:last-child {
      margin-bottom: 0;
    }
    .doc-section h3 {
      font-size: 16px;
      font-weight: 700;
      margin: 0 0 8px;
      color: var(--text-primary);
    }
    .doc-section p {
      font-size: 13px;
      color: var(--text-secondary);
      margin: 0 0 12px;
    }
    
    .code-wrapper {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #2d3748;
    }
    .code-wrapper pre {
      margin: 0;
      background: #1e293b;
      color: #f8fafc;
      padding: 18px 24px;
      font-family: 'Fira Code', Consolas, Monaco, monospace;
      font-size: 13px;
      line-height: 1.6;
      overflow-x: auto;
    }
    .copy-code-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 4px;
      color: #f8fafc;
      padding: 4px 8px;
      font-size: 11px;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s;
    }
    .copy-code-btn:hover {
      background: rgba(255, 255, 255, 0.18);
    }

    /* API Documentation Tables */
    .section-label {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--text-secondary);
      border-bottom: 2px solid var(--border-color);
      padding-bottom: 6px;
      margin: 28px 0 12px;
    }
    .section-label:first-of-type {
      margin-top: 0;
    }
    
    .api-table-wrapper {
      overflow-x: auto;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      box-shadow: var(--shadow-sm);
      margin-bottom: 20px;
    }
    .api-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    .api-table thead tr {
      background: var(--border-light);
    }
    .api-table th {
      padding: 12px 16px;
      text-align: left;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: var(--text-secondary);
      border-bottom: 1px solid var(--border-color);
      white-space: nowrap;
    }
    .api-table td {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-light);
      color: var(--text-primary);
      vertical-align: top;
      line-height: 1.5;
    }
    .api-table tbody tr:last-child td {
      border-bottom: none;
    }
    .api-table tbody tr:hover td {
      background: rgba(79, 70, 229, 0.02);
    }
    .api-name {
      color: var(--primary-color) !important;
      font-family: monospace;
      font-weight: 700;
      white-space: nowrap;
    }
    .api-type {
      color: #8e44ad !important;
      font-family: monospace;
      white-space: nowrap;
    }
    .api-default {
      color: #ef4444;
      font-family: monospace;
      white-space: nowrap;
      font-weight: 500;
    }
  `]
})
export class KanbanDemoComponent {
  tabs = ['Interactive Board', 'How to Use', 'API Reference'];
  activeTab = signal('Interactive Board');
  logs = signal<string[]>([]);

  // Columns Configuration
  columns: KanbanColumn[] = [
    { id: 'col-backlog', title: 'Product Backlog', color: '#6c757d' },
    { id: 'col-todo', title: 'To Do', color: '#38bdf8' },
    { id: 'col-progress', title: 'In Progress', color: '#fbbf24' },
    { id: 'col-review', title: 'In Review', color: '#a78bfa' },
    { id: 'col-done', title: 'Completed', color: '#34d399' }
  ];

  // Cards Configuration
  cards = signal<KanbanCard[]>([]);

  constructor() {
    this.resetBoard();
  }

  resetBoard(): void {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const overdueDate = new Date();
    overdueDate.setDate(today.getDate() - 3);

    this.cards.set([
      {
        id: 'c1',
        title: 'Define API signature for User auth',
        description: 'Detail endpoints for signup, signin, token refresh, and signout flows.',
        columnId: 'col-backlog',
        priority: 'high',
        tags: ['auth', 'backend'],
        assignee: { name: 'Sarah Connor', initials: 'SC' }
      },
      {
        id: 'c2',
        title: 'Write unit tests for Router outlet',
        description: 'Verify dynamic routing activation and nested route child outlets.',
        columnId: 'col-todo',
        priority: 'medium',
        tags: ['routing', 'testing'],
        dueDate: tomorrow,
        assignee: { name: 'Alex Murphy', initials: 'AM' }
      },
      {
        id: 'c3',
        title: 'Implement Dark Mode CSS Variables',
        description: 'Design responsive slate-900 background overrides and typography tokens.',
        columnId: 'col-progress',
        priority: 'high',
        tags: ['styles', 'theming'],
        assignee: { name: 'Neo Reeves', initials: 'NR' }
      },
      {
        id: 'c4',
        title: 'Review Kanban Board Drag Enter lag',
        description: 'Check requestAnimationFrame triggers and pointer event latency indicators.',
        columnId: 'col-review',
        priority: 'high',
        tags: ['performance', 'drag-drop'],
        dueDate: overdueDate,
        assignee: { name: 'Sarah Connor', initials: 'SC' }
      },
      {
        id: 'c5',
        title: 'Draft landing page wireframes',
        description: 'Mockup landing hero section and visual statistical metrics grid.',
        columnId: 'col-done',
        priority: 'low',
        tags: ['design', 'UX'],
        assignee: { name: 'Alex Murphy', initials: 'AM' }
      }
    ]);
    this.logEvent('Board state reset to default mock tasks.');
  }

  clearLogs(): void {
    this.logs.set([]);
  }

  private logEvent(msg: string): void {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    this.logs.update(logs => [`[${time}] ${msg}`, ...logs.slice(0, 24)]);
  }

  // Events Handlers
  onCardMoved(event: { cardId: string; fromColumnId: string; toColumnId: string }): void {
    const card = this.cards().find(c => c.id === event.cardId);
    const fromCol = this.columns.find(c => c.id === event.fromColumnId);
    const toCol = this.columns.find(c => c.id === event.toColumnId);
    
    this.logEvent(`Card "${card?.title || event.cardId}" moved from [${fromCol?.title}] ➔ [${toCol?.title}]`);
  }

  onCardClicked(card: KanbanCard): void {
    this.logEvent(`Card Clicked: "${card.title}" (${card.priority || 'no'} priority)`);
  }

  onCardAdded(event: { columnId: string; title: string }): void {
    const col = this.columns.find(c => c.id === event.columnId);
    this.logEvent(`Card Created: "${event.title}" inside [${col?.title}] column.`);
  }

  onCardDeleted(cardId: string): void {
    this.logEvent(`Card Deleted: ID "${cardId}" removed from board state.`);
  }

  // Code copy helpers
  copyCode(text: string, event: MouseEvent): void {
    navigator.clipboard.writeText(text).then(() => {
      const btn = event.target as HTMLButtonElement;
      const original = btn.innerText;
      btn.innerText = 'Copied!';
      btn.style.background = '#27ae60';
      btn.style.borderColor = '#27ae60';
      setTimeout(() => {
        btn.innerText = original;
        btn.style.background = '';
        btn.style.borderColor = '';
      }, 1500);
    });
  }

  // Code snippets for docs
  importCode = `import { Component } from '@angular/core';
import { KanbanComponent } from 'ngx-core-components/views';

@Component({
  selector: 'app-my-board',
  standalone: true,
  imports: [KanbanComponent],
  templateUrl: './my-board.component.html',
})
export class MyBoardComponent {}`;

  templateCode = `<ngx-kanban
  [columns]="columns"
  [cards]="cards"
  (cardMoved)="onCardMoved($event)"
  (cardClicked)="onCardClicked($event)"
  (cardAdded)="onCardAdded($event)"
  (cardDeleted)="onCardDeleted($event)"
/>`;

  bindCode = `import { Component, signal } from '@angular/core';
import { KanbanColumn, KanbanCard } from 'ngx-core-components/views';

@Component({ ... })
export class MyBoardComponent {
  columns: KanbanColumn[] = [
    { id: 'todo', title: 'To Do', color: '#38bdf8' },
    { id: 'progress', title: 'In Progress', color: '#fbbf24' },
    { id: 'done', title: 'Done', color: '#34d399' }
  ];

  cards = signal<KanbanCard[]>([
    { id: 'c1', title: 'Design Mockups', columnId: 'todo', priority: 'high' }
  ]);

  onCardMoved(event: any) {
    console.log('Card moved', event);
  }
}`;

  // API Reference Data
  inputs: ApiRow[] = [
    { name: 'columns', type: 'KanbanColumn[]', default: '[]', description: 'List of column categories shown left-to-right across the board.' },
    { name: 'cards', type: 'KanbanCard[]', default: '[]', description: 'List of tasks/cards displayed in their respective columns.' }
  ];

  outputs: ApiRow[] = [
    { name: '(cardMoved)', type: '{ cardId: string, fromColumnId: string, toColumnId: string }', default: 'Fired when a user drags a card to another column.', description: 'Emits card ID, starting column, and target column.' },
    { name: '(cardClicked)', type: 'KanbanCard', default: 'Fired when a user clicks a card.', description: 'Emits the clicked card instance details.' },
    { name: '(cardAdded)', type: '{ columnId: string, title: string }', default: 'Fired when a new card is created using the column\'s inline input.', description: 'Emits column ID and user-typed title.' },
    { name: '(cardDeleted)', type: 'string', default: 'Fired when a user clicks a card\'s delete button.', description: 'Emits the card ID that was deleted.' }
  ];

  modelFields: ApiRow[] = [
    { name: 'id', type: 'string', default: 'required', description: 'Unique identifier of the card.' },
    { name: 'title', type: 'string', default: 'required', description: 'Card text heading.' },
    { name: 'description', type: 'string', default: 'undefined', description: 'Card detailed text body.' },
    { name: 'columnId', type: 'string', default: 'required', description: 'The ID of the column this card belongs to.' },
    { name: 'priority', type: "'low' | 'medium' | 'high'", default: 'undefined', description: 'Task priority level (colors card badge).' },
    { name: 'tags', type: 'string[]', default: 'undefined', description: 'List of text tags.' },
    { name: 'assignee', type: '{ name: string, avatarUrl?: string, initials: string }', default: 'undefined', description: 'Task assigned user metadata.' },
    { name: 'dueDate', type: 'Date', default: 'undefined', description: 'Task due date (triggers red warning if overdue).' }
  ];
}
