import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatCardComponent, StatCardVariant } from 'ngx-core-components/feedback';

interface KpiCard {
  label: string;
  value: string | number;
  subtitle: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  icon: string;
  variant: StatCardVariant;
}

interface ApiRow { name: string; type: string; default: string; description: string; }

@Component({
  selector: 'app-stat-cards-demo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, StatCardComponent],
  template: `
    <div class="demo-page">
      <header class="demo-header">
        <h1>📈 Stat Cards & KPI</h1>
        <p>Premium glassmorphism KPI metric cards with trend indicators, loading states, and five variants for any dashboard.</p>
      </header>

      <!-- TAB NAV -->
      <div class="tab-nav">
        @for (tab of tabs; track tab) {
          <button class="tab-btn" [class.active]="activeTab() === tab" (click)="activeTab.set(tab)">{{ tab }}</button>
        }
      </div>

      <!-- ===== DEMO ===== -->
      @if (activeTab() === 'Demo') {
        <div class="tab-content">
          <!-- Live dashboard grid -->
          <section class="demo-section">
            <h2>Dashboard KPI Grid</h2>
            <p class="section-desc">A realistic analytics dashboard with 8 stat cards. Hover to see the lift effect.</p>
            <div class="kpi-grid">
              @for (card of kpiCards; track card.label) {
                <ngx-stat-card
                  [label]="card.label"
                  [value]="card.value"
                  [subtitle]="card.subtitle"
                  [trend]="card.trend"
                  [trendValue]="card.trendValue"
                  [icon]="card.icon"
                  [variant]="card.variant"
                ></ngx-stat-card>
              }
            </div>
          </section>

          <!-- Variants -->
          <section class="demo-section">
            <h2>Variants</h2>
            <div class="variants-grid">
              @for (v of variants; track v.label) {
                <ngx-stat-card
                  [label]="v.label"
                  [value]="v.value"
                  subtitle="vs last period"
                  [trend]="v.trend"
                  [trendValue]="v.trendValue"
                  [variant]="v.variant"
                  icon="✦"
                ></ngx-stat-card>
              }
            </div>
          </section>

          <!-- Dark theme -->
          <section class="demo-section">
            <h2>Dark Theme</h2>
            <div class="dark-bg">
              <div class="kpi-grid">
                @for (card of darkCards; track card.label) {
                  <ngx-stat-card
                    [label]="card.label"
                    [value]="card.value"
                    [subtitle]="card.subtitle"
                    [trend]="card.trend"
                    [trendValue]="card.trendValue"
                    [icon]="card.icon"
                    [variant]="card.variant"
                    theme="dark"
                  ></ngx-stat-card>
                }
              </div>
            </div>
          </section>

          <!-- Loading state -->
          <section class="demo-section">
            <h2>Loading Skeleton</h2>
            <p class="section-desc">When <code>loading=true</code>, an animated shimmer skeleton replaces the content.</p>
            <div class="loading-row">
              <div class="load-toggle">
                <button class="toggle-btn" (click)="toggleLoading()">
                  {{ isLoading() ? '✅ Show Data' : '⏳ Show Loading' }}
                </button>
              </div>
              <div class="load-grid">
                @for (card of kpiCards.slice(0, 4); track card.label) {
                  <ngx-stat-card
                    [label]="card.label"
                    [value]="card.value"
                    [subtitle]="card.subtitle"
                    [trend]="card.trend"
                    [trendValue]="card.trendValue"
                    [icon]="card.icon"
                    [variant]="card.variant"
                    [loading]="isLoading()"
                  ></ngx-stat-card>
                }
              </div>
            </div>
          </section>

          <div class="section-label">How to Use</div>
          <pre class="code-block">{{ howToCode }}</pre>
        </div>
      }

      <!-- ===== API REFERENCE ===== -->
      @if (activeTab() === 'API Reference') {
        <div class="tab-content">
          <div class="section-label">Stat Card Component (ngx-stat-card)</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Property</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of apiRef; track row.name) {
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
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }

    .demo-page {
      max-width: 960px;
      margin: 0 auto;
      padding: 32px 24px 80px;
    }

    .demo-header {
      margin-bottom: 24px;
    }

    .demo-header h1 {
      font-size: 28px;
      font-weight: 800;
      color: var(--text-primary, #0f172a);
      margin: 0 0 8px;
    }

    .demo-header p {
      font-size: 15px;
      color: var(--text-secondary, #64748b);
      margin: 0;
    }

    .tab-nav { display: flex; gap: 0; border-bottom: 2px solid #e9ecef; overflow-x: auto; padding-bottom: 0; margin-bottom: 24px; }
    .tab-btn { padding: 12px 20px; background: none; border: none; font-size: 13px; font-weight: 500; color: #6c757d; cursor: pointer; border-bottom: 3px solid transparent; margin-bottom: -2px; font-family: inherit; transition: all 0.2s ease; white-space: nowrap; }
    .tab-btn:hover { color: #495057; background: rgba(26, 115, 232, 0.05); }
    .tab-btn.active { color: #1a73e8; border-bottom-color: #1a73e8; font-weight: 600; background: rgba(26, 115, 232, 0.04); }
    .tab-content { display: flex; flex-direction: column; gap: 20px; }

    .demo-section {
      margin-bottom: 20px;
    }

    .demo-section h2 {
      font-size: 17px;
      font-weight: 700;
      color: var(--text-primary, #0f172a);
      margin: 0 0 8px;
    }

    .section-desc {
      font-size: 13px;
      color: var(--text-secondary, #64748b);
      margin: 0 0 16px;
    }

    .section-desc code {
      background: var(--bg-secondary, #f1f5f9);
      padding: 1px 5px;
      border-radius: 4px;
      font-size: 12px;
      font-family: monospace;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
    }

    .variants-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 16px;
    }

    .dark-bg {
      background: linear-gradient(135deg, #0f1117 0%, #1a1b2e 100%);
      border-radius: 16px;
      padding: 32px;
    }

    .loading-row {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .toggle-btn {
      background: var(--primary-color, #4f46e5);
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 10px 20px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s;
      align-self: flex-start;
    }

    .toggle-btn:hover { opacity: 0.85; }

    .load-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
    }

    .section-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; color: #8892a0; border-bottom: 2px solid #e9ecef; padding-bottom: 12px; margin-top: 16px; }
    .code-block { background: #1e1e1e; color: #d4d4d4; padding: 16px; border-radius: 8px; font-size: 12px; font-family: 'Cascadia Code', Consolas, monospace; overflow-x: auto; white-space: pre; margin: 0; }
    
    .api-table-wrap { overflow-x: auto; border: 1px solid #e9ecef; border-radius: 10px; margin-bottom: 24px; }
    .api-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .api-table thead tr { background: linear-gradient(135deg, #f8f9fa 0%, #f3f5f9 100%); }
    .api-table th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.7px; color: #495057; border-bottom: 2px solid #e9ecef; white-space: nowrap; }
    .api-table td { padding: 12px 16px; border-bottom: 1px solid #f1f3f5; color: #495057; vertical-align: top; }
    .api-table tbody tr { transition: background 0.2s ease; }
    .api-table tbody tr:hover td { background: #f8f9fa; }
    .api-table tbody tr:last-child td { border-bottom: none; }
    .api-name { color: #1a73e8 !important; font-family: monospace; font-weight: 700; white-space: nowrap; }
    .api-type { color: #8e44ad !important; font-family: monospace; white-space: nowrap; }
    .api-default { font-family: monospace; white-space: nowrap; color: #ff6b6b; font-weight: 500; }
  `]
})
export class StatCardsDemoComponent {
  activeTab = signal('Demo');
  tabs = ['Demo', 'API Reference'];

