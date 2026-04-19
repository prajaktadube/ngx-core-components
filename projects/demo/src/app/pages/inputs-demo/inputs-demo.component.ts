import { Component, signal, computed } from '@angular/core';
import {
  TextBoxComponent, DropdownComponent, DatePickerComponent, MultiSelectComponent,
  CheckboxComponent, RadioGroupComponent, AutocompleteComponent,
  DropdownOption, RadioOption
} from 'ngx-core-components';

interface ApiRow { name: string; type: string; default: string; description: string; }

@Component({
  selector: 'app-inputs-demo',
  standalone: true,
  imports: [
    TextBoxComponent, DropdownComponent, DatePickerComponent, MultiSelectComponent,
    CheckboxComponent, RadioGroupComponent, AutocompleteComponent,
  ],
  template: `
    <div class="demo-page">

      <!-- Page Header -->
      <div class="page-header">
        <div class="page-header-text">
          <h1>Input Components</h1>
          <p>Form input components that follow unidirectional data flow — they emit events, the parent owns state.
             No FormsModule required. All fully styled with CSS custom properties.</p>
        </div>
        <div class="header-badges">
          <span class="badge badge-green">Standalone</span>
          <span class="badge badge-blue">Signal-based</span>
          <span class="badge badge-purple">No FormsModule</span>
        </div>
      </div>

      <!-- TAB NAV -->
      <div class="tab-nav">
        @for (tab of tabs; track tab) {
          <button class="tab-btn" [class.active]="activeTab() === tab" (click)="activeTab.set(tab)">{{ tab }}</button>
        }
      </div>

      <!-- ===== TEXTBOX ===== -->
      @if (activeTab() === 'TextBox') {
        <div class="tab-content">
          <div class="section-label">Live Demo</div>
          <div class="demo-cards-grid">
            <div class="demo-card">
              <div class="demo-card-title">Default States</div>
              <div class="input-stack">
                <ngx-textbox [value]="textValue()" label="Full Name" placeholder="Enter your name"
                  hint="Your full legal name" (valueChange)="textValue.set($event)" />
                <ngx-textbox [value]="emailValue()" label="Email" type="email"
                  placeholder="user@example.com" [error]="emailError()"
                  (valueChange)="onEmailChange($event)" />
                <ngx-textbox value="John Smith" label="Read Only" [readonly]="true" />
                <ngx-textbox value="" label="Disabled" [disabled]="true" placeholder="Cannot type here" />
              </div>
              <div class="value-display">text: "{{ textValue() }}" · email: "{{ emailValue() }}"</div>
            </div>
            <div class="demo-card">
              <div class="demo-card-title">Input Types</div>
              <div class="input-stack">
                <ngx-textbox value="" label="Password" type="password" placeholder="Enter password" />
                <ngx-textbox value="" label="Number" type="number" placeholder="0" />
                <ngx-textbox value="" label="Tel" type="tel" placeholder="+1 (555) 000-0000" />
                <ngx-textbox value="" label="URL" type="url" placeholder="https://example.com" />
              </div>
            </div>
          </div>

          <div class="section-label">How to Use</div>
          <pre class="code-block">{{ textboxCode }}</pre>

          <div class="section-label">API Reference</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input / Output</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of textboxApi; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>

          <div class="section-label">CSS Custom Properties</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Variable</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of inputCssVars; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- ===== DROPDOWN ===== -->
      @if (activeTab() === 'Dropdown') {
        <div class="tab-content">
          <div class="section-label">Live Demo</div>
          <div class="demo-cards-grid">
            <div class="demo-card">
              <div class="demo-card-title">Standard Dropdown</div>
              <div class="input-stack">
                <ngx-dropdown [options]="countries" [value]="selectedCountry()" label="Country"
                  placeholder="Select a country..." (valueChange)="selectedCountry.set($event)" />
                <ngx-dropdown [options]="countries" [value]="filteredCountry()" label="Filterable"
                  placeholder="Search and select..." [filterable]="true"
                  (valueChange)="filteredCountry.set($event)" />
                <ngx-dropdown [options]="countries" value="us" label="Disabled" [disabled]="true" />
              </div>
              <div class="value-display">Selected: "{{ selectedLabel() }}"</div>
            </div>
          </div>

          <div class="section-label">How to Use</div>
          <pre class="code-block">{{ dropdownCode }}</pre>

          <div class="section-label">API Reference</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input / Output</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of dropdownApi; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- ===== DATE PICKER ===== -->
      @if (activeTab() === 'DatePicker') {
        <div class="tab-content">
          <div class="section-label">Live Demo</div>
          <div class="demo-cards-grid">
            <div class="demo-card">
              <div class="demo-card-title">Date Selection</div>
              <div class="input-stack">
                <ngx-date-picker [value]="selectedDate()" label="Event Date"
                  placeholder="Pick a date..." (valueChange)="selectedDate.set($event)" />
                <ngx-date-picker [value]="null" label="Disabled DatePicker" [disabled]="true" placeholder="Cannot open" />
              </div>
              <div class="value-display">Selected: "{{ selectedDate() ? formatDate(selectedDate()!) : 'none' }}"</div>
            </div>
          </div>

          <div class="section-label">How to Use</div>
          <pre class="code-block">{{ datePickerCode }}</pre>

          <div class="section-label">API Reference</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input / Output</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of datePickerApi; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- ===== MULTISELECT ===== -->
      @if (activeTab() === 'MultiSelect') {
        <div class="tab-content">
          <div class="section-label">Live Demo</div>
          <div class="demo-cards-grid">
            <div class="demo-card">
              <div class="demo-card-title">Multi-item Selection</div>
              <div class="input-stack">
                <ngx-multi-select [options]="skills" [values]="selectedSkills()" label="Skills"
                  placeholder="Select skills..." (valuesChange)="selectedSkills.set($event)" />
                <ngx-multi-select [options]="skills" [values]="filteredSkills()" label="Filterable + Max 3 Tags"
                  placeholder="Search skills..." [filterable]="true" [maxTags]="3"
                  (valuesChange)="filteredSkills.set($event)" />
              </div>
              <div class="value-display">Selected: {{ selectedSkills().length }} item(s) — {{ selectedSkillLabels() }}</div>
            </div>
          </div>

          <div class="section-label">How to Use</div>
          <pre class="code-block">{{ multiSelectCode }}</pre>

          <div class="section-label">API Reference</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input / Output</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of multiSelectApi; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- ===== CHECKBOX ===== -->
      @if (activeTab() === 'Checkbox') {
        <div class="tab-content">
          <div class="section-label">Live Demo</div>
          <div class="demo-cards-grid">
            <div class="demo-card">
              <div class="demo-card-title">Basic Checkboxes</div>
              <div class="input-stack">
                <ngx-checkbox label="Accept terms and conditions" [checked]="termsChecked()" (checkedChange)="termsChecked.set($event)" />
                <ngx-checkbox label="Subscribe to newsletter" [checked]="newsletterChecked()" (checkedChange)="newsletterChecked.set($event)" />
                <ngx-checkbox label="Disabled (checked)" [checked]="true" [disabled]="true" />
                <ngx-checkbox label="Disabled (unchecked)" [checked]="false" [disabled]="true" />
              </div>
              <div class="value-display">Terms: {{ termsChecked() }} · Newsletter: {{ newsletterChecked() }}</div>
            </div>
          </div>

          <div class="section-label">How to Use</div>
          <pre class="code-block">{{ checkboxCode }}</pre>
        </div>
      }

      <!-- ===== RADIO ===== -->
      @if (activeTab() === 'Radio') {
        <div class="tab-content">
          <div class="section-label">Live Demo</div>
          <div class="demo-cards-grid">
            <div class="demo-card">
              <div class="demo-card-title">Plan Selection</div>
              <ngx-radio-group label="Choose your plan" [options]="planOptions" [value]="selectedPlan()"
                (valueChange)="selectedPlan.set($any($event))" />
              <div class="value-display">Selected: {{ selectedPlan() }}</div>
            </div>
            <div class="demo-card">
              <div class="demo-card-title">Inline Layout</div>
              <ngx-radio-group label="Priority" [options]="priorityOptions" [value]="selectedPriority()"
                [inline]="true" (valueChange)="selectedPriority.set($any($event))" />
              <div class="value-display">Priority: {{ selectedPriority() }}</div>
            </div>
          </div>

          <div class="section-label">How to Use</div>
          <pre class="code-block">{{ radioCode }}</pre>
        </div>
      }

      <!-- ===== AUTOCOMPLETE ===== -->
      @if (activeTab() === 'Autocomplete') {
        <div class="tab-content">
          <div class="section-label">Live Demo</div>
          <div class="demo-cards-grid">
            <div class="demo-card">
              <div class="demo-card-title">Framework Search</div>
              <ngx-autocomplete
                label="Framework"
                placeholder="Type to search..."
                [options]="frameworkOptions"
                (valueChange)="selectedFramework.set($any($event))" />
              <div class="value-display">Selected: {{ selectedFramework() }}</div>
            </div>
            <div class="demo-card">
              <div class="demo-card-title">Min-length = 2</div>
              <ngx-autocomplete
                label="Country"
                placeholder="Type 2+ characters..."
                [options]="countryOptions"
                [minLength]="2"
                (valueChange)="selectedAcCountry.set($any($event))" />
              <div class="value-display">Selected: {{ selectedAcCountry() }}</div>
            </div>
          </div>

          <div class="section-label">How to Use</div>
          <pre class="code-block">{{ autocompleteCode }}</pre>
        </div>
      }

    </div>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; height: 100%; overflow-y: auto; }
    .demo-page { padding: 24px 28px; max-width: 1100px; display: flex; flex-direction: column; gap: 20px; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding-bottom: 16px; border-bottom: 1px solid #e9ecef; }
    .page-header-text h1 { margin: 0 0 6px; font-size: 24px; font-weight: 800; color: #1a1a2e; }
    .page-header-text p { margin: 0; font-size: 13px; color: #6c757d; line-height: 1.6; max-width: 600px; }
    .header-badges { display: flex; gap: 8px; flex-shrink: 0; }
    .badge { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 12px; }
    .badge-green { background: #dcfce7; color: #166534; }
    .badge-blue { background: #e8f0fe; color: #1a73e8; }
    .badge-purple { background: #f3e8ff; color: #7c3aed; }
    .tab-nav { display: flex; gap: 2px; border-bottom: 2px solid #e9ecef; }
    .tab-btn { padding: 8px 18px; background: none; border: none; font-size: 13px; font-weight: 500; color: #6c757d; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; font-family: inherit; transition: all 0.12s; }
    .tab-btn:hover { color: #1a1a2e; }
    .tab-btn.active { color: #1a73e8; border-bottom-color: #1a73e8; font-weight: 600; }
    .tab-content { display: flex; flex-direction: column; gap: 16px; }
    .section-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #adb5bd; border-bottom: 1px solid #f1f3f5; padding-bottom: 6px; }
    .demo-cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }
    .demo-card { background: #fff; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; }
    .demo-card-title { font-size: 12px; font-weight: 600; color: #6c757d; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 14px; }
    .input-stack { display: flex; flex-direction: column; gap: 12px; }
    .value-display { margin-top: 14px; padding: 8px 12px; background: #f8f9fa; border-radius: 4px; font-size: 12px; font-family: monospace; color: #495057; }
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
  `]
})
export class InputsDemoComponent {
  activeTab = signal('TextBox');
  tabs = ['TextBox', 'Dropdown', 'DatePicker', 'MultiSelect', 'Checkbox', 'Radio', 'Autocomplete'];

