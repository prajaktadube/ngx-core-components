import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarComponent, AvatarGroupComponent, AvatarItem, AvatarStatus } from 'ngx-core-components/feedback';

interface ApiRow { name: string; type: string; default: string; description: string; }

@Component({
  selector: 'app-avatars-demo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, AvatarComponent, AvatarGroupComponent],
  template: `
    <div class="demo-page">
      <!-- Page Header -->
      <div class="page-header">
        <div class="page-header-text">
          <h1>👤 Avatars</h1>
          <p>Single avatars and grouped avatar stacks with status indicators, initials, and notification badges.</p>
        </div>
        <div class="header-badges">
          <span class="badge badge-purple">Initials</span>
          <span class="badge badge-purple">Status Indicator</span>
          <span class="badge badge-purple">Avatar Stack</span>
        </div>
      </div>

      <!-- TAB NAV -->
      <div class="tab-nav">
        @for (tab of tabs; track tab) {
          <button class="tab-btn" [class.active]="activeTab() === tab" (click)="activeTab.set(tab)">{{ tab }}</button>
        }
      </div>

      <!-- ===== DEMO ===== -->
      @if (activeTab() === 'Demo') {
        <div class="tab-content">
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

          <div class="section-label">How to Use</div>
          <pre class="code-block">{{ howToCode }}</pre>
        </div>
      }

      <!-- ===== API REFERENCE ===== -->
      @if (activeTab() === 'API Reference') {
        <div class="tab-content">
          <div class="section-label">Avatar (ngx-avatar)</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of avatarApi; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>

          <div class="section-label">Avatar Group (ngx-avatar-group)</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of avatarGroupApi; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; height: 100%; overflow-y: auto; }
    .demo-page { padding: 32px 40px; max-width: 1200px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: 28px; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; padding-bottom: 24px; border-bottom: 2px solid rgba(230, 230, 245, 0.6); }
    .page-header-text h1 { margin: 0 0 8px; font-size: 28px; font-weight: 900; color: #1a1a2e; letter-spacing: -0.5px; }
    .page-header-text p { margin: 0; font-size: 14px; color: #6c757d; line-height: 1.7; max-width: 600px; }
    .header-badges { display: flex; gap: 10px; flex-shrink: 0; flex-wrap: wrap; }
    .badge { font-size: 11px; font-weight: 700; padding: 6px 12px; border-radius: 16px; transition: all 0.2s ease; }
    .badge-purple { background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%); color: #6b21a8; border: 1px solid rgba(107, 33, 168, 0.1); }
    
    .tab-nav { display: flex; gap: 0; border-bottom: 2px solid #e9ecef; overflow-x: auto; padding-bottom: 0; }
    .tab-btn { padding: 12px 20px; background: none; border: none; font-size: 13px; font-weight: 500; color: #6c757d; cursor: pointer; border-bottom: 3px solid transparent; margin-bottom: -2px; font-family: inherit; transition: all 0.2s ease; white-space: nowrap; }
    .tab-btn:hover { color: #495057; background: rgba(26, 115, 232, 0.05); }
    .tab-btn.active { color: #1a73e8; border-bottom-color: #1a73e8; font-weight: 600; background: rgba(26, 115, 232, 0.04); }
    
    .tab-content { display: flex; flex-direction: column; gap: 20px; }
    .demo-section { margin-bottom: 20px; }
    .demo-section h2 { font-size: 17px; font-weight: 700; color: #0f172a; margin: 0 0 8px; }
    .section-desc { font-size: 13px; color: #64748b; margin: 0 0 16px; }
    .demo-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; }
    
    .avatar-row { display: flex; align-items: flex-end; gap: 24px; }
    .avatar-row.wrap { flex-wrap: wrap; }
    .avatar-col { display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .avatar-label { font-size: 11px; font-weight: 600; color: #64748b; text-transform: capitalize; }
    
    .groups-column { display: flex; flex-direction: column; gap: 20px; }
    .group-row { display: flex; align-items: center; gap: 16px; }
    .group-label { font-size: 13px; color: #64748b; }
    
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
export class AvatarsDemoComponent {
  activeTab = signal('Demo');
  tabs = ['Demo', 'API Reference'];

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

  howToCode = `import { Component } from '@angular/core';
import { AvatarComponent, AvatarGroupComponent } from 'ngx-core-components/feedback';

@Component({
  selector: 'app-avatar-example',
  standalone: true,
  imports: [AvatarComponent, AvatarGroupComponent],
  template: \`
    <!-- Single Avatar with initials and HSL color -->
    <ngx-avatar name="John Doe" size="lg" status="online"></ngx-avatar>

    <!-- Avatar Group Stack -->
    <ngx-avatar-group [avatars]="team" [maxShow]="4" size="md"></ngx-avatar-group>
  \`
})
export class AvatarExampleComponent {
  team = [
    { id: 1, name: 'Alice Walker' },
    { id: 2, name: 'Bob Martinez' },
    { id: 3, name: 'Carol Johnson' },
    { id: 4, name: 'David Nguyen' }
  ];
}`;

  avatarApi: ApiRow[] = [
    { name: 'name', type: 'string', default: "''", description: 'Full name used to extract initials and deterministic HSL color.' },
    { name: 'src', type: 'string', default: "''", description: 'Image source URL. If provided, hides text initials.' },
    { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Sizing scale for the avatar container.' },
    { name: 'shape', type: "'circle' | 'rounded' | 'square'", default: "'circle'", description: 'Border radius shapes.' },
    { name: 'status', type: "'online' | 'offline' | 'busy' | 'away' | 'none'", default: "'none'", description: 'Status badge indicator overlays.' },
    { name: 'badge', type: 'string | number', default: 'null', description: 'Counter badge overlay (e.g. notifications).' },
    { name: 'color', type: 'string', default: "''", description: 'Override background color (defaults to name-hashed HSL).' }
  ];

  avatarGroupApi: ApiRow[] = [
    { name: 'avatars', type: 'AvatarItem[]', default: '[]', description: 'Array of avatars to group.' },
    { name: 'maxShow', type: 'number', default: '5', description: 'Maximum number of avatars to render before displaying the remainder count (+N).' },
    { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Sizing scale of grouped avatars.' },
    { name: 'shape', type: "'circle' | 'rounded' | 'square'", default: "'circle'", description: 'Border radius shapes of grouped avatars.' }
  ];
}

