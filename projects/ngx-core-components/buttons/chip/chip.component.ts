import { Component, input, output } from '@angular/core';

export type ChipVariant = 'default' | 'info' | 'success' | 'warning' | 'error' | 'danger' | 'outlined';

@Component({
  selector: 'ngx-chip',
  standalone: true,
  template: `
    <span
      class="ngx-chip"
      [class]="'ngx-chip-' + variant()"
      [class.removable]="removable()"
      [class.selected]="selected()"
      [class.disabled]="disabled()"
      [class.selectable]="selectable()"
      [attr.role]="selectable() ? 'checkbox' : null"
      [attr.aria-checked]="selectable() ? selected() : null"
      [attr.tabindex]="selectable() && !disabled() ? 0 : null"
      (click)="onChipClick()"
      (keydown.enter)="onChipClick()"
      (keydown.space)="onChipClick()"
    >
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
      background: var(--ngx-chip-bg, #e9ecef); color: var(--ngx-chip-color, #495057);
      border: 1px solid var(--ngx-chip-border, #dee2e6); font-family: inherit; transition: all 0.12s;
    }
    .ngx-chip.selected { background: var(--ngx-chip-selected-bg, #dbeafe); color: var(--ngx-chip-selected-color, #1a73e8); border-color: #93c5fd; }
    .ngx-chip.disabled { opacity: 0.5; cursor: not-allowed; }
    .ngx-chip-info { background: #dbeafe; color: #1a73e8; border-color: #93c5fd; }
    .ngx-chip-success { background: #d1fae5; color: #065f46; border-color: #6ee7b7; }
    .ngx-chip-warning { background: #fef3c7; color: #92400e; border-color: #fcd34d; }
    .ngx-chip-error { background: #fee2e2; color: #991b1b; border-color: #fca5a5; }
      .ngx-chip-danger { background: #fee2e2; color: #991b1b; border-color: #fca5a5; }
      .ngx-chip-outlined { background: transparent; color: var(--ngx-btn-primary, #0f0f23); border-color: var(--ngx-btn-primary, #0f0f23); }
    .chip-icon { font-size: 11px; }
    .chip-remove { background: none; border: none; cursor: pointer; font-size: 10px; line-height: 1; padding: 0 0 0 2px; color: inherit; opacity: 0.7; }
    .chip-remove:hover { opacity: 1; }
    .ngx-chip.selectable { cursor: pointer; }
    .ngx-chip.selectable:hover:not(.disabled) { filter: brightness(0.95); }
  `]
})
export class ChipComponent {
  variant = input<ChipVariant>('default');
  icon = input<string>('');
  selected = input(false);
  removable = input(false);
  disabled = input(false);
  selectable = input(false);
  label = input<string>('');

  removed = output<void>();
  selectedChange = output<boolean>();

  onChipClick(): void {
    if (!this.selectable() || this.disabled()) return;
    this.selectedChange.emit(!this.selected());
  }
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
