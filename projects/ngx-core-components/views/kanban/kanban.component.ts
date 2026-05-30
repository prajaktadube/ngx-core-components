import {
  Component, ChangeDetectionStrategy, input, output, signal, computed, effect, ElementRef, ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { KanbanCard, KanbanColumn } from './models';

@Component({
  selector: 'ngx-kanban',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-kanban-board">
      @for (col of columns(); track col.id) {
        <div 
          class="kanban-column"
          [class.drag-over]="activeDragColumnId() === col.id"
          (dragover)="onDragOver($event)"
          (dragenter)="onDragEnter($event, col.id)"
          (dragleave)="onDragLeave($event, col.id)"
          (drop)="onDrop($event, col.id)"
        >
          <!-- Column Header -->
          <div class="column-header" [style.border-top-color]="col.color || 'var(--primary-color)'">
            <div class="column-title-section">
              <span class="column-indicator" [style.background-color]="col.color || 'var(--primary-color)'"></span>
              <h3 class="column-title">{{ col.title }}</h3>
              <span class="card-count-badge">{{ getCardsForColumn(col.id).length }}</span>
            </div>
            
            <button class="add-card-btn" (click)="toggleAddInput(col.id)" title="Add card">
              ➕
            </button>
          </div>

          <!-- Column Scrollable Content -->
          <div class="column-cards-list">
            
            <!-- Inline Card Creator Input -->
            @if (columnAddStates()[col.id]) {
              <div class="card-creator-box">
                <input
                  #titleInput
                  type="text"
                  class="creator-input"
                  placeholder="Enter a title for this card..."
                  [value]="newCardTitles()[col.id] || ''"
                  (input)="updateNewTitle(col.id, $any($event.target).value)"
                  (keydown.enter)="addCard(col.id)"
                  (keydown.escape)="toggleAddInput(col.id)"
                />
                <div class="creator-actions">
                  <button class="creator-btn btn-add" (click)="addCard(col.id)">Add Card</button>
                  <button class="creator-btn btn-cancel" (click)="toggleAddInput(col.id)">Cancel</button>
                </div>
              </div>
            }

            @if (getCardsForColumn(col.id).length === 0 && !columnAddStates()[col.id]) {
              <div class="column-empty-state">
                No cards here. Drag files or items here.
              </div>
            }

            <!-- Cards -->
            @for (card of getCardsForColumn(col.id); track card.id) {
              <div 
                class="kanban-card"
                draggable="true"
                [class.dragging]="activeDraggingCardId() === card.id"
                (dragstart)="onDragStart($event, card)"
                (dragend)="onDragEnd()"
                (click)="onCardClick(card)"
              >
                <!-- Card Header Tag Section -->
                @if (card.priority || (card.tags && card.tags.length > 0)) {
                  <div class="card-meta-header">
                    @if (card.priority) {
                      <span class="priority-badge" [class]="'priority-' + card.priority">
                        {{ card.priority }}
                      </span>
                    }
                    <div class="card-tag-pills">
                      @for (tag of card.tags; track tag) {
                        <span class="card-tag">{{ tag }}</span>
                      }
                    </div>
                  </div>
                }

                <!-- Card Body -->
                <div class="card-content">
                  <h4 class="card-title">{{ card.title }}</h4>
                  @if (card.description) {
                    <p class="card-desc">{{ card.description }}</p>
                  }
                </div>

                <!-- Card Footer Section -->
                <div class="card-footer">
                  @if (card.dueDate) {
                    <div class="card-due-date" [class.overdue]="isOverdue(card.dueDate)">
                      📅 {{ formatDueDate(card.dueDate) }}
                    </div>
                  } @else {
                    <div class="spacer"></div>
                  }

                  <div class="card-actions">
                    <button class="card-delete-action" (click)="deleteCard($event, card.id)" title="Delete Card">
                      🗑️
                    </button>
                    @if (card.assignee) {
                      <div class="assignee-avatar" [title]="card.assignee.name">
                        @if (card.assignee.avatarUrl) {
                          <img [src]="card.assignee.avatarUrl" [alt]="card.assignee.name" />
                        } @else {
                          <span>{{ card.assignee.initials }}</span>
                        }
                      </div>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .ngx-kanban-board {
      display: flex;
      gap: 20px;
      overflow-x: auto;
      height: 100%;
      padding: 4px;
      align-items: flex-start;
      
      &::-webkit-scrollbar {
        height: 8px;
      }
      &::-webkit-scrollbar-track {
        background: transparent;
      }
      &::-webkit-scrollbar-thumb {
        background: var(--ngx-gantt-border, rgba(0, 0, 0, 0.12));
        border-radius: 4px;
      }
    }

    .kanban-column {
      flex: 0 0 290px;
      width: 290px;
      max-height: 100%;
      display: flex;
      flex-direction: column;
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #dee2e6);
      border-radius: 12px;
      box-shadow: var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05));
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;

      &.drag-over {
        border-color: var(--primary-color, #6366f1);
        box-shadow: 0 0 0 3px var(--primary-glow, rgba(99, 102, 241, 0.15));
        background: var(--border-light, #fafafa);
      }
    }

    .column-header {
      padding: 14px 16px 10px;
      border-top: 3px solid var(--primary-color, #6366f1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--border-light, #fafafa);
      border-bottom: 1px solid var(--border-color, #dee2e6);
    }

    .column-title-section {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }

    .column-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .column-title {
      margin: 0;
      font-size: 14px;
      font-weight: 700;
      color: var(--text-primary, #212529);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .card-count-badge {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-secondary, #6c757d);
      background: var(--border-color, #e9ecef);
      padding: 2px 7px;
      border-radius: 99px;
    }

    .add-card-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-secondary, #6c757d);
      font-size: 12px;
      padding: 4px;
      border-radius: 4px;
      transition: all 0.15s;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background: var(--border-color, #e9ecef);
        color: var(--text-primary, #212529);
      }
    }

    .column-cards-list {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-height: 100px;
      
      &::-webkit-scrollbar {
        width: 6px;
      }
      &::-webkit-scrollbar-track {
        background: transparent;
      }
      &::-webkit-scrollbar-thumb {
        background: var(--border-color, rgba(0,0,0,0.08));
        border-radius: 3px;
      }
    }

    .column-empty-state {
      padding: 24px 16px;
      text-align: center;
      font-size: 12px;
      color: var(--text-secondary, #888);
      font-style: italic;
      border: 1px dashed var(--border-color, #e2e8f0);
      border-radius: 8px;
    }

    /* Kanban Card Styling */
    .kanban-card {
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #dee2e6);
      border-radius: 10px;
      padding: 14px;
      cursor: grab;
      box-shadow: 0 1px 2px rgba(0,0,0,0.04);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      gap: 10px;
      user-select: none;

      &:hover {
        border-color: var(--primary-color, #6366f1);
        box-shadow: var(--shadow-md, 0 4px 6px rgba(0,0,0,0.08));
        transform: translateY(-1px);
        
        .card-delete-action {
          opacity: 1;
        }
      }

      &:active {
        cursor: grabbing;
      }

      &.dragging {
        opacity: 0.3;
        border-style: dashed;
        border-color: var(--primary-color, #6366f1);
        background: var(--border-light, #f8f9fa);
      }
    }

    .card-meta-header {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

    .priority-badge {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 2px 6px;
      border-radius: 4px;
      letter-spacing: 0.5px;
      
      &.priority-low { background: #e6f4e9; color: #1e7e34; }
      &.priority-medium { background: #fff3cd; color: #856404; }
      &.priority-high { background: #fce8e6; color: #c53929; }
    }

    .card-tag-pills {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }

    .card-tag {
      font-size: 9px;
      font-weight: 600;
      color: var(--text-secondary, #6c757d);
      background: var(--border-light, #f1f3f5);
      border: 1px solid var(--border-color, #e9ecef);
      padding: 1px 6px;
      border-radius: 4px;
    }

    .card-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .card-title {
      margin: 0;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary, #212529);
      line-height: 1.4;
    }

    .card-desc {
      margin: 0;
      font-size: 12px;
      color: var(--text-secondary, #6c757d);
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--border-light, #f1f3f5);
      padding-top: 8px;
      font-size: 11px;
    }

    .spacer {
      flex: 1;
    }

    .card-due-date {
      color: var(--text-secondary, #6c757d);
      font-weight: 500;
      
      &.overdue {
        color: #dc3545;
        font-weight: 600;
      }
    }

    .card-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .card-delete-action {
      background: none;
      border: none;
      cursor: pointer;
      color: #adb5bd;
      padding: 2px;
      border-radius: 4px;
      opacity: 0;
      transition: all 0.15s;
      font-size: 11px;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        color: #dc3545;
        background: #fce8e6;
      }
    }

    .assignee-avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--primary-color, #6366f1);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 700;
      overflow: hidden;
      border: 1px solid var(--bg-secondary, #fff);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    /* Card Creator Input Box */
    .card-creator-box {
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--primary-color, #6366f1);
      border-radius: 8px;
      padding: 10px;
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.15);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .creator-input {
      width: 100%;
      border: 1px solid var(--border-color, #dee2e6);
      border-radius: 6px;
      padding: 6px 10px;
      font-size: 12px;
      background: var(--bg-secondary, #fff);
      color: var(--text-primary, #212529);
      outline: none;
      
      &:focus {
        border-color: var(--primary-color, #6366f1);
      }
    }

    .creator-actions {
      display: flex;
      justify-content: flex-end;
      gap: 6px;
    }

    .creator-btn {
      border: none;
      border-radius: 4px;
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      
      &.btn-add {
        background: var(--primary-color, #6366f1);
        color: #fff;
        
        &:hover {
          background: var(--primary-hover, #4f46e5);
        }
      }

      &.btn-cancel {
        background: var(--border-light, #f8f9fa);
        color: var(--text-secondary, #495057);
        border: 1px solid var(--border-color, #dee2e6);

        &:hover {
          background: var(--border-color, #e9ecef);
        }
      }
    }
  `]
})
export class KanbanComponent {
  columns = input<KanbanColumn[]>([]);
  cards = input<KanbanCard[]>([]);

  // Outputs
  cardMoved = output<{ cardId: string, fromColumnId: string, toColumnId: string }>();
  cardClicked = output<KanbanCard>();
  cardAdded = output<{ columnId: string, title: string }>();
  cardDeleted = output<string>();

  // Local Writable Signals
  cardsState = signal<KanbanCard[]>([]);
  columnAddStates = signal<Record<string, boolean>>({});
  newCardTitles = signal<Record<string, string>>({});

  activeDraggingCardId = signal<string | null>(null);
  activeDragColumnId = signal<string | null>(null);

  @ViewChild('titleInput') titleInput?: ElementRef<HTMLInputElement>;

  constructor() {
    // Sync initial inputs to local writable signal
    effect(() => {
      this.cardsState.set(this.cards());
    });
  }

  getCardsForColumn(columnId: string): KanbanCard[] {
    return this.cardsState().filter(c => c.columnId === columnId);
  }

  // Native HTML5 Drag and Drop events
  onDragStart(event: DragEvent, card: KanbanCard): void {
    this.activeDraggingCardId.set(card.id);
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', card.id);
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragEnd(): void {
    this.activeDraggingCardId.set(null);
    this.activeDragColumnId.set(null);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDragEnter(event: DragEvent, columnId: string): void {
    event.preventDefault();
    this.activeDragColumnId.set(columnId);
  }

  onDragLeave(event: DragEvent, columnId: string): void {
    if (this.activeDragColumnId() === columnId) {
      this.activeDragColumnId.set(null);
    }
  }

  onDrop(event: DragEvent, targetColumnId: string): void {
    event.preventDefault();
    this.activeDragColumnId.set(null);
    
    const cardId = event.dataTransfer?.getData('text/plain') || this.activeDraggingCardId();
    if (!cardId) return;

    const cards = this.cardsState();
    const cardIndex = cards.findIndex(c => c.id === cardId);
    
    if (cardIndex !== -1 && cards[cardIndex].columnId !== targetColumnId) {
      const fromColumnId = cards[cardIndex].columnId;
      
      // Update local state reactively
      const updatedCards = [...cards];
      updatedCards[cardIndex] = { ...updatedCards[cardIndex], columnId: targetColumnId };
      this.cardsState.set(updatedCards);
      
      // Emit output event
      this.cardMoved.emit({
        cardId,
        fromColumnId,
        toColumnId: targetColumnId
      });
    }
  }

  // Card interaction
  onCardClick(card: KanbanCard): void {
    this.cardClicked.emit(card);
  }

  // Card creator
  toggleAddInput(columnId: string): void {
    const active = this.columnAddStates()[columnId];
    this.columnAddStates.update(s => ({ ...s, [columnId]: !active }));
    if (!active) {
      this.newCardTitles.update(s => ({ ...s, [columnId]: '' }));
      setTimeout(() => {
        if (this.titleInput) {
          this.titleInput.nativeElement.focus();
        }
      }, 50);
    }
  }

  updateNewTitle(columnId: string, value: string): void {
    this.newCardTitles.update(s => ({ ...s, [columnId]: value }));
  }

  addCard(columnId: string): void {
    const title = (this.newCardTitles()[columnId] || '').trim();
    if (!title) return;

    // Create unique ID
    const newId = 'card-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const newCard: KanbanCard = {
      id: newId,
      title,
      columnId,
      priority: 'low'
    };

    // Update local state
    this.cardsState.update(cards => [...cards, newCard]);

    // Emit event
    this.cardAdded.emit({ columnId, title });

    // Reset inputs
    this.newCardTitles.update(s => ({ ...s, [columnId]: '' }));
    this.columnAddStates.update(s => ({ ...s, [columnId]: false }));
  }

  deleteCard(event: MouseEvent, cardId: string): void {
    event.stopPropagation();
    
    // Update local state
    this.cardsState.update(cards => cards.filter(c => c.id !== cardId));

    // Emit event
    this.cardDeleted.emit(cardId);
  }

  // Date helpers
  isOverdue(dueDate: Date): boolean {
    const today = new Date();
    today.setHours(0,0,0,0);
    return new Date(dueDate).getTime() < today.getTime();
  }

  formatDueDate(date: Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
