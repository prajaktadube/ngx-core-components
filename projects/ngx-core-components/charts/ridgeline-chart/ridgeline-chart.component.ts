import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, viewChild, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CHART_COLORS, fmtNum, niceTicks, scale } from '../shared/chart-utils';

export interface RidgelineItem {
  label: string;
  values: number[];
  color?: string;
}

@Component({
  selector: 'ngx-ridgeline-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-ridgeline-chart" (mouseleave)="onMouseLeave()">
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
        class="ridgeline-svg"
        [attr.width]="'100%'"
        [attr.height]="svgHeight()"
      >
        <defs>
          @if (useGradient()) {
            @for (item of computedItems(); track item.label; let i = $index) {
              <linearGradient [attr.id]="'ridgeline-grad-' + i" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.5" />
                <stop offset="50%" [attr.stop-color]="item.color" stop-opacity="0.5" />
                <stop offset="100%" stop-color="#ef4444" stop-opacity="0.5" />
              </linearGradient>
            }
          }
        </defs>

        <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
          
          <!-- X Grid Lines (Vertical reference grid) -->
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

          <!-- Ridgeline stack (Rendered in reverse order so bottom rows overlap correctly on top of top rows) -->
          @for (item of computedItems(); track item.label; let i = $index) {
            <g
              class="ridgeline-row"
              [class.dimmed]="hoveredIndex() !== null && hoveredIndex() !== i"
              [class.highlighted]="hoveredIndex() === i"
              (mouseenter)="onRowHover(i, $event)"
              (mousemove)="onRowMouseMove($event)"
            >
              <!-- Baseline for each row -->
              <line
                [attr.x1]="0"
                [attr.x2]="innerW()"
                [attr.y1]="item.baselineY"
                [attr.y2]="item.baselineY"
                class="row-baseline"
              />

              <!-- Shaded density area under the curve -->
              <path
                [attr.d]="item.areaPath"
                [attr.fill]="useGradient() ? 'url(#ridgeline-grad-' + i + ')' : item.color"
                [attr.fill-opacity]="useGradient() ? 1.0 : 0.4"
                class="density-area"
              />

              <!-- Top stroke line outlining the curve -->
              <path
                [attr.d]="item.linePath"
                [attr.stroke]="item.color"
                stroke-width="2"
                fill="none"
                class="density-line"
              />

              <!-- Row label on Y Axis (Left side) -->
              @if (showLabels()) {
                <text
                  [attr.x]="-12"
                  [attr.y]="item.baselineY - 4"
                  text-anchor="end"
                  class="y-axis-label"
                >
                  {{ item.label }}
                </text>
              }
            </g>
          }

          <!-- Bottom X Axis (Ticks and grid labels at bottom) -->
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
            <span class="tt-name">Samples</span>
            <span class="tt-val">{{ t.count }}</span>
          </div>
          <div class="tt-row">
            <span class="tt-dot" style="background: var(--ngx-chart-axis, #94a3b8);"></span>
            <span class="tt-name">Median Value</span>
            <span class="tt-val">{{ formatNumber(t.median) }}</span>
          </div>
          <div class="tt-row">
            <span class="tt-dot" style="background: var(--ngx-chart-axis, #94a3b8);"></span>
            <span class="tt-name">Min / Max</span>
            <span class="tt-val">{{ formatNumber(t.min) }} - {{ formatNumber(t.max) }}</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .ngx-ridgeline-chart {
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
      min-height: 24px;
      position: relative;
      margin-bottom: 12px;
    }
    .ridgeline-svg {
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
    .y-axis-label {
      font-size: 12px;
      fill: var(--ngx-chart-axis-text, #334155);
      font-weight: 600;
      user-select: none;
    }
    .row-baseline {
      stroke: var(--ngx-chart-grid, #e2e8f0);
      stroke-width: 1;
      stroke-dasharray: 2,2;
    }
    .density-area, .density-line {
      animation: ridgelineWipeIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      clip-path: inset(0 100% 0 0);
    }
    @keyframes ridgelineWipeIn {
      to { clip-path: inset(0 0 0 0); }
    }
    .density-area {
      transition: fill-opacity 0.2s ease;
      cursor: pointer;
    }
    .density-line {
      transition: stroke-width 0.2s ease;
      cursor: pointer;
    }
    .ridgeline-row {
      transition: opacity 0.2s ease;
    }
    .ridgeline-row.dimmed {
      opacity: 0.2;
    }
    .ridgeline-row.highlighted .density-area {
      fill-opacity: 0.65;
    }
    .ridgeline-row.highlighted .density-line {
      stroke-width: 3.5;
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

    /* Export Trigger & Dropdown */
    .chart-export-menu {
      position: absolute;
      top: 0;
      right: 0;
      z-index: 50;
    }
    .export-trigger {
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 600;
      color: var(--ngx-chart-axis-text, #6c757d);
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(8px);
      border: 1px solid var(--ngx-chart-grid, #ebedf0);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .export-trigger:hover {
      background: #fff;
      color: #4f46e5;
      border-color: #4f46e5;
    }
    .export-dropdown {
      position: absolute;
      right: 0;
      top: calc(100% + 4px);
      background: #fff;
      border: 1px solid var(--ngx-chart-grid, #ebedf0);
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.08);
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
      color: #343a40;
      border-radius: 4px;
      font-family: inherit;
      width: 100%;
      transition: all 0.12s;
    }
    .export-dropdown button:hover {
      background: rgba(79, 70, 229, 0.06);
      color: #4f46e5;
    }
  `]
})
export class RidgelineChartComponent {
  data = input<RidgelineItem[]>([]);
  height = input<number>(400);
  showGrid = input<boolean>(true);
  showLabels = input<boolean>(true);
  useGradient = input<boolean>(false);
  colors = input<string[]>(CHART_COLORS);
  overlap = input<number>(1.6); // Stack overlap ratio multiplier
  showExport = input<boolean>(false);

  containerWidth = signal<number>(500);
  hoveredIndex = signal<number | null>(null);
  tooltip = signal<any | null>(null);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);
  exportMenuOpen = signal(false);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  margin = computed(() => ({
    top: 40,
    right: 20,
    bottom: 30,
    left: this.showLabels() ? 90 : 20
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
    const span = max - min || 10;
    return {
      min: Math.max(0, min - span * 0.05),
      max: max + span * 0.05
    };
  });

  xTicks = computed(() => {
    const b = this.bounds();
    return niceTicks(b.min, b.max, 5);
  });

  xDomain = computed(() => {
    const ticks = this.xTicks();
    return {
      min: ticks[0] ?? 0,
      max: ticks[ticks.length - 1] ?? 100
    };
  });

  xPos(val: number): number {
    const domain = this.xDomain();
    return scale(val, domain.min, domain.max, 0, this.innerW());
  }

  computedItems = computed(() => {
    const raw = this.data();
    const count = raw.length;
    if (count === 0) return [];

    const domain = this.xDomain();
    const baseH = this.innerH();
    const overlapFactor = this.overlap();
    const palette = this.colors();

    // Row separation height calculation
    const rowStep = baseH / (count + overlapFactor - 1);
    const maxKdeHeight = rowStep * overlapFactor;

    return raw.map((item, idx) => {
      const color = item.color || palette[idx % palette.length];
      
      // baselineY calculation: stack bottom-to-top
      const baselineY = baseH - idx * rowStep;

      // Basic stats calculation for tooltip details
      const sorted = [...item.values].sort((a, b) => a - b);
      const valCount = sorted.length;
      const min = valCount > 0 ? sorted[0] : 0;
      const max = valCount > 0 ? sorted[valCount - 1] : 0;
      const median = valCount > 0 ? sorted[Math.floor(valCount / 2)] : 0;

      // Bandwidth estimation using Silverman's rule of thumb
      const q1 = sorted[Math.floor(valCount * 0.25)] || 0;
      const q3 = sorted[Math.floor(valCount * 0.75)] || 0;
      const stdDev = this.getStdDev(item.values, median);
      const bandwidth = 0.9 * Math.min(stdDev, (q3 - q1) / 1.34) * Math.pow(valCount, -0.2) || 1.0;

      // Sample density along horizontal X scale
      const sampleCount = 50;
      const densityPoints: { xCoord: number; yOffset: number }[] = [];

      for (let s = 0; s <= sampleCount; s++) {
        const v = domain.min + (s / sampleCount) * (domain.max - domain.min);
        const xCoord = this.xPos(v);
        const density = this.kernelDensityEstimator(item.values, v, bandwidth);
        densityPoints.push({ xCoord, yOffset: density });
      }

      const maxDensity = Math.max(...densityPoints.map(p => p.yOffset)) || 1.0;

      // Build path points
      const points: string[] = [];
      densityPoints.forEach(p => {
        const heightOffset = (p.yOffset / maxDensity) * maxKdeHeight;
        const yCoord = baselineY - heightOffset;
        points.push(`${p.xCoord},${yCoord}`);
      });

      // areaPath starts at bottom-left corner, sweeps across curve, and closes at bottom-right
      const areaPath = `M 0,${baselineY} L ` + points.join(' L ') + ` L ${this.innerW()},${baselineY} Z`;
      const linePath = `M ` + points.join(' L ');

      return {
        label: item.label,
        count: valCount,
        min,
        max,
        median,
        color,
        baselineY,
        areaPath,
        linePath
      };
    });
  });

  private kernelDensityEstimator(samples: number[], x: number, bandwidth: number): number {
    const n = samples.length;
    if (n === 0) return 0;
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const u = (x - samples[i]) / bandwidth;
      const kernel = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * u * u);
      sum += kernel;
    }
    return sum / (n * bandwidth);
  }

  private getStdDev(values: number[], mean: number): number {
    const n = values.length;
    if (n <= 1) return 1.0;
    const sqDiffs = values.map(v => Math.pow(v - mean, 2));
    const sum = sqDiffs.reduce((acc, curr) => acc + curr, 0);
    return Math.sqrt(sum / (n - 1));
  }

  onRowHover(idx: number, event: MouseEvent) {
    this.hoveredIndex.set(idx);
    const item = this.computedItems()[idx];
    if (item) {
      this.tooltip.set(item);
    }
  }

  onRowMouseMove(event: MouseEvent) {
    const el = event.currentTarget as SVGElement;
    const container = el.closest('.ngx-ridgeline-chart');
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
    link.setAttribute('download', 'ridgeline-chart.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToCsv(): void {
    const data = this.data();
    if (!data.length) return;
    let csv = 'Label,Value\n';
    data.forEach(d => {
      (d.values || []).forEach(val => {
        csv += `"${d.label || ''}",${val}\n`;
      });
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'ridgeline-chart.csv');
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
    link.setAttribute('download', 'ridgeline-chart.svg');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToPdf(): void {
    const svg = this.svgEl()?.nativeElement;
    if (!svg) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svg);
    if (!svgString.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
      svgString = svgString.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Chart Export</title>
          <style>
            body {
              margin: 20px;
              font-family: system-ui, sans-serif;
              text-align: center;
            }
            .print-container {
              display: inline-block;
              margin: 0 auto;
            }
            svg {
              width: 100%;
              height: auto;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${svgString}
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 250);
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
