import { Component, signal, computed } from '@angular/core';
import {
  ButtonComponent, ButtonGroupComponent, ChipComponent, ChipListComponent,
  SplitButtonComponent, DropDownButtonComponent, SpeedDialComponent, SpeedDialItem
} from 'ngx-core-components';

interface ApiRow { name: string; type: string; default: string; description: string; }

@Component({
  selector: 'app-buttons-demo',
  standalone: true,
  imports: [
    ButtonComponent, ButtonGroupComponent, ChipComponent, ChipListComponent,
    SplitButtonComponent, DropDownButtonComponent, SpeedDialComponent
  ],
  template: `
    <div class="demo-page">
      <!-- Page Header -->
      <div class="page-header">
        <div class="page-header-text">
          <h1>Buttons & Actions</h1>
          <p>Interactive button components, chips, and action triggers for enterprise applications.</p>
        </div>
        <div class="header-badges">
          <span class="badge badge-blue">Variants</span>
          <span class="badge badge-blue">Sizes</span>
          <span class="badge badge-blue">States</span>
          <span class="badge badge-blue">Icons</span>
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
          <div class="section-label">Interactive Button Playground</div>
          <div class="playground-card">
            <div class="playground-preview">
              <div class="preview-box" [style.width]="playgroundFullWidth() ? '100%' : 'auto'">
                <ngx-button
                  [variant]="playgroundVariant()"
                  [size]="playgroundSize()"
                  [shape]="playgroundShape()"
                  [disabled]="playgroundDisabled()"
                  [loading]="playgroundLoading()"
                  [prefixIcon]="playgroundPrefixIcon()"
                  [suffixIcon]="playgroundSuffixIcon()"
                  [ripple]="playgroundRipple()"
                  [fullWidth]="playgroundFullWidth()"
                  [selected]="playgroundSelected()"
                  [badge]="playgroundBadge()"
                  [badgePosition]="playgroundBadgePosition()"
                  [badgeVariant]="playgroundBadgeVariant()"
                  (click)="log('Playground button clicked!')"
                >
                  {{ playgroundText() }}
                </ngx-button>
              </div>
            </div>
            
            <div class="playground-controls">
              <div class="control-group">
                <label>Text</label>
                <input class="control-input" type="text" [value]="playgroundText()" (input)="playgroundText.set($any($event.target).value)" />
              </div>
              <div class="control-group-grid">
                <div class="control-group">
                  <label>Variant</label>
                  <select [value]="playgroundVariant()" (change)="playgroundVariant.set($any($event.target).value)">
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                    <option value="success">Success</option>
                    <option value="danger">Danger</option>
                    <option value="warning">Warning</option>
                    <option value="info">Info</option>
                    <option value="ghost">Ghost</option>
                    <option value="link">Link</option>
                  </select>
                </div>
                <div class="control-group">
                  <label>Size</label>
                  <select [value]="playgroundSize()" (change)="playgroundSize.set($any($event.target).value)">
                    <option value="sm">Small</option>
                    <option value="md">Medium</option>
                    <option value="lg">Large</option>
                  </select>
                </div>
                <div class="control-group">
                  <label>Shape</label>
                  <select [value]="playgroundShape()" (change)="playgroundShape.set($any($event.target).value)">
                    <option value="rectangle">Rectangle</option>
                    <option value="rounded">Rounded</option>
                    <option value="pill">Pill</option>
                  </select>
                </div>
              </div>
              <div class="control-group-grid">
                <div class="control-group">
                  <label>Prefix Icon</label>
                  <select [value]="playgroundPrefixIcon()" (change)="playgroundPrefixIcon.set($any($event.target).value)">
                    <option value="">None</option>
                    <option value="📥">📥 Download</option>
                    <option value="🚀">🚀 Launch</option>
                    <option value="✏️">✏️ Edit</option>
                    <option value="🔍">🔍 Search</option>
                  </select>
                </div>
                <div class="control-group">
                  <label>Suffix Icon</label>
                  <select [value]="playgroundSuffixIcon()" (change)="playgroundSuffixIcon.set($any($event.target).value)">
                    <option value="">None</option>
                    <option value="→">→ Next</option>
                    <option value="✓">✓ Done</option>
                    <option value="⚙️">⚙️ Settings</option>
                  </select>
                </div>
              </div>

              <!-- Enterprise configurable controls -->
              <div class="control-group-grid">
                <div class="control-group">
                  <label>Badge Value</label>
                  <input class="control-input" type="text" [value]="playgroundBadge()" (input)="playgroundBadge.set($any($event.target).value)" placeholder="e.g. 5, New" />
                </div>
                <div class="control-group">
                  <label>Badge Position</label>
                  <select [value]="playgroundBadgePosition()" (change)="playgroundBadgePosition.set($any($event.target).value)">
                    <option value="top-right">Top Right (Floating)</option>
                    <option value="inline">Inline</option>
                  </select>
                </div>
                <div class="control-group">
                  <label>Badge Variant</label>
                  <select [value]="playgroundBadgeVariant()" (change)="playgroundBadgeVariant.set($any($event.target).value)">
                    <option value="danger">Danger (Red)</option>
                    <option value="warning">Warning (Amber)</option>
                    <option value="success">Success (Green)</option>
                    <option value="info">Info (Blue)</option>
                  </select>
                </div>
              </div>

              <div class="control-checkboxes">
                <label class="control-checkbox">
                  <input type="checkbox" [checked]="playgroundDisabled()" (change)="playgroundDisabled.set($any($event.target).checked)" />
                  Disabled
                </label>
                <label class="control-checkbox">
                  <input type="checkbox" [checked]="playgroundLoading()" (change)="playgroundLoading.set($any($event.target).checked)" />
                  Loading
                </label>
                <label class="control-checkbox">
                  <input type="checkbox" [checked]="playgroundRipple()" (change)="playgroundRipple.set($any($event.target).checked)" />
                  Ripple
                </label>
                <label class="control-checkbox">
                  <input type="checkbox" [checked]="playgroundFullWidth()" (change)="playgroundFullWidth.set($any($event.target).checked)" />
                  Full Width (Block)
                </label>
                <label class="control-checkbox">
                  <input type="checkbox" [checked]="playgroundSelected()" (change)="playgroundSelected.set($any($event.target).checked)" />
                  Selected
                </label>
              </div>
            </div>
            
            <div class="playground-code-block">
              <pre><code>{{ playgroundCode() }}</code></pre>
              <button class="copy-btn" (click)="copyToClipboard(playgroundCode())">Copy Code</button>
            </div>
          </div>

          <div class="section-label">Button Variants</div>
          <div class="demo-row wrap">
            <ngx-button variant="primary">Primary</ngx-button>
            <ngx-button variant="secondary">Secondary</ngx-button>
            <ngx-button variant="success">Success</ngx-button>
            <ngx-button variant="danger">Danger</ngx-button>
            <ngx-button variant="warning">Warning</ngx-button>
            <ngx-button variant="info">Info</ngx-button>
            <ngx-button variant="ghost">Ghost</ngx-button>
            <ngx-button variant="link">Link</ngx-button>
          </div>

          <div class="section-label">Sizes</div>
          <div class="demo-row align-center">
            <ngx-button size="sm">Small</ngx-button>
            <ngx-button size="md">Medium</ngx-button>
            <ngx-button size="lg">Large</ngx-button>
          </div>

          <div class="section-label">Shapes</div>
          <div class="demo-row">
            <ngx-button shape="rectangle">Rectangle</ngx-button>
            <ngx-button shape="rounded">Rounded</ngx-button>
            <ngx-button shape="pill">Pill</ngx-button>
          </div>

          <div class="section-label">States & Icons</div>
          <div class="demo-row">
            <ngx-button [loading]="loading()">{{ loading() ? 'Loading...' : 'Click to Load' }}</ngx-button>
            <ngx-button [disabled]="true">Disabled</ngx-button>
            <ngx-button prefixIcon="⬇" variant="primary">Download</ngx-button>
            <ngx-button suffixIcon="→" variant="secondary">Next</ngx-button>
          </div>
          <div class="demo-row" style="margin-top:12px">
            <button class="demo-trigger" (click)="loading.set(!loading())">Toggle Loading State</button>
          </div>

          <div class="section-label">Enterprise & Configurable Features</div>
          <div class="demo-row wrap" style="gap: 24px;">
            <!-- Floating Badge -->
            <ngx-button variant="primary" badge="9+" badgeVariant="danger">
              Notifications
            </ngx-button>

            <!-- Inline Badge -->
            <ngx-button variant="secondary" badge="Updated" badgeVariant="success" badgePosition="inline">
              Changelog
            </ngx-button>

            <!-- Toggle Selected State -->
            <ngx-button variant="info" [selected]="selectedState()" (click)="selectedState.set(!selectedState())">
              {{ selectedState() ? '✓ Added to Cart' : '+ Add to Cart' }}
            </ngx-button>

            <!-- Custom Icon Libraries (Projected Inline SVGs) -->
            <ngx-button variant="success">
              <svg prefix viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              </svg>
              Projected SVG Folder
            </ngx-button>

            <ngx-button variant="danger">
              <svg prefix viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
              Delete Item
            </ngx-button>

            <ngx-button variant="ghost">
              Next Step
              <svg suffix viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 4px;">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </ngx-button>

            <!-- Full Width / Block Layout -->
            <div style="width: 280px; padding: 16px; border: 1px solid var(--border-color); border-radius: 10px; background: var(--bg-secondary); box-shadow: var(--shadow-sm);">
              <span style="font-size: 11px; font-weight: 750; color: var(--text-secondary); display: block; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px;">Login Card (Block layout)</span>
              <ngx-button [fullWidth]="true" variant="primary" size="md">Sign In</ngx-button>
            </div>
          </div>

          <div class="section-label">Button Groups</div>
          <div class="demo-row">
            <ngx-button-group>
              <ngx-button variant="secondary">Left</ngx-button>
              <ngx-button variant="secondary">Center</ngx-button>
              <ngx-button variant="secondary">Right</ngx-button>
            </ngx-button-group>
          </div>
          <div class="demo-row" style="margin-top:12px">
            <ngx-button-group [vertical]="true">
              <ngx-button variant="secondary">Top</ngx-button>
              <ngx-button variant="secondary">Middle</ngx-button>
              <ngx-button variant="secondary">Bottom</ngx-button>
            </ngx-button-group>
          </div>

          <div class="section-label">Chips</div>
          <div class="demo-row wrap">
            <ngx-chip label="Default" />
            <ngx-chip label="Info" variant="info" />
            <ngx-chip label="Success" variant="success" />
            <ngx-chip label="Warning" variant="warning" />
            <ngx-chip label="Danger" variant="danger" />
            <ngx-chip label="Outlined" variant="outlined" />
            <ngx-chip label="Removable" [removable]="true" (removed)="onRemove()" />
            <ngx-chip label="Selectable" [selectable]="true" />
          </div>

          <div class="section-label">Chip List</div>
          <ngx-chip-list>
            @for (tag of tags(); track tag) {
              <ngx-chip [label]="tag" [removable]="true" (removed)="removeTag(tag)" variant="info" />
            }
          </ngx-chip-list>

          <div class="section-label">Split Button</div>
          <div class="demo-row">
            <ngx-split-button
              [items]="splitItems"
              (mainClicked)="log('split-main')"
              (itemClicked)="log('split:' + ($event.label ?? $event.text ?? 'item'))"
            >Save</ngx-split-button>
          </div>

          <div class="section-label">Dropdown Button</div>
          <div class="demo-row">
            <ngx-dropdown-button
              label="Actions"
              [items]="dropdownItems"
              (itemClicked)="log($event.label ?? $event.text ?? 'item')"
            />
          </div>

          @if (lastAction()) {
            <div class="demo-log">Last action: {{ lastAction() }}</div>
          }

          <div class="section-label">How to Use</div>
          <pre style="margin:0;background:#1e1e1e;color:#d4d4d4;padding:16px;border-radius:8px;font-size:12px;line-height:1.5;overflow:auto">{{ howToCode }}</pre>
        </div>
      }

      <!-- ===== SPEED DIAL FAB ===== -->
      @if (activeTab() === 'Speed Dial FAB') {
        <div class="tab-content">
          <div class="section-label">Floating Action Button (FAB) Speed Dial Demos</div>
          
          <div class="playground-card" style="min-height: 380px; position: relative;">
            <div class="playground-preview" style="height: 300px; display: flex; align-items: center; justify-content: center; gap: 40px; position: relative;">
              
              <!-- TOP DIRECTION -->
              <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                <span style="font-size: 11px; font-weight: 750; color: var(--text-secondary);">Top FAB</span>
                <ngx-speed-dial
                  [items]="speedDialItems"
                  direction="top"
                  theme="primary"
                  (itemClick)="onSpeedDialClick($event)"
                />
              </div>

              <!-- BOTTOM DIRECTION -->
              <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                <span style="font-size: 11px; font-weight: 750; color: var(--text-secondary);">Bottom FAB</span>
                <ngx-speed-dial
                  [items]="speedDialItems"
                  direction="bottom"
                  theme="accent"
                  (itemClick)="onSpeedDialClick($event)"
                />
              </div>

              <!-- LEFT DIRECTION -->
              <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                <span style="font-size: 11px; font-weight: 750; color: var(--text-secondary);">Left FAB</span>
                <ngx-speed-dial
                  [items]="speedDialItems"
                  direction="left"
                  theme="dark"
                  (itemClick)="onSpeedDialClick($event)"
                />
              </div>

              <!-- RIGHT DIRECTION -->
              <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                <span style="font-size: 11px; font-weight: 750; color: var(--text-secondary);">Right FAB</span>
                <ngx-speed-dial
                  [items]="speedDialItems"
                  direction="right"
                  theme="secondary"
                  (itemClick)="onSpeedDialClick($event)"
                />
              </div>

            </div>
            
            <div class="playground-controls" style="border-top: 1px solid var(--border-color);">
              @if (lastSpeedDialAction()) {
                <div class="demo-log" style="margin: 0;">
                  Last Action Triggered: <strong>{{ lastSpeedDialAction() }}</strong>
                </div>
              } @else {
                <div style="font-size: 12px; color: var(--text-secondary); text-align: center; padding: 4px;">
                  Hover or click one of the Floating Action Buttons above to expand sub-menu commands.
                </div>
              }
            </div>
          </div>

          <div class="section-label">How to Use</div>
          <pre class="code-block" style="background:#1e1e2e;color:#a6e3a1;border-radius:8px;padding:16px 20px;font-size:12px;line-height:1.6;overflow-x:auto;">{{ speedDialHowToCode }}</pre>

          <div class="section-label">API Reference — Inputs</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input / Output</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of speedDialApi; track row.name) {
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
          <div class="section-label">Button</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input / Output</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of buttonApi; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>

          <div class="section-label">Button Group</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input / Output</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of buttonGroupApi; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>

          <div class="section-label">Chip</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input / Output</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of chipApi; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>

          <div class="section-label">Chip List</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input / Output</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of chipListApi; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>

          <div class="section-label">Split Button</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input / Output</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of splitButtonApi; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>

          <div class="section-label">Dropdown Button</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input / Output</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of dropdownApi; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>

          <div class="section-label">Speed Dial FAB</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input / Output</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of speedDialApi; track row.name) {
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
    .badge-blue { background: linear-gradient(135deg, #e8f0fe 0%, #d1e3ff 100%); color: #1a73e8; border: 1px solid rgba(26, 115, 232, 0.1); }
    .tab-nav { display: flex; gap: 0; border-bottom: 2px solid #e9ecef; overflow-x: auto; padding-bottom: 0; }
    .tab-btn { padding: 12px 20px; background: none; border: none; font-size: 13px; font-weight: 500; color: #6c757d; cursor: pointer; border-bottom: 3px solid transparent; margin-bottom: -2px; font-family: inherit; transition: all 0.2s ease; white-space: nowrap; }
    .tab-btn:hover { color: #495057; background: rgba(26, 115, 232, 0.05); }
    .tab-btn.active { color: #1a73e8; border-bottom-color: #1a73e8; font-weight: 600; background: rgba(26, 115, 232, 0.04); }
    .tab-content { display: flex; flex-direction: column; gap: 20px; }
    .section-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; color: #8892a0; border-bottom: 2px solid #e9ecef; padding-bottom: 12px; }
    .demo-row { display: flex; gap: 10px; flex-wrap: wrap; align-items: flex-start; }
    .demo-row.align-center { align-items: center; }
    .demo-row.wrap { flex-wrap: wrap; }
    .demo-trigger { padding: 6px 14px; font-size: 13px; border: 1px solid #dee2e6; border-radius: 4px; cursor: pointer; background: #f8f9fa; transition: all 0.2s ease; }
    .demo-trigger:hover { background: #e9ecef; }
    .demo-log { background: linear-gradient(135deg, #f8f9fa 0%, #f3f5f9 100%); border: 1px solid #e0e5ed; border-radius: 8px; padding: 12px 16px; font-size: 12px; font-family: monospace; color: #495057; border-left: 3px solid #1a73e8; }
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
    
    /* Playground Styles */
    .playground-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-md);
      margin-bottom: 24px;
    }
    .playground-preview {
      padding: 32px;
      background: linear-gradient(135deg, rgba(79, 70, 229, 0.02) 0%, rgba(124, 58, 237, 0.02) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      border-bottom: 1px solid var(--border-color);
      min-height: 120px;
    }
    .preview-box {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .playground-controls {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
    }
    .control-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .control-group label {
      font-size: 11px;
      font-weight: 700;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .control-input, .playground-controls select {
      padding: 8px 12px;
      font-size: 13px;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      background: var(--bg-primary);
      color: var(--text-primary);
      outline: none;
      transition: all 0.2s;
    }
    .control-input:focus, .playground-controls select:focus {
      border-color: var(--primary-color);
      box-shadow: var(--shadow-glow);
    }
    .control-group-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;
    }
    .control-checkboxes {
      display: flex;
      gap: 20px;
      margin-top: 8px;
    }
    .control-checkbox {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-primary);
      cursor: pointer;
    }
    .control-checkbox input {
      cursor: pointer;
    }
    .playground-code-block {
      padding: 16px 20px;
      background: #0f172a;
      color: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .playground-code-block pre {
      margin: 0;
      font-family: 'Cascadia Code', Consolas, monospace;
      font-size: 12px;
      overflow-x: auto;
      flex: 1;
    }
    .copy-btn {
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 600;
      border: 1px solid rgba(255,255,255,0.15);
      background: rgba(255,255,255,0.08);
      color: #ffffff;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      flex-shrink: 0;
    }
    .copy-btn:hover {
      background: rgba(255,255,255,0.15);
      border-color: rgba(255,255,255,0.3);
    }
    .copy-btn:active {
      transform: scale(0.96);
    }
  `]
})
export class ButtonsDemoComponent {
  activeTab = signal('Demo');
  tabs = ['Demo', 'Speed Dial FAB', 'API Reference'];
  loading = signal(false);
  lastAction = signal('');
  tags = signal(['Angular', 'TypeScript', 'Enterprise', 'UI Library']);

