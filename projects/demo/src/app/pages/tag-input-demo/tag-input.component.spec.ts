import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TagInputComponent } from 'ngx-core-components/inputs';
import { Component, signal } from '@angular/core';

@Component({
  standalone: true,
  imports: [TagInputComponent],
  template: `
    <ngx-tag-input
      [tags]="tags()"
      [maxTags]="maxTags"
      [allowDuplicates]="allowDuplicates"
      (tagsChange)="onTagsChange($event)"
    ></ngx-tag-input>
  `
})
class TestHostComponent {
  tags = signal<string[]>(['angular', 'signals']);
  maxTags = 5;
  allowDuplicates = false;
  latestTags: string[] = [];

  onTagsChange(tags: string[]) {
    this.latestTags = tags;
  }
}

describe('TagInputComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let componentEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, TagInputComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    componentEl = fixture.debugElement.query(By.directive(TagInputComponent)).nativeElement;
    fixture.detectChanges();
  });

  it('should render initial tags as chips', () => {
    const chips = componentEl.querySelectorAll('.ngx-tag-chip__label');
    expect(chips.length).toBe(2);
    expect(chips[0].textContent?.trim()).toBe('angular');
    expect(chips[1].textContent?.trim()).toBe('signals');
  });

  it('should add a tag when typing and pressing Enter', () => {
    const input = componentEl.querySelector('.ngx-tag-input__field') as HTMLInputElement;
    expect(input).toBeTruthy();

    input.value = 'rxjs';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    input.dispatchEvent(event);
    fixture.detectChanges();

    const chips = componentEl.querySelectorAll('.ngx-tag-chip__label');
    expect(chips.length).toBe(3);
    expect(chips[2].textContent?.trim()).toBe('rxjs');
    expect(hostComponent.latestTags).toEqual(['angular', 'signals', 'rxjs']);
  });

  it('should prevent duplicates by default', () => {
    const input = componentEl.querySelector('.ngx-tag-input__field') as HTMLInputElement;
    input.value = 'angular';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    input.dispatchEvent(event);
    fixture.detectChanges();

    const chips = componentEl.querySelectorAll('.ngx-tag-chip__label');
    expect(chips.length).toBe(2); // Still 2
  });

  it('should remove a tag when clicking remove button', () => {
    const removeBtns = componentEl.querySelectorAll('.ngx-tag-chip__remove');
    expect(removeBtns.length).toBe(2);

    (removeBtns[0] as HTMLButtonElement).click();
    fixture.detectChanges();

    const chips = componentEl.querySelectorAll('.ngx-tag-chip__label');
    expect(chips.length).toBe(1);
    expect(chips[0].textContent?.trim()).toBe('signals');
    expect(hostComponent.latestTags).toEqual(['signals']);
  });

  it('should enforce max tags limit', () => {
    hostComponent.tags.set(['a', 'b', 'c', 'd', 'e']);
    fixture.detectChanges();

    let input = componentEl.querySelector('.ngx-tag-input__field');
    expect(input).toBeFalsy(); // Hidden because isAtMax is true

    const hint = componentEl.querySelector('.ngx-tag-input__max-hint');
    expect(hint).toBeTruthy();
    expect(hint?.textContent?.trim()).toBe('Max 5 tags');
  });
});
