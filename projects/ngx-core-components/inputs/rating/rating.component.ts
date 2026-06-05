import { Component, input, output, signal, computed, forwardRef, model } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'ngx-rating',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RatingComponent),
      multi: true
    }
  ],
  template: `
    <div
      class="ngx-rating-container"
      [class.has-error]="_resolvedStatus() === 'error'"
      [class.disabled]="readonly()"
      [class.status-success]="_resolvedStatus() === 'success'"
      [class.status-warning]="_resolvedStatus() === 'warning'"
    >
      @if (label()) {
        <span class="rating-label">{{ label() }}</span>
      }
      <div class="ngx-rating-row">
        <div
          class="rating-stars"
          [attr.tabindex]="readonly() ? null : '0'"
          role="slider"
          [attr.aria-valuenow]="current()"
          [attr.aria-valuemin]="0"
          [attr.aria-valuemax]="max()"
          [attr.aria-label]="label() || 'Rating'"
          [attr.aria-disabled]="readonly()"
          (keydown)="onKeyDown($event)"
        >
          @for (star of stars(); track star) {
            <span
              class="rating-star"
              [class.filled]="(hovered() || current()) >= star"
              [class.hovered]="hovered() >= star"
              (mouseenter)="readonly() ? null : hovered.set(star)"
              (mouseleave)="readonly() ? null : hovered.set(0)"
              (click)="readonly() ? null : setRating(star)"
            >
              @if ((hovered() || current()) >= star) {
                ★
              } @else {
                ☆
              }
            </span>
          }
        </div>
        @if (showValue()) {
          <span class="rating-value">{{ current() }}/{{ max() }}</span>
        }
      </div>
      
      @if (error()) {
        <div class="ngx-rating-error">{{ error() }}</div>
      } @else if (hint()) {
        <div class="ngx-rating-hint">{{ hint() }}</div>
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
      
      --ngx-rating-empty: #cbd5e1;
      --ngx-rating-filled: #f59e0b;
      --ngx-rating-hover: #d97706;
      --ngx-rating-text: #64748b;
    }
    
    :host-context(body.dark),
    :host-context(.dark),
    :host-context(.dark-theme) {
      --ngx-rating-empty: #475569;
      --ngx-rating-filled: #fbbf24;
      --ngx-rating-hover: #f59e0b;
      --ngx-rating-text: #94a3b8;
      
      --ngx-input-success-border: #34d399;
      --ngx-input-success-shadow: 0 0 0 3px rgba(52, 211, 153, 0.3);
      --ngx-input-warning-border: #fbbf24;
      --ngx-input-warning-shadow: 0 0 0 3px rgba(251, 191, 36, 0.3);
      --ngx-input-error-border: #f87171;
      --ngx-input-error-shadow: 0 0 0 3px rgba(248, 113, 113, 0.3);
    }
    
    .ngx-rating-container {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-family: inherit;
    }
    
    .rating-label {
      font-size: 13px;
      font-weight: 600;
      color: var(--ngx-rating-text);
      margin-bottom: 2px;
    }
    
    .ngx-rating-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .rating-stars {
      display: flex;
      gap: 4px;
      padding: 4px 8px;
      border-radius: 8px;
      border: 1px solid transparent;
      outline: none;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .rating-stars:focus-visible {
      border-color: #cbd5e1;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
      background: rgba(79, 70, 229, 0.03);
    }
    :host-context(.dark) .rating-stars:focus-visible,
    :host-context(.dark-theme) .rating-stars:focus-visible {
      border-color: #475569;
      background: rgba(129, 140, 248, 0.05);
    }
    
    .rating-star {
      font-size: 24px;
      line-height: 1;
      color: var(--ngx-rating-empty);
      cursor: pointer;
      user-select: none;
      transition: color 0.15s ease, transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    .disabled .rating-star {
      cursor: not-allowed;
      opacity: 0.75;
    }
    
    .rating-star.filled {
      color: var(--ngx-rating-filled);
    }
    
    .rating-star.hovered {
      color: var(--ngx-rating-hover);
      transform: scale(1.25) rotate(5deg);
    }
    
    .rating-value {
      font-size: 13px;
      font-weight: 600;
      color: var(--ngx-rating-text);
      min-width: 32px;
    }
    
    .status-success .rating-stars:focus-visible {
      box-shadow: var(--ngx-input-success-shadow);
      border-color: var(--ngx-input-success-border);
    }
    .status-warning .rating-stars:focus-visible {
      box-shadow: var(--ngx-input-warning-shadow);
      border-color: var(--ngx-input-warning-border);
    }
    .has-error .rating-stars:focus-visible {
      box-shadow: var(--ngx-input-error-shadow);
      border-color: var(--ngx-input-error-border);
    }
    
    .ngx-rating-error {
      color: var(--ngx-input-error-border);
      font-size: 12px;
      font-weight: 550;
      margin-left: 10px;
      animation: slide-down 0.2s ease-out;
    }
    .ngx-rating-hint {
      color: #64748b;
      font-size: 12px;
      margin-left: 10px;
    }
    
    @keyframes slide-down {
      from { transform: translateY(-4px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `]
})
export class RatingComponent implements ControlValueAccessor {
  max = input(5);
  label = input('');
  readonly = input(false);
  showValue = input(false);

  // Enterprise validation signals
  status = input<'default' | 'success' | 'warning' | 'error'>('default');
  error = input<string>('');
  hint = input<string>('');

  value = model(0);
  current = computed(() => this.value());
  hovered = signal(0);
  ratingChange = output<number>();

  private _onChange: (v: number) => void = () => {};
  private _onTouched: () => void = () => {};

  stars = computed(() => Array.from({ length: this.max() }, (_, i) => i + 1));

  _resolvedStatus = computed(() => {
    if (this.error()) return 'error';
    return this.status();
  });

  setRating(star: number): void {
    if (this.readonly()) return;
    this.value.set(star);
    this._onChange(star);
    this._onTouched();
    this.ratingChange.emit(star);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (this.readonly()) return;
    
    const maxVal = this.max();
    const curr = this.value();
    
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.setRating(Math.min(maxVal, curr + 1));
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      this.setRating(Math.max(0, curr - 1));
    } else if (event.key === 'Home') {
      event.preventDefault();
      this.setRating(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      this.setRating(maxVal);
    }
  }

  // ControlValueAccessor
  writeValue(val: number): void {
    this.value.set(val ?? 0);
  }

  registerOnChange(fn: (v: number) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Handled via readonly or template-level disabled
  }
}
