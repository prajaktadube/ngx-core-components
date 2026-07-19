import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, TemplateRef, viewChild, HostListener
} from '@angular/core';
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { CHART_COLORS, fmtNum } from '../shared/chart-utils';

export interface VennRegion {
  key: string;
  label: string;
  value: number;
  color: string;
  textX: number;
  textY: number;
}

@Component({
  selector: 'ngx-venn-diagram',
  standalone: true,
  imports: [CommonModule, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-venn" (mouseleave)="onMouseLeave()">
      <div class="chart-header" (mousemove)="$event.stopPropagation()" (mouseleave)="onMouseLeave()">
        <div class="header-info">
          <span class="header-title">Venn Diagram Overlap</span>
          <span class="header-subtitle">Sets: {{ sets().join(', ') }}</span>
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

      <svg
        #svgEl
        class="venn-svg"
        [attr.width]="'100%'"
        [attr.height]="svgHeight()"
        (mousemove)="onSvgMouseMove($event)"
      >
        <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
          <!-- Venn Circles Fills -->
          @for (c of circles(); track c.id) {
            <circle
              [attr.cx]="c.cx"
              [attr.cy]="c.cy"
              [attr.r]="c.r"
              [attr.fill]="c.color"
              class="venn-circle-shape"
              [class.active-c]="isCircleActive(c.id)"
            />
          }

          <!-- Venn Borders (drawn separately to stack on top of fills) -->
          @for (c of circles(); track c.id) {
            <circle
              [attr.cx]="c.cx"
              [attr.cy]="c.cy"
              [attr.r]="c.r"
              fill="none"
              [attr.stroke]="c.color"
              stroke-width="2.5"
              pointer-events="none"
            />
          }

          <!-- Centroid Labels -->
          @for (r of computedRegions(); track r.key; let i = $index) {
            <g
              class="region-label-group"
              [class.highlighted]="hoveredRegionKey() === r.key"
            >
              <text
                [attr.x]="r.textX"
                [attr.y]="r.textY"
                text-anchor="middle"
                class="region-label"
              >
                {{ r.label }}
              </text>
              <text
                [attr.x]="r.textX"
                [attr.y]="r.textY + 12"
                text-anchor="middle"
                class="region-val"
              >
                {{ formatNumber(r.value) }}
              </text>
            </g>
          }
        </g>
      </svg>

      <!-- Glassmorphic Tooltip -->
      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="tooltipX()" [style.top.px]="tooltipY()">
          @if (tooltipTemplate()) {
            <ng-container
              *ngTemplateOutlet="tooltipTemplate()!; context: { $implicit: t }"
            ></ng-container>
          } @else {
            <div class="tt-cat" [style.color]="t.color">{{ t.label }}</div>
            <div class="tt-row">
              <span class="tt-name">Overlap Value</span>
              <span class="tt-val">{{ labelFormatter() ? labelFormatter()!(t.value) : formatNumber(t.value) }}</span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: relative;
    }
    .ngx-venn {
      background: var(--ngx-chart-bg, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 16px;
      padding: 16px;
      box-sizing: border-box;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
      position: relative;
      width: 100%;
    }
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      min-height: 24px;
      position: relative;
    }
    .header-info {
      display: flex;
      flex-direction: column;
    }
    .header-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--ngx-chart-axis-text, #334155);
    }
    .header-subtitle {
      font-size: 11px;
      font-weight: 500;
      color: var(--ngx-chart-axis-text, #64748b);
    }
    .venn-svg {
      display: block;
      overflow: visible;
    }
    .venn-circle-shape {
      mix-blend-mode: multiply;
      opacity: 0.35;
      transition: opacity 0.2s ease, transform 0.2s ease;
    }
    .venn-circle-shape.active-c {
      opacity: 0.55;
    }
    .region-label-group {
      pointer-events: none;
      user-select: none;
      opacity: 0.75;
      transition: opacity 0.15s ease, transform 0.15s ease;
    }
    .region-label-group.highlighted {
      opacity: 1;
      transform: scale(1.05);
    }
    .region-label {
      font-size: 10.5px;
      font-weight: 700;
      fill: #1e293b;
    }
    .region-val {
      font-size: 9px;
      font-weight: 600;
      fill: #475569;
    }

    /* Glassmorphic Tooltip */
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
      min-width: 140px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      z-index: 100;
      transition: left 0.1s cubic-bezier(0.16, 1, 0.3, 1), top 0.1s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .tt-cat {
      font-weight: 700;
      margin-bottom: 6px;
      font-size: 12.5px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      padding-bottom: 4px;
    }
    .tt-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 4px;
    }
    .tt-name {
      color: rgba(248, 250, 252, 0.8);
      flex: 1;
    }
    .tt-val {
      font-weight: 700;
      font-family: monospace;
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
export class VennDiagramComponent {
  sets = input<string[]>(['A', 'B']);
  sizes = input<Record<string, number>>({});
  height = input<number>(350);
  colors = input<string[]>(CHART_COLORS);
  showExport = input<boolean>(false);
  labelFormatter = input<((v: number) => string) | undefined>(undefined);
  tooltipTemplate = input<TemplateRef<any> | null>(null);

  containerWidth = signal<number>(500);
  hoveredRegionKey = signal<string | null>(null);
  tooltip = signal<any | null>(null);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);
  exportMenuOpen = signal(false);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  margin = computed(() => ({
    top: 10,
    right: 10,
    bottom: 10,
    left: 10
  }));

  svgHeight = computed(() => this.height());
  innerW = computed(() => Math.max(10, this.containerWidth() - this.margin().left - this.margin().right));
  innerH = computed(() => Math.max(10, this.svgHeight() - this.margin().top - this.margin().bottom));

  isThreeSets = computed<boolean>(() => this.sets().length >= 3);

  // Geometry configuration of circles
  circles = computed(() => {
    const is3 = this.isThreeSets();
    const w = this.innerW();
    const h = this.innerH();
    const cols = this.colors();

    if (!is3) {
      // 2 circles
      const r = Math.min(w, h) * 0.32;
      const cxA = w / 2 - r * 0.45;
      const cxB = w / 2 + r * 0.45;
      const cy = h / 2;

      return [
        { id: 'A', cx: cxA, cy, r, color: cols[0] || '#4a90d9' },
        { id: 'B', cx: cxB, cy, r, color: cols[1] || '#ff6358' }
      ];
    } else {
      // 3 circles
      const r = Math.min(w, h) * 0.28;
      const cxA = w / 2;
      const cyA = h / 2 - r * 0.38;
      const cxB = w / 2 - r * 0.45;
      const cyB = h / 2 + r * 0.4;
      const cxC = w / 2 + r * 0.45;
      const cyC = h / 2 + r * 0.4;

      return [
        { id: 'A', cx: cxA, cy: cyA, r, color: cols[0] || '#4a90d9' },
        { id: 'B', cx: cxB, cy: cyB, r, color: cols[1] || '#ff6358' },
        { id: 'C', cx: cxC, cy: cyC, r, color: cols[2] || '#27ae60' }
      ];
    }
  });

  computedRegions = computed<VennRegion[]>(() => {
    const is3 = this.isThreeSets();
    const sizeMap = this.sizes();
    const circs = this.circles();
    const labels = this.sets();
    const cols = this.colors();

    const labelA = labels[0] || 'A';
    const labelB = labels[1] || 'B';

    if (!is3) {
      const cA = circs[0];
      const cB = circs[1];

      return [
        {
          key: 'A',
          label: `${labelA} only`,
          value: sizeMap['A'] ?? 100,
          color: cA.color,
          textX: cA.cx - cA.r * 0.4,
          textY: cA.cy - 5
        },
        {
          key: 'B',
          label: `${labelB} only`,
          value: sizeMap['B'] ?? 80,
          color: cB.color,
          textX: cB.cx + cB.r * 0.4,
          textY: cB.cy - 5
        },
        {
          key: 'A&B',
          label: 'Overlap',
          value: sizeMap['A&B'] ?? 30,
          color: cols[2] || '#f39c12',
          textX: (cA.cx + cB.cx) / 2,
          textY: cA.cy - 5
        }
      ];
    } else {
      const labelC = labels[2] || 'C';
      const cA = circs[0];
      const cB = circs[1];
      const cC = circs[2];

      return [
        {
          key: 'A',
          label: `${labelA} only`,
          value: sizeMap['A'] ?? 120,
          color: cA.color,
          textX: cA.cx,
          textY: cA.cy - cA.r * 0.45
        },
        {
          key: 'B',
          label: `${labelB} only`,
          value: sizeMap['B'] ?? 100,
          color: cB.color,
          textX: cB.cx - cB.r * 0.4,
          textY: cB.cy + cB.r * 0.25
        },
        {
          key: 'C',
          label: `${labelC} only`,
          value: sizeMap['C'] ?? 90,
          color: cC.color,
          textX: cC.cx + cC.r * 0.4,
          textY: cC.cy + cC.r * 0.25
        },
        {
          key: 'A&B',
          label: `${labelA} ∩ ${labelB}`,
          value: sizeMap['A&B'] ?? 40,
          color: cols[3] || '#f39c12',
          textX: (cA.cx + cB.cx) / 2 - 10,
          textY: (cA.cy + cB.cy) / 2 - 10
        },
        {
          key: 'B&C',
          label: `${labelB} ∩ ${labelC}`,
          value: sizeMap['B&C'] ?? 30,
          color: cols[4] || '#8e44ad',
          textX: (cB.cx + cC.cx) / 2,
          textY: (cB.cy + cC.cy) / 2 + 15
        },
        {
          key: 'A&C',
          label: `${labelA} ∩ ${labelC}`,
          value: sizeMap['A&C'] ?? 25,
          color: cols[5] || '#1abc9c',
          textX: (cA.cx + cC.cx) / 2 + 10,
          textY: (cA.cy + cC.cy) / 2 - 10
        },
        {
          key: 'A&B&C',
          label: 'Intersection',
          value: sizeMap['A&B&C'] ?? 15,
          color: '#34495e',
          textX: cA.cx,
          textY: (cA.cy + cB.cy) / 2 + 5
        }
      ];
    }
  });

  isCircleActive(cId: string): boolean {
    const rKey = this.hoveredRegionKey();
    if (!rKey) return false;
    return rKey.includes(cId);
  }

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

  onSvgMouseMove(event: MouseEvent) {
    const svg = this.svgEl()?.nativeElement;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const mx = event.clientX - rect.left - this.margin().left;
    const my = event.clientY - rect.top - this.margin().top;

    const circs = this.circles();
    const is3 = this.isThreeSets();

    // Calculate containment in circles A, B (and C)
    const inA = this.inCircle(mx, my, circs[0]);
    const inB = this.inCircle(mx, my, circs[1]);
    const inC = is3 ? this.inCircle(mx, my, circs[2]) : false;

    let regionKey = '';
    if (is3) {
      if (inA && inB && inC) regionKey = 'A&B&C';
      else if (inA && inB) regionKey = 'A&B';
      else if (inB && inC) regionKey = 'B&C';
      else if (inA && inC) regionKey = 'A&C';
      else if (inA) regionKey = 'A';
      else if (inB) regionKey = 'B';
      else if (inC) regionKey = 'C';
    } else {
      if (inA && inB) regionKey = 'A&B';
      else if (inA) regionKey = 'A';
      else if (inB) regionKey = 'B';
    }

    if (regionKey) {
      this.hoveredRegionKey.set(regionKey);
      const region = this.computedRegions().find(r => r.key === regionKey);
      if (region) {
        this.tooltip.set(region);
        const parentRect = svg.parentElement?.getBoundingClientRect();
        if (parentRect) {
          this.tooltipX.set(event.clientX - parentRect.left);
          this.tooltipY.set(event.clientY - parentRect.top);
        }
      }
    } else {
      this.hoveredRegionKey.set(null);
      this.tooltip.set(null);
    }
  }

  private inCircle(x: number, y: number, circle: { cx: number; cy: number; r: number }): boolean {
    const dx = x - circle.cx;
    const dy = y - circle.cy;
    return dx * dx + dy * dy <= circle.r * circle.r;
  }

  onMouseLeave() {
    this.hoveredRegionKey.set(null);
    this.tooltip.set(null);
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

  exportToCsv(): void {
    const regions = this.computedRegions();
    if (!regions.length) return;

    let csv = 'Region Key,Region Label,Overlap Value\n';
    regions.forEach(r => {
      csv += `"${r.key}","${r.label}",${r.value}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'venn-diagram-data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToJson(): void {
    const regions = this.computedRegions();
    if (!regions.length) return;

    const data = regions.map(r => ({
      regionKey: r.key,
      label: r.label,
      value: r.value
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'venn-diagram-data.json');
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
    link.setAttribute('download', 'venn-diagram.svg');
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
        <title>Venn Diagram Export</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #0f172a; text-align: center; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 24px; text-align: left; }
          .title { font-size: 20px; font-weight: bold; }
          .date { font-size: 12px; color: #64748b; }
          .chart-container { display: inline-block; margin-top: 24px; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; background: #ffffff; width: 90%; }
          svg { width: 100%; height: auto; }
          .region-label { font-size: 10.5px; font-weight: bold; fill: #1e293b; }
          .region-val { font-size: 9px; fill: #475569; }
          @media print {
            body { padding: 0; }
            .chart-container { border: none; padding: 0; width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">Venn Intersection Overlap Analysis</div>
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

  formatNumber(v: number): string {
    return fmtNum(v);
  }
}
