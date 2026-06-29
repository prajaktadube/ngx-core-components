import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngx-bullet-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-bullet-chart">
      <svg
        #svgEl
        class="bullet-svg"
        [attr.width]="'100%'"
        [attr.height]="svgHeight()"
      >
        <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
          <!-- Background Ranges -->
          @for (r of rangeRects(); track $index) {
            <rect
              [attr.x]="r.x"
              [attr.y]="0"
              [attr.width]="r.width"
              [attr.height]="barHeight()"
              [attr.fill]="r.color"
              class="bullet-range"
            />
          }

          <!-- Actual Value Bar -->
          <rect
            [attr.x]="0"
            [attr.y]="valBarY()"
            [attr.width]="valBarWidth()"
            [attr.height]="valBarHeight()"
            [attr.fill]="valueColor()"
            class="bullet-value-bar"
          />

          <!-- Target Line Marker -->
          <line
            [attr.x1]="targetX()"
            [attr.x2]="targetX()"
            [attr.y1]="targetY1()"
            [attr.y2]="targetY2()"
            [attr.stroke]="targetColor()"
            stroke-width="3"
            class="bullet-target-marker"
          />

          <!-- Value Labels / Ticks at bottom -->
          @if (showLabels()) {
            <g class="bullet-labels" [attr.transform]="'translate(0,' + (barHeight() + 14) + ')'">
              <!-- Min tick -->
              <text x="0" text-anchor="middle" class="tick-label">0</text>
              
              <!-- Range ticks -->
              @for (val of ranges(); track val) {
                <text
                  [attr.x]="xPos(val)"
                  text-anchor="middle"
                  class="tick-label"
                >{{ val }}</text>
              }

              <!-- Max tick -->
              <text [attr.x]="innerW()" text-anchor="middle" class="tick-label">{{ max() }}</text>
            </g>
          }
        </g>
      </svg>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .ngx-bullet-chart {
      width: 100%;
      background: var(--ngx-chart-bg, #fff);
      font-family: inherit;
    }
    .bullet-svg {
      display: block;
      overflow: visible;
    }
    .bullet-range {
      transition: width 0.3s ease, x 0.3s ease;
    }
    .bullet-value-bar {
      transition: width 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .bullet-target-marker {
      transition: x1 0.5s cubic-bezier(0.16, 1, 0.3, 1), x2 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .tick-label {
      font-size: 10px;
      fill: var(--ngx-chart-axis-text, #64748b);
      font-weight: 550;
      user-select: none;
    }
  `]
})
export class BulletChartComponent {
  value = input<number>(0);
  target = input<number>(0);
  max = input<number>(100);
  ranges = input<number[]>([50, 85, 100]);
  rangeColors = input<string[]>(['#f1f5f9', '#e2e8f0', '#cbd5e1']);
  valueColor = input<string>('#4f46e5');
  targetColor = input<string>('#ef4444');
  height = input<number>(50);
  showLabels = input<boolean>(true);

  containerWidth = signal<number>(500);

  margin = computed(() => ({
    top: 5,
    right: 15,
    bottom: this.showLabels() ? 20 : 5,
    left: 15
  }));

  svgHeight = computed(() => this.height() + this.margin().top + this.margin().bottom);
  innerW = computed(() => Math.max(10, this.containerWidth() - this.margin().left - this.margin().right));
  barHeight = computed(() => this.height());

  // Value bar sizing
  valBarHeight = computed(() => this.barHeight() * 0.35);
  valBarY = computed(() => (this.barHeight() - this.valBarHeight()) / 2);

  // Target marker sizing
  targetY1 = computed(() => this.barHeight() * 0.15);
  targetY2 = computed(() => this.barHeight() * 0.85);

  constructor() {
    const hostEl = inject(ElementRef).nativeElement;
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(entries => {
        if (!entries || entries.length === 0) return;
        const width = entries[0].contentRect.width;
        if (width > 0) {
          this.containerWidth.set(width);
        }
      });
      resizeObserver.observe(hostEl);
      inject(DestroyRef).onDestroy(() => resizeObserver.disconnect());
    }
  }

  xPos(v: number): number {
    const maxVal = this.max() || 1;
    const clamped = Math.max(0, Math.min(maxVal, v));
    return (clamped / maxVal) * this.innerW();
  }

  valBarWidth = computed(() => this.xPos(this.value()));
  targetX = computed(() => this.xPos(this.target()));

  rangeRects = computed(() => {
    const limits = this.ranges();
    const colors = this.rangeColors();
    const rects: Array<{ x: number; width: number; color: string }> = [];

    let prev = 0;
    limits.forEach((limit, idx) => {
      const x = this.xPos(prev);
      const width = Math.max(0, this.xPos(limit) - x);
      const color = colors[idx % colors.length];
      rects.push({ x, width, color });
      prev = limit;
    });

    return rects;
  });
}
