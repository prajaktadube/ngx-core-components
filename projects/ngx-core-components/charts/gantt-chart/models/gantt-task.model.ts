export interface GanttSubtask {
  id: string;
  name: string;
  start: Date;
  end: Date;
  color: string;
  description?: string;
  progress?: number;
  meta?: Record<string, unknown>;
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
}
