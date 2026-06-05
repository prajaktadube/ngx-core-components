import { Component, input, output, signal, computed } from '@angular/core';

@Component({
  selector: 'ngx-textarea',
  standalone: true,
  template: `
    <div class="ngx-textarea-container" [class.focused]="focused()" [class.has-error]="_resolvedStatus() === 'error'" [class.disabled]="disabled()">
      @if (label()) {
        <label class="textarea-label">{{ label() }}</label>
      }
      <div class="ngx-textarea-wrap" [class]="'status-' + _resolvedStatus()">
        <ng-content select="[prefix]" />
        <textarea
          class="ngx-textarea"
          [rows]="rows()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [attr.maxlength]="maxlength() > 0 ? maxlength() : null"
          [value]="value()"
          [class.auto-resize]="autoResize()"
          [attr.aria-invalid]="_resolvedStatus() === 'error' ? 'true' : null"
          (input)="onInput($event)"
          (focus)="focused.set(true)"
          (blur)="focused.set(false)"
        ></textarea>
        
        <!-- Status Indicator Icons -->
        @if (_resolvedStatus() === 'success') {
          <span class="status-icon status-icon-success" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </span>
        } @else if (_resolvedStatus() === 'warning') {
          <span class="status-icon status-icon-warning" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </span>
        } @else if (_resolvedStatus() === 'error') {
          <span class="status-icon status-icon-error" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </span>
        }
        <ng-content select="[suffix]" />
      </div>
      
      <div class="textarea-footer">
        @if (error()) { <span class="textarea-error">{{ error() }}</span> }
        @else if (hint()) { <span class="textarea-hint">{{ hint() }}</span> }
        @else { <span></span> }
        @if (maxlength() > 0) { <span class="textarea-counter" [class.near-limit]="charCount() > maxlength() * 0.8">{{ charCount() }}/{{ maxlength() }}</span> }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      --ngx-input-bg: #ffffff;
      --ngx-input-text: #0f172a;
      --ngx-input-border: #cbd5e1;
      --ngx-input-focus-border: #4f46e5;
      --ngx-input-focus-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
      --ngx-input-disabled-bg: #f1f5f9;
      --ngx-input-label: #475569;
      --ngx-input-label-active: #4f46e5;
      --ngx-input-placeholder: #94a3b8;
      
      --ngx-input-success-border: #10b981;
      --ngx-input-success-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
      --ngx-input-warning-border: #f59e0b;
      --ngx-input-warning-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15);
      --ngx-input-error-border: #ef4444;
      --ngx-input-error-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
    }
    
    :host-context(body.dark),
    :host-context(.dark),
    :host-context(.dark-theme) {
      --ngx-input-bg: #0f172a;
      --ngx-input-text: #f8fafc;
      --ngx-input-border: #334155;
      --ngx-input-focus-border: #818cf8;
      --ngx-input-focus-shadow: 0 0 0 3px rgba(129, 140, 248, 0.25);
      --ngx-input-disabled-bg: #1e293b;
      --ngx-input-label: #94a3b8;
      --ngx-input-label-active: #818cf8;
      --ngx-input-placeholder: #475569;
      
      --ngx-input-success-border: #34d399;
      --ngx-input-success-shadow: 0 0 0 3px rgba(52, 211, 153, 0.25);
      --ngx-input-warning-border: #fbbf24;
      --ngx-input-warning-shadow: 0 0 0 3px rgba(251, 191, 36, 0.25);
      --ngx-input-error-border: #f87171;
      --ngx-input-error-shadow: 0 0 0 3px rgba(248, 113, 113, 0.25);
    }

    .ngx-textarea-container { position: relative; font-family: inherit; }
    
    .textarea-label {
      display: inline-flex;
      align-items: center;
      font-size: 12px;
      font-weight: 600;
      color: var(--ngx-input-label);
      margin-bottom: 6px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .focused .textarea-label {
      color: var(--ngx-input-label-active);
      transform: translateX(2px);
    }
    
    .ngx-textarea-wrap {
      position: relative;
      display: flex;
      align-items: flex-start;
      border: 1px solid var(--ngx-input-border);
      border-radius: var(--ngx-input-radius, 8px);
      background: var(--ngx-input-bg);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    
    .focused .ngx-textarea-wrap {
      border-color: var(--ngx-input-focus-border);
      box-shadow: var(--ngx-input-focus-shadow), 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    
    /* Validation status outline colors */
    .ngx-textarea-wrap.status-success {
      border-color: var(--ngx-input-success-border);
    }
    .focused .ngx-textarea-wrap.status-success {
      box-shadow: var(--ngx-input-success-shadow), 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    
    .ngx-textarea-wrap.status-warning {
      border-color: var(--ngx-input-warning-border);
    }
    .focused .ngx-textarea-wrap.status-warning {
      box-shadow: var(--ngx-input-warning-shadow), 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    
    .ngx-textarea-wrap.status-error {
      border-color: var(--ngx-input-error-border);
    }
    .focused .ngx-textarea-wrap.status-error {
      box-shadow: var(--ngx-input-error-shadow), 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    
    .disabled .ngx-textarea-wrap {
      background: var(--ngx-input-disabled-bg);
      cursor: not-allowed;
      opacity: 0.7;
      box-shadow: none;
    }
    
    .ngx-textarea {
      flex: 1;
      min-width: 0;
      padding: 10px 14px;
      border: none;
      outline: none;
      background: transparent;
      font-size: 14px;
      color: var(--ngx-input-text);
      font-family: inherit;
      resize: vertical;
      box-sizing: border-box;
    }
    .ngx-textarea::placeholder {
      color: var(--ngx-input-placeholder);
      opacity: 0.8;
    }
    .ngx-textarea:disabled { cursor: not-allowed; }
    
    /* Status indicators */
    .status-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 10px 12px 0 0; /* Align with standard textarea text height */
      flex-shrink: 0;
      animation: icon-scale-in 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    }
    .status-icon-success { color: var(--ngx-input-success-border); }
    .status-icon-warning { color: var(--ngx-input-warning-border); }
    .status-icon-error { color: var(--ngx-input-error-border); }
    
    @keyframes icon-scale-in {
      from { transform: scale(0.6); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    .textarea-footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-top: 5px;
      font-size: 12px;
    }
    
    .textarea-error {
      color: var(--ngx-input-error-border);
      font-weight: 550;
      animation: slide-down 0.2s ease-out;
    }
    .textarea-hint {
      color: var(--ngx-input-label);
    }
    .textarea-counter {
      color: var(--ngx-input-label);
      font-size: 11px;
      margin-left: auto;
    }
    .textarea-counter.near-limit {
      color: var(--ngx-input-error-border);
      font-weight: 600;
    }
    
    @keyframes slide-down {
      from { transform: translateY(-4px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `]
})
export class TextareaComponent {
  label = input('');
  placeholder = input('');
  rows = input(4);
  maxlength = input(0);
  disabled = input(false);
  autoResize = input(false);
  hint = input('');
  error = input('');
  value = signal('');
  focused = signal(false);
  
  // Enterprise status state
  status = input<'default' | 'success' | 'warning' | 'error'>('default');

  charCount = computed(() => this.value().length);
  valueChange = output<string>();

  _resolvedStatus = computed(() => {
    if (this.error()) return 'error';
    return this.status();
  });

  onInput(e: Event): void {
    const v = (e.target as HTMLTextAreaElement).value;
    this.value.set(v);
    this.valueChange.emit(v);
  }
}
