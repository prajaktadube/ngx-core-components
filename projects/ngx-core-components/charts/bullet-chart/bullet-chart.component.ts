import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, HostListener, viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngx-bullet-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-bullet-chart">
      <!-- Toolbar with Export option -->
      <div class="chart-header" (mousemove)="$event.stopPropagation()">
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

      <svg
        #svgEl
        class="bullet-svg"
        [attr.width]="'100%'"
        [attr.height]="svgHeight()"
      >
        <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
          <!-- Background Ranges -->
          @for (r of rangeRects(); track $index) {
            <rect
              [attr.x]="r.x"
              [attr.y]="0"
              [attr.width]="r.width"
              [attr.height]="barHeight()"
              [attr.fill]="r.color"
              class="bullet-range"
            />
          }

          <!-- Actual Value Bar -->
          <rect
            [attr.x]="0"
            [attr.y]="valBarY()"
            [attr.width]="valBarWidth()"
            [attr.height]="valBarHeight()"
            [attr.fill]="valueColor()"
            class="bullet-value-bar"
          />

          <!-- Target Line Marker -->
          <line
            [attr.x1]="targetX()"
            [attr.x2]="targetX()"
            [attr.y1]="targetY1()"
            [attr.y2]="targetY2()"
            [attr.stroke]="targetColor()"
            stroke-width="3"
            class="bullet-target-marker"
          />

          <!-- Value Labels / Ticks at bottom -->
          @if (showLabels()) {
            <g class="bullet-labels" [attr.transform]="'translate(0,' + (barHeight() + 14) + ')'">
              <!-- Min tick -->
              <text x="0" text-anchor="middle" class="tick-label">0</text>
              
              <!-- Range ticks -->
              @for (val of ranges(); track val) {
                <text
                  [attr.x]="xPos(val)"
                  text-anchor="middle"
                  class="tick-label"
                >{{ val }}</text>
              }

              <!-- Max tick -->
              <text [attr.x]="innerW()" text-anchor="middle" class="tick-label">{{ max() }}</text>
            </g>
          }
        </g>
      </svg>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .ngx-bullet-chart {
      width: 100%;
      background: var(--ngx-chart-bg, #fff);
      font-family: inherit;
    }
    .bullet-svg {
      display: block;
      overflow: visible;
    }
    .bullet-range {
      transition: width 0.3s ease, x 0.3s ease;
    }
    .bullet-value-bar {
      transition: width 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .bullet-target-marker {
      transition: x1 0.5s cubic-bezier(0.16, 1, 0.3, 1), x2 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .tick-label {
      font-size: 10px;
      fill: var(--ngx-chart-axis-text, #64748b);
      font-weight: 550;
      user-select: none;
    }

    /* Export styles */
    .chart-export-menu {
      position: relative;
      z-index: 50;
      margin-bottom: 8px;
    }
    .export-trigger {
      float: right;
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
      z-index: 60;
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
    .chart-header { display: flex; justify-content: space-between; align-items: center; min-height: 24px; position: relative; }
  `]
})
export class BulletChartComponent {
  value = input<number>(0);
  target = input<number>(0);
  max = input<number>(100);
  ranges = input<number[]>([50, 85, 100]);
  rangeColors = input<string[]>(['#f1f5f9', '#e2e8f0', '#cbd5e1']);
  valueColor = input<string>('#4f46e5');
  targetColor = input<string>('#ef4444');
  height = input<number>(50);
  showLabels = input<boolean>(true);
  showExport = input<boolean>(false);

  containerWidth = signal<number>(500);
  exportMenuOpen = signal(false);
  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  margin = computed(() => ({
    top: 5,
    right: 15,
    bottom: this.showLabels() ? 20 : 5,
    left: 15
  }));

  svgHeight = computed(() => this.height() + this.margin().top + this.margin().bottom);
  innerW = computed(() => Math.max(10, this.containerWidth() - this.margin().left - this.margin().right));
  barHeight = computed(() => this.height());

  // Value bar sizing
  valBarHeight = computed(() => this.barHeight() * 0.35);
  valBarY = computed(() => (this.barHeight() - this.valBarHeight()) / 2);

  // Target marker sizing
  targetY1 = computed(() => this.barHeight() * 0.15);
  targetY2 = computed(() => this.barHeight() * 0.85);

  constructor() {
    const hostEl = inject(ElementRef).nativeElement;
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(entries => {
        if (!entries || entries.length === 0) return;
        const width = entries[0].contentRect.width;
        if (width > 0) {
          this.containerWidth.set(width);
        }
      });
      resizeObserver.observe(hostEl);
      inject(DestroyRef).onDestroy(() => resizeObserver.disconnect());
    }
  }

  xPos(v: number): number {
    const maxVal = this.max() || 1;
    const clamped = Math.max(0, Math.min(maxVal, v));
    return (clamped / maxVal) * this.innerW();
  }

  valBarWidth = computed(() => this.xPos(this.value()));
  targetX = computed(() => this.xPos(this.target()));

  rangeRects = computed(() => {
    const limits = this.ranges();
    const colors = this.rangeColors();
    const rects: Array<{ x: number; width: number; color: string }> = [];

    let prev = 0;
    limits.forEach((limit, idx) => {
      const x = this.xPos(prev);
      const width = Math.max(0, this.xPos(limit) - x);
      const color = colors[idx % colors.length];
      rects.push({ x, width, color });
      prev = limit;
    });

    return rects;
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

  exportToCsv(): void {
    const csv = `Value,Target,Max,Ranges\n${this.value()},${this.target()},${this.max()},"${this.ranges().join(';')}"\n`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'bullet-chart-data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToJson(): void {
    const data = {
      value: this.value(),
      target: this.target(),
      max: this.max(),
      ranges: this.ranges()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'bullet-chart-data.json');
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
    link.setAttribute('download', 'bullet-chart.svg');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToPdf(): void {
    const svg = this.svgEl()?.nativeElement;
    if (!svg || typeof window === 'undefined' || typeof document === 'undefined') return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocker prevented printing. Please allow pop-ups for this site.');
      return;
    }

    const svgHtml = svg.outerHTML;

    const printTemplate = `
      <html>
      <head>
        <title>Bullet Chart Export</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #0f172a; text-align: center; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 24px; text-align: left; }
          .title { font-size: 20px; font-weight: bold; }
          .date { font-size: 12px; color: #64748b; }
          .chart-container { display: inline-block; margin-top: 24px; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; background: #ffffff; width: 90%; }
          svg { width: 100%; height: auto; }
          .tick-label { font-size: 10px; fill: #64748b; font-weight: 550; }
          @media print {
            body { padding: 0; }
            .chart-container { border: none; padding: 0; width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">Bullet Chart Analytics</div>
          <div class="date">${new Date().toLocaleString()}</div>
        </div>
        <div class="chart-container">
          ${svgHtml}
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(printTemplate);
    printWindow.document.close();
  }
}
