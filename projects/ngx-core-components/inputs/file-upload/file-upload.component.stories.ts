import { FileUploadComponent } from './file-upload.component';

const meta = {
  title: 'Inputs & Actions/Form Inputs/FileUpload',
  component: FileUploadComponent,
  tags: ['autodocs'],
  argTypes: {
    theme: {
      control: 'select',
      options: ["light","dark"],
    },
  },
};

export default meta;

export const Default = {
  args: {
    multiple: false,
    accept: '',
    maxSize: 0,
    disabled: false,
    theme: 'light',
    uploadUrl: '',
    fileInputEl: '.hidden-file-input',
  },
};
