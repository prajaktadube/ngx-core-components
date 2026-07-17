import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, viewChild, HostListener, inject, DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CHART_COLORS, ChartDataPoint, fmtNum } from '../shared/chart-utils';

@Component({
  selector: 'ngx-pie-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-pie-chart">
      <!-- Toolbar with Export option -->
      <div class="chart-header" (mousemove)="$event.stopPropagation()" (mouseleave)="tooltip.set(null)">
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
                [style.transform]="hovered() === slice.index ? 'translate(' + (slice.cos * 8) + 'px,' + (slice.sin * 8) + 'px)' : 'translate(0, 0)'"
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
  `,
  styles: [`
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
      animation: pieGrow 0.75s cubic-bezier(0.16, 1, 0.3, 1) both;
      transform-origin: center;
    }

    @keyframes pieGrow {
      from { transform: scale(0.4) rotate(-90deg); opacity: 0; }
      to { transform: scale(1) rotate(0); opacity: 1; }
    }
    .pie-group {
      transform-origin: center;
    }

    .pie-slice {
      cursor: pointer;
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), fill-opacity 0.15s;
      transform-origin: 0px 0px;
    }
    .pie-slice.hovered { fill-opacity: 0.95; filter: drop-shadow(0 6px 10px rgba(0,0,0,0.16)); }
    .slice-label { font-size: 11px; fill: #fff; font-weight: 600; pointer-events: none; user-select: none; }
    .donut-center-text { font-size: 11px; fill: var(--ngx-chart-axis-text,#6c757d); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .donut-center-value { font-size: 24px; font-weight: 900; fill: var(--ngx-chart-text,#0f172a); }
    .chart-legend { display: flex; flex-direction: column; gap: 6px; flex-shrink: 0; }
    .legend-item { display: flex; align-items: center; gap: 8px; font-size: 12px; cursor: pointer; padding: 5px 10px; border-radius: 8px; transition: all 0.15s; }
    .legend-item:hover { background: var(--ngx-chart-grid,#f1f3f5); }
    .legend-dot { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }
    .legend-label { flex: 1; color: var(--ngx-chart-axis-text,#6c757d); font-weight: 500; }
    .legend-pct { font-weight: 600; color: var(--ngx-chart-text,#212529); }

    /* Premium Glassmorphic Tooltip */
    .chart-tooltip {
      position: absolute; pointer-events: none; transform: translate(-50%, -100%) translateY(-8px);
      background: var(--ngx-chart-tooltip-bg, rgba(15, 23, 42, 0.92));
      backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      color: var(--ngx-chart-tooltip-color, #f8fafc); padding: 10px 14px;
      border-radius: 10px; font-size: 12px; min-width: 140px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      z-index: 100;
      display: flex; align-items: center; gap: 6px;
      transition: left 0.12s cubic-bezier(0.16, 1, 0.3, 1), top 0.12s cubic-bezier(0.16, 1, 0.3, 1);
      font-family: inherit;
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
  `]
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
  centerValueOverride = input<string | null>(null, { alias: 'centerValue' });
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
    const override = this.centerValueOverride();
    if (override !== null) return override;
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
      const cos = Math.cos(mid);
      const sin = Math.sin(mid);
      start = end;
      return {
        index: i,
        label: item.label,
        value: item.value,
        pct: Math.round(frac * 100),
        color: item.color || this.colors()[i % this.colors().length],
        path,
        midAngle: mid,
        cos,
        sin,
      };
    });
  });

  private arcPath(startAngle: number, endAngle: number, r: number): string {
    const x1 = Math.cos(startAngle) * r;
    const y1 = Math.sin(startAngle) * r;
    const x2 = Math.cos(endAngle) * r;
    const y2 = Math.sin(endAngle) * r;
    const large = endAngle - startAngle > Math.PI ? 1 : 0;
    return `M 0 0 L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
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
    return `M ${ix1} ${iy1} L ${ox1} ${oy1} A ${outerR} ${outerR} 0 ${large} 1 ${ox2} ${oy2} L ${ix2} ${iy2} A ${innerR} ${innerR} 0 ${large} 0 ${ix1} ${iy1} Z`;
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
      csv += `"${d.label}",${d.value}\n`;
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
