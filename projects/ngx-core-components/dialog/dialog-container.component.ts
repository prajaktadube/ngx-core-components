import {
  Component, ChangeDetectionStrategy, ViewChild, ViewContainerRef,
  ViewRef, ChangeDetectorRef, inject
} from '@angular/core';

/**
 * DialogContainerComponent — the floating shell rendered by DialogService.
 *
 * It renders:
 *   • A full-screen semi-transparent backdrop
 *   • A centered panel that hosts the user-provided content component
 *
 * The service programmatically attaches a content ViewRef into the
 * `contentOutlet` ViewContainerRef after construction.
 */
@Component({
  selector: 'ngx-dialog-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="ngx-dialog-backdrop"
      (click)="onBackdropClick()"
      role="presentation"
    >
      <div
        class="ngx-dialog-panel"
        [class]="panelClass"
        [style.max-width]="maxWidth"
        role="dialog"
        [attr.aria-label]="ariaLabel"
        aria-modal="true"
        (click)="$event.stopPropagation()"
      >
        <ng-container #contentOutlet></ng-container>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .ngx-dialog-backdrop {
      position: fixed; inset: 0; z-index: 1000;
      background: rgba(0, 0, 0, 0.45);
      display: flex; align-items: center; justify-content: center;
      animation: ngx-fade-in 0.15s ease;
    }
    .ngx-dialog-panel {
      background: var(--ngx-dialog-bg, #fff);
      border-radius: var(--ngx-dialog-radius, 8px);
      box-shadow: 0 8px 40px rgba(0, 0, 0, 0.22);
      width: 100%; max-height: 90vh; overflow-y: auto;
      animation: ngx-slide-in 0.2s ease;
    }
    @keyframes ngx-fade-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes ngx-slide-in {
      from { transform: translateY(-24px); opacity: 0; }
      to   { transform: translateY(0);     opacity: 1; }
    }
  `],
})
export class DialogContainerComponent {
  @ViewChild('contentOutlet', { read: ViewContainerRef, static: true })
  contentOutlet!: ViewContainerRef;

  ariaLabel = 'Dialog';
  maxWidth = '560px';
  panelClass = '';
  backdropClick: (() => void) | null = null;

  private cdr = inject(ChangeDetectorRef);

  attachContent(view: ViewRef): void {
    this.contentOutlet.insert(view);
    this.cdr.markForCheck();
  }

  onBackdropClick(): void {
    this.backdropClick?.();
  }
}
