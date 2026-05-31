import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'ngx-tag-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="ngx-tag-input"
      [class.dark]="theme() === 'dark'"
      [class.disabled]="disabled()"
      [class.focused]="isFocused()"
      (click)="focusInput()"
    >
      <!-- Existing chips -->
      @for (tag of internalTags(); track tag + $index) {
        <span class="ngx-tag-chip">
          <span class="ngx-tag-chip__label">{{ tag }}</span>
          @if (!disabled()) {
            <button
              type="button"
              class="ngx-tag-chip__remove"
              (click)="removeTag(tag, $event)"
              [attr.aria-label]="'Remove ' + tag"
            >✕</button>
          }
        </span>
      }

      <!-- Text input -->
      @if (!isAtMax()) {
        <input
          #tagInput
          class="ngx-tag-input__field"
          type="text"
          [placeholder]="internalTags().length === 0 ? placeholder() : ''"
          [disabled]="disabled()"
          [(ngModel)]="inputValue"
          (keydown)="onKeydown($event)"
          (focus)="isFocused.set(true)"
          (blur)="onBlur()"
        />
      }

      <!-- Max tags hint -->
      @if (isAtMax() && !disabled()) {
        <span class="ngx-tag-input__max-hint">Max {{ maxTags() }} tags</span>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    /* ── Container ── */
    .ngx-tag-input {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      min-height: 44px;
      border-radius: 10px;
      border: 1.5px solid var(--ngx-tag-border, hsl(220, 15%, 82%));
      background: var(--ngx-tag-bg, #ffffff);
      font-family: var(--ngx-font-family, system-ui, sans-serif);
      cursor: text;
      transition:
        border-color 0.18s ease,
        box-shadow 0.18s ease;
    }

    .ngx-tag-input.focused {
      border-color: var(--ngx-tag-focus-border, hsl(250, 70%, 58%));
      box-shadow: 0 0 0 3px var(--primary-glow, rgba(124, 95, 240, 0.15));
      outline: none;
    }

    .ngx-tag-input.disabled {
      background: var(--ngx-tag-disabled-bg, hsl(220, 15%, 97%));
      border-color: var(--ngx-tag-disabled-border, hsl(220, 10%, 88%));
      cursor: not-allowed;
      opacity: 0.72;
    }

    /* ── Dark mode ── */
    .ngx-tag-input.dark {
      background: var(--ngx-tag-dark-bg, hsl(225, 20%, 14%));
      border-color: var(--ngx-tag-dark-border, hsl(225, 15%, 28%));
    }
    .ngx-tag-input.dark.focused {
      border-color: var(--ngx-tag-focus-border, hsl(250, 65%, 65%));
      box-shadow: 0 0 0 3px rgba(124, 95, 240, 0.22);
    }
    .ngx-tag-input.dark.disabled {
      background: hsl(225, 18%, 10%);
      border-color: hsl(225, 12%, 22%);
    }

    /* ── Chips ── */
    .ngx-tag-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px 3px 10px;
      background: var(--ngx-tag-chip-bg, hsl(250, 65%, 94%));
      color: var(--ngx-tag-chip-color, hsl(250, 55%, 38%));
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
      border: 1px solid var(--ngx-tag-chip-border, hsl(250, 55%, 85%));
      transition: background 0.15s ease, border-color 0.15s ease;
      animation: chip-pop 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .dark .ngx-tag-chip {
      background: var(--ngx-tag-chip-dark-bg, hsl(250, 45%, 20%));
      color: var(--ngx-tag-chip-dark-color, hsl(250, 75%, 80%));
      border-color: hsl(250, 45%, 30%);
    }

    @keyframes chip-pop {
      from { transform: scale(0.7); opacity: 0; }
      to   { transform: scale(1);   opacity: 1; }
    }

    .ngx-tag-chip__label {
      max-width: 160px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ngx-tag-chip__remove {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      padding: 0;
      background: transparent;
      border: none;
      border-radius: 50%;
      color: inherit;
      font-size: 9px;
      line-height: 1;
      cursor: pointer;
      opacity: 0.5;
      transition: opacity 0.12s ease, background 0.12s ease;
      flex-shrink: 0;
    }
    .ngx-tag-chip__remove:hover {
      opacity: 1;
      background: rgba(0, 0, 0, 0.1);
    }
    .dark .ngx-tag-chip__remove:hover {
      background: rgba(255, 255, 255, 0.12);
    }

    /* ── Text input field ── */
    .ngx-tag-input__field {
      flex: 1;
      min-width: 100px;
      border: none;
      outline: none;
      background: transparent;
      font-size: 13px;
      font-family: inherit;
      color: var(--ngx-tag-input-color, hsl(220, 20%, 18%));
      padding: 2px 0;
    }
    .ngx-tag-input__field::placeholder {
      color: var(--ngx-tag-placeholder-color, hsl(220, 12%, 65%));
    }
    .ngx-tag-input__field:disabled {
      cursor: not-allowed;
    }
    .dark .ngx-tag-input__field {
      color: var(--ngx-tag-input-dark-color, hsl(220, 15%, 88%));
    }
    .dark .ngx-tag-input__field::placeholder {
      color: hsl(220, 12%, 48%);
    }

    /* ── Max tags hint ── */
    .ngx-tag-input__max-hint {
      font-size: 11px;
      font-style: italic;
      color: hsl(220, 10%, 58%);
      padding: 2px 4px;
      align-self: center;
    }
    .dark .ngx-tag-input__max-hint {
      color: hsl(220, 10%, 48%);
    }
  `],
})
export class TagInputComponent {
  // ── Inputs ──
  tags            = input<string[]>([]);
  placeholder     = input<string>('Add tag...');
  maxTags         = input<number>(20);
  allowDuplicates = input<boolean>(false);
  disabled        = input<boolean>(false);
  theme           = input<'light' | 'dark'>('light');

  // ── Outputs ──
  tagsChange  = output<string[]>();
  tagAdded    = output<string>();
  tagRemoved  = output<string>();

  // ── Internal state ──
  internalTags = signal<string[]>([]);
  isFocused    = signal<boolean>(false);
  inputValue   = '';

  isAtMax = computed(() => this.internalTags().length >= this.maxTags());

  /** Native input element reference (grabbed via ViewChild-less approach via the template variable). */
  private _inputEl: HTMLInputElement | null = null;

  focusInput(): void {
    if (this.disabled() || this.isAtMax()) return;
    // Query the rendered input inside the host
    const input = document.querySelector('ngx-tag-input .ngx-tag-input__field') as HTMLInputElement;
    input?.focus();
  }

  onKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;

    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.commitTag();
    } else if (event.key === 'Backspace' && !this.inputValue) {
      // Remove last tag on backspace when input is empty
      const tags = this.internalTags();
      if (tags.length > 0) {
        this.removeTag(tags[tags.length - 1]);
      }
    }
  }

  onBlur(): void {
    this.isFocused.set(false);
    // Commit any pending text on blur
    if (this.inputValue.trim()) {
      this.commitTag();
    }
  }

  private commitTag(): void {
    const raw = this.inputValue.replace(/,/g, '').trim();
    if (!raw) return;
    if (this.isAtMax()) return;
    if (!this.allowDuplicates() && this.internalTags().includes(raw)) {
      this.inputValue = '';
      return;
    }

    const newTags = [...this.internalTags(), raw];
    this.internalTags.set(newTags);
    this.inputValue = '';
    this.tagsChange.emit(newTags);
    this.tagAdded.emit(raw);
  }

  removeTag(tag: string, event?: MouseEvent): void {
    event?.stopPropagation();
    const newTags = this.internalTags().filter(t => t !== tag);
    this.internalTags.set(newTags);
    this.tagsChange.emit(newTags);
    this.tagRemoved.emit(tag);
  }
}
