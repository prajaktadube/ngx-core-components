import { Component, input, signal, contentChildren, viewChild, TemplateRef, effect, untracked } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

export interface AccordionItem {
  title: string;
  content: string;
  icon?: string;
  disabled?: boolean;
  expanded?: boolean;
}

@Component({
  selector: 'ngx-accordion-item',
  standalone: true,
  template: `
    <ng-template #contentTemplate>
      <ng-content />
    </ng-template>
  `
})
export class AccordionItemComponent {
  title = input.required<string>();
  icon = input<string>('');
  disabled = input(false);
  expanded = input(false);

  contentTemplate = viewChild<TemplateRef<any>>('contentTemplate');
}

@Component({
  selector: 'ngx-accordion',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    <div class="ngx-accordion">
      @if (accordionItems().length > 0) {
        @for (child of accordionItems(); track child.title(); let i = $index) {
          <div class="accordion-item" [class.expanded]="isExpanded(i)" [class.disabled]="child.disabled()">
            <button
              class="accordion-header"
              [attr.aria-expanded]="isExpanded(i)"
              [disabled]="child.disabled()"
              (click)="toggle(i)"
            >
              @if (child.icon()) { <span class="acc-icon" aria-hidden="true">{{ child.icon() }}</span> }
              <span class="acc-title">{{ child.title() }}</span>
              <span class="acc-chevron" [class.open]="isExpanded(i)">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="chevron-icon">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </span>
            </button>
            <div class="accordion-body-wrapper" [class.expanded]="isExpanded(i)">
              <div class="accordion-body" role="region">
                @if (child.contentTemplate()) {
                  <ng-container *ngTemplateOutlet="child.contentTemplate()!" />
                }
              </div>
            </div>
          </div>
        }
      } @else {
        @for (item of items(); track item.title; let i = $index) {
          <div class="accordion-item" [class.expanded]="isExpanded(i)" [class.disabled]="item.disabled">
            <button
              class="accordion-header"
              [attr.aria-expanded]="isExpanded(i)"
              [disabled]="item.disabled"
              (click)="toggle(i)"
            >
              @if (item.icon) { <span class="acc-icon" aria-hidden="true">{{ item.icon }}</span> }
              <span class="acc-title">{{ item.title }}</span>
              <span class="acc-chevron" [class.open]="isExpanded(i)">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="chevron-icon">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </span>
            </button>
            <div class="accordion-body-wrapper" [class.expanded]="isExpanded(i)">
              <div class="accordion-body" role="region">
                {{ item.content }}
              </div>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .ngx-accordion { 
      border: 1px solid var(--ngx-acc-border, var(--border-color, #e2e8f0)); 
      border-radius: var(--ngx-acc-radius, 12px); 
      overflow: hidden; 
      background: var(--ngx-acc-bg, var(--bg-primary, #ffffff));
      box-shadow: var(--ngx-acc-shadow, 0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01));
    }
    .accordion-item { 
      border-bottom: 1px solid var(--ngx-acc-border, var(--border-color, #e2e8f0)); 
      transition: all 0.2s ease;
    }
    .accordion-item:last-child { border-bottom: none; }
    .accordion-item.disabled { opacity: 0.5; }
    
    .accordion-header {
      display: flex; 
      align-items: center; 
      gap: 12px; 
      width: 100%; 
      padding: 16px 20px;
      background: var(--ngx-acc-header-bg, var(--bg-primary, #ffffff)); 
      border: none; 
      cursor: pointer; 
      font-family: inherit;
      font-size: 14px; 
      font-weight: 600; 
      color: var(--ngx-acc-header-color, var(--text-primary, #0f172a));
      text-align: left; 
      transition: all 0.2s ease;
      outline: none;
    }
    .accordion-header:hover:not(:disabled) { 
      background: var(--ngx-acc-header-hover-bg, var(--bg-secondary, #f8fafc)); 
      color: var(--ngx-acc-header-hover-color, var(--primary-color, #1a73e8));
    }
    .accordion-item.expanded .accordion-header { 
      background: var(--ngx-acc-expanded-bg, var(--bg-primary, #ffffff)); 
      color: var(--ngx-acc-expanded-color, var(--primary-color, #1a73e8));
    }
    
    .acc-icon { font-size: 16px; flex-shrink: 0; display: inline-flex; align-items: center; }
    .acc-title { flex: 1; }
    
    .acc-chevron { 
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--ngx-acc-chevron-color, var(--text-secondary, #94a3b8));
      transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1); 
      flex-shrink: 0; 
    }
    .acc-chevron.open { 
      transform: rotate(90deg); 
      color: var(--ngx-acc-chevron-active-color, var(--primary-color, #1a73e8));
    }

    .accordion-body-wrapper {
      max-height: 0;
      opacity: 0;
      overflow: hidden;
      transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease-out;
      box-sizing: border-box;
    }
    .accordion-body-wrapper.expanded {
      max-height: 1000px;
      opacity: 1;
    }
    
    .accordion-body { 
      padding: 16px 20px 20px 20px; 
      font-size: 14px; 
      color: var(--ngx-acc-body-color, var(--text-primary, #334155)); 
      line-height: 1.6; 
      background: var(--ngx-acc-body-bg, var(--bg-primary, #ffffff)); 
      border-top: 1px solid var(--ngx-acc-border, var(--border-color, #e2e8f0)); 
    }
  `]
})
export class AccordionComponent {
  items = input<AccordionItem[]>([]);
  multi = input(false);

  accordionItems = contentChildren(AccordionItemComponent);
  private expanded = signal<Set<number>>(new Set());

  constructor() {
    effect(() => {
      const children = this.accordionItems();
      const arrayItems = this.items();
      const current = new Set<number>();
      
      if (children.length > 0) {
        children.forEach((child, i) => {
          if (child.expanded()) {
            current.add(i);
          }
        });
      } else {
        arrayItems.forEach((item, i) => {
          if (item.expanded) {
            current.add(i);
          }
        });
      }
      
      untracked(() => {
        if (this.expanded().size === 0 && current.size > 0) {
          this.expanded.set(current);
        }
      });
    });
  }

  isExpanded(i: number): boolean {
    return this.expanded().has(i);
  }

  toggle(i: number): void {
    const s = new Set(this.expanded());
    if (s.has(i)) {
      s.delete(i);
    } else {
      if (!this.multi()) {
        s.clear();
      }
      s.add(i);
    }
    this.expanded.set(s);
  }

  expandAll(): void {
    const total = this.accordionItems().length > 0 ? this.accordionItems().length : this.items().length;
    const s = new Set<number>();
    for (let i = 0; i < total; i++) {
      s.add(i);
    }
    this.expanded.set(s);
  }

  collapseAll(): void {
    this.expanded.set(new Set());
  }

  expandItem(index: number): void {
    const s = new Set(this.expanded());
    if (!this.multi()) {
      s.clear();
    }
    s.add(index);
    this.expanded.set(s);
  }

  collapseItem(index: number): void {
    const s = new Set(this.expanded());
    s.delete(index);
    this.expanded.set(s);
  }
}
