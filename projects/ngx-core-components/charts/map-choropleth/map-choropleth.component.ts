import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, HostListener, viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-map-choropleth" [class.dark]="theme() === 'dark'" (mouseleave)="onMouseLeave()">
      <div class="chart-header" (mousemove)="$event.stopPropagation()" (mouseleave)="onMouseLeave()">
        <div class="chart-title">
          <h4>{{ title() }}</h4>
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

    /* Header and Export dropdown styles */
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
    .chart-svg-container {
      position: relative;
      width: 100%;
    }
  `]
})
export class MapChoroplethComponent {
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
  exportMenuOpen = signal(false);

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
    const data = this.data();
    if (!data.length) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'choropleth-data.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToCsv(): void {
    const data = this.data();
    if (!data.length) return;
    let csv = 'RegionId,Value,Label\n';
    data.forEach(d => {
      csv += `"${d.regionId}",${d.value},"${d.label || ''}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'choropleth-data.csv');
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
    link.setAttribute('download', 'choropleth-map.svg');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToPdf(): void {
    const svg = this.svgEl()?.nativeElement;
    if (!svg) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const svgClone = svg.cloneNode(true) as SVGElement;
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const svgString = new XMLSerializer().serializeToString(svgClone);
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Export PDF</title>
          <style>
            body {
              margin: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              background-color: #ffffff;
              font-family: system-ui, sans-serif;
            }
            .print-container {
              text-align: center;
              width: 100%;
              max-width: 800px;
              padding: 20px;
            }
            svg {
              width: 100%;
              height: auto;
              max-height: 90vh;
            }
            @media print {
              body {
                background: none;
              }
              .print-container {
                max-width: 100%;
                padding: 0;
              }
              svg {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${svgString}
          </div>
          <script>
            window.onload = () => {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
