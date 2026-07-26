import {
  Component, input, computed, signal, ChangeDetectionStrategy,
  ElementRef, viewChild, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface GaugeThreshold {
  value: number; // The threshold limit (inclusive upper boundary)
  color: string; // The color associated with this threshold
}

@Component({
  selector: 'ngx-gauge-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="ngx-gauge-wrapper"
      (mousemove)="onMouseMove($event)"
      (mouseenter)="hovered.set(true)"
      (mouseleave)="hovered.set(false)"
    >
      <div class="chart-header" (mousemove)="$event.stopPropagation()" (mouseleave)="hovered.set(false)">
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

      <div class="ngx-gauge-container">
        <!-- SVG Gauge dial -->
        <svg
          #svgEl
          class="ngx-gauge-svg"
          viewBox="0 0 200 200"
        >
          <defs>
            <linearGradient id="gauge-progress-grad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" [attr.stop-color]="gaugeColor()" stop-opacity="0.85" />
              <stop offset="100%" [attr.stop-color]="gaugeColor()" />
            </linearGradient>
            <linearGradient id="pivot-cap-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#64748b" />
              <stop offset="50%" stop-color="#334155" />
              <stop offset="100%" stop-color="#0f172a" />
            </linearGradient>
            <linearGradient id="needle-grad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" [attr.stop-color]="gaugeColor()" stop-opacity="0.75" />
              <stop offset="100%" [attr.stop-color]="gaugeColor()" />
            </linearGradient>
            <filter id="gauge-blur-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <!-- Outer background guide track -->
          <path
            [attr.d]="backgroundArcPath()"
            fill="none"
            stroke="var(--ngx-gauge-track-bg, rgba(148, 163, 184, 0.12))"
            stroke-width="14"
            stroke-linecap="round"
          />

          <!-- Colored background glow track -->
          <path
            [attr.d]="backgroundArcPath()"
            fill="none"
            [attr.stroke]="gaugeColor()"
            stroke-width="18"
            stroke-linecap="round"
            opacity="0.15"
            [attr.stroke-dasharray]="arcLength() + ',' + arcLength()"
            [attr.stroke-dashoffset]="progressDashOffset()"
            class="progress-arc-glow"
          />

          <!-- Colored progress arc -->
          <path
            [attr.d]="backgroundArcPath()"
            fill="none"
            stroke="url(#gauge-progress-grad)"
            stroke-width="14"
            stroke-linecap="round"
            [attr.stroke-dasharray]="arcLength() + ',' + arcLength()"
            [attr.stroke-dashoffset]="progressDashOffset()"
            class="progress-arc"
          />

          <!-- Colored threshold zone lines (Outer edge) -->
          <g class="gauge-thresholds">
            @for (arc of thresholdArcs(); track $index) {
              <path
                [attr.d]="arc.path"
                fill="none"
                [attr.stroke]="arc.color"
                stroke-width="3"
                stroke-linecap="round"
                opacity="0.65"
              />
            }
          </g>

          <!-- Instrument Dial Ticks & Labels -->
          <g class="gauge-ticks">
            @for (tick of ticks(); track $index) {
              <!-- Radial Tick Mark -->
              <line
                [attr.x1]="tick.x1"
                [attr.y1]="tick.y1"
                [attr.x2]="tick.x2"
                [attr.y2]="tick.y2"
                [attr.stroke]="tick.isMajor ? 'var(--text-secondary, #64748b)' : 'var(--border-color, #cbd5e1)'"
                [attr.stroke-width]="tick.isMajor ? 1.5 : 1"
                opacity="0.6"
              />
              <!-- Value Label -->
              @if (tick.isMajor) {
                <text
                  [attr.x]="tick.textX"
                  [attr.y]="tick.textY"
                  fill="var(--text-secondary, #64748b)"
                  font-size="8px"
                  font-weight="700"
                  text-anchor="middle"
                  dominant-baseline="middle"
                  font-family="monospace"
                >{{ tick.valueText }}</text>
              }
            }
          </g>

          <!-- Needle / Indicator dial -->
          @if (showNeedle()) {
            <g [attr.transform]="needleTransformString()" class="gauge-needle-group">
              <!-- Tapered needle spear -->
              <path
                d="M 100 100 L 98 32 L 100 20 L 102 32 Z"
                fill="url(#needle-grad)"
                class="gauge-needle"
              />
              <!-- Core pin highlighting line -->
              <line
                x1="100" y1="98"
                x2="100" y2="24"
                stroke="#ffffff"
                stroke-width="1.2"
                stroke-linecap="round"
                opacity="0.9"
              />
              <!-- Multi-layered pivot cap -->
              <circle
                cx="100"
                cy="100"
                r="10"
                fill="url(#pivot-cap-grad)"
                stroke="rgba(0, 0, 0, 0.2)"
                stroke-width="1"
              />
              <circle
                cx="100"
                cy="100"
                r="4"
                fill="#ffffff"
                opacity="0.25"
              />
            </g>
          }
        </svg>

        <!-- Center values badge -->
        <div class="gauge-center-badge" [class.semi-mode]="type() === 'semi'">
          <div class="gauge-value" [style.color]="gaugeColor()">{{ value().toLocaleString() }}</div>
          @if (label()) {
            <div class="gauge-label">{{ label() }}</div>
          }
        </div>
      </div>

      <!-- Glassmorphic Tooltip -->
      @if (hovered()) {
        <div
          class="chart-tooltip"
          [style.left.px]="tooltipX()"
          [style.top.px]="tooltipY()"
        >
          @if (label()) {
            <div class="tt-cat">{{ label() }}</div>
          } @else {
            <div class="tt-cat">Gauge Metric</div>
          }
          <div class="tt-row">
            <span class="tt-dot" [style.background]="gaugeColor()"></span>
            <span class="tt-name">Value</span>
            <span class="tt-val">{{ value().toLocaleString() }}</span>
          </div>
          <div class="tt-row">
            <span class="tt-dot" style="background: transparent;"></span>
            <span class="tt-name">Range</span>
            <span class="tt-val">{{ min() }} - {{ max() }}</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .ngx-gauge-wrapper {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 16px;
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 12px;
      box-shadow: var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05));
      position: relative;
    }

    .ngx-gauge-container {
      position: relative;
      width: 100%;
      max-width: 240px;
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ngx-gauge-svg {
      width: 100%;
      height: 100%;
      overflow: visible;
    }

    /* Arcs transition */
    .progress-arc {
      transition: stroke-dashoffset 1.0s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.3s ease;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.08));
    }
    .progress-arc-glow {
      transition: stroke-dashoffset 1.0s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.3s ease;
    }

    /* Needle transition animations */
    .gauge-needle-group {
      transition: transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      transform-origin: 100px 100px;
    }
    .gauge-needle {
      filter: drop-shadow(0 3px 6px rgba(0,0,0,0.22));
    }

    /* Center Value Indicator */
    .gauge-center-badge {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      pointer-events: none;
      z-index: 2;
    }
    .gauge-center-badge.semi-mode {
      transform: translateY(18px);
    }

    .gauge-value {
      font-size: 32px;
      font-weight: 850;
      letter-spacing: -0.8px;
      line-height: 1;
      transition: color 0.3s ease;
      font-family: var(--ngx-heading-font-family, inherit);
      filter: drop-shadow(0 1px 2px rgba(0,0,0,0.05));
    }
    .gauge-label {
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 750;
      color: var(--text-secondary, #64748b);
      letter-spacing: 0.8px;
      margin-top: 6px;
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

    /* Header and Export dropdown styles */
    .chart-header {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      min-height: 24px;
      position: relative;
    }
    .chart-export-menu {
      position: absolute;
      right: 0;
      top: 0;
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
export class GaugeChartComponent {
  // Input Configs
  value = input.required<number>();
  min = input<number>(0);
  max = input<number>(100);
  label = input<string>('');
  type = input<'full' | 'semi'>('semi'); // 'full' is 280deg, 'semi' is 180deg
  showNeedle = input<boolean>(true);
  color = input<string>('var(--primary-color, #4f46e5)');
  thresholds = input<GaugeThreshold[]>([]);
  showExport = input<boolean>(false);

  // State Signals
  hovered = signal<boolean>(false);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);
  animateState = signal<boolean>(false);
  exportMenuOpen = signal(false);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  constructor() {
    setTimeout(() => this.animateState.set(true), 50);
  }

  // Gauge angles definitions
  // 0 deg in polar is to the right (3 o'clock). 90 deg is straight down (6 o'clock).
  startAngle = computed(() => {
    return this.type() === 'semi' ? 270 : 225;
  });

  endAngle = computed(() => {
    return this.type() === 'semi' ? 450 : 495;
  });

  // Arc length calculations
  arcLength = computed(() => {
    const radius = 72;
    const angleRange = this.endAngle() - this.startAngle();
    return (2 * Math.PI * radius * angleRange) / 360;
  });

  progressDashOffset = computed(() => {
    const L = this.arcLength();
    const minVal = this.min();
    const maxVal = this.max();
    const currentVal = Math.max(minVal, Math.min(maxVal, this.value()));
    const range = maxVal - minVal;
    const fraction = range === 0 ? 0 : (currentVal - minVal) / range;
    const targetOffset = L - (fraction * L);
    return this.animateState() ? targetOffset : L;
  });

  // Calculate coordinates and build path for background track
  backgroundArcPath = computed(() => {
    return this.describeArc(100, 100, 72, this.startAngle(), this.endAngle());
  });

  // Needle rotation calculation
  needleTransformString = computed(() => {
    const minVal = this.min();
    const maxVal = this.max();
    const currentVal = Math.max(minVal, Math.min(maxVal, this.value()));
    const range = maxVal - minVal;
    const fraction = range === 0 ? 0 : (currentVal - minVal) / range;

    const angleRange = this.endAngle() - this.startAngle();
    const targetAngle = this.startAngle() + angleRange * fraction;

    const angle = this.animateState() ? targetAngle : this.startAngle();

    // Needle points straight up at 0 deg rotation (12 o'clock, which is 360 in polar offset)
    const rotateAngle = angle - 360;
    return `rotate(${rotateAngle})`;
  });

  // Evaluate the gauge color depending on bound thresholds
  gaugeColor = computed(() => {
    const val = this.value();
    const thresholdList = this.thresholds();

    if (thresholdList.length === 0) {
      return this.color();
    }

    // Sort thresholds ascending
    const sorted = [...thresholdList].sort((a, b) => a.value - b.value);
    
    // Find the first threshold color where values exceed the limit
    for (const t of sorted) {
      if (val <= t.value) {
        return t.color;
      }
    }

    // Default to the last threshold color if value exceeds all thresholds
    return sorted[sorted.length - 1].color;
  });

  private getThresholdColorForValue(val: number): string {
    const thresholdList = this.thresholds();
    if (thresholdList.length === 0) {
      return this.color();
    }
    const sorted = [...thresholdList].sort((a, b) => a.value - b.value);
    for (const t of sorted) {
      if (val <= t.value) {
        return t.color;
      }
    }
    return sorted[sorted.length - 1].color;
  }

  ticks = computed(() => {
    const minVal = this.min();
    const maxVal = this.max();
    const range = maxVal - minVal;
    const startA = this.startAngle();
    const endA = this.endAngle();
    const angleRange = endA - startA;
    
    // We want 11 ticks (every 10%)
    const tickCount = 11;
    const result = [];
    
    for (let i = 0; i < tickCount; i++) {
      const fraction = i / (tickCount - 1);
      const val = minVal + range * fraction;
      const angle = startA + angleRange * fraction;
      
      // Radial line coords
      const outerRad = 64;
      const innerRad = i % 2 === 0 ? 56 : 60; // Major vs minor ticks
      
      const outerPt = this.polarToCartesian(100, 100, outerRad, angle);
      const innerPt = this.polarToCartesian(100, 100, innerRad, angle);
      
      // Text coords (for major ticks)
      let textPt = null;
      if (i % 2 === 0) {
        textPt = this.polarToCartesian(100, 100, 44, angle);
      }
      
      const color = this.getThresholdColorForValue(val);
      
      result.push({
        x1: innerPt.x,
        y1: innerPt.y,
        x2: outerPt.x,
        y2: outerPt.y,
        textX: textPt?.x ?? 0,
        textY: textPt?.y ?? 0,
        valueText: Math.round(val).toString(),
        isMajor: i % 2 === 0,
        color
      });
    }
    return result;
  });

  thresholdArcs = computed(() => {
    const list = this.thresholds();
    if (list.length === 0) return [];
    
    const minVal = this.min();
    const maxVal = this.max();
    const range = maxVal - minVal;
    const startA = this.startAngle();
    const endA = this.endAngle();
    const angleRange = endA - startA;
    
    // Sort thresholds ascending
    const sorted = [...list].sort((a, b) => a.value - b.value);
    
    const arcs = [];
    let currentVal = minVal;
    
    for (let i = 0; i < sorted.length; i++) {
      const nextVal = Math.min(maxVal, sorted[i].value);
      if (nextVal <= currentVal) continue;
      
      const startFraction = (currentVal - minVal) / range;
      const endFraction = (nextVal - minVal) / range;
      
      const startAngleSegment = startA + angleRange * startFraction;
      const endAngleSegment = startA + angleRange * endFraction;
      
      // Radius slightly outside: e.g. 81px
      const path = this.describeArc(100, 100, 81, startAngleSegment, endAngleSegment);
      
      arcs.push({
        path,
        color: sorted[i].color
      });
      
      currentVal = nextVal;
    }
    
    return arcs;
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
    const data = {
      label: this.label(),
      value: this.value(),
      min: this.min(),
      max: this.max()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'gauge-chart-data.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToCsv(): void {
    let csv = 'Label,Value,Min,Max\n';
    csv += `"${this.label() || ''}",${this.value()},${this.min()},${this.max()}\n`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'gauge-chart-data.csv');
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
    link.setAttribute('download', 'gauge-chart.svg');
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

  onMouseMove(event: MouseEvent) {
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    this.tooltipX.set(event.clientX - rect.left);
    this.tooltipY.set(event.clientY - rect.top);
  }

  // Polar to Cartesian Math helpers
  private polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  }

  private describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number): string {
    const start = this.polarToCartesian(x, y, radius, startAngle);
    const end = this.polarToCartesian(x, y, radius, endAngle);

    // If starting and ending angle range exceeds 180 degrees, set largeArcFlag
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return [
      'M', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 1, end.x, end.y
    ].join(' ');
  }
}
