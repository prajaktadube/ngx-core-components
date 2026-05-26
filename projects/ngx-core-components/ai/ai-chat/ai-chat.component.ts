import { Component, input, output, model, viewChild, ElementRef, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AIMessage, AgentStep, AICard, AICardAction, QuickReply } from './models';

@Component({
  selector: 'ngx-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ngx-ai-chat-container" [class.dark-mode]="theme() === 'dark'">
      <!-- Chat Header -->
      <div class="ngx-ai-chat-header">
        <div class="header-avatar" [style.background]="avatarBg()">
          @if (agentAvatarUrl()) {
            <img [src]="agentAvatarUrl()" [alt]="agentName()" />
          } @else {
            <span class="avatar-initials">{{ getInitials(agentName()) }}</span>
          }
          <span class="status-indicator" [class.online]="isOnline()"></span>
        </div>
        <div class="header-info">
          <div class="agent-title">{{ agentName() }}</div>
          <div class="agent-status">{{ isOnline() ? 'Active Now' : 'Offline' }}</div>
        </div>
        <div class="header-actions">
          <button class="header-btn" (click)="clearHistory.emit()" title="Clear chat history">
            <svg viewBox="0 0 24 24" class="svg-icon"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
          </button>
        </div>
      </div>

      <!-- Messages Thread -->
      <div class="ngx-ai-chat-body" #chatBody>
        <div class="messages-list">
          @for (msg of messages(); track msg.id) {
            <div class="message-wrapper" [class.user-msg]="msg.role === 'user'" [class.assistant-msg]="msg.role === 'assistant'">
              <!-- Avatar -->
              @if (msg.role !== 'user') {
                <div class="msg-avatar" [style.background]="avatarBg()">
                  @if (msg.avatarUrl || agentAvatarUrl()) {
                    <img [src]="msg.avatarUrl || agentAvatarUrl()" [alt]="msg.senderName || agentName()" />
                  } @else {
                    <span>{{ getInitials(msg.senderName || agentName()) }}</span>
                  }
                </div>
              }

              <!-- Content Area -->
              <div class="msg-bubble-container">
                <!-- Sender Name -->
                @if (msg.role !== 'user' && showSenderNames()) {
                  <span class="msg-sender">{{ msg.senderName || agentName() }}</span>
                }

                <div class="msg-bubble">
                  <!-- Text Content -->
                  <div class="msg-text" [innerHTML]="formatMessage(msg.content)"></div>

                  <!-- Agent Steps (Accordion) -->
                  @if (msg.steps && msg.steps.length > 0) {
                    <div class="agent-steps-container">
                      <div class="steps-header">
                        <span class="steps-title-text">Execution Steps</span>
                        <span class="steps-badge">{{ getCompletedStepsCount(msg.steps) }}/{{ msg.steps.length }}</span>
                      </div>
                      <div class="steps-list">
                        @for (step of msg.steps; track step.id) {
                          <div class="agent-step-item" [class.step-error]="step.status === 'error'">
                            <div class="step-summary" (click)="toggleStep(step)">
                              <span class="step-status-icon" [class.running]="step.status === 'running'" [class.success]="step.status === 'success'" [class.error]="step.status === 'error'">
                                @if (step.status === 'running') {
                                  <span class="spinner"></span>
                                } @else if (step.status === 'success') {
                                  ✓
                                } @else {
                                  ✕
                                }
                              </span>
                              <span class="step-name">{{ step.name }}</span>
                              @if (step.duration) {
                                <span class="step-duration">{{ step.duration }}</span>
                              }
                              <span class="step-chevron" [class.expanded]="!step.collapsed">▼</span>
                            </div>

                            @if (!step.collapsed) {
                              <div class="step-details">
                                @if (step.input) {
                                  <div class="step-detail-section">
                                    <div class="detail-label">Input Parameters</div>
                                    <pre class="detail-code"><code>{{ step.input }}</code></pre>
                                  </div>
                                }
                                @if (step.output) {
                                  <div class="step-detail-section">
                                    <div class="detail-label">Output Result</div>
                                    <pre class="detail-code"><code>{{ step.output }}</code></pre>
                                  </div>
                                }
                              </div>
                            }
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>

                <!-- Structured Cards (Carousel) -->
                @if (msg.cards && msg.cards.length > 0) {
                  <div class="cards-carousel">
                    @for (card of msg.cards; track card.title) {
                      <div class="ai-carousel-card">
                        @if (card.imageUrl) {
                          <div class="card-img-container">
                            <img [src]="card.imageUrl" [alt]="card.title" />
                          </div>
                        }
                        <div class="card-body">
                          <h4 class="card-title">{{ card.title }}</h4>
                          @if (card.subtitle) {
                            <h5 class="card-subtitle">{{ card.subtitle }}</h5>
                          }
                          @if (card.description) {
                            <p class="card-description">{{ card.description }}</p>
                          }
                          @if (card.actions && card.actions.length > 0) {
                            <div class="card-actions">
                              @for (act of card.actions; track act.label) {
                                <button
                                  class="card-action-btn"
                                  [class.btn-primary]="act.variant === 'primary'"
                                  (click)="cardActionClick.emit(act)"
                                >
                                  {{ act.label }}
                                </button>
                              }
                            </div>
                          }
                        </div>
                      </div>
                    }
                  </div>
                }

                <!-- Time -->
                <span class="msg-time">{{ msg.timestamp | date:'shortTime' }}</span>
              </div>
            </div>
          }

          <!-- Typing Indicator -->
          @if (isTyping()) {
            <div class="message-wrapper assistant-msg">
              <div class="msg-avatar" [style.background]="avatarBg()">
                <span>{{ getInitials(agentName()) }}</span>
              </div>
              <div class="msg-bubble-container">
                <div class="msg-bubble typing-bubble">
                  <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Quick Replies -->
      @if (quickReplies() && quickReplies().length > 0) {
        <div class="quick-replies-container">
          <div class="quick-replies-list">
            @for (reply of quickReplies(); track reply.value) {
              <button class="quick-reply-btn" (click)="quickReplyClick.emit(reply)">
                @if (reply.icon) {
                  <span class="reply-icon">{{ reply.icon }}</span>
                }
                <span>{{ reply.label }}</span>
              </button>
            }
          </div>
        </div>
      }

      <!-- Chat Footer / Input -->
      <div class="ngx-ai-chat-footer">
        <form (ngSubmit)="onSubmit()" class="input-form">
          <input
            type="text"
            class="chat-input"
            [placeholder]="placeholder()"
            [(ngModel)]="inputText"
            name="messageText"
            [disabled]="disabled()"
            autocomplete="off"
          />
          <button type="submit" class="send-btn" [disabled]="!inputText.trim() || disabled()" title="Send message">
            <svg viewBox="0 0 24 24" class="svg-icon"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
      font-family: var(--ngx-font-family, system-ui, -apple-system, sans-serif);
    }

    .ngx-ai-chat-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--ngx-ai-chat-bg, #ffffff);
      border: 1px solid var(--ngx-ai-chat-border, #e2e8f0);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;
    }

    .ngx-ai-chat-container.dark-mode {
      --ngx-ai-chat-bg: #1e293b;
      --ngx-ai-chat-border: #334155;
      --ngx-ai-header-bg: #0f172a;
      --ngx-ai-header-text: #f8fafc;
      --ngx-ai-bubble-user-bg: #3b82f6;
      --ngx-ai-bubble-user-text: #ffffff;
      --ngx-ai-bubble-assistant-bg: #334155;
      --ngx-ai-bubble-assistant-text: #f8fafc;
      --ngx-ai-input-bg: #0f172a;
      --ngx-ai-input-text: #f8fafc;
      --ngx-ai-input-border: #334155;
    }

    /* Header */
    .ngx-ai-chat-header {
      display: flex;
      align-items: center;
      padding: 14px 18px;
      background: var(--ngx-ai-header-bg, #f8fafc);
      border-bottom: 1px solid var(--ngx-ai-chat-border, #e2e8f0);
      gap: 12px;
    }

    .header-avatar {
      position: relative;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: #fff;
      font-size: 14px;
    }

    .header-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }

    .status-indicator {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #94a3b8;
      border: 2px solid var(--ngx-ai-chat-bg, #fff);
    }

    .status-indicator.online {
      background: #10b981;
    }

    .header-info {
      flex: 1;
    }

    .agent-title {
      font-weight: 600;
      font-size: 15px;
      color: var(--ngx-ai-header-text, #1e293b);
    }

    .agent-status {
      font-size: 12px;
      color: #64748b;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }

    .header-btn {
      background: none;
      border: none;
      padding: 8px;
      border-radius: 50%;
      cursor: pointer;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s;
    }

    .header-btn:hover {
      background-color: rgba(100, 116, 139, 0.1);
    }

    .svg-icon {
      width: 20px;
      height: 20px;
      fill: currentColor;
    }

    /* Chat Body */
    .ngx-ai-chat-body {
      flex: 1;
      overflow-y: auto;
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
    }

    .messages-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .message-wrapper {
      display: flex;
      gap: 12px;
      max-width: 85%;
    }

    .message-wrapper.user-msg {
      align-self: flex-end;
      flex-direction: row-reverse;
      max-width: 75%;
    }

    .message-wrapper.assistant-msg {
      align-self: flex-start;
    }

    .msg-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-weight: 600;
      font-size: 12px;
      flex-shrink: 0;
    }

    .msg-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }

    .msg-bubble-container {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .user-msg .msg-bubble-container {
      align-items: flex-end;
    }

    .msg-sender {
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      margin-left: 4px;
    }

    .msg-bubble {
      padding: 12px 16px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.5;
      word-break: break-word;
    }

    .user-msg .msg-bubble {
      background: var(--ngx-ai-bubble-user-bg, #1a73e8);
      color: var(--ngx-ai-bubble-user-text, #ffffff);
      border-bottom-right-radius: 4px;
    }

    .assistant-msg .msg-bubble {
      background: var(--ngx-ai-bubble-assistant-bg, #f1f5f9);
      color: var(--ngx-ai-bubble-assistant-text, #1e293b);
      border-bottom-left-radius: 4px;
    }

    .msg-text {
      white-space: pre-wrap;
    }

    .msg-time {
      font-size: 10px;
      color: #94a3b8;
      margin: 0 4px;
    }

    /* Agent Steps Accordion */
    .agent-steps-container {
      margin-top: 10px;
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 8px;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.05);
    }

    .steps-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: rgba(148, 163, 184, 0.1);
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    }

    .steps-title-text {
      font-size: 12px;
      font-weight: 600;
      opacity: 0.8;
    }

    .steps-badge {
      font-size: 10px;
      font-weight: 700;
      background: rgba(148, 163, 184, 0.2);
      padding: 2px 6px;
      border-radius: 10px;
    }

    .steps-list {
      display: flex;
      flex-direction: column;
    }

    .agent-step-item {
      border-bottom: 1px solid rgba(148, 163, 184, 0.08);
    }

    .agent-step-item:last-child {
      border-bottom: none;
    }

    .step-summary {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      cursor: pointer;
      font-size: 12px;
      gap: 8px;
      transition: background-color 0.2s;
    }

    .step-summary:hover {
      background: rgba(148, 163, 184, 0.05);
    }

    .step-status-icon {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: bold;
      color: #fff;
    }

    .step-status-icon.success {
      background: #10b981;
    }

    .step-status-icon.error {
      background: #ef4444;
    }

    .step-status-icon.running {
      background: #3b82f6;
    }

    .step-name {
      flex: 1;
      font-weight: 500;
    }

    .step-duration {
      font-size: 10px;
      opacity: 0.6;
    }

    .step-chevron {
      font-size: 8px;
      transition: transform 0.2s;
      opacity: 0.5;
    }

    .step-chevron.expanded {
      transform: rotate(180deg);
    }

    .step-details {
      padding: 8px 12px;
      background: rgba(0, 0, 0, 0.02);
      display: flex;
      flex-direction: column;
      gap: 8px;
      border-top: 1px solid rgba(148, 163, 184, 0.05);
    }

    .step-detail-section {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .detail-label {
      font-size: 10px;
      font-weight: 600;
      opacity: 0.6;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .detail-code {
      margin: 0;
      padding: 6px 10px;
      background: rgba(0, 0, 0, 0.05);
      border-radius: 4px;
      font-family: monospace;
      font-size: 11px;
      overflow-x: auto;
      white-space: pre-wrap;
      max-height: 120px;
    }

    /* Structured Response Carousel Cards */
    .cards-carousel {
      display: flex;
      gap: 12px;
      overflow-x: auto;
      padding: 10px 4px 6px;
      margin-top: 8px;
      scroll-snap-type: x mandatory;
      scrollbar-width: thin;
    }

    .cards-carousel::-webkit-scrollbar {
      height: 6px;
    }
    .cards-carousel::-webkit-scrollbar-thumb {
      background: rgba(148, 163, 184, 0.3);
      border-radius: 3px;
    }

    .ai-carousel-card {
      flex: 0 0 240px;
      background: var(--ngx-ai-chat-bg, #fff);
      border: 1px solid var(--ngx-ai-chat-border, #e2e8f0);
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      scroll-snap-align: start;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }

    .card-img-container {
      height: 120px;
      overflow: hidden;
    }

    .card-img-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .card-body {
      padding: 12px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .card-title {
      font-size: 14px;
      font-weight: 600;
      margin: 0 0 2px;
    }

    .card-subtitle {
      font-size: 12px;
      font-weight: 500;
      color: #64748b;
      margin: 0 0 6px;
    }

    .card-description {
      font-size: 12px;
      color: #64748b;
      line-height: 1.4;
      margin: 0 0 12px;
      flex: 1;
    }

    .card-actions {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .card-action-btn {
      width: 100%;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 600;
      border-radius: 6px;
      border: 1px solid var(--ngx-ai-chat-border, #e2e8f0);
      background: none;
      cursor: pointer;
      transition: all 0.2s;
    }

    .card-action-btn.btn-primary {
      background: var(--ngx-ai-bubble-user-bg, #1a73e8);
      color: #fff;
      border-color: transparent;
    }

    .card-action-btn:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    /* Typing Indicator Bubble */
    .typing-bubble {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px 20px;
    }

    .typing-indicator {
      display: flex;
      gap: 4px;
    }

    .typing-indicator span {
      width: 8px;
      height: 8px;
      background: #94a3b8;
      border-radius: 50%;
      animation: typing 1.4s infinite ease-in-out both;
    }

    .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
    .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

    @keyframes typing {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1.0); }
    }

    /* Spinner */
    .spinner {
      width: 10px;
      height: 10px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: #fff;
      animation: spin 1s ease-in-out infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Quick Replies */
    .quick-replies-container {
      padding: 10px 16px 4px;
      background: transparent;
    }

    .quick-replies-list {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 6px;
      scrollbar-width: none;
    }

    .quick-replies-list::-webkit-scrollbar {
      display: none;
    }

    .quick-reply-btn {
      flex: 0 0 auto;
      padding: 6px 14px;
      border-radius: 18px;
      border: 1px solid var(--ngx-ai-chat-border, #e2e8f0);
      background: var(--ngx-ai-chat-bg, #fff);
      font-size: 13px;
      font-weight: 500;
      color: #64748b;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }

    .quick-reply-btn:hover {
      border-color: var(--ngx-ai-bubble-user-bg, #1a73e8);
      color: var(--ngx-ai-bubble-user-bg, #1a73e8);
      background-color: rgba(26, 115, 232, 0.04);
    }

    /* Chat Footer */
    .ngx-ai-chat-footer {
      padding: 14px 18px;
      background: var(--ngx-ai-header-bg, #f8fafc);
      border-top: 1px solid var(--ngx-ai-chat-border, #e2e8f0);
    }

    .input-form {
      display: flex;
      gap: 10px;
    }

    .chat-input {
      flex: 1;
      padding: 10px 14px;
      border-radius: 8px;
      border: 1px solid var(--ngx-ai-input-border, #cbd5e1);
      background: var(--ngx-ai-input-bg, #fff);
      color: var(--ngx-ai-input-text, #1e293b);
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }

    .chat-input:focus {
      border-color: var(--ngx-ai-bubble-user-bg, #1a73e8);
    }

    .send-btn {
      width: 38px;
      height: 38px;
      border-radius: 8px;
      background: var(--ngx-ai-bubble-user-bg, #1a73e8);
      color: #fff;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s, transform 0.1s;
    }

    .send-btn:hover:not(:disabled) {
      background-color: #1557b0;
      transform: translateY(-1px);
    }

    .send-btn:disabled {
      background-color: #94a3b8;
      cursor: not-allowed;
    }
  `]
})
export class AIChatComponent {
  messages = input<AIMessage[]>([]);
  agentName = input('AI Agent');
  agentAvatarUrl = input('');
  isOnline = input(true);
  isTyping = input(false);
  showSenderNames = input(false);
  theme = input<'light' | 'dark'>('light');
  placeholder = input('Type a message...');
  disabled = input(false);
  quickReplies = input<QuickReply[]>([]);
  avatarBg = input('#4f46e5');

  sendMessage = output<string>();
  quickReplyClick = output<QuickReply>();
  cardActionClick = output<AICardAction>();
  clearHistory = output<void>();

  chatBody = viewChild<ElementRef>('chatBody');

  inputText = '';

  constructor() {
    // Automatically scroll to bottom when messages or typing status changes
    effect(() => {
      this.messages();
      this.isTyping();
      this.scrollToBottom();
    });
  }

  onSubmit(): void {
    const text = this.inputText.trim();
    if (!text || this.disabled()) return;
    this.sendMessage.emit(text);
    this.inputText = '';
  }

  toggleStep(step: AgentStep): void {
    step.collapsed = !step.collapsed;
  }

  getCompletedStepsCount(steps: AgentStep[]): number {
    return steps.filter(s => s.status === 'success' || s.status === 'error').length;
  }

  getInitials(name: string): string {
    if (!name) return 'AI';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  scrollToBottom(): void {
    setTimeout(() => {
      const el = this.chatBody()?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }, 100);
  }

  formatMessage(content: string): string {
    if (!content) return '';
    // Very basic escaping and formatting to keep it lightweight.
    // In actual project, a custom template or markdown pipe can be used.
    let formatted = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Bold markdown helper
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Code blocks helper
    formatted = formatted.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      const language = lang || 'code';
      return `
        <div class="code-container" style="background: rgba(0,0,0,0.05); padding: 8px 12px; border-radius: 6px; font-family: monospace; font-size: 12px; margin: 8px 0; border-left: 3px solid #3b82f6; overflow-x: auto;">
          <div style="font-size: 10px; font-weight: bold; opacity: 0.6; margin-bottom: 4px; text-transform: uppercase;">${language}</div>
          <pre style="margin: 0; white-space: pre-wrap;"><code>${code.trim()}</code></pre>
        </div>
      `;
    });

    // Inline code helper
    formatted = formatted.replace(/`(.*?)`/g, '<code style="background: rgba(0,0,0,0.06); padding: 2px 4px; border-radius: 4px; font-family: monospace; font-size: 12px;">$1</code>');

    return formatted;
  }
}
