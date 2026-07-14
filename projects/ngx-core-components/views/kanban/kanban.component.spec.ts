import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KanbanComponent } from './kanban.component';
import { KanbanColumn, KanbanCard } from './models';

describe('KanbanComponent', () => {
  let component: KanbanComponent;
  let fixture: ComponentFixture<KanbanComponent>;

  const mockColumns: KanbanColumn[] = [
    { id: 'todo', title: 'To Do', color: '#ff0000' },
    { id: 'inprogress', title: 'In Progress', color: '#00ff00' },
    { id: 'done', title: 'Done', color: '#0000ff' }
  ];

  const mockCards: KanbanCard[] = [
    { id: '1', title: 'Card One', columnId: 'todo', priority: 'high' },
    { id: '2', title: 'Card Two', columnId: 'todo', priority: 'medium' },
    { id: '3', title: 'Card Three', columnId: 'inprogress', priority: 'low' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KanbanComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(KanbanComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('columns', mockColumns);
    fixture.componentRef.setInput('cards', mockCards);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render columns and cards', () => {
    const columns = fixture.nativeElement.querySelectorAll('.kanban-column');
    expect(columns.length).toBe(3);

    const cards = fixture.nativeElement.querySelectorAll('.kanban-card');
    expect(cards.length).toBe(3);
  });

  it('should move card to next column on ArrowRight keydown', () => {
    spyOn(component.cardMoved, 'emit');

    const cardEl = fixture.nativeElement.querySelector('#k-card-1');
    expect(cardEl).toBeTruthy();

    const rightArrowEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    cardEl.dispatchEvent(rightArrowEvent);
    fixture.detectChanges();

    expect(component.cardMoved.emit).toHaveBeenCalledWith({
      cardId: '1',
      fromColumnId: 'todo',
      toColumnId: 'inprogress',
      fromSwimlaneId: undefined,
      toSwimlaneId: undefined,
      fromIndex: 0,
      toIndex: 0
    });
  });

  it('should move card to previous column on ArrowLeft keydown', () => {
    spyOn(component.cardMoved, 'emit');

    // Focus / dispatch on the second card which is in 'inprogress' column
    const cardEl = fixture.nativeElement.querySelector('#k-card-3');
    expect(cardEl).toBeTruthy();

    const leftArrowEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
    cardEl.dispatchEvent(leftArrowEvent);
    fixture.detectChanges();

    expect(component.cardMoved.emit).toHaveBeenCalledWith({
      cardId: '3',
      fromColumnId: 'inprogress',
      toColumnId: 'todo',
      fromSwimlaneId: undefined,
      toSwimlaneId: undefined,
      fromIndex: 0,
      toIndex: 0
    });
  });

  it('should reorder cards within the same column on ArrowDown/ArrowUp keydown', () => {
    spyOn(component.cardMoved, 'emit');

    // First card (index 0) in 'todo' column
    const cardEl = fixture.nativeElement.querySelector('#k-card-1');
    expect(cardEl).toBeTruthy();

    const downArrowEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    cardEl.dispatchEvent(downArrowEvent);
    fixture.detectChanges();

    expect(component.cardMoved.emit).toHaveBeenCalledWith({
      cardId: '1',
      fromColumnId: 'todo',
      toColumnId: 'todo',
      fromSwimlaneId: undefined,
      toSwimlaneId: undefined,
      fromIndex: 0,
      toIndex: 1
    });
  });
});
