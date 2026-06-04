import { Component, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  CardComponent, 
  TabStripComponent, 
  TabComponent, 
  AccordionComponent, 
  AccordionItemComponent, 
  AccordionItem,
  StepperComponent, 
  NgxStepContentDirective,
  StepperStep, 
  SplitterComponent 
} from 'ngx-core-components/layout';

interface ApiRow { name: string; type: string; default: string; description: string; }

@Component({
  selector: 'app-layout-demo',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    CardComponent, 
    TabStripComponent, 
    TabComponent, 
    AccordionComponent, 
    AccordionItemComponent, 
    StepperComponent, 
    NgxStepContentDirective,
    SplitterComponent
  ],
  template: `
    <div class="demo-page">
      <!-- Page Header -->
      <div class="page-header">
        <div class="page-header-text">
          <h1>Layout Components</h1>
          <p>Premium card variants, flexible tabs with custom positions/closures, animatable accordions with content projection, and steppers with templates.</p>
        </div>
        <div class="header-badges">
          <span class="badge badge-purple">Signals-Driven</span>
          <span class="badge badge-blue">Zero Dependencies</span>
          <span class="badge badge-green">v1.2.0</span>
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
        <div class="demo-content-wrap">
          
          <!-- 1. CARDS DEMO -->
          <section class="demo-section">
            <div class="section-title-row">
              <h2 class="section-heading">1. Cards & Glassmorphism</h2>
              <span class="section-badge">Premium UI</span>
            </div>
            <p class="section-desc">Supports hover lifts, outlines, elevations, and a backdrop-blur glass variant. Toggle background styles to preview the glass effect.</p>
            
            <div class="bg-selector">
              <label>Background Theme:</label>
              <div class="theme-buttons">
                <button class="theme-btn sunset" [class.active]="cardBgTheme() === 'sunset'" (click)="cardBgTheme.set('sunset')">Sunset Glow</button>
                <button class="theme-btn ocean" [class.active]="cardBgTheme() === 'ocean'" (click)="cardBgTheme.set('ocean')">Ocean Breeze</button>
                <button class="theme-btn aurora" [class.active]="cardBgTheme() === 'aurora'" (click)="cardBgTheme.set('aurora')">Northern Lights</button>
                <button class="theme-btn dark" [class.active]="cardBgTheme() === 'dark'" (click)="cardBgTheme.set('dark')">Midnight Space</button>
              </div>
            </div>

            <div class="card-demo-container" [class]="'bg-' + cardBgTheme()">
              <div class="card-grid">
                <ngx-card title="Default Card" subtitle="Standard card layout">
                  <p>Simple default variant using standard borders and clean padding rules.</p>
                  <div cardFooter class="demo-footer">
                    <button class="footer-btn">Action</button>
                  </div>
                </ngx-card>
                
                <ngx-card title="Elevated Premium" subtitle="Soft shadows" variant="elevated" [hoverable]="true">
                  <p>Uses soft shadows and lifts on hover with a smooth scale-up effect.</p>
                  <div cardFooter class="demo-footer">
                    <button class="footer-btn primary">Explore</button>
                  </div>
                </ngx-card>
                
                <ngx-card title="Glassmorphic Card" subtitle="variant='glass'" variant="glass" [hoverable]="true">
                  <p>Applies a backdrop filter blur, translucent borders, and soft inner shadows that look best over vibrant gradients.</p>
                  <div cardActions>
                    <span class="status-indicator">Active</span>
                  </div>
                  <div cardFooter class="demo-footer">
                    <button class="footer-btn glass-btn">Apply</button>
                  </div>
                </ngx-card>
              </div>
            </div>
          </section>

          <!-- 2. TAB STRIP DEMO -->
          <section class="demo-section">
            <div class="section-title-row">
              <h2 class="section-heading">2. Tab Strip Navigation</h2>
              <span class="section-badge">4 Positions & Closable</span>
            </div>
            <p class="section-desc">Supports Top, Bottom, Left, and Right alignments, dynamic close actions, and an animated sliding selection indicator.</p>
            
            <div class="control-row">
              <div class="control-group">
                <label>Position Alignment:</label>
                <select [ngModel]="tabPosition()" (ngModelChange)="tabPosition.set($event)" class="demo-select">
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>
              <div class="control-group">
                <button class="action-btn" (click)="resetTabs()">Reset Dynamic Tabs</button>
              </div>
            </div>

            <div class="demo-tabs-container">
              <ngx-tab-strip [position]="tabPosition()" (tabChange)="logTabChange($event)" (tabClose)="onTabClose($event)">
                @for (tab of dynamicTabs(); track tab.id) {
                  <ngx-tab [title]="tab.title" [icon]="tab.icon" [closable]="tab.closable" [badge]="tab.badge || ''">
                    <div class="tab-inner-content">
                      <h3>{{ tab.title }}</h3>
                      <p>{{ tab.content }}</p>
                      @if (tab.closable) {
                        <div class="alert alert-info">This tab is marked as closable. Click the × button to close it.</div>
                      }
                    </div>
                  </ngx-tab>
                }
              </ngx-tab-strip>
            </div>

            @if (tabLogs().length > 0) {
              <div class="log-panel">
                <div class="log-header">Logs:</div>
                <div class="log-lines">
                  @for (log of tabLogs().slice(-3); track log) {
                    <div class="log-line">{{ log }}</div>
                  }
                </div>
              </div>
            }
          </section>

          <!-- 3. ACCORDION DEMO -->
          <section class="demo-section">
            <div class="section-title-row">
              <h2 class="section-heading">3. Animated Accordion</h2>
              <span class="section-badge">Content Projection</span>
            </div>
            <p class="section-desc">Features smooth height-expanding CSS transitions, rotating SVG chevrons, and declarative child components.</p>
            
            <div class="control-row flex-wrap">
              <button class="action-btn" (click)="accordionRef.expandAll()">Expand All</button>
              <button class="action-btn" (click)="accordionRef.collapseAll()">Collapse All</button>
              <button class="action-btn" (click)="accordionRef.expandItem(0)">Expand Item 1</button>
              <button class="action-btn" (click)="accordionRef.collapseItem(0)">Collapse Item 1</button>
              <label class="toggle-label">
                <input type="checkbox" [ngModel]="accordionMulti()" (ngModelChange)="accordionMulti.set($event)" />
                Allow Multi Expand
              </label>
            </div>

            <div class="accordion-demo-container">
              <ngx-accordion #accordionRef [multi]="accordionMulti()">
                <ngx-accordion-item title="Project Status" icon="📊" [expanded]="true">
                  <div class="accordion-projected-content">
                    <h4>System Analytics Dashboard</h4>
                    <p>Project details can contain rich structured content, grids, charts, and buttons.</p>
                    <div class="mini-stats">
                      <div class="stat-card"><h5>12</h5><p>Active tasks</p></div>
                      <div class="stat-card"><h5>98%</h5><p>System uptime</p></div>
                      <div class="stat-card"><h5>4.8ms</h5><p>Response latency</p></div>
                    </div>
                  </div>
                </ngx-accordion-item>

                <ngx-accordion-item title="Team Assignments" icon="👥">
                  <div class="accordion-projected-content">
                    <p>Below is a list of team assignments for this cycle:</p>
                    <ul class="team-list">
                      <li>👩‍💻 <strong>Sarah K.</strong> - Lead Architect</li>
                      <li>👨‍💻 <strong>Alex M.</strong> - Frontend Developer</li>
                      <li>👩‍🎨 <strong>Jessica P.</strong> - UX Designer</li>
                    </ul>
                  </div>
                </ngx-accordion-item>

                <ngx-accordion-item title="Security Settings" icon="🔒">
                  <div class="accordion-projected-content">
                    <p>Adjust security parameters directly within this accordion item panel:</p>
                    <div class="settings-form">
                      <label><input type="checkbox" checked /> Require MFA for all admins</label>
                      <label><input type="checkbox" /> Restrict access to corporate IP range</label>
                    </div>
                  </div>
                </ngx-accordion-item>
              </ngx-accordion>
            </div>
          </section>

          <!-- 4. STEPPER DEMO -->
          <section class="demo-section">
            <div class="section-title-row">
              <h2 class="section-heading">4. Stepper with custom step templates</h2>
              <span class="section-badge">ngxStepContent Directive</span>
            </div>
            <p class="section-desc">Navigate steps interactively. When linear is true, users can only skip back or advance to the next step consecutively.</p>

            <div class="control-row">
              <label class="toggle-label">
                <input type="checkbox" [ngModel]="stepperLinear()" (ngModelChange)="stepperLinear.set($event)" />
                Linear Progress Enforced
              </label>
              <span class="active-step-badge">Active Step Index: {{ activeStepIdx() }}</span>
            </div>

            <div class="stepper-demo-layout">
              <ngx-stepper 
                [steps]="stepperSteps()" 
                [linear]="stepperLinear()" 
                (stepChange)="activeStepIdx.set($event)"
              >
                <!-- Step 1 Template -->
                <ng-template [ngxStepContent]="0">
                  <div class="step-form">
                    <h3>Personal Credentials</h3>
                    <p>Provide your account registration information below.</p>
                    <div class="form-group">
                      <label class="form-label">Full Name</label>
                      <input type="text" [ngModel]="stepFormName()" (ngModelChange)="stepFormName.set($event)" placeholder="e.g. John Doe" class="demo-input" />
                    </div>
                    <div class="form-group">
                      <label class="form-label">Email Address</label>
                      <input type="email" [ngModel]="stepFormEmail()" (ngModelChange)="stepFormEmail.set($event)" placeholder="e.g. john@example.com" class="demo-input" />
                    </div>
                  </div>
                </ng-template>

                <!-- Step 2 Template -->
                <ng-template [ngxStepContent]="1">
                  <div class="step-form">
                    <h3>Organization Configuration</h3>
                    <p>Select the type of account context that matches your scale.</p>
                    <div class="radio-group">
                      <label class="radio-label">
                        <input type="radio" name="orgType" value="Individual" [ngModel]="stepFormOrgType()" (ngModelChange)="stepFormOrgType.set($event)" />
                        <span><strong>Individual</strong> - Just for personal side-projects</span>
                      </label>
                      <label class="radio-label">
                        <input type="radio" name="orgType" value="Startup" [ngModel]="stepFormOrgType()" (ngModelChange)="stepFormOrgType.set($event)" />
                        <span><strong>Startup / Small Business</strong> - Collaborative team up to 20</span>
                      </label>
                      <label class="radio-label">
                        <input type="radio" name="orgType" value="Enterprise" [ngModel]="stepFormOrgType()" (ngModelChange)="stepFormOrgType.set($event)" />
                        <span><strong>Enterprise Scale</strong> - Global multi-region organization</span>
                      </label>
                    </div>
                  </div>
                </ng-template>

                <!-- Step 3 Template -->
                <ng-template [ngxStepContent]="2">
                  <div class="step-form">
                    <h3>Optional Notes</h3>
                    <p>Provide any auxiliary notes for configuration.</p>
                    <div class="form-group">
                      <label class="form-label">Notes (optional)</label>
                      <textarea [ngModel]="stepFormNotes()" (ngModelChange)="stepFormNotes.set($event)" placeholder="Tell us more details..." class="demo-textarea" rows="3"></textarea>
                    </div>
                  </div>
                </ng-template>

                <!-- Step 4 Template -->
                <ng-template [ngxStepContent]="3">
                  <div class="step-form text-center">
                    <h3>Review & Complete</h3>
                    <div class="review-box">
                      <div class="review-row"><strong>Name:</strong> <span>{{ stepFormName() || 'Not set' }}</span></div>
                      <div class="review-row"><strong>Email:</strong> <span>{{ stepFormEmail() || 'Not set' }}</span></div>
                      <div class="review-row"><strong>Org Type:</strong> <span>{{ stepFormOrgType() }}</span></div>
                      <div class="review-row"><strong>Notes:</strong> <span>{{ stepFormNotes() || 'None' }}</span></div>
                    </div>
                    <button class="launch-btn" (click)="triggerLaunch()">🚀 Launch Application</button>
                  </div>
                </ng-template>
              </ngx-stepper>
            </div>
          </section>

          <!-- 5. SPLITTER DEMO -->
          <section class="demo-section">
            <div class="section-title-row">
              <h2 class="section-heading">5. Resize Splitter</h2>
              <span class="section-badge">Layout Splitter</span>
            </div>
            <p class="section-desc">Drag the separator line between the left and right panels to dynamically redistribute the width.</p>
            
            <div class="splitter-demo-wrapper">
              <ngx-splitter [size]="splitterSize()" [min]="160" (sizeChange)="splitterSize.set($event)">
                <div pane1 style="padding:16px;background:#f8fafc;height:100%">
                  <strong>Left Panel</strong>
                  <p style="font-size:13px;color:#64748b">Drag the divider bar to adjust panel widths interactively.</p>
                </div>
                <div pane2 style="padding:16px;height:100%;background:#ffffff">
                  <strong>Right Panel</strong>
                  <p style="font-size:13px;color:#64748b">The right pane automatically grows or shrinks to fill the remaining area.</p>
                </div>
              </ngx-splitter>
            </div>
            <div class="splitter-label">Current Left Pane Width: {{ splitterSize() }}</div>
          </section>

          <section class="demo-section">
            <div class="section-title-row">
              <h2 class="section-heading">How to Use</h2>
            </div>
            <pre class="code-preview">{{ howToCode }}</pre>
          </section>

        </div>
      }

      <!-- ===== API REFERENCE ===== -->
      @if (activeTab() === 'API Reference') {
        <div class="tab-content">
          <div class="section-label">Card</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input / Output</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of cardApi; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>

          <div class="section-label">TabStrip & Tab</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input / Output</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of tabApi; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>

          <div class="section-label">Accordion & Accordion Item</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input / Output</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of accordionApi; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>

          <div class="section-label">Stepper</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input / Output</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of stepperApi; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>

          <div class="section-label">Splitter</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input / Output</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of splitterApi; track row.name) {
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
    :host { display: flex; flex-direction: column; height: 100%; overflow-y: auto; background: #fafbfc; }
    .demo-page { padding: 32px 40px; max-width: 1100px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: 28px; }
    
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; padding-bottom: 24px; border-bottom: 1px solid #e2e8f0; }
    .page-header-text h1 { margin: 0 0 8px; font-size: 32px; font-weight: 800; color: #0f172a; letter-spacing: -0.8px; }
    .page-header-text p { margin: 0; font-size: 14px; color: #64748b; line-height: 1.7; max-width: 700px; }
    .header-badges { display: flex; gap: 8px; flex-shrink: 0; flex-wrap: wrap; }
    
    .badge { font-size: 11px; font-weight: 700; padding: 6px 12px; border-radius: 16px; text-transform: uppercase; letter-spacing: 0.5px; }
    .badge-purple { background: #f3e8ff; color: #6b21a8; border: 1px solid #e9d5ff; }
    .badge-blue { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }
    .badge-green { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
    
    .tab-nav { display: flex; gap: 4px; border-bottom: 1px solid #e2e8f0; padding-bottom: 0; margin-bottom: 8px; }
    .tab-btn { padding: 12px 24px; background: none; border: none; font-size: 14px; font-weight: 600; color: #64748b; cursor: pointer; border-bottom: 3px solid transparent; margin-bottom: -2px; font-family: inherit; transition: all 0.2s ease; outline: none; }
    .tab-btn:hover { color: #0f172a; }
    .tab-btn.active { color: #1a73e8; border-bottom-color: #1a73e8; font-weight: 700; }
    
    .demo-content-wrap { display: flex; flex-direction: column; gap: 32px; }
    .demo-section { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
    
    .section-title-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
    .section-heading { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0; }
    .section-badge { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 4px; background: #f1f5f9; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; }
    .section-desc { font-size: 13px; color: #64748b; line-height: 1.5; margin: 0 0 20px 0; }
    
    /* Background gradients selector for glass card */
    .bg-selector { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; font-size: 13px; font-weight: 600; color: #475569; }
    .theme-buttons { display: flex; gap: 6px; }
    .theme-btn { border: 1px solid #cbd5e1; padding: 6px 12px; font-size: 12px; font-weight: 600; border-radius: 6px; cursor: pointer; transition: all 0.2s; background: #fff; color: #334155; }
    .theme-btn:hover { border-color: #94a3b8; }
    .theme-btn.active { border-color: #1a73e8; background: #f0f7ff; color: #1a73e8; box-shadow: 0 0 0 1px #1a73e8; }
    
    .card-demo-container { padding: 24px; border-radius: 12px; transition: all 0.3s ease; }
    .bg-sunset { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%); }
    .bg-ocean { background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%); }
    .bg-aurora { background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%); }
    .bg-dark { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); }
    .bg-dark ngx-card:not([variant="glass"]) { --ngx-card-bg: #1e293b; --ngx-card-text: #e2e8f0; --ngx-card-title-color: #ffffff; --ngx-card-subtitle-color: #94a3b8; --ngx-card-border: #334155; }
    
    .card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
    .demo-footer { display: flex; justify-content: flex-end; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.06); }
    .footer-btn { padding: 6px 14px; font-size: 12px; font-weight: 600; border-radius: 6px; border: 1px solid #cbd5e1; background: #fff; color: #475569; cursor: pointer; transition: all 0.15s; }
    .footer-btn:hover { background: #f8fafc; border-color: #94a3b8; }
    .footer-btn.primary { background: #1a73e8; color: #fff; border-color: #1a73e8; }
    .footer-btn.primary:hover { background: #1557b0; }
    .footer-btn.glass-btn { background: rgba(255,255,255,0.25); color: #0f172a; border-color: rgba(255,255,255,0.3); backdrop-filter: blur(4px); }
    .footer-btn.glass-btn:hover { background: rgba(255,255,255,0.4); }
    .status-indicator { font-size: 11px; font-weight: 700; color: #059669; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 2px 8px; border-radius: 4px; }
    
    .control-row { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; font-size: 13px; font-weight: 600; color: #475569; }
    .control-group { display: flex; align-items: center; gap: 8px; }
    .demo-select { padding: 6px 12px; font-size: 12px; border-radius: 6px; border: 1px solid #cbd5e1; outline: none; background: #fff; }
    .action-btn { padding: 6px 14px; font-size: 12px; font-weight: 600; border-radius: 6px; border: 1px solid #cbd5e1; background: #fff; color: #334155; cursor: pointer; transition: all 0.2s; }
    .action-btn:hover { border-color: #94a3b8; background: #f8fafc; }
    
    .demo-tabs-container { border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; background: #fff; min-height: 240px; }
    .tab-inner-content { padding: 12px 4px; }
    .tab-inner-content h3 { margin: 0 0 8px 0; font-size: 16px; font-weight: 700; color: #0f172a; }
    .tab-inner-content p { font-size: 13px; color: #475569; margin: 0 0 16px 0; line-height: 1.6; }
    .alert { padding: 10px 14px; font-size: 12px; border-radius: 6px; border: 1px solid transparent; }
    .alert-info { background: #eff6ff; color: #1e40af; border-color: #bfdbfe; }
    
    .log-panel { margin-top: 16px; padding: 12px 16px; background: #0f172a; color: #38bdf8; border-radius: 8px; font-family: monospace; font-size: 11px; }
    .log-header { font-weight: 700; text-transform: uppercase; color: #94a3b8; margin-bottom: 6px; font-size: 10px; letter-spacing: 0.5px; }
    .log-line { line-height: 1.5; margin-bottom: 2px; }
    .log-line::before { content: "> "; color: #f43f5e; }
    
    .toggle-label { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; font-weight: 600; color: #475569; }
    .toggle-label input { width: 15px; height: 15px; }
    
    .accordion-demo-container { border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
    .accordion-projected-content { padding: 4px 0; }
    .accordion-projected-content h4 { margin: 0 0 6px 0; font-size: 14px; font-weight: 700; color: #0f172a; }
    .accordion-projected-content p { font-size: 13px; color: #475569; margin: 0 0 16px 0; }
    
    .mini-stats { display: flex; gap: 12px; margin-top: 12px; }
    .stat-card { flex: 1; padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; text-align: center; }
    .stat-card h5 { margin: 0 0 2px 0; font-size: 16px; font-weight: 700; color: #1a73e8; }
    .stat-card p { margin: 0; font-size: 10px; font-weight: 600; color: #64748b; text-transform: uppercase; }
    
    .team-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; font-size: 13px; color: #334155; }
    .team-list li { padding: 6px 12px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0; }
    
    .settings-form { display: flex; flex-direction: column; gap: 10px; margin-top: 8px; }
    .settings-form label { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 500; color: #334155; cursor: pointer; }
    
    .active-step-badge { margin-left: auto; font-size: 11px; font-weight: 700; background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 12px; }
    .stepper-demo-layout { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; }
    
    .step-form { padding: 8px 4px; }
    .step-form h3 { margin: 0 0 6px 0; font-size: 16px; font-weight: 700; color: #0f172a; }
    .step-form p { font-size: 13px; color: #64748b; margin: 0 0 16px 0; }
    .form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; max-width: 400px; }
    .form-label { font-size: 12px; font-weight: 600; color: #475569; }
    .demo-input { padding: 8px 12px; font-size: 13px; border-radius: 6px; border: 1px solid #cbd5e1; outline: none; transition: border-color 0.15s; }
    .demo-input:focus { border-color: #1a73e8; }
    .demo-textarea { padding: 8px 12px; font-size: 13px; border-radius: 6px; border: 1px solid #cbd5e1; outline: none; resize: vertical; }
    
    .radio-group { display: flex; flex-direction: column; gap: 10px; }
    .radio-label { display: flex; align-items: flex-start; gap: 10px; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.15s; }
    .radio-label:hover { border-color: #cbd5e1; background: #f8fafc; }
    .radio-label input { margin-top: 3px; }
    .radio-label span { font-size: 12px; color: #475569; line-height: 1.4; }
    .radio-label span strong { color: #0f172a; display: block; font-size: 13px; margin-bottom: 2px; }
    
    .review-box { max-width: 400px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 16px; background: #f8fafc; }
    .review-row { display: flex; justify-content: space-between; padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
    .review-row:last-child { border-bottom: none; }
    .review-row strong { color: #475569; }
    .review-row span { color: #0f172a; font-weight: 600; }
    .launch-btn { padding: 10px 20px; font-size: 13px; font-weight: 700; border-radius: 8px; border: none; background: #10b981; color: #fff; cursor: pointer; transition: background 0.15s; }
    .launch-btn:hover { background: #059669; }
    .text-center { text-align: center; }
    
    .splitter-demo-wrapper { height: 180px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
    .splitter-label { font-size: 11px; font-weight: 600; color: #64748b; margin-top: 6px; text-align: right; }
    
    .code-preview { margin: 0; background: #0f172a; color: #e2e8f0; padding: 16px; border-radius: 8px; font-size: 12px; line-height: 1.5; overflow: auto; }
    
    .section-label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; color: #475569; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 24px; }
    .api-table-wrap { overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; margin-top: 8px; }
    .api-table { width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; }
    .api-table th { padding: 10px 14px; background: #f8fafc; font-size: 11px; font-weight: 700; color: #475569; border-bottom: 1px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.5px; }
    .api-table td { padding: 10px 14px; border-bottom: 1px solid #f1f5f9; color: #334155; }
    .api-table tr:last-child td { border-bottom: none; }
    .api-name { font-family: monospace; font-weight: 700; color: #1a73e8; }
    .api-type { font-family: monospace; color: #7c3aed; }
    .api-default { font-family: monospace; color: #ea580c; }
  `]
})
export class LayoutDemoComponent {
  activeTab = signal('Demo');
  tabs = ['Demo', 'API Reference'];
  splitterSize = signal('38%');
  cardBgTheme = signal<'sunset' | 'ocean' | 'aurora' | 'dark'>('sunset');
  
