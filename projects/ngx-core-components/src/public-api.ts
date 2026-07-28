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
export { ComboChartComponent } from 'ngx-core-components/charts';
export { ScatterPlotComponent } from 'ngx-core-components/charts';
export type { ScatterPoint } from 'ngx-core-components/charts';
export { BubbleChartComponent } from 'ngx-core-components/charts';
export type { BubblePoint } from 'ngx-core-components/charts';
export { SunburstChartComponent } from 'ngx-core-components/charts';
export type { SunburstNode } from 'ngx-core-components/charts';
export { WaterfallChartComponent } from 'ngx-core-components/charts';
export type { WaterfallItem } from 'ngx-core-components/charts';
export { BoxPlotChartComponent } from 'ngx-core-components/charts';
export type { BoxPlotItem } from 'ngx-core-components/charts';
export { RadialBarChartComponent } from 'ngx-core-components/charts';
export type { RadialBarItem } from 'ngx-core-components/charts';
export { CandlestickChartComponent } from 'ngx-core-components/charts';
export type { CandlestickItem } from 'ngx-core-components/charts';
export { PolarAreaChartComponent } from 'ngx-core-components/charts';
export { BulletChartComponent } from 'ngx-core-components/charts';
export { DumbbellChartComponent } from 'ngx-core-components/charts';
export type { DumbbellItem } from 'ngx-core-components/charts';
export { LollipopChartComponent } from 'ngx-core-components/charts';
export { SlopeChartComponent } from 'ngx-core-components/charts';
export type { SlopeDataPoint } from 'ngx-core-components/charts';
export { SankeyChartComponent } from 'ngx-core-components/charts';
export type { SankeyNode, SankeyLink } from 'ngx-core-components/charts';
export { ViolinPlotComponent } from 'ngx-core-components/charts';
export type { ViolinItem } from 'ngx-core-components/charts';
export { RidgelineChartComponent } from 'ngx-core-components/charts';
export type { RidgelineItem } from 'ngx-core-components/charts';
export { ParetoChartComponent } from 'ngx-core-components/charts';
export type { ParetoItem } from 'ngx-core-components/charts';
export { MarimekkoChartComponent } from 'ngx-core-components/charts';
export type { MarimekkoItem, MarimekkoSegment } from 'ngx-core-components/charts';
export { ChordDiagramComponent } from 'ngx-core-components/charts';
export type { ChordItem } from 'ngx-core-components/charts';
export { DependencyWheelComponent } from 'ngx-core-components/charts';
export type { DependencyItem } from 'ngx-core-components/charts';
export { AdjacencyMatrixComponent } from 'ngx-core-components/charts';
export type { MatrixItem } from 'ngx-core-components/charts';
export { BiplotComponent } from 'ngx-core-components/charts';
export type { BiplotPoint, BiplotVector } from 'ngx-core-components/charts';
export { RenkoChartComponent } from 'ngx-core-components/charts';
export type { RenkoBrick } from 'ngx-core-components/charts';
export { KagiChartComponent } from 'ngx-core-components/charts';
export type { KagiSegment } from 'ngx-core-components/charts';
export { PointFigureChartComponent } from 'ngx-core-components/charts';
export type { PFCell } from 'ngx-core-components/charts';
export { WindRoseChartComponent } from 'ngx-core-components/charts';
export type { WindRoseItem, WindRoseSpeedBin } from 'ngx-core-components/charts';

// Batch 1: Line, Area, Spline & Bar Ranges
export { AreaRangeChartComponent } from 'ngx-core-components/charts';
export type { AreaRangeSeries, AreaRangeDataPoint } from 'ngx-core-components/charts';
export { AreaSplineRangeChartComponent } from 'ngx-core-components/charts';
export { StreamgraphComponent } from 'ngx-core-components/charts';
export type { StreamgraphSeries } from 'ngx-core-components/charts';
export { ColumnRangeChartComponent } from 'ngx-core-components/charts';
export type { ColumnRangeSeries, ColumnRangePoint } from 'ngx-core-components/charts';
export { ColumnPyramidChartComponent } from 'ngx-core-components/charts';
export type { ColumnPyramidSeries } from 'ngx-core-components/charts';
export { VariwideChartComponent } from 'ngx-core-components/charts';
export type { VariwidePoint } from 'ngx-core-components/charts';

