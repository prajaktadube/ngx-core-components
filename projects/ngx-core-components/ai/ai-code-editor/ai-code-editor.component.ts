import { Component, input, signal, output, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'ngx-ai-code-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="code-editor-wrapper" [class.dark]="theme() === 'dark'" [class.focused]="isFocused()">
      <!-- Toolbar Header -->
      <div class="editor-header">
        <div class="header-left">
          <span class="editor-dot red"></span>
          <span class="editor-dot yellow"></span>
          <span class="editor-dot green"></span>
          <span class="editor-lang-badge">{{ language() | uppercase }}</span>
        </div>
        <div class="header-right">
          <span class="ai-pill">✨ AI Suggestion Active</span>
          <button class="icon-btn" (click)="copyCode()" [title]="copyTooltip()">
            {{ copyText() }}
          </button>
        </div>
      </div>

      <!-- Editor Canvas -->
      <div class="editor-canvas" (click)="focusTextarea()">
        <!-- Line Numbers -->
        <div class="line-numbers">
          @for (line of lines(); track $index) {
            <div class="line-num">{{ $index + 1 }}</div>
          }
        </div>

        <!-- Code Content Area -->
        <div class="code-content-container">
          <textarea
            #editorInput
            class="hidden-textarea"
            [ngModel]="code()"
            (ngModelChange)="onCodeChange($event)"
            (focus)="isFocused.set(true)"
            (blur)="isFocused.set(false)"
            (keydown)="handleKeydown($event)"
            [disabled]="disabled()"
          ></textarea>

          <!-- Rendered Code Grid with Ghost Text -->
          <pre class="rendered-code"><code>{{ code() }}<span class="cursor-pipe" *ngIf="isFocused()">|</span><span 
            *ngIf="suggestion() && !suggestionAccepted()" 
            class="ghost-text"
          >{{ suggestion() }}</span></code></pre>
        </div>
      </div>

      <!-- Suggestion Panel Controls -->
      <div class="editor-footer" *ngIf="suggestion() && !suggestionAccepted()">
        <div class="suggestion-info">
          <span class="sparkle">✨</span>
          <span class="desc">Press <kbd class="editor-kbd">Tab</kbd> to accept suggestion, or <kbd class="editor-kbd">Esc</kbd> to dismiss.</span>
        </div>
        <div class="action-buttons">
          <button class="footer-btn reject-btn" (click)="decline()">Decline (Esc)</button>
          <button class="footer-btn accept-btn" (click)="accept()">Accept (Tab)</button>
        </div>
      </div>

      <!-- Explanation Panel -->
      <div class="explanation-panel" *ngIf="explanation() && showExplanation()">
        <div class="explanation-header">
          <span class="sparkle">💡 AI Explanation</span>
          <button class="close-explanation-btn" (click)="showExplanation.set(false)">✕</button>
        </div>
        <div class="explanation-body">
          {{ explanation() }}
        </div>
      </div>

      <!-- Secondary Panel Controls (when suggestion is accepted or inactive) -->
      <div class="editor-footer justify-end" *ngIf="!suggestion() || suggestionAccepted()">
        <div class="action-buttons">
          <button class="footer-btn secondary-btn" (click)="explainSuggestedCode()">Explain Code</button>
          <button class="footer-btn primary-btn" (click)="triggerRegenerate()">Re-generate Suggestion</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
    }

    .code-editor-wrapper {
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: var(--radius-md, 10px);
      background: var(--bg-secondary, #ffffff);
      box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.08));
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .code-editor-wrapper.focused {
      border-color: var(--primary-color, #4f46e5);
      box-shadow: 0 0 0 3px var(--primary-glow, rgba(79, 70, 229, 0.15));
    }

    /* Toolbar Header */
    .editor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 16px;
      background: var(--border-light, #f1f5f9);
      border-bottom: 1px solid var(--border-color, #e2e8f0);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .editor-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .editor-dot.red { background: #ef4444; }
    .editor-dot.yellow { background: #f59e0b; }
    .editor-dot.green { background: #10b981; }

    .editor-lang-badge {
      margin-left: 10px;
      font-size: 11px;
      font-weight: 700;
      color: var(--text-secondary, #475569);
      background: rgba(0, 0, 0, 0.05);
      padding: 2px 6px;
      border-radius: 4px;
      letter-spacing: 0.5px;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .ai-pill {
      font-size: 11px;
      font-weight: 600;
      background: linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%);
      color: #6d28d9;
      padding: 2px 8px;
      border-radius: 9999px;
      border: 1px solid rgba(124, 58, 237, 0.2);
    }

    .icon-btn {
      background: transparent;
      border: none;
      color: var(--text-secondary, #475569);
      cursor: pointer;
      font-size: 11px;
      padding: 4px 8px;
      border-radius: 4px;
      transition: background 0.2s;
    }
    .icon-btn:hover {
      background: rgba(0, 0, 0, 0.05);
      color: var(--text-primary, #0f172a);
    }

    /* Editor Canvas */
    .editor-canvas {
      display: flex;
      flex-direction: row;
      position: relative;
      min-height: 150px;
      background: var(--bg-secondary, #ffffff);
      cursor: text;
    }

    .line-numbers {
      padding: 16px 8px 16px 12px;
      border-right: 1px solid var(--border-color, #e2e8f0);
      background: rgba(0, 0, 0, 0.01);
      user-select: none;
      text-align: right;
      min-width: 40px;
    }

    .line-num {
      color: var(--text-muted, #94a3b8);
      font-size: 12px;
      line-height: 1.6;
      height: 19.2px;
    }

    .code-content-container {
      position: relative;
      flex: 1;
      overflow: hidden;
    }

    .hidden-textarea {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      z-index: 2;
      resize: none;
      border: none;
      outline: none;
      padding: 16px;
      font-family: inherit;
      font-size: 13px;
      line-height: 1.6;
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    .rendered-code {
      margin: 0;
      padding: 16px;
      font-family: inherit;
      font-size: 13px;
      line-height: 1.6;
      color: var(--text-primary, #0f172a);
      white-space: pre-wrap;
      word-wrap: break-word;
      pointer-events: none;
      z-index: 1;
      overflow-y: auto;
    }

    .cursor-pipe {
      color: var(--primary-color, #4f46e5);
      font-weight: bold;
      animation: blink 1s step-end infinite;
    }

    @keyframes blink {
      from, to { opacity: 0; }
      50% { opacity: 1; }
    }

    .ghost-text {
      color: var(--text-muted, #94a3b8);
      font-style: italic;
      opacity: 0.7;
    }

    /* Footer controls */
    .editor-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: var(--border-light, #f1f5f9);
      border-top: 1px solid var(--border-color, #e2e8f0);
      gap: 12px;
      flex-wrap: wrap;
    }

    .editor-footer.justify-end {
      justify-content: flex-end;
    }

    .suggestion-info {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: var(--text-secondary, #475569);
    }

    .sparkle {
      font-size: 14px;
    }

    .editor-kbd {
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 3px;
      box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1);
      padding: 1px 4px;
      font-size: 11px;
      font-family: sans-serif;
      font-weight: 600;
      color: var(--text-primary, #0f172a);
    }

    .action-buttons {
      display: flex;
      gap: 8px;
    }

    .footer-btn {
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      font-family: var(--ngx-font-family, sans-serif);
      transition: all 0.2s;
    }

    .accept-btn {
      background: var(--primary-color, #4f46e5);
      border: 1px solid var(--primary-color, #4f46e5);
      color: #ffffff;
    }
    .accept-btn:hover {
      background: var(--primary-hover, #4338ca);
    }

    .reject-btn {
      background: transparent;
      border: 1px solid var(--border-color, #e2e8f0);
      color: var(--text-secondary, #475569);
    }
    .reject-btn:hover {
      background: rgba(0, 0, 0, 0.04);
      border-color: var(--text-secondary, #475569);
    }

    .primary-btn {
      background: var(--primary-color, #4f46e5);
      border: 1px solid var(--primary-color, #4f46e5);
      color: #ffffff;
    }
    .primary-btn:hover {
      background: var(--primary-hover, #4338ca);
    }

    .secondary-btn {
      background: transparent;
      border: 1px solid var(--border-color, #e2e8f0);
      color: var(--text-secondary, #475569);
    }
    .secondary-btn:hover {
      background: rgba(0, 0, 0, 0.04);
    }

    /* Explanation Panel */
    .explanation-panel {
      background: linear-gradient(to right, rgba(79, 70, 229, 0.03), rgba(124, 58, 237, 0.03));
      border-top: 1px solid var(--border-color, #e2e8f0);
      padding: 16px;
    }

    .explanation-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-weight: 700;
      font-size: 13px;
      color: var(--primary-color, #4f46e5);
      font-family: var(--ngx-font-family, sans-serif);
    }

    .close-explanation-btn {
      background: transparent;
      border: none;
      color: var(--text-muted, #94a3b8);
      font-size: 14px;
      cursor: pointer;
    }
    .close-explanation-btn:hover {
      color: var(--text-primary, #0f172a);
    }

    .explanation-body {
      font-size: 12px;
      line-height: 1.6;
      color: var(--text-secondary, #475569);
      font-family: var(--ngx-font-family, sans-serif);
    }

    /* Dark Mode overrides */
    .code-editor-wrapper.dark {
      border-color: #1f2937;
      background: #0f172a;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
    }
    .code-editor-wrapper.dark .editor-header {
      background: #1e293b;
      border-bottom-color: #1f2937;
    }
    .code-editor-wrapper.dark .editor-lang-badge {
      color: #94a3b8;
      background: rgba(255, 255, 255, 0.05);
    }
    .code-editor-wrapper.dark .icon-btn {
      color: #94a3b8;
    }
    .code-editor-wrapper.dark .icon-btn:hover {
      background: rgba(255, 255, 255, 0.05);
      color: #f8fafc;
    }
    .code-editor-wrapper.dark .ai-pill {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
      color: #a5b4fc;
      border-color: rgba(168, 85, 247, 0.2);
    }
    .code-editor-wrapper.dark .editor-canvas {
      background: #0f172a;
    }
    .code-editor-wrapper.dark .line-numbers {
      border-right-color: #1f2937;
      background: rgba(255, 255, 255, 0.01);
    }
    .code-editor-wrapper.dark .line-num {
      color: #4b5563;
    }
    .code-editor-wrapper.dark .rendered-code {
      color: #e2e8f0;
    }
    .code-editor-wrapper.dark .ghost-text {
      color: #4b5563;
    }
    .code-editor-wrapper.dark .editor-footer {
      background: #1e293b;
      border-top-color: #1f2937;
    }
    .code-editor-wrapper.dark .suggestion-info {
      color: #94a3b8;
    }
    .code-editor-wrapper.dark .editor-kbd {
      background: #0f172a;
      border-color: #1f2937;
      color: #f8fafc;
    }
    .code-editor-wrapper.dark .reject-btn {
      border-color: #374151;
      color: #94a3b8;
    }
    .code-editor-wrapper.dark .reject-btn:hover {
      background: rgba(255, 255, 255, 0.04);
      border-color: #94a3b8;
    }
    .code-editor-wrapper.dark .secondary-btn {
      border-color: #374151;
      color: #94a3b8;
    }
    .code-editor-wrapper.dark .secondary-btn:hover {
      background: rgba(255, 255, 255, 0.04);
    }
    .code-editor-wrapper.dark .explanation-panel {
      background: linear-gradient(to right, rgba(99, 102, 241, 0.03), rgba(168, 85, 247, 0.03));
      border-top-color: #1f2937;
    }
    .code-editor-wrapper.dark .explanation-header {
      color: #818cf8;
    }
    .code-editor-wrapper.dark .explanation-body {
      color: #94a3b8;
    }
  `]
})
export class AICodeEditorComponent {
  // Inputs
  code = input<string>('');
  suggestion = input<string>('');
  language = input<string>('typescript');
  theme = input<'light' | 'dark'>('light');
  disabled = input<boolean>(false);
  explanation = input<string>('');

  // Outputs
  codeChange = output<string>();
  acceptSuggestion = output<void>();
  declineSuggestion = output<void>();
  regenerate = output<void>();

  // State
  isFocused = signal<boolean>(false);
  suggestionAccepted = signal<boolean>(false);
  showExplanation = signal<boolean>(false);
  copyText = signal<string>('Copy');
  copyTooltip = signal<string>('Copy code to clipboard');

  // Lines computed property for line numbers
  lines = () => {
    const rawCode = this.code() || '';
    return rawCode.split('\n');
  };

  @ViewChild('editorInput') editorInput!: any;

  focusTextarea() {
    if (this.disabled()) return;
    if (this.editorInput && this.editorInput.nativeElement) {
      this.editorInput.nativeElement.focus();
    }
  }

  onCodeChange(newVal: string) {
    this.codeChange.emit(newVal);
    // If the suggestion is pending and user edits, we reset the acceptance signal
    if (this.suggestionAccepted()) {
      this.suggestionAccepted.set(false);
    }
  }

  handleKeydown(event: KeyboardEvent) {
    if (this.disabled()) return;

    // Tab accepts suggestion if available
    if (event.key === 'Tab' && this.suggestion() && !this.suggestionAccepted()) {
      event.preventDefault();
      this.accept();
    }

    // Esc declines suggestion if available
    if (event.key === 'Escape' && this.suggestion() && !this.suggestionAccepted()) {
      event.preventDefault();
      this.decline();
    }
  }

  accept() {
    this.suggestionAccepted.set(true);
    const fullCode = this.code() + this.suggestion();
    this.codeChange.emit(fullCode);
    this.acceptSuggestion.emit();
  }

  decline() {
    this.declineSuggestion.emit();
  }

  triggerRegenerate() {
    this.suggestionAccepted.set(false);
    this.showExplanation.set(false);
    this.regenerate.emit();
  }

  explainSuggestedCode() {
    this.showExplanation.set(true);
  }

  copyCode() {
    const combined = this.code() + (this.suggestionAccepted() ? '' : this.suggestion());
    navigator.clipboard.writeText(combined).then(() => {
      this.copyText.set('Copied!');
      setTimeout(() => this.copyText.set('Copy'), 2000);
    });
  }
}
