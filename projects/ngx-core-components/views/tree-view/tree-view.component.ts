import {
  Component, ChangeDetectionStrategy, input, output, signal, computed, OnInit
} from '@angular/core';
import { NgTemplateOutlet, CommonModule } from '@angular/common';

export interface TreeNode {
  id: string;
  label: string;
  icon?: string;
  children?: TreeNode[];
  hasChildren?: boolean;
  disabled?: boolean;
  data?: unknown;
}

export interface TreeNodeEvent { node: TreeNode; }

@Component({
  selector: 'ngx-tree-view',
  standalone: true,
  imports: [CommonModule, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-tree-wrapper" [class.dark]="theme() === 'dark'">
      <!-- Search Panel -->
      @if (showSearch()) {
        <div class="tree-search-bar">
          <input
            type="text"
            class="tree-search-input"
            [placeholder]="searchPlaceholder()"
            [value]="searchQuery()"
            (input)="onSearchInput($event)"
          />
          @if (searchQuery()) {
            <button class="tree-clear-btn" (click)="clearSearch()">✕</button>
          }
        </div>
      }

      <!-- Tree Nodes Scroll Container -->
      <div class="ngx-tree-view" role="tree" (keydown)="onKeyDown($event)" tabindex="0">
        @for (node of filteredNodes(); track node.id) {
          <ng-container *ngTemplateOutlet="nodeTemplate; context: { node: node, depth: 0 }"/>
        }

        <ng-template #nodeTemplate let-node="node" let-depth="depth">
          <div
            class="tree-node"
            [class.selected]="selectedId() === node.id"
            [class.focused]="focusedId() === node.id"
            [class.disabled]="node.disabled"
            role="treeitem"
            [attr.aria-expanded]="isExpanded(node.id)"
            [attr.aria-selected]="selectedId() === node.id"
            [attr.aria-disabled]="node.disabled || null"
            (click)="!node.disabled && onNodeClick(node, $event)"
          >
            <!-- Expand/collapse -->
            @if (hasNodeChildren(node)) {
              <button
                class="tree-expand-btn"
                (click)="toggleExpand(node, $event)"
                [attr.aria-label]="isExpanded(node.id) ? 'Collapse' : 'Expand'"
              >
                <span class="expand-icon" [class.expanded]="isExpanded(node.id)">&#9654;</span>
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
                [indeterminate]="isIndeterminate(node.id)"
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

            <!-- Inline Hover Actions -->
            @if (showActions() && !node.disabled) {
              <div class="tree-node-actions" (click)="$event.stopPropagation()">
                <button class="action-btn add" (click)="onAction(node, 'add')" title="Add Subnode">➕</button>
                <button class="action-btn edit" (click)="onAction(node, 'edit')" title="Edit Node">✏️</button>
                <button class="action-btn delete" (click)="onAction(node, 'delete')" title="Delete Node">🗑️</button>
              </div>
            }
          </div>

          <!-- Nested Children with गाइड Lines -->
          @if (isExpanded(node.id) && node.children) {
            <div class="tree-node-children-group">
              @for (child of node.children; track child.id) {
                <ng-container *ngTemplateOutlet="nodeTemplate; context: { node: child, depth: depth + 1 }"/>
              }
            </div>
          }
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .ngx-tree-wrapper {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
    }

    /* Search Bar Input */
    .tree-search-bar {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }
    .tree-search-input {
      width: 100%;
      padding: 8px 32px 8px 12px;
      font-size: 13px;
      border: 1px solid var(--border-color, #cbd5e1);
      border-radius: 8px;
      outline: none;
      background: var(--bg-secondary, #ffffff);
      color: var(--text-primary, #0f172a);
      transition: all 0.2s ease;
    }
    .tree-search-input:focus {
      border-color: var(--primary-color, #4f46e5);
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
    }
    .tree-clear-btn {
      position: absolute;
      right: 10px;
      background: none;
      border: none;
      cursor: pointer;
      color: #94a3b8;
      font-size: 11px;
      padding: 4px;
    }
    .tree-clear-btn:hover {
      color: #64748b;
    }

    /* Tree View Main Container */
    .ngx-tree-view {
      background: var(--bg-primary, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 12px;
      padding: 8px;
      overflow-y: auto;
      max-height: 480px;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
      outline: none;
    }

    .dark .ngx-tree-view {
      background: var(--bg-secondary, #1e293b);
      border-color: rgba(255, 255, 255, 0.08);
    }

    /* Tree Node Item Row */
    .tree-node {
      display: flex;
      align-items: center;
      gap: 6px;
      height: 34px;
      padding: 0 8px;
      cursor: pointer;
      user-select: none;
      border-radius: 8px;
      margin: 1px 0;
      transition: background 0.15s ease, color 0.15s ease;
      position: relative;
    }
    .tree-node:hover {
      background: rgba(15, 23, 42, 0.04);
    }
    .dark .tree-node:hover {
      background: rgba(255, 255, 255, 0.04);
    }

    .tree-node.selected {
      background: rgba(79, 70, 229, 0.08);
      color: var(--primary-color, #4f46e5);
    }
    .dark .tree-node.selected {
      background: rgba(99, 102, 241, 0.16);
      color: #818cf8;
    }

    .tree-node.focused {
      box-shadow: inset 0 0 0 1.5px var(--primary-color, #4f46e5);
    }
    .tree-node.disabled {
      opacity: 0.45;
      cursor: not-allowed;
      pointer-events: none;
    }

    /* Expand button */
    .tree-expand-btn {
      width: 20px;
      height: 20px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      border-radius: 4px;
      color: #94a3b8;
      transition: background 0.15s;
    }
    .tree-expand-btn:hover {
      background: rgba(15, 23, 42, 0.08);
      color: #475569;
    }
    .dark .tree-expand-btn:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #cbd5e1;
    }
    .expand-icon {
      font-size: 8px;
      transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
      display: inline-block;
    }
    .expand-icon.expanded {
      transform: rotate(90deg);
    }

    .tree-leaf-spacer {
      width: 20px;
      flex-shrink: 0;
    }

    /* Tri-state Checkbox */
    .tree-checkbox {
      width: 14px;
      height: 14px;
      cursor: pointer;
      flex-shrink: 0;
      accent-color: var(--primary-color, #4f46e5);
      border-radius: 4px;
    }

    .tree-icon {
      font-size: 14px;
      flex-shrink: 0;
    }

    .tree-label {
      font-size: 13px;
      color: var(--text-primary, #1e293b);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
    }
    .selected .tree-label {
      font-weight: 600;
    }
    .dark .tree-label {
      color: #cbd5e1;
    }

    /* Inline action buttons */
    .tree-node-actions {
      display: none;
      align-items: center;
      gap: 4px;
      margin-left: auto;
      padding-left: 8px;
    }
    .tree-node:hover .tree-node-actions {
      display: flex;
    }
    .action-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 10px;
      padding: 4px;
      border-radius: 4px;
      transition: all 0.15s;
      opacity: 0.65;
    }
    .action-btn:hover {
      opacity: 1;
      background: rgba(15, 23, 42, 0.08);
    }
    .dark .action-btn:hover {
      background: rgba(255, 255, 255, 0.08);
    }

    /* Nesting Guide Lines */
    .tree-node-children-group {
      position: relative;
      border-left: 1px solid rgba(15, 23, 42, 0.08);
      margin-left: 17px; /* Aligns with the center of the expand button */
      padding-left: 10px;
    }

    .dark .tree-node-children-group {
      border-left-color: rgba(255, 255, 255, 0.08);
    }
  `]
})
export class TreeViewComponent implements OnInit {
  nodes = input<TreeNode[]>([]);
  selectable = input<boolean>(true);
  checkable = input<boolean>(false);
  selectedId = input<string | null>(null);
  expandedIds = input<string[]>([]);
  showSearch = input<boolean>(false);
  searchPlaceholder = input<string>('Search nodes...');
  showActions = input<boolean>(false);
  theme = input<'light' | 'dark'>('light');

  // Outputs
  nodeSelect = output<TreeNodeEvent>();
  nodeExpand = output<TreeNodeEvent>();
  nodeCollapse = output<TreeNodeEvent>();
  checkChange = output<{ node: TreeNode; checked: boolean }>();
  actionClick = output<{ node: TreeNode; action: 'add' | 'edit' | 'delete' }>();

  // State Signals
  private expandedSet = signal<Set<string>>(new Set());
  private checkedSet = signal<Set<string>>(new Set());
  private indeterminateSet = signal<Set<string>>(new Set());
  focusedId = signal<string | null>(null);
  searchQuery = signal<string>('');

  ngOnInit(): void {
    // Sync initial expanded ids
    if (this.expandedIds().length > 0) {
      this.expandedSet.set(new Set(this.expandedIds()));
    }
    this.updateAncestorCheckStates();
  }

  isExpanded(id: string): boolean {
    return this.expandedSet().has(id) || this.expandedIds().includes(id);
  }

  isChecked(id: string): boolean {
    return this.checkedSet().has(id);
  }

  isIndeterminate(id: string): boolean {
    return this.indeterminateSet().has(id);
  }

  hasNodeChildren(node: TreeNode): boolean {
    return !!(node.children?.length || node.hasChildren);
  }

  // Computed signal that filters the nodes reactively based on searchQuery
  filteredNodes = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) {
      return this.nodes();
    }

    const expanded = new Set(this.expandedSet());

    const filterList = (list: TreeNode[]): { match: TreeNode[]; hasMatch: boolean } => {
      const match: TreeNode[] = [];
      let hasAnyMatch = false;

      for (const node of list) {
        const matchesSelf = node.label.toLowerCase().includes(query);
        let childrenMatches: TreeNode[] = [];
        let hasChildrenMatch = false;

        if (node.children) {
          const res = filterList(node.children);
          childrenMatches = res.match;
          hasChildrenMatch = res.hasMatch;
        }

        if (matchesSelf || hasChildrenMatch) {
          hasAnyMatch = true;
          // Auto-expand paths to matching elements
          if (hasChildrenMatch) {
            expanded.add(node.id);
          }
          match.push({
            ...node,
            children: node.children ? childrenMatches : undefined
          });
        }
      }

      return { match, hasMatch: hasAnyMatch };
    };

    const result = filterList(this.nodes()).match;

    // Trigger expansion outside signal computation loop
    setTimeout(() => {
      this.expandedSet.set(expanded);
    }, 0);

    return result;
  });

  onSearchInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.searchQuery.set(val);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  onNodeClick(node: TreeNode, e: MouseEvent): void {
    e.stopPropagation();
    this.focusedId.set(node.id);
    if (this.selectable()) {
      this.nodeSelect.emit({ node });
    }
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

    // Recursively check/uncheck descendants
    const toggleDescendants = (n: TreeNode, checkVal: boolean) => {
      if (checkVal) {
        s.add(n.id);
      } else {
        s.delete(n.id);
      }
      if (n.children) {
        for (const child of n.children) {
          toggleDescendants(child, checkVal);
        }
      }
    };

    toggleDescendants(node, checked);
    this.checkedSet.set(s);

    // Calculate indeterminate and checked states up the chain
    this.updateAncestorCheckStates();

    this.checkChange.emit({ node, checked });
  }

  updateAncestorCheckStates() {
    const checked = new Set(this.checkedSet());
    const indeterminate = new Set<string>();

    const evaluate = (n: TreeNode): 'checked' | 'unchecked' | 'indeterminate' => {
      if (!n.children || n.children.length === 0) {
        return checked.has(n.id) ? 'checked' : 'unchecked';
      }

      let checkedCount = 0;
      let indeterminateCount = 0;

      for (const child of n.children) {
        const state = evaluate(child);
        if (state === 'checked') checkedCount++;
        else if (state === 'indeterminate') indeterminateCount++;
      }

      if (checkedCount === n.children.length) {
        checked.add(n.id);
        indeterminate.delete(n.id);
        return 'checked';
      } else if (checkedCount > 0 || indeterminateCount > 0) {
        checked.delete(n.id);
        indeterminate.add(n.id);
        return 'indeterminate';
      } else {
        checked.delete(n.id);
        indeterminate.delete(n.id);
        return 'unchecked';
      }
    };

    for (const root of this.nodes()) {
      evaluate(root);
    }

    this.checkedSet.set(checked);
    this.indeterminateSet.set(indeterminate);
  }

  onAction(node: TreeNode, action: 'add' | 'edit' | 'delete'): void {
    this.actionClick.emit({ node, action });
  }

  onKeyDown(e: KeyboardEvent): void {
    const flat = this.flatVisibleIds();
    const cur = this.focusedId();
    const idx = flat.indexOf(cur ?? '');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (idx < flat.length - 1) this.focusedId.set(flat[idx + 1]);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (idx > 0) this.focusedId.set(flat[idx - 1]);
    }
    if (e.key === 'Enter' || e.key === ' ') {
      if (cur) {
        const node = this.findNode(cur, this.nodes());
        if (node) {
          this.nodeSelect.emit({ node });
        }
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
    collect(this.filteredNodes());
    return ids;
  }

  private findNode(id: string, nodes: TreeNode[]): TreeNode | null {
    for (const n of nodes) {
      if (n.id === id) return n;
      if (n.children) {
        const found = this.findNode(id, n.children);
        if (found) return found;
      }
    }
    return null;
  }

  /** Expand all nodes that have children. */
  expandAll(): void {
    const ids = new Set<string>();
    const collect = (nodes: TreeNode[]) => {
      for (const n of nodes) {
        if (this.hasNodeChildren(n)) {
          ids.add(n.id);
          if (n.children) collect(n.children);
        }
      }
    };
    collect(this.nodes());
    this.expandedSet.set(ids);
  }

  /** Collapse all nodes. */
  collapseAll(): void {
    this.expandedSet.set(new Set());
  }
}
