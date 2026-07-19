import {
  Component, input, output, signal, computed, ChangeDetectionStrategy,
  ElementRef, viewChild, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { smoothPath, niceTicks, fmtNum } from '../shared/chart-utils';

@Component({
  selector: 'ngx-token-streaming-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-token-stream-wrapper">
      <div class="chart-header" (mousemove)="$event.stopPropagation()">
        <div class="chart-title-space">
          <div class="stream-title">
            <span class="pulse-indicator"></span>
            {{ title() }}
          </div>
          <div class="stream-subtitle">
            TPS: <span class="highlight-val">{{ currentTps() }}</span> | Total Tokens: <span class="highlight-val">{{ points().length }}</span>
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

      <div class="ngx-token-stream-container" [style.height.px]="height()">
        <svg
          #svgEl
          class="ngx-token-stream-svg"
          [attr.viewBox]="viewBoxString()"
          [attr.height]="height()"
          preserveAspectRatio="none"
          (mousemove)="onMouseMove($event)"
          (mouseleave)="hoveredIndex.set(null)"
        >
          <!-- Grid Lines (Horizontal) -->
          @for (yVal of gridYLines(); track yVal) {
            <line
              [attr.x1]="viewBoxX()"
              [attr.x2]="viewBoxX() + chartWidth"
              [attr.y1]="yVal"
              [attr.y2]="yVal"
              class="grid-line"
            />
          }

          <!-- Y-axis tick labels -->
          @for (tick of yAxisTicks(); track tick.val) {
            <text
              [attr.x]="viewBoxX() - 2"
              [attr.y]="tick.y"
              class="axis-label"
              text-anchor="end"
              dominant-baseline="middle"
            >{{ tick.label }}</text>
          }

          <!-- X-axis tick labels -->
          @for (tick of xAxisTicks(); track tick.index) {
            <text
              [attr.x]="tick.x"
              [attr.y]="height() - 2"
              class="axis-label"
              text-anchor="middle"
              dominant-baseline="auto"
            >{{ tick.index }}</text>
          }

          <!-- Threshold line -->
          @if (threshold() !== null) {
            <line
              [attr.x1]="viewBoxX()"
              [attr.x2]="viewBoxX() + chartWidth"
              [attr.y1]="thresholdY()"
              [attr.y2]="thresholdY()"
              class="threshold-line"
            />
            <text
              [attr.x]="viewBoxX() + chartWidth + 4"
              [attr.y]="thresholdY()"
              class="threshold-label"
              dominant-baseline="middle"
            >{{ threshold() }}</text>
          }

          <!-- Area under path (linear gradient) -->
          <defs>
            <linearGradient [attr.id]="'stream-area-grad-' + instanceId" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" [attr.stop-color]="colors()[0]" stop-opacity="0.25" />
              <stop offset="100%" [attr.stop-color]="colors()[0]" stop-opacity="0" />
            </linearGradient>
          </defs>

          @if (points().length > 1) {
            <!-- Shaded Area -->
            <path
              [attr.d]="areaPath()"
              [attr.fill]="'url(#stream-area-grad-' + instanceId + ')'"
              stroke="none"
            />
            
            <!-- Stroke Path -->
            <path
              [attr.d]="linePath()"
              [attr.stroke]="colors()[0]"
              stroke-width="2.5"
              fill="none"
              stroke-linejoin="round"
              stroke-linecap="round"
            />
          }

          <!-- Guide / Tracker elements -->
          @if (activePoint(); as ap) {
            <line
              [attr.x1]="ap.x"
              [attr.x2]="ap.x"
              [attr.y1]="0"
              [attr.y2]="height()"
              class="tracker-guide-line"
            />
            <circle
              [attr.cx]="ap.x"
              [attr.cy]="ap.y"
              r="6"
              [attr.fill]="colors()[0]"
              fill-opacity="0.3"
              class="tracker-glowing-ring"
            />
            <circle
              [attr.cx]="ap.x"
              [attr.cy]="ap.y"
              r="3"
              [attr.fill]="colors()[0]"
              stroke="#ffffff"
              stroke-width="1"
            />
          }
        </svg>

        <!-- Glassmorphic Tooltip -->
        @if (activePoint(); as ap) {
          <div
            class="stream-tooltip"
            [style.left.px]="ap.screenX"
            [style.top.px]="ap.screenY"
          >
            <div class="tt-cat">Token #{{ ap.index + 1 }}</div>
            <div class="tt-row">
              <span class="tt-dot" [style.background]="colors()[0]"></span>
              <span class="tt-name">Speed / Value</span>
              <span class="tt-val">{{ ap.val.toFixed(1) }} ms/tok</span>
            </div>
            <div class="tt-row action-row">
              <button class="tt-action-btn" (click)="onTooltipAction(ap.index, ap.val)">
                Ask Agent to Analyze
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
    .ngx-token-stream-wrapper {
      width: 100%;
      height: 100%;
      padding: 16px 20px;
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 12px;
      box-shadow: var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05));
      position: relative;
    }
    .ngx-token-stream-container {
      position: relative;
      width: 100%;
      overflow: hidden;
    }
    .ngx-token-stream-svg {
      width: 100%;
      height: 100%;
      display: block;
      overflow: visible;
      cursor: crosshair;
    }
    .grid-line {
      stroke: var(--ngx-chart-grid, #e2e8f0);
      stroke-width: 1px;
      stroke-dasharray: 4,4;
    }
    .axis-label {
      font-size: 9px;
      fill: var(--ngx-chart-axis-text, #94a3b8);
      font-family: monospace;
    }
    .threshold-line {
      stroke: #ef4444;
      stroke-width: 1.5px;
      stroke-dasharray: 6,3;
      stroke-opacity: 0.8;
    }
    .threshold-label {
      font-size: 9px;
      fill: #ef4444;
      font-family: monospace;
      font-weight: 600;
    }
    .tracker-guide-line {
      stroke: rgba(99, 102, 241, 0.4);
      stroke-width: 1px;
      stroke-dasharray: 2,2;
      pointer-events: none;
    }
    .tracker-glowing-ring {
      pointer-events: none;
      animation: ringPulse 1.2s infinite alternate;
    }
    @keyframes ringPulse {
      from { r: 5px; fill-opacity: 0.2; }
      to { r: 8px; fill-opacity: 0.5; }
    }
    
    /* Header and Subtitles */
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .stream-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-primary, #1e293b);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .stream-subtitle {
      font-size: 11px;
      color: var(--text-secondary, #64748b);
      margin-top: 2px;
    }
    .highlight-val {
      font-weight: 700;
      color: #6366f1;
      font-family: monospace;
    }
    .pulse-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #22c55e;
      box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
      }
      70% {
        transform: scale(1);
        box-shadow: 0 0 0 6px rgba(34, 197, 94, 0);
      }
      100% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
      }
    }

    /* Glassmorphic Tooltip styling */
    .stream-tooltip {
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
      min-width: 150px;
      pointer-events: auto; /* Enable buttons inside tooltip */
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
  `]
})
export class TokenStreamingChartComponent {
  title = input<string>('Real-Time Token Stream');
  windowSize = input<number>(50);
  height = input<number>(300);
  colors = input<string[]>(['#4a90d9', '#ff6358', '#27ae60', '#f39c12', '#8e44ad', '#1abc9c', '#e74c3c', '#3498db', '#2ecc71', '#e67e22']);
  showExport = input<boolean>(true);
  threshold = input<number | null>(null);

  streamTick = output<{ index: number; value: number }>();
  agentPromptRequest = output<{ index: number; value: number; prompt: string }>();

  // State signals
  points = signal<number[]>([]);
  currentTps = signal<number>(0);
  hoveredIndex = signal<number | null>(null);
  exportMenuOpen = signal(false);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  // Unique instance ID for gradient references (avoids DOM collisions with multiple instances)
  readonly instanceId = Math.random().toString(36).substring(2, 8);

  // Dimensions
  private readonly leftPad = 38;
  private readonly bottomPad = 18;
  chartWidth = 600;
  stepWidth = 12; // Distance between consecutive points on x-axis

  // Grid helper
  gridYLines = computed(() => {
    const h = this.height();
    return [h * 0.25, h * 0.5, h * 0.75];
  });

  // Calculate sliding viewBox position to keep latest point visible
  viewBoxX = computed(() => {
    const n = this.points().length;
    const maxVisible = this.windowSize();
    if (n <= maxVisible) return -this.leftPad;
    return (n - maxVisible) * this.stepWidth - this.leftPad;
  });

  viewBoxString = computed(() => {
    return `${this.viewBoxX()} 0 ${this.chartWidth + this.leftPad} ${this.height() + this.bottomPad}`;
  });

  // Scale Y to fits bounds
  private yMin = computed(() => {
    const pts = this.points();
    if (!pts.length) return 0;
    return Math.min(...pts, 0);
  });

  private yMax = computed(() => {
    const pts = this.points();
    if (!pts.length) return 100;
    return Math.max(...pts, 50);
  });

  // Convert points to coordinate pairs
  scaledPoints = computed<[number, number][]>(() => {
    const pts = this.points();
    const min = this.yMin();
    const max = this.yMax();
    const range = max - min || 1;
    const h = this.height();

    return pts.map((v, i) => {
      const x = i * this.stepWidth;
      const y = h - ((v - min) / range) * (h - 10) - 5;
      return [x, y];
    });
  });

  linePath = computed(() => {
    const pts = this.scaledPoints();
    if (pts.length < 2) return '';
    return smoothPath(pts);
  });

  areaPath = computed(() => {
    const pts = this.scaledPoints();
    if (pts.length < 2) return '';
    const last = pts[pts.length - 1];
    const first = pts[0];
    const bottom = this.height();
    return smoothPath(pts) + ` L ${last[0]} ${bottom} L ${first[0]} ${bottom} Z`;
  });

  // Y-axis tick labels
  yAxisTicks = computed(() => {
    const min = this.yMin();
    const max = this.yMax();
    const range = max - min || 1;
    const h = this.height();
    const ticks = niceTicks(min, max, 5);
    return ticks.map(val => ({
      val,
      label: fmtNum(val),
      y: h - ((val - min) / range) * (h - 10) - 5
    }));
  });

  // X-axis tick labels (every 10th token)
  xAxisTicks = computed(() => {
    const n = this.points().length;
    const ticks: { index: number; x: number }[] = [];
    for (let i = 0; i < n; i += 10) {
      ticks.push({ index: i, x: i * this.stepWidth });
    }
    return ticks;
  });

  // Threshold Y coordinate
  thresholdY = computed(() => {
    const t = this.threshold();
    if (t === null) return 0;
    const min = this.yMin();
    const max = this.yMax();
    const range = max - min || 1;
    const h = this.height();
    return h - ((t - min) / range) * (h - 10) - 5;
  });

  activePoint = computed(() => {
    const idx = this.hoveredIndex();
    if (idx === null) return null;
    const pts = this.scaledPoints();
    const rawVal = this.points()[idx];
    if (idx >= 0 && idx < pts.length) {
      const pt = pts[idx];
      // Convert SVG coordinates to container relative screen positions for custom tooltip
      const svg = this.svgEl()?.nativeElement;
      if (!svg) return null;
      
      const svgWidth = svg.clientWidth || this.chartWidth;
      const svgHeight = svg.clientHeight || this.height();
      
      // Calculate where this point is within the current visible viewbox
      const startX = this.viewBoxX();
      const xRatio = (pt[0] - startX) / this.chartWidth;
      const yRatio = pt[1] / this.height();

      return {
        index: idx,
        val: rawVal,
        x: pt[0],
        y: pt[1],
        screenX: xRatio * svgWidth,
        screenY: yRatio * svgHeight
      };
    }
    return null;
  });

  constructor() {
    // Populate some initial simulated data if none is provided
    const initData = [20, 25, 30, 28, 35, 45, 52, 48, 55, 60];
    this.points.set(initData);
    this.currentTps.set(38.5);
  }

  // Public API method to append dynamic points in real-time
  appendPoint(val: number): void {
    const current = this.points();
    this.points.set([...current, val]);
    
    // Simulate updating Tokens Per Second
    const tps = Math.round((40 + Math.random() * 20 - (val / 15)) * 10) / 10;
    this.currentTps.set(tps > 5 ? tps : 5);

    this.streamTick.emit({ index: current.length, value: val });
  }

  // Public API: replace all points at once
  setPoints(newPoints: number[]): void {
    this.points.set(newPoints);
  }

  // Public API: clear all data
  clearPoints(): void {
    this.points.set([]);
    this.currentTps.set(0);
  }

  onMouseMove(event: MouseEvent): void {
    const svg = this.svgEl()?.nativeElement;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const svgWidth = rect.width || 1;

    // Map screen X back to viewBox coordinates
    const startX = this.viewBoxX();
    const viewBoxX = startX + (screenX / svgWidth) * this.chartWidth;

    // Find nearest point index
    const n = this.points().length;
    if (n === 0) return;
    const nearestIdx = Math.max(0, Math.min(n - 1, Math.round(viewBoxX / this.stepWidth)));
    this.hoveredIndex.set(nearestIdx);
  }

  onTooltipAction(index: number, value: number): void {
    this.agentPromptRequest.emit({
      index,
      value,
      prompt: `Analyze token generation performance anomaly at token index ${index} with speed ${value} ms/tok.`
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

  exportToJson(): void {
    const pts = this.points();
    const blob = new Blob([JSON.stringify(pts, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'token-streaming-data.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToCsv(): void {
    const pts = this.points();
    let csv = 'Token_Index,Latency_Ms\n';
    pts.forEach((v, i) => {
      csv += `${i + 1},${v}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'token-streaming-data.csv');
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
    link.setAttribute('download', 'token-streaming-chart.svg');
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
