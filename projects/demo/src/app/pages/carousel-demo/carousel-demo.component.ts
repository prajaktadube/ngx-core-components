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

interface ApiRow { name: string; type: string; default: string; description: string; }

@Component({
  selector: 'app-carousel-demo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, CarouselComponent],
  template: `
    <div class="demo-page">
      <!-- Page Header -->
      <div class="page-header">
        <div class="page-header-text">
          <h1>Carousel Slider Component</h1>
          <p>Highly interactive slide carousel with touch gesture support, custom template content projection, and smooth animations.</p>
        </div>
        <div class="header-badges">
          <span class="badge badge-green">Gestures</span>
          <span class="badge badge-green">Animations</span>
          <span class="badge badge-green">Custom Templates</span>
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

          <div class="section-label">How to Use</div>
          <pre class="code-block">{{ howToCode }}</pre>
        </div>
      }

      <!-- ===== API REFERENCE ===== -->
      @if (activeTab() === 'API Reference') {
        <div class="tab-content">
          <div class="section-label">Carousel (ngx-carousel)</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input / Output</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of carouselApi; track row.name) {
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
    .badge-green { background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); color: #166534; border: 1px solid rgba(22, 101, 52, 0.1); }
    
    .tab-nav { display: flex; gap: 0; border-bottom: 2px solid #e9ecef; overflow-x: auto; padding-bottom: 0; }
    .tab-btn { padding: 12px 20px; background: none; border: none; font-size: 13px; font-weight: 500; color: #6c757d; cursor: pointer; border-bottom: 3px solid transparent; margin-bottom: -2px; font-family: inherit; transition: all 0.2s ease; white-space: nowrap; }
    .tab-btn:hover { color: #495057; background: rgba(26, 115, 232, 0.05); }
    .tab-btn.active { color: #1a73e8; border-bottom-color: #1a73e8; font-weight: 600; background: rgba(26, 115, 232, 0.04); }
    
    .tab-content { display: flex; flex-direction: column; gap: 20px; }
    .demo-section { margin-bottom: 20px; }
    .demo-section h2 { font-size: 17px; font-weight: 700; color: #0f172a; margin: 0 0 8px; }
    .section-desc { font-size: 13px; color: #64748b; margin: 0 0 16px; }
    
    .carousel-wrapper { width: 100%; border-radius: 16px; overflow: hidden; }
    
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
      background: #f8fafc;
      padding: 24px;
      border-radius: 16px;
      border: 1px solid rgba(0, 0, 0, 0.04);
    }

    .controls-panel {
      display: flex;
      flex-direction: column;
      gap: 16px;
      background: #ffffff;
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
export class CarouselDemoComponent {
  activeTab = signal('Demo');
  tabs = ['Demo', 'API Reference'];

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

  carouselApi: ApiRow[] = [
    { name: 'items', type: 'any[]', default: '[]', description: 'Array of data items representing slides.' },
    { name: 'autoplay', type: 'boolean', default: 'true', description: 'Enables automatic slide transitions.' },
    { name: 'interval', type: 'number', default: '5000', description: 'Duration in milliseconds for each slide during autoplay.' },
    { name: 'transition', type: "'slide' | 'fade'", default: "'slide'", description: 'Transition animation type.' },
    { name: 'theme', type: "'light' | 'dark'", default: "'light'", description: 'Color scheme styling.' },
    { name: 'showIndicators', type: 'boolean', default: 'true', description: 'Shows indicator dots at the bottom.' },
    { name: 'showControls', type: 'boolean', default: 'true', description: 'Shows left/right navigation arrow buttons.' },
    { name: 'itemTemplate', type: 'TemplateRef<any> | null', default: 'null', description: 'Custom slide rendering template reference.' },
    { name: 'id', type: 'string', default: 'auto-generated', description: 'Unique identifier for slide accessibility controls.' },
    { name: 'slideChange', type: 'Output<{ index: number; item: any }>', default: 'n/a', description: 'Emitted when the active slide changes.' }
  ];
}

