import { TestBed } from '@angular/core/testing';
import { GanttLayoutService } from './gantt-layout.service';

describe('GanttLayoutService', () => {
  let service: GanttLayoutService;

  beforeEach(() => {
    // Spy on window.open and window.alert to prevent PDF exports from freezing test runs
    spyOn(window, 'open').and.returnValue({
      document: {
        write: () => {},
        close: () => {}
      }
    } as any);
    spyOn(window, 'alert').and.stub();

    TestBed.configureTestingModule({
      providers: [GanttLayoutService]
    });
    service = TestBed.inject(GanttLayoutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
