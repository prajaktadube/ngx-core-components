import { Injectable } from '@angular/core';
import { GanttTask } from '../models';

export interface FlatRow {
  task: GanttTask;
  /** Additional tasks that share this row (same rowId). */
  extraTasks: GanttTask[];
  depth: number;
  rowIndex: number;
  hasChildren: boolean;
  isVisible: boolean;
}

interface RowGroup {
  primary: GanttTask;
  extra: GanttTask[];
}

@Injectable()
export class GanttLayoutService {
  flattenTasks(tasks: GanttTask[]): FlatRow[] {
    const childrenMap = new Map<string | null, GanttTask[]>();
    for (const task of tasks) {
      const parentId = task.parentId;
      if (!childrenMap.has(parentId)) {
        childrenMap.set(parentId, []);
      }
      childrenMap.get(parentId)!.push(task);
    }

    const rows: FlatRow[] = [];
    let rowIndex = 0;

    const traverse = (parentId: string | null, depth: number, parentVisible: boolean): void => {
      const children = childrenMap.get(parentId) || [];

      // Group children by rowId, preserving original order for primary tasks.
      const rowGroups: RowGroup[] = [];
      const rowIdToGroup = new Map<string, RowGroup>();

      for (const task of children) {
        if (task.rowId) {
          const existing = rowIdToGroup.get(task.rowId);
          if (existing) {
            existing.extra.push(task);
          } else {
            const group = { primary: task, extra: [] as GanttTask[] };
            rowGroups.push(group);
            rowIdToGroup.set(task.rowId, group);
          }
        } else {
          rowGroups.push({ primary: task, extra: [] });
        }
      }

      for (const { primary: task, extra: extraTasks } of rowGroups) {
        const hasChildren = childrenMap.has(task.id) && childrenMap.get(task.id)!.length > 0;
        const isVisible = parentVisible;
        rows.push({ task, extraTasks, depth, rowIndex: isVisible ? rowIndex : -1, hasChildren, isVisible });
        if (isVisible) rowIndex++;
        const childVisible = isVisible && !task.collapsed;
        traverse(task.id, depth + 1, childVisible);
      }
    };

    traverse(null, 0, true);
    return rows;
  }
}
