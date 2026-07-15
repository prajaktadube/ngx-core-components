import type { Meta, StoryObj } from '@storybook/angular';
import { DateRangePickerComponent, type DateRangePreset } from './date-range-picker.component';

const customPresets: DateRangePreset[] = [
  {
    label: 'Yesterday',
    start: (() => { const d = new Date(); d.setDate(d.getDate() - 1); return d; })(),
    end: (() => { const d = new Date(); d.setDate(d.getDate() - 1); return d; })(),
  },
  {
    label: 'Last 14 Days',
    start: (() => { const d = new Date(); d.setDate(d.getDate() - 13); return d; })(),
    end: new Date(),
  },
  {
    label: 'Last 30 Days',
    start: (() => { const d = new Date(); d.setDate(d.getDate() - 29); return d; })(),
    end: new Date(),
  },
  {
    label: 'Year to Date',
    start: new Date(new Date().getFullYear(), 0, 1),
    end: new Date(),
  }
];

const meta: Meta<DateRangePickerComponent> = {
  title: 'Inputs & Actions/Form Inputs/DateRangePicker',
  component: DateRangePickerComponent,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text', description: 'Label displayed above the date inputs' },
    start: { control: 'text', description: 'Initial start date in YYYY-MM-DD format or Date' },
    end: { control: 'text', description: 'Initial end date in YYYY-MM-DD format or Date' },
    min: { control: 'text', description: 'Earliest selectable date in YYYY-MM-DD format' },
    max: { control: 'text', description: 'Latest selectable date in YYYY-MM-DD format' },
    disabledDates: { control: 'object', description: 'Array of date strings that cannot be selected' },
    presets: { control: 'object', description: 'Custom predefined ranges' },
    weekStartsOn: { control: 'select', options: [0, 1, 2, 3, 4, 5, 6], description: 'Day of week starting column (0 = Sunday)' },
    disabled: { control: 'boolean', description: 'Disables the input click and edit actions' },
  },
};

export default meta;
type Story = StoryObj<DateRangePickerComponent>;

export const Default: Story = {
  args: {
    label: 'Select Date Range',
    disabled: false,
    weekStartsOn: 0,
  },
};

export const PreselectedRange: Story = {
  args: {
    ...Default.args,
    label: 'Preselected Date Range',
    start: '2026-07-01',
    end: '2026-07-10',
  },
};

export const MinMaxBounds: Story = {
  args: {
    ...Default.args,
    label: 'Limited Range Select (Current Month Focus)',
    min: '2026-07-05',
    max: '2026-07-25',
    start: '2026-07-10',
    end: '2026-07-15',
  },
};

export const CustomPresets: Story = {
  args: {
    ...Default.args,
    label: 'Analytics Preset Ranges',
    presets: customPresets,
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    label: 'Readonly Range Picker',
    start: '2026-07-01',
    end: '2026-07-07',
    disabled: true,
  },
};
