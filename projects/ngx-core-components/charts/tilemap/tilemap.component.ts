import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, TemplateRef, viewChild, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CHART_COLORS, fmtNum, scale } from '../shared/chart-utils';

export interface TileItem {
  r: number;
  c: number;
  label: string;
  value: number;
  color?: string;
  tooltipInfo?: string;
}

export interface ComputedTile {
  raw: TileItem;
  index: number;
  x: number;
  y: number;
  w: number;
  h: number;
  pointsPath: string; // for hexagon
  color: string;
}

@Component({
  selector: 'ngx-tilemap',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-tilemap" (mouseleave)="onMouseLeave()">
      <div class="chart-header" (mousemove)="$event.stopPropagation()" (mouseleave)="onMouseLeave()">
        <div class="header-info">
          <span class="header-title">Grid Tilemap</span>
          <span class="header-subtitle">Layout: {{ type() | titlecase }} Grid</span>
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
        class="tilemap-svg"
        [attr.width]="'100%'"
        [attr.height]="svgHeight()"
      >
        <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
          @for (tile of computedTiles(); track tile.index; let i = $index) {
            <g
              class="tile-group"
              [class.dimmed]="hoveredIndex() !== null && hoveredIndex() !== i"
              [class.highlighted]="hoveredIndex() === i"
              (mouseenter)="onTileHover(i)"
              (mousemove)="onMouseMove($event)"
            >
              @if (type() === 'rect') {
                <rect
                  [attr.x]="tile.x"
                  [attr.y]="tile.y"
                  [attr.width]="tile.w"
                  [attr.height]="tile.h"
                  [attr.fill]="tile.color"
                  stroke="#ffffff"
                  stroke-width="1.5"
                  rx="6"
                  ry="6"
                  class="tile-element"
                />
              } @else {
                <path
                  [attr.d]="tile.pointsPath"
                  [attr.fill]="tile.color"
                  stroke="#ffffff"
                  stroke-width="1.5"
                  class="tile-element"
                />
              }

              @if (showLabels()) {
                <text
                  [attr.x]="tile.x + tile.w / 2"
                  [attr.y]="tile.y + tile.h / 2 + 3"
                  text-anchor="middle"
                  class="tile-label"
                  [attr.fill]="getTextColor(tile.color)"
                >
                  {{ tile.raw.label }}
                </text>
                <text
                  [attr.x]="tile.x + tile.w / 2"
                  [attr.y]="tile.y + tile.h / 2 + 14"
                  text-anchor="middle"
                  class="tile-sublabel"
                  [attr.fill]="getTextColor(tile.color)"
                  opacity="0.8"
                >
                  {{ formatNumber(tile.raw.value) }}
                </text>
              }
            </g>
          }
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
              <span class="tt-name">Grid Pos</span>
              <span class="tt-val">Row {{ t.r }}, Col {{ t.c }}</span>
            </div>
            <div class="tt-row">
              <span class="tt-name">Value</span>
              <span class="tt-val">{{ labelFormatter() ? labelFormatter()!(t.value) : formatNumber(t.value) }}</span>
            </div>
            @if (t.tooltipInfo) {
              <div class="tt-info">{{ t.tooltipInfo }}</div>
            }
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
    .ngx-tilemap {
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
    .tilemap-svg {
      display: block;
      overflow: visible;
    }
    .tile-group {
      cursor: pointer;
      transition: opacity 0.2s ease;
    }
    .tile-group.dimmed {
      opacity: 0.3 !important;
    }
    .tile-element {
      transition: transform 0.2s ease, filter 0.2s ease;
      transform-origin: center;
    }
    .tile-group.highlighted .tile-element {
      filter: drop-shadow(0 4px 10px rgba(0,0,0,0.18));
      transform: scale(1.05);
      stroke: #0f172a !important;
      stroke-width: 2px !important;
      z-index: 10;
    }
    .tile-label {
      font-size: 11px;
      font-weight: 700;
      pointer-events: none;
      user-select: none;
    }
    .tile-sublabel {
      font-size: 8.5px;
      font-weight: 600;
      pointer-events: none;
      user-select: none;
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
    .tt-name {
      color: rgba(248, 250, 252, 0.8);
      flex: 1;
    }
    .tt-val {
      font-weight: 700;
      font-family: monospace;
    }
    .tt-info {
      font-size: 10px;
      color: #a7f3d0;
      margin-top: 8px;
      border-top: 1px dashed rgba(255, 255, 255, 0.1);
      padding-top: 4px;
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
export class TilemapComponent {
  data = input<TileItem[]>([]);
  type = input<'rect' | 'hexagon'>('rect');
  height = input<number>(350);
  colors = input<string[]>(CHART_COLORS);
  showLabels = input<boolean>(true);
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
    top: 15,
    right: 15,
    bottom: 15,
    left: 15
  }));

  svgHeight = computed(() => this.height());
  innerW = computed(() => Math.max(10, this.containerWidth() - this.margin().left - this.margin().right));
  innerH = computed(() => Math.max(10, this.svgHeight() - this.margin().top - this.margin().bottom));

  computedTiles = computed<ComputedTile[]>(() => {
    const raw = this.data();
    if (raw.length === 0) return [];

    const rows = raw.map(d => d.r);
    const cols = raw.map(d => d.c);

    const minRow = Math.min(...rows);
    const maxRow = Math.max(...rows);
    const minCol = Math.min(...cols);
    const maxCol = Math.max(...cols);

    const rowCount = maxRow - minRow + 1;
    const colCount = maxCol - minCol + 1;

    const w = this.innerW();
    const h = this.innerH();

    const minVal = Math.min(...raw.map(d => d.value));
    const maxVal = Math.max(1, ...raw.map(d => d.value));

    // Colors mapping
    const baseColor = this.colors()[0] || '#4a90d9';

    if (this.type() === 'rect') {
      const cellW = w / colCount;
      const cellH = h / rowCount;
      const padding = 4;

      return raw.map((d, idx) => {
        const x = (d.c - minCol) * cellW + padding / 2;
        const y = (d.r - minRow) * cellH + padding / 2;
        const tileW = cellW - padding;
        const tileH = cellH - padding;

        return {
          raw: d,
          index: idx,
          x,
          y,
          w: tileW,
          h: tileH,
          pointsPath: '',
          color: d.color || this.interpolateColor(baseColor, d.value, minVal, maxVal)
        };
      });
    } else {
      // Hexagonal layout
      // Divide horizontal space by (colCount * 0.75 + 0.25)
      const hexW = w / (colCount * 0.75 + 0.25);
      const hexH = h / (rowCount + 0.5);
      const padding = 3;

      // Hexagon radius
      const radius = Math.min(hexW / 2, hexH / Math.sqrt(3)) - padding / 2;

      return raw.map((d, idx) => {
        const cx = (d.c - minCol) * hexW * 0.75 + hexW / 2;
        // Shift alternate columns vertically
        const cy = (d.r - minRow) * hexH + ((d.c - minCol) % 2 === 0 ? 0 : hexH / 2) + hexH / 2;

        // Draw hexagon corners path
        let path = '';
        for (let k = 0; k < 6; k++) {
          const angleRad = (k * 60 * Math.PI) / 180;
          const x = cx + radius * Math.cos(angleRad);
          const y = cy + radius * Math.sin(angleRad);
          path += (k === 0 ? 'M' : 'L') + ` ${x} ${y}`;
        }
        path += ' Z';

        return {
          raw: d,
          index: idx,
          x: cx - radius,
          y: cy - radius,
          w: radius * 2,
          h: radius * 2,
          pointsPath: path,
          color: d.color || this.interpolateColor(baseColor, d.value, minVal, maxVal)
        };
      });
    }
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

  // Linear color interpolation from a light tone of the baseColor to the actual baseColor
  private interpolateColor(baseHex: string, val: number, min: number, max: number): string {
    const t = max === min ? 0.5 : (val - min) / (max - min);

    // Standard base color parsing
    let rB = 74, gB = 144, bB = 217;
    if (baseHex.startsWith('#')) {
      const hex = baseHex.substring(1);
      if (hex.length === 3) {
        rB = parseInt(hex[0] + hex[0], 16);
        gB = parseInt(hex[1] + hex[1], 16);
        bB = parseInt(hex[2] + hex[2], 16);
      } else if (hex.length === 6) {
        rB = parseInt(hex.substring(0, 2), 16);
        gB = parseInt(hex.substring(2, 4), 16);
        bB = parseInt(hex.substring(4, 6), 16);
      }
    }

    // Interpolate with light color (e.g. RGB 240, 246, 255)
    const rStart = 240, gStart = 246, bStart = 255;
    const r = Math.round(rStart + t * (rB - rStart));
    const g = Math.round(gStart + t * (gB - gStart));
    const b = Math.round(bStart + t * (bB - bStart));

    return `rgb(${r}, ${g}, ${b})`;
  }

  // Returns white text for dark backgrounds, dark text for light backgrounds
  getTextColor(bgColor: string): string {
    if (bgColor.startsWith('rgb')) {
      const matches = bgColor.match(/\d+/g);
      if (matches && matches.length >= 3) {
        const r = parseInt(matches[0]);
        const g = parseInt(matches[1]);
        const b = parseInt(matches[2]);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 140 ? '#1e293b' : '#ffffff';
      }
    }
    return '#1e293b';
  }

  onTileHover(idx: number) {
    this.hoveredIndex.set(idx);
    const tile = this.computedTiles()[idx];
    if (tile) {
      this.tooltip.set(tile.raw);
    }
  }

  onMouseMove(event: MouseEvent) {
    const el = event.currentTarget as SVGElement;
    const container = el.closest('.ngx-tilemap');
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
    const tiles = this.computedTiles();
    if (!tiles.length) return;

    let csv = 'Label,Row,Col,Value,TooltipInfo\n';
    tiles.forEach(t => {
      csv += `"${t.raw.label}",${t.raw.r},${t.raw.c},${t.raw.value},"${t.raw.tooltipInfo || ''}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'tilemap-data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToJson(): void {
    const tiles = this.computedTiles();
    if (!tiles.length) return;

    const data = tiles.map(t => ({
      label: t.raw.label,
      row: t.raw.r,
      col: t.raw.c,
      value: t.raw.value,
      tooltipInfo: t.raw.tooltipInfo
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'tilemap-data.json');
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
    link.setAttribute('download', 'tilemap.svg');
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
        <title>Tilemap Export</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #0f172a; text-align: center; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 24px; text-align: left; }
          .title { font-size: 20px; font-weight: bold; }
          .date { font-size: 12px; color: #64748b; }
          .chart-container { display: inline-block; margin-top: 24px; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; background: #ffffff; width: 90%; }
          svg { width: 100%; height: auto; }
          .tile-label { font-size: 11px; font-weight: bold; }
          .tile-sublabel { font-size: 8.5px; }
          @media print {
            body { padding: 0; }
            .chart-container { border: none; padding: 0; width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">Grid Tilemap Analysis</div>
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
