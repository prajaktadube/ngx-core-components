import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, viewChild, HostListener, inject
} from '@angular/core';
import { ChartExportService } from '../shared/chart-export.service';
import { ChartExportMenuComponent } from '../shared/chart-export-menu.component';
import type { ExportFormat } from '../shared/chart-export-menu.component';
import { CHART_COLORS, fmtNum } from '../shared/chart-utils';

export interface BubbleNode {
  id: string;
  label: string;
  value: number;       // Determines size
  group?: string;      // Optional grouping for clustered packing
  color?: string;
}

interface SimulatedNode {
  id: string;
  label: string;
  value: number;
  group: string;
  r: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
}

@Component({
  selector: 'ngx-packed-bubble-chart',
  standalone: true,
  imports: [ChartExportMenuComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-packed-bubble-chart">
      <!-- Toolbar with Export option -->
      <div class="chart-header" (mousemove)="$event.stopPropagation()" (mouseleave)="tooltip.set(null)">
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
          <!-- Grid/Background helper rings -->
          <circle [attr.cx]="cx()" [attr.cy]="cy()" [attr.r]="cx() * 0.8" fill="none" stroke="var(--ngx-chart-grid, #f1f5f9)" stroke-width="1" stroke-dasharray="4" />
          <circle [attr.cx]="cx()" [attr.cy]="cy()" [attr.r]="cx() * 0.5" fill="none" stroke="var(--ngx-chart-grid, #f1f5f9)" stroke-width="1" stroke-dasharray="4" />

          <!-- Group Labels (centered around cluster areas if grouped) -->
          @if (showGroupLabels() && groupCenters().length > 1) {
            @for (gc of groupCenters(); track gc.group) {
              <text
                [attr.x]="gc.x"
                [attr.y]="gc.y - 20"
                text-anchor="middle"
                class="cluster-label"
              >
                {{ gc.group }}
              </text>
            }
          }

          <!-- Bubble Elements -->
          @for (node of computedNodes(); track node.id) {
            <g class="bubble-group" [class.hovered]="hoveredId() === node.id">
              <circle
                [attr.cx]="node.x"
                [attr.cy]="node.y"
                [attr.r]="node.r"
                [attr.fill]="node.color"
                [attr.stroke]="'#ffffff'"
                [attr.stroke-width]="hoveredId() === node.id ? 3 : 1.5"
                class="bubble"
                (mouseenter)="hoveredId.set(node.id); onBubbleHover($event, node)"
                (mouseleave)="hoveredId.set(null); tooltip.set(null)"
              />
              @if (showLabels() && node.r > 20) {
                <text
                  [attr.x]="node.x"
                  [attr.y]="node.y"
                  text-anchor="middle"
                  dominant-baseline="middle"
                  class="bubble-label"
                  [style.font-size.px]="Math.max(9, Math.min(13, node.r / 3.5))"
                >
                  {{ truncate(node.label, node.r) }}
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
          <span class="tt-dot" [style.background]="t.color"></span>
          <div class="tt-content">
            <strong>{{ t.label }}</strong>
            @if (t.group) {
              <div class="tt-group">Group: {{ t.group }}</div>
            }
            <div class="tt-val">Value: {{ fmtNum(t.value) }}</div>
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
    .ngx-packed-bubble-chart {
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
    .bubble-group {
      cursor: pointer;
    }
    .bubble {
      transition: stroke-width 0.2s, stroke 0.2s, fill-opacity 0.15s;
    }
    .bubble-group:hover .bubble {
      fill-opacity: 0.9;
      filter: drop-shadow(0 6px 12px rgba(0,0,0,0.15));
    }
    .bubble-label {
      fill: #ffffff;
      font-weight: 700;
      pointer-events: none;
      user-select: none;
      text-shadow: 0 1px 2px rgba(0,0,0,0.4);
    }
    .cluster-label {
      font-size: 11px;
      fill: var(--ngx-chart-axis-text, #94a3b8);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
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
      border-radius: 10px; font-size: 12px; min-width: 140px;
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
export class PackedBubbleChartComponent {
  private readonly exportSvc = inject(ChartExportService);
  data = input<BubbleNode[]>([]);
  height = input<number>(300);
  width = input<number>(450);
  colors = input<string[]>(CHART_COLORS);
  showLegend = input<boolean>(true);
  showLabels = input<boolean>(true);
  showGroupLabels = input<boolean>(true);
  showExport = input<boolean>(false);
  minBubbleRadius = input<number>(10);
  maxBubbleRadius = input<number>(45);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');


  hoveredId = signal<string | null>(null);
  tooltip = signal<{x:number;y:number;label:string;value:number;group?:string;color:string}|null>(null);

  cx = computed(() => this.width() / 2);
  cy = computed(() => this.height() / 2);

  uniqueGroups = computed(() => {
    const grps = new Set<string>();
    this.data().forEach(node => {
      if (node.group) grps.add(node.group);
    });
    return Array.from(grps);
  });

  groupCenters = computed(() => {
    const grps = this.uniqueGroups();
    const count = grps.length;
    const centerx = this.cx();
    const centery = this.cy();
    if (count <= 1) {
      return [{ group: 'default', x: centerx, y: centery }];
    }
    // Arrange group centers on a circle around the chart center
    const radius = Math.min(centerx, centery) * 0.35;
    return grps.map((grp, i) => {
      const angle = (i / count) * Math.PI * 2;
      return {
        group: grp,
        x: centerx + Math.cos(angle) * radius,
        y: centery + Math.sin(angle) * radius
      };
    });
  });

  computedNodes = computed<SimulatedNode[]>(() => {
    const rawData = this.data();
    if (!rawData.length) return [];

    let minVal = Infinity;
    let maxVal = -Infinity;
    rawData.forEach(node => {
      if (node.value < minVal) minVal = node.value;
      if (node.value > maxVal) maxVal = node.value;
    });

    if (minVal === Infinity) minVal = 0;
    if (maxVal === -Infinity) maxVal = 1;
    if (minVal === maxVal) minVal = maxVal - 1;

    const minR = this.minBubbleRadius();
    const maxR = this.maxBubbleRadius();

    // Map each data node to a simulated node with an initial layout position
    const grps = this.uniqueGroups();
    const centerx = this.cx();
    const centery = this.cy();
    const centers = this.groupCenters();

    const nodes: SimulatedNode[] = rawData.map((node, i) => {
      const groupName = node.group || 'default';
      const grpIdx = grps.indexOf(groupName);
      const color = node.color || this.colors()[grpIdx >= 0 ? grpIdx % this.colors().length : i % this.colors().length];

      // scale radius by square root to make bubble area proportional to value
      const t = (node.value - minVal) / (maxVal - minVal);
      const radius = minR + Math.sqrt(t) * (maxR - minR);

      // Random starting positions clustered around their group center
      const targetCenter = centers.find(c => c.group === groupName) || { x: centerx, y: centery };
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 20;

      return {
        id: node.id,
        label: node.label,
        value: node.value,
        group: groupName,
        r: isNaN(radius) ? minR : radius,
        x: targetCenter.x + Math.cos(angle) * dist,
        y: targetCenter.y + Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        color
      };
    });

    // Run simple force-directed simulation
    const iterations = 180;
    const gravity = 0.06;
    const damping = 0.65;
    const padding = 3.5;
    const repulsionStrength = 0.75;

    for (let it = 0; it < iterations; it++) {
      // 1. Attraction force to respective group centers
      nodes.forEach(node => {
        const targetCenter = centers.find(c => c.group === node.group) || { x: centerx, y: centery };
        node.vx += (targetCenter.x - node.x) * gravity;
        node.vy += (targetCenter.y - node.y) * gravity;
      });

      // 2. Collision resolution (repulsion)
      for (let i = 0; i < nodes.length; i++) {
        const nodeA = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const nodeB = nodes[j];
          const dx = nodeB.x - nodeA.x;
          const dy = nodeB.y - nodeA.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
          const minDist = nodeA.r + nodeB.r + padding;

          if (dist < minDist) {
            const overlap = minDist - dist;
            const nx = dx / dist;
            const ny = dy / dist;

            // Push nodes apart proportionally
            const force = overlap * 0.5 * repulsionStrength;
            nodeA.vx -= nx * force;
            nodeA.vy -= ny * force;
            nodeB.vx += nx * force;
            nodeB.vy += ny * force;
          }
        }
      }

      // 3. Update positions and damp velocities
      nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;
        node.vx *= damping;
        node.vy *= damping;

        // Keep inside bounds
        const borderPadding = node.r + 5;
        if (node.x < borderPadding) { node.x = borderPadding; node.vx = 0; }
        if (node.x > this.width() - borderPadding) { node.x = this.width() - borderPadding; node.vx = 0; }
        if (node.y < borderPadding) { node.y = borderPadding; node.vy = 0; }
        if (node.y > this.height() - borderPadding) { node.y = this.height() - borderPadding; node.vy = 0; }
      });
    }

    return nodes;
  });

  getGroupColor(group: string, idx: number): string {
    return this.colors()[idx % this.colors().length];
  }

  truncate(str: string, radius: number): string {
    const limit = Math.floor(radius / 3.2);
    if (str.length <= limit) return str;
    return str.substring(0, Math.max(3, limit - 2)) + '...';
  }

  onBubbleHover(event: MouseEvent, node: SimulatedNode): void {
    const el = (event.currentTarget as HTMLElement).closest('.ngx-packed-bubble-chart') as HTMLElement;
    const rect = el.getBoundingClientRect();
    this.tooltip.set({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      label: node.label,
      value: node.value,
      group: node.group !== 'default' ? node.group : undefined,
      color: node.color
    });
  }

  onExport(type: ExportFormat): void {
    if (type === 'json') this.exportToJson();
    else if (type === 'csv') this.exportToCsv();
    else if (type === 'svg') this.exportToSvg();
    else if (type === 'pdf') this.exportToPdf();
  }

  exportToJson(): void {
    this.exportSvc.downloadJson(this.data(), 'packed-bubble-chart.json');
  }

  exportToCsv(): void {
    const data = this.data();
    if (!data.length) return;
    const headers = ['Label', 'Group', 'Value'];
    const rows = data.map(d => [d.label || '', d.group || '', d.value]);
    this.exportSvc.downloadCsv(headers, rows, 'packed-bubble-chart.csv');
  }

  exportToSvg(): void {
    this.exportSvc.downloadSvg(this.svgEl()?.nativeElement, 'chart.svg');
  }

  exportToPdf(): void {
    this.exportSvc.downloadPdf(this.svgEl()?.nativeElement, 'Chart Export', 'chart.pdf');
  }

  readonly fmtNum = fmtNum;
  readonly Math = Math;
}
