function dashboard(options) {
  return (tree, context) => {
    context.logger.info('⚡ Scaffolding a pre-configured ngx-core-components Analytics Dashboard...');

    const name = options.name || 'analytics-dashboard';
    // Convert camelCase or PascalCase to dashed-case
    const dashedName = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    // Convert dashed-case to camelCase
    const camelName = dashedName.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    // Convert camelCase to PascalCase
    const pascalName = camelName.charAt(0).toUpperCase() + camelName.slice(1);
    
    // Default file path to src/app/name/name.component.ts
    const filePath = `src/app/${dashedName}/${dashedName}.component.ts`;
    
    const content = `import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from 'ngx-core-components/layout';
import { StatCardComponent } from 'ngx-core-components/feedback';
import { BarChartComponent } from 'ngx-core-components/charts';
import { DataGridComponent } from 'ngx-core-components/grid';

@Component({
  selector: 'app-${dashedName}',
  standalone: true,
  imports: [
    CommonModule, 
    DashboardLayoutComponent, 
    StatCardComponent, 
    BarChartComponent, 
    DataGridComponent
  ],
  template: \`
    <div style="padding: 24px; font-family: var(--ngx-font-family, sans-serif); background: var(--ngx-bg-primary, #f8fafc); min-height: 100vh;">
      <div style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h1 style="margin: 0; font-size: 24px; color: var(--ngx-color-text, #0f172a); font-weight: 700;">${pascalName} Portal</h1>
          <p style="margin: 4px 0 0; font-size: 14px; color: var(--ngx-color-text-secondary, #64748b);">Real-time metrics, analytics, and recent transactional data.</p>
        </div>
        <button style="padding: 8px 16px; font-size: 13px; font-weight: 600; color: white; background: var(--ngx-color-primary, #4f46e5); border: none; border-radius: 8px; cursor: pointer; box-shadow: var(--ngx-shadow-sm);">
          Refresh Data
        </button>
      </div>

      <ngx-dashboard-layout 
        [items]="dashboardPanels" 
        [columns]="12" 
        rowHeight="160px"
        [allowDragging]="true"
        [allowResizing]="true"
      >
        <!-- KPI 1: Sales -->
        <div panel-id="sales-kpi" style="height: 100%;">
          <ngx-stat-card
            title="Total Revenue"
            value="$48,259.00"
            change="+12.5%"
            trend="up"
            icon="💰"
            [style.--ngx-stat-card-accent]="'#4f46e5'"
          ></ngx-stat-card>
        </div>

        <!-- KPI 2: Users -->
        <div panel-id="users-kpi" style="height: 100%;">
          <ngx-stat-card
            title="Active Customers"
            value="3,842"
            change="+4.3%"
            trend="up"
            icon="👥"
            [style.--ngx-stat-card-accent]="'#06b6d4'"
          ></ngx-stat-card>
        </div>

        <!-- KPI 3: Conversion -->
        <div panel-id="conversion-kpi" style="height: 100%;">
          <ngx-stat-card
            title="Conversion Rate"
            value="2.84%"
            change="-0.9%"
            trend="down"
            icon="📈"
            [style.--ngx-stat-card-accent]="'#ef4444'"
          ></ngx-stat-card>
        </div>

        <!-- Sales Bar Chart -->
        <div panel-id="sales-chart" style="height: 100%; display: flex; flex-direction: column; justify-content: center; padding: 12px;">
          <ngx-bar-chart
            [series]="chartSeries"
            [categories]="chartCategories"
            [height]="280"
            [showExport]="true"
            [showLegend]="true"
            [showGrid]="true"
          ></ngx-bar-chart>
        </div>

        <!-- Transactions DataGrid -->
        <div panel-id="orders-grid" style="height: 100%; display: flex; flex-direction: column; overflow: hidden;">
          <ngx-data-grid
            [data]="gridData"
            [columns]="gridColumns"
            [pageSize]="5"
            [pageable]="true"
            [sortable]="true"
            [filterable]="true"
          ></ngx-data-grid>
        </div>
      </ngx-dashboard-layout>
    </div>
  \`
})
export class ${pascalName}Component {
  // Define layout structure for panels
  dashboardPanels = [
    { id: 'sales-kpi', title: 'Revenue Stats', row: 0, col: 0, rowSpan: 1, colSpan: 4, category: 'finance' },
    { id: 'users-kpi', title: 'User Stats', row: 0, col: 4, rowSpan: 1, colSpan: 4, category: 'users' },
    { id: 'conversion-kpi', title: 'Conversion Rate', row: 0, col: 8, rowSpan: 1, colSpan: 4, category: 'system' },
    { id: 'sales-chart', title: 'Quarterly Sales Overview', row: 1, col: 0, rowSpan: 2, colSpan: 12, category: 'finance' },
    { id: 'orders-grid', title: 'Recent Transactions Log', row: 3, col: 0, rowSpan: 3, colSpan: 12, category: 'audit' }
  ];

  // Sales chart configuration
  chartCategories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  chartSeries = [
    { name: 'Online Sales', data: [12000, 19000, 3000, 5000, 2000, 30000] },
    { name: 'In-Store Sales', data: [8000, 12000, 9000, 15000, 8000, 18000] }
  ];

  // DataGrid recent orders records
  gridData = [
    { orderId: 'TX-1001', customer: 'Emma Watson', date: '2026-07-10', amount: 350.00, status: 'Completed' },
    { orderId: 'TX-1002', customer: 'John Doe', date: '2026-07-12', amount: 120.50, status: 'Pending' },
    { orderId: 'TX-1003', customer: 'Sarah Jenkins', date: '2026-07-14', amount: 1540.00, status: 'Completed' },
    { orderId: 'TX-1004', customer: 'Michael Scott', date: '2026-07-15', amount: 89.90, status: 'Failed' },
    { orderId: 'TX-1005', customer: 'Pam Beesly', date: '2026-07-15', amount: 430.00, status: 'Completed' }
  ];

  gridColumns = [
    { field: 'orderId', title: 'Order ID', width: 120, sortable: true },
    { field: 'customer', title: 'Customer Name', sortable: true, filterable: true },
    { field: 'date', title: 'Date', width: 120, sortable: true },
    { field: 'amount', title: 'Amount ($)', width: 120, align: 'right', sortable: true },
    { field: 'status', title: 'Status', width: 140, sortable: true }
  ];
}
`;

    if (tree.exists(filePath)) {
      context.logger.warn(`⚠️ File ${filePath} already exists. Skipping scaffolding.`);
    } else {
      tree.create(filePath, content);
      context.logger.info(`✅ Generated ${pascalName}Component with pre-configured dashboard at ${filePath}`);
    }

    return tree;
  };
}

module.exports = { dashboard };
