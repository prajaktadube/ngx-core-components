import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormDesignerComponent } from './form-designer.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('FormDesignerComponent', () => {
  let component: FormDesignerComponent;
  let fixture: ComponentFixture<FormDesignerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, FormDesignerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FormDesignerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add a field from toolbox when dropped onto the canvas', () => {
    const textToolboxField = component.toolboxFields[0]; // Text item
    
    // Simulate toolbox dragstart
    const mockDragEvent = new DragEvent('dragstart');
    component.onToolboxDragStart(mockDragEvent, textToolboxField);
    
    expect(component.isDraggingFromToolbox).toBeTrue();
    expect(component.draggingToolboxField).toBe(textToolboxField);

    // Simulate drop on canvas
    const mockDropEvent = new DragEvent('drop');
    component.onCanvasDrop(mockDropEvent);

    expect(component.designerFields().length).toBe(1);
    expect(component.designerFields()[0].type).toBe('text');
    expect(component.selectedField()).toBe(component.designerFields()[0]);
  });

  it('should update field properties and notify change', () => {
    const newField = { type: 'text' as const, label: 'Text Field', key: 'custom_key' };
    component.designerFields.set([newField]);
    component.selectField(newField);

    expect(component.selectedField()).toBe(newField);

    // Modify selected field properties
    component.selectedField()!.label = 'Updated Label';
    component.selectedField()!.required = true;
    component.onFieldPropertyChange();

    expect(component.designerFields()[0].label).toBe('Updated Label');
    expect(component.designerFields()[0].required).toBeTrue();
  });

  it('should manage dropdown options for select fields', () => {
    const selectField = { type: 'select' as const, label: 'Dropdown', key: 'dropdown_key', options: [] };
    component.designerFields.set([selectField]);
    component.selectField(selectField);

    // Add option
    component.addOption();
    expect(component.selectedField()!.options!.length).toBe(1);
    expect(component.selectedField()!.options![0].label).toBe('Option 1');

    // Delete option
    component.deleteOption(0);
    expect(component.selectedField()!.options!.length).toBe(0);
  });

  it('should reorder fields on drag drop reordering', () => {
    const field1 = { type: 'text' as const, label: 'Field 1', key: 'key1' };
    const field2 = { type: 'number' as const, label: 'Field 2', key: 'key2' };
    component.designerFields.set([field1, field2]);

    // Drag start on field1 (index 0)
    component.onCanvasFieldDragStart(new DragEvent('dragstart'), 0);
    expect(component.draggingIndex()).toBe(0);

    // Drop on field2 (index 1)
    component.onCanvasFieldDrop(new DragEvent('drop'), 1);

    expect(component.designerFields()[0].key).toBe('key2');
    expect(component.designerFields()[1].key).toBe('key1');
  });

  it('should import fields from JSON schema payload', () => {
    const jsonText = JSON.stringify([
      { key: 'first_name', label: 'First Name', type: 'text' },
      { key: 'age', label: 'Age', type: 'number' }
    ]);

    component.importSchemaText = jsonText;
    component.importSchema();

    expect(component.importError()).toBeNull();
    expect(component.designerFields().length).toBe(2);
    expect(component.designerFields()[0].key).toBe('first_name');
  });
});
