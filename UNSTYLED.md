# Headless & Unstyled Component Architecture Proposal

This proposal outlines the strategy for introducing unstyled/headless primitives into `ngx-core-components`. The goal is to allow enterprise consumers to leverage the robust, fully-tested, accessible behavior of the library while bringing their own CSS (TailwindCSS, Vanilla CSS, Styled Components, etc.).

---

## 🚀 1. The Strategy: Why Headless?

Enterprise developers face a common dilemma: they want the complex logic (keyboard navigation, focus traps, aria-state, form bindings) of a library but need it to look exactly like their company's custom design system. Standard themed components often require heavy CSS overrides (with `::ng-deep` or `!important`) which are fragile and hard to maintain.

A **headless** component separating **behavior & state** from **visual presentation** solves this:
- **Zero Default Styles**: No CSS classes, no inline styles, no default borders/colors.
- **Full Behavior**: Handles ARIA roles, states, keydown events, and `ControlValueAccessor` (Angular Forms).
- **Style Agnostic**: Consumers style the DOM elements directly using their utility classes (e.g. Tailwind) or custom CSS variables.

---

## 🛠️ 2. Architectural Patterns for Angular

We explore two primary patterns for headless components in Angular:

### Pattern A: Behavior-Only Directives (Recommended)
Expose attributes that can be applied to standard HTML tags. This mirrors the Radix UI or React Aria model.

**Usage:**
```html
<button
  ngxHeadlessSwitch
  [checked]="isActive"
  (checkedChange)="toggleActive($event)"
  class="w-11 h-6 bg-gray-200 rounded-full transition-colors relative focus:outline-none"
  [class.bg-blue-600]="isActive"
>
  <span 
    class="block w-4 h-4 bg-white rounded-full transition-transform"
    [class.translate-x-6]="isActive"
    [class.translate-x-1]="!isActive"
  ></span>
</button>
```

**Benefits:**
- Complete DOM freedom: Consumer controls the wrapper tag (`<button>`, `<div>`, etc.).
- Perfect integration with utility CSS (TailwindCSS) or custom markup structures.

---

### Pattern B: Unstyled Shell Components
Provide standard components that render a clean DOM structure but omit all visual styling from their `@Component` decorator.

**Usage:**
```html
<ngx-unstyled-dropdown [options]="items" [(value)]="selectedItem">
  <ng-template #trigger let-label="label">
    <button class="custom-trigger-class">{{ label }}</button>
  </ng-template>
</ngx-unstyled-dropdown>
```

**Benefits:**
- Easier to drop in for developers who still want component tags but prefer to style it via high-level CSS class selectors (e.g. `.ngx-unstyled-dropdown-popup`).

---

## 💻 3. Prototype: Headless Switch Directive

Here is a proposed implementation of `NgxHeadlessSwitchDirective` that provides:
1. ARIA attributes (`role="switch"`, `aria-checked`).
2. Keyboard handling (`Space` / `Enter` to toggle).
3. Focus management (`tabindex="0"`, focus state signaling).
4. Full Angular Form integration (`ControlValueAccessor`).

```typescript
import { Directive, Input, Output, EventEmitter, HostListener, HostBinding, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: '[ngxHeadlessSwitch]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NgxHeadlessSwitchDirective),
      multi: true
    }
  ]
})
export class NgxHeadlessSwitchDirective implements ControlValueAccessor {
  @Input() checked = false;
  @Input() disabled = false;
  @Output() checkedChange = new EventEmitter<boolean>();

  // ControlValueAccessor callbacks
  private onChange: (val: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  @HostBinding('attr.role') role = 'switch';
  @HostBinding('attr.tabindex') get tabIndex() { return this.disabled ? '-1' : '0'; }
  @HostBinding('attr.aria-checked') get ariaChecked() { return this.checked; }
  @HostBinding('attr.aria-disabled') get ariaDisabled() { return this.disabled ? 'true' : null; }

  @HostListener('click', ['$event'])
  onClick(event: Event) {
    event.preventDefault();
    this.toggle();
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.disabled) return;
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.toggle();
    }
  }

  @HostListener('blur')
  onBlur() {
    this.onTouched();
  }

  private toggle() {
    if (this.disabled) return;
    this.checked = !this.checked;
    this.checkedChange.emit(this.checked);
    this.onChange(this.checked);
  }

  // ControlValueAccessor implementation
  writeValue(value: boolean): void {
    this.checked = !!value;
  }

  registerOnChange(fn: (val: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
```

---

## 📈 4. Delivery Roadmap

1. **Phase 1: Foundation (Current)**
   - Create `ngx-core-components/unstyled` entry point.
   - Publish `NgxHeadlessSwitchDirective`, `NgxHeadlessDropdownDirective`, and `NgxHeadlessAccordionDirective`.
2. **Phase 2: Expand Scope**
   - Add state services for complex multi-part widgets (e.g. Headless Tab Strip, Headless Tree View).
3. **Phase 3: Community & Examples**
   - Provide a suite of TailwindCSS and CSS Modules examples in our documentation site.
