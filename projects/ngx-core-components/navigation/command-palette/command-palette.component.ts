import { Component, input, signal, computed, HostListener, output, effect, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CommandItem {
  id: string;
  label: string;
  desc?: string;
  shortcut?: string;
  icon?: string;
  category?: string;
}

@Component({
  selector: 'ngx-command-palette',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Global Overlay Backdrop -->
    @if (isOpen()) {
      <div class="ngx-palette-overlay" (click)="closePalette()">
        <div
          class="ngx-palette-modal"
          (click)="$event.stopPropagation()"
        >
          <!-- Search Header input console -->
          <div class="ngx-palette-header">
            <span class="search-icon">🔍</span>
            <input
              #searchInput
              type="text"
              class="palette-input"
              [placeholder]="placeholder()"
              [value]="filterQuery()"
              (input)="onSearchInput($event)"
            />
            <span class="esc-badge">ESC</span>
          </div>

          <!-- Command results feed -->
          <div class="ngx-palette-results">
            @if (groupedResults().length === 0) {
              <div class="empty-state">No matching commands found.</div>
            }

            @for (group of groupedResults(); track group.category) {
              <div class="category-group">
                @if (group.category) {
                  <div class="category-header">{{ group.category }}</div>
                }

                @for (cmd of group.items; track cmd.id) {
                  <div
                    class="command-row"
                    [class.active]="activeItem()?.id === cmd.id"
                    (mouseenter)="activeItem.set(cmd)"
                    (click)="executeCommand(cmd)"
                  >
                    <div class="command-start">
                      @if (cmd.icon) {
                        <span class="command-icon">{{ cmd.icon }}</span>
                      }
                      <div class="command-details">
                        <span class="command-label">{{ cmd.label }}</span>
                        @if (cmd.desc) {
                          <span class="command-desc">{{ cmd.desc }}</span>
                        }
                      </div>
                    </div>

                    @if (cmd.shortcut) {
                      <span class="command-shortcut">{{ cmd.shortcut }}</span>
                    }
                  </div>
                }
              </div>
            }
          </div>

          <!-- Console Footer help actions -->
          <div class="ngx-palette-footer">
            <div class="help-item"><span>↑↓</span> Navigate</div>
            <div class="help-item"><span>↵</span> Select</div>
            <div class="help-item"><span>Ctrl + K</span> Toggle Console</div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .ngx-palette-overlay {
      position: fixed;
      inset: 0;
      background: rgba(12, 19, 36, 0.45);
      backdrop-filter: blur(8px);
      z-index: 9999;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding-top: 15vh;
      animation: fade-in 0.18s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    /* Palette Modal container box */
    .ngx-palette-modal {
      width: 100%;
      max-width: 600px;
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      font-family: inherit;
      animation: scale-up 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes scale-up {
      from { transform: scale(0.95) translateY(-10px); }
      to { transform: scale(1) translateY(0); }
    }

    /* Search Header console input */
    .ngx-palette-header {
      display: flex;
      align-items: center;
      padding: 14px 18px;
      border-bottom: 1px solid var(--border-color, #e2e8f0);
      gap: 12px;
    }
    .search-icon {
      font-size: 16px;
      color: var(--text-secondary, #64748b);
    }
    .palette-input {
      flex: 1;
      border: none;
      background: transparent;
      outline: none;
      font-size: 14px;
      color: var(--text-primary, #0f172a);
      font-family: inherit;
    }
    .palette-input::placeholder {
      color: var(--text-secondary, #64748b);
      opacity: 0.8;
    }
    .esc-badge {
      font-size: 10px;
      font-weight: 700;
      color: var(--text-secondary, #64748b);
      background: var(--border-light, #f1f5f9);
      padding: 3px 6px;
      border-radius: 4px;
      border: 1px solid var(--border-color, #e2e8f0);
      box-shadow: var(--shadow-sm);
    }

    /* Command Results List block */
    .ngx-palette-results {
      max-height: 320px;
      overflow-y: auto;
      padding: 8px 0;
    }

    .empty-state {
      padding: 24px;
      text-align: center;
      color: var(--text-secondary, #64748b);
      font-size: 13px;
      font-style: italic;
    }

    /* Category Group titles */
    .category-group {
      display: flex;
      flex-direction: column;
    }
    .category-header {
      padding: 8px 18px;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: var(--text-secondary, #64748b);
      opacity: 0.85;
    }

    /* Single Command row items */
    .command-row {
      padding: 10px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      transition: background-color 0.12s ease;
      gap: 16px;
    }
    .command-row.active {
      background: var(--primary-glow, rgba(79, 70, 229, 0.08));
    }
    
    .command-start {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }
    .command-icon {
      font-size: 16px;
      line-height: 1;
    }
    .command-details {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .command-label {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary, #0f172a);
    }
    .command-row.active .command-label {
      color: var(--primary-color, #4f46e5);
    }
    .command-desc {
      font-size: 11px;
      color: var(--text-secondary, #64748b);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    /* Shortcut keycaps style */
    .command-shortcut {
      font-size: 10px;
      font-weight: 600;
      color: var(--text-secondary, #64748b);
      background: var(--border-light, #f1f5f9);
      border: 1px solid var(--border-color, #e2e8f0);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
    }

    /* Footer help commands guides */
    .ngx-palette-footer {
      display: flex;
      padding: 12px 18px;
      background: var(--border-light, #f1f5f9);
      border-top: 1px solid var(--border-color, #e2e8f0);
      gap: 18px;
    }
    .help-item {
      font-size: 11px;
      font-weight: 500;
      color: var(--text-secondary, #64748b);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .help-item span {
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      padding: 1px 4px;
      border-radius: 3px;
      font-weight: 700;
      font-size: 9px;
    }
  `]
})
export class CommandPaletteComponent {
  // Inputs configs
  commands = input.required<CommandItem[]>();
  placeholder = input<string>('Type a command or search...');

  // Output emissions
  commandSelected = output<CommandItem>();

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  // Open status logic
  isOpen = signal<boolean>(false);
  filterQuery = signal<string>('');

  // Currently focused item in keyboard selection
  activeItem = signal<CommandItem | null>(null);

  // Reactive effect to focus the search input field upon dialog opens
  constructor() {
    effect(() => {
      if (this.isOpen()) {
        setTimeout(() => {
          this.searchInput?.nativeElement?.focus();
        }, 50);
      }
    });
  }

  // Filter commands by search query
  filteredCommands = computed(() => {
    const query = this.filterQuery().toLowerCase().trim();
    if (!query) return this.commands();

    return this.commands().filter(c =>
      c.label.toLowerCase().includes(query) ||
      (c.desc && c.desc.toLowerCase().includes(query)) ||
      (c.category && c.category.toLowerCase().includes(query))
    );
  });

  // Group commands by category computed signals
  groupedResults = computed(() => {
    const list = this.filteredCommands();
    const groups: { category: string; items: CommandItem[] }[] = [];

    list.forEach(item => {
      const cat = item.category || 'General';
      let grp = groups.find(g => g.category === cat);
      if (!grp) {
        grp = { category: cat, items: [] };
        groups.push(grp);
      }
      grp.items.push(item);
    });

    return groups;
  });

  // Flat list of current results for keyboard navigation indices mappings
  flatResultsList = computed(() => {
    const groups = this.groupedResults();
    const flat: CommandItem[] = [];
    groups.forEach(g => flat.push(...g.items));
    return flat;
  });

  // Watch key inputs reactive alignment
  onSearchInput(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.filterQuery.set(query);
    // Reset active item to first result in filtered list
    const results = this.flatResultsList();
    this.activeItem.set(results.length > 0 ? results[0] : null);
  }

  openPalette(): void {
    this.filterQuery.set('');
    const results = this.commands();
    this.activeItem.set(results.length > 0 ? results[0] : null);
    this.isOpen.set(true);
  }

  closePalette(): void {
    this.isOpen.set(false);
  }

  toggleOpen(): void {
    if (this.isOpen()) {
      this.closePalette();
    } else {
      this.openPalette();
    }
  }

  executeCommand(cmd: CommandItem): void {
    this.commandSelected.emit(cmd);
    this.closePalette();
  }

  // Global keypress watchers
  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    // Ctrl + K or Cmd + K triggers console toggle
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.toggleOpen();
      return;
    }

    if (!this.isOpen()) return;

    const flatList = this.flatResultsList();
    if (flatList.length === 0) {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.closePalette();
      }
      return;
    }

    const currentActive = this.activeItem();
    let idx = currentActive ? flatList.findIndex(c => c.id === currentActive.id) : -1;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      idx = (idx + 1) % flatList.length;
      const nextItem = flatList[idx];
      this.activeItem.set(nextItem);
      this.scrollToActiveItem();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      idx = (idx - 1 + flatList.length) % flatList.length;
      const prevItem = flatList[idx];
      this.activeItem.set(prevItem);
      this.scrollToActiveItem();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (currentActive) {
        this.executeCommand(currentActive);
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.closePalette();
    }
  }

  private scrollToActiveItem(): void {
    setTimeout(() => {
      const activeEl = document.querySelector('.ngx-palette-modal .command-row.active');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }
    }, 0);
  }
}
