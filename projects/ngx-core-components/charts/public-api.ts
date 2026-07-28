/*
 * Public API Surface — secondary entry point: ngx-core-components/charts
 */

// Bar / Line / Pie / Sparkline charts
export { BarChartComponent } from './bar-chart/bar-chart.component';
export { LineChartComponent } from './line-chart/line-chart.component';
export { PieChartComponent } from './pie-chart/pie-chart.component';
export { SparklineComponent } from './sparkline/sparkline.component';
export type { ChartSeries, ChartDataPoint } from './shared/chart-utils';
export { CHART_COLORS } from './shared/chart-utils';

// Gantt Chart
export { GanttChartComponent } from './gantt-chart/gantt-chart.component';
export * from './gantt-chart/models';
export { GanttScaleService } from './gantt-chart/services/gantt-scale.service';
export { GanttPrintService } from './gantt-chart/services/gantt-print.service';
export type { FlatRow } from './gantt-chart/services/gantt-layout.service';
export * from './gantt-chart/utils/date-utils';

// Gauge & Radar charts
export { GaugeChartComponent } from './gauge-chart/gauge-chart.component';
export type { GaugeThreshold } from './gauge-chart/gauge-chart.component';
export { RadarChartComponent } from './radar-chart/radar-chart.component';
export type { RadarSeries } from './radar-chart/radar-chart.component';

// Heatmap & Treemap charts
export { HeatmapChartComponent } from './heatmap-chart/heatmap-chart.component';
export { TreemapChartComponent } from './treemap-chart/treemap-chart.component';
export type { TreemapItem } from './treemap-chart/treemap-chart.component';

// Area & Funnel charts
export { AreaChartComponent } from './area-chart/area-chart.component';
export { FunnelChartComponent } from './funnel-chart/funnel-chart.component';
export type { FunnelItem } from './funnel-chart/funnel-chart.component';

// Combo & Scatter charts
export { ComboChartComponent } from './combo-chart/combo-chart.component';
export { ScatterPlotComponent } from './scatter-plot/scatter-plot.component';
export type { ScatterPoint } from './scatter-plot/scatter-plot.component';

// Bubble & Sunburst charts
export { BubbleChartComponent } from './bubble-chart/bubble-chart.component';
export type { BubblePoint } from './bubble-chart/bubble-chart.component';
export { SunburstChartComponent } from './sunburst-chart/sunburst-chart.component';
export type { SunburstNode } from './sunburst-chart/sunburst-chart.component';

// Waterfall, Box Plot, Radial Bar, and Candlestick charts
export { WaterfallChartComponent } from './waterfall-chart/waterfall-chart.component';
export type { WaterfallItem } from './waterfall-chart/waterfall-chart.component';
export { BoxPlotChartComponent } from './box-plot-chart/box-plot-chart.component';
export type { BoxPlotItem } from './box-plot-chart/box-plot-chart.component';
export { RadialBarChartComponent } from './radial-bar-chart/radial-bar-chart.component';
export type { RadialBarItem } from './radial-bar-chart/radial-bar-chart.component';
export { CandlestickChartComponent } from './candlestick-chart/candlestick-chart.component';
export type { CandlestickItem } from './candlestick-chart/candlestick-chart.component';

// Polar Area & Bullet charts
export { PolarAreaChartComponent } from './polar-area-chart/polar-area-chart.component';
export { BulletChartComponent } from './bullet-chart/bullet-chart.component';

// Dumbbell Chart
export { DumbbellChartComponent } from './dumbbell-chart/dumbbell-chart.component';
export type { DumbbellItem } from './dumbbell-chart/dumbbell-chart.component';

// Lollipop Chart
export { LollipopChartComponent } from './lollipop-chart/lollipop-chart.component';

// Slope Chart
export { SlopeChartComponent } from './slope-chart/slope-chart.component';
export type { SlopeDataPoint } from './slope-chart/slope-chart.component';

// Sankey Chart
export { SankeyChartComponent } from './sankey-chart/sankey-chart.component';
export type { SankeyNode, SankeyLink } from './sankey-chart/sankey-chart.component';

// Violin Plot
export { ViolinPlotComponent } from './violin-plot/violin-plot.component';
export type { ViolinItem } from './violin-plot/violin-plot.component';

// Ridgeline Chart
export { RidgelineChartComponent } from './ridgeline-chart/ridgeline-chart.component';
export type { RidgelineItem } from './ridgeline-chart/ridgeline-chart.component';

// Pareto Chart
export { ParetoChartComponent } from './pareto-chart/pareto-chart.component';
export type { ParetoItem } from './pareto-chart/pareto-chart.component';

