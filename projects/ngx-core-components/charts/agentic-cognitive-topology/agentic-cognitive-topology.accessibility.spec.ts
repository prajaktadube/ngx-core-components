import { TestBed } from '@angular/core/testing';
import { AgenticCognitiveTopologyComponent } from './agentic-cognitive-topology.component';
import { ChartExportService } from '../shared/chart-export.service';

describe('AgenticCognitiveTopologyComponent accessibility', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgenticCognitiveTopologyComponent],
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

  it('names topology nodes and links and supports keyboard activation of a node', () => {
    const fixture = TestBed.createComponent(AgenticCognitiveTopologyComponent);
    fixture.componentRef.setInput('nodes', [
      { id: 'planner', label: 'Planner', status: 'thinking', type: 'orchestrator' },
      { id: 'worker', label: 'Worker', status: 'success', type: 'agent' },
    ]);
    fixture.componentRef.setInput('links', [{ source: 'planner', target: 'worker', active: true, label: 'delegates' }]);
    fixture.detectChanges();

    const node = fixture.nativeElement.querySelector('.node-group') as SVGGElement;
    const link = fixture.nativeElement.querySelector('.topology-link-path') as SVGPathElement;
    expect(node.getAttribute('role')).toBe('button');
    expect(node.getAttribute('tabindex')).toBe('0');
    expect(node.getAttribute('aria-label')).toContain('Planner');
    expect(node.getAttribute('aria-label')).toContain('thinking');
    expect(link.getAttribute('role')).toBe('img');
    expect(link.getAttribute('tabindex')).toBe('0');
    expect(link.getAttribute('aria-label')).toContain('Planner to Worker');
    expect(link.getAttribute('aria-label')).toContain('delegates');

    node.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.topology-tooltip')?.textContent).toContain('Planner');
  });
});
