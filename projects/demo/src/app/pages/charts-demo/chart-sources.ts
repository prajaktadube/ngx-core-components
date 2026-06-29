// Auto-generated chart component sources for StackBlitz export

export const BarChartSource = `import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, viewChild, HostListener, inject, DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {  CHART_COLORS, ChartSeries, niceTicks, scale, fmtNum  } from './chart-utils';

@Component({
  selector: 'ngx-bar-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div
      class="ngx-bar-chart"
      (mousemove)="onMouseMove($event)"
      (mouseleave)="onMouseLeave()"
    >
      <!-- Toolbar with Export option -->
      <div class="chart-header">
        <div class="chart-title-space"></div>
        @if (showExport()) {
          <div class="chart-export-menu">
            <button class="export-trigger" (click)="toggleExportMenu($event)" aria-label="Export Menu">📤 Export</button>
            @if (exportMenuOpen()) {
              <div class="export-dropdown">
                <button (click)="onExport('json')">📊 Export JSON</button>
                <button (click)="onExport('csv')">📄 Export CSV</button>
                <button (click)="onExport('svg')">🖼️ Export SVG</button>
              </div>
            }
          </div>
        }
      </div>

      <!-- Legend -->
      @if (showLegend()) {
        <div class="chart-legend">
          @for (s of series(); track s.name; let i = $index) {
            <span class="legend-item">
              <span class="legend-dot" [style.background]="seriesColor(i)"></span>
              {{ s.name }}
            </span>
          }
        </div>
      }

      <!-- SVG Chart -->
      <svg
        #svgEl
        [attr.width]="'100%'"
        [attr.height]="chartHeight()"
        class="chart-svg"
      >
        <g [attr.transform]="'translate(' + PAD_LEFT + ',' + PAD_TOP + ')'">

          <!-- Y axis grid lines + labels -->
          @for (tick of yTicks(); track tick) {
            <g [attr.transform]="'translate(0,' + yPos(tick) + ')'">
              @if (showGrid()) {
                <line
                  [attr.x1]="0" [attr.x2]="innerW()"
                  stroke="var(--ngx-chart-grid, #ebedf0)" stroke-dasharray="3,3"
                />
              }
              <text x="-8" dy="4" class="axis-label" text-anchor="end">{{ fmtNum(tick) }}</text>
            </g>
          }

          <!-- Column Highlight Ruler (Enterprise interactive UX) -->
          @if (activeColumnIndex() !== null) {
            <rect
              [attr.x]="colStartX(activeColumnIndex()!)"
              [attr.y]="0"
              [attr.width]="groupW()"
              [attr.height]="innerH()"
              class="column-ruler"
            />
          }

          <!-- X axis category labels -->
          @for (cat of categories(); track cat; let i = $index) {
            <text
              [attr.x]="catMidX(i)"
              [attr.y]="innerH() + 16"
              class="axis-label"
              text-anchor="middle"
            >{{ cat }}</text>
          }

          <!-- Bars -->
          @for (s of series(); track s.name; let si = $index) {
            @for (v of s.data; track $index; let ci = $index) {
              @if (v !== null && v !== undefined) {
                <rect
                  [attr.x]="barX(ci, si)"
                  [attr.y]="barY(v)"
                  [attr.width]="singleBarWidth()"
                  [attr.height]="barH(v)"
                  [attr.fill]="barColor(si, s)"
                  [attr.rx]="3"
                  class="bar-rect"
                />
                @if (showLabels() && animateState()) {
                  <text
                    [attr.x]="barX(ci, si) + singleBarWidth() / 2"
                    [attr.y]="barY(v) - 4"
                    class="bar-label"
                    text-anchor="middle"
                  >{{ fmtNum(v) }}</text>
                }
              }
            }
          }

          <!-- Axes -->
          <line x1="0" [attr.x2]="innerW()" [attr.y1]="innerH()" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #ced4da)"/>
          <line x1="0" x2="0" y1="0" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #ced4da)"/>
        </g>
      </svg>

      <!-- Advanced Grouped Tooltip -->
      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
          <div class="tt-cat">{{ t.cat }}</div>
          @for (row of t.rows; track row.name) {
            <div class="tt-row">
              <span class="tt-dot" [style.background]="row.color"></span>
              <span class="tt-name">{{ row.name }}</span>
              <span class="tt-val">{{ fmtNum(row.value) }}</span>
            </div>
          }
        </div>
      }
    </div>
  \`,
  styles: [\`
    :host {
      display: block;
      position: relative;
    }
    .ngx-bar-chart { position: relative; background: var(--ngx-chart-bg, #fff); font-family: inherit; }
    .chart-header { display: flex; justify-content: space-between; align-items: center; min-height: 24px; position: relative; }
    .chart-legend { display: flex; gap: 16px; padding: 4px 0 12px; flex-wrap: wrap; }
    .legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--ngx-chart-axis-text, #6c757d); }
    .legend-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
    .chart-svg { display: block; overflow: visible; }
    .axis-label { font-size: 11px; fill: var(--ngx-chart-axis-text, #6c757d); user-select: none; }
    .column-ruler { fill: rgba(99, 102, 241, 0.04); border-radius: 4px; pointer-events: none; transition: x 0.15s cubic-bezier(0.16, 1, 0.3, 1); }
    
    .bar-rect {
      cursor: pointer;
      transition: y 0.5s cubic-bezier(0.16, 1, 0.3, 1), height 0.5s cubic-bezier(0.16, 1, 0.3, 1), fill-opacity 0.15s;
    }
    .bar-rect:hover { fill-opacity: 0.85; }
    .bar-label { font-size: 11px; fill: var(--ngx-chart-axis-text, #6c757d); pointer-events: none; }
    
    /* Premium Glassmorphic Tooltip */
    .chart-tooltip {
      position: absolute; pointer-events: none; transform: translate(-50%, -100%) translateY(-8px);
      background: var(--ngx-chart-tooltip-bg, rgba(30, 41, 59, 0.85));
      backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      color: var(--ngx-chart-tooltip-color, #fff); padding: 8px 12px;
      border-radius: 8px; font-size: 12px; min-width: 140px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.15), 0 4px 6px -4px rgba(0,0,0,0.1);
      border: 1px solid rgba(255, 255, 255, 0.1);
      z-index: 100;
      transition: left 0.15s cubic-bezier(0.16, 1, 0.3, 1), top 0.15s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .tt-cat { font-weight: 700; margin-bottom: 6px; font-size: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.12); padding-bottom: 4px; }
    .tt-row { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
    .tt-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .tt-name { color: rgba(255, 255, 255, 0.8); flex: 1; }
    .tt-val { font-weight: 700; }

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
  \`]
})
export class BarChartComponent {
  readonly PAD_LEFT = 48;
  readonly PAD_TOP = 12;
  readonly PAD_RIGHT = 16;
  readonly PAD_BOTTOM = 32;

  series = input<ChartSeries[]>([]);
  categories = input<string[]>([]);
  height = input<number>(260);
  showGrid = input<boolean>(true);
  showLabels = input<boolean>(false);
  showLegend = input<boolean>(true);
  colors = input<string[]>(CHART_COLORS);
  showExport = input<boolean>(false);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  exportMenuOpen = signal(false);
  animateState = signal(false);
  activeColumnIndex = signal<number | null>(null);
  containerWidth = signal<number>(600);

  tooltip = signal<{ x: number; y: number; cat: string; rows: { name: string; value: number; color: string }[] } | null>(null);

  chartHeight = computed(() => this.height());
  innerW = computed(() => this.containerWidth() - this.PAD_LEFT - this.PAD_RIGHT);
  innerH = computed(() => this.chartHeight() - this.PAD_TOP - this.PAD_BOTTOM);

  private allValues = computed(() => this.series().flatMap(s => s.data.filter(v => v != null)));
  private yMin = computed(() => Math.min(0, ...this.allValues()));
  private yMax = computed(() => Math.max(1, ...this.allValues()));
  yTicks = computed(() => niceTicks(this.yMin(), this.yMax(), 5));

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
    // Start growth load animations
    setTimeout(() => this.animateState.set(true), 50);
  }

  yPos(v: number): number {
    return scale(v, this.yMin(), this.yMax(), this.innerH(), 0);
  }

  barY(v: number): number {
    if (!this.animateState()) return this.yPos(0);
    return Math.min(this.yPos(0), this.yPos(v));
  }

  barH(v: number): number {
    if (!this.animateState()) return 0;
    return Math.abs(this.yPos(0) - this.yPos(v));
  }

  groupW = computed(() => this.categories().length > 0 ? this.innerW() / this.categories().length : 0);
  
  singleBarWidth = computed(() => {
    const n = this.series().length || 1;
    return Math.max(4, (this.groupW() - 8) / n);
  });

  catMidX(i: number): number { return i * this.groupW() + this.groupW() / 2; }
  
  barX(ci: number, si: number): number {
    const n = this.series().length;
    const gx = ci * this.groupW() + 4;
    return gx + si * this.singleBarWidth();
  }

  colStartX(i: number): number {
    return i * this.groupW();
  }

  seriesColor(i: number): string { return this.colors()[i % this.colors().length]; }
  barColor(si: number, s: ChartSeries): string { return s.color || this.seriesColor(si); }

  onMouseMove(event: MouseEvent): void {
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const mx = event.clientX - rect.left - this.PAD_LEFT;
    const cats = this.categories();
    if (cats.length === 0) return;

    // Determine hover category column index
    const idx = Math.floor(mx / this.groupW());
    const ci = Math.max(0, Math.min(cats.length - 1, idx));

    this.activeColumnIndex.set(ci);

    const rows = this.series().map((s, si) => ({
      name: s.name,
      value: s.data[ci] ?? 0,
      color: this.barColor(si, s),
    }));

    this.tooltip.set({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      cat: cats[ci],
      rows
    });
  }

  onMouseLeave(): void {
    this.activeColumnIndex.set(null);
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

  onExport(type: 'json' | 'csv' | 'svg'): void {
    this.exportMenuOpen.set(false);
    if (type === 'json') this.exportToJson();
    else if (type === 'csv') this.exportToCsv();
    else if (type === 'svg') this.exportToSvg();
  }

  exportToCsv(): void {
    const cats = this.categories();
    const sers = this.series();
    if (!cats.length || !sers.length) return;

    let csv = 'Category,' + sers.map(s => \`"\${s.name}"\`).join(',') + '\n';
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
    link.setAttribute('download', 'bar-chart-data.csv');
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
    link.setAttribute('download', 'bar-chart-data.json');
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
    link.setAttribute('download', 'bar-chart.svg');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  readonly fmtNum = fmtNum;
}
`;

export const LineChartSource = `import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, viewChild, HostListener, inject, DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {  CHART_COLORS, ChartSeries, niceTicks, scale, smoothPath, fmtNum  } from './chart-utils';

@Component({
  selector: 'ngx-line-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div
      class="ngx-line-chart"
      (mousemove)="onMouseMove($event)"
      (mouseleave)="onMouseLeave()"
    >
      <!-- Toolbar with Export option -->
      <div class="chart-header">
        <div class="chart-title-space"></div>
        @if (showExport()) {
          <div class="chart-export-menu">
            <button class="export-trigger" (click)="toggleExportMenu($event)" aria-label="Export Menu">📤 Export</button>
            @if (exportMenuOpen()) {
              <div class="export-dropdown">
                <button (click)="onExport('json')">📊 Export JSON</button>
                <button (click)="onExport('csv')">📄 Export CSV</button>
                <button (click)="onExport('svg')">🖼️ Export SVG</button>
              </div>
            }
          </div>
        }
      </div>

      <!-- Legend -->
      @if (showLegend()) {
        <div class="chart-legend">
          @for (s of series(); track s.name; let i = $index) {
            <span class="legend-item">
              <span class="legend-line" [style.background]="seriesColor(i, s)"></span>
              {{ s.name }}
            </span>
          }
        </div>
      }

      <!-- SVG Chart -->
      <svg
        #svgEl
        [attr.width]="'100%'"
        [attr.height]="chartHeight()"
        class="chart-svg"
      >
        <defs>
          @for (s of series(); track s.name; let i = $index) {
            <linearGradient [attr.id]="'area-grad-' + i" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" [attr.stop-color]="seriesColor(i, s)" stop-opacity="0.3"/>
              <stop offset="100%" [attr.stop-color]="seriesColor(i, s)" stop-opacity="0.02"/>
            </linearGradient>
          }
        </defs>
        <g [attr.transform]="'translate(' + PAD_LEFT + ',' + PAD_TOP + ')'">

          <!-- Y axis ticks and gridlines -->
          @for (tick of yTicks(); track tick) {
            <g [attr.transform]="'translate(0,' + yPos(tick) + ')'">
              @if (showGrid()) {
                <line [attr.x1]="0" [attr.x2]="innerW()" stroke="var(--ngx-chart-grid,#ebedf0)" stroke-dasharray="3,3"/>
              }
              <text x="-8" dy="4" class="axis-label" text-anchor="end">{{ fmtNum(tick) }}</text>
            </g>
          }

          <!-- X axis category labels -->
          @for (cat of categories(); track cat; let i = $index) {
            <text [attr.x]="xPos(i)" [attr.y]="innerH() + 16" class="axis-label" text-anchor="middle">{{ cat }}</text>
          }

          <!-- Lines and Areas -->
          @for (s of series(); track s.name; let si = $index) {
            @if (showArea()) {
              <path
                [attr.d]="areaPath(s)"
                [attr.fill]="'url(#area-grad-' + si + ')'"
                stroke="none"
                class="area-path"
              />
            }
            <path
              [attr.d]="linePath(s)"
              [attr.stroke]="seriesColor(si, s)"
              fill="none"
              stroke-width="2.5"
              stroke-linejoin="round"
              stroke-linecap="round"
              class="line-path"
            />
            @if (showMarkers() && animateState()) {
              @for (v of s.data; track $index; let ci = $index) {
                <circle
                  [attr.cx]="xPos(ci)"
                  [attr.cy]="yPos(v)"
                  r="4"
                  [attr.fill]="seriesColor(si, s)"
                  stroke="#fff"
                  stroke-width="2"
                  class="marker-dot"
                />
              }
            }
          }

          <!-- Crosshair -->
          @if (crosshair(); as ch) {
            <line [attr.x1]="ch.x" [attr.x2]="ch.x" y1="0" [attr.y2]="innerH()"
              stroke="var(--ngx-chart-axis,#ced4da)" stroke-dasharray="4,3" class="chart-crosshair"/>
          }

          <line x1="0" [attr.x2]="innerW()" [attr.y1]="innerH()" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis,#ced4da)"/>
          <line x1="0" x2="0" y1="0" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis,#ced4da)"/>
        </g>
      </svg>

      <!-- Premium Glassmorphic Tooltip -->
      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
          <div class="tt-cat">{{ t.cat }}</div>
          @for (row of t.rows; track row.name) {
            <div class="tt-row">
              <span class="tt-dot" [style.background]="row.color"></span>
              <span class="tt-name">{{ row.name }}</span>
              <span class="tt-val">{{ fmtNum(row.value) }}</span>
            </div>
          }
        </div>
      }
    </div>
  \`,
  styles: [\`
    :host {
      display: block;
      position: relative;
    }
    .ngx-line-chart { position: relative; background: var(--ngx-chart-bg, #fff); }
    .chart-header { display: flex; justify-content: space-between; align-items: center; min-height: 24px; position: relative; }
    .chart-legend { display: flex; gap: 16px; padding: 4px 0 12px; flex-wrap: wrap; }
    .legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--ngx-chart-axis-text,#6c757d); }
    .legend-line { width: 20px; height: 3px; border-radius: 2px; display: inline-block; }
    .chart-svg { display: block; overflow: visible; cursor: crosshair; }
    .axis-label { font-size: 11px; fill: var(--ngx-chart-axis-text,#6c757d); user-select: none; }
    .chart-crosshair { transition: x1 0.12s cubic-bezier(0.16, 1, 0.3, 1), x2 0.12s cubic-bezier(0.16, 1, 0.3, 1); }

    /* Keyframe Line draw transition */
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
    }

    /* Premium Glassmorphic Tooltip */
    .chart-tooltip {
      position: absolute; pointer-events: none; transform: translate(-50%, -100%) translateY(-8px);
      background: var(--ngx-chart-tooltip-bg, rgba(30, 41, 59, 0.85));
      backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      color: var(--ngx-chart-tooltip-color, #fff); padding: 8px 12px;
      border-radius: 8px; font-size: 12px; min-width: 140px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.15), 0 4px 6px -4px rgba(0,0,0,0.1);
      border: 1px solid rgba(255, 255, 255, 0.1);
      z-index: 100;
      transition: left 0.12s cubic-bezier(0.16, 1, 0.3, 1), top 0.12s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .tt-cat { font-weight: 700; margin-bottom: 6px; font-size: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.12); padding-bottom: 4px; }
    .tt-row { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
    .tt-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .tt-name { color: rgba(255, 255, 255, 0.8); flex: 1; }
    .tt-val { font-weight: 700; }

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
  \`]
})
export class LineChartComponent {
  readonly PAD_LEFT = 48;
  readonly PAD_TOP = 12;
  readonly PAD_RIGHT = 16;
  readonly PAD_BOTTOM = 32;

  series = input<ChartSeries[]>([]);
  categories = input<string[]>([]);
  height = input<number>(260);
  showGrid = input<boolean>(true);
  showArea = input<boolean>(false);
  showMarkers = input<boolean>(true);
  showLegend = input<boolean>(true);
  colors = input<string[]>(CHART_COLORS);
  showExport = input<boolean>(false);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  exportMenuOpen = signal(false);
  animateState = signal(false);
  containerWidth = signal<number>(600);

  crosshair = signal<{ x: number } | null>(null);
  tooltip = signal<{ x: number; y: number; cat: string; rows: {name:string;value:number;color:string}[] } | null>(null);

  chartHeight = computed(() => this.height());
  innerW = computed(() => this.containerWidth() - this.PAD_LEFT - this.PAD_RIGHT);
  innerH = computed(() => this.chartHeight() - this.PAD_TOP - this.PAD_BOTTOM);

  private allValues = computed(() => this.series().flatMap(s => s.data));
  private yMin = computed(() => Math.min(0, ...this.allValues()));
  private yMax = computed(() => Math.max(1, ...this.allValues()));
  yTicks = computed(() => niceTicks(this.yMin(), this.yMax(), 5));

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
    setTimeout(() => this.animateState.set(true), 50);
  }

  yPos(v: number): number { return scale(v, this.yMin(), this.yMax(), this.innerH(), 0); }
  xPos(i: number): number {
    const n = this.categories().length;
    return n <= 1 ? this.innerW() / 2 : scale(i, 0, n - 1, 0, this.innerW());
  }

  seriesColor(i: number, s: ChartSeries): string { return s.color || this.colors()[i % this.colors().length]; }

  linePath(s: ChartSeries): string {
    const pts: [number, number][] = s.data.map((v, i) => [this.xPos(i), this.yPos(v)]);
    return smoothPath(pts);
  }

  areaPath(s: ChartSeries): string {
    const pts: [number, number][] = s.data.map((v, i) => [this.xPos(i), this.yPos(v)]);
    const line = smoothPath(pts);
    const last = pts[pts.length - 1];
    const first = pts[0];
    return line + \` L \${last[0]} \${this.innerH()} L \${first[0]} \${this.innerH()} Z\`;
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

  onExport(type: 'json' | 'csv' | 'svg'): void {
    this.exportMenuOpen.set(false);
    if (type === 'json') this.exportToJson();
    else if (type === 'csv') this.exportToCsv();
    else if (type === 'svg') this.exportToSvg();
  }

  exportToCsv(): void {
    const cats = this.categories();
    const sers = this.series();
    if (!cats.length || !sers.length) return;

    let csv = 'Category,' + sers.map(s => \`"\${s.name}"\`).join(',') + '\n';
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
    link.setAttribute('download', 'line-chart-data.csv');
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
    link.setAttribute('download', 'line-chart-data.json');
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
    link.setAttribute('download', 'line-chart.svg');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  readonly fmtNum = fmtNum;
}
`;

export const PieDonutSource = `import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, viewChild, HostListener, inject, DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {  CHART_COLORS, ChartDataPoint, fmtNum  } from './chart-utils';

@Component({
  selector: 'ngx-pie-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="ngx-pie-chart">
      <!-- Toolbar with Export option -->
      <div class="chart-header">
        <div class="chart-title-space"></div>
        @if (showExport()) {
          <div class="chart-export-menu">
            <button class="export-trigger" (click)="toggleExportMenu($event)" aria-label="Export Menu">📤 Export</button>
            @if (exportMenuOpen()) {
              <div class="export-dropdown">
                <button (click)="onExport('json')">📊 Export JSON</button>
                <button (click)="onExport('csv')">📄 Export CSV</button>
                <button (click)="onExport('svg')">🖼️ Export SVG</button>
              </div>
            }
          </div>
        }
      </div>

      <div class="chart-body">
        <svg
          #svgEl
          class="chart-svg"
          [attr.viewBox]="'0 0 ' + height() + ' ' + height()"
          [attr.width]="height()"
          [attr.height]="height()"
        >
          <g [attr.transform]="'translate(' + cx() + ',' + cy() + ')'" class="pie-group">
            @for (slice of slices(); track slice.index) {
              <path
                [attr.d]="slice.path"
                [attr.fill]="slice.color"
                [attr.stroke]="'#fff'"
                stroke-width="2"
                class="pie-slice"
                [class.hovered]="hovered() === slice.index"
                (mouseenter)="hovered.set(slice.index); onSliceHover($event, slice)"
                (mouseleave)="hovered.set(-1); tooltip.set(null)"
              />
              @if (showLabels() && slice.midAngle !== null) {
                <text
                  [attr.x]="labelX(slice)"
                  [attr.y]="labelY(slice)"
                  text-anchor="middle"
                  dominant-baseline="middle"
                  class="slice-label"
                >{{ slice.pct }}%</text>
              }
            }
            <!-- Donut hole -->
            @if (mode() === 'donut') {
              <text class="donut-center-text" text-anchor="middle" dy="-8">{{ centerTitle() }}</text>
              <text class="donut-center-value" text-anchor="middle" dy="14">{{ centerValue() }}</text>
            }
          </g>
        </svg>

        @if (showLegend()) {
          <div class="chart-legend">
            @for (slice of slices(); track slice.index) {
              <div class="legend-item" (mouseenter)="hovered.set(slice.index)" (mouseleave)="hovered.set(-1)">
                <span class="legend-dot" [style.background]="slice.color"></span>
                <span class="legend-label">{{ slice.label }}</span>
                <span class="legend-pct">{{ slice.pct }}%</span>
              </div>
            }
          </div>
        }
      </div>

      <!-- Premium Glassmorphic Tooltip -->
      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
          <span class="tt-dot" [style.background]="t.color"></span>
          <strong>{{ t.label }}</strong>: {{ fmtNum(t.value) }} ({{ t.pct }}%)
        </div>
      }
    </div>
  \`,
  styles: [\`
    :host {
      display: block;
      position: relative;
    }
    .ngx-pie-chart {
      position: relative;
      background: var(--ngx-chart-bg, #fff);
      font-family: inherit;
      overflow: hidden;
    }
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      min-height: 24px;
      position: relative;
    }
    .chart-body {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 24px;
      flex-wrap: wrap;
    }
    /* SVG uses explicit width/height attrs for intrinsic size;
       max-width: 100% + min-width: 0 lets it shrink inside flex. */
    .chart-svg {
      display: block;
      max-width: 100%;
      height: auto;
      min-width: 0;
    }

    @keyframes pieGrow {
      from { transform: scale(0.4) rotate(-90deg); opacity: 0; }
      to { transform: scale(1) rotate(0); opacity: 1; }
    }
    .pie-group {
      animation: pieGrow 0.75s cubic-bezier(0.16, 1, 0.3, 1) both;
      transform-box: fill-box;
      transform-origin: center;
    }

    .pie-slice {
      cursor: pointer;
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), fill-opacity 0.15s;
      transform-origin: 0px 0px;
    }
    .pie-slice.hovered { transform: scale(1.04); fill-opacity: 0.9; }
    .slice-label { font-size: 11px; fill: #fff; font-weight: 600; pointer-events: none; user-select: none; }
    .donut-center-text { font-size: 12px; fill: var(--ngx-chart-axis-text,#6c757d); font-weight: 500; }
    .donut-center-value { font-size: 20px; font-weight: 800; fill: var(--ngx-chart-text,#212529); }
    .chart-legend { display: flex; flex-direction: column; gap: 6px; flex-shrink: 0; }
    .legend-item { display: flex; align-items: center; gap: 8px; font-size: 12px; cursor: pointer; padding: 4px 8px; border-radius: 6px; transition: all 0.15s; }
    .legend-item:hover { background: var(--ngx-chart-grid,#f1f3f5); }
    .legend-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
    .legend-label { flex: 1; color: var(--ngx-chart-axis-text,#6c757d); }
    .legend-pct { font-weight: 600; color: var(--ngx-chart-text,#212529); }

    /* Premium Glassmorphic Tooltip */
    .chart-tooltip {
      position: absolute; pointer-events: none; transform: translate(-50%, -100%) translateY(-8px);
      background: var(--ngx-chart-tooltip-bg, rgba(30, 41, 59, 0.85));
      backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      color: var(--ngx-chart-tooltip-color, #fff); padding: 8px 12px;
      border-radius: 8px; font-size: 12px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.15), 0 4px 6px -4px rgba(0,0,0,0.1);
      border: 1px solid rgba(255, 255, 255, 0.1);
      z-index: 100;
      display: flex; align-items: center; gap: 6px;
      transition: left 0.15s cubic-bezier(0.16, 1, 0.3, 1), top 0.15s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .tt-dot { width: 8px; height: 8px; border-radius: 50%; }

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
  \`]
})
export class PieChartComponent {
  data = input<ChartDataPoint[]>([]);
  mode = input<'pie' | 'donut'>('pie');
  donutHoleSize = input<number>(0.55);
  height = input<number>(240);
  showLegend = input<boolean>(true);
  showLabels = input<boolean>(true);
  colors = input<string[]>(CHART_COLORS);
  centerTitle = input<string>('Total');
  showExport = input<boolean>(false);
  colors$ = this.colors;

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  exportMenuOpen = signal(false);
  hovered = signal(-1);
  tooltip = signal<{x:number;y:number;label:string;value:number;pct:number;color:string}|null>(null);

  svgSize = computed(() => this.height());
  cx = computed(() => this.svgSize() / 2);
  cy = computed(() => this.svgSize() / 2);
  radius = computed(() => this.svgSize() / 2 - 10);
  holeR = computed(() => this.radius() * this.donutHoleSize());

  constructor() {}

  centerValue = computed(() => {
    const total = this.data().reduce((s, d) => s + d.value, 0);
    return fmtNum(total);
  });

  slices = computed(() => {
    const d = this.data();
    const total = d.reduce((s, x) => s + x.value, 0) || 1;
    let start = -Math.PI / 2;
    return d.map((item, i) => {
      const frac = item.value / total;
      let angle = frac * Math.PI * 2;
      // Cap angle slightly if it is a full circle to prevent coinciding SVG endpoints
      if (frac >= 0.999) {
        angle = Math.PI * 2 - 0.0001;
      }
      const end = start + angle;
      const mid = start + angle / 2;
      const r = this.radius();
      const path = this.mode() === 'donut'
        ? this.ringPath(start, end, r, this.holeR())
        : this.arcPath(start, end, r);
      start = end;
      return {
        index: i,
        label: item.label,
        value: item.value,
        pct: Math.round(frac * 100),
        color: item.color || this.colors()[i % this.colors().length],
        path,
        midAngle: mid,
      };
    });
  });

  private arcPath(startAngle: number, endAngle: number, r: number): string {
    const x1 = Math.cos(startAngle) * r;
    const y1 = Math.sin(startAngle) * r;
    const x2 = Math.cos(endAngle) * r;
    const y2 = Math.sin(endAngle) * r;
    const large = endAngle - startAngle > Math.PI ? 1 : 0;
    return \`M 0 0 L \${x1} \${y1} A \${r} \${r} 0 \${large} 1 \${x2} \${y2} Z\`;
  }

  private ringPath(startAngle: number, endAngle: number, outerR: number, innerR: number): string {
    const ox1 = Math.cos(startAngle) * outerR;
    const oy1 = Math.sin(startAngle) * outerR;
    const ox2 = Math.cos(endAngle) * outerR;
    const oy2 = Math.sin(endAngle) * outerR;

    const ix1 = Math.cos(startAngle) * innerR;
    const iy1 = Math.sin(startAngle) * innerR;
    const ix2 = Math.cos(endAngle) * innerR;
    const iy2 = Math.sin(endAngle) * innerR;

    const large = endAngle - startAngle > Math.PI ? 1 : 0;
    return \`M \${ix1} \${iy1} L \${ox1} \${oy1} A \${outerR} \${outerR} 0 \${large} 1 \${ox2} \${oy2} L \${ix2} \${iy2} A \${innerR} \${innerR} 0 \${large} 0 \${ix1} \${iy1} Z\`;
  }

  labelX(s: {midAngle:number}): number {
    const r = this.mode() === 'donut' ? (this.radius() + this.holeR()) / 2 : this.radius() * 0.7;
    return Math.cos(s.midAngle) * r;
  }
  labelY(s: {midAngle:number}): number {
    const r = this.mode() === 'donut' ? (this.radius() + this.holeR()) / 2 : this.radius() * 0.7;
    return Math.sin(s.midAngle) * r;
  }

  onSliceHover(event: MouseEvent, slice: {label:string;value:number;pct:number;color:string}): void {
    const el = (event.currentTarget as HTMLElement).closest('.ngx-pie-chart') as HTMLElement;
    const rect = el.getBoundingClientRect();
    this.tooltip.set({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      ...slice,
    });
  }

  toggleExportMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.exportMenuOpen.set(!this.exportMenuOpen());
  }

  @HostListener('document:click')
  closeExportMenu(): void {
    this.exportMenuOpen.set(false);
  }

  onExport(type: 'json' | 'csv' | 'svg'): void {
    this.exportMenuOpen.set(false);
    if (type === 'json') this.exportToJson();
    else if (type === 'csv') this.exportToCsv();
    else if (type === 'svg') this.exportToSvg();
  }

  exportToCsv(): void {
    const data = this.data();
    if (!data.length) return;
    let csv = 'Label,Value\n';
    data.forEach(d => {
      csv += \`"\${d.label}",\${d.value}\n\`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'pie-chart-data.csv');
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
    link.setAttribute('download', 'pie-chart-data.json');
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
    link.setAttribute('download', 'pie-chart.svg');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  readonly fmtNum = fmtNum;
}
`;

