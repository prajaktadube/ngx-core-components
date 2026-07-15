import { TestBed } from '@angular/core/testing';
import { NgxWebLlmService } from './ngx-web-llm.service';

describe('NgxWebLlmService', () => {
  let service: NgxWebLlmService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NgxWebLlmService]
    });
    service = TestBed.inject(NgxWebLlmService);
  });

  afterEach(() => {
    service.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize simulation when WebGPU is not supported', async () => {
    // Force isGpuSupported to return false
    spyOn(service, 'isGpuSupported').and.returnValue(false);
    
    let progressVal = 0;
    const progressSpy = jasmine.createSpy('progressSpy').and.callFake((val, msg) => {
      progressVal = val;
    });

    await service.init('test-model', progressSpy);

    expect(service.isReady()).toBeTrue();
    expect(service.status()).toBe('ready');
    expect(progressVal).toBe(1.0);
  });

  it('should generate text using simulated engine', async () => {
    spyOn(service, 'isGpuSupported').and.returnValue(false);
    await service.init('test-model');

    const tokens: string[] = [];
    const text = await service.generate(
      [{ role: 'user', content: 'Hello' }],
      (t) => tokens.push(t)
    );

    expect(text).toContain('Simulated WebLLM response');
    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens[tokens.length - 1]).toEqual(text);
  });
});
