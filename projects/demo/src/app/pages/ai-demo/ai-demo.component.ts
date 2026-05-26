import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AIChatComponent, AIMessage, AgentStep, AICard, AICardAction, QuickReply } from 'ngx-core-components/ai';

@Component({
  selector: 'app-ai-demo',
  standalone: true,
  imports: [CommonModule, FormsModule, AIChatComponent],
  template: `
    <div class="demo-page">
      <div class="page-header">
        <div class="page-header-text">
          <h1>AI Chat & Agent Console</h1>
          <p>
            An interactive conversational interface designed specifically for Agentic AI applications. Includes multi-step tool/thought logging, dynamic reply cards, quick-replies, and clean themes.
          </p>
        </div>
        <div class="header-badges">
          <span class="badge badge-purple">Standalone</span>
          <span class="badge badge-blue">Interactive</span>
          <span class="badge badge-green">New</span>
        </div>
      </div>

      <div class="demo-layout">
        <!-- Live Play Area -->
        <div class="demo-card chat-showcase">
          <div class="card-header">
            <h3>Live Interactive Console</h3>
            <div class="console-controls">
              <label class="control-label">
                <span>Theme:</span>
                <select [ngModel]="chatTheme()" (ngModelChange)="chatTheme.set($event)" class="control-select">
                  <option value="light">Light Theme</option>
                  <option value="dark">Dark Theme</option>
                </select>
              </label>
              <label class="control-label">
                <span>Agent Name:</span>
                <input type="text" [ngModel]="agentName()" (ngModelChange)="agentName.set($event)" class="control-input" />
              </label>
            </div>
          </div>
          <div class="chat-container-wrap">
            <ngx-ai-chat
              [messages]="messages()"
              [agentName]="agentName()"
              [isOnline]="isOnline()"
              [isTyping]="isTyping()"
              [theme]="chatTheme()"
              [quickReplies]="replies()"
              (sendMessage)="onSendMessage($event)"
              (quickReplyClick)="onQuickReplyClick($event)"
              (cardActionClick)="onCardActionClick($event)"
              (clearHistory)="onClearHistory()"
            />
          </div>
        </div>

        <!-- Documentation & Options Panel -->
        <div class="demo-card doc-panel">
          <h3>Component Capabilities</h3>
          <p>
            Traditional chat UIs only display user/assistant message pairs. For <strong>Agentic AI</strong>, showing intermediate steps (thoughts, tool runs, sub-processes) is vital.
          </p>

          <div class="feature-bullets">
            <div class="bullet-item">
              <div class="bullet-icon">⚙️</div>
              <div>
                <strong>Collapsible Agent Steps:</strong> Render detailed nested logs of tool inputs, durations, and outputs directly inside the message bubble.
              </div>
            </div>
            <div class="bullet-item">
              <div class="bullet-icon">▦</div>
              <div>
                <strong>Card Carousels (Decks):</strong> Return structured product offers, documents, or option arrays that scroll horizontally.
              </div>
            </div>
            <div class="bullet-item">
              <div class="bullet-icon">⚡</div>
              <div>
                <strong>Quick Replies:</strong> Prompt user actions using interactive pills below the thread.
              </div>
            </div>
          </div>

          <div class="section-label" style="margin-top: 24px;">Code Snippet</div>
          <pre class="code-block">{{ codeSample }}</pre>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .demo-page {
      padding: 24px 28px;
      max-width: 1200px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      height: 100%;
      overflow-y: auto;
      box-sizing: border-box;
    }

    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e9ecef;
    }

    .page-header-text h1 {
      margin: 0 0 6px;
      font-size: 24px;
      font-weight: 800;
      color: #1a1a2e;
    }

    .page-header-text p {
      margin: 0;
      font-size: 13px;
      color: #6c757d;
      line-height: 1.6;
      max-width: 700px;
    }

    .header-badges {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }

    .badge {
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 12px;
    }

    .badge-purple { background: #f3e8ff; color: #7c3aed; }
    .badge-blue { background: #e8f0fe; color: #1a73e8; }
    .badge-green { background: #dcfce7; color: #166534; }

    .demo-layout {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 24px;
      align-items: start;
    }

    @media (max-width: 960px) {
      .demo-layout {
        grid-template-columns: 1fr;
      }
    }

    .demo-card {
      background: #ffffff;
      border: 1px solid #e9ecef;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }

    .chat-showcase {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }

    .card-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: #1a1a2e;
    }

    .console-controls {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .control-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #495057;
      font-weight: 500;
    }

    .control-select, .control-input {
      padding: 4px 8px;
      font-size: 12px;
      border: 1px solid #ced4da;
      border-radius: 6px;
      background: #fff;
      color: #495057;
      outline: none;
    }

    .control-select:focus, .control-input:focus {
      border-color: #1a73e8;
    }

    .chat-container-wrap {
      height: 550px;
      border-radius: 12px;
      overflow: hidden;
    }

    /* Documentation styling */
    .doc-panel h3 {
      margin: 0 0 10px;
      font-size: 16px;
      font-weight: 700;
      color: #1a1a2e;
    }

    .doc-panel p {
      font-size: 13px;
      color: #495057;
      line-height: 1.6;
      margin: 0 0 20px;
    }

    .feature-bullets {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .bullet-item {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }

    .bullet-icon {
      font-size: 16px;
      line-height: 1.2;
    }

    .bullet-item strong {
      display: block;
      font-size: 13px;
      color: #1e293b;
      margin-bottom: 2px;
    }

    .bullet-item div {
      font-size: 12px;
      color: #64748b;
      line-height: 1.5;
    }

    .section-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #6c757d;
      margin-bottom: 8px;
    }

    .code-block {
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 16px;
      border-radius: 8px;
      font-size: 11px;
      font-family: monospace;
      overflow-x: auto;
      white-space: pre;
      margin: 0;
    }
  `]
})
export class AiDemoComponent {
  agentName = signal('Antigravity Core');
  isOnline = signal(true);
  isTyping = signal(false);
  chatTheme = signal<'light' | 'dark'>('light');

