import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, viewChild, HostListener
} from '@angular/core';
import { ChartExportService } from '../shared/chart-export.service';
import { ChartExportMenuComponent } from '../shared/chart-export-menu.component';
import type { ExportFormat } from '../shared/chart-export-menu.component';
import { CHART_COLORS, fmtNum } from '../shared/chart-utils';

export interface SankeyNode {
  id: string;
  label: string;
  color?: string;
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

interface ProcessedNode {
  id: string;
  label: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  value: number;
  column: number;
  inSum: number;
  outSum: number;
}

interface ProcessedLink {
  sourceId: string;
  targetId: string;
  value: number;
  path: string;
  color: string;
  thickness: number;
  sourceNode: ProcessedNode;
  targetNode: ProcessedNode;
}

@Component({
  selector: 'ngx-sankey-chart',
  standalone: true,
  imports: [ChartExportMenuComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-sankey-chart" (mouseleave)="onMouseLeave()">
      <div class="chart-header" (mousemove)="$event.stopPropagation()" (mouseleave)="onMouseLeave()">
        <div class="chart-title-space"></div>
        @if (showExport()) {
          <ngx-chart-export-menu (exportClicked)="onExport($event)" />
        }
      </div>

      <svg
        #svgEl
        class="sankey-svg"
        [attr.width]="'100%'"
        [attr.height]="svgHeight()"
      >
        <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
          
          <!-- Links (Rendered first so they sit behind nodes) -->
          @for (link of computedData().links; track link.sourceId + '-' + link.targetId; let i = $index) {
            <path
              [attr.d]="link.path"
              [attr.stroke]="link.color"
              [attr.stroke-width]="link.thickness"
              fill="none"
              class="sankey-link"
              [class.highlighted]="isLinkHighlighted(link)"
              [class.dimmed]="hoveredNodeId() !== null || (hoveredLinkId() !== null && hoveredLinkId() !== i)"
              (mousemove)="onLinkMouseMove($event)"
              (mouseenter)="onLinkHover(i, $event)"
            />
          }

          <!-- Nodes -->
          @for (node of computedData().nodes; track node.id) {
            <g
              class="sankey-node-group"
              [class.dimmed]="isNodeDimmed(node)"
              (mouseenter)="onNodeHover(node.id)"
            >
              <!-- Node Bar -->
              <rect
                [attr.x]="node.x"
                [attr.y]="node.y"
                [attr.width]="node.width"
                [attr.height]="node.height"
                [attr.fill]="node.color"
                rx="3"
                class="sankey-node"
              />

              <!-- Labels -->
              @if (showLabels() && node.height > 10) {
                <text
                  [attr.x]="node.column === 0 ? node.x - 8 : node.x + node.width + 8"
                  [attr.y]="node.y + node.height / 2"
                  [attr.text-anchor]="node.column === 0 ? 'end' : 'start'"
                  dominant-baseline="middle"
                  class="node-label"
                >
                  {{ node.label }} 
                  @if (showValues()) {
                    <tspan class="node-val">({{ formatNumber(node.value) }})</tspan>
                  }
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
              <span class="tt-dot" [style.background]="t.color"></span>
              <span class="tt-name">Total Flow</span>
              <span class="tt-val">{{ formatNumber(t.value) }}</span>
            </div>
            @if (t.inSum > 0) {
              <div class="tt-row">
                <span class="tt-name">Incoming</span>
                <span class="tt-val">{{ formatNumber(t.inSum) }}</span>
              </div>
            }
            @if (t.outSum > 0) {
              <div class="tt-row">
                <span class="tt-name">Outgoing</span>
                <span class="tt-val">{{ formatNumber(t.outSum) }}</span>
              </div>
            }
          } @else if (t.type === 'link') {
            <div class="tt-cat">Flow Connection</div>
            <div class="tt-row">
              <span class="tt-name">Source</span>
              <span class="tt-val">{{ t.sourceLabel }}</span>
            </div>
            <div class="tt-row">
              <span class="tt-name">Target</span>
              <span class="tt-val">{{ t.targetLabel }}</span>
            </div>
            <div class="tt-row delta-row">
              <span class="tt-dot" [style.background]="t.color"></span>
              <span class="tt-name">Flow Value</span>
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
    .ngx-sankey-chart {
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
      min-height: 24px;
      position: relative;
      margin-bottom: 12px;
    }
    .sankey-svg {
      display: block;
      overflow: visible;
    }
    .sankey-node {
      stroke: var(--ngx-chart-bg, #ffffff);
      stroke-width: 1.5;
      cursor: pointer;
    }
    .node-label {
      font-size: 11px;
      font-weight: 700;
      fill: var(--ngx-chart-axis-text, #1e293b);
      user-select: none;
      pointer-events: none;
    }
    .node-val {
      font-weight: 500;
      fill: #64748b;
    }
    .sankey-link {
      opacity: 0.35;
      transition: opacity 0.25s ease;
      cursor: pointer;
    }
    .sankey-link:hover, .sankey-link.highlighted {
      opacity: 0.85 !important;
    }
    .sankey-link.dimmed {
      opacity: 0.1;
    }
    .sankey-node-group {
      transition: opacity 0.25s ease;
    }
    .sankey-node-group.dimmed {
      opacity: 0.3;
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
    .delta-row {
      border-top: 1px dashed rgba(255, 255, 255, 0.15);
      margin-top: 6px;
      padding-top: 6px;
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


  `]
})
export class SankeyChartComponent {
  private readonly exportSvc = inject(ChartExportService);
  nodes = input<SankeyNode[]>([]);
  links = input<SankeyLink[]>([]);
  height = input<number>(400);
  showLabels = input<boolean>(true);
  showValues = input<boolean>(true);
  colors = input<string[]>(CHART_COLORS);
  nodePadding = input<number>(16);
  nodeWidth = input<number>(20);
  showExport = input<boolean>(false);

  containerWidth = signal<number>(500);
  hoveredNodeId = signal<string | null>(null);
  hoveredLinkId = signal<number | null>(null);
  tooltip = signal<any | null>(null);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);


  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  margin = computed(() => ({
    top: 20,
    right: this.showLabels() ? 80 : 20,
    bottom: 20,
    left: this.showLabels() ? 80 : 20
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

  // Sankey layout compiler
  computedData = computed(() => {
    const rawNodes = this.nodes();
    const rawLinks = this.links();
    const w = this.innerW();
    const h = this.innerH();
    const padding = this.nodePadding();
    const nodeW = this.nodeWidth();
    const palette = this.colors();

    if (rawNodes.length === 0) {
      return { nodes: [], links: [] };
    }

    // Initialize processed nodes list
    const processedNodes: ProcessedNode[] = rawNodes.map((n, idx) => ({
      id: n.id,
      label: n.label,
      color: n.color || palette[idx % palette.length],
      x: 0,
      y: 0,
      width: nodeW,
      height: 0,
      value: 0,
      column: 0,
      inSum: 0,
      outSum: 0
    }));

    const nodeMap = new Map<string, ProcessedNode>();
    processedNodes.forEach(n => nodeMap.set(n.id, n));

    // Calculate node incoming and outgoing flow sums
    rawLinks.forEach(l => {
      const src = nodeMap.get(l.source);
      const tgt = nodeMap.get(l.target);
      if (src && tgt) {
        src.outSum += l.value;
        tgt.inSum += l.value;
      }
    });

    processedNodes.forEach(n => {
      n.value = Math.max(n.inSum, n.outSum);
    });

    // 1. Assign columns (topological layering)
    // Find node connections
    const incoming = new Map<string, string[]>();
    rawLinks.forEach(l => {
      if (!incoming.has(l.target)) {
        incoming.set(l.target, []);
      }
      incoming.get(l.target)!.push(l.source);
    });

    // Queue-based column assignment (simplistic relaxation)
    let maxCol = 0;
    const computedColumns = new Map<string, number>();

    // Start with root nodes (no incoming)
    processedNodes.forEach(n => {
      if ((incoming.get(n.id)?.length || 0) === 0) {
        computedColumns.set(n.id, 0);
      }
    });

    // Relax column level for other nodes
    let relaxed = true;
    let iterations = 0;
    while (relaxed && iterations < 10) {
      relaxed = false;
      iterations++;
      rawLinks.forEach(l => {
        const srcCol = computedColumns.get(l.source) ?? 0;
        const tgtCol = computedColumns.get(l.target);
        if (tgtCol === undefined || tgtCol <= srcCol) {
          computedColumns.set(l.target, srcCol + 1);
          maxCol = Math.max(maxCol, srcCol + 1);
          relaxed = true;
        }
      });
    }

    processedNodes.forEach(n => {
      n.column = computedColumns.get(n.id) ?? 0;
    });

    // Group nodes by column
    const columns: ProcessedNode[][] = [];
    for (let c = 0; c <= maxCol; c++) {
      columns.push([]);
    }
    processedNodes.forEach(n => {
      if (columns[n.column]) {
        columns[n.column].push(n);
      } else {
        // Fallback to column 0 if index overflow
        columns[0].push(n);
        n.column = 0;
      }
    });

    const numCols = columns.length;
    const colSpacing = numCols > 1 ? (w - nodeW) / (numCols - 1) : 0;

    // 2. Calculate vertical scaling (kY)
    let maxColumnSum = 0;
    columns.forEach(colNodes => {
      const sum = colNodes.reduce((acc, curr) => acc + curr.value, 0);
      maxColumnSum = Math.max(maxColumnSum, sum);
    });

    // Avoid division by zero
    const flowSum = maxColumnSum || 1;
    // Calculate scaling factor kY
    let minPadding = padding;
    let kY = (h - (columns[0].length - 1) * minPadding) / flowSum;

    // Adjust kY to make sure padding fits in all columns
    columns.forEach(colNodes => {
      const colPaddingSum = (colNodes.length - 1) * padding;
      const currentKY = (h - colPaddingSum) / (colNodes.reduce((acc, curr) => acc + curr.value, 0) || 1);
      if (currentKY < kY) {
        kY = currentKY;
      }
    });

    if (kY < 0.1) kY = 0.1; // Floor boundary protection

    // 3. Position nodes
    columns.forEach((colNodes, colIdx) => {
      const x = colIdx * colSpacing;
      const totalColVal = colNodes.reduce((acc, curr) => acc + curr.value, 0);
      const totalHeight = totalColVal * kY + (colNodes.length - 1) * padding;
      
      // Center the column vertically
      let currentY = (h - totalHeight) / 2;

      colNodes.forEach(n => {
        n.x = x;
        n.y = currentY;
        n.height = Math.max(4, n.value * kY); // Guarantee a minimum 4px height
        currentY += n.height + padding;
      });
    });

    // 4. Position and shape Links
    // Track current vertical offset for stacking links at source & target nodes
    const sourceLinkOffset = new Map<string, number>();
    const targetLinkOffset = new Map<string, number>();

    const processedLinks: ProcessedLink[] = [];

    rawLinks.forEach((link, idx) => {
      const sNode = nodeMap.get(link.source);
      const tNode = nodeMap.get(link.target);

      if (sNode && tNode) {
        const thickness = Math.max(1, link.value * kY);
        
        // Get or initialize link offsets on the nodes
        const sOffset = sourceLinkOffset.get(sNode.id) ?? 0;
        const tOffset = targetLinkOffset.get(tNode.id) ?? 0;

        // Calculate link endpoints
        const x0 = sNode.x + sNode.width;
        const y0 = sNode.y + sOffset + thickness / 2;

        const x1 = tNode.x;
        const y1 = tNode.y + tOffset + thickness / 2;

        // Curved Bézier path generator
        const controlPtX = (x0 + x1) / 2;
        const path = `M ${x0} ${y0} C ${controlPtX} ${y0}, ${controlPtX} ${y1}, ${x1} ${y1}`;

        // Save offsets for subsequent links
        sourceLinkOffset.set(sNode.id, sOffset + link.value * kY);
        targetLinkOffset.set(tNode.id, tOffset + link.value * kY);

        processedLinks.push({
          sourceId: link.source,
          targetId: link.target,
          value: link.value,
          path,
          color: sNode.color, // Link color inherits source node's theme
          thickness,
          sourceNode: sNode,
          targetNode: tNode
        });
      }
    });

    return {
      nodes: processedNodes,
      links: processedLinks
    };
  });

  isLinkHighlighted(link: ProcessedLink): boolean {
    const hoveredNId = this.hoveredNodeId();
    if (hoveredNId !== null) {
      return link.sourceId === hoveredNId || link.targetId === hoveredNId;
    }
    return false;
  }

  isNodeDimmed(node: ProcessedNode): boolean {
    const hoveredNId = this.hoveredNodeId();
    if (hoveredNId !== null) {
      if (hoveredNId === node.id) return false;
      // Check if node is connected to the hovered node via links
      const links = this.computedData().links;
      const isConnected = links.some(l => 
        (l.sourceId === hoveredNId && l.targetId === node.id) ||
        (l.targetId === hoveredNId && l.sourceId === node.id)
      );
      return !isConnected;
    }

    const hoveredLId = this.hoveredLinkId();
    if (hoveredLId !== null) {
      const activeLink = this.computedData().links[hoveredLId];
      if (activeLink) {
        return node.id !== activeLink.sourceId && node.id !== activeLink.targetId;
      }
    }

    return false;
  }

  onNodeHover(nodeId: string) {
    this.hoveredNodeId.set(nodeId);
    const node = this.computedData().nodes.find(n => n.id === nodeId);
    if (node) {
      this.tooltip.set({
        type: 'node',
        label: node.label,
        value: node.value,
        inSum: node.inSum,
        outSum: node.outSum,
        color: node.color
      });
    }
  }

  onLinkHover(idx: number, event: MouseEvent) {
    this.hoveredLinkId.set(idx);
    const link = this.computedData().links[idx];
    if (link) {
      this.tooltip.set({
        type: 'link',
        sourceLabel: link.sourceNode.label,
        targetLabel: link.targetNode.label,
        value: link.value,
        color: link.color
      });
    }
  }

  onLinkMouseMove(event: MouseEvent) {
    const el = event.currentTarget as SVGElement;
    const container = el.closest('.ngx-sankey-chart');
    if (container) {
      const rect = container.getBoundingClientRect();
      this.tooltipX.set(event.clientX - rect.left);
      this.tooltipY.set(event.clientY - rect.top);
    }
  }

  onMouseLeave() {
    this.hoveredNodeId.set(null);
    this.hoveredLinkId.set(null);
    this.tooltip.set(null);
  }

  onExport(type: ExportFormat): void {
    if (type === 'json') this.exportToJson();
    else if (type === 'csv') this.exportToCsv();
    else if (type === 'svg') this.exportToSvg();
    else if (type === 'pdf') this.exportToPdf();
  }

  exportToJson(): void {
    const data = { nodes: this.nodes(), links: this.links() };
    this.exportSvc.downloadJson(data, 'sankey-chart-data.json');
  }

  exportToCsv(): void {
    const links = this.links();
    if (!links.length) return;
    const headers = ['Source', 'Target', 'Value'];
    const rows = links.map(l => [l.source, l.target, l.value]);
    this.exportSvc.downloadCsv(headers, rows, 'sankey-chart-data.csv');
  }

  exportToSvg(): void {
    this.exportSvc.downloadSvg(this.svgEl()?.nativeElement, 'chart.svg');
  }

  exportToPdf(): void {
    this.exportSvc.downloadPdf(this.svgEl()?.nativeElement, 'Chart Export', 'chart.pdf');
  }

  formatNumber(v: number): string {
    return fmtNum(v);
  }
}
