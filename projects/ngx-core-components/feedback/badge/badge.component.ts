import { Component, computed, input } from '@angular/core';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
export type BadgePosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

@Component({
  selector: 'ngx-badge',
  standalone: true,
  template: `
    <span class="ngx-badge-host" [class.positioned]="positioned()">
      <ng-content />
      <span
        [class]="badgeClass()"
        [attr.aria-label]="ariaLabel() || content()"
      >
        @if (!dot()) { {{ content() }} }
      </span>
    </span>
  `,
  styles: [`
    :host { display: inline-block; }
    .ngx-badge-host { position: relative; display: inline-flex; }
    .ngx-badge {
      display: inline-flex; align-items: center; justify-content: center;
      padding: 2px 7px; font-size: 11px; font-weight: 700;
      border-radius: 999px; line-height: 1.4; white-space: nowrap; font-family: inherit;
      min-width: 20px;
    }
    .badge-dot { width: 8px; height: 8px; padding: 0; min-width: 0; border-radius: 50%; }
    .badge-positioned { position: absolute; }
    .badge-pos-top-right { top: -6px; right: -6px; }
    .badge-pos-top-left { top: -6px; left: -6px; }
    .badge-pos-bottom-right { bottom: -6px; right: -6px; }
    .badge-pos-bottom-left { bottom: -6px; left: -6px; }

    .ngx-badge-primary { background: var(--ngx-badge-primary-bg, #1a73e8); color: #fff; }
    .ngx-badge-secondary { background: var(--ngx-badge-secondary-bg, #6c757d); color: #fff; }
    .ngx-badge-success { background: var(--ngx-badge-success-bg, #27ae60); color: #fff; }
    .ngx-badge-danger { background: var(--ngx-badge-danger-bg, #e74c3c); color: #fff; }
    .ngx-badge-warning { background: var(--ngx-badge-warning-bg, #f39c12); color: #fff; }
    .ngx-badge-info { background: var(--ngx-badge-info-bg, #17a2b8); color: #fff; }
    .ngx-badge-light { background: var(--ngx-badge-light-bg, #f8f9fa); color: #212529; }
    .ngx-badge-dark { background: var(--ngx-badge-dark-bg, #343a40); color: #fff; }
  `]
})
export class BadgeComponent {
  content = input<string | number>('');
  variant = input<BadgeVariant>('primary');
  dot = input(false);
  positioned = input(false);
  position = input<BadgePosition>('top-right');
  ariaLabel = input('');

  badgeClass = computed(() => {
    const cls = ['ngx-badge', `ngx-badge-${this.variant()}`];
    if (this.dot()) cls.push('badge-dot');
    if (this.positioned()) {
      cls.push('badge-positioned');
      cls.push(`badge-pos-${this.position()}`);
    }
    return cls.join(' ');
  });
}
