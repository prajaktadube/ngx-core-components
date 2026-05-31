import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarouselComponent } from 'ngx-core-components/layout';

interface ImageSlide {
  url: string;
  title: string;
  caption: string;
}

interface FeatureSlide {
  icon: string;
  title: string;
  desc: string;
  color: string;
  authorName: string;
  authorRole: string;
}

@Component({
  selector: 'app-carousel-demo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, CarouselComponent],
  template: `
    <div class="demo-page">
      <header class="demo-header">
        <h1>Carousel Slider Component</h1>
        <p>Highly interactive slide carousel with touch gesture support, custom template content projection, and smooth animations.</p>
      </header>

      <!-- Standard Image Slideshow -->
      <section class="demo-section">
        <h2>Standard Image Slideshow</h2>
        <p class="section-desc">Default layout using image URLs with floating glassmorphic details overlays.</p>
        <div class="carousel-wrapper">
          <ngx-carousel
            [items]="images"
            [autoplay]="true"
            [interval]="4000"
            transition="slide"
            (slideChange)="onSlideChange($event, 'Standard Image')"
          ></ngx-carousel>
        </div>
      </section>

      <!-- Custom Content Projection Slider (Testimonial cards) -->
      <section class="demo-section">
        <h2>Custom Template Projection (Testimonial Cards)</h2>
        <p class="section-desc">Pass custom data items and render slide card templates using local variables.</p>
        
        <div class="carousel-wrapper custom-height">
          <ngx-carousel
            [items]="testimonials"
            [autoplay]="false"
            transition="fade"
            [itemTemplate]="testimonialTemplate"
            (slideChange)="onSlideChange($event, 'Testimonials')"
          ></ngx-carousel>

          <ng-template #testimonialTemplate let-item>
            <div class="testimonial-slide-card" [style.border-top-color]="item.color">
              <div class="slide-icon" [style.background-color]="item.color + '15'" [style.color]="item.color">
                {{ item.icon }}
              </div>
              <p class="quote-text">"{{ item.desc }}"</p>
              <div class="author-details">
                <span class="author-name">{{ item.authorName }}</span>
                <span class="author-role">{{ item.authorRole }} — {{ item.title }}</span>
              </div>
            </div>
          </ng-template>
        </div>
      </section>

      <!-- Interactive Playground Configurations -->
      <section class="demo-section">
        <h2>Configuration Settings</h2>
        <p class="section-desc">Configure the carousel properties interactively.</p>
        <div class="interactive-box">
          <div class="controls-panel">
            <div class="control-group">
              <label>Transition Animation</label>
              <select [(ngModel)]="selectedTransition">
                <option value="slide">Slide (Horizontal Translation)</option>
                <option value="fade">Cross Fade</option>
              </select>
            </div>

            <div class="control-group check-group">
              <label>
                <input type="checkbox" [(ngModel)]="autoplayEnabled" /> Enable Autoplay
              </label>
            </div>

            <div class="control-group">
              <label>Autoplay Duration (ms)</label>
              <input type="number" [(ngModel)]="autoplayInterval" step="500" min="1000" max="10000" />
            </div>

            <div class="control-group check-group">
              <label>
                <input type="checkbox" [(ngModel)]="showControls" /> Show Arrow Controls
              </label>
            </div>

            <div class="control-group check-group">
              <label>
                <input type="checkbox" [(ngModel)]="showIndicators" /> Show Indicators Dots
              </label>
            </div>
          </div>

          <div class="demo-display-panel">
            <ngx-carousel
              [items]="images"
              [autoplay]="autoplayEnabled"
              [interval]="autoplayInterval"
              [transition]="selectedTransition"
              [showControls]="showControls"
              [showIndicators]="showIndicators"
            ></ngx-carousel>

            <div class="event-logs">
              <h4>Event Log</h4>
              <div class="log-lines">
                @for (log of eventLogs(); track $index) {
                  <div class="log-line">{{ log }}</div>
                }
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- How to Use -->
      <section class="demo-section">
        <h2>How to Use</h2>
        <p class="section-desc">Import the standalone carousel component and supply an array of items. You can also customize the transition, speed, and slide templates.</p>
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

    .carousel-wrapper {
      width: 100%;
      border-radius: 16px;
      overflow: hidden;
    }

    /* ── Testimonial card content template ── */
    .testimonial-slide-card {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 60px;
      background: white;
      border-top: 5px solid #3b82f6;
      box-sizing: border-box;
      text-align: center;
    }

    .slide-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      margin-bottom: 20px;
    }

    .quote-text {
      font-size: 18px;
      font-weight: 500;
      line-height: 1.5;
      color: #334155;
      max-width: 620px;
      margin: 0 0 24px 0;
      font-style: italic;
    }

    .author-details {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .author-name {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
    }

    .author-role {
      font-size: 12px;
      color: #64748b;
      font-weight: 500;
    }

    /* Custom sizing override */
    .custom-height ::ng-deep .ngx-carousel__stage {
      height: 320px;
    }

    /* ── Configurations Playground ── */
    .interactive-box {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 24px;
      background: var(--bg-secondary, #f8fafc);
      padding: 24px;
      border-radius: 16px;
      border: 1px solid rgba(0, 0, 0, 0.04);
    }

    .controls-panel {
      display: flex;
      flex-direction: column;
      gap: 16px;
      background: var(--bg-primary, #ffffff);
      padding: 16px;
      border-radius: 12px;
      border: 1px solid rgba(0, 0, 0, 0.05);
    }

    .control-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .control-group label {
      font-size: 12px;
      font-weight: 600;
      color: #475569;
    }

    .control-group input[type="number"],
    .control-group select {
      padding: 8px 12px;
      font-size: 13px;
      border-radius: 6px;
      border: 1px solid #cbd5e1;
      outline: none;
    }

    .check-group label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
    }

    .demo-display-panel {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .event-logs {
      width: 100%;
      background: #0f172a;
      border-radius: 12px;
      padding: 14px;
      color: #38bdf8;
      font-family: monospace;
      font-size: 12px;
    }

    .event-logs h4 {
      margin: 0 0 8px 0;
      font-size: 12px;
      color: #94a3b8;
      border-bottom: 1px solid #334155;
      padding-bottom: 4px;
    }

    .log-lines {
      height: 90px;
      overflow-y: auto;
      display: flex;
      flex-direction: column-reverse;
      gap: 4px;
    }

    .log-line {
      white-space: pre-wrap;
    }
  `]
})
export class CarouselDemoComponent {
  // Playground options
  selectedTransition: 'slide' | 'fade' = 'slide';
  autoplayEnabled = true;
  autoplayInterval = 5000;
  showControls = true;
  showIndicators = true;