  howToCode = `import { Component } from '@angular/core';
import { StatCardComponent } from 'ngx-core-components/feedback';

@Component({
  selector: 'app-my-kpis',
  standalone: true,
  imports: [StatCardComponent],
  template: \`
    <ngx-stat-card
      label="Total Subscriptions"
      value="1,492"
      subtitle="vs 1,200 last month"
      trend="up"
      trendValue="+24.3%"
      icon="📈"
      variant="success"
    ></ngx-stat-card>
  \`
})
export class MyKpisComponent {}`;

  isLoading = signal(false);

  apiRef: ApiRow[] = [
    { name: 'label', type: 'InputSignal<string>', default: "''", description: 'Title label of the KPI metric.' },
    { name: 'value', type: 'InputSignal<string | number>', default: "''", description: 'Primary value text to highlight in bold.' },
    { name: 'subtitle', type: 'InputSignal<string>', default: "''", description: 'Supporting contextual info shown below the value.' },
    { name: 'trend', type: "InputSignal<'up' | 'down' | 'neutral'>", default: "'neutral'", description: 'Directional styling and formatting indicator for the trend.' },
    { name: 'trendValue', type: 'InputSignal<string>', default: "''", description: 'Literal change percentage or value representation (e.g. +12.3% or -5).' },
    { name: 'icon', type: 'InputSignal<string>', default: "''", description: 'Custom unicode symbol or emoji placed inside the floating header icon circle.' },
    { name: 'variant', type: 'InputSignal<StatCardVariant>', default: "'default'", description: 'Visual appearance variant coloring (default, success, danger, warning, info).' },
    { name: 'theme', type: "InputSignal<'light' | 'dark'>", default: "'light'", description: 'Styling appearance theme.' },
    { name: 'loading', type: 'InputSignal<boolean>', default: 'false', description: 'Locks the card structure inside an active shimmer skeleton loading state.' }
  ];

