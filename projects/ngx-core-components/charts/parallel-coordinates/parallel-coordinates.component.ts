import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, TemplateRef, viewChild, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CHART_COLORS, fmtNum, scale } from '../shared/chart-utils';

export interface AxisDimension {
  key: string;
  min: number;
  max: number;
  ticks: number[];
  x: number;
}

export interface ParallelLine {
  rawData: any;
  index: number;
  points: { x: number; y: number }[];
  pathStr: string;
  color: string;
}

@Component({
  selector: 'ngx-parallel-coordinates',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-parallel-coordinates" (mouseleave)="onMouseLeave()">
      <div class="chart-header" (mousemove)="$event.stopPropagation()" (mouseleave)="onMouseLeave()">
        <div class="header-info">
          <span class="header-title">Parallel Coordinates Visualization</span>
          <span class="header-subtitle">Dimensions: {{ dimensions().join(' | ') }}</span>
        </div>
        
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
        class="parallel-svg"
        [attr.width]="'100%'"
        [attr.height]="svgHeight()"
        (mousemove)="onSvgMouseMove($event)"
      >
        <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
          
          <!-- Dimensions Axes Grid Lines -->
          @for (axis of axes(); track axis.key) {
            <line
              [attr.x1]="axis.x"
              [attr.x2]="axis.x"
              [attr.y1]="0"
              [attr.y2]="innerH()"
              class="axis-line"
            />
            
            <!-- Axis Title -->
            <text
              [attr.x]="axis.x"
              [attr.y]="-10"
              text-anchor="middle"
              class="axis-title"
            >
              {{ axis.key }}
            </text>

            <!-- Ticks on Axis (Min, Mid, Max) -->
            @for (tick of axis.ticks; track tick) {
              <g [attr.transform]="'translate(' + axis.x + ',' + yPosForAxis(tick, axis) + ')'">
                <line [attr.x1]="-4" [attr.x2]="4" [attr.y1]="0" [attr.y2]="0" class="tick-line" />
                <text
                  [attr.x]="-8"
                  text-anchor="end"
                  dominant-baseline="middle"
                  class="tick-label"
                >
                  {{ formatAxisVal(axis.key, tick) }}
                </text>
              </g>
            }
          }

          <!-- Data Lines -->
          @for (line of computedLines(); track line.index; let i = $index) {
            <path
              [attr.d]="line.pathStr"
              [attr.stroke]="line.color"
              fill="none"
              [attr.stroke-width]="hoveredIndex() === i ? 4 : 1.8"
              class="data-line"
              [class.dimmed]="hoveredIndex() !== null && hoveredIndex() !== i"
              [class.highlighted]="hoveredIndex() === i"
            />
          }
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
            <div class="tt-cat">Record #{{ t.index + 1 }}</div>
            @for (dim of dimensions(); track dim) {
              <div class="tt-row">
                <span class="tt-name">{{ dim }}</span>
                <span class="tt-val">{{ formatAxisVal(dim, t.rawData[dim]) }}</span>
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
    .ngx-parallel-coordinates {
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
    .parallel-svg {
      display: block;
      overflow: visible;
    }
    .axis-line {
      stroke: var(--ngx-chart-axis, #cbd5e1);
      stroke-width: 1.8;
    }
    .tick-line {
      stroke: var(--ngx-chart-axis, #94a3b8);
      stroke-width: 1.2;
    }
    .tick-label {
      font-size: 9px;
      fill: var(--ngx-chart-axis-text, #64748b);
      font-weight: 600;
      user-select: none;
    }
    .axis-title {
      font-size: 11px;
      font-weight: 700;
      fill: var(--ngx-chart-axis-text, #334155);
      user-select: none;
    }
    .data-line {
      transition: stroke-width 0.15s ease, opacity 0.15s ease;
      opacity: 0.65;
    }
    .data-line.dimmed {
      opacity: 0.12 !important;
    }
    .data-line.highlighted {
      opacity: 1 !important;
      filter: drop-shadow(0 2px 5px rgba(0,0,0,0.15));
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
export class ParallelCoordinatesComponent {
  data = input<Record<string, any>[]>([]);
  dimensions = input<string[]>([]);
  colorKey = input<string | undefined>(undefined);
  height = input<number>(350);
  colors = input<string[]>(CHART_COLORS);
  showExport = input<boolean>(false);
  labelFormatter = input<((dim: string, val: number) => string) | undefined>(undefined);
  tooltipTemplate = input<TemplateRef<any> | null>(null);

  containerWidth = signal<number>(500);
  hoveredIndex = signal<number | null>(null);
  tooltip = signal<any | null>(null);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);
  exportMenuOpen = signal(false);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  margin = computed(() => ({
    top: 35,
    right: 40,
    bottom: 25,
    left: 45
  }));

  svgHeight = computed(() => this.height());
  innerW = computed(() => Math.max(10, this.containerWidth() - this.margin().left - this.margin().right));
  innerH = computed(() => Math.max(10, this.svgHeight() - this.margin().top - this.margin().bottom));

  // Compute boundaries for each axis
  axes = computed<AxisDimension[]>(() => {
    const dims = this.dimensions();
    const raw = this.data();
    const w = this.innerW();

    if (dims.length === 0 || raw.length === 0) return [];

    return dims.map((dim, idx) => {
      const vals = raw.map(d => Number(d[dim]) || 0);
      const min = Math.min(...vals);
      const max = Math.max(1, ...vals);
      const x = dims.length <= 1 ? w / 2 : scale(idx, 0, dims.length - 1, 0, w);

      // 3 ticks: min, mid, max
      const mid = min + (max - min) / 2;

      return {
        key: dim,
        min,
        max,
        ticks: [min, mid, max],
        x
      };
    });
  });

  computedLines = computed<ParallelLine[]>(() => {
    const raw = this.data();
    const axesList = this.axes();
    const h = this.innerH();
    const cols = this.colors();
    const colKey = this.colorKey();

    if (raw.length === 0 || axesList.length === 0) return [];

    // Distinct categorical color values helper
    const categories = colKey ? Array.from(new Set(raw.map(d => d[colKey]))) : [];

    return raw.map((d, lineIdx) => {
      const points = axesList.map(axis => {
        const val = Number(d[axis.key]) || 0;
        const y = scale(val, axis.min, axis.max, h, 0);
        return { x: axis.x, y };
      });

      const pathStr = points.reduce((acc, pt, idx) => {
        return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
      }, '');

      let color = cols[lineIdx % cols.length];
      if (colKey) {
        const catIdx = categories.indexOf(d[colKey]);
        color = cols[catIdx % cols.length];
      }

      return {
        rawData: d,
        index: lineIdx,
        points,
        pathStr,
        color
      };
    });
  });

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

  yPosForAxis(val: number, axis: AxisDimension): number {
    return scale(val, axis.min, axis.max, this.innerH(), 0);
  }

  formatAxisVal(dim: string, val: number): string {
    const formatter = this.labelFormatter();
    if (formatter) return formatter(dim, val);
    return fmtNum(val);
  }

  onSvgMouseMove(event: MouseEvent) {
    const svg = this.svgEl()?.nativeElement;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const mx = event.clientX - rect.left - this.margin().left;
    const my = event.clientY - rect.top - this.margin().top;

    const lines = this.computedLines();
    const axesList = this.axes();

    if (lines.length === 0 || axesList.length < 2) return;

    // Find the horizontal segment that the mouse is currently in
    let segmentIdx = 0;
    for (let i = 0; i < axesList.length - 1; i++) {
      if (mx >= axesList[i].x && mx <= axesList[i+1].x) {
        segmentIdx = i;
        break;
      }
    }

    // Determine the interpolation factor t in this segment
    const axisLeft = axesList[segmentIdx];
    const axisRight = axesList[segmentIdx + 1];
    const segmentW = axisRight.x - axisLeft.x;
    const t = segmentW === 0 ? 0 : (mx - axisLeft.x) / segmentW;

    // Find the line that is vertically closest to the mouse cursor at mx
    let closestLineIdx = 0;
    let minDist = Infinity;

    lines.forEach((line, idx) => {
      const yLeft = line.points[segmentIdx].y;
      const yRight = line.points[segmentIdx + 1].y;
      // Linear interpolation of y value on the line segment
      const yLine = yLeft + t * (yRight - yLeft);
      const dist = Math.abs(yLine - my);

      if (dist < minDist) {
        minDist = dist;
        closestLineIdx = idx;
      }
    });

    // If mouse is within 25px vertically, highlight the line
    if (minDist < 25) {
      this.hoveredIndex.set(closestLineIdx);
      const activeLine = lines[closestLineIdx];
      this.tooltip.set(activeLine);

      const parentRect = svg.parentElement?.getBoundingClientRect();
      if (parentRect) {
        this.tooltipX.set(event.clientX - parentRect.left);
        this.tooltipY.set(event.clientY - parentRect.top);
      }
    } else {
      this.hoveredIndex.set(null);
      this.tooltip.set(null);
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

  exportToCsv(): void {
    const data = this.data();
    if (!data.length) return;

    const headers = Object.keys(data[0]);
    let csv = headers.join(',') + '\n';

    data.forEach(row => {
      csv += headers.map(h => `"${row[h]}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'parallel-coordinates-data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToJson(): void {
    const data = this.data();
    if (!data.length) return;

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'parallel-coordinates-data.json');
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
    link.setAttribute('download', 'parallel-coordinates.svg');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToPdf(): void {
    const svg = this.svgEl()?.nativeElement;
    if (!svg || typeof window === 'undefined' || typeof document === 'undefined') return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocker prevented printing. Please allow pop-ups for this site.');
      return;
    }

    const svgHtml = svg.outerHTML;
    const printTemplate = `
      <html>
      <head>
        <title>Parallel Coordinates Export</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #0f172a; text-align: center; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 24px; text-align: left; }
          .title { font-size: 20px; font-weight: bold; }
          .date { font-size: 12px; color: #64748b; }
          .chart-container { display: inline-block; margin-top: 24px; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; background: #ffffff; width: 90%; }
          svg { width: 100%; height: auto; }
          .axis-line { stroke: #cbd5e1; stroke-width: 1.8px; }
          .tick-label { font-size: 9px; fill: #64748b; font-weight: bold; }
          .axis-title { font-size: 11px; font-weight: bold; fill: #334155; }
          @media print {
            body { padding: 0; }
            .chart-container { border: none; padding: 0; width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">Parallel Coordinates Multi-Dimensional Analysis</div>
          <div class="date">${new Date().toLocaleString()}</div>
        </div>
        <div class="chart-container">
          ${svgHtml}
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(printTemplate);
    printWindow.document.close();
  }
}