  dynamicTabs = signal([
    { id: 1, title: 'Overview', icon: '📋', content: 'Overview panel contents showing Kendo parity components.', closable: true },
    { id: 2, title: 'Analytics', icon: '📊', badge: '3', content: 'Detailed graph dashboard showing CPU & Memory utilization.', closable: true },
    { id: 3, title: 'System Logs', icon: '⚙️', content: 'Raw database query logs and backend exceptions stream.', closable: false }
  ]);
  
  tabPosition = signal<'top' | 'bottom' | 'left' | 'right'>('top');
  tabLogs = signal<string[]>([]);
  accordionMulti = signal(true);
  stepperLinear = signal(true);
  activeStepIdx = signal(0);

  // Form elements inside stepper
  stepFormName = signal('');
  stepFormEmail = signal('');
  stepFormOrgType = signal('Individual');
  stepFormNotes = signal('');

  stepperSteps = signal<StepperStep[]>([
    { label: 'Account Setup', description: 'Personal credentials' },
    { label: 'Organization', description: 'Context scale' },
    { label: 'Optional Notes', description: 'Additional settings', optional: true },
    { label: 'Review & Launch', description: 'Launch validation' }
  ]);

  howToCode = `import { Component } from '@angular/core';
import { CardComponent, AccordionComponent, TabStripComponent, StepperComponent } from 'ngx-core-components/layout';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CardComponent, AccordionComponent, TabStripComponent, StepperComponent],
  template: \`
    <ngx-card title="Overview" variant="glass">Glass Content</ngx-card>

    <ngx-tab-strip position="left">
      <ngx-tab title="Info">Tab Content</ngx-tab>
    </ngx-tab-strip>

    <ngx-accordion [multi]="true">
      <ngx-accordion-item title="Section 1">Projected Body</ngx-accordion-item>
    </ngx-accordion>
  \`
})
export class ExampleComponent {}`;

