import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, HostListener, viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CHART_COLORS, fmtNum } from '../shared/chart-utils';

export interface BiplotPoint {
  x: number;
  y: number;
  label: string;
  group?: string;
}

export interface BiplotVector {
  x: number;
  y: number;
  label: string;
}

interface ProcessedPoint {
  label: string;
  xVal: number;
  yVal: number;
  cx: number;
  cy: number;
  group?: string;
  color: string;
}

interface ProcessedVector {
  label: string;
  xVal: number;
  yVal: number;
  x2: number;
  y2: number;
}

@Component({
  selector: 'ngx-biplot',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-biplot" (mouseleave)="onMouseLeave()">
      <!-- Toolbar with Export option -->
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
        class="biplot-svg"
        [attr.width]="'100%'"
        [attr.height]="svgHeight()"
      >
        <!-- Arrowhead Marker Definition -->
        <defs>
          <marker
            id="vector-arrow"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#ef4444" />
          </marker>
        </defs>

        <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
          
          <!-- Axis Lines (Passing through Origin 0,0) -->
          <line
            [attr.x1]="0"
            [attr.x2]="innerW()"
            [attr.y1]="originY()"
            [attr.y2]="originY()"
            class="axis-line origin-axis"
          />
          <line
            [attr.x1]="originX()"
            [attr.x2]="originX()"
            [attr.y1]="0"
            [attr.y2]="innerH()"
            class="axis-line origin-axis"
          />

          <!-- Tick Marks on X Axis -->
          @for (tick of xTicks(); track tick) {
            <g [attr.transform]="'translate(' + xPos(tick) + ', 0)'">
              <line
                [attr.y1]="originY() - 3"
                [attr.y2]="originY() + 3"
                class="tick-line"
              />
              @if (tick !== 0) {
                <text
                  [attr.y]="originY() + 14"
                  text-anchor="middle"
                  class="tick-label"
                >
                  {{ formatNumber(tick) }}
                </text>
              }
            </g>
          }

          <!-- Tick Marks on Y Axis -->
          @for (tick of yTicks(); track tick) {
            <g [attr.transform]="'translate(0, ' + yPos(tick) + ')'">
              <line
                [attr.x1]="originX() - 3"
                [attr.x2]="originX() + 3"
                class="tick-line"
              />
              @if (tick !== 0) {
                <text
                  [attr.x]="originX() - 8"
                  text-anchor="end"
                  dominant-baseline="middle"
                  class="tick-label"
                >
                  {{ formatNumber(tick) }}
                </text>
              }
            </g>
          }

          <!-- Zero Label at Origin -->
          <text
            [attr.x]="originX() - 8"
            [attr.y]="originY() + 12"
            text-anchor="end"
            class="tick-label origin-label"
          >
            0
          </text>

          <!-- Vector Loadings (Variables) -->
          @for (vec of computedVectors(); track vec.label) {
            <g class="vector-group">
              <line
                [attr.x1]="originX()"
                [attr.y1]="originY()"
                [attr.x2]="vec.x2"
                [attr.y2]="vec.y2"
                class="vector-line"
                marker-end="url(#vector-arrow)"
              />
              <text
                [attr.x]="vec.x2 + (vec.x2 > originX() ? 6 : -6)"
                [attr.y]="vec.y2 + (vec.y2 > originY() ? 6 : -6)"
                [attr.text-anchor]="vec.x2 > originX() ? 'start' : 'end'"
                dominant-baseline="middle"
                class="vector-label"
              >
                {{ vec.label }}
              </text>
            </g>
          }

          <!-- Scatter Points (Observations) -->
          @for (pt of computedPoints(); track pt.label; let i = $index) {
            <g
              class="point-group"
              [class.dimmed]="hoveredPointIndex() !== null && hoveredPointIndex() !== i"
              (mouseenter)="onPointHover(i, $event)"
              (mousemove)="onMouseMove($event)"
            >
              <circle
                [attr.cx]="pt.cx"
                [attr.cy]="pt.cy"
                [attr.r]="hoveredPointIndex() === i ? 7 : 5"
                [attr.fill]="pt.color"
                [attr.stroke]="'#ffffff'"
                [attr.stroke-width]="hoveredPointIndex() === i ? 2 : 1"
                class="biplot-point"
              />
              @if (showLabels() || hoveredPointIndex() === i) {
                <text
                  [attr.x]="pt.cx + 8"
                  [attr.y]="pt.cy - 6"
                  class="point-label"
                >
                  {{ pt.label }}
                </text>
              }
            </g>
          }
        </g>
      </svg>

      <!-- Glassmorphic Tooltip -->
      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="tooltipX()" [style.top.px]="tooltipY()">
          <div class="tt-cat">{{ t.label }}</div>
          @if (t.group) {
            <div class="tt-row">
              <span class="tt-name">Group</span>
              <span class="tt-val">{{ t.group }}</span>
            </div>
          }
          <div class="tt-row">
            <span class="tt-name">PC1 (X)</span>
            <span class="tt-val">{{ formatNumber(t.x) }}</span>
          </div>
          <div class="tt-row">
            <span class="tt-name">PC2 (Y)</span>
            <span class="tt-val">{{ formatNumber(t.y) }}</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .ngx-biplot {
      background: var(--ngx-chart-bg, #ffffff);
      border-radius: 16px;
      padding: 16px;
      box-sizing: border-box;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
      position: relative;
      width: 100%;
    }
    .biplot-svg {
      display: block;
      overflow: visible;
    }
    .axis-line {
      stroke: var(--ngx-chart-axis, #cbd5e1);
      stroke-width: 1;
    }
    .origin-axis {
      stroke: var(--ngx-chart-axis-strong, #94a3b8);
      stroke-width: 1.5;
      stroke-dasharray: 3,3;
    }
    .tick-line {
      stroke: var(--ngx-chart-axis, #cbd5e1);
      stroke-width: 1.5;
    }
    .tick-label, .point-label {
      font-size: 11px;
      fill: var(--ngx-chart-axis-text, #64748b);
      font-weight: 550;
      user-select: none;
    }
    .origin-label {
      fill: var(--ngx-chart-axis-text, #475569);
      font-weight: 700;
    }
    .biplot-point {
      cursor: pointer;
      transition: r 0.2s ease, stroke-width 0.2s ease;
      transform-origin: center;
      animation: pointScaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      opacity: 0;
    }
    @keyframes pointScaleIn {
      from { transform: scale(0); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .point-group {
      transition: opacity 0.2s ease;
    }
    .point-group.dimmed {
      opacity: 0.35;
    }
    .vector-group {
      animation: vectorFadeIn 0.8s ease-out forwards;
      opacity: 0;
    }
    @keyframes vectorFadeIn {
      to { opacity: 1; }
    }
    .vector-line {
      stroke: #ef4444;
      stroke-width: 2;
      stroke-linecap: round;
      pointer-events: none;
    }
    .vector-label {
      font-size: 11px;
      fill: #ef4444;
      font-weight: 700;
      user-select: none;
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
    .tt-name {
      color: rgba(248, 250, 252, 0.8);
      flex: 1;
    }
    .tt-val {
      font-weight: 700;
      font-family: monospace;
    }

    /* Export styles */
    .chart-export-menu {
      position: relative;
      z-index: 50;
      margin-bottom: 12px;
    }
    .export-trigger {
      float: right;
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
      z-index: 60;
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
    .chart-header { display: flex; justify-content: space-between; align-items: center; min-height: 24px; position: relative; }
  `]
})
export class BiplotComponent {
  points = input<BiplotPoint[]>([]);
  vectors = input<BiplotVector[]>([]);
  height = input<number>(400);
  showLabels = input<boolean>(true);
  vectorScale = input<number>(1.0);
  colors = input<string[]>(CHART_COLORS);
  showExport = input<boolean>(false);

  containerWidth = signal<number>(500);
  hoveredPointIndex = signal<number | null>(null);
  tooltip = signal<any | null>(null);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);
  exportMenuOpen = signal(false);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  svgHeight = computed(() => this.height());

  margin = computed(() => ({
    top: 40,
    right: 40,
    bottom: 40,
    left: 40
  }));

  innerW = computed(() => Math.max(10, this.containerWidth() - this.margin().left - this.margin().right));
  innerH = computed(() => Math.max(10, this.svgHeight() - this.margin().top - this.margin().bottom));

  // Determine global domain range Symmetrical around zero
  maxExtent = computed(() => {
    const pts = this.points();
    const vecs = this.vectors();
    const scaleFactor = this.vectorScale();
    const allCoords = [
      ...pts.map(p => Math.abs(p.x)),
      ...pts.map(p => Math.abs(p.y)),
      ...vecs.map(v => Math.abs(v.x * scaleFactor)),
      ...vecs.map(v => Math.abs(v.y * scaleFactor))
    ];
    if (allCoords.length === 0) return 1.0;
    const maxVal = Math.max(...allCoords);
    return maxVal * 1.15 || 1.0;
  });

  xTicks = computed(() => {
    const limit = this.maxExtent();
    return [-limit, -limit / 2, 0, limit / 2, limit];
  });

  yTicks = computed(() => {
    const limit = this.maxExtent();
    return [-limit, -limit / 2, 0, limit / 2, limit];
  });

  xPos(val: number): number {
    const limit = this.maxExtent();
    // Maps -limit..+limit to 0..innerW
    return ((val + limit) / (2 * limit)) * this.innerW();
  }

  yPos(val: number): number {
    const limit = this.maxExtent();
    // Maps -limit..+limit to innerH..0 (inverted SVG coords)
    return this.innerH() - ((val + limit) / (2 * limit)) * this.innerH();
  }

  originX = computed(() => this.xPos(0));
  originY = computed(() => this.yPos(0));

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

  computedPoints = computed<ProcessedPoint[]>(() => {
    const pts = this.points();
    const palette = this.colors();

    // Map group labels to color mapping dictionary
    const groups = Array.from(new Set(pts.map(p => p.group).filter(Boolean)));
    const groupColors: Record<string, string> = {};
    groups.forEach((g, idx) => {
      groupColors[g!] = palette[idx % palette.length];
    });

    return pts.map(p => {
      const color = p.group ? groupColors[p.group] : palette[0];
      return {
        label: p.label,
        xVal: p.x,
        yVal: p.y,
        cx: this.xPos(p.x),
        cy: this.yPos(p.y),
        group: p.group,
        color
      };
    });
  });

  computedVectors = computed<ProcessedVector[]>(() => {
    const vecs = this.vectors();
    const scaleFactor = this.vectorScale();
    return vecs.map(v => ({
      label: v.label,
      xVal: v.x * scaleFactor,
      yVal: v.y * scaleFactor,
      x2: this.xPos(v.x * scaleFactor),
      y2: this.yPos(v.y * scaleFactor)
    }));
  });

  onPointHover(idx: number, event: MouseEvent) {
    this.hoveredPointIndex.set(idx);
    const pt = this.computedPoints()[idx];
    if (pt) {
      this.tooltip.set({
        label: pt.label,
        group: pt.group,
        x: pt.xVal,
        y: pt.yVal
      });
    }
  }

  onMouseMove(event: MouseEvent) {
    const el = event.currentTarget as SVGElement;
    const container = el.closest('.ngx-biplot');
    if (container) {
      const rect = container.getBoundingClientRect();
      this.tooltipX.set(event.clientX - rect.left);
      this.tooltipY.set(event.clientY - rect.top);
    }
  }

  onMouseLeave() {
    this.hoveredPointIndex.set(null);
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
    const points = this.points();
    const vectors = this.vectors();
    if (!points.length && !vectors.length) return;
    let csv = 'Type,Label,X,Y,Group\n';
    points.forEach(p => {
      csv += `Point,"${p.label}",${p.x},${p.y},"${p.group || ''}"\n`;
    });
    vectors.forEach(v => {
      csv += `Vector,"${v.label}",${v.x},${v.y},\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'biplot-data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToJson(): void {
    const data = {
      points: this.points(),
      vectors: this.vectors()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'biplot-data.json');
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
    source = '<?xml version="1.0" encoding="utf-8"?>\n' + source;
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'biplot.svg');
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
        <title>Biplot Export</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #0f172a; text-align: center; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 24px; text-align: left; }
          .title { font-size: 20px; font-weight: bold; }
          .date { font-size: 12px; color: #64748b; }
          .chart-container { display: inline-block; margin-top: 24px; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; background: #ffffff; width: 90%; }
          svg { width: 100%; height: auto; }
          .tick-label, .point-label, .vector-label { font-size: 11px; fill: #64748b; font-weight: 550; }
          .vector-line { stroke: #ef4444; stroke-width: 2; }
          @media print {
            body { padding: 0; }
            .chart-container { border: none; padding: 0; width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">Biplot Analytics</div>
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

  formatNumber(v: number): string {
    return fmtNum(v);
  }
}
