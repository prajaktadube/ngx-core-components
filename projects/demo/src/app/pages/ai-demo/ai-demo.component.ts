import { Component, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AIChatComponent,
  AIChatWidgetComponent,
  AIPromptEditorComponent,
  AIMessage,
  AgentStep,
  AICard,
  AICardAction,
  QuickReply,
  AICodeEditorComponent,
  AIAudioWaveComponent,
  AIModelCompareComponent,
  AIModel
} from 'ngx-core-components/ai';

@Component({
  selector: 'app-ai-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AIChatComponent,
    AIChatWidgetComponent,
    AIPromptEditorComponent,
    AICodeEditorComponent,
    AIAudioWaveComponent,
    AIModelCompareComponent
  ],
  template: `
    <div class="demo-page">
      <div class="page-header">
        <div class="page-header-text">
          <h1>AI Chat &amp; Agentic Components</h1>
          <p>
            An interactive suite of agentic UI components including intermediate logging console, floating chatbot widgets, and dynamic prompt engineering studios.
          </p>
        </div>
        <div class="header-badges">
          <span class="badge badge-purple">Standalone</span>
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

      <!-- ===== LIVE CONSOLE ===== -->
      @if (activeTab() === 'Live Console') {
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
      }

      <!-- ===== FLOATING CHAT WIDGET ===== -->
      @if (activeTab() === 'Floating Chat Widget') {
        <div class="demo-layout">
          <!-- Widget Control Panel -->
          <div class="demo-card">
            <div class="card-header">
              <h3>Widget Configurations</h3>
              <p>Configure and trigger the floating action button (FAB) in the bottom-right corner.</p>
            </div>
            
            <div class="widget-demo-form">
              <div class="form-group">
                <label class="control-label-block">Agent Name</label>
                <input type="text" [ngModel]="widgetAgentName()" (ngModelChange)="widgetAgentName.set($event)" class="control-input-large" />
              </div>

              <div class="form-group">
                <label class="control-label-block">Welcome Message</label>
                <textarea [ngModel]="widgetWelcome()" (ngModelChange)="widgetWelcome.set($event)" rows="3" class="control-textarea-large"></textarea>
              </div>

              <div class="form-group">
                <label class="control-label-block">Quick Replies (Comma Separated)</label>
                <input type="text" [ngModel]="widgetRepliesCsv()" (ngModelChange)="onWidgetRepliesCsvChange($event)" class="control-input-large" />
              </div>

              <div class="widget-action-buttons">
                <button class="primary-action-btn" (click)="openWidget()">⚡ Open Chat Widget</button>
                <button class="secondary-action-btn" (click)="closeWidget()">✕ Close Widget</button>
              </div>
            </div>
          </div>

          <!-- Widget Event Logs -->
          <div class="demo-card logs-panel">
            <h3>Event Logs</h3>
            <p>Monitors events emitted by the floating chatbot overlay in real-time.</p>
            
            <div class="logs-container">
              @if (widgetLogs().length === 0) {
                <div class="empty-logs">No activity yet. Click the chat icon or trigger buttons to begin.</div>
              } @else {
                @for (log of widgetLogs(); track $index) {
                  <div class="log-entry" [class.log-user]="log.startsWith('[User]')" [class.log-system]="log.startsWith('[Assistant]')" [class.log-sys-act]="log.startsWith('System')">
                    <span class="log-time">[{{ logTime | date:'HH:mm:ss' }}]</span> {{ log }}
                  </div>
                }
              }
            </div>
          </div>
        </div>
      }

      <!-- ===== PROMPT STUDIO PLAYGROUND ===== -->
      @if (activeTab() === 'Prompt Studio Playground') {
        <div class="prompt-playground-container">
          <div class="presets-section">
            <div class="presets-header">
              <h4>Load Prompt Template Preset:</h4>
              <div class="presets-list">
                @for (preset of promptPresets; track preset.name) {
                  <button
                    class="preset-select-btn"
                    [class.active]="currentTemplate() === preset.template"
                    (click)="selectPreset(preset)"
                  >
                    {{ preset.name }}
                  </button>
                }
              </div>
            </div>
          </div>

          <div class="studio-card-container">
            <ngx-ai-prompt-editor
              [initialTemplate]="currentTemplate()"
              [initialSystem]="currentSystem()"
            />
          </div>
        </div>
      }

      <!-- ===== CODE COMPLETION EDITOR ===== -->
      @if (activeTab() === 'Code Completion Editor') {
        <div class="demo-layout">
          <div class="demo-card">
            <div class="card-header">
              <h3>Inline Code Completion Playground</h3>
              <div class="console-controls">
                <label class="control-label">
                  <span>Theme:</span>
                  <select [ngModel]="demoCodeTheme()" (ngModelChange)="demoCodeTheme.set($event)" class="control-select">
                    <option value="light">Light Theme</option>
                    <option value="dark">Dark Theme</option>
                  </select>
                </label>
              </div>
            </div>
            
            <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 16px; line-height: 1.5;">
              Simulates a copilot editing session. Click inside the code editor area to focus and type. Faint suggestion text will show up at the cursor. Press <kbd class="editor-kbd">Tab</kbd> to accept it, or <kbd class="editor-kbd">Esc</kbd> to decline.
            </p>

            <ngx-ai-code-editor
              [code]="demoCode()"
              [suggestion]="demoSuggestion()"
              [language]="demoLanguage()"
              [theme]="demoCodeTheme()"
              [explanation]="demoExplanation()"
              (codeChange)="onCodeChange($event)"
              (acceptSuggestion)="onAcceptSuggestion()"
              (declineSuggestion)="onDeclineSuggestion()"
              (regenerate)="onRegenerateSuggestion()"
            />
          </div>

          <!-- Logs & Simulation details -->
          <div class="demo-card">
            <h3>Completion Activity Logs</h3>
            <p>Monitors events emitted by the AI Code Completion component in real-time.</p>
            <div class="logs-container" style="min-height: 250px;">
              @if (editorLogs().length === 0) {
                <div class="empty-logs">No activity yet. Try editing or accepting suggestions.</div>
              } @else {
                @for (log of editorLogs(); track $index) {
                  <div class="log-entry" style="color: #60a5fa;">
                    <span class="log-time">[{{ logTime | date:'HH:mm:ss' }}]</span> {{ log }}
                  </div>
                }
              }
            </div>
          </div>
        </div>
      }

      <!-- ===== VOICE AUDIO WAVE ===== -->
      @if (activeTab() === 'Voice Audio Wave') {
        <div class="demo-layout">
          <div class="demo-card">
            <h3>Voice Streaming Wave Equalizer</h3>
            <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 16px; line-height: 1.5;">
              Renders a pulsing, responsive sound visualizer depicting AI voice agent interaction states. Toggle active states or mute microphone settings using the configuration forms.
            </p>

            <div style="margin-bottom: 24px;">
              <ngx-ai-audio-wave
                [state]="voiceState()"
                [theme]="demoCodeTheme()"
                [muted]="voiceMuted()"
                (stateChange)="onVoiceStateChange($event)"
                (mutedChange)="onVoiceMutedChange($event)"
                (micToggle)="onVoiceMicToggle($event)"
              />
            </div>

            <!-- Configuration controls -->
            <div class="widget-demo-form">
              <div class="form-group">
                <label class="control-label-block">Agent State Control</label>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                  @for (st of voiceStates; track st) {
                    <button
                      class="preset-select-btn"
                      [class.active]="voiceState() === st"
                      (click)="voiceState.set(st)"
                    >
                      {{ st | uppercase }}
                    </button>
                  }
                </div>
              </div>

              <div class="form-group" style="display: flex; gap: 12px; align-items: center; margin-top: 10px;">
                <label class="control-label" style="cursor: pointer;">
                  <input
                    type="checkbox"
                    [ngModel]="voiceMuted()"
                    (ngModelChange)="voiceMuted.set($event)"
                  />
                  <span>Mute Audio Output</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Logs -->
          <div class="demo-card">
            <h3>Voice Assistant Activity Logs</h3>
            <p>Monitors events emitted by the AI Audio Wave component.</p>
            <div class="logs-container" style="min-height: 250px;">
              @if (voiceLogs().length === 0) {
                <div class="empty-logs">No activity yet. Try switching states or toggle controls.</div>
              } @else {
                @for (log of voiceLogs(); track $index) {
                  <div class="log-entry" style="color: #34d399;">
                    <span class="log-time">[{{ logTime | date:'HH:mm:ss' }}]</span> {{ log }}
                  </div>
                }
              }
            </div>
          </div>
        </div>
      }

      <!-- ===== MODEL MATRIX COMPARE ===== -->
      @if (activeTab() === 'Model Matrix Compare') {
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div class="demo-card">
            <h3>Model Capability & Pricing Comparison Matrix</h3>
            <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 16px; line-height: 1.5;">
              Compare pricing, relative response latency, parameter sizing, context window capabilities, and rating recommendations across various LLM model families.
            </p>

            <ngx-ai-model-compare
              [models]="comparisonModels()"
              [theme]="demoCodeTheme()"
              (modelSelected)="onModelSelected($event)"
            />
          </div>

          <!-- Detail Card -->
          <div class="demo-card" style="background: var(--border-light, #f1f5f9); border: 1px solid var(--border-color, #e2e8f0);">
            <h3>Selected Model Insights</h3>
            @if (selectedModelInfo(); as m) {
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 12px; font-family: var(--ngx-font-family, sans-serif);">
                <div>
                  <span class="control-label-block">Model Name</span>
                  <strong style="font-size: 15px; color: var(--primary-color, #4f46e5);">{{ m.name }}</strong>
                </div>
                <div>
                  <span class="control-label-block">Provider</span>
                  <strong>{{ m.provider }}</strong>
                </div>
                <div>
                  <span class="control-label-block">Input / Output Pricing (per 1M)</span>
                  <strong style="color: #10b981;">\${{ m.pricingInput }} / \${{ m.pricingOutput }}</strong>
                </div>
                <div>
                  <span class="control-label-block">Average Latency</span>
                  <strong>{{ m.avgLatency }} seconds</strong>
                </div>
                <div>
                  <span class="control-label-block">Status / Quality</span>
                  <span class="badge" [class.badge-blue]="m.status === 'stable'" [class.badge-purple]="m.status === 'beta'">
                    {{ m.status | uppercase }}
                  </span>
                </div>
              </div>
            } @else {
              <div style="color: var(--text-secondary, #475569); font-style: italic; padding: 12px 0; font-family: var(--ngx-font-family, sans-serif); font-size: 13px;">
                Select a model row from the table above to view detailed insights.
              </div>
            }
          </div>
        </div>
      }
    </div>

    <!-- The actual floating widget component -->
    <ngx-ai-chat-widget
      #chatWidget
      [agentName]="widgetAgentName()"
      [welcomeMessage]="widgetWelcome()"
      [quickReplies]="widgetReplies()"
      (messageSent)="onWidgetMessageSent($event)"
    />
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

    .tab-nav {
      display: flex;
      gap: 8px;
      border-bottom: 2px solid var(--border-color, #e2e8f0);
      padding-bottom: 0px;
      margin-bottom: 12px;
    }
    .tab-btn {
      padding: 10px 18px;
      background: none;
      border: none;
      font-size: 14px;
      font-weight: 550;
      color: var(--text-secondary, #64748b);
      cursor: pointer;
      border-bottom: 3px solid transparent;
      margin-bottom: -2px;
      font-family: inherit;
      transition: all 0.2s ease;
    }
    .tab-btn:hover {
      color: var(--text-primary, #0f172a);
    }
    .tab-btn.active {
      color: var(--primary-color, #4f46e5);
      border-bottom-color: var(--primary-color, #4f46e5);
      font-weight: 700;
    }

    /* Widget form & playground styles */
    .widget-demo-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 12px;
    }
    .control-label-block {
      font-size: 11px;
      font-weight: 750;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-secondary, #64748b);
      margin-bottom: 6px;
      display: block;
    }
    .control-input-large {
      width: 100%;
      padding: 10px 12px;
      font-size: 13px;
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 8px;
      background: var(--bg-primary, #f8fafc);
      color: var(--text-primary, #0f172a);
      outline: none;
      font-family: inherit;
    }
    .control-input-large:focus, .control-textarea-large:focus {
      border-color: var(--primary-color, #4f46e5);
    }
    .control-textarea-large {
      width: 100%;
      padding: 10px 12px;
      font-size: 13px;
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 8px;
      background: var(--bg-primary, #f8fafc);
      color: var(--text-primary, #0f172a);
      outline: none;
      font-family: inherit;
      resize: vertical;
    }
    .widget-action-buttons {
      display: flex;
      gap: 12px;
      margin-top: 8px;
    }
    .primary-action-btn {
      background: var(--primary-gradient, linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%));
      color: #ffffff;
      border: none;
      padding: 10px 18px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
      transition: all 0.2s;
      font-family: inherit;
    }
    .primary-action-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(79, 70, 229, 0.3);
    }
    .secondary-action-btn {
      background: var(--bg-primary, #f8fafc);
      color: var(--text-primary, #0f172a);
      border: 1px solid var(--border-color, #e2e8f0);
      padding: 10px 18px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
    }
    .secondary-action-btn:hover {
      background: var(--border-light, #f1f5f9);
    }

    /* Logs panel styles */
    .logs-panel {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .logs-container {
      flex: 1;
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 8px;
      padding: 14px;
      background: #0f172a;
      color: #38bdf8;
      font-family: monospace;
      font-size: 12px;
      min-height: 300px;
      max-height: 450px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .empty-logs {
      color: #94a3b8;
      font-style: italic;
      text-align: center;
      margin-top: 40px;
    }
    .log-entry {
      line-height: 1.5;
      word-break: break-all;
    }
    .log-time {
      color: #64748b;
    }
    .log-user {
      color: #f472b6;
    }
    .log-system {
      color: #34d399;
    }
    .log-sys-act {
      color: #e2e8f0;
      font-weight: bold;
    }

    /* Prompt Playground Layout styles */
    .prompt-playground-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .presets-section {
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 12px;
      padding: 16px 20px;
      box-shadow: var(--shadow-sm);
    }
    .presets-header {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }
    .presets-header h4 {
      margin: 0;
      font-size: 13px;
      font-weight: 750;
      color: var(--text-secondary, #64748b);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .presets-list {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .preset-select-btn {
      padding: 6px 12px;
      background: var(--bg-primary, #f8fafc);
      border: 1px solid var(--border-color, #e2e8f0);
      color: var(--text-primary, #0f172a);
      font-size: 12px;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
    }
    .preset-select-btn:hover {
      background: var(--border-light, #f1f5f9);
    }
    .preset-select-btn.active {
      background: var(--primary-color, #4f46e5);
      border-color: var(--primary-color, #4f46e5);
      color: #ffffff;
    }

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
  // Tab states
  activeTab = signal('Live Console');
  tabs = [
    'Live Console',
    'Floating Chat Widget',
    'Prompt Studio Playground',
    'Code Completion Editor',
    'Voice Audio Wave',
    'Model Matrix Compare'
  ];

  // Floating Chat Widget setup
  widgetAgentName = signal('Sales Bot');
  widgetWelcome = signal('Hello! Interested in enterprise packages? Ask me anything!');
  widgetRepliesCsv = signal('View Pricing, Request Demo, Talk to Human');
  widgetReplies = computed(() => {
    return this.widgetRepliesCsv().split(',').map(s => s.trim()).filter(Boolean);
  });
  widgetLogs = signal<string[]>([]);
  logTime = new Date();

  @ViewChild('chatWidget') chatWidget!: AIChatWidgetComponent;

  // Prompt engineering playground setup
  currentTemplate = signal('Write a marketing email for {{product_name}} targeting {{audience}}.');
  currentSystem = signal('You are an encouraging and helpful copywriter.');

  promptPresets = [
    {
      name: 'Marketing Copy',
      system: 'You are an encouraging and helpful copywriter.',
      template: 'Write a marketing email for {{product_name}} targeting {{audience}}.'
    },
    {
      name: 'Data Schema Query',
      system: 'You are a Senior database administrator. Output ONLY valid SQL queries.',
      template: 'Write a SQL query to get {{fields}} from table {{table}} where {{conditions}}.'
    },
    {
      name: 'Security Code Audit',
      system: 'You are a strict security auditor and code reviewer.',
      template: 'Review the following {{language}} code for vulnerabilities:\n\n{{code}}'
    }
  ];

  selectPreset(preset: typeof this.promptPresets[0]): void {
    this.currentTemplate.set(preset.template);
    this.currentSystem.set(preset.system);
  }

  // Code Completion Setup
  demoCode = signal(`// Define a binary search function
function binarySearch(arr: number[], target: number): number {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) {
      return mid;
    }
    `);
  demoSuggestion = signal(`if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return -1;`);
  demoLanguage = signal('typescript');
  demoCodeTheme = signal<'light' | 'dark'>('light');
  demoExplanation = signal('This snippet implements the core logic of a binary search algorithm. It checks the mid-point element: if it matches the target, it returns the index. If the mid-point value is less than the target, it narrows the search space to the right half; otherwise, it narrows it to the left half. If the loop completes without finding the target, it returns -1.');
  editorLogs = signal<string[]>([]);

  onCodeChange(val: string) {
    this.demoCode.set(val);
    this.editorLogs.update(logs => [...logs, `Code Edited: size ${val.length} chars`]);
  }

  onAcceptSuggestion() {
    this.editorLogs.update(logs => [...logs, `✨ AI Suggestion Accepted!`]);
  }

  onDeclineSuggestion() {
    this.editorLogs.update(logs => [...logs, `✕ AI Suggestion Declined`]);
  }

  onRegenerateSuggestion() {
    this.editorLogs.update(logs => [...logs, `⚡ Triggered AI suggestion regeneration`]);
    this.demoCode.set(`// Define a binary search function\nfunction binarySearch(arr: number[], target: number): number {\n  let left = 0;\n  let right = arr.length - 1;\n\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) {\n      return mid;\n    }\n    `);
    this.demoSuggestion.set(`if (arr[mid] < target) {\n      left = mid + 1;\n    } else {\n      right = mid - 1;\n    }\n  }\n  return -1;`);
  }

  // Voice Equalizer Setup
  voiceState = signal<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  voiceStates: ('idle' | 'listening' | 'thinking' | 'speaking')[] = ['idle', 'listening', 'thinking', 'speaking'];
  voiceMuted = signal<boolean>(false);
  voiceColor = signal<string>('');
  voiceLogs = signal<string[]>([]);

  onVoiceStateChange(st: any) {
    this.voiceLogs.update(logs => [...logs, `State updated to: ${st}`]);
  }

  onVoiceMutedChange(mt: boolean) {
    this.voiceLogs.update(logs => [...logs, mt ? '🔇 Audio muted' : '🔊 Audio unmuted']);
  }

  onVoiceMicToggle(mic: boolean) {
    this.voiceLogs.update(logs => [...logs, mic ? '🎙️ Mic enabled' : '🎙️ Mic disabled']);
  }

  // Model Compare Setup
  comparisonModels = signal<AIModel[]>([
    {
      name: 'Antigravity-Large-1.5',
      provider: 'DeepMind',
      parameters: '405B',
      contextWindow: '2M',
      pricingInput: 3.0,
      pricingOutput: 9.0,
      avgLatency: 1.8,
      capabilities: ['text', 'code', 'vision'],
      rating: 5,
      status: 'stable',
      recommended: true
    },
    {
      name: 'Antigravity-Flash-2.0',
      provider: 'DeepMind',
      parameters: '8B',
      contextWindow: '1M',
      pricingInput: 0.15,
      pricingOutput: 0.6,
      avgLatency: 0.45,
      capabilities: ['text', 'code', 'vision', 'audio'],
      rating: 5,
      status: 'stable'
    },
    {
      name: 'Gemini-2.0-Pro',
      provider: 'Google',
      parameters: 'MoE',
      contextWindow: '2M',
      pricingInput: 2.5,
      pricingOutput: 7.5,
      avgLatency: 1.4,
      capabilities: ['text', 'code', 'vision'],
      rating: 5,
      status: 'stable',
      recommended: true
    },
    {
      name: 'Llama-3-70B-Instruct',
      provider: 'Meta',
      parameters: '70B',
      contextWindow: '128K',
      pricingInput: 0.7,
      pricingOutput: 0.9,
      avgLatency: 0.95,
      capabilities: ['text', 'code'],
      rating: 4,
      status: 'stable'
    },
    {
      name: 'Mistral-Large-2',
      provider: 'Mistral',
      parameters: '123B',
      contextWindow: '128K',
      pricingInput: 2.0,
      pricingOutput: 6.0,
      avgLatency: 1.6,
      capabilities: ['text', 'code'],
      rating: 4,
      status: 'stable'
    },
    {
      name: 'Agent-Specialist-Beta',
      provider: 'OpenSource',
      parameters: '34B',
      contextWindow: '32K',
      pricingInput: 0.4,
      pricingOutput: 0.4,
      avgLatency: 2.6,
      capabilities: ['text', 'code'],
      rating: 3,
      status: 'beta'
    }
  ]);
  selectedModelInfo = signal<AIModel | null>(null);

  onModelSelected(model: AIModel) {
    this.selectedModelInfo.set(model);
  }

  // Widget Actions
  openWidget(): void {
    if (this.chatWidget) {
      this.chatWidget.isOpen.set(true);
      if (this.chatWidget.messages().length === 0) {
        this.chatWidget.messages.set([
          { sender: 'assistant', text: this.widgetWelcome(), timestamp: new Date() }
        ]);
      }
      this.widgetLogs.update(logs => [...logs, 'System: Widget Opened']);
    }
  }

  closeWidget(): void {
    if (this.chatWidget) {
      this.chatWidget.isOpen.set(false);
      this.widgetLogs.update(logs => [...logs, 'System: Widget Closed']);
    }
  }

  onWidgetRepliesCsvChange(value: string): void {
    this.widgetRepliesCsv.set(value);
  }

  onWidgetMessageSent(content: string): void {
    this.widgetLogs.update(logs => [...logs, `[User]: ${content}`]);
    
    // Simulate automated response
    setTimeout(() => {
      let reply = '';
      const lower = content.toLowerCase();
      if (lower.includes('pricing') || lower.includes('cost')) {
        reply = 'Our enterprise tier starts at $49/user/month billed annually. Contact sales for custom bundles!';
      } else if (lower.includes('demo') || lower.includes('preview')) {
        reply = 'I have scheduled your demo preview! One of our team specialists will reach out via your registered email.';
      } else if (lower.includes('human') || lower.includes('support')) {
        reply = 'Connecting you to a human agent... Please hold for 1-2 minutes.';
      } else {
        reply = `Thanks for asking about "${content}". I am simulating an automated sales flow response. Let me know if you would like to view pricing or schedule a demo!`;
      }
      this.chatWidget.addAssistantReply(reply);
      this.widgetLogs.update(logs => [...logs, `[Assistant]: ${reply}`]);
    }, 1000);
  }

  // Live Console States
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
    const userMsg: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };
    this.messages.update(msgs => [...msgs, userMsg]);

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
