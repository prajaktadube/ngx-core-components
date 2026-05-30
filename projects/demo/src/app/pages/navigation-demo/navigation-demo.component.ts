import { Component, signal } from '@angular/core';
import {
  BreadcrumbComponent, BreadcrumbItem, MenuComponent, MenuItem,
  CommandPaletteComponent, CommandItem
} from 'ngx-core-components';

interface ApiRow { name: string; type: string; default: string; description: string; }

@Component({
  selector: 'app-navigation-demo',
  standalone: true,
  imports: [BreadcrumbComponent, MenuComponent, CommandPaletteComponent],
  template: `
    <div class="demo-page">
      <!-- Page Header -->
      <div class="page-header">
        <div class="page-header-text">
          <h1>Navigation Components</h1>
          <p>Breadcrumbs, Menu, and Spotlight search palette components for application command hierarchies.</p>
        </div>
        <div class="header-badges">
          <span class="badge badge-orange">Breadcrumb</span>
          <span class="badge badge-orange">Menu</span>
          <span class="badge badge-orange">Command Palette</span>
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
          <div class="section-label">Breadcrumb — Default</div>
          <ngx-breadcrumb [items]="breadcrumb1" />

          <div class="section-label">Breadcrumb — Custom Separators</div>
          <div class="demo-stack">
            <ngx-breadcrumb [items]="breadcrumb2" separator="›" />
            <ngx-breadcrumb [items]="breadcrumb3" separator="/" />
          </div>

          <div class="section-label">Menu — Horizontal</div>
          <ngx-menu [items]="menuItems" (itemClick)="log($event.label ?? 'menu-item')" />

          <div class="section-label">Menu — Vertical</div>
          <div style="max-width:220px;border:1px solid #e0e5ed;border-radius:8px;overflow:hidden">
            <ngx-menu [items]="verticalMenuItems" orientation="vertical" (itemClick)="log($event.label ?? 'menu-item')" />
          </div>

          @if (lastNav()) {
            <div class="nav-log">Navigated to: <strong>{{ lastNav() }}</strong></div>
          }

          <div class="section-label">How to Use</div>
          <pre style="margin:0;background:#1e1e1e;color:#d4d4d4;padding:16px;border-radius:8px;font-size:12px;line-height:1.5;overflow:auto">{{ howToCode }}</pre>
        </div>
      }

      <!-- ===== COMMAND PALETTE ===== -->
      @if (activeTab() === 'Command Palette') {
        <div class="tab-content">
          <div class="section-label">Command Palette Demo</div>
          <div class="playground-card" style="background:#fff; border:1px solid #e9ecef; border-radius:8px; padding:24px; display:flex; flex-direction:column; gap:16px;">
            <div class="panel-desc-row" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
              <div class="panel-desc-text">
                <h3 style="margin:0 0 6px; font-size:16px; font-weight:700;">Spotlight Search Overlay Console</h3>
                <p style="margin:0; font-size:13px; color:#6c757d;">Press <kbd style="background:#f1f5f9; border:1px solid #cbd5e1; padding:2px 6px; border-radius:4px; font-family:monospace; font-weight:700;">Ctrl + K</kbd> (or Cmd + K on macOS) anywhere on this page, or click the button below to launch the spotlight search console.</p>
              </div>
              <div>
                <button class="action-btn" (click)="palette.toggleOpen()" style="font-weight:700; color:#1a73e8; border:1px solid #1a73e8; background:#e8f0fe; padding:8px 16px; border-radius:6px; cursor:pointer; font-family:inherit; transition:all 0.2s;">
                  ⌨️ Trigger Command Console
                </button>
              </div>
            </div>

            <ngx-command-palette
              #palette
              [commands]="paletteCommands"
              (commandSelected)="onCommandSelected($event)"
            />

            @if (lastCommandAction()) {
              <div class="nav-log" style="margin-top:12px; background:linear-gradient(135deg, #f8f9fa 0%, #f3f5f9 100%); border:1px solid #e0e5ed; border-radius:8px; padding:12px 16px; font-size:12px; font-family:monospace; color:#495057; border-left:3px solid #1a73e8;">
                Last Command Executed: <strong>{{ lastCommandAction() }}</strong>
              </div>
            }
          </div>

          <div class="section-label">How to Use</div>
          <pre style="margin:0;background:#1e1e1e;color:#d4d4d4;padding:16px;border-radius:8px;font-size:12px;line-height:1.5;overflow:auto">{{ commandPaletteCode }}</pre>

          <div class="section-label">API Reference — Inputs</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input / Output</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of paletteApi; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- ===== API REFERENCE ===== -->
      @if (activeTab() === 'API Reference') {
        <div class="tab-content">
          <div class="section-label">Breadcrumb</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input / Output</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of breadcrumbApi; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>

          <div class="section-label">Breadcrumb Item Interface</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Property</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of breadcrumbItemApi; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>

          <div class="section-label">Menu</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input / Output</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of menuApi; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>

          <div class="section-label">Menu Item Interface</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Property</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of menuItemApi; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>

          <div class="section-label">Command Palette</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input / Output</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of paletteApi; track row.name) {
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
    .badge-orange { background: linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%); color: #92400e; border: 1px solid rgba(146, 64, 14, 0.1); }
    .tab-nav { display: flex; gap: 0; border-bottom: 2px solid #e9ecef; overflow-x: auto; padding-bottom: 0; }
    .tab-btn { padding: 12px 20px; background: none; border: none; font-size: 13px; font-weight: 500; color: #6c757d; cursor: pointer; border-bottom: 3px solid transparent; margin-bottom: -2px; font-family: inherit; transition: all 0.2s ease; white-space: nowrap; }
    .tab-btn:hover { color: #495057; background: rgba(26, 115, 232, 0.05); }
    .tab-btn.active { color: #1a73e8; border-bottom-color: #1a73e8; font-weight: 600; background: rgba(26, 115, 232, 0.04); }
    .tab-content { display: flex; flex-direction: column; gap: 20px; }
    .section-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; color: #8892a0; border-bottom: 2px solid #e9ecef; padding-bottom: 12px; }
    .demo-stack { display: flex; flex-direction: column; gap: 12px; }
    .nav-log { background: linear-gradient(135deg, #f8f9fa 0%, #f3f5f9 100%); border: 1px solid #e0e5ed; border-radius: 8px; padding: 12px 16px; font-size: 12px; font-family: monospace; color: #495057; border-left: 3px solid #1a73e8; }
    .api-table-wrap { overflow-x: auto; border: 1px solid #e9ecef; border-radius: 10px; }
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
export class NavigationDemoComponent {
  activeTab = signal('Demo');
  tabs = ['Demo', 'Command Palette', 'API Reference'];
  lastNav = signal('');

  howToCode = `import { Component } from '@angular/core';
import { BreadcrumbComponent, MenuComponent } from 'ngx-core-components/navigation';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [BreadcrumbComponent, MenuComponent],
  template: '<ngx-breadcrumb [items]="crumbs" separator="/" /><ngx-menu [items]="menuItems" />'
})
export class ExampleComponent {
  crumbs = [{ label: 'Home' }, { label: 'Products' }];
  menuItems = [{ label: 'Dashboard' }, { label: 'Settings' }];
}`;

  breadcrumb1: BreadcrumbItem[] = [{ label: 'Home', icon: '🏠' }, { label: 'Components' }, { label: 'Navigation' }];
  breadcrumb2: BreadcrumbItem[] = [{ label: 'Dashboard' }, { label: 'Analytics' }, { label: 'Reports' }, { label: 'Q4 2024' }];
  breadcrumb3: BreadcrumbItem[] = [{ label: 'Settings' }, { label: 'Organization' }, { label: 'Team Members' }];

  menuItems: MenuItem[] = [
    { label: 'Home', icon: '🏠' },
    { label: 'Products', icon: '📦', children: [{ label: 'All Products' }, { label: 'Categories' }, { separator: true }, { label: 'Add New Product' }] },
    { label: 'Analytics', icon: '📊', children: [{ label: 'Dashboard' }, { label: 'Reports' }, { label: 'Insights' }] },
    { label: 'Settings', icon: '⚙️' },
    { label: 'Disabled', icon: '🔒', disabled: true },
  ];

  verticalMenuItems: MenuItem[] = [
    { label: 'Dashboard', icon: '📊' },
    { label: 'Users', icon: '👥', children: [{ label: 'All Users' }, { label: 'Roles & Permissions' }] },
    { label: 'Content', icon: '📝', children: [{ label: 'Pages' }, { label: 'Media Library' }] },
    { label: 'Integrations', icon: '🔌' },
    { separator: true },
    { label: 'Help & Support', icon: '❓' },
  ];

  // ===== COMMAND PALETTE STATE =====
  lastCommandAction = signal('');
  paletteCommands: CommandItem[] = [
    { id: 'home', label: 'Go to Home', desc: 'Navigate to the overview page', shortcut: 'G + H', icon: '🏠', category: 'Navigation' },
    { id: 'charts', label: 'View Charts Showcase', desc: 'Explore charts component demos', shortcut: 'G + C', icon: '📈', category: 'Navigation' },
    { id: 'maps', label: 'View Maps Showcase', desc: 'Explore interactive vector maps', shortcut: 'G + M', icon: '🗺️', category: 'Navigation' },
    { id: 'theme-light', label: 'Set Light Theme', desc: 'Switch system layout to light theme mode', icon: '☀️', category: 'Preferences' },
    { id: 'theme-dark', label: 'Set Dark Theme', desc: 'Switch system layout to dark theme mode', icon: '🌙', category: 'Preferences' },
    { id: 'feedback-notif', label: 'Show Demo Notification', desc: 'Triggers a toast message popup banner', icon: '🔔', category: 'Actions' },
    { id: 'reset-logs', label: 'Clear Logs', desc: 'Resets the command action logs window', icon: '🗑️', category: 'Actions' }
  ];

  onCommandSelected(cmd: CommandItem): void {
    this.lastCommandAction.set(`"${cmd.label}" (id: ${cmd.id}, category: ${cmd.category})`);
    if (cmd.id === 'reset-logs') {
      this.lastCommandAction.set('');
    }
  }

  commandPaletteCode = `import { Component, ViewChild } from '@angular/core';
