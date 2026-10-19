import { GridStateService, type GridPersistedState } from './grid-state.service';

describe('GridStateService saved views', () => {
  const state: GridPersistedState = {
    columnWidths: { name: 240 },
    columnOrder: ['name'],
    sorts: [{ field: 'name', dir: 'asc' }],
    filters: [],
    groups: [],
    page: 1,
    pageSize: 25,
    hiddenColumns: [],
    pinnedColumns: { name: 'left' },
  };

  it('round-trips a named view with a schema version', () => {
    const service = new GridStateService();
    const serialized = service.exportSavedView('  My view  ', state);

    expect(service.importSavedView(serialized)).toEqual({
      version: 1,
      name: 'My view',
      state,
    });
  });

  it('rejects unsupported versions and malformed state', () => {
    const service = new GridStateService();

    expect(() => service.importSavedView('{"version":2,"name":"old","state":{}}')).toThrowError(
      'Saved grid view is invalid or uses an unsupported version.'
    );
    expect(() => service.importSavedView('{broken')).toThrow();
    expect(() => service.exportSavedView(' ', state)).toThrowError('A saved grid view must have a non-empty name.');
  });
});
