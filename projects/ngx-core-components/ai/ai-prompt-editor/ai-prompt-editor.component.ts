import { Component, input, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'ngx-ai-prompt-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="prompt-studio-wrapper">
      <div class="prompt-studio-grid">
        
        <!-- Left Panel: Prompt Configuration -->
        <div class="studio-config-card">
          <div class="card-header">
            <div class="header-top-row">
              <div>
                <h3>Prompt Engineering Studio</h3>
                <p>Design instructions, parse template variables, and estimate token costs.</p>
              </div>
              <div class="model-select-wrap">
                <label class="model-label">Model Engine</label>
                <select 
                  class="studio-select" 
                  [ngModel]="selectedModel()" 
                  (ngModelChange)="selectedModel.set($event)"
                >
                  <option value="gpt-4o">GPT-4o ($0.0025/1k)</option>
                  <option value="gpt-4o-mini">GPT-4o-mini ($0.00015/1k)</option>
                  <option value="claude-3-5-sonnet">Claude 3.5 Sonnet ($0.003/1k)</option>
                  <option value="gemini-1-5-pro">Gemini 1.5 Pro ($0.00125/1k)</option>
                </select>
              </div>
            </div>

            <!-- Token & Cost Metrics Banner -->
            <div class="metrics-banner">
              <div class="metric-card">
                <span class="metric-val">{{ systemTokens() }}</span>
                <span class="metric-lbl">System Tokens</span>
              </div>
              <div class="metric-card">
                <span class="metric-val">{{ compiledTokens() }}</span>
                <span class="metric-lbl">Prompt Tokens</span>
              </div>
              <div class="metric-card highlight">
                <span class="metric-val">{{ totalPromptTokens() }}</span>
                <span class="metric-lbl">Total Tokens</span>
              </div>
              <div class="metric-card cost">
                <span class="metric-val">{{ estimatedCost() }}</span>
                <span class="metric-lbl">Est. Cost / Run</span>
              </div>
            </div>
          </div>

          <div class="config-body">
            <!-- System Instructions -->
            <div class="form-group">
              <label class="group-label">System Instructions</label>
              <textarea
                class="studio-textarea"
                rows="3"
                [ngModel]="systemPrompt"
                (ngModelChange)="onSystemPromptChange($event)"
                placeholder="You are a helpful and precise assistant..."
              ></textarea>
            </div>

            <!-- Prompt Template -->
            <div class="form-group">
              <div class="label-with-tools">
                <label class="group-label">Prompt Template</label>
                <button type="button" class="add-var-btn" (click)="addNewVariable()">+ Add {{ '{' }}{{ '{' }}var{{ '}' }}{{ '}' }}</button>
              </div>
              <div class="help-text">Use double braces <code>{{ '{' }}{{ '{' }}variable{{ '}' }}{{ '}' }}</code> to define dynamic parameters.</div>
              <textarea
                class="studio-textarea template-textarea"
                rows="6"
                [ngModel]="templateText()"
                (ngModelChange)="onTemplateChange($event)"
                placeholder="Write your template here..."
              ></textarea>
            </div>

            <!-- Parameters Grid -->
            <div class="parameters-grid">
              <div class="form-group">
                <label class="group-label">Temperature: {{ temperature() }}</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  [ngModel]="temperature()"
                  (input)="onTempChange($event)"
                  class="studio-slider"
                />
              </div>

              <div class="form-group">
                <label class="group-label">Max Output Tokens</label>
                <input
                  type="number"
                  [(ngModel)]="maxTokens"
                  class="studio-input"
                  min="1"
                  max="4096"
                />
              </div>
            </div>

            <!-- Dynamic Variables -->
            @if (parsedVariables().length > 0) {
              <div class="form-group variables-section">
                <label class="group-label">Parsed Template Variables</label>
                <div class="variables-grid">
                  @for (v of parsedVariables(); track v) {
                    <div class="var-row">
                      <span class="var-name">{{ v }}</span>
                      <input
                        type="text"
                        [value]="getVarValue(v)"
                        (input)="setVarValue(v, $event)"
                        class="studio-input var-input"
                        [placeholder]="'Value for ' + v"
                      />
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Right Panel: Live Compiler & Simulator -->
        <div class="studio-output-card">
          <div class="card-header">
            <h3>Live Preview &amp; Test</h3>
            <p>Inspect compiled prompt outputs and trigger mock run generations.</p>
          </div>

          <div class="output-body">
            <!-- Compiled Output Box -->
            <div class="preview-group">
              <label class="group-label">Compiled Prompt Preview</label>
              <div class="prompt-preview-box">
                @if (compiledPrompt()) {
                  <p class="compiled-text">{{ compiledPrompt() }}</p>
                } @else {
                  <span class="empty-text">Write a template to preview compiled text...</span>
                }
              </div>
            </div>

            <!-- Run Control -->
            <div class="run-control-row">
              <button
                class="run-btn"
                [disabled]="isRunning()"
                (click)="triggerRun()"
              >
                {{ isRunning() ? 'Generating Response...' : '⚡ Run Simulation' }}
              </button>
            </div>

            <!-- Simulated Output Response -->
            <div class="preview-group flex-fill">
              <label class="group-label">Simulated AI Response</label>
              <div class="simulation-response-box" [class.loading]="isRunning()">
                @if (isRunning()) {
                  <div class="pulse-loader">
                    <span></span><span></span><span></span>
                  </div>
                } @else if (simulatedResponse()) {
                  <div class="response-text">{{ simulatedResponse() }}</div>
                } @else {
                  <span class="empty-text">Click Run Simulation to generate a mock response.</span>
                }
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .prompt-studio-wrapper {
      width: 100%;
      height: 100%;
      padding: 4px;
      font-family: inherit;
    }

    .prompt-studio-grid {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 24px;
      align-items: stretch;
    }
    @media (max-width: 960px) {
      .prompt-studio-grid {
        grid-template-columns: 1fr;
      }
    }

    /* Cards layouts */
    .studio-config-card, .studio-output-card {
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 12px;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .card-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-color, #e2e8f0);
    }
    .header-top-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      flex-wrap: wrap;
    }
    .card-header h3 {
      margin: 0 0 4px;
      font-size: 16px;
      font-weight: 800;
      color: var(--text-primary, #0f172a);
    }
    .card-header p {
      margin: 0;
      font-size: 12px;
      color: var(--text-secondary, #64748b);
    }

    .model-select-wrap {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .model-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
    }
    .studio-select {
      background: var(--bg-primary, #f8fafc);
      color: var(--text-primary, #0f172a);
      border: 1px solid var(--border-color, #cbd5e1);
      border-radius: 6px;
      padding: 4px 8px;
      font-size: 12px;
      font-weight: 600;
      outline: none;
    }

    .metrics-banner {
      display: flex;
      gap: 12px;
      margin-top: 14px;
      flex-wrap: wrap;
    }
    .metric-card {
      flex: 1;
      min-width: 90px;
      background: var(--bg-primary, #f8fafc);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 8px;
      padding: 8px 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .metric-card.highlight {
      background: rgba(79, 70, 229, 0.08);
      border-color: rgba(79, 70, 229, 0.3);
    }
    .metric-card.cost {
      background: rgba(16, 185, 129, 0.08);
      border-color: rgba(16, 185, 129, 0.3);
    }
    .metric-val {
      font-size: 14px;
      font-weight: 800;
      color: var(--text-primary, #0f172a);
    }
    .metric-card.cost .metric-val {
      color: #059669;
    }
    .metric-card.highlight .metric-val {
      color: #4f46e5;
    }
    .metric-lbl {
      font-size: 10px;
      font-weight: 600;
      color: #64748b;
      margin-top: 2px;
    }

    .label-with-tools {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .add-var-btn {
      background: transparent;
      border: 1px solid #4f46e5;
      color: #4f46e5;
      border-radius: 4px;
      padding: 2px 8px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .add-var-btn:hover {
      background: #4f46e5;
      color: #ffffff;
    }

    .config-body, .output-body {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      flex: 1;
    }
    .flex-fill {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    /* Forms */
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .group-label {
      font-size: 11px;
      font-weight: 750;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-secondary, #64748b);
    }
    .help-text {
      font-size: 11px;
      color: var(--text-secondary, #64748b);
      margin-bottom: 2px;
    }
    .help-text code {
      background: var(--border-light, #f1f5f9);
      padding: 1px 4px;
      border-radius: 3px;
      font-family: monospace;
      font-weight: 700;
    }

    /* Input elements */
    .studio-textarea {
      width: 100%;
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 13px;
      outline: none;
      background: var(--bg-primary, #f8fafc);
      color: var(--text-primary, #0f172a);
      font-family: inherit;
      resize: vertical;
      transition: border-color 0.15s;
    }
    .template-textarea {
      font-family: 'Cascadia Code', Consolas, Monaco, monospace;
      font-size: 12px;
    }
    .studio-textarea:focus, .studio-input:focus {
      border-color: var(--primary-color, #4f46e5);
    }

    .studio-input {
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 13px;
      background: var(--bg-primary, #f8fafc);
      color: var(--text-primary, #0f172a);
      outline: none;
      transition: border-color 0.15s;
      font-family: inherit;
    }

    .parameters-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .studio-slider {
      width: 100%;
      cursor: pointer;
      accent-color: var(--primary-color, #4f46e5);
      margin-top: 6px;
    }

    /* Variables settings */
    .variables-section {
      border-top: 1px dashed var(--border-color, #e2e8f0);
      padding-top: 16px;
      margin-top: 8px;
    }
    .variables-grid {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 6px;
    }
    .var-row {
      display: grid;
      grid-template-columns: 100px 1fr;
      align-items: center;
      gap: 12px;
    }
    .var-name {
      font-family: monospace;
      font-size: 12px;
      font-weight: 700;
      color: var(--primary-color, #4f46e5);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .var-input {
      padding: 6px 12px;
    }

    /* Live Output Box styling */
    .preview-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .prompt-preview-box, .simulation-response-box {
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 8px;
      padding: 12px 14px;
      background: var(--bg-primary, #f8fafc);
      min-height: 80px;
      max-height: 180px;
      overflow-y: auto;
      font-size: 13px;
      line-height: 1.5;
    }
    .prompt-preview-box {
      font-family: monospace;
      font-size: 12px;
      color: var(--text-primary, #0f172a);
    }
    .simulation-response-box {
      flex: 1;
      display: flex;
      align-items: flex-start;
    }
    .simulation-response-box.loading {
      align-items: center;
      justify-content: center;
    }
    .empty-text {
      color: var(--text-secondary, #64748b);
      font-style: italic;
    }
    .compiled-text, .response-text {
      margin: 0;
      white-space: pre-wrap;
    }

    /* Buttons */
    .run-control-row {
      display: flex;
      justify-content: flex-end;
    }
    .run-btn {
      background: var(--primary-gradient, linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%));
      color: #ffffff;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
      transition: all 0.2s;
      font-family: inherit;
    }
    .run-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(79, 70, 229, 0.35);
    }
    .run-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Loader animations */
    .pulse-loader {
      display: flex;
      gap: 6px;
    }
    .pulse-loader span {
      width: 8px;
      height: 8px;
      background: var(--primary-color, #4f46e5);
      border-radius: 50%;
      animation: bounce 1.4s infinite ease-in-out both;
    }
    .pulse-loader span:nth-child(1) { animation-delay: -0.32s; }
    .pulse-loader span:nth-child(2) { animation-delay: -0.16s; }

    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1.0); }
    }
  `]
})
export class AIPromptEditorComponent {
  // Inputs Binds
  initialTemplate = input<string>('Write a greeting letter to {{user_name}} recommending dynamic integrations for {{product_name}}.');
  initialSystem = input<string>('You are an encouraging and helpful product specialist.');

  // Component Internal State Signals
  systemPromptSignal = signal('');
  get systemPrompt(): string {
    return this.systemPromptSignal();
  }
  set systemPrompt(val: string) {
    this.systemPromptSignal.set(val || '');
  }

  templateText = signal('');
  temperature = signal(0.7);
  maxTokens = 512;
  
  selectedModel = signal<'gpt-4o' | 'gpt-4o-mini' | 'claude-3-5-sonnet' | 'gemini-1-5-pro'>('gpt-4o');
  varValues = signal<Record<string, string>>({});
  isRunning = signal(false);
  simulatedResponse = signal('');

  readonly MODEL_RATES: Record<string, { name: string; ratePer1k: number }> = {
    'gpt-4o': { name: 'GPT-4o', ratePer1k: 0.0025 },
    'gpt-4o-mini': { name: 'GPT-4o-mini', ratePer1k: 0.00015 },
    'claude-3-5-sonnet': { name: 'Claude 3.5 Sonnet', ratePer1k: 0.003 },
    'gemini-1-5-pro': { name: 'Gemini 1.5 Pro', ratePer1k: 0.00125 },
  };

  // Real-time Token Count Calculations (~4 chars per token)
  systemTokens = computed(() => Math.ceil((this.systemPromptSignal() || '').length / 4));
  compiledTokens = computed(() => Math.ceil((this.compiledPrompt() || '').length / 4));
  totalPromptTokens = computed(() => this.systemTokens() + this.compiledTokens());

  // Real-time Cost Estimation ($ per request)
  estimatedCost = computed(() => {
    const rate = this.MODEL_RATES[this.selectedModel()]?.ratePer1k || 0.0025;
    const total = this.totalPromptTokens();
    const cost = (total / 1000) * rate;
    return cost < 0.00005 ? '< $0.0001' : `$${cost.toFixed(5)}`;
  });

  constructor() {
    // Populate defaults on initialize
    effect(() => {
      this.templateText.set(this.initialTemplate());
      this.systemPromptSignal.set(this.initialSystem());
    }, { allowSignalWrites: true });
  }

  onSystemPromptChange(text: string): void {
    this.systemPromptSignal.set(text || '');
  }

  // Parse variables from template string dynamically
  parsedVariables = computed(() => {
    const text = this.templateText();
    const matches = text.match(/\{\{([^}]+)\}\}/g) || [];
    // Deduplicate array values
    const unique = [...new Set(matches.map(m => m.replace(/[{}]/g, '').trim()))];
    return unique;
  });

  // Compiled dynamic prompt preview
  compiledPrompt = computed(() => {
    let t = this.templateText();
    const dict = this.varValues();
    
    this.parsedVariables().forEach(v => {
      const placeholder = `{{${v}}}`;
      const val = dict[v] || '';
      t = t.split(placeholder).join(val);
    });

    return t;
  });

  onTemplateChange(text: string): void {
    this.templateText.set(text);
  }

  onTempChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.temperature.set(Number(val));
  }

  getVarValue(vName: string): string {
    // Default initial values to make playground look populated
    const values = this.varValues();
    if (values[vName] !== undefined) return values[vName];
    
    // Set typical defaults
    if (vName === 'user_name') return 'John Doe';
    if (vName === 'product_name') return 'ngx-core-components';
    return '';
  }

  setVarValue(vName: string, event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.varValues.update(dict => ({ ...dict, [vName]: val }));
  }

  addNewVariable(): void {
    const varName = prompt('Enter new template variable name (e.g. user_role):');
    if (varName) {
      const clean = varName.trim().replace(/[^a-zA-Z0-9_]/g, '');
      if (clean) {
        this.templateText.update(t => t + (t.endsWith(' ') || t === '' ? '' : ' ') + `{{${clean}}}`);
      }
    }
  }

  triggerRun(): void {
    if (this.isRunning()) return;
    this.isRunning.set(true);
    this.simulatedResponse.set('');

    // Simulate Streaming response output
    setTimeout(() => {
      this.isRunning.set(false);
      const name = this.varValues()['user_name'] || 'John Doe';
      const prod = this.varValues()['product_name'] || 'ngx-core-components';
      
      this.simulatedResponse.set(
        `Dear ${name},\n\n` +
        `Thank you for exploring ${prod}! We are thrilled to assist you. ` +
        `Implementing our modular Angular components will instantly modernize your user interface and ensure 100% signal-driven reactive state transitions.\n\n` +
        `Best regards,\n` +
        `The Product Specialist Team`
      );
    }, 1800);
  }
}
