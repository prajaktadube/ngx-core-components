import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, TemplateRef, viewChild, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CHART_COLORS, fmtNum, niceTicks, scale } from '../shared/chart-utils';

export interface RenkoBrick {
  index: number;
  open: number;
  close: number;
  type: 'bullish' | 'bearish';
  color: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

@Component({
  selector: 'ngx-renko-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-renko-chart" (mouseleave)="onMouseLeave()">
      <div class="chart-header" (mousemove)="$event.stopPropagation()" (mouseleave)="onMouseLeave()">
        <div class="header-info">
          <span class="header-title">Renko Chart</span>
          <span class="header-boxsize">Box Size: {{ boxSize() }}</span>
        </div>
        
        <!-- Export menu trigger -->
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
        class="renko-svg"
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

          <!-- Bricks -->
          @for (brick of computedBricks(); track brick.index; let i = $index) {
            <rect
              [attr.x]="brick.x"
              [attr.y]="brick.y"
              [attr.width]="brick.w"
              [attr.height]="brick.h"
              [attr.fill]="brick.color"
              class="renko-brick"
              [class.dimmed]="hoveredIndex() !== null && hoveredIndex() !== i"
              [class.highlighted]="hoveredIndex() === i"
              (mouseenter)="onBrickHover(i, $event)"
              (mousemove)="onMouseMove($event)"
              stroke="#ffffff"
              stroke-width="0.5"
              [style.animation-delay]="(i * 0.03) + 's'"
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
              {{ t.type === 'bullish' ? 'Yang (Bullish)' : 'Yin (Bearish)' }}
            </div>
            <div class="tt-row">
              <span class="tt-name">Open</span>
              <span class="tt-val">{{ labelFormatter() ? labelFormatter()!(t.open) : formatNumber(t.open) }}</span>
            </div>
            <div class="tt-row">
              <span class="tt-name">Close</span>
              <span class="tt-val">{{ labelFormatter() ? labelFormatter()!(t.close) : formatNumber(t.close) }}</span>
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
    .ngx-renko-chart {
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
    .header-boxsize {
      font-size: 11px;
      font-weight: 600;
      color: var(--ngx-chart-axis-text, #64748b);
      background: var(--ngx-chart-grid, #f1f5f9);
      padding: 2px 8px;
      border-radius: 6px;
    }
    .renko-svg {
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
    .renko-brick {
      cursor: pointer;
      animation: brickFadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      opacity: 0;
      transform-origin: bottom;
    }
    @keyframes brickFadeUp {
      from { transform: scale(0.6); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .renko-brick.dimmed {
      opacity: 0.25 !important;
    }
    .renko-brick.highlighted {
      stroke: var(--ngx-chart-axis-strong, #64748b) !important;
      stroke-width: 1.5px !important;
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
      min-width: 130px;
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
export class RenkoChartComponent {
  data = input<number[]>([]);
  boxSize = input<number>(5);
  height = input<number>(350);
  showGrid = input<boolean>(true);
  bullishColor = input<string>('#10b981');
  bearishColor = input<string>('#ef4444');
  showExport = input<boolean>(false);
  labelFormatter = input<((v: number) => string) | undefined>(undefined);
  tooltipTemplate = input<TemplateRef<any> | null>(null);

  containerWidth = signal<number>(500);
  hoveredIndex = signal<number | null>(null);
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

  // Calculate Renko Bricks based on boxSize requirement
  computedBricks = computed<RenkoBrick[]>(() => {
    const prices = this.data();
    const size = this.boxSize() || 5;
    if (prices.length === 0) return [];

    const bricks: Omit<RenkoBrick, 'x' | 'y' | 'w' | 'h'>[] = [];
    let currentPrice = prices[0];
    let brickIndex = 0;

    for (let i = 1; i < prices.length; i++) {
      const price = prices[i];
      const diff = price - currentPrice;

      if (Math.abs(diff) >= size) {
        const numBricks = Math.floor(Math.abs(diff) / size);
        const direction = diff > 0 ? 1 : -1;

        for (let b = 0; b < numBricks; b++) {
          const nextPrice = currentPrice + direction * size;
          bricks.push({
            index: brickIndex++,
            open: currentPrice,
            close: nextPrice,
            type: direction > 0 ? 'bullish' : 'bearish',
            color: direction > 0 ? this.bullishColor() : this.bearishColor()
          });
          currentPrice = nextPrice;
        }
      }
    }

    // Now layout coordinates
    const count = bricks.length;
    if (count === 0) return [];

    const w = this.innerW();
    const h = this.innerH();

    // Find min and max close levels to scale Y Axis
    const allPrices = bricks.flatMap(b => [b.open, b.close]);
    const minVal = Math.min(...allPrices);
    const maxVal = Math.max(...allPrices);
    const span = maxVal - minVal || 10;
    const yMin = Math.max(0, minVal - span * 0.05);
    const yMax = maxVal + span * 0.05;

    // Distribute X columns horizontally
    const brickW = w / count;

    return bricks.map((b, idx) => {
      // Scale coordinates
      const yOpen = scale(b.open, yMin, yMax, h, 0);
      const yClose = scale(b.close, yMin, yMax, h, 0);

      const brickH = Math.abs(yClose - yOpen);
      const brickY = Math.min(yOpen, yClose);
      const brickX = idx * brickW;

      return {
        ...b,
        x: brickX,
        y: brickY,
        w: brickW * 0.9, // 10% gap spacing
        h: Math.max(2, brickH)
      } as RenkoBrick;
    });
  });

  yTicks = computed(() => {
    const bricks = this.computedBricks();
    if (bricks.length === 0) return [0, 50, 100];
    const allPrices = bricks.flatMap(b => [b.open, b.close]);
    const minVal = Math.min(...allPrices);
    const maxVal = Math.max(...allPrices);
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

  onBrickHover(idx: number, event: MouseEvent) {
    this.hoveredIndex.set(idx);
    const brick = this.computedBricks()[idx];
    if (brick) {
      this.tooltip.set(brick);
    }
  }

  onMouseMove(event: MouseEvent) {
    const el = event.currentTarget as SVGElement;
    const container = el.closest('.ngx-renko-chart');
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
    const bricks = this.computedBricks();
    if (!bricks.length) return;

    let csv = 'Index,Type,Open,Close\n';
    bricks.forEach(b => {
      csv += `${b.index},"${b.type}",${b.open},${b.close}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'renko-chart-data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToJson(): void {
    const bricks = this.computedBricks();
    if (!bricks.length) return;

    const data = bricks.map(b => ({
      index: b.index,
      type: b.type,
      open: b.open,
      close: b.close
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'renko-chart-data.json');
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
    link.setAttribute('download', 'renko-chart.svg');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  formatNumber(v: number): string {
    return fmtNum(v);
  }
}
