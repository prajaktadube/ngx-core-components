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
  ListViewPageChangeEvent,
} from './list-view/list-view.component';

// Kanban Board — visual drag-and-drop workflow task board
export { KanbanComponent } from './kanban/kanban.component';
export type { KanbanCard, KanbanColumn } from './kanban/models';

// Timeline Component — chronological events list vertical/horizontal
export { TimelineComponent } from './timeline/timeline.component';
export type { TimelineItem } from './timeline/timeline.component';
