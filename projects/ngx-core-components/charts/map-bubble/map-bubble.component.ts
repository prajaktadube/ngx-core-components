import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, HostListener, viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { fmtNum, scale } from '../shared/chart-utils';
import { WORLD_MAP_DATA, getSvgPath, project } from '../shared/map-data';

export interface MapBubblePoint {
  lat: number;
  lng: number;
  value: number;
  label?: string;
  color?: string; // Optional custom color override
  group?: string; // Group for color categorization
}

@Component({
  selector: 'ngx-map-bubble',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-map-bubble" [class.dark]="theme() === 'dark'" (mouseleave)="onMouseLeave()">
      <div class="chart-header" (mousemove)="$event.stopPropagation()" (mouseleave)="onMouseLeave()">
        <div class="chart-title">
          <h4>{{ title() }}</h4>
        </div>
        
        <!-- Legend -->
        @if (showLegend() && uniqueGroups().length > 0) {
          <div class="chart-legend">
            @for (grp of uniqueGroups(); track grp; let idx = $index) {
              <span class="legend-item">
                <span class="legend-dot" [style.background]="getGroupColor(grp)"></span>
                {{ grp }}
              </span>
            }
          </div>
        }

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
          class="map-svg"
          [attr.width]="'100%'"
          [attr.height]="height()"
        >
          <!-- Base Map Outlines -->
          <g class="map-base">
            @for (pathStr of baseMapPaths(); track $index) {
              <path
                [attr.d]="pathStr"
                [attr.fill]="theme() === 'dark' ? '#1e293b' : '#f1f5f9'"
                [attr.stroke]="theme() === 'dark' ? '#0f172a' : '#cbd5e1'"
                stroke-width="1"
              />
            }
          </g>

          <!-- Bubble Overlays -->
          <g class="map-bubbles">
            @for (bubble of scaledBubbles(); track $index; let i = $index) {
              <circle
                [attr.cx]="bubble.x"
                [attr.cy]="bubble.y"
                [attr.r]="hoveredBubbleIndex() === i ? bubble.r * 1.15 + 2 : bubble.r"
                [attr.fill]="bubble.color"
                stroke="#ffffff"
                [attr.stroke-width]="hoveredBubbleIndex() === i ? 2 : 1.2"
                [attr.fill-opacity]="hoveredBubbleIndex() === i ? 0.9 : 0.7"
                class="bubble-node"
                [class.hovered]="hoveredBubbleIndex() === i"
                (mouseenter)="onBubbleHover(bubble, i, $event)"
                (mousemove)="onBubbleMouseMove($event)"
              />
            }
          </g>
        </svg>

        <!-- Glassmorphic Tooltip -->
        @if (tooltip(); as t) {
          <div class="chart-tooltip" [style.left.px]="tooltipX()" [style.top.px]="tooltipY()">
            <div class="tt-cat">{{ t.label || 'Location Marker' }}</div>
            <div class="tt-row">
              <span class="tt-name">Value</span>
              <span class="tt-val">{{ fmtNum(t.value) }}</span>
            </div>
            <div class="tt-row">
              <span class="tt-name">Coords</span>
              <span class="tt-val">{{ t.lat.toFixed(2) }}°, {{ t.lng.toFixed(2) }}°</span>
            </div>
            @if (t.group) {
              <div class="tt-row label-row">
                <span class="tt-dot" [style.background]="t.color"></span>
                <span class="tt-name">Group: {{ t.group }}</span>
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
    .ngx-map-bubble {
      background: var(--ngx-chart-bg, #ffffff);
      border-radius: 16px;
      padding: 16px;
      box-sizing: border-box;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
      position: relative;
      width: 100%;
      transition: background-color 0.3s;
    }
    .ngx-map-bubble.dark {
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
    
    /* Legend styling */
    .chart-legend {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      margin-right: 80px;
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

    .map-svg {
      display: block;
      overflow: visible;
    }
    .bubble-node {
      cursor: pointer;
      transition: r 0.2s cubic-bezier(0.16, 1, 0.3, 1), fill-opacity 0.2s, stroke-width 0.2s;
    }
    .bubble-node.hovered {
      filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.35));
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
    .label-row {
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
export class MapBubbleComponent {
  title = input<string>('Geographical Bubble Matrix');
  data = input<MapBubblePoint[]>([]);
  height = input<number>(400);
  colors = input<string[]>(['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']);
  minBubbleSize = input<number>(6);
  maxBubbleSize = input<number>(28);
  showLegend = input<boolean>(true);
  showExport = input<boolean>(false);
  theme = input<'light' | 'dark'>('light');

  containerWidth = signal<number>(600);
  hoveredBubbleIndex = signal<number | null>(null);
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

  uniqueGroups = computed(() => {
    const grps = new Set<string>();
    this.data().forEach(p => {
      if (p.group) grps.add(p.group);
    });
    return Array.from(grps);
  });

  getGroupColor(grp?: string): string {
    if (!grp) return this.colors()[0];
    const idx = this.uniqueGroups().indexOf(grp);
    return this.colors()[idx % this.colors().length];
  }

  baseMapPaths = computed(() => {
    const w = this.containerWidth();
    const h = this.height();
    const padding = { top: 10, right: 10, bottom: 10, left: 10 };
    return WORLD_MAP_DATA.map(region => getSvgPath(region.polygons, w, h, padding));
  });

  private values = computed(() => this.data().map(d => d.value));
  private minVal = computed(() => this.values().length > 0 ? Math.min(...this.values()) : 0);
  private maxVal = computed(() => this.values().length > 0 ? Math.max(...this.values()) : 100);

  scaledBubbles = computed(() => {
    const w = this.containerWidth();
    const h = this.height();
    const min = this.minVal();
    const max = this.maxVal();
    const minSize = this.minBubbleSize();
    const maxSize = this.maxBubbleSize();
    
    const padding = { top: 10, right: 10, bottom: 10, left: 10 };

    return this.data().map(pt => {
      const coord = project(pt.lng, pt.lat, w, h, padding);
      const r = scale(pt.value, min, max, minSize, maxSize);
      const color = pt.color || this.getGroupColor(pt.group);

      return {
        x: coord.x,
        y: coord.y,
        r,
        color,
        raw: pt
      };
    });
  });

  onBubbleHover(bubble: any, index: number, event: MouseEvent) {
    this.hoveredBubbleIndex.set(index);
    this.tooltip.set({
      label: bubble.raw.label,
      value: bubble.raw.value,
      lat: bubble.raw.lat,
      lng: bubble.raw.lng,
      group: bubble.raw.group,
      color: bubble.color
    });
  }

  onBubbleMouseMove(event: MouseEvent) {
    const containerEl = this.container()?.nativeElement;
    if (containerEl) {
      const rect = containerEl.getBoundingClientRect();
      this.tooltipX.set(event.clientX - rect.left);
      this.tooltipY.set(event.clientY - rect.top);
    }
  }

  onMouseLeave() {
    this.hoveredBubbleIndex.set(null);
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
    link.setAttribute('download', 'map-bubbles-data.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToCsv(): void {
    const data = this.data();
    if (!data.length) return;
    let csv = 'Label,Group,Latitude,Longitude,Value\n';
    data.forEach(d => {
      csv += `"${d.label || ''}","${d.group || ''}",${d.lat},${d.lng},${d.value}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'map-bubbles-data.csv');
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
    link.setAttribute('download', 'map-bubbles.svg');
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

  readonly fmtNum = fmtNum;
}