  textValue = signal('');
  emailValue = signal('');
  emailError = signal('');
  selectedCountry = signal<unknown>(null);
  filteredCountry = signal<unknown>(null);
  selectedDate = signal<Date | null>(null);
  selectedSkills = signal<unknown[]>([]);
  filteredSkills = signal<unknown[]>([]);

  // Checkbox state
  termsChecked = signal(false);
  newsletterChecked = signal(true);

  // Radio state
  selectedPlan = signal<string | number>('pro');
  selectedPriority = signal<string | number>('medium');

  // Autocomplete state
  selectedFramework = signal('');
  selectedAcCountry = signal('');

  countries: DropdownOption[] = [
    { label: 'United States', value: 'us' },
    { label: 'United Kingdom', value: 'uk' },
    { label: 'Germany', value: 'de' },
    { label: 'France', value: 'fr' },
    { label: 'Japan', value: 'jp' },
    { label: 'Australia', value: 'au' },
    { label: 'Canada', value: 'ca' },
    { label: 'India', value: 'in' },
  ];

  skills: DropdownOption[] = [
    { label: 'Angular', value: 'angular' },
    { label: 'React', value: 'react' },
    { label: 'Vue.js', value: 'vue' },
    { label: 'TypeScript', value: 'ts' },
    { label: 'Node.js', value: 'node' },
    { label: 'Python', value: 'python' },
    { label: 'Docker', value: 'docker' },
    { label: 'Kubernetes', value: 'k8s' },
  ];

