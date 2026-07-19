import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, TemplateRef, viewChild, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CHART_COLORS, fmtNum, niceTicks, scale } from '../shared/chart-utils';

export interface ErrorBarPoint {
  label: string;
  value: number;
  errorPlus: number;
  errorMinus: number;
  color?: string;
  x: number;
  y: number;
  yTop: number;
  yBottom: number;
}

@Component({
  selector: 'ngx-error-bar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-error-bar" (mouseleave)="onMouseLeave()">
      <div class="chart-header" (mousemove)="$event.stopPropagation()" (mouseleave)="onMouseLeave()">
        <div class="header-info">
          <span class="header-title">Error Bar Estimation</span>
          <span class="header-subtitle">Uncertainty margins visualization</span>
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
        class="error-bar-svg"
        [attr.width]="'100%'"
        [attr.height]="svgHeight()"
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

          <!-- Bars (if chartType is 'bar') -->
          @if (chartType() === 'bar') {
            @for (pt of computedPoints(); track pt.label; let i = $index) {
              <rect
                [attr.x]="pt.x - barWidth() / 2"
                [attr.y]="barY(pt.value)"
                [attr.width]="barWidth()"
                [attr.height]="barHeight(pt.value)"
                [attr.fill]="pointColor(pt, i)"
                opacity="0.75"
                class="bar-rect"
                [class.dimmed]="hoveredIndex() !== null && hoveredIndex() !== i"
                (mouseenter)="onPointHover(i)"
              />
            }
          }

          <!-- Line Connection (if chartType is 'line') -->
          @if (chartType() === 'line' && linePath(); as pathStr) {
            <path
              [attr.d]="pathStr"
              [attr.stroke]="lineColor()"
              fill="none"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="trend-line"
            />
          }

          <!-- Error Whiskers & Caps -->
          @for (pt of computedPoints(); track pt.label; let i = $index) {
            <g
              class="error-whisker-group"
              [class.dimmed]="hoveredIndex() !== null && hoveredIndex() !== i"
              [class.highlighted]="hoveredIndex() === i"
              (mouseenter)="onPointHover(i)"
            >
              <!-- Vertical Error Line -->
              <line
                [attr.x1]="pt.x"
                [attr.x2]="pt.x"
                [attr.y1]="pt.yTop"
                [attr.y2]="pt.yBottom"
                class="whisker-line"
                [attr.stroke]="whiskerColor()"
                stroke-width="1.8"
              />
              <!-- Top Cap Line -->
              <line
                [attr.x1]="pt.x - capWidth() / 2"
                [attr.x2]="pt.x + capWidth() / 2"
                [attr.y1]="pt.yTop"
                [attr.y2]="pt.yTop"
                class="whisker-cap"
                [attr.stroke]="whiskerColor()"
                stroke-width="1.8"
              />
              <!-- Bottom Cap Line -->
              <line
                [attr.x1]="pt.x - capWidth() / 2"
                [attr.x2]="pt.x + capWidth() / 2"
                [attr.y1]="pt.yBottom"
                [attr.y2]="pt.yBottom"
                class="whisker-cap"
                [attr.stroke]="whiskerColor()"
                stroke-width="1.8"
              />

              <!-- Center Point Marker (if chartType is 'line') -->
              @if (chartType() === 'line') {
                <circle
                  [attr.cx]="pt.x"
                  [attr.cy]="pt.y"
                  [attr.r]="hoveredIndex() === i ? 6 : 4.5"
                  [attr.fill]="pointColor(pt, i)"
                  stroke="#ffffff"
                  stroke-width="1.5"
                  class="center-dot"
                  (mousemove)="onMouseMove($event)"
                />
              } @else {
                <!-- Hover transparent indicator for bars -->
                <circle
                  [attr.cx]="pt.x"
                  [attr.cy]="pt.y"
                  [attr.r]="6"
                  fill="none"
                  stroke="none"
                  pointer-events="all"
                  (mousemove)="onMouseMove($event)"
                />
              }
            </g>
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
                  {{ labelFormatter() ? labelFormatter()!(tick) : formatNumber(tick) }}
                </text>
              </g>
            }
          </g>

          <!-- X Axis -->
          <g [attr.transform]="'translate(0,' + innerH() + ')'" class="x-axis">
            <line [attr.x1]="0" [attr.x2]="innerW()" [attr.y1]="0" [attr.y2]="0" class="axis-line" />
            @for (pt of computedPoints(); track pt.label; let i = $index) {
              <g [attr.transform]="'translate(' + pt.x + ',0)'">
                <line [attr.y1]="0" [attr.y2]="4" class="tick-line" />
                <text
                  [attr.y]="16"
                  text-anchor="middle"
                  class="tick-label x-tick-label"
                >
                  {{ pt.label }}
                </text>
              </g>
            }
          </g>

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
            <div class="tt-cat">{{ t.label }}</div>
            <div class="tt-row">
              <span class="tt-name">Value</span>
              <span class="tt-val">{{ labelFormatter() ? labelFormatter()!(t.value) : formatNumber(t.value) }}</span>
            </div>
            <div class="tt-row">
              <span class="tt-name">Margin (+ / -)</span>
              <span class="tt-val">+{{ t.errorPlus | number:'1.0-2' }} / -{{ t.errorMinus | number:'1.0-2' }}</span>
            </div>
            <div class="tt-row">
              <span class="tt-name">Confidence Range</span>
              <span class="tt-val">[{{ (t.value - t.errorMinus) | number:'1.0-2' }} , {{ (t.value + t.errorPlus) | number:'1.0-2' }}]</span>
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
    .ngx-error-bar {
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
    .error-bar-svg {
      display: block;
      overflow: visible;
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
    .x-tick-label {
      font-size: 10px;
    }
    .bar-rect {
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .bar-rect.dimmed {
      opacity: 0.25 !important;
    }
    .error-whisker-group {
      cursor: pointer;
    }
    .error-whisker-group.dimmed {
      opacity: 0.3;
    }
    .error-whisker-group.highlighted .whisker-line,
    .error-whisker-group.highlighted .whisker-cap {
      stroke: #0f172a !important;
      stroke-width: 2.2px !important;
    }
    .center-dot {
      transition: r 0.15s ease;
    }
    .trend-line {
      stroke-dasharray: 1000;
      stroke-dashoffset: 1000;
      animation: drawLine 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes drawLine {
      from { stroke-dashoffset: 1000; }
      to { stroke-dashoffset: 0; }
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
export class ErrorBarComponent {
  data = input<{ label: string; value: number; errorPlus: number; errorMinus: number; color?: string }[]>([]);
  chartType = input<'line' | 'bar'>('line');
  height = input<number>(300);
  showGrid = input<boolean>(true);
  colors = input<string[]>(CHART_COLORS);
  showExport = input<boolean>(false);
  labelFormatter = input<((v: number) => string) | undefined>(undefined);
  tooltipTemplate = input<TemplateRef<any> | null>(null);

  containerWidth = signal<number>(500);
  hoveredIndex = signal<number | null>(null);
  tooltip = signal<any | null>(null);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);
  exportMenuOpen = signal(false);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  margin = computed(() => ({
    top: 25,
    right: 25,
    bottom: 35,
    left: 45
  }));

  svgHeight = computed(() => this.height());
  innerW = computed(() => Math.max(10, this.containerWidth() - this.margin().left - this.margin().right));
  innerH = computed(() => Math.max(10, this.svgHeight() - this.margin().top - this.margin().bottom));

  capWidth = computed(() => Math.max(6, Math.min(14, this.innerW() / (this.data().length || 1) * 0.15)));
  barWidth = computed(() => Math.max(10, (this.innerW() / (this.data().length || 1)) * 0.6));

  yDomain = computed(() => {
    const raw = this.data();
    if (raw.length === 0) return { min: 0, max: 100 };

    const mins = raw.map(d => d.value - d.errorMinus);
    const maxs = raw.map(d => d.value + d.errorPlus);

    const minVal = Math.min(0, ...mins);
    const maxVal = Math.max(10, ...maxs);
    const range = maxVal - minVal;

    return {
      min: minVal - range * 0.05,
      max: maxVal + range * 0.05
    };
  });

  yTicks = computed(() => {
    const domain = this.yDomain();
    return niceTicks(domain.min, domain.max, 5);
  });

  yDomainMin = computed(() => this.yTicks()[0] || 0);
  yDomainMax = computed(() => this.yTicks()[this.yTicks().length - 1] || 100);

  computedPoints = computed<ErrorBarPoint[]>(() => {
    const raw = this.data();
    const count = raw.length;
    if (count === 0) return [];

    const w = this.innerW();
    const h = this.innerH();
    const yMin = this.yDomainMin();
    const yMax = this.yDomainMax();

    return raw.map((d, i) => {
      // Scale X evenly
      const x = count <= 1 ? w / 2 : scale(i, 0, count - 1, w * 0.08, w * 0.92);
      const y = scale(d.value, yMin, yMax, h, 0);
      const yTop = scale(d.value + d.errorPlus, yMin, yMax, h, 0);
      const yBottom = scale(d.value - d.errorMinus, yMin, yMax, h, 0);

      return {
        ...d,
        x,
        y,
        yTop,
        yBottom
      };
    });
  });

  linePath = computed<string>(() => {
    const pts = this.computedPoints();
    if (pts.length < 2) return '';
    return pts.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');
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
    return scale(val, this.yDomainMin(), this.yDomainMax(), this.innerH(), 0);
  }

  barY(val: number): number {
    const yVal = this.yPos(val);
    const yZero = this.yPos(0);
    return Math.min(yVal, yZero);
  }

  barHeight(val: number): number {
    const yVal = this.yPos(val);
    const yZero = this.yPos(0);
    return Math.abs(yVal - yZero);
  }

  pointColor(pt: ErrorBarPoint, i: number): string {
    if (pt.color) return pt.color;
    const colorsList = this.colors();
    return colorsList[i % colorsList.length];
  }

  lineColor(): string {
    return this.colors()[0] || '#4a90d9';
  }

  whiskerColor(): string {
    return '#64748b';
  }

  onPointHover(idx: number) {
    this.hoveredIndex.set(idx);
    const pt = this.computedPoints()[idx];
    if (pt) {
      this.tooltip.set(pt);
    }
  }

  onMouseMove(event: MouseEvent) {
    const el = event.currentTarget as SVGElement;
    const container = el.closest('.ngx-error-bar');
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

  exportToCsv(): void {
    const pts = this.computedPoints();
    if (!pts.length) return;

    let csv = 'Label,Value,Error Plus,Error Minus\n';
    pts.forEach(p => {
      csv += `"${p.label}",${p.value},${p.errorPlus},${p.errorMinus}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'error-bar-data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToJson(): void {
    const pts = this.computedPoints();
    if (!pts.length) return;

    const data = pts.map(p => ({
      label: p.label,
      value: p.value,
      errorPlus: p.errorPlus,
      errorMinus: p.errorMinus
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'error-bar-data.json');
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
    link.setAttribute('download', 'error-bar.svg');
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
        <title>Error Bar Export</title>
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
          <div class="title">Error Bar Uncertainty Analysis</div>
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
