import { signal } from '@angular/core';
import type { GridDataStateChangeEvent } from './models';

export type GridDataSourceRequest = GridDataStateChangeEvent;

export interface GridDataSourceResult<T> {
  items: T[];
  total: number;
}

export interface GridDataSource<T> {
  load(request: GridDataSourceRequest, signal: AbortSignal): Promise<GridDataSourceResult<T>>;
}

export interface GridDataSourceState<T> {
  items: T[];
  total: number;
  loading: boolean;
  error: unknown | null;
}

export class GridRemoteDataController<T> {
  readonly state = signal<GridDataSourceState<T>>({
    items: [],
    total: 0,
    loading: false,
    error: null,
  });

  private activeRequest: AbortController | null = null;
  private requestId = 0;

  async load(source: GridDataSource<T>, request: GridDataSourceRequest): Promise<GridDataSourceState<T> | null> {
    this.cancel();
    const requestId = ++this.requestId;
    const controller = new AbortController();
    this.activeRequest = controller;
    this.state.update(state => ({ ...state, loading: true, error: null }));

    try {
      const result = await source.load(request, controller.signal);
      if (controller.signal.aborted || requestId !== this.requestId) {
        return null;
      }
      if (!Array.isArray(result.items) || !Number.isInteger(result.total) || result.total < 0) {
        throw new TypeError('Grid data source must return an items array and a non-negative integer total.');
      }

      const nextState = { items: result.items, total: result.total, loading: false, error: null };
      this.state.set(nextState);
      this.activeRequest = null;
      return nextState;
    } catch (error) {
      if (controller.signal.aborted || requestId !== this.requestId) {
        return null;
      }

      this.state.update(state => ({ ...state, loading: false, error }));
      this.activeRequest = null;
      throw error;
    }
  }

  cancel(): void {
    this.requestId++;
    this.activeRequest?.abort();
    this.activeRequest = null;
    this.state.update(state => ({ ...state, loading: false }));
  }
}
