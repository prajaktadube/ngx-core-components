'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">ngx-core-components-workspace documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                                <li class="link">
                                    <a href="overview.html" data-type="chapter-link">
                                        <span class="icon ion-ios-keypad"></span>Overview
                                    </a>
                                </li>

                            <li class="link">
                                <a href="index.html" data-type="chapter-link">
                                    <span class="icon ion-ios-paper"></span>
                                        README
                                </a>
                            </li>
                        <li class="link">
                            <a href="changelog.html"  data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>CHANGELOG
                            </a>
                        </li>
                        <li class="link">
                            <a href="contributing.html"  data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>CONTRIBUTING
                            </a>
                        </li>
                        <li class="link">
                            <a href="license.html"  data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>LICENSE
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>

                    </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#components-links"' :
                            'data-bs-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Components</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/AccordionComponent.html" data-type="entity-link" >AccordionComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AccordionItemComponent.html" data-type="entity-link" >AccordionItemComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AdjacencyMatrixComponent.html" data-type="entity-link" >AdjacencyMatrixComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AgenticCognitiveTopologyComponent.html" data-type="entity-link" >AgenticCognitiveTopologyComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AIAudioWaveComponent.html" data-type="entity-link" >AIAudioWaveComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AIChatComponent.html" data-type="entity-link" >AIChatComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AIChatWidgetComponent.html" data-type="entity-link" >AIChatWidgetComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AICodeEditorComponent.html" data-type="entity-link" >AICodeEditorComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AIFormCopilotComponent.html" data-type="entity-link" >AIFormCopilotComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AIModelCompareComponent.html" data-type="entity-link" >AIModelCompareComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AIPromptEditorComponent.html" data-type="entity-link" >AIPromptEditorComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AIRagInspectorComponent.html" data-type="entity-link" >AIRagInspectorComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AlertComponent.html" data-type="entity-link" >AlertComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ArcDiagramComponent.html" data-type="entity-link" >ArcDiagramComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AreaChartComponent.html" data-type="entity-link" >AreaChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AreaRangeChartComponent.html" data-type="entity-link" >AreaRangeChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AreaSplineRangeChartComponent.html" data-type="entity-link" >AreaSplineRangeChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AutocompleteComponent.html" data-type="entity-link" >AutocompleteComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AvatarComponent.html" data-type="entity-link" >AvatarComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AvatarGroupComponent.html" data-type="entity-link" >AvatarGroupComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/BackToTopComponent.html" data-type="entity-link" >BackToTopComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/BadgeComponent.html" data-type="entity-link" >BadgeComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/BarChartComponent.html" data-type="entity-link" >BarChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/BarcodeComponent.html" data-type="entity-link" >BarcodeComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/BellCurveChartComponent.html" data-type="entity-link" >BellCurveChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/BiplotComponent.html" data-type="entity-link" >BiplotComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/BoxPlotChartComponent.html" data-type="entity-link" >BoxPlotChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/BreadcrumbComponent.html" data-type="entity-link" >BreadcrumbComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/BubbleChartComponent.html" data-type="entity-link" >BubbleChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/BulletChartComponent.html" data-type="entity-link" >BulletChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ButtonComponent.html" data-type="entity-link" >ButtonComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ButtonGroupComponent.html" data-type="entity-link" >ButtonGroupComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CalendarComponent.html" data-type="entity-link" >CalendarComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CalendarHeatmapComponent.html" data-type="entity-link" >CalendarHeatmapComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CandlestickChartComponent.html" data-type="entity-link" >CandlestickChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CardComponent.html" data-type="entity-link" >CardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CarouselComponent.html" data-type="entity-link" >CarouselComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ChartBrushZoomComponent.html" data-type="entity-link" >ChartBrushZoomComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ChartExportMenuComponent.html" data-type="entity-link" >ChartExportMenuComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ChartSkeletonComponent.html" data-type="entity-link" >ChartSkeletonComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CheckboxComponent.html" data-type="entity-link" >CheckboxComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ChipComponent.html" data-type="entity-link" >ChipComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ChipListComponent.html" data-type="entity-link" >ChipListComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ChordDiagramComponent.html" data-type="entity-link" >ChordDiagramComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ColorPickerComponent.html" data-type="entity-link" >ColorPickerComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ColumnPyramidChartComponent.html" data-type="entity-link" >ColumnPyramidChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ColumnRangeChartComponent.html" data-type="entity-link" >ColumnRangeChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ComboChartComponent.html" data-type="entity-link" >ComboChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CommandPaletteComponent.html" data-type="entity-link" >CommandPaletteComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ContextMenuComponent.html" data-type="entity-link" >ContextMenuComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CountdownComponent.html" data-type="entity-link" >CountdownComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DashboardLayoutComponent.html" data-type="entity-link" >DashboardLayoutComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DataGridComponent.html" data-type="entity-link" >DataGridComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DatePickerComponent.html" data-type="entity-link" >DatePickerComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DateRangePickerComponent.html" data-type="entity-link" >DateRangePickerComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DependencyWheelComponent.html" data-type="entity-link" >DependencyWheelComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DialogContainerComponent.html" data-type="entity-link" >DialogContainerComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DrawerComponent.html" data-type="entity-link" >DrawerComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DropDownButtonComponent.html" data-type="entity-link" >DropDownButtonComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DropdownComponent.html" data-type="entity-link" >DropdownComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DumbbellChartComponent.html" data-type="entity-link" >DumbbellChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/EmbeddingSpaceProjectionComponent.html" data-type="entity-link" >EmbeddingSpaceProjectionComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/EmptyStateComponent.html" data-type="entity-link" >EmptyStateComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ErrorBarComponent.html" data-type="entity-link" >ErrorBarComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/FilePreviewComponent.html" data-type="entity-link" >FilePreviewComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/FileUploadComponent.html" data-type="entity-link" >FileUploadComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/FlagsComponent.html" data-type="entity-link" >FlagsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/FlowmapComponent.html" data-type="entity-link" >FlowmapComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/FormBuilderComponent.html" data-type="entity-link" >FormBuilderComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/FormDesignerComponent.html" data-type="entity-link" >FormDesignerComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/FunnelChartComponent.html" data-type="entity-link" >FunnelChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GanttChartComponent.html" data-type="entity-link" >GanttChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GaugeChartComponent.html" data-type="entity-link" >GaugeChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GeoHeatmapComponent.html" data-type="entity-link" >GeoHeatmapComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GridFilterBuilderComponent.html" data-type="entity-link" >GridFilterBuilderComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GridStatusBarComponent.html" data-type="entity-link" >GridStatusBarComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HeatmapChartComponent.html" data-type="entity-link" >HeatmapChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HeikinAshiChartComponent.html" data-type="entity-link" >HeikinAshiChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HistogramComponent.html" data-type="entity-link" >HistogramComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HLCChartComponent.html" data-type="entity-link" >HLCChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HollowCandlestickChartComponent.html" data-type="entity-link" >HollowCandlestickChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ImageCompareComponent.html" data-type="entity-link" >ImageCompareComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/JsonViewerComponent.html" data-type="entity-link" >JsonViewerComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/KagiChartComponent.html" data-type="entity-link" >KagiChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/KanbanComponent.html" data-type="entity-link" >KanbanComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/KeyValueListComponent.html" data-type="entity-link" >KeyValueListComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LineChartComponent.html" data-type="entity-link" >LineChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ListViewComponent.html" data-type="entity-link" >ListViewComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LollipopChartComponent.html" data-type="entity-link" >LollipopChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MapBubbleComponent.html" data-type="entity-link" >MapBubbleComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MapChoroplethComponent.html" data-type="entity-link" >MapChoroplethComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MapLinePointComponent.html" data-type="entity-link" >MapLinePointComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MarimekkoChartComponent.html" data-type="entity-link" >MarimekkoChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MenuComponent.html" data-type="entity-link" >MenuComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MultiNeedleGaugeComponent.html" data-type="entity-link" >MultiNeedleGaugeComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MultiSelectComponent.html" data-type="entity-link" >MultiSelectComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/NestedDonutChartComponent.html" data-type="entity-link" >NestedDonutChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/NetworkGraphComponent.html" data-type="entity-link" >NetworkGraphComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/NotificationContainerComponent.html" data-type="entity-link" >NotificationContainerComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/NotificationStoryWrapperComponent.html" data-type="entity-link" >NotificationStoryWrapperComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/NumericTextBoxComponent.html" data-type="entity-link" >NumericTextBoxComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/OHLCChartComponent.html" data-type="entity-link" >OHLCChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/OrgChartComponent.html" data-type="entity-link" >OrgChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/OrgChartComponent-1.html" data-type="entity-link" >OrgChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PackedBubbleChartComponent.html" data-type="entity-link" >PackedBubbleChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ParallelCoordinatesComponent.html" data-type="entity-link" >ParallelCoordinatesComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ParetoChartComponent.html" data-type="entity-link" >ParetoChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PictorialChartComponent.html" data-type="entity-link" >PictorialChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PieChartComponent.html" data-type="entity-link" >PieChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PivotGridComponent.html" data-type="entity-link" >PivotGridComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PointFigureChartComponent.html" data-type="entity-link" >PointFigureChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PolarAreaChartComponent.html" data-type="entity-link" >PolarAreaChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PopoverComponent.html" data-type="entity-link" >PopoverComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ProgressBarComponent.html" data-type="entity-link" >ProgressBarComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PyramidChartComponent.html" data-type="entity-link" >PyramidChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/QrCodeComponent.html" data-type="entity-link" >QrCodeComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/RadarChartComponent.html" data-type="entity-link" >RadarChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/RadialBarChartComponent.html" data-type="entity-link" >RadialBarChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/RadioGroupComponent.html" data-type="entity-link" >RadioGroupComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/RangeBarChartComponent.html" data-type="entity-link" >RangeBarChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/RatingComponent.html" data-type="entity-link" >RatingComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/RenkoChartComponent.html" data-type="entity-link" >RenkoChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/RidgelineChartComponent.html" data-type="entity-link" >RidgelineChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SankeyChartComponent.html" data-type="entity-link" >SankeyChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ScatterPlotComponent.html" data-type="entity-link" >ScatterPlotComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SchedulerComponent.html" data-type="entity-link" >SchedulerComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SegmentedControlComponent.html" data-type="entity-link" >SegmentedControlComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SignaturePadComponent.html" data-type="entity-link" >SignaturePadComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SkeletonComponent.html" data-type="entity-link" >SkeletonComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SliderComponent.html" data-type="entity-link" >SliderComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SlopeChartComponent.html" data-type="entity-link" >SlopeChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SparklineComponent.html" data-type="entity-link" >SparklineComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SpeedDialComponent.html" data-type="entity-link" >SpeedDialComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SplitButtonComponent.html" data-type="entity-link" >SplitButtonComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SplitterComponent.html" data-type="entity-link" >SplitterComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/StatCardComponent.html" data-type="entity-link" >StatCardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/StepLineChartComponent.html" data-type="entity-link" >StepLineChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/StepperComponent.html" data-type="entity-link" >StepperComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/StreamgraphComponent.html" data-type="entity-link" >StreamgraphComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SunburstChartComponent.html" data-type="entity-link" >SunburstChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SwitchComponent.html" data-type="entity-link" >SwitchComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TabComponent.html" data-type="entity-link" >TabComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TabStripComponent.html" data-type="entity-link" >TabStripComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TagInputComponent.html" data-type="entity-link" >TagInputComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TextareaComponent.html" data-type="entity-link" >TextareaComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TextBoxComponent.html" data-type="entity-link" >TextBoxComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TiledWebMapComponent.html" data-type="entity-link" >TiledWebMapComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TilemapComponent.html" data-type="entity-link" >TilemapComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TimelineChartComponent.html" data-type="entity-link" >TimelineChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TimelineComponent.html" data-type="entity-link" >TimelineComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TimePickerComponent.html" data-type="entity-link" >TimePickerComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TokenStreamingChartComponent.html" data-type="entity-link" >TokenStreamingChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TokenStreamSimComponent.html" data-type="entity-link" >TokenStreamSimComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TransformerAttentionHeatmapComponent.html" data-type="entity-link" >TransformerAttentionHeatmapComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TreeGraphComponent.html" data-type="entity-link" >TreeGraphComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TreemapChartComponent.html" data-type="entity-link" >TreemapChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TreeViewComponent.html" data-type="entity-link" >TreeViewComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/VariablePieChartComponent.html" data-type="entity-link" >VariablePieChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/VariwideChartComponent.html" data-type="entity-link" >VariwideChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/VectorPlotComponent.html" data-type="entity-link" >VectorPlotComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/VennDiagramComponent.html" data-type="entity-link" >VennDiagramComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ViolinPlotComponent.html" data-type="entity-link" >ViolinPlotComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/VirtualListComponent.html" data-type="entity-link" >VirtualListComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/WaterfallChartComponent.html" data-type="entity-link" >WaterfallChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/WindRoseChartComponent.html" data-type="entity-link" >WindRoseChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/WordCloudComponent.html" data-type="entity-link" >WordCloudComponent</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#directives-links"' :
                                'data-bs-target="#xs-directives-links"' }>
                                <span class="icon ion-md-code-working"></span>
                                <span>Directives</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="directives-links"' : 'id="xs-directives-links"' }>
                                <li class="link">
                                    <a href="directives/ChartSyncGroupDirective.html" data-type="entity-link" >ChartSyncGroupDirective</a>
                                </li>
                                <li class="link">
                                    <a href="directives/NgxGridCellTemplateDirective.html" data-type="entity-link" >NgxGridCellTemplateDirective</a>
                                </li>
                                <li class="link">
                                    <a href="directives/NgxGridEditCellTemplateDirective.html" data-type="entity-link" >NgxGridEditCellTemplateDirective</a>
                                </li>
                                <li class="link">
                                    <a href="directives/NgxGridFooterTemplateDirective.html" data-type="entity-link" >NgxGridFooterTemplateDirective</a>
                                </li>
                                <li class="link">
                                    <a href="directives/NgxGridHeaderTemplateDirective.html" data-type="entity-link" >NgxGridHeaderTemplateDirective</a>
                                </li>
                                <li class="link">
                                    <a href="directives/NgxMaskDirective.html" data-type="entity-link" >NgxMaskDirective</a>
                                </li>
                                <li class="link">
                                    <a href="directives/NgxSchedulerEventTemplateDirective.html" data-type="entity-link" >NgxSchedulerEventTemplateDirective</a>
                                </li>
                                <li class="link">
                                    <a href="directives/NgxStepContentDirective.html" data-type="entity-link" >NgxStepContentDirective</a>
                                </li>
                                <li class="link">
                                    <a href="directives/NgxTimelineCardTemplateDirective.html" data-type="entity-link" >NgxTimelineCardTemplateDirective</a>
                                </li>
                                <li class="link">
                                    <a href="directives/NgxTimelineMarkerTemplateDirective.html" data-type="entity-link" >NgxTimelineMarkerTemplateDirective</a>
                                </li>
                                <li class="link">
                                    <a href="directives/TooltipDirective.html" data-type="entity-link" >TooltipDirective</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/SharedStringTable.html" data-type="entity-link" >SharedStringTable</a>
                            </li>
                            <li class="link">
                                <a href="classes/XlsxZipBuilder.html" data-type="entity-link" >XlsxZipBuilder</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/ChartExportService.html" data-type="entity-link" >ChartExportService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ChartThemeService.html" data-type="entity-link" >ChartThemeService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ChartTooltipService.html" data-type="entity-link" >ChartTooltipService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DialogService.html" data-type="entity-link" >DialogService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GanttKeyboardService.html" data-type="entity-link" >GanttKeyboardService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GanttLayoutService.html" data-type="entity-link" >GanttLayoutService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GanttPrintService.html" data-type="entity-link" >GanttPrintService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GanttScaleService.html" data-type="entity-link" >GanttScaleService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GridClipboardService.html" data-type="entity-link" >GridClipboardService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GridEditService.html" data-type="entity-link" >GridEditService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GridExportService.html" data-type="entity-link" >GridExportService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GridExportXlsxService.html" data-type="entity-link" >GridExportXlsxService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GridKeyboardService.html" data-type="entity-link" >GridKeyboardService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GridSelectionService.html" data-type="entity-link" >GridSelectionService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GridStateService.html" data-type="entity-link" >GridStateService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GridVirtualizationService.html" data-type="entity-link" >GridVirtualizationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/NgxFormErrorService.html" data-type="entity-link" >NgxFormErrorService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/NgxWebLlmService.html" data-type="entity-link" >NgxWebLlmService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/NotificationService.html" data-type="entity-link" >NotificationService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/AccordionItem.html" data-type="entity-link" >AccordionItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AgentStep.html" data-type="entity-link" >AgentStep</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AICard.html" data-type="entity-link" >AICard</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AICardAction.html" data-type="entity-link" >AICardAction</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AIMessage.html" data-type="entity-link" >AIMessage</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AIModel.html" data-type="entity-link" >AIModel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ArcLink.html" data-type="entity-link" >ArcLink</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ArcNode.html" data-type="entity-link" >ArcNode</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AreaRangeDataPoint.html" data-type="entity-link" >AreaRangeDataPoint</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AreaRangeDataPoint-1.html" data-type="entity-link" >AreaRangeDataPoint</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AreaRangeSeries.html" data-type="entity-link" >AreaRangeSeries</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AreaRangeSeries-1.html" data-type="entity-link" >AreaRangeSeries</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AvatarItem.html" data-type="entity-link" >AvatarItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AxisDimension.html" data-type="entity-link" >AxisDimension</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BiplotPoint.html" data-type="entity-link" >BiplotPoint</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BiplotVector.html" data-type="entity-link" >BiplotVector</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BoundingBox.html" data-type="entity-link" >BoundingBox</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BoxPlotItem.html" data-type="entity-link" >BoxPlotItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BreadcrumbItem.html" data-type="entity-link" >BreadcrumbItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BubbleNode.html" data-type="entity-link" >BubbleNode</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BubblePoint.html" data-type="entity-link" >BubblePoint</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CalendarCell.html" data-type="entity-link" >CalendarCell</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CalendarDay.html" data-type="entity-link" >CalendarDay</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CalendarEvent.html" data-type="entity-link" >CalendarEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CalendarHeatmapData.html" data-type="entity-link" >CalendarHeatmapData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CandlestickItem.html" data-type="entity-link" >CandlestickItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CandlestickItem-1.html" data-type="entity-link" >CandlestickItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CandlestickItem-2.html" data-type="entity-link" >CandlestickItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CellCoordinate.html" data-type="entity-link" >CellCoordinate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CellRange.html" data-type="entity-link" >CellRange</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ChartAnnotation.html" data-type="entity-link" >ChartAnnotation</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ChartDataPoint.html" data-type="entity-link" >ChartDataPoint</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ChartFlag.html" data-type="entity-link" >ChartFlag</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ChartSeries.html" data-type="entity-link" >ChartSeries</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ChartSeries-1.html" data-type="entity-link" >ChartSeries</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ChartTheme.html" data-type="entity-link" >ChartTheme</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ChordItem.html" data-type="entity-link" >ChordItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ChoroplethDataPoint.html" data-type="entity-link" >ChoroplethDataPoint</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ColumnPyramidSeries.html" data-type="entity-link" >ColumnPyramidSeries</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ColumnRangePoint.html" data-type="entity-link" >ColumnRangePoint</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ColumnRangeSeries.html" data-type="entity-link" >ColumnRangeSeries</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CommandItem.html" data-type="entity-link" >CommandItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ComputedTile.html" data-type="entity-link" >ComputedTile</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ComputedVector.html" data-type="entity-link" >ComputedVector</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ContextMenuItem.html" data-type="entity-link" >ContextMenuItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CurvePoint.html" data-type="entity-link" >CurvePoint</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DashboardItem.html" data-type="entity-link" >DashboardItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DashboardLayoutChangeEvent.html" data-type="entity-link" >DashboardLayoutChangeEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DashboardPanelActionEvent.html" data-type="entity-link" >DashboardPanelActionEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DatePreset.html" data-type="entity-link" >DatePreset</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DateRangePreset.html" data-type="entity-link" >DateRangePreset</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DependencyItem.html" data-type="entity-link" >DependencyItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DialogConfig.html" data-type="entity-link" >DialogConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DialogRef.html" data-type="entity-link" >DialogRef</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DonutRing.html" data-type="entity-link" >DonutRing</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DropDownButtonItem.html" data-type="entity-link" >DropDownButtonItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DropdownOption.html" data-type="entity-link" >DropdownOption</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DumbbellItem.html" data-type="entity-link" >DumbbellItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EditCommand.html" data-type="entity-link" >EditCommand</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EmbeddingPoint.html" data-type="entity-link" >EmbeddingPoint</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ErrorBarPoint.html" data-type="entity-link" >ErrorBarPoint</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FilterCondition.html" data-type="entity-link" >FilterCondition</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FilterExpression.html" data-type="entity-link" >FilterExpression</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FlatRow.html" data-type="entity-link" >FlatRow</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FlowConnection.html" data-type="entity-link" >FlowConnection</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FlowNode.html" data-type="entity-link" >FlowNode</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FormBuilderCondition.html" data-type="entity-link" >FormBuilderCondition</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FormBuilderField.html" data-type="entity-link" >FormBuilderField</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FormBuilderOption.html" data-type="entity-link" >FormBuilderOption</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FormErrorMessages.html" data-type="entity-link" >FormErrorMessages</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FunnelItem.html" data-type="entity-link" >FunnelItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GanttBarClickEvent.html" data-type="entity-link" >GanttBarClickEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GanttBaselineItem.html" data-type="entity-link" >GanttBaselineItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GanttColumnDef.html" data-type="entity-link" >GanttColumnDef</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GanttConfig.html" data-type="entity-link" >GanttConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GanttDependency.html" data-type="entity-link" >GanttDependency</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GanttDependencyClickEvent.html" data-type="entity-link" >GanttDependencyClickEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GanttDragEvent.html" data-type="entity-link" >GanttDragEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GanttExpandChangeEvent.html" data-type="entity-link" >GanttExpandChangeEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GanttGroup.html" data-type="entity-link" >GanttGroup</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GanttLineClickEvent.html" data-type="entity-link" >GanttLineClickEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GanttLinkDragEvent.html" data-type="entity-link" >GanttLinkDragEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GanttLinkOptions.html" data-type="entity-link" >GanttLinkOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GanttLoadOnScrollEvent.html" data-type="entity-link" >GanttLoadOnScrollEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GanttScrollEvent.html" data-type="entity-link" >GanttScrollEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GanttSelectedEvent.html" data-type="entity-link" >GanttSelectedEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GanttStyleOptions.html" data-type="entity-link" >GanttStyleOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GanttSubtask.html" data-type="entity-link" >GanttSubtask</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GanttTableDragDroppedEvent.html" data-type="entity-link" >GanttTableDragDroppedEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GanttTableDragEndedEvent.html" data-type="entity-link" >GanttTableDragEndedEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GanttTableDragStartedEvent.html" data-type="entity-link" >GanttTableDragStartedEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GanttTask.html" data-type="entity-link" >GanttTask</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GanttTaskChangeEvent.html" data-type="entity-link" >GanttTaskChangeEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GanttTaskClickEvent.html" data-type="entity-link" >GanttTaskClickEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GanttThemeColors.html" data-type="entity-link" >GanttThemeColors</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GanttToolbarOptions.html" data-type="entity-link" >GanttToolbarOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GanttTooltipContext.html" data-type="entity-link" >GanttTooltipContext</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GanttViewChangeEvent.html" data-type="entity-link" >GanttViewChangeEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GanttVirtualScrolledIndexChangeEvent.html" data-type="entity-link" >GanttVirtualScrolledIndexChangeEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GaugeNeedle.html" data-type="entity-link" >GaugeNeedle</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GaugeThreshold.html" data-type="entity-link" >GaugeThreshold</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GaugeThreshold-1.html" data-type="entity-link" >GaugeThreshold</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GeoHeatmapPoint.html" data-type="entity-link" >GeoHeatmapPoint</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GridCellTemplateContext.html" data-type="entity-link" >GridCellTemplateContext</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GridCellValidationError.html" data-type="entity-link" >GridCellValidationError</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GridCellValidator.html" data-type="entity-link" >GridCellValidator</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GridColumnDef.html" data-type="entity-link" >GridColumnDef</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GridDataStateChangeEvent.html" data-type="entity-link" >GridDataStateChangeEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GridDetailTemplateContext.html" data-type="entity-link" >GridDetailTemplateContext</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GridEditChangeset.html" data-type="entity-link" >GridEditChangeset</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GridFilterChangeEvent.html" data-type="entity-link" >GridFilterChangeEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GridFilterState.html" data-type="entity-link" >GridFilterState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GridFooterTemplateContext.html" data-type="entity-link" >GridFooterTemplateContext</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GridGroupChangeEvent.html" data-type="entity-link" >GridGroupChangeEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GridGroupResult.html" data-type="entity-link" >GridGroupResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GridGroupState.html" data-type="entity-link" >GridGroupState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GridHeaderTemplateContext.html" data-type="entity-link" >GridHeaderTemplateContext</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GridInfiniteScrollEvent.html" data-type="entity-link" >GridInfiniteScrollEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GridKeyboardAction.html" data-type="entity-link" >GridKeyboardAction</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GridKeyboardConfig.html" data-type="entity-link" >GridKeyboardConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GridKeyboardHandlers.html" data-type="entity-link" >GridKeyboardHandlers</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GridPageChangeEvent.html" data-type="entity-link" >GridPageChangeEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GridPersistedState.html" data-type="entity-link" >GridPersistedState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GridRowClickEvent.html" data-type="entity-link" >GridRowClickEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GridRowTemplateContext.html" data-type="entity-link" >GridRowTemplateContext</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GridRowUpdateEvent.html" data-type="entity-link" >GridRowUpdateEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GridSortChangeEvent.html" data-type="entity-link" >GridSortChangeEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GridSortState.html" data-type="entity-link" >GridSortState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GridStatusBarAggregates.html" data-type="entity-link" >GridStatusBarAggregates</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/HeatmapCell.html" data-type="entity-link" >HeatmapCell</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/HeikinAshiCalculatedItem.html" data-type="entity-link" >HeikinAshiCalculatedItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/HistogramBin.html" data-type="entity-link" >HistogramBin</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/HLCItem.html" data-type="entity-link" >HLCItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/KagiSegment.html" data-type="entity-link" >KagiSegment</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/KanbanCard.html" data-type="entity-link" >KanbanCard</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/KanbanCardMoveEvent.html" data-type="entity-link" >KanbanCardMoveEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/KanbanColumn.html" data-type="entity-link" >KanbanColumn</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/KanbanMoveRejectedEvent.html" data-type="entity-link" >KanbanMoveRejectedEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/KanbanSwimlane.html" data-type="entity-link" >KanbanSwimlane</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/KeyValueItem.html" data-type="entity-link" >KeyValueItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LayoutItem.html" data-type="entity-link" >LayoutItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ListViewItemClickEvent.html" data-type="entity-link" >ListViewItemClickEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ListViewPageChangeEvent.html" data-type="entity-link" >ListViewPageChangeEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ListViewSelectionEvent.html" data-type="entity-link" >ListViewSelectionEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MapBubblePoint.html" data-type="entity-link" >MapBubblePoint</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MapLine.html" data-type="entity-link" >MapLine</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MapMarker.html" data-type="entity-link" >MapMarker</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MapPoint.html" data-type="entity-link" >MapPoint</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MapRegion.html" data-type="entity-link" >MapRegion</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MarimekkoItem.html" data-type="entity-link" >MarimekkoItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MarimekkoSegment.html" data-type="entity-link" >MarimekkoSegment</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MaskResult.html" data-type="entity-link" >MaskResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MatrixItem.html" data-type="entity-link" >MatrixItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MenuItem.html" data-type="entity-link" >MenuItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NetworkLink.html" data-type="entity-link" >NetworkLink</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NetworkNode.html" data-type="entity-link" >NetworkNode</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NgxCoreI18n.html" data-type="entity-link" >NgxCoreI18n</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NgxCoreI18n-1.html" data-type="entity-link" >NgxCoreI18n</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NotificationItem.html" data-type="entity-link" >NotificationItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NotificationOptions.html" data-type="entity-link" >NotificationOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OHLCItem.html" data-type="entity-link" >OHLCItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OrgChartNode.html" data-type="entity-link" >OrgChartNode</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OrgNode.html" data-type="entity-link" >OrgNode</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ParallelLine.html" data-type="entity-link" >ParallelLine</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ParetoItem.html" data-type="entity-link" >ParetoItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PdfExportOptions.html" data-type="entity-link" >PdfExportOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PFCell.html" data-type="entity-link" >PFCell</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PFColumn.html" data-type="entity-link" >PFColumn</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PictorialIcon.html" data-type="entity-link" >PictorialIcon</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PivotColumn.html" data-type="entity-link" >PivotColumn</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PivotRow.html" data-type="entity-link" >PivotRow</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PivotValueDef.html" data-type="entity-link" >PivotValueDef</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PlacedWord.html" data-type="entity-link" >PlacedWord</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PreviewFileItem.html" data-type="entity-link" >PreviewFileItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProcessedCell.html" data-type="entity-link" >ProcessedCell</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProcessedCol.html" data-type="entity-link" >ProcessedCol</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProcessedDependency.html" data-type="entity-link" >ProcessedDependency</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProcessedLink.html" data-type="entity-link" >ProcessedLink</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProcessedLink-1.html" data-type="entity-link" >ProcessedLink</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProcessedNode.html" data-type="entity-link" >ProcessedNode</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProcessedNode-1.html" data-type="entity-link" >ProcessedNode</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProcessedNode-2.html" data-type="entity-link" >ProcessedNode</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProcessedNode-3.html" data-type="entity-link" >ProcessedNode</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProcessedNode-4.html" data-type="entity-link" >ProcessedNode</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProcessedNode-5.html" data-type="entity-link" >ProcessedNode</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProcessedPoint.html" data-type="entity-link" >ProcessedPoint</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProcessedRibbon.html" data-type="entity-link" >ProcessedRibbon</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProcessedSegment.html" data-type="entity-link" >ProcessedSegment</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProcessedSlice.html" data-type="entity-link" >ProcessedSlice</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProcessedVector.html" data-type="entity-link" >ProcessedVector</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProcessedWedge.html" data-type="entity-link" >ProcessedWedge</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProcessedWedgeBin.html" data-type="entity-link" >ProcessedWedgeBin</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PyramidItem.html" data-type="entity-link" >PyramidItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/QuickReply.html" data-type="entity-link" >QuickReply</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RadarSeries.html" data-type="entity-link" >RadarSeries</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RadialBarItem.html" data-type="entity-link" >RadialBarItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RadioOption.html" data-type="entity-link" >RadioOption</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RAGSource.html" data-type="entity-link" >RAGSource</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RangeBarItem.html" data-type="entity-link" >RangeBarItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Rect.html" data-type="entity-link" >Rect</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RenderLink.html" data-type="entity-link" >RenderLink</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RenderNode.html" data-type="entity-link" >RenderNode</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RenkoBrick.html" data-type="entity-link" >RenkoBrick</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ResizeState.html" data-type="entity-link" >ResizeState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ResolvedSchedulerEvent.html" data-type="entity-link" >ResolvedSchedulerEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RidgelineItem.html" data-type="entity-link" >RidgelineItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RowGroup.html" data-type="entity-link" >RowGroup</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SankeyLink.html" data-type="entity-link" >SankeyLink</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SankeyNode.html" data-type="entity-link" >SankeyNode</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ScatterPoint.html" data-type="entity-link" >ScatterPoint</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SchedulerEvent.html" data-type="entity-link" >SchedulerEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SchedulerEventChangeEvent.html" data-type="entity-link" >SchedulerEventChangeEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SchedulerEventLayout.html" data-type="entity-link" >SchedulerEventLayout</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SchedulerRecurrence.html" data-type="entity-link" >SchedulerRecurrence</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SchedulerResource.html" data-type="entity-link" >SchedulerResource</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SchedulerSlotClickEvent.html" data-type="entity-link" >SchedulerSlotClickEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SchedulerSlotRangeSelectEvent.html" data-type="entity-link" >SchedulerSlotRangeSelectEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SegmentedOption.html" data-type="entity-link" >SegmentedOption</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SimulatedLink.html" data-type="entity-link" >SimulatedLink</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SimulatedNode.html" data-type="entity-link" >SimulatedNode</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SimulatedNode-1.html" data-type="entity-link" >SimulatedNode</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SlopeDataPoint.html" data-type="entity-link" >SlopeDataPoint</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SortDescriptor.html" data-type="entity-link" >SortDescriptor</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SpeedDialItem.html" data-type="entity-link" >SpeedDialItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SplitButtonItem.html" data-type="entity-link" >SplitButtonItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StepperStep.html" data-type="entity-link" >StepperStep</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StreamgraphSeries.html" data-type="entity-link" >StreamgraphSeries</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SunburstNode.html" data-type="entity-link" >SunburstNode</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SunburstSlice.html" data-type="entity-link" >SunburstSlice</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SwimlaneSection.html" data-type="entity-link" >SwimlaneSection</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TileItem.html" data-type="entity-link" >TileItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TimelineEvent.html" data-type="entity-link" >TimelineEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TimelineItem.html" data-type="entity-link" >TimelineItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TimeSlot.html" data-type="entity-link" >TimeSlot</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TooltipRow.html" data-type="entity-link" >TooltipRow</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TooltipState.html" data-type="entity-link" >TooltipState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TopologyLink.html" data-type="entity-link" >TopologyLink</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TopologyNode.html" data-type="entity-link" >TopologyNode</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TreeDataConfig.html" data-type="entity-link" >TreeDataConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TreeGraphNode.html" data-type="entity-link" >TreeGraphNode</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TreeLink.html" data-type="entity-link" >TreeLink</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TreemapItem.html" data-type="entity-link" >TreemapItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TreeNode.html" data-type="entity-link" >TreeNode</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TreeNodeEvent.html" data-type="entity-link" >TreeNodeEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UploadFileItem.html" data-type="entity-link" >UploadFileItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VariablePieDataPoint.html" data-type="entity-link" >VariablePieDataPoint</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VariwidePoint.html" data-type="entity-link" >VariwidePoint</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VectorItem.html" data-type="entity-link" >VectorItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VennRegion.html" data-type="entity-link" >VennRegion</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ViolinItem.html" data-type="entity-link" >ViolinItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VirtualListItem.html" data-type="entity-link" >VirtualListItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VirtualListItemClickEvent.html" data-type="entity-link" >VirtualListItemClickEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/WaterfallItem.html" data-type="entity-link" >WaterfallItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/WebLlmMessage.html" data-type="entity-link" >WebLlmMessage</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/WidgetMessage.html" data-type="entity-link" >WidgetMessage</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/WindRoseItem.html" data-type="entity-link" >WindRoseItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/WindRoseSpeedBin.html" data-type="entity-link" >WindRoseSpeedBin</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/WordItem.html" data-type="entity-link" >WordItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/XlsxExportOptions.html" data-type="entity-link" >XlsxExportOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/XlsxSheet.html" data-type="entity-link" >XlsxSheet</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#pipes-links"' :
                                'data-bs-target="#xs-pipes-links"' }>
                                <span class="icon ion-md-add"></span>
                                <span>Pipes</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="pipes-links"' : 'id="xs-pipes-links"' }>
                                <li class="link">
                                    <a href="pipes/NgxFormErrorPipe.html" data-type="entity-link" >NgxFormErrorPipe</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});