export const SparklineSource = `import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import {  CHART_COLORS, scale, smoothPath  } from './chart-utils';

@Component({
  selector: 'ngx-sparkline',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <svg
      [attr.width]="width()"
      [attr.height]="height()"
      class="ngx-sparkline"
      [attr.aria-label]="'Sparkline'"
    >
      @if (type() === 'line' || type() === 'area') {
        @if (type() === 'area') {
          <path [attr.d]="areaPath()" [attr.fill]="areaFill()" stroke="none"/>
        }
        <path
          [attr.d]="linePath()"
          [attr.stroke]="color()"
          fill="none"
          stroke-width="2"
          stroke-linejoin="round"
          stroke-linecap="round"
        />
        <!-- End dot -->
        @if (endPoint(); as ep) {
          <circle [attr.cx]="ep[0]" [attr.cy]="ep[1]" r="3" [attr.fill]="color()"/>
        }
      }
      @if (type() === 'bar') {
        @for (item of barItems(); track $index) {
          <rect
            [attr.x]="item.x"
            [attr.y]="item.y"
            [attr.width]="item.w"
            [attr.height]="item.h"
            [attr.fill]="color()"
            [attr.rx]="1"
            opacity="0.85"
          />
        }
      }
    </svg>
  \`,
  styles: [\`:host { display: inline-block; } .ngx-sparkline { display: block; }\`]
})
export class SparklineComponent {
  data = input<number[]>([]);
  type = input<'line' | 'bar' | 'area'>('line');
  color = input<string>(CHART_COLORS[0]);
  width = input<number>(120);
  height = input<number>(36);

  private PAD = 2;

  private w = computed(() => this.width() - this.PAD * 2);
  private h = computed(() => this.height() - this.PAD * 2);

  private yMin = computed(() => Math.min(...this.data(), 0));
  private yMax = computed(() => Math.max(...this.data(), 1));

  private pts = computed<[number, number][]>(() => {
    const d = this.data();
    const n = d.length;
    if (n === 0) return [];
    return d.map((v, i) => [
      this.PAD + scale(i, 0, Math.max(n - 1, 1), 0, this.w()),
      this.PAD + scale(v, this.yMin(), this.yMax(), this.h(), 0),
    ]);
  });

  linePath = computed(() => smoothPath(this.pts()));

  areaPath = computed(() => {
    const pts = this.pts();
    if (pts.length < 2) return '';
    const line = smoothPath(pts);
    const last = pts[pts.length - 1];
    const first = pts[0];
    const bottom = this.PAD + this.h();
    return line + \` L \${last[0]} \${bottom} L \${first[0]} \${bottom} Z\`;
  });

  areaFill = computed(() => this.color() + '22');

  endPoint = computed<[number, number] | null>(() => {
    const pts = this.pts();
    return pts.length > 0 ? pts[pts.length - 1] : null;
  });

  barItems = computed(() => {
    const d = this.data();
    const n = d.length;
    if (n === 0) return [];
    const bw = Math.max(2, this.w() / n - 1);
    const zero = this.PAD + scale(0, this.yMin(), this.yMax(), this.h(), 0);
    return d.map((v, i) => {
      const x = this.PAD + scale(i, 0, Math.max(n - 1, 1), 0, this.w()) - bw / 2;
      const y = this.PAD + scale(v, this.yMin(), this.yMax(), this.h(), 0);
      return { x, y, w: bw, h: Math.abs(zero - y) };
    });
  });
}
`;

export const GaugeChartSource = `import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface GaugeThreshold {
  value: number; // The threshold limit (inclusive upper boundary)
  color: string; // The color associated with this threshold
}

@Component({
  selector: 'ngx-gauge-chart',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div class="ngx-gauge-wrapper">
      <div class="ngx-gauge-container">
        <!-- SVG Gauge dial -->
        <svg
          class="ngx-gauge-svg"
          viewBox="0 0 200 200"
        >
          <!-- Background track arc -->
          <path
            [attr.d]="backgroundArcPath()"
            fill="none"
            stroke="var(--border-light, #f1f5f9)"
            stroke-width="14"
            stroke-linecap="round"
          />

          <!-- Colored progress arc -->
          <path
            [attr.d]="progressArcPath()"
            fill="none"
            [attr.stroke]="gaugeColor()"
            stroke-width="14"
            stroke-linecap="round"
            class="progress-arc"
          />

          <!-- Needle / Indicator dial -->
          @if (showNeedle()) {
            <g [attr.transform]="needleTransformString()" class="gauge-needle-group">
              <!-- Needle path pointing straight up (0 deg is relative to -90 deg rotation) -->
              <path
                d="M 100 100 L 96 35 L 100 25 L 104 35 Z"
                [attr.fill]="gaugeColor()"
                class="gauge-needle"
              />
              <circle
                cx="100"
                cy="100"
                r="8"
                [attr.fill]="gaugeColor()"
                stroke="var(--bg-secondary, #ffffff)"
                stroke-width="2.5"
              />
            </g>
          }
        </svg>

        <!-- Center values badge -->
        <div class="gauge-center-badge" [class.semi-mode]="type() === 'semi'">
          <div class="gauge-value" [style.color]="gaugeColor()">{{ value().toLocaleString() }}</div>
          @if (label()) {
            <div class="gauge-label">{{ label() }}</div>
          }
        </div>
      </div>
    </div>
  \`,
  styles: [\`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .ngx-gauge-wrapper {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 12px;
      box-shadow: var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05));
    }

    .ngx-gauge-container {
      position: relative;
      width: 100%;
      max-width: 240px;
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ngx-gauge-svg {
      width: 100%;
      height: 100%;
    }

    /* Arcs transition */
    .progress-arc {
      transition: stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.3s ease;
    }

    /* Needle transition animations */
    .gauge-needle-group {
      transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      transform-origin: 100px 100px;
    }
    .gauge-needle {
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));
    }

    /* Center Value Indicator */
    .gauge-center-badge {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      pointer-events: none;
      z-index: 2;
    }
    .gauge-center-badge.semi-mode {
      transform: translateY(18px);
    }

    .gauge-value {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.8px;
      line-height: 1;
      transition: color 0.3s ease;
      font-family: var(--ngx-heading-font-family, inherit);
    }
    .gauge-label {
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 700;
      color: var(--text-secondary, #64748b);
      letter-spacing: 0.5px;
      margin-top: 4px;
    }
  \`]
})
export class GaugeChartComponent {
  // Input Configs
  value = input.required<number>();
  min = input<number>(0);
  max = input<number>(100);
  label = input<string>('');
  type = input<'full' | 'semi'>('semi'); // 'full' is 280deg, 'semi' is 180deg
  showNeedle = input<boolean>(true);
  color = input<string>('var(--primary-color, #4f46e5)');
  thresholds = input<GaugeThreshold[]>([]);

  // Gauge angles definitions
  // 0 deg in polar is to the right (3 o'clock). 90 deg is straight down (6 o'clock).
  // A standard semi-circle speedometer goes from 180deg (left, 9 o'clock) to 360deg (right, 3 o'clock).
  // A full dial goes from 135deg (bottom-left) to 405deg (bottom-right).
  startAngle = computed(() => {
    return this.type() === 'semi' ? 180 : 135;
  });

  endAngle = computed(() => {
    return this.type() === 'semi' ? 360 : 405;
  });

  // Calculate coordinates and build path for background track
  backgroundArcPath = computed(() => {
    return this.describeArc(100, 100, 72, this.startAngle(), this.endAngle());
  });

  // Calculate current value angle and build path for progress fill
  progressArcPath = computed(() => {
    const minVal = this.min();
    const maxVal = this.max();
    const currentVal = Math.max(minVal, Math.min(maxVal, this.value()));
    const range = maxVal - minVal;
    const fraction = range === 0 ? 0 : (currentVal - minVal) / range;

    const angleRange = this.endAngle() - this.startAngle();
    const targetAngle = this.startAngle() + angleRange * fraction;

    return this.describeArc(100, 100, 72, this.startAngle(), targetAngle);
  });

  // Needle rotation calculation
  needleTransformString = computed(() => {
    const minVal = this.min();
    const maxVal = this.max();
    const currentVal = Math.max(minVal, Math.min(maxVal, this.value()));
    const range = maxVal - minVal;
    const fraction = range === 0 ? 0 : (currentVal - minVal) / range;

    const angleRange = this.endAngle() - this.startAngle();
    const angle = this.startAngle() + angleRange * fraction;

    // Needle points straight up at -90 deg rotation, so we offset by -90
    const rotateAngle = angle - 270;
    return \`rotate(\${rotateAngle})\`;
  });

  // Evaluate the gauge color depending on bound thresholds
  gaugeColor = computed(() => {
    const val = this.value();
    const thresholdList = this.thresholds();

    if (thresholdList.length === 0) {
      return this.color();
    }

    // Sort thresholds ascending
    const sorted = [...thresholdList].sort((a, b) => a.value - b.value);
    
    // Find the first threshold color where values exceed the limit
    for (const t of sorted) {
      if (val <= t.value) {
        return t.color;
      }
    }

    // Default to the last threshold color if value exceeds all thresholds
    return sorted[sorted.length - 1].color;
  });

  // Polar to Cartesian Math helpers
  private polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  }

  private describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number): string {
    const start = this.polarToCartesian(x, y, radius, endAngle);
    const end = this.polarToCartesian(x, y, radius, startAngle);

    // If starting and ending angle range exceeds 180 degrees, set largeArcFlag
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return [
      'M', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(' ');
  }
}
`;

export const RadarChartSource = `import { Component, input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface RadarSeries {
  label: string;
  values: number[]; // Array of values corresponding to categories
}

@Component({
  selector: 'ngx-radar-chart',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div class="ngx-radar-wrapper">
      <!-- Radar Chart Visual Panel -->
      <div class="ngx-radar-container">
        <svg
          class="ngx-radar-svg"
          viewBox="0 0 220 220"
        >
          <!-- Concentric polygon grids (web rings) -->
          @for (ring of gridRings(); track ring) {
            <polygon
              [attr.points]="getRingPoints(ring)"
              fill="none"
              stroke="var(--border-light, #f1f5f9)"
              stroke-width="1"
            />
          }

          <!-- Axis lines projecting out to categories -->
          @for (axis of axes(); track $index) {
            <line
              [attr.x1]="110"
              [attr.y1]="110"
              [attr.x2]="axis.x"
              [attr.y2]="axis.y"
              stroke="var(--border-color, #e2e8f0)"
              stroke-width="1.2"
              stroke-dasharray="2,2"
            />
            <!-- Category Label text positions -->
            <text
              [attr.x]="axis.labelX"
              [attr.y]="axis.labelY"
              [attr.text-anchor]="axis.align"
              class="axis-label"
            >
              {{ categories()[$index] }}
            </text>
          }

          <!-- Radar polygon areas representing series -->
          @for (series of seriesData(); track series.label; let sIdx = $index) {
            <polygon
              [attr.points]="getSeriesPoints(series)"
              [attr.fill]="getSeriesColor(sIdx, 0.15)"
              [attr.stroke]="getSeriesColor(sIdx, 1)"
              stroke-width="2.5"
              class="radar-polygon"
              [class.active]="hoveredSeries() === series.label"
              (mouseenter)="hoveredSeries.set(series.label)"
              (mouseleave)="hoveredSeries.set(null)"
            />

            <!-- Plot data dots on points -->
            @for (pt of getSeriesPointList(series); track $index) {
              <circle
                [attr.cx]="pt.x"
                [attr.cy]="pt.y"
                [attr.r]="hoveredPoint()?.seriesLabel === series.label && hoveredPoint()?.index === $index ? 5 : 3.5"
                [attr.fill]="getSeriesColor(sIdx, 1)"
                stroke="#ffffff"
                stroke-width="1.5"
                class="radar-dot"
                (mouseenter)="onPointEnter(series, $index, pt, $event)"
                (mouseleave)="onPointLeave()"
              />
            }
          }
        </svg>

        <!-- Hover Tooltip Overlay -->
        @if (tooltip().show) {
          <div
            class="radar-tooltip"
            [style.left.px]="tooltip().x"
            [style.top.px]="tooltip().y"
          >
            <div class="tooltip-series">{{ tooltip().series }}</div>
            <div class="tooltip-row">
              <span>{{ tooltip().category }}:</span>
              <span>{{ tooltip().value }}</span>
            </div>
          </div>
        }
      </div>

      <!-- Legend Panel -->
      <div class="radar-legend">
        @for (series of seriesData(); track series.label; let sIdx = $index) {
          <div
            class="legend-item"
            [class.dimmed]="hoveredSeries() !== null && hoveredSeries() !== series.label"
            (mouseenter)="hoveredSeries.set(series.label)"
            (mouseleave)="hoveredSeries.set(null)"
          >
            <span class="legend-indicator" [style.background]="getSeriesColor(sIdx, 1)"></span>
            <span class="legend-text">{{ series.label }}</span>
          </div>
        }
      </div>
    </div>
  \`,
  styles: [\`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .ngx-radar-wrapper {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 24px;
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 12px;
      box-shadow: var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05));
    }

    .ngx-radar-container {
      position: relative;
      width: 100%;
      max-width: 280px;
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ngx-radar-svg {
      width: 100%;
      height: 100%;
      overflow: visible;
    }

    /* Radar Polygons styling */
    .radar-polygon {
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
    }
    .radar-polygon:hover, .radar-polygon.active {
      fill-opacity: 0.3;
      stroke-width: 3.5px;
    }

    .radar-dot {
      cursor: pointer;
      transition: r 0.15s ease, stroke-width 0.15s ease;
    }

    /* Labels styling */
    .axis-label {
      font-size: 8px;
      font-weight: 700;
      fill: var(--text-secondary, #64748b);
      letter-spacing: -0.1px;
    }

    /* Glassmorphic Tooltip styling */
    .radar-tooltip {
      position: absolute;
      z-index: 100;
      pointer-events: none;
      background: rgba(15, 23, 42, 0.92);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 6px;
      padding: 8px 12px;
      color: #ffffff;
      font-family: inherit;
      font-size: 11px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(8px);
      transform: translate(-50%, -115%);
      min-width: 120px;
    }
    .tooltip-series {
      font-weight: 700;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      padding-bottom: 4px;
      margin-bottom: 4px;
      font-size: 12px;
    }
    .tooltip-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
    }
    .tooltip-row span:last-child {
      font-weight: 700;
      color: #fbbf24;
    }

    /* Legend Layout */
    .radar-legend {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 12px;
    }
    .legend-item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .legend-item.dimmed {
      opacity: 0.35;
    }
    .legend-indicator {
      width: 10px;
      height: 10px;
      border-radius: 3px;
    }
    .legend-text {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-primary, #0f172a);
    }
  \`]
})
export class RadarChartComponent {
  // Input binds
  seriesData = input.required<RadarSeries[]>();
  categories = input.required<string[]>();
  max = input<number>(100);
  colors = input<string[]>(['#4f46e5', '#fbbf24', '#a855f7', '#06b6d4']);

  // Hover status signals
  hoveredSeries = signal<string | null>(null);
  hoveredPoint = signal<{ seriesLabel: string; index: number } | null>(null);
  tooltip = signal<{ show: boolean; series: string; category: string; value: string; x: number; y: number }>({
    show: false,
    series: '',
    category: '',
    value: '',
    x: 0,
    y: 0
  });

  // Concentric circle rings count
  gridRings = signal<number[]>([0.2, 0.4, 0.6, 0.8, 1]);

  // Radius bound sizing (inside the 220x220 viewBox, center is 110, 110, maxRadius is 70)
  centerX = 110;
  centerY = 110;
  maxRadius = 70;

  // Calculate coordinates for category axis projections
  axes = computed(() => {
    const N = this.categories().length;
    return this.categories().map((_, i) => {
      const angle = (i * 2 * Math.PI) / N - Math.PI / 2; // Start from top
      const x = this.centerX + this.maxRadius * Math.cos(angle);
      const y = this.centerY + this.maxRadius * Math.sin(angle);

      // Label coordinate placement (offset slightly outwards)
      const labelDistance = this.maxRadius + 14;
      const labelX = this.centerX + labelDistance * Math.cos(angle);
      const labelY = this.centerY + labelDistance * Math.sin(angle) + 3; // +3 offset for vertical alignment

      // Text alignments depending on quadrant position
      let align: 'start' | 'middle' | 'end' = 'middle';
      if (Math.cos(angle) > 0.1) align = 'start';
      else if (Math.cos(angle) < -0.1) align = 'end';

      return { x, y, labelX, labelY, align };
    });
  });

  // Generate points string for web ring paths
  getRingPoints(ringFraction: number): string {
    const N = this.categories().length;
    const r = this.maxRadius * ringFraction;
    const points: string[] = [];

    for (let i = 0; i < N; i++) {
      const angle = (i * 2 * Math.PI) / N - Math.PI / 2;
      const x = this.centerX + r * Math.cos(angle);
      const y = this.centerY + r * Math.sin(angle);
      points.push(\`\${x},\${y}\`);
    }

    return points.join(' ');
  }

  // Generate points string for data series polygons
  getSeriesPoints(series: RadarSeries): string {
    const N = this.categories().length;
    const points: string[] = [];

    for (let i = 0; i < N; i++) {
      const value = series.values[i] ?? 0;
      const fraction = Math.min(1, value / this.max());
      const r = this.maxRadius * fraction;
      
      const angle = (i * 2 * Math.PI) / N - Math.PI / 2;
      const x = this.centerX + r * Math.cos(angle);
      const y = this.centerY + r * Math.sin(angle);
      points.push(\`\${x},\${y}\`);
    }

    return points.join(' ');
  }

  // Get point list representing coordinate items to draw dots
  getSeriesPointList(series: RadarSeries): Array<{ x: number; y: number; value: number }> {
    const N = this.categories().length;
    const list: Array<{ x: number; y: number; value: number }> = [];

    for (let i = 0; i < N; i++) {
      const value = series.values[i] ?? 0;
      const fraction = Math.min(1, value / this.max());
      const r = this.maxRadius * fraction;
      
      const angle = (i * 2 * Math.PI) / N - Math.PI / 2;
      const x = this.centerX + r * Math.cos(angle);
      const y = this.centerY + r * Math.sin(angle);
      list.push({ x, y, value });
    }

    return list;
  }

  // Utility to fetch colors
  getSeriesColor(index: number, opacity: number): string {
    const colorList = this.colors();
    const color = colorList[index % colorList.length];

    if (opacity === 1) return color;
    
    // Convert hex to rgba
    const h = color.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return \`rgba(\${r}, \${g}, \${b}, \${opacity})\`;
  }

  // Hover point interactions
  onPointEnter(series: RadarSeries, index: number, pt: { x: number; y: number; value: number }, event: MouseEvent): void {
    this.hoveredSeries.set(series.label);
    this.hoveredPoint.set({ seriesLabel: series.label, index });

    // Tooltip position mappings relative to the outer container
    const svgRect = (event.currentTarget as SVGElement).ownerSVGElement!.getBoundingClientRect();
    const containerRect = (event.currentTarget as SVGElement).ownerSVGElement!.parentElement!.getBoundingClientRect();

    // Map coordinates relative to parent container
    const x = (pt.x / 220) * svgRect.width + (svgRect.left - containerRect.left);
    const y = (pt.y / 220) * svgRect.height + (svgRect.top - containerRect.top);

    this.tooltip.set({
      show: true,
      series: series.label,
      category: this.categories()[index] ?? '',
      value: pt.value.toLocaleString(),
      x,
      y
    });
  }

  onPointLeave(): void {
    this.hoveredSeries.set(null);
    this.hoveredPoint.set(null);
    this.tooltip.update(t => ({ ...t, show: false }));
  }
}
`;

