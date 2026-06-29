import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CHART_COLORS, fmtNum, scale } from '../shared/chart-utils';

export interface SlopeDataPoint {
  label: string;
  startValue: number;
  endValue: number;
  color?: string;
}

@Component({
  selector: 'ngx-slope-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-slope-chart" (mouseleave)="onMouseLeave()">
      <svg
        #svgEl
        class="slope-svg"
        [attr.width]="'100%'"
        [attr.height]="svgHeight()"
      >
        <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
          <!-- Left Axis Line -->
          <line
            [attr.x1]="leftAxisX()"
            [attr.x2]="leftAxisX()"
            [attr.y1]="0"
            [attr.y2]="innerH()"
            class="axis-line"
          />

          <!-- Right Axis Line -->
          <line
            [attr.x1]="rightAxisX()"
            [attr.x2]="rightAxisX()"
            [attr.y1]="0"
            [attr.y2]="innerH()"
            class="axis-line"
          />

          <!-- Axis Labels at Top -->
          <text
            [attr.x]="leftAxisX()"
            [attr.y]="-10"
            text-anchor="middle"
            class="axis-title"
          >
            {{ startLabel() }}
          </text>
          <text
            [attr.x]="rightAxisX()"
            [attr.y]="-10"
            text-anchor="middle"
            class="axis-title"
          >
            {{ endLabel() }}
          </text>

          <!-- Slope Lines & Dots -->
          @for (item of computedItems(); track item.label; let i = $index) {
            <g
              class="slope-group"
              [class.dimmed]="hoveredIndex() !== null && hoveredIndex() !== i"
              [class.highlighted]="hoveredIndex() === i"
              (mouseenter)="onSlopeHover(i, $event)"
              (mousemove)="onSlopeMouseMove($event)"
            >
              <!-- Connecting Slope Line -->
              <line
                [attr.x1]="leftAxisX()"
                [attr.x2]="rightAxisX()"
                [attr.y1]="item.leftY"
                [attr.y2]="item.rightY"
                [attr.stroke]="item.lineColor"
                stroke-width="2.5"
                class="slope-line"
              />

              <!-- Left Endpoint Dot -->
              <circle
                [attr.cx]="leftAxisX()"
                [attr.cy]="item.leftY"
                [attr.r]="hoveredIndex() === i ? 6 : 4"
                [attr.fill]="item.lineColor"
                class="endpoint-dot"
              />

              <!-- Right Endpoint Dot -->
              <circle
                [attr.cx]="rightAxisX()"
                [attr.cy]="item.rightY"
                [attr.r]="hoveredIndex() === i ? 6 : 4"
                [attr.fill]="item.lineColor"
                class="endpoint-dot"
              />

              <!-- Label and Value on Left Axis (Outer Left side) -->
              @if (showLabels()) {
                <text
                  [attr.x]="leftAxisX() - 12"
                  [attr.y]="item.leftY"
                  text-anchor="end"
                  dominant-baseline="middle"
                  class="slope-label left-label"
                >
                  {{ item.label }}
                </text>
              }

              <!-- Value on Left Axis (Inner Left side) -->
              @if (showValues()) {
                <text
                  [attr.x]="leftAxisX() + 10"
                  [attr.y]="item.leftY"
                  text-anchor="start"
                  dominant-baseline="middle"
                  class="slope-value"
                >
                  {{ formatNumber(item.startValue) }}
                </text>
              }

              <!-- Value on Right Axis (Inner Right side) -->
              @if (showValues()) {
                <text
                  [attr.x]="rightAxisX() - 10"
                  [attr.y]="item.rightY"
                  text-anchor="end"
                  dominant-baseline="middle"
                  class="slope-value"
                >
                  {{ formatNumber(item.endValue) }}
                </text>
              }
            </g>
          }
        </g>
      </svg>

      <!-- Glassmorphic Tooltip -->
      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="tooltipX()" [style.top.px]="tooltipY()">
          <div class="tt-cat">{{ t.label }}</div>
          <div class="tt-row">
            <span class="tt-dot" style="background: var(--ngx-chart-axis, #94a3b8);"></span>
            <span class="tt-name">{{ startLabel() }}</span>
            <span class="tt-val">{{ formatNumber(t.startValue) }}</span>
          </div>
          <div class="tt-row">
            <span class="tt-dot" [style.background]="t.lineColor"></span>
            <span class="tt-name">{{ endLabel() }}</span>
            <span class="tt-val">{{ formatNumber(t.endValue) }}</span>
          </div>
          <div class="tt-row delta-row">
            <span class="tt-dot" style="background: transparent;"></span>
            <span class="tt-name">Change</span>
            <span class="tt-val" [style.color]="t.delta >= 0 ? '#10b981' : '#ef4444'">
              {{ t.delta >= 0 ? '+' : '' }}{{ formatNumber(t.delta) }} ({{ t.deltaPct >= 0 ? '+' : '' }}{{ t.deltaPct.toFixed(1) }}%)
            </span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .ngx-slope-chart {
      background: var(--ngx-chart-bg, #ffffff);
      border-radius: 16px;
      padding: 16px;
      box-sizing: border-box;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
      position: relative;
      width: 100%;
    }
    .slope-svg {
      display: block;
      overflow: visible;
    }
    .axis-line {
      stroke: var(--ngx-chart-axis, #cbd5e1);
      stroke-width: 2;
    }
    .axis-title {
      font-size: 13px;
      font-weight: 700;
      fill: var(--ngx-chart-axis-text, #334155);
      letter-spacing: 0.5px;
      user-select: none;
    }
    .slope-line {
      transition: stroke-width 0.2s ease, stroke-dashoffset 0.8s ease, opacity 0.2s ease;
      cursor: pointer;
    }
    .endpoint-dot {
      transition: r 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.2s ease;
      stroke: var(--ngx-chart-bg, #ffffff);
      stroke-width: 1.5;
    }
    .slope-label {
      font-size: 12px;
      fill: var(--ngx-chart-axis-text, #1e293b);
      font-weight: 600;
      user-select: none;
      transition: font-size 0.2s ease;
    }
    .slope-value {
      font-size: 11px;
      fill: var(--ngx-chart-axis-text, #64748b);
      font-weight: 550;
      user-select: none;
    }
    .slope-group {
      transition: opacity 0.2s ease;
    }
    .slope-group.dimmed {
      opacity: 0.2;
    }
    .slope-group.highlighted .slope-line {
      stroke-width: 4.5;
    }
    .slope-group.highlighted .slope-label {
      font-size: 13px;
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
      min-width: 170px;
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
    .delta-row {
      border-top: 1px dashed rgba(255, 255, 255, 0.15);
      margin-top: 6px;
      padding-top: 6px;
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
export class SlopeChartComponent {
  data = input<SlopeDataPoint[]>([]);
  startLabel = input<string>('Before');
  endLabel = input<string>('After');
  height = input<number>(350);
  showLabels = input<boolean>(true);
  showValues = input<boolean>(true);
  colors = input<string[]>(CHART_COLORS);

  containerWidth = signal<number>(500);
  hoveredIndex = signal<number | null>(null);
  tooltip = signal<any | null>(null);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);

  margin = computed(() => ({
    top: 40,
    right: this.showLabels() ? 120 : 40,
    bottom: 20,
    left: this.showLabels() ? 120 : 40
  }));

  svgHeight = computed(() => this.height());
  innerW = computed(() => Math.max(10, this.containerWidth() - this.margin().left - this.margin().right));
  innerH = computed(() => Math.max(10, this.svgHeight() - this.margin().top - this.margin().bottom));

  leftAxisX = computed(() => 0);
  rightAxisX = computed(() => this.innerW());

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
    const allVals = raw.flatMap(d => [d.startValue, d.endValue]);
    const min = Math.min(...allVals);
    const max = Math.max(...allVals);
    const pad = (max - min) * 0.05 || 10;
    return {
      min: Math.max(0, min - pad),
      max: max + pad
    };
  });

  computedItems = computed(() => {
    const raw = this.data();
    const b = this.bounds();
    const palette = this.colors();

    return raw.map((item, idx) => {
      // Invert Y mapping for SVG
      const leftY = scale(item.startValue, b.min, b.max, this.innerH(), 0);
      const rightY = scale(item.endValue, b.min, b.max, this.innerH(), 0);

      // Color coding: Green for positive change, Red for negative, Slate for equal
      const delta = item.endValue - item.startValue;
      let lineColor = item.color;
      if (!lineColor) {
        if (delta > 0) {
          lineColor = '#10b981'; // Green
        } else if (delta < 0) {
          lineColor = '#ef4444'; // Red
        } else {
          lineColor = '#94a3b8'; // Slate
        }
      }

      return {
        ...item,
        leftY,
        rightY,
        lineColor
      };
    });
  });

  onSlopeHover(idx: number, event: MouseEvent) {
    this.hoveredIndex.set(idx);
    const item = this.computedItems()[idx];
    if (item) {
      const delta = item.endValue - item.startValue;
      const base = item.startValue || 1;
      const deltaPct = (delta / base) * 100;
      this.tooltip.set({
        ...item,
        delta,
        deltaPct
      });
    }
  }

  onSlopeMouseMove(event: MouseEvent) {
    const el = event.currentTarget as SVGElement;
    const container = el.closest('.ngx-slope-chart');
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
