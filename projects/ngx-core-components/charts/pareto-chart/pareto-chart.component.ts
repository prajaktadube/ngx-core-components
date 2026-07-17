import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, HostListener, viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CHART_COLORS, fmtNum, niceTicks, scale } from '../shared/chart-utils';

export interface ParetoItem {
  label: string;
  value: number;
}

@Component({
  selector: 'ngx-pareto-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-pareto-chart" (mouseleave)="onMouseLeave()">
      <div class="chart-header" (mousemove)="$event.stopPropagation()" (mouseleave)="onMouseLeave()">
        <div class="chart-title-space"></div>
        @if (showExport()) {
          <div class="chart-export-menu">
            <button class="export-trigger" (click)="toggleExportMenu($event)" aria-label="Export Menu">📤 Export</button>
            @if (exportMenuOpen()) {
              <div class="export-dropdown">
                <button (click)="onExport('json')">📊 Export JSON</button>
                <button (click)="onExport('csv')">📄 Export CSV</button>
                <button (click)="onExport('svg')">🖼️ Export SVG</button>
                <button (click)="onExport('pdf')">📕 Export PDF</button>
              </div>
            }
          </div>
        }
      </div>

      <svg
        #svgEl
        class="pareto-svg"
        [attr.width]="'100%'"
        [attr.height]="svgHeight()"
      >
        <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
          
          <!-- Grid Lines (Horizontal reference grid scaled to left Y Axis) -->
          @if (showGrid()) {
            @for (tick of leftYTicks(); track tick) {
              <line
                [attr.x1]="0"
                [attr.x2]="innerW()"
                [attr.y1]="yLeftPos(tick)"
                [attr.y2]="yLeftPos(tick)"
                class="grid-line"
              />
            }
          }

          <!-- Bars (Raw Values) -->
          @for (item of computedItems(); track item.label; let i = $index) {
            <rect
              [attr.x]="item.barX"
              [attr.y]="yLeftPos(item.value)"
              [attr.width]="barWidth()"
              [attr.height]="Math.max(2, innerH() - yLeftPos(item.value))"
              [attr.fill]="barColor()"
              [class.dimmed]="hoveredIndex() !== null && hoveredIndex() !== i"
              (mouseenter)="onItemHover(i, $event)"
              (mousemove)="onItemMouseMove($event)"
              class="pareto-bar"
              rx="4"
            />
          }

          <!-- Cumulative Percentage Line -->
          @if (computedItems().length > 0) {
            <path
              [attr.d]="linePath()"
              [attr.stroke]="lineColor()"
              stroke-width="3"
              fill="none"
              stroke-linecap="round"
              class="pareto-line"
            />

            <!-- Line Node Circles -->
            @for (item of computedItems(); track item.label; let i = $index) {
              <circle
                [attr.cx]="item.centerX"
                [attr.cy]="yRightPos(item.cumPct)"
                [attr.r]="hoveredIndex() === i ? 6 : 4"
                [attr.fill]="lineColor()"
                [attr.stroke]="'#ffffff'"
                stroke-width="1.5"
                [class.dimmed]="hoveredIndex() !== null && hoveredIndex() !== i"
                (mouseenter)="onItemHover(i, $event)"
                (mousemove)="onItemMouseMove($event)"
                class="pareto-dot"
              />
              @if (showCumPercentLabels()) {
                <text
                  [attr.x]="item.centerX"
                  [attr.y]="yRightPos(item.cumPct) - 10"
                  text-anchor="middle"
                  class="cum-pct-label"
                  [attr.fill]="lineColor()"
                >
                  {{ item.cumPct.toFixed(0) }}%
                </text>
              }
            }
          }

          <!-- Y1 Axis (Left side - Raw Values) -->
          <g class="y-axis left-y-axis">
            <line [attr.x1]="0" [attr.x2]="0" [attr.y1]="0" [attr.y2]="innerH()" class="axis-line" />
            @for (tick of leftYTicks(); track tick) {
              <g [attr.transform]="'translate(0,' + yLeftPos(tick) + ')'">
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

          <!-- Y2 Axis (Right side - Cumulative Percentage) -->
          <g [attr.transform]="'translate(' + innerW() + ',0)'" class="y-axis right-y-axis">
            <line [attr.x1]="0" [attr.x2]="0" [attr.y1]="0" [attr.y2]="innerH()" class="axis-line" />
            @for (tick of rightYTicks; track tick) {
              <g [attr.transform]="'translate(0,' + yRightPos(tick) + ')'">
                <line [attr.x1]="0" [attr.x2]="4" [attr.y1]="0" [attr.y2]="0" class="tick-line" />
                <text
                  [attr.x]="8"
                  text-anchor="start"
                  dominant-baseline="middle"
                  class="tick-label"
                >
                  {{ tick }}%
                </text>
              </g>
            }
          </g>

          <!-- X Axis (Bottom labels) -->
          <g [attr.transform]="'translate(0,' + innerH() + ')'" class="x-axis">
            <line [attr.x1]="0" [attr.x2]="innerW()" [attr.y1]="0" [attr.y2]="0" class="axis-line" />
            @if (showLabels()) {
              @for (item of computedItems(); track item.label) {
                <text
                  [attr.x]="item.centerX"
                  [attr.y]="18"
                  text-anchor="middle"
                  class="x-axis-label"
                >
                  {{ item.label }}
                </text>
              }
            }
          </g>
        </g>
      </svg>

      <!-- Glassmorphic Tooltip -->
      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="tooltipX()" [style.top.px]="tooltipY()">
          <div class="tt-cat">{{ t.label }}</div>
          <div class="tt-row">
            <span class="tt-dot" [style.background]="barColor()"></span>
            <span class="tt-name">Value</span>
            <span class="tt-val">{{ formatNumber(t.value) }}</span>
          </div>
          <div class="tt-row">
            <span class="tt-dot" style="background: transparent;"></span>
            <span class="tt-name">Percent Contribution</span>
            <span class="tt-val">{{ t.pct.toFixed(1) }}%</span>
          </div>
          <div class="tt-row delta-row">
            <span class="tt-dot" [style.background]="lineColor()"></span>
            <span class="tt-name">Cumulative %</span>
            <span class="tt-val">{{ t.cumPct.toFixed(1) }}%</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .ngx-pareto-chart {
      background: var(--ngx-chart-bg, #ffffff);
      border-radius: 16px;
      padding: 16px;
      box-sizing: border-box;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
      position: relative;
      width: 100%;
    }
    .pareto-svg {
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
    .tick-label, .x-axis-label, .cum-pct-label {
      font-size: 11px;
      fill: var(--ngx-chart-axis-text, #64748b);
      font-weight: 550;
      user-select: none;
    }
    .cum-pct-label {
      font-size: 10px;
      font-weight: 600;
    }
    .pareto-bar {
      transition: fill-opacity 0.2s ease, opacity 0.2s ease;
      cursor: pointer;
      transform-origin: bottom;
      animation: paretoBarGrow 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes paretoBarGrow {
      from { transform: scaleY(0); }
      to { transform: scaleY(1); }
    }
    .pareto-bar.dimmed, .pareto-dot.dimmed {
      opacity: 0.3;
    }
    .pareto-bar:hover {
      fill-opacity: 0.85;
    }
    .pareto-line {
      stroke-dasharray: 1000;
      stroke-dashoffset: 1000;
      animation: drawLine 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      pointer-events: none;
    }
    .pareto-dot, .cum-pct-label {
      cursor: pointer;
      transition: r 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.2s ease;
      animation: fadeIn 0.4s ease-out 0.8s forwards;
      opacity: 0;
    }
    @keyframes fadeIn {
      to { opacity: 1; }
    }
    @keyframes drawLine {
      to {
        stroke-dashoffset: 0;
      }
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
      min-width: 180px;
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

    /* Header and Export dropdown styles */
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      min-height: 24px;
      position: relative;
    }
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
export class ParetoChartComponent {
  data = input<ParetoItem[]>([]);
  height = input<number>(350);
  showGrid = input<boolean>(true);
  showLabels = input<boolean>(true);
  showCumPercentLabels = input<boolean>(true);
  barColor = input<string>('#4a90d9');
  lineColor = input<string>('#ff6358');
  showExport = input<boolean>(false);

  containerWidth = signal<number>(500);
  hoveredIndex = signal<number | null>(null);
  tooltip = signal<any | null>(null);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);
  exportMenuOpen = signal(false);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  readonly Math = Math;

  margin = computed(() => ({
    top: 30,
    right: 50,
    bottom: this.showLabels() ? 30 : 10,
    left: 50
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

  // Sorted and processed items
  computedItems = computed(() => {
    const raw = this.data();
    if (raw.length === 0) return [];

    // Sort descending by value (Standard Pareto rule)
    const sorted = [...raw].sort((a, b) => b.value - a.value);
    const total = sorted.reduce((acc, curr) => acc + curr.value, 0) || 1;

    const count = sorted.length;
    const colW = this.innerW() / count;
    const bW = colW * 0.7;

    let runningSum = 0;

    return sorted.map((item, idx) => {
      runningSum += item.value;
      const pct = (item.value / total) * 100;
      const cumPct = (runningSum / total) * 100;

      const centerX = colW * idx + colW / 2;
      const barX = colW * idx + (colW - bW) / 2;

      return {
        ...item,
        pct,
        cumPct,
        centerX,
        barX
      };
    });
  });

  // Scales for left Y Axis (Values) and right Y Axis (Percentages: 0-100%)
  maxLeftVal = computed(() => {
    const items = this.computedItems();
    if (items.length === 0) return 100;
    return Math.max(...items.map(d => d.value), 0);
  });

  leftYTicks = computed(() => {
    const max = this.maxLeftVal();
    return niceTicks(0, max, 5);
  });

  leftYDomainMax = computed(() => {
    const ticks = this.leftYTicks();
    return ticks[ticks.length - 1] || 100;
  });

  rightYTicks = [0, 20, 40, 60, 80, 100];

  yLeftPos(val: number): number {
    return scale(val, 0, this.leftYDomainMax(), this.innerH(), 0);
  }

  yRightPos(val: number): number {
    return scale(val, 0, 100, this.innerH(), 0);
  }

  barWidth = computed(() => {
    const count = this.computedItems().length || 1;
    return (this.innerW() / count) * 0.7;
  });

  // Connecting cumulative percentage lines path generator
  linePath = computed(() => {
    const items = this.computedItems();
    if (items.length === 0) return '';
    
    return items.map((item, idx) => {
      const x = item.centerX;
      const y = this.yRightPos(item.cumPct);
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  });

  onItemHover(idx: number, event: MouseEvent) {
    this.hoveredIndex.set(idx);
    const item = this.computedItems()[idx];
    if (item) {
      this.tooltip.set(item);
    }
  }

  onItemMouseMove(event: MouseEvent) {
    const el = event.currentTarget as SVGElement;
    const container = el.closest('.ngx-pareto-chart');
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

  onExport(type: 'json' | 'csv' | 'svg' | 'pdf'): void {
    this.exportMenuOpen.set(false);
    if (type === 'json') this.exportToJson();
    else if (type === 'csv') this.exportToCsv();
    else if (type === 'svg') this.exportToSvg();
    else if (type === 'pdf') this.exportToPdf();
  }

  exportToJson(): void {
    const data = this.data();
    if (!data.length) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'pareto-chart-data.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToCsv(): void {
    const data = this.data();
    if (!data.length) return;
    let csv = 'Label,Value\n';
    data.forEach(d => {
      csv += `"${d.label || ''}",${d.value}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'pareto-chart-data.csv');
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
    link.setAttribute('download', 'pareto-chart.svg');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToPdf(): void {
    const svg = this.svgEl()?.nativeElement;
    if (!svg) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const svgClone = svg.cloneNode(true) as SVGElement;
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const svgString = new XMLSerializer().serializeToString(svgClone);
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Export PDF</title>
          <style>
            body {
              margin: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              background-color: #ffffff;
              font-family: system-ui, sans-serif;
            }
            .print-container {
              text-align: center;
              width: 100%;
              max-width: 800px;
              padding: 20px;
            }
            svg {
              width: 100%;
              height: auto;
              max-height: 90vh;
            }
            @media print {
              body {
                background: none;
              }
              .print-container {
                max-width: 100%;
                padding: 0;
              }
              svg {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${svgString}
          </div>
          <script>
            window.onload = () => {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  formatNumber(v: number): string {
    return fmtNum(v);
  }
}
