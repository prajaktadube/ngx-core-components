import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, HostListener, viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CHART_COLORS, fmtNum } from '../shared/chart-utils';

export interface DependencyItem {
  labels: string[];
  matrix: number[][];
  colors?: string[];
}

interface ProcessedNode {
  index: number;
  label: string;
  color: string;
  startAngle: number;
  endAngle: number;
  value: number;
  path: string;
  textX: number;
  textY: number;
  textAngle: number;
  textAnchor: string;
}

interface ProcessedDependency {
  sourceIndex: number;
  targetIndex: number;
  sourceLabel: string;
  targetLabel: string;
  value: number;
  color: string;
  path: string;
}

@Component({
  selector: 'ngx-dependency-wheel',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-dependency-wheel" (mouseleave)="onMouseLeave()">
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
        class="wheel-svg"
        [attr.width]="'100%'"
        [attr.height]="svgHeight()"
      >
        <g [attr.transform]="'translate(' + (containerWidth() / 2) + ',' + (svgHeight() / 2) + ')'">
          
          <!-- Tapered Dependency Ribbons -->
          @for (dep of computedDependencies(); track dep.path; let i = $index) {
            <path
              [attr.d]="dep.path"
              [attr.fill]="dep.color"
              fill-opacity="0.3"
              [attr.stroke]="dep.color"
              stroke-opacity="0.4"
              stroke-width="0.5"
              class="dependency-ribbon"
              [class.dimmed]="hoveredNodeIndex() !== null && hoveredNodeIndex() !== dep.sourceIndex && hoveredNodeIndex() !== dep.targetIndex"
              [class.highlighted]="hoveredDependencyIndex() === i || (hoveredNodeIndex() !== null && (hoveredNodeIndex() === dep.sourceIndex || hoveredNodeIndex() === dep.targetIndex))"
              (mouseenter)="onDependencyHover(i, $event)"
              (mousemove)="onMouseMove($event)"
            />
          }

          <!-- Outer Circle Nodes -->
          @for (node of computedNodes(); track node.index; let i = $index) {
            <g
              class="wheel-node-group"
              [class.dimmed]="hoveredNodeIndex() !== null && hoveredNodeIndex() !== i"
              [class.highlighted]="hoveredNodeIndex() === i"
              (mouseenter)="onNodeHover(i)"
              (mousemove)="onMouseMove($event)"
            >
              <!-- Arc Segment -->
              <path
                [attr.d]="node.path"
                [attr.fill]="node.color"
                stroke="#ffffff"
                stroke-width="1.5"
                class="node-arc"
              />

              <!-- Label -->
              @if (showLabels()) {
                <text
                  [attr.x]="node.textX"
                  [attr.y]="node.textY"
                  [attr.transform]="'rotate(' + node.textAngle + ',' + node.textX + ',' + node.textY + ')'"
                  [attr.text-anchor]="node.textAnchor"
                  class="node-label"
                >
                  {{ node.label }}
                </text>
              }
            </g>
          }
        </g>
      </svg>

      <!-- Glassmorphic Tooltip -->
      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="tooltipX()" [style.top.px]="tooltipY()">
          @if (t.type === 'node') {
            <div class="tt-cat">{{ t.label }}</div>
            <div class="tt-row">
              <span class="tt-name">Total Weight</span>
              <span class="tt-val">{{ formatNumber(t.value) }}</span>
            </div>
          } @else if (t.type === 'dependency') {
            <div class="tt-cat">Dependency</div>
            <div class="tt-row">
              <span class="tt-name">{{ t.sourceLabel }} depends on</span>
            </div>
            <div class="tt-row">
              <span class="tt-name">{{ t.targetLabel }}</span>
              <span class="tt-val">{{ formatNumber(t.value) }}</span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .ngx-dependency-wheel {
      background: var(--ngx-chart-bg, #ffffff);
      border-radius: 16px;
      padding: 16px;
      box-sizing: border-box;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
      position: relative;
      width: 100%;
    }
    .wheel-svg {
      display: block;
      overflow: visible;
    }
    .node-arc {
      cursor: pointer;
      transition: fill-opacity 0.2s ease, stroke-width 0.2s ease;
      transform-origin: center;
      animation: wheelScaleIn 0.8s cubic-bezier(0.34, 1.3, 0.64, 1) forwards;
    }
    .node-label {
      font-size: 11px;
      fill: var(--ngx-chart-axis-text, #334155);
      font-weight: 600;
      user-select: none;
      pointer-events: none;
    }
    .dependency-ribbon {
      cursor: pointer;
      transition: fill-opacity 0.2s ease, stroke-width 0.2s ease, opacity 0.2s ease;
      transform-origin: center;
      animation: wheelScaleIn 1s cubic-bezier(0.34, 1.3, 0.64, 1) forwards;
    }
    @keyframes wheelScaleIn {
      from { transform: scale(0); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .dependency-ribbon.dimmed, .wheel-node-group.dimmed {
      opacity: 0.15;
    }
    .dependency-ribbon.highlighted {
      fill-opacity: 0.7;
      stroke-width: 1.5;
      stroke-opacity: 0.9;
    }
    .wheel-node-group.highlighted .node-arc {
      stroke-width: 2.5;
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

    /* Export styles */
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
export class DependencyWheelComponent {
  matrix = input<number[][]>([]);
  labels = input<string[]>([]);
  height = input<number>(400);
  showLabels = input<boolean>(true);
  nodePadding = input<number>(0.04);
  colors = input<string[]>(CHART_COLORS);
  showExport = input<boolean>(false);

  containerWidth = signal<number>(500);
  hoveredNodeIndex = signal<number | null>(null);
  hoveredDependencyIndex = signal<number | null>(null);
  tooltip = signal<any | null>(null);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);
  exportMenuOpen = signal(false);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  svgHeight = computed(() => this.height());

  outerRadius = computed(() => Math.min(this.containerWidth(), this.svgHeight()) * 0.4 - 20);
  innerRadius = computed(() => this.outerRadius() - 16);

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

  // Pre-calculate nodes layout
  computedNodes = computed<ProcessedNode[]>(() => {
    const m = this.matrix();
    const l = this.labels();
    const count = m.length;
    if (count === 0) return [];

    const palette = this.colors();
    const rOuter = this.outerRadius();
    const rInner = this.innerRadius();

    // Sum of directed inputs & outputs representing node total dependency scale
    const nodeTotals = m.map((row, i) => {
      let outbound = row.reduce((sum, v) => sum + v, 0);
      let inbound = 0;
      for (let j = 0; j < count; j++) {
        inbound += m[j][i];
      }
      return outbound + inbound;
    });

    const grandTotal = nodeTotals.reduce((sum, v) => sum + v, 0) || 1;
    const padAngle = this.nodePadding();
    const availAngle = 2 * Math.PI - padAngle * count;

    let currentAngle = -Math.PI / 2;

    return nodeTotals.map((val, idx) => {
      const angleSweep = (val / grandTotal) * availAngle;
      const startAngle = currentAngle;
      const endAngle = startAngle + angleSweep;
      currentAngle = endAngle + padAngle;

      const label = l[idx] || `Node ${idx + 1}`;
      const color = palette[idx % palette.length];

      const x1_o = rOuter * Math.cos(startAngle);
      const y1_o = rOuter * Math.sin(startAngle);
      const x2_o = rOuter * Math.cos(endAngle);
      const y2_o = rOuter * Math.sin(endAngle);

      const x1_i = rInner * Math.cos(endAngle);
      const y1_i = rInner * Math.sin(endAngle);
      const x2_i = rInner * Math.cos(startAngle);
      const y2_i = rInner * Math.sin(startAngle);

      const largeArc = angleSweep > Math.PI ? 1 : 0;
      const path = `M ${x1_o} ${y1_o} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2_o} ${y2_o} L ${x1_i} ${y1_i} A ${rInner} ${rInner} 0 ${largeArc} 0 ${x2_i} ${y2_i} Z`;

      const labelAngle = startAngle + angleSweep / 2;
      const textRadius = rOuter + 10;
      const textX = textRadius * Math.cos(labelAngle);
      const textY = textRadius * Math.sin(labelAngle);

      let textAngle = (labelAngle * 180) / Math.PI;
      let textAnchor = 'start';
      if (labelAngle > Math.PI / 2 || labelAngle < -Math.PI / 2) {
        textAngle += 180;
        textAnchor = 'end';
      }

      return {
        index: idx,
        label,
        color,
        startAngle,
        endAngle,
        value: val,
        path,
        textX,
        textY,
        textAngle,
        textAnchor
      };
    });
  });

  // Directed Tapered dependencies ribbon calculations
  computedDependencies = computed<ProcessedDependency[]>(() => {
    const nodes = this.computedNodes();
    const m = this.matrix();
    const l = this.labels();
    const count = m.length;
    if (nodes.length === 0) return [];

    const rInner = this.innerRadius();
    const dependencies: ProcessedDependency[] = [];

    // Track starting offset angles for outbound dependencies of each source node
    const progressNodeStart = nodes.map(n => n.startAngle);
    const progressNodeTotal = m.map(row => row.reduce((sum, v) => sum + v, 0) || 1);
    const progressNodeSweep = nodes.map(n => n.endAngle - n.startAngle);

    for (let i = 0; i < count; i++) {
      for (let j = 0; j < count; j++) {
        if (i === j) continue; // Skip self-dependencies for clean rendering
        const val = m[i][j];
        if (val === 0) continue;

        // Angle sweep width on source node i proportional to dependency value
        const totalOutbound = progressNodeTotal[i];
        // Outbound is allocated on the first half of node's total sweep angle
        const sweep_i = (val / totalOutbound) * (progressNodeSweep[i] * 0.5);
        const a1 = progressNodeStart[i];
        const a2 = a1 + sweep_i;
        progressNodeStart[i] = a2;

        // Target node j center angle (tapers to a point at the center of destination's arc)
        const targetSweep = nodes[j].endAngle - nodes[j].startAngle;
        const targetAngle = nodes[j].startAngle + targetSweep * 0.75; // Align target points in target's second half

        const ax1 = rInner * Math.cos(a1);
        const ay1 = rInner * Math.sin(a1);
        const ax2 = rInner * Math.cos(a2);
        const ay2 = rInner * Math.sin(a2);

        const bx = rInner * Math.cos(targetAngle);
        const by = rInner * Math.sin(targetAngle);

        // SVG Tapered path: Arc at source node, curved path converging at single destination point on the target node
        const path = `M ${ax1} ${ay1} A ${rInner} ${rInner} 0 0 1 ${ax2} ${ay2} Q 0 0 ${bx} ${by} Q 0 0 ${ax1} ${ay1} Z`;

        dependencies.push({
          sourceIndex: i,
          targetIndex: j,
          sourceLabel: l[i] || `Node ${i + 1}`,
          targetLabel: l[j] || `Node ${j + 1}`,
          value: val,
          color: nodes[i].color,
          path
        });
      }
    }

    return dependencies;
  });

  onNodeHover(idx: number) {
    this.hoveredNodeIndex.set(idx);
    const node = this.computedNodes()[idx];
    if (node) {
      this.tooltip.set({
        type: 'node',
        label: node.label,
        value: node.value
      });
    }
  }

  onDependencyHover(idx: number, event: MouseEvent) {
    this.hoveredDependencyIndex.set(idx);
    const dep = this.computedDependencies()[idx];
    if (dep) {
      this.tooltip.set({
        type: 'dependency',
        sourceLabel: dep.sourceLabel,
        targetLabel: dep.targetLabel,
        value: dep.value
      });
    }
  }

  onMouseMove(event: MouseEvent) {
    const el = event.currentTarget as SVGElement;
    const container = el.closest('.ngx-dependency-wheel');
    if (container) {
      const rect = container.getBoundingClientRect();
      this.tooltipX.set(event.clientX - rect.left);
      this.tooltipY.set(event.clientY - rect.top);
    }
  }

  onMouseLeave() {
    this.hoveredNodeIndex.set(null);
    this.hoveredDependencyIndex.set(null);
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
    let csv = 'Source,Target,Flow\n';
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
    link.setAttribute('download', 'dependency-wheel-data.csv');
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
          data.push({ source: labels[r], target: labels[c], flow: matrix[r][c] });
        }
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'dependency-wheel-data.json');
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
    link.setAttribute('download', 'dependency-wheel.svg');
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
        <title>Dependency Wheel Export</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #0f172a; text-align: center; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 24px; text-align: left; }
          .title { font-size: 20px; font-weight: bold; }
          .date { font-size: 12px; color: #64748b; }
          .chart-container { display: inline-block; margin-top: 24px; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; background: #ffffff; width: 90%; }
          svg { width: 100%; height: auto; }
          .node-label { font-size: 11px; fill: #334155; font-weight: 600; }
          @media print {
            body { padding: 0; }
            .chart-container { border: none; padding: 0; width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">Dependency Wheel Analytics</div>
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
