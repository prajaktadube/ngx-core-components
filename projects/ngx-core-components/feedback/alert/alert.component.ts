import { Component, input, signal, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

@Component({
  selector: 'ngx-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible()) {
      <div
        class="ngx-alert-banner"
        [class.dark]="theme() === 'dark'"
        [class]="variantClass()"
        [class.dismissing]="isDismissing()"
        role="alert"
      >
        <!-- Icon Section -->
        <div class="ngx-alert-icon">
          @switch (variant()) {
            @case ('info') {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
            }
            @case ('success') {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            }
            @case ('warning') {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            }
            @case ('error') {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            }
          }
        </div>

        <!-- Content Section -->
        <div class="ngx-alert-content">
          @if (title()) {
            <h5 class="ngx-alert-title">{{ title() }}</h5>
          }
          <div class="ngx-alert-message">
            <ng-content />
            @if (message()) {
              <span>{{ message() }}</span>
            }
          </div>
        </div>

        <!-- Actions Section -->
        @if (actionLabel()) {
          <div class="ngx-alert-actions">
            <button class="ngx-alert-action-btn" (click)="onActionClick($event)">
              {{ actionLabel() }}
            </button>
          </div>
        }

        <!-- Close button Section -->
        @if (dismissible()) {
          <button class="ngx-alert-close-btn" (click)="dismiss()" aria-label="Close alert">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        }
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .ngx-alert-banner {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 16px;
      border-radius: var(--radius-md, 8px);
      border-width: 1px;
      border-style: solid;
      font-family: var(--ngx-font-family, sans-serif);
      font-size: 13px;
      line-height: 1.5;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--shadow-sm);
      animation: alert-fade-in 0.25s ease-out;
      position: relative;
    }

    @keyframes alert-fade-in {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .ngx-alert-banner.dismissing {
      opacity: 0;
      transform: translateY(-8px);
      max-height: 0;
      padding-top: 0;
      padding-bottom: 0;
      margin-top: 0;
      margin-bottom: 0;
      border-width: 0;
      overflow: hidden;
    }

    .ngx-alert-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 20px;
      height: 20px;
      margin-top: 1px;
    }

    .ngx-alert-icon svg {
      width: 100%;
      height: 100%;
    }

    .ngx-alert-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .ngx-alert-title {
      margin: 0;
      font-size: 14px;
      font-weight: 700;
    }

    .ngx-alert-message {
      color: currentColor;
      opacity: 0.9;
    }

    .ngx-alert-actions {
      display: flex;
      align-items: center;
      flex-shrink: 0;
      margin-left: 8px;
    }

    .ngx-alert-action-btn {
      background: transparent;
      border: 1px solid currentColor;
      border-radius: 4px;
      padding: 3px 10px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      color: currentColor;
      transition: all 0.15s;
    }

    .ngx-alert-action-btn:hover {
      background: rgba(0, 0, 0, 0.05);
    }

    .ngx-alert-close-btn {
      background: transparent;
      border: none;
      color: currentColor;
      opacity: 0.6;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2px;
      border-radius: 4px;
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      transition: all 0.15s;
    }

    .ngx-alert-close-btn:hover {
      opacity: 1;
      background: rgba(0, 0, 0, 0.04);
    }

    .ngx-alert-close-btn svg {
      width: 14px;
      height: 14px;
    }

    /* Light Theme Variant Coloring using Tailored Harmonious HSL */
    .ngx-alert-info {
      background-color: var(--ngx-alert-info-bg, hsl(207, 95%, 97%));
      border-color: var(--ngx-alert-info-border, hsl(207, 90%, 88%));
      color: var(--ngx-alert-info-text, hsl(207, 90%, 30%));
    }
    .ngx-alert-success {
      background-color: var(--ngx-alert-success-bg, hsl(142, 70%, 97%));
      border-color: var(--ngx-alert-success-border, hsl(142, 60%, 88%));
      color: var(--ngx-alert-success-text, hsl(142, 60%, 25%));
    }
    .ngx-alert-warning {
      background-color: var(--ngx-alert-warning-bg, hsl(38, 90%, 97%));
      border-color: var(--ngx-alert-warning-border, hsl(38, 80%, 88%));
      color: var(--ngx-alert-warning-text, hsl(38, 80%, 28%));
    }
    .ngx-alert-error {
      background-color: var(--ngx-alert-error-bg, hsl(0, 90%, 97%));
      border-color: var(--ngx-alert-error-border, hsl(0, 80%, 88%));
      color: var(--ngx-alert-error-text, hsl(0, 80%, 35%));
    }

    /* Dark Theme Styles */
    .ngx-alert-banner.dark {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    
    .ngx-alert-banner.dark.ngx-alert-info {
      background-color: var(--ngx-alert-info-dark-bg, hsl(207, 80%, 8%));
      border-color: var(--ngx-alert-info-dark-border, hsl(207, 70%, 18%));
      color: var(--ngx-alert-info-dark-text, hsl(207, 90%, 75%));
    }
    .ngx-alert-banner.dark.ngx-alert-success {
      background-color: var(--ngx-alert-success-dark-bg, hsl(142, 60%, 7%));
      border-color: var(--ngx-alert-success-dark-border, hsl(142, 50%, 15%));
      color: var(--ngx-alert-success-dark-text, hsl(142, 70%, 70%));
    }
    .ngx-alert-banner.dark.ngx-alert-warning {
      background-color: var(--ngx-alert-warning-dark-bg, hsl(38, 70%, 7%));
      border-color: var(--ngx-alert-warning-dark-border, hsl(38, 60%, 15%));
      color: var(--ngx-alert-warning-dark-text, hsl(38, 80%, 70%));
    }
    .ngx-alert-banner.dark.ngx-alert-error {
      background-color: var(--ngx-alert-error-dark-bg, hsl(0, 70%, 7%));
      border-color: var(--ngx-alert-error-dark-border, hsl(0, 60%, 16%));
      color: var(--ngx-alert-error-dark-text, hsl(0, 80%, 75%));
    }

    /* Allow custom button hover states on dark variants */
    .ngx-alert-banner.dark .ngx-alert-action-btn:hover {
      background: rgba(255, 255, 255, 0.08);
    }
    .ngx-alert-banner.dark .ngx-alert-close-btn:hover {
      background: rgba(255, 255, 255, 0.05);
    }
  `]
})
export class AlertComponent {
  variant = input<AlertVariant>('info');
  title = input<string>('');
  message = input<string>('');
  dismissible = input<boolean>(true);
  actionLabel = input<string>('');
  theme = input<'light' | 'dark'>('light');

  // Outputs
  dismissed = output<void>();
  actionClick = output<void>();

  // State
  visible = signal<boolean>(true);
  isDismissing = signal<boolean>(false);

  variantClass = computed(() => `ngx-alert-${this.variant()}`);

  dismiss(): void {
    this.isDismissing.set(true);
    // Wait for the exit animation to complete (250ms) before removing from DOM
    setTimeout(() => {
      this.visible.set(false);
      this.dismissed.emit();
    }, 250);
  }

  onActionClick(event: Event): void {
    event.stopPropagation();
    this.actionClick.emit();
  }
}
