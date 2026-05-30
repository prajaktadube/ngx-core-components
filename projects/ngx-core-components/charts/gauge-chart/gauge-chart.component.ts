import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface GaugeThreshold {
  value: number; // The threshold limit (inclusive upper boundary)
  color: string; // The color associated with this threshold
}

@Component({
  selector: 'ngx-gauge-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ngx-gauge-wrapper">
      <div class="ngx-gauge-container">
        <!-- SVG Gauge dial -->
        <svg
          class="ngx-gauge-svg"
          viewBox="0 0 200 200"
        >
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
            [attr.d]="progressArcPath()"
            fill="none"
            [attr.stroke]="gaugeColor()"
            stroke-width="14"
            stroke-linecap="round"
            class="progress-arc"
          />

          <!-- Needle / Indicator dial -->
          @if (showNeedle()) {
            <g [attr.transform]="needleTransformString()" class="gauge-needle-group">
              <!-- Needle path pointing straight up (0 deg is relative to -90 deg rotation) -->
              <path
                d="M 100 100 L 96 35 L 100 25 L 104 35 Z"
                [attr.fill]="gaugeColor()"
                class="gauge-needle"
              />
              <circle
                cx="100"
                cy="100"
                r="8"
                [attr.fill]="gaugeColor()"
                stroke="var(--bg-secondary, #ffffff)"
                stroke-width="2.5"
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
      transition: stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.3s ease;
    }

    /* Needle transition animations */
    .gauge-needle-group {
      transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      transform-origin: 100px 100px;
    }
    .gauge-needle {
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));
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

  // Gauge angles definitions
  // 0 deg in polar is to the right (3 o'clock). 90 deg is straight down (6 o'clock).
  // A standard semi-circle speedometer goes from 180deg (left, 9 o'clock) to 360deg (right, 3 o'clock).
  // A full dial goes from 135deg (bottom-left) to 405deg (bottom-right).
  startAngle = computed(() => {
    return this.type() === 'semi' ? 180 : 135;
  });

  endAngle = computed(() => {
    return this.type() === 'semi' ? 360 : 405;
  });

  // Calculate coordinates and build path for background track
  backgroundArcPath = computed(() => {
    return this.describeArc(100, 100, 72, this.startAngle(), this.endAngle());
  });

  // Calculate current value angle and build path for progress fill
  progressArcPath = computed(() => {
    const minVal = this.min();
    const maxVal = this.max();
    const currentVal = Math.max(minVal, Math.min(maxVal, this.value()));
    const range = maxVal - minVal;
    const fraction = range === 0 ? 0 : (currentVal - minVal) / range;

    const angleRange = this.endAngle() - this.startAngle();
    const targetAngle = this.startAngle() + angleRange * fraction;

    return this.describeArc(100, 100, 72, this.startAngle(), targetAngle);
  });

  // Needle rotation calculation
  needleTransformString = computed(() => {
    const minVal = this.min();
    const maxVal = this.max();
    const currentVal = Math.max(minVal, Math.min(maxVal, this.value()));
    const range = maxVal - minVal;
    const fraction = range === 0 ? 0 : (currentVal - minVal) / range;

    const angleRange = this.endAngle() - this.startAngle();
    const angle = this.startAngle() + angleRange * fraction;

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
