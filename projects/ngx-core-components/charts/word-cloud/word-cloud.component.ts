import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, TemplateRef, viewChild
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { CHART_COLORS, fmtNum, scale } from '../shared/chart-utils';
import { ChartExportService } from '../shared/chart-export.service';
import { ChartExportMenuComponent } from '../shared/chart-export-menu.component';
import type { ExportFormat } from '../shared/chart-export-menu.component';

export interface WordItem {
  text: string;
  value: number;
  color?: string;
}

export interface PlacedWord {
  raw: WordItem;
  index: number;
  text: string;
  fontSize: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

@Component({
  selector: 'ngx-word-cloud',
  standalone: true,
  imports: [ChartExportMenuComponent, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-word-cloud" (mouseleave)="onMouseLeave()">
      <div class="chart-header" (mousemove)="$event.stopPropagation()" (mouseleave)="onMouseLeave()">
        <div class="header-info">
          <span class="header-title">Word Cloud Frequency</span>
          <span class="header-subtitle">Key terms analysis</span>
        </div>
        
        @if (showExport()) {
          <ngx-chart-export-menu (exportClicked)="onExport($event)" />
        }
      </div>

      <svg
        #svgEl
        class="word-cloud-svg"
        [attr.width]="'100%'"
        [attr.height]="svgHeight()"
      >
        <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
          @for (word of placedWords(); track word.index; let i = $index) {
            <g
              class="word-group"
              [class.dimmed]="hoveredIndex() !== null && hoveredIndex() !== i"
              [class.highlighted]="hoveredIndex() === i"
              [attr.transform]="'translate(' + word.x + ',' + word.y + ')'"
              (mouseenter)="onWordHover(i)"
              (mousemove)="onMouseMove($event)"
            >
              <text
                text-anchor="middle"
                dominant-baseline="central"
                [attr.font-size]="word.fontSize + 'px'"
                [attr.fill]="word.color"
                [style.font-weight]="'700'"
                class="cloud-word-text"
              >
                {{ word.text }}
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
            <div class="tt-cat">{{ t.text }}</div>
            <div class="tt-row">
              <span class="tt-name">Weight/Count</span>
              <span class="tt-val">{{ formatNumber(t.value) }}</span>
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
    .ngx-word-cloud {
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
    .word-cloud-svg {
      display: block;
      overflow: visible;
    }
    .word-group {
      cursor: pointer;
      transition: opacity 0.2s ease, transform 0.2s ease;
    }
    .word-group.dimmed {
      opacity: 0.18 !important;
    }
    .word-group.highlighted {
      transform: scale(1.1);
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.18));
      opacity: 1 !important;
    }
    .cloud-word-text {
      user-select: none;
      transition: fill 0.15s ease;
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
      min-width: 120px;
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
      color: #38bdf8;
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

  `]
})
export class WordCloudComponent {
  private readonly exportSvc = inject(ChartExportService);

  data = input<WordItem[]>([]);
  height = input<number>(350);
  colors = input<string[]>(CHART_COLORS);
  showExport = input<boolean>(false);
  tooltipTemplate = input<TemplateRef<any> | null>(null);

  containerWidth = signal<number>(500);
  hoveredIndex = signal<number | null>(null);
  tooltip = signal<any | null>(null);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);

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

  // Placement calculation based on Archimedean spiral
  placedWords = computed<PlacedWord[]>(() => {
    const raw = [...this.data()].sort((a, b) => b.value - a.value);
    if (raw.length === 0) return [];

    const w = this.innerW();
    const h = this.innerH();
    const cx = w / 2;
    const cy = h / 2;

    const minVal = Math.min(...raw.map(d => d.value));
    const maxVal = Math.max(1, ...raw.map(d => d.value));

    const cols = this.colors();
    const placed: PlacedWord[] = [];
    const boxes: BoundingBox[] = [];

    // Aspect ratio multiplier to handle non-square layout bounds
    const aspectRatio = w / h;

    raw.forEach((d, idx) => {
      // Scale font size
      const fSize = Math.round(scale(d.value, minVal, maxVal, 10, 42));

      // Bounding box approximation (standard average character width multiplier is 0.55)
      const wordW = d.text.length * fSize * 0.58;
      const wordH = fSize * 1.1;

      let placedSuccessfully = false;
      let theta = 0;
      let radiusMultiplier = 1.5;

      // Try placing along the Archimedean spiral
      for (let step = 0; step < 300; step++) {
        // Spiral equations
        const r = radiusMultiplier * theta;
        const x = cx + r * Math.cos(theta) * aspectRatio;
        const y = cy + r * Math.sin(theta);

        // Word box centered at (x, y)
        const box: BoundingBox = {
          x1: x - wordW / 2,
          y1: y - wordH / 2,
          x2: x + wordW / 2,
          y2: y + wordH / 2
        };

        // Collision check
        const collides = boxes.some(b => {
          return !(box.x2 < b.x1 || box.x1 > b.x2 || box.y2 < b.y1 || box.y1 > b.y2);
        });

        // Check if outside SVG bounds (leave 10px buffer)
        const outOfBounds = box.x1 < 10 || box.x2 > w - 10 || box.y1 < 10 || box.y2 > h - 10;

        if (!collides && !outOfBounds) {
          boxes.push(box);
          placed.push({
            raw: d,
            index: idx,
            text: d.text,
            fontSize: fSize,
            x,
            y,
            width: wordW,
            height: wordH,
            color: d.color || cols[idx % cols.length]
          });
          placedSuccessfully = true;
          break;
        }

        // Increment spiral parameters
        theta += 0.12;
      }

      // Fallback: If cannot fit, place on outer edge or omit to prevent clutter
      if (!placedSuccessfully) {
        // Place at random boundary spot
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.min(w, h) * 0.42;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        placed.push({
          raw: d,
          index: idx,
          text: d.text,
          fontSize: fSize,
          x,
          y,
          width: wordW,
          height: wordH,
          color: d.color || cols[idx % cols.length]
        });
      }
    });

    return placed;
  });

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

  onWordHover(idx: number) {
    this.hoveredIndex.set(idx);
    const word = this.placedWords()[idx];
    if (word) {
      this.tooltip.set(word.raw);
    }
  }

  onMouseMove(event: MouseEvent) {
    const el = event.currentTarget as SVGElement;
    const container = el.closest('.ngx-word-cloud');
    if (container) {
      const rect = container.getBoundingClientRect();
      this.tooltipX.set(event.clientX - rect.left);
      this.tooltipY.set(event.clientY - rect.top);
    }
  }

  onMouseLeave() {
    this.hoveredIndex.set(null);
    this.tooltip.set(null);
  }

  onExport(type: ExportFormat): void {
    if (type === 'json') this.exportToJson();
    else if (type === 'csv') this.exportToCsv();
    else if (type === 'svg') this.exportToSvg();
    else if (type === 'pdf') this.exportToPdf();
  }

  exportToCsv(): void {
    const words = this.placedWords();
    if (!words.length) return;
    const headers = ['Text', 'Value'];
    const rows = words.map(w => [w.text, w.raw.value]);
    this.exportSvc.downloadCsv(headers, rows, 'word-cloud-data.csv');
  }

  exportToJson(): void {
    const words = this.placedWords();
    if (!words.length) return;
    const data = words.map(w => ({
      text: w.text,
      value: w.raw.value
    }));
    this.exportSvc.downloadJson(data, 'word-cloud-data.json');
  }

  exportToSvg(): void {
    this.exportSvc.downloadSvg(this.svgEl()?.nativeElement, 'word-cloud.svg');
  }

  exportToPdf(): void {
    this.exportSvc.downloadPdf(this.svgEl()?.nativeElement, 'Word Cloud Frequency Analysis', 'word-cloud.pdf');
  }

  formatNumber(v: number): string {
    return fmtNum(v);
  }
}
