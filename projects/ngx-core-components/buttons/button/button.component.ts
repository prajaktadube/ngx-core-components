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
      transition: all 0.15s; outline: none; text-decoration: none; white-space: nowrap;
      position: relative; overflow: hidden;
    }
    .ngx-btn:focus-visible { box-shadow: 0 0 0 3px rgba(74,144,217,0.3); }
    .ngx-btn:disabled { opacity: 0.55; cursor: not-allowed; }

    /* Sizes */
    .ngx-btn-sm { font-size: 12px; padding: 5px 12px; border-radius: var(--ngx-btn-radius, 4px); }
    .ngx-btn-md { font-size: 14px; padding: 8px 18px; border-radius: var(--ngx-btn-radius, 4px); }
    .ngx-btn-lg { font-size: 16px; padding: 11px 24px; border-radius: var(--ngx-btn-radius, 4px); }

    /* Shapes */
    .ngx-btn-pill { border-radius: 999px !important; }
    .ngx-btn-square { padding-left: 0 !important; padding-right: 0 !important; aspect-ratio: 1; }
    .ngx-btn-rounded { border-radius: 8px !important; }

    /* Variants */
    .ngx-btn-primary { background: var(--ngx-btn-primary-bg, #1a73e8); color: var(--ngx-btn-primary-color, #fff); border-color: var(--ngx-btn-primary-bg, #1a73e8); }
    .ngx-btn-primary:hover:not(:disabled) { background: var(--ngx-btn-primary-hover, #1557b0); border-color: var(--ngx-btn-primary-hover, #1557b0); }

    .ngx-btn-secondary { background: var(--ngx-btn-secondary-bg, #f1f3f5); color: var(--ngx-btn-secondary-color, #212529); border-color: var(--ngx-btn-secondary-border, #dee2e6); }
    .ngx-btn-secondary:hover:not(:disabled) { background: var(--ngx-btn-secondary-hover, #e2e6ea); }

    .ngx-btn-danger { background: var(--ngx-btn-danger-bg, #e74c3c); color: #fff; border-color: var(--ngx-btn-danger-bg, #e74c3c); }
    .ngx-btn-danger:hover:not(:disabled) { background: var(--ngx-btn-danger-hover, #c0392b); border-color: var(--ngx-btn-danger-hover, #c0392b); }

    .ngx-btn-success { background: var(--ngx-btn-success-bg, #27ae60); color: #fff; border-color: var(--ngx-btn-success-bg, #27ae60); }
    .ngx-btn-success:hover:not(:disabled) { background: var(--ngx-btn-success-hover, #1e8449); border-color: var(--ngx-btn-success-hover, #1e8449); }

    .ngx-btn-warning { background: var(--ngx-btn-warning-bg, #f39c12); color: #fff; border-color: var(--ngx-btn-warning-bg, #f39c12); }
    .ngx-btn-warning:hover:not(:disabled) { background: var(--ngx-btn-warning-hover, #d68910); border-color: var(--ngx-btn-warning-hover, #d68910); }

    .ngx-btn-info { background: var(--ngx-btn-info-bg, #17a2b8); color: #fff; border-color: var(--ngx-btn-info-bg, #17a2b8); }
    .ngx-btn-info:hover:not(:disabled) { background: var(--ngx-btn-info-hover, #138496); }

    .ngx-btn-ghost { background: transparent; color: var(--ngx-btn-ghost-color, #1a73e8); border-color: var(--ngx-btn-ghost-border, #1a73e8); }
    .ngx-btn-ghost:hover:not(:disabled) { background: var(--ngx-btn-ghost-hover-bg, #e8f0fe); }

    .ngx-btn-link { background: transparent; color: var(--ngx-btn-link-color, #1a73e8); border-color: transparent; text-decoration: underline; padding-left: 2px; padding-right: 2px; }
    .ngx-btn-link:hover:not(:disabled) { color: var(--ngx-btn-link-hover, #1557b0); }

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
