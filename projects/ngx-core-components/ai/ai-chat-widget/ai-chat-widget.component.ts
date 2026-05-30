import { Component, input, signal, output, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface WidgetMessage {
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

@Component({
  selector: 'ngx-ai-chat-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Floating Action Button (FAB) -->
    <button
      class="widget-fab"
      [class.active]="isOpen()"
      (click)="toggleOpen()"
      [title]="isOpen() ? 'Close Chat' : 'Open Chat'"
    >
      <span class="fab-icon">{{ isOpen() ? '✕' : icon() }}</span>
    </button>

    <!-- Chat Overlay Pane -->
    <div class="widget-overlay-pane" [class.open]="isOpen()">
      <!-- Header -->
      <div class="widget-header">
        <div class="header-details">
          <div class="widget-avatar">🤖</div>
          <div>
            <h4 class="widget-title">{{ agentName() }}</h4>
            <span class="widget-status">Online</span>
          </div>
        </div>
        <button class="close-btn" (click)="closeOpen()">✕</button>
      </div>

      <!-- Feed Body -->
      <div class="widget-body" #scrollContainer>
        @for (msg of messages(); track $index) {
          <div class="message-row" [class.user-row]="msg.sender === 'user'">
            @if (msg.sender === 'assistant') {
              <div class="msg-avatar">🤖</div>
            }
            <div class="msg-bubble" [class.user-bubble]="msg.sender === 'user'">
              <div class="msg-text">{{ msg.text }}</div>
              <div class="msg-time">{{ msg.timestamp | date:'shortTime' }}</div>
            </div>
          </div>
        }
      </div>

      <!-- Quick Replies -->
      @if (quickReplies().length > 0) {
        <div class="widget-quick-replies">
          @for (reply of quickReplies(); track reply) {
            <button class="reply-pill" (click)="selectReply(reply)">
              {{ reply }}
            </button>
          }
        </div>
      }

      <!-- Footer Input -->
      <div class="widget-footer">
        <input
          #inputBox
          type="text"
          [placeholder]="placeholder()"
          (keydown.enter)="sendMessage(inputBox.value); inputBox.value = ''"
          class="widget-input"
        />
        <button
          class="send-btn"
          (click)="sendMessage(inputBox.value); inputBox.value = ''"
        >
          ➔
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      font-family: inherit;
    }

    /* FAB styling */
    .widget-fab {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      border: none;
      background: var(--primary-gradient, linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%));
      color: #ffffff;
      font-size: 24px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 16px rgba(79, 70, 229, 0.4);
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .widget-fab:hover {
      transform: scale(1.06);
    }
    .widget-fab.active {
      transform: rotate(90deg) scale(0.95);
      background: #0f172a;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .fab-icon {
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Overlay container pane */
    .widget-overlay-pane {
      position: absolute;
      bottom: 72px;
      right: 0;
      width: 360px;
      height: 500px;
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 16px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      transform: translateY(20px) scale(0.95);
      pointer-events: none;
      transition: all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
      transform-origin: bottom right;
    }
    .widget-overlay-pane.open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }

    /* Header styling */
    .widget-header {
      padding: 14px 16px;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .header-details {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .widget-avatar {
      font-size: 20px;
      background: rgba(255, 255, 255, 0.1);
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .widget-title {
      margin: 0;
      font-size: 14px;
      font-weight: 750;
    }
    .widget-status {
      font-size: 10px;
      color: #10b981;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .widget-status::before {
      content: '';
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #10b981;
    }
    .close-btn {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.6);
      font-size: 16px;
      cursor: pointer;
      padding: 4px;
      transition: color 0.15s;
    }
    .close-btn:hover {
      color: #ffffff;
    }

    /* Body messages list feed */
    .widget-body {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: var(--bg-primary, #f8fafc);
    }
    .message-row {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      max-width: 85%;
    }
    .message-row.user-row {
      align-self: flex-end;
      flex-direction: row-reverse;
    }
    .msg-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      flex-shrink: 0;
    }
    .msg-bubble {
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      padding: 10px 12px;
      border-radius: 12px;
      border-top-left-radius: 2px;
      box-shadow: var(--shadow-sm);
    }
    .message-row.user-row .msg-bubble {
      background: var(--primary-color, #4f46e5);
      color: #ffffff;
      border: none;
      border-top-left-radius: 12px;
      border-top-right-radius: 2px;
    }
    .msg-text {
      font-size: 13px;
      line-height: 1.5;
      word-break: break-word;
    }
    .msg-time {
      font-size: 9px;
      color: var(--text-secondary, #64748b);
      text-align: right;
      margin-top: 4px;
    }
    .message-row.user-row .msg-time {
      color: rgba(255, 255, 255, 0.7);
    }

    /* Quick replies section */
    .widget-quick-replies {
      padding: 8px 12px;
      background: var(--bg-primary, #f8fafc);
      display: flex;
      gap: 6px;
      overflow-x: auto;
      border-top: 1px solid var(--border-color, #e2e8f0);
      white-space: nowrap;
    }
    .widget-quick-replies::-webkit-scrollbar {
      display: none;
    }
    .reply-pill {
      padding: 6px 12px;
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--primary-color, #4f46e5);
      color: var(--primary-color, #4f46e5);
      border-radius: 16px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
      font-family: inherit;
    }
    .reply-pill:hover {
      background: var(--primary-color, #4f46e5);
      color: #ffffff;
    }

    /* Footer text area input */
    .widget-footer {
      padding: 12px 14px;
      background: var(--bg-secondary, #ffffff);
      border-top: 1px solid var(--border-color, #e2e8f0);
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .widget-input {
      flex: 1;
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 20px;
      padding: 8px 16px;
      font-size: 13px;
      outline: none;
      background: var(--bg-primary, #f8fafc);
      color: var(--text-primary, #0f172a);
      transition: border-color 0.15s;
    }
    .widget-input:focus {
      border-color: var(--primary-color, #4f46e5);
    }
    .send-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: none;
      background: var(--primary-color, #4f46e5);
      color: #ffffff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      transition: background 0.15s;
    }
    .send-btn:hover {
      background: var(--primary-color-dark, #3730a3);
    }
  `]
})
export class AIChatWidgetComponent {
  agentName = input<string>('AI Assistant');
  icon = input<string>('💬');
  placeholder = input<string>('Type a message...');
  welcomeMessage = input<string>('Hi! How can I help you today?');
  quickReplies = input<string[]>([]);

  messageSent = output<string>();

  isOpen = signal<boolean>(false);
  messages = signal<WidgetMessage[]>([]);

  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  toggleOpen(): void {
    this.isOpen.update(o => !o);
    if (this.isOpen() && this.messages().length === 0) {
      this.messages.set([
        { sender: 'assistant', text: this.welcomeMessage(), timestamp: new Date() }
      ]);
    }
  }

  closeOpen(): void {
    this.isOpen.set(false);
  }

  sendMessage(text: string): void {
    const trimmed = text.trim();
    if (!trimmed) return;

    this.messages.update(msgs => [
      ...msgs,
      { sender: 'user', text: trimmed, timestamp: new Date() }
    ]);
    this.messageSent.emit(trimmed);
    this.scrollToBottom();
  }

  selectReply(reply: string): void {
    this.sendMessage(reply);
  }

  addAssistantReply(text: string): void {
    this.messages.update(msgs => [
      ...msgs,
      { sender: 'assistant', text, timestamp: new Date() }
    ]);
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.scrollContainer?.nativeElement) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    }, 50);
  }
}
