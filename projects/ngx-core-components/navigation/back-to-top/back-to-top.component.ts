import {
  Component,
  ChangeDetectionStrategy,
  input,
  signal,
  computed,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngx-back-to-top',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      class="ngx-back-to-top"
      [class.visible]="isVisible()"
      [class.dark]="theme() === 'dark'"
      (click)="scrollToTop()"
      aria-label="Back to top"
    >
      @if (showProgress()) {
        <svg class="ngx-back-to-top__svg" viewBox="0 0 40 40">
          <circle
            class="ngx-back-to-top__circle-bg"
            cx="20"
            cy="20"
            r="18"
            stroke-width="2.5"
          />
          <circle
            class="ngx-back-to-top__circle-progress"
            cx="20"
            cy="20"
            r="18"
            stroke-width="2.5"
            [style.strokeDashoffset]="strokeDashoffset()"
            stroke-linecap="round"
            transform="rotate(-90 20 20)"
          />
        </svg>
      }

      <svg class="arrow-up-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3">
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
    </button>
  `,
  styles: [`
    .ngx-back-to-top {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: none;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      color: #0f172a;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 
        0 10px 15px -3px rgba(0, 0, 0, 0.1),
        0 4px 6px -4px rgba(0, 0, 0, 0.05);
      z-index: 99;
      opacity: 0;
      transform: translateY(12px) scale(0.9);
      pointer-events: none;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      outline: none;
      padding: 0;
    }

    .ngx-back-to-top.visible {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }

    .ngx-back-to-top:hover {
      background: #ffffff;
      transform: scale(1.06) translateY(-1px);
      box-shadow: 
        0 20px 25px -5px rgba(0, 0, 0, 0.15),
        0 10px 10px -5px rgba(0, 0, 0, 0.06);
    }

    .ngx-back-to-top:active {
      transform: scale(0.98) translateY(0);
    }

    .dark .ngx-back-to-top {
      background: rgba(15, 23, 42, 0.8);
      border-color: rgba(255, 255, 255, 0.08);
      color: #cbd5e1;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
    }

    .dark .ngx-back-to-top:hover {
      background: #1e293b;
      color: #ffffff;
    }

    /* ── SVG Progress Ring ── */
    .ngx-back-to-top__svg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    .ngx-back-to-top__circle-bg {
      fill: none;
      stroke: rgba(0, 0, 0, 0.05);
    }

    .dark .ngx-back-to-top__circle-bg {
      stroke: rgba(255, 255, 255, 0.06);
    }

    .ngx-back-to-top__circle-progress {
      fill: none;
      stroke: var(--primary-color, #3b82f6);
      stroke-dasharray: 113.1; /* 2 * PI * 18 */
      transition: stroke-dashoffset 0.1s ease;
    }

    .arrow-up-icon {
      z-index: 2;
      transition: transform 0.2s ease;
    }

    .ngx-back-to-top:hover .arrow-up-icon {
      transform: translateY(-2px);
    }
  `]
})
export class BackToTopComponent {
  // Inputs
  threshold = input<number>(300);
  target = input<string | HTMLElement | null>(null);
  theme = input<'light' | 'dark'>('light');
  showProgress = input<boolean>(true);

  // Internal state signals
  isVisible = signal<boolean>(false);
  scrollPercent = signal<number>(0);

  // Computed circular ring offset (113.1 is circumference of circle r=18)
  strokeDashoffset = computed(() => {
    const circ = 113.1;
    const ratio = this.scrollPercent() / 100;
    return circ * (1 - ratio);
  });

  constructor() {
    effect((onCleanup) => {
      const targetSel = this.target();
      this.threshold(); // Track threshold changes too

      let scrollEl: HTMLElement | Window | null = null;
      if (typeof targetSel === 'string') {
        scrollEl = document.querySelector(targetSel) as HTMLElement | null;
      } else if (targetSel instanceof HTMLElement) {
        scrollEl = targetSel;
      }

      if (!scrollEl) {
        scrollEl = window;
      }

      const listener = () => {
        this.checkScroll(scrollEl);
      };

      scrollEl.addEventListener('scroll', listener, { passive: true });
      this.checkScroll(scrollEl);

      onCleanup(() => {
        if (scrollEl) {
          scrollEl.removeEventListener('scroll', listener);
        }
      });
    }, { allowSignalWrites: true });
  }

  private checkScroll(scrollEl: HTMLElement | Window | null) {
    let scrollTop = 0;
    let scrollHeight = 0;
    let clientHeight = 0;

    if (scrollEl === window) {
      scrollTop = window.scrollY || document.documentElement.scrollTop;
      scrollHeight = document.documentElement.scrollHeight;
      clientHeight = document.documentElement.clientHeight;
    } else if (scrollEl instanceof HTMLElement) {
      scrollTop = scrollEl.scrollTop;
      scrollHeight = scrollEl.scrollHeight;
      clientHeight = scrollEl.clientHeight;
    }

    this.isVisible.set(scrollTop >= this.threshold());

    const maxScroll = scrollHeight - clientHeight;
    if (maxScroll > 0) {
      const percent = Math.round((scrollTop / maxScroll) * 100);
      this.scrollPercent.set(percent);
    } else {
      this.scrollPercent.set(0);
    }
  }

  scrollToTop() {
    const targetSel = this.target();
    let scrollEl: HTMLElement | Window | null = null;
    if (typeof targetSel === 'string') {
      scrollEl = document.querySelector(targetSel) as HTMLElement | null;
    } else if (targetSel instanceof HTMLElement) {
      scrollEl = targetSel;
    }
    if (!scrollEl) {
      scrollEl = window;
    }

    if (scrollEl === window) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (scrollEl instanceof HTMLElement) {
      scrollEl.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
