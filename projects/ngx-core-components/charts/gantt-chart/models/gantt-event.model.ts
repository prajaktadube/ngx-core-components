import { GanttTask } from './gantt-task.model';
import { GanttDependency, DependencyType } from './gantt-dependency.model';
import { GanttGroup } from './gantt-group.model';

export interface GanttTaskChangeEvent {
  task: GanttTask;
  previousStart: Date;
  previousEnd: Date;
}

export interface GanttTaskClickEvent {
  task: GanttTask;
  originalEvent: MouseEvent;
}

export interface GanttDependencyClickEvent {
  dependency: GanttDependency;
  originalEvent: MouseEvent;
}

export interface GanttScrollEvent {
  scrollLeft: number;
  scrollTop: number;
  visibleStartDate: Date;
  visibleEndDate: Date;
}

/** Emitted when a bar drag starts, moves, or ends. */
export interface GanttDragEvent {
  task: GanttTask;
}

/** Emitted during link-drag operations. */
export interface GanttLinkDragEvent {
  source: GanttTask;
  target?: GanttTask;
  type?: DependencyType;
}

/** Emitted when a dependency line is clicked. */
export interface GanttLineClickEvent {
  event: MouseEvent;
  source: GanttTask;
  target: GanttTask;
}

/** Emitted when a bar is clicked. */
export interface GanttBarClickEvent {
  event: Event;
  task: GanttTask;
}

/** Emitted when task selection changes. */
export interface GanttSelectedEvent {
  event: Event;
  current: GanttTask;
  selectedValue: GanttTask | GanttTask[];
}

/** Emitted when table row drag starts. */
export interface GanttTableDragStartedEvent {
  source: GanttTask;
  sourceParent: GanttTask | null;
}

/** Emitted when table row drag ends. */
export interface GanttTableDragEndedEvent {
  source: GanttTask;
  sourceParent: GanttTask | null;
}

/** Emitted when a table row is dropped into a new position. */
export interface GanttTableDragDroppedEvent {
  source: GanttTask;
  sourceParent: GanttTask | null;
  target: GanttTask;
  targetParent: GanttTask | null;
  dropPosition: 'before' | 'inside' | 'after';
}

/** Emitted when scroll reaches near edges (for infinite loading). */
export interface GanttLoadOnScrollEvent {
  start: Date;
  end: Date;
}

/** Emitted when virtual scroll index changes. */
export interface GanttVirtualScrolledIndexChangeEvent {
  index: number;
  renderedRange: { start: number; end: number };
  count: number;
}

/** Emitted when the view type changes. */
export interface GanttViewChangeEvent {
  viewType: string;
}

/** Emitted when a group or item expand state changes. */
export interface GanttExpandChangeEvent {
  item?: GanttTask;
  group?: GanttGroup;
  expanded: boolean;
}