  planOptions: RadioOption[] = [
    { label: 'Free — 5 projects', value: 'free' },
    { label: 'Pro — Unlimited projects', value: 'pro' },
    { label: 'Enterprise — SSO + priority support', value: 'enterprise' },
  ];

  priorityOptions: RadioOption[] = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
    { label: 'Critical', value: 'critical' },
  ];

  frameworkOptions: DropdownOption[] = [
    { label: 'Angular', value: 'angular' },
    { label: 'React', value: 'react' },
    { label: 'Vue.js', value: 'vue' },
    { label: 'Svelte', value: 'svelte' },
    { label: 'SolidJS', value: 'solidjs' },
    { label: 'Next.js', value: 'nextjs' },
    { label: 'Nuxt', value: 'nuxt' },
    { label: 'Remix', value: 'remix' },
    { label: 'Astro', value: 'astro' },
  ];

  countryOptions: DropdownOption[] = [
    'Afghanistan', 'Albania', 'Algeria', 'Australia', 'Austria', 'Belgium', 'Brazil',
    'Canada', 'Chile', 'China', 'Colombia', 'Croatia', 'Czech Republic', 'Denmark',
    'Egypt', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'India', 'Indonesia',
    'Iran', 'Ireland', 'Israel', 'Italy', 'Japan', 'Kenya', 'Mexico', 'Netherlands',
    'New Zealand', 'Nigeria', 'Norway', 'Pakistan', 'Philippines', 'Poland', 'Portugal',
    'Romania', 'Russia', 'Saudi Arabia', 'South Africa', 'South Korea', 'Spain', 'Sweden',
    'Switzerland', 'Thailand', 'Turkey', 'Ukraine', 'United Kingdom', 'United States',
  ].map(c => ({ label: c, value: c.toLowerCase().replace(/ /g, '-') }));

  selectedLabel(): string {
    return this.countries.find(c => c.value === this.selectedCountry())?.label ?? 'none';
  }

  selectedSkillLabels(): string {
    const vals = this.selectedSkills() as string[];
    return vals.map(v => this.skills.find(s => s.value === v)?.label ?? v).join(', ') || 'none';
  }

  onEmailChange(val: string): void {
    this.emailValue.set(val);
    this.emailError.set(val && !val.includes('@') ? 'Please enter a valid email address' : '');
  }

  formatDate(d: Date): string {
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  // ===== CODE SNIPPETS =====
  textboxCode = `import { TextBoxComponent } from 'ngx-core-components';

@Component({
  imports: [TextBoxComponent],
  template: \`
    <ngx-textbox
      [value]="name()"
      label="Full Name"
      placeholder="Enter your name"
      hint="Your full legal name"
      [error]="nameError()"
      (valueChange)="name.set($event)"
      (blur)="onBlur()"
    />

    <!-- Read-only -->
    <ngx-textbox value="Jane Smith" label="Author" [readonly]="true" />

    <!-- Disabled -->
    <ngx-textbox value="" label="Inactive" [disabled]="true" />

    <!-- Password -->
    <ngx-textbox [value]="pwd()" label="Password" type="password"
      (valueChange)="pwd.set($event)" />
  \`
})
export class MyComponent {
  name = signal('');
  nameError = signal('');
  pwd = signal('');

  onBlur(): void {
    this.nameError.set(this.name().length < 2 ? 'Name is too short' : '');
  }
}`;

  dropdownCode = `import { DropdownComponent, DropdownOption } from 'ngx-core-components';

@Component({
  imports: [DropdownComponent],
  template: \`
    <!-- Basic dropdown -->
    <ngx-dropdown
      [options]="options"
      [value]="selected()"
      label="Country"
      placeholder="Select a country..."
      (valueChange)="selected.set($event)"
    />

    <!-- Filterable dropdown (type to search) -->
    <ngx-dropdown
      [options]="options"
      [value]="selected2()"
      label="Filterable"
      [filterable]="true"
      placeholder="Search..."
      (valueChange)="selected2.set($event)"
    />
  \`
})
export class MyComponent {
  selected = signal<unknown>(null);
  selected2 = signal<unknown>(null);

  options: DropdownOption[] = [
    { label: 'United States', value: 'us' },
    { label: 'Germany', value: 'de' },
    { label: 'Japan', value: 'jp' },
  ];
}`;

  datePickerCode = `import { DatePickerComponent } from 'ngx-core-components';

@Component({
  imports: [DatePickerComponent],
  template: \`
    <ngx-date-picker
      [value]="date()"
      label="Start Date"
      placeholder="Pick a date..."
      format="MM/DD/YYYY"
      [min]="minDate"
      [max]="maxDate"
      (valueChange)="date.set($event)"
    />

    <p>Selected: {{ date() | date:'longDate' }}</p>
  \`
})
export class MyComponent {
  date = signal<Date | null>(null);
  minDate = new Date(2024, 0, 1);
  maxDate = new Date(2026, 11, 31);
}`;

  multiSelectCode = `import { MultiSelectComponent, DropdownOption } from 'ngx-core-components';

@Component({
  imports: [MultiSelectComponent],
  template: \`
    <!-- Basic multi-select -->
    <ngx-multi-select
      [options]="options"
      [values]="selected()"
      label="Skills"
      placeholder="Select skills..."
      (valuesChange)="selected.set($event)"
    />

    <!-- Filterable with max tags shown -->
    <ngx-multi-select
      [options]="options"
      [values]="selected2()"
      label="Technologies"
      [filterable]="true"
      [maxTags]="3"
      placeholder="Search..."
      (valuesChange)="selected2.set($event)"
    />
  \`
})
export class MyComponent {
  selected = signal<unknown[]>([]);
  selected2 = signal<unknown[]>([]);

  options: DropdownOption[] = [
    { label: 'Angular', value: 'angular' },
    { label: 'React', value: 'react' },
    { label: 'TypeScript', value: 'ts' },
  ];
}`;

  // ===== API TABLES =====
  textboxApi: ApiRow[] = [
    { name: 'value', type: 'string', default: "''", description: 'Current text value.' },
    { name: 'label', type: 'string', default: "''", description: 'Label text shown above the input.' },
    { name: 'placeholder', type: 'string', default: "''", description: 'Placeholder shown when the input is empty.' },
    { name: 'type', type: 'string', default: "'text'", description: 'HTML input type: text, email, password, number, tel, url.' },
    { name: 'hint', type: 'string', default: "''", description: 'Helper text shown below the input.' },
    { name: 'error', type: 'string', default: "''", description: 'Error message. When non-empty, the input renders in error state.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the input entirely.' },
    { name: 'readonly', type: 'boolean', default: 'false', description: 'Makes the input read-only (focusable but not editable).' },
    { name: '(valueChange)', type: 'string', default: '—', description: 'Emitted on every keystroke with the current string value.' },
    { name: '(focus)', type: 'void', default: '—', description: 'Emitted when the input receives focus.' },
    { name: '(blur)', type: 'void', default: '—', description: 'Emitted when the input loses focus.' },
  ];

  dropdownApi: ApiRow[] = [
    { name: 'options', type: 'DropdownOption[]', default: '[]', description: 'Array of { label, value } options.' },
    { name: 'value', type: 'unknown', default: 'null', description: 'The currently selected value (matches an option.value).' },
    { name: 'label', type: 'string', default: "''", description: 'Label text shown above the dropdown.' },
    { name: 'placeholder', type: 'string', default: "'Select...'", description: 'Placeholder text shown when nothing is selected.' },
    { name: 'filterable', type: 'boolean', default: 'false', description: 'Add a search input to filter options by label.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Prevents opening the dropdown.' },
    { name: '(valueChange)', type: 'unknown', default: '—', description: 'Emitted when the user selects an option. Value is option.value.' },
  ];

  datePickerApi: ApiRow[] = [
    { name: 'value', type: 'Date | null', default: 'null', description: 'The currently selected date.' },
    { name: 'label', type: 'string', default: "''", description: 'Label text above the input.' },
    { name: 'placeholder', type: 'string', default: "'Select date'", description: 'Placeholder text.' },
    { name: 'format', type: 'string', default: "'MM/DD/YYYY'", description: 'Display format for the date string.' },
    { name: 'min', type: 'Date | null', default: 'null', description: 'Minimum selectable date. Dates before this are disabled in the calendar.' },
    { name: 'max', type: 'Date | null', default: 'null', description: 'Maximum selectable date.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the picker.' },
    { name: '(valueChange)', type: 'Date | null', default: '—', description: 'Emitted when a date is selected or the input is cleared.' },
  ];

  multiSelectApi: ApiRow[] = [
    { name: 'options', type: 'DropdownOption[]', default: '[]', description: 'Array of { label, value } selectable options.' },
    { name: 'values', type: 'unknown[]', default: '[]', description: 'Array of currently selected values.' },
    { name: 'label', type: 'string', default: "''", description: 'Label text above the input.' },
    { name: 'placeholder', type: 'string', default: "'Select...'", description: 'Placeholder when nothing is selected.' },
    { name: 'filterable', type: 'boolean', default: 'false', description: 'Adds a search field to filter the dropdown list.' },
    { name: 'maxTags', type: 'number', default: 'Infinity', description: 'Maximum number of tag chips shown. Excess is shown as "+N more".' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the component.' },
    { name: '(valuesChange)', type: 'unknown[]', default: '—', description: 'Emitted when the selection changes. Contains full array of selected values.' },
  ];

  checkboxCode = `import { CheckboxComponent } from 'ngx-core-components';

@Component({
  imports: [CheckboxComponent],
  template: \`
    <ngx-checkbox label="Accept terms" [checked]="checked()"
      (checkedChange)="checked.set($event)" />
  \`
})
export class MyComponent {
  checked = signal(false);
}`;

  radioCode = `import { RadioGroupComponent, RadioOption } from 'ngx-core-components';

@Component({
  imports: [RadioGroupComponent],
  template: \`
    <ngx-radio-group label="Plan" [options]="plans"
      [value]="plan()" (valueChange)="plan.set($event)" />
  \`
})
export class MyComponent {
  plan = signal('pro');
  plans: RadioOption[] = [
    { label: 'Free', value: 'free' },
    { label: 'Pro', value: 'pro' },
    { label: 'Enterprise', value: 'enterprise' },
  ];
}`;

  autocompleteCode = `import { AutocompleteComponent } from 'ngx-core-components';

@Component({
  imports: [AutocompleteComponent],
  template: \`
    <ngx-autocomplete label="Framework" [options]="frameworks"
      [value]="selected()" (valueChange)="selected.set($event)" />
  \`
})
export class MyComponent {
  selected = signal('');
  frameworks = ['Angular', 'React', 'Vue.js', 'Svelte'];
}`;

  inputCssVars: { name: string; default: string; description: string }[] = [
    { name: '--ngx-input-border', default: '#ced4da', description: 'Default border color.' },
    { name: '--ngx-input-focus', default: '#1a73e8', description: 'Border and ring color when focused.' },
    { name: '--ngx-input-error', default: '#e74c3c', description: 'Border and text color in error state.' },
    { name: '--ngx-input-bg', default: '#ffffff', description: 'Input background color.' },
    { name: '--ngx-input-disabled-bg', default: '#f8f9fa', description: 'Background when disabled.' },
    { name: '--ngx-input-label', default: '#495057', description: 'Label text color.' },
    { name: '--ngx-input-hint', default: '#6c757d', description: 'Hint and placeholder text color.' },
  ];
}
