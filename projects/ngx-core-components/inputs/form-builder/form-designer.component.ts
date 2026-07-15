import { Component, computed, signal, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilderField, FormBuilderOption, FormBuilderComponent } from './form-builder.component';

@Component({
  selector: 'ngx-form-designer',
  standalone: true,
  imports: [CommonModule, FormsModule, FormBuilderComponent],
  template: `
    <div class="ngx-form-designer-container" [class.dark-mode]="theme() === 'dark'">
      
      <!-- Top Actions Bar -->
      <div class="designer-header">
        <h3 class="designer-title">Visual Form Designer</h3>
        <div class="designer-header-actions">
          <button class="header-action-btn primary" (click)="importSchemaPopupOpen.set(true)">📥 Import Schema</button>
          <button class="header-action-btn" (click)="clearAll()">🗑️ Clear All</button>
        </div>
      </div>

      <div class="designer-workspace">
        <!-- 1. Toolbox Panel -->
        <div class="designer-panel toolbox-panel">
          <h4 class="panel-title">Toolbox</h4>
          <p class="panel-subtitle">Drag fields to the canvas</p>
          
          <div class="toolbox-items">
            @for (item of toolboxFields; track item.type) {
              <div 
                class="toolbox-card" 
                draggable="true" 
                (dragstart)="onToolboxDragStart($event, item)"
                (dragend)="onDragEnd()"
              >
                <span class="toolbox-icon">{{ getIconForType(item.type) }}</span>
                <span class="toolbox-label">{{ item.label }}</span>
              </div>
            }
          </div>
        </div>

        <!-- 2. Interactive Canvas -->
        <div class="designer-panel canvas-panel">
          <div class="panel-header">
            <h4 class="panel-title">Canvas</h4>
            <span class="field-count-badge">{{ designerFields().length }} Fields</span>
          </div>

          <div 
            class="canvas-dropzone" 
            [class.drag-over]="isDraggingOverCanvas && isDraggingFromToolbox"
            (dragover)="onCanvasDragOver($event)"
            (dragleave)="onCanvasDragLeave()"
            (drop)="onCanvasDrop($event)"
          >
            @if (designerFields().length === 0) {
              <div class="canvas-placeholder">
                <span class="placeholder-icon">🎯</span>
                <p class="placeholder-text">Drag and drop fields here to start designing your form</p>
              </div>
            } @else {
              <div class="canvas-fields-list">
                @for (field of designerFields(); track field.key; let idx = $index) {
                  <div 
                    class="canvas-field-row"
                    [class.selected]="selectedField()?.key === field.key"
                    [class.drag-over]="dragOverIndex() === idx"
                    [class.dragging]="draggingIndex() === idx"
                    draggable="true"
                    (dragstart)="onCanvasFieldDragStart($event, idx)"
                    (dragover)="onCanvasFieldDragOver($event, idx)"
                    (dragleave)="onCanvasFieldDragLeave()"
                    (drop)="onCanvasFieldDrop($event, idx)"
                    (dragend)="onDragEnd()"
                    (click)="selectField(field)"
                  >
                    <!-- Drag handle -->
                    <div class="field-drag-handle">&#8942;&#8942;</div>
                    
                    <!-- Content -->
                    <div class="field-details">
                      <div class="field-header">
                        <span class="field-type-badge">{{ field.type || 'text' }}</span>
                        <span class="field-key-badge">{{ field.key }}</span>
                      </div>
                      <span class="field-label-text">{{ field.label }} @if (field.required) { <strong class="req-star">*</strong> }</span>
                      @if (field.placeholder) {
                        <span class="field-placeholder-text">Placeholder: "{{ field.placeholder }}"</span>
                      }
                    </div>

                    <!-- Delete button -->
                    <button class="delete-field-btn" (click)="deleteField(field, $event)" title="Delete Field">✕</button>
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <!-- 3. Inspector Settings / Schema Panel -->
        <div class="designer-panel inspector-panel">
          <div class="inspector-tabs">
            <button class="tab-btn" [class.active]="activeTab() === 'properties'" (click)="activeTab.set('properties')">Properties</button>
            <button class="tab-btn" [class.active]="activeTab() === 'schema'" (click)="activeTab.set('schema')">JSON Schema</button>
            <button class="tab-btn" [class.active]="activeTab() === 'preview'" (click)="activeTab.set('preview')">Live Preview</button>
          </div>

          <!-- Properties Inspector Tab -->
          @if (activeTab() === 'properties') {
            <div class="tab-content properties-content">
              @if (!selectedField()) {
                <div class="inspector-placeholder">
                  <span>⚙️</span>
                  <p>Select a field on the canvas to configure its properties.</p>
                </div>
              } @else {
                <div class="properties-form">
                  <label class="inspector-field">
                    <span class="inspector-label">Unique Key</span>
                    <input type="text" [(ngModel)]="selectedField()!.key" (ngModelChange)="onFieldPropertyChange()" />
                  </label>

                  <label class="inspector-field">
                    <span class="inspector-label">Field Label</span>
                    <input type="text" [(ngModel)]="selectedField()!.label" (ngModelChange)="onFieldPropertyChange()" />
                  </label>

                  @if (selectedField()!.type !== 'checkbox') {
                    <label class="inspector-field">
                      <span class="inspector-label">Placeholder Text</span>
                      <input type="text" [(ngModel)]="selectedField()!.placeholder" (ngModelChange)="onFieldPropertyChange()" />
                    </label>
                  }

                  @if (selectedField()!.type === 'number') {
                    <div class="properties-row">
                      <label class="inspector-field">
                        <span class="inspector-label">Min Value</span>
                        <input type="number" [(ngModel)]="selectedField()!.min" (ngModelChange)="onFieldPropertyChange()" />
                      </label>
                      <label class="inspector-field">
                        <span class="inspector-label">Max Value</span>
                        <input type="number" [(ngModel)]="selectedField()!.max" (ngModelChange)="onFieldPropertyChange()" />
                      </label>
                    </div>
                    <label class="inspector-field">
                      <span class="inspector-label">Step</span>
                      <input type="number" [(ngModel)]="selectedField()!.step" (ngModelChange)="onFieldPropertyChange()" />
                    </label>
                  }

                  <div class="checkbox-row">
                    <label class="inspector-checkbox">
                      <input type="checkbox" [(ngModel)]="selectedField()!.required" (ngModelChange)="onFieldPropertyChange()" />
                      <span>Required Field</span>
                    </label>

                    <label class="inspector-checkbox">
                      <input type="checkbox" [(ngModel)]="selectedField()!.disabled" (ngModelChange)="onFieldPropertyChange()" />
                      <span>Disabled Field</span>
                    </label>
                  </div>

                  <!-- Options list editor (for Select fields) -->
                  @if (selectedField()!.type === 'select') {
                    <div class="options-editor-section">
                      <div class="options-header">
                        <span class="inspector-label">Dropdown Options</span>
                        <button class="add-opt-btn" (click)="addOption()">➕ Add</button>
                      </div>
                      
                      <div class="options-list">
                        @for (opt of selectedField()!.options || []; track $index; let oidx = $index) {
                          <div class="option-edit-row">
                            <input type="text" placeholder="Label" [(ngModel)]="opt.label" (ngModelChange)="onFieldPropertyChange()" />
                            <input type="text" placeholder="Value" [(ngModel)]="opt.value" (ngModelChange)="onFieldPropertyChange()" />
                            <button class="delete-opt-btn" (click)="deleteOption(oidx)" title="Delete Option">✕</button>
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          }

          <!-- JSON Schema Tab -->
          @if (activeTab() === 'schema') {
            <div class="tab-content schema-content">
              <div class="schema-actions">
                <button class="schema-action-btn" (click)="copySchema()">📋 Copy Schema</button>
              </div>
              <pre class="schema-code-block"><code>{{ schemaJsonString() }}</code></pre>
            </div>
          }

          <!-- Live Preview Tab -->
          @if (activeTab() === 'preview') {
            <div class="tab-content preview-content">
              <div class="preview-card">
                <ngx-form-builder 
                  [fields]="designerFields()"
                  [showSubmit]="true"
                  submitLabel="Test Submit"
                  (formSubmit)="onPreviewSubmit($event)"
                ></ngx-form-builder>
              </div>
              @if (previewSubmitData()) {
                <div class="preview-submit-banner">
                  <span class="banner-title">Form Submitted Data:</span>
                  <pre><code>{{ previewSubmitData() | json }}</code></pre>
                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Popups / Modals -->
      @if (importSchemaPopupOpen()) {
        <div class="designer-modal-overlay">
          <div class="designer-modal-card">
            <h4 class="modal-title">Import JSON Schema</h4>
            <p class="modal-subtitle">Paste a valid FormBuilderField[] JSON array below:</p>
            <textarea 
              class="modal-textarea" 
              placeholder="[ { &quot;key&quot;: &quot;firstname&quot;, &quot;label&quot;: &quot;First Name&quot;, &quot;type&quot;: &quot;text&quot; } ]"
              [(ngModel)]="importSchemaText"
            ></textarea>
            @if (importError()) {
              <div class="modal-error-banner">{{ importError() }}</div>
            }
            <div class="modal-actions">
              <button class="modal-action-btn cancel" (click)="importSchemaPopupOpen.set(false)">Cancel</button>
              <button class="modal-action-btn primary" (click)="importSchema()">Import</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    .ngx-form-designer-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 580px;
      background: var(--ngx-designer-bg, #f8fafc);
      color: var(--ngx-designer-text, #0f172a);
      font-family: var(--ngx-font-family, sans-serif);
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid var(--ngx-designer-border, #e2e8f0);
    }
    
    /* Dark mode overrides */
    .ngx-form-designer-container.dark-mode {
      --ngx-designer-bg: #0f172a;
      --ngx-designer-text: #f8fafc;
      --ngx-designer-border: #334155;
    }
    
    .designer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 20px;
      border-bottom: 1px solid var(--ngx-designer-border, #e2e8f0);
      background: var(--ngx-designer-bg, #ffffff);
    }
    .designer-title {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
    }
    .designer-header-actions {
      display: flex;
      gap: 10px;
    }
    .header-action-btn {
      border: 1px solid var(--ngx-designer-border, #e2e8f0);
      background: transparent;
      padding: 7px 14px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      color: inherit;
      cursor: pointer;
      transition: all 0.15s;
    }
    .header-action-btn:hover {
      background: rgba(0,0,0,0.03);
    }
    .header-action-btn.primary {
      background: var(--primary-color, #4f46e5);
      color: #fff;
      border: none;
    }
    .header-action-btn.primary:hover {
      background: var(--primary-hover, #4338ca);
    }

    .designer-workspace {
      display: grid;
      grid-template-columns: 240px 1fr 340px;
      flex: 1;
      height: calc(100% - 60px);
      overflow: hidden;
    }
    
    @media (max-width: 950px) {
      .designer-workspace {
        grid-template-columns: 200px 1fr;
      }
      .inspector-panel {
        grid-column: 1 / span 2;
        border-top: 1px solid var(--ngx-designer-border, #e2e8f0);
        height: auto;
      }
    }

    .designer-panel {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: var(--ngx-designer-panel-bg, #ffffff);
    }
    .dark-mode .designer-panel {
      --ngx-designer-panel-bg: #1e293b;
    }
    
    .toolbox-panel {
      border-right: 1px solid var(--ngx-designer-border, #e2e8f0);
      padding: 16px;
    }
    .panel-title {
      margin: 0;
      font-size: 14px;
      font-weight: 700;
    }
    .panel-subtitle {
      margin: 4px 0 16px;
      font-size: 11px;
      opacity: 0.6;
    }
    .toolbox-items {
      display: flex;
      flex-direction: column;
      gap: 10px;
      overflow-y: auto;
    }
    .toolbox-card {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border: 1px dashed var(--ngx-designer-border, #cbd5e1);
      border-radius: 8px;
      cursor: grab;
      font-size: 12px;
      font-weight: 600;
      transition: all 0.2s;
    }
    .toolbox-card:hover {
      border-color: var(--primary-color, #4f46e5);
      background: rgba(79,70,229,0.03);
    }
    .toolbox-icon {
      font-size: 16px;
    }

    .canvas-panel {
      border-right: 1px solid var(--ngx-designer-border, #e2e8f0);
      background: var(--ngx-designer-canvas-bg, #f1f5f9);
      padding: 16px;
    }
    .dark-mode .canvas-panel {
      --ngx-designer-canvas-bg: #0f172a;
    }
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .field-count-badge {
      font-size: 10px;
      font-weight: 700;
      background: rgba(0,0,0,0.06);
      padding: 3px 8px;
      border-radius: 12px;
    }
    .dark-mode .field-count-badge {
      background: rgba(255,255,255,0.08);
    }

    .canvas-dropzone {
      flex: 1;
      border: 2px dashed var(--ngx-designer-border, #cbd5e1);
      border-radius: 10px;
      background: var(--ngx-designer-panel-bg, #ffffff);
      padding: 16px;
      overflow-y: auto;
      transition: all 0.2s;
      min-height: 250px;
    }
    .canvas-dropzone.drag-over {
      border-color: var(--primary-color, #4f46e5);
      background: rgba(79,70,229,0.02);
    }
    .canvas-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      text-align: center;
      opacity: 0.5;
      padding: 40px 10px;
    }
    .placeholder-icon {
      font-size: 32px;
      margin-bottom: 10px;
    }
    .placeholder-text {
      font-size: 12px;
      max-width: 200px;
      margin: 0;
    }

    .canvas-fields-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .canvas-field-row {
      display: flex;
      align-items: center;
      padding: 12px 14px;
      border: 1px solid var(--ngx-designer-border, #e2e8f0);
      border-radius: 8px;
      background: var(--ngx-designer-panel-bg, #ffffff);
      cursor: pointer;
      position: relative;
      transition: all 0.2s;
    }
    .canvas-field-row:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.04);
      border-color: var(--ngx-designer-border-hover, #cbd5e1);
    }
    .canvas-field-row.selected {
      border-color: var(--primary-color, #4f46e5);
      box-shadow: 0 0 0 2px rgba(79,70,229,0.08);
      background: rgba(79,70,229,0.01);
    }
    .canvas-field-row.dragging {
      opacity: 0.4;
      border-style: dashed;
    }
    .canvas-field-row.drag-over {
      border-top: 2px solid var(--primary-color, #4f46e5);
    }

    .field-drag-handle {
      cursor: grab;
      margin-right: 12px;
      opacity: 0.3;
      font-size: 16px;
      user-select: none;
    }
    .field-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .field-header {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-bottom: 2px;
    }
    .field-type-badge {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      background: rgba(79,70,229,0.08);
      color: var(--primary-color, #4f46e5);
      padding: 1px 6px;
      border-radius: 4px;
    }
    .field-key-badge {
      font-size: 9px;
      font-family: monospace;
      opacity: 0.5;
    }
    .field-label-text {
      font-size: 13px;
      font-weight: 600;
    }
    .req-star {
      color: #dc2626;
    }
    .field-placeholder-text {
      font-size: 10px;
      opacity: 0.5;
    }
    .delete-field-btn {
      background: transparent;
      border: 0;
      color: #ef4444;
      cursor: pointer;
      font-size: 12px;
      font-weight: bold;
      opacity: 0.3;
      padding: 6px;
      border-radius: 4px;
      transition: all 0.15s;
    }
    .canvas-field-row:hover .delete-field-btn {
      opacity: 1;
    }
    .delete-field-btn:hover {
      background: rgba(239,68,68,0.06);
    }

    .inspector-panel {
      padding: 0;
    }
    .inspector-tabs {
      display: flex;
      border-bottom: 1px solid var(--ngx-designer-border, #e2e8f0);
    }
    .tab-btn {
      flex: 1;
      border: 0;
      background: transparent;
      padding: 12px 6px;
      font-size: 11px;
      font-weight: 700;
      color: inherit;
      opacity: 0.6;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }
    .tab-btn:hover {
      opacity: 0.9;
    }
    .tab-btn.active {
      opacity: 1;
      border-bottom-color: var(--primary-color, #4f46e5);
      color: var(--primary-color, #4f46e5);
    }

    .tab-content {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
    }
    .inspector-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      text-align: center;
      opacity: 0.5;
      padding: 40px 10px;
    }
    .inspector-placeholder span {
      font-size: 32px;
      margin-bottom: 10px;
    }
    .inspector-placeholder p {
      font-size: 11px;
      margin: 0;
      max-width: 180px;
    }

    .properties-form {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .inspector-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .inspector-label {
      font-size: 11px;
      font-weight: 700;
      opacity: 0.7;
    }
    .properties-form input[type="text"],
    .properties-form input[type="number"] {
      width: 100%;
      border: 1px solid var(--ngx-designer-border, #cbd5e1);
      border-radius: 6px;
      background: transparent;
      color: inherit;
      padding: 8px 10px;
      font-size: 12px;
      outline: none;
      transition: border-color 0.2s;
    }
    .properties-form input[type="text"]:focus,
    .properties-form input[type="number"]:focus {
      border-color: var(--primary-color, #4f46e5);
    }
    .properties-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .checkbox-row {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin: 6px 0;
    }
    .inspector-checkbox {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
    }
    .inspector-checkbox input {
      accent-color: var(--primary-color, #4f46e5);
    }

    .options-editor-section {
      border-top: 1px solid var(--ngx-designer-border, #e2e8f0);
      padding-top: 14px;
      margin-top: 6px;
    }
    .options-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .add-opt-btn {
      background: transparent;
      border: 0;
      color: var(--primary-color, #4f46e5);
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
    }
    .options-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .option-edit-row {
      display: grid;
      grid-template-columns: 1fr 1fr 24px;
      gap: 6px;
      align-items: center;
    }
    .option-edit-row input {
      border: 1px solid var(--ngx-designer-border, #cbd5e1);
      border-radius: 4px;
      padding: 5px 8px;
      font-size: 11px;
      background: transparent;
      color: inherit;
    }
    .delete-opt-btn {
      background: transparent;
      border: 0;
      color: #ef4444;
      cursor: pointer;
      font-size: 11px;
      font-weight: bold;
    }

    .schema-actions {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 10px;
    }
    .schema-action-btn {
      border: 0;
      background: var(--primary-color, #4f46e5);
      color: #fff;
      border-radius: 5px;
      padding: 6px 12px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
    }
    .schema-code-block {
      background: rgba(0,0,0,0.03);
      padding: 12px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 11px;
      overflow-x: auto;
      white-space: pre-wrap;
      margin: 0;
    }
    .dark-mode .schema-code-block {
      background: rgba(255,255,255,0.03);
    }

    .preview-card {
      border: 1px solid var(--ngx-designer-border, #e2e8f0);
      border-radius: 8px;
      padding: 16px;
      background: var(--ngx-designer-panel-bg, #ffffff);
    }
    .preview-submit-banner {
      margin-top: 14px;
      padding: 10px 12px;
      background: rgba(16,185,129,0.08);
      border: 1px solid rgba(16,185,129,0.15);
      border-radius: 6px;
    }
    .banner-title {
      font-size: 11px;
      font-weight: 700;
      color: #059669;
    }
    .preview-submit-banner pre {
      margin: 6px 0 0;
      font-family: monospace;
      font-size: 10px;
      overflow-x: auto;
    }

    /* Modal / Popups styles */
    .designer-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .designer-modal-card {
      background: var(--ngx-designer-panel-bg, #ffffff);
      border: 1px solid var(--ngx-designer-border, #e2e8f0);
      border-radius: 12px;
      padding: 20px;
      width: 420px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .modal-title {
      margin: 0;
      font-size: 14px;
      font-weight: 700;
    }
    .modal-subtitle {
      margin: 0;
      font-size: 11px;
      opacity: 0.6;
    }
    .modal-textarea {
      width: 100%;
      height: 140px;
      border: 1px solid var(--ngx-designer-border, #cbd5e1);
      border-radius: 6px;
      background: transparent;
      color: inherit;
      padding: 8px 10px;
      font-family: monospace;
      font-size: 11px;
      outline: none;
      resize: none;
    }
    .modal-error-banner {
      color: #dc2626;
      font-size: 10px;
      font-weight: 600;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 4px;
    }
    .modal-action-btn {
      border: 0;
      border-radius: 5px;
      padding: 7px 14px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }
    .modal-action-btn.cancel {
      background: transparent;
      border: 1px solid var(--ngx-designer-border, #cbd5e1);
      color: inherit;
    }
    .modal-action-btn.primary {
      background: var(--primary-color, #4f46e5);
      color: #fff;
    }
  `]
})
export class FormDesignerComponent {
  theme = input<'light' | 'dark'>('light');
  