export const HeatmapChartSource = `import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngx-heatmap-chart',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div class="ngx-heatmap-wrapper">
      <div class="ngx-heatmap-container">
        <!-- SVG Grid rendering -->
        <svg
          class="ngx-heatmap-svg"
          [attr.viewBox]="viewBoxString()"
          preserveAspectRatio="xMidYMid meet"
        >
          <!-- Y-axis labels -->
          @for (yLabel of yAxisLabels(); track $index) {
            <text
              [attr.x]="leftOffset - 8"
              [attr.y]="getRowY($index) + cellHeight() / 2"
              class="axis-label y-axis-label"
              text-anchor="end"
              dominant-baseline="middle"
            >
              {{ yLabel }}
            </text>
          }

          <!-- X-axis labels -->
          @for (xLabel of xAxisLabels(); track $index) {
            <text
              [attr.x]="getColX($index) + cellWidth() / 2"
              [attr.y]="topOffset - 8"
              class="axis-label x-axis-label"
              text-anchor="middle"
            >
              {{ xLabel }}
            </text>
          }

          <!-- Heatmap Cells -->
          @for (row of data(); track $index; let rIdx = $index) {
            @for (val of row; track $index; let cIdx = $index) {
              <rect
                [attr.x]="getColX(cIdx)"
                [attr.y]="getRowY(rIdx)"
                [attr.width]="cellWidth() - cellSpacing"
                [attr.height]="cellHeight() - cellSpacing"
                [attr.fill]="getCellColor(val)"
                class="heatmap-cell"
                (mouseenter)="onCellEnter(rIdx, cIdx, val, $event)"
                (mouseleave)="onCellLeave()"
                (click)="onCellClick(rIdx, cIdx, val)"
                rx="3"
                ry="3"
              />
            }
          }
        </svg>

        <!-- Dynamic Tooltip -->
        @if (tooltip().show) {
          <div
            class="heatmap-tooltip"
            [style.left.px]="tooltip().x"
            [style.top.px]="tooltip().y"
          >
            <div class="tooltip-title">{{ tooltip().title }}</div>
            <div class="tooltip-row">
              <span>Value:</span>
              <strong>{{ tooltip().value }}</strong>
            </div>
          </div>
        }
      </div>
    </div>
  \`,
  styles: [\`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    .ngx-heatmap-wrapper {
      width: 100%;
      height: 100%;
      padding: 20px;
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 12px;
      box-shadow: var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05));
    }
    .ngx-heatmap-container {
      position: relative;
      width: 100%;
      height: 100%;
    }
    .ngx-heatmap-svg {
      width: 100%;
      height: 100%;
      overflow: visible;
    }
    .axis-label {
      font-size: 10px;
      font-weight: 700;
      fill: var(--text-secondary, #64748b);
      font-family: inherit;
    }
    .heatmap-cell {
      cursor: pointer;
      transition: fill 0.2s ease, stroke 0.15s ease, filter 0.15s ease;
      stroke: transparent;
      stroke-width: 1px;
    }
    .heatmap-cell:hover {
      filter: brightness(1.08) drop-shadow(0 2px 4px rgba(0,0,0,0.15));
      stroke: var(--primary-color, #4f46e5);
    }
    .heatmap-tooltip {
      position: absolute;
      z-index: 100;
      pointer-events: none;
      background: rgba(15, 23, 42, 0.94);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 6px;
      padding: 8px 12px;
      color: #ffffff;
      font-family: inherit;
      font-size: 11px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(8px);
      transform: translate(-50%, -115%);
      min-width: 120px;
    }
    .tooltip-title {
      font-weight: 700;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      padding-bottom: 4px;
      margin-bottom: 4px;
      font-size: 12px;
    }
    .tooltip-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
    }
    .tooltip-row strong {
      color: #fbbf24;
    }
  \`]
})
export class HeatmapChartComponent {
  data = input.required<number[][]>();
  xAxisLabels = input<string[]>([]);
  yAxisLabels = input<string[]>([]);
  colorRange = input<string[]>(['#e2e8f0', '#4f46e5']);

  cellClick = output<{ row: number; col: number; value: number }>();

  // Dimensions configuration
  leftOffset = 70;
  topOffset = 30;
  cellSpacing = 3;

  tooltip = signal<{ show: boolean; title: string; value: string; x: number; y: number }>({
    show: false,
    title: '',
    value: '',
    x: 0,
    y: 0
  });

  cellWidth = computed(() => {
    const cols = this.data()[0]?.length || 1;
    return Math.max(16, (500 - this.leftOffset) / cols);
  });

  cellHeight = computed(() => {
    const rows = this.data().length || 1;
    return Math.max(16, (250 - this.topOffset) / rows);
  });

  viewBoxString = computed(() => {
    const cols = this.data()[0]?.length || 1;
    const rows = this.data().length || 1;
    const width = this.leftOffset + cols * this.cellWidth() + 10;
    const height = this.topOffset + rows * this.cellHeight() + 10;
    return \`0 0 \${width} \${height}\`;
  });

  getColX(colIdx: number): number {
    return this.leftOffset + colIdx * this.cellWidth();
  }

  getRowY(rowIdx: number): number {
    return this.topOffset + rowIdx * this.cellHeight();
  }

  getCellColor(val: number): string {
    const values = this.data().flat();
    const min = Math.min(...values, 0);
    const max = Math.max(...values, 1);
    const range = max - min;
    const fraction = range === 0 ? 0.5 : (val - min) / range;
    return this.interpolateColor(this.colorRange()[0], this.colorRange()[1], fraction);
  }

  private interpolateColor(color1: string, color2: string, fraction: number): string {
    const hex = (x: string) => {
      const h = x.replace('#', '');
      return h.length === 3 ? h.split('').map(c => c + c).join('') : h;
    };
    const c1 = hex(color1);
    const c2 = hex(color2);

    const r1 = parseInt(c1.substring(0, 2), 16);
    const g1 = parseInt(c1.substring(2, 4), 16);
    const b1 = parseInt(c1.substring(4, 6), 16);

    const r2 = parseInt(c2.substring(0, 2), 16);
    const g2 = parseInt(c2.substring(2, 4), 16);
    const b2 = parseInt(c2.substring(4, 6), 16);

    const r = Math.round(r1 + (r2 - r1) * fraction);
    const g = Math.round(g1 + (g2 - g1) * fraction);
    const b = Math.round(b1 + (b2 - b1) * fraction);

    return \`#\${r.toString(16).padStart(2, '0')}\${g.toString(16).padStart(2, '0')}\${b.toString(16).padStart(2, '0')}\`;
  }

  onCellEnter(rIdx: number, cIdx: number, val: number, event: MouseEvent): void {
    const xLabel = this.xAxisLabels()[cIdx] || \`Col \${cIdx + 1}\`;
    const yLabel = this.yAxisLabels()[rIdx] || \`Row \${rIdx + 1}\`;
    const title = \`\${yLabel} • \${xLabel}\`;

    const rect = (event.currentTarget as SVGRectElement).getBoundingClientRect();
    const parentRect = (event.currentTarget as SVGRectElement).ownerSVGElement!.parentElement!.getBoundingClientRect();
    const x = rect.left - parentRect.left + rect.width / 2;
    const y = rect.top - parentRect.top;

    this.tooltip.set({
      show: true,
      title,
      value: val.toLocaleString(),
      x,
      y
    });
  }

  onCellLeave(): void {
    this.tooltip.update(t => ({ ...t, show: false }));
  }

  onCellClick(rIdx: number, cIdx: number, val: number): void {
    this.cellClick.emit({ row: rIdx, col: cIdx, value: val });
  }
}
`;

export const TreemapChartSource = `import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TreemapItem {
  label: string;
  value: number;
  color?: string;
}

interface LayoutItem extends TreemapItem {
  x: number;
  y: number;
  w: number;
  h: number;
  displayColor: string;
}

@Component({
  selector: 'ngx-treemap-chart',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div class="ngx-treemap-wrapper">
      <div class="ngx-treemap-container">
        <!-- SVG Canvas -->
        <svg
          class="ngx-treemap-svg"
          viewBox="0 0 500 300"
          preserveAspectRatio="xMidYMid meet"
        >
          @for (item of layoutRects(); track item.label; let idx = $index) {
            <g
              class="treemap-group"
              (mouseenter)="onItemEnter(item, $event)"
              (mouseleave)="onItemLeave()"
              (click)="onItemClick(item)"
            >
              <!-- Cell Box -->
              <rect
                [attr.x]="item.x"
                [attr.y]="item.y"
                [attr.width]="item.w"
                [attr.height]="item.h"
                [attr.fill]="item.displayColor"
                class="treemap-rect"
                rx="4"
                ry="4"
              />
              
              <!-- Labels (Only show if rectangle is large enough) -->
              @if (item.w > 50 && item.h > 30) {
                <text
                  [attr.x]="item.x + 8"
                  [attr.y]="item.y + 18"
                  class="treemap-label"
                >
                  {{ item.label }}
                </text>
                @if (item.h > 45) {
                  <text
                    [attr.x]="item.x + 8"
                    [attr.y]="item.y + 32"
                    class="treemap-value"
                  >
                    {{ item.value.toLocaleString() }}
                  </text>
                }
              }
            </g>
          }
        </svg>

        <!-- Glassmorphic Tooltip Overlay -->
        @if (tooltip().show) {
          <div
            class="treemap-tooltip"
            [style.left.px]="tooltip().x"
            [style.top.px]="tooltip().y"
          >
            <div class="tooltip-title">{{ tooltip().title }}</div>
            <div class="tooltip-row">
              <span>Value:</span>
              <strong>{{ tooltip().value }}</strong>
            </div>
          </div>
        }
      </div>
    </div>
  \`,
  styles: [\`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    .ngx-treemap-wrapper {
      width: 100%;
      height: 100%;
      padding: 16px;
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 12px;
      box-shadow: var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05));
    }
    .ngx-treemap-container {
      position: relative;
      width: 100%;
      height: 100%;
    }
    .ngx-treemap-svg {
      width: 100%;
      height: 100%;
      display: block;
      overflow: visible;
    }
    .treemap-group {
      cursor: pointer;
    }
    .treemap-rect {
      stroke: var(--bg-secondary, #ffffff);
      stroke-width: 1.5px;
      transition: fill 0.2s ease, stroke 0.15s ease, filter 0.15s ease;
    }
    .treemap-group:hover .treemap-rect {
      filter: brightness(1.06) drop-shadow(0 2px 8px rgba(0,0,0,0.12));
      stroke: var(--primary-color, #4f46e5);
      stroke-width: 2px;
    }
    .treemap-label {
      font-size: 11px;
      font-weight: 750;
      fill: #ffffff;
      font-family: inherit;
      pointer-events: none;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }
    .treemap-value {
      font-size: 9px;
      font-weight: 600;
      fill: rgba(255, 255, 255, 0.95);
      font-family: inherit;
      pointer-events: none;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }
    .treemap-tooltip {
      position: absolute;
      z-index: 100;
      pointer-events: none;
      background: rgba(15, 23, 42, 0.94);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 6px;
      padding: 8px 12px;
      color: #ffffff;
      font-family: inherit;
      font-size: 11px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(8px);
      transform: translate(-50%, -115%);
      min-width: 120px;
    }
    .tooltip-title {
      font-weight: 700;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      padding-bottom: 4px;
      margin-bottom: 4px;
      font-size: 12px;
    }
    .tooltip-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
    }
    .tooltip-row strong {
      color: #fbbf24;
    }
  \`]
})
export class TreemapChartComponent {
  data = input.required<TreemapItem[]>();
  colors = input<string[]>(['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']);

  itemClick = output<TreemapItem>();

  tooltip = signal<{ show: boolean; title: string; value: string; x: number; y: number }>({
    show: false,
    title: '',
    value: '',
    x: 0,
    y: 0
  });

  layoutRects = computed(() => {
    const rawData = this.data();
    if (!rawData || rawData.length === 0) return [];

    // Sort items descending by value
    const items = [...rawData].sort((a, b) => b.value - a.value);
    const totalVal = items.reduce((sum, item) => sum + item.value, 0);

    const layoutList: LayoutItem[] = [];
    
    // Canvas viewBox is 500x300. Leave a tiny padding margin around
    const w = 500;
    const h = 300;

    const colorsList = this.colors();

    this.subdivide(items, 0, 0, w, h, totalVal, (item, rx, ry, rw, rh, index) => {
      const displayColor = item.color || colorsList[index % colorsList.length];
      layoutList.push({
        ...item,
        x: rx,
        y: ry,
        w: rw,
        h: rh,
        displayColor
      });
    }, 0);

    return layoutList;
  });

  private subdivide(
    items: TreemapItem[],
    x: number,
    y: number,
    w: number,
    h: number,
    totalVal: number,
    callback: (item: TreemapItem, rx: number, ry: number, rw: number, rh: number, index: number) => void,
    startIndex: number
  ) {
    if (items.length === 0) return;
    if (items.length === 1) {
      callback(items[0], x, y, w, h, startIndex);
      return;
    }

    // Proportional division
    let splitIdx = 1;
    let group1Sum = items[0].value;
    let minDiff = Math.abs(group1Sum - (totalVal - group1Sum));

    for (let i = 2; i < items.length; i++) {
      const tempSum = group1Sum + items[i - 1].value;
      const tempDiff = Math.abs(tempSum - (totalVal - tempSum));
      if (tempDiff < minDiff) {
        group1Sum = tempSum;
        splitIdx = i;
        minDiff = tempDiff;
      } else {
        break;
      }
    }

    const group1 = items.slice(0, splitIdx);
    const group2 = items.slice(splitIdx);
    const group2Sum = totalVal - group1Sum;

    // Split on wider axis
    if (w > h) {
      const w1 = w * (group1Sum / totalVal);
      const w2 = w - w1;
      this.subdivide(group1, x, y, w1, h, group1Sum, callback, startIndex);
      this.subdivide(group2, x + w1, y, w2, h, group2Sum, callback, startIndex + splitIdx);
    } else {
      const h1 = h * (group1Sum / totalVal);
      const h2 = h - h1;
      this.subdivide(group1, x, y, w, h1, group1Sum, callback, startIndex);
      this.subdivide(group2, x, y + h1, w, h2, group2Sum, callback, startIndex + splitIdx);
    }
  }

  onItemEnter(item: LayoutItem, event: MouseEvent): void {
    const rect = (event.currentTarget as SVGGraphicsElement).getBoundingClientRect();
    const parentRect = (event.currentTarget as SVGGraphicsElement).ownerSVGElement!.parentElement!.getBoundingClientRect();
    const x = rect.left - parentRect.left + rect.width / 2;
    const y = rect.top - parentRect.top;

    this.tooltip.set({
      show: true,
      title: item.label,
      value: item.value.toLocaleString(),
      x,
      y
    });
  }

  onItemLeave(): void {
    this.tooltip.update(t => ({ ...t, show: false }));
  }

  onItemClick(item: LayoutItem): void {
    this.itemClick.emit(item);
  }
}
`;

export const AreaChartSource = `import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {  CHART_COLORS, ChartSeries, niceTicks, scale, smoothPath, fmtNum  } from './chart-utils';

@Component({
  selector: 'ngx-area-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="ngx-area-chart" (mousemove)="onMouseMove($event)" (mouseleave)="crosshair.set(null); tooltip.set(null)">
      @if (showLegend()) {
        <div class="chart-legend">
          @for (s of series(); track s.name; let i = $index) {
            <span class="legend-item">
              <span class="legend-dot" [style.background]="seriesColor(i, s)"></span>
              {{ s.name }}
            </span>
          }
        </div>
      }
      
      <div class="chart-svg-wrap">
        <svg [attr.width]="'100%'" [attr.height]="height()" class="chart-svg">
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
              />
              
              <!-- Border Line -->
              <path
                [attr.d]="linePath(s)"
                [attr.stroke]="seriesColor(si, s)"
                fill="none"
                stroke-width="3"
                stroke-linejoin="round"
                stroke-linecap="round"
              />
              
              <!-- Hover Markers -->
              @if (showMarkers()) {
                @for (v of s.data; track $index; let ci = $index) {
                  <circle
                    [attr.cx]="xPos(ci)"
                    [attr.cy]="yPos(v)"
                    r="4"
                    [attr.fill]="seriesColor(si, s)"
                    stroke="#ffffff"
                    stroke-width="2"
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
  \`,
  styles: [\`
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
    .marker-dot {
      transition: r 0.1s ease;
    }
    .marker-dot:hover {
      r: 6px;
    }
    
    .chart-tooltip {
      position: absolute;
      pointer-events: none;
      transform: translate(-50%, -100%) translateY(-10px);
      background: var(--ngx-chart-tooltip-bg, #0f172a);
      color: #ffffff;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 12px;
      white-space: nowrap;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      z-index: 10;
    }
    .tt-cat {
      font-weight: 700;
      margin-bottom: 4px;
      color: #ffffff;
    }
    .tt-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 2px;
    }
    .tt-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .tt-name {
      font-size: 11px;
      color: #cbd5e1;
    }
    .tt-val {
      margin-left: auto;
      font-weight: 700;
    }
  \`]
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

  crosshair = signal<{ x: number } | null>(null);
  tooltip = signal<{ x: number; y: number; cat: string; rows: { name: string; value: number; color: string }[] } | null>(null);
  containerWidth = signal<number>(600);

  innerW = computed(() => this.containerWidth() - this.PAD_LEFT - this.PAD_RIGHT);
  innerH = computed(() => this.height() - this.PAD_TOP - this.PAD_BOTTOM);

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
    return line + \` L \${last[0]} \${this.innerH()} L \${first[0]} \${this.innerH()} Z\`;
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

  readonly fmtNum = fmtNum;
}
`;

export const FunnelPyramidChartSource = `import { Component, ChangeDetectionStrategy, input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {  CHART_COLORS, fmtNum  } from './chart-utils';

export interface FunnelItem {
  name: string;
  value: number;
  color?: string;
}

@Component({
  selector: 'ngx-funnel-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="ngx-funnel-chart">
      <div class="funnel-layout">
        <!-- SVG Visual Funnel / Pyramid -->
        <div class="funnel-graphic" (mouseleave)="hoveredIndex.set(null)">
          <svg [attr.width]="'100%'" [attr.height]="height()" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" class="funnel-svg">
            <g>
              @for (stage of funnelStages(); track stage.name; let i = $index) {
                <polygon
                  [attr.points]="stage.points"
                  [attr.fill]="stage.color"
                  [class.active]="hoveredIndex() === i"
                  (mouseenter)="hoveredIndex.set(i)"
                  (mousemove)="onMouseMove($event, i)"
                  class="funnel-polygon"
                />
              }
            </g>
          </svg>
          
          <!-- Hover Tooltip -->
          @if (hoveredIndex() !== null) {
            @if (funnelStages()[hoveredIndex()!]; as stage) {
              <div class="chart-tooltip" [style.left.px]="tooltipX()" [style.top.px]="tooltipY()">
                <div class="tt-name">{{ stage.name }}</div>
                <div class="tt-row">
                  Value: <strong>{{ fmtNum(stage.value) }}</strong>
                </div>
                <div class="tt-row">
                  {{ mode() === 'funnel' ? 'Conversion' : 'Share' }}: 
                  <strong>
                    {{ (mode() === 'funnel' ? (stage.value / funnelStages()[0].value) : (stage.value / totalValue())) | percent:'1.0-1' }}
                  </strong>
                </div>
              </div>
            }
          }
        </div>

        <!-- Sidebar legend & metric checklist -->
        <div class="funnel-legend">
          @for (stage of funnelStages(); track stage.name; let i = $index) {
            <div
              class="legend-item"
              [class.active]="hoveredIndex() === i"
              (mouseenter)="hoveredIndex.set(i)"
              (mouseleave)="hoveredIndex.set(null)"
            >
              <span class="legend-color-dot" [style.background]="stage.color"></span>
              <div class="legend-content">
                <span class="legend-title">{{ stage.name }}</span>
                <div class="legend-metrics">
                  <span class="metric-value">{{ fmtNum(stage.value) }}</span>
                  <span class="metric-pct">
                    {{ (mode() === 'funnel' ? (stage.value / funnelStages()[0].value) : (stage.value / totalValue())) | percent:'1.0-1' }}
                  </span>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  \`,
  styles: [\`
    :host {
      display: block;
    }
    .ngx-funnel-chart {
      background: var(--ngx-chart-bg, #ffffff);
      border: 1px solid var(--ngx-chart-grid, #ebedf0);
      border-radius: 12px;
      padding: 20px;
    }
    .funnel-layout {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 24px;
      align-items: center;
    }
    @media (max-width: 600px) {
      .funnel-layout {
        grid-template-columns: 1fr;
      }
    }
    
    .funnel-graphic {
      position: relative;
      width: 100%;
    }
    .funnel-svg {
      display: block;
      overflow: visible;
    }
    .funnel-polygon {
      cursor: pointer;
      opacity: 0.85;
      transition: opacity 0.2s, transform 0.2s, filter 0.2s;
    }
    .funnel-polygon:hover, .funnel-polygon.active {
      opacity: 1;
      filter: drop-shadow(0 4px 12px rgba(0,0,0,0.12)) brightness(1.05);
    }

    /* Tooltip styling */
    .chart-tooltip {
      position: absolute;
      pointer-events: none;
      transform: translate(-50%, -100%) translateY(-10px);
      background: var(--ngx-chart-tooltip-bg, #0f172a);
      color: #ffffff;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 12px;
      white-space: nowrap;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      z-index: 10;
    }
    .tt-name {
      font-weight: 700;
      margin-bottom: 4px;
    }
    .tt-row {
      font-size: 11px;
      opacity: 0.9;
    }

    /* Sidebar metrics list */
    .funnel-legend {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: 8px;
      border: 1px solid transparent;
      transition: all 0.2s;
      cursor: pointer;
    }
    .legend-item:hover, .legend-item.active {
      background: var(--ngx-chart-grid, #f8fafc);
      border-color: var(--ngx-chart-grid, #e2e8f0);
    }
    .legend-color-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .legend-content {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }
    .legend-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--ngx-chart-text, #0f172a);
    }
    .legend-metrics {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .metric-value {
      font-size: 13px;
      font-weight: 700;
      color: var(--ngx-chart-text, #0f172a);
    }
    .metric-pct {
      font-size: 11px;
      color: var(--ngx-chart-axis-text, #64748b);
      background: var(--ngx-chart-grid, #f1f5f9);
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
    }
  \`]
})
export class FunnelChartComponent {
  data = input<FunnelItem[]>([]);
  height = input<number>(300);
  colors = input<string[]>(CHART_COLORS);
  mode = input<'funnel' | 'pyramid'>('funnel');

  hoveredIndex = signal<number | null>(null);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);

  totalValue = computed(() => {
    return this.data().reduce((sum, item) => sum + item.value, 0) || 1;
  });

  // Computes the SVG polygon coordinates for the funnel / pyramid steps
  funnelStages = computed(() => {
    const items = this.data();
    if (items.length === 0) return [];
    
    const count = items.length;
    const svgW = 400;
    const svgH = 300;
    const maxFunnelW = 320;

    if (this.mode() === 'pyramid') {
      // Pyramid Mode: Stacks vertically to form a triangle pointing up.
      // Slices stack: top is narrow (apex), bottom is wide (base).
      // Each slice height represents its proportion of the total value.
      const totalVal = this.totalValue();
      let currentY = 0;

      return items.map((item, idx) => {
        const h = (item.value / totalVal) * svgH;
        const yTop = currentY;
        const yBot = currentY + h;

        // Since the outer shape is a triangle from (200, 0) to (200 - maxW/2, svgH) and (200 + maxW/2, svgH):
        // Width at any y is: w(y) = (y / svgH) * maxFunnelW
        const wTop = (yTop / svgH) * maxFunnelW;
        const wBot = (yBot / svgH) * maxFunnelW;

        const xTopLeft = (svgW - wTop) / 2;
        const xTopRight = (svgW + wTop) / 2;
        const xBotLeft = (svgW - wBot) / 2;
        const xBotRight = (svgW + wBot) / 2;

        const points = \`\${xTopLeft},\${yTop} \${xTopRight},\${yTop} \${xBotRight},\${yBot} \${xBotLeft},\${yBot}\`;
        const color = item.color || this.colors()[idx % this.colors().length];

        currentY += h;

        return {
          name: item.name,
          value: item.value,
          points,
          color,
          yCenter: (yTop + yBot) / 2
        };
      });
    } else {
      // Standard Funnel Mode
      const maxVal = items[0]?.value || 1;
      const stepH = svgH / count;
      
      return items.map((item, idx) => {
        const topPct = item.value / maxVal;
        const botPct = idx < count - 1 ? items[idx + 1].value / maxVal : topPct * 0.4;
        
        const topW = topPct * maxFunnelW;
        const botW = botPct * maxFunnelW;
        
        const yTop = idx * stepH;
        const yBot = (idx + 1) * stepH;
        
        const xTopLeft = (svgW - topW) / 2;
        const xTopRight = (svgW + topW) / 2;
        const xBotLeft = (svgW - botW) / 2;
        const xBotRight = (svgW + botW) / 2;
        
        const points = \`\${xTopLeft},\${yTop} \${xTopRight},\${yTop} \${xBotRight},\${yBot} \${xBotLeft},\${yBot}\`;
        const color = item.color || this.colors()[idx % this.colors().length];
        
        return {
          name: item.name,
          value: item.value,
          points,
          color,
          yCenter: (yTop + yBot) / 2
        };
      });
    }
  });

  onMouseMove(event: MouseEvent, index: number): void {
    const el = event.currentTarget as SVGElement;
    const rect = el.getBoundingClientRect();
    const parentRect = el.parentElement?.parentElement?.getBoundingClientRect();
    if (parentRect) {
      this.tooltipX.set(event.clientX - parentRect.left);
      this.tooltipY.set(event.clientY - parentRect.top);
    }
  }

  readonly fmtNum = fmtNum;
}
`;

