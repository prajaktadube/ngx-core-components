import {
  Component, ChangeDetectionStrategy, input, computed, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CHART_COLORS, fmtNum } from '../shared/chart-utils';

export interface RadialBarItem {
  label: string;
  value: number;
  max: number;
  color?: string;
}

@Component({
  selector: 'ngx-radial-bar-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-radial-bar-chart" (mouseleave)="hoveredIndex.set(null); tooltip.set(null)">
      <div class="chart-layout">
        <!-- SVG Concentric Circles -->
        <div class="radial-visual">
          <svg
            [attr.width]="height()"
            [attr.height]="height()"
            [attr.viewBox]="'0 0 ' + size() + ' ' + size()"
            class="radial-svg"
          >
            <!-- Rotate group by -90deg so rings start at 12 o'clock -->
            <g [attr.transform]="'translate(' + center() + ',' + center() + ') rotate(-90)'">
              @for (ring of computedRings(); track $index; let i = $index) {
                <!-- Background track ring -->
                <circle
                  cx="0"
                  cy="0"
                  [attr.r]="ring.r"
                  fill="none"
                  [attr.stroke]="ring.color"
                  stroke-opacity="0.12"
                  [attr.stroke-width]="strokeWidth()"
                />

                <!-- Active progress ring -->
                <circle
                  cx="0"
                  cy="0"
                  [attr.r]="ring.r"
                  fill="none"
                  [attr.stroke]="ring.color"
                  [attr.stroke-width]="strokeWidth()"
                  [attr.stroke-dasharray]="ring.dashArray"
                  [attr.stroke-dashoffset]="0"
                  stroke-linecap="round"
                  class="progress-ring"
                  [class.hovered]="hoveredIndex() === i"
                  (mouseenter)="onRingHover($event, ring.raw, i)"
                />
              }
            </g>
          </svg>

          <!-- Inside Center Details (Hover/Selected summary) -->
          <div class="center-content">
            @if (hoveredIndex() !== null) {
              @if (computedRings()[hoveredIndex()!]; as active) {
                <span class="center-label">{{ active.label }}</span>
                <span class="center-value" [style.color]="active.color">
                  {{ active.pct }}%
                </span>
                <span class="center-sublabel">
                  {{ fmtNum(active.value) }} / {{ fmtNum(active.max) }}
                </span>
              }
            } @else if (data().length > 0) {
              <span class="center-label">Average</span>
              <span class="center-value">{{ avgPct() }}%</span>
              <span class="center-sublabel">Completed</span>
            }
          </div>
        </div>

        <!-- Legend / List -->
        @if (showLegend() && data().length > 0) {
          <div class="radial-legend">
            @for (ring of computedRings(); track $index; let i = $index) {
              <div
                class="legend-item"
                [class.active]="hoveredIndex() === i"
                (mouseenter)="hoveredIndex.set(i)"
                (mouseleave)="hoveredIndex.set(null)"
              >
                <span class="legend-color-dot" [style.background]="ring.color"></span>
                <div class="legend-content">
                  <span class="legend-title">{{ ring.label }}</span>
                  <div class="legend-metrics">
                    <span class="metric-value">{{ ring.pct }}%</span>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .ngx-radial-bar-chart {
      background: var(--ngx-chart-bg, #ffffff);
      border-radius: 16px;
      padding: 16px;
      box-sizing: border-box;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
    }
    .chart-layout {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 24px;
      flex-wrap: wrap;
    }
    .radial-visual {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .radial-svg {
      display: block;
    }
    .progress-ring {
      cursor: pointer;
      transition: stroke-width 0.2s, filter 0.2s, opacity 0.2s;
    }
    .progress-ring.hovered {
      stroke-width: 14px; /* thickens slightly on hover */
      filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.15));
    }
    .center-content {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      text-align: center;
    }
    .center-label {
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .center-value {
      font-size: 24px;
      font-weight: 800;
      color: #1e293b;
      line-height: 1.1;
      margin: 2px 0;
    }
    .center-sublabel {
      font-size: 10px;
      color: #94a3b8;
    }

    /* Legend */
    .radial-legend {
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 150px;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 12px;
      border-radius: 8px;
      border: 1px solid transparent;
      transition: all 0.2s;
      cursor: pointer;
    }
    .legend-item:hover, .legend-item.active {
      background: var(--ngx-chart-grid, #f8fafc);
      border-color: var(--ngx-chart-grid, #e2e8f0);
    }
    .legend-color-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .legend-content {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }
    .legend-title {
      font-size: 12px;
      font-weight: 600;
      color: #475569;
    }
    .metric-value {
      font-size: 12px;
      font-weight: 700;
      color: #1e293b;
    }
  `]
})
export class RadialBarChartComponent {
  data = input<RadialBarItem[]>([]);
  height = input<number>(300);
  showLegend = input<boolean>(true);

  // Configuration properties
  strokeWidth = input<number>(10);
  ringGap = input<number>(4);
  colors = input<string[]>(CHART_COLORS);

  hoveredIndex = signal<number | null>(null);
  tooltip = signal<any | null>(null);

  size = computed(() => this.height());
  center = computed(() => this.size() / 2);

  // Ring properties
  computedRings = computed(() => {
    const raw = this.data();
    const count = raw.length;
    const centerPt = this.center();
    const ringW = this.strokeWidth();
    const gap = this.ringGap();

    // Start radii calculation from the outside inwards
    // Max radius leaves padding on outside
    const maxRadius = centerPt - ringW - 4;

    return raw.map((item, idx) => {
      // Offset outwards to inwards
      const r = maxRadius - idx * (ringW + gap);
      const pct = Math.min(100, Math.max(0, Math.round((item.value / item.max) * 100)));
      const color = item.color || this.colors()[idx % this.colors().length];

      // Circular arc math
      const C = 2 * Math.PI * r;
      // dasharray structure: "arcLength, circumference"
      const arcLength = (pct / 100) * C;
      const dashArray = `${arcLength}, ${C}`;

      return {
        r,
        pct,
        color,
        dashArray,
        label: item.label,
        value: item.value,
        max: item.max,
        raw: item
      };
    });
  });

  // Calculate average percentage of completion
  avgPct = computed(() => {
    const raw = this.data();
    if (raw.length === 0) return 0;
    const sum = raw.reduce((acc, curr) => acc + (curr.value / curr.max), 0);
    return Math.round((sum / raw.length) * 100);
  });

  onRingHover(event: MouseEvent, item: RadialBarItem, index: number) {
    this.hoveredIndex.set(index);
  }

  readonly fmtNum = fmtNum;
}