  // Playground Signals
  playgroundVariant = signal<'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'ghost' | 'link'>('primary');
  playgroundSize = signal<'sm' | 'md' | 'lg'>('md');
  playgroundShape = signal<'rectangle' | 'rounded' | 'pill'>('rounded');
  playgroundDisabled = signal(false);
  playgroundLoading = signal(false);
  playgroundPrefixIcon = signal('');
  playgroundSuffixIcon = signal('');
  playgroundText = signal('Interactive Button');

  // Enterprise features playground signals
  playgroundRipple = signal(true);
  playgroundFullWidth = signal(false);
  playgroundSelected = signal(false);
  playgroundBadge = signal('5');
  playgroundBadgePosition = signal<'top-right' | 'inline'>('top-right');
  playgroundBadgeVariant = signal<'danger' | 'warning' | 'info' | 'success'>('danger');

  selectedState = signal(false);

  playgroundCode = computed(() => {
    let code = `<ngx-button`;
    if (this.playgroundVariant() !== 'primary') code += ` variant="${this.playgroundVariant()}"`;
    if (this.playgroundSize() !== 'md') code += ` size="${this.playgroundSize()}"`;
    if (this.playgroundShape() !== 'rounded') code += ` shape="${this.playgroundShape()}"`;
    if (this.playgroundDisabled()) code += ` [disabled]="${this.playgroundDisabled()}"`;
    if (this.playgroundLoading()) code += ` [loading]="${this.playgroundLoading()}"`;
    if (this.playgroundPrefixIcon()) code += ` prefixIcon="${this.playgroundPrefixIcon()}"`;
    if (this.playgroundSuffixIcon()) code += ` suffixIcon="${this.playgroundSuffixIcon()}"`;
    if (!this.playgroundRipple()) code += ` [ripple]="false"`;
    if (this.playgroundFullWidth()) code += ` [fullWidth]="true"`;
    if (this.playgroundSelected()) code += ` [selected]="true"`;
    if (this.playgroundBadge()) {
      code += ` badge="${this.playgroundBadge()}"`;
      if (this.playgroundBadgePosition() !== 'top-right') code += ` badgePosition="${this.playgroundBadgePosition()}"`;
      if (this.playgroundBadgeVariant() !== 'danger') code += ` badgeVariant="${this.playgroundBadgeVariant()}"`;
    }
    code += `>${this.playgroundText()}</ngx-button>`;
    return code;
  });

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text);
    this.log('Copied code to clipboard: ' + text);
  }

  howToCode = `<!-- 1. Custom SVG Icon via Content Projection (Use 'prefix' or 'suffix' attributes) -->
<ngx-button variant="success">
  <svg prefix viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
  </svg>
  Projected SVG Folder
</ngx-button>

<!-- 2. Google Material Icon via Content Projection -->
<ngx-button variant="info">
  <span prefix class="material-icons">star</span>
  Favorite
</ngx-button>

<!-- 3. FontAwesome / Bootstrap class string via Input Binding (Auto-detected) -->
<ngx-button variant="warning" prefixIcon="fa-solid fa-triangle-exclamation">
  Warning Alert
</ngx-button>

<!-- 4. Enterprise badge, ripple, block (fullWidth), and selected states -->
<ngx-button variant="primary" badge="9+" badgeVariant="danger" [ripple]="true" [fullWidth]="true">
  Notifications
</ngx-button>`;

  splitItems = [{ label: 'Save Draft', icon: '📝' }, { label: 'Save & Publish', icon: '🚀' }, { separator: true }, { label: 'Discard Changes', icon: '🗑' }];
  dropdownItems = [{ label: 'Edit', icon: '✏️' }, { label: 'Duplicate', icon: '📋' }, { label: 'Archive', icon: '📦' }, { separator: true }, { label: 'Delete', icon: '🗑', variant: 'danger' }];

  // ===== SPEED DIAL STATE =====
  speedDialItems: SpeedDialItem[] = [
    { id: 'share', icon: '🔗', label: 'Share Link' },
    { id: 'email', icon: '✉️', label: 'Send Email' },
    { id: 'print', icon: '🖨️', label: 'Print Page' },
    { id: 'delete', icon: '🗑️', label: 'Delete Item' }
  ];

  lastSpeedDialAction = signal('');
  onSpeedDialClick(item: SpeedDialItem): void {
    this.lastSpeedDialAction.set(`"${item.label}" (id: ${item.id})`);
  }

  speedDialHowToCode = `import { Component } from '@angular/core';
import { SpeedDialComponent, SpeedDialItem } from 'ngx-core-components/buttons';

@Component({
  selector: 'app-my-fab',
  standalone: true,
  imports: [SpeedDialComponent],
  template: \`
    <ngx-speed-dial
      [items]="items"
      direction="top"
      theme="primary"
      (itemClick)="onAction($event)"
    />
  \`
})
export class MyFabComponent {
  items: SpeedDialItem[] = [
    { id: 'share', icon: '🔗', label: 'Share Link' },
    { id: 'email', icon: '✉️', label: 'Send Email' }
  ];

  onAction(item: SpeedDialItem) {
    console.log('Action clicked:', item);
  }
}`;

  // ===== API REFERENCE =====
  buttonApi: ApiRow[] = [
    { name: 'variant', type: "'primary'|'secondary'|'success'|'danger'|'warning'|'info'|'ghost'|'link'", default: "'primary'", description: 'Visual style of the button.' },
    { name: 'size', type: "'sm'|'md'|'lg'", default: "'md'", description: 'Button size.' },
    { name: 'shape', type: "'rectangle'|'rounded'|'pill'|'square'", default: "'rounded'", description: 'Button shape configuration.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable button interaction.' },
    { name: 'loading', type: 'boolean', default: 'false', description: 'Show loading spinner and disable clicks.' },
    { name: 'prefixIcon', type: 'string', default: 'undefined', description: 'Icon displayed before the label (can be a unicode/emoji character or CSS class like fa-solid fa-rocket).' },
    { name: 'suffixIcon', type: 'string', default: 'undefined', description: 'Icon displayed after the label (can be a unicode/emoji character or CSS class).' },
    { name: 'ripple', type: 'boolean', default: 'true', description: 'Enables the interactive material click ripple effect.' },
    { name: 'fullWidth', type: 'boolean', default: 'false', description: 'Makes the button span 100% width of its container.' },
    { name: 'selected', type: 'boolean', default: 'false', description: 'Toggles the active/selected style state.' },
    { name: 'badge', type: 'string | number', default: "''", description: 'Badge label value displayed on the button.' },
    { name: 'badgePosition', type: "'top-right'|'inline'", default: "'top-right'", description: 'Where to position the badge on the button.' },
    { name: 'badgeVariant', type: "'danger'|'warning'|'info'|'success'", default: "'danger'", description: 'Badge theme accent color.' },
    { name: 'click', type: 'Output<void>', default: 'n/a', description: 'Emitted when button is clicked.' },
  ];

  buttonGroupApi: ApiRow[] = [
    { name: 'vertical', type: 'boolean', default: 'false', description: 'Stack buttons vertically instead of horizontally.' },
  ];

  chipApi: ApiRow[] = [
    { name: 'label', type: 'string', default: 'undefined', description: 'Text to display on the chip.' },
    { name: 'variant', type: "'default'|'info'|'success'|'warning'|'error'|'danger'|'outlined'", default: "'default'", description: 'Visual style of the chip.' },
    { name: 'icon', type: 'string', default: 'undefined', description: 'Icon to display before the label.' },
    { name: 'removable', type: 'boolean', default: 'false', description: 'Show remove button (X).' },
    { name: 'selectable', type: 'boolean', default: 'false', description: 'Enable selection on click.' },
    { name: 'selected', type: 'boolean', default: 'false', description: 'Initial selected state.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable chip interaction.' },
    { name: 'removed', type: 'Output<void>', default: 'n/a', description: 'Emitted when remove button is clicked.' },
    { name: 'selectionChange', type: 'Output<boolean>', default: 'n/a', description: 'Emitted when selection state changes.' },
  ];

  chipListApi: ApiRow[] = [
    { name: 'wrap', type: 'boolean', default: 'true', description: 'Allows chips to wrap to multiple lines when space runs out.' },
  ];

  splitButtonApi: ApiRow[] = [
    { name: 'variant', type: "'primary'|'secondary'|'success'|'danger'|'warning'|'info'|'ghost'|'link'", default: "'primary'", description: 'Visual style of the main action button.' },
    { name: 'size', type: "'sm'|'md'|'lg'", default: "'md'", description: 'Size of the main button and arrow trigger.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables both the main action and the menu trigger.' },
    { name: 'loading', type: 'boolean', default: 'false', description: 'Shows the loading state on the main button.' },
    { name: 'items', type: 'SplitButtonItem[]', default: '[]', description: 'Menu items displayed from the split arrow.' },
    { name: '(mainClicked)', type: 'MouseEvent', default: 'n/a', description: 'Emitted when the primary action button is clicked.' },
    { name: '(itemClicked)', type: 'SplitButtonItem', default: 'n/a', description: 'Emitted when a menu item is selected.' },
  ];

  dropdownApi: ApiRow[] = [
    { name: 'variant', type: "'primary'|'secondary'|'success'|'danger'|'warning'|'info'|'ghost'|'link'", default: "'secondary'", description: 'Visual style of the dropdown button.' },
    { name: 'size', type: "'sm'|'md'|'lg'", default: "'md'", description: 'Size of the dropdown button.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the dropdown button.' },
    { name: 'items', type: 'DropDownButtonItem[]', default: '[]', description: 'Menu items shown when the button opens.' },
    { name: '(itemClicked)', type: 'DropDownButtonItem', default: 'n/a', description: 'Emitted when a dropdown menu item is selected.' },
  ];

  speedDialApi: ApiRow[] = [
    { name: 'items', type: 'SpeedDialItem[]', default: 'required', description: 'Array of sub-action items shown when expanded.' },
    { name: 'icon', type: 'string', default: "'+'", description: 'Trigger button icon when collapsed.' },
    { name: 'activeIcon', type: 'string', default: "'✕'", description: 'Trigger button icon when expanded.' },
    { name: 'direction', type: "'top'|'bottom'|'left'|'right'", default: "'top'", description: 'Direction in which the speed dial items expand.' },
    { name: 'theme', type: "'primary'|'secondary'|'accent'|'dark'", default: "'primary'", description: 'Color theme of the main floating trigger button.' },
    { name: 'showLabels', type: 'boolean', default: 'true', description: 'Show textual hints next to the sub-action buttons (only supported in vertical layouts).' },
    { name: 'closeOnSelect', type: 'boolean', default: 'true', description: 'Collapses the menu automatically once any action is clicked.' },
    { name: 'collapseOnLeaveMouse', type: 'boolean', default: 'true', description: 'Collapses the menu automatically when the mouse leaves the FAB container.' },
    { name: '(itemClick)', type: 'Output<SpeedDialItem>', default: 'n/a', description: 'Emitted when a sub-action item is clicked.' }
  ];

  log(msg: string): void { this.lastAction.set(msg); }
  onRemove(label?: string): void { this.lastAction.set('Removed chip: ' + (label ?? 'chip')); }
  removeTag(tag: string): void { this.tags.update(t => t.filter(x => x !== tag)); }
}
