import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
  OnInit,
  OnDestroy,
  TemplateRef,
  HostListener,
  effect,
  untracked,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngx-carousel',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="ngx-carousel"
      [class.dark]="theme() === 'dark'"
      [attr.id]="id()"
      (keydown)="onKeyDown($event)"
      tabindex="0"
      (mouseenter)="onMouseEnter()"
      (mouseleave)="onMouseLeave()"
    >
      <div
        class="ngx-carousel__stage"
        (touchstart)="onTouchStart($event)"
        (touchend)="onTouchEnd($event)"
      >
        @for (item of items(); track $index) {
          <div
            class="ngx-carousel__slide"
            [class]="getSlideClass($index)"
          >
            @if (itemTemplate()) {
              <ng-container *ngTemplateOutlet="itemTemplate()!; context: { $implicit: item, index: $index }"></ng-container>
            } @else {
              <!-- Default Image layout -->
              <img [src]="item.url" [alt]="item.title || 'Slide ' + ($index + 1)" class="ngx-carousel__img" />
              @if (item.title || item.caption) {
                <div class="ngx-carousel__caption-card">
                  @if (item.title) {
                    <h3 class="ngx-carousel__caption-title">{{ item.title }}</h3>
                  }
                  @if (item.caption) {
                    <p class="ngx-carousel__caption-desc">{{ item.caption }}</p>
                  }
                </div>
              }
            }
          </div>
        }
      </div>

      <!-- Controls -->
      @if (showControls() && items().length > 1) {
        <button
          class="ngx-carousel__control prev"
          (click)="prevSlide()"
          aria-label="Previous slide"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          class="ngx-carousel__control next"
          (click)="nextSlide()"
          aria-label="Next slide"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      }

      <!-- Indicators -->
      @if (showIndicators() && items().length > 1) {
        <div class="ngx-carousel__indicators">
          @for (item of items(); track $index) {
            <button
              class="ngx-carousel__indicator"
              [class.active]="$index === activeIndex()"
              (click)="goToSlide($index)"
              [attr.aria-label]="'Go to slide ' + ($index + 1)"
            ></button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .ngx-carousel {
      position: relative;
      width: 100%;
      border-radius: 16px;
      overflow: hidden;
      outline: none;
      background: #f1f5f9;
      box-shadow: 
        0 10px 25px -5px rgba(0, 0, 0, 0.05),
        0 8px 10px -6px rgba(0, 0, 0, 0.05);
      font-family: var(--ngx-font-family, system-ui, sans-serif);
      transition: box-shadow 0.3s ease;
    }

    .ngx-carousel.dark {
      background: #0f172a;
    }

    .ngx-carousel:focus-visible {
      box-shadow: 0 0 0 3px var(--primary-color, #3b82f6);
    }

    .ngx-carousel__stage {
      position: relative;
      width: 100%;
      height: 400px;
      overflow: hidden;
    }

    /* ── Slide styles ── */
    .ngx-carousel__slide {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      visibility: hidden;
      opacity: 0;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ngx-carousel__slide.active {
      visibility: visible;
      opacity: 1;
      transform: translateX(0);
      z-index: 2;
    }

    .ngx-carousel__img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      user-select: none;
      pointer-events: none;
    }

    /* ── Glassmorphic Caption Card ── */
    .ngx-carousel__caption-card {
      position: absolute;
      bottom: 24px;
      left: 24px;
      right: 24px;
      padding: 16px 20px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.65);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.4);
      box-shadow: 
        0 10px 15px -3px rgba(0, 0, 0, 0.05),
        0 4px 6px -4px rgba(0, 0, 0, 0.05);
      z-index: 5;
      max-width: 480px;
      animation: captionEntrance 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      transform: translateY(10px);
      opacity: 0;
    }

    .dark .ngx-carousel__caption-card {
      background: rgba(15, 23, 42, 0.65);
      border-color: rgba(255, 255, 255, 0.08);
    }

    .ngx-carousel__caption-title {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
    }

    .dark .ngx-carousel__caption-title {
      color: #f8fafc;
    }

    .ngx-carousel__caption-desc {
      margin: 0;
      font-size: 13px;
      line-height: 1.4;
      color: #334155;
    }

    .dark .ngx-carousel__caption-desc {
      color: #cbd5e1;
    }

    @keyframes captionEntrance {
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    /* ── Controls (Next/Prev) ── */
    .ngx-carousel__control {
      position: absolute;
      top: 50%;
      transform: translateY(-50%) scale(0.9);
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.6);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.4);
      color: #0f172a;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 10;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      opacity: 0;
    }

    .dark .ngx-carousel__control {
      background: rgba(15, 23, 42, 0.6);
      border-color: rgba(255, 255, 255, 0.08);
      color: #cbd5e1;
    }

    .ngx-carousel:hover .ngx-carousel__control {
      opacity: 1;
      transform: translateY(-50%) scale(1);
    }

    .ngx-carousel__control:hover {
      background: rgba(255, 255, 255, 0.85);
      transform: translateY(-50%) scale(1.08) !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .ngx-carousel__control.prev {
      left: 16px;
    }

    .ngx-carousel__control.next {
      right: 16px;
    }

    /* ── Indicators ── */
    .ngx-carousel__indicators {
      position: absolute;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 8px;
      z-index: 10;
      background: rgba(255, 255, 255, 0.45);
      padding: 6px 10px;
      border-radius: 20px;
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .dark .ngx-carousel__indicators {
      background: rgba(15, 23, 42, 0.45);
      border-color: rgba(255, 255, 255, 0.05);
    }

    .ngx-carousel__indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      border: none;
      background: rgba(0, 0, 0, 0.25);
      cursor: pointer;
      transition: all 0.2s ease;
      padding: 0;
    }

    .dark .ngx-carousel__indicator {
      background: rgba(255, 255, 255, 0.25);
    }

    .ngx-carousel__indicator.active {
      background: var(--primary-color, #3b82f6);
      width: 18px;
      border-radius: 4px;
    }

    /* ── Transitions ── */
    .ngx-carousel__slide.transition-fade {
      /* Fade is simple opacity change */
    }

    /* Slide Keyframes */
    .ngx-carousel__slide.transition-slide.active-from-right {
      animation: slideInRight 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
      z-index: 3;
    }
    .ngx-carousel__slide.transition-slide.active-from-left {
      animation: slideInLeft 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
      z-index: 3;
    }
    .ngx-carousel__slide.transition-slide.exit-to-right {
      animation: slideOutRight 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
      visibility: visible;
      z-index: 1;
    }
    .ngx-carousel__slide.transition-slide.exit-to-left {
      animation: slideOutLeft 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
      visibility: visible;
      z-index: 1;
    }

    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideInLeft {
      from { transform: translateX(-100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
    @keyframes slideOutLeft {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(-100%); opacity: 0; }
    }
  `]
})
export class CarouselComponent implements OnInit, OnDestroy {
  // Inputs
  items = input<any[]>([]);
  autoplay = input<boolean>(true);
  interval = input<number>(5000);
  transition = input<'slide' | 'fade'>('slide');
  theme = input<'light' | 'dark'>('light');
  showIndicators = input<boolean>(true);
  showControls = input<boolean>(true);
  itemTemplate = input<TemplateRef<any> | null>(null);
  id = input<string>('ngx-carousel-' + Math.random().toString(36).substring(2, 9));

  // Outputs
  slideChange = output<{ index: number; item: any }>();

  // State Signals
  activeIndex = signal<number>(0);
  lastActiveIndex = signal<number>(-1);
  navDirection = signal<'next' | 'prev'>('next');

  constructor() {
    effect(() => {
      // Clamp index on item changes
      const total = this.items().length;
      if (this.activeIndex() >= total) {
        this.activeIndex.set(total > 0 ? total - 1 : 0);
      }
    }, { allowSignalWrites: true });

    effect(() => {
      // React to autoplay and interval updates
      this.autoplay();
      this.interval();

      untracked(() => {
        this.resetAutoplay();
      });
    });
  }

  private autoplayTimer: any = null;
  private touchStartX = 0;

  ngOnInit() {
    this.startAutoplay();
  }

  ngOnDestroy() {
    this.stopAutoplay();
  }

  goToSlide(index: number) {
    if (index === this.activeIndex() || this.items().length <= 1) return;

    this.lastActiveIndex.set(this.activeIndex());
    this.navDirection.set(index > this.activeIndex() ? 'next' : 'prev');
    this.activeIndex.set(index);

    this.slideChange.emit({
      index: index,
      item: this.items()[index],
    });

    this.resetAutoplay();
  }

  nextSlide() {
    const total = this.items().length;
    if (total <= 1) return;
    const nextIdx = (this.activeIndex() + 1) % total;
    this.goToSlide(nextIdx);
  }

  prevSlide() {
    const total = this.items().length;
    if (total <= 1) return;
    const prevIdx = (this.activeIndex() - 1 + total) % total;
    this.goToSlide(prevIdx);
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowRight') {
      this.nextSlide();
      event.preventDefault();
    } else if (event.key === 'ArrowLeft') {
      this.prevSlide();
      event.preventDefault();
    }
  }

  // Touch Swipe Handlers
  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.touches[0].clientX;
  }

  onTouchEnd(event: TouchEvent) {
    const touchEndX = event.changedTouches[0].clientX;
    const diff = touchEndX - this.touchStartX;

    // Minimum swipe threshold (50px)
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        this.prevSlide(); // Swiped right -> go to previous
      } else {
        this.nextSlide(); // Swiped left -> go to next
      }
    }
  }

  // Autoplay Logic
  onMouseEnter() {
    this.stopAutoplay();
  }

  onMouseLeave() {
    this.startAutoplay();
  }

  private startAutoplay() {
    if (!this.autoplay() || this.items().length <= 1) return;
    this.stopAutoplay();
    this.autoplayTimer = setInterval(() => {
      this.nextSlide();
    }, this.interval());
  }

  private stopAutoplay() {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }

  private resetAutoplay() {
    this.stopAutoplay();
    this.startAutoplay();
  }

  // Helper to dynamically calculate classes per slide to trigger CSS animations
  getSlideClass(index: number): string {
    const active = this.activeIndex();
    const last = this.lastActiveIndex();
    const transitionType = this.transition();

    if (index === active) {
      if (last === -1) return 'active';
      const direction = this.navDirection();
      return `active transition-${transitionType} active-from-${direction === 'next' ? 'right' : 'left'}`;
    }
    if (index === last) {
      const direction = this.navDirection();
      return `transition-${transitionType} exit-to-${direction === 'next' ? 'left' : 'right'}`;
    }
    return '';
  }
}
