import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CHART_COLORS, fmtNum } from '../shared/chart-utils';

export interface SunburstNode {
  label: string;
  value?: number; // Leaf value. If parent, computed as sum of children if omitted.
  color?: string;
  children?: SunburstNode[];
}

interface SunburstSlice {
  id: string;
  label: string;
  value: number;
  depth: number;
  startAngle: number;
  endAngle: number;
  path: string;
  color: string;
  parentPath: string;
  pct: number;
}

@Component({
  selector: 'ngx-sunburst-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-sunburst-chart" [class.dark]="theme() === 'dark'">
      <div class="chart-header">
        <div class="chart-title-space"></div>
        @if (showExport()) {
          <div class="chart-export-menu">
            <button class="export-trigger" (click)="toggleExportMenu($event)" aria-label="Export Menu">📤 Export</button>
            @if (exportMenuOpen()) {
              <div class="export-dropdown">
                <button (click)="onExport('json')">📊 Export JSON</button>
                <button (click)="onExport('csv')">📄 Export CSV</button>
                <button (click)="onExport('svg')">🖼️ Export SVG</button>
              </div>
            }
          </div>
        }
      </div>

      <div class="chart-body">
        <svg
          #svgEl
          class="chart-svg"
          [attr.viewBox]="'0 0 ' + height() + ' ' + height()"
          [attr.width]="height()"
          [attr.height]="height()"
        >
          <g [attr.transform]="'translate(' + cx() + ',' + cy() + ')'" class="sunburst-group">
            @for (slice of slices(); track slice.id; let idx = $index) {
              <path
                [attr.d]="slice.path"
                [attr.fill]="slice.color"
                [attr.stroke]="theme() === 'dark' ? '#1e2030' : '#ffffff'"
                stroke-width="1.5"
                class="sunburst-slice"
                [class.hovered]="hoveredSliceId() === slice.id"
                [style.animation-delay]="(idx * 0.01) + 's'"
                (mouseenter)="onSliceHover($event, slice)"
                (mouseleave)="onSliceLeave()"
              />
              <!-- Optional Radial Text Labels for large slices -->
              @if (showLabels() && (slice.endAngle - slice.startAngle) > 0.15 && slice.depth < 2) {
                <text
                  [attr.transform]="labelTransform(slice)"
                  text-anchor="middle"
                  dominant-baseline="middle"
                  class="slice-label"
                  pointer-events="none"
                >
                  {{ slice.label }}
                </text>
              }
            }
          </g>
        </svg>

        <!-- Legend showing top-level categories -->
        @if (showLegend() && topLevelNodes().length > 0) {
          <div class="chart-legend">
            @for (node of topLevelNodes(); track node.label; let i = $index) {
              <div class="legend-item">
                <span class="legend-dot" [style.background]="node.color || colors()[i % colors().length]"></span>
                <span class="legend-label">{{ node.label }}</span>
                <span class="legend-val">{{ fmtNum(getNodeValue(node)) }}</span>
              </div>
            }
          </div>
        }
      </div>

      <!-- Premium Glassmorphic Tooltip -->
      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
          <div class="tt-path">{{ t.parentPath || t.label }}</div>
          <div class="tt-row">
            <span class="tt-dot" [style.background]="t.color"></span>
            <span class="tt-name">Value</span>
            <span class="tt-val">{{ fmtNum(t.value) }}</span>
          </div>
          <div class="tt-row">
            <span class="tt-dot" style="background: transparent;"></span>
            <span class="tt-name">Contribution</span>
            <span class="tt-val">{{ t.pct }}%</span>
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
    .ngx-sunburst-chart {
      position: relative;
      background: var(--ngx-chart-bg, #ffffff);
      border-radius: 16px;
      padding: 16px;
      box-sizing: border-box;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
      transition: background-color 0.3s;
    }
    .ngx-sunburst-chart.dark {
      background: rgba(30, 32, 48, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.05);
      --ngx-chart-bg: transparent;
    }
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      min-height: 20px;
      position: relative;
    }
    .chart-body {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 32px;
      flex-wrap: wrap;
    }
    .chart-svg {
      display: block;
      max-width: 100%;
      height: auto;
      min-width: 0;
      animation: sunburstGrow 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
      transform-origin: center;
    }

    @keyframes sunburstGrow {
      from { transform: scale(0.3) rotate(-120deg); opacity: 0; }
      to { transform: scale(1) rotate(0); opacity: 1; }
    }

    .sunburst-slice {
      cursor: pointer;
      transition: fill-opacity 0.2s, stroke 0.2s, filter 0.25s;
    }
    .sunburst-slice:hover {
      fill-opacity: 0.9;
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
    }
    .slice-label {
      font-size: 9px;
      fill: #ffffff;
      font-weight: 700;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
      user-select: none;
    }

    .chart-legend {
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex-shrink: 0;
      min-width: 160px;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 6px;
      transition: background-color 0.15s;
    }
    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 3px;
      flex-shrink: 0;
    }
    .legend-label {
      flex: 1;
      color: #64748b;
      font-weight: 500;
    }
    .dark .legend-label {
      color: #94a3b8;
    }
    .legend-val {
      font-weight: 700;
      color: #334155;
    }
    .dark .legend-val {
      color: #cbd5e1;
    }

    /* Premium Glassmorphic Tooltip */
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
      font-size: 11px;
      z-index: 100;
      min-width: 160px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: left 0.1s cubic-bezier(0.16, 1, 0.3, 1), top 0.1s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .tt-path {
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
      color: #4f46e5;
      border-color: #4f46e5;
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
      color: #4f46e5;
    }
  `]
})
export class SunburstChartComponent {
  data = input<SunburstNode[]>([]);
  height = input<number>(300);
  showLegend = input<boolean>(true);
  showLabels = input<boolean>(true);
  theme = input<'light' | 'dark'>('light');
  colors = input<string[]>(CHART_COLORS);
  showExport = input<boolean>(false);

  exportMenuOpen = signal(false);
  hoveredSliceId = signal<string | null>(null);
  tooltip = signal<{
    x: number;
    y: number;
    label: string;
    parentPath: string;
    value: number;
    pct: number;
    color: string;
  } | null>(null);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  cx = computed(() => this.height() / 2);
  cy = computed(() => this.height() / 2);
  radius = computed(() => this.height() / 2 - 10);

  topLevelNodes = computed(() => this.data());

  maxDepth = computed(() => {
    const getDepth = (node: SunburstNode): number => {
      if (!node.children || node.children.length === 0) return 0;
      return 1 + Math.max(...node.children.map(getDepth));
    };
    const rootNodes = this.data();
    if (!rootNodes || rootNodes.length === 0) return 0;
    return Math.max(...rootNodes.map(getDepth));
  });

  getNodeValue(node: SunburstNode): number {
    if (node.value !== undefined) return node.value;
    if (node.children && node.children.length > 0) {
      return node.children.reduce((sum, c) => sum + this.getNodeValue(c), 0);
    }
    return 0;
  }

  private adjustColorBrightness(hex: string, percent: number): string {
    if (!hex.startsWith('#')) return hex;
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, Math.min(255, (num >> 16) + amt));
    const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
    const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  }

  private ringPath(startAngle: number, endAngle: number, outerR: number, innerR: number): string {
    const ox1 = Math.cos(startAngle) * outerR;
    const oy1 = Math.sin(startAngle) * outerR;
    const ox2 = Math.cos(endAngle) * outerR;
    const oy2 = Math.sin(endAngle) * outerR;

    const ix1 = Math.cos(startAngle) * innerR;
    const iy1 = Math.sin(startAngle) * innerR;
    const ix2 = Math.cos(endAngle) * innerR;
    const iy2 = Math.sin(endAngle) * innerR;

    const large = endAngle - startAngle > Math.PI ? 1 : 0;
    return `M ${ix1} ${iy1} L ${ox1} ${oy1} A ${outerR} ${outerR} 0 ${large} 1 ${ox2} ${oy2} L ${ix2} ${iy2} A ${innerR} ${innerR} 0 ${large} 0 ${ix1} ${iy1} Z`;
  }

  slices = computed(() => {
    const rootNodes = this.data();
    if (!rootNodes || rootNodes.length === 0) return [];

    const totalVal = rootNodes.reduce((sum, n) => sum + this.getNodeValue(n), 0) || 1;
    const list: SunburstSlice[] = [];
    const colorsList = this.colors();

    const processNode = (
      node: SunburstNode,
      depth: number,
      startAngle: number,
      endAngle: number,
      parentPath: string,
      color: string
    ) => {
      const val = this.getNodeValue(node);
      const frac = val / totalVal;
      const angle = endAngle - startAngle;
      
      const maxRadius = this.radius();
      const numDepths = this.maxDepth() + 1;
      const depthWidth = maxRadius / numDepths;
      const innerR = depth * depthWidth;
      const outerR = (depth + 1) * depthWidth;

      const path = this.ringPath(startAngle, endAngle, outerR, innerR);
      const pathName = parentPath ? `${parentPath} › ${node.label}` : node.label;
      const pct = Math.round(frac * 100);

      list.push({
        id: `${depth}-${node.label}-${startAngle.toFixed(4)}`,
        label: node.label,
        value: val,
        depth,
        startAngle,
        endAngle,
        path,
        color,
        parentPath: pathName,
        pct
      });

      if (node.children && node.children.length > 0) {
        const childrenSum = node.children.reduce((sum, c) => sum + this.getNodeValue(c), 0) || 1;
        let currStart = startAngle;
        node.children.forEach((child, idx) => {
          const childVal = this.getNodeValue(child);
          const childAngle = (childVal / childrenSum) * angle;
          const childEnd = currStart + childAngle;
          // Sub-color: darken slightly per depth
          const childColor = child.color || this.adjustColorBrightness(color, -10);
          processNode(child, depth + 1, currStart, childEnd, pathName, childColor);
          currStart = childEnd;
        });
      }
    };

    let currentStart = -Math.PI / 2;
    rootNodes.forEach((node, idx) => {
      const val = this.getNodeValue(node);
      const angle = (val / totalVal) * Math.PI * 2;
      const end = currentStart + angle;
      const color = node.color || colorsList[idx % colorsList.length];
      processNode(node, 0, currentStart, end, '', color);
      currentStart = end;
    });

    return list;
  });

  labelTransform(slice: SunburstSlice): string {
    const depthWidth = this.radius() / (this.maxDepth() + 1);
    const r = (slice.depth + 0.5) * depthWidth;
    const midAngle = slice.startAngle + (slice.endAngle - slice.startAngle) / 2;
    const x = Math.cos(midAngle) * r;
    const y = Math.sin(midAngle) * r;
    
    // Rotate text to follow radial lines
    let rotation = (midAngle * 180) / Math.PI;
    // Flip text if it is in the bottom half of the circle to prevent upside-down labels
    if (rotation > 90 && rotation < 270) {
      rotation -= 180;
    } else if (rotation < -90) {
      rotation += 180;
    }
    return `translate(${x}, ${y}) rotate(${rotation})`;
  }

  onSliceHover(event: MouseEvent, slice: SunburstSlice): void {
    this.hoveredSliceId.set(slice.id);
    const el = (event.currentTarget as SVGElement).ownerSVGElement!.parentElement!;
    const rect = el.getBoundingClientRect();
    this.tooltip.set({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      label: slice.label,
      parentPath: slice.parentPath,
      value: slice.value,
      pct: slice.pct,
      color: slice.color
    });
  }

  onSliceLeave(): void {
    this.hoveredSliceId.set(null);
    this.tooltip.set(null);
  }

  toggleExportMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.exportMenuOpen.set(!this.exportMenuOpen());
  }

  onExport(type: 'json' | 'csv' | 'svg'): void {
    this.exportMenuOpen.set(false);
    if (type === 'json') this.exportToJson();
    else if (type === 'csv') this.exportToCsv();
    else if (type === 'svg') this.exportToSvg();
  }

  exportToCsv(): void {
    const slices = this.slices();
    if (!slices.length) return;
    let csv = 'Depth,Path,Value,Percentage\n';
    slices.forEach(s => {
      csv += `${s.depth},"${s.parentPath}",${s.value},${s.pct}%\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'sunburst-chart-data.csv');
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
    link.setAttribute('download', 'sunburst-chart-data.json');
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
    link.setAttribute('download', 'sunburst-chart.svg');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  readonly fmtNum = fmtNum;
}