  cardApi: ApiRow[] = [
    { name: 'title', type: 'Input<string>', default: "''", description: 'Card header title.' },
    { name: 'subtitle', type: 'Input<string>', default: "''", description: 'Card header subtitle.' },
    { name: 'headerIcon', type: 'Input<string>', default: "''", description: 'Icon symbol displayed in the header.' },
    { name: 'imageUrl', type: 'Input<string>', default: "''", description: 'Header card image URL.' },
    { name: 'imageAlt', type: 'Input<string>', default: "''", description: 'Alt text for header card image.' },
    { name: 'variant', type: "Input<'default'|'elevated'|'outlined'|'filled'|'glass'>", default: "'default'", description: 'Styling layout preset.' },
    { name: 'hoverable', type: 'Input<boolean>', default: 'false', description: 'Card lifts up with translate animations on hover.' },
    { name: 'selectable', type: 'Input<boolean>', default: 'false', description: 'Allows highlighting when selected.' },
    { name: 'selected', type: 'Input<boolean>', default: 'false', description: 'Current highlight status for selectable.' },
    { name: 'cardClick', type: 'Output<MouseEvent>', default: 'n/a', description: 'Emits when card is clicked (only if hoverable or selectable is true).' }
  ];

  tabApi: ApiRow[] = [
    { name: 'position', type: "Input<'top'|'bottom'|'left'|'right'>", default: "'top'", description: 'Position layout direction for the tabs tablist.' },
    { name: 'closable', type: 'Input<boolean>', default: 'false', description: 'Tab component property enabling Close (×) button trigger.' },
    { name: 'badge', type: 'Input<string | number>', default: "''", description: 'Renders badge bubble next to tab title.' },
    { name: 'disabled', type: 'Input<boolean>', default: 'false', description: 'Disables user interactions on tab button.' },
    { name: 'tabChange', type: 'Output<number>', default: 'n/a', description: 'Emitted when active tab index changes.' },
    { name: 'tabClose', type: 'Output<number>', default: 'n/a', description: 'Emitted with closed tab index when close icon is clicked.' }
  ];