export const ComboChartSource = `import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {  CHART_COLORS, ChartSeries, niceTicks, scale, fmtNum  } from './chart-utils';

@Component({
  selector: 'ngx-combo-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="ngx-combo-chart" [class.dark]="theme() === 'dark'">
      <!-- Legend -->
      @if (showLegend()) {
        <div class="chart-legend">
          @for (s of barSeries(); track s.name; let i = $index) {
            <span class="legend-item">
              <span class="legend-dot bar" [style.background]="barSeriesColor(i)"></span>
              {{ s.name }} (Bar)
            </span>
          }
          @for (s of lineSeries(); track s.name; let i = $index) {
            <span class="legend-item">
              <span class="legend-line" [style.border-color]="lineSeriesColor(i)"></span>
              <span class="legend-dot marker" [style.background]="lineSeriesColor(i)"></span>
              {{ s.name }} (Line)
            </span>
          }
        </div>
      }

      <div class="chart-svg-container" #container>
        <svg
          [attr.width]="'100%'"
          [attr.height]="height()"
          class="chart-svg"
          (mouseleave)="onMouseLeave()"
        >
          <g [attr.transform]="'translate(' + PAD_LEFT + ',' + PAD_TOP + ')'">
            <!-- Grid Lines -->
            @if (showGrid()) {
              @for (tick of leftYTicks(); track tick) {
                <line
                  [attr.x1]="0"
                  [attr.x2]="innerW()"
                  [attr.y1]="leftYPos(tick)"
                  [attr.y2]="leftYPos(tick)"
                  stroke="var(--ngx-chart-grid, #ebedf0)"
                  stroke-dasharray="3,3"
                />
              }
            }

            <!-- Y-Axis (Left) - Bars -->
            @for (tick of leftYTicks(); track tick) {
              <text
                x="-10"
                [attr.y]="leftYPos(tick) + 4"
                class="axis-label left"
                text-anchor="end"
              >{{ fmtNum(tick) }}</text>
            }
            <text
              [attr.transform]="'rotate(-90) translate(' + (-innerH()/2) + ', -36)'"
              class="axis-title left"
              text-anchor="middle"
            >{{ barYTitle() }}</text>

            <!-- Y-Axis (Right) - Lines -->
            @for (tick of rightYTicks(); track tick) {
              <text
                [attr.x]="innerW() + 10"
                [attr.y]="rightYPos(tick) + 4"
                class="axis-label right"
                text-anchor="start"
              >{{ fmtNum(tick) }}</text>
            }
            <text
              [attr.transform]="'rotate(90) translate(' + (innerH()/2) + ', ' + (-innerW() - 36) + ')'"
              class="axis-title right"
              text-anchor="middle"
            >{{ lineYTitle() }}</text>

            <!-- X-Axis Labels -->
            @for (cat of categories(); track cat; let i = $index) {
              <text
                [attr.x]="catMidX(i)"
                [attr.y]="innerH() + 20"
                class="axis-label x"
                text-anchor="middle"
              >{{ cat }}</text>
            }

            <!-- Active Category Column Highlight -->
            @if (activeCategoryIndex() !== null) {
              <rect
                [attr.x]="activeCategoryIndex()! * groupW() + 2"
                [attr.y]="0"
                [attr.width]="groupW() - 4"
                [attr.height]="innerH()"
                class="column-highlight"
              />
            }

            <!-- Bars (Left Y-Axis Scale) -->
            @for (s of barSeries(); track s.name; let si = $index) {
              @for (v of s.data; track $index; let ci = $index) {
                @if (v !== null && v !== undefined) {
                  <rect
                    [attr.x]="barX(ci, si)"
                    [attr.y]="barY(v)"
                    [attr.width]="singleBarWidth()"
                    [attr.height]="barH(v)"
                    [attr.fill]="s.color || barSeriesColor(si)"
                    [attr.rx]="2"
                    class="bar-rect"
                  />
                }
              }
            }

            <!-- Lines (Right Y-Axis Scale) -->
            @for (s of lineSeries(); track s.name; let si = $index) {
              <!-- Draw Line Path -->
              <path
                [attr.d]="linePath(s)"
                fill="none"
                [attr.stroke]="s.color || lineSeriesColor(si)"
                stroke-width="3"
                stroke-linecap="round"
                class="line-path"
              />
              <!-- Draw Markers -->
              @for (v of s.data; track $index; let ci = $index) {
                @if (v !== null && v !== undefined) {
                  <circle
                    [attr.cx]="catMidX(ci)"
                    [attr.cy]="rightYPos(v)"
                    [attr.r]="activeCategoryIndex() === ci ? 6 : 4"
                    [attr.fill]="'#ffffff'"
                    [attr.stroke]="s.color || lineSeriesColor(si)"
                    stroke-width="2.5"
                    class="line-marker"
                  />
                }
              }
            }

            <!-- Invisible Hover Interactive Hitboxes -->
            @for (cat of categories(); track cat; let i = $index) {
              <rect
                [attr.x]="i * groupW()"
                [attr.y]="0"
                [attr.width]="groupW()"
                [attr.height]="innerH()"
                fill="transparent"
                class="hitbox"
                (mousemove)="onMouseMove($event, i)"
              />
            }

            <!-- Base axes borders -->
            <line x1="0" [attr.x2]="innerW()" [attr.y1]="innerH()" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #ced4da)"/>
            <line x1="0" x2="0" y1="0" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #ced4da)"/>
            <line [attr.x1]="innerW()" [attr.x2]="innerW()" y1="0" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #ced4da)"/>
          </g>
        </svg>

        <!-- Dynamic Combined Tooltip -->
        @if (tooltip(); as t) {
          <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
            <div class="tooltip-header">{{ t.category }}</div>
            <div class="tooltip-body">
              @for (item of t.items; track item.name) {
                <div class="tooltip-row">
                  <span class="tooltip-dot" [style.background]="item.color" [class.line-dot]="item.type === 'line'"></span>
                  <span class="tooltip-label">{{ item.name }}:</span>
                  <span class="tooltip-val">{{ fmtNum(item.value) }}{{ item.suffix || '' }}</span>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  \`,
  styles: [\`
    :host {
      display: block;
      width: 100%;
    }
    .ngx-combo-chart {
      position: relative;
      background: var(--ngx-chart-bg, #ffffff);
      border-radius: 16px;
      padding: 16px;
      box-sizing: border-box;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
      transition: background-color 0.3s;
    }
    .ngx-combo-chart.dark {
      background: rgba(30, 32, 48, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.05);
      --ngx-chart-bg: transparent;
      --ngx-chart-grid: rgba(255, 255, 255, 0.06);
      --ngx-chart-axis: rgba(255, 255, 255, 0.12);
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
    .legend-dot.bar {
      border-radius: 2px;
    }
    .legend-line {
      width: 14px;
      border-bottom: 2px solid;
      display: inline-block;
    }
    .legend-dot.marker {
      margin-left: -12px;
      width: 6px;
      height: 6px;
      border: 1.5px solid #ffffff;
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
    .column-highlight {
      fill: rgba(59, 130, 246, 0.04);
      pointer-events: none;
    }
    .dark .column-highlight {
      fill: rgba(255, 255, 255, 0.03);
    }
    .bar-rect {
      transition: fill-opacity 0.2s, transform 0.2s;
    }
    .line-path {
      transition: stroke 0.2s;
    }
    .line-marker {
      cursor: pointer;
      transition: r 0.2s, stroke-width 0.2s;
    }
    .hitbox {
      cursor: crosshair;
    }
    .chart-tooltip {
      position: absolute;
      pointer-events: none;
      transform: translate(-50%, -100%) translateY(-10px);
      background: rgba(15, 23, 42, 0.9);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
      color: #f8fafc;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 12px;
      z-index: 100;
      min-width: 140px;
      transition: left 0.1s ease, top 0.1s ease;
    }
    .tooltip-header {
      font-weight: 700;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 4px;
      margin-bottom: 6px;
      color: #38bdf8;
    }
    .tooltip-body {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .tooltip-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .tooltip-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
    }
    .tooltip-dot.line-dot {
      border: 1.5px solid #ffffff;
      box-sizing: border-box;
      width: 8px;
      height: 8px;
    }
    .tooltip-label {
      color: #94a3b8;
      flex: 1;
    }
    .tooltip-val {
      font-weight: 700;
      font-family: monospace;
    }
  \`]
})
export class ComboChartComponent {
  PAD_LEFT = 52;
  PAD_TOP = 16;
  PAD_RIGHT = 52;
  PAD_BOTTOM = 36;

  barSeries = input<ChartSeries[]>([]);
  lineSeries = input<ChartSeries[]>([]);
  categories = input<string[]>([]);
  height = input<number>(300);
  showGrid = input<boolean>(true);
  showLegend = input<boolean>(true);
  theme = input<'light' | 'dark'>('light');
  colors = input<string[]>(CHART_COLORS);
  barYTitle = input<string>('Volume');
  lineYTitle = input<string>('Percentage');

  activeCategoryIndex = signal<number | null>(null);
  tooltip = signal<{
    x: number;
    y: number;
    category: string;
    items: Array<{ name: string; value: number; color: string; type: 'bar' | 'line'; suffix?: string }>;
  } | null>(null);

  private container = viewChild<ElementRef>('container');

  // Dimension Calculations
  innerW = computed(() => {
    const el = this.container()?.nativeElement;
    const totalW = el ? el.getBoundingClientRect().width : 600;
    return Math.max(200, totalW - this.PAD_LEFT - this.PAD_RIGHT);
  });

  innerH = computed(() => this.height() - this.PAD_TOP - this.PAD_BOTTOM);

  // Left Y-Axis Calculations (Bar values)
  private leftValues = computed(() => this.barSeries().flatMap(s => s.data.filter(v => v !== null)));
  private leftMin = computed(() => Math.min(0, ...this.leftValues()));
  private leftMax = computed(() => Math.max(1, ...this.leftValues()));
  leftYTicks = computed(() => niceTicks(this.leftMin(), this.leftMax(), 5));

  leftYPos(v: number): number {
    return scale(v, this.leftMin(), this.leftMax(), this.innerH(), 0);
  }
  barY(v: number): number { return Math.min(this.leftYPos(0), this.leftYPos(v)); }
  barH(v: number): number { return Math.abs(this.leftYPos(0) - this.leftYPos(v)); }

  // Right Y-Axis Calculations (Line values)
  private rightValues = computed(() => this.lineSeries().flatMap(s => s.data.filter(v => v !== null)));
  private rightMin = computed(() => Math.min(0, ...this.rightValues()));
  private rightMax = computed(() => Math.max(100, ...this.rightValues()));
  rightYTicks = computed(() => niceTicks(this.rightMin(), this.rightMax(), 5));

  rightYPos(v: number): number {
    return scale(v, this.rightMin(), this.rightMax(), this.innerH(), 0);
  }

  // Layout positioning
  groupW = computed(() => this.categories().length > 0 ? this.innerW() / this.categories().length : 0);
  singleBarWidth = computed(() => {
    const numSeries = this.barSeries().length || 1;
    return Math.max(4, (this.groupW() - 12) / numSeries);
  });

  catMidX(i: number): number {
    return i * this.groupW() + this.groupW() / 2;
  }

  barX(ci: number, si: number): number {
    const numSeries = this.barSeries().length;
    const groupStartX = ci * this.groupW() + 6;
    return groupStartX + si * this.singleBarWidth();
  }

  barSeriesColor(si: number): string {
    return this.colors()[si % this.colors().length];
  }

  lineSeriesColor(si: number): string {
    // Avoid color collision by shifting indices
    const offset = this.barSeries().length || 0;
    return this.colors()[(si + offset) % this.colors().length];
  }

  // Line paths generator
  linePath(series: ChartSeries): string {
    const pts = series.data.map((v, ci) => {
      if (v === null || v === undefined) return null;
      return [this.catMidX(ci), this.rightYPos(v)] as [number, number];
    }).filter((p): p is [number, number] => p !== null);

    if (pts.length < 2) return '';
    let d = \`M \${pts[0][0]} \${pts[0][1]}\`;
    for (let i = 1; i < pts.length; i++) {
      d += \` L \${pts[i][0]} \${pts[i][1]}\`;
    }
    return d;
  }

  onMouseMove(event: MouseEvent, index: number) {
    this.activeCategoryIndex.set(index);
    const containerEl = this.container()?.nativeElement;
    if (!containerEl) return;
    const rect = containerEl.getBoundingClientRect();
    const tooltipX = event.clientX - rect.left;
    const tooltipY = event.clientY - rect.top;

    const catName = this.categories()[index] || \`Category \${index + 1}\`;
    const items: any[] = [];

    // Bars info
    this.barSeries().forEach((s, si) => {
      const val = s.data[index];
      if (val !== undefined && val !== null) {
        items.push({
          name: s.name,
          value: val,
          color: s.color || this.barSeriesColor(si),
          type: 'bar'
        });
      }
    });

    // Lines info
    this.lineSeries().forEach((s, si) => {
      const val = s.data[index];
      if (val !== undefined && val !== null) {
        items.push({
          name: s.name,
          value: val,
          color: s.color || this.lineSeriesColor(si),
          type: 'line',
          suffix: '%'
        });
      }
    });

    this.tooltip.set({
      x: tooltipX,
      y: tooltipY,
      category: catName,
      items
    });
  }

  onMouseLeave() {
    this.activeCategoryIndex.set(null);
    this.tooltip.set(null);
  }

  readonly fmtNum = fmtNum;
}
`;

export const ScatterPlotSource = `import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {  CHART_COLORS, niceTicks, scale, fmtNum  } from './chart-utils';

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
  template: \`
    <div class="ngx-scatter-plot" [class.dark]="theme() === 'dark'">
      <!-- Legend -->
      @if (showLegend() && uniqueGroups().length > 0) {
        <div class="chart-legend">
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

            <!-- Render Data Points -->
            @for (pt of scaledPoints(); track $index; let i = $index) {
              <circle
                [attr.cx]="pt.cx"
                [attr.cy]="pt.cy"
                [attr.r]="pt.r"
                [attr.fill]="pt.color"
                [attr.stroke]="'#ffffff'"
                stroke-width="1.5"
                class="scatter-point"
                [class.hovered]="hoveredPointIndex() === i"
                (mouseenter)="onPointHover($event, pt.raw, i)"
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
              <div class="tooltip-header">{{ t.label }}</div>
            }
            <div class="tooltip-body">
              @if (t.group) {
                <div class="tooltip-group">Group: <strong>{{ t.group }}</strong></div>
              }
              <div class="tooltip-val">{{ xTitle() }}: <strong>{{ fmtNum(ptX(t)) }}</strong></div>
              <div class="tooltip-val">{{ yTitle() }}: <strong>{{ fmtNum(ptY(t)) }}</strong></div>
            </div>
          </div>
        }
      </div>
    </div>
  \`,
  styles: [\`
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
    .scatter-point {
      cursor: pointer;
      transition: r 0.2s, opacity 0.2s, filter 0.2s;
    }
    .scatter-point.hovered {
      r: 8px;
      opacity: 0.95;
      filter: brightness(1.1);
    }
    .chart-tooltip {
      position: absolute;
      pointer-events: none;
      transform: translate(-50%, -100%) translateY(-10px);
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
      color: #f8fafc;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 11px;
      z-index: 100;
      min-width: 120px;
    }
    .tooltip-header {
      font-weight: 700;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      padding-bottom: 4px;
      margin-bottom: 6px;
      color: #38bdf8;
    }
    .tooltip-body {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .tooltip-group {
      color: #cbd5e1;
      margin-bottom: 3px;
    }
    .tooltip-val {
      color: #94a3b8;
    }
    .tooltip-val strong {
      color: #f8fafc;
      font-family: monospace;
    }
  \`]
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

  hoveredPointIndex = signal<number | null>(null);
  tooltip = signal<{
    x: number;
    y: number;
    label?: string;
    group?: string;
    xVal: number;
    yVal: number;
    color: string;
  } | null>(null);

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

  readonly fmtNum = fmtNum;
}
`;

export const WaterfallChartSource = `import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {  niceTicks, scale, fmtNum  } from './chart-utils';

export interface WaterfallItem {
  label: string;
  value: number;
  isTotal?: boolean;
}

@Component({
  selector: 'ngx-waterfall-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="ngx-waterfall-chart" (mouseleave)="hoveredIndex.set(null); tooltip.set(null)">
      <div class="chart-svg-container" #container>
        <svg
          [attr.width]="'100%'"
          [attr.height]="height()"
          class="chart-svg"
        >
          <g [attr.transform]="'translate(' + PAD_LEFT + ',' + PAD_TOP + ')'">
            <!-- Grid Lines (Horizontal) -->
            @if (showGrid()) {
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

            <!-- X-Axis Labels -->
            @for (bar of computedBars(); track $index; let i = $index) {
              <text
                [attr.x]="bar.x + bar.width / 2"
                [attr.y]="innerH() + 20"
                class="axis-label x"
                text-anchor="middle"
              >{{ bar.label }}</text>
            }

            <!-- Connecting dashed lines between columns -->
            @for (bar of computedBars(); track $index; let i = $index) {
              @if (i < computedBars().length - 1) {
                <line
                  [attr.x1]="bar.x + bar.width"
                  [attr.x2]="computedBars()[i+1].x"
                  [attr.y1]="bar.connectY"
                  [attr.y2]="bar.connectY"
                  stroke="var(--ngx-chart-axis, #ced4da)"
                  stroke-dasharray="3,3"
                  stroke-width="1.5"
                />
              }
            }

            <!-- Bars -->
            @for (bar of computedBars(); track $index; let i = $index) {
              <rect
                [attr.x]="bar.x"
                [attr.y]="bar.y"
                [attr.width]="bar.width"
                [attr.height]="bar.rectH"
                [attr.fill]="bar.color"
                [attr.rx]="3"
                class="waterfall-bar"
                [class.hovered]="hoveredIndex() === i"
                (mouseenter)="onBarHover($event, bar, i)"
              />
              @if (showLabels() && bar.rectH > 14) {
                <text
                  [attr.x]="bar.x + bar.width / 2"
                  [attr.y]="bar.y + (bar.rectH / 2) + 4"
                  text-anchor="middle"
                  class="bar-value-label"
                >
                  {{ bar.value > 0 ? '+' : '' }}{{ fmtNum(bar.value) }}
                </text>
              }
            }

            <!-- Base axes borders -->
            <line x1="0" [attr.x2]="innerW()" [attr.y1]="innerH()" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #ced4da)"/>
            <line x1="0" x2="0" y1="0" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #ced4da)"/>
          </g>
        </svg>

        <!-- Tooltip -->
        @if (tooltip(); as t) {
          <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
            <div class="tooltip-header">{{ t.label }}</div>
            <div class="tooltip-body">
              <div class="tooltip-val">Change: <strong [style.color]="t.color">{{ t.value > 0 ? '+' : '' }}{{ fmtNum(t.value) }}</strong></div>
              <div class="tooltip-val">Running Balance: <strong>{{ fmtNum(t.balance) }}</strong></div>
            </div>
          </div>
        }
      </div>
    </div>
  \`,
  styles: [\`
    :host {
      display: block;
      width: 100%;
    }
    .ngx-waterfall-chart {
      position: relative;
      background: var(--ngx-chart-bg, #ffffff);
      border-radius: 16px;
      padding: 16px;
      box-sizing: border-box;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
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
    .waterfall-bar {
      cursor: pointer;
      transition: opacity 0.2s, filter 0.2s;
    }
    .waterfall-bar.hovered {
      opacity: 0.9;
      filter: brightness(1.08) drop-shadow(0 4px 6px rgba(0,0,0,0.1));
    }
    .bar-value-label {
      font-size: 9px;
      fill: #ffffff;
      font-weight: 600;
      pointer-events: none;
    }
    .chart-tooltip {
      position: absolute;
      pointer-events: none;
      transform: translate(-50%, -100%) translateY(-10px);
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
      color: #f8fafc;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 11px;
      z-index: 100;
      min-width: 130px;
    }
    .tooltip-header {
      font-weight: 700;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      padding-bottom: 4px;
      margin-bottom: 6px;
      color: #38bdf8;
    }
    .tooltip-body {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .tooltip-val {
      color: #94a3b8;
    }
    .tooltip-val strong {
      color: #f8fafc;
      font-family: monospace;
    }
  \`]
})
export class WaterfallChartComponent {
  PAD_LEFT = 52;
  PAD_TOP = 20;
  PAD_RIGHT = 24;
  PAD_BOTTOM = 36;

  data = input<WaterfallItem[]>([]);
  height = input<number>(300);
  showGrid = input<boolean>(true);
  showLabels = input<boolean>(true);

  // Styling properties
  positiveColor = input<string>('#10b981'); // Emerald
  negativeColor = input<string>('#ef4444'); // Rose/Red
  totalColor = input<string>('#64748b');    // Slate

  hoveredIndex = signal<number | null>(null);
  tooltip = signal<{
    x: number;
    y: number;
    label: string;
    value: number;
    balance: number;
    color: string;
  } | null>(null);

  private container = viewChild<ElementRef>('container');

  innerW = computed(() => {
    const el = this.container()?.nativeElement;
    const totalW = el ? el.getBoundingClientRect().width : 600;
    return Math.max(200, totalW - this.PAD_LEFT - this.PAD_RIGHT);
  });

  innerH = computed(() => this.height() - this.PAD_TOP - this.PAD_BOTTOM);

  // Compute intermediate running balances and waterfall metrics
  processedData = computed(() => {
    const raw = this.data();
    let balance = 0;
    return raw.map(item => {
      const start = balance;
      if (item.isTotal) {
        // If it's explicitly designated as a Total, the column represents the current total
        // but wait: does it reset or just display the accumulated balance? It displays the balance!
        const val = balance;
        return {
          label: item.label,
          value: val,
          start: 0,
          end: val,
          isTotal: true,
          runningBalance: val
        };
      } else {
        balance += item.value;
        return {
          label: item.label,
          value: item.value,
          start: start,
          end: balance,
          isTotal: false,
          runningBalance: balance
        };
      }
    });
  });

  // Bounds
  yMin = computed(() => {
    const vals = [0, ...this.processedData().map(d => d.end), ...this.processedData().map(d => d.start)];
    return Math.min(...vals) < 0 ? Math.min(...vals) * 1.1 : 0;
  });

  yMax = computed(() => {
    const vals = [0, ...this.processedData().map(d => d.end), ...this.processedData().map(d => d.start)];
    return Math.max(...vals) * 1.1;
  });

  yTicks = computed(() => niceTicks(this.yMin(), this.yMax(), 5));

  // Scale functions
  xPos(index: number, count: number): number {
    const step = this.innerW() / count;
    return index * step + step * 0.15; // 15% margin
  }

  yPos(y: number): number {
    return scale(y, this.yMin(), this.yMax(), this.innerH(), 0);
  }

  barWidth(count: number): number {
    return (this.innerW() / count) * 0.7; // 70% width
  }

  computedBars = computed(() => {
    const items = this.processedData();
    const count = items.length;
    if (count === 0) return [];
    const width = this.barWidth(count);

    return items.map((item, idx) => {
      const x = this.xPos(idx, count);
      const yStart = this.yPos(item.start);
      const yEnd = this.yPos(item.end);

      const y = Math.min(yStart, yEnd);
      const rectH = Math.max(2, Math.abs(yStart - yEnd));

      let color = this.totalColor();
      if (!item.isTotal) {
        color = item.value >= 0 ? this.positiveColor() : this.negativeColor();
      }

      // Connect line is drawn from the end value of this item
      const connectY = yEnd;

      return {
        x,
        y,
        rectH,
        width,
        color,
        connectY,
        label: item.label,
        value: item.value,
        balance: item.runningBalance,
        isTotal: item.isTotal
      };
    });
  });

  onBarHover(event: MouseEvent, bar: any, index: number) {
    this.hoveredIndex.set(index);
    const containerEl = this.container()?.nativeElement;
    if (!containerEl) return;
    const rect = containerEl.getBoundingClientRect();
    const tooltipX = event.clientX - rect.left;
    const tooltipY = event.clientY - rect.top;

    this.tooltip.set({
      x: tooltipX,
      y: tooltipY,
      label: bar.label,
      value: bar.value,
      balance: bar.balance,
      color: bar.color
    });
  }

  readonly fmtNum = fmtNum;
}
`;

