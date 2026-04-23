import { GanttTask } from './gantt-task.model';

export enum ZoomLevel {
  Hour = 'hour',
  Day = 'day',
  Week = 'week',
  Month = 'month',
  Quarter = 'quarter',
  Year = 'year',
}

export enum GanttLinkLineType {
  Curve = 'curve',
  Straight = 'straight',
}

export interface GanttLinkOptions {
  dependencyTypes?: ('FS' | 'SS' | 'FF' | 'SF')[];
  showArrow?: boolean;
  lineType?: GanttLinkLineType;
}

export interface GanttToolbarOptions {
  viewTypes?: ZoomLevel[];
}

export interface GanttThemeColors {
  primary?: string;
  danger?: string;
  highlight?: string;
  background?: string;
  text?: {
    main?: string;
    muted?: string;
    light?: string;
    inverse?: string;
  };
  gray?: {
    100?: string;
    200?: string;
    300?: string;
    400?: string;
    500?: string;
    600?: string;
  };
}

export interface GanttStyleOptions {
  primaryColor?: string;
  headerHeight?: number;
  rowHeight?: number;
  barHeight?: number;
  defaultTheme?: string;
  themes?: Record<string, GanttThemeColors>;
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
  /** Enable drag to create dependency links between tasks */
  linkable: boolean;
  /** Link rendering options */
  linkOptions: GanttLinkOptions;
  /** Enable task selection (single or multi) */
  selectable: boolean;
  /** Allow selecting multiple tasks (requires selectable: true) */
  multiple: boolean;
  /** Show built-in toolbar with view type switcher */
  showToolbar: boolean;
  /** Toolbar configuration */
  toolbarOptions: GanttToolbarOptions;
  /** Style/theme options */
  styleOptions: GanttStyleOptions;
  /** Enable virtual scrolling for large datasets */
  virtualScrollEnabled: boolean;
  /** Show loading overlay */
  loading: boolean;
  /** Delay in ms before showing loading indicator */
  loadingDelay: number;
  /** Show baseline comparison bars */
  showBaseline: boolean;
  /** Enable table row drag and drop */
  tableDraggable: boolean;
  /** Emit load event when scrolling near edges */
  loadOnScroll: boolean;
  /** Maximum nesting level for tree hierarchy */
  maxLevel: number;
  /** Bar height in pixels */
  barHeight: number;
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
  linkable: false,
  linkOptions: {
    dependencyTypes: ['FS'],
    showArrow: true,
    lineType: GanttLinkLineType.Curve,
  },
  selectable: false,
  multiple: false,
  showToolbar: false,
  toolbarOptions: {
    viewTypes: [ZoomLevel.Day, ZoomLevel.Month, ZoomLevel.Year],
  },
  styleOptions: {
    primaryColor: '#4a90d9',
    headerHeight: 60,
    rowHeight: 40,
    barHeight: 24,
    defaultTheme: 'default',
    themes: {
      default: {
        primary: '#4a90d9',
        danger: '#ff6358',
        highlight: '#ff9f73',
        background: '#ffffff',
        text: { main: '#212529', muted: '#6c757d', light: '#adb5bd', inverse: '#ffffff' },
        gray: { 100: '#f8f9fa', 200: '#f1f3f5', 300: '#e9ecef', 400: '#dee2e6', 500: '#adb5bd', 600: '#6c757d' },
      },
    },
  },
  virtualScrollEnabled: false,
  loading: false,
  loadingDelay: 0,
  showBaseline: false,
  tableDraggable: false,
  loadOnScroll: false,
  maxLevel: 10,
  barHeight: 24,
};
