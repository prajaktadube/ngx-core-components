import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, viewChild, HostListener, inject
} from '@angular/core';
import { ChartExportService } from '../shared/chart-export.service';
import { ChartExportMenuComponent } from '../shared/chart-export-menu.component';
import type { ExportFormat } from '../shared/chart-export-menu.component';
import { CHART_COLORS, fmtNum } from '../shared/chart-utils';

export interface NetworkNode {
  id: string;
  label: string;
  value?: number; // Size/importance
  group?: string;
  color?: string;
}

export interface NetworkLink {
  source: string; // node ID
  target: string; // node ID
  value?: number; // strength/weight
}

interface SimulatedNode {
  id: string;
  label: string;
  value: number;
  group: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
}

interface SimulatedLink {
  sourceId: string;
  targetId: string;
  sourceNode: SimulatedNode;
  targetNode: SimulatedNode;
  weight: number;
}

@Component({
  selector: 'ngx-network-graph',
  standalone: true,
  imports: [ChartExportMenuComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-network-graph">
      <!-- Toolbar with Export option -->
      <div class="chart-header" (mousemove)="$event.stopPropagation()" (mouseleave)="onMouseLeave()">
        <div class="chart-title-space"></div>
        @if (showExport()) {
          <ngx-chart-export-menu (exportClicked)="onExport($event)" />
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
          <!-- Network Links -->
          @for (link of computedLinks(); track link.sourceId + '-' + link.targetId) {
            <line
              [attr.x1]="link.sourceNode.x"
              [attr.y1]="link.sourceNode.y"
              [attr.x2]="link.targetNode.x"
              [attr.y2]="link.targetNode.y"
              [attr.stroke]="linkHovered(link) ? 'var(--primary-color, #4f46e5)' : 'var(--ngx-chart-grid, #cbd5e1)'"
              [attr.stroke-width]="linkHovered(link) ? link.weight + 3 : link.weight"
              [attr.stroke-opacity]="linkHovered(link) ? 0.9 : 0.65"
              class="link-line"
              (mouseenter)="hoveredLink.set(link); onLinkHover($event, link)"
              (mouseleave)="hoveredLink.set(null); tooltip.set(null)"
            />
          }

          <!-- Network Nodes -->
          @for (node of computedNodes(); track node.id) {
            <g
              class="node-group"
              [class.hovered]="hoveredNodeId() === node.id || neighborNodeIds().includes(node.id)"
              [class.dimmed]="hoveredNodeId() !== null && hoveredNodeId() !== node.id && !neighborNodeIds().includes(node.id)"
              (mouseenter)="onNodeMouseEnter($event, node)"
              (mouseleave)="onNodeMouseLeave()"
            >
              <circle
                [attr.cx]="node.x"
                [attr.cy]="node.y"
                [attr.r]="node.r"
                [attr.fill]="node.color"
                [attr.stroke]="hoveredNodeId() === node.id ? 'var(--primary-color, #4f46e5)' : '#ffffff'"
                [attr.stroke-width]="hoveredNodeId() === node.id ? 3 : 1.5"
                class="node-circle"
              />
              @if (showLabels()) {
                <text
                  [attr.x]="node.x"
                  [attr.y]="node.y + node.r + 14"
                  text-anchor="middle"
                  class="node-label"
                >
                  {{ node.label }}
                </text>
              }
            </g>
          }
        </svg>

        <!-- Legend (shown if groups exist) -->
        @if (showLegend() && uniqueGroups().length > 1) {
          <div class="chart-legend">
            @for (grp of uniqueGroups(); track grp; let i = $index) {
              <div class="legend-item">
                <span class="legend-dot" [style.background]="getGroupColor(grp, i)"></span>
                <span class="legend-label">{{ grp }}</span>
              </div>
            }
          </div>
        }
      </div>

      <!-- Premium Glassmorphic Tooltip -->
      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
          @if (t.type === 'node') {
            <span class="tt-dot" [style.background]="t.color"></span>
            <div class="tt-content">
              <strong>{{ t.label }}</strong>
              @if (t.group) {
                <div class="tt-group">Group: {{ t.group }}</div>
              }
              <div class="tt-val">Connections: {{ t.connections }}</div>
            </div>
          } @else {
            <div class="tt-content">
              <strong>Link Connection</strong>
              <div>{{ t.sourceLabel }} ➔ {{ t.targetLabel }}</div>
              <div>Weight: {{ fmtNum(t.value) }}</div>
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
    .ngx-network-graph {
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
      gap: 24px;
      flex-wrap: wrap;
    }
    .chart-svg {
      display: block;
      max-width: 100%;
      height: auto;
      min-width: 0;
    }
    .link-line {
      cursor: pointer;
      transition: stroke 0.2s, stroke-width 0.2s, stroke-opacity 0.2s;
    }
    .node-group {
      cursor: pointer;
      transition: opacity 0.25s ease;
    }
    .node-circle {
      transition: r 0.2s, stroke 0.2s, stroke-width 0.2s;
    }
    .node-group:hover .node-circle {
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.15));
    }
    .node-group.dimmed {
      opacity: 0.3;
    }
    .node-label {
      fill: var(--ngx-chart-text, #1e293b);
      font-size: 11px;
      font-weight: 600;
      pointer-events: none;
      user-select: none;
    }
    .chart-legend {
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex-shrink: 0;
      min-width: 130px;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
    }
    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 3px;
      flex-shrink: 0;
    }
    .legend-label {
      color: var(--ngx-chart-text, #1e293b);
      font-weight: 600;
    }

    /* Premium Glassmorphic Tooltip */
    .chart-tooltip {
      position: absolute; pointer-events: none; transform: translate(-50%, -100%) translateY(-8px);
      background: var(--ngx-chart-tooltip-bg, rgba(15, 23, 42, 0.92));
      backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      color: var(--ngx-chart-tooltip-color, #f8fafc); padding: 10px 14px;
      border-radius: 10px; font-size: 12px; min-width: 150px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      z-index: 100;
      display: flex; align-items: flex-start; gap: 8px;
      transition: left 0.12s cubic-bezier(0.16, 1, 0.3, 1), top 0.12s cubic-bezier(0.16, 1, 0.3, 1);
      font-family: inherit;
    }
    .tt-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 4px; }
    .tt-content { display: flex; flex-direction: column; gap: 2px; }
    .tt-group { font-size: 10px; color: rgba(248, 250, 252, 0.7); }
    .tt-val { font-weight: 700; }


  `]
})
export class NetworkGraphComponent {
  private readonly exportSvc = inject(ChartExportService);
  nodes = input<NetworkNode[]>([]);
  links = input<NetworkLink[]>([]);
  height = input<number>(300);
  width = input<number>(450);
  colors = input<string[]>(CHART_COLORS);
  showLegend = input<boolean>(true);
  showLabels = input<boolean>(true);
  showExport = input<boolean>(false);
  linkLength = input<number>(65);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');


  hoveredNodeId = signal<string | null>(null);
  hoveredLink = signal<SimulatedLink | null>(null);
  tooltip = signal<any | null>(null);

  cx = computed(() => this.width() / 2);
  cy = computed(() => this.height() / 2);

  uniqueGroups = computed(() => {
    const grps = new Set<string>();
    this.nodes().forEach(n => {
      if (n.group) grps.add(n.group);
    });
    return Array.from(grps);
  });

  // Returns array of node ids connected to the hovered node
  neighborNodeIds = computed<string[]>(() => {
    const active = this.hoveredNodeId();
    if (!active) return [];
    const connected = new Set<string>();
    this.links().forEach(link => {
      if (link.source === active) connected.add(link.target);
      if (link.target === active) connected.add(link.source);
    });
    return Array.from(connected);
  });

  computedNodes = computed<SimulatedNode[]>(() => {
    const rawNodes = this.nodes();
    if (!rawNodes.length) return [];

    const totalNodes = rawNodes.length;
    const centerx = this.cx();
    const centery = this.cy();
    const grps = this.uniqueGroups();

    // Map raw nodes to simulated nodes with initial spiral/circular layout
    const nodes: SimulatedNode[] = rawNodes.map((n, i) => {
      const g = n.group || 'default';
      const grpIdx = grps.indexOf(g);
      const color = n.color || this.colors()[grpIdx >= 0 ? grpIdx % this.colors().length : i % this.colors().length];

      // Sizing of nodes based on value input or default
      const r = n.value ? Math.max(6, Math.min(22, 6 + Math.sqrt(n.value) * 1.5)) : 10;

      // Circular positioning starting layout
      const angle = (i / totalNodes) * Math.PI * 2;
      const startRadius = Math.min(centerx, centery) * 0.45;

      return {
        id: n.id,
        label: n.label,
        value: n.value || 0,
        group: g,
        r,
        color,
        x: centerx + Math.cos(angle) * startRadius,
        y: centery + Math.sin(angle) * startRadius,
        vx: 0,
        vy: 0
      };
    });

    const linkList = this.links();
    const iterations = 160;
    const lLength = this.linkLength();
    const attraction = 0.05;
    const repulsion = 120; // Repulsion constant
    const gravity = 0.035;
    const damping = 0.75;

    // Run force-directed layout simulation
    for (let it = 0; it < iterations; it++) {
      // 1. Repulsion between all pairs of nodes
      for (let i = 0; i < nodes.length; i++) {
        const nodeA = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const nodeB = nodes[j];
          const dx = nodeB.x - nodeA.x;
          const dy = nodeB.y - nodeA.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
          const rLimit = nodeA.r + nodeB.r + 20;

          // Repulsive force inversely proportional to distance squared
          const force = (repulsion / (dist * dist)) * (dist < rLimit ? 3.0 : 1.0);
          nodeA.vx -= (dx / dist) * force;
          nodeA.vy -= (dy / dist) * force;
          nodeB.vx += (dx / dist) * force;
          nodeB.vy += (dy / dist) * force;
        }
      }

      // 2. Link Attraction forces
      linkList.forEach(link => {
        const sourceNode = nodes.find(n => n.id === link.source);
        const targetNode = nodes.find(n => n.id === link.target);
        if (!sourceNode || !targetNode) return;

        const dx = targetNode.x - sourceNode.x;
        const dy = targetNode.y - sourceNode.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
        const linkStr = link.value ? Math.max(0.2, Math.min(1.5, link.value)) : 1;

        // Pull force towards link target length
        const offset = dist - lLength;
        const forceX = (dx / dist) * offset * attraction * linkStr;
        const forceY = (dy / dist) * offset * attraction * linkStr;

        sourceNode.vx += forceX;
        sourceNode.vy += forceY;
        targetNode.vx -= forceX;
        targetNode.vy -= forceY;
      });

      // 3. Gravity attraction to center & update positions
      nodes.forEach(node => {
        node.vx += (centerx - node.x) * gravity;
        node.vy += (centery - node.y) * gravity;

        node.x += node.vx;
        node.y += node.vy;

        node.vx *= damping;
        node.vy *= damping;

        // Keep inside bounds
        const borderPadding = node.r + 8;
        if (node.x < borderPadding) { node.x = borderPadding; node.vx = 0; }
        if (node.x > this.width() - borderPadding) { node.x = this.width() - borderPadding; node.vx = 0; }
        if (node.y < borderPadding) { node.y = borderPadding; node.vy = 0; }
        if (node.y > this.height() - borderPadding) { node.y = this.height() - borderPadding; node.vy = 0; }
      });
    }

    return nodes;
  });

  computedLinks = computed<SimulatedLink[]>(() => {
    const rawLinks = this.links();
    const nodes = this.computedNodes();
    if (!nodes.length) return [];

    return rawLinks.map(link => {
      const sourceNode = nodes.find(n => n.id === link.source);
      const targetNode = nodes.find(n => n.id === link.target);
      const weight = link.value ? Math.max(1, Math.min(8, link.value)) : 1.5;

      return {
        sourceId: link.source,
        targetId: link.target,
        sourceNode: sourceNode || nodes[0],
        targetNode: targetNode || nodes[0],
        weight
      };
    });
  });

  getGroupColor(group: string, idx: number): string {
    return this.colors()[idx % this.colors().length];
  }

  linkHovered(link: SimulatedLink): boolean {
    const activeLink = this.hoveredLink();
    if (activeLink && activeLink.sourceId === link.sourceId && activeLink.targetId === link.targetId) {
      return true;
    }
    const node = this.hoveredNodeId();
    if (node && (link.sourceId === node || link.targetId === node)) {
      return true;
    }
    return false;
  }

  onNodeMouseEnter(event: MouseEvent, node: SimulatedNode): void {
    this.hoveredNodeId.set(node.id);
    const el = (event.currentTarget as HTMLElement).closest('.ngx-network-graph') as HTMLElement;
    const rect = el.getBoundingClientRect();

    // count connections
    const connCount = this.links().filter(l => l.source === node.id || l.target === node.id).length;

    this.tooltip.set({
      type: 'node',
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      label: node.label,
      group: node.group !== 'default' ? node.group : undefined,
      connections: connCount,
      color: node.color
    });
  }

  onNodeMouseLeave(): void {
    this.hoveredNodeId.set(null);
    this.tooltip.set(null);
  }

  onLinkHover(event: MouseEvent, link: SimulatedLink): void {
    const el = (event.currentTarget as HTMLElement).closest('.ngx-network-graph') as HTMLElement;
    const rect = el.getBoundingClientRect();

    this.tooltip.set({
      type: 'link',
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      sourceLabel: link.sourceNode.label,
      targetLabel: link.targetNode.label,
      value: link.weight
    });
  }

  onMouseLeave(): void {
    this.hoveredNodeId.set(null);
    this.hoveredLink.set(null);
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
    this.exportSvc.downloadJson(data, 'network-graph-data.json');
  }

  exportToCsv(): void {
    const links = this.links();
    if (!links.length) return;
    const headers = ['Source', 'Target', 'Weight'];
    const rows = links.map(l => [l.source, l.target, l.value || 1]);
    this.exportSvc.downloadCsv(headers, rows, 'network-graph-links.csv');
  }

  exportToSvg(): void {
    this.exportSvc.downloadSvg(this.svgEl()?.nativeElement, 'chart.svg');
  }

  exportToPdf(): void {
    this.exportSvc.downloadPdf(this.svgEl()?.nativeElement, 'Chart Export', 'chart.pdf');
  }

  readonly fmtNum = fmtNum;
}
