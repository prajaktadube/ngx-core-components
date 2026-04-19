import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CHART_COLORS, scale, smoothPath } from '../shared/chart-utils';

@Component({
  selector: 'ngx-sparkline',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.width]="width()"
      [attr.height]="height()"
      class="ngx-sparkline"
      [attr.aria-label]="'Sparkline'"
    >
      @if (type() === 'line' || type() === 'area') {
        @if (type() === 'area') {
          <path [attr.d]="areaPath()" [attr.fill]="areaFill()" stroke="none"/>
        }
        <path
          [attr.d]="linePath()"
          [attr.stroke]="color()"
          fill="none"
          stroke-width="2"
          stroke-linejoin="round"
          stroke-linecap="round"
        />
        <!-- End dot -->
        @if (endPoint(); as ep) {
          <circle [attr.cx]="ep[0]" [attr.cy]="ep[1]" r="3" [attr.fill]="color()"/>
        }
      }
      @if (type() === 'bar') {
        @for (item of barItems(); track $index) {
          <rect
            [attr.x]="item.x"
            [attr.y]="item.y"
            [attr.width]="item.w"
            [attr.height]="item.h"
            [attr.fill]="color()"
            [attr.rx]="1"
            opacity="0.85"
          />
        }
      }
    </svg>
  `,
  styles: [`:host { display: inline-block; } .ngx-sparkline { display: block; }`]
})
export class SparklineComponent {
  data = input<number[]>([]);
  type = input<'line' | 'bar' | 'area'>('line');
  color = input<string>(CHART_COLORS[0]);
  width = input<number>(120);
  height = input<number>(36);

  private PAD = 2;

  private w = computed(() => this.width() - this.PAD * 2);
  private h = computed(() => this.height() - this.PAD * 2);

  private yMin = computed(() => Math.min(...this.data(), 0));
  private yMax = computed(() => Math.max(...this.data(), 1));

  private pts = computed<[number, number][]>(() => {
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

  areaFill = computed(() => this.color() + '22');

  endPoint = computed<[number, number] | null>(() => {
    const pts = this.pts();
    return pts.length > 0 ? pts[pts.length - 1] : null;
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
}
