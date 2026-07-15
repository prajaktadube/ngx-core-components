import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ChipComponent, ChipListComponent } from './chip.component';

const meta: Meta<ChipComponent> = {
  title: 'Inputs & Actions/Buttons & Chips/Chip',
  component: ChipComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [ChipComponent, ChipListComponent],
    }),
  ],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'info', 'success', 'warning', 'error', 'danger', 'outlined'],
      description: 'Color accent variant'
    },
    icon: { control: 'text', description: 'Emoji icon prefixed inside the chip' },
    selected: { control: 'boolean', description: 'Selected status highlighting' },
    removable: { control: 'boolean', description: 'Shows close action button' },
    disabled: { control: 'boolean', description: 'Disables pointer and keyboard interactions' },
    selectable: { control: 'boolean', description: 'Allows toggle click selection' },
    label: { control: 'text', description: 'Text content of the chip' },
  },
};

export default meta;
type Story = StoryObj<ChipComponent>;

export const Default: Story = {
  args: {
    label: 'Angular',
    variant: 'default',
    icon: '🅰️',
    selected: false,
    removable: false,
    disabled: false,
    selectable: false,
  },
};

export const StatusTags: Story = {
  render: () => ({
    template: `
      <ngx-chip-list>
        <ngx-chip variant="success" icon="🟢">Online</ngx-chip>
        <ngx-chip variant="info" icon="🔵">Pending</ngx-chip>
        <ngx-chip variant="warning" icon="🟡">Away</ngx-chip>
        <ngx-chip variant="danger" icon="🔴">Offline</ngx-chip>
      </ngx-chip-list>
    `
  })
};

export const SelectableFilter: Story = {
  args: {
    ...Default.args,
    label: 'Frontend',
    selectable: true,
    selected: true,
    variant: 'outlined',
  },
};

export const RemovableDismissible: Story = {
  args: {
    ...Default.args,
    label: 'TypeScript',
    removable: true,
    variant: 'info',
  },
};

export const ChipListContainer: Story = {
  render: () => ({
    template: `
      <ngx-chip-list [wrap]="true">
        <ngx-chip variant="outlined" [selectable]="true" [selected]="true">TailwindCSS</ngx-chip>
        <ngx-chip variant="outlined" [selectable]="true">Nx Monorepo</ngx-chip>
        <ngx-chip variant="outlined" [selectable]="true">Storybook 8</ngx-chip>
        <ngx-chip variant="outlined" [selectable]="true">Jasmine & Karma</ngx-chip>
        <ngx-chip variant="default" [removable]="true">Reset Filters</ngx-chip>
      </ngx-chip-list>
    `
  })
};
