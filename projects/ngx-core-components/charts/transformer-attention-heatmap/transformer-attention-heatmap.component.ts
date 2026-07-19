import {
  Component, input, output, signal, computed, ChangeDetectionStrategy,
  ElementRef, viewChild, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngx-transformer-attention-heatmap',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-attention-wrapper">
      <div class="chart-header" (mousemove)="$event.stopPropagation()">
        <div class="chart-title-space">
          <div class="heatmap-title">{{ title() }}</div>
          <div class="heatmap-subtitle">
            @if (subtitle()) {
              {{ subtitle() }}
            } @else {
              Matrix Size: <span class="highlight-val">{{ tokensY().length }} x {{ tokensX().length }}</span>
            }
          </div>
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

      @if (heads() && heads()!.length > 1) {
        <div class="head-selector">
          @for (head of heads()!; track $index; let i = $index) {
            <button
              class="head-btn"
              [class.active]="activeHeadIndex() === i"
              (click)="activeHeadIndex.set(i)"
            >
              {{ headLabels()[i] || 'Head ' + (i + 1) }}
            </button>
          }
        </div>
      }

      <div class="ngx-attention-container" [style.height.px]="height()">
        <!-- SVG Grid rendering -->
        <svg
          #svgEl
          class="ngx-attention-svg"
          [attr.viewBox]="viewBoxString()"
          [attr.height]="height()"
          tabindex="0"
          (keydown)="onKeyDown($event)"
        >
          <!-- Color Scale Gradient Definition -->
          <defs>
            <linearGradient [attr.id]="gradientId" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" [attr.stop-color]="colors()[0]" />
              <stop offset="100%" [attr.stop-color]="colors()[1]" />
            </linearGradient>
          </defs>
          <!-- Y-axis Label Tokens (Left) -->
          @for (yTok of tokensY(); track $index; let rIdx = $index) {
            <text
              [attr.x]="leftOffset - 12"
              [attr.y]="getRowY(rIdx) + cellHeight() / 2"
              class="token-label y-token-label"
              [class.highlighted]="isRowHighlighted(rIdx)"
              text-anchor="end"
              dominant-baseline="middle"
              (mouseenter)="hoveredRow.set(rIdx)"
              (mouseleave)="clearHover()"
            >
              {{ yTok }}
            </text>
          }

          <!-- X-axis Label Tokens (Top, rotated for readability) -->
          @for (xTok of tokensX(); track $index; let cIdx = $index) {
            <text
              [attr.transform]="'translate(' + (getColX(cIdx) + cellWidth() / 2) + ',' + (topOffset - 12) + ') rotate(-45)'"
              class="token-label x-token-label"
              [class.highlighted]="isColHighlighted(cIdx)"
              text-anchor="start"
              (mouseenter)="hoveredCol.set(cIdx)"
              (mouseleave)="clearHover()"
            >
              {{ xTok }}
            </text>
          }

          <!-- Attention Heatmap Cells -->
          @for (row of activeWeights(); track $index; let rIdx = $index) {
            @for (val of row; track $index; let cIdx = $index) {
              <rect
                [attr.x]="getColX(cIdx)"
                [attr.y]="getRowY(rIdx)"
                [attr.width]="cellWidth() - cellSpacing"
                [attr.height]="cellHeight() - cellSpacing"
                [attr.fill]="getCellColor(val)"
                class="attention-cell"
                [class.fade-dim]="isDimmed(rIdx, cIdx)"
                [class.active-highlight]="hoveredRow() === rIdx && hoveredCol() === cIdx"
                [class.focused-cell]="focusedRow() === rIdx && focusedCol() === cIdx"
                [style.animation-delay]="(rIdx * 0.03 + cIdx * 0.03) + 's'"
                (mouseenter)="onCellEnter(rIdx, cIdx, val, $event)"
                (mouseleave)="clearHover()"
                (click)="onCellClick(rIdx, cIdx, val)"
                rx="3"
                ry="3"
              />
            }
          }

          <!-- Color Scale Legend Bar -->
          <rect
            [attr.x]="legendX()"
            [attr.y]="topOffset"
            [attr.width]="15"
            [attr.height]="legendHeight()"
            [attr.fill]="'url(#' + gradientId + ')'"
            rx="3"
            ry="3"
            class="legend-bar"
          />
          <text
            [attr.x]="legendX() + 7.5"
            [attr.y]="topOffset - 6"
            text-anchor="middle"
            class="legend-label"
          >High</text>
          <text
            [attr.x]="legendX() + 7.5"
            [attr.y]="topOffset + legendHeight() + 14"
            text-anchor="middle"
            class="legend-label"
          >Low</text>
        </svg>

        <!-- Dynamic Tooltip -->
        @if (tooltip().show) {
          <div
            class="attention-tooltip"
            [style.left.px]="tooltip().x"
            [style.top.px]="tooltip().y"
          >
            <div class="tt-cat">{{ tooltip().title }}</div>
            <div class="tt-row">
              <span class="tt-dot" [style.background]="colors()[1]"></span>
              <span class="tt-name">Attention Weight</span>
              <span class="tt-val">{{ tooltip().value }}</span>
            </div>
            <div class="tt-row action-row">
              <button class="tt-action-btn" (click)="onQueryAttention(tooltip().row, tooltip().col)">
                Analyze Attention Link
              </button>
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
    .ngx-attention-wrapper {
      width: 100%;
      height: 100%;
      padding: 16px 20px;
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 12px;
      box-shadow: var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05));
      position: relative;
    }
    .ngx-attention-container {
      position: relative;
      width: 100%;
      height: 100%;
    }
    .ngx-attention-svg {
      width: 100%;
      height: 100%;
      overflow: visible;
    }
    .token-label {
      font-size: 10px;
      font-weight: 600;
      fill: var(--text-secondary, #64748b);
      font-family: inherit;
      cursor: pointer;
      transition: fill 0.15s, font-weight 0.15s;
    }
    .token-label.highlighted, .token-label:hover {
      fill: #4f46e5;
      font-weight: 700;
    }

    @keyframes cellFade {
      from { opacity: 0; transform: scale(0.92); }
      to { opacity: 1; transform: scale(1); }
    }

    .attention-cell {
      cursor: pointer;
      stroke: transparent;
      stroke-width: 1px;
      transform-origin: center;
      animation: cellFade 0.4s ease-out both;
      transition: opacity 0.2s, filter 0.2s, stroke 0.15s;
    }
    .attention-cell:hover, .attention-cell.active-highlight {
      filter: brightness(1.15) drop-shadow(0 3px 6px rgba(236, 72, 153, 0.25));
      stroke: #ec4899;
      stroke-width: 1.5px;
      opacity: 1 !important;
    }
    .attention-cell.fade-dim {
      opacity: 0.25;
    }
    .attention-cell.focused-cell {
      stroke: #facc15;
      stroke-width: 2.5px;
      filter: brightness(1.1) drop-shadow(0 0 6px rgba(250, 204, 21, 0.6));
      opacity: 1 !important;
    }

    /* Legend bar */
    .legend-bar {
      stroke: var(--border-color, #e2e8f0);
      stroke-width: 1px;
    }
    .legend-label {
      font-size: 9px;
      fill: var(--text-secondary, #64748b);
      font-family: inherit;
      font-weight: 600;
    }

    /* Head selector */
    .head-selector {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 10px;
    }
    .head-btn {
      padding: 4px 12px;
      font-size: 11px;
      font-weight: 600;
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 999px;
      background: var(--bg-secondary, #ffffff);
      color: var(--text-secondary, #64748b);
      cursor: pointer;
      transition: all 0.15s;
    }
    .head-btn:hover {
      border-color: #6366f1;
      color: #4f46e5;
    }
    .head-btn.active {
      background: #4f46e5;
      color: #ffffff;
      border-color: #4f46e5;
    }

    /* SVG focus outline */
    .ngx-attention-svg:focus {
      outline: 2px solid #6366f1;
      outline-offset: 2px;
      border-radius: 4px;
    }

    /* Glassmorphic Tooltip styling */
    .attention-tooltip {
      position: absolute;
      z-index: 100;
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
      min-width: 160px;
      pointer-events: auto;
    }
    .tt-cat {
      font-weight: 700;
      margin-bottom: 6px;
      font-size: 11px;
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
    .action-row {
      margin-top: 8px;
      border-top: 1px dashed rgba(255, 255, 255, 0.15);
      padding-top: 6px;
      justify-content: center;
    }
    .tt-action-btn {
      background: #4f46e5;
      color: #ffffff;
      border: none;
      border-radius: 4px;
      padding: 4px 8px;
      font-size: 10px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.15s;
      width: 100%;
    }
    .tt-action-btn:hover {
      background: #6366f1;
    }

    /* Header and titles */
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .heatmap-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-primary, #1e293b);
    }
    .heatmap-subtitle {
      font-size: 11px;
      color: var(--text-secondary, #64748b);
      margin-top: 2px;
    }
    .highlight-val {
      font-weight: 700;
      color: #6366f1;
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
export class TransformerAttentionHeatmapComponent {
  private static instanceCounter = 0;
  private instanceId = ++TransformerAttentionHeatmapComponent.instanceCounter;

  tokensX = input.required<string[]>();
  tokensY = input.required<string[]>();
  weights = input.required<number[][]>();
  height = input<number>(350);
  colors = input<string[]>(['#f1f5f9', '#ec4899']); // Pink attention weights scale
  showExport = input<boolean>(true);
  title = input<string>('Transformer Attention Heatmap');
  subtitle = input<string>('');

  // Multi-head attention inputs
  heads = input<number[][][] | null>(null);
  headLabels = input<string[]>([]);

  cellClick = output<{ row: number; col: number; weight: number }>();
  agentQueryRequest = output<{ query: string; tokenY: string; tokenX: string; weight: number }>();

  // Multi-head state
  activeHeadIndex = signal<number>(0);

  // Active weights: use selected head when heads() is set, otherwise fall back to weights()
  activeWeights = computed(() => {
    const h = this.heads();
    if (h && h.length > 0) {
      const idx = Math.min(this.activeHeadIndex(), h.length - 1);
      return h[idx];
    }
    return this.weights();
  });

  // Hover states for bi-directional highlighting
  hoveredRow = signal<number | null>(null);
  hoveredCol = signal<number | null>(null);

  // Keyboard navigation focus
  focusedRow = signal<number | null>(null);
  focusedCol = signal<number | null>(null);
  
  tooltip = signal<{ show: boolean; row: number; col: number; title: string; value: string; x: number; y: number }>({
    show: false,
    row: -1,
    col: -1,
    title: '',
    value: '',
    x: 0,
    y: 0
  });
  exportMenuOpen = signal(false);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  // Unique gradient ID for this instance
  gradientId = `attn-gradient-${this.instanceId}`;

  // Dimensions
  leftOffset = 80;
  topOffset = 70;
  rightOffset = 50; // space for legend bar
  cellSpacing = 2.5;

  cellWidth = computed(() => {
    const cols = this.tokensX().length || 1;
    const availableWidth = Math.max(200, this.height() * 1.45 - this.leftOffset - this.rightOffset);
    return Math.max(16, availableWidth / cols);
  });

  cellHeight = computed(() => {
    const rows = this.tokensY().length || 1;
    const availableHeight = this.height() - this.topOffset - 20;
    return Math.max(16, availableHeight / rows);
  });

  // Legend position and size
  legendX = computed(() => {
    const cols = this.tokensX().length || 1;
    return this.leftOffset + cols * this.cellWidth() + 16;
  });

  legendHeight = computed(() => {
    const rows = this.tokensY().length || 1;
    return rows * this.cellHeight();
  });

  viewBoxString = computed(() => {
    const cols = this.tokensX().length || 1;
    const rows = this.tokensY().length || 1;
    const width = this.leftOffset + cols * this.cellWidth() + this.rightOffset;
    const height = this.topOffset + rows * this.cellHeight() + 20;
    return `0 0 ${width} ${height}`;
  });

  getColX(colIdx: number): number {
    return this.leftOffset + colIdx * this.cellWidth();
  }

  getRowY(rowIdx: number): number {
    return this.topOffset + rowIdx * this.cellHeight();
  }

  getCellColor(val: number): string {
    // Interpolates from colors[0] (low attention) to colors[1] (high attention)
    return this.interpolateColor(this.colors()[0], this.colors()[1], val);
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

  // Row and Column Bi-directional highlighting logic
  isRowHighlighted(rIdx: number): boolean {
    return this.hoveredRow() === rIdx;
  }

  isColHighlighted(cIdx: number): boolean {
    return this.hoveredCol() === cIdx;
  }

  isDimmed(rIdx: number, cIdx: number): boolean {
    const hr = this.hoveredRow();
    const hc = this.hoveredCol();
    const fr = this.focusedRow();
    const fc = this.focusedCol();

    // If both hover and focus are inactive, no dimming
    if (hr === null && hc === null && fr === null && fc === null) return false;

    // Hover takes priority for dimming
    if (hr !== null || hc !== null) {
      if (hr !== null && hc !== null) {
        return hr !== rIdx || hc !== cIdx;
      }
      if (hr !== null) return hr !== rIdx;
      if (hc !== null) return hc !== cIdx;
    }

    // Keyboard focus dimming
    if (fr !== null && fc !== null) {
      return fr !== rIdx || fc !== cIdx;
    }
    return false;
  }

  onCellEnter(rIdx: number, cIdx: number, val: number, event: MouseEvent): void {
    this.hoveredRow.set(rIdx);
    this.hoveredCol.set(cIdx);

    const xLabel = this.tokensX()[cIdx] || '';
    const yLabel = this.tokensY()[rIdx] || '';
    const title = `"${yLabel}" ➔ "${xLabel}"`;

    const rect = (event.currentTarget as SVGRectElement).getBoundingClientRect();
    const parentRect = (event.currentTarget as SVGRectElement).ownerSVGElement!.parentElement!.getBoundingClientRect();
    
    const x = rect.left - parentRect.left + rect.width / 2;
    const y = rect.top - parentRect.top;

    this.tooltip.set({
      show: true,
      row: rIdx,
      col: cIdx,
      title,
      value: `${(val * 100).toFixed(1)}%`,
      x,
      y
    });
  }

  clearHover(): void {
    this.hoveredRow.set(null);
    this.hoveredCol.set(null);
    this.tooltip.update(t => ({ ...t, show: false }));
  }

  onCellClick(rIdx: number, cIdx: number, val: number): void {
    this.cellClick.emit({ row: rIdx, col: cIdx, weight: val });
  }

  onQueryAttention(row: number, col: number): void {
    const tokenY = this.tokensY()[row];
    const tokenX = this.tokensX()[col];
    const val = this.activeWeights()[row]?.[col] ?? 0;
    this.agentQueryRequest.emit({
      query: `Analyze transformer attention relationship between Y token "${tokenY}" and X token "${tokenX}" with score ${(val * 100).toFixed(1)}%.`,
      tokenY,
      tokenX,
      weight: val
    });
  }

  // Keyboard navigation
  onKeyDown(event: KeyboardEvent): void {
    const rows = this.tokensY().length;
    const cols = this.tokensX().length;
    if (rows === 0 || cols === 0) return;

    let fr = this.focusedRow();
    let fc = this.focusedCol();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (fr === null || fc === null) { this.focusedRow.set(0); this.focusedCol.set(0); }
        else { this.focusedRow.set(Math.min(fr + 1, rows - 1)); }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (fr === null || fc === null) { this.focusedRow.set(0); this.focusedCol.set(0); }
        else { this.focusedRow.set(Math.max(fr - 1, 0)); }
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (fr === null || fc === null) { this.focusedRow.set(0); this.focusedCol.set(0); }
        else { this.focusedCol.set(Math.min(fc + 1, cols - 1)); }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (fr === null || fc === null) { this.focusedRow.set(0); this.focusedCol.set(0); }
        else { this.focusedCol.set(Math.max(fc - 1, 0)); }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        fr = this.focusedRow();
        fc = this.focusedCol();
        if (fr !== null && fc !== null) {
          const w = this.activeWeights();
          const val = w[fr]?.[fc] ?? 0;
          this.cellClick.emit({ row: fr, col: fc, weight: val });
        }
        break;
      case 'Escape':
        this.focusedRow.set(null);
        this.focusedCol.set(null);
        break;
      default:
        return; // don't prevent default for other keys
    }
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
    const payload = {
      tokensX: this.tokensX(),
      tokensY: this.tokensY(),
      weights: this.activeWeights()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'attention-heatmap-data.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToCsv(): void {
    const xTok = this.tokensX();
    const yTok = this.tokensY();
    const matrix = this.activeWeights();
    let csv = 'Y_Token,X_Token,Weight\n';
    matrix.forEach((row, rIdx) => {
      row.forEach((val, cIdx) => {
        csv += `"${yTok[rIdx]}","${xTok[cIdx]}",${val}\n`;
      });
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'attention-heatmap-data.csv');
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
    link.setAttribute('download', 'attention-heatmap.svg');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToPdf(): void {
    const svg = this.svgEl()?.nativeElement;
    if (!svg) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const svgString = new XMLSerializer().serializeToString(svg);
    printWindow.document.write(`
      <html>
        <head>
          <title>Export PDF</title>
          <style>
            body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background: white; }
            svg { width: 100%; height: auto; }
          </style>
        </head>
        <body>
          ${svgString}
          <script>
            window.onload = () => { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}
