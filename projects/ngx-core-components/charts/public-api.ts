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
