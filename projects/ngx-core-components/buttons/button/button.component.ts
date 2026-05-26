import { Component, input, output } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'link' | 'success' | 'warning' | 'info';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonShape = 'rectangle' | 'rounded' | 'pill' | 'square';

@Component({
  selector: 'ngx-button',
  standalone: true,
  template: `
    <button
      class="ngx-btn"
      [class]="btnClass()"
      [type]="type()"
      [disabled]="disabled() || loading()"
      [attr.aria-label]="ariaLabel() || null"
      (click)="clicked.emit($event)"
    >
      @if (loading()) {
        <span class="btn-spinner" aria-hidden="true"></span>
      } @else if (prefixIcon()) {
        <span class="btn-icon" aria-hidden="true">{{ prefixIcon() }}</span>
      }
      <span class="btn-text"><ng-content /></span>
      @if (suffixIcon()) {
        <span class="btn-icon btn-icon-suffix" aria-hidden="true">{{ suffixIcon() }}</span>
      }
    </button>
  `,
  styles: [`
    :host { display: inline-block; }
    .ngx-btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 6px;
      font-family: inherit; font-weight: 500; cursor: pointer; border: 1px solid transparent;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); outline: none; text-decoration: none; white-space: nowrap;
      position: relative; overflow: hidden;
    }
    .ngx-btn:active:not(:disabled) { transform: scale(0.96); }
    .ngx-btn:focus-visible { box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.3); }
    .ngx-btn:disabled { opacity: 0.6; cursor: not-allowed; }

    /* Sizes */
    .ngx-btn-sm { font-size: 12px; padding: 5px 12px; border-radius: var(--ngx-btn-radius, 6px); }
    .ngx-btn-md { font-size: 14px; padding: 8px 18px; border-radius: var(--ngx-btn-radius, 8px); }
    .ngx-btn-lg { font-size: 16px; padding: 11px 24px; border-radius: var(--ngx-btn-radius, 10px); }

    /* Shapes */
    .ngx-btn-pill { border-radius: 999px !important; }
    .ngx-btn-square { padding-left: 0 !important; padding-right: 0 !important; aspect-ratio: 1; }
    .ngx-btn-rounded { border-radius: 8px !important; }

    /* Variants */
    .ngx-btn-primary { 
      background: var(--ngx-btn-primary-bg, #4f46e5); 
      color: var(--ngx-btn-primary-color, #fff); 
      border-color: var(--ngx-btn-primary-bg, #4f46e5);
      box-shadow: 0 2px 4px rgba(79, 70, 229, 0.15);
    }
    .ngx-btn-primary:hover:not(:disabled) { 
      background: var(--ngx-btn-primary-hover, #4338ca); 
      border-color: var(--ngx-btn-primary-hover, #4338ca);
      box-shadow: 0 4px 10px rgba(79, 70, 229, 0.25);
    }

    .ngx-btn-secondary { 
      background: var(--ngx-btn-secondary-bg, #f1f3f5); 
      color: var(--ngx-btn-secondary-color, #212529); 
      border-color: var(--ngx-btn-secondary-border, #dee2e6); 
    }
    .ngx-btn-secondary:hover:not(:disabled) { 
      background: var(--ngx-btn-secondary-hover, #e2e6ea); 
      border-color: var(--ngx-btn-secondary-border, #dee2e6);
    }

    .ngx-btn-danger { 
      background: var(--ngx-btn-danger-bg, #ef4444); 
      color: #fff; 
      border-color: var(--ngx-btn-danger-bg, #ef4444); 
      box-shadow: 0 2px 4px rgba(239, 68, 68, 0.15);
    }
    .ngx-btn-danger:hover:not(:disabled) { 
      background: var(--ngx-btn-danger-hover, #dc2626); 
      border-color: var(--ngx-btn-danger-hover, #dc2626);
      box-shadow: 0 4px 10px rgba(239, 68, 68, 0.25);
    }

    .ngx-btn-success { 
      background: var(--ngx-btn-success-bg, #10b981); 
      color: #fff; 
      border-color: var(--ngx-btn-success-bg, #10b981); 
      box-shadow: 0 2px 4px rgba(16, 185, 129, 0.15);
    }
    .ngx-btn-success:hover:not(:disabled) { 
      background: var(--ngx-btn-success-hover, #059669); 
      border-color: var(--ngx-btn-success-hover, #059669);
      box-shadow: 0 4px 10px rgba(16, 185, 129, 0.25);
    }

    .ngx-btn-warning { 
      background: var(--ngx-btn-warning-bg, #f59e0b); 
      color: #fff; 
      border-color: var(--ngx-btn-warning-bg, #f59e0b); 
      box-shadow: 0 2px 4px rgba(245, 158, 11, 0.15);
    }
    .ngx-btn-warning:hover:not(:disabled) { 
      background: var(--ngx-btn-warning-hover, #d97706); 
      border-color: var(--ngx-btn-warning-hover, #d97706);
      box-shadow: 0 4px 10px rgba(245, 158, 11, 0.25);
    }

    .ngx-btn-info { 
      background: var(--ngx-btn-info-bg, #3b82f6); 
      color: #fff; 
      border-color: var(--ngx-btn-info-bg, #3b82f6); 
    }
    .ngx-btn-info:hover:not(:disabled) { 
      background: var(--ngx-btn-info-hover, #2563eb); 
      border-color: var(--ngx-btn-info-hover, #2563eb);
    }

    .ngx-btn-ghost { 
      background: transparent; 
      color: var(--ngx-btn-ghost-color, #4f46e5); 
      border-color: var(--ngx-btn-ghost-border, #cbd5e1); 
    }
    .ngx-btn-ghost:hover:not(:disabled) { 
      background: var(--ngx-btn-ghost-hover-bg, rgba(79, 70, 229, 0.08)); 
      border-color: var(--ngx-btn-ghost-color, #4f46e5);
    }

    .ngx-btn-link { 
      background: transparent; 
      color: var(--ngx-btn-link-color, #4f46e5); 
      border-color: transparent; 
      text-decoration: none; 
      padding-left: 2px; 
      padding-right: 2px; 
    }
    .ngx-btn-link:hover:not(:disabled) { 
      color: var(--ngx-btn-link-hover, #4338ca); 
      text-decoration: underline; 
    }

    /* Loading spinner */
    .btn-spinner {
      width: 14px; height: 14px; border: 2px solid currentColor; border-top-color: transparent;
      border-radius: 50%; animation: btn-spin 0.6s linear infinite;
    }
    @keyframes btn-spin { to { transform: rotate(360deg); } }
    .btn-icon { font-size: 0.9em; }
  `]
})
export class ButtonComponent {
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  shape = input<ButtonShape>('rectangle');
  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input(false);
  loading = input(false);
  prefixIcon = input<string>('');
  suffixIcon = input<string>('');
  ariaLabel = input<string>('');

  clicked = output<MouseEvent>();

  btnClass(): string {
    const parts = [
      `ngx-btn-${this.size()}`,
      `ngx-btn-${this.variant()}`,
    ];
    if (this.shape() !== 'rectangle') parts.push(`ngx-btn-${this.shape()}`);
    return parts.join(' ');
  }
}
