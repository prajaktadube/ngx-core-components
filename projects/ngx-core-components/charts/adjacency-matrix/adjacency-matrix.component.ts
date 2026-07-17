import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, HostListener, viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CHART_COLORS, fmtNum } from '../shared/chart-utils';

export interface MatrixItem {
  labels: string[];
  matrix: number[][];
  color?: string;
}

interface ProcessedCell {
  rowIdx: number;
  colIdx: number;
  value: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: string;
}

@Component({
  selector: 'ngx-adjacency-matrix',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-adjacency-matrix" (mouseleave)="onMouseLeave()">
      <!-- Toolbar with Export option -->
      <div class="chart-header" (mousemove)="$event.stopPropagation()" (mouseleave)="onMouseLeave()">
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

      <svg
        #svgEl
        class="matrix-svg"
        [attr.width]="'100%'"
        [attr.height]="svgHeight()"
      >
        <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
          
          <!-- Column Labels (Top - rotated for readability) -->
          @if (showLabels()) {
            @for (label of labels(); track label; let i = $index) {
              <g [attr.transform]="'translate(' + (i * cellSize() + cellSize() / 2) + ', -8)'">
                <text
                  transform="rotate(-45)"
                  text-anchor="start"
                  class="col-label"
                >
                  {{ label }}
                </text>
              </g>
            }
          }

          <!-- Row Labels (Left) -->
          @if (showLabels()) {
            @for (label of labels(); track label; let i = $index) {
              <text
                [attr.x]="-12"
                [attr.y]="i * cellSize() + cellSize() / 2"
                text-anchor="end"
                dominant-baseline="middle"
                class="row-label"
              >
                {{ label }}
              </text>
            }
          }

          <!-- Grid Background Matrix Cells -->
          @for (cell of computedCells(); track cell.rowIdx + '-' + cell.colIdx; let i = $index) {
            <g>
              <rect
                [attr.x]="cell.x"
                [attr.y]="cell.y"
                [attr.width]="cell.size"
                [attr.height]="cell.size"
                [attr.fill]="cell.color"
                [attr.fill-opacity]="cell.opacity"
                [attr.stroke]="gridColor()"
                stroke-width="1"
                class="matrix-cell"
                [class.dimmed]="hoveredCoords() !== null && hoveredCoords()!.row !== cell.rowIdx && hoveredCoords()!.col !== cell.colIdx"
                [class.highlighted]="hoveredCoords() !== null && (hoveredCoords()!.row === cell.rowIdx || hoveredCoords()!.col === cell.colIdx)"
                (mouseenter)="onCellHover(cell.rowIdx, cell.colIdx, $event)"
                (mousemove)="onMouseMove($event)"
                [style.animation-delay]="(cell.rowIdx * 0.04 + cell.colIdx * 0.04) + 's'"
              />
            </g>
          }
        </g>
      </svg>

      <!-- Glassmorphic Tooltip -->
      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="tooltipX()" [style.top.px]="tooltipY()">
          <div class="tt-cat">{{ t.source }} ➔ {{ t.target }}</div>
          <div class="tt-row">
            <span class="tt-name">Connection Weight</span>
            <span class="tt-val">{{ formatNumber(t.value) }}</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .ngx-adjacency-matrix {
      background: var(--ngx-chart-bg, #ffffff);
      border-radius: 16px;
      padding: 16px;
      box-sizing: border-box;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
      position: relative;
      width: 100%;
    }
    .matrix-svg {
      display: block;
      overflow: visible;
    }
    .matrix-cell {
      transition: fill-opacity 0.15s ease, opacity 0.15s ease;
      cursor: pointer;
      animation: cellFadeIn 0.4s ease-out forwards;
      opacity: 0;
      transform-origin: center;
    }
    @keyframes cellFadeIn {
      to { opacity: 1; }
    }
    .matrix-cell.dimmed {
      opacity: 0.4;
    }
    .matrix-cell.highlighted {
      stroke: var(--ngx-chart-axis, #94a3b8);
      stroke-width: 1.5;
    }
    .row-label, .col-label {
      font-size: 11px;
      fill: var(--ngx-chart-axis-text, #475569);
      font-weight: 600;
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

    /* Export dropdown styles */
    .chart-export-menu {
      position: relative;
      z-index: 50;
      margin-bottom: 12px;
    }
    .export-trigger {
      float: right;
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
      z-index: 60;
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
    .chart-header { display: flex; justify-content: space-between; align-items: center; min-height: 24px; position: relative; }
  `]
})
export class AdjacencyMatrixComponent {
  matrix = input<number[][]>([]);
  labels = input<string[]>([]);
  height = input<number>(400);
  showLabels = input<boolean>(true);
  color = input<string>(CHART_COLORS[0]); // Base matrix color
  gridColor = input<string>('var(--ngx-chart-bg, #ffffff)');
  showExport = input<boolean>(false);

  containerWidth = signal<number>(500);
  hoveredCoords = signal<{ row: number; col: number } | null>(null);
  tooltip = signal<any | null>(null);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);
  exportMenuOpen = signal(false);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  svgHeight = computed(() => this.height());

  margin = computed(() => ({
    top: this.showLabels() ? 80 : 10,
    right: 20,
    bottom: 20,
    left: this.showLabels() ? 80 : 10
  }));

  innerW = computed(() => Math.max(10, this.containerWidth() - this.margin().left - this.margin().right));
  innerH = computed(() => Math.max(10, this.svgHeight() - this.margin().top - this.margin().bottom));

  cellSize = computed(() => {
    const count = this.labels().length || 1;
    const sizeLimit = Math.min(this.innerW(), this.innerH());
    return sizeLimit / count;
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

  computedCells = computed<ProcessedCell[]>(() => {
    const m = this.matrix();
    const count = m.length;
    if (count === 0) return [];

    const cellS = this.cellSize();
    const c = this.color();

    // Find matrix maximum weight to scale opacity values
    let maxWeight = 0;
    for (let r = 0; r < count; r++) {
      for (let col = 0; col < count; col++) {
        if (m[r][col] > maxWeight) {
          maxWeight = m[r][col];
        }
      }
    }
    if (maxWeight === 0) maxWeight = 1;

    const cells: ProcessedCell[] = [];

    for (let r = 0; r < count; r++) {
      for (let col = 0; col < count; col++) {
        const value = m[r][col];
        // Calculate cell opacity relative to connection weight (minimum opacity of 0.05 for non-zero connections)
        const opacity = value > 0 ? Math.max(0.08, value / maxWeight) : 0.02;

        cells.push({
          rowIdx: r,
          colIdx: col,
          value,
          x: col * cellS,
          y: r * cellS,
          size: cellS,
          opacity,
          color: value > 0 ? c : '#e2e8f0'
        });
      }
    }

    return cells;
  });

  onCellHover(row: number, col: number, event: MouseEvent) {
    this.hoveredCoords.set({ row, col });
    const m = this.matrix();
    const l = this.labels();
    this.tooltip.set({
      source: l[row] || `Node ${row + 1}`,
      target: l[col] || `Node ${col + 1}`,
      value: m[row][col]
    });
  }

  onMouseMove(event: MouseEvent) {
    const el = event.currentTarget as SVGElement;
    const container = el.closest('.ngx-adjacency-matrix');
    if (container) {
      const rect = container.getBoundingClientRect();
      this.tooltipX.set(event.clientX - rect.left);
      this.tooltipY.set(event.clientY - rect.top);
    }
  }

  onMouseLeave() {
    this.hoveredCoords.set(null);
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
    const matrix = this.matrix();
    const labels = this.labels();
    if (!matrix.length || !labels.length) return;
    let csv = 'Source,Target,Weight\n';
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c] > 0) {
          csv += `"${labels[r]}","${labels[c]}",${matrix[r][c]}\n`;
        }
      }
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'adjacency-matrix-data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToJson(): void {
    const matrix = this.matrix();
    const labels = this.labels();
    if (!matrix.length || !labels.length) return;
    const data = [];
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c] > 0) {
          data.push({ source: labels[r], target: labels[c], weight: matrix[r][c] });
        }
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'adjacency-matrix-data.json');
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
    source = '<?xml version="1.0" encoding="utf-8"?>\n' + source;
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'adjacency-matrix.svg');
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
        <title>Adjacency Matrix Export</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #0f172a; text-align: center; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 24px; text-align: left; }
          .title { font-size: 20px; font-weight: bold; }
          .date { font-size: 12px; color: #64748b; }
          .chart-container { display: inline-block; margin-top: 24px; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; background: #ffffff; width: 90%; }
          svg { width: 100%; height: auto; }
          .row-label, .col-label { font-size: 11px; fill: #475569; font-weight: 600; }
          @media print {
            body { padding: 0; }
            .chart-container { border: none; padding: 0; width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">Adjacency Matrix Analytics</div>
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
