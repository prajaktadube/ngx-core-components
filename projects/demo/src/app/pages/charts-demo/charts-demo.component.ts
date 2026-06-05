import { Component, signal, computed, ElementRef, viewChild, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  BarChartComponent, LineChartComponent, PieChartComponent, SparklineComponent,
  GaugeChartComponent, RadarChartComponent, HeatmapChartComponent, TreemapChartComponent,
  AreaChartComponent, FunnelChartComponent, ComboChartComponent, ScatterPlotComponent,
  WaterfallChartComponent, BoxPlotChartComponent, RadialBarChartComponent, CandlestickChartComponent,
  ChartSeries, ChartDataPoint, CHART_COLORS, GaugeThreshold, RadarSeries, TreemapItem, ScatterPoint,
  WaterfallItem, BoxPlotItem, RadialBarItem, CandlestickItem, FunnelItem
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
    WaterfallChartComponent, BoxPlotChartComponent, RadialBarChartComponent, CandlestickChartComponent
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
            </div>
          </div>

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
              <button class="stackblitz-btn" (click)="editInStackBlitz()">
                ⚡ Edit in StackBlitz
              </button>
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
    
    .stackblitz-btn {
      width: 100%;
      background: #1389fd;
      color: #ffffff;
      border: none;
      padding: 10px;
      font-weight: 700;
      font-size: 12px;
      border-radius: 8px;
      cursor: pointer;
      font-family: inherit;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: background 0.2s, transform 0.1s;
    }
    .stackblitz-btn:hover {
      background: #006ee6;
    }
    .stackblitz-btn:active {
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

  // Available Tabs
  tabs = [
    'Bar Chart', 'Line Chart', 'Area Chart', 'Pie / Donut', 
    'Combo Chart', 'Scatter Plot', 'Sparkline', 'Gauge Chart', 
    'Radar Chart', 'Heatmap Chart', 'Treemap Chart', 'Funnel / Pyramid Chart',
    'Waterfall Chart', 'Box Plot Chart', 'Radial Bar Chart', 'Candlestick Chart'
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
      return ['Bar Chart', 'Line Chart', 'Area Chart', 'Pie / Donut', 'Combo Chart', 'Scatter Plot', 'Radial Bar Chart'].includes(tab);
    }
    if (type === 'grid') {
      return ['Bar Chart', 'Line Chart', 'Area Chart', 'Combo Chart', 'Scatter Plot', 'Waterfall Chart', 'Box Plot Chart', 'Candlestick Chart'].includes(tab);
    }
    if (type === 'labels') {
      return ['Bar Chart', 'Pie / Donut', 'Waterfall Chart', 'Box Plot Chart', 'Candlestick Chart'].includes(tab);
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
  [showExport]="true"
/>`;
      case 'Line Chart':
        return `<ngx-line-chart
  [series]="series"
  [categories]="categories"
  [showArea]="${this.showArea()}"
  [showMarkers]="${this.showMarkers()}"
  [showLegend]="${l}"
  [height]="${h}"
  [showExport]="true"
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
      case 'Waterfall Chart': return this.waterfallInputs;
      case 'Box Plot Chart': return this.boxPlotInputs;
      case 'Radial Bar Chart': return this.radialInputs;
      case 'Candlestick Chart': return this.candlestickInputs;
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
      case 'Waterfall Chart': return Sources.WaterfallChartSource;
      case 'Box Plot Chart': return Sources.BoxPlotChartSource;
      case 'Radial Bar Chart': return Sources.RadialBarChartSource;
      case 'Candlestick Chart': return Sources.CandlestickChartSource;
      default: return '';
    }
  }

  getComponentClass(tab: string): string {
    return tab.replace(/[^a-zA-Z]/g, '') + (tab.includes('Plot') ? '' : 'Component');
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
      case 'Waterfall Chart': return `<ngx-waterfall-chart [data]="data" [showGrid]="${g}" [showLabels]="${valLabels}" [height]="${h}" positiveColor="${this.waterfallPositiveColor()}" negativeColor="${this.waterfallNegativeColor()}" totalColor="${this.waterfallTotalColor()}"></ngx-waterfall-chart>`;
      case 'Box Plot Chart': return `<ngx-box-plot-chart [data]="data" [showGrid]="${g}" [showLabels]="${valLabels}" [height]="${h}" color="${this.boxPlotColor()}" fillColor="${this.boxPlotFillColor()}" outlierColor="${this.boxPlotOutlierColor()}"></ngx-box-plot-chart>`;
      case 'Radial Bar Chart': return `<ngx-radial-bar-chart [data]="data" [showLegend]="${l}" [height]="${h}" [strokeWidth]="${this.radialStrokeWidth()}" [ringGap]="${this.radialRingGap()}"></ngx-radial-bar-chart>`;
      case 'Candlestick Chart': return `<ngx-candlestick-chart [data]="data" [showGrid]="${g}" [showLabels]="${valLabels}" [height]="${h}" bullishColor="${this.candlestickBullishColor()}" bearishColor="${this.candlestickBearishColor()}"></ngx-candlestick-chart>`;
      default: return '';
    }
  }

  getExtraStateVariables(tab: string): string {
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
    return '';
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
      case 'Waterfall Chart': return JSON.stringify(this.waterfallData, null, 2);
      case 'Box Plot Chart': return JSON.stringify(this.boxPlotData, null, 2);
      case 'Radial Bar Chart': return JSON.stringify(this.radialData, null, 2);
      case 'Candlestick Chart': return JSON.stringify(this.candlestickData, null, 2);
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
      <h2 style="color: #0f172a; margin-bottom: 4px; font-weight: 800;">\${chartType} Sandbox</h2>
      <p style="color: #64748b; font-size: 14px; margin-top: 0; margin-bottom: 24px;">
        Bootstrap 5 inspired, zero-dependency SVG component compiled standalone.
      </p>
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        ${this.getPlaygroundTemplate(chartType)}
      </div>
    </div>
  \`
})
export class App {
  chartType = '${chartType}';
  data = ${this.getMockDataString(chartType)};
  ${this.getExtraStateVariables(chartType)}
}

bootstrapApplication(App).catch(err => console.error(err));`,
      'package.json': JSON.stringify({
        name: `ngx-chart-${chartType.toLowerCase().replace(/[^a-z0-9]/g, '-')}-demo`,
        version: '1.0.0',
        private: true,
        dependencies: {
          '@angular/common': '^19.0.0',
          '@angular/compiler': '^19.0.0',
          '@angular/core': '^19.0.0',
          '@angular/forms': '^19.0.0',
          '@angular/platform-browser': '^19.0.0',
          '@angular/platform-browser-dynamic': '^19.0.0',
          '@angular/router': '^19.0.0',
          'ngx-core-components': '^0.3.13',
          'rxjs': '~7.8.0',
          'zone.js': '~0.14.0',
          'tslib': '^2.3.0'
        },
        devDependencies: {
          'typescript': '~5.4.0'
        }
      }, null, 2)
    };

    // Build and submit form POSTing to StackBlitz programmatic compiler
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://stackblitz.com/run';
    form.target = '_blank';

    const metadata = {
      title: `${chartType} Standalone Sandbox`,
      description: `Programmatic showcase of ${chartType} from ngx-core-components library.`,
      tags: 'angular,svg,charting,enterprise',
      template: 'angular-cli'
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
}
