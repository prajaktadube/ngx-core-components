import type { Meta, StoryObj } from '@storybook/angular';
import { BarcodeComponent } from './barcode.component';

const meta: Meta<BarcodeComponent> = {
  title: 'Data Presentation/Barcodes & QR/Barcode',
  component: BarcodeComponent,
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'text', description: 'Barcode alphanumeric value' },
    label: { control: 'text', description: 'Optional display text below barcode (falls back to value)' },
    height: { control: { type: 'range', min: 30, max: 200, step: 10 }, description: 'Barcode height in pixels' },
    barWidth: { control: { type: 'range', min: 1, max: 5, step: 1 }, description: 'Width of each individual line segment' },
    foreground: { control: 'color', description: 'Hex or CSS color for barcode lines' },
    background: { control: 'color', description: 'Hex or CSS color for background canvas' },
  },
};

export default meta;
type Story = StoryObj<BarcodeComponent>;

export const Default: Story = {
  args: {
    value: 'CODE128B-OK',
    label: 'PROD-SKU-99281',
    height: 70,
    barWidth: 2,
    foreground: '#000000',
    background: '#ffffff',
  },
};

export const CustomColorTheme: Story = {
  args: {
    ...Default.args,
    value: 'COLOR-THEMED-BAR',
    label: 'INVENTORY #482',
    foreground: '#4f46e5', // premium Indigo color
    background: '#f8fafc',
  },
};

export const Compact: Story = {
  args: {
    ...Default.args,
    value: 'COMPACT-990',
    label: 'BATCH-A9',
    height: 40,
    barWidth: 1.5,
  },
};

export const LargeShippingLabel: Story = {
  args: {
    ...Default.args,
    value: 'SHIP-USA-90210-A83',
    label: 'POSTAL BULK RATE TRACKING',
    height: 120,
    barWidth: 3,
  },
};
