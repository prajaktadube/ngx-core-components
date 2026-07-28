import { CommonModule } from '@angular/common';
import { Component, computed, effect, input, output, signal } from '@angular/core';

export interface FormBuilderOption {
  label: string;
  value: string | number | boolean;
}

export interface FormBuilderCondition {
  field: string;
  operator: 'eq' | 'neq' | 'contains' | 'gt' | 'lt' | 'isTrue' | 'isFalse';
  value?: unknown;
  action: 'show' | 'hide' | 'enable' | 'disable';
}

export interface FormBuilderField {
  key: string;
  label: string;
  type?:
    | 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox'
    | 'date' | 'date-range' | 'time' | 'file-upload' | 'multi-select' | 'rating'
    | 'color-picker' | 'switch' | 'segmented-control' | 'signature-pad' | 'slider' | 'range'
    | 'autocomplete' | 'tag-input';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: FormBuilderOption[];
  value?: unknown;
  min?: number | string;
  max?: number | string;
  step?: number;
  colSpan?: number; // 1 to 12 column span
  conditions?: FormBuilderCondition[];
  hint?: string;
}

@Component({
  selector: 'ngx-form-builder',
  standalone: true,
  imports: [CommonModule],
  template: `
    <form class="ngx-form-builder" (submit)="submit($event)">
      <div class="form-grid">
        @for (field of visibleFields(); track field.key) {
          <div
            class="form-field-wrap"
            [style.grid-column]="'span ' + (field.colSpan || 12)"
            [class.checkbox-field]="field.type === 'checkbox'"
          >
            @if (field.type !== 'checkbox') {
              <label class="field-label" [attr.for]="field.key">
                {{ field.label }}@if (field.required) { <strong class="req-star">*</strong> }
              </label>
            }

            @switch (field.type || 'text') {
              @case ('textarea') {
                <textarea
                  [id]="field.key"
                  [placeholder]="field.placeholder || ''"
                  [required]="field.required || false"
                  [disabled]="isFieldDisabled(field)"
                  [value]="valueFor(field.key)"
                  (input)="updateValue(field.key, $any($event.target).value)"
                ></textarea>
              }
              @case ('select') {
                <select
                  [id]="field.key"
                  [required]="field.required || false"
                  [disabled]="isFieldDisabled(field)"
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
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    [id]="field.key"
                    [checked]="!!valueFor(field.key)"
                    [required]="field.required || false"
                    [disabled]="isFieldDisabled(field)"
                    (change)="updateValue(field.key, $any($event.target).checked)"
                  />
                  <span class="field-label">{{ field.label }}@if (field.required) { <strong class="req-star">*</strong> }</span>
                </label>
              }
              @case ('switch') {
                <label class="switch-wrap">
                  <input
                    type="checkbox"
                    [id]="field.key"
                    [checked]="!!valueFor(field.key)"
                    [disabled]="isFieldDisabled(field)"
                    (change)="updateValue(field.key, $any($event.target).checked)"
                  />
                  <span class="switch-slider"></span>
                  <span class="field-label">{{ field.label }}</span>
                </label>
              }
              @case ('range') {
              }
              @case ('color-picker') {
                <input
                  type="color"
                  [id]="field.key"
                  [value]="valueFor(field.key) || '#4f46e5'"
                  [disabled]="isFieldDisabled(field)"
                  (change)="updateValue(field.key, $any($event.target).value)"
                />
              }
              @default {
                <input
                  [id]="field.key"
                  [type]="field.type || 'text'"
                  [placeholder]="field.placeholder || ''"
                  [required]="field.required || false"
                  [disabled]="isFieldDisabled(field)"
                  [min]="field.min ?? null"
                  [max]="field.max ?? null"
                  [step]="field.step ?? null"
                  [value]="valueFor(field.key)"
                  (input)="updateValue(field.key, coerceInputValue(field, $any($event.target).value))"
                />
              }
            }

            @if (field.hint) {
              <div class="field-hint">{{ field.hint }}</div>
            }
          </div>
        }
      </div>

      @if (showSubmit()) {
        <div class="form-actions">
          <button type="submit" class="submit-btn">{{ submitLabel() }}</button>
        </div>
      }
    </form>
  `,
  styles: [`
    :host { display: block; }
    .ngx-form-builder { font-family: var(--ngx-font-family, inherit); color: var(--text-primary, #0f172a); }
    .form-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 14px; }
    .form-field-wrap { display: flex; flex-direction: column; gap: 6px; }
    .field-label { font-size: 12px; font-weight: 700; color: var(--ngx-input-label, #475569); }
    .req-star { color: var(--ngx-input-error, #dc2626); margin-left: 2px; }
    .checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; }
    .field-hint { font-size: 11px; color: #64748b; }
    input:not([type="checkbox"]):not([type="color"]), textarea, select {
      width: 100%; border: 1px solid var(--ngx-input-border, #cbd5e1);
      border-radius: var(--ngx-input-radius, 8px); background: var(--ngx-input-bg, #ffffff);
      color: var(--ngx-input-text, #0f172a); font: inherit; font-size: 13px; padding: 9px 11px;
      outline: none; transition: all 0.15s;
    }
    input:focus, textarea:focus, select:focus {
      border-color: var(--ngx-input-focus, #4f46e5);
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
    }
    textarea { min-height: 80px; resize: vertical; }
    .form-actions { margin-top: 18px; display: flex; justify-content: flex-end; }
    .submit-btn {
      padding: 9px 20px; font-size: 13px; font-weight: 700; border-radius: 8px;
      border: none; background: var(--ngx-btn-primary-bg, #4f46e5); color: #ffffff;
      cursor: pointer; transition: all 0.2s;
    }
    .submit-btn:hover { background: var(--ngx-btn-primary-hover, #4338ca); }

    /* Switch styling */
    .switch-wrap { display: flex; align-items: center; gap: 10px; cursor: pointer; }
    .switch-wrap input { display: none; }
    .switch-slider {
      width: 36px; height: 20px; background: #cbd5e1; border-radius: 20px;
      position: relative; transition: background 0.2s;
    }
    .switch-slider::before {
      content: ''; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px;
      background: #ffffff; border-radius: 50%; transition: transform 0.2s;
    }
    .switch-wrap input:checked + .switch-slider { background: #4f46e5; }
    .switch-wrap input:checked + .switch-slider::before { transform: translateX(16px); }
  `]
})
export class FormBuilderComponent {
  fields = input<FormBuilderField[]>([]);
  value = input<Record<string, unknown>>({});
  submitLabel = input<string>('Submit');
  showSubmit = input<boolean>(true);

