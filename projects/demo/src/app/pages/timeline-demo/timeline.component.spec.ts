import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TimelineComponent, NgxTimelineMarkerTemplateDirective, NgxTimelineCardTemplateDirective, TimelineItem } from 'ngx-core-components/views';

@Component({
  standalone: true,
  imports: [TimelineComponent],
  template: `
    <ngx-timeline
      [items]="events()"
      [orientation]="orientation()"
      [alternating]="alternating()"
      [clickable]="clickable()"
      [selectedItem]="selectedItem()"
      (itemClick)="onItemClick($event)"
    />
  `
})
class TestTimelineWrapperComponent {
  events = signal<TimelineItem[]>([
    { id: 1, title: 'Evt 1', timestamp: '10 mins ago', status: 'info' },
    { id: 2, title: 'Evt 2', timestamp: '5 mins ago', status: 'success', active: true },
    { id: 3, title: 'Evt 3', timestamp: 'Just now', status: 'error' }
  ]);
  orientation = signal<'vertical' | 'horizontal'>('vertical');
  alternating = signal<boolean>(false);
  clickable = signal<boolean>(false);
  selectedItem = signal<TimelineItem | null>(null);

  lastClickedItem: TimelineItem | null = null;
  onItemClick(item: TimelineItem) {
    this.lastClickedItem = item;
  }
}

@Component({
  standalone: true,
  imports: [TimelineComponent, NgxTimelineMarkerTemplateDirective, NgxTimelineCardTemplateDirective],
  template: `
    <ngx-timeline [items]="events" [clickable]="true">
      <ng-template ngxTimelineMarkerTemplate let-item>
        <span class="custom-marker-node">{{ item.title }} - marker</span>
      </ng-template>
      <ng-template ngxTimelineCardTemplate let-item let-index="index">
        <div class="custom-card-node">Node #{{ index }}: {{ item.title }}</div>
      </ng-template>
    </ngx-timeline>
  `
})
class TestTimelineTemplateComponent {
  events: TimelineItem[] = [
    { title: 'Template Node', timestamp: 'Just now' }
  ];
}

describe('TimelineComponent', () => {
  let fixture: ComponentFixture<TestTimelineWrapperComponent>;
  let wrapper: TestTimelineWrapperComponent;
  let component: TimelineComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestTimelineWrapperComponent, TestTimelineTemplateComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestTimelineWrapperComponent);
    wrapper = fixture.componentInstance;
    fixture.detectChanges();

    const componentEl = fixture.debugElement.query(By.directive(TimelineComponent));
    component = componentEl.componentInstance;
  });

  it('should initialize and apply default layout class bindings', () => {
    expect(component).toBeTruthy();
    const el = fixture.debugElement.query(By.css('.ngx-timeline'));
    expect(el.nativeElement.classList.contains('orientation-vertical')).toBeTrue();
    expect(el.nativeElement.classList.contains('alternating')).toBeFalse();
  });

  it('should support switching layout orientation and alternating', () => {
    wrapper.orientation.set('horizontal');
    wrapper.alternating.set(true);
    fixture.detectChanges();

    const el = fixture.debugElement.query(By.css('.ngx-timeline'));
    expect(el.nativeElement.classList.contains('orientation-horizontal')).toBeTrue();
    expect(el.nativeElement.classList.contains('alternating')).toBeTrue();
  });

  it('should apply active-item pulsing outer ring styles on events marked active', () => {
    const activeItem = fixture.debugElement.query(By.css('.active-item'));
    expect(activeItem).toBeTruthy();
    
    const activeDot = activeItem.query(By.css('.marker-dot-active'));
    expect(activeDot).toBeTruthy();
  });

  it('should toggle selection class when matching selectedItem', () => {
    let selectedEl = fixture.debugElement.query(By.css('.item-selected'));
    expect(selectedEl).toBeNull();

    wrapper.selectedItem.set(wrapper.events()[1]);
    fixture.detectChanges();

    selectedEl = fixture.debugElement.query(By.css('.item-selected'));
    expect(selectedEl).toBeTruthy();
    expect(selectedEl.nativeElement.textContent).toContain('Evt 2');
  });

  it('should emit click events if clickable is true', () => {
    const items = fixture.debugElement.queryAll(By.css('.timeline-item'));
    expect(items.length).toBe(3);

    // click when clickable is false
    items[0].nativeElement.click();
    fixture.detectChanges();
    expect(wrapper.lastClickedItem).toBeNull();

    // click when clickable is true
    wrapper.clickable.set(true);
    fixture.detectChanges();

    items[0].nativeElement.click();
    fixture.detectChanges();
    expect(wrapper.lastClickedItem).not.toBeNull();
    expect(wrapper.lastClickedItem?.title).toBe('Evt 1');
  });

  it('should render custom marker and card content when custom directives are projected', () => {
    const templFixture = TestBed.createComponent(TestTimelineTemplateComponent);
    templFixture.detectChanges();

    const customCard = templFixture.debugElement.query(By.css('.custom-card-node'));
    expect(customCard).toBeTruthy();
    expect(customCard.nativeElement.textContent.trim()).toBe('Node #0: Template Node');

    const customMarker = templFixture.debugElement.query(By.css('.custom-marker-node'));
    expect(customMarker).toBeTruthy();
    expect(customMarker.nativeElement.textContent.trim()).toBe('Template Node - marker');
  });
});
