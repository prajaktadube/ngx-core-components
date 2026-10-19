import { GridRemoteDataController, type GridDataSource } from './grid-data-source';

interface Row {
  id: number;
}

describe('GridRemoteDataController', () => {
  const request = {
    page: 1,
    pageSize: 10,
    sort: null,
    filters: [],
    group: null,
  };

  it('stores successful remote results', async () => {
    const controller = new GridRemoteDataController<Row>();
    const source: GridDataSource<Row> = {
      load: async () => ({ items: [{ id: 1 }], total: 1 }),
    };

    await controller.load(source, request);

    expect(controller.state()).toEqual({
      items: [{ id: 1 }],
      total: 1,
      loading: false,
      error: null,
    });
  });

  it('preserves and reports source errors', async () => {
    const controller = new GridRemoteDataController<Row>();
    const error = new Error('Request failed');
    const source: GridDataSource<Row> = {
      load: async () => {
        throw error;
      },
    };

    await expectAsync(controller.load(source, request)).toBeRejectedWith(error);
    expect(controller.state().loading).toBeFalse();
    expect(controller.state().error).toBe(error);
  });

  it('ignores results from a cancelled stale request', async () => {
    const controller = new GridRemoteDataController<Row>();
    let resolveRequest!: (result: { items: Row[]; total: number }) => void;
    const source: GridDataSource<Row> = {
      load: () =>
        new Promise(resolve => {
          resolveRequest = resolve;
        }),
    };

    const pending = controller.load(source, request);
    controller.cancel();
    resolveRequest({ items: [{ id: 1 }], total: 1 });

    expect(await pending).toBeNull();
    expect(controller.state().items).toEqual([]);
  });
});
