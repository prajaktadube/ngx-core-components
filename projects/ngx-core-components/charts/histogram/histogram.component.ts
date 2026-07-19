import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, TemplateRef, viewChild
} from '@angular/core';
import { DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { ChartExportService } from '../shared/chart-export.service';
import { ChartExportMenuComponent } from '../shared/chart-export-menu.component';
import type { ExportFormat } from '../shared/chart-export-menu.component';
import { CHART_COLORS, fmtNum, niceTicks, scale } from '../shared/chart-utils';

export interface HistogramBin {
  index: number;
  min: number;
  max: number;
  count: number;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

@Component({
  selector: 'ngx-histogram',
  standalone: true,
  imports: [ChartExportMenuComponent, DecimalPipe, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-histogram" (mouseleave)="onMouseLeave()">
      <div class="chart-header" (mousemove)="$event.stopPropagation()" (mouseleave)="onMouseLeave()">
        <div class="header-info">
          <span class="header-title">Histogram Distribution</span>
          <span class="header-subtitle">Bins: {{ binsCount() }}</span>
        </div>
        
        @if (showExport()) {
          <ngx-chart-export-menu (exportClicked)="onExport($event)" />
        }
      </div>

      <svg
        #svgEl
        class="histogram-svg"
        [attr.width]="'100%'"
        [attr.height]="svgHeight()"
      >
        <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
          
          <!-- Grid Lines -->
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

          <!-- Bars -->
          @for (bin of computedBins(); track bin.index; let i = $index) {
            <rect
              [attr.x]="bin.x"
              [attr.y]="bin.y"
              [attr.width]="bin.w"
              [attr.height]="bin.h"
              [attr.fill]="barColor(i)"
              class="histogram-bar"
              [class.dimmed]="hoveredIndex() !== null && hoveredIndex() !== i"
              [class.highlighted]="hoveredIndex() === i"
              (mouseenter)="onBarHover(i)"
              (mousemove)="onMouseMove($event)"
              stroke="#ffffff"
              stroke-width="1"
              rx="4"
              ry="4"
              [style.animation-delay]="(i * 0.03) + 's'"
            />
            
            @if (showLabels() && bin.count > 0) {
              <text
                [attr.x]="bin.x + bin.w / 2"
                [attr.y]="bin.y - 6"
                text-anchor="middle"
                class="bar-label"
              >
                {{ bin.count }}
              </text>
            }
          }

          <!-- Y Axis -->
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
                  {{ labelFormatter() ? labelFormatter()!(tick) : formatNumber(tick) }}
                </text>
              </g>
            }
          </g>

          <!-- X Axis -->
          <g [attr.transform]="'translate(0,' + innerH() + ')'" class="x-axis">
            <line [attr.x1]="0" [attr.x2]="innerW()" [attr.y1]="0" [attr.y2]="0" class="axis-line" />
            @for (bin of computedBins(); track bin.index) {
              <g [attr.transform]="'translate(' + (bin.x + bin.w / 2) + ',0)'">
                <line [attr.y1]="0" [attr.y2]="4" class="tick-line" />
                <text
                  [attr.y]="16"
                  text-anchor="middle"
                  class="tick-label x-tick-label"
                >
                  {{ bin.min | number:'1.0-1' }}
                </text>
              </g>
            }
            <!-- Max tick label for X Axis end edge -->
            @if (computedBins().length > 0) {
              @let lastBin = computedBins()[computedBins().length - 1];
              <g [attr.transform]="'translate(' + (lastBin.x + lastBin.w) + ',0)'">
                <line [attr.y1]="0" [attr.y2]="4" class="tick-line" />
                <text
                  [attr.y]="16"
                  text-anchor="middle"
                  class="tick-label x-tick-label"
                >
                  {{ lastBin.max | number:'1.0-1' }}
                </text>
              </g>
            }
          </g>
        </g>
      </svg>

      <!-- Glassmorphic Tooltip -->
      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="tooltipX()" [style.top.px]="tooltipY()">
          @if (tooltipTemplate()) {
            <ng-container
              *ngTemplateOutlet="tooltipTemplate()!; context: { $implicit: t }"
            ></ng-container>
          } @else {
            <div class="tt-cat">Range: {{ t.label }}</div>
            <div class="tt-row">
              <span class="tt-name">Frequency</span>
              <span class="tt-val">{{ t.count }}</span>
            </div>
            <div class="tt-row">
              <span class="tt-name">Percentage</span>
              <span class="tt-val">{{ t.percentage | number:'1.0-1' }}%</span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: relative;
    }
    .ngx-histogram {
      background: var(--ngx-chart-bg, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 16px;
      padding: 16px;
      box-sizing: border-box;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
      position: relative;
      width: 100%;
    }
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      min-height: 24px;
      position: relative;
    }
    .header-info {
      display: flex;
      flex-direction: column;
    }
    .header-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--ngx-chart-axis-text, #334155);
    }
    .header-subtitle {
      font-size: 11px;
      font-weight: 500;
      color: var(--ngx-chart-axis-text, #64748b);
    }
    .histogram-svg {
      display: block;
      overflow: visible;
    }
    .grid-line {
      stroke: var(--ngx-chart-grid, #f1f5f9);
      stroke-width: 1;
      stroke-dasharray: 3,3;
    }
    .axis-line {
      stroke: var(--ngx-chart-axis, #cbd5e1);
      stroke-width: 1.5;
    }
    .tick-line {
      stroke: var(--ngx-chart-axis, #cbd5e1);
      stroke-width: 1.5;
    }
    .tick-label {
      font-size: 10px;
      fill: var(--ngx-chart-axis-text, #64748b);
      font-weight: 550;
      user-select: none;
    }
    .x-tick-label {
      font-size: 9px;
    }
    .histogram-bar {
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      transform-origin: bottom;
      animation: barGrow 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      opacity: 0;
    }
    @keyframes barGrow {
      from { transform: scaleY(0); opacity: 0; }
      to { transform: scaleY(1); opacity: 1; }
    }
    .histogram-bar.dimmed {
      opacity: 0.3 !important;
    }
    .histogram-bar.highlighted {
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.15));
      stroke: #334155 !important;
      stroke-width: 1.5px !important;
    }
    .bar-label {
      font-size: 10px;
      font-weight: 600;
      fill: var(--ngx-chart-axis-text, #475569);
      user-select: none;
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
      min-width: 150px;
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
    .tt-name {
      color: rgba(248, 250, 252, 0.8);
      flex: 1;
    }
    .tt-val {
      font-weight: 700;
      font-family: monospace;
    }

    /* Export dropdown styles removed */
  `]
})
export class HistogramComponent {
  private readonly exportSvc = inject(ChartExportService);

  data = input<number[]>([]);
  binsCount = input<number>(10);
  height = input<number>(300);
  showGrid = input<boolean>(true);
  showLabels = input<boolean>(true);
  colors = input<string[]>(CHART_COLORS);
  showExport = input<boolean>(false);
  labelFormatter = input<((v: number) => string) | undefined>(undefined);
  tooltipTemplate = input<TemplateRef<any> | null>(null);

  containerWidth = signal<number>(500);
  hoveredIndex = signal<number | null>(null);
  tooltip = signal<any | null>(null);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  margin = computed(() => ({
    top: 30,
    right: 25,
    bottom: 30,
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

  computedBins = computed<HistogramBin[]>(() => {
    const rawData = this.data();
    const count = Math.max(1, this.binsCount() || 10);
    if (rawData.length === 0) return [];

    let min = Math.min(...rawData);
    let max = Math.max(...rawData);
    if (min === max) {
      min -= 1;
      max += 1;
    }

    const range = max - min;
    const binWidth = range / count;

    // Initialize bins
    const bins = Array.from({ length: count }, (_, i) => {
      const bMin = min + i * binWidth;
      const bMax = bMin + binWidth;
      return {
        index: i,
        min: bMin,
        max: bMax,
        count: 0,
        label: `${bMin.toFixed(1)} – ${bMax.toFixed(1)}`
      };
    });

    // Populate bins
    rawData.forEach(val => {
      let bIdx = Math.floor((val - min) / binWidth);
      if (bIdx >= count) bIdx = count - 1;
      if (bIdx < 0) bIdx = 0;
      bins[bIdx].count++;
    });

    const maxCount = Math.max(1, ...bins.map(b => b.count));
    const w = this.innerW();
    const h = this.innerH();
    const barW = w / count;

    return bins.map((b, i) => {
      const barH = scale(b.count, 0, maxCount, 0, h);
      return {
        ...b,
        x: i * barW,
        y: h - barH,
        w: barW * 0.95, // 5% spacing between bars
        h: Math.max(2, barH)
      } as HistogramBin;
    });
  });

  yTicks = computed(() => {
    const bins = this.computedBins();
    if (bins.length === 0) return [0, 5, 10];
    const maxCount = Math.max(1, ...bins.map(b => b.count));
    return niceTicks(0, maxCount, 5);
  });

  yDomainMax = computed(() => {
    const ticks = this.yTicks();
    return ticks[ticks.length - 1] || 10;
  });

  yPos(val: number): number {
    return scale(val, 0, this.yDomainMax(), this.innerH(), 0);
  }

  barColor(i: number): string {
    const colorsList = this.colors();
    return colorsList[i % colorsList.length];
  }

  onBarHover(idx: number) {
    this.hoveredIndex.set(idx);
    const bin = this.computedBins()[idx];
    if (bin) {
      const total = this.data().length || 1;
      this.tooltip.set({
        ...bin,
        percentage: (bin.count / total) * 100
      });
    }
  }

  onMouseMove(event: MouseEvent) {
    const el = event.currentTarget as SVGElement;
    const container = el.closest('.ngx-histogram');
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

  onExport(type: ExportFormat): void {
    if (type === 'json') this.exportToJson();
    else if (type === 'csv') this.exportToCsv();
    else if (type === 'svg') this.exportToSvg();
    else if (type === 'pdf') this.exportToPdf();
  }

  exportToCsv(): void {
    const bins = this.computedBins();
    if (!bins.length) return;
    const headers = ['Bin Index', 'Range Min', 'Range Max', 'Frequency'];
    const rows = bins.map(b => [b.index, b.min, b.max, b.count]);
    this.exportSvc.downloadCsv(headers, rows, 'histogram-data.csv');
  }

  exportToJson(): void {
    const bins = this.computedBins();
    if (!bins.length) return;
    const data = bins.map(b => ({
      index: b.index,
      min: b.min,
      max: b.max,
      frequency: b.count
    }));
    this.exportSvc.downloadJson(data, 'histogram-data.json');
  }

  exportToSvg(): void {
    this.exportSvc.downloadSvg(this.svgEl()?.nativeElement, 'histogram.svg');
  }

  exportToPdf(): void {
    this.exportSvc.downloadPdf(this.svgEl()?.nativeElement, 'Histogram Distribution Analysis', 'histogram.pdf');
  }

  formatNumber(v: number): string {
    return fmtNum(v);
  }
}
