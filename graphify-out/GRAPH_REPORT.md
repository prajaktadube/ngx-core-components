# Graph Report - projects/ngx-core-components/charts/shared  (2026-11-04)

## Corpus Check
- Corpus is ~4,840 words - fits in a single context window. You may not need a graph.

## Summary
- 95 nodes · 106 edges · 12 communities (5 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Chart Export Menu|Chart Export Menu]]
- [[_COMMUNITY_Brush and Zoom|Brush and Zoom]]
- [[_COMMUNITY_Themes and Chart Utilities|Themes and Chart Utilities]]
- [[_COMMUNITY_Chart Export Service|Chart Export Service]]
- [[_COMMUNITY_Chart Tooltip Service|Chart Tooltip Service]]
- [[_COMMUNITY_Brush Zoom Calculations|Brush Zoom Calculations]]
- [[_COMMUNITY_Chart Synchronization|Chart Synchronization]]
- [[_COMMUNITY_Map Data Utilities|Map Data Utilities]]
- [[_COMMUNITY_Theme Application|Theme Application]]
- [[_COMMUNITY_Chart Annotations|Chart Annotations]]
- [[_COMMUNITY_Accessible Chart Marks|Accessible Chart Marks]]
- [[_COMMUNITY_Chart Loading Skeleton|Chart Loading Skeleton]]

## God Nodes (most connected - your core abstractions)
1. `ChartBrushZoomComponent` - 15 edges
2. `ChartExportMenuComponent` - 10 edges
3. `ChartExportService` - 8 edges
4. `ChartSyncGroupDirective` - 6 edges
5. `ChartTooltipService` - 5 edges
6. `ChartThemeService` - 4 edges
7. `ChartAccessibleMarkDirective` - 2 edges
8. `CHART_COLORS` - 2 edges
9. `niceTicks()` - 2 edges
10. `niceStep()` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities (12 total, 7 thin omitted)

### Community 0 - "Chart Export Menu"
Cohesion: 0.14
Nodes (7): ChartExportMenuComponent, ExportFormat, arrowDown, arrowUp, fixture, menu, trigger

### Community 2 - "Themes and Chart Utilities"
Cohesion: 0.16
Nodes (8): ChartTheme, ChartThemeName, ColorblindMode, CHART_COLORS, ChartDataPoint, ChartSeries, niceStep(), niceTicks()

### Community 4 - "Chart Tooltip Service"
Cohesion: 0.25
Nodes (3): ChartTooltipService, TooltipRow, TooltipState

### Community 5 - "Brush Zoom Calculations"
Cohesion: 0.29
Nodes (6): d, h, len, maxVal, minVal, w

### Community 7 - "Map Data Utilities"
Cohesion: 0.50
Nodes (4): getSvgPath(), MapRegion, project(), WORLD_MAP_DATA

## Knowledge Gaps
- **24 isolated node(s):** `AnnotationType`, `ChartAnnotation`, `d`, `w`, `h` (+19 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ChartBrushZoomComponent` connect `Brush and Zoom` to `Brush Zoom Calculations`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `ChartThemeService` connect `Theme Application` to `Themes and Chart Utilities`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **What connects `AnnotationType`, `ChartAnnotation`, `d` to the rest of the system?**
  _24 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Chart Export Menu` be split into smaller, more focused modules?**
  _Cohesion score 0.13970588235294118 - nodes in this community are weakly interconnected._