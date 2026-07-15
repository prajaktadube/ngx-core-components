import type { Meta, StoryObj } from '@storybook/angular';
import { QrCodeComponent } from './qr-code.component';

const meta: Meta<QrCodeComponent> = {
  title: 'Data Presentation/Barcodes & QR/QrCode',
  component: QrCodeComponent,
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'text', description: 'Encoded QR content (URI, raw text, etc.)' },
    size: { control: { type: 'range', min: 80, max: 400, step: 20 }, description: 'Size of the QR code canvas square' },
    label: { control: 'text', description: 'Label text displayed below the code' },
    foreground: { control: 'color', description: 'Hex or CSS color for QR code modules' },
    background: { control: 'color', description: 'Hex or CSS color for background canvas' },
  },
};

export default meta;
type Story = StoryObj<QrCodeComponent>;

export const Default: Story = {
  args: {
    value: 'https://github.com/prajaktadube/ngx-core-components',
    size: 160,
    label: 'Scan to visit library repository',
    foreground: '#0f172a',
    background: '#ffffff',
  },
};

export const CustomColors: Story = {
  args: {
    ...Default.args,
    value: 'https://storybook.js.org',
    label: 'Custom Styled QR Code',
    foreground: '#059669', // Emerald Green
    background: '#ecfdf5', // Light Emerald Tint
    size: 200,
  },
};

export const LargeSize: Story = {
  args: {
    ...Default.args,
    value: 'wifi:S:OfficeNetwork;T:WPA;P:SecretPassword123;;',
    label: 'Guest Office Wi-Fi Access Point',
    size: 280,
    foreground: '#1e3a8a', // Dark blue
  },
};

export const Compact: Story = {
  args: {
    ...Default.args,
    value: 'tel:+15550199',
    label: 'Call Customer Support',
    size: 100,
    foreground: '#dc2626',
  },
};
