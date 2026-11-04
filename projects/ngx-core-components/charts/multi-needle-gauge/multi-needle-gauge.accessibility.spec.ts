import { TestBed } from '@angular/core/testing';
import { MultiNeedleGaugeComponent } from './multi-needle-gauge.component';
import { ChartExportService } from '../shared/chart-export.service';

describe('MultiNeedleGaugeComponent accessibility', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiNeedleGaugeComponent],
      providers: [
        {
          provide: ChartExportService,
          useValue: jasmine.createSpyObj('ChartExportService', ['downloadSvg', 'downloadPdf']),
        },
      ],
    }).compileComponents();
  });

  it('names each needle and displays its value when focused', () => {
    const fixture = TestBed.createComponent(MultiNeedleGaugeComponent);
    fixture.componentRef.setInput('needles', [{ label: 'Sales', value: 80, color: '#0088ff' }]);
    fixture.componentRef.setInput('units', '%');
    fixture.detectChanges();

    const mark = fixture.nativeElement.querySelector('.needle-mark') as SVGGElement;
    expect(mark.getAttribute('role')).toBe('img');
    expect(mark.getAttribute('tabindex')).toBe('0');
    expect(mark.getAttribute('aria-label')).toContain('Sales: 80%; needle');

    mark.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.needle-tooltip')?.textContent).toContain('Sales');
    expect(fixture.nativeElement.querySelector('.needle-tooltip')?.textContent).toContain('80%');
  });

  it('uses a native button for keyboard-operable legend selection', () => {
    const fixture = TestBed.createComponent(MultiNeedleGaugeComponent);
    const needle = { label: 'Sales', value: 80, color: '#0088ff' };
    fixture.componentRef.setInput('needles', [needle]);
    fixture.detectChanges();
    const selection = jasmine.createSpy('selection');
    fixture.componentInstance.needleClick.subscribe(selection);

    const legend = fixture.nativeElement.querySelector('.legend-item') as HTMLButtonElement;
    expect(legend.tagName).toBe('BUTTON');
    legend.click();

    expect(selection).toHaveBeenCalledOnceWith(needle);
  });
});
