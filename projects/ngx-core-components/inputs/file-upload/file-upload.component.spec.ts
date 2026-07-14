import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FileUploadComponent } from './file-upload.component';
import { provideNgxI18n } from '../../i18n/public-api';

describe('FileUploadComponent', () => {
  let component: FileUploadComponent;
  let fixture: ComponentFixture<FileUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileUploadComponent],
      providers: [
        provideNgxI18n({
          fileUpload: {
            browse: 'Durchsuchen',
            dragDrop: 'oder Dateien hierher ziehen',
            removeFile: 'Datei entfernen',
            maxSizeError: 'Datei zu groß',
            invalidTypeError: 'Ungültiger Dateityp'
          }
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FileUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display i18n localized text', () => {
    const headlineEl = fixture.nativeElement.querySelector('.upload-headline');
    expect(headlineEl.textContent.trim()).toContain('Durchsuchen');
    expect(headlineEl.textContent.trim()).toContain('oder Dateien hierher ziehen');
  });

  it('should update drag-over state on drag over and drag leave', () => {
    const dropzone = fixture.nativeElement.querySelector('.dropzone-area');
    expect(component.isDragOver()).toBeFalse();

    const dragOverEvent = new DragEvent('dragover');
    dropzone.dispatchEvent(dragOverEvent);
    fixture.detectChanges();
    expect(component.isDragOver()).toBeTrue();

    const dragLeaveEvent = new DragEvent('dragleave');
    dropzone.dispatchEvent(dragLeaveEvent);
    fixture.detectChanges();
    expect(component.isDragOver()).toBeFalse();
  });

  it('should trigger hidden input click when dropzone is clicked', () => {
    const fileInput = fixture.nativeElement.querySelector('.hidden-file-input') as HTMLInputElement;
    spyOn(fileInput, 'click');

    const dropzone = fixture.nativeElement.querySelector('.dropzone-area');
    dropzone.click();

    expect(fileInput.click).toHaveBeenCalled();
  });

  it('should keydown Enter trigger hidden input click', () => {
    const fileInput = fixture.nativeElement.querySelector('.hidden-file-input') as HTMLInputElement;
    spyOn(fileInput, 'click');

    const dropzone = fixture.nativeElement.querySelector('.dropzone-area');
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    dropzone.dispatchEvent(enterEvent);

    expect(fileInput.click).toHaveBeenCalled();
  });
});
