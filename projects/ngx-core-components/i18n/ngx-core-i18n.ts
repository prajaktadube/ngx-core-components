import { InjectionToken, Provider } from '@angular/core';

/**
 * Interface representing all user-facing labels in ngx-core-components
 */
export interface NgxCoreI18n {
  grid: {
    noData: string;
    filterPlaceholder: string;
    pageOf: (page: number, total: number) => string;
    sortAscending: string;
    sortDescending: string;
    selectAll: string;
    deselectAll: string;
    exportCsv: string;
    groupBy: string;
    dataGrid: string;
    toolbar: string;
    selectRow: (row: string) => string;
    selectedRows: (count: number) => string;
    chooseColumns: string;
    visibleColumns: string;
    pinColumn: string;
    pinLeft: string;
    pinRight: string;
    noPin: string;
    moveColumnLeft: (column: string) => string;
    moveColumnRight: (column: string) => string;
    closeColumnChooser: string;
    apply: string;
    groupedBy: string;
    groupColumnsHint: string;
    clearSearch: string;
    clearFilters: string;
    advancedFilterBuilder: string;
    closeFilterBuilder: string;
    clearAll: string;
    applyFilter: string;
    filterField: string;
    filterOperator: string;
    filterGroupAnd: string;
    filterGroupOr: string;
    addCondition: string;
    addGroup: string;
    removeFilterGroup: string;
    removeFilterCondition: string;
    noFilterConditions: string;
    filterValuePlaceholder: string;
    filterRangeEndPlaceholder: string;
    filterRangeAnd: string;
    operatorIsEmpty: string;
    operatorIsNotEmpty: string;
    operatorNotEquals: string;
    operatorGreaterThan: string;
    operatorGreaterOrEqual: string;
    operatorLessThan: string;
    operatorLessOrEqual: string;
    operatorBetween: string;
    operatorBefore: string;
    operatorAfter: string;
    operatorIsTrue: string;
    operatorIsFalse: string;
    exportJson: string;
    exportXlsx: string;
    exportExcel: string;
    exportPdf: string;
    filterColumn: string;
    dragRowToReorder: string;
    toggleDetails: string;
    textFilter: string;
    contains: string;
    equals: string;
    startsWith: string;
    endsWith: string;
    checklistFilter: string;
    contextMenu: string;
  };
  datePicker: {
    months: string[];
    shortMonths: string[];
    weekdays: string[];
    shortWeekdays: string[];
    today: string;
    clear: string;
    cancel: string;
    ok: string;
  };
  dialog: {
    close: string;
    confirm: string;
    cancel: string;
    ok: string;
  };
  fileUpload: {
    browse: string;
    dragDrop: string;
    removeFile: string;
    maxSizeError: string;
    invalidTypeError: string;
  };
  autocomplete: {
    noResults: string;
    loading: string;
    clearSelection: string;
  };
  dropdown: {
    noResults: string;
    selectPlaceholder: string;
    clearSelection: string;
    searchPlaceholder: string;
  };
  multiSelect: {
    selectAll: string;
    deselectAll: string;
    selectedCount: (count: number) => string;
    searchPlaceholder: string;
  };
  pagination: {
    of: string;
    page: string;
    nextPage: string;
    previousPage: string;
    firstPage: string;
    lastPage: string;
    itemsPerPage: string;
  };
  scheduler: {
    today: string;
    day: string;
    week: string;
    month: string;
    agenda: string;
    allDay: string;
    noEvents: string;
  };
  gantt: {
    addTask: string;
    deleteTask: string;
    editTask: string;
    zoomIn: string;
    zoomOut: string;
    today: string;
    criticalPath: string;
    baseline: string;
  };
  common: {
    loading: string;
    error: string;
    retry: string;
    save: string;
    delete: string;
    edit: string;
    cancel: string;
    ok: string;
    close: string;
    search: string;
    noData: string;
    required: string;
  };
  chart: {
    barChart: string;
    viewDataTable: string;
    category: string;
    dataTableAvailable: string;
    export: string;
    exportFormat: (format: string) => string;
    exportMenu: string;
    lineChartDescription: (seriesNames: string, categoryCount: number) => string;
    lineChartNoData: string;
    linePointDescription: (category: string, series: string, value: string) => string;
    pieSliceDescription: (label: string, value: string, percentage: number) => string;
    scatterChartDescription: (xTitle: string, yTitle: string, pointCount: number) => string;
    scatterPointDescription: (
      label: string | undefined,
      group: string | undefined,
      xTitle: string,
      xValue: string,
      yTitle: string,
      yValue: string
    ) => string;
    waterfallMarkDescription: (label: string, value: string, balance: string) => string;
    dataMarkDescription: (label: string, value: string) => string;
    ohlcMarkDescription?: (date: string, open: string, high: string, low: string, close: string) => string;
    hlcMarkDescription?: (date: string, high: string, low: string, close: string) => string;
    renkoMarkDescription?: (index: number, type: 'bullish' | 'bearish', open: string, close: string) => string;
    pointFigureMarkDescription?: (type: 'X' | 'O', value: string, column: number) => string;
    kagiMarkDescription?: (
      index: number,
      type: 'vertical' | 'horizontal',
      trend: 'bullish' | 'bearish',
      start: string,
      end: string
    ) => string;
    areaRangeMarkDescription?: (
      series: string,
      category: string,
      boundary: 'high' | 'low',
      value: string,
      low: string,
      high: string
    ) => string;
    histogramBinDescription?: (low: string, high: string, count: string, percentage: string) => string;
    calendarHeatmapCellDescription?: (date: string, value: string) => string;
    adjacencyMatrixCellDescription?: (source: string, target: string, value: string) => string;
    orgChartNodeDescription?: (name: string, title: string, department: string, hasChildren: boolean) => string;
    orgChartToggleDescription?: (name: string, expanded: boolean) => string;
    mapBubbleDescription?: (label: string, value: string, latitude: string, longitude: string, group: string) => string;
    mapPointDescription?: (label: string, latitude: string, longitude: string) => string;
    mapLineDescription?: (label: string, source: string, target: string) => string;
    choroplethRegionDescription?: (region: string, value: string, label: string) => string;
    geoHeatmapCellDescription?: (latitude: string, longitude: string, weight: string) => string;
    networkNodeDescription?: (label: string, value: string, group: string, connections: string) => string;
    networkLinkDescription?: (source: string, target: string, weight: string) => string;
    parallelCoordinatesLineDescription?: (record: string, values: string) => string;
    multiNeedleDescription?: (label: string, value: string, units: string, type: string) => string;
    topologyNodeDescription?: (label: string, type: string, status: string) => string;
    topologyLinkDescription?: (source: string, target: string, active: boolean, label: string) => string;
    pictorialIconDescription?: (index: number, threshold: string, fillPercentage: string) => string;
    packedBubbleMarkDescription?: (label: string, group: string, value: string) => string;
    wordCloudMarkDescription?: (word: string, value: string) => string;
    windRoseBinDescription?: (direction: string, bin: string, frequency: string, cumulative: string) => string;
    sankeyNodeDescription?: (label: string, value: string, incoming: string, outgoing: string) => string;
    sankeyLinkDescription?: (source: string, target: string, value: string) => string;
    timelineEventDescription?: (title: string, category: string, status: string, start: string, end: string) => string;
    heikinAshiMarkDescription?: (date: string, open: string, high: string, low: string, close: string) => string;
    variwidePointDescription?: (label: string, height: string, width: string, widthShare: string) => string;
    bubblePointDescription: (
      label: string | undefined,
      group: string | undefined,
      xTitle: string,
      xValue: string,
      yTitle: string,
      yValue: string,
      zTitle: string,
      zValue: string
    ) => string;
  };
  formBuilder: {
    steps: string;
    stepProgress: (current: number, total: number) => string;
    previousStep: string;
    nextStep: string;
    validating: string;
    validationFailed: string;
    required: string;
    missingConditionField: (field: string, dependency: string) => string;
    duplicateFieldKey: (field: string) => string;
    conditionCycle: (fields: string) => string;
  };
  layout?: {
    closeTab: string;
  };
}

