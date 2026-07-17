import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, viewChild, HostListener
} from '@angular/core';
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
      <div class="chart-header" (mousemove)="$event.stopPropagation()" (mouseleave)="hoveredIndex.set(null)">
        <div class="chart-title-space"></div>
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

      <div class="funnel-layout">
        <!-- SVG Visual Funnel / Pyramid -->
        <div class="funnel-graphic" (mouseleave)="hoveredIndex.set(null)">
          <svg
            #svgEl
            [attr.width]="'100%'"
            [attr.height]="height()"
            viewBox="0 0 400 300"
            preserveAspectRatio="xMidYMid meet"
            class="funnel-svg"
          >
            <defs>
              @for (stage of funnelStages(); track stage.name; let i = $index) {
                <linearGradient [id]="'funnel-grad-' + i" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" [attr.stop-color]="stage.color" />
                  <stop offset="100%" [attr.stop-color]="stage.color" stop-opacity="0.65" />
                </linearGradient>
              }
            </defs>
            <g>
              @for (stage of funnelStages(); track stage.name; let i = $index) {
                <polygon
                  [attr.points]="stage.points"
                  [attr.fill]="'url(#funnel-grad-' + i + ')'"
                  [class.active]="hoveredIndex() === i"
                  [style.transform-origin]="'200px ' + stage.yCenter + 'px'"
                  [style.animation-delay]="i * 0.06 + 's'"
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
                <div class="tt-cat">{{ stage.name }}</div>
                <div class="tt-row">
                  <span class="tt-dot" [style.background]="stage.color"></span>
                  <span class="tt-name">Value</span>
                  <span class="tt-val">{{ fmtNum(stage.value) }}</span>
                </div>
                <div class="tt-row">
                  <span class="tt-dot" style="background: transparent;"></span>
                  <span class="tt-name">{{ mode() === 'funnel' ? 'Conversion' : 'Share' }}</span>
                  <span class="tt-val">
                    {{ (mode() === 'funnel' ? (stage.value / funnelStages()[0].value) : (stage.value / totalValue())) | percent:'1.0-1' }}
                  </span>
                </div>
              </div>
            }
          }
        </div>

        <!-- Sidebar legend & metric checklist -->
        <div class="funnel-legend" (mousemove)="$event.stopPropagation()" (mouseleave)="hoveredIndex.set(null)">
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
                    {{ (mode() === 'funnel' ? (stage.value / funnelStages()[0].value) : (stage.value / totalValue())) | percent:'1.0-1' }}
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
      background: var(--ngx-chart-bg, #ffffff);
      border: 1px solid var(--ngx-chart-grid, #ebedf0);
      border-radius: 16px;
      padding: 20px;
      position: relative;
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

    @keyframes funnelBuildIn {
      from { transform: scaleY(0); opacity: 0; }
      to { transform: scaleY(1); opacity: 1; }
    }

    .funnel-polygon {
      cursor: pointer;
      opacity: 0.88;
      transition: opacity 0.25s, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), filter 0.25s;
      animation: funnelBuildIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    .funnel-polygon:hover, .funnel-polygon.active {
      opacity: 1;
      transform: scale(1.03);
      filter: drop-shadow(0 8px 16px rgba(0,0,0,0.18)) brightness(1.03);
    }

    /* Glassmorphic Tooltip styling */
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
      min-width: 155px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      z-index: 100;
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
      gap: 16px;
    }
    .legend-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--ngx-chart-text, #0f172a);
    }
    .legend-metrics {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .metric-value {
      font-size: 13px;
      font-weight: 700;
      color: var(--ngx-chart-text, #0f172a);
    }
    .metric-pct {
      font-size: 11px;
      color: var(--ngx-chart-axis-text, #64748b);
      background: var(--ngx-chart-grid, #f1f5f9);
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
    }

    /* Header and Export dropdown styles */
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      min-height: 24px;
      position: relative;
    }
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
export class FunnelChartComponent {
  data = input<FunnelItem[]>([]);
  height = input<number>(300);
  colors = input<string[]>(CHART_COLORS);
  mode = input<'funnel' | 'pyramid'>('funnel');
  showExport = input<boolean>(false);

  hoveredIndex = signal<number | null>(null);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);
  exportMenuOpen = signal(false);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  totalValue = computed(() => {
    return this.data().reduce((sum, item) => sum + item.value, 0) || 1;
  });

  // Computes the SVG polygon coordinates for the funnel / pyramid steps
  funnelStages = computed(() => {
    const items = this.data();
    if (items.length === 0) return [];
    
    const count = items.length;
    const svgW = 400;
    const svgH = 300;
    const maxFunnelW = 320;

    if (this.mode() === 'pyramid') {
      // Pyramid Mode: Stacks vertically to form a triangle pointing up.
      const totalVal = this.totalValue();
      let currentY = 0;

      return items.map((item, idx) => {
        const h = (item.value / totalVal) * svgH;
        const yTop = currentY;
        const yBot = currentY + h;

        const wTop = (yTop / svgH) * maxFunnelW;
        const wBot = (yBot / svgH) * maxFunnelW;

        const xTopLeft = (svgW - wTop) / 2;
        const xTopRight = (svgW + wTop) / 2;
        const xBotLeft = (svgW - wBot) / 2;
        const xBotRight = (svgW + wBot) / 2;

        const points = `${xTopLeft},${yTop} ${xTopRight},${yTop} ${xBotRight},${yBot} ${xBotLeft},${yBot}`;
        const color = item.color || this.colors()[idx % this.colors().length];

        currentY += h;

        return {
          name: item.name,
          value: item.value,
          points,
          color,
          yCenter: (yTop + yBot) / 2
        };
      });
    } else {
      // Standard Funnel Mode
      const maxVal = items[0]?.value || 1;
      const stepH = svgH / count;
      
      return items.map((item, idx) => {
        const topPct = item.value / maxVal;
        const botPct = idx < count - 1 ? items[idx + 1].value / maxVal : topPct * 0.4;
        
        const topW = topPct * maxFunnelW;
        const botW = botPct * maxFunnelW;
        
        const yTop = idx * stepH;
        const yBot = (idx + 1) * stepH;
        
        const xTopLeft = (svgW - topW) / 2;
        const xTopRight = (svgW + topW) / 2;
        const xBotLeft = (svgW - botW) / 2;
        const xBotRight = (svgW + botW) / 2;
        
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
    }
  });

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
    const data = this.data();
    if (!data.length) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'funnel-chart-data.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToCsv(): void {
    const data = this.data();
    if (!data.length) return;
    let csv = 'Name,Value\n';
    data.forEach(d => {
      csv += `"${d.name || ''}",${d.value}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'funnel-chart-data.csv');
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
    link.setAttribute('download', 'funnel-chart.svg');
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

  onMouseMove(event: MouseEvent, index: number): void {
    const el = event.currentTarget as SVGElement;
    const parentRect = el.parentElement?.parentElement?.getBoundingClientRect();
    if (parentRect) {
      this.tooltipX.set(event.clientX - parentRect.left);
      this.tooltipY.set(event.clientY - parentRect.top);
    }
  }

  readonly fmtNum = fmtNum;
}
