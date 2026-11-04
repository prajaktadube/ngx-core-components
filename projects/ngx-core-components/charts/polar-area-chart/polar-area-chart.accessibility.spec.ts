import { TestBed } from '@angular/core/testing';
import { ChartExportService } from '../shared/chart-export.service';
import { PolarAreaChartComponent } from './polar-area-chart.component';

describe('PolarAreaChartComponent accessibility', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolarAreaChartComponent],
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

  it('labels each slice, reveals its tooltip on focus, and activates through Enter', () => {
    const fixture = TestBed.createComponent(PolarAreaChartComponent);
    fixture.componentRef.setInput('data', [{ label: 'January', value: 42 }]);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const slice = fixture.nativeElement.querySelector('.polar-slice') as SVGPathElement;
    const activated = jasmine.createSpy('sliceClick');
    component.sliceClick.subscribe(activated);

    expect(slice.getAttribute('role')).toBe('button');
    expect(slice.getAttribute('aria-label')).toBe('January: 42');
    expect(slice.tabIndex).toBe(0);

    slice.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(component.tooltip()?.label).toBe('January');

    slice.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    expect(activated).toHaveBeenCalledOnceWith(jasmine.objectContaining({ label: 'January', value: 42 }));
  });
});
