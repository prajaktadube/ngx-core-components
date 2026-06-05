import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { niceTicks, scale, fmtNum } from '../shared/chart-utils';

export interface BoxPlotItem {
  label: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  outliers?: number[];
}

@Component({
  selector: 'ngx-box-plot-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-box-plot-chart" (mouseleave)="hoveredIndex.set(null); tooltip.set(null)">
      <div class="chart-svg-container" #container>
        <svg
          [attr.width]="'100%'"
          [attr.height]="height()"
          class="chart-svg"
        >
          <g [attr.transform]="'translate(' + PAD_LEFT + ',' + PAD_TOP + ')'">
            <!-- Grid Lines (Horizontal) -->
            @if (showGrid()) {
              @for (tick of yTicks(); track tick) {
                <line
                  [attr.x1]="0"
                  [attr.x2]="innerW()"
                  [attr.y1]="yPos(tick)"
                  [attr.y2]="yPos(tick)"
                  stroke="var(--ngx-chart-grid, #ebedf0)"
                  stroke-dasharray="3,3"
                />
              }
            }

            <!-- Y-Axis Labels -->
            @for (tick of yTicks(); track tick) {
              <text
                x="-10"
                [attr.y]="yPos(tick) + 4"
                class="axis-label y"
                text-anchor="end"
              >{{ fmtNum(tick) }}</text>
            }

            <!-- X-Axis Labels -->
            @for (item of data(); track $index; let i = $index) {
              <text
                [attr.x]="xPos(i) + boxWidth() / 2"
                [attr.y]="innerH() + 20"
                class="axis-label x"
                text-anchor="middle"
              >{{ item.label }}</text>
            }

            <!-- Box Plot Elements -->
            @for (box of computedBoxes(); track $index; let i = $index) {
              <!-- Whiskers (Vertical Lines) -->
              <line
                [attr.x1]="box.centerX"
                [attr.x2]="box.centerX"
                [attr.y1]="box.yMin"
                [attr.y2]="box.yMax"
                [attr.stroke]="color()"
                stroke-width="1.5"
              />

              <!-- Whisker Caps (Horizontal Lines) -->
              <line
                [attr.x1]="box.centerX - capWidth() / 2"
                [attr.x2]="box.centerX + capWidth() / 2"
                [attr.y1]="box.yMin"
                [attr.y2]="box.yMin"
                [attr.stroke]="color()"
                stroke-width="1.5"
              />
              <line
                [attr.x1]="box.centerX - capWidth() / 2"
                [attr.x2]="box.centerX + capWidth() / 2"
                [attr.y1]="box.yMax"
                [attr.y2]="box.yMax"
                [attr.stroke]="color()"
                stroke-width="1.5"
              />

              <!-- Interquartile Box -->
              <rect
                [attr.x]="box.x"
                [attr.y]="box.yQ3"
                [attr.width]="box.width"
                [attr.height]="box.boxHeight"
                [attr.fill]="fillColor()"
                [attr.stroke]="color()"
                stroke-width="2"
                [attr.rx]="2"
                class="boxplot-rect"
                [class.hovered]="hoveredIndex() === i"
                (mouseenter)="onBoxHover($event, box.raw, i)"
              />

              <!-- Median line -->
              <line
                [attr.x1]="box.x"
                [attr.x2]="box.x + box.width"
                [attr.y1]="box.yMedian"
                [attr.y2]="box.yMedian"
                [attr.stroke]="color()"
                stroke-width="2.5"
              />

              <!-- Outliers (plotted as circles) -->
              @for (outlier of box.outlierPoints; track $index) {
                <circle
                  [attr.cx]="box.centerX"
                  [attr.cy]="outlier.y"
                  [attr.r]="3.5"
                  [attr.fill]="outlierColor()"
                  [attr.stroke]="'#ffffff'"
                  stroke-width="1"
                  class="outlier-dot"
                  (mouseenter)="onOutlierHover($event, box.raw.label, outlier.value)"
                />
              }
            }

            <!-- Base axes borders -->
            <line x1="0" [attr.x2]="innerW()" [attr.y1]="innerH()" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #ced4da)"/>
            <line x1="0" x2="0" y1="0" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #ced4da)"/>
          </g>
        </svg>

        <!-- Tooltip -->
        @if (tooltip(); as t) {
          <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
            <div class="tooltip-header">{{ t.label }}</div>
            <div class="tooltip-body">
              @if (t.isOutlier) {
                <div class="tooltip-val">Outlier Value: <strong>{{ fmtNum(t.outlierVal!) }}</strong></div>
              } @else {
                <div class="tooltip-val">Max: <strong>{{ fmtNum(t.max) }}</strong></div>
                <div class="tooltip-val">Q3: <strong>{{ fmtNum(t.q3) }}</strong></div>
                <div class="tooltip-val">Median: <strong style="color: #38bdf8;">{{ fmtNum(t.median) }}</strong></div>
                <div class="tooltip-val">Q1: <strong>{{ fmtNum(t.q1) }}</strong></div>
                <div class="tooltip-val">Min: <strong>{{ fmtNum(t.min) }}</strong></div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    .ngx-box-plot-chart {
      position: relative;
      background: var(--ngx-chart-bg, #ffffff);
      border-radius: 16px;
      padding: 16px;
      box-sizing: border-box;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
    }
    .chart-svg-container {
      position: relative;
      width: 100%;
    }
    .chart-svg {
      display: block;
      overflow: visible;
    }
    .axis-label {
      font-size: 10px;
      fill: #64748b;
      font-weight: 500;
    }
    .boxplot-rect {
      cursor: pointer;
      transition: opacity 0.2s, fill 0.2s, filter 0.2s;
    }
    .boxplot-rect.hovered {
      fill: var(--ngx-chart-hover-bg, rgba(79, 70, 229, 0.25));
      filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
    }
    .outlier-dot {
      cursor: crosshair;
      transition: r 0.15s, fill 0.15s;
    }
    .outlier-dot:hover {
      r: 5.5px;
      fill: #ef4444;
    }
    .chart-tooltip {
      position: absolute;
      pointer-events: none;
      transform: translate(-50%, -100%) translateY(-10px);
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
      color: #f8fafc;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 11px;
      z-index: 100;
      min-width: 120px;
    }
    .tooltip-header {
      font-weight: 700;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      padding-bottom: 4px;
      margin-bottom: 6px;
      color: #38bdf8;
    }
    .tooltip-body {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .tooltip-val {
      color: #94a3b8;
    }
    .tooltip-val strong {
      color: #f8fafc;
      font-family: monospace;
    }
  `]
})
export class BoxPlotChartComponent {
  PAD_LEFT = 52;
  PAD_TOP = 20;
  PAD_RIGHT = 24;
  PAD_BOTTOM = 36;

  data = input<BoxPlotItem[]>([]);
  height = input<number>(300);
  showGrid = input<boolean>(true);
  showLabels = input<boolean>(true);

  // Styles
  color = input<string>('#4f46e5'); // Primary Indigo
  fillColor = input<string>('rgba(79, 70, 229, 0.12)'); // Translucent primary
  outlierColor = input<string>('#ef4444'); // Red/Rose

  hoveredIndex = signal<number | null>(null);
  tooltip = signal<{
    x: number;
    y: number;
    label: string;
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
    isOutlier: boolean;
    outlierVal?: number;
  } | null>(null);

  private container = viewChild<ElementRef>('container');

  innerW = computed(() => {
    const el = this.container()?.nativeElement;
    const totalW = el ? el.getBoundingClientRect().width : 600;
    return Math.max(200, totalW - this.PAD_LEFT - this.PAD_RIGHT);
  });

  innerH = computed(() => this.height() - this.PAD_TOP - this.PAD_BOTTOM);

  // Range and Ticks bounds calculation
  yMin = computed(() => {
    const items = this.data();
    if (items.length === 0) return 0;
    const allVals = items.flatMap(item => [
      item.min,
      ...(item.outliers || [])
    ]);
    const minVal = Math.min(...allVals);
    return minVal < 0 ? minVal * 1.15 : minVal * 0.85;
  });

  yMax = computed(() => {
    const items = this.data();
    if (items.length === 0) return 100;
    const allVals = items.flatMap(item => [
      item.max,
      ...(item.outliers || [])
    ]);
    return Math.max(...allVals) * 1.15;
  });

  yTicks = computed(() => niceTicks(this.yMin(), this.yMax(), 5));

  // Box positions
  xPos(index: number): number {
    const count = this.data().length || 1;
    const step = this.innerW() / count;
    return index * step + step * 0.2;
  }

  yPos(y: number): number {
    return scale(y, this.yMin(), this.yMax(), this.innerH(), 0);
  }

  boxWidth(): number {
    const count = this.data().length || 1;
    return (this.innerW() / count) * 0.6;
  }

  capWidth(): number {
    return this.boxWidth() * 0.45;
  }

  computedBoxes = computed(() => {
    const items = this.data();
    const count = items.length;
    if (count === 0) return [];
    const width = this.boxWidth();

    return items.map((item, idx) => {
      const x = this.xPos(idx);
      const centerX = x + width / 2;

      const yMin = this.yPos(item.min);
      const yQ1 = this.yPos(item.q1);
      const yMedian = this.yPos(item.median);
      const yQ3 = this.yPos(item.q3);
      const yMax = this.yPos(item.max);

      const boxHeight = Math.abs(yQ1 - yQ3);

      const outlierPoints = (item.outliers || []).map(val => ({
        value: val,
        y: this.yPos(val)
      }));

      return {
        x,
        centerX,
        width,
        yMin,
        yQ1,
        yMedian,
        yQ3,
        yMax,
        boxHeight,
        outlierPoints,
        raw: item
      };
    });
  });

  onBoxHover(event: MouseEvent, item: BoxPlotItem, index: number) {
    this.hoveredIndex.set(index);
    const containerEl = this.container()?.nativeElement;
    if (!containerEl) return;
    const rect = containerEl.getBoundingClientRect();
    const tooltipX = event.clientX - rect.left;
    const tooltipY = event.clientY - rect.top;

    this.tooltip.set({
      x: tooltipX,
      y: tooltipY,
      label: item.label,
      min: item.min,
      q1: item.q1,
      median: item.median,
      q3: item.q3,
      max: item.max,
      isOutlier: false
    });
  }

  onOutlierHover(event: MouseEvent, label: string, outlierVal: number) {
    const containerEl = this.container()?.nativeElement;
    if (!containerEl) return;
    const rect = containerEl.getBoundingClientRect();
    const tooltipX = event.clientX - rect.left;
    const tooltipY = event.clientY - rect.top;

    this.tooltip.set({
      x: tooltipX,
      y: tooltipY,
      label: `${label} (Outlier)`,
      min: 0,
      q1: 0,
      median: 0,
      q3: 0,
      max: 0,
      isOutlier: true,
      outlierVal
    });
  }

  readonly fmtNum = fmtNum;
}
