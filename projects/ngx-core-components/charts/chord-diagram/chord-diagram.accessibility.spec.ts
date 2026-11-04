import { TestBed } from '@angular/core/testing';
import { ChordDiagramComponent } from './chord-diagram.component';
import { ChartExportService } from '../shared/chart-export.service';

describe('ChordDiagramComponent accessibility', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChordDiagramComponent],
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

  it('exposes chord nodes and ribbons as named keyboard-focusable marks with focus details', () => {
    const fixture = TestBed.createComponent(ChordDiagramComponent);
    fixture.componentRef.setInput('matrix', [
      [0, 2],
      [3, 0],
    ]);
    fixture.componentRef.setInput('labels', ['Alpha', 'Beta']);
    fixture.detectChanges();

    const node = fixture.nativeElement.querySelector('.chord-node-group') as SVGGElement;
    const ribbon = fixture.nativeElement.querySelector('.chord-ribbon') as SVGPathElement;
    expect(node.getAttribute('role')).toBe('img');
    expect(node.getAttribute('tabindex')).toBe('0');
    expect(node.getAttribute('aria-label')).toContain('Alpha');
    expect(ribbon.getAttribute('role')).toBe('img');
    expect(ribbon.getAttribute('tabindex')).toBe('0');
    expect(ribbon.getAttribute('aria-label')).toContain('Alpha');
    expect(ribbon.getAttribute('aria-label')).toContain('Beta');

    node.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.chart-tooltip')?.textContent).toContain('Alpha');

    ribbon.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.chart-tooltip')?.textContent).toContain('Flow Connection');
    expect(fixture.nativeElement.querySelector('.chart-tooltip')?.textContent).toContain('Beta');
  });
});
