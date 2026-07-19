import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, HostListener, viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { niceTicks, scale, fmtNum, CHART_COLORS, smoothPath } from '../shared/chart-utils';

export interface ChartFlag {
  x: string | Date | number;
  y?: number;
  title: string;
  text?: string;
  color?: string;
  shape?: 'flag' | 'pin' | 'square' | 'circle';
}

export interface ChartSeries {
  name: string;
  data: number[];
  color?: string;
}

@Component({
  selector: 'ngx-flags',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-flags-chart" (mouseleave)="hoveredFlagIndex.set(null); tooltip.set(null)">
      <!-- Toolbar with Export option -->
      <div class="chart-header" (mousemove)="$event.stopPropagation()" (mouseleave)="hoveredFlagIndex.set(null); tooltip.set(null)">
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

      <div class="chart-svg-container" #container>
        <svg
          #svgEl
          [attr.width]="'100%'"
          [attr.height]="height()"
          class="chart-svg"
        >
          <g [attr.transform]="'translate(' + PAD_LEFT + ',' + PAD_TOP + ')'">
            <!-- Grid Lines (Horizontal) -->
            @if (showGrid() && hasDataset()) {
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
            @if (showLabels() && hasDataset()) {
              @for (tick of yTicks(); track tick) {
                <text
                  x="-10"
                  [attr.y]="yPos(tick) + 4"
                  class="axis-label y"
                  text-anchor="end"
                >{{ fmtNum(tick) }}</text>
              }
            }

            <!-- Background Line Chart (if dataset is provided) -->
            @if (hasDataset() && dataset(); as ds) {
              <!-- Area Fill -->
              <path
                [attr.d]="areaPath(ds)"
                fill="rgba(79, 70, 229, 0.05)"
                stroke="none"
              />
              <!-- Line Path -->
              <path
                [attr.d]="linePath(ds)"
                [attr.stroke]="ds.color || '#6366f1'"
                fill="none"
                stroke-width="2"
                stroke-linejoin="round"
                stroke-linecap="round"
                opacity="0.8"
              />
            } @else {
              <!-- Timeline Horizontal Base Line -->
              <line
                [attr.x1]="0"
                [attr.x2]="innerW()"
                [attr.y1]="innerH() / 2"
                [attr.y2]="innerH() / 2"
                stroke="#cbd5e1"
                stroke-width="2"
              />
            }

            <!-- X-Axis Labels -->
            @if (showLabels()) {
              @for (cat of categories(); track cat; let i = $index) {
                @if (shouldShowXLabel(i)) {
                  <text
                    [attr.x]="xPos(i)"
                    [attr.y]="innerH() + 20"
                    class="axis-label x"
                    text-anchor="middle"
                  >{{ formatDate(cat) }}</text>
                }
              }
            }

            <!-- Flags Layer -->
            @for (flag of computedFlags(); track $index; let i = $index) {
              <!-- Flagpole line -->
              <line
                [attr.x1]="flag.cx"
                [attr.y1]="flag.cy"
                [attr.x2]="flag.cx"
                [attr.y2]="flag.poleTop"
                [attr.stroke]="flag.color"
                stroke-width="1.5"
                [attr.stroke-dasharray]="flag.shape === 'pin' ? 'none' : '1,1'"
              />

              <!-- Flag Shape Banner -->
              <g
                class="flag-group"
                [class.hovered]="hoveredFlagIndex() === i"
                (mouseenter)="onFlagHover($event, flag.raw, i, flag.cx, flag.poleTop)"
                (mousemove)="onFlagHover($event, flag.raw, i, flag.cx, flag.poleTop)"
                style="cursor: pointer;"
              >
                <!-- Render flag banner by shape -->
                @if (flag.shape === 'flag') {
                  <!-- Standard flag banner pointing right -->
                  <path
                    [attr.d]="'M ' + flag.cx + ',' + flag.poleTop + 
                              ' L ' + (flag.cx + flag.width) + ',' + flag.poleTop + 
                              ' L ' + (flag.cx + flag.width - 5) + ',' + (flag.poleTop + 9) + 
                              ' L ' + (flag.cx + flag.width) + ',' + (flag.poleTop + 18) + 
                              ' L ' + flag.cx + ',' + (flag.poleTop + 18) + ' Z'"
                    [attr.fill]="flag.color"
                    [attr.stroke]="flag.color"
                    stroke-width="1"
                  />
                  <text
                    [attr.x]="flag.cx + flag.width / 2 - 2"
                    [attr.y]="flag.poleTop + 12"
                    text-anchor="middle"
                    fill="#ffffff"
                    font-size="9px"
                    font-weight="700"
                  >{{ flag.title }}</text>
                } @else if (flag.shape === 'pin') {
                  <!-- Pin Circle shape -->
                  <circle
                    [attr.cx]="flag.cx"
                    [attr.cy]="flag.poleTop - 8"
                    [attr.r]="10"
                    [attr.fill]="flag.color"
                    [attr.stroke]="'#ffffff'"
                    stroke-width="1.5"
                    [attr.filter]="hoveredFlagIndex() === i ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' : null"
                  />
                  <text
                    [attr.x]="flag.cx"
                    [attr.y]="flag.poleTop - 5"
                    text-anchor="middle"
                    fill="#ffffff"
                    font-size="9px"
                    font-weight="700"
                  >{{ flag.title }}</text>
                } @else if (flag.shape === 'circle') {
                  <!-- Circle shape flag -->
                  <circle
                    [attr.cx]="flag.cx"
                    [attr.cy]="flag.poleTop"
                    [attr.r]="9"
                    [attr.fill]="'#ffffff'"
                    [attr.stroke]="flag.color"
                    stroke-width="2"
                  />
                  <text
                    [attr.x]="flag.cx"
                    [attr.y]="flag.poleTop + 3"
                    text-anchor="middle"
                    [attr.fill]="flag.color"
                    font-size="9px"
                    font-weight="700"
                  >{{ flag.title }}</text>
                } @else {
                  <!-- Square shape flag (Default) -->
                  <rect
                    [attr.x]="flag.cx - flag.width / 2"
                    [attr.y]="flag.poleTop - 18"
                    [attr.width]="flag.width"
                    [attr.height]="18"
                    rx="3"
                    ry="3"
                    [attr.fill]="flag.color"
                    [attr.stroke]="'#ffffff'"
                    stroke-width="1"
                  />
                  <text
                    [attr.x]="flag.cx"
                    [attr.y]="flag.poleTop - 6"
                    text-anchor="middle"
                    fill="#ffffff"
                    font-size="9px"
                    font-weight="700"
                  >{{ flag.title }}</text>
                }
              </g>
            }

            <!-- Base axes borders (Only when dataset is present) -->
            @if (hasDataset()) {
              <line x1="0" [attr.x2]="innerW()" [attr.y1]="innerH()" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #ced4da)"/>
              <line x1="0" x2="0" y1="0" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #ced4da)"/>
            }
          </g>
        </svg>

        <!-- Tooltip -->
        @if (tooltip(); as t) {
          <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
            <div class="tooltip-header" [style.border-bottom-color]="t.color">
              <span class="flag-type-dot" [style.background]="t.color"></span>
              {{ t.title }}
            </div>
            <div class="tooltip-body">
              <div class="tooltip-date">Date: <strong>{{ formatDate(t.date) }}</strong></div>
              @if (t.text) {
                <div class="tooltip-desc">{{ t.text }}</div>
              }
              @if (t.yVal !== undefined) {
                <div class="tooltip-val" style="margin-top: 4px;">
                  <span>Value:</span>
                  <strong>{{ fmtNum(t.yVal) }}</strong>
                </div>
              }
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
    .ngx-flags-chart {
      position: relative;
      background: var(--ngx-chart-bg, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
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

    .flag-group {
      transition: transform 0.15s ease-out;
    }
    .flag-group.hovered {
      transform: scale(1.1);
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
      font-size: 11px;
      z-index: 100;
      min-width: 160px;
      max-width: 250px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: left 0.08s ease-out, top 0.08s ease-out;
    }
    .tooltip-header {
      font-weight: 700;
      margin-bottom: 6px;
      font-size: 12px;
      border-bottom: 1.5px solid rgba(255, 255, 255, 0.15);
      padding-bottom: 4px;
      color: #f8fafc;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .flag-type-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }
    .tooltip-body {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .tooltip-date {
      font-size: 10px;
      color: rgba(255, 255, 255, 0.6);
    }
    .tooltip-date strong {
      color: #38bdf8;
    }
    .tooltip-desc {
      font-size: 10.5px;
      color: rgba(248, 250, 252, 0.95);
      margin-top: 4px;
      line-height: 1.4;
      word-break: break-word;
    }
    .tooltip-val {
      display: flex;
      justify-content: space-between;
      color: rgba(248, 250, 252, 0.85);
    }
    .tooltip-val strong {
      color: #f8fafc;
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
      z-index: 60;
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
export class FlagsComponent {
  readonly PAD_LEFT = 52;
  readonly PAD_TOP = 40; // larger pad top to avoid flags clipping at the top
  readonly PAD_RIGHT = 24;
  readonly PAD_BOTTOM = 36;

  data = input.required<ChartFlag[]>();
  dataset = input<ChartSeries | null>(null);
  categories = input<string[]>([]);
  height = input<number>(300);
  showGrid = input<boolean>(true);
  showLabels = input<boolean>(true);
  showExport = input<boolean>(false);
  colors = input<string[]>(CHART_COLORS);

  exportMenuOpen = signal(false);
  hoveredFlagIndex = signal<number | null>(null);
  tooltip = signal<{
    x: number;
    y: number;
    title: string;
    text?: string;
    date: string;
    color: string;
    yVal?: number;
  } | null>(null);

  containerWidth = signal<number>(600);
  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');
  private container = viewChild<ElementRef>('container');

  constructor() {
    const hostEl = inject(ElementRef).nativeElement;
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(entries => {
        if (!entries || entries.length === 0) return;
        const width = entries[0].contentRect.width;
        if (width > 0) {
          // Subtract padding
          this.containerWidth.set(width - 32);
        }
      });
      resizeObserver.observe(hostEl);
      inject(DestroyRef).onDestroy(() => resizeObserver.disconnect());
    }
  }

  innerW = computed(() => Math.max(200, this.containerWidth() - this.PAD_LEFT - this.PAD_RIGHT));
  innerH = computed(() => Math.max(100, this.height() - this.PAD_TOP - this.PAD_BOTTOM));

  hasDataset = computed(() => {
    const ds = this.dataset();
    return !!(ds && ds.data && ds.data.length > 0);
  });

  yMin = computed(() => {
    if (!this.hasDataset()) return 0;
    const data = this.dataset()?.data || [];
    const minVal = Math.min(...data);
    return minVal < 0 ? minVal * 1.1 : minVal * 0.95;
  });

  yMax = computed(() => {
    if (!this.hasDataset()) return 100;
    const data = this.dataset()?.data || [];
    const maxVal = Math.max(...data);
    return maxVal * 1.05; // 5% margin
  });

  yTicks = computed(() => niceTicks(this.yMin(), this.yMax(), 5));

  xPos(index: number): number {
    const count = this.categories().length || 1;
    if (count <= 1) return this.innerW() / 2;
    return scale(index, 0, count - 1, 0, this.innerW());
  }

  yPos(y: number): number {
    return scale(y, this.yMin(), this.yMax(), this.innerH(), 0);
  }

  linePath(ds: ChartSeries): string {
    const pts: [number, number][] = ds.data.map((v, i) => [this.xPos(i), this.yPos(v)]);
    return smoothPath(pts);
  }

  areaPath(ds: ChartSeries): string {
    const pts: [number, number][] = ds.data.map((v, i) => [this.xPos(i), this.yPos(v)]);
    const line = smoothPath(pts);
    const last = pts[pts.length - 1];
    const first = pts[0];
    return line + ` L ${last[0]} ${this.innerH()} L ${first[0]} ${this.innerH()} Z`;
  }

  computedFlags = computed(() => {
    const flags = this.data();
    const cats = this.categories();
    const hasDS = this.hasDataset();
    const ds = this.dataset();

    return flags.map(flag => {
      // Find category index matching flag.x
      const flagXStr = String(flag.x);
      const idx = cats.findIndex(cat => String(cat) === flagXStr);
      
      let cx = this.innerW() / 2;
      let cy = this.innerH() / 2;
      let yVal: number | undefined;

      if (idx !== -1) {
        cx = this.xPos(idx);
        if (hasDS && ds) {
          yVal = flag.y !== undefined ? flag.y : ds.data[idx];
          if (yVal !== undefined) {
            cy = this.yPos(yVal);
          }
        } else {
          cy = this.innerH() / 2;
        }
      }

      // Height of flagpole: e.g. 35px
      const poleHeight = 35;
      const poleTop = cy - poleHeight;

      // Color
      const color = flag.color || this.colors()[0];
      const shape = flag.shape || 'flag';
      
      // Dynamic width based on title text
      const width = Math.max(18, flag.title.length * 8 + 8);

      return {
        cx,
        cy,
        poleTop,
        color,
        shape,
        width,
        title: flag.title,
        text: flag.text,
        yVal,
        raw: flag
      };
    });
  });

  shouldShowXLabel(index: number): boolean {
    const count = this.categories().length;
    if (count <= 10) return true;
    if (count <= 25) return index % 2 === 0;
    if (count <= 50) return index % 5 === 0;
    return index % 10 === 0;
  }

  onFlagHover(event: MouseEvent, flag: ChartFlag, index: number, cx: number, poleTop: number) {
    this.hoveredFlagIndex.set(index);
    const containerEl = this.container()?.nativeElement;
    if (!containerEl) return;
    const rect = containerEl.getBoundingClientRect();
    
    // Position tooltip above the flag banner
    const tooltipX = cx + this.PAD_LEFT;
    const tooltipY = poleTop + this.PAD_TOP - 10;

    let yVal: number | undefined;
    if (this.hasDataset() && this.dataset()) {
      const idx = this.categories().findIndex(cat => String(cat) === String(flag.x));
      if (idx !== -1) {
        yVal = flag.y !== undefined ? flag.y : this.dataset()!.data[idx];
      }
    }

    this.tooltip.set({
      x: tooltipX,
      y: tooltipY,
      title: flag.title,
      text: flag.text,
      date: String(flag.x),
      color: flag.color || this.colors()[0],
      yVal
    });
  }

  formatDate(d: string | Date | number): string {
    if (d instanceof Date) {
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
    return String(d);
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
    const items = this.data();
    if (!items.length) return;
    let csv = 'Coordinate,Title,Text,Color,Shape,YValue\n';
    items.forEach(item => {
      csv += `"${this.formatDate(item.x)}","${item.title}","${item.text || ''}","${item.color || ''}","${item.shape || 'flag'}",${item.y || ''}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'flags-annotation-data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToJson(): void {
    const blob = new Blob([JSON.stringify(this.data(), null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'flags-annotation-data.json');
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
    link.setAttribute('download', 'flags-chart.svg');
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
        <title>Timeline Flags Annotation Export</title>
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
          <div class="title">Timeline Flags Annotation Analytics</div>
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
