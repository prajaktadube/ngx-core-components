import {
  Injectable, ApplicationRef, createComponent, EnvironmentInjector,
  inject, signal, Type
} from '@angular/core';
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

  open<C, D = unknown, R = unknown>(
    component: Type<C>,
    config?: DialogConfig<D>,
  ): DialogRef<R> {
    const cfg: Required<DialogConfig<D>> = {
      data: config?.data as D,
      closeOnBackdrop: config?.closeOnBackdrop ?? true,
      panelClass: config?.panelClass ?? [],
      ariaLabel: config?.ariaLabel ?? 'Dialog',
      maxWidth: config?.maxWidth ?? '560px',
    };

    const closedSignal = signal<R | undefined>(undefined);

    const dialogRef: DialogRef<R> = {
      closed: closedSignal,
      close: (result?: R) => {
        closedSignal.set(result);
        remove();
      },
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

    // Pass data if the content component has a `dialogData` input
    const instance = contentRef.instance as Record<string, unknown>;
    if ('dialogData' in instance) {
      instance['dialogData'] = cfg.data;
    }
    // Pass the dialogRef so the content can close itself
    if ('dialogRef' in instance) {
      instance['dialogRef'] = dialogRef;
    }

    container.attachContent(contentRef.hostView);
    this.appRef.attachView(containerRef.hostView);
    this.appRef.attachView(contentRef.hostView);

    containerRef.changeDetectorRef.detectChanges();

    const remove = () => {
      this.appRef.detachView(contentRef.hostView);
      this.appRef.detachView(containerRef.hostView);
      contentRef.destroy();
      containerRef.destroy();
      if (document.body.contains(hostEl)) {
        document.body.removeChild(hostEl);
      }
    };

    return dialogRef;
  }
}
