import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VirtualListComponent, VirtualListItem } from 'ngx-core-components/views';

interface PersonRecord extends VirtualListItem {
  id: number;
  label: string;
  email: string;
  department: string;
  salary: number;
  status: 'Active' | 'Inactive';
}

function genPeople(count: number): PersonRecord[] {
  const departments = ['Engineering', 'Marketing', 'Finance', 'HR', 'Design', 'Sales', 'Legal', 'Operations'];
  const firstNames = ['Alice', 'Bob', 'Carol', 'David', 'Eve', 'Frank', 'Grace', 'Henry', 'Iris', 'Jack',
                      'Karen', 'Leo', 'Maya', 'Nathan', 'Olivia', 'Paul', 'Quinn', 'Rachel', 'Sam', 'Tina'];
  const lastNames  = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson',
                      'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin'];

  return Array.from({ length: count }, (_, i) => {
    const first = firstNames[i % firstNames.length];
    const last  = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
    const dept  = departments[i % departments.length];
    return {
      id: i + 1,
      label: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@company.com`,
      department: dept,
      salary: 50000 + (i * 137 % 100000),
      status: i % 7 === 0 ? 'Inactive' : 'Active',
    };
  });
}

@Component({
  selector: 'app-virtual-list-demo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, VirtualListComponent],
  template: `
    <div class="demo-page">
      <header class="demo-header">
        <h1>⚡ Virtual List</h1>
        <p>High-performance windowed list rendering. Only DOM nodes for the visible viewport are created — enabling smooth scrolling through 10,000+ items.</p>
      </header>

      <!-- Stats bar -->
      <div class="stats-bar">
        <div class="stat-pill">
          <span class="pill-icon">👥</span>
          <span>{{ allPeople.length.toLocaleString() }} total records</span>
        </div>
        <div class="stat-pill">
          <span class="pill-icon">🖥️</span>
          <span>~{{ visibleCount() }} DOM nodes</span>
        </div>
        <div class="stat-pill">
          <span class="pill-icon">⚡</span>
          <span>60fps scroll</span>
        </div>
      </div>

      <!-- Basic demo -->
      <section class="demo-section">
        <div class="section-head">
          <h2>10,000-Person Directory</h2>
          <span class="badge-new">10k items</span>
        </div>
        <p class="section-desc">Click any row to select it. The list renders only ~15 rows at a time regardless of dataset size.</p>

        <div class="demo-card">
          <ngx-virtual-list
            [items]="allPeople"
            [containerHeight]="420"
            [itemHeight]="56"
            [overscan]="4"
            [striped]="true"
            [showCount]="true"
            (itemClick)="onItemClick($event)"
          >
          </ngx-virtual-list>
        </div>

        @if (selected()) {
          <div class="selection-detail">
            <div class="sel-row">
              <span class="sel-avatar" [style.background]="avatarColor(selected()!.label)">
                {{ initials(selected()!.label) }}
              </span>
              <div class="sel-info">
                <span class="sel-name">{{ selected()!.label }}</span>
                <span class="sel-email">{{ selected()!.email }}</span>
              </div>
              <span class="sel-dept">{{ selected()!.department }}</span>
              <span class="sel-salary">\${{ selected()!.salary.toLocaleString() }}</span>
              <span class="sel-status" [class.active]="selected()!.status === 'Active'">{{ selected()!.status }}</span>
            </div>
          </div>
        }
      </section>

      <!-- Size variants -->
      <section class="demo-section">
        <h2>Compact & Comfortable Row Heights</h2>
        <div class="side-by-side">
          <div class="compact-demo">
            <span class="demo-label">Compact (32px rows)</span>
            <ngx-virtual-list
              [items]="smallList"
              [containerHeight]="240"
              [itemHeight]="32"
              [showCount]="false"
              [striped]="true"
            ></ngx-virtual-list>
          </div>
          <div class="compact-demo">
            <span class="demo-label">Comfortable (64px rows)</span>
            <ngx-virtual-list
              [items]="smallList"
              [containerHeight]="240"
              [itemHeight]="64"
              [showCount]="false"
            ></ngx-virtual-list>
          </div>
        </div>
      </section>

      <!-- Empty state -->
      <section class="demo-section">
        <h2>Empty State</h2>
        <div class="demo-card" style="max-width: 400px">
          <ngx-virtual-list
            [items]="[]"
            [containerHeight]="160"
            emptyText="No employees found"
            [showCount]="false"
          ></ngx-virtual-list>
        </div>
      </section>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .demo-page {
      max-width: 900px;
      margin: 0 auto;
      padding: 32px 24px 80px;
    }

    .demo-header {
      margin-bottom: 28px;
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
      max-width: 600px;
    }

    .stats-bar {
      display: flex;
      gap: 12px;
      margin-bottom: 32px;
      flex-wrap: wrap;
    }

    .stat-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--bg-secondary, #f1f5f9);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 999px;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary, #0f172a);
    }

    .pill-icon { font-size: 16px; }

    .demo-section {
      margin-bottom: 40px;
    }

    .section-head {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 6px;
    }

    .demo-section h2 {
      font-size: 17px;
      font-weight: 700;
      color: var(--text-primary, #0f172a);
      margin: 0;
    }

    .badge-new {
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      color: #fff;
      font-size: 10px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 999px;
      letter-spacing: 0.3px;
    }

    .section-desc {
      font-size: 13px;
      color: var(--text-secondary, #64748b);
      margin: 0 0 16px;
    }

    .demo-card {
      background: var(--bg-primary, #ffffff);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,.06), 0 4px 12px rgba(0,0,0,.04);
    }

    .selection-detail {
      margin-top: 12px;
      padding: 16px 20px;
      background: var(--bg-secondary, #f8fafc);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 10px;
      animation: slide-in 0.18s ease;
    }

    @keyframes slide-in {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .sel-row {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .sel-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 800;
      color: #fff;
      flex-shrink: 0;
    }

    .sel-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
    }

    .sel-name {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-primary, #0f172a);
    }

    .sel-email {
      font-size: 12px;
      color: var(--text-secondary, #64748b);
    }

    .sel-dept {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-secondary, #64748b);
      background: var(--border-light, #f1f5f9);
      padding: 4px 10px;
      border-radius: 6px;
    }

    .sel-salary {
      font-size: 14px;
      font-weight: 700;
      color: #22c55e;
    }

    .sel-status {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 999px;
      background: #fef2f2;
      color: #ef4444;
    }

    .sel-status.active {
      background: #f0fdf4;
      color: #22c55e;
    }

    .side-by-side {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .compact-demo {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .demo-label {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-secondary, #64748b);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    @media (max-width: 600px) {
      .side-by-side { grid-template-columns: 1fr; }
      .sel-dept, .sel-salary { display: none; }
    }
  `]
})
export class VirtualListDemoComponent {
  allPeople = genPeople(10_000);
  smallList = genPeople(50);

  selected = signal<PersonRecord | null>(null);

  visibleCount = computed(() => {
    // approximate: containerHeight / itemHeight + overscan * 2
    return Math.ceil(420 / 56) + 8;
  });

  onItemClick(event: { item: PersonRecord; index: number }): void {
    this.selected.set(event.item);
  }

  initials(name: string): string {
    return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
  }

  avatarColor(name: string): string {
    let hash = 0;
    for (const ch of name) { hash = (hash << 5) - hash + ch.charCodeAt(0); hash |= 0; }
    return `hsl(${Math.abs(hash) % 360}, 60%, 45%)`;
  }
}
