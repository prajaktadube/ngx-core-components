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
import { CHART_COLORS, generateUniqueId } from '../shared/chart-utils';
import { ChartExportService } from '../shared/chart-export.service';
import { ChartExportMenuComponent, ExportFormat } from '../shared/chart-export-menu.component';

export interface GaugeNeedle {
  label: string;
  value: number;
  color: string;
  type?: 'needle' | 'pointer' | 'target-line';
}

export interface GaugeThreshold {
  value: number;
  color: string;
}

@Component({
  selector: 'ngx-multi-needle-gauge',
  standalone: true,
  imports: [CommonModule, ChartExportMenuComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-chart-container" #container>
      <div class="ngx-chart-header">
        <div class="ngx-chart-legend" *ngIf="showLegend()">
          <div class="legend-item" *ngFor="let n of needles()" (click)="needleClick.emit(n)">
            <span class="legend-color" [style.background-color]="n.color"></span>
            <span class="legend-label">{{ n.label }}: {{ n.value }}{{ units() }}</span>
          </div>
        </div>
        <ngx-chart-export-menu *ngIf="showExport()" (exportClicked)="onExport($event)" />
      </div>

      <svg class="ngx-chart-svg" [attr.width]="width()" [attr.height]="height()" [attr.viewBox]="'0 0 ' + width() + ' ' + height()">
        <g [attr.transform]="'translate(' + centerX() + ',' + centerY() + ')'">
          
          <!-- Background track -->
          <path [attr.d]="bgPath()" 
                fill="none" 
                stroke="var(--ngx-chart-grid, #e2e8f0)" 
                [attr.stroke-width]="trackWidth" 
                stroke-linecap="round" />
          
          <!-- Threshold bands -->
          <path *ngFor="let band of bands()"
                [attr.d]="band.path"
                fill="none"
                [attr.stroke]="band.color"
                [attr.stroke-width]="trackWidth"
                stroke-linecap="butt" />

          <!-- Ticks -->
          <g *ngFor="let tick of ticks()">
            <line [attr.x1]="tick.x1" [attr.y1]="tick.y1" [attr.x2]="tick.x2" [attr.y2]="tick.y2" stroke="var(--ngx-chart-axis, #94a3b8)" stroke-width="2" />
            <text [attr.x]="tick.tx" [attr.y]="tick.ty" class="ngx-chart-axis-text" text-anchor="middle" dominant-baseline="middle">{{ tick.label }}</text>
          </g>
          
          <!-- Needles -->
          <g *ngFor="let n of processedNeedles(); let i = index">
            
            <ng-container *ngIf="n.type === 'needle'">
              <polygon [attr.points]="n.points" [attr.fill]="n.color" class="needle-path" />
              <circle cx="0" cy="0" [attr.r]="pivotRadius" [attr.fill]="n.color" />
            </ng-container>

            <ng-container *ngIf="n.type === 'pointer'">
              <path [attr.d]="n.points" [attr.fill]="n.color" class="needle-path" />
            </ng-container>

            <ng-container *ngIf="n.type === 'target-line'">
              <line [attr.x1]="n.tx1" [attr.y1]="n.ty1" [attr.x2]="n.tx2" [attr.y2]="n.ty2" [attr.stroke]="n.color" stroke-width="4" />
            </ng-container>
            
          </g>

          <!-- Center Value -->
          <circle cx="0" cy="0" [attr.r]="pivotRadius * 2.5" fill="var(--ngx-chart-bg, #fff)" stroke="var(--ngx-chart-grid, #e2e8f0)" stroke-width="2" />
          <text x="0" y="5" text-anchor="middle" class="main-value" font-weight="bold">
            {{ mainValue() }}
          </text>
          <text x="0" y="20" text-anchor="middle" class="ngx-chart-axis-text" font-size="10">
            {{ units() }}
          </text>

        </g>
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
      cursor: pointer;
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
    .ngx-chart-axis-text {
      fill: var(--ngx-chart-axis-text, #64748b);
      font-size: 12px;
    }
    .main-value {
      fill: var(--ngx-chart-axis-text, #1e293b);
      font-size: 20px;
    }
    .needle-path {
      transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
    }
  `]
})
export class MultiNeedleGaugeComponent {
  needles = input<GaugeNeedle[]>([]);
  min = input<number>(0);
  max = input<number>(100);
  thresholds = input<GaugeThreshold[]>([]);
  height = input<number>(260);
  dialAngle = input<number>(240);
  units = input<string>('');
  showLegend = input<boolean>(true);
  showExport = input<boolean>(true);

  private exportSvc = inject(ChartExportService);
  needleClick = output<GaugeNeedle>();

  container = viewChild<ElementRef>('container');

  onExport(type: ExportFormat): void {
    const el = this.container()?.nativeElement;
    if (type === 'svg') this.exportSvc.downloadSvg(el, 'multi-needle-gauge.svg');
    else if (type === 'pdf') this.exportSvc.downloadPdf(el, 'Multi-Needle Gauge', 'multi-needle-gauge.pdf');
  }
  width = signal<number>(400);

  chartId = generateUniqueId('gauge');

  trackWidth = 20;
  pivotRadius = 8;
  
  get containerEl() {
    return this.container()?.nativeElement;
  }

  private destroyRef = inject(DestroyRef);

  constructor() {
    effect((onCleanup) => {
      const el = this.container()?.nativeElement;
      if (!el) return;
      const ro = new ResizeObserver(entries => {
        if (entries[0]) {
          this.width.set(entries[0].contentRect.width || 400);
        }
      });
      ro.observe(el);
      onCleanup(() => ro.disconnect());
    });
  }

  centerX = computed(() => this.width() / 2);
  centerY = computed(() => this.height() / 2 + 20);
  radius = computed(() => Math.min(this.width() / 2, this.height() / 2) - 40);

  startAngle = computed(() => -this.dialAngle() / 2);
  endAngle = computed(() => this.dialAngle() / 2);

  polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const angleRad = (angleDeg - 90) * Math.PI / 180.0;
    return {
      x: cx + (r * Math.cos(angleRad)),
      y: cy + (r * Math.sin(angleRad))
    };
  }

  describeArc(x: number, y: number, r: number, startA: number, endA: number) {
    const start = this.polarToCartesian(x, y, r, endA);
    const end = this.polarToCartesian(x, y, r, startA);
    const largeArcFlag = endA - startA <= 180 ? "0" : "1";
    return [
      "M", start.x, start.y, 
      "A", r, r, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  }

  valToAngle = (val: number) => {
    const mn = this.min();
    const mx = this.max();
    const clamped = Math.max(mn, Math.min(mx, val));
    const ratio = (clamped - mn) / (mx - mn);
    return this.startAngle() + ratio * this.dialAngle();
  };

  bgPath = computed(() => this.describeArc(0, 0, this.radius(), this.startAngle(), this.endAngle()));

  bands = computed(() => {
    const t = this.thresholds();
    if (!t || t.length === 0) return [];
    
    const sorted = [...t].sort((a,b) => a.value - b.value);
    const bnds = [];
    let curVal = this.min();
    
    for (const th of sorted) {
      if (th.value > curVal) {
        bnds.push({
          path: this.describeArc(0, 0, this.radius(), this.valToAngle(curVal), this.valToAngle(th.value)),
          color: th.color
        });
        curVal = th.value;
      }
    }
    if (curVal < this.max()) {
      const lastCol = sorted[sorted.length-1]?.color || '#ccc';
      bnds.push({
        path: this.describeArc(0, 0, this.radius(), this.valToAngle(curVal), this.valToAngle(this.max())),
        color: lastCol
      });
    }
    return bnds;
  });

  ticks = computed(() => {
    const mn = this.min();
    const mx = this.max();
    const range = mx - mn;
    const steps = 10;
    const tks = [];
    for (let i=0; i<=steps; i++) {
      const v = mn + (range * i) / steps;
      const angle = this.valToAngle(v);
      const inner = this.polarToCartesian(0, 0, this.radius() - this.trackWidth/2 - 5, angle);
      const outer = this.polarToCartesian(0, 0, this.radius() + this.trackWidth/2 + 5, angle);
      const textPos = this.polarToCartesian(0, 0, this.radius() + this.trackWidth/2 + 20, angle);
      
      tks.push({
        x1: inner.x, y1: inner.y,
        x2: outer.x, y2: outer.y,
        tx: textPos.x, ty: textPos.y,
        label: Math.round(v)
      });
    }
    return tks;
  });

  processedNeedles = computed(() => {
    return this.needles().map((n, idx) => {
      const angle = this.valToAngle(n.value);
      const type = n.type || 'needle';
      
      let points = '';
      let tx1 = 0, ty1 = 0, tx2 = 0, ty2 = 0;
      
      if (type === 'needle') {
        const r = this.radius() - this.trackWidth/2;
        const tip = this.polarToCartesian(0, 0, r, angle);
        const left = this.polarToCartesian(0, 0, this.pivotRadius, angle - 90);
        const right = this.polarToCartesian(0, 0, this.pivotRadius, angle + 90);
        points = `${tip.x},${tip.y} ${right.x},${right.y} ${left.x},${left.y}`;
      } else if (type === 'pointer') {
        const r = this.radius() + this.trackWidth/2 + 10;
        const tip = this.polarToCartesian(0, 0, r, angle);
        const left = this.polarToCartesian(0, 0, r + 10, angle - 5);
        const right = this.polarToCartesian(0, 0, r + 10, angle + 5);
        points = `${tip.x},${tip.y} ${right.x},${right.y} ${left.x},${left.y}`;
      } else if (type === 'target-line') {
        const inner = this.polarToCartesian(0, 0, this.radius() - this.trackWidth/2, angle);
        const outer = this.polarToCartesian(0, 0, this.radius() + this.trackWidth/2, angle);
        tx1 = inner.x; ty1 = inner.y;
        tx2 = outer.x; ty2 = outer.y;
      }
      
      return { ...n, type, points, tx1, ty1, tx2, ty2 };
    });
  });

  mainValue = computed(() => {
    const ns = this.needles();
    if (ns.length > 0) return ns[0].value;
    return 0;
  });
}
