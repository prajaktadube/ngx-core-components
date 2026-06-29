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


