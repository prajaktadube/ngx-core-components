import { Component, input, output, signal, contentChildren, AfterContentInit } from '@angular/core';

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
  isActive = signal(false);
}

@Component({
  selector: 'ngx-tab-strip',
  standalone: true,
  imports: [],
  template: `
    <div class="ngx-tab-strip" [class]="'tabs-' + position()">
      <div class="tab-list" role="tablist">
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
          </button>
        }
      </div>
      <div class="tab-content" role="tabpanel">
        <ng-content />
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .ngx-tab-strip { display: flex; flex-direction: column; }
    .tab-list { display: flex; border-bottom: 2px solid var(--ngx-tab-border, #e9ecef); position: relative; overflow-x: auto; gap: 0; }
    .tab-btn {
      display: flex; align-items: center; gap: 6px; padding: 10px 18px;
      background: none; border: none; font-size: 13px; font-weight: 500;
      color: var(--ngx-tab-color, #6c757d); cursor: pointer; font-family: inherit;
      border-bottom: 2px solid transparent; margin-bottom: -2px;
      transition: color 0.15s; white-space: nowrap; position: relative;
    }
    .tab-btn:hover:not(:disabled):not(.active) { color: var(--ngx-tab-hover-color, #212529); }
    .tab-btn.active { color: var(--ngx-tab-active-color, #1a73e8); border-bottom-color: var(--ngx-tab-active-color, #1a73e8); font-weight: 600; }
    .tab-btn.disabled { opacity: 0.45; cursor: not-allowed; }
    .tab-icon { font-size: 15px; }
    .tab-badge { background: var(--ngx-tab-badge-bg, #e74c3c); color: #fff; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 999px; min-width: 18px; text-align: center; }
    .tab-indicator { display: none; }
    .tab-content { padding: var(--ngx-tab-content-padding, 20px 0); }
  `]
})
export class TabStripComponent implements AfterContentInit {
  position = input<'top' | 'bottom' | 'left' | 'right'>('top');
  activeIndex = signal(0);
  indicatorLeft = signal(0);
  indicatorWidth = signal(0);

  tabs = contentChildren(TabComponent);

  tabChange = output<number>();

  ngAfterContentInit() {
    this._syncActiveTabs();
  }

  selectTab(index: number) {
    this.activeIndex.set(index);
    this._syncActiveTabs();
    this.tabChange.emit(index);
  }

  private _syncActiveTabs(): void {
    const tabs = this.tabs();
    const active = this.activeIndex();
    tabs.forEach((tab, i) => tab.isActive.set(i === active));
  }
}
