/*
 * Public API Surface of ngx-core-components
 *
 * Components are organized into secondary entry points.
 * All exports are re-exported here for convenience/backward compatibility.
 */

// ===== Tooltip & Popover (primary entry only) =====
export { TooltipDirective } from './lib/tooltip/tooltip.directive';
export type { TooltipPosition } from './lib/tooltip/tooltip.directive';
export { PopoverComponent } from './lib/tooltip/popover.component';

// ===== Input Components (also available via ngx-core-components/inputs) =====
export { TextBoxComponent } from 'ngx-core-components/inputs';
export { CheckboxComponent } from 'ngx-core-components/inputs';
export { RadioGroupComponent } from 'ngx-core-components/inputs';
export type { RadioOption } from 'ngx-core-components/inputs';
export { DropdownComponent } from 'ngx-core-components/inputs';
export type { DropdownOption } from 'ngx-core-components/inputs';
export { MultiSelectComponent } from 'ngx-core-components/inputs';
export { AutocompleteComponent } from 'ngx-core-components/inputs';
export { DatePickerComponent } from 'ngx-core-components/inputs';

// ===== Charts & Gantt (also available via ngx-core-components/charts) =====
export { BarChartComponent } from 'ngx-core-components/charts';
export { LineChartComponent } from 'ngx-core-components/charts';
export { PieChartComponent } from 'ngx-core-components/charts';
export { SparklineComponent } from 'ngx-core-components/charts';
export { GaugeChartComponent } from 'ngx-core-components/charts';
export type { GaugeThreshold } from 'ngx-core-components/charts';
export { RadarChartComponent } from 'ngx-core-components/charts';
export type { RadarSeries } from 'ngx-core-components/charts';
export { HeatmapChartComponent } from 'ngx-core-components/charts';
export { TreemapChartComponent } from 'ngx-core-components/charts';
export type { TreemapItem } from 'ngx-core-components/charts';
export { AreaChartComponent } from 'ngx-core-components/charts';
export { FunnelChartComponent } from 'ngx-core-components/charts';
export type { FunnelItem } from 'ngx-core-components/charts';
export type { ChartSeries, ChartDataPoint } from 'ngx-core-components/charts';
export { CHART_COLORS } from 'ngx-core-components/charts';
export { GanttChartComponent } from 'ngx-core-components/charts';
export type { FlatRow } from 'ngx-core-components/charts';
export { GanttScaleService } from 'ngx-core-components/charts';
// Gantt model types
export type {
  GanttTask,
  GanttDependency,
  GanttConfig,
  GanttColumnDef,
  GanttTaskChangeEvent,
  GanttTaskClickEvent,
  GanttDependencyClickEvent,
  GanttScrollEvent,
  GanttGroup,
  GanttBaselineItem,
  GanttDragEvent,
  GanttLinkDragEvent,
  GanttLineClickEvent,
  GanttBarClickEvent,
  GanttSelectedEvent,
  GanttTableDragStartedEvent,
  GanttTableDragEndedEvent,
  GanttTableDragDroppedEvent,
  GanttLoadOnScrollEvent,
  GanttVirtualScrolledIndexChangeEvent,
  GanttViewChangeEvent,
  GanttExpandChangeEvent,
  GanttTooltipContext,
} from 'ngx-core-components/charts';
export { ZoomLevel, DependencyType } from 'ngx-core-components/charts';

// ===== Data Grid (also available via ngx-core-components/grid) =====
export { DataGridComponent } from 'ngx-core-components/grid';
export type {
  GridColumnDef,
  GridFilterState,
  GridGroupState,
  GridGroupResult,
  GridSortState,
  GridPageChangeEvent,
  GridSortChangeEvent,
  GridFilterChangeEvent,
  GridGroupChangeEvent,
  GridDataStateChangeEvent,
  GridRowClickEvent,
  GridRowUpdateEvent,
  GridHeaderTemplateContext,
  GridCellTemplateContext,
  GridRowTemplateContext,
  GridDetailTemplateContext,
} from 'ngx-core-components/grid';

// ===== Hierarchical Views (also available via ngx-core-components/views) =====
export { TreeViewComponent } from 'ngx-core-components/views';
export type { TreeNode, TreeNodeEvent } from 'ngx-core-components/views';
export { ListViewComponent } from 'ngx-core-components/views';
export type {
  ListViewItemClickEvent,
  ListViewSelectionEvent,
  ListViewPageChangeEvent,
} from 'ngx-core-components/views';
export { KanbanComponent } from 'ngx-core-components/views';
export type { KanbanCard, KanbanColumn } from 'ngx-core-components/views';
export { TimelineComponent } from 'ngx-core-components/views';
export type { TimelineItem } from 'ngx-core-components/views';



// ===== Dialog (also available via ngx-core-components/dialog) =====
export { DialogService } from 'ngx-core-components/dialog';
export type { DialogRef, DialogConfig } from 'ngx-core-components/dialog';
export { DialogContainerComponent } from 'ngx-core-components/dialog';

export {
  ButtonComponent,
  ButtonGroupComponent,
  ChipComponent,
  ChipListComponent,
  SplitButtonComponent,
  DropDownButtonComponent,
  SpeedDialComponent,
} from 'ngx-core-components/buttons';
export type {
  ButtonVariant,
  ButtonSize,
  ButtonShape,
  ChipVariant,
  SplitButtonItem,
  DropDownButtonItem,
  SpeedDialItem,
} from 'ngx-core-components/buttons';

// ===== Layout (also available via ngx-core-components/layout) =====
export {
  CardComponent,
  TabStripComponent,
  TabComponent,
  AccordionComponent,
  StepperComponent,
  SplitterComponent,
} from 'ngx-core-components/layout';
export type { CardVariant, AccordionItem, StepperStep } from 'ngx-core-components/layout';

// ===== Feedback (also available via ngx-core-components/feedback) =====
export {
  BadgeComponent,
  ProgressBarComponent,
  SkeletonComponent,
  NotificationService,
  NotificationContainerComponent,
} from 'ngx-core-components/feedback';
export type {
  BadgeVariant,
  BadgePosition,
  ProgressVariant,
  SkeletonShape,
  NotificationOptions,
  NotificationType,
  NotificationPosition,
} from 'ngx-core-components/feedback';

// ===== Navigation (also available via ngx-core-components/navigation) =====
export {
  BreadcrumbComponent,
  MenuComponent,
  CommandPaletteComponent,
} from 'ngx-core-components/navigation';
export type {
  BreadcrumbItem,
  MenuItem,
  CommandItem,
} from 'ngx-core-components/navigation';

// ===== Additional Inputs (also available via ngx-core-components/inputs) =====
export {
  SliderComponent,
  SwitchComponent,
  RatingComponent,
  NumericTextBoxComponent,
  TextareaComponent,
  ColorPickerComponent,
  TimePickerComponent,
  DateRangePickerComponent,
} from 'ngx-core-components/inputs';

// ===== Barcodes (also available via ngx-core-components/barcodes) =====
export { QrCodeComponent, BarcodeComponent } from 'ngx-core-components/barcodes';

// ===== AI & Agentic Components (also available via ngx-core-components/ai) =====
export { AIChatComponent } from 'ngx-core-components/ai';
export type {
  AIMessage,
  AgentStep,
  AICard,
  AICardAction,
  QuickReply,
} from 'ngx-core-components/ai';
export { AIChatWidgetComponent } from 'ngx-core-components/ai';
export { AIPromptEditorComponent } from 'ngx-core-components/ai';