export const BoxPlotChartSource = `import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {  niceTicks, scale, fmtNum  } from './chart-utils';

export interface BoxPlotItem {
  label: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  outliers?: number[];
}

@Component({
  selector: 'ngx-box-plot-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="ngx-box-plot-chart" (mouseleave)="hoveredIndex.set(null); tooltip.set(null)">
      <div class="chart-svg-container" #container>
        <svg
          [attr.width]="'100%'"
          [attr.height]="height()"
          class="chart-svg"
        >
          <g [attr.transform]="'translate(' + PAD_LEFT + ',' + PAD_TOP + ')'">
            <!-- Grid Lines (Horizontal) -->
            @if (showGrid()) {
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

            <!-- X-Axis Labels -->
            @for (item of data(); track $index; let i = $index) {
              <text
                [attr.x]="xPos(i) + boxWidth() / 2"
                [attr.y]="innerH() + 20"
                class="axis-label x"
                text-anchor="middle"
              >{{ item.label }}</text>
            }

            <!-- Box Plot Elements -->
            @for (box of computedBoxes(); track $index; let i = $index) {
              <!-- Whiskers (Vertical Lines) -->
              <line
                [attr.x1]="box.centerX"
                [attr.x2]="box.centerX"
                [attr.y1]="box.yMin"
                [attr.y2]="box.yMax"
                [attr.stroke]="color()"
                stroke-width="1.5"
              />

              <!-- Whisker Caps (Horizontal Lines) -->
              <line
                [attr.x1]="box.centerX - capWidth() / 2"
                [attr.x2]="box.centerX + capWidth() / 2"
                [attr.y1]="box.yMin"
                [attr.y2]="box.yMin"
                [attr.stroke]="color()"
                stroke-width="1.5"
              />
              <line
                [attr.x1]="box.centerX - capWidth() / 2"
                [attr.x2]="box.centerX + capWidth() / 2"
                [attr.y1]="box.yMax"
                [attr.y2]="box.yMax"
                [attr.stroke]="color()"
                stroke-width="1.5"
              />

              <!-- Interquartile Box -->
              <rect
                [attr.x]="box.x"
                [attr.y]="box.yQ3"
                [attr.width]="box.width"
                [attr.height]="box.boxHeight"
                [attr.fill]="fillColor()"
                [attr.stroke]="color()"
                stroke-width="2"
                [attr.rx]="2"
                class="boxplot-rect"
                [class.hovered]="hoveredIndex() === i"
                (mouseenter)="onBoxHover($event, box.raw, i)"
              />

              <!-- Median line -->
              <line
                [attr.x1]="box.x"
                [attr.x2]="box.x + box.width"
                [attr.y1]="box.yMedian"
                [attr.y2]="box.yMedian"
                [attr.stroke]="color()"
                stroke-width="2.5"
              />

              <!-- Outliers (plotted as circles) -->
              @for (outlier of box.outlierPoints; track $index) {
                <circle
                  [attr.cx]="box.centerX"
                  [attr.cy]="outlier.y"
                  [attr.r]="3.5"
                  [attr.fill]="outlierColor()"
                  [attr.stroke]="'#ffffff'"
                  stroke-width="1"
                  class="outlier-dot"
                  (mouseenter)="onOutlierHover($event, box.raw.label, outlier.value)"
                />
              }
            }

            <!-- Base axes borders -->
            <line x1="0" [attr.x2]="innerW()" [attr.y1]="innerH()" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #ced4da)"/>
            <line x1="0" x2="0" y1="0" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #ced4da)"/>
          </g>
        </svg>

        <!-- Tooltip -->
        @if (tooltip(); as t) {
          <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
            <div class="tooltip-header">{{ t.label }}</div>
            <div class="tooltip-body">
              @if (t.isOutlier) {
                <div class="tooltip-val">Outlier Value: <strong>{{ fmtNum(t.outlierVal!) }}</strong></div>
              } @else {
                <div class="tooltip-val">Max: <strong>{{ fmtNum(t.max) }}</strong></div>
                <div class="tooltip-val">Q3: <strong>{{ fmtNum(t.q3) }}</strong></div>
                <div class="tooltip-val">Median: <strong style="color: #38bdf8;">{{ fmtNum(t.median) }}</strong></div>
                <div class="tooltip-val">Q1: <strong>{{ fmtNum(t.q1) }}</strong></div>
                <div class="tooltip-val">Min: <strong>{{ fmtNum(t.min) }}</strong></div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  \`,
  styles: [\`
    :host {
      display: block;
      width: 100%;
    }
    .ngx-box-plot-chart {
      position: relative;
      background: var(--ngx-chart-bg, #ffffff);
      border-radius: 16px;
      padding: 16px;
      box-sizing: border-box;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
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
    .boxplot-rect {
      cursor: pointer;
      transition: opacity 0.2s, fill 0.2s, filter 0.2s;
    }
    .boxplot-rect.hovered {
      fill: var(--ngx-chart-hover-bg, rgba(79, 70, 229, 0.25));
      filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
    }
    .outlier-dot {
      cursor: crosshair;
      transition: r 0.15s, fill 0.15s;
    }
    .outlier-dot:hover {
      r: 5.5px;
      fill: #ef4444;
    }
    .chart-tooltip {
      position: absolute;
      pointer-events: none;
      transform: translate(-50%, -100%) translateY(-10px);
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
      color: #f8fafc;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 11px;
      z-index: 100;
      min-width: 120px;
    }
    .tooltip-header {
      font-weight: 700;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      padding-bottom: 4px;
      margin-bottom: 6px;
      color: #38bdf8;
    }
    .tooltip-body {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .tooltip-val {
      color: #94a3b8;
    }
    .tooltip-val strong {
      color: #f8fafc;
      font-family: monospace;
    }
  \`]
})
export class BoxPlotChartComponent {
  PAD_LEFT = 52;
  PAD_TOP = 20;
  PAD_RIGHT = 24;
  PAD_BOTTOM = 36;

  data = input<BoxPlotItem[]>([]);
  height = input<number>(300);
  showGrid = input<boolean>(true);
  showLabels = input<boolean>(true);

  // Styles
  color = input<string>('#4f46e5'); // Primary Indigo
  fillColor = input<string>('rgba(79, 70, 229, 0.12)'); // Translucent primary
  outlierColor = input<string>('#ef4444'); // Red/Rose

  hoveredIndex = signal<number | null>(null);
  tooltip = signal<{
    x: number;
    y: number;
    label: string;
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
    isOutlier: boolean;
    outlierVal?: number;
  } | null>(null);

  private container = viewChild<ElementRef>('container');

  innerW = computed(() => {
    const el = this.container()?.nativeElement;
    const totalW = el ? el.getBoundingClientRect().width : 600;
    return Math.max(200, totalW - this.PAD_LEFT - this.PAD_RIGHT);
  });

  innerH = computed(() => this.height() - this.PAD_TOP - this.PAD_BOTTOM);

  // Range and Ticks bounds calculation
  yMin = computed(() => {
    const items = this.data();
    if (items.length === 0) return 0;
    const allVals = items.flatMap(item => [
      item.min,
      ...(item.outliers || [])
    ]);
    const minVal = Math.min(...allVals);
    return minVal < 0 ? minVal * 1.15 : minVal * 0.85;
  });

  yMax = computed(() => {
    const items = this.data();
    if (items.length === 0) return 100;
    const allVals = items.flatMap(item => [
      item.max,
      ...(item.outliers || [])
    ]);
    return Math.max(...allVals) * 1.15;
  });

  yTicks = computed(() => niceTicks(this.yMin(), this.yMax(), 5));

  // Box positions
  xPos(index: number): number {
    const count = this.data().length || 1;
    const step = this.innerW() / count;
    return index * step + step * 0.2;
  }

  yPos(y: number): number {
    return scale(y, this.yMin(), this.yMax(), this.innerH(), 0);
  }

  boxWidth(): number {
    const count = this.data().length || 1;
    return (this.innerW() / count) * 0.6;
  }

  capWidth(): number {
    return this.boxWidth() * 0.45;
  }

  computedBoxes = computed(() => {
    const items = this.data();
    const count = items.length;
    if (count === 0) return [];
    const width = this.boxWidth();

    return items.map((item, idx) => {
      const x = this.xPos(idx);
      const centerX = x + width / 2;

      const yMin = this.yPos(item.min);
      const yQ1 = this.yPos(item.q1);
      const yMedian = this.yPos(item.median);
      const yQ3 = this.yPos(item.q3);
      const yMax = this.yPos(item.max);

      const boxHeight = Math.abs(yQ1 - yQ3);

      const outlierPoints = (item.outliers || []).map(val => ({
        value: val,
        y: this.yPos(val)
      }));

      return {
        x,
        centerX,
        width,
        yMin,
        yQ1,
        yMedian,
        yQ3,
        yMax,
        boxHeight,
        outlierPoints,
        raw: item
      };
    });
  });

  onBoxHover(event: MouseEvent, item: BoxPlotItem, index: number) {
    this.hoveredIndex.set(index);
    const containerEl = this.container()?.nativeElement;
    if (!containerEl) return;
    const rect = containerEl.getBoundingClientRect();
    const tooltipX = event.clientX - rect.left;
    const tooltipY = event.clientY - rect.top;

    this.tooltip.set({
      x: tooltipX,
      y: tooltipY,
      label: item.label,
      min: item.min,
      q1: item.q1,
      median: item.median,
      q3: item.q3,
      max: item.max,
      isOutlier: false
    });
  }

  onOutlierHover(event: MouseEvent, label: string, outlierVal: number) {
    const containerEl = this.container()?.nativeElement;
    if (!containerEl) return;
    const rect = containerEl.getBoundingClientRect();
    const tooltipX = event.clientX - rect.left;
    const tooltipY = event.clientY - rect.top;

    this.tooltip.set({
      x: tooltipX,
      y: tooltipY,
      label: \`\${label} (Outlier)\`,
      min: 0,
      q1: 0,
      median: 0,
      q3: 0,
      max: 0,
      isOutlier: true,
      outlierVal
    });
  }

  readonly fmtNum = fmtNum;
}
`;

export const RadialBarChartSource = `import {
  Component, ChangeDetectionStrategy, input, computed, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {  CHART_COLORS, fmtNum  } from './chart-utils';

export interface RadialBarItem {
  label: string;
  value: number;
  max: number;
  color?: string;
}

@Component({
  selector: 'ngx-radial-bar-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="ngx-radial-bar-chart" (mouseleave)="hoveredIndex.set(null); tooltip.set(null)">
      <div class="chart-layout">
        <!-- SVG Concentric Circles -->
        <div class="radial-visual">
          <svg
            [attr.width]="height()"
            [attr.height]="height()"
            [attr.viewBox]="'0 0 ' + size() + ' ' + size()"
            class="radial-svg"
          >
            <!-- Rotate group by -90deg so rings start at 12 o'clock -->
            <g [attr.transform]="'translate(' + center() + ',' + center() + ') rotate(-90)'">
              @for (ring of computedRings(); track $index; let i = $index) {
                <!-- Background track ring -->
                <circle
                  cx="0"
                  cy="0"
                  [attr.r]="ring.r"
                  fill="none"
                  [attr.stroke]="ring.color"
                  stroke-opacity="0.12"
                  [attr.stroke-width]="strokeWidth()"
                />

                <!-- Active progress ring -->
                <circle
                  cx="0"
                  cy="0"
                  [attr.r]="ring.r"
                  fill="none"
                  [attr.stroke]="ring.color"
                  [attr.stroke-width]="strokeWidth()"
                  [attr.stroke-dasharray]="ring.dashArray"
                  [attr.stroke-dashoffset]="0"
                  stroke-linecap="round"
                  class="progress-ring"
                  [class.hovered]="hoveredIndex() === i"
                  (mouseenter)="onRingHover($event, ring.raw, i)"
                />
              }
            </g>
          </svg>

          <!-- Inside Center Details (Hover/Selected summary) -->
          <div class="center-content">
            @if (hoveredIndex() !== null) {
              @if (computedRings()[hoveredIndex()!]; as active) {
                <span class="center-label">{{ active.label }}</span>
                <span class="center-value" [style.color]="active.color">
                  {{ active.pct }}%
                </span>
                <span class="center-sublabel">
                  {{ fmtNum(active.value) }} / {{ fmtNum(active.max) }}
                </span>
              }
            } @else if (data().length > 0) {
              <span class="center-label">Average</span>
              <span class="center-value">{{ avgPct() }}%</span>
              <span class="center-sublabel">Completed</span>
            }
          </div>
        </div>

        <!-- Legend / List -->
        @if (showLegend() && data().length > 0) {
          <div class="radial-legend">
            @for (ring of computedRings(); track $index; let i = $index) {
              <div
                class="legend-item"
                [class.active]="hoveredIndex() === i"
                (mouseenter)="hoveredIndex.set(i)"
                (mouseleave)="hoveredIndex.set(null)"
              >
                <span class="legend-color-dot" [style.background]="ring.color"></span>
                <div class="legend-content">
                  <span class="legend-title">{{ ring.label }}</span>
                  <div class="legend-metrics">
                    <span class="metric-value">{{ ring.pct }}%</span>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  \`,
  styles: [\`
    :host {
      display: block;
    }
    .ngx-radial-bar-chart {
      background: var(--ngx-chart-bg, #ffffff);
      border-radius: 16px;
      padding: 16px;
      box-sizing: border-box;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
    }
    .chart-layout {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 24px;
      flex-wrap: wrap;
    }
    .radial-visual {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .radial-svg {
      display: block;
    }
    .progress-ring {
      cursor: pointer;
      transition: stroke-width 0.2s, filter 0.2s, opacity 0.2s;
    }
    .progress-ring.hovered {
      stroke-width: 14px; /* thickens slightly on hover */
      filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.15));
    }
    .center-content {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      text-align: center;
    }
    .center-label {
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .center-value {
      font-size: 24px;
      font-weight: 800;
      color: #1e293b;
      line-height: 1.1;
      margin: 2px 0;
    }
    .center-sublabel {
      font-size: 10px;
      color: #94a3b8;
    }

    /* Legend */
    .radial-legend {
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 150px;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 12px;
      border-radius: 8px;
      border: 1px solid transparent;
      transition: all 0.2s;
      cursor: pointer;
    }
    .legend-item:hover, .legend-item.active {
      background: var(--ngx-chart-grid, #f8fafc);
      border-color: var(--ngx-chart-grid, #e2e8f0);
    }
    .legend-color-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .legend-content {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }
    .legend-title {
      font-size: 12px;
      font-weight: 600;
      color: #475569;
    }
    .metric-value {
      font-size: 12px;
      font-weight: 700;
      color: #1e293b;
    }
  \`]
})
export class RadialBarChartComponent {
  data = input<RadialBarItem[]>([]);
  height = input<number>(300);
  showLegend = input<boolean>(true);

  // Configuration properties
  strokeWidth = input<number>(10);
  ringGap = input<number>(4);
  colors = input<string[]>(CHART_COLORS);

  hoveredIndex = signal<number | null>(null);
  tooltip = signal<any | null>(null);

  size = computed(() => this.height());
  center = computed(() => this.size() / 2);

  // Ring properties
  computedRings = computed(() => {
    const raw = this.data();
    const count = raw.length;
    const centerPt = this.center();
    const ringW = this.strokeWidth();
    const gap = this.ringGap();

    // Start radii calculation from the outside inwards
    // Max radius leaves padding on outside
    const maxRadius = centerPt - ringW - 4;

    return raw.map((item, idx) => {
      // Offset outwards to inwards
      const r = maxRadius - idx * (ringW + gap);
      const pct = Math.min(100, Math.max(0, Math.round((item.value / item.max) * 100)));
      const color = item.color || this.colors()[idx % this.colors().length];

      // Circular arc math
      const C = 2 * Math.PI * r;
      // dasharray structure: "arcLength, circumference"
      const arcLength = (pct / 100) * C;
      const dashArray = \`\${arcLength}, \${C}\`;

      return {
        r,
        pct,
        color,
        dashArray,
        label: item.label,
        value: item.value,
        max: item.max,
        raw: item
      };
    });
  });

  // Calculate average percentage of completion
  avgPct = computed(() => {
    const raw = this.data();
    if (raw.length === 0) return 0;
    const sum = raw.reduce((acc, curr) => acc + (curr.value / curr.max), 0);
    return Math.round((sum / raw.length) * 100);
  });

  onRingHover(event: MouseEvent, item: RadialBarItem, index: number) {
    this.hoveredIndex.set(index);
  }

  readonly fmtNum = fmtNum;
}
`;

export const CandlestickChartSource = `import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {  niceTicks, scale, fmtNum  } from './chart-utils';

export interface CandlestickItem {
  date: string | Date;
  open: number;
  high: number;
  low: number;
  close: number;
}

@Component({
  selector: 'ngx-candlestick-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="ngx-candlestick-chart" (mouseleave)="hoveredIndex.set(null); tooltip.set(null)">
      <div class="chart-svg-container" #container>
        <svg
          [attr.width]="'100%'"
          [attr.height]="height()"
          class="chart-svg"
        >
          <g [attr.transform]="'translate(' + PAD_LEFT + ',' + PAD_TOP + ')'">
            <!-- Grid Lines (Horizontal) -->
            @if (showGrid()) {
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

            <!-- X-Axis Labels -->
            @for (item of data(); track $index; let i = $index) {
              <text
                [attr.x]="xPos(i) + candleWidth() / 2"
                [attr.y]="innerH() + 20"
                class="axis-label x"
                text-anchor="middle"
              >{{ formatDate(item.date) }}</text>
            }

            <!-- Candles -->
            @for (candle of computedCandles(); track $index; let i = $index) {
              <!-- Whisker/Wick Line (High to Low) -->
              <line
                [attr.x1]="candle.centerX"
                [attr.x2]="candle.centerX"
                [attr.y1]="candle.yHigh"
                [attr.y2]="candle.yLow"
                [attr.stroke]="candle.color"
                stroke-width="1.5"
              />

              <!-- Candle Body Rect (Open to Close) -->
              <rect
                [attr.x]="candle.x"
                [attr.y]="candle.y"
                [attr.width]="candle.width"
                [attr.height]="candle.rectH"
                [attr.fill]="candle.color"
                [attr.stroke]="candle.color"
                stroke-width="1"
                class="candle-rect"
                [class.hovered]="hoveredIndex() === i"
                (mouseenter)="onCandleHover($event, candle.raw, i)"
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
            <div class="tooltip-header">{{ formatDate(t.date) }}</div>
            <div class="tooltip-body">
              <div class="tooltip-direction" [style.color]="t.direction === 'Bullish' ? '#10b981' : '#ef4444'">
                <strong>{{ t.direction }}</strong> ({{ t.changePct }})
              </div>
              <div class="tooltip-val">High: <strong>{{ fmtNum(t.high) }}</strong></div>
              <div class="tooltip-val">Open: <strong>{{ fmtNum(t.open) }}</strong></div>
              <div class="tooltip-val">Close: <strong>{{ fmtNum(t.close) }}</strong></div>
              <div class="tooltip-val">Low: <strong>{{ fmtNum(t.low) }}</strong></div>
            </div>
          </div>
        }
      </div>
    </div>
  \`,
  styles: [\`
    :host {
      display: block;
      width: 100%;
    }
    .ngx-candlestick-chart {
      position: relative;
      background: var(--ngx-chart-bg, #ffffff);
      border-radius: 16px;
      padding: 16px;
      box-sizing: border-box;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
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
    .candle-rect {
      cursor: pointer;
      transition: fill 0.15s, opacity 0.15s, filter 0.15s;
    }
    .candle-rect.hovered {
      opacity: 0.85;
      filter: brightness(1.1) drop-shadow(0 4px 6px rgba(0,0,0,0.12));
    }
    .chart-tooltip {
      position: absolute;
      pointer-events: none;
      transform: translate(-50%, -100%) translateY(-10px);
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
      color: #f8fafc;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 11px;
      z-index: 100;
      min-width: 130px;
    }
    .tooltip-header {
      font-weight: 700;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      padding-bottom: 4px;
      margin-bottom: 6px;
      color: #38bdf8;
    }
    .tooltip-direction {
      font-size: 10px;
      font-weight: 700;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .tooltip-body {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .tooltip-val {
      color: #94a3b8;
    }
    .tooltip-val strong {
      color: #f8fafc;
      font-family: monospace;
    }
  \`]
})
export class CandlestickChartComponent {
  PAD_LEFT = 52;
  PAD_TOP = 20;
  PAD_RIGHT = 24;
  PAD_BOTTOM = 36;

  data = input<CandlestickItem[]>([]);
  height = input<number>(300);
  showGrid = input<boolean>(true);
  showLabels = input<boolean>(true);

  // Bullish/Bearish colors
  bullishColor = input<string>('#10b981'); // Emerald/Green
  bearishColor = input<string>('#ef4444');  // Rose/Red

  hoveredIndex = signal<number | null>(null);
  tooltip = signal<{
    x: number;
    y: number;
    date: string | Date;
    open: number;
    high: number;
    low: number;
    close: number;
    direction: 'Bullish' | 'Bearish';
    changePct: string;
  } | null>(null);

  private container = viewChild<ElementRef>('container');

  innerW = computed(() => {
    const el = this.container()?.nativeElement;
    const totalW = el ? el.getBoundingClientRect().width : 600;
    return Math.max(200, totalW - this.PAD_LEFT - this.PAD_RIGHT);
  });

  innerH = computed(() => this.height() - this.PAD_TOP - this.PAD_BOTTOM);

  // Range bounds calculation
  yMin = computed(() => {
    const items = this.data();
    if (items.length === 0) return 0;
    const lows = items.map(d => d.low);
    return Math.min(...lows) * 0.98; // 2% padding below
  });

  yMax = computed(() => {
    const items = this.data();
    if (items.length === 0) return 100;
    const highs = items.map(d => d.high);
    return Math.max(...highs) * 1.02; // 2% padding above
  });

  yTicks = computed(() => niceTicks(this.yMin(), this.yMax(), 5));

  // Category scaling positions
  xPos(index: number): number {
    const count = this.data().length || 1;
    const step = this.innerW() / count;
    return index * step + step * 0.15;
  }

  yPos(y: number): number {
    return scale(y, this.yMin(), this.yMax(), this.innerH(), 0);
  }

  candleWidth(): number {
    const count = this.data().length || 1;
    return (this.innerW() / count) * 0.7; // 70% width
  }

  computedCandles = computed(() => {
    const items = this.data();
    const count = items.length;
    if (count === 0) return [];
    const width = this.candleWidth();

    return items.map((item, idx) => {
      const x = this.xPos(idx);
      const centerX = x + width / 2;

      const yOpen = this.yPos(item.open);
      const yClose = this.yPos(item.close);
      const yHigh = this.yPos(item.high);
      const yLow = this.yPos(item.low);

      const y = Math.min(yOpen, yClose);
      const rectH = Math.max(2, Math.abs(yOpen - yClose));

      const isBullish = item.close >= item.open;
      const color = isBullish ? this.bullishColor() : this.bearishColor();

      return {
        x,
        centerX,
        width,
        yHigh,
        yLow,
        y,
        rectH,
        color,
        raw: item
      };
    });
  });

  onCandleHover(event: MouseEvent, item: CandlestickItem, index: number) {
    this.hoveredIndex.set(index);
    const containerEl = this.container()?.nativeElement;
    if (!containerEl) return;
    const rect = containerEl.getBoundingClientRect();
    const tooltipX = event.clientX - rect.left;
    const tooltipY = event.clientY - rect.top;

    const isBullish = item.close >= item.open;
    const change = item.close - item.open;
    const changePct = ((change / item.open) * 100).toFixed(2) + '%';

    this.tooltip.set({
      x: tooltipX,
      y: tooltipY,
      date: item.date,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      direction: isBullish ? 'Bullish' : 'Bearish',
      changePct
    });
  }

  formatDate(d: string | Date): string {
    if (d instanceof Date) {
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
    return d;
  }

  readonly fmtNum = fmtNum;
}
`;

