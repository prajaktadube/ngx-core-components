import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, HostListener, viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CHART_COLORS, niceTicks, scale, smoothPath, fmtNum } from '../shared/chart-utils';

export interface StreamgraphSeries {
  name: string;
  data: number[];
  color?: string;
}

@Component({
  selector: 'ngx-streamgraph',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-streamgraph" (mousemove)="onMouseMove($event)" (mouseleave)="onMouseLeave()">
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

      <!-- Legend -->
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
              <linearGradient [attr.id]="'stream-gradient-' + i" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" [attr.stop-color]="seriesColor(i, s)" stop-opacity="0.85"/>
                <stop offset="100%" [attr.stop-color]="seriesColor(i, s)" stop-opacity="0.6"/>
              </linearGradient>
            }
          </defs>
          
          <g [attr.transform]="'translate(' + PAD_LEFT + ',' + PAD_TOP + ')'">
            <!-- Central Baseline (Zero Reference) -->
            @if (showBaseline()) {
              <line [attr.x1]="0" [attr.x2]="innerW()" [attr.y1]="yPos(0)" [attr.y2]="yPos(0)" 
                stroke="var(--ngx-chart-axis, #cbd5e1)" stroke-dasharray="4,4" stroke-opacity="0.7"/>
            }

            <!-- Gridlines -->
            @for (tick of yTicks(); track tick) {
              <g [attr.transform]="'translate(0,' + yPos(tick) + ')'">
                @if (showGrid()) {
                  <line [attr.x1]="0" [attr.x2]="innerW()" stroke="var(--ngx-chart-grid, #f1f5f9)" stroke-dasharray="3,3"/>
                }
                <text x="-8" dy="4" class="axis-label" text-anchor="end">{{ fmtNum(Math.abs(tick)) }}</text>
              </g>
            }

            <!-- X Axis Categories -->
            @for (cat of inferredCategories(); track cat; let i = $index) {
              <text [attr.x]="xPos(i)" [attr.y]="innerH() + 16" class="axis-label" text-anchor="middle">{{ cat }}</text>
            }

            <!-- Flowing Spline Layers -->
            @for (layer of computedLayers(); track layer.name; let li = $index) {
              <path
                [attr.d]="layer.path"
                [attr.fill]="'url(#stream-gradient-' + li + ')'"
                [attr.stroke]="layer.color"
                stroke-width="0.5"
                stroke-opacity="0.5"
                class="stream-path"
                [class.dimmed]="activeSeriesIndex() !== null && activeSeriesIndex() !== li"
                [class.active]="activeSeriesIndex() === li"
                (mouseenter)="activeSeriesIndex.set(li)"
                (mouseleave)="activeSeriesIndex.set(null)"
              />
            }

            <!-- Vertical Crosshair -->
            @if (crosshair(); as ch) {
              <line [attr.x1]="ch.x" [attr.x2]="ch.x" y1="0" [attr.y2]="innerH()"
                stroke="var(--primary-color, #4f46e5)" stroke-opacity="0.4" stroke-width="1.5" stroke-dasharray="4,4"/>
            }

            <!-- Axis Line at bottom -->
            <line x1="0" [attr.x2]="innerW()" [attr.y1]="innerH()" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #cbd5e1)"/>
          </g>
        </svg>
      </div>

      <!-- Hover Tooltip -->
      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
          <div class="tt-cat">{{ t.cat }}</div>
          <div class="tt-total-row">Total Flow: <strong>{{ fmtNum(t.total) }}</strong></div>
          @for (row of t.rows; track row.name; let ri = $index) {
            <div class="tt-row" [class.highlight]="activeSeriesIndex() === ri">
              <span class="tt-dot" [style.background]="row.color"></span>
              <span class="tt-name">{{ row.name }}</span>
              <span class="tt-val">{{ fmtNum(row.value) }}</span>
              <span class="tt-percent">({{ row.percent }})</span>
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
    .ngx-streamgraph {
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
      width: 10px;
      height: 10px;
      border-radius: 50%;
      display: inline-block;
    }
    .chart-svg-wrap {
      position: relative;
      width: 100%;
    }
    .chart-svg {
      display: block;
      overflow: visible;
    }
    .axis-label {
      font-size: 10px;
      font-weight: 600;
      fill: var(--text-secondary, #94a3b8);
    }
    
    .stream-path {
      cursor: pointer;
      transition: fill-opacity 0.2s, opacity 0.2s, stroke-width 0.2s;
    }
    .stream-path.dimmed {
      opacity: 0.35;
    }
    .stream-path.active {
      opacity: 1;
      stroke-width: 1.5;
      stroke: #ffffff;
    }

    /* Premium Glassmorphic Tooltip */
    .chart-tooltip {
      position: absolute;
      pointer-events: none;
      transform: translate(-50%, -100%) translateY(-8px);
      background: var(--ngx-chart-tooltip-bg, rgba(15, 23, 42, 0.92));
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      color: var(--ngx-chart-tooltip-color, #f8fafc);
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 11.5px;
      min-width: 170px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      z-index: 100;
      transition: left 0.12s cubic-bezier(0.16, 1, 0.3, 1), top 0.12s cubic-bezier(0.16, 1, 0.3, 1);
      font-family: inherit;
    }
    .tt-cat {
      font-weight: 700;
      font-size: 12.5px;
      color: #38bdf8;
    }
    .tt-total-row {
      font-size: 11px;
      color: rgba(248, 250, 252, 0.7);
      margin-bottom: 8px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      padding-bottom: 4px;
    }
    .tt-row {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 4px;
      font-size: 11px;
      color: rgba(248, 250, 252, 0.85);
      transition: transform 0.1s, color 0.1s;
    }
    .tt-row.highlight {
      color: #ffffff;
      font-weight: bold;
      transform: scale(1.05);
    }
    .tt-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .tt-name {
      flex: 1;
    }
    .tt-val {
      font-weight: 600;
      font-family: monospace;
    }
    .tt-percent {
      font-size: 9.5px;
      color: rgba(248, 250, 252, 0.5);
      font-family: monospace;
    }

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
export class StreamgraphComponent {
  readonly PAD_LEFT = 48;
  readonly PAD_TOP = 15;
  readonly PAD_RIGHT = 16;
  readonly PAD_BOTTOM = 32;

  series = input<StreamgraphSeries[]>([]);
  categories = input<string[]>([]);
  height = input<number>(300);
  showGrid = input<boolean>(true);
  showLegend = input<boolean>(true);
  colors = input<string[]>(CHART_COLORS);
  showExport = input<boolean>(false);
  showBaseline = input<boolean>(true);

  exportMenuOpen = signal(false);
  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  crosshair = signal<{ x: number } | null>(null);
  activeSeriesIndex = signal<number | null>(null);
  activeCategoryIndex = signal<number | null>(null);
  tooltip = signal<{ x: number; y: number; cat: string; total: number; rows: { name: string; value: number; percent: string; color: string }[] } | null>(null);
  containerWidth = signal<number>(600);

  innerW = computed(() => Math.max(10, this.containerWidth() - this.PAD_LEFT - this.PAD_RIGHT));
  innerH = computed(() => Math.max(10, this.height() - this.PAD_TOP - this.PAD_BOTTOM));

  inferredCategories = computed(() => {
    const cats = this.categories();
    if (cats.length > 0) return cats;
    const s = this.series();
    if (s.length === 0) return [];
    const maxLen = Math.max(...s.map(ser => ser.data.length));
    return Array.from({ length: maxLen }, (_, i) => `Point ${i + 1}`);
  });

  animateState = signal(false);

  constructor() {
    const hostEl = inject(ElementRef).nativeElement;
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(entries => {
        if (!entries || entries.length === 0) return;
        const width = entries[0].contentRect.width;
        if (width > 0) {
          this.containerWidth.set(width - 40);
        }
      });
      resizeObserver.observe(hostEl);
      inject(DestroyRef).onDestroy(() => resizeObserver.disconnect());
    }
    setTimeout(() => this.animateState.set(true), 50);
  }

  // Calculate standard stacked stream offsets (Silhouette)
  private stackLayout = computed(() => {
    const sers = this.series();
    const numCats = this.inferredCategories().length;
    if (sers.length === 0 || numCats === 0) return { min: 0, max: 100, seriesLayers: [] };

    // Initialize stacks
    const lowStack: number[][] = Array.from({ length: sers.length }, () => Array(numCats).fill(0));
    const highStack: number[][] = Array.from({ length: sers.length }, () => Array(numCats).fill(0));
    const sumAtIdx = Array(numCats).fill(0);

    // Compute sums at each index
    for (let i = 0; i < numCats; i++) {
      let sum = 0;
      for (let j = 0; j < sers.length; j++) {
        sum += sers[j].data[i] || 0;
      }
      sumAtIdx[i] = sum;
    }

    let globalMin = 0;
    let globalMax = 1;

    for (let i = 0; i < numCats; i++) {
      const sum = sumAtIdx[i];
      const offset = -sum / 2; // Symmetric Center
      let runningSum = 0;
      for (let j = 0; j < sers.length; j++) {
        const val = sers[j].data[i] || 0;
        lowStack[j][i] = offset + runningSum;
        highStack[j][i] = offset + runningSum + val;
        runningSum += val;

        if (lowStack[j][i] < globalMin) globalMin = lowStack[j][i];
        if (highStack[j][i] > globalMax) globalMax = highStack[j][i];
      }
    }

    return {
      min: globalMin,
      max: globalMax,
      lowStack,
      highStack,
      sumAtIdx
    };
  });

  private yDomain = computed(() => {
    const layout = this.stackLayout();
    const min = layout.min;
    const max = layout.max;
    // Keep it symmetric
    const bounds = Math.max(Math.abs(min), Math.abs(max));
    return {
      min: -bounds,
      max: bounds
    };
  });

  yTicks = computed(() => {
    const domain = this.yDomain();
    return niceTicks(domain.min, domain.max, 5);
  });

  yPos(v: number): number {
    const ticks = this.yTicks();
    return scale(v, ticks[0], ticks[ticks.length - 1], this.innerH(), 0);
  }

  xPos(i: number): number {
    const n = this.inferredCategories().length;
    return n <= 1 ? this.innerW() / 2 : scale(i, 0, n - 1, 0, this.innerW());
  }

  seriesColor(i: number, s: StreamgraphSeries): string {
    return s.color || this.colors()[i % this.colors().length];
  }

  computedLayers = computed(() => {
    const sers = this.series();
    const layout = this.stackLayout();
    if (sers.length === 0 || !layout.lowStack) return [];

    return sers.map((s, si) => {
      const lowPts: [number, number][] = s.data.map((_, i) => [this.xPos(i), this.yPos(layout.lowStack![si][i])]);
      const highPts: [number, number][] = s.data.map((_, i) => [this.xPos(i), this.yPos(layout.highStack![si][i])]);

      const highPath = smoothPath(highPts);
      const lowPtsReversed = [...lowPts].reverse();
      const lowPathReversed = smoothPath(lowPtsReversed);
      
      let path = '';
      if (highPath && lowPathReversed) {
        path = `${highPath} L ${lowPtsReversed[0][0]} ${lowPtsReversed[0][1]} ${lowPathReversed.slice(1)} Z`;
      }

      return {
        name: s.name,
        color: this.seriesColor(si, s),
        path
      };
    });
  });

  onMouseMove(event: MouseEvent): void {
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const mx = event.clientX - rect.left - this.PAD_LEFT;
    const cats = this.inferredCategories();
    if (cats.length === 0) return;
    const idx = Math.round(scale(mx, 0, this.innerW(), 0, cats.length - 1));
    const ci = Math.max(0, Math.min(cats.length - 1, idx));
    this.crosshair.set({ x: this.xPos(ci) });
    this.activeCategoryIndex.set(ci);

    const layout = this.stackLayout();
    const totalFlow = layout.sumAtIdx ? layout.sumAtIdx[ci] : 0;

    const rows = this.series().map((s, si) => {
      const value = s.data[ci] || 0;
      const pct = totalFlow > 0 ? ((value / totalFlow) * 100).toFixed(1) + '%' : '0%';
      return {
        name: s.name,
        value,
        percent: pct,
        color: this.seriesColor(si, s)
      };
    });

    this.tooltip.set({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      cat: cats[ci],
      total: totalFlow,
      rows
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

  exportToJson(): void {
    const cats = this.inferredCategories();
    const sers = this.series();
    if (!cats.length || !sers.length) return;

    const data = cats.map((cat, ci) => {
      const entry: Record<string, any> = { category: cat };
      sers.forEach(s => {
        entry[s.name] = s.data[ci] || 0;
      });
      return entry;
    });

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'streamgraph-data.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToCsv(): void {
    const cats = this.inferredCategories();
    const sers = this.series();
    if (!cats.length || !sers.length) return;

    let headers = ['Category', ...sers.map(s => `"${s.name}"`)];
    let csv = headers.join(',') + '\n';

    cats.forEach((cat, ci) => {
      const row = [`"${cat}"`, ...sers.map(s => String(s.data[ci] || 0))];
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'streamgraph-data.csv');
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
    link.setAttribute('download', 'streamgraph.svg');
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
        <title>Streamgraph Chart Export</title>
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
          <div class="title">Streamgraph Visualization Analysis</div>
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
  readonly Math = Math;
}
