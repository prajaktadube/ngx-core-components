import { Component, input, signal, output, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface UploadFileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  errorMessage?: string;
  formattedSize: string;
  fileObject: File;
}

@Component({
  selector: 'ngx-file-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="file-upload-wrapper"
      [class.dark]="theme() === 'dark'"
      [class.drag-over]="isDragOver()"
      [class.disabled]="disabled()"
    >
      <!-- Dropzone Border Frame -->
      <div
        class="dropzone-area"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()"
        (keydown)="onDropzoneKeyDown($event)"
        [attr.tabindex]="disabled() ? -1 : 0"
        role="button"
        [attr.aria-disabled]="disabled()"
        aria-label="Upload files"
      >
        <input
          #fileInput
          type="file"
          [multiple]="multiple()"
          [accept]="accept()"
          [disabled]="disabled()"
          (change)="onFileSelected($event)"
          class="hidden-file-input"
        />

        <div class="dropzone-content">
          <div class="upload-icon-circle">
            <svg class="upload-arrow-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <div class="upload-headline">
            <span class="highlight">Click to upload</span> or drag and drop
          </div>
          <div class="upload-subtext">
            {{ getHelperText() }}
          </div>
        </div>
      </div>

      <!-- File Queue List -->
      @if (fileQueue().length > 0) {
        <div class="file-queue-list">
          <div class="queue-header">
            <h4>Files Queue ({{ fileQueue().length }})</h4>
            <button class="clear-all-btn" (click)="clearAll()" [disabled]="disabled()">Clear All</button>
          </div>

          <div class="queue-items">
            @for (item of fileQueue(); track item.id) {
              <div class="queue-item-card" [class]="item.status">
                <div class="item-icon">
                  <svg class="file-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>

                <div class="item-details">
                  <div class="item-meta">
                    <span class="item-name" [title]="item.name">{{ item.name }}</span>
                    <span class="item-size">{{ item.formattedSize }}</span>
                  </div>

                  <!-- Progress meter -->
                  @if (item.status === 'uploading') {
                    <div class="item-progress-wrap">
                      <div class="progress-track">
                        <div class="progress-bar-fill" [style.width.%]="item.progress"></div>
                      </div>
                      <span class="progress-text">{{ item.progress }}%</span>
                    </div>
                  }

                  <!-- Error message alert -->
                  @if (item.status === 'error' && item.errorMessage) {
                    <div class="item-error-msg">
                      ⚠️ {{ item.errorMessage }}
                    </div>
                  }

                  <!-- Status badges -->
                  @if (item.status === 'success') {
                    <div class="item-status-badge success">✓ Uploaded</div>
                  }
                </div>

                <!-- Actions -->
                <div class="item-actions">
                  @if (item.status === 'error') {
                    <button class="action-btn retry-btn" (click)="retryUpload(item)" title="Retry upload">
                      🔄
                    </button>
                  }
                  <button class="action-btn remove-btn" (click)="removeFile(item)" title="Remove file" [disabled]="disabled()">
                    ✕
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .file-upload-wrapper {
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: var(--radius-md, 10px);
      padding: 16px;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      gap: 16px;
      transition: all 0.25s;
    }

    .file-upload-wrapper.drag-over {
      border-color: var(--primary-color, #4f46e5);
      background: rgba(79, 70, 229, 0.01);
    }

    .file-upload-wrapper.disabled {
      opacity: 0.65;
      pointer-events: none;
    }

    /* Dropzone area */
    .dropzone-area {
      border: 2px dashed var(--border-color, #cbd5e1);
      border-radius: var(--radius-md, 10px);
      padding: 32px 20px;
      text-align: center;
      cursor: pointer;
      background: rgba(0, 0, 0, 0.005);
      transition: all 0.2s ease-in-out;
      position: relative;
    }

    .dropzone-area:hover {
      border-color: var(--primary-color, #4f46e5);
      background: rgba(79, 70, 229, 0.02);
    }

    .dropzone-area:focus-visible {
      outline: 2px dashed var(--primary-color, #4f46e5);
      outline-offset: 2px;
      border-color: var(--primary-color, #4f46e5);
      background: rgba(79, 70, 229, 0.02);
    }

    .drag-over .dropzone-area {
      border-color: var(--primary-color, #4f46e5);
      background: rgba(79, 70, 229, 0.05);
    }

    .hidden-file-input {
      display: none;
    }

    .dropzone-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      user-select: none;
    }

    .upload-icon-circle {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--border-light, #f1f5f9);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary, #475569);
      transition: all 0.2s;
    }

    .dropzone-area:hover .upload-icon-circle {
      background: var(--primary-color, #4f46e5);
      color: #ffffff;
      transform: scale(1.05);
    }

    .upload-arrow-svg {
      width: 20px;
      height: 20px;
    }

    .upload-headline {
      font-family: var(--ngx-font-family, sans-serif);
      font-size: 14px;
      font-weight: 550;
      color: var(--text-primary, #0f172a);
    }

    .upload-headline .highlight {
      color: var(--primary-color, #4f46e5);
      font-weight: 700;
    }

    .upload-subtext {
      font-family: var(--ngx-font-family, sans-serif);
      font-size: 11px;
      color: var(--text-secondary, #64748b);
    }

    /* Queue list */
    .file-queue-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      border-top: 1px solid var(--border-color, #e2e8f0);
      padding-top: 16px;
    }

    .queue-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: var(--ngx-font-family, sans-serif);
    }

    .queue-header h4 {
      margin: 0;
      font-size: 13px;
      font-weight: 750;
      color: var(--text-primary, #0f172a);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .clear-all-btn {
      background: transparent;
      border: none;
      color: #ef4444;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      padding: 2px 6px;
      border-radius: 4px;
      transition: background 0.2s;
    }
    .clear-all-btn:hover {
      background: rgba(239, 68, 68, 0.05);
    }

    .queue-items {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 280px;
      overflow-y: auto;
      padding-right: 4px;
    }

    .queue-item-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 8px;
      background: var(--bg-secondary, #ffffff);
      transition: all 0.2s;
    }

    .queue-item-card:hover {
      border-color: var(--text-secondary, #94a3b8);
      box-shadow: var(--shadow-sm);
    }

    .queue-item-card.success { border-color: rgba(16, 185, 129, 0.3); background: rgba(16, 185, 129, 0.005); }
    .queue-item-card.error { border-color: rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.005); }

    .item-icon {
      color: var(--text-secondary, #64748b);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .file-icon-svg {
      width: 20px;
      height: 20px;
    }

    .item-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
      overflow: hidden;
      font-family: var(--ngx-font-family, sans-serif);
    }

    .item-meta {
      display: flex;
      justify-content: space-between;
      gap: 8px;
    }

    .item-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary, #0f172a);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .item-size {
      font-size: 11px;
      color: var(--text-secondary, #64748b);
      white-space: nowrap;
    }

    /* Progress and error layouts */
    .item-progress-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .progress-track {
      flex: 1;
      height: 4px;
      background: var(--border-light, #f1f5f9);
      border-radius: 2px;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      background: var(--primary-color, #4f46e5);
      border-radius: 2px;
      transition: width 0.15s;
    }

    .progress-text {
      font-size: 10px;
      font-weight: 700;
      color: var(--text-secondary, #475569);
      min-width: 28px;
      text-align: right;
    }

    .item-error-msg {
      font-size: 11px;
      color: #ef4444;
      font-weight: 600;
    }

    .item-status-badge {
      font-size: 10px;
      font-weight: 700;
      border-radius: 4px;
      padding: 1px 6px;
      width: fit-content;
    }

    .item-status-badge.success {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }

    /* Actions buttons */
    .item-actions {
      display: flex;
      gap: 6px;
    }

    .action-btn {
      background: transparent;
      border: none;
      font-size: 12px;
      cursor: pointer;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary, #64748b);
      transition: background 0.2s, color 0.2s;
    }

    .action-btn:hover {
      background: var(--border-light, #f1f5f9);
      color: var(--text-primary, #0f172a);
    }

    .action-btn.remove-btn:hover {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.05);
    }

    /* Dark Mode */
    .file-upload-wrapper.dark {
      background: #0f172a;
      border-color: #1f2937;
    }
    .file-upload-wrapper.dark .dropzone-area {
      border-color: #374151;
    }
    .file-upload-wrapper.dark .dropzone-area:hover {
      border-color: var(--primary-color, #6366f1);
      background: rgba(99, 102, 241, 0.02);
    }
    .file-upload-wrapper.dark .upload-icon-circle {
      background: #1e293b;
      color: #94a3b8;
    }
    .file-upload-wrapper.dark .dropzone-area:hover .upload-icon-circle {
      background: var(--primary-color, #6366f1);
      color: #ffffff;
    }
    .file-upload-wrapper.dark .upload-headline {
      color: #e2e8f0;
    }
    .file-upload-wrapper.dark .upload-headline .highlight {
      color: var(--primary-color, #6366f1);
    }
    .file-upload-wrapper.dark .upload-subtext {
      color: #94a3b8;
    }
    .file-upload-wrapper.dark .file-queue-list {
      border-top-color: #1f2937;
    }
    .file-upload-wrapper.dark .queue-header h4 {
      color: #e2e8f0;
    }
    .file-upload-wrapper.dark .queue-item-card {
      border-color: #1f2937;
      background: #111827;
    }
    .file-upload-wrapper.dark .queue-item-card:hover {
      border-color: #4b5563;
    }
    .file-upload-wrapper.dark .queue-item-card.success {
      border-color: rgba(16, 185, 129, 0.2);
    }
    .file-upload-wrapper.dark .queue-item-card.error {
      border-color: rgba(239, 68, 68, 0.2);
    }
    .file-upload-wrapper.dark .item-name {
      color: #e2e8f0;
    }
    .file-upload-wrapper.dark .item-size {
      color: #94a3b8;
    }
    .file-upload-wrapper.dark .progress-track {
      background: #1e293b;
    }
    .file-upload-wrapper.dark .progress-bar-fill {
      background: var(--primary-color, #6366f1);
    }
    .file-upload-wrapper.dark .progress-text {
      color: #94a3b8;
    }
    .file-upload-wrapper.dark .action-btn:hover {
      background: #1e293b;
      color: #f8fafc;
    }
    .file-upload-wrapper.dark .action-btn.remove-btn:hover {
      background: rgba(239, 68, 68, 0.1);
    }
  `]
})
export class FileUploadComponent {
  // Inputs
  multiple = input<boolean>(false);
  accept = input<string>(''); // comma separated file rules
  maxSize = input<number>(0);  // max bytes limit (e.g. 5242880 for 5MB). 0 means unlimited
  disabled = input<boolean>(false);
  theme = input<'light' | 'dark'>('light');
  uploadUrl = input<string>('');

  // Outputs
  filesSelected = output<File[]>();
  fileRemoved = output<File>();
  uploadProgress = output<{ file: File, progress: number }>();
  uploadComplete = output<{ file: File, response: any }>();
  uploadError = output<{ file: File, error: any }>();

  // State
  isDragOver = signal<boolean>(false);
  fileQueue = signal<UploadFileItem[]>([]);

  onDropzoneKeyDown(event: KeyboardEvent) {
    if (this.disabled()) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const inputEl = event.currentTarget as HTMLElement;
      const fileInputEl = inputEl.querySelector('.hidden-file-input') as HTMLInputElement;
      fileInputEl?.click();
    }
  }

  onDragOver(event: DragEvent) {
    if (this.disabled()) return;
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent) {
    if (this.disabled()) return;
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    if (event.dataTransfer && event.dataTransfer.files) {
      this.handleFiles(Array.from(event.dataTransfer.files));
    }
  }

  onFileSelected(event: Event) {
    const inputEl = event.target as HTMLInputElement;
    if (inputEl.files) {
      this.handleFiles(Array.from(inputEl.files));
      inputEl.value = ''; // clear input selection
    }
  }

  // Handle addition of files to the queue, runs validation, and triggers simulated upload
  private handleFiles(incomingFiles: File[]) {
    if (incomingFiles.length === 0) return;

    // Filter by single vs multiple
    const filesToProcess = this.multiple() ? incomingFiles : [incomingFiles[0]];

    const newQueueItems: UploadFileItem[] = [];
    const validFiles: File[] = [];

    for (const file of filesToProcess) {
      const formattedSize = this.formatBytes(file.size);
      const id = Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);
      
      const item: UploadFileItem = {
        id,
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        status: 'pending',
        formattedSize,
        fileObject: file
      };

      // Validation
      const errorMsg = this.validateFile(file);
      if (errorMsg) {
        item.status = 'error';
        item.errorMessage = errorMsg;
      } else {
        validFiles.push(file);
      }

      newQueueItems.push(item);
    }

    if (this.multiple()) {
      this.fileQueue.update(q => [...q, ...newQueueItems]);
    } else {
      this.fileQueue.set(newQueueItems);
    }

    if (validFiles.length > 0) {
      this.filesSelected.emit(validFiles);
      
      // Trigger simulation or actual file upload
      for (const item of newQueueItems) {
        if (item.status === 'pending') {
          this.uploadFile(item);
        }
      }
    }
  }

  private validateFile(file: File): string | null {
    // 1. Max Size check
    const maxLimit = this.maxSize();
    if (maxLimit > 0 && file.size > maxLimit) {
      return `File exceeds max size limit of ${this.formatBytes(maxLimit)}.`;
    }

    // 2. Type/Accept format check
    const acceptRule = this.accept();
    if (acceptRule) {
      const allowedRules = acceptRule.split(',').map(r => r.trim().toLowerCase());
      const ext = ('.' + file.name.split('.').pop()).toLowerCase();
      const mime = file.type.toLowerCase();
      
      const isAllowed = allowedRules.some(rule => {
        if (rule.startsWith('.')) {
          return rule === ext;
        } else if (rule.endsWith('/*')) {
          const prefix = rule.slice(0, -2);
          return mime.startsWith(prefix);
        } else {
          return rule === mime;
        }
      });

      if (!isAllowed) {
        return `File type is not accepted. Only formats matching "${acceptRule}" are allowed.`;
      }
    }

    return null;
  }

  private uploadFile(item: UploadFileItem) {
    this.updateItemStatus(item.id, 'uploading', 0);

    // Mock Upload simulation
    // Increment progress linearly in steps
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 15) + 5;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        
        // Randomly simulate 5% errors to showcase error recovery states
        const simulatedSuccess = Math.random() > 0.05;
        if (simulatedSuccess) {
          this.updateItemStatus(item.id, 'success', 100);
          this.uploadComplete.emit({ file: item.fileObject, response: { success: true } });
        } else {
          this.updateItemStatus(item.id, 'error', 100, 'Simulated connection failure during file upload.');
          this.uploadError.emit({ file: item.fileObject, error: 'Simulated connection failure' });
        }
      } else {
        this.updateItemStatus(item.id, 'uploading', currentProgress);
        this.uploadProgress.emit({ file: item.fileObject, progress: currentProgress });
      }
    }, 250);
  }

  retryUpload(item: UploadFileItem) {
    this.uploadFile(item);
  }

  removeFile(item: UploadFileItem) {
    this.fileQueue.update(q => q.filter(x => x.id !== item.id));
    this.fileRemoved.emit(item.fileObject);
  }

  clearAll() {
    this.fileQueue.set([]);
  }

  private updateItemStatus(id: string, status: UploadFileItem['status'], progress: number, errorMsg?: string) {
    this.fileQueue.update(queue => {
      return queue.map(x => {
        if (x.id === id) {
          return {
            ...x,
            status,
            progress,
            errorMessage: errorMsg
          };
        }
        return x;
      });
    });
  }

  // Utility text mappings
  getHelperText(): string {
    const limits: string[] = [];
    if (this.accept()) {
      limits.push(`Accepted: ${this.accept()}`);
    }
    if (this.maxSize() > 0) {
      limits.push(`Max: ${this.formatBytes(this.maxSize())}`);
    }
    return limits.length > 0 ? limits.join(' • ') : 'Supports any file';
  }

  // Byte formats convertor utility
  private formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}
