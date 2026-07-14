import {
  Injectable, ApplicationRef, createComponent, EnvironmentInjector,
  inject, signal, Type, PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DialogContainerComponent } from './dialog-container.component';

export interface DialogConfig<D = unknown> {
  /** Data passed to the dialog content component via the `dialogData` input. */
  data?: D;
  /** Whether clicking the backdrop closes the dialog. Defaults to true. */
  closeOnBackdrop?: boolean;
  /** Additional CSS class(es) to apply to the dialog panel. */
  panelClass?: string | string[];
  /** ARIA label for the dialog (for screen readers). */
  ariaLabel?: string;
  /** Max width of the dialog panel (CSS value). Defaults to '560px'. */
  maxWidth?: string;
}

export interface DialogRef<R = unknown> {
  /** Emits the result value and removes the dialog from the DOM. */
  close(result?: R): void;
  /** Signal that resolves with the result once the dialog closes. */
  readonly closed: ReturnType<typeof signal<R | undefined>>;
}

/**
 * DialogService — programmatically opens Angular components inside a floating
 * overlay without requiring NgModule or z-index hacks.
 *
 * Usage:
 * ```ts
 * const ref = this.dialog.open(MyFormComponent, { data: { id: 42 } });
 * ref.closed(); // reactive signal — undefined until dialog closes
 * ```
 */
@Injectable({ providedIn: 'root' })
export class DialogService {
  private appRef = inject(ApplicationRef);
  private injector = inject(EnvironmentInjector);
  private platformId = inject(PLATFORM_ID);

  open<C, D = unknown, R = unknown>(
    component: Type<C>,
    config?: DialogConfig<D>,
  ): DialogRef<R> {
    const closedSignal = signal<R | undefined>(undefined);
    let remove = () => {};

    const previouslyFocused = isPlatformBrowser(this.platformId) ? document.activeElement as HTMLElement : null;

    const dialogRef: DialogRef<R> = {
      closed: closedSignal,
      close: (result?: R) => {
        closedSignal.set(result);
        if (isPlatformBrowser(this.platformId)) {
          remove();
        }
      },
    };

    if (!isPlatformBrowser(this.platformId)) {
      return dialogRef;
    }

    const cfg: Required<DialogConfig<D>> = {
      data: config?.data as D,
      closeOnBackdrop: config?.closeOnBackdrop ?? true,
      panelClass: config?.panelClass ?? [],
      ariaLabel: config?.ariaLabel ?? 'Dialog',
      maxWidth: config?.maxWidth ?? '560px',
    };

    // Create a host element appended to <body>
    const hostEl = document.createElement('ngx-dialog-host');
    document.body.appendChild(hostEl);

    // Create the container component
    const containerRef = createComponent(DialogContainerComponent, {
      environmentInjector: this.injector,
      hostElement: hostEl,
    });

    const container = containerRef.instance;
    container.ariaLabel = cfg.ariaLabel;
    container.maxWidth = cfg.maxWidth;
    container.panelClass = Array.isArray(cfg.panelClass)
      ? cfg.panelClass.join(' ')
      : cfg.panelClass;

    container.backdropClick = () => {
      if (cfg.closeOnBackdrop) dialogRef.close();
    };

    // Create the content component and project it into the container
    const contentRef = createComponent(component as Type<unknown>, {
      environmentInjector: this.injector,
      projectableNodes: [],
    });

    // Always assign common integration properties so dynamic dialog content
    // can close itself even when these are plain class fields (not @Input).
    const instance = contentRef.instance as Record<string, unknown>;
    instance['dialogData'] = cfg.data;
    instance['dialogRef'] = dialogRef;

    // If the content uses Angular inputs, update them through setInput as well.
    if (typeof contentRef.setInput === 'function') {
      try { contentRef.setInput('dialogData', cfg.data); } catch {}
      try { contentRef.setInput('dialogRef', dialogRef); } catch {}
    }

    container.attachContent(contentRef.hostView);
    this.appRef.attachView(containerRef.hostView);

    // Ensure the content template sees injected properties immediately.
    contentRef.changeDetectorRef.detectChanges();

    containerRef.changeDetectorRef.detectChanges();

    remove = () => {
      this.appRef.detachView(containerRef.hostView);
      contentRef.destroy();
      containerRef.destroy();
      if (document.body.contains(hostEl)) {
        document.body.removeChild(hostEl);
      }
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    };

    return dialogRef;
  }
}