  schemaChange = output<FormBuilderField[]>();

  designerFields = signal<FormBuilderField[]>([]);
  selectedField = signal<FormBuilderField | null>(null);
  activeTab = signal<'properties' | 'schema' | 'preview'>('properties');
  
  // Drag states
  isDraggingFromToolbox = false;
  draggingToolboxField: FormBuilderField | null = null;
  isDraggingOverCanvas = false;
  
  draggingIndex = signal<number | null>(null);
  dragOverIndex = signal<number | null>(null);

  // Modal import states
  importSchemaPopupOpen = signal<boolean>(false);
  importSchemaText = '';
  importError = signal<string | null>(null);

  // Live preview submit state
  previewSubmitData = signal<Record<string, unknown> | null>(null);

  toolboxFields: FormBuilderField[] = [
    { type: 'text', label: 'Short Text', key: 'text_field', placeholder: 'Enter text...' },
    { type: 'email', label: 'Email', key: 'email_field', placeholder: 'Enter email address...' },
    { type: 'password', label: 'Password', key: 'password_field', placeholder: 'Enter password...' },
    { type: 'number', label: 'Number', key: 'number_field', placeholder: 'Enter number...' },
    { type: 'textarea', label: 'Long Text', key: 'textarea_field', placeholder: 'Enter long text...' },
    { type: 'select', label: 'Dropdown', key: 'select_field', placeholder: 'Select...', options: [{ label: 'Option 1', value: 'opt1' }, { label: 'Option 2', value: 'opt2' }] },
    { type: 'checkbox', label: 'Checkbox', key: 'checkbox_field' },
    { type: 'date', label: 'Date Picker', key: 'date_field' }
  ];

