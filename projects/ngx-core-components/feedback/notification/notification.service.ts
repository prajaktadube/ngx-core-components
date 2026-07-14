import { Injectable, ApplicationRef, createComponent, EnvironmentInjector, Component, input, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';
export type NotificationPosition = 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center';

export interface NotificationOptions {
  message: string;
  type?: NotificationType;
  title?: string;
  duration?: number;
  closable?: boolean;
  position?: NotificationPosition;
}

export interface NotificationItem extends Required<NotificationOptions> {
  id: number;
  visible: boolean;
}

let nextId = 0;

@Component({
  selector: 'ngx-notification-container',
  standalone: true,
  imports: [CommonModule],
  host: {
    'role': 'log',
    'aria-live': 'polite',
    'aria-relevant': 'additions',
  },
  template: `
    @for (n of items(); track n.id) {
      <div class="notification" [class]="'notif-' + n.type" [class.visible]="n.visible" [attr.role]="n.type === 'error' ? 'alert' : 'status'">
        <span class="notif-icon">{{ icons[n.type] }}</span>
        <div class="notif-body">
          @if (n.title) { <div class="notif-title">{{ n.title }}</div> }
          <div class="notif-msg">{{ n.message }}</div>
        </div>
        @if (n.closable) {
          <button class="notif-close" (click)="remove(n.id)" aria-label="Close">×</button>
        }
      </div>
    }
  `,
  styles: [`
    :host { position: fixed; z-index: 10000; display: flex; flex-direction: column; gap: 10px; padding: 16px; pointer-events: none; }
    .notification {
      display: flex; align-items: flex-start; gap: 10px; min-width: 280px; max-width: 380px;
      padding: 12px 14px; border-radius: var(--ngx-notif-radius, 8px); box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      pointer-events: all; font-family: inherit; font-size: 13px; opacity: 0; transform: translateX(20px);
      transition: opacity 0.25s, transform 0.25s; border-left: 4px solid transparent;
      background: var(--ngx-notif-bg, #fff); color: var(--ngx-notif-text, #212529);
    }
    .notification.visible { opacity: 1; transform: translateX(0); }
    .notif-success { border-left-color: #27ae60; }
    .notif-error { border-left-color: #e74c3c; }
    .notif-info { border-left-color: #1a73e8; }
    .notif-warning { border-left-color: #f39c12; }
    .notif-icon { font-size: 18px; flex-shrink: 0; }
    .notif-body { flex: 1; }
    .notif-title { font-weight: 700; margin-bottom: 3px; font-size: 13px; }
    .notif-msg { color: var(--ngx-color-text-secondary, #595f66); font-size: 12px; }
    .notif-close { background: none; border: none; font-size: 18px; cursor: pointer; color: var(--ngx-color-text-disabled, #767b83); padding: 0; line-height: 1; margin-left: 4px; }
    .notif-close:hover { color: #495057; }
  `]
})
export class NotificationContainerComponent implements OnInit {
  items = signal<NotificationItem[]>([]);
  icons: Record<NotificationType, string> = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };

  ngOnInit() {}

  add(opts: NotificationOptions): number {
    const id = ++nextId;
    const item: NotificationItem = {
      id, visible: false,
      message: opts.message,
      type: opts.type ?? 'info',
      title: opts.title ?? '',
      duration: opts.duration ?? 4000,
      closable: opts.closable ?? true,
      position: opts.position ?? 'top-right'
    };
    this.items.update(arr => [...arr, item]);
    setTimeout(() => this.items.update(arr => arr.map(n => n.id === id ? { ...n, visible: true } : n)), 10);
    if (item.duration > 0) { setTimeout(() => this.remove(id), item.duration); }
    return id;
  }

  remove(id: number): void {
    this.items.update(arr => arr.map(n => n.id === id ? { ...n, visible: false } : n));
    setTimeout(() => this.items.update(arr => arr.filter(n => n.id !== id)), 300);
  }
}

const POSITIONS: Record<NotificationPosition, string> = {
  'top-right': 'top:0;right:0',
  'top-left': 'top:0;left:0',
  'top-center': 'top:0;left:50%;transform:translateX(-50%)',
  'bottom-right': 'bottom:0;right:0',
  'bottom-left': 'bottom:0;left:0',
  'bottom-center': 'bottom:0;left:50%;transform:translateX(-50%)'
};

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private containers = new Map<NotificationPosition, NotificationContainerComponent>();

  constructor(private appRef: ApplicationRef, private injector: EnvironmentInjector) {}

  private getContainer(pos: NotificationPosition): NotificationContainerComponent {
    if (this.containers.has(pos)) return this.containers.get(pos)!;
    const ref = createComponent(NotificationContainerComponent, { environmentInjector: this.injector });
    const el: HTMLElement = ref.location.nativeElement;
    el.setAttribute('style', POSITIONS[pos]);
    document.body.appendChild(el);
    this.appRef.attachView(ref.hostView);
    this.containers.set(pos, ref.instance);
    return ref.instance;
  }

  show(opts: NotificationOptions): number {
    const pos = opts.position ?? 'top-right';
    return this.getContainer(pos).add(opts);
  }

  success(message: string, title?: string, opts?: Partial<NotificationOptions>): number {
    return this.show({ ...opts, message, title, type: 'success' });
  }
  error(message: string, title?: string, opts?: Partial<NotificationOptions>): number {
    return this.show({ ...opts, message, title, type: 'error' });
  }
  info(message: string, title?: string, opts?: Partial<NotificationOptions>): number {
    return this.show({ ...opts, message, title, type: 'info' });
  }
  warning(message: string, title?: string, opts?: Partial<NotificationOptions>): number {
    return this.show({ ...opts, message, title, type: 'warning' });
  }
}
