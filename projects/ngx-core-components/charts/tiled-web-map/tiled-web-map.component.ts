import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, HostListener, viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface MapMarker {
  lat: number;
  lng: number;
  label?: string;
}

@Component({
  selector: 'ngx-tiled-web-map',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div 
      class="ngx-tiled-web-map" 
      [class.dark]="theme() === 'dark'"
      (mouseleave)="onMouseLeave()"
    >
      <div class="chart-header" (mousemove)="$event.stopPropagation()">
        <div class="chart-title">
          <h4>{{ title() }}</h4>
        </div>
        
        <!-- Controls & Zoom -->
        <div class="map-controls">
          <button class="ctrl-btn" (click)="zoomIn()" aria-label="Zoom In">➕</button>
          <button class="ctrl-btn" (click)="zoomOut()" aria-label="Zoom Out">➖</button>
          <button class="ctrl-btn Reset" (click)="resetMap()" aria-label="Reset Map">🔄 Reset</button>
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

      <!-- Map viewport -->
      <div 
        class="map-viewport" 
        #container
        [style.height.px]="height()"
        (mousedown)="onMouseDown($event)"
        (mousemove)="onMouseMove($event)"
        (mouseup)="onMouseUp()"
        (mouseleave)="onMouseUp()"
        style="cursor: grab;"
        [style.cursor]="isDragging() ? 'grabbing' : 'grab'"
      >
        <!-- Tile Container Grid -->
        <div class="tiles-container">
          @for (tile of computedTiles(); track tile.key) {
            <img 
              [src]="tile.url" 
              [style.left.px]="tile.x" 
              [style.top.px]="tile.y" 
              class="map-tile"
              draggable="false"
              alt="Map Tile"
            />
          }
        </div>

        <!-- Overlays (SVG for markers and info) -->
        <svg 
          #svgEl
          class="overlay-svg"
          [attr.width]="containerWidth()"
          [attr.height]="height()"
        >
          <!-- Markers -->
          <g>
            @for (marker of computedMarkers(); track $index; let i = $index) {
              <!-- Marker Pin -->
              <g 
                [attr.transform]="'translate(' + marker.x + ',' + marker.y + ')'"
                class="marker-group"
                (mouseenter)="onMarkerHover(marker.raw, i, $event)"
                (mousemove)="onMarkerMouseMove($event)"
                style="cursor: pointer;"
              >
                <!-- Pin Path -->
                <path 
                  d="M0 -24 C-6 -24 -11 -19 -11 -13 C-11 -4 0 0 0 0 C0 0 11 -4 11 -13 C11 -19 6 -24 0 -24 Z" 
                  fill="#ef4444" 
                  stroke="#ffffff"
                  stroke-width="1.5"
                />
                <!-- Inner Dot -->
                <circle cx="0" cy="-13" r="3.5" fill="#ffffff" />
              </g>
            }
          </g>
        </svg>

        <!-- Glassmorphic Tooltip -->
        @if (tooltip(); as t) {
          <div class="chart-tooltip" [style.left.px]="tooltipX()" [style.top.px]="tooltipY()">
            <div class="tt-cat">{{ t.label || 'Location Pin' }}</div>
            <div class="tt-row">
              <span class="tt-name">Lat</span>
              <span class="tt-val">{{ t.lat.toFixed(4) }}°</span>
            </div>
            <div class="tt-row">
              <span class="tt-name">Lng</span>
              <span class="tt-val">{{ t.lng.toFixed(4) }}°</span>
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
    .ngx-tiled-web-map {
      background: var(--ngx-chart-bg, #ffffff);
      border-radius: 16px;
      padding: 16px;
      box-sizing: border-box;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
      position: relative;
      width: 100%;
      user-select: none;
      transition: background-color 0.3s;
    }
    .ngx-tiled-web-map.dark {
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

    /* Controls */
    .map-controls {
      display: flex;
      gap: 6px;
      margin-right: 80px;
    }
    .ctrl-btn {
      padding: 4px 8px;
      font-size: 11px;
      font-weight: 600;
      background: rgba(241, 245, 249, 0.8);
      backdrop-filter: blur(6px);
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .ctrl-btn:hover {
      background: #ffffff;
      color: #4f46e5;
      border-color: #4f46e5;
    }
    .dark .ctrl-btn {
      background: rgba(30, 41, 59, 0.8);
      border-color: rgba(255, 255, 255, 0.08);
      color: #f8fafc;
    }
    .dark .ctrl-btn:hover {
      background: #1e293b;
      color: #38bdf8;
      border-color: #38bdf8;
    }

    /* Viewport */
    .map-viewport {
      position: relative;
      width: 100%;
      border-radius: 10px;
      overflow: hidden;
      background: #e5e9f0;
      border: 1px solid #e2e8f0;
    }
    .dark .map-viewport {
      background: #1e293b;
      border-color: rgba(255, 255, 255, 0.08);
    }

    /* Tiles container */
    .tiles-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
    .map-tile {
      position: absolute;
      width: 256px;
      height: 256px;
      display: block;
    }

    /* SVG Overlay */
    .overlay-svg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      overflow: visible;
    }
    .marker-group {
      pointer-events: auto;
    }
    .marker-group path {
      transition: fill 0.15s, transform 0.15s;
    }
    .marker-group:hover path {
      fill: #dc2626;
      transform: scale(1.1);
    }

    /* Glassmorphic Tooltip */
    .chart-tooltip {
      position: absolute;
      pointer-events: none;
      transform: translate(-50%, -100%) translateY(-30px);
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
  `]
})
export class TiledWebMapComponent {
  title = input<string>('Interactive World Map');
  defaultCenter = input<{ lat: number; lng: number }>({ lat: 20, lng: 0 });
  defaultZoom = input<number>(2);
  markers = input<MapMarker[]>([]);
  height = input<number>(450);
  theme = input<'light' | 'dark'>('light');
  showExport = input<boolean>(false);

  containerWidth = signal<number>(800);
  mapCenter = signal<{ lat: number; lng: number }>({ lat: 20, lng: 0 });
  mapZoom = signal<number>(2);

  // Panning State
  isDragging = signal<boolean>(false);
  private dragStartX = 0;
  private dragStartY = 0;
  private dragStartCenter = { lat: 0, lng: 0 };

  // Tooltip State
  hoveredMarkerIndex = signal<number | null>(null);
  tooltip = signal<any | null>(null);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);
  exportMenuOpen = signal(false);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');
  private container = viewChild<ElementRef>('container');

  constructor() {
    const hostEl = inject(ElementRef).nativeElement;
    
    // Watch dimensions
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

    // Set initial configuration
    this.mapCenter.set(this.defaultCenter());
    this.mapZoom.set(this.defaultZoom());
  }

  // Slippy map computations
  // Fractional center point in tile coordinates
  centerTileCoords = computed(() => {
    const lat = Math.max(-85, Math.min(85, this.mapCenter().lat));
    const lng = this.mapCenter().lng;
    const zoom = this.mapZoom();
    const n = Math.pow(2, zoom);

    const xFrac = ((lng + 180) / 360) * n;
    const latRad = (lat * Math.PI) / 180;
    const yFrac = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;

    return { x: xFrac, y: yFrac, n };
  });

  // Compute standard tile grid overlap
  computedTiles = computed(() => {
    const w = this.containerWidth();
    const h = this.height();
    const { x: xc, y: yc, n } = this.centerTileCoords();
    const zoom = this.mapZoom();

    // Viewport left and top in tile pixels (each tile is 256px)
    const viewLeft = xc * 256 - w / 2;
    const viewTop = yc * 256 - h / 2;

    const minTx = Math.max(0, Math.floor(viewLeft / 256));
    const maxTx = Math.min(n - 1, Math.floor((viewLeft + w) / 256));
    const minTy = Math.max(0, Math.floor(viewTop / 256));
    const maxTy = Math.min(n - 1, Math.floor((viewTop + h) / 256));

    const tiles: { key: string; url: string; x: number; y: number }[] = [];

    for (let tx = minTx; tx <= maxTx; tx++) {
      for (let ty = minTy; ty <= maxTy; ty++) {
        // Pixel offsets relative to container
        const xOffset = tx * 256 - viewLeft;
        const yOffset = ty * 256 - viewTop;
        
        // Clean URL to OSM tiles (SSL secure, subdomain-less)
        const url = `https://tile.openstreetmap.org/${zoom}/${tx}/${ty}.png`;
        
        tiles.push({
          key: `${zoom}-${tx}-${ty}`,
          url,
          x: xOffset,
          y: yOffset
        });
      }
    }

    return tiles;
  });

  // Project marker locations to pixel coordinates relative to the viewport
  computedMarkers = computed(() => {
    const w = this.containerWidth();
    const h = this.height();
    const { x: xc, y: yc, n } = this.centerTileCoords();

    const viewLeft = xc * 256 - w / 2;
    const viewTop = yc * 256 - h / 2;

    return this.markers().map(marker => {
      const lat = Math.max(-85, Math.min(85, marker.lat));
      const lng = marker.lng;

      // Project
      const mxFrac = ((lng + 180) / 360) * n;
      const mLatRad = (lat * Math.PI) / 180;
      const myFrac = ((1 - Math.log(Math.tan(mLatRad) + 1 / Math.cos(mLatRad)) / Math.PI) / 2) * n;

      const px = mxFrac * 256 - viewLeft;
      const py = myFrac * 256 - viewTop;

      return {
        x: px,
        y: py,
        raw: marker
      };
    });
  });

  // Map Controls
  zoomIn() {
    this.mapZoom.set(Math.min(18, this.mapZoom() + 1));
  }

  zoomOut() {
    this.mapZoom.set(Math.max(0, this.mapZoom() - 1));
  }

  resetMap() {
    this.mapCenter.set(this.defaultCenter());
    this.mapZoom.set(this.defaultZoom());
  }

  // Interactive Drag Panning
  onMouseDown(event: MouseEvent) {
    // Avoid dragging conflict with header/buttons
    if ((event.target as HTMLElement).closest('.chart-header') || (event.target as HTMLElement).closest('.map-controls')) {
      return;
    }
    event.preventDefault();
    this.isDragging.set(true);
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.dragStartCenter = { ...this.mapCenter() };
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isDragging()) return;

    const dx = event.clientX - this.dragStartX;
    const dy = event.clientY - this.dragStartY;

    const zoom = this.mapZoom();
    const n = Math.pow(2, zoom);

    // Convert pixel delta back to lat/lng using center values
    const lat = Math.max(-85, Math.min(85, this.dragStartCenter.lat));
    const lng = this.dragStartCenter.lng;

    // Center tile coord at start
    const xcStart = ((lng + 180) / 360) * n;
    const latRadStart = (lat * Math.PI) / 180;
    const ycStart = ((1 - Math.log(Math.tan(latRadStart) + 1 / Math.cos(latRadStart)) / Math.PI) / 2) * n;

    // Shift center by negative pixel offsets
    const xcNew = xcStart - (dx / 256);
    const ycNew = ycStart - (dy / 256);

    // Convert back to lng
    const newLng = (xcNew / n) * 360 - 180;

    // Convert back to lat (using Gudermannian/sinh math)
    const sinhVal = Math.sinh(Math.PI * (1 - 2 * (ycNew / n)));
    const newLat = (Math.atan(sinhVal) * 180) / Math.PI;

    // Keep longitude bounded within -180 and 180 (cycling around)
    let finalLng = newLng % 360;
    if (finalLng < -180) finalLng += 360;
    if (finalLng > 180) finalLng -= 360;

    this.mapCenter.set({
      lat: Math.max(-85, Math.min(85, newLat)),
      lng: finalLng
    });
  }

  onMouseUp() {
    this.isDragging.set(false);
  }

  // Hover markers
  onMarkerHover(marker: MapMarker, index: number, event: MouseEvent) {
    this.hoveredMarkerIndex.set(index);
    this.tooltip.set({
      label: marker.label,
      lat: marker.lat,
      lng: marker.lng
    });
  }

  onMarkerMouseMove(event: MouseEvent) {
    const containerEl = this.container()?.nativeElement;
    if (containerEl) {
      const rect = containerEl.getBoundingClientRect();
      this.tooltipX.set(event.clientX - rect.left);
      this.tooltipY.set(event.clientY - rect.top);
    }
  }

  onMouseLeave() {
    this.hoveredMarkerIndex.set(null);
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
    const data = {
      center: this.mapCenter(),
      zoom: this.mapZoom(),
      markers: this.markers()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'tiled-map-state.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToCsv(): void {
    const data = this.markers();
    if (!data.length) return;
    let csv = 'Label,Latitude,Longitude\n';
    data.forEach(d => {
      csv += `"${d.label || ''}",${d.lat},${d.lng}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'tiled-map-markers.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Renders the current layout as SVG representation
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
    link.setAttribute('download', 'map-overlay.svg');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToPdf(): void {
    // Generate a print representation of the actual DOM viewport so that raster tiles print nicely
    const containerEl = this.container()?.nativeElement;
    if (!containerEl) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    // Copy HTML contents containing both tile images and SVGs
    const htmlString = containerEl.innerHTML;
    const width = this.containerWidth();
    const height = this.height();

    printWindow.document.write(`
      <html>
        <head>
          <title>Export PDF - Tiled Web Map</title>
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
              position: relative;
              width: ${width}px;
              height: ${height}px;
              overflow: hidden;
              background: #e5e9f0;
              border: 1px solid #cbd5e1;
              box-sizing: border-box;
            }
            .tiles-container {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
            }
            .map-tile {
              position: absolute;
              width: 256px;
              height: 256px;
              display: block;
            }
            svg {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              overflow: visible;
            }
            @media print {
              body {
                background: none;
              }
              .print-container {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${htmlString}
          </div>
          <script>
            window.onload = () => {
              // Wait for image tiles to download before print dialog
              setTimeout(() => {
                window.print();
                window.close();
              }, 600);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}
