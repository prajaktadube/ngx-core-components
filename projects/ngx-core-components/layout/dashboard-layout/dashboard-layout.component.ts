import {
  Component, input, signal, output, computed, effect, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardItem, DashboardLayoutChangeEvent, DashboardPanelActionEvent } from './models';

@Component({
  selector: 'ngx-dashboard-layout',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div 
      class="ngx-dashboard-wrapper" 
      [class.dark]="theme() === 'dark'"
      [class.has-maximized]="hasMaximizedPanel()"
    >
      <div 
        class="ngx-dashboard-grid"
        [style.grid-template-columns]="'repeat(' + columns() + ', 1fr)'"
        [style.grid-auto-rows]="rowHeight()"
        (dragover)="onDragOverGrid($event)"
        (drop)="onDrop($event)"
      >
        <!-- Background grid cells for drop snapping guide -->
        @if (isDragging()) {
          <div class="grid-background-overlay">
            @for (cell of bgCells(); track cell.key) {
              <div 
                class="bg-cell-target"
                [style.grid-column-start]="cell.col + 1"
                [style.grid-row-start]="cell.row + 1"
                (dragover)="onDragOverCell($event)"
                (dragenter)="onDragEnterCell($event, cell.col, cell.row)"
              ></div>
            }
          </div>
          
          <!-- Drop Position Placeholder -->
          @if (dragPlaceholder(); as placeholder) {
            <div 
              class="drag-placeholder-indicator"
              [style.grid-column-start]="placeholder.col + 1"
              [style.grid-column-end]="placeholder.col + 1 + placeholder.colSpan"
              [style.grid-row-start]="placeholder.row + 1"
              [style.grid-row-end]="placeholder.row + 1 + placeholder.rowSpan"
            >
              <div class="placeholder-inner"></div>
            </div>
          }
        }

        <!-- Active Dashboard Cards -->
        @for (item of itemsState(); track item.id) {
          <div 
            class="dashboard-panel-card"
            [class.maximized]="item.maximized"
            [class.collapsed]="item.collapsed"
            [class.dragging-active]="activeDraggingId() === item.id"
            [style.grid-column-start]="item.maximized ? 1 : item.col + 1"
            [style.grid-column-end]="item.maximized ? columns() + 1 : item.col + 1 + item.colSpan"
            [style.grid-row-start]="item.maximized ? 1 : item.row + 1"
            [style.grid-row-end]="item.maximized ? 'span 4' : item.row + 1 + item.rowSpan"
            [attr.draggable]="(allowDragging() && item.draggable !== false && !item.maximized && !item.collapsed) ? 'true' : 'false'"
            (dragstart)="onDragStart($event, item)"
            (dragend)="onDragEnd()"
          >
            <!-- Panel Header -->
            <div 
              class="panel-header" 
              [class.draggable-handle]="allowDragging() && item.draggable !== false && !item.maximized && !item.collapsed"
            >
              <div class="panel-title-group">
                <span class="panel-icon-dot" [style.background-color]="getCategoryColor(item.category)"></span>
                <span class="panel-title" [title]="item.title">{{ item.title }}</span>
              </div>

              <div class="panel-actions" (click)="$event.stopPropagation()">
                <!-- Settings Action -->
                <button class="action-btn" (click)="emitPanelAction(item, 'settings')" title="Panel Settings">
                  ⚙️
                </button>
                
                <!-- Minimize / Expand Toggle -->
                <button class="action-btn" (click)="toggleCollapse(item)" [title]="item.collapsed ? 'Expand Content' : 'Collapse Content'">
                  {{ item.collapsed ? '▼' : '▲' }}
                </button>

                <!-- Maximize / Restore Toggle -->
                <button class="action-btn" (click)="toggleMaximize(item)" [title]="item.maximized ? 'Restore View' : 'Maximize Panel'">
                  {{ item.maximized ? '🗗' : '🗖' }}
                </button>

                <!-- Close Panel -->
                <button class="action-btn close-btn" (click)="closePanel(item)" title="Close Panel">
                  ✕
                </button>
              </div>
            </div>

            <!-- Panel Body -->
            <div class="panel-content-body">
              <ng-content [select]="'[panel-id=' + item.id + ']'"></ng-content>
              
              <!-- Fallback Content if no projection matches -->
              <div class="fallback-placeholder">
                <span class="fallback-icon">▦</span>
                <h4>{{ item.title }}</h4>
                <p>{{ item.description || 'Provide a matching projection container with attribute panel-id="' + item.id + '"' }}</p>
              </div>
            </div>

            <!-- Resize Grip Handle -->
            @if (allowResizing() && item.resizable !== false && !item.maximized && !item.collapsed) {
              <div 
                class="resize-handle"
                (mousedown)="onResizeStart($event, item)"
              >
                <svg width="10" height="10" viewBox="0 0 10 10">
                  <path d="M10,0 L0,10 M10,4 L4,10 M10,8 L8,10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.3"></path>
                </svg>
              </div>
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
      height: 100%;
    }

    .ngx-dashboard-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
      background: var(--bg-primary, #f8fafc);
      padding: 16px;
      box-sizing: border-box;
      overflow-y: auto;
      transition: background 0.3s ease;
    }

    .ngx-dashboard-wrapper.dark {
      background: #0f172a;
    }

    .ngx-dashboard-grid {
      position: relative;
      display: grid;
      gap: 16px;
      width: 100%;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Grid Background Overlay for Snapping Hints */
    .grid-background-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: grid;
      grid-template-columns: inherit;
      grid-auto-rows: inherit;
      gap: inherit;
      pointer-events: none;
      z-index: 1;
    }

    .bg-cell-target {
      border: 1px dashed var(--border-color, #cbd5e1);
      border-radius: 8px;
      background: rgba(148, 163, 184, 0.02);
      pointer-events: auto;
      box-sizing: border-box;
    }
    .ngx-dashboard-wrapper.dark .bg-cell-target {
      border-color: #334155;
      background: rgba(30, 41, 59, 0.1);
    }

    /* Drag Placeholder Box */
    .drag-placeholder-indicator {
      border-radius: 12px;
      border: 2px dashed var(--primary-color, #4f46e5);
      background: var(--primary-glow, rgba(79, 70, 229, 0.05));
      z-index: 2;
      box-sizing: border-box;
      animation: pulsePlaceholder 1.5s infinite ease-in-out;
    }

    @keyframes pulsePlaceholder {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 0.9; }
    }

    .placeholder-inner {
      width: 100%;
      height: 100%;
    }

    /* Panel Card Styling */
    .dashboard-panel-card {
      position: relative;
      display: flex;
      flex-direction: column;
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 12px;
      box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.05));
      overflow: hidden;
      z-index: 3;
      transition: box-shadow 0.25s, transform 0.25s;
      box-sizing: border-box;
    }
    .ngx-dashboard-wrapper.dark .dashboard-panel-card {
      background: #1e293b;
      border-color: #334155;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
    }

    .dashboard-panel-card:hover {
      box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0,0,0,0.08));
    }

    .dashboard-panel-card.dragging-active {
      opacity: 0.4;
      border-style: dashed;
      border-color: var(--primary-color, #4f46e5);
    }

    /* Maximized override state */
    .dashboard-panel-card.maximized {
      grid-column: 1 / -1 !important;
      grid-row: auto !important;
      min-height: 500px;
      z-index: 50;
      box-shadow: var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.15));
    }
    .ngx-dashboard-wrapper.has-maximized .dashboard-panel-card:not(.maximized) {
      display: none !important;
    }

    /* Collapsed state */
    .dashboard-panel-card.collapsed {
      grid-row-end: span 1 !important;
      height: fit-content !important;
      min-height: 0 !important;
    }
    .dashboard-panel-card.collapsed .panel-content-body {
      display: none !important;
    }
    .dashboard-panel-card.collapsed .resize-handle {
      display: none !important;
    }

    /* Header styling */
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-color, #e2e8f0);
      background: var(--border-light, #f8fafc);
      user-select: none;
      gap: 12px;
    }
    .ngx-dashboard-wrapper.dark .panel-header {
      background: #1e293b;
      border-bottom-color: #334155;
    }

    .panel-header.draggable-handle {
      cursor: grab;
    }
    .panel-header.draggable-handle:active {
      cursor: grabbing;
    }

    .panel-title-group {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }

    .panel-icon-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .panel-title {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-primary, #1e293b);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .ngx-dashboard-wrapper.dark .panel-title {
      color: #f8fafc;
    }

    .panel-actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .action-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 11px;
      padding: 4px;
      border-radius: 4px;
      color: var(--text-secondary, #64748b);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
    }
    .action-btn:hover {
      background: var(--border-color, #cbd5e1);
      color: var(--text-primary, #0f172a);
    }
    .ngx-dashboard-wrapper.dark .action-btn:hover {
      background: #334155;
      color: #ffffff;
    }

    .action-btn.close-btn:hover {
      background: #fca5a5;
      color: #991b1b;
    }

    /* Content Body styling */
    .panel-content-body {
      flex: 1;
      position: relative;
      overflow: auto;
      box-sizing: border-box;
    }

    /* Projected content wrapper fallback style */
    .fallback-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 24px;
      text-align: center;
      color: var(--text-secondary, #64748b);
      font-family: var(--ngx-font-family, sans-serif);
      box-sizing: border-box;
    }
    .ngx-dashboard-wrapper.dark .fallback-placeholder {
      color: #94a3b8;
    }

    .fallback-icon {
      font-size: 28px;
      margin-bottom: 8px;
      opacity: 0.5;
    }

    .fallback-placeholder h4 {
      margin: 0 0 4px;
      font-size: 13px;
      font-weight: 600;
    }

    .fallback-placeholder p {
      margin: 0;
      font-size: 11px;
      line-height: 1.4;
      max-width: 250px;
    }

    /* Custom layout content is projected so we hide default placeholder when projected content is active */
    .panel-content-body:has([panel-id]) .fallback-placeholder {
      display: none !important;
    }

    /* Resize Grip Handle */
    .resize-handle {
      position: absolute;
      right: 2px;
      bottom: 2px;
      width: 14px;
      height: 14px;
      cursor: nwse-resize;
      display: flex;
      align-items: flex-end;
      justify-content: flex-end;
      color: var(--text-secondary, #94a3b8);
      z-index: 5;
    }
    .resize-handle:hover {
      color: var(--primary-color, #4f46e5);
    }
  `]
})
export class DashboardLayoutComponent {
  // Inputs
  items = input<DashboardItem[]>([]);
  columns = input<number>(12);
  rowHeight = input<string>('150px');
  theme = input<'light' | 'dark'>('light');
  allowDragging = input<boolean>(true);
  allowResizing = input<boolean>(true);

  // Outputs
  layoutChange = output<DashboardLayoutChangeEvent>();
  panelAction = output<DashboardPanelActionEvent>();

  // State Signals
  itemsState = signal<DashboardItem[]>([]);
  isDragging = signal<boolean>(false);
  activeDraggingId = signal<string | null>(null);
  dragPlaceholder = signal<{ col: number; row: number; colSpan: number; rowSpan: number } | null>(null);

  constructor() {
    effect(() => {
      this.itemsState.set(this.items());
    }, { allowSignalWrites: true });
  }

  // Detect if any panel is currently maximized
  hasMaximizedPanel = computed(() => {
    return this.itemsState().some(it => it.maximized);
  });

  // Calculate dynamic rows needed in background grid
  maxRows = computed(() => {
    let max = 6;
    for (const item of this.itemsState()) {
      if (!item.maximized) {
        const bottom = item.row + item.rowSpan;
        if (bottom > max) {
          max = bottom;
        }
      }
    }
    return max + 2; // Always keep 2 empty grid rows buffer space
  });

  // Generate grid mapping cells
  bgCells = computed(() => {
    const cols = this.columns();
    const rows = this.maxRows();
    const cells: { key: string; col: number; row: number }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        cells.push({ key: `${r}-${c}`, col: c, row: r });
      }
    }
    return cells;
  });

  // Helper colors mapping
  getCategoryColor(cat?: string): string {
    if (!cat) return '#6366f1';
    switch (cat.toLowerCase()) {
      case 'chart': return '#3b82f6'; // Blue
      case 'data': return '#10b981'; // Green
      case 'feed': return '#f59e0b'; // Amber
      case 'metric': return '#ec4899'; // Pink
      case 'alert': return '#ef4444'; // Red
      default: return '#8b5cf6'; // Violet
    }
  }

  // Native HTML5 Drag events
  onDragStart(event: DragEvent, item: DashboardItem): void {
    if (!this.allowDragging() || item.draggable === false || item.maximized || item.collapsed) return;
    
    this.activeDraggingId.set(item.id);
    this.isDragging.set(true);

    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', item.id);
      event.dataTransfer.effectAllowed = 'move';
    }

    // Set initial placeholder
    this.dragPlaceholder.set({
      col: item.col,
      row: item.row,
      colSpan: item.colSpan,
      rowSpan: item.rowSpan
    });
  }

  onDragEnd(): void {
    this.isDragging.set(false);
    this.activeDraggingId.set(null);
    this.dragPlaceholder.set(null);
  }

  onDragOverGrid(event: DragEvent): void {
    event.preventDefault();
  }

  onDragOverCell(event: DragEvent): void {
    event.preventDefault();
  }

  onDragEnterCell(event: DragEvent, col: number, row: number): void {
    event.preventDefault();
    const draggedId = this.activeDraggingId();
    if (!draggedId) return;

    const items = this.itemsState();
    const item = items.find(it => it.id === draggedId);
    if (!item) return;

    // Calculate snapped coordinates based on boundaries
    let targetCol = Math.max(0, Math.min(this.columns() - item.colSpan, col));
    let targetRow = Math.max(0, row);

    // Update placeholder
    this.dragPlaceholder.set({
      col: targetCol,
      row: targetRow,
      colSpan: item.colSpan,
      rowSpan: item.rowSpan
    });
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const placeholder = this.dragPlaceholder();
    const draggedId = this.activeDraggingId();

    if (placeholder && draggedId) {
      this.itemsState.update(items => {
        return items.map(it => {
          if (it.id === draggedId) {
            return {
              ...it,
              col: placeholder.col,
              row: placeholder.row
            };
          }
          return it;
        });
      });
      this.layoutChange.emit({ items: this.itemsState() });
    }

    this.onDragEnd();
  }

  // Panel resizing handler
  onResizeStart(event: MouseEvent, item: DashboardItem): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.allowResizing() || item.resizable === false || item.maximized || item.collapsed) return;

    const startX = event.pageX;
    const startY = event.pageY;
    const startColSpan = item.colSpan;
    const startRowSpan = item.rowSpan;

    // Find the enclosing element bounding boxes
    const panelEl = (event.target as HTMLElement).closest('.dashboard-panel-card');
    if (!panelEl) return;

    const startWidth = panelEl.clientWidth;
    const startHeight = panelEl.clientHeight;

    // Calculate approximate cell bounds
    const colWidth = startWidth / startColSpan;
    const rowHeight = startHeight / startRowSpan;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.pageX - startX;
      const deltaY = moveEvent.pageY - startY;

      let newColSpan = Math.round((startWidth + deltaX) / colWidth);
      newColSpan = Math.max(item.minColSpan || 1, Math.min(this.columns() - item.col, newColSpan));
      if (item.maxColSpan) {
        newColSpan = Math.min(item.maxColSpan, newColSpan);
      }

      let newRowSpan = Math.round((startHeight + deltaY) / rowHeight);
      newRowSpan = Math.max(item.minRowSpan || 1, newRowSpan);
      if (item.maxRowSpan) {
        newRowSpan = Math.min(item.maxRowSpan, newRowSpan);
      }

      if (newColSpan !== item.colSpan || newRowSpan !== item.rowSpan) {
        this.itemsState.update(items => {
          return items.map(it => {
            if (it.id === item.id) {
              return { ...it, colSpan: newColSpan, rowSpan: newRowSpan };
            }
            return it;
          });
        });
      }
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      this.layoutChange.emit({ items: this.itemsState() });
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  // Panel Control Actions
  toggleCollapse(item: DashboardItem): void {
    const collapsed = !item.collapsed;
    this.itemsState.update(items => {
      return items.map(it => {
        if (it.id === item.id) {
          return { ...it, collapsed };
        }
        return it;
      });
    });
    this.panelAction.emit({
      panelId: item.id,
      action: collapsed ? 'minimize' : 'restore',
      item: { ...item, collapsed }
    });
    this.layoutChange.emit({ items: this.itemsState() });
  }

  toggleMaximize(item: DashboardItem): void {
    const maximized = !item.maximized;
    this.itemsState.update(items => {
      return items.map(it => {
        if (it.id === item.id) {
          return { ...it, maximized };
        }
        return it;
      });
    });
    this.panelAction.emit({
      panelId: item.id,
      action: maximized ? 'maximize' : 'restore',
      item: { ...item, maximized }
    });
  }

  closePanel(item: DashboardItem): void {
    this.itemsState.update(items => items.filter(it => it.id !== item.id));
    this.panelAction.emit({
      panelId: item.id,
      action: 'close',
      item
    });
    this.layoutChange.emit({ items: this.itemsState() });
  }

  emitPanelAction(item: DashboardItem, action: 'settings'): void {
    this.panelAction.emit({
      panelId: item.id,
      action,
      item
    });
  }
}
