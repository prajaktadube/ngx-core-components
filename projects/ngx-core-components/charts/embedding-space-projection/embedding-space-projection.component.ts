import {
  Component, input, output, signal, computed, ChangeDetectionStrategy,
  ElementRef, viewChild, HostListener, effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CHART_COLORS } from '../shared/chart-utils';

export interface EmbeddingPoint {
  id: string;
  x: number;
  y: number;
  group?: string;
  label?: string;
}

@Component({
  selector: 'ngx-embedding-space-projection',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-embedding-wrapper">
      <div class="chart-header" (mousemove)="$event.stopPropagation()">
        <div class="chart-title-space">
          <div class="projection-title">Embedding Space Projection</div>
          <div class="projection-subtitle">
            Total Vectors: <span class="highlight-val">{{ data().length }}</span> |
            Lasso Selected: <span class="highlight-val">{{ selectedIds().length }}</span>
          </div>
        </div>
        <div class="action-buttons">
          <button class="clear-lasso-btn" [disabled]="selectedIds().length === 0" (click)="clearSelection()">
            🧹 Clear Lasso
          </button>
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
      </div>

      <div class="ngx-embedding-container" [style.height.px]="height()">
        <!-- SVG Canvas with Lasso drag handles -->
        <svg
          #svgEl
          class="ngx-embedding-svg"
          [attr.viewBox]="viewBoxString()"
          [attr.height]="height()"
          (mousedown)="onMouseDown($event)"
          (mousemove)="onMouseMove($event)"
          (mouseup)="onMouseUp($event)"
          (mouseleave)="onMouseLeave()"
        >
          <g [attr.transform]="zoomTransform()">
            <!-- Grid Background lines -->
            <line [attr.x1]="0" [attr.x2]="width()" [attr.y1]="height() / 2" [attr.y2]="height() / 2" class="axis-line" />
            <line [attr.x1]="width() / 2" [attr.x2]="width() / 2" [attr.y1]="0" [attr.y2]="height()" class="axis-line" />

            <!-- X-axis tick labels -->
            @for (tick of xTicks(); track tick.value) {
              <line [attr.x1]="tick.pos" [attr.x2]="tick.pos" [attr.y1]="height() - padding + 2" [attr.y2]="height() - padding + 6" class="axis-tick" />
              <text [attr.x]="tick.pos" [attr.y]="height() - padding + 16" class="axis-label" text-anchor="middle">{{ tick.label }}</text>
            }

            <!-- Y-axis tick labels -->
            @for (tick of yTicks(); track tick.value) {
              <line [attr.x1]="padding - 6" [attr.x2]="padding - 2" [attr.y1]="tick.pos" [attr.y2]="tick.pos" class="axis-tick" />
              <text [attr.x]="padding - 9" [attr.y]="tick.pos" class="axis-label" text-anchor="end" dominant-baseline="middle">{{ tick.label }}</text>
            }

            <!-- Batched SVG Paths grouped by color group -->
            @for (grpPath of batchedGroupPaths(); track grpPath.group) {
              <path
                [attr.d]="grpPath.path"
                [attr.fill]="grpPath.color"
                class="batched-dots-path"
              />
            }

            <!-- Individually rendered circles only for lasso selected/highlighted points (to allow individual styles) -->
            @for (pt of selectedPoints(); track pt.id) {
              <circle
                [attr.cx]="pt.screenX"
                [attr.cy]="pt.screenY"
                [attr.r]="dotRadius() + 1.5"
                [attr.fill]="pt.color"
                class="selected-dot-ring"
              />
              <circle
                [attr.cx]="pt.screenX"
                [attr.cy]="pt.screenY"
                [attr.r]="dotRadius()"
                [attr.fill]="pt.color"
                stroke="#ffffff"
                stroke-width="1.2"
              />
            }

            <!-- Clicked point persistent highlight ring -->
            @if (clickedPointData(); as cp) {
              <circle
                [attr.cx]="cp.screenX"
                [attr.cy]="cp.screenY"
                r="10"
                fill="none"
                stroke="#f59e0b"
                stroke-width="2"
                stroke-dasharray="3,2"
                class="clicked-dot-ring"
              />
              <circle
                [attr.cx]="cp.screenX"
                [attr.cy]="cp.screenY"
                [attr.r]="dotRadius() + 1"
                [attr.fill]="cp.color"
                stroke="#f59e0b"
                stroke-width="1.5"
              />
            }

            <!-- Single hovered dot highlight ring -->
            @if (hoveredPoint(); as hp) {
              <circle
                [attr.cx]="hp.screenX"
                [attr.cy]="hp.screenY"
                r="7"
                [attr.fill]="hp.color"
                fill-opacity="0.3"
                class="hovered-dot-pulse"
              />
              <circle
                [attr.cx]="hp.screenX"
                [attr.cy]="hp.screenY"
                [attr.r]="dotRadius() + 1"
                [attr.fill]="hp.color"
                stroke="#ffffff"
                stroke-width="1.5"
              />
            }

            <!-- Lasso Polygon overlay -->
            @if (lassoPath().length > 1) {
              <polygon
                [attr.points]="lassoPolygonPoints()"
                class="lasso-overlay"
              />
              <path
                [attr.d]="lassoLinePath()"
                class="lasso-outline"
              />
            }
          </g>
        </svg>

        <!-- Cluster Legend -->
        @if (showLegend() && groups().length > 0) {
          <div class="embedding-legend">
            @for (group of groups(); track group; let i = $index) {
              <div class="legend-item">
                <span class="legend-dot" [style.background]="colors()[i % colors().length]"></span>
                <span class="legend-label">{{ group }}</span>
              </div>
            }
          </div>
        }

        <!-- Floating Zoom Controls -->
        <div class="zoom-controls" (click)="$event.stopPropagation()">
          <button (click)="zoomIn()" title="Zoom In">➕</button>
          <button (click)="zoomOut()" title="Zoom Out">➖</button>
          <button (click)="resetZoom()" title="Reset">🔄</button>
          <span class="zoom-level">{{ zoomPercent() }}%</span>
        </div>

        <!-- Tooltip overlay -->
        @if (hoveredPoint(); as hp) {
          <div
            class="projection-tooltip"
            [style.left.px]="hp.screenX * scale() + translateX()"
            [style.top.px]="hp.screenY * scale() + translateY()"
          >
            <div class="tt-cat">{{ hp.label || 'Vector ID: ' + hp.id }}</div>
            <div class="tt-row">
              <span class="tt-dot" [style.background]="hp.color"></span>
              <span class="tt-name">Cluster</span>
              <span class="tt-val">{{ hp.group || 'None' }}</span>
            </div>
            <div class="tt-row">
              <span class="tt-name">Coords</span>
              <span class="tt-val">({{ hp.x.toFixed(2) }}, {{ hp.y.toFixed(2) }})</span>
            </div>
            <div class="tt-row action-row">
              <button class="tt-action-btn" (click)="onExplainCluster(hp)">
                Ask Agent to Explain Cluster
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
    .ngx-embedding-wrapper {
      width: 100%;
      height: 100%;
      padding: 16px 20px;
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 12px;
      box-shadow: var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05));
      position: relative;
    }
    .ngx-embedding-container {
      position: relative;
      width: 100%;
      overflow: hidden;
    }
    .ngx-embedding-svg {
      width: 100%;
      height: 100%;
      display: block;
      overflow: visible;
      user-select: none;
      -webkit-user-select: none;
    }
    .axis-line {
      stroke: var(--ngx-chart-grid, #f1f5f9);
      stroke-width: 1px;
    }
    .axis-tick {
      stroke: var(--ngx-chart-grid, #94a3b8);
      stroke-width: 1px;
    }
    .axis-label {
      font-size: 9px;
      font-family: monospace;
      fill: var(--ngx-chart-axis-text, #64748b);
    }
    .batched-dots-path {
      opacity: 0.65;
      transition: opacity 0.25s;
    }
    .batched-dots-path:hover {
      opacity: 0.8;
    }
    .selected-dot-ring {
      stroke: rgba(99, 102, 241, 0.6);
      stroke-width: 1.5px;
      fill: none;
    }
    .clicked-dot-ring {
      animation: clickedRingSpin 3s linear infinite;
    }
    @keyframes clickedRingSpin {
      from { stroke-dashoffset: 0; }
      to { stroke-dashoffset: 20; }
    }
    .hovered-dot-pulse {
      pointer-events: none;
      animation: pulseHover 1.2s infinite alternate;
    }
    @keyframes pulseHover {
      from { r: 5px; fill-opacity: 0.2; }
      to { r: 9px; fill-opacity: 0.5; }
    }

    /* Lasso style */
    .lasso-overlay {
      fill: rgba(99, 102, 241, 0.08);
      pointer-events: none;
    }
    .lasso-outline {
      stroke: #4f46e5;
      stroke-width: 1.5px;
      stroke-dasharray: 4,3;
      fill: none;
      pointer-events: none;
    }

    /* Header & Action bar */
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .projection-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-primary, #1e293b);
    }
    .projection-subtitle {
      font-size: 11px;
      color: var(--text-secondary, #64748b);
      margin-top: 2px;
    }
    .highlight-val {
      font-weight: 700;
      color: #6366f1;
      font-family: monospace;
    }
    .action-buttons {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .clear-lasso-btn {
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .clear-lasso-btn:not([disabled]):hover {
      background: #cbd5e1;
      color: #0f172a;
    }
    .clear-lasso-btn[disabled] {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Glassmorphic Tooltip styling */
    .projection-tooltip {
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
      min-width: 170px;
      pointer-events: auto;
    }
    .tt-cat {
      font-weight: 700;
      margin-bottom: 6px;
      font-size: 12px;
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

    /* Cluster Legend */
    .embedding-legend {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 8px;
      padding: 8px 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      z-index: 10;
      max-height: 180px;
      overflow-y: auto;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .legend-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .legend-label {
      font-size: 10px;
      font-weight: 600;
      color: rgba(248, 250, 252, 0.9);
      white-space: nowrap;
      font-family: system-ui, sans-serif;
    }

    /* Zoom controls floating style */
    .zoom-controls {
      position: absolute;
      bottom: 8px;
      right: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
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
export class EmbeddingSpaceProjectionComponent {
  data = input.required<EmbeddingPoint[]>();
  width = input<number>(600);
  height = input<number>(400);
  colors = input<string[]>(CHART_COLORS);
  showExport = input<boolean>(true);
  showLegend = input<boolean>(true);
  dotRadius = input<number>(3.5);

  lassoSelected = output<string[]>();
  agentQueryRequest = output<{ selectedIds: string[]; queryType: string }>();
  pointClick = output<EmbeddingPoint>();

  // Signals
  selectedIds = signal<string[]>([]);
  lassoPath = signal<[number, number][]>([]);
  hoveredIndex = signal<number | null>(null);
  exportMenuOpen = signal(false);
  isDragging = signal<boolean>(false);
  clickedPointIndex = signal<number | null>(null);

  // Zoom & Pan state
  scale = signal<number>(1);
  translateX = signal<number>(0);
  translateY = signal<number>(0);
  isPanning = signal<boolean>(false);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  private panStartX = 0;
  private panStartY = 0;
  private dragStartX = 0;
  private dragStartY = 0;
  padding = 20;

  viewBoxString = computed(() => `0 0 ${this.width()} ${this.height()}`);
  zoomPercent = computed(() => Math.round(this.scale() * 100));
  zoomTransform = computed(() => `translate(${this.translateX()}, ${this.translateY()}) scale(${this.scale()})`);

  constructor() {
    effect(() => {
      const svg = this.svgEl()?.nativeElement;
      if (!svg) return;

      const handler = (e: WheelEvent) => this.onWheel(e);
      svg.addEventListener('wheel', handler, { passive: false });

      return () => svg.removeEventListener('wheel', handler);
    });
  }

  // Calculate global coordinate bounds
  private bounds = computed(() => {
    const pts = this.data();
    if (!pts.length) return { minX: -1, maxX: 1, minY: -1, maxY: 1 };
    const xs = pts.map(p => p.x);
    const ys = pts.map(p => p.y);
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys)
    };
  });

  // Unique groups for mapping colors
  groups = computed(() => {
    const pts = this.data();
    const grps = Array.from(new Set(pts.map(p => p.group).filter(Boolean)));
    return grps as string[];
  });

  // X-axis tick values
  xTicks = computed(() => {
    const b = this.bounds();
    const w = this.width();
    const pad = this.padding;
    const tickCount = 5;
    const ticks: { value: number; pos: number; label: string }[] = [];
    const rangeX = b.maxX - b.minX || 1;
    for (let i = 0; i < tickCount; i++) {
      const frac = i / (tickCount - 1);
      const value = b.minX + frac * rangeX;
      const pos = pad + frac * (w - pad * 2);
      ticks.push({ value, pos, label: value.toFixed(1) });
    }
    return ticks;
  });

  // Y-axis tick values
  yTicks = computed(() => {
    const b = this.bounds();
    const h = this.height();
    const pad = this.padding;
    const tickCount = 5;
    const ticks: { value: number; pos: number; label: string }[] = [];
    const rangeY = b.maxY - b.minY || 1;
    for (let i = 0; i < tickCount; i++) {
      const frac = i / (tickCount - 1);
      const value = b.minY + frac * rangeY;
      // Invert Y: low data value at bottom (high screen Y), high data value at top (low screen Y)
      const pos = h - (pad + frac * (h - pad * 2));
      ticks.push({ value, pos, label: value.toFixed(1) });
    }
    return ticks;
  });

  // Calculate screen relative positions
  transformedPoints = computed(() => {
    const pts = this.data();
    const b = this.bounds();
    const w = this.width();
    const h = this.height();
    const pad = this.padding;
    const grps = this.groups();
    const colors = this.colors();

    const rangeX = b.maxX - b.minX || 1;
    const rangeY = b.maxY - b.minY || 1;

    return pts.map((p, idx) => {
      const screenX = pad + ((p.x - b.minX) / rangeX) * (w - pad * 2);
      const screenY = h - (pad + ((p.y - b.minY) / rangeY) * (h - pad * 2)); // invert Y axis

      let colorIndex = 0;
      if (p.group) {
        colorIndex = grps.indexOf(p.group) % colors.length;
      }
      const color = colors[colorIndex] || colors[0];

      return {
        ...p,
        screenX,
        screenY,
        color,
        index: idx
      };
    });
  });

  // SVG Path Batching logic - compiles thousands of dots into a single path per group
  batchedGroupPaths = computed(() => {
    const pts = this.transformedPoints();
    const grps = this.groups();
    const colors = this.colors();
    const r = this.dotRadius();

    // Setup map
    const pathsMap: Record<string, string[]> = { 'default': [] };
    grps.forEach(g => pathsMap[g] = []);

    pts.forEach(p => {
      // SVG command to draw a circle of radius r around (cx, cy):
      // Move to cx + r, cy, then draw two semicircles
      const cx = p.screenX;
      const cy = p.screenY;
      const cmd = `M ${cx} ${cy} m -${r} 0 a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 -${r * 2} 0`;

      const key = p.group || 'default';
      pathsMap[key].push(cmd);
    });

    const result = Object.keys(pathsMap).map(key => {
      const grpIndex = grps.indexOf(key);
      const color = key === 'default' ? colors[0] : (colors[grpIndex % colors.length] || colors[0]);
      return {
        group: key,
        color,
        path: pathsMap[key].join(' ')
      };
    });

    return result.filter(r => r.path.trim().length > 0);
  });

  selectedPoints = computed(() => {
    const sIds = new Set(this.selectedIds());
    return this.transformedPoints().filter(p => sIds.has(p.id));
  });

  hoveredPoint = computed(() => {
    const idx = this.hoveredIndex();
    if (idx === null) return null;
    const pts = this.transformedPoints();
    return idx >= 0 && idx < pts.length ? pts[idx] : null;
  });

  clickedPointData = computed(() => {
    const idx = this.clickedPointIndex();
    if (idx === null) return null;
    const pts = this.transformedPoints();
    return idx >= 0 && idx < pts.length ? pts[idx] : null;
  });

  lassoPolygonPoints = computed(() => {
    return this.lassoPath().map(p => `${p[0]},${p[1]}`).join(' ');
  });

  lassoLinePath = computed(() => {
    const path = this.lassoPath();
    if (path.length < 2) return '';
    return path.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ') + ' Z';
  });

  clearSelection(): void {
    this.selectedIds.set([]);
    this.lassoPath.set([]);
    this.lassoSelected.emit([]);
  }

  onMouseDown(event: MouseEvent): void {
    // Only handle left click
    if (event.button !== 0) return;

    const svg = this.svgEl()?.nativeElement;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Record drag start position for click-vs-drag detection
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;

    // Alt+click = pan mode
    if (event.altKey) {
      event.preventDefault();
      this.isPanning.set(true);
      this.panStartX = event.clientX - this.translateX();
      this.panStartY = event.clientY - this.translateY();
      return;
    }

    // Normal left click = lasso mode
    this.isDragging.set(true);
    this.lassoPath.set([[x, y]]);
  }

  onMouseMove(event: MouseEvent): void {
    const svg = this.svgEl()?.nativeElement;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Pan mode
    if (this.isPanning()) {
      this.translateX.set(event.clientX - this.panStartX);
      this.translateY.set(event.clientY - this.panStartY);
      return;
    }

    if (this.isDragging()) {
      const current = this.lassoPath();
      this.lassoPath.set([...current, [x, y]]);
    } else {
      // Compute hovered point (account for zoom transform)
      const pts = this.transformedPoints();
      const currentScale = this.scale();
      const tx = this.translateX();
      const ty = this.translateY();
      let minDistance = 15; // Hover range
      let nearestIdx: number | null = null;
      pts.forEach((p, idx) => {
        const screenPtX = p.screenX * currentScale + tx;
        const screenPtY = p.screenY * currentScale + ty;
        const dx = screenPtX - x;
        const dy = screenPtY - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDistance) {
          minDistance = dist;
          nearestIdx = idx;
        }
      });
      this.hoveredIndex.set(nearestIdx);
    }
  }

  onMouseUp(event: MouseEvent): void {
    // End panning
    if (this.isPanning()) {
      this.isPanning.set(false);
      return;
    }

    if (!this.isDragging()) return;
    this.isDragging.set(false);

    // Determine if this was a click (tiny drag distance) vs a real lasso drag
    const dx = event.clientX - this.dragStartX;
    const dy = event.clientY - this.dragStartY;
    const dragDistance = Math.sqrt(dx * dx + dy * dy);

    if (dragDistance < 5) {
      // This was a single click — attempt point selection
      this.lassoPath.set([]);
      const svg = this.svgEl()?.nativeElement;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const pts = this.transformedPoints();
      const currentScale = this.scale();
      const tx = this.translateX();
      const ty = this.translateY();
      let minDist = 15;
      let nearestIdx: number | null = null;

      pts.forEach((p, idx) => {
        const screenPtX = p.screenX * currentScale + tx;
        const screenPtY = p.screenY * currentScale + ty;
        const ddx = screenPtX - x;
        const ddy = screenPtY - y;
        const dist = Math.sqrt(ddx * ddx + ddy * ddy);
        if (dist < minDist) {
          minDist = dist;
          nearestIdx = idx;
        }
      });

      if (nearestIdx !== null) {
        this.clickedPointIndex.set(nearestIdx);
        const pt = pts[nearestIdx];
        this.pointClick.emit({
          id: pt.id,
          x: pt.x,
          y: pt.y,
          group: pt.group,
          label: pt.label
        });
      } else {
        // Clicked empty space — clear clicked point
        this.clickedPointIndex.set(null);
      }
      return;
    }

    // Real lasso drag — determine points inside the polygon
    const poly = this.lassoPath();
    if (poly.length < 3) {
      this.lassoPath.set([]);
      return;
    }

    const selected: string[] = [];
    const pts = this.transformedPoints();
    pts.forEach(p => {
      if (this.isPointInPolygon([p.screenX, p.screenY], poly)) {
        selected.push(p.id);
      }
    });

    this.selectedIds.set(selected);
    this.lassoSelected.emit(selected);
  }

  onMouseLeave(): void {
    if (this.isDragging()) {
      this.isDragging.set(false);
      this.lassoPath.set([]);
    }
    if (this.isPanning()) {
      this.isPanning.set(false);
    }
    this.hoveredIndex.set(null);
  }

  // Ray casting point-in-polygon implementation
  private isPointInPolygon(pt: [number, number], poly: [number, number][]): boolean {
    const x = pt[0], y = pt[1];
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0], yi = poly[i][1];
      const xj = poly[j][0], yj = poly[j][1];
      const intersect = ((yi > y) !== (yj > y))
          && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  onExplainCluster(hp: any): void {
    const ids = this.selectedIds().length > 0 ? this.selectedIds() : [hp.id];
    this.agentQueryRequest.emit({
      selectedIds: ids,
      queryType: 'explain_cluster'
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

  // Zoom & Pan
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

  exportToJson(): void {
    const blob = new Blob([JSON.stringify(this.data(), null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'embedding-projection-data.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToCsv(): void {
    let csv = 'ID,X,Y,Group,Label\n';
    this.data().forEach(p => {
      csv += `"${p.id}",${p.x},${p.y},"${p.group || ''}","${p.label || ''}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'embedding-projection-data.csv');
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
    link.setAttribute('download', 'embedding-projection.svg');
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
