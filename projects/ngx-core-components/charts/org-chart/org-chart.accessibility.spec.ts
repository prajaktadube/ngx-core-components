import { TestBed } from '@angular/core/testing';
import { OrgChartComponent } from './org-chart.component';

describe('OrgChartComponent accessibility', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrgChartComponent],
    }).compileComponents();
  });

  it('names employee cards and exposes report expansion as a keyboard button', () => {
    const fixture = TestBed.createComponent(OrgChartComponent);
    const root = {
      id: 'lead',
      name: 'Alex Lead',
      title: 'Director',
      department: 'Engineering',
      children: [{ id: 'engineer', name: 'Sam Engineer', title: 'Engineer' }],
    };
    fixture.componentRef.setInput('rootNode', root);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const cards = fixture.nativeElement.querySelectorAll('.org-card') as NodeListOf<SVGRectElement>;
    const rootCard = Array.from(cards).find(card => card.getAttribute('aria-label')?.includes('Alex Lead'))!;
    let handle = fixture.nativeElement.querySelector('.expand-handle') as SVGGElement;
    const clicked: string[] = [];
    component.nodeClick.subscribe(node => clicked.push(node.id));

    expect(rootCard.getAttribute('role')).toBe('button');
    expect(rootCard.getAttribute('aria-label')).toContain('Director');
    expect(rootCard.tabIndex).toBe(0);
    rootCard.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(clicked).toEqual(['lead']);

    expect(handle.getAttribute('role')).toBe('button');
    expect(handle.getAttribute('aria-label')).toBe('Collapse Alex Lead');
    expect(handle.getAttribute('aria-expanded')).toBe('true');
    expect(handle.tabIndex).toBe(0);
    handle.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    fixture.detectChanges();
    handle = fixture.nativeElement.querySelector('.expand-handle') as SVGGElement;
    expect(handle.getAttribute('aria-expanded')).toBe('false');
    expect(component.nodes().map(node => node.data.id)).toEqual(['lead']);
  });
});