// Batch 2: Pie, Bubbles & Network Diagrams
export { VariablePieChartComponent } from 'ngx-core-components/charts';
export type { VariablePieDataPoint } from 'ngx-core-components/charts';
export { PackedBubbleChartComponent } from 'ngx-core-components/charts';
export type { BubbleNode } from 'ngx-core-components/charts';
export { NetworkGraphComponent } from 'ngx-core-components/charts';
export type { NetworkNode, NetworkLink } from 'ngx-core-components/charts';
export { TreeGraphComponent } from 'ngx-core-components/charts';
export type { TreeGraphNode } from 'ngx-core-components/charts';
export { ArcDiagramComponent } from 'ngx-core-components/charts';
export type { ArcNode, ArcLink } from 'ngx-core-components/charts';

// Batch 3: Statistical & Advanced Visualizations
export { HistogramComponent } from 'ngx-core-components/charts';
export type { HistogramBin } from 'ngx-core-components/charts';
export { BellCurveChartComponent } from 'ngx-core-components/charts';
export type { CurvePoint } from 'ngx-core-components/charts';
export { ErrorBarComponent } from 'ngx-core-components/charts';
export type { ErrorBarPoint } from 'ngx-core-components/charts';
export { TilemapComponent } from 'ngx-core-components/charts';
export type { TileItem } from 'ngx-core-components/charts';
export { VennDiagramComponent } from 'ngx-core-components/charts';
export type { VennRegion } from 'ngx-core-components/charts';
export { ParallelCoordinatesComponent } from 'ngx-core-components/charts';
export type { ParallelLine, AxisDimension } from 'ngx-core-components/charts';
export { WordCloudComponent } from 'ngx-core-components/charts';
export type { WordItem } from 'ngx-core-components/charts';
export { PictorialChartComponent } from 'ngx-core-components/charts';
export type { PictorialIcon } from 'ngx-core-components/charts';
export { VectorPlotComponent } from 'ngx-core-components/charts';
export type { VectorItem } from 'ngx-core-components/charts';

// Batch 4: Financial Indicators & Stock Options
export { OHLCChartComponent } from 'ngx-core-components/charts';
export type { OHLCItem } from 'ngx-core-components/charts';
export { HLCChartComponent } from 'ngx-core-components/charts';
export type { HLCItem } from 'ngx-core-components/charts';
export { HollowCandlestickChartComponent } from 'ngx-core-components/charts';
export { HeikinAshiChartComponent } from 'ngx-core-components/charts';
export { FlagsComponent } from 'ngx-core-components/charts';
export type { ChartFlag } from 'ngx-core-components/charts';

// Batch 5: Geographical Maps
export { MapChoroplethComponent } from 'ngx-core-components/charts';
export type { ChoroplethDataPoint } from 'ngx-core-components/charts';
export { MapBubbleComponent } from 'ngx-core-components/charts';
export type { MapBubblePoint } from 'ngx-core-components/charts';
export { MapLinePointComponent } from 'ngx-core-components/charts';
export type { MapPoint, MapLine } from 'ngx-core-components/charts';
export { FlowmapComponent } from 'ngx-core-components/charts';
export type { FlowNode, FlowConnection } from 'ngx-core-components/charts';
export { GeoHeatmapComponent } from 'ngx-core-components/charts';
export type { GeoHeatmapPoint } from 'ngx-core-components/charts';
export { TiledWebMapComponent } from 'ngx-core-components/charts';
export type { MapMarker } from 'ngx-core-components/charts';


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

// AI-Native Chart Types
export { TokenStreamingChartComponent } from 'ngx-core-components/charts';
export { EmbeddingSpaceProjectionComponent } from 'ngx-core-components/charts';
export type { EmbeddingPoint } from 'ngx-core-components/charts';
export { AgenticCognitiveTopologyComponent } from 'ngx-core-components/charts';
export type { TopologyNode, TopologyLink } from 'ngx-core-components/charts';
export { TransformerAttentionHeatmapComponent } from 'ngx-core-components/charts';

// New Chart Types & Shared Infrastructure
export { StepLineChartComponent } from 'ngx-core-components/charts';
export { CalendarHeatmapComponent } from 'ngx-core-components/charts';
export type { CalendarHeatmapData } from 'ngx-core-components/charts';
export { NestedDonutChartComponent } from 'ngx-core-components/charts';
export type { DonutRing } from 'ngx-core-components/charts';
export { PyramidChartComponent } from 'ngx-core-components/charts';
export type { PyramidItem } from 'ngx-core-components/charts';
export { RangeBarChartComponent } from 'ngx-core-components/charts';
export type { RangeBarItem } from 'ngx-core-components/charts';
export { TimelineChartComponent } from 'ngx-core-components/charts';
export type { TimelineEvent } from 'ngx-core-components/charts';
export { MultiNeedleGaugeComponent } from 'ngx-core-components/charts';
export type { MultiGaugeNeedle } from 'ngx-core-components/charts';
export { ChartBrushZoomComponent } from 'ngx-core-components/charts';
export { ChartSkeletonComponent } from 'ngx-core-components/charts';
export { OrgChartComponent } from 'ngx-core-components/charts';
export type { OrgNode } from 'ngx-core-components/charts';

