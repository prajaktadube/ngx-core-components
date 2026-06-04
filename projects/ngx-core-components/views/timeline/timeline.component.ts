import { Component, ChangeDetectionStrategy, input, computed, Directive, TemplateRef, contentChild, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TimelineItem {
  id?: string | number;
  title: string;
  subtitle?: string;
  description?: string;
  timestamp: string | Date;
  icon?: string;
  color?: string;
  status?: 'success' | 'warning' | 'error' | 'info' | 'default';
  active?: boolean;
}

@Directive({
  selector: '[ngxTimelineMarkerTemplate]',
  standalone: true
})
export class NgxTimelineMarkerTemplateDirective {
  constructor(public templateRef: TemplateRef<any>) {}
}

@Directive({
  selector: '[ngxTimelineCardTemplate]',
  standalone: true
})
export class NgxTimelineCardTemplateDirective {
  constructor(public templateRef: TemplateRef<any>) {}
}

@Component({
  selector: 'ngx-timeline',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="ngx-timeline"
      [class.orientation-horizontal]="orientation() === 'horizontal'"
      [class.orientation-vertical]="orientation() === 'vertical'"
      [class.alternating]="alternating()"
    >
      <!-- Timeline Central Track Line -->
      <div class="timeline-track"></div>

      <!-- Timeline Items List -->
      <div class="timeline-items">
        @for (item of items(); track item.id || item.title; let i = $index) {
          <div
            class="timeline-item"
            [class.align-left]="alternating() && i % 2 === 0"
            [class.align-right]="alternating() && i % 2 !== 0"
            [class.status-success]="item.status === 'success'"
            [class.status-warning]="item.status === 'warning'"
            [class.status-error]="item.status === 'error'"
            [class.status-info]="item.status === 'info'"
            [class.clickable]="clickable()"
            [class.active-item]="item.active"
            [class.item-selected]="selectedItem() === item"
            [style.--item-color]="item.color || 'var(--primary-color)'"
            [style.--item-index]="i"
            [attr.tabindex]="clickable() ? 0 : null"
            (click)="onItemClick(item)"
            (keydown.enter)="onItemClick(item)"
            (keydown.space)="$event.preventDefault(); onItemClick(item)"
          >
            @if (orientation() === 'horizontal') {
              <!-- UPPER HALF -->
              <div class="timeline-item-half upper-half">
                @if (!alternating() || i % 2 === 0) {
                  <!-- Card Template -->
                  @if (cardTemplate()) {
                    <ng-container *ngTemplateOutlet="cardTemplate()!.templateRef; context: { $implicit: item, item: item, index: i }" />
                  } @else {
                    <div class="timeline-card">
                      <div class="card-arrow"></div>
                      <div class="card-header">
                        <span class="item-time">
                          @if (isDate(item.timestamp)) {
                            {{ asDate(item.timestamp) | date:'mediumDate' }}
                          } @else {
                            {{ item.timestamp }}
                          }
                        </span>
                        @if (item.subtitle) {
                          <span class="item-subtitle">{{ item.subtitle }}</span>
                        }
                      </div>
                      <h4 class="item-title">{{ item.title }}</h4>
                      @if (item.description) {
                        <p class="item-desc">{{ item.description }}</p>
                      }
                    </div>
                  }
                }
              </div>

              <!-- MIDDLE MARKER -->
              <div class="timeline-marker">
                @if (markerTemplate()) {
                  <ng-container *ngTemplateOutlet="markerTemplate()!.templateRef; context: { $implicit: item, item: item, index: i }" />
                } @else {
                  <span class="marker-dot" [class.marker-dot-active]="item.active">
                    @if (item.icon) {
                      <span class="marker-icon">{{ item.icon }}</span>
                    }
                  </span>
                }
              </div>

              <!-- LOWER HALF -->
              <div class="timeline-item-half lower-half">
                @if (alternating() && i % 2 !== 0) {
                  <!-- Card Template -->
                  @if (cardTemplate()) {
                    <ng-container *ngTemplateOutlet="cardTemplate()!.templateRef; context: { $implicit: item, item: item, index: i }" />
                  } @else {
                    <div class="timeline-card">
                      <div class="card-arrow"></div>
                      <div class="card-header">
                        <span class="item-time">
                          @if (isDate(item.timestamp)) {
                            {{ asDate(item.timestamp) | date:'mediumDate' }}
                          } @else {
                            {{ item.timestamp }}
                          }
                        </span>
                        @if (item.subtitle) {
                          <span class="item-subtitle">{{ item.subtitle }}</span>
                        }
                      </div>
                      <h4 class="item-title">{{ item.title }}</h4>
                      @if (item.description) {
                        <p class="item-desc">{{ item.description }}</p>
                      }
                    </div>
                  }
                }
              </div>
            } @else {
              <!-- VERTICAL LAYOUT -->
              <div class="timeline-marker">
                @if (markerTemplate()) {
                  <ng-container *ngTemplateOutlet="markerTemplate()!.templateRef; context: { $implicit: item, item: item, index: i }" />
                } @else {
                  <span class="marker-dot" [class.marker-dot-active]="item.active">
                    @if (item.icon) {
                      <span class="marker-icon">{{ item.icon }}</span>
                    }
                  </span>
                }
              </div>

              @if (cardTemplate()) {
                <ng-container *ngTemplateOutlet="cardTemplate()!.templateRef; context: { $implicit: item, item: item, index: i }" />
              } @else {
                <div class="timeline-card">
                  <div class="card-arrow"></div>
                  <div class="card-header">
                    <span class="item-time">
                      @if (isDate(item.timestamp)) {
                        {{ asDate(item.timestamp) | date:'mediumDate' }}
                      } @else {
                        {{ item.timestamp }}
                      }
                    </span>
                    @if (item.subtitle) {
                      <span class="item-subtitle">{{ item.subtitle }}</span>
                    }
                  </div>
                  <h4 class="item-title">{{ item.title }}</h4>
                  @if (item.description) {
                    <p class="item-desc">{{ item.description }}</p>
                  }
                </div>
              }
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .ngx-timeline {
      position: relative;
      width: 100%;
      box-sizing: border-box;
      padding: 24px 0;
    }

    /* Core Track Line CSS styling */
    .timeline-track {
      position: absolute;
      background: var(--border-color, #e2e8f0);
      z-index: 1;
      transition: background-color 0.2s ease;
    }

    .orientation-vertical .timeline-track {
      top: 0;
      bottom: 0;
      left: 20px;
      width: 4px;
      transform: translateX(-50%);
    }

    .orientation-vertical.alternating .timeline-track {
      left: 50%;
    }

    .orientation-horizontal .timeline-track {
      left: 0;
      right: 0;
      top: 50%;
      height: 4px;
      transform: translateY(-50%);
    }

    /* Timeline Items Lists */
    .timeline-items {
      display: flex;
      position: relative;
      z-index: 2;
    }

    .orientation-vertical .timeline-items {
      flex-direction: column;
      gap: 28px;
    }

    .orientation-horizontal .timeline-items {
      flex-direction: row;
      justify-content: flex-start;
      gap: 24px;
      width: max-content;
      padding: 24px 16px;
    }

    /* Single Timeline Item Wrapper */
    .timeline-item {
      position: relative;
      display: flex;
      box-sizing: border-box;
      outline: none;
      opacity: 0;
      animation: timelineItemEntrance 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      animation-delay: calc(var(--item-index, 0) * 0.08s);
    }

    @keyframes timelineItemEntrance {
      from {
        opacity: 0;
        transform: translateY(16px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .orientation-vertical .timeline-item {
      padding-left: 48px;
      width: 100%;
    }

    .orientation-vertical.alternating .timeline-item {
      padding-left: 0;
      width: 50%;
    }

    .orientation-vertical.alternating .timeline-item.align-left {
      align-self: flex-start;
      padding-right: 36px;
      flex-direction: row-reverse;
    }

    .orientation-vertical.alternating .timeline-item.align-right {
      align-self: flex-end;
      padding-left: 36px;
    }

    .orientation-horizontal .timeline-item {
      flex-direction: column;
      align-items: center;
      width: 240px;
      min-width: 240px;
      height: 320px;
    }

    /* Clickable cursor override */
    .timeline-item.clickable {
      cursor: pointer;
    }

    /* Marker Dots indicators */
    .timeline-marker {
      position: absolute;
      z-index: 5;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .orientation-vertical .timeline-marker {
      left: 20px;
      top: 14px;
      transform: translateX(-50%);
    }

    .orientation-vertical.alternating .timeline-marker {
      left: 100%;
      top: 18px;
    }

    .orientation-vertical.alternating .timeline-item.align-left .timeline-marker {
      left: 100%;
      transform: translateX(-50%);
    }
    
    .orientation-vertical.alternating .timeline-item.align-right .timeline-marker {
      left: 0;
      transform: translateX(-50%);
    }

    .orientation-horizontal .timeline-marker {
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      height: 30px;
      width: 100%;
    }

    .marker-dot {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: var(--bg-secondary, #ffffff);
      border: 3px solid var(--item-color);
      box-shadow: 0 0 0 3px rgba(255,255,255,1), var(--shadow-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .timeline-item:hover .marker-dot {
      transform: scale(1.18);
      box-shadow: 0 0 0 4px rgba(255,255,255,1), 0 0 0 6px var(--item-color), var(--shadow-md);
      background: var(--item-color);
      color: #fff;
    }

    .marker-icon {
      font-size: 9px;
      line-height: 1;
      display: block;
    }

    /* Pulsing active marker dot */
    .marker-dot-active {
      position: relative;
    }

    .marker-dot-active::after {
      content: '';
      position: absolute;
      top: -6px;
      left: -6px;
      right: -6px;
      bottom: -6px;
      border-radius: 50%;
      border: 2px solid var(--item-color);
      animation: markerPulse 1.8s infinite ease-out;
      opacity: 0;
      pointer-events: none;
    }

    @keyframes markerPulse {
      0% {
        transform: scale(0.85);
        opacity: 0.6;
      }
      100% {
        transform: scale(1.6);
        opacity: 0;
      }
    }

    /* Content Card overlays - Glassmorphism defaults */
    .timeline-card {
      background: var(--ngx-timeline-card-bg, rgba(255, 255, 255, 0.7));
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid var(--ngx-timeline-card-border, rgba(226, 232, 240, 0.8));
      border-radius: 12px;
      padding: 16px 18px;
      box-shadow: var(--shadow-sm, 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03));
      position: relative;
      width: 100%;
      box-sizing: border-box;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .timeline-item:hover .timeline-card {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04));
      border-color: var(--item-color);
    }

    .timeline-item.item-selected .timeline-card {
      border-color: var(--item-color);
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15), var(--shadow-md);
      background: var(--ngx-timeline-card-selected-bg, rgba(255, 255, 255, 0.95));
    }

    .timeline-item.clickable:focus-visible .timeline-card {
      box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--item-color);
    }

    /* Arrow Styling */
    .card-arrow {
      position: absolute;
      width: 8px;
      height: 8px;
      background: inherit;
      border: 1px solid inherit;
      border-color: inherit;
      border-style: solid;
      z-index: 2;
    }

    /* Vertical orientations */
    .orientation-vertical .timeline-card .card-arrow {
      top: 18px;
      left: -5px;
      border-width: 0 0 1px 1px;
      transform: rotate(45deg);
    }

    .orientation-vertical.alternating .timeline-item.align-left .timeline-card .card-arrow {
      left: auto;
      right: -5px;
      border-width: 1px 1px 0 0;
      transform: rotate(45deg);
    }

    /* Horizontal orientations */
    .orientation-horizontal .timeline-item-half {
      height: 145px;
      width: 100%;
      display: flex;
      justify-content: center;
      box-sizing: border-box;
    }

    .orientation-horizontal .upper-half {
      align-items: flex-end;
      padding-bottom: 12px;
    }

    .orientation-horizontal .lower-half {
      align-items: flex-start;
      padding-top: 12px;
    }

    .orientation-horizontal .upper-half .timeline-card .card-arrow {
      bottom: -5px;
      left: 50%;
      transform: translateX(-50%) rotate(45deg);
      border-width: 0 1px 1px 0;
    }

    .orientation-horizontal .lower-half .timeline-card .card-arrow {
      top: -5px;
      left: 50%;
      transform: translateX(-50%) rotate(45deg);
      border-width: 1px 0 0 1px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .item-time {
      font-size: 11px;
      font-weight: 700;
      color: var(--text-secondary, #64748b);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .item-subtitle {
      font-size: 11px;
      font-weight: 600;
      color: var(--item-color);
      background: var(--border-light, #f1f5f9);
      padding: 2px 6px;
      border-radius: 4px;
      transition: background-color 0.2s ease;
    }

    .item-title {
      margin: 0 0 6px;
      font-size: 14px;
      font-weight: 750;
      color: var(--text-primary, #0f172a);
    }

    .item-desc {
      margin: 0;
      font-size: 12px;
      color: var(--text-secondary, #64748b);
      line-height: 1.5;
    }

    /* Cards alignment logic arrows in alternating layout */
    .orientation-vertical.alternating .timeline-item.align-left .timeline-card {
      text-align: right;
    }
    .orientation-vertical.alternating .timeline-item.align-left .card-header {
      flex-direction: row-reverse;
    }

    /* Status State overrides */
    .status-success { --item-color: #10b981 !important; }
    .status-warning { --item-color: #f59e0b !important; }
    .status-error   { --item-color: #ef4444 !important; }
    .status-info    { --item-color: #3b82f6 !important; }

    /* Dark Theme Support */
    .ngx-timeline.dark .timeline-track { background: #334155; }
    .ngx-timeline.dark .timeline-card {
      background: var(--ngx-timeline-card-bg-dark, rgba(30, 41, 59, 0.7));
      border-color: var(--ngx-timeline-card-border-dark, rgba(71, 85, 105, 0.8));
    }
    .ngx-timeline.dark .item-subtitle { background: #334155; }
    .ngx-timeline.dark .item-title { color: #f8fafc; }
    .ngx-timeline.dark .item-desc { color: #94a3b8; }
    .ngx-timeline.dark .item-time { color: #94a3b8; }
    .ngx-timeline.dark .timeline-item.item-selected .timeline-card {
      background: var(--ngx-timeline-card-selected-bg-dark, rgba(30, 41, 59, 0.95));
    }
  `]
})
export class TimelineComponent {
  items = input<TimelineItem[]>([]);
  orientation = input<'vertical' | 'horizontal'>('vertical');
  alternating = input<boolean>(false);
  clickable = input<boolean>(false);
  selectedItem = input<TimelineItem | null>(null);

  itemClick = output<TimelineItem>();

  markerTemplate = contentChild(NgxTimelineMarkerTemplateDirective);
  cardTemplate = contentChild(NgxTimelineCardTemplateDirective);

  isDate(val: string | Date): boolean {
    return val instanceof Date;
  }

  asDate(val: string | Date): Date {
    return val as Date;
  }

  onItemClick(item: TimelineItem): void {
    if (this.clickable()) {
      this.itemClick.emit(item);
    }
  }
}
