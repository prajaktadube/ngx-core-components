import { JsonViewerComponent } from './json-viewer.component';

const meta = {
  title: 'Components/JsonViewer',
  component: JsonViewerComponent,
  tags: ['autodocs'],
  argTypes: {
    data: {
      control: 'select',
      options: ["JsonValue","unknown"],
    },
  },
};

export default meta;

export const Default = {
  args: {
    data: [{ id: '1', label: 'Item 1' }, { id: '2', label: 'Item 2' }],
    rootName: 'root',
    expandedDepth: 1,
  },
};
