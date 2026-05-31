import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  QueryList,
  ViewChildren,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  KanbanCard,
  KanbanCardMoveEvent,
  KanbanColumn,
  KanbanMoveRejectedEvent,
  KanbanSwimlane,
} from './models';

const DEFAULT_LANE_ID = '__default__';

interface SwimlaneSection {
  id: string;
  title: string;
  description?: string;
  isDefault: boolean;
}

@Component({
  selector: 'ngx-kanban',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-kanban-board" [class.has-swimlanes]="swimlaneSections().length > 1">
      @for (lane of swimlaneSections(); track lane.id) {
        <section class="kanban-swimlane">
          @if (!lane.isDefault) {
            <header class="swimlane-header">
              <div>
                <h3>{{ lane.title }}</h3>
                @if (lane.description) { <p>{{ lane.description }}</p> }
              </div>
            </header>
          }

          <div class="kanban-columns">
            @for (col of columns(); track col.id) {
              <div
                class="kanban-column"
                [class.drag-over]="activeDropTarget() === dropKey(col.id, lane.id)"
                [class.wip-reached]="isWipReached(col.id, lane.id)"
                (dragover)="onColumnDragOver($event, col.id, lane.id)"
                (dragenter)="activeDropTarget.set(dropKey(col.id, lane.id))"
                (dragleave)="onDragLeave(col.id, lane.id)"
                (drop)="onColumnDrop($event, col.id, lane.id)"
              >
                <div class="column-header" [style.border-top-color]="col.color || 'var(--primary-color)'">
                  <div class="column-title-section">
                    <span class="column-indicator" [style.background-color]="col.color || 'var(--primary-color)'"></span>
                    <h4 class="column-title">{{ col.title }}</h4>
                    <span class="card-count-badge" [class.limit-reached]="isWipReached(col.id, lane.id)">
                      {{ getCardsForColumn(col.id, lane.id).length }}@if (col.wipLimit) { /{{ col.wipLimit }} }
                    </span>
                  </div>

                  <button class="add-card-btn" type="button" (click)="toggleAddInput(col.id, lane.id)" title="Add card">
                    +
                  </button>
                </div>

                <div class="column-cards-list">
                  @if (columnAddStates()[dropKey(col.id, lane.id)]) {
                    <div class="card-creator-box">
                      <input
                        #titleInput
                        type="text"
                        class="creator-input"
                        placeholder="Enter a title for this card..."
                        [attr.data-add-key]="dropKey(col.id, lane.id)"
                        [value]="newCardTitles()[dropKey(col.id, lane.id)] || ''"
                        (input)="updateNewTitle(col.id, lane.id, $any($event.target).value)"
                        (keydown.enter)="addCard(col.id, lane.id)"
                        (keydown.escape)="toggleAddInput(col.id, lane.id)"
                      />
                      <div class="creator-actions">
                        <button class="creator-btn btn-add" type="button" (click)="addCard(col.id, lane.id)">Add Card</button>
                        <button class="creator-btn btn-cancel" type="button" (click)="toggleAddInput(col.id, lane.id)">Cancel</button>
                      </div>
                    </div>
                  }

                  @if (getCardsForColumn(col.id, lane.id).length === 0 && !columnAddStates()[dropKey(col.id, lane.id)]) {
                    <div class="column-empty-state">No cards here.</div>
                  }

                  @for (card of getCardsForColumn(col.id, lane.id); track card.id; let cardIndex = $index) {
                    <article
                      class="kanban-card"
                      [draggable]="!dragHandleOnly()"
                      [class.dragging]="activeDraggingCardId() === card.id"
                      (dragstart)="onDragStart($event, card)"
                      (dragover)="onCardDragOver($event)"
                      (drop)="onCardDrop($event, col.id, lane.id, cardIndex)"
                      (dragend)="onDragEnd()"
                      (click)="onCardClick(card)"
                    >
                      <div class="card-topline">
                        <button
                          class="drag-handle"
                          type="button"
                          draggable="true"
                          title="Drag card"
                          (click)="$event.stopPropagation()"
                          (dragstart)="onDragStart($event, card)"
                          (dragend)="onDragEnd()"
                        >::</button>

                        @if (card.priority || (card.tags && card.tags.length > 0)) {
                          <div class="card-meta-header">
                            @if (card.priority) {
                              <span
                                class="priority-badge"
                                [class.priority-low]="card.priority === 'low'"
                                [class.priority-medium]="card.priority === 'medium'"
                                [class.priority-high]="card.priority === 'high'"
                              >
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
                      </div>

                      <div class="card-content">
                        <h5 class="card-title">{{ card.title }}</h5>
                        @if (card.description) {
                          <p class="card-desc">{{ card.description }}</p>
                        }
                      </div>

                      <div class="card-footer">
                        @if (card.dueDate) {
                          <div class="card-due-date" [class.overdue]="isOverdue(card.dueDate)">
                            Due {{ formatDueDate(card.dueDate) }}
                          </div>
                        } @else {
                          <div class="spacer"></div>
                        }

                        <div class="card-actions">
                          <button class="card-delete-action" type="button" (click)="deleteCard($event, card.id)" title="Delete card">
                            x
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
                    </article>
                  }
                </div>
              </div>
            }
          </div>
        </section>
      }
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; height: 100%; }
    .ngx-kanban-board { display: flex; flex-direction: column; gap: 16px; overflow: auto; height: 100%; padding: 4px; }
    .kanban-swimlane { display: flex; flex-direction: column; gap: 10px; min-width: min-content; }
    .swimlane-header { position: sticky; left: 0; z-index: 2; display: flex; justify-content: space-between; align-items: center; padding: 4px 2px; color: var(--text-primary, #212529); }
    .swimlane-header h3 { margin: 0; font-size: 13px; font-weight: 800; }
    .swimlane-header p { margin: 3px 0 0; font-size: 11px; color: var(--text-secondary, #6c757d); }
    .kanban-columns { display: flex; align-items: flex-start; gap: 20px; min-width: min-content; }
    .kanban-column { flex: 0 0 290px; width: 290px; max-height: 100%; display: flex; flex-direction: column; background: var(--bg-secondary, #ffffff); border: 1px solid var(--border-color, #dee2e6); border-radius: 12px; box-shadow: var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05)); transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); overflow: hidden; }
    .kanban-column.drag-over { border-color: var(--primary-color, #6366f1); box-shadow: 0 0 0 3px var(--primary-glow, rgba(99, 102, 241, 0.15)); background: var(--border-light, #fafafa); }
    .kanban-column.wip-reached:not(.drag-over) { border-color: var(--ngx-kanban-limit, #f59e0b); }
    .column-header { padding: 14px 16px 10px; border-top: 3px solid var(--primary-color, #6366f1); display: flex; justify-content: space-between; align-items: center; background: var(--border-light, #fafafa); border-bottom: 1px solid var(--border-color, #dee2e6); }
    .column-title-section { display: flex; align-items: center; gap: 8px; min-width: 0; }
    .column-indicator { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .column-title { margin: 0; font-size: 14px; font-weight: 700; color: var(--text-primary, #212529); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .card-count-badge { font-size: 11px; font-weight: 700; color: var(--text-secondary, #6c757d); background: var(--border-color, #e9ecef); padding: 2px 7px; border-radius: 99px; }
    .card-count-badge.limit-reached { color: #92400e; background: #fef3c7; }
    .add-card-btn { background: none; border: none; cursor: pointer; color: var(--text-secondary, #6c757d); font-size: 16px; width: 24px; height: 24px; border-radius: 4px; transition: all 0.15s; display: flex; align-items: center; justify-content: center; }
    .add-card-btn:hover, .add-card-btn:focus-visible { background: var(--border-color, #e9ecef); color: var(--text-primary, #212529); outline: none; }
    .column-cards-list { flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 12px; min-height: 100px; }
    .column-empty-state { padding: 24px 16px; text-align: center; font-size: 12px; color: var(--text-secondary, #888); font-style: italic; border: 1px dashed var(--border-color, #e2e8f0); border-radius: 8px; }
    .kanban-card { background: var(--bg-secondary, #ffffff); border: 1px solid var(--border-color, #dee2e6); border-radius: 10px; padding: 12px; cursor: grab; box-shadow: 0 1px 2px rgba(0,0,0,0.04); transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; gap: 10px; user-select: none; }
    .kanban-card:hover { border-color: var(--primary-color, #6366f1); box-shadow: var(--shadow-md, 0 4px 6px rgba(0,0,0,0.08)); transform: translateY(-1px); }
    .kanban-card:hover .card-delete-action { opacity: 1; }
    .kanban-card.dragging { opacity: 0.35; border-style: dashed; border-color: var(--primary-color, #6366f1); background: var(--border-light, #f8f9fa); }
    .card-topline { display: flex; align-items: flex-start; gap: 8px; }
    .drag-handle { flex: 0 0 auto; width: 22px; height: 22px; border: 1px solid var(--border-color, #dee2e6); border-radius: 5px; background: var(--border-light, #f8f9fa); color: var(--text-secondary, #6c757d); cursor: grab; font-size: 10px; line-height: 1; }
    .card-meta-header { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; min-width: 0; }
    .priority-badge { font-size: 9px; font-weight: 700; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; letter-spacing: 0.5px; }
    .priority-badge.priority-low { background: #e6f4e9; color: #1e7e34; }
    .priority-badge.priority-medium { background: #fff3cd; color: #856404; }
    .priority-badge.priority-high { background: #fce8e6; color: #c53929; }
    .card-tag-pills { display: flex; gap: 4px; flex-wrap: wrap; }
    .card-tag { font-size: 9px; font-weight: 600; color: var(--text-secondary, #6c757d); background: var(--border-light, #f1f3f5); border: 1px solid var(--border-color, #e9ecef); padding: 1px 6px; border-radius: 4px; }
    .card-content { display: flex; flex-direction: column; gap: 4px; }
    .card-title { margin: 0; font-size: 13px; font-weight: 650; color: var(--text-primary, #212529); line-height: 1.4; }
    .card-desc { margin: 0; font-size: 12px; color: var(--text-secondary, #6c757d); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .card-footer { display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-light, #f1f3f5); padding-top: 8px; font-size: 11px; }
    .spacer { flex: 1; }
    .card-due-date { color: var(--text-secondary, #6c757d); font-weight: 500; }
    .card-due-date.overdue { color: #dc3545; font-weight: 650; }
    .card-actions { display: flex; align-items: center; gap: 8px; }
    .card-delete-action { background: none; border: none; cursor: pointer; color: #adb5bd; width: 22px; height: 22px; border-radius: 4px; opacity: 0; transition: all 0.15s; font-size: 13px; display: flex; align-items: center; justify-content: center; }
    .card-delete-action:hover, .card-delete-action:focus-visible { opacity: 1; color: #dc3545; background: #fce8e6; outline: none; }
    .assignee-avatar { width: 24px; height: 24px; border-radius: 50%; background: var(--primary-color, #6366f1); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; overflow: hidden; border: 1px solid var(--bg-secondary, #fff); }
    .assignee-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .card-creator-box { background: var(--bg-secondary, #ffffff); border: 1px solid var(--primary-color, #6366f1); border-radius: 8px; padding: 10px; box-shadow: 0 2px 8px rgba(99, 102, 241, 0.15); display: flex; flex-direction: column; gap: 8px; }
    .creator-input { width: 100%; border: 1px solid var(--border-color, #dee2e6); border-radius: 6px; padding: 6px 10px; font-size: 12px; background: var(--bg-secondary, #fff); color: var(--text-primary, #212529); outline: none; }
    .creator-input:focus { border-color: var(--primary-color, #6366f1); }
    .creator-actions { display: flex; justify-content: flex-end; gap: 6px; }
    .creator-btn { border: none; border-radius: 4px; padding: 4px 10px; font-size: 11px; font-weight: 650; cursor: pointer; font-family: inherit; }
    .creator-btn.btn-add { background: var(--primary-color, #6366f1); color: #fff; }
    .creator-btn.btn-add:hover { background: var(--primary-hover, #4f46e5); }
    .creator-btn.btn-cancel { background: var(--border-light, #f8f9fa); color: var(--text-secondary, #495057); border: 1px solid var(--border-color, #dee2e6); }
    .creator-btn.btn-cancel:hover { background: var(--border-color, #e9ecef); }
  `]
})
export class KanbanComponent {
  columns = input<KanbanColumn[]>([]);
  cards = input<KanbanCard[]>([]);
  swimlanes = input<KanbanSwimlane[]>([]);
  optimisticUpdates = input(true);
  dragHandleOnly = input(false);
  allowSameColumnReorder = input(true);

  cardMoved = output<KanbanCardMoveEvent>();
  cardMoveRejected = output<KanbanMoveRejectedEvent>();
  cardClicked = output<KanbanCard>();
  cardAdded = output<{ columnId: string; title: string; swimlaneId?: string; card: KanbanCard }>();
  cardDeleted = output<string>();

  cardsState = signal<KanbanCard[]>([]);
  columnAddStates = signal<Record<string, boolean>>({});
  newCardTitles = signal<Record<string, string>>({});
  activeDraggingCardId = signal<string | null>(null);
  activeDropTarget = signal<string | null>(null);

  @ViewChildren('titleInput') titleInputs?: QueryList<ElementRef<HTMLInputElement>>;

  swimlaneSections = computed<SwimlaneSection[]>(() => {
    const lanes = this.swimlanes();
    if (!lanes.length) {
      return [{ id: DEFAULT_LANE_ID, title: '', isDefault: true }];
    }
    return lanes.map(lane => ({ ...lane, isDefault: false }));
  });

  constructor() {
    effect(() => {
      this.cardsState.set(this.cards());
    });
  }

  dropKey(columnId: string, laneId: string): string {
    return `${laneId}::${columnId}`;
  }

  getCardsForColumn(columnId: string, laneId = DEFAULT_LANE_ID): KanbanCard[] {
    return this.cardsState().filter(card => card.columnId === columnId && this.cardLaneId(card) === laneId);
  }

  isWipReached(columnId: string, laneId = DEFAULT_LANE_ID): boolean {
    const limit = this.columns().find(col => col.id === columnId)?.wipLimit;
    return !!limit && this.getCardsForColumn(columnId, laneId).length >= limit;
  }

  onDragStart(event: DragEvent, card: KanbanCard): void {
    event.stopPropagation();
    this.activeDraggingCardId.set(card.id);
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', card.id);
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragEnd(): void {
    this.activeDraggingCardId.set(null);
    this.activeDropTarget.set(null);
  }

  onColumnDragOver(event: DragEvent, columnId: string, laneId: string): void {
    event.preventDefault();
    event.dataTransfer?.setData('text/target-column', columnId);
    this.activeDropTarget.set(this.dropKey(columnId, laneId));
  }

  onCardDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(columnId: string, laneId: string): void {
    if (this.activeDropTarget() === this.dropKey(columnId, laneId)) {
      this.activeDropTarget.set(null);
    }
  }

  onColumnDrop(event: DragEvent, targetColumnId: string, targetLaneId: string): void {
    event.preventDefault();
    this.activeDropTarget.set(null);
    const cardId = this.draggedCardId(event);
    if (!cardId) return;
    this.moveCard(cardId, targetColumnId, targetLaneId, this.getCardsForColumn(targetColumnId, targetLaneId).length);
  }

  onCardDrop(event: DragEvent, targetColumnId: string, targetLaneId: string, targetIndex: number): void {
    event.preventDefault();
    event.stopPropagation();
    this.activeDropTarget.set(null);

    const cardId = this.draggedCardId(event);
    if (!cardId) return;

    const target = event.currentTarget as HTMLElement;
    const insertAfter = event.offsetY > target.clientHeight / 2;
    this.moveCard(cardId, targetColumnId, targetLaneId, targetIndex + (insertAfter ? 1 : 0));
  }

  onCardClick(card: KanbanCard): void {
    this.cardClicked.emit(card);
  }

  toggleAddInput(columnId: string, laneId = DEFAULT_LANE_ID): void {
    const key = this.dropKey(columnId, laneId);
    const active = this.columnAddStates()[key];
    this.columnAddStates.update(state => ({ ...state, [key]: !active }));
    if (!active) {
      this.newCardTitles.update(state => ({ ...state, [key]: '' }));
      setTimeout(() => this.focusAddInput(key), 0);
    }
  }

  updateNewTitle(columnId: string, laneId: string, value: string): void {
    const key = this.dropKey(columnId, laneId);
    this.newCardTitles.update(state => ({ ...state, [key]: value }));
  }

  addCard(columnId: string, laneId = DEFAULT_LANE_ID): void {
    const key = this.dropKey(columnId, laneId);
    const title = (this.newCardTitles()[key] || '').trim();
    if (!title) return;

    if (this.isWipReached(columnId, laneId)) {
      this.cardMoveRejected.emit({ cardId: '', toColumnId: columnId, reason: 'wip-limit' });
      return;
    }

    const newCard: KanbanCard = {
      id: 'card-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      title,
      columnId,
      swimlaneId: laneId === DEFAULT_LANE_ID ? undefined : laneId,
      priority: 'low',
    };

    if (this.optimisticUpdates()) {
      this.cardsState.update(cards => [...cards, newCard]);
    }

    this.cardAdded.emit({ columnId, title, swimlaneId: newCard.swimlaneId, card: newCard });
    this.newCardTitles.update(state => ({ ...state, [key]: '' }));
    this.columnAddStates.update(state => ({ ...state, [key]: false }));
  }

  deleteCard(event: MouseEvent, cardId: string): void {
    event.stopPropagation();
    if (this.optimisticUpdates()) {
      this.cardsState.update(cards => cards.filter(card => card.id !== cardId));
    }
    this.cardDeleted.emit(cardId);
  }

  isOverdue(dueDate: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dueDate).getTime() < today.getTime();
  }

  formatDueDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  private moveCard(cardId: string, targetColumnId: string, targetLaneId: string, targetIndex: number): void {
    const cards = this.cardsState();
    const sourceCard = cards.find(card => card.id === cardId);
    if (!sourceCard) return;

    const fromColumnId = sourceCard.columnId;
    const fromLaneId = this.cardLaneId(sourceCard);
    const fromIndex = this.getCardsForColumn(fromColumnId, fromLaneId).findIndex(card => card.id === cardId);
    const sameBucket = fromColumnId === targetColumnId && fromLaneId === targetLaneId;

    if (sameBucket && (!this.allowSameColumnReorder() || fromIndex === targetIndex || fromIndex + 1 === targetIndex)) {
      return;
    }

    if (!sameBucket && this.isWipReached(targetColumnId, targetLaneId)) {
      this.cardMoveRejected.emit({ cardId, toColumnId: targetColumnId, reason: 'wip-limit' });
      return;
    }

    const adjustedIndex = sameBucket && fromIndex < targetIndex ? targetIndex - 1 : targetIndex;
    const event: KanbanCardMoveEvent = {
      cardId,
      fromColumnId,
      toColumnId: targetColumnId,
      fromSwimlaneId: fromLaneId === DEFAULT_LANE_ID ? undefined : fromLaneId,
      toSwimlaneId: targetLaneId === DEFAULT_LANE_ID ? undefined : targetLaneId,
      fromIndex,
      toIndex: Math.max(0, adjustedIndex),
    };

    if (this.optimisticUpdates()) {
      this.cardsState.set(this.reorderCards(cards, sourceCard, targetColumnId, targetLaneId, adjustedIndex));
    }

    this.cardMoved.emit(event);
  }

  private reorderCards(cards: KanbanCard[], sourceCard: KanbanCard, targetColumnId: string, targetLaneId: string, targetIndex: number): KanbanCard[] {
    const movedCard: KanbanCard = {
      ...sourceCard,
      columnId: targetColumnId,
      swimlaneId: targetLaneId === DEFAULT_LANE_ID ? undefined : targetLaneId,
    };
    const remaining = cards.filter(card => card.id !== sourceCard.id);
    const targetCards = remaining.filter(card => card.columnId === targetColumnId && this.cardLaneId(card) === targetLaneId);
    const clampedIndex = Math.max(0, Math.min(targetIndex, targetCards.length));
    const targetCard = targetCards[clampedIndex];

    if (targetCard) {
      const globalIndex = remaining.findIndex(card => card.id === targetCard.id);
      return [...remaining.slice(0, globalIndex), movedCard, ...remaining.slice(globalIndex)];
    }

    const lastIndex = this.findLastIndex(remaining, card => card.columnId === targetColumnId && this.cardLaneId(card) === targetLaneId);
    const insertIndex = lastIndex === -1 ? remaining.length : lastIndex + 1;
    return [...remaining.slice(0, insertIndex), movedCard, ...remaining.slice(insertIndex)];
  }

  private draggedCardId(event: DragEvent): string | null {
    return event.dataTransfer?.getData('text/plain') || this.activeDraggingCardId();
  }

  private cardLaneId(card: KanbanCard): string {
    return card.swimlaneId || DEFAULT_LANE_ID;
  }

  private focusAddInput(key: string): void {
    const input = this.titleInputs?.find(ref => ref.nativeElement.dataset['addKey'] === key);
    input?.nativeElement.focus();
  }

  private findLastIndex<T>(items: T[], predicate: (item: T) => boolean): number {
    for (let i = items.length - 1; i >= 0; i--) {
      if (predicate(items[i])) return i;
    }
    return -1;
  }
}
