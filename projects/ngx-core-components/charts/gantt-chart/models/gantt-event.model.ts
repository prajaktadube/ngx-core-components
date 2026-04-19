import { GanttTask } from './gantt-task.model';
import { GanttDependency } from './gantt-dependency.model';

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
