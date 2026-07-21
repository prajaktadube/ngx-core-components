import { TestBed } from '@angular/core/testing';
import { GanttPrintService } from './gantt-print.service';

describe('GanttPrintService', () => {
  let service: GanttPrintService;

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
      providers: [GanttPrintService]
    });
    service = TestBed.inject(GanttPrintService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
