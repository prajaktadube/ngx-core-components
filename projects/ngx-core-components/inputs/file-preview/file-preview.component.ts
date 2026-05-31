import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadFileItem } from '../file-upload/file-upload.component';

export interface PreviewFileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  errorMessage?: string;
  formattedSize: string;
  thumbnailUrl?: string;
  fileObject?: File;
}

@Component({
  selector: 'ngx-file-preview',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="ngx-file-preview"
      [class.dark]="theme() === 'dark'"
      [class]="layout()"
    >
      @if (previewFiles().length === 0) {
        <div class="ngx-file-preview__empty">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <span class="ngx-file-preview__empty-text">No files selected</span>
        </div>
      } @else {
        <div class="ngx-file-preview__grid-container">
          @for (item of previewFiles(); track item.id) {
            <div
              class="ngx-file-preview__card"
              [class]="item.status"
            >
              <!-- Image Thumbnail or Icon -->
              <div class="ngx-file-preview__media-wrapper">
                @if (item.thumbnailUrl) {
                  <div
                    class="ngx-file-preview__thumbnail"
                    [style.backgroundImage]="'url(' + item.thumbnailUrl + ')'"
                  ></div>
                } @else {
                  <div
                    class="ngx-file-preview__icon-fallback"
                    [style.background-color]="getFileDetails(item).color + '15'"
                    [style.color]="getFileDetails(item).color"
                  >
                    <span class="file-icon-symbol">{{ getFileDetails(item).icon }}</span>
                    <span class="file-icon-badge">{{ getFileDetails(item).label }}</span>
                  </div>
                }

                <!-- Delete & Download Hover Actions Overlay -->
                <div class="ngx-file-preview__overlay-actions">
                  @if (allowDownload() && item.status === 'success') {
                    <button
                      class="ngx-file-preview__action-btn btn-download"
                      (click)="onDownload(item)"
                      aria-label="Download file"
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                    </button>
                  }
                  @if (allowDelete()) {
                    <button
                      class="ngx-file-preview__action-btn btn-delete"
                      (click)="onDelete(item)"
                      aria-label="Delete file"
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  }
                </div>
              </div>

              <!-- Content details -->
              <div class="ngx-file-preview__details">
                <div class="ngx-file-preview__meta">
                  <span class="ngx-file-preview__name" [title]="item.name">{{ item.name }}</span>
                  <span class="ngx-file-preview__size">{{ item.formattedSize }}</span>
                </div>

                <!-- Status details / upload meter -->
                @if (item.status === 'uploading') {
                  <div class="ngx-file-preview__progress-wrap">
                    <div class="ngx-file-preview__progress-bar">
                      <div class="ngx-file-preview__progress-fill" [style.width.%]="item.progress"></div>
                    </div>
                    <span class="ngx-file-preview__progress-text">{{ item.progress }}%</span>
                  </div>
                } @else if (item.status === 'error') {
                  <span class="ngx-file-preview__error-msg">
                    ⚠️ {{ item.errorMessage || 'Upload failed' }}
                  </span>
                } @else {
                  <div class="ngx-file-preview__status-row">
                    <span class="status-indicator" [class]="item.status"></span>
                    <span class="status-label">{{ item.status }}</span>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .ngx-file-preview {
      width: 100%;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
    }

    /* ── Empty State ── */
    .ngx-file-preview__empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      border: 2px dashed rgba(0, 0, 0, 0.1);
      border-radius: 12px;
      color: #64748b;
      background: rgba(255, 255, 255, 0.2);
    }

    .dark .ngx-file-preview__empty {
      border-color: rgba(255, 255, 255, 0.08);
      color: #94a3b8;
      background: rgba(15, 23, 42, 0.15);
    }

    .ngx-file-preview__empty svg {
      margin-bottom: 8px;
      stroke: #94a3b8;
    }

    .ngx-file-preview__empty-text {
      font-size: 13px;
      font-weight: 500;
    }

    /* ── Grid Container ── */
    .ngx-file-preview__grid-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
    }

    /* ── Card Styling ── */
    .ngx-file-preview__card {
      display: flex;
      flex-direction: column;
      border-radius: 12px;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(0, 0, 0, 0.06);
      box-shadow: 
        0 4px 6px -1px rgba(0, 0, 0, 0.03),
        0 2px 4px -1px rgba(0, 0, 0, 0.02);
      transition: all 0.2s ease;
    }

    .ngx-file-preview__card:hover {
      transform: translateY(-2px);
      box-shadow: 
        0 10px 15px -3px rgba(0, 0, 0, 0.05),
        0 4px 6px -4px rgba(0, 0, 0, 0.05);
      border-color: rgba(0, 0, 0, 0.12);
    }

    .dark .ngx-file-preview__card {
      background: rgba(30, 32, 48, 0.85);
      border-color: rgba(255, 255, 255, 0.06);
    }

    .dark .ngx-file-preview__card:hover {
      border-color: rgba(255, 255, 255, 0.12);
    }

    /* ── Media wrapper & Thumbnail ── */
    .ngx-file-preview__media-wrapper {
      position: relative;
      width: 100%;
      height: 120px;
      background: #f8fafc;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .dark .ngx-file-preview__media-wrapper {
      background: #1e293b;
    }

    .ngx-file-preview__thumbnail {
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    }

    .ngx-file-preview__icon-fallback {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      font-weight: 700;
    }

    .file-icon-symbol {
      font-size: 36px;
      line-height: 1;
      margin-bottom: 4px;
    }

    .file-icon-badge {
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
      background: rgba(0, 0, 0, 0.05);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .dark .file-icon-badge {
      background: rgba(255, 255, 255, 0.1);
    }

    /* ── Overlays actions ── */
    .ngx-file-preview__overlay-actions {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(15, 23, 42, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      opacity: 0;
      transition: opacity 0.2s ease;
      z-index: 5;
    }

    .ngx-file-preview__media-wrapper:hover .ngx-file-preview__overlay-actions {
      opacity: 1;
    }

    .ngx-file-preview__action-btn {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      border: none;
      background: rgba(255, 255, 255, 0.9);
      color: #0f172a;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .ngx-file-preview__action-btn:hover {
      transform: scale(1.1);
      background: #ffffff;
    }

    .ngx-file-preview__action-btn.btn-delete:hover {
      background: #ef4444;
      color: #ffffff;
    }

    .ngx-file-preview__action-btn.btn-download:hover {
      background: var(--primary-color, #3b82f6);
      color: #ffffff;
    }

    /* ── Details content ── */
    .ngx-file-preview__details {
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex-grow: 1;
    }

    .ngx-file-preview__meta {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 8px;
    }

    .ngx-file-preview__name {
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex-grow: 1;
    }

    .dark .ngx-file-preview__name {
      color: #f8fafc;
    }

    .ngx-file-preview__size {
      font-size: 11px;
      font-weight: 500;
      color: #64748b;
      white-space: nowrap;
    }

    .dark .ngx-file-preview__size {
      color: #94a3b8;
    }

    /* ── Progress display ── */
    .ngx-file-preview__progress-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
    }

    .ngx-file-preview__progress-bar {
      flex-grow: 1;
      height: 4px;
      border-radius: 2px;
      background: rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }

    .dark .ngx-file-preview__progress-bar {
      background: rgba(255, 255, 255, 0.08);
    }

    .ngx-file-preview__progress-fill {
      height: 100%;
      background: var(--primary-color, #3b82f6);
      transition: width 0.2s ease;
    }

    .ngx-file-preview__progress-text {
      font-size: 10px;
      font-weight: 600;
      color: #64748b;
      width: 28px;
      text-align: right;
    }

    .ngx-file-preview__error-msg {
      font-size: 11px;
      color: #ef4444;
      font-weight: 500;
    }

    .ngx-file-preview__status-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 600;
      text-transform: capitalize;
      color: #64748b;
    }

    .dark .ngx-file-preview__status-row {
      color: #94a3b8;
    }

    .status-indicator {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #64748b;
    }

    .status-indicator.success {
      background: #10b981;
    }

    .status-indicator.pending {
      background: #f59e0b;
    }

    /* ── List Layout ── */
    .ngx-file-preview.list .ngx-file-preview__grid-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .ngx-file-preview.list .ngx-file-preview__card {
      flex-direction: row;
      align-items: center;
      padding: 8px 12px;
      gap: 12px;
    }

    .ngx-file-preview.list .ngx-file-preview__card:hover {
      transform: translateX(2px) translateY(0);
    }

    .ngx-file-preview.list .ngx-file-preview__media-wrapper {
      width: 42px;
      height: 42px;
      border-radius: 6px;
      flex-shrink: 0;
    }

    .ngx-file-preview.list .file-icon-symbol {
      font-size: 20px;
      margin: 0;
    }

    .ngx-file-preview.list .file-icon-badge {
      display: none;
    }

    .ngx-file-preview.list .ngx-file-preview__details {
      padding: 0;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      gap: 16px;
    }

    .ngx-file-preview.list .ngx-file-preview__meta {
      flex-grow: 1;
      width: 30%;
      flex-direction: column;
      gap: 2px;
    }

    .ngx-file-preview.list .ngx-file-preview__progress-wrap {
      width: 120px;
      flex-shrink: 0;
    }

    /* List Hover action menu */
    .ngx-file-preview.list .ngx-file-preview__overlay-actions {
      position: static;
      opacity: 1;
      background: transparent;
      box-shadow: none;
      width: auto;
      height: auto;
      gap: 6px;
      margin-left: auto;
    }

    .ngx-file-preview.list .ngx-file-preview__action-btn {
      width: 30px;
      height: 30px;
      box-shadow: none;
      border: 1px solid rgba(0, 0, 0, 0.05);
      background: rgba(0, 0, 0, 0.02);
    }

    .dark .ngx-file-preview.list .ngx-file-preview__action-btn {
      border-color: rgba(255, 255, 255, 0.06);
      background: rgba(255, 255, 255, 0.02);
      color: #cbd5e1;
    }

    .ngx-file-preview.list .ngx-file-preview__action-btn:hover {
      transform: scale(1.05);
    }
  `]
})
export class FilePreviewComponent implements OnDestroy {
  // Inputs
  files = input<UploadFileItem[] | File[] | null>(null);
  layout = input<'grid' | 'list'>('grid');
  allowDelete = input<boolean>(true);
  allowDownload = input<boolean>(true);
  theme = input<'light' | 'dark'>('light');

  // Outputs
  delete = output<any>();
  download = output<any>();

  // Object URL cache to prevent leaks and repeat generations
  private objectUrlCache = new Map<File, string>();

  // Map inputs to local standardized objects
  previewFiles = computed(() => {
    const rawFiles = this.files() || [];
    return rawFiles.map((file, idx) => {
      if (file instanceof File) {
        return {
          id: `${file.name}-${idx}-${file.size}`,
          name: file.name,
          size: file.size,
          type: file.type,
          progress: 100,
          status: 'success' as const,
          formattedSize: this.formatBytes(file.size),
          fileObject: file,
          thumbnailUrl: file.type.startsWith('image/') ? this.getObjectUrl(file) : undefined,
        };
      } else {
        // UploadFileItem
        let thumbUrl: string | undefined = undefined;
        if (file.fileObject && file.type.startsWith('image/')) {
          thumbUrl = this.getObjectUrl(file.fileObject);
        }
        return {
          id: file.id || `${file.name}-${idx}`,
          name: file.name,
          size: file.size,
          type: file.type,
          progress: file.progress !== undefined ? file.progress : 100,
          status: file.status || 'success',
          errorMessage: file.errorMessage,
          formattedSize: file.formattedSize || this.formatBytes(file.size),
          fileObject: file.fileObject,
          thumbnailUrl: thumbUrl,
        };
      }
    });
  });

  ngOnDestroy() {
    this.objectUrlCache.forEach((url) => URL.revokeObjectURL(url));
    this.objectUrlCache.clear();
  }

  onDelete(item: PreviewFileItem) {
    // Emit original item if possible or the constructed item
    const orig = this.findOriginal(item);
    this.delete.emit(orig);
  }

  onDownload(item: PreviewFileItem) {
    const orig = this.findOriginal(item);
    this.download.emit(orig);
  }

  getFileDetails(item: PreviewFileItem) {
    const type = item.type || '';
    const name = item.name || '';
    const ext = name.split('.').pop()?.toLowerCase() || '';

    if (type.startsWith('image/')) {
      return { label: 'IMG', color: '#3b82f6', icon: '🖼️' };
    }
    if (type === 'application/pdf' || ext === 'pdf') {
      return { label: 'PDF', color: '#ef4444', icon: '📄' };
    }
    if (type.includes('word') || type.includes('document') || ['doc', 'docx', 'txt', 'rtf'].includes(ext)) {
      return { label: 'DOC', color: '#2563eb', icon: '📝' };
    }
    if (type.includes('sheet') || type.includes('excel') || ['xls', 'xlsx', 'csv'].includes(ext)) {
      return { label: 'XLS', color: '#16a34a', icon: '📊' };
    }
    if (type.includes('presentation') || type.includes('powerpoint') || ['ppt', 'pptx'].includes(ext)) {
      return { label: 'PPT', color: '#ea580c', icon: '🎭' };
    }
    if (type.includes('zip') || type.includes('compressed') || type.includes('tar') || ['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
      return { label: 'ZIP', color: '#7c3aed', icon: '📦' };
    }
    if (
      type.includes('javascript') ||
      type.includes('typescript') ||
      type.includes('json') ||
      ['js', 'ts', 'html', 'css', 'json', 'py', 'go', 'rs', 'cpp'].includes(ext)
    ) {
      return { label: 'CODE', color: '#0f172a', icon: '💻' };
    }
    if (type.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) {
      return { label: 'AUDIO', color: '#06b6d4', icon: '🎵' };
    }
    if (type.startsWith('video/') || ['mp4', 'mkv', 'avi', 'mov'].includes(ext)) {
      return { label: 'VIDEO', color: '#6366f1', icon: '🎥' };
    }
    return { label: 'FILE', color: '#64748b', icon: '📁' };
  }

  private getObjectUrl(file: File): string {
    if (this.objectUrlCache.has(file)) {
      return this.objectUrlCache.get(file)!;
    }
    const url = URL.createObjectURL(file);
    this.objectUrlCache.set(file, url);
    return url;
  }

  private findOriginal(item: PreviewFileItem): any {
    const list = this.files() || [];
    // Search original items in the list
    for (const f of list) {
      if (f instanceof File) {
        if (f === item.fileObject) return f;
      } else {
        if (f.id === item.id || (f.name === item.name && f.size === item.size)) {
          return f;
        }
      }
    }
    return item;
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
