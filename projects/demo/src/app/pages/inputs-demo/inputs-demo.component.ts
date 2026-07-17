import { Component, signal, computed } from '@angular/core';
import {
  TextBoxComponent, DropdownComponent, DatePickerComponent, MultiSelectComponent,
  CheckboxComponent, RadioGroupComponent, AutocompleteComponent,
  DropdownOption, RadioOption
} from 'ngx-core-components';
import { SliderComponent, SwitchComponent, RatingComponent, NumericTextBoxComponent, TextareaComponent, ColorPickerComponent, TimePickerComponent, DateRangePickerComponent, FileUploadComponent, FormDesignerComponent } from 'ngx-core-components/inputs';
import { AIFormCopilotComponent } from 'ngx-core-components/ai';

interface ApiRow { name: string; type: string; default: string; description: string; }

@Component({
  selector: 'app-inputs-demo',
  standalone: true,
  imports: [
    TextBoxComponent, DropdownComponent, DatePickerComponent, MultiSelectComponent,
    CheckboxComponent, RadioGroupComponent, AutocompleteComponent,
      SliderComponent, SwitchComponent, RatingComponent, NumericTextBoxComponent,
      TextareaComponent, ColorPickerComponent, TimePickerComponent, DateRangePickerComponent,
      FileUploadComponent, FormDesignerComponent, AIFormCopilotComponent,
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

      <!-- COMPONENT SELECTOR GRID -->
      <div class="component-selector">
        <div class="selector-label">Select Input Component</div>
        <div class="selector-grid">
          @for (tab of tabs; track tab) {
            <button class="selector-btn" [class.active]="activeTab() === tab" (click)="activeTab.set(tab)">
              <span class="btn-label">{{ tab }}</span>
            </button>
          }
        </div>
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
                <ngx-textbox value="" label="Password with Toggle" type="password" placeholder="Enter password" [passwordToggle]="true" />
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
            <div class="demo-card">
              <div class="demo-card-title">Enterprise Validation States</div>
              <div class="input-stack">
                <ngx-checkbox label="Validated Checkbox" [checked]="true" status="success" hint="User has verified this option" />
                <ngx-checkbox label="Check this value again" [checked]="false" status="warning" hint="Requires secondary authorization" />
                <ngx-checkbox label="I confirm this action" [checked]="false" status="error" error="You must accept before continuing" />
              </div>
            </div>
          </div>

          <div class="section-label">How to Use</div>
          <pre class="code-block">{{ checkboxCode }}</pre>

          <div class="section-label">API Reference</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input / Output</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of checkboxApi; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>
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
            <div class="demo-card">
              <div class="demo-card-title">Enterprise Validation States</div>
              <div class="input-stack">
                <ngx-radio-group label="Server Tier" [options]="planOptions" value="pro" status="success" hint="Perfect choice for production workloads" />
                <ngx-radio-group label="Required Approval" [options]="priorityOptions" value="" status="error" error="Priority level must be selected" />
              </div>
            </div>
          </div>

          <div class="section-label">How to Use</div>
          <pre class="code-block">{{ radioCode }}</pre>

          <div class="section-label">API Reference</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input / Output</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of radioApi; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>
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

          <div class="section-label">API Reference</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input / Output</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of autocompleteApi; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- ===== SLIDER ===== -->
      @if (activeTab() === 'Slider') {
        <div class="tab-content">
          <div class="section-label">Live Demo</div>
          <div class="demo-cards-grid">
            <div class="demo-card">
              <div class="demo-card-title">Single Value Slider</div>
              <ngx-slider label="Volume" [min]="0" [max]="100" [step]="1" [showTicks]="true" (valueChange)="sliderValue.set($event)" />
              <div class="value-display">Volume: {{ sliderValue() }}</div>
            </div>
            <div class="demo-card">
              <div class="demo-card-title">Range Slider</div>
              <ngx-slider label="Price Range" [min]="0" [max]="1000" [step]="10" [range]="true" [showValue]="true" (rangeChange)="priceRange.set($event)" />
              <div class="value-display">Range: {{ priceRange()[0] }} - {{ priceRange()[1] }}</div>
            </div>
          </div>

          <div class="section-label">How to Use</div>
          <pre class="code-block">{{ sliderCode }}</pre>

          <div class="section-label">API Reference</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input / Output</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of sliderApi; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- ===== SWITCH ===== -->
      @if (activeTab() === 'Switch') {
        <div class="tab-content">
          <div class="section-label">Live Demo</div>
          <div class="demo-cards-grid">
            <div class="demo-card">
              <div class="demo-card-title">Switch Sizes</div>
              <div class="input-stack">
                <ngx-switch onLabel="Enabled" offLabel="Disabled" size="sm" (checkedChange)="switchSmall.set($event)" />
                <ngx-switch onLabel="On" offLabel="Off" size="md" (checkedChange)="switchMedium.set($event)" />
                <ngx-switch onLabel="Active" offLabel="Inactive" size="lg" (checkedChange)="switchLarge.set($event)" />
              </div>
              <div class="value-display">sm: {{ switchSmall() }} · md: {{ switchMedium() }} · lg: {{ switchLarge() }}</div>
            </div>
            <div class="demo-card">
              <div class="demo-card-title">Enterprise Validation States</div>
              <div class="input-stack">
                <ngx-switch [checked]="true" onLabel="Opt-in" offLabel="Opt-out" status="success" hint="Auto-sync verified" />
                <ngx-switch [checked]="false" onLabel="SSL Only" offLabel="Insecure" status="warning" hint="Using unencrypted connection fallback" />
                <ngx-switch [checked]="false" onLabel="API State" offLabel="Disabled" status="error" error="API endpoint unreachable" />
              </div>
            </div>
          </div>

          <div class="section-label">How to Use</div>
          <pre class="code-block">{{ switchCode }}</pre>

          <div class="section-label">API Reference</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input / Output</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of switchApi; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- ===== RATING ===== -->
      @if (activeTab() === 'Rating') {
        <div class="tab-content">
          <div class="section-label">Live Demo</div>
          <div class="demo-cards-grid">
            <div class="demo-card">
              <div class="demo-card-title">Interactive Rating</div>
              <ngx-rating label="Product Rating" [max]="5" [showValue]="true" (ratingChange)="ratingValue.set($event)" />
              <div class="value-display">Selected rating: {{ ratingValue() }}/5</div>
            </div>
            <div class="demo-card">
              <div class="demo-card-title">Enterprise Validation States</div>
              <div class="input-stack">
                <ngx-rating label="Excellent Service" [value]="5" status="success" hint="Minimum required is 4 stars" />
                <ngx-rating label="Security Compliance" [value]="1" status="error" error="Rating is too low!" />
              </div>
            </div>
          </div>

          <div class="section-label">How to Use</div>
          <pre class="code-block">{{ ratingCode }}</pre>

          <div class="section-label">API Reference</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input / Output</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of ratingApi; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- ===== NUMERIC TEXTBOX ===== -->
      @if (activeTab() === 'NumericTextBox') {
        <div class="tab-content">
          <div class="section-label">Live Demo</div>
          <div class="demo-cards-grid">
            <div class="demo-card">
              <div class="demo-card-title">Numeric Inputs</div>
              <div class="input-stack">
                <ngx-numeric-textbox [value]="quantity()" label="Quantity" [min]="0" [max]="100" [step]="1" (valueChange)="quantity.set($event)" />
                <ngx-numeric-textbox [value]="price()" label="Price" prefix="$" [min]="0" [max]="10000" [step]="0.5" suffix="USD" (valueChange)="price.set($event)" />
              </div>
              <div class="demo-note">Use the spinner buttons or press the up and down arrow keys while the input is focused.</div>
              <div class="value-display">Quantity: {{ quantity() }} · Price: &#36;{{ price() }}</div>
            </div>
          </div>

          <div class="section-label">How to Use</div>
          <pre class="code-block">{{ numericTextBoxCode }}</pre>

          <div class="section-label">API Reference</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input / Output</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of numericTextBoxApi; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- ===== TEXTAREA ===== -->
      @if (activeTab() === 'Textarea') {
        <div class="tab-content">
          <div class="section-label">Live Demo</div>
          <div class="demo-cards-grid">
            <div class="demo-card">
              <div class="demo-card-title">Multi-line Input</div>
              <ngx-textarea label="Description" placeholder="Write details..." [rows]="5" [maxlength]="280" hint="Supports markdown text" (valueChange)="description.set($event)" />
              <div class="value-display">Characters: {{ description().length }}</div>
            </div>
          </div>

          <div class="section-label">How to Use</div>
          <pre class="code-block">{{ textareaCode }}</pre>

          <div class="section-label">API Reference</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input / Output</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of textareaApi; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- ===== COLOR PICKER ===== -->
      @if (activeTab() === 'ColorPicker') {
        <div class="tab-content">
          <div class="section-label">Live Demo</div>
          <div class="demo-cards-grid">
            <div class="demo-card">
              <div class="demo-card-title">Theme Color</div>
              <ngx-color-picker label="Accent Color" (colorChange)="accentColor.set($event)" />
              <div class="value-display">Selected color: {{ accentColor() }}</div>
            </div>
          </div>

          <div class="section-label">How to Use</div>
          <pre class="code-block">{{ colorPickerCode }}</pre>

          <div class="section-label">API Reference</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input / Output</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of colorPickerApi; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- ===== TIME PICKER ===== -->
      @if (activeTab() === 'TimePicker') {
        <div class="tab-content">
          <div class="section-label">Live Demo</div>
          <div class="demo-cards-grid">
            <div class="demo-card">
              <div class="demo-card-title">Meeting Time</div>
              <ngx-time-picker [value]="time24()" label="24h Time" (timeChange)="time24.set($event)" />
              <div class="demo-note">Type a value like 14:30 or fine tune it with the hour and minute selectors.</div>
              <div class="value-display">Time: {{ time24() }}</div>
            </div>
            <div class="demo-card">
              <div class="demo-card-title">12h Format</div>
              <ngx-time-picker [value]="time12()" label="12h Time" [use12h]="true" (timeChange)="time12.set($event)" />
              <div class="demo-note">Manual entry also accepts values like 2:45 PM and normalizes the emitted output to HH:mm.</div>
              <div class="value-display">Time: {{ time12() }}</div>
            </div>
          </div>

          <div class="section-label">How to Use</div>
          <pre class="code-block">{{ timePickerCode }}</pre>

          <div class="section-label">API Reference</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input / Output</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of timePickerApi; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- ===== DATE RANGE PICKER ===== -->
      @if (activeTab() === 'DateRangePicker') {
        <div class="tab-content">
          <div class="section-label">Live Demo</div>
          <div class="demo-cards-grid">
            <div class="demo-card">
              <div class="demo-card-title">Date Range Selection</div>
              <ngx-date-range-picker label="Travel Dates" (rangeChange)="selectedRange.set($event)" />
              <div class="value-display">Start: {{ selectedRange().start || '—' }} · End: {{ selectedRange().end || '—' }}</div>
            </div>
          </div>

          <div class="section-label">How to Use</div>
          <pre class="code-block">{{ dateRangePickerCode }}</pre>

          <div class="section-label">API Reference</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input / Output</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of dateRangePickerApi; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- ===== FILE UPLOAD ===== -->
      @if (activeTab() === 'FileUpload') {
        <div class="tab-content">
          <div class="section-label">Live Demo</div>
          <div class="demo-cards-grid">
            <div class="demo-card">
              <div class="demo-card-title">Standard File Uploader</div>
              <div class="input-stack">
                <ngx-file-upload 
                  [multiple]="true" 
                  [accept]="'image/*, .pdf, .zip'" 
                  [maxSize]="10485760" 
                  (filesSelected)="onFilesSelected($event)"
                  (fileRemoved)="onFileRemoved($event)"
                  (uploadComplete)="onUploadComplete($event)"
                  (uploadError)="onUploadError($event)"
                />
              </div>
              <div class="value-display">
                Last event: {{ lastUploadEvent() || 'none' }}
              </div>
            </div>
            
            <div class="demo-card">
              <div class="demo-card-title">Single File Mode & Disabled State</div>
              <div class="input-stack">
                <ngx-file-upload 
                  [multiple]="false" 
                  [accept]="'.png, .jpg'" 
                  [maxSize]="2097152" 
                />
                <div style="margin-top: 16px;">
                  <ngx-file-upload 
                    [disabled]="true" 
                    [multiple]="true"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="section-label">How to Use</div>
          <pre class="code-block">{{ fileUploadCode }}</pre>

          <div class="section-label">API Reference</div>
          <div class="api-table-wrap">
            <table class="api-table">
              <thead><tr><th>Input / Output</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                @for (row of fileUploadApi; track row.name) {
                  <tr><td class="api-name">{{ row.name }}</td><td class="api-type">{{ row.type }}</td><td class="api-default">{{ row.default }}</td><td>{{ row.description }}</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- ===== FORM DESIGNER ===== -->
      @if (activeTab() === 'FormDesigner') {
        <div class="tab-content">
          <div class="section-label">Drag & Drop Form Designer with local AI Co-Pilot Form Filler</div>
          <div style="height: 600px; margin-bottom: 24px;">
            <ngx-form-designer #designer>
              <ngx-ai-form-copilot
                copilot
                [fields]="designer.designerFields()"
                [formBuilder]="designer.previewForm() || null"
              ></ngx-ai-form-copilot>
            </ngx-form-designer>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; height: 100%; overflow-y: auto; }
    .demo-page { padding: 32px 40px; max-width: 1200px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: 28px; }
    
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; padding-bottom: 24px; border-bottom: 2px solid var(--border-color); }
    .page-header-text h1 { margin: 0 0 8px; font-size: 28px; font-weight: 900; color: var(--text-primary); letter-spacing: -0.5px; font-family: var(--ngx-heading-font-family, 'Outfit', sans-serif); }
    .page-header-text p { margin: 0; font-size: 14px; color: var(--text-secondary); line-height: 1.7; max-width: 720px; }
    
    .header-badges { display: flex; gap: 10px; flex-shrink: 0; flex-wrap: wrap; }
    .badge { font-size: 11px; font-weight: 700; padding: 6px 12px; border-radius: 16px; transition: all 0.2s ease; }
    .badge-green { background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.1); }
    .badge-blue { background: rgba(59, 130, 246, 0.15); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.1); }
    .badge-purple { background: rgba(139, 92, 246, 0.15); color: #8b5cf6; border: 1px solid rgba(139, 92, 246, 0.1); }
    .badge:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); }
    
    .component-selector { display: flex; flex-direction: column; gap: 16px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; padding: 24px; box-shadow: var(--shadow-sm); }
    .selector-label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; color: var(--text-secondary); }
    .selector-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px; }
    .selector-btn { padding: 10px 14px; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600; color: var(--text-primary); transition: all 0.2s ease; font-family: inherit; display: flex; align-items: center; justify-content: center; min-height: 48px; white-space: normal; text-align: center; }
    .selector-btn:hover { border-color: var(--primary-color); background: var(--primary-glow); color: var(--primary-color); transform: translateY(-2px); box-shadow: 0 4px 12px var(--primary-glow); }
    .selector-btn.active { background: var(--primary-gradient, linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)); color: #ffffff; border-color: transparent; box-shadow: 0 8px 20px var(--primary-glow); }
    .selector-btn.active:hover { transform: translateY(-4px); box-shadow: 0 12px 28px var(--primary-glow); }
    .btn-label { display: block; font-weight: 700; letter-spacing: 0.3px; }
    
    .tab-nav { display: flex; gap: 0; border-bottom: 2px solid var(--border-color); overflow-x: auto; padding-bottom: 0; }
    .tab-btn { padding: 12px 20px; background: none; border: none; font-size: 13px; font-weight: 500; color: var(--text-secondary); cursor: pointer; border-bottom: 3px solid transparent; margin-bottom: -2px; font-family: inherit; transition: all 0.2s ease; white-space: nowrap; }
    .tab-btn:hover { color: var(--text-primary); background: rgba(79, 70, 229, 0.05); }
    .tab-btn.active { color: var(--primary-color, #4f46e5); border-bottom-color: var(--primary-color, #4f46e5); font-weight: 600; background: rgba(79, 70, 229, 0.04); }
    
    .tab-content { display: flex; flex-direction: column; gap: 20px; }
    .section-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; color: #8892a0; border-bottom: 2px solid var(--border-color); padding-bottom: 12px; }
    
    .demo-cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 20px; }
    .demo-card { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; padding: 24px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: var(--shadow-sm); position: relative; overflow: hidden; }
    .demo-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--primary-gradient, linear-gradient(90deg, #4f46e5, #7c3aed)); opacity: 0; transition: opacity 0.3s ease; }
    .demo-card:hover { border-color: var(--primary-color); box-shadow: var(--shadow-md); transform: translateY(-4px); }
    .demo-card:hover::before { opacity: 1; }
    
    .demo-card-title { font-size: 12px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
    .demo-card-title::before { content: ''; display: inline-block; width: 3px; height: 16px; background: var(--primary-gradient, linear-gradient(180deg, #4f46e5, #7c3aed)); border-radius: 2px; }
    
    .input-stack { display: flex; flex-direction: column; gap: 14px; }
    .demo-note { font-size: 12px; color: var(--text-secondary); line-height: 1.5; }
    
    .value-display { margin-top: 14px; padding: 12px 14px; background: var(--bg-primary); border-radius: 8px; font-size: 12px; font-family: 'Courier New', monospace; color: var(--text-primary); border-left: 3px solid var(--primary-color); transition: all 0.2s ease; }
    .value-display:hover { border-left-color: #ff6b6b; transform: translateX(2px); }
    
    .code-block { background: #0f172a; color: #f8fafc; padding: 20px; border-radius: 12px; font-size: 12px; font-family: 'Cascadia Code', Consolas, monospace; overflow-x: auto; white-space: pre; margin: 0; border: 1px solid rgba(255,255,255,0.05); box-shadow: var(--shadow-md); }
    
    .api-table-wrap { overflow-x: auto; border: 1px solid var(--border-color); border-radius: 12px; margin-top: 12px; background: var(--bg-secondary); }
    .api-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .api-table thead tr { background: var(--ngx-grid-header-bg, #f8fafc); border-bottom: 1.5px solid var(--border-color); }
    .api-table th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.7px; color: var(--text-secondary); white-space: nowrap; font-family: var(--ngx-heading-font-family, 'Outfit', sans-serif); }
    .api-table td { padding: 12px 16px; border-bottom: 1px solid var(--border-light); color: var(--text-primary); vertical-align: top; }
    .api-table tbody tr { transition: background 0.2s ease; }
    .api-table tbody tr:hover td { background: var(--ngx-grid-hover-bg); }
    .api-table tbody tr:last-child td { border-bottom: none; }
    
    .api-name { color: var(--primary-color) !important; font-family: monospace; font-weight: 700; white-space: nowrap; }
    .api-type { color: #a855f7 !important; font-family: monospace; white-space: nowrap; }
    .api-default { font-family: monospace; white-space: nowrap; color: #f43f5e; font-weight: 500; }
    
    @media (max-width: 768px) {
      .demo-page { padding: 20px 16px; gap: 20px; }
      .demo-cards-grid { grid-template-columns: 1fr; }
      .page-header { flex-direction: column; gap: 12px; }
      .selector-grid { grid-template-columns: repeat(auto-fill, minmax(95px, 1fr)); gap: 10px; }
      .component-selector { padding: 16px; gap: 12px; }
      .selector-btn { padding: 10px 12px; min-height: 44px; font-size: 11px; }
      .tab-nav { font-size: 12px; }
      .tab-btn { padding: 10px 14px; }
    }
  `]
})
export class InputsDemoComponent {
  activeTab = signal('TextBox');
  tabs = ['TextBox', 'Dropdown', 'DatePicker', 'MultiSelect', 'Checkbox', 'Radio', 'Autocomplete', 'Slider', 'Switch', 'Rating', 'NumericTextBox', 'Textarea', 'ColorPicker', 'TimePicker', 'DateRangePicker', 'FileUpload', 'FormDesigner'];

  textValue = signal('');
  emailValue = signal('');
  emailError = signal('');
  lastUploadEvent = signal<string>('');
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

  sliderValue = signal(0);
  priceRange = signal<[number, number]>([20, 80]);
  switchSmall = signal(false);
  switchMedium = signal(false);
  switchLarge = signal(false);
  ratingValue = signal(0);
  quantity = signal(12);
  price = signal(249.5);
  description = signal('');
  accentColor = signal('#1a73e8');
  time24 = signal('14:30');
  time12 = signal('14:30');
  selectedRange = signal<{ start: string; end: string }>({ start: '', end: '' });

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

  onFilesSelected(files: File[]): void {
    this.lastUploadEvent.set(`Selected: ${files.map(f => f.name).join(', ')}`);
  }

  onFileRemoved(file: File): void {
    this.lastUploadEvent.set(`Removed: ${file.name}`);
  }

  onUploadComplete(event: { file: File; response: any }): void {
    this.lastUploadEvent.set(`Uploaded: ${event.file.name}`);
  }

  onUploadError(event: { file: File; error: any }): void {
    this.lastUploadEvent.set(`Error uploading ${event.file.name}: ${event.error}`);
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
    { name: 'passwordToggle', type: 'boolean', default: 'false', description: 'Enables a password visibility toggle button when type is password.' },
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

  checkboxApi: ApiRow[] = [
    { name: 'label', type: 'string', default: "''", description: 'Label text rendered next to the checkbox.' },
    { name: 'checked', type: 'boolean', default: 'false', description: 'Initial checked state in template-driven usage.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables interaction.' },
    { name: 'indeterminate', type: 'boolean', default: 'false', description: 'Renders the indeterminate visual state.' },
    { name: 'status', type: "'default'|'success'|'warning'|'error'", default: "'default'", description: 'Enterprise validation status state.' },
    { name: 'error', type: 'string', default: "''", description: 'Error message. If present, sets status to error.' },
    { name: 'hint', type: 'string', default: "''", description: 'Helper text shown below the checkbox.' },
    { name: '(checkedChange)', type: 'boolean', default: '—', description: 'Emitted when the checked state toggles.' },
  ];

  radioApi: ApiRow[] = [
    { name: 'options', type: 'RadioOption[]', default: '[]', description: 'Array of radio options with label, value, and optional disabled state.' },
    { name: 'label', type: 'string', default: "''", description: 'Group label shown above the options.' },
    { name: 'value', type: 'unknown', default: 'null', description: 'Current selected value.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the full radio group.' },
    { name: 'inline', type: 'boolean', default: 'false', description: 'Displays options horizontally instead of stacked.' },
    { name: 'status', type: "'default'|'success'|'warning'|'error'", default: "'default'", description: 'Enterprise validation status state.' },
    { name: 'error', type: 'string', default: "''", description: 'Error message. If present, sets status to error.' },
    { name: 'hint', type: 'string', default: "''", description: 'Helper text shown below the group.' },
    { name: '(valueChange)', type: 'unknown', default: '—', description: 'Emitted when the selected option changes.' },
  ];

  autocompleteApi: ApiRow[] = [
    { name: 'options', type: 'DropdownOption[]', default: '[]', description: 'Available options to search and select.' },
    { name: 'label', type: 'string', default: "''", description: 'Label displayed above the input.' },
    { name: 'placeholder', type: 'string', default: "'Type to search...'", description: 'Placeholder text inside the input.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables typing and selection.' },
    { name: 'error', type: 'string', default: "''", description: 'Error text shown below the component.' },
    { name: 'minLength', type: 'number', default: '1', description: 'Minimum typed characters before the suggestion panel opens.' },
    { name: '(valueChange)', type: 'unknown', default: '—', description: 'Emitted when an option is selected or cleared.' },
  ];

  checkboxCode = `import { CheckboxComponent } from 'ngx-core-components';

@Component({
  imports: [CheckboxComponent],
  template: \`
    <!-- Standard Checkbox with Form validation -->
    <ngx-checkbox
      label="Accept terms"
      [checked]="checked()"
      status="error"
      error="You must accept the terms before proceeding"
      (checkedChange)="checked.set($event)"
    />
  \`
})
export class MyComponent {
  checked = signal(false);
}`;

  radioCode = `import { RadioGroupComponent, RadioOption } from 'ngx-core-components';

@Component({
  imports: [RadioGroupComponent],
  template: \`
    <ngx-radio-group
      label="Plan"
      [options]="plans"
      [value]="plan()"
      status="success"
      hint="Standard enterprise subscription"
      (valueChange)="plan.set($event)"
    />
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

  sliderCode = `import { SliderComponent } from 'ngx-core-components/inputs';

@Component({
  imports: [SliderComponent],
  template: \`
    <!-- Single value -->
    <ngx-slider
      label="Volume"
      [min]="0"
      [max]="100"
      [step]="1"
      [showTicks]="true"
      (valueChange)="volume.set($event)"
    />

    <!-- Range mode: two thumbs on one track -->
    <ngx-slider
      label="Price Range"
      [min]="0"
      [max]="1000"
      [step]="10"
      [range]="true"
      [showValue]="true"
      (rangeChange)="priceRange.set($event)"
    />
  \`
})
export class MyComponent {
  volume = signal(40);
  priceRange = signal<[number, number]>([150, 700]);
}`;

  switchCode = `import { SwitchComponent } from 'ngx-core-components/inputs';

@Component({
  imports: [SwitchComponent],
  template: \`
    <!-- Bound with Reactive Forms or Template Forms CVA -->
    <ngx-switch
      [formControl]="switchControl"
      onLabel="On"
      offLabel="Off"
      size="md"
      status="warning"
      hint="SSL only mode active"
    />
  \`
})
export class MyComponent {
  switchControl = new FormControl(true);
}`;

  ratingCode = `import { RatingComponent } from 'ngx-core-components/inputs';

@Component({
  imports: [RatingComponent],
  template: \`
    <!-- Star rating using CVA form control -->
    <ngx-rating
      [formControl]="ratingControl"
      label="Product Rating"
      [max]="5"
      [showValue]="true"
      status="success"
      hint="Thank you for your rating!"
    />
  \`
})
export class MyComponent {
  ratingControl = new FormControl(4);
}`;

  numericTextBoxCode = `import { NumericTextBoxComponent } from 'ngx-core-components/inputs';

@Component({
  imports: [NumericTextBoxComponent],
  template: \`
    <ngx-numeric-textbox
      [value]="quantity()"
      label="Quantity"
      [min]="0"
      [max]="100"
      [step]="1"
      (valueChange)="quantity.set($event)"
    />
  \`
})
export class MyComponent {
  quantity = signal(1);
}`;

  textareaCode = `import { TextareaComponent } from 'ngx-core-components/inputs';

@Component({
  imports: [TextareaComponent],
  template: \`
    <ngx-textarea
      label="Description"
      [rows]="5"
      [maxlength]="280"
      hint="Supports markdown text"
      (valueChange)="description.set($event)"
    />
  \`
})
export class MyComponent {
  description = signal('');
}`;

  colorPickerCode = `import { ColorPickerComponent } from 'ngx-core-components/inputs';

@Component({
  imports: [ColorPickerComponent],
  template: \`
    <ngx-color-picker
      label="Accent Color"
      [value]="color()"
      (colorChange)="color.set($event)"
    />
  \`
})
export class MyComponent {
  color = signal('#1a73e8');
}`;

  timePickerCode = `import { TimePickerComponent } from 'ngx-core-components/inputs';

@Component({
  imports: [TimePickerComponent],
  template: \`
    <ngx-time-picker
      [value]="time()"
      label="Meeting Time"
      [use12h]="true"
      (timeChange)="time.set($event)"
    />
  \`
})
export class MyComponent {
  time = signal('');
}`;

  dateRangePickerCode = `import { DateRangePickerComponent } from 'ngx-core-components/inputs';

@Component({
  imports: [DateRangePickerComponent],
  template: \`
    <ngx-date-range-picker
      label="Travel Dates"
      (rangeChange)="range.set($event)"
    />
  \`
})
export class MyComponent {
  range = signal<{ start: string; end: string }>({ start: '', end: '' });
}`;

  sliderApi: ApiRow[] = [
    { name: 'label', type: 'string', default: "''", description: 'Label text displayed above the slider.' },
    { name: 'min', type: 'number', default: '0', description: 'Minimum selectable value.' },
    { name: 'max', type: 'number', default: '100', description: 'Maximum selectable value.' },
    { name: 'step', type: 'number', default: '1', description: 'Step interval for the thumb movement.' },
    { name: 'range', type: 'boolean', default: 'false', description: 'When true, renders dual thumbs on a single track for range selection.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables user interaction.' },
    { name: 'showValue', type: 'boolean', default: 'true', description: 'Shows current value or low-high range in the label row.' },
    { name: 'showTicks', type: 'boolean', default: 'false', description: 'Displays min/max tick labels below the track.' },
    { name: '(valueChange)', type: 'number', default: '—', description: 'Emitted when single-value mode changes.' },
    { name: '(rangeChange)', type: '[number, number]', default: '—', description: 'Emitted when range mode changes as [low, high].' },
  ];

  switchApi: ApiRow[] = [
    { name: 'onLabel', type: 'string', default: "'On'", description: 'Text shown for the enabled state.' },
    { name: 'offLabel', type: 'string', default: "'Off'", description: 'Text shown for the disabled state.' },
    { name: 'size', type: "'sm'|'md'|'lg'", default: "'md'", description: 'Visual size of the switch.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables clicking the switch.' },
    { name: 'status', type: "'default'|'success'|'warning'|'error'", default: "'default'", description: 'Enterprise validation status state.' },
    { name: 'error', type: 'string', default: "''", description: 'Error message. If present, sets status to error.' },
    { name: 'hint', type: 'string', default: "''", description: 'Helper text shown below the switch.' },
    { name: '(checkedChange)', type: 'boolean', default: '—', description: 'Emitted when the switch toggles.' },
  ];

  ratingApi: ApiRow[] = [
    { name: 'max', type: 'number', default: '5', description: 'Number of rating stars to render.' },
    { name: 'label', type: 'string', default: "''", description: 'Label shown before the stars.' },
    { name: 'readonly', type: 'boolean', default: 'false', description: 'Prevents the user from changing the rating.' },
    { name: 'showValue', type: 'boolean', default: 'false', description: 'Shows the numeric rating value next to the stars.' },
    { name: 'status', type: "'default'|'success'|'warning'|'error'", default: "'default'", description: 'Enterprise validation status state.' },
    { name: 'error', type: 'string', default: "''", description: 'Error message. If present, sets status to error.' },
    { name: 'hint', type: 'string', default: "''", description: 'Helper text shown below the stars.' },
    { name: '(ratingChange)', type: 'number', default: '—', description: 'Emitted when the selected rating changes.' },
  ];

  numericTextBoxApi: ApiRow[] = [
    { name: 'label', type: 'string', default: "''", description: 'Label text shown above the numeric input.' },
    { name: 'value', type: 'number', default: '0', description: 'Controlled numeric value displayed in the input.' },
    { name: 'min', type: 'number', default: '-Infinity', description: 'Minimum allowed value.' },
    { name: 'max', type: 'number', default: 'Infinity', description: 'Maximum allowed value.' },
    { name: 'step', type: 'number', default: '1', description: 'Increment or decrement amount.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables text entry and spinner buttons.' },
    { name: 'placeholder', type: 'string', default: "''", description: 'Placeholder text when empty.' },
    { name: 'prefix', type: 'string', default: "''", description: 'Text shown before the numeric input.' },
    { name: 'suffix', type: 'string', default: "''", description: 'Text shown after the numeric input.' },
    { name: '(valueChange)', type: 'number', default: '—', description: 'Emitted when the value changes through typing or spin buttons.' },
  ];

  textareaApi: ApiRow[] = [
    { name: 'label', type: 'string', default: "''", description: 'Label displayed above the textarea.' },
    { name: 'placeholder', type: 'string', default: "''", description: 'Placeholder text when empty.' },
    { name: 'rows', type: 'number', default: '4', description: 'Initial visible textarea rows.' },
    { name: 'maxlength', type: 'number', default: '0', description: 'Maximum characters allowed. 0 disables the limit.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables typing.' },
    { name: 'autoResize', type: 'boolean', default: 'false', description: 'Marks the textarea for auto-resize styling behavior.' },
    { name: 'hint', type: 'string', default: "''", description: 'Helper text shown below the textarea.' },
    { name: 'error', type: 'string', default: "''", description: 'Error text shown instead of the hint.' },
    { name: '(valueChange)', type: 'string', default: '—', description: 'Emitted whenever the text changes.' },
  ];

  colorPickerApi: ApiRow[] = [
    { name: 'label', type: 'string', default: "''", description: 'Label shown above the color picker trigger.' },
    { name: '(colorChange)', type: 'string', default: '—', description: 'Emitted with the selected hex color value.' },
  ];

  timePickerApi: ApiRow[] = [
    { name: 'label', type: 'string', default: "''", description: 'Label shown above the time picker.' },
    { name: 'value', type: 'string', default: "'09:00'", description: 'Controlled time value. Accepts HH:mm or h:mm AM/PM input.' },
    { name: 'use12h', type: 'boolean', default: 'false', description: 'Uses 12-hour display with AM/PM selector.' },
    { name: '(timeChange)', type: 'string', default: '—', description: 'Emitted with the selected time as HH:mm, even in 12-hour mode.' },
  ];

  dateRangePickerApi: ApiRow[] = [
    { name: 'label', type: 'string', default: "''", description: 'Label shown above the range picker.' },
    { name: '(rangeChange)', type: '{ start: string; end: string }', default: '—', description: 'Emitted when a full date range is selected.' },
  ];

  inputCssVars: { name: string; default: string; description: string }[] = [
    { name: '--ngx-input-border', default: '#ced4da', description: 'Default border color.' },
    { name: '--ngx-input-focus', default: '#1a73e8', description: 'Border and ring color when focused.' },
    { name: '--ngx-input-error', default: '#e74c3c', description: 'Border and text color in error state.' },
    { name: '--ngx-input-bg', default: '#ffffff', description: 'Input background color.' },
    { name: '--ngx-input-disabled-bg', default: '#f8f9fa', description: 'Background when disabled.' },
    { name: '--ngx-input-label', default: '#495057', description: 'Label text color.' },
    { name: '--ngx-input-hint', default: '#6c757d', description: 'Hint and placeholder text color.' },
  ];

  fileUploadCode = `import { FileUploadComponent } from 'ngx-core-components/inputs';

@Component({
  imports: [FileUploadComponent],
  template: \\\`
    <!-- Standard uploader supporting images & PDFs up to 10MB -->
    <ngx-file-upload
      [multiple]="true"
      accept="image/*, .pdf"
      [maxSize]="10485760"
      (filesSelected)="onFilesSelected($event)"
      (fileRemoved)="onFileRemoved($event)"
      (uploadComplete)="onUploadComplete($event)"
      (uploadError)="onUploadError($event)"
    />
  \\\`
})
export class MyComponent {
  onFilesSelected(files: File[]) {
    console.log('Files added to queue:', files);
  }

  onFileRemoved(file: File) {
    console.log('File removed from queue:', file);
  }

  onUploadComplete(event: { file: File; response: any }) {
    console.log('Upload complete for:', event.file.name);
  }

  onUploadError(event: { file: File; error: any }) {
    console.error('Upload failed for:', event.file.name, event.error);
  }
}`;

  fileUploadApi: ApiRow[] = [
    { name: 'multiple', type: 'boolean', default: 'false', description: 'Allows selecting/dropping multiple files.' },
    { name: 'accept', type: 'string', default: "''", description: 'Comma-separated list of allowed file extensions or MIME types (e.g. "image/*, .pdf").' },
    { name: 'maxSize', type: 'number', default: '0', description: 'Maximum file size in bytes. 0 means unlimited size.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables drag-and-drop and clicks.' },
    { name: 'theme', type: "'light' | 'dark'", default: "'light'", description: 'Color scheme variant.' },
    { name: 'uploadUrl', type: 'string', default: "''", description: 'Endpoint destination for files (currently simulates upload progress).' },
    { name: '(filesSelected)', type: 'File[]', default: '—', description: 'Emitted when new valid files are selected/dropped.' },
    { name: '(fileRemoved)', type: 'File', default: '—', description: 'Emitted when a file is removed from the queue.' },
    { name: '(uploadProgress)', type: '{ file: File, progress: number }', default: '—', description: 'Emitted during upload progress tick.' },
    { name: '(uploadComplete)', type: '{ file: File, response: any }', default: '—', description: 'Emitted on successful upload completion.' },
    { name: '(uploadError)', type: '{ file: File, error: any }', default: '—', description: 'Emitted when the file upload fails.' },
  ];
}
