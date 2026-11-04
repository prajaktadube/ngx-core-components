import { TestBed } from '@angular/core/testing';
import { WordCloudComponent } from './word-cloud.component';

describe('WordCloudComponent accessibility', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WordCloudComponent],
    }).compileComponents();
  });

  it('names each word with its value and shows its tooltip when focused', () => {
    const fixture = TestBed.createComponent(WordCloudComponent);
    fixture.componentRef.setInput('data', [{ text: 'Angular', value: 5 }]);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const word = fixture.nativeElement.querySelector('.word-group') as SVGGElement;

    expect(word.getAttribute('role')).toBe('img');
    expect(word.getAttribute('aria-label')).toContain('Angular');
    expect(word.getAttribute('aria-label')).toContain('5');
    expect(word.tabIndex).toBe(0);

    word.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(component.tooltip()?.text).toBe('Angular');
    expect(component.tooltip()?.value).toBe(5);
  });
});
