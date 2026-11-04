import { TestBed } from '@angular/core/testing';
import { MapChoroplethComponent } from './map-choropleth.component';
import { ChartExportService } from '../shared/chart-export.service';

describe('MapChoroplethComponent accessibility', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapChoroplethComponent],
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

  it('exposes regions as named keyboard-focusable marks and shows their tooltip on focus', () => {
    const fixture = TestBed.createComponent(MapChoroplethComponent);
    fixture.componentRef.setInput('data', [{ regionId: 'US', value: 42, label: 'Revenue' }]);
    fixture.detectChanges();

    const region = Array.from(fixture.nativeElement.querySelectorAll('.map-region') as NodeListOf<SVGPathElement>).find(
      mark => mark.getAttribute('aria-label')?.includes('United States')
    );

    expect(region).toBeTruthy();
    expect(region?.getAttribute('role')).toBe('img');
    expect(region?.getAttribute('tabindex')).toBe('0');
    expect(region?.getAttribute('aria-label')).toContain('42');

    region?.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.chart-tooltip')?.textContent).toContain('United States');
    expect(fixture.nativeElement.querySelector('.chart-tooltip')?.textContent).toContain('42');
  });
});
