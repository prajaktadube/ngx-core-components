import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, TemplateRef, viewChild, HostListener
} from '@angular/core';
import { CommonModule, DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { CHART_COLORS, fmtNum, niceTicks, scale } from '../shared/chart-utils';

export interface CurvePoint {
  xVal: number;
  yVal: number;
  zScore: number;
  percentile: number;
  px: number;
  py: number;
}

@Component({
  selector: 'ngx-bell-curve-chart',
  standalone: true,
  imports: [CommonModule, DecimalPipe, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-bell-curve" (mouseleave)="onMouseLeave()">
      <div class="chart-header" (mousemove)="$event.stopPropagation()" (mouseleave)="onMouseLeave()">
        <div class="header-info">
          <span class="header-title">Bell Curve (Normal Distribution)</span>
          <span class="header-subtitle">Mean (μ): {{ computedMean() | number:'1.1-2' }}, SD (σ): {{ computedSD() | number:'1.1-2' }}</span>
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
        class="bell-curve-svg"
        [attr.width]="'100%'"
        [attr.height]="svgHeight()"
        (mousemove)="onSvgMouseMove($event)"
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

          <!-- Shaded Standard Deviation Bands -->
          @if (fillArea() && curvePoints().length > 0) {
            <!-- ±3σ Band -->
            <path [attr.d]="bandPath(-3, 3)" fill="rgba(74, 144, 217, 0.08)" stroke="none" />
            <!-- ±2σ Band -->
            <path [attr.d]="bandPath(-2, 2)" fill="rgba(74, 144, 217, 0.12)" stroke="none" />
            <!-- ±1σ Band -->
            <path [attr.d]="bandPath(-1, 1)" fill="rgba(74, 144, 217, 0.18)" stroke="none" />
          }

          <!-- Distribution Curve Line -->
          @if (curvePath(); as pathStr) {
            <path
              [attr.d]="pathStr"
              [attr.stroke]="curveColor()"
              fill="none"
              stroke-width="3"
              stroke-linecap="round"
              class="bell-curve-line"
            />
          }

          <!-- Standard Deviation Vertical Lines -->
          @for (sdVal of sdPositions(); track sdVal.label) {
            <g>
              <line
                [attr.x1]="xPos(sdVal.val)"
                [attr.x2]="xPos(sdVal.val)"
                [attr.y1]="0"
                [attr.y2]="innerH()"
                [attr.stroke]="sdVal.label === 'μ' ? curveColor() : 'rgba(100, 116, 139, 0.5)'"
                [attr.stroke-dasharray]="sdVal.label === 'μ' ? 'none' : '4,4'"
                [attr.stroke-width]="sdVal.label === 'μ' ? 1.5 : 1"
              />
              <text
                [attr.x]="xPos(sdVal.val)"
                [attr.y]="innerH() + 14"
                text-anchor="middle"
                class="axis-label sd-label"
              >
                {{ sdVal.label }}
              </text>
              <text
                [attr.x]="xPos(sdVal.val)"
                [attr.y]="innerH() + 26"
                text-anchor="middle"
                class="axis-label sd-val-text"
              >
                {{ sdVal.val | number:'1.0-1' }}
              </text>
            </g>
          }

          <!-- Hover Cursor Line -->
          @if (hoveredPoint(); as hp) {
            <circle
              [attr.cx]="hp.px"
              [attr.cy]="hp.py"
              [attr.r]="6"
              [attr.fill]="curveColor()"
              stroke="#ffffff"
              stroke-width="2"
              class="hover-dot"
            />
            <line
              [attr.x1]="hp.px"
              [attr.x2]="hp.px"
              [attr.y1]="hp.py"
              [attr.y2]="innerH()"
              stroke="#cbd5e1"
              stroke-dasharray="3,3"
            />
          }

          <!-- Y Axis -->
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
                  {{ formatDensity(tick) }}
                </text>
              </g>
            }
          </g>

          <!-- X Axis base line -->
          <line [attr.x1]="0" [attr.x2]="innerW()" [attr.y1]="innerH()" [attr.y2]="innerH()" class="axis-line" />
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
            <div class="tt-cat">Value: {{ t.xVal | number:'1.1-2' }}</div>
            <div class="tt-row">
              <span class="tt-name">Density</span>
              <span class="tt-val">{{ t.yVal | number:'1.1-4' }}</span>
            </div>
            <div class="tt-row">
              <span class="tt-name">Z-Score</span>
              <span class="tt-val">{{ t.zScore | number:'1.1-2' }}</span>
            </div>
            <div class="tt-row">
              <span class="tt-name">Percentile</span>
              <span class="tt-val">{{ t.percentile | number:'1.1-2' }}%</span>
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
    .ngx-bell-curve {
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
    .bell-curve-svg {
      display: block;
      overflow: visible;
      cursor: crosshair;
    }
    .grid-line {
      stroke: var(--ngx-chart-grid, #f1f5f9);
      stroke-width: 1;
      stroke-dasharray: 3,3;
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
      font-size: 10px;
      fill: var(--ngx-chart-axis-text, #64748b);
      font-weight: 550;
      user-select: none;
    }
    .axis-label {
      font-size: 10px;
      fill: var(--ngx-chart-axis-text, #64748b);
      font-weight: 550;
      user-select: none;
    }
    .sd-label {
      font-weight: 700;
      fill: #475569;
    }
    .sd-val-text {
      font-size: 9px;
      fill: #94a3b8;
    }
    .bell-curve-line {
      animation: drawCurve 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      stroke-dasharray: 1200;
      stroke-dashoffset: 1200;
    }
    @keyframes drawCurve {
      from { stroke-dashoffset: 1200; }
      to { stroke-dashoffset: 0; }
    }
    .hover-dot {
      transition: r 0.1s ease;
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
      min-width: 150px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      z-index: 100;
      transition: left 0.08s linear, top 0.08s linear;
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
export class BellCurveChartComponent {
  data = input<number[]>([]);
  mean = input<number | undefined>(undefined);
  standardDeviation = input<number | undefined>(undefined);
  height = input<number>(300);
  showGrid = input<boolean>(true);
  fillArea = input<boolean>(true);
  colors = input<string[]>(CHART_COLORS);
  showExport = input<boolean>(false);
  labelFormatter = input<((v: number) => string) | undefined>(undefined);
  tooltipTemplate = input<TemplateRef<any> | null>(null);

  containerWidth = signal<number>(500);
  hoveredPoint = signal<CurvePoint | null>(null);
  tooltip = signal<any | null>(null);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);
  exportMenuOpen = signal(false);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  margin = computed(() => ({
    top: 20,
    right: 25,
    bottom: 40,
    left: 45
  }));

  svgHeight = computed(() => this.height());
  innerW = computed(() => Math.max(10, this.containerWidth() - this.margin().left - this.margin().right));
  innerH = computed(() => Math.max(10, this.svgHeight() - this.margin().top - this.margin().bottom));

  // Compute Mean
  computedMean = computed<number>(() => {
    const customMean = this.mean();
    if (customMean !== undefined) return customMean;
    const raw = this.data();
    if (raw.length === 0) return 0;
    return raw.reduce((a, b) => a + b, 0) / raw.length;
  });

  // Compute Standard Deviation
  computedSD = computed<number>(() => {
    const customSD = this.standardDeviation();
    if (customSD !== undefined) return customSD;
    const raw = this.data();
    if (raw.length <= 1) return 1;
    const m = this.computedMean();
    const variance = raw.map(x => Math.pow(x - m, 2)).reduce((a, b) => a + b, 0) / raw.length;
    return Math.sqrt(variance) || 1;
  });

  curveColor = computed(() => {
    const colorsList = this.colors();
    return colorsList[0] || '#4a90d9';
  });

  // Positions on X Axis for Standard Deviation indicators
  sdPositions = computed(() => {
    const m = this.computedMean();
    const sd = this.computedSD();
    return [
      { label: '-3σ', val: m - 3 * sd },
      { label: '-2σ', val: m - 2 * sd },
      { label: '-1σ', val: m - sd },
      { label: 'μ', val: m },
      { label: '+1σ', val: m + sd },
      { label: '+2σ', val: m + 2 * sd },
      { label: '+3σ', val: m + 3 * sd }
    ];
  });

  // Generate points on the normal distribution curve (range -3.5σ to +3.5σ)
  curvePoints = computed<CurvePoint[]>(() => {
    const m = this.computedMean();
    const sd = this.computedSD();
    const w = this.innerW();
    const h = this.innerH();

    const minX = m - 3.5 * sd;
    const maxX = m + 3.5 * sd;

    const points: CurvePoint[] = [];
    const steps = 120;
    const stepVal = (maxX - minX) / steps;

    // Normal probability density function
    // f(x) = (1 / (sd * sqrt(2pi))) * e^(-0.5 * ((x-m)/sd)^2)
    const factor = 1 / (sd * Math.sqrt(2 * Math.PI));

    for (let i = 0; i <= steps; i++) {
      const xVal = minX + i * stepVal;
      const zScore = (xVal - m) / sd;
      const yVal = factor * Math.exp(-0.5 * zScore * zScore);

      // Numeric Cumulative Distribution Function (CDF) approximation for percentile
      const percentile = this.normalCDF(zScore) * 100;

      // Temporary pixel layout coords (will be mapped using computed signals)
      points.push({
        xVal,
        yVal,
        zScore,
        percentile,
        px: 0,
        py: 0
      });
    }

    // Now map yVal and xVal to actual pixel coordinates
    const maxYVal = factor; // peak height of standard normal is at mean (z=0)
    const yDomainMax = maxYVal * 1.1; // leave some top padding

    return points.map(pt => ({
      ...pt,
      px: scale(pt.xVal, minX, maxX, 0, w),
      py: scale(pt.yVal, 0, yDomainMax, h, 0)
    }));
  });

  curvePath = computed<string>(() => {
    const pts = this.curvePoints();
    if (pts.length === 0) return '';
    return pts.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.px} ${pt.py}` : `${acc} L ${pt.px} ${pt.py}`;
    }, '');
  });

  yTicks = computed(() => {
    const sd = this.computedSD();
    const factor = 1 / (sd * Math.sqrt(2 * Math.PI));
    return niceTicks(0, factor * 1.1, 5);
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

  yPos(val: number): number {
    const sd = this.computedSD();
    const factor = 1 / (sd * Math.sqrt(2 * Math.PI));
    return scale(val, 0, factor * 1.1, this.innerH(), 0);
  }

  xPos(xVal: number): number {
    const m = this.computedMean();
    const sd = this.computedSD();
    const minX = m - 3.5 * sd;
    const maxX = m + 3.5 * sd;
    return scale(xVal, minX, maxX, 0, this.innerW());
  }

  // Create SVG path for standard deviation band fills
  bandPath(startZ: number, endZ: number): string {
    const pts = this.curvePoints();
    if (pts.length === 0) return '';

    const bandPts = pts.filter(pt => pt.zScore >= startZ && pt.zScore <= endZ);
    if (bandPts.length === 0) return '';

    const first = bandPts[0];
    const last = bandPts[bandPts.length - 1];

    let path = `M ${first.px} ${this.innerH()}`;
    bandPts.forEach(pt => {
      path += ` L ${pt.px} ${pt.py}`;
    });
    path += ` L ${last.px} ${this.innerH()} Z`;
    return path;
  }

  onSvgMouseMove(event: MouseEvent) {
    const svg = this.svgEl()?.nativeElement;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const mx = event.clientX - rect.left - this.margin().left;
    const pts = this.curvePoints();

    if (pts.length === 0) return;

    // Find the point closest horizontally to mouse X
    let closestPt = pts[0];
    let minDist = Math.abs(pts[0].px - mx);

    for (let i = 1; i < pts.length; i++) {
      const dist = Math.abs(pts[i].px - mx);
      if (dist < minDist) {
        minDist = dist;
        closestPt = pts[i];
      }
    }

    // Set tooltip coordinates relative to parent container
    const parentRect = svg.parentElement?.getBoundingClientRect();
    if (parentRect) {
      this.hoveredPoint.set(closestPt);
      this.tooltip.set(closestPt);
      this.tooltipX.set(event.clientX - parentRect.left);
      this.tooltipY.set(event.clientY - parentRect.top);
    }
  }

  onMouseLeave() {
    this.hoveredPoint.set(null);
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
    const pts = this.curvePoints();
    if (!pts.length) return;

    let csv = 'X Value,Y Density,Z Score,Percentile\n';
    pts.forEach(p => {
      csv += `${p.xVal},${p.yVal},${p.zScore},${p.percentile}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'bell-curve-data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToJson(): void {
    const pts = this.curvePoints();
    if (!pts.length) return;

    const data = pts.map(p => ({
      xVal: p.xVal,
      yDensity: p.yVal,
      zScore: p.zScore,
      percentile: p.percentile
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'bell-curve-data.json');
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
    link.setAttribute('download', 'bell-curve-chart.svg');
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
        <title>Bell Curve Export</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #0f172a; text-align: center; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 24px; text-align: left; }
          .title { font-size: 20px; font-weight: bold; }
          .date { font-size: 12px; color: #64748b; }
          .chart-container { display: inline-block; margin-top: 24px; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; background: #ffffff; width: 90%; }
          svg { width: 100%; height: auto; }
          .tick-label { font-size: 10px; fill: #64748b; font-weight: 550; }
          @media print {
            body { padding: 0; }
            .chart-container { border: none; padding: 0; width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">Bell Curve Distribution Analysis</div>
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

  // Helper CDF calculator for Normal Distribution
  private normalCDF(z: number): number {
    // Abromowitz and Stegun formula 26.2.17
    const t = 1.0 / (1.0 + 0.2316419 * Math.abs(z));
    const d = 0.398942280401 * Math.exp(-z * z / 2.0);
    const p = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
    return z >= 0 ? 1.0 - p : p;
  }

  formatDensity(v: number): string {
    return v.toFixed(3);
  }
}