  formSubmit = output<Record<string, unknown>>();
  formChange = output<Record<string, unknown>>();

  private formState = signal<Record<string, unknown>>({});

  visibleFields = computed(() => {
    const allFields = this.fields();
    const state = this.formState();

    return allFields.filter(f => {
      if (!f.conditions || f.conditions.length === 0) return true;
      for (const cond of f.conditions) {
        const val = state[cond.field];
        const match = this.evaluateCondition(val, cond);
        if (cond.action === 'hide' && match) return false;
        if (cond.action === 'show' && !match) return false;
      }
      return true;
    });
  });

  constructor() {
    effect(() => {
      const initial = this.value() || {};
      const fields = this.fields();
      const next: Record<string, unknown> = { ...initial };

      fields.forEach(f => {
        if (next[f.key] === undefined && f.value !== undefined) {
          next[f.key] = f.value;
        }
      });

      this.formState.set(next);
    }, { allowSignalWrites: true });
  }

  valueFor(key: string): unknown {
    const val = this.formState()[key];
    return val ?? '';
  }

  isFieldDisabled(field: FormBuilderField): boolean {
    if (field.disabled) return true;
    if (!field.conditions) return false;

    const state = this.formState();
    for (const cond of field.conditions) {
      const val = state[cond.field];
      const match = this.evaluateCondition(val, cond);
      if (cond.action === 'disable' && match) return true;
      if (cond.action === 'enable' && !match) return true;
    }
    return false;
  }

  updateValue(key: string, val: unknown): void {
    const updated = { ...this.formState(), [key]: val };
    this.formState.set(updated);
    this.formChange.emit(updated);
  }

  submit(event: Event): void {
    event.preventDefault();
    this.formSubmit.emit(this.formState());
  }

  coerceInputValue(field: FormBuilderField, val: string): unknown {
    if (field.type === 'number') {
      if (val === '') return null;
      const num = Number(val);
      return isNaN(num) ? null : num;
    }
    return val;
  }

  readOptionValue(field: FormBuilderField, valStr: string): unknown {
    const opt = field.options?.find(o => String(o.value) === valStr);
    return opt ? opt.value : valStr;
  }

  private evaluateCondition(actualVal: unknown, cond: FormBuilderCondition): boolean {
    switch (cond.operator) {
      case 'eq':
        return String(actualVal) === String(cond.value);
      case 'neq':
        return String(actualVal) !== String(cond.value);
      case 'contains':
        return String(actualVal || '').toLowerCase().includes(String(cond.value || '').toLowerCase());
      case 'gt':
        return Number(actualVal) > Number(cond.value);
      case 'lt':
        return Number(actualVal) < Number(cond.value);
      case 'isTrue':
        return actualVal === true || String(actualVal) === 'true';
      case 'isFalse':
        return actualVal === false || String(actualVal) === 'false';
      default:
        return false;
    }
  }
}
