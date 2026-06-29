import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CHART_COLORS, fmtNum, niceTicks, scale } from '../shared/chart-utils';

export interface ViolinItem {
  label: string;
  values: number[];
  color?: string;
}

@Component({
  selector: 'ngx-violin-plot',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-violin-plot" (mouseleave)="onMouseLeave()">
      <svg
        #svgEl
        class="violin-svg"
        [attr.width]="'100%'"
        [attr.height]="svgHeight()"
      >
        <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
          <!-- Grid Lines (Horizontal reference grid) -->
          @if (showGrid()) {
            @for (tick of yTicks(); track tick) {
              <line
                [attr.x1]="0"
                [attr.x2]="innerW()"
                [attr.y1]="yPos(tick)"
                [attr.y2]="yPos(tick)"
                class="grid-line"
              />
            }
          }

          <!-- Violins -->
          @for (item of computedItems(); track item.label; let i = $index) {
            <g
              class="violin-group"
              [class.dimmed]="hoveredIndex() !== null && hoveredIndex() !== i"
              [class.highlighted]="hoveredIndex() === i"
              (mouseenter)="onItemHover(i, $event)"
              (mousemove)="onItemMouseMove($event)"
            >
              <!-- Row/column hover trigger zone -->
              <rect
                [attr.x]="item.centerX - colWidth() / 2"
                [attr.y]="-margin().top"
                [attr.width]="colWidth()"
                [attr.height]="svgHeight()"
                fill="transparent"
                style="cursor: pointer;"
              />

              <!-- Symmetrical Violin Path -->
              <path
                [attr.d]="item.path"
                [attr.fill]="item.color"
                fill-opacity="0.3"
                [attr.stroke]="item.color"
                stroke-width="1.5"
                class="violin-path"
              />

              <!-- Overlay Jittered Points -->
              @if (showPoints()) {
                @for (val of item.values; track val; let sIdx = $index) {
                  <circle
                    [attr.cx]="item.centerX + getJitterOffset(val, sIdx, item.centerX)"
                    [attr.cy]="yPos(val)"
                    [attr.r]="3"
                    [attr.fill]="item.color"
                    fill-opacity="0.65"
                    class="jitter-point"
                  />
                }
              }

              <!-- Whisker line (min to max) -->
              <line
                [attr.x1]="item.centerX"
                [attr.x2]="item.centerX"
                [attr.y1]="yPos(item.box.min)"
                [attr.y2]="yPos(item.box.max)"
                [attr.stroke]="item.color"
                stroke-width="1"
                class="whisker-line"
              />

              <!-- Q1-Q3 Box -->
              <rect
                [attr.x]="item.centerX - 4"
                [attr.y]="yPos(item.box.q3)"
                [attr.width]="8"
                [attr.height]="Math.max(2, yPos(item.box.q1) - yPos(item.box.q3))"
                [attr.fill]="'#1e293b'"
                [attr.stroke]="item.color"
                stroke-width="1"
                class="box-rect"
              />

              <!-- Median Dot marker -->
              <circle
                [attr.cx]="item.centerX"
                [attr.cy]="yPos(item.box.median)"
                [attr.r]="3"
                fill="#ffffff"
                class="median-dot"
              />

              <!-- Column Category Labels at bottom -->
              @if (showLabels()) {
                <text
                  [attr.x]="item.centerX"
                  [attr.y]="innerH() + 18"
                  text-anchor="middle"
                  class="x-axis-label"
                >
                  {{ item.label }}
                </text>
              }
            </g>
          }

          <!-- Y Axis (Left side) -->
          <g class="y-axis">
            <line [attr.x1]="0" [attr.x2]="0" [attr.y1]="0" [attr.y2]="innerH()" class="axis-line" />
            @for (tick of yTicks(); track tick) {
              <g [attr.transform]="'translate(0,' + yPos(tick) + ')'">
                <line [attr.x1]="-4" [attr.x2]="0" [attr.y1]="0" [attr.y2]="0" class="tick-line" />
                <text
                  [attr.x]="-8"
                  text-anchor="end"
                  dominant-baseline="middle"
                  class="tick-label"
                >
                  {{ formatNumber(tick) }}
                </text>
              </g>
            }
          </g>

          <!-- Bottom X Axis Line -->
          <g [attr.transform]="'translate(0,' + innerH() + ')'" class="x-axis">
            <line [attr.x1]="0" [attr.x2]="innerW()" [attr.y1]="0" [attr.y2]="0" class="axis-line" />
          </g>
        </g>
      </svg>

      <!-- Glassmorphic Tooltip -->
      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="tooltipX()" [style.top.px]="tooltipY()">
          <div class="tt-cat">{{ t.label }}</div>
          <div class="tt-row">
            <span class="tt-name">Samples</span>
            <span class="tt-val">{{ t.count }}</span>
          </div>
          <div class="tt-row">
            <span class="tt-dot" style="background: var(--ngx-chart-axis, #94a3b8);"></span>
            <span class="tt-name">Max</span>
            <span class="tt-val">{{ formatNumber(t.box.max) }}</span>
          </div>
          <div class="tt-row">
            <span class="tt-dot" style="background: var(--ngx-chart-axis, #94a3b8);"></span>
            <span class="tt-name">Q3</span>
            <span class="tt-val">{{ formatNumber(t.box.q3) }}</span>
          </div>
          <div class="tt-row">
            <span class="tt-dot" style="background: #ffffff; border: 1.5px solid var(--ngx-chart-axis, #94a3b8);"></span>
            <span class="tt-name">Median</span>
            <span class="tt-val">{{ formatNumber(t.box.median) }}</span>
          </div>
          <div class="tt-row">
            <span class="tt-dot" style="background: var(--ngx-chart-axis, #94a3b8);"></span>
            <span class="tt-name">Q1</span>
            <span class="tt-val">{{ formatNumber(t.box.q1) }}</span>
          </div>
          <div class="tt-row">
            <span class="tt-dot" style="background: var(--ngx-chart-axis, #94a3b8);"></span>
            <span class="tt-name">Min</span>
            <span class="tt-val">{{ formatNumber(t.box.min) }}</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .ngx-violin-plot {
      background: var(--ngx-chart-bg, #ffffff);
      border-radius: 16px;
      padding: 16px;
      box-sizing: border-box;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
      position: relative;
      width: 100%;
    }
    .violin-svg {
      display: block;
      overflow: visible;
    }
    .grid-line {
      stroke: var(--ngx-chart-grid, #f1f5f9);
      stroke-width: 1;
    }
    .axis-line {
      stroke: var(--ngx-chart-axis, #cbd5e1);
      stroke-width: 1.5;
    }
    .tick-line {
      stroke: var(--ngx-chart-axis, #cbd5e1);
      stroke-width: 1.5;
    }
    .tick-label, .x-axis-label {
      font-size: 11px;
      fill: var(--ngx-chart-axis-text, #64748b);
      font-weight: 550;
      user-select: none;
    }
    .violin-path {
      transition: fill-opacity 0.2s ease, stroke-width 0.2s ease;
      cursor: pointer;
      transform-origin: bottom;
      animation: violinScaleIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    }
    @keyframes violinScaleIn {
      from { transform: scaleX(0); opacity: 0; }
      to { transform: scaleX(1); opacity: 1; }
    }
    .jitter-point {
      animation: pointFadeIn 0.5s ease forwards;
      opacity: 0;
    }
    @keyframes pointFadeIn {
      from { opacity: 0; transform: scale(0); }
      to { opacity: 1; transform: scale(1); }
    }
    .violin-group {
      transition: opacity 0.2s ease;
    }
    .violin-group.dimmed {
      opacity: 0.3;
    }
    .violin-group.highlighted .violin-path {
      fill-opacity: 0.5;
      stroke-width: 2.5;
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
      min-width: 160px;
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
export class ViolinPlotComponent {
  data = input<ViolinItem[]>([]);
  height = input<number>(350);
  showGrid = input<boolean>(true);
  showLabels = input<boolean>(true);
  showPoints = input<boolean>(false);
  colors = input<string[]>(CHART_COLORS);

  containerWidth = signal<number>(500);
  hoveredIndex = signal<number | null>(null);
  tooltip = signal<any | null>(null);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);

  getJitterOffset(val: number, index: number, centerX: number): number {
    return Math.sin(val * 1000 + index) * 12;
  }

  readonly Math = Math;

  margin = computed(() => ({
    top: 20,
    right: 20,
    bottom: this.showLabels() ? 30 : 10,
    left: 45
  }));

  svgHeight = computed(() => this.height());
  innerW = computed(() => Math.max(10, this.containerWidth() - this.margin().left - this.margin().right));
  innerH = computed(() => Math.max(10, this.svgHeight() - this.margin().top - this.margin().bottom));

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

  // Bounds
  bounds = computed(() => {
    const raw = this.data();
    if (raw.length === 0) return { min: 0, max: 100 };
    const allValues = raw.flatMap(d => d.values);
    if (allValues.length === 0) return { min: 0, max: 100 };
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const pad = (max - min) * 0.1 || 10;
    return {
      min: Math.max(0, min - pad),
      max: max + pad
    };
  });

  yTicks = computed(() => {
    const b = this.bounds();
    return niceTicks(b.min, b.max, 5);
  });

  domainMax = computed(() => {
    const t = this.yTicks();
    return t[t.length - 1] || 100;
  });

  domainMin = computed(() => {
    const t = this.yTicks();
    return t[0] || 0;
  });

  yPos(val: number): number {
    return scale(val, this.domainMin(), this.domainMax(), this.innerH(), 0);
  }

  colWidth = computed(() => {
    const count = this.data().length || 1;
    return this.innerW() / count;
  });

  computedItems = computed(() => {
    const raw = this.data();
    const count = raw.length;
    if (count === 0) return [];

    const colW = this.colWidth();
    const minVal = this.domainMin();
    const maxVal = this.domainMax();
    const palette = this.colors();

    // Symmetrical Violin calculation using Gaussian KDE
    return raw.map((item, idx) => {
      const color = item.color || palette[idx % palette.length];
      const centerX = colW * idx + colW / 2;

      // 1. Calculate statistical box coordinates (min, q1, median, q3, max)
      const sorted = [...item.values].sort((a, b) => a - b);
      const valCount = sorted.length;
      let min = 0, q1 = 0, median = 0, q3 = 0, max = 0;

      if (valCount > 0) {
        min = sorted[0];
        max = sorted[valCount - 1];
        median = this.getPercentile(sorted, 50);
        q1 = this.getPercentile(sorted, 25);
        q3 = this.getPercentile(sorted, 75);
      }

      // 2. Compute Gaussian KDE curve
      // Estimate optimal bandwidth (Silverman's rule of thumb)
      const stdDev = this.getStdDev(item.values, median);
      const bandwidth = 0.9 * Math.min(stdDev, (q3 - q1) / 1.34) * Math.pow(valCount, -0.2) || 1.0;

      // Sample points along the vertical y-axis
      const sampleCount = 40;
      const densityPoints: { value: number; density: number }[] = [];

      for (let s = 0; s <= sampleCount; s++) {
        // Value mapping along domain
        const v = minVal + (s / sampleCount) * (maxVal - minVal);
        const density = this.kernelDensityEstimator(item.values, v, bandwidth);
        densityPoints.push({ value: v, density });
      }

      // Find max density value for scaling the width of the violin
      const maxDensity = Math.max(...densityPoints.map(p => p.density)) || 1.0;
      // Allow violin to fill up to 85% of its column width
      const maxHalfWidth = (colW * 0.42);

      // Build symmetrical closed SVG path
      // Curve flows from bottom min to top max on the right, and then down on the left
      const rightPoints: string[] = [];
      const leftPoints: string[] = [];

      densityPoints.forEach(p => {
        const y = this.yPos(p.value);
        const widthOffset = (p.density / maxDensity) * maxHalfWidth;

        const rx = centerX + widthOffset;
        const lx = centerX - widthOffset;

        rightPoints.push(`${rx},${y}`);
        leftPoints.unshift(`${lx},${y}`); // Prepended to loop back down symmetrically
      });

      const pathString = `M ${centerX},${this.yPos(minVal)} L ` +
        rightPoints.join(' L ') + ` L ${centerX},${this.yPos(maxVal)} L ` +
        leftPoints.join(' L ') + ' Z';

      return {
        label: item.label,
        values: item.values,
        count: valCount,
        color,
        centerX,
        box: { min, q1, median, q3, max },
        path: pathString
      };
    });
  });

  // Gaussian Kernel function
  private kernelDensityEstimator(samples: number[], x: number, bandwidth: number): number {
    const n = samples.length;
    if (n === 0) return 0;
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const u = (x - samples[i]) / bandwidth;
      // Gaussian kernel: K(u) = (1/sqrt(2*pi)) * exp(-0.5 * u^2)
      const kernel = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * u * u);
      sum += kernel;
    }
    return sum / (n * bandwidth);
  }

  // StdDev calculation helper
  private getStdDev(values: number[], mean: number): number {
    const n = values.length;
    if (n <= 1) return 1.0;
    const sqDiffs = values.map(v => Math.pow(v - mean, 2));
    const sum = sqDiffs.reduce((acc, curr) => acc + curr, 0);
    return Math.sqrt(sum / (n - 1));
  }

  // Percentile calculation helper
  private getPercentile(sorted: number[], pct: number): number {
    const n = sorted.length;
    const index = (pct / 100) * (n - 1);
    const low = Math.floor(index);
    const high = Math.ceil(index);
    if (low === high) return sorted[low];
    return sorted[low] + (index - low) * (sorted[high] - sorted[low]);
  }

  onItemHover(idx: number, event: MouseEvent) {
    this.hoveredIndex.set(idx);
    const item = this.computedItems()[idx];
    if (item) {
      this.tooltip.set(item);
    }
  }

  onItemMouseMove(event: MouseEvent) {
    const el = event.currentTarget as SVGElement;
    const container = el.closest('.ngx-violin-plot');
    if (container) {
      const rect = container.getBoundingClientRect();
      this.tooltipX.set(event.clientX - rect.left);
      this.tooltipY.set(event.clientY - rect.top);
    }
  }

  onMouseLeave() {
    this.hoveredIndex.set(null);
    this.tooltip.set(null);
  }

  formatNumber(v: number): string {
    return fmtNum(v);
  }
}
