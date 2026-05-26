import { Component, OnInit, input, output, signal, computed } from '@angular/core';

@Component({
  selector: 'ngx-slider',
  standalone: true,
  template: `
    <div class="ngx-slider">
      @if (label()) { <label class="slider-label">{{ label() }}@if (showValue()) { <span class="slider-value">{{ range() ? (low() + ' – ' + high()) : value() }}</span> }</label> }
      <div class="slider-track-wrap">
        @if (!range()) {
          <input type="range" class="slider-input" [min]="min()" [max]="max()" [step]="step()" [value]="value()" [disabled]="disabled()" (input)="onInput($event)" />
          <div class="slider-fill" [style.width.%]="pct()"></div>
        } @else {
          <div class="slider-range-container">
            <input type="range" class="slider-input slider-low" [min]="min()" [max]="max()" [step]="step()" [value]="low()" [disabled]="disabled()" (input)="onLow($event)" />
            <input type="range" class="slider-input slider-high" [min]="min()" [max]="max()" [step]="step()" [value]="high()" [disabled]="disabled()" (input)="onHigh($event)" />
            <div class="slider-fill-range" [style.left.%]="lowPct()" [style.right.%]="highPct()"></div>
          </div>
        }
      </div>
      @if (showTicks()) {
        <div class="slider-ticks">
          <span>{{ min() }}</span><span>{{ max() }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .ngx-slider { width: 100%; }
    .slider-label { display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; color: var(--ngx-input-label, #495057); margin-bottom: 8px; }
    .slider-value { font-weight: 400; color: var(--ngx-input-text, #212529); }
    .slider-track-wrap { position: relative; padding: 10px 0; }
    .slider-input { width: 100%; -webkit-appearance: none; appearance: none; height: 5px; background: transparent; border-radius: 4px; outline: none; cursor: pointer; position: relative; z-index: 5; }
    .slider-input::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: var(--ngx-slider-thumb, #1a73e8); cursor: pointer; box-shadow: 0 2px 6px rgba(26, 115, 232, 0.3); border: 2px solid #fff; transition: all 0.2s ease; }
    .slider-input::-webkit-slider-thumb:hover { box-shadow: 0 3px 10px rgba(26, 115, 232, 0.4); transform: scale(1.1); }
    .slider-input::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%; background: var(--ngx-slider-thumb, #1a73e8); cursor: pointer; box-shadow: 0 2px 6px rgba(26, 115, 232, 0.3); border: 2px solid #fff; transition: all 0.2s ease; }
    .slider-input::-moz-range-thumb:hover { box-shadow: 0 3px 10px rgba(26, 115, 232, 0.4); transform: scale(1.1); }
    .slider-input::-moz-range-track { background: transparent; border: none; }
    .slider-input:disabled { opacity: 0.5; cursor: not-allowed; }
    .slider-range-container { position: relative; height: 20px; margin: 8px 0; }
    .slider-range-container::before { content: ''; position: absolute; height: 5px; background: var(--ngx-slider-track, #dee2e6); border-radius: 4px; width: 100%; top: 50%; left: 0; transform: translateY(-50%); z-index: 1; }
    .slider-range-container .slider-input { position: absolute; top: 50%; left: 0; transform: translateY(-50%); margin: 0; }
    .slider-range-container .slider-input::-webkit-slider-runnable-track { height: 5px; background: transparent; border: none; }
    .slider-fill { position: absolute; height: 5px; background: linear-gradient(90deg, var(--ngx-slider-thumb, #1a73e8), var(--ngx-slider-thumb, #1a73e8)); border-radius: 4px; bottom: 10px; left: 0; pointer-events: none; z-index: 2; }
    .slider-fill-range { position: absolute; height: 5px; background: linear-gradient(90deg, var(--ngx-slider-thumb, #1a73e8), var(--ngx-slider-thumb, #1a73e8)); border-radius: 4px; top: 50%; transform: translateY(-50%); pointer-events: none; z-index: 3; }
    .slider-input.slider-low { position: relative; z-index: 5; }
    .slider-input.slider-high { position: relative; z-index: 4; }
    .slider-ticks { display: flex; justify-content: space-between; font-size: 10px; color: #adb5bd; margin-top: 4px; padding: 0 5px; }
  `]
})
export class SliderComponent implements OnInit {
  label = input('');
  min = input(0);
  max = input(100);
  step = input(1);
  range = input(false);
  disabled = input(false);
  showValue = input(true);
  showTicks = input(false);

  /** Initial value for single-handle mode. */
  initialValue = input<number>(0);
  /** Initial low value for range mode. */
  initialLow = input<number>(20);
  /** Initial high value for range mode. */
  initialHigh = input<number>(80);

  value = signal(0);
  low = signal(20);
  high = signal(80);
  valueChange = output<number>();
  rangeChange = output<[number, number]>();

  ngOnInit(): void {
    this.value.set(this.clamp(this.initialValue(), this.min(), this.max()));
    this.low.set(this.clamp(this.initialLow(), this.min(), this.max()));
    this.high.set(this.clamp(this.initialHigh(), this.min(), this.max()));
  }

  pct = computed(() => {
    const min = this.min();
    const max = this.max();
    const denom = Math.max(1, max - min);
    return ((this.clamp(this.value(), min, max) - min) / denom) * 100;
  });

  lowPct = computed(() => {
    const min = this.min();
    const max = this.max();
    const denom = Math.max(1, max - min);
    return ((this.clamp(this.low(), min, max) - min) / denom) * 100;
  });

  highPct = computed(() => {
    const min = this.min();
    const max = this.max();
    const denom = Math.max(1, max - min);
    return 100 - (((this.clamp(this.high(), min, max) - min) / denom) * 100);
  });

  private clamp(v: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, v));
  }

  private stepSize(): number {
    const step = this.step();
    return Number.isFinite(step) && step > 0 ? step : 1;
  }

  onInput(e: Event): void {
    const target = e.target as HTMLInputElement;
    const next = this.clamp(+target.value, this.min(), this.max());
    target.value = String(next);
    this.value.set(next);
    this.valueChange.emit(next);
  }

  onLow(e: Event): void {
    const target = e.target as HTMLInputElement;
    const min = this.min();
    const max = this.max();
    const step = this.stepSize();
    const currentHigh = this.clamp(this.high(), min, max);
    const upperBound = this.clamp(currentHigh - step, min, max);
    const nextLow = this.clamp(+target.value, min, upperBound);

    target.value = String(nextLow);
    this.low.set(nextLow);

    if (currentHigh !== this.high()) {
      this.high.set(currentHigh);
    }

    this.rangeChange.emit([nextLow, currentHigh]);
  }

  onHigh(e: Event): void {
    const target = e.target as HTMLInputElement;
    const min = this.min();
    const max = this.max();
    const step = this.stepSize();
    const currentLow = this.clamp(this.low(), min, max);
    const lowerBound = this.clamp(currentLow + step, min, max);
    const nextHigh = this.clamp(+target.value, lowerBound, max);

    target.value = String(nextHigh);
    this.high.set(nextHigh);

    if (currentLow !== this.low()) {
      this.low.set(currentLow);
    }

    this.rangeChange.emit([currentLow, nextHigh]);
  }
}
