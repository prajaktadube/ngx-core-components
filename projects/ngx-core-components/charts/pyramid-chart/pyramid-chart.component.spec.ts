import { TestBed } from '@angular/core/testing';
import { ChartExportService } from '../shared/chart-export.service';
import { PyramidChartComponent } from './pyramid-chart.component';

describe('PyramidChartComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PyramidChartComponent],
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

  it('exposes pyramid segments as named keyboard-operable marks with focus tooltips', () => {
    const fixture = TestBed.createComponent(PyramidChartComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('data', [{ label: 'Awareness', value: 80 }]);
    fixture.detectChanges();

    const mark = fixture.nativeElement.querySelector('.pyramid-segment') as SVGGElement;
    expect(mark.getAttribute('role')).toBe('button');
    expect(mark.getAttribute('tabindex')).toBe('0');
    expect(mark.getAttribute('aria-label')).toBe('Awareness: 80');

    const clicked = spyOn(component.segmentClick, 'emit');
    mark.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(clicked).toHaveBeenCalledWith({ label: 'Awareness', value: 80 });

    mark.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.chart-tooltip')?.textContent).toContain('Awareness');

    mark.dispatchEvent(new FocusEvent('blur'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.chart-tooltip')).toBeNull();
  });
});
