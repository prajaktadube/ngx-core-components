import { Component, ChangeDetectionStrategy, input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CHART_COLORS, fmtNum } from '../shared/chart-utils';

export interface FunnelItem {
  name: string;
  value: number;
  color?: string;
}

@Component({
  selector: 'ngx-funnel-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-funnel-chart">
      <div class="funnel-layout">
        <!-- SVG Visual Funnel -->
        <div class="funnel-graphic" (mouseleave)="hoveredIndex.set(null)">
          <svg [attr.width]="'100%'" [attr.height]="height()" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" class="funnel-svg">
            <g>
              @for (stage of funnelStages(); track stage.name; let i = $index) {
                <polygon
                  [attr.points]="stage.points"
                  [attr.fill]="stage.color"
                  [class.active]="hoveredIndex() === i"
                  (mouseenter)="hoveredIndex.set(i)"
                  (mousemove)="onMouseMove($event, i)"
                  class="funnel-polygon"
                />
              }
            </g>
          </svg>
          
          <!-- Hover Tooltip -->
          @if (hoveredIndex() !== null) {
            @if (funnelStages()[hoveredIndex()!]; as stage) {
              <div class="chart-tooltip" [style.left.px]="tooltipX()" [style.top.px]="tooltipY()">
                <div class="tt-name">{{ stage.name }}</div>
                <div class="tt-row">
                  Value: <strong>{{ fmtNum(stage.value) }}</strong>
                </div>
                <div class="tt-row">
                  Conversion: <strong>{{ (stage.value / funnelStages()[0].value) | percent:'1.0-1' }}</strong>
                </div>
              </div>
            }
          }
        </div>

        <!-- Sidebar legend & metric checklist -->
        <div class="funnel-legend">
          @for (stage of funnelStages(); track stage.name; let i = $index) {
            <div
              class="legend-item"
              [class.active]="hoveredIndex() === i"
              (mouseenter)="hoveredIndex.set(i)"
              (mouseleave)="hoveredIndex.set(null)"
            >
              <span class="legend-color-dot" [style.background]="stage.color"></span>
              <div class="legend-content">
                <span class="legend-title">{{ stage.name }}</span>
                <div class="legend-metrics">
                  <span class="metric-value">{{ fmtNum(stage.value) }}</span>
                  <span class="metric-pct">
                    {{ (stage.value / funnelStages()[0].value) | percent:'1.0-1' }}
                  </span>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .ngx-funnel-chart {
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 12px;
      padding: 20px;
    }
    .funnel-layout {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 24px;
      align-items: center;
    }
    @media (max-width: 600px) {
      .funnel-layout {
        grid-template-columns: 1fr;
      }
    }
    
    .funnel-graphic {
      position: relative;
      width: 100%;
    }
    .funnel-svg {
      display: block;
      overflow: visible;
    }
    .funnel-polygon {
      cursor: pointer;
      opacity: 0.85;
      transition: opacity 0.2s, transform 0.2s, filter 0.2s;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.06));
    }
    .funnel-polygon:hover, .funnel-polygon.active {
      opacity: 1;
      filter: drop-shadow(0 4px 12px rgba(0,0,0,0.12)) brightness(1.05);
    }

    /* Tooltip styling */
    .chart-tooltip {
      position: absolute;
      pointer-events: none;
      transform: translate(-50%, -100%) translateY(-10px);
      background: var(--ngx-chart-tooltip-bg, #0f172a);
      color: #ffffff;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 12px;
      white-space: nowrap;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      z-index: 10;
    }
    .tt-name {
      font-weight: 700;
      margin-bottom: 4px;
    }
    .tt-row {
      font-size: 11px;
      opacity: 0.9;
    }

    /* Sidebar metrics list */
    .funnel-legend {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: 8px;
      border: 1px solid transparent;
      transition: all 0.2s;
      cursor: pointer;
    }
    .legend-item:hover, .legend-item.active {
      background: var(--bg-primary, #f8fafc);
      border-color: var(--border-color, #e2e8f0);
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
      gap: 16px;
    }
    .legend-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary, #0f172a);
    }
    .legend-metrics {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .metric-value {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-primary, #0f172a);
    }
    .metric-pct {
      font-size: 11px;
      color: var(--text-secondary, #64748b);
      background: var(--border-light, #f1f5f9);
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
    }
  `]
})
export class FunnelChartComponent {
  data = input<FunnelItem[]>([]);
  height = input<number>(300);
  colors = input<string[]>(CHART_COLORS);

  hoveredIndex = signal<number | null>(null);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);

  // Computes the SVG polygon coordinates for the funnel steps
  funnelStages = computed(() => {
    const items = this.data();
    if (items.length === 0) return [];
    
    // Sort items descending so that the funnel goes from largest to smallest,
    // or keep user's ordered sequence (normally ordered sequence is preferred for funnel steps)
    const sorted = [...items];
    const maxVal = sorted[0]?.value || 1;
    const count = sorted.length;
    
    const svgW = 400;
    const svgH = 300;
    const maxFunnelW = 320;
    
    const stepH = svgH / count;
    
    return sorted.map((item, idx) => {
      // Calculate top and bottom widths based on value ratio to maxVal
      const topPct = item.value / maxVal;
      // Bottom percentage matches the next stage's top percentage, 
      // or for the last stage, is scaled down to 40% of its top percentage.
      const botPct = idx < count - 1 ? sorted[idx + 1].value / maxVal : topPct * 0.4;
      
      const topW = topPct * maxFunnelW;
      const botW = botPct * maxFunnelW;
      
      // Calculate Y coords
      const yTop = idx * stepH;
      const yBot = (idx + 1) * stepH;
      
      // Calculate X coords
      const xTopLeft = (svgW - topW) / 2;
      const xTopRight = (svgW + topW) / 2;
      const xBotLeft = (svgW - botW) / 2;
      const xBotRight = (svgW + botW) / 2;
      
      // Construct SVG points string: "x1,y1 x2,y2 x3,y3 x4,y4"
      const points = `${xTopLeft},${yTop} ${xTopRight},${yTop} ${xBotRight},${yBot} ${xBotLeft},${yBot}`;
      
      const color = item.color || this.colors()[idx % this.colors().length];
      
      return {
        name: item.name,
        value: item.value,
        points,
        color,
        yCenter: (yTop + yBot) / 2
      };
    });
  });

  onMouseMove(event: MouseEvent, index: number): void {
    const el = event.currentTarget as SVGElement;
    const rect = el.getBoundingClientRect();
    const parentRect = el.parentElement?.parentElement?.getBoundingClientRect();
    if (parentRect) {
      this.tooltipX.set(event.clientX - parentRect.left);
      this.tooltipY.set(event.clientY - parentRect.top);
    }
  }

  readonly fmtNum = fmtNum;
}
