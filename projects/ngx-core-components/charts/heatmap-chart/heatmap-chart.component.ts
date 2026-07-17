import {
  Component, input, output, signal, computed, ChangeDetectionStrategy,
  ElementRef, viewChild, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngx-heatmap-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-heatmap-wrapper">
      <div class="chart-header" (mousemove)="$event.stopPropagation()" (mouseleave)="onCellLeave()">
        <div class="chart-title-space"></div>
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

      <div class="ngx-heatmap-container">
        <!-- SVG Grid rendering -->
        <svg
          #svgEl
          class="ngx-heatmap-svg"
          [attr.viewBox]="viewBoxString()"
          preserveAspectRatio="xMidYMid meet"
        >
          <!-- Y-axis labels -->
          @for (yLabel of yAxisLabels(); track $index) {
            <text
              [attr.x]="leftOffset - 8"
              [attr.y]="getRowY($index) + cellHeight() / 2"
              class="axis-label y-axis-label"
              text-anchor="end"
              dominant-baseline="middle"
            >
              {{ yLabel }}
            </text>
          }

          <!-- X-axis labels -->
          @for (xLabel of xAxisLabels(); track $index) {
            <text
              [attr.x]="getColX($index) + cellWidth() / 2"
              [attr.y]="topOffset - 8"
              class="axis-label x-axis-label"
              text-anchor="middle"
            >
              {{ xLabel }}
            </text>
          }

          <!-- Heatmap Cells -->
          @for (row of data(); track $index; let rIdx = $index) {
            @for (val of row; track $index; let cIdx = $index) {
              <rect
                [attr.x]="getColX(cIdx)"
                [attr.y]="getRowY(rIdx)"
                [attr.width]="cellWidth() - cellSpacing"
                [attr.height]="cellHeight() - cellSpacing"
                [attr.fill]="getCellColor(val)"
                class="heatmap-cell"
                [style.animation-delay]="(rIdx * 0.03 + cIdx * 0.03) + 's'"
                (mouseenter)="onCellEnter(rIdx, cIdx, val, $event)"
                (mouseleave)="onCellLeave()"
                (click)="onCellClick(rIdx, cIdx, val)"
                rx="3"
                ry="3"
              />
            }
          }
        </svg>

        <!-- Dynamic Tooltip -->
        @if (tooltip().show) {
          <div
            class="heatmap-tooltip"
            [style.left.px]="tooltip().x"
            [style.top.px]="tooltip().y"
          >
            <div class="tt-cat">{{ tooltip().title }}</div>
            <div class="tt-row">
              <span class="tt-dot" [style.background]="getCellColor(tooltip().rawVal)"></span>
              <span class="tt-name">Value</span>
              <span class="tt-val">{{ tooltip().value }}</span>
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
      height: 100%;
    }
    .ngx-heatmap-wrapper {
      width: 100%;
      height: 100%;
      padding: 20px;
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 12px;
      box-shadow: var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05));
      position: relative;
    }
    .ngx-heatmap-container {
      position: relative;
      width: 100%;
      height: 100%;
    }
    .ngx-heatmap-svg {
      width: 100%;
      height: 100%;
      overflow: visible;
    }
    .axis-label {
      font-size: 10px;
      font-weight: 700;
      fill: var(--text-secondary, #64748b);
      font-family: inherit;
    }

    @keyframes cellFadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }

    .heatmap-cell {
      cursor: pointer;
      transition: fill 0.2s ease, stroke 0.15s ease, filter 0.15s ease;
      stroke: transparent;
      stroke-width: 1px;
      transform-origin: center;
      animation: cellFadeIn 0.4s ease-out both;
    }
    .heatmap-cell:hover {
      filter: brightness(1.1) drop-shadow(0 4px 8px rgba(0,0,0,0.18));
      stroke: var(--ngx-chart-hover-stroke, #0f172a);
      stroke-width: 1.5px;
    }

    /* Glassmorphic Tooltip styling */
    .heatmap-tooltip {
      position: absolute;
      z-index: 100;
      pointer-events: none;
      background: var(--ngx-chart-tooltip-bg, rgba(15, 23, 42, 0.92));
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      color: var(--ngx-chart-tooltip-color, #f8fafc);
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 11px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      transform: translate(-50%, -115%);
      min-width: 140px;
      transition: left 0.1s cubic-bezier(0.16, 1, 0.3, 1), top 0.1s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .tt-cat {
      font-weight: 700;
      margin-bottom: 6px;
      font-size: 12px;
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

    /* Header and Export dropdown styles */
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      min-height: 24px;
      position: relative;
    }
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
export class HeatmapChartComponent {
  data = input.required<number[][]>();
  xAxisLabels = input<string[]>([]);
  yAxisLabels = input<string[]>([]);
  colorRange = input<string[]>(['#e2e8f0', '#4f46e5']);
  showExport = input<boolean>(false);

  cellClick = output<{ row: number; col: number; value: number }>();

  // Dimensions configuration
  leftOffset = 70;
  topOffset = 30;
  cellSpacing = 3;

  tooltip = signal<{ show: boolean; title: string; value: string; x: number; y: number; rawVal: number }>({
    show: false,
    title: '',
    value: '',
    x: 0,
    y: 0,
    rawVal: 0
  });
  exportMenuOpen = signal(false);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  cellWidth = computed(() => {
    const cols = this.data()[0]?.length || 1;
    return Math.max(16, (500 - this.leftOffset) / cols);
  });

  cellHeight = computed(() => {
    const rows = this.data().length || 1;
    return Math.max(16, (250 - this.topOffset) / rows);
  });

  viewBoxString = computed(() => {
    const cols = this.data()[0]?.length || 1;
    const rows = this.data().length || 1;
    const width = this.leftOffset + cols * this.cellWidth() + 10;
    const height = this.topOffset + rows * this.cellHeight() + 10;
    return `0 0 ${width} ${height}`;
  });

  getColX(colIdx: number): number {
    return this.leftOffset + colIdx * this.cellWidth();
  }

  getRowY(rowIdx: number): number {
    return this.topOffset + rowIdx * this.cellHeight();
  }

  getCellColor(val: number): string {
    const values = this.data().flat();
    const min = Math.min(...values, 0);
    const max = Math.max(...values, 1);
    const range = max - min;
    const fraction = range === 0 ? 0.5 : (val - min) / range;
    return this.interpolateColor(this.colorRange()[0], this.colorRange()[1], fraction);
  }

  private interpolateColor(color1: string, color2: string, fraction: number): string {
    const hex = (x: string) => {
      const h = x.replace('#', '');
      return h.length === 3 ? h.split('').map(c => c + c).join('') : h;
    };
    const c1 = hex(color1);
    const c2 = hex(color2);

    const r1 = parseInt(c1.substring(0, 2), 16);
    const g1 = parseInt(c1.substring(2, 4), 16);
    const b1 = parseInt(c1.substring(4, 6), 16);

    const r2 = parseInt(c2.substring(0, 2), 16);
    const g2 = parseInt(c2.substring(2, 4), 16);
    const b2 = parseInt(c2.substring(4, 6), 16);

    const r = Math.round(r1 + (r2 - r1) * fraction);
    const g = Math.round(g1 + (g2 - g1) * fraction);
    const b = Math.round(b1 + (b2 - b1) * fraction);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  onCellEnter(rIdx: number, cIdx: number, val: number, event: MouseEvent): void {
    const xLabel = this.xAxisLabels()[cIdx] || `Col ${cIdx + 1}`;
    const yLabel = this.yAxisLabels()[rIdx] || `Row ${rIdx + 1}`;
    const title = `${yLabel} • ${xLabel}`;

    const rect = (event.currentTarget as SVGRectElement).getBoundingClientRect();
    const parentRect = (event.currentTarget as SVGRectElement).ownerSVGElement!.parentElement!.getBoundingClientRect();
    const x = rect.left - parentRect.left + rect.width / 2;
    const y = rect.top - parentRect.top;

    this.tooltip.set({
      show: true,
      title,
      value: val.toLocaleString(),
      x,
      y,
      rawVal: val
    });
  }

  onCellLeave(): void {
    this.tooltip.update(t => ({ ...t, show: false }));
  }

  onCellClick(rIdx: number, cIdx: number, val: number): void {
    this.cellClick.emit({ row: rIdx, col: cIdx, value: val });
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
    link.setAttribute('download', 'heatmap-chart-data.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToCsv(): void {
    const data = this.data();
    if (!data.length) return;
    const xLabels = this.xAxisLabels();
    const yLabels = this.yAxisLabels();
    let csv = 'Row_Label,Column_Label,Value\n';
    data.forEach((row, rIdx) => {
      const yLabel = yLabels[rIdx] || `Row ${rIdx + 1}`;
      row.forEach((val, cIdx) => {
        const xLabel = xLabels[cIdx] || `Col ${cIdx + 1}`;
        csv += `"${yLabel}","${xLabel}",${val}\n`;
      });
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'heatmap-chart-data.csv');
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
    link.setAttribute('download', 'heatmap-chart.svg');
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
}
