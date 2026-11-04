import { TestBed } from '@angular/core/testing';
import { ChartExportService } from '../shared/chart-export.service';
import { ParetoChartComponent } from './pareto-chart.component';

describe('ParetoChartComponent accessibility', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParetoChartComponent],
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

  it('labels Pareto values and cumulative percentages and reveals tooltips on focus', () => {
    const fixture = TestBed.createComponent(ParetoChartComponent);
    fixture.componentRef.setInput('data', [{ label: 'Returns', value: 42 }]);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const bar = fixture.nativeElement.querySelector('.pareto-bar') as SVGRectElement;
    const point = fixture.nativeElement.querySelector('.pareto-dot') as SVGCircleElement;

    expect(bar.getAttribute('aria-label')).toBe('Returns: 42');
    expect(point.getAttribute('aria-label')).toBe('Returns: 42, cumulative 100.0%');
    expect(bar.tabIndex).toBe(0);
    expect(point.tabIndex).toBe(0);

    point.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();

    expect(component.tooltip()?.label).toBe('Returns');
    expect(component.tooltip()?.cumPct).toBe(100);
  });
});
