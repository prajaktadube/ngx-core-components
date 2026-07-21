import { TestBed } from '@angular/core/testing';
import { GanttKeyboardService } from './gantt-keyboard.service';

describe('GanttKeyboardService', () => {
  let service: GanttKeyboardService;

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
      providers: [GanttKeyboardService]
    });
    service = TestBed.inject(GanttKeyboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
