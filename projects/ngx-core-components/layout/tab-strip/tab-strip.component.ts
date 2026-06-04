import { Component, input, output, signal, contentChildren, AfterContentInit, ElementRef, viewChild, effect } from '@angular/core';

@Component({
  selector: 'ngx-tab',
  standalone: true,
  template: `
    <div [hidden]="!isActive()">
      <ng-content />
    </div>
  `,
})
export class TabComponent {
  title = input.required<string>();
  icon = input<string>('');
  disabled = input(false);
  badge = input<string | number>('');
  closable = input(false);
  isActive = signal(false);

  tabClose = output<void>();
}

@Component({
  selector: 'ngx-tab-strip',
  standalone: true,
  imports: [],
  template: `
    <div class="ngx-tab-strip" [class]="'tabs-' + position()">
      <div class="tab-list" #tabList role="tablist">
        @for (tab of tabs(); track tab.title(); let i = $index) {
          <button
            class="tab-btn"
            [class.active]="activeIndex() === i"
            [class.disabled]="tab.disabled()"
            role="tab"
            [attr.aria-selected]="activeIndex() === i"
            [disabled]="tab.disabled()"
            (click)="selectTab(i)"
          >
            @if (tab.icon()) { <span class="tab-icon" aria-hidden="true">{{ tab.icon() }}</span> }
            <span class="tab-title">{{ tab.title() }}</span>
            @if (tab.badge()) { <span class="tab-badge">{{ tab.badge() }}</span> }
            @if (tab.closable()) {
              <button 
                class="tab-close-btn" 
                (click)="closeTab($event, i)" 
                title="Close Tab"
                type="button"
              >
                ×
              </button>
            }
          </button>
        }
        <div 
          class="tab-indicator"
          [style.left.px]="indicatorLeft()"
          [style.top.px]="indicatorTop()"
          [style.width.px]="position() === 'top' || position() === 'bottom' ? indicatorWidth() : 3"
          [style.height.px]="position() === 'left' || position() === 'right' ? indicatorHeight() : 3"
        ></div>
      </div>
      <div class="tab-content" role="tabpanel">
        <ng-content />
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .ngx-tab-strip { display: flex; }
    .ngx-tab-strip.tabs-top { flex-direction: column; }
    .ngx-tab-strip.tabs-bottom { flex-direction: column-reverse; }
    .ngx-tab-strip.tabs-left { flex-direction: row; }
    .ngx-tab-strip.tabs-right { flex-direction: row-reverse; }

    .tab-list { 
      display: flex; 
      position: relative; 
      overflow-x: auto; 
      gap: 0; 
      border-color: var(--ngx-tab-border, var(--border-color, #e2e8f0));
      border-style: solid;
      border-width: 0;
    }
    
    .tabs-top .tab-list { border-bottom-width: 2px; flex-direction: row; }
    .tabs-bottom .tab-list { border-top-width: 2px; flex-direction: row; }
    .tabs-left .tab-list { border-right-width: 2px; flex-direction: column; overflow-y: auto; overflow-x: hidden; }
    .tabs-right .tab-list { border-left-width: 2px; flex-direction: column; overflow-y: auto; overflow-x: hidden; }

    .tab-btn {
      display: inline-flex; 
      align-items: center; 
      gap: 6px; 
      padding: 12px 20px;
      background: none; 
      border: none; 
      font-size: 13px; 
      font-weight: 500;
      color: var(--ngx-tab-color, var(--text-secondary, #64748b)); 
      cursor: pointer; 
      font-family: inherit;
      transition: all 0.2s ease; 
      white-space: nowrap; 
      position: relative;
      outline: none;
      user-select: none;
    }
    
    .tabs-top .tab-btn { margin-bottom: -2px; border-bottom: 2px solid transparent; }
    .tabs-bottom .tab-btn { margin-top: -2px; border-top: 2px solid transparent; }
    .tabs-left .tab-btn { margin-right: -2px; border-right: 2px solid transparent; text-align: left; justify-content: flex-start; width: 100%; }
    .tabs-right .tab-btn { margin-left: -2px; border-left: 2px solid transparent; text-align: right; justify-content: flex-end; width: 100%; }

    .tab-btn:hover:not(:disabled):not(.active) { 
      color: var(--ngx-tab-hover-color, var(--text-primary, #0f172a)); 
      background: var(--ngx-tab-hover-bg, var(--bg-secondary, #f8fafc));
    }
    
    .tab-btn.active { 
      color: var(--ngx-tab-active-color, var(--primary-color, #1a73e8)); 
      font-weight: 600; 
    }
    .tab-btn.disabled { opacity: 0.45; cursor: not-allowed; }
    
    .tab-icon { font-size: 15px; display: inline-flex; align-items: center; }
    .tab-badge { 
      background: var(--ngx-tab-badge-bg, var(--error-color, #ef4444)); 
      color: #fff; 
      font-size: 10px; 
      font-weight: 700; 
      padding: 1px 6px; 
      border-radius: 999px; 
      min-width: 18px; 
      text-align: center; 
    }
    
    .tab-close-btn {
      background: transparent;
      border: none;
      font-size: 14px;
      color: var(--text-secondary, #94a3b8);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      margin-left: 4px;
      padding: 0;
      transition: all 0.15s ease;
    }
    .tab-close-btn:hover {
      background: rgba(0, 0, 0, 0.08);
      color: var(--error-color, #ef4444);
    }

    .tab-indicator { 
      position: absolute;
      background: var(--ngx-tab-active-color, var(--primary-color, #1a73e8));
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 2;
    }
    
    .tabs-top .tab-indicator { bottom: 0; }
    .tabs-bottom .tab-indicator { top: 0; }
    .tabs-left .tab-indicator { right: 0; }
    .tabs-right .tab-indicator { left: 0; }

    .tab-content { 
      flex: 1; 
      padding: var(--ngx-tab-content-padding, 20px); 
      min-width: 0;
    }
  `]
})
export class TabStripComponent implements AfterContentInit {
  position = input<'top' | 'bottom' | 'left' | 'right'>('top');
  activeIndex = signal(0);
  
