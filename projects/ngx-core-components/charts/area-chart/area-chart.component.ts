import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, HostListener, viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CHART_COLORS, ChartSeries, niceTicks, scale, smoothPath, fmtNum } from '../shared/chart-utils';

@Component({
  selector: 'ngx-area-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-area-chart" (mousemove)="onMouseMove($event)" (mouseleave)="onMouseLeave()">
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

      @if (showLegend()) {
        <div class="chart-legend" (mousemove)="$event.stopPropagation()" (mouseleave)="onMouseLeave()">
          @for (s of series(); track s.name; let i = $index) {
            <span class="legend-item">
              <span class="legend-dot" [style.background]="seriesColor(i, s)"></span>
              {{ s.name }}
            </span>
          }
        </div>
      }
      
      <div class="chart-svg-wrap">
        <svg #svgEl [attr.width]="'100%'" [attr.height]="height()" class="chart-svg">
          <defs>
            @for (s of series(); track s.name; let i = $index) {
              <linearGradient [attr.id]="'area-gradient-' + i" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" [attr.stop-color]="seriesColor(i, s)" stop-opacity="0.45"/>
                <stop offset="100%" [attr.stop-color]="seriesColor(i, s)" stop-opacity="0.02"/>
              </linearGradient>
            }
          </defs>
          
          <g [attr.transform]="'translate(' + PAD_LEFT + ',' + PAD_TOP + ')'">
            <!-- Gridlines -->
            @for (tick of yTicks(); track tick) {
              <g [attr.transform]="'translate(0,' + yPos(tick) + ')'">
                @if (showGrid()) {
                  <line [attr.x1]="0" [attr.x2]="innerW()" stroke="var(--ngx-chart-grid, #e2e8f0)" stroke-dasharray="3,3"/>
                }
                <text x="-8" dy="4" class="axis-label" text-anchor="end">{{ fmtNum(tick) }}</text>
              </g>
            }

            <!-- X Axis Categories -->
            @for (cat of categories(); track cat; let i = $index) {
              <text [attr.x]="xPos(i)" [attr.y]="innerH() + 16" class="axis-label" text-anchor="middle">{{ cat }}</text>
            }

            <!-- Area & Line Paths -->
            @for (s of series(); track s.name; let si = $index) {
              <!-- Area Fill -->
              <path
                [attr.d]="areaPath(s)"
                [attr.fill]="'url(#area-gradient-' + si + ')'"
                stroke="none"
                class="area-path"
              />
              
              <!-- Border Line -->
              <path
                [attr.d]="linePath(s)"
                [attr.stroke]="seriesColor(si, s)"
                fill="none"
                stroke-width="3"
                stroke-linejoin="round"
                stroke-linecap="round"
                class="line-path"
              />
              
              <!-- Hover Markers -->
              @if (showMarkers() && animateState()) {
                @for (v of s.data; track $index; let ci = $index) {
                  <circle
                    [attr.cx]="xPos(ci)"
                    [attr.cy]="yPos(v)"
                    [attr.r]="activeCategoryIndex() === ci ? 6 : 4"
                    [attr.fill]="seriesColor(si, s)"
                    [attr.stroke]="activeCategoryIndex() === ci ? '#fff' : '#fff'"
                    [attr.stroke-width]="activeCategoryIndex() === ci ? 2.5 : 2"
                    [attr.filter]="activeCategoryIndex() === ci ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))' : null"
                    class="marker-dot"
                  />
                }
              }
            }

            <!-- Vertical Crosshair -->
            @if (crosshair(); as ch) {
              <line [attr.x1]="ch.x" [attr.x2]="ch.x" y1="0" [attr.y2]="innerH()"
                stroke="var(--primary-color, #4f46e5)" stroke-opacity="0.3" stroke-width="1.5" stroke-dasharray="4,4"/>
            }

            <!-- Axis Lines -->
            <line x1="0" [attr.x2]="innerW()" [attr.y1]="innerH()" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #cbd5e1)"/>
            <line x1="0" x2="0" y1="0" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #cbd5e1)"/>
          </g>
        </svg>
      </div>

      <!-- Hover Tooltip -->
      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
          <div class="tt-cat">{{ t.cat }}</div>
          @for (row of t.rows; track row.name) {
            <div class="tt-row">
              <span class="tt-dot" [style.background]="row.color"></span>
              <span class="tt-name">{{ row.name }}</span>
              <strong class="tt-val">{{ fmtNum(row.value) }}</strong>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .ngx-area-chart {
      position: relative;
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 12px;
      padding: 20px;
    }
    .chart-legend {
      display: flex;
      gap: 16px;
      padding: 0 0 12px;
      flex-wrap: wrap;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: var(--text-secondary, #64748b);
      font-weight: 500;
    }
    .legend-dot {
      width: 12px;
      height: 4px;
      border-radius: 2px;
      display: inline-block;
    }
    .chart-svg-wrap {
      position: relative;
      width: 100%;
    }
    .chart-svg {
      display: block;
      overflow: visible;
      cursor: crosshair;
    }
    .axis-label {
      font-size: 10px;
      font-weight: 600;
      fill: var(--text-secondary, #94a3b8);
    }
    
    @keyframes lineDraw {
      from { stroke-dashoffset: 1200; }
      to { stroke-dashoffset: 0; }
    }
    .line-path {
      stroke-dasharray: 1200;
      stroke-dashoffset: 1200;
      animation: lineDraw 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    
    @keyframes areaFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .area-path {
      animation: areaFadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
    }

    .marker-dot {
      animation: areaFadeIn 0.5s ease 0.8s both;
      transition: r 0.15s cubic-bezier(0.16, 1, 0.3, 1), stroke-width 0.15s;
    }
    
    /* Premium Glassmorphic Tooltip */
    .chart-tooltip {
      position: absolute; pointer-events: none; transform: translate(-50%, -100%) translateY(-8px);
      background: var(--ngx-chart-tooltip-bg, rgba(15, 23, 42, 0.92));
      backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      color: var(--ngx-chart-tooltip-color, #f8fafc); padding: 10px 14px;
      border-radius: 10px; font-size: 12px; min-width: 150px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      z-index: 100;
      transition: left 0.12s cubic-bezier(0.16, 1, 0.3, 1), top 0.12s cubic-bezier(0.16, 1, 0.3, 1);
      font-family: inherit;
    }
    .tt-cat { font-weight: 700; margin-bottom: 8px; font-size: 12.5px; border-bottom: 1px solid rgba(255, 255, 255, 0.15); padding-bottom: 6px; color: #38bdf8; }
    .tt-row { display: flex; align-items: center; gap: 8px; margin-top: 5px; }
    .tt-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .tt-name { color: rgba(248, 250, 252, 0.8); flex: 1; }
    .tt-val { font-weight: 700; font-family: monospace; }

    /* Export styles */
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
      color: var(--primary-color, #4f46e5);
      border-color: var(--primary-color, #4f46e5);
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
      color: var(--primary-color, #4f46e5);
    }
    .chart-header { display: flex; justify-content: space-between; align-items: center; min-height: 24px; position: relative; }
  `]
})
export class AreaChartComponent {
  readonly PAD_LEFT = 48;
  readonly PAD_TOP = 12;
  readonly PAD_RIGHT = 16;
  readonly PAD_BOTTOM = 32;

  series = input<ChartSeries[]>([]);
  categories = input<string[]>([]);
  height = input<number>(260);
  showGrid = input<boolean>(true);
  showMarkers = input<boolean>(true);
  showLegend = input<boolean>(true);
  colors = input<string[]>(CHART_COLORS);
  showExport = input<boolean>(false);

  exportMenuOpen = signal(false);
  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  crosshair = signal<{ x: number } | null>(null);
  activeCategoryIndex = signal<number | null>(null);
  tooltip = signal<{ x: number; y: number; cat: string; rows: { name: string; value: number; color: string }[] } | null>(null);
  containerWidth = signal<number>(600);

  innerW = computed(() => this.containerWidth() - this.PAD_LEFT - this.PAD_RIGHT);
  innerH = computed(() => this.height() - this.PAD_TOP - this.PAD_BOTTOM);

  animateState = signal(false);

  constructor() {
    const hostEl = inject(ElementRef).nativeElement;
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(entries => {
        if (!entries || entries.length === 0) return;
        const width = entries[0].contentRect.width;
        if (width > 0) {
          // Subtract padding of .ngx-area-chart (20px on each side = 40px)
          this.containerWidth.set(width - 40);
        }
      });
      resizeObserver.observe(hostEl);
      inject(DestroyRef).onDestroy(() => resizeObserver.disconnect());
    }
    setTimeout(() => this.animateState.set(true), 50);
  }

  private allValues = computed(() => this.series().flatMap(s => s.data));
  private yMin = computed(() => Math.min(0, ...this.allValues()));
  private yMax = computed(() => Math.max(1, ...this.allValues()));
  yTicks = computed(() => niceTicks(this.yMin(), this.yMax(), 5));

  yPos(v: number): number { return scale(v, this.yMin(), this.yMax(), this.innerH(), 0); }
  xPos(i: number): number {
    const n = this.categories().length;
    return n <= 1 ? this.innerW() / 2 : scale(i, 0, n - 1, 0, this.innerW());
  }

  seriesColor(i: number, s: ChartSeries): string {
    return s.color || this.colors()[i % this.colors().length];
  }

  linePath(s: ChartSeries): string {
    const pts: [number, number][] = s.data.map((v, i) => [this.xPos(i), this.yPos(v)]);
    return smoothPath(pts);
  }

  areaPath(s: ChartSeries): string {
    const pts: [number, number][] = s.data.map((v, i) => [this.xPos(i), this.yPos(v)]);
    const line = smoothPath(pts);
    const last = pts[pts.length - 1];
    const first = pts[0];
    return line + ` L ${last[0]} ${this.innerH()} L ${first[0]} ${this.innerH()} Z`;
  }

  onMouseMove(event: MouseEvent): void {
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const mx = event.clientX - rect.left - this.PAD_LEFT;
    const cats = this.categories();
    if (cats.length === 0) return;
    const idx = Math.round(scale(mx, 0, this.innerW(), 0, cats.length - 1));
    const ci = Math.max(0, Math.min(cats.length - 1, idx));
    this.crosshair.set({ x: this.xPos(ci) });
    this.activeCategoryIndex.set(ci);
    const rows = this.series().map((s, si) => ({
      name: s.name,
      value: s.data[ci] ?? 0,
      color: this.seriesColor(si, s),
    }));
    this.tooltip.set({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      cat: cats[ci],
      rows,
    });
  }

  onMouseLeave(): void {
    this.crosshair.set(null);
    this.activeCategoryIndex.set(null);
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
    const cats = this.categories();
    const sers = this.series();
    if (!cats.length || !sers.length) return;

    let csv = 'Category,' + sers.map(s => `"${s.name}"`).join(',') + '\n';
    cats.forEach((cat, ci) => {
      const row = [cat];
      sers.forEach(s => {
        row.push(s.data[ci] !== undefined ? String(s.data[ci]) : '');
      });
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'area-chart-data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToJson(): void {
    const cats = this.categories();
    const sers = this.series();
    if (!cats.length || !sers.length) return;

    const data = cats.map((cat, ci) => {
      const entry: Record<string, string | number> = { category: cat };
      sers.forEach(s => {
        if (s.data[ci] !== undefined) {
          entry[s.name] = s.data[ci];
        }
      });
      return entry;
    });

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'area-chart-data.json');
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
    link.setAttribute('download', 'area-chart.svg');
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
        <title>Area Chart Export</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #0f172a; text-align: center; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 24px; text-align: left; }
          .title { font-size: 20px; font-weight: bold; }
          .date { font-size: 12px; color: #64748b; }
          .chart-container { display: inline-block; margin-top: 24px; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; background: #ffffff; width: 90%; }
          svg { width: 100%; height: auto; }
          .axis-label { font-size: 11px; fill: #6c757d; font-weight: 500; }
          @media print {
            body { padding: 0; }
            .chart-container { border: none; padding: 0; width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">Area Chart Analytics</div>
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

  readonly fmtNum = fmtNum;
}
