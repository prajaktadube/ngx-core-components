import { Component, input, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface GaugeThreshold {
  value: number; // The threshold limit (inclusive upper boundary)
  color: string; // The color associated with this threshold
}

@Component({
  selector: 'ngx-gauge-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="ngx-gauge-wrapper"
      (mousemove)="onMouseMove($event)"
      (mouseenter)="hovered.set(true)"
      (mouseleave)="hovered.set(false)"
    >
      <div class="ngx-gauge-container">
        <!-- SVG Gauge dial -->
        <svg
          class="ngx-gauge-svg"
          viewBox="0 0 200 200"
        >
          <defs>
            <linearGradient id="gauge-progress-grad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" [attr.stop-color]="gaugeColor()" stop-opacity="0.8" />
              <stop offset="100%" [attr.stop-color]="gaugeColor()" />
            </linearGradient>
            <radialGradient id="needle-pivot-grad" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6" />
              <stop offset="40%" [attr.stop-color]="gaugeColor()" />
              <stop offset="100%" stop-color="#0f172a" />
            </radialGradient>
            <linearGradient id="needle-grad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" [attr.stop-color]="gaugeColor()" stop-opacity="0.6" />
              <stop offset="100%" [attr.stop-color]="gaugeColor()" />
            </linearGradient>
          </defs>

          <!-- Background track arc -->
          <path
            [attr.d]="backgroundArcPath()"
            fill="none"
            stroke="var(--border-light, #f1f5f9)"
            stroke-width="14"
            stroke-linecap="round"
          />

          <!-- Colored progress arc -->
          <path
            [attr.d]="backgroundArcPath()"
            fill="none"
            stroke="url(#gauge-progress-grad)"
            stroke-width="14"
            stroke-linecap="round"
            [attr.stroke-dasharray]="arcLength() + ',' + arcLength()"
            [attr.stroke-dashoffset]="progressDashOffset()"
            class="progress-arc"
          />

          <!-- Needle / Indicator dial -->
          @if (showNeedle()) {
            <g [attr.transform]="needleTransformString()" class="gauge-needle-group">
              <!-- Needle path pointing straight up (0 deg is relative to -90 deg rotation) -->
              <path
                d="M 100 100 L 96 35 L 100 25 L 104 35 Z"
                fill="url(#needle-grad)"
                class="gauge-needle"
              />
              <circle
                cx="100"
                cy="100"
                r="9"
                fill="url(#needle-pivot-grad)"
                stroke="rgba(255, 255, 255, 0.2)"
                stroke-width="1"
              />
            </g>
          }
        </svg>

        <!-- Center values badge -->
        <div class="gauge-center-badge" [class.semi-mode]="type() === 'semi'">
          <div class="gauge-value" [style.color]="gaugeColor()">{{ value().toLocaleString() }}</div>
          @if (label()) {
            <div class="gauge-label">{{ label() }}</div>
          }
        </div>
      </div>

      <!-- Glassmorphic Tooltip -->
      @if (hovered()) {
        <div
          class="chart-tooltip"
          [style.left.px]="tooltipX()"
          [style.top.px]="tooltipY()"
        >
          @if (label()) {
            <div class="tt-cat">{{ label() }}</div>
          } @else {
            <div class="tt-cat">Gauge Metric</div>
          }
          <div class="tt-row">
            <span class="tt-dot" [style.background]="gaugeColor()"></span>
            <span class="tt-name">Value</span>
            <span class="tt-val">{{ value().toLocaleString() }}</span>
          </div>
          <div class="tt-row">
            <span class="tt-dot" style="background: transparent;"></span>
            <span class="tt-name">Range</span>
            <span class="tt-val">{{ min() }} - {{ max() }}</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .ngx-gauge-wrapper {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 12px;
      box-shadow: var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05));
      position: relative;
    }

    .ngx-gauge-container {
      position: relative;
      width: 100%;
      max-width: 240px;
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ngx-gauge-svg {
      width: 100%;
      height: 100%;
    }

    /* Arcs transition */
    .progress-arc {
      transition: stroke-dashoffset 1.0s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.3s ease;
    }

    /* Needle transition animations */
    .gauge-needle-group {
      transition: transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      transform-origin: 100px 100px;
    }
    .gauge-needle {
      filter: drop-shadow(0 3px 6px rgba(0,0,0,0.18));
    }

    /* Center Value Indicator */
    .gauge-center-badge {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      pointer-events: none;
      z-index: 2;
    }
    .gauge-center-badge.semi-mode {
      transform: translateY(18px);
    }

    .gauge-value {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.8px;
      line-height: 1;
      transition: color 0.3s ease;
      font-family: var(--ngx-heading-font-family, inherit);
    }
    .gauge-label {
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 700;
      color: var(--text-secondary, #64748b);
      letter-spacing: 0.5px;
      margin-top: 4px;
    }

    /* Glassmorphic Tooltip */
    .chart-tooltip {
      position: absolute;
      pointer-events: none;
      transform: translate(-50%, -100%) translateY(-10px);
      background: var(--ngx-chart-tooltip-bg, rgba(15, 23, 42, 0.92));
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      color: var(--ngx-chart-tooltip-color, #f8fafc);
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 12px;
      min-width: 140px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      z-index: 100;
      transition: left 0.1s cubic-bezier(0.16, 1, 0.3, 1), top 0.1s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .tt-cat {
      font-weight: 700;
      margin-bottom: 6px;
      font-size: 12.5px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      padding-bottom: 4px;
      color: #38bdf8;
    }
    .tt-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 4px;
    }
    .tt-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .tt-name {
      color: rgba(248, 250, 252, 0.8);
      flex: 1;
    }
    .tt-val {
      font-weight: 700;
      font-family: monospace;
    }
  `]
})
export class GaugeChartComponent {
  // Input Configs
  value = input.required<number>();
  min = input<number>(0);
  max = input<number>(100);
  label = input<string>('');
  type = input<'full' | 'semi'>('semi'); // 'full' is 280deg, 'semi' is 180deg
  showNeedle = input<boolean>(true);
  color = input<string>('var(--primary-color, #4f46e5)');
  thresholds = input<GaugeThreshold[]>([]);

  // State Signals
  hovered = signal<boolean>(false);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);
  animateState = signal<boolean>(false);

  constructor() {
    setTimeout(() => this.animateState.set(true), 50);
  }

  // Gauge angles definitions
  // 0 deg in polar is to the right (3 o'clock). 90 deg is straight down (6 o'clock).
  startAngle = computed(() => {
    return this.type() === 'semi' ? 180 : 135;
  });

  endAngle = computed(() => {
    return this.type() === 'semi' ? 360 : 405;
  });

  // Arc length calculations
  arcLength = computed(() => {
    const radius = 72;
    const angleRange = this.endAngle() - this.startAngle();
    return (2 * Math.PI * radius * angleRange) / 360;
  });

  progressDashOffset = computed(() => {
    const L = this.arcLength();
    const minVal = this.min();
    const maxVal = this.max();
    const currentVal = Math.max(minVal, Math.min(maxVal, this.value()));
    const range = maxVal - minVal;
    const fraction = range === 0 ? 0 : (currentVal - minVal) / range;
    const targetOffset = L - (fraction * L);
    return this.animateState() ? targetOffset : L;
  });

  // Calculate coordinates and build path for background track
  backgroundArcPath = computed(() => {
    return this.describeArc(100, 100, 72, this.startAngle(), this.endAngle());
  });

  // Needle rotation calculation
  needleTransformString = computed(() => {
    const minVal = this.min();
    const maxVal = this.max();
    const currentVal = Math.max(minVal, Math.min(maxVal, this.value()));
    const range = maxVal - minVal;
    const fraction = range === 0 ? 0 : (currentVal - minVal) / range;

    const angleRange = this.endAngle() - this.startAngle();
    const targetAngle = this.startAngle() + angleRange * fraction;

    const angle = this.animateState() ? targetAngle : this.startAngle();

    // Needle points straight up at -90 deg rotation, so we offset by -90
    const rotateAngle = angle - 270;
    return `rotate(${rotateAngle})`;
  });

  // Evaluate the gauge color depending on bound thresholds
  gaugeColor = computed(() => {
    const val = this.value();
    const thresholdList = this.thresholds();

    if (thresholdList.length === 0) {
      return this.color();
    }

    // Sort thresholds ascending
    const sorted = [...thresholdList].sort((a, b) => a.value - b.value);
    
    // Find the first threshold color where values exceed the limit
    for (const t of sorted) {
      if (val <= t.value) {
        return t.color;
      }
    }

    // Default to the last threshold color if value exceeds all thresholds
    return sorted[sorted.length - 1].color;
  });

  onMouseMove(event: MouseEvent) {
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    this.tooltipX.set(event.clientX - rect.left);
    this.tooltipY.set(event.clientY - rect.top);
  }

  // Polar to Cartesian Math helpers
  private polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  }

  private describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number): string {
    const start = this.polarToCartesian(x, y, radius, endAngle);
    const end = this.polarToCartesian(x, y, radius, startAngle);

    // If starting and ending angle range exceeds 180 degrees, set largeArcFlag
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return [
      'M', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(' ');
  }
}
