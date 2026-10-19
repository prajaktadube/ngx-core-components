import type { ComponentFixture } from '@angular/core/testing';

export class NgxComponentTestHarness<T> {
  constructor(readonly fixture: ComponentFixture<T>) {}

  get instance(): T {
    return this.fixture.componentInstance;
  }

  setInput(name: string, value: unknown): void {
    this.fixture.componentRef.setInput(name, value);
  }

  detectChanges(): void {
    this.fixture.detectChanges();
  }

  query<TElement extends Element = HTMLElement>(selector: string): TElement | null {
    const root = this.fixture.nativeElement as ParentNode;
    return root.querySelector<TElement>(selector);
  }

  queryAll<TElement extends Element = HTMLElement>(selector: string): TElement[] {
    const root = this.fixture.nativeElement as ParentNode;
    return Array.from(root.querySelectorAll<TElement>(selector));
  }
}
