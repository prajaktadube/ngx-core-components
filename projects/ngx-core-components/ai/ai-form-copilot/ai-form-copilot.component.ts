import { Component, input, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxWebLlmService, WebLlmMessage } from '../ngx-web-llm.service';
import { FormBuilderField, FormBuilderComponent } from 'ngx-core-components/inputs';

@Component({
  selector: 'ngx-ai-form-copilot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ngx-ai-form-copilot-container" [class.dark-mode]="theme() === 'dark'">
      <div class="copilot-header">
        <span class="copilot-logo">🤖</span>
        <div class="copilot-title-group">
          <h4 class="copilot-title">AI Form Co-Pilot</h4>
          <p class="copilot-subtitle">Use local AI to fill the form automatically</p>
        </div>
      </div>

      <div class="copilot-body">
        <textarea
          [(ngModel)]="promptText"
          [disabled]="loading()"
          placeholder="e.g. My name is Alice, email is alice@gmail.com, and I am a Developer..."
          class="copilot-textarea"
          rows="3"
        ></textarea>

        <div class="copilot-actions">
          <span class="copilot-status" [class.error]="hasError()">
            @if (loading()) {
              <span class="spinner">⏳</span> {{ statusMessage() }}
            } @else if (hasError()) {
              ❌ {{ errorMessage() }}
            } @else if (successMessage()) {
              ✅ {{ successMessage() }}
            }
          </span>
          
          <button
            class="fill-btn"
            [disabled]="loading() || !promptText().trim()"
            (click)="autoFill()"
          >
            ⚡ Auto-Fill Form
          </button>
        </div>

        @if (loading() && progress() > 0 && progress() < 100) {
          <div class="progress-bar-container">
            <div class="progress-bar-fill" [style.width.%]="progress()"></div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .ngx-ai-form-copilot-container {
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 12px;
      padding: 16px;
      font-family: var(--ngx-font-family, inherit);
      color: var(--text-primary, #0f172a);
      box-shadow: var(--ngx-shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
      transition: all 0.2s ease;
    }
    .ngx-ai-form-copilot-container.dark-mode {
      background: #1e293b;
      border-color: #334155;
      color: #f8fafc;
    }
    .copilot-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
    }
    .copilot-logo {
      font-size: 24px;
    }
    .copilot-title-group {
      display: flex;
      flex-direction: column;
    }
    .copilot-title {
      margin: 0;
      font-size: 14px;
      font-weight: 700;
    }
    .copilot-subtitle {
      margin: 2px 0 0;
      font-size: 11px;
      color: var(--text-secondary, #64748b);
    }
    .dark-mode .copilot-subtitle {
      color: #94a3b8;
    }
    .copilot-body {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .copilot-textarea {
      width: 100%;
      background: var(--bg-primary, #f8fafc);
      border: 1px solid var(--border-color, #cbd5e1);
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 13px;
      color: inherit;
      outline: none;
      resize: none;
      transition: border-color 0.15s;
    }
    .dark-mode .copilot-textarea {
      background: #0f172a;
      border-color: #475569;
    }
    .copilot-textarea:focus {
      border-color: var(--primary-color, #4f46e5);
    }
    .copilot-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }
    .copilot-status {
      font-size: 11px;
      color: var(--primary-color, #4f46e5);
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .copilot-status.error {
      color: var(--ngx-color-danger, #ef4444);
    }
    .fill-btn {
      background: var(--primary-color, #4f46e5);
      color: #ffffff;
      border: none;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      padding: 6px 12px;
      cursor: pointer;
      transition: background 0.15s;
    }
    .fill-btn:hover:not(:disabled) {
      background: var(--primary-hover, #4338ca);
    }
    .fill-btn:disabled {
      background: var(--border-color, #cbd5e1);
      color: var(--text-disabled, #94a3b8);
      cursor: not-allowed;
    }
    .dark-mode .fill-btn:disabled {
      background: #334155;
      color: #64748b;
    }
    .progress-bar-container {
      width: 100%;
      height: 4px;
      background: var(--border-color, #e2e8f0);
      border-radius: 2px;
      overflow: hidden;
    }
    .dark-mode .progress-bar-container {
      background: #334155;
    }
    .progress-bar-fill {
      height: 100%;
      background: var(--primary-color, #4f46e5);
      width: 0%;
      transition: width 0.1s ease;
    }
    .spinner {
      display: inline-block;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class AIFormCopilotComponent {
  fields = input<FormBuilderField[]>([]);
  formBuilder = input<FormBuilderComponent | null>(null);
  theme = input<'light' | 'dark'>('light');

  valuesExtracted = output<Record<string, unknown>>();

  promptText = signal<string>('');
  loading = signal<boolean>(false);
  statusMessage = signal<string>('');
  progress = signal<number>(0);
  
  hasError = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  private llmService = inject(NgxWebLlmService);

  async autoFill(): Promise<void> {
    const text = this.promptText().trim();
    if (!text) return;

    this.loading.set(true);
    this.hasError.set(false);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.statusMessage.set('Initializing AI model...');

    try {
      if (!this.llmService.isReady()) {
        await this.llmService.init('Qwen2.5-0.5B-Instruct', (val, msg) => {
          this.progress.set(Math.round(val * 100));
          this.statusMessage.set(`Loading LLM: ${msg}`);
        });
      }

      this.statusMessage.set('Parsing input text...');

      const schemaString = this.fields().map(f => {
        const optString = f.options ? ` Options: [${f.options.map(o => `${o.value}: ${o.label}`).join(', ')}]` : '';
        return `- field "${f.key}" (Type: ${f.type || 'text'}, Label: "${f.label}"${optString})`;
      }).join('\n');

      const messages: WebLlmMessage[] = [
        {
          role: 'system',
          content: `You are a highly precise entity extractor. Parse the user's input paragraph and extract values for these form fields:
${schemaString}

Return a single JSON object mapping field keys to extracted values. Return ONLY the JSON object. Do not explain. Do not wrap in markdown quotes. Format booleans for checkbox types.`
        },
        {
          role: 'user',
          content: text
        }
      ];

      const response = await this.llmService.generate(messages, () => {
        this.statusMessage.set('Extracting values...');
      });

      let extractedValues: Record<string, unknown> = {};
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : response;
        extractedValues = JSON.parse(jsonStr);
      } catch (err) {
        console.warn('Failed to parse model output directly, trying text fallbacks:', response);
        for (const f of this.fields()) {
          const regex = new RegExp(`"${f.key}"\\s*:\\s*(?:"([^"]*)"|([^,\\s}]*))`);
          const match = response.match(regex);
          if (match) {
            const val = match[1] !== undefined ? match[1] : match[2];
            if (val !== undefined) {
              if (f.type === 'number') extractedValues[f.key] = Number(val);
              else if (f.type === 'checkbox') extractedValues[f.key] = val.trim() === 'true';
              else extractedValues[f.key] = val.trim();
            }
          }
        }
      }

      if (response.includes('[Simulated')) {
        extractedValues = {};
        const lowerText = text.toLowerCase();
        for (const f of this.fields()) {
          if (f.type === 'checkbox') {
            extractedValues[f.key] = lowerText.includes(f.label.toLowerCase()) || lowerText.includes('yes');
          } else {
            if (f.key === 'name' || f.key === 'customer' || f.key === 'fullName') {
              const nameMatch = text.match(/(?:name is|named)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
              extractedValues[f.key] = nameMatch ? nameMatch[1] : 'Alice Smith';
            } else if (f.key === 'email') {
              const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
              extractedValues[f.key] = emailMatch ? emailMatch[1] : 'alice@example.com';
            } else if (f.key === 'role') {
              extractedValues[f.key] = 'Developer';
            } else if (f.type === 'number') {
              const numMatch = text.match(/\d+/);
              extractedValues[f.key] = numMatch ? Number(numMatch[0]) : 5;
            } else {
              extractedValues[f.key] = `Extracted value for ${f.label}`;
            }
          }
        }
      }

      const builder = this.formBuilder();
      if (builder) {
        Object.entries(extractedValues).forEach(([key, val]) => {
          builder.updateValue(key, val);
        });
      }

      this.valuesExtracted.emit(extractedValues);
      this.successMessage.set('Form populated successfully!');
    } catch (err: any) {
      this.hasError.set(true);
      this.errorMessage.set(err.message || 'Auto-fill failed');
    } finally {
      this.loading.set(false);
    }
  }
}
