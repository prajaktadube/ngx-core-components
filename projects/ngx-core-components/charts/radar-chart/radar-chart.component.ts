import { Component, input, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface RadarSeries {
  label: string;
  values: number[]; // Array of values corresponding to categories
}

@Component({
  selector: 'ngx-radar-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-radar-wrapper">
      <!-- Radar Chart Visual Panel -->
      <div class="ngx-radar-container">
        <svg
          class="ngx-radar-svg"
          viewBox="0 0 220 220"
        >
          <defs>
            @for (series of seriesData(); track series.label; let sIdx = $index) {
              <linearGradient [id]="'radar-grad-' + sIdx" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" [attr.stop-color]="getSeriesColor(sIdx, 1)" stop-opacity="0.35" />
                <stop offset="100%" [attr.stop-color]="getSeriesColor(sIdx, 1)" stop-opacity="0.05" />
              </linearGradient>
            }
          </defs>

          <!-- Concentric polygon grids (web rings) -->
          @for (ring of gridRings(); track ring) {
            <polygon
              [attr.points]="getRingPoints(ring)"
              fill="none"
              stroke="var(--border-light, rgba(226, 232, 240, 0.6))"
              stroke-width="0.8"
              stroke-dasharray="2,2"
            />
          }

          <!-- Axis lines projecting out to categories -->
          @for (axis of axes(); track $index) {
            <line
              [attr.x1]="110"
              [attr.y1]="110"
              [attr.x2]="axis.x"
              [attr.y2]="axis.y"
              stroke="var(--border-color, rgba(226, 232, 240, 0.8))"
              stroke-width="0.8"
              stroke-dasharray="3,3"
            />
            <!-- Category Label text positions -->
            <text
              [attr.x]="axis.labelX"
              [attr.y]="axis.labelY"
              [attr.text-anchor]="axis.align"
              class="axis-label"
            >
              {{ categories()[$index] }}
            </text>
          }

          <!-- Radar polygon areas representing series -->
          @for (series of seriesData(); track series.label; let sIdx = $index) {
            <polygon
              [attr.points]="getSeriesPoints(series)"
              [attr.fill]="'url(#radar-grad-' + sIdx + ')'"
              [attr.stroke]="getSeriesColor(sIdx, 1)"
              stroke-width="2.5"
              class="radar-polygon"
              [class.active]="hoveredSeries() === series.label"
              (mouseenter)="hoveredSeries.set(series.label)"
              (mouseleave)="hoveredSeries.set(null)"
            />

            <!-- Plot data dots on points -->
            @for (pt of getSeriesPointList(series); track $index) {
              <circle
                [attr.cx]="pt.x"
                [attr.cy]="pt.y"
                [attr.r]="hoveredPoint()?.seriesLabel === series.label && hoveredPoint()?.index === $index ? 5.5 : 3.5"
                [attr.fill]="getSeriesColor(sIdx, 1)"
                stroke="#ffffff"
                stroke-width="1.5"
                class="radar-dot"
                [class.hovered]="hoveredPoint()?.seriesLabel === series.label && hoveredPoint()?.index === $index"
                (mouseenter)="onPointEnter(series, $index, pt, $event)"
                (mouseleave)="onPointLeave()"
              />
            }
          }
        </svg>

        <!-- Hover Tooltip Overlay -->
        @if (tooltip().show) {
          <div
            class="radar-tooltip"
            [style.left.px]="tooltip().x"
            [style.top.px]="tooltip().y"
          >
            <div class="tt-cat">{{ tooltip().series }}</div>
            <div class="tt-row">
              <span class="tt-dot" [style.background]="tooltip().color"></span>
              <span class="tt-name">{{ tooltip().category }}</span>
              <span class="tt-val">{{ tooltip().value }}</span>
            </div>
          </div>
        }
      </div>

      <!-- Legend Panel -->
      <div class="radar-legend">
        @for (series of seriesData(); track series.label; let sIdx = $index) {
          <div
            class="legend-item"
            [class.dimmed]="hoveredSeries() !== null && hoveredSeries() !== series.label"
            (mouseenter)="hoveredSeries.set(series.label)"
            (mouseleave)="hoveredSeries.set(null)"
          >
            <span class="legend-indicator" [style.background]="getSeriesColor(sIdx, 1)"></span>
            <span class="legend-text">{{ series.label }}</span>
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

    .ngx-radar-wrapper {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 24px;
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 12px;
      box-shadow: var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05));
      position: relative;
    }

    .ngx-radar-container {
      position: relative;
      width: 100%;
      max-width: 280px;
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ngx-radar-svg {
      width: 100%;
      height: 100%;
      overflow: visible;
    }

    @keyframes radarScaleIn {
      from { transform: scale(0.1); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    /* Radar Polygons styling */
    .radar-polygon {
      transition: stroke-width 0.25s cubic-bezier(0.16, 1, 0.3, 1), fill-opacity 0.25s;
      cursor: pointer;
      transform-origin: 110px 110px;
      animation: radarScaleIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    .radar-polygon:hover, .radar-polygon.active {
      stroke-width: 3.5px;
    }

    .radar-dot {
      cursor: pointer;
      transition: r 0.2s cubic-bezier(0.16, 1, 0.3, 1), stroke-width 0.2s;
      transform-origin: 110px 110px;
      animation: radarScaleIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    .radar-dot.hovered {
      filter: drop-shadow(0 0 4px rgba(0,0,0,0.25));
      stroke-width: 2px;
    }

    /* Labels styling */
    .axis-label {
      font-size: 8px;
      font-weight: 700;
      fill: var(--text-secondary, #64748b);
      letter-spacing: -0.1px;
    }

    /* Glassmorphic Tooltip styling */
    .radar-tooltip {
      position: absolute;
      z-index: 100;
      pointer-events: none;
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
      min-width: 140px;
      transition: left 0.1s cubic-bezier(0.16, 1, 0.3, 1), top 0.1s cubic-bezier(0.16, 1, 0.3, 1);
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

    /* Legend Layout */
    .radar-legend {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 12px;
    }
    .legend-item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .legend-item.dimmed {
      opacity: 0.35;
    }
    .legend-indicator {
      width: 10px;
      height: 10px;
      border-radius: 3px;
    }
    .legend-text {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-primary, #0f172a);
    }
  `]
})
export class RadarChartComponent {
  // Input binds
  seriesData = input.required<RadarSeries[]>();
  categories = input.required<string[]>();
  max = input<number>(100);
  colors = input<string[]>(['#4f46e5', '#fbbf24', '#a855f7', '#06b6d4']);

  // Hover status signals
  hoveredSeries = signal<string | null>(null);
  hoveredPoint = signal<{ seriesLabel: string; index: number } | null>(null);
  tooltip = signal<{ show: boolean; series: string; category: string; value: string; x: number; y: number; color: string }>({
    show: false,
    series: '',
    category: '',
    value: '',
    x: 0,
    y: 0,
    color: ''
  });

  // Concentric circle rings count
  gridRings = signal<number[]>([0.2, 0.4, 0.6, 0.8, 1]);

  // Radius bound sizing (inside the 220x220 viewBox, center is 110, 110, maxRadius is 70)
  centerX = 110;
  centerY = 110;
  maxRadius = 70;

  // Calculate coordinates for category axis projections
  axes = computed(() => {
    const N = this.categories().length;
    return this.categories().map((_, i) => {
      const angle = (i * 2 * Math.PI) / N - Math.PI / 2; // Start from top
      const x = this.centerX + this.maxRadius * Math.cos(angle);
      const y = this.centerY + this.maxRadius * Math.sin(angle);

      // Label coordinate placement (offset slightly outwards)
      const labelDistance = this.maxRadius + 14;
      const labelX = this.centerX + labelDistance * Math.cos(angle);
      const labelY = this.centerY + labelDistance * Math.sin(angle) + 3; // +3 offset for vertical alignment

      // Text alignments depending on quadrant position
      let align: 'start' | 'middle' | 'end' = 'middle';
      if (Math.cos(angle) > 0.1) align = 'start';
      else if (Math.cos(angle) < -0.1) align = 'end';

      return { x, y, labelX, labelY, align };
    });
  });

  // Generate points string for web ring paths
  getRingPoints(ringFraction: number): string {
    const N = this.categories().length;
    const r = this.maxRadius * ringFraction;
    const points: string[] = [];

    for (let i = 0; i < N; i++) {
      const angle = (i * 2 * Math.PI) / N - Math.PI / 2;
      const x = this.centerX + r * Math.cos(angle);
      const y = this.centerY + r * Math.sin(angle);
      points.push(`${x},${y}`);
    }

    return points.join(' ');
  }

  // Generate points string for data series polygons
  getSeriesPoints(series: RadarSeries): string {
    const N = this.categories().length;
    const points: string[] = [];

    for (let i = 0; i < N; i++) {
      const value = series.values[i] ?? 0;
      const fraction = Math.min(1, value / this.max());
      const r = this.maxRadius * fraction;
      
      const angle = (i * 2 * Math.PI) / N - Math.PI / 2;
      const x = this.centerX + r * Math.cos(angle);
      const y = this.centerY + r * Math.sin(angle);
      points.push(`${x},${y}`);
    }

    return points.join(' ');
  }

  // Get point list representing coordinate items to draw dots
  getSeriesPointList(series: RadarSeries): Array<{ x: number; y: number; value: number }> {
    const N = this.categories().length;
    const list: Array<{ x: number; y: number; value: number }> = [];

    for (let i = 0; i < N; i++) {
      const value = series.values[i] ?? 0;
      const fraction = Math.min(1, value / this.max());
      const r = this.maxRadius * fraction;
      
      const angle = (i * 2 * Math.PI) / N - Math.PI / 2;
      const x = this.centerX + r * Math.cos(angle);
      const y = this.centerY + r * Math.sin(angle);
      list.push({ x, y, value });
    }

    return list;
  }

  // Utility to fetch colors
  getSeriesColor(index: number, opacity: number): string {
    const colorList = this.colors();
    const color = colorList[index % colorList.length];

    if (opacity === 1) return color;
    
    // Convert hex to rgba
    const h = color.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  // Hover point interactions
  onPointEnter(series: RadarSeries, index: number, pt: { x: number; y: number; value: number }, event: MouseEvent): void {
    this.hoveredSeries.set(series.label);
    this.hoveredPoint.set({ seriesLabel: series.label, index });

    // Tooltip position mappings relative to the outer container
    const svgRect = (event.currentTarget as SVGElement).ownerSVGElement!.getBoundingClientRect();
    const containerRect = (event.currentTarget as SVGElement).ownerSVGElement!.parentElement!.getBoundingClientRect();

    // Map coordinates relative to parent container
    const x = (pt.x / 220) * svgRect.width + (svgRect.left - containerRect.left);
    const y = (pt.y / 220) * svgRect.height + (svgRect.top - containerRect.top);

    const seriesIndex = this.seriesData().indexOf(series);
    const color = this.getSeriesColor(seriesIndex, 1);

    this.tooltip.set({
      show: true,
      series: series.label,
      category: this.categories()[index] ?? '',
      value: pt.value.toLocaleString(),
      x,
      y,
      color
    });
  }

  onPointLeave(): void {
    this.hoveredSeries.set(null);
    this.hoveredPoint.set(null);
    this.tooltip.update(t => ({ ...t, show: false }));
  }
}
