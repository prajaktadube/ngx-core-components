import { TestBed } from '@angular/core/testing';
import { AdjacencyMatrixComponent } from './adjacency-matrix.component';

describe('AdjacencyMatrixComponent accessibility', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdjacencyMatrixComponent],
    }).compileComponents();
  });

  it('names each connection cell and shows its tooltip on focus', () => {
    const fixture = TestBed.createComponent(AdjacencyMatrixComponent);
    fixture.componentRef.setInput('labels', ['A', 'B']);
    fixture.componentRef.setInput('matrix', [
      [0, 4],
      [2, 0],
    ]);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const cells = fixture.nativeElement.querySelectorAll('.matrix-cell') as NodeListOf<SVGRectElement>;
    const cell = cells[1];

    expect(cell.getAttribute('role')).toBe('img');
    expect(cell.getAttribute('aria-label')).toContain('A to B');
    expect(cell.getAttribute('aria-label')).toContain('4');
    expect(cell.tabIndex).toBe(0);

    cell.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(component.tooltip()?.source).toBe('A');
    expect(component.tooltip()?.target).toBe('B');
    expect(component.tooltip()?.value).toBe(4);
  });
});
