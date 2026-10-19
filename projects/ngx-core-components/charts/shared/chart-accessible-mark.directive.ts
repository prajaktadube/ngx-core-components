import { Directive, input, output } from '@angular/core';

@Directive({
  selector: '[ngxChartAccessibleMark]',
  standalone: true,
  host: {
    '[attr.role]': "ngxChartAccessibleMarkInteractive() ? 'button' : 'img'",
    '[attr.aria-label]': 'ngxChartAccessibleMark()',
    '[attr.tabindex]': '0',
    '(keydown)': 'onKeydown($event)',
  },
})
export class ChartAccessibleMarkDirective {
  readonly ngxChartAccessibleMark = input.required<string>();
  readonly ngxChartAccessibleMarkInteractive = input(false);
  readonly activated = output<void>();

  onKeydown(event: KeyboardEvent): void {
    if (!this.ngxChartAccessibleMarkInteractive() || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    this.activated.emit();
  }
}