  toggleLoading(): void {
    this.isLoading.set(!this.isLoading());
  }

  kpiCards: KpiCard[] = [
    { label: 'Total Revenue',    value: '$284,192',  subtitle: 'This quarter',       trend: 'up',      trendValue: '+18.4%', icon: '💰', variant: 'success' },
    { label: 'Active Users',     value: '12,845',    subtitle: 'Last 30 days',        trend: 'up',      trendValue: '+5.2%',  icon: '👥', variant: 'info'    },
    { label: 'Conversion Rate',  value: '3.78%',     subtitle: 'vs 3.42% last month', trend: 'up',      trendValue: '+10.5%', icon: '📊', variant: 'default' },
    { label: 'Churn Rate',       value: '1.2%',      subtitle: 'Monthly avg',         trend: 'down',    trendValue: '-0.3%',  icon: '🔄', variant: 'danger'  },
    { label: 'Avg Order Value',  value: '$124.50',   subtitle: 'Per transaction',     trend: 'up',      trendValue: '+8.1%',  icon: '🛒', variant: 'success' },
    { label: 'Support Tickets',  value: '47',        subtitle: 'Open right now',      trend: 'down',    trendValue: '-12',    icon: '🎫', variant: 'warning' },
    { label: 'System Uptime',    value: '99.97%',    subtitle: 'Last 90 days',        trend: 'neutral', trendValue: '',       icon: '⚡', variant: 'info'    },
    { label: 'NPS Score',        value: '72',        subtitle: 'Excellent',           trend: 'up',      trendValue: '+4pts',  icon: '⭐', variant: 'success' },
  ];

  variants: Array<{ label: string; value: string; trend: 'up'|'down'|'neutral'; trendValue: string; variant: StatCardVariant }> = [
    { label: 'Default',  value: '4,200',  trend: 'neutral', trendValue: '—',     variant: 'default' },
    { label: 'Success',  value: '+42.1%', trend: 'up',      trendValue: '+5%',   variant: 'success' },
    { label: 'Danger',   value: '−18.3%', trend: 'down',    trendValue: '−2%',   variant: 'danger'  },
    { label: 'Warning',  value: '62%',    trend: 'neutral', trendValue: '',      variant: 'warning' },
    { label: 'Info',     value: '1,024',  trend: 'up',      trendValue: '+3.2%', variant: 'info'    },
  ];

  darkCards: KpiCard[] = [
    { label: 'Requests/sec',  value: '14,280',    subtitle: 'Peak traffic',  trend: 'up',   trendValue: '+22%',  icon: '🌐', variant: 'info'    },
    { label: 'Error Rate',    value: '0.04%',     subtitle: 'All endpoints', trend: 'down', trendValue: '−0.01%',icon: '🔴', variant: 'success' },
    { label: 'Cache Hit',     value: '96.2%',     subtitle: 'CDN layer',     trend: 'up',   trendValue: '+1.4%', icon: '⚡', variant: 'default' },
    { label: 'Latency P99',   value: '142ms',     subtitle: 'Global avg',    trend: 'down', trendValue: '−18ms', icon: '⏱️', variant: 'success' },
  ];
}