import { CommandPaletteComponent, CommandItem } from 'ngx-core-components/navigation';

@Component({
  selector: 'app-my-app',
  standalone: true,
  imports: [CommandPaletteComponent],
  template: \`
    <button (click)="palette.toggleOpen()">Open Console</button>

    <ngx-command-palette
      #palette
      [commands]="commands"
      (commandSelected)="onCommand($event)"
    />
  \`
})
export class MyAppComponent {
  @ViewChild('palette') palette!: CommandPaletteComponent;

  commands: CommandItem[] = [
    { id: 'home', label: 'Go to Home', desc: 'Navigate to overview', shortcut: 'Ctrl+H', icon: '🏠' }
  ];

  onCommand(cmd: CommandItem) {
    console.log('Command executed:', cmd);
  }
}`;

  breadcrumbApi: ApiRow[] = [
    { name: 'items', type: 'BreadcrumbItem[]', default: '[]', description: 'Array of breadcrumb items to display.' },
    { name: 'separator', type: 'string', default: "'/'", description: 'Character or string between items.' },
    { name: 'itemClick', type: 'Output<BreadcrumbItem>', default: 'n/a', description: 'Emitted when a breadcrumb item is clicked.' },
  ];

  breadcrumbItemApi: ApiRow[] = [
    { name: 'label', type: 'string', default: 'undefined', description: 'Display text for breadcrumb item.' },
    { name: 'icon', type: 'string', default: 'undefined', description: 'Icon to display before label.' },
    { name: 'url', type: 'string', default: 'undefined', description: 'Navigation URL (optional).' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable item interaction.' },
  ];

  menuApi: ApiRow[] = [
    { name: 'items', type: 'MenuItem[]', default: '[]', description: 'Array of menu items to display.' },
    { name: 'orientation', type: "'horizontal'|'vertical'", default: "'horizontal'", description: 'Menu layout direction.' },
    { name: 'itemClick', type: 'Output<MenuItem>', default: 'n/a', description: 'Emitted when a menu item is clicked.' },
  ];

  menuItemApi: ApiRow[] = [
    { name: 'label', type: 'string', default: 'undefined', description: 'Display text for menu item.' },
    { name: 'icon', type: 'string', default: 'undefined', description: 'Icon to display with label.' },
    { name: 'url', type: 'string', default: 'undefined', description: 'Navigation URL.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable item interaction.' },
    { name: 'separator', type: 'boolean', default: 'false', description: 'Render as visual separator/divider.' },
    { name: 'children', type: 'MenuItem[]', default: 'undefined', description: 'Submenu items (creates dropdown).' },
  ];

  paletteApi: ApiRow[] = [
    { name: 'commands', type: 'CommandItem[]', default: 'required', description: 'Array of commands accessible via the console search.' },
    { name: 'placeholder', type: 'string', default: "'Type a command or search...'", description: 'Placeholder label printed inside search console input.' },
    { name: '(commandSelected)', type: 'Output<CommandItem>', default: 'n/a', description: 'Emitted when a command row item is executed (via click or Enter key).' }
  ];

  log(label: string): void { this.lastNav.set(label); }
}
