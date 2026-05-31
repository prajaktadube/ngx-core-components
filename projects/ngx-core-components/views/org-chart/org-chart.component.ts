import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

export interface OrgChartNode {
  id: string;
  label: string;
  title?: string;
  subtitle?: string;
  avatarUrl?: string;
  meta?: string;
  children?: OrgChartNode[];
}

@Component({
  selector: 'ngx-org-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ngx-org-chart" [class.compact]="compact()">
      @if (root()) {
        <ng-container *ngTemplateOutlet="nodeTemplate; context: { node: root(), level: 0 }"></ng-container>
      }
    </div>

    <ng-template #nodeTemplate let-node="node" let-level="level">
      <div class="org-node-wrap" [style.--level]="level">
        <button class="org-node" type="button" (click)="nodeSelected.emit(node)">
          @if (node.avatarUrl) {
            <img class="org-avatar" [src]="node.avatarUrl" [alt]="node.label" />
          } @else {
            <span class="org-avatar initials">{{ initials(node.label) }}</span>
          }
          <span class="org-copy">
            <strong>{{ node.label }}</strong>
            @if (node.title) { <span>{{ node.title }}</span> }
            @if (node.subtitle) { <small>{{ node.subtitle }}</small> }
            @if (node.meta) { <em>{{ node.meta }}</em> }
          </span>
        </button>

        @if (node.children?.length) {
          <div class="org-children">
            @for (child of node.children; track child.id) {
              <ng-container *ngTemplateOutlet="nodeTemplate; context: { node: child, level: level + 1 }"></ng-container>
            }
          </div>
        }
      </div>
    </ng-template>
  `,
  styles: [`
    :host { display: block; width: 100%; overflow: auto; }
    .ngx-org-chart { display: flex; justify-content: center; min-width: max-content; padding: 16px; font-family: var(--ngx-font-family, inherit); color: var(--text-primary, #111827); }
    .org-node-wrap { display: flex; flex-direction: column; align-items: center; position: relative; }
    .org-node { display: grid; grid-template-columns: 42px minmax(130px, 1fr); align-items: center; gap: 10px; min-width: 220px; max-width: 280px; border: 1px solid var(--border-color, #dbe3ee); border-radius: 8px; background: var(--bg-secondary, #ffffff); box-shadow: var(--shadow-sm, 0 1px 3px rgba(15,23,42,0.08)); color: inherit; cursor: pointer; font: inherit; padding: 10px; text-align: left; }
    .org-node:hover, .org-node:focus-visible { border-color: var(--primary-color, #4f46e5); box-shadow: 0 0 0 3px var(--primary-glow, rgba(79, 70, 229, 0.12)); outline: none; }
    .org-avatar { width: 42px; height: 42px; border-radius: 50%; object-fit: cover; background: var(--primary-color, #4f46e5); color: #fff; display: inline-flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; }
    .org-copy { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .org-copy strong, .org-copy span, .org-copy small, .org-copy em { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .org-copy strong { font-size: 13px; }
    .org-copy span { font-size: 12px; color: var(--text-secondary, #475569); }
    .org-copy small { font-size: 11px; color: var(--text-secondary, #64748b); }
    .org-copy em { font-size: 10px; color: var(--primary-color, #4f46e5); font-style: normal; font-weight: 700; }
    .org-children { display: flex; gap: 18px; justify-content: center; position: relative; padding-top: 26px; }
    .org-children::before { content: ''; position: absolute; top: 12px; left: 50%; width: 1px; height: 14px; background: var(--border-color, #cbd5e1); }
    .org-children > .org-node-wrap::before { content: ''; position: absolute; top: -14px; left: 50%; width: 1px; height: 14px; background: var(--border-color, #cbd5e1); }
    .compact .org-node { grid-template-columns: 32px minmax(100px, 1fr); min-width: 170px; padding: 8px; }
    .compact .org-avatar { width: 32px; height: 32px; font-size: 11px; }
    @media (max-width: 640px) {
      .ngx-org-chart { justify-content: flex-start; padding: 10px; }
      .org-children { gap: 10px; }
    }
  `]
})
export class OrgChartComponent {
  root = input<OrgChartNode | null>(null);
  compact = input(false);

  nodeSelected = output<OrgChartNode>();

  initials(label: string): string {
    return label
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase())
      .join('');
  }
}
