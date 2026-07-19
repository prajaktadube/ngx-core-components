import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, HostListener, viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { fmtNum, scale } from '../shared/chart-utils';
import { WORLD_MAP_DATA, getSvgPath, project } from '../shared/map-data';

export interface FlowNode {
  id: string;
  lat: number;
  lng: number;
  label?: string;
  size?: number;
  color?: string;
}

export interface FlowConnection {
  from: string;
  to: string;
  value: number;
  label?: string;
  color?: string;
}

@Component({
  selector: 'ngx-flowmap',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-flowmap" [class.dark]="theme() === 'dark'" (mouseleave)="onMouseLeave()">
      <div class="chart-header" (mousemove)="$event.stopPropagation()" (mouseleave)="onMouseLeave()">
        <div class="chart-title">
          <h4>{{ title() }}</h4>
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

      <div class="chart-svg-container" #container>
        <svg
          #svgEl
          class="map-svg"
          [attr.width]="'100%'"
          [attr.height]="height()"
        >
          <!-- Base Map Outlines -->
          <g class="map-base">
            @for (pathStr of baseMapPaths(); track $index) {
              <path
                [attr.d]="pathStr"
                [attr.fill]="theme() === 'dark' ? '#1e293b' : '#f1f5f9'"
                [attr.stroke]="theme() === 'dark' ? '#0f172a' : '#e2e8f0'"
                stroke-width="1.2"
              />
            }
          </g>

          <!-- Curved Flow Connections -->
          <g class="map-flows">
            @for (flow of computedFlows(); track $index; let i = $index) {
              <!-- Background wider hover trigger path -->
              <path
                [attr.d]="flow.path"
                fill="none"
                stroke="transparent"
                stroke-width="12"
                style="cursor: pointer;"
                (mouseenter)="onFlowHover(flow.raw, i, $event)"
                (mousemove)="onFlowMouseMove($event)"
              />
              
              <!-- Display Path -->
              <path
                [attr.d]="flow.path"
                fill="none"
                [attr.stroke]="flow.color"
                [attr.stroke-width]="hoveredFlowIndex() === i ? flow.strokeWidth * 1.6 + 1 : flow.strokeWidth"
                [attr.opacity]="hoveredFlowIndex() === i ? 0.95 : 0.7"
                class="flow-path"
                [style.animation-duration]="flow.duration"
              />
            }
          </g>

          <!-- Flow Nodes -->
          <g class="map-nodes">
            @for (node of computedNodes(); track node.id; let i = $index) {
              <circle
                [attr.cx]="node.x"
                [attr.cy]="node.y"
                [attr.r]="hoveredNodeId() === node.id ? node.size * 1.4 + 2 : node.size"
                [attr.fill]="node.color"
                stroke="#ffffff"
                [attr.stroke-width]="hoveredNodeId() === node.id ? 2.5 : 1.5"
                class="flow-node"
                [class.hovered]="hoveredNodeId() === node.id"
                (mouseenter)="onNodeHover(node.raw, $event)"
                (mousemove)="onNodeMouseMove($event)"
              />
            }
          </g>
        </svg>

        <!-- Glassmorphic Tooltip -->
        @if (tooltip(); as t) {
          <div class="chart-tooltip" [style.left.px]="tooltipX()" [style.top.px]="tooltipY()">
            @if (t.type === 'node') {
              <div class="tt-cat">{{ t.label || t.id }}</div>
              <div class="tt-row">
                <span class="tt-name">Node ID</span>
                <span class="tt-val">{{ t.id }}</span>
              </div>
              <div class="tt-row">
                <span class="tt-name">Coords</span>
                <span class="tt-val">{{ t.lat.toFixed(2) }}°, {{ t.lng.toFixed(2) }}°</span>
              </div>
            } @else {
              <div class="tt-cat">Flow Connection</div>
              <div class="tt-row">
                <span class="tt-name">Route</span>
                <span class="tt-val">{{ t.from }} ➔ {{ t.to }}</span>
              </div>
              <div class="tt-row">
                <span class="tt-name">Volume</span>
                <span class="tt-val">{{ fmtNum(t.value) }}</span>
              </div>
              @if (t.label) {
                <div class="tt-row label-row">
                  <span class="tt-name">{{ t.label }}</span>
                </div>
              }
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    .ngx-flowmap {
      background: var(--ngx-chart-bg, #ffffff);
      border-radius: 16px;
      padding: 16px;
      box-sizing: border-box;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
      position: relative;
      width: 100%;
      transition: background-color 0.3s;
    }
    .ngx-flowmap.dark {
      background: #0f172a;
      border: 1px solid rgba(255, 255, 255, 0.05);
      --ngx-chart-bg: #0f172a;
      --ngx-chart-tooltip-bg: rgba(15, 23, 42, 0.95);
      --ngx-chart-tooltip-color: #f8fafc;
    }
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      position: relative;
    }
    .chart-title h4 {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      color: var(--ngx-chart-title-color, #1e293b);
    }
    .dark .chart-title h4 {
      color: #f8fafc;
    }

    .map-svg {
      display: block;
      overflow: visible;
    }

    @keyframes flowMoving {
      to {
        stroke-dashoffset: -20;
      }
    }

    .flow-path {
      stroke-dasharray: 6, 4;
      animation: flowMoving linear infinite;
      cursor: pointer;
    }
    .flow-node {
      cursor: pointer;
      transition: r 0.2s cubic-bezier(0.16, 1, 0.3, 1), stroke-width 0.15s;
    }
    .flow-node.hovered {
      filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.3));
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
      min-width: 170px;
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
    .label-row {
      margin-top: 6px;
      border-top: 1px dashed rgba(255, 255, 255, 0.15);
      padding-top: 4px;
      font-style: italic;
      color: rgba(255, 255, 255, 0.7);
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
    .chart-svg-container {
      position: relative;
      width: 100%;
    }
  `]
})
export class FlowmapComponent {
  title = input<string>('Global Logistics Flowmap');
  nodes = input<FlowNode[]>([]);
  flows = input<FlowConnection[]>([]);
  height = input<number>(400);
  theme = input<'light' | 'dark'>('light');
  showExport = input<boolean>(false);
  colors = input<string[]>(['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444']);

  containerWidth = signal<number>(600);
  hoveredNodeId = signal<string | null>(null);
  hoveredFlowIndex = signal<number | null>(null);
  tooltip = signal<any | null>(null);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);
  exportMenuOpen = signal(false);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');
  private container = viewChild<ElementRef>('container');

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

  baseMapPaths = computed(() => {
    const w = this.containerWidth();
    const h = this.height();
    const padding = { top: 10, right: 10, bottom: 10, left: 10 };
    return WORLD_MAP_DATA.map(region => getSvgPath(region.polygons, w, h, padding));
  });

  computedNodes = computed(() => {
    const w = this.containerWidth();
    const h = this.height();
    const padding = { top: 10, right: 10, bottom: 10, left: 10 };

    return this.nodes().map(node => {
      const coord = project(node.lng, node.lat, w, h, padding);
      return {
        id: node.id,
        x: coord.x,
        y: coord.y,
        size: node.size || 8,
        color: node.color || '#4f46e5',
        raw: node
      };
    });
  });

  private flowValues = computed(() => this.flows().map(f => f.value));
  private maxFlowVal = computed(() => this.flowValues().length > 0 ? Math.max(...this.flowValues()) : 1);
  private minFlowVal = computed(() => this.flowValues().length > 0 ? Math.min(...this.flowValues()) : 0);

  computedFlows = computed(() => {
    const nodesMap = new Map<string, { x: number; y: number }>();
    this.computedNodes().forEach(n => nodesMap.set(n.id.toUpperCase(), { x: n.x, y: n.y }));

    const maxVal = this.maxFlowVal();
    const minVal = this.minFlowVal();

    return this.flows().map((flow, index) => {
      const p1 = nodesMap.get(flow.from.toUpperCase());
      const p2 = nodesMap.get(flow.to.toUpperCase());
      
      const x1 = p1 ? p1.x : 0;
      const y1 = p1 ? p1.y : 0;
      const x2 = p2 ? p2.x : 0;
      const y2 = p2 ? p2.y : 0;

      // Quadratic Bezier math
      // Midpoint:
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      
      // Delta
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.sqrt(dx*dx + dy*dy) || 1;
      
      // Curvature offset (perpendicular to direction)
      const curOffset = len * 0.18;
      const cx = mx - (dy / len) * curOffset;
      const cy = my + (dx / len) * curOffset;

      const path = `M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
      
      // Scaling line thickness: 1.5px to 6px
      const strokeWidth = scale(flow.value, minVal, maxVal, 1.5, 6);
      
      // Animation duration: higher value (faster flow) is shorter duration
      const duration = scale(flow.value, minVal, maxVal, 2.5, 0.8) + 's';

      const color = flow.color || this.colors()[index % this.colors().length];

      return {
        path,
        strokeWidth,
        duration,
        color,
        raw: flow
      };
    });
  });

  onNodeHover(node: FlowNode, event: MouseEvent) {
    this.hoveredNodeId.set(node.id);
    this.hoveredFlowIndex.set(null);
    this.tooltip.set({
      type: 'node',
      id: node.id,
      label: node.label,
      lat: node.lat,
      lng: node.lng
    });
  }

  onNodeMouseMove(event: MouseEvent) {
    const containerEl = this.container()?.nativeElement;
    if (containerEl) {
      const rect = containerEl.getBoundingClientRect();
      this.tooltipX.set(event.clientX - rect.left);
      this.tooltipY.set(event.clientY - rect.top);
    }
  }

  onFlowHover(flow: FlowConnection, idx: number, event: MouseEvent) {
    this.hoveredFlowIndex.set(idx);
    this.hoveredNodeId.set(null);
    this.tooltip.set({
      type: 'flow',
      from: flow.from,
      to: flow.to,
      value: flow.value,
      label: flow.label
    });
  }

  onFlowMouseMove(event: MouseEvent) {
    const containerEl = this.container()?.nativeElement;
    if (containerEl) {
      const rect = containerEl.getBoundingClientRect();
      this.tooltipX.set(event.clientX - rect.left);
      this.tooltipY.set(event.clientY - rect.top);
    }
  }

  onMouseLeave() {
    this.hoveredNodeId.set(null);
    this.hoveredFlowIndex.set(null);
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

  exportToJson(): void {
    const data = { nodes: this.nodes(), flows: this.flows() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'flowmap-data.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToCsv(): void {
    const data = this.flows();
    if (!data.length) return;
    let csv = 'FromNode,ToNode,Volume,Label\n';
    data.forEach(d => {
      csv += `"${d.from}","${d.to}",${d.value},"${d.label || ''}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'flowmap-data.csv');
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
    link.setAttribute('download', 'flowmap.svg');
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

  readonly fmtNum = fmtNum;
}
