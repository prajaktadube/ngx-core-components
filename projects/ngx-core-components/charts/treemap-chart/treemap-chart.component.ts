import { Component, input, output, signal, computed } from '@angular/core';
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
  template: `
    <div class="ngx-treemap-wrapper">
      <div class="ngx-treemap-container">
        <!-- SVG Canvas -->
        <svg
          class="ngx-treemap-svg"
          viewBox="0 0 500 300"
          preserveAspectRatio="xMidYMid meet"
        >
          @for (item of layoutRects(); track item.label; let idx = $index) {
            <g
              class="treemap-group"
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
            <div class="tooltip-title">{{ tooltip().title }}</div>
            <div class="tooltip-row">
              <span>Value:</span>
              <strong>{{ tooltip().value }}</strong>
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
    .treemap-group {
      cursor: pointer;
    }
    .treemap-rect {
      stroke: var(--bg-secondary, #ffffff);
      stroke-width: 1.5px;
      transition: fill 0.2s ease, stroke 0.15s ease, filter 0.15s ease;
    }
    .treemap-group:hover .treemap-rect {
      filter: brightness(1.06) drop-shadow(0 2px 8px rgba(0,0,0,0.12));
      stroke: var(--primary-color, #4f46e5);
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
    .treemap-tooltip {
      position: absolute;
      z-index: 100;
      pointer-events: none;
      background: rgba(15, 23, 42, 0.94);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 6px;
      padding: 8px 12px;
      color: #ffffff;
      font-family: inherit;
      font-size: 11px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(8px);
      transform: translate(-50%, -115%);
      min-width: 120px;
    }
    .tooltip-title {
      font-weight: 700;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      padding-bottom: 4px;
      margin-bottom: 4px;
      font-size: 12px;
    }
    .tooltip-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
    }
    .tooltip-row strong {
      color: #fbbf24;
    }
  `]
})
export class TreemapChartComponent {
  data = input.required<TreemapItem[]>();
  colors = input<string[]>(['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']);

  itemClick = output<TreemapItem>();

  tooltip = signal<{ show: boolean; title: string; value: string; x: number; y: number }>({
    show: false,
    title: '',
    value: '',
    x: 0,
    y: 0
  });

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
      y
    });
  }

  onItemLeave(): void {
    this.tooltip.update(t => ({ ...t, show: false }));
  }

  onItemClick(item: LayoutItem): void {
    this.itemClick.emit(item);
  }
}
