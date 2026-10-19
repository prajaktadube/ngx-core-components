import {
  Component,
  input,
  OnChanges,
  AfterViewInit,
  ElementRef,
  ViewChild,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { encodeCode128B } from './barcode-encoding';

// Code128B barcode renderer using SVG bars
@Component({
  selector: 'ngx-barcode',
  standalone: true,
  template: `
    <div class="ngx-barcode">
      @if (label() || value()) {
        <div class="barcode-label">{{ label() || value() }}</div>
      }
      <svg
        #svg
        role="img"
        [attr.aria-label]="'Code 128-B barcode for ' + (label() || value())"
        [attr.width]="svgWidth"
        [attr.height]="height()"
        class="barcode-svg"
      ></svg>
      @if (encodingError()) {
        <div class="barcode-error" role="alert">{{ encodingError() }}</div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }
      .ngx-barcode {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
      }
      .barcode-label {
        font-family: monospace;
        font-size: 11px;
        letter-spacing: 3px;
        color: var(--ngx-barcode-color, #212529);
      }
      .barcode-svg {
        display: block;
      }
      .barcode-error {
        color: var(--ngx-input-error, #b91c1c);
        font-size: 12px;
      }
    `,
  ],
})
export class BarcodeComponent implements OnChanges, AfterViewInit {
  private readonly platformId = inject(PLATFORM_ID);
  readonly encodingError = signal('');

  @ViewChild('svg', { static: true }) svgRef!: ElementRef<SVGElement>;

  value = input('');
  label = input('');
  height = input(60);
  barWidth = input(2);
  foreground = input('#000000');
  background = input('#ffffff');

  svgWidth = 200;

  ngOnChanges(): void {
    this.draw();
  }
  ngAfterViewInit(): void {
    this.draw();
  }

  private draw(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const svg = this.svgRef?.nativeElement;
    if (!svg) return;
    svg.replaceChildren();
    this.encodingError.set('');
    if (!this.value()) return;

    let bars: boolean[];
    const bw = this.barWidth();
    if (!Number.isFinite(bw) || bw <= 0 || !Number.isFinite(this.height()) || this.height() <= 0) {
      this.encodingError.set('Barcode height and bar width must be positive finite numbers.');
      return;
    }
    try {
      bars = encodeCode128B(this.value());
    } catch (error) {
      this.encodingError.set(error instanceof Error ? error.message : 'Unable to encode barcode value.');
      return;
    }

    const totalWidth = bars.length * bw + 20;
    this.svgWidth = totalWidth;
    svg.setAttribute('width', String(totalWidth));
    svg.setAttribute('height', String(this.height()));

    // Background
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('width', String(totalWidth));
    bg.setAttribute('height', String(this.height()));
    bg.setAttribute('fill', this.background());
    svg.appendChild(bg);

    // Bars
    let x = 10;
    for (const isBar of bars) {
      if (isBar) {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', String(x));
        rect.setAttribute('y', '0');
        rect.setAttribute('width', String(bw));
        rect.setAttribute('height', String(this.height()));
        rect.setAttribute('fill', this.foreground());
        svg.appendChild(rect);
      }
      x += bw;
    }
  }
}