// ===== Data Grid (also available via ngx-core-components/grid) =====
export {
  DataGridComponent,
  PivotGridComponent,
  NgxGridCellTemplateDirective,
  NgxGridEditCellTemplateDirective,
  NgxGridHeaderTemplateDirective,
  NgxGridFooterTemplateDirective,
} from 'ngx-core-components/grid';
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
  GridFooterTemplateContext,
  PivotValueDef,
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
export type {
  KanbanCard,
  KanbanColumn,
  KanbanSwimlane,
  KanbanCardMoveEvent,
  KanbanMoveRejectedEvent,
} from 'ngx-core-components/views';
export { TimelineComponent, NgxTimelineMarkerTemplateDirective, NgxTimelineCardTemplateDirective } from 'ngx-core-components/views';
export type { TimelineItem } from 'ngx-core-components/views';
export { SchedulerComponent } from 'ngx-core-components/views';
export type { SchedulerEvent, SchedulerRecurrence, SchedulerSlotClickEvent, SchedulerEventChangeEvent } from 'ngx-core-components/views';
export { VirtualListComponent } from 'ngx-core-components/views';
export type { VirtualListItem, VirtualListItemClickEvent } from 'ngx-core-components/views';
export { ImageCompareComponent } from 'ngx-core-components/views';
export { KeyValueListComponent } from 'ngx-core-components/views';
export type { KeyValueItem } from 'ngx-core-components/views';
export { JsonViewerComponent, CalendarComponent } from 'ngx-core-components/views';
export type { OrgChartNode, CalendarEvent, CalendarCell } from 'ngx-core-components/views';




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
  DashboardLayoutComponent,
  CarouselComponent,
  DrawerComponent,
} from 'ngx-core-components/layout';
export type {
  CardVariant,
  AccordionItem,
  StepperStep,
  DashboardItem,
  DashboardLayoutChangeEvent,
  DashboardPanelActionEvent,
} from 'ngx-core-components/layout';

// ===== Feedback (also available via ngx-core-components/feedback) =====
export {
  BadgeComponent,
  ProgressBarComponent,
  SkeletonComponent,
  NotificationService,
  NotificationContainerComponent,
  AvatarComponent,
  AvatarGroupComponent,
  StatCardComponent,
  CountdownComponent,
  EmptyStateComponent,
} from 'ngx-core-components/feedback';
export type {
  BadgeVariant,
  BadgePosition,
  ProgressVariant,
  SkeletonShape,
  NotificationOptions,
  NotificationType,
  NotificationPosition,
  AvatarSize,
  AvatarShape,
  AvatarStatus,
  AvatarItem,
  StatCardVariant,
  CountdownVariant,
} from 'ngx-core-components/feedback';

// ===== Navigation (also available via ngx-core-components/navigation) =====
export {
  BreadcrumbComponent,
  MenuComponent,
  CommandPaletteComponent,
  ContextMenuComponent,
  BackToTopComponent,
} from 'ngx-core-components/navigation';
export type {
  BreadcrumbItem,
  MenuItem,
  CommandItem,
  ContextMenuItem,
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
  FileUploadComponent,
  TagInputComponent,
  FilePreviewComponent,
  SegmentedControlComponent,
  FormBuilderComponent,
  FormDesignerComponent,
  SignaturePadComponent,
} from 'ngx-core-components/inputs';
export type {
  UploadFileItem,
  PreviewFileItem,
  SegmentedOption,
  FormBuilderField,
  FormBuilderOption,
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
export { NgxWebLlmService, AIFormCopilotComponent } from 'ngx-core-components/ai';
export type { WebLlmMessage } from 'ngx-core-components/ai';

// ===== i18n =====
export { NGX_CORE_I18N, DEFAULT_EN_I18N, provideNgxI18n } from 'ngx-core-components/i18n';
export type { NgxCoreI18n } from 'ngx-core-components/i18n';
