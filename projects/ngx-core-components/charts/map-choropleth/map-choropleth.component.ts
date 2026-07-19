import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, viewChild
} from '@angular/core';
import { ChartExportService } from '../shared/chart-export.service';
import { ChartExportMenuComponent } from '../shared/chart-export-menu.component';
import type { ExportFormat } from '../shared/chart-export-menu.component';
import { fmtNum } from '../shared/chart-utils';
import { WORLD_MAP_DATA, getSvgPath } from '../shared/map-data';

export interface ChoroplethDataPoint {
  regionId: string; // e.g. 'US', 'CA', 'CN', etc.
  value: number;
  label?: string; // Optional custom name/description
}

@Component({
  selector: 'ngx-map-choropleth',
  standalone: true,
  imports: [ChartExportMenuComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-map-choropleth" [class.dark]="theme() === 'dark'" (mouseleave)="onMouseLeave()">
      <div class="chart-header" (mousemove)="$event.stopPropagation()" (mouseleave)="onMouseLeave()">
        <div class="chart-title">
          <h4>{{ title() }}</h4>
        </div>
        @if (showExport()) {
          <ngx-chart-export-menu (exportClicked)="onExport($event)" />
        }
      </div>

      <!-- Color scale legend -->
      @if (showLegend() && data().length > 0) {
        <div class="chart-legend" (mousemove)="$event.stopPropagation()">
          <span class="legend-label">{{ fmtNum(minVal()) }}</span>
          <div class="legend-bar" [style.background]="legendGradient()"></div>
          <span class="legend-label">{{ fmtNum(maxVal()) }}</span>
        </div>
      }

      <div class="chart-svg-container" #container>
        <svg
          #svgEl
          class="map-svg"
          [attr.width]="'100%'"
          [attr.height]="height()"
        >
          <g>
            <!-- Map Geometries -->
            @for (region of computedRegions(); track region.id) {
              <path
                [attr.d]="region.path"
                [attr.fill]="region.fillColor"
                [attr.stroke]="theme() === 'dark' ? '#1e293b' : '#ffffff'"
                [attr.stroke-width]="hoveredRegionId() === region.id ? 2.5 : 1"
                class="map-region"
                [class.highlighted]="hoveredRegionId() === region.id"
                (mouseenter)="onRegionHover(region, $event)"
                (mousemove)="onRegionMouseMove($event)"
              />
            }
          </g>
        </svg>

        <!-- Glassmorphic Tooltip -->
        @if (tooltip(); as t) {
          <div class="chart-tooltip" [style.left.px]="tooltipX()" [style.top.px]="tooltipY()">
            <div class="tt-cat">{{ t.name }}</div>
            <div class="tt-row">
              <span class="tt-dot" [style.background]="t.color"></span>
              <span class="tt-name">Value</span>
              <span class="tt-val">{{ fmtNum(t.value) }}</span>
            </div>
            @if (t.label) {
              <div class="tt-row label-row">
                <span class="tt-name">{{ t.label }}</span>
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
    .ngx-map-choropleth {
      background: var(--ngx-chart-bg, #ffffff);
      border-radius: 16px;
      padding: 16px;
      box-sizing: border-box;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
      position: relative;
      width: 100%;
      transition: background-color 0.3s;
    }
    .ngx-map-choropleth.dark {
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
    .map-region {
      cursor: pointer;
      transition: fill 0.2s, stroke-width 0.15s, filter 0.15s;
    }
    .map-region.highlighted {
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.25));
    }
    
    /* Legend Gradient */
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
      width: 120px;
      height: 10px;
      border-radius: 4px;
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
    .label-row {
      font-style: italic;
      color: rgba(255, 255, 255, 0.7);
      font-size: 11px;
      margin-top: 6px;
      border-top: 1px dashed rgba(255, 255, 255, 0.1);
      padding-top: 4px;
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

    /* Export styles removed */
    .chart-svg-container {
      position: relative;
      width: 100%;
    }
  `]
})
export class MapChoroplethComponent {
  private readonly exportSvc = inject(ChartExportService);

  title = input<string>('Region Distribution');
  data = input<ChoroplethDataPoint[]>([]);
  height = input<number>(400);
  colors = input<string[]>(['#e0f2fe', '#0284c7']); // minColor, maxColor
  noDataColor = input<string>('#e2e8f0');
  showLegend = input<boolean>(true);
  showExport = input<boolean>(false);
  theme = input<'light' | 'dark'>('light');

  containerWidth = signal<number>(600);
  hoveredRegionId = signal<string | null>(null);
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

  minVal = computed(() => {
    const raw = this.data();
    if (raw.length === 0) return 0;
    return Math.min(...raw.map(d => d.value));
  });

  maxVal = computed(() => {
    const raw = this.data();
    if (raw.length === 0) return 100;
    return Math.max(...raw.map(d => d.value));
  });

  legendGradient = computed(() => {
    const cols = this.colors();
    const c1 = cols[0] || '#e0f2fe';
    const c2 = cols[1] || '#0284c7';
    return `linear-gradient(to right, ${c1}, ${c2})`;
  });

  computedRegions = computed(() => {
    const w = this.containerWidth();
    const h = this.height();
    const rawData = this.data();
    const min = this.minVal();
    const max = this.maxVal();
    const minColor = this.colors()[0] || '#e0f2fe';
    const maxColor = this.colors()[1] || '#0284c7';
    const emptyColor = this.theme() === 'dark' ? '#1e293b' : this.noDataColor();

    const padding = { top: 10, right: 10, bottom: 10, left: 10 };

    return WORLD_MAP_DATA.map(region => {
      const path = getSvgPath(region.polygons, w, h, padding);
      const dataPoint = rawData.find(d => d.regionId.toUpperCase() === region.id.toUpperCase());
      
      let fillColor = emptyColor;
      let value = 0;
      let hasData = false;
      let label = '';

      if (dataPoint) {
        hasData = true;
        value = dataPoint.value;
        label = dataPoint.label || '';
        const range = max - min || 1;
        const factor = Math.max(0, Math.min(1, (value - min) / range));
        fillColor = this.interpolateColor(minColor, maxColor, factor);
      }

      return {
        id: region.id,
        name: region.name,
        path,
        value,
        hasData,
        label,
        fillColor
      };
    });
  });

  onRegionHover(region: any, event: MouseEvent) {
    this.hoveredRegionId.set(region.id);
    if (region.hasData) {
      this.tooltip.set({
        name: region.name,
        value: region.value,
        label: region.label,
        color: region.fillColor
      });
    } else {
      this.tooltip.set({
        name: region.name,
        value: 0,
        label: 'No Data',
        color: region.fillColor
      });
    }
  }

  onRegionMouseMove(event: MouseEvent) {
    const containerEl = this.container()?.nativeElement;
    if (containerEl) {
      const rect = containerEl.getBoundingClientRect();
      this.tooltipX.set(event.clientX - rect.left);
      this.tooltipY.set(event.clientY - rect.top);
    }
  }

  onMouseLeave() {
    this.hoveredRegionId.set(null);
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
    this.exportSvc.downloadJson(data, 'choropleth-data.json');
  }

  exportToCsv(): void {
    const data = this.data();
    if (!data.length) return;
    const headers = ['RegionId', 'Value', 'Label'];
    const rows = data.map(d => [d.regionId, d.value, d.label || '']);
    this.exportSvc.downloadCsv(headers, rows, 'choropleth-data.csv');
  }

  exportToSvg(): void {
    this.exportSvc.downloadSvg(this.svgEl()?.nativeElement, 'choropleth-map.svg');
  }

  exportToPdf(): void {
    this.exportSvc.downloadPdf(this.svgEl()?.nativeElement, 'Choropleth Map', 'choropleth-map.pdf');
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
