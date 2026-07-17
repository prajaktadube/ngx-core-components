import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, viewChild, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CHART_COLORS, niceTicks, scale, fmtNum } from '../shared/chart-utils';

export interface ScatterPoint {
  x: number;
  y: number;
  label?: string;
  group?: string;
  size?: number; // Bubble sizing support
}

@Component({
  selector: 'ngx-scatter-plot',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-scatter-plot" [class.dark]="theme() === 'dark'" (mouseleave)="onMouseLeave()">
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
      @if (showLegend() && uniqueGroups().length > 0) {
        <div class="chart-legend" (mousemove)="$event.stopPropagation()">
          @for (group of uniqueGroups(); track group; let i = $index) {
            <span class="legend-item">
              <span class="legend-dot" [style.background]="groupColor(group)"></span>
              {{ group }}
            </span>
          }
        </div>
      }

      <div class="chart-svg-container" #container>
        <svg
          #svgEl
          [attr.width]="'100%'"
          [attr.height]="height()"
          class="chart-svg"
          (mouseleave)="onMouseLeave()"
        >
          <g [attr.transform]="'translate(' + PAD_LEFT + ',' + PAD_TOP + ')'">
            <!-- Grid Lines (Horizontal and Vertical) -->
            @if (showGrid()) {
              <!-- Horizontal Grid Lines -->
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
              <!-- Vertical Grid Lines -->
              @for (tick of xTicks(); track tick) {
                <line
                  [attr.x1]="xPos(tick)"
                  [attr.x2]="xPos(tick)"
                  [attr.y1]="0"
                  [attr.y2]="innerH()"
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
            <text
              [attr.transform]="'rotate(-90) translate(' + (-innerH()/2) + ', -36)'"
              class="axis-title y"
              text-anchor="middle"
            >{{ yTitle() }}</text>

            <!-- X-Axis Labels -->
            @for (tick of xTicks(); track tick) {
              <text
                [attr.x]="xPos(tick)"
                [attr.y]="innerH() + 20"
                class="axis-label x"
                text-anchor="middle"
              >{{ fmtNum(tick) }}</text>
            }
            <text
              [attr.x]="innerW() / 2"
              [attr.y]="innerH() + 38"
              class="axis-title x"
              text-anchor="middle"
            >{{ xTitle() }}</text>

            <!-- Active Crosshair -->
            @if (hoveredPointIndex() !== null) {
              @if (scaledPoints()[hoveredPointIndex()!]; as pt) {
                <line
                  [attr.x1]="0"
                  [attr.x2]="innerW()"
                  [attr.y1]="pt.cy"
                  [attr.y2]="pt.cy"
                  stroke="rgba(79, 70, 229, 0.35)"
                  stroke-width="1.2"
                  stroke-dasharray="3,3"
                  class="crosshair-line"
                />
                <line
                  [attr.x1]="pt.cx"
                  [attr.x2]="pt.cx"
                  [attr.y1]="0"
                  [attr.y2]="innerH()"
                  stroke="rgba(79, 70, 229, 0.35)"
                  stroke-width="1.2"
                  stroke-dasharray="3,3"
                  class="crosshair-line"
                />
              }
            }

            <!-- Render Data Points -->
            @for (pt of scaledPoints(); track $index; let i = $index) {
              <circle
                [attr.cx]="pt.cx"
                [attr.cy]="pt.cy"
                [attr.r]="hoveredPointIndex() === i ? pt.r + 3.5 : pt.r"
                [attr.fill]="pt.color"
                [attr.stroke]="'#ffffff'"
                stroke-width="1.5"
                class="scatter-point"
                [class.hovered]="hoveredPointIndex() === i"
                [style.transform-origin]="pt.cx + 'px ' + pt.cy + 'px'"
                [style.animation-delay]="(i * 0.015) + 's'"
                (mouseenter)="onPointHover($event, pt.raw, i)"
                (mousemove)="onPointHover($event, pt.raw, i)"
              />
            }

            <!-- Base axes borders -->
            <line x1="0" [attr.x2]="innerW()" [attr.y1]="innerH()" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #ced4da)"/>
            <line x1="0" x2="0" y1="0" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #ced4da)"/>
          </g>
        </svg>

        <!-- Tooltip -->
        @if (tooltip(); as t) {
          <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
            @if (t.label) {
              <div class="tt-cat">{{ t.label }}</div>
            } @else {
              <div class="tt-cat">Point Data</div>
            }
            <div class="tt-row">
              <span class="tt-dot" [style.background]="t.color"></span>
              <span class="tt-name">Group</span>
              <span class="tt-val">{{ t.group || 'Default' }}</span>
            </div>
            <div class="tt-row">
              <span class="tt-dot" style="background: transparent;"></span>
              <span class="tt-name">{{ xTitle() }}</span>
              <span class="tt-val">{{ fmtNum(ptX(t)) }}</span>
            </div>
            <div class="tt-row">
              <span class="tt-dot" style="background: transparent;"></span>
              <span class="tt-name">{{ yTitle() }}</span>
              <span class="tt-val">{{ fmtNum(ptY(t)) }}</span>
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
    .ngx-scatter-plot {
      position: relative;
      background: var(--ngx-chart-bg, #ffffff);
      border-radius: 16px;
      padding: 16px;
      box-sizing: border-box;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
      transition: background-color 0.3s;
    }
    .ngx-scatter-plot.dark {
      background: rgba(30, 32, 48, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.05);
      --ngx-chart-bg: transparent;
      --ngx-chart-grid: rgba(255, 255, 255, 0.06);
      --ngx-chart-axis: rgba(255, 255, 255, 0.12);
    }
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      min-height: 24px;
      position: relative;
      margin-bottom: 12px;
    }
    .chart-legend {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 500;
      color: #64748b;
    }
    .dark .legend-item {
      color: #94a3b8;
    }
    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      display: inline-block;
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
    .dark .axis-label {
      fill: #94a3b8;
    }
    .axis-title {
      font-size: 11px;
      font-weight: 600;
      fill: #475569;
      letter-spacing: 0.5px;
    }
    .dark .axis-title {
      fill: #cbd5e1;
    }

    @keyframes scatterPointPop {
      from { transform: scale(0); opacity: 0; }
      to { transform: scale(1); opacity: 0.85; }
    }

    .scatter-point {
      cursor: pointer;
      transition: r 0.25s cubic-bezier(0.16, 1, 0.3, 1),
                  opacity 0.25s,
                  filter 0.25s,
                  stroke-width 0.2s;
      animation: scatterPointPop 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    .scatter-point.hovered {
      opacity: 0.95;
      filter: drop-shadow(0 0 6px var(--ngx-chart-hover-stroke, #4f46e5));
      stroke: #ffffff;
      stroke-width: 2px;
    }

    .crosshair-line {
      pointer-events: none;
      animation: fadeIn 0.15s ease-out forwards;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    /* Glassmorphic Tooltip styling */
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
      font-size: 11px;
      z-index: 100;
      min-width: 150px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
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
export class ScatterPlotComponent {
  PAD_LEFT = 52;
  PAD_TOP = 16;
  PAD_RIGHT = 24;
  PAD_BOTTOM = 48;

  data = input<ScatterPoint[]>([]);
  xTitle = input<string>('X Axis');
  yTitle = input<string>('Y Axis');
  height = input<number>(300);
  showGrid = input<boolean>(true);
  showLegend = input<boolean>(true);
  theme = input<'light' | 'dark'>('light');
  colors = input<string[]>(CHART_COLORS);
  showExport = input<boolean>(false);

  hoveredPointIndex = signal<number | null>(null);
  exportMenuOpen = signal(false);
  tooltip = signal<{
    x: number;
    y: number;
    label?: string;
    group?: string;
    xVal: number;
    yVal: number;
    color: string;
  } | null>(null);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');
  private container = viewChild<ElementRef>('container');

  // Dynamic dimension scales
  innerW = computed(() => {
    const el = this.container()?.nativeElement;
    const totalW = el ? el.getBoundingClientRect().width : 600;
    return Math.max(200, totalW - this.PAD_LEFT - this.PAD_RIGHT);
  });

  innerH = computed(() => this.height() - this.PAD_TOP - this.PAD_BOTTOM);

  // Group mappings
  uniqueGroups = computed(() => {
    const grps = new Set<string>();
    this.data().forEach(p => {
      if (p.group) grps.add(p.group);
    });
    return Array.from(grps);
  });

  groupColor(groupName?: string): string {
    if (!groupName) return this.colors()[0];
    const idx = this.uniqueGroups().indexOf(groupName);
    return this.colors()[idx % this.colors().length];
  }

  // Bounds Calculations
  private xValues = computed(() => this.data().map(pt => pt.x));
  private xMin = computed(() => this.xValues().length > 0 ? Math.min(...this.xValues()) * 0.9 : 0);
  private xMax = computed(() => this.xValues().length > 0 ? Math.max(...this.xValues()) * 1.1 : 100);
  xTicks = computed(() => niceTicks(this.xMin(), this.xMax(), 5));

  private yValues = computed(() => this.data().map(pt => pt.y));
  private yMin = computed(() => this.yValues().length > 0 ? Math.min(...this.yValues()) * 0.9 : 0);
  private yMax = computed(() => this.yValues().length > 0 ? Math.max(...this.yValues()) * 1.1 : 100);
  yTicks = computed(() => niceTicks(this.yMin(), this.yMax(), 5));

  // Map absolute coordinate points to SVG canvas
  xPos(x: number): number {
    return scale(x, this.xMin(), this.xMax(), 0, this.innerW());
  }

  yPos(y: number): number {
    return scale(y, this.yMin(), this.yMax(), this.innerH(), 0);
  }

  scaledPoints = computed(() => {
    return this.data().map((pt, i) => {
      const cx = this.xPos(pt.x);
      const cy = this.yPos(pt.y);
      const r = pt.size ? Math.max(3, Math.min(20, pt.size)) : 6;
      return {
        cx,
        cy,
        r,
        color: this.groupColor(pt.group),
        raw: pt
      };
    });
  });

  onPointHover(event: MouseEvent, pt: ScatterPoint, index: number) {
    this.hoveredPointIndex.set(index);
    const containerEl = this.container()?.nativeElement;
    if (!containerEl) return;
    const rect = containerEl.getBoundingClientRect();
    const tooltipX = event.clientX - rect.left;
    const tooltipY = event.clientY - rect.top;

    this.tooltip.set({
      x: tooltipX,
      y: tooltipY,
      label: pt.label,
      group: pt.group,
      xVal: pt.x,
      yVal: pt.y,
      color: this.groupColor(pt.group)
    });
  }

  onMouseLeave() {
    this.hoveredPointIndex.set(null);
    this.tooltip.set(null);
  }

  ptX(t: { xVal: number }): number { return t.xVal; }
  ptY(t: { yVal: number }): number { return t.yVal; }

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
    link.setAttribute('download', 'scatter-plot.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToCsv(): void {
    const data = this.data();
    if (!data.length) return;
    let csv = 'Label,Group,X,Y,Size\n';
    data.forEach(d => {
      csv += `"${d.label || ''}","${d.group || ''}",${d.x},${d.y},${d.size !== undefined ? d.size : ''}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'scatter-plot.csv');
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
    link.setAttribute('download', 'scatter-plot.svg');
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

  readonly fmtNum = fmtNum;
}
