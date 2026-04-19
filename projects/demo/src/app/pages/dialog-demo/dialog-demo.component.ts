import { Component, inject, signal } from '@angular/core';
import { DialogService, DialogRef, DialogConfig } from 'ngx-core-components';

/* ---- Sample dialog content components ---- */

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    <div class="dialog-body">
      <div class="dialog-icon">⚠️</div>
      <h2 class="dialog-title">Delete Item</h2>
      <p class="dialog-message">Are you sure you want to delete <strong>{{ dialogData?.['name'] }}</strong>? This action cannot be undone.</p>
      <div class="dialog-actions">
        <button class="btn-secondary" (click)="dialogRef?.close('cancel')">Cancel</button>
        <button class="btn-danger" (click)="dialogRef?.close('confirm')">Delete</button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-body { padding: 28px 24px 20px; text-align: center; }
    .dialog-icon { font-size: 40px; margin-bottom: 12px; }
    .dialog-title { margin: 0 0 8px; font-size: 18px; font-weight: 700; color: #1a1a2e; }
    .dialog-message { margin: 0 0 20px; font-size: 14px; color: #495057; line-height: 1.6; }
    .dialog-actions { display: flex; gap: 10px; justify-content: center; }
    .btn-secondary { padding: 8px 20px; background: #f1f3f5; color: #495057; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; font-family: inherit; }
    .btn-danger { padding: 8px 20px; background: #e74c3c; color: #fff; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; font-family: inherit; }
    .btn-secondary:hover { background: #e9ecef; }
    .btn-danger:hover { background: #c0392b; }
  `],
})
export class ConfirmDialogContent {
  dialogData: Record<string, unknown> | null = null;
  dialogRef: DialogRef | null = null;
}

@Component({
  selector: 'app-info-dialog',
  standalone: true,
  template: `
    <div class="dialog-body">
      <div class="dialog-header">
        <h2 class="dialog-title">{{ dialogData?.['title'] || 'Information' }}</h2>
        <button class="close-btn" (click)="dialogRef?.close()">✕</button>
      </div>
      <div class="dialog-content">
        <p>{{ dialogData?.['message'] || 'This is a sample dialog opened programmatically using DialogService.' }}</p>
        <p>The dialog uses <code>ApplicationRef.createComponent()</code> — no NgModule, no z-index hacks, no CDK required.</p>
      </div>
      <div class="dialog-footer">
        <button class="btn-primary" (click)="dialogRef?.close('ok')">Got it</button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-body { display: flex; flex-direction: column; }
    .dialog-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px 12px; border-bottom: 1px solid #e9ecef; }
    .dialog-title { margin: 0; font-size: 16px; font-weight: 700; color: #1a1a2e; }
    .close-btn { background: none; border: none; font-size: 16px; cursor: pointer; color: #6c757d; padding: 4px; line-height: 1; }
    .close-btn:hover { color: #1a1a2e; }
    .dialog-content { padding: 16px 20px; font-size: 14px; color: #495057; line-height: 1.7; }
    .dialog-content code { background: #f1f3f5; padding: 2px 6px; border-radius: 3px; font-family: monospace; font-size: 12px; }
    .dialog-footer { padding: 12px 20px 16px; display: flex; justify-content: flex-end; }
    .btn-primary { padding: 8px 24px; background: #1a73e8; color: #fff; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; font-family: inherit; }
    .btn-primary:hover { background: #1557b0; }
  `],
})
export class InfoDialogContent {
  dialogData: Record<string, unknown> | null = null;
  dialogRef: DialogRef | null = null;
}

/* ---- Demo page component ---- */

@Component({
  selector: 'app-dialog-demo',
  standalone: true,
  imports: [],
  template: `
    <div class="demo-page">

      <!-- Page Header -->
      <div class="page-header">
        <div class="page-header-text">
          <h1>Dialog / Overlay</h1>
          <p>Programmatically open any Angular component as a floating dialog using <code>DialogService</code>.
             Built with <code>ApplicationRef.createComponent()</code> — zero z-index hacks, zero NgModule.</p>
        </div>
        <div class="header-badges">
          <span class="badge badge-blue">Standalone</span>
          <span class="badge badge-purple">Signal-based</span>
          <span class="badge badge-green">Zero CDK</span>
        </div>
      </div>

      <!-- Demo cards -->
      <div class="section-label">Live Demo</div>
      <div class="demo-cards-grid">

        <!-- Confirmation dialog -->
        <div class="demo-card">
          <div class="demo-card-title">Confirmation Dialog</div>
          <p class="card-desc">Opens a destructive-action confirmation. Result is delivered via the reactive <code>closed</code> signal.</p>
          <button class="btn-danger-outline" (click)="openConfirm()">Delete Item</button>
          @if (confirmResult()) {
            <div class="result-chip" [class.chip-success]="confirmResult() === 'cancel'" [class.chip-danger]="confirmResult() === 'confirm'">
              Result: <strong>{{ confirmResult() }}</strong>
            </div>
          }
        </div>

        <!-- Informational dialog -->
        <div class="demo-card">
          <div class="demo-card-title">Informational Dialog</div>
          <p class="card-desc">Opens a wide informational dialog with custom title and a close button inside the content component.</p>
          <button class="btn-primary" (click)="openInfo()">Open Dialog</button>
          @if (infoResult()) {
            <div class="result-chip chip-success">Result: <strong>{{ infoResult() }}</strong></div>
          }
        </div>

        <!-- Persistent dialog (no backdrop close) -->
        <div class="demo-card">
          <div class="demo-card-title">Persistent Dialog</div>
          <p class="card-desc">Sets <code>closeOnBackdrop: false</code> so the user must explicitly close it via the button inside.</p>
          <button class="btn-secondary" (click)="openPersistent()">Open Persistent</button>
          @if (persistentResult() !== null) {
            <div class="result-chip chip-success">Result: <strong>{{ persistentResult() }}</strong></div>
          }
        </div>

      </div>

      <div class="section-label">How to Use</div>
      <pre class="code-block">{{ codeExample }}</pre>

      <div class="section-label">API — DialogService.open()</div>
      <div class="api-table-wrap">
        <table class="api-table">
          <thead><tr><th>Config Property</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
          <tbody>
            @for (row of apiRows; track row.name) {
              <tr>
                <td class="api-name">{{ row.name }}</td>
                <td class="api-type">{{ row.type }}</td>
                <td class="api-default">{{ row.default }}</td>
                <td>{{ row.description }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

    </div>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; height: 100%; overflow-y: auto; }
    .demo-page { padding: 24px 28px; max-width: 1000px; display: flex; flex-direction: column; gap: 20px; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding-bottom: 16px; border-bottom: 1px solid #e9ecef; }
    .page-header-text h1 { margin: 0 0 6px; font-size: 24px; font-weight: 800; color: #1a1a2e; }
    .page-header-text p { margin: 0; font-size: 13px; color: #6c757d; line-height: 1.6; max-width: 600px; }
    .page-header-text code { background: #f1f3f5; padding: 1px 5px; border-radius: 3px; font-family: monospace; font-size: 12px; }
    .header-badges { display: flex; gap: 8px; flex-shrink: 0; }
    .badge { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 12px; }
    .badge-green { background: #dcfce7; color: #166534; }
    .badge-blue { background: #e8f0fe; color: #1a73e8; }
    .badge-purple { background: #f3e8ff; color: #7c3aed; }
    .section-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #adb5bd; border-bottom: 1px solid #f1f3f5; padding-bottom: 6px; }
    .demo-cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .demo-card { background: #fff; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; display: flex; flex-direction: column; gap: 12px; }
    .demo-card-title { font-size: 12px; font-weight: 700; color: #6c757d; text-transform: uppercase; letter-spacing: 0.4px; }
    .card-desc { margin: 0; font-size: 13px; color: #6c757d; line-height: 1.55; }
    .card-desc code { background: #f1f3f5; padding: 1px 5px; border-radius: 3px; font-family: monospace; font-size: 11px; }
    .btn-primary { padding: 9px 20px; background: #1a73e8; color: #fff; border: none; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; align-self: flex-start; }
    .btn-primary:hover { background: #1557b0; }
    .btn-secondary { padding: 9px 20px; background: #f1f3f5; color: #495057; border: 1px solid #dee2e6; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; align-self: flex-start; }
    .btn-secondary:hover { background: #e9ecef; }
    .btn-danger-outline { padding: 9px 20px; background: #fff; color: #e74c3c; border: 1px solid #e74c3c; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; align-self: flex-start; }
    .btn-danger-outline:hover { background: #fdf0ef; }
    .result-chip { padding: 6px 12px; border-radius: 20px; font-size: 12px; }
    .chip-success { background: #dcfce7; color: #166534; }
    .chip-danger { background: #fee2e2; color: #991b1b; }
    .code-block { background: #1e1e1e; color: #d4d4d4; padding: 20px; border-radius: 8px; font-size: 12px; font-family: 'Cascadia Code', Consolas, monospace; overflow-x: auto; white-space: pre; margin: 0; }
    .api-table-wrap { overflow-x: auto; border: 1px solid #e9ecef; border-radius: 8px; }
    .api-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .api-table thead tr { background: #f8f9fa; }
    .api-table th { padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #6c757d; border-bottom: 1px solid #e9ecef; white-space: nowrap; }
    .api-table td { padding: 10px 14px; border-bottom: 1px solid #f1f3f5; color: #495057; vertical-align: top; }
    .api-table tbody tr:last-child td { border-bottom: none; }
    .api-table tbody tr:hover td { background: #f8f9fa; }
    .api-name { color: #1a73e8 !important; font-family: monospace; font-weight: 600; white-space: nowrap; }
    .api-type { color: #8e44ad !important; font-family: monospace; white-space: nowrap; }
    .api-default { font-family: monospace; white-space: nowrap; }
  `],
})
export class DialogDemoComponent {
  private dialog = inject(DialogService);

  confirmResult = signal<string>('');
  infoResult = signal<string>('');
  persistentResult = signal<string | null>(null);

  openConfirm(): void {
    this.confirmResult.set('');
    const ref = this.dialog.open(ConfirmDialogContent, {
      data: { name: 'Project Alpha' },
      maxWidth: '420px',
    });
    // Poll the closed signal in a simple effect-like way using a microtask check
    const interval = setInterval(() => {
      const result = ref.closed();
      if (result !== undefined) {
        clearInterval(interval);
        this.confirmResult.set(result as string);
      }
    }, 100);
  }

  openInfo(): void {
    this.infoResult.set('');
    const ref = this.dialog.open(InfoDialogContent, {
      data: { title: 'About DialogService', message: 'DialogService opens Angular components programmatically.' },
      maxWidth: '560px',
    });
    const interval = setInterval(() => {
      const result = ref.closed();
      if (result !== undefined) {
        clearInterval(interval);
        this.infoResult.set(result as string);
      }
    }, 100);
  }

  openPersistent(): void {
    this.persistentResult.set(null);
    const ref = this.dialog.open(InfoDialogContent, {
      data: { title: 'Persistent Dialog', message: 'Click "Got it" to close. The backdrop click is disabled.' },
      closeOnBackdrop: false,
      maxWidth: '480px',
    });
    const interval = setInterval(() => {
      const result = ref.closed();
      if (result !== undefined) {
        clearInterval(interval);
        this.persistentResult.set(result as string ?? 'closed');
      }
    }, 100);
  }

  codeExample = `import { DialogService } from 'ngx-core-components';

@Component({...})
export class MyComponent {
  private dialog = inject(DialogService);

  openConfirm(): void {
    const ref = this.dialog.open(ConfirmComponent, {
      data: { name: 'Project Alpha' },
      maxWidth: '420px',
      closeOnBackdrop: true,
    });

    // React to close result
    effect(() => {
      const result = ref.closed();
      if (result !== undefined) console.log('Dialog closed with:', result);
    });
  }
}

// Content component receives data and dialogRef via property injection:
@Component({...})
export class ConfirmComponent {
  dialogData: { name: string } | null = null;  // set by DialogService
  dialogRef: DialogRef | null = null;           // set by DialogService

  confirm() { this.dialogRef?.close('confirm'); }
  cancel()  { this.dialogRef?.close('cancel'); }
}`;

  apiRows = [
    { name: 'data', type: 'D', default: 'undefined', description: 'Arbitrary data passed to the content component via the dialogData property.' },
    { name: 'closeOnBackdrop', type: 'boolean', default: 'true', description: 'Whether clicking the semi-transparent backdrop closes the dialog.' },
    { name: 'panelClass', type: 'string | string[]', default: "''", description: 'Extra CSS class(es) added to the dialog panel element.' },
    { name: 'ariaLabel', type: 'string', default: "'Dialog'", description: 'ARIA label applied to the dialog panel for screen readers.' },
    { name: 'maxWidth', type: 'string', default: "'560px'", description: 'CSS max-width of the dialog panel.' },
  ];
}
