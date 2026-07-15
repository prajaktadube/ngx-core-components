import { ImageCompareComponent } from './image-compare.component';

const meta = {
  title: 'Data Presentation/Image Comparison/ImageCompare',
  component: ImageCompareComponent,
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ["horizontal","vertical"],
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
    beforeImage: null,
    afterImage: null,
    beforeLabel: 'Before',
    afterLabel: 'After',
    startOffset: 50,
    orientation: 'horizontal',
    theme: 'light',
    id: 'ngx-img-compare-' + Math.random().toString(36).substring(2, 9),
  },
};