  indicatorLeft = signal(0);
  indicatorTop = signal(0);
  indicatorWidth = signal(0);
  indicatorHeight = signal(0);

  tabListEl = viewChild<ElementRef>('tabList');
  tabs = contentChildren(TabComponent);

  tabChange = output<number>();
  tabClose = output<number>();

  constructor() {
    effect(() => {
      const idx = this.activeIndex();
      // Track tabs list changes
      const currentTabs = this.tabs();
      this.updateIndicator(idx);
    });
  }

  ngAfterContentInit() {
    this._syncActiveTabs();
  }

  selectTab(index: number) {
    this.activeIndex.set(index);
    this._syncActiveTabs();
    this.tabChange.emit(index);
  }

  closeTab(event: MouseEvent, index: number) {
    event.stopPropagation();
    const tabs = this.tabs();
    const closedTab = tabs[index];
    if (closedTab) {
      closedTab.tabClose.emit();
    }
    this.tabClose.emit(index);
  }

  updateIndicator(index: number) {
    setTimeout(() => {
      const list = this.tabListEl()?.nativeElement as HTMLElement;
      if (!list) return;
      const btns = list.querySelectorAll('.tab-btn');
      const activeBtn = btns[index] as HTMLElement;
      if (activeBtn) {
        this.indicatorLeft.set(activeBtn.offsetLeft);
        this.indicatorTop.set(activeBtn.offsetTop);
        this.indicatorWidth.set(activeBtn.offsetWidth);
        this.indicatorHeight.set(activeBtn.offsetHeight);
      } else {
        this.indicatorWidth.set(0);
        this.indicatorHeight.set(0);
      }
    }, 0);
  }

  private _syncActiveTabs(): void {
    const tabs = this.tabs();
    const active = this.activeIndex();
    tabs.forEach((tab, i) => tab.isActive.set(i === active));
  }
}
