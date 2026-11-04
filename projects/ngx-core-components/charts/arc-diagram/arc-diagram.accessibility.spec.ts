import { TestBed } from '@angular/core/testing';
import { ArcDiagramComponent } from './arc-diagram.component';
import { ChartExportService } from '../shared/chart-export.service';

describe('ArcDiagramComponent accessibility', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArcDiagramComponent],
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

  it('exposes nodes and links as named keyboard-focusable marks with focus tooltips', () => {
    const fixture = TestBed.createComponent(ArcDiagramComponent);
    fixture.componentRef.setInput('nodes', [
      { id: 'a', label: 'Alpha', value: 4 },
      { id: 'b', label: 'Beta', value: 6 },
    ]);
    fixture.componentRef.setInput('links', [{ source: 'a', target: 'b', value: 3 }]);
    fixture.detectChanges();

    const node = fixture.nativeElement.querySelector('.node-group') as SVGGElement;
    const link = fixture.nativeElement.querySelector('.link-arc') as SVGPathElement;
    expect(node.getAttribute('role')).toBe('img');
    expect(node.getAttribute('tabindex')).toBe('0');
    expect(node.getAttribute('aria-label')).toContain('Alpha');
    expect(link.getAttribute('role')).toBe('img');
    expect(link.getAttribute('tabindex')).toBe('0');
    expect(link.getAttribute('aria-label')).toContain('Alpha');
    expect(link.getAttribute('aria-label')).toContain('Beta');

    node.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.chart-tooltip')?.textContent).toContain('Alpha');

    link.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.chart-tooltip')?.textContent).toContain('Connection Arc');
    expect(fixture.nativeElement.querySelector('.chart-tooltip')?.textContent).toContain('Beta');
  });
});
