import { Component, signal, computed, ElementRef, viewChild, inject, OnInit, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  BarChartComponent, LineChartComponent, PieChartComponent, SparklineComponent,
  GaugeChartComponent, RadarChartComponent, HeatmapChartComponent, TreemapChartComponent,
  AreaChartComponent, FunnelChartComponent, ComboChartComponent, ScatterPlotComponent,
  WaterfallChartComponent, BoxPlotChartComponent, RadialBarChartComponent, CandlestickChartComponent,
  BubbleChartComponent, SunburstChartComponent, PolarAreaChartComponent, BulletChartComponent,
  DumbbellChartComponent, LollipopChartComponent, SlopeChartComponent, SankeyChartComponent,
  ViolinPlotComponent, RidgelineChartComponent, ParetoChartComponent, MarimekkoChartComponent,
  ChordDiagramComponent, DependencyWheelComponent, AdjacencyMatrixComponent, BiplotComponent,
  RenkoChartComponent, KagiChartComponent, PointFigureChartComponent, WindRoseChartComponent,
  ChartSeries, ChartDataPoint, CHART_COLORS, GaugeThreshold, RadarSeries, TreemapItem, ScatterPoint,
  WaterfallItem, BoxPlotItem, RadialBarItem, CandlestickItem, FunnelItem, BubblePoint, SunburstNode,
  DumbbellItem, SlopeDataPoint, SankeyNode, SankeyLink,
  ViolinItem, RidgelineItem, ParetoItem, MarimekkoItem,
  ChordItem, DependencyItem, MatrixItem, BiplotPoint, BiplotVector, WindRoseItem
} from 'ngx-core-components';

// Import source codes for StackBlitz programmatic compiler
import * as Sources from './chart-sources';

interface ApiRow { name: string; type: string; default: string; description: string; }

