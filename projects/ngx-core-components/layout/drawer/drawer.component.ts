import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  model,
  computed,
  HostListener,
  effect,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngx-drawer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="ngx-drawer-container"
      [class.open]="isOpen()"
      [class.dark]="theme() === 'dark'"
      [attr.aria-hidden]="!isOpen()"
    >
      <!-- Backdrop Blur Overlay -->
      <div class="ngx-drawer-backdrop" (click)="onBackdropClick()"></div>

      <!-- Main Slider Panel -->
      <div
        class="ngx-drawer-panel"
        [class]="position()"
        [style.width]="isHorizontal() ? size() : '100%'"
        [style.height]="isVertical() ? size() : '100%'"
        role="dialog"
        aria-modal="true"
      >
        <!-- Header Section -->
        <div class="ngx-drawer-header">
          <ng-content select="[drawer-header]">
            <div class="ngx-drawer-header-default">
              <h2 class="ngx-drawer-title">{{ title() }}</h2>
              <button
                class="ngx-drawer-close-btn"
                (click)="closeDrawer()"
                aria-label="Close drawer"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </ng-content>
        </div>

        <!-- Body Section -->
        <div class="ngx-drawer-body">
          <ng-content></ng-content>
        </div>

        <!-- Footer Section -->
        <div class="ngx-drawer-footer">
          <ng-content select="[drawer-footer]"></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ngx-drawer-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 1000;
      visibility: hidden;
      pointer-events: none;
      transition: visibility 0.28s ease;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
    }

    .ngx-drawer-container.open {
      visibility: visible;
      pointer-events: auto;
    }

    /* Backdrop blurring */
    .ngx-drawer-backdrop {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(15, 23, 42, 0.25);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      opacity: 0;
      transition: opacity 0.28s ease;
    }

    .ngx-drawer-container.open .ngx-drawer-backdrop {
      opacity: 1;
    }

    /* Panel layout */
    .ngx-drawer-panel {
      position: absolute;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.5);
      box-shadow: 
        0 20px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04);
      display: flex;
      flex-direction: column;
      transition: transform 0.32s cubic-bezier(0.16, 1, 0.3, 1);
      box-sizing: border-box;
      z-index: 1001;
    }

    /* Positions translations */
    .ngx-drawer-panel.left {
      top: 0;
      left: 0;
      height: 100%;
      transform: translateX(-100%);
      border-right-width: 1.5px;
    }

    .ngx-drawer-panel.right {
      top: 0;
      right: 0;
      height: 100%;
      transform: translateX(100%);
      border-left-width: 1.5px;
    }

    .ngx-drawer-panel.top {
      top: 0;
      left: 0;
      width: 100%;
      transform: translateY(-100%);
      border-bottom-width: 1.5px;
    }

    .ngx-drawer-panel.bottom {
      bottom: 0;
      left: 0;
      width: 100%;
      transform: translateY(100%);
      border-top-width: 1.5px;
    }

    /* Open modifications */
    .ngx-drawer-container.open .ngx-drawer-panel.left,
    .ngx-drawer-container.open .ngx-drawer-panel.right {
      transform: translateX(0);
    }

    .ngx-drawer-container.open .ngx-drawer-panel.top,
    .ngx-drawer-container.open .ngx-drawer-panel.bottom {
      transform: translateY(0);
    }

    /* Dark Mode styling */
    .ngx-drawer-container.dark .ngx-drawer-panel {
      background: rgba(30, 32, 48, 0.88);
      border-color: rgba(255, 255, 255, 0.08);
      color: #f8fafc;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
    }

    /* Header Styling */
    .ngx-drawer-header {
      padding: 18px 24px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    }

    .ngx-drawer-container.dark .ngx-drawer-header {
      border-bottom-color: rgba(255, 255, 255, 0.06);
    }

    .ngx-drawer-header-default {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }

    .ngx-drawer-title {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
    }

    .ngx-drawer-container.dark .ngx-drawer-title {
      color: #f1f5f9;
    }

    .ngx-drawer-close-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: none;
      background: rgba(0, 0, 0, 0.03);
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      padding: 0;
    }

    .ngx-drawer-close-btn:hover {
      background: rgba(0, 0, 0, 0.08);
      color: #0f172a;
    }

    .ngx-drawer-container.dark .ngx-drawer-close-btn {
      background: rgba(255, 255, 255, 0.05);
      color: #94a3b8;
    }

    .ngx-drawer-container.dark .ngx-drawer-close-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #f1f5f9;
    }

    /* Body scroll */
    .ngx-drawer-body {
      padding: 24px;
      flex-grow: 1;
      overflow-y: auto;
    }

    /* Footer styling */
    .ngx-drawer-footer {
      padding: 16px 24px;
      border-top: 1px solid rgba(0, 0, 0, 0.06);
      background: rgba(0, 0, 0, 0.01);
    }

    .ngx-drawer-container.dark .ngx-drawer-footer {
      border-top-color: rgba(255, 255, 255, 0.06);
      background: rgba(255, 255, 255, 0.01);
    }
  `]
})
export class DrawerComponent implements OnDestroy {
  // Inputs
  isOpen = model<boolean>(false); // Signal-based model for two-way binding
  position = input<'left' | 'right' | 'top' | 'bottom'>('right');
  size = input<string>('380px');
  closeOnBackdrop = input<boolean>(true);
  closeOnEscape = input<boolean>(true);
  theme = input<'light' | 'dark'>('light');
  title = input<string>('');

  // Outputs
  close = output<void>();

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
  }

  ngOnDestroy() {
    document.body.style.overflow = '';
  }

  // Helper Computeds
  isHorizontal = computed(() => {
    const pos = this.position();
    return pos === 'left' || pos === 'right';
  });

  isVertical = computed(() => {
    const pos = this.position();
    return pos === 'top' || pos === 'bottom';
  });

  closeDrawer() {
    this.close.emit();
    this.isOpen.set(false);
  }

  onBackdropClick() {
    if (this.closeOnBackdrop()) {
      this.closeDrawer();
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent) {
    if (this.isOpen() && this.closeOnEscape()) {
      this.closeDrawer();
    }
  }
}
