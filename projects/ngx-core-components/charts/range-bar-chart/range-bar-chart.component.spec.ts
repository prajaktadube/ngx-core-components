import { TestBed } from '@angular/core/testing';
import { ChartExportService } from '../shared/chart-export.service';
import { RangeBarChartComponent } from './range-bar-chart.component';

describe('RangeBarChartComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RangeBarChartComponent],
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

  it('exposes range bars as keyboard-operable buttons with named values and focus tooltips', () => {
    const fixture = TestBed.createComponent(RangeBarChartComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('data', [{ label: 'Forecast', start: 5, end: 12 }]);
    fixture.detectChanges();

    const bar = fixture.nativeElement.querySelector('.range-bar') as SVGRectElement;
    expect(bar.getAttribute('role')).toBe('button');
    expect(bar.getAttribute('tabindex')).toBe('0');
    expect(bar.getAttribute('aria-label')).toBe('Forecast: Start: 5, End: 12');

    const clicked = spyOn(component.barClick, 'emit');
    bar.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(clicked).toHaveBeenCalledWith({ label: 'Forecast', start: 5, end: 12 });

    bar.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.chart-tooltip')?.textContent).toContain('Forecast');

    bar.dispatchEvent(new FocusEvent('blur'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.chart-tooltip')).toBeNull();
  });
});