/**
 * Default English translations
 */
export const DEFAULT_EN_I18N: NgxCoreI18n = {
  grid: {
    noData: 'No rows to display',
    filterPlaceholder: 'Filter...',
    pageOf: (page, total) => `Page ${page} of ${total}`,
    sortAscending: 'Sort Ascending',
    sortDescending: 'Sort Descending',
    selectAll: 'Select All',
    deselectAll: 'Deselect All',
    exportCsv: 'Export to CSV',
    groupBy: 'Group by this column',
    dataGrid: 'Data grid',
    toolbar: 'Data grid actions',
    selectRow: row => `Select row ${row}`,
    selectedRows: count => `${count} ${count === 1 ? 'row' : 'rows'} selected`,
    chooseColumns: 'Choose columns',
    visibleColumns: 'Visible columns',
    pinColumn: 'Pin column',
    pinLeft: 'Pin left',
    pinRight: 'Pin right',
    noPin: 'No pin',
    moveColumnLeft: column => `Move ${column} column left`,
    moveColumnRight: column => `Move ${column} column right`,
    closeColumnChooser: 'Close column chooser',
    apply: 'Apply',
    groupedBy: 'Grouped by:',
    groupColumnsHint: 'Drag a column header here to group',
    clearSearch: 'Clear search',
    clearFilters: 'Clear all active column filters',
    advancedFilterBuilder: 'Advanced Filter Builder',
    closeFilterBuilder: 'Close filter builder',
    clearAll: 'Clear All',
    applyFilter: 'Apply Filter',
    filterField: 'Filter field',
    filterOperator: 'Filter operator',
    filterGroupAnd: 'AND',
    filterGroupOr: 'OR',
    addCondition: 'Add condition',
    addGroup: 'Add group',
    removeFilterGroup: 'Remove filter group',
    removeFilterCondition: 'Remove filter condition',
    noFilterConditions: 'No conditions. Add a condition to begin.',
    filterValuePlaceholder: 'Value...',
    filterRangeEndPlaceholder: 'To...',
    filterRangeAnd: 'and',
    operatorIsEmpty: 'Is Empty',
    operatorIsNotEmpty: 'Is Not Empty',
    operatorNotEquals: 'Not Equals',
    operatorGreaterThan: 'Greater Than',
    operatorGreaterOrEqual: 'Greater or Equal',
    operatorLessThan: 'Less Than',
    operatorLessOrEqual: 'Less or Equal',
    operatorBetween: 'Between',
    operatorBefore: 'Before',
    operatorAfter: 'After',
    operatorIsTrue: 'Is True',
    operatorIsFalse: 'Is False',
    exportJson: 'Export JSON',
    exportXlsx: 'Export native XLSX workbook',
    exportExcel: 'Export HTML Excel',
    exportPdf: 'Export PDF',
    filterColumn: 'Filter column',
    dragRowToReorder: 'Drag row to reorder',
    toggleDetails: 'Toggle detail',
    textFilter: 'Text Filter',
    contains: 'Contains',
    equals: 'Equals',
    startsWith: 'Starts With',
    endsWith: 'Ends With',
    checklistFilter: 'Checklist Filter',
    contextMenu: 'Data grid context menu',
  },
  datePicker: {
    months: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
    shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    shortWeekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    today: 'Today',
    clear: 'Clear',
    cancel: 'Cancel',
    ok: 'OK',
  },
  dialog: {
    close: 'Close',
    confirm: 'Confirm',
    cancel: 'Cancel',
    ok: 'OK',
  },
  fileUpload: {
    browse: 'Browse files',
    dragDrop: 'Drag and drop files here',
    removeFile: 'Remove file',
    maxSizeError: 'File size exceeds limit',
    invalidTypeError: 'Invalid file type',
  },
  autocomplete: {
    noResults: 'No results found',
    loading: 'Loading...',
    clearSelection: 'Clear selection',
  },
  dropdown: {
    noResults: 'No results found',
    selectPlaceholder: 'Select...',
    clearSelection: 'Clear selection',
    searchPlaceholder: 'Search...',
  },
  multiSelect: {
    selectAll: 'Select All',
    deselectAll: 'Deselect All',
    selectedCount: count => `${count} selected`,
    searchPlaceholder: 'Search...',
  },
  pagination: {
    of: 'of',
    page: 'Page',
    nextPage: 'Next Page',
    previousPage: 'Previous Page',
    firstPage: 'First Page',
    lastPage: 'Last Page',
    itemsPerPage: 'Items per page',
  },
  scheduler: {
    today: 'Today',
    day: 'Day',
    week: 'Week',
    month: 'Month',
    agenda: 'Agenda',
    allDay: 'All Day',
    noEvents: 'No events scheduled',
  },
  gantt: {
    addTask: 'Add Task',
    deleteTask: 'Delete Task',
    editTask: 'Edit Task',
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
    today: 'Today',
    criticalPath: 'Critical Path',
    baseline: 'Baseline',
  },
  common: {
    loading: 'Loading...',
    error: 'An error occurred',
    retry: 'Retry',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    cancel: 'Cancel',
    ok: 'OK',
    close: 'Close',
    search: 'Search...',
    noData: 'No data',
    required: 'This field is required',
  },
  chart: {
    barChart: 'Bar chart',
    viewDataTable: 'View chart data',
    category: 'Category',
    dataTableAvailable: 'A data table is available below.',
    export: 'Export',
    exportFormat: format => `Export ${format.toUpperCase()}`,
    exportMenu: 'Export chart data',
    lineChartDescription: (seriesNames, categoryCount) =>
      `Line chart showing ${seriesNames} across ${categoryCount} categories.`,
    lineChartNoData: 'Line chart with no data.',
    linePointDescription: (category, series, value) => `${series} at ${category}: ${value}`,
    pieSliceDescription: (label, value, percentage) => `${label}: ${value} (${percentage}%)`,
    scatterChartDescription: (xTitle, yTitle, pointCount) =>
      `Scatter plot with ${pointCount} data points. ${xTitle} on the horizontal axis and ${yTitle} on the vertical axis.`,
    scatterPointDescription: (label, group, xTitle, xValue, yTitle, yValue) =>
      `${label ? `${label}. ` : ''}${group ? `Group ${group}. ` : ''}${xTitle}: ${xValue}, ${yTitle}: ${yValue}`,
    waterfallMarkDescription: (label, value, balance) => `${label}: change ${value}, running balance ${balance}`,
    dataMarkDescription: (label, value) => `${label}: ${value}`,
    ohlcMarkDescription: (date, open, high, low, close) =>
      `${date}: Open ${open}, high ${high}, low ${low}, close ${close}`,
    hlcMarkDescription: (date, high, low, close) => `${date}: High ${high}, low ${low}, close ${close}`,
    renkoMarkDescription: (index, type, open, close) => `Renko brick ${index}: ${type} from ${open} to ${close}`,
    pointFigureMarkDescription: (type, value, column) => `Point & Figure ${type} in column ${column}: ${value}`,
    kagiMarkDescription: (index, type, trend, start, end) =>
      `Kagi ${type} segment ${index}: ${trend}, ${start} to ${end}`,
    areaRangeMarkDescription: (series, category, boundary, value, low, high) =>
      `${series} at ${category}: ${boundary} boundary ${value}, range ${low} to ${high}`,
    histogramBinDescription: (low, high, count, percentage) =>
      `${low} to ${high}: ${count} observations, ${percentage}% of data`,
    calendarHeatmapCellDescription: (date, value) => `${date}: ${value} contributions`,
    adjacencyMatrixCellDescription: (source, target, value) => `${source} to ${target}: connection weight ${value}`,
    orgChartNodeDescription: (name, title, department, hasChildren) =>
      [name, title, department, hasChildren ? 'has reports' : 'no reports'].filter(Boolean).join('; '),
    orgChartToggleDescription: (name, expanded) => `${expanded ? 'Collapse' : 'Expand'} ${name}`,
    mapBubbleDescription: (label, value, latitude, longitude, group) =>
      `${label}; value ${value}; latitude ${latitude}, longitude ${longitude}${group ? `; group ${group}` : ''}`,
    mapPointDescription: (label, latitude, longitude) => `${label}; latitude ${latitude}, longitude ${longitude}`,
    mapLineDescription: (label, source, target) => `${label}: from ${source} to ${target}`,
    choroplethRegionDescription: (region, value, label) => `${region}: ${value}${label ? `; ${label}` : ''}`,
    geoHeatmapCellDescription: (latitude, longitude, weight) =>
      `Density zone at latitude ${latitude}, longitude ${longitude}: weight ${weight}`,
    networkNodeDescription: (label, value, group, connections) =>
      `${label}; value ${value}${group ? `; group ${group}` : ''}; ${connections} connections`,
    networkLinkDescription: (source, target, weight) => `Connection from ${source} to ${target}; weight ${weight}`,
    parallelCoordinatesLineDescription: (record, values) => `Record ${record}${values ? `; ${values}` : ''}`,
    multiNeedleDescription: (label, value, units, type) => `${label}: ${value}${units}; ${type}`,
    topologyNodeDescription: (label, type, status) => `${label}; ${type}; ${status}`,
    topologyLinkDescription: (source, target, active, label) =>
      `${source} to ${target}${label ? `; ${label}` : ''}; ${active ? 'active' : 'inactive'}`,
    pictorialIconDescription: (index, threshold, fillPercentage) =>
      `Icon ${index}: value threshold ${threshold}, fill ${fillPercentage}%`,
    packedBubbleMarkDescription: (label, group, value) => `${label}; ${group}; value ${value}`,
    wordCloudMarkDescription: (word, value) => `${word}: ${value}`,
    windRoseBinDescription: (direction, bin, frequency, cumulative) =>
      `Direction ${direction}, wind speed ${bin}: ${frequency}, cumulative ${cumulative}`,
    sankeyNodeDescription: (label, value, incoming, outgoing) =>
      `${label}: total flow ${value}, incoming ${incoming}, outgoing ${outgoing}`,
    sankeyLinkDescription: (source, target, value) => `Flow from ${source} to ${target}: ${value}`,
    timelineEventDescription: (title, category, status, start, end) =>
      `${title}; ${category}; ${status}; starts ${start}${end ? `; ends ${end}` : ''}`,
    heikinAshiMarkDescription: (date, open, high, low, close) =>
      `${date}: Heikin-Ashi open ${open}, high ${high}, low ${low}, close ${close}`,
    variwidePointDescription: (label, height, width, widthShare) =>
      `${label}: height ${height}, width ${width} (${widthShare} of total width)`,
    bubblePointDescription: (label, group, xTitle, xValue, yTitle, yValue, zTitle, zValue) =>
      `${label ? `${label}. ` : ''}${group ? `Group ${group}. ` : ''}${xTitle}: ${xValue}, ${yTitle}: ${yValue}, ${zTitle}: ${zValue}`,
  },
  formBuilder: {
    steps: 'Form steps',
    stepProgress: (current, total) => `Step ${current} of ${total}`,
    previousStep: 'Previous',
    nextStep: 'Next',
    validating: 'Validating...',
    validationFailed: 'Validation failed.',
    required: 'This field is required.',
    missingConditionField: (field, dependency) => `Field "${field}" refers to missing condition field "${dependency}".`,
    duplicateFieldKey: field => `Duplicate form field key "${field}".`,
    conditionCycle: fields => `Form condition dependency cycle detected: ${fields}.`,
  },
  layout: {
    closeTab: 'Close tab',
  },
};

