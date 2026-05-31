import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarComponent, AvatarGroupComponent, AvatarItem, AvatarStatus } from 'ngx-core-components/feedback';

@Component({
  selector: 'app-avatars-demo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, AvatarComponent, AvatarGroupComponent],
  template: `
    <div class="demo-page">
      <header class="demo-header">
        <h1>👤 Avatars</h1>
        <p>Single avatars and grouped avatar stacks with status indicators, initials, and notification badges.</p>
      </header>

      <!-- Sizes -->
      <section class="demo-section">
        <h2>Sizes</h2>
        <p class="section-desc">Five sizes from xs to xl — all auto-generating initials and unique colors from the name.</p>
        <div class="demo-card">
          <div class="avatar-row wrap">
            @for (size of sizes; track size) {
              <div class="avatar-col">
                <ngx-avatar [name]="'John Doe'" [size]="size"></ngx-avatar>
                <span class="avatar-label">{{ size }}</span>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Shapes -->
      <section class="demo-section">
        <h2>Shapes</h2>
        <div class="demo-card">
          <div class="avatar-row">
            @for (shape of shapes; track shape) {
              <div class="avatar-col">
                <ngx-avatar [name]="'Alex Kim'" [shape]="shape" size="lg"></ngx-avatar>
                <span class="avatar-label">{{ shape }}</span>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Status indicators -->
      <section class="demo-section">
        <h2>Status Indicators</h2>
        <div class="demo-card">
          <div class="avatar-row">
            @for (s of statuses; track s.status) {
              <div class="avatar-col">
                <ngx-avatar [name]="s.name" [status]="s.status" size="lg"></ngx-avatar>
                <span class="avatar-label">{{ s.status }}</span>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- With badge -->
      <section class="demo-section">
        <h2>With Notification Badge</h2>
        <div class="demo-card">
          <div class="avatar-row">
            <div class="avatar-col">
              <ngx-avatar name="Sarah Connor" badge="3" size="lg"></ngx-avatar>
              <span class="avatar-label">badge: 3</span>
            </div>
            <div class="avatar-col">
              <ngx-avatar name="Kyle Reese" badge="12" size="lg" status="online"></ngx-avatar>
              <span class="avatar-label">badge + status</span>
            </div>
            <div class="avatar-col">
              <ngx-avatar name="T-800 Model" badge="99" size="xl" shape="square"></ngx-avatar>
              <span class="avatar-label">badge xl square</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Avatar Group -->
      <section class="demo-section">
        <h2>Avatar Groups</h2>
        <p class="section-desc">Avatar stacks with automatic overflow counter.</p>
        <div class="demo-card">
          <div class="groups-column">
            <div class="group-row">
              <ngx-avatar-group [avatars]="teamA" [maxShow]="4" size="md"></ngx-avatar-group>
              <span class="group-label">Team A — 6 members, max 4 shown</span>
            </div>
            <div class="group-row">
              <ngx-avatar-group [avatars]="teamB" [maxShow]="5" size="sm"></ngx-avatar-group>
              <span class="group-label">Team B — sm size</span>
            </div>
            <div class="group-row">
              <ngx-avatar-group [avatars]="teamC" [maxShow]="3" size="lg" shape="square"></ngx-avatar-group>
              <span class="group-label">Team C — lg square</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Color variety -->
      <section class="demo-section">
        <h2>Auto-generated Colors</h2>
        <p class="section-desc">Each name gets a deterministic, unique HSL color from its hash — no two names look the same.</p>
        <div class="demo-card">
          <div class="avatar-row wrap">
            @for (member of colorDemo; track member) {
              <div class="avatar-col">
                <ngx-avatar [name]="member" size="lg"></ngx-avatar>
                <span class="avatar-label">{{ member.split(' ')[0] }}</span>
              </div>
            }
          </div>
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
      margin-bottom: 40px;
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

    .demo-card {
      background: var(--bg-secondary, #f8fafc);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 12px;
      padding: 24px;
    }

    .avatar-row {
      display: flex;
      align-items: flex-end;
      gap: 24px;
    }

    .avatar-row.wrap {
      flex-wrap: wrap;
    }

    .avatar-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .avatar-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-secondary, #64748b);
      text-transform: capitalize;
    }

    .groups-column {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .group-row {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .group-label {
      font-size: 13px;
      color: var(--text-secondary, #64748b);
    }
  `]
})
export class AvatarsDemoComponent {
  sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
  shapes = ['circle', 'rounded', 'square'] as const;

  statuses: { name: string; status: AvatarStatus }[] = [
    { name: 'Alice Walker',   status: 'online' },
    { name: 'Bob Martinez',   status: 'offline' },
    { name: 'Carol Johnson',  status: 'busy' },
    { name: 'David Nguyen',   status: 'away' },
    { name: 'Eve Thompson',   status: 'none' },
  ];

  teamA: AvatarItem[] = [
    { id: 1, name: 'Alice Walker' },
    { id: 2, name: 'Bob Martinez' },
    { id: 3, name: 'Carol Johnson' },
    { id: 4, name: 'David Nguyen' },
    { id: 5, name: 'Eve Thompson' },
    { id: 6, name: 'Frank Lee' },
  ];

  teamB: AvatarItem[] = [
    { id: 7,  name: 'Grace Hall' },
    { id: 8,  name: 'Henry Adams' },
    { id: 9,  name: 'Iris Brown' },
    { id: 10, name: 'Jack Wilson' },
    { id: 11, name: 'Karen Young' },
    { id: 12, name: 'Leo Clark' },
    { id: 13, name: 'Maya Scott' },
  ];

  teamC: AvatarItem[] = [
    { id: 14, name: 'Nathan White' },
    { id: 15, name: 'Olivia Harris' },
    { id: 16, name: 'Paul Jackson' },
    { id: 17, name: 'Quinn Roberts' },
  ];

  colorDemo = [
    'Alexander Chen',
    'Beatrice Santos',
    'Carlos Rivera',
    'Diana Hoffman',
    'Ethan Walker',
    'Fiona Park',
    'George Osei',
    'Hana Tanaka',
  ];
}
