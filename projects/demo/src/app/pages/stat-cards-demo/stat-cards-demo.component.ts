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

      <!-- How to Use -->
      <section class="demo-section">
        <h2>How to Use</h2>
        <p class="section-desc">Import the standalone metric stat card component. Set values and configure trend metrics.</p>
        <pre style="margin: 0; background: #0f172a; color: #38bdf8; padding: 18px 24px; border-radius: 12px; font-size: 13px; line-height: 1.6; overflow: auto; border: 1px solid rgba(255,255,255,0.06); font-family: monospace;">{{ howToCode }}</pre>
      </section>
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
      margin-bottom: 40px;
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

    .demo-section {
      margin-bottom: 48px;
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
  `]
})
export class StatCardsDemoComponent {
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
