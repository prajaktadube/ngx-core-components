import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, TemplateRef, viewChild, HostListener
} from '@angular/core';
import { DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { CHART_COLORS, fmtNum, scale } from '../shared/chart-utils';

export interface VectorItem {
  x: number;
  y: number;
  vx: number;
  vy: number;
  magnitude?: number;
  color?: string;
}

export interface ComputedVector {
  raw: VectorItem;
  index: number;
  px: number;
  py: number;
  xStart: number;
  yStart: number;
  xEnd: number;
  yEnd: number;
  arrowHeadPath: string;
  magnitude: number;
  angleDeg: number;
  color: string;
}

@Component({
  selector: 'ngx-vector-plot',
  standalone: true,
  imports: [DecimalPipe, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-vector-plot" (mouseleave)="onMouseLeave()">
      <div class="chart-header" (mousemove)="$event.stopPropagation()" (mouseleave)="onMouseLeave()">
        <div class="header-info">
          <span class="header-title">Vector Field Plot</span>
          <span class="header-subtitle">Vectors count: {{ data().length }}</span>
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
        class="vector-plot-svg"
        [attr.width]="'100%'"
        [attr.height]="svgHeight()"
        (mousemove)="onSvgMouseMove($event)"
      >
        <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
          
          <!-- Grid Background (Cartesian quadrants or divisions) -->
          @if (showGrid()) {
            <line [attr.x1]="0" [attr.x2]="innerW()" [attr.y1]="innerH() / 2" [attr.y2]="innerH() / 2" class="grid-axis-line" />
            <line [attr.x1]="innerW() / 2" [attr.x2]="innerW() / 2" [attr.y1]="0" [attr.y2]="innerH()" class="grid-axis-line" />
          }

          <!-- Vectors -->
          @for (vec of computedVectors(); track vec.index; let i = $index) {
            <g
              class="vector-group"
              [class.dimmed]="hoveredIndex() !== null && hoveredIndex() !== i"
              [class.highlighted]="hoveredIndex() === i"
            >
              <!-- Arrow Shaft -->
              <line
                [attr.x1]="vec.xStart"
                [attr.y1]="vec.yStart"
                [attr.x2]="vec.xEnd"
                [attr.y2]="vec.yEnd"
                [attr.stroke]="vec.color"
                [attr.stroke-width]="hoveredIndex() === i ? 3 : 1.6"
                stroke-linecap="round"
                class="vector-shaft"
              />
              
              <!-- Arrow Head -->
              <path
                [attr.d]="vec.arrowHeadPath"
                [attr.fill]="'none'"
                [attr.stroke]="vec.color"
                [attr.stroke-width]="hoveredIndex() === i ? 2.5 : 1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="vector-arrowhead"
              />

              <!-- Grid Point Anchor -->
              <circle
                [attr.cx]="vec.px"
                [attr.cy]="vec.py"
                [attr.r]="hoveredIndex() === i ? 3 : 1.5"
                [attr.fill]="vec.color"
                opacity="0.6"
              />
            </g>
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
            <div class="tt-cat">Vector #{{ t.index + 1 }}</div>
            <div class="tt-row">
              <span class="tt-name">Position (X, Y)</span>
              <span class="tt-val">({{ t.raw.x | number:'1.1-2' }}, {{ t.raw.y | number:'1.1-2' }})</span>
            </div>
            <div class="tt-row">
              <span class="tt-name">Velocity (Vx, Vy)</span>
              <span class="tt-val">({{ t.raw.vx | number:'1.1-2' }}, {{ t.raw.vy | number:'1.1-2' }})</span>
            </div>
            <div class="tt-row">
              <span class="tt-name">Magnitude</span>
              <span class="tt-val">{{ t.magnitude | number:'1.1-3' }}</span>
            </div>
            <div class="tt-row">
              <span class="tt-name">Angle</span>
              <span class="tt-val">{{ t.angleDeg | number:'1.0-1' }}°</span>
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
    .ngx-vector-plot {
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
    .vector-plot-svg {
      display: block;
      overflow: visible;
      background: var(--ngx-vector-bg, #fafafa);
      border-radius: 8px;
    }
    .grid-axis-line {
      stroke: var(--ngx-chart-grid, #e2e8f0);
      stroke-width: 1.2;
      stroke-dasharray: 4,4;
    }
    .vector-group {
      transition: opacity 0.15s ease;
    }
    .vector-group.dimmed {
      opacity: 0.22 !important;
    }
    .vector-group.highlighted {
      opacity: 1 !important;
    }
    .vector-shaft {
      transition: stroke-width 0.1s ease;
    }
    .vector-arrowhead {
      transition: stroke-width 0.1s ease;
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
export class VectorPlotComponent {
  data = input<VectorItem[]>([]);
  gridSize = input<number>(20);
  height = input<number>(350);
  colors = input<string[]>(CHART_COLORS);
  showGrid = input<boolean>(true);
  showExport = input<boolean>(false);
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
    left: 20
  }));

  svgHeight = computed(() => this.height());
  innerW = computed(() => Math.max(10, this.containerWidth() - this.margin().left - this.margin().right));
  innerH = computed(() => Math.max(10, this.svgHeight() - this.margin().top - this.margin().bottom));

  computedVectors = computed<ComputedVector[]>(() => {
    const raw = this.data();
    if (raw.length === 0) return [];

    const w = this.innerW();
    const h = this.innerH();

    // Map bounds
    const xs = raw.map(d => d.x);
    const ys = raw.map(d => d.y);

    let minX = Math.min(...xs);
    let maxX = Math.max(...xs);
    let minY = Math.min(...ys);
    let maxY = Math.max(...ys);

    // Padding bounds slightly
    if (minX === maxX) { minX -= 1; maxX += 1; }
    if (minY === maxY) { minY -= 1; maxY += 1; }

    const vels = raw.map(d => d.magnitude ?? Math.sqrt(d.vx * d.vx + d.vy * d.vy));
    const maxVal = Math.max(0.1, ...vels);

    const cols = this.colors();
    const startColor = '#a5f3fc'; // light cyan
    const endColor = cols[0] || '#4f46e5';

    // Cell dimension estimation
    const colsCount = Array.from(new Set(xs)).length || 10;
    const cellW = w / colsCount;
    const maxArrowLength = Math.max(8, cellW * 0.9);

    return raw.map((d, idx) => {
      // Map node grid pos
      const px = scale(d.x, minX, maxX, w * 0.05, w * 0.95);
      const py = scale(d.y, minY, maxY, h * 0.95, h * 0.05); // Invert Y for Cartesian representation

      const mag = d.magnitude ?? Math.sqrt(d.vx * d.vx + d.vy * d.vy);
      const arrowLength = scale(mag, 0, maxVal, 6, maxArrowLength);

      // Angle estimation
      const angleRad = Math.atan2(-d.vy, d.vx); // Negative Vy to compensate for SVG inverted Y-axis
      const angleDeg = (angleRad * 180) / Math.PI;

      // Draw arrow line centered at grid node (px, py)
      const dx = Math.cos(angleRad) * arrowLength;
      const dy = Math.sin(angleRad) * arrowLength;

      const xStart = px - dx / 2;
      const yStart = py - dy / 2;
      const xEnd = px + dx / 2;
      const yEnd = py + dy / 2;

      // Draw arrow head coordinates
      const headSize = Math.max(3, arrowLength * 0.25);
      const ax = xEnd - headSize * Math.cos(angleRad - Math.PI / 6);
      const ay = yEnd - headSize * Math.sin(angleRad - Math.PI / 6);
      const bx = xEnd - headSize * Math.cos(angleRad + Math.PI / 6);
      const by = yEnd - headSize * Math.sin(angleRad + Math.PI / 6);

      const arrowHeadPath = `M ${ax} ${ay} L ${xEnd} ${yEnd} L ${bx} ${by}`;

      // Dynamic color based on velocity magnitude
      const color = d.color || this.interpolateColor(startColor, endColor, mag, 0, maxVal);

      return {
        raw: d,
        index: idx,
        px,
        py,
        xStart,
        yStart,
        xEnd,
        yEnd,
        arrowHeadPath,
        magnitude: mag,
        angleDeg: angleDeg < 0 ? angleDeg + 360 : angleDeg,
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

  // Linear color interpolation helper
  private interpolateColor(startHex: string, endHex: string, val: number, min: number, max: number): string {
    const t = max === min ? 0.5 : (val - min) / (max - min);

    const parseHex = (hex: string) => {
      let r = 0, g = 0, b = 0;
      const parsed = hex.startsWith('#') ? hex.substring(1) : hex;
      if (parsed.length === 3) {
        r = parseInt(parsed[0] + parsed[0], 16);
        g = parseInt(parsed[1] + parsed[1], 16);
        b = parseInt(parsed[2] + parsed[2], 16);
      } else if (parsed.length === 6) {
        r = parseInt(parsed.substring(0, 2), 16);
        g = parseInt(parsed.substring(2, 4), 16);
        b = parseInt(parsed.substring(4, 6), 16);
      }
      return { r, g, b };
    };

    const c1 = parseHex(startHex);
    const c2 = parseHex(endHex);

    const r = Math.round(c1.r + t * (c2.r - c1.r));
    const g = Math.round(c1.g + t * (c2.g - c1.g));
    const b = Math.round(c1.b + t * (c2.b - c1.b));

    return `rgb(${r}, ${g}, ${b})`;
  }

  onSvgMouseMove(event: MouseEvent) {
    const svg = this.svgEl()?.nativeElement;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const mx = event.clientX - rect.left - this.margin().left;
    const my = event.clientY - rect.top - this.margin().top;

    const vectors = this.computedVectors();
    if (vectors.length === 0) return;

    // Find the closest grid point to mouse position
    let closestIdx = 0;
    let minDist = Infinity;

    vectors.forEach((vec, idx) => {
      const dx = vec.px - mx;
      const dy = vec.py - my;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < minDist) {
        minDist = dist;
        closestIdx = idx;
      }
    });

    // If within 30px, trigger tooltip tracking
    if (minDist < 30) {
      this.hoveredIndex.set(closestIdx);
      this.tooltip.set(vectors[closestIdx]);

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
    const vectors = this.computedVectors();
    if (!vectors.length) return;

    let csv = 'X,Y,Vx,Vy,Magnitude,AngleDegrees\n';
    vectors.forEach(v => {
      csv += `${v.raw.x},${v.raw.y},${v.raw.vx},${v.raw.vy},${v.magnitude},${v.angleDeg}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'vector-plot-data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToJson(): void {
    const vectors = this.computedVectors();
    if (!vectors.length) return;

    const data = vectors.map(v => ({
      x: v.raw.x,
      y: v.raw.y,
      vx: v.raw.vx,
      vy: v.raw.vy,
      magnitude: v.magnitude,
      angleDegrees: v.angleDeg
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'vector-plot-data.json');
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
    link.setAttribute('download', 'vector-plot.svg');
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
        <title>Vector Plot Export</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #0f172a; text-align: center; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 24px; text-align: left; }
          .title { font-size: 20px; font-weight: bold; }
          .date { font-size: 12px; color: #64748b; }
          .chart-container { display: inline-block; margin-top: 24px; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; background: #ffffff; width: 90%; }
          svg { width: 100%; height: auto; }
          @media print {
            body { padding: 0; }
            .chart-container { border: none; padding: 0; width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">Vector Field Plot Flow Analysis</div>
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