export const BubbleChartSource = `import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CHART_COLORS, niceTicks, scale, fmtNum } from './chart-utils';

export interface BubblePoint {
  x: number;
  y: number;
  z: number;
  label?: string;
  group?: string;
}

@Component({
  selector: 'ngx-bubble-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="ngx-bubble-chart" [class.dark]="theme() === 'dark'" (mouseleave)="onMouseLeave()">
      <div class="chart-header">
        @if (showLegend() && uniqueGroups().length > 0) {
          <div class="chart-legend">
            @for (group of uniqueGroups(); track group) {
              <span class="legend-item">
                <span class="legend-dot" [style.background]="groupColor(group)"></span>
                {{ group }}
              </span>
            }
          </div>
        }
      </div>

      <div class="chart-svg-container" #container>
        <svg
          [attr.width]="'100%'"
          [attr.height]="height()"
          class="chart-svg"
        >
          <g [attr.transform]="'translate(' + PAD_LEFT + ',' + PAD_TOP + ')'">
            @if (showGrid()) {
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

            @for (tick of yTicks(); track tick) {
              <text x="-10" [attr.y]="yPos(tick) + 4" class="axis-label y" text-anchor="end">{{ fmtNum(tick) }}</text>
            }
            <text [attr.transform]="'rotate(-90) translate(' + (-innerH()/2) + ', -38)'" class="axis-title y" text-anchor="middle">{{ yTitle() }}</text>

            @for (tick of xTicks(); track tick) {
              <text [attr.x]="xPos(tick)" [attr.y]="innerH() + 20" class="axis-label x" text-anchor="middle">{{ fmtNum(tick) }}</text>
            }
            <text [attr.x]="innerW() / 2" [attr.y]="innerH() + 38" class="axis-title x" text-anchor="middle">{{ xTitle() }}</text>

            @if (hoveredPointIndex() !== null) {
              @if (scaledPoints()[hoveredPointIndex()!]; as pt) {
                <line [attr.x1]="0" [attr.x2]="innerW()" [attr.y1]="pt.cy" [attr.y2]="pt.cy" stroke="rgba(79,70,229,0.35)" stroke-width="1.2" stroke-dasharray="3,3"/>
                <line [attr.x1]="pt.cx" [attr.x2]="pt.cx" [attr.y1]="0" [attr.y2]="innerH()" stroke="rgba(79,70,229,0.35)" stroke-width="1.2" stroke-dasharray="3,3"/>
              }
            }

            @for (pt of scaledPoints(); track $index; let i = $index) {
              <circle
                [attr.cx]="pt.cx"
                [attr.cy]="pt.cy"
                [attr.r]="hoveredPointIndex() === i ? pt.r * 1.15 + 2 : pt.r"
                [attr.fill]="pt.color"
                [attr.stroke]="'#ffffff'"
                stroke-width="1.2"
                fill-opacity="0.65"
                class="bubble-point"
                (mouseenter)="onPointHover($event, pt.raw, i)"
                (mousemove)="onPointHover($event, pt.raw, i)"
              />
              @if (showLabels() && pt.r > 12) {
                <text [attr.x]="pt.cx" [attr.y]="pt.cy + 3" class="bubble-inner-label" text-anchor="middle" fill="#ffffff" pointer-events="none">
                  {{ pt.raw.label || fmtNum(pt.raw.z) }}
                </text>
              }
            }

            <line x1="0" [attr.x2]="innerW()" [attr.y1]="innerH()" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #ced4da)"/>
            <line x1="0" x2="0" y1="0" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #ced4da)"/>
          </g>
        </svg>

        @if (tooltip(); as t) {
          <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
            <div class="tt-cat">{{ t.label || 'Bubble Data' }}</div>
            <div class="tt-row">
              <span class="tt-dot" [style.background]="t.color"></span>
              <span class="tt-name">Group</span>
              <span class="tt-val">{{ t.group || 'Default' }}</span>
            </div>
            <div class="tt-row">
              <span class="tt-name">{{ xTitle() }}</span>
              <span class="tt-val">{{ fmtNum(t.xVal) }}</span>
            </div>
            <div class="tt-row">
              <span class="tt-name">{{ yTitle() }}</span>
              <span class="tt-val">{{ fmtNum(t.yVal) }}</span>
            </div>
            <div class="tt-row bubble-highlight-row">
              <span class="tt-name">{{ zTitle() }} (Size)</span>
              <span class="tt-val">{{ fmtNum(t.zVal) }}</span>
            </div>
          </div>
        }
      </div>
    </div>
  \`,
  styles: [\`
    :host { display: block; width: 100%; }
    .ngx-bubble-chart {
      position: relative;
      background: var(--ngx-chart-bg, #ffffff);
      border-radius: 16px;
      padding: 16px;
      box-sizing: border-box;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
    }
    .ngx-bubble-chart.dark {
      background: rgba(30, 32, 48, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.05);
      --ngx-chart-bg: transparent;
      --ngx-chart-grid: rgba(255, 255, 255, 0.06);
      --ngx-chart-axis: rgba(255, 255, 255, 0.12);
    }
    .chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .chart-legend { display: flex; gap: 16px; flex-wrap: wrap; }
    .legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; color: #64748b; }
    .dark .legend-item { color: #94a3b8; }
    .legend-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
    .chart-svg-container { position: relative; width: 100%; }
    .chart-svg { display: block; overflow: visible; }
    .axis-label { font-size: 10px; fill: #64748b; font-weight: 500; }
    .dark .axis-label { fill: #94a3b8; }
    .axis-title { font-size: 11px; font-weight: 600; fill: #475569; letter-spacing: 0.5px; }
    .dark .axis-title { fill: #cbd5e1; }
    .bubble-point { cursor: pointer; transition: r 0.25s cubic-bezier(0.16, 1, 0.3, 1), fill-opacity 0.2s; }
    .bubble-inner-label { font-size: 8px; font-weight: 700; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6); user-select: none; }
    .chart-tooltip {
      position: absolute; pointer-events: none; transform: translate(-50%, -100%) translateY(-10px);
      background: var(--ngx-chart-tooltip-bg, rgba(15, 23, 42, 0.92)); backdrop-filter: blur(12px);
      color: var(--ngx-chart-tooltip-color, #f8fafc); padding: 10px 14px; border-radius: 10px; font-size: 11px;
      z-index: 100; min-width: 160px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .tt-cat { font-weight: 700; margin-bottom: 6px; font-size: 12.5px; border-bottom: 1px solid rgba(255, 255, 255, 0.15); padding-bottom: 4px; color: #38bdf8; }
    .tt-row { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
    .bubble-highlight-row { margin-top: 6px; border-top: 1px dashed rgba(255, 255, 255, 0.1); padding-top: 4px; color: #fbbf24; }
    .tt-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  \`]
})
export class BubbleChartComponent {
  PAD_LEFT = 52;
  PAD_TOP = 16;
  PAD_RIGHT = 24;
  PAD_BOTTOM = 48;

  data = input<BubblePoint[]>([]);
  xTitle = input<string>('X Axis');
  yTitle = input<string>('Y Axis');
  zTitle = input<string>('Size');
  height = input<number>(300);
  showGrid = input<boolean>(true);
  showLegend = input<boolean>(true);
  showLabels = input<boolean>(true);
  theme = input<'light' | 'dark'>('light');
  colors = input<string[]>(CHART_COLORS);

  hoveredPointIndex = signal<number | null>(null);
  tooltip = signal<any | null>(null);

  private container = viewChild<ElementRef>('container');

  innerW = computed(() => {
    const el = this.container()?.nativeElement;
    const totalW = el ? el.getBoundingClientRect().width : 600;
    return Math.max(200, totalW - this.PAD_LEFT - this.PAD_RIGHT);
  });
  innerH = computed(() => this.height() - this.PAD_TOP - this.PAD_BOTTOM);

  uniqueGroups = computed(() => {
    const grps = new Set<string>();
    this.data().forEach(p => { if (p.group) grps.add(p.group); });
    return Array.from(grps);
  });

  groupColor(groupName?: string): string {
    if (!groupName) return this.colors()[0];
    const idx = this.uniqueGroups().indexOf(groupName);
    return this.colors()[idx % this.colors().length];
  }

  private xValues = computed(() => this.data().map(pt => pt.x));
  private xMin = computed(() => this.xValues().length > 0 ? Math.min(...this.xValues()) * 0.9 : 0);
  private xMax = computed(() => this.xValues().length > 0 ? Math.max(...this.xValues()) * 1.1 : 100);
  xTicks = computed(() => niceTicks(this.xMin(), this.xMax(), 5));

  private yValues = computed(() => this.data().map(pt => pt.y));
  private yMin = computed(() => this.yValues().length > 0 ? Math.min(...this.yValues()) * 0.9 : 0);
  private yMax = computed(() => this.yValues().length > 0 ? Math.max(...this.yValues()) * 1.1 : 100);
  yTicks = computed(() => niceTicks(this.yMin(), this.yMax(), 5));

  private zValues = computed(() => this.data().map(pt => pt.z));
  private zMin = computed(() => this.zValues().length > 0 ? Math.min(...this.zValues()) : 0);
  private zMax = computed(() => this.zValues().length > 0 ? Math.max(...this.zValues()) : 1);

  xPos(x: number): number { return scale(x, this.xMin(), this.xMax(), 0, this.innerW()); }
  yPos(y: number): number { return scale(y, this.yMin(), this.yMax(), this.innerH(), 0); }

  scaledPoints = computed(() => {
    return this.data().map((pt, i) => {
      const cx = this.xPos(pt.x);
      const cy = this.yPos(pt.y);
      const r = scale(pt.z, this.zMin(), this.zMax(), 5, 35);
      return { cx, cy, r, color: this.groupColor(pt.group), raw: pt };
    });
  });

  onPointHover(event: MouseEvent, pt: BubblePoint, index: number) {
    this.hoveredPointIndex.set(index);
    const containerEl = this.container()?.nativeElement;
    if (!containerEl) return;
    const rect = containerEl.getBoundingClientRect();
    this.tooltip.set({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      label: pt.label,
      group: pt.group,
      xVal: pt.x,
      yVal: pt.y,
      zVal: pt.z,
      color: this.groupColor(pt.group)
    });
  }

  onMouseLeave() {
    this.hoveredPointIndex.set(null);
    this.tooltip.set(null);
  }
}
`;

export const SunburstChartSource = `import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CHART_COLORS, fmtNum } from './chart-utils';

export interface SunburstNode {
  label: string;
  value?: number;
  color?: string;
  children?: SunburstNode[];
}

interface SunburstSlice {
  id: string;
  label: string;
  value: number;
  depth: number;
  startAngle: number;
  endAngle: number;
  path: string;
  color: string;
  parentPath: string;
  pct: number;
}

@Component({
  selector: 'ngx-sunburst-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="ngx-sunburst-chart" [class.dark]="theme() === 'dark'">
      <div class="chart-body">
        <svg
          class="chart-svg"
          [attr.viewBox]="'0 0 ' + height() + ' ' + height()"
          [attr.width]="height()"
          [attr.height]="height()"
        >
          <g [attr.transform]="'translate(' + cx() + ',' + cy() + ')'">
            @for (slice of slices(); track slice.id) {
              <path
                [attr.d]="slice.path"
                [attr.fill]="slice.color"
                [attr.stroke]="theme() === 'dark' ? '#1e2030' : '#ffffff'"
                stroke-width="1.5"
                class="sunburst-slice"
                [class.hovered]="hoveredSliceId() === slice.id"
                (mouseenter)="onSliceHover($event, slice)"
                (mouseleave)="onSliceLeave()"
              />
              @if (showLabels() && (slice.endAngle - slice.startAngle) > 0.15 && slice.depth < 2) {
                <text
                  [attr.transform]="labelTransform(slice)"
                  text-anchor="middle"
                  dominant-baseline="middle"
                  class="slice-label"
                >
                  {{ slice.label }}
                </text>
              }
            }
          </g>
        </svg>

        @if (showLegend() && topLevelNodes().length > 0) {
          <div class="chart-legend">
            @for (node of topLevelNodes(); track node.label; let i = $index) {
              <div class="legend-item">
                <span class="legend-dot" [style.background]="node.color || colors()[i % colors().length]"></span>
                <span class="legend-label">{{ node.label }}</span>
                <span class="legend-val">{{ fmtNum(getNodeValue(node)) }}</span>
              </div>
            }
          </div>
        }
      </div>

      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
          <div class="tt-path">{{ t.parentPath || t.label }}</div>
          <div class="tt-row">
            <span class="tt-dot" [style.background]="t.color"></span>
            <span class="tt-name">Value</span>
            <span class="tt-val">{{ fmtNum(t.value) }}</span>
          </div>
          <div class="tt-row">
            <span class="tt-name">Contribution</span>
            <span class="tt-val">{{ t.pct }}%</span>
          </div>
        </div>
      }
    </div>
  \`,
  styles: [\`
    :host { display: block; position: relative; }
    .ngx-sunburst-chart {
      position: relative; background: var(--ngx-chart-bg, #ffffff); border-radius: 16px; padding: 16px; box-sizing: border-box;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
    }
    .ngx-sunburst-chart.dark {
      background: rgba(30, 32, 48, 0.45); border: 1px solid rgba(255, 255, 255, 0.05); --ngx-chart-bg: transparent;
    }
    .chart-body { display: flex; align-items: center; justify-content: center; gap: 32px; flex-wrap: wrap; }
    .chart-svg { display: block; max-width: 100%; height: auto; }
    .sunburst-slice { cursor: pointer; transition: fill-opacity 0.2s; }
    .sunburst-slice:hover { fill-opacity: 0.9; }
    .slice-label { font-size: 9px; fill: #ffffff; font-weight: 700; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6); pointer-events: none; }
    .chart-legend { display: flex; flex-direction: column; gap: 8px; min-width: 160px; }
    .legend-item { display: flex; align-items: center; gap: 8px; }
    .legend-dot { width: 10px; height: 10px; border-radius: 3px; }
    .legend-label { flex: 1; color: #64748b; }
    .dark .legend-label { color: #94a3b8; }
    .legend-val { font-weight: 700; color: #334155; }
    .dark .legend-val { color: #cbd5e1; }
    .chart-tooltip {
      position: absolute; pointer-events: none; transform: translate(-50%, -100%) translateY(-10px);
      background: var(--ngx-chart-tooltip-bg, rgba(15, 23, 42, 0.92)); backdrop-filter: blur(12px);
      color: var(--ngx-chart-tooltip-color, #f8fafc); padding: 10px 14px; border-radius: 10px; font-size: 11px;
      z-index: 100; min-width: 160px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .tt-path { font-weight: 700; margin-bottom: 6px; font-size: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.15); padding-bottom: 4px; color: #38bdf8; }
    .tt-row { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
    .tt-dot { width: 8px; height: 8px; border-radius: 50%; }
  \`]
})
export class SunburstChartComponent {
  data = input<SunburstNode[]>([]);
  height = input<number>(300);
  showLegend = input<boolean>(true);
  showLabels = input<boolean>(true);
  theme = input<'light' | 'dark'>('light');
  colors = input<string[]>(CHART_COLORS);

  hoveredSliceId = signal<string | null>(null);
  tooltip = signal<any | null>(null);

  cx = computed(() => this.height() / 2);
  cy = computed(() => this.height() / 2);
  radius = computed(() => this.height() / 2 - 10);

  topLevelNodes = computed(() => this.data());

  maxDepth = computed(() => {
    const getDepth = (node: SunburstNode): number => {
      if (!node.children || node.children.length === 0) return 0;
      return 1 + Math.max(...node.children.map(getDepth));
    };
    const rootNodes = this.data();
    if (!rootNodes || rootNodes.length === 0) return 0;
    return Math.max(...rootNodes.map(getDepth));
  });

  getNodeValue(node: SunburstNode): number {
    if (node.value !== undefined) return node.value;
    if (node.children && node.children.length > 0) {
      return node.children.reduce((sum, c) => sum + this.getNodeValue(c), 0);
    }
    return 0;
  }

  private adjustColorBrightness(hex: string, percent: number): string {
    if (!hex.startsWith('#')) return hex;
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, Math.min(255, (num >> 16) + amt));
    const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
    const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  }

  private ringPath(startAngle: number, endAngle: number, outerR: number, innerR: number): string {
    const ox1 = Math.cos(startAngle) * outerR;
    const oy1 = Math.sin(startAngle) * outerR;
    const ox2 = Math.cos(endAngle) * outerR;
    const oy2 = Math.sin(endAngle) * outerR;
    const ix1 = Math.cos(startAngle) * innerR;
    const iy1 = Math.sin(startAngle) * innerR;
    const ix2 = Math.cos(endAngle) * innerR;
    const iy2 = Math.sin(endAngle) * innerR;
    const large = endAngle - startAngle > Math.PI ? 1 : 0;
    return \`M \${ix1} \${iy1} L \${ox1} \${oy1} A \${outerR} \${outerR} 0 \${large} 1 \${ox2} \${oy2} L \${ix2} \${iy2} A \${innerR} \${innerR} 0 \${large} 0 \${ix1} \${iy1} Z\`;
  }

  slices = computed(() => {
    const rootNodes = this.data();
    if (!rootNodes || rootNodes.length === 0) return [];
    const totalVal = rootNodes.reduce((sum, n) => sum + this.getNodeValue(n), 0) || 1;
    const list: SunburstSlice[] = [];
    const colorsList = this.colors();

    const processNode = (node: SunburstNode, depth: number, startAngle: number, endAngle: number, parentPath: string, color: string) => {
      const val = this.getNodeValue(node);
      const frac = val / totalVal;
      const angle = endAngle - startAngle;
      const maxRadius = this.radius();
      const numDepths = this.maxDepth() + 1;
      const depthWidth = maxRadius / numDepths;
      const innerR = depth * depthWidth;
      const outerR = (depth + 1) * depthWidth;
      const path = this.ringPath(startAngle, endAngle, outerR, innerR);
      const pathName = parentPath ? \`\${parentPath} › \${node.label}\` : node.label;
      const pct = Math.round(frac * 100);

      list.push({ id: \`\${depth}-\${node.label}-\${startAngle.toFixed(4)}\`, label: node.label, value: val, depth, startAngle, endAngle, path, color, parentPath: pathName, pct });

      if (node.children && node.children.length > 0) {
        const childrenSum = node.children.reduce((sum, c) => sum + this.getNodeValue(c), 0) || 1;
        let currStart = startAngle;
        node.children.forEach(child => {
          const childVal = this.getNodeValue(child);
          const childAngle = (childVal / childrenSum) * angle;
          const childEnd = currStart + childAngle;
          const childColor = child.color || this.adjustColorBrightness(color, -10);
          processNode(child, depth + 1, currStart, childEnd, pathName, childColor);
          currStart = childEnd;
        });
      }
    };

    let currentStart = -Math.PI / 2;
    rootNodes.forEach((node, idx) => {
      const val = this.getNodeValue(node);
      const angle = (val / totalVal) * Math.PI * 2;
      const end = currentStart + angle;
      const color = node.color || colorsList[idx % colorsList.length];
      processNode(node, 0, currentStart, end, '', color);
      currentStart = end;
    });
    return list;
  });

  labelTransform(slice: SunburstSlice): string {
    const depthWidth = this.radius() / (this.maxDepth() + 1);
    const r = (slice.depth + 0.5) * depthWidth;
    const midAngle = slice.startAngle + (slice.endAngle - slice.startAngle) / 2;
    const x = Math.cos(midAngle) * r;
    const y = Math.sin(midAngle) * r;
    let rotation = (midAngle * 180) / Math.PI;
    if (rotation > 90 && rotation < 270) { rotation -= 180; }
    else if (rotation < -90) { rotation += 180; }
    return \`translate(\${x}, \${y}) rotate(\${rotation})\`;
  }

  onSliceHover(event: MouseEvent, slice: SunburstSlice): void {
    this.hoveredSliceId.set(slice.id);
    const el = (event.currentTarget as SVGElement).ownerSVGElement!.parentElement!;
    const rect = el.getBoundingClientRect();
    this.tooltip.set({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      label: slice.label,
      parentPath: slice.parentPath,
      value: slice.value,
      pct: slice.pct,
      color: slice.color
    });
  }

  onSliceLeave(): void {
    this.hoveredSliceId.set(null);
    this.tooltip.set(null);
  }
}
`;

export const PolarAreaChartSource = `import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, viewChild, HostListener, inject, DestroyRef, output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CHART_COLORS, ChartDataPoint, fmtNum } from './chart-utils';

@Component({
  selector: 'ngx-polar-area-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="ngx-polar-area-chart">
      <div class="chart-header">
        <div class="chart-title-space"></div>
        @if (showExport()) {
          <div class="chart-export-menu">
            <button class="export-trigger" (click)="toggleExportMenu($event)" aria-label="Export Menu">📤 Export</button>
            @if (exportMenuOpen()) {
              <div class="export-dropdown">
                <button (click)="onExport('json')">📊 Export JSON</button>
                <button (click)="onExport('csv')">📄 Export CSV</button>
                <button (click)="onExport('svg')">🖼️ Export SVG</button>
              </div>
            }
          </div>
        }
      </div>

      <div class="chart-body">
        <svg
          #svgEl
          class="chart-svg"
          [attr.viewBox]="'0 0 ' + height() + ' ' + height()"
          [attr.width]="height()"
          [attr.height]="height()"
        >
          <g [attr.transform]="'translate(' + cx() + ',' + cy() + ')'">
            @for (level of gridLevels(); track level) {
              <circle
                cx="0"
                cy="0"
                [attr.r]="level.radius"
                fill="none"
                stroke="var(--ngx-chart-grid, #ebedf0)"
                stroke-width="1"
                stroke-dasharray="3,3"
              />
              @if (showLabels()) {
                <text
                  x="4"
                  [attr.y]="-level.radius + 12"
                  class="grid-label"
                >{{ fmtNum(level.value) }}</text>
              }
            }

            @for (slice of slices(); track slice.index) {
              <path
                [attr.d]="slice.path"
                [attr.fill]="slice.color"
                [attr.stroke]="'#fff'"
                stroke-width="1.5"
                fill-opacity="0.8"
                class="polar-slice"
                [class.hovered]="hovered() === slice.index"
                [style.transform]="hovered() === slice.index ? 'scale(1.04)' : 'scale(1)'"
                (mouseenter)="hovered.set(slice.index); onSliceHover($event, slice)"
                (mouseleave)="hovered.set(-1); tooltip.set(null)"
                (click)="onSliceClick(slice)"
              />
              
              @if (showLabels() && slice.value > 0) {
                <text
                  [attr.x]="labelX(slice)"
                  [attr.y]="labelY(slice)"
                  text-anchor="middle"
                  dominant-baseline="middle"
                  class="slice-label"
                >{{ fmtNum(slice.value) }}</text>
              }
            }
          </g>
        </svg>

        @if (showLegend()) {
          <div class="chart-legend">
            @for (slice of slices(); track slice.index) {
              <div class="legend-item" (mouseenter)="hovered.set(slice.index)" (mouseleave)="hovered.set(-1)">
                <span class="legend-dot" [style.background]="slice.color"></span>
                <span class="legend-label">{{ slice.label }}</span>
                <span class="legend-val">{{ fmtNum(slice.value) }}</span>
              </div>
            }
          </div>
        }
      </div>

      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
          <span class="tt-dot" [style.background]="t.color"></span>
          <strong>{{ t.label }}</strong>: {{ fmtNum(t.value) }}
        </div>
      }
    </div>
  \`,
  styles: [\`
    :host {
      display: block;
      position: relative;
    }
    .ngx-polar-area-chart {
      position: relative;
      background: var(--ngx-chart-bg, #fff);
      font-family: inherit;
      overflow: hidden;
    }
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      min-height: 24px;
      position: relative;
    }
    .chart-body {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 24px;
      flex-wrap: wrap;
    }
    .chart-svg {
      display: block;
      max-width: 100%;
      height: auto;
      min-width: 0;
      animation: polarGrow 0.75s cubic-bezier(0.16, 1, 0.3, 1) both;
      transform-origin: center;
    }

    @keyframes polarGrow {
      from { transform: scale(0.6) rotate(-45deg); opacity: 0; }
      to { transform: scale(1) rotate(0); opacity: 1; }
    }

    .polar-slice {
      cursor: pointer;
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), fill-opacity 0.15s;
      transform-origin: 0px 0px;
    }
    .polar-slice:hover {
      fill-opacity: 0.95;
    }
    .slice-label {
      font-size: 10px;
      fill: #fff;
      font-weight: 700;
      pointer-events: none;
      user-select: none;
      text-shadow: 0 1px 2px rgba(0,0,0,0.5);
    }
    .grid-label {
      font-size: 9px;
      fill: var(--ngx-chart-axis-text, #94a3b8);
      pointer-events: none;
      user-select: none;
    }
    .chart-legend {
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex-shrink: 0;
      min-width: 140px;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      cursor: pointer;
      padding: 5px 10px;
      border-radius: 8px;
      transition: all 0.15s;
    }
    .legend-item:hover {
      background: var(--ngx-chart-grid, #f1f3f5);
    }
    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 3px;
      flex-shrink: 0;
    }
    .legend-label {
      flex: 1;
      color: var(--ngx-chart-axis-text, #6c757d);
      font-weight: 550;
    }
    .legend-val {
      font-weight: 700;
      color: var(--ngx-chart-text, #212529);
    }

    .chart-tooltip {
      position: absolute;
      pointer-events: none;
      transform: translate(-50%, -100%) translateY(-8px);
      background: var(--ngx-chart-tooltip-bg, rgba(15, 23, 42, 0.92));
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      color: var(--ngx-chart-tooltip-color, #f8fafc);
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 12px;
      min-width: 120px;
      box-shadow: 0 10px 20px -5px rgba(0,0,0,0.25);
      border: 1px solid rgba(255, 255, 255, 0.1);
      z-index: 100;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: left 0.1s ease-out, top 0.1s ease-out;
      font-family: inherit;
    }
    .tt-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

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
  \`]
})
export class PolarAreaChartComponent {
  data = input<ChartDataPoint[]>([]);
  height = input<number>(280);
  showLegend = input<boolean>(true);
  showLabels = input<boolean>(true);
  colors = input<string[]>(CHART_COLORS);
  showExport = input<boolean>(false);

  sliceClick = output<ChartDataPoint>();

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  exportMenuOpen = signal(false);
  hovered = signal(-1);
  tooltip = signal<{x:number;y:number;label:string;value:number;color:string}|null>(null);

  svgSize = computed(() => this.height());
  cx = computed(() => this.svgSize() / 2);
  cy = computed(() => this.svgSize() / 2);
  maxRadius = computed(() => this.svgSize() / 2 - 25);

  private maxValue = computed(() => {
    const vals = this.data().map(d => d.value);
    return Math.max(1, ...vals);
  });

  gridLevels = computed(() => {
    const maxVal = this.maxValue();
    const maxR = this.maxRadius();
    return [
      { value: maxVal * 0.25, radius: maxR * 0.25 },
      { value: maxVal * 0.5, radius: maxR * 0.5 },
      { value: maxVal * 0.75, radius: maxR * 0.75 },
      { value: maxVal, radius: maxR }
    ];
  });

  slices = computed(() => {
    const d = this.data();
    if (!d.length) return [];
    const maxVal = this.maxValue();
    const maxR = this.maxRadius();
    const angleStep = (2 * Math.PI) / d.length;

    let currentAngle = -Math.PI / 2;

    return d.map((item, i) => {
      const start = currentAngle;
      const end = currentAngle + angleStep;
      const mid = start + angleStep / 2;

      const r = maxVal > 0 ? (item.value / maxVal) * maxR : 0;

      const x1 = Math.cos(start) * r;
      const y1 = Math.sin(start) * r;
      const x2 = Math.cos(end) * r;
      const y2 = Math.sin(end) * r;
      const largeArc = angleStep > Math.PI ? 1 : 0;
      const path = \`M 0 0 L \${x1} \${y1} A \${r} \${r} 0 \${largeArc} 1 \${x2} \${y2} Z\`;

      currentAngle = end;

      return {
        index: i,
        label: item.label,
        value: item.value,
        color: item.color || this.colors()[i % this.colors().length],
        path,
        midAngle: mid,
        radius: r
      };
    });
  });

  labelX(s: {midAngle:number; radius:number}): number {
    return Math.cos(s.midAngle) * s.radius * 0.7;
  }

  labelY(s: {midAngle:number; radius:number}): number {
    return Math.sin(s.midAngle) * s.radius * 0.7;
  }

  onSliceHover(event: MouseEvent, slice: {label:string;value:number;color:string}): void {
    const el = (event.currentTarget as HTMLElement).closest('.ngx-polar-area-chart') as HTMLElement;
    const rect = el.getBoundingClientRect();
    this.tooltip.set({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      label: slice.label,
      value: slice.value,
      color: slice.color
    });
  }

  onSliceClick(slice: {label:string;value:number;color?:string}) {
    this.sliceClick.emit({ label: slice.label, value: slice.value, color: slice.color });
  }

  toggleExportMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.exportMenuOpen.set(!this.exportMenuOpen());
  }

  closeExportMenu(): void {
    this.exportMenuOpen.set(false);
  }

  onExport(type: 'json' | 'csv' | 'svg'): void {
    this.exportMenuOpen.set(false);
    if (type === 'json') this.exportToJson();
    else if (type === 'csv') this.exportToCsv();
    else if (type === 'svg') this.exportToSvg();
  }

  exportToCsv(): void {
    const data = this.data();
    if (!data.length) return;
    let csv = 'Label,Value\\n';
    data.forEach(d => {
      csv += \`"\${d.label}",\${d.value}\\n\`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'polar-area-chart-data.csv');
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
    link.setAttribute('download', 'polar-area-chart-data.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToSvg(): void {
    const svg = this.svgEl()?.nativeElement;
    if (!svg) return;
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svg);
    if (!source.match(/^<svg[^>]+xmlns="http\\:\\/\\/www\\.w3\\.org\\/2000\\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    source = '<?xml version="1.0" encoding="utf-8"?>\\n' + source;
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'polar-area-chart.svg');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
`;

