import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, HostListener, viewChild
} from '@angular/core';
import { ChartExportService } from '../shared/chart-export.service';
import { ChartExportMenuComponent } from '../shared/chart-export-menu.component';
import type { ExportFormat } from '../shared/chart-export-menu.component';
import { WORLD_MAP_DATA, getSvgPath, project } from '../shared/map-data';

export interface MapPoint {
  lat: number;
  lng: number;
  label?: string;
  color?: string;
  size?: number;
}

export interface MapLine {
  fromIndex: number;
  toIndex: number;
  label?: string;
  color?: string;
  strokeWidth?: number;
  dashed?: boolean;
}

@Component({
  selector: 'ngx-map-line-point',
  standalone: true,
  imports: [ChartExportMenuComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-map-line-point" [class.dark]="theme() === 'dark'" (mouseleave)="onMouseLeave()">
      <div class="chart-header" (mousemove)="$event.stopPropagation()" (mouseleave)="onMouseLeave()">
        <div class="chart-title">
          <h4>{{ title() }}</h4>
        </div>
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
          <!-- Base Map Outlines -->
          <g class="map-base">
            @for (pathStr of baseMapPaths(); track $index) {
              <path
                [attr.d]="pathStr"
                [attr.fill]="theme() === 'dark' ? '#1e293b' : '#f8fafc'"
                [attr.stroke]="theme() === 'dark' ? '#0f172a' : '#e2e8f0'"
                stroke-width="1.2"
              />
            }
          </g>

          <!-- Connection Lines -->
          <g class="map-lines">
            @for (line of computedLines(); track $index; let i = $index) {
              <line
                [attr.x1]="line.x1"
                [attr.y1]="line.y1"
                [attr.x2]="line.x2"
                [attr.y2]="line.y2"
                [attr.stroke]="line.color"
                [attr.stroke-width]="hoveredLineIndex() === i ? (line.strokeWidth || 2) * 1.8 : (line.strokeWidth || 2)"
                [attr.stroke-dasharray]="line.dashed ? '4,4' : 'none'"
                stroke-linecap="round"
                class="network-line"
                [class.hovered]="hoveredLineIndex() === i"
                (mouseenter)="onLineHover(line.raw, i, $event)"
                (mousemove)="onLineMouseMove($event)"
              />
            }
          </g>

          <!-- Coordinate Points -->
          <g class="map-points">
            @for (pt of computedPoints(); track $index; let i = $index) {
              <circle
                [attr.cx]="pt.x"
                [attr.cy]="pt.y"
                [attr.r]="hoveredPointIndex() === i ? pt.size * 1.5 + 2 : pt.size"
                [attr.fill]="pt.color"
                stroke="#ffffff"
                [attr.stroke-width]="hoveredPointIndex() === i ? 2.5 : 1.5"
                class="network-point"
                [class.hovered]="hoveredPointIndex() === i"
                (mouseenter)="onPointHover(pt.raw, i, $event)"
                (mousemove)="onPointMouseMove($event)"
              />
            }
          </g>
        </svg>

        <!-- Glassmorphic Tooltip -->
        @if (tooltip(); as t) {
          <div class="chart-tooltip" [style.left.px]="tooltipX()" [style.top.px]="tooltipY()">
            @if (t.type === 'point') {
              <div class="tt-cat">{{ t.label || 'Network Point' }}</div>
              <div class="tt-row">
                <span class="tt-name">Coords</span>
                <span class="tt-val">{{ t.lat.toFixed(2) }}°, {{ t.lng.toFixed(2) }}°</span>
              </div>
            } @else {
              <div class="tt-cat">Route Segment</div>
              <div class="tt-row">
                <span class="tt-name">Route</span>
                <span class="tt-val">{{ t.label || 'Connected Route' }}</span>
              </div>
              <div class="tt-row">
                <span class="tt-name">From</span>
                <span class="tt-val">{{ t.fromLabel || '#' + t.fromIndex }}</span>
              </div>
              <div class="tt-row">
                <span class="tt-name">To</span>
                <span class="tt-val">{{ t.toLabel || '#' + t.toIndex }}</span>
              </div>
            }
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
    .ngx-map-line-point {
      background: var(--ngx-chart-bg, #ffffff);
      border-radius: 16px;
      padding: 16px;
      box-sizing: border-box;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
      position: relative;
      width: 100%;
      transition: background-color 0.3s;
    }
    .ngx-map-line-point.dark {
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

    .map-svg {
      display: block;
      overflow: visible;
    }
    .network-line {
      cursor: pointer;
      opacity: 0.8;
      transition: stroke-width 0.2s, stroke 0.2s, opacity 0.2s;
    }
    .network-line.hovered {
      opacity: 1;
    }
    .network-point {
      cursor: pointer;
      transition: r 0.2s cubic-bezier(0.16, 1, 0.3, 1), stroke-width 0.15s;
    }
    .network-point.hovered {
      filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.3));
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


    .chart-svg-container {
      position: relative;
      width: 100%;
    }
  `]
})
export class MapLinePointComponent {
  private readonly exportSvc = inject(ChartExportService);
  title = input<string>('Geographical Networks');
  points = input<MapPoint[]>([]);
  lines = input<MapLine[]>([]);
  height = input<number>(400);
  theme = input<'light' | 'dark'>('light');
  showExport = input<boolean>(false);

  containerWidth = signal<number>(600);
  hoveredPointIndex = signal<number | null>(null);
  hoveredLineIndex = signal<number | null>(null);
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

  baseMapPaths = computed(() => {
    const w = this.containerWidth();
    const h = this.height();
    const padding = { top: 10, right: 10, bottom: 10, left: 10 };
    return WORLD_MAP_DATA.map(region => getSvgPath(region.polygons, w, h, padding));
  });

  computedPoints = computed(() => {
    const w = this.containerWidth();
    const h = this.height();
    const padding = { top: 10, right: 10, bottom: 10, left: 10 };

    return this.points().map(pt => {
      const coord = project(pt.lng, pt.lat, w, h, padding);
      return {
        x: coord.x,
        y: coord.y,
        size: pt.size || 6,
        color: pt.color || '#4f46e5',
        raw: pt
      };
    });
  });

  computedLines = computed(() => {
    const pts = this.computedPoints();
    return this.lines().map(line => {
      const p1 = pts[line.fromIndex];
      const p2 = pts[line.toIndex];
      const x1 = p1 ? p1.x : 0;
      const y1 = p1 ? p1.y : 0;
      const x2 = p2 ? p2.x : 0;
      const y2 = p2 ? p2.y : 0;
      const color = line.color || 'rgba(99, 102, 241, 0.45)';

      return {
        x1, y1, x2, y2,
        color,
        dashed: line.dashed || false,
        strokeWidth: line.strokeWidth || 2,
        raw: line
      };
    });
  });

  onPointHover(pt: MapPoint, idx: number, event: MouseEvent) {
    this.hoveredPointIndex.set(idx);
    this.hoveredLineIndex.set(null);
    this.tooltip.set({
      type: 'point',
      label: pt.label,
      lat: pt.lat,
      lng: pt.lng
    });
  }

  onPointMouseMove(event: MouseEvent) {
    const containerEl = this.container()?.nativeElement;
    if (containerEl) {
      const rect = containerEl.getBoundingClientRect();
      this.tooltipX.set(event.clientX - rect.left);
      this.tooltipY.set(event.clientY - rect.top);
    }
  }

  onLineHover(line: MapLine, idx: number, event: MouseEvent) {
    this.hoveredLineIndex.set(idx);
    this.hoveredPointIndex.set(null);
    const fromPt = this.points()[line.fromIndex];
    const toPt = this.points()[line.toIndex];
    this.tooltip.set({
      type: 'line',
      label: line.label,
      fromIndex: line.fromIndex,
      toIndex: line.toIndex,
      fromLabel: fromPt ? fromPt.label : '',
      toLabel: toPt ? toPt.label : ''
    });
  }

  onLineMouseMove(event: MouseEvent) {
    const containerEl = this.container()?.nativeElement;
    if (containerEl) {
      const rect = containerEl.getBoundingClientRect();
      this.tooltipX.set(event.clientX - rect.left);
      this.tooltipY.set(event.clientY - rect.top);
    }
  }

  onMouseLeave() {
    this.hoveredPointIndex.set(null);
    this.hoveredLineIndex.set(null);
    this.tooltip.set(null);
  }

  onExport(type: ExportFormat): void {
    if (type === 'json') this.exportToJson();
    else if (type === 'csv') this.exportToCsv();
    else if (type === 'svg') this.exportToSvg();
    else if (type === 'pdf') this.exportToPdf();
  }

  exportToJson(): void {
    const data = { points: this.points(), lines: this.lines() };
    this.exportSvc.downloadJson(data, 'map-line-point-data.json');
  }

  exportToCsv(): void {
    const data = this.points();
    if (!data.length) return;
    const headers = ['Label', 'Latitude', 'Longitude', 'Color', 'Size'];
    const rows = data.map(d => [d.label || '', d.lat, d.lng, d.color || '', d.size || '']);
    this.exportSvc.downloadCsv(headers, rows, 'map-points-data.csv');
  }

  exportToSvg(): void {
    this.exportSvc.downloadSvg(this.svgEl()?.nativeElement, 'chart.svg');
  }

  exportToPdf(): void {
    this.exportSvc.downloadPdf(this.svgEl()?.nativeElement, 'Chart Export', 'chart.pdf');
  }
}
