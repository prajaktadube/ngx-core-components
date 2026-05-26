import { Component, input, output } from '@angular/core';

export type ChipVariant = 'default' | 'info' | 'success' | 'warning' | 'error' | 'danger' | 'outlined';

@Component({
  selector: 'ngx-chip',
  standalone: true,
  template: `
    <span class="ngx-chip" [class]="'ngx-chip-' + variant()" [class.removable]="removable()" [class.selected]="selected()" [class.disabled]="disabled()" [class.selectable]="selectable()">
      @if (icon()) {
        <span class="chip-icon" aria-hidden="true">{{ icon() }}</span>
      }
      <span class="chip-label">@if (label()) { {{ label() }} } @else { <ng-content /> }</span>
      @if (removable() && !disabled()) {
        <button class="chip-remove" (click)="$event.stopPropagation(); removed.emit()" aria-label="Remove">✕</button>
      }
    </span>
  `,
  styles: [`
    :host { display: inline-block; }
    .ngx-chip {
      display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px;
      font-size: 12px; font-weight: 500; border-radius: 999px;
      background: var(--ngx-chip-bg, #f1f5f9); color: var(--ngx-chip-color, #475569);
      border: 1px solid var(--ngx-chip-border, #e2e8f0); font-family: inherit; transition: all 0.15s ease;
      cursor: default;
    }
    .ngx-chip.selected { background: var(--ngx-chip-selected-bg, #e0e7ff); color: var(--ngx-chip-selected-color, #4f46e5); border-color: #c7d2fe; }
    .ngx-chip.disabled { opacity: 0.5; cursor: not-allowed; }
    .ngx-chip.selectable { cursor: pointer; }
    .ngx-chip.selectable:hover:not(.disabled) { transform: translateY(-1px); box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    .ngx-chip-info { background: #e0f2fe; color: #0369a1; border-color: #bae6fd; }
    .ngx-chip-success { background: #d1fae5; color: #047857; border-color: #a7f3d0; }
    .ngx-chip-warning { background: #fef3c7; color: #b45309; border-color: #fde68a; }
    .ngx-chip-error { background: #fee2e2; color: #b91c1c; border-color: #fca5a5; }
    .ngx-chip-danger { background: #fee2e2; color: #b91c1c; border-color: #fca5a5; }
    .ngx-chip-outlined { background: transparent; color: var(--primary-color, #4f46e5); border-color: var(--primary-color, #4f46e5); }
    .chip-icon { font-size: 11px; }
    .chip-remove { background: none; border: none; cursor: pointer; font-size: 10px; line-height: 1; padding: 0 0 0 2px; color: inherit; opacity: 0.6; display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; border-radius: 50%; transition: all 0.12s; }
    .chip-remove:hover { opacity: 1; background: rgba(0,0,0,0.08); }
  `]
})
export class ChipComponent {
  variant = input<ChipVariant>('default');
  icon = input<string>('');
  selected = input(false);
  removable = input(false);
  disabled = input(false);
  removed = output<void>();
    label = input<string>('');
    selectable = input(false);
}

@Component({
  selector: 'ngx-chip-list',
  standalone: true,
  template: `
    <div class="ngx-chip-list" [class.chip-list-wrap]="wrap()">
      <ng-content />
    </div>
  `,
  styles: [`
    :host { display: block; }
    .ngx-chip-list { display: flex; gap: 6px; align-items: center; }
    .chip-list-wrap { flex-wrap: wrap; }
  `]
})
export class ChipListComponent {
  wrap = input(true);
}
