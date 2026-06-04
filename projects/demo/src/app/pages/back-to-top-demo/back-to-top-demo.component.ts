import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BackToTopComponent } from 'ngx-core-components/navigation';

interface ApiRow { name: string; type: string; default: string; description: string; }

@Component({
  selector: 'app-back-to-top-demo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, BackToTopComponent],
  template: `
    <div class="demo-page">
      <!-- Page Header -->
      <div class="page-header">
        <div class="page-header-text">
          <h1>⬆️ Scroll to Top Progress Indicator</h1>
          <p>A floating navigation action button. Appears automatically when scrolling past a target threshold, displaying a circular progress ring mapping viewport scroll percentage.</p>
        </div>
        <div class="header-badges">
          <span class="badge badge-blue">Floating FAB</span>
          <span class="badge badge-blue">Scroll Progress</span>
          <span class="badge badge-blue">Target Bindings</span>
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
          <!-- Scroll container showcase -->
          <section class="demo-section">
            <h2>Interactive Scroll Container Showcase</h2>
            <p class="section-desc">Scroll inside the container below. Watch the floating button fade in at the bottom-right corner of the container with its scroll progress ring filling up.</p>
            
            <div class="scroll-showcase-box">
              <div class="options-row">
                <div class="option">
                  <label>Scroll Threshold (px)</label>
                  <input type="number" [(ngModel)]="customThreshold" min="10" max="200" />
                </div>
                <div class="option check-option">
                  <label>
                    <input type="checkbox" [(ngModel)]="showProgressRing" /> Show Scroll Progress Ring
                  </label>
                </div>
                <div class="option check-option">
                  <label>
                    <input type="checkbox" [(ngModel)]="darkTheme" /> Use Dark Theme Button
                  </label>
                </div>
              </div>

              <div class="relative-wrapper">
                <!-- Scroll target container -->
                <div #localScrollTarget class="local-scrollable-container">
                  <div class="scroll-content-inner">
                    <h3>📜 Begin Scrolling Down</h3>
                    <p>This container has a height constraint forcing an overflow. The back-to-top button is absolute positioned relative to this wrapper container by passing a template reference target.</p>
                    
                    @for (p of paragraphs; track p; let idx = $index) {
                      <p class="dummy-text-line">
                        Row #{{ idx + 1 }} — Standing on the shoulders of giants. Modular standalone components built with signals ensure maximum rendering efficiency.
                      </p>
                    }
                    
                    <h3 class="scroll-bottom-headline">🏁 Bottom of Container Reached</h3>
                    <p>Click the floating button with the scroll progress indicator to return to the top smoothly.</p>
                  </div>
                </div>

                <!-- Back to top button hooked to container -->
                <ngx-back-to-top
                  [target]="localScrollTarget"
                  [threshold]="customThreshold"
                  [showProgress]="showProgressRing"
                  [theme]="darkTheme ? 'dark' : 'light'"
                ></ngx-back-to-top>
              </div>
            </div>
          </section>
          
          <!-- Whole Window Back to Top Info -->
          <section class="demo-section">
            <h2>Window Targeting Support</h2>
            <p class="section-desc">By default, if no target element is passed, the component binds to the window scroll events. This allows you to place a single <code>&lt;ngx-back-to-top&gt;&lt;/ngx-back-to-top&gt;</code> at the root level of your app to manage global window navigation.</p>
            
            <div class="window-details-card">
              <h4>💡 Usage Example</h4>
              <pre><code>&lt;ngx-back-to-top [threshold]="400" [showProgress]="true"&gt;&lt;/ngx-back-to-top&gt;</code></pre>
            </div>
          </section>

          <div class="section-label">How to Use</div>
          <pre class="code-block">{{ howToCode }}</pre>
        </div>
      }

      <!-- ===== API REFERENCE ===== -->
      @if (activeTab() === 'API Reference') {
        <div class="tab-content">
          <div class="section-label">Back To Top (ngx-back-to-top)</div>
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
    .badge-blue { background: linear-gradient(135deg, #e8f0fe 0%, #d1e3ff 100%); color: #1a73e8; border: 1px solid rgba(26, 115, 232, 0.1); }
    
    .tab-nav { display: flex; gap: 0; border-bottom: 2px solid #e9ecef; overflow-x: auto; padding-bottom: 0; }
    .tab-btn { padding: 12px 20px; background: none; border: none; font-size: 13px; font-weight: 500; color: #6c757d; cursor: pointer; border-bottom: 3px solid transparent; margin-bottom: -2px; font-family: inherit; transition: all 0.2s ease; white-space: nowrap; }
    .tab-btn:hover { color: #495057; background: rgba(26, 115, 232, 0.05); }
    .tab-btn.active { color: #1a73e8; border-bottom-color: #1a73e8; font-weight: 600; background: rgba(26, 115, 232, 0.04); }
    
    .tab-content { display: flex; flex-direction: column; gap: 20px; }
    .demo-section { margin-bottom: 20px; }
    .demo-section h2 { font-size: 17px; font-weight: 700; color: #0f172a; margin: 0 0 8px; }
    .section-desc { font-size: 13px; color: #64748b; margin: 0 0 16px; }
    
    /* Scroll showcase box */
    .scroll-showcase-box {
      background: white;
      padding: 24px;
      border-radius: 16px;
      border: 1px solid rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .options-row {
      display: flex;
      gap: 24px;
      align-items: center;
      flex-wrap: wrap;
      background: #f8fafc;
      padding: 16px;
      border-radius: 10px;
      border: 1px solid rgba(0, 0, 0, 0.02);
    }

    .option {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .option label {
      font-size: 12px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
    }

    .option input[type="number"] {
      padding: 6px 10px;
      font-size: 13px;
      border-radius: 6px;
      border: 1px solid #cbd5e1;
      width: 140px;
      outline: none;
    }

    .check-option label {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      text-transform: none !important;
      color: #334155 !important;
      margin-top: 18px;
    }

    .relative-wrapper {
      position: relative;
      width: 100%;
      border-radius: 12px;
      overflow: hidden;
      border: 1.5px solid #cbd5e1;
    }

    /* Target Scroll Container */
    .local-scrollable-container {
      height: 350px;
      overflow-y: scroll;
      background: #ffffff;
      padding: 24px;
      box-sizing: border-box;
    }

    /* absolute override for the child ngx-back-to-top button inside wrapper */
    .relative-wrapper ::ng-deep .ngx-back-to-top {
      position: absolute;
      bottom: 16px;
      right: 16px;
    }

    .scroll-content-inner {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .scroll-content-inner h3 {
      margin: 0;
      font-size: 16px;
      color: #0f172a;
    }

    .dummy-text-line {
      font-size: 13px;
      line-height: 1.5;
      color: #64748b;
      margin: 0;
    }

    .scroll-bottom-headline {
      margin-top: 24px !important;
    }

    /* Window targeting card */
    .window-details-card {
      background: #0f172a;
      border-radius: 12px;
      padding: 20px;
      color: #e2e8f0;
    }

    .window-details-card h4 {
      margin: 0 0 8px 0;
      font-size: 13px;
      color: #38bdf8;
    }

    .window-details-card pre {
      margin: 0;
      background: rgba(255, 255, 255, 0.05);
      padding: 10px;
      border-radius: 6px;
      font-family: monospace;
      font-size: 12px;
      overflow-x: auto;
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
export class BackToTopDemoComponent {
  activeTab = signal('Demo');
  tabs = ['Demo', 'API Reference'];

  howToCode = `import { Component } from '@angular/core';
import { BackToTopComponent } from 'ngx-core-components/navigation';

@Component({
  selector: 'app-my-scroll-page',
  standalone: true,
  imports: [BackToTopComponent],
  template: \`
    <!-- Global Window Scroll Tracker -->
    <ngx-back-to-top [threshold]="300" [showProgress]="true"></ngx-back-to-top>

    <!-- Or local scrollable element target -->
    <div class="scroll-wrapper" style="position: relative;">
      <div #scrollContainer style="height: 400px; overflow-y: auto;">
        <!-- Long list of content items -->
      </div>
      <ngx-back-to-top [target]="scrollContainer" [threshold]="100"></ngx-back-to-top>
    </div>
  \`
})
export class MyScrollPageComponent {}`;

  customThreshold = 60;
  showProgressRing = true;
  darkTheme = false;

  paragraphs = Array(40).fill(0);

  backToTopApi: ApiRow[] = [
    { name: 'threshold', type: 'number', default: '300', description: 'Scroll distance offset in pixels before the button appears.' },
    { name: 'target', type: 'string | HTMLElement | null', default: 'null', description: 'Template reference element or selector to track scroll progress. If null, window scroll is tracked.' },
    { name: 'theme', type: "'light' | 'dark'", default: "'light'", description: 'Color styling for the button background.' },
    { name: 'showProgress', type: 'boolean', default: 'true', description: 'Displays a circular SVG progress ring tracing scroll percentage.' }
  ];
}

