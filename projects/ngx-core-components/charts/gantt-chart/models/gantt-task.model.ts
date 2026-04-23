export enum GanttItemType {
  Bar = 'bar',
  Range = 'range',
  Custom = 'custom',
}

export interface GanttSubtask {
  id: string;
  name: string;
  start: Date;
  end: Date;
  color: string;
  description?: string;
  progress?: number;
  meta?: Record<string, unknown>;
  cssClass?: string;
}

export interface GanttTask {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress: number;
  parentId: string | null;
  collapsed: boolean;
  isMilestone: boolean;
  color?: string;
  meta?: Record<string, unknown>;
  draggable?: boolean;
  cssClass?: string;
  /** Tasks sharing the same rowId (and the same parentId) are rendered in a single row. */
  rowId?: string;
  /** Subtasks rendered as colored segments inside this task's bar. */
  subtasks?: GanttSubtask[];
  /** Group ID for group mode — tasks with same group_id are grouped together. */
  group_id?: string;
  /** Whether this specific item can be dragged in the sidebar table. */
  itemDraggable?: boolean;
  /** Whether dependency links can be created from/to this task. Defaults to true when linkable is enabled. */
  linkable?: boolean;
  /** Whether the task can be expanded to show children (auto-detected from children/parentId). */
  expandable?: boolean;
  /** Item display type: bar (default), range, or custom. */
  type?: GanttItemType;
  /** Custom style overrides for the task bar element. */
  barStyle?: Partial<CSSStyleDeclaration>;
  /** Custom style overrides for the task's lane (row background). */
  laneStyle?: Partial<CSSStyleDeclaration>;
  /** Dependency links defined on this item (alternative to top-level dependencies input). */
  links?: (string | { type: 'FS' | 'SS' | 'FF' | 'SF'; link: string; color?: string })[];
  /** Children items for tree hierarchy (alternative to parentId). */
  children?: GanttTask[];
}
