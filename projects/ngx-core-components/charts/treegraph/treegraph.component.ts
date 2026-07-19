import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, viewChild, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CHART_COLORS, fmtNum } from '../shared/chart-utils';

export interface TreeGraphNode {
  id: string;
  label: string;
  parentId?: string; // Undefined for root node
  value?: number;    // Optional node value/size
  color?: string;
}

interface ProcessedNode {
  id: string;
  label: string;
  parentId?: string;
  value: number;
  depth: number;
  x: number;
  y: number;
  color: string;
  children: ProcessedNode[];
}

interface TreeLink {
  parentId: string;
  childId: string;
  path: string;
}

@Component({
  selector: 'ngx-treegraph',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-treegraph">
      <!-- Toolbar with Export option -->
      <div class="chart-header" (mousemove)="$event.stopPropagation()" (mouseleave)="tooltip.set(null)">
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

      <div class="chart-body">
        <svg
          #svgEl
          class="chart-svg"
          [attr.viewBox]="'0 0 ' + width() + ' ' + height()"
          [attr.width]="width()"
          [attr.height]="height()"
        >
          <!-- Tree Links (Bezier Curves) -->
          @for (link of computedLinks(); track link.parentId + '-' + link.childId) {
            <path
              [attr.d]="link.path"
              fill="none"
              stroke="var(--ngx-chart-grid, #cbd5e1)"
              stroke-width="2"
              class="link-line"
              [class.highlighted]="hoveredNodeId() === link.parentId || hoveredNodeId() === link.childId"
            />
          }

          <!-- Tree Nodes -->
          @for (node of computedNodes(); track node.id) {
            <g
              class="node-group"
              [class.hovered]="hoveredNodeId() === node.id"
              [style.transform]="'translate(' + node.x + 'px,' + node.y + 'px)'"
              (mouseenter)="hoveredNodeId.set(node.id); onNodeHover($event, node)"
              (mouseleave)="hoveredNodeId.set(null); tooltip.set(null)"
            >
              <circle
                r="7"
                [attr.fill]="node.color"
                [attr.stroke]="hoveredNodeId() === node.id ? 'var(--primary-color, #4f46e5)' : '#ffffff'"
                stroke-width="2"
                class="node-circle"
              />
              <text
                [attr.x]="node.children.length === 0 ? 10 : -10"
                [attr.y]="4"
                [attr.text-anchor]="node.children.length === 0 ? 'start' : 'end'"
                class="node-label"
              >
                {{ node.label }}
              </text>
            </g>
          }
        </svg>
      </div>

      <!-- Premium Glassmorphic Tooltip -->
      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
          <span class="tt-dot" [style.background]="t.color"></span>
          <div class="tt-content">
            <strong>{{ t.label }}</strong>
            <div class="tt-sub">Depth: Level {{ t.depth }}</div>
            @if (t.value > 0) {
              <div class="tt-val">Value: {{ fmtNum(t.value) }}</div>
            }
            <div class="tt-sub">Children: {{ t.childrenCount }}</div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: relative;
    }
    .ngx-treegraph {
      position: relative;
      background: var(--ngx-chart-bg, #fff);
      font-family: inherit;
      overflow: hidden;
      padding: 16px;
      border-radius: 16px;
    }
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      min-height: 24px;
      position: relative;
      margin-bottom: 8px;
    }
    .chart-body {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .chart-svg {
      display: block;
      max-width: 100%;
      height: auto;
      min-width: 0;
    }
    .link-line {
      transition: stroke 0.25s, stroke-width 0.25s;
    }
    .link-line.highlighted {
      stroke: var(--primary-color, #4f46e5);
      stroke-width: 3px;
    }
    .node-group {
      cursor: pointer;
      transition: transform 0.2s ease-out;
    }
    .node-circle {
      transition: stroke 0.15s, stroke-width 0.15s, r 0.15s;
    }
    .node-group:hover .node-circle {
      r: 9;
      filter: drop-shadow(0 4px 6px rgba(0,0,0,0.15));
    }
    .node-label {
      fill: var(--ngx-chart-text, #1e293b);
      font-size: 11px;
      font-weight: 600;
      pointer-events: none;
      user-select: none;
    }

    /* Premium Glassmorphic Tooltip */
    .chart-tooltip {
      position: absolute; pointer-events: none; transform: translate(-50%, -100%) translateY(-8px);
      background: var(--ngx-chart-tooltip-bg, rgba(15, 23, 42, 0.92));
      backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      color: var(--ngx-chart-tooltip-color, #f8fafc); padding: 10px 14px;
      border-radius: 10px; font-size: 12px; min-width: 145px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      z-index: 100;
      display: flex; align-items: flex-start; gap: 8px;
      transition: left 0.12s cubic-bezier(0.16, 1, 0.3, 1), top 0.12s cubic-bezier(0.16, 1, 0.3, 1);
      font-family: inherit;
    }
    .tt-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 4px; }
    .tt-content { display: flex; flex-direction: column; gap: 2px; }
    .tt-sub { font-size: 10px; color: rgba(248, 250, 252, 0.7); }
    .tt-val { font-weight: 700; }

    /* Export styles */
    .chart-export-menu {
      position: absolute;
      top: 0;
      right: 0;
      z-index: 50;
    }
    .export-trigger {
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 600;
      color: var(--ngx-chart-axis-text, #6c757d);
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(8px);
      border: 1px solid var(--ngx-chart-grid, #ebedf0);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .export-trigger:hover {
      background: #fff;
      color: var(--primary-color, #4f46e5);
      border-color: var(--primary-color, #4f46e5);
    }
    .export-dropdown {
      position: absolute;
      right: 0;
      top: calc(100% + 4px);
      background: #fff;
      border: 1px solid var(--ngx-chart-grid, #ebedf0);
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.08);
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
      color: #343a40;
      border-radius: 4px;
      font-family: inherit;
      width: 100%;
      transition: all 0.12s;
    }
    .export-dropdown button:hover {
      background: rgba(79, 70, 229, 0.06);
      color: var(--primary-color, #4f46e5);
    }
  `]
})
export class TreeGraphComponent {
  data = input<TreeGraphNode[]>([]);
  height = input<number>(300);
  width = input<number>(500);
  colors = input<string[]>(CHART_COLORS);
  showLabels = input<boolean>(true);
  showExport = input<boolean>(false);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  exportMenuOpen = signal(false);
  hoveredNodeId = signal<string | null>(null);
  tooltip = signal<any | null>(null);

  // Computes the node structure recursively and maps coordinate layouts
  computedTree = computed<{ nodes: ProcessedNode[]; root: ProcessedNode | null }>(() => {
    const rawData = this.data();
    if (!rawData.length) return { nodes: [], root: null };

    // 1. Build basic structure
    const nodeMap = new Map<string, ProcessedNode>();
    rawData.forEach(item => {
      nodeMap.set(item.id, {
        id: item.id,
        label: item.label,
        parentId: item.parentId,
        value: item.value || 0,
        depth: 0,
        x: 0,
        y: 0,
        color: item.color || '',
        children: []
      });
    });

    let root: ProcessedNode | null = null;

    // Link parents to children and identify root
    nodeMap.forEach(node => {
      if (node.parentId && nodeMap.has(node.parentId)) {
        nodeMap.get(node.parentId)!.children.push(node);
      } else {
        // Assume first node with no valid parent is root
        if (!root) root = node;
      }
    });

    if (!root && nodeMap.size > 0) {
      root = nodeMap.values().next().value || null;
    }

    if (!root) return { nodes: [], root: null };

    // Assign depths recursively
    const setDepth = (node: ProcessedNode, depth: number) => {
      node.depth = depth;
      node.children.forEach(c => setDepth(c, depth + 1));
    };
    setDepth(root, 0);

    // Get max depth in the tree
    let maxDepth = 0;
    const allNodes: ProcessedNode[] = [];
    nodeMap.forEach(n => {
      allNodes.push(n);
      if (n.depth > maxDepth) maxDepth = n.depth;
    });

    // 2. Compute Layout (Horizontal Balanced Layout)
    // Sibling layout vertical coordinates: We assign coordinates to leaf nodes first,
    // and parent coordinate is the average of its children.
    const leftMargin = 70;
    const rightMargin = 70;
    const topMargin = 25;
    const bottomMargin = 25;

    const printableW = this.width() - leftMargin - rightMargin;
    const levelWidth = maxDepth > 0 ? printableW / maxDepth : printableW;

    let leafIndex = 0;
    const leaves: ProcessedNode[] = [];
    
    // Count leaves recursively
    const findLeaves = (node: ProcessedNode) => {
      if (node.children.length === 0) {
        leaves.push(node);
      } else {
        node.children.forEach(findLeaves);
      }
    };
    findLeaves(root);

    const totalLeaves = leaves.length || 1;
    const printableH = this.height() - topMargin - bottomMargin;
    const leafSpacing = totalLeaves > 1 ? printableH / (totalLeaves - 1) : printableH;

    // DFS layout assignment
    const layoutNode = (node: ProcessedNode) => {
      // Set X based on depth
      node.x = leftMargin + node.depth * levelWidth;

      if (node.children.length === 0) {
        // Leaf node y-coordinate
        node.y = topMargin + leafIndex * leafSpacing;
        leafIndex++;
      } else {
        // Lay out children first
        node.children.forEach(layoutNode);
        // Parent y is the average of children's y coords
        const sumY = node.children.reduce((sum, child) => sum + child.y, 0);
        node.y = sumY / node.children.length;
      }

      // Assign colors based on depth
      if (!node.color) {
        node.color = this.colors()[node.depth % this.colors().length];
      }
    };

    layoutNode(root);

    return { nodes: allNodes, root };
  });

  computedNodes = computed<ProcessedNode[]>(() => {
    return this.computedTree().nodes;
  });

  computedLinks = computed<TreeLink[]>(() => {
    const nodes = this.computedNodes();
    const links: TreeLink[] = [];

    nodes.forEach(node => {
      node.children.forEach(child => {
        // Horizontal Bezier curve from parent to child
        const path = `M ${node.x} ${node.y} C ${(node.x + child.x) / 2} ${node.y}, ${(node.x + child.x) / 2} ${child.y}, ${child.x} ${child.y}`;
        links.push({
          parentId: node.id,
          childId: child.id,
          path
        });
      });
    });

    return links;
  });

  onNodeHover(event: MouseEvent, node: ProcessedNode): void {
    const el = (event.currentTarget as HTMLElement).closest('.ngx-treegraph') as HTMLElement;
    const rect = el.getBoundingClientRect();
    this.tooltip.set({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      label: node.label,
      depth: node.depth,
      value: node.value,
      childrenCount: node.children.length,
      color: node.color
    });
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
    const data = this.data();
    if (!data.length) return;
    let csv = 'ID,Label,ParentID,Value\n';
    data.forEach(d => {
      csv += `"${d.id}","${d.label}","${d.parentId || ''}",${d.value || 0}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'tree-graph-data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToJson(): void {
    const data = this.data();
    if (!data.length) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'tree-graph-data.json');
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
    link.setAttribute('download', 'tree-graph.svg');
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
        <title>Tree Graph Export</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #0f172a; text-align: center; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 24px; text-align: left; }
          .title { font-size: 20px; font-weight: bold; }
          .date { font-size: 12px; color: #64748b; }
          .chart-container { display: inline-block; margin-top: 24px; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; background: #ffffff; }
          svg { max-width: 100%; height: auto; }
          .link-line { stroke: #cbd5e1; }
          .node-label { fill: #1e293b; font-size: 11px; font-weight: 600; }
          @media print {
            body { padding: 0; }
            .chart-container { border: none; padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">Tree Graph Analytics</div>
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

  readonly fmtNum = fmtNum;
}