  messages = signal<AIMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I am your AI Agent console. Ask me to research components, evaluate schemas, or test layouts.',
      timestamp: new Date(Date.now() - 3600000),
      senderName: 'Antigravity Core'
    },
    {
      id: '2',
      role: 'user',
      content: 'What components can I use for displaying a timeline of operations and dependencies?',
      timestamp: new Date(Date.now() - 3500000)
    },
    {
      id: '3',
      role: 'assistant',
      content: 'I analyzed the library structure. Here is what I found:\n\nFor complex operations and dependencies, we have the high-performance **Gantt Chart** component. For simple indicators, you can use **Sparkline** or **ProgressBar**.',
      timestamp: new Date(Date.now() - 3400000),
      senderName: 'Antigravity Core',
      steps: [
        {
          id: 'step-1',
          name: 'Inspect Library Modules',
          status: 'success',
          duration: '340ms',
          input: 'query: timeline components\npath: projects/ngx-core-components',
          output: 'Found: gantt-chart, progress-bar, sparkline, stepper'
        },
        {
          id: 'step-2',
          name: 'Verify Dependencies Support',
          status: 'success',
          duration: '180ms',
          input: 'target: GanttChartComponent\nproperty: dependencies',
          output: 'Confirmed: Supports FinishToStart, StartToStart, FinishToFinish'
        }
      ],
      cards: [
        {
          title: 'Gantt Chart Component',
          subtitle: 'ngx-gantt-chart',
          description: 'Renders tasks, baseline estimates, dependencies, and supports custom tooltips with high-res timestamp options.',
          imageUrl: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?auto=format&fit=crop&w=400&q=80',
          actions: [
            { label: 'View Gantt Docs', value: 'view_gantt', variant: 'primary' }
          ]
        },
        {
          title: 'Stepper Component',
          subtitle: 'ngx-stepper',
          description: 'A linear layout showing sequential operational phases with custom icons and complete validation hooks.',
          imageUrl: 'https://images.unsplash.com/photo-1484417894907-623942c8ea29?auto=format&fit=crop&w=400&q=80',
          actions: [
            { label: 'View Stepper Docs', value: 'view_stepper', variant: 'secondary' }
          ]
        }
      ]
    }
  ]);

  replies = signal<QuickReply[]>([
    { label: 'Show Gantt Configuration', value: 'show_gantt_config', icon: '📅' },
    { label: 'Test Agent Workflow Simulation', value: 'simulate_workflow', icon: '🤖' },
    { label: 'Clear Console Logs', value: 'clear_logs', icon: '🗑️' }
  ]);

  onSendMessage(content: string): void {
    // Add user message
    const userMsg: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };
    this.messages.update(msgs => [...msgs, userMsg]);

    // Handle special prompt/replies
    if (content.toLowerCase().includes('simulate') || content.includes('simulate_workflow')) {
      this.simulateAgentWorkflow();
    } else {
      this.simulateSimpleResponse(content);
    }
  }

  onQuickReplyClick(reply: QuickReply): void {
    if (reply.value === 'clear_logs') {
      this.onClearHistory();
      return;
    }
    this.onSendMessage(reply.label);
  }

  onCardActionClick(action: AICardAction): void {
    alert(`Triggered card action: ${action.label} (${action.value})`);
  }

  onClearHistory(): void {
    this.messages.set([]);
  }

  private simulateSimpleResponse(userQuery: string): void {
    this.isTyping.set(true);

    setTimeout(() => {
      this.isTyping.set(false);
      const assistantMsg: AIMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `I received your query: "**${userQuery}**".\n\nI can run automated background operations, call external APIs, or execute scripts to resolve your request. Try clicking "**Test Agent Workflow Simulation**" below to see a live tool calling execution sequence!`,
        timestamp: new Date(),
        senderName: this.agentName()
      };
      this.messages.update(msgs => [...msgs, assistantMsg]);
    }, 1200);
  }

  private simulateAgentWorkflow(): void {
    const messageId = Date.now().toString();
    const assistantMsg: AIMessage = {
      id: messageId,
      role: 'assistant',
      content: 'Analyzing workflow request...',
      timestamp: new Date(),
      senderName: this.agentName(),
      steps: [
        {
          id: 's-1',
          name: 'Planner: Decompose Task',
          status: 'running',
          collapsed: false
        }
      ]
    };

    this.messages.update(msgs => [...msgs, assistantMsg]);

    // Phase 1: Planning succeeds, Step 2 (Tool Call) begins running
    setTimeout(() => {
      this.messages.update(msgs => {
        return msgs.map(m => {
          if (m.id === messageId && m.steps) {
            const steps = [...m.steps];
            steps[0] = {
              ...steps[0],
              status: 'success',
              duration: '420ms',
              output: 'Goal: Run diagnostics on UI component layout.\n1. Run layout lint checks\n2. Compute responsive breakpoint ratios'
            };
            steps.push({
              id: 's-2',
              name: 'Tool: CSS Breakpoint Analyzer',
              status: 'running',
              input: 'path: projects/demo/src/styles.scss\nbreakpoints: [480, 768, 1024]',
              collapsed: false
            });
            return {
              ...m,
              content: 'Running component diagnostics...',
              steps
            };
          }
          return m;
        });
      });
    }, 1500);

    // Phase 2: Tool Call succeeds, final message updated
    setTimeout(() => {
      this.messages.update(msgs => {
        return msgs.map(m => {
          if (m.id === messageId && m.steps) {
            const steps = [...m.steps];
            steps[1] = {
              ...steps[1],
              status: 'success',
              duration: '850ms',
              output: 'Result:\n- 480px: Mobile shell conforms to 100vw width\n- 768px: Sidebar collapses successfully\n- 1024px: Column-count auto-scales with correct gap ratio.'
            };
            return {
              ...m,
              content: '✅ **Layout Diagnostics Complete**\n\nThe CSS breakpoint analysis succeeded. Responsive grid rendering matches standard flex ratios across all breakpoints.',
              steps
            };
          }
          return m;
        });
      });
    }, 3200);
  }

  codeSample = `
import { AIChatComponent, AIMessage } from 'ngx-core-components/ai';

@Component({
  imports: [AIChatComponent],
  template: \`
    <ngx-ai-chat
      [messages]="messages"
      [agentName]="'Antigravity Agent'"
      [isTyping]="isTyping"
      [theme]="'light'"
      (sendMessage)="onSendMessage($event)"
    />
  \`
})
export class ChatPage {
  messages: AIMessage[] = [...];
  isTyping = false;

  onSendMessage(text: string) {
    // Process input
  }
}
  `;
}
