import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, HostListener, viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CHART_COLORS, ChartDataPoint, fmtNum, niceTicks, scale } from '../shared/chart-utils';

@Component({
  selector: 'ngx-lollipop-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-lollipop-chart" (mouseleave)="onMouseLeave()">
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
        class="lollipop-svg"
        [attr.width]="'100%'"
        [attr.height]="svgHeight()"
      >
        <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
          <!-- Grid Lines (Horizontal Orientation: vertical lines; Vertical Orientation: horizontal lines) -->
          @if (showGrid()) {
            @if (orientation() === 'horizontal') {
              @for (tick of xTicks(); track tick) {
                <line
                  [attr.x1]="xPos(tick)"
                  [attr.x2]="xPos(tick)"
                  [attr.y1]="0"
                  [attr.y2]="innerH()"
                  class="grid-line"
                />
              }
            } @else {
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
          }

          <!-- Lollipops -->
          @for (item of computedItems(); track item.label; let i = $index) {
            <g
              class="lollipop-row"
              [class.dimmed]="hoveredIndex() !== null && hoveredIndex() !== i"
              [class.highlighted]="hoveredIndex() === i"
              (mouseenter)="onItemHover(i, $event)"
              (mousemove)="onItemMouseMove($event)"
            >
              <!-- Row backdrop for easier hover -->
              @if (orientation() === 'horizontal') {
                <rect
                  [attr.x]="-margin().left"
                  [attr.y]="item.coord - itemSpacing() / 2"
                  [attr.width]="containerWidth()"
                  [attr.height]="itemSpacing()"
                  fill="transparent"
                  style="cursor: pointer;"
                />
              } @else {
                <rect
                  [attr.x]="item.coord - itemSpacing() / 2"
                  [attr.y]="-margin().top"
                  [attr.width]="itemSpacing()"
                  [attr.height]="svgHeight()"
                  fill="transparent"
                  style="cursor: pointer;"
                />
              }

              <!-- Stem Line -->
              @if (orientation() === 'horizontal') {
                <line
                  [attr.x1]="0"
                  [attr.x2]="xPos(item.value)"
                  [attr.y1]="item.coord"
                  [attr.y2]="item.coord"
                  [attr.stroke]="item.color"
                  stroke-width="2"
                  class="lollipop-stem"
                />
              } @else {
                <line
                  [attr.x1]="item.coord"
                  [attr.x2]="item.coord"
                  [attr.y1]="innerH()"
                  [attr.y2]="yPos(item.value)"
                  [attr.stroke]="item.color"
                  stroke-width="2"
                  class="lollipop-stem"
                />
              }

              <!-- Candy Dot -->
              @if (orientation() === 'horizontal') {
                <circle
                  [attr.cx]="xPos(item.value)"
                  [attr.cy]="item.coord"
                  [attr.r]="hoveredIndex() === i ? dotRadius() + 2 : dotRadius()"
                  [attr.fill]="item.color"
                  class="lollipop-candy"
                />
              } @else {
                <circle
                  [attr.cx]="item.coord"
                  [attr.cy]="yPos(item.value)"
                  [attr.r]="hoveredIndex() === i ? dotRadius() + 2 : dotRadius()"
                  [attr.fill]="item.color"
                  class="lollipop-candy"
                />
              }
            </g>
          }

          <!-- Y Axis (Left) / X Axis (Bottom) -->
          @if (orientation() === 'horizontal') {
            <!-- Left Y Axis for Horizontal -->
            <g class="y-axis">
              <line [attr.x1]="0" [attr.x2]="0" [attr.y1]="0" [attr.y2]="innerH()" class="axis-line" />
              @if (showLabels()) {
                @for (item of computedItems(); track item.label) {
                  <text
                    [attr.x]="-10"
                    [attr.y]="item.coord"
                    text-anchor="end"
                    dominant-baseline="middle"
                    class="axis-label"
                  >
                    {{ item.label }}
                  </text>
                }
              }
            </g>

            <!-- Bottom X Axis for Horizontal -->
            <g [attr.transform]="'translate(0,' + innerH() + ')'" class="x-axis">
              <line [attr.x1]="0" [attr.x2]="innerW()" [attr.y1]="0" [attr.y2]="0" class="axis-line" />
              @for (tick of xTicks(); track tick) {
                <g [attr.transform]="'translate(' + xPos(tick) + ',0)'">
                  <line [attr.x1]="0" [attr.x2]="0" [attr.y1]="0" [attr.y2]="4" class="tick-line" />
                  <text [attr.y]="16" text-anchor="middle" class="tick-label">
                    {{ formatNumber(tick) }}
                  </text>
                </g>
              }
            </g>
          } @else {
            <!-- Left Y Axis for Vertical -->
            <g class="y-axis">
              <line [attr.x1]="0" [attr.x2]="0" [attr.y1]="0" [attr.y2]="innerH()" class="axis-line" />
              @for (tick of yTicks(); track tick) {
                <g [attr.transform]="'translate(0,' + yPos(tick) + ')'">
                  <line [attr.x1]="-4" [attr.x2]="0" [attr.y1]="0" [attr.y2]="0" class="tick-line" />
                  <text [attr.x]="-8" text-anchor="end" dominant-baseline="middle" class="tick-label">
                    {{ formatNumber(tick) }}
                  </text>
                </g>
              }
            </g>

            <!-- Bottom X Axis for Vertical -->
            <g [attr.transform]="'translate(0,' + innerH() + ')'" class="x-axis">
              <line [attr.x1]="0" [attr.x2]="innerW()" [attr.y1]="0" [attr.y2]="0" class="axis-line" />
              @if (showLabels()) {
                @for (item of computedItems(); track item.label) {
                  <text
                    [attr.x]="item.coord"
                    [attr.y]="16"
                    text-anchor="middle"
                    class="axis-label"
                  >
                    {{ item.label }}
                  </text>
                }
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
            <span class="tt-dot" [style.background]="t.color"></span>
            <span class="tt-name">Value</span>
            <span class="tt-val">{{ formatNumber(t.value) }}</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .ngx-lollipop-chart {
      background: var(--ngx-chart-bg, #ffffff);
      border-radius: 16px;
      padding: 16px;
      box-sizing: border-box;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
      position: relative;
      width: 100%;
    }
    .lollipop-svg {
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
    .tick-label, .axis-label {
      font-size: 11px;
      fill: var(--ngx-chart-axis-text, #64748b);
      font-weight: 550;
      user-select: none;
    }
    .lollipop-stem {
      opacity: 0.75;
      transition: stroke-width 0.2s ease, opacity 0.2s ease;
    }
    .lollipop-candy {
      transition: r 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), filter 0.2s ease;
      stroke: var(--ngx-chart-bg, #ffffff);
      stroke-width: 1.5;
      cursor: pointer;
    }
    .lollipop-row {
      transition: opacity 0.2s ease;
    }
    .lollipop-row.dimmed {
      opacity: 0.3;
    }
    .lollipop-row.highlighted .lollipop-stem {
      stroke-width: 3.5;
      opacity: 1;
    }
    .lollipop-row.highlighted .lollipop-candy {
      filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.15));
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
export class LollipopChartComponent {
  data = input<ChartDataPoint[]>([]);
  height = input<number>(350);
  showGrid = input<boolean>(true);
  showLabels = input<boolean>(true);
  orientation = input<'horizontal' | 'vertical'>('horizontal');
  colors = input<string[]>(CHART_COLORS);
  dotRadius = input<number>(8);
  showExport = input<boolean>(false);

  containerWidth = signal<number>(500);
  hoveredIndex = signal<number | null>(null);
  tooltip = signal<any | null>(null);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);
  exportMenuOpen = signal(false);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  margin = computed(() => {
    const isHoriz = this.orientation() === 'horizontal';
    return {
      top: 20,
      right: 30,
      bottom: 40,
      left: this.showLabels() ? (isHoriz ? 80 : 40) : 20
    };
  });

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

  // Domain range calculations
  maxVal = computed(() => {
    const raw = this.data();
    if (raw.length === 0) return 100;
    return Math.max(...raw.map(d => d.value), 0);
  });

  ticks = computed(() => {
    const max = this.maxVal();
    return niceTicks(0, max, 5);
  });

  xTicks = computed(() => {
    return this.orientation() === 'horizontal' ? this.ticks() : [];
  });

  yTicks = computed(() => {
    return this.orientation() === 'vertical' ? this.ticks() : [];
  });

  domainMax = computed(() => {
    const t = this.ticks();
    return t[t.length - 1] || 100;
  });

  xPos(val: number): number {
    return scale(val, 0, this.domainMax(), 0, this.innerW());
  }

  yPos(val: number): number {
    // Invert for SVG y coordinate mapping
    return scale(val, 0, this.domainMax(), this.innerH(), 0);
  }

  itemSpacing = computed(() => {
    const count = this.data().length || 1;
    const axisLength = this.orientation() === 'horizontal' ? this.innerH() : this.innerW();
    return axisLength / count;
  });

  computedItems = computed(() => {
    const raw = this.data();
    const spacing = this.itemSpacing();
    const palette = this.colors();

    return raw.map((item, idx) => {
      const coord = spacing * idx + spacing / 2;
      const color = item.color || palette[idx % palette.length];

      return {
        ...item,
        coord,
        color
      };
    });
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
    const container = el.closest('.ngx-lollipop-chart');
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
    link.setAttribute('download', 'lollipop-chart-data.json');
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
    link.setAttribute('download', 'lollipop-chart-data.csv');
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
    link.setAttribute('download', 'lollipop-chart.svg');
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