  eventLogs = signal<string[]>([]);

  howToCode = `import { Component } from '@angular/core';
import { CarouselComponent } from 'ngx-core-components/layout';

@Component({
  selector: 'app-my-carousel',
  standalone: true,
  imports: [CarouselComponent],
  template: \`
    <!-- Standard Slideshow -->
    <ngx-carousel [items]="slides" [autoplay]="true" [interval]="5000"></ngx-carousel>

    <!-- Custom Template Slideshow -->
    <ngx-carousel [items]="features" [itemTemplate]="featureTemplate" transition="fade"></ngx-carousel>

    <ng-template #featureTemplate let-item>
      <div class="custom-card">
        <h3>{{ item.title }}</h3>
        <p>{{ item.text }}</p>
      </div>
    </ng-template>
  \`
})
export class MyCarouselComponent {
  slides = [
    { url: 'image1.jpg', title: 'First Slide', caption: 'Captivating image details' },
    { url: 'image2.jpg', title: 'Second Slide', caption: 'Another visual showcase' }
  ];

  features = [
    { title: 'Fast Rendering', text: 'Uses GPU transitions' },
    { title: 'Signal Bound', text: 'Optimized change detection' }
  ];
}`;

  images: ImageSlide[] = [
    {
      url: 'https://picsum.photos/id/10/960/400',
      title: 'Ocean Coastline',
      caption: 'Stunning rocky shoreline capturing high-energy waves crashing along cliffs.',
    },
    {
      url: 'https://picsum.photos/id/29/960/400',
      title: 'Mountain Ascent',
      caption: 'Fog-enshrouded tall pine forests line high-elevation mountain peaks.',
    },
    {
      url: 'https://picsum.photos/id/28/960/400',
      title: 'Forest Pathway',
      caption: 'Light filters down onto walking trails deep inside national parks.',
    },
    {
      url: 'https://picsum.photos/id/48/960/400',
      title: 'City Lights',
      caption: 'Cyberpunk-themed neon reflections bouncing off city streets after rain.',
    },
  ];

  testimonials: FeatureSlide[] = [
    {
      icon: '💬',
      title: 'Senior Software Engineer',
      desc: 'This library has significantly boosted our developer throughput. The components look clean out of the box!',
      color: '#3b82f6',
      authorName: 'Sarah Jenkins',
      authorRole: 'UI Platform Team',
    },
    {
      icon: '🛡️',
      title: 'Lead Architect',
      desc: 'Zero dependency strategy combined with signals-based change detection is exactly what we were looking for.',
      color: '#10b981',
      authorName: 'Marcus Vance',
      authorRole: 'Enterprise Systems',
    },
    {
      icon: '⚡',
      title: 'Product Owner',
      desc: 'The Gantt charts and schedulers have solved visual analytics gaps that normally take months to build.',
      color: '#f59e0b',
      authorName: 'Aria Chen',
      authorRole: 'Product Development',
    },
  ];

  onSlideChange(event: { index: number; item: any }, context: string) {
    const slideInfo = event.item.title || `Slide ${event.index + 1}`;
    this.eventLogs.update(logs => [
      ...logs,
      `[${context}] active index changed to ${event.index} (${slideInfo})`
    ].slice(-10));
  }
}