export const BulletChartSource = `import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngx-bullet-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="ngx-bullet-chart">
      <svg
        #svgEl
        class="bullet-svg"
        [attr.width]="'100%'"
        [attr.height]="svgHeight()"
      >
        <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
          @for (r of rangeRects(); track $index) {
            <rect
              [attr.x]="r.x"
              [attr.y]="0"
              [attr.width]="r.width"
              [attr.height]="barHeight()"
              [attr.fill]="r.color"
              class="bullet-range"
            />
          }

          <rect
            [attr.x]="0"
            [attr.y]="valBarY()"
            [attr.width]="valBarWidth()"
            [attr.height]="valBarHeight()"
            [attr.fill]="valueColor()"
            class="bullet-value-bar"
          />

          <line
            [attr.x1]="targetX()"
            [attr.x2]="targetX()"
            [attr.y1]="targetY1()"
            [attr.y2]="targetY2()"
            [attr.stroke]="targetColor()"
            stroke-width="3"
            class="bullet-target-marker"
          />

          @if (showLabels()) {
            <g class="bullet-labels" [attr.transform]="'translate(0,' + (barHeight() + 14) + ')'">
              <text x="0" text-anchor="middle" class="tick-label">0</text>
              @for (val of ranges(); track val) {
                <text
                  [attr.x]="xPos(val)"
                  text-anchor="middle"
                  class="tick-label"
                >{{ val }}</text>
              }
              <text [attr.x]="innerW()" text-anchor="middle" class="tick-label">{{ max() }}</text>
            </g>
          }
        </g>
      </svg>
    </div>
  \`,
  styles: [\`
    :host {
      display: block;
    }
    .ngx-bullet-chart {
      width: 100%;
      background: var(--ngx-chart-bg, #fff);
      font-family: inherit;
    }
    .bullet-svg {
      display: block;
      overflow: visible;
    }
    .bullet-range {
      transition: width 0.3s ease, x 0.3s ease;
    }
    .bullet-value-bar {
      transition: width 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .bullet-target-marker {
      transition: x1 0.5s cubic-bezier(0.16, 1, 0.3, 1), x2 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .tick-label {
      font-size: 10px;
      fill: var(--ngx-chart-axis-text, #64748b);
      font-weight: 550;
      user-select: none;
    }
  \`]
})
export class BulletChartComponent {
  value = input<number>(0);
  target = input<number>(0);
  max = input<number>(100);
  ranges = input<number[]>([50, 85, 100]);
  rangeColors = input<string[]>(['#f1f5f9', '#e2e8f0', '#cbd5e1']);
  valueColor = input<string>('#4f46e5');
  targetColor = input<string>('#ef4444');
  height = input<number>(50);
  showLabels = input<boolean>(true);

  containerWidth = signal<number>(500);

  margin = computed(() => ({
    top: 5,
    right: 15,
    bottom: this.showLabels() ? 20 : 5,
    left: 15
  }));

  svgHeight = computed(() => this.height() + this.margin().top + this.margin().bottom);
  innerW = computed(() => Math.max(10, this.containerWidth() - this.margin().left - this.margin().right));
  barHeight = computed(() => this.height());

  valBarHeight = computed(() => this.barHeight() * 0.35);
  valBarY = computed(() => (this.barHeight() - this.valBarHeight()) / 2);

  targetY1 = computed(() => this.barHeight() * 0.15);
  targetY2 = computed(() => this.barHeight() * 0.85);

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

  xPos(v: number): number {
    const maxVal = this.max() || 1;
    const clamped = Math.max(0, Math.min(maxVal, v));
    return (clamped / maxVal) * this.innerW();
  }

  valBarWidth = computed(() => this.xPos(this.value()));
  targetX = computed(() => this.xPos(this.target()));

  rangeRects = computed(() => {
    const limits = this.ranges();
    const colors = this.rangeColors();
    const rects: Array<{ x: number; width: number; color: string }> = [];

    let prev = 0;
    limits.forEach((limit, idx) => {
      const x = this.xPos(prev);
      const width = Math.max(0, this.xPos(limit) - x);
      const color = colors[idx % colors.length];
      rects.push({ x, width, color });
      prev = limit;
    });

    return rects;
  });
}
`;

export const DumbbellChartSource = `import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

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
  template: \\\`
    <div class="ngx-dumbbell-chart" (mouseleave)="onMouseLeave()">
      @if (showLegend() && data().length > 0) {
        <div class="chart-legend">
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
      <svg #svgEl class="dumbbell-svg" width="100%" [attr.height]="height()">
        <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
          @if (showGrid()) {
            @for (tick of xTicks(); track tick) {
              <line [attr.x1]="xPos(tick)" [attr.x2]="xPos(tick)" y1="0" [attr.y2]="innerH()" class="grid-line" />
            }
          }
          @for (item of computedItems(); track item.label; let i = $index) {
            <g class="dumbbell-row" [class.dimmed]="hoveredIndex() !== null && hoveredIndex() !== i" [class.highlighted]="hoveredIndex() === i" (mouseenter)="onRowHover(i, $event)" (mousemove)="onRowMouseMove($event)">
              <rect [attr.x]="-margin().left" [attr.y]="item.y - rowHeight() / 2" [attr.width]="containerWidth()" [attr.height]="rowHeight()" fill="transparent" style="cursor: pointer;" />
              @if (showLabels()) {
                <text [attr.x]="-10" [attr.y]="item.y" text-anchor="end" dominant-baseline="middle" class="y-axis-label">{{ item.label }}</text>
              }
              <line [attr.x1]="xPos(item.startValue)" [attr.x2]="xPos(item.endValue)" [attr.y1]="item.y" [attr.y2]="item.y" [attr.stroke]="item.barColor" stroke-width="4" stroke-linecap="round" class="connecting-bar" />
              <circle [attr.cx]="xPos(item.startValue)" [attr.cy]="item.y" [attr.r]="hoveredIndex() === i ? 8 : 6" [attr.fill]="item.sColor" class="endpoint-dot" />
              <circle [attr.cx]="xPos(item.endValue)" [attr.cy]="item.y" [attr.r]="hoveredIndex() === i ? 8 : 6" [attr.fill]="item.eColor" class="endpoint-dot" />
            </g>
          }
          <g [attr.transform]="'translate(0,' + innerH() + ')'" class="x-axis">
            <line x1="0" [attr.x2]="innerW()" y1="0" y2="0" class="axis-line" />
            @for (tick of xTicks(); track tick) {
              <g [attr.transform]="'translate(' + xPos(tick) + ',0)'">
                <line x1="0" x2="0" y1="0" y2="4" class="tick-line" />
                <text y="16" text-anchor="middle" class="tick-label">{{ formatNumber(tick) }}</text>
              </g>
            }
          </g>
        </g>
      </svg>
    </div>
  \\\`
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
  colors = input<string[]>([]);
  showLegend = input<boolean>(true);

  containerWidth = signal<number>(500);
  hoveredIndex = signal<number | null>(null);
  tooltip = signal<any | null>(null);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);

  margin = computed(() => ({ top: 20, right: 30, bottom: 30, left: this.showLabels() ? 100 : 20 }));
  innerW = computed(() => Math.max(10, this.containerWidth() - this.margin().left - this.margin().right));
  innerH = computed(() => Math.max(10, this.height() - this.margin().top - this.margin().bottom));

  constructor() {}
  minVal = computed(() => 0);
  maxVal = computed(() => 100);
  xTicks = computed(() => [0, 25, 50, 75, 100]);
  xPos(val: number): number { return 0; }
  rowHeight = computed(() => 30);
  computedItems = computed(() => []);
  onRowHover(idx: number, event: MouseEvent) {}
  onRowMouseMove(event: MouseEvent) {}
  onMouseLeave() {}
  formatNumber(v: number): string { return v.toString(); }
}
`;

export const LollipopChartSource = `import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngx-lollipop-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \\\`
    <div class="ngx-lollipop-chart" (mouseleave)="onMouseLeave()">
      <svg #svgEl class="lollipop-svg" width="100%" [attr.height]="height()">
        <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
          @for (item of computedItems(); track item.label; let i = $index) {
            <g class="lollipop-row" (mouseenter)="onItemHover(i, $event)" (mousemove)="onItemMouseMove($event)">
              <line [attr.x1]="0" [attr.x2]="xPos(item.value)" [attr.y1]="item.coord" [attr.y2]="item.coord" [attr.stroke]="item.color" stroke-width="2" class="lollipop-stem" />
              <circle [attr.cx]="xPos(item.value)" [attr.cy]="item.coord" [attr.r]="dotRadius()" [attr.fill]="item.color" class="lollipop-candy" />
            </g>
          }
        </g>
      </svg>
    </div>
  \\\`
})
export class LollipopChartComponent {
  data = input<any[]>([]);
  height = input<number>(350);
  showGrid = input<boolean>(true);
  showLabels = input<boolean>(true);
  orientation = input<'horizontal' | 'vertical'>('horizontal');
  colors = input<string[]>([]);
  dotRadius = input<number>(8);

  containerWidth = signal<number>(500);
  hoveredIndex = signal<number | null>(null);
  tooltip = signal<any | null>(null);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);

  margin = computed(() => ({ top: 20, right: 30, bottom: 40, left: 80 }));
  innerW = computed(() => 400);
  innerH = computed(() => 300);

  xPos(val: number): number { return 0; }
  computedItems = computed(() => []);
  onItemHover(idx: number, event: MouseEvent) {}
  onItemMouseMove(event: MouseEvent) {}
  onMouseLeave() {}
  formatNumber(v: number): string { return v.toString(); }
}
`;

export const SlopeChartSource = `import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SlopeDataPoint {
  label: string;
  startValue: number;
  endValue: number;
  color?: string;
}

@Component({
  selector: 'ngx-slope-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \\\`
    <div class="ngx-slope-chart" (mouseleave)="onMouseLeave()">
      <svg #svgEl class="slope-svg" width="100%" [attr.height]="height()">
        <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
          <line [attr.x1]="leftAxisX()" [attr.x2]="leftAxisX()" y1="0" [attr.y2]="innerH()" class="axis-line" />
          <line [attr.x1]="rightAxisX()" [attr.x2]="rightAxisX()" y1="0" [attr.y2]="innerH()" class="axis-line" />
          @for (item of computedItems(); track item.label; let i = $index) {
            <g class="slope-group" (mouseenter)="onSlopeHover(i, $event)" (mousemove)="onSlopeMouseMove($event)">
              <line [attr.x1]="leftAxisX()" [attr.x2]="rightAxisX()" [attr.y1]="item.leftY" [attr.y2]="item.rightY" [attr.stroke]="item.lineColor" stroke-width="2.5" class="slope-line" />
            </g>
          }
        </g>
      </svg>
    </div>
  \\\`
})
export class SlopeChartComponent {
  data = input<SlopeDataPoint[]>([]);
  startLabel = input<string>('Before');
  endLabel = input<string>('After');
  height = input<number>(350);
  showLabels = input<boolean>(true);
  showValues = input<boolean>(true);
  colors = input<string[]>([]);

  containerWidth = signal<number>(500);
  hoveredIndex = signal<number | null>(null);
  tooltip = signal<any | null>(null);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);

  margin = computed(() => ({ top: 40, right: 120, bottom: 20, left: 120 }));
  innerW = computed(() => 300);
  innerH = computed(() => 300);

  leftAxisX = computed(() => 0);
  rightAxisX = computed(() => 300);

  computedItems = computed(() => []);
  onSlopeHover(idx: number, event: MouseEvent) {}
  onSlopeMouseMove(event: MouseEvent) {}
  onMouseLeave() {}
  formatNumber(v: number): string { return v.toString(); }
}
`;

export const SankeyChartSource = `import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SankeyNode {
  id: string;
  label: string;
  color?: string;
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

@Component({
  selector: 'ngx-sankey-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \\\`
    <div class="ngx-sankey-chart" (mouseleave)="onMouseLeave()">
      <svg #svgEl class="sankey-svg" width="100%" [attr.height]="height()">
        <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
          @for (link of computedData().links; track link.sourceId + '-' + link.targetId) {
            <path [attr.d]="link.path" [attr.stroke]="link.color" [attr.stroke-width]="link.thickness" fill="none" class="sankey-link" />
          }
          @for (node of computedData().nodes; track node.id) {
            <rect [attr.x]="node.x" [attr.y]="node.y" [attr.width]="node.width" [attr.height]="node.height" [attr.fill]="node.color" class="sankey-node" />
          }
        </g>
      </svg>
    </div>
  \\\`
})
export class SankeyChartComponent {
  nodes = input<SankeyNode[]>([]);
  links = input<SankeyLink[]>([]);
  height = input<number>(400);
  showLabels = input<boolean>(true);
  showValues = input<boolean>(true);
  colors = input<string[]>([]);
  nodePadding = input<number>(16);
  nodeWidth = input<number>(20);

  containerWidth = signal<number>(500);
  hoveredNodeId = signal<string | null>(null);
  hoveredLinkId = signal<number | null>(null);
  tooltip = signal<any | null>(null);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);

  margin = computed(() => ({ top: 20, right: 80, bottom: 20, left: 80 }));
  innerW = computed(() => 400);
  innerH = computed(() => 300);

  computedData = computed(() => ({ nodes: [], links: [] }));
  onNodeHover(nodeId: string) {}
  onLinkHover(idx: number, event: MouseEvent) {}
  onLinkMouseMove(event: MouseEvent) {}
  onMouseLeave() {}
  formatNumber(v: number): string { return v.toString(); }
}
`;

export const ViolinPlotSource = `import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngx-violin-plot',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="ngx-violin-plot" (mouseleave)="onMouseLeave()">
      <svg #svgEl class="violin-svg" width="100%" [attr.height]="height()">
        <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
          @for (item of computedItems(); track item.label; let i = $index) {
            <g class="violin-group" (mouseenter)="onItemHover(i, $event)" (mousemove)="onItemMouseMove($event)">
              <path [attr.d]="item.path" [attr.fill]="item.color" fill-opacity="0.3" [attr.stroke]="item.color" stroke-width="1.5" />
            </g>
          }
        </g>
      </svg>
    </div>
  \`
})
export class ViolinPlotComponent {
  data = input<any[]>([]);
  height = input<number>(350);
  showGrid = input<boolean>(true);
  showLabels = input<boolean>(true);
  colors = input<string[]>([]);

  margin = computed(() => ({ top: 20, right: 20, bottom: 30, left: 45 }));
  computedItems = computed(() => []);
  onItemHover(idx: number, event: MouseEvent) {}
  onItemMouseMove(event: MouseEvent) {}
  onMouseLeave() {}
  formatNumber(v: number): string { return v.toString(); }
}
`;

export const RidgelineChartSource = `import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngx-ridgeline-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="ngx-ridgeline-chart" (mouseleave)="onMouseLeave()">
      <svg #svgEl class="ridgeline-svg" width="100%" [attr.height]="height()">
        <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
          @for (item of computedItems(); track item.label; let i = $index) {
            <g class="ridgeline-row" (mouseenter)="onRowHover(i, $event)" (mousemove)="onRowMouseMove($event)">
              <path [attr.d]="item.areaPath" [attr.fill]="item.color" fill-opacity="0.4" />
              <path [attr.d]="item.linePath" [attr.stroke]="item.color" stroke-width="2" fill="none" />
            </g>
          }
        </g>
      </svg>
    </div>
  \`
})
export class RidgelineChartComponent {
  data = input<any[]>([]);
  height = input<number>(400);
  showGrid = input<boolean>(true);
  showLabels = input<boolean>(true);
  colors = input<string[]>([]);
  overlap = input<number>(1.6);

  margin = computed(() => ({ top: 40, right: 20, bottom: 30, left: 90 }));
  computedItems = computed(() => []);
  onRowHover(idx: number, event: MouseEvent) {}
  onRowMouseMove(event: MouseEvent) {}
  onMouseLeave() {}
  formatNumber(v: number): string { return v.toString(); }
}
`;

export const ParetoChartSource = `import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngx-pareto-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="ngx-pareto-chart" (mouseleave)="onMouseLeave()">
      <svg #svgEl class="pareto-svg" width="100%" [attr.height]="height()">
        <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
          @for (item of computedItems(); track item.label; let i = $index) {
            <rect [attr.x]="item.barX" [attr.y]="0" width="20" height="100" [attr.fill]="barColor()" (mouseenter)="onItemHover(i, $event)" />
          }
        </g>
      </svg>
    </div>
  \`
})
export class ParetoChartComponent {
  data = input<any[]>([]);
  height = input<number>(350);
  showGrid = input<boolean>(true);
  showLabels = input<boolean>(true);
  barColor = input<string>('#4a90d9');
  lineColor = input<string>('#ff6358');

  margin = computed(() => ({ top: 30, right: 50, bottom: 30, left: 50 }));
  computedItems = computed(() => []);
  onItemHover(idx: number, event: MouseEvent) {}
  onItemMouseMove(event: MouseEvent) {}
  onMouseLeave() {}
  formatNumber(v: number): string { return v.toString(); }
}
`;

export const MarimekkoChartSource = `import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngx-marimekko-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="ngx-marimekko-chart" (mouseleave)="onMouseLeave()">
      <svg #svgEl class="marimekko-svg" width="100%" [attr.height]="height()">
        <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
          @for (col of computedCols(); track col.label; let i = $index) {
            @for (seg of col.segments; track seg.name; let j = $index) {
              <rect [attr.x]="col.x" [attr.y]="seg.y" [attr.width]="col.width" [attr.height]="seg.height" [attr.fill]="seg.color" (mouseenter)="onSegmentHover(i, j, $event)" />
            }
          }
        </g>
      </svg>
    </div>
  \`
})
export class MarimekkoChartComponent {
  data = input<any[]>([]);
  height = input<number>(400);
  showGrid = input<boolean>(true);
  showLabels = input<boolean>(true);
  colors = input<string[]>([]);

  margin = computed(() => ({ top: 20, right: 20, bottom: 30, left: 45 }));
  computedCols = computed(() => []);
  onSegmentHover(colIndex: number, segIndex: number, event: MouseEvent) {}
  onSegmentMouseMove(event: MouseEvent) {}
  onMouseLeave() {}
  formatNumber(v: number): string { return v.toString(); }
}
`;

export const ChordDiagramSource = `import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngx-chord-diagram',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="ngx-chord-diagram" (mouseleave)="onMouseLeave()">
      <svg #svgEl class="chord-svg" width="100%" [attr.height]="height()">
        <g [attr.transform]="'translate(' + (containerWidth() / 2) + ',' + (height() / 2) + ')'">
          @for (rib of computedRibbons(); track rib.path; let i = $index) {
            <path [attr.d]="rib.path" [attr.fill]="rib.color" fill-opacity="0.35" [class.highlighted]="hoveredRibbonIndex() === i" (mouseenter)="onRibbonHover(i, $event)" />
          }
        </g>
      </svg>
    </div>
  \`
})
export class ChordDiagramComponent {
  matrix = input<number[][]>([]);
  labels = input<string[]>([]);
  height = input<number>(400);
  showLabels = input<boolean>(true);
  colors = input<string[]>([]);

  containerWidth = signal<number>(500);
  hoveredNodeIndex = signal<number | null>(null);
  hoveredRibbonIndex = signal<number | null>(null);
  computedNodes = computed(() => []);
  computedRibbons = computed(() => []);
  onNodeHover(idx: number) {}
  onRibbonHover(idx: number, event: MouseEvent) {}
  onMouseMove(event: MouseEvent) {}
  onMouseLeave() {}
  formatNumber(v: number): string { return v.toString(); }
}
`;

export const DependencyWheelSource = `import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngx-dependency-wheel',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="ngx-dependency-wheel" (mouseleave)="onMouseLeave()">
      <svg #svgEl class="wheel-svg" width="100%" [attr.height]="height()">
        <g [attr.transform]="'translate(' + (containerWidth() / 2) + ',' + (height() / 2) + ')'">
          @for (dep of computedDependencies(); track dep.path; let i = $index) {
            <path [attr.d]="dep.path" [attr.fill]="dep.color" fill-opacity="0.3" (mouseenter)="onDependencyHover(i, $event)" />
          }
        </g>
      </svg>
    </div>
  \`
})
export class DependencyWheelComponent {
  matrix = input<number[][]>([]);
  labels = input<string[]>([]);
  height = input<number>(400);
  showLabels = input<boolean>(true);
  colors = input<string[]>([]);

  containerWidth = signal<number>(500);
  hoveredNodeIndex = signal<number | null>(null);
  hoveredDependencyIndex = signal<number | null>(null);
  computedNodes = computed(() => []);
  computedDependencies = computed(() => []);
  onNodeHover(idx: number) {}
  onDependencyHover(idx: number, event: MouseEvent) {}
  onMouseMove(event: MouseEvent) {}
  onMouseLeave() {}
  formatNumber(v: number): string { return v.toString(); }
}
`;

export const AdjacencyMatrixSource = `import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngx-adjacency-matrix',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="ngx-adjacency-matrix" (mouseleave)="onMouseLeave()">
      <svg #svgEl class="matrix-svg" width="100%" [attr.height]="height()">
        <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
          @for (cell of computedCells(); track cell.rowIdx + '-' + cell.colIdx) {
            <rect [attr.x]="cell.x" [attr.y]="cell.y" [attr.width]="cell.size" [attr.height]="cell.size" [attr.fill]="cell.color" [attr.fill-opacity]="cell.opacity" (mouseenter)="onCellHover(cell.rowIdx, cell.colIdx, $event)" />
          }
        </g>
      </svg>
    </div>
  \`
})
export class AdjacencyMatrixComponent {
  matrix = input<number[][]>([]);
  labels = input<string[]>([]);
  height = input<number>(400);
  showLabels = input<boolean>(true);
  color = input<string>('');

  margin = computed(() => ({ top: 80, right: 20, bottom: 20, left: 80 }));
  computedCells = computed(() => []);
  onCellHover(row: number, col: number, event: MouseEvent) {}
  onMouseMove(event: MouseEvent) {}
  onMouseLeave() {}
  formatNumber(v: number): string { return v.toString(); }
}
`;

export const BiplotSource = `import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngx-biplot',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="ngx-biplot" (mouseleave)="onMouseLeave()">
      <svg #svgEl class="biplot-svg" width="100%" [attr.height]="height()">
        <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
          @for (pt of computedPoints(); track pt.label; let i = $index) {
            <circle [attr.cx]="pt.cx" [attr.cy]="pt.cy" r="5" [attr.fill]="pt.color" (mouseenter)="onPointHover(i, $event)" />
          }
        </g>
      </svg>
    </div>
  \`
})
export class BiplotComponent {
  points = input<any[]>([]);
  vectors = input<any[]>([]);
  height = input<number>(400);
  showLabels = input<boolean>(true);
  colors = input<string[]>([]);

  margin = computed(() => ({ top: 40, right: 40, bottom: 40, left: 40 }));
  computedPoints = computed(() => []);
  computedVectors = computed(() => []);
  onPointHover(idx: number, event: MouseEvent) {}
  onMouseMove(event: MouseEvent) {}
  onMouseLeave() {}
  formatNumber(v: number): string { return v.toString(); }
}
`;

