import { Component, ChangeDetectionStrategy, input, output, signal, HostListener, viewChildren, ElementRef } from '@angular/core';

export type ExportFormat = 'json' | 'csv' | 'svg' | 'pdf';

/**
 * ChartExportMenuComponent — reusable standalone export dropdown.
 *
 * Replaces the ~40 lines of duplicated export button + dropdown HTML
 * that previously existed in every chart component.
 *
 * Usage:
 *   <ngx-chart-export-menu
 *     [formats]="['json','csv','svg','pdf']"
 *     (exportClicked)="onExport($event)"
 *   />
 */
@Component({
  selector: 'ngx-chart-export-menu',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="chart-export-menu" (keydown.arrowdown)="onArrowDown($event)" (keydown.arrowup)="onArrowUp($event)">
      <button
        class="export-trigger"
        (click)="toggle($event)"
        [attr.aria-expanded]="isOpen()"
        aria-haspopup="menu"
        aria-label="Export chart data"
        type="button"
      >
        📤 Export
      </button>

      @if (isOpen()) {
        <div class="export-dropdown" role="menu">
          @for (fmt of formats(); track fmt; let i = $index) {
            <button
              #menuBtn
              type="button"
              role="menuitem"
              (click)="select(fmt)"
            >
              {{ formatIcon(fmt) }} Export {{ fmt.toUpperCase() }}
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: relative;
    }

    .chart-export-menu {
      position: relative;
      z-index: 50;
    }

    .export-trigger {
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 600;
      color: var(--ngx-chart-axis-text, #6c757d);
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid var(--ngx-chart-grid, #ebedf0);
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.15s, color 0.15s, border-color 0.15s;
      font-family: inherit;
    }

    .export-trigger:hover,
    .export-trigger:focus-visible {
      background: #fff;
      color: var(--primary-color, #4f46e5);
      border-color: var(--primary-color, #4f46e5);
      outline: none;
    }

    .export-dropdown {
      position: absolute;
      right: 0;
      top: calc(100% + 4px);
      background: #fff;
      border: 1px solid var(--ngx-chart-grid, #ebedf0);
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.06);
      padding: 4px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 130px;
      z-index: 51;
      animation: dropdownOpen 0.12s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes dropdownOpen {
      from { opacity: 0; transform: translateY(-4px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0)    scale(1); }
    }

    .export-dropdown button {
      background: none;
      border: none;
      padding: 6px 10px;
      font-size: 11px;
      text-align: left;
      cursor: pointer;
      color: #343a40;
      border-radius: 4px;
      font-family: inherit;
      width: 100%;
      transition: background 0.1s, color 0.1s;
    }

    .export-dropdown button:hover,
    .export-dropdown button:focus-visible {
      background: rgba(79, 70, 229, 0.06);
      color: var(--primary-color, #4f46e5);
      outline: none;
    }
  `],
})
export class ChartExportMenuComponent {
  formats = input<ExportFormat[]>(['json', 'csv', 'svg', 'pdf']);
  exportClicked = output<ExportFormat>();

  isOpen = signal(false);
  focusedIndex = signal<number>(-1);
  menuBtns = viewChildren<ElementRef<HTMLButtonElement>>('menuBtn');

  toggle(event: MouseEvent): void {
    event.stopPropagation();
    const nextVal = !this.isOpen();
    this.isOpen.set(nextVal);
    this.focusedIndex.set(-1);
  }

  select(fmt: ExportFormat): void {
    this.isOpen.set(false);
    this.focusedIndex.set(-1);
    this.exportClicked.emit(fmt);
  }

  formatIcon(fmt: ExportFormat): string {
    const icons: Record<ExportFormat, string> = {
      json: '📊',
      csv: '📄',
      svg: '🖼️',
      pdf: '📕',
    };
    return icons[fmt] ?? '📁';
  }

  onArrowDown(event: Event): void {
    if (!this.isOpen()) return;
    event.preventDefault();
    this.navigate(1);
  }

  onArrowUp(event: Event): void {
    if (!this.isOpen()) return;
    event.preventDefault();
    this.navigate(-1);
  }

  private navigate(direction: number): void {
    const list = this.formats();
    if (list.length === 0) return;
    const nextIdx = (this.focusedIndex() + direction + list.length) % list.length;
    this.focusedIndex.set(nextIdx);

    const buttons = this.menuBtns();
    if (buttons && buttons[nextIdx]) {
      buttons[nextIdx].nativeElement.focus();
    }
  }

  @HostListener('document:click')
  closeOnOutsideClick(): void {
    this.isOpen.set(false);
    this.focusedIndex.set(-1);
  }

  @HostListener('document:keydown.escape')
  closeOnEscape(): void {
    this.isOpen.set(false);
    this.focusedIndex.set(-1);
  }
}
