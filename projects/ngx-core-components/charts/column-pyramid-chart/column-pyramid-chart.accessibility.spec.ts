import { TestBed } from '@angular/core/testing';
import { ChartExportService } from '../shared/chart-export.service';
import { ColumnPyramidChartComponent } from './column-pyramid-chart.component';

describe('ColumnPyramidChartComponent accessibility', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColumnPyramidChartComponent],
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

  it('names pyramid marks with series, category, and value and reveals a tooltip on focus', () => {
    const fixture = TestBed.createComponent(ColumnPyramidChartComponent);
    fixture.componentRef.setInput('series', [{ name: 'Revenue', data: [9] }]);
    fixture.componentRef.setInput('categories', ['North']);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const mark = fixture.nativeElement.querySelector('.pyramid-poly') as SVGPolygonElement;

    expect(mark.getAttribute('role')).toBe('img');
    expect(mark.getAttribute('aria-label')).toBe('Revenue, North: 9');
    expect(mark.tabIndex).toBe(0);

    mark.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();

    expect(component.tooltip()?.category).toBe('North');
    expect(component.tooltip()?.seriesName).toBe('Revenue');
    expect(component.tooltip()?.value).toBe(9);
  });
});
