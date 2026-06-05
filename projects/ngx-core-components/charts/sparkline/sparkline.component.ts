import { Component, ChangeDetectionStrategy, input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CHART_COLORS, scale, smoothPath } from '../shared/chart-utils';

@Component({
  selector: 'ngx-sparkline',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.width]="width()"
      [attr.height]="height()"
      class="ngx-sparkline"
      [attr.aria-label]="'Sparkline'"
      (mousemove)="onMouseMove($event)"
      (mouseleave)="hoveredIndex.set(null)"
    >
      <defs>
        <linearGradient id="sparkline-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" [attr.stop-color]="color()" stop-opacity="0.32" />
          <stop offset="100%" [attr.stop-color]="color()" stop-opacity="0" />
        </linearGradient>
      </defs>

      @if (type() === 'line' || type() === 'area') {
        @if (type() === 'area') {
          <path [attr.d]="areaPath()" fill="url(#sparkline-grad)" stroke="none" class="sparkline-area"/>
        }
        <path
          [attr.d]="linePath()"
          [attr.stroke]="color()"
          fill="none"
          stroke-width="2"
          stroke-linejoin="round"
          stroke-linecap="round"
          class="sparkline-path"
        />
        <!-- End dot (if not hovered) -->
        @if (endPoint(); as ep) {
          @if (hoveredIndex() === null) {
            <circle [attr.cx]="ep[0]" [attr.cy]="ep[1]" r="3" [attr.fill]="color()" class="end-dot"/>
          }
        }
      }
      @if (type() === 'bar') {
        @for (item of barItems(); track $index; let idx = $index) {
          <rect
            [attr.x]="item.x"
            [attr.y]="item.y"
            [attr.width]="item.w"
            [attr.height]="item.h"
            [attr.fill]="color()"
            [attr.rx]="1"
            [class.hovered]="hoveredIndex() === idx"
            [style.animation-delay]="(idx * 0.02) + 's'"
            class="sparkline-bar"
          />
        }
      }

      <!-- Interactive Tracker overlay -->
      @if (activePoint(); as ap) {
        <!-- Vertical guide line -->
        <line
          [attr.x1]="ap[0]"
          [attr.x2]="ap[0]"
          [attr.y1]="PAD"
          [attr.y2]="PAD + h()"
          stroke="rgba(100, 116, 139, 0.25)"
          stroke-width="1.2"
          stroke-dasharray="2,2"
          class="tracker-line"
        />
        <!-- Outer glowing ring -->
        <circle
          [attr.cx]="ap[0]"
          [attr.cy]="ap[1]"
          r="5"
          [attr.fill]="color()"
          fill-opacity="0.25"
          class="tracker-ring"
        />
        <!-- Inner solid dot -->
        <circle
          [attr.cx]="ap[0]"
          [attr.cy]="ap[1]"
          r="2.5"
          [attr.fill]="color()"
          stroke="#ffffff"
          stroke-width="1"
          class="tracker-dot"
        />
      }
    </svg>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
    .ngx-sparkline {
      display: block;
      overflow: visible;
      cursor: crosshair;
    }

    @keyframes lineDraw {
      from { stroke-dashoffset: 400; }
      to { stroke-dashoffset: 0; }
    }
    .sparkline-path {
      stroke-dasharray: 400;
      stroke-dashoffset: 400;
      animation: lineDraw 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes areaFade {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .sparkline-area {
      animation: areaFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
    }

    .end-dot {
      animation: areaFade 0.4s ease-out 0.8s both;
    }

    .sparkline-bar {
      opacity: 0.85;
      transition: opacity 0.2s, fill 0.2s;
      animation: areaFade 0.4s ease-out both;
    }
    .sparkline-bar:hover, .sparkline-bar.hovered {
      opacity: 1;
      filter: brightness(1.1);
    }

    .tracker-line {
      pointer-events: none;
    }
    .tracker-ring {
      pointer-events: none;
      animation: trackerPulse 1.5s infinite alternate;
    }
    .tracker-dot {
      pointer-events: none;
    }

    @keyframes trackerPulse {
      from { r: 4.5px; fill-opacity: 0.2; }
      to { r: 6.5px; fill-opacity: 0.4; }
    }
  `]
})
export class SparklineComponent {
  data = input<number[]>([]);
  type = input<'line' | 'bar' | 'area'>('line');
  color = input<string>(CHART_COLORS[0]);
  width = input<number>(120);
  height = input<number>(36);

  PAD = 2;

  w = computed(() => this.width() - this.PAD * 2);
  h = computed(() => this.height() - this.PAD * 2);

  hoveredIndex = signal<number | null>(null);

  private yMin = computed(() => Math.min(...this.data(), 0));
  private yMax = computed(() => Math.max(...this.data(), 1));

  pts = computed<[number, number][]>(() => {
    const d = this.data();
    const n = d.length;
    if (n === 0) return [];
    return d.map((v, i) => [
      this.PAD + scale(i, 0, Math.max(n - 1, 1), 0, this.w()),
      this.PAD + scale(v, this.yMin(), this.yMax(), this.h(), 0),
    ]);
  });

  linePath = computed(() => smoothPath(this.pts()));

  areaPath = computed(() => {
    const pts = this.pts();
    if (pts.length < 2) return '';
    const line = smoothPath(pts);
    const last = pts[pts.length - 1];
    const first = pts[0];
    const bottom = this.PAD + this.h();
    return line + ` L ${last[0]} ${bottom} L ${first[0]} ${bottom} Z`;
  });

  endPoint = computed<[number, number] | null>(() => {
    const pts = this.pts();
    return pts.length > 0 ? pts[pts.length - 1] : null;
  });

  activePoint = computed(() => {
    const idx = this.hoveredIndex();
    if (this.type() === 'bar') return null; // Dot tracking only for lines/areas
    return idx !== null && this.pts()[idx] ? this.pts()[idx] : null;
  });

  barItems = computed(() => {
    const d = this.data();
    const n = d.length;
    if (n === 0) return [];
    const bw = Math.max(2, this.w() / n - 1);
    const zero = this.PAD + scale(0, this.yMin(), this.yMax(), this.h(), 0);
    return d.map((v, i) => {
      const x = this.PAD + scale(i, 0, Math.max(n - 1, 1), 0, this.w()) - bw / 2;
      const y = this.PAD + scale(v, this.yMin(), this.yMax(), this.h(), 0);
      return { x, y, w: bw, h: Math.abs(zero - y) };
    });
  });

  onMouseMove(event: MouseEvent) {
    const el = event.currentTarget as SVGElement;
    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left - this.PAD;
    const n = this.data().length;
    if (n === 0) return;
    const idx = Math.max(0, Math.min(n - 1, Math.round(scale(x, 0, this.w(), 0, n - 1))));
    this.hoveredIndex.set(idx);
  }
}
