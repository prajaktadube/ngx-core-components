import { TestBed } from '@angular/core/testing';
import { PointFigureChartComponent } from './point-figure-chart.component';

describe('PointFigureChartComponent accessibility', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PointFigureChartComponent],
    }).compileComponents();
  });

  it('exposes keyboard-focusable cells and their tooltip values', () => {
    const fixture = TestBed.createComponent(PointFigureChartComponent);
    fixture.componentRef.setInput('data', [100, 110]);
    fixture.componentRef.setInput('boxSize', 5);
    fixture.detectChanges();

    const chart = fixture.componentInstance;
    const cell = fixture.nativeElement.querySelector('.pf-cell-group') as SVGGElement;

    expect(cell.getAttribute('role')).toBe('img');
    expect(cell.getAttribute('aria-label')).toBe('Point & Figure X in column 1: 100');
    expect(cell.tabIndex).toBe(0);

    cell.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(chart.tooltip()?.type).toBe('X');
    expect(chart.tooltip()?.value).toBe(100);

    cell.dispatchEvent(new FocusEvent('blur'));
    expect(chart.tooltip()).toBeNull();
  });
});
