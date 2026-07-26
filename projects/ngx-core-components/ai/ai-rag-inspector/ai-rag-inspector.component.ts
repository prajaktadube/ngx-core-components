import { Component, input, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RAGSource } from './models';

@Component({
  selector: 'ngx-ai-rag-inspector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="rag-inspector" [class.dark]="theme() === 'dark'" [class.splitscreen]="activeChunk() !== null">
      <!-- Header with Search & Title -->
      <div class="inspector-header">
        <div class="header-main">
          <span class="sparkle-icon">🔍</span>
          <h4 class="title">{{ title() }}</h4>
          <span class="badge" *ngIf="sources().length > 0">{{ filteredSources().length }} Citations</span>
        </div>
        
        <div class="header-controls">
          <div class="search-box">
            <input
              type="text"
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
              placeholder="Search matching snippets..."
              class="search-input"
            />
          </div>

          <button 
            type="button" 
            class="view-mode-btn" 
            [class.active]="viewMode() === 'splitscreen'"
            (click)="toggleViewMode()"
            title="Toggle Side-by-Side Chunk Viewer"
          >
            <svg viewBox="0 0 24 24" class="mode-icon"><path d="M4 4h7v16H4V4zm9 0h7v16h-7V4z"/></svg>
            <span>{{ viewMode() === 'splitscreen' ? 'Side-by-Side' : 'List View' }}</span>
          </button>
        </div>
      </div>

      <!-- Main Layout Body (Splitscreen or Single Column) -->
      <div class="inspector-body" [class.is-splitscreen]="viewMode() === 'splitscreen' && activeChunk() !== null">
        <!-- Left Pane: Citations List -->
        <div class="sources-container">
          @if (filteredSources().length === 0) {
            <div class="empty-state">
              <span class="empty-icon">📂</span>
              <p class="empty-text">No document citations found for the search query.</p>
            </div>
          } @else {
            <div class="sources-list">
              @for (src of filteredSources(); track src.id) {
                <div 
                  class="source-card" 
                  [class.expanded]="expandedId() === src.id"
                  [class.active-selected]="activeChunk()?.id === src.id"
                  [class.has-feedback]="feedbackMap[src.id] !== undefined"
                  (click)="selectChunk(src)"
                >
                  <!-- Card Header -->
                  <div class="card-summary">
                    <div class="source-type-icon" [title]="src.sourceType">
                      @switch (src.sourceType) {
                        @case ('pdf') {
                          <svg viewBox="0 0 24 24" class="svg-icon red"><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3.5h-3v1.5h2V11h-2v1.5H19V7.5h1.5v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm11 2.5h1v3h-1v-3z"/></svg>
                        }
                        @case ('docx') {
                          <svg viewBox="0 0 24 24" class="svg-icon blue"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                        }
                        @case ('txt') {
                          <svg viewBox="0 0 24 24" class="svg-icon slate"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                        }
                        @case ('csv') {
                          <svg viewBox="0 0 24 24" class="svg-icon green"><path d="M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 4h3v3H5V8zm5 0h4v3h-4V8zm9 0v3h-4V8h4zm-9 5h4v3h-4v-3zm9 0v3h-4v-3h4zM5 13h3v3H5v-3z"/></svg>
                        }
                        @case ('web') {
                          <svg viewBox="0 0 24 24" class="svg-icon purple"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.53c-.26-.81-1-1.4-1.9-1.4h-1v-3c0-.55-.45-1-1-1h-6v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                        }
                        @default {
                          <svg viewBox="0 0 24 24" class="svg-icon gray"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                        }
                      }
                    </div>

                    <div class="meta-info">
                      <span class="source-title">{{ src.title }}</span>
                      <div class="badge-row">
                        <span class="meta-badge" *ngIf="src.metadata?.pageNumber">Page {{ src.metadata?.pageNumber }}</span>
                        <span class="meta-badge" *ngIf="src.metadata?.chunkIndex">Chunk #{{ src.metadata?.chunkIndex }}</span>
                      </div>
                    </div>

                    <!-- Similarity Bar -->
                    <div class="similarity-score-wrap" (click)="$event.stopPropagation()">
                      <div class="score-label">
                        <span>Match</span>
                        <strong>{{ (src.score * 100).toFixed(0) }}%</strong>
                      </div>
                      <div class="score-bar-track">
                        <div 
                          class="score-bar-fill"
                          [style.width.%]="src.score * 100"
                          [class.high]="src.score >= 0.8"
                          [class.medium]="src.score >= 0.5 && src.score < 0.8"
                          [class.low]="src.score < 0.5"
                        ></div>
                      </div>
                    </div>

                    <!-- Expand Arrow -->
                    <div class="expand-indicator">
                      <svg viewBox="0 0 24 24" class="arrow-icon"><path d="M7 10l5 5 5-5z"/></svg>
                    </div>
                  </div>

                  <!-- Expanded Content Area -->
                  <div class="card-details" (click)="$event.stopPropagation()">
                    <div class="snippet-content">
                      <pre class="snippet-text" [innerHTML]="highlightText(src.snippet)"></pre>
                    </div>

                    <div class="footer-actions">
                      <!-- Path metadata -->
                      <div class="file-path" *ngIf="src.metadata?.filePath" [title]="src.metadata?.filePath">
                        <span>Path: </span><code>{{ src.metadata?.filePath }}</code>
                      </div>

                      <!-- Helpful feedback controls -->
                      <div class="feedback-controls">
                        <span class="feedback-label">Helpful citation?</span>
                        <button 
                          class="feedback-btn thumbs-up"
                          [class.selected]="feedbackMap[src.id] === 'up'"
                          (click)="submitFeedback(src, 'up')"
                          title="Yes, helpful"
                        >
                          👍
                        </button>
                        <button 
                          class="feedback-btn thumbs-down"
                          [class.selected]="feedbackMap[src.id] === 'down'"
                          (click)="submitFeedback(src, 'down')"
                          title="No, unhelpful"
                        >
                          👎
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Right Pane: Side-by-Side Source Document & Chunk Highlight Viewer -->
        @if (viewMode() === 'splitscreen' && activeChunk() !== null) {
          <div class="doc-viewer-pane">
            <div class="doc-viewer-header">
              <div class="doc-title-row">
                <span class="doc-icon">📄</span>
                <div class="doc-heading">
                  <h4 class="doc-name">{{ activeChunk()?.title }}</h4>
                  <span class="doc-sub">Interactive Document Context Viewer</span>
                </div>
              </div>
              <div class="doc-nav-tools">
                <button type="button" class="nav-step-btn" (click)="navigateChunk(-1)" title="Previous Chunk">◀ Prev</button>
                <button type="button" class="nav-step-btn" (click)="navigateChunk(1)" title="Next Chunk">Next ▶</button>
                <button type="button" class="close-viewer-btn" (click)="closeViewer()" title="Close side panel">✕</button>
              </div>
            </div>

            <!-- Context Document Content Area -->
            <div class="doc-viewer-body">
              <div class="doc-meta-banner">
                <span class="meta-tag">Similarity: <strong>{{ ((activeChunk()?.score || 0) * 100).toFixed(0) }}%</strong></span>
                <span class="meta-tag" *ngIf="activeChunk()?.metadata?.pageNumber">Page: {{ activeChunk()?.metadata?.pageNumber }}</span>
                <span class="meta-tag" *ngIf="activeChunk()?.metadata?.chunkIndex">Chunk Index: #{{ activeChunk()?.metadata?.chunkIndex }}</span>
              </div>

              <!-- Context View with Highlighted Chunk -->
              <div class="doc-context-content">
                <div class="chunk-marker">--- BEGIN CONTEXT WINDOW ---</div>
                <div class="chunk-highlight-box">
                  <div class="active-chunk-badge">Selected RAG Citation Chunk</div>
                  <pre class="chunk-highlight-text" [innerHTML]="highlightText(activeChunk()?.snippet || '')"></pre>
                </div>
                <div class="chunk-marker">--- END CONTEXT WINDOW ---</div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .rag-inspector {
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: var(--radius-md, 12px);
      box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.08));
      display: flex;
      flex-direction: column;
      overflow: hidden;
      font-family: var(--ngx-font-family, system-ui, -apple-system, sans-serif);
      transition: all 0.3s ease;
    }

    /* Header styling */
    .inspector-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-color, #e2e8f0);
      background: var(--border-light, #f8fafc);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .header-main {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .sparkle-icon {
      font-size: 16px;
    }

    .title {
      margin: 0;
      font-size: 15px;
      font-weight: 750;
      color: var(--text-primary, #0f172a);
    }

    .badge {
      font-size: 10px;
      font-weight: 700;
      background: var(--primary-glow, rgba(79, 70, 229, 0.15));
      color: var(--primary-color, #4f46e5);
      padding: 2px 8px;
      border-radius: 9999px;
    }

    .search-box {
      min-width: 200px;
      flex: 1;
      max-width: 300px;
    }

    .search-input {
      width: 100%;
      border: 1px solid var(--border-color, #cbd5e1);
      border-radius: 6px;
      padding: 6px 12px;
      font-size: 12px;
      outline: none;
      background: var(--bg-primary, #ffffff);
      color: var(--text-primary, #0f172a);
      transition: border-color 0.15s;
    }

    .search-input:focus {
      border-color: var(--primary-color, #4f46e5);
    }

    /* Sources container and list */
    .sources-container {
      padding: 16px;
      overflow-y: auto;
      max-height: 450px;
      background: var(--bg-primary, #ffffff);
    }

    .sources-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    /* Source card styling */
    .source-card {
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 8px;
      background: var(--bg-secondary, #ffffff);
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .source-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
      border-color: var(--border-color-hover, #cbd5e1);
      transform: translateY(-1px);
    }

    .source-card.expanded {
      border-color: var(--primary-color, #4f46e5);
      box-shadow: 0 4px 16px var(--primary-glow, rgba(79, 70, 229, 0.1));
    }

    .source-card.has-feedback {
      background: rgba(248, 250, 252, 0.5);
    }

    /* Summary row details */
    .card-summary {
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .source-type-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: var(--border-light, #f1f5f9);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .svg-icon {
      width: 20px;
      height: 20px;
    }

    .svg-icon.red { fill: #ef4444; }
    .svg-icon.blue { fill: #3b82f6; }
    .svg-icon.green { fill: #10b981; }
    .svg-icon.purple { fill: #8b5cf6; }
    .svg-icon.slate { fill: #64748b; }
    .svg-icon.gray { fill: #94a3b8; }

    .meta-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 150px;
    }

    .source-title {
      font-size: 13.5px;
      font-weight: 650;
      color: var(--text-primary, #1e293b);
      word-break: break-all;
    }

    .badge-row {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .meta-badge {
      font-size: 10px;
      background: var(--border-light, #f1f5f9);
      color: var(--text-secondary, #64748b);
      padding: 1px 6px;
      border-radius: 4px;
      font-weight: 600;
    }

    /* Similarity score styling */
    .similarity-score-wrap {
      display: flex;
      flex-direction: column;
      gap: 4px;
      width: 110px;
      flex-shrink: 0;
    }

    .score-label {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: var(--text-secondary, #64748b);
      font-weight: 600;
    }

    .score-bar-track {
      height: 6px;
      background: var(--border-color, #e2e8f0);
      border-radius: 3px;
      overflow: hidden;
    }

    .score-bar-fill {
      height: 100%;
      border-radius: 3px;
    }

    .score-bar-fill.high { background: #10b981; }
    .score-bar-fill.medium { background: #f59e0b; }
    .score-bar-fill.low { background: #ef4444; }

    .expand-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted, #94a3b8);
      transition: transform 0.2s ease;
      flex-shrink: 0;
    }

    .arrow-icon {
      width: 20px;
      height: 20px;
      fill: currentColor;
    }

    .source-card.expanded .expand-indicator {
      transform: rotate(180deg);
      color: var(--primary-color, #4f46e5);
    }

    /* Card expanded details snippet content */
    .card-details {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.25s cubic-bezier(0, 1, 0, 1);
      border-top: 1px solid transparent;
      background: rgba(0, 0, 0, 0.01);
    }

    .source-card.expanded .card-details {
      max-height: 1000px;
      border-top-color: var(--border-color, #e2e8f0);
      transition: max-height 0.3s ease-in;
    }

    .snippet-content {
      padding: 16px 20px;
    }

    .snippet-text {
      margin: 0;
      white-space: pre-wrap;
      font-family: inherit;
      font-size: 12.5px;
      line-height: 1.6;
      color: var(--text-primary, #334155);
    }

    ::ng-deep .highlight-mark {
      background: #fef08a;
      color: #854d0e;
      padding: 1px 3px;
      border-radius: 3px;
      font-weight: 600;
    }

    .footer-actions {
      padding: 12px 20px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      border-top: 1px dashed var(--border-color, #e2e8f0);
      font-size: 11px;
    }

    .file-path {
      color: var(--text-secondary, #64748b);
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      max-width: 60%;
    }

    .file-path code {
      background: var(--border-light, #f1f5f9);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
    }

    .feedback-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .feedback-label {
      color: var(--text-secondary, #64748b);
      font-weight: 600;
    }

    .feedback-btn {
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 6px;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 11px;
      transition: all 0.2s;
    }

    .feedback-btn:hover {
      border-color: var(--text-secondary, #94a3b8);
      background: var(--border-light, #f8fafc);
    }

    .feedback-btn.selected {
      border-color: var(--primary-color, #4f46e5);
      background: var(--primary-glow, rgba(79, 70, 229, 0.08));
      transform: scale(1.1);
    }

    .empty-state {
      padding: 40px 20px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .empty-icon {
      font-size: 32px;
      margin-bottom: 8px;
      opacity: 0.6;
    }

    .empty-text {
      color: var(--text-secondary, #64748b);
      font-style: italic;
      font-size: 12px;
      margin: 0;
    }

    .header-controls {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
      justify-content: flex-end;
    }

    .view-mode-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #cbd5e1);
      border-radius: 6px;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-primary, #1e293b);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .view-mode-btn:hover {
      background: var(--border-light, #f1f5f9);
    }
    .view-mode-btn.active {
      background: #4f46e5;
      color: #ffffff;
      border-color: #4f46e5;
    }
    .mode-icon {
      width: 14px;
      height: 14px;
      fill: currentColor;
    }

    .inspector-body {
      display: flex;
      flex-direction: column;
      width: 100%;
    }
    .inspector-body.is-splitscreen {
      display: grid;
      grid-template-columns: 1fr 1.2fr;
      divide-x: 1px solid var(--border-color, #e2e8f0);
    }
    @media (max-width: 840px) {
      .inspector-body.is-splitscreen {
        grid-template-columns: 1fr;
      }
    }

    .source-card.active-selected {
      border-color: #4f46e5 !important;
      box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2) !important;
      background: rgba(79, 70, 229, 0.04) !important;
    }

    /* Side-by-Side Document Viewer Pane */
    .doc-viewer-pane {
      background: var(--bg-primary, #f8fafc);
      display: flex;
      flex-direction: column;
      border-left: 1px solid var(--border-color, #e2e8f0);
      overflow: hidden;
    }

    .doc-viewer-header {
      padding: 14px 18px;
      background: var(--bg-secondary, #ffffff);
      border-bottom: 1px solid var(--border-color, #e2e8f0);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }
    .doc-title-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .doc-icon {
      font-size: 20px;
    }
    .doc-name {
      margin: 0;
      font-size: 14px;
      font-weight: 700;
      color: var(--text-primary, #0f172a);
    }
    .doc-sub {
      font-size: 11px;
      color: var(--text-secondary, #64748b);
    }

    .doc-nav-tools {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .nav-step-btn {
      background: var(--bg-primary, #f1f5f9);
      border: 1px solid var(--border-color, #cbd5e1);
      border-radius: 4px;
      padding: 4px 8px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      color: var(--text-primary, #334155);
      transition: all 0.2s;
    }
    .nav-step-btn:hover {
      background: #e2e8f0;
    }
    .close-viewer-btn {
      background: transparent;
      border: none;
      font-size: 14px;
      cursor: pointer;
      color: #64748b;
      padding: 4px 8px;
      border-radius: 4px;
    }
    .close-viewer-btn:hover {
      background: rgba(0,0,0,0.08);
      color: #0f172a;
    }

    .doc-viewer-body {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      overflow-y: auto;
      max-height: 520px;
    }
    .doc-meta-banner {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .meta-tag {
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 11px;
      color: #475569;
    }
    .doc-context-content {
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #cbd5e1);
      border-radius: 8px;
      padding: 16px;
      font-family: var(--ngx-font-family, sans-serif);
      line-height: 1.6;
    }
    .chunk-marker {
      font-size: 10px;
      font-weight: 700;
      color: #94a3b8;
      letter-spacing: 1px;
      margin: 8px 0;
      text-align: center;
    }
    .chunk-highlight-box {
      background: rgba(254, 240, 138, 0.35);
      border: 2px dashed #f59e0b;
      border-radius: 8px;
      padding: 12px 14px;
      position: relative;
      margin: 12px 0;
    }
    .active-chunk-badge {
      position: absolute;
      top: -10px;
      left: 14px;
      background: #f59e0b;
      color: #ffffff;
      font-size: 9px;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .chunk-highlight-text {
      margin: 0;
      white-space: pre-wrap;
      font-size: 13px;
      color: #1e293b;
      font-family: inherit;
    }

    /* Dark Mode styling overrides */
    .rag-inspector.dark {
      background: #0f172a;
      border-color: #1f2937;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
    }

    .rag-inspector.dark .doc-viewer-pane {
      background: #0b0f19;
      border-left-color: #1f2937;
    }
    .rag-inspector.dark .doc-viewer-header {
      background: #1e293b;
      border-bottom-color: #1f2937;
    }
    .rag-inspector.dark .doc-name {
      color: #f8fafc;
    }
    .rag-inspector.dark .doc-context-content {
      background: #1e293b;
      border-color: #334155;
    }
    .rag-inspector.dark .chunk-highlight-box {
      background: rgba(245, 158, 11, 0.15);
      border-color: #d97706;
    }
    .rag-inspector.dark .chunk-highlight-text {
      color: #f8fafc;
    }

    .rag-inspector.dark .inspector-header {
      background: #1e293b;
      border-bottom-color: #1f2937;
    }

    .rag-inspector.dark .title {
      color: #f8fafc;
    }

    .rag-inspector.dark .search-input {
      border-color: #374151;
      background: #0b0f19;
      color: #f8fafc;
    }

    .rag-inspector.dark .search-input:focus {
      border-color: var(--primary-color, #6366f1);
    }

    .rag-inspector.dark .sources-container {
      background: #0f172a;
    }

    .rag-inspector.dark .source-card {
      border-color: #1f2937;
      background: #1e293b;
    }

    .rag-inspector.dark .source-card:hover {
      border-color: #374151;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
    }

    .rag-inspector.dark .source-card.expanded {
      border-color: var(--primary-color, #6366f1);
      box-shadow: 0 4px 16px rgba(99, 102, 241, 0.15);
    }

    .rag-inspector.dark .source-card.has-feedback {
      background: rgba(15, 23, 42, 0.5);
    }

    .rag-inspector.dark .source-type-icon {
      background: #0f172a;
    }

    .rag-inspector.dark .source-title {
      color: #f8fafc;
    }

    .rag-inspector.dark .meta-badge {
      background: #0f172a;
      color: #94a3b8;
    }

    .rag-inspector.dark .score-bar-track {
      background: #1f2937;
    }

    .rag-inspector.dark .snippet-text {
      color: #cbd5e1;
    }

    .rag-inspector.dark ::ng-deep .highlight-mark {
      background: #854d0e;
      color: #fef08a;
    }

    .rag-inspector.dark .footer-actions {
      border-top-color: #1f2937;
    }

    .rag-inspector.dark .file-path {
      color: #94a3b8;
    }

    .rag-inspector.dark .file-path code {
      background: #0f172a;
      color: #cbd5e1;
    }

    .rag-inspector.dark .feedback-btn {
      background: #1e293b;
      border-color: #374151;
    }

    .rag-inspector.dark .feedback-btn:hover {
      background: #1f2937;
      border-color: #4b5563;
    }

    .rag-inspector.dark .feedback-btn.selected {
      border-color: var(--primary-color, #6366f1);
      background: rgba(99, 102, 241, 0.15);
    }
  `]
})
export class AIRagInspectorComponent {
  // Inputs
  sources = input<RAGSource[]>([]);
  title = input<string>('Search Citations & Sources');
  theme = input<'light' | 'dark'>('light');

  // Outputs
  sourceClick = output<RAGSource>();
  sourceFeedback = output<{ sourceId: string; type: 'up' | 'down' }>();

  // State
  searchQuery = signal<string>('');
  expandedId = signal<string | null>(null);
  viewMode = signal<'splitscreen' | 'list'>('splitscreen');
  activeChunk = signal<RAGSource | null>(null);

  // Map to store feedback local state
  feedbackMap: Record<string, 'up' | 'down'> = {};

  // Compute filtered sources based on search keyword
  filteredSources = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const list = this.sources() || [];

    if (!query) return list;

    return list.filter(
      s => 
        s.title.toLowerCase().includes(query) ||
        s.snippet.toLowerCase().includes(query) ||
        (s.metadata?.filePath && s.metadata.filePath.toLowerCase().includes(query))
    );
  });

  toggleViewMode(): void {
    this.viewMode.update(m => m === 'splitscreen' ? 'list' : 'splitscreen');
  }

  selectChunk(source: RAGSource): void {
    this.activeChunk.set(source);
    this.toggleExpand(source.id);
    this.sourceClick.emit(source);
  }

  closeViewer(): void {
    this.activeChunk.set(null);
  }

  navigateChunk(delta: number): void {
    const list = this.filteredSources();
    if (list.length === 0) return;
    const current = this.activeChunk();
    if (!current) {
      this.activeChunk.set(list[0]);
      return;
    }
    const idx = list.findIndex(s => s.id === current.id);
    if (idx !== -1) {
      const nextIdx = (idx + delta + list.length) % list.length;
      const nextChunk = list[nextIdx];
      this.activeChunk.set(nextChunk);
      this.expandedId.set(nextChunk.id);
      this.sourceClick.emit(nextChunk);
    }
  }

  toggleExpand(id: string): void {
    if (this.expandedId() === id) {
      this.expandedId.set(null);
    } else {
      this.expandedId.set(id);
      const matched = this.sources().find(s => s.id === id);
      if (matched) {
        this.sourceClick.emit(matched);
      }
    }
  }

  submitFeedback(source: RAGSource, type: 'up' | 'down'): void {
    if (this.feedbackMap[source.id] === type) {
      // Toggle off
      delete this.feedbackMap[source.id];
    } else {
      this.feedbackMap[source.id] = type;
    }
    this.sourceFeedback.emit({ sourceId: source.id, type });
  }

  // Basic HTML text highlight formatter
  highlightText(text: string): string {
    const query = this.searchQuery().toLowerCase().trim();
    if (!text || !query) return this.escapeHtml(text);

    // Escape code
    const escaped = this.escapeHtml(text);
    
    // Find matches safely and wrap with dynamic class highlight-mark
    try {
      // Avoid breaking search if containing regex chars
      const safeQuery = query.replace(/[-\\/\\\\^$*+?.()|[\\]{}]/g, '\\$&');
      const regex = new RegExp(`(${safeQuery})`, 'gi');
      return escaped.replace(regex, '<mark class="highlight-mark">$1</mark>');
    } catch (e) {
      return escaped;
    }
  }

  private escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
