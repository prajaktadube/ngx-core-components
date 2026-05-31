import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageCompareComponent } from 'ngx-core-components/views';

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

      <!-- How to Use -->
      <section class="demo-section">
        <h2>How to Use</h2>
        <p class="section-desc">Import the standalone image comparison component. Provide <code>beforeImage</code> and <code>afterImage</code> URLs, and optionally customize the labels, start offset, and orientation.</p>
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
  `]
})
export class ImageCompareDemoComponent {
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
}
