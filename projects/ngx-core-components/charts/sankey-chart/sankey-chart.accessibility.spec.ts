import { TestBed } from '@angular/core/testing';
import { SankeyChartComponent } from './sankey-chart.component';

describe('SankeyChartComponent accessibility', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SankeyChartComponent],
    }).compileComponents();
  });

  it('names nodes and links and shows their tooltips on focus', () => {
    const fixture = TestBed.createComponent(SankeyChartComponent);
    fixture.componentRef.setInput('nodes', [
      { id: 'start', label: 'Start' },
      { id: 'end', label: 'End' },
    ]);
    fixture.componentRef.setInput('links', [{ source: 'start', target: 'end', value: 5 }]);
    fixture.detectChanges();

    const chart = fixture.componentInstance;
    const node = fixture.nativeElement.querySelector('.sankey-node-group') as SVGGElement;
    const link = fixture.nativeElement.querySelector('.sankey-link') as SVGPathElement;

    expect(node.getAttribute('role')).toBe('img');
    expect(node.getAttribute('aria-label')).toContain('Start: total flow');
    expect(node.tabIndex).toBe(0);
    node.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(chart.tooltip()?.type).toBe('node');
    expect(chart.tooltip()?.label).toBe('Start');

    node.dispatchEvent(new FocusEvent('blur'));
    link.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(link.getAttribute('role')).toBe('img');
    expect(link.getAttribute('aria-label')).toBe('Flow from Start to End: 5');
    expect(link.tabIndex).toBe(0);
    expect(chart.tooltip()?.type).toBe('link');
    expect(chart.tooltip()?.value).toBe(5);
  });
});
