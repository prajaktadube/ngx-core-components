import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, TemplateRef, viewChild, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CHART_COLORS, fmtNum } from '../shared/chart-utils';

export interface PictorialIcon {
  index: number;
  row: number;
  col: number;
  x: number;
  y: number;
  w: number;
  h: number;
  fillId: string;
  fraction: number;
}

@Component({
  selector: 'ngx-pictorial-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-pictorial" (mouseleave)="onMouseLeave()">
      <div class="chart-header" (mousemove)="$event.stopPropagation()" (mouseleave)="onMouseLeave()">
        <div class="header-info">
          <span class="header-title">Pictorial Progress</span>
          <span class="header-subtitle">Value: {{ value() }} / {{ max() }} ({{ percentage() | number:'1.0-1' }}%)</span>
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
        class="pictorial-svg"
        [attr.width]="'100%'"
        [attr.height]="svgHeight()"
      >
        <defs>
          <!-- Create dynamic linear gradients for partial fills -->
          @for (ic of computedIcons(); track ic.index) {
            <linearGradient [attr.id]="ic.fillId" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" [attr.stop-color]="activeColor()" />
              <stop [attr.offset]="(ic.fraction * 100) + '%'" [attr.stop-color]="activeColor()" />
              <stop [attr.offset]="(ic.fraction * 100) + '%'" [attr.stop-color]="inactiveColor()" />
              <stop offset="100%" [attr.stop-color]="inactiveColor()" />
            </linearGradient>
          }
        </defs>

        <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
          @for (ic of computedIcons(); track ic.index; let i = $index) {
            <g
              class="icon-group"
              [class.highlighted]="hoveredIndex() === i"
              (mouseenter)="onIconHover(i)"
              (mousemove)="onMouseMove($event)"
            >
              <!-- Draw the icon shape scaled and positioned -->
              <path
                [attr.d]="iconPath()"
                [attr.transform]="getIconTransform(ic)"
                [attr.fill]="'url(#' + ic.fillId + ')'"
                class="pictorial-shape"
              />
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
            <div class="tt-cat">Icon #{{ t.index + 1 }}</div>
            <div class="tt-row">
              <span class="tt-name">Value Threshold</span>
              <span class="tt-val">{{ formatNumber(t.threshold) }}</span>
            </div>
            <div class="tt-row">
              <span class="tt-name">Fill Level</span>
              <span class="tt-val">{{ t.fraction * 100 | number:'1.0-1' }}%</span>
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
    .ngx-pictorial {
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
    .pictorial-svg {
      display: block;
      overflow: visible;
    }
    .icon-group {
      cursor: pointer;
    }
    .pictorial-shape {
      transition: transform 0.15s ease, filter 0.15s ease;
      filter: drop-shadow(0 1px 2px rgba(0,0,0,0.06));
    }
    .icon-group.highlighted .pictorial-shape {
      transform: scale(1.1) translate(-2px, -2px);
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.15));
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
      min-width: 130px;
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
export class PictorialChartComponent {
  value = input<number>(0);
  max = input<number>(100);
  icon = input<'user' | 'star' | 'heart' | 'lightbulb' | 'car'>('user');
  iconCount = input<number>(10);
  height = input<number>(180);
  colors = input<string[]>(CHART_COLORS);
  showExport = input<boolean>(false);
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

  percentage = computed(() => {
    const m = Math.max(1, this.max());
    return Math.min(100, Math.max(0, (this.value() / m) * 100));
  });

  activeColor = computed(() => this.colors()[0] || '#4a90d9');
  inactiveColor = computed(() => '#cbd5e1'); // neutral slate-300 standard unselected

  iconPath = computed<string>(() => {
    switch (this.icon()) {
      case 'star':
        return 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z';
      case 'heart':
        return 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';
      case 'lightbulb':
        return 'M12 2C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16H10v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z';
      case 'car':
        return 'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z';
      case 'user':
      default:
        return 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z';
    }
  });

  computedIcons = computed<PictorialIcon[]>(() => {
    const totalCount = Math.max(1, this.iconCount());
    const val = this.value();
    const m = Math.max(1, this.max());
    const chunkVal = m / totalCount;

    const w = this.innerW();
    const h = this.innerH();

    // Determine grid layout based on count
    let cols = totalCount;
    let rows = 1;
    if (totalCount > 10) {
      cols = 10;
      rows = Math.ceil(totalCount / 10);
    }

    const cellW = w / cols;
    const cellH = h / rows;
    const size = Math.min(cellW, cellH) * 0.85;

    const icons: PictorialIcon[] = [];

    for (let i = 0; i < totalCount; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;

      // Position centering inside cell bounds
      const x = col * cellW + (cellW - size) / 2;
      const y = row * cellH + (cellH - size) / 2;

      // Calculate fraction fill level for this icon
      const lowerThreshold = i * chunkVal;
      const upperThreshold = (i + 1) * chunkVal;
      let fraction = 0;

      if (val >= upperThreshold) {
        fraction = 1;
      } else if (val > lowerThreshold) {
        fraction = (val - lowerThreshold) / chunkVal;
      }

      icons.push({
        index: i,
        row,
        col,
        x,
        y,
        w: size,
        h: size,
        fillId: `pictorial-fill-${i}-${Math.round(fraction * 100)}`,
        fraction
      });
    }

    return icons;
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

  // Returns scaling transformation to scale icon SVG path (assumed 24x24 viewBox) to target cell size
  getIconTransform(ic: PictorialIcon): string {
    const scaleFactor = ic.w / 24;
    return `translate(${ic.x}, ${ic.y}) scale(${scaleFactor})`;
  }

  onIconHover(idx: number) {
    this.hoveredIndex.set(idx);
    const totalCount = Math.max(1, this.iconCount());
    const m = Math.max(1, this.max());
    const chunkVal = m / totalCount;
    const ic = this.computedIcons()[idx];

    if (ic) {
      this.tooltip.set({
        index: idx,
        threshold: (idx + 1) * chunkVal,
        fraction: ic.fraction
      });
    }
  }

  onMouseMove(event: MouseEvent) {
    const el = event.currentTarget as SVGElement;
    const container = el.closest('.ngx-pictorial');
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
    let csv = 'Icon Index,Threshold Value,Fill Level Fraction\n';
    const totalCount = Math.max(1, this.iconCount());
    const m = Math.max(1, this.max());
    const chunkVal = m / totalCount;
    const icons = this.computedIcons();

    icons.forEach(ic => {
      csv += `${ic.index},${(ic.index + 1) * chunkVal},${ic.fraction}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'pictorial-chart-data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToJson(): void {
    const totalCount = Math.max(1, this.iconCount());
    const m = Math.max(1, this.max());
    const chunkVal = m / totalCount;
    const icons = this.computedIcons();

    const data = icons.map(ic => ({
      index: ic.index,
      threshold: (ic.index + 1) * chunkVal,
      fraction: ic.fraction
    }));

    const blob = new Blob([JSON.stringify({ value: this.value(), max: this.max(), percentage: this.percentage(), icons: data }, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'pictorial-chart-data.json');
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
    link.setAttribute('download', 'pictorial-chart.svg');
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
        <title>Pictorial Chart Export</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #0f172a; text-align: center; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 24px; text-align: left; }
          .title { font-size: 20px; font-weight: bold; }
          .date { font-size: 12px; color: #64748b; }
          .chart-container { display: inline-block; margin-top: 24px; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; background: #ffffff; width: 90%; }
          svg { width: 100%; height: auto; }
          @media print {
            body { padding: 0; }
            .chart-container { border: none; padding: 0; width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">Pictorial Grid Progress Report</div>
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
