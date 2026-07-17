import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, HostListener, viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CHART_COLORS, fmtNum, niceTicks, scale } from '../shared/chart-utils';

export interface MarimekkoSegment {
  name: string;
  value: number;
}

export interface MarimekkoItem {
  label: string;
  segments: MarimekkoSegment[];
}

interface ProcessedSegment {
  name: string;
  value: number;
  color: string;
  y: number;
  height: number;
  pctOfCol: number;
  pctOfTotal: number;
  colIndex: number;
  segIndex: number;
}

interface ProcessedCol {
  label: string;
  x: number;
  width: number;
  total: number;
  pctOfTotal: number;
  segments: ProcessedSegment[];
}

@Component({
  selector: 'ngx-marimekko-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-marimekko-chart" (mouseleave)="onMouseLeave()">
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
        class="marimekko-svg"
        [attr.width]="'100%'"
        [attr.height]="svgHeight()"
      >
        <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
          
          <!-- Grid Lines (Horizontal percentage lines) -->
          @if (showGrid()) {
            @for (pct of gridPercentages; track pct) {
              <line
                [attr.x1]="0"
                [attr.x2]="innerW()"
                [attr.y1]="yPos(pct)"
                [attr.y2]="yPos(pct)"
                class="grid-line"
              />
            }
          }

          <!-- Columns & Segments -->
          @for (col of computedCols(); track col.label; let i = $index) {
            <g class="marimekko-col-group">
              @for (seg of col.segments; track seg.name; let j = $index) {
                <g class="marimekko-rect-group">
                  <rect
                    [attr.x]="col.x"
                    [attr.y]="seg.y"
                    [attr.width]="col.width"
                    [attr.height]="seg.height"
                    [attr.fill]="seg.color"
                    class="marimekko-segment"
                    [class.dimmed]="hoveredIndices() !== null && (hoveredIndices()!.col !== i || hoveredIndices()!.seg !== j)"
                    (mouseenter)="onSegmentHover(i, j, $event)"
                    (mousemove)="onSegmentMouseMove($event)"
                    stroke="#ffffff"
                    stroke-width="1.5"
                    [style.animation-delay]="(i * 0.15) + 's'"
                  />
                  @if (showSegmentLabels() && col.width > 40 && seg.height > 16) {
                    <text
                      [attr.x]="col.x + col.width / 2"
                      [attr.y]="seg.y + seg.height / 2"
                      text-anchor="middle"
                      dominant-baseline="middle"
                      class="segment-label"
                      [style.animation-delay]="(0.6 + i * 0.15) + 's'"
                    >
                      {{ seg.pctOfCol.toFixed(0) }}%
                    </text>
                  }
                </g>
              }

              <!-- Bottom Column Labels (Only render if column width is greater than 16px) -->
              @if (showLabels() && col.width > 16) {
                <text
                  [attr.x]="col.x + col.width / 2"
                  [attr.y]="innerH() + 18"
                  text-anchor="middle"
                  class="x-axis-label"
                >
                  {{ col.label }}
                </text>
              }
            </g>
          }

          <!-- Y Axis (Left side - Percentage) -->
          <g class="y-axis">
            <line [attr.x1]="0" [attr.x2]="0" [attr.y1]="0" [attr.y2]="innerH()" class="axis-line" />
            @for (pct of gridPercentages; track pct) {
              <g [attr.transform]="'translate(0,' + yPos(pct) + ')'">
                <line [attr.x1]="-4" [attr.x2]="0" [attr.y1]="0" [attr.y2]="0" class="tick-line" />
                <text
                  [attr.x]="-8"
                  text-anchor="end"
                  dominant-baseline="middle"
                  class="tick-label"
                >
                  {{ pct }}%
                </text>
              </g>
            }
          </g>

          <!-- X Axis (Bottom boundary line) -->
          <g [attr.transform]="'translate(0,' + innerH() + ')'" class="x-axis">
            <line [attr.x1]="0" [attr.x2]="innerW()" [attr.y1]="0" [attr.y2]="0" class="axis-line" />
          </g>
        </g>
      </svg>

      <!-- Glassmorphic Tooltip -->
      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="tooltipX()" [style.top.px]="tooltipY()">
          <div class="tt-cat">{{ t.colLabel }}</div>
          <div class="tt-row">
            <span class="tt-dot" [style.background]="t.color"></span>
            <span class="tt-name">{{ t.name }}</span>
            <span class="tt-val">{{ formatNumber(t.value) }}</span>
          </div>
          <div class="tt-row">
            <span class="tt-dot" style="background: transparent;"></span>
            <span class="tt-name">% of Column</span>
            <span class="tt-val">{{ t.pctOfCol.toFixed(1) }}%</span>
          </div>
          <div class="tt-row">
            <span class="tt-dot" style="background: transparent;"></span>
            <span class="tt-name">% of Total Market</span>
            <span class="tt-val">{{ t.pctOfTotal.toFixed(1) }}%</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .ngx-marimekko-chart {
      background: var(--ngx-chart-bg, #ffffff);
      border-radius: 16px;
      padding: 16px;
      box-sizing: border-box;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
      position: relative;
      width: 100%;
    }
    .marimekko-svg {
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
    .tick-label, .x-axis-label {
      font-size: 11px;
      fill: var(--ngx-chart-axis-text, #64748b);
      font-weight: 550;
      user-select: none;
    }
    .marimekko-segment {
      transition: fill-opacity 0.2s ease, opacity 0.2s ease;
      cursor: pointer;
      transform-origin: bottom;
      animation: marimekkoScaleUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      opacity: 0;
    }
    @keyframes marimekkoScaleUp {
      from { transform: scaleY(0); opacity: 0; }
      to { transform: scaleY(1); opacity: 1; }
    }
    .segment-label {
      font-size: 10px;
      fill: #ffffff;
      pointer-events: none;
      font-weight: 600;
      animation: fadeIn 0.4s ease-out forwards;
      opacity: 0;
    }
    @keyframes fadeIn {
      to { opacity: 1; }
    }
    .marimekko-segment.dimmed {
      opacity: 0.35;
    }
    .marimekko-segment:hover {
      fill-opacity: 0.9;
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
export class MarimekkoChartComponent {
  data = input<MarimekkoItem[]>([]);
  height = input<number>(400);
  showGrid = input<boolean>(true);
  showLabels = input<boolean>(true);
  showSegmentLabels = input<boolean>(true);
  colors = input<string[]>(CHART_COLORS);
  showExport = input<boolean>(false);

  containerWidth = signal<number>(500);
  hoveredIndices = signal<{ col: number; seg: number } | null>(null);
  tooltip = signal<any | null>(null);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);
  exportMenuOpen = signal(false);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  margin = computed(() => ({
    top: 20,
    right: 20,
    bottom: this.showLabels() ? 30 : 10,
    left: 45
  }));

  svgHeight = computed(() => this.height());
  innerW = computed(() => Math.max(10, this.containerWidth() - this.margin().left - this.margin().right));
  innerH = computed(() => Math.max(10, this.svgHeight() - this.margin().top - this.margin().bottom));

  gridPercentages = [0, 25, 50, 75, 100];

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

  yPos(pct: number): number {
    return scale(pct, 0, 100, this.innerH(), 0);
  }

  computedCols = computed(() => {
    const raw = this.data();
    if (raw.length === 0) return [];

    const grandTotal = raw.reduce((acc, col) => {
      const colSum = col.segments.reduce((s, seg) => s + seg.value, 0);
      return acc + colSum;
    }, 0) || 1;

    const w = this.innerW();
    const h = this.innerH();
    const palette = this.colors();

    let xOffset = 0;

    return raw.map((col, cIdx) => {
      const colTotal = col.segments.reduce((s, seg) => s + seg.value, 0);
      const colWidthPct = colTotal / grandTotal;
      const colWidth = colWidthPct * w;

      const colX = xOffset;
      xOffset += colWidth;

      let yOffset = h;

      const segments = col.segments.map((seg, sIdx) => {
        const segHeightPct = colTotal > 0 ? (seg.value / colTotal) : 0;
        const segHeight = segHeightPct * h;

        yOffset -= segHeight;
        const color = palette[(sIdx + cIdx) % palette.length];

        return {
          name: seg.name,
          value: seg.value,
          color,
          y: yOffset,
          height: segHeight,
          pctOfCol: segHeightPct * 100,
          pctOfTotal: (seg.value / grandTotal) * 100,
          colIndex: cIdx,
          segIndex: sIdx
        };
      });

      return {
        label: col.label,
        x: colX,
        width: colWidth,
        total: colTotal,
        pctOfTotal: colWidthPct * 100,
        segments
      };
    });
  });

  onSegmentHover(colIndex: number, segIndex: number, event: MouseEvent) {
    this.hoveredIndices.set({ col: colIndex, seg: segIndex });
    const col = this.computedCols()[colIndex];
    if (col) {
      const seg = col.segments[segIndex];
      if (seg) {
        this.tooltip.set({
          colLabel: col.label,
          name: seg.name,
          value: seg.value,
          color: seg.color,
          pctOfCol: seg.pctOfCol,
          pctOfTotal: seg.pctOfTotal
        });
      }
    }
  }

  onSegmentMouseMove(event: MouseEvent) {
    const el = event.currentTarget as SVGElement;
    const container = el.closest('.ngx-marimekko-chart');
    if (container) {
      const rect = container.getBoundingClientRect();
      this.tooltipX.set(event.clientX - rect.left);
      this.tooltipY.set(event.clientY - rect.top);
    }
  }

  onMouseLeave() {
    this.hoveredIndices.set(null);
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
    link.setAttribute('download', 'marimekko-chart-data.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToCsv(): void {
    const data = this.data();
    if (!data.length) return;
    let csv = 'Column_Label,Segment_Name,Value\n';
    data.forEach(col => {
      col.segments.forEach(seg => {
        csv += `"${col.label || ''}","${seg.name || ''}",${seg.value}\n`;
      });
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'marimekko-chart-data.csv');
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
    link.setAttribute('download', 'marimekko-chart.svg');
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
