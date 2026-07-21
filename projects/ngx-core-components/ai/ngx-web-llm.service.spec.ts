import { TestBed } from '@angular/core/testing';
import { NgxWebLlmService } from './ngx-web-llm.service';

describe('NgxWebLlmService', () => {
  let service: NgxWebLlmService;

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
      providers: [NgxWebLlmService]
    });
    service = TestBed.inject(NgxWebLlmService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
