import { TestBed, ComponentFixture } from '@angular/core/testing';
import { GanttChartComponent, GanttTask, GanttDependency, DependencyType, GanttScaleService, ZoomLevel } from 'ngx-core-components';
import { Component, signal } from '@angular/core';

@Component({
  standalone: true,
  imports: [GanttChartComponent],
  template: `
    <ngx-gantt-chart
      [tasks]="tasks()"
      [dependencies]="dependencies()"
      [config]="config()"
    />
  `
})
class TestGanttWrapperComponent {
  config = signal<any>({});
  tasks = signal<GanttTask[]>([
    {
      id: 'task-a',
      name: 'Task A',
      start: new Date('2026-06-01T00:00:00'),
      end: new Date('2026-06-03T00:00:00'),
      progress: 0,
      parentId: null,
      collapsed: false,
      isMilestone: false
    },
    {
      id: 'task-b',
      name: 'Task B',
      start: new Date('2026-06-03T00:00:00'),
      end: new Date('2026-06-06T00:00:00'),
      progress: 0,
      parentId: null,
      collapsed: false,
      isMilestone: false
    },
    {
      id: 'task-c',
      name: 'Task C',
      start: new Date('2026-06-01T00:00:00'),
      end: new Date('2026-06-02T00:00:00'),
      progress: 0,
      parentId: null,
      collapsed: false,
      isMilestone: false
    }
  ]);

  dependencies = signal<GanttDependency[]>([
    {
      fromId: 'task-a',
      toId: 'task-b',
      type: DependencyType.FinishToStart
    }
  ]);
}

describe('GanttChartComponent Critical Path Highlighting', () => {
  let fixture: ComponentFixture<TestGanttWrapperComponent>;
  let ganttComponent: GanttChartComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestGanttWrapperComponent, GanttChartComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestGanttWrapperComponent);
    fixture.detectChanges();

    ganttComponent = fixture.debugElement.query(
      el => el.componentInstance instanceof GanttChartComponent
    ).componentInstance as GanttChartComponent;
  });

  it('should toggle critical path highlighting and calculate critical tasks correctly', () => {
    // Initially false
    expect(ganttComponent.showCriticalPath()).toBeFalse();
    expect(ganttComponent.criticalPathInfo().criticalTaskIds.size).toBe(0);

    // Toggle on
    ganttComponent.toggleCriticalPath();
    fixture.detectChanges();

    expect(ganttComponent.showCriticalPath()).toBeTrue();
    const info = ganttComponent.criticalPathInfo();

    // Task A and Task B form the critical path. Task C is independent and finishes early.
    expect(info.criticalTaskIds.has('task-a')).toBeTrue();
    expect(info.criticalTaskIds.has('task-b')).toBeTrue();
    expect(info.criticalTaskIds.has('task-c')).toBeFalse();

    // Dependency A -> B is critical
    expect(info.criticalDepKeys.has('task-a-task-b')).toBeTrue();
  });

  it('should clear critical path when there is a cycle', () => {
    // Introduce a cycle A -> B -> A
    fixture.componentInstance.dependencies.set([
      { fromId: 'task-a', toId: 'task-b', type: DependencyType.FinishToStart },
      { fromId: 'task-b', toId: 'task-a', type: DependencyType.FinishToStart }
    ]);
    ganttComponent.showCriticalPath.set(true);
    fixture.detectChanges();

    const info = ganttComponent.criticalPathInfo();
    // Should gracefully abort and return empty sets due to cycles
    expect(info.criticalTaskIds.size).toBe(0);
    expect(info.criticalDepKeys.size).toBe(0);
  });

  it('should calculate task slack days correctly when CPM is enabled', () => {
    ganttComponent.showCriticalPath.set(true);
    fixture.detectChanges();

    // Task A and Task B have 0 slack because they are on the critical path
    expect(ganttComponent.getTaskSlackDays('task-a')).toBe(0);
    expect(ganttComponent.getTaskSlackDays('task-b')).toBe(0);

    // Task C has slack: Project ends June 6. Task C is 1 day duration.
    // Late Start = June 5. Early Start = June 1. Slack = 4 days.
    expect(ganttComponent.getTaskSlackDays('task-c')).toBe(4);
    expect(ganttComponent.isTaskCritical('task-c')).toBeFalse();
  });

  it('should handle ArrowRight and Alt+ArrowRight for rescheduling/resizing focused task via keyboard', () => {
    // Focus task-a
    ganttComponent.keyboardService.focusTask('task-a');
    
    let emittedEvent: any = null;
    ganttComponent.taskChange.subscribe(ev => emittedEvent = ev);

    // Emit ArrowRight on container
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    ganttComponent.onKeyDown(event);

    expect(emittedEvent).not.toBeNull();
    // Task-a is shifted by 1 day (from 2026-06-01 to 2026-06-02)
    const expectedStart = new Date('2026-06-02T00:00:00');
    expect(emittedEvent.task.start.getTime()).toBe(expectedStart.getTime());

    // Alt + ArrowRight: Resize
    emittedEvent = null;
    const resizeEvent = new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true });
    ganttComponent.onKeyDown(resizeEvent);

    expect(emittedEvent).not.toBeNull();
    // Start date stays June 1, but end date extends by 1 day (ends June 4 instead of June 3)
    expect(emittedEvent.task.start.getTime()).toBe(new Date('2026-06-01T00:00:00').getTime());
    expect(emittedEvent.task.end.getTime()).toBe(new Date('2026-06-04T00:00:00').getTime());
  });
});

