import { Component, signal } from '@angular/core';
import {
  BreadcrumbComponent, BreadcrumbItem, MenuComponent, MenuItem,
  CommandPaletteComponent, CommandItem,
  ContextMenuComponent, ContextMenuItem,
  BackToTopComponent
} from 'ngx-core-components/navigation';

interface ApiRow { name: string; type: string; default: string; description: string; }

@Component({
  selector: 'app-navigation-demo',
  standalone: true,
  imports: [BreadcrumbComponent, MenuComponent, CommandPaletteComponent, ContextMenuComponent, BackToTopComponent],
  template: `
    <div class="demo-page">
      <!-- Page Header -->
      <div class="page-header">
        <div class="page-header-text">
          <h1>Navigation Components</h1>
          <p>Premium breadcrumbs, menus, spotlight search, context menus, and scroll-to-top navigation components.</p>
        </div>
        <div class="header-badges">
          <span class="badge badge-orange">Breadcrumb</span>
          <span class="badge badge-orange">Menu</span>
          <span class="badge badge-orange">Command Palette</span>
          <span class="badge badge-teal">Context Menu</span>
          <span class="badge badge-teal">Back to Top</span>
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

          <!-- Breadcrumb Demos -->
          <div class="section-label">Breadcrumb — Default</div>
          <div class="demo-card">
            <ngx-breadcrumb [items]="breadcrumb1" (itemClick)="log($event.label)" />
          </div>

          <div class="section-label">Breadcrumb — Custom Separators</div>
          <div class="demo-card">
            <div class="demo-stack">
              <div class="demo-row">
                <span class="demo-tag">chevron</span>
                <ngx-breadcrumb [items]="breadcrumb2" separator="›" (itemClick)="log($event.label)" />
              </div>
              <div class="demo-row">
                <span class="demo-tag">slash</span>
                <ngx-breadcrumb [items]="breadcrumb3" separator="/" (itemClick)="log($event.label)" />
              </div>
            </div>
          </div>

          <div class="section-label">Breadcrumb — Collapsible (maxVisible=2)</div>
          <div class="demo-card">
            <ngx-breadcrumb [items]="breadcrumbLong" [maxVisible]="2" separator="›" (itemClick)="log($event.label)" />
          </div>

          <!-- Menu Demos -->
          <div class="section-label">Menu — Horizontal</div>
          <div class="demo-card">
            <ngx-menu [items]="menuItems" (itemClick)="log($event.label ?? 'menu-item')" />
          </div>

          <div class="section-label">Menu — Vertical</div>
          <div class="demo-card">
            <div style="max-width:240px">
              <ngx-menu [items]="verticalMenuItems" orientation="vertical" (itemClick)="log($event.label ?? 'menu-item')" />
            </div>
          </div>

          @if (lastNav()) {
            <div class="nav-log">
              <span class="nav-log-icon">🔗</span>
              Navigated to: <strong>{{ lastNav() }}</strong>
            </div>
          }
        </div>
      }

      <!-- ===== CONTEXT MENU ===== -->
      @if (activeTab() === 'Context Menu') {
        <div class="tab-content">
          <div class="section-label">Right-Click Context Menu</div>
          <div class="demo-card">
            <p style="margin:0 0 12px; font-size:13px; color:#6c757d;">Right-click inside the area below to open the context menu.</p>
            <div
              class="context-area"
              (contextmenu)="onContextMenu($event)"
            >
              <div class="context-area-inner">
                <span class="context-area-icon">🖱️</span>
                <span class="context-area-label">Right-click anywhere in this area</span>
              </div>
            </div>

            <ngx-context-menu
              [items]="contextMenuItems"
              [open]="ctxOpen()"
              [x]="ctxX()"
              [y]="ctxY()"
              (itemSelected)="onContextItemSelected($event)"
              (openChange)="ctxOpen.set($event)"
            />

            @if (lastContextAction()) {
              <div class="nav-log" style="margin-top:16px;">
                <span class="nav-log-icon">✅</span>
                Context action: <strong>{{ lastContextAction() }}</strong>
              </div>
            }
          </div>

          <div class="section-label">How to Use</div>
          <pre class="code-block">{{ contextMenuCode }}</pre>

          <div class="section-label">API Reference</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input / Output</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of contextMenuApi; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- ===== COMMAND PALETTE ===== -->
      @if (activeTab() === 'Command Palette') {
        <div class="tab-content">
          <div class="section-label">Command Palette Demo</div>
          <div class="demo-card">
            <div class="palette-header">
              <div>
                <h3 style="margin:0 0 6px; font-size:16px; font-weight:700; color:#1a1a2e;">Spotlight Search Console</h3>
                <p style="margin:0; font-size:13px; color:#6c757d;">Press <kbd class="kbd">Ctrl + K</kbd> (or <kbd class="kbd">⌘ + K</kbd> on macOS), or click the button to launch.</p>
              </div>
              <button class="trigger-btn" (click)="palette.toggleOpen()">
                <span>⌨️</span> Launch Console
              </button>
            </div>

            <ngx-command-palette
              #palette
              [commands]="paletteCommands"
              (commandSelected)="onCommandSelected($event)"
            />

            @if (lastCommandAction()) {
              <div class="nav-log" style="margin-top:12px;">
                <span class="nav-log-icon">⚡</span>
                Last command: <strong>{{ lastCommandAction() }}</strong>
              </div>
            }
          </div>

          <div class="section-label">How to Use</div>
          <pre class="code-block">{{ commandPaletteCode }}</pre>

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

      <!-- ===== BACK TO TOP ===== -->
      @if (activeTab() === 'Back to Top') {
        <div class="tab-content">
          <div class="section-label">Scroll Progress + Back to Top</div>
          <div class="demo-card">
            <p style="margin:0 0 12px; font-size:13px; color:#6c757d;">Scroll down inside the container below. A floating button with a progress ring appears after 100px of scrolling.</p>

            <div class="demo-controls-row">
              <label class="demo-toggle">
                <input type="checkbox" [checked]="bttShowProgress()" (change)="bttShowProgress.set(!bttShowProgress())" />
                <span>Show progress ring</span>
              </label>
              <label class="demo-toggle">
                <input type="checkbox" [checked]="bttDark()" (change)="bttDark.set(!bttDark())" />
                <span>Dark theme</span>
              </label>
            </div>

            <div class="scroll-demo-container" id="bttScrollTarget">
              @for (i of scrollItems; track i) {
                <div class="scroll-card">
                  <div class="scroll-card-num">{{ i }}</div>
                  <div class="scroll-card-text">
                    <div class="scroll-card-title">Section {{ i }}</div>
                    <div class="scroll-card-desc">Scroll down to reveal the back-to-top button with animated progress ring.</div>
                  </div>
                </div>
              }
              <ngx-back-to-top target="#bttScrollTarget" [threshold]="100" [showProgress]="bttShowProgress()" [theme]="bttDark() ? 'dark' : 'light'" />
            </div>
          </div>

          <div class="section-label">How to Use</div>
          <pre class="code-block">{{ backToTopCode }}</pre>

          <div class="section-label">API Reference</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of backToTopApi; track row.name) {
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

          <div class="section-label">BreadcrumbItem Interface</div>
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

          <div class="section-label">MenuItem Interface</div>
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

          <div class="section-label">Context Menu</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input / Output</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of contextMenuApi; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>

          <div class="section-label">Back to Top</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of backToTopApi; track row.name) {
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
    .badge-teal { background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); color: #065f46; border: 1px solid rgba(6, 95, 70, 0.1); }

    /* Tabs */
    .tab-nav { display: flex; gap: 0; border-bottom: 2px solid #e9ecef; overflow-x: auto; padding-bottom: 0; }
    .tab-btn { padding: 12px 20px; background: none; border: none; font-size: 13px; font-weight: 500; color: #6c757d; cursor: pointer; border-bottom: 3px solid transparent; margin-bottom: -2px; font-family: inherit; transition: all 0.2s ease; white-space: nowrap; }
    .tab-btn:hover { color: #495057; background: rgba(26, 115, 232, 0.05); }
    .tab-btn.active { color: #1a73e8; border-bottom-color: #1a73e8; font-weight: 600; background: rgba(26, 115, 232, 0.04); }

    /* Content */
    .tab-content { display: flex; flex-direction: column; gap: 20px; }
    .section-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; color: #8892a0; border-bottom: 2px solid #e9ecef; padding-bottom: 12px; }

    /* Cards */
    .demo-card { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(230, 230, 245, 0.7); border-radius: 12px; padding: 24px; }
    .demo-stack { display: flex; flex-direction: column; gap: 16px; }
    .demo-row { display: flex; align-items: center; gap: 14px; }
    .demo-tag { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #6366f1; background: rgba(99, 102, 241, 0.08); padding: 4px 10px; border-radius: 6px; white-space: nowrap; }

    /* Log */
    .nav-log { display: flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #f8f9fa 0%, #f3f5f9 100%); border: 1px solid #e0e5ed; border-radius: 10px; padding: 12px 16px; font-size: 12px; font-family: monospace; color: #495057; border-left: 3px solid #1a73e8; animation: fadeSlideIn 0.3s ease; }
    .nav-log-icon { font-size: 16px; }
    @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

    /* Context Menu Area */
    .context-area {
      border: 2px dashed rgba(99, 102, 241, 0.25);
      border-radius: 12px;
      min-height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(139, 92, 246, 0.03) 100%);
      cursor: context-menu;
      transition: all 0.25s ease;
      user-select: none;
    }
    .context-area:hover {
      border-color: rgba(99, 102, 241, 0.45);
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.06) 0%, rgba(139, 92, 246, 0.06) 100%);
    }
    .context-area-inner { display: flex; flex-direction: column; align-items: center; gap: 10px; }
    .context-area-icon { font-size: 36px; opacity: 0.7; }
    .context-area-label { font-size: 13px; color: #8892a0; font-weight: 500; }

    /* Back to Top Scroll Container */
    .scroll-demo-container {
      position: relative;
      max-height: 350px;
      overflow-y: auto;
      border: 1px solid #e9ecef;
      border-radius: 12px;
      background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .scroll-card {
      display: flex;
      align-items: center;
      gap: 16px;
      background: #ffffff;
      border: 1px solid rgba(230, 230, 245, 0.7);
      border-radius: 10px;
      padding: 16px 20px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .scroll-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06); }
    .scroll-card-num {
      width: 36px; height: 36px; border-radius: 10px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: #fff; font-size: 14px; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .scroll-card-text { flex: 1; }
    .scroll-card-title { font-size: 14px; font-weight: 700; color: #1a1a2e; margin-bottom: 2px; }
    .scroll-card-desc { font-size: 12px; color: #8892a0; line-height: 1.5; }

    /* Controls */
    .demo-controls-row { display: flex; gap: 20px; margin-bottom: 16px; flex-wrap: wrap; }
    .demo-toggle { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #495057; cursor: pointer; }
    .demo-toggle input[type="checkbox"] { accent-color: #6366f1; width: 16px; height: 16px; }

    /* Palette trigger */
    .palette-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
    .trigger-btn {
      display: flex; align-items: center; gap: 6px;
      font-weight: 700; color: #6366f1; border: 1px solid #6366f1;
      background: rgba(99, 102, 241, 0.06); padding: 10px 20px;
      border-radius: 10px; cursor: pointer; font-family: inherit;
      font-size: 13px; transition: all 0.2s ease;
    }
    .trigger-btn:hover { background: rgba(99, 102, 241, 0.12); transform: translateY(-1px); }
    .kbd { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-weight: 700; font-size: 11px; }

    /* Code blocks */
    .code-block { margin: 0; background: #1e1e1e; color: #d4d4d4; padding: 16px; border-radius: 10px; font-size: 12px; line-height: 1.5; overflow: auto; }

    /* API tables */
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
  tabs = ['Demo', 'Context Menu', 'Command Palette', 'Back to Top', 'API Reference'];
  lastNav = signal('');

  // ===== BREADCRUMB DATA =====
  breadcrumb1: BreadcrumbItem[] = [{ label: 'Home', icon: '🏠' }, { label: 'Components' }, { label: 'Navigation' }];
  breadcrumb2: BreadcrumbItem[] = [{ label: 'Dashboard' }, { label: 'Analytics' }, { label: 'Reports' }, { label: 'Q4 2024' }];
  breadcrumb3: BreadcrumbItem[] = [{ label: 'Settings' }, { label: 'Organization' }, { label: 'Team Members' }];
  breadcrumbLong: BreadcrumbItem[] = [
    { label: 'Home', icon: '🏠' },
    { label: 'Products' },
    { label: 'Electronics' },
    { label: 'Smartphones' },
    { label: 'Samsung' },
    { label: 'Galaxy S25' },
  ];

  // ===== MENU DATA =====
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

  // ===== CONTEXT MENU STATE =====
  ctxOpen = signal(false);
  ctxX = signal(0);
  ctxY = signal(0);
  lastContextAction = signal('');

  contextMenuItems: ContextMenuItem[] = [
    { id: 'cut', label: 'Cut', icon: '✂️', shortcut: 'Ctrl+X' },
    { id: 'copy', label: 'Copy', icon: '📋', shortcut: 'Ctrl+C' },
    { id: 'paste', label: 'Paste', icon: '📌', shortcut: 'Ctrl+V' },
    { id: 'sep1', label: '', separator: true },
    { id: 'rename', label: 'Rename', icon: '✏️', shortcut: 'F2' },
    { id: 'duplicate', label: 'Duplicate', icon: '📑' },
    { id: 'move', label: 'Move to...', icon: '📁', children: [
      { id: 'move-archive', label: 'Archive' },
      { id: 'move-trash', label: 'Trash', danger: true },
      { id: 'move-drafts', label: 'Drafts' },
    ]},
    { id: 'sep2', label: '', separator: true },
    { id: 'share', label: 'Share', icon: '🔗', children: [
      { id: 'share-link', label: 'Copy Link' },
      { id: 'share-email', label: 'Email' },
      { id: 'share-slack', label: 'Slack' },
    ]},
    { id: 'delete', label: 'Delete', icon: '🗑️', danger: true, shortcut: 'Del' },
  ];

  onContextMenu(event: MouseEvent): void {
    event.preventDefault();
    this.ctxX.set(event.clientX);
    this.ctxY.set(event.clientY);
    this.ctxOpen.set(true);
  }

  onContextItemSelected(item: ContextMenuItem): void {
    this.lastContextAction.set(`${item.icon ?? ''} ${item.label} (id: ${item.id})`);
  }

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

  // ===== BACK TO TOP STATE =====
  bttShowProgress = signal(true);
  bttDark = signal(false);
  scrollItems = Array.from({ length: 20 }, (_, i) => i + 1);

  // ===== CODE SNIPPETS =====
  contextMenuCode = `import { ContextMenuComponent, ContextMenuItem } from 'ngx-core-components/navigation';

@Component({
  imports: [ContextMenuComponent],
  template: \`
    <div (contextmenu)="onRightClick($event)">Right-click me</div>

    <ngx-context-menu
      [items]="menuItems"
      [open]="isOpen"
      [x]="mouseX"
      [y]="mouseY"
      (itemSelected)="onSelect($event)"
      (openChange)="isOpen = $event"
    />
  \`
})
export class MyComponent {
  isOpen = false;
  mouseX = 0;
  mouseY = 0;
  menuItems: ContextMenuItem[] = [
    { id: 'copy', label: 'Copy', icon: '📋', shortcut: 'Ctrl+C' },
    { id: 'delete', label: 'Delete', icon: '🗑️', danger: true }
  ];
}`;

  commandPaletteCode = `import { CommandPaletteComponent, CommandItem } from 'ngx-core-components/navigation';

@Component({
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
export class MyComponent {
  commands: CommandItem[] = [
    { id: 'home', label: 'Go to Home', shortcut: 'Ctrl+H', icon: '🏠' }
  ];
  onCommand(cmd: CommandItem) { console.log(cmd); }
}`;

  backToTopCode = `import { BackToTopComponent } from 'ngx-core-components/navigation';

@Component({
  imports: [BackToTopComponent],
  template: \`
    <div class="scroll-container" id="myScroller" style="height:400px;overflow-y:auto;">
      <!-- Long content here -->
      <ngx-back-to-top target="#myScroller" [threshold]="100" [showProgress]="true" />
    </div>
  \`
})
export class MyComponent {}`;

  // ===== API TABLES =====
  breadcrumbApi: ApiRow[] = [
    { name: 'items', type: 'BreadcrumbItem[]', default: '[]', description: 'Array of breadcrumb items to display.' },
    { name: 'separator', type: 'string', default: "'/'", description: 'Character or string between items.' },
    { name: 'maxVisible', type: 'number', default: '0', description: 'Max items to show (0 = all). First + last N shown with "..." button.' },
    { name: '(itemClick)', type: 'Output<BreadcrumbItem>', default: 'n/a', description: 'Emitted when a breadcrumb item is clicked.' },
  ];

  breadcrumbItemApi: ApiRow[] = [
    { name: 'label', type: 'string', default: 'required', description: 'Display text for breadcrumb item.' },
    { name: 'icon', type: 'string', default: 'undefined', description: 'Icon to display before label.' },
    { name: 'url', type: 'string', default: 'undefined', description: 'Navigation URL (optional).' },
  ];

  menuApi: ApiRow[] = [
    { name: 'items', type: 'MenuItem[]', default: '[]', description: 'Array of menu items to display.' },
    { name: 'orientation', type: "'horizontal'|'vertical'", default: "'horizontal'", description: 'Menu layout direction.' },
    { name: 'activeItem', type: 'string', default: "''", description: 'Label or URL of the currently active item.' },
    { name: '(itemClick)', type: 'Output<MenuItem>', default: 'n/a', description: 'Emitted when a menu item is clicked.' },
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

  contextMenuApi: ApiRow[] = [
    { name: 'items', type: 'ContextMenuItem[]', default: '[]', description: 'Array of context menu items to display.' },
    { name: 'open', type: 'boolean', default: 'false', description: 'Controls visibility of the context menu.' },
    { name: 'x', type: 'number', default: '0', description: 'X (left) position in viewport pixels.' },
    { name: 'y', type: 'number', default: '0', description: 'Y (top) position in viewport pixels.' },
    { name: 'width', type: 'number', default: '200', description: 'Minimum width in pixels.' },
    { name: '(itemSelected)', type: 'Output<ContextMenuItem>', default: 'n/a', description: 'Emitted when a menu item is selected.' },
    { name: '(openChange)', type: 'Output<boolean>', default: 'n/a', description: 'Emitted when the menu should close.' },
  ];

  backToTopApi: ApiRow[] = [
    { name: 'threshold', type: 'number', default: '300', description: 'Scroll distance (px) before the button appears.' },
    { name: 'target', type: 'string | HTMLElement', default: 'null', description: 'CSS selector or HTMLElement for the scrollable container. Defaults to window.' },
    { name: 'theme', type: "'light' | 'dark'", default: "'light'", description: 'Light or dark button theme.' },
    { name: 'showProgress', type: 'boolean', default: 'true', description: 'Show SVG scroll progress ring around the button.' },
  ];

  log(label: string): void { this.lastNav.set(label); }
}
