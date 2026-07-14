import {
  Component, ChangeDetectionStrategy, ViewChild, ViewContainerRef,
  ViewRef, ChangeDetectorRef, inject, ElementRef, HostListener
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
        tabindex="-1"
        style="outline: none;"
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
  private elRef = inject(ElementRef);

  attachContent(view: ViewRef): void {
    this.contentOutlet.insert(view);
    this.cdr.markForCheck();

    // Auto-focus first focusable element, or the panel itself
    setTimeout(() => {
      const focusable = this.getFocusableElements();
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        const panel = this.elRef.nativeElement.querySelector('.ngx-dialog-panel');
        panel?.focus();
      }
    }, 0);
  }

  onBackdropClick(): void {
    this.backdropClick?.();
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.backdropClick?.();
    } else if (event.key === 'Tab') {
      this.handleTab(event);
    }
  }

  private handleTab(event: KeyboardEvent): void {
    const focusable = this.getFocusableElements();
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement as HTMLElement;

    if (event.shiftKey) {
      if (active === first || !this.elRef.nativeElement.contains(active)) {
        last.focus();
        event.preventDefault();
      }
    } else {
      if (active === last || !this.elRef.nativeElement.contains(active)) {
        first.focus();
        event.preventDefault();
      }
    }
  }

  private getFocusableElements(): HTMLElement[] {
    const selector = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable]';
    const elements = Array.from(this.elRef.nativeElement.querySelectorAll(selector)) as HTMLElement[];
    return elements.filter(el => el.offsetWidth > 0 || el.offsetHeight > 0);
  }
}
