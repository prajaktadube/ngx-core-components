/*
 * Public API Surface — secondary entry point: ngx-core-components/inputs
 */

// Text input
export { TextBoxComponent } from './textbox/textbox.component';

// Checkbox — with ControlValueAccessor
export { CheckboxComponent } from './checkbox/checkbox.component';

// Radio Group — with ControlValueAccessor
export { RadioGroupComponent } from './radio/radio-group.component';
export type { RadioOption } from './radio/radio-group.component';

// Dropdown / Select
export { DropdownComponent } from './dropdown/dropdown.component';
export type { DropdownOption } from './dropdown/dropdown.component';

// Multi-select with chips/tags
export { MultiSelectComponent } from './multi-select/multi-select.component';

// Autocomplete — with ControlValueAccessor
export { AutocompleteComponent } from './autocomplete/autocomplete.component';

// Date Picker
export { DatePickerComponent } from './date-picker/date-picker.component';
