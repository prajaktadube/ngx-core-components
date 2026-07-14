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
    groupBy: 'Group by this column'
  },
  datePicker: {
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    shortWeekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    today: 'Today',
    clear: 'Clear',
    cancel: 'Cancel',
    ok: 'OK'
  },
  dialog: {
    close: 'Close',
    confirm: 'Confirm',
    cancel: 'Cancel',
    ok: 'OK'
  },
  fileUpload: {
    browse: 'Browse files',
    dragDrop: 'Drag and drop files here',
    removeFile: 'Remove file',
    maxSizeError: 'File size exceeds limit',
    invalidTypeError: 'Invalid file type'
  },
  autocomplete: {
    noResults: 'No results found',
    loading: 'Loading...',
    clearSelection: 'Clear selection'
  },
  dropdown: {
    noResults: 'No results found',
    selectPlaceholder: 'Select...',
    clearSelection: 'Clear selection',
    searchPlaceholder: 'Search...'
  },
  multiSelect: {
    selectAll: 'Select All',
    deselectAll: 'Deselect All',
    selectedCount: (count) => `${count} selected`,
    searchPlaceholder: 'Search...'
  },
  pagination: {
    of: 'of',
    page: 'Page',
    nextPage: 'Next Page',
    previousPage: 'Previous Page',
    firstPage: 'First Page',
    lastPage: 'Last Page',
    itemsPerPage: 'Items per page'
  },
  scheduler: {
    today: 'Today',
    day: 'Day',
    week: 'Week',
    month: 'Month',
    agenda: 'Agenda',
    allDay: 'All Day',
    noEvents: 'No events scheduled'
  },
  gantt: {
    addTask: 'Add Task',
    deleteTask: 'Delete Task',
    editTask: 'Edit Task',
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
    today: 'Today',
    criticalPath: 'Critical Path',
    baseline: 'Baseline'
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
    required: 'This field is required'
  }
};

/**
 * Injection token for library translations
 */
export const NGX_CORE_I18N = new InjectionToken<NgxCoreI18n>('ngx-core-i18n', {
  providedIn: 'root',
  factory: () => DEFAULT_EN_I18N
});

/**
 * Provider helper function to configure custom translations
 */
export function provideNgxI18n(overrides: Partial<NgxCoreI18n>): Provider {
  const merged = deepMerge(DEFAULT_EN_I18N, overrides);
  return {
    provide: NGX_CORE_I18N,
    useValue: merged
  };
}

/**
 * Helper utility to perform deep merging of configurations
 */
function deepMerge(target: any, source: any): any {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}
