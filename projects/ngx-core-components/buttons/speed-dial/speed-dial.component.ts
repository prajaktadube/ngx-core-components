import { Component, input, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SpeedDialItem {
  icon: string;
  label: string;
  id: string; // Emitted when clicked
  disabled?: boolean;
}

@Component({
  selector: 'ngx-speed-dial',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="ngx-speed-dial-container"
      [class]="'direction-' + direction()"
      (mouseleave)="collapseOnLeave()"
    >
      <!-- Sub-actions Flyout list -->
      <div
        class="ngx-speed-dial-actions"
        [class.open]="isOpen()"
      >
        @for (item of items(); track item.id; let idx = $index) {
          <div
            class="speed-dial-item-wrapper"
            [style.transition-delay.ms]="idx * 40"
          >
            <!-- Hover Label hint -->
            @if (item.label && showLabels()) {
              <span class="speed-dial-label">{{ item.label }}</span>
            }

            <!-- Sub action button -->
            <button
              class="sub-action-btn"
              [disabled]="item.disabled"
              (click)="onItemClick(item)"
              [title]="item.label || ''"
            >
              <span class="sub-btn-icon">{{ item.icon }}</span>
            </button>
          </div>
        }
      </div>

      <!-- Primary Action Trigger button (FAB) -->
      <button
        class="speed-dial-trigger-btn"
        [class]="'theme-' + theme()"
        [class.active]="isOpen()"
        (click)="toggleOpen()"
        [title]="isOpen() ? 'Close Menu' : 'Open Menu'"
      >
        <span class="trigger-icon">
          {{ isOpen() ? activeIcon() : icon() }}
        </span>
      </button>
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
      position: relative;
    }

    .ngx-speed-dial-container {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    /* Container direction layouts */
    .ngx-speed-dial-container.direction-top {
      flex-direction: column-reverse;
    }
    .ngx-speed-dial-container.direction-bottom {
      flex-direction: column;
    }
    .ngx-speed-dial-container.direction-left {
      flex-direction: row-reverse;
    }
    .ngx-speed-dial-container.direction-right {
      flex-direction: row;
    }

    /* Main Trigger FAB style */
    .speed-dial-trigger-btn {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      border: none;
      color: #ffffff;
      font-size: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      z-index: 5;
    }
    .speed-dial-trigger-btn:hover {
      transform: scale(1.08);
    }
    .speed-dial-trigger-btn.active {
      transform: rotate(90deg) scale(0.95);
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      background: var(--bg-primary, #f8fafc) !important;
      color: var(--text-primary, #0f172a) !important;
      border: 1px solid var(--border-color, #e2e8f0);
    }

    /* Trigger Color themes */
    .theme-primary {
      background: var(--primary-gradient, linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%));
    }
    .theme-secondary {
      background: var(--text-secondary, #475569);
    }
    .theme-accent {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      box-shadow: 0 4px 14px rgba(245, 158, 11, 0.4);
    }
    .theme-dark {
      background: #0f172a;
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.4);
    }

    .trigger-icon {
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Sub Actions list settings */
    .ngx-speed-dial-actions {
      display: flex;
      gap: 10px;
      pointer-events: none;
      z-index: 4;
      opacity: 0;
      transition: opacity 0.25s ease;
    }
    .direction-top .ngx-speed-dial-actions {
      flex-direction: column-reverse;
      margin-bottom: 12px;
    }
    .direction-bottom .ngx-speed-dial-actions {
      flex-direction: column;
      margin-top: 12px;
    }
    .direction-left .ngx-speed-dial-actions {
      flex-direction: row-reverse;
      margin-right: 12px;
    }
    .direction-right .ngx-speed-dial-actions {
      flex-direction: row;
      margin-left: 12px;
    }

    /* Open Actions display settings */
    .ngx-speed-dial-actions.open {
      opacity: 1;
      pointer-events: auto;
    }

    /* Action wrapper item flyout calculations */
    .speed-dial-item-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      position: relative;
      transform: scale(0.4);
      opacity: 0;
      transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease;
    }
    .direction-left .speed-dial-item-wrapper {
      flex-direction: row;
    }

    .ngx-speed-dial-actions.open .speed-dial-item-wrapper {
      transform: scale(1);
      opacity: 1;
    }

    /* Action Labels styling */
    .speed-dial-label {
      position: absolute;
      right: 50px;
      background: rgba(15, 23, 42, 0.88);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #ffffff;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      white-space: nowrap;
      pointer-events: none;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      backdrop-filter: blur(4px);
    }
    .direction-left .speed-dial-label,
    .direction-right .speed-dial-label,
    .direction-bottom .speed-dial-label {
      display: none; /* Hide textual labels in horizontal layout */
    }

    /* Sub Button item styling */
    .sub-action-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 1px solid var(--border-color, #e2e8f0);
      background: var(--bg-secondary, #ffffff);
      color: var(--text-primary, #0f172a);
      font-size: 15px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-sm);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .sub-action-btn:hover {
      background: var(--primary-glow, rgba(79, 70, 229, 0.1));
      color: var(--primary-color, #4f46e5);
      border-color: var(--primary-color, #4f46e5);
      transform: scale(1.08);
    }
    .sub-action-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .sub-btn-icon {
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class SpeedDialComponent {
  // Inputs configuration
  items = input.required<SpeedDialItem[]>();
  icon = input<string>('+'); // Default collapsed icon
  activeIcon = input<string>('✕'); // Default expanded icon
  direction = input<'top' | 'bottom' | 'left' | 'right'>('top');
  theme = input<'primary' | 'secondary' | 'accent' | 'dark'>('primary');
  showLabels = input<boolean>(true);
  closeOnSelect = input<boolean>(true);
  collapseOnLeaveMouse = input<boolean>(true);

  // Output emissions
  itemClick = output<SpeedDialItem>();

  // Open status signal
  isOpen = signal<boolean>(false);

  toggleOpen(): void {
    this.isOpen.update(val => !val);
  }

  collapseOnLeave(): void {
    if (this.collapseOnLeaveMouse()) {
      this.isOpen.set(false);
    }
  }

  onItemClick(item: SpeedDialItem): void {
    if (item.disabled) return;
    this.itemClick.emit(item);
    if (this.closeOnSelect()) {
      this.isOpen.set(false);
    }
  }
}
