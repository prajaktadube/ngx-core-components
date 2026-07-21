import {
  Component, input, output, signal, computed, ChangeDetectionStrategy,
  ElementRef, viewChild, HostListener, effect, inject
} from '@angular/core';
import { CommonModule, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CHART_COLORS } from '../shared/chart-utils';
import { ChartExportService } from '../shared/chart-export.service';
import { ChartExportMenuComponent } from '../shared/chart-export-menu.component';
import type { ExportFormat } from '../shared/chart-export-menu.component';

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
  imports: [CommonModule, UpperCasePipe, FormsModule, ChartExportMenuComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-topology-wrapper">
      <div class="chart-header" (mousemove)="$event.stopPropagation()" (mouseleave)="closeTooltip()">
        <div class="chart-title-space">
          <div class="topology-title">Agentic Cognitive Topology (DAG)</div>
          <div class="topology-subtitle">
            Active Agents: <span class="highlight-val">{{ activeAgentsCount() }}</span> / {{ effectiveNodes().length }}
          </div>
        </div>
        @if (showExport()) {
          <ngx-chart-export-menu (exportClicked)="onExport($event)" />
        }
      </div>

      <!-- Editor Toolbar (Renders in Edit Mode) -->
      @if (editable()) {
        <div class="editor-toolbar">
          <div class="toolbar-section">
            <button class="tb-btn primary" (click)="addNode()" title="Add Node">➕ Add Agent</button>
            <span class="tb-divider"></span>
            <button class="tb-btn" [disabled]="undoStack().length === 0" (click)="undo()" title="Undo (Ctrl+Z)">↩️ Undo ({{ undoStack().length }})</button>
            <button class="tb-btn" [disabled]="redoStack().length === 0" (click)="redo()" title="Redo (Ctrl+Y)">↪️ Redo ({{ redoStack().length }})</button>
            <span class="tb-divider"></span>
            <button class="tb-btn" [class.active]="snapToGridActive()" (click)="snapToGridActive.set(!snapToGridActive())" title="Toggle Snap to Grid">
              🧲 Snap ({{ gridSize() }}px)
            </button>
            <button class="tb-btn" (click)="autoLayout()" title="Rearrange Nodes Automatically">
              🔀 Rearrange
            </button>
          </div>
          <div class="toolbar-section">
            <button class="tb-btn" (click)="exportWorkflowSchema()" title="Copy Workflow JSON Schema">📋 Copy JSON Flow</button>
            
            <div class="validation-badge" [class.valid]="validationReport().isValid">
              @if (validationReport().isValid) {
                ✅ DAG Solid
              } @else {
                ⚠️ Warning: 
                @if (validationReport().hasCycles) { Cycle detected! }
                @if (validationReport().orphans.length > 0) { Isolated nodes present! }
              }
            </div>
          </div>
        </div>
      }

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
          [style.cursor]="draggingNodeId() ? 'grabbing' : isPanning() ? 'grabbing' : activePortDrag() ? 'crosshair' : 'grab'"
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

              <!-- Link Delete Button (Renders in Edit Mode) -->
              @if (editable()) {
                <g class="link-delete-btn" [attr.transform]="'translate(' + getMidpointX(link) + ',' + getMidpointY(link) + ')'" (click)="deleteLink(link.source, link.target, $event)">
                  <circle r="7" fill="#ef4444" stroke="#ffffff" stroke-width="1.2" />
                  <text text-anchor="middle" dominant-baseline="middle" fill="#ffffff" font-size="8" font-weight="900" y="-0.5">×</text>
                </g>
              } @else if (link.label) {
                <!-- Optional edge label -->
                <text
                  class="edge-label"
                  [attr.x]="getMidpointX(link)"
                  [attr.y]="getMidpointY(link)"
                  text-anchor="middle"
                  dominant-baseline="middle"
                >{{ link.label }}</text>
              }
            }

            <!-- Temporary connector drawing edge (renders when dragging a port link) -->
            @if (temporaryDragLinkPath()) {
              <path [attr.d]="temporaryDragLinkPath()" class="temporary-drag-link" fill="none" />
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
                (dblclick)="onNodeDblClick(node, $event)"
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

                <!-- Connection Ports Handles (Renders in Edit Mode) -->
                @if (editable()) {
                  <circle cx="67.5" cy="0" r="4" class="connection-port top" (mousedown)="onPortMouseDown(node, [0, -1], $event)" title="Drag connection" />
                  <circle cx="67.5" cy="55" r="4" class="connection-port bottom" (mousedown)="onPortMouseDown(node, [0, 1], $event)" title="Drag connection" />
                  <circle cx="0" cy="27.5" r="4" class="connection-port left" (mousedown)="onPortMouseDown(node, [-1, 0], $event)" title="Drag connection" />
                  <circle cx="135" cy="27.5" r="4" class="connection-port right" (mousedown)="onPortMouseDown(node, [1, 0], $event)" title="Drag connection" />

                  <!-- Node Delete Badge -->
                  <g class="node-delete-btn" transform="translate(132, 3)" (click)="deleteNode(node.id, $event)">
                    <circle r="6" fill="#ef4444" stroke="#ffffff" stroke-width="1" />
                    <text text-anchor="middle" dominant-baseline="middle" fill="#ffffff" font-size="8" font-weight="900" y="-0.5">×</text>
                  </g>
                }

                <!-- Hover preview pill -->
                @if (!editable() && hoveredNodeId() === node.id && !tooltipData()) {
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

        <!-- Glassmorphic Property Editor Modal -->
        @if (activeEditingNode(); as node) {
          <div class="modal-backdrop" (click)="activeEditingNode.set(null)">
            <div class="modal-card" (click)="$event.stopPropagation()">
              <div class="modal-header">
                <h3>Edit Agent Node</h3>
                <button class="modal-close" (click)="activeEditingNode.set(null)">×</button>
              </div>
              <div class="modal-body">
                <div class="form-group">
                  <label>Agent Label</label>
                  <input type="text" [(ngModel)]="node.label" placeholder="Enter label..." />
                </div>
                <div class="form-row">
                  <div class="form-group half">
                    <label>Type</label>
                    <select [(ngModel)]="node.type">
                      <option value="orchestrator">Orchestrator</option>
                      <option value="agent">Agent</option>
                      <option value="tool">Tool</option>
                      <option value="critic">Critic</option>
                    </select>
                  </div>
                  <div class="form-group half">
                    <label>Status</label>
                    <select [(ngModel)]="node.status">
                      <option value="idle">Idle</option>
                      <option value="thinking">Thinking</option>
                      <option value="success">Success</option>
                      <option value="error">Error</option>
                    </select>
                  </div>
                </div>
                <div class="form-group">
                  <label>Prompt Template</label>
                  <textarea [(ngModel)]="node.prompt" rows="3" placeholder="Define agent prompt rules..."></textarea>
                </div>
                <div class="form-group">
                  <label>Latest Response</label>
                  <textarea [(ngModel)]="node.response" rows="3" placeholder="Mock agent response..."></textarea>
                </div>
              </div>
              <div class="modal-footer">
                <button class="btn btn-secondary" (click)="activeEditingNode.set(null)">Cancel</button>
                <button class="btn btn-primary" (click)="saveNodeEdit()">Save Changes</button>
              </div>
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

    /* Link Delete circles in Edit Mode */
    .link-delete-btn {
      cursor: pointer;
      opacity: 0.8;
      transition: opacity 0.15s;
    }
    .link-delete-btn:hover {
      opacity: 1;
    }
    .link-delete-btn circle {
      transition: r 0.15s ease, fill 0.15s ease;
    }
    .link-delete-btn:hover circle {
      r: 9;
      fill: #dc2626;
    }

    /* SVG temporary connecting drag link */
    .temporary-drag-link {
      stroke: #f97316;
      stroke-width: 2;
      stroke-dasharray: 4,4;
      pointer-events: none;
    }

    /* Connection ports inside SVG node group */
    .connection-port {
      fill: #ffffff;
      stroke: #4f46e5;
      stroke-width: 1.5;
      cursor: crosshair;
      transition: r 0.15s, fill 0.15s;
    }
    .connection-port:hover {
      r: 6.5;
      fill: #4f46e5;
    }

    /* Node delete badges */
    .node-delete-btn {
      cursor: pointer;
      opacity: 0.8;
      transition: opacity 0.15s;
    }
    .node-delete-btn:hover {
      opacity: 1;
    }
    .node-delete-btn circle {
      transition: r 0.15s ease, fill 0.15s ease;
    }
    .node-delete-btn:hover circle {
      r: 8.5;
      fill: #dc2626;
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

    /* Node status transition animations */
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

    /* Interactive editor toolbar styles */
    .editor-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(241, 245, 249, 0.7);
      backdrop-filter: blur(8px);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 10px;
      padding: 8px 14px;
      margin-bottom: 14px;
      gap: 12px;
      flex-wrap: wrap;
    }
    .toolbar-section {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .tb-btn {
      padding: 6px 12px;
      font-size: 11px;
      font-weight: 600;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      color: #334155;
      cursor: pointer;
      transition: all 0.15s;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .tb-btn:hover:not(:disabled) {
      background: #f8fafc;
      border-color: #94a3b8;
    }
    .tb-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .tb-btn.primary {
      background: #4f46e5;
      color: #ffffff;
      border-color: #4f46e5;
    }
    .tb-btn.primary:hover:not(:disabled) {
      background: #4338ca;
    }
    .tb-btn.active {
      background: #e0e7ff;
      border-color: #6366f1;
      color: #4f46e5;
    }
    .tb-divider {
      height: 16px;
      width: 1px;
      background: #cbd5e1;
    }
    .validation-badge {
      font-size: 11px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 6px;
      background: #fee2e2;
      color: #ef4444;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .validation-badge.valid {
      background: #dcfce7;
      color: #15803d;
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
    .tt-cat {
      font-weight: 700;
      margin-bottom: 6px;
      font-size: 12px;
      color: #38bdf8;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      padding-bottom: 4px;
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

    /* Frosted glass Modal editor styling */
    .modal-backdrop {
      position: fixed;
      top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 1000;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .modal-card {
      background: var(--ngx-chart-bg, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 16px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      width: 90%;
      max-width: 440px;
      padding: 24px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 16px;
      animation: modalAppear 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes modalAppear {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 12px;
    }
    .modal-header h3 {
      margin: 0;
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
    }
    .modal-close {
      background: none;
      border: none;
      font-size: 22px;
      color: #64748b;
      cursor: pointer;
    }
    .modal-body {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .form-group label {
      font-size: 10px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .form-group input, .form-group select, .form-group textarea {
      padding: 8px 12px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 12px;
      font-family: inherit;
      color: #0f172a;
      outline: none;
      background: #ffffff;
      transition: border-color 0.15s;
    }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
      border-color: #6366f1;
    }
    .form-row {
      display: flex;
      gap: 12px;
    }
    .form-group.half {
      flex: 1;
    }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      border-top: 1px solid #e2e8f0;
      padding-top: 14px;
    }
    .btn {
      padding: 8px 16px;
      font-size: 11px;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.15s;
    }
    .btn-secondary {
      background: #ffffff;
      border-color: #cbd5e1;
      color: #334155;
    }
    .btn-secondary:hover {
      background: #f1f5f9;
    }
    .btn-primary {
      background: #4f46e5;
      color: #ffffff;
    }
    .btn-primary:hover {
      background: #4338ca;
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
  private readonly exportSvc = inject(ChartExportService);
  nodes = input.required<TopologyNode[]>();
  links = input.required<TopologyLink[]>();
  width = input<number>(650);
  height = input<number>(450);
  colors = input<string[]>(CHART_COLORS);
  showExport = input<boolean>(true);

  // Interactive Editor Inputs
  editable = input<boolean>(false);
  gridSize = input<number>(20);

  nodeActionClick = output<{ nodeId: string; action: string }>();
  nodePositionChange = output<{ nodeId: string; x: number; y: number }>();
  
  // Interactive Editor Outputs
  nodesChange = output<TopologyNode[]>();
  linksChange = output<TopologyLink[]>();
  validationError = output<string>();

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
  transformString = computed(() => `translate(${this.translateX()}, ${this.translateY()}) scale(${this.scale()})`);

  private startX = 0;
  private startY = 0;

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  // Node Dimensions
  nodeWidth = 135;
  nodeHeight = 55;

  // Interactive Editor State Signals
  activeEditingNode = signal<TopologyNode | null>(null);
  activePortDrag = signal<{ nodeId: string; portX: number; portY: number; dir: [number, number] } | null>(null);
  portDragCurrentMouse = signal<{ x: number; y: number } | null>(null);
  snapToGridActive = signal<boolean>(true);
  
  undoStack = signal<{
    addedNodes: TopologyNode[];
    deletedNodeIds: Set<string>;
    editedNodesMap: Map<string, TopologyNode>;
    addedLinks: TopologyLink[];
    deletedLinks: Set<string>;
    nodePositionOverrides: Map<string, { x: number; y: number }>;
  }[]>([]);
  redoStack = signal<{
    addedNodes: TopologyNode[];
    deletedNodeIds: Set<string>;
    editedNodesMap: Map<string, TopologyNode>;
    addedLinks: TopologyLink[];
    deletedLinks: Set<string>;
    nodePositionOverrides: Map<string, { x: number; y: number }>;
  }[]>([]);

  // Functional Overrides to avoid syncing state anomalies
  addedNodes = signal<TopologyNode[]>([]);
  deletedNodeIds = signal<Set<string>>(new Set());
  editedNodesMap = signal<Map<string, TopologyNode>>(new Map());
  addedLinks = signal<TopologyLink[]>([]);
  deletedLinks = signal<Set<string>>(new Set());

  // Merge functional state signals reactively
  effectiveNodes = computed(() => {
    const base = this.nodes();
    const added = this.addedNodes();
    const deleted = this.deletedNodeIds();
    const edited = this.editedNodesMap();

    let combined = [...base, ...added];
    combined = combined.filter(n => !deleted.has(n.id));
    combined = combined.map(n => edited.has(n.id) ? edited.get(n.id)! : n);
    return combined;
  });

  effectiveLinks = computed(() => {
    const base = this.links();
    const added = this.addedLinks();
    const deleted = this.deletedLinks();
    const deletedNodes = this.deletedNodeIds();

    let combined = [...base, ...added];
    combined = combined.filter(l => !deleted.has(`${l.source}-${l.target}`));
    combined = combined.filter(l => !deletedNodes.has(l.source) && !deletedNodes.has(l.target));
    return combined;
  });

  /** Color map: maps lowercase node type string to a color from the colors input */
  private typeColorMap = computed<Map<string, string>>(() => {
    const rawNodes = this.effectiveNodes();
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
    return this.effectiveNodes().filter(n => n.status !== 'idle').length;
  });

  // Balanced Layered DAG layout algorithm calculated in-component
  computedNodes = computed<ProcessedNode[]>(() => {
    const rawNodes = this.effectiveNodes();
    const rawLinks = this.effectiveLinks();
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
    const rawLinks = this.effectiveLinks();
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

  // SVG port connection path trace (Cubic bezier curved connector from port center to mouse)
  temporaryDragLinkPath = computed(() => {
    const drag = this.activePortDrag();
    const mouse = this.portDragCurrentMouse();
    if (!drag || !mouse) return '';
    const x1 = drag.portX;
    const y1 = drag.portY;
    const x2 = mouse.x;
    const y2 = mouse.y;
    const cp1x = x1 + drag.dir[0] * 60;
    const cp1y = y1 + drag.dir[1] * 60;
    return `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp1x} ${cp1y}, ${x2} ${y2}`;
  });

  // Validation report generator
  validationReport = computed(() => {
    const nodes = this.effectiveNodes();
    const links = this.effectiveLinks();
    
    const incoming: Record<string, number> = {};
    const outgoing: Record<string, number> = {};
    nodes.forEach(n => {
      incoming[n.id] = 0;
      outgoing[n.id] = 0;
    });
    
    links.forEach(l => {
      if (incoming[l.target] !== undefined) incoming[l.target]++;
      if (outgoing[l.source] !== undefined) outgoing[l.source]++;
    });

    const orphans = nodes.filter(n => incoming[n.id] === 0 && outgoing[n.id] === 0).map(n => n.id);
    const hasCycles = this.detectCyclesGlobal();

    return {
      orphans,
      hasCycles,
      isValid: orphans.length === 0 && !hasCycles
    };
  });

  onNodeClick(node: TopologyNode, event: MouseEvent): void {
    if (this.editable()) return; // Don't trigger action tooltip menu in edit mode
    event.stopPropagation();
    
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

  onExport(type: ExportFormat): void {
    if (type === 'json') this.exportToJson();
    else if (type === 'csv') this.exportToCsv();
    else if (type === 'svg') this.exportToSvg();
    else if (type === 'pdf') this.exportToPdf();
  }

  exportToJson(): void {
    const payload = { nodes: this.effectiveNodes(), links: this.effectiveLinks() };
    this.exportSvc.downloadJson(payload, 'topology-flow-data.json');
  }

  exportToCsv(): void {
    const links = this.effectiveLinks();
    if (!links.length) return;
    const headers = ['Source', 'Target', 'Active'];
    const rows = links.map(l => [l.source, l.target, !!l.active ? 'true' : 'false']);
    this.exportSvc.downloadCsv(headers, rows, 'topology-flow-data.csv');
  }

  exportToSvg(): void {
    this.exportSvc.downloadSvg(this.svgEl()?.nativeElement, 'cognitive-topology.svg');
  }

  exportToPdf(): void {
    this.exportSvc.downloadPdf(this.svgEl()?.nativeElement, 'Chart Export', 'cognitive-topology.pdf');
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

  // ── Undo/Redo & State History Snapshots ──

  saveHistory(): void {
    const snapshot = {
      addedNodes: [...this.addedNodes()],
      deletedNodeIds: new Set(this.deletedNodeIds()),
      editedNodesMap: new Map(this.editedNodesMap()),
      addedLinks: [...this.addedLinks()],
      deletedLinks: new Set(this.deletedLinks()),
      nodePositionOverrides: new Map(this.nodePositionOverrides())
    };
    this.undoStack.update(stack => [...stack, snapshot]);
    this.redoStack.set([]); // Clear redo stack on new action
  }

  applySnapshot(snap: any): void {
    this.addedNodes.set(snap.addedNodes);
    this.deletedNodeIds.set(snap.deletedNodeIds);
    this.editedNodesMap.set(snap.editedNodesMap);
    this.addedLinks.set(snap.addedLinks);
    this.deletedLinks.set(snap.deletedLinks);
    this.nodePositionOverrides.set(snap.nodePositionOverrides);

    // Emit changes to parent
    this.nodesChange.emit(this.effectiveNodes());
    this.linksChange.emit(this.effectiveLinks());
  }

  undo(): void {
    const stack = this.undoStack();
    if (stack.length === 0) return;
    
    // Save current state to redo stack
    const current = {
      addedNodes: [...this.addedNodes()],
      deletedNodeIds: new Set(this.deletedNodeIds()),
      editedNodesMap: new Map(this.editedNodesMap()),
      addedLinks: [...this.addedLinks()],
      deletedLinks: new Set(this.deletedLinks()),
      nodePositionOverrides: new Map(this.nodePositionOverrides())
    };
    this.redoStack.update(rStack => [...rStack, current]);

    const previous = stack[stack.length - 1];
    this.undoStack.set(stack.slice(0, -1));
    this.applySnapshot(previous);
  }

  redo(): void {
    const rStack = this.redoStack();
    if (rStack.length === 0) return;

    // Save current state to undo stack
    const current = {
      addedNodes: [...this.addedNodes()],
      deletedNodeIds: new Set(this.deletedNodeIds()),
      editedNodesMap: new Map(this.editedNodesMap()),
      addedLinks: [...this.addedLinks()],
      deletedLinks: new Set(this.deletedLinks()),
      nodePositionOverrides: new Map(this.nodePositionOverrides())
    };
    this.undoStack.update(stack => [...stack, current]);

    const next = rStack[rStack.length - 1];
    this.redoStack.set(rStack.slice(0, -1));
    this.applySnapshot(next);
  }

  // Keyboard shortcut listener
  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (!this.editable()) return;
    
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }

    if (event.ctrlKey || event.metaKey) {
      if (event.key.toLowerCase() === 'z') {
        event.preventDefault();
        this.undo();
      } else if (event.key.toLowerCase() === 'y') {
        event.preventDefault();
        this.redo();
      }
    }
  }

  autoLayout(): void {
    this.saveHistory();
    this.nodePositionOverrides.set(new Map());
    
    // Clear manual x,y on any added nodes so they layout topological
    this.addedNodes.update(nodes => nodes.map(n => {
      const { x, y, ...rest } = n;
      return rest;
    }));

    this.nodesChange.emit(this.effectiveNodes());
  }

  addNode(): void {
    this.saveHistory();
    const nextId = 'node_' + Math.random().toString(36).substring(2, 8);
    const newNode: TopologyNode = {
      id: nextId,
      label: 'New Agent',
      status: 'idle',
      type: 'agent',
      prompt: '',
      response: '',
      x: this.width() / 2 - this.translateX(),
      y: this.height() / 2 - this.translateY()
    };
    
    // Snapped default positioning
    const overrides = new Map(this.nodePositionOverrides());
    let x = newNode.x!;
    let y = newNode.y!;
    if (this.snapToGridActive()) {
      const grid = this.gridSize();
      x = Math.round(x / grid) * grid;
      y = Math.round(y / grid) * grid;
    }
    overrides.set(nextId, { x, y });
    this.nodePositionOverrides.set(overrides);

    this.addedNodes.update(nodes => [...nodes, newNode]);
    this.nodesChange.emit(this.effectiveNodes());
  }

  deleteNode(nodeId: string, event: MouseEvent): void {
    event.stopPropagation();
    this.saveHistory();
    
    const overrides = new Map(this.nodePositionOverrides());
    overrides.delete(nodeId);
    this.nodePositionOverrides.set(overrides);

    this.deletedNodeIds.update(set => {
      const copy = new Set(set);
      copy.add(nodeId);
      return copy;
    });

    this.nodesChange.emit(this.effectiveNodes());
    this.linksChange.emit(this.effectiveLinks());
  }

  deleteLink(source: string, target: string, event: MouseEvent): void {
    event.stopPropagation();
    this.saveHistory();

    const linkKey = `${source}-${target}`;
    this.deletedLinks.update(set => {
      const copy = new Set(set);
      copy.add(linkKey);
      return copy;
    });

    // Also remove from addedLinks if present
    this.addedLinks.update(links => links.filter(l => !(l.source === source && l.target === target)));

    this.linksChange.emit(this.effectiveLinks());
  }

  onNodeDblClick(node: TopologyNode, event: MouseEvent): void {
    if (!this.editable()) return;
    event.stopPropagation();
    this.activeEditingNode.set({ ...node });
  }

  saveNodeEdit(): void {
    const edited = this.activeEditingNode();
    if (!edited) return;
    this.saveHistory();

    this.editedNodesMap.update(map => {
      const copy = new Map(map);
      copy.set(edited.id, edited);
      return copy;
    });

    this.activeEditingNode.set(null);
    this.nodesChange.emit(this.effectiveNodes());
  }

  // ── Drag connection drawing logic ──

  onPortMouseDown(node: ProcessedNode, dir: [number, number], event: MouseEvent): void {
    if (!this.editable()) return;
    event.stopPropagation();
    event.preventDefault();
    
    const w = this.nodeWidth;
    const h = this.nodeHeight;
    let portX = node.x;
    let portY = node.y;
    if (dir[0] === 0 && dir[1] === -1) { portY -= h/2; }
    else if (dir[0] === 0 && dir[1] === 1) { portY += h/2; }
    else if (dir[0] === -1 && dir[1] === 0) { portX -= w/2; }
    else if (dir[0] === 1 && dir[1] === 0) { portX += w/2; }

    this.activePortDrag.set({
      nodeId: node.id,
      portX,
      portY,
      dir
    });
    this.portDragCurrentMouse.set({ x: portX, y: portY });
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
    
    const svgX = (event.clientX - rect.left - this.translateX()) / currentScale;
    const svgY = (event.clientY - rect.top - this.translateY()) / currentScale;

    this.dragOffsetX = svgX - node.x;
    this.dragOffsetY = svgY - node.y;
    this.draggingNodeId.set(node.id);
    
    // Save history point before dragging start
    if (this.editable()) {
      this.saveHistory();
    }
  }

  // Zoom & Pan Mouse Interaction Event Handlers
  onMouseDown(event: MouseEvent): void {
    if (event.button !== 0) return;
    if (this.draggingNodeId() || this.activePortDrag()) return;
    
    const target = event.target as HTMLElement;
    if (target.closest('.node-group') || target.closest('.topology-tooltip') || target.closest('.zoom-controls') || target.closest('.chart-export-menu') || target.closest('.editor-toolbar') || target.closest('.modal-card')) {
      return;
    }

    event.preventDefault();
    this.isPanning.set(true);
    this.startX = event.clientX - this.translateX();
    this.startY = event.clientY - this.translateY();
  }

  onMouseMove(event: MouseEvent): void {
    const dragId = this.draggingNodeId();
    const portDrag = this.activePortDrag();

    if (dragId) {
      const svg = this.svgEl()?.nativeElement;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const currentScale = this.scale();
      const svgX = (event.clientX - rect.left - this.translateX()) / currentScale;
      const svgY = (event.clientY - rect.top - this.translateY()) / currentScale;

      const newX = svgX - this.dragOffsetX;
      const newY = svgY - this.dragOffsetY;

      let x = newX;
      let y = newY;
      if (this.editable() && this.snapToGridActive()) {
        const grid = this.gridSize();
        x = Math.round(newX / grid) * grid;
        y = Math.round(newY / grid) * grid;
      }

      const current = new Map(this.nodePositionOverrides());
      current.set(dragId, { x, y });
      this.nodePositionOverrides.set(current);
      return;
    }

    if (portDrag) {
      const svg = this.svgEl()?.nativeElement;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const currentScale = this.scale();
      const svgX = (event.clientX - rect.left - this.translateX()) / currentScale;
      const svgY = (event.clientY - rect.top - this.translateY()) / currentScale;

      this.portDragCurrentMouse.set({ x: svgX, y: svgY });
      return;
    }

    if (!this.isPanning()) return;
    this.translateX.set(event.clientX - this.startX);
    this.translateY.set(event.clientY - this.startY);
  }

  onMouseUp(): void {
    const dragId = this.draggingNodeId();
    const portDrag = this.activePortDrag();

    if (dragId) {
      const pos = this.nodePositionOverrides().get(dragId);
      if (pos) {
        this.nodePositionChange.emit({ nodeId: dragId, x: pos.x, y: pos.y });
      }
      this.draggingNodeId.set(null);
      return;
    }

    if (portDrag) {
      const targetId = this.hoveredNodeId();
      const sourceId = portDrag.nodeId;
      
      if (targetId && targetId !== sourceId) {
        const introducesCycle = this.checkCycle(targetId, sourceId); // Cycles check
        const alreadyConnected = this.effectiveLinks().some(l => l.source === sourceId && l.target === targetId);

        if (alreadyConnected) {
          this.validationError.emit(`Connection already exists between ${sourceId} and ${targetId}.`);
        } else if (introducesCycle) {
          this.validationError.emit(`Cannot connect: introducing a cyclic dependency.`);
        } else {
          this.saveHistory();
          const newLink: TopologyLink = {
            source: sourceId,
            target: targetId,
            active: false
          };
          this.addedLinks.update(links => [...links, newLink]);
          this.linksChange.emit(this.effectiveLinks());
        }
      }
      this.activePortDrag.set(null);
      this.portDragCurrentMouse.set(null);
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
    this.activePortDrag.set(null);
    this.portDragCurrentMouse.set(null);
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

  // ── DAG Helper validations ──

  checkCycle(start: string, target: string): boolean {
    const links = this.effectiveLinks();
    const adj: Record<string, string[]> = {};
    this.effectiveNodes().forEach(n => adj[n.id] = []);
    links.forEach(l => {
      if (adj[l.source]) adj[l.source].push(l.target);
    });
    
    const queue = [start];
    const visited = new Set<string>();
    while (queue.length > 0) {
      const cur = queue.shift()!;
      if (cur === target) return true;
      if (visited.has(cur)) continue;
      visited.add(cur);
      const neighbors = adj[cur] || [];
      for (const n of neighbors) {
        if (!visited.has(n)) {
          queue.push(n);
        }
      }
    }
    return false;
  }

  detectCyclesGlobal(): boolean {
    const nodes = this.effectiveNodes();
    const links = this.effectiveLinks();
    const adj: Record<string, string[]> = {};
    nodes.forEach(n => adj[n.id] = []);
    links.forEach(l => {
      if (adj[l.source]) adj[l.source].push(l.target);
    });

    const visited = new Set<string>();
    const recStack = new Set<string>();

    const dfs = (nodeId: string): boolean => {
      if (recStack.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;

      visited.add(nodeId);
      recStack.add(nodeId);

      const neighbors = adj[nodeId] || [];
      for (const neighbor of neighbors) {
        if (dfs(neighbor)) return true;
      }

      recStack.delete(nodeId);
      return false;
    };

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        if (dfs(node.id)) return true;
      }
    }
    return false;
  }

  exportWorkflowSchema(): void {
    const payload = {
      schemaVersion: "1.0.0",
      description: "Cognitive workflow schema exported from ngx-agentic-cognitive-topology",
      graph: {
        nodes: this.effectiveNodes().map(n => ({
          id: n.id,
          label: n.label,
          type: n.type || 'agent',
          metadata: {
            prompt: n.prompt || '',
            response: n.response || ''
          }
        })),
        edges: this.effectiveLinks().map(l => ({
          source: l.source,
          target: l.target,
          label: l.label || ''
        }))
      }
    };

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
        .then(() => this.validationError.emit("Workflow schema copied to clipboard!"))
        .catch(() => console.error("Clipboard copy failed"));
    }
  }
}
