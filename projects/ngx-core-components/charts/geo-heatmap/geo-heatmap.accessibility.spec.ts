import { TestBed } from '@angular/core/testing';
import { GeoHeatmapComponent } from './geo-heatmap.component';
import { ChartExportService } from '../shared/chart-export.service';

describe('GeoHeatmapComponent accessibility', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeoHeatmapComponent],
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

  it('exposes density cells as named keyboard-focusable marks and shows their tooltip on focus', () => {
    const fixture = TestBed.createComponent(GeoHeatmapComponent);
    fixture.componentRef.setInput('data', [{ lat: 30, lng: 40, weight: 7 }]);
    fixture.detectChanges();

    const cell = fixture.nativeElement.querySelector('.map-triggers circle') as SVGCircleElement | null;

    expect(cell).toBeTruthy();
    expect(cell?.getAttribute('role')).toBe('img');
    expect(cell?.getAttribute('tabindex')).toBe('0');
    expect(cell?.getAttribute('aria-label')).toContain('latitude');
    expect(cell?.getAttribute('aria-label')).toContain('weight 7');

    cell?.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.chart-tooltip')?.textContent).toContain('Density Zone');
    expect(fixture.nativeElement.querySelector('.chart-tooltip')?.textContent).toContain('7');
  });
});
