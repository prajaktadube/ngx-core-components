import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TimelineItem {
  title: string;
  subtitle?: string;
  description?: string;
  timestamp: string | Date;
  icon?: string;
  color?: string;
  status?: 'success' | 'warning' | 'error' | 'info' | 'default';
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
        @for (item of items(); track item.title; let i = $index) {
          <div
            class="timeline-item"
            [class.align-left]="alternating() && i % 2 === 0"
            [class.align-right]="alternating() && i % 2 !== 0"
            [class.status-success]="item.status === 'success'"
            [class.status-warning]="item.status === 'warning'"
            [class.status-error]="item.status === 'error'"
            [class.status-info]="item.status === 'info'"
            [style.--item-color]="item.color || 'var(--primary-color)'"
          >
            <!-- Timeline Item Dot indicator -->
            <div class="timeline-marker">
              <span class="marker-dot">
                @if (item.icon) {
                  <span class="marker-icon">{{ item.icon }}</span>
                }
              </span>
            </div>

            <!-- Content Card -->
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
      padding: 16px 0;
    }

    /* Core Track Line CSS styling */
    .timeline-track {
      position: absolute;
      background: var(--border-color, #e2e8f0);
      z-index: 1;
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
      gap: 24px;
    }

    .orientation-horizontal .timeline-items {
      flex-direction: row;
      justify-content: space-between;
      gap: 16px;
      width: 100%;
      overflow-x: auto;
      padding: 60px 0;
    }

    /* Single Timeline Item Wrapper */
    .timeline-item {
      position: relative;
      display: flex;
      box-sizing: border-box;
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
      padding-right: 32px;
      flex-direction: row-reverse;
    }

    .orientation-vertical.alternating .timeline-item.align-right {
      align-self: flex-end;
      padding-left: 32px;
    }

    .orientation-horizontal .timeline-item {
      flex-direction: column;
      align-items: center;
      flex: 1;
      min-width: 180px;
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
      transition: all 0.2s ease;
    }
    
    .timeline-item:hover .marker-dot {
      transform: scale(1.2);
      box-shadow: 0 0 0 4px rgba(255,255,255,1), 0 0 0 6px var(--item-color), var(--shadow-md);
      background: var(--item-color);
      color: #fff;
    }

    .marker-icon {
      font-size: 9px;
      line-height: 1;
      display: block;
    }

    /* Content Card overlays */
    .timeline-card {
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 8px;
      padding: 14px 16px;
      box-shadow: var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05));
      position: relative;
      width: 100%;
      transition: all 0.2s ease-in-out;
    }

    .timeline-item:hover .timeline-card {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md, 0 4px 12px rgba(0,0,0,0.08));
      border-color: var(--item-color);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      margin-bottom: 6px;
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
    }

    .item-title {
      margin: 0 0 4px;
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
  `]
})
export class TimelineComponent {
  items = input<TimelineItem[]>([]);
  orientation = input<'vertical' | 'horizontal'>('vertical');
  alternating = input<boolean>(false);

  isDate(val: string | Date): boolean {
    return val instanceof Date;
  }

  asDate(val: string | Date): Date {
    return val as Date;
  }
}
