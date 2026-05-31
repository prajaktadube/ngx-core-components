import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BackToTopComponent } from 'ngx-core-components/navigation';

@Component({
  selector: 'app-back-to-top-demo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, BackToTopComponent],
  template: `
    <div class="demo-page">
      <header class="demo-header">
        <h1>⬆️ Scroll to Top Progress Indicator</h1>
        <p>A floating navigation action button. Appears automatically when scrolling past a target threshold, displaying a circular progress ring mapping viewport scroll percentage.</p>
      </header>

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

      <!-- How to Use -->
      <section class="demo-section">
        <h2>How to Use</h2>
        <p class="section-desc">Import the standalone back-to-top scroll tracker component. Attach it either globally to the window or reference a local scrollable target element container.</p>
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
      margin: 0 0 20px;
    }

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
  `]
})
export class BackToTopDemoComponent {
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
}
