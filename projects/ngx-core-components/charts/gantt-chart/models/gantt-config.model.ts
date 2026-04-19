import { GanttTask } from './gantt-task.model';

export enum ZoomLevel {
  Day = 'day',
  Week = 'week',
  Month = 'month',
}

export interface GanttColumnDef {
  field: string | ((task: GanttTask) => string);
  header: string;
  width: number;
}

export interface GanttConfig {
  zoomLevel: ZoomLevel;
  rowHeight: number;
  columnWidth: number;
  sidebarColumns: GanttColumnDef[];
  sidebarWidth: number;
  showTodayMarker: boolean;
  showGrid: boolean;
  collapsible: boolean;
  headerHeight: number;
  snapTo: 'none' | 'day' | 'hour';
  locale: string;
}

export const DEFAULT_GANTT_CONFIG: GanttConfig = {
  zoomLevel: ZoomLevel.Day,
  rowHeight: 40,
  columnWidth: 40,
  sidebarColumns: [{ field: 'name', header: 'Task Name', width: 200 }],
  sidebarWidth: 280,
  showTodayMarker: true,
  showGrid: true,
  collapsible: true,
  headerHeight: 60,
  snapTo: 'day',
  locale: 'en-US',
};
