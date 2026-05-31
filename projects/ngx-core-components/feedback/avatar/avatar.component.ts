import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarShape = 'circle' | 'square' | 'rounded';
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away' | 'none';

export interface AvatarItem {
  id?: string | number;
  name?: string;
  src?: string;
  color?: string;
}

/** Generates a deterministic hue from a display name */
function nameToHue(name: string): number {
  let hash = 0;
  for (const ch of name) {
    hash = (hash << 5) - hash + ch.charCodeAt(0);
    hash |= 0;
  }
  return Math.abs(hash) % 360;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

/** Single avatar */
@Component({
  selector: 'ngx-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div
      class="ngx-avatar"
      [class]="'size-' + size() + ' shape-' + shape()"
      [attr.title]="name() || null"
    >
      @if (src()) {
        <img
          class="avatar-img"
          [src]="src()"
          [alt]="name() || 'avatar'"
          (error)="imgError.set(true)"
        />
      }

      @if (!src() || imgError()) {
        <span class="avatar-initials" [style.background]="bgColor()">
          {{ displayInitials() }}
        </span>
      }

      @if (status() !== 'none') {
        <span class="avatar-status" [class]="'status-' + status()"></span>
      }

      @if (badge()) {
        <span class="avatar-badge">{{ badge() }}</span>
      }
    </div>
  `,
  styles: [`
    :host { display: inline-block; line-height: 0; }

    .ngx-avatar {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      overflow: visible;
      font-family: inherit;
      flex-shrink: 0;
    }

    /* --- sizes --- */
    .size-xs  { width: 24px;  height: 24px;  font-size: 9px; }
    .size-sm  { width: 32px;  height: 32px;  font-size: 11px; }
    .size-md  { width: 40px;  height: 40px;  font-size: 13px; }
    .size-lg  { width: 52px;  height: 52px;  font-size: 16px; }
    .size-xl  { width: 68px;  height: 68px;  font-size: 20px; }

    /* --- shapes --- */
    .shape-circle .avatar-img,
    .shape-circle .avatar-initials { border-radius: 50%; }
    .shape-rounded .avatar-img,
    .shape-rounded .avatar-initials { border-radius: 10px; }
    .shape-square .avatar-img,
    .shape-square .avatar-initials { border-radius: 4px; }

    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      border: 2px solid var(--bg-primary, #fff);
      box-shadow: 0 1px 3px rgba(0,0,0,.12);
    }

    .avatar-initials {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: #fff;
      border: 2px solid var(--bg-primary, #fff);
      box-shadow: 0 1px 3px rgba(0,0,0,.12);
      letter-spacing: 0.03em;
    }

    /* status indicator */
    .avatar-status {
      position: absolute;
      bottom: 1px;
      right: 1px;
      width: 28%;
      height: 28%;
      min-width: 8px;
      min-height: 8px;
      border-radius: 50%;
      border: 2px solid var(--bg-primary, #fff);
    }
    .status-online  { background: #22c55e; }
    .status-offline { background: #94a3b8; }
    .status-busy    { background: #ef4444; }
    .status-away    { background: #f59e0b; }

    /* notification badge */
    .avatar-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: var(--primary-color, #4f46e5);
      color: #fff;
      font-size: 9px;
      font-weight: 800;
      padding: 1px 4px;
      border-radius: 999px;
      border: 2px solid var(--bg-primary, #fff);
      line-height: 1.4;
    }
  `]
})
export class AvatarComponent {
  name   = input<string>('');
  src    = input<string>('');
  size   = input<AvatarSize>('md');
  shape  = input<AvatarShape>('circle');
  status = input<AvatarStatus>('none');
  badge  = input<string | number | null>(null);
  color  = input<string>('');

  imgError = signal(false);

  displayInitials = computed(() => initials(this.name() || '?'));

  bgColor = computed(() => {
    if (this.color()) return this.color();
    const hue = nameToHue(this.name() || 'U');
    return `hsl(${hue}, 60%, 45%)`;
  });
}

/** Avatar group with overlap + overflow count */
@Component({
  selector: 'ngx-avatar-group',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, AvatarComponent],
  template: `
    <div class="ngx-avatar-group" [style.gap]="'-' + overlapPx() + 'px'">
      @for (av of visibleAvatars(); track av.id ?? $index) {
        <ngx-avatar
          [name]="av.name || ''"
          [src]="av.src || ''"
          [size]="size()"
          [shape]="shape()"
          [color]="av.color || ''"
        ></ngx-avatar>
      }
      @if (overflowCount() > 0) {
        <div
          class="overflow-bubble"
          [class]="'size-' + size() + ' shape-' + shape()"
          [attr.title]="'+' + overflowCount() + ' more'"
        >
          +{{ overflowCount() }}
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: inline-block; }

    .ngx-avatar-group {
      display: flex;
      flex-direction: row;
    }

    .ngx-avatar-group ngx-avatar {
      margin-left: -10px;
    }
    .ngx-avatar-group ngx-avatar:first-child {
      margin-left: 0;
    }

    .overflow-bubble {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-secondary, #e2e8f0);
      color: var(--text-secondary, #64748b);
      font-weight: 700;
      font-size: 11px;
      border: 2px solid var(--bg-primary, #fff);
      box-shadow: 0 1px 3px rgba(0,0,0,.12);
      flex-shrink: 0;
      margin-left: -10px;
    }

    .size-xs  { width: 24px;  height: 24px;  font-size: 8px; }
    .size-sm  { width: 32px;  height: 32px;  font-size: 9px; }
    .size-md  { width: 40px;  height: 40px;  font-size: 11px; }
    .size-lg  { width: 52px;  height: 52px;  font-size: 13px; }
    .size-xl  { width: 68px;  height: 68px;  font-size: 16px; }

    .shape-circle  { border-radius: 50%; }
    .shape-rounded { border-radius: 10px; }
    .shape-square  { border-radius: 4px; }
  `]
})
export class AvatarGroupComponent {
  avatars  = input<AvatarItem[]>([]);
  maxShow  = input<number>(5);
  size     = input<AvatarSize>('md');
  shape    = input<AvatarShape>('circle');

  overlapPx = computed(() => {
    const map: Record<AvatarSize, number> = { xs: 8, sm: 10, md: 12, lg: 14, xl: 18 };
    return map[this.size()];
  });

  visibleAvatars = computed(() => this.avatars().slice(0, this.maxShow()));
  overflowCount  = computed(() => Math.max(0, this.avatars().length - this.maxShow()));
}
