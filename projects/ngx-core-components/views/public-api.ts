/*
 * Public API Surface — secondary entry point: ngx-core-components/views
 */

// Tree View — hierarchical/nested data with expand/collapse
export { TreeViewComponent } from './tree-view/tree-view.component';
export type { TreeNode, TreeNodeEvent } from './tree-view/tree-view.component';

// List View — flat data arrays with selection and custom templates
export { ListViewComponent } from './list-view/list-view.component';
export type {
  ListViewItemClickEvent,
  ListViewSelectionEvent,
} from './list-view/list-view.component';
