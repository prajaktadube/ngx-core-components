import { TestBed } from '@angular/core/testing';
import { ChartExportService } from '../shared/chart-export.service';
import { RadarChartComponent } from './radar-chart.component';

describe('RadarChartComponent accessibility', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadarChartComponent],
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

  it('names radar points and displays their tooltip on keyboard focus', () => {
    const fixture = TestBed.createComponent(RadarChartComponent);
    fixture.componentRef.setInput('seriesData', [{ label: 'Revenue', values: [42] }]);
    fixture.componentRef.setInput('categories', ['Q1']);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const point = fixture.nativeElement.querySelector('.radar-dot') as SVGCircleElement;

    expect(point.getAttribute('role')).toBe('img');
    expect(point.getAttribute('aria-label')).toBe('Revenue, Q1: 42');
    expect(point.tabIndex).toBe(0);

    point.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();

    expect(component.tooltip().show).toBe(true);
    expect(component.tooltip().category).toBe('Q1');
    expect(component.tooltip().series).toBe('Revenue');
    expect(component.tooltip().value).toBe('42');
  });
});
