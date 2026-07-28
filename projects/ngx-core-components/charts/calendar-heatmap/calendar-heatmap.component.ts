import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, viewChild, inject, DestroyRef, TemplateRef, output
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ChartExportService } from '../shared/chart-export.service';
import { ChartExportMenuComponent, type ExportFormat } from '../shared/chart-export-menu.component';
import { generateUniqueId, fmtNum } from '../shared/chart-utils';

export interface CalendarHeatmapData {
  date: string;
  value: number;
}

@Component({
  selector: 'ngx-calendar-heatmap',
  standalone: true,
  imports: [ChartExportMenuComponent, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-calendar-heatmap" (mouseleave)="onMouseLeave()">
      <div class="chart-header">
        <div class="chart-title-space"></div>
        @if (showExport()) {
          <ngx-chart-export-menu (exportClicked)="onExport($event)" />
        }
      </div>

      <div class="heatmap-scroll-container">
        <svg #svgEl [attr.width]="svgWidth()" [attr.height]="height()" class="chart-svg">
          <g [attr.transform]="'translate(' + PAD_LEFT + ',' + PAD_TOP + ')'">
            <!-- Months labels -->
            @if (showMonthLabels()) {
              @for (m of monthLabels(); track m.x) {
                <text [attr.x]="m.x" y="-8" class="axis-label">{{ m.label }}</text>
              }
            }

            <!-- Day labels -->
            @if (showDayLabels()) {
              <text x="-8" [attr.y]="cellSize() * 1.5 + cellGap()" class="axis-label" text-anchor="end">Mon</text>
              <text x="-8" [attr.y]="cellSize() * 3.5 + cellGap() * 3" class="axis-label" text-anchor="end">Wed</text>
              <text x="-8" [attr.y]="cellSize() * 5.5 + cellGap() * 5" class="axis-label" text-anchor="end">Fri</text>
            }

            <!-- Cells -->
            @for (week of weeks(); track $index; let wIdx = $index) {
              <g [attr.transform]="'translate(' + (wIdx * (cellSize() + cellGap())) + ', 0)'">
                @for (day of week; track day.date) {
                  @if (day.inRange) {
                    <rect
                      [attr.width]="cellSize()"
                      [attr.height]="cellSize()"
                      [attr.y]="day.dayOfWeek * (cellSize() + cellGap())"
                      [attr.fill]="getColor(day.value)"
                      [attr.rx]="2"
                      [attr.ry]="2"
                      class="heatmap-cell"
                      (mouseenter)="onMouseEnter($event, day)"
                      (click)="onCellClick(day)"
                    />
                  }
                }
              </g>
            }
          </g>
        </svg>
      </div>

      <div class="heatmap-legend">
        <span class="legend-text">Less</span>
        @for (c of colorRange(); track c) {
          <span class="legend-color-box" [style.background]="c"></span>
        }
        <span class="legend-text">More</span>
      </div>

      <!-- Tooltip -->
      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
          @if (tooltipTemplate()) {
            <ng-container *ngTemplateOutlet="tooltipTemplate()!; context: { $implicit: t }"></ng-container>
          } @else {
            <div class="tt-val">{{ fmtNum(t.value) }} contributions</div>
            <div class="tt-date">{{ t.date }}</div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; position: relative; }
    .ngx-calendar-heatmap { position: relative; background: var(--ngx-chart-bg, #fff); padding-bottom: 16px; }
    .chart-header { display: flex; justify-content: space-between; align-items: center; min-height: 24px; margin-bottom: 8px; }
    .heatmap-scroll-container { overflow-x: auto; overflow-y: hidden; padding-bottom: 8px; }
    .chart-svg { display: block; min-width: max-content; }
    .axis-label { font-size: 10px; fill: var(--ngx-chart-axis-text, #6c757d); user-select: none; }
    .heatmap-cell { transition: fill 0.2s; cursor: pointer; stroke: rgba(0,0,0,0.05); stroke-width: 1px; }
    .heatmap-cell:hover { stroke: #000; stroke-width: 2px; }
    .heatmap-legend { display: flex; align-items: center; justify-content: flex-end; gap: 4px; font-size: 11px; color: var(--ngx-chart-axis-text, #6c757d); margin-top: 8px; padding-right: 16px; }
    .legend-text { margin: 0 4px; }
    .legend-color-box { width: 12px; height: 12px; border-radius: 2px; border: 1px solid rgba(0,0,0,0.1); }
    .chart-tooltip {
      position: fixed; pointer-events: none; transform: translate(-50%, -100%) translateY(-8px);
      background: var(--ngx-chart-tooltip-bg, rgba(15, 23, 42, 0.92));
      backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      color: var(--ngx-chart-tooltip-color, #f8fafc); padding: 8px 12px;
      border-radius: 6px; font-size: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 1000; text-align: center;
    }
    .tt-val { font-weight: 600; margin-bottom: 4px; color: #fff; }
    .tt-date { color: rgba(255,255,255,0.7); font-size: 11px; }
  `]
})
export class CalendarHeatmapComponent {
  readonly instanceId = generateUniqueId('heatmap');
  private readonly exportSvc = inject(ChartExportService);

  data = input<CalendarHeatmapData[]>([]);
  colorRange = input<string[]>(['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39']);
  height = input<number>(160);
  showMonthLabels = input<boolean>(true);
  showDayLabels = input<boolean>(true);
  cellSize = input<number>(12);
  cellGap = input<number>(2);
  showExport = input<boolean>(false);
  tooltipTemplate = input<TemplateRef<any> | null>(null);

  cellClick = output<{ date: string; value: number }>();

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');
  tooltip = signal<{ x: number; y: number; date: string; value: number } | null>(null);

  PAD_LEFT = 32;
  PAD_TOP = 24;

  weeks = computed(() => {
    const rawData = this.data();
    const dataMap = new Map<string, number>();
    rawData.forEach(d => dataMap.set(d.date.split('T')[0], d.value));
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 365);
    
    // Adjust start date to previous Sunday
    while (startDate.getDay() !== 0) {
      startDate.setDate(startDate.getDate() - 1);
    }
    
    const weeksList: any[][] = [];
    let currentWeek: any[] = [];
    
    const iterDate = new Date(startDate);
    while (iterDate <= today) {
      const dStr = iterDate.toISOString().split('T')[0];
      currentWeek.push({
        date: dStr,
        value: dataMap.get(dStr) || 0,
        dayOfWeek: iterDate.getDay(),
        inRange: true
      });
      
      if (iterDate.getDay() === 6) {
        weeksList.push(currentWeek);
        currentWeek = [];
      }
      iterDate.setDate(iterDate.getDate() + 1);
    }
    
    if (currentWeek.length > 0) {
      weeksList.push(currentWeek);
    }
    
    return weeksList;
  });

  monthLabels = computed(() => {
    const wks = this.weeks();
    const labels: { label: string; x: number }[] = [];
    let currentMonth = -1;
    wks.forEach((week, wIdx) => {
      const firstDay = week.find(d => d.inRange);
      if (firstDay) {
        const date = new Date(firstDay.date);
        if (date.getMonth() !== currentMonth) {
          currentMonth = date.getMonth();
          labels.push({
            label: date.toLocaleString('default', { month: 'short' }),
            x: wIdx * (this.cellSize() + this.cellGap())
          });
        }
      }
    });
    return labels;
  });

  svgWidth = computed(() => {
    const w = this.weeks().length * (this.cellSize() + this.cellGap()) + this.PAD_LEFT + 16;
    return w;
  });

  private maxVal = computed(() => {
    const vals = this.data().map(d => d.value);
    return vals.length ? Math.max(...vals) : 1;
  });

  getColor(value: number): string {
    const colors = this.colorRange();
    if (value === 0) return colors[0];
    const max = this.maxVal();
    const ratio = value / max;
    const idx = Math.min(colors.length - 1, Math.max(1, Math.ceil(ratio * (colors.length - 1))));
    return colors[idx];
  }

  onMouseEnter(event: MouseEvent, day: any): void {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    this.tooltip.set({
      x: rect.left + rect.width / 2,
      y: rect.top,
      date: day.date,
      value: day.value
    });
  }

  onMouseLeave(): void {
    this.tooltip.set(null);
  }

  onCellClick(day: any): void {
    this.cellClick.emit({ date: day.date, value: day.value });
  }

  onExport(type: ExportFormat): void {
    if (type === 'svg') this.exportSvc.downloadSvg(this.svgEl()?.nativeElement, 'calendar-heatmap.svg');
    else if (type === 'pdf') this.exportSvc.downloadPdf(this.svgEl()?.nativeElement, 'Calendar Heatmap', 'calendar-heatmap.pdf');
    else {
      const rows = this.data().map(d => [d.date, d.value]);
      if (type === 'csv') this.exportSvc.downloadCsv(['Date', 'Value'], rows, 'calendar-data.csv');
      else if (type === 'json') this.exportSvc.downloadJson(this.data(), 'calendar-data.json');
    }
  }

  fmtNum = fmtNum;
}
