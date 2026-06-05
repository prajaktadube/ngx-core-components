import { Component, input, signal, output, HostListener, ViewChild, computed } from '@angular/core';
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
          <button 
            *ngIf="hasSuggestion() && !suggestionAccepted()"
            class="toolbar-toggle-btn"
            [class.active]="diffMode()"
            (click)="toggleDiffMode()"
          >
            {{ diffMode() ? '👁️ Editor' : '🔍 Diff View' }}
          </button>
          <span class="ai-pill">✨ AI Suggestion Active</span>
          <button class="icon-btn" (click)="copyCode()" [title]="copyTooltip()">
            {{ copyText() }}
          </button>
        </div>
      </div>

      <!-- Editor Canvas -->
      <div class="editor-canvas" *ngIf="!diffMode()" (click)="focusTextarea()">
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
          <pre class="rendered-code"><code><span [innerHTML]="highlightedCode()"></span><span class="cursor-pipe" *ngIf="isFocused()">|</span><span 
            *ngIf="hasSuggestion() && !suggestionAccepted()" 
            class="ghost-text"
          >{{ currentSuggestion() }}</span></code></pre>
        </div>
      </div>

      <!-- Diff Canvas -->
      <div class="diff-canvas" *ngIf="diffMode() && hasSuggestion() && !suggestionAccepted()">
        <!-- Left original panel -->
        <div class="diff-pane original-pane">
          <div class="diff-pane-title">Original</div>
          <pre class="diff-code"><code>{{ code() }}</code></pre>
        </div>
        <!-- Right proposed panel -->
        <div class="diff-pane proposed-pane">
          <div class="diff-pane-title">Proposed</div>
          <pre class="diff-code"><code>{{ code() }}<span class="diff-highlight">{{ currentSuggestion() }}</span></code></pre>
        </div>
      </div>

      <!-- Suggestion Panel Controls -->
      <div class="editor-footer" *ngIf="hasSuggestion() && !suggestionAccepted()">
        <div class="suggestion-info">
          <span class="sparkle">✨</span>
          <span class="desc">Press <kbd class="editor-kbd">Tab</kbd> to accept, or <kbd class="editor-kbd">Esc</kbd> to dismiss.</span>
          @if (suggestions().length > 1) {
            <div class="suggestions-navigator">
              <button type="button" class="nav-arrow" (click)="prevSuggestion()" title="Previous suggestion">◀</button>
              <span class="nav-count">{{ activeSuggestionIndex() + 1 }} / {{ suggestions().length }}</span>
              <button type="button" class="nav-arrow" (click)="nextSuggestion()" title="Next suggestion">▶</button>
            </div>
          }
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
      <div class="editor-footer justify-end" *ngIf="!hasSuggestion() || suggestionAccepted()">
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

    /* Toolbar Toggle Button */
    .toolbar-toggle-btn {
      background: transparent;
      border: 1px solid var(--border-color, #cbd5e1);
      border-radius: 6px;
      color: var(--text-secondary, #475569);
      cursor: pointer;
      font-size: 11px;
      font-weight: 600;
      padding: 4px 8px;
      font-family: inherit;
      transition: all 0.2s;
    }
    .toolbar-toggle-btn:hover {
      background: rgba(0, 0, 0, 0.05);
      border-color: var(--text-primary, #0f172a);
      color: var(--text-primary, #0f172a);
    }
    .toolbar-toggle-btn.active {
      background: var(--primary-color, #4f46e5);
      border-color: var(--primary-color, #4f46e5);
      color: #ffffff;
    }

    /* Diff Canvas */
    .diff-canvas {
      display: grid;
      grid-template-columns: 1fr 1fr;
      min-height: 180px;
      background: var(--bg-secondary, #ffffff);
      border-bottom: 1px solid var(--border-color, #e2e8f0);
    }
    .diff-pane {
      display: flex;
      flex-direction: column;
      border-right: 1px solid var(--border-color, #e2e8f0);
    }
    .diff-pane:last-child {
      border-right: none;
    }
    .diff-pane-title {
      padding: 6px 12px;
      background: rgba(0, 0, 0, 0.02);
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--text-secondary, #64748b);
      border-bottom: 1px solid var(--border-color, #e2e8f0);
    }
    .diff-code {
      margin: 0;
      padding: 12px;
      font-family: inherit;
      font-size: 12px;
      line-height: 1.6;
      white-space: pre-wrap;
      overflow-y: auto;
      flex: 1;
    }
    .original-pane .diff-code {
      background: rgba(239, 68, 68, 0.02);
      color: #991b1b;
    }
    .proposed-pane .diff-code {
      background: rgba(16, 185, 129, 0.02);
    }
    .diff-highlight {
      background: rgba(16, 185, 129, 0.15);
      color: #065f46;
      border-radius: 2px;
      padding: 1px 2px;
      font-weight: 600;
    }

    /* Suggestions Navigator */
    .suggestions-navigator {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-left: 12px;
      padding-left: 12px;
      border-left: 1px solid var(--border-color, #cbd5e1);
    }
    .nav-arrow {
      background: none;
      border: none;
      color: var(--primary-color, #4f46e5);
      cursor: pointer;
      font-size: 10px;
      padding: 2px 4px;
      border-radius: 4px;
      transition: background 0.2s;
    }
    .nav-arrow:hover {
      background: rgba(79, 70, 229, 0.1);
    }
    .nav-count {
      font-size: 11px;
      font-weight: 700;
      color: var(--text-primary, #0f172a);
    }

    /* Dark Mode Diff Styling */
    .code-editor-wrapper.dark .toolbar-toggle-btn {
      border-color: #374151;
      color: #94a3b8;
    }
    .code-editor-wrapper.dark .toolbar-toggle-btn:hover {
      background: rgba(255, 255, 255, 0.05);
      color: #f8fafc;
    }
    .code-editor-wrapper.dark .toolbar-toggle-btn.active {
      background: var(--primary-color, #6366f1);
      border-color: var(--primary-color, #6366f1);
      color: #ffffff;
    }
    .code-editor-wrapper.dark .diff-canvas {
      background: #0f172a;
      border-bottom-color: #1f2937;
    }
    .code-editor-wrapper.dark .diff-pane {
      border-right-color: #1f2937;
    }
    .code-editor-wrapper.dark .diff-pane-title {
      background: rgba(255, 255, 255, 0.02);
      color: #94a3b8;
      border-bottom-color: #1f2937;
    }
    .code-editor-wrapper.dark .original-pane .diff-code {
      background: rgba(239, 68, 68, 0.05);
      color: #fca5a5;
    }
    .code-editor-wrapper.dark .proposed-pane .diff-code {
      background: rgba(16, 185, 129, 0.05);
      color: #e2e8f0;
    }
    .code-editor-wrapper.dark .diff-highlight {
      background: rgba(16, 185, 129, 0.25);
      color: #34d399;
    }
    .code-editor-wrapper.dark .suggestions-navigator {
      border-left-color: #374151;
    }
    .code-editor-wrapper.dark .nav-count {
      color: #cbd5e1;
    }
    .code-editor-wrapper.dark .nav-arrow {
      color: #818cf8;
    }
    .code-editor-wrapper.dark .nav-arrow:hover {
      background: rgba(99, 102, 241, 0.15);
    }

    /* Syntax Highlighting */
    .hl-keyword { color: #2563eb; font-weight: 600; }
    .hl-builtin { color: #7c3aed; }
    .hl-number { color: #ea580c; }
    .hl-string { color: #16a34a; }
    .hl-comment { color: #94a3b8; font-style: italic; }
    .hl-function { color: #d97706; }
    .hl-tag { color: #2563eb; }
    .hl-attr { color: #7c3aed; }
    .hl-class { color: #d97706; }
    .hl-id { color: #ef4444; }
    .hl-pseudo { color: #8b5cf6; }
    .hl-property { color: #0284c7; }
    .hl-key { color: #2563eb; font-weight: 600; }

    .code-editor-wrapper.dark .hl-keyword { color: #60a5fa; }
    .code-editor-wrapper.dark .hl-builtin { color: #a78bfa; }
    .code-editor-wrapper.dark .hl-number { color: #fb923c; }
    .code-editor-wrapper.dark .hl-string { color: #4ade80; }
    .code-editor-wrapper.dark .hl-comment { color: #64748b; }
    .code-editor-wrapper.dark .hl-function { color: #f59e0b; }
    .code-editor-wrapper.dark .hl-tag { color: #60a5fa; }
    .code-editor-wrapper.dark .hl-attr { color: #a78bfa; }
    .code-editor-wrapper.dark .hl-class { color: #f59e0b; }
    .code-editor-wrapper.dark .hl-id { color: #f87171; }
    .code-editor-wrapper.dark .hl-pseudo { color: #c084fc; }
    .code-editor-wrapper.dark .hl-property { color: #38bdf8; }
    .code-editor-wrapper.dark .hl-key { color: #60a5fa; }
  `]
})
export class AICodeEditorComponent {
  // Inputs
  code = input<string>('');
  suggestion = input<string>('');
  suggestions = input<string[]>([]);
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

  activeSuggestionIndex = signal<number>(0);
  diffMode = signal<boolean>(false);

  // Computed suggestion resolution
  currentSuggestion = computed(() => {
    const list = this.suggestions() || [];
    if (list.length > 0) {
      const idx = this.activeSuggestionIndex();
      return list[idx] || '';
    }
    return this.suggestion() || '';
  });

  hasSuggestion = computed(() => !!this.currentSuggestion());

  // Lines computed property for line numbers
  lines = () => {
    const rawCode = this.code() || '';
    return rawCode.split('\n');
  };

  highlightedCode = computed(() => {
    const raw = this.code() || '';
    if (!raw) return '';
    const escaped = this.escapeHtml(raw);
    const lang = (this.language() || 'typescript').toLowerCase();

    if (lang === 'typescript' || lang === 'javascript' || lang === 'js' || lang === 'ts') {
      return this.highlightJS(escaped);
    } else if (lang === 'json') {
      return this.highlightJSON(escaped);
    } else if (lang === 'css') {
      return this.highlightCSS(escaped);
    } else if (lang === 'html' || lang === 'xml') {
      return this.highlightHTML(escaped);
    }
    return escaped;
  });

  private highlightJS(text: string): string {
    const comments: string[] = [];
    const strings: string[] = [];
    let temp = text;

    temp = temp.replace(/\/\*[\s\S]*?\*\//g, (match) => {
      comments.push(match);
      return `___COMMENT_${comments.length - 1}___`;
    });

    temp = temp.replace(/(?<!:)\/\/.*$/gm, (match) => {
      comments.push(match);
      return `___COMMENT_${comments.length - 1}___`;
    });

    temp = temp.replace(/"(\\.|[^"\\])*"/g, (match) => {
      strings.push(match);
      return `___STRING_${strings.length - 1}___`;
    });

    temp = temp.replace(/'(\\.|[^'\\])*'/g, (match) => {
      strings.push(match);
      return `___STRING_${strings.length - 1}___`;
    });

    temp = temp.replace(/`(\\.|[^`\\])*`/g, (match) => {
      strings.push(match);
      return `___STRING_${strings.length - 1}___`;
    });

    const keywords = [
      'const', 'let', 'var', 'function', 'class', 'return', 'import', 'export', 'from', 'as',
      'extends', 'implements', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break',
      'continue', 'default', 'new', 'this', 'typeof', 'instanceof', 'async', 'await',
      'try', 'catch', 'finally', 'throw', 'interface', 'type', 'readonly', 'private',
      'public', 'protected', 'constructor', 'super', 'get', 'set'
    ];

    const builtins = [
      'String', 'Number', 'Boolean', 'Array', 'Object', 'Function', 'Promise', 'Observable',
      'signal', 'computed', 'input', 'output', 'Component', 'Injectable', 'Directive', 'Pipe', 'NgModule',
      'true', 'false', 'null', 'undefined'
    ];

    const keywordRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
    temp = temp.replace(keywordRegex, '<span class="hl-keyword">$1</span>');

    const builtinRegex = new RegExp(`\\b(${builtins.join('|')})\\b`, 'g');
    temp = temp.replace(builtinRegex, '<span class="hl-builtin">$1</span>');

    temp = temp.replace(/\b(\d+)\b/g, '<span class="hl-number">$1</span>');
    temp = temp.replace(/\b(\w+)(?=\()/g, '<span class="hl-function">$1</span>');

    strings.forEach((str, idx) => {
      temp = temp.replace(`___STRING_${idx}___`, `<span class="hl-string">${str}</span>`);
    });

    comments.forEach((comment, idx) => {
      temp = temp.replace(`___COMMENT_${idx}___`, `<span class="hl-comment">${comment}</span>`);
    });

    return temp;
  }

  private highlightCSS(text: string): string {
    const comments: string[] = [];
    const strings: string[] = [];
    let temp = text;

    temp = temp.replace(/\/\*[\s\S]*?\*\//g, (match) => {
      comments.push(match);
      return `___COMMENT_${comments.length - 1}___`;
    });

    temp = temp.replace(/"(\\.|[^"\\])*"/g, (match) => {
      strings.push(match);
      return `___STRING_${strings.length - 1}___`;
    });
    temp = temp.replace(/'(\\.|[^'\\])*'/g, (match) => {
      strings.push(match);
      return `___STRING_${strings.length - 1}___`;
    });

    temp = temp.replace(/(\.[a-zA-Z_-][\w_-]*)/g, '<span class="hl-class">$1</span>');
    temp = temp.replace(/(#[a-zA-Z_-][\w_-]*)/g, '<span class="hl-id">$1</span>');
    temp = temp.replace(/(:\w+)\b/g, '<span class="hl-pseudo">$1</span>');
    temp = temp.replace(/\b([a-zA-Z-]+)(?=\s*:)/g, '<span class="hl-property">$1</span>');
    temp = temp.replace(/\b(\d+(?:px|em|rem|%|ms|s|deg|fr|vh|vw|pt)?)\b/g, '<span class="hl-number">$1</span>');

    strings.forEach((str, idx) => {
      temp = temp.replace(`___STRING_${idx}___`, `<span class="hl-string">${str}</span>`);
    });
    comments.forEach((comment, idx) => {
      temp = temp.replace(`___COMMENT_${idx}___`, `<span class="hl-comment">${comment}</span>`);
    });

    return temp;
  }

  private highlightHTML(text: string): string {
    let temp = text;
    const comments: string[] = [];
    temp = temp.replace(/&lt;!--[\s\S]*?--&gt;/g, (match) => {
      comments.push(match);
      return `___COMMENT_${comments.length - 1}___`;
    });

    temp = temp.replace(/(&lt;\/?[a-zA-Z0-9:-]+)/g, '<span class="hl-tag">$1</span>');
    temp = temp.replace(/(\/?&gt;)/g, '<span class="hl-tag">$1</span>');
    temp = temp.replace(/\b([a-zA-Z-]+)(?=\s*=)/g, '<span class="hl-attr">$1</span>');

    const strings: string[] = [];
    temp = temp.replace(/="([^"]*)"/g, (match, p1) => {
      strings.push(`="${p1}"`);
      return `=___STRING_${strings.length - 1}___`;
    });
    temp = temp.replace(/='([^']*)'/g, (match, p1) => {
      strings.push(`='${p1}'`);
      return `=___STRING_${strings.length - 1}___`;
    });

    strings.forEach((str, idx) => {
      temp = temp.replace(`___STRING_${idx}___`, `<span class="hl-string">${str}</span>`);
    });
    comments.forEach((comment, idx) => {
      temp = temp.replace(`___COMMENT_${idx}___`, `<span class="hl-comment">${comment}</span>`);
    });

    return temp;
  }

  private highlightJSON(text: string): string {
    let temp = text;
    const strings: string[] = [];
    temp = temp.replace(/"(\\.|[^"\\])*"/g, (match) => {
      strings.push(match);
      return `___STRING_${strings.length - 1}___`;
    });

    temp = temp.replace(/(___STRING_\d+___)(?=\s*:)/g, '<span class="hl-key">$1</span>');
    temp = temp.replace(/\b(true|false|null)\b/g, '<span class="hl-builtin">$1</span>');
    temp = temp.replace(/\b(\d+)\b/g, '<span class="hl-number">$1</span>');

    strings.forEach((str, idx) => {
      if (temp.includes(`<span class="hl-key">___STRING_${idx}___</span>`)) {
        temp = temp.replace(`___STRING_${idx}___`, str);
      } else {
        temp = temp.replace(`___STRING_${idx}___`, `<span class="hl-string">${str}</span>`);
      }
    });

    return temp;
  }

  private escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

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
    if (event.key === 'Tab' && this.hasSuggestion() && !this.suggestionAccepted()) {
      event.preventDefault();
      this.accept();
    }
    // Tab inserts spaces if no suggestion is active
    else if (event.key === 'Tab' && (!this.hasSuggestion() || this.suggestionAccepted())) {
      event.preventDefault();
      const textarea = event.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;
      const newVal = val.substring(0, start) + '  ' + val.substring(end);
      this.onCodeChange(newVal);
      // Wait for Angular to update the model, then restore cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      });
    }

    // Esc declines suggestion if available
    if (event.key === 'Escape' && this.hasSuggestion() && !this.suggestionAccepted()) {
      event.preventDefault();
      this.decline();
    }
  }

  prevSuggestion(): void {
    if (this.disabled()) return;
    const len = this.suggestions().length;
    if (len <= 1) return;
    this.activeSuggestionIndex.update(idx => (idx - 1 + len) % len);
  }

  nextSuggestion(): void {
    if (this.disabled()) return;
    const len = this.suggestions().length;
    if (len <= 1) return;
    this.activeSuggestionIndex.update(idx => (idx + 1) % len);
  }

  toggleDiffMode(): void {
    if (this.disabled()) return;
    this.diffMode.update(d => !d);
  }

  accept() {
    this.suggestionAccepted.set(true);
    const fullCode = this.code() + this.currentSuggestion();
    this.codeChange.emit(fullCode);
    this.acceptSuggestion.emit();
    this.diffMode.set(false); // Reset diff mode when suggestion is accepted
  }

  decline() {
    this.declineSuggestion.emit();
    this.diffMode.set(false); // Reset diff mode when suggestion is declined
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
    const combined = this.code() + (this.suggestionAccepted() ? '' : this.currentSuggestion());
    navigator.clipboard.writeText(combined).then(() => {
      this.copyText.set('Copied!');
      setTimeout(() => this.copyText.set('Copy'), 2000);
    });
  }
}
