import {
  Component, ChangeDetectionStrategy, input, output, computed, signal,
  ElementRef, inject, DestroyRef, HostListener, ViewChild, AfterViewInit,
  untracked, effect
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngx-chart-brush-zoom',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="brush-zoom-container" #container (dblclick)="reset()" (click)="onTrackClick($event)">
      <svg [attr.width]="'100%'" [attr.height]="height()" class="brush-svg">
        <!-- Background sparkline -->
        @if (sparklinePath()) {
          <path [attr.d]="sparklinePath()" [attr.fill]="color()" fill-opacity="0.18" [attr.stroke]="color()" stroke-width="1.5" />
        }
        
        <!-- Unselected dimmed overlays -->
        <rect class="overlay-dim" x="0" y="0" [attr.width]="Math.max(0, windowLeft())" [attr.height]="height()" />
        <rect class="overlay-dim" [attr.x]="windowRight()" y="0" [attr.width]="Math.max(0, effectiveWidth() - windowRight())" [attr.height]="height()" />
        
        <!-- Selection window -->
        <rect class="selection-window"
              [attr.x]="windowLeft()" y="0"
              [attr.width]="windowWidth()" [attr.height]="height()"
              [attr.stroke]="color()"
              (mousedown)="onWindowMouseDown($event)"
              (touchstart)="onWindowTouchStart($event)" />
              
        <!-- Left handle pill -->
        <g [attr.transform]="'translate(' + (windowLeft() - handleHitWidth / 2) + ', 0)'"
           class="handle-group"
           (mousedown)="onHandleMouseDown($event, 'left')"
           (touchstart)="onHandleTouchStart($event, 'left')">
          <rect class="handle-hitbox" [attr.width]="handleHitWidth" [attr.height]="height()" fill="transparent" />
          <rect class="handle-pill" [attr.x]="(handleHitWidth - 8) / 2" y="2" width="8" [attr.height]="height() - 4" rx="4" [attr.fill]="color()" />
          <line [attr.x1]="handleHitWidth / 2" y1="8" [attr.x2]="handleHitWidth / 2" [attr.y2]="height() - 8" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="2,2" />
        </g>
              
        <!-- Right handle pill -->
        <g [attr.transform]="'translate(' + (windowRight() - handleHitWidth / 2) + ', 0)'"
           class="handle-group"
           (mousedown)="onHandleMouseDown($event, 'right')"
           (touchstart)="onHandleTouchStart($event, 'right')">
          <rect class="handle-hitbox" [attr.width]="handleHitWidth" [attr.height]="height()" fill="transparent" />
          <rect class="handle-pill" [attr.x]="(handleHitWidth - 8) / 2" y="2" width="8" [attr.height]="height() - 4" rx="4" [attr.fill]="color()" />
          <line [attr.x1]="handleHitWidth / 2" y1="8" [attr.x2]="handleHitWidth / 2" [attr.y2]="height() - 8" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="2,2" />
        </g>
      </svg>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
    .brush-zoom-container {
      width: 100%;
      position: relative;
      user-select: none;
      margin-top: 8px;
      background: var(--ngx-chart-brush-bg, rgba(15, 23, 42, 0.03));
      border: 1px solid var(--ngx-chart-border, #e2e8f0);
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
    }
    .brush-svg {
      display: block;
      overflow: visible;
      width: 100%;
    }
    .overlay-dim {
      fill: rgba(15, 23, 42, 0.15);
      pointer-events: none;
    }
    .selection-window {
      fill: rgba(59, 130, 246, 0.08);
      cursor: grab;
      stroke-width: 1.5;
    }
    .selection-window:active {
      cursor: grabbing;
      fill: rgba(59, 130, 246, 0.15);
    }
    .handle-group {
      cursor: ew-resize;
    }
    .handle-pill {
      transition: filter 0.15s;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
    }
    .handle-group:hover .handle-pill {
      filter: drop-shadow(0 3px 6px rgba(0,0,0,0.35)) brightness(1.15);
    }
  `]
})
export class ChartBrushZoomComponent implements AfterViewInit {
  data = input<number[] | any[]>([]);
  categories = input<string[]>([]);
  height = input<number>(50);
  startIndex = input<number>(0);
  endIndex = input<number>(-1);
  color = input<string>('#3b82f6');

  rangeChange = output<{ startIndex: number; endIndex: number; startCategory: string; endCategory: string }>();

  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;

  width = signal<number>(0);
  handleHitWidth = 16;
  
  // Normalized range indices
  sIdx = signal<number>(0);
  eIdx = signal<number>(0);

  private destroyRef = inject(DestroyRef);
  private resizeObserver!: ResizeObserver;
  private isDragging = false;
  private dragType: 'left' | 'right' | 'window' | null = null;
  private startX = 0;
  private startSIdx = 0;
  private startEIdx = 0;
  private initialized = false;

  readonly Math = Math;

  constructor() {
    effect(() => {
      const dLen = this.dataLen();
      const sInput = this.startIndex();
      let eInput = this.endIndex();
      
      if (!this.initialized && dLen > 0) {
        if (eInput === -1 || eInput >= dLen) {
          eInput = Math.max(0, dLen - 1);
        }
        untracked(() => {
          this.sIdx.set(Math.max(0, Math.min(sInput, eInput)));
          this.eIdx.set(eInput);
          this.initialized = true;
        });
      }
    });
  }

  ngAfterViewInit() {
    const el = this.containerRef.nativeElement;
    this.width.set(el.getBoundingClientRect().width || el.offsetWidth || 600);

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(entries => {
        if (!entries || !entries.length) return;
        const w = entries[0].contentRect.width;
        if (w > 0) this.width.set(w);
      });
      this.resizeObserver.observe(el);
      this.destroyRef.onDestroy(() => this.resizeObserver.disconnect());
    }
  }

  effectiveWidth = computed(() => Math.max(100, this.width()));

  dataLen = computed(() => {
    const d = this.data();
    return Array.isArray(d) ? d.length : 0;
  });

  normalizedData = computed(() => {
    const d = this.data();
    if (!d || d.length === 0) return [];
    if (typeof d[0] === 'number') return d as number[];
    return d[0]?.data?.map((p: any) => (typeof p === 'number' ? p : (p?.y ?? 0))) || [];
  });

  sparklinePath = computed(() => {
    const w = this.effectiveWidth();
    const h = this.height();
    const d = this.normalizedData();
    if (w === 0 || d.length < 2) return '';
    
    const maxVal = Math.max(...d, 1);
    const minVal = Math.min(...d, 0);
    const range = maxVal - minVal || 1;
    
    let path = `M 0 ${h}`;
    d.forEach((val: number, i: number) => {
      const x = (i / (d.length - 1)) * w;
      const y = h - ((val - minVal) / range) * (h - 8) - 4;
      path += ` L ${x} ${y}`;
    });
    path += ` L ${w} ${h} Z`;
    return path;
  });

  windowLeft = computed(() => {
    const len = this.dataLen();
    if (len <= 1) return 0;
    return (this.sIdx() / (len - 1)) * this.effectiveWidth();
  });

  windowRight = computed(() => {
    const len = this.dataLen();
    if (len <= 1) return this.effectiveWidth();
    return (this.eIdx() / (len - 1)) * this.effectiveWidth();
  });

  windowWidth = computed(() => Math.max(12, this.windowRight() - this.windowLeft()));

  reset() {
    const dLen = this.dataLen();
    this.sIdx.set(0);
    this.eIdx.set(Math.max(0, dLen - 1));
    this.emitChange();
  }

  onTrackClick(e: MouseEvent) {
    if (this.isDragging) return;
    const rect = this.containerRef.nativeElement.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const w = this.effectiveWidth();
    const len = this.dataLen();
    if (w === 0 || len <= 1) return;

    const clickedIdx = Math.round((clickX / w) * (len - 1));
    const currSpan = this.eIdx() - this.sIdx();
    const halfSpan = Math.floor(currSpan / 2);
    
    let newS = clickedIdx - halfSpan;
    let newE = newS + currSpan;

    if (newS < 0) { newS = 0; newE = currSpan; }
    if (newE >= len) { newE = len - 1; newS = newE - currSpan; }

    this.sIdx.set(Math.max(0, newS));
    this.eIdx.set(Math.min(len - 1, newE));
    this.emitChange();
  }

  onWindowMouseDown(e: MouseEvent) {
    e.stopPropagation();
    this.startDrag(e.clientX, 'window');
  }
  onWindowTouchStart(e: TouchEvent) {
    e.stopPropagation();
    this.startDrag(e.touches[0].clientX, 'window');
  }
  
  onHandleMouseDown(e: MouseEvent, type: 'left' | 'right') {
    e.stopPropagation();
    this.startDrag(e.clientX, type);
  }
  onHandleTouchStart(e: TouchEvent, type: 'left' | 'right') {
    e.stopPropagation();
    this.startDrag(e.touches[0].clientX, type);
  }

  private startDrag(x: number, type: 'left' | 'right' | 'window') {
    this.isDragging = true;
    this.dragType = type;
    this.startX = x;
    this.startSIdx = this.sIdx();
    this.startEIdx = this.eIdx();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    if (this.isDragging) this.handleDrag(e.clientX);
  }

  @HostListener('document:touchmove', ['$event'])
  onTouchMove(e: TouchEvent) {
    if (this.isDragging) this.handleDrag(e.touches[0].clientX);
  }

  @HostListener('document:mouseup')
  @HostListener('document:touchend')
  onDragEnd() {
    if (this.isDragging) {
      this.isDragging = false;
      this.dragType = null;
      this.emitChange();
    }
  }

  private handleDrag(clientX: number) {
    const dx = clientX - this.startX;
    const w = this.effectiveWidth();
    const len = this.dataLen();
    if (w === 0 || len <= 1) return;

    const indexDelta = (dx / w) * (len - 1);
    
    if (this.dragType === 'window') {
      let newS = Math.round(this.startSIdx + indexDelta);
      let newE = Math.round(this.startEIdx + indexDelta);
      const span = this.startEIdx - this.startSIdx;
      
      if (newS < 0) { newS = 0; newE = span; }
      if (newE >= len) { newE = len - 1; newS = newE - span; }
      
      this.sIdx.set(newS);
      this.eIdx.set(newE);
    } else if (this.dragType === 'left') {
      let newS = Math.round(this.startSIdx + indexDelta);
      newS = Math.max(0, Math.min(newS, this.eIdx() - 1));
      this.sIdx.set(newS);
    } else if (this.dragType === 'right') {
      let newE = Math.round(this.startEIdx + indexDelta);
      newE = Math.max(this.sIdx() + 1, Math.min(newE, len - 1));
      this.eIdx.set(newE);
    }

    this.emitChange();
  }

  private emitChange() {
    const s = this.sIdx();
    const e = this.eIdx();
    const cats = this.categories();
    this.rangeChange.emit({
      startIndex: s,
      endIndex: e,
      startCategory: cats[s] ?? '',
      endCategory: cats[e] ?? ''
    });
  }
}
