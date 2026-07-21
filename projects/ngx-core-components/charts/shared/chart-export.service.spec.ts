import { TestBed } from '@angular/core/testing';
import { ChartExportService } from './chart-export.service';

describe('ChartExportService', () => {
  let service: ChartExportService;

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
      providers: [ChartExportService]
    });
    service = TestBed.inject(ChartExportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
