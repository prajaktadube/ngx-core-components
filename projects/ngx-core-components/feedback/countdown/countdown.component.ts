import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
  OnDestroy,
  effect,
  untracked,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type CountdownVariant = 'default' | 'success' | 'danger' | 'warning' | 'info';

@Component({
  selector: 'ngx-countdown',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="ngx-countdown"
      [class.dark]="theme() === 'dark'"
      [class]="variantClass()"
      [attr.id]="id()"
    >
      @if (showRing()) {
        <div class="ngx-countdown__ring-container">
          <svg class="ngx-countdown__svg" viewBox="0 0 120 120">
            <!-- Background circle -->
            <circle
              class="ngx-countdown__circle-bg"
              cx="60"
              cy="60"
              r="52"
              stroke-width="6"
            />
            <!-- Progress circle -->
            <circle
              class="ngx-countdown__circle-progress"
              cx="60"
              cy="60"
              r="52"
              stroke-width="6"
              [style.stroke]="ringColor() || 'var(--primary-color)'"
              [style.strokeDashoffset]="strokeDashoffset()"
              stroke-linecap="round"
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div class="ngx-countdown__ring-content">
            <span class="ngx-countdown__ring-value">{{ formattedCompactTime() }}</span>
            <span class="ngx-countdown__ring-label">remaining</span>
          </div>
        </div>
      }

      <!-- Flip-card style countdown layout -->
      <div class="ngx-countdown__grid" [class.hidden]="showRing() && compactOnly()">
        <!-- Days -->
        @if (days() > 0 || forceShowDays()) {
          <div class="ngx-countdown__card">
            <div class="ngx-countdown__number-wrap">
              <span class="ngx-countdown__number">{{ formatNumber(days()) }}</span>
            </div>
            <span class="ngx-countdown__label">Days</span>
          </div>
        }

        <!-- Hours -->
        <div class="ngx-countdown__card">
          <div class="ngx-countdown__number-wrap">
            <span class="ngx-countdown__number">{{ formatNumber(hours()) }}</span>
          </div>
          <span class="ngx-countdown__label">Hours</span>
        </div>

        <!-- Minutes -->
        <div class="ngx-countdown__card">
          <div class="ngx-countdown__number-wrap">
            <span class="ngx-countdown__number">{{ formatNumber(minutes()) }}</span>
          </div>
          <span class="ngx-countdown__label">Minutes</span>
        </div>

        <!-- Seconds -->
        <div class="ngx-countdown__card">
          <div class="ngx-countdown__number-wrap">
            <span class="ngx-countdown__number">{{ formatNumber(seconds()) }}</span>
          </div>
          <span class="ngx-countdown__label">Seconds</span>
        </div>
      </div>

      <!-- Controls -->
      @if (showControls()) {
        <div class="ngx-countdown__controls">
          @if (isRunning()) {
            <button class="ngx-countdown__btn btn-pause" (click)="pause()" aria-label="Pause timer">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
              Pause
            </button>
          } @else {
            <button class="ngx-countdown__btn btn-start" (click)="start()" [disabled]="isFinished()" aria-label="Start timer">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Start
            </button>
          }
          <button class="ngx-countdown__btn btn-reset" (click)="reset()" aria-label="Reset timer">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            Reset
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    .ngx-countdown {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      padding: 24px;
      border-radius: 20px;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
      background: rgba(255, 255, 255, 0.55);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.4);
      box-shadow: 
        0 10px 30px -10px rgba(0, 0, 0, 0.08),
        0 1px 3px rgba(0, 0, 0, 0.03),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
      transition: all 0.3s ease;
    }

    .ngx-countdown.dark {
      background: rgba(30, 32, 48, 0.8);
      border-color: rgba(255, 255, 255, 0.08);
      box-shadow: 
        0 10px 30px -10px rgba(0, 0, 0, 0.3),
        0 1px 3px rgba(0, 0, 0, 0.1);
    }

    /* ── SVG Ring ── */
    .ngx-countdown__ring-container {
      position: relative;
      width: 140px;
      height: 140px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ngx-countdown__svg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .ngx-countdown__circle-bg {
      fill: none;
      stroke: rgba(0, 0, 0, 0.05);
    }

    .dark .ngx-countdown__circle-bg {
      stroke: rgba(255, 255, 255, 0.06);
    }

    .ngx-countdown__circle-progress {
      fill: none;
      stroke: var(--primary-color);
      transition: stroke-dashoffset 1s linear;
      stroke-dasharray: 326.7; /* 2 * PI * r (r=52) */
    }

    .ngx-countdown__ring-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 1;
    }

    .ngx-countdown__ring-value {
      font-size: 20px;
      font-weight: 700;
      color: #1e293b;
      letter-spacing: -0.5px;
    }

    .dark .ngx-countdown__ring-value {
      color: #f1f5f9;
    }

    .ngx-countdown__ring-label {
      font-size: 10px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #64748b;
      margin-top: 2px;
    }

    .dark .ngx-countdown__ring-label {
      color: #94a3b8;
    }

    /* ── Grid Cards ── */
    .ngx-countdown__grid {
      display: flex;
      gap: 12px;
      justify-content: center;
    }

    .ngx-countdown__grid.hidden {
      display: none;
    }

    .ngx-countdown__card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }

    .ngx-countdown__number-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 58px;
      height: 58px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.7);
      box-shadow: 
        0 4px 6px -1px rgba(0, 0, 0, 0.05),
        0 2px 4px -1px rgba(0, 0, 0, 0.03);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .dark .ngx-countdown__number-wrap {
      background: rgba(15, 23, 42, 0.45);
      border-color: rgba(255, 255, 255, 0.06);
      box-shadow: none;
    }

    .ngx-countdown__number {
      font-size: 26px;
      font-weight: 700;
      color: #0f172a;
      font-variant-numeric: tabular-nums;
    }

    .dark .ngx-countdown__number {
      color: #f8fafc;
      text-shadow: 0 0 10px rgba(255, 255, 255, 0.05);
    }

    .ngx-countdown__label {
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .dark .ngx-countdown__label {
      color: #94a3b8;
    }

    /* ── Controls Buttons ── */
    .ngx-countdown__controls {
      display: flex;
      gap: 8px;
      margin-top: 4px;
    }

    .ngx-countdown__btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      background: rgba(255, 255, 255, 0.8);
      border: 1.5px solid rgba(0, 0, 0, 0.06);
      color: #334155;
      transition: all 0.2s ease;
    }

    .ngx-countdown__btn svg {
      transition: transform 0.2s ease;
    }

    .ngx-countdown__btn:hover:not(:disabled) {
      background: #f8fafc;
      border-color: rgba(0, 0, 0, 0.12);
      transform: translateY(-1px);
    }

    .ngx-countdown__btn:active:not(:disabled) {
      transform: translateY(0);
    }

    .ngx-countdown__btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .dark .ngx-countdown__btn {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.08);
      color: #e2e8f0;
    }

    .dark .ngx-countdown__btn:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.15);
    }

    /* ── Variants ── */
    .ngx-countdown.success .ngx-countdown__circle-progress {
      stroke: #10b981 !important;
    }
    .ngx-countdown.danger .ngx-countdown__circle-progress {
      stroke: #ef4444 !important;
    }
    .ngx-countdown.warning .ngx-countdown__circle-progress {
      stroke: #f59e0b !important;
    }
    .ngx-countdown.info .ngx-countdown__circle-progress {
      stroke: #3b82f6 !important;
    }

    .ngx-countdown.success .ngx-countdown__number-wrap {
      border-color: rgba(16, 185, 129, 0.25);
    }
    .ngx-countdown.danger .ngx-countdown__number-wrap {
      border-color: rgba(239, 68, 68, 0.25);
    }
    .ngx-countdown.warning .ngx-countdown__number-wrap {
      border-color: rgba(245, 158, 11, 0.25);
    }
    .ngx-countdown.info .ngx-countdown__number-wrap {
      border-color: rgba(59, 130, 246, 0.25);
    }

    .dark.ngx-countdown.success .ngx-countdown__number-wrap {
      border-color: rgba(16, 185, 129, 0.15);
    }
    .dark.ngx-countdown.danger .ngx-countdown__number-wrap {
      border-color: rgba(239, 68, 68, 0.15);
    }
    .dark.ngx-countdown.warning .ngx-countdown__number-wrap {
      border-color: rgba(245, 158, 11, 0.15);
    }
    .dark.ngx-countdown.info .ngx-countdown__number-wrap {
      border-color: rgba(59, 130, 246, 0.15);
    }
  `]
})
export class CountdownComponent implements OnDestroy {
  // Inputs
  targetDate = input<string | Date | null>(null);
  duration = input<number | null>(null); // in seconds
  showRing = input<boolean>(true);
  ringColor = input<string>('');
  theme = input<'light' | 'dark'>('light');
  variant = input<CountdownVariant>('default');
  autoStart = input<boolean>(true);
  showControls = input<boolean>(true);
  compactOnly = input<boolean>(false);
  forceShowDays = input<boolean>(false);
  id = input<string>('ngx-countdown-' + Math.random().toString(36).substring(2, 9));

  // Outputs
  finished = output<void>();
  tick = output<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
  }>();

  // Internal Signals
  remainingSeconds = signal<number>(0);
  initialTotalSeconds = signal<number>(1);
  isRunning = signal<boolean>(false);

  private timerId: any = null;

  // Computeds
  days = computed(() => Math.floor(this.remainingSeconds() / 86400));
  hours = computed(() => Math.floor((this.remainingSeconds() % 86400) / 3600));
  minutes = computed(() => Math.floor((this.remainingSeconds() % 3600) / 60));
  seconds = computed(() => this.remainingSeconds() % 60);

  isFinished = computed(() => this.remainingSeconds() <= 0);

  // Compute progress ratio (0 to 1) for the SVG circle offset
  progressRatio = computed(() => {
    if (this.initialTotalSeconds() <= 0) return 0;
    const ratio = this.remainingSeconds() / this.initialTotalSeconds();
    return Math.max(0, Math.min(1, ratio));
  });

  strokeDashoffset = computed(() => {
    const circumference = 326.7; // 2 * Math.PI * 52
    return circumference * (1 - this.progressRatio());
  });

  formattedCompactTime = computed(() => {
    const d = this.days();
    const h = this.formatNumber(this.hours());
    const m = this.formatNumber(this.minutes());
    const s = this.formatNumber(this.seconds());
    if (d > 0) {
      return `${d}d ${h}:${m}`;
    }
    return `${h}:${m}:${s}`;
  });

  variantClass = computed(() => {
    return this.variant() !== 'default' ? `success danger warning info`.split(' ').includes(this.variant()) ? this.variant() : '' : '';
  });

  constructor() {
    effect(() => {
      // React to changes in inputs
      this.targetDate();
      this.duration();

      untracked(() => {
        this.reset();
        if (this.autoStart() && !this.isFinished()) {
          this.start();
        }
      });
    }, { allowSignalWrites: true });
  }

  ngOnDestroy() {
    this.clearTimer();
  }

  start() {
    if (this.isFinished()) return;
    if (this.timerId) return;

    this.isRunning.set(true);
    this.timerId = setInterval(() => {
      const nextVal = this.remainingSeconds() - 1;
      if (nextVal <= 0) {
        this.remainingSeconds.set(0);
        this.clearTimer();
        this.isRunning.set(false);
        this.finished.emit();
      } else {
        this.remainingSeconds.set(nextVal);
      }

      this.tick.emit({
        days: this.days(),
        hours: this.hours(),
        minutes: this.minutes(),
        seconds: this.seconds(),
        totalSeconds: this.remainingSeconds()
      });
    }, 1000);
  }

  pause() {
    this.clearTimer();
    this.isRunning.set(false);
  }

  reset() {
    this.clearTimer();
    this.isRunning.set(false);

    let seconds = 0;
    const target = this.targetDate();
    const dur = this.duration();

    if (target) {
      const targetTime = new Date(target).getTime();
      const now = new Date().getTime();
      seconds = Math.max(0, Math.floor((targetTime - now) / 1000));
    } else if (dur !== null && dur !== undefined) {
      seconds = Math.max(0, dur);
    }

    this.remainingSeconds.set(seconds);
    this.initialTotalSeconds.set(seconds > 0 ? seconds : 1);
  }

  formatNumber(val: number): string {
    return val < 10 ? `0${val}` : `${val}`;
  }

  private clearTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}