  accordionApi: ApiRow[] = [
    { name: 'items', type: 'Input<AccordionItem[]>', default: '[]', description: 'Fallback array of items matching standard template configuration.' },
    { name: 'multi', type: 'Input<boolean>', default: 'false', description: 'Allows opening multiple panels simultaneously.' },
    { name: 'expandAll()', type: 'Public Method', default: 'void', description: 'Expands all collapsible accordion items.' },
    { name: 'collapseAll()', type: 'Public Method', default: 'void', description: 'Collapses all accordion items.' },
    { name: 'expandItem(index)', type: 'Public Method', default: 'void', description: 'Expands item panel at specified index.' },
    { name: 'collapseItem(index)', type: 'Public Method', default: 'void', description: 'Collapses item panel at specified index.' }
  ];

  stepperApi: ApiRow[] = [
    { name: 'steps', type: 'Input<StepperStep[]>', default: '[]', description: 'Configuration list of step metadata.' },
    { name: 'linear', type: 'Input<boolean>', default: 'true', description: 'Enforces sequential page advance navigation.' },
    { name: 'orientation', type: "Input<'horizontal'|'vertical'>", default: "'horizontal'", description: 'Direction connector line flow.' },
    { name: 'ngxStepContent', type: 'Directive [ngxStepContent]', default: 'stepIndex', description: 'Template directive identifying step screen views.' },
    { name: 'stepChange', type: 'Output<number>', default: 'n/a', description: 'Emitted when current step index changes.' },
    { name: 'next() / back()', type: 'Public Methods', default: 'void', description: 'Trigger progression transitions.' }
  ];

