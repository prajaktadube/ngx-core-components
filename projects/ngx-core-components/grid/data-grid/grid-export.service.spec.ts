import { TestBed } from '@angular/core/testing';
import { GridExportService } from './grid-export.service';

describe('GridExportService', () => {
  let service: GridExportService;

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
      providers: [GridExportService]
    });
    service = TestBed.inject(GridExportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
