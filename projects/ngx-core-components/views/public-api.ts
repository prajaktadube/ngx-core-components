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
export type {
  KanbanCard,
  KanbanColumn,
  KanbanSwimlane,
  KanbanCardMoveEvent,
  KanbanMoveRejectedEvent,
} from './kanban/models';

// Timeline Component — chronological events list vertical/horizontal
export { TimelineComponent } from './timeline/timeline.component';
export type { TimelineItem } from './timeline/timeline.component';

// Scheduler Component — Day/Week/Month appointment planner
export { SchedulerComponent } from './scheduler/scheduler.component';
export type {
  SchedulerEvent,
  SchedulerRecurrence,
  SchedulerSlotClickEvent,
  SchedulerEventChangeEvent,
  SchedulerResource,
  SchedulerSlotRangeSelectEvent,
} from './scheduler/models';

// Virtual List — high-performance windowed list for large datasets
export { VirtualListComponent } from './virtual-list/virtual-list.component';
export type { VirtualListItem, VirtualListItemClickEvent } from './virtual-list/virtual-list.component';

// Image Compare Slider
export { ImageCompareComponent } from './image-compare/image-compare.component';

// Key Value Details List
export { KeyValueListComponent } from './key-value-list/key-value-list.component';
export type { KeyValueItem } from './key-value-list/key-value-list.component';

// Org Chart
export { OrgChartComponent } from './org-chart/org-chart.component';
export type { OrgChartNode } from './org-chart/org-chart.component';

// JSON Viewer
export { JsonViewerComponent } from './json-viewer/json-viewer.component';
