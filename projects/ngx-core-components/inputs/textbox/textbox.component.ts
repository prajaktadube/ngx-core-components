import {
  Component, ChangeDetectionStrategy, input, output, signal, computed
} from '@angular/core';

@Component({
  selector: 'ngx-textbox',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-textbox" [class.focused]="isFocused()" [class.has-error]="!!error()" [class.disabled]="disabled()">
      @if (label()) {
        <label class="ngx-textbox-label" [class.floating]="isFocused() || !!value()">{{ label() }}</label>
      }
      <div class="ngx-textbox-wrap">
        <input
          class="ngx-textbox-input"
          [type]="type()"
          [value]="value()"
          [placeholder]="isFocused() || !label() ? placeholder() : ''"
          [disabled]="disabled()"
          [readOnly]="readonly()"
          [attr.aria-invalid]="!!error()"
          (input)="onInput($event)"
          (focus)="onFocus()"
          (blur)="onBlur()"
        />
      </div>
      @if (error()) {
        <div class="ngx-textbox-error">{{ error() }}</div>
      } @else if (hint()) {
        <div class="ngx-textbox-hint">{{ hint() }}</div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .ngx-textbox { position: relative; font-family: inherit; }
    .ngx-textbox-label {
      display: block; font-size: 13px; color: var(--ngx-input-label, #6c757d);
      margin-bottom: 4px; font-weight: 500; transition: all 0.15s;
    }
    .ngx-textbox-wrap {
      position: relative;
      border: 1px solid var(--ngx-input-border, #ced4da);
      border-radius: var(--ngx-input-radius, 4px);
      background: var(--ngx-input-bg, #fff);
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .focused .ngx-textbox-wrap {
      border-color: var(--ngx-input-focus, #4a90d9);
      box-shadow: 0 0 0 2px rgba(74,144,217,0.18);
    }
    .has-error .ngx-textbox-wrap {
      border-color: var(--ngx-input-error, #e74c3c);
    }
    .has-error.focused .ngx-textbox-wrap {
      box-shadow: 0 0 0 2px rgba(231,76,60,0.18);
    }
    .disabled .ngx-textbox-wrap {
      background: var(--ngx-input-disabled-bg, #f8f9fa);
      cursor: not-allowed;
    }
    .ngx-textbox-input {
      display: block; width: 100%; padding: 8px 12px;
      border: none; outline: none; background: transparent;
      font-size: 14px; color: var(--ngx-input-text, #212529); font-family: inherit;
    }
    .ngx-textbox-input:disabled { cursor: not-allowed; color: #adb5bd; }
    .ngx-textbox-error { font-size: 12px; color: var(--ngx-input-error, #e74c3c); margin-top: 4px; }
    .ngx-textbox-hint { font-size: 12px; color: var(--ngx-input-label, #6c757d); margin-top: 4px; }
  `]
})
export class TextBoxComponent {
  value = input<string>('');
  label = input<string>('');
  placeholder = input<string>('');
  type = input<string>('text');
  disabled = input<boolean>(false);
  readonly = input<boolean>(false);
  error = input<string>('');
  hint = input<string>('');

  valueChange = output<string>();
  focusChange = output<boolean>();

  isFocused = signal(false);

  onInput(e: Event): void {
    this.valueChange.emit((e.target as HTMLInputElement).value);
  }

  onFocus(): void {
    this.isFocused.set(true);
    this.focusChange.emit(true);
  }

  onBlur(): void {
    this.isFocused.set(false);
    this.focusChange.emit(false);
  }
}
