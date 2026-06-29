import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, TemplateRef, viewChild, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CHART_COLORS, fmtNum, niceTicks, scale } from '../shared/chart-utils';

export interface KagiSegment {
  x: number;
  y1: number;
  y2: number;
  val1: number;
  val2: number;
  type: 'vertical' | 'horizontal';
  trend: 'bullish' | 'bearish';
  color: string;
  thickness: number;
}

@Component({
  selector: 'ngx-kagi-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-kagi-chart" (mouseleave)="onMouseLeave()">
      <div class="chart-header">
        <div class="header-info">
          <span class="header-title">Kagi Chart</span>
          <span class="header-reversal">Reversal: {{ reversalAmount() }}</span>
        </div>

        <!-- Export Menu -->
        @if (showExport()) {
          <div class="chart-export-menu">
            <button class="export-trigger" (click)="toggleExportMenu($event)" aria-label="Export Menu">📤 Export</button>
            @if (exportMenuOpen()) {
              <div class="export-dropdown">
                <button (click)="onExport('json')">📊 Export JSON</button>
                <button (click)="onExport('csv')">📄 Export CSV</button>
                <button (click)="onExport('svg')">🖼️ Export SVG</button>
              </div>
            }
          </div>
        }
      </div>

      <svg
        #svgEl
        class="kagi-svg"
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

          <!-- Kagi Line Paths -->
          @for (seg of computedSegments(); track $index; let idx = $index) {
            <line
              [attr.x1]="seg.x"
              [attr.y1]="seg.y1"
              [attr.x2]="seg.type === 'horizontal' ? nextX(idx) : seg.x"
              [attr.y2]="seg.y2"
              [attr.stroke]="seg.color"
              [attr.stroke-width]="seg.thickness"
              stroke-linecap="round"
              class="kagi-line"
              [class.dimmed]="hoveredSegmentIndex() !== null && hoveredSegmentIndex() !== idx"
              (mouseenter)="onSegmentHover(idx, $event)"
              (mousemove)="onMouseMove($event)"
              [style.animation-delay]="(idx * 0.05) + 's'"
            />
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
                  {{ labelFormatter() ? labelFormatter()!(tick) : formatNumber(tick) }}
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
          @if (tooltipTemplate()) {
            <ng-container
              *ngTemplateOutlet="tooltipTemplate()!; context: { $implicit: t }"
            ></ng-container>
          } @else {
            <div class="tt-cat" [style.color]="t.color">
              {{ t.trend === 'bullish' ? 'Yang (Bullish)' : 'Yin (Bearish)' }}
            </div>
            @if (t.type === 'vertical') {
              <div class="tt-row">
                <span class="tt-name">From</span>
                <span class="tt-val">{{ labelFormatter() ? labelFormatter()!(t.val1) : formatNumber(t.val1) }}</span>
              </div>
              <div class="tt-row">
                <span class="tt-name">To</span>
                <span class="tt-val">{{ labelFormatter() ? labelFormatter()!(t.val2) : formatNumber(t.val2) }}</span>
              </div>
            } @else {
              <div class="tt-row">
                <span class="tt-name">Reversal level</span>
                <span class="tt-val">{{ labelFormatter() ? labelFormatter()!(t.val1) : formatNumber(t.val1) }}</span>
              </div>
            }
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
    .ngx-kagi-chart {
      background: var(--ngx-chart-bg, #ffffff);
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
      align-items: center;
      gap: 12px;
    }
    .header-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--ngx-chart-axis-text, #334155);
    }
    .header-reversal {
      font-size: 11px;
      font-weight: 600;
      color: var(--ngx-chart-axis-text, #64748b);
      background: var(--ngx-chart-grid, #f1f5f9);
      padding: 2px 8px;
      border-radius: 6px;
    }
    .kagi-svg {
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
    .tick-label {
      font-size: 11px;
      fill: var(--ngx-chart-axis-text, #64748b);
      font-weight: 550;
      user-select: none;
    }
    .kagi-line {
      cursor: pointer;
      animation: lineFadeIn 0.5s ease-out forwards;
      opacity: 0;
    }
    @keyframes lineFadeIn {
      to { opacity: 1; }
    }
    .kagi-line.dimmed {
      opacity: 0.25 !important;
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

    /* Export dropdown styles */
    .chart-export-menu {
      position: relative;
      z-index: 50;
    }
    .export-trigger {
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 600;
      color: var(--ngx-chart-axis-text, #64748b);
      background: rgba(241, 245, 249, 0.8);
      backdrop-filter: blur(8px);
      border: 1px solid var(--ngx-chart-grid, #e2e8f0);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .export-trigger:hover {
      background: #ffffff;
      color: #4f46e5;
      border-color: #4f46e5;
    }
    .export-dropdown {
      position: absolute;
      right: 0;
      top: calc(100% + 4px);
      background: #ffffff;
      border: 1px solid var(--ngx-chart-grid, #e2e8f0);
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
      padding: 4px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 120px;
    }
    .export-dropdown button {
      background: none;
      border: none;
      padding: 6px 10px;
      font-size: 11px;
      text-align: left;
      cursor: pointer;
      color: #1e293b;
      border-radius: 4px;
      width: 100%;
      transition: all 0.12s;
    }
    .export-dropdown button:hover {
      background: rgba(79, 70, 229, 0.06);
      color: #4f46e5;
    }
  `]
})
export class KagiChartComponent {
  data = input<number[]>([]);
  reversalAmount = input<number>(15);
  height = input<number>(350);
  showGrid = input<boolean>(true);
  bullishColor = input<string>('#10b981');
  bearishColor = input<string>('#ef4444');
  showExport = input<boolean>(false);
  labelFormatter = input<((v: number) => string) | undefined>(undefined);
  tooltipTemplate = input<TemplateRef<any> | null>(null);

  containerWidth = signal<number>(500);
  hoveredSegmentIndex = signal<number | null>(null);
  tooltip = signal<any | null>(null);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);
  exportMenuOpen = signal(false);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  margin = computed(() => ({
    top: 20,
    right: 20,
    bottom: 20,
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

  // Next X coord calculation helper for horizontal connections
  nextX(idx: number): number {
    const segments = this.computedSegments();
    // Look ahead to find the next vertical segment coordinate
    for (let i = idx + 1; i < segments.length; i++) {
      if (segments[i].type === 'vertical') {
        return segments[i].x;
      }
    }
    return segments[idx].x + 20; // Default fallback
  }

  // Calculate Kagi Segments based on reversal size
  computedSegments = computed<KagiSegment[]>(() => {
    const prices = this.data();
    const reversal = this.reversalAmount() || 15;
    if (prices.length === 0) return [];

    // Calculate reversal columns
    const rawSegments: { start: number; end: number; type: 'vertical' | 'horizontal'; trend: 'bullish' | 'bearish' }[] = [];
    let startVal = prices[0];
    let currentVal = prices[0];
    let direction = 0; // 0: undecided, 1: up, -1: down
    let trend: 'bullish' | 'bearish' = 'bearish';

    // Track historical highs/lows for trend thick/thin switching (Kagi rule)
    let priorHigh = prices[0];
    let priorLow = prices[0];

    for (let i = 1; i < prices.length; i++) {
      const price = prices[i];
      const diff = price - currentVal;

      if (direction === 0) {
        if (Math.abs(diff) >= reversal) {
          direction = diff > 0 ? 1 : -1;
          currentVal = price;
        }
      } else if (direction === 1) {
        // Upward trend
        if (price > currentVal) {
          if (price > priorHigh) {
            trend = 'bullish';
          }
          currentVal = price;
        } else if (currentVal - price >= reversal) {
          // Reversal downward
          rawSegments.push({ start: startVal, end: currentVal, type: 'vertical', trend });
          rawSegments.push({ start: currentVal, end: currentVal, type: 'horizontal', trend });
          priorHigh = currentVal;
          startVal = currentVal;
          currentVal = price;
          direction = -1;
        }
      } else {
        // Downward trend
        if (price < currentVal) {
          if (price < priorLow) {
            trend = 'bearish';
          }
          currentVal = price;
        } else if (price - currentVal >= reversal) {
          // Reversal upward
          rawSegments.push({ start: startVal, end: currentVal, type: 'vertical', trend });
          rawSegments.push({ start: currentVal, end: currentVal, type: 'horizontal', trend });
          priorLow = currentVal;
          startVal = currentVal;
          currentVal = price;
          direction = 1;
        }
      }
    }
    rawSegments.push({ start: startVal, end: currentVal, type: 'vertical', trend });

    // Filter/scale coordinates
    const w = this.innerW();
    const h = this.innerH();

    const allVals = prices;
    const minVal = Math.min(...allVals);
    const maxVal = Math.max(...allVals);
    const span = maxVal - minVal || 10;
    const yMin = Math.max(0, minVal - span * 0.05);
    const yMax = maxVal + span * 0.05;

    // Distribute vertical columns
    const numCols = rawSegments.filter(s => s.type === 'vertical').length || 1;
    const colStep = w / numCols;

    let colIdx = 0;
    const segments: KagiSegment[] = [];

    rawSegments.forEach((rs) => {
      const y1 = scale(rs.start, yMin, yMax, h, 0);
      const y2 = scale(rs.end, yMin, yMax, h, 0);
      const x = colIdx * colStep + colStep / 2;

      if (rs.type === 'vertical') {
        segments.push({
          x,
          y1,
          y2,
          val1: rs.start,
          val2: rs.end,
          type: 'vertical',
          trend: rs.trend,
          color: rs.trend === 'bullish' ? this.bullishColor() : this.bearishColor(),
          thickness: rs.trend === 'bullish' ? 3.5 : 1.2
        });
        colIdx++;
      } else {
        segments.push({
          x,
          y1: y1,
          y2: y1,
          val1: rs.start,
          val2: rs.start,
          type: 'horizontal',
          trend: rs.trend,
          color: rs.trend === 'bullish' ? this.bullishColor() : this.bearishColor(),
          thickness: rs.trend === 'bullish' ? 3.5 : 1.2
        });
      }
    });

    return segments;
  });

  yTicks = computed(() => {
    const prices = this.data();
    if (prices.length === 0) return [0, 50, 100];
    const minVal = Math.min(...prices);
    const maxVal = Math.max(...prices);
    const span = maxVal - minVal || 10;
    return niceTicks(Math.max(0, minVal - span * 0.05), maxVal + span * 0.05, 5);
  });

  yDomainMax = computed(() => {
    const ticks = this.yTicks();
    return ticks[ticks.length - 1] || 100;
  });

  yDomainMin = computed(() => {
    const ticks = this.yTicks();
    return ticks[0] || 0;
  });

  yPos(val: number): number {
    return scale(val, this.yDomainMin(), this.yDomainMax(), this.innerH(), 0);
  }

  onSegmentHover(idx: number, event: MouseEvent) {
    this.hoveredSegmentIndex.set(idx);
    const seg = this.computedSegments()[idx];
    if (seg) {
      this.tooltip.set(seg);
    }
  }

  onMouseMove(event: MouseEvent) {
    const el = event.currentTarget as SVGElement;
    const container = el.closest('.ngx-kagi-chart');
    if (container) {
      const rect = container.getBoundingClientRect();
      this.tooltipX.set(event.clientX - rect.left);
      this.tooltipY.set(event.clientY - rect.top);
    }
  }

  onMouseLeave() {
    this.hoveredSegmentIndex.set(null);
    this.tooltip.set(null);
  }

  toggleExportMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.exportMenuOpen.set(!this.exportMenuOpen());
  }

  @HostListener('document:click')
  closeExportMenu(): void {
    this.exportMenuOpen.set(false);
  }

  onExport(type: 'json' | 'csv' | 'svg'): void {
    this.exportMenuOpen.set(false);
    if (type === 'json') this.exportToJson();
    else if (type === 'csv') this.exportToCsv();
    else if (type === 'svg') this.exportToSvg();
  }

  exportToCsv(): void {
    const segments = this.computedSegments();
    if (!segments.length) return;

    let csv = 'Index,Type,FromValue,ToValue,Trend\n';
    segments.forEach((seg, idx) => {
      csv += `${idx},"${seg.type}",${seg.val1},${seg.val2},"${seg.trend}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'kagi-chart-data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToJson(): void {
    const segments = this.computedSegments();
    if (!segments.length) return;

    const data = segments.map((seg, idx) => ({
      index: idx,
      type: seg.type,
      from: seg.val1,
      to: seg.val2,
      trend: seg.trend
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'kagi-chart-data.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToSvg(): void {
    const svg = this.svgEl()?.nativeElement;
    if (!svg) return;
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svg);
    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!source.match(/^<svg[^>]+xmlns\:xlink="http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
      source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }
    source = '<?xml version="1.0" encoding="utf-8"?>\n' + source;
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'kagi-chart.svg');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  formatNumber(v: number): string {
    return fmtNum(v);
  }
}
