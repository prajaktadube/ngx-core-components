import { Component, HostListener, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  BUILD_CARDS,
  EXPLORE_CARDS,
  COMPARE_TRACKS,
  INTEGRATE_CARDS,
} from './home.data';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div class="home-page">
      <!-- Premium Hero Section -->
      <section class="hero-card">
        <div class="hero-glow"></div>
        <div class="hero-badge">Next-Gen Angular UI Suite</div>
        <h1>Pick a Goal. Reach the Right Demo Fast.</h1>
        <p class="hero-subtext">
          A high-performance component workspace built with modern Angular principles.
          Zero external dependencies, built-in virtualization, and 100% reactive state management.
        </p>

        <!-- Dynamic Statistics Counters -->
        <div class="metrics-grid">
          <div class="metric-item">
            <span class="metric-number">50+</span>
            <span class="metric-label">Components &amp; APIs</span>
          </div>
          <div class="metric-item">
            <span class="metric-number">100%</span>
            <span class="metric-label">Signal-Driven State</span>
          </div>
          <div class="metric-item">
            <span class="metric-number">60 FPS</span>
            <span class="metric-label">Virtualized Gantt &amp; Grid</span>
          </div>
          <div class="metric-item">
            <span class="metric-number">0</span>
            <span class="metric-label">External Dependencies</span>
          </div>
        </div>

        <div class="hero-actions">
          <a class="btn btn-primary" routerLink="/getting-started">🚀 Get Started</a>
          <a class="btn btn-secondary" routerLink="/gantt">📅 View Gantt Chart</a>
          <button class="btn btn-ghost" type="button" (click)="focusSearchInput()">🔎 Search components</button>
        </div>

        <div class="search-panel ux-surface ux-surface-accent">
          <label class="search-label" for="componentSearch">Find a component</label>
          <div class="search-row">
            <input
              #componentSearch
              id="componentSearch"
              type="search"
              class="search-input"
              placeholder="Search by name, capability, or tag…"
              [value]="searchText()"
              (input)="searchText.set($any($event.target).value)"
            />
            <button class="btn btn-secondary search-btn" type="button" (click)="clearSearch()">Clear</button>
          </div>
          <div class="search-meta">
            <span>{{ visibleCount() }} components visible</span>
            <span>Tip: press / to jump here, or try one of the quick filters below.</span>
          </div>
          <div class="quick-search-row">
            @for (preset of quickSearchPresets; track preset) {
              <button class="quick-search-chip" type="button" (click)="applyQuickSearch(preset)">
                {{ preset }}
              </button>
            }
          </div>
        </div>
      </section>

      <!-- Journey Categories Grid -->
      <div class="journey-section">
        <div class="section-header-row">
          <span class="section-pill">Foundations</span>
          <h2>Build Your Screen</h2>
          <p>Compose beautiful interfaces using structured core elements, layouts, and input bindings.</p>
        </div>
        
        <div class="lane-grid">
          @for (card of filteredBuildCards(); track card.title) {
            <a class="journey-card-modern" [routerLink]="card.route">
              <div class="card-icon-wrapper">{{ card.icon }}</div>
              <div class="card-body">
                <h3>{{ card.title }}</h3>
                <p>{{ card.description }}</p>
                <div class="card-tags">
                  @for (tag of card.tags; track tag) {
                    <span class="tag-pill">{{ tag }}</span>
                  }
                </div>
              </div>
              <div class="card-arrow">→</div>
            </a>
          }
        </div>
      </div>

      <div class="journey-section">
        <div class="section-header-row">
          <span class="section-pill color-cyan">Data &amp; Charts</span>
          <h2>Explore Complex Features</h2>
          <p>Supercharge dashboards with interactive charts, fast search grids, and navigation trees.</p>
        </div>
        
        <div class="lane-grid">
          @for (card of filteredExploreCards(); track card.title) {
            <a class="journey-card-modern" [routerLink]="card.route">
              <div class="card-icon-wrapper">{{ card.icon }}</div>
              <div class="card-body">
                <h3>{{ card.title }}</h3>
                <p>{{ card.description }}</p>
                <div class="card-tags">
                  @for (tag of card.tags; track tag) {
                    <span class="tag-pill">{{ tag }}</span>
                  }
                </div>
              </div>
              <div class="card-arrow">→</div>
            </a>
          }
        </div>
      </div>

      <!-- Compare &amp; Analyze Section -->
      <section class="compare-section-modern">
        <div class="section-header-row">
          <span class="section-pill color-purple">Interactive Timelines</span>
          <h2>Compare &amp; Analyze</h2>
          <p>Evaluate timelines and customization behaviors optimized for enterprise scale.</p>
        </div>

        <div class="compare-grid-modern">
          @for (track of compareTracks; track track.name) {
            <a class="compare-card-modern" [routerLink]="track.route" [queryParams]="track.queryParams || null">
              <div class="compare-head">
                <span class="compare-title">{{ track.name }}</span>
                <span class="compare-arrow">→</span>
              </div>
              <p class="compare-desc">{{ track.bestFor }}</p>
              <div class="compare-footer-note">
                <span class="note-icon">💡</span>
                <span class="note-text">{{ track.note }}</span>
              </div>
            </a>
          }
        </div>
      </section>

      <!-- Integrate Section -->
      <div class="journey-section">
        <div class="section-header-row">
          <span class="section-pill color-green">Integration &amp; Utilities</span>
          <h2>Integrate &amp; Polishing</h2>
          <p>Complete workflows with modal overlays, user notifications, breadcrumbs, and barcodes.</p>
        </div>
        
        <div class="lane-grid">
          @for (card of filteredIntegrateCards(); track card.title) {
            <a class="journey-card-modern" [routerLink]="card.route">
              <div class="card-icon-wrapper">{{ card.icon }}</div>
              <div class="card-body">
                <h3>{{ card.title }}</h3>
                <p>{{ card.description }}</p>
                <div class="card-tags">
                  @for (tag of card.tags; track tag) {
                    <span class="tag-pill">{{ tag }}</span>
                  }
                </div>
              </div>
              <div class="card-arrow">→</div>
            </a>
          }
        </div>
      </div>

      <!-- Cascadia Code Block Starter Section -->
      @if (!hasAnyVisibleCards()) {
        <section class="empty-state-card ux-surface">
          <h3>No components match your search</h3>
          <p>Try a broader term like “grid”, “chart”, “button”, or “layout”.</p>
        </section>
      }

      <section class="starter-card-modern">
        <div class="starter-glow"></div>
        <div class="starter-content">
          <h3>Deploy in 60 seconds</h3>
          <p>Install the npm package directly and import any standalone directive into your templates.</p>
          <div class="npm-command-box">
            <span class="command-prefix">$</span>
            <span class="command-text">npm install ngx-core-components</span>
            <button class="copy-icon-btn" (click)="copyNpmCommand($event)">📋</button>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      --hero-bg: linear-gradient(135deg, rgba(79, 70, 229, 0.06) 0%, rgba(124, 58, 237, 0.03) 50%, rgba(16, 185, 129, 0.02) 100%);
      --card-hover-border: var(--primary-color);
      --card-bg: var(--bg-secondary);
      --card-border: var(--border-color);
    }

    .home-page {
      max-width: 1200px;
      margin: 0 auto;
      padding: 32px 40px;
      display: flex;
      flex-direction: column;
      gap: 40px;
    }

    /* Hero Card Styling */
    .hero-card {
      position: relative;
      border-radius: 16px;
      background: var(--hero-bg);
      border: 1px solid var(--border-color);
      padding: 48px;
      overflow: hidden;
      box-shadow: var(--shadow-sm);

      h1 {
        margin: 12px 0 16px;
        font-size: 38px;
        font-weight: 850;
        line-height: 1.15;
        letter-spacing: -1px;
        color: var(--text-primary);
        font-family: var(--ngx-heading-font-family);
      }

      .hero-subtext {
        margin: 0 0 32px;
        color: var(--text-secondary);
        font-size: 15px;
        max-width: 780px;
        line-height: 1.6;
      }
    }

    .hero-glow {
      position: absolute;
      top: -10%;
      right: -5%;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
      filter: blur(40px);
      pointer-events: none;
      z-index: 0;
    }

    .hero-badge {
      display: inline-block;
      font-size: 11px;
      letter-spacing: 1px;
      text-transform: uppercase;
      font-weight: 700;
      color: var(--primary-color);
      background: var(--primary-glow);
      padding: 6px 14px;
      border-radius: 99px;
      border: 1px solid rgba(99, 102, 241, 0.15);
    }

    /* Metrics Section */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
      border-top: 1px solid var(--border-color);
      padding-top: 32px;
      position: relative;
      z-index: 1;
    }

    .metric-item {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .metric-number {
        font-size: 28px;
        font-weight: 850;
        font-family: var(--ngx-heading-font-family);
        background: var(--primary-gradient);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .metric-label {
        font-size: 12px;
        font-weight: 600;
        color: var(--text-secondary);
      }
    }

    .hero-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      position: relative;
      z-index: 1;
    }

    .search-panel {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 18px;
      padding: 16px;
      border-radius: 14px;
    }

    .search-label {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.18em;
      color: var(--text-secondary);
    }

    .search-row {
      display: flex;
      gap: 10px;
      align-items: center;
      flex-wrap: wrap;
    }

    .search-input {
      flex: 1;
      min-width: 260px;
      border-radius: 10px;
      border: 1px solid var(--border-color);
      background: var(--bg-secondary);
      color: var(--text-primary);
      padding: 11px 12px;
      font-size: 13px;
      font-family: inherit;
      outline: none;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.5);
    }

    .search-input:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
    }

    .search-btn {
      min-width: 96px;
      justify-content: center;
    }

    .search-meta {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;
      color: var(--text-secondary);
      font-size: 11px;
      font-weight: 600;
    }

    .quick-search-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      position: relative;
      z-index: 1;
    }

    .quick-search-chip {
      border: 1px solid var(--border-color);
      background: rgba(255, 255, 255, 0.72);
      color: var(--text-primary);
      border-radius: 999px;
      padding: 6px 10px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: capitalize;
      cursor: pointer;
      transition: all 0.18s ease;

      &:hover {
        border-color: var(--primary-color);
        background: rgba(79, 70, 229, 0.08);
        transform: translateY(-1px);
      }
    }

    .empty-state-card {
      border-radius: 14px;
      padding: 18px 20px;
      background: linear-gradient(135deg, rgba(79, 70, 229, 0.08), rgba(16, 185, 129, 0.06));
    }

    .empty-state-card h3 {
      margin: 0 0 4px;
      font-size: 14px;
      font-weight: 800;
      color: var(--text-primary);
    }

    .empty-state-card p {
      margin: 0;
      font-size: 12px;
      color: var(--text-secondary);
    }

    /* Button styles */
    .btn {
      text-decoration: none;
      border-radius: 10px;
      padding: 12px 24px;
      font-size: 13px;
      font-weight: 600;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
    }

    .btn-primary {
      color: #ffffff;
      background: var(--primary-gradient);
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.25);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(99, 102, 241, 0.35);
      }
    }

    .btn-secondary {
      color: var(--text-primary);
      border: 1px solid var(--border-color);
      background: var(--bg-secondary);

      &:hover {
        transform: translateY(-2px);
        border-color: var(--primary-color);
        background: var(--border-light);
      }
    }

    .btn-ghost {
      color: var(--text-primary);
      border: 1px dashed var(--border-color);
      background: rgba(255, 255, 255, 0.55);

      &:hover {
        transform: translateY(-2px);
        border-color: rgba(79, 70, 229, 0.35);
        background: rgba(79, 70, 229, 0.08);
      }
    }

    /* Journey Sections */
    .journey-section {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .section-header-row {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 4px;

      .section-pill {
        display: inline-block;
        font-size: 9px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #3b82f6;
        background: rgba(59, 130, 246, 0.1);
        padding: 4px 10px;
        border-radius: 99px;
        width: fit-content;
        border: 1px solid rgba(59, 130, 246, 0.15);

        &.color-cyan {
          color: #06b6d4;
          background: rgba(6, 182, 212, 0.1);
          border-color: rgba(6, 182, 212, 0.15);
        }

        &.color-purple {
          color: #8b5cf6;
          background: rgba(139, 92, 246, 0.1);
          border-color: rgba(139, 92, 246, 0.15);
        }

        &.color-green {
          color: #10b981;
          background: rgba(16, 185, 129, 0.1);
          border-color: rgba(16, 185, 129, 0.15);
        }
      }

      h2 {
        margin: 0;
        font-size: 22px;
        font-weight: 800;
        color: var(--text-primary);
        font-family: var(--ngx-heading-font-family);
        letter-spacing: -0.5px;
      }

      p {
        margin: 0;
        font-size: 13px;
        color: var(--text-secondary);
        line-height: 1.5;
        max-width: 650px;
      }
    }

    .lane-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    /* Modern Journey Cards */
    .journey-card-modern {
      display: flex;
      align-items: center;
      gap: 18px;
      text-decoration: none;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 20px;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;

      &:hover {
        border-color: var(--primary-color);
        box-shadow: var(--shadow-md);
        transform: translateY(-2px);

        .card-arrow {
          transform: translateX(4px);
          opacity: 1;
        }

        .card-icon-wrapper {
          transform: scale(1.1);
          background: var(--primary-glow);
        }
      }
    }

    .card-icon-wrapper {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: var(--border-light);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
      transition: all 0.2s ease;
    }

    .card-body {
      flex: 1;
      min-width: 0;

      h3 {
        margin: 0 0 4px;
        font-size: 14px;
        font-weight: 700;
        color: var(--text-primary);
      }

      p {
        margin: 0 0 10px;
        font-size: 12px;
        line-height: 1.5;
        color: var(--text-secondary);
      }
    }

    .card-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .tag-pill {
      font-size: 10px;
      font-weight: 500;
      color: var(--text-secondary);
      background: var(--border-light);
      border: 1px solid var(--border-color);
      padding: 2px 8px;
      border-radius: 99px;
    }

    .card-arrow {
      font-size: 18px;
      color: var(--primary-color);
      transition: all 0.2s ease;
      opacity: 0.5;
    }

    /* Compare Section */
    .compare-section-modern {
      display: flex;
      flex-direction: column;
      gap: 20px;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 32px;
      box-shadow: var(--shadow-sm);
    }

    .compare-grid-modern {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-top: 10px;
    }

    .compare-card-modern {
      text-decoration: none;
      background: var(--border-light);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        background: var(--bg-secondary);
        border-color: var(--primary-color);
        box-shadow: var(--shadow-md);
        transform: translateY(-2px);

        .compare-arrow {
          transform: translateX(4px);
        }
      }
    }

    .compare-head {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .compare-title {
        font-size: 13px;
        font-weight: 750;
        color: var(--text-primary);
      }

      .compare-arrow {
        font-size: 14px;
        color: var(--primary-color);
        transition: transform 0.2s ease;
      }
    }

    .compare-desc {
      margin: 0;
      font-size: 12px;
      color: var(--text-secondary);
      line-height: 1.4;
      flex: 1;
    }

    .compare-footer-note {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      font-size: 10px;
      border-top: 1px solid var(--border-color);
      padding-top: 8px;
      margin-top: 4px;
      color: var(--text-secondary);
      opacity: 0.85;

      .note-icon {
        flex-shrink: 0;
      }
      .note-text {
        line-height: 1.35;
      }
    }

    /* Starter sequence card */
    .starter-card-modern {
      position: relative;
      border-radius: 16px;
      background: linear-gradient(135deg, #0b0f19 0%, #1e293b 100%);
      padding: 36px 40px;
      overflow: hidden;
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.08);

      h3 {
        margin: 0 0 6px;
        font-size: 20px;
        font-weight: 800;
        font-family: var(--ngx-heading-font-family);
        color: #ffffff;
      }

      p {
        margin: 0 0 20px;
        font-size: 13px;
        color: #94a3b8;
        max-width: 600px;
        line-height: 1.5;
      }
    }

    .starter-glow {
      position: absolute;
      bottom: -40%;
      left: -10%;
      width: 280px;
      height: 280px;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%);
      filter: blur(30px);
      pointer-events: none;
    }

    .npm-command-box {
      width: fit-content;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 18px;
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      font-family: 'SF Mono', Consolas, Monaco, monospace;
      font-size: 13px;

      .command-prefix {
        color: #38bdf8;
        font-weight: 700;
      }

      .command-text {
        color: #e2e8f0;
      }

      .copy-icon-btn {
        background: none;
        border: none;
        color: #94a3b8;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s ease;

        &:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.08);
        }
      }
    }

    /* Responsive layouts */
    @media (max-width: 980px) {
      .lane-grid {
        grid-template-columns: 1fr;
      }

      .compare-grid-modern {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .hero-card {
        padding: 32px;
        h1 {
          font-size: 30px;
        }
      }
    }

    @media (max-width: 640px) {
      .compare-grid-modern {
        grid-template-columns: 1fr;
      }
      
      .home-page {
        padding: 20px 16px;
      }
    }
  `]
})
export class HomeComponent {
  buildCards = BUILD_CARDS;
  exploreCards = EXPLORE_CARDS;
  compareTracks = COMPARE_TRACKS;
  integrateCards = INTEGRATE_CARDS;
  quickSearchPresets = ['grid', 'charts', 'buttons', 'dialog', 'gantt'];

  searchText = signal('');

  filteredBuildCards = computed(() => this.filterCards(this.buildCards));
  filteredExploreCards = computed(() => this.filterCards(this.exploreCards));
  filteredIntegrateCards = computed(() => this.filterCards(this.integrateCards));

  visibleCount = computed(() =>
    this.filteredBuildCards().length + this.filteredExploreCards().length + this.filteredIntegrateCards().length
  );

  hasAnyVisibleCards = computed(() => this.visibleCount() > 0);

  private filterCards(cards: Array<{ title: string; description: string; icon?: string; route?: string[] | string; tags?: string[] }>) {
    const query = this.searchText().trim().toLowerCase();
    if (!query) {
      return cards;
    }

    return cards.filter(card => {
      const haystack = [card.title, card.description, ...(card.tags || [])].join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }

  focusSearchInput(): void {
    const input = document.getElementById('componentSearch') as HTMLInputElement | null;
    input?.focus();
    input?.select();
  }

  clearSearch(): void {
    this.searchText.set('');
  }

  applyQuickSearch(term: string): void {
    this.searchText.set(term);
    this.focusSearchInput();
  }

  @HostListener('document:keydown', ['$event'])
  handleGlobalShortcut(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    const isTypingTarget = target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);

    if (event.key === '/' && !isTypingTarget && !event.metaKey && !event.ctrlKey && !event.altKey) {
      event.preventDefault();
      this.focusSearchInput();
    }
  }

  copyNpmCommand(event: MouseEvent): void {
    const command = 'npm install ngx-core-components';
    const btn = event.currentTarget as HTMLButtonElement;
    const original = btn.innerText;

    const copy = async () => {
      try {
        await navigator.clipboard.writeText(command);
      } catch {
        const helper = document.createElement('textarea');
        helper.value = command;
        helper.setAttribute('readonly', '');
        helper.style.position = 'fixed';
        helper.style.top = '-9999px';
        document.body.appendChild(helper);
        helper.select();
        document.execCommand('copy');
        document.body.removeChild(helper);
      }

      btn.innerText = 'Copied!';
      btn.style.background = 'rgba(16, 185, 129, 0.12)';
      btn.style.color = '#10b981';
      setTimeout(() => {
        btn.innerText = original;
        btn.style.background = '';
        btn.style.color = '';
      }, 1500);
    };

    void copy();
  }
}