  splitterApi: ApiRow[] = [
    { name: 'size', type: 'Input<string | number>', default: 'null', description: 'Current left panel size.' },
    { name: 'min', type: 'Input<number>', default: '60', description: 'Minimum layout size in pixels for panel 1.' },
    { name: 'sizeChange', type: 'Output<string>', default: 'n/a', description: 'Emitted during pane drag operations.' }
  ];

  resetTabs() {
    this.dynamicTabs.set([
      { id: 1, title: 'Overview', icon: '📋', content: 'Overview panel contents showing Kendo parity components.', closable: true },
      { id: 2, title: 'Analytics', icon: '📊', badge: '3', content: 'Detailed graph dashboard showing CPU & Memory utilization.', closable: true },
      { id: 3, title: 'System Logs', icon: '⚙️', content: 'Raw database query logs and backend exceptions stream.', closable: false }
    ]);
    this.tabLogs.update(logs => [...logs, `[Tabs Reset] Dynamic tabs restored.`]);
  }

  logTabChange(index: number) {
    const tabs = this.dynamicTabs();
    const title = tabs[index] ? tabs[index].title : `Index ${index}`;
    this.tabLogs.update(logs => [...logs, `[Tab Switched] Active tab index is now ${index} (${title}).`]);
  }

  onTabClose(index: number) {
    const tabs = this.dynamicTabs();
    const closedTab = tabs[index];
    if (!closedTab) return;
    
    // Remove tab
    this.dynamicTabs.set(tabs.filter((_, i) => i !== index));
    this.tabLogs.update(logs => [...logs, `[Tab Closed] Closed tab index ${index} ("${closedTab.title}").`]);
  }

  triggerLaunch() {
    alert(`Application launched successfully!\nName: ${this.stepFormName()}\nEmail: ${this.stepFormEmail()}\nOrg: ${this.stepFormOrgType()}\nNotes: ${this.stepFormNotes() || 'None'}`);
  }
}
