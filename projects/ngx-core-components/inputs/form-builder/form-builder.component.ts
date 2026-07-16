import { CommonModule } from '@angular/common';
import { Component, computed, effect, input, output, signal } from '@angular/core';

export interface FormBuilderOption {
  label: string;
  value: string | number | boolean;
}

export interface FormBuilderField {
  key: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'date';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: FormBuilderOption[];
  value?: unknown;
  min?: number | string;
  max?: number | string;
  step?: number;
}

@Component({
  selector: 'ngx-form-builder',
  standalone: true,
  imports: [CommonModule],
  template: `
    <form class="ngx-form-builder" (submit)="submit($event)">
      @for (field of fields(); track field.key) {
        <label class="form-field" [class.checkbox-field]="field.type === 'checkbox'">
          @if (field.type !== 'checkbox') {
            <span class="field-label">{{ field.label }}@if (field.required) { <strong>*</strong> }</span>
          }

          @switch (field.type || 'text') {
            @case ('textarea') {
              <textarea
                [placeholder]="field.placeholder || ''"
                [required]="field.required || false"
                [disabled]="field.disabled || false"
                [value]="valueFor(field.key)"
                (input)="updateValue(field.key, $any($event.target).value)"
              ></textarea>
            }
            @case ('select') {
              <select
                [required]="field.required || false"
                [disabled]="field.disabled || false"
                [value]="valueFor(field.key)"
                (change)="updateValue(field.key, readOptionValue(field, $any($event.target).value))"
              >
                <option value="">Select...</option>
                @for (option of field.options || []; track option.value) {
                  <option [value]="option.value">{{ option.label }}</option>
                }
              </select>
            }
            @case ('checkbox') {
              <input
                type="checkbox"
                [checked]="!!valueFor(field.key)"
                [required]="field.required || false"
                [disabled]="field.disabled || false"
                (change)="updateValue(field.key, $any($event.target).checked)"
              />
              <span class="field-label">{{ field.label }}@if (field.required) { <strong>*</strong> }</span>
            }
            @default {
              <input
                [type]="field.type || 'text'"
                [placeholder]="field.placeholder || ''"
                [required]="field.required || false"
                [disabled]="field.disabled || false"
                [min]="field.min ?? null"
                [max]="field.max ?? null"
                [step]="field.step ?? null"
                [value]="valueFor(field.key)"
                (input)="updateValue(field.key, coerceInputValue(field, $any($event.target).value))"
              />
            }
          }
        </label>
      }

      @if (showSubmit()) {
        <div class="form-actions">
          <button type="submit">{{ submitLabel() }}</button>
        </div>
      }
    </form>
  `,
  styles: [`
    :host { display: block; }
    .ngx-form-builder { display: grid; gap: 14px; font-family: var(--ngx-font-family, inherit); color: var(--text-primary, #0f172a); }
    .form-field { display: grid; gap: 6px; }
    .checkbox-field { display: flex; align-items: center; gap: 8px; }
    .field-label { font-size: 12px; font-weight: 700; color: var(--ngx-input-label, #475569); }
    .field-label strong { color: var(--ngx-input-error, #dc2626); margin-left: 2px; }
    input:not([type="checkbox"]), textarea, select { width: 100%; border: 1px solid var(--ngx-input-border, #cbd5e1); border-radius: var(--ngx-input-radius, 8px); background: var(--ngx-input-bg, #ffffff); color: var(--ngx-input-text, #0f172a); font: inherit; font-size: 13px; padding: 9px 11px; outline: none; transition: all 0.15s; }
    textarea { min-height: 96px; resize: vertical; }
    input:focus, textarea:focus, select:focus { border-color: var(--primary-color, #4f46e5); box-shadow: 0 0 0 3px var(--primary-glow, rgba(79,70,229,0.12)); }
    input:disabled, textarea:disabled, select:disabled { background: var(--ngx-input-disabled-bg, #f8fafc); color: var(--text-secondary, #64748b); cursor: not-allowed; }
    input[type="checkbox"] { width: 16px; height: 16px; accent-color: var(--primary-color, #4f46e5); }
    .form-actions { display: flex; justify-content: flex-end; }
    .form-actions button { border: 0; border-radius: 7px; background: var(--primary-color, #4f46e5); color: #fff; cursor: pointer; font: inherit; font-size: 13px; font-weight: 750; padding: 9px 14px; }
    .form-actions button:hover, .form-actions button:focus-visible { background: var(--primary-hover, #4338ca); outline: none; }
  `]
})
export class FormBuilderComponent {
  /**
   * The schema definition list of form fields to render dynamically.
   */
  fields = input<FormBuilderField[]>([]);

  /**
   * The initial/controlled form value dictionary mapping field keys to values.
   */
  value = input<Record<string, unknown>>({});

  /**
   * Whether to render the default form submit button at the bottom.
   * @default true
   */
  showSubmit = input(true);

  /**
   * The text label to display on the default form submit button.
   * @default 'Submit'
   */
  submitLabel = input('Submit');

  /**
   * Emits when any field value in the form changes.
   */
  valueChange = output<Record<string, unknown>>();

  /**
   * Emits the entire form value dictionary when the form is submitted successfully.
   */
  formSubmit = output<Record<string, unknown>>();

  formValue = signal<Record<string, unknown>>({});

  private syncValue = effect(() => {
    const fromFields = this.fields().reduce<Record<string, unknown>>((acc, field) => {
      if (field.value !== undefined) acc[field.key] = field.value;
      return acc;
    }, {});
    this.formValue.set({ ...fromFields, ...this.value() });
  });

  filledValue = computed(() => this.formValue());

  valueFor(key: string): unknown {
    return this.filledValue()[key] ?? '';
  }

  updateValue(key: string, value: unknown): void {
    const next = { ...this.formValue(), [key]: value };
    this.formValue.set(next);
    this.valueChange.emit(next);
  }

  submit(event: SubmitEvent): void {
    event.preventDefault();
    this.formSubmit.emit(this.formValue());
  }

  coerceInputValue(field: FormBuilderField, value: string): unknown {
    return field.type === 'number' ? (value === '' ? null : Number(value)) : value;
  }

  readOptionValue(field: FormBuilderField, rawValue: string): unknown {
    return field.options?.find(option => String(option.value) === rawValue)?.value ?? rawValue;
  }
}
