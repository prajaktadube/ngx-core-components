export interface GanttGroup<T = unknown> {
  id: string;
  title: string;
  expanded?: boolean;
  origin?: T;
  class?: string;
}
