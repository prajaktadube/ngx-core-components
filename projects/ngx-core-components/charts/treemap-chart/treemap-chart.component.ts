import { Component, input, output, signal, computed, ChangeDetectionStrategy, viewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TreemapItem {
  label: string;
  value: number;
  color?: string;
}

interface LayoutItem extends TreemapItem {
  x: number;
  y: number;
  w: number;
  h: number;
  displayColor: string;
}

@Component({
  selector: 'ngx-treemap-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-treemap-wrapper">
      <div class="chart-header" (mousemove)="$event.stopPropagation()" (mouseleave)="onItemLeave()">
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

      <div class="ngx-treemap-container">
        <!-- SVG Canvas -->
        <svg
          #svgEl
          class="ngx-treemap-svg"
          viewBox="0 0 500 300"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="treemap-sheen" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.18" />
              <stop offset="100%" stop-color="#ffffff" stop-opacity="0.0" />
            </linearGradient>
          </defs>

          @for (item of layoutRects(); track item.label; let idx = $index) {
            <g
              class="treemap-group"
              [style.transform-origin]="(item.x + item.w/2) + 'px ' + (item.y + item.h/2) + 'px'"
              [style.animation-delay]="idx * 0.03 + 's'"
              (mouseenter)="onItemEnter(item, $event)"
              (mouseleave)="onItemLeave()"
              (click)="onItemClick(item)"
            >
              <!-- Cell Box -->
              <rect
                [attr.x]="item.x"
                [attr.y]="item.y"
                [attr.width]="item.w"
                [attr.height]="item.h"
                [attr.fill]="item.displayColor"
                class="treemap-rect"
                rx="4"
                ry="4"
              />

              <!-- Glass Sheen Overlay -->
              <rect
                [attr.x]="item.x"
                [attr.y]="item.y"
                [attr.width]="item.w"
                [attr.height]="item.h"
                fill="url(#treemap-sheen)"
                rx="4"
                ry="4"
                pointer-events="none"
              />
              
              <!-- Labels (Only show if rectangle is large enough) -->
              @if (item.w > 50 && item.h > 30) {
                <text
                  [attr.x]="item.x + 8"
                  [attr.y]="item.y + 18"
                  class="treemap-label"
                >
                  {{ item.label }}
                </text>
                @if (item.h > 45) {
                  <text
                    [attr.x]="item.x + 8"
                    [attr.y]="item.y + 32"
                    class="treemap-value"
                  >
                    {{ item.value.toLocaleString() }}
                  </text>
                }
              }
            </g>
          }
        </svg>

        <!-- Glassmorphic Tooltip Overlay -->
        @if (tooltip().show) {
          <div
            class="treemap-tooltip"
            [style.left.px]="tooltip().x"
            [style.top.px]="tooltip().y"
          >
            <div class="tt-cat">{{ tooltip().title }}</div>
            <div class="tt-row">
              <span class="tt-dot" [style.background]="tooltip().color"></span>
              <span class="tt-name">Value</span>
              <span class="tt-val">{{ tooltip().value }}</span>
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
    .ngx-treemap-wrapper {
      width: 100%;
      height: 100%;
      padding: 16px;
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 12px;
      box-shadow: var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05));
      position: relative;
    }
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      min-height: 24px;
      position: relative;
      margin-bottom: 12px;
    }
    .ngx-treemap-container {
      position: relative;
      width: 100%;
      height: 100%;
    }
    .ngx-treemap-svg {
      width: 100%;
      height: 100%;
      display: block;
      overflow: visible;
    }

    @keyframes treemapScaleIn {
      from { opacity: 0; transform: scale(0.92); }
      to { opacity: 1; transform: scale(1); }
    }

    .treemap-group {
      cursor: pointer;
      animation: treemapScaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .treemap-group:hover {
      transform: scale(1.025);
    }
    .treemap-rect {
      stroke: var(--bg-secondary, #ffffff);
      stroke-width: 1.5px;
      transition: fill 0.2s ease, stroke 0.2s ease, filter 0.2s ease;
    }
    .treemap-group:hover .treemap-rect {
      filter: brightness(1.06) drop-shadow(0 4px 12px rgba(0,0,0,0.22));
      stroke: var(--ngx-chart-hover-stroke, #0f172a);
      stroke-width: 2px;
    }
    .treemap-label {
      font-size: 11px;
      font-weight: 750;
      fill: #ffffff;
      font-family: inherit;
      pointer-events: none;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }
    .treemap-value {
      font-size: 9px;
      font-weight: 600;
      fill: rgba(255, 255, 255, 0.95);
      font-family: inherit;
      pointer-events: none;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }

    /* Glassmorphic Tooltip styling */
    .treemap-tooltip {
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

    /* Export Trigger & Dropdown */
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
export class TreemapChartComponent {
  data = input.required<TreemapItem[]>();
  colors = input<string[]>(['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']);
  showExport = input<boolean>(false);

  itemClick = output<TreemapItem>();

  exportMenuOpen = signal(false);
  tooltip = signal<{ show: boolean; title: string; value: string; x: number; y: number; color: string }>({
    show: false,
    title: '',
    value: '',
    x: 0,
    y: 0,
    color: ''
  });

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  layoutRects = computed(() => {
    const rawData = this.data();
    if (!rawData || rawData.length === 0) return [];

    // Sort items descending by value
    const items = [...rawData].sort((a, b) => b.value - a.value);
    const totalVal = items.reduce((sum, item) => sum + item.value, 0);

    const layoutList: LayoutItem[] = [];
    
    // Canvas viewBox is 500x300. Leave a tiny padding margin around
    const w = 500;
    const h = 300;

    const colorsList = this.colors();

    this.subdivide(items, 0, 0, w, h, totalVal, (item, rx, ry, rw, rh, index) => {
      const displayColor = item.color || colorsList[index % colorsList.length];
      layoutList.push({
        ...item,
        x: rx,
        y: ry,
        w: rw,
        h: rh,
        displayColor
      });
    }, 0);

    return layoutList;
  });

  private subdivide(
    items: TreemapItem[],
    x: number,
    y: number,
    w: number,
    h: number,
    totalVal: number,
    callback: (item: TreemapItem, rx: number, ry: number, rw: number, rh: number, index: number) => void,
    startIndex: number
  ) {
    if (items.length === 0) return;
    if (items.length === 1) {
      callback(items[0], x, y, w, h, startIndex);
      return;
    }

    // Proportional division
    let splitIdx = 1;
    let group1Sum = items[0].value;
    let minDiff = Math.abs(group1Sum - (totalVal - group1Sum));

    for (let i = 2; i < items.length; i++) {
      const tempSum = group1Sum + items[i - 1].value;
      const tempDiff = Math.abs(tempSum - (totalVal - tempSum));
      if (tempDiff < minDiff) {
        group1Sum = tempSum;
        splitIdx = i;
        minDiff = tempDiff;
      } else {
        break;
      }
    }

    const group1 = items.slice(0, splitIdx);
    const group2 = items.slice(splitIdx);
    const group2Sum = totalVal - group1Sum;

    // Split on wider axis
    if (w > h) {
      const w1 = w * (group1Sum / totalVal);
      const w2 = w - w1;
      this.subdivide(group1, x, y, w1, h, group1Sum, callback, startIndex);
      this.subdivide(group2, x + w1, y, w2, h, group2Sum, callback, startIndex + splitIdx);
    } else {
      const h1 = h * (group1Sum / totalVal);
      const h2 = h - h1;
      this.subdivide(group1, x, y, w, h1, group1Sum, callback, startIndex);
      this.subdivide(group2, x, y + h1, w, h2, group2Sum, callback, startIndex + splitIdx);
    }
  }

  onItemEnter(item: LayoutItem, event: MouseEvent): void {
    const rect = (event.currentTarget as SVGGraphicsElement).getBoundingClientRect();
    const parentRect = (event.currentTarget as SVGGraphicsElement).ownerSVGElement!.parentElement!.getBoundingClientRect();
    const x = rect.left - parentRect.left + rect.width / 2;
    const y = rect.top - parentRect.top;

    this.tooltip.set({
      show: true,
      title: item.label,
      value: item.value.toLocaleString(),
      x,
      y,
      color: item.displayColor
    });
  }

  onItemLeave(): void {
    this.tooltip.update(t => ({ ...t, show: false }));
  }

  onItemClick(item: LayoutItem): void {
    this.itemClick.emit(item);
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
    const data = this.data();
    if (!data.length) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'treemap-chart.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToCsv(): void {
    const data = this.data();
    if (!data.length) return;
    let csv = 'Label,Value\n';
    data.forEach(d => {
      csv += `"${d.label || ''}",${d.value}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'treemap-chart.csv');
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
    link.setAttribute('download', 'treemap-chart.svg');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToPdf(): void {
    const svg = this.svgEl()?.nativeElement;
    if (!svg) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svg);
    if (!svgString.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
      svgString = svgString.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Chart Export</title>
          <style>
            body {
              margin: 20px;
              font-family: system-ui, sans-serif;
              text-align: center;
            }
            .print-container {
              display: inline-block;
              margin: 0 auto;
            }
            svg {
              width: 100%;
              height: auto;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${svgString}
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 250);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}
