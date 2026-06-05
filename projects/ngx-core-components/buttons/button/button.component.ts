import { Component, input, output, signal } from '@angular/core';

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
      [class.btn-loading]="loading()"
      [class.btn-block]="fullWidth()"
      [class.btn-selected]="selected()"
      [type]="type()"
      [disabled]="disabled() || loading()"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-busy]="loading() ? 'true' : null"
      [attr.aria-disabled]="disabled() || loading() ? 'true' : null"
      (click)="onButtonClick($event)"
    >
      @if (ripple()) {
        <span class="btn-ripple-container" aria-hidden="true">
          @for (r of ripples(); track r.id) {
            <span class="btn-ripple" [style.left.px]="r.x" [style.top.px]="r.y"></span>
          }
        </span>
      }

      @if (loading()) {
        <span class="btn-spinner-container" aria-hidden="true">
          <span class="btn-spinner"></span>
        </span>
      } @else {
        <ng-content select="[prefix]" />
        @if (prefixIcon()) {
          @if (isClassIcon(prefixIcon())) {
            <span class="btn-icon" [class]="prefixIcon()" aria-hidden="true"></span>
          } @else {
            <span class="btn-icon" aria-hidden="true">{{ prefixIcon() }}</span>
          }
        }
      }
      <span class="btn-text"><ng-content /></span>
      @if (suffixIcon()) {
        @if (isClassIcon(suffixIcon())) {
          <span class="btn-icon btn-icon-suffix" [class]="suffixIcon()" aria-hidden="true"></span>
        } @else {
          <span class="btn-icon btn-icon-suffix" aria-hidden="true">{{ suffixIcon() }}</span>
        }
      }
      <ng-content select="[suffix]" />

      @if (badge()) {
        <span class="btn-badge btn-badge-{{ badgeVariant() }} btn-badge-{{ badgePosition() }}">
          {{ badge() }}
        </span>
      }
    </button>
  `,
  styles: [`
    :host {
      display: inline-block;
      --ngx-btn-focus-ring-bg: #ffffff;
      position: relative;
    }
    
    :host-context(body.dark),
    :host-context(.dark),
    :host-context(.dark-theme) {
      --ngx-btn-focus-ring-bg: #0f172a;
    }

    .ngx-btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 6px;
      font-family: inherit; font-weight: 550; cursor: pointer;
      background: var(--ngx-btn-bg);
      color: var(--ngx-btn-color);
      border: 1px solid var(--ngx-btn-border);
      box-shadow: var(--ngx-btn-shadow);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); outline: none; text-decoration: none; white-space: nowrap;
      position: relative; overflow: visible;
      user-select: none;
    }
    
    .ngx-btn:hover:not(:disabled) {
      background: var(--ngx-btn-hover-bg);
      box-shadow: var(--ngx-btn-hover-shadow);
      transform: translateY(-2px);
    }
    
    .ngx-btn:active:not(:disabled) {
      background: var(--ngx-btn-active-bg);
      box-shadow: var(--ngx-btn-active-shadow);
      transform: translateY(1px) scale(0.97);
    }
    
    .ngx-btn:focus-visible {
      outline: none;
      box-shadow: 0 0 0 2px var(--ngx-btn-focus-ring-bg), 0 0 0 4px var(--ngx-btn-focus-ring-color);
    }
    
    .ngx-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
      box-shadow: none !important;
    }

    .ngx-btn.btn-block {
      width: 100%;
      display: flex;
    }

    .ngx-btn.btn-selected {
      background: var(--ngx-btn-active-bg) !important;
      box-shadow: var(--ngx-btn-active-shadow) !important;
      border-color: currentColor !important;
    }

    /* Sizes */
    .ngx-btn-sm { font-size: 12px; padding: 5px 12px; border-radius: var(--ngx-btn-radius, 6px); }
    .ngx-btn-md { font-size: 14px; padding: 8px 18px; border-radius: var(--ngx-btn-radius, 8px); }
    .ngx-btn-lg { font-size: 16px; padding: 10px 22px; border-radius: var(--ngx-btn-radius, 12px); }

    /* Shapes */
    .ngx-btn-pill { border-radius: 999px !important; }
    .ngx-btn-square {
      padding-left: 0 !important;
      padding-right: 0 !important;
      aspect-ratio: 1;
      justify-content: center;
    }
    .ngx-btn-rounded { border-radius: 8px !important; }

    /* Variants */
    
    /* Primary */
    .ngx-btn-primary {
      --ngx-btn-bg: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
      --ngx-btn-hover-bg: linear-gradient(135deg, #4338ca 0%, #4f46e5 100%);
      --ngx-btn-active-bg: linear-gradient(135deg, #3730a3 0%, #4338ca 100%);
      --ngx-btn-color: #ffffff;
      --ngx-btn-border: transparent;
      --ngx-btn-shadow: 0 4px 10px rgba(79, 70, 229, 0.2);
      --ngx-btn-hover-shadow: 0 6px 16px rgba(79, 70, 229, 0.3);
      --ngx-btn-active-shadow: 0 2px 6px rgba(79, 70, 229, 0.15);
      --ngx-btn-focus-ring-color: #4f46e5;
    }
    
    /* Secondary */
    .ngx-btn-secondary {
      --ngx-btn-bg: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      --ngx-btn-hover-bg: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
      --ngx-btn-active-bg: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%);
      --ngx-btn-color: #0f172a;
      --ngx-btn-border: #cbd5e1;
      --ngx-btn-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      --ngx-btn-hover-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
      --ngx-btn-active-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
      --ngx-btn-focus-ring-color: #64748b;
    }
    :host-context(body.dark) .ngx-btn-secondary,
    :host-context(.dark) .ngx-btn-secondary,
    :host-context(.dark-theme) .ngx-btn-secondary {
      --ngx-btn-bg: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      --ngx-btn-hover-bg: linear-gradient(135deg, #334155 0%, #1e293b 100%);
      --ngx-btn-active-bg: linear-gradient(135deg, #475569 0%, #334155 100%);
      --ngx-btn-color: #f8fafc;
      --ngx-btn-border: #334155;
      --ngx-btn-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      --ngx-btn-hover-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      --ngx-btn-active-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
      --ngx-btn-focus-ring-color: #94a3b8;
    }

    /* Danger */
    .ngx-btn-danger {
      --ngx-btn-bg: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      --ngx-btn-hover-bg: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      --ngx-btn-active-bg: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
      --ngx-btn-color: #ffffff;
      --ngx-btn-border: transparent;
      --ngx-btn-shadow: 0 4px 10px rgba(239, 68, 68, 0.2);
      --ngx-btn-hover-shadow: 0 6px 16px rgba(239, 68, 68, 0.3);
      --ngx-btn-active-shadow: 0 2px 6px rgba(239, 68, 68, 0.15);
      --ngx-btn-focus-ring-color: #ef4444;
    }

    /* Success */
    .ngx-btn-success {
      --ngx-btn-bg: linear-gradient(135deg, #10b981 0%, #059669 100%);
      --ngx-btn-hover-bg: linear-gradient(135deg, #059669 0%, #047857 100%);
      --ngx-btn-active-bg: linear-gradient(135deg, #047857 0%, #065f46 100%);
      --ngx-btn-color: #ffffff;
      --ngx-btn-border: transparent;
      --ngx-btn-shadow: 0 4px 10px rgba(16, 185, 129, 0.2);
      --ngx-btn-hover-shadow: 0 6px 16px rgba(16, 185, 129, 0.3);
      --ngx-btn-active-shadow: 0 2px 6px rgba(16, 185, 129, 0.15);
      --ngx-btn-focus-ring-color: #10b981;
    }

    /* Warning */
    .ngx-btn-warning {
      --ngx-btn-bg: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      --ngx-btn-hover-bg: linear-gradient(135deg, #d97706 0%, #b45309 100%);
      --ngx-btn-active-bg: linear-gradient(135deg, #b45309 0%, #92400e 100%);
      --ngx-btn-color: #ffffff;
      --ngx-btn-border: transparent;
      --ngx-btn-shadow: 0 4px 10px rgba(245, 158, 11, 0.2);
      --ngx-btn-hover-shadow: 0 6px 16px rgba(245, 158, 11, 0.3);
      --ngx-btn-active-shadow: 0 2px 6px rgba(245, 158, 11, 0.15);
      --ngx-btn-focus-ring-color: #f59e0b;
    }

    /* Info */
    .ngx-btn-info {
      --ngx-btn-bg: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      --ngx-btn-hover-bg: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      --ngx-btn-active-bg: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
      --ngx-btn-color: #ffffff;
      --ngx-btn-border: transparent;
      --ngx-btn-shadow: 0 4px 10px rgba(59, 130, 246, 0.2);
      --ngx-btn-hover-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
      --ngx-btn-active-shadow: 0 2px 6px rgba(59, 130, 246, 0.15);
      --ngx-btn-focus-ring-color: #3b82f6;
    }

    /* Ghost */
    .ngx-btn-ghost {
      --ngx-btn-bg: transparent;
      --ngx-btn-hover-bg: rgba(79, 70, 229, 0.08);
      --ngx-btn-active-bg: rgba(79, 70, 229, 0.15);
      --ngx-btn-color: var(--ngx-btn-ghost-color, #4f46e5);
      --ngx-btn-border: var(--ngx-btn-ghost-border, #4f46e5);
      --ngx-btn-shadow: none;
      --ngx-btn-hover-shadow: none;
      --ngx-btn-active-shadow: none;
      --ngx-btn-focus-ring-color: #4f46e5;
    }
    :host-context(body.dark) .ngx-btn-ghost,
    :host-context(.dark) .ngx-btn-ghost,
    :host-context(.dark-theme) .ngx-btn-ghost {
      --ngx-btn-hover-bg: rgba(129, 140, 248, 0.1);
      --ngx-btn-active-bg: rgba(129, 140, 248, 0.2);
      --ngx-btn-color: #818cf8;
      --ngx-btn-border: #818cf8;
      --ngx-btn-focus-ring-color: #818cf8;
    }

    /* Link */
    .ngx-btn-link {
      --ngx-btn-bg: transparent;
      --ngx-btn-hover-bg: transparent;
      --ngx-btn-active-bg: transparent;
      --ngx-btn-color: var(--ngx-btn-link-color, #4f46e5);
      --ngx-btn-border: transparent;
      --ngx-btn-shadow: none;
      --ngx-btn-hover-shadow: none;
      --ngx-btn-active-shadow: none;
      --ngx-btn-focus-ring-color: #4f46e5;
    }
    .ngx-btn-link:hover:not(:disabled) {
      color: var(--ngx-btn-link-hover, #4338ca);
      text-decoration: underline;
      transform: none !important;
    }
    .ngx-btn-link:active:not(:disabled) {
      transform: scale(0.97) !important;
    }
    :host-context(body.dark) .ngx-btn-link,
    :host-context(.dark) .ngx-btn-link,
    :host-context(.dark-theme) .ngx-btn-link {
      --ngx-btn-color: #818cf8;
      --ngx-btn-focus-ring-color: #818cf8;
    }

    /* Ripple Effect style */
    .btn-ripple-container {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      overflow: hidden;
      pointer-events: none;
      border-radius: inherit;
    }
    .btn-ripple {
      position: absolute;
      border-radius: 50%;
      transform: translate(-50%, -50%) scale(0);
      width: 80px;
      height: 80px;
      background: currentColor;
      opacity: 0.15;
      pointer-events: none;
      animation: ripple-effect 0.6s cubic-bezier(0.1, 0.8, 0.3, 1);
    }
    @keyframes ripple-effect {
      to {
        transform: translate(-50%, -50%) scale(4);
        opacity: 0;
      }
    }

    /* Badge styles */
    .btn-badge {
      display: inline-flex; align-items: center; justify-content: center;
      font-size: 10px; font-weight: 700; line-height: 1;
      border-radius: 999px;
      padding: 3px 6px;
      min-width: 16px; height: 16px;
      box-sizing: border-box;
      pointer-events: none;
    }
    .btn-badge-danger { background: #ef4444; color: #ffffff; }
    .btn-badge-warning { background: #f59e0b; color: #ffffff; }
    .btn-badge-success { background: #10b981; color: #ffffff; }
    .btn-badge-info { background: #3b82f6; color: #ffffff; }
    
    .btn-badge-inline {
      margin-left: 6px;
      flex-shrink: 0;
    }
    .btn-badge-top-right {
      position: absolute;
      top: -4px;
      right: -4px;
      transform: translate(25%, -25%);
      border: 1.5px solid var(--ngx-btn-focus-ring-bg, #ffffff);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
      z-index: 10;
    }

    /* Loading spinner & animations */
    .btn-spinner-container {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      width: 14px;
      height: 14px;
      animation: spinner-enter 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      flex-shrink: 0;
    }
    .btn-spinner {
      width: 14px; height: 14px; border: 2px solid currentColor; border-top-color: transparent;
      border-radius: 50%; animation: btn-spin 0.6s linear infinite;
      flex-shrink: 0;
    }
    @keyframes spinner-enter {
      from { width: 0; opacity: 0; transform: scale(0.5); }
      to { width: 14px; opacity: 1; transform: scale(1); }
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
  
  // Enterprise features
  ripple = input(true);
  fullWidth = input(false);
  selected = input(false);
  badge = input<string | number>('');
  badgePosition = input<'top-right' | 'inline'>('top-right');
  badgeVariant = input<'danger' | 'warning' | 'info' | 'success'>('danger');

  clicked = output<MouseEvent>();

  ripples = signal<{ x: number, y: number, id: number }[]>([]);
  private rippleId = 0;

  btnClass(): string {
    const parts = [
      `ngx-btn-${this.size()}`,
      `ngx-btn-${this.variant()}`,
    ];
    if (this.shape() !== 'rectangle') parts.push(`ngx-btn-${this.shape()}`);
    return parts.join(' ');
  }

  isClassIcon(icon: string): boolean {
    if (!icon) return false;
    const classRegex = /^[a-zA-Z0-9\s-_:]+$/;
    return icon.length > 2 && classRegex.test(icon);
  }

  onButtonClick(event: MouseEvent): void {
    if (this.disabled() || this.loading()) return;
    this.clicked.emit(event);
    if (!this.ripple()) return;

    const button = event.currentTarget as HTMLButtonElement;
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const id = this.rippleId++;

    this.ripples.update(r => [...r, { x, y, id }]);

    setTimeout(() => {
      this.ripples.update(r => r.filter(item => item.id !== id));
    }, 600);
  }
}
