import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridStatusBarAggregates } from '../../models';

/**
 * Enterprise Status Bar component for the DataGrid.
 * Displays live aggregation metrics (Count, Sum, Average, Min, Max)
 * computed from the currently selected cell range.
 *
 * @selector ngx-grid-status-bar
 * @usage
 * ```html
 * <ngx-grid-status-bar [aggregates]="selectionAggregates()" [visible]="showStatusBar()" />
 * ```
 */
@Component({
  selector: 'ngx-grid-status-bar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible() && hasSelection()) {
      <div class="grid-status-bar">
        <div class="status-section status-info">
          <span class="status-icon">📊</span>
          <span class="status-label">Selection</span>
        </div>

        <div class="status-metrics">
          <div class="metric">
            <span class="metric-label">Count</span>
            <span class="metric-value">{{ aggregates().count }}</span>
          </div>

          @if (aggregates().sum !== null) {
            <div class="metric-divider"></div>
            <div class="metric">
              <span class="metric-label">Sum</span>
              <span class="metric-value metric-value-primary">{{ formatNumber(aggregates().sum!) }}</span>
            </div>
          }

          @if (aggregates().average !== null) {
            <div class="metric-divider"></div>
            <div class="metric">
              <span class="metric-label">Average</span>
              <span class="metric-value">{{ formatNumber(aggregates().average!) }}</span>
            </div>
          }

          @if (aggregates().min !== null) {
            <div class="metric-divider"></div>
            <div class="metric">
              <span class="metric-label">Min</span>
              <span class="metric-value metric-value-success">{{ formatNumber(aggregates().min!) }}</span>
            </div>
          }

          @if (aggregates().max !== null) {
            <div class="metric-divider"></div>
            <div class="metric">
              <span class="metric-label">Max</span>
              <span class="metric-value metric-value-warning">{{ formatNumber(aggregates().max!) }}</span>
            </div>
          }
        </div>

        <div class="status-section status-badge">
          <span class="badge">{{ aggregates().count }} cell{{ aggregates().count !== 1 ? 's' : '' }} selected</span>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }

    .grid-status-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 16px;
      background: var(--ngx-grid-header-bg, #f8fafc);
      border-top: 1px solid var(--ngx-grid-border, #e2e8f0);
      font-family: var(--ngx-font-family, inherit);
      font-size: 12px;
      color: var(--ngx-grid-text-secondary, #64748b);
      min-height: 38px;
      gap: 16px;
      transition: all 0.2s ease;
    }

    .status-section {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }

    .status-icon {
      font-size: 13px;
    }

    .status-label {
      font-weight: 700;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--ngx-grid-text-secondary, #64748b);
    }

    .status-metrics {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      justify-content: center;
      flex-wrap: wrap;
    }

    .metric {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .metric-label {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--ngx-grid-text-secondary, #94a3b8);
    }

    .metric-value {
      font-size: 13px;
      font-weight: 700;
      color: var(--ngx-grid-text, #0f172a);
      font-variant-numeric: tabular-nums;
    }

    .metric-value-primary {
      color: var(--ngx-input-focus, #4f46e5);
    }

    .metric-value-success {
      color: #059669;
    }

    .metric-value-warning {
      color: #d97706;
    }

    .metric-divider {
      width: 1px;
      height: 18px;
      background: var(--ngx-grid-border, #e2e8f0);
    }

    .badge {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      font-size: 10px;
      font-weight: 600;
      border-radius: 10px;
      background: rgba(79, 70, 229, 0.08);
      color: var(--ngx-input-focus, #4f46e5);
      white-space: nowrap;
    }
  `]
})
export class GridStatusBarComponent {
  /** Aggregation metrics computed from selected cells */
  aggregates = input<GridStatusBarAggregates>({
    count: 0, sum: null, average: null, min: null, max: null
  });

  /** Whether the status bar should be visible */
  visible = input<boolean>(true);

  /** Whether there is an active selection to display */
  hasSelection = computed(() => this.aggregates().count > 0);

  /** Format a number for display with locale-aware separators */
  formatNumber(value: number): string {
    if (Number.isInteger(value)) {
      return value.toLocaleString();
    }
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }
}