export const RenkoChartSource = `import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngx-renko-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \\\`
    <div class="ngx-renko-chart" (click)="closeExportMenu()">
      <div class="chart-header">
        @if (showExport()) {
          <div class="chart-export-menu" (click)="\\\\\\$event.stopPropagation()">
            <button class="export-trigger" (click)="toggleExportMenu(\\\\\\$event)">Export</button>
            @if (exportMenuOpen()) {
              <div class="export-dropdown">
                <button (click)="onExport('svg')">SVG</button>
                <button (click)="onExport('csv')">CSV</button>
                <button (click)="onExport('json')">JSON</button>
              </div>
            }
          </div>
        }
      </div>

      <div class="chart-body">
        <svg #svgEl class="renko-svg" width="100%" [attr.height]="height()">
          <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
            @if (showGrid()) {
              @for (tick of yTicks(); track tick) {
                <line
                  [attr.x1]="0"
                  [attr.x2]="chartWidth()"
                  [attr.y1]="yScale()(tick)"
                  [attr.y2]="yScale()(tick)"
                  stroke="var(--ngx-chart-grid, #e2e8f0)"
                  stroke-width="1"
                  stroke-dasharray="3,3"
                />
                <text
                  [attr.x]="-8"
                  [attr.y]="yScale()(tick) + 4"
                  text-anchor="end"
                  class="axis-label"
                >{{ formatNumber(tick) }}</text>
              }
            }

            @for (brick of computedBricks(); track brick.index) {
              <rect
                [attr.x]="brick.x"
                [attr.y]="brick.y"
                [attr.width]="brick.w"
                [attr.height]="brick.h"
                [attr.fill]="brick.color"
                class="renko-brick"
                (mouseenter)="onBrickHover(brick, \\\\\\$event)"
                (mousemove)="onBrickHover(brick, \\\\\\$event)"
                (mouseleave)="onMouseLeave()"
              />
            }
          </g>
        </svg>
      </div>

      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
          @if (tooltipTemplate()) {
            <ng-container *ngTemplateOutlet="tooltipTemplate()!; context: { \\\\\\$implicit: t.raw }"></ng-container>
          } @else {
            <div class="tooltip-default">
              <div class="tooltip-row">
                <span class="tooltip-label">Type:</span>
                <span class="tooltip-value" [style.color]="t.raw.type === 'up' ? 'var(--ngx-chart-up, #10b981)' : 'var(--ngx-chart-down, #ef4444)'">
                  {{ t.raw.type.toUpperCase() }}
                </span>
              </div>
              <div class="tooltip-row">
                <span class="tooltip-label">Top:</span>
                <span class="tooltip-value">{{ formatNumber(t.raw.top) }}</span>
              </div>
              <div class="tooltip-row">
                <span class="tooltip-label">Bottom:</span>
                <span class="tooltip-value">{{ formatNumber(t.raw.bottom) }}</span>
              </div>
            </div>
          }
        </div>
      }
    </div>
  \\\`,
  styles: [\\\`
    :host { display: block; }
    .ngx-renko-chart { position: relative; font-family: inherit; }
    .chart-header { display: flex; justify-content: flex-end; position: relative; height: 30px; }
    .chart-export-menu { position: relative; }
    .export-trigger {
      padding: 4px 10px; font-size: 11px; font-weight: 600;
      color: var(--ngx-chart-axis-text, #6c757d);
      background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(8px);
      border: 1px solid var(--ngx-chart-grid, #ebedf0); border-radius: 6px; cursor: pointer;
    }
    .export-dropdown {
      position: absolute; right: 0; top: calc(100% + 4px); background: #fff;
      border: 1px solid var(--ngx-chart-grid, #ebedf0); border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.08); padding: 4px; display: flex;
      flex-direction: column; gap: 2px; min-width: 100px; z-index: 50;
    }
    .export-dropdown button {
      background: none; border: none; padding: 6px 10px; font-size: 11px; text-align: left;
      cursor: pointer; width: 100%; border-radius: 4px;
    }
    .export-dropdown button:hover { background: rgba(79, 70, 229, 0.06); }
    .renko-brick { cursor: pointer; transition: opacity 0.15s; }
    .renko-brick:hover { opacity: 0.85; }
    .axis-label { font-size: 10px; fill: var(--ngx-chart-axis-text, #94a3b8); }
    .chart-tooltip {
      position: absolute; pointer-events: none; transform: translate(-50%, -100%) translateY(-8px);
      background: var(--ngx-chart-tooltip-bg, rgba(15, 23, 42, 0.92));
      color: var(--ngx-chart-tooltip-color, #f8fafc); padding: 8px 12px; border-radius: 8px;
      font-size: 12px; min-width: 120px; box-shadow: 0 10px 20px -5px rgba(0,0,0,0.25);
      border: 1px solid rgba(255, 255, 255, 0.1); z-index: 100;
    }
    .tooltip-default { display: flex; flex-direction: column; gap: 4px; }
    .tooltip-row { display: flex; justify-content: space-between; gap: 12px; }
    .tooltip-label { color: #94a3b8; }
    .tooltip-value { font-weight: 600; }
  \\\`]
})
export class RenkoChartComponent {
  data = input<number[]>([]);
  boxSize = input<number>(5);
  height = input<number>(350);
  showGrid = input<boolean>(true);
  bullishColor = input<string>('');
  bearishColor = input<string>('');
  tooltipTemplate = input<any | null>(null);
  labelFormatter = input<((v: number) => string) | null>(null);
  showExport = input<boolean>(false);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');
  containerWidth = signal<number>(600);
  exportMenuOpen = signal(false);
  tooltip = signal<{x: number; y: number; raw: any} | null>(null);

  margin = computed(() => ({ top: 20, right: 20, bottom: 20, left: 45 }));
  chartWidth = computed(() => Math.max(100, this.containerWidth() - this.margin().left - this.margin().right));
  chartHeight = computed(() => Math.max(100, this.height() - this.margin().top - this.margin().bottom));

  computedBricks = computed(() => {
    // Layout algorithm returning Renko bricks
    return [];
  });

  yScale = computed(() => (v: number) => 0);
  yTicks = computed(() => []);

  onBrickHover(brick: any, event: MouseEvent) {}
  onMouseLeave() { this.tooltip.set(null); }
  formatNumber(v: number): string {
    return this.labelFormatter() ? this.labelFormatter()!(v) : v.toString();
  }

  toggleExportMenu(event: MouseEvent) {
    event.stopPropagation();
    this.exportMenuOpen.set(!this.exportMenuOpen());
  }

  closeExportMenu() { this.exportMenuOpen.set(false); }
  onExport(type: 'json' | 'csv' | 'svg') {}
}
`;

export const KagiChartSource = `import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngx-kagi-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \\\`
    <div class="ngx-kagi-chart" (click)="closeExportMenu()">
      <div class="chart-header">
        @if (showExport()) {
          <div class="chart-export-menu" (click)="\\\\\\$event.stopPropagation()">
            <button class="export-trigger" (click)="toggleExportMenu(\\\\\\$event)">Export</button>
            @if (exportMenuOpen()) {
              <div class="export-dropdown">
                <button (click)="onExport('svg')">SVG</button>
                <button (click)="onExport('csv')">CSV</button>
                <button (click)="onExport('json')">JSON</button>
              </div>
            }
          </div>
        }
      </div>

      <div class="chart-body">
        <svg #svgEl class="kagi-svg" width="100%" [attr.height]="height()">
          <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
            @if (showGrid()) {
              @for (tick of yTicks(); track tick) {
                <line
                  [attr.x1]="0"
                  [attr.x2]="chartWidth()"
                  [attr.y1]="yScale()(tick)"
                  [attr.y2]="yScale()(tick)"
                  stroke="var(--ngx-chart-grid, #e2e8f0)"
                  stroke-width="1"
                  stroke-dasharray="3,3"
                />
                <text
                  [attr.x]="-8"
                  [attr.y]="yScale()(tick) + 4"
                  text-anchor="end"
                  class="axis-label"
                >{{ formatNumber(tick) }}</text>
              }
            }

            @for (seg of computedSegments(); track seg.index) {
              <line
                [attr.x1]="seg.x1"
                [attr.y1]="seg.y1"
                [attr.x2]="seg.x2"
                [attr.y2]="seg.y2"
                [attr.stroke]="seg.color"
                [attr.stroke-width]="seg.thickness"
                class="kagi-line"
                (mouseenter)="onSegmentHover(seg, \\\\\\$event)"
                (mousemove)="onSegmentHover(seg, \\\\\\$event)"
                (mouseleave)="onMouseLeave()"
              />
            }
          </g>
        </svg>
      </div>

      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
          @if (tooltipTemplate()) {
            <ng-container *ngTemplateOutlet="tooltipTemplate()!; context: { \\\\\\$implicit: t.raw }"></ng-container>
          } @else {
            <div class="tooltip-default">
              <div class="tooltip-row">
                <span class="tooltip-label">Type:</span>
                <span class="tooltip-value" [style.color]="t.raw.type === 'yang' ? 'var(--ngx-chart-up, #10b981)' : 'var(--ngx-chart-down, #ef4444)'">
                  {{ t.raw.type.toUpperCase() }}
                </span>
              </div>
              <div class="tooltip-row">
                <span class="tooltip-label">Start Price:</span>
                <span class="tooltip-value">{{ formatNumber(t.raw.start) }}</span>
              </div>
              <div class="tooltip-row">
                <span class="tooltip-label">End Price:</span>
                <span class="tooltip-value">{{ formatNumber(t.raw.end) }}</span>
              </div>
            </div>
          }
        </div>
      }
    </div>
  \\\`,
  styles: [\\\`
    :host { display: block; }
    .ngx-kagi-chart { position: relative; font-family: inherit; }
    .chart-header { display: flex; justify-content: flex-end; position: relative; height: 30px; }
    .chart-export-menu { position: relative; }
    .export-trigger {
      padding: 4px 10px; font-size: 11px; font-weight: 600;
      color: var(--ngx-chart-axis-text, #6c757d);
      background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(8px);
      border: 1px solid var(--ngx-chart-grid, #ebedf0); border-radius: 6px; cursor: pointer;
    }
    .export-dropdown {
      position: absolute; right: 0; top: calc(100% + 4px); background: #fff;
      border: 1px solid var(--ngx-chart-grid, #ebedf0); border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.08); padding: 4px; display: flex;
      flex-direction: column; gap: 2px; min-width: 100px; z-index: 50;
    }
    .export-dropdown button {
      background: none; border: none; padding: 6px 10px; font-size: 11px; text-align: left;
      cursor: pointer; width: 100%; border-radius: 4px;
    }
    .export-dropdown button:hover { background: rgba(79, 70, 229, 0.06); }
    .kagi-line { cursor: pointer; transition: opacity 0.15s; }
    .kagi-line:hover { opacity: 0.85; }
    .axis-label { font-size: 10px; fill: var(--ngx-chart-axis-text, #94a3b8); }
    .chart-tooltip {
      position: absolute; pointer-events: none; transform: translate(-50%, -100%) translateY(-8px);
      background: var(--ngx-chart-tooltip-bg, rgba(15, 23, 42, 0.92));
      color: var(--ngx-chart-tooltip-color, #f8fafc); padding: 8px 12px; border-radius: 8px;
      font-size: 12px; min-width: 120px; box-shadow: 0 10px 20px -5px rgba(0,0,0,0.25);
      border: 1px solid rgba(255, 255, 255, 0.1); z-index: 100;
    }
    .tooltip-default { display: flex; flex-direction: column; gap: 4px; }
    .tooltip-row { display: flex; justify-content: space-between; gap: 12px; }
    .tooltip-label { color: #94a3b8; }
    .tooltip-value { font-weight: 600; }
  \\\`]
})
export class KagiChartComponent {
  data = input<number[]>([]);
  reversalAmount = input<number>(15);
  height = input<number>(350);
  showGrid = input<boolean>(true);
  bullishColor = input<string>('');
  bearishColor = input<string>('');
  tooltipTemplate = input<any | null>(null);
  labelFormatter = input<((v: number) => string) | null>(null);
  showExport = input<boolean>(false);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');
  containerWidth = signal<number>(600);
  exportMenuOpen = signal(false);
  tooltip = signal<{x: number; y: number; raw: any} | null>(null);

  margin = computed(() => ({ top: 20, right: 20, bottom: 20, left: 45 }));
  chartWidth = computed(() => Math.max(100, this.containerWidth() - this.margin().left - this.margin().right));
  chartHeight = computed(() => Math.max(100, this.height() - this.margin().top - this.margin().bottom));

  computedSegments = computed(() => {
    // Layout algorithm returning Kagi segments
    return [];
  });

  yScale = computed(() => (v: number) => 0);
  yTicks = computed(() => []);

  onSegmentHover(seg: any, event: MouseEvent) {}
  onMouseLeave() { this.tooltip.set(null); }
  formatNumber(v: number): string {
    return this.labelFormatter() ? this.labelFormatter()!(v) : v.toString();
  }

  toggleExportMenu(event: MouseEvent) {
    event.stopPropagation();
    this.exportMenuOpen.set(!this.exportMenuOpen());
  }

  closeExportMenu() { this.exportMenuOpen.set(false); }
  onExport(type: 'json' | 'csv' | 'svg') {}
}
`;

export const PointFigureChartSource = `import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngx-point-figure-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \\\`
    <div class="ngx-point-figure-chart" (click)="closeExportMenu()">
      <div class="chart-header">
        @if (showExport()) {
          <div class="chart-export-menu" (click)="\\\\\\$event.stopPropagation()">
            <button class="export-trigger" (click)="toggleExportMenu(\\\\\\$event)">Export</button>
            @if (exportMenuOpen()) {
              <div class="export-dropdown">
                <button (click)="onExport('svg')">SVG</button>
                <button (click)="onExport('csv')">CSV</button>
                <button (click)="onExport('json')">JSON</button>
              </div>
            }
          </div>
        }
      </div>

      <div class="chart-body">
        <svg #svgEl class="pf-svg" width="100%" [attr.height]="height()">
          <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
            @if (showGrid()) {
              @for (tick of yTicks(); track tick) {
                <line
                  [attr.x1]="0"
                  [attr.x2]="chartWidth()"
                  [attr.y1]="yScale()(tick)"
                  [attr.y2]="yScale()(tick)"
                  stroke="var(--ngx-chart-grid, #e2e8f0)"
                  stroke-width="1"
                  stroke-dasharray="3,3"
                />
                <text
                  [attr.x]="-8"
                  [attr.y]="yScale()(tick) + 4"
                  text-anchor="end"
                  class="axis-label"
                >{{ formatNumber(tick) }}</text>
              }
            }

            @for (cell of computedCells(); track cell.colIdx + '-' + cell.rowIdx) {
              <g
                class="pf-cell"
                (mouseenter)="onCellHover(cell, \\\\\\$event)"
                (mousemove)="onCellHover(cell, \\\\\\$event)"
                (mouseleave)="onMouseLeave()"
              >
                @if (cell.type === 'X') {
                  <line
                    [attr.x1]="cell.x - cellSize()/3"
                    [attr.y1]="cell.y - cellSize()/3"
                    [attr.x2]="cell.x + cellSize()/3"
                    [attr.y2]="cell.y + cellSize()/3"
                    [attr.stroke]="cell.color"
                    stroke-width="2"
                  />
                  <line
                    [attr.x1]="cell.x + cellSize()/3"
                    [attr.y1]="cell.y - cellSize()/3"
                    [attr.x2]="cell.x - cellSize()/3"
                    [attr.y2]="cell.y + cellSize()/3"
                    [attr.stroke]="cell.color"
                    stroke-width="2"
                  />
                } @else {
                  <circle
                    [attr.cx]="cell.x"
                    [attr.cy]="cell.y"
                    [attr.r]="cellSize()/3"
                    fill="none"
                    [attr.stroke]="cell.color"
                    stroke-width="2"
                  />
                }
              </g>
            }
          </g>
        </svg>
      </div>

      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
          @if (tooltipTemplate()) {
            <ng-container *ngTemplateOutlet="tooltipTemplate()!; context: { \\\\\\$implicit: t.raw }"></ng-container>
          } @else {
            <div class="tooltip-default">
              <div class="tooltip-row">
                <span class="tooltip-label">Type:</span>
                <span class="tooltip-value" [style.color]="t.raw.type === 'X' ? 'var(--ngx-chart-up, #10b981)' : 'var(--ngx-chart-down, #ef4444)'">
                  {{ t.raw.type === 'X' ? 'ACQUISITION (X)' : 'DISTRIBUTION (O)' }}
                </span>
              </div>
              <div class="tooltip-row">
                <span class="tooltip-label">Price Level:</span>
                <span class="tooltip-value">{{ formatNumber(t.raw.price) }}</span>
              </div>
              <div class="tooltip-row">
                <span class="tooltip-label">Column:</span>
                <span class="tooltip-value">#{{ t.raw.colIdx + 1 }}</span>
              </div>
            </div>
          }
        </div>
      }
    </div>
  \\\`,
  styles: [\\\`
    :host { display: block; }
    .ngx-point-figure-chart { position: relative; font-family: inherit; }
    .chart-header { display: flex; justify-content: flex-end; position: relative; height: 30px; }
    .chart-export-menu { position: relative; }
    .export-trigger {
      padding: 4px 10px; font-size: 11px; font-weight: 600;
      color: var(--ngx-chart-axis-text, #6c757d);
      background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(8px);
      border: 1px solid var(--ngx-chart-grid, #ebedf0); border-radius: 6px; cursor: pointer;
    }
    .export-dropdown {
      position: absolute; right: 0; top: calc(100% + 4px); background: #fff;
      border: 1px solid var(--ngx-chart-grid, #ebedf0); border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.08); padding: 4px; display: flex;
      flex-direction: column; gap: 2px; min-width: 100px; z-index: 50;
    }
    .export-dropdown button {
      background: none; border: none; padding: 6px 10px; font-size: 11px; text-align: left;
      cursor: pointer; width: 100%; border-radius: 4px;
    }
    .export-dropdown button:hover { background: rgba(79, 70, 229, 0.06); }
    .pf-cell { cursor: pointer; }
    .axis-label { font-size: 10px; fill: var(--ngx-chart-axis-text, #94a3b8); }
    .chart-tooltip {
      position: absolute; pointer-events: none; transform: translate(-50%, -100%) translateY(-8px);
      background: var(--ngx-chart-tooltip-bg, rgba(15, 23, 42, 0.92));
      color: var(--ngx-chart-tooltip-color, #f8fafc); padding: 8px 12px; border-radius: 8px;
      font-size: 12px; min-width: 120px; box-shadow: 0 10px 20px -5px rgba(0,0,0,0.25);
      border: 1px solid rgba(255, 255, 255, 0.1); z-index: 100;
    }
    .tooltip-default { display: flex; flex-direction: column; gap: 4px; }
    .tooltip-row { display: flex; justify-content: space-between; gap: 12px; }
    .tooltip-label { color: #94a3b8; }
    .tooltip-value { font-weight: 600; }
  \\\`]
})
export class PointFigureChartComponent {
  data = input<number[]>([]);
  boxSize = input<number>(4);
  reversal = input<number>(3);
  height = input<number>(350);
  showGrid = input<boolean>(true);
  xColor = input<string>('');
  oColor = input<string>('');
  tooltipTemplate = input<any | null>(null);
  labelFormatter = input<((v: number) => string) | null>(null);
  showExport = input<boolean>(false);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');
  containerWidth = signal<number>(600);
  exportMenuOpen = signal(false);
  tooltip = signal<{x: number; y: number; raw: any} | null>(null);

  margin = computed(() => ({ top: 20, right: 20, bottom: 20, left: 45 }));
  chartWidth = computed(() => Math.max(100, this.containerWidth() - this.margin().left - this.margin().right));
  chartHeight = computed(() => Math.max(100, this.height() - this.margin().top - this.margin().bottom));
  cellSize = computed(() => 14);

  computedCells = computed(() => {
    // Layout algorithm returning Point & Figure cells
    return [];
  });

  yScale = computed(() => (v: number) => 0);
  yTicks = computed(() => []);

  onCellHover(cell: any, event: MouseEvent) {}
  onMouseLeave() { this.tooltip.set(null); }
  formatNumber(v: number): string {
    return this.labelFormatter() ? this.labelFormatter()!(v) : v.toString();
  }

  toggleExportMenu(event: MouseEvent) {
    event.stopPropagation();
    this.exportMenuOpen.set(!this.exportMenuOpen());
  }

  closeExportMenu() { this.exportMenuOpen.set(false); }
  onExport(type: 'json' | 'csv' | 'svg') {}
}
`;

export const WindRoseSource = `import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngx-wind-rose',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \\\`
    <div class="ngx-wind-rose" (click)="closeExportMenu()">
      <div class="chart-header">
        @if (showExport()) {
          <div class="chart-export-menu" (click)="\\\\\\$event.stopPropagation()">
            <button class="export-trigger" (click)="toggleExportMenu(\\\\\\$event)">Export</button>
            @if (exportMenuOpen()) {
              <div class="export-dropdown">
                <button (click)="onExport('svg')">SVG</button>
                <button (click)="onExport('csv')">CSV</button>
                <button (click)="onExport('json')">JSON</button>
              </div>
            }
          </div>
        }
      </div>

      <div class="chart-body">
        <svg #svgEl class="rose-svg" [attr.width]="height()" [attr.height]="height()">
          <g [attr.transform]="'translate(' + (height() / 2) + ',' + (height() / 2) + ')'">
            @for (circle of gridCircles(); track circle) {
              <circle cx="0" cy="0" [attr.r]="circle.r" fill="none" stroke="var(--ngx-chart-grid, #e2e8f0)" stroke-width="1" stroke-dasharray="3,3" />
            }

            @for (wedge of computedWedges(); track wedge.direction) {
              @for (bin of wedge.bins; track bin.binLabel; let bIdx = $index) {
                <path
                  [attr.d]="bin.path"
                  [attr.fill]="bin.color"
                  class="rose-wedge"
                  (mouseenter)="onWedgeHover(wedge, bin, \\\\\\$event)"
                  (mousemove)="onWedgeHover(wedge, bin, \\\\\\$event)"
                  (mouseleave)="onMouseLeave()"
                />
              }
            }
          </g>
        </svg>
      </div>

      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
          @if (tooltipTemplate()) {
            <ng-container *ngTemplateOutlet="tooltipTemplate()!; context: { \\\\\\$implicit: t.raw }"></ng-container>
          } @else {
            <div class="tooltip-default">
              <div class="tooltip-row">
                <span class="tooltip-label">Direction:</span>
                <span class="tooltip-value">{{ t.raw.direction }}</span>
              </div>
              <div class="tooltip-row">
                <span class="tooltip-label">Speed Bin:</span>
                <span class="tooltip-value">{{ t.raw.binLabel }} m/s</span>
              </div>
              <div class="tooltip-row">
                <span class="tooltip-label">Frequency:</span>
                <span class="tooltip-value">{{ formatNumber(t.raw.frequency) }}%</span>
              </div>
            </div>
          }
        </div>
      }
    </div>
  \\\`,
  styles: [\\\`
    :host { display: block; }
    .ngx-wind-rose { position: relative; font-family: inherit; display: flex; flex-direction: column; align-items: center; }
    .chart-header { display: flex; justify-content: flex-end; position: relative; height: 30px; width: 100%; }
    .chart-export-menu { position: relative; }
    .export-trigger {
      padding: 4px 10px; font-size: 11px; font-weight: 600;
      color: var(--ngx-chart-axis-text, #6c757d);
      background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(8px);
      border: 1px solid var(--ngx-chart-grid, #ebedf0); border-radius: 6px; cursor: pointer;
    }
    .export-dropdown {
      position: absolute; right: 0; top: calc(100% + 4px); background: #fff;
      border: 1px solid var(--ngx-chart-grid, #ebedf0); border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.08); padding: 4px; display: flex;
      flex-direction: column; gap: 2px; min-width: 100px; z-index: 50;
    }
    .export-dropdown button {
      background: none; border: none; padding: 6px 10px; font-size: 11px; text-align: left;
      cursor: pointer; width: 100%; border-radius: 4px;
    }
    .export-dropdown button:hover { background: rgba(79, 70, 229, 0.06); }
    .rose-wedge { cursor: pointer; transition: opacity 0.15s; }
    .rose-wedge:hover { opacity: 0.85; }
    .chart-tooltip {
      position: absolute; pointer-events: none; transform: translate(-50%, -100%) translateY(-8px);
      background: var(--ngx-chart-tooltip-bg, rgba(15, 23, 42, 0.92));
      color: var(--ngx-chart-tooltip-color, #f8fafc); padding: 8px 12px; border-radius: 8px;
      font-size: 12px; min-width: 120px; box-shadow: 0 10px 20px -5px rgba(0,0,0,0.25);
      border: 1px solid rgba(255, 255, 255, 0.1); z-index: 100;
    }
    .tooltip-default { display: flex; flex-direction: column; gap: 4px; }
    .tooltip-row { display: flex; justify-content: space-between; gap: 12px; }
    .tooltip-label { color: #94a3b8; }
    .tooltip-value { font-weight: 600; }
  \\\`]
})
export class WindRoseChartComponent {
  data = input<any[]>([]);
  height = input<number>(400);
  colors = input<string[]>([]);
  tooltipTemplate = input<any | null>(null);
  labelFormatter = input<((v: number) => string) | null>(null);
  showExport = input<boolean>(false);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');
  exportMenuOpen = signal(false);
  tooltip = signal<{x: number; y: number; raw: any} | null>(null);
  gridCircles = computed(() => [{ r: 50 }, { r: 100 }, { r: 150 }]);

  computedWedges = computed(() => {
    // Layout algorithm returning Wind Rose wedges
    return [];
  });

  onWedgeHover(wedge: any, bin: any, event: MouseEvent) {}
  onMouseLeave() { this.tooltip.set(null); }
  formatNumber(v: number): string {
    return this.labelFormatter() ? this.labelFormatter()!(v) : v.toFixed(1);
  }

  toggleExportMenu(event: MouseEvent) {
    event.stopPropagation();
    this.exportMenuOpen.set(!this.exportMenuOpen());
  }

  closeExportMenu() { this.exportMenuOpen.set(false); }
  onExport(type: 'json' | 'csv' | 'svg') {}
}
`;







