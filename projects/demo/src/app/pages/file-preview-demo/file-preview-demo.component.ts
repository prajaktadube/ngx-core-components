import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilePreviewComponent } from 'ngx-core-components/inputs';
import { UploadFileItem } from 'ngx-core-components/inputs';

@Component({
  selector: 'app-file-preview-demo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, FilePreviewComponent],
  template: `
    <div class="demo-page">
      <header class="demo-header">
        <h1>Folder Preview & File Queue View</h1>
        <p>A specialized companion component for uploading queues or folder explorers. Visualizes thumbnails, sizes, types, and progress tracking.</p>
      </header>

      <!-- Layout & Sizing Configuration -->
      <section class="demo-section">
        <h2>Interactive Preview Queue Dashboard</h2>
        <p class="section-desc">Add mock files, change the layout display from grid to list, toggle permissions, and trace actions.</p>
        
        <div class="playground-layout">
          <div class="settings-sidebar">
            <div class="setting-group">
              <label>Layout Style</label>
              <div class="btn-group">
                <button
                  class="layout-btn"
                  [class.active]="selectedLayout === 'grid'"
                  (click)="selectedLayout = 'grid'"
                >
                  Grid Cards
                </button>
                <button
                  class="layout-btn"
                  [class.active]="selectedLayout === 'list'"
                  (click)="selectedLayout = 'list'"
                >
                  Compact List
                </button>
              </div>
            </div>

            <div class="setting-group check-group">
              <label>
                <input type="checkbox" [(ngModel)]="allowDelete" /> Allow Deletion
              </label>
            </div>

            <div class="setting-group check-group">
              <label>
                <input type="checkbox" [(ngModel)]="allowDownload" /> Allow Download
              </label>
            </div>

            <div class="setting-group">
              <label>Simulation Actions</label>
              <div class="action-buttons">
                <button class="mock-action-btn btn-add" (click)="addMockFile()">
                  ➕ Add Random File
                </button>
                <button class="mock-action-btn btn-progress" (click)="simulateUpload()">
                  ⚡ Simulate Upload Progress
                </button>
                <button class="mock-action-btn btn-clear" (click)="clearFiles()">
                  🗑️ Clear All
                </button>
              </div>
            </div>
          </div>

          <div class="display-board">
            <ngx-file-preview
              [files]="filesList()"
              [layout]="selectedLayout"
              [allowDelete]="allowDelete"
              [allowDownload]="allowDownload"
              (delete)="onFileDeleted($event)"
              (download)="onFileDownloaded($event)"
            ></ngx-file-preview>

            <div class="event-logs">
              <h4>Action Event Listener Logs</h4>
              <div class="log-lines">
                @for (log of actionLogs(); track $index) {
                  <div class="log-line">{{ log }}</div>
                }
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Standard Files Showcase -->
      <section class="demo-section">
        <h2>Rendering standard Javascript <code>File</code> items</h2>
        <p class="section-desc">Pass raw Javascript <code>File[]</code> collections (e.g. from <code>&lt;input type="file"&gt;</code>) directly into the component. It standardizes formats and creates safe object URLs dynamically.</p>
        
        <div class="std-files-box">
          <ngx-file-preview
            [files]="standardFiles"
            [allowDelete]="false"
            [allowDownload]="false"
            layout="grid"
          ></ngx-file-preview>
        </div>
      </section>

      <!-- How to Use -->
      <section class="demo-section">
        <h2>How to Use</h2>
        <p class="section-desc">Import the standalone file preview component. Provide a list of Javascript <code>File[]</code> objects or structured <code>UploadFileItem[]</code> queue objects to render upload metrics and controls.</p>
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

    /* ── Dashboard Layout ── */
    .playground-layout {
      display: grid;
      grid-template-columns: 260px 1fr;
      gap: 24px;
      background: var(--bg-secondary, #f8fafc);
      padding: 24px;
      border-radius: 16px;
      border: 1px solid rgba(0, 0, 0, 0.04);
    }

    .settings-sidebar {
      background: white;
      padding: 16px;
      border-radius: 12px;
      border: 1px solid rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .setting-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .setting-group label {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: 0.5px;
    }

    /* Btn group */
    .btn-group {
      display: flex;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      overflow: hidden;
    }

    .layout-btn {
      flex: 1;
      border: none;
      background: #f8fafc;
      padding: 8px 12px;
      font-size: 12px;
      font-weight: 600;
      color: #475569;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .layout-btn.active {
      background: var(--primary-color, #3b82f6);
      color: white;
    }

    .check-group label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .mock-action-btn {
      width: 100%;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      text-align: left;
      background: white;
      transition: all 0.2s ease;
    }

    .mock-action-btn:hover {
      background: #f8fafc;
    }

    .mock-action-btn.btn-add {
      border-color: rgba(59, 130, 246, 0.2);
      color: #3b82f6;
    }
    .mock-action-btn.btn-add:hover {
      background: rgba(59, 130, 246, 0.05);
    }

    .mock-action-btn.btn-progress {
      border-color: rgba(16, 185, 129, 0.2);
      color: #10b981;
    }
    .mock-action-btn.btn-progress:hover {
      background: rgba(16, 185, 129, 0.05);
    }

    .mock-action-btn.btn-clear {
      border-color: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }
    .mock-action-btn.btn-clear:hover {
      background: rgba(239, 68, 68, 0.05);
    }

    /* Display Board */
    .display-board {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .event-logs {
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

    /* Standard Files display box */
    .std-files-box {
      background: white;
      padding: 24px;
      border-radius: 16px;
      border: 1.5px solid rgba(0, 0, 0, 0.05);
    }
  `]
})
export class FilePreviewDemoComponent {
  selectedLayout: 'grid' | 'list' = 'grid';
  allowDelete = true;
  allowDownload = true;

