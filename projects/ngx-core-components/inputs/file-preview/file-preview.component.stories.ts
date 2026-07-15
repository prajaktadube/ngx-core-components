import { FilePreviewComponent } from './file-preview.component';

const meta = {
  title: 'Advanced Inputs/File Preview Board/FilePreview',
  component: FilePreviewComponent,
  tags: ['autodocs'],
  argTypes: {
    layout: {
      control: 'select',
      options: ["grid","list"],
    },
    theme: {
      control: 'select',
      options: ["light","dark"],
    },
  },
};

export default meta;

export const Default = {
  args: {
    files: null,
    layout: 'grid',
    allowDelete: true,
    allowDownload: true,
    theme: 'light',
  },
};
