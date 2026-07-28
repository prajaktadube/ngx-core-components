import { Directive, ElementRef, HostListener, inject, input, output } from '@angular/core';
import { applyMask } from '../utils/mask.util';

@Directive({
  selector: 'input[ngxMask]',
  standalone: true,
})
export class NgxMaskDirective {
  ngxMask = input.required<string>();
  unmaskedValueChange = output<string>();

  private el = inject(ElementRef<HTMLInputElement>);

  @HostListener('input', ['$event'])
  onInput(event: InputEvent): void {
    const inputEl = this.el.nativeElement;
    const rawVal = inputEl.value;
    const pattern = this.ngxMask();

    if (!pattern) return;

    const { masked, unmasked } = applyMask(rawVal, pattern);
    inputEl.value = masked;
    this.unmaskedValueChange.emit(unmasked);
  }
}