  schemaJsonString = computed(() => {
    return JSON.stringify(this.designerFields(), null, 2);
  });

  constructor() {
    // Sync notifications on change
    effect(() => {
      this.schemaChange.emit(this.designerFields());
    });
  }

  getIconForType(type?: string): string {
    switch (type) {
      case 'text': return '🔤';
      case 'email': return '📧';
      case 'password': return '🔑';
      case 'number': return '🔢';
      case 'textarea': return '📝';
      case 'select': return '▼';
      case 'checkbox': return '☑️';
      case 'date': return '📅';
      default: return '📄';
    }
  }

  // Toolbox drag handlers
  onToolboxDragStart(event: DragEvent, field: FormBuilderField): void {
    this.isDraggingFromToolbox = true;
    this.draggingToolboxField = field;
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', 'toolbox');
      event.dataTransfer.effectAllowed = 'copy';
    }
  }

  // Canvas Drag/Drop handlers
  onCanvasDragOver(event: DragEvent): void {
    event.preventDefault();
    if (this.isDraggingFromToolbox) {
      this.isDraggingOverCanvas = true;
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'copy';
      }
    }
  }

  onCanvasDragLeave(): void {
    this.isDraggingOverCanvas = false;
  }

  onCanvasDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingOverCanvas = false;

    if (this.isDraggingFromToolbox && this.draggingToolboxField) {
      const type = this.draggingToolboxField.type;
      const count = this.designerFields().filter(f => f.type === type).length + 1;
      const key = `${type}_${Math.random().toString(36).substr(2, 4)}`;
      
      const newField: FormBuilderField = {
        ...this.draggingToolboxField,
        key,
        label: `${this.draggingToolboxField.label} ${count}`,
        options: this.draggingToolboxField.options ? JSON.parse(JSON.stringify(this.draggingToolboxField.options)) : undefined
      };

      this.designerFields.update(arr => [...arr, newField]);
      this.selectField(newField);
    }
    
    this.onDragEnd();
  }

  // Canvas sorting / reordering drag handlers
  onCanvasFieldDragStart(event: DragEvent, idx: number): void {
    this.isDraggingFromToolbox = false;
    this.draggingIndex.set(idx);
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', String(idx));
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onCanvasFieldDragOver(event: DragEvent, idx: number): void {
    event.preventDefault();
    if (this.draggingIndex() !== null && this.draggingIndex() !== idx) {
      this.dragOverIndex.set(idx);
    }
  }

  onCanvasFieldDragLeave(): void {
    this.dragOverIndex.set(null);
  }

  onCanvasFieldDrop(event: DragEvent, targetIdx: number): void {
    event.preventDefault();
    const sourceIdx = this.draggingIndex();
    this.dragOverIndex.set(null);

    if (sourceIdx !== null && sourceIdx !== targetIdx) {
      this.designerFields.update(arr => {
        const next = [...arr];
        const [moved] = next.splice(sourceIdx, 1);
        next.splice(targetIdx, 0, moved);
        return next;
      });
    }
    
    this.onDragEnd();
  }

  onDragEnd(): void {
    this.isDraggingFromToolbox = false;
    this.draggingToolboxField = null;
    this.isDraggingOverCanvas = false;
    this.draggingIndex.set(null);
    this.dragOverIndex.set(null);
  }

  // Selection & mutations
  selectField(field: FormBuilderField): void {
    // Make a shallow copy of properties to support reactive form updates
    this.selectedField.set(field);
  }

  onFieldPropertyChange(): void {
    const selected = this.selectedField();
    if (!selected) return;

    this.designerFields.update(arr => {
      return arr.map(f => (f.key === selected.key ? { ...selected } : f));
    });
  }

  deleteField(field: FormBuilderField, event: MouseEvent): void {
    event.stopPropagation();
    this.designerFields.update(arr => arr.filter(f => f.key !== field.key));
    if (this.selectedField()?.key === field.key) {
      this.selectedField.set(null);
    }
  }

  clearAll(): void {
    if (confirm('Are you sure you want to delete all fields?')) {
      this.designerFields.set([]);
      this.selectedField.set(null);
      this.previewSubmitData.set(null);
    }
  }

  // Options list mutations
  addOption(): void {
    const selected = this.selectedField();
    if (!selected) return;

    const opts = selected.options || [];
    const count = opts.length + 1;
    const nextOpts: FormBuilderOption[] = [
      ...opts,
      { label: `Option ${count}`, value: `opt${count}` }
    ];

    selected.options = nextOpts;
    this.onFieldPropertyChange();
  }

  deleteOption(idx: number): void {
    const selected = this.selectedField();
    if (!selected || !selected.options) return;

    selected.options = selected.options.filter((_, i) => i !== idx);
    this.onFieldPropertyChange();
  }

  // Schema copying
  async copySchema(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.schemaJsonString());
      alert('Schema copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy schema:', err);
    }
  }

  // Import Schema Dialog
  importSchema(): void {
    this.importError.set(null);
    try {
      const parsed = JSON.parse(this.importSchemaText);
      if (!Array.isArray(parsed)) {
        throw new Error('Schema must be a JSON array of FormBuilderField elements.');
      }
      
      // Verify minimal elements
      for (const item of parsed) {
        if (!item.key || !item.label) {
          throw new Error('Each field in the schema array must have at least "key" and "label" properties.');
        }
      }

      this.designerFields.set(parsed);
      this.selectedField.set(null);
      this.importSchemaPopupOpen.set(false);
      this.importSchemaText = '';
    } catch (err: any) {
      this.importError.set(err?.message || 'Invalid JSON syntax.');
    }
  }

  // Live preview actions
  onPreviewSubmit(data: Record<string, unknown>): void {
    this.previewSubmitData.set(data);
  }
}
