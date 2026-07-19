import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, viewChild
} from '@angular/core';
import { ChartExportService } from '../shared/chart-export.service';
import { ChartExportMenuComponent } from '../shared/chart-export-menu.component';
import type { ExportFormat } from '../shared/chart-export-menu.component';
import { fmtNum, scale } from '../shared/chart-utils';
import { WORLD_MAP_DATA, getSvgPath, project } from '../shared/map-data';

export interface GeoHeatmapPoint {
  lat: number;
  lng: number;
  weight: number;
}

interface HeatmapCell {
  x: number;
  y: number;
  weight: number;
  lat: number;
  lng: number;
  color: string;
  radius: number;
}

@Component({
  selector: 'ngx-geo-heatmap',
  standalone: true,
  imports: [ChartExportMenuComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-geo-heatmap" [class.dark]="theme() === 'dark'" (mouseleave)="onMouseLeave()">
      <div class="chart-header" (mousemove)="$event.stopPropagation()" (mouseleave)="onMouseLeave()">
        <div class="chart-title">
          <h4>{{ title() }}</h4>
        </div>
        
        <!-- Legend -->
        @if (showLegend() && computedCells().length > 0) {
          <div class="chart-legend" (mousemove)="$event.stopPropagation()">
            <span class="legend-label">Low</span>
            <div class="legend-bar" [style.background]="legendGradient()"></div>
            <span class="legend-label">High</span>
          </div>
        }

        @if (showExport()) {
          <ngx-chart-export-menu (exportClicked)="onExport($event)" />
        }
      </div>

      <div class="chart-svg-container" #container>
        <svg
          #svgEl
          class="map-svg"
          [attr.width]="'100%'"
          [attr.height]="height()"
        >
          <defs>
            <filter id="heatmap-blur-filter" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="12" />
            </filter>
          </defs>

          <!-- Base Map Outlines -->
          <g class="map-base">
            @for (pathStr of baseMapPaths(); track $index) {
              <path
                [attr.d]="pathStr"
                [attr.fill]="theme() === 'dark' ? '#1e293b' : '#f1f5f9'"
                [attr.stroke]="theme() === 'dark' ? '#0f172a' : '#e2e8f0'"
                stroke-width="1.2"
              />
            }
          </g>

          <!-- Heatmap Overlay -->
          <g class="map-heatmap" [attr.filter]="blur() ? 'url(#heatmap-blur-filter)' : null">
            @for (cell of computedCells(); track $index) {
              <circle
                [attr.cx]="cell.x"
                [attr.cy]="cell.y"
                [attr.r]="cell.radius"
                [attr.fill]="cell.color"
                [attr.opacity]="theme() === 'dark' ? 0.65 : 0.55"
                class="heatmap-blob"
              />
            }
          </g>

          <!-- Heatmap Interactive Hover Overlay -->
          <!-- We render smaller invisible trigger circles to capture mouse pointer events for tooltips -->
          <g class="map-triggers">
            @for (cell of computedCells(); track $index; let i = $index) {
              <circle
                [attr.cx]="cell.x"
                [attr.cy]="cell.y"
                [attr.r]="cell.radius * 0.8"
                fill="transparent"
                style="cursor: pointer;"
                (mouseenter)="onCellHover(cell, i, $event)"
                (mousemove)="onCellMouseMove($event)"
              />
            }
          </g>
        </svg>

        <!-- Glassmorphic Tooltip -->
        @if (tooltip(); as t) {
          <div class="chart-tooltip" [style.left.px]="tooltipX()" [style.top.px]="tooltipY()">
            <div class="tt-cat">Density Zone</div>
            <div class="tt-row">
              <span class="tt-name">Center Coords</span>
              <span class="tt-val">{{ t.lat.toFixed(2) }}°, {{ t.lng.toFixed(2) }}°</span>
            </div>
            <div class="tt-row">
              <span class="tt-name">Weight Intensity</span>
              <span class="tt-val">{{ fmtNum(t.weight) }}</span>
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
    .ngx-geo-heatmap {
      background: var(--ngx-chart-bg, #ffffff);
      border-radius: 16px;
      padding: 16px;
      box-sizing: border-box;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
      position: relative;
      width: 100%;
      transition: background-color 0.3s;
    }
    .ngx-geo-heatmap.dark {
      background: #0f172a;
      border: 1px solid rgba(255, 255, 255, 0.05);
      --ngx-chart-bg: #0f172a;
      --ngx-chart-tooltip-bg: rgba(15, 23, 42, 0.95);
      --ngx-chart-tooltip-color: #f8fafc;
    }
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      position: relative;
    }
    .chart-title h4 {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      color: var(--ngx-chart-title-color, #1e293b);
    }
    .dark .chart-title h4 {
      color: #f8fafc;
    }

    /* Legend */
    .chart-legend {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      justify-content: flex-end;
    }
    .legend-label {
      font-size: 11px;
      color: #64748b;
      font-weight: 600;
    }
    .dark .legend-label {
      color: #94a3b8;
    }
    .legend-bar {
      width: 100px;
      height: 10px;
      border-radius: 4px;
    }

    .map-svg {
      display: block;
      overflow: visible;
    }
    .heatmap-blob {
      mix-blend-mode: multiply;
      pointer-events: none;
    }
    .dark .heatmap-blob {
      mix-blend-mode: screen;
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
    .tt-name {
      color: rgba(248, 250, 252, 0.8);
      flex: 1;
    }
    .tt-val {
      font-weight: 700;
      font-family: monospace;
    }

    /* Export styles removed */
    .chart-svg-container {
      position: relative;
      width: 100%;
    }
  `]
})
export class GeoHeatmapComponent {
  private readonly exportSvc = inject(ChartExportService);

  title = input<string>('Geographical Heatmap');
  data = input<GeoHeatmapPoint[]>([]);
  height = input<number>(400);
  gridSize = input<number>(10); // degrees, standard cell subdivision size
  colors = input<string[]>(['#10b981', '#fbbf24', '#ef4444']); // Low, Med, High
  blur = input<boolean>(true);
  showLegend = input<boolean>(true);
  showExport = input<boolean>(false);
  theme = input<'light' | 'dark'>('light');

  containerWidth = signal<number>(600);
  hoveredCellIndex = signal<number | null>(null);
  tooltip = signal<any | null>(null);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');
  private container = viewChild<ElementRef>('container');

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

  legendGradient = computed(() => {
    const cols = this.colors();
    return `linear-gradient(to right, ${cols.join(', ')})`;
  });

  baseMapPaths = computed(() => {
    const w = this.containerWidth();
    const h = this.height();
    const padding = { top: 10, right: 10, bottom: 10, left: 10 };
    return WORLD_MAP_DATA.map(region => getSvgPath(region.polygons, w, h, padding));
  });

  computedCells = computed(() => {
    const rawData = this.data();
    const size = Math.max(1, this.gridSize());
    
    // Group/bin points into a grid
    const grid = new Map<string, { weight: number; lat: number; lng: number }>();
    
    rawData.forEach(pt => {
      // Find grid cell center
      const latBin = Math.floor(pt.lat / size) * size + size / 2;
      const lngBin = Math.floor(pt.lng / size) * size + size / 2;
      const key = `${latBin},${lngBin}`;
      
      const existing = grid.get(key) || { weight: 0, lat: latBin, lng: lngBin };
      existing.weight += pt.weight;
      grid.set(key, existing);
    });

    const w = this.containerWidth();
    const h = this.height();
    const padding = { top: 10, right: 10, bottom: 10, left: 10 };

    const cells = Array.from(grid.values());
    if (cells.length === 0) return [];

    const weights = cells.map(c => c.weight);
    const maxWeight = Math.max(...weights);
    const minWeight = Math.min(...weights);

    return cells.map(cell => {
      const coord = project(cell.lng, cell.lat, w, h, padding);
      
      // Interpolate colors based on weight (low, medium, high support)
      const range = maxWeight - minWeight || 1;
      const factor = Math.max(0, Math.min(1, (cell.weight - minWeight) / range));
      const color = this.getHeatmapColor(factor);

      // Map radius based on viewport size and weight
      // Larger weight -> larger radius blob
      const baseR = scale(size, 1, 45, 10, 80);
      const radius = scale(cell.weight, minWeight, maxWeight, baseR * 0.7, baseR * 1.5);

      return {
        x: coord.x,
        y: coord.y,
        lat: cell.lat,
        lng: cell.lng,
        weight: cell.weight,
        color,
        radius
      };
    });
  });

  onCellHover(cell: HeatmapCell, index: number, event: MouseEvent) {
    this.hoveredCellIndex.set(index);
    this.tooltip.set({
      lat: cell.lat,
      lng: cell.lng,
      weight: cell.weight
    });
  }

  onCellMouseMove(event: MouseEvent) {
    const containerEl = this.container()?.nativeElement;
    if (containerEl) {
      const rect = containerEl.getBoundingClientRect();
      this.tooltipX.set(event.clientX - rect.left);
      this.tooltipY.set(event.clientY - rect.top);
    }
  }

  onMouseLeave() {
    this.hoveredCellIndex.set(null);
    this.tooltip.set(null);
  }

  onExport(type: ExportFormat): void {
    if (type === 'json') this.exportToJson();
    else if (type === 'csv') this.exportToCsv();
    else if (type === 'svg') this.exportToSvg();
    else if (type === 'pdf') this.exportToPdf();
  }

  exportToJson(): void {
    const data = this.data();
    if (!data.length) return;
    this.exportSvc.downloadJson(data, 'geo-heatmap-data.json');
  }

  exportToCsv(): void {
    const data = this.data();
    if (!data.length) return;
    const headers = ['Latitude', 'Longitude', 'Weight'];
    const rows = data.map(d => [d.lat, d.lng, d.weight]);
    this.exportSvc.downloadCsv(headers, rows, 'geo-heatmap-data.csv');
  }

  exportToSvg(): void {
    this.exportSvc.downloadSvg(this.svgEl()?.nativeElement, 'geo-heatmap.svg');
  }

  exportToPdf(): void {
    this.exportSvc.downloadPdf(this.svgEl()?.nativeElement, 'Geographical Heatmap', 'geo-heatmap.pdf');
  }

  private getHeatmapColor(factor: number): string {
    const cols = this.colors();
    if (cols.length < 2) return cols[0] || '#ef4444';
    
    // Scale factor to segments
    const segments = cols.length - 1;
    const scaledFactor = factor * segments;
    const index = Math.floor(scaledFactor);
    const segmentFactor = scaledFactor - index;
    
    const c1 = cols[Math.min(index, cols.length - 1)];
    const c2 = cols[Math.min(index + 1, cols.length - 1)];
    
    return this.interpolateColor(c1, c2, Math.max(0, Math.min(1, segmentFactor)));
  }

  private interpolateColor(color1: string, color2: string, factor: number): string {
    const c1 = this.parseHex(color1);
    const c2 = this.parseHex(color2);
    const r = Math.round(c1.r + factor * (c2.r - c1.r));
    const g = Math.round(c1.g + factor * (c2.g - c1.g));
    const b = Math.round(c1.b + factor * (c2.b - c1.b));
    return `rgb(${r}, ${g}, ${b})`;
  }

  private parseHex(hex: string) {
    let clean = hex.replace('#', '');
    if (clean.length === 3) {
      clean = clean.split('').map(c => c + c).join('');
    }
    const num = parseInt(clean, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  readonly fmtNum = fmtNum;
}
