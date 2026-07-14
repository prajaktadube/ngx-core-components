import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GanttChartComponent } from './gantt-chart.component';
import { GanttTask } from './models';
import { provideNgxI18n } from '../../i18n/public-api';

describe('GanttChartComponent', () => {
  let component: GanttChartComponent;
  let fixture: ComponentFixture<GanttChartComponent>;

  const mockTasks: GanttTask[] = [
    {
      id: 'task-1',
      name: 'Design Phase',
      start: new Date(2026, 6, 1),
      end: new Date(2026, 6, 5),
      progress: 60,
      parentId: null,
      collapsed: false,
      isMilestone: false
    },
    {
      id: 'task-2',
      name: 'Implementation',
      start: new Date(2026, 6, 6),
      end: new Date(2026, 6, 15),
      progress: 20,
      parentId: null,
      collapsed: false,
      isMilestone: false
    },
    {
      id: 'milestone-1',
      name: 'Release Milestone',
      start: new Date(2026, 6, 16),
      end: new Date(2026, 6, 16),
      progress: 0,
      parentId: null,
      collapsed: false,
      isMilestone: true
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GanttChartComponent],
      providers: [
        provideNgxI18n({
          gantt: {
            addTask: 'Aufgabe hinzufügen',
            deleteTask: 'Aufgabe löschen',
            editTask: 'Aufgabe bearbeiten',
            zoomIn: 'Vergrößern',
            zoomOut: 'Verkleinern',
            today: 'Heute',
            criticalPath: 'Kritischer Pfad',
            baseline: 'Basisplan'
          },
          common: {
            loading: 'Wird geladen...',
            noData: 'Keine Daten',
            error: 'Fehler',
            retry: 'Wiederholen',
            save: 'Speichern',
            delete: 'Löschen',
            edit: 'Bearbeiten',
            cancel: 'Abbrechen',
            ok: 'OK',
            close: 'Schließen',
            search: 'Suchen...',
            required: 'Pflichtfeld'
          }
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GanttChartComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('tasks', mockTasks);
    fixture.componentRef.setInput('config', { showToolbar: true });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render tasks inside sidebar', () => {
    const taskNames = fixture.nativeElement.querySelectorAll('.k-task-name');
    expect(taskNames.length).toBe(3);
    expect(taskNames[0].textContent.trim()).toBe('Design Phase');
    expect(taskNames[1].textContent.trim()).toBe('Implementation');
    expect(taskNames[2].textContent.trim()).toBe('Release Milestone');
  });

  it('should render localized toolbar actions', () => {
    const todayBtn = fixture.nativeElement.querySelector('.k-toolbar-btn');
    expect(todayBtn).toBeTruthy();

    const criticalPathBtn = Array.from(fixture.nativeElement.querySelectorAll('.k-toolbar-btn'))
      .find((el: any) => el.textContent.includes('Kritischer Pfad'));
    expect(criticalPathBtn).toBeTruthy();
  });

  it('should toggle critical path selection on click', () => {
    expect(component.showCriticalPath()).toBeFalse();

    const criticalPathBtn = Array.from(fixture.nativeElement.querySelectorAll('.k-toolbar-btn'))
      .find((el: any) => el.textContent.includes('Kritischer Pfad')) as HTMLButtonElement;
    expect(criticalPathBtn).toBeTruthy();

    criticalPathBtn.click();
    fixture.detectChanges();

    expect(component.showCriticalPath()).toBeTrue();
  });
});