@Component({
  selector: 'app-charts-demo',
  standalone: true,
  imports: [
    CommonModule,
    BarChartComponent, LineChartComponent, PieChartComponent, SparklineComponent,
    GaugeChartComponent, RadarChartComponent, HeatmapChartComponent, TreemapChartComponent,
    AreaChartComponent, FunnelChartComponent, ComboChartComponent, ScatterPlotComponent,
    WaterfallChartComponent, BoxPlotChartComponent, RadialBarChartComponent, CandlestickChartComponent,
    BubbleChartComponent, SunburstChartComponent, PolarAreaChartComponent, BulletChartComponent,
    DumbbellChartComponent, LollipopChartComponent, SlopeChartComponent, SankeyChartComponent,
    ViolinPlotComponent, RidgelineChartComponent, ParetoChartComponent, MarimekkoChartComponent,
    ChordDiagramComponent, DependencyWheelComponent, AdjacencyMatrixComponent, BiplotComponent,
    RenkoChartComponent, KagiChartComponent, PointFigureChartComponent, WindRoseChartComponent
  ],
  template: `
    <div class="demo-page" [class.dark-theme]="chartTheme() === 'dark'">
      
      <!-- Page Header -->
      <div class="page-header">
        <div class="page-header-text">
          <h1>Enterprise Chart Playground</h1>
          <p>SVG-based, standalone charting components with dynamic configuration panels, adaptive themes, interactive tooltips, copyable code, and StackBlitz sandbox integration.</p>
        </div>
        <div class="header-badges">
          <span class="badge badge-purple">Standalone</span>
          <span class="badge badge-blue">Interactive</span>
          <span class="badge badge-green">Angular 19</span>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="tab-nav-container">
        <div class="tab-nav">
          @for (tab of tabs; track tab) {
            <button 
              class="tab-btn" 
              [class.active]="activeTab() === tab" 
              (click)="activeTab.set(tab)"
            >{{ tab }}</button>
          }
        </div>
      </div>

      <!-- Playground Layout Grid -->
      <div class="playground-layout">
        
        <!-- LEFT: Preview & Code Section -->
        <div class="playground-left">
          
          <!-- Live Preview Card -->
          <div class="chart-preview-card" [style.background]="getThemeBg()">
            <div class="preview-header">
              <span class="preview-title">{{ activeTab() }} Preview</span>
              <span class="preview-badge">Active View</span>
            </div>

            <div class="chart-display-container">
              <!-- BAR CHART -->
              @if (activeTab() === 'Bar Chart') {
                <ngx-bar-chart 
                  [series]="barSeries" 
                  [categories]="months" 
                  [showLegend]="showLegend()" 
                  [showGrid]="showGrid()" 
                  [showLabels]="showLabels()"
                  [height]="chartHeight()" 
                  [colors]="getThemePalette()"
                  [showExport]="true" 
                  [referenceLines]="showRefLinesToggle() ? getReferenceLines() : []"
                  [labelFormatter]="useCustomFormatter() ? barFormatter : undefined"
                  [tooltipTemplate]="useCustomTooltip() ? customTooltipTemplate() || null : null"
                  (barClick)="onChartClick($event)"
                />
              }

              <!-- LINE CHART -->
              @if (activeTab() === 'Line Chart') {
                <ngx-line-chart 
                  [series]="lineSeries" 
                  [categories]="months" 
                  [showArea]="showArea()" 
                  [showMarkers]="showMarkers()" 
                  [showLegend]="showLegend()" 
                  [height]="chartHeight()" 
                  [colors]="getThemePalette()"
                  [showExport]="true" 
                  [referenceLines]="showRefLinesToggle() ? getReferenceLines() : []"
                  [showLabels]="showLabels()"
                  [labelFormatter]="useCustomFormatter() ? lineFormatter : undefined"
                  [tooltipTemplate]="useCustomTooltip() ? customTooltipTemplate() || null : null"
                  (pointClick)="onChartClick($event)"
                />
              }

              <!-- AREA CHART -->
              @if (activeTab() === 'Area Chart') {
                <ngx-area-chart 
                  [series]="lineSeries" 
                  [categories]="months" 
                  [showMarkers]="showMarkers()" 
                  [showLegend]="showLegend()" 
                  [showGrid]="showGrid()"
                  [height]="chartHeight()" 
                  [colors]="getThemePalette()"
                />
              }

              <!-- PIE / DONUT -->
              @if (activeTab() === 'Pie / Donut') {
                <ngx-pie-chart 
                  [data]="pieData" 
                  [mode]="pieMode()" 
                  [centerTitle]="donutTitle()" 
                  [centerValue]="donutValue()"
                  [donutHoleSize]="donutHoleSize()"
                  [showLegend]="showLegend()" 
                  [showLabels]="showLabels()" 
                  [height]="chartHeight()" 
                  [colors]="getThemePalette()"
                  [showExport]="true" 
                />
              }

              <!-- SPARKLINE -->
              @if (activeTab() === 'Sparkline') {
                <div class="sparkline-demo-container">
                  <div class="sparkline-table">
                    @for (row of sparklineRows; track row.name) {
                      <div class="sl-row" [style.background]="getThemeBgItem()">
                        <span class="sl-name">{{ row.name }}</span>
                        <ngx-sparkline 
                          [data]="row.data" 
                          [type]="sparklineType()" 
                          [color]="sparklineColor()" 
                          [width]="140" 
                          [height]="36"
                        />
                        <span class="sl-value">{{ row.data[row.data.length - 1] }}</span>
                        <span class="sl-trend" [class.up]="row.up" [class.down]="!row.up">{{ row.up ? '▲' : '▼' }} {{ row.change }}%</span>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- GAUGE CHART -->
              @if (activeTab() === 'Gauge Chart') {
                <div class="gauge-display-container">
                  <ngx-gauge-chart
                    [value]="gaugeValue()"
                    [min]="0"
                    [max]="100"
                    [label]="gaugeLabel()"
                    [type]="gaugeType()"
                    [showNeedle]="showGaugeNeedle()"
                    [thresholds]="gaugeThresholds"
                    [color]="getThemePalette()[0]"
                  />
                </div>
              }

              <!-- RADAR CHART -->
              @if (activeTab() === 'Radar Chart') {
                <div class="radar-display-container">
                  <ngx-radar-chart
                    [seriesData]="radarSeries"
                    [categories]="radarCategories"
                    [max]="100"
                    [colors]="getThemePalette()"
                  />
                </div>
              }

              <!-- HEATMAP CHART -->
              @if (activeTab() === 'Heatmap Chart') {
                <ngx-heatmap-chart
                  [data]="heatmapData()"
                  [xAxisLabels]="heatmapXLabels()"
                  [yAxisLabels]="heatmapYLabels()"
                  [colorRange]="[getThemeBgItem(), getThemePalette()[0]]"
                />
              }

              <!-- TREEMAP CHART -->
              @if (activeTab() === 'Treemap Chart') {
                <ngx-treemap-chart
                  [data]="treemapData()"
                  [colors]="getThemePalette()"
                />
              }

              <!-- FUNNEL / PYRAMID -->
              @if (activeTab() === 'Funnel / Pyramid Chart') {
                <ngx-funnel-chart 
                  [data]="funnelData()" 
                  [mode]="funnelMode()"
                  [colors]="getThemePalette()"
                />
              }

              <!-- COMBO CHART -->
              @if (activeTab() === 'Combo Chart') {
                <ngx-combo-chart
                  [barSeries]="comboBarSeries"
                  [lineSeries]="comboLineSeries"
                  [categories]="months"
                  [barYTitle]="'Sales ($K)'"
                  [lineYTitle]="'Margin (%)'"
                  [showLegend]="showLegend()"
                  [showGrid]="showGrid()"
                  [height]="chartHeight()"
                  [colors]="getThemePalette()"
                />
              }

              <!-- SCATTER PLOT -->
              @if (activeTab() === 'Scatter Plot') {
                <ngx-scatter-plot
                  [data]="scatterData"
                  [xTitle]="'Unit Price ($)'"
                  [yTitle]="'Units Sold'"
                  [showLegend]="showLegend()"
                  [showGrid]="showGrid()"
                  [height]="chartHeight()"
                  [colors]="getThemePalette()"
                />
              }

              <!-- WATERFALL CHART -->
              @if (activeTab() === 'Waterfall Chart') {
                <ngx-waterfall-chart
                  [data]="waterfallData"
                  [showGrid]="showGrid()"
                  [showLabels]="showLabels()"
                  [height]="chartHeight()"
                  [positiveColor]="waterfallPositiveColor()"
                  [negativeColor]="waterfallNegativeColor()"
                  [totalColor]="waterfallTotalColor()"
                />
              }

              <!-- BOX PLOT CHART -->
              @if (activeTab() === 'Box Plot Chart') {
                <ngx-box-plot-chart
                  [data]="boxPlotData"
                  [showGrid]="showGrid()"
                  [showLabels]="showLabels()"
                  [height]="chartHeight()"
                  [color]="boxPlotColor()"
                  [fillColor]="boxPlotFillColor()"
                  [outlierColor]="boxPlotOutlierColor()"
                />
              }

              <!-- RADIAL BAR CHART -->
              @if (activeTab() === 'Radial Bar Chart') {
                <ngx-radial-bar-chart
                  [data]="radialData"
                  [showLegend]="showLegend()"
                  [height]="chartHeight()"
                  [strokeWidth]="radialStrokeWidth()"
                  [ringGap]="radialRingGap()"
                  [colors]="getThemePalette()"
                />
              }

              <!-- CANDLESTICK CHART -->
              @if (activeTab() === 'Candlestick Chart') {
                <ngx-candlestick-chart
                  [data]="candlestickData"
                  [showGrid]="showGrid()"
                  [showLabels]="showLabels()"
                  [height]="chartHeight()"
                  [bullishColor]="candlestickBullishColor()"
                  [bearishColor]="candlestickBearishColor()"
                />
              }

              <!-- BUBBLE CHART -->
              @if (activeTab() === 'Bubble Chart') {
                <ngx-bubble-chart
                  [data]="bubbleData()"
                  [xTitle]="'R&D Spend ($M)'"
                  [yTitle]="'Market Share (%)'"
                  [zTitle]="'Revenue ($B)'"
                  [showLegend]="showLegend()"
                  [showGrid]="showGrid()"
                  [showLabels]="showLabels()"
                  [height]="chartHeight()"
                  [colors]="getThemePalette()"
                  [showExport]="true"
                />
              }

              <!-- SUNBURST CHART -->
              @if (activeTab() === 'Sunburst Chart') {
                <ngx-sunburst-chart
                  [data]="sunburstData()"
                  [showLegend]="showLegend()"
                  [showLabels]="showLabels()"
                  [height]="chartHeight()"
                  [colors]="getThemePalette()"
                  [showExport]="true"
                />
              }

              <!-- POLAR AREA CHART -->
              @if (activeTab() === 'Polar Area Chart') {
                <ngx-polar-area-chart
                  [data]="pieData"
                  [showLegend]="showLegend()"
                  [showLabels]="showLabels()"
                  [height]="chartHeight()"
                  [colors]="getThemePalette()"
                  [showExport]="true"
                />
              }

              <!-- BULLET CHART -->
              @if (activeTab() === 'Bullet Chart') {
                <div class="bullet-demo-container" style="display: flex; flex-direction: column; gap: 24px; width: 100%;">
                  <div class="bullet-demo-item">
                    <label class="field-label" style="font-size: 12px; font-weight: 600; margin-bottom: 4px; display: block; color: var(--ngx-chart-text, #0f172a);">Sales Performance (YTD)</label>
                    <ngx-bullet-chart
                      [value]="bulletValue()"
                      [target]="bulletTarget()"
                      [max]="bulletMax()"
                      [ranges]="[50, 85, 100]"
                      [rangeColors]="['#fee2e2', '#fef3c7', '#dcfce7']"
                      [valueColor]="'#10b981'"
                      [targetColor]="'#ef4444'"
                      [height]="40"
                    />
                  </div>
                  <div class="bullet-demo-item">
                    <label class="field-label" style="font-size: 12px; font-weight: 600; margin-bottom: 4px; display: block; color: var(--ngx-chart-text, #0f172a);">CPU Usage Gauge</label>
                    <ngx-bullet-chart
                      [value]="42"
                      [target]="80"
                      [max]="100"
                      [ranges]="[60, 85, 100]"
                      [rangeColors]="['#f1f5f9', '#e2e8f0', '#cbd5e1']"
                      [valueColor]="'#4f46e5'"
                      [targetColor]="'#000000'"
                      [height]="36"
                    />
                  </div>
                </div>
              }

              <!-- DUMBBELL CHART -->
              @if (activeTab() === 'Dumbbell Chart') {
                <ngx-dumbbell-chart
                  [data]="dumbbellData"
                  [showLegend]="showLegend()"
                  [showGrid]="showGrid()"
                  [showLabels]="showLabels()"
                  [height]="chartHeight()"
                  [colors]="getThemePalette()"
                />
              }

              <!-- LOLLIPOP CHART -->
              @if (activeTab() === 'Lollipop Chart') {
                <ngx-lollipop-chart
                  [data]="lollipopData"
                  [showGrid]="showGrid()"
                  [showLabels]="showLabels()"
                  [height]="chartHeight()"
                  [colors]="getThemePalette()"
                />
              }

              <!-- SLOPE CHART -->
              @if (activeTab() === 'Slope Chart') {
                <ngx-slope-chart
                  [data]="slopeData"
                  [showLabels]="showLabels()"
                  [showValues]="showLabels()"
                  [height]="chartHeight()"
                  [colors]="getThemePalette()"
                />
              }

              <!-- SANKEY CHART -->
              @if (activeTab() === 'Sankey Chart') {
                <ngx-sankey-chart
                  [nodes]="sankeyNodes"
                  [links]="sankeyLinks"
                  [showLabels]="showLabels()"
                  [showValues]="showLabels()"
                  [height]="chartHeight()"
                  [colors]="getThemePalette()"
                />
              }

              <!-- VIOLIN PLOT -->
              @if (activeTab() === 'Violin Plot') {
                <ngx-violin-plot
                  [data]="violinData"
                  [showGrid]="showGrid()"
                  [showLabels]="showLabels()"
                  [height]="chartHeight()"
                  [colors]="getThemePalette()"
                />
              }

              <!-- RIDGELINE CHART -->
              @if (activeTab() === 'Ridgeline Chart') {
                <ngx-ridgeline-chart
                  [data]="ridgelineData"
                  [showGrid]="showGrid()"
                  [showLabels]="showLabels()"
                  [height]="chartHeight()"
                  [colors]="getThemePalette()"
                />
              }

              <!-- PARETO CHART -->
              @if (activeTab() === 'Pareto Chart') {
                <ngx-pareto-chart
                  [data]="paretoData"
                  [showGrid]="showGrid()"
                  [showLabels]="showLabels()"
                  [height]="chartHeight()"
                  [barColor]="getThemePalette()[0]"
                  [lineColor]="getThemePalette()[1]"
                />
              }

              <!-- MARIMEKKO CHART -->
              @if (activeTab() === 'Marimekko Chart') {
                <ngx-marimekko-chart
                  [data]="marimekkoData"
                  [showGrid]="showGrid()"
                  [showLabels]="showLabels()"
                  [height]="chartHeight()"
                  [colors]="getThemePalette()"
                />
              }

              <!-- CHORD DIAGRAM -->
              @if (activeTab() === 'Chord Diagram') {
                <ngx-chord-diagram
                  [matrix]="chordMatrix"
                  [labels]="chordLabels"
                  [showLabels]="showLabels()"
                  [height]="chartHeight()"
                  [colors]="getThemePalette()"
                />
              }

              <!-- DEPENDENCY WHEEL -->
              @if (activeTab() === 'Dependency Wheel') {
                <ngx-dependency-wheel
                  [matrix]="chordMatrix"
                  [labels]="chordLabels"
                  [showLabels]="showLabels()"
                  [height]="chartHeight()"
                  [colors]="getThemePalette()"
                />
              }

              <!-- ADJACENCY MATRIX -->
              @if (activeTab() === 'Adjacency Matrix') {
                <ngx-adjacency-matrix
                  [matrix]="chordMatrix"
                  [labels]="chordLabels"
                  [showLabels]="showLabels()"
                  [height]="chartHeight()"
                  [color]="getThemePalette()[0]"
                />
              }

              <!-- BIPLOT / PCA PLOT -->
              @if (activeTab() === 'Biplot / PCA Plot') {
                <ngx-biplot
                  [points]="biplotPoints"
                  [vectors]="biplotVectors"
                  [showLabels]="showLabels()"
                  [height]="chartHeight()"
                  [colors]="getThemePalette()"
                />
              }

              <!-- RENKO CHART -->
              @if (activeTab() === 'Renko Chart') {
                <ngx-renko-chart
                  [data]="financialPrices"
                  [boxSize]="5"
                  [height]="chartHeight()"
                  [showGrid]="showGrid()"
                  [showExport]="true"
                  [tooltipTemplate]="useCustomTooltip() ? customTooltipTemplate() || null : null"
                  [labelFormatter]="useCustomFormatter() ? financialFormatter : undefined"
                />
              }

              <!-- KAGI CHART -->
              @if (activeTab() === 'Kagi Chart') {
                <ngx-kagi-chart
                  [data]="financialPrices"
                  [reversalAmount]="15"
                  [height]="chartHeight()"
                  [showGrid]="showGrid()"
                  [showExport]="true"
                  [tooltipTemplate]="useCustomTooltip() ? customTooltipTemplate() || null : null"
                  [labelFormatter]="useCustomFormatter() ? financialFormatter : undefined"
                />
              }

              <!-- POINT & FIGURE CHART -->
              @if (activeTab() === 'Point & Figure Chart') {
                <ngx-point-figure-chart
                  [data]="financialPrices"
                  [boxSize]="4"
                  [reversal]="3"
                  [height]="chartHeight()"
                  [showGrid]="showGrid()"
                  [showExport]="true"
                  [tooltipTemplate]="useCustomTooltip() ? customTooltipTemplate() || null : null"
                  [labelFormatter]="useCustomFormatter() ? financialFormatter : undefined"
                />
              }

              <!-- WIND ROSE -->
              @if (activeTab() === 'Wind Rose') {
                <ngx-wind-rose
                  [data]="windRoseData"
                  [height]="chartHeight()"
                  [colors]="getThemePalette()"
                  [showExport]="true"
                  [tooltipTemplate]="useCustomTooltip() ? customTooltipTemplate() || null : null"
                  [labelFormatter]="useCustomFormatter() ? roseFormatter : undefined"
                />
              }
            </div>
          </div>

          <!-- Event Logger Card -->
          @if (activeTab() === 'Bar Chart' || activeTab() === 'Line Chart') {
            <div class="event-logger-card">
              <div class="logger-header">
                <div class="logger-title">
                  <span class="logger-dot-indicator"></span>
                  Dashboard Action Logger
                </div>
                <button class="clear-log-btn" (click)="clearLogs()">Clear Logs</button>
              </div>
              <div class="logger-body">
                @if (chartClickLogs().length === 0) {
                  <div class="empty-logger-state">
                    Click on a bar or line point marker to see interactive events triggered in real time.
                  </div>
                } @else {
                  <div class="log-entries">
                    @for (log of chartClickLogs(); track log.timestamp) {
                      <div class="log-entry">
                        <span class="log-time">{{ log.time }}</span>
                        <span class="log-badge" [style.background]="getSeriesColor(log.seriesName)">
                          {{ log.seriesName }}
                        </span>
                        <span class="log-text">
                          Clicked category <strong class="highlight-text">"{{ log.category }}"</strong> with value <strong class="highlight-text">{{ log.value }}</strong>
                        </span>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          }

          <!-- Documentation Sub-Tabs -->
          <div class="doc-subtabs-card">
            <div class="subtab-header">
              <button 
                class="subtab-btn" 
                [class.active]="activeSubtab() === 'html'"
                (click)="activeSubtab.set('html')"
              >HTML Template</button>
              <button 
                class="subtab-btn" 
                [class.active]="activeSubtab() === 'ts'"
                (click)="activeSubtab.set('ts')"
              >TypeScript Code</button>
              <button 
                class="subtab-btn" 
                [class.active]="activeSubtab() === 'api'"
                (click)="activeSubtab.set('api')"
              >API & CSS Reference</button>
            </div>

            <div class="subtab-content">
              <!-- HTML CODE -->
              @if (activeSubtab() === 'html') {
                <div class="code-container">
                  <pre class="code-block"><code>{{ getHtmlTemplateString() }}</code></pre>
                  <button class="copy-btn" (click)="copyCode(getHtmlTemplateString())">📋 Copy Code</button>
                </div>
              }

              <!-- TS CODE -->
              @if (activeSubtab() === 'ts') {
                <div class="code-container">
                  <pre class="code-block"><code>{{ getTsTemplateString() }}</code></pre>
                  <button class="copy-btn" (click)="copyCode(getTsTemplateString())">📋 Copy Code</button>
                </div>
              }

              <!-- API & CSS -->
              @if (activeSubtab() === 'api') {
                <div class="api-docs-container">
                  <div class="section-label">API Reference — Inputs</div>
                  <div class="api-table-wrap">
                    <table class="api-table">
                      <thead>
                        <tr><th>Input</th><th>Type</th><th>Default</th><th>Description</th></tr>
                      </thead>
                      <tbody>
                        @for (row of getApiInputs(); track row.name) {
                          <tr>
                            <td class="api-name">{{ row.name }}</td>
                            <td class="api-type">{{ row.type }}</td>
                            <td class="api-default">{{ row.default }}</td>
                            <td>{{ row.description }}</td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>

                  <div class="section-label" style="margin-top: 24px;">CSS Custom Properties</div>
                  <div class="api-table-wrap">
                    <table class="api-table">
                      <thead>
                        <tr><th>Variable</th><th>Default</th><th>Description</th></tr>
                      </thead>
                      <tbody>
                        @for (row of chartCssVars; track row.name) {
                          <tr>
                            <td class="api-name">{{ row.name }}</td>
                            <td class="api-default">{{ row.default }}</td>
                            <td>{{ row.description }}</td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              }
            </div>
          </div>

        </div>

        <!-- RIGHT: Config Panel -->
        <div class="playground-right">
          <div class="config-card">
            <div class="config-header">
              <h3>Configuration</h3>
              <div class="sandbox-buttons">
                <button class="stackblitz-btn" (click)="editInStackBlitz()">
                  ⚡ StackBlitz
                </button>
                <button class="codesandbox-btn" (click)="editInCodeSandbox()">
                  📦 CodeSandbox
                </button>
              </div>
            </div>

            <div class="config-body">
              
              <!-- SECTION: General Theme settings -->
              <div class="config-section">
                <div class="config-section-title">General Properties</div>
                
                <div class="config-control">
                  <label>Color Theme</label>
                  <select [value]="chartTheme()" (change)="onThemeChange($event)">
                    <option value="light">☀️ Classic Light</option>
                    <option value="dark">🌙 Dark Premium</option>
                    <option value="emerald">💚 Emerald Mint</option>
                    <option value="sunset">🧡 Sunset Glow</option>
                  </select>
                </div>

                <div class="config-control">
                  <label>Chart Height (px)</label>
                  <input type="range" min="200" max="450" step="10" [value]="chartHeight()" (input)="onHeightChange($event)" />
                  <span class="control-value">{{ chartHeight() }}px</span>
                </div>

                <!-- Toggles depending on support -->
                @if (hasGeneralToggle('legend')) {
                  <label class="checkbox-control">
                    <input type="checkbox" [checked]="showLegend()" (change)="showLegend.set($any($event.target).checked)" />
                    Show Legend
                  </label>
                }

                @if (hasGeneralToggle('grid')) {
                  <label class="checkbox-control">
                    <input type="checkbox" [checked]="showGrid()" (change)="showGrid.set($any($event.target).checked)" />
                    Show Background Grid
                  </label>
                }

                @if (hasGeneralToggle('labels')) {
                  <label class="checkbox-control">
                    <input type="checkbox" [checked]="showLabels()" (change)="showLabels.set($any($event.target).checked)" />
                    Show Data Labels
                  </label>
                }
              </div>

              <!-- SECTION: Enterprise settings -->
              @if (activeTab() === 'Bar Chart' || activeTab() === 'Line Chart') {
                <div class="config-section">
                  <div class="config-section-title">Enterprise Settings</div>
                  
                  <label class="checkbox-control">
                    <input type="checkbox" [checked]="showRefLinesToggle()" (change)="showRefLinesToggle.set($any($event.target).checked)" />
                    Enable Reference Lines
                  </label>

                  <label class="checkbox-control">
                    <input type="checkbox" [checked]="useCustomFormatter()" (change)="useCustomFormatter.set($any($event.target).checked)" />
                    Use Custom Label Formatter
                  </label>

                  <label class="checkbox-control">
                    <input type="checkbox" [checked]="useCustomTooltip()" (change)="useCustomTooltip.set($any($event.target).checked)" />
                    Use Custom Tooltip Template
                  </label>
                </div>
              }

              <!-- SECTION: Chart-specific properties -->
              <div class="config-section">
                <div class="config-section-title">{{ activeTab() }} Specifics</div>

                <!-- PIE / DONUT options -->
                @if (activeTab() === 'Pie / Donut') {
                  <div class="config-control">
                    <label>Chart Mode</label>
                    <select [value]="pieMode()" (change)="pieMode.set($any($event.target).value)">
                      <option value="pie">Full Pie</option>
                      <option value="donut">Donut Ring</option>
                    </select>
                  </div>
                  @if (pieMode() === 'donut') {
                    <div class="config-control">
                      <label>Donut Center Title</label>
                      <input type="text" [value]="donutTitle()" (input)="donutTitle.set($any($event.target).value)" />
                    </div>
                    <div class="config-control">
                      <label>Donut Hole Radius</label>
                      <input type="range" min="0.3" max="0.8" step="0.05" [value]="donutHoleSize()" (input)="donutHoleSize.set(Number($any($event.target).value))" />
                      <span class="control-value">{{ donutHoleSize() | percent }}</span>
                    </div>
                  }
                }

                <!-- LINE options -->
                @if (activeTab() === 'Line Chart') {
                  <label class="checkbox-control">
                    <input type="checkbox" [checked]="showArea()" (change)="showArea.set($any($event.target).checked)" />
                    Fill Area Under Line
                  </label>
                  <label class="checkbox-control">
                    <input type="checkbox" [checked]="showMarkers()" (change)="showMarkers.set($any($event.target).checked)" />
                    Display Markers
                  </label>
                }

                <!-- AREA options -->
                @if (activeTab() === 'Area Chart') {
                  <label class="checkbox-control">
                    <input type="checkbox" [checked]="showMarkers()" (change)="showMarkers.set($any($event.target).checked)" />
                    Display Markers
                  </label>
                }

                <!-- SPARKLINE options -->
                @if (activeTab() === 'Sparkline') {
                  <div class="config-control">
                    <label>Sparkline Type</label>
                    <select [value]="sparklineType()" (change)="sparklineType.set($any($event.target).value)">
                      <option value="line">Line Spark</option>
                      <option value="area">Area Segment</option>
                      <option value="bar">Bar Spikes</option>
                    </select>
                  </div>
                  <div class="config-control">
                    <label>Sparkline Color</label>
                    <input type="color" [value]="sparklineColor()" (change)="sparklineColor.set($any($event.target).value)" />
                  </div>
                }

                <!-- GAUGE options -->
                @if (activeTab() === 'Gauge Chart') {
                  <div class="config-control">
                    <label>Current Value</label>
                    <input type="range" min="0" max="100" [value]="gaugeValue()" (input)="onGaugeValueChange($event)" />
                    <span class="control-value">{{ gaugeValue() }} / 100</span>
                  </div>
                  <div class="config-control">
                    <label>Dial Form Type</label>
                    <select [value]="gaugeType()" (change)="onGaugeTypeChange($event)">
                      <option value="semi">Semi Circular (180°)</option>
                      <option value="full">Full Dial (280°)</option>
                    </select>
                  </div>
                  <label class="checkbox-control">
                    <input type="checkbox" [checked]="showGaugeNeedle()" (change)="showGaugeNeedle.set($any($event.target).checked)" />
                    Show Needle Pointer
                  </label>
                }

                <!-- BULLET options -->
                @if (activeTab() === 'Bullet Chart') {
                  <div class="config-control">
                    <label>Bullet Value</label>
                    <input type="range" min="0" [max]="bulletMax()" step="1" [value]="bulletValue()" (input)="bulletValue.set(Number($any($event.target).value))" />
                    <span class="control-value">{{ bulletValue() }}</span>
                  </div>
                  <div class="config-control">
                    <label>Bullet Target</label>
                    <input type="range" min="0" [max]="bulletMax()" step="1" [value]="bulletTarget()" (input)="bulletTarget.set(Number($any($event.target).value))" />
                    <span class="control-value">{{ bulletTarget() }}</span>
                  </div>
                  <div class="config-control">
                    <label>Bullet Max</label>
                    <input type="number" [value]="bulletMax()" (input)="bulletMax.set(Number($any($event.target).value))" style="width: 100%;" />
                  </div>
                }

                <!-- FUNNEL / PYRAMID options -->
                @if (activeTab() === 'Funnel / Pyramid Chart') {
                  <div class="config-control">
                    <label>Layout Flow</label>
                    <select [value]="funnelMode()" (change)="funnelMode.set($any($event.target).value)">
                      <option value="funnel">Funnel (Descending)</option>
                      <option value="pyramid">Pyramid (Ascending Apex)</option>
                    </select>
                  </div>
                }

                <!-- WATERFALL options -->
                @if (activeTab() === 'Waterfall Chart') {
                  <div class="config-control">
                    <label>Positive Color</label>
                    <input type="color" [value]="waterfallPositiveColor()" (change)="waterfallPositiveColor.set($any($event.target).value)" />
                  </div>
                  <div class="config-control">
                    <label>Negative Color</label>
                    <input type="color" [value]="waterfallNegativeColor()" (change)="waterfallNegativeColor.set($any($event.target).value)" />
                  </div>
                  <div class="config-control">
                    <label>Total Color</label>
                    <input type="color" [value]="waterfallTotalColor()" (change)="waterfallTotalColor.set($any($event.target).value)" />
                  </div>
                }

                <!-- BOX PLOT options -->
                @if (activeTab() === 'Box Plot Chart') {
                  <div class="config-control">
                    <label>Box Outline Color</label>
                    <input type="color" [value]="boxPlotColor()" (change)="boxPlotColor.set($any($event.target).value)" />
                  </div>
                  <div class="config-control">
                    <label>Outlier Indicator Color</label>
                    <input type="color" [value]="boxPlotOutlierColor()" (change)="boxPlotOutlierColor.set($any($event.target).value)" />
                  </div>
                }

                <!-- RADIAL BAR options -->
                @if (activeTab() === 'Radial Bar Chart') {
                  <div class="config-control">
                    <label>Ring Thickness</label>
                    <input type="range" min="6" max="18" step="1" [value]="radialStrokeWidth()" (input)="radialStrokeWidth.set(Number($any($event.target).value))" />
                    <span class="control-value">{{ radialStrokeWidth() }}px</span>
                  </div>
                  <div class="config-control">
                    <label>Ring Gap Distance</label>
                    <input type="range" min="2" max="10" step="1" [value]="radialRingGap()" (input)="radialRingGap.set(Number($any($event.target).value))" />
                    <span class="control-value">{{ radialRingGap() }}px</span>
                  </div>
                }

                <!-- CANDLESTICK options -->
                @if (activeTab() === 'Candlestick Chart') {
                  <div class="config-control">
                    <label>Bullish Color (Bull)</label>
                    <input type="color" [value]="candlestickBullishColor()" (change)="candlestickBullishColor.set($any($event.target).value)" />
                  </div>
                  <div class="config-control">
                    <label>Bearish Color (Bear)</label>
                    <input type="color" [value]="candlestickBearishColor()" (change)="candlestickBearishColor.set($any($event.target).value)" />
                  </div>
                }

                @if (!hasSpecificControls()) {
                  <div style="font-size: 12px; color: #94a3b8; font-style: italic;">
                    No specific options for this chart type. Use general settings.
                  </div>
                }

              </div>

            </div>
          </div>
        </div>

      </div>

      <!-- Custom Tooltip Template -->
      <ng-template #customTooltip let-t>
        <div class="custom-premium-tooltip">
          <!-- Standard Charts: Bar, Line, Pie, etc. -->
          @if (activeTab() !== 'Renko Chart' && activeTab() !== 'Kagi Chart' && activeTab() !== 'Point & Figure Chart' && activeTab() !== 'Wind Rose') {
            <div class="tooltip-header">
              <span class="tooltip-title">{{ t.cat }} Detail</span>
              <span class="tooltip-status">Live</span>
            </div>
            <div class="tooltip-divider"></div>
            <div class="tooltip-rows">
              @for (row of t.rows; track row.name) {
                <div class="tooltip-row-item">
                  <div class="tooltip-row-header">
                    <span class="tooltip-row-dot" [style.background]="row.color"></span>
                    <span class="tooltip-row-name">{{ row.name }}</span>
                    <span class="tooltip-row-value">{{ useCustomFormatter() ? (activeTab() === 'Bar Chart' ? barFormatter(row.value) : lineFormatter(row.value)) : fmtNum(row.value) }}</span>
                  </div>
                  <div class="tooltip-progress-track">
                    <div class="tooltip-progress-bar" [style.background]="row.color" [style.width.%]="getProgressPercent(row.value)"></div>
                  </div>
                </div>
              }
            </div>
          }

          <!-- Renko Chart Custom Tooltip -->
          @if (activeTab() === 'Renko Chart') {
            <div class="tooltip-header">
              <span class="tooltip-title">Renko Brick Detail</span>
              <span class="tooltip-status" [style.color]="t.color">{{ t.type === 'bullish' ? 'Yang (Bullish)' : 'Yin (Bearish)' }}</span>
            </div>
            <div class="tooltip-divider"></div>
            <div class="tooltip-rows">
              <div class="tooltip-row-item">
                <div class="tooltip-row-header">
                  <span class="tooltip-row-name">Open Price</span>
                  <span class="tooltip-row-value">{{ useCustomFormatter() ? financialFormatter(t.open) : fmtNum(t.open) }}</span>
                </div>
              </div>
              <div class="tooltip-row-item">
                <div class="tooltip-row-header">
                  <span class="tooltip-row-name">Close Price</span>
                  <span class="tooltip-row-value">{{ useCustomFormatter() ? financialFormatter(t.close) : fmtNum(t.close) }}</span>
                </div>
              </div>
            </div>
          }

          <!-- Kagi Chart Custom Tooltip -->
          @if (activeTab() === 'Kagi Chart') {
            <div class="tooltip-header">
              <span class="tooltip-title">Kagi Segment</span>
              <span class="tooltip-status" [style.color]="t.color">{{ t.trend === 'bullish' ? 'Yang (Bullish)' : 'Yin (Bearish)' }}</span>
            </div>
            <div class="tooltip-divider"></div>
            <div class="tooltip-rows">
              @if (t.type === 'vertical') {
                <div class="tooltip-row-item">
                  <div class="tooltip-row-header">
                    <span class="tooltip-row-name">From Price</span>
                    <span class="tooltip-row-value">{{ useCustomFormatter() ? financialFormatter(t.val1) : fmtNum(t.val1) }}</span>
                  </div>
                </div>
                <div class="tooltip-row-item">
                  <div class="tooltip-row-header">
                    <span class="tooltip-row-name">To Price</span>
                    <span class="tooltip-row-value">{{ useCustomFormatter() ? financialFormatter(t.val2) : fmtNum(t.val2) }}</span>
                  </div>
                </div>
              } @else {
                <div class="tooltip-row-item">
                  <div class="tooltip-row-header">
                    <span class="tooltip-row-name">Reversal Extrema</span>
                    <span class="tooltip-row-value">{{ useCustomFormatter() ? financialFormatter(t.val1) : fmtNum(t.val1) }}</span>
                  </div>
                </div>
              }
            </div>
          }

          <!-- Point & Figure Custom Tooltip -->
          @if (activeTab() === 'Point & Figure Chart') {
            <div class="tooltip-header">
              <span class="tooltip-title">P&F Cell Detail</span>
              <span class="tooltip-status" [style.color]="t.color">{{ t.type === 'X' ? 'Rise (X)' : 'Fall (O)' }}</span>
            </div>
            <div class="tooltip-divider"></div>
            <div class="tooltip-rows">
              <div class="tooltip-row-item">
                <div class="tooltip-row-header">
                  <span class="tooltip-row-name">Level</span>
                  <span class="tooltip-row-value">{{ useCustomFormatter() ? financialFormatter(t.value) : fmtNum(t.value) }}</span>
                </div>
              </div>
              <div class="tooltip-row-item">
                <div class="tooltip-row-header">
                  <span class="tooltip-row-name">Column Index</span>
                  <span class="tooltip-row-value">#{{ t.colIdx + 1 }}</span>
                </div>
              </div>
            </div>
          }

          <!-- Wind Rose Custom Tooltip -->
          @if (activeTab() === 'Wind Rose') {
            <div class="tooltip-header">
              <span class="tooltip-title">{{ t.direction }} Sector</span>
              <span class="tooltip-status">Wind Rose</span>
            </div>
            <div class="tooltip-divider"></div>
            <div class="tooltip-rows">
              <div class="tooltip-row-item">
                <div class="tooltip-row-header">
                  <span class="tooltip-row-dot" [style.background]="t.color"></span>
                  <span class="tooltip-row-name">{{ t.binLabel }}</span>
                  <span class="tooltip-row-value">{{ useCustomFormatter() ? roseFormatter(t.value) : t.value.toFixed(1) + '%' }}</span>
                </div>
              </div>
              <div class="tooltip-row-item">
                <div class="tooltip-row-header">
                  <span class="tooltip-row-name">Sector Total</span>
                  <span class="tooltip-row-value">{{ useCustomFormatter() ? roseFormatter(t.cumValue) : t.cumValue.toFixed(1) + '%' }}</span>
                </div>
              </div>
            </div>
          }
        </div>
      </ng-template>

    </div>
  `,
  styles: [`
    :host { 
      display: flex; 
      flex-direction: column; 
      height: 100%; 
      overflow-y: auto; 
      background: var(--ngx-chart-bg-site, #f8fafc);
    }
    .demo-page { 
      padding: 28px; 
      max-width: 1200px; 
      margin: 0 auto; 
      width: 100%; 
      box-sizing: border-box;
      display: flex; 
      flex-direction: column; 
      gap: 24px;
      transition: background-color 0.3s;
    }
    .demo-page.dark-theme {
      background: #0f172a;
      color: #f8fafc;
      --ngx-chart-bg-site: #0f172a;
      --bg-card: #1e293b;
      --border-card: rgba(255, 255, 255, 0.05);
      --text-muted: #94a3b8;
    }

    /* Page Header */
    .page-header { 
      display: flex; 
      align-items: flex-start; 
      justify-content: space-between; 
      gap: 16px; 
      padding-bottom: 20px; 
      border-bottom: 1px solid rgba(0, 0, 0, 0.08); 
    }
    .dark-theme .page-header {
      border-bottom-color: rgba(255, 255, 255, 0.1);
    }
    .page-header-text h1 { 
      margin: 0 0 6px; 
      font-size: 26px; 
      font-weight: 800; 
      color: #1e293b; 
    }
    .dark-theme .page-header-text h1 { color: #f8fafc; }
    .page-header-text p { 
      margin: 0; 
      font-size: 13px; 
      color: #64748b; 
      line-height: 1.6; 
      max-width: 700px; 
    }
    .dark-theme .page-header-text p { color: #94a3b8; }
    .header-badges { display: flex; gap: 8px; flex-shrink: 0; }
    .badge { font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 12px; }
    .badge-purple { background: #f3e8ff; color: #7c3aed; }
    .badge-blue { background: #e0f2fe; color: #0284c7; }
    .badge-green { background: #dcfce7; color: #166534; }

    /* Tabs */
    .tab-nav-container {
      width: 100%;
      overflow-x: auto;
      border-bottom: 2px solid rgba(0, 0, 0, 0.06);
    }
    .dark-theme .tab-nav-container {
      border-bottom-color: rgba(255, 255, 255, 0.1);
    }
    .tab-nav { 
      display: flex; 
      gap: 4px; 
      padding-bottom: 2px;
      min-width: max-content;
    }
    .tab-btn { 
      padding: 10px 18px; 
      background: none; 
      border: none; 
      font-size: 13px; 
      font-weight: 600; 
      color: #64748b; 
      cursor: pointer; 
      border-bottom: 2px solid transparent; 
      margin-bottom: -2px; 
      font-family: inherit; 
      transition: all 0.2s; 
    }
    .tab-btn:hover { color: #1e293b; }
    .dark-theme .tab-btn:hover { color: #f8fafc; }
    .tab-btn.active { 
      color: #4f46e5; 
      border-bottom-color: #4f46e5; 
    }
    .dark-theme .tab-btn.active {
      color: #818cf8;
      border-bottom-color: #818cf8;
    }

    /* Layout Grid */
    .playground-layout {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 24px;
      align-items: start;
    }
    @media (max-width: 900px) {
      .playground-layout {
        grid-template-columns: 1fr;
      }
    }

    /* Preview Card */
    .chart-preview-card {
      background: #ffffff;
      border: 1px solid rgba(0, 0, 0, 0.05);
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05);
      margin-bottom: 24px;
      transition: background-color 0.2s, box-shadow 0.2s;
    }
    .dark-theme .chart-preview-card {
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }
    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      border-bottom: 1px solid rgba(0,0,0,0.05);
      padding-bottom: 10px;
    }
    .dark-theme .preview-header {
      border-bottom-color: rgba(255,255,255,0.06);
    }
    .preview-title {
      font-size: 14px;
      font-weight: 700;
      color: #334155;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .dark-theme .preview-title { color: #cbd5e1; }
    .preview-badge {
      font-size: 9px;
      font-weight: 700;
      background: #e2e8f0;
      color: #475569;
      padding: 2px 8px;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .dark-theme .preview-badge {
      background: #334155;
      color: #94a3b8;
    }
    .chart-display-container {
      width: 100%;
      min-height: 280px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    /* Sub-tabs code documentation */
    .doc-subtabs-card {
      background: #ffffff;
      border: 1px solid rgba(0, 0, 0, 0.05);
      border-radius: 16px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }
    .dark-theme .doc-subtabs-card {
      background: #1e293b;
      border-color: rgba(255,255,255,0.05);
    }
    .subtab-header {
      display: flex;
      background: #f8fafc;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      border-radius: 16px 16px 0 0;
      padding: 0 8px;
    }
    .dark-theme .subtab-header {
      background: #111827;
      border-bottom-color: rgba(255,255,255,0.05);
    }
    .subtab-btn {
      padding: 12px 20px;
      background: none;
      border: none;
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
      font-family: inherit;
      transition: all 0.15s;
    }
    .subtab-btn:hover { color: #334155; }
    .dark-theme .subtab-btn:hover { color: #cbd5e1; }
    .subtab-btn.active {
      color: #4f46e5;
      border-bottom-color: #4f46e5;
    }
    .dark-theme .subtab-btn.active {
      color: #818cf8;
      border-bottom-color: #818cf8;
    }
    .subtab-content {
      padding: 20px;
    }

    /* Code Block copy container */
    .code-container {
      position: relative;
    }
    .code-block { 
      margin: 0;
      background: #0f172a; 
      color: #38bdf8; 
      border-radius: 8px; 
      padding: 18px 24px; 
      font-size: 12px; 
      line-height: 1.6; 
      overflow-x: auto; 
      white-space: pre; 
      font-family: 'SF Mono', Consolas, Menlo, monospace; 
    }
    .copy-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      padding: 4px 10px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #cbd5e1;
      font-size: 11px;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.15s;
    }
    .copy-btn:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #ffffff;
    }

    /* Config panel card */
    .config-card {
      background: #ffffff;
      border: 1px solid rgba(0, 0, 0, 0.05);
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
    }
    .dark-theme .config-card {
      background: #1e293b;
      border-color: rgba(255,255,255,0.05);
    }
    .config-header {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 20px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      padding-bottom: 14px;
    }
    .dark-theme .config-header {
      border-bottom-color: rgba(255,255,255,0.06);
    }
    .config-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 800;
      color: #1e293b;
    }
    .dark-theme .config-header h3 { color: #f8fafc; }
    
    .sandbox-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      width: 100%;
    }
    .stackblitz-btn {
      width: 100%;
      background: #1389fd;
      color: #ffffff;
      border: none;
      padding: 10px;
      font-weight: 700;
      font-size: 11px;
      border-radius: 8px;
      cursor: pointer;
      font-family: inherit;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      transition: background 0.2s, transform 0.1s;
    }
    .stackblitz-btn:hover {
      background: #006ee6;
    }
    .stackblitz-btn:active {
      transform: scale(0.98);
    }
    .codesandbox-btn {
      width: 100%;
      background: #151515;
      color: #ffffff;
      border: none;
      padding: 10px;
      font-weight: 700;
      font-size: 11px;
      border-radius: 8px;
      cursor: pointer;
      font-family: inherit;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      transition: background 0.2s, transform 0.1s;
    }
    .codesandbox-btn:hover {
      background: #252525;
    }
    .codesandbox-btn:active {
      transform: scale(0.98);
    }

    .config-body {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .config-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .config-section-title {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #94a3b8;
      border-bottom: 1px solid rgba(0,0,0,0.03);
      padding-bottom: 4px;
    }
    .dark-theme .config-section-title {
      border-bottom-color: rgba(255,255,255,0.03);
    }
    .config-control {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .config-control label {
      font-size: 12px;
      font-weight: 600;
      color: #475569;
    }
    .dark-theme .config-control label { color: #cbd5e1; }
    .config-control select, .config-control input[type="text"] {
      padding: 8px 12px;
      border-radius: 6px;
      border: 1px solid #cbd5e1;
      font-size: 12px;
      background: #ffffff;
      color: #1e293b;
      font-family: inherit;
      outline: none;
    }
    .dark-theme .config-control select, .dark-theme .config-control input[type="text"] {
      background: #111827;
      border-color: rgba(255,255,255,0.1);
      color: #cbd5e1;
    }
    .config-control input[type="range"] {
      cursor: pointer;
      accent-color: #4f46e5;
    }
    .control-value {
      font-size: 10px;
      font-weight: 700;
      color: #64748b;
      align-self: flex-end;
      margin-top: -2px;
    }
    .checkbox-control {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      font-weight: 600;
      color: #475569;
      cursor: pointer;
      user-select: none;
    }
    .dark-theme .checkbox-control { color: #cbd5e1; }
    .checkbox-control input {
      cursor: pointer;
      accent-color: #4f46e5;
    }

    /* API Docs Table */
    .api-docs-container {
      display: flex;
      flex-direction: column;
    }
    .api-table-wrap { overflow-x: auto; margin-top: 8px; }
    .api-table { width: 100%; border-collapse: collapse; font-size: 12px; text-align: left; }
    .api-table thead th { background: #f8fafc; font-weight: 700; color: #475569; padding: 10px 12px; border-bottom: 2px solid #e2e8f0; font-size: 11px; }
    .dark-theme .api-table thead th { background: #111827; color: #cbd5e1; border-bottom-color: rgba(255,255,255,0.06); }
    .api-table tbody td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #334155; vertical-align: top; line-height: 1.5; }
    .dark-theme .api-table tbody td { border-bottom-color: rgba(255,255,255,0.05); color: #cbd5e1; }
    .api-table tbody tr:hover td { background: #f8fafc; }
    .dark-theme .api-table tbody tr:hover td { background: rgba(255, 255, 255, 0.02); }
    .api-name { color: #2563eb !important; font-family: monospace; font-weight: 600; }
    .dark-theme .api-name { color: #60a5fa !important; }
    .api-type { color: #7c3aed !important; font-family: monospace; }
    .dark-theme .api-type { color: #a78bfa !important; }
    .api-default { font-family: monospace; color: #64748b; }
    .dark-theme .api-default { color: #94a3b8; }

    /* Sparkline table */
    .sparkline-demo-container { display: flex; flex-direction: column; gap: 8px; width: 100%; }
    .sparkline-table { display: flex; flex-direction: column; gap: 8px; width: 100%; }
    .sl-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 8px 16px; border-radius: 8px; background: #f8fafc; border: 1px solid rgba(0, 0, 0, 0.02); }
    .sl-name { width: 120px; font-size: 13px; font-weight: 600; color: #475569; }
    .sl-value { font-size: 14px; font-weight: 700; color: #1e293b; min-width: 50px; text-align: right; }
    .sl-trend { font-size: 11px; font-weight: 700; min-width: 60px; text-align: right; }
    .sl-trend.up { color: #10b981; }
    .sl-trend.down { color: #ef4444; }

    .gauge-display-container, .radar-display-container {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
    }

    /* Event Logger Styles */
    .event-logger-card {
      background: #ffffff;
      border: 1px solid rgba(0, 0, 0, 0.05);
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
      margin-bottom: 24px;
      transition: background-color 0.2s;
    }
    .dark-theme .event-logger-card {
      background: #1e293b;
      border-color: rgba(255,255,255,0.05);
    }
    .logger-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      padding-bottom: 10px;
    }
    .dark-theme .logger-header {
      border-bottom-color: rgba(255,255,255,0.06);
    }
    .logger-title {
      font-size: 13px;
      font-weight: 700;
      color: #475569;
      display: flex;
      align-items: center;
      gap: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .dark-theme .logger-title { color: #cbd5e1; }
    .logger-dot-indicator {
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
      display: inline-block;
      box-shadow: 0 0 8px #10b981;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    }
    .clear-log-btn {
      background: transparent;
      border: 1px solid #cbd5e1;
      color: #64748b;
      font-size: 11px;
      padding: 4px 10px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.15s;
    }
    .dark-theme .clear-log-btn {
      border-color: rgba(255,255,255,0.1);
      color: #94a3b8;
    }
    .clear-log-btn:hover {
      background: #f1f5f9;
      color: #1e293b;
    }
    .dark-theme .clear-log-btn:hover {
      background: rgba(255,255,255,0.05);
      color: #f8fafc;
    }
    .logger-body {
      max-height: 180px;
      overflow-y: auto;
      font-family: 'SF Mono', Consolas, Menlo, monospace;
      font-size: 11px;
    }
    .empty-logger-state {
      padding: 16px;
      text-align: center;
      color: #94a3b8;
      font-style: italic;
    }
    .log-entries {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .log-entry {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 10px;
      border-radius: 6px;
      background: #f8fafc;
      border: 1px solid rgba(0,0,0,0.02);
      animation: fadeIn 0.2s ease-out;
    }
    .dark-theme .log-entry {
      background: #0f172a;
      border-color: rgba(255,255,255,0.02);
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .log-time {
      color: #94a3b8;
      font-weight: 500;
    }
    .log-badge {
      padding: 2px 6px;
      border-radius: 4px;
      color: #ffffff;
      font-weight: 700;
      font-size: 10px;
      text-transform: uppercase;
    }
    .log-text {
      color: #334155;
    }
    .dark-theme .log-text { color: #cbd5e1; }
    .highlight-text {
      color: #4f46e5;
      font-weight: 600;
    }
    .dark-theme .highlight-text {
      color: #818cf8;
    }

    /* Custom Premium Tooltip Styles */
    .custom-premium-tooltip {
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 12px;
      padding: 14px;
      color: #f8fafc;
      min-width: 200px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.5);
      pointer-events: none;
    }
    .tooltip-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .tooltip-title {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      color: #94a3b8;
    }
    .tooltip-status {
      font-size: 8px;
      font-weight: 700;
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
      padding: 1px 5px;
      border-radius: 3px;
      text-transform: uppercase;
    }
    .tooltip-divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.08);
      margin-bottom: 10px;
    }
    .tooltip-rows {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .tooltip-row-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .tooltip-row-header {
      display: flex;
      align-items: center;
      font-size: 12px;
    }
    .tooltip-row-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 8px;
    }
    .tooltip-row-name {
      color: #cbd5e1;
      flex-grow: 1;
    }
    .tooltip-row-value {
      font-weight: 700;
      font-family: monospace;
      color: #ffffff;
    }
    .tooltip-progress-track {
      height: 4px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 2px;
      overflow: hidden;
      margin-left: 16px;
    }
    .tooltip-progress-bar {
      height: 100%;
      border-radius: 2px;
      transition: width 0.3s ease;
    }
  `]
})
export class ChartsDemoComponent implements OnInit {
  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const tab = params['tab'];
      if (tab && this.tabs.includes(tab)) {
        this.activeTab.set(tab);
      }
    });
  }

  activeTab = signal('Bar Chart');
  activeSubtab = signal<'html' | 'ts' | 'api'>('html');

  // Enterprise Settings signals
  showRefLinesToggle = signal(true);
  useCustomFormatter = signal(false);
  useCustomTooltip = signal(true);
  customTooltipTemplate = viewChild<TemplateRef<any>>('customTooltip');

  // Chart Event Click Logs
  chartClickLogs = signal<{ category: string; value: number; seriesName: string; time: string; timestamp: number }[]>([]);

  // Formatters
  barFormatter = (v: number) => `$${v}M`;
  lineFormatter = (v: number) => `${v} Users`;
  financialFormatter = (v: number) => `$${v.toFixed(1)}`;
  roseFormatter = (v: number) => `${v.toFixed(1)}%`;

  getReferenceLines() {
    const tab = this.activeTab();
    if (tab === 'Bar Chart') {
      return [
        { value: 75, label: 'Target', color: '#10b981', strokeDasharray: '4,4' },
        { value: 45, label: 'Warning', color: '#f59e0b', strokeDasharray: '2,2' }
      ];
    } else if (tab === 'Line Chart') {
      return [
        { value: 300, label: 'Target Users', color: '#818cf8', strokeDasharray: '3,3' },
        { value: 150, label: 'Min SLA', color: '#ef4444', strokeDasharray: '5,5' }
      ];
    }
    return [];
  }

  getProgressPercent(val: number): number {
    const maxVal = this.activeTab() === 'Line Chart' ? 450 : 100;
    return Math.min(100, Math.max(0, (val / maxVal) * 100));
  }

  onChartClick(event: { category: string; value: number; seriesName: string }) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.chartClickLogs.update(logs => [
      { ...event, time: timeStr, timestamp: Date.now() },
      ...logs
    ].slice(0, 10));
  }

  clearLogs() {
    this.chartClickLogs.set([]);
  }

  getSeriesColor(seriesName: string): string {
    const palette = this.getThemePalette();
    if (seriesName === 'Revenue' || seriesName === 'Users') return palette[0];
    if (seriesName === 'Expenses' || seriesName === 'Sessions') return palette[1];
    return palette[0];
  }

  fmtNum(n: number): string {
    if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return n % 1 === 0 ? n.toString() : n.toFixed(1);
  }

  // Available Tabs
  tabs = [
    'Bar Chart', 'Line Chart', 'Area Chart', 'Pie / Donut', 
    'Combo Chart', 'Scatter Plot', 'Bubble Chart', 'Sunburst Chart', 'Sparkline', 'Gauge Chart', 
    'Radar Chart', 'Heatmap Chart', 'Treemap Chart', 'Funnel / Pyramid Chart',
    'Waterfall Chart', 'Box Plot Chart', 'Radial Bar Chart', 'Candlestick Chart',
    'Polar Area Chart', 'Bullet Chart', 'Dumbbell Chart', 'Lollipop Chart',
    'Slope Chart', 'Sankey Chart', 'Violin Plot', 'Ridgeline Chart',
    'Pareto Chart', 'Marimekko Chart', 'Chord Diagram', 'Dependency Wheel',
    'Adjacency Matrix', 'Biplot / PCA Plot', 'Renko Chart', 'Kagi Chart',
    'Point & Figure Chart', 'Wind Rose'
  ];

  // Config settings
  showLegend = signal(true);
  showGrid = signal(true);
  showLabels = signal(true);
  showMarkers = signal(true);
  showArea = signal(false);
  chartHeight = signal(280);
  chartTheme = signal<'light' | 'dark' | 'emerald' | 'sunset'>('light');

  // Chart specifics
  pieMode = signal<'pie' | 'donut'>('pie');
  donutTitle = signal('Revenue');
  donutValue = signal('$125K');
  donutHoleSize = signal(0.55);

  sparklineType = signal<'line' | 'area' | 'bar'>('line');
  sparklineColor = signal('#4a90d9');

  bulletValue = signal(70);
  bulletTarget = signal(80);
  bulletMax = signal(100);

  gaugeValue = signal(65);
  gaugeType = signal<'semi' | 'full'>('semi');
  gaugeLabel = signal('Server Load');
  showGaugeNeedle = signal(true);

  funnelMode = signal<'funnel' | 'pyramid'>('funnel');

  waterfallPositiveColor = signal('#10b981');
  waterfallNegativeColor = signal('#ef4444');
  waterfallTotalColor = signal('#64748b');

  boxPlotColor = signal('#4f46e5');
  boxPlotFillColor = signal('rgba(79, 70, 229, 0.12)');
  boxPlotOutlierColor = signal('#ef4444');

  radialStrokeWidth = signal(10);
  radialRingGap = signal(4);

  candlestickBullishColor = signal('#10b981');
  candlestickBearishColor = signal('#ef4444');

  // Static chart data mappings
  months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  barSeries: ChartSeries[] = [
    { name: 'Revenue', data: [42, 58, 51, 73, 82, 76] },
    { name: 'Expenses', data: [31, 44, 38, 52, 61, 55] },
  ];

  lineSeries: ChartSeries[] = [
    { name: 'Users', data: [120, 180, 155, 220, 310, 280] },
    { name: 'Sessions', data: [200, 260, 230, 340, 420, 390] },
  ];

  pieData: ChartDataPoint[] = [
    { label: 'Product A', value: 38 },
    { label: 'Product B', value: 27 },
    { label: 'Product C', value: 19 },
    { label: 'Product D', value: 11 },
    { label: 'Other', value: 5 },
  ];

  sparklineRows = [
    { name: 'Page Views', data: [120, 145, 130, 168, 190, 176, 210], up: true, change: 14 },
    { name: 'Revenue ($)', data: [3200, 2900, 3400, 3100, 3800, 4100, 3950], up: true, change: 8 },
    { name: 'Bounce Rate', data: [48, 51, 44, 47, 43, 46, 42], up: false, change: 2 },
    { name: 'Avg. Session', data: [2.1, 1.9, 2.3, 2.0, 2.4, 2.6, 2.5], up: true, change: 5 },
  ];

  gaugeThresholds: GaugeThreshold[] = [
    { value: 40, color: '#10b981' },
    { value: 75, color: '#f59e0b' },
    { value: 100, color: '#ef4444' }
  ];

  radarCategories = ['Speed', 'Agility', 'Strength', 'Stamina', 'Skill', 'Tactics'];
  radarSeries: RadarSeries[] = [
    { label: 'Player A', values: [80, 75, 90, 85, 70, 75] },
    { label: 'Player B', values: [65, 90, 70, 75, 85, 80] }
  ];

  heatmapData = signal<number[][]>([
    [12, 45, 15, 34, 67, 89, 21],
    [24, 56, 32, 11, 88, 43, 62],
    [78, 23, 91, 54, 38, 29, 70],
    [44, 65, 12, 87, 51, 99, 10],
    [35, 72, 48, 60, 19, 82, 53]
  ]);
  heatmapXLabels = signal<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  heatmapYLabels = signal<string[]>(['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5']);

  treemapData = signal<TreemapItem[]>([
    { label: 'Technology', value: 34000 },
    { label: 'Healthcare', value: 28000 },
    { label: 'Finance', value: 21000 },
    { label: 'Consumer Goods', value: 16000 },
    { label: 'Energy', value: 12000 },
    { label: 'Real Estate', value: 9000 },
    { label: 'Utilities', value: 5000 }
  ]);

  comboBarSeries: ChartSeries[] = [{ name: 'Sales Volume', data: [450, 620, 580, 810, 940, 880] }];
  comboLineSeries: ChartSeries[] = [{ name: 'Gross Margin %', data: [28, 32, 30, 35, 38, 36] }];

  scatterData: ScatterPoint[] = [
    { x: 15, y: 85, label: 'Basic-A', group: 'Basic', size: 8 },
    { x: 25, y: 75, label: 'Basic-B', group: 'Basic', size: 12 },
    { x: 35, y: 65, label: 'Basic-C', group: 'Basic', size: 6 },
    { x: 50, y: 150, label: 'Pro-A', group: 'Pro', size: 14 },
    { x: 65, y: 180, label: 'Pro-B', group: 'Pro', size: 18 },
    { x: 75, y: 210, label: 'Pro-C', group: 'Pro', size: 10 },
    { x: 110, y: 320, label: 'Ultra-A', group: 'Ultra', size: 15 },
    { x: 130, y: 380, label: 'Ultra-B', group: 'Ultra', size: 20 }
  ];

  funnelData = signal<FunnelItem[]>([
    { name: 'Website Visits', value: 12500 },
    { name: 'Downloads / Signups', value: 8200 },
    { name: 'Trial Activated', value: 4500 },
    { name: 'Price Page Visits', value: 2100 },
    { name: 'Closed Sales Deal', value: 950 }
  ]);

  // ===== NEW DATA SETS =====
  waterfallData: WaterfallItem[] = [
    { label: 'Start', value: 20000, isTotal: true },
    { label: 'Q1 Revenue', value: 8500 },
    { label: 'Services', value: 3200 },
    { label: 'Marketing', value: -4500 },
    { label: 'R&D Cost', value: -5800 },
    { label: 'Direct Taxes', value: -1200 },
    { label: 'End Balance', value: 0, isTotal: true }
  ];

  boxPlotData: BoxPlotItem[] = [
    { label: 'Class A', min: 45, q1: 60, median: 72, q3: 84, max: 98, outliers: [22, 105] },
    { label: 'Class B', min: 52, q1: 65, median: 78, q3: 86, max: 95, outliers: [34] },
    { label: 'Class C', min: 40, q1: 55, median: 68, q3: 80, max: 92, outliers: [12, 108] }
  ];

  radialData: RadialBarItem[] = [
    { label: 'Move (Cal)', value: 480, max: 600, color: '#ef4444' },
    { label: 'Exercise (Min)', value: 22, max: 30, color: '#22c55e' },
    { label: 'Stand (Hr)', value: 10, max: 12, color: '#06b6d4' }
  ];

  candlestickData: CandlestickItem[] = [
    { date: 'Mon', open: 125, high: 132, low: 122, close: 130 },
    { date: 'Tue', open: 130, high: 138, low: 128, close: 135 },
    { date: 'Wed', open: 135, high: 136, low: 124, close: 126 },
    { date: 'Thu', open: 126, high: 131, low: 120, close: 122 },
    { date: 'Fri', open: 122, high: 129, low: 121, close: 128 }
  ];

  dumbbellData: DumbbellItem[] = [
    { label: 'USA', startValue: 74.2, endValue: 78.8 },
    { label: 'Japan', startValue: 79.5, endValue: 84.6 },
    { label: 'Germany', startValue: 76.8, endValue: 81.2 },
    { label: 'India', startValue: 62.4, endValue: 70.8 },
    { label: 'Brazil', startValue: 69.1, endValue: 75.3 }
  ];

  lollipopData: ChartDataPoint[] = [
    { label: 'Marketing', value: 450, color: '#4f46e5' },
    { label: 'Sales', value: 620, color: '#10b981' },
    { label: 'Engineering', value: 890, color: '#f59e0b' },
    { label: 'Design', value: 310, color: '#ec4899' },
    { label: 'Support', value: 240, color: '#8b5cf6' }
  ];

  slopeData: SlopeDataPoint[] = [
    { label: 'Productivity', startValue: 65, endValue: 88 },
    { label: 'Collaboration', startValue: 70, endValue: 92 },
    { label: 'Stress Levels', startValue: 82, endValue: 45 },
    { label: 'Overtime Hours', startValue: 55, endValue: 30 },
    { label: 'Satisfaction', startValue: 60, endValue: 85 }
  ];

  sankeyNodes: SankeyNode[] = [
    { id: 'revenue', label: 'Revenue', color: '#6366f1' },
    { id: 'sales', label: 'Sales', color: '#10b981' },
    { id: 'marketing', label: 'Marketing', color: '#f59e0b' },
    { id: 'operations', label: 'Operations', color: '#ef4444' },
    { id: 'profit', label: 'Net Profit', color: '#06b6d4' }
  ];

  sankeyLinks: SankeyLink[] = [
    { source: 'revenue', target: 'sales', value: 80 },
    { source: 'revenue', target: 'marketing', value: 20 },
    { source: 'sales', target: 'operations', value: 50 },
    { source: 'sales', target: 'profit', value: 30 },
    { source: 'marketing', target: 'operations', value: 15 },
    { source: 'marketing', target: 'profit', value: 5 }
  ];

  violinData: ViolinItem[] = [
    { label: 'Control Group', values: [12, 15, 14, 18, 25, 30, 22, 21, 24, 26, 28, 35, 40] },
    { label: 'Treatment A', values: [18, 22, 21, 25, 35, 42, 30, 28, 32, 34, 38, 48, 55] },
    { label: 'Treatment B', values: [15, 19, 17, 22, 28, 34, 25, 23, 27, 29, 31, 39, 45] }
  ];

  ridgelineData: RidgelineItem[] = [
    { label: 'Jan', values: [10, 12, 15, 14, 18, 22, 20, 19, 21, 24, 26, 30] },
    { label: 'Feb', values: [12, 14, 17, 16, 20, 25, 22, 21, 23, 27, 29, 34] },
    { label: 'Mar', values: [15, 18, 21, 20, 25, 30, 28, 26, 29, 33, 35, 41] },
    { label: 'Apr', values: [20, 24, 27, 25, 32, 38, 35, 33, 37, 41, 44, 52] }
  ];

  paretoData: ParetoItem[] = [
    { label: 'Defect A', value: 85 },
    { label: 'Defect B', value: 54 },
    { label: 'Defect C', value: 32 },
    { label: 'Defect D', value: 18 },
    { label: 'Defect E', value: 8 }
  ];

  marimekkoData: MarimekkoItem[] = [
    {
      label: 'Segment X',
      segments: [
        { name: 'Category 1', value: 40 },
        { name: 'Category 2', value: 25 },
        { name: 'Category 3', value: 15 }
      ]
    },
    {
      label: 'Segment Y',
      segments: [
        { name: 'Category 1', value: 20 },
        { name: 'Category 2', value: 50 },
        { name: 'Category 3', value: 30 }
      ]
    },
    {
      label: 'Segment Z',
      segments: [
        { name: 'Category 1', value: 15 },
        { name: 'Category 2', value: 10 },
        { name: 'Category 3', value: 45 }
      ]
    }
  ];

  chordMatrix: number[][] = [
    [0, 20, 15, 10],
    [5, 0, 25, 30],
    [10, 5, 0, 15],
    [25, 10, 5, 0]
  ];

  chordLabels: string[] = ['Asia', 'Europe', 'North America', 'South America'];

  biplotPoints: BiplotPoint[] = [
    { x: -1.5, y: 0.8, label: 'Obs A', group: 'Set 1' },
    { x: -0.9, y: 1.2, label: 'Obs B', group: 'Set 1' },
    { x: 1.2, y: -0.5, label: 'Obs C', group: 'Set 2' },
    { x: 0.8, y: -0.9, label: 'Obs D', group: 'Set 2' },
    { x: 2.1, y: 1.5, label: 'Obs E', group: 'Set 3' },
    { x: 1.7, y: 1.9, label: 'Obs F', group: 'Set 3' }
  ];

  biplotVectors: BiplotVector[] = [
    { x: 1.8, y: 1.2, label: 'Variable 1' },
    { x: -1.2, y: 2.0, label: 'Variable 2' },
    { x: 2.0, y: -1.5, label: 'Variable 3' }
  ];

  financialPrices: number[] = [
    100, 102, 105, 103, 101, 98, 95, 96, 99, 103, 107, 110, 112, 115, 113, 111, 108, 105, 107, 111, 114, 118, 122, 120, 124, 128, 125, 122, 119
  ];

  windRoseData: WindRoseItem[] = [
    { direction: 'N', speedBins: [{ label: '< 5m/s', value: 3.5 }, { label: '5-15m/s', value: 6.2 }, { label: '> 15m/s', value: 1.8 }] },
    { direction: 'NNE', speedBins: [{ label: '< 5m/s', value: 2.1 }, { label: '5-15m/s', value: 4.8 }, { label: '> 15m/s', value: 0.9 }] },
    { direction: 'NE', speedBins: [{ label: '< 5m/s', value: 4.0 }, { label: '5-15m/s', value: 5.5 }, { label: '> 15m/s', value: 2.2 }] },
    { direction: 'ENE', speedBins: [{ label: '< 5m/s', value: 1.5 }, { label: '5-15m/s', value: 3.2 }, { label: '> 15m/s', value: 1.1 }] },
    { direction: 'E', speedBins: [{ label: '< 5m/s', value: 2.8 }, { label: '5-15m/s', value: 4.1 }, { label: '> 15m/s', value: 1.5 }] },
    { direction: 'ESE', speedBins: [{ label: '< 5m/s', value: 3.1 }, { label: '5-15m/s', value: 5.0 }, { label: '> 15m/s', value: 2.0 }] },
    { direction: 'SE', speedBins: [{ label: '< 5m/s', value: 5.2 }, { label: '5-15m/s', value: 8.5 }, { label: '> 15m/s', value: 4.1 }] },
    { direction: 'SSE', speedBins: [{ label: '< 5m/s', value: 2.6 }, { label: '5-15m/s', value: 4.3 }, { label: '> 15m/s', value: 1.2 }] },
    { direction: 'S', speedBins: [{ label: '< 5m/s', value: 3.9 }, { label: '5-15m/s', value: 6.8 }, { label: '> 15m/s', value: 2.5 }] },
    { direction: 'SSW', speedBins: [{ label: '< 5m/s', value: 1.8 }, { label: '5-15m/s', value: 3.5 }, { label: '> 15m/s', value: 0.8 }] },
    { direction: 'SW', speedBins: [{ label: '< 5m/s', value: 4.2 }, { label: '5-15m/s', value: 7.1 }, { label: '> 15m/s', value: 3.0 }] },
    { direction: 'WSW', speedBins: [{ label: '< 5m/s', value: 2.0 }, { label: '5-15m/s', value: 3.9 }, { label: '> 15m/s', value: 1.3 }] },
    { direction: 'W', speedBins: [{ label: '< 5m/s', value: 3.0 }, { label: '5-15m/s', value: 5.2 }, { label: '> 15m/s', value: 2.1 }] },
    { direction: 'WNW', speedBins: [{ label: '< 5m/s', value: 2.5 }, { label: '5-15m/s', value: 4.0 }, { label: '> 15m/s', value: 1.4 }] },
    { direction: 'NW', speedBins: [{ label: '< 5m/s', value: 4.5 }, { label: '5-15m/s', value: 6.9 }, { label: '> 15m/s', value: 2.8 }] },
    { direction: 'NNW', speedBins: [{ label: '< 5m/s', value: 2.2 }, { label: '5-15m/s', value: 4.2 }, { label: '> 15m/s', value: 1.0 }] }
  ];

  bubbleData = signal<BubblePoint[]>([
    { x: 10, y: 30, z: 150, label: 'App A', group: 'Tech' },
    { x: 25, y: 45, z: 280, label: 'App B', group: 'Tech' },
    { x: 45, y: 70, z: 500, label: 'App C', group: 'Health' },
    { x: 60, y: 20, z: 120, label: 'App D', group: 'Health' },
    { x: 75, y: 85, z: 650, label: 'App E', group: 'Finance' },
    { x: 90, y: 60, z: 400, label: 'App F', group: 'Finance' }
  ]);

  sunburstData = signal<SunburstNode[]>([
    {
      label: 'North America',
      children: [
        {
          label: 'USA',
          children: [
            { label: 'New York', value: 450 },
            { label: 'California', value: 620 },
            { label: 'Texas', value: 380 }
          ]
        },
        {
          label: 'Canada',
          children: [
            { label: 'Toronto', value: 210 },
            { label: 'Vancouver', value: 180 }
          ]
        }
      ]
    },
    {
      label: 'Europe',
      children: [
        {
          label: 'Germany',
          children: [
            { label: 'Berlin', value: 310 },
            { label: 'Munich', value: 290 }
          ]
        },
        {
          label: 'UK',
          children: [
            { label: 'London', value: 420 },
            { label: 'Manchester', value: 150 }
          ]
        }
      ]
    }
  ]);

  // ===== GENERAL API DOCS DEFINITION =====
  chartCssVars = [
    { name: '--ngx-chart-bg', default: '#ffffff', description: 'Container canvas backdrop color.' },
    { name: '--ngx-chart-grid', default: '#ebedf0', description: 'Grid line separator tint.' },
    { name: '--ngx-chart-axis', default: '#ced4da', description: 'Base axes lines tint.' },
    { name: '--ngx-chart-axis-text', default: '#6c757d', description: 'Scales labels text color.' },
    { name: '--ngx-chart-tooltip-bg', default: 'rgba(30, 41, 59, 0.85)', description: 'Glassmorphic tooltip background.' }
  ];

  // Methods to resolve colors depending on chosen theme
  getThemeBg(): string {
    switch(this.chartTheme()) {
      case 'dark': return '#1e293b';
      case 'emerald': return '#f0fdf4';
      case 'sunset': return '#fff7ed';
      default: return '#ffffff';
    }
  }

  getThemeBgItem(): string {
    switch(this.chartTheme()) {
      case 'dark': return '#0f172a';
      case 'emerald': return '#dcfce7';
      case 'sunset': return '#ffedd5';
      default: return '#f8fafc';
    }
  }

  getThemePalette(): string[] {
    switch(this.chartTheme()) {
      case 'dark': return ['#38bdf8', '#818cf8', '#34d399', '#f472b6', '#a78bfa'];
      case 'emerald': return ['#10b981', '#34d399', '#059669', '#6ee7b7', '#047857'];
      case 'sunset': return ['#f97316', '#ea580c', '#f43f5e', '#fb923c', '#fda4af'];
      default: return CHART_COLORS;
    }
  }

  // Toggles helper
  hasGeneralToggle(type: 'legend' | 'grid' | 'labels'): boolean {
    const tab = this.activeTab();
    if (type === 'legend') {
      return ['Bar Chart', 'Line Chart', 'Area Chart', 'Pie / Donut', 'Combo Chart', 'Scatter Plot', 'Bubble Chart', 'Sunburst Chart', 'Radial Bar Chart'].includes(tab);
    }
    if (type === 'grid') {
      return ['Bar Chart', 'Line Chart', 'Area Chart', 'Combo Chart', 'Scatter Plot', 'Bubble Chart', 'Waterfall Chart', 'Box Plot Chart', 'Candlestick Chart'].includes(tab);
    }
    if (type === 'labels') {
      return ['Bar Chart', 'Line Chart', 'Pie / Donut', 'Bubble Chart', 'Sunburst Chart', 'Waterfall Chart', 'Box Plot Chart', 'Candlestick Chart'].includes(tab);
    }
    return false;
  }

  hasSpecificControls(): boolean {
    const tab = this.activeTab();
    return ['Pie / Donut', 'Line Chart', 'Area Chart', 'Sparkline', 'Gauge Chart', 'Funnel / Pyramid Chart', 'Waterfall Chart', 'Box Plot Chart', 'Radial Bar Chart', 'Candlestick Chart'].includes(tab);
  }

  onThemeChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value as any;
    this.chartTheme.set(val);
  }

  onHeightChange(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.chartHeight.set(Number(val));
  }

  onGaugeValueChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.gaugeValue.set(Number(val));
  }

  onGaugeTypeChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as 'full' | 'semi';
    this.gaugeType.set(val);
  }

  // Helper copy to clipboard
  copyCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      alert('Code copied to clipboard! 📋');
    });
  }

  // Programmatic Source Code builders
  getHtmlTemplateString(): string {
    const tab = this.activeTab();
    const h = this.chartHeight();
    const l = this.showLegend();
    const g = this.showGrid();
    const valLabels = this.showLabels();

    switch(tab) {
      case 'Bar Chart':
        return `<ngx-bar-chart
  [series]="series"
  [categories]="categories"
  [showLegend]="${l}"
  [showGrid]="${g}"
  [showLabels]="${valLabels}"
  [height]="${h}"
  [showExport]="true"${this.showRefLinesToggle() ? '\n  [referenceLines]="referenceLines"' : ''}${this.useCustomFormatter() ? '\n  [labelFormatter]="labelFormatter"' : ''}${this.useCustomTooltip() ? '\n  [tooltipTemplate]="customTooltip"' : ''}
  (barClick)="onBarClick($event)"
/>`;
      case 'Line Chart':
        return `<ngx-line-chart
  [series]="series"
  [categories]="categories"
  [showArea]="${this.showArea()}"
  [showMarkers]="${this.showMarkers()}"
  [showLegend]="${l}"
  [height]="${h}"
  [showExport]="true"${this.showRefLinesToggle() ? '\n  [referenceLines]="referenceLines"' : ''}
  [showLabels]="${valLabels}"${this.useCustomFormatter() ? '\n  [labelFormatter]="labelFormatter"' : ''}${this.useCustomTooltip() ? '\n  [tooltipTemplate]="customTooltip"' : ''}
  (pointClick)="onPointClick($event)"
/>`;
      case 'Area Chart':
        return `<ngx-area-chart
  [series]="series"
  [categories]="categories"
  [showMarkers]="${this.showMarkers()}"
  [showLegend]="${l}"
  [showGrid]="${g}"
  [height]="${h}"
/>`;
      case 'Pie / Donut':
        return `<ngx-pie-chart
  [data]="data"
  mode="${this.pieMode()}"
  [centerTitle]="'${this.donutTitle()}'"
  [centerValue]="'${this.donutValue()}'"
  [donutHoleSize]="${this.donutHoleSize()}"
  [showLegend]="${l}"
  [showLabels]="${valLabels}"
  [height]="${h}"
  [showExport]="true"
/>`;
      case 'Sparkline':
        return `<ngx-sparkline
  [data]="data"
  type="${this.sparklineType()}"
  color="${this.sparklineColor()}"
  [width]="140"
  [height]="36"
/>`;
      case 'Gauge Chart':
        return `<ngx-gauge-chart
  [value]="${this.gaugeValue()}"
  [min]="0"
  [max]="100"
  label="${this.gaugeLabel()}"
  type="${this.gaugeType()}"
  [showNeedle]="${this.showGaugeNeedle()}"
  [thresholds]="thresholds"
/>`;
      case 'Radar Chart':
        return `<ngx-radar-chart
  [seriesData]="series"
  [categories]="categories"
  [max]="100"
/>`;
      case 'Heatmap Chart':
        return `<ngx-heatmap-chart
  [data]="heatmapData"
  [xAxisLabels]="xLabels"
  [yAxisLabels]="yLabels"
/>`;
      case 'Treemap Chart':
        return `<ngx-treemap-chart
  [data]="treemapData"
/>`;
      case 'Funnel / Pyramid Chart':
        return `<ngx-funnel-chart
  [data]="data"
  mode="${this.funnelMode()}"
/>`;
      case 'Combo Chart':
        return `<ngx-combo-chart
  [barSeries]="barSeries"
  [lineSeries]="lineSeries"
  [categories]="categories"
  barYTitle="Sales ($K)"
  lineYTitle="Margin (%)"
  [showLegend]="${l}"
  [showGrid]="${g}"
  [height]="${h}"
/>`;
      case 'Scatter Plot':
        return `<ngx-scatter-plot
  [data]="data"
  xTitle="Unit Price"
  yTitle="Units Sold"
  [showLegend]="${l}"
  [showGrid]="${g}"
  [height]="${h}"
/>`;
      case 'Bubble Chart':
        return `<ngx-bubble-chart
  [data]="data"
  xTitle="R&D Spend ($M)"
  yTitle="Market Share (%)"
  zTitle="Revenue ($B)"
  [showLegend]="${l}"
  [showGrid]="${g}"
  [showLabels]="${valLabels}"
  [height]="${h}"
  [showExport]="true"
/>`;
      case 'Sunburst Chart':
        return `<ngx-sunburst-chart
  [data]="data"
  [showLegend]="${l}"
  [showLabels]="${valLabels}"
  [height]="${h}"
  [showExport]="true"
/>`;
      case 'Waterfall Chart':
        return `<ngx-waterfall-chart
  [data]="data"
  [showGrid]="${g}"
  [showLabels]="${valLabels}"
  [height]="${h}"
  positiveColor="${this.waterfallPositiveColor()}"
  negativeColor="${this.waterfallNegativeColor()}"
  totalColor="${this.waterfallTotalColor()}"
/>`;
      case 'Box Plot Chart':
        return `<ngx-box-plot-chart
  [data]="data"
  [showGrid]="${g}"
  [showLabels]="${valLabels}"
  [height]="${h}"
  color="${this.boxPlotColor()}"
  fillColor="${this.boxPlotFillColor()}"
  outlierColor="${this.boxPlotOutlierColor()}"
/>`;
      case 'Radial Bar Chart':
        return `<ngx-radial-bar-chart
  [data]="data"
  [showLegend]="${l}"
  [height]="${h}"
  [strokeWidth]="${this.radialStrokeWidth()}"
  [ringGap]="${this.radialRingGap()}"
/>`;
      case 'Candlestick Chart':
        return `<ngx-candlestick-chart
  [data]="data"
  [showGrid]="${g}"
  [showLabels]="${valLabels}"
  [height]="${h}"
  bullishColor="${this.candlestickBullishColor()}"
  bearishColor="${this.candlestickBearishColor()}"
/>`;
      case 'Polar Area Chart':
        return `<ngx-polar-area-chart
  [data]="data"
  [showLegend]="${l}"
  [showLabels]="${valLabels}"
  [height]="${h}"
  [showExport]="true"
/>`;
      case 'Bullet Chart':
        return `<ngx-bullet-chart
  [value]="${this.bulletValue()}"
  [target]="${this.bulletTarget()}"
  [max]="${this.bulletMax()}"
  [ranges]="[50, 85, 100]"
  [rangeColors]="['#fee2e2', '#fef3c7', '#dcfce7']"
  [valueColor]="'#10b981'"
  [targetColor]="'#ef4444'"
  [height]="40"
/>`;
      case 'Dumbbell Chart':
        return `<ngx-dumbbell-chart
  [data]="data"
  [showLegend]="${l}"
  [showGrid]="${g}"
  [showLabels]="${valLabels}"
  [height]="${h}"
/>`;
      case 'Lollipop Chart':
        return `<ngx-lollipop-chart
  [data]="data"
  [showGrid]="${g}"
  [showLabels]="${valLabels}"
  [height]="${h}"
/>`;
      case 'Slope Chart':
        return `<ngx-slope-chart
  [data]="data"
  [showLabels]="${valLabels}"
  [showValues]="${valLabels}"
  [height]="${h}"
/>`;
      case 'Sankey Chart':
        return `<ngx-sankey-chart
  [nodes]="nodes"
  [links]="links"
  [showLabels]="${valLabels}"
  [showValues]="${valLabels}"
  [height]="${h}"
/>`;
      case 'Violin Plot':
        return `<ngx-violin-plot
  [data]="data"
  [showGrid]="${g}"
  [showLabels]="${valLabels}"
  [height]="${h}"
/>`;
      case 'Ridgeline Chart':
        return `<ngx-ridgeline-chart
  [data]="data"
  [showGrid]="${g}"
  [showLabels]="${valLabels}"
  [height]="${h}"
/>`;
      case 'Pareto Chart':
        return `<ngx-pareto-chart
  [data]="data"
  [showGrid]="${g}"
  [showLabels]="${valLabels}"
  [height]="${h}"
/>`;
      case 'Marimekko Chart':
        return `<ngx-marimekko-chart
  [data]="data"
  [showGrid]="${g}"
  [showLabels]="${valLabels}"
  [height]="${h}"
/>`;
      case 'Chord Diagram':
        return `<ngx-chord-diagram
  [matrix]="matrix"
  [labels]="labels"
  [showLabels]="${valLabels}"
  [height]="${h}"
/>`;
      case 'Dependency Wheel':
        return `<ngx-dependency-wheel
  [matrix]="matrix"
  [labels]="labels"
  [showLabels]="${valLabels}"
  [height]="${h}"
/>`;
      case 'Adjacency Matrix':
        return `<ngx-adjacency-matrix
  [matrix]="matrix"
  [labels]="labels"
  [showLabels]="${valLabels}"
  [height]="${h}"
/>`;
      case 'Biplot / PCA Plot':
        return `<ngx-biplot
  [points]="points"
  [vectors]="vectors"
  [showLabels]="${valLabels}"
  [height]="${h}"
/>`;
      case 'Renko Chart':
        return `<ngx-renko-chart
  [data]="data"
  [boxSize]="5"
  [height]="${h}"
/>`;
      case 'Kagi Chart':
        return `<ngx-kagi-chart
  [data]="data"
  [reversalAmount]="15"
  [height]="${h}"
/>`;
      case 'Point & Figure Chart':
        return `<ngx-point-figure-chart
  [data]="data"
  [boxSize]="4"
  [reversal]="3"
  [height]="${h}"
/>`;
      case 'Wind Rose':
        return `<ngx-wind-rose
  [data]="data"
  [height]="${h}"
/>`;
      default:
        return '';
    }
  }

  getTsTemplateString(): string {
    const tab = this.activeTab();
    const componentClass = this.getComponentClass(tab);
    const extraVars = this.getExtraStateVariables(tab);
    
    return `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ${componentClass} } from 'ngx-core-components/charts';

@Component({
  selector: 'app-chart-example',
  standalone: true,
  imports: [CommonModule, ${componentClass}],
  template: \`
    ${this.getHtmlTemplateString().split('\n').join('\n    ')}
  \`
})
export class ChartExampleComponent {
  data = ${this.getMockDataString(tab).split('\n').join('\n  ')};
  ${extraVars ? extraVars.split('\n').join('\n  ') : ''}
}`;
  }

  // API tables data getter
  getApiInputs(): ApiRow[] {
    const tab = this.activeTab();
    switch(tab) {
      case 'Bar Chart': return this.barInputs;
      case 'Line Chart': return this.lineInputs;
      case 'Pie / Donut': return this.pieInputs;
      case 'Sparkline': return this.sparklineInputs;
      case 'Gauge Chart': return this.gaugeInputs;
      case 'Radar Chart': return this.radarInputs;
      case 'Heatmap Chart': return this.heatmapInputs;
      case 'Treemap Chart': return this.treemapInputs;
      case 'Area Chart': return this.areaInputs;
      case 'Funnel / Pyramid Chart': return this.funnelInputs;
      case 'Combo Chart': return this.comboInputs;
      case 'Scatter Plot': return this.scatterInputs;
      case 'Bubble Chart': return this.bubbleInputs;
      case 'Sunburst Chart': return this.sunburstInputs;
      case 'Waterfall Chart': return this.waterfallInputs;
      case 'Box Plot Chart': return this.boxPlotInputs;
      case 'Radial Bar Chart': return this.radialInputs;
      case 'Candlestick Chart': return this.candlestickInputs;
      case 'Polar Area Chart': return this.polarAreaInputs;
      case 'Bullet Chart': return this.bulletInputs;
      case 'Dumbbell Chart': return this.dumbbellInputs;
      case 'Lollipop Chart': return this.lollipopInputs;
      case 'Slope Chart': return this.slopeInputs;
      case 'Sankey Chart': return this.sankeyInputs;
      case 'Violin Plot': return this.violinInputs;
      case 'Ridgeline Chart': return this.ridgelineInputs;
      case 'Pareto Chart': return this.paretoInputs;
      case 'Marimekko Chart': return this.marimekkoInputs;
      case 'Chord Diagram': return this.chordInputs;
      case 'Dependency Wheel': return this.dependencyInputs;
      case 'Adjacency Matrix': return this.matrixInputs;
      case 'Biplot / PCA Plot': return this.biplotInputs;
      case 'Renko Chart': return this.renkoInputs;
      case 'Kagi Chart': return this.kagiInputs;
      case 'Point & Figure Chart': return this.pfInputs;
      case 'Wind Rose': return this.windRoseInputs;
      default: return [];
    }
  }

  // Formatted source files for components for StackBlitz bundling
  getComponentSourceCode(tab: string): string {
    switch(tab) {
      case 'Bar Chart': return Sources.BarChartSource;
      case 'Line Chart': return Sources.LineChartSource;
      case 'Pie / Donut': return Sources.PieDonutSource;
      case 'Sparkline': return Sources.SparklineSource;
      case 'Gauge Chart': return Sources.GaugeChartSource;
      case 'Radar Chart': return Sources.RadarChartSource;
      case 'Heatmap Chart': return Sources.HeatmapChartSource;
      case 'Treemap Chart': return Sources.TreemapChartSource;
      case 'Area Chart': return Sources.AreaChartSource;
      case 'Funnel / Pyramid Chart': return Sources.FunnelPyramidChartSource;
      case 'Combo Chart': return Sources.ComboChartSource;
      case 'Scatter Plot': return Sources.ScatterPlotSource;
      case 'Bubble Chart': return Sources.BubbleChartSource;
      case 'Sunburst Chart': return Sources.SunburstChartSource;
      case 'Waterfall Chart': return Sources.WaterfallChartSource;
      case 'Box Plot Chart': return Sources.BoxPlotChartSource;
      case 'Radial Bar Chart': return Sources.RadialBarChartSource;
      case 'Candlestick Chart': return Sources.CandlestickChartSource;
      case 'Polar Area Chart': return Sources.PolarAreaChartSource;
      case 'Bullet Chart': return Sources.BulletChartSource;
      case 'Dumbbell Chart': return Sources.DumbbellChartSource;
      case 'Lollipop Chart': return Sources.LollipopChartSource;
      case 'Slope Chart': return Sources.SlopeChartSource;
      case 'Sankey Chart': return Sources.SankeyChartSource;
      case 'Violin Plot': return Sources.ViolinPlotSource;
      case 'Ridgeline Chart': return Sources.RidgelineChartSource;
      case 'Pareto Chart': return Sources.ParetoChartSource;
      case 'Marimekko Chart': return Sources.MarimekkoChartSource;
      case 'Chord Diagram': return Sources.ChordDiagramSource;
      case 'Dependency Wheel': return Sources.DependencyWheelSource;
      case 'Adjacency Matrix': return Sources.AdjacencyMatrixSource;
      case 'Biplot / PCA Plot': return Sources.BiplotSource;
      case 'Renko Chart': return Sources.RenkoChartSource;
      case 'Kagi Chart': return Sources.KagiChartSource;
      case 'Point & Figure Chart': return Sources.PointFigureChartSource;
      case 'Wind Rose': return Sources.WindRoseSource;
      default: return '';
    }
  }

  getComponentClass(tab: string): string {
    switch (tab) {
      case 'Bar Chart': return 'BarChartComponent';
      case 'Line Chart': return 'LineChartComponent';
      case 'Pie / Donut': return 'PieChartComponent';
      case 'Sparkline': return 'SparklineComponent';
      case 'Gauge Chart': return 'GaugeChartComponent';
      case 'Radar Chart': return 'RadarChartComponent';
      case 'Heatmap Chart': return 'HeatmapChartComponent';
      case 'Treemap Chart': return 'TreemapChartComponent';
      case 'Area Chart': return 'AreaChartComponent';
      case 'Funnel / Pyramid Chart': return 'FunnelChartComponent';
      case 'Combo Chart': return 'ComboChartComponent';
      case 'Scatter Plot': return 'ScatterPlotComponent';
      case 'Bubble Chart': return 'BubbleChartComponent';
      case 'Sunburst Chart': return 'SunburstChartComponent';
      case 'Waterfall Chart': return 'WaterfallChartComponent';
      case 'Box Plot Chart': return 'BoxPlotChartComponent';
      case 'Radial Bar Chart': return 'RadialBarChartComponent';
      case 'Candlestick Chart': return 'CandlestickChartComponent';
      case 'Polar Area Chart': return 'PolarAreaChartComponent';
      case 'Bullet Chart': return 'BulletChartComponent';
      case 'Dumbbell Chart': return 'DumbbellChartComponent';
      case 'Lollipop Chart': return 'LollipopChartComponent';
      case 'Slope Chart': return 'SlopeChartComponent';
      case 'Sankey Chart': return 'SankeyChartComponent';
      case 'Violin Plot': return 'ViolinPlotComponent';
      case 'Ridgeline Chart': return 'RidgelineChartComponent';
      case 'Pareto Chart': return 'ParetoChartComponent';
      case 'Marimekko Chart': return 'MarimekkoChartComponent';
      case 'Chord Diagram': return 'ChordDiagramComponent';
      case 'Dependency Wheel': return 'DependencyWheelComponent';
      case 'Adjacency Matrix': return 'AdjacencyMatrixComponent';
      case 'Biplot / PCA Plot': return 'BiplotComponent';
      case 'Renko Chart': return 'RenkoChartComponent';
      case 'Kagi Chart': return 'KagiChartComponent';
      case 'Point & Figure Chart': return 'PointFigureChartComponent';
      case 'Wind Rose': return 'WindRoseChartComponent';
      default: return '';
    }
  }

  getPlaygroundTemplate(tab: string): string {
    const l = this.showLegend();
    const g = this.showGrid();
    const valLabels = this.showLabels();
    const h = this.chartHeight();

    switch(tab) {
      case 'Bar Chart': return `<ngx-bar-chart [series]="data" [categories]="['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']" [showLegend]="${l}" [showGrid]="${g}" [showLabels]="${valLabels}" [height]="${h}"></ngx-bar-chart>`;
      case 'Line Chart': return `<ngx-line-chart [series]="data" [categories]="['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']" [showArea]="${this.showArea()}" [showMarkers]="${this.showMarkers()}" [showLegend]="${l}" [height]="${h}"></ngx-line-chart>`;
      case 'Area Chart': return `<ngx-area-chart [series]="data" [categories]="['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']" [showMarkers]="${this.showMarkers()}" [showLegend]="${l}" [showGrid]="${g}" [height]="${h}"></ngx-area-chart>`;
      case 'Pie / Donut': return `<ngx-pie-chart [data]="data" mode="${this.pieMode()}" centerTitle="${this.donutTitle()}" centerValue="${this.donutValue()}" [donutHoleSize]="${this.donutHoleSize()}" [showLegend]="${l}" [showLabels]="${valLabels}" [height]="${h}"></ngx-pie-chart>`;
      case 'Sparkline': return `<ngx-sparkline [data]="data" type="${this.sparklineType()}" color="${this.sparklineColor()}" [width]="140" [height]="36"></ngx-sparkline>`;
      case 'Gauge Chart': return `<ngx-gauge-chart [value]="${this.gaugeValue()}" [min]="0" [max]="100" label="${this.gaugeLabel()}" type="${this.gaugeType()}" [showNeedle]="${this.showGaugeNeedle()}" [thresholds]="thresholds"></ngx-gauge-chart>`;
      case 'Radar Chart': return `<ngx-radar-chart [seriesData]="data" [categories]="['Speed', 'Agility', 'Strength', 'Stamina', 'Skill', 'Tactics']" [max]="100"></ngx-radar-chart>`;
      case 'Heatmap Chart': return `<ngx-heatmap-chart [data]="data" [xAxisLabels]="['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']" [yAxisLabels]="['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5']"></ngx-heatmap-chart>`;
      case 'Treemap Chart': return `<ngx-treemap-chart [data]="data"></ngx-treemap-chart>`;
      case 'Funnel / Pyramid Chart': return `<ngx-funnel-chart [data]="data" mode="${this.funnelMode()}"></ngx-funnel-chart>`;
      case 'Combo Chart': return `<ngx-combo-chart [barSeries]="barSeries" [lineSeries]="lineSeries" [categories]="['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']" barYTitle="Sales" lineYTitle="Margin" [showLegend]="${l}" [showGrid]="${g}" [height]="${h}"></ngx-combo-chart>`;
      case 'Scatter Plot': return `<ngx-scatter-plot [data]="data" xTitle="Unit Price" yTitle="Units Sold" [showLegend]="${l}" [showGrid]="${g}" [height]="${h}"></ngx-scatter-plot>`;
      case 'Bubble Chart': return `<ngx-bubble-chart [data]="data" xTitle="R&D Spend" yTitle="Market Share" zTitle="Revenue" [showLegend]="${l}" [showGrid]="${g}" [showLabels]="${valLabels}" [height]="${h}"></ngx-bubble-chart>`;
      case 'Sunburst Chart': return `<ngx-sunburst-chart [data]="data" [showLegend]="${l}" [showLabels]="${valLabels}" [height]="${h}"></ngx-sunburst-chart>`;
      case 'Waterfall Chart': return `<ngx-waterfall-chart [data]="data" [showGrid]="${g}" [showLabels]="${valLabels}" [height]="${h}" positiveColor="${this.waterfallPositiveColor()}" negativeColor="${this.waterfallNegativeColor()}" totalColor="${this.waterfallTotalColor()}"></ngx-waterfall-chart>`;
      case 'Box Plot Chart': return `<ngx-box-plot-chart [data]="data" [showGrid]="${g}" [showLabels]="${valLabels}" [height]="${h}" color="${this.boxPlotColor()}" fillColor="${this.boxPlotFillColor()}" outlierColor="${this.boxPlotOutlierColor()}"></ngx-box-plot-chart>`;
      case 'Radial Bar Chart': return `<ngx-radial-bar-chart [data]="data" [showLegend]="${l}" [height]="${h}" [strokeWidth]="${this.radialStrokeWidth()}" [ringGap]="${this.radialRingGap()}"></ngx-radial-bar-chart>`;
      case 'Candlestick Chart': return `<ngx-candlestick-chart [data]="data" [showGrid]="${g}" [showLabels]="${valLabels}" [height]="${h}" bullishColor="${this.candlestickBullishColor()}" bearishColor="${this.candlestickBearishColor()}"></ngx-candlestick-chart>`;
      case 'Polar Area Chart': return `<ngx-polar-area-chart [data]="data" [showLegend]="${l}" [showLabels]="${valLabels}" [height]="${h}"></ngx-polar-area-chart>`;
      case 'Bullet Chart': return `<ngx-bullet-chart [value]="${this.bulletValue()}" [target]="${this.bulletTarget()}" [max]="${this.bulletMax()}" [ranges]="[50, 85, 100]" [rangeColors]="['#fee2e2', '#fef3c7', '#dcfce7']" [valueColor]="'#10b981'" [targetColor]="'#ef4444'" [height]="40"></ngx-bullet-chart>`;
      case 'Dumbbell Chart': return `<ngx-dumbbell-chart [data]="data" [showLegend]="${l}" [showGrid]="${g}" [showLabels]="${valLabels}" [height]="${h}"></ngx-dumbbell-chart>`;
      case 'Lollipop Chart': return `<ngx-lollipop-chart [data]="data" [showGrid]="${g}" [showLabels]="${valLabels}" [height]="${h}"></ngx-lollipop-chart>`;
      case 'Slope Chart': return `<ngx-slope-chart [data]="data" [showLabels]="${valLabels}" [showValues]="${valLabels}" [height]="${h}"></ngx-slope-chart>`;
      case 'Sankey Chart': return `<ngx-sankey-chart [nodes]="nodes" [links]="links" [showLabels]="${valLabels}" [showValues]="${valLabels}" [height]="${h}"></ngx-sankey-chart>`;
      case 'Violin Plot': return `<ngx-violin-plot [data]="data" [showGrid]="${g}" [showLabels]="${valLabels}" [height]="${h}"></ngx-violin-plot>`;
      case 'Ridgeline Chart': return `<ngx-ridgeline-chart [data]="data" [showGrid]="${g}" [showLabels]="${valLabels}" [height]="${h}"></ngx-ridgeline-chart>`;
      case 'Pareto Chart': return `<ngx-pareto-chart [data]="data" [showGrid]="${g}" [showLabels]="${valLabels}" [height]="${h}"></ngx-pareto-chart>`;
      case 'Marimekko Chart': return `<ngx-marimekko-chart [data]="data" [showGrid]="${g}" [showLabels]="${valLabels}" [height]="${h}"></ngx-marimekko-chart>`;
      case 'Chord Diagram': return `<ngx-chord-diagram [matrix]="matrix" [labels]="labels" [showLabels]="${valLabels}" [height]="${h}"></ngx-chord-diagram>`;
      case 'Dependency Wheel': return `<ngx-dependency-wheel [matrix]="matrix" [labels]="labels" [showLabels]="${valLabels}" [height]="${h}"></ngx-dependency-wheel>`;
      case 'Adjacency Matrix': return `<ngx-adjacency-matrix [matrix]="matrix" [labels]="labels" [showLabels]="${valLabels}" [height]="${h}"></ngx-adjacency-matrix>`;
      case 'Biplot / PCA Plot': return `<ngx-biplot [points]="points" [vectors]="vectors" [showLabels]="${valLabels}" [height]="${h}"></ngx-biplot>`;
      case 'Renko Chart': return `<ngx-renko-chart
  [data]="data"
  [boxSize]="5"
  [height]="${h}"
  [showGrid]="${g}"
  [showExport]="true"${this.useCustomFormatter() ? '\n  [labelFormatter]="labelFormatter"' : ''}${this.useCustomTooltip() ? '\n  [tooltipTemplate]="customTooltip"' : ''}>
</ngx-renko-chart>`;
      case 'Kagi Chart': return `<ngx-kagi-chart
  [data]="data"
  [reversalAmount]="15"
  [height]="${h}"
  [showGrid]="${g}"
  [showExport]="true"${this.useCustomFormatter() ? '\n  [labelFormatter]="labelFormatter"' : ''}${this.useCustomTooltip() ? '\n  [tooltipTemplate]="customTooltip"' : ''}>
</ngx-kagi-chart>`;
      case 'Point & Figure Chart': return `<ngx-point-figure-chart
  [data]="data"
  [boxSize]="4"
  [reversal]="3"
  [height]="${h}"
  [showGrid]="${g}"
  [showExport]="true"${this.useCustomFormatter() ? '\n  [labelFormatter]="labelFormatter"' : ''}${this.useCustomTooltip() ? '\n  [tooltipTemplate]="customTooltip"' : ''}>
</ngx-point-figure-chart>`;
      case 'Wind Rose': return `<ngx-wind-rose
  [data]="data"
  [height]="${h}"
  [colors]="colors"
  [showExport]="true"${this.useCustomFormatter() ? '\n  [labelFormatter]="labelFormatter"' : ''}${this.useCustomTooltip() ? '\n  [tooltipTemplate]="customTooltip"' : ''}>
</ngx-wind-rose>`;
      default: return '';
    }
  }

  getExtraStateVariables(tab: string): string {
    let extra = '';
    if (tab === 'Bar Chart' || tab === 'Line Chart') {
      if (this.showRefLinesToggle()) {
        if (tab === 'Bar Chart') {
          extra += `referenceLines = [
    { value: 75, label: 'Target', color: '#10b981', strokeDasharray: '4,4' },
    { value: 45, label: 'Warning', color: '#f59e0b', strokeDasharray: '2,2' }
  ];\n  `;
        } else {
          extra += `referenceLines = [
    { value: 300, label: 'Target Users', color: '#818cf8', strokeDasharray: '3,3' },
    { value: 150, label: 'Min SLA', color: '#ef4444', strokeDasharray: '5,5' }
  ];\n  `;
        }
      }
      if (this.useCustomFormatter()) {
        if (tab === 'Bar Chart') {
          extra += `labelFormatter = (v: number) => '$' + v + 'M';\n  `;
        } else {
          extra += `labelFormatter = (v: number) => v + ' active';\n  `;
        }
      }
      if (tab === 'Bar Chart') {
        extra += `onBarClick(event: any) {
    console.log('Bar clicked:', event);
  }\n  `;
      } else {
        extra += `onPointClick(event: any) {
    console.log('Point clicked:', event);
  }\n  `;
      }
      return extra.trim();
    }
    if (tab === 'Gauge Chart') {
      return `thresholds = [
    { value: 40, color: '#10b981' },
    { value: 75, color: '#f59e0b' },
    { value: 100, color: '#ef4444' }
  ];`;
    }
    if (tab === 'Combo Chart') {
      return `barSeries = [{ name: 'Sales Volume', data: [450, 620, 580, 810, 940, 880] }];
  lineSeries = [{ name: 'Gross Margin %', data: [28, 32, 30, 35, 38, 36] }];`;
    }
    if (tab === 'Sankey Chart') {
      return `nodes = ${JSON.stringify(this.sankeyNodes, null, 2)};
  links = ${JSON.stringify(this.sankeyLinks, null, 2)};`;
    }
    if (tab === 'Chord Diagram' || tab === 'Dependency Wheel' || tab === 'Adjacency Matrix') {
      return `matrix = ${JSON.stringify(this.chordMatrix, null, 2)};
  labels = ${JSON.stringify(this.chordLabels, null, 2)};`;
    }
    if (tab === 'Biplot / PCA Plot') {
      return `points = ${JSON.stringify(this.biplotPoints, null, 2)};
  vectors = ${JSON.stringify(this.biplotVectors, null, 2)};`;
    }
    if (tab === 'Renko Chart' || tab === 'Kagi Chart' || tab === 'Point & Figure Chart') {
      let code = '';
      if (this.useCustomFormatter()) {
        code = `labelFormatter = (v: number) => '$' + v.toFixed(1);`;
      }
      return code;
    }
    if (tab === 'Wind Rose') {
      let code = '';
      if (this.useCustomFormatter()) {
        code = `labelFormatter = (v: number) => v.toFixed(1) + '%';`;
      }
      return code;
    }
    return '';
  }

  getPlaygroundTooltipTemplate(tab: string): string {
    if (!this.useCustomTooltip()) return '';
    
    switch(tab) {
      case 'Renko Chart':
        return `\n      <ng-template #customTooltip let-t>
        <div style="background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px; color: #ffffff; font-size: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.15);">
          <div style="font-weight: bold; margin-bottom: 4px; color: #38bdf8;">Renko Brick Details</div>
          <div>Type: <span [style.color]="t.type === 'bullish' ? '#10b981' : '#ef4444'">\\{{ t.type }}</span></div>
          <div>Open: $\\{{ t.open.toFixed(1) }}</div>
          <div>Close: $\\{{ t.close.toFixed(1) }}</div>
        </div>
      </ng-template>`;
      case 'Kagi Chart':
        return `\n      <ng-template #customTooltip let-t>
        <div style="background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px; color: #ffffff; font-size: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.15);">
          <div style="font-weight: bold; margin-bottom: 4px; color: #38bdf8;">Kagi Segment Details</div>
          <div>Trend: <span [style.color]="t.trend === 'bullish' ? '#10b981' : '#ef4444'">\\{{ t.trend }}</span></div>
          @if (t.type === 'vertical') {
            <div>From: $\\{{ t.val1.toFixed(1) }}</div>
            <div>To: $\\{{ t.val2.toFixed(1) }}</div>
          } @else {
            <div>Reversal: $\\{{ t.val1.toFixed(1) }}</div>
          }
        </div>
      </ng-template>`;
      case 'Point & Figure Chart':
        return `\n      <ng-template #customTooltip let-t>
        <div style="background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px; color: #ffffff; font-size: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.15);">
          <div style="font-weight: bold; margin-bottom: 4px; color: #38bdf8;">P&F Cell Details</div>
          <div>Type: <span [style.color]="t.type === 'X' ? '#10b981' : '#ef4444'">\\{{ t.type === 'X' ? 'Rise (X)' : 'Fall (O)' }}</span></div>
          <div>Level: $\\{{ t.value.toFixed(1) }}</div>
          <div>Column: #\\{{ t.colIdx + 1 }}</div>
        </div>
      </ng-template>`;
      case 'Wind Rose':
        return `\n      <ng-template #customTooltip let-t>
        <div style="background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px; color: #ffffff; font-size: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.15);">
          <div style="font-weight: bold; margin-bottom: 4px; color: #38bdf8;">\\{{ t.direction }} Sector</div>
          <div>Bin: \\{{ t.binLabel }}</div>
          <div>Value: \\{{ t.value.toFixed(1) }}%</div>
          <div>Cumulative: \\{{ t.cumValue.toFixed(1) }}%</div>
        </div>
      </ng-template>`;
      default:
        return `\n      <ng-template #customTooltip let-t>
        <div style="background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px; color: #ffffff; font-size: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.15);">
          <div style="font-weight: bold; margin-bottom: 4px; color: #38bdf8;">\\{{ t.cat || 'Details' }}</div>
          @for (row of t.rows; track $index) {
            <div style="display: flex; align-items: center; gap: 6px; margin: 2px 0;">
              <span [style.background]="row.color" style="width: 8px; height: 8px; border-radius: 50%; display: inline-block;"></span>
              <span>\\{{ row.name }}:</span>
              <span style="font-weight: bold;">\\{{ row.value }}</span>
            </div>
          }
        </div>
      </ng-template>`;
    }
  }

  getMockDataString(tab: string): string {
    switch(tab) {
      case 'Bar Chart': return JSON.stringify(this.barSeries, null, 2);
      case 'Line Chart': return JSON.stringify(this.lineSeries, null, 2);
      case 'Area Chart': return JSON.stringify(this.lineSeries, null, 2);
      case 'Pie / Donut': return JSON.stringify(this.pieData, null, 2);
      case 'Sparkline': return JSON.stringify([120, 145, 130, 168, 190, 176, 210], null, 2);
      case 'Gauge Chart': return '65';
      case 'Radar Chart': return JSON.stringify(this.radarSeries, null, 2);
      case 'Heatmap Chart': return JSON.stringify(this.heatmapData(), null, 2);
      case 'Treemap Chart': return JSON.stringify(this.treemapData(), null, 2);
      case 'Funnel / Pyramid Chart': return JSON.stringify(this.funnelData(), null, 2);
      case 'Combo Chart': return '[]';
      case 'Scatter Plot': return JSON.stringify(this.scatterData, null, 2);
      case 'Bubble Chart': return JSON.stringify(this.bubbleData(), null, 2);
      case 'Sunburst Chart': return JSON.stringify(this.sunburstData(), null, 2);
      case 'Waterfall Chart': return JSON.stringify(this.waterfallData, null, 2);
      case 'Box Plot Chart': return JSON.stringify(this.boxPlotData, null, 2);
      case 'Radial Bar Chart': return JSON.stringify(this.radialData, null, 2);
      case 'Candlestick Chart': return JSON.stringify(this.candlestickData, null, 2);
      case 'Polar Area Chart': return JSON.stringify(this.pieData, null, 2);
      case 'Bullet Chart': return '70';
      case 'Dumbbell Chart': return JSON.stringify(this.dumbbellData, null, 2);
      case 'Lollipop Chart': return JSON.stringify(this.lollipopData, null, 2);
      case 'Slope Chart': return JSON.stringify(this.slopeData, null, 2);
      case 'Sankey Chart': return '[]';
      case 'Violin Plot': return JSON.stringify(this.violinData, null, 2);
      case 'Ridgeline Chart': return JSON.stringify(this.ridgelineData, null, 2);
      case 'Pareto Chart': return JSON.stringify(this.paretoData, null, 2);
      case 'Marimekko Chart': return JSON.stringify(this.marimekkoData, null, 2);
      case 'Chord Diagram': return '[]';
      case 'Dependency Wheel': return '[]';
      case 'Adjacency Matrix': return '[]';
      case 'Biplot / PCA Plot': return '[]';
      case 'Renko Chart': return JSON.stringify(this.financialPrices, null, 2);
      case 'Kagi Chart': return JSON.stringify(this.financialPrices, null, 2);
      case 'Point & Figure Chart': return JSON.stringify(this.financialPrices, null, 2);
      case 'Wind Rose': return JSON.stringify(this.windRoseData, null, 2);
      default: return '[]';
    }
  }

  editInStackBlitz() {
    const chartType = this.activeTab();
    
    // Base files
    const files: Record<string, string> = {
      'src/index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Angular Chart Demo</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin: 0; background-color: #f8fafc;">
  <app-root></app-root>
</body>
</html>`,
      'src/main.ts': `import { bootstrapApplication } from '@angular/platform-browser';
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ${this.getComponentClass(chartType)} } from 'ngx-core-components';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ${this.getComponentClass(chartType)}],
  template: \`
    <div style="padding: 32px; font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto;">
      <h2 style="color: #0f172a; margin-bottom: 4px; font-weight: 800;">${chartType} Sandbox</h2>
      <p style="color: #64748b; font-size: 14px; margin-top: 0; margin-bottom: 24px;">
        Bootstrap 5 inspired, zero-dependency SVG component compiled standalone.
      </p>
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        ${this.getPlaygroundTemplate(chartType)}
      </div>
      ${this.getPlaygroundTooltipTemplate(chartType)}
    </div>
  \`
})
export class App {
  chartType = '${chartType}';
  data = ${this.getMockDataString(chartType)};
  ${this.getExtraStateVariables(chartType)}
}

bootstrapApplication(App).catch(err => console.error(err));`,
      'src/styles.css': `/* Global styles */`,
      'angular.json': JSON.stringify({
        "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
        "version": 1,
        "newProjectRoot": "projects",
        "projects": {
          "demo": {
            "projectType": "application",
            "root": "",
            "sourceRoot": "src",
            "prefix": "app",
            "architect": {
              "build": {
                "builder": "@angular-devkit/build-angular:application",
                "options": {
                  "outputPath": "dist/demo",
                  "index": "src/index.html",
                  "browser": "src/main.ts",
                  "polyfills": [
                    "zone.js"
                  ],
                  "tsConfig": "tsconfig.app.json",
                  "styles": [
                    "src/styles.css"
                  ]
                },
                "configurations": {
                  "production": {
                    "optimization": true,
                    "outputHashing": "all",
                    "sourceMap": false
                  },
                  "development": {
                    "optimization": false,
                    "sourceMap": true
                  }
                },
                "defaultConfiguration": "development"
              },
              "serve": {
                "builder": "@angular-devkit/build-angular:dev-server",
                "configurations": {
                  "production": {
                    "buildTarget": "demo:build:production"
                  },
                  "development": {
                    "buildTarget": "demo:build:development"
                  }
                },
                "defaultConfiguration": "development"
              }
            }
          }
        }
      }, null, 2),
      'package.json': JSON.stringify({
        name: `ngx-chart-${chartType.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-demo`,
        version: '1.0.0',
        private: true,
        scripts: {
          "start": "ng serve"
        },
        dependencies: {
          '@angular/common': '^19.2.0',
          '@angular/compiler': '^19.2.0',
          '@angular/core': '^19.2.0',
          '@angular/forms': '^19.2.0',
          '@angular/platform-browser': '^19.2.0',
          '@angular/platform-browser-dynamic': '^19.2.0',
          '@angular/router': '^19.2.0',
          'ngx-core-components': '^0.3.20',
          'rxjs': '~7.8.0',
          'zone.js': '~0.15.0',
          'tslib': '^2.3.0'
        },
        devDependencies: {
          '@angular-devkit/build-angular': '^19.2.23',
          '@angular/cli': '^19.2.23',
          '@angular/compiler-cli': '^19.2.0',
          'typescript': '~5.7.2'
        },
        stackblitz: {
          startCommand: 'npm start'
        }
      }, null, 2),
      'tsconfig.json': JSON.stringify({
        "compileOnSave": false,
        "compilerOptions": {
          "target": "ES2022",
          "module": "ES2022",
          "moduleResolution": "bundler",
          "esModuleInterop": true,
          "experimentalDecorators": true,
          "skipLibCheck": true,
          "allowSyntheticDefaultImports": true,
          "baseUrl": "./"
        }
      }, null, 2),
      'tsconfig.app.json': JSON.stringify({
        "extends": "./tsconfig.json",
        "compilerOptions": {
          "outDir": "./out-tsc/app",
          "types": []
        },
        "files": [
          "src/main.ts"
        ],
        "include": [
          "src/**/*.ts",
          "src/**/*.d.ts"
        ]
      }, null, 2)
    };

    // Build and submit form POSTing to StackBlitz programmatic compiler
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://stackblitz.com/run';
    form.target = '_blank';

    const dependencies = {
      '@angular/common': '^19.2.0',
      '@angular/compiler': '^19.2.0',
      '@angular/core': '^19.2.0',
      '@angular/forms': '^19.2.0',
      '@angular/platform-browser': '^19.2.0',
      '@angular/platform-browser-dynamic': '^19.2.0',
      '@angular/router': '^19.2.0',
      'ngx-core-components': '0.3.20',
      'rxjs': '~7.8.0',
      'zone.js': '~0.15.0',
      'tslib': '^2.3.0'
    };

    const metadata = {
      title: `${chartType} Standalone Sandbox`,
      description: `Programmatic showcase of ${chartType} from ngx-core-components library.`,
      tags: 'angular,svg,charting,enterprise',
      template: 'node',
      dependencies: JSON.stringify(dependencies)
    };

    for (const [key, value] of Object.entries(metadata)) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = `project[${key}]`;
      input.value = value;
      form.appendChild(input);
    }

    for (const [path, content] of Object.entries(files)) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = `project[files][${path}]`;
      input.value = content;
      form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }

  editInCodeSandbox() {
    const chartType = this.activeTab();
    
    // Base files
    const files: Record<string, any> = {
      'src/index.html': {
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Angular Chart Demo</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin: 0; background-color: #f8fafc;">
  <app-root></app-root>
</body>
</html>`
      },
      'src/main.ts': {
        content: `import { bootstrapApplication } from '@angular/platform-browser';
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ${this.getComponentClass(chartType)} } from 'ngx-core-components';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ${this.getComponentClass(chartType)}],
  template: \`
    <div style="padding: 32px; font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto;">
      <h2 style="color: #0f172a; margin-bottom: 4px; font-weight: 800;">\${chartType} Sandbox</h2>
      <p style="color: #64748b; font-size: 14px; margin-top: 0; margin-bottom: 24px;">
        Bootstrap 5 inspired, zero-dependency SVG component compiled standalone.
      </p>
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        \${this.getPlaygroundTemplate(chartType)}
      </div>
      \${this.getPlaygroundTooltipTemplate(chartType)}
    </div>
  \`
})
export class App {
  chartType = '\${chartType}';
  data = ${this.getMockDataString(chartType)};
  ${this.getExtraStateVariables(chartType)}
}

bootstrapApplication(App).catch(err => console.error(err));`
      },
      'src/styles.css': {
        content: `/* Global styles */`
      },
      'angular.json': {
        content: JSON.stringify({
          "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
          "version": 1,
          "newProjectRoot": "projects",
          "projects": {
            "demo": {
              "projectType": "application",
              "root": "",
              "sourceRoot": "src",
              "prefix": "app",
              "architect": {
                "build": {
                  "builder": "@angular-devkit/build-angular:application",
                  "options": {
                    "outputPath": "dist/demo",
                    "index": "src/index.html",
                    "browser": "src/main.ts",
                    "polyfills": [
                      "zone.js"
                    ],
                    "tsConfig": "tsconfig.app.json",
                    "styles": [
                      "src/styles.css"
                    ]
                  },
                  "configurations": {
                    "production": {
                      "optimization": true,
                      "outputHashing": "all",
                      "sourceMap": false
                    },
                    "development": {
                      "optimization": false,
                      "sourceMap": true
                    }
                  },
                  "defaultConfiguration": "development"
                },
                "serve": {
                  "builder": "@angular-devkit/build-angular:dev-server",
                  "configurations": {
                    "production": {
                      "buildTarget": "demo:build:production"
                    },
                    "development": {
                      "buildTarget": "demo:build:development"
                    }
                  },
                  "defaultConfiguration": "development"
                }
              }
            }
          }
        }, null, 2)
      },
      'package.json': {
        content: JSON.stringify({
          name: `ngx-chart-${chartType.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-demo`,
          version: '1.0.0',
          private: true,
          scripts: {
            "start": "ng serve"
          },
          dependencies: {
            '@angular/common': '^19.2.0',
            '@angular/compiler': '^19.2.0',
            '@angular/core': '^19.2.0',
            '@angular/forms': '^19.2.0',
            '@angular/platform-browser': '^19.2.0',
            '@angular/platform-browser-dynamic': '^19.2.0',
            '@angular/router': '^19.2.0',
            'ngx-core-components': '0.3.20',
            'rxjs': '~7.8.0',
            'zone.js': '~0.15.0',
            'tslib': '^2.3.0'
          },
          devDependencies: {
            '@angular-devkit/build-angular': '^19.2.23',
            '@angular/cli': '^19.2.23',
            '@angular/compiler-cli': '^19.2.0',
            'typescript': '~5.7.2'
          }
        }, null, 2)
      },
      'tsconfig.json': {
        content: JSON.stringify({
          "compileOnSave": false,
          "compilerOptions": {
            "target": "ES2022",
            "module": "ES2022",
            "moduleResolution": "bundler",
            "esModuleInterop": true,
            "experimentalDecorators": true,
            "skipLibCheck": true,
            "allowSyntheticDefaultImports": true,
            "baseUrl": "./"
          }
        }, null, 2)
      },
      'tsconfig.app.json': {
        content: JSON.stringify({
          "extends": "./tsconfig.json",
          "compilerOptions": {
            "outDir": "./out-tsc/app",
            "types": []
          },
          "files": [
            "src/main.ts"
          ],
          "include": [
            "src/**/*.ts",
            "src/**/*.d.ts"
          ]
        }, null, 2)
      }
    };

    // Load LZString dynamically from CDN on demand to create CodeSandbox parameters
    const loadLZString = (): Promise<any> => {
      return new Promise((resolve, reject) => {
        if ((window as any).LZString) {
          resolve((window as any).LZString);
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lz-string/1.5.0/lz-string.min.js';
        script.onload = () => resolve((window as any).LZString);
        script.onerror = (err) => reject(err);
        document.head.appendChild(script);
      });
    };

    loadLZString().then((LZString) => {
      const payload = {
        files,
        template: 'node'
      };
      
      const jsonStr = JSON.stringify(payload);
      const compressed = LZString.compressToBase64(jsonStr)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://codesandbox.io/api/v1/sandboxes/define';
      form.target = '_blank';

      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'parameters';
      input.value = compressed;
      form.appendChild(input);

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
    }).catch(err => {
      console.error('Failed to load LZ-String compression library from CDN:', err);
    });
  }

  Number(v: any): number { return Number(v); }

  // ===== SPECIFIC INPUT REFERENCES FOR DEMO DOCUMENTATION =====
  barInputs: ApiRow[] = [
    { name: 'series', type: 'ChartSeries[]', default: '[]', description: 'Array of data series. Each series has a name and an array of numeric values.' },
    { name: 'categories', type: 'string[]', default: '[]', description: 'Category labels for the X axis.' },
    { name: 'showLabels', type: 'boolean', default: 'false', description: 'Show value label on top of each bar.' },
    { name: 'showGrid', type: 'boolean', default: 'true', description: 'Show horizontal grid lines in the chart area.' },
    { name: 'showLegend', type: 'boolean', default: 'true', description: 'Show a color-coded legend below the chart.' },
    { name: 'colors', type: 'string[]', default: 'CHART_COLORS', description: 'Custom color palette.' },
    { name: 'height', type: 'number', default: '260', description: 'Chart height in pixels.' },
    { name: 'referenceLines', type: 'ReferenceLine[]', default: '[]', description: 'Enterprise feature: Draw horizontal helper lines with text annotations.' },
    { name: 'labelFormatter', type: '(v: number) => string', default: 'undefined', description: 'Enterprise feature: Callback function to format data labels.' },
    { name: 'tooltipTemplate', type: 'TemplateRef<any>', default: 'null', description: 'Enterprise feature: Custom projected template for custom HTML tooltips.' },
    { name: 'barClick', type: 'OutputEmitter', default: '-', description: 'Enterprise feature: Output fired when a bar rect element is clicked.' }
  ];

  lineInputs: ApiRow[] = [
    { name: 'series', type: 'ChartSeries[]', default: '[]', description: 'Array of data series. Each has a name and numeric data[] array.' },
    { name: 'categories', type: 'string[]', default: '[]', description: 'X-axis category labels.' },
    { name: 'showArea', type: 'boolean', default: 'false', description: 'Fill the area under each line with a translucent color.' },
    { name: 'showMarkers', type: 'boolean', default: 'true', description: 'Show circular data point markers on the lines.' },
    { name: 'showGrid', type: 'boolean', default: 'true', description: 'Show horizontal grid lines.' },
    { name: 'showLegend', type: 'boolean', default: 'true', description: 'Show series legend below the chart.' },
    { name: 'colors', type: 'string[]', default: 'CHART_COLORS', description: 'Custom color palette.' },
    { name: 'height', type: 'number', default: '300', description: 'Chart height in pixels.' },
    { name: 'showLabels', type: 'boolean', default: 'false', description: 'Show value labels above the line markers.' },
    { name: 'referenceLines', type: 'ReferenceLine[]', default: '[]', description: 'Enterprise feature: Draw horizontal helper lines with text annotations.' },
    { name: 'labelFormatter', type: '(v: number) => string', default: 'undefined', description: 'Enterprise feature: Callback function to format data labels.' },
    { name: 'tooltipTemplate', type: 'TemplateRef<any>', default: 'null', description: 'Enterprise feature: Custom projected template for custom HTML tooltips.' },
    { name: 'pointClick', type: 'OutputEmitter', default: '-', description: 'Enterprise feature: Output fired when a line point marker is clicked.' }
  ];

  areaInputs: ApiRow[] = [
    { name: 'series', type: 'ChartSeries[]', default: '[]', description: 'Array of data series, each containing name and numeric data array.' },
    { name: 'categories', type: 'string[]', default: '[]', description: 'X-axis category labels.' },
    { name: 'height', type: 'number', default: '260', description: 'Height of the chart in pixels.' },
    { name: 'showGrid', type: 'boolean', default: 'true', description: 'Show background grid lines.' },
    { name: 'showMarkers', type: 'boolean', default: 'true', description: 'Show dots/markers on data coordinate points.' },
    { name: 'showLegend', type: 'boolean', default: 'true', description: 'Show series legend panel above the chart.' },
    { name: 'colors', type: 'string[]', default: 'CHART_COLORS', description: 'List of colors to cycle through for series lines.' }
  ];

  pieInputs: ApiRow[] = [
    { name: 'data', type: 'ChartDataPoint[]', default: '[]', description: 'Array of { label, value } data points for each slice.' },
    { name: 'mode', type: "'pie' | 'donut'", default: "'pie'", description: "Rendering mode. 'donut' cuts a hole in the center." },
    { name: 'donutHoleSize', type: 'number', default: '0.55', description: 'Fraction (0–1) of the radius that is cut out in donut mode.' },
    { name: 'centerTitle', type: 'string', default: "''", description: 'Text displayed in the center hole (donut mode only).' },
    { name: 'centerValue', type: 'string', default: "''", description: 'Center subtext/value displayed (donut mode only).' },
    { name: 'showLabels', type: 'boolean', default: 'true', description: 'Show percentage labels on each slice.' },
    { name: 'showLegend', type: 'boolean', default: 'true', description: 'Show the color-coded legend.' },
    { name: 'colors', type: 'string[]', default: 'CHART_COLORS', description: 'Custom color palette. One color per slice.' },
    { name: 'height', type: 'number', default: '300', description: 'Chart height in pixels.' },
  ];

  comboInputs: ApiRow[] = [
    { name: 'barSeries', type: 'ChartSeries[]', default: '[]', description: 'Array of series data represented as bars (Left Y-Axis).' },
    { name: 'lineSeries', type: 'ChartSeries[]', default: '[]', description: 'Array of series data represented as lines (Right Y-Axis).' },
    { name: 'categories', type: 'string[]', default: '[]', description: 'Category labels for the X-axis.' },
    { name: 'barYTitle', type: 'string', default: "'Volume'", description: 'Title label for the Left Y-axis.' },
    { name: 'lineYTitle', type: 'string', default: "'Percentage'", description: 'Title label for the Right Y-axis.' },
    { name: 'showLegend', type: 'boolean', default: 'true', description: 'Show the color-coded chart legend.' },
    { name: 'showGrid', type: 'boolean', default: 'true', description: 'Show horizontal background grid lines.' },
    { name: 'height', type: 'number', default: '300', description: 'Chart height in pixels.' }
  ];

  scatterInputs: ApiRow[] = [
    { name: 'data', type: 'ScatterPoint[]', default: '[]', description: 'List of data points containing x, y coordinates, label, group, and size.' },
    { name: 'xTitle', type: 'string', default: "'X Axis'", description: 'Label title for the X-axis.' },
    { name: 'yTitle', type: 'string', default: "'Y Axis'", description: 'Label title for the Y-axis.' },
    { name: 'showLegend', type: 'boolean', default: 'true', description: 'Show the group categorization legend.' },
    { name: 'showGrid', type: 'boolean', default: 'true', description: 'Show vertical and horizontal background grid lines.' },
    { name: 'height', type: 'number', default: '300', description: 'Chart height in pixels.' }
  ];

  sparklineInputs: ApiRow[] = [
    { name: 'data', type: 'number[]', default: '[]', description: 'Array of numeric values to plot.' },
    { name: 'type', type: "'line' | 'area' | 'bar'", default: "'line'", description: 'Sparkline rendering type.' },
    { name: 'color', type: 'string', default: "'#4a90d9'", description: 'Primary color for the sparkline.' },
    { name: 'width', type: 'number', default: '100', description: 'Width in pixels.' },
    { name: 'height', type: 'number', default: '32', description: 'Height in pixels.' },
  ];

  gaugeInputs: ApiRow[] = [
    { name: 'value', type: 'number', default: 'required', description: 'Current numerical value displayed in the gauge.' },
    { name: 'min', type: 'number', default: '0', description: 'Minimum bounds value.' },
    { name: 'max', type: 'number', default: '100', description: 'Maximum bounds value.' },
    { name: 'label', type: 'string', default: "''", description: 'Center subtext label (e.g. Unit title).' },
    { name: 'type', type: "'full' | 'semi'", default: "'semi'", description: 'Dials arc shape.' },
    { name: 'showNeedle', type: 'boolean', default: 'true', description: 'Displays the central pointer needle.' },
    { name: 'color', type: 'string', default: "'#4f46e5'", description: 'Default color if no thresholds match.' },
    { name: 'thresholds', type: 'GaugeThreshold[]', default: '[]', description: 'Adaptive color mapping depending on value level limits.' }
  ];

  radarInputs: ApiRow[] = [
    { name: 'seriesData', type: 'RadarSeries[]', default: 'required', description: 'Dimensions dataset mappings containing values arrays.' },
    { name: 'categories', type: 'string[]', default: 'required', description: 'Web spokes axes dimension names.' },
    { name: 'max', type: 'number', default: '100', description: 'Maximum value bounds.' }
  ];

  heatmapInputs: ApiRow[] = [
    { name: 'data', type: 'number[][]', default: 'required', description: '2D array mapping row and column values.' },
    { name: 'xAxisLabels', type: 'string[]', default: '[]', description: 'Text labels mapped sequentially above the columns.' },
    { name: 'yAxisLabels', type: 'string[]', default: '[]', description: 'Text labels mapped sequentially to the left of the rows.' },
    { name: 'colorRange', type: 'string[]', default: "['#e2e8f0', '#4f46e5']", description: 'Hex boundaries determining gradient shading.' }
  ];

  treemapInputs: ApiRow[] = [
    { name: 'data', type: 'TreemapItem[]', default: 'required', description: 'List of label-value data items to subdivide proportionally.' }
  ];

  funnelInputs: ApiRow[] = [
    { name: 'data', type: 'FunnelItem[]', default: '[]', description: 'List of stage items in order, containing name and numeric value.' },
    { name: 'mode', type: "'funnel' | 'pyramid'", default: "'funnel'", description: 'Switches layout geometry flow shapes.' },
    { name: 'height', type: 'number', default: '300', description: 'Height of the SVG drawing canvas in pixels.' }
  ];

  // ===== NEW INPUTS DOCUMENTATION =====
  waterfallInputs: ApiRow[] = [
    { name: 'data', type: 'WaterfallItem[]', default: '[]', description: 'List of incremental change items. Items with isTotal: true will plot from zero.' },
    { name: 'height', type: 'number', default: '300', description: 'Height of the chart canvas.' },
    { name: 'showGrid', type: 'boolean', default: 'true', description: 'Shows background horizontal gridlines.' },
    { name: 'showLabels', type: 'boolean', default: 'true', description: 'Shows individual values labels directly on the bars.' },
    { name: 'positiveColor', type: 'string', default: "'#10b981'", description: 'Bar fill color for positive delta changes.' },
    { name: 'negativeColor', type: 'string', default: "'#ef4444'", description: 'Bar fill color for negative delta changes.' },
    { name: 'totalColor', type: 'string', default: "'#64748b'", description: 'Bar fill color for total/balance columns.' }
  ];

  boxPlotInputs: ApiRow[] = [
    { name: 'data', type: 'BoxPlotItem[]', default: '[]', description: 'Statistical distribution data containing min, q1, median, q3, max, and optional outliers.' },
    { name: 'height', type: 'number', default: '300', description: 'Height of the chart canvas.' },
    { name: 'showGrid', type: 'boolean', default: 'true', description: 'Shows background gridlines.' },
    { name: 'color', type: 'string', default: "'#4f46e5'", description: 'Stroke and outline border color for the boxes and whiskers.' },
    { name: 'fillColor', type: 'string', default: "'rgba(79, 70, 229, 0.12)'", description: 'Translucent background fill for the boxes.' },
    { name: 'outlierColor', type: 'string', default: "'#ef4444'", description: 'Dot indicator fill color for outlier values.' }
  ];

  radialInputs: ApiRow[] = [
    { name: 'data', type: 'RadialBarItem[]', default: '[]', description: 'Concentric ring items containing value and max thresholds.' },
    { name: 'height', type: 'number', default: '300', description: 'Total diameter width and height bounds.' },
    { name: 'showLegend', type: 'boolean', default: 'true', description: 'Displays categorizations labels list next to rings.' },
    { name: 'strokeWidth', type: 'number', default: '10', description: 'Width thickness of the rings tracks.' },
    { name: 'ringGap', type: 'number', default: '4', description: 'Gap spacing distance between concentric rings.' }
  ];

  candlestickInputs: ApiRow[] = [
    { name: 'data', type: 'CandlestickItem[]', default: '[]', description: 'OHLC financial values containing open, high, low, close numbers.' },
    { name: 'height', type: 'number', default: '300', description: 'Height of the chart canvas.' },
    { name: 'showGrid', type: 'boolean', default: 'true', description: 'Shows background gridlines.' },
    { name: 'bullishColor', type: 'string', default: "'#10b981'", description: 'Stroke and fill color when close price is higher than open price.' },
    { name: 'bearishColor', type: 'string', default: "'#ef4444'", description: 'Stroke and fill color when close price is lower than open price.' }
  ];

  bubbleInputs: ApiRow[] = [
    { name: 'data', type: 'BubblePoint[]', default: '[]', description: 'List of data points containing x, y, size magnitude z, label, and group.' },
    { name: 'xTitle', type: 'string', default: "'X Axis'", description: 'Label title for the X-axis.' },
    { name: 'yTitle', type: 'string', default: "'Y Axis'", description: 'Label title for the Y-axis.' },
    { name: 'zTitle', type: 'string', default: "'Size'", description: 'Label title for the size coordinate z.' },
    { name: 'showLegend', type: 'boolean', default: 'true', description: 'Show the group categorization legend.' },
    { name: 'showGrid', type: 'boolean', default: 'true', description: 'Show background grid lines.' },
    { name: 'showLabels', type: 'boolean', default: 'true', description: 'Show labels inside the bubbles for larger sizes.' },
    { name: 'height', type: 'number', default: '300', description: 'Chart height in pixels.' },
    { name: 'showExport', type: 'boolean', default: 'false', description: 'Enable file export dropdown menu (JSON, CSV, SVG).' }
  ];

  sunburstInputs: ApiRow[] = [
    { name: 'data', type: 'SunburstNode[]', default: '[]', description: 'Hierarchical tree structure of nodes with label, optional children, and value.' },
    { name: 'height', type: 'number', default: '300', description: 'Chart diameter width and height bounds.' },
    { name: 'showLegend', type: 'boolean', default: 'true', description: 'Show a legend listing the top-level categories.' },
    { name: 'showLabels', type: 'boolean', default: 'true', description: 'Show label text inside the concentric rings.' },
    { name: 'colors', type: 'string[]', default: 'CHART_COLORS', description: 'Custom color palette.' },
    { name: 'showExport', type: 'boolean', default: 'false', description: 'Enable file export dropdown menu (JSON, CSV, SVG).' }
  ];

  polarAreaInputs: ApiRow[] = [
    { name: 'data', type: 'ChartDataPoint[]', default: '[]', description: 'Array of data points containing label, value, and optional color.' },
    { name: 'height', type: 'number', default: '280', description: 'Height of the chart in pixels.' },
    { name: 'showLegend', type: 'boolean', default: 'true', description: 'Show color-coded legend below the chart.' },
    { name: 'showLabels', type: 'boolean', default: 'true', description: 'Show value labels inside the slices.' },
    { name: 'colors', type: 'string[]', default: 'CHART_COLORS', description: 'Custom color palette.' },
    { name: 'showExport', type: 'boolean', default: 'false', description: 'Enable data export options.' }
  ];

  bulletInputs: ApiRow[] = [
    { name: 'value', type: 'number', default: '0', description: 'The actual measured value to display.' },
    { name: 'target', type: 'number', default: '0', description: 'The target value threshold mark.' },
    { name: 'max', type: 'number', default: '100', description: 'The maximum limit on the chart scale.' },
    { name: 'ranges', type: 'number[]', default: '[50, 85, 100]', description: 'Boundaries for qualitative performance ranges.' },
    { name: 'rangeColors', type: 'string[]', default: 'grey shades', description: 'List of color hexes for the qualitative range bars.' },
    { name: 'valueColor', type: 'string', default: "'#4f46e5'", description: 'Color of the actual progress bar.' },
    { name: 'targetColor', type: 'string', default: "'#ef4444'", description: 'Color of the vertical target marker line.' },
    { name: 'height', type: 'number', default: '50', description: 'Height of the chart canvas.' },
    { name: 'showLabels', type: 'boolean', default: 'true', description: 'Show numeric tick labels at the bottom.' }
  ];

  dumbbellInputs: ApiRow[] = [
    { name: 'data', type: 'DumbbellItem[]', default: '[]', description: 'List of dumbbell items with start and end values.' },
    { name: 'height', type: 'number', default: '350', description: 'Total height of the chart canvas.' },
    { name: 'showGrid', type: 'boolean', default: 'true', description: 'Enable horizontal reference grids.' },
    { name: 'showLabels', type: 'boolean', default: 'true', description: 'Display Y axis categories labels.' },
    { name: 'startColor', type: 'string', default: "'#ef4444'", description: 'Color fill for start value endpoint circle.' },
    { name: 'endColor', type: 'string', default: "'#10b981'", description: 'Color fill for end value endpoint circle.' },
    { name: 'startLabel', type: 'string', default: "'Start'", description: 'Label name in the chart legend for start dots.' },
    { name: 'endLabel', type: 'string', default: "'End'", description: 'Label name in the chart legend for end dots.' },
    { name: 'showLegend', type: 'boolean', default: 'true', description: 'Enable legend display at the top.' }
  ];

  lollipopInputs: ApiRow[] = [
    { name: 'data', type: 'ChartDataPoint[]', default: '[]', description: 'Dataset of items with labels and values.' },
    { name: 'height', type: 'number', default: '350', description: 'Total height of the chart canvas.' },
    { name: 'showGrid', type: 'boolean', default: 'true', description: 'Enable reference gridlines.' },
    { name: 'showLabels', type: 'boolean', default: 'true', description: 'Display axis category labels.' },
    { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Layout orientation of the stems.' },
    { name: 'colors', type: 'string[]', default: 'CHART_COLORS', description: 'Color palette for the lollipop candies.' },
    { name: 'dotRadius', type: 'number', default: '8', description: 'Radius of the tip circle candy marker.' }
  ];

  slopeInputs: ApiRow[] = [
    { name: 'data', type: 'SlopeDataPoint[]', default: '[]', description: 'Comparison values list for two-stage trajectory.' },
    { name: 'startLabel', type: 'string', default: "'Before'", description: 'Header title of the left trajectory axis.' },
    { name: 'endLabel', type: 'string', default: "'After'", description: 'Header title of the right trajectory axis.' },
    { name: 'height', type: 'number', default: '350', description: 'Total height of the chart canvas.' },
    { name: 'showLabels', type: 'boolean', default: 'true', description: 'Display outer category labels.' },
    { name: 'showValues', type: 'boolean', default: 'true', description: 'Display inner value indicators next to dots.' }
  ];

  sankeyInputs: ApiRow[] = [
    { name: 'nodes', type: 'SankeyNode[]', default: '[]', description: 'Topological node blocks definitions list.' },
    { name: 'links', type: 'SankeyLink[]', default: '[]', description: 'Curved paths flows and values from source to target.' },
    { name: 'height', type: 'number', default: '400', description: 'Total height of the chart canvas.' },
    { name: 'showLabels', type: 'boolean', default: 'true', description: 'Display node text labels.' },
    { name: 'showValues', type: 'boolean', default: 'true', description: 'Display flow values text inside labels.' },
    { name: 'nodePadding', type: 'number', default: '16', description: 'Vertical padding spacing between node rectangles.' },
    { name: 'nodeWidth', type: 'number', default: '20', description: 'Width thickness of the node block rectangles.' }
  ];

  violinInputs: ApiRow[] = [
    { name: 'data', type: 'ViolinItem[]', default: '[]', description: 'Raw sample datasets for density estimation.' },
    { name: 'height', type: 'number', default: '350', description: 'Total height of the chart canvas.' },
    { name: 'showGrid', type: 'boolean', default: 'true', description: 'Render background horizontal reference lines.' },
    { name: 'showLabels', type: 'boolean', default: 'true', description: 'Render category names under each column.' },
    { name: 'colors', type: 'string[]', default: 'CHART_COLORS', description: 'Color palette sequence for violins.' }
  ];

  ridgelineInputs: ApiRow[] = [
    { name: 'data', type: 'RidgelineItem[]', default: '[]', description: 'List of distribution data profiles.' },
    { name: 'height', type: 'number', default: '400', description: 'Total height of the chart canvas.' },
    { name: 'showGrid', type: 'boolean', default: 'true', description: 'Render background vertical reference lines.' },
    { name: 'showLabels', type: 'boolean', default: 'true', description: 'Render label text on the left Y axis.' },
    { name: 'colors', type: 'string[]', default: 'CHART_COLORS', description: 'Color palette sequence for ridge shapes.' },
    { name: 'overlap', type: 'number', default: '1.6', description: 'Stack overlap scaling ratio factor.' }
  ];

  paretoInputs: ApiRow[] = [
    { name: 'data', type: 'ParetoItem[]', default: '[]', description: 'Unsorted category counts or frequency data.' },
    { name: 'height', type: 'number', default: '350', description: 'Total height of the chart canvas.' },
    { name: 'showGrid', type: 'boolean', default: 'true', description: 'Render background horizontal reference lines.' },
    { name: 'showLabels', type: 'boolean', default: 'true', description: 'Render category names under bars.' },
    { name: 'barColor', type: 'string', default: "'#4a90d9'", description: 'Fill color of the sorted frequency bars.' },
    { name: 'lineColor', type: 'string', default: "'#ff6358'", description: 'Color of cumulative percentage line.' }
  ];

  marimekkoInputs: ApiRow[] = [
    { name: 'data', type: 'MarimekkoItem[]', default: '[]', description: 'Market segmentation and category share data.' },
    { name: 'height', type: 'number', default: '400', description: 'Total height of the chart canvas.' },
    { name: 'showGrid', type: 'boolean', default: 'true', description: 'Render background horizontal reference lines.' },
    { name: 'showLabels', type: 'boolean', default: 'true', description: 'Render segment label names.' },
    { name: 'colors', type: 'string[]', default: 'CHART_COLORS', description: 'Color palette sequence for grid rects.' }
  ];

  chordInputs: ApiRow[] = [
    { name: 'matrix', type: 'number[][]', default: '[]', description: 'Flow weight square adjacency matrix.' },
    { name: 'labels', type: 'string[]', default: '[]', description: 'Group names for circumference segments.' },
    { name: 'height', type: 'number', default: '400', description: 'Total height of the chart canvas.' },
    { name: 'showLabels', type: 'boolean', default: 'true', description: 'Render label text on circular border.' },
    { name: 'colors', type: 'string[]', default: 'CHART_COLORS', description: 'Color palette sequence for chord nodes.' }
  ];

  dependencyInputs: ApiRow[] = [
    { name: 'matrix', type: 'number[][]', default: '[]', description: 'Directed flow dependency square matrix.' },
    { name: 'labels', type: 'string[]', default: '[]', description: 'Segment names on circumference.' },
    { name: 'height', type: 'number', default: '400', description: 'Total height of the chart canvas.' },
    { name: 'showLabels', type: 'boolean', default: 'true', description: 'Render label text on border.' },
    { name: 'colors', type: 'string[]', default: 'CHART_COLORS', description: 'Color palette sequence for nodes.' }
  ];

  matrixInputs: ApiRow[] = [
    { name: 'matrix', type: 'number[][]', default: '[]', description: 'Adjacency matrix connection weight grid.' },
    { name: 'labels', type: 'string[]', default: '[]', description: 'Node label list for row/col axes.' },
    { name: 'height', type: 'number', default: '400', description: 'Total height of the chart canvas.' },
    { name: 'showLabels', type: 'boolean', default: 'true', description: 'Display labels on axes.' },
    { name: 'color', type: 'string', default: 'CHART_COLORS[0]', description: 'Base cell shading color.' }
  ];

  biplotInputs: ApiRow[] = [
    { name: 'points', type: 'BiplotPoint[]', default: '[]', description: 'PCA observation coordinates and groups.' },
    { name: 'vectors', type: 'BiplotVector[]', default: '[]', description: 'Feature load vectors pointing from center.' },
    { name: 'height', type: 'number', default: '400', description: 'Total height of the chart canvas.' },
    { name: 'showLabels', type: 'boolean', default: 'true', description: 'Display observation point labels.' },
    { name: 'colors', type: 'string[]', default: 'CHART_COLORS', description: 'Color palette for groups.' }
  ];

  renkoInputs: ApiRow[] = [
    { name: 'data', type: 'number[]', default: '[]', description: 'Close prices historical array series.' },
    { name: 'boxSize', type: 'number', default: '5', description: 'Required price movement to draw a brick.' },
    { name: 'height', type: 'number', default: '350', description: 'Total height of the chart canvas.' },
    { name: 'showGrid', type: 'boolean', default: 'true', description: 'Display horizontal reference grids.' },
    { name: 'bullishColor', type: 'string', default: '"#10b981"', description: 'Color for rising price bricks.' },
    { name: 'bearishColor', type: 'string', default: '"#ef4444"', description: 'Color for falling price bricks.' }
  ];

  kagiInputs: ApiRow[] = [
    { name: 'data', type: 'number[]', default: '[]', description: 'Close prices historical array series.' },
    { name: 'reversalAmount', type: 'number', default: '15', description: 'Price movement required to switch trend.' },
    { name: 'height', type: 'number', default: '350', description: 'Total height of the chart canvas.' },
    { name: 'showGrid', type: 'boolean', default: 'true', description: 'Display horizontal reference grids.' },
    { name: 'bullishColor', type: 'string', default: '"#10b981"', description: 'Color for Yang (bullish) lines.' },
    { name: 'bearishColor', type: 'string', default: '"#ef4444"', description: 'Color for Yin (bearish) lines.' }
  ];

  pfInputs: ApiRow[] = [
    { name: 'data', type: 'number[]', default: '[]', description: 'Price series history array.' },
    { name: 'boxSize', type: 'number', default: '4', description: 'The price span per grid box unit.' },
    { name: 'reversal', type: 'number', default: '3', description: 'Number of boxes needed to trigger a reversal column.' },
    { name: 'height', type: 'number', default: '350', description: 'Total height of the chart canvas.' },
    { name: 'showGrid', type: 'boolean', default: 'true', description: 'Render background horizontal price ranges.' },
    { name: 'xColor', type: 'string', default: '"#10b981"', description: 'Color of rise indicator X shapes.' },
    { name: 'oColor', type: 'string', default: '"#ef4444"', description: 'Color of fall indicator O shapes.' }
  ];

  windRoseInputs: ApiRow[] = [
    { name: 'data', type: 'WindRoseItem[]', default: '[]', description: 'Speed frequency distributions grouped by direction.' },
    { name: 'height', type: 'number', default: '400', description: 'Total height of the chart canvas.' },
    { name: 'colors', type: 'string[]', default: 'CHART_COLORS', description: 'Color sequence for speed range bins.' }
  ];
}
