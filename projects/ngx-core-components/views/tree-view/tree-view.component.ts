import {
  Component, ChangeDetectionStrategy, input, output, signal, computed
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

export interface TreeNode {
  id: string;
  label: string;
  icon?: string;
  children?: TreeNode[];
  hasChildren?: boolean;
  data?: unknown;
}

export interface TreeNodeEvent { node: TreeNode; }

@Component({
  selector: 'ngx-tree-view',
  standalone: true,
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-tree-view" role="tree" (keydown)="onKeyDown($event)" tabindex="0">
      @for (node of nodes(); track node.id) {
        <ng-container *ngTemplateOutlet="nodeTemplate; context: { node: node, depth: 0 }"/>
      }

      <ng-template #nodeTemplate let-node="node" let-depth="depth">
        <div
          class="tree-node"
          [style.padding-left.px]="depth * 20 + 8"
          [class.selected]="selectedId() === node.id"
          [class.focused]="focusedId() === node.id"
          role="treeitem"
          [attr.aria-expanded]="isExpanded(node.id)"
          [attr.aria-selected]="selectedId() === node.id"
          (click)="onNodeClick(node, $event)"
        >
          <!-- Expand/collapse -->
          @if (hasNodeChildren(node)) {
            <button
              class="tree-expand-btn"
              (click)="toggleExpand(node, $event)"
              [attr.aria-label]="isExpanded(node.id) ? 'Collapse' : 'Expand'"
            >
              <span class="expand-icon" [class.expanded]="isExpanded(node.id)">&#9658;</span>
            </button>
          } @else {
            <span class="tree-leaf-spacer"></span>
          }

          <!-- Checkbox -->
          @if (checkable()) {
            <input
              type="checkbox"
              class="tree-checkbox"
              [checked]="isChecked(node.id)"
              (change)="onCheck(node)"
              (click)="$event.stopPropagation()"
            />
          }

          <!-- Icon -->
          @if (node.icon) {
            <span class="tree-icon">{{ node.icon }}</span>
          }

          <!-- Label -->
          <span class="tree-label">{{ node.label }}</span>
        </div>

        <!-- Children -->
        @if (isExpanded(node.id) && node.children) {
          @for (child of node.children; track child.id) {
            <ng-container *ngTemplateOutlet="nodeTemplate; context: { node: child, depth: depth + 1 }"/>
          }
        }
      </ng-template>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .ngx-tree-view {
      background: var(--ngx-tree-bg, #fff); border: 1px solid var(--ngx-tree-border, #dee2e6);
      border-radius: var(--ngx-tree-radius, 4px); overflow-y: auto; font-family: inherit;
      outline: none;
    }
    .tree-node {
      display: flex; align-items: center; gap: 4px;
      height: 32px; cursor: pointer; user-select: none;
      border-radius: 3px; margin: 1px 4px;
      transition: background 0.1s;
    }
    .tree-node:hover { background: var(--ngx-tree-hover-bg, #f1f3f5); }
    .tree-node.selected { background: var(--ngx-tree-selected-bg, #e8f0fe); color: var(--ngx-tree-selected-color, #1a73e8); }
    .tree-node.focused { outline: 2px solid rgba(74,144,217,0.4); outline-offset: -1px; }
    .tree-expand-btn {
      width: 20px; height: 20px; background: none; border: none; cursor: pointer;
      padding: 0; display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; border-radius: 3px; color: var(--ngx-tree-text-secondary, #6c757d);
    }
    .tree-expand-btn:hover { background: var(--ngx-tree-border, #dee2e6); }
    .expand-icon { font-size: 9px; transition: transform 0.15s; display: inline-block; }
    .expand-icon.expanded { transform: rotate(90deg); }
    .tree-leaf-spacer { width: 20px; flex-shrink: 0; }
    .tree-checkbox { width: 14px; height: 14px; cursor: pointer; flex-shrink: 0; accent-color: #4a90d9; }
    .tree-icon { font-size: 14px; flex-shrink: 0; }
    .tree-label { font-size: 13px; color: var(--ngx-tree-text, #212529); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .selected .tree-label { color: var(--ngx-tree-selected-color, #1a73e8); font-weight: 500; }
  `]
})
export class TreeViewComponent {
  nodes = input<TreeNode[]>([]);
  selectable = input<boolean>(true);
  checkable = input<boolean>(false);
  selectedId = input<string | null>(null);
  expandedIds = input<string[]>([]);

  nodeSelect = output<TreeNodeEvent>();
  nodeExpand = output<TreeNodeEvent>();
  nodeCollapse = output<TreeNodeEvent>();
  checkChange = output<{ node: TreeNode; checked: boolean }>();

  private expandedSet = signal<Set<string>>(new Set());
  private checkedSet = signal<Set<string>>(new Set());
  focusedId = signal<string | null>(null);

  isExpanded(id: string): boolean { return this.expandedSet().has(id) || this.expandedIds().includes(id); }
  isChecked(id: string): boolean { return this.checkedSet().has(id); }
  hasNodeChildren(node: TreeNode): boolean { return !!(node.children?.length || node.hasChildren); }

  onNodeClick(node: TreeNode, e: MouseEvent): void {
    e.stopPropagation();
    this.focusedId.set(node.id);
    if (this.selectable()) this.nodeSelect.emit({ node });
    if (this.hasNodeChildren(node)) this.toggleExpand(node, e);
  }

  toggleExpand(node: TreeNode, e: MouseEvent): void {
    e.stopPropagation();
    const s = new Set(this.expandedSet());
    if (s.has(node.id)) {
      s.delete(node.id);
      this.nodeCollapse.emit({ node });
    } else {
      s.add(node.id);
      this.nodeExpand.emit({ node });
    }
    this.expandedSet.set(s);
  }

  onCheck(node: TreeNode): void {
    const s = new Set(this.checkedSet());
    const checked = !s.has(node.id);
    checked ? s.add(node.id) : s.delete(node.id);
    this.checkedSet.set(s);
    this.checkChange.emit({ node, checked });
  }

  onKeyDown(e: KeyboardEvent): void {
    const flat = this.flatVisibleIds();
    const cur = this.focusedId();
    const idx = flat.indexOf(cur ?? '');
    if (e.key === 'ArrowDown') { e.preventDefault(); if (idx < flat.length - 1) this.focusedId.set(flat[idx + 1]); }
    if (e.key === 'ArrowUp') { e.preventDefault(); if (idx > 0) this.focusedId.set(flat[idx - 1]); }
    if (e.key === 'Enter' || e.key === ' ') {
      if (cur) {
        const node = this.findNode(cur, this.nodes());
        if (node) this.nodeSelect.emit({ node });
      }
    }
  }

  private flatVisibleIds(): string[] {
    const ids: string[] = [];
    const collect = (nodes: TreeNode[]) => {
      for (const n of nodes) {
        ids.push(n.id);
        if (this.isExpanded(n.id) && n.children) collect(n.children);
      }
    };
    collect(this.nodes());
    return ids;
  }

  private findNode(id: string, nodes: TreeNode[]): TreeNode | null {
    for (const n of nodes) {
      if (n.id === id) return n;
      if (n.children) { const found = this.findNode(id, n.children); if (found) return found; }
    }
    return null;
  }
}
