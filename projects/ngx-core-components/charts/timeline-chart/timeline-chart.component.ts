import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
  signal,
  inject,
  DestroyRef,
  ElementRef,
  viewChild,
  effect,
  output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CHART_COLORS, generateUniqueId, scale } from '../shared/chart-utils';
import { ChartExportService } from '../shared/chart-export.service';
import { ChartExportMenuComponent, ExportFormat } from '../shared/chart-export-menu.component';

export interface TimelineEvent {
  id: string;
  title: string;
  category?: string;
  startDate: string | Date;
  endDate?: string | Date;
  status?: 'completed' | 'in-progress' | 'pending' | 'failed' | 'warning';
  details?: string;
  icon?: string;
}

@Component({
  selector: 'ngx-timeline-chart',
  standalone: true,
  imports: [CommonModule, ChartExportMenuComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-chart-container" #container>
      <div class="ngx-chart-header">
        <div class="ngx-chart-legend" *ngIf="showLegend()">
          <div class="legend-item" *ngFor="let cat of categories()">
            <span class="legend-color" [style.background-color]="categoryColors()[cat]"></span>
            <span class="legend-label">{{ cat }}</span>
          </div>
        </div>
        <ngx-chart-export-menu *ngIf="showExport()" (exportClicked)="onExport($event)" />
      </div>

      <svg class="ngx-chart-svg" [attr.width]="width()" [attr.height]="height()" [attr.viewBox]="'0 0 ' + width() + ' ' + height()">
        <!-- Grid lines and Axis -->
        <g class="grid-lines">
          <line *ngFor="let tick of xTicks()" 
                [attr.x1]="tick.x" 
                [attr.y1]="marginTop" 
                [attr.x2]="tick.x" 
                [attr.y2]="height() - marginBottom"
                class="ngx-chart-grid" />
        </g>
        
        <g class="x-axis">
          <line [attr.x1]="marginLeft" [attr.y1]="height() - marginBottom" [attr.x2]="width() - marginRight" [attr.y2]="height() - marginBottom" class="ngx-chart-axis" />
          <text *ngFor="let tick of xTicks()" 
                [attr.x]="tick.x" 
                [attr.y]="height() - marginBottom + 20" 
                text-anchor="middle" 
                class="ngx-chart-axis-text">
            {{ tick.label }}
          </text>
        </g>

        <!-- Categories Background & Labels -->
        <g class="category-rows">
          <g *ngFor="let cat of categories(); let i = index">
            <rect [attr.x]="0" [attr.y]="yScale(i) - 20" [attr.width]="width()" [attr.height]="rowHeight" fill="var(--ngx-chart-bg)" opacity="0.5" />
            <text [attr.x]="10" [attr.y]="yScale(i) + 5" class="ngx-chart-axis-text" font-weight="bold">{{ cat }}</text>
          </g>
        </g>

        <!-- Events -->
        <g class="events">
          <g *ngFor="let ev of processedEvents()" 
             (mouseenter)="hoverEvent.set(ev)" 
             (mouseleave)="hoverEvent.set(null)"
             (click)="eventClick.emit(ev.raw)"
             class="event-group">
            
            <ng-container *ngIf="ev.isDuration; else milestone">
              <rect [attr.x]="ev.x" 
                    [attr.y]="ev.y - 12" 
                    [attr.width]="ev.width" 
                    [attr.height]="24" 
                    rx="12" 
                    [attr.fill]="ev.color"
                    class="event-bar" />
              <text [attr.x]="ev.x + 12" [attr.y]="ev.y + 4" fill="#fff" font-size="12" class="event-text" pointer-events="none">
                {{ ev.raw.title }}
              </text>
            </ng-container>

            <ng-template #milestone>
              <path [attr.d]="getDiamondPath(ev.x, ev.y, 8)" [attr.fill]="ev.color" class="event-pin" />
              <text [attr.x]="ev.x" [attr.y]="ev.y - 16" text-anchor="middle" class="ngx-chart-axis-text" font-size="12">
                {{ ev.raw.title }}
              </text>
            </ng-template>
          </g>
        </g>

        <!-- Tooltip -->
        <foreignObject *ngIf="hoverEvent()" 
                       [attr.x]="getTooltipX(hoverEvent()!)" 
                       [attr.y]="getTooltipY(hoverEvent()!)" 
                       width="220" height="120"
                       class="tooltip-fo">
          <div xmlns="http://www.w3.org/1999/xhtml" class="ngx-chart-tooltip">
            <div class="tooltip-title">{{ hoverEvent()!.raw.title }}</div>
            <div class="tooltip-body">
              <div>Status: {{ hoverEvent()!.raw.status || 'unknown' }}</div>
              <div>Start: {{ formatDate(hoverEvent()!.raw.startDate) }}</div>
              <div *ngIf="hoverEvent()!.raw.endDate">End: {{ formatDate(hoverEvent()!.raw.endDate) }}</div>
              <div *ngIf="hoverEvent()!.raw.details" class="tooltip-details">{{ hoverEvent()!.raw.details }}</div>
            </div>
          </div>
        </foreignObject>
      </svg>
    </div>
  `,
  styles: [`
    .ngx-chart-container {
      position: relative;
      width: 100%;
      display: flex;
      flex-direction: column;
      font-family: sans-serif;
    }
    .ngx-chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px;
    }
    .ngx-chart-legend {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: var(--ngx-chart-axis-text, #666);
    }
    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
    .ngx-chart-svg {
      width: 100%;
      height: 100%;
    }
    .ngx-chart-grid {
      stroke: var(--ngx-chart-grid, #e0e0e0);
      stroke-width: 1;
      stroke-dasharray: 4;
    }
    .ngx-chart-axis {
      stroke: var(--ngx-chart-axis, #ccc);
      stroke-width: 2;
    }
    .ngx-chart-axis-text {
      fill: var(--ngx-chart-axis-text, #666);
      font-size: 12px;
    }
    .event-group {
      cursor: pointer;
      transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .event-group:hover {
      opacity: 0.8;
    }
    .event-bar, .event-pin {
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .tooltip-fo {
      pointer-events: none;
      overflow: visible;
    }
    .ngx-chart-tooltip {
      background: var(--ngx-chart-tooltip-bg, rgba(255, 255, 255, 0.8));
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      padding: 12px;
      color: var(--ngx-chart-tooltip-color, #333);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      font-size: 12px;
      width: 100%;
      box-sizing: border-box;
    }
    .tooltip-title {
      font-weight: bold;
      margin-bottom: 4px;
      font-size: 14px;
    }
    .tooltip-details {
      margin-top: 4px;
      font-style: italic;
      opacity: 0.8;
    }
  `]
})
export class TimelineChartComponent {
  events = input<TimelineEvent[]>([]);
  height = input<number>(280);
  groupCategories = input<boolean>(true);
  showLegend = input<boolean>(true);
  colors = input<string[]>(CHART_COLORS);
  showExport = input<boolean>(true);

  private exportSvc = inject(ChartExportService);
  eventClick = output<TimelineEvent>();

  container = viewChild<ElementRef>('container');

  onExport(type: ExportFormat): void {
    const el = this.container()?.nativeElement;
    if (type === 'svg') this.exportSvc.downloadSvg(el, 'timeline-chart.svg');
    else if (type === 'pdf') this.exportSvc.downloadPdf(el, 'Timeline Chart', 'timeline-chart.pdf');
  }
  width = signal<number>(800);
  hoverEvent = signal<any>(null);

  chartId = generateUniqueId('timeline');
  
  marginLeft = 120;
  marginRight = 40;
  marginTop = 40;
  marginBottom = 40;
  rowHeight = 60;

  get containerEl() {
    return this.container()?.nativeElement;
  }

  statusColors: Record<string, string> = {
    'completed': '#10b981',
    'in-progress': '#3b82f6',
    'pending': '#9ca3af',
    'failed': '#ef4444',
    'warning': '#f59e0b'
  };

  private destroyRef = inject(DestroyRef);

  constructor() {
    effect((onCleanup) => {
      const el = this.container()?.nativeElement;
      if (!el) return;
      const ro = new ResizeObserver(entries => {
        if (entries[0]) {
          this.width.set(entries[0].contentRect.width || 800);
        }
      });
      ro.observe(el);
      onCleanup(() => ro.disconnect());
    });
  }

  categories = computed(() => {
    if (!this.groupCategories()) return ['Default'];
    const cats = new Set(this.events().map(e => e.category || 'Other'));
    return Array.from(cats);
  });

  categoryColors = computed(() => {
    const cats = this.categories();
    const cols = this.colors();
    const map: Record<string, string> = {};
    cats.forEach((c, i) => map[c] = cols[i % cols.length]);
    return map;
  });

  timeRange = computed(() => {
    let minTime = Infinity;
    let maxTime = -Infinity;
    
    this.events().forEach(e => {
      const start = new Date(e.startDate).getTime();
      const end = e.endDate ? new Date(e.endDate).getTime() : start;
      if (start < minTime) minTime = start;
      if (end > maxTime) maxTime = end;
      if (start > maxTime) maxTime = start;
    });

    if (minTime === Infinity) {
      const now = Date.now();
      minTime = now - 86400000;
      maxTime = now + 86400000;
    } else {
      const diff = maxTime - minTime;
      minTime -= diff * 0.05;
      maxTime += diff * 0.05;
    }
    
    return { min: minTime, max: maxTime };
  });

  xScale = (time: number) => {
    const range = this.timeRange();
    return scale(time, range.min, range.max, this.marginLeft, this.width() - this.marginRight);
  };

  yScale = (index: number) => {
    return this.marginTop + (index + 0.5) * this.rowHeight;
  };

  xTicks = computed(() => {
    const range = this.timeRange();
    const ticks = [];
    const count = 5;
    const step = (range.max - range.min) / count;
    for (let i = 0; i <= count; i++) {
      const t = range.min + i * step;
      ticks.push({
        x: this.xScale(t),
        label: new Date(t).toLocaleDateString()
      });
    }
    return ticks;
  });

  processedEvents = computed(() => {
    const cats = this.categories();
    return this.events().map(ev => {
      const start = new Date(ev.startDate).getTime();
      const end = ev.endDate ? new Date(ev.endDate).getTime() : start;
      
      const x1 = this.xScale(start);
      const x2 = this.xScale(end);
      
      const catIdx = this.groupCategories() ? cats.indexOf(ev.category || 'Other') : 0;
      const y = this.yScale(catIdx);
      
      const color = ev.status ? (this.statusColors[ev.status] || '#ccc') : this.categoryColors()[ev.category || 'Other'];
      
      return {
        raw: ev,
        x: x1,
        y,
        width: Math.max(x2 - x1, 4),
        isDuration: !!ev.endDate && (end > start),
        color
      };
    });
  });

  getDiamondPath(cx: number, cy: number, r: number): string {
    return `M ${cx} ${cy-r} L ${cx+r} ${cy} L ${cx} ${cy+r} L ${cx-r} ${cy} Z`;
  }

  getTooltipX(ev: any): number {
    let x = ev.x + (ev.width || 0) / 2;
    if (x + 240 > this.width()) x -= 240;
    return x;
  }

  getTooltipY(ev: any): number {
    return ev.y - 130;
  }

  formatDate(d: any): string {
    return new Date(d).toLocaleString();
  }
}