// Marimekko Chart
export { MarimekkoChartComponent } from './marimekko-chart/marimekko-chart.component';
export type { MarimekkoItem, MarimekkoSegment } from './marimekko-chart/marimekko-chart.component';

// Chord Diagram
export { ChordDiagramComponent } from './chord-diagram/chord-diagram.component';
export type { ChordItem } from './chord-diagram/chord-diagram.component';

// Dependency Wheel
export { DependencyWheelComponent } from './dependency-wheel/dependency-wheel.component';
export type { DependencyItem } from './dependency-wheel/dependency-wheel.component';

// Adjacency Matrix
export { AdjacencyMatrixComponent } from './adjacency-matrix/adjacency-matrix.component';
export type { MatrixItem } from './adjacency-matrix/adjacency-matrix.component';

// Biplot / PCA Plot
export { BiplotComponent } from './biplot/biplot.component';
export type { BiplotPoint, BiplotVector } from './biplot/biplot.component';

// Renko Chart
export { RenkoChartComponent } from './renko-chart/renko-chart.component';
export type { RenkoBrick } from './renko-chart/renko-chart.component';

// Kagi Chart
export { KagiChartComponent } from './kagi-chart/kagi-chart.component';
export type { KagiSegment } from './kagi-chart/kagi-chart.component';

// Point & Figure Chart
export { PointFigureChartComponent } from './point-figure-chart/point-figure-chart.component';
export type { PFCell } from './point-figure-chart/point-figure-chart.component';

// Wind Rose Chart
export { WindRoseChartComponent } from './wind-rose/wind-rose.component';
export type { WindRoseItem, WindRoseSpeedBin } from './wind-rose/wind-rose.component';

// Batch 1: Line, Area, Spline & Bar Ranges
export { AreaRangeChartComponent } from './area-range-chart/area-range-chart.component';
export type { AreaRangeSeries, AreaRangeDataPoint } from './area-range-chart/area-range-chart.component';
export { AreaSplineRangeChartComponent } from './area-spline-range-chart/area-spline-range-chart.component';
export { StreamgraphComponent } from './streamgraph/streamgraph.component';
export type { StreamgraphSeries } from './streamgraph/streamgraph.component';
export { ColumnRangeChartComponent } from './column-range-chart/column-range-chart.component';
export type { ColumnRangeSeries, ColumnRangePoint } from './column-range-chart/column-range-chart.component';
export { ColumnPyramidChartComponent } from './column-pyramid-chart/column-pyramid-chart.component';
export type { ColumnPyramidSeries } from './column-pyramid-chart/column-pyramid-chart.component';
export { VariwideChartComponent } from './variwide-chart/variwide-chart.component';
export type { VariwidePoint } from './variwide-chart/variwide-chart.component';

// Batch 2: Pie, Bubbles & Network Diagrams
export { VariablePieChartComponent } from './variable-pie-chart/variable-pie-chart.component';
export type { VariablePieDataPoint } from './variable-pie-chart/variable-pie-chart.component';
export { PackedBubbleChartComponent } from './packed-bubble-chart/packed-bubble-chart.component';
export type { BubbleNode } from './packed-bubble-chart/packed-bubble-chart.component';
export { NetworkGraphComponent } from './network-graph/network-graph.component';
export type { NetworkNode, NetworkLink } from './network-graph/network-graph.component';
export { TreeGraphComponent } from './treegraph/treegraph.component';
export type { TreeGraphNode } from './treegraph/treegraph.component';
export { ArcDiagramComponent } from './arc-diagram/arc-diagram.component';
export type { ArcNode, ArcLink } from './arc-diagram/arc-diagram.component';

// Batch 3: Statistical & Advanced Visualizations
export { HistogramComponent } from './histogram/histogram.component';
export type { HistogramBin } from './histogram/histogram.component';
export { BellCurveChartComponent } from './bell-curve-chart/bell-curve-chart.component';
export type { CurvePoint } from './bell-curve-chart/bell-curve-chart.component';
export { ErrorBarComponent } from './error-bar/error-bar.component';
export type { ErrorBarPoint } from './error-bar/error-bar.component';
export { TilemapComponent } from './tilemap/tilemap.component';
export type { TileItem } from './tilemap/tilemap.component';
export { VennDiagramComponent } from './venn-diagram/venn-diagram.component';
export type { VennRegion } from './venn-diagram/venn-diagram.component';
export { ParallelCoordinatesComponent } from './parallel-coordinates/parallel-coordinates.component';
export type { ParallelLine, AxisDimension } from './parallel-coordinates/parallel-coordinates.component';
export { WordCloudComponent } from './word-cloud/word-cloud.component';
export type { WordItem } from './word-cloud/word-cloud.component';
export { PictorialChartComponent } from './pictorial-chart/pictorial-chart.component';
export type { PictorialIcon } from './pictorial-chart/pictorial-chart.component';
export { VectorPlotComponent } from './vector-plot/vector-plot.component';
export type { VectorItem } from './vector-plot/vector-plot.component';

