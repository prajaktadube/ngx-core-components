import { TestBed } from '@angular/core/testing';
import { DependencyWheelComponent } from './dependency-wheel.component';
import { ChartExportService } from '../shared/chart-export.service';

describe('DependencyWheelComponent accessibility', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DependencyWheelComponent],
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

  it('names wheel nodes and dependencies with focus-visible value details', () => {
    const fixture = TestBed.createComponent(DependencyWheelComponent);
    fixture.componentRef.setInput('matrix', [
      [0, 5],
      [2, 0],
    ]);
    fixture.componentRef.setInput('labels', ['Compile', 'Deploy']);
    fixture.detectChanges();

    const node = fixture.nativeElement.querySelector('.wheel-node-group') as SVGGElement;
    const dependency = fixture.nativeElement.querySelector('.dependency-ribbon') as SVGPathElement;
    expect(node.getAttribute('role')).toBe('img');
    expect(node.getAttribute('tabindex')).toBe('0');
    expect(node.getAttribute('aria-label')).toContain('Compile');
    expect(dependency.getAttribute('role')).toBe('img');
    expect(dependency.getAttribute('tabindex')).toBe('0');
    expect(dependency.getAttribute('aria-label')).toContain('Compile');
    expect(dependency.getAttribute('aria-label')).toContain('Deploy');

    node.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.chart-tooltip')?.textContent).toContain('Compile');

    dependency.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.chart-tooltip')?.textContent).toContain('Dependency');
    expect(fixture.nativeElement.querySelector('.chart-tooltip')?.textContent).toContain('Deploy');
  });
});
