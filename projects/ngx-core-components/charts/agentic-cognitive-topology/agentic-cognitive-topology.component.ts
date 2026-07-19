import {
  Component, input, output, signal, computed, ChangeDetectionStrategy,
  ElementRef, viewChild, HostListener, effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CHART_COLORS } from '../shared/chart-utils';

export interface TopologyNode {
  id: string;
  label: string;
  status: 'idle' | 'thinking' | 'success' | 'error';
  type?: string;     // e.g. 'orchestrator' | 'agent' | 'tool' | 'critic'
  prompt?: string;
  response?: string;
  x?: number;
  y?: number;
}

export interface TopologyLink {
  source: string;
  target: string;
  active?: boolean;
  label?: string;
}

interface ProcessedNode extends TopologyNode {
  x: number;
  y: number;
  depth: number;
}

@Component({
  selector: 'ngx-agentic-cognitive-topology',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-topology-wrapper">
      <div class="chart-header" (mousemove)="$event.stopPropagation()" (mouseleave)="closeTooltip()">
        <div class="chart-title-space">
          <div class="topology-title">Agentic Cognitive Topology (DAG)</div>
          <div class="topology-subtitle">
            Active Agents: <span class="highlight-val">{{ activeAgentsCount() }}</span> / {{ nodes().length }}
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

      <div class="ngx-topology-container" [style.height.px]="height()">
        <!-- SVG DAG Drawing Canvas -->
        <svg
          #svgEl
          class="ngx-topology-svg"
          [attr.viewBox]="viewBoxString()"
          [attr.height]="height()"
          (click)="onCanvasClick()"
          (mousedown)="onMouseDown($event)"
          (mousemove)="onMouseMove($event)"
          (mouseup)="onMouseUp()"
          (mouseleave)="onMouseLeave()"
          [style.cursor]="draggingNodeId() ? 'grabbing' : isPanning() ? 'grabbing' : 'grab'"
        >
          <!-- Grid background dots -->
          <defs>
            <pattern id="grid-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="rgba(148, 163, 184, 0.15)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />

          <!-- Arrow markers for links -->
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--ngx-chart-grid, #94a3b8)" />
            </marker>
            <marker id="arrow-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#4f46e5" />
            </marker>
          </defs>

          <!-- Group that scales and translates nodes & links based on zoom/pan state -->
          <g [attr.transform]="transformString()">
            <!-- Links rendering -->
            @for (link of computedLinks(); track link.source + '-' + link.target) {
              <!-- Background link shadow / glow -->
              @if (link.active) {
                <path
                  [attr.d]="link.path"
                  fill="none"
                  stroke="#6366f1"
                  stroke-width="5"
                  stroke-opacity="0.15"
                />
              }
              
              <!-- Link line -->
              <path
                [attr.d]="link.path"
                fill="none"
                [attr.stroke]="link.active ? '#4f46e5' : '#94a3b8'"
                [attr.stroke-width]="link.active ? 2.5 : 1.5"
                [attr.marker-end]="link.active ? 'url(#arrow-active)' : 'url(#arrow)'"
                [class.link-active-flow]="link.active"
                class="topology-link-path"
              />

              <!-- Optional edge label -->
              @if (link.label) {
                <text
                  class="edge-label"
                  [attr.x]="getMidpointX(link)"
                  [attr.y]="getMidpointY(link)"
                  text-anchor="middle"
                  dominant-baseline="middle"
                >{{ link.label }}</text>
              }
            }

            <!-- Nodes rendering via foreignObject -->
            @for (node of computedNodes(); track node.id) {
              <g
                [class.node-thinking]="node.status === 'thinking'"
                [class.node-success]="node.status === 'success'"
                [class.node-error]="node.status === 'error'"
                [class.node-status-thinking]="node.status === 'thinking'"
                [class.node-status-success]="node.status === 'success'"
                [class.node-status-error]="node.status === 'error'"
                [style.transform]="'translate(' + (node.x - nodeWidth / 2) + 'px,' + (node.y - nodeHeight / 2) + 'px)'"
                [style.--node-translate]="'translate(' + (node.x - nodeWidth / 2) + 'px,' + (node.y - nodeHeight / 2) + 'px)'"
                class="node-group"
                (click)="onNodeClick(node, $event)"
                (mousedown)="onNodeMouseDown(node, $event)"
                (mouseenter)="hoveredNodeId.set(node.id)"
                (mouseleave)="hoveredNodeId.set(null)"
              >
                <!-- Outer border & backdrop glow -->
                <rect
                  [attr.width]="nodeWidth"
                  [attr.height]="nodeHeight"
                  rx="10"
                  class="node-backdrop"
                  [attr.stroke]="getNodeBorderColor(node)"
                />

                <!-- Embedded Rich HTML Content -->
                <foreignObject
                  [attr.width]="nodeWidth"
                  [attr.height]="nodeHeight"
                  class="node-html-container"
                >
                  <div class="node-card" [class]="node.status">
                    <div class="node-card-header">
                      <span class="node-type">{{ (node.type || 'Agent') | uppercase }}</span>
                      <span class="status-indicator"></span>
                    </div>
                    <div class="node-card-body">
                      <div class="node-label">{{ node.label }}</div>
                      @if (node.prompt) {
                        <div class="node-prompt-preview">{{ node.prompt }}</div>
                      }
                    </div>
                  </div>
                </foreignObject>

                <!-- Hover preview pill -->
                @if (hoveredNodeId() === node.id && !tooltipData()) {
                  <foreignObject
                    [attr.x]="0"
                    [attr.y]="-28"
                    [attr.width]="nodeWidth"
                    [attr.height]="26"
                    class="hover-preview-container"
                  >
                    <div class="hover-preview">
                      <span class="hover-preview-label">{{ node.label }}</span>
                      <span class="hover-preview-badge" [class]="'badge-' + node.status">{{ node.status }}</span>
                    </div>
                  </foreignObject>
                }
              </g>
            }
          </g>
        </svg>

        <!-- Floating Zoom Controls -->
        <div class="zoom-controls" (click)="$event.stopPropagation()">
          <button (click)="zoomIn()" title="Zoom In">➕</button>
          <button (click)="zoomOut()" title="Zoom Out">➖</button>
          <button (click)="resetZoom()" title="Reset Zoom">🔄</button>
          <span class="zoom-level">{{ zoomPercent() }}%</span>
        </div>

        <!-- Promptable Glassmorphic Tooltip Action Menu -->
        @if (tooltipData(); as td) {
          <div
            class="topology-tooltip"
            [style.left.px]="td.screenX"
            [style.top.px]="td.screenY"
            (click)="$event.stopPropagation()"
          >
            <div class="tt-cat">{{ td.node.label }} ({{ td.node.status | uppercase }})</div>
            @if (td.node.prompt) {
              <div class="tt-section">
                <span class="section-title">Latest Prompt:</span>
                <p class="section-content">"{{ td.node.prompt }}"</p>
              </div>
            }
            @if (td.node.response) {
              <div class="tt-section">
                <span class="section-title">Latest Response:</span>
                <p class="section-content">"{{ td.node.response }}"</p>
              </div>
            }
            <div class="action-buttons-row">
              <button class="action-btn explain" (click)="triggerAction('explain', td.node.id)">
                Ask Agent to Explain
              </button>
              <button class="action-btn rerun" (click)="triggerAction('rerun', td.node.id)">
                🔄 Rerun Agent
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
    .ngx-topology-wrapper {
      width: 100%;
      height: 100%;
      padding: 16px 20px;
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 12px;
      box-shadow: var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05));
      position: relative;
    }
    .ngx-topology-container {
      position: relative;
      width: 100%;
      overflow: hidden;
    }
    .ngx-topology-svg {
      width: 100%;
      height: 100%;
      display: block;
      overflow: visible;
    }

    /* Links Flow animations */
    .topology-link-path {
      transition: stroke 0.25s, stroke-width 0.25s;
    }
    .link-active-flow {
      stroke-dasharray: 6,4;
      animation: linkFlow 0.8s linear infinite;
    }
    @keyframes linkFlow {
      from { stroke-dashoffset: 20; }
      to { stroke-dashoffset: 0; }
    }

    /* Edge labels */
    .edge-label {
      font-size: 9px;
      fill: var(--text-secondary, #64748b);
      font-family: system-ui, sans-serif;
      pointer-events: none;
    }

    /* Nodes layout inside SVG foreignObject */
    .node-group {
      cursor: pointer;
      transition: transform 0.2s ease-out;
    }
    .node-backdrop {
      fill: #ffffff;
      stroke: #cbd5e1;
      stroke-width: 1.5px;
      transition: all 0.2s;
    }
    .node-group:hover .node-backdrop {
      stroke-width: 2px;
      filter: drop-shadow(0 8px 12px rgba(99,102,241,0.18));
    }
    .node-html-container {
      overflow: hidden;
      border-radius: 10px;
      pointer-events: none; /* Let clicks pass to the SVG parent <g> group */
    }

    /* Hover preview pill */
    .hover-preview-container {
      overflow: visible;
      pointer-events: none;
    }
    .hover-preview {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 8px;
      background: rgba(15, 23, 42, 0.88);
      backdrop-filter: blur(6px);
      border-radius: 10px;
      font-family: system-ui, sans-serif;
      pointer-events: none;
      white-space: nowrap;
      max-width: 100%;
    }
    .hover-preview-label {
      font-size: 11px;
      font-weight: 600;
      color: #f8fafc;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .hover-preview-badge {
      font-size: 8px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 1px 5px;
      border-radius: 6px;
      letter-spacing: 0.04em;
    }
    .badge-idle {
      background: #334155;
      color: #94a3b8;
    }
    .badge-thinking {
      background: rgba(99, 102, 241, 0.25);
      color: #a5b4fc;
    }
    .badge-success {
      background: rgba(34, 197, 94, 0.25);
      color: #86efac;
    }
    .badge-error {
      background: rgba(239, 68, 68, 0.25);
      color: #fca5a5;
    }

    /* Node card HTML states */
    .node-card {
      width: 100%;
      height: 100%;
      padding: 8px 10px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      font-family: system-ui, sans-serif;
    }
    .node-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }
    .node-type {
      font-size: 8px;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.05em;
    }
    .status-indicator {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #94a3b8;
    }
    .node-label {
      font-size: 11px;
      font-weight: 700;
      color: #0f172a;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .node-prompt-preview {
      font-size: 8px;
      color: #64748b;
      margin-top: 3px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Color variations based on Status */
    .node-card.thinking .status-indicator {
      background: #6366f1;
      box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7);
      animation: statusIndicatorPulse 1.2s infinite;
    }
    @keyframes statusIndicatorPulse {
      0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.5); }
      70% { box-shadow: 0 0 0 4px rgba(99, 102, 241, 0); }
      100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
    }
    .node-group.node-thinking .node-backdrop {
      stroke-width: 2px;
      filter: drop-shadow(0 4px 10px rgba(99, 102, 241, 0.15));
    }

    .node-card.success .status-indicator {
      background: #22c55e;
    }

    .node-card.error .status-indicator {
      background: #ef4444;
    }

    /* ── Node status transition animations ── */
    .node-status-thinking {
      animation: thinkingPulse 2s ease-in-out infinite;
    }
    @keyframes thinkingPulse {
      0%   { transform: var(--node-translate) scale(1); filter: drop-shadow(0 0 0 rgba(99,102,241,0)); }
      50%  { transform: var(--node-translate) scale(1.03); filter: drop-shadow(0 0 8px rgba(99,102,241,0.35)); }
      100% { transform: var(--node-translate) scale(1); filter: drop-shadow(0 0 0 rgba(99,102,241,0)); }
    }
    .node-status-success {
      animation: successFlash 0.6s ease-out 1;
    }
    @keyframes successFlash {
      0%   { filter: drop-shadow(0 0 0 rgba(34,197,94,0)); }
      30%  { filter: drop-shadow(0 0 10px rgba(34,197,94,0.5)); }
      100% { filter: drop-shadow(0 0 0 rgba(34,197,94,0)); }
    }
    .node-status-error {
      animation: errorShake 0.4s ease-in-out 1;
    }
    @keyframes errorShake {
      0%   { transform: var(--node-translate) translateX(0); }
      20%  { transform: var(--node-translate) translateX(-3px); }
      40%  { transform: var(--node-translate) translateX(3px); }
      60%  { transform: var(--node-translate) translateX(-2px); }
      80%  { transform: var(--node-translate) translateX(2px); }
      100% { transform: var(--node-translate) translateX(0); }
    }

    /* Header & Titles */
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .topology-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-primary, #1e293b);
    }
    .topology-subtitle {
      font-size: 11px;
      color: var(--text-secondary, #64748b);
      margin-top: 2px;
    }
    .highlight-val {
      font-weight: 700;
      color: #6366f1;
      font-family: monospace;
    }

    /* Actionable Tooltip Action Menu */
    .topology-tooltip {
      position: absolute;
      z-index: 100;
      background: var(--ngx-chart-tooltip-bg, rgba(15, 23, 42, 0.94));
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      color: var(--ngx-chart-tooltip-color, #f8fafc);
      padding: 12px 14px;
      border-radius: 12px;
      font-size: 11px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      transform: translate(-50%, -105%);
      width: 210px;
      pointer-events: auto;
      font-family: system-ui, sans-serif;
    }
    .tt-section {
      margin-top: 6px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .section-title {
      font-weight: 700;
      color: #38bdf8;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .section-content {
      margin: 0;
      color: rgba(248, 250, 252, 0.85);
      font-style: italic;
      font-family: monospace;
      font-size: 10px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .action-buttons-row {
      margin-top: 10px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      padding-top: 8px;
    }
    .action-btn {
      color: #ffffff;
      border: none;
      border-radius: 4px;
      padding: 5px 8px;
      font-size: 10px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.12s;
      width: 100%;
      text-align: left;
    }
    .action-btn.explain {
      background: #4f46e5;
    }
    .action-btn.explain:hover {
      background: #6366f1;
    }
    .action-btn.rerun {
      background: #334155;
    }
    .action-btn.rerun:hover {
      background: #475569;
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
    
    /* Zoom controls floating style */
    .zoom-controls {
      position: absolute;
      bottom: 12px;
      right: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 4px 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 10;
    }
    .zoom-controls button {
      background: rgba(255, 255, 255, 0.15);
      border: none;
      color: #ffffff;
      width: 24px;
      height: 24px;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      transition: background 0.15s;
    }
    .zoom-controls button:hover {
      background: rgba(255, 255, 255, 0.3);
    }
    .zoom-level {
      color: rgba(255, 255, 255, 0.85);
      font-size: 10px;
      font-weight: 600;
      font-family: monospace;
      padding-left: 4px;
      min-width: 32px;
      text-align: right;
    }
  `]
})
export class AgenticCognitiveTopologyComponent {
  nodes = input.required<TopologyNode[]>();
  links = input.required<TopologyLink[]>();
  width = input<number>(650);
  height = input<number>(450);
  colors = input<string[]>(CHART_COLORS);
  showExport = input<boolean>(true);

  nodeActionClick = output<{ nodeId: string; action: string }>();
  nodePositionChange = output<{ nodeId: string; x: number; y: number }>();

  // State
  exportMenuOpen = signal(false);
  tooltipData = signal<{ node: TopologyNode; screenX: number; screenY: number } | null>(null);

  // Hover preview state
  hoveredNodeId = signal<string | null>(null);

  // Drag-to-reposition state
  nodePositionOverrides = signal<Map<string, { x: number; y: number }>>(new Map());
  draggingNodeId = signal<string | null>(null);
  private dragOffsetX = 0;
  private dragOffsetY = 0;

  // Zoom & Pan State
  scale = signal<number>(1);
  translateX = signal<number>(0);
  translateY = signal<number>(0);
  isPanning = signal<boolean>(false);
  
  zoomPercent = computed(() => Math.round(this.scale() * 100));
  transformString = computed(() => `translate(${this.translateX()}px, ${this.translateY()}px) scale(${this.scale()})`);

  private startX = 0;
  private startY = 0;

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  // Node Dimensions
  nodeWidth = 135;
  nodeHeight = 55;

  /** Color map: maps lowercase node type string to a color from the colors input */
  private typeColorMap = computed<Map<string, string>>(() => {
    const rawNodes = this.nodes();
    const c = this.colors();
    const map = new Map<string, string>();
    let idx = 0;
    rawNodes.forEach(n => {
      const t = (n.type || 'agent').toLowerCase();
      if (!map.has(t)) {
        map.set(t, c[idx % c.length]);
        idx++;
      }
    });
    return map;
  });

  /** Status-based override colors (take priority over type colors) */
  private statusColorMap: Record<string, string> = {
    thinking: '#6366f1',
    success: '#22c55e',
    error: '#ef4444'
  };

  viewBoxString = computed(() => `0 0 ${this.width()} ${this.height()}`);

  constructor() {
    effect(() => {
      const svg = this.svgEl()?.nativeElement;
      if (!svg) return;

      const handler = (e: WheelEvent) => {
        this.onWheel(e);
      };

      // Register non-passive wheel event listener
      svg.addEventListener('wheel', handler, { passive: false });

      // Return cleanup function to remove listener on destroy/change
      return () => {
        svg.removeEventListener('wheel', handler);
      };
    });
  }

  activeAgentsCount = computed(() => {
    return this.nodes().filter(n => n.status !== 'idle').length;
  });

  // Balanced Layered DAG layout algorithm calculated in-component
  computedNodes = computed<ProcessedNode[]>(() => {
    const rawNodes = this.nodes();
    const rawLinks = this.links();
    const overrides = this.nodePositionOverrides();
    if (!rawNodes.length) return [];

    // Find links map
    const incomingCount: Record<string, number> = {};
    const outgoingMap: Record<string, string[]> = {};
    
    rawNodes.forEach(n => {
      incomingCount[n.id] = 0;
      outgoingMap[n.id] = [];
    });

    rawLinks.forEach(link => {
      if (incomingCount[link.target] !== undefined) incomingCount[link.target]++;
      if (outgoingMap[link.source] !== undefined) outgoingMap[link.source].push(link.target);
    });

    // BFS Topological level mapping with cycle detection
    const depthMap: Record<string, number> = {};
    const visited = new Set<string>();
    const queue: string[] = [];

    // Identify roots
    rawNodes.forEach(n => {
      if (incomingCount[n.id] === 0) {
        queue.push(n.id);
        depthMap[n.id] = 0;
      }
    });

    // Fallback if no root
    if (queue.length === 0 && rawNodes.length > 0) {
      queue.push(rawNodes[0].id);
      depthMap[rawNodes[0].id] = 0;
    }

    let maxDepth = 0;
    while (queue.length > 0) {
      const current = queue.shift()!;
      const curDepth = depthMap[current];

      // Cycle detection: skip if already fully visited at this or deeper depth
      if (visited.has(current)) {
        continue;
      }
      visited.add(current);
      
      const outgoing = outgoingMap[current] || [];
      outgoing.forEach(target => {
        const nextDepth = curDepth + 1;
        if (depthMap[target] === undefined || nextDepth > depthMap[target]) {
          // Check for back-edge cycle: target already visited at a shallower depth
          if (visited.has(target)) {
            console.warn(`[ngx-agentic-cognitive-topology] Cycle detected: ${current} → ${target}. Skipping re-traversal.`);
            return;
          }
          depthMap[target] = nextDepth;
          if (nextDepth > maxDepth) maxDepth = nextDepth;
          queue.push(target);
        }
      });
    }

    // Nodes grouped by depth level
    const depthGroups: Record<number, string[]> = {};
    for (let d = 0; d <= maxDepth; d++) {
      depthGroups[d] = [];
    }

    rawNodes.forEach(n => {
      const d = depthMap[n.id] ?? 0;
      if (depthGroups[d] === undefined) {
        depthGroups[d] = [];
      }
      depthGroups[d].push(n.id);
    });

    // Compute coordinates
    const computedNodesList: ProcessedNode[] = [];
    const w = this.width();
    const h = this.height();

    // Map each group horizontally/vertically
    // Let's do a top-to-bottom layout
    const levelsCount = maxDepth + 1;
    const paddingY = 40;
    const availableH = h - paddingY * 2;
    const levelSpacingY = levelsCount > 1 ? availableH / maxDepth : availableH;

    rawNodes.forEach(n => {
      // Check drag position overrides first
      const override = overrides.get(n.id);
      if (override) {
        computedNodesList.push({
          ...n,
          x: override.x,
          y: override.y,
          depth: depthMap[n.id] ?? 0
        });
        return;
      }

      // If coordinates are manually specified, respect them
      if (n.x !== undefined && n.y !== undefined) {
        computedNodesList.push({
          ...n,
          x: n.x,
          y: n.y,
          depth: depthMap[n.id] ?? 0
        });
        return;
      }

      const d = depthMap[n.id] ?? 0;
      const group = depthGroups[d] || [n.id];
      const indexInGroup = group.indexOf(n.id);
      const totalInGroup = group.length;

      // Vertical spacing Y
      const y = paddingY + d * levelSpacingY;

      // Horizontal layout X
      const availableW = w - 80;
      const xSpacing = totalInGroup > 1 ? availableW / (totalInGroup - 1) : availableW;
      const x = totalInGroup > 1 
        ? 40 + indexInGroup * xSpacing 
        : w / 2;

      computedNodesList.push({
        ...n,
        x,
        y,
        depth: d
      });
    });

    return computedNodesList;
  });

  computedLinks = computed(() => {
    const nodes = this.computedNodes();
    const rawLinks = this.links();
    const nodeMap = new Map<string, ProcessedNode>();
    nodes.forEach(n => nodeMap.set(n.id, n));

    return rawLinks.map(link => {
      const src = nodeMap.get(link.source);
      const dest = nodeMap.get(link.target);
      
      if (!src || !dest) {
        return {
          source: link.source,
          target: link.target,
          path: '',
          active: false,
          label: link.label,
          srcX: 0,
          srcY: 0,
          destX: 0,
          destY: 0,
          cp1X: 0,
          cp1Y: 0,
          cp2X: 0,
          cp2Y: 0
        };
      }

      // Dynamic ports selection based on closest Euclidean distance
      const w = this.nodeWidth;
      const h = this.nodeHeight;

      const srcPorts = [
        { x: src.x, y: src.y - h / 2, dir: [0, -1] }, // Top
        { x: src.x, y: src.y + h / 2, dir: [0, 1] },  // Bottom
        { x: src.x - w / 2, y: src.y, dir: [-1, 0] }, // Left
        { x: src.x + w / 2, y: src.y, dir: [1, 0] }   // Right
      ];

      const destPorts = [
        { x: dest.x, y: dest.y - h / 2, dir: [0, -1] }, // Top
        { x: dest.x, y: dest.y + h / 2, dir: [0, 1] },  // Bottom
        { x: dest.x - w / 2, y: dest.y, dir: [-1, 0] }, // Left
        { x: dest.x + w / 2, y: dest.y, dir: [1, 0] }   // Right
      ];

      let minDistance = Infinity;
      let bestSrc = srcPorts[1];  // Default bottom
      let bestDest = destPorts[0]; // Default top

      srcPorts.forEach(sp => {
        destPorts.forEach(dp => {
          const dx = dp.x - sp.x;
          const dy = dp.y - sp.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDistance) {
            minDistance = dist;
            bestSrc = sp;
            bestDest = dp;
          }
        });
      });

      const x1 = bestSrc.x;
      const y1 = bestSrc.y;
      const x2 = bestDest.x;
      const y2 = bestDest.y;

      const dx = Math.abs(x2 - x1);
      const dy = Math.abs(y2 - y1);
      const offset = Math.max(30, Math.min(100, Math.max(dx, dy) * 0.4));

      const cp1x = x1 + bestSrc.dir[0] * offset;
      const cp1y = y1 + bestSrc.dir[1] * offset;
      const cp2x = x2 + bestDest.dir[0] * offset;
      const cp2y = y2 + bestDest.dir[1] * offset;

      const path = `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;

      // A link is active if active === true OR source node is currently thinking
      const active = !!link.active || src.status === 'thinking';

      return {
        source: link.source,
        target: link.target,
        path,
        active,
        label: link.label,
        srcX: x1,
        srcY: y1,
        destX: x2,
        destY: y2,
        cp1X: cp1x,
        cp1Y: cp1y,
        cp2X: cp2x,
        cp2Y: cp2y
      };
    });
  });

  onNodeClick(node: TopologyNode, event: MouseEvent): void {
    event.stopPropagation();
    
    // Position tooltip right above or below node card, transformed by current scale and translation
    const svg = this.svgEl()?.nativeElement;
    if (!svg) return;
    const currentScale = this.scale();
    const screenX = (node.x ?? this.width() / 2) * currentScale + this.translateX();
    const screenY = ((node.y ?? this.height() / 2) - this.nodeHeight / 2) * currentScale + this.translateY();

    this.tooltipData.set({
      node,
      screenX,
      screenY
    });
  }

  onCanvasClick(): void {
    this.closeTooltip();
  }

  closeTooltip(): void {
    this.tooltipData.set(null);
  }

  triggerAction(action: string, nodeId: string): void {
    this.nodeActionClick.emit({ nodeId, action });
    this.closeTooltip();
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
    const payload = { nodes: this.nodes(), links: this.links() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'topology-flow-data.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToCsv(): void {
    let csv = 'Source,Target,Active\n';
    this.links().forEach(l => {
      csv += `"${l.source}","${l.target}",${!!l.active}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'topology-flow-data.csv');
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
    link.setAttribute('download', 'cognitive-topology.svg');
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

  // ── Color helpers ──

  /** Returns the border color for a node, based on status (priority) or type (from colors input) */
  getNodeBorderColor(node: ProcessedNode): string {
    // Status colors take priority
    if (node.status !== 'idle' && this.statusColorMap[node.status]) {
      return this.statusColorMap[node.status];
    }
    // Fall back to type-based color from the colors input
    const t = (node.type || 'agent').toLowerCase();
    return this.typeColorMap().get(t) ?? '#cbd5e1';
  }

  // ── Edge label midpoint helpers (cubic Bézier midpoint at t=0.5) ──

  getMidpointX(link: { srcX: number; destX: number; cp1X: number; cp2X: number }): number {
    const t = 0.5;
    const x0 = link.srcX;
    const x1 = link.cp1X;
    const x2 = link.cp2X;
    const x3 = link.destX;
    // B(t) = (1-t)^3*P0 + 3*(1-t)^2*t*P1 + 3*(1-t)*t^2*P2 + t^3*P3
    return Math.pow(1-t,3)*x0 + 3*Math.pow(1-t,2)*t*x1 + 3*(1-t)*Math.pow(t,2)*x2 + Math.pow(t,3)*x3;
  }

  getMidpointY(link: { srcY: number; destY: number; cp1Y: number; cp2Y: number }): number {
    const t = 0.5;
    const y0 = link.srcY;
    const y1 = link.cp1Y;
    const y2 = link.cp2Y;
    const y3 = link.destY;
    return Math.pow(1-t,3)*y0 + 3*Math.pow(1-t,2)*t*y1 + 3*(1-t)*Math.pow(t,2)*y2 + Math.pow(t,3)*y3;
  }

  // ── Node drag-to-reposition ──

  onNodeMouseDown(node: ProcessedNode, event: MouseEvent): void {
    if (event.button !== 0) return;
    event.stopPropagation();
    event.preventDefault();

    const svg = this.svgEl()?.nativeElement;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();

    const currentScale = this.scale();
    // Convert client coords to SVG-space coords
    const svgX = (event.clientX - rect.left - this.translateX()) / currentScale;
    const svgY = (event.clientY - rect.top - this.translateY()) / currentScale;

    this.dragOffsetX = svgX - node.x;
    this.dragOffsetY = svgY - node.y;
    this.draggingNodeId.set(node.id);
  }

  // Zoom & Pan Mouse Interaction Event Handlers
  onMouseDown(event: MouseEvent): void {
    // Only drag panning with left click
    if (event.button !== 0) return;

    // If a node drag is in progress, don't start panning
    if (this.draggingNodeId()) return;
    
    // Ignore drags that originate on buttons, tooltips, or node cards
    const target = event.target as HTMLElement;
    if (target.closest('.node-group') || target.closest('.topology-tooltip') || target.closest('.zoom-controls') || target.closest('.chart-export-menu')) {
      return;
    }

    event.preventDefault();
    this.isPanning.set(true);
    this.startX = event.clientX - this.translateX();
    this.startY = event.clientY - this.translateY();
  }

  onMouseMove(event: MouseEvent): void {
    // Node dragging takes priority over canvas panning
    const dragId = this.draggingNodeId();
    if (dragId) {
      const svg = this.svgEl()?.nativeElement;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const currentScale = this.scale();
      const svgX = (event.clientX - rect.left - this.translateX()) / currentScale;
      const svgY = (event.clientY - rect.top - this.translateY()) / currentScale;

      const newX = svgX - this.dragOffsetX;
      const newY = svgY - this.dragOffsetY;

      const current = new Map(this.nodePositionOverrides());
      current.set(dragId, { x: newX, y: newY });
      this.nodePositionOverrides.set(current);
      return;
    }

    if (!this.isPanning()) return;
    this.translateX.set(event.clientX - this.startX);
    this.translateY.set(event.clientY - this.startY);
  }

  onMouseUp(): void {
    const dragId = this.draggingNodeId();
    if (dragId) {
      const pos = this.nodePositionOverrides().get(dragId);
      if (pos) {
        this.nodePositionChange.emit({ nodeId: dragId, x: pos.x, y: pos.y });
      }
      this.draggingNodeId.set(null);
      return;
    }
    this.isPanning.set(false);
  }

  onMouseLeave(): void {
    if (this.draggingNodeId()) {
      const dragId = this.draggingNodeId()!;
      const pos = this.nodePositionOverrides().get(dragId);
      if (pos) {
        this.nodePositionChange.emit({ nodeId: dragId, x: pos.x, y: pos.y });
      }
      this.draggingNodeId.set(null);
    }
    this.isPanning.set(false);
    this.hoveredNodeId.set(null);
  }

  onWheel(event: WheelEvent): void {
    event.preventDefault();
    const zoomFactor = 1.15;
    let newScale = this.scale();
    if (event.deltaY < 0) {
      newScale *= zoomFactor;
    } else {
      newScale /= zoomFactor;
    }
    
    // Boundary constraints: min 0.3x, max 3.0x zoom
    newScale = Math.max(0.3, Math.min(3, newScale));
    
    const svg = this.svgEl()?.nativeElement;
    if (svg) {
      const rect = svg.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      
      const currentScale = this.scale();
      const svgX = (mouseX - this.translateX()) / currentScale;
      const svgY = (mouseY - this.translateY()) / currentScale;
      
      this.scale.set(newScale);
      this.translateX.set(mouseX - svgX * newScale);
      this.translateY.set(mouseY - svgY * newScale);
    } else {
      this.scale.set(newScale);
    }
  }

  zoomIn(): void {
    const nextScale = Math.min(3, this.scale() * 1.2);
    this.scale.set(nextScale);
  }

  zoomOut(): void {
    const nextScale = Math.max(0.3, this.scale() / 1.2);
    this.scale.set(nextScale);
  }

  resetZoom(): void {
    this.scale.set(1);
    this.translateX.set(0);
    this.translateY.set(0);
  }
}
