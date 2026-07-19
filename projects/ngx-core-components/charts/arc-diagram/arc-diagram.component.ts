import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, viewChild, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CHART_COLORS, fmtNum } from '../shared/chart-utils';

export interface ArcNode {
  id: string;
  label: string;
  value?: number; // Node size factor
  color?: string;
}

export interface ArcLink {
  source: string; // node ID
  target: string; // node ID
  value?: number; // Link thickness factor
}

interface ProcessedNode {
  id: string;
  label: string;
  value: number;
  x: number;
  y: number;
  r: number;
  color: string;
  index: number;
}

interface ProcessedLink {
  sourceId: string;
  targetId: string;
  sourceNode: ProcessedNode;
  targetNode: ProcessedNode;
  path: string;
  weight: number;
}

@Component({
  selector: 'ngx-arc-diagram',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-arc-diagram">
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

      <div class="chart-body">
        <svg
          #svgEl
          class="chart-svg"
          [attr.viewBox]="'0 0 ' + width() + ' ' + height()"
          [attr.width]="width()"
          [attr.height]="height()"
        >
          <!-- Baseline horizontal axis -->
          <line
            [attr.x1]="margin().left"
            [attr.y1]="axisY()"
            [attr.x2]="width() - margin().right"
            [attr.y2]="axisY()"
            stroke="var(--ngx-chart-grid, #e2e8f0)"
            stroke-width="1.5"
            stroke-dasharray="3 3"
          />

          <!-- Arc Links -->
          @for (link of computedLinks(); track link.sourceId + '-' + link.targetId) {
            <path
              [attr.d]="link.path"
              fill="none"
              [attr.stroke]="linkHovered(link) ? 'var(--primary-color, #4f46e5)' : 'var(--ngx-chart-grid, #cbd5e1)'"
              [attr.stroke-width]="linkHovered(link) ? link.weight + 2.5 : link.weight"
              [attr.stroke-opacity]="linkHovered(link) ? 0.9 : 0.45"
              class="link-arc"
              (mouseenter)="hoveredLink.set(link); onLinkHover($event, link)"
              (mouseleave)="hoveredLink.set(null); tooltip.set(null)"
            />
          }

          <!-- Node Circles & Labels -->
          @for (node of computedNodes(); track node.id) {
            <g
              class="node-group"
              [class.hovered]="hoveredNodeId() === node.id || neighborNodeIds().includes(node.id)"
              [class.dimmed]="hoveredNodeId() !== null && hoveredNodeId() !== node.id && !neighborNodeIds().includes(node.id)"
              (mouseenter)="hoveredNodeId.set(node.id); onNodeHover($event, node)"
              (mouseleave)="hoveredNodeId.set(null); tooltip.set(null)"
            >
              <!-- Arc Node Circle -->
              <circle
                [attr.cx]="node.x"
                [attr.cy]="node.y"
                [attr.r]="node.r"
                [attr.fill]="node.color"
                [attr.stroke]="hoveredNodeId() === node.id ? 'var(--primary-color, #4f46e5)' : '#ffffff'"
                [attr.stroke-width]="hoveredNodeId() === node.id ? 2.5 : 1.5"
                class="node-circle"
              />
              <!-- Vertical rotated or horizontal label -->
              @if (showLabels()) {
                <text
                  [attr.x]="node.x"
                  [attr.y]="node.y + node.r + 14"
                  [attr.transform]="'rotate(35, ' + node.x + ', ' + (node.y + node.r + 14) + ')'"
                  text-anchor="start"
                  class="node-label"
                >
                  {{ node.label }}
                </text>
              }
            </g>
          }
        </svg>
      </div>

      <!-- Premium Glassmorphic Tooltip -->
      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
          @if (t.type === 'node') {
            <span class="tt-dot" [style.background]="t.color"></span>
            <div class="tt-content">
              <strong>{{ t.label }}</strong>
              <div class="tt-sub">Connections: {{ t.connections }}</div>
              @if (t.value > 0) {
                <div>Node Value: {{ fmtNum(t.value) }}</div>
              }
            </div>
          } @else {
            <div class="tt-content">
              <strong>Connection Arc</strong>
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
    .ngx-arc-diagram {
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
      overflow: visible; /* To ensure rotated labels aren't clipped */
    }
    .link-arc {
      cursor: pointer;
      transition: stroke 0.2s, stroke-width 0.2s, stroke-opacity 0.2s;
    }
    .node-group {
      cursor: pointer;
      transition: opacity 0.2s ease;
    }
    .node-circle {
      transition: r 0.15s, stroke 0.15s, stroke-width 0.15s;
    }
    .node-group:hover .node-circle {
      r: 8.5;
      filter: drop-shadow(0 3px 6px rgba(0,0,0,0.15));
    }
    .node-group.dimmed {
      opacity: 0.35;
    }
    .node-label {
      fill: var(--ngx-chart-text, #475569);
      font-size: 10px;
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
export class ArcDiagramComponent {
  nodes = input<ArcNode[]>([]);
  links = input<ArcLink[]>([]);
  height = input<number>(300);
  width = input<number>(550);
  colors = input<string[]>(CHART_COLORS);
  showLabels = input<boolean>(true);
  showExport = input<boolean>(false);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  exportMenuOpen = signal(false);
  hoveredNodeId = signal<string | null>(null);
  hoveredLink = signal<ProcessedLink | null>(null);
  tooltip = signal<any | null>(null);

  margin = computed(() => ({
    top: 30,
    right: 60,
    bottom: 60, // extra space for rotated node labels
    left: 40
  }));

  axisY = computed(() => this.height() - this.margin().bottom);

  uniqueGroups = computed(() => {
    return Array.from(new Set(this.nodes().map(n => n.id)));
  });

  // Neighbor nodes connected to active hovered node
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

  computedNodes = computed<ProcessedNode[]>(() => {
    const rawNodes = this.nodes();
    if (!rawNodes.length) return [];

    const totalNodes = rawNodes.length;
    const startX = this.margin().left;
    const endX = this.width() - this.margin().right;
    const nodeSpacing = totalNodes > 1 ? (endX - startX) / (totalNodes - 1) : 0;
    const yCoord = this.axisY();

    return rawNodes.map((node, i) => {
      const color = node.color || this.colors()[i % this.colors().length];
      const r = node.value ? Math.max(5, Math.min(18, 5 + Math.sqrt(node.value) * 1.2)) : 6.5;
      const x = startX + i * nodeSpacing;

      return {
        id: node.id,
        label: node.label,
        value: node.value || 0,
        x,
        y: yCoord,
        r,
        color,
        index: i
      };
    });
  });

  computedLinks = computed<ProcessedLink[]>(() => {
    const rawLinks = this.links();
    const nodes = this.computedNodes();
    if (!nodes.length) return [];

    const links: ProcessedLink[] = [];
    rawLinks.forEach(link => {
      const sourceNode = nodes.find(n => n.id === link.source);
      const targetNode = nodes.find(n => n.id === link.target);
      if (!sourceNode || !targetNode) return;

      const weight = link.value ? Math.max(1, Math.min(6, link.value)) : 1.5;

      // Draw semi-circular arc curving upward
      // R is half of coordinate difference
      const r = Math.abs(targetNode.x - sourceNode.x) / 2;
      const startNode = sourceNode.x < targetNode.x ? sourceNode : targetNode;
      const endNode = sourceNode.x < targetNode.x ? targetNode : sourceNode;
      
      const path = `M ${startNode.x} ${startNode.y} A ${r} ${r} 0 0 1 ${endNode.x} ${endNode.y}`;

      links.push({
        sourceId: link.source,
        targetId: link.target,
        sourceNode,
        targetNode,
        path,
        weight
      });
    });

    return links;
  });

  linkHovered(link: ProcessedLink): boolean {
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

  onNodeHover(event: MouseEvent, node: ProcessedNode): void {
    const el = (event.currentTarget as HTMLElement).closest('.ngx-arc-diagram') as HTMLElement;
    const rect = el.getBoundingClientRect();
    const connCount = this.links().filter(l => l.source === node.id || l.target === node.id).length;

    this.tooltip.set({
      type: 'node',
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      label: node.label,
      connections: connCount,
      value: node.value,
      color: node.color
    });
  }

  onLinkHover(event: MouseEvent, link: ProcessedLink): void {
    const el = (event.currentTarget as HTMLElement).closest('.ngx-arc-diagram') as HTMLElement;
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
    const links = this.links();
    if (!links.length) return;
    let csv = 'Source,Target,Weight\n';
    links.forEach(l => {
      csv += `"${l.source}","${l.target}",${l.value || 1}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'arc-diagram-links.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToJson(): void {
    const data = {
      nodes: this.nodes(),
      links: this.links()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'arc-diagram-data.json');
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
    link.setAttribute('download', 'arc-diagram.svg');
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
        <title>Arc Diagram Export</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #0f172a; text-align: center; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 24px; text-align: left; }
          .title { font-size: 20px; font-weight: bold; }
          .date { font-size: 12px; color: #64748b; }
          .chart-container { display: inline-block; margin-top: 24px; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; background: #ffffff; }
          svg { max-width: 100%; height: auto; overflow: visible; }
          .link-arc { stroke: #cbd5e1; stroke-opacity: 0.45; }
          .node-label { fill: #475569; font-size: 10px; font-weight: 600; text-anchor: start; }
          @media print {
            body { padding: 0; }
            .chart-container { border: none; padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">Arc Diagram Analytics</div>
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
