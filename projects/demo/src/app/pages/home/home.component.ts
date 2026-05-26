import { Component } from '@angular/core';
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
      <section class="hero">
        <div class="hero-badge">Angular UI System</div>
        <h1>Pick a goal. Reach the right demo fast.</h1>
        <p>
          This workspace is organized around tasks, not only component names.
          Choose what you want to build, explore, compare, or integrate.
        </p>
        <div class="hero-actions">
          <a class="btn btn-primary" routerLink="/getting-started">Start building</a>
          <a class="btn btn-ghost" routerLink="/charts">Browse components</a>
        </div>
      </section>

      <section class="flow-strip">
        <a class="flow-node" routerLink="/getting-started">Build</a>
        <a class="flow-node" routerLink="/charts">Explore</a>
        <a class="flow-node" routerLink="/large-dataset">Compare</a>
        <a class="flow-node" routerLink="/dialog">Integrate</a>
      </section>

      <section class="lane-grid">
        <article class="lane">
          <header>
            <h2>Build</h2>
            <p>Start from fundamentals and compose a polished screen quickly.</p>
          </header>
          <div class="lane-cards">
            @for (card of buildCards; track card.title) {
              <a class="journey-card" [routerLink]="card.route">
                <div class="icon">{{ card.icon }}</div>
                <div class="body">
                  <h3>{{ card.title }}</h3>
                  <p>{{ card.description }}</p>
                  <div class="tags">
                    @for (tag of card.tags; track tag) {
                      <span>{{ tag }}</span>
                    }
                  </div>
                </div>
              </a>
            }
          </div>
        </article>

        <article class="lane">
          <header>
            <h2>Explore</h2>
            <p>Inspect advanced capabilities for charts, tables, and interactions.</p>
          </header>
          <div class="lane-cards">
            @for (card of exploreCards; track card.title) {
              <a class="journey-card" [routerLink]="card.route">
                <div class="icon">{{ card.icon }}</div>
                <div class="body">
                  <h3>{{ card.title }}</h3>
                  <p>{{ card.description }}</p>
                  <div class="tags">
                    @for (tag of card.tags; track tag) {
                      <span>{{ tag }}</span>
                    }
                  </div>
                </div>
              </a>
            }
          </div>
        </article>
      </section>

      <section class="compare-lane">
        <header>
          <h2>Compare</h2>
          <p>Choose the right Gantt scenario based on data scale and interaction needs.</p>
        </header>
        <div class="compare-table">
          @for (track of compareTracks; track track.name) {
            <a class="compare-row" [routerLink]="track.route">
              <strong>{{ track.name }}</strong>
              <span>{{ track.bestFor }}</span>
              <em>{{ track.note }}</em>
            </a>
          }
        </div>
      </section>

      <section class="integrate-lane">
        <header>
          <h2>Integrate</h2>
          <p>Finalize UX with overlay flows, navigation glue, and utility components.</p>
        </header>
        <div class="lane-cards">
          @for (card of integrateCards; track card.title) {
            <a class="journey-card" [routerLink]="card.route">
              <div class="icon">{{ card.icon }}</div>
              <div class="body">
                <h3>{{ card.title }}</h3>
                <p>{{ card.description }}</p>
                <div class="tags">
                  @for (tag of card.tags; track tag) {
                    <span>{{ tag }}</span>
                  }
                </div>
              </div>
            </a>
          }
        </div>
      </section>

      <section class="starter-kit">
        <div class="starter-copy">
          <h2>Starter sequence</h2>
          <p>
            If you are evaluating quickly, follow this sequence: Getting Started,
            Inputs, Grid, Charts, and Dialog.
          </p>
        </div>
        <pre>npm install ngx-core-components

      import &#123; ButtonComponent, DataGridComponent &#125; from 'ngx-core-components';</pre>
      </section>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      --ink: #142136;
      --ink-soft: #596378;
      --line: #dce4ee;
      --accent: #0c7b73;
      --accent-dark: #075149;
      --surface: #ffffff;
      --surface-soft: #f6f9fd;
    }

    .home-page {
      max-width: 1200px;
      margin: 0 auto;
      padding: 10px 4px 24px;
      display: grid;
      gap: 18px;
    }

    .hero {
      border-radius: 16px;
      background:
        radial-gradient(600px 220px at 90% -40px, rgba(12, 123, 115, 0.14), transparent 65%),
        linear-gradient(145deg, #ffffff 0%, #f7fbff 100%);
      border: 1px solid var(--line);
      padding: 24px;

      h1 {
        margin: 8px 0;
        font-size: 34px;
        line-height: 1.12;
        letter-spacing: -0.6px;
        color: var(--ink);
      }

      p {
        margin: 0;
        color: var(--ink-soft);
        max-width: 760px;
        line-height: 1.65;
      }
    }

    .hero-badge {
      display: inline-block;
      font-size: 11px;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      font-weight: 700;
      color: #0f4e71;
      background: #dff1ff;
      padding: 6px 10px;
      border-radius: 999px;
    }

    .hero-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 16px;
    }

    .btn {
      text-decoration: none;
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 13px;
      font-weight: 700;
      transition: transform 0.2s ease;

      &:hover {
        transform: translateY(-1px);
      }
    }

    .btn-primary {
      color: #fff;
      background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%);
    }

    .btn-ghost {
      color: #1d2f4b;
      border: 1px solid #c9d8ea;
      background: #fff;
    }

    .flow-strip {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 10px;
    }

    .flow-node {
      text-decoration: none;
      text-align: center;
      background: var(--surface);
      border: 1px solid var(--line);
      color: #20405d;
      padding: 10px;
      border-radius: 11px;
      font-weight: 700;
      transition: all 0.2s ease;

      &:hover {
        border-color: #86c8c2;
        background: #ecf8f6;
      }
    }

    .lane-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }

    .lane,
    .compare-lane,
    .integrate-lane,
    .starter-kit {
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 14px;
    }

    .lane header,
    .compare-lane header,
    .integrate-lane header {
      margin-bottom: 10px;

      h2 {
        margin: 0;
        font-size: 19px;
        color: var(--ink);
      }

      p {
        margin: 3px 0 0;
        color: var(--ink-soft);
        font-size: 13px;
      }
    }

    .lane-cards {
      display: grid;
      gap: 10px;
    }

    .journey-card {
      display: flex;
      gap: 10px;
      align-items: flex-start;
      text-decoration: none;
      border: 1px solid #d8e2ee;
      border-radius: 11px;
      padding: 10px;
      background: var(--surface-soft);
      transition: border-color 0.2s ease;

      &:hover {
        border-color: #86c8c2;
      }
    }

    .icon {
      width: 30px;
      text-align: center;
      font-size: 19px;
      line-height: 1.3;
    }

    .body {
      h3 {
        margin: 0;
        color: #1c2e47;
        font-size: 14px;
      }

      p {
        margin: 4px 0 8px;
        font-size: 12px;
        line-height: 1.5;
        color: #58627a;
      }
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;

      span {
        font-size: 10px;
        color: #2d4a67;
        border: 1px solid #bfd2e7;
        padding: 2px 7px;
        border-radius: 999px;
        background: #eef4fb;
      }
    }

    .compare-table {
      display: grid;
      gap: 8px;
    }

    .compare-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
      padding: 10px;
      border: 1px solid #dce6f2;
      border-radius: 10px;
      text-decoration: none;
      background: #fafcff;
      color: #25344d;

      strong {
        font-size: 13px;
      }

      span,
      em {
        font-size: 12px;
        font-style: normal;
        color: #5a667f;
      }
    }

    .starter-kit {
      display: grid;
      grid-template-columns: 1.1fr 1fr;
      gap: 12px;
      align-items: center;

      h2 {
        margin: 0;
        font-size: 20px;
        color: var(--ink);
      }

      p {
        margin: 5px 0 0;
        color: var(--ink-soft);
        font-size: 13px;
      }

      pre {
        margin: 0;
        border-radius: 10px;
        padding: 12px;
        background: #131a2a;
        color: #d4f1ee;
        font-size: 12px;
        overflow: auto;
      }
    }

    @media (max-width: 980px) {
      .lane-grid {
        grid-template-columns: 1fr;
      }

      .flow-strip {
        grid-template-columns: 1fr 1fr;
      }

      .starter-kit {
        grid-template-columns: 1fr;
      }

      .compare-row {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 640px) {
      .hero {
        padding: 18px;

        h1 {
          font-size: 27px;
        }
      }

      .flow-strip {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class HomeComponent {
  buildCards = BUILD_CARDS;
  exploreCards = EXPLORE_CARDS;
  compareTracks = COMPARE_TRACKS;
  integrateCards = INTEGRATE_CARDS;
}
