import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, TemplateRef, viewChild, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CHART_COLORS, fmtNum } from '../shared/chart-utils';

export interface WindRoseSpeedBin {
  label: string;
  value: number; // percentage frequency (0 to 100)
}

export interface WindRoseItem {
  direction: string;
  speedBins: WindRoseSpeedBin[];
}

interface ProcessedWedgeBin {
  direction: string;
  binLabel: string;
  value: number;
  cumValue: number;
  color: string;
  path: string;
}

interface ProcessedWedge {
  direction: string;
  angle: number;
  bins: ProcessedWedgeBin[];
}

@Component({
  selector: 'ngx-wind-rose',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-wind-rose" (mouseleave)="onMouseLeave()">
      <div class="chart-header" (mousemove)="$event.stopPropagation()" (mouseleave)="onMouseLeave()">
        <div class="header-info">
          <span class="header-title">Wind Rose Chart</span>
          <span class="header-subtitle">Directional Distribution & Wind Speed Bins</span>
        </div>

        <!-- Export Menu -->
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

      <svg
        #svgEl
        class="rose-svg"
        [attr.width]="'100%'"
        [attr.height]="svgHeight()"
      >
        <g [attr.transform]="'translate(' + (containerWidth() / 2) + ',' + (svgHeight() / 2) + ')'">
          
          <!-- Concentric Grid Circles -->
          @for (grid of gridLevels(); track grid) {
            <circle
              [attr.cx]="0"
              [attr.cy]="0"
              [attr.r]="radiusScale(grid)"
              class="grid-circle"
            />
            <text
              [attr.x]="5"
              [attr.y]="-radiusScale(grid) - 2"
              class="grid-label"
            >
              {{ grid }}%
            </text>
          }

          <!-- Axis Direction Spokes -->
          @for (wdir of directionsList; track wdir; let i = $index) {
            @if (i % 2 === 0) {
              <line
                [attr.x1]="0"
                [attr.y1]="0"
                [attr.x2]="maxRadius() * Math.cos(directionAngle(wdir))"
                [attr.y2]="maxRadius() * Math.sin(directionAngle(wdir))"
                class="spoke-line"
              />
              <text
                [attr.x]="(maxRadius() + 14) * Math.cos(directionAngle(wdir))"
                [attr.y]="(maxRadius() + 14) * Math.sin(directionAngle(wdir))"
                text-anchor="middle"
                dominant-baseline="middle"
                class="direction-label"
              >
                {{ wdir }}
              </text>
            }
          }

          <!-- Wind Rose Wedges -->
          @for (wedge of computedWedges(); track wedge.direction; let wIdx = $index) {
            @for (bin of wedge.bins; track bin.binLabel; let bIdx = $index) {
              <path
                [attr.d]="bin.path"
                [attr.fill]="bin.color"
                class="rose-wedge"
                [class.dimmed]="hoveredBin() !== null && (hoveredBin()!.wIdx !== wIdx || hoveredBin()!.bIdx !== bIdx)"
                [class.highlighted]="hoveredBin() !== null && hoveredBin()!.wIdx === wIdx && hoveredBin()!.bIdx === bIdx"
                (mouseenter)="onWedgeHover(wIdx, bIdx, $event)"
                (mousemove)="onMouseMove($event)"
                [style.animation-delay]="(wIdx * 0.04 + bIdx * 0.05) + 's'"
                stroke="#ffffff"
                stroke-width="0.3"
              />
            }
          }
        </g>
      </svg>

      <!-- Legend -->
      <div class="legend-container">
        @for (legend of legendItems(); track legend.label) {
          <div class="legend-item">
            <span class="legend-dot" [style.background]="legend.color"></span>
            <span class="legend-text">{{ legend.label }}</span>
          </div>
        }
      </div>

      <!-- Glassmorphic Tooltip -->
      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="tooltipX()" [style.top.px]="tooltipY()">
          @if (tooltipTemplate()) {
            <ng-container
              *ngTemplateOutlet="tooltipTemplate()!; context: { $implicit: t }"
            ></ng-container>
          } @else {
            <div class="tt-cat">{{ t.direction }} Sector</div>
            <div class="tt-row">
              <span class="tt-dot" [style.background]="t.color"></span>
              <span class="tt-name">{{ t.binLabel }}</span>
              <span class="tt-val">{{ labelFormatter() ? labelFormatter()!(t.value) : t.value.toFixed(1) + '%' }}</span>
            </div>
            <div class="tt-row">
              <span class="tt-name">Cumulative</span>
              <span class="tt-val">{{ labelFormatter() ? labelFormatter()!(t.cumValue) : t.cumValue.toFixed(1) + '%' }}</span>
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
    .ngx-wind-rose {
      background: var(--ngx-chart-bg, #ffffff);
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
      display: block;
    }
    .header-subtitle {
      font-size: 11px;
      color: var(--ngx-chart-axis-text, #64748b);
      font-weight: 550;
    }
    .rose-svg {
      display: block;
      overflow: visible;
    }
    .grid-circle {
      stroke: var(--ngx-chart-grid, #f1f5f9);
      stroke-width: 1;
      fill: none;
    }
    .grid-label {
      font-size: 9px;
      fill: var(--ngx-chart-axis-text, #94a3b8);
      font-weight: 600;
    }
    .spoke-line {
      stroke: var(--ngx-chart-grid, #e2e8f0);
      stroke-width: 1;
      stroke-dasharray: 2,2;
    }
    .direction-label {
      font-size: 11px;
      fill: var(--ngx-chart-axis-text, #475569);
      font-weight: 700;
      user-select: none;
    }
    .rose-wedge {
      cursor: pointer;
      transform-origin: center;
      animation: wedgeScaleIn 0.8s cubic-bezier(0.34, 1.3, 0.64, 1) forwards;
      opacity: 0;
    }
    @keyframes wedgeScaleIn {
      from { transform: scale(0); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .rose-wedge.dimmed {
      opacity: 0.25 !important;
    }
    .rose-wedge.highlighted {
      stroke: var(--ngx-chart-axis-strong, #475569) !important;
      stroke-width: 1px !important;
    }
    .legend-container {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      justify-content: center;
      margin-top: 14px;
      padding-top: 10px;
      border-top: 1px solid var(--ngx-chart-grid, #f1f5f9);
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 2px;
    }
    .legend-text {
      font-size: 11px;
      color: var(--ngx-chart-axis-text, #475569);
      font-weight: 600;
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
    .tt-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
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
export class WindRoseChartComponent {
  data = input<WindRoseItem[]>([]);
  height = input<number>(400);
  colors = input<string[]>(CHART_COLORS);
  showExport = input<boolean>(false);
  labelFormatter = input<((v: number) => string) | undefined>(undefined);
  tooltipTemplate = input<TemplateRef<any> | null>(null);

  containerWidth = signal<number>(500);
  hoveredBin = signal<{ wIdx: number; bIdx: number } | null>(null);
  tooltip = signal<any | null>(null);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);
  exportMenuOpen = signal(false);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  readonly Math = Math;

  directionsList = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
  ];

  svgHeight = computed(() => this.height());
  maxRadius = computed(() => Math.min(this.containerWidth(), this.svgHeight()) * 0.45 - 28);

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

  directionAngle(dir: string): number {
    const idx = this.directionsList.indexOf(dir);
    if (idx === -1) return 0;
    return -Math.PI / 2 + (idx * 2 * Math.PI) / 16;
  }

  maxCumulativePercentage = computed(() => {
    const raw = this.data();
    if (raw.length === 0) return 0;
    let maxVal = 0;
    raw.forEach(item => {
      const sum = item.speedBins.reduce((acc, bin) => acc + bin.value, 0);
      if (sum > maxVal) maxVal = sum;
    });
    return maxVal;
  });

  gridLevels = computed(() => {
    const maxPct = this.maxCumulativePercentage();
    if (maxPct === 0) return [5, 10, 15, 20];
    
    if (maxPct <= 10) return [2.5, 5, 7.5, 10];
    if (maxPct <= 20) return [5, 10, 15, 20];
    return [10, 20, 30, 40];
  });

  maxGridPct = computed(() => {
    const levels = this.gridLevels();
    return levels[levels.length - 1] || 100;
  });

  radiusScale(pct: number): number {
    const rMax = this.maxRadius();
    const gridMax = this.maxGridPct();
    return (pct / gridMax) * rMax;
  }

  computedWedges = computed<ProcessedWedge[]>(() => {
    const raw = this.data();
    if (raw.length === 0) return [];

    const palette = this.colors();
    const rMax = this.maxRadius();
    const gridMax = this.maxGridPct();

    const sectorAngle = (2 * Math.PI) / 16;
    const wedgeAngleSweep = sectorAngle * 0.8;

    return raw.map((item, wIdx) => {
      const angle = this.directionAngle(item.direction);
      const startAngle = angle - wedgeAngleSweep / 2;
      const endAngle = angle + wedgeAngleSweep / 2;

      let runningSum = 0;
      const bins: ProcessedWedgeBin[] = item.speedBins.map((bin, bIdx) => {
        const value = bin.value;
        const startRad = (runningSum / gridMax) * rMax;
        runningSum += value;
        const endRad = (runningSum / gridMax) * rMax;

        const color = palette[bIdx % palette.length];

        const x1 = startRad * Math.cos(startAngle);
        const y1 = startRad * Math.sin(startAngle);
        const x2 = startRad * Math.cos(endAngle);
        const y2 = startRad * Math.sin(endAngle);

        const x3 = endRad * Math.cos(endAngle);
        const y3 = endRad * Math.sin(endAngle);
        const x4 = endRad * Math.cos(startAngle);
        const y4 = endRad * Math.sin(startAngle);

        const path = `M ${x4} ${y4} L ${x3} ${y3} A ${endRad} ${endRad} 0 0 0 ${x2} ${y2} L ${x1} ${y1} A ${startRad} ${startRad} 0 0 1 ${x4} ${y4} Z`;

        return {
          direction: item.direction,
          binLabel: bin.label,
          value,
          cumValue: runningSum,
          color,
          path
        };
      });

      return {
        direction: item.direction,
        angle,
        bins
      };
    });
  });

  legendItems = computed(() => {
    const raw = this.data();
    if (raw.length === 0) return [];
    
    const firstWedge = raw[0];
    const palette = this.colors();
    
    return firstWedge.speedBins.map((bin, idx) => ({
      label: bin.label,
      color: palette[idx % palette.length]
    }));
  });

  onWedgeHover(wIdx: number, bIdx: number, event: MouseEvent) {
    this.hoveredBin.set({ wIdx, bIdx });
    const wedge = this.computedWedges()[wIdx];
    if (wedge) {
      const bin = wedge.bins[bIdx];
      if (bin) {
        this.tooltip.set(bin);
      }
    }
  }

  onMouseMove(event: MouseEvent) {
    const el = event.currentTarget as SVGElement;
    const container = el.closest('.ngx-wind-rose');
    if (container) {
      const rect = container.getBoundingClientRect();
      this.tooltipX.set(event.clientX - rect.left);
      this.tooltipY.set(event.clientY - rect.top);
    }
  }

  onMouseLeave() {
    this.hoveredBin.set(null);
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
    const raw = this.data();
    if (!raw.length) return;

    let csv = 'Direction,SpeedBin,Frequency\n';
    raw.forEach(item => {
      item.speedBins.forEach(bin => {
        csv += `"${item.direction}","${bin.label}",${bin.value}\n`;
      });
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'wind-rose-data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToJson(): void {
    const raw = this.data();
    if (!raw.length) return;

    const data = raw.flatMap(item =>
      item.speedBins.map(bin => ({
        direction: item.direction,
        binLabel: bin.label,
        value: bin.value
      }))
    );

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'wind-rose-data.json');
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
    link.setAttribute('download', 'wind-rose.svg');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
