import { Component, input, output, signal, computed, forwardRef, model } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'ngx-switch',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SwitchComponent),
      multi: true
    }
  ],
  template: `
    <div
      class="ngx-switch-container"
      [class.has-error]="_resolvedStatus() === 'error'"
      [class.disabled]="disabled()"
      [class.status-success]="_resolvedStatus() === 'success'"
      [class.status-warning]="_resolvedStatus() === 'warning'"
    >
      <div class="ngx-switch-row">
        @if (offLabel()) {
          <span class="switch-off-label" [class.active]="!checked()" (click)="disabled() ? null : (!checked() ? null : toggle())">{{ offLabel() }}</span>
        }
        <span
          class="switch-track"
          [class.checked]="checked()"
          [class]="'size-' + size()"
          (click)="toggle()"
          (keydown.space)="$event.preventDefault(); toggle()"
          (keydown.enter)="$event.preventDefault(); toggle()"
          role="switch"
          [attr.aria-checked]="checked()"
          [attr.aria-disabled]="disabled()"
          [attr.tabindex]="disabled() ? null : '0'"
        >
          <span class="switch-thumb"></span>
        </span>
        @if (onLabel()) {
          <span class="switch-on-label" [class.active]="checked()" (click)="disabled() ? null : (checked() ? null : toggle())">{{ onLabel() }}</span>
        }
      </div>
      
      @if (error()) {
        <div class="ngx-switch-error">{{ error() }}</div>
      } @else if (hint()) {
        <div class="ngx-switch-hint">{{ hint() }}</div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
      --ngx-input-success-border: #10b981;
      --ngx-input-success-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
      --ngx-input-warning-border: #f59e0b;
      --ngx-input-warning-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2);
      --ngx-input-error-border: #ef4444;
      --ngx-input-error-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
      
      --ngx-switch-off-bg: #cbd5e1;
      --ngx-switch-on-bg: #4f46e5;
      --ngx-switch-thumb-bg: #ffffff;
      --ngx-switch-text: #475569;
      --ngx-switch-text-active: #0f172a;
    }
    
    :host-context(body.dark),
    :host-context(.dark),
    :host-context(.dark-theme) {
      --ngx-switch-off-bg: #475569;
      --ngx-switch-on-bg: #818cf8;
      --ngx-switch-text: #94a3b8;
      --ngx-switch-text-active: #f8fafc;
      
      --ngx-input-success-border: #34d399;
      --ngx-input-success-shadow: 0 0 0 3px rgba(52, 211, 153, 0.3);
      --ngx-input-warning-border: #fbbf24;
      --ngx-input-warning-shadow: 0 0 0 3px rgba(251, 191, 36, 0.3);
      --ngx-input-error-border: #f87171;
      --ngx-input-error-shadow: 0 0 0 3px rgba(248, 113, 113, 0.3);
    }
    
    .ngx-switch-container {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-family: inherit;
    }
    
    .ngx-switch-row {
      display: inline-flex;
      align-items: center;
      gap: 10px;
    }
    
    .switch-track {
      position: relative;
      border-radius: 999px;
      background: var(--ngx-switch-off-bg);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      flex-shrink: 0;
      cursor: pointer;
      outline: none;
      box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .switch-track.size-sm { width: 34px; height: 20px; }
    .switch-track.size-md { width: 44px; height: 24px; }
    .switch-track.size-lg { width: 56px; height: 30px; }
    
    .switch-track.checked {
      background: var(--ngx-switch-on-bg);
    }
    
    .switch-thumb {
      position: absolute;
      top: 2px;
      left: 2px;
      border-radius: 50%;
      background: var(--ngx-switch-thumb-bg);
      box-shadow: 0 2px 5px rgba(0,0,0,0.15), 0 1px 1px rgba(0,0,0,0.1);
      transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      pointer-events: none;
    }
    
    .size-sm .switch-thumb { width: 16px; height: 16px; }
    .size-md .switch-thumb { width: 20px; height: 20px; }
    .size-lg .switch-thumb { width: 26px; height: 26px; }
    
    .size-sm.checked .switch-thumb { transform: translateX(14px); }
    .size-md.checked .switch-thumb { transform: translateX(20px); }
    .size-lg.checked .switch-thumb { transform: translateX(26px); }
    
    .switch-track:focus-visible {
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.25), inset 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .switch-track:hover:not(.disabled) .switch-thumb {
      transform: scale(1.05) translateX(0);
    }
    .size-sm.checked:hover:not(.disabled) .switch-thumb { transform: scale(1.05) translateX(14px); }
    .size-md.checked:hover:not(.disabled) .switch-thumb { transform: scale(1.05) translateX(20px); }
    .size-lg.checked:hover:not(.disabled) .switch-thumb { transform: scale(1.05) translateX(26px); }
    
    .disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }
    .disabled .switch-track {
      cursor: not-allowed;
      pointer-events: none;
    }
    
    .switch-off-label, .switch-on-label {
      font-size: 13px;
      color: var(--ngx-switch-text);
      cursor: pointer;
      user-select: none;
      transition: color 0.15s ease;
    }
    .switch-off-label.active, .switch-on-label.active {
      color: var(--ngx-switch-text-active);
      font-weight: 600;
    }
    
    .status-success .switch-track.checked { background: var(--ngx-input-success-border); }
    .status-success .switch-track:focus-visible { box-shadow: var(--ngx-input-success-shadow), inset 0 1px 3px rgba(0,0,0,0.1); }
    
    .status-warning .switch-track.checked { background: var(--ngx-input-warning-border); }
    .status-warning .switch-track:focus-visible { box-shadow: var(--ngx-input-warning-shadow), inset 0 1px 3px rgba(0,0,0,0.1); }
    
    .has-error .switch-track.checked { background: var(--ngx-input-error-border); }
    .has-error .switch-track:focus-visible { box-shadow: var(--ngx-input-error-shadow), inset 0 1px 3px rgba(0,0,0,0.1); }
    
    .ngx-switch-error {
      color: var(--ngx-input-error-border);
      font-size: 12px;
      font-weight: 550;
      animation: slide-down 0.2s ease-out;
    }
    .ngx-switch-hint {
      color: #64748b;
      font-size: 12px;
    }
    
    @keyframes slide-down {
      from { transform: translateY(-4px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `]
})
export class SwitchComponent implements ControlValueAccessor {
  checked = model(false);
  onLabel = input('On');
  offLabel = input('Off');
  size = input<'sm' | 'md' | 'lg'>('md');
  disabled = input(false);

  // Enterprise validation signals
  status = input<'default' | 'success' | 'warning' | 'error'>('default');
  error = input<string>('');
  hint = input<string>('');

  private _onChange: (val: boolean) => void = () => {};
  private _onTouched: () => void = () => {};

  _resolvedStatus = computed(() => {
    if (this.error()) return 'error';
    return this.status();
  });

  toggle(): void {
    if (this.disabled()) return;
    this.checked.update(v => !v);
    this._onChange(this.checked());
    this._onTouched();
  }

  // ControlValueAccessor
  writeValue(val: boolean): void {
    this.checked.set(!!val);
  }

  registerOnChange(fn: (val: boolean) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Handled via disabled input
  }
}
