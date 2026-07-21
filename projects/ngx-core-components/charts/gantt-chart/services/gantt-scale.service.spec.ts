import { TestBed } from '@angular/core/testing';
import { GanttScaleService } from './gantt-scale.service';

describe('GanttScaleService', () => {
  let service: GanttScaleService;

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
      providers: [GanttScaleService]
    });
    service = TestBed.inject(GanttScaleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
