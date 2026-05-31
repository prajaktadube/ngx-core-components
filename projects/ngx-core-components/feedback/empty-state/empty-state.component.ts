import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngx-empty-state',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="ngx-empty-state"
      [class.dark]="theme() === 'dark'"
      [attr.id]="id()"
    >
      <!-- Illustration Section -->
      @if (illustration() !== 'none') {
        <div class="ngx-empty-state__illustration">
          @switch (illustration()) {
            @case ('search') {
              <svg viewBox="0 0 24 24" class="illustration-svg outline-blue" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="11" cy="11" r="7"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                <path d="M8 11h6" stroke-dasharray="2 2"/>
              </svg>
            }
            @case ('chat') {
              <svg viewBox="0 0 24 24" class="illustration-svg outline-indigo" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                <circle cx="9" cy="10" r="1" fill="currentColor"/>
                <circle cx="13" cy="10" r="1" fill="currentColor"/>
                <circle cx="17" cy="10" r="1" fill="currentColor"/>
              </svg>
            }
            @case ('error') {
              <svg viewBox="0 0 24 24" class="illustration-svg outline-red" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            }
            @default {
              <!-- 'data' layout default -->
              <svg viewBox="0 0 24 24" class="illustration-svg outline-slate" fill="none" stroke="currentColor" stroke-width="1.5">
                <ellipse cx="12" cy="5" rx="9" ry="3"/>
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/>
              </svg>
            }
          }
        </div>
      }

      <!-- Custom Projection slot for custom illustrations -->
      <div class="ngx-empty-state__custom-media">
        <ng-content select="[empty-media]"></ng-content>
      </div>

      <!-- Text details -->
      <h3 class="ngx-empty-state__title">{{ title() }}</h3>
      <p class="ngx-empty-state__desc">{{ description() }}</p>

      <!-- Projected slot for custom descriptions/content -->
      <div class="ngx-empty-state__custom-content">
        <ng-content></ng-content>
      </div>

      <!-- CTA Buttons actions -->
      @if (primaryActionText() || secondaryActionText()) {
        <div class="ngx-empty-state__actions">
          @if (secondaryActionText()) {
            <button
              class="ngx-empty-state__btn btn-secondary"
              (click)="secondaryAction.emit()"
            >
              {{ secondaryActionText() }}
            </button>
          }
          @if (primaryActionText()) {
            <button
              class="ngx-empty-state__btn btn-primary"
              (click)="primaryAction.emit()"
            >
              {{ primaryActionText() }}
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .ngx-empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 40px 32px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.45);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(0, 0, 0, 0.04);
      box-shadow: 
        0 4px 10px rgba(0, 0, 0, 0.02),
        0 1px 3px rgba(0, 0, 0, 0.01);
      box-sizing: border-box;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
      transition: all 0.3s ease;
      animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    .ngx-empty-state.dark {
      background: rgba(30, 32, 48, 0.4);
      border-color: rgba(255, 255, 255, 0.05);
      box-shadow: none;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* ── SVGs Outline illustrations ── */
    .ngx-empty-state__illustration {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.02);
      margin-bottom: 20px;
    }

    .dark .ngx-empty-state__illustration {
      background: rgba(255, 255, 255, 0.03);
    }

    .illustration-svg {
      width: 36px;
      height: 36px;
    }

    .outline-slate { color: #64748b; }
    .outline-blue { color: #3b82f6; }
    .outline-indigo { color: #6366f1; }
    .outline-red { color: #ef4444; }

    /* Custom Media Slot */
    .ngx-empty-state__custom-media {
      margin-bottom: 16px;
    }

    /* Text structures */
    .ngx-empty-state__title {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
    }

    .dark .ngx-empty-state__title {
      color: #f8fafc;
    }

    .ngx-empty-state__desc {
      margin: 0;
      font-size: 13px;
      color: #64748b;
      line-height: 1.5;
      max-width: 380px;
    }

    .dark .ngx-empty-state__desc {
      color: #94a3b8;
    }

    .ngx-empty-state__custom-content {
      margin-top: 12px;
      width: 100%;
    }

    /* ── Action buttons ── */
    .ngx-empty-state__actions {
      display: flex;
      gap: 12px;
      justify-content: center;
      margin-top: 24px;
    }

    .ngx-empty-state__btn {
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
    }

    .ngx-empty-state__btn:hover {
      transform: translateY(-1px);
    }

    .ngx-empty-state__btn.btn-primary {
      background: var(--primary-color, #3b82f6);
      color: white;
    }

    .ngx-empty-state__btn.btn-primary:hover {
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
      opacity: 0.95;
    }

    .ngx-empty-state__btn.btn-secondary {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #e2e8f0;
    }

    .ngx-empty-state__btn.btn-secondary:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    .dark .ngx-empty-state__btn.btn-secondary {
      background: rgba(255, 255, 255, 0.05);
      color: #cbd5e1;
      border-color: rgba(255, 255, 255, 0.08);
    }

    .dark .ngx-empty-state__btn.btn-secondary:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
    }
  `]
})
export class EmptyStateComponent {
  // Inputs
  title = input.required<string>();
  description = input<string>('');
  illustration = input<'search' | 'data' | 'chat' | 'error' | 'none'>('data');
  primaryActionText = input<string>('');
  secondaryActionText = input<string>('');
  theme = input<'light' | 'dark'>('light');
  id = input<string>('ngx-empty-state-' + Math.random().toString(36).substring(2, 9));

  // Outputs
  primaryAction = output<void>();
  secondaryAction = output<void>();
}
