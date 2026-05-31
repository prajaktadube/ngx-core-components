export interface DashboardItem {
  id: string;
  title: string;
  row: number;
  col: number;
  rowSpan: number;
  colSpan: number;
  
  // Controls
  draggable?: boolean;
  resizable?: boolean;
  maximized?: boolean;
  collapsed?: boolean;
  
  // Meta data
  category?: string;
  description?: string;
  minColSpan?: number;
  maxColSpan?: number;
  minRowSpan?: number;
  maxRowSpan?: number;
}

export interface DashboardLayoutChangeEvent {
  items: DashboardItem[];
}

export interface DashboardPanelActionEvent {
  panelId: string;
  action: 'close' | 'minimize' | 'maximize' | 'restore' | 'settings';
  item: DashboardItem;
}
