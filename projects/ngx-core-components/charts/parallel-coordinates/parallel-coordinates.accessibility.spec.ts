import { TestBed } from '@angular/core/testing';
import { ParallelCoordinatesComponent } from './parallel-coordinates.component';
import { ChartExportService } from '../shared/chart-export.service';

describe('ParallelCoordinatesComponent accessibility', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParallelCoordinatesComponent],
      providers: [
        {
          provide: ChartExportService,
          useValue: jasmine.createSpyObj('ChartExportService', [
            'downloadJson',
            'downloadCsv',
            'downloadSvg',
            'downloadPdf',
          ]),
        },
      ],
    }).compileComponents();
  });

  it('exposes each data line as a named keyboard-focusable mark and reveals its values on focus', () => {
    const fixture = TestBed.createComponent(ParallelCoordinatesComponent);
    fixture.componentRef.setInput('data', [
      { age: 35, score: 82 },
      { age: 50, score: 91 },
    ]);
    fixture.componentRef.setInput('dimensions', ['age', 'score']);
    fixture.detectChanges();

    const line = fixture.nativeElement.querySelector('.data-line') as SVGPathElement;
    expect(line.getAttribute('role')).toBe('img');
    expect(line.getAttribute('tabindex')).toBe('0');
    expect(line.getAttribute('aria-label')).toContain('Record 1');
    expect(line.getAttribute('aria-label')).toContain('age: 35');
    expect(line.getAttribute('aria-label')).toContain('score: 82');

    line.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.chart-tooltip')?.textContent).toContain('Record #1');
    expect(fixture.nativeElement.querySelector('.chart-tooltip')?.textContent).toContain('35');
    expect(fixture.nativeElement.querySelector('.chart-tooltip')?.textContent).toContain('82');
  });
});