describe('GanttScaleService Precision & Continuous Alignment', () => {
  let scaleService: GanttScaleService;

  beforeEach(() => {
    scaleService = new GanttScaleService();
  });

  it('should compute continuous and fractional coordinates for Week view', () => {
    const startDate = new Date('2026-06-01T00:00:00'); // Monday
    const targetDate = new Date('2026-06-03T12:00:00'); // Wednesday noon (exactly 2.5 days after)
    const colWidth = 100;

    const x = scaleService.dateToX(targetDate, startDate, colWidth, ZoomLevel.Week);
    // 2.5 days out of 7 is (2.5 / 7) of columnWidth
    expect(x).toBeCloseTo((2.5 / 7) * colWidth, 4);

    const reversedDate = scaleService.xToDate(x, startDate, colWidth, ZoomLevel.Week);
    expect(reversedDate.getTime()).toBeCloseTo(targetDate.getTime(), 1);
  });

  it('should compute continuous and fractional coordinates for Month view', () => {
    const startDate = new Date('2026-06-01T00:00:00');
    const targetDate = new Date('2026-06-16T12:00:00'); // Exactly 15.5 days since start of June (June has 30 days)
    const colWidth = 120;

    const x = scaleService.dateToX(targetDate, startDate, colWidth, ZoomLevel.Month);
    // (15.5 / 30) of colWidth
    expect(x).toBeCloseTo((15.5 / 30) * colWidth, 4);

    const reversedDate = scaleService.xToDate(x, startDate, colWidth, ZoomLevel.Month);
    expect(reversedDate.getTime()).toBeCloseTo(targetDate.getTime(), 1);
  });
});

describe('GanttChartComponent Precision Drag & Visual Dependency Customizations', () => {
  let fixture: ComponentFixture<TestGanttWrapperComponent>;
  let ganttComponent: GanttChartComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestGanttWrapperComponent, GanttChartComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestGanttWrapperComponent);
    fixture.detectChanges();

    ganttComponent = fixture.debugElement.query(
      el => el.componentInstance instanceof GanttChartComponent
    ).componentInstance as GanttChartComponent;
  });

  it('should enforce a 1-hour minimum duration when resizing in Hour zoom level', () => {
    fixture.componentInstance.config.set({
      zoomLevel: ZoomLevel.Hour,
      columnWidth: 60,
      snapTo: 'none'
    });
    fixture.detectChanges();

    const task = fixture.componentInstance.tasks()[0];
    const barEl = document.createElement('div');
    barEl.style.left = '2880px';
    barEl.style.width = '2880px';
    barEl.className = 'k-task';
    document.body.appendChild(barEl);

    let emittedEvent: any = null;
    ganttComponent.taskChange.subscribe(ev => emittedEvent = ev);

    const pointerDownEvent = new PointerEvent('pointerdown', { bubbles: true, clientX: 2880 });
    Object.defineProperty(pointerDownEvent, 'target', { value: barEl });

    ganttComponent.onBarPointerDown(pointerDownEvent, task, 'resize-left');
    
    const pointerUpEvent = new PointerEvent('pointerup', { clientX: 6000 });
    document.dispatchEvent(pointerUpEvent);

    expect(emittedEvent).not.toBeNull();
    const durationHours = (emittedEvent.task.end.getTime() - emittedEvent.task.start.getTime()) / 3600000;
    expect(durationHours).toBe(1);

    document.body.removeChild(barEl);
  });

  it('should map critical and default dependency paths to correct SVG colors', () => {
    ganttComponent.showCriticalPath.set(true);
    fixture.detectChanges();

    const paths = ganttComponent.dependencyPaths();
    expect(paths.length).toBe(1);

    const depPath = paths[0];
    expect(depPath.isCritical).toBeTrue();
    expect(depPath.color).toBe('var(--k-danger, #ff6358)');

    fixture.componentInstance.dependencies.set([
      { fromId: 'task-a', toId: 'task-b', type: DependencyType.FinishToStart },
      { fromId: 'task-c', toId: 'task-b', type: DependencyType.FinishToStart }
    ]);
    fixture.detectChanges();

    const updatedPaths = ganttComponent.dependencyPaths();
    expect(updatedPaths.length).toBe(2);

    const nonCritDep = updatedPaths.find(p => p.dependency.fromId === 'task-c');
    expect(nonCritDep).toBeDefined();
    expect(nonCritDep!.isCritical).toBeFalse();
    expect(nonCritDep!.color).toBe('var(--k-dependency-line, #a0aec0)');
  });
});
