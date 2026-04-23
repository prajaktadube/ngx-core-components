import { Injectable } from '@angular/core';
import { GanttTask } from '../models/gantt-task.model';
import { GanttGroup } from '../models/gantt-group.model';

export interface FlatRow {
  task: GanttTask;
  /** Additional tasks that share this row (same rowId). */
  extraTasks: GanttTask[];
  depth: number;
  rowIndex: number;
  hasChildren: boolean;
  isVisible: boolean;
  /** Set when this row is a group header. */
  group?: GanttGroup;
  /** Whether this is a group header row. */
  isGroupHeader: boolean;
}

interface RowGroup {
  primary: GanttTask;
  extra: GanttTask[];
}

@Injectable()
export class GanttLayoutService {
  flattenTasks(tasks: GanttTask[], groups?: GanttGroup[]): FlatRow[] {
    if (groups && groups.length > 0) {
      return this.flattenWithGroups(tasks, groups);
    }
    return this.flattenTree(tasks);
  }

  private flattenTree(tasks: GanttTask[]): FlatRow[] {
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
        rows.push({ task, extraTasks, depth, rowIndex: isVisible ? rowIndex : -1, hasChildren, isVisible, isGroupHeader: false });
        if (isVisible) rowIndex++;
        const childVisible = isVisible && !task.collapsed;
        traverse(task.id, depth + 1, childVisible);
      }
    };

    traverse(null, 0, true);
    return rows;
  }

  private flattenWithGroups(tasks: GanttTask[], groups: GanttGroup[]): FlatRow[] {
    const rows: FlatRow[] = [];
    let rowIndex = 0;

    // Build a map of tasks by group_id
    const tasksByGroup = new Map<string, GanttTask[]>();
    const ungroupedTasks: GanttTask[] = [];
    for (const task of tasks) {
      if (task.group_id) {
        if (!tasksByGroup.has(task.group_id)) {
          tasksByGroup.set(task.group_id, []);
        }
        tasksByGroup.get(task.group_id)!.push(task);
      } else {
        ungroupedTasks.push(task);
      }
    }

    for (const group of groups) {
      // Create a pseudo-task for the group header
      const groupTask: GanttTask = {
        id: `__group__${group.id}`,
        name: group.title,
        start: new Date(),
        end: new Date(),
        progress: 0,
        parentId: null,
        collapsed: group.expanded === false,
        isMilestone: false,
        cssClass: group.class,
      };

      const groupTasks = tasksByGroup.get(group.id) || [];

      // Calculate group date range
      if (groupTasks.length > 0) {
        let minStart = groupTasks[0].start.getTime();
        let maxEnd = groupTasks[0].end.getTime();
        let totalProgress = 0;
        for (const t of groupTasks) {
          if (t.start.getTime() < minStart) minStart = t.start.getTime();
          if (t.end.getTime() > maxEnd) maxEnd = t.end.getTime();
          totalProgress += t.progress;
        }
        groupTask.start = new Date(minStart);
        groupTask.end = new Date(maxEnd);
        groupTask.progress = Math.round(totalProgress / groupTasks.length);
      }

      const hasChildren = groupTasks.length > 0;
      rows.push({
        task: groupTask,
        extraTasks: [],
        depth: 0,
        rowIndex: rowIndex++,
        hasChildren,
        isVisible: true,
        group,
        isGroupHeader: true,
      });

      if (group.expanded !== false) {
        // Flatten group tasks using tree logic
        const groupRows = this.flattenTree(groupTasks);
        for (const r of groupRows) {
          if (r.isVisible) {
            r.rowIndex = rowIndex++;
            r.depth += 1; // indent within group
          }
          rows.push(r);
        }
      }
    }

    // Also flatten any ungrouped tasks
    if (ungroupedTasks.length > 0) {
      const ungroupedRows = this.flattenTree(ungroupedTasks);
      for (const r of ungroupedRows) {
        if (r.isVisible) {
          r.rowIndex = rowIndex++;
        }
        rows.push(r);
      }
    }

    return rows;
  }
}
