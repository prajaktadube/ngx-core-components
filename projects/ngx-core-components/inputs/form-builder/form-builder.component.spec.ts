import { TestBed } from '@angular/core/testing';
import { FormBuilderComponent } from './form-builder.component';

describe('FormBuilderComponent', () => {
  beforeEach(async () => {
    // Spy on window.open and window.alert to prevent PDF exports from freezing test runs
    spyOn(window, 'open').and.returnValue({
      document: {
        write: () => {},
        close: () => {},
      },
    } as any);
    spyOn(window, 'alert').and.stub();

    await TestBed.configureTestingModule({
      imports: [FormBuilderComponent],
    }).compileComponents();
  });

  it('should create and render with mock data', () => {
    const fixture = TestBed.createComponent(FormBuilderComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should execute interaction handlers and export functions', () => {
    const fixture = TestBed.createComponent(FormBuilderComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('validates each step before advancing', async () => {
    const fixture = TestBed.createComponent(FormBuilderComponent);
    fixture.componentRef.setInput('fields', [
      { key: 'name', label: 'Name', required: true, formStep: 0 },
      { key: 'email', label: 'Email', formStep: 1 },
    ]);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    await component.nextStep();
    expect(component.stepIndex()).toBe(0);
    expect(component.validationErrors()['name']).toBe('This field is required.');

    component.updateValue('name', 'Ada');
    await component.nextStep();
    expect(component.stepIndex()).toBe(1);
    expect(component.currentStepFields().map(field => field.key)).toEqual(['email']);
  });

  it('does not emit a form with asynchronous validation errors', async () => {
    const fixture = TestBed.createComponent(FormBuilderComponent);
    fixture.componentRef.setInput('fields', [
      {
        key: 'username',
        label: 'Username',
        asyncValidator: async (value: unknown) => (value === 'taken' ? 'Already in use' : null),
      },
    ]);
    fixture.componentRef.setInput('value', { username: 'taken' });
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const submitted = jasmine.createSpy('submitted');
    component.formSubmit.subscribe(submitted);

    await component.submit(new Event('submit'));

    expect(submitted).not.toHaveBeenCalled();
    expect(component.validationErrors()['username']).toBe('Already in use');
    expect(component.pending()).toBeFalse();
  });

  it('skips required and asynchronous validation for disabled fields', async () => {
    const validator = jasmine.createSpy('validator').and.resolveTo('Should not run');
    const fixture = TestBed.createComponent(FormBuilderComponent);
    fixture.componentRef.setInput('fields', [
      { key: 'internal', label: 'Internal', required: true, disabled: true, asyncValidator: validator },
    ]);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const submitted = jasmine.createSpy('submitted');
    component.formSubmit.subscribe(submitted);

    await component.submit(new Event('submit'));

    expect(validator).not.toHaveBeenCalled();
    expect(component.validationErrors()).toEqual({});
    expect(submitted).toHaveBeenCalledOnceWith({});
  });

  it('clears an earlier required error when a condition disables its field', async () => {
    const fixture = TestBed.createComponent(FormBuilderComponent);
    fixture.componentRef.setInput('fields', [
      { key: 'advanced', label: 'Advanced', type: 'checkbox', value: false },
      {
        key: 'details',
        label: 'Details',
        required: true,
        conditions: [{ field: 'advanced', operator: 'isFalse', action: 'enable' }],
      },
    ]);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    await component.submit(new Event('submit'));
    expect(component.validationErrors()['details']).toBe('This field is required.');

    component.updateValue('advanced', true);
    await component.submit(new Event('submit'));

    expect(component.validationErrors()).toEqual({});
  });

  it('applies typed visibility and enablement conditions to current field values', () => {
    const fixture = TestBed.createComponent(FormBuilderComponent);
    fixture.componentRef.setInput('fields', [
      { key: 'advanced', label: 'Advanced', type: 'checkbox', value: false },
      {
        key: 'details',
        label: 'Details',
        conditions: [{ field: 'advanced', operator: 'isTrue', action: 'show' }],
      },
      {
        key: 'basic',
        label: 'Basic',
        conditions: [{ field: 'advanced', operator: 'isFalse', action: 'disable' }],
      },
    ]);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component.currentStepFields().map(field => field.key)).toEqual(['advanced', 'basic']);
    expect(component.isFieldDisabled(component.fields()[2])).toBeTrue();

    component.updateValue('advanced', true);

    expect(component.currentStepFields().map(field => field.key)).toEqual(['advanced', 'details', 'basic']);
    expect(component.isFieldDisabled(component.fields()[2])).toBeFalse();
  });

  it('ignores stale asynchronous validation results after the value changes', async () => {
    let resolveStale!: (message: string | null) => void;
    const staleValidation = new Promise<string | null>(resolve => {
      resolveStale = resolve;
    });
    const fixture = TestBed.createComponent(FormBuilderComponent);
    fixture.componentRef.setInput('fields', [
      {
        key: 'username',
        label: 'Username',
        asyncValidator: (value: unknown) => (value === 'old' ? staleValidation : Promise.resolve(null)),
      },
    ]);
    fixture.componentRef.setInput('value', { username: 'old' });
    fixture.detectChanges();
    const component = fixture.componentInstance;

    const staleSubmit = component.submit(new Event('submit'));
    component.updateValue('username', 'new');
    await component.submit(new Event('submit'));
    resolveStale('Stale error');
    await staleSubmit;

    expect(component.validationErrors()).toEqual({});
    expect(component.pending()).toBeFalse();
  });

  it('reports missing condition references and dependency cycles before submission', async () => {
    const validator = jasmine.createSpy('validator').and.resolveTo(null);
    const fixture = TestBed.createComponent(FormBuilderComponent);
    fixture.componentRef.setInput('fields', [
      {
        key: 'broken',
        label: 'Broken',
        asyncValidator: validator,
        conditions: [{ field: 'missing', operator: 'eq', value: true, action: 'show' }],
      },
      {
        key: 'first',
        label: 'First',
        conditions: [{ field: 'second', operator: 'eq', value: true, action: 'show' }],
      },
      {
        key: 'second',
        label: 'Second',
        conditions: [{ field: 'first', operator: 'eq', value: true, action: 'show' }],
      },
    ]);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const submitted = jasmine.createSpy('submitted');
    component.formSubmit.subscribe(submitted);

    await component.submit(new Event('submit'));

    expect(component.schemaErrors()).toEqual([
      'Field "broken" refers to missing condition field "missing".',
      'Form condition dependency cycle detected: first, second.',
    ]);
    expect(validator).not.toHaveBeenCalled();
    expect(submitted).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
  });
});
