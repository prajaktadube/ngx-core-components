import { CommonModule } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

@Component({
  selector: 'ngx-json-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ngx-json-viewer">
      <ng-container *ngTemplateOutlet="valueTemplate; context: { key: rootName(), value: data(), path: '$', depth: 0 }"></ng-container>
    </div>

    <ng-template #valueTemplate let-key="key" let-value="value" let-path="path" let-depth="depth">
      <div class="json-row" [style.padding-left.px]="depth * 16">
        @if (isExpandable(value)) {
          <button class="toggle" type="button" (click)="toggle(path)">
            {{ isExpanded(path, depth) ? '-' : '+' }}
          </button>
        } @else {
          <span class="toggle-spacer"></span>
        }

        <span class="json-key">{{ key }}</span>
        <span class="colon">:</span>

        @if (isExpandable(value)) {
          <span class="json-summary">{{ summary(value) }}</span>
        } @else {
          <span class="json-value" [class.string]="isString(value)" [class.nullish]="value === null">{{ formatPrimitive(value) }}</span>
        }
      </div>

      @if (isExpandable(value) && isExpanded(path, depth)) {
        @for (childKey of objectKeys(value); track childKey) {
          <ng-container *ngTemplateOutlet="valueTemplate; context: { key: childKey, value: childValue(value, childKey), path: path + '.' + childKey, depth: depth + 1 }"></ng-container>
        }
      }
    </ng-template>
  `,
  styles: [`
    :host { display: block; }
    .ngx-json-viewer { padding: 10px; border: 1px solid var(--border-color, #dbe3ee); border-radius: 8px; background: var(--bg-secondary, #ffffff); color: var(--text-primary, #0f172a); font-family: var(--ngx-monospace-font-family, 'Cascadia Code', Consolas, monospace); font-size: 12px; overflow: auto; }
    .json-row { display: flex; align-items: center; min-height: 24px; gap: 5px; white-space: nowrap; }
    .toggle, .toggle-spacer { width: 18px; height: 18px; flex: 0 0 18px; }
    .toggle { display: inline-flex; align-items: center; justify-content: center; border: 1px solid var(--border-color, #dbe3ee); border-radius: 4px; background: var(--border-light, #f8fafc); color: var(--text-secondary, #475569); cursor: pointer; font: inherit; line-height: 1; }
    .toggle:hover, .toggle:focus-visible { border-color: var(--primary-color, #4f46e5); outline: none; }
    .json-key { color: var(--ngx-json-key, #7c3aed); font-weight: 700; }
    .colon { color: var(--text-secondary, #64748b); }
    .json-summary { color: var(--text-secondary, #64748b); }
    .json-value { color: var(--ngx-json-number, #0f766e); }
    .json-value.string { color: var(--ngx-json-string, #b45309); }
    .json-value.nullish { color: var(--ngx-json-null, #64748b); font-style: italic; }
  `]
})
export class JsonViewerComponent {
  data = input<JsonValue | unknown>(null);
  rootName = input('root');
  expandedDepth = input(1);

  private toggled = signal<Record<string, boolean>>({});
  private expandedDefaults = computed(() => Math.max(0, this.expandedDepth()));

  toggle(path: string): void {
    this.toggled.update(state => ({ ...state, [path]: !this.isExpanded(path, path.split('.').length - 1) }));
  }

  isExpanded(path: string, depth: number): boolean {
    const explicit = this.toggled()[path];
    if (explicit !== undefined) return explicit;
    return depth < this.expandedDefaults();
  }

  isExpandable(value: unknown): boolean {
    return value !== null && typeof value === 'object';
  }

  isString(value: unknown): boolean {
    return typeof value === 'string';
  }

  objectKeys(value: unknown): string[] {
    if (Array.isArray(value)) return value.map((_, index) => String(index));
    if (value && typeof value === 'object') return Object.keys(value as Record<string, unknown>);
    return [];
  }

  childValue(value: unknown, key: string): unknown {
    return Array.isArray(value) ? value[Number(key)] : (value as Record<string, unknown>)?.[key];
  }

  summary(value: unknown): string {
    if (Array.isArray(value)) return `Array(${value.length})`;
    return `Object(${Object.keys(value as Record<string, unknown>).length})`;
  }

  formatPrimitive(value: unknown): string {
    if (typeof value === 'string') return `"${value}"`;
    if (value === null) return 'null';
    return String(value);
  }
}