// Batch 4: Financial Indicators & Stock Options
export { OHLCChartComponent } from './ohlc-chart/ohlc-chart.component';
export type { OHLCItem } from './ohlc-chart/ohlc-chart.component';
export { HLCChartComponent } from './hlc-chart/hlc-chart.component';
export type { HLCItem } from './hlc-chart/hlc-chart.component';
export { HollowCandlestickChartComponent } from './hollow-candlestick-chart/hollow-candlestick-chart.component';
export { HeikinAshiChartComponent } from './heikin-ashi-chart/heikin-ashi-chart.component';
export { FlagsComponent } from './flags/flags.component';
export type { ChartFlag } from './flags/flags.component';

// Batch 5: Geographical Maps
export { MapChoroplethComponent } from './map-choropleth/map-choropleth.component';
export type { ChoroplethDataPoint } from './map-choropleth/map-choropleth.component';
export { MapBubbleComponent } from './map-bubble/map-bubble.component';
export type { MapBubblePoint } from './map-bubble/map-bubble.component';
export { MapLinePointComponent } from './map-line-point/map-line-point.component';
export type { MapPoint, MapLine } from './map-line-point/map-line-point.component';
export { FlowmapComponent } from './flowmap/flowmap.component';
export type { FlowNode, FlowConnection } from './flowmap/flowmap.component';
export { GeoHeatmapComponent } from './geo-heatmap/geo-heatmap.component';
export type { GeoHeatmapPoint } from './geo-heatmap/geo-heatmap.component';
export { TiledWebMapComponent } from './tiled-web-map/tiled-web-map.component';
export type { MapMarker } from './tiled-web-map/tiled-web-map.component';

// AI-Native Chart Types
export { TokenStreamingChartComponent } from './token-streaming-chart/token-streaming-chart.component';
export { EmbeddingSpaceProjectionComponent } from './embedding-space-projection/embedding-space-projection.component';
export type { EmbeddingPoint } from './embedding-space-projection/embedding-space-projection.component';
export { AgenticCognitiveTopologyComponent } from './agentic-cognitive-topology/agentic-cognitive-topology.component';
export type { TopologyNode, TopologyLink } from './agentic-cognitive-topology/agentic-cognitive-topology.component';
export { TransformerAttentionHeatmapComponent } from './transformer-attention-heatmap/transformer-attention-heatmap.component';

// Shared Chart Infrastructure
export { ChartThemeService } from './shared/chart-theme.service';
export type { ChartTheme, ChartThemeName, ColorblindMode } from './shared/chart-theme.service';
export type { ChartAnnotation, AnnotationType } from './shared/chart-annotations';
export { renderAnnotationSvg } from './shared/chart-annotations';
export { ChartSkeletonComponent } from './shared/chart-skeleton.component';
export { ChartSyncGroupDirective } from './shared/chart-sync-group.directive';
export { ChartBrushZoomComponent } from './shared/chart-brush-zoom.component';
export { ChartTooltipService } from './shared/chart-tooltip.service';
export type { TooltipState, TooltipRow } from './shared/chart-tooltip.service';

// New Chart Types — Step Line, Calendar Heatmap, Nested Donut, Pyramid, Range Bar
export { StepLineChartComponent } from './step-line-chart/step-line-chart.component';
export { CalendarHeatmapComponent } from './calendar-heatmap/calendar-heatmap.component';
export type { CalendarHeatmapData } from './calendar-heatmap/calendar-heatmap.component';
export { NestedDonutChartComponent } from './nested-donut-chart/nested-donut-chart.component';
export type { DonutRing } from './nested-donut-chart/nested-donut-chart.component';
export { PyramidChartComponent } from './pyramid-chart/pyramid-chart.component';
export type { PyramidItem } from './pyramid-chart/pyramid-chart.component';
export { RangeBarChartComponent } from './range-bar-chart/range-bar-chart.component';
export type { RangeBarItem } from './range-bar-chart/range-bar-chart.component';

// Timeline / Activity Chart
export { TimelineChartComponent } from './timeline-chart/timeline-chart.component';
export type { TimelineEvent } from './timeline-chart/timeline-chart.component';

// Org Chart
export { OrgChartComponent } from './org-chart/org-chart.component';
export type { OrgNode } from './org-chart/org-chart.component';

// Multi-Needle Gauge
export { MultiNeedleGaugeComponent } from './multi-needle-gauge/multi-needle-gauge.component';
export type { GaugeNeedle as MultiGaugeNeedle } from './multi-needle-gauge/multi-needle-gauge.component';


