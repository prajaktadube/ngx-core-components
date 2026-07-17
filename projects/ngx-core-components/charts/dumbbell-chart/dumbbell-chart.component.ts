import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, HostListener, viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CHART_COLORS, fmtNum, niceTicks, scale } from '../shared/chart-utils';

export interface DumbbellItem {
  label: string;
  startValue: number;
  endValue: number;
  startColor?: string;
  endColor?: string;
}

@Component({
  selector: 'ngx-dumbbell-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-dumbbell-chart" (mouseleave)="onMouseLeave()">
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

      <!-- Legend -->
      @if (showLegend() && data().length > 0) {
        <div class="chart-legend" (mousemove)="$event.stopPropagation()" (mouseleave)="onMouseLeave()">
          <div class="legend-item">
            <span class="legend-dot" [style.background]="startColor()"></span>
            <span class="legend-label">{{ startLabel() }}</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot" [style.background]="endColor()"></span>
            <span class="legend-label">{{ endLabel() }}</span>
          </div>
        </div>
      }

      <svg
        #svgEl
        class="dumbbell-svg"
        [attr.width]="'100%'"
        [attr.height]="svgHeight()"
      >
        <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
          <!-- Grid Lines -->
          @if (showGrid()) {
            @for (tick of xTicks(); track tick) {
              <line
                [attr.x1]="xPos(tick)"
                [attr.x2]="xPos(tick)"
                [attr.y1]="0"
                [attr.y2]="innerH()"
                class="grid-line"
              />
            }
          }

          <!-- Dumbbells -->
          @for (item of computedItems(); track item.label; let i = $index) {
            <g
              class="dumbbell-row"
              [class.dimmed]="hoveredIndex() !== null && hoveredIndex() !== i"
              [class.highlighted]="hoveredIndex() === i"
              (mouseenter)="onRowHover(i, $event)"
              (mousemove)="onRowMouseMove($event)"
            >
              <!-- Row background trigger -->
              <rect
                [attr.x]="-margin().left"
                [attr.y]="item.y - rowHeight() / 2"
                [attr.width]="containerWidth()"
                [attr.height]="rowHeight()"
                fill="transparent"
                style="cursor: pointer;"
              />

              <!-- Label -->
              @if (showLabels()) {
                <text
                  [attr.x]="-10"
                  [attr.y]="item.y"
                  text-anchor="end"
                  dominant-baseline="middle"
                  class="y-axis-label"
                >
                  {{ item.label }}
                </text>
              }

              <!-- Connecting Bar -->
              <line
                [attr.x1]="xPos(item.startValue)"
                [attr.x2]="xPos(item.endValue)"
                [attr.y1]="item.y"
                [attr.y2]="item.y"
                [attr.stroke]="item.barColor"
                stroke-width="4"
                stroke-linecap="round"
                class="connecting-bar"
              />

              <!-- Start Dot -->
              <circle
                [attr.cx]="xPos(item.startValue)"
                [attr.cy]="item.y"
                [attr.r]="hoveredIndex() === i ? 8 : 6"
                [attr.fill]="item.sColor"
                class="endpoint-dot start-dot"
              />

              <!-- End Dot -->
              <circle
                [attr.cx]="xPos(item.endValue)"
                [attr.cy]="item.y"
                [attr.r]="hoveredIndex() === i ? 8 : 6"
                [attr.fill]="item.eColor"
                class="endpoint-dot end-dot"
              />
            </g>
          }

          <!-- X Axis (Bottom) -->
          <g [attr.transform]="'translate(0,' + innerH() + ')'" class="x-axis">
            <line [attr.x1]="0" [attr.x2]="innerW()" [attr.y1]="0" [attr.y2]="0" class="axis-line" />
            @for (tick of xTicks(); track tick) {
              <g [attr.transform]="'translate(' + xPos(tick) + ',0)'">
                <line [attr.x1]="0" [attr.x2]="0" [attr.y1]="0" [attr.y2]="4" class="tick-line" />
                <text
                  [attr.y]="16"
                  text-anchor="middle"
                  class="tick-label"
                >
                  {{ formatNumber(tick) }}
                </text>
              </g>
            }
          </g>
        </g>
      </svg>

      <!-- Glassmorphic Tooltip -->
      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="tooltipX()" [style.top.px]="tooltipY()">
          <div class="tt-cat">{{ t.label }}</div>
          <div class="tt-row">
            <span class="tt-dot" [style.background]="startColor()"></span>
            <span class="tt-name">{{ startLabel() }}</span>
            <span class="tt-val">{{ formatNumber(t.startValue) }}</span>
          </div>
          <div class="tt-row">
            <span class="tt-dot" [style.background]="endColor()"></span>
            <span class="tt-name">{{ endLabel() }}</span>
            <span class="tt-val">{{ formatNumber(t.endValue) }}</span>
          </div>
          <div class="tt-row delta-row">
            <span class="tt-dot" style="background: transparent;"></span>
            <span class="tt-name">Difference</span>
            <span class="tt-val" [style.color]="t.delta >= 0 ? '#10b981' : '#ef4444'">
              {{ t.delta >= 0 ? '+' : '' }}{{ formatNumber(t.delta) }}
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
    .ngx-dumbbell-chart {
      background: var(--ngx-chart-bg, #ffffff);
      border-radius: 16px;
      padding: 16px;
      box-sizing: border-box;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
      position: relative;
      width: 100%;
    }
    .dumbbell-svg {
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
      font-weight: 500;
      user-select: none;
    }
    .y-axis-label {
      font-size: 12px;
      fill: var(--ngx-chart-axis-text, #334155);
      font-weight: 600;
      user-select: none;
    }
    .connecting-bar {
      transition: stroke-width 0.2s ease, opacity 0.2s ease;
      opacity: 0.85;
    }
    .endpoint-dot {
      transition: r 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.2s ease;
      stroke: var(--ngx-chart-bg, #ffffff);
      stroke-width: 1.5;
    }
    .dumbbell-row {
      transition: opacity 0.2s ease;
    }
    .dumbbell-row.dimmed {
      opacity: 0.3;
    }
    .dumbbell-row.highlighted .connecting-bar {
      stroke-width: 6;
      opacity: 1;
    }
    
    /* Legend */
    .chart-legend {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
      justify-content: flex-end;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .legend-label {
      font-size: 12px;
      color: #475569;
      font-weight: 600;
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
export class DumbbellChartComponent {
  data = input<DumbbellItem[]>([]);
  height = input<number>(350);
  showGrid = input<boolean>(true);
  showLabels = input<boolean>(true);
  startColor = input<string>('#ef4444');
  endColor = input<string>('#10b981');
  startLabel = input<string>('Start');
  endLabel = input<string>('End');
  colors = input<string[]>(CHART_COLORS);
  showLegend = input<boolean>(true);
  showExport = input<boolean>(false);

  containerWidth = signal<number>(500);
  hoveredIndex = signal<number | null>(null);
  tooltip = signal<any | null>(null);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);
  exportMenuOpen = signal(false);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  margin = computed(() => ({
    top: 20,
    right: 30,
    bottom: 30,
    left: this.showLabels() ? 100 : 20
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

  // Min and Max values of the entire dataset
  minVal = computed(() => {
    const raw = this.data();
    if (raw.length === 0) return 0;
    const values = raw.flatMap(d => [d.startValue, d.endValue]);
    return Math.min(...values);
  });

  maxVal = computed(() => {
    const raw = this.data();
    if (raw.length === 0) return 100;
    const values = raw.flatMap(d => [d.startValue, d.endValue]);
    return Math.max(...values);
  });

  xTicks = computed(() => {
    const min = this.minVal();
    const max = this.maxVal();
    // Add buffer padding to the domain
    const span = max - min || 1;
    const paddedMin = Math.max(0, min - span * 0.1);
    const paddedMax = max + span * 0.1;
    return niceTicks(paddedMin, paddedMax, 5);
  });

  xDomain = computed(() => {
    const ticks = this.xTicks();
    return {
      min: ticks[0],
      max: ticks[ticks.length - 1]
    };
  });

  xPos(val: number): number {
    const domain = this.xDomain();
    return scale(val, domain.min, domain.max, 0, this.innerW());
  }

  rowHeight = computed(() => {
    const count = this.data().length || 1;
    return this.innerH() / count;
  });

  computedItems = computed(() => {
    const raw = this.data();
    const rowH = this.rowHeight();
    const defaultStartColor = this.startColor();
    const defaultEndColor = this.endColor();

    return raw.map((item, idx) => {
      const y = rowH * idx + rowH / 2;
      const sColor = item.startColor || defaultStartColor;
      const eColor = item.endColor || defaultEndColor;
      // Connect bar color (neutral gray/slate)
      const barColor = 'var(--ngx-chart-axis, #cbd5e1)';

      return {
        ...item,
        y,
        sColor,
        eColor,
        barColor
      };
    });
  });

  onRowHover(idx: number, event: MouseEvent) {
    this.hoveredIndex.set(idx);
    const item = this.data()[idx];
    if (item) {
      this.tooltip.set({
        ...item,
        delta: item.endValue - item.startValue
      });
    }
  }

  onRowMouseMove(event: MouseEvent) {
    const el = event.currentTarget as SVGElement;
    const container = el.closest('.ngx-dumbbell-chart');
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
    link.setAttribute('download', 'dumbbell-chart-data.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToCsv(): void {
    const data = this.data();
    if (!data.length) return;
    let csv = 'Label,StartValue,EndValue,StartColor,EndColor\\n';
    data.forEach(d => {
      csv += `"${d.label || ''}",${d.startValue},${d.endValue},"${d.startColor || ''}","${d.endColor || ''}"\\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'dumbbell-chart-data.csv');
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
    source = '<?xml version="1.0" encoding="utf-8"?>\\n' + source;
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'dumbbell-chart.svg');
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
