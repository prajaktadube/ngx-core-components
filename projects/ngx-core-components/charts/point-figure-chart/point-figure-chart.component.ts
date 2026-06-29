import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, TemplateRef, viewChild, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CHART_COLORS, fmtNum, niceTicks, scale } from '../shared/chart-utils';

export interface PFCell {
  colIdx: number;
  rowIdx: number;
  type: 'X' | 'O';
  value: number;
  color: string;
  x: number;
  y: number;
  size: number;
}

interface PFColumn {
  type: 'X' | 'O';
  minBox: number;
  maxBox: number;
}

@Component({
  selector: 'ngx-point-figure-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-point-figure-chart" (mouseleave)="onMouseLeave()">
      <div class="chart-header">
        <div class="header-info">
          <span class="header-title">Point & Figure Chart</span>
          <span class="header-settings">Box: {{ boxSize() }} | Rev: {{ reversal() }}</span>
        </div>

        <!-- Export Menu -->
        @if (showExport()) {
          <div class="chart-export-menu">
            <button class="export-trigger" (click)="toggleExportMenu($event)" aria-label="Export Menu">📤 Export</button>
            @if (exportMenuOpen()) {
              <div class="export-dropdown">
                <button (click)="onExport('json')">📊 Export JSON</button>
                <button (click)="onExport('csv')">📄 Export CSV</button>
                <button (click)="onExport('svg')">🖼️ Export SVG</button>
              </div>
            }
          </div>
        }
      </div>

      <svg
        #svgEl
        class="pf-svg"
        [attr.width]="'100%'"
        [attr.height]="svgHeight()"
      >
        <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
          
          <!-- Y Grid Lines -->
          @if (showGrid()) {
            @for (row of yTicks(); track row) {
              <line
                [attr.x1]="0"
                [attr.x2]="innerW()"
                [attr.y1]="yPos(row)"
                [attr.y2]="yPos(row)"
                class="grid-line"
              />
            }
          }

          <!-- X's and O's Cell Shapes -->
          @for (cell of computedCells(); track cell.colIdx + '-' + cell.rowIdx; let idx = $index) {
            <g
              class="pf-cell-group"
              [class.dimmed]="hoveredCellIndex() !== null && hoveredCellIndex() !== idx"
              (mouseenter)="onCellHover(idx, $event)"
              (mousemove)="onMouseMove($event)"
              [style.animation-delay]="(cell.colIdx * 0.05) + 's'"
            >
              @if (cell.type === 'X') {
                <line
                  [attr.x1]="cell.x + cell.size * 0.15"
                  [attr.y1]="cell.y + cell.size * 0.15"
                  [attr.x2]="cell.x + cell.size * 0.85"
                  [attr.y2]="cell.y + cell.size * 0.85"
                  [attr.stroke]="cell.color"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  class="pf-shape"
                />
                <line
                  [attr.x1]="cell.x + cell.size * 0.85"
                  [attr.y1]="cell.y + cell.size * 0.15"
                  [attr.x2]="cell.x + cell.size * 0.15"
                  [attr.y2]="cell.y + cell.size * 0.85"
                  [attr.stroke]="cell.color"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  class="pf-shape"
                />
              } @else {
                <circle
                  [attr.cx]="cell.x + cell.size / 2"
                  [attr.cy]="cell.y + cell.size / 2"
                  [attr.r]="cell.size * 0.35"
                  [attr.stroke]="cell.color"
                  fill="none"
                  stroke-width="2.5"
                  class="pf-shape"
                />
              }
            </g>
          }

          <!-- Y Axis (Left side) -->
          <g class="y-axis">
            <line [attr.x1]="0" [attr.x2]="0" [attr.y1]="0" [attr.y2]="innerH()" class="axis-line" />
            @for (tick of yTicks(); track tick) {
              <g [attr.transform]="'translate(0,' + yPos(tick) + ')'">
                <line [attr.x1]="-4" [attr.x2]="0" [attr.y1]="0" [attr.y2]="0" class="tick-line" />
                <text
                  [attr.x]="-8"
                  text-anchor="end"
                  dominant-baseline="middle"
                  class="tick-label"
                >
                  {{ labelFormatter() ? labelFormatter()!(tick) : formatNumber(tick) }}
                </text>
              </g>
            }
          </g>

          <!-- Bottom X Axis line -->
          <g [attr.transform]="'translate(0,' + innerH() + ')'" class="x-axis">
            <line [attr.x1]="0" [attr.x2]="innerW()" [attr.y1]="0" [attr.y2]="0" class="axis-line" />
          </g>
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
            <div class="tt-cat" [style.color]="t.color">
              {{ t.type === 'X' ? 'Price Rise (X)' : 'Price Fall (O)' }}
            </div>
            <div class="tt-row">
              <span class="tt-name">Level</span>
              <span class="tt-val">{{ labelFormatter() ? labelFormatter()!(t.value) : formatNumber(t.value) }}</span>
            </div>
            <div class="tt-row">
              <span class="tt-name">Column</span>
              <span class="tt-val">#{{ t.colIdx + 1 }}</span>
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
    .ngx-point-figure-chart {
      background: var(--ngx-chart-bg, #ffffff);
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
      align-items: center;
      gap: 12px;
    }
    .header-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--ngx-chart-axis-text, #334155);
    }
    .header-settings {
      font-size: 11px;
      font-weight: 600;
      color: var(--ngx-chart-axis-text, #64748b);
      background: var(--ngx-chart-grid, #f1f5f9);
      padding: 2px 8px;
      border-radius: 6px;
    }
    .pf-svg {
      display: block;
      overflow: visible;
    }
    .grid-line {
      stroke: var(--ngx-chart-grid, #f1f5f9);
      stroke-width: 1;
    }
    .axis-line {
      stroke: var(--ngx-chart-axis, #cbd5e1);
      stroke-width: 1.5;
    }
    .tick-line {
      stroke: var(--ngx-chart-axis, #cbd5e1);
      stroke-width: 1.5;
    }
    .tick-label {
      font-size: 11px;
      fill: var(--ngx-chart-axis-text, #64748b);
      font-weight: 550;
      user-select: none;
    }
    .pf-cell-group {
      cursor: pointer;
      opacity: 0;
      animation: cellFadeIn 0.4s ease-out forwards;
    }
    @keyframes cellFadeIn {
      to { opacity: 1; }
    }
    .pf-cell-group.dimmed {
      opacity: 0.25 !important;
    }
    .pf-shape {
      transition: stroke-width 0.15s ease;
    }
    .pf-cell-group:hover .pf-shape {
      stroke-width: 3.5px !important;
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
export class PointFigureChartComponent {
  data = input<number[]>([]);
  boxSize = input<number>(4);
  reversal = input<number>(3);
  height = input<number>(350);
  showGrid = input<boolean>(true);
  xColor = input<string>('#10b981');
  oColor = input<string>('#ef4444');
  showExport = input<boolean>(false);
  labelFormatter = input<((v: number) => string) | undefined>(undefined);
  tooltipTemplate = input<TemplateRef<any> | null>(null);

  containerWidth = signal<number>(500);
  hoveredCellIndex = signal<number | null>(null);
  tooltip = signal<any | null>(null);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);
  exportMenuOpen = signal(false);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  margin = computed(() => ({
    top: 20,
    right: 20,
    bottom: 20,
    left: 45
  }));

  svgHeight = computed(() => this.height());
  innerW = computed(() => Math.max(10, this.containerWidth() - this.margin().left - this.margin().right));
  innerH = computed(() => Math.max(10, this.svgHeight() - this.margin().top - this.margin().bottom));

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

  // Calculate grid boxes populated with X or O
  computedCells = computed<PFCell[]>(() => {
    const prices = this.data();
    const size = this.boxSize() || 4;
    const revSize = this.reversal() || 3;
    if (prices.length === 0) return [];

    const getBox = (price: number) => Math.floor(price / size);

    const columns: PFColumn[] = [];
    let curType: 'X' | 'O' = 'X';
    let curMin = getBox(prices[0]);
    let curMax = curMin;

    for (let i = 1; i < prices.length; i++) {
      const box = getBox(prices[i]);

      if (curType === 'X') {
        if (box > curMax) {
          curMax = box;
        } else if (curMax - box >= revSize) {
          columns.push({ type: 'X', minBox: curMin, maxBox: curMax });
          curType = 'O';
          curMin = box;
          curMax = curMax - 1;
        }
      } else {
        if (box < curMin) {
          curMin = box;
        } else if (box - curMin >= revSize) {
          columns.push({ type: 'O', minBox: curMin, maxBox: curMax });
          curType = 'X';
          curMax = box;
          curMin = curMin + 1;
        }
      }
    }
    columns.push({ type: curType, minBox: curMin, maxBox: curMax });

    const w = this.innerW();
    const h = this.innerH();

    const allBoxes = columns.flatMap(c => [c.minBox, c.maxBox]);
    if (allBoxes.length === 0) return [];
    const minBoxIdx = Math.min(...allBoxes);
    const maxBoxIdx = Math.max(...allBoxes);
    const numRows = maxBoxIdx - minBoxIdx + 1;

    const cellSize = Math.min(w / columns.length, h / numRows);

    const cells: PFCell[] = [];
    columns.forEach((col, cIdx) => {
      for (let r = col.minBox; r <= col.maxBox; r++) {
        const val = r * size;
        const color = col.type === 'X' ? this.xColor() : this.oColor();

        const yOffset = h - (r - minBoxIdx + 1) * cellSize;
        const xOffset = cIdx * cellSize;

        cells.push({
          colIdx: cIdx,
          rowIdx: r,
          type: col.type,
          value: val,
          color,
          x: xOffset,
          y: yOffset,
          size: cellSize
        });
      }
    });

    return cells;
  });

  yTicks = computed(() => {
    const cells = this.computedCells();
    if (cells.length === 0) return [];
    const rows = Array.from(new Set(cells.map(c => c.rowIdx))).sort((a, b) => a - b);
    const size = this.boxSize() || 4;

    const maxLabels = 8;
    const step = Math.max(1, Math.floor(rows.length / maxLabels));

    return rows.filter((r, idx) => idx % step === 0).map(r => r * size);
  });

  yPos(val: number): number {
    const cells = this.computedCells();
    if (cells.length === 0) return 0;
    const size = this.boxSize() || 4;
    const boxIdx = val / size;

    const rowIdxs = cells.map(c => c.rowIdx);
    const minBoxIdx = Math.min(...rowIdxs);
    const cellS = cells[0].size;

    return this.innerH() - (boxIdx - minBoxIdx + 0.5) * cellS;
  }

  onCellHover(idx: number, event: MouseEvent) {
    this.hoveredCellIndex.set(idx);
    const cell = this.computedCells()[idx];
    if (cell) {
      this.tooltip.set(cell);
    }
  }

  onMouseMove(event: MouseEvent) {
    const el = event.currentTarget as SVGElement;
    const container = el.closest('.ngx-point-figure-chart');
    if (container) {
      const rect = container.getBoundingClientRect();
      this.tooltipX.set(event.clientX - rect.left);
      this.tooltipY.set(event.clientY - rect.top);
    }
  }

  onMouseLeave() {
    this.hoveredCellIndex.set(null);
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

  onExport(type: 'json' | 'csv' | 'svg'): void {
    this.exportMenuOpen.set(false);
    if (type === 'json') this.exportToJson();
    else if (type === 'csv') this.exportToCsv();
    else if (type === 'svg') this.exportToSvg();
  }

  exportToCsv(): void {
    const cells = this.computedCells();
    if (!cells.length) return;

    let csv = 'Column,Row,Type,Value\n';
    cells.forEach(c => {
      csv += `${c.colIdx},${c.rowIdx},"${c.type}",${c.value}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'point-figure-chart-data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToJson(): void {
    const cells = this.computedCells();
    if (!cells.length) return;

    const data = cells.map(c => ({
      column: c.colIdx,
      row: c.rowIdx,
      type: c.type,
      value: c.value
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'point-figure-chart-data.json');
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
    link.setAttribute('download', 'point-figure-chart.svg');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  formatNumber(v: number): string {
    return fmtNum(v);
  }
}
