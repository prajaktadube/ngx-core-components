import {
  Component,
  ChangeDetectionStrategy,
  input,
  signal,
  computed,
  HostListener,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngx-image-compare',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="ngx-image-compare"
      [class.dark]="theme() === 'dark'"
      [class.dragging]="isDragging()"
      [attr.id]="id()"
      tabindex="0"
      (keydown)="onKeyDown($event)"
      aria-label="Image comparison slider"
    >
      <!-- After Image (Background layer) -->
      <div class="ngx-image-compare__layer after">
        <img [src]="afterImage()" class="ngx-image-compare__image" alt="After image" />
        @if (afterLabel()) {
          <div class="ngx-image-compare__label after">{{ afterLabel() }}</div>
        }
      </div>

      <!-- Before Image (Overlay layer clipped dynamically) -->
      <div
        class="ngx-image-compare__layer before"
        [style.clipPath]="clipPathStyle()"
      >
        <img [src]="beforeImage()" class="ngx-image-compare__image" alt="Before image" />
        @if (beforeLabel()) {
          <div class="ngx-image-compare__label before">{{ beforeLabel() }}</div>
        }
      </div>

      <!-- Drag Divider Handle -->
      <div
        class="ngx-image-compare__handle"
        [class.vertical]="orientation() === 'vertical'"
        [style.left.%]="orientation() === 'horizontal' ? sliderPos() : 50"
        [style.top.%]="orientation() === 'vertical' ? sliderPos() : 50"
      >
        <div class="ngx-image-compare__line"></div>
        <div class="ngx-image-compare__circle">
          <svg class="handle-arrow-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
            @if (orientation() === 'horizontal') {
              <polyline points="8 18 2 12 8 6" />
              <polyline points="16 6 22 12 16 18" />
            } @else {
              <polyline points="18 8 12 2 6 8" />
              <polyline points="6 16 12 22 18 16" />
            }
          </svg>
        </div>
        <div class="ngx-image-compare__line"></div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      user-select: none;
      -webkit-user-select: none;
    }

    .ngx-image-compare {
      position: relative;
      width: 100%;
      height: 450px;
      border-radius: 16px;
      overflow: hidden;
      cursor: ew-resize;
      background: #f1f5f9;
      box-shadow: 
        0 10px 25px -5px rgba(0, 0, 0, 0.05),
        0 8px 10px -6px rgba(0, 0, 0, 0.05);
      border: 1px solid rgba(0, 0, 0, 0.04);
      font-family: var(--ngx-font-family, system-ui, sans-serif);
      transition: box-shadow 0.2s ease;
    }

    .ngx-image-compare:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px var(--primary-color, #3b82f6);
    }

    .ngx-image-compare.dragging {
      cursor: ew-resize !important;
    }

    .ngx-image-compare.dark {
      background: #0f172a;
      border-color: rgba(255, 255, 255, 0.06);
    }

    /* Layers positioning */
    .ngx-image-compare__layer {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    .ngx-image-compare__layer.before {
      z-index: 2;
    }

    .ngx-image-compare__layer.after {
      z-index: 1;
    }

    .ngx-image-compare__image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      pointer-events: none;
    }

    /* Labels styling */
    .ngx-image-compare__label {
      position: absolute;
      bottom: 20px;
      padding: 6px 12px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.65);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.4);
      color: #0f172a;
      z-index: 5;
    }

    .ngx-image-compare__label.before {
      left: 20px;
    }

    .ngx-image-compare__label.after {
      right: 20px;
    }

    .dark .ngx-image-compare__label {
      background: rgba(15, 23, 42, 0.65);
      border-color: rgba(255, 255, 255, 0.08);
      color: #f1f5f9;
    }

    /* Divider Handle styles */
    .ngx-image-compare__handle {
      position: absolute;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      transition: box-shadow 0.2s ease;
    }

    /* Horizontal orientation */
    .ngx-image-compare__handle:not(.vertical) {
      top: 0;
      bottom: 0;
      width: 2px;
      flex-direction: column;
      transform: translateX(-50%);
    }

    /* Vertical orientation */
    .ngx-image-compare__handle.vertical {
      left: 0;
      right: 0;
      height: 2px;
      flex-direction: row;
      transform: translateY(-50%);
      cursor: ns-resize;
    }

    .ngx-image-compare:has(.ngx-image-compare__handle.vertical) {
      cursor: ns-resize;
    }

    /* Lines */
    .ngx-image-compare__line {
      flex-grow: 1;
      background: rgba(255, 255, 255, 0.9);
      box-shadow: 0 0 6px rgba(0, 0, 0, 0.2);
    }

    .ngx-image-compare__handle:not(.vertical) .ngx-image-compare__line {
      width: 2px;
    }

    .ngx-image-compare__handle.vertical .ngx-image-compare__line {
      height: 2px;
    }

    /* Drag circle */
    .ngx-image-compare__circle {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 2px solid #ffffff;
      color: #0f172a;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 
        0 4px 10px rgba(0, 0, 0, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
      z-index: 11;
      transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    .ngx-image-compare:hover .ngx-image-compare__circle {
      transform: scale(1.08);
      box-shadow: 
        0 0 0 4px rgba(255, 255, 255, 0.25),
        0 8px 16px rgba(0, 0, 0, 0.2);
    }

    .ngx-image-compare.dragging .ngx-image-compare__circle {
      transform: scale(1.15);
      background: var(--primary-color, #3b82f6);
      border-color: var(--primary-color, #3b82f6);
      color: #ffffff;
      box-shadow: 
        0 0 0 6px rgba(59, 130, 246, 0.25),
        0 12px 24px rgba(0, 0, 0, 0.25);
    }

    .dark .ngx-image-compare__circle {
      background: rgba(15, 23, 42, 0.85);
      border-color: rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
    }

    .dark .ngx-image-compare.dragging .ngx-image-compare__circle {
      background: var(--primary-color, #3b82f6);
      border-color: var(--primary-color, #3b82f6);
      color: #ffffff;
    }

    .handle-arrow-icon {
      transition: transform 0.2s ease;
    }
  `]
})
export class ImageCompareComponent implements OnInit {
  // Inputs
  beforeImage = input.required<string>();
  afterImage = input.required<string>();
  beforeLabel = input<string>('Before');
  afterLabel = input<string>('After');
  startOffset = input<number>(50);
  orientation = input<'horizontal' | 'vertical'>('horizontal');
  theme = input<'light' | 'dark'>('light');
  id = input<string>('ngx-img-compare-' + Math.random().toString(36).substring(2, 9));

  // Internal Signals
  sliderPos = signal<number>(50);
  isDragging = signal<boolean>(false);

  // Computed clip-path style based on slide percent
  clipPathStyle = computed(() => {
    const pos = this.sliderPos();
    if (this.orientation() === 'horizontal') {
      return `inset(0 ${100 - pos}% 0 0)`;
    } else {
      return `inset(0 0 ${100 - pos}% 0)`;
    }
  });

  ngOnInit() {
    this.sliderPos.set(Math.max(0, Math.min(100, this.startOffset())));
  }

  @HostListener('mousedown', ['$event'])
  onDragStart(event: MouseEvent) {
    event.preventDefault();
    this.isDragging.set(true);
    this.updatePositionFromEvent(event.clientX, event.clientY);
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    this.isDragging.set(true);
    this.updatePositionFromEvent(event.touches[0].clientX, event.touches[0].clientY);
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isDragging()) return;
    this.updatePositionFromEvent(event.clientX, event.clientY);
  }

  @HostListener('document:touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    if (!this.isDragging()) return;
    this.updatePositionFromEvent(event.touches[0].clientX, event.touches[0].clientY);
  }

  @HostListener('document:mouseup')
  @HostListener('document:touchend')
  onDragEnd() {
    this.isDragging.set(false);
  }

  private updatePositionFromEvent(clientX: number, clientY: number) {
    const host = document.getElementById(this.id());
    if (!host) return;
    const rect = host.getBoundingClientRect();
    this.updateSliderPosition(clientX, clientY, rect);
  }

  private updateSliderPosition(clientX: number, clientY: number, rect: DOMRect) {
    let pos = 50;
    if (this.orientation() === 'horizontal') {
      const x = clientX - rect.left;
      pos = (x / rect.width) * 100;
    } else {
      const y = clientY - rect.top;
      pos = (y / rect.height) * 100;
    }
    this.sliderPos.set(Math.max(0, Math.min(100, pos)));
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      this.sliderPos.set(Math.max(0, this.sliderPos() - 2));
      event.preventDefault();
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      this.sliderPos.set(Math.min(100, this.sliderPos() + 2));
      event.preventDefault();
    }
  }
}
