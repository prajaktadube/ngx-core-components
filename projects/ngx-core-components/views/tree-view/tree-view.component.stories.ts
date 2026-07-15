import { TreeViewComponent } from './tree-view.component';

const meta = {
  title: 'Data Presentation/Tree & List Views/TreeView',
  component: TreeViewComponent,
  tags: ['autodocs'],
  argTypes: {
    selectedId: {
      control: 'select',
      options: ["string","null"],
    },
  },
};

export default meta;

export const Default = {
  args: {
    nodes: null,
    selectable: true,
    checkable: false,
    selectedId: null,
    expandedIds: null,
  },
};
