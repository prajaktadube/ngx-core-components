import { Component, Input, PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DialogService, DialogRef } from './dialog.service';
import { DialogContainerComponent } from './dialog-container.component';

@Component({
  template: `
    <div>
      <p>Dialog Content</p>
      <button id="close-btn" (click)="dialogRef.close('result-val')">Close</button>
      <button id="other-btn">Other</button>
    </div>
  `,
  standalone: true
})
class DummyDialogComponent {
  @Input() dialogData: any;
  @Input() dialogRef!: DialogRef<string>;
}

describe('DialogService', () => {
  let service: DialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DialogService,
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });
    service = TestBed.inject(DialogService);
  });

  afterEach(() => {
    // Clean up any remaining dialog elements in document.body
    document.querySelectorAll('ngx-dialog-host').forEach(el => el.remove());
  });

  it('should open a dialog component and show its content', () => {
    const ref = service.open(DummyDialogComponent, {
      ariaLabel: 'My Custom Dialog',
      panelClass: 'custom-class'
    });

    expect(ref).toBeTruthy();
    const hostEl = document.querySelector('ngx-dialog-host');
    expect(hostEl).toBeTruthy();
    expect(hostEl?.textContent).toContain('Dialog Content');

    const panelEl = hostEl?.querySelector('.ngx-dialog-panel');
    expect(panelEl?.getAttribute('aria-label')).toBe('My Custom Dialog');
    expect(panelEl?.classList.contains('custom-class')).toBeTrue();
  });

  it('should close on backdrop click by default', () => {
    const ref = service.open(DummyDialogComponent);
    const backdropEl = document.querySelector('.ngx-dialog-backdrop') as HTMLElement;
    expect(backdropEl).toBeTruthy();

    backdropEl.click();
    expect(document.querySelector('ngx-dialog-host')).toBeNull();
    expect(ref.closed()).toBeUndefined();
  });

  it('should NOT close on backdrop click if closeOnBackdrop is false', () => {
    const ref = service.open(DummyDialogComponent, { closeOnBackdrop: false });
    const backdropEl = document.querySelector('.ngx-dialog-backdrop') as HTMLElement;
    expect(backdropEl).toBeTruthy();

    backdropEl.click();
    expect(document.querySelector('ngx-dialog-host')).toBeTruthy();
  });

  it('should resolve closed signal and clean DOM when closed programmatically', () => {
    const ref = service.open(DummyDialogComponent);
    const hostEl = document.querySelector('ngx-dialog-host');
    expect(hostEl).toBeTruthy();

    ref.close('custom-result');
    expect(document.querySelector('ngx-dialog-host')).toBeNull();
    expect(ref.closed()).toBe('custom-result');
  });

  it('should close on Escape keydown', () => {
    const ref = service.open(DummyDialogComponent);
    expect(document.querySelector('ngx-dialog-host')).toBeTruthy();

    const escEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(escEvent);

    expect(document.querySelector('ngx-dialog-host')).toBeNull();
  });
});