  actionLogs = signal<string[]>([]);

  howToCode = `import { Component, signal } from '@angular/core';
import { FilePreviewComponent, UploadFileItem } from 'ngx-core-components/inputs';

@Component({
  selector: 'app-my-file-queue',
  standalone: true,
  imports: [FilePreviewComponent],
  template: \`
    <ngx-file-preview
      [files]="uploadQueue()"
      layout="grid"
      [allowDelete]="true"
      [allowDownload]="true"
      (delete)="removeFile($event)"
      (download)="downloadFile($event)"
    ></ngx-file-preview>
  \`
})
export class MyFileQueueComponent {
  uploadQueue = signal<UploadFileItem[]>([
    { id: '1', name: 'resume.pdf', size: 102400, type: 'application/pdf', progress: 100, status: 'success' },
    { id: '2', name: 'avatar.jpg', size: 204800, type: 'image/jpeg', progress: 40, status: 'uploading' }
  ]);

  removeFile(file: UploadFileItem) {
    this.uploadQueue.update(q => q.filter(item => item.id !== file.id));
  }

  downloadFile(file: UploadFileItem) {
    window.open(file.url);
  }
}`;

  // Simulation files
  filesList = signal<UploadFileItem[]>([
    {
      id: 'file-1',
      name: 'invoice-report.pdf',
      size: 1240500,
      type: 'application/pdf',
      progress: 100,
      status: 'success',
      formattedSize: '1.18 MB',
      fileObject: new File([''], 'invoice-report.pdf', { type: 'application/pdf' })
    },
    {
      id: 'file-2',
      name: 'banner-draft.png',
      size: 4712000,
      type: 'image/png',
      progress: 65,
      status: 'uploading',
      formattedSize: '4.49 MB',
      fileObject: new File([''], 'banner-draft.png', { type: 'image/png' })
    },
    {
      id: 'file-3',
      name: 'backup-configuration.zip',
      size: 48512400,
      type: 'application/zip',
      progress: 0,
      status: 'pending',
      formattedSize: '46.26 MB',
      fileObject: new File([''], 'backup-configuration.zip', { type: 'application/zip' })
    },
    {
      id: 'file-4',
      name: 'unsupported-file-extension.xyz',
      size: 12400,
      type: 'text/plain',
      progress: 100,
      status: 'error',
      errorMessage: 'Invalid file extension (xyz)',
      formattedSize: '12.1 KB',
      fileObject: new File([''], 'unsupported-file-extension.xyz', { type: 'text/plain' })
    }
  ]);

  // Standard File List (Mocked files)
  standardFiles: File[] = [
    new File([''], 'annual-projection-sheet.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    new File([''], 'product-specs-word.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }),
    new File([''], 'intro-slides.pptx', { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' }),
    new File([''], 'application-api.ts', { type: 'text/typescript' })
  ];

  private mockExtensions = [
    { ext: 'png', type: 'image/png', name: 'screenshot-mock' },
    { ext: 'pdf', type: 'application/pdf', name: 'legal-agreement' },
    { ext: 'zip', type: 'application/zip', name: 'database-sql-dump' },
    { ext: 'mp3', type: 'audio/mp3', name: 'marketing-podcast' },
    { ext: 'mp4', type: 'video/mp4', name: 'training-video' },
    { ext: 'json', type: 'application/json', name: 'package-manifest' }
  ];

  addMockFile() {
    const randomItem = this.mockExtensions[Math.floor(Math.random() * this.mockExtensions.length)];
    const size = Math.floor(Math.random() * 50000000) + 1024;
    const name = `${randomItem.name}-${Math.floor(Math.random() * 900) + 100}.${randomItem.ext}`;

    const newFileItem: UploadFileItem = {
      id: 'file-' + Math.random().toString(36).substring(2, 9),
      name: name,
      size: size,
      type: randomItem.type,
      progress: 0,
      status: 'pending',
      formattedSize: this.formatBytes(size),
      fileObject: new File([''], name, { type: randomItem.type })
    };

    this.filesList.update(list => [...list, newFileItem]);
    this.actionLogs.update(logs => [...logs, `➕ Simulated Add: Added new mock file "${name}"`]);
  }

  simulateUpload() {
    this.actionLogs.update(logs => [...logs, '⚡ Simulating Upload: Upload ticks started...']);
    
    const interval = setInterval(() => {
      let activeUploads = false;
      this.filesList.update(list => {
        return list.map(item => {
          if (item.status === 'pending') {
            activeUploads = true;
            return { ...item, status: 'uploading', progress: 10 };
          }
          if (item.status === 'uploading') {
            activeUploads = true;
            const nextProgress = item.progress + 15;
            if (nextProgress >= 100) {
              return { ...item, status: 'success', progress: 100 };
            }
            return { ...item, progress: nextProgress };
          }
          return item;
        });
      });

      if (!activeUploads) {
        clearInterval(interval);
        this.actionLogs.update(logs => [...logs, '🏁 Simulation Finished: All uploads complete or skipped']);
      }
    }, 800);
  }

  clearFiles() {
    this.filesList.set([]);
    this.actionLogs.update(logs => [...logs, '🗑️ Cleared: Queue empty']);
  }

  onFileDeleted(file: any) {
    const fileName = file.name;
    this.filesList.update(list => list.filter(item => item.id !== file.id && item.name !== file.name));
    this.actionLogs.update(logs => [
      ...logs,
      `❌ Event: delete() triggered for file "${fileName}"`
    ].slice(-10));
  }

  onFileDownloaded(file: any) {
    this.actionLogs.update(logs => [
      ...logs,
      `💾 Event: download() triggered for file "${file.name}"`
    ].slice(-10));
  }

  private formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}
