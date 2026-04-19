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
export type { FlatRow } from './gantt-chart/services/gantt-layout.service';
export * from './gantt-chart/utils/date-utils';