/**
 * Injection token for library translations
 */
export const NGX_CORE_I18N = new InjectionToken<NgxCoreI18n>('ngx-core-i18n', {
  providedIn: 'root',
  factory: () => DEFAULT_EN_I18N,
});

/**
 * Provider helper function to configure custom translations
 */
export type DeepPartial<T> = T extends readonly unknown[]
  ? T
  : T extends (...args: infer Args) => infer Result
    ? (...args: Args) => Result
    : T extends object
      ? { [Key in keyof T]?: DeepPartial<T[Key]> }
      : T;

export function provideNgxI18n(overrides: DeepPartial<NgxCoreI18n>): Provider {
  const merged = deepMerge(DEFAULT_EN_I18N, overrides);
  return {
    provide: NGX_CORE_I18N,
    useValue: merged,
  };
}

/**
 * Helper utility to perform deep merging of configurations
 */
function deepMerge<T>(target: T, source: DeepPartial<T>): T {
  if (!isObject(target) || !isObject(source)) return source as T;

  const output: Record<string, unknown> = { ...target };
  for (const key of Object.keys(source)) {
    const sourceValue = source[key];
    if (sourceValue === undefined) continue;

    const targetValue = target[key];
    output[key] = isObject(targetValue) && isObject(sourceValue) ? deepMerge(targetValue, sourceValue) : sourceValue;
  }
  return output as T;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
