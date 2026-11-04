import { TestBed } from '@angular/core/testing';
import { NetworkGraphComponent } from './network-graph.component';
import { ChartExportService } from '../shared/chart-export.service';

describe('NetworkGraphComponent accessibility', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NetworkGraphComponent],
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

  it('exposes nodes and links as named keyboard-focusable marks and shows details on focus', () => {
    const fixture = TestBed.createComponent(NetworkGraphComponent);
    fixture.componentRef.setInput('nodes', [
      { id: 'a', label: 'Alpha', value: 4, group: 'North' },
      { id: 'b', label: 'Beta', value: 6, group: 'South' },
    ]);
    fixture.componentRef.setInput('links', [{ source: 'a', target: 'b', value: 3 }]);
    fixture.detectChanges();

    const node = fixture.nativeElement.querySelector('.node-group') as SVGGElement;
    const link = fixture.nativeElement.querySelector('.link-line') as SVGLineElement;
    expect(node.getAttribute('role')).toBe('img');
    expect(node.getAttribute('tabindex')).toBe('0');
    expect(node.getAttribute('aria-label')).toContain('connections');
    expect(link.getAttribute('role')).toBe('img');
    expect(link.getAttribute('tabindex')).toBe('0');
    expect(link.getAttribute('aria-label')).toContain('Connection from');

    node.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.chart-tooltip')?.textContent).toContain('Alpha');

    link.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.chart-tooltip')?.textContent).toContain('Link Connection');
    expect(fixture.nativeElement.querySelector('.chart-tooltip')?.textContent).toContain('Beta');
  });
});
