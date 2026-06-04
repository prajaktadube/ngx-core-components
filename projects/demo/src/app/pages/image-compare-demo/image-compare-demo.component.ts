import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageCompareComponent } from 'ngx-core-components/views';

interface ApiRow { name: string; type: string; default: string; description: string; }

@Component({
  selector: 'app-image-compare-demo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ImageCompareComponent],
  template: `
    <div class="demo-page">
      <header class="demo-header">
        <h1>🖼️ Image Comparison Slider</h1>
        <p>A touch-responsive side-by-side comparison slider. Users can drag the circular handle divider to clip and contrast two overlapping images (e.g. before/after renders, design specs, or filter variations).</p>
      </header>

      <!-- TAB NAV -->
      <div class="tab-nav">
        @for (tab of tabs; track tab) {
          <button class="tab-btn" [class.active]="activeTab() === tab" (click)="activeTab.set(tab)">{{ tab }}</button>
        }
      </div>

      <!-- ===== DEMO ===== -->
      @if (activeTab() === 'Demo') {
        <div class="tab-content">
          <!-- Horizontal Comparison Slider -->
          <section class="demo-section">
            <h2>Horizontal Split Comparison</h2>
            <p class="section-desc">Drag the center handle divider left and right to inspect the differences.</p>
            
            <div class="slider-wrapper">
              <ngx-image-compare
                beforeImage="https://picsum.photos/id/82/800/450"
                afterImage="https://picsum.photos/id/82/800/450?grayscale"
                beforeLabel="Original (Color)"
                afterLabel="Grayscale Filter"
                [startOffset]="40"
              ></ngx-image-compare>
            </div>
          </section>

          <!-- Vertical Comparison Slider -->
          <section class="demo-section">
            <h2>Vertical Split Comparison</h2>
            <p class="section-desc">Drag the divider up and down to compare changes vertically.</p>
            
            <div class="slider-wrapper">
              <ngx-image-compare
                beforeImage="https://picsum.photos/id/12/800/450"
                afterImage="https://picsum.photos/id/12/800/450?blur=5"
                beforeLabel="Original Sharp"
                afterLabel="Blurred Overlay"
                orientation="vertical"
                [startOffset]="60"
                theme="dark"
              ></ngx-image-compare>
            </div>
          </section>

          <!-- Specifications Showcase -->
          <section class="demo-section">
            <h2>Features Checklist</h2>
            <div class="specs-grid">
              <div class="spec-card">
                <h4>⚡ High Performance</h4>
                <p>Uses GPU-accelerated CSS <code>clip-path</code>, completely avoiding laggy rendering frames during drags.</p>
              </div>
              <div class="spec-card">
                <h4>📱 Touch Responsive</h4>
                <p>Integrated unified touch-drag hosts to support smooth slides on mobile and tablet displays.</p>
              </div>
              <div class="spec-card">
                <h4>🎨 Custom Labels</h4>
                <p>Floating glassmorphic text boxes to denote stages (e.g. original vs filtered) with customizable text inputs.</p>
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
          <div class="section-label">Image Compare Component (ngx-image-compare)</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Property</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of apiRef; track row.name) {
                  <tr>
                    <td class="api-name">{{ row.name }}</td>
                    <td class="api-type">{{ row.type }}</td>
                    <td class="api-default">{{ row.default }}</td>
                    <td>{{ row.description }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
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
      margin-bottom: 24px;
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

    .tab-nav { display: flex; gap: 0; border-bottom: 2px solid #e9ecef; overflow-x: auto; padding-bottom: 0; margin-bottom: 24px; }
    .tab-btn { padding: 12px 20px; background: none; border: none; font-size: 13px; font-weight: 500; color: #6c757d; cursor: pointer; border-bottom: 3px solid transparent; margin-bottom: -2px; font-family: inherit; transition: all 0.2s ease; white-space: nowrap; }
    .tab-btn:hover { color: #495057; background: rgba(26, 115, 232, 0.05); }
    .tab-btn.active { color: #1a73e8; border-bottom-color: #1a73e8; font-weight: 600; background: rgba(26, 115, 232, 0.04); }
    .tab-content { display: flex; flex-direction: column; gap: 20px; }

    .demo-section {
      margin-bottom: 20px;
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

    .slider-wrapper {
      width: 100%;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 
        0 10px 30px -10px rgba(0, 0, 0, 0.15),
        0 1px 3px rgba(0, 0, 0, 0.05);
    }

    /* Specs checklist grid */
    .specs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }

    .spec-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      border: 1px solid rgba(0, 0, 0, 0.05);
    }

    .spec-card h4 {
      margin: 0 0 6px 0;
      font-size: 14px;
      color: #0f172a;
    }

    .spec-card p {
      margin: 0;
      font-size: 12px;
      color: #64748b;
      line-height: 1.5;
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
export class ImageCompareDemoComponent {
  activeTab = signal('Demo');
  tabs = ['Demo', 'API Reference'];

  howToCode = `import { Component } from '@angular/core';
import { ImageCompareComponent } from 'ngx-core-components/views';

@Component({
  selector: 'app-my-comparer',
  standalone: true,
  imports: [ImageCompareComponent],
  template: \`
    <ngx-image-compare
      beforeImage="before-render.jpg"
      afterImage="after-render.jpg"
      beforeLabel="Draft Draft"
      afterLabel="Final Render"
      [startOffset]="50"
      orientation="horizontal"
    ></ngx-image-compare>
  \`
})
export class MyComparerComponent {}`;

  apiRef: ApiRow[] = [
    { name: 'beforeImage', type: 'InputSignal<string> (Required)', default: 'N/A', description: 'URL/path of the overlapping/top image layer.' },
    { name: 'afterImage', type: 'InputSignal<string> (Required)', default: 'N/A', description: 'URL/path of the base background image layer.' },
    { name: 'beforeLabel', type: 'InputSignal<string>', default: "'Before'", description: 'Label text floating over the top/left image.' },
    { name: 'afterLabel', type: 'InputSignal<string>', default: "'After'", description: 'Label text floating over the bottom/right image.' },
    { name: 'startOffset', type: 'InputSignal<number>', default: '50', description: 'Starting clipping percent (0 to 100) of the before layer.' },
    { name: 'orientation', type: "InputSignal<'horizontal' | 'vertical'>", default: "'horizontal'", description: 'The dragging slide orientation.' },
    { name: 'theme', type: "InputSignal<'light' | 'dark'>", default: "'light'", description: 'Styling appearance theme.' },
    { name: 'id', type: 'InputSignal<string>', default: "'ngx-img-compare-[random]'", description: 'Unique element identifier.' }
  ];
}

