import { Component, input, signal, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface AIModel {
  name: string;
  provider: string;
  parameters: string;
  contextWindow: string;
  pricingInput: number;  // per 1M tokens
  pricingOutput: number; // per 1M tokens
  avgLatency: number;    // seconds
  capabilities: ('text' | 'code' | 'vision' | 'audio')[];
  rating: number;
  status: 'stable' | 'beta' | 'deprecated';
  recommended?: boolean;
}

@Component({
  selector: 'ngx-ai-model-compare',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="model-compare-wrapper" [class.dark]="theme() === 'dark'">
      <!-- Toolbar Filter Bar -->
      <div class="toolbar-header">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            [ngModel]="searchQuery()"
            (ngModelChange)="searchQuery.set($event)"
            placeholder="Search model or provider..."
            class="filter-input"
          />
        </div>

        <!-- Filter Tags -->
        <div class="filter-tags">
          @for (tag of tags; track tag.value) {
            <button
              class="tag-btn"
              [class.active]="activeTag() === tag.value"
              (click)="activeTag.set(tag.value)"
            >
              {{ tag.label }}
            </button>
          }
        </div>
      </div>

      <!-- Comparison Grid Container -->
      <div class="table-container">
        <table class="compare-table">
          <thead>
            <tr>
              <th class="cell-model">Model</th>
              <th>Parameters</th>
              <th>Context</th>
              <th>Cost (In/Out per 1M)</th>
              <th class="cell-latency">Latency</th>
              <th>Capabilities</th>
              <th>Rating</th>
              <th class="cell-action">Action</th>
            </tr>
          </thead>
          <tbody>
            @if (filteredModels().length === 0) {
              <tr>
                <td colspan="8" class="empty-state">
                  No models match the current filter or search criteria.
                </td>
              </tr>
            } @else {
              @for (model of filteredModels(); track model.name) {
                <tr
                  class="model-row"
                  [class.recommended]="model.recommended"
                  [class.selected]="selectedModel()?.name === model.name"
                  (click)="selectModel(model)"
                >
                  <!-- Model Info -->
                  <td class="cell-model">
                    <div class="model-title-wrap">
                      <div class="model-name">
                        {{ model.name }}
                        <span *ngIf="model.recommended" class="badge-recommended">Rec</span>
                        <span *ngIf="model.status === 'beta'" class="badge-beta">Beta</span>
                      </div>
                      <div class="model-provider">{{ model.provider }}</div>
                    </div>
                  </td>

                  <!-- Parameters -->
                  <td>
                    <span class="param-tag">{{ model.parameters }}</span>
                  </td>

                  <!-- Context Window -->
                  <td>{{ model.contextWindow }}</td>

                  <!-- Pricing -->
                  <td>
                    <div class="pricing-wrap">
                      <span class="price-val">\${{ model.pricingInput }}</span>
                      <span class="price-slash">/</span>
                      <span class="price-val">\${{ model.pricingOutput }}</span>
                    </div>
                  </td>

                  <!-- Latency Bar -->
                  <td class="cell-latency">
                    <div class="latency-graph-wrap">
                      <div class="latency-metrics">
                        <span>{{ model.avgLatency }}s</span>
                      </div>
                      <div class="bar-track">
                        <div
                          class="bar-fill"
                          [style.width.%]="getLatencyPercentage(model.avgLatency)"
                          [class.fast]="model.avgLatency <= 1.0"
                          [class.moderate]="model.avgLatency > 1.0 && model.avgLatency <= 2.2"
                          [class.slow]="model.avgLatency > 2.2"
                        ></div>
                      </div>
                    </div>
                  </td>

                  <!-- Capabilities -->
                  <td>
                    <div class="capabilities-icons">
                      <span [class.active]="model.capabilities.includes('text')" title="Text processing">💬</span>
                      <span [class.active]="model.capabilities.includes('code')" title="Code generation">💻</span>
                      <span [class.active]="model.capabilities.includes('vision')" title="Computer vision">👁️</span>
                      <span [class.active]="model.capabilities.includes('audio')" title="Voice/Audio input">🎙️</span>
                    </div>
                  </td>

                  <!-- Rating -->
                  <td>
                    <div class="rating-stars" [title]="model.rating + ' stars'">
                      @for (star of [1, 2, 3, 4, 5]; track star) {
                        <span class="star" [class.filled]="star <= model.rating">★</span>
                      }
                    </div>
                  </td>

                  <!-- Select Button -->
                  <td class="cell-action" (click)="$event.stopPropagation()">
                    <button
                      class="select-btn"
                      [class.active]="selectedModel()?.name === model.name"
                      (click)="selectModel(model)"
                    >
                      {{ selectedModel()?.name === model.name ? 'Selected' : 'Compare' }}
                    </button>
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .model-compare-wrapper {
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: var(--radius-md, 10px);
      box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.08));
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: all 0.3s;
    }

    /* Toolbar headers */
    .toolbar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-color, #e2e8f0);
      gap: 16px;
      flex-wrap: wrap;
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 8px;
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: var(--radius-sm, 6px);
      padding: 6px 12px;
      background: var(--bg-primary, #f8fafc);
      min-width: 250px;
      flex: 1;
      max-width: 400px;
    }

    .search-icon {
      font-size: 14px;
    }

    .filter-input {
      border: none;
      background: transparent;
      outline: none;
      font-size: 13px;
      width: 100%;
      color: var(--text-primary, #0f172a);
    }

    .filter-tags {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 2px;
    }

    .tag-btn {
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 600;
      border-radius: 9999px;
      border: 1px solid var(--border-color, #e2e8f0);
      background: transparent;
      color: var(--text-secondary, #475569);
      cursor: pointer;
      font-family: var(--ngx-font-family, sans-serif);
      transition: all 0.2s;
    }
    .tag-btn:hover {
      background: var(--border-light, #f1f5f9);
      color: var(--text-primary, #0f172a);
    }
    .tag-btn.active {
      background: var(--primary-color, #4f46e5);
      border-color: var(--primary-color, #4f46e5);
      color: #ffffff;
    }

    /* Table styles */
    .table-container {
      overflow-x: auto;
    }

    .compare-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-family: var(--ngx-font-family, sans-serif);
      font-size: 13px;
    }

    .compare-table th {
      padding: 14px 20px;
      font-weight: 700;
      color: var(--text-secondary, #475569);
      background: var(--border-light, #f1f5f9);
      border-bottom: 1px solid var(--border-color, #e2e8f0);
      user-select: none;
    }

    .compare-table td {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-light, #f1f5f9);
      vertical-align: middle;
      color: var(--text-primary, #0f172a);
      transition: background 0.15s;
    }

    .model-row {
      cursor: pointer;
    }

    .model-row:hover td {
      background: rgba(79, 70, 229, 0.02);
    }

    .model-row.selected td {
      background: rgba(79, 70, 229, 0.05);
    }

    .model-row.recommended {
      position: relative;
    }

    .model-title-wrap {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .model-name {
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .model-provider {
      font-size: 11px;
      color: var(--text-secondary, #475569);
    }

    /* Badges */
    .badge-recommended {
      background: #e0e7ff;
      color: #4f46e5;
      font-size: 10px;
      padding: 1px 6px;
      border-radius: 4px;
      font-weight: 700;
    }

    .badge-beta {
      background: #fef3c7;
      color: #d97706;
      font-size: 10px;
      padding: 1px 6px;
      border-radius: 4px;
      font-weight: 700;
    }

    .param-tag {
      background: var(--border-light, #f1f5f9);
      color: var(--text-secondary, #475569);
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
    }

    .pricing-wrap {
      display: flex;
      align-items: center;
      font-weight: 600;
    }

    .price-slash {
      color: var(--text-muted, #94a3b8);
      margin: 0 4px;
    }

    /* Latency bar graphs */
    .latency-graph-wrap {
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 100px;
    }

    .latency-metrics {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      font-weight: 600;
      color: var(--text-secondary, #475569);
    }

    .bar-track {
      height: 6px;
      background: var(--border-color, #e2e8f0);
      border-radius: 3px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      border-radius: 3px;
    }

    .bar-fill.fast { background: #10b981; }
    .bar-fill.moderate { background: #f59e0b; }
    .bar-fill.slow { background: #ef4444; }

    /* Capabilities */
    .capabilities-icons {
      display: flex;
      gap: 6px;
      font-size: 15px;
    }

    .capabilities-icons span {
      opacity: 0.2;
      filter: grayscale(1);
      transition: opacity 0.2s;
    }

    .capabilities-icons span.active {
      opacity: 1;
      filter: none;
    }

    /* Star ratings */
    .rating-stars {
      color: #f59e0b;
      font-size: 14px;
      letter-spacing: -2px;
      white-space: nowrap;
    }

    .star {
      opacity: 0.2;
    }

    .star.filled {
      opacity: 1;
    }

    /* Action selection button */
    .select-btn {
      padding: 6px 12px;
      font-size: 11px;
      font-weight: 700;
      border-radius: 6px;
      border: 1px solid var(--border-color, #e2e8f0);
      background: transparent;
      color: var(--text-secondary, #475569);
      cursor: pointer;
      font-family: var(--ngx-font-family, sans-serif);
      transition: all 0.2s;
      width: 76px;
    }

    .select-btn:hover {
      background: rgba(79, 70, 229, 0.05);
      color: var(--primary-color, #4f46e5);
      border-color: var(--primary-color, #4f46e5);
    }

    .select-btn.active {
      background: var(--primary-color, #4f46e5);
      border-color: var(--primary-color, #4f46e5);
      color: #ffffff;
    }

    .empty-state {
      text-align: center;
      padding: 30px !important;
      color: var(--text-secondary, #475569);
      font-style: italic;
    }

    /* Dark Mode */
    .model-compare-wrapper.dark {
      background: #0f172a;
      border-color: #1f2937;
    }
    .model-compare-wrapper.dark .toolbar-header {
      border-bottom-color: #1f2937;
    }
    .model-compare-wrapper.dark .search-box {
      border-color: #1f2937;
      background: #0b0f19;
    }
    .model-compare-wrapper.dark .filter-input {
      color: #f8fafc;
    }
    .model-compare-wrapper.dark .tag-btn {
      border-color: #374151;
      color: #94a3b8;
    }
    .model-compare-wrapper.dark .tag-btn:hover {
      background: #1f2937;
      color: #f8fafc;
    }
    .model-compare-wrapper.dark .tag-btn.active {
      background: var(--primary-color, #6366f1);
      border-color: var(--primary-color, #6366f1);
      color: #ffffff;
    }
    .model-compare-wrapper.dark .compare-table th {
      background: #1e293b;
      border-bottom-color: #1f2937;
      color: #94a3b8;
    }
    .model-compare-wrapper.dark .compare-table td {
      border-bottom-color: #1f2937;
      color: #e2e8f0;
    }
    .model-compare-wrapper.dark .model-row:hover td {
      background: rgba(99, 102, 241, 0.02);
    }
    .model-compare-wrapper.dark .model-row.selected td {
      background: rgba(99, 102, 241, 0.05);
    }
    .model-compare-wrapper.dark .badge-recommended {
      background: rgba(99, 102, 241, 0.15);
      color: #818cf8;
    }
    .model-compare-wrapper.dark .badge-beta {
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
    }
    .model-compare-wrapper.dark .param-tag {
      background: #1e293b;
      color: #94a3b8;
    }
    .model-compare-wrapper.dark .model-provider {
      color: #6b7280;
    }
    .model-compare-wrapper.dark .bar-track {
      background: #1f2937;
    }
    .model-compare-wrapper.dark .latency-metrics {
      color: #94a3b8;
    }
    .model-compare-wrapper.dark .select-btn {
      border-color: #374151;
      color: #94a3b8;
    }
    .model-compare-wrapper.dark .select-btn:hover {
      background: rgba(99, 102, 241, 0.05);
      color: var(--primary-color, #6366f1);
      border-color: var(--primary-color, #6366f1);
    }
    .model-compare-wrapper.dark .select-btn.active {
      background: var(--primary-color, #6366f1);
      border-color: var(--primary-color, #6366f1);
      color: #ffffff;
    }
  `]
})
export class AIModelCompareComponent {
  // Inputs
  models = input<AIModel[]>([]);
  theme = input<'light' | 'dark'>('light');

  // Outputs
  modelSelected = output<AIModel>();

  // State
  searchQuery = signal<string>('');
  activeTag = signal<string>('all');
  selectedModel = signal<AIModel | null>(null);

  // Available Filter Tags
  tags = [
    { label: 'All Models', value: 'all' },
    { label: 'Fastest (< 1.2s)', value: 'fast' },
    { label: 'Cheapest ($/1M)', value: 'cheap' },
    { label: 'Vision Support', value: 'vision' },
    { label: 'Coding Tools', value: 'code' }
  ];

  // Helper calculation for latency meter width
  getLatencyPercentage(val: number): number {
    // Max scale set to 5.0 seconds
    const percentage = (val / 5.0) * 100;
    return Math.min(Math.max(percentage, 5), 100);
  }

  // Filtered/searched list of models
  filteredModels = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const tag = this.activeTag();
    let list = this.models() || [];

    // Apply text search filter
    if (query) {
      list = list.filter(
        m =>
          m.name.toLowerCase().includes(query) ||
          m.provider.toLowerCase().includes(query)
      );
    }

    // Apply category tag filter
    if (tag === 'fast') {
      list = list.filter(m => m.avgLatency <= 1.2);
    } else if (tag === 'cheap') {
      // Cheapest input price: less than $5
      list = list.filter(m => m.pricingInput <= 5.0);
    } else if (tag === 'vision') {
      list = list.filter(m => m.capabilities.includes('vision'));
    } else if (tag === 'code') {
      list = list.filter(m => m.capabilities.includes('code'));
    }

    return list;
  });

  selectModel(model: AIModel) {
    this.selectedModel.set(model);
    this.modelSelected.emit(model);
  }
}